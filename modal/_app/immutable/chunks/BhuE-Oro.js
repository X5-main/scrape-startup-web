(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`363a9298-b6c0-4422-a066-393100be0b6b`,e._sentryDebugIdIdentifier=`sentry-dbid-363a9298-b6c0-4422-a066-393100be0b6b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Serverless Ministral 3 with vLLM and Modal`,id:`serverless-ministral-3-with-vllm-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`},{depth:2,value:`Download the Ministral weights`,id:`download-the-ministral-weights`,children:[{depth:3,value:`Cache with Modal Volumes`,id:`cache-with-modal-volumes`}]},{depth:2,value:`Serve Ministral 3 with vLLM`,id:`serve-ministral-3-with-vllm`,children:[{depth:3,value:`Improve cold start time with snapshots`,id:`improve-cold-start-time-with-snapshots`},{depth:3,value:`Define the server`,id:`define-the-server`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`,children:[{depth:3,value:`Test memory snapshotting`,id:`test-memory-snapshotting`}]}]}],rawContent:`# Serverless Ministral 3 with vLLM and Modal

In this example, we show how to serve Mistral's Ministral 3 vision-language models on Modal.

The [Ministral 3](https://huggingface.co/collections/mistralai/ministral-3-more) model series
performs competitively with the Qwen 3-VL model series on benchmarks
(see model cards for details).

We also include instructions for cutting cold start times
for long-running deployments by an order of magnitude using Modal's
[CPU + GPU memory snapshots](https://modal.com/docs/guide/memory-snapshot).

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/custom-container).
We'll use the [vLLM inference server](https://docs.vllm.ai).
vLLM can be installed with \`uv pip\`, since Modal [provides the CUDA drivers](https://modal.com/docs/guide/cuda).

\`\`\`python
import json
import socket
import subprocess
from typing import Any

import aiohttp
import modal

MINUTES = 60  # seconds
VLLM_PORT = 8000

app = modal.App("example-ministral3-inference")

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.9.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .uv_pip_install(
        "vllm==0.13.0",
        "huggingface-hub==0.36.0",
        "flashinfer-python==0.5.3",
    )
)

\`\`\`

## Download the Ministral weights

We also need to download the model weights.
We'll retrieve them from the Hugging Face Hub.

To speed up the model load, we'll toggle the \`HIGH_PERFORMANCE\`
flag for Hugging Face's [Xet backend](https://huggingface.co/docs/hub/en/xet/index).

\`\`\`python
vllm_image = vllm_image.env({"HF_XET_HIGH_PERFORMANCE": "1"})

\`\`\`

The [Ministral 3 model series](https://huggingface.co/collections/mistralai/ministral-3-more)
contains a variety of models:

- 3B, 8B, and 14B sizes
- base models and instruction & reasoning fine-tuned models
- BF16 and FP8 quantizations

All are available under the Apache 2.0 open source license.

We'll use the FP8 instruct variant of the 8B model:

\`\`\`python
MODEL_NAME = "mistralai/Ministral-3-8B-Instruct-2512"

\`\`\`

Native hardware support for FP8 formats in [Tensor Cores](https://modal.com/gpu-glossary/device-hardware/tensor-core)
is limited to the latest [Streaming Multiprocessor architectures](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
like those of Modal's [Hopper H100/H200 and Blackwell B200 GPUs](https://modal.com/blog/introducing-b200-h200).

At 80 GB VRAM, a single H100 GPU has enough space to store the 8B FP8 model weights (~8 GB)
and a very large KV cache. A single H100 is also enough to serve the 14B model in full precision,
but without as much room for KV (though still enough to handle the full sequence length).

\`\`\`python
N_GPU = 1

\`\`\`

### Cache with Modal Volumes

Modal Functions are serverless: when they aren't being used,
their underlying containers spin down and all ephemeral resources,
like GPUs, memory, network connections, and local disks are released.

We can preserve saved files by mounting a
[Modal Volume](https://modal.com/docs/guide/volumes) --
a persistent, remote filesystem.

We'll use two Volumes: one for weights from Hugging Face
and one for compilation artifacts from vLLM.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

\`\`\`

## Serve Ministral 3 with vLLM

We serve Ministral 3 on Modal by spinning up a Modal Function
that acts as a [\`web_server\`](https://modal.com/docs/guide/webhooks)
and spins up a vLLM server in a subprocess
(via the \`vllm serve\` command).

### Improve cold start time with snapshots

Starting up a vLLM server can be slow --
tens of seconds to minutes. Much of that time
is spent on JIT compilation of inference code.

We can skip most of that work and reduce startup times by a factor of 10
using Modal's [memory snapshots](https://modal.com/docs/guide/memory-snapshot),
which serialize the contents of CPU and GPU memory.

This adds quite some complexity to the code.
If you're looking for a minimal example, see
our [\`vllm_inference\` example here](https://modal.com/docs/examples/vllm_inference).

We'll need to set a few extra configuration values:

\`\`\`python
vllm_image = vllm_image.env(
    {
        "VLLM_SERVER_DEV_MODE": "1",  # allow use of "Sleep Mode"
        "TORCHINDUCTOR_COMPILE_THREADS": "1",  # improve compatibility with snapshots
    }
)

\`\`\`

Setting the \`DEV_MODE\` flag allows us to use the \`sleep\`/\`wake_up\` endpoints
to toggle the server in and out of "sleep mode".

\`\`\`python
with vllm_image.imports():
    import requests


def sleep(level=1):
    requests.post(
        f"http://localhost:{VLLM_PORT}/sleep?level={level}"
    ).raise_for_status()


def wake_up():
    requests.post(f"http://localhost:{VLLM_PORT}/wake_up").raise_for_status()


\`\`\`

Sleep Mode helps with memory snapshotting.
When the server is asleep, model weights are offloaded to CPU memory and the KV cache is emptied.
For details, see the [vLLM docs](https://docs.vllm.ai/en/stable/features/sleep_mode/).

We'll also need two helper functions.
Ther first, \`wait_ready\`, busy-polls the server until it is live.

\`\`\`python
def wait_ready(proc: subprocess.Popen):
    while True:
        try:
            socket.create_connection(("localhost", VLLM_PORT), timeout=1).close()
            return
        except OSError:
            if proc.poll() is not None:
                raise RuntimeError(f"vLLM exited with {proc.returncode}")


\`\`\`

Once the server is live, we \`warmup\` inference with a few requests.
This is important for capturing non-serializable JIT compilation artifacts,
like CUDA graphs and some Torch compilation outputs,
in our snapshot.

\`\`\`python
def warmup():
    payload = {
        "model": "llm",
        "messages": [{"role": "user", "content": "Who are you?"}],
        "max_tokens": 16,
    }

    for ii in range(3):
        requests.post(
            f"http://localhost:{VLLM_PORT}/v1/chat/completions",
            json=payload,
            timeout=300,
        ).raise_for_status()


\`\`\`

### Define the server

We construct our web-serving Modal Function
by decorating a regular Python class.
The decorators include a number of configuration
options for deployment, including resources like GPUs and Volumes
and timeouts on container scaledown.
You can read more about the options
[here](https://modal.com/docs/reference/modal.App#function).

We control memory snapshotting and container start behavior
by decorating the methods of the class.

We start the server, warm it up, and then put it to sleep
in the \`start\` method. This method has the \`modal.enter\`
decorator to ensure it runs when a new container starts
and we pass \`snap=True\` to turn on memory snapshotting.

The following method, \`wake_up\`, calls the \`wake_up\`
endpoint and then waits for the server to be ready.
It is run after the \`start\` method because it is defined later
in the code and also has the \`modal.enter\` decorator.
It has \`snap=False\` so that it isn't included in the snapshot.

Finally, we connect the vLLM server to the Internet
using the [\`modal.web_server\`](https://modal.com/docs/guide/webhooks#non-asgi-web-servers) decorator.

\`\`\`python
@app.cls(
    image=vllm_image,
    gpu=f"H100:{N_GPU}",
    scaledown_window=15 * MINUTES,  # how long should we stay up with no requests?
    timeout=10 * MINUTES,  # how long should we wait for container start?
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
)
@modal.concurrent(  # how many requests can one replica handle? tune carefully!
    max_inputs=32
)
class VllmServer:
    @modal.enter(snap=True)
    def start(self):
        cmd = [
            "vllm",
            "serve",
            "--uvicorn-log-level=info",
            MODEL_NAME,
            "--served-model-name",
            MODEL_NAME,
            "llm",
            "--host",
            "0.0.0.0",
            "--port",
            str(VLLM_PORT),
            "--gpu_memory_utilization",
            str(0.95),
        ]

        # assume multiple GPUs are for splitting up large matrix multiplications
        cmd += ["--tensor-parallel-size", str(N_GPU)]

        # add mistral config arguments
        cmd += [
            "--tokenizer_mode",
            "mistral",
            "--config_format",
            "mistral",
            "--load_format",
            "mistral",
            "--tool-call-parser",
            "mistral",
            "--enable-auto-tool-choice",
        ]

        # add config arguments for snapshotting

        cmd += [
            "--enable-sleep-mode",
            # make KV cache predictable / small
            "--max-num-seqs",
            "2",
            "--max-model-len",
            "12288",
            "--max-num-batched-tokens",
            "12288",
        ]

        print(*cmd)

        self.vllm_proc = subprocess.Popen(cmd)

        wait_ready(self.vllm_proc)

        warmup()

        sleep()

    @modal.enter(snap=False)
    def wake_up(self):
        wake_up()
        wait_ready(self.vllm_proc)

    @modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
    def serve(self):
        pass

    @modal.exit()
    def stop(self):
        self.vllm_proc.terminate()


\`\`\`

## Deploy the server

To deploy the API on Modal, just run
\`\`\`bash
modal deploy ministral3_inference.py
\`\`\`

This will create a new app on Modal, build the container image for it if it hasn't been built yet,
and deploy the app.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-ministral3-inference-serve.modal.run\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL, i.e. \`https://your-workspace-name--example-ministral-inference-serve.modal.run/docs\`.
These docs describe each route and indicate the expected input and output
and translate requests into \`curl\` commands.

For simple routes like \`/health\`, which checks whether the server is responding,
you can even send a request directly from the docs.

To interact with the API programmatically in Python, we recommend the \`openai\` library.

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that does a healthcheck and then hits the server.

If you execute the command

\`\`\`bash
modal run ministral3_inference.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, content=None, twice=True):
    url = VllmServer().serve.get_web_url()

    system_prompt = {
        "role": "system",
        "content": "You are a pirate who can't help but drop sly reminders that he went to Harvard.",
    }
    if content is None:
        image_url = "https://static.wikia.nocookie.net/essentialsdocs/images/7/70/Battle.png/revision/latest?cb=20220523172438"

        content = [
            {
                "type": "text",
                "text": "What action do you think I should take in this situation?"
                " List all the possible actions and explain why you think they are good or bad.",
            },
            {"type": "image_url", "image_url": {"url": image_url}},
        ]

    messages = [  # OpenAI chat format
        system_prompt,
        {"role": "user", "content": content},
    ]

    async with aiohttp.ClientSession(base_url=url) as session:
        print(f"Running health check for server at {url}")
        async with session.get("/health", timeout=test_timeout - 1 * MINUTES) as resp:
            up = resp.status == 200
        assert up, f"Failed health check for server at {url}"
        print(f"Successful health check for server at {url}")

        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await _send_request(session, "llm", messages, timeout=1 * MINUTES)
        if twice:
            messages[0]["content"] = """Yousa culled Jar Jar Binks.
            Always be talkin' in da Gungan style, like thisa, okeyday?
            Helpin' da user with big big enthusiasm, makin' tings bombad clear!"""
            print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
            await _send_request(session, "llm", messages, timeout=1 * MINUTES)


async def _send_request(
    session: aiohttp.ClientSession, model: str, messages: list, timeout: int
) -> None:
    # \`stream=True\` tells an OpenAI-compatible backend to stream chunks
    payload: dict[str, Any] = {
        "messages": messages,
        "model": model,
        "stream": True,
        "temperature": 0.15,
    }

    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}

    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers, timeout=timeout
    ) as resp:
        async for raw in resp.content:
            resp.raise_for_status()
            # extract new content and stream it
            line = raw.decode().strip()
            if not line or line == "data: [DONE]":
                continue
            if line.startswith("data: "):  # SSE prefix
                line = line[len("data: ") :]

            chunk = json.loads(line)
            assert (
                chunk["object"] == "chat.completion.chunk"
            )  # or something went horribly wrong
            print(chunk["choices"][0]["delta"]["content"], end="")
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
python ministral3_inference.py
\`\`\`

\`\`\`python
if __name__ == "__main__":
    import asyncio

    # after deployment, we can use the class from anywhere
    VllmServer = modal.Cls.from_name("example-ministral3-inference", "VllmServer")
    server = VllmServer()

    async def test(url):
        messages = [{"role": "user", "content": "Tell me a joke."}]
        async with aiohttp.ClientSession(base_url=url) as session:
            await _send_request(session, "llm", messages, timeout=10 * MINUTES)

    try:
        print("calling inference server")
        asyncio.run(test(server.serve.get_web_url()))
    except modal.exception.NotFoundError as e:
        raise Exception(
            f"To take advantage of GPU snapshots, deploy first with modal deploy {__file__}"
        ) from e

\`\`\`
`,meta:{title:`Serverless Ministral 3 with vLLM and Modal`,description:`In this example, we show how to serve Mistral’s Ministral 3 vision-language models on Modal.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`container <code>Image</code>`,1),ie=t(`<code>web_server</code>`),ae=t(`<code>vllm_inference</code> example here`,1),oe=t(`<code>modal.web_server</code>`),se=t(`<!> <p>In this example, we show how to serve Mistral’s Ministral 3 vision-language models on Modal.</p> <p>The <!> model series
performs competitively with the Qwen 3-VL model series on benchmarks
(see model cards for details).</p> <p>We also include instructions for cutting cold start times
for long-running deployments by an order of magnitude using Modal’s <!>.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.
We’ll use the <!>.
vLLM can be installed with <code>uv pip</code>, since Modal <!>.</p> <!> <!> <p>We also need to download the model weights.
We’ll retrieve them from the Hugging Face Hub.</p> <p>To speed up the model load, we’ll toggle the <code>HIGH_PERFORMANCE</code> flag for Hugging Face’s <!>.</p> <!> <p>The <!> contains a variety of models:</p> <ul><li>3B, 8B, and 14B sizes</li> <li>base models and instruction & reasoning fine-tuned models</li> <li>BF16 and FP8 quantizations</li></ul> <p>All are available under the Apache 2.0 open source license.</p> <p>We’ll use the FP8 instruct variant of the 8B model:</p> <!> <p>Native hardware support for FP8 formats in <!> is limited to the latest <!>,
like those of Modal’s <!>.</p> <p>At 80 GB VRAM, a single H100 GPU has enough space to store the 8B FP8 model weights (~8 GB)
and a very large KV cache. A single H100 is also enough to serve the 14B model in full precision,
but without as much room for KV (though still enough to handle the full sequence length).</p> <!> <!> <p>Modal Functions are serverless: when they aren’t being used,
their underlying containers spin down and all ephemeral resources,
like GPUs, memory, network connections, and local disks are released.</p> <p>We can preserve saved files by mounting a <!> —
a persistent, remote filesystem.</p> <p>We’ll use two Volumes: one for weights from Hugging Face
and one for compilation artifacts from vLLM.</p> <!> <!> <p>We serve Ministral 3 on Modal by spinning up a Modal Function
that acts as a <!> and spins up a vLLM server in a subprocess
(via the <code>vllm serve</code> command).</p> <!> <p>Starting up a vLLM server can be slow —
tens of seconds to minutes. Much of that time
is spent on JIT compilation of inference code.</p> <p>We can skip most of that work and reduce startup times by a factor of 10
using Modal’s <!>,
which serialize the contents of CPU and GPU memory.</p> <p>This adds quite some complexity to the code.
If you’re looking for a minimal example, see
our <!>.</p> <p>We’ll need to set a few extra configuration values:</p> <!> <p>Setting the <code>DEV_MODE</code> flag allows us to use the <code>sleep</code>/<code>wake_up</code> endpoints
to toggle the server in and out of “sleep mode”.</p> <!> <p>Sleep Mode helps with memory snapshotting.
When the server is asleep, model weights are offloaded to CPU memory and the KV cache is emptied.
For details, see the <!>.</p> <p>We’ll also need two helper functions.
Ther first, <code>wait_ready</code>, busy-polls the server until it is live.</p> <!> <p>Once the server is live, we <code>warmup</code> inference with a few requests.
This is important for capturing non-serializable JIT compilation artifacts,
like CUDA graphs and some Torch compilation outputs,
in our snapshot.</p> <!> <!> <p>We construct our web-serving Modal Function
by decorating a regular Python class.
The decorators include a number of configuration
options for deployment, including resources like GPUs and Volumes
and timeouts on container scaledown.
You can read more about the options <!>.</p> <p>We control memory snapshotting and container start behavior
by decorating the methods of the class.</p> <p>We start the server, warm it up, and then put it to sleep
in the <code>start</code> method. This method has the <code>modal.enter</code> decorator to ensure it runs when a new container starts
and we pass <code>snap=True</code> to turn on memory snapshotting.</p> <p>The following method, <code>wake_up</code>, calls the <code>wake_up</code> endpoint and then waits for the server to be ready.
It is run after the <code>start</code> method because it is defined later
in the code and also has the <code>modal.enter</code> decorator.
It has <code>snap=False</code> so that it isn’t included in the snapshot.</p> <p>Finally, we connect the vLLM server to the Internet
using the <!> decorator.</p> <!> <!> <p>To deploy the API on Modal, just run</p> <!> <p>This will create a new app on Modal, build the container image for it if it hasn’t been built yet,
and deploy the app.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-ministral3-inference-serve.modal.run</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL, i.e. <code>https://your-workspace-name--example-ministral-inference-serve.modal.run/docs</code>.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.</p> <p>For simple routes like <code>/health</code>, which checks whether the server is responding,
you can even send a request directly from the docs.</p> <p>To interact with the API programmatically in Python, we recommend the <code>openai</code> library.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that does a healthcheck and then hits the server.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <!> <p>Using <code>modal run</code> creates an ephemeral Modal App,
rather than a deployed Modal App.
Ephemeral Modal Apps are short-lived,
so they turn off snapshotting.</p> <p>To test the memory snapshot version of the server,
first deploy it with <code>modal deploy</code> and then hit it with a client.</p> <p>You should observe startup improvements
after a handful of cold starts
(usually less than five).
If you want to see the speedup during a test,
we recommend heading to the deployed App in your <!> and manually stopping containers after they have served a request.</p> <p>You can use the client code below to test the endpoint.
It can be run with the command</p> <!> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=se(),d=te(a);ne(d,{id:`serverless-ministral-3-with-vllm-and-modal`,children:(e,t)=>{s(),i(e,r(`Serverless Ministral 3 with vLLM and Modal`))},$$slots:{default:!0}});var p=o(d,4);f(o(e(p)),{href:`https://huggingface.co/collections/mistralai/ministral-3-more`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ministral 3`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);f(o(e(m)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CPU + GPU memory snapshots`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,2);c(h,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var g=o(h,2),_=o(e(g));f(_,{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}});var v=o(_,2);f(v,{href:`https://docs.vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM inference server`))},$$slots:{default:!0}}),f(o(v,4),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`provides the CUDA drivers`))},$$slots:{default:!0}}),s(),n(g);var y=o(g,2);u(y,{code:`import%20json%0Aimport%20socket%0Aimport%20subprocess%0Afrom%20typing%20import%20Any%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AVLLM_PORT%20%3D%208000%0A%0Aapp%20%3D%20modal.App(%22example-ministral3-inference%22)%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.9.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22vllm%3D%3D0.13.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer-python%3D%3D0.5.3%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var b=o(y,2);c(b,{id:`download-the-ministral-weights`,children:(e,t)=>{s(),i(e,r(`Download the Ministral weights`))},$$slots:{default:!0}});var x=o(b,4);f(o(e(x),3),{href:`https://huggingface.co/docs/hub/en/xet/index`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Xet backend`))},$$slots:{default:!0}}),s(),n(x);var ce=o(x,2);u(ce,{code:`vllm_image%20%3D%20vllm_image.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%0A`,lang:`python`});var S=o(ce,2);f(o(e(S)),{href:`https://huggingface.co/collections/mistralai/ministral-3-more`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ministral 3 model series`))},$$slots:{default:!0}}),s(),n(S);var C=o(S,8);u(C,{code:`MODEL_NAME%20%3D%20%22mistralai%2FMinistral-3-8B-Instruct-2512%22%0A`,lang:`python`});var w=o(C,2),T=o(e(w));f(T,{href:`https://modal.com/gpu-glossary/device-hardware/tensor-core`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tensor Cores`))},$$slots:{default:!0}});var E=o(T,2);f(E,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Streaming Multiprocessor architectures`))},$$slots:{default:!0}}),f(o(E,2),{href:`https://modal.com/blog/introducing-b200-h200`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Hopper H100/H200 and Blackwell B200 GPUs`))},$$slots:{default:!0}}),s(),n(w);var D=o(w,4);u(D,{code:`N_GPU%20%3D%201%0A`,lang:`python`});var O=o(D,2);l(O,{id:`cache-with-modal-volumes`,children:(e,t)=>{s(),i(e,r(`Cache with Modal Volumes`))},$$slots:{default:!0}});var k=o(O,4);f(o(e(k)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,4);u(A,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0Avllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var j=o(A,2);c(j,{id:`serve-ministral-3-with-vllm`,children:(e,t)=>{s(),i(e,r(`Serve Ministral 3 with vLLM`))},$$slots:{default:!0}});var M=o(j,2);f(o(e(M)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(3),n(M);var N=o(M,2);l(N,{id:`improve-cold-start-time-with-snapshots`,children:(e,t)=>{s(),i(e,r(`Improve cold start time with snapshots`))},$$slots:{default:!0}});var P=o(N,4);f(o(e(P)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory snapshots`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);f(o(e(F)),{href:`https://modal.com/docs/examples/vllm_inference`,rel:`nofollow`,children:(e,t)=>{var n=ae();s(),i(e,n)},$$slots:{default:!0}}),s(),n(F);var I=o(F,4);u(I,{code:`vllm_image%20%3D%20vllm_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22VLLM_SERVER_DEV_MODE%22%3A%20%221%22%2C%20%20%23%20allow%20use%20of%20%22Sleep%20Mode%22%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_COMPILE_THREADS%22%3A%20%221%22%2C%20%20%23%20improve%20compatibility%20with%20snapshots%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var L=o(I,4);u(L,{code:`with%20vllm_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20sleep(level%3D1)%3A%0A%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20f%22http%3A%2F%2Flocalhost%3A%7BVLLM_PORT%7D%2Fsleep%3Flevel%3D%7Blevel%7D%22%0A%20%20%20%20).raise_for_status()%0A%0A%0Adef%20wake_up()%3A%0A%20%20%20%20requests.post(f%22http%3A%2F%2Flocalhost%3A%7BVLLM_PORT%7D%2Fwake_up%22).raise_for_status()%0A%0A`,lang:`python`});var R=o(L,2);f(o(e(R)),{href:`https://docs.vllm.ai/en/stable/features/sleep_mode/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM docs`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,4);u(z,{code:`def%20wait_ready(proc%3A%20subprocess.Popen)%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20socket.create_connection((%22localhost%22%2C%20VLLM_PORT)%2C%20timeout%3D1).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20OSError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20proc.poll()%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22vLLM%20exited%20with%20%7Bproc.returncode%7D%22)%0A%0A`,lang:`python`});var B=o(z,4);u(B,{code:`def%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Who%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20for%20ii%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2Flocalhost%3A%7BVLLM_PORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json%3Dpayload%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D300%2C%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var V=o(B,2);l(V,{id:`define-the-server`,children:(e,t)=>{s(),i(e,r(`Define the server`))},$$slots:{default:!0}});var H=o(V,2);f(o(e(H)),{href:`https://modal.com/docs/reference/modal.App#function`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,8);f(o(e(U)),{href:`https://modal.com/docs/guide/webhooks#non-asgi-web-servers`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(U);var W=o(U,2);u(W,{code:`%40app.cls(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3Df%22H100%3A%7BN_GPU%7D%22%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A)%0A%40modal.concurrent(%20%20%23%20how%20many%20requests%20can%20one%20replica%20handle%3F%20tune%20carefully!%0A%20%20%20%20max_inputs%3D32%0A)%0Aclass%20VllmServer%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--uvicorn-log-level%3Dinfo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--gpu_memory_utilization%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(0.95)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20assume%20multiple%20GPUs%20are%20for%20splitting%20up%20large%20matrix%20multiplications%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%22--tensor-parallel-size%22%2C%20str(N_GPU)%5D%0A%0A%20%20%20%20%20%20%20%20%23%20add%20mistral%20config%20arguments%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tokenizer_mode%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22mistral%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--config_format%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22mistral%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--load_format%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22mistral%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22mistral%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-auto-tool-choice%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20add%20config%20arguments%20for%20snapshotting%0A%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-sleep-mode%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20make%20KV%20cache%20predictable%20%2F%20small%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-num-seqs%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%222%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-model-len%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%2212288%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-num-batched-tokens%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%2212288%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20print(*cmd)%0A%0A%20%20%20%20%20%20%20%20self.vllm_proc%20%3D%20subprocess.Popen(cmd)%0A%0A%20%20%20%20%20%20%20%20wait_ready(self.vllm_proc)%0A%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%20%20%20%20sleep()%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20wake_up(self)%3A%0A%20%20%20%20%20%20%20%20wake_up()%0A%20%20%20%20%20%20%20%20wait_ready(self.vllm_proc)%0A%0A%20%20%20%20%40modal.web_server(port%3DVLLM_PORT%2C%20startup_timeout%3D10%20*%20MINUTES)%0A%20%20%20%20def%20serve(self)%3A%0A%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.vllm_proc.terminate()%0A%0A`,lang:`python`});var G=o(W,2);c(G,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var K=o(G,4);u(K,{code:`modal%20deploy%20ministral3_inference.py`,lang:`bash`});var q=o(K,4);c(q,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var J=o(q,4);f(o(e(J)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(7),n(J);var Y=o(J,6);c(Y,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var X=o(Y,6);u(X,{code:`modal%20run%20ministral3_inference.py`,lang:`bash`});var Z=o(X,6);u(Z,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20content%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20VllmServer().serve.get_web_url()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20content%20is%20None%3A%0A%20%20%20%20%20%20%20%20image_url%20%3D%20%22https%3A%2F%2Fstatic.wikia.nocookie.net%2Fessentialsdocs%2Fimages%2F7%2F70%2FBattle.png%2Frevision%2Flatest%3Fcb%3D20220523172438%22%0A%0A%20%20%20%20%20%20%20%20content%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22text%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22text%22%3A%20%22What%20action%20do%20you%20think%20I%20should%20take%20in%20this%20situation%3F%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%20List%20all%20the%20possible%20actions%20and%20explain%20why%20you%20think%20they%20are%20good%20or%20bad.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22type%22%3A%20%22image_url%22%2C%20%22image_url%22%3A%20%7B%22url%22%3A%20image_url%7D%7D%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20print(f%22Running%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20async%20with%20session.get(%22%2Fhealth%22%2C%20timeout%3Dtest_timeout%20-%201%20*%20MINUTES)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20up%20%3D%20resp.status%20%3D%3D%20200%0A%20%20%20%20%20%20%20%20assert%20up%2C%20f%22Failed%20health%20check%20for%20server%20at%20%7Burl%7D%22%0A%20%20%20%20%20%20%20%20print(f%22Successful%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%20%20%20%20%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22%22%22Yousa%20culled%20Jar%20Jar%20Binks.%0A%20%20%20%20%20%20%20%20%20%20%20%20Always%20be%20talkin'%20in%20da%20Gungan%20style%2C%20like%20thisa%2C%20okeyday%3F%0A%20%20%20%20%20%20%20%20%20%20%20%20Helpin'%20da%20user%20with%20big%20big%20enthusiasm%2C%20makin'%20tings%20bombad%20clear!%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A%0Aasync%20def%20_send_request(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20model%3A%20str%2C%20messages%3A%20list%2C%20timeout%3A%20int%0A)%20-%3E%20None%3A%0A%20%20%20%20%23%20%60stream%3DTrue%60%20tells%20an%20OpenAI-compatible%20backend%20to%20stream%20chunks%0A%20%20%20%20payload%3A%20dict%5Bstr%2C%20Any%5D%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20messages%2C%0A%20%20%20%20%20%20%20%20%22model%22%3A%20model%2C%0A%20%20%20%20%20%20%20%20%22stream%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%22temperature%22%3A%200.15%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20headers%20%3D%20%7B%22Content-Type%22%3A%20%22application%2Fjson%22%2C%20%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20extract%20new%20content%20and%20stream%20it%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode().strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%20or%20line%20%3D%3D%20%22data%3A%20%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20line.startswith(%22data%3A%20%22)%3A%20%20%23%20SSE%20prefix%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20line%5Blen(%22data%3A%20%22)%20%3A%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20json.loads(line)%0A%20%20%20%20%20%20%20%20%20%20%20%20assert%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%5B%22object%22%5D%20%3D%3D%20%22chat.completion.chunk%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20or%20something%20went%20horribly%20wrong%0A%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%5B%22choices%22%5D%5B0%5D%5B%22delta%22%5D%5B%22content%22%5D%2C%20end%3D%22%22)%0A%20%20%20%20print()%0A%0A`,lang:`python`});var Q=o(Z,2);l(Q,{id:`test-memory-snapshotting`,children:(e,t)=>{s(),i(e,r(`Test memory snapshotting`))},$$slots:{default:!0}});var $=o(Q,6);f(o(e($)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n($);var le=o($,4);u(le,{code:`python%20ministral3_inference.py`,lang:`text`}),u(o(le,2),{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20import%20asyncio%0A%0A%20%20%20%20%23%20after%20deployment%2C%20we%20can%20use%20the%20class%20from%20anywhere%0A%20%20%20%20VllmServer%20%3D%20modal.Cls.from_name(%22example-ministral3-inference%22%2C%20%22VllmServer%22)%0A%20%20%20%20server%20%3D%20VllmServer()%0A%0A%20%20%20%20async%20def%20test(url)%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%20%20%20%20%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages%2C%20timeout%3D10%20*%20MINUTES)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20print(%22calling%20inference%20server%22)%0A%20%20%20%20%20%20%20%20asyncio.run(test(server.serve.get_web_url()))%0A%20%20%20%20except%20modal.exception.NotFoundError%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22To%20take%20advantage%20of%20GPU%20snapshots%2C%20deploy%20first%20with%20modal%20deploy%20%7B__file__%7D%22%0A%20%20%20%20%20%20%20%20)%20from%20e%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=BhuE-Oro.js.map
