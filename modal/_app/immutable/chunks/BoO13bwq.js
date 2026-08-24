(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`29cb0a74-169e-454e-a098-e403af9af0fd`,e._sentryDebugIdIdentifier=`sentry-dbid-29cb0a74-169e-454e-a098-e403af9af0fd`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as ee,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Run OpenAI-compatible LLM inference with Gemma and vLLM`,id:`run-openai-compatible-llm-inference-with-gemma-and-vllm`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`},{depth:2,value:`Download the model weights`,id:`download-the-model-weights`},{depth:2,value:`Configuring vLLM`,id:`configuring-vllm`,children:[{depth:3,value:`Trading off fast boots and token generation performance`,id:`trading-off-fast-boots-and-token-generation-performance`},{depth:3,value:`Model-specific configuration`,id:`model-specific-configuration`}]},{depth:2,value:`Build a vLLM engine and serve it`,id:`build-a-vllm-engine-and-serve-it`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Testing the server`,id:`testing-the-server`}]}],rawContent:`# Run OpenAI-compatible LLM inference with Gemma and vLLM

In this example, we show how to run a vLLM server in OpenAI-compatible mode on Modal.

LLMs do more than just model language: they chat, they produce JSON and XML, they run code, and more.
This has complicated their interface far beyond "text-in, text-out".
OpenAI's API has emerged as a standard for that interface,
and it is supported by open source LLM serving frameworks like [vLLM](https://docs.vllm.ai/en/latest/).

This example is intended to demonstrate the basics of deploying LLM inference on Modal.
For more on how to optimize performance, see
[this guide](https://modal.com/docs/guide/high-performance-llm-inference)
and check out our
[LLM Engineer's Almanac](https://modal.com/llm-almanac).

Our examples repository also includes scripts for running clients and load-testing for OpenAI-compatible APIs
[here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible).

## Set up the container image

Our first order of business is to define the environment our server will run in:
the [container \`Image\`](https://modal.com/docs/guide/custom-container).
vLLM can be installed with \`uv pip\`, since Modal [provides the CUDA drivers](https://modal.com/docs/guide/cuda).

\`\`\`python
import json
from typing import Any

import aiohttp
import modal

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.9.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .uv_pip_install("vllm==0.21.0")
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",  # faster model transfers
            "VLLM_LOG_STATS_INTERVAL": "1",  # more frequent metrics logging
        }
    )
)

\`\`\`

## Download the model weights

We'll be running a pretrained foundation model --
[Google's Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/).
It can also take images, video, and audio as inputs,
though we won't use that here.

We'll use the 26BA4B variant, [\`google/gemma-4-26B-A4B-it\`](https://huggingface.co/google/gemma-4-26B-A4B-it).
This variant is trained with reasoning capabilities, which allow it to
enhance the quality of its generated responses.
It has \`26B\`illion parameters, of which \`4B\`illion are \`A\`ctive
in processing of each token.

You can swap this model out for another by changing the strings below,
though you might also need to adjust some of the server configuration as well.
A single H200 GPU has enough VRAM to store this 26,000,000,000 parameter model
along with a large KV cache.

\`\`\`python
MODEL_NAME = "google/gemma-4-26B-A4B-it"
MODEL_REVISION = "47b6801b24d15ff9bcd8c96dfaea0be9ed3a0301"  # avoid nasty surprises when repos update!

\`\`\`

Although vLLM will download weights from Hugging Face on-demand,
we want to cache them so we don't do it every time our server starts.
We'll use [Modal Volumes](https://modal.com/docs/guide/volumes) for our cache.
Modal Volumes are essentially a "shared disk" that all Modal Functions can access like it's a regular disk.
For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

\`\`\`

We'll also cache some of vLLM's JIT compilation artifacts in a Modal Volume.

\`\`\`python
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

\`\`\`

## Configuring vLLM

### Trading off fast boots and token generation performance

vLLM has embraced dynamic and just-in-time compilation to eke out additional performance without having to write too many custom kernels,
e.g. via the Torch compiler and CUDA graph capture.
These compilation features incur latency in exchange for lowered latency and higher throughput during generation.
This latency is typically tens of seconds to a few minutes, reduced to about ten seconds when loaded from the cache.
We make this trade-off controllable with the \`FAST_BOOT\` variable below.

\`\`\`python
FAST_BOOT = False

\`\`\`

If you're running an LLM service that frequently scales from 0 (frequent ["cold starts"](https://modal.com/docs/guide/cold-start))
you might want to set this to \`True\`, or consider [GPU memory snapshots](https://modal.com/docs/guide/memory-snapshots).
It's also useful to set this when you're iterating on the server configuration.

If you're running an LLM service that usually has multiple replicas running, then set this to \`False\` for improved performance.

See the code below for details on the parameters that \`FAST_BOOT\` controls.

### Model-specific configuration

Almost all models require some amount of configuration via command-line flags,
especially to achieve optimal performance.

We set these flags in the code below, roughly following the
[usage guide from the vLLM docs](https://docs.vllm.ai/projects/recipes/en/latest/Google/Gemma4.html).

For instance, we turn off multimodal features to save on [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram),
and we activate the [built-in multi-token prediction (MTP)](https://blog.google/innovation-and-ai/technology/developers-tools/multi-token-prediction-gemma-4/)
speculative decoding for improved throughput at lower concurrencies.

\`\`\`python
SPECULATIVE_MODEL_NAME = "google/gemma-4-26B-A4B-it-assistant"
SPECULATIVE_MODEL_REVISION = "f188f476dc11dd5bb3014dc861529d316bce49d3"

\`\`\`

For more on the performance you can expect when serving your own LLMs, see
[our LLM engine performance benchmarks](https://modal.com/llm-almanac).

## Build a vLLM engine and serve it

The class below spawns a vLLM instance listening at port 8000, serving requests to our model.
We wrap it in the [\`@app.server\`](https://modal.com/docs/guide/servers) decorator
to connect it to the Internet.

The server runs in an independent process, via \`subprocess.Popen\`, and only starts accepting requests
once the model is spun up and the process is ready to listen on the configured port.

\`\`\`python
app = modal.App("example-vllm-inference")

N_GPU = 1
MINUTES = 60  # seconds
VLLM_PORT = 8000
ROUTING_REGION = "us-east"


@app.server(
    image=vllm_image,
    gpu=f"H200:{N_GPU}",
    scaledown_window=15 * MINUTES,  # how long should we stay up with no requests?
    startup_timeout=10 * MINUTES,  # how long should we wait for container start?
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
    port=VLLM_PORT,
    routing_region=ROUTING_REGION,
    target_concurrency=100,  # how many requests can one replica handle? tune carefully!
    unauthenticated=True,  # to make the endpoint publicly accessible
)
class Server:
    @modal.enter()
    def start(self):
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
            "--uvicorn-log-level=info",
            "--async-scheduling",
        ]

        # enforce-eager disables both Torch compilation and CUDA graph capture
        # default is no-enforce-eager. see the --compilation-config flag for tighter control
        cmd += ["--enforce-eager" if FAST_BOOT else "--no-enforce-eager"]

        # assume multiple GPUs are for splitting up large matrix multiplications
        cmd += ["--tensor-parallel-size", str(N_GPU)]

        # add model-specific configuration
        cmd += [
            # skip multimedia support, just language
            "--limit-mm-per-prompt",
            json.dumps({"image": 0, "video": 0, "audio": 0}),
            # enable reasoning and tool use
            "--enable-auto-tool-choice",
            "--reasoning-parser",
            "gemma4",
            "--tool-call-parser",
            "gemma4",
        ]

        # add speculative decoding
        cmd += [
            "--speculative-config",
            json.dumps(
                {
                    "model": SPECULATIVE_MODEL_NAME,
                    "revision": SPECULATIVE_MODEL_REVISION,
                    "num_speculative_tokens": 4,
                }
            ),
        ]

        print(*cmd)

        self.process = subprocess.Popen(cmd)

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the API on Modal, just run
\`\`\`bash
modal deploy vllm_inference.py
\`\`\`

This will create a new app on Modal, build the container image for it if it hasn't been built yet,
and deploy the app.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-vllm-inference-server.us-east.modal.direct\`.

To interact with the API programmatically in Python, we recommend the \`openai\` library.

See the \`client.py\` script in the examples repository
[here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible)
to take it for a spin:

\`\`\`bash
# pip install openai==1.76.0
python openai_compatible/client.py
\`\`\`

## Testing the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that does a healthcheck and then hits the server. As opposed to Modal Functions, however
when a Server has no active containers, requests will be rejected with a 503 Service Unavailable status.
Therefore, we have to handle this manually in the client code.

If you execute the command

\`\`\`bash
modal run vllm_inference.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=15 * MINUTES, content=None, twice=True):
    import asyncio
    import time

    url = await Server.get_url.aio()

    system_prompt = {
        "role": "system",
        "content": "You are a pirate who can't help but drop sly reminders that he went to Harvard.",
    }
    if content is None:
        content = "Explain the singular value decomposition."

    messages = [  # OpenAI chat format
        system_prompt,
        {"role": "user", "content": content},
    ]

    async with aiohttp.ClientSession(base_url=url) as session:
        print(f"Running health check for server at {url}")
        deadline = time.time() + test_timeout - 1 * MINUTES
        while time.time() < deadline:
            async with session.get(
                "/health", timeout=aiohttp.ClientTimeout(total=60)
            ) as resp:
                if resp.status == 200:
                    break
                if resp.status == 503:
                    await asyncio.sleep(1)
                    continue
                assert False, (
                    f"Failed health check for server at {url}: HTTP {resp.status}"
                )
        else:
            assert False, f"Failed health check for server at {url}"
        print(f"Successful health check for server at {url}")

        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await _send_request(session, "llm", messages)
        if twice:
            messages[0]["content"] = "You are Jar Jar Binks."
            print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
            await _send_request(session, "llm", messages)


async def _send_request(
    session: aiohttp.ClientSession, model: str, messages: list
) -> None:
    # \`stream=True\` tells an OpenAI-compatible backend to stream chunks
    payload: dict[str, Any] = {"messages": messages, "model": model, "stream": True}
    # explicitly enable thinking for this model
    payload["chat_template_kwargs"] = {"enable_thinking": True}

    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}

    async with session.post(
        "/v1/chat/completions", json=payload, headers=headers
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
            content = (
                delta.get("content")
                or delta.get("reasoning")
                or delta.get("reasoning_content")
            )
            if content:
                print(content, end="")
            else:
                print("\\n", chunk)
    print()


\`\`\`

We also include a basic example of a load-testing setup using
\`locust\` in the \`load_test.py\` script [here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible):

\`\`\`bash
modal run openai_compatible/load_test.py
\`\`\`
`,meta:{title:`Run OpenAI-compatible LLM inference with Gemma and vLLM`,description:`In this example, we show how to run a vLLM server in OpenAI-compatible mode on Modal.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`container <code>Image</code>`,1),ne=t(`<code>google/gemma-4-26B-A4B-it</code>`),re=t(`<code>@app.server</code>`),ie=t(`<!> <p>In this example, we show how to run a vLLM server in OpenAI-compatible mode on Modal.</p> <p>LLMs do more than just model language: they chat, they produce JSON and XML, they run code, and more.
This has complicated their interface far beyond “text-in, text-out”.
OpenAI’s API has emerged as a standard for that interface,
and it is supported by open source LLM serving frameworks like <!>.</p> <p>This example is intended to demonstrate the basics of deploying LLM inference on Modal.
For more on how to optimize performance, see <!> and check out our <!>.</p> <p>Our examples repository also includes scripts for running clients and load-testing for OpenAI-compatible APIs <!>.</p> <!> <p>Our first order of business is to define the environment our server will run in:
the <!>.
vLLM can be installed with <code>uv pip</code>, since Modal <!>.</p> <!> <!> <p>We’ll be running a pretrained foundation model — <!>.
It can also take images, video, and audio as inputs,
though we won’t use that here.</p> <p>We’ll use the 26BA4B variant, <!>.
This variant is trained with reasoning capabilities, which allow it to
enhance the quality of its generated responses.
It has <code>26B</code>illion parameters, of which <code>4B</code>illion are <code>A</code>ctive
in processing of each token.</p> <p>You can swap this model out for another by changing the strings below,
though you might also need to adjust some of the server configuration as well.
A single H200 GPU has enough VRAM to store this 26,000,000,000 parameter model
along with a large KV cache.</p> <!> <p>Although vLLM will download weights from Hugging Face on-demand,
we want to cache them so we don’t do it every time our server starts.
We’ll use <!> for our cache.
Modal Volumes are essentially a “shared disk” that all Modal Functions can access like it’s a regular disk.
For more on storing model weights on Modal, see <!>.</p> <!> <p>We’ll also cache some of vLLM’s JIT compilation artifacts in a Modal Volume.</p> <!> <!> <!> <p>vLLM has embraced dynamic and just-in-time compilation to eke out additional performance without having to write too many custom kernels,
e.g. via the Torch compiler and CUDA graph capture.
These compilation features incur latency in exchange for lowered latency and higher throughput during generation.
This latency is typically tens of seconds to a few minutes, reduced to about ten seconds when loaded from the cache.
We make this trade-off controllable with the <code>FAST_BOOT</code> variable below.</p> <!> <p>If you’re running an LLM service that frequently scales from 0 (frequent <!>)
you might want to set this to <code>True</code>, or consider <!>.
It’s also useful to set this when you’re iterating on the server configuration.</p> <p>If you’re running an LLM service that usually has multiple replicas running, then set this to <code>False</code> for improved performance.</p> <p>See the code below for details on the parameters that <code>FAST_BOOT</code> controls.</p> <!> <p>Almost all models require some amount of configuration via command-line flags,
especially to achieve optimal performance.</p> <p>We set these flags in the code below, roughly following the <!>.</p> <p>For instance, we turn off multimodal features to save on <!>,
and we activate the <!> speculative decoding for improved throughput at lower concurrencies.</p> <!> <p>For more on the performance you can expect when serving your own LLMs, see <!>.</p> <!> <p>The class below spawns a vLLM instance listening at port 8000, serving requests to our model.
We wrap it in the <!> decorator
to connect it to the Internet.</p> <p>The server runs in an independent process, via <code>subprocess.Popen</code>, and only starts accepting requests
once the model is spun up and the process is ready to listen on the configured port.</p> <!> <!> <p>To deploy the API on Modal, just run</p> <!> <p>This will create a new app on Modal, build the container image for it if it hasn’t been built yet,
and deploy the app.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-vllm-inference-server.us-east.modal.direct</code>.</p> <p>To interact with the API programmatically in Python, we recommend the <code>openai</code> library.</p> <p>See the <code>client.py</code> script in the examples repository <!> to take it for a spin:</p> <!> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that does a healthcheck and then hits the server. As opposed to Modal Functions, however
when a Server has no active containers, requests will be rejected with a 503 Service Unavailable status.
Therefore, we have to handle this manually in the client code.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>We also include a basic example of a load-testing setup using <code>locust</code> in the <code>load_test.py</code> script <!>:</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=ie(),f=ee(o);te(f,{id:`run-openai-compatible-llm-inference-with-gemma-and-vllm`,children:(e,t)=>{c(),i(e,r(`Run OpenAI-compatible LLM inference with Gemma and vLLM`))},$$slots:{default:!0}});var m=s(f,4);p(s(e(m)),{href:`https://docs.vllm.ai/en/latest/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`vLLM`))},$$slots:{default:!0}}),c(),n(m);var h=s(m,2),g=s(e(h));p(g,{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),p(s(g,2),{href:`https://modal.com/llm-almanac`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`LLM Engineer’s Almanac`))},$$slots:{default:!0}}),c(),n(h);var _=s(h,2);p(s(e(_)),{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(_);var y=s(_,2);l(y,{id:`set-up-the-container-image`,children:(e,t)=>{c(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var b=s(y,2),x=s(e(b));p(x,{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{c();var n=v();c(),i(e,n)},$$slots:{default:!0}}),p(s(x,4),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`provides the CUDA drivers`))},$$slots:{default:!0}}),c(),n(b);var S=s(b,2);d(S,{code:`import%20json%0Afrom%20typing%20import%20Any%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.9.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%22vllm%3D%3D0.21.0%22)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20model%20transfers%0A%20%20%20%20%20%20%20%20%20%20%20%20%22VLLM_LOG_STATS_INTERVAL%22%3A%20%221%22%2C%20%20%23%20more%20frequent%20metrics%20logging%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var C=s(S,2);l(C,{id:`download-the-model-weights`,children:(e,t)=>{c(),i(e,r(`Download the model weights`))},$$slots:{default:!0}});var w=s(C,2);p(s(e(w)),{href:`https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Google’s Gemma 4`))},$$slots:{default:!0}}),c(),n(w);var T=s(w,2);p(s(e(T)),{href:`https://huggingface.co/google/gemma-4-26B-A4B-it`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),c(7),n(T);var E=s(T,4);d(E,{code:`MODEL_NAME%20%3D%20%22google%2Fgemma-4-26B-A4B-it%22%0AMODEL_REVISION%20%3D%20%2247b6801b24d15ff9bcd8c96dfaea0be9ed3a0301%22%20%20%23%20avoid%20nasty%20surprises%20when%20repos%20update!%0A`,lang:`python`});var D=s(E,2),O=s(e(D));p(O,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),p(s(O,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(D);var k=s(D,2);d(k,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var A=s(k,4);d(A,{code:`vllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var j=s(A,2);l(j,{id:`configuring-vllm`,children:(e,t)=>{c(),i(e,r(`Configuring vLLM`))},$$slots:{default:!0}});var M=s(j,2);u(M,{id:`trading-off-fast-boots-and-token-generation-performance`,children:(e,t)=>{c(),i(e,r(`Trading off fast boots and token generation performance`))},$$slots:{default:!0}});var N=s(M,4);d(N,{code:`FAST_BOOT%20%3D%20False%0A`,lang:`python`});var P=s(N,2),F=s(e(P));p(F,{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`“cold starts”`))},$$slots:{default:!0}}),p(s(F,4),{href:`https://modal.com/docs/guide/memory-snapshots`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`GPU memory snapshots`))},$$slots:{default:!0}}),c(),n(P);var I=s(P,6);u(I,{id:`model-specific-configuration`,children:(e,t)=>{c(),i(e,r(`Model-specific configuration`))},$$slots:{default:!0}});var L=s(I,4);p(s(e(L)),{href:`https://docs.vllm.ai/projects/recipes/en/latest/Google/Gemma4.html`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`usage guide from the vLLM docs`))},$$slots:{default:!0}}),c(),n(L);var R=s(L,2),z=s(e(R));p(z,{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),p(s(z,2),{href:`https://blog.google/innovation-and-ai/technology/developers-tools/multi-token-prediction-gemma-4/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`built-in multi-token prediction (MTP)`))},$$slots:{default:!0}}),c(),n(R);var B=s(R,2);d(B,{code:`SPECULATIVE_MODEL_NAME%20%3D%20%22google%2Fgemma-4-26B-A4B-it-assistant%22%0ASPECULATIVE_MODEL_REVISION%20%3D%20%22f188f476dc11dd5bb3014dc861529d316bce49d3%22%0A`,lang:`python`});var V=s(B,2);p(s(e(V)),{href:`https://modal.com/llm-almanac`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`our LLM engine performance benchmarks`))},$$slots:{default:!0}}),c(),n(V);var H=s(V,2);l(H,{id:`build-a-vllm-engine-and-serve-it`,children:(e,t)=>{c(),i(e,r(`Build a vLLM engine and serve it`))},$$slots:{default:!0}});var U=s(H,2);p(s(e(U)),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),c(),n(U);var W=s(U,4);d(W,{code:`app%20%3D%20modal.App(%22example-vllm-inference%22)%0A%0AN_GPU%20%3D%201%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AVLLM_PORT%20%3D%208000%0AROUTING_REGION%20%3D%20%22us-east%22%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3Df%22H200%3A%7BN_GPU%7D%22%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20startup_timeout%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20port%3DVLLM_PORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20target_concurrency%3D100%2C%20%20%23%20how%20many%20requests%20can%20one%20replica%20handle%3F%20tune%20carefully!%0A%20%20%20%20unauthenticated%3DTrue%2C%20%20%23%20to%20make%20the%20endpoint%20publicly%20accessible%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20import%20subprocess%0A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--uvicorn-log-level%3Dinfo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--async-scheduling%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20enforce-eager%20disables%20both%20Torch%20compilation%20and%20CUDA%20graph%20capture%0A%20%20%20%20%20%20%20%20%23%20default%20is%20no-enforce-eager.%20see%20the%20--compilation-config%20flag%20for%20tighter%20control%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%22--enforce-eager%22%20if%20FAST_BOOT%20else%20%22--no-enforce-eager%22%5D%0A%0A%20%20%20%20%20%20%20%20%23%20assume%20multiple%20GPUs%20are%20for%20splitting%20up%20large%20matrix%20multiplications%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%22--tensor-parallel-size%22%2C%20str(N_GPU)%5D%0A%0A%20%20%20%20%20%20%20%20%23%20add%20model-specific%20configuration%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20skip%20multimedia%20support%2C%20just%20language%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--limit-mm-per-prompt%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json.dumps(%7B%22image%22%3A%200%2C%20%22video%22%3A%200%2C%20%22audio%22%3A%200%7D)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20enable%20reasoning%20and%20tool%20use%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-auto-tool-choice%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--reasoning-parser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22gemma4%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tool-call-parser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22gemma4%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20add%20speculative%20decoding%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--speculative-config%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json.dumps(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22model%22%3A%20SPECULATIVE_MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22revision%22%3A%20SPECULATIVE_MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22num_speculative_tokens%22%3A%204%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20print(*cmd)%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var G=s(W,2);l(G,{id:`deploy-the-server`,children:(e,t)=>{c(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var K=s(G,4);d(K,{code:`modal%20deploy%20vllm_inference.py`,lang:`bash`});var q=s(K,4);l(q,{id:`interact-with-the-server`,children:(e,t)=>{c(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var J=s(q,6);p(s(e(J),3),{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(J);var Y=s(J,2);d(Y,{code:`%23%20pip%20install%20openai%3D%3D1.76.0%0Apython%20openai_compatible%2Fclient.py`,lang:`bash`});var X=s(Y,2);l(X,{id:`testing-the-server`,children:(e,t)=>{c(),i(e,r(`Testing the server`))},$$slots:{default:!0}});var Z=s(X,6);d(Z,{code:`modal%20run%20vllm_inference.py`,lang:`bash`});var Q=s(Z,6);d(Q,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D15%20*%20MINUTES%2C%20content%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20import%20asyncio%0A%20%20%20%20import%20time%0A%0A%20%20%20%20url%20%3D%20await%20Server.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20content%20is%20None%3A%0A%20%20%20%20%20%20%20%20content%20%3D%20%22Explain%20the%20singular%20value%20decomposition.%22%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20print(f%22Running%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20deadline%20%3D%20time.time()%20%2B%20test_timeout%20-%201%20*%20MINUTES%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20session.get(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2Fhealth%22%2C%20timeout%3Daiohttp.ClientTimeout(total%3D60)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status%20%3D%3D%20200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20assert%20False%2C%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Failed%20health%20check%20for%20server%20at%20%7Burl%7D%3A%20HTTP%20%7Bresp.status%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20assert%20False%2C%20f%22Failed%20health%20check%20for%20server%20at%20%7Burl%7D%22%0A%20%20%20%20%20%20%20%20print(f%22Successful%20health%20check%20for%20server%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages)%0A%20%20%20%20%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request(session%2C%20%22llm%22%2C%20messages)%0A%0A%0Aasync%20def%20_send_request(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20model%3A%20str%2C%20messages%3A%20list%0A)%20-%3E%20None%3A%0A%20%20%20%20%23%20%60stream%3DTrue%60%20tells%20an%20OpenAI-compatible%20backend%20to%20stream%20chunks%0A%20%20%20%20payload%3A%20dict%5Bstr%2C%20Any%5D%20%3D%20%7B%22messages%22%3A%20messages%2C%20%22model%22%3A%20model%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20%23%20explicitly%20enable%20thinking%20for%20this%20model%0A%20%20%20%20payload%5B%22chat_template_kwargs%22%5D%20%3D%20%7B%22enable_thinking%22%3A%20True%7D%0A%0A%20%20%20%20headers%20%3D%20%7B%22Content-Type%22%3A%20%22application%2Fjson%22%2C%20%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20extract%20new%20content%20and%20stream%20it%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode().strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%20or%20line%20%3D%3D%20%22data%3A%20%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20line.startswith(%22data%3A%20%22)%3A%20%20%23%20SSE%20prefix%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20line%5Blen(%22data%3A%20%22)%20%3A%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20json.loads(line)%0A%20%20%20%20%20%20%20%20%20%20%20%20assert%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%5B%22object%22%5D%20%3D%3D%20%22chat.completion.chunk%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20or%20something%20went%20horribly%20wrong%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20chunk%5B%22choices%22%5D%5B0%5D%5B%22delta%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20content%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20delta.get(%22content%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20or%20delta.get(%22reasoning%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20or%20delta.get(%22reasoning_content%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(content%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22%5Cn%22%2C%20chunk)%0A%20%20%20%20print()%0A%0A`,lang:`python`});var $=s(Q,2);p(s(e($),5),{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/llm-serving/openai_compatible`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n($),d(s($,2),{code:`modal%20run%20openai_compatible%2Fload_test.py`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=BoO13bwq.js.map
