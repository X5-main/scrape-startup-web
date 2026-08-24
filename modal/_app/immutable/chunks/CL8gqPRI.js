(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5d69ba6e-7b62-4c0c-9931-7bec558189c7`,e._sentryDebugIdIdentifier=`sentry-dbid-5d69ba6e-7b62-4c0c-9931-7bec558189c7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Serve an interactive language model app with low-latency TensorRT-LLM (LLaMA 3 8B)`,id:`serve-an-interactive-language-model-app-with-low-latency-tensorrt-llm-llama-3-8b`,children:[{depth:2,value:`Overview`,id:`overview`,children:[{depth:3,value:`What is a TRT-LLM engine?`,id:`what-is-a-trt-llm-engine`}]},{depth:2,value:`Set up the container image`,id:`set-up-the-container-image`},{depth:2,value:`Cache model weights in a Modal Volume`,id:`cache-model-weights-in-a-modal-volume`},{depth:2,value:`Configure for low latency`,id:`configure-for-low-latency`,children:[{depth:3,value:`Quantization`,id:`quantization`},{depth:3,value:`Configure plugins`,id:`configure-plugins`},{depth:3,value:`A note on speculative decoding`,id:`a-note-on-speculative-decoding`},{depth:3,value:`Set the build config`,id:`set-the-build-config`}]},{depth:2,value:`Define the inference server and infrastructure`,id:`define-the-inference-server-and-infrastructure`,children:[{depth:3,value:`Selecting infrastructure to minimize latency`,id:`selecting-infrastructure-to-minimize-latency`},{depth:3,value:`Health check and warmup helpers`,id:`health-check-and-warmup-helpers`},{depth:3,value:`Build the TRT-LLM engine and start the server`,id:`build-the-trt-llm-engine-and-start-the-server`}]},{depth:2,value:`Deploy the server`,id:`deploy-the-server`},{depth:2,value:`Interact with the server`,id:`interact-with-the-server`},{depth:2,value:`Test the server`,id:`test-the-server`}]}],rawContent:`# Serve an interactive language model app with low-latency TensorRT-LLM (LLaMA 3 8B)

In this example, we demonstrate how to configure the TensorRT-LLM framework to serve
Meta's LLaMA 3 8B model at interactive latencies on Modal.

Many popular language model applications, like chatbots and code editing,
put humans and models in direct interaction. According to an
[oft-cited](https://lawsofux.com/doherty-threshold/)
if [scientifically dubious](https://www.flashover.blog/posts/dohertys-threshold-is-a-lie)
rule of thumb, computer systems need to keep their response times under 400ms
in order to match pace with their human users.

To hit this target, we use the [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM)
inference framework from NVIDIA. TensorRT-LLM is the Lamborghini of inference engines:
it achieves seriously impressive latency, but only if you tune it carefully.
We pair it with [Modal Servers](https://modal.com/docs/guide/servers) which routes requests
through a [new, low-latency proxy service](https://modal.com/blog/serverless-servers)
designed for latency-sensitive inference workloads,
minimizing the overhead between client and GPU.
These latencies were measured on a single NVIDIA H100 GPU
running LLaMA 3 8B on prompts and generations of a few dozen to a few hundred tokens.

Here's what that looks like in a terminal chat interface:

<video controls autoplay loop muted>
<source src="https://modal-cdn.com/example-trtllm-latency.mp4" type="video/mp4">
</video>

## Overview

This guide documents how to use recommendations from the
[TensorRT-LLM performance guide](https://github.com/NVIDIA/TensorRT-LLM/blob/b763051ba429d60263949da95c701efe8acf7b9c/docs/source/performance/performance-tuning-guide/useful-build-time-flags.md)
to optimize a [TensorRT-LLM engine](https://nvidia.github.io/TensorRT-LLM/llm-api) for low latency,
then serve it behind an OpenAI-compatible HTTP API with \`trtllm-serve\`.

Be sure to check out TensorRT-LLM's
[examples](https://nvidia.github.io/TensorRT-LLM/llm-api-examples)
for sample code beyond what we cover here, like low-rank adapters (LoRAs).

### What is a TRT-LLM engine?

The first step in running TensorRT-LLM is to build an "engine" from a model.
Engines have a large number of parameters that must be tuned on a per-workload basis,
so we carefully document the choices we made here and point you to additional resources
that can help you optimize for your specific workload.

Historically, this process was done with a clunky command-line-interface (CLI),
but things have changed for the better!
There is now a new-and-improved Python SDK for TensorRT-LLM, supporting
all the same features as the CLI -- quantization, speculative decoding, in-flight batching,
and much more.

## Set up the container image

To run code on Modal, we define [container images](https://modal.com/docs/guide/images).
All Modal containers have access to GPU drivers via the underlying host environment,
but we still need to install the software stack on top of the drivers, from the CUDA runtime up.

We start from an official \`nvidia/cuda\` container image,
which includes the CUDA runtime & development libraries
and the environment configuration necessary to run them.
On top of that, we add some system dependencies of TensorRT-LLM,
including OpenMPI for distributed communication, some core software like \`git\`,
and the \`tensorrt_llm\` package itself.

While we're at it, we import the dependencies we'll need both remotely and locally (for deployment).

\`\`\`python
import asyncio
import json
import subprocess
import time
from pathlib import Path

import aiohttp
import modal

MINUTES = 60  # seconds

tensorrt_image = modal.Image.from_registry(
    "nvidia/cuda:12.8.1-devel-ubuntu22.04",
    add_python="3.12",  # TRT-LLM requires Python 3.12
).entrypoint([])  # silence noisy NVIDIA license logging

tensorrt_image = tensorrt_image.apt_install(
    "openmpi-bin", "libopenmpi-dev", "git", "git-lfs", "wget"
).uv_pip_install(
    "tensorrt-llm==0.20.0",  # 0.20+ adds trtllm-serve --extra_llm_api_options
    "pynvml>=12",  # required by tensorrt-llm 0.20
    "flashinfer-python==0.2.5",
    "cuda-python==12.9.1",
    "onnx==1.19.1",
    "mpmath==1.3.0",
    "torch==2.7.0",
    pre=True,
    extra_index_url="https://pypi.nvidia.com",
)

\`\`\`

Note that we're doing this by [method-chaining](https://quanticdev.com/articles/method-chaining/)
a number of calls to methods on the \`modal.Image\`. If you're familiar with
Dockerfiles, you can think of this as a Pythonic interface to instructions like \`RUN\` and \`CMD\`.

End-to-end, this step takes about five minutes on first run.

## Cache model weights in a Modal Volume

We serve [Meta's LLaMA 3 8B](https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct),
downloading it to persistent storage and loading it quickly --
this is a latency-optimized example after all! For persistent, distributed storage, we use
[Modal Volumes](https://modal.com/docs/guide/volumes), which can be accessed from any container
with read speeds in excess of a gigabyte per second.

We also set the \`HF_HOME\` environment variable to point to the Volume so that the model
is cached there, and turn on
[high-performance downloads](https://huggingface.co/docs/hub/en/models-downloading#faster-downloads)
to get maximum throughput from the Hugging Face Hub.

\`\`\`python
MODEL_ID = "NousResearch/Meta-Llama-3-8B-Instruct"  # fork without repo gating
MODEL_REVISION = "53346005fb0ef11d3b6a83b12c895cca40156b6c"  # pin to avoid surprises!

volume = modal.Volume.from_name(
    "example-trtllm-inference-volume", create_if_missing=True
)
VOLUME_PATH = Path("/vol")
MODELS_PATH = VOLUME_PATH / "models"

tensorrt_image = tensorrt_image.uv_pip_install(
    "huggingface_hub==0.36.0",
).env(
    {
        "HF_XET_HIGH_PERFORMANCE": "1",
        "HF_HOME": str(MODELS_PATH),
        "TORCH_CUDA_ARCH_LIST": "9.0 9.0a",  # H100, silence noisy logs
    }
)

\`\`\`

## Configure for low latency

### Quantization

The amount of [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
on a single card is a tight constraint for large models:
RAM is measured in billions of bytes and large models have billions of parameters,
each of which is two to four bytes.
The performance cliff if you need to spill to CPU memory is steep,
so all of those parameters must fit in the GPU memory,
along with other things like the KV cache built up while processing prompts.

The simplest way to reduce LLM inference's RAM requirements is to make the model's parameters smaller,
fitting their values in a smaller number of bits, like four or eight. This is known as
[_quantization_](https://modal.com/llm-almanac/quant-formats).

NVIDIA's [Ada Lovelace/Hopper chips](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
like the L40S and H100, are capable of native 8bit floating point calculations
in their [Tensor Cores](https://modal.com/gpu-glossary/device-hardware/tensor-core),
so we choose that as our quantization format.
These GPUs are capable of twice as many floating point operations per second in 8bit as in 16bit --
about two quadrillion per second on an H100 SXM.

Quantization buys us two things:

- faster startup, since less data has to be moved over the network onto CPU and GPU RAM

- faster inference, since we get twice the FLOP/s and less data has to be moved from GPU RAM into
[on-chip memory](https://modal.com/gpu-glossary/device-hardware/l1-data-cache) and
[registers](https://modal.com/gpu-glossary/device-hardware/register-file)
with each computation

We'll use TensorRT-LLM's \`QuantConfig\` to specify that we want \`FP8\` quantization.
[See their code](https://github.com/NVIDIA/TensorRT-LLM/blob/88e1c90fd0484de061ecfbacfc78a4a8900a4ace/tensorrt_llm/models/modeling_utils.py#L184)
for more options.

Quantization is a lossy compression technique. The impact on model quality can be
minimized by tuning the quantization parameters on even a small dataset. Typically, we
see less than 2% degradation in evaluation metrics when using \`fp8\`. We use the
\`CalibConfig\` class to specify the calibration dataset.

### Configure plugins

TensorRT-LLM is an LLM inference framework built on top of NVIDIA's TensorRT,
which is a generic inference framework for neural networks.

TensorRT includes a "plugin" extension system that allows you to adjust behavior,
like configuring the [CUDA kernels](https://modal.com/gpu-glossary/device-software/kernel)
used by the engine.
The [General Matrix Multiply (GEMM)](https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html)
plugin, for instance, adds heavily-optimized matrix multiplication kernels
from NVIDIA's [cuBLAS library of linear algebra routines](https://docs.nvidia.com/cuda/cublas/).

We specify a number of plugins for our engine implementation.
The first is
[multiple profiles](https://github.com/NVIDIA/TensorRT-LLM/blob/b763051ba429d60263949da95c701efe8acf7b9c/docs/source/performance/performance-tuning-guide/useful-build-time-flags.md#multiple-profiles),
which configures TensorRT to prepare multiple kernels for each high-level operation,
where different kernels are optimized for different input sizes.
The second is \`paged_kv_cache\` which enables a
[paged attention algorithm](https://arxiv.org/abs/2309.06180)
for the key-value (KV) cache.

The last two parameters are GEMM plugins optimized specifically for low latency,
rather than the more typical high arithmetic throughput,
the \`low_latency\` plugins for \`gemm\` and \`gemm_swiglu\`.

The \`low_latency_gemm_swiglu_plugin\` plugin fuses the two matmul operations
and non-linearity of the feedforward component of the Transformer block into a single kernel,
reducing round trips between GPU
[cache memory](https://modal.com/gpu-glossary/device-hardware/l1-data-cache)
and RAM. For details on kernel fusion, see
[this blog post by Horace He of Thinking Machines](https://horace.io/brrr_intro.html).
Note that at the time of writing, this only works for \`FP8\` on Hopper GPUs.

The \`low_latency_gemm_plugin\` is a variant of the GEMM plugin that brings in latency-optimized
kernels from NVIDIA's [CUTLASS library](https://github.com/NVIDIA/cutlass).

### A note on speculative decoding

Speculative decoding is a technique for generating multiple tokens per step,
avoiding the auto-regressive bottleneck in the Transformer architecture and
exposing more parallelism to the GPU. It works best for text with predictable
patterns, like code, but it's worth testing for any latency-critical workload.
We no longer configure it by hand here -- it's handled within the serving stack --
but it remains one of the most effective levers for cutting per-token latency.

### Set the build config

Finally, we specify the overall build configuration for the engine. This includes
the maximum input length, the maximum number of tokens
to process at once before queueing occurs, and the maximum number of sequences
to process at once before queueing occurs.

To minimize latency, we set the maximum number of sequences (the "batch size")
to just one and pair that with low per-container concurrency below,
trading throughput for the lowest possible per-request latency.

\`\`\`python
N_GPUS = 1  # bumping this to 2 will improve latencies further but not 2x
GPU = f"H100:{N_GPUS}"
MAX_BATCH_SIZE = 1  # minimize latency by processing one request at a time

\`\`\`

## Define the inference server and infrastructure

### Selecting infrastructure to minimize latency

Minimizing latency requires geographic co-location of clients and servers.

So for low latency LLM inference services on Modal, you must select a
[cloud region](https://modal.com/docs/guide/region-selection)
for both the GPU-accelerated containers running inference
and for the [internal Modal proxy system](https://modal.com/blog/serverless-servers)
that forwards requests to them as part of defining a Server.

Here, we assume users are mostly in the northern half of the Americas
and select the \`us\` cloud region with a nearby \`us-west\` proxy to serve them.
This should result in at most a few dozen milliseconds of round-trip time.

\`\`\`python
REGION = "us"
PORT = 8000
PROXY_REGION = "us-west"

\`\`\`

Latencies for multi-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram),
so they aren't shared across replicas.
To improve cache hit rate, Modal Servers
includes sticky routing based on a client-provided header.
See [this code sample](https://modal.com/docs/examples/server_sticky)
for details.

For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a "warm" or "live" replica reduces latency by skipping slow initialization work
that occurs when a new replica boots up (a ["cold start"](https://modal.com/docs/guide/cold-start)).
For LLM inference servers, that latency runs from seconds to minutes.

To ensure at least one container is always available,
we can set the \`min_containers\` of our Modal Function to \`1\` or more.
However, since this is documentation code, we'll set it to \`0\`
to avoid surprise bills during casual use.

\`\`\`python
MIN_CONTAINERS = 0  # set to 1 to ensure one replica is always ready

\`\`\`

Finally, we set a target for the number of inputs to run on a single container
with [\`modal.concurrent\`](https://modal.com/docs/reference/modal.concurrent).
For details, see [the guide](https://modal.com/docs/guide/concurrent-inputs).
We keep concurrency low for minimum per-request latency.

\`\`\`python
TARGET_INPUTS = 1  # low concurrency for minimum per-request latency

\`\`\`

### Health check and warmup helpers

Modal considers a new replica ready to receive inputs once the \`modal.enter\` methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we poll the server's \`/health\` endpoint until it's ready,
then send a few warm-up requests so the first real request isn't slow.

We use the [\`requests\` library](https://requests.readthedocs.io/en/latest/)
to send ourselves these HTTP requests on
[\`localhost\`/\`127.0.0.1\`](https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1).

\`\`\`python
with tensorrt_image.imports():
    import requests


def wait_ready(process: subprocess.Popen, timeout: int = 20 * MINUTES):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            check_running(process)
            requests.get(f"http://127.0.0.1:{PORT}/health").raise_for_status()
            return
        except (
            requests.exceptions.ConnectionError,
            requests.exceptions.HTTPError,
        ):
            time.sleep(5)
    raise TimeoutError(f"TensorRT-LLM server not ready within {timeout} seconds")


def check_running(p: subprocess.Popen):
    if (rc := p.poll()) is not None:
        raise subprocess.CalledProcessError(rc, cmd=p.args)


def warmup():
    payload = {
        "model": MODEL_ID,
        "messages": [{"role": "user", "content": "Hello, how are you?"}],
        "max_tokens": 16,
    }
    for _ in range(3):
        requests.post(
            f"http://127.0.0.1:{PORT}/v1/chat/completions",
            json=payload,
            timeout=60,
        ).raise_for_status()


\`\`\`

### Build the TRT-LLM engine and start the server

We use [\`modal.enter/exit\`](https://modal.com/docs/guide/lifecycle-functions) to manage
the server lifecycle. On the first container start, we build an optimized engine
using the TensorRT-LLM [Python API](https://nvidia.github.io/TensorRT-LLM/llm-api)
with FP8 quantization and low-latency plugins, then cache it in the Volume.
Subsequent starts load the cached engine in seconds and launch \`trtllm-serve\`
to expose an OpenAI-compatible HTTP API.

The key decorators are [\`@app.server\`](https://modal.com/docs/guide/servers),
[\`@modal.enter\`, and \`@modal.exit\`](https://modal.com/docs/guide/lifecycle-functions)
The code in the \`enter\` decorator needs to start a server process that listens on a port.

The \`@app.server\` decorator does a lot! We:

1. Attach our Image
2. Request a GPU
3. Attach our cache Volume
4. Specify the regions for the routing proxy and compute
5. Configure auto-scaling, concurrency, and timeouts
6. Configure authentication via [Proxy Tokens](https://modal.com/docs/guide/webhook-proxy-auth) (disabled here for demo purposes)

\`\`\`python
app = modal.App("example-trtllm-low-latency")


@app.server(
    image=tensorrt_image,
    gpu=GPU,
    volumes={VOLUME_PATH: volume},
    compute_region=REGION,
    routing_region=PROXY_REGION,  # location of proxies, should be close to Cls region
    min_containers=MIN_CONTAINERS,
    target_concurrency=TARGET_INPUTS,
    startup_timeout=20 * MINUTES,
    port=PORT,  # wrapped code must listen on this port
    exit_grace_period=15,  # seconds, time to finish up requests when closing down
    unauthenticated=True,  # no auth for this demo, see Servers guide/docs for auth details
)
class TRT:
    @modal.enter()
    def startup(self):
        """Download model, build/load the optimized engine, and start trtllm-serve."""
        from huggingface_hub import snapshot_download
        from tensorrt_llm import LLM, BuildConfig
        from tensorrt_llm.llmapi import CalibConfig, QuantConfig
        from tensorrt_llm.plugin.plugin import PluginConfig

        model_path = str(MODELS_PATH / MODEL_ID)
        engine_path = str(MODELS_PATH / MODEL_ID / "trtllm_engine" / "serve-0.20")

        snapshot_download(
            MODEL_ID,
            local_dir=model_path,
            ignore_patterns=["*.pt", "*.bin"],  # using safetensors
            revision=MODEL_REVISION,
        )

        if not Path(engine_path).exists():
            print(f"building new engine at {engine_path}")
            llm = LLM(
                model=model_path,
                quant_config=QuantConfig(quant_algo="FP8"),
                calib_config=CalibConfig(
                    calib_batches=512,
                    calib_batch_size=1,
                    calib_max_seq_length=2048,
                    tokenizer_max_seq_length=4096,
                ),
                build_config=BuildConfig(
                    plugin_config=PluginConfig.from_dict(
                        {
                            "multiple_profiles": True,
                            "paged_kv_cache": True,
                            "low_latency_gemm_swiglu_plugin": "fp8",
                            "low_latency_gemm_plugin": "fp8",
                        }
                    ),
                    max_input_len=8192,
                    max_num_tokens=16384,
                    max_batch_size=MAX_BATCH_SIZE,
                ),
                tensor_parallel_size=N_GPUS,
            )
            llm.save(engine_path)
            llm.shutdown()
            del llm
            volume.commit()
        else:
            print(f"loading cached engine from {engine_path}")

        # When serving a prebuilt TensorRT engine, \`trtllm-serve\` needs to be
        # pointed at the original Hugging Face checkpoint for the tokenizer and
        # its chat template, otherwise \`/v1/chat/completions\` returns a 400.

        cmd = [
            "trtllm-serve",
            engine_path,
            "--tokenizer",
            model_path,
            "--host",
            "0.0.0.0",
            "--port",
            str(PORT),
        ]

        self.process = subprocess.Popen(cmd)
        wait_ready(self.process)
        warmup()

    @modal.exit()
    def stop(self):
        self.process.terminate()


\`\`\`

## Deploy the server

To deploy the server on Modal, just run

\`\`\`bash
modal deploy trtllm_latency.py
\`\`\`

This will create a new App on Modal and build the container image for it if it hasn't been built yet.

## Interact with the server

Once it is deployed, you'll see a URL appear in the command line,
something like \`https://your-workspace-name--example-trtllm-low-latency-trt.us-west.modal.direct\`.

You can find [interactive Swagger UI docs](https://swagger.io/tools/swagger-ui/)
at the \`/docs\` route of that URL.
These docs describe each route and indicate the expected input and output
and translate requests into \`curl\` commands.
For simple routes, you can even send a request directly from the docs page.

Note: when no replicas are available, Modal will respond with
the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503).
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the application and its containers on your [Modal dashboard](https://modal.com/apps).

## Test the server

To make it easier to test the server setup, we also include a \`local_entrypoint\`
that hits the server with a simple client.

If you execute the command

\`\`\`bash
modal run trtllm_latency.py
\`\`\`

a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.

Think of this like writing simple tests inside of the \`if __name__ == "__main__"\`
block of a Python script, but for cloud deployments!

\`\`\`python
@app.local_entrypoint()
async def test(test_timeout=10 * MINUTES, prompt=None, twice=True):
    url = await TRT.get_url.aio()

    system_prompt = {
        "role": "system",
        "content": "You are a helpful, harmless, and honest AI assistant.",
    }
    if prompt is None:
        prompt = "What is the capital of France?"

    content = [{"type": "text", "text": prompt}]

    messages = [
        system_prompt,
        {"role": "user", "content": content},
    ]

    await probe(url, messages, timeout=test_timeout)
    if twice:
        messages[0]["content"] = "You are a pirate."
        print(f"Sending messages to {url}:", *messages, sep="\\n\\t")
        await probe(url, messages, timeout=test_timeout)


\`\`\`

This test relies on the two helper functions below,
which ping the server and wait for a valid response to stream.

The \`probe\` helper function specifically ignores
two types of errors that can occur while a replica
is starting up -- timeouts on the client and 5XX responses from the server.
Modal Servers returns the [503 Service Unavailable status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
when there are no live replicas.

We include a header with each request -- \`Modal-Session-ID\`.
The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Note that this header is only compatible with Modal Servers.

\`\`\`python
async def probe(url, messages=None, timeout=5 * MINUTES):
    if messages is None:
        messages = [{"role": "user", "content": "Tell me a joke."}]

    client_id = str(0)  # set per multi-turn interaction for sticky routing
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
    payload = {"model": MODEL_ID, "messages": messages, "stream": True}
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
`,meta:{title:`Serve an interactive language model app with low-latency TensorRT-LLM (LLaMA 3 8B)`,description:`In this example, we demonstrate how to configure the TensorRT-LLM framework to serve Meta’s LLaMA 3 8B model at interactive latencies on Modal.`}},{toc:m,rawContent:h,meta:re}=p,ie=t(`<em>quantization</em>`),ae=t(`<code>modal.concurrent</code>`),oe=t(`<code>requests</code> library`,1),se=t(`<code>localhost</code>/<code>127.0.0.1</code>`,1),ce=t(`<code>modal.enter/exit</code>`),le=t(`<code>@app.server</code>`),ue=t(`<code>@modal.enter</code>, and <code>@modal.exit</code>`,1),de=t(`<!> <p>In this example, we demonstrate how to configure the TensorRT-LLM framework to serve
Meta’s LLaMA 3 8B model at interactive latencies on Modal.</p> <p>Many popular language model applications, like chatbots and code editing,
put humans and models in direct interaction. According to an <!> if <!> rule of thumb, computer systems need to keep their response times under 400ms
in order to match pace with their human users.</p> <p>To hit this target, we use the <!> inference framework from NVIDIA. TensorRT-LLM is the Lamborghini of inference engines:
it achieves seriously impressive latency, but only if you tune it carefully.
We pair it with <!> which routes requests
through a <!> designed for latency-sensitive inference workloads,
minimizing the overhead between client and GPU.
These latencies were measured on a single NVIDIA H100 GPU
running LLaMA 3 8B on prompts and generations of a few dozen to a few hundred tokens.</p> <p>Here’s what that looks like in a terminal chat interface:</p> <video controls autoplay loop><source src="https://modal-cdn.com/example-trtllm-latency.mp4" type="video/mp4"/></video> <!> <p>This guide documents how to use recommendations from the <!> to optimize a <!> for low latency,
then serve it behind an OpenAI-compatible HTTP API with <code>trtllm-serve</code>.</p> <p>Be sure to check out TensorRT-LLM’s <!> for sample code beyond what we cover here, like low-rank adapters (LoRAs).</p> <!> <p>The first step in running TensorRT-LLM is to build an “engine” from a model.
Engines have a large number of parameters that must be tuned on a per-workload basis,
so we carefully document the choices we made here and point you to additional resources
that can help you optimize for your specific workload.</p> <p>Historically, this process was done with a clunky command-line-interface (CLI),
but things have changed for the better!
There is now a new-and-improved Python SDK for TensorRT-LLM, supporting
all the same features as the CLI — quantization, speculative decoding, in-flight batching,
and much more.</p> <!> <p>To run code on Modal, we define <!>.
All Modal containers have access to GPU drivers via the underlying host environment,
but we still need to install the software stack on top of the drivers, from the CUDA runtime up.</p> <p>We start from an official <code>nvidia/cuda</code> container image,
which includes the CUDA runtime & development libraries
and the environment configuration necessary to run them.
On top of that, we add some system dependencies of TensorRT-LLM,
including OpenMPI for distributed communication, some core software like <code>git</code>,
and the <code>tensorrt_llm</code> package itself.</p> <p>While we’re at it, we import the dependencies we’ll need both remotely and locally (for deployment).</p> <!> <p>Note that we’re doing this by <!> a number of calls to methods on the <code>modal.Image</code>. If you’re familiar with
Dockerfiles, you can think of this as a Pythonic interface to instructions like <code>RUN</code> and <code>CMD</code>.</p> <p>End-to-end, this step takes about five minutes on first run.</p> <!> <p>We serve <!>,
downloading it to persistent storage and loading it quickly —
this is a latency-optimized example after all! For persistent, distributed storage, we use <!>, which can be accessed from any container
with read speeds in excess of a gigabyte per second.</p> <p>We also set the <code>HF_HOME</code> environment variable to point to the Volume so that the model
is cached there, and turn on <!> to get maximum throughput from the Hugging Face Hub.</p> <!> <!> <!> <p>The amount of <!> on a single card is a tight constraint for large models:
RAM is measured in billions of bytes and large models have billions of parameters,
each of which is two to four bytes.
The performance cliff if you need to spill to CPU memory is steep,
so all of those parameters must fit in the GPU memory,
along with other things like the KV cache built up while processing prompts.</p> <p>The simplest way to reduce LLM inference’s RAM requirements is to make the model’s parameters smaller,
fitting their values in a smaller number of bits, like four or eight. This is known as <!>.</p> <p>NVIDIA’s <!>,
like the L40S and H100, are capable of native 8bit floating point calculations
in their <!>,
so we choose that as our quantization format.
These GPUs are capable of twice as many floating point operations per second in 8bit as in 16bit —
about two quadrillion per second on an H100 SXM.</p> <p>Quantization buys us two things:</p> <ul><li><p>faster startup, since less data has to be moved over the network onto CPU and GPU RAM</p></li> <li><p>faster inference, since we get twice the FLOP/s and less data has to be moved from GPU RAM into <!> and <!> with each computation</p></li></ul> <p>We’ll use TensorRT-LLM’s <code>QuantConfig</code> to specify that we want <code>FP8</code> quantization. <!> for more options.</p> <p>Quantization is a lossy compression technique. The impact on model quality can be
minimized by tuning the quantization parameters on even a small dataset. Typically, we
see less than 2% degradation in evaluation metrics when using <code>fp8</code>. We use the <code>CalibConfig</code> class to specify the calibration dataset.</p> <!> <p>TensorRT-LLM is an LLM inference framework built on top of NVIDIA’s TensorRT,
which is a generic inference framework for neural networks.</p> <p>TensorRT includes a “plugin” extension system that allows you to adjust behavior,
like configuring the <!> used by the engine.
The <!> plugin, for instance, adds heavily-optimized matrix multiplication kernels
from NVIDIA’s <!>.</p> <p>We specify a number of plugins for our engine implementation.
The first is <!>,
which configures TensorRT to prepare multiple kernels for each high-level operation,
where different kernels are optimized for different input sizes.
The second is <code>paged_kv_cache</code> which enables a <!> for the key-value (KV) cache.</p> <p>The last two parameters are GEMM plugins optimized specifically for low latency,
rather than the more typical high arithmetic throughput,
the <code>low_latency</code> plugins for <code>gemm</code> and <code>gemm_swiglu</code>.</p> <p>The <code>low_latency_gemm_swiglu_plugin</code> plugin fuses the two matmul operations
and non-linearity of the feedforward component of the Transformer block into a single kernel,
reducing round trips between GPU <!> and RAM. For details on kernel fusion, see <!>.
Note that at the time of writing, this only works for <code>FP8</code> on Hopper GPUs.</p> <p>The <code>low_latency_gemm_plugin</code> is a variant of the GEMM plugin that brings in latency-optimized
kernels from NVIDIA’s <!>.</p> <!> <p>Speculative decoding is a technique for generating multiple tokens per step,
avoiding the auto-regressive bottleneck in the Transformer architecture and
exposing more parallelism to the GPU. It works best for text with predictable
patterns, like code, but it’s worth testing for any latency-critical workload.
We no longer configure it by hand here — it’s handled within the serving stack —
but it remains one of the most effective levers for cutting per-token latency.</p> <!> <p>Finally, we specify the overall build configuration for the engine. This includes
the maximum input length, the maximum number of tokens
to process at once before queueing occurs, and the maximum number of sequences
to process at once before queueing occurs.</p> <p>To minimize latency, we set the maximum number of sequences (the “batch size”)
to just one and pair that with low per-container concurrency below,
trading throughput for the lowest possible per-request latency.</p> <!> <!> <!> <p>Minimizing latency requires geographic co-location of clients and servers.</p> <p>So for low latency LLM inference services on Modal, you must select a <!> for both the GPU-accelerated containers running inference
and for the <!> that forwards requests to them as part of defining a Server.</p> <p>Here, we assume users are mostly in the northern half of the Americas
and select the <code>us</code> cloud region with a nearby <code>us-west</code> proxy to serve them.
This should result in at most a few dozen milliseconds of round-trip time.</p> <!> <p>Latencies for multi-turn interactions with LLMs are
substantially cut when previous interaction turns are in the KV cache.
KV caches are stored in <!>,
so they aren’t shared across replicas.
To improve cache hit rate, Modal Servers
includes sticky routing based on a client-provided header.
See <!> for details.</p> <p>For production-scale LLM inference services, there are generally
enough requests to justify keeping at least one replica running at all times.
Having a “warm” or “live” replica reduces latency by skipping slow initialization work
that occurs when a new replica boots up (a <!>).
For LLM inference servers, that latency runs from seconds to minutes.</p> <p>To ensure at least one container is always available,
we can set the <code>min_containers</code> of our Modal Function to <code>1</code> or more.
However, since this is documentation code, we’ll set it to <code>0</code> to avoid surprise bills during casual use.</p> <!> <p>Finally, we set a target for the number of inputs to run on a single container
with <!>.
For details, see <!>.
We keep concurrency low for minimum per-request latency.</p> <!> <!> <p>Modal considers a new replica ready to receive inputs once the <code>modal.enter</code> methods have exited
and the container accepts connections.
To ensure that we actually finish setting up our server before we are marked ready for inputs,
we poll the server’s <code>/health</code> endpoint until it’s ready,
then send a few warm-up requests so the first real request isn’t slow.</p> <p>We use the <!> to send ourselves these HTTP requests on <!>.</p> <!> <!> <p>We use <!> to manage
the server lifecycle. On the first container start, we build an optimized engine
using the TensorRT-LLM <!> with FP8 quantization and low-latency plugins, then cache it in the Volume.
Subsequent starts load the cached engine in seconds and launch <code>trtllm-serve</code> to expose an OpenAI-compatible HTTP API.</p> <p>The key decorators are <!>, <!> The code in the <code>enter</code> decorator needs to start a server process that listens on a port.</p> <p>The <code>@app.server</code> decorator does a lot! We:</p> <ol><li>Attach our Image</li> <li>Request a GPU</li> <li>Attach our cache Volume</li> <li>Specify the regions for the routing proxy and compute</li> <li>Configure auto-scaling, concurrency, and timeouts</li> <li>Configure authentication via <!> (disabled here for demo purposes)</li></ol> <!> <!> <p>To deploy the server on Modal, just run</p> <!> <p>This will create a new App on Modal and build the container image for it if it hasn’t been built yet.</p> <!> <p>Once it is deployed, you’ll see a URL appear in the command line,
something like <code>https://your-workspace-name--example-trtllm-low-latency-trt.us-west.modal.direct</code>.</p> <p>You can find <!> at the <code>/docs</code> route of that URL.
These docs describe each route and indicate the expected input and output
and translate requests into <code>curl</code> commands.
For simple routes, you can even send a request directly from the docs page.</p> <p>Note: when no replicas are available, Modal will respond with
the <!>.
In your browser, you can just hit refresh until the docs page appears.
You can see the status of the application and its containers on your <!>.</p> <!> <p>To make it easier to test the server setup, we also include a <code>local_entrypoint</code> that hits the server with a simple client.</p> <p>If you execute the command</p> <!> <p>a fresh replica of the server will be spun up on Modal while
the code below executes on your local machine.</p> <p>Think of this like writing simple tests inside of the <code>if __name__ == "__main__"</code> block of a Python script, but for cloud deployments!</p> <!> <p>This test relies on the two helper functions below,
which ping the server and wait for a valid response to stream.</p> <p>The <code>probe</code> helper function specifically ignores
two types of errors that can occur while a replica
is starting up — timeouts on the client and 5XX responses from the server.
Modal Servers returns the <!> when there are no live replicas.</p> <p>We include a header with each request — <code>Modal-Session-ID</code>.
The value associated with this key
is used to map requests onto containers such that
while the set of containers is fixed, requests with the same value
are sent to the same container.
Set this to a different value per multi-turn interaction
(prototypically, a user conversation thread with a chatbot)
to improve KV cache hit rates.
Note that this header is only compatible with Modal Servers.</p> <!>`,3);function g(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=de(),d=te(a);ne(d,{id:`serve-an-interactive-language-model-app-with-low-latency-tensorrt-llm-llama-3-8b`,children:(e,t)=>{s(),i(e,r(`Serve an interactive language model app with low-latency TensorRT-LLM (LLaMA 3 8B)`))},$$slots:{default:!0}});var p=o(d,4),m=o(e(p));f(m,{href:`https://lawsofux.com/doherty-threshold/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`oft-cited`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://www.flashover.blog/posts/dohertys-threshold-is-a-lie`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`scientifically dubious`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2),re=o(e(h));f(re,{href:`https://github.com/NVIDIA/TensorRT-LLM`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM`))},$$slots:{default:!0}});var g=o(re,2);f(g,{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Servers`))},$$slots:{default:!0}}),f(o(g,2),{href:`https://modal.com/blog/serverless-servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`new, low-latency proxy service`))},$$slots:{default:!0}}),s(),n(h);var _=o(h,4);_.muted=!0;var v=o(_,2);c(v,{id:`overview`,children:(e,t)=>{s(),i(e,r(`Overview`))},$$slots:{default:!0}});var y=o(v,2),fe=o(e(y));f(fe,{href:`https://github.com/NVIDIA/TensorRT-LLM/blob/b763051ba429d60263949da95c701efe8acf7b9c/docs/source/performance/performance-tuning-guide/useful-build-time-flags.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM performance guide`))},$$slots:{default:!0}}),f(o(fe,2),{href:`https://nvidia.github.io/TensorRT-LLM/llm-api`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM engine`))},$$slots:{default:!0}}),s(3),n(y);var b=o(y,2);f(o(e(b)),{href:`https://nvidia.github.io/TensorRT-LLM/llm-api-examples`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`examples`))},$$slots:{default:!0}}),s(),n(b);var pe=o(b,2);l(pe,{id:`what-is-a-trt-llm-engine`,children:(e,t)=>{s(),i(e,r(`What is a TRT-LLM engine?`))},$$slots:{default:!0}});var me=o(pe,6);c(me,{id:`set-up-the-container-image`,children:(e,t)=>{s(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var x=o(me,2);f(o(e(x)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`container images`))},$$slots:{default:!0}}),s(),n(x);var he=o(x,6);u(he,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Atensorrt_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22nvidia%2Fcuda%3A12.8.1-devel-ubuntu22.04%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%20%20%23%20TRT-LLM%20requires%20Python%203.12%0A).entrypoint(%5B%5D)%20%20%23%20silence%20noisy%20NVIDIA%20license%20logging%0A%0Atensorrt_image%20%3D%20tensorrt_image.apt_install(%0A%20%20%20%20%22openmpi-bin%22%2C%20%22libopenmpi-dev%22%2C%20%22git%22%2C%20%22git-lfs%22%2C%20%22wget%22%0A).uv_pip_install(%0A%20%20%20%20%22tensorrt-llm%3D%3D0.20.0%22%2C%20%20%23%200.20%2B%20adds%20trtllm-serve%20--extra_llm_api_options%0A%20%20%20%20%22pynvml%3E%3D12%22%2C%20%20%23%20required%20by%20tensorrt-llm%200.20%0A%20%20%20%20%22flashinfer-python%3D%3D0.2.5%22%2C%0A%20%20%20%20%22cuda-python%3D%3D12.9.1%22%2C%0A%20%20%20%20%22onnx%3D%3D1.19.1%22%2C%0A%20%20%20%20%22mpmath%3D%3D1.3.0%22%2C%0A%20%20%20%20%22torch%3D%3D2.7.0%22%2C%0A%20%20%20%20pre%3DTrue%2C%0A%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fpypi.nvidia.com%22%2C%0A)%0A`,lang:`python`});var S=o(he,2);f(o(e(S)),{href:`https://quanticdev.com/articles/method-chaining/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`method-chaining`))},$$slots:{default:!0}}),s(7),n(S);var ge=o(S,4);c(ge,{id:`cache-model-weights-in-a-modal-volume`,children:(e,t)=>{s(),i(e,r(`Cache model weights in a Modal Volume`))},$$slots:{default:!0}});var C=o(ge,2),_e=o(e(C));f(_e,{href:`https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Meta’s LLaMA 3 8B`))},$$slots:{default:!0}}),f(o(_e,2),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);f(o(e(w),3),{href:`https://huggingface.co/docs/hub/en/models-downloading#faster-downloads`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`high-performance downloads`))},$$slots:{default:!0}}),s(),n(w);var ve=o(w,2);u(ve,{code:`MODEL_ID%20%3D%20%22NousResearch%2FMeta-Llama-3-8B-Instruct%22%20%20%23%20fork%20without%20repo%20gating%0AMODEL_REVISION%20%3D%20%2253346005fb0ef11d3b6a83b12c895cca40156b6c%22%20%20%23%20pin%20to%20avoid%20surprises!%0A%0Avolume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22example-trtllm-inference-volume%22%2C%20create_if_missing%3DTrue%0A)%0AVOLUME_PATH%20%3D%20Path(%22%2Fvol%22)%0AMODELS_PATH%20%3D%20VOLUME_PATH%20%2F%20%22models%22%0A%0Atensorrt_image%20%3D%20tensorrt_image.uv_pip_install(%0A%20%20%20%20%22huggingface_hub%3D%3D0.36.0%22%2C%0A).env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20str(MODELS_PATH)%2C%0A%20%20%20%20%20%20%20%20%22TORCH_CUDA_ARCH_LIST%22%3A%20%229.0%209.0a%22%2C%20%20%23%20H100%2C%20silence%20noisy%20logs%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var ye=o(ve,2);c(ye,{id:`configure-for-low-latency`,children:(e,t)=>{s(),i(e,r(`Configure for low latency`))},$$slots:{default:!0}});var T=o(ye,2);l(T,{id:`quantization`,children:(e,t)=>{s(),i(e,r(`Quantization`))},$$slots:{default:!0}});var E=o(T,2);f(o(e(E)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);f(o(e(D)),{href:`https://modal.com/llm-almanac/quant-formats`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(D);var O=o(D,2),k=o(e(O));f(k,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ada Lovelace/Hopper chips`))},$$slots:{default:!0}}),f(o(k,2),{href:`https://modal.com/gpu-glossary/device-hardware/tensor-core`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tensor Cores`))},$$slots:{default:!0}}),s(),n(O);var A=o(O,4),j=o(e(A),2),M=e(j),N=o(e(M));f(N,{href:`https://modal.com/gpu-glossary/device-hardware/l1-data-cache`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`on-chip memory`))},$$slots:{default:!0}}),f(o(N,2),{href:`https://modal.com/gpu-glossary/device-hardware/register-file`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`registers`))},$$slots:{default:!0}}),s(),n(M),n(j),n(A);var P=o(A,2);f(o(e(P),5),{href:`https://github.com/NVIDIA/TensorRT-LLM/blob/88e1c90fd0484de061ecfbacfc78a4a8900a4ace/tensorrt_llm/models/modeling_utils.py#L184`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`See their code`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);l(F,{id:`configure-plugins`,children:(e,t)=>{s(),i(e,r(`Configure plugins`))},$$slots:{default:!0}});var I=o(F,4),L=o(e(I));f(L,{href:`https://modal.com/gpu-glossary/device-software/kernel`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CUDA kernels`))},$$slots:{default:!0}});var R=o(L,2);f(R,{href:`https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`General Matrix Multiply (GEMM)`))},$$slots:{default:!0}}),f(o(R,2),{href:`https://docs.nvidia.com/cuda/cublas/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cuBLAS library of linear algebra routines`))},$$slots:{default:!0}}),s(),n(I);var z=o(I,2),be=o(e(z));f(be,{href:`https://github.com/NVIDIA/TensorRT-LLM/blob/b763051ba429d60263949da95c701efe8acf7b9c/docs/source/performance/performance-tuning-guide/useful-build-time-flags.md#multiple-profiles`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`multiple profiles`))},$$slots:{default:!0}}),f(o(be,4),{href:`https://arxiv.org/abs/2309.06180`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`paged attention algorithm`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,4),xe=o(e(B),3);f(xe,{href:`https://modal.com/gpu-glossary/device-hardware/l1-data-cache`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cache memory`))},$$slots:{default:!0}}),f(o(xe,2),{href:`https://horace.io/brrr_intro.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this blog post by Horace He of Thinking Machines`))},$$slots:{default:!0}}),s(3),n(B);var V=o(B,2);f(o(e(V),3),{href:`https://github.com/NVIDIA/cutlass`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CUTLASS library`))},$$slots:{default:!0}}),s(),n(V);var Se=o(V,2);l(Se,{id:`a-note-on-speculative-decoding`,children:(e,t)=>{s(),i(e,r(`A note on speculative decoding`))},$$slots:{default:!0}});var Ce=o(Se,4);l(Ce,{id:`set-the-build-config`,children:(e,t)=>{s(),i(e,r(`Set the build config`))},$$slots:{default:!0}});var we=o(Ce,6);u(we,{code:`N_GPUS%20%3D%201%20%20%23%20bumping%20this%20to%202%20will%20improve%20latencies%20further%20but%20not%202x%0AGPU%20%3D%20f%22H100%3A%7BN_GPUS%7D%22%0AMAX_BATCH_SIZE%20%3D%201%20%20%23%20minimize%20latency%20by%20processing%20one%20request%20at%20a%20time%0A`,lang:`python`});var Te=o(we,2);c(Te,{id:`define-the-inference-server-and-infrastructure`,children:(e,t)=>{s(),i(e,r(`Define the inference server and infrastructure`))},$$slots:{default:!0}});var Ee=o(Te,2);l(Ee,{id:`selecting-infrastructure-to-minimize-latency`,children:(e,t)=>{s(),i(e,r(`Selecting infrastructure to minimize latency`))},$$slots:{default:!0}});var H=o(Ee,4),De=o(e(H));f(De,{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`cloud region`))},$$slots:{default:!0}}),f(o(De,2),{href:`https://modal.com/blog/serverless-servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`internal Modal proxy system`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,4);u(U,{code:`REGION%20%3D%20%22us%22%0APORT%20%3D%208000%0APROXY_REGION%20%3D%20%22us-west%22%0A`,lang:`python`});var W=o(U,2),Oe=o(e(W));f(Oe,{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),f(o(Oe,2),{href:`https://modal.com/docs/examples/server_sticky`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this code sample`))},$$slots:{default:!0}}),s(),n(W);var G=o(W,2);f(o(e(G)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“cold start”`))},$$slots:{default:!0}}),s(),n(G);var ke=o(G,4);u(ke,{code:`MIN_CONTAINERS%20%3D%200%20%20%23%20set%20to%201%20to%20ensure%20one%20replica%20is%20always%20ready%0A`,lang:`python`});var K=o(ke,2),Ae=o(e(K));f(Ae,{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),f(o(Ae,2),{href:`https://modal.com/docs/guide/concurrent-inputs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the guide`))},$$slots:{default:!0}}),s(),n(K);var je=o(K,2);u(je,{code:`TARGET_INPUTS%20%3D%201%20%20%23%20low%20concurrency%20for%20minimum%20per-request%20latency%0A`,lang:`python`});var Me=o(je,2);l(Me,{id:`health-check-and-warmup-helpers`,children:(e,t)=>{s(),i(e,r(`Health check and warmup helpers`))},$$slots:{default:!0}});var q=o(Me,4),Ne=o(e(q));f(Ne,{href:`https://requests.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{var n=oe();s(),i(e,n)},$$slots:{default:!0}}),f(o(Ne,2),{href:`https://superuser.com/questions/31824/why-is-localhost-ip-127-0-0-1`,rel:`nofollow`,children:(e,t)=>{var n=se();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(q);var Pe=o(q,2);u(Pe,{code:`with%20tensorrt_image.imports()%3A%0A%20%20%20%20import%20requests%0A%0A%0Adef%20wait_ready(process%3A%20subprocess.Popen%2C%20timeout%3A%20int%20%3D%2020%20*%20MINUTES)%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20check_running(process)%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.get(f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fhealth%22).raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20except%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.ConnectionError%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20requests.exceptions.HTTPError%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20raise%20TimeoutError(f%22TensorRT-LLM%20server%20not%20ready%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Adef%20check_running(p%3A%20subprocess.Popen)%3A%0A%20%20%20%20if%20(rc%20%3A%3D%20p.poll())%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(rc%2C%20cmd%3Dp.args)%0A%0A%0Adef%20warmup()%3A%0A%20%20%20%20payload%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20%22messages%22%3A%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello%2C%20how%20are%20you%3F%22%7D%5D%2C%0A%20%20%20%20%20%20%20%20%22max_tokens%22%3A%2016%2C%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20requests.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22http%3A%2F%2F127.0.0.1%3A%7BPORT%7D%2Fv1%2Fchat%2Fcompletions%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20json%3Dpayload%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D60%2C%0A%20%20%20%20%20%20%20%20).raise_for_status()%0A%0A`,lang:`python`});var Fe=o(Pe,2);l(Fe,{id:`build-the-trt-llm-engine-and-start-the-server`,children:(e,t)=>{s(),i(e,r(`Build the TRT-LLM engine and start the server`))},$$slots:{default:!0}});var J=o(Fe,2),Ie=o(e(J));f(Ie,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),f(o(Ie,2),{href:`https://nvidia.github.io/TensorRT-LLM/llm-api`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Python API`))},$$slots:{default:!0}}),s(3),n(J);var Y=o(J,2),Le=o(e(Y));f(Le,{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),f(o(Le,2),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=ue();s(2),i(e,n)},$$slots:{default:!0}}),s(3),n(Y);var X=o(Y,4),Re=o(e(X),10);f(o(e(Re)),{href:`https://modal.com/docs/guide/webhook-proxy-auth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}}),s(),n(Re),n(X);var ze=o(X,2);u(ze,{code:`app%20%3D%20modal.App(%22example-trtllm-low-latency%22)%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dtensorrt_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20volumes%3D%7BVOLUME_PATH%3A%20volume%7D%2C%0A%20%20%20%20compute_region%3DREGION%2C%0A%20%20%20%20routing_region%3DPROXY_REGION%2C%20%20%23%20location%20of%20proxies%2C%20should%20be%20close%20to%20Cls%20region%0A%20%20%20%20min_containers%3DMIN_CONTAINERS%2C%0A%20%20%20%20target_concurrency%3DTARGET_INPUTS%2C%0A%20%20%20%20startup_timeout%3D20%20*%20MINUTES%2C%0A%20%20%20%20port%3DPORT%2C%20%20%23%20wrapped%20code%20must%20listen%20on%20this%20port%0A%20%20%20%20exit_grace_period%3D15%2C%20%20%23%20seconds%2C%20time%20to%20finish%20up%20requests%20when%20closing%20down%0A%20%20%20%20unauthenticated%3DTrue%2C%20%20%23%20no%20auth%20for%20this%20demo%2C%20see%20Servers%20guide%2Fdocs%20for%20auth%20details%0A)%0Aclass%20TRT%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Download%20model%2C%20build%2Fload%20the%20optimized%20engine%2C%20and%20start%20trtllm-serve.%22%22%22%0A%20%20%20%20%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%20%20%20%20%20%20%20%20from%20tensorrt_llm%20import%20LLM%2C%20BuildConfig%0A%20%20%20%20%20%20%20%20from%20tensorrt_llm.llmapi%20import%20CalibConfig%2C%20QuantConfig%0A%20%20%20%20%20%20%20%20from%20tensorrt_llm.plugin.plugin%20import%20PluginConfig%0A%0A%20%20%20%20%20%20%20%20model_path%20%3D%20str(MODELS_PATH%20%2F%20MODEL_ID)%0A%20%20%20%20%20%20%20%20engine_path%20%3D%20str(MODELS_PATH%20%2F%20MODEL_ID%20%2F%20%22trtllm_engine%22%20%2F%20%22serve-0.20%22)%0A%0A%20%20%20%20%20%20%20%20snapshot_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20local_dir%3Dmodel_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20ignore_patterns%3D%5B%22*.pt%22%2C%20%22*.bin%22%5D%2C%20%20%23%20using%20safetensors%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20if%20not%20Path(engine_path).exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22building%20new%20engine%20at%20%7Bengine_path%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20llm%20%3D%20LLM(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model%3Dmodel_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20quant_config%3DQuantConfig(quant_algo%3D%22FP8%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20calib_config%3DCalibConfig(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20calib_batches%3D512%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20calib_batch_size%3D1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20calib_max_seq_length%3D2048%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tokenizer_max_seq_length%3D4096%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20build_config%3DBuildConfig(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20plugin_config%3DPluginConfig.from_dict(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22multiple_profiles%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22paged_kv_cache%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22low_latency_gemm_swiglu_plugin%22%3A%20%22fp8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22low_latency_gemm_plugin%22%3A%20%22fp8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20max_input_len%3D8192%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20max_num_tokens%3D16384%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20max_batch_size%3DMAX_BATCH_SIZE%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tensor_parallel_size%3DN_GPUS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20llm.save(engine_path)%0A%20%20%20%20%20%20%20%20%20%20%20%20llm.shutdown()%0A%20%20%20%20%20%20%20%20%20%20%20%20del%20llm%0A%20%20%20%20%20%20%20%20%20%20%20%20volume.commit()%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22loading%20cached%20engine%20from%20%7Bengine_path%7D%22)%0A%0A%20%20%20%20%20%20%20%20%23%20When%20serving%20a%20prebuilt%20TensorRT%20engine%2C%20%60trtllm-serve%60%20needs%20to%20be%0A%20%20%20%20%20%20%20%20%23%20pointed%20at%20the%20original%20Hugging%20Face%20checkpoint%20for%20the%20tokenizer%20and%0A%20%20%20%20%20%20%20%20%23%20its%20chat%20template%2C%20otherwise%20%60%2Fv1%2Fchat%2Fcompletions%60%20returns%20a%20400.%0A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22trtllm-serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20engine_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--tokenizer%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(PORT)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%20%20%20%20%20%20%20%20wait_ready(self.process)%0A%20%20%20%20%20%20%20%20warmup()%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A`,lang:`python`});var Be=o(ze,2);c(Be,{id:`deploy-the-server`,children:(e,t)=>{s(),i(e,r(`Deploy the server`))},$$slots:{default:!0}});var Ve=o(Be,4);u(Ve,{code:`modal%20deploy%20trtllm_latency.py`,lang:`bash`});var He=o(Ve,4);c(He,{id:`interact-with-the-server`,children:(e,t)=>{s(),i(e,r(`Interact with the server`))},$$slots:{default:!0}});var Z=o(He,4);f(o(e(Z)),{href:`https://swagger.io/tools/swagger-ui/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interactive Swagger UI docs`))},$$slots:{default:!0}}),s(5),n(Z);var Q=o(Z,2),Ue=o(e(Q));f(Ue,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),f(o(Ue,2),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),s(),n(Q);var We=o(Q,2);c(We,{id:`test-the-server`,children:(e,t)=>{s(),i(e,r(`Test the server`))},$$slots:{default:!0}});var Ge=o(We,6);u(Ge,{code:`modal%20run%20trtllm_latency.py`,lang:`bash`});var Ke=o(Ge,6);u(Ke,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(test_timeout%3D10%20*%20MINUTES%2C%20prompt%3DNone%2C%20twice%3DTrue)%3A%0A%20%20%20%20url%20%3D%20await%20TRT.get_url.aio()%0A%0A%20%20%20%20system_prompt%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20helpful%2C%20harmless%2C%20and%20honest%20AI%20assistant.%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22What%20is%20the%20capital%20of%20France%3F%22%0A%0A%20%20%20%20content%20%3D%20%5B%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20messages%20%3D%20%5B%0A%20%20%20%20%20%20%20%20system_prompt%2C%0A%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20content%7D%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20messages%5B0%5D%5B%22content%22%5D%20%3D%20%22You%20are%20a%20pirate.%22%0A%20%20%20%20%20%20%20%20print(f%22Sending%20messages%20to%20%7Burl%7D%3A%22%2C%20*messages%2C%20sep%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20await%20probe(url%2C%20messages%2C%20timeout%3Dtest_timeout)%0A%0A`,lang:`python`});var $=o(Ke,4);f(o(e($),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`503 Service Unavailable status`))},$$slots:{default:!0}}),s(),n($),u(o($,4),{code:`async%20def%20probe(url%2C%20messages%3DNone%2C%20timeout%3D5%20*%20MINUTES)%3A%0A%20%20%20%20if%20messages%20is%20None%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Tell%20me%20a%20joke.%22%7D%5D%0A%0A%20%20%20%20client_id%20%3D%20str(0)%20%20%23%20set%20per%20multi-turn%20interaction%20for%20sticky%20routing%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-ID%22%3A%20client_id%7D%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20async%20with%20aiohttp.ClientSession(base_url%3Durl%2C%20headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20_send_request_streaming(session%2C%20messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20aiohttp.client_exceptions.ClientResponseError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20e.status%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20raise%20TimeoutError(f%22No%20response%20from%20server%20within%20%7Btimeout%7D%20seconds%22)%0A%0A%0Aasync%20def%20_send_request_streaming(%0A%20%20%20%20session%3A%20aiohttp.ClientSession%2C%20messages%3A%20list%2C%20timeout%3A%20int%20%7C%20None%20%3D%20None%0A)%20-%3E%20None%3A%0A%20%20%20%20payload%20%3D%20%7B%22model%22%3A%20MODEL_ID%2C%20%22messages%22%3A%20messages%2C%20%22stream%22%3A%20True%7D%0A%20%20%20%20headers%20%3D%20%7B%22Accept%22%3A%20%22text%2Fevent-stream%22%7D%0A%0A%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%22%2Fv1%2Fchat%2Fcompletions%22%2C%20json%3Dpayload%2C%20headers%3Dheaders%2C%20timeout%3Dtimeout%0A%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20resp.raise_for_status()%0A%20%20%20%20%20%20%20%20full_text%20%3D%20%22%22%0A%0A%20%20%20%20%20%20%20%20async%20for%20raw%20in%20resp.content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20line%20%3D%20raw.decode(%22utf-8%22%2C%20errors%3D%22ignore%22).strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Server-Sent%20Events%20format%3A%20%22data%3A%20....%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20line.startswith(%22data%3A%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20line%5Blen(%22data%3A%22)%20%3A%5D.strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20%3D%3D%20%22%5BDONE%5D%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20evt%20%3D%20json.loads(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20json.JSONDecodeError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20ignore%20any%20non-JSON%20keepalive%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20delta%20%3D%20(evt.get(%22choices%22)%20or%20%5B%7B%7D%5D)%5B0%5D.get(%22delta%22)%20or%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20delta.get(%22content%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D%22%22%2C%20flush%3D%22%5Cn%22%20in%20chunk%20or%20%22.%22%20in%20chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_text%20%2B%3D%20chunk%0A%20%20%20%20%20%20%20%20print()%20%20%23%20newline%20after%20stream%20completes%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{g as default,p as metadata};
//# sourceMappingURL=CL8gqPRI.js.map
