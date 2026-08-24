(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4185f903-da4a-4860-b853-7e25a5716089`,e._sentryDebugIdIdentifier=`sentry-dbid-4185f903-da4a-4860-b853-7e25a5716089`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Serve DeepSeek V4 Pro on Modal with SGLang`,id:`serve-deepseek-v4-pro-on-modal-with-sglang`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Load model weights`,id:`load-model-weights`},{depth:3,value:`Configure the inference engine`,id:`configure-the-inference-engine`}]},{depth:2,value:`Configure infrastructure`,id:`configure-infrastructure`,children:[{depth:3,value:`Define the server`,id:`define-the-server`}]},{depth:2,value:`Test the server`,id:`test-the-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`}]}],rawContent:`# Serve DeepSeek V4 Pro on Modal with SGLang

The DeepSeek V4 Pro weights are delivered in mixed MXFP4 and run through SGLang's
\`flashinfer_mxfp4\` MoE runner backend on Blackwell, with EAGLE speculative decoding
for low/moderate concurrency time-per-output-token.

\`\`\`python
import asyncio
import json
import os
import subprocess
import time
from pathlib import Path

import aiohttp
import modal

here = Path(__file__).parent

\`\`\`

## Set up the container image

We use the \`deepseek-v4-blackwell\` tag of the SGLang image, which is the
Blackwell-tuned build the SGLang team recommends for V4.

\`\`\`python
image = modal.Image.from_registry("lmsysorg/sglang:deepseek-v4-blackwell").entrypoint(
    []  # silence chatty logs on entry
)

\`\`\`

### Load model weights

We cache weights in a Modal
[Volume](https://modal.com/docs/guide/volumes) and skip the download entirely
when iterating with \`dummy\` weights.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

image = image.env(
    {
        "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
        "CUDA_VISIBLE_DEVICES": "0,1,2,3,4,5,6,7",
    }
)


def download_model(repo_id, revision=None):
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id, revision=revision)


REPO_ID = "deepseek-ai/DeepSeek-V4-Pro"

image = image.run_function(
    download_model,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    args=(REPO_ID,),
)

\`\`\`

### Configure the inference engine

We base the configuration of the engine on SGLang's
[official cookbook recipe](https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4).

**Environment variables**

\`\`\`python
image = image.env(
    {
        "SGLANG_ENABLE_SPEC_V2": "1",
        "SGLANG_ENABLE_THINKING": "1",
        "SGLANG_JIT_DEEPGEMM_PRECOMPILE": "0",
    }
)

\`\`\`

You can also send any additional SGLang env vars set locally at deploy time.

\`\`\`python
def is_sglang_env_var(key):
    return key.startswith("SGL_") or key.startswith("SGLANG_")


image = image.env(
    {key: value for key, value in os.environ.items() if is_sglang_env_var(key)}
)

\`\`\`

**YAML**

\`\`\`python
default_config = """\\
 # General Config
 host: 0.0.0.0
 log-level: debug  # very noisy

 # Model Config
 tool-call-parser: deepseekv4
 reasoning-parser: deepseek-v4
 trust-remote-code: true

 # Memory
 mem-fraction-static: 0.82
 chunked-prefill-size: 4096

 # MoE
 moe-runner-backend: flashinfer_mxfp4

 # Observability
 enable-metrics: true
 collect-tokens-histogram: true

 # Batching
 max-running-requests: 32
 cuda-graph-max-bs: 32

 # SpecDec (EAGLE, as recommended by the DeepSeek V4 release notes)
 speculative-algorithm: EAGLE
 speculative-num-steps: 3
 speculative-eagle-topk: 1
 speculative-num-draft-tokens: 4

 # Tuning
 disable-flashinfer-autotune: true
"""

local_config_path = os.environ.get("APP_LOCAL_CONFIG_PATH")

if modal.is_local():
    if local_config_path is None:
        local_config_path = here / "config_deepseek_v4.yaml"

        if not local_config_path.exists():
            local_config_path.write_text(default_config)

        print(
            f"Using default config from {local_config_path.relative_to(here)}:",
            default_config,
            sep="\\n",
        )

    image = image.add_local_file(local_config_path, "/root/config.yaml")

\`\`\`

**Command-line arguments**

\`\`\`python
def _start_server() -> subprocess.Popen:
    """Start SGLang server in a subprocess"""
    cmd = [
        "python",
        "-m",
        "sglang.launch_server",
        "--host",
        "0.0.0.0",
        "--port",
        str(SGLANG_PORT),
        "--model-path",
        REPO_ID,
        "--tp-size",
        str(GPU_COUNT),
        "--config",
        "/root/config.yaml",
    ]

    print("Starting SGLang server with command:")
    print(*cmd)

    return subprocess.Popen(" ".join(cmd), shell=True, start_new_session=True)


with image.imports():
    import sglang  # noqa

\`\`\`

## Configure infrastructure

\`\`\`python
app = modal.App("example-deepseek-v4", image=image)

\`\`\`

DeepSeek V4 Pro requires Blackwell for the MXFP4 MoE path and runs at TP=8,
so we use eight B200s.

\`\`\`python
GPU_TYPE = "B200"
GPU_COUNT = 8

COMPUTE_REGION = "us"
ROUTING_REGION = "us-east"

MIN_CONTAINERS = 0  # Set to 1 for production to keep a warm replica

TARGET_INPUTS = 10  # Concurrent requests per replica before scaling

\`\`\`

### Define the server

\`\`\`python
SGLANG_PORT = 8000
MINUTES = 60  # seconds
HOURS = 60 * MINUTES


@app.server(
    image=image,
    gpu=f"{GPU_TYPE}:{GPU_COUNT}",
    scaledown_window=20 * MINUTES,
    startup_timeout=3 * HOURS,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    compute_region=COMPUTE_REGION,
    min_containers=MIN_CONTAINERS,
    port=SGLANG_PORT,
    routing_region=ROUTING_REGION,
    exit_grace_period=25,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class Server:
    @modal.enter()
    def start(self):
        """Start SGLang server process and wait for it to be ready"""
        self.proc = _start_server()
        wait_for_server_ready()

    @modal.exit()
    def stop(self):
        """Terminate the SGLang server process"""
        self.proc.terminate()
        self.proc.wait()


def wait_for_server_ready():
    """Wait for SGLang server to be ready"""
    import requests

    url = f"http://localhost:{SGLANG_PORT}/health"
    print(f"Waiting for server to be ready at {url}")

    while True:
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                print("Server is ready!")
                return
        except requests.exceptions.RequestException:
            pass
        time.sleep(5)


\`\`\`

## Test the server

\`\`\`bash
modal run 06_gpu_and_ml/llm-serving/deepseek_v4.py
\`\`\`

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=3 * HOURS, content=None, twice=True):
    """Test the model serving endpoint"""
    url = await Server.get_url.aio()

    system_prompt = {"role": "system", "content": "You are a helpful AI assistant."}

    if content is None:
        content = "Explain the transformer architecture in one paragraph."

    messages = [system_prompt, {"role": "user", "content": content}]

    print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
    await probe(url, messages, timeout=test_timeout)

    if twice:
        messages[1]["content"] = "Write five different programs in Python and Rust."
        print(f"Sending second request to {url}:", *messages, sep="\\n\\t")
        await probe(url, messages, timeout=1 * MINUTES)


async def probe(url, messages, timeout=20 * MINUTES):
    """Send request with retry logic for startup delays"""
    deadline = time.time() + timeout
    async with aiohttp.ClientSession(base_url=url) as session:
        while time.time() < deadline:
            try:
                await _send_request_streaming(session, messages)
                return
            except asyncio.TimeoutError:
                await asyncio.sleep(1)
            except aiohttp.client_exceptions.ClientResponseError as e:
                if e.status == 503:  # Service Unavailable during startup
                    await asyncio.sleep(1)
                    continue
                raise e
    raise TimeoutError(f"No response from server within {timeout} seconds")


\`\`\`

## Deploy the server

\`\`\`bash
modal deploy 06_gpu_and_ml/llm-serving/deepseek_v4.py
\`\`\`

\`\`\`python
async def _send_request_streaming(
    session: aiohttp.ClientSession, messages: list, timeout: int | None = None
):
    """Stream response from chat completions endpoint"""
    payload = {
        "messages": messages,
        "stream": True,
    }
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
            chunk = delta.get("content") or delta.get("reasoning_content")

            if chunk:
                print(
                    chunk,
                    end="",
                    flush="\\n" in chunk or "." in chunk or len(chunk) > 100,
                )
                full_text += chunk
        print()

\`\`\`
`,meta:{title:`Serve DeepSeek V4 Pro on Modal with SGLang`,description:`The DeepSeek V4 Pro weights are delivered in mixed MXFP4 and run through SGLang’s flashinfer_mxfp4 MoE runner backend on Blackwell, with EAGLE speculative decoding for low/moderate concurrency time-per-output-token.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>The DeepSeek V4 Pro weights are delivered in mixed MXFP4 and run through SGLang’s <code>flashinfer_mxfp4</code> MoE runner backend on Blackwell, with EAGLE speculative decoding
for low/moderate concurrency time-per-output-token.</p> <!> <!> <p>We use the <code>deepseek-v4-blackwell</code> tag of the SGLang image, which is the
Blackwell-tuned build the SGLang team recommends for V4.</p> <!> <!> <p>We cache weights in a Modal <!> and skip the download entirely
when iterating with <code>dummy</code> weights.</p> <!> <!> <p>We base the configuration of the engine on SGLang’s <!>.</p> <p><strong>Environment variables</strong></p> <!> <p>You can also send any additional SGLang env vars set locally at deploy time.</p> <!> <p><strong>YAML</strong></p> <!> <p><strong>Command-line arguments</strong></p> <!> <!> <!> <p>DeepSeek V4 Pro requires Blackwell for the MXFP4 MoE path and runs at TP=8,
so we use eight B200s.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`serve-deepseek-v4-pro-on-modal-with-sglang`,children:(e,t)=>{l(),i(e,r(`Serve DeepSeek V4 Pro on Modal with SGLang`))},$$slots:{default:!0}});var g=c(m,4);p(g,{code:`import%20asyncio%0Aimport%20json%0Aimport%20os%0Aimport%20subprocess%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0Ahere%20%3D%20Path(__file__).parent%0A`,lang:`python`});var _=c(g,2);u(_,{id:`set-up-the-container-image`,children:(e,t)=>{l(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var v=c(_,4);p(v,{code:`image%20%3D%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Adeepseek-v4-blackwell%22).entrypoint(%0A%20%20%20%20%5B%5D%20%20%23%20silence%20chatty%20logs%20on%20entry%0A)%0A`,lang:`python`});var y=c(v,2);d(y,{id:`load-model-weights`,children:(e,t)=>{l(),i(e,r(`Load model weights`))},$$slots:{default:!0}});var x=c(y,2);h(c(e(x)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(3),n(x);var S=c(x,2);p(S,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%20%20%20%20%22CUDA_VISIBLE_DEVICES%22%3A%20%220%2C1%2C2%2C3%2C4%2C5%2C6%2C7%22%2C%0A%20%20%20%20%7D%0A)%0A%0A%0Adef%20download_model(repo_id%2C%20revision%3DNone)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(repo_id%3Drepo_id%2C%20revision%3Drevision)%0A%0A%0AREPO_ID%20%3D%20%22deepseek-ai%2FDeepSeek-V4-Pro%22%0A%0Aimage%20%3D%20image.run_function(%0A%20%20%20%20download_model%2C%0A%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20args%3D(REPO_ID%2C)%2C%0A)%0A`,lang:`python`});var C=c(S,2);d(C,{id:`configure-the-inference-engine`,children:(e,t)=>{l(),i(e,r(`Configure the inference engine`))},$$slots:{default:!0}});var w=c(C,2);h(c(e(w)),{href:`https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official cookbook recipe`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,4);p(T,{code:`image%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22SGLANG_ENABLE_SPEC_V2%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_ENABLE_THINKING%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_JIT_DEEPGEMM_PRECOMPILE%22%3A%20%220%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var E=c(T,4);p(E,{code:`def%20is_sglang_env_var(key)%3A%0A%20%20%20%20return%20key.startswith(%22SGL_%22)%20or%20key.startswith(%22SGLANG_%22)%0A%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7Bkey%3A%20value%20for%20key%2C%20value%20in%20os.environ.items()%20if%20is_sglang_env_var(key)%7D%0A)%0A`,lang:`python`});var D=c(E,4);p(D,{code:`default_config%20%3D%20%22%22%22%5C%0A%20%23%20General%20Config%0A%20host%3A%200.0.0.0%0A%20log-level%3A%20debug%20%20%23%20very%20noisy%0A%0A%20%23%20Model%20Config%0A%20tool-call-parser%3A%20deepseekv4%0A%20reasoning-parser%3A%20deepseek-v4%0A%20trust-remote-code%3A%20true%0A%0A%20%23%20Memory%0A%20mem-fraction-static%3A%200.82%0A%20chunked-prefill-size%3A%204096%0A%0A%20%23%20MoE%0A%20moe-runner-backend%3A%20flashinfer_mxfp4%0A%0A%20%23%20Observability%0A%20enable-metrics%3A%20true%0A%20collect-tokens-histogram%3A%20true%0A%0A%20%23%20Batching%0A%20max-running-requests%3A%2032%0A%20cuda-graph-max-bs%3A%2032%0A%0A%20%23%20SpecDec%20(EAGLE%2C%20as%20recommended%20by%20the%20DeepSeek%20V4%20release%20notes)%0A%20speculative-algorithm%3A%20EAGLE%0A%20speculative-num-steps%3A%203%0A%20speculative-eagle-topk%3A%201%0A%20speculative-num-draft-tokens%3A%204%0A%0A%20%23%20Tuning%0A%20disable-flashinfer-autotune%3A%20true%0A%22%22%22%0A%0Alocal_config_path%20%3D%20os.environ.get(%22APP_LOCAL_CONFIG_PATH%22)%0A%0Aif%20modal.is_local()%3A%0A%20%20%20%20if%20local_config_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20local_config_path%20%3D%20here%20%2F%20%22config_deepseek_v4.yaml%22%0A%0A%20%20%20%20%20%20%20%20if%20not%20local_config_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20local_config_path.write_text(default_config)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Using%20default%20config%20from%20%7Blocal_config_path.relative_to(here)%7D%3A%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20default_config%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20image%20%3D%20image.add_local_file(local_config_path%2C%20%22%2Froot%2Fconfig.yaml%22)%0A`,lang:`python`});var O=c(D,4);p(O,{code:`def%20_start_server()%20-%3E%20subprocess.Popen%3A%0A%20%20%20%20%22%22%22Start%20SGLang%20server%20in%20a%20subprocess%22%22%22%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(SGLANG_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20REPO_ID%2C%0A%20%20%20%20%20%20%20%20%22--tp-size%22%2C%0A%20%20%20%20%20%20%20%20str(GPU_COUNT)%2C%0A%20%20%20%20%20%20%20%20%22--config%22%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2Fconfig.yaml%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20print(%22Starting%20SGLang%20server%20with%20command%3A%22)%0A%20%20%20%20print(*cmd)%0A%0A%20%20%20%20return%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue%2C%20start_new_session%3DTrue)%0A%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20sglang%20%20%23%20noqa%0A`,lang:`python`});var k=c(O,2);u(k,{id:`configure-infrastructure`,children:(e,t)=>{l(),i(e,r(`Configure infrastructure`))},$$slots:{default:!0}});var A=c(k,2);p(A,{code:`app%20%3D%20modal.App(%22example-deepseek-v4%22%2C%20image%3Dimage)%0A`,lang:`python`});var j=c(A,4);p(j,{code:`GPU_TYPE%20%3D%20%22B200%22%0AGPU_COUNT%20%3D%208%0A%0ACOMPUTE_REGION%20%3D%20%22us%22%0AROUTING_REGION%20%3D%20%22us-east%22%0A%0AMIN_CONTAINERS%20%3D%200%20%20%23%20Set%20to%201%20for%20production%20to%20keep%20a%20warm%20replica%0A%0ATARGET_INPUTS%20%3D%2010%20%20%23%20Concurrent%20requests%20per%20replica%20before%20scaling%0A`,lang:`python`});var M=c(j,2);d(M,{id:`define-the-server`,children:(e,t)=>{l(),i(e,r(`Define the server`))},$$slots:{default:!0}});var N=c(M,2);p(N,{code:`SGLANG_PORT%20%3D%208000%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AHOURS%20%3D%2060%20*%20MINUTES%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3Df%22%7BGPU_TYPE%7D%3A%7BGPU_COUNT%7D%22%2C%0A%20%20%20%20scaledown_window%3D20%20*%20MINUTES%2C%0A%20%20%20%20startup_timeout%3D3%20*%20HOURS%2C%0A%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20compute_region%3DCOMPUTE_REGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20port%3DSGLANG_PORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20exit_grace_period%3D25%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20SGLang%20server%20process%20and%20wait%20for%20it%20to%20be%20ready%22%22%22%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20_start_server()%0A%20%20%20%20%20%20%20%20wait_for_server_ready()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Terminate%20the%20SGLang%20server%20process%22%22%22%0A%20%20%20%20%20%20%20%20self.proc.terminate()%0A%20%20%20%20%20%20%20%20self.proc.wait()%0A%0A%0Adef%20wait_for_server_ready()%3A%0A%20%20%20%20%22%22%22Wait%20for%20SGLang%20server%20to%20be%20ready%22%22%22%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20url%20%3D%20f%22http%3A%2F%2Flocalhost%3A%7BSGLANG_PORT%7D%2Fhealth%22%0A%20%20%20%20print(f%22Waiting%20for%20server%20to%20be%20ready%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20resp%20%3D%20requests.get(url%2C%20timeout%3D5)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status_code%20%3D%3D%20200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Server%20is%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20requests.exceptions.RequestException%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var F=c(P,2);p(F,{code:`modal%20run%2006_gpu_and_ml%2Fllm-serving%2Fdeepseek_v4.py`,lang:`bash`});var I=c(F,2);p(I,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D3%20*%20HOURS%2C%20content%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20%22%22%22Test%20the%20model%20serving%20endpoint%22%22%22%0A%20%20%20%20url%20%3D%20await%20Server.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%22role%22%3A%20%22system%22%2C%20%22content%22%3A%20%22You%20are%20a%20helpful%20AI%20assistant.%22%7D%0A%0A%20%20%20%20if%20content%20is%20None%3A%0A%20%20%20%20%20%20%20%20content%20%3D%20%22Explain%20the%20transformer%20architecture%20in%20one%20paragraph.%22%0A%0A%20%20%20%20messages%20%3D%20%5Bsystem_prompt%2C%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%5D%0A%0A%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B1%5D%5B%22content%22%5D%20%3D%20%22Write%20five%20different%20programs%20in%20Python%20and%20Rust.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20second%20request%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A%0Aasync%20def%20probe(url%2C%20messages%2C%20timeout%3D20%20*%20MINUTES)%3A%0A%20%20%20%20%22%22%22Send%20request%20with%20retry%20logic%20for%20startup%20delays%22%22%22%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%20%20%23%20Service%20Unavailable%20during%20startup%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A`,lang:`python`});var L=c(I,2);u(L,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var R=c(L,2);p(R,{code:`modal%20deploy%2006_gpu_and_ml%2Fllm-serving%2Fdeepseek_v4.py`,lang:`bash`}),p(c(R,2),{code:`async%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%3A%0A%20%20%20%20%22%22%22Stream%20response%20from%20chat%20completions%20endpoint%22%22%22%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20messages%2C%0A%20%20%20%20%20%20%20%20%22stream%22%3A%20True%2C%0A%20%20%20%20%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%20or%20delta.get(%22reasoning_content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20end%3D%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk%20or%20len(chunk)%20%3E%20100%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=B--q-duI.js.map
