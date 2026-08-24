(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`537448bf-4307-48d9-889b-fa9c284f4a19`,e._sentryDebugIdIdentifier=`sentry-dbid-537448bf-4307-48d9-889b-fa9c284f4a19`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Low Latency, Serverless LFM2 with vLLM and Modal`,id:`low-latency-serverless-lfm2-with-vllm-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Selecting the GPU`,id:`selecting-the-gpu`},{depth:3,value:`Loading and caching the model weights`,id:`loading-and-caching-the-model-weights`},{depth:3,value:`Caching compilation artifacts`,id:`caching-compilation-artifacts`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Selecting infrastructure to minimize latency`,id:`selecting-infrastructure-to-minimize-latency`}]},{depth:2,value:`Speed up cold starts with GPU snapshotting`,id:`speed-up-cold-starts-with-gpu-snapshotting`,children:[{depth:3,value:`Sleeping and waking a vLLM server`,id:`sleeping-and-waking-a-vllm-server`},{depth:3,value:`Controlling container lifecycles with modal.Server`,id:`controlling-container-lifecycles-with-modalserver`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`,children:[{depth:3,value:`Test memory snapshotting`,id:`test-memory-snapshotting`}]}]}],rawContent:`# Low Latency, Serverless LFM2 with vLLM and Modal

In this example, we show how to serve Liquid AI's [LFM2 models](https://www.liquid.ai/liquid-foundation-models)
with [vLLM](https://docs.vllm.ai) with low latency and fast cold starts on Modal.

The LFM2 models are not vanilla Transformers -- they have a hybrid architecture,
discovered via an architecture search that optimized for quality, latency, and memory footprint.
Check out their [technical report](https://arxiv.org/abs/2511.23404v1)
for more details.

Here, we run the [24B-A2B variant](https://huggingface.co/LiquidAI/LFM2-24B-A2B) of LFM2,
described [here](https://www.liquid.ai/blog/lfm2-24b-a2b). This variant is designed
for efficient inference and includes instruction tuning.
It is released under the weights-available [LFM 1.0 License](https://huggingface.co/LiquidAI/LFM2-24B-A2B/blob/main/LICENSE),
which restricts commercial use for entities with over $10M in revenue.

This example demonstrates techniques to run inference at high efficiency,
including advanced features of both vLLM and Modal.
For a simpler introduction to LLM serving, see
[this example](https://modal.com/docs/examples/llm_inference).

To minimize routing overheads, we use \`@app.server\`,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.

We also include instructions for cutting cold start times using Modal's
[CPU + GPU memory snapshots](https://modal.com/docs/guide/memory-snapshot).

Fast cold starts are particularly useful for LLM inference applications
that have highly "bursty" workloads, like document processing.
See [this guide](https://modal.com/docs/guide/high-performance-llm-inference)
for a breakdown of different LLM inference workloads and how to optimize them.

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/images).
We'll use the [vLLM inference server](https://docs.vllm.ai).

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import json
import os
import subprocess
import time

import aiohttp
import modal
from modal.server import Server

MINUTES = 60

MODEL_NAME = os.environ.get("MODEL_NAME", "LiquidAI/LFM2-24B-A2B")
print(f"Running deployment script for model: {MODEL_NAME}")

vllm_image = (
    modal.Image.from_registry("vllm/vllm-openai:v0.15.1")
    .entrypoint([])
    .run_commands("ln -s $(which python3) /usr/bin/python")
    .pip_install("transformers==5.1.0")
    .env(
        {
            "HF_HUB_CACHE": "/root/.cache/huggingface",
            "HF_XET_HIGH_PERFORMANCE": "1",
            "VLLM_SERVER_DEV_MODE": "1",
            "TORCH_CPP_LOG_LEVEL": "FATAL",
            "MODEL_NAME": MODEL_NAME,
        }
    )
)

\`\`\`

### Selecting the GPU

We choose the [H100 GPU](https://modal.com/blog/introducing-h100),
which offers excellent price-performance and has sufficient VRAM to store the models.

\`\`\`python
N_GPU = 1
GPU = "H100"

\`\`\`

### Loading and caching the model weights

We don't want to load the model from the Hub every time we start the server.
We can load it much faster from a [Modal Volume](https://modal.com/docs/guide/volumes).
Typical speeds are around one to two GB/s.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

\`\`\`

In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also
[turn on "high performance" downloads](https://huggingface.co/docs/hub/en/models-downloading#faster-downloads),
which can fully saturate our network bandwidth,
and provide an \`HF_TOKEN\` via a [Modal Secret](https://modal.com/docs/guide/secrets)
so that our downloads aren't throttled.
You'll need to create a Secret named \`huggingface-secret\`
with your token [here](https://modal.com/apps/secrets).

\`\`\`python
hf_secret = modal.Secret.from_name("huggingface-secret")

\`\`\`

### Caching compilation artifacts

Model weights aren't the only thing we want to cache.
vLLM also produces compilation artifacts that we want to persist across restarts.

\`\`\`python
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

\`\`\`

## Define the inference server and infrastructure

### Selecting infrastructure to minimize latency

Minimizing latency requires geographic co-location of clients and servers.

So for low latency LLM inference services on Modal, you must select a
[cloud region](https://modal.com/docs/guide/region-selection)
for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a \`app.server\`.

Here, we assume users are mostly in the northern half of the Americas
and select the \`us-east\` cloud region to serve them.
This should result in at most a few dozen milliseconds of round-trip time.

\`\`\`python
REGION = "us-east"

\`\`\`

For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a "warm" or "live" replica reduces latency by skipping slow initialization work
that occurs when new replica boots up (a ["cold start"](https://modal.com/docs/guide/cold-start)).
For LLM inference servers, that latency runs from seconds to minutes.

However, since this is documentation code, we'll set the \`min_containers\` of our Modal Function
to \`0\` to avoid surprise bills during casual use.

\`\`\`python
MIN_CONTAINERS = 0

\`\`\`

Finally, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users' requests will queue
when the server becomes overloaded. Even apart from queueing, responses
generally become slower per user above a certain minimum number of
concurrent requests.

So we set a target for the number of inputs to run on a single container
with [\`target_concurrency\`](https://modal.com/docs/reference/modal.concurrent) parameter.
For details, see [the guide](https://modal.com/docs/guide/concurrent-inputs).

Generally, this choice needs to be made as part of
[LLM inference engine benchmarking](https://modal.com/llm-almanac/how-to-benchmark).

\`\`\`python
TARGET_INPUTS = 32
MAX_INPUTS = 100

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

vLLM supports a sleep mode that allows us to leverage Modal's
[CPU + GPU memory snapshots](https://modal.com/docs/guide/memory-snapshot)
for dramatically faster cold starts.

When \`enable_memory_snapshot=True\` and \`experimental_options={"enable_gpu_snapshot": True}\`
are set on the class, Modal captures both CPU and GPU memory state.
The \`@modal.enter(snap=True)\` method runs before the snapshot is taken:
we start vLLM, wait for it to be ready, warm it up, then put it to sleep.
The \`@modal.enter(snap=False)\` method runs after restoring from snapshot:
we wake vLLM back up so it can serve requests immediately.

### Sleeping and waking a vLLM server

We prepare our vLLM inference server for snapshotting by first sending
a few requests to "warm it up", ensuring that it is fully ready to process requests.
Then we "put it to sleep", moving non-essential data out of GPU memory,
with a request to \`/sleep\`. At this point, we can take a memory snapshot.
Upon snapshot restoration, we "wake up" the server with a request to \`/wake_up\`.

We use the [\`requests\` library](https://requests.readthedocs.io/en/latest/)
to send ourselves these HTTP requests on
[\`localhost\`/\`127.0.0.1\`](https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1).

\`\`\`python
VLLM_PORT = 8000

with vllm_image.imports():
    import requests


def wait_ready(process: subprocess.Popen, timeout: int = 15 * MINUTES):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            check_running(process)
            requests.get(f"http://127.0.0.1:{VLLM_PORT}/health").raise_for_status()
            return
        except (
            subprocess.CalledProcessError,
            requests.exceptions.ConnectionError,
            requests.exceptions.HTTPError,
        ):
            time.sleep(5)
    raise TimeoutError(f"vLLM server not ready within {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


def warmup():
    payload = {
        "model": "llm",
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{VLLM_PORT}/v1/chat/completions",
            json=payload,
            timeout=60,
        ).raise_for_status()


def sleep(level: int = 1):
    requests.post(
        f"http://127.0.0.1:{VLLM_PORT}/sleep?level={level}"
    ).raise_for_status()


def wake_up():
    requests.post(f"http://127.0.0.1:{VLLM_PORT}/wake_up").raise_for_status()


\`\`\`

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
The \`snap=True\`/\`snap=False\` distinction controls which methods run before/after a memory snapshot.

Modal considers a new replica ready to receive inputs once the \`modal.enter\` methods have exited
and the container accepts connections.

With all this in place, we are ready to define our high-performance, low-latency
LFM 2 inference server.

\`\`\`python
app = modal.App("example-server-lfm-snapshot")


@app.server(
    image=vllm_image,
    gpu=GPU,
    scaledown_window=5 * MINUTES,
    startup_timeout=15 * MINUTES,
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
    secrets=[hf_secret],
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
    compute_region=REGION,
    min_containers=MIN_CONTAINERS,
    port=VLLM_PORT,
    routing_region=REGION,
    exit_grace_period=5,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class LfmVllmInference:
    @modal.enter(snap=True)
    def startup(self):
        """Start the vLLM server and block until it is healthy, then warm it up and put it to sleep."""
        cmd = [
            "vllm",
            "serve",
            MODEL_NAME,
            "--served-model-name",
            MODEL_NAME,
            "--served-model-name",
            "llm",
            "--host",
            "0.0.0.0",
            "--port",
            f"{VLLM_PORT}",
            "--dtype",
            "bfloat16",
            "--gpu-memory-utilization",
            "0.8",
            "--max-num-seqs",
            f"{MAX_INPUTS}",
            "--max-cudagraph-capture-size",
            f"{MAX_INPUTS}",
            "--enable-sleep-mode",
        ]

        print(*cmd)
        self.process = subprocess.Popen(cmd)
        wait_ready(self.process)
        warmup()
        sleep(level=1)

    @modal.enter(snap=False)
    def restore(self):
        """Wake vLLM from sleep mode after restoring from a memory snapshot."""
        wake_up()

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy lfm_snapshot.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-lfm-snapshot-lfmvllminference.us-east.modal.direct\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-lfm-snapshot-lfmvllminference.us-east.modal.direct/docs\`.
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
modal run lfm_snapshot.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = await LfmVllmInference.get_url.aio()

    if prompt is None:
        prompt = "List every country and its capital."

    messages = [
        {"role": "user", "content": prompt},
    ]

    await probe(url, messages, timeout=test_timeout)
    if twice:
        messages = [
            {
                "role": "user",
                "content": "List every country and its capital in Chinese.",
            }
        ]
        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await probe(url, messages, timeout=1 * MINUTES)


\`\`\`

This test relies on the \`probe\` helper function below,
which ping the server and wait for a valid response to stream.

The \`probe\` helper function specifically ignores
two types of errors that can occur while a replica
is starting up -- timeouts on the client and 5XX responses from the server.
Modal returns the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
when a Server has no live replicas.

We include a header with each request --
\`Modal-Session-ID\`.
The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Note that this header is only compatible with
Modal Servers, not [Modal Web Functions](https://modal.com/docs/guide/webhooks).

\`\`\`python
async def probe(url, messages=None, timeout=5 * MINUTES):
    if messages is None:
        messages = [{"role": "user", "content": "Tell me a joke."}]

    client_id = str(0)  # set this yourself based on KV cache hit-rate
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
    payload = {"model": "llm", "messages": messages, "stream": True}
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

            if not line.startswith("data:"):
                continue

            data = line[len("data:") :].strip()
            if data == "[DONE]":
                break

            try:
                evt = json.loads(data)
            except json.JSONDecodeError:
                continue

            delta = (evt.get("choices") or [{}])[0].get("delta") or {}
            chunk = delta.get("content")

            if chunk:
                print(chunk, end="", flush="\\n" in chunk or "." in chunk)
                full_text += chunk
        print()


\`\`\`

### Test memory snapshotting

Using \`modal run\` creates an ephemeral Modal App,
rather than a deployed Modal App.
Ephemeral Modal Apps are short-lived,
so they turn off snapshotting.

To test the memory snapshot version of the server,
first deploy it with \`modal deploy\`
and then hit it with a client.

You should observe startup improvements
after a handful of cold starts
(usually less than five).
If you want to see the speedup during a test,
we recommend heading to the deployed App in your
[Modal dashboard](https://modal.com/apps)
and manually stopping containers after they have served a request.

You can use the client code below to test the endpoint.
It can be run with the command

\`\`\`
python lfm_snapshot.py
\`\`\`

\`\`\`python
if __name__ == "__main__":
    LfmVllmInference = Server.from_name(
        "example-server-lfm-snapshot", "LfmVllmInference"
    )

    async def main():
        url = await LfmVllmInference.get_url.aio()
        messages = [{"role": "user", "content": "Tell me ten jokes."}]
        await probe(url, messages, timeout=10 * MINUTES)

    try:
        print("calling inference server")
        asyncio.run(main())
    except modal.exception.NotFoundError as e:
        raise Exception(
            f"To take advantage of GPU snapshots, deploy first with modal deploy {__file__}"
        ) from e

\`\`\`
`,meta:{title:`Low Latency, Serverless LFM2 with vLLM and Modal`,description:`In this example, we show how to serve Liquid AI’s LFM2 models with vLLM with low latency and fast cold starts on Modal.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<code>target_concurrency</code>`),ae=t(`<code>requests</code> library`,1),oe=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),se=t(`Controlling container lifecycles with <code>modal.Server</code>`,1),ce=t(`<code>@app.server</code>`),le=t(`<code>@modal.enter</code> and <code>@modal.exit</code>`,1),ue=t(`<!> <p>In this example, we show how to serve Liquid AI’s <!> with <!> with low latency and fast cold starts on Modal.</p> <p>The LFM2 models are not vanilla Transformers — they have a hybrid architecture,
discovered via an architecture search that optimized for quality, latency, and memory footprint.
Check out their <!> for more details.</p> <p>Here, we run the <!> of LFM2,
described <!>. This variant is designed
for efficient inference and includes instruction tuning.
It is released under the weights-available <!>,
which restricts commercial use for entities with over $10M in revenue.</p> <p>This example demonstrates techniques to run inference at high efficiency,
including advanced features of both vLLM and Modal.
For a simpler introduction to LLM serving, see <!>.</p> <p>To minimize routing overheads, we use <code>@app.server</code>,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.</p> <p>We also include instructions for cutting cold start times using Modal’s <!>.</p> <p>Fast cold starts are particularly useful for LLM inference applications
that have highly “bursty” workloads, like document processing.
See <!> for a breakdown of different LLM inference workloads and how to optimize them.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.
We’ll use the <!>.</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <!> <p>We choose the <!>,
which offers excellent price-performance and has sufficient VRAM to store the models.</p> <!> <!> <p>We don’t want to load the model from the Hub every time we start the server.
We can load it much faster from a <!>.
Typical speeds are around one to two GB/s.</p> <!> <p>In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also <!>,
which can fully saturate our network bandwidth,
and provide an <code>HF_TOKEN</code> via a <!> so that our downloads aren’t throttled.
You’ll need to create a Secret named <code>huggingface-secret</code> with your token <!>.</p> <!> <!> <p>Model weights aren’t the only thing we want to cache.
vLLM also produces compilation artifacts that we want to persist across restarts.</p> <!> <!> <!> <p>Minimizing latency requires geographic co-location of clients and servers.</p> <p>So for low latency LLM inference services on Modal, you must select a <!> for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a <code>app.server</code>.</p> <p>Here, we assume users are mostly in the northern half of the Americas
and select the <code>us-east</code> cloud region to serve them.
This should result in at most a few dozen milliseconds of round-trip time.</p> <!> <p>For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a “warm” or “live” replica reduces latency by skipping slow initialization work
that occurs when new replica boots up (a <!>).
For LLM inference servers, that latency runs from seconds to minutes.</p> <p>However, since this is documentation code, we’ll set the <code>min_containers</code> of our Modal Function
to <code>0</code> to avoid surprise bills during casual use.</p> <!> <p>Finally, we need to decide how we will scale up and down replicas
in response to load. Without autoscaling, users’ requests will queue
when the server becomes overloaded. Even apart from queueing, responses
generally become slower per user above a certain minimum number of
concurrent requests.</p> <p>So we set a target for the number of inputs to run on a single container
with <!> parameter.
For details, see <!>.</p> <p>Generally, this choice needs to be made as part of <!>.</p> <!> <!> <p>Modal is a serverless compute platform, so all of your
inference services automatically scale up and down to handle
variable load.</p> <p>Scaling up a new replica requires quite a bit of work —
loading up Python and system packages, loading model weights,
setting up the inference engine, and so on.</p> <p>We can skip over and speed up a bunch of this work
when spinning up new replicas after the first
by directly booting from a <!>,
which contains the exact in-memory representation of our server just before it begins taking requests.</p> <p>Most applications can be snapshot and experience substantial speedups (2x to 10x,
see <!>).
However, it generally requires some extra work to adapt the application code.</p> <p>vLLM supports a sleep mode that allows us to leverage Modal’s <!> for dramatically faster cold starts.</p> <p>When <code>enable_memory_snapshot=True</code> and <code>experimental_options=&#123;"enable_gpu_snapshot": True&#125;</code> are set on the class, Modal captures both CPU and GPU memory state.
The <code>@modal.enter(snap=True)</code> method runs before the snapshot is taken:
we start vLLM, wait for it to be ready, warm it up, then put it to sleep.
The <code>@modal.enter(snap=False)</code> method runs after restoring from snapshot:
we wake vLLM back up so it can serve requests immediately.</p> <!> <p>We prepare our vLLM inference server for snapshotting by first sending
a few requests to “warm it up”, ensuring that it is fully ready to process requests.
Then we “put it to sleep”, moving non-essential data out of GPU memory,
with a request to <code>/sleep</code>. At this point, we can take a memory snapshot.
Upon snapshot restoration, we “wake up” the server with a request to <code>/wake_up</code>.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <!> <p>We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.</p> <p>The key decorators are:</p> <ul><li><p><!> to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
This decorator also turns our python code into an HTTP server (i.e. fronting all of our containers with a proxy with a URL).
The wrapped code needs to eventually listen for HTTP connections on the provided <code>port</code>.
See <!> for details.</p></li> <li><p><!> to indicate
which methods of the class should be run when starting the server and shutting it down.
The <code>snap=True</code>/<code>snap=False</code> distinction controls which methods run before/after a memory snapshot.</p></li></ul> <p>Modal considers a new replica ready to receive inputs once the <code>modal.enter</code> methods have exited
and the container accepts connections.</p> <p>With all this in place, we are ready to define our high-performance, low-latency
LFM 2 inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-lfm-snapshot-lfmvllminference.us-east.modal.direct</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-lfm-snapshot-lfmvllminference.us-east.modal.direct/docs</code>.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.
For simple routes, you can even send a request directly from the docs page.</p> <p>Note: when no replicas are available, Modal will respond with
the <!>.
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the application and its containers on your <!>.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>This test relies on the <code>probe</code> helper function below,
which ping the server and wait for a valid response to stream.</p> <p>The <code>probe</code> helper function specifically ignores
two types of errors that can occur while a replica
is starting up — timeouts on the client and 5XX responses from the server.
Modal returns the <!> when a Server has no live replicas.</p> <p>We include a header with each request — <code>Modal-Session-ID</code>.
The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Note that this header is only compatible with
Modal Servers, not <!>.</p> <!> <!> <p>Using <code>modal run</code> creates an ephemeral Modal App,
rather than a deployed Modal App.
Ephemeral Modal Apps are short-lived,
so they turn off snapshotting.</p> <p>To test the memory snapshot version of the server,
first deploy it with <code>modal deploy</code> and then hit it with a client.</p> <p>You should observe startup improvements
after a handful of cold starts
(usually less than five).
If you want to see the speedup during a test,
we recommend heading to the deployed App in your <!> and manually stopping containers after they have served a request.</p> <p>You can use the client code below to test the endpoint.
It can be run with the command</p> <!> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`low-latency-serverless-lfm2-with-vllm-and-modal`,children:(e,t)=>{s(),i(e,r(`Low Latency, Serverless LFM2 with vLLM and Modal`))},$$slots:{default:!0}});var p=o(d,2),m=o(e(p));f(m,{href:`https://www.liquid.ai/liquid-foundation-models`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LFM2 models`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://docs.vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2);f(o(e(h)),{href:`https://arxiv.org/abs/2511.23404v1`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`technical report`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2),_=o(e(g));f(_,{href:`https://huggingface.co/LiquidAI/LFM2-24B-A2B`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`24B-A2B variant`))},$$slots:{default:!0}});var de=o(_,2);f(de,{href:`https://www.liquid.ai/blog/lfm2-24b-a2b`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),f(o(de,2),{href:`https://huggingface.co/LiquidAI/LFM2-24B-A2B/blob/main/LICENSE`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LFM 1.0 License`))},$$slots:{default:!0}}),s(),n(g);var v=o(g,2);f(o(e(v)),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,4);f(o(e(y)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshots`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,2);f(o(e(b)),{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(b);var fe=o(b,2);c(fe,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var x=o(fe,2),pe=o(e(x));f(pe,{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}}),f(o(pe,2),{href:`https://docs.vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM inference server`))},$$slots:{default:!0}}),s(),n(x);var me=o(x,4);u(me,{code:`import%20asyncio%0Aimport%20json%0Aimport%20os%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0Afrom%20modal.server%20import%20Server%0A%0AMINUTES%20%3D%2060%0A%0AMODEL_NAME%20%3D%20os.environ.get(%22MODEL_NAME%22%2C%20%22LiquidAI%2FLFM2-24B-A2B%22)%0Aprint(f%22Running%20deployment%20script%20for%20model%3A%20%7BMODEL_NAME%7D%22)%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22vllm%2Fvllm-openai%3Av0.15.1%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.run_commands(%22ln%20-s%20%24(which%20python3)%20%2Fusr%2Fbin%2Fpython%22)%0A%20%20%20%20.pip_install(%22transformers%3D%3D5.1.0%22)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HUB_CACHE%22%3A%20%22%2Froot%2F.cache%2Fhuggingface%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22VLLM_SERVER_DEV_MODE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22TORCH_CPP_LOG_LEVEL%22%3A%20%22FATAL%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22MODEL_NAME%22%3A%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var he=o(me,2);l(he,{id:`selecting-the-gpu`,children:(e,t)=>{s(),i(e,r(`Selecting the GPU`))},$$slots:{default:!0}});var S=o(he,2);f(o(e(S)),{href:`https://modal.com/blog/introducing-h100`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H100 GPU`))},$$slots:{default:!0}}),s(),n(S);var ge=o(S,2);u(ge,{code:`N_GPU%20%3D%201%0AGPU%20%3D%20%22H100%22%0A`,lang:`python`});var _e=o(ge,2);l(_e,{id:`loading-and-caching-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Loading and caching the model weights`))},$$slots:{default:!0}});var C=o(_e,2);f(o(e(C)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);u(w,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var T=o(w,2),E=o(e(T));f(E,{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`turn on “high performance” downloads`))},$$slots:{default:!0}});var D=o(E,4);f(D,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),f(o(D,4),{href:`https://modal.com/apps/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(T);var O=o(T,2);u(O,{code:`hf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A`,lang:`python`});var k=o(O,2);l(k,{id:`caching-compilation-artifacts`,children:(e,t)=>{s(),i(e,r(`Caching compilation artifacts`))},$$slots:{default:!0}});var A=o(k,4);u(A,{code:`vllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var j=o(A,2);c(j,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var M=o(j,2);l(M,{id:`selecting-infrastructure-to-minimize-latency`,children:(e,t)=>{s(),i(e,r(`Selecting infrastructure to minimize latency`))},$$slots:{default:!0}});var N=o(M,4);f(o(e(N)),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cloud region`))},$$slots:{default:!0}}),s(3),n(N);var P=o(N,4);u(P,{code:`REGION%20%3D%20%22us-east%22%0A`,lang:`python`});var F=o(P,2);f(o(e(F)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“cold start”`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,4);u(I,{code:`MIN_CONTAINERS%20%3D%200%0A`,lang:`python`});var L=o(I,4),R=o(e(L));f(R,{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),f(o(R,2),{href:`https://modal.com/docs/guide/concurrent-inputs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the guide`))},$$slots:{default:!0}}),s(),n(L);var z=o(L,2);f(o(e(z)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LLM inference engine benchmarking`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,2);u(B,{code:`TARGET_INPUTS%20%3D%2032%0AMAX_INPUTS%20%3D%20100%0A`,lang:`python`});var V=o(B,2);c(V,{id:`speed-up-cold-starts-with-gpu-snapshotting`,children:(e,t)=>{s(),i(e,r(`Speed up cold starts with GPU snapshotting`))},$$slots:{default:!0}});var H=o(V,6);f(o(e(H)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory snapshot`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);f(o(e(U)),{href:`https://modal.com/blog/gpu-mem-snapshots`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`our initial benchmarks here`))},$$slots:{default:!0}}),s(),n(U);var W=o(U,2);f(o(e(W)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshots`))},$$slots:{default:!0}}),s(),n(W);var ve=o(W,4);l(ve,{id:`sleeping-and-waking-a-vllm-server`,children:(e,t)=>{s(),i(e,r(`Sleeping and waking a vLLM server`))},$$slots:{default:!0}});var G=o(ve,4),ye=o(e(G));f(ye,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=ae();s(),i(e,n)},$$slots:{default:!0}}),f(o(ye,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=oe();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(G);var be=o(G,2);u(be,{code:`VLLM_PORT%20%3D%208000%0A%0Awith%20vllm_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%2015%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BVLLM_PORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22vLLM%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BVLLM_PORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json%3Dpayload%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D60%2C%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A%0Adef%20sleep(level%3A%20int%20%3D%201)%3A%0A%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BVLLM_PORT%7D%2Fsleep%3Flevel%3D%7Blevel%7D%22%0A%20%20%20%20).raise_for_status()%0A%0A%0Adef%20wake_up()%3A%0A%20%20%20%20requests.post(f%22http%3A%2F%2F127.0.0.1%3A%7BVLLM_PORT%7D%2Fwake_up%22).raise_for_status()%0A%0A`,lang:`python`});var xe=o(be,2);l(xe,{id:`controlling-container-lifecycles-with-modalserver`,children:(e,t)=>{s();var n=se();s(),i(e,n)},$$slots:{default:!0}});var K=o(xe,6),q=e(K),Se=e(q),Ce=e(Se);f(Ce,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),f(o(Ce,4),{href:`https://modal.com/docs/reference/modal.App#server`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the reference documentation`))},$$slots:{default:!0}}),s(),n(Se),n(q);var we=o(q,2),Te=e(we);f(e(Te),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=le();s(2),i(e,n)},$$slots:{default:!0}}),s(5),n(Te),n(we),n(K);var Ee=o(K,6);u(Ee,{code:`app%20%3D%20modal.App(%22example-server-lfm-snapshot%22)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20scaledown_window%3D5%20*%20MINUTES%2C%0A%20%20%20%20startup_timeout%3D15%20*%20MINUTES%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20port%3DVLLM_PORT%2C%0A%20%20%20%20routing_region%3DREGION%2C%0A%20%20%20%20exit_grace_period%3D5%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20LfmVllmInference%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20the%20vLLM%20server%20and%20block%20until%20it%20is%20healthy%2C%20then%20warm%20it%20up%20and%20put%20it%20to%20sleep.%22%22%22%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BVLLM_PORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--dtype%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22bfloat16%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--gpu-memory-utilization%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-num-seqs%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BMAX_INPUTS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-cudagraph-capture-size%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BMAX_INPUTS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-sleep-mode%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20print(*cmd)%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%20%20%20%20%20%20%20%20sleep(level%3D1)%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20restore(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Wake%20vLLM%20from%20sleep%20mode%20after%20restoring%20from%20a%20memory%20snapshot.%22%22%22%0A%20%20%20%20%20%20%20%20wake_up()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var De=o(Ee,2);c(De,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var Oe=o(De,4);u(Oe,{code:`modal%20deploy%20lfm_snapshot.py`,lang:`bash`});var ke=o(Oe,4);c(ke,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var J=o(ke,4);f(o(e(J)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(J);var Y=o(J,2),Ae=o(e(Y));f(Ae,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),f(o(Ae,2),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,2);c(X,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var je=o(X,6);u(je,{code:`modal%20run%20lfm_snapshot.py`,lang:`bash`});var Me=o(je,6);u(Me,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20LfmVllmInference.get_url.aio()%0A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22List%20every%20country%20and%20its%20capital.%22%0A%0A%20%20%20%20messages%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22role%22%3A%20%22user%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20%22List%20every%20country%20and%20its%20capital%20in%20Chinese.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A`,lang:`python`});var Z=o(Me,4);f(o(e(Z),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,2);f(o(e(Q),3),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Web Functions`))},$$slots:{default:!0}}),s(),n(Q);var Ne=o(Q,2);u(Ne,{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20this%20yourself%20based%20on%20KV%20cache%20hit-rate%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22model%22%3A%20%22llm%22%2C%20%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%0A%0A`,lang:`python`});var Pe=o(Ne,2);l(Pe,{id:`test-memory-snapshotting`,children:(e,t)=>{s(),i(e,r(`Test memory snapshotting`))},$$slots:{default:!0}});var $=o(Pe,6);f(o(e($)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n($);var Fe=o($,4);u(Fe,{code:`python%20lfm_snapshot.py`,lang:`text`}),u(o(Fe,2),{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20LfmVllmInference%20%3D%20Server.from_name(%0A%20%20%20%20%20%20%20%20%22example-server-lfm-snapshot%22%2C%20%22LfmVllmInference%22%0A%20%20%20%20)%0A%0A%20%20%20%20async%20def%20main()%3A%0A%20%20%20%20%20%20%20%20url%20%3D%20await%20LfmVllmInference.get_url.aio()%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20ten%20jokes.%22%7D%5D%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D10%20*%20MINUTES)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20print(%22calling%20inference%20server%22)%0A%20%20%20%20%20%20%20%20asyncio.run(main())%0A%20%20%20%20except%20modal.exception.NotFoundError%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22To%20take%20advantage%20of%20GPU%20snapshots%2C%20deploy%20first%20with%20modal%20deploy%20%7B__file__%7D%22%0A%20%20%20%20%20%20%20%20)%20from%20e%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=DiMEqULO.js.map
