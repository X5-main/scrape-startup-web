(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a5bf7399-ed8c-4c30-aabe-a111ced395b0`,e._sentryDebugIdIdentifier=`sentry-dbid-a5bf7399-ed8c-4c30-aabe-a111ced395b0`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Low latency Qwen 3 8B with vLLM and Modal`,id:`low-latency-qwen-3-8b-with-vllm-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Loading and caching the model weights`,id:`loading-and-caching-the-model-weights`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Selecting infrastructure to minimize latency`,id:`selecting-infrastructure-to-minimize-latency`},{depth:3,value:`Cutting cold starts with GPU memory snapshots`,id:`cutting-cold-starts-with-gpu-memory-snapshots`},{depth:3,value:`Controlling container lifecycles with modal.Server`,id:`controlling-container-lifecycles-with-modalserver`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Low latency Qwen 3 8B with vLLM and Modal

In this example, we show how to serve [vLLM](https://docs.vllm.ai) at low latency on Modal.

This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both vLLM and Modal.
For a simpler introduction to LLM serving, see
[this example](https://modal.com/docs/examples/llm_inference).

To minimize routing overheads, we use \`@app.server\`,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.

We also include instructions for cutting cold start times by an order of magnitude using Modal's
[CPU + GPU memory snapshots](https://modal.com/docs/guide/memory-snapshot).

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/images).
We'll use the [vLLM inference server](https://docs.vllm.ai).
vLLM can be installed with \`uv pip\`, since Modal [provides the CUDA drivers](https://modal.com/docs/guide/cuda).

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import json
import subprocess
import time

import aiohttp
import modal
from modal.server import Server

MINUTES = 60  # seconds

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11")
    .uv_pip_install("vllm==0.11.2", "huggingface-hub==0.36.0")
    .env(
        {
            "VLLM_SERVER_DEV_MODE": "1",
            "TORCH_CPP_LOG_LEVEL": "FATAL",
        }
    )
)

\`\`\`

We also choose a [GPU](https://modal.com/docs/guide/gpu) to deploy our inference server onto.
We choose the [H100 GPU](https://modal.com/blog/introducing-h100),
which offers excellent price-performance
and supports 8bit floating point operations, which are the
lowest precision well-supported in the relevant [GPU kernels](https://modal.com/gpu-glossary/device-software/kernel)
across a variety of model architectures.

\`\`\`python
GPU = "H100"

\`\`\`

### Loading and caching the model weights

We'll serve [Alibaba's Qwen 3 LLM](https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192).
For lower latency, we pick a smaller model (8B params).

\`\`\`python
MODEL_NAME = "Qwen/Qwen3-8B"
MODEL_REVISION = (  # pin revision id to avoid nasty surprises!
    "b968826d9c46dd6066d109eabc6255188de91218"  # latest commit as of 2025-12-16
)

\`\`\`

We load the model [from the Hugging Face Hub](https://huggingface.co/collections/Qwen/qwen3),
so we'll need their Python package.

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
vllm_image = vllm_image.env(
    {"HF_HUB_CACHE": HF_CACHE_PATH, "HF_XET_HIGH_PERFORMANCE": "1"}
)

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

Latencies for multi-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram),
so they aren't shared across replicas.
To improve cache hit rate, \`@app.server\`
includes sticky routing based on a client-provided header.
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
TARGET_INPUTS = 20

\`\`\`

Generally, this choice needs to be made as part of
[LLM inference engine benchmarking](https://modal.com/llm-almanac/how-to-benchmark).

### Cutting cold starts with GPU memory snapshots

vLLM supports a sleep mode that allows us to leverage Modal's
[CPU + GPU memory snapshots](https://modal.com/docs/guide/memory-snapshot)
for dramatically faster cold starts.

When \`enable_memory_snapshot=True\` and \`experimental_options={"enable_gpu_snapshot": True}\`
are set on the class, Modal captures both CPU and GPU memory state.
The \`@modal.enter(snap=True)\` method runs before the snapshot is taken:
we start vLLM, wait for it to be ready, warm it up, then put it to sleep.
The \`@modal.enter(snap=False)\` method runs after restoring from snapshot:
we wake vLLM back up so it can serve requests immediately.

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

- \`target_concurrency\` to specify how many
requests our server can handle before we need to scale up.

- [\`@modal.enter\` and \`@modal.exit\`](https://modal.com/docs/guide/lifecycle-functions) to indicate
which methods of the class should be run when starting the server and shutting it down.
The \`snap=True\`/\`snap=False\` distinction controls which methods run before/after a memory snapshot.

Modal considers a new replica ready to receive inputs once the \`modal.enter\` methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up and to
send it a few test inputs.

We use the [\`requests\` library](https://requests.readthedocs.io/en/latest/)
to send ourselves these HTTP requests on
[\`localhost\`/\`127.0.0.1\`](https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1).

\`\`\`python
with vllm_image.imports():
    import requests

PORT = 8000


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
            time.sleep(5)
    raise TimeoutError(f"vLLM server not ready within {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


def warmup():
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{PORT}/v1/chat/completions", json=payload, timeout=10
        ).raise_for_status()


def sleep(level: int = 1):
    requests.post(f"http://127.0.0.1:{PORT}/sleep?level={level}").raise_for_status()


def wake_up():
    requests.post(f"http://127.0.0.1:{PORT}/wake_up").raise_for_status()


\`\`\`

With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.

\`\`\`python
APP_NAME = "example-server-vllm-low-latency"
app = modal.App(name=APP_NAME)


@app.server(
    image=vllm_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL},
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
    compute_region=REGION,
    min_containers=MIN_CONTAINERS,
    startup_timeout=10 * MINUTES,
    port=PORT,  # wrapped code must listen on this port
    routing_region=REGION,  # location of proxies, should be same as Cls region
    exit_grace_period=5,  # seconds, time to finish up requests when closing down
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class VLLM:
    @modal.enter(snap=True)
    def startup(self):
        """Start the vLLM server and block until it is healthy, then warm it up and put it to sleep."""
        cmd = [
            "vllm",
            "serve",
            "--uvicorn-log-level",
            "error",
            MODEL_NAME,
            "--revision",
            MODEL_REVISION,
            "--served-model-name",
            MODEL_NAME,
            "--host",
            "0.0.0.0",
            "--port",
            f"{PORT}",
            "--disable-uvicorn-access-log",
            "--disable-log-requests",
            "--enable-sleep-mode",
        ]

        self.process = subprocess.Popen(cmd)
        wait_ready(self.process)
        warmup()
        sleep(1)

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
modal deploy vllm_low_latency.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-vllm-low-latency-vllm.us-east.modal.direct\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-vllm-low-latency-vllm.us-east.modal.direct/docs\`.
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
modal run vllm_low_latency.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = await VLLM.get_url.aio()
    print(url)

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
    payload = {"model": MODEL_NAME, "messages": messages, "stream": True}
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
        print(full_text)


if __name__ == "__main__":
    # after deployment, we can use the class from anywhere
    vllm_server = Server.from_name(APP_NAME, "VLLM")

    async def main():
        url = await vllm_server.get_url.aio()
        messages = [{"role": "user", "content": "Tell me a joke."}]
        await probe(url, messages, timeout=10 * MINUTES)

    print("calling inference server")
    asyncio.run(main())

\`\`\`
`,meta:{title:`Low latency Qwen 3 8B with vLLM and Modal`,description:`In this example, we show how to serve vLLM at low latency on Modal.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<code>target_concurrency</code>`),ae=t(`Controlling container lifecycles with <code>modal.Server</code>`,1),oe=t(`<code>@app.server</code>`),se=t(`<code>@modal.enter</code> and <code>@modal.exit</code>`,1),ce=t(`<code>requests</code> library`,1),le=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),ue=t(`<!> <p>In this example, we show how to serve <!> at low latency on Modal.</p> <p>This example is intended to demonstrate everything required to run
inference at the highest performance and with the lowest latency possible,
and so it includes advanced features of both vLLM and Modal.
For a simpler introduction to LLM serving, see <!>.</p> <p>To minimize routing overheads, we use <code>@app.server</code>,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads.
This gives us more control over routing, but with increased power comes increased responsibility.</p> <p>We also include instructions for cutting cold start times by an order of magnitude using Modal’s <!>.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.
We’ll use the <!>.
vLLM can be installed with <code>uv pip</code>, since Modal <!>.</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <p>We also choose a <!> to deploy our inference server onto.
We choose the <!>,
which offers excellent price-performance
and supports 8bit floating point operations, which are the
lowest precision well-supported in the relevant <!> across a variety of model architectures.</p> <!> <!> <p>We’ll serve <!>.
For lower latency, we pick a smaller model (8B params).</p> <!> <p>We load the model <!>,
so we’ll need their Python package.</p> <p>We don’t want to load the model from the Hub every time we start the server.
We can load it much faster from a <!>.
Typical speeds are around one to two GB/s.</p> <!> <p>In addition to pointing the Hugging Face Hub at the path
where we mount the Volume, we also <!>,
which can fully saturate our network bandwidth.</p> <!> <!> <!> <p>Minimizing latency requires geographic co-location of clients and servers.</p> <p>So for low latency LLM inference services on Modal, you must select a <!> for both the GPU-accelerated containers running inference
and for the internal Modal proxies that forward requests to them
as part of defining a <code>app.server</code>.</p> <p>Here, we assume users are mostly in the northern half of the Americas
and select the <code>us-east</code> cloud region to serve them.
This should result in at most a few dozen milliseconds of round-trip time.</p> <!> <p>Latencies for multi-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in <!>,
so they aren’t shared across replicas.
To improve cache hit rate, <code>@app.server</code> includes sticky routing based on a client-provided header.
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
with <!> parameter.</p> <!> <p>Generally, this choice needs to be made as part of <!>.</p> <!> <p>vLLM supports a sleep mode that allows us to leverage Modal’s <!> for dramatically faster cold starts.</p> <p>When <code>enable_memory_snapshot=True</code> and <code>experimental_options=&#123;"enable_gpu_snapshot": True&#125;</code> are set on the class, Modal captures both CPU and GPU memory state.
The <code>@modal.enter(snap=True)</code> method runs before the snapshot is taken:
we start vLLM, wait for it to be ready, warm it up, then put it to sleep.
The <code>@modal.enter(snap=False)</code> method runs after restoring from snapshot:
we wake vLLM back up so it can serve requests immediately.</p> <!> <p>We wrap up all of the choices we made about the infrastructure
of our inference server into a number of Python decorators
that we apply to a Python class that encapsulates the logic
to run our server.</p> <p>The key decorators are:</p> <ul><li><p><!> to define the core of our service.
We attach our Image, request a GPU, attach our cache Volumes, specify the region, and configure auto-scaling.
This decorator also turns our python code into an HTTP server (i.e. fronting all of our containers with a proxy with a URL).
The wrapped code needs to eventually listen for HTTP connections on the provided <code>port</code>.
See <!> for details.</p></li> <li><p><code>target_concurrency</code> to specify how many
requests our server can handle before we need to scale up.</p></li> <li><p><!> to indicate
which methods of the class should be run when starting the server and shutting it down.
The <code>snap=True</code>/<code>snap=False</code> distinction controls which methods run before/after a memory snapshot.</p></li></ul> <p>Modal considers a new replica ready to receive inputs once the <code>modal.enter</code> methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we define a helper function to check whether the server is finished setting up and to
send it a few test inputs.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <p>With all this in place, we are ready to define our high-performance, low-latency
LLM inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-vllm-low-latency-vllm.us-east.modal.direct</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-vllm-low-latency-vllm.us-east.modal.direct/docs</code>.
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
Modal returns the <!> when a Server has no live replicas.</p> <p>We include a header with each request — <code>Modal-Session-ID</code>.
The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Note that this header is only compatible with
Modal Servers, not <!>.</p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`low-latency-qwen-3-8b-with-vllm-and-modal`,children:(e,t)=>{s(),i(e,r(`Low latency Qwen 3 8B with vLLM and Modal`))},$$slots:{default:!0}});var p=o(d,2);f(o(e(p)),{href:`https://docs.vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);f(o(e(m)),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4);f(o(e(h)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshots`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);c(g,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var _=o(g,2),v=o(e(_));f(v,{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}});var y=o(v,2);f(y,{href:`https://docs.vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM inference server`))},$$slots:{default:!0}}),f(o(y,4),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`provides the CUDA drivers`))},$$slots:{default:!0}}),s(),n(_);var b=o(_,4);u(b,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0Afrom%20modal.server%20import%20Server%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.4.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%22vllm%3D%3D0.11.2%22%2C%20%22huggingface-hub%3D%3D0.36.0%22)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22VLLM_SERVER_DEV_MODE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22TORCH_CPP_LOG_LEVEL%22%3A%20%22FATAL%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var x=o(b,2),de=o(e(x));f(de,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU`))},$$slots:{default:!0}});var fe=o(de,2);f(fe,{href:`https://modal.com/blog/introducing-h100`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H100 GPU`))},$$slots:{default:!0}}),f(o(fe,2),{href:`https://modal.com/gpu-glossary/device-software/kernel`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU kernels`))},$$slots:{default:!0}}),s(),n(x);var pe=o(x,2);u(pe,{code:`GPU%20%3D%20%22H100%22%0A`,lang:`python`});var S=o(pe,2);l(S,{id:`loading-and-caching-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Loading and caching the model weights`))},$$slots:{default:!0}});var C=o(S,2);f(o(e(C)),{href:`https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Alibaba’s Qwen 3 LLM`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);u(w,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen3-8B%22%0AMODEL_REVISION%20%3D%20(%20%20%23%20pin%20revision%20id%20to%20avoid%20nasty%20surprises!%0A%20%20%20%20%22b968826d9c46dd6066d109eabc6255188de91218%22%20%20%23%20latest%20commit%20as%20of%202025-12-16%0A)%0A`,lang:`python`});var T=o(w,2);f(o(e(T)),{href:`https://huggingface.co/collections/Qwen/qwen3`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`from the Hugging Face Hub`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);f(o(e(E)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);u(D,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0AMODEL_PATH%20%3D%20f%22%7BHF_CACHE_PATH%7D%2F%7BMODEL_NAME%7D%22%0A`,lang:`python`});var O=o(D,2);f(o(e(O)),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`turn on “high performance” downloads`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);u(k,{code:`vllm_image%20%3D%20vllm_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var A=o(k,2);c(A,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var j=o(A,2);l(j,{id:`selecting-infrastructure-to-minimize-latency`,children:(e,t)=>{s(),i(e,r(`Selecting infrastructure to minimize latency`))},$$slots:{default:!0}});var M=o(j,4);f(o(e(M)),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cloud region`))},$$slots:{default:!0}}),s(3),n(M);var N=o(M,4);u(N,{code:`REGION%20%3D%20%22us-east%22%0A`,lang:`python`});var P=o(N,2);f(o(e(P)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(3),n(P);var F=o(P,2);f(o(e(F)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“cold start”`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,6);u(I,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20to%20ensure%20one%20replica%20is%20always%20ready%0A`,lang:`python`});var L=o(I,4);f(o(e(L)),{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(L);var R=o(L,2);u(R,{code:`TARGET_INPUTS%20%3D%2020%0A`,lang:`python`});var z=o(R,2);f(o(e(z)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`LLM inference engine benchmarking`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,2);l(B,{id:`cutting-cold-starts-with-gpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Cutting cold starts with GPU memory snapshots`))},$$slots:{default:!0}});var V=o(B,2);f(o(e(V)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshots`))},$$slots:{default:!0}}),s(),n(V);var me=o(V,4);l(me,{id:`controlling-container-lifecycles-with-modalserver`,children:(e,t)=>{s();var n=ae();s(),i(e,n)},$$slots:{default:!0}});var H=o(me,6),U=e(H),W=e(U),G=e(W);f(G,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),f(o(G,4),{href:`https://modal.com/docs/reference/modal.App#server`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the reference documentation`))},$$slots:{default:!0}}),s(),n(W),n(U);var K=o(U,4),q=e(K);f(e(q),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=se();s(2),i(e,n)},$$slots:{default:!0}}),s(5),n(q),n(K),n(H);var J=o(H,4),Y=o(e(J));f(Y,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=ce();s(),i(e,n)},$$slots:{default:!0}}),f(o(Y,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=le();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(J);var he=o(J,2);u(he,{code:`with%20vllm_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0APORT%20%3D%208000%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%205%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22vLLM%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20timeout%3D10%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A%0Adef%20sleep(level%3A%20int%20%3D%201)%3A%0A%20%20%20%20requests.post(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fsleep%3Flevel%3D%7Blevel%7D%22).raise_for_status()%0A%0A%0Adef%20wake_up()%3A%0A%20%20%20%20requests.post(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fwake_up%22).raise_for_status()%0A%0A`,lang:`python`});var ge=o(he,4);u(ge,{code:`APP_NAME%20%3D%20%22example-server-vllm-low-latency%22%0Aapp%20%3D%20modal.App(name%3DAPP_NAME)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20startup_timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20port%3DPORT%2C%20%20%23%20wrapped%20code%20must%20listen%20on%20this%20port%0A%20%20%20%20routing_region%3DREGION%2C%20%20%23%20location%20of%20proxies%2C%20should%20be%20same%20as%20Cls%20region%0A%20%20%20%20exit_grace_period%3D5%2C%20%20%23%20seconds%2C%20time%20to%20finish%20up%20requests%20when%20closing%20down%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20VLLM%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20the%20vLLM%20server%20and%20block%20until%20it%20is%20healthy%2C%20then%20warm%20it%20up%20and%20put%20it%20to%20sleep.%22%22%22%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--uvicorn-log-level%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22error%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--disable-uvicorn-access-log%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--disable-log-requests%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-sleep-mode%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%20%20%20%20%20%20%20%20sleep(1)%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20restore(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Wake%20vLLM%20from%20sleep%20mode%20after%20restoring%20from%20a%20memory%20snapshot.%22%22%22%0A%20%20%20%20%20%20%20%20wake_up()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var _e=o(ge,2);c(_e,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var ve=o(_e,4);u(ve,{code:`modal%20deploy%20vllm_low_latency.py`,lang:`bash`});var ye=o(ve,4);c(ye,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var X=o(ye,4);f(o(e(X)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(X);var Z=o(X,2),be=o(e(Z));f(be,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),f(o(be,2),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n(Z);var xe=o(Z,2);c(xe,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Se=o(xe,6);u(Se,{code:`modal%20run%20vllm_low_latency.py`,lang:`bash`});var Ce=o(Se,6);u(Ce,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20VLLM.get_url.aio()%0A%20%20%20%20print(url)%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Explain%20the%20Singular%20Value%20Decomposition.%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A`,lang:`python`});var Q=o(Ce,4);f(o(e(Q),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,2);f(o(e($),3),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Web Functions`))},$$slots:{default:!0}}),s(),n($),u(o($,2),{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20this%20to%20some%20string%20per%20multi-turn%20interaction%0A%20%20%20%20%23%20often%20a%20UUID%20per%20%22conversation%22%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22model%22%3A%20MODEL_NAME%2C%20%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Server-Sent%20Events%20format%3A%20%22data%3A%20....%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20ignore%20any%20non-JSON%20keepalive%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%20%20%23%20newline%20after%20stream%20completes%0A%20%20%20%20%20%20%20%20print(full_text)%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20%23%20after%20deployment%2C%20we%20can%20use%20the%20class%20from%20anywhere%0A%20%20%20%20vllm_server%20%3D%20Server.from_name(APP_NAME%2C%20%22VLLM%22)%0A%0A%20%20%20%20async%20def%20main()%3A%0A%20%20%20%20%20%20%20%20url%20%3D%20await%20vllm_server.get_url.aio()%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D10%20*%20MINUTES)%0A%0A%20%20%20%20print(%22calling%20inference%20server%22)%0A%20%20%20%20asyncio.run(main())%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=B_wIlEsz.js.map
