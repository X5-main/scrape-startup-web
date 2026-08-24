(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`138c3f3b-63f3-48cf-b6cb-ea90431b4586`,e._sentryDebugIdIdentifier=`sentry-dbid-138c3f3b-63f3-48cf-b6cb-ea90431b4586`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run OpenAI’s gpt-oss model with vLLM`,id:`run-openais-gpt-oss-model-with-vllm`,children:[{depth:2,value:`Background`,id:`background`,children:[{depth:3,value:`MXFP4`,id:`mxfp4`},{depth:3,value:`Attention Sinks`,id:`attention-sinks`},{depth:3,value:`Response Format`,id:`response-format`}]},{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`},{depth:2,value:`Download the model weights`,id:`download-the-model-weights`},{depth:2,value:`Configuring vLLM to serve GPT-OSS`,id:`configuring-vllm-to-serve-gpt-oss`},{depth:2,value:`Build a vLLM engine and serve it`,id:`build-a-vllm-engine-and-serve-it`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Run OpenAI's gpt-oss model with vLLM

## Background

[gpt-oss](https://openai.com/index/introducing-gpt-oss/) is a reasoning model
that comes in two flavors: \`gpt-oss-120B\` and \`gpt-oss-20B\`. They are both Mixture
of Experts (MoE) models with a low number of active parameters, ensuring they
combine good world knowledge and capabilities with fast inference.

We describe a few of its notable features below.

### MXFP4

OpenAI's gpt-oss models use a fairly uncommon 4bit [\`mxfp4\`](https://arxiv.org/abs/2310.10537) floating point
format for the MoE layers. This "block" quantization format combines \`e2m1\` floating point numbers
with blockwise scaling factors. The attention operations are not quantized.

### Attention Sinks

Attention sink models allow for longer context lengths without sacrificing output quality. The vLLM team
added [attention sink support](https://huggingface.co/kernels-community/vllm-flash-attn3)
for Flash Attention 3 (FA3) in preparation for this release.

### Response Format

GPT-OSS is trained with the [harmony response format](https://github.com/openai/harmony) which enables models
to output to multiple channels for chain-of-thought (CoT) and input tool-calling preambles along with regular text responses.
We'll stick to a simpler format here, but see [this cookbook](https://cookbook.openai.com/articles/openai-harmony)
for details on the new format.

## Set up the container image

We'll start by defining a [custom container \`Image\`](https://modal.com/docs/guide/custom-container) that
installs all the necessary dependencies to run vLLM and the model.

\`\`\`python
import json
import time
from datetime import datetime, timezone
from typing import Any

import aiohttp
import modal

vllm_image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.8.1-devel-ubuntu22.04",
        add_python="3.12",
    )
    .entrypoint([])
    .uv_pip_install(
        "vllm==0.18.1",
        "huggingface_hub[hf_transfer]==0.36.0",
    )
    .env(  # fast Blackwell-specific MoE kernels
        {"VLLM_USE_FLASHINFER_MOE_MXFP4_MXFP8": "1"}
    )
)


\`\`\`

## Download the model weights

We'll be downloading OpenAI's model from Hugging Face. We're running
the 20B parameter model by default but you can easily switch to [the 120B model](https://huggingface.co/openai/gpt-oss-120b),
which also fits in a single H100 or H200 GPU.

\`\`\`python
MODEL_NAME = "openai/gpt-oss-20b"
MODEL_REVISION = "d666cf3b67006cf8227666739edf25164aaffdeb"

\`\`\`

Although vLLM will download weights from Hugging Face on-demand, we want to
cache them so we don't do it every time our server starts. We'll use [Modal Volumes](https://modal.com/docs/guide/volumes)
for our cache. Modal Volumes are essentially a "shared disk" that all Modal
Functions can access like it's a regular disk. For more on storing model
weights on Modal, see [this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

\`\`\`

The first time you run a new model or configuration with vLLM on a fresh machine,
a number of artifacts are created. We also cache these artifacts.

\`\`\`python
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)
flashinfer_cache_vol = modal.Volume.from_name(
    "flashinfer-cache", create_if_missing=True
)

\`\`\`

## Configuring vLLM to serve GPT-OSS

The vLLM docs include an [excellent resource on tuning GPT-OSS](https://docs.vllm.ai/projects/recipes/en/latest/OpenAI/GPT-OSS.html).
We mostly use the configuration values reported there, but try to explain the reasoning as we go.

\`\`\`python
VLLM_CONFIG = {  # return tokens in chunks of 20, save on host overhead
    "stream-interval": 20
}

\`\`\`

One of the most important choices is to use speculative decoding,
which attempts to generate multiple tokens per forward pass
by means of a separate "speculator" model.
We here use RedHatAI's open source, generic EAGLE3-based speculator for this model.
We recommend using the EAGLE3 technique to train a custom speculator on your own traffic.

\`\`\`python
SPECULATIVE_CONFIG = {
    "model": "RedHatAI/gpt-oss-20b-speculator.eagle3",
    "revision": "97d07a21e8b7e2b667725dd92f579525c0a30d05",
    "num_speculative_tokens": 7,
    "method": "eagle3",
}

\`\`\`

Speculative decoding acclerates inference without changing model behavior.
We can also accelerate inference by further quantizing the model.
Here, we reduce the size of KV cache entries by quantizing them to FP8.

\`\`\`python
VLLM_CONFIG |= {"kv-cache-dtype": "fp8"}

\`\`\`

There are a number of compilation settings for vLLM. Compilation improves inference performance
but incurs extra latency at engine start time. When iterating on and developing a server,
we recommend turning compilation off to speed up development cycles, which we here control
with a global variable.

\`\`\`python
FAST_BOOT = False

\`\`\`

Otherwise, we use the values suggested in the recipe:

\`\`\`python
COMPILATION_CONFIG = {
    "pass_config": {"fuse_allreduce_rms": True, "eliminate_noops": True}
}

\`\`\`

As part of compilation, vLLM collects up sequences (really, DAGs)
of CUDA kernel launches into CUDA graphs.
We set the maximum batch size for the CUDA graph capture step to the
maximum number of inputs we want to handle per replica,
which also shows up in our autoscaling configuration below.

\`\`\`python
MAX_INPUTS = 32  # how many requests can one replica handle? tune carefully!
VLLM_CONFIG |= {"max-cudagraph-capture-size": MAX_INPUTS}

\`\`\`

Lastly, there are a few knobs we can tune based on the typical lengths
of sequences we expect to observe.
For many agentic tasks to which this model is well-suited,
those lengths can go into the tens of thousands of tokens.
Let's assume they're never longer than 2 ^ 15 tokens.

\`\`\`python
VLLM_CONFIG |= {
    "max-num-batched-tokens": 16384,
    "max-model-len": 32768,
}

\`\`\`

## Build a vLLM engine and serve it

The function below spawns a vLLM instance listening at port 8000, serving requests to our model.

\`\`\`python
app = modal.App("example-gpt-oss-inference")

N_GPU = 1
MINUTES = 60  # seconds
VLLM_PORT = 8000


@app.function(
    image=vllm_image,
    gpu=f"B200:{N_GPU}",
    scaledown_window=10 * MINUTES,  # how long should we stay up with no requests?
    timeout=30 * MINUTES,  # how long should we wait for container start?
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
        "/root/.cache/flashinfer": flashinfer_cache_vol,
    },
)
@modal.concurrent(max_inputs=MAX_INPUTS)
@modal.web_server(port=VLLM_PORT, startup_timeout=30 * MINUTES)
def serve():
    import subprocess

    cmd = [
        "vllm",
        "serve",
        MODEL_NAME,
        "--revision",
        MODEL_REVISION,
        "--served-model-name",
        MODEL_NAME,
        "llm",
        "--host",
        "0.0.0.0",
        "--port",
        str(VLLM_PORT),
        "--async-scheduling",  # reduces host overhead, but might not be compatible with all features
    ]

    # enforce-eager disables both Torch compilation and CUDA graph capture
    # default is no-enforce-eager. see the --compilation-config flag for tighter control
    cmd += ["--enforce-eager" if FAST_BOOT else "--no-enforce-eager"]

    # assume multiple GPUs are for splitting up large matrix multiplications
    cmd += ["--tensor-parallel-size", str(N_GPU)]

    # add complex configuration objects
    cmd += ["--compilation-config", json.dumps(COMPILATION_CONFIG)]
    cmd += ["--speculative-config", json.dumps(SPECULATIVE_CONFIG)]

    cmd += [  # add assorted config
        item for k, v in VLLM_CONFIG.items() for item in (f"--{k}", str(v))
    ]

    print(*cmd)

    subprocess.Popen(cmd)


\`\`\`

## Deploy the server

To deploy the API on Modal, just run

\`\`\`bash
modal deploy gpt_oss_inference.py
\`\`\`

This will create a new app on Modal, build the container image for it if it hasn't been built yet,
and deploy the app.

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that does a healthcheck and then hits the server.

If you execute the command

\`\`\`bash
modal run gpt_oss_inference.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

We set up the system prompt with low reasoning effort to run
inference a bit faster. For the best ergonomics we recommend using
the [harmony API](https://cookbook.openai.com/articles/openai-harmony#example-system-message),
which can be installed with \`pip install openai-harmony\`.

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=30 * MINUTES, user_content=None, twice=True):
    url = await serve.get_web_url.aio()
    system_prompt = {
        "role": "system",
        "content": f"""You are ChatModal, a large language model trained by Modal.
        Knowledge cutoff: 2024-06
        Current date: {datetime.now(timezone.utc).date()}
        Reasoning: low
        \\\\# Valid channels: analysis, commentary, final. Channel must be included for every message.
        Calls to these tools must go to the commentary channel: 'functions'.""",
    }

    if user_content is None:
        user_content = "Explain what the Singular Value Decomposition is."

    messages = [  # OpenAI chat format
        system_prompt,
        {"role": "user", "content": user_content},
    ]

    async with aiohttp.ClientSession(base_url=url) as session:
        print(f"Running health check for server at {url}")
        async with session.get("/health", timeout=test_timeout - 1 * MINUTES) as resp:
            up = resp.status == 200
        assert up, f"Failed health check for server at {url}"
        print(f"Successful health check for server at {url}")

        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await _send_request(session, "llm", messages)

        if twice:
            messages[0]["content"] += "\\nTalk like a pirate, matey."
            print(f"Re-sending messages to {url}:", *messages, sep="\\n\\t")
            await _send_request(session, "llm", messages)


async def _send_request(
    session: aiohttp.ClientSession, model: str, messages: list
) -> None:
    # \`stream=True\` tells an OpenAI-compatible backend to stream chunks
    payload: dict[str, Any] = {"messages": messages, "model": model, "stream": True}

    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}

    t = time.perf_counter()
    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers, timeout=10 * MINUTES
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
            delta = chunk["choices"][0]["delta"]

            if "content" in delta:
                print(delta["content"], end="")  # print the content as it comes in
            elif "reasoning_content" in delta:
                print(delta["reasoning_content"], end="")
            elif "reasoning" in delta:
                print(delta["reasoning"], end="")
            elif not delta:
                print()
            else:
                raise ValueError(f"Unsupported response delta: {delta}")
    print("")
    print(f"Time to Last Token: {time.perf_counter() - t:.2f} seconds")

\`\`\`
`,meta:{title:`Run OpenAI’s gpt-oss model with vLLM`,description:`gpt-oss is a reasoning model that comes in two flavors: gpt-oss-120B and gpt-oss-20B. They are both Mixture of Experts (MoE) models with a low number of active parameters, ensuring they combine good world knowledge and capabilities with fast inference.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>mxfp4</code>`),x=t(`custom container <code>Image</code>`,1),S=t(`<!> <!> <p><!> is a reasoning model
that comes in two flavors: <code>gpt-oss-120B</code> and <code>gpt-oss-20B</code>. They are both Mixture
of Experts (MoE) models with a low number of active parameters, ensuring they
combine good world knowledge and capabilities with fast inference.</p> <p>We describe a few of its notable features below.</p> <!> <p>OpenAI’s gpt-oss models use a fairly uncommon 4bit <!> floating point
format for the MoE layers. This “block” quantization format combines <code>e2m1</code> floating point numbers
with blockwise scaling factors. The attention operations are not quantized.</p> <!> <p>Attention sink models allow for longer context lengths without sacrificing output quality. The vLLM team
added <!> for Flash Attention 3 (FA3) in preparation for this release.</p> <!> <p>GPT-OSS is trained with the <!> which enables models
to output to multiple channels for chain-of-thought (CoT) and input tool-calling preambles along with regular text responses.
We’ll stick to a simpler format here, but see <!> for details on the new format.</p> <!> <p>We’ll start by defining a <!> that
installs all the necessary dependencies to run vLLM and the model.</p> <!> <!> <p>We’ll be downloading OpenAI’s model from Hugging Face. We’re running
the 20B parameter model by default but you can easily switch to <!>,
which also fits in a single H100 or H200 GPU.</p> <!> <p>Although vLLM will download weights from Hugging Face on-demand, we want to
cache them so we don’t do it every time our server starts. We’ll use <!> for our cache. Modal Volumes are essentially a “shared disk” that all Modal
Functions can access like it’s a regular disk. For more on storing model
weights on Modal, see <!>.</p> <!> <p>The first time you run a new model or configuration with vLLM on a fresh machine,
a number of artifacts are created. We also cache these artifacts.</p> <!> <!> <p>The vLLM docs include an <!>.
We mostly use the configuration values reported there, but try to explain the reasoning as we go.</p> <!> <p>One of the most important choices is to use speculative decoding,
which attempts to generate multiple tokens per forward pass
by means of a separate “speculator” model.
We here use RedHatAI’s open source, generic EAGLE3-based speculator for this model.
We recommend using the EAGLE3 technique to train a custom speculator on your own traffic.</p> <!> <p>Speculative decoding acclerates inference without changing model behavior.
We can also accelerate inference by further quantizing the model.
Here, we reduce the size of KV cache entries by quantizing them to FP8.</p> <!> <p>There are a number of compilation settings for vLLM. Compilation improves inference performance
but incurs extra latency at engine start time. When iterating on and developing a server,
we recommend turning compilation off to speed up development cycles, which we here control
with a global variable.</p> <!> <p>Otherwise, we use the values suggested in the recipe:</p> <!> <p>As part of compilation, vLLM collects up sequences (really, DAGs)
of CUDA kernel launches into CUDA graphs.
We set the maximum batch size for the CUDA graph capture step to the
maximum number of inputs we want to handle per replica,
which also shows up in our autoscaling configuration below.</p> <!> <p>Lastly, there are a few knobs we can tune based on the typical lengths
of sequences we expect to observe.
For many agentic tasks to which this model is well-suited,
those lengths can go into the tens of thousands of tokens.
Let’s assume they’re never longer than 2 ^ 15 tokens.</p> <!> <!> <p>The function below spawns a vLLM instance listening at port 8000, serving requests to our model.</p> <!> <!> <p>To deploy the API on Modal, just run</p> <!> <p>This will create a new app on Modal, build the container image for it if it hasn’t been built yet,
and deploy the app.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that does a healthcheck and then hits the server.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>We set up the system prompt with low reasoning effort to run
inference a bit faster. For the best ergonomics we recommend using
the <!>,
which can be installed with <code>pip install openai-harmony</code>.</p> <!>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`run-openais-gpt-oss-model-with-vllm`,children:(e,t)=>{l(),i(e,r(`Run OpenAI’s gpt-oss model with vLLM`))},$$slots:{default:!0}});var g=c(m,2);u(g,{id:`background`,children:(e,t)=>{l(),i(e,r(`Background`))},$$slots:{default:!0}});var _=c(g,2);h(e(_),{href:`https://openai.com/index/introducing-gpt-oss/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gpt-oss`))},$$slots:{default:!0}}),l(5),n(_);var v=c(_,4);d(v,{id:`mxfp4`,children:(e,t)=>{l(),i(e,r(`MXFP4`))},$$slots:{default:!0}});var y=c(v,2);h(c(e(y)),{href:`https://arxiv.org/abs/2310.10537`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(3),n(y);var C=c(y,2);d(C,{id:`attention-sinks`,children:(e,t)=>{l(),i(e,r(`Attention Sinks`))},$$slots:{default:!0}});var w=c(C,2);h(c(e(w)),{href:`https://huggingface.co/kernels-community/vllm-flash-attn3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`attention sink support`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);d(T,{id:`response-format`,children:(e,t)=>{l(),i(e,r(`Response Format`))},$$slots:{default:!0}});var E=c(T,2),D=c(e(E));h(D,{href:`https://github.com/openai/harmony`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`harmony response format`))},$$slots:{default:!0}}),h(c(D,2),{href:`https://cookbook.openai.com/articles/openai-harmony`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this cookbook`))},$$slots:{default:!0}}),l(),n(E);var O=c(E,2);u(O,{id:`set-up-the-container-image`,children:(e,t)=>{l(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var k=c(O,2);h(c(e(k)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l();var n=x();l(),i(e,n)},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);p(A,{code:`import%20json%0Aimport%20time%0Afrom%20datetime%20import%20datetime%2C%20timezone%0Afrom%20typing%20import%20Any%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A12.8.1-devel-ubuntu22.04%22%2C%0A%20%20%20%20%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22vllm%3D%3D0.18.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%5Bhf_transfer%5D%3D%3D0.36.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%20%20%23%20fast%20Blackwell-specific%20MoE%20kernels%0A%20%20%20%20%20%20%20%20%7B%22VLLM_USE_FLASHINFER_MOE_MXFP4_MXFP8%22%3A%20%221%22%7D%0A%20%20%20%20)%0A)%0A%0A`,lang:`python`});var j=c(A,2);u(j,{id:`download-the-model-weights`,children:(e,t)=>{l(),i(e,r(`Download the model weights`))},$$slots:{default:!0}});var M=c(j,2);h(c(e(M)),{href:`https://huggingface.co/openai/gpt-oss-120b`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the 120B model`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);p(N,{code:`MODEL_NAME%20%3D%20%22openai%2Fgpt-oss-20b%22%0AMODEL_REVISION%20%3D%20%22d666cf3b67006cf8227666739edf25164aaffdeb%22%0A`,lang:`python`});var P=c(N,2),F=c(e(P));h(F,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),h(c(F,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(P);var I=c(P,2);p(I,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var L=c(I,4);p(L,{code:`vllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0Aflashinfer_cache_vol%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22flashinfer-cache%22%2C%20create_if_missing%3DTrue%0A)%0A`,lang:`python`});var R=c(L,2);u(R,{id:`configuring-vllm-to-serve-gpt-oss`,children:(e,t)=>{l(),i(e,r(`Configuring vLLM to serve GPT-OSS`))},$$slots:{default:!0}});var z=c(R,2);h(c(e(z)),{href:`https://docs.vllm.ai/projects/recipes/en/latest/OpenAI/GPT-OSS.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`excellent resource on tuning GPT-OSS`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,2);p(B,{code:`VLLM_CONFIG%20%3D%20%7B%20%20%23%20return%20tokens%20in%20chunks%20of%2020%2C%20save%20on%20host%20overhead%0A%20%20%20%20%22stream-interval%22%3A%2020%0A%7D%0A`,lang:`python`});var V=c(B,4);p(V,{code:`SPECULATIVE_CONFIG%20%3D%20%7B%0A%20%20%20%20%22model%22%3A%20%22RedHatAI%2Fgpt-oss-20b-speculator.eagle3%22%2C%0A%20%20%20%20%22revision%22%3A%20%2297d07a21e8b7e2b667725dd92f579525c0a30d05%22%2C%0A%20%20%20%20%22num_speculative_tokens%22%3A%207%2C%0A%20%20%20%20%22method%22%3A%20%22eagle3%22%2C%0A%7D%0A`,lang:`python`});var H=c(V,4);p(H,{code:`VLLM_CONFIG%20%7C%3D%20%7B%22kv-cache-dtype%22%3A%20%22fp8%22%7D%0A`,lang:`python`});var U=c(H,4);p(U,{code:`FAST_BOOT%20%3D%20False%0A`,lang:`python`});var W=c(U,4);p(W,{code:`COMPILATION_CONFIG%20%3D%20%7B%0A%20%20%20%20%22pass_config%22%3A%20%7B%22fuse_allreduce_rms%22%3A%20True%2C%20%22eliminate_noops%22%3A%20True%7D%0A%7D%0A`,lang:`python`});var G=c(W,4);p(G,{code:`MAX_INPUTS%20%3D%2032%20%20%23%20how%20many%20requests%20can%20one%20replica%20handle%3F%20tune%20carefully!%0AVLLM_CONFIG%20%7C%3D%20%7B%22max-cudagraph-capture-size%22%3A%20MAX_INPUTS%7D%0A`,lang:`python`});var K=c(G,4);p(K,{code:`VLLM_CONFIG%20%7C%3D%20%7B%0A%20%20%20%20%22max-num-batched-tokens%22%3A%2016384%2C%0A%20%20%20%20%22max-model-len%22%3A%2032768%2C%0A%7D%0A`,lang:`python`});var q=c(K,2);u(q,{id:`build-a-vllm-engine-and-serve-it`,children:(e,t)=>{l(),i(e,r(`Build a vLLM engine and serve it`))},$$slots:{default:!0}});var J=c(q,4);p(J,{code:`app%20%3D%20modal.App(%22example-gpt-oss-inference%22)%0A%0AN_GPU%20%3D%201%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AVLLM_PORT%20%3D%208000%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3Df%22B200%3A%7BN_GPU%7D%22%2C%0A%20%20%20%20scaledown_window%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20timeout%3D30%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fflashinfer%22%3A%20flashinfer_cache_vol%2C%0A%20%20%20%20%7D%2C%0A)%0A%40modal.concurrent(max_inputs%3DMAX_INPUTS)%0A%40modal.web_server(port%3DVLLM_PORT%2C%20startup_timeout%3D30%20*%20MINUTES)%0Adef%20serve()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--async-scheduling%22%2C%20%20%23%20reduces%20host%20overhead%2C%20but%20might%20not%20be%20compatible%20with%20all%20features%0A%20%20%20%20%5D%0A%0A%20%20%20%20%23%20enforce-eager%20disables%20both%20Torch%20compilation%20and%20CUDA%20graph%20capture%0A%20%20%20%20%23%20default%20is%20no-enforce-eager.%20see%20the%20--compilation-config%20flag%20for%20tighter%20control%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--enforce-eager%22%20if%20FAST_BOOT%20else%20%22--no-enforce-eager%22%5D%0A%0A%20%20%20%20%23%20assume%20multiple%20GPUs%20are%20for%20splitting%20up%20large%20matrix%20multiplications%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--tensor-parallel-size%22%2C%20str(N_GPU)%5D%0A%0A%20%20%20%20%23%20add%20complex%20configuration%20objects%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--compilation-config%22%2C%20json.dumps(COMPILATION_CONFIG)%5D%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--speculative-config%22%2C%20json.dumps(SPECULATIVE_CONFIG)%5D%0A%0A%20%20%20%20cmd%20%2B%3D%20%5B%20%20%23%20add%20assorted%20config%0A%20%20%20%20%20%20%20%20item%20for%20k%2C%20v%20in%20VLLM_CONFIG.items()%20for%20item%20in%20(f%22--%7Bk%7D%22%2C%20str(v))%0A%20%20%20%20%5D%0A%0A%20%20%20%20print(*cmd)%0A%0A%20%20%20%20subprocess.Popen(cmd)%0A%0A`,lang:`python`});var Y=c(J,2);u(Y,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var X=c(Y,4);p(X,{code:`modal%20deploy%20gpt_oss_inference.py`,lang:`bash`});var Z=c(X,4);u(Z,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Q=c(Z,6);p(Q,{code:`modal%20run%20gpt_oss_inference.py`,lang:`bash`});var $=c(Q,4);h(c(e($)),{href:`https://cookbook.openai.com/articles/openai-harmony#example-system-message`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`harmony API`))},$$slots:{default:!0}}),l(3),n($),p(c($,2),{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D30%20*%20MINUTES%2C%20user_content%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20serve.get_web_url.aio()%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20f%22%22%22You%20are%20ChatModal%2C%20a%20large%20language%20model%20trained%20by%20Modal.%0A%20%20%20%20%20%20%20%20Knowledge%20cutoff%3A%202024-06%0A%20%20%20%20%20%20%20%20Current%20date%3A%20%7Bdatetime.now(timezone.utc).date()%7D%0A%20%20%20%20%20%20%20%20Reasoning%3A%20low%0A%20%20%20%20%20%20%20%20%5C%5C%23%20Valid%20channels%3A%20analysis%2C%20commentary%2C%20final.%20Channel%20must%20be%20included%20for%20every%20message.%0A%20%20%20%20%20%20%20%20Calls%20to%20these%20tools%20must%20go%20to%20the%20commentary%20channel%3A%20'functions'.%22%22%22%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20if%20user_content%20is%20None%3A%0A%20%20%20%20%20%20%20%20user_content%20%3D%20%22Explain%20what%20the%20Singular%20Value%20Decomposition%20is.%22%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20user_content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20print(f%22Running%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20async%20with%20session.get(%22%2Fhealth%22%2C%20timeout%3Dtest_timeout%20-%201%20*%20MINUTES)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20up%20%3D%20resp.status%20%3D%3D%20200%0A%20%20%20%20%20%20%20%20assert%20up%2C%20f%22Failed%20health%20check%20for%20server%20at%20%7Burl%7D%22%0A%20%20%20%20%20%20%20%20print(f%22Successful%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages)%0A%0A%20%20%20%20%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%2B%3D%20%22%5CnTalk%20like%20a%20pirate%2C%20matey.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Re-sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages)%0A%0A%0Aasync%20def%20_send_request(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20model%3A%20str%2C%20messages%3A%20list%0A)%20-%3E%20None%3A%0A%20%20%20%20%23%20%60stream%3DTrue%60%20tells%20an%20OpenAI-compatible%20backend%20to%20stream%20chunks%0A%20%20%20%20payload%3A%20dict%5Bstr%2C%20Any%5D%20%3D%20%7B%22messages%22%3A%20messages%2C%20%22model%22%3A%20model%2C%20%22stream%22%3A%20True%7D%0A%0A%20%20%20%20headers%20%3D%20%7B%22Content-Type%22%3A%20%22application%2Fjson%22%2C%20%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20t%20%3D%20time.perf_counter()%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3D10%20*%20MINUTES%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20extract%20new%20content%20and%20stream%20it%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode().strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%20or%20line%20%3D%3D%20%22data%3A%20%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20line.startswith(%22data%3A%20%22)%3A%20%20%23%20SSE%20prefix%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20line%5Blen(%22data%3A%20%22)%20%3A%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20json.loads(line)%0A%20%20%20%20%20%20%20%20%20%20%20%20assert%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%5B%22object%22%5D%20%3D%3D%20%22chat.completion.chunk%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20or%20something%20went%20horribly%20wrong%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20chunk%5B%22choices%22%5D%5B0%5D%5B%22delta%22%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%22content%22%20in%20delta%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(delta%5B%22content%22%5D%2C%20end%3D%22%22)%20%20%23%20print%20the%20content%20as%20it%20comes%20in%0A%20%20%20%20%20%20%20%20%20%20%20%20elif%20%22reasoning_content%22%20in%20delta%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(delta%5B%22reasoning_content%22%5D%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20elif%20%22reasoning%22%20in%20delta%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(delta%5B%22reasoning%22%5D%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20elif%20not%20delta%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print()%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(f%22Unsupported%20response%20delta%3A%20%7Bdelta%7D%22)%0A%20%20%20%20print(%22%22)%0A%20%20%20%20print(f%22Time%20to%20Last%20Token%3A%20%7Btime.perf_counter()%20-%20t%3A.2f%7D%20seconds%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=asLN6nPv2.js.map
