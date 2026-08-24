(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5d684654-c733-473e-b639-3231ebb71d2f`,e._sentryDebugIdIdentifier=`sentry-dbid-5d684654-c733-473e-b639-3231ebb71d2f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Low latency Nvidia Nemotron 3 with SGLang and Modal`,id:`low-latency-nvidia-nemotron-3-with-sglang-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Loading and cacheing the model weights`,id:`loading-and-cacheing-the-model-weights`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Selecting infrastructure to minimize latency`,id:`selecting-infrastructure-to-minimize-latency`},{depth:3,value:`Controlling container lifecycles with modal.Server`,id:`controlling-container-lifecycles-with-modalserver`},{depth:3,value:`Extra configuration`,id:`extra-configuration`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Low latency Nvidia Nemotron 3 with SGLang and Modal

In this example, we show how to serve Nvidia's [Nemotron](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/) models
on Modal at low latency with [SGLang](https://github.com/sgl-project/sglang).

The Nemotron models use sparse MoE matmuls and hybrid attention
(mixing Transformer and Mamba layers) to deliver
powerful capabilities in a model that's efficient to run.
You can read more in the paper [here](https://arxiv.org/abs/2512.20856).

This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both SGLang and Modal.
For a simpler introduction to LLM serving, see
[this example](https://modal.com/docs/examples/llm_inference).

To minimize routing overheads, we use a [Modal Server](https://modal.com/docs/guide/servers),
which uses a [low-latency routing service on Modal](https://modal.com/blog/serverless-servers)
designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/images).

We start from a container image provided
[by the SGLang team via Dockerhub](https://hub.docker.com/r/lmsysorg/sglang/tags).

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import json
import subprocess
import time

import aiohttp
import modal

MINUTES = 60  # seconds

sglang_image = (
    modal.Image.from_registry("lmsysorg/sglang:v0.5.11")
    .entrypoint(  # silence chatty logs on container start
        []
    )
    .run_commands(  # clean up Image
        "rm -rf /root/.cache/huggingface"
    )
)

\`\`\`

### Loading and cacheing the model weights

We'll serve [NVIDIA's Nemotron 3 Nano](https://arxiv.org/abs/2512.20856).
This model has 30 billion parameters, 3 billion of which are active per token.
For lower latency (in both [memory-bound](https://modal.com/gpu-glossary/perf/memory-bound)
and [compute-bound](https://modal.com/gpu-glossary/perf/compute-bound) settings),
we choose the version quantized to
[4 bit precision floating point](https://modal.com/llm-almanac/quant-formats).
This reduces the amount of data that needs to be loaded
[from GPU RAM into SM SRAM](https://modal.com/gpu-glossary/perf/memory-bandwidth)
in each forward pass.
Loading fewer bytes of model weights also speeds up [cold starts](https://modal.com/docs/guide/cold-start)
of our inference server.

\`\`\`python
MODEL_NAME = "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4"

\`\`\`

We load the model [from the Hugging Face Hub](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4).
Downloads from the Hub are much faster if you are authenticated.
So we add a Hugging Face token as a [Modal Secret](https://modal.com/docs/guide/secrets).
You can create a a Modal Secret with your Hugging Face token
[here](https://modal.com/secrets). Make sure to name if \`huggingface-secret\`!

\`\`\`python
hf_secret = modal.Secret.from_name("huggingface-secret")

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

We also choose a [GPU](https://modal.com/docs/guide/gpu) to deploy our inference server onto.
We choose the [B200 GPU](https://modal.com/blog/introducing-b200-h200),
which offers excellent price-performance
and supports both 8 bit and 4 bit [quantized floating point](https://modal.com/llm-almanac/quant-formats)
operations.

\`\`\`python
GPU_TYPE, N_GPUS = "B200", 1
GPU = f"{GPU_TYPE}:{N_GPUS}"

\`\`\`

## Define the inference server and infrastructure

### Selecting infrastructure to minimize latency

Minimizing latency requires geographic co-location of clients and servers.

So for low latency LLM inference services on Modal, you must select a
[cloud region](https://modal.com/docs/guide/region-selection)
for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a \`@app.server\`.

Here, we assume users are mostly in the northern half of the Americas
and select the \`us\` cloud region serve them.
This should result in at most a few dozen milliseconds of round-trip time.

\`\`\`python
REGION = "us"
ROUTING_REGION = "us-west"

\`\`\`

Latencies for multi-turn interactions with LLMs are
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
with the [\`target_concurrency\`](https://modal.com/docs/reference/modal.concurrent) parameter.

\`\`\`python
TARGET_INPUTS = 32

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

### Extra configuration

We add a few extra configuration variables for performance.

\`\`\`python
sglang_image = sglang_image.env(
    {
        "SAFETENSORS_FAST_GPU": "1",
        "NVIDIA_TF32_OVERRIDE": "1",
    }
)

server_args = [
    "--kv-cache-dtype",  # quantize the model's KV cache for a
    "fp8_e4m3",  # slight reduction in accuracy, major reduction in memory
]

\`\`\`

With all this in place, we are ready to define our high-performance, low-latency
Nemotron inference server.

\`\`\`python
app = modal.App(name="example-nemotron-inference")
PORT = 8000


@app.server(
    image=sglang_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL},
    compute_region=REGION,
    min_containers=MIN_CONTAINERS,
    secrets=[hf_secret],
    startup_timeout=20 * MINUTES,  # time to load weights
    port=PORT,  # wrapped code must listen on this port
    routing_region=ROUTING_REGION,  # location of proxies, should overlap with the container regions
    exit_grace_period=15,  # seconds, time to finish up requests when closing down
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class Server:
    @modal.enter()
    def startup(self):
        """Start the SGLang server and block until it is healthy, then warm it up."""

        cmd = (
            [
                "sglang",
                "serve",
                "--model-path",
                MODEL_NAME,
                "--served-model-name",
                MODEL_NAME,
                "--host",
                "0.0.0.0",
                "--port",
                f"{PORT}",
                "--tp",
                f"{N_GPUS}",
                "--cuda-graph-max-bs",  # only capture CUDA graphs for batch sizes we're likely to observe
                f"{TARGET_INPUTS * 2}",
                "--enable-metrics",  # expose metrics endpoints for telemetry
                "--decode-log-interval",  # how often to log during decoding, in tokens
                "10",
                "--trust-remote-code",
                "--tool-call-parser",
                "qwen3_coder",
                "--reasoning-parser",
                "nemotron_3",
            ]
            + server_args
        )

        self.process = subprocess.Popen(cmd)
        wait_ready(self.process)
        warmup()

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy nemotron_inference.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-nemotron-inference-server.us-east.modal.direct\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-nemotron-inference-server.us-east.modal.direct/docs\`.
These docs describe each route and indicate the expected input and output
and translate requests into \`curl\` commands.
For simple routes, you can even send a request directly from the docs page.

Note: when no replicas are available, Modal will respond with
the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503).
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the application and its containers on your [Modal dashboard](https://modal.com/apps).

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that hits the server with a simple client.

If you execute the command

\`\`\`bash
modal run nemotron_inference.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = await Server.get_url.aio()

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
        await probe(url, messages, timeout=10 * MINUTES)


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
This is header is used by clients Modal Servers
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
async def probe(url, messages=None, timeout=20 * MINUTES):
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
            chunk = delta.get("content") or delta.get("reasoning_content")

            if chunk:
                print(chunk, end="", flush="\\n" in chunk or "." in chunk)
                full_text += chunk
        print()  # newline after stream completes

\`\`\`
`,meta:{title:`Low latency Nvidia Nemotron 3 with SGLang and Modal`,description:`In this example, we show how to serve Nvidia’s Nemotron models on Modal at low latency with SGLang.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<code>target_concurrency</code>`),ae=t(`Controlling container lifecycles with <code>modal.Server</code>`,1),oe=t(`<code>@app.server</code>`),se=t(`<code>@modal.enter</code> and <code>@modal.exit</code>`,1),ce=t(`<code>requests</code> library`,1),le=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),ue=t(`<!> <p>In this example, we show how to serve Nvidia’s <!> models
on Modal at low latency with <!>.</p> <p>The Nemotron models use sparse MoE matmuls and hybrid attention
(mixing Transformer and Mamba layers) to deliver
powerful capabilities in a model that’s efficient to run.
You can read more in the paper <!>.</p> <p>This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both SGLang and Modal.
For a simpler introduction to LLM serving, see <!>.</p> <p>To minimize routing overheads, we use a <!>,
which uses a <!> designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.</p> <p>We start from a container image provided <!>.</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <!> <p>We’ll serve <!>.
This model has 30 billion parameters, 3 billion of which are active per token.
For lower latency (in both <!> and <!> settings),
we choose the version quantized to <!>.
This reduces the amount of data that needs to be loaded <!> in each forward pass.
Loading fewer bytes of model weights also speeds up <!> of our inference server.</p> <!> <p>We load the model <!>.
Downloads from the Hub are much faster if you are authenticated.
So we add a Hugging Face token as a <!>.
You can create a a Modal Secret with your Hugging Face token <!>. Make sure to name if <code>huggingface-secret</code>!</p> <!> <p>We don’t want to load the model from the Hub every time we start the server.
We can load it much faster from a <!>.
Typical speeds are around one to two GB/s.</p> <!> <p>In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also <!>,
which can fully saturate our network bandwidth.</p> <!> <p>We also choose a <!> to deploy our inference server onto.
We choose the <!>,
which offers excellent price-performance
and supports both 8 bit and 4 bit <!> operations.</p> <!> <!> <!> <p>Minimizing latency requires geographic co-location of clients and servers.</p> <p>So for low latency LLM inference services on Modal, you must select a <!> for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a <code>@app.server</code>.</p> <p>Here, we assume users are mostly in the northern half of the Americas
and select the <code>us</code> cloud region serve them.
This should result in at most a few dozen milliseconds of round-trip time.</p> <!> <p>Latencies for multi-turn interactions with LLMs are
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
with the <!> parameter.</p> <!> <p>Generally, this choice needs to be made as part of <!>.</p> <!> <p>We wrap up all of the choices we made about the infrastructure
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
send it a few test inputs.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <!> <p>We add a few extra configuration variables for performance.</p> <!> <p>With all this in place, we are ready to define our high-performance, low-latency
Nemotron inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-nemotron-inference-server.us-east.modal.direct</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-nemotron-inference-server.us-east.modal.direct/docs</code>.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.
For simple routes, you can even send a request directly from the docs page.</p> <p>Note: when no replicas are available, Modal will respond with
the <!>.
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the application and its containers on your <!>.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>This test relies on the two helper functions below,
which ping the server and wait for a valid response to stream.</p> <p>The <code>probe</code> helper function specifically ignores
two types of errors that can occur while a replica
is starting up — timeouts on the client and 5XX responses from the server.
Modal returns the <!> when a Modal Server has no live replicas.</p> <p>We include a header with each request — <code>Modal-Session-ID</code>.
This is header is used by clients Modal Servers
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
This ensures no container ends up as a “hot spot” handling too many client requests.</p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`low-latency-nvidia-nemotron-3-with-sglang-and-modal`,children:(e,t)=>{s(),i(e,r(`Low latency Nvidia Nemotron 3 with SGLang and Modal`))},$$slots:{default:!0}});var p=o(d,2),m=o(e(p));f(m,{href:`https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Nemotron`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://github.com/sgl-project/sglang`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SGLang`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2);f(o(e(h)),{href:`https://arxiv.org/abs/2512.20856`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2),de=o(e(_));f(de,{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Server`))},$$slots:{default:!0}}),f(o(de,2),{href:`https://modal.com/blog/serverless-servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`low-latency routing service on Modal`))},$$slots:{default:!0}}),s(),n(_);var fe=o(_,2);c(fe,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var v=o(fe,2);f(o(e(v)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);f(o(e(y)),{href:`https://hub.docker.com/r/lmsysorg/sglang/tags`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`by the SGLang team via Dockerhub`))},$$slots:{default:!0}}),s(),n(y);var pe=o(y,4);u(pe,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Asglang_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Av0.5.11%22)%0A%20%20%20%20.entrypoint(%20%20%23%20silence%20chatty%20logs%20on%20container%20start%0A%20%20%20%20%20%20%20%20%5B%5D%0A%20%20%20%20)%0A%20%20%20%20.run_commands(%20%20%23%20clean%20up%20Image%0A%20%20%20%20%20%20%20%20%22rm%20-rf%20%2Froot%2F.cache%2Fhuggingface%22%0A%20%20%20%20)%0A)%0A`,lang:`python`});var me=o(pe,2);l(me,{id:`loading-and-cacheing-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Loading and cacheing the model weights`))},$$slots:{default:!0}});var b=o(me,2),he=o(e(b));f(he,{href:`https://arxiv.org/abs/2512.20856`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVIDIA’s Nemotron 3 Nano`))},$$slots:{default:!0}});var ge=o(he,2);f(ge,{href:`https://modal.com/gpu-glossary/perf/memory-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory-bound`))},$$slots:{default:!0}});var x=o(ge,2);f(x,{href:`https://modal.com/gpu-glossary/perf/compute-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`compute-bound`))},$$slots:{default:!0}});var S=o(x,2);f(S,{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`4 bit precision floating point`))},$$slots:{default:!0}});var C=o(S,2);f(C,{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from GPU RAM into SM SRAM`))},$$slots:{default:!0}}),f(o(C,2),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cold starts`))},$$slots:{default:!0}}),s(),n(b);var w=o(b,2);u(w,{code:`MODEL_NAME%20%3D%20%22nvidia%2FNVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4%22%0A`,lang:`python`});var T=o(w,2),E=o(e(T));f(E,{href:`https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from the Hugging Face Hub`))},$$slots:{default:!0}});var D=o(E,2);f(D,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),f(o(D,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(3),n(T);var O=o(T,2);u(O,{code:`hf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A`,lang:`python`});var k=o(O,2);f(o(e(k)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2);u(A,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0AMODEL_PATH%20%3D%20f%22%7BHF_CACHE_PATH%7D%2F%7BMODEL_NAME%7D%22%0A`,lang:`python`});var j=o(A,2);f(o(e(j)),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`turn on “high performance” downloads`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,2);u(M,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var N=o(M,2),P=o(e(N));f(P,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU`))},$$slots:{default:!0}});var F=o(P,2);f(F,{href:`https://modal.com/blog/introducing-b200-h200`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`B200 GPU`))},$$slots:{default:!0}}),f(o(F,2),{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`quantized floating point`))},$$slots:{default:!0}}),s(),n(N);var I=o(N,2);u(I,{code:`GPU_TYPE%2C%20N_GPUS%20%3D%20%22B200%22%2C%201%0AGPU%20%3D%20f%22%7BGPU_TYPE%7D%3A%7BN_GPUS%7D%22%0A`,lang:`python`});var L=o(I,2);c(L,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var R=o(L,2);l(R,{id:`selecting-infrastructure-to-minimize-latency`,children:(e,t)=>{s(),i(e,r(`Selecting infrastructure to minimize latency`))},$$slots:{default:!0}});var z=o(R,4);f(o(e(z)),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cloud region`))},$$slots:{default:!0}}),s(3),n(z);var B=o(z,4);u(B,{code:`REGION%20%3D%20%22us%22%0AROUTING_REGION%20%3D%20%22us-west%22%0A`,lang:`python`});var V=o(B,2);f(o(e(V)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);f(o(e(H)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“cold start”`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,6);u(U,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20to%20ensure%20one%20replica%20is%20always%20ready%0A`,lang:`python`});var W=o(U,4);f(o(e(W)),{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(W);var _e=o(W,2);u(_e,{code:`TARGET_INPUTS%20%3D%2032%0A`,lang:`python`});var G=o(_e,2);f(o(e(G)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LLM inference engine benchmarking`))},$$slots:{default:!0}}),s(),n(G);var ve=o(G,2);l(ve,{id:`controlling-container-lifecycles-with-modalserver`,children:(e,t)=>{s();var n=ae();s(),i(e,n)},$$slots:{default:!0}});var K=o(ve,6),q=e(K),ye=e(q),be=e(ye);f(be,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),f(o(be,4),{href:`https://modal.com/docs/reference/modal.App#server`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the reference documentation`))},$$slots:{default:!0}}),s(),n(ye),n(q);var xe=o(q,2),Se=e(xe);f(e(Se),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=se();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(Se),n(xe),n(K);var J=o(K,4),Ce=o(e(J));f(Ce,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=ce();s(),i(e,n)},$$slots:{default:!0}}),f(o(Ce,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=le();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(J);var we=o(J,2);u(we,{code:`with%20sglang_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%2020%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22SGLang%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20timeout%3D10%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var Te=o(we,2);l(Te,{id:`extra-configuration`,children:(e,t)=>{s(),i(e,r(`Extra configuration`))},$$slots:{default:!0}});var Ee=o(Te,4);u(Ee,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22SAFETENSORS_FAST_GPU%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22NVIDIA_TF32_OVERRIDE%22%3A%20%221%22%2C%0A%20%20%20%20%7D%0A)%0A%0Aserver_args%20%3D%20%5B%0A%20%20%20%20%22--kv-cache-dtype%22%2C%20%20%23%20quantize%20the%20model's%20KV%20cache%20for%20a%0A%20%20%20%20%22fp8_e4m3%22%2C%20%20%23%20slight%20reduction%20in%20accuracy%2C%20major%20reduction%20in%20memory%0A%5D%0A`,lang:`python`});var De=o(Ee,4);u(De,{code:`app%20%3D%20modal.App(name%3D%22example-nemotron-inference%22)%0APORT%20%3D%208000%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20startup_timeout%3D20%20*%20MINUTES%2C%20%20%23%20time%20to%20load%20weights%0A%20%20%20%20port%3DPORT%2C%20%20%23%20wrapped%20code%20must%20listen%20on%20this%20port%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%20%20%23%20location%20of%20proxies%2C%20should%20overlap%20with%20the%20container%20regions%0A%20%20%20%20exit_grace_period%3D15%2C%20%20%23%20seconds%2C%20time%20to%20finish%20up%20requests%20when%20closing%20down%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20the%20SGLang%20server%20and%20block%20until%20it%20is%20healthy%2C%20then%20warm%20it%20up.%22%22%22%0A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22sglang%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--tp%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs%22%2C%20%20%23%20only%20capture%20CUDA%20graphs%20for%20batch%20sizes%20we're%20likely%20to%20observe%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BTARGET_INPUTS%20*%202%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%20%20%23%20expose%20metrics%20endpoints%20for%20telemetry%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--decode-log-interval%22%2C%20%20%23%20how%20often%20to%20log%20during%20decoding%2C%20in%20tokens%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2210%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--trust-remote-code%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22qwen3_coder%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--reasoning-parser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22nemotron_3%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20server_args%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var Oe=o(De,2);c(Oe,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var ke=o(Oe,4);u(ke,{code:`modal%20deploy%20nemotron_inference.py`,lang:`bash`});var Ae=o(ke,4);c(Ae,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var Y=o(Ae,4);f(o(e(Y)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(Y);var X=o(Y,2),je=o(e(X));f(je,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),f(o(je,2),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n(X);var Me=o(X,2);c(Me,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Z=o(Me,6);u(Z,{code:`modal%20run%20nemotron_inference.py`,lang:`bash`});var Ne=o(Z,6);u(Ne,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20Server.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Explain%20the%20Singular%20Value%20Decomposition.%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D10%20*%20MINUTES)%0A%0A`,lang:`python`});var Q=o(Ne,4);f(o(e(Q),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,4);f(o(e($)),{href:`https://cordero.me/understanding-raid-rebalance-ensuring-optimal-performance-and-data-protection/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RAID rebalancing`))},$$slots:{default:!0}}),s(),n($),u(o($,2),{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D20%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20this%20to%20some%20string%20per%20multi-turn%20interaction%0A%20%20%20%20%23%20often%20a%20UUID%20per%20%22conversation%22%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Server-Sent%20Events%20format%3A%20%22data%3A%20....%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20ignore%20any%20non-JSON%20keepalive%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%20or%20delta.get(%22reasoning_content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%20%20%23%20newline%20after%20stream%20completes%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=C0Awu5MU.js.map
