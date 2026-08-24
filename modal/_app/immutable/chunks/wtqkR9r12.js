(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bd7fa222-d331-4c46-943a-ce7aa6835919`,e._sentryDebugIdIdentifier=`sentry-dbid-bd7fa222-d331-4c46-943a-ce7aa6835919`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Low latency Qwen 3.6 with SGLang and Modal`,id:`low-latency-qwen-36-with-sglang-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Loading and cacheing the model weights`,id:`loading-and-cacheing-the-model-weights`},{depth:3,value:`Cacheing compilation artifacts`,id:`cacheing-compilation-artifacts`}]},{depth:2,value:`Configure SGLang for minimal latency`,id:`configure-sglang-for-minimal-latency`,children:[{depth:3,value:`Increasing effective memory bandwidth with tensor parallelism`,id:`increasing-effective-memory-bandwidth-with-tensor-parallelism`},{depth:3,value:`Parallelizing token generation with speculative decoding`,id:`parallelizing-token-generation-with-speculative-decoding`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Selecting infrastructure to minimize latency`,id:`selecting-infrastructure-to-minimize-latency`},{depth:3,value:`Controlling container lifecycles with modal.Server`,id:`controlling-container-lifecycles-with-modalserver`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Low latency Qwen 3.6 with SGLang and Modal

In this example, we show how to serve [SGLang](https://github.com/sgl-project/sglang) at low latency on Modal.

This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both SGLang and Modal.
For a simpler introduction to LLM serving, see
[this example](https://modal.com/docs/examples/llm_inference).

To minimize routing overheads, we use \`@app.server\`,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/images).

We start from a container image provided
[by the SGLang team via Dockerhub](https://hub.docker.com/r/lmsysorg/sglang/tags).
After a bit of cleanup, we install an updated version that has some low-latency tricks
the Modal team is contributing to SGLang (described below).

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import json
import os
import subprocess
import time

import aiohttp
import modal

MINUTES = 60  # seconds
GIT_SHA = "5244693e308eaf05da17f28cca6bcc922270fd3c"

sglang_image = (
    modal.Image.from_registry("lmsysorg/sglang:v0.5.12.post1-cu130")
    .entrypoint(
        []  # silence chatty logs on container start
    )
    .run_commands(
        "rm -rf /root/.cache/huggingface"  # clean up image
    )
    .uv_pip_install(
        f"git+https://github.com/sgl-project/sglang.git@{GIT_SHA}#subdirectory=python"
    )
)

\`\`\`

We also choose a [GPU](https://modal.com/docs/guide/gpu) to deploy our inference server onto.
We choose the [H100 GPU](https://modal.com/blog/introducing-h100),
which offers excellent price-performance
and supports [8bit floating point operations](https://modal.com/llm-almanac/quant-formats), which are the
lowest precision well-supported in the relevant [GPU kernels](https://modal.com/gpu-glossary/device-software/kernel)
across a variety of model architectures.

Below, we discuss the choice of GPU count.

\`\`\`python
GPU_TYPE, N_GPUS = "H100!", 2
GPU = f"{GPU_TYPE}:{N_GPUS}"

\`\`\`

### Loading and cacheing the model weights

We'll serve [Alibaba's Qwen 3.6 LLM](https://qwen.ai/blog?id=qwen3.6).
For lower latency, we pick the 35B mixture-of-experts model with 3B active parameters
in a lower precision floating point format (FP8).
Expert sparsity and lower precision reduce the amount of data that needs to be loaded
[from GPU RAM into SM SRAM](https://modal.com/gpu-glossary/perf/memory-bandwidth)
in each forward pass.

\`\`\`python
MODEL_NAME = "Qwen/Qwen3.6-35B-A3B-FP8"
MODEL_REVISION = (  # pin revision id to avoid nasty surprises!
    "95a723d08a9490559dae23d0cff1d9466213d989"  # latest commit as of 2026-04-23, from release
)

\`\`\`

We load the model [from the Hugging Face Hub](https://huggingface.co/collections/Qwen/qwen36).

But we don't want to load the model from the Hub every time we start the server.
We can load it much faster from a [Modal Volume](https://modal.com/docs/guide/volumes).
Typical speeds are around one to two GB/s.

\`\`\`python
HF_CACHE_VOL = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
HF_CACHE_PATH = "/root/.cache/huggingface"
MODEL_PATH = f"{HF_CACHE_PATH}/{MODEL_NAME}"

\`\`\`

In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also
[turn on "high performance" downloads](https://huggingface.co/docs/hub/en/models-downloading#faster-downloads),
which can fully saturate our network bandwidth.

\`\`\`python
sglang_image = sglang_image.env(
    {"HF_HUB_CACHE": HF_CACHE_PATH, "HF_XET_HIGH_PERFORMANCE": "1"}
)

\`\`\`

### Cacheing compilation artifacts

Model weights aren't the only thing we want to cache.

As a rule, LLM inference servers like SGLang don't directly provide their own kernels.
They draw high-performance kernels from a variety of sources.

As of version \`0.5.12\`, SGLang's default kernel backend
for FP8 matrix multiplications (\`fp8-gemm-backend\`)
on Hopper [SM architecture](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
GPUs like the H100 is
[DeepGEMM](https://github.com/deepseek-ai/DeepGEMM)
by DeepSeek.

The binaries of these kernels are not included in the SGLang Docker image and so
must be [JIT-compiled](https://modal.com/gpu-glossary/host-software/nvrtc).
We store these in a Modal Volume as well.

\`\`\`python
DG_CACHE_VOL = modal.Volume.from_name("deepgemm-cache", create_if_missing=True)
DG_CACHE_PATH = "/root/.cache/deep_gemm"

\`\`\`

JIT DeepGEMM kernels are on by default, but we explicitly enable them via an environment variable.

\`\`\`python
sglang_image = sglang_image.env({"SGLANG_ENABLE_JIT_DEEPGEMM": "1"})

\`\`\`

We trigger the compilation by running \`sglang.compile_deep_gemm\` in a \`subprocess\`
kicked off from a Python function.

\`\`\`python
def compile_deep_gemm():
    import os

    if int(os.environ.get("SGLANG_ENABLE_JIT_DEEPGEMM", "1")):
        subprocess.run(
            f"python3 -m sglang.compile_deep_gemm --model-path {MODEL_NAME} --revision {MODEL_REVISION} --tp {N_GPUS}",
            shell=True,
        )


\`\`\`

We run this Python function on Modal as part of building the Image
so that it has access to the appropriate GPU and the caches for our model and compilaton artifacts.

\`\`\`python
sglang_image = sglang_image.run_function(
    compile_deep_gemm,
    volumes={DG_CACHE_PATH: DG_CACHE_VOL, HF_CACHE_PATH: HF_CACHE_VOL},
    gpu=GPU,
)

\`\`\`

## Configure SGLang for minimal latency

LLM inference engines like SGLang come with a wide variety of "knobs" to tune performance.

To determine the appropriate configuration to hit latency and throughput service objectives,
we recommend [application-specific benchmarking](https://modal.com/llm-almanac/how-to-benchmark)
guided by [published generic benchmarks](https://modal.com/llm-almanac/advisor).

Here, we assume that the primary goal is to minimize per-request latency, with less regard to throughput
(and so to cost) and walk through some of the key choices.

The primary contributor to per-request latency is the time to move all of the model's weights (multiple gigabytes)
from [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
into [SRAM in the Streaming Multiprocessors](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor),
which must be done at least once in the course of processing a request --
naively, once per token per request.
The time taken is limited by the
[memory bandwidth](https://modal.com/gpu-glossary/perf/memory-bandwidth)
between those two stores, which is on the order of terabytes per second on modern data center GPUs.
With models at the scale of gigabytes, a token will take milliseconds to generate --
or whole seconds for the kilotoken responses users are accustomed to.

We use two strategies to cut latency in our [memory-bound](https://modal.com/gpu-glossary/perf/memory-bound) workload:

- operate across multiple GPUs for more aggregate bandwidth and faster loads, with tensor parallelism

- generate more tokens per load, with speculative decoding

### Increasing effective memory bandwidth with tensor parallelism

Running SGLang on two H100s will double our effective
[memory bandwidth](https://modal.com/gpu-glossary/perf/memory-bandwidth)
during large matrix multiplications.

Matrices are also known as tensors, and so this strategy that takes advantage
of the inherent parallelism within matrix multiplication is known as _tensor parallelism_.

Actual speedups are generally less than what you get from "napkin math" based on available bandwidths --
we observed a speedup of about 30% moving from one to two H100s when developing this example, rather than 100%.

### Parallelizing token generation with speculative decoding

Transformer and recurrent language models generate text sequentially:
the model's output at step \`i\` is part of the input at step \`i+1\`.
Per Amdahl's Law, that sequential work becomes the bottleneck
as other steps get faster from increased parallelism.

The solution is to generate more tokens on each step.
The primary technique to do so without changing model behavior is known as
[_speculative decoding_](https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/),
which "speculates" a number of draft tokens and verifies them in parallel with the primary model.

Speculative decoding techniques themselves have a number of parameters, the most important
of which is the technique to use to generate draft tokens.
Simple techniques based on n-grams are a good place to start.
Many models are released with built-in speculation based on
[multi-token prediction](https://docs.vllm.ai/projects/ascend/en/main/user_guide/feature_guide/Multi_Token_Prediction.html),
also known in SGLang as [EAGLE](https://arxiv.org/abs/2401.15077).

But our favorite technique is [DFLASH](https://arxiv.org/abs/2602.06036)
which runs draft token generation in parallel, increasing the draft model's
arithmetic intensity.

\`\`\`python
speculative_config = {
    "speculative-algorithm": "DFLASH",
    "speculative-draft-model-path": "z-lab/Qwen3.6-35B-A3B-DFlash",
    "speculative-draft-model-revision": "42d3b34d588423cdae7ba8f53a8cf7789346a719",
    "mamba-scheduler-strategy": "extra_buffer",  # required for spec dec with Qwen 3.X hybrid arch
}

\`\`\`

We adapt the default configuration for this speculator from [the model card](https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash).
In particular, we use a smaller draft token count of \`8\`, the minimum,
rather than \`16\`, the default. We're using the FP8 quantized model here
and the test prompts are creative writing tasks, so accept lengths
are generally below \`8\` and additional blocks don't have enough
accepted tokens to be worth the extra computation.

\`\`\`python
speculative_config |= {
    "speculative-num-draft-tokens": 8,
}

speculative_env = {
    "SGLANG_ENABLE_OVERLAP_PLAN_STREAM": "1",  # never block the GPU!
}

\`\`\`

Note that unlike tensor parallelism,
speculative decoding is not good for
[compute-bound](https://modal.com/gpu-glossary/perf/compute-bound)
workloads, since it generally increases demand for
[arithmetic bandwidth](https://modal.com/gpu-glossary/perf/arithmetic-bandwidth).
So for workloads that admit larger batch sizes for requests,
on the scale of dozens to hundreds, speculative decoding is not recommended.

## Define the inference server and infrastructure

### Selecting infrastructure to minimize latency

Minimizing latency requires geographic co-location of clients and servers.

So for low latency LLM inference services on Modal, you must select a
[cloud region](https://modal.com/docs/guide/region-selection)
for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a Modal Server.

Here, we assume users are mostly in the northern half of the Americas
and select the \`us\` cloud region serve them.
This should result in at most a few dozen milliseconds of round-trip time.

\`\`\`python
REGION = "us"

\`\`\`

Latencies for mutli-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram),
so they aren't shared across replicas.
To improve cache hit rate, Modal Servers
include sticky routing based on a client-provided header.
See the client code below for details.

For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a "warm" or "live" replica reduces latency by skipping slow initialization work
that occurs when new replica boots up (a ["cold start"](https://modal.com/docs/guide/cold-start)).
For LLM inference servers, that latency runs from seconds to minutes.

To ensure at least one container is always available,
we can set the \`min_containers\` of our Modal Function
to \`1\` or more.

However, since this is documentation code, we'll set it to \`0\`
to avoid surprise bills during casual use.

\`\`\`python
MIN_CONTAINERS = 0  # set to 1 to ensure one replica is always ready

\`\`\`

Finally, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users' requests will queue
when the server becomes overloaded. Even apart from queueing, responses
generally become slower per user above a certain minimum number of
concurrent requests.

So we set a target for the number of inputs to run on a single container
with [\`target_concurrency\`](https://modal.com/docs/reference/modal.concurrent) parameter.

\`\`\`python
TARGET_INPUTS = 10

\`\`\`

Generally, this choice needs to be made as part of
[LLM inference engine benchmarking](https://modal.com/llm-almanac/how-to-benchmark).

### Controlling container lifecycles with \`modal.Server\`

We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.

The key decorators are:

- [\`@app.server\`](https://modal.com/docs/guide/lifecycle-functions) to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
This decorator also turns our python code into an HTTP server (i.e. fronting all of our containers with a proxy with a URL).
The wrapped code needs to eventually listen for HTTP connections on the provided \`port\`.
See [the reference documentation](https://modal.com/docs/reference/modal.App#server) for details.

- [\`@modal.enter\` and \`@modal.exit\`](https://modal.com/docs/guide/lifecycle-functions) to indicate
which methods of the class should be run when starting the server and shutting it down.

Modal considers a new replica ready to receive inputs once the \`modal.enter\` methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up and to
send it a few test inputs.

We use the [\`requests\` library](https://requests.readthedocs.io/en/latest/)
to send ourselves these HTTP requests on
[\`localhost\`/\`127.0.0.1\`](https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1).

\`\`\`python
with sglang_image.imports():
    import requests


def wait_ready(process: subprocess.Popen, timeout: int = 20 * MINUTES):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            check_running(process)
            requests.get(f"http://127.0.0.1:{PORT}/health").raise_for_status()
            return
        except (
            subprocess.CalledProcessError,
            requests.exceptions.ConnectionError,
            requests.exceptions.HTTPError,
        ):
            time.sleep(5)
    raise TimeoutError(f"SGLang server not ready within {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


def warmup():
    payload = {
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{PORT}/v1/chat/completions", json=payload, timeout=10
        ).raise_for_status()


\`\`\`

With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.

\`\`\`python
app = modal.App(name="example-server-sglang-low-latency")
PORT = 8000
ROUTING_REGION = "us-west"


@app.server(
    image=sglang_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL, DG_CACHE_PATH: DG_CACHE_VOL},
    compute_region=REGION,
    min_containers=MIN_CONTAINERS,
    startup_timeout=20 * MINUTES,
    port=PORT,  # wrapped code must listen on this port
    routing_region=ROUTING_REGION,  # location of proxies, should be close to Cls region
    exit_grace_period=15,  # seconds, time to finish up requests when closing down
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class SGLang:
    @modal.enter()
    def startup(self):
        """Start the SGLang server and block until it is healthy, then warm it up and put it to sleep."""
        cmd = [
            "python",
            "-m",
            "sglang.launch_server",
            "--model-path",
            MODEL_NAME,
            "--revision",
            MODEL_REVISION,
            "--served-model-name",
            MODEL_NAME,
            "--host",
            "0.0.0.0",
            "--port",
            f"{PORT}",
            "--tp",  # use all GPUs to split up tensor-parallel operations
            f"{N_GPUS}",
            "--cuda-graph-max-bs",  # only capture CUDA graphs for batch sizes we're likely to observe
            f"{TARGET_INPUTS * 2}",
            "--enable-metrics",  # expose metrics endpoints for telemetry
            "--decode-log-interval",  # how often to log during decoding, in tokens
            "10",
            "--mem-fraction",  # leave space for speculative model
            "0.8",
            "--trust-remote-code",  # for speculative model
        ]

        cmd += [  # add speculative config
            item for k, v in speculative_config.items() for item in (f"--{k}", str(v))
        ]

        self.process = subprocess.Popen(cmd, env=os.environ | speculative_env)
        wait_ready(self.process)
        warmup()

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy sglang_low_latency.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-sglang-low-latency-sglang.us-west.modal.direct\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-sglang-low-latency-sglang.us-west.modal.direct/docs\`.
These docs describe each route and indicate the expected input and output
and translate requests into \`curl\` commands.
For simple routes, you can even send a request directly from the docs page.

Note: when no replicas are available, Modal will respond with
the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503).
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the applicaton and its containers on your [Modal dashboard](https://modal.com/apps).

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that hits the server with a simple client.

If you execute the command

\`\`\`bash
modal run sglang_low_latency.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = await SGLang.get_url.aio()

    system_prompt = {
        "role": "system",
        "content": "You are a pirate who can't help but drop sly reminders that he went to Harvard.",
    }
    if prompt is None:
        prompt = "Explain the Singular Value Decomposition."

    content = [{"type": "text", "text": prompt}]

    messages = [  # OpenAI chat format
        system_prompt,
        {"role": "user", "content": content},
    ]

    await probe(url, messages, timeout=test_timeout)
    if twice:
        messages[0]["content"] = "You are Jar Jar Binks."
        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await probe(url, messages, timeout=test_timeout)


\`\`\`

This test relies on the two helper functions below,
which ping the server and wait for a valid response to stream.

The \`probe\` helper function specifically ignores
two types of errors that can occur while a replica
is starting up -- timeouts on the client and 5XX responses from the server.
Modal returns the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
when a Modal Server has no live replicas.

We include a header with each request --
\`Modal-Session-ID\`.
This is header is used by clients of Modal Servers
to identify which requests should be routed to the same container
(with caveats explained below).

The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per distinct multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Additionally, when the set of containers changes (e.g. due to autoscaling),
sessions are rebalanced such that load is approximately evenly spread,
much like in [RAID rebalancing](https://cordero.me/understanding-raid-rebalance-ensuring-optimal-performance-and-data-protection/).
This ensures no container ends up as a "hot spot" handling too many client requests.

\`\`\`python
async def probe(url, messages=None, timeout=5 * MINUTES):
    if messages is None:
        messages = [{"role": "user", "content": "Tell me a joke."}]

    client_id = str(0)  # set this to some string per multi-turn interaction
    # often a UUID per "conversation"
    headers = {"Modal-Session-ID": client_id}
    deadline = time.time() + timeout
    async with aiohttp.ClientSession(base_url=url, headers=headers) as session:
        while time.time() < deadline:
            try:
                await _send_request_streaming(session, messages)
                return
            except asyncio.TimeoutError:
                await asyncio.sleep(1)
            except aiohttp.client_exceptions.ClientResponseError as e:
                if e.status == 503:
                    await asyncio.sleep(1)
                    continue
                raise e
    raise TimeoutError(f"No response from server within {timeout} seconds")


async def _send_request_streaming(
    session: aiohttp.ClientSession, messages: list, timeout: int | None = None
) -> None:
    payload = {"messages": messages, "stream": True}
    headers = {"Accept": "text/event-stream"}

    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers, timeout=timeout
    ) as resp:
        resp.raise_for_status()
        full_text = ""

        async for raw in resp.content:
            line = raw.decode("utf-8", errors="ignore").strip()
            if not line:
                continue

            # Server-Sent Events format: "data: ...."
            if not line.startswith("data:"):
                continue

            data = line[len("data:") :].strip()
            if data == "[DONE]":
                break

            try:
                evt = json.loads(data)
            except json.JSONDecodeError:
                # ignore any non-JSON keepalive
                continue

            delta = (evt.get("choices") or [{}])[0].get("delta") or {}
            chunk = delta.get("content")

            if chunk:
                print(chunk, end="", flush="\\n" in chunk or "." in chunk)
                full_text += chunk
        print()  # newline after stream completes

\`\`\`
`,meta:{title:`Low latency Qwen 3.6 with SGLang and Modal`,description:`In this example, we show how to serve SGLang at low latency on Modal.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<em>speculative decoding</em>`),ae=t(`<code>target_concurrency</code>`),oe=t(`Controlling container lifecycles with <code>modal.Server</code>`,1),se=t(`<code>@app.server</code>`),ce=t(`<code>@modal.enter</code> and <code>@modal.exit</code>`,1),le=t(`<code>requests</code> library`,1),ue=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),de=t(`<!> <p>In this example, we show how to serve <!> at low latency on Modal.</p> <p>This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both SGLang and Modal.
For a simpler introduction to LLM serving, see <!>.</p> <p>To minimize routing overheads, we use <code>@app.server</code>,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.</p> <p>We start from a container image provided <!>.
After a bit of cleanup, we install an updated version that has some low-latency tricks
the Modal team is contributing to SGLang (described below).</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <p>We also choose a <!> to deploy our inference server onto.
We choose the <!>,
which offers excellent price-performance
and supports <!>, which are the
lowest precision well-supported in the relevant <!> across a variety of model architectures.</p> <p>Below, we discuss the choice of GPU count.</p> <!> <!> <p>We’ll serve <!>.
For lower latency, we pick the 35B mixture-of-experts model with 3B active parameters
in a lower precision floating point format (FP8).
Expert sparsity and lower precision reduce the amount of data that needs to be loaded <!> in each forward pass.</p> <!> <p>We load the model <!>.</p> <p>But we don’t want to load the model from the Hub every time we start the server.
We can load it much faster from a <!>.
Typical speeds are around one to two GB/s.</p> <!> <p>In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also <!>,
which can fully saturate our network bandwidth.</p> <!> <!> <p>Model weights aren’t the only thing we want to cache.</p> <p>As a rule, LLM inference servers like SGLang don’t directly provide their own kernels.
They draw high-performance kernels from a variety of sources.</p> <p>As of version <code>0.5.12</code>, SGLang’s default kernel backend
for FP8 matrix multiplications (<code>fp8-gemm-backend</code>)
on Hopper <!> GPUs like the H100 is <!> by DeepSeek.</p> <p>The binaries of these kernels are not included in the SGLang Docker image and so
must be <!>.
We store these in a Modal Volume as well.</p> <!> <p>JIT DeepGEMM kernels are on by default, but we explicitly enable them via an environment variable.</p> <!> <p>We trigger the compilation by running <code>sglang.compile_deep_gemm</code> in a <code>subprocess</code> kicked off from a Python function.</p> <!> <p>We run this Python function on Modal as part of building the Image
so that it has access to the appropriate GPU and the caches for our model and compilaton artifacts.</p> <!> <!> <p>LLM inference engines like SGLang come with a wide variety of “knobs” to tune performance.</p> <p>To determine the appropriate configuration to hit latency and throughput service objectives,
we recommend <!> guided by <!>.</p> <p>Here, we assume that the primary goal is to minimize per-request latency, with less regard to throughput
(and so to cost) and walk through some of the key choices.</p> <p>The primary contributor to per-request latency is the time to move all of the model’s weights (multiple gigabytes)
from <!> into <!>,
which must be done at least once in the course of processing a request —
naively, once per token per request.
The time taken is limited by the <!> between those two stores, which is on the order of terabytes per second on modern data center GPUs.
With models at the scale of gigabytes, a token will take milliseconds to generate —
or whole seconds for the kilotoken responses users are accustomed to.</p> <p>We use two strategies to cut latency in our <!> workload:</p> <ul><li><p>operate across multiple GPUs for more aggregate bandwidth and faster loads, with tensor parallelism</p></li> <li><p>generate more tokens per load, with speculative decoding</p></li></ul> <!> <p>Running SGLang on two H100s will double our effective <!> during large matrix multiplications.</p> <p>Matrices are also known as tensors, and so this strategy that takes advantage
of the inherent parallelism within matrix multiplication is known as <em>tensor parallelism</em>.</p> <p>Actual speedups are generally less than what you get from “napkin math” based on available bandwidths —
we observed a speedup of about 30% moving from one to two H100s when developing this example, rather than 100%.</p> <!> <p>Transformer and recurrent language models generate text sequentially:
the model’s output at step <code>i</code> is part of the input at step <code>i+1</code>.
Per Amdahl’s Law, that sequential work becomes the bottleneck
as other steps get faster from increased parallelism.</p> <p>The solution is to generate more tokens on each step.
The primary technique to do so without changing model behavior is known as <!>,
which “speculates” a number of draft tokens and verifies them in parallel with the primary model.</p> <p>Speculative decoding techniques themselves have a number of parameters, the most important
of which is the technique to use to generate draft tokens.
Simple techniques based on n-grams are a good place to start.
Many models are released with built-in speculation based on <!>,
also known in SGLang as <!>.</p> <p>But our favorite technique is <!> which runs draft token generation in parallel, increasing the draft model’s
arithmetic intensity.</p> <!> <p>We adapt the default configuration for this speculator from <!>.
In particular, we use a smaller draft token count of <code>8</code>, the minimum,
rather than <code>16</code>, the default. We’re using the FP8 quantized model here
and the test prompts are creative writing tasks, so accept lengths
are generally below <code>8</code> and additional blocks don’t have enough
accepted tokens to be worth the extra computation.</p> <!> <p>Note that unlike tensor parallelism,
speculative decoding is not good for <!> workloads, since it generally increases demand for <!>.
So for workloads that admit larger batch sizes for requests,
on the scale of dozens to hundreds, speculative decoding is not recommended.</p> <!> <!> <p>Minimizing latency requires geographic co-location of clients and servers.</p> <p>So for low latency LLM inference services on Modal, you must select a <!> for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a Modal Server.</p> <p>Here, we assume users are mostly in the northern half of the Americas
and select the <code>us</code> cloud region serve them.
This should result in at most a few dozen milliseconds of round-trip time.</p> <!> <p>Latencies for mutli-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in <!>,
so they aren’t shared across replicas.
To improve cache hit rate, Modal Servers
include sticky routing based on a client-provided header.
See the client code below for details.</p> <p>For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a “warm” or “live” replica reduces latency by skipping slow initialization work
that occurs when new replica boots up (a <!>).
For LLM inference servers, that latency runs from seconds to minutes.</p> <p>To ensure at least one container is always available,
we can set the <code>min_containers</code> of our Modal Function
to <code>1</code> or more.</p> <p>However, since this is documentation code, we’ll set it to <code>0</code> to avoid surprise bills during casual use.</p> <!> <p>Finally, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users’ requests will queue
when the server becomes overloaded. Even apart from queueing, responses
generally become slower per user above a certain minimum number of
concurrent requests.</p> <p>So we set a target for the number of inputs to run on a single container
with <!> parameter.</p> <!> <p>Generally, this choice needs to be made as part of <!>.</p> <!> <p>We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.</p> <p>The key decorators are:</p> <ul><li><p><!> to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
This decorator also turns our python code into an HTTP server (i.e. fronting all of our containers with a proxy with a URL).
The wrapped code needs to eventually listen for HTTP connections on the provided <code>port</code>.
See <!> for details.</p></li> <li><p><!> to indicate
which methods of the class should be run when starting the server and shutting it down.</p></li></ul> <p>Modal considers a new replica ready to receive inputs once the <code>modal.enter</code> methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up and to
send it a few test inputs.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <p>With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-sglang-low-latency-sglang.us-west.modal.direct</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-sglang-low-latency-sglang.us-west.modal.direct/docs</code>.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.
For simple routes, you can even send a request directly from the docs page.</p> <p>Note: when no replicas are available, Modal will respond with
the <!>.
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the applicaton and its containers on your <!>.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>This test relies on the two helper functions below,
which ping the server and wait for a valid response to stream.</p> <p>The <code>probe</code> helper function specifically ignores
two types of errors that can occur while a replica
is starting up — timeouts on the client and 5XX responses from the server.
Modal returns the <!> when a Modal Server has no live replicas.</p> <p>We include a header with each request — <code>Modal-Session-ID</code>.
This is header is used by clients of Modal Servers
to identify which requests should be routed to the same container
(with caveats explained below).</p> <p>The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per distinct multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Additionally, when the set of containers changes (e.g. due to autoscaling),
sessions are rebalanced such that load is approximately evenly spread,
much like in <!>.
This ensures no container ends up as a “hot spot” handling too many client requests.</p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=de(),d=te(a);ne(d,{id:`low-latency-qwen-36-with-sglang-and-modal`,children:(e,t)=>{s(),i(e,r(`Low latency Qwen 3.6 with SGLang and Modal`))},$$slots:{default:!0}});var p=o(d,2);f(o(e(p)),{href:`https://github.com/sgl-project/sglang`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SGLang`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);f(o(e(m)),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4);c(h,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);f(o(e(_)),{href:`https://hub.docker.com/r/lmsysorg/sglang/tags`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`by the SGLang team via Dockerhub`))},$$slots:{default:!0}}),s(),n(_);var fe=o(_,4);u(fe,{code:`import%20asyncio%0Aimport%20json%0Aimport%20os%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AGIT_SHA%20%3D%20%225244693e308eaf05da17f28cca6bcc922270fd3c%22%0A%0Asglang_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Av0.5.12.post1-cu130%22)%0A%20%20%20%20.entrypoint(%0A%20%20%20%20%20%20%20%20%5B%5D%20%20%23%20silence%20chatty%20logs%20on%20container%20start%0A%20%20%20%20)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22rm%20-rf%20%2Froot%2F.cache%2Fhuggingface%22%20%20%23%20clean%20up%20image%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2Fsgl-project%2Fsglang.git%40%7BGIT_SHA%7D%23subdirectory%3Dpython%22%0A%20%20%20%20)%0A)%0A`,lang:`python`});var v=o(fe,2),pe=o(e(v));f(pe,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU`))},$$slots:{default:!0}});var me=o(pe,2);f(me,{href:`https://modal.com/blog/introducing-h100`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H100 GPU`))},$$slots:{default:!0}});var he=o(me,2);f(he,{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`8bit floating point operations`))},$$slots:{default:!0}}),f(o(he,2),{href:`https://modal.com/gpu-glossary/device-software/kernel`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU kernels`))},$$slots:{default:!0}}),s(),n(v);var ge=o(v,4);u(ge,{code:`GPU_TYPE%2C%20N_GPUS%20%3D%20%22H100!%22%2C%202%0AGPU%20%3D%20f%22%7BGPU_TYPE%7D%3A%7BN_GPUS%7D%22%0A`,lang:`python`});var _e=o(ge,2);l(_e,{id:`loading-and-cacheing-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Loading and cacheing the model weights`))},$$slots:{default:!0}});var y=o(_e,2),ve=o(e(y));f(ve,{href:`https://qwen.ai/blog?id=qwen3.6`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Alibaba’s Qwen 3.6 LLM`))},$$slots:{default:!0}}),f(o(ve,2),{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from GPU RAM into SM SRAM`))},$$slots:{default:!0}}),s(),n(y);var ye=o(y,2);u(ye,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen3.6-35B-A3B-FP8%22%0AMODEL_REVISION%20%3D%20(%20%20%23%20pin%20revision%20id%20to%20avoid%20nasty%20surprises!%0A%20%20%20%20%2295a723d08a9490559dae23d0cff1d9466213d989%22%20%20%23%20latest%20commit%20as%20of%202026-04-23%2C%20from%20release%0A)%0A`,lang:`python`});var b=o(ye,2);f(o(e(b)),{href:`https://huggingface.co/collections/Qwen/qwen36`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from the Hugging Face Hub`))},$$slots:{default:!0}}),s(),n(b);var x=o(b,2);f(o(e(x)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(x);var be=o(x,2);u(be,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0AMODEL_PATH%20%3D%20f%22%7BHF_CACHE_PATH%7D%2F%7BMODEL_NAME%7D%22%0A`,lang:`python`});var S=o(be,2);f(o(e(S)),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`turn on “high performance” downloads`))},$$slots:{default:!0}}),s(),n(S);var xe=o(S,2);u(xe,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var Se=o(xe,2);l(Se,{id:`cacheing-compilation-artifacts`,children:(e,t)=>{s(),i(e,r(`Cacheing compilation artifacts`))},$$slots:{default:!0}});var C=o(Se,6),w=o(e(C),5);f(w,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SM architecture`))},$$slots:{default:!0}}),f(o(w,2),{href:`https://github.com/deepseek-ai/DeepGEMM`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DeepGEMM`))},$$slots:{default:!0}}),s(),n(C);var T=o(C,2);f(o(e(T)),{href:`https://modal.com/gpu-glossary/host-software/nvrtc`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`JIT-compiled`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);u(E,{code:`DG_CACHE_VOL%20%3D%20modal.Volume.from_name(%22deepgemm-cache%22%2C%20create_if_missing%3DTrue)%0ADG_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fdeep_gemm%22%0A`,lang:`python`});var D=o(E,4);u(D,{code:`sglang_image%20%3D%20sglang_image.env(%7B%22SGLANG_ENABLE_JIT_DEEPGEMM%22%3A%20%221%22%7D)%0A`,lang:`python`});var O=o(D,4);u(O,{code:`def%20compile_deep_gemm()%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20if%20int(os.environ.get(%22SGLANG_ENABLE_JIT_DEEPGEMM%22%2C%20%221%22))%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22python3%20-m%20sglang.compile_deep_gemm%20--model-path%20%7BMODEL_NAME%7D%20--revision%20%7BMODEL_REVISION%7D%20--tp%20%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var k=o(O,4);u(k,{code:`sglang_image%20%3D%20sglang_image.run_function(%0A%20%20%20%20compile_deep_gemm%2C%0A%20%20%20%20volumes%3D%7BDG_CACHE_PATH%3A%20DG_CACHE_VOL%2C%20HF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20gpu%3DGPU%2C%0A)%0A`,lang:`python`});var A=o(k,2);c(A,{id:`configure-sglang-for-minimal-latency`,children:(e,t)=>{s(),i(e,r(`Configure SGLang for minimal latency`))},$$slots:{default:!0}});var j=o(A,4),M=o(e(j));f(M,{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`application-specific benchmarking`))},$$slots:{default:!0}}),f(o(M,2),{href:`https://modal.com/llm-almanac/advisor`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`published generic benchmarks`))},$$slots:{default:!0}}),s(),n(j);var N=o(j,4),Ce=o(e(N));f(Ce,{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}});var we=o(Ce,2);f(we,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SRAM in the Streaming Multiprocessors`))},$$slots:{default:!0}}),f(o(we,2),{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory bandwidth`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,2);f(o(e(P)),{href:`https://modal.com/gpu-glossary/perf/memory-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory-bound`))},$$slots:{default:!0}}),s(),n(P);var Te=o(P,4);l(Te,{id:`increasing-effective-memory-bandwidth-with-tensor-parallelism`,children:(e,t)=>{s(),i(e,r(`Increasing effective memory bandwidth with tensor parallelism`))},$$slots:{default:!0}});var F=o(Te,2);f(o(e(F)),{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory bandwidth`))},$$slots:{default:!0}}),s(),n(F);var Ee=o(F,6);l(Ee,{id:`parallelizing-token-generation-with-speculative-decoding`,children:(e,t)=>{s(),i(e,r(`Parallelizing token generation with speculative decoding`))},$$slots:{default:!0}});var I=o(Ee,4);f(o(e(I)),{href:`https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(I);var L=o(I,2),De=o(e(L));f(De,{href:`https://docs.vllm.ai/projects/ascend/en/main/user_guide/feature_guide/Multi_Token_Prediction.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`multi-token prediction`))},$$slots:{default:!0}}),f(o(De,2),{href:`https://arxiv.org/abs/2401.15077`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`EAGLE`))},$$slots:{default:!0}}),s(),n(L);var R=o(L,2);f(o(e(R)),{href:`https://arxiv.org/abs/2602.06036`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DFLASH`))},$$slots:{default:!0}}),s(),n(R);var Oe=o(R,2);u(Oe,{code:`speculative_config%20%3D%20%7B%0A%20%20%20%20%22speculative-algorithm%22%3A%20%22DFLASH%22%2C%0A%20%20%20%20%22speculative-draft-model-path%22%3A%20%22z-lab%2FQwen3.6-35B-A3B-DFlash%22%2C%0A%20%20%20%20%22speculative-draft-model-revision%22%3A%20%2242d3b34d588423cdae7ba8f53a8cf7789346a719%22%2C%0A%20%20%20%20%22mamba-scheduler-strategy%22%3A%20%22extra_buffer%22%2C%20%20%23%20required%20for%20spec%20dec%20with%20Qwen%203.X%20hybrid%20arch%0A%7D%0A`,lang:`python`});var z=o(Oe,2);f(o(e(z)),{href:`https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the model card`))},$$slots:{default:!0}}),s(7),n(z);var ke=o(z,2);u(ke,{code:`speculative_config%20%7C%3D%20%7B%0A%20%20%20%20%22speculative-num-draft-tokens%22%3A%208%2C%0A%7D%0A%0Aspeculative_env%20%3D%20%7B%0A%20%20%20%20%22SGLANG_ENABLE_OVERLAP_PLAN_STREAM%22%3A%20%221%22%2C%20%20%23%20never%20block%20the%20GPU!%0A%7D%0A`,lang:`python`});var B=o(ke,2),Ae=o(e(B));f(Ae,{href:`https://modal.com/gpu-glossary/perf/compute-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`compute-bound`))},$$slots:{default:!0}}),f(o(Ae,2),{href:`https://modal.com/gpu-glossary/perf/arithmetic-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`arithmetic bandwidth`))},$$slots:{default:!0}}),s(),n(B);var je=o(B,2);c(je,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var Me=o(je,2);l(Me,{id:`selecting-infrastructure-to-minimize-latency`,children:(e,t)=>{s(),i(e,r(`Selecting infrastructure to minimize latency`))},$$slots:{default:!0}});var V=o(Me,4);f(o(e(V)),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cloud region`))},$$slots:{default:!0}}),s(),n(V);var Ne=o(V,4);u(Ne,{code:`REGION%20%3D%20%22us%22%0A`,lang:`python`});var H=o(Ne,2);f(o(e(H)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);f(o(e(U)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“cold start”`))},$$slots:{default:!0}}),s(),n(U);var Pe=o(U,6);u(Pe,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20to%20ensure%20one%20replica%20is%20always%20ready%0A`,lang:`python`});var W=o(Pe,4);f(o(e(W)),{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(W);var Fe=o(W,2);u(Fe,{code:`TARGET_INPUTS%20%3D%2010%0A`,lang:`python`});var G=o(Fe,2);f(o(e(G)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LLM inference engine benchmarking`))},$$slots:{default:!0}}),s(),n(G);var Ie=o(G,2);l(Ie,{id:`controlling-container-lifecycles-with-modalserver`,children:(e,t)=>{s();var n=oe();s(),i(e,n)},$$slots:{default:!0}});var K=o(Ie,6),q=e(K),Le=e(q),Re=e(Le);f(Re,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),f(o(Re,4),{href:`https://modal.com/docs/reference/modal.App#server`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the reference documentation`))},$$slots:{default:!0}}),s(),n(Le),n(q);var ze=o(q,2),Be=e(ze);f(e(Be),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=ce();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(Be),n(ze),n(K);var J=o(K,4),Ve=o(e(J));f(Ve,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=le();s(),i(e,n)},$$slots:{default:!0}}),f(o(Ve,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=ue();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(J);var He=o(J,2);u(He,{code:`with%20sglang_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%2020%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22SGLang%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20timeout%3D10%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var Ue=o(He,4);u(Ue,{code:`app%20%3D%20modal.App(name%3D%22example-server-sglang-low-latency%22)%0APORT%20%3D%208000%0AROUTING_REGION%20%3D%20%22us-west%22%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%2C%20DG_CACHE_PATH%3A%20DG_CACHE_VOL%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20startup_timeout%3D20%20*%20MINUTES%2C%0A%20%20%20%20port%3DPORT%2C%20%20%23%20wrapped%20code%20must%20listen%20on%20this%20port%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%20%20%23%20location%20of%20proxies%2C%20should%20be%20close%20to%20Cls%20region%0A%20%20%20%20exit_grace_period%3D15%2C%20%20%23%20seconds%2C%20time%20to%20finish%20up%20requests%20when%20closing%20down%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20SGLang%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20the%20SGLang%20server%20and%20block%20until%20it%20is%20healthy%2C%20then%20warm%20it%20up%20and%20put%20it%20to%20sleep.%22%22%22%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tp%22%2C%20%20%23%20use%20all%20GPUs%20to%20split%20up%20tensor-parallel%20operations%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs%22%2C%20%20%23%20only%20capture%20CUDA%20graphs%20for%20batch%20sizes%20we're%20likely%20to%20observe%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BTARGET_INPUTS%20*%202%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%20%20%23%20expose%20metrics%20endpoints%20for%20telemetry%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--decode-log-interval%22%2C%20%20%23%20how%20often%20to%20log%20during%20decoding%2C%20in%20tokens%0A%20%20%20%20%20%20%20%20%20%20%20%20%2210%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--mem-fraction%22%2C%20%20%23%20leave%20space%20for%20speculative%20model%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--trust-remote-code%22%2C%20%20%23%20for%20speculative%20model%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%20%20%23%20add%20speculative%20config%0A%20%20%20%20%20%20%20%20%20%20%20%20item%20for%20k%2C%20v%20in%20speculative_config.items()%20for%20item%20in%20(f%22--%7Bk%7D%22%2C%20str(v))%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd%2C%20env%3Dos.environ%20%7C%20speculative_env)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var We=o(Ue,2);c(We,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var Ge=o(We,4);u(Ge,{code:`modal%20deploy%20sglang_low_latency.py`,lang:`bash`});var Ke=o(Ge,4);c(Ke,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var Y=o(Ke,4);f(o(e(Y)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(Y);var X=o(Y,2),qe=o(e(X));f(qe,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),f(o(qe,2),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,2);c(Z,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Je=o(Z,6);u(Je,{code:`modal%20run%20sglang_low_latency.py`,lang:`bash`});var Ye=o(Je,6);u(Ye,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20SGLang.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Explain%20the%20Singular%20Value%20Decomposition.%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%0A`,lang:`python`});var Q=o(Ye,4);f(o(e(Q),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,4);f(o(e($)),{href:`https://cordero.me/understanding-raid-rebalance-ensuring-optimal-performance-and-data-protection/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RAID rebalancing`))},$$slots:{default:!0}}),s(),n($),u(o($,2),{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20this%20to%20some%20string%20per%20multi-turn%20interaction%0A%20%20%20%20%23%20often%20a%20UUID%20per%20%22conversation%22%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Server-Sent%20Events%20format%3A%20%22data%3A%20....%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20ignore%20any%20non-JSON%20keepalive%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%20%20%23%20newline%20after%20stream%20completes%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=wtqkR9r12.js.map
