(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`629bf7a3-bb63-476a-ba16-d21bba3a74b3`,e._sentryDebugIdIdentifier=`sentry-dbid-629bf7a3-bb63-476a-ba16-d21bba3a74b3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Serve very large language models (DeepSeek V3, Kimi-K2, GLM 4.7/5)`,id:`serve-very-large-language-models-deepseek-v3-kimi-k2-glm-475`,children:[{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`,children:[{depth:3,value:`Load model weights`,id:`load-model-weights`},{depth:3,value:`Configure the inference engine`,id:`configure-the-inference-engine`}]},{depth:2,value:`Configure infrastructure`,id:`configure-infrastructure`,children:[{depth:3,value:`Define the server`,id:`define-the-server`}]},{depth:2,value:`Test the server`,id:`test-the-server`},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Serve very large language models (DeepSeek V3, Kimi-K2, GLM 4.7/5)

This example demonstrates the basic patterns for serving language models on Modal
whose weights consume hundreds of gigabytes of storage.

In short:

- load weights into a Modal Volume ahead of server launch
- use random "dummy" weights when iteratively developing your server
- use two, four, or eight H200 or B200 GPUs
- use lower-precision weight formats (FP4 on Blackwell, FP8 on Hopper)
- default to using speculative decoding, especially if batches are in the few tens of sequences

For more tips on how to serve specific types of LLM inference at high performance,
see [this guide](https://modal.com/docs/guide/high-performance-llm-inference).
For a gentler introduction to LLM serving,
see [this example](https://modal.com/docs/examples/llm_inference).

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

We start by creating a Modal Image based on the Docker image
provided by the SGLang team.
This contains our Python and system dependencies.
Add more by chaining \`.apt_install\` and \`.uv_pip_install\`
or \`.pip_install\`  method calls, as we do below with
\`.entrypoint\`.
See the [Modal Image guide](https://modal.com/docs/guide/images)
for details.

\`\`\`python
image = modal.Image.from_registry("lmsysorg/sglang:v0.5.7").entrypoint(
    []  # silence chatty logs on entry
)

\`\`\`

### Load model weights

Large model weights take a long time to move around.
Model weight servers like Hugging Face will send weights
at a few hundred megabytes per second. For large models,
with weight sizes in the hundreds of gigabytes,
that means thousands of seconds (tens of minutes)
of model loading time.

After loading them we can cache these weights in a Modal
[Volume](https://modal.com/docs/guide/volumes)
so that they are loaded about 10x faster --
about one to three gigabytes per second.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

\`\`\`

That still means minutes of startup time.
Both of these latencies kill productivity when you're iterating
on aspects besides model behavior, like server configuration.

For this reason, we recommend skipping model loading while you're developing
a server or configuration -- even when benchmarking, if you can!
You can still exercise the same code paths if you use the \`dummy\` model
loading format. In this sample code, we add an \`APP_USE_DUMMY_WEIGHTS\` environment variable
to control this behavior from the command line during iteration.

\`\`\`python
USE_DUMMY_WEIGHTS = os.environ.get("APP_USE_DUMMY_WEIGHTS", "0").lower() in (
    "1",
    "true",
)

image = image.env(
    {
        "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
        "APP_USE_DUMMY_WEIGHTS": str(int(USE_DUMMY_WEIGHTS)),
    }
)

\`\`\`

We download the model weights from Hugging Face by
running a Python function as part of the Modal Image build.
Note that command-line logging will be somewhat limited.

\`\`\`python
def download_model(repo_id, revision=None):
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id, revision=revision)


\`\`\`

To run the function, we need to pick a specific model to download.
We'll use Z.ai's GLM 4.7 in eight bit
[floating point quantization](https://modal.com/llm-almanac/quant-formats).

This model takes about thirty minutes to an hour to download from Hugging Face.

\`\`\`python
REPO_ID = "zai-org/GLM-4.7-FP8"

if not USE_DUMMY_WEIGHTS:  # skip download if we don't need real weights
    image = image.run_function(
        download_model,
        volumes={"/root/.cache/huggingface": hf_cache_vol},
        args=(REPO_ID,),
    )

\`\`\`

### Configure the inference engine

Running large models efficiently requires specialized inference engines like SGLang.
These engines are generally highly configurable.

For SGLang, there are three main sources of configuration values:

- _Environment variables_ for the process running \`sglang\`.
- _Command-line arguments_ for the command to launch the \`sglang\` process.
- _Configuration files_ loaded by the \`sglang\` process.

For deployments, we prefer to put information in configuration files where possible.
CLI arguments and configuration files can typically be interchanged.
CLI arguments are convenient when iterating, but configuration files are easier to share.
We use environment variables only as a last resort, typically to activate new or experimental features.

**Environment variables**

SGLang environment variables are prefixed with \`SGL_\` or \`SGLANG_\`.
The \`SGL_\` prefix is deprecated.

The snippet below adds any such environment variables
present during deployment to the Modal Image.

\`\`\`python
def is_sglang_env_var(key):
    return key.startswith("SGL_") or key.startswith("SGLANG_")


image = image.env(
    {key: value for key, value in os.environ.items() if is_sglang_env_var(key)}
)

\`\`\`

**YAML**

Configuration files can be passed in YAML format.

We include a default config in-line in the code here for ease of use.
It's designed to run GLM 4.7 FP8 at low to moderate concurrency.
In particular, it uses that model's built-in multi-token prediction speculative decoding to improve
[time per output token](https://modal.com/llm-almanac/how-to-benchmark).

\`\`\`python
default_config = """\\
 # General Config
 host: 0.0.0.0
 log-level: debug  # very noisy

 # Model Config
 tool-call-parser: glm47
 reasoning-parser: glm45
 trust-remote-code: true

 # Memory
 mem-fraction-static: 0.85
 chunked-prefill-size: 32768
 kv-cache-dtype: fp8_e4m3

 # Observability
 enable-metrics: true
 collect-tokens-histogram: true

 # Batching
 max-running-requests: 32
 cuda-graph-max-bs: 32

 # SpecDec (speed up low/moderate concurrency)
 speculative-algorithm: EAGLE  # built into GLM 4.7, is just multi-token prediction
"""

\`\`\`

You'll want to provide your own configuration file for other settings,
in particular if you change the model.

We add an environment variable, \`APP_LOCAL_CONFIG_PATH\`,
to change the loaded configuration.

\`\`\`python
local_config_path = os.environ.get("APP_LOCAL_CONFIG_PATH")

if modal.is_local():
    if local_config_path is None:
        local_config_path = here / "config_very_large_models.yaml"

        if not local_config_path.exists():
            local_config_path.write_text(default_config)

        print(
            f"Using default config from {local_config_path.relative_to(here)}:",
            default_config,
            sep="\\n",
        )

    image = image.add_local_file(local_config_path, "/root/config.yaml")

\`\`\`

** Command-line arguments**

We launch our server by kicking off a subprocess.
The convenience function below encapsulates the command
and its arguments.

We pass a few key bits of configuration that are consumed
by other code here, rather than in a configuration file,
so that values stay in sync.

That includes:

- Model information, which is also used during weight cacheing
- GPU count, which is also used below when defining our Modal deployment
- the port to serve on, which is also used to connect up Modal networking

We also pass the \`HF_HUB_OFFLINE\` environment variable here,
so that our server will crash when trying to load the real model
if those weights are not in cache.
For smaller models, we can instead load weights dynamically on
server start (and cache them so later starts are faster).
But for large models, weight loading extends the first start latency
so much that downstream timeouts are triggered --
or need to be extended so much that they are no longer tight enough
on the happy path.

\`\`\`python
def _start_server() -> subprocess.Popen:
    """Start SGLang server in a subprocess"""
    cmd = [
        f"HF_HUB_OFFLINE={0 if USE_DUMMY_WEIGHTS else 1}",
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

    if USE_DUMMY_WEIGHTS:
        cmd.extend(["--load-format", "dummy"])

    print("Starting SGLang server with command:")
    print(*cmd)

    return subprocess.Popen(" ".join(cmd), shell=True, start_new_session=True)


\`\`\`

Lastly, we import the \`sglang\` library as part of loading the Image on Modal.
This is a minor optimization, but it can shave a few seconds off cold start latencies
by providing better prefetching hints, and every second counts!

\`\`\`python
with image.imports():
    import sglang  # noqa

\`\`\`

## Configure infrastructure

Now, we wrap our configured SGLang server for our large model
in the infrastructure required to run and interact with it.
Infrastrucure in Modal is generally attached to an App.
Here, we'll attach our Modal Image as the default for
Modal Functions that run in the App.

\`\`\`python
app = modal.App("example-serve-very-large-models", image=image)

\`\`\`

Most importantly, we need to decide what hardware to run on.
[H200 and B200 GPUs](https://modal.com/blog/introducing-b200-h200)
have over 100 GB of [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram) --
141 GB and 180 GB, respectively.
The model's weights will be stored in this memory,
and they consume several hundred gigabytes of space,
so we will generally want several of these accelerators.
We also need space for the model's KV cache of activations
on input sequences.

In eight-bit precision, GLM 4.7 consumes ~350 GB of space,
so we use four H200s for 564 GB of RAM.

\`\`\`python
GPU_TYPE = "H200"
GPU_COUNT = 4

\`\`\`

We'll use a Modal Server to serve our model.
This reduces client latencies and provides for regionalized deployment.
You can read more about it in [this example](https://modal.com/docs/examples/sglang_low_latency).
To configure it, we need to pass in region information for the GPU workers
and for the load-balancing proxy.

\`\`\`python
REGION = "us"
ROUTING_REGION = "us-east"

\`\`\`

Lastly, we need to configure autoscaling parameters.
By default, Modal is fully serverless, and applications
scale to zero when there is no load.
But booting up inference engines for large models takes minutes,
which is generally longer than clients can tolerate waiting.

So a production deployment of large models that has clients with
per-request SLAs in the few or tens of seconds
generally needs to keep one replica up at all times.
In Modal, we achieve this with the \`min_containers\` parameter
of \`App.cls\` or \`App.function\`.

This can trigger substantial costs, so we leave the value at \`0\`
in this sample code.

\`\`\`python
MIN_CONTAINERS = 0  # Set to 1 for production to keep a warm replica

\`\`\`

Deployments of large models with a single node per replica can generally handle a few tens of requests
without queueing. When a particular replica has more requests than it can handle, we want to scale it up.
This behavior is configured by setting \`target_concurrency\` parameter to \`target_inputs\`.

\`\`\`python
TARGET_INPUTS = 10  # Concurrent requests per replica before scaling

\`\`\`

### Define the server

Now we're ready to put all of our infrastructure configuration
together into a Modal Server.

The Modal Server allows us to control
[container lifecycle](https://modal.com/docs/guide/lifecycle-functions).
In particular, it lets us define work that a replica should do before
and after it handles requests in methods decorated with \`modal.enter\`
and \`modal.exit\`, respectively.

\`\`\`python
SGLANG_PORT = 8000
MINUTES = 60  # seconds


@app.server(
    image=image,
    gpu=f"{GPU_TYPE}:{GPU_COUNT}",
    scaledown_window=20 * MINUTES,  # how long should we stay up with no requests?
    startup_timeout=30 * MINUTES,  # how long should we wait for container start?
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    compute_region=REGION,
    min_containers=MIN_CONTAINERS,
    port=SGLANG_PORT,
    routing_region=ROUTING_REGION,
    exit_grace_period=25,  # time to finish requests on shutdown (seconds)
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


\`\`\`

We called a \`wait_for_server_ready\` function in our \`modal.enter\` method.
That's defined below. It pings the \`/health\` endpoint until the server responds.

\`\`\`python
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

You can deploy a fresh replica and test it
using the command

\`\`\`bash
APP_USE_DUMMY_WEIGHTS=1 modal run very_large_models.py
\`\`\`

which will create an ephemeral Modal App
and execute the \`local_entrypoint\` code below.

Because the weights are randomized, the outputs are also random.
Remove the \`APP_USE_DUMMY_WEIGHTS\` flag to test the trained model.

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=20 * MINUTES, content=None, twice=True):
    """Test the model serving endpoint"""
    url = await Server.get_url.aio()

    if USE_DUMMY_WEIGHTS:
        system_prompt = {"role": "system", "content": "This system produces gibberish."}
    else:
        system_prompt = {"role": "system", "content": "You are a helpful AI assistant."}

    if content is None:
        content = "Explain the transformer architecture in one paragraph."

    messages = [system_prompt, {"role": "user", "content": content}]

    print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
    await probe(url, messages, timeout=test_timeout)

    if twice:
        messages[1]["content"] = "What is the capital of France?"
        print(f"Sending second request to {url}:", *messages, sep="\\n\\t")
        await probe(url, messages, timeout=1 * MINUTES)


\`\`\`

The unique client logic for Modal deployments is in the \`probe\` function below.
Specifically, when a Modal Server is spinning up,
i.e. before the \`modal.enter\` finishes for at least one replica,
clients will see a \`503 Service Unavailable\` status
and so should retry.

\`\`\`python
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

When you're ready, you can create a persistent deployment with

\`\`\`bash
APP_USE_DUMMY_WEIGHTS=0 modal deploy very_large_models.py
\`\`\`

And hit it with any OpenAI API-compatible client!

## Addenda

The \`probe\` function above uses this helper function
to stream response tokens as they become available.

\`\`\`python
async def _send_request_streaming(
    session: aiohttp.ClientSession, messages: list, timeout: int | None = None
):
    """Stream response from chat completions endpoint"""
    payload = {
        "messages": messages,
        "stream": True,
        "max_tokens": 1024 if USE_DUMMY_WEIGHTS else None,
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
`,meta:{title:`Serve very large language models (DeepSeek V3, Kimi-K2, GLM 4.7/5)`,description:`This example demonstrates the basic patterns for serving language models on Modal whose weights consume hundreds of gigabytes of storage.`}},{toc:h,rawContent:g,meta:_}=m,ne=t(`<!> <p>This example demonstrates the basic patterns for serving language models on Modal
whose weights consume hundreds of gigabytes of storage.</p> <p>In short:</p> <ul><li>load weights into a Modal Volume ahead of server launch</li> <li>use random “dummy” weights when iteratively developing your server</li> <li>use two, four, or eight H200 or B200 GPUs</li> <li>use lower-precision weight formats (FP4 on Blackwell, FP8 on Hopper)</li> <li>default to using speculative decoding, especially if batches are in the few tens of sequences</li></ul> <p>For more tips on how to serve specific types of LLM inference at high performance,
see <!>.
For a gentler introduction to LLM serving,
see <!>.</p> <!> <!> <p>We start by creating a Modal Image based on the Docker image
provided by the SGLang team.
This contains our Python and system dependencies.
Add more by chaining <code>.apt_install</code> and <code>.uv_pip_install</code> or <code>.pip_install</code> method calls, as we do below with <code>.entrypoint</code>.
See the <!> for details.</p> <!> <!> <p>Large model weights take a long time to move around.
Model weight servers like Hugging Face will send weights
at a few hundred megabytes per second. For large models,
with weight sizes in the hundreds of gigabytes,
that means thousands of seconds (tens of minutes)
of model loading time.</p> <p>After loading them we can cache these weights in a Modal <!> so that they are loaded about 10x faster —
about one to three gigabytes per second.</p> <!> <p>That still means minutes of startup time.
Both of these latencies kill productivity when you’re iterating
on aspects besides model behavior, like server configuration.</p> <p>For this reason, we recommend skipping model loading while you’re developing
a server or configuration — even when benchmarking, if you can!
You can still exercise the same code paths if you use the <code>dummy</code> model
loading format. In this sample code, we add an <code>APP_USE_DUMMY_WEIGHTS</code> environment variable
to control this behavior from the command line during iteration.</p> <!> <p>We download the model weights from Hugging Face by
running a Python function as part of the Modal Image build.
Note that command-line logging will be somewhat limited.</p> <!> <p>To run the function, we need to pick a specific model to download.
We’ll use Z.ai’s GLM 4.7 in eight bit <!>.</p> <p>This model takes about thirty minutes to an hour to download from Hugging Face.</p> <!> <!> <p>Running large models efficiently requires specialized inference engines like SGLang.
These engines are generally highly configurable.</p> <p>For SGLang, there are three main sources of configuration values:</p> <ul><li><em>Environment variables</em> for the process running <code>sglang</code>.</li> <li><em>Command-line arguments</em> for the command to launch the <code>sglang</code> process.</li> <li><em>Configuration files</em> loaded by the <code>sglang</code> process.</li></ul> <p>For deployments, we prefer to put information in configuration files where possible.
CLI arguments and configuration files can typically be interchanged.
CLI arguments are convenient when iterating, but configuration files are easier to share.
We use environment variables only as a last resort, typically to activate new or experimental features.</p> <p><strong>Environment variables</strong></p> <p>SGLang environment variables are prefixed with <code>SGL_</code> or <code>SGLANG_</code>.
The <code>SGL_</code> prefix is deprecated.</p> <p>The snippet below adds any such environment variables
present during deployment to the Modal Image.</p> <!> <p><strong>YAML</strong></p> <p>Configuration files can be passed in YAML format.</p> <p>We include a default config in-line in the code here for ease of use.
It’s designed to run GLM 4.7 FP8 at low to moderate concurrency.
In particular, it uses that model’s built-in multi-token prediction speculative decoding to improve <!>.</p> <!> <p>You’ll want to provide your own configuration file for other settings,
in particular if you change the model.</p> <p>We add an environment variable, <code>APP_LOCAL_CONFIG_PATH</code>,
to change the loaded configuration.</p> <!> <p><strong>Command-line arguments</strong></p> <p>We launch our server by kicking off a subprocess.
The convenience function below encapsulates the command
and its arguments.</p> <p>We pass a few key bits of configuration that are consumed
by other code here, rather than in a configuration file,
so that values stay in sync.</p> <p>That includes:</p> <ul><li>Model information, which is also used during weight cacheing</li> <li>GPU count, which is also used below when defining our Modal deployment</li> <li>the port to serve on, which is also used to connect up Modal networking</li></ul> <p>We also pass the <code>HF_HUB_OFFLINE</code> environment variable here,
so that our server will crash when trying to load the real model
if those weights are not in cache.
For smaller models, we can instead load weights dynamically on
server start (and cache them so later starts are faster).
But for large models, weight loading extends the first start latency
so much that downstream timeouts are triggered —
or need to be extended so much that they are no longer tight enough
on the happy path.</p> <!> <p>Lastly, we import the <code>sglang</code> library as part of loading the Image on Modal.
This is a minor optimization, but it can shave a few seconds off cold start latencies
by providing better prefetching hints, and every second counts!</p> <!> <!> <p>Now, we wrap our configured SGLang server for our large model
in the infrastructure required to run and interact with it.
Infrastrucure in Modal is generally attached to an App.
Here, we’ll attach our Modal Image as the default for
Modal Functions that run in the App.</p> <!> <p>Most importantly, we need to decide what hardware to run on. <!> have over 100 GB of <!> —
141 GB and 180 GB, respectively.
The model’s weights will be stored in this memory,
and they consume several hundred gigabytes of space,
so we will generally want several of these accelerators.
We also need space for the model’s KV cache of activations
on input sequences.</p> <p>In eight-bit precision, GLM 4.7 consumes ~350 GB of space,
so we use four H200s for 564 GB of RAM.</p> <!> <p>We’ll use a Modal Server to serve our model.
This reduces client latencies and provides for regionalized deployment.
You can read more about it in <!>.
To configure it, we need to pass in region information for the GPU workers
and for the load-balancing proxy.</p> <!> <p>Lastly, we need to configure autoscaling parameters.
By default, Modal is fully serverless, and applications
scale to zero when there is no load.
But booting up inference engines for large models takes minutes,
which is generally longer than clients can tolerate waiting.</p> <p>So a production deployment of large models that has clients with
per-request SLAs in the few or tens of seconds
generally needs to keep one replica up at all times.
In Modal, we achieve this with the <code>min_containers</code> parameter
of <code>App.cls</code> or <code>App.function</code>.</p> <p>This can trigger substantial costs, so we leave the value at <code>0</code> in this sample code.</p> <!> <p>Deployments of large models with a single node per replica can generally handle a few tens of requests
without queueing. When a particular replica has more requests than it can handle, we want to scale it up.
This behavior is configured by setting <code>target_concurrency</code> parameter to <code>target_inputs</code>.</p> <!> <!> <p>Now we’re ready to put all of our infrastructure configuration
together into a Modal Server.</p> <p>The Modal Server allows us to control <!>.
In particular, it lets us define work that a replica should do before
and after it handles requests in methods decorated with <code>modal.enter</code> and <code>modal.exit</code>, respectively.</p> <!> <p>We called a <code>wait_for_server_ready</code> function in our <code>modal.enter</code> method.
That’s defined below. It pings the <code>/health</code> endpoint until the server responds.</p> <!> <!> <p>You can deploy a fresh replica and test it
using the command</p> <!> <p>which will create an ephemeral Modal App
and execute the <code>local_entrypoint</code> code below.</p> <p>Because the weights are randomized, the outputs are also random.
Remove the <code>APP_USE_DUMMY_WEIGHTS</code> flag to test the trained model.</p> <!> <p>The unique client logic for Modal deployments is in the <code>probe</code> function below.
Specifically, when a Modal Server is spinning up,
i.e. before the <code>modal.enter</code> finishes for at least one replica,
clients will see a <code>503 Service Unavailable</code> status
and so should retry.</p> <!> <!> <p>When you’re ready, you can create a persistent deployment with</p> <!> <p>And hit it with any OpenAI API-compatible client!</p> <!> <p>The <code>probe</code> function above uses this helper function
to stream response tokens as they become available.</p> <!>`,1);function v(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ne(),f=te(a);u(f,{id:`serve-very-large-language-models-deepseek-v3-kimi-k2-glm-475`,children:(e,t)=>{s(),i(e,r(`Serve very large language models (DeepSeek V3, Kimi-K2, GLM 4.7/5)`))},$$slots:{default:!0}});var m=o(f,8),h=o(e(m));p(h,{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),p(o(h,2),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(m);var g=o(m,2);d(g,{code:`import%20asyncio%0Aimport%20json%0Aimport%20os%0Aimport%20subprocess%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0Ahere%20%3D%20Path(__file__).parent%0A`,lang:`python`});var _=o(g,2);c(_,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var v=o(_,2);p(o(e(v),9),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Image guide`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);d(y,{code:`image%20%3D%20modal.Image.from_registry(%22lmsysorg%2Fsglang%3Av0.5.7%22).entrypoint(%0A%20%20%20%20%5B%5D%20%20%23%20silence%20chatty%20logs%20on%20entry%0A)%0A`,lang:`python`});var b=o(y,2);l(b,{id:`load-model-weights`,children:(e,t)=>{s(),i(e,r(`Load model weights`))},$$slots:{default:!0}});var x=o(b,4);p(o(e(x)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);d(S,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var C=o(S,6);d(C,{code:`USE_DUMMY_WEIGHTS%20%3D%20os.environ.get(%22APP_USE_DUMMY_WEIGHTS%22%2C%20%220%22).lower()%20in%20(%0A%20%20%20%20%221%22%2C%0A%20%20%20%20%22true%22%2C%0A)%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%20%20%20%20%22APP_USE_DUMMY_WEIGHTS%22%3A%20str(int(USE_DUMMY_WEIGHTS))%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var w=o(C,4);d(w,{code:`def%20download_model(repo_id%2C%20revision%3DNone)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(repo_id%3Drepo_id%2C%20revision%3Drevision)%0A%0A`,lang:`python`});var T=o(w,2);p(o(e(T)),{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`floating point quantization`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,4);d(E,{code:`REPO_ID%20%3D%20%22zai-org%2FGLM-4.7-FP8%22%0A%0Aif%20not%20USE_DUMMY_WEIGHTS%3A%20%20%23%20skip%20download%20if%20we%20don't%20need%20real%20weights%0A%20%20%20%20image%20%3D%20image.run_function(%0A%20%20%20%20%20%20%20%20download_model%2C%0A%20%20%20%20%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20%20%20%20%20args%3D(REPO_ID%2C)%2C%0A%20%20%20%20)%0A`,lang:`python`});var D=o(E,2);l(D,{id:`configure-the-inference-engine`,children:(e,t)=>{s(),i(e,r(`Configure the inference engine`))},$$slots:{default:!0}});var O=o(D,16);d(O,{code:`def%20is_sglang_env_var(key)%3A%0A%20%20%20%20return%20key.startswith(%22SGL_%22)%20or%20key.startswith(%22SGLANG_%22)%0A%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7Bkey%3A%20value%20for%20key%2C%20value%20in%20os.environ.items()%20if%20is_sglang_env_var(key)%7D%0A)%0A`,lang:`python`});var k=o(O,6);p(o(e(k)),{href:`https://modal.com/llm-almanac/how-to-benchmark`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`time per output token`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2);d(A,{code:`default_config%20%3D%20%22%22%22%5C%0A%20%23%20General%20Config%0A%20host%3A%200.0.0.0%0A%20log-level%3A%20debug%20%20%23%20very%20noisy%0A%0A%20%23%20Model%20Config%0A%20tool-call-parser%3A%20glm47%0A%20reasoning-parser%3A%20glm45%0A%20trust-remote-code%3A%20true%0A%0A%20%23%20Memory%0A%20mem-fraction-static%3A%200.85%0A%20chunked-prefill-size%3A%2032768%0A%20kv-cache-dtype%3A%20fp8_e4m3%0A%0A%20%23%20Observability%0A%20enable-metrics%3A%20true%0A%20collect-tokens-histogram%3A%20true%0A%0A%20%23%20Batching%0A%20max-running-requests%3A%2032%0A%20cuda-graph-max-bs%3A%2032%0A%0A%20%23%20SpecDec%20(speed%20up%20low%2Fmoderate%20concurrency)%0A%20speculative-algorithm%3A%20EAGLE%20%20%23%20built%20into%20GLM%204.7%2C%20is%20just%20multi-token%20prediction%0A%22%22%22%0A`,lang:`python`});var j=o(A,6);d(j,{code:`local_config_path%20%3D%20os.environ.get(%22APP_LOCAL_CONFIG_PATH%22)%0A%0Aif%20modal.is_local()%3A%0A%20%20%20%20if%20local_config_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20local_config_path%20%3D%20here%20%2F%20%22config_very_large_models.yaml%22%0A%0A%20%20%20%20%20%20%20%20if%20not%20local_config_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20local_config_path.write_text(default_config)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Using%20default%20config%20from%20%7Blocal_config_path.relative_to(here)%7D%3A%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20default_config%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20image%20%3D%20image.add_local_file(local_config_path%2C%20%22%2Froot%2Fconfig.yaml%22)%0A`,lang:`python`});var M=o(j,14);d(M,{code:`def%20_start_server()%20-%3E%20subprocess.Popen%3A%0A%20%20%20%20%22%22%22Start%20SGLang%20server%20in%20a%20subprocess%22%22%22%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20f%22HF_HUB_OFFLINE%3D%7B0%20if%20USE_DUMMY_WEIGHTS%20else%201%7D%22%2C%0A%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22sglang.launch_server%22%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(SGLANG_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--model-path%22%2C%0A%20%20%20%20%20%20%20%20REPO_ID%2C%0A%20%20%20%20%20%20%20%20%22--tp-size%22%2C%0A%20%20%20%20%20%20%20%20str(GPU_COUNT)%2C%0A%20%20%20%20%20%20%20%20%22--config%22%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2Fconfig.yaml%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20if%20USE_DUMMY_WEIGHTS%3A%0A%20%20%20%20%20%20%20%20cmd.extend(%5B%22--load-format%22%2C%20%22dummy%22%5D)%0A%0A%20%20%20%20print(%22Starting%20SGLang%20server%20with%20command%3A%22)%0A%20%20%20%20print(*cmd)%0A%0A%20%20%20%20return%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue%2C%20start_new_session%3DTrue)%0A%0A`,lang:`python`});var N=o(M,4);d(N,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20sglang%20%20%23%20noqa%0A`,lang:`python`});var P=o(N,2);c(P,{id:`configure-infrastructure`,children:(e,t)=>{s(),i(e,r(`Configure infrastructure`))},$$slots:{default:!0}});var F=o(P,4);d(F,{code:`app%20%3D%20modal.App(%22example-serve-very-large-models%22%2C%20image%3Dimage)%0A`,lang:`python`});var I=o(F,2),L=o(e(I));p(L,{href:`https://modal.com/blog/introducing-b200-h200`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H200 and B200 GPUs`))},$$slots:{default:!0}}),p(o(L,2),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(),n(I);var R=o(I,4);d(R,{code:`GPU_TYPE%20%3D%20%22H200%22%0AGPU_COUNT%20%3D%204%0A`,lang:`python`});var z=o(R,2);p(o(e(z)),{href:`https://modal.com/docs/examples/sglang_low_latency`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,2);d(B,{code:`REGION%20%3D%20%22us%22%0AROUTING_REGION%20%3D%20%22us-east%22%0A`,lang:`python`});var V=o(B,8);d(V,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20Set%20to%201%20for%20production%20to%20keep%20a%20warm%20replica%0A`,lang:`python`});var H=o(V,4);d(H,{code:`TARGET_INPUTS%20%3D%2010%20%20%23%20Concurrent%20requests%20per%20replica%20before%20scaling%0A`,lang:`python`});var U=o(H,2);l(U,{id:`define-the-server`,children:(e,t)=>{s(),i(e,r(`Define the server`))},$$slots:{default:!0}});var W=o(U,4);p(o(e(W)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`container lifecycle`))},$$slots:{default:!0}}),s(5),n(W);var G=o(W,2);d(G,{code:`SGLANG_PORT%20%3D%208000%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3Df%22%7BGPU_TYPE%7D%3A%7BGPU_COUNT%7D%22%2C%0A%20%20%20%20scaledown_window%3D20%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20startup_timeout%3D30%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20port%3DSGLANG_PORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20exit_grace_period%3D25%2C%20%20%23%20time%20to%20finish%20requests%20on%20shutdown%20(seconds)%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Start%20SGLang%20server%20process%20and%20wait%20for%20it%20to%20be%20ready%22%22%22%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20_start_server()%0A%20%20%20%20%20%20%20%20wait_for_server_ready()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Terminate%20the%20SGLang%20server%20process%22%22%22%0A%20%20%20%20%20%20%20%20self.proc.terminate()%0A%20%20%20%20%20%20%20%20self.proc.wait()%0A%0A`,lang:`python`});var K=o(G,4);d(K,{code:`def%20wait_for_server_ready()%3A%0A%20%20%20%20%22%22%22Wait%20for%20SGLang%20server%20to%20be%20ready%22%22%22%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20url%20%3D%20f%22http%3A%2F%2Flocalhost%3A%7BSGLANG_PORT%7D%2Fhealth%22%0A%20%20%20%20print(f%22Waiting%20for%20server%20to%20be%20ready%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20resp%20%3D%20requests.get(url%2C%20timeout%3D5)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status_code%20%3D%3D%20200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Server%20is%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20requests.exceptions.RequestException%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%0A`,lang:`python`});var q=o(K,2);c(q,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var J=o(q,4);d(J,{code:`APP_USE_DUMMY_WEIGHTS%3D1%20modal%20run%20very_large_models.py`,lang:`bash`});var Y=o(J,6);d(Y,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D20%20*%20MINUTES%2C%20content%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20%22%22%22Test%20the%20model%20serving%20endpoint%22%22%22%0A%20%20%20%20url%20%3D%20await%20Server.get_url.aio()%0A%0A%20%20%20%20if%20USE_DUMMY_WEIGHTS%3A%0A%20%20%20%20%20%20%20%20system_prompt%20%3D%20%7B%22role%22%3A%20%22system%22%2C%20%22content%22%3A%20%22This%20system%20produces%20gibberish.%22%7D%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20system_prompt%20%3D%20%7B%22role%22%3A%20%22system%22%2C%20%22content%22%3A%20%22You%20are%20a%20helpful%20AI%20assistant.%22%7D%0A%0A%20%20%20%20if%20content%20is%20None%3A%0A%20%20%20%20%20%20%20%20content%20%3D%20%22Explain%20the%20transformer%20architecture%20in%20one%20paragraph.%22%0A%0A%20%20%20%20messages%20%3D%20%5Bsystem_prompt%2C%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%5D%0A%0A%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B1%5D%5B%22content%22%5D%20%3D%20%22What%20is%20the%20capital%20of%20France%3F%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20second%20request%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3D1%20*%20MINUTES)%0A%0A`,lang:`python`});var X=o(Y,4);d(X,{code:`async%20def%20probe(url%2C%20messages%2C%20timeout%3D20%20*%20MINUTES)%3A%0A%20%20%20%20%22%22%22Send%20request%20with%20retry%20logic%20for%20startup%20delays%22%22%22%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%20%20%23%20Service%20Unavailable%20during%20startup%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A`,lang:`python`});var Z=o(X,2);c(Z,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var Q=o(Z,4);d(Q,{code:`APP_USE_DUMMY_WEIGHTS%3D0%20modal%20deploy%20very_large_models.py`,lang:`bash`});var $=o(Q,4);c($,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}}),d(o($,4),{code:`async%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%3A%0A%20%20%20%20%22%22%22Stream%20response%20from%20chat%20completions%20endpoint%22%22%22%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20messages%2C%0A%20%20%20%20%20%20%20%20%22stream%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%201024%20if%20USE_DUMMY_WEIGHTS%20else%20None%2C%0A%20%20%20%20%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%20or%20delta.get(%22reasoning_content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20end%3D%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk%20or%20len(chunk)%20%3E%20100%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=CYdN7zIn.js.map
