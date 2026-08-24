(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`44ca7a57-42a4-4264-9200-3b3eecb93e7c`,e._sentryDebugIdIdentifier=`sentry-dbid-44ca7a57-42a4-4264-9200-3b3eecb93e7c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run StepFun models with SGLang`,id:`run-stepfun-models-with-sglang`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Loading and cacheing the model weights`,id:`loading-and-cacheing-the-model-weights`}]},{depth:2,value:`Define the inference server`,id:`define-the-inference-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Run StepFun models with SGLang

In this example, we show how to run a [SGLang](https://github.com/sgl-project/sglang) server
on Modal serving [StepFun's Step 3.7 Flash](https://huggingface.co/stepfun-ai/Step-3.7-Flash-FP8).

## Set up the container image

\`\`\`python
import asyncio
import json
import subprocess
import time

import aiohttp
import modal

MINUTES = 60  # seconds

sglang_image = (
    modal.Image.from_registry("lmsysorg/sglang:dev-cu13-dev-step-3.7-flash")
    .entrypoint([])  # silence chatty logs on container start
    .run_commands("rm -rf /root/.cache/huggingface")  # clean up
)

\`\`\`

We'll need 8 H100 GPUs to run this 196B parameter MoE model.
8 GPUs × 80GB = 640GB VRAM, enough for the ~190GB FP8 model with KV cache overhead.

\`\`\`python
N_GPUS = 8
GPU = f"H100:{N_GPUS}"

\`\`\`

### Loading and cacheing the model weights

\`\`\`python
MODEL_NAME = "stepfun-ai/Step-3.7-Flash-FP8"
MODEL_REVISION = "d14f10bf45f025eae0f096ce7c91e9c08b0416da"

\`\`\`

We use a [Modal Volume](https://modal.com/docs/guide/volumes) to cache model weights
so we don't re-download them on every cold start.

\`\`\`python
HF_CACHE_VOL = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
HF_CACHE_PATH = "/root/.cache/huggingface"

\`\`\`

We also include a [Modal Secret](https://modal.com/docs/guide/secrets)
with Hugging Face API credentials so that we can download the model faster.
You can create a Secret [here](https://modal.com/secrets).

\`\`\`python
hf_secret = modal.Secret.from_name("huggingface-secret")

sglang_image = sglang_image.env(
    {"HF_HUB_CACHE": HF_CACHE_PATH, "HF_XET_HIGH_PERFORMANCE": "1"}
)

\`\`\`

We'll use the \`requests\` library to check server health and warm up the model.

\`\`\`python
with sglang_image.imports():
    import requests


def wait_ready(process: subprocess.Popen, port: int, timeout: int = 10 * MINUTES):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            check_running(process)
            requests.get(f"http://127.0.0.1:{port}/health").raise_for_status()
            return
        except (
            subprocess.CalledProcessError,
            requests.exceptions.ConnectionError,
            requests.exceptions.HTTPError,
        ):
            time.sleep(1)
    raise TimeoutError(f"SGLang server not ready within timeout of {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


def warmup(port: int):
    payload = {
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{port}/v1/chat/completions", json=payload, timeout=120
        ).raise_for_status()


\`\`\`

## Define the inference server

\`\`\`python
app = modal.App(name="example-stepfun-inference")
PORT = 8000
TARGET_INPUTS = 16


@app.server(
    image=sglang_image,
    gpu=GPU,
    volumes={HF_CACHE_PATH: HF_CACHE_VOL},
    secrets=[hf_secret],
    scaledown_window=15 * MINUTES,
    startup_timeout=120 * MINUTES,
    routing_region="us-east",
    port=PORT,
    target_concurrency=TARGET_INPUTS,
    unauthenticated=True,
)
class SGLang:
    @modal.enter()
    def startup(self):
        cmd = [
            "python",
            "-m",
            "sglang.launch_server",
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
            "--ep",
            f"{N_GPUS}",
            "--cuda-graph-max-bs",
            f"{TARGET_INPUTS * 2}",
            "--max-running-requests",
            f"{TARGET_INPUTS * 2}",
            "--enable-metrics",
            "--trust-remote-code",
        ]

        cmd += (
            [
                "--revision",
                MODEL_REVISION,
            ]
            if MODEL_REVISION
            else []
        )

        self.process = subprocess.Popen(cmd)
        wait_ready(self.process, PORT)
        warmup(PORT)

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, run:

\`\`\`bash
modal deploy stepfun_inference.py
\`\`\`

## Test the server

To test the server setup, run:

\`\`\`bash
modal run stepfun_inference.py
\`\`\`

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=40 * MINUTES, prompt=None, twice=True):
    url = await SGLang.get_url.aio()

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
        await probe(url, messages, timeout=test_timeout)


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
            chunk = delta.get("content")

            if chunk:
                print(chunk, end="", flush="\\n" in chunk or "." in chunk)
                full_text += chunk
        print()  # newline after stream completes

\`\`\`
`,meta:{title:`Run StepFun models with SGLang`,description:`In this example, we show how to run a SGLang server on Modal serving StepFun’s Step 3.7 Flash.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>In this example, we show how to run a <!> server
on Modal serving <!>.</p> <!> <!> <p>We’ll need 8 H100 GPUs to run this 196B parameter MoE model.
8 GPUs × 80GB = 640GB VRAM, enough for the ~190GB FP8 model with KV cache overhead.</p> <!> <!> <!> <p>We use a <!> to cache model weights
so we don’t re-download them on every cold start.</p> <!> <p>We also include a <!> with Hugging Face API credentials so that we can download the model faster.
You can create a Secret <!>.</p> <!> <p>We’ll use the <code>requests</code> library to check server health and warm up the model.</p> <!> <!> <!> <!> <p>To deploy the server on Modal, run:</p> <!> <!> <p>To test the server setup, run:</p> <!> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`run-stepfun-models-with-sglang`,children:(e,t)=>{l(),i(e,r(`Run StepFun models with SGLang`))},$$slots:{default:!0}});var g=c(m,2),_=c(e(g));h(_,{href:`https://github.com/sgl-project/sglang`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SGLang`))},$$slots:{default:!0}}),h(c(_,2),{href:`https://huggingface.co/stepfun-ai/Step-3.7-Flash-FP8`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`StepFun’s Step 3.7 Flash`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);u(v,{id:`set-up-the-container-image`,children:(e,t)=>{l(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var y=c(v,2);p(y,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Asglang_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Adev-cu13-dev-step-3.7-flash%22)%0A%20%20%20%20.entrypoint(%5B%5D)%20%20%23%20silence%20chatty%20logs%20on%20container%20start%0A%20%20%20%20.run_commands(%22rm%20-rf%20%2Froot%2F.cache%2Fhuggingface%22)%20%20%23%20clean%20up%0A)%0A`,lang:`python`});var x=c(y,4);p(x,{code:`N_GPUS%20%3D%208%0AGPU%20%3D%20f%22H100%3A%7BN_GPUS%7D%22%0A`,lang:`python`});var S=c(x,2);d(S,{id:`loading-and-cacheing-the-model-weights`,children:(e,t)=>{l(),i(e,r(`Loading and cacheing the model weights`))},$$slots:{default:!0}});var C=c(S,2);p(C,{code:`MODEL_NAME%20%3D%20%22stepfun-ai%2FStep-3.7-Flash-FP8%22%0AMODEL_REVISION%20%3D%20%22d14f10bf45f025eae0f096ce7c91e9c08b0416da%22%0A`,lang:`python`});var w=c(C,2);h(c(e(w)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(T,{code:`HF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0AHF_CACHE_PATH%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0A`,lang:`python`});var E=c(T,2),D=c(e(E));h(D,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),h(c(D,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(E);var O=c(E,2);p(O,{code:`hf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A%0Asglang_image%20%3D%20sglang_image.env(%0A%20%20%20%20%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var k=c(O,4);p(k,{code:`with%20sglang_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20port%3A%20int%2C%20timeout%3A%20int%20%3D%2010%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7Bport%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.CalledProcessError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20raise%20TimeoutError(f%22SGLang%20server%20not%20ready%20within%20timeout%20of%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup(port%3A%20int)%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7Bport%7D%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20timeout%3D120%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`define-the-inference-server`,children:(e,t)=>{l(),i(e,r(`Define the inference server`))},$$slots:{default:!0}});var j=c(A,2);p(j,{code:`app%20%3D%20modal.App(name%3D%22example-stepfun-inference%22)%0APORT%20%3D%208000%0ATARGET_INPUTS%20%3D%2016%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dsglang_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BHF_CACHE_PATH%3A%20HF_CACHE_VOL%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%0A%20%20%20%20startup_timeout%3D120%20*%20MINUTES%2C%0A%20%20%20%20routing_region%3D%22us-east%22%2C%0A%20%20%20%20port%3DPORT%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20SGLang%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BPORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tp%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--ep%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BN_GPUS%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--cuda-graph-max-bs%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BTARGET_INPUTS%20*%202%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--max-running-requests%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BTARGET_INPUTS%20*%202%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--enable-metrics%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--trust-remote-code%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20MODEL_REVISION%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%5B%5D%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process%2C%20PORT)%0A%20%20%20%20%20%20%20%20warmup(PORT)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var N=c(M,4);p(N,{code:`modal%20deploy%20stepfun_inference.py`,lang:`bash`});var P=c(N,2);u(P,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var F=c(P,4);p(F,{code:`modal%20run%20stepfun_inference.py`,lang:`bash`}),p(c(F,2),{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D40%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20SGLang.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20pirate%20who%20can't%20help%20but%20drop%20sly%20reminders%20that%20he%20went%20to%20Harvard.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Explain%20the%20Singular%20Value%20Decomposition.%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%20%20%23%20OpenAI%20chat%20format%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20Jar%20Jar%20Binks.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%0A%0Aasync%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20this%20to%20some%20string%20per%20multi-turn%20interaction%0A%20%20%20%20%23%20often%20a%20UUID%20per%20%22conversation%22%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Server-Sent%20Events%20format%3A%20%22data%3A%20....%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20ignore%20any%20non-JSON%20keepalive%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%20%20%23%20newline%20after%20stream%20completes%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=7Vdi8azu2.js.map
