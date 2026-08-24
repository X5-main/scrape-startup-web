(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`096406c8-3aa6-411e-98d4-38e483bf3f6d`,e._sentryDebugIdIdentifier=`sentry-dbid-096406c8-3aa6-411e-98d4-38e483bf3f6d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Serverless Qwen 3-8B with SGLang and Modal Snapshots`,id:`serverless-qwen-3-8b-with-sglang-and-modal-snapshots`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Loading and cacheing the model weights`,id:`loading-and-cacheing-the-model-weights`},{depth:3,value:`Cacheing compilation artifacts`,id:`cacheing-compilation-artifacts`}]},{depth:2,value:`Speed up cold starts with GPU snapshotting`,id:`speed-up-cold-starts-with-gpu-snapshotting`,children:[{depth:3,value:`Sleeping and waking an SGLang server`,id:`sleeping-and-waking-an-sglang-server`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Determining autoscaling policy with @modal.concurrent`,id:`determining-autoscaling-policy-with-modalconcurrent`},{depth:3,value:`Controlling container lifecycles with @modal.enter`,id:`controlling-container-lifecycles-with-modalenter`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`,children:[{depth:3,value:`Test memory snapshotting`,id:`test-memory-snapshotting`}]}]}],rawContent:`# Serverless Qwen 3-8B with SGLang and Modal Snapshots

In this example, we show how to serve [SGLang](https://github.com/sgl-project/sglang) on Modal
with ~10x faster cold starts.

Fast cold starts are particularly useful for LLM inference applications
that have highly "bursty" workloads, like document processing.
See [this guide](https://modal.com/docs/guide/high-performance-llm-inference)
for a breakdown of different LLM inference workloads and how to optimize them.

The key technique is
[CPU + GPU memory snapshotting](https://modal.com/docs/guide/memory-snapshot),
which saves and restores the SGLang server directly from its in-memory state.

This adds some complexity to the deployment.
If you just want to get started running a basic LLM server on Modal, see
[this example](https://modal.com/docs/examples/llm_inference).

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/images).

We start from a container image provided
[by the SGLang team via Dockerhub](https://hub.docker.com/r/lmsysorg/sglang/tags).

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import subprocess
import time

import aiohttp
import modal
import modal.experimental

MINUTES = 60  # seconds

sglang_image = (
    modal.Image.from_registry(
        "lmsysorg/sglang:v0.5.6.post2-cu129-amd64-runtime"
    ).entrypoint([])  # silence chatty logs on container start
)

\`\`\`

We also choose a GPU to deploy our inference server onto.
We choose the [H100 GPU](https://modal.com/blog/introducing-h100),
which offers excellent price-performance
and supports 8bit floating point operations, which are the
lowest precision well-supported in the relevant
[GPU kernels](https://modal.com/gpu-glossary/device-software/kernel)
across a variety of model architectures.

\`\`\`python
N_GPUS = 1
GPU = f"H100!:{N_GPUS}"

\`\`\`

Actual speedups are generally less than what you get from "napkin math" based on available bandwidths --
we observed a speedup of about 30% moving from one to two H100s when developing this example.
We recommend [application-specific benchmarking](https://modal.com/llm-almanac/how-to-benchmark)
guided by [published generic benchmarks](https://modal.com/llm-almanac/advisor).

### Loading and cacheing the model weights

We'll serve
[Alibaba's Qwen 3 LLM](https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192).
For lower latency and faster cold starts, we pick a smaller model (8B params)
in a lower precision floating point format (FP8).
This reduces the amount of data that needs to be loaded
[from GPU RAM into SM SRAM](https://modal.com/gpu-glossary/perf/memory-bandwidth)
in each forward pass.

\`\`\`python
MODEL_NAME = "Qwen/Qwen3-8B-FP8"
MODEL_REVISION = (
    "220b46e3b2180893580a4454f21f22d3ebb187d3"  # latest commit as of 2026-01
)

\`\`\`

We load the model [from the Hugging Face Hub](https://huggingface.co/collections/Qwen/qwen3),
so we'll need their Python package.

\`\`\`python
sglang_image = sglang_image.uv_pip_install("huggingface-hub==0.36.0")

\`\`\`

We don't want to load the model from the Hub every time we start the server.
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

As of version \`0.5.6\`, SGLang's default kernel backend
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

## Speed up cold starts with GPU snapshotting

Modal is a serverless compute platform, so all of your
inference services automatically scale up and down to handle
variable load.

Scaling up a new replica requires quite a bit of work --
loading up Python and system packages, loading model weights,
setting up the inference engine, and so on.

We can skip over and speed up a bunch of this work
when spinning up new replicas after the first
by directly booting from a [memory snapshot](https://modal.com/docs/guide/memory-snapshot),
which contains the exact in-memory representation of our server just before it begins taking requests.

Most applications can be snapshot and experience substantial speedups (2x to 10x,
see [our initial benchmarks here](https://modal.com/blog/gpu-mem-snapshots)).
However, it generally requires some extra work to adapt the application code.

For instance, we here set an environment variable that improves the compatibility of
the [Torch Inductor compiler](https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-symbolic-shapes/747)
with GPU snapshotting.

\`\`\`python
sglang_image = sglang_image.env({"TORCHINDUCTOR_COMPILE_THREADS": "1"})

\`\`\`

Below, we walk through the additional steps required to make an SGLang server compatible with snapshots.

### Sleeping and waking an SGLang server

We prepare our SGLang inference server for snapshotting by first sending
a few requests to "warm it up", ensuring that it is fully ready to process requests.
Then we "put it to sleep", moving non-essential data out of GPU memory,
with a request to \`/release_memory_occupation\`.
At this point, we can take a memory snapshot.
Upon snapshot restoration, we "wake up" the server
with a request to \`/resume_memory_occupation\`.

We use the [\`requests\` library](https://requests.readthedocs.io/en/latest/)
to send ourselves these HTTP requests on
[\`localhost\`/\`127.0.0.1\`](https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1).

\`\`\`python
with sglang_image.imports():
    import requests


def warmup():
    payload = {
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{PORT}/v1/chat/completions", json=payload, timeout=10
        ).raise_for_status()


def sleep():
    requests.post(
        f"http://127.0.0.1:{PORT}/release_memory_occupation", json={}
    ).raise_for_status()


def wake_up():
    requests.post(
        f"http://127.0.0.1:{PORT}/resume_memory_occupation", json={}
    ).raise_for_status()


\`\`\`

## Define the inference server and infrastructure

We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.

The key decorators are:

- [\`@app.cls\`](https://modal.com/docs/guide/lifecycle-functions) to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
See [the reference documentation](https://modal.com/docs/reference/modal.App#cls) for details.

- \`@modal.web_server\` to turn our Python code into an HTTP server.
The wrapped code needs to eventually listen for HTTP connections on the provided \`port\`.

- [\`@modal.concurrent\`](https://modal.com/docs/guide/concurrent-inputs) to specify how many
requests our server can handle before we need to scale up.

- [\`@modal.enter\` and \`@modal.exit\`](https://modal.com/docs/guide/lifecycle-functions) to indicate
which methods of the class should be run when starting the server and shutting it down. The \`enter\`
methods also define what code is run before memory snapshot creation (\`snap=True\`) and after memory snapshot restoration (\`snap=False\`).

The \`modal.concurrent\` decorator and the lifecycle management are particular important
for bursty workloads and for snapshotting, respectively, so let's discuss them in detail.

### Determining autoscaling policy with \`@modal.concurrent\`

To handle bursty workloads, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users' requests will queue
when the server becomes overloaded.

We can set two values with the
[\`@modal.concurrent\`](https://modal.com/docs/guide/concurrent-inputs) decorator.
\`max_inputs\` should be set to the maximum number of inputs a replica can handle concurrently
without internal queueing -- the \`max-running-requests\` in SGLang.
\`target_inputs\` can be left unset or, if the per-request latency
degrades too much when handling the maximum batch size,
it can be set to a lower value.

\`\`\`python
TARGET_INPUTS = 10
MAX_INPUTS = 1000

\`\`\`

Generally, this choice needs to be made as part of
[LLM inference engine benchmarking](https://modal.com/llm-almanac/how-to-benchmark)
in reference to a particular application's latency and throughput targets.

### Controlling container lifecycles with \`@modal.enter\`

Modal considers a new replica ready to receive inputs once the \`@modal.enter\` methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up.

\`\`\`python
def wait_ready(process: subprocess.Popen, timeout: int = 5 * MINUTES):
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
            time.sleep(1)
    raise TimeoutError(f"SGLang server not ready within timeout of {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


\`\`\`

With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.

\`\`\`python
app = modal.App(name="example-sglang-snapshot")
PORT = 8000


@app.cls(
    image=sglang_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL, DG_CACHE_PATH: DG_CACHE_VOL},
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
)
@modal.concurrent(target_inputs=TARGET_INPUTS, max_inputs=MAX_INPUTS)
class SGLang:
    @modal.enter(snap=True)
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
            "--cuda-graph-max-bs",  # capture CUDA graphs up to batch sizes we're likely to observe
            f"{MAX_INPUTS}",
            "--max-running-requests",
            f"{MAX_INPUTS}",
            "--enable-metrics",  # expose metrics endpoints for telemetry
            "--enable-memory-saver",  # enable offload, for snapshotting
            "--enable-weights-cpu-backup",  # enable offload, for snapshotting
        ]

        self.process = subprocess.Popen(cmd)
        wait_ready(self.process)
        warmup()  # for snapshotting
        sleep()

    @modal.enter(snap=False)
    def wake_up(self):
        wake_up()

    @modal.web_server(
        port=PORT,  # wrapped code must listen on this port
        startup_timeout=10 * MINUTES,  # how long can server startup take?
    )
    def serve(self):
        pass

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy sglang_snapshot.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-sglang-snapshot-sglang.modal.run\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-sglang-snapshot-sglang.modal.direct/docs\`.
These docs describe each route and indicate the expected input and output
and translate requests into \`curl\` commands.
For simple routes, you can even send a request directly from the docs page.

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that hits the server with a simple client.

If you execute the command

\`\`\`bash
modal run sglang_snapshot.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = SGLang().serve.get_web_url()

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
        await probe(url, messages, timeout=1 * MINUTES)


\`\`\`

This test relies on the two helper functions below,
which ping the server and wait for a valid response.

\`\`\`python
async def probe(url, messages=None, timeout=5 * MINUTES):
    if messages is None:
        messages = [{"role": "user", "content": "Tell me a joke."}]

    deadline = time.time() + timeout
    async with aiohttp.ClientSession(base_url=url) as session:
        while time.time() < deadline:
            try:
                await _send_request(session, "llm", messages)
                return
            except asyncio.TimeoutError:
                await asyncio.sleep(1)
    raise TimeoutError(f"No response from server within {timeout} seconds")


async def _send_request(
    session: aiohttp.ClientSession,
    model: str,
    messages: list,
    timeout: int | None = None,
) -> None:
    async with session.post(
        "/v1/chat/completions",
        json={"messages": messages, "model": model},
        timeout=timeout,
    ) as resp:
        resp.raise_for_status()
        print((await resp.json())["choices"][0]["message"]["content"])


\`\`\`

### Test memory snapshotting

Using \`modal run\` creates an ephemeral Modal App, rather than a deployed Modal App.
Ephemeral Modal Apps are short-lived, so they turn off memory snapshotting.

To test the memory snapshot version of the server,
first deploy it with \`modal deploy\`
and then hit it with a client.

You should observe startup improvements
after a handful of cold starts
(usually less than five).
If you want to see the speedup during a test,
we recommend heading to the deployed App in your
[Modal dashboard](https://modal.com/apps)
and manually stopping containers after they have served a request
to ensure turnover.

You can use the client code below to test the endpoint.

\`\`\`python
if __name__ == "__main__":
    # after deployment, we can use the class from anywhere
    SGLang = modal.Cls.from_name("example-sglang-snapshot", "SGLang")

    print("calling inference server")
    try:
        asyncio.run(probe(SGLang().serve.get_web_url()))
    except modal.exception.NotFoundError as e:
        raise Exception(
            f"To take advantage of GPU snapshots, deploy first with modal deploy {__file__}"
        ) from e

\`\`\`

It can be run with the command

\`\`\`bash
python sglang_snapshot.py
\`\`\`
`,meta:{title:`Serverless Qwen 3-8B with SGLang and Modal Snapshots`,description:`In this example, we show how to serve SGLang on Modal with ~10x faster cold starts.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<code>requests</code> library`,1),ae=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),oe=t(`<code>@app.cls</code>`),se=t(`<code>@modal.concurrent</code>`),ce=t(`<code>@modal.enter</code> and <code>@modal.exit</code>`,1),le=t(`Determining autoscaling policy with <code>@modal.concurrent</code>`,1),ue=t(`<code>@modal.concurrent</code>`),de=t(`Controlling container lifecycles with <code>@modal.enter</code>`,1),fe=t(`<!> <p>In this example, we show how to serve <!> on Modal
with ~10x faster cold starts.</p> <p>Fast cold starts are particularly useful for LLM inference applications
that have highly “bursty” workloads, like document processing.
See <!> for a breakdown of different LLM inference workloads and how to optimize them.</p> <p>The key technique is <!>,
which saves and restores the SGLang server directly from its in-memory state.</p> <p>This adds some complexity to the deployment.
If you just want to get started running a basic LLM server on Modal, see <!>.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.</p> <p>We start from a container image provided <!>.</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <p>We also choose a GPU to deploy our inference server onto.
We choose the <!>,
which offers excellent price-performance
and supports 8bit floating point operations, which are the
lowest precision well-supported in the relevant <!> across a variety of model architectures.</p> <!> <p>Actual speedups are generally less than what you get from “napkin math” based on available bandwidths —
we observed a speedup of about 30% moving from one to two H100s when developing this example.
We recommend <!> guided by <!>.</p> <!> <p>We’ll serve <!>.
For lower latency and faster cold starts, we pick a smaller model (8B params)
in a lower precision floating point format (FP8).
This reduces the amount of data that needs to be loaded <!> in each forward pass.</p> <!> <p>We load the model <!>,
so we’ll need their Python package.</p> <!> <p>We don’t want to load the model from the Hub every time we start the server.
We can load it much faster from a <!>.
Typical speeds are around one to two GB/s.</p> <!> <p>In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also <!>,
which can fully saturate our network bandwidth.</p> <!> <!> <p>Model weights aren’t the only thing we want to cache.</p> <p>As a rule, LLM inference servers like SGLang don’t directly provide their own kernels.
They draw high-performance kernels from a variety of sources.</p> <p>As of version <code>0.5.6</code>, SGLang’s default kernel backend
for FP8 matrix multiplications (<code>fp8-gemm-backend</code>)
on Hopper <!> GPUs like the H100 is <!> by DeepSeek.</p> <p>The binaries of these kernels are not included in the SGLang Docker image and so
must be <!>.
We store these in a Modal Volume as well.</p> <!> <p>JIT DeepGEMM kernels are on by default, but we explicitly enable them via an environment variable.</p> <!> <p>We trigger the compilation by running <code>sglang.compile_deep_gemm</code> in a <code>subprocess</code> kicked off from a Python function.</p> <!> <p>We run this Python function on Modal as part of building the Image
so that it has access to the appropriate GPU and the caches for our model and compilaton artifacts.</p> <!> <!> <p>Modal is a serverless compute platform, so all of your
inference services automatically scale up and down to handle
variable load.</p> <p>Scaling up a new replica requires quite a bit of work —
loading up Python and system packages, loading model weights,
setting up the inference engine, and so on.</p> <p>We can skip over and speed up a bunch of this work
when spinning up new replicas after the first
by directly booting from a <!>,
which contains the exact in-memory representation of our server just before it begins taking requests.</p> <p>Most applications can be snapshot and experience substantial speedups (2x to 10x,
see <!>).
However, it generally requires some extra work to adapt the application code.</p> <p>For instance, we here set an environment variable that improves the compatibility of
the <!> with GPU snapshotting.</p> <!> <p>Below, we walk through the additional steps required to make an SGLang server compatible with snapshots.</p> <!> <p>We prepare our SGLang inference server for snapshotting by first sending
a few requests to “warm it up”, ensuring that it is fully ready to process requests.
Then we “put it to sleep”, moving non-essential data out of GPU memory,
with a request to <code>/release_memory_occupation</code>.
At this point, we can take a memory snapshot.
Upon snapshot restoration, we “wake up” the server
with a request to <code>/resume_memory_occupation</code>.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <!> <p>We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.</p> <p>The key decorators are:</p> <ul><li><p><!> to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
See <!> for details.</p></li> <li><p><code>@modal.web_server</code> to turn our Python code into an HTTP server.
The wrapped code needs to eventually listen for HTTP connections on the provided <code>port</code>.</p></li> <li><p><!> to specify how many
requests our server can handle before we need to scale up.</p></li> <li><p><!> to indicate
which methods of the class should be run when starting the server and shutting it down. The <code>enter</code> methods also define what code is run before memory snapshot creation (<code>snap=True</code>) and after memory snapshot restoration (<code>snap=False</code>).</p></li></ul> <p>The <code>modal.concurrent</code> decorator and the lifecycle management are particular important
for bursty workloads and for snapshotting, respectively, so let’s discuss them in detail.</p> <!> <p>To handle bursty workloads, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users’ requests will queue
when the server becomes overloaded.</p> <p>We can set two values with the <!> decorator. <code>max_inputs</code> should be set to the maximum number of inputs a replica can handle concurrently
without internal queueing — the <code>max-running-requests</code> in SGLang. <code>target_inputs</code> can be left unset or, if the per-request latency
degrades too much when handling the maximum batch size,
it can be set to a lower value.</p> <!> <p>Generally, this choice needs to be made as part of <!> in reference to a particular application’s latency and throughput targets.</p> <!> <p>Modal considers a new replica ready to receive inputs once the <code>@modal.enter</code> methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up.</p> <!> <p>With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-sglang-snapshot-sglang.modal.run</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-sglang-snapshot-sglang.modal.direct/docs</code>.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.
For simple routes, you can even send a request directly from the docs page.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>This test relies on the two helper functions below,
which ping the server and wait for a valid response.</p> <!> <!> <p>Using <code>modal run</code> creates an ephemeral Modal App, rather than a deployed Modal App.
Ephemeral Modal Apps are short-lived, so they turn off memory snapshotting.</p> <p>To test the memory snapshot version of the server,
first deploy it with <code>modal deploy</code> and then hit it with a client.</p> <p>You should observe startup improvements
after a handful of cold starts
(usually less than five).
If you want to see the speedup during a test,
we recommend heading to the deployed App in your <!> and manually stopping containers after they have served a request
to ensure turnover.</p> <p>You can use the client code below to test the endpoint.</p> <!> <p>It can be run with the command</p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=fe(),d=te(a);ne(d,{id:`serverless-qwen-3-8b-with-sglang-and-modal-snapshots`,children:(e,t)=>{s(),i(e,r(`Serverless Qwen 3-8B with SGLang and Modal Snapshots`))},$$slots:{default:!0}});var p=o(d,2);f(o(e(p)),{href:`https://github.com/sgl-project/sglang`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SGLang`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);f(o(e(m)),{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,2);f(o(e(h)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshotting`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var v=o(_,2);f(o(e(v)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);f(o(e(y)),{href:`https://hub.docker.com/r/lmsysorg/sglang/tags`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`by the SGLang team via Dockerhub`))},$$slots:{default:!0}}),s(),n(y);var pe=o(y,4);u(pe,{code:`import%20asyncio%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0Aimport%20modal.experimental%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Asglang_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22lmsysorg%2Fsglang%3Av0.5.6.post2-cu129-amd64-runtime%22%0A%20%20%20%20).entrypoint(%5B%5D)%20%20%23%20silence%20chatty%20logs%20on%20container%20start%0A)%0A`,lang:`python`});var b=o(pe,2),me=o(e(b));f(me,{href:`https://modal.com/blog/introducing-h100`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H100 GPU`))},$$slots:{default:!0}}),f(o(me,2),{href:`https://modal.com/gpu-glossary/device-software/kernel`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU kernels`))},$$slots:{default:!0}}),s(),n(b);var he=o(b,2);u(he,{code:`N_GPUS%20%3D%201%0AGPU%20%3D%20f%22H100!%3A%7BN_GPUS%7D%22%0A`,lang:`python`});var x=o(he,2),ge=o(e(x));f(ge,{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`application-specific benchmarking`))},$$slots:{default:!0}}),f(o(ge,2),{href:`https://modal.com/llm-almanac/advisor`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`published generic benchmarks`))},$$slots:{default:!0}}),s(),n(x);var _e=o(x,2);l(_e,{id:`loading-and-cacheing-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Loading and cacheing the model weights`))},$$slots:{default:!0}});var S=o(_e,2),C=o(e(S));f(C,{href:`https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Alibaba’s Qwen 3 LLM`))},$$slots:{default:!0}}),f(o(C,2),{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from GPU RAM into SM SRAM`))},$$slots:{default:!0}}),s(),n(S);var w=o(S,2);u(w,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen3-8B-FP8%22%0AMODEL_REVISION%20%3D%20(%0A%20%20%20%20%22220b46e3b2180893580a4454f21f22d3ebb187d3%22%20%20%23%20latest%20commit%20as%20of%202026-01%0A)%0A`,lang:`python`});var T=o(w,2);f(o(e(T)),{href:`https://huggingface.co/collections/Qwen/qwen3`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from the Hugging Face Hub`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);u(E,{code:`sglang_image%20%3D%20sglang_image.uv_pip_install(%22huggingface-hub%3D%3D0.36.0%22)%0A`,lang:`python`});var D=o(E,2);f(o(e(D)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,2);u(O,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0AMODEL_PATH%20%3D%20f%22%7BHF_CACHE_PATH%7D%2F%7BMODEL_NAME%7D%22%0A`,lang:`python`});var k=o(O,2);f(o(e(k)),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`turn on “high performance” downloads`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2);u(A,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var j=o(A,2);l(j,{id:`cacheing-compilation-artifacts`,children:(e,t)=>{s(),i(e,r(`Cacheing compilation artifacts`))},$$slots:{default:!0}});var M=o(j,6),N=o(e(M),5);f(N,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SM architecture`))},$$slots:{default:!0}}),f(o(N,2),{href:`https://github.com/deepseek-ai/DeepGEMM`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DeepGEMM`))},$$slots:{default:!0}}),s(),n(M);var P=o(M,2);f(o(e(P)),{href:`https://modal.com/gpu-glossary/host-software/nvrtc`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`JIT-compiled`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);u(F,{code:`DG_CACHE_VOL%20%3D%20modal.Volume.from_name(%22deepgemm-cache%22%2C%20create_if_missing%3DTrue)%0ADG_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fdeep_gemm%22%0A`,lang:`python`});var I=o(F,4);u(I,{code:`sglang_image%20%3D%20sglang_image.env(%7B%22SGLANG_ENABLE_JIT_DEEPGEMM%22%3A%20%221%22%7D)%0A`,lang:`python`});var L=o(I,4);u(L,{code:`def%20compile_deep_gemm()%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20if%20int(os.environ.get(%22SGLANG_ENABLE_JIT_DEEPGEMM%22%2C%20%221%22))%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22python3%20-m%20sglang.compile_deep_gemm%20--model-path%20%7BMODEL_NAME%7D%20--revision%20%7BMODEL_REVISION%7D%20--tp%20%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var R=o(L,4);u(R,{code:`sglang_image%20%3D%20sglang_image.run_function(%0A%20%20%20%20compile_deep_gemm%2C%0A%20%20%20%20volumes%3D%7BDG_CACHE_PATH%3A%20DG_CACHE_VOL%2C%20HF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20gpu%3DGPU%2C%0A)%0A%0A`,lang:`python`});var z=o(R,2);c(z,{id:`speed-up-cold-starts-with-gpu-snapshotting`,children:(e,t)=>{s(),i(e,r(`Speed up cold starts with GPU snapshotting`))},$$slots:{default:!0}});var B=o(z,6);f(o(e(B)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory snapshot`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);f(o(e(V)),{href:`https://modal.com/blog/gpu-mem-snapshots`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`our initial benchmarks here`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);f(o(e(H)),{href:`https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-symbolic-shapes/747`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Torch Inductor compiler`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);u(U,{code:`sglang_image%20%3D%20sglang_image.env(%7B%22TORCHINDUCTOR_COMPILE_THREADS%22%3A%20%221%22%7D)%0A`,lang:`python`});var W=o(U,4);l(W,{id:`sleeping-and-waking-an-sglang-server`,children:(e,t)=>{s(),i(e,r(`Sleeping and waking an SGLang server`))},$$slots:{default:!0}});var G=o(W,4),ve=o(e(G));f(ve,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=ie();s(),i(e,n)},$$slots:{default:!0}}),f(o(ve,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=ae();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(G);var ye=o(G,2);u(ye,{code:`with%20sglang_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20timeout%3D10%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A%0Adef%20sleep()%3A%0A%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Frelease_memory_occupation%22%2C%20json%3D%7B%7D%0A%20%20%20%20).raise_for_status()%0A%0A%0Adef%20wake_up()%3A%0A%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fresume_memory_occupation%22%2C%20json%3D%7B%7D%0A%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var be=o(ye,2);c(be,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var K=o(be,6),q=e(K),xe=e(q),Se=e(xe);f(Se,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),f(o(Se,2),{href:`https://modal.com/docs/reference/modal.App#cls`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the reference documentation`))},$$slots:{default:!0}}),s(),n(xe),n(q);var J=o(q,4),Ce=e(J);f(e(Ce),{href:`https://modal.com/docs/guide/concurrent-inputs`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(Ce),n(J);var we=o(J,2),Te=e(we);f(e(Te),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=ce();s(2),i(e,n)},$$slots:{default:!0}}),s(7),n(Te),n(we),n(K);var Ee=o(K,4);l(Ee,{id:`determining-autoscaling-policy-with-modalconcurrent`,children:(e,t)=>{s();var n=le();s(),i(e,n)},$$slots:{default:!0}});var Y=o(Ee,4);f(o(e(Y)),{href:`https://modal.com/docs/guide/concurrent-inputs`,rel:`nofollow`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(7),n(Y);var De=o(Y,2);u(De,{code:`TARGET_INPUTS%20%3D%2010%0AMAX_INPUTS%20%3D%201000%0A`,lang:`python`});var X=o(De,2);f(o(e(X)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LLM inference engine benchmarking`))},$$slots:{default:!0}}),s(),n(X);var Oe=o(X,2);l(Oe,{id:`controlling-container-lifecycles-with-modalenter`,children:(e,t)=>{s();var n=de();s(),i(e,n)},$$slots:{default:!0}});var ke=o(Oe,4);u(ke,{code:`def%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%205%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20raise%20TimeoutError(f%22SGLang%20server%20not%20ready%20within%20timeout%20of%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A`,lang:`python`});var Z=o(ke,4);u(Z,{code:`app%20%3D%20modal.App(name%3D%22example-sglang-snapshot%22)%0APORT%20%3D%208000%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%2C%20DG_CACHE_PATH%3A%20DG_CACHE_VOL%7D%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A)%0A%40modal.concurrent(target_inputs%3DTARGET_INPUTS%2C%20max_inputs%3DMAX_INPUTS)%0Aclass%20SGLang%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20the%20SGLang%20server%20and%20block%20until%20it%20is%20healthy%2C%20then%20warm%20it%20up%20and%20put%20it%20to%20sleep.%22%22%22%0A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tp%22%2C%20%20%23%20use%20all%20GPUs%20to%20split%20up%20tensor-parallel%20operations%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs%22%2C%20%20%23%20capture%20CUDA%20graphs%20up%20to%20batch%20sizes%20we're%20likely%20to%20observe%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BMAX_INPUTS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-running-requests%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BMAX_INPUTS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%20%20%23%20expose%20metrics%20endpoints%20for%20telemetry%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-memory-saver%22%2C%20%20%23%20enable%20offload%2C%20for%20snapshotting%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-weights-cpu-backup%22%2C%20%20%23%20enable%20offload%2C%20for%20snapshotting%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%20%20%23%20for%20snapshotting%0A%20%20%20%20%20%20%20%20sleep()%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20wake_up(self)%3A%0A%20%20%20%20%20%20%20%20wake_up()%0A%0A%20%20%20%20%40modal.web_server(%0A%20%20%20%20%20%20%20%20port%3DPORT%2C%20%20%23%20wrapped%20code%20must%20listen%20on%20this%20port%0A%20%20%20%20%20%20%20%20startup_timeout%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20can%20server%20startup%20take%3F%0A%20%20%20%20)%0A%20%20%20%20def%20serve(self)%3A%0A%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var Ae=o(Z,2);c(Ae,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var je=o(Ae,4);u(je,{code:`modal%20deploy%20sglang_snapshot.py`,lang:`bash`});var Me=o(je,4);c(Me,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var Q=o(Me,4);f(o(e(Q)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(Q);var Ne=o(Q,2);c(Ne,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Pe=o(Ne,6);u(Pe,{code:`modal%20run%20sglang_snapshot.py`,lang:`bash`});var Fe=o(Pe,6);u(Fe,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20SGLang().serve.get_web_url()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Explain%20the%20Singular%20Value%20Decomposition.%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A`,lang:`python`});var Ie=o(Fe,4);u(Ie,{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%0A%20%20%20%20model%3A%20str%2C%0A%20%20%20%20messages%3A%20list%2C%0A%20%20%20%20timeout%3A%20int%20%7C%20None%20%3D%20None%2C%0A)%20-%3E%20None%3A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20json%3D%7B%22messages%22%3A%20messages%2C%20%22model%22%3A%20model%7D%2C%0A%20%20%20%20%20%20%20%20timeout%3Dtimeout%2C%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20print((await%20resp.json())%5B%22choices%22%5D%5B0%5D%5B%22message%22%5D%5B%22content%22%5D)%0A%0A`,lang:`python`});var Le=o(Ie,2);l(Le,{id:`test-memory-snapshotting`,children:(e,t)=>{s(),i(e,r(`Test memory snapshotting`))},$$slots:{default:!0}});var $=o(Le,6);f(o(e($)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n($);var Re=o($,4);u(Re,{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20%23%20after%20deployment%2C%20we%20can%20use%20the%20class%20from%20anywhere%0A%20%20%20%20SGLang%20%3D%20modal.Cls.from_name(%22example-sglang-snapshot%22%2C%20%22SGLang%22)%0A%0A%20%20%20%20print(%22calling%20inference%20server%22)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20asyncio.run(probe(SGLang().serve.get_web_url()))%0A%20%20%20%20except%20modal.exception.NotFoundError%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22To%20take%20advantage%20of%20GPU%20snapshots%2C%20deploy%20first%20with%20modal%20deploy%20%7B__file__%7D%22%0A%20%20%20%20%20%20%20%20)%20from%20e%0A`,lang:`python`}),u(o(Re,4),{code:`python%20sglang_snapshot.py`,lang:`bash`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=UNtGUcuf2.js.map
