(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`07bf58d6-0180-48e8-abb6-7496189a507a`,e._sentryDebugIdIdentifier=`sentry-dbid-07bf58d6-0180-48e8-abb6-7496189a507a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Serve Liquid AI ColBERT embeddings with llama.cpp and Modal Servers`,id:`serve-liquid-ai-colbert-embeddings-with-llamacpp-and-modal-servers`,children:[{depth:2,value:`Why use a Modal Server?`,id:`why-use-a-modal-server`},{depth:2,value:`Choose the model file and engine parameters`,id:`choose-the-model-file-and-engine-parameters`},{depth:2,value:`Cache the model weights`,id:`cache-the-model-weights`},{depth:2,value:`Define the container image`,id:`define-the-container-image`},{depth:2,value:`Define the Server`,id:`define-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`},{depth:2,value:`Deploy the Server`,id:`deploy-the-server`}]}],rawContent:`# Serve Liquid AI ColBERT embeddings with llama.cpp and Modal Servers

In this example, we serve
[LiquidAI/LFM2.5-ColBERT-350M](https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M)
using [llama.cpp](https://github.com/ggml-org/llama.cpp)
in a [Modal Server](https://modal.com/docs/guide/servers).

LFM2.5-ColBERT-350M is a 353M-parameter [late interaction embedding model](https://arxiv.org/abs/2004.12832).
That means it produces one embedding vector per query token.
Similarity is computed by comparing each of those vectors with each of the document's token embeddings to produce a final score,
rather than just comparing a single vector per query per document.

This is not supported by the OpenAI-compatible \`/v1/embeddings\` API,
so we instead use the \`/embeddings\` API in \`llama.cpp\`.

The model is intended for short queries against small documents,
like comparing user search queries with product descriptions in e-commerce.

The model is available under the [LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M/blob/ac509ef9346912166a5f2f63d5ee41d9c472c330/LICENSE),
which includes restrictions on commercial use.

## Why use a Modal Server?

To minimize routing overheads, we use \`@app.server\`,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads,
like interactive search via embeddings.
See the [Modal Servers guide](https://modal.com/docs/guide/servers) for details.

## Choose the model file and engine parameters

Liquid AI publishes official GGUF conversions of the model in
[LiquidAI/LFM2.5-ColBERT-350M-GGUF](https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M-GGUF).

\`\`\`python
import json
import subprocess
import time
import urllib.error
import urllib.request

import modal

MODEL_REPO = "LiquidAI/LFM2.5-ColBERT-350M-GGUF"
MODEL_REVISION = "bc240003aba07253e261a8aaf0d2c9683318a967"  # version-pinning
MODEL_FILE = "LFM2.5-ColBERT-350M-BF16.gguf"
MODEL_URL = f"https://huggingface.co/{MODEL_REPO}/resolve/{MODEL_REVISION}/{MODEL_FILE}"

\`\`\`

\`llama-server\` processes requests in \`N_SLOTS\` parallel slots
and splits the total token context evenly across them.
We give each slot the model's trained sequence length of 512 tokens.

\`\`\`python
MAX_INPUT_TOKENS = 512  # the model's trained sequence length
N_SLOTS = 4  # target concurrent requests per container; adjust as needed
TOKEN_EMBEDDING_DIM = 128  # the model's output embedding dimension

\`\`\`

Queries and documents are prefixed with special tokens before encoding.

\`\`\`python
DOCUMENT_PREFIX = "[D] "
QUERY_PREFIX = "[Q] "

\`\`\`

## Cache the model weights

We persist the llama.cpp download cache in a Modal
[Volume](https://modal.com/docs/guide/volumes)
so the GGUF file is downloaded from the Hub exactly once
and loaded from the Volume on later cold starts.

\`\`\`python
CACHE_PATH = "/cache"
MODEL_PATH = f"{CACHE_PATH}/llama.cpp/{MODEL_FILE}"

volume = modal.Volume.from_name("liquidai-embeddings-cache", create_if_missing=True)

\`\`\`

## Define the container image

We build on the official llama.cpp server image.
It contains the compiled binary but doesn't include Python,
so \`add_python\` bundles an interpreter for Modal's own runtime.
We also clear the image's entrypoint, which is the server binary itself,
so that we can control the startup.

\`\`\`python
image = (
    modal.Image.from_registry(
        "ghcr.io/ggml-org/llama.cpp:server-b9917", add_python="3.12"
    )
    .entrypoint([])
    .env({"LLAMA_CACHE": f"{CACHE_PATH}/llama.cpp"})
)

\`\`\`

## Define the Server

We wrap the engine in a class decorated with \`@app.server()\`,
which attaches the Image and Volume,
defines autoscaling rules,
fronts the containers with a proxy, and more.
See details in the [Modal Servers guide](https://modal.com/docs/guide/servers).

\`\`\`python
MINUTES = 60  # seconds
PORT = 8000


app = modal.App("example-liquidai-embeddings-server")


@app.server(
    image=image,
    volumes={CACHE_PATH: volume},
    port=PORT,
    target_concurrency=N_SLOTS,
    min_containers=0,  # set to 1 or more to keep a warm replica for latency-sensitive use cases
    startup_timeout=10 * MINUTES,  # allow time to download and load the model
    scaledown_window=5 * MINUTES,  # retain loaded replicas across short traffic gaps
    exit_grace_period=20,  # allow in-flight embedding requests to finish before shutdown
    unauthenticated=True,
)
class LlamaServer:
    @modal.enter()
    def start(self):
        cmd = [
            "/app/llama-server",
            "--model-url",
            MODEL_URL,
            "--model",
            MODEL_PATH,
            "--embeddings",
            "--pooling",
            "none",  # return one vector per input token
            "--host",
            "0.0.0.0",
            "--port",
            str(PORT),
            "--no-ui",  # no chat interface, we're serving embeddings
            "--metrics",  # enable metrics logging
            "--parallel",
            str(N_SLOTS),
            "--ctx-size",
            str(N_SLOTS * MAX_INPUT_TOKENS),  # total context shared across slots
            # Bidirectional embedding models require all tokens in an iteration to fit
            # in one physical batch. Using the full context for batch sizes allows all
            # slots to process maximum-length inputs together.
            "--batch-size",  # max tokens per iteration during continuous batching
            str(N_SLOTS * MAX_INPUT_TOKENS),
            "--ubatch-size",  # max tokens in a physical computation batch
            str(N_SLOTS * MAX_INPUT_TOKENS),
        ]

        self.proc = subprocess.Popen(cmd, start_new_session=True)
        wait_ready(self.proc)

    @modal.exit()
    def stop(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait()


\`\`\`

Modal considers a new replica ready once the \`@modal.enter\` methods have exited
and the serving process inside starts accepting connections.
\`llama-server\` answers \`/health\` with a [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
while the model loads, so we block the startup hook from completing with this \`wait_ready\` function.

\`\`\`python
def wait_ready(proc: subprocess.Popen, port=PORT):
    import socket

    while True:
        try:
            if (
                returncode := proc.poll()
            ) is not None:  # fail fast if the server process died
                raise RuntimeError(f"Server process exited with code {returncode}")
            socket.create_connection(("127.0.0.1", port), timeout=5).close()
            request = urllib.request.Request(f"http://127.0.0.1:{port}/health")
            request_with_retry(request, timeout=30).close()
            return
        except (ConnectionRefusedError, TimeoutError):
            continue


\`\`\`

Modal Servers also respond with a 503 when no replicas are available to handle requests, so we pull out
a helper function that retries on 503 for use with server clients.

\`\`\`python
def request_with_retry(request: urllib.request.Request, timeout=10 * MINUTES):
    deadline = time.monotonic() + timeout
    delay = 1.0

    while (remaining := deadline - time.monotonic()) > 0:
        try:
            return urllib.request.urlopen(request, timeout=remaining)
        except urllib.error.HTTPError as exc:
            if exc.code != 503:  # 503 Service Unavailable, no containers ready
                raise exc
        time.sleep(min(delay, remaining))
        delay = min(delay * 2, 10.0)
    raise TimeoutError(f"Server not ready within {timeout} seconds")


\`\`\`

## Test the server

Running \`modal run liquidai_embeddings_server.py\` executes the \`local_entrypoint\` below
against a temporary instance of the Server, which is useful for testing and development.
The client requests one embedding after waiting for a live replica.

\`\`\`python
@app.local_entrypoint()
def main(input: str | None = None, test_timeout: int = 5 * MINUTES):
    url = LlamaServer.get_url()
    print(f"Server URL: {url}")

    request = urllib.request.Request(f"{url}/health")
    request_with_retry(request=request, timeout=test_timeout).close()

    if input is None:
        input = "ColBERT introduces a late interaction architecture that independently encodes the query and the document using BERT"

    request_data = {"input": [DOCUMENT_PREFIX + input]}
    request = urllib.request.Request(
        f"{url}/embeddings",
        data=json.dumps(request_data).encode(),
        headers={"Content-Type": "application/json"},
    )

    started_at = time.perf_counter()
    with request_with_retry(request, timeout=test_timeout) as response:
        elapsed = time.perf_counter() - started_at
        data = json.load(response)

    assert len(data), "empty response from server"
    embedding = data[0].get("embedding")
    assert embedding, f"server failed to respond with embedding, got {data}"

    print(
        f"client-side inference latency: {elapsed:.3f}s",
        f"embedding shape: ({len(embedding)}, {len(embedding[0])})",
        sep="\\n",
    )


\`\`\`

## Deploy the Server

Deploy the Server with

\`\`\`bash
modal deploy liquidai_embeddings_server.py
\`\`\`

The deploy command prints the Server's public URL.
`,meta:{title:`Serve Liquid AI ColBERT embeddings with llama.cpp and Modal Servers`,description:`In this example, we serve LiquidAI/LFM2.5-ColBERT-350M using llama.cpp in a Modal Server.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>In this example, we serve <!> using <!> in a <!>.</p> <p>LFM2.5-ColBERT-350M is a 353M-parameter <!>.
That means it produces one embedding vector per query token.
Similarity is computed by comparing each of those vectors with each of the document’s token embeddings to produce a final score,
rather than just comparing a single vector per query per document.</p> <p>This is not supported by the OpenAI-compatible <code>/v1/embeddings</code> API,
so we instead use the <code>/embeddings</code> API in <code>llama.cpp</code>.</p> <p>The model is intended for short queries against small documents,
like comparing user search queries with product descriptions in e-commerce.</p> <p>The model is available under the <!>,
which includes restrictions on commercial use.</p> <!> <p>To minimize routing overheads, we use <code>@app.server</code>,
which uses a new, low-latency routing service on Modal designed for latency-sensitive inference workloads,
like interactive search via embeddings.
See the <!> for details.</p> <!> <p>Liquid AI publishes official GGUF conversions of the model in <!>.</p> <!> <p><code>llama-server</code> processes requests in <code>N_SLOTS</code> parallel slots
and splits the total token context evenly across them.
We give each slot the model’s trained sequence length of 512 tokens.</p> <!> <p>Queries and documents are prefixed with special tokens before encoding.</p> <!> <!> <p>We persist the llama.cpp download cache in a Modal <!> so the GGUF file is downloaded from the Hub exactly once
and loaded from the Volume on later cold starts.</p> <!> <!> <p>We build on the official llama.cpp server image.
It contains the compiled binary but doesn’t include Python,
so <code>add_python</code> bundles an interpreter for Modal’s own runtime.
We also clear the image’s entrypoint, which is the server binary itself,
so that we can control the startup.</p> <!> <!> <p>We wrap the engine in a class decorated with <code>@app.server()</code>,
which attaches the Image and Volume,
defines autoscaling rules,
fronts the containers with a proxy, and more.
See details in the <!>.</p> <!> <p>Modal considers a new replica ready once the <code>@modal.enter</code> methods have exited
and the serving process inside starts accepting connections. <code>llama-server</code> answers <code>/health</code> with a <!> while the model loads, so we block the startup hook from completing with this <code>wait_ready</code> function.</p> <!> <p>Modal Servers also respond with a 503 when no replicas are available to handle requests, so we pull out
a helper function that retries on 503 for use with server clients.</p> <!> <!> <p>Running <code>modal run liquidai_embeddings_server.py</code> executes the <code>local_entrypoint</code> below
against a temporary instance of the Server, which is useful for testing and development.
The client requests one embedding after waiting for a live replica.</p> <!> <!> <p>Deploy the Server with</p> <!> <p>The deploy command prints the Server’s public URL.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`serve-liquid-ai-colbert-embeddings-with-llamacpp-and-modal-servers`,children:(e,t)=>{l(),i(e,r(`Serve Liquid AI ColBERT embeddings with llama.cpp and Modal Servers`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LiquidAI/LFM2.5-ColBERT-350M`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://github.com/ggml-org/llama.cpp`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`llama.cpp`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Server`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,2);m(c(e(v)),{href:`https://arxiv.org/abs/2004.12832`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`late interaction embedding model`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,6);m(c(e(b)),{href:`https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M/blob/ac509ef9346912166a5f2f63d5ee41d9c472c330/LICENSE`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LFM Open License v1.0`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);u(x,{id:`why-use-a-modal-server`,children:(e,t)=>{l(),i(e,r(`Why use a Modal Server?`))},$$slots:{default:!0}});var S=c(x,2);m(c(e(S),3),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Servers guide`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);u(C,{id:`choose-the-model-file-and-engine-parameters`,children:(e,t)=>{l(),i(e,r(`Choose the model file and engine parameters`))},$$slots:{default:!0}});var w=c(C,2);m(c(e(w)),{href:`https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M-GGUF`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LiquidAI/LFM2.5-ColBERT-350M-GGUF`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);f(T,{code:`import%20json%0Aimport%20subprocess%0Aimport%20time%0Aimport%20urllib.error%0Aimport%20urllib.request%0A%0Aimport%20modal%0A%0AMODEL_REPO%20%3D%20%22LiquidAI%2FLFM2.5-ColBERT-350M-GGUF%22%0AMODEL_REVISION%20%3D%20%22bc240003aba07253e261a8aaf0d2c9683318a967%22%20%20%23%20version-pinning%0AMODEL_FILE%20%3D%20%22LFM2.5-ColBERT-350M-BF16.gguf%22%0AMODEL_URL%20%3D%20f%22https%3A%2F%2Fhuggingface.co%2F%7BMODEL_REPO%7D%2Fresolve%2F%7BMODEL_REVISION%7D%2F%7BMODEL_FILE%7D%22%0A`,lang:`python`});var E=c(T,4);f(E,{code:`MAX_INPUT_TOKENS%20%3D%20512%20%20%23%20the%20model's%20trained%20sequence%20length%0AN_SLOTS%20%3D%204%20%20%23%20target%20concurrent%20requests%20per%20container%3B%20adjust%20as%20needed%0ATOKEN_EMBEDDING_DIM%20%3D%20128%20%20%23%20the%20model's%20output%20embedding%20dimension%0A`,lang:`python`});var D=c(E,4);f(D,{code:`DOCUMENT_PREFIX%20%3D%20%22%5BD%5D%20%22%0AQUERY_PREFIX%20%3D%20%22%5BQ%5D%20%22%0A`,lang:`python`});var O=c(D,2);u(O,{id:`cache-the-model-weights`,children:(e,t)=>{l(),i(e,r(`Cache the model weights`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`CACHE_PATH%20%3D%20%22%2Fcache%22%0AMODEL_PATH%20%3D%20f%22%7BCACHE_PATH%7D%2Fllama.cpp%2F%7BMODEL_FILE%7D%22%0A%0Avolume%20%3D%20modal.Volume.from_name(%22liquidai-embeddings-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var j=c(A,2);u(j,{id:`define-the-container-image`,children:(e,t)=>{l(),i(e,r(`Define the container image`))},$$slots:{default:!0}});var M=c(j,4);f(M,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22ghcr.io%2Fggml-org%2Fllama.cpp%3Aserver-b9917%22%2C%20add_python%3D%223.12%22%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.env(%7B%22LLAMA_CACHE%22%3A%20f%22%7BCACHE_PATH%7D%2Fllama.cpp%22%7D)%0A)%0A`,lang:`python`});var N=c(M,2);u(N,{id:`define-the-server`,children:(e,t)=>{l(),i(e,r(`Define the Server`))},$$slots:{default:!0}});var P=c(N,2);m(c(e(P),3),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Servers guide`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);f(F,{code:`MINUTES%20%3D%2060%20%20%23%20seconds%0APORT%20%3D%208000%0A%0A%0Aapp%20%3D%20modal.App(%22example-liquidai-embeddings-server%22)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7BCACHE_PATH%3A%20volume%7D%2C%0A%20%20%20%20port%3DPORT%2C%0A%20%20%20%20target_concurrency%3DN_SLOTS%2C%0A%20%20%20%20min_containers%3D0%2C%20%20%23%20set%20to%201%20or%20more%20to%20keep%20a%20warm%20replica%20for%20latency-sensitive%20use%20cases%0A%20%20%20%20startup_timeout%3D10%20*%20MINUTES%2C%20%20%23%20allow%20time%20to%20download%20and%20load%20the%20model%0A%20%20%20%20scaledown_window%3D5%20*%20MINUTES%2C%20%20%23%20retain%20loaded%20replicas%20across%20short%20traffic%20gaps%0A%20%20%20%20exit_grace_period%3D20%2C%20%20%23%20allow%20in-flight%20embedding%20requests%20to%20finish%20before%20shutdown%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20LlamaServer%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%2Fapp%2Fllama-server%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model-url%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_URL%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_PATH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--embeddings%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--pooling%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22none%22%2C%20%20%23%20return%20one%20vector%20per%20input%20token%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(PORT)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--no-ui%22%2C%20%20%23%20no%20chat%20interface%2C%20we're%20serving%20embeddings%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--metrics%22%2C%20%20%23%20enable%20metrics%20logging%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--parallel%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(N_SLOTS)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--ctx-size%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(N_SLOTS%20*%20MAX_INPUT_TOKENS)%2C%20%20%23%20total%20context%20shared%20across%20slots%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Bidirectional%20embedding%20models%20require%20all%20tokens%20in%20an%20iteration%20to%20fit%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20in%20one%20physical%20batch.%20Using%20the%20full%20context%20for%20batch%20sizes%20allows%20all%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20slots%20to%20process%20maximum-length%20inputs%20together.%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--batch-size%22%2C%20%20%23%20max%20tokens%20per%20iteration%20during%20continuous%20batching%0A%20%20%20%20%20%20%20%20%20%20%20%20str(N_SLOTS%20*%20MAX_INPUT_TOKENS)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--ubatch-size%22%2C%20%20%23%20max%20tokens%20in%20a%20physical%20computation%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20str(N_SLOTS%20*%20MAX_INPUT_TOKENS)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20subprocess.Popen(cmd%2C%20start_new_session%3DTrue)%0A%20%20%20%20%20%20%20%20wait_ready(self.proc)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.proc.terminate()%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.proc.wait(timeout%3D10)%0A%20%20%20%20%20%20%20%20except%20subprocess.TimeoutExpired%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.proc.kill()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.proc.wait()%0A%0A`,lang:`python`});var I=c(F,2);m(c(e(I),7),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),l(3),n(I);var L=c(I,2);f(L,{code:`def%20wait_ready(proc%3A%20subprocess.Popen%2C%20port%3DPORT)%3A%0A%20%20%20%20import%20socket%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20returncode%20%3A%3D%20proc.poll()%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20is%20not%20None%3A%20%20%23%20fail%20fast%20if%20the%20server%20process%20died%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Server%20process%20exited%20with%20code%20%7Breturncode%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20socket.create_connection((%22127.0.0.1%22%2C%20port)%2C%20timeout%3D5).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20request%20%3D%20urllib.request.Request(f%22http%3A%2F%2F127.0.0.1%3A%7Bport%7D%2Fhealth%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20request_with_retry(request%2C%20timeout%3D30).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(ConnectionRefusedError%2C%20TimeoutError)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A`,lang:`python`});var R=c(L,4);f(R,{code:`def%20request_with_retry(request%3A%20urllib.request.Request%2C%20timeout%3D10%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20timeout%0A%20%20%20%20delay%20%3D%201.0%0A%0A%20%20%20%20while%20(remaining%20%3A%3D%20deadline%20-%20time.monotonic())%20%3E%200%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20urllib.request.urlopen(request%2C%20timeout%3Dremaining)%0A%20%20%20%20%20%20%20%20except%20urllib.error.HTTPError%20as%20exc%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20exc.code%20!%3D%20503%3A%20%20%23%20503%20Service%20Unavailable%2C%20no%20containers%20ready%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20exc%0A%20%20%20%20%20%20%20%20time.sleep(min(delay%2C%20remaining))%0A%20%20%20%20%20%20%20%20delay%20%3D%20min(delay%20*%202%2C%2010.0)%0A%20%20%20%20raise%20TimeoutError(f%22Server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`test-the-server`,children:(e,t)=>{l(),i(e,r(`Test the server`))},$$slots:{default:!0}});var B=c(z,4);f(B,{code:`%40app.local_entrypoint()%0Adef%20main(input%3A%20str%20%7C%20None%20%3D%20None%2C%20test_timeout%3A%20int%20%3D%205%20*%20MINUTES)%3A%0A%20%20%20%20url%20%3D%20LlamaServer.get_url()%0A%20%20%20%20print(f%22Server%20URL%3A%20%7Burl%7D%22)%0A%0A%20%20%20%20request%20%3D%20urllib.request.Request(f%22%7Burl%7D%2Fhealth%22)%0A%20%20%20%20request_with_retry(request%3Drequest%2C%20timeout%3Dtest_timeout).close()%0A%0A%20%20%20%20if%20input%20is%20None%3A%0A%20%20%20%20%20%20%20%20input%20%3D%20%22ColBERT%20introduces%20a%20late%20interaction%20architecture%20that%20independently%20encodes%20the%20query%20and%20the%20document%20using%20BERT%22%0A%0A%20%20%20%20request_data%20%3D%20%7B%22input%22%3A%20%5BDOCUMENT_PREFIX%20%2B%20input%5D%7D%0A%20%20%20%20request%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20f%22%7Burl%7D%2Fembeddings%22%2C%0A%20%20%20%20%20%20%20%20data%3Djson.dumps(request_data).encode()%2C%0A%20%20%20%20%20%20%20%20headers%3D%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20started_at%20%3D%20time.perf_counter()%0A%20%20%20%20with%20request_with_retry(request%2C%20timeout%3Dtest_timeout)%20as%20response%3A%0A%20%20%20%20%20%20%20%20elapsed%20%3D%20time.perf_counter()%20-%20started_at%0A%20%20%20%20%20%20%20%20data%20%3D%20json.load(response)%0A%0A%20%20%20%20assert%20len(data)%2C%20%22empty%20response%20from%20server%22%0A%20%20%20%20embedding%20%3D%20data%5B0%5D.get(%22embedding%22)%0A%20%20%20%20assert%20embedding%2C%20f%22server%20failed%20to%20respond%20with%20embedding%2C%20got%20%7Bdata%7D%22%0A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22client-side%20inference%20latency%3A%20%7Belapsed%3A.3f%7Ds%22%2C%0A%20%20%20%20%20%20%20%20f%22embedding%20shape%3A%20(%7Blen(embedding)%7D%2C%20%7Blen(embedding%5B0%5D)%7D)%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`deploy-the-server`,children:(e,t)=>{l(),i(e,r(`Deploy the Server`))},$$slots:{default:!0}}),f(c(V,4),{code:`modal%20deploy%20liquidai_embeddings_server.py`,lang:`bash`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BrhkLf6T.js.map
