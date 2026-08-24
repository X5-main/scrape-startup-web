(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`610e8861-a19d-45df-a4b7-a39bbd108692`,e._sentryDebugIdIdentifier=`sentry-dbid-610e8861-a19d-45df-a4b7-a39bbd108692`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Deploy DeepSeek-V4-Flash with SGLang and Modal`,id:`deploy-deepseek-v4-flash-with-sglang-and-modal`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Load and cache the model weights and kernels`,id:`load-and-cache-the-model-weights-and-kernels`}]},{depth:2,value:`Configure the infrastructure`,id:`configure-the-infrastructure`},{depth:2,value:`Define the inference server`,id:`define-the-inference-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Deploy DeepSeek-V4-Flash with SGLang and Modal

We'll show in this example how to serve
[DeepSeek-V4-Flash](https://arxiv.org/abs/2606.19348), a Mixture-of-Experts (MoE)
model with 284B total parameters and 13B active.

It achieves comparable reasoning performance to its bigger variant,
the [DeepSeek-V4-Pro preview](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro), while being much more compact in terms of
model parameters.

## Set up the container image

An issue currently exists with the drafter incorrectly rewriting states.
While not yet merged, we apply the fix in this
[open PR](https://github.com/sgl-project/sglang/pull/32183) manually
to the container image provided by the SGLang team.

\`\`\`python
import json
import shlex
import subprocess
import time
import urllib.error
import urllib.request

import modal

MINUTES = 60  # seconds
GB = 1024  # mb

PR32183_DIFF_URL = (
    "https://github.com/sgl-project/sglang/compare/"
    "5387e23ecd7dde4c383ae857983686e6a73bddf3..."
    "22ef431215b1d8529eaebd8e8c6de9510390afaf.diff"
)
PR32183_DIFF_SHA256 = "ddd65902ba570c158f9d6783604cf7d9f2f13bf41994fcbf330a68ea1909923c"

sglang_image = (
    modal.Image.from_registry("lmsysorg/sglang:nightly-dev-cu13-20260729-16a52bff")
    .entrypoint([])  # silence chatty logs on container start
    .run_commands(
        f"curl -fsSL {PR32183_DIFF_URL} -o /tmp/pr32183.diff",
        f"echo '{PR32183_DIFF_SHA256}  /tmp/pr32183.diff' | sha256sum -c -",
        "cd /sgl-workspace/sglang"
        " && git apply --stat --exclude=test/* /tmp/pr32183.diff"
        " && git apply --exclude=test/* /tmp/pr32183.diff",
        "rm -rf /root/.cache/huggingface",
    )
)

\`\`\`

### Load and cache the model weights and kernels

Downloads from the Hugging Face Hub are much faster if you are authenticated,
so we add a Hugging Face token as a [Modal Secret](https://modal.com/docs/guide/secrets) with:

\`\`\`
modal secret create huggingface-secret HF_TOKEN=hf_...
\`\`\`

\`\`\`python
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash-0731"
MODEL_REVISION = "9e165c30e2704aec5d9d593cce3eebd58bbef1cb"

hf_secret = modal.Secret.from_name("huggingface-secret")

\`\`\`

We don't want to load the model from the Hub every time we start the server.
So instead, we load the cached weights from a [Modal Volume](https://modal.com/docs/guide/volumes).

\`\`\`python
HF_CACHE_DIR = "/root/.cache/huggingface"
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

\`\`\`

We also want to turn on
[high performance downloads](https://huggingface.co/docs/hub/en/models-downloading#faster-downloads)
to fully saturate our network bandwidth.

\`\`\`python
sglang_image = sglang_image.env(
    {"HF_HUB_CACHE": HF_CACHE_DIR, "HF_XET_HIGH_PERFORMANCE": "1"}
)


def download_model(repo_id, revision=None):
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id, revision=revision, max_workers=16)


sglang_image = sglang_image.run_function(
    download_model,
    volumes={HF_CACHE_DIR: hf_cache_vol},
    secrets=[hf_secret],
    args=(MODEL_NAME, MODEL_REVISION),
    timeout=4 * 60 * MINUTES,
    cpu=8,
)

\`\`\`

As part of the loading process, the model compiles DeepGEMM and FlashInfer kernels.
To avoid recompilation on cold-starts, we specify a path to a Volume
for the compiled kernels to live in.

\`\`\`python
DG_CACHE_DIR = "/cache/deep_gemm"
FLASHINFER_CACHE_DIR = "/root/.cache/sglang/flashinfer"

dg_cache_vol = modal.Volume.from_name("sglang-deepgemm-cache", create_if_missing=True)
flashinfer_cache_vol = modal.Volume.from_name(
    "flashinfer-autotune-cache", create_if_missing=True
)

sglang_image = sglang_image.env(
    {
        "SGLANG_DG_CACHE_DIR": DG_CACHE_DIR,
        "SGLANG_JIT_DEEPGEMM_FAST_WARMUP": "1",
        "TILELANG_CACHE_DIR": f"{DG_CACHE_DIR}/tilelang",
    }
)

\`\`\`

## Configure the infrastructure

We choose a [GPU](https://modal.com/docs/guide/gpu) to deploy our inference server onto.
Conveniently, a single B300 can hold the model weights, KV cache, and speculative decoding module.
It offers excellent price-performance and supports both 8 bit and 4 bit
[quantized floating point](https://modal.com/llm-almanac/quant-formats) operations.

\`\`\`python
GPU_TYPE, GPU_COUNT = "B300", 1
CPU = 8
MEMORY = 96 * GB

\`\`\`

For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
This can be especially important to hit latency targets.
Here we set \`min_containers\` to \`0\` so you don't accidentally incur costs
when you're done running this example.

\`\`\`python
MIN_CONTAINERS = 0  # set to 1 in production to keep a warm replica

\`\`\`

Modal empowers you to decide how to scale up and down replicas
in response to load. Without autoscaling, users' requests will queue
when the server becomes overloaded or simply face higher latencies
once above a certain minimum number of concurrent requests.

\`\`\`python
TARGET_INPUTS = 24

\`\`\`

Modal considers a new replica ready to receive inputs once the
[\`modal.enter\`](https://modal.com/docs/guide/lifecycle-functions)
methods have exited and the container accepts connections.
To ensure that our server is actually ready for inputs,
we define helper functions to check and ensure the server is ready
from both within the container and a local client.

\`\`\`python
STARTUP_TIMEOUT = 60 * MINUTES


def is_server_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            return response.status == 200
    except (urllib.error.URLError, OSError, TimeoutError):
        return False


def wait_ready(proc: subprocess.Popen):
    url = f"http://localhost:{DEFAULT_PORT}/health"
    print(f"waiting for server to be ready at {url}")

    while True:
        if proc.poll() is not None:
            raise RuntimeError(
                f"SGLang exited with code {proc.returncode} before becoming healthy"
            )
        if is_server_up(url):
            print("server is ready!")
            return
        time.sleep(5)


def warmup():
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        req = urllib.request.Request(
            f"http://localhost:{DEFAULT_PORT}/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=5 * MINUTES) as resp:
                resp.read()
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            print(f"warmup request failed, continuing: {exc}")


def wait_for_endpoint(url: str, timeout: int = STARTUP_TIMEOUT) -> None:
    deadline = time.monotonic() + timeout
    health = f"{url.rstrip('/')}/health"
    while True:
        if is_server_up(health):
            return
        if time.monotonic() >= deadline:
            raise TimeoutError("Timed out waiting for the Server endpoint.")
        time.sleep(5)


\`\`\`

## Define the inference server

For maximum performance, we set a few bespoke enviroment variables.

\`\`\`python
sglang_image = sglang_image.env(
    {
        "NCCL_CUMEM_ENABLE": "1",
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
        "SGLANG_DEFAULT_THINKING": "false",
        "SGLANG_TIMEOUT_KEEP_ALIVE": f"{5 * MINUTES}",
        "TORCHINDUCTOR_COMPILE_THREADS": "1",
    }
)

\`\`\`

The engine flags below come from the
[SGLang DeepSeek-V4 cookbook](https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4#hw=b300&variant=flash-official&quant=fp4&strategy=low-latency&nodes=single).

\`\`\`python
DEFAULT_PORT = 8000


def _server_command() -> list[str]:
    cmd = [
        "sglang",
        "serve",
        "--model-path",
        MODEL_NAME,
        "--served-model-name",
        MODEL_NAME,
        "--revision",
        MODEL_REVISION,
        "--host",
        "0.0.0.0",
        "--port",
        str(DEFAULT_PORT),
        "--tp",
        str(GPU_COUNT),
        "--chunked-prefill-size",
        "4096",
        "--context-length",
        "268000",
        "--cuda-graph-max-bs-decode",
        "64",
        "--decode-log-interval",
        "200",
        "--default-chat-template-kwargs",
        '{"thinking":false}',
        "--disable-flashinfer-autotune",
        "--dist-timeout",
        f"{60 * MINUTES}",
        "--max-running-requests",
        "64",
        "--mem-fraction-static",
        "0.90",
        "--moe-a2a-backend",
        "none",
        "--moe-runner-backend",
        "flashinfer_mxfp4",
        "--reasoning-parser",
        "deepseek-v4",
        "--speculative-algorithm",
        "DSPARK",
        "--swa-full-tokens-ratio",
        "0.1",
        "--tool-call-parser",
        "deepseekv4",
        "--trust-remote-code",
        "--skip-server-warmup",
    ]
    return cmd


\`\`\`

Onto the main event that is defining our inference server.

\`\`\`python
app = modal.App(name="example-deepseek-v4-flash")


@app.server(
    image=sglang_image,
    gpu=f"{GPU_TYPE}:{GPU_COUNT}",
    volumes={
        HF_CACHE_DIR: hf_cache_vol,
        DG_CACHE_DIR: dg_cache_vol,
        FLASHINFER_CACHE_DIR: flashinfer_cache_vol,
    },
    cpu=CPU,
    memory=MEMORY,
    port=DEFAULT_PORT,
    startup_timeout=STARTUP_TIMEOUT,
    exit_grace_period=25,  # seconds, time to finish up requests when closing down
    min_containers=MIN_CONTAINERS,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class Server:
    @modal.enter()
    def startup(self):
        cmd = _server_command()
        print(shlex.join(cmd))
        self.proc = subprocess.Popen(cmd, start_new_session=True)
        wait_ready(self.proc)
        warmup()

    @modal.exit()
    def stop(self):
        self.proc.terminate()
        self.proc.wait()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy 06_gpu_and_ml/llm-serving/deepseek_v4_flash.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that hits the server with a simple client.

If you execute the command

\`\`\`bash
modal run 06_gpu_and_ml/llm-serving/deepseek_v4_flash.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

This is akin to running simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
def main(
    prompt: str = "Explain why tech bros and climbers are an increasing phenomenon.",
):
    url = Server.get_url()
    print(f"server url: {url}")
    wait_for_endpoint(url)

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0,
    }
    req = urllib.request.Request(
        f"{url}/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    print(f"sending a request to {url}")
    with urllib.request.urlopen(req, timeout=STARTUP_TIMEOUT) as resp:
        body = json.loads(resp.read())

    message = body["choices"][0]["message"]
    print(message.get("content"))
    print(body.get("usage"))

\`\`\`
`,meta:{title:`Deploy DeepSeek-V4-Flash with SGLang and Modal`,description:`We’ll show in this example how to serve DeepSeek-V4-Flash, a Mixture-of-Experts (MoE) model with 284B total parameters and 13B active.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal.enter</code>`),x=t(`<!> <p>We’ll show in this example how to serve <!>, a Mixture-of-Experts (MoE)
model with 284B total parameters and 13B active.</p> <p>It achieves comparable reasoning performance to its bigger variant,
the <!>, while being much more compact in terms of
model parameters.</p> <!> <p>An issue currently exists with the drafter incorrectly rewriting states.
While not yet merged, we apply the fix in this <!> manually
to the container image provided by the SGLang team.</p> <!> <!> <p>Downloads from the Hugging Face Hub are much faster if you are authenticated,
so we add a Hugging Face token as a <!> with:</p> <!> <!> <p>We don’t want to load the model from the Hub every time we start the server.
So instead, we load the cached weights from a <!>.</p> <!> <p>We also want to turn on <!> to fully saturate our network bandwidth.</p> <!> <p>As part of the loading process, the model compiles DeepGEMM and FlashInfer kernels.
To avoid recompilation on cold-starts, we specify a path to a Volume
for the compiled kernels to live in.</p> <!> <!> <p>We choose a <!> to deploy our inference server onto.
Conveniently, a single B300 can hold the model weights, KV cache, and speculative decoding module.
It offers excellent price-performance and supports both 8 bit and 4 bit <!> operations.</p> <!> <p>For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
This can be especially important to hit latency targets.
Here we set <code>min_containers</code> to <code>0</code> so you don’t accidentally incur costs
when you’re done running this example.</p> <!> <p>Modal empowers you to decide how to scale up and down replicas
in response to load. Without autoscaling, users’ requests will queue
when the server becomes overloaded or simply face higher latencies
once above a certain minimum number of concurrent requests.</p> <!> <p>Modal considers a new replica ready to receive inputs once the <!> methods have exited and the container accepts connections.
To ensure that our server is actually ready for inputs,
we define helper functions to check and ensure the server is ready
from both within the container and a local client.</p> <!> <!> <p>For maximum performance, we set a few bespoke enviroment variables.</p> <!> <p>The engine flags below come from the <!>.</p> <!> <p>Onto the main event that is defining our inference server.</p> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>This is akin to running simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`deploy-deepseek-v4-flash-with-sglang-and-modal`,children:(e,t)=>{l(),i(e,r(`Deploy DeepSeek-V4-Flash with SGLang and Modal`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://arxiv.org/abs/2606.19348`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DeepSeek-V4-Flash`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);h(c(e(_)),{href:`https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DeepSeek-V4-Pro preview`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`set-up-the-container-image`,children:(e,t)=>{l(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var y=c(v,2);h(c(e(y)),{href:`https://github.com/sgl-project/sglang/pull/32183`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`open PR`))},$$slots:{default:!0}}),l(),n(y);var S=c(y,2);p(S,{code:`import%20json%0Aimport%20shlex%0Aimport%20subprocess%0Aimport%20time%0Aimport%20urllib.error%0Aimport%20urllib.request%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AGB%20%3D%201024%20%20%23%20mb%0A%0APR32183_DIFF_URL%20%3D%20(%0A%20%20%20%20%22https%3A%2F%2Fgithub.com%2Fsgl-project%2Fsglang%2Fcompare%2F%22%0A%20%20%20%20%225387e23ecd7dde4c383ae857983686e6a73bddf3...%22%0A%20%20%20%20%2222ef431215b1d8529eaebd8e8c6de9510390afaf.diff%22%0A)%0APR32183_DIFF_SHA256%20%3D%20%22ddd65902ba570c158f9d6783604cf7d9f2f13bf41994fcbf330a68ea1909923c%22%0A%0Asglang_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Anightly-dev-cu13-20260729-16a52bff%22)%0A%20%20%20%20.entrypoint(%5B%5D)%20%20%23%20silence%20chatty%20logs%20on%20container%20start%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20f%22curl%20-fsSL%20%7BPR32183_DIFF_URL%7D%20-o%20%2Ftmp%2Fpr32183.diff%22%2C%0A%20%20%20%20%20%20%20%20f%22echo%20'%7BPR32183_DIFF_SHA256%7D%20%20%2Ftmp%2Fpr32183.diff'%20%7C%20sha256sum%20-c%20-%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Fsgl-workspace%2Fsglang%22%0A%20%20%20%20%20%20%20%20%22%20%26%26%20git%20apply%20--stat%20--exclude%3Dtest%2F*%20%2Ftmp%2Fpr32183.diff%22%0A%20%20%20%20%20%20%20%20%22%20%26%26%20git%20apply%20--exclude%3Dtest%2F*%20%2Ftmp%2Fpr32183.diff%22%2C%0A%20%20%20%20%20%20%20%20%22rm%20-rf%20%2Froot%2F.cache%2Fhuggingface%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var C=c(S,2);d(C,{id:`load-and-cache-the-model-weights-and-kernels`,children:(e,t)=>{l(),i(e,r(`Load and cache the model weights and kernels`))},$$slots:{default:!0}});var w=c(C,2);h(c(e(w)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(T,{code:`modal%20secret%20create%20huggingface-secret%20HF_TOKEN%3Dhf_...`,lang:`text`});var E=c(T,2);p(E,{code:`MODEL_NAME%20%3D%20%22deepseek-ai%2FDeepSeek-V4-Flash-0731%22%0AMODEL_REVISION%20%3D%20%229e165c30e2704aec5d9d593cce3eebd58bbef1cb%22%0A%0Ahf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A`,lang:`python`});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);p(O,{code:`HF_CACHE_DIR%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0Ahf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var k=c(O,2);h(c(e(k)),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`high performance downloads`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);p(A,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_DIR%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A%0A%0Adef%20download_model(repo_id%2C%20revision%3DNone)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(repo_id%3Drepo_id%2C%20revision%3Drevision%2C%20max_workers%3D16)%0A%0A%0Asglang_image%20%3D%20sglang_image.run_function(%0A%20%20%20%20download_model%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_DIR%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20args%3D(MODEL_NAME%2C%20MODEL_REVISION)%2C%0A%20%20%20%20timeout%3D4%20*%2060%20*%20MINUTES%2C%0A%20%20%20%20cpu%3D8%2C%0A)%0A`,lang:`python`});var j=c(A,4);p(j,{code:`DG_CACHE_DIR%20%3D%20%22%2Fcache%2Fdeep_gemm%22%0AFLASHINFER_CACHE_DIR%20%3D%20%22%2Froot%2F.cache%2Fsglang%2Fflashinfer%22%0A%0Adg_cache_vol%20%3D%20modal.Volume.from_name(%22sglang-deepgemm-cache%22%2C%20create_if_missing%3DTrue)%0Aflashinfer_cache_vol%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22flashinfer-autotune-cache%22%2C%20create_if_missing%3DTrue%0A)%0A%0Asglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22SGLANG_DG_CACHE_DIR%22%3A%20DG_CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_JIT_DEEPGEMM_FAST_WARMUP%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22TILELANG_CACHE_DIR%22%3A%20f%22%7BDG_CACHE_DIR%7D%2Ftilelang%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var M=c(j,2);u(M,{id:`configure-the-infrastructure`,children:(e,t)=>{l(),i(e,r(`Configure the infrastructure`))},$$slots:{default:!0}});var N=c(M,2),P=c(e(N));h(P,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU`))},$$slots:{default:!0}}),h(c(P,2),{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`quantized floating point`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,2);p(F,{code:`GPU_TYPE%2C%20GPU_COUNT%20%3D%20%22B300%22%2C%201%0ACPU%20%3D%208%0AMEMORY%20%3D%2096%20*%20GB%0A`,lang:`python`});var I=c(F,4);p(I,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20in%20production%20to%20keep%20a%20warm%20replica%0A`,lang:`python`});var L=c(I,4);p(L,{code:`TARGET_INPUTS%20%3D%2024%0A`,lang:`python`});var R=c(L,2);h(c(e(R)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(R);var z=c(R,2);p(z,{code:`STARTUP_TIMEOUT%20%3D%2060%20*%20MINUTES%0A%0A%0Adef%20is_server_up(url%3A%20str)%20-%3E%20bool%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(url%2C%20timeout%3D5)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20response.status%20%3D%3D%20200%0A%20%20%20%20except%20(urllib.error.URLError%2C%20OSError%2C%20TimeoutError)%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%0Adef%20wait_ready(proc%3A%20subprocess.Popen)%3A%0A%20%20%20%20url%20%3D%20f%22http%3A%2F%2Flocalhost%3A%7BDEFAULT_PORT%7D%2Fhealth%22%0A%20%20%20%20print(f%22waiting%20for%20server%20to%20be%20ready%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20if%20proc.poll()%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22SGLang%20exited%20with%20code%20%7Bproc.returncode%7D%20before%20becoming%20healthy%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20is_server_up(url)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22server%20is%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20req%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2Flocalhost%3A%7BDEFAULT_PORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20data%3Djson.dumps(payload).encode()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20headers%3D%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20method%3D%22POST%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(req%2C%20timeout%3D5%20*%20MINUTES)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20resp.read()%0A%20%20%20%20%20%20%20%20except%20(urllib.error.URLError%2C%20OSError%2C%20TimeoutError)%20as%20exc%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22warmup%20request%20failed%2C%20continuing%3A%20%7Bexc%7D%22)%0A%0A%0Adef%20wait_for_endpoint(url%3A%20str%2C%20timeout%3A%20int%20%3D%20STARTUP_TIMEOUT)%20-%3E%20None%3A%0A%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20timeout%0A%20%20%20%20health%20%3D%20f%22%7Burl.rstrip('%2F')%7D%2Fhealth%22%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20if%20is_server_up(health)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20TimeoutError(%22Timed%20out%20waiting%20for%20the%20Server%20endpoint.%22)%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A`,lang:`python`});var B=c(z,2);u(B,{id:`define-the-inference-server`,children:(e,t)=>{l(),i(e,r(`Define the inference server`))},$$slots:{default:!0}});var V=c(B,4);p(V,{code:`sglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22NCCL_CUMEM_ENABLE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22PYTORCH_CUDA_ALLOC_CONF%22%3A%20%22expandable_segments%3ATrue%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_DEFAULT_THINKING%22%3A%20%22false%22%2C%0A%20%20%20%20%20%20%20%20%22SGLANG_TIMEOUT_KEEP_ALIVE%22%3A%20f%22%7B5%20*%20MINUTES%7D%22%2C%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_COMPILE_THREADS%22%3A%20%221%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var H=c(V,2);h(c(e(H)),{href:`https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4#hw=b300&variant=flash-official&quant=fp4&strategy=low-latency&nodes=single`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SGLang DeepSeek-V4 cookbook`))},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);p(U,{code:`DEFAULT_PORT%20%3D%208000%0A%0A%0Adef%20_server_command()%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22sglang%22%2C%0A%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(DEFAULT_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--tp%22%2C%0A%20%20%20%20%20%20%20%20str(GPU_COUNT)%2C%0A%20%20%20%20%20%20%20%20%22--chunked-prefill-size%22%2C%0A%20%20%20%20%20%20%20%20%224096%22%2C%0A%20%20%20%20%20%20%20%20%22--context-length%22%2C%0A%20%20%20%20%20%20%20%20%22268000%22%2C%0A%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs-decode%22%2C%0A%20%20%20%20%20%20%20%20%2264%22%2C%0A%20%20%20%20%20%20%20%20%22--decode-log-interval%22%2C%0A%20%20%20%20%20%20%20%20%22200%22%2C%0A%20%20%20%20%20%20%20%20%22--default-chat-template-kwargs%22%2C%0A%20%20%20%20%20%20%20%20'%7B%22thinking%22%3Afalse%7D'%2C%0A%20%20%20%20%20%20%20%20%22--disable-flashinfer-autotune%22%2C%0A%20%20%20%20%20%20%20%20%22--dist-timeout%22%2C%0A%20%20%20%20%20%20%20%20f%22%7B60%20*%20MINUTES%7D%22%2C%0A%20%20%20%20%20%20%20%20%22--max-running-requests%22%2C%0A%20%20%20%20%20%20%20%20%2264%22%2C%0A%20%20%20%20%20%20%20%20%22--mem-fraction-static%22%2C%0A%20%20%20%20%20%20%20%20%220.90%22%2C%0A%20%20%20%20%20%20%20%20%22--moe-a2a-backend%22%2C%0A%20%20%20%20%20%20%20%20%22none%22%2C%0A%20%20%20%20%20%20%20%20%22--moe-runner-backend%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer_mxfp4%22%2C%0A%20%20%20%20%20%20%20%20%22--reasoning-parser%22%2C%0A%20%20%20%20%20%20%20%20%22deepseek-v4%22%2C%0A%20%20%20%20%20%20%20%20%22--speculative-algorithm%22%2C%0A%20%20%20%20%20%20%20%20%22DSPARK%22%2C%0A%20%20%20%20%20%20%20%20%22--swa-full-tokens-ratio%22%2C%0A%20%20%20%20%20%20%20%20%220.1%22%2C%0A%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%22deepseekv4%22%2C%0A%20%20%20%20%20%20%20%20%22--trust-remote-code%22%2C%0A%20%20%20%20%20%20%20%20%22--skip-server-warmup%22%2C%0A%20%20%20%20%5D%0A%20%20%20%20return%20cmd%0A%0A`,lang:`python`});var W=c(U,4);p(W,{code:`app%20%3D%20modal.App(name%3D%22example-deepseek-v4-flash%22)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3Df%22%7BGPU_TYPE%7D%3A%7BGPU_COUNT%7D%22%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20HF_CACHE_DIR%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20DG_CACHE_DIR%3A%20dg_cache_vol%2C%0A%20%20%20%20%20%20%20%20FLASHINFER_CACHE_DIR%3A%20flashinfer_cache_vol%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20cpu%3DCPU%2C%0A%20%20%20%20memory%3DMEMORY%2C%0A%20%20%20%20port%3DDEFAULT_PORT%2C%0A%20%20%20%20startup_timeout%3DSTARTUP_TIMEOUT%2C%0A%20%20%20%20exit_grace_period%3D25%2C%20%20%23%20seconds%2C%20time%20to%20finish%20up%20requests%20when%20closing%20down%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20_server_command()%0A%20%20%20%20%20%20%20%20print(shlex.join(cmd))%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20subprocess.Popen(cmd%2C%20start_new_session%3DTrue)%0A%20%20%20%20%20%20%20%20wait_ready(self.proc)%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.proc.terminate()%0A%20%20%20%20%20%20%20%20self.proc.wait()%0A%0A`,lang:`python`});var G=c(W,2);u(G,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var K=c(G,4);p(K,{code:`modal%20deploy%2006_gpu_and_ml%2Fllm-serving%2Fdeepseek_v4_flash.py`,lang:`bash`});var q=c(K,4);u(q,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var J=c(q,6);p(J,{code:`modal%20run%2006_gpu_and_ml%2Fllm-serving%2Fdeepseek_v4_flash.py`,lang:`bash`}),p(c(J,6),{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20str%20%3D%20%22Explain%20why%20tech%20bros%20and%20climbers%20are%20an%20increasing%20phenomenon.%22%2C%0A)%3A%0A%20%20%20%20url%20%3D%20Server.get_url()%0A%20%20%20%20print(f%22server%20url%3A%20%7Burl%7D%22)%0A%20%20%20%20wait_for_endpoint(url)%0A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%201024%2C%0A%20%20%20%20%20%20%20%20%22temperature%22%3A%200%2C%0A%20%20%20%20%7D%0A%20%20%20%20req%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20f%22%7Burl%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20data%3Djson.dumps(payload).encode()%2C%0A%20%20%20%20%20%20%20%20headers%3D%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%2C%0A%20%20%20%20%20%20%20%20method%3D%22POST%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(f%22sending%20a%20request%20to%20%7Burl%7D%22)%0A%20%20%20%20with%20urllib.request.urlopen(req%2C%20timeout%3DSTARTUP_TIMEOUT)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20body%20%3D%20json.loads(resp.read())%0A%0A%20%20%20%20message%20%3D%20body%5B%22choices%22%5D%5B0%5D%5B%22message%22%5D%0A%20%20%20%20print(message.get(%22content%22))%0A%20%20%20%20print(body.get(%22usage%22))%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=OktIS8aN.js.map
