(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b0742198-dd1a-4e14-87b7-0f06ed1eb9e7`,e._sentryDebugIdIdentifier=`sentry-dbid-b0742198-dd1a-4e14-87b7-0f06ed1eb9e7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Serve the Qwen 3.6 Vision-Language Model with SGLang`,id:`serve-the-qwen-36-vision-language-model-with-sglang`,children:[{depth:2,value:`Setup and container image definition`,id:`setup-and-container-image-definition`},{depth:2,value:`Configure the model`,id:`configure-the-model`},{depth:2,value:`Configure GPU`,id:`configure-gpu`},{depth:2,value:`Cacheing in Modal Volumes`,id:`cacheing-in-modal-volumes`},{depth:2,value:`Define the inference server`,id:`define-the-inference-server`,children:[{depth:3,value:`Setting up the server`,id:`setting-up-the-server`}]},{depth:2,value:`Test the server`,id:`test-the-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`}]}],rawContent:`# Serve the Qwen 3.6 Vision-Language Model with SGLang

Vision-Language Models (VLMs) are like LLMs with eyes:
they can generate text based not just on other text,
but on images as well.

This example shows how to serve a VLM on Modal using the
[SGLang](https://github.com/sgl-project/sglang) library
with an OpenAI-compatible API server.

## Setup and container image definition

First, we import our global dependencies
and define constants.

\`\`\`python
import asyncio
import json
import subprocess
import time

import aiohttp
import modal

MINUTES = 60

\`\`\`

To define the container [Image](https://modal.com/docs/guide/images)
with our server's dependencies,
we build off of the official SGLang Docker image with CUDA 13.

\`\`\`python
sglang_image = modal.Image.from_registry(
    "lmsysorg/sglang:v0.5.10.post1-cu130-runtime"
).entrypoint([])

\`\`\`

## Configure the model

[Qwen3.6-35B-A3B-FP8](https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8)
is a vision-language reasoning foundational model with 35B total parameters,
of which only 3B are activated per input sequence per forward pass.
We use the [8bit quantized floating point](https://modal.com/llm-almanac/quant-formats)
version of the model for faster [cold starts](https://modal.com/docs/guide/cold-start)
and faster inference with negligible behavior differences.

\`\`\`python
MODEL_NAME = "Qwen/Qwen3.6-35B-A3B-FP8"
MODEL_REVISION = "95a723d08a9490559dae23d0cff1d9466213d989"

\`\`\`

## Configure GPU

We use a single H100 GPU. The ~35 GB of model weights fits comfortably in this GPU's 80GB of
[high-bandwidth memory](https://modal.com/gpu-glossary/device-hardware/gpu-ram).

\`\`\`python
GPU = "H100!:1"
N_GPUS = 1

\`\`\`

## Cacheing in Modal Volumes

Modal Apps typically cache some artifacts in a [Modal Volume](https://modal.com/docs/guide/volumes)
for faster cold starts.
Here, we cache the model weights and the JIT-compiled DeepGEMM kernels.

\`\`\`python
HF_CACHE_VOL = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
HF_CACHE_PATH = "/root/.cache/huggingface"

DG_CACHE_VOL = modal.Volume.from_name("deepgemm-cache", create_if_missing=True)
DG_CACHE_PATH = "/root/.cache/deep_gemm"

\`\`\`

We configure the behavior and performance of the weight and compilation
caches via environment variables.
We also set a few other useful performance flags for this model.

\`\`\`python
sglang_image = sglang_image.env(
    {
        "HF_HUB_CACHE": HF_CACHE_PATH,
        "HF_XET_HIGH_PERFORMANCE": "1",
        "SGLANG_ENABLE_JIT_DEEPGEMM": "1",
        "SGLANG_USE_CUDA_IPC_TRANSPORT": "1",
        "SGLANG_USE_IPC_POOL_HANDLE_CACHE": "1",
    }
)

\`\`\`

We additionally compile the DeepGEMM kernels as part of building the container
[Image](https://modal.com/docs/guide/images).
This can take tens of minutes the first time, but only takes seconds when reading from cache.

\`\`\`python
def compile_deep_gemm():
    import os
    import subprocess

    if int(os.environ.get("SGLANG_ENABLE_JIT_DEEPGEMM", "1")):
        subprocess.run(
            f"python3 -m sglang.compile_deep_gemm --model-path {MODEL_NAME} --revision {MODEL_REVISION} --tp {N_GPUS}",
            shell=True,
            check=True,
        )


sglang_image = sglang_image.run_function(
    compile_deep_gemm,
    volumes={DG_CACHE_PATH: DG_CACHE_VOL, HF_CACHE_PATH: HF_CACHE_VOL},
    gpu=GPU,
)

\`\`\`

## Define the inference server

With environment setup out of the way, we're ready to define our inference server.
We use a [Modal Cls](https://modal.com/docs/guide/lifecycle-functions)
to separate container startup logic from input processing
(as part of \`modal.enter\`-decorated methods).
We use a Modal HTTP Server backed by a proxy in \`us-east\`.
We also handle clean teardown of the server in a \`modal.exit\` method.

\`\`\`python
ROUTING_REGION = "us-east"

PORT = 8000
TARGET_INPUTS = 10

app = modal.App(name="example-sglang-vlm")


@app.server(
    image=sglang_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL, DG_CACHE_PATH: DG_CACHE_VOL},
    startup_timeout=15 * MINUTES,
    port=PORT,
    routing_region=ROUTING_REGION,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class VlmServer:
    @modal.enter()
    def startup(self):
        self.process = _start_server()
        wait_ready(self.process)
        warmup()

    @modal.exit()
    def stop(self):
        self.process.terminate()
        self.process.wait()


\`\`\`

### Setting up the server

The server configuration is based on the information in the
[SGLang Cookbook](https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.6).
It includes speculative decoding via multi-token prediction
for lower latency at low to moderate concurrency.
For more on optimizing the performance of VLMs and LLMs,
see [this guide](https://modal.com/docs/guide/high-performance-llm-inference).

\`\`\`python
def _start_server() -> subprocess.Popen:
    """Start SGLang server in a subprocess"""
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
        "--tp",
        f"{N_GPUS}",
        "--cuda-graph-max-bs",
        f"{TARGET_INPUTS * 2}",
        "--enable-metrics",
        "--mem-fraction-static",
        "0.8",
        "--context-length",
        "131_072",
        "--mamba-scheduler-strategy",
        "extra_buffer",
        "--reasoning-parser",
        "qwen3",
        "--tool-call-parser",
        "qwen3_coder",
        "--speculative-algo",
        "EAGLE",
        "--speculative-num-steps",
        "3",
        "--speculative-eagle-topk",
        "1",
        "--speculative-num-draft-tokens",
        "4",
    ]

    print("Starting SGLang server with command:")
    print(*cmd)

    return subprocess.Popen(" ".join(cmd), shell=True, start_new_session=True)


\`\`\`

Before returning from our \`modal.enter\` method,
we wait for the server to finish spinning up, which can take several minutes.

\`\`\`python
def wait_ready(process: subprocess.Popen, timeout: int = 10 * MINUTES):
    import requests

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


\`\`\`

We also send a few warmup requests to ensure
that the server is fully ready to service requests --
otherwise the first few requests to a new replica might be
substantially slower.

\`\`\`python
SAMPLE_PAYLOAD = {
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://modal-cdn.com/golden-gate-bridge.jpg"
                    },
                },
                {"type": "text", "text": "What is this?"},
            ],
        }
    ],
    "max_tokens": 16,
}


def warmup():
    import requests

    for _ in range(2):
        requests.post(
            f"http://127.0.0.1:{PORT}/v1/chat/completions",
            json=SAMPLE_PAYLOAD,
            timeout=120,
        ).raise_for_status()


\`\`\`

## Test the server

We can test the entire server creation, from soup to nuts,
by running the file with \`modal run\`.
We just need to add a \`local_entrypoint\` that exercises the server.

\`\`\`python
@app.local_entrypoint()
async def main():
    url = await VlmServer.get_url.aio()

    messages = SAMPLE_PAYLOAD["messages"]
    print(f"Sending image at {messages[0]['content'][0]['image_url']} to the server")

    await probe(url, messages, timeout=10 * MINUTES)


\`\`\`

The client logic is normally handled by your preferred interface --
a coding agent harness like [OpenCode](https://modal.com/docs/examples/opencode_server),
a chat UI in the browser. Our server uses the standard OpenAI-compatible API format,
so most of these clients should work out of the box.
We replicate the minimum amount of its functionality we need for a test below.

Note that in the \`probe\` we include a \`Modal-Session-Id\` header for sticky routing
between Modal HTTP Server replicas and ignore 503s that occur
when no Modal HTTP Server replicas are available.

\`\`\`python
async def probe(url: str, messages: list, timeout: int = 25 * MINUTES):
    headers = {"Modal-Session-Id": "test-session"}
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
                raise
    raise TimeoutError(f"No response from server within {timeout} seconds")


async def _send_request_streaming(
    session: aiohttp.ClientSession, messages: list, timeout: int | None = None
) -> None:
    payload = {
        "messages": messages,
        "stream": True,
        "top_k": 20,
    }
    headers = {"Accept": "text/event-stream"}

    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers, timeout=timeout
    ) as resp:
        resp.raise_for_status()
        full_text = ""

        chunk = ""
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
            chunk += delta.get("content") or delta.get("reasoning_content") or ""

            if chunk and ("." in chunk or "\\n" in chunk):
                print(chunk, end="", flush=True)
                full_text += chunk
                chunk = ""

        if chunk:
            print(chunk, end="", flush=True)
            full_text += chunk

        print()
        return full_text


\`\`\`

You can kick off a test run with the command

\`\`\`bash
modal run sglang_vlm.py
\`\`\`

## Deploy the server

When you're ready to deploy the server,
replace \`modal run\` with \`modal deploy\`:

\`\`\`bash
modal deploy sglang_vlm.py
\`\`\`
`,meta:{title:`Serve the Qwen 3.6 Vision-Language Model with SGLang`,description:`Vision-Language Models (VLMs) are like LLMs with eyes: they can generate text based not just on other text, but on images as well.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>Vision-Language Models (VLMs) are like LLMs with eyes:
they can generate text based not just on other text,
but on images as well.</p> <p>This example shows how to serve a VLM on Modal using the <!> library
with an OpenAI-compatible API server.</p> <!> <p>First, we import our global dependencies
and define constants.</p> <!> <p>To define the container <!> with our server’s dependencies,
we build off of the official SGLang Docker image with CUDA 13.</p> <!> <!> <p><!> is a vision-language reasoning foundational model with 35B total parameters,
of which only 3B are activated per input sequence per forward pass.
We use the <!> version of the model for faster <!> and faster inference with negligible behavior differences.</p> <!> <!> <p>We use a single H100 GPU. The ~35 GB of model weights fits comfortably in this GPU’s 80GB of <!>.</p> <!> <!> <p>Modal Apps typically cache some artifacts in a <!> for faster cold starts.
Here, we cache the model weights and the JIT-compiled DeepGEMM kernels.</p> <!> <p>We configure the behavior and performance of the weight and compilation
caches via environment variables.
We also set a few other useful performance flags for this model.</p> <!> <p>We additionally compile the DeepGEMM kernels as part of building the container <!>.
This can take tens of minutes the first time, but only takes seconds when reading from cache.</p> <!> <!> <p>With environment setup out of the way, we’re ready to define our inference server.
We use a <!> to separate container startup logic from input processing
(as part of <code>modal.enter</code>-decorated methods).
We use a Modal HTTP Server backed by a proxy in <code>us-east</code>.
We also handle clean teardown of the server in a <code>modal.exit</code> method.</p> <!> <!> <p>The server configuration is based on the information in the <!>.
It includes speculative decoding via multi-token prediction
for lower latency at low to moderate concurrency.
For more on optimizing the performance of VLMs and LLMs,
see <!>.</p> <!> <p>Before returning from our <code>modal.enter</code> method,
we wait for the server to finish spinning up, which can take several minutes.</p> <!> <p>We also send a few warmup requests to ensure
that the server is fully ready to service requests —
otherwise the first few requests to a new replica might be
substantially slower.</p> <!> <!> <p>We can test the entire server creation, from soup to nuts,
by running the file with <code>modal run</code>.
We just need to add a <code>local_entrypoint</code> that exercises the server.</p> <!> <p>The client logic is normally handled by your preferred interface —
a coding agent harness like <!>,
a chat UI in the browser. Our server uses the standard OpenAI-compatible API format,
so most of these clients should work out of the box.
We replicate the minimum amount of its functionality we need for a test below.</p> <p>Note that in the <code>probe</code> we include a <code>Modal-Session-Id</code> header for sticky routing
between Modal HTTP Server replicas and ignore 503s that occur
when no Modal HTTP Server replicas are available.</p> <!> <p>You can kick off a test run with the command</p> <!> <!> <p>When you’re ready to deploy the server,
replace <code>modal run</code> with <code>modal deploy</code>:</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`serve-the-qwen-36-vision-language-model-with-sglang`,children:(e,t)=>{l(),i(e,r(`Serve the Qwen 3.6 Vision-Language Model with SGLang`))},$$slots:{default:!0}});var g=c(m,4);h(c(e(g)),{href:`https://github.com/sgl-project/sglang`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SGLang`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`setup-and-container-image-definition`,children:(e,t)=>{l(),i(e,r(`Setup and container image definition`))},$$slots:{default:!0}});var v=c(_,4);p(v,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%0A`,lang:`python`});var y=c(v,2);h(c(e(y)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,2);p(x,{code:`sglang_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22lmsysorg%2Fsglang%3Av0.5.10.post1-cu130-runtime%22%0A).entrypoint(%5B%5D)%0A`,lang:`python`});var S=c(x,2);u(S,{id:`configure-the-model`,children:(e,t)=>{l(),i(e,r(`Configure the model`))},$$slots:{default:!0}});var C=c(S,2),w=e(C);h(w,{href:`https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Qwen3.6-35B-A3B-FP8`))},$$slots:{default:!0}});var T=c(w,2);h(T,{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`8bit quantized floating point`))},$$slots:{default:!0}}),h(c(T,2),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cold starts`))},$$slots:{default:!0}}),l(),n(C);var E=c(C,2);p(E,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen3.6-35B-A3B-FP8%22%0AMODEL_REVISION%20%3D%20%2295a723d08a9490559dae23d0cff1d9466213d989%22%0A`,lang:`python`});var D=c(E,2);u(D,{id:`configure-gpu`,children:(e,t)=>{l(),i(e,r(`Configure GPU`))},$$slots:{default:!0}});var O=c(D,2);h(c(e(O)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`high-bandwidth memory`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);p(k,{code:`GPU%20%3D%20%22H100!%3A1%22%0AN_GPUS%20%3D%201%0A`,lang:`python`});var A=c(k,2);u(A,{id:`cacheing-in-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Cacheing in Modal Volumes`))},$$slots:{default:!0}});var j=c(A,2);h(c(e(j)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);p(M,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0A%0ADG_CACHE_VOL%20%3D%20modal.Volume.from_name(%22deepgemm-cache%22%2C%20create_if_missing%3DTrue)%0ADG_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fdeep_gemm%22%0A`,lang:`python`});var N=c(M,4);p(N,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_ENABLE_JIT_DEEPGEMM%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_USE_CUDA_IPC_TRANSPORT%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_USE_IPC_POOL_HANDLE_CACHE%22%3A%20%221%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var P=c(N,2);h(c(e(P)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);p(F,{code:`def%20compile_deep_gemm()%3A%0A%20%20%20%20import%20os%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20if%20int(os.environ.get(%22SGLANG_ENABLE_JIT_DEEPGEMM%22%2C%20%221%22))%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22python3%20-m%20sglang.compile_deep_gemm%20--model-path%20%7BMODEL_NAME%7D%20--revision%20%7BMODEL_REVISION%7D%20--tp%20%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%0Asglang_image%20%3D%20sglang_image.run_function(%0A%20%20%20%20compile_deep_gemm%2C%0A%20%20%20%20volumes%3D%7BDG_CACHE_PATH%3A%20DG_CACHE_VOL%2C%20HF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20gpu%3DGPU%2C%0A)%0A`,lang:`python`});var I=c(F,2);u(I,{id:`define-the-inference-server`,children:(e,t)=>{l(),i(e,r(`Define the inference server`))},$$slots:{default:!0}});var L=c(I,2);h(c(e(L)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Cls`))},$$slots:{default:!0}}),l(7),n(L);var R=c(L,2);p(R,{code:`ROUTING_REGION%20%3D%20%22us-east%22%0A%0APORT%20%3D%208000%0ATARGET_INPUTS%20%3D%2010%0A%0Aapp%20%3D%20modal.App(name%3D%22example-sglang-vlm%22)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%2C%20DG_CACHE_PATH%3A%20DG_CACHE_VOL%7D%2C%0A%20%20%20%20startup_timeout%3D15%20*%20MINUTES%2C%0A%20%20%20%20port%3DPORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20VlmServer%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20_start_server()%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%20%20%20%20%20%20%20%20self.process.wait()%0A%0A`,lang:`python`});var z=c(R,2);d(z,{id:`setting-up-the-server`,children:(e,t)=>{l(),i(e,r(`Setting up the server`))},$$slots:{default:!0}});var B=c(z,2),V=c(e(B));h(V,{href:`https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.6`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SGLang Cookbook`))},$$slots:{default:!0}}),h(c(V,2),{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(B);var H=c(B,2);p(H,{code:`def%20_start_server()%20-%3E%20subprocess.Popen%3A%0A%20%20%20%20%22%22%22Start%20SGLang%20server%20in%20a%20subprocess%22%22%22%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%22--tp%22%2C%0A%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs%22%2C%0A%20%20%20%20%20%20%20%20f%22%7BTARGET_INPUTS%20*%202%7D%22%2C%0A%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%0A%20%20%20%20%20%20%20%20%22--mem-fraction-static%22%2C%0A%20%20%20%20%20%20%20%20%220.8%22%2C%0A%20%20%20%20%20%20%20%20%22--context-length%22%2C%0A%20%20%20%20%20%20%20%20%22131_072%22%2C%0A%20%20%20%20%20%20%20%20%22--mamba-scheduler-strategy%22%2C%0A%20%20%20%20%20%20%20%20%22extra_buffer%22%2C%0A%20%20%20%20%20%20%20%20%22--reasoning-parser%22%2C%0A%20%20%20%20%20%20%20%20%22qwen3%22%2C%0A%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%22qwen3_coder%22%2C%0A%20%20%20%20%20%20%20%20%22--speculative-algo%22%2C%0A%20%20%20%20%20%20%20%20%22EAGLE%22%2C%0A%20%20%20%20%20%20%20%20%22--speculative-num-steps%22%2C%0A%20%20%20%20%20%20%20%20%223%22%2C%0A%20%20%20%20%20%20%20%20%22--speculative-eagle-topk%22%2C%0A%20%20%20%20%20%20%20%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22--speculative-num-draft-tokens%22%2C%0A%20%20%20%20%20%20%20%20%224%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20print(%22Starting%20SGLang%20server%20with%20command%3A%22)%0A%20%20%20%20print(*cmd)%0A%0A%20%20%20%20return%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue%2C%20start_new_session%3DTrue)%0A%0A`,lang:`python`});var U=c(H,4);p(U,{code:`def%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%2010%20*%20MINUTES)%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22SGLang%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A`,lang:`python`});var W=c(U,4);p(W,{code:`SAMPLE_PAYLOAD%20%3D%20%7B%0A%20%20%20%20%22messages%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22role%22%3A%20%22user%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22image_url%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22image_url%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fmodal-cdn.com%2Fgolden-gate-bridge.jpg%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20%22What%20is%20this%3F%22%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%5D%2C%0A%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%7D%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20for%20_%20in%20range(2)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json%3DSAMPLE_PAYLOAD%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D120%2C%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var G=c(W,2);u(G,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var K=c(G,4);p(K,{code:`%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20url%20%3D%20await%20VlmServer.get_url.aio()%0A%0A%20%20%20%20messages%20%3D%20SAMPLE_PAYLOAD%5B%22messages%22%5D%0A%20%20%20%20print(f%22Sending%20image%20at%20%7Bmessages%5B0%5D%5B'content'%5D%5B0%5D%5B'image_url'%5D%7D%20to%20the%20server%22)%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D10%20*%20MINUTES)%0A%0A`,lang:`python`});var q=c(K,2);h(c(e(q)),{href:`https://modal.com/docs/examples/opencode_server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenCode`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,4);p(J,{code:`async%20def%20probe(url%3A%20str%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%3D%2025%20*%20MINUTES)%3A%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-Id%22%3A%20%22test-session%22%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20messages%2C%0A%20%20%20%20%20%20%20%20%22stream%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%22top_k%22%3A%2020%2C%0A%20%20%20%20%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20chunk%20%3D%20%22%22%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%2B%3D%20delta.get(%22content%22)%20or%20delta.get(%22reasoning_content%22)%20or%20%22%22%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%20and%20(%22.%22%20in%20chunk%20or%20%22%5Cn%22%20in%20chunk)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%0A%20%20%20%20%20%20%20%20print()%0A%20%20%20%20%20%20%20%20return%20full_text%0A%0A`,lang:`python`});var Y=c(J,4);p(Y,{code:`modal%20run%20sglang_vlm.py`,lang:`bash`});var X=c(Y,2);u(X,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}}),p(c(X,4),{code:`modal%20deploy%20sglang_vlm.py`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BreBlDar2.js.map
