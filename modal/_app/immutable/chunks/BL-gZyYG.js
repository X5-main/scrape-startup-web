(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7bab194f-b606-4cce-a667-4ab58875306b`,e._sentryDebugIdIdentifier=`sentry-dbid-7bab194f-b606-4cce-a667-4ab58875306b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Serve Inkling-Small on Modal with SGLang`,id:`serve-inkling-small-on-modal-with-sglang`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Load model weights`,id:`load-model-weights`},{depth:3,value:`Cache compiled kernels`,id:`cache-compiled-kernels`},{depth:3,value:`Configure the inference engine`,id:`configure-the-inference-engine`}]},{depth:2,value:`Configure infrastructure`,id:`configure-infrastructure`,children:[{depth:3,value:`Define the server`,id:`define-the-server`}]},{depth:2,value:`Test the server`,id:`test-the-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Serve Inkling-Small on Modal with SGLang

[Inkling-Small](https://huggingface.co/thinkingmachines/Inkling-Small) is a multimodal
mixture-of-experts model from Thinking Machines Lab that accepts text, images, and audio.
Its decoder combines sliding-window and full-attention layers to lower the cost of long
context inference.

This example serves the NVFP4 checkpoint which requires Blackwell GPUs (B200/B300s)
to support its native four-bit tensor-core path.

The engine flags follow SGLang's
[recipe](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small#hw=b300&variant=default&quant=nvfp4&strategy=mtp&nodes=single).

For more on serving large models efficiently, see the
[high-performance LLM inference guide](https://modal.com/docs/guide/high-performance-llm-inference).
For a simpler introduction to LLM serving on Modal, see
[this example](https://modal.com/docs/examples/llm_inference).

\`\`\`python
import json
import subprocess
import time
import urllib.error
import urllib.request

import modal

\`\`\`

## Set up the container image

\`\`\`python
SGLANG_IMAGE = (
    "lmsysorg/sglang:dev-inkling-dspark"
    "@sha256:fbea1a4e25b26660dbc2384a27ead8817e9b7670f257b5c3143e0450d14524d7"
)

image = modal.Image.from_registry(SGLANG_IMAGE).entrypoint(
    []  # silence chatty logs on entry
)

\`\`\`

### Load model weights

Cache the weights in a Modal [Volume](https://modal.com/docs/guide/volumes)
to avoid downloading them on every cold start.
Note that the SGLang image already has files under \`/root/.cache/huggingface\`,
so we mount the Volume at \`/cache\` and point \`HF_HOME\` there.

\`\`\`python
HF_CACHE_DIR = "/cache"
hf_cache_vol = modal.Volume.from_name("inkling-hf-cache", create_if_missing=True)

image = image.env(
    {
        "HF_HOME": HF_CACHE_DIR,
        "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
    }
)

\`\`\`

Inkling's repositories require accepting the license, so downloading needs a Hugging
Face token. Create the [Secret](https://modal.com/docs/guide/secrets) with:

\`\`\`
modal secret create huggingface-secret HF_TOKEN=hf_...
\`\`\`

\`\`\`python
hf_secret = modal.Secret.from_name("huggingface-secret")

REPO_ID = "thinkingmachines/Inkling-Small-NVFP4"


def download_model(repo_id, revision=None):
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id, revision=revision, max_workers=16)


image = image.run_function(
    download_model,
    volumes={HF_CACHE_DIR: hf_cache_vol},
    secrets=[hf_secret],
    args=(REPO_ID,),
    timeout=4 * 60 * 60,
    cpu=8,  # parallel shard downloads are CPU-bound on hashing
)

\`\`\`

### Cache compiled kernels

\`\`\`python
COMPILE_CACHE_DIR = "/compile-cache"
compile_cache_vol = modal.Volume.from_name(
    "inkling-compile-cache", create_if_missing=True
)

image = image.env(
    {
        "TORCHINDUCTOR_CACHE_DIR": f"{COMPILE_CACHE_DIR}/inductor",
        "TRITON_CACHE_DIR": f"{COMPILE_CACHE_DIR}/triton",
        "SGLANG_CACHE_DIR": f"{COMPILE_CACHE_DIR}/sglang",
        "SGLANG_ENABLE_UNIFIED_RADIX_TREE": "1",
    }
)

\`\`\`

### Configure the inference engine

\`\`\`python
ENABLE_MTP = True
MEM_FRACTION_STATIC = "0.70" if ENABLE_MTP else "0.85"
MAX_TOTAL_TOKENS = 262_144

SGLANG_PORT = 8000
MINUTES = 60  # seconds
HOURS = 60 * MINUTES


def _server_command() -> list[str]:
    cmd = [
        "python3",
        "-m",
        "sglang.launch_server",
        "--host",
        "0.0.0.0",
        "--port",
        str(SGLANG_PORT),
        "--model-path",
        REPO_ID,
        "--served-model-name",
        "inkling-small",
        "--trust-remote-code",
        "--tp",
        str(GPU_COUNT),
        "--quantization",
        "modelopt_fp4",
        "--attention-backend",
        "fa4",
        "--page-size",
        "128",
        "--fp4-gemm-backend",
        "flashinfer_trtllm",
        "--moe-runner-backend",
        "flashinfer_trtllm_routed",
        "--mamba-radix-cache-strategy",
        "extra_buffer",
        "--mem-fraction-static",
        MEM_FRACTION_STATIC,
        "--swa-full-tokens-ratio",
        "0.1",
        "--mamba-full-memory-ratio",
        "0.1",
        "--enable-multimodal",
        "--reasoning-parser",
        "inkling",
        "--tool-call-parser",
        "inkling",
        "--enable-metrics",
        # Skip SGLang's startup request. If that first generation fails, SGLang exits
        # before the server reports ready.
        "--skip-server-warmup",
    ]

    if ENABLE_MTP:
        cmd += [
            "--speculative-algorithm",
            "EAGLE",
            "--speculative-num-steps",
            "8",
            "--speculative-eagle-topk",
            "1",
            "--speculative-num-draft-tokens",
            "9",
            "--enable-multi-layer-eagle",
            "--speculative-use-rejection-sampling",
            "--max-total-tokens",
            str(MAX_TOTAL_TOKENS),
            "--max-running-requests",
            str(TARGET_INPUTS),
        ]

    if GPU_COUNT in (6, 8):
        cmd.append("--enable-torch-symm-mem")

    return cmd


\`\`\`

## Configure infrastructure

The NVFP4 weights are about 171 GB. A single B300 has 288 GB, which leaves enough
memory for the model, target KV cache, and MTP draft pools.

\`\`\`python
GPU_TYPE = "B300"
GPU_COUNT = 1

MIN_CONTAINERS = 0  # set to 1 in production to keep a warm replica

TARGET_INPUTS = 32  # concurrent requests per replica before scaling out

app = modal.App("example-inkling-small", image=image)

\`\`\`

### Define the server

\`\`\`python
@app.server(
    image=image,
    gpu=f"{GPU_TYPE}:{GPU_COUNT}",
    volumes={HF_CACHE_DIR: hf_cache_vol, COMPILE_CACHE_DIR: compile_cache_vol},
    secrets=[hf_secret],
    cpu=32,
    port=SGLANG_PORT,
    startup_timeout=1 * HOURS,
    scaledown_window=20 * MINUTES,
    exit_grace_period=25,
    min_containers=MIN_CONTAINERS,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class Server:
    @modal.enter()
    def start(self):
        cmd = _server_command()
        print("starting SGLang with command:")
        print(" ".join(cmd))
        self.proc = subprocess.Popen(" ".join(cmd), shell=True, start_new_session=True)
        wait_for_server_ready(self.proc)

    @modal.exit()
    def stop(self):
        self.proc.terminate()
        self.proc.wait()


def is_server_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            return response.status == 200
    except (urllib.error.URLError, OSError, TimeoutError):
        return False


def wait_for_server_ready(proc: subprocess.Popen):
    url = f"http://localhost:{SGLANG_PORT}/health"
    print(f"waiting for server to be ready at {url}")

    while True:
        # Surface a crashed engine immediately instead of waiting out startup_timeout.
        if proc.poll() is not None:
            raise RuntimeError(
                f"SGLang exited with code {proc.returncode} before becoming healthy"
            )
        if is_server_up(url):
            print("server is ready!")
            return
        time.sleep(5)


def wait_for_endpoint(url: str, timeout=1 * HOURS) -> None:
    deadline = time.monotonic() + timeout
    health = f"{url.rstrip('/')}/health"
    while True:
        if is_server_up(health):
            return
        if time.monotonic() >= deadline:
            raise TimeoutError("Timed out waiting for the Server endpoint.")
        time.sleep(5)


\`\`\`

## Test the server

The server supports the OpenAI chat completions API.
To spin up an ephemeral server and send it a request:

\`\`\`
modal run 06_gpu_and_ml/llm-serving/inkling_small.py
\`\`\`

Notably, Inkling's chat template takes a *reasoning effort* which can be set via a
string (\`none\`, \`minimal\`, \`low\`, \`medium\`, \`high\`, \`max\`) or a number from 0.0 to 0.99.

\`\`\`python
@app.local_entrypoint()
def main(
    prompt: str = "In one sentence, why is sliding-window attention cheap?",
    reasoning_effort: str = "medium",
):
    url = Server.get_url()
    print(f"Server URL: {url}")
    wait_for_endpoint(url)

    payload = {
        "model": "inkling-small",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 512,
        "chat_template_kwargs": {"reasoning_effort": reasoning_effort},
    }
    req = urllib.request.Request(
        f"{url}/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    print(f"sending a request to {url}")
    with urllib.request.urlopen(req, timeout=1 * HOURS) as resp:
        body = json.loads(resp.read())

    message = body["choices"][0]["message"]
    if message.get("reasoning_content"):
        print("--- reasoning ---")
        print(message["reasoning_content"])
    print("--- answer ---")
    print(message.get("content"))
    print("--- usage ---")
    print(body.get("usage"))


\`\`\`

## Deploy the server

\`\`\`
modal deploy 06_gpu_and_ml/llm-serving/inkling_small.py
\`\`\`

## Addenda

For demonstration purposes, the endpoint is publicly accessible with \`unauthenticated=True\`. Add
[proxy auth](https://modal.com/docs/guide/webhook-urls#authentication) before sending
private data.

Set \`ENABLE_MTP = False\` to disable speculation, which
we recommend once large batches saturate the GPU.
`,meta:{title:`Serve Inkling-Small on Modal with SGLang`,description:`Inkling-Small is a multimodal mixture-of-experts model from Thinking Machines Lab that accepts text, images, and audio. Its decoder combines sliding-window and full-attention layers to lower the cost of long context inference.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p><!> is a multimodal
mixture-of-experts model from Thinking Machines Lab that accepts text, images, and audio.
Its decoder combines sliding-window and full-attention layers to lower the cost of long
context inference.</p> <p>This example serves the NVFP4 checkpoint which requires Blackwell GPUs (B200/B300s)
to support its native four-bit tensor-core path.</p> <p>The engine flags follow SGLang’s <!>.</p> <p>For more on serving large models efficiently, see the <!>.
For a simpler introduction to LLM serving on Modal, see <!>.</p> <!> <!> <!> <!> <p>Cache the weights in a Modal <!> to avoid downloading them on every cold start.
Note that the SGLang image already has files under <code>/root/.cache/huggingface</code>,
so we mount the Volume at <code>/cache</code> and point <code>HF_HOME</code> there.</p> <!> <p>Inkling’s repositories require accepting the license, so downloading needs a Hugging
Face token. Create the <!> with:</p> <!> <!> <!> <!> <!> <!> <!> <p>The NVFP4 weights are about 171 GB. A single B300 has 288 GB, which leaves enough
memory for the model, target KV cache, and MTP draft pools.</p> <!> <!> <!> <!> <p>The server supports the OpenAI chat completions API.
To spin up an ephemeral server and send it a request:</p> <!> <p>Notably, Inkling’s chat template takes a <em>reasoning effort</em> which can be set via a
string (<code>none</code>, <code>minimal</code>, <code>low</code>, <code>medium</code>, <code>high</code>, <code>max</code>) or a number from 0.0 to 0.99.</p> <!> <!> <!> <!> <p>For demonstration purposes, the endpoint is publicly accessible with <code>unauthenticated=True</code>. Add <!> before sending
private data.</p> <p>Set <code>ENABLE_MTP = False</code> to disable speculation, which
we recommend once large batches saturate the GPU.</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`serve-inkling-small-on-modal-with-sglang`,children:(e,t)=>{l(),i(e,r(`Serve Inkling-Small on Modal with SGLang`))},$$slots:{default:!0}});var g=c(m,2);h(e(g),{href:`https://huggingface.co/thinkingmachines/Inkling-Small`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Inkling-Small`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,4);h(c(e(_)),{href:`https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small#hw=b300&variant=default&quant=nvfp4&strategy=mtp&nodes=single`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`recipe`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2),y=c(e(v));h(y,{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`high-performance LLM inference guide`))},$$slots:{default:!0}}),h(c(y,2),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(v);var x=c(v,2);p(x,{code:`import%20json%0Aimport%20subprocess%0Aimport%20time%0Aimport%20urllib.error%0Aimport%20urllib.request%0A%0Aimport%20modal%0A`,lang:`python`});var S=c(x,2);u(S,{id:`set-up-the-container-image`,children:(e,t)=>{l(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var C=c(S,2);p(C,{code:`SGLANG_IMAGE%20%3D%20(%0A%20%20%20%20%22lmsysorg%2Fsglang%3Adev-inkling-dspark%22%0A%20%20%20%20%22%40sha256%3Afbea1a4e25b26660dbc2384a27ead8817e9b7670f257b5c3143e0450d14524d7%22%0A)%0A%0Aimage%20%3D%20modal.Image.from_registry(SGLANG_IMAGE).entrypoint(%0A%20%20%20%20%5B%5D%20%20%23%20silence%20chatty%20logs%20on%20entry%0A)%0A`,lang:`python`});var w=c(C,2);d(w,{id:`load-model-weights`,children:(e,t)=>{l(),i(e,r(`Load model weights`))},$$slots:{default:!0}});var T=c(w,2);h(c(e(T)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(7),n(T);var E=c(T,2);p(E,{code:`HF_CACHE_DIR%20%3D%20%22%2Fcache%22%0Ahf_cache_vol%20%3D%20modal.Volume.from_name(%22inkling-hf-cache%22%2C%20create_if_missing%3DTrue)%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20HF_CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secret`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);p(O,{code:`modal%20secret%20create%20huggingface-secret%20HF_TOKEN%3Dhf_...`,lang:`text`});var k=c(O,2);p(k,{code:`hf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A%0AREPO_ID%20%3D%20%22thinkingmachines%2FInkling-Small-NVFP4%22%0A%0A%0Adef%20download_model(repo_id%2C%20revision%3DNone)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(repo_id%3Drepo_id%2C%20revision%3Drevision%2C%20max_workers%3D16)%0A%0A%0Aimage%20%3D%20image.run_function(%0A%20%20%20%20download_model%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_DIR%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20args%3D(REPO_ID%2C)%2C%0A%20%20%20%20timeout%3D4%20*%2060%20*%2060%2C%0A%20%20%20%20cpu%3D8%2C%20%20%23%20parallel%20shard%20downloads%20are%20CPU-bound%20on%20hashing%0A)%0A`,lang:`python`});var A=c(k,2);d(A,{id:`cache-compiled-kernels`,children:(e,t)=>{l(),i(e,r(`Cache compiled kernels`))},$$slots:{default:!0}});var j=c(A,2);p(j,{code:`COMPILE_CACHE_DIR%20%3D%20%22%2Fcompile-cache%22%0Acompile_cache_vol%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22inkling-compile-cache%22%2C%20create_if_missing%3DTrue%0A)%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_CACHE_DIR%22%3A%20f%22%7BCOMPILE_CACHE_DIR%7D%2Finductor%22%2C%0A%20%20%20%20%20%20%20%20%22TRITON_CACHE_DIR%22%3A%20f%22%7BCOMPILE_CACHE_DIR%7D%2Ftriton%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_CACHE_DIR%22%3A%20f%22%7BCOMPILE_CACHE_DIR%7D%2Fsglang%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_ENABLE_UNIFIED_RADIX_TREE%22%3A%20%221%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var M=c(j,2);d(M,{id:`configure-the-inference-engine`,children:(e,t)=>{l(),i(e,r(`Configure the inference engine`))},$$slots:{default:!0}});var N=c(M,2);p(N,{code:`ENABLE_MTP%20%3D%20True%0AMEM_FRACTION_STATIC%20%3D%20%220.70%22%20if%20ENABLE_MTP%20else%20%220.85%22%0AMAX_TOTAL_TOKENS%20%3D%20262_144%0A%0ASGLANG_PORT%20%3D%208000%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AHOURS%20%3D%2060%20*%20MINUTES%0A%0A%0Adef%20_server_command()%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22python3%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(SGLANG_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20REPO_ID%2C%0A%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%22inkling-small%22%2C%0A%20%20%20%20%20%20%20%20%22--trust-remote-code%22%2C%0A%20%20%20%20%20%20%20%20%22--tp%22%2C%0A%20%20%20%20%20%20%20%20str(GPU_COUNT)%2C%0A%20%20%20%20%20%20%20%20%22--quantization%22%2C%0A%20%20%20%20%20%20%20%20%22modelopt_fp4%22%2C%0A%20%20%20%20%20%20%20%20%22--attention-backend%22%2C%0A%20%20%20%20%20%20%20%20%22fa4%22%2C%0A%20%20%20%20%20%20%20%20%22--page-size%22%2C%0A%20%20%20%20%20%20%20%20%22128%22%2C%0A%20%20%20%20%20%20%20%20%22--fp4-gemm-backend%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer_trtllm%22%2C%0A%20%20%20%20%20%20%20%20%22--moe-runner-backend%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer_trtllm_routed%22%2C%0A%20%20%20%20%20%20%20%20%22--mamba-radix-cache-strategy%22%2C%0A%20%20%20%20%20%20%20%20%22extra_buffer%22%2C%0A%20%20%20%20%20%20%20%20%22--mem-fraction-static%22%2C%0A%20%20%20%20%20%20%20%20MEM_FRACTION_STATIC%2C%0A%20%20%20%20%20%20%20%20%22--swa-full-tokens-ratio%22%2C%0A%20%20%20%20%20%20%20%20%220.1%22%2C%0A%20%20%20%20%20%20%20%20%22--mamba-full-memory-ratio%22%2C%0A%20%20%20%20%20%20%20%20%220.1%22%2C%0A%20%20%20%20%20%20%20%20%22--enable-multimodal%22%2C%0A%20%20%20%20%20%20%20%20%22--reasoning-parser%22%2C%0A%20%20%20%20%20%20%20%20%22inkling%22%2C%0A%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%22inkling%22%2C%0A%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%0A%20%20%20%20%20%20%20%20%23%20Skip%20SGLang's%20startup%20request.%20If%20that%20first%20generation%20fails%2C%20SGLang%20exits%0A%20%20%20%20%20%20%20%20%23%20before%20the%20server%20reports%20ready.%0A%20%20%20%20%20%20%20%20%22--skip-server-warmup%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20if%20ENABLE_MTP%3A%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-algorithm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22EAGLE%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-num-steps%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%228%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-eagle-topk%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-num-draft-tokens%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%229%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-multi-layer-eagle%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-use-rejection-sampling%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-total-tokens%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(MAX_TOTAL_TOKENS)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-running-requests%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(TARGET_INPUTS)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20if%20GPU_COUNT%20in%20(6%2C%208)%3A%0A%20%20%20%20%20%20%20%20cmd.append(%22--enable-torch-symm-mem%22)%0A%0A%20%20%20%20return%20cmd%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`configure-infrastructure`,children:(e,t)=>{l(),i(e,r(`Configure infrastructure`))},$$slots:{default:!0}});var F=c(P,4);p(F,{code:`GPU_TYPE%20%3D%20%22B300%22%0AGPU_COUNT%20%3D%201%0A%0AMIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20in%20production%20to%20keep%20a%20warm%20replica%0A%0ATARGET_INPUTS%20%3D%2032%20%20%23%20concurrent%20requests%20per%20replica%20before%20scaling%20out%0A%0Aapp%20%3D%20modal.App(%22example-inkling-small%22%2C%20image%3Dimage)%0A`,lang:`python`});var I=c(F,2);d(I,{id:`define-the-server`,children:(e,t)=>{l(),i(e,r(`Define the server`))},$$slots:{default:!0}});var L=c(I,2);p(L,{code:`%40app.server(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3Df%22%7BGPU_TYPE%7D%3A%7BGPU_COUNT%7D%22%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_DIR%3A%20hf_cache_vol%2C%20COMPILE_CACHE_DIR%3A%20compile_cache_vol%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20cpu%3D32%2C%0A%20%20%20%20port%3DSGLANG_PORT%2C%0A%20%20%20%20startup_timeout%3D1%20*%20HOURS%2C%0A%20%20%20%20scaledown_window%3D20%20*%20MINUTES%2C%0A%20%20%20%20exit_grace_period%3D25%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20_server_command()%0A%20%20%20%20%20%20%20%20print(%22starting%20SGLang%20with%20command%3A%22)%0A%20%20%20%20%20%20%20%20print(%22%20%22.join(cmd))%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue%2C%20start_new_session%3DTrue)%0A%20%20%20%20%20%20%20%20wait_for_server_ready(self.proc)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.proc.terminate()%0A%20%20%20%20%20%20%20%20self.proc.wait()%0A%0A%0Adef%20is_server_up(url%3A%20str)%20-%3E%20bool%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(url%2C%20timeout%3D5)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20response.status%20%3D%3D%20200%0A%20%20%20%20except%20(urllib.error.URLError%2C%20OSError%2C%20TimeoutError)%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%0Adef%20wait_for_server_ready(proc%3A%20subprocess.Popen)%3A%0A%20%20%20%20url%20%3D%20f%22http%3A%2F%2Flocalhost%3A%7BSGLANG_PORT%7D%2Fhealth%22%0A%20%20%20%20print(f%22waiting%20for%20server%20to%20be%20ready%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%23%20Surface%20a%20crashed%20engine%20immediately%20instead%20of%20waiting%20out%20startup_timeout.%0A%20%20%20%20%20%20%20%20if%20proc.poll()%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22SGLang%20exited%20with%20code%20%7Bproc.returncode%7D%20before%20becoming%20healthy%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20is_server_up(url)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22server%20is%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A%0Adef%20wait_for_endpoint(url%3A%20str%2C%20timeout%3D1%20*%20HOURS)%20-%3E%20None%3A%0A%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20timeout%0A%20%20%20%20health%20%3D%20f%22%7Burl.rstrip('%2F')%7D%2Fhealth%22%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20if%20is_server_up(health)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20TimeoutError(%22Timed%20out%20waiting%20for%20the%20Server%20endpoint.%22)%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A`,lang:`python`});var R=c(L,2);u(R,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var z=c(R,4);p(z,{code:`modal%20run%2006_gpu_and_ml%2Fllm-serving%2Finkling_small.py`,lang:`text`});var B=c(z,4);p(B,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20str%20%3D%20%22In%20one%20sentence%2C%20why%20is%20sliding-window%20attention%20cheap%3F%22%2C%0A%20%20%20%20reasoning_effort%3A%20str%20%3D%20%22medium%22%2C%0A)%3A%0A%20%20%20%20url%20%3D%20Server.get_url()%0A%20%20%20%20print(f%22Server%20URL%3A%20%7Burl%7D%22)%0A%20%20%20%20wait_for_endpoint(url)%0A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20%22inkling-small%22%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%20512%2C%0A%20%20%20%20%20%20%20%20%22chat_template_kwargs%22%3A%20%7B%22reasoning_effort%22%3A%20reasoning_effort%7D%2C%0A%20%20%20%20%7D%0A%20%20%20%20req%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20f%22%7Burl%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20data%3Djson.dumps(payload).encode()%2C%0A%20%20%20%20%20%20%20%20headers%3D%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%2C%0A%20%20%20%20%20%20%20%20method%3D%22POST%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(f%22sending%20a%20request%20to%20%7Burl%7D%22)%0A%20%20%20%20with%20urllib.request.urlopen(req%2C%20timeout%3D1%20*%20HOURS)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20body%20%3D%20json.loads(resp.read())%0A%0A%20%20%20%20message%20%3D%20body%5B%22choices%22%5D%5B0%5D%5B%22message%22%5D%0A%20%20%20%20if%20message.get(%22reasoning_content%22)%3A%0A%20%20%20%20%20%20%20%20print(%22---%20reasoning%20---%22)%0A%20%20%20%20%20%20%20%20print(message%5B%22reasoning_content%22%5D)%0A%20%20%20%20print(%22---%20answer%20---%22)%0A%20%20%20%20print(message.get(%22content%22))%0A%20%20%20%20print(%22---%20usage%20---%22)%0A%20%20%20%20print(body.get(%22usage%22))%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var H=c(V,2);p(H,{code:`modal%20deploy%2006_gpu_and_ml%2Fllm-serving%2Finkling_small.py`,lang:`text`});var U=c(H,2);u(U,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}});var W=c(U,2);h(c(e(W),3),{href:`https://modal.com/docs/guide/webhook-urls#authentication`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`proxy auth`))},$$slots:{default:!0}}),l(),n(W),l(2),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BL-gZyYG.js.map
