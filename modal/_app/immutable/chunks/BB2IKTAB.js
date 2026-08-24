(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1343e136-dff7-403b-8221-965be6a207ba`,e._sentryDebugIdIdentifier=`sentry-dbid-1343e136-dff7-403b-8221-965be6a207ba`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Serverless TensorRT-LLM (LLaMA 3 8B)`,id:`serverless-tensorrt-llm-llama-3-8b`,children:[{depth:2,value:`Overview`,id:`overview`,children:[{depth:3,value:`Build process`,id:`build-process`},{depth:3,value:`Engine configuration`,id:`engine-configuration`}]},{depth:2,value:`Installing TensorRT-LLM`,id:`installing-tensorrt-llm`},{depth:2,value:`Downloading the Model`,id:`downloading-the-model`},{depth:2,value:`Quantization`,id:`quantization`},{depth:2,value:`Compiling the engine`,id:`compiling-the-engine`},{depth:2,value:`Serving inference at tens of thousands of tokens per second`,id:`serving-inference-at-tens-of-thousands-of-tokens-per-second`},{depth:2,value:`Calling our inference function`,id:`calling-our-inference-function`,children:[{depth:3,value:`Calling inference from Python`,id:`calling-inference-from-python`},{depth:3,value:`Calling inference via an API`,id:`calling-inference-via-an-api`}]},{depth:2,value:`Footer`,id:`footer`}]}],rawContent:`# Serverless TensorRT-LLM (LLaMA 3 8B)

In this example, we demonstrate how to use the TensorRT-LLM framework to serve Meta's LLaMA 3 8B model
at very high throughput.

We achieve a total throughput of over 25,000 output tokens per second on a single NVIDIA H100 GPU.
At [Modal's on-demand rate](https://modal.com/pricing) of ~$4/hr, that's under $0.05 per million tokens --
on auto-scaling infrastructure and served via a customizable API.

## Overview

This guide is intended to document two things:
the general process for building TensorRT-LLM on Modal
and a specific configuration for serving the LLaMA 3 8B model.

### Build process

Any given TensorRT-LLM service requires a multi-stage build process,
starting from model weights and ending with a compiled engine.
Because that process touches many sharp-edged high-performance components
across the stack, it can easily go wrong in subtle and hard-to-debug ways
that are idiosyncratic to specific systems.
And debugging GPU workloads is expensive!

This example builds an entire service from scratch, from downloading weight tensors
to responding to requests, and so serves as living, interactive documentation of a TensorRT-LLM
build process that works on Modal.

### Engine configuration

TensorRT-LLM is the Lamborghini of inference engines: it achieves seriously
impressive performance, but only if you tune it carefully.
We carefully document the choices we made here and point to additional resources
so you know where and how you might adjust the parameters for your use case.

## Installing TensorRT-LLM

To run TensorRT-LLM, we must first install it. Easier said than done!

In Modal, we define [container images](https://modal.com/docs/guide/custom-container) that run our serverless workloads.
All Modal containers have access to GPU drivers via the underlying host environment,
but we still need to install the software stack on top of the drivers, from the CUDA runtime up.

We start from an official \`nvidia/cuda\` image,
which includes the CUDA runtime & development libraries
and the environment configuration necessary to run them.

\`\`\`python
from typing import Optional

import modal
import pydantic  # for typing, used later

tensorrt_image = modal.Image.from_registry(
    "nvidia/cuda:12.4.1-devel-ubuntu22.04",
    add_python="3.10",  # TRT-LLM requires Python 3.10
).entrypoint([])  # remove verbose logging by base image on entry

\`\`\`

On top of that, we add some system dependencies of TensorRT-LLM,
including OpenMPI for distributed communication, some core software like \`git\`,
and the \`tensorrt_llm\` package itself.

\`\`\`python
tensorrt_image = tensorrt_image.apt_install(
    "openmpi-bin", "libopenmpi-dev", "git", "git-lfs", "wget"
).uv_pip_install(
    "tensorrt_llm==0.14.0",
    "pynvml<12",  # avoid breaking change to pynvml version API
    "cuda-python==12.9.1",
    pre=True,
    extra_index_url="https://pypi.nvidia.com",
    extra_options="--index-strategy unsafe-best-match",
)

\`\`\`

Note that we're doing this by [method-chaining](https://quanticdev.com/articles/method-chaining/)
a number of calls to methods on the \`modal.Image\`. If you're familiar with
Dockerfiles, you can think of this as a Pythonic interface to instructions like \`RUN\` and \`CMD\`.

End-to-end, this step takes five minutes.
If you're reading this from top to bottom,
you might want to stop here and execute the example
with \`modal run trtllm_throughput.py\`
so that it runs in the background while you read the rest.

## Downloading the Model

Next, we download the model we want to serve. In this case, we're using the instruction-tuned
version of Meta's LLaMA 3 8B model.
We use the function below to download the model from the Hugging Face Hub.

\`\`\`python
MODEL_DIR = "/root/model/model_input"
MODEL_ID = "NousResearch/Meta-Llama-3-8B-Instruct"  # fork without repo gating
MODEL_REVISION = "b1532e4dee724d9ba63fe17496f298254d87ca64"  # pin model revisions to prevent unexpected changes!


def download_model():
    import os

    from huggingface_hub import snapshot_download
    from transformers.utils import move_cache

    os.makedirs(MODEL_DIR, exist_ok=True)
    snapshot_download(
        MODEL_ID,
        local_dir=MODEL_DIR,
        ignore_patterns=["*.pt", "*.bin"],  # using safetensors
        revision=MODEL_REVISION,
    )
    move_cache()


\`\`\`

Just defining that function doesn't actually download the model, though.
We can run it by adding it to the image's build process with \`run_function\`.
The download process has its own dependencies, which we add here.

\`\`\`python
MINUTES = 60  # seconds
tensorrt_image = (  # update the image by downloading the model we're using
    tensorrt_image.uv_pip_install(  # add utilities for downloading the model
        "huggingface-hub==0.36.0",
        "requests~=2.32.2",
    )
    .env(  # hf-xet: faster downloads
        {"HF_XET_HIGH_PERFORMANCE": "1"}
    )
    .run_function(  # download the model
        download_model,
        timeout=20 * MINUTES,
    )
)

\`\`\`

## Quantization

The amount of GPU RAM on a single card is a tight constraint for most LLMs:
RAM is measured in billions of bytes and models have billions of parameters.
The performance cliff if you need to spill to CPU memory is steep,
so all of those parameters must fit in the GPU memory,
along with other things like the KV cache.

The simplest way to reduce LLM inference's RAM requirements is to make the model's parameters smaller,
to fit their values in a smaller number of bits, like four or eight. This is known as _quantization_.

We use a quantization script provided by the TensorRT-LLM team.
This script takes a few minutes to run.

\`\`\`python
GIT_HASH = "b0880169d0fb8cd0363049d91aa548e58a41be07"
CONVERSION_SCRIPT_URL = f"https://raw.githubusercontent.com/NVIDIA/TensorRT-LLM/{GIT_HASH}/examples/quantization/quantize.py"

\`\`\`

NVIDIA's Ada Lovelace/Hopper chips, like the 4090, L40S, and H100,
are capable of native calculations in 8bit floating point numbers, so we choose that as our quantization format (\`qformat\`).
These GPUs are capable of twice as many floating point operations per second in 8bit as in 16bit --
about two quadrillion per second on an H100 SXM.

\`\`\`python
N_GPUS = 1  # Heads up: this example has not yet been tested with multiple GPUs
GPU_CONFIG = f"H100:{N_GPUS}"

DTYPE = "float16"  # format we download in, regular fp16
QFORMAT = "fp8"  # format we quantize the weights to
KV_CACHE_DTYPE = "fp8"  # format we quantize the KV cache to

\`\`\`

Quantization is lossy, but the impact on model quality can be minimized by
tuning the quantization parameters based on target outputs.

\`\`\`python
CALIB_SIZE = "512"  # size of calibration dataset

\`\`\`

We put that all together with another invocation of \`.run_commands\`.

\`\`\`python
QUANTIZATION_ARGS = f"--dtype={DTYPE} --qformat={QFORMAT} --kv_cache_dtype={KV_CACHE_DTYPE} --calib_size={CALIB_SIZE}"

CKPT_DIR = "/root/model/model_ckpt"
tensorrt_image = (  # update the image by quantizing the model
    tensorrt_image.run_commands(  # takes ~2 minutes
        [
            f"wget {CONVERSION_SCRIPT_URL} -O /root/convert.py",
            f"python /root/convert.py --model_dir={MODEL_DIR} --output_dir={CKPT_DIR}"
            + f" --tp_size={N_GPUS}"
            + f" {QUANTIZATION_ARGS}",
        ],
        gpu=GPU_CONFIG,
    )
)

\`\`\`

## Compiling the engine

TensorRT-LLM achieves its high throughput primarily by compiling the model:
making concrete choices of CUDA kernels to execute for each operation.
These kernels are much more specific than \`matrix_multiply\` or \`softmax\` --
they have names like \`maxwell_scudnn_winograd_128x128_ldg1_ldg4_tile148t_nt\`.
They are optimized for the specific types and shapes of tensors that the model uses
and for the specific hardware that the model runs on.

That means we need to know all of that information a priori --
more like the original TensorFlow, which defined static graphs, than like PyTorch,
which builds up a graph of kernels dynamically at runtime.

This extra layer of constraint on our LLM service is an important part of
what allows TensorRT-LLM to achieve its high throughput.

So we need to specify things like the maximum batch size and the lengths of inputs and outputs.
The closer these are to the actual values we'll use in production, the better the throughput we'll get.

Since we want to maximize the throughput, assuming we had a constant workload,
we set the batch size to the largest value we can fit in GPU RAM.
Quantization helps us again here, since it allows us to fit more tokens in the same RAM.

\`\`\`python
MAX_INPUT_LEN, MAX_OUTPUT_LEN = 256, 256
MAX_NUM_TOKENS = 2**17
MAX_BATCH_SIZE = 1024  # better throughput at larger batch sizes, limited by GPU RAM
ENGINE_DIR = "/root/model/model_output"

SIZE_ARGS = f"--max_input_len={MAX_INPUT_LEN} --max_num_tokens={MAX_NUM_TOKENS} --max_batch_size={MAX_BATCH_SIZE}"

\`\`\`

There are many additional options you can pass to \`trtllm-build\` to tune the engine for your specific workload.
You can find the document we used for LLaMA
[here](https://github.com/NVIDIA/TensorRT-LLM/tree/b0880169d0fb8cd0363049d91aa548e58a41be07/examples/llama),
which you can use to adjust the arguments to fit your workloads,
e.g. adjusting rotary embeddings and block sizes for longer contexts.
For more performance tuning tips, check out [NVIDIA's official TensorRT-LLM performance guide](https://nvidia.github.io/TensorRT-LLM/0.21.0rc1/performance/performance-tuning-guide/index.html).

To make best use of our 8bit floating point hardware, and the weights and KV cache we have quantized,
we activate the 8bit floating point fused multi-head attention plugin.

Because we are targeting maximum throughput, we do not activate the low latency 8bit floating point matrix multiplication plugin
or the 8bit floating point matrix multiplication (\`gemm\`) plugin, which documentation indicates target smaller batch sizes.

\`\`\`python
PLUGIN_ARGS = "--use_fp8_context_fmha enable"

\`\`\`

We put all of this together with another invocation of \`.run_commands\`.

\`\`\`python
tensorrt_image = (  # update the image by building the TensorRT engine
    tensorrt_image.run_commands(  # takes ~5 minutes
        [
            f"trtllm-build --checkpoint_dir {CKPT_DIR} --output_dir {ENGINE_DIR}"
            + f" --workers={N_GPUS}"
            + f" {SIZE_ARGS}"
            + f" {PLUGIN_ARGS}"
        ],
        gpu=GPU_CONFIG,  # TRT-LLM compilation is GPU-specific, so make sure this matches production!
    ).env(  # show more log information from the inference engine
        {"TLLM_LOG_LEVEL": "INFO"}
    )
)

\`\`\`

## Serving inference at tens of thousands of tokens per second

Now that we have the engine compiled, we can serve it with Modal by creating an \`App\`.

\`\`\`python
app = modal.App("example-trtllm-throughput", image=tensorrt_image)

\`\`\`

Thanks to our custom container runtime system even this large, many gigabyte container boots in seconds.

At container start time, we boot up the engine, which completes in under 30 seconds.
Container starts are triggered when Modal scales up your infrastructure,
like the first time you run this code or the first time a request comes in after a period of inactivity.

Container lifecycles in Modal are managed via our \`Cls\` interface, so we define one below
to manage the engine and run inference.
For details, see [this guide](https://modal.com/docs/guide/lifecycle-functions).

\`\`\`python
@app.cls(
    gpu=GPU_CONFIG,
    scaledown_window=10 * MINUTES,
    image=tensorrt_image,
)
class Model:
    @modal.enter()
    def load(self):
        """Loads the TRT-LLM engine and configures our tokenizer.

        The @enter decorator ensures that it runs only once per container, when it starts."""
        import time

        print(
            f"{COLOR['HEADER']}🥶 Cold boot: spinning up TRT-LLM engine{COLOR['ENDC']}"
        )
        self.init_start = time.monotonic_ns()

        import tensorrt_llm
        from tensorrt_llm.runtime import ModelRunner
        from transformers import AutoTokenizer

        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        # LLaMA models do not have a padding token, so we use the EOS token
        self.tokenizer.add_special_tokens({"pad_token": self.tokenizer.eos_token})
        # and then we add it from the left, to minimize impact on the output
        self.tokenizer.padding_side = "left"
        self.pad_id = self.tokenizer.pad_token_id
        self.end_id = self.tokenizer.eos_token_id

        runner_kwargs = dict(
            engine_dir=f"{ENGINE_DIR}",
            lora_dir=None,
            rank=tensorrt_llm.mpi_rank(),  # this will need to be adjusted to use multiple GPUs
            max_output_len=MAX_OUTPUT_LEN,
        )

        self.model = ModelRunner.from_dir(**runner_kwargs)

        self.init_duration_s = (time.monotonic_ns() - self.init_start) / 1e9
        print(
            f"{COLOR['HEADER']}🚀 Cold boot finished in {self.init_duration_s}s{COLOR['ENDC']}"
        )

    @modal.method()
    def generate(self, prompts: list[str], settings=None):
        """Generate responses to a batch of prompts, optionally with custom inference settings."""
        import time

        if settings is None or not settings:
            settings = dict(
                temperature=0.1,  # temperature 0 not allowed, so we set top_k to 1 to get the same effect
                top_k=1,
                stop_words_list=None,
                repetition_penalty=1.1,
            )

        settings["max_new_tokens"] = (
            MAX_OUTPUT_LEN  # exceeding this will raise an error
        )
        settings["end_id"] = self.end_id
        settings["pad_id"] = self.pad_id

        num_prompts = len(prompts)

        if num_prompts > MAX_BATCH_SIZE:
            raise ValueError(
                f"Batch size {num_prompts} exceeds maximum of {MAX_BATCH_SIZE}"
            )

        print(
            f"{COLOR['HEADER']}🚀 Generating completions for batch of size {num_prompts}...{COLOR['ENDC']}"
        )
        start = time.monotonic_ns()

        parsed_prompts = [
            self.tokenizer.apply_chat_template(
                [{"role": "user", "content": prompt}],
                add_generation_prompt=True,
                tokenize=False,
            )
            for prompt in prompts
        ]

        print(
            f"{COLOR['HEADER']}Parsed prompts:{COLOR['ENDC']}",
            *parsed_prompts,
            sep="\\n\\t",
        )

        inputs_t = self.tokenizer(
            parsed_prompts, return_tensors="pt", padding=True, truncation=False
        )["input_ids"]

        print(f"{COLOR['HEADER']}Input tensors:{COLOR['ENDC']}", inputs_t[:, :8])

        outputs_t = self.model.generate(inputs_t, **settings)

        outputs_text = self.tokenizer.batch_decode(
            outputs_t[:, 0]
        )  # only one output per input, so we index with 0

        responses = [
            extract_assistant_response(output_text) for output_text in outputs_text
        ]
        duration_s = (time.monotonic_ns() - start) / 1e9

        num_tokens = sum(map(lambda r: len(self.tokenizer.encode(r)), responses))

        for prompt, response in zip(prompts, responses):
            print(
                f"{COLOR['HEADER']}{COLOR['GREEN']}{prompt}",
                f"\\n{COLOR['BLUE']}{response}",
                "\\n\\n",
                sep=COLOR["ENDC"],
            )
            time.sleep(0.05)  # to avoid log truncation

        print(
            f"{COLOR['HEADER']}{COLOR['GREEN']}Generated {num_tokens} tokens from {MODEL_ID} in {duration_s:.1f} seconds,"
            f" throughput = {num_tokens / duration_s:.0f} tokens/second for batch of size {num_prompts} on {GPU_CONFIG}.{COLOR['ENDC']}"
        )

        return responses


\`\`\`

## Calling our inference function

Now, how do we actually run the model?

There are two basic methods: from Python via our SDK or from anywhere, by setting up an API.

### Calling inference from Python

To run our \`Model\`'s \`.generate\` method from Python, we just need to call it --
with \`.remote\` appended to run it on Modal.

We wrap that logic in a \`local_entrypoint\` so you can run it from the command line with
\`\`\`bash
modal run trtllm_throughput.py
\`\`\`

For simplicity, we hard-code a batch of 128 questions to ask the model,
and then bulk it up to a batch size of 1024 by appending seven distinct prefixes.
These prefixes ensure KV cache misses for the remainder of the generations,
to keep the benchmark closer to what can be expected in a real workload.

\`\`\`python
@app.local_entrypoint()
def main():
    questions = [
        # Generic assistant questions
        "What are you?",
        "What can you do?",
        # Coding
        "Implement a Python function to compute the Fibonacci numbers.",
        "Write a Rust function that performs binary exponentiation.",
        "How do I allocate memory in C?",
        "What are the differences between Javascript and Python?",
        "How do I find invalid indices in Postgres?",
        "How can you implement a LRU (Least Recently Used) cache in Python?",
        "What approach would you use to detect and prevent race conditions in a multithreaded application?",
        "Can you explain how a decision tree algorithm works in machine learning?",
        "How would you design a simple key-value store database from scratch?",
        "How do you handle deadlock situations in concurrent programming?",
        "What is the logic behind the A* search algorithm, and where is it used?",
        "How can you design an efficient autocomplete system?",
        "What approach would you take to design a secure session management system in a web application?",
        "How would you handle collision in a hash table?",
        "How can you implement a load balancer for a distributed system?",
        "Implement a Python class for a doubly linked list.",
        "Write a Haskell function that generates prime numbers using the Sieve of Eratosthenes.",
        "Develop a simple HTTP server in Rust.",
        # Literate and creative writing
        "What is the fable involving a fox and grapes?",
        "Who does Harry turn into a balloon?",
        "Write a story in the style of James Joyce about a trip to the Australian outback in 2083 to see robots in the beautiful desert.",
        "Write a tale about a time-traveling historian who's determined to witness the most significant events in human history.",
        "Describe a day in the life of a secret agent who's also a full-time parent.",
        "Create a story about a detective who can communicate with animals.",
        "What is the most unusual thing about living in a city floating in the clouds?",
        "In a world where dreams are shared, what happens when a nightmare invades a peaceful dream?",
        "Describe the adventure of a lifetime for a group of friends who found a map leading to a parallel universe.",
        "Tell a story about a musician who discovers that their music has magical powers.",
        "In a world where people age backwards, describe the life of a 5-year-old man.",
        "Create a tale about a painter whose artwork comes to life every night.",
        "What happens when a poet's verses start to predict future events?",
        "Imagine a world where books can talk. How does a librarian handle them?",
        "Tell a story about an astronaut who discovered a planet populated by plants.",
        "Describe the journey of a letter traveling through the most sophisticated postal service ever.",
        "Write a tale about a chef whose food can evoke memories from the eater's past.",
        "Write a poem in the style of Walt Whitman about the modern digital world.",
        "Create a short story about a society where people can only speak in metaphors.",
        "What are the main themes in Dostoevsky's 'Crime and Punishment'?",
        # History and Philosophy
        "What were the major contributing factors to the fall of the Roman Empire?",
        "How did the invention of the printing press revolutionize European society?",
        "What are the effects of quantitative easing?",
        "How did the Greek philosophers influence economic thought in the ancient world?",
        "What were the economic and philosophical factors that led to the fall of the Soviet Union?",
        "How did decolonization in the 20th century change the geopolitical map?",
        "What was the influence of the Khmer Empire on Southeast Asia's history and culture?",
        "What led to the rise and fall of the Mongol Empire?",
        "Discuss the effects of the Industrial Revolution on urban development in 19th century Europe.",
        "How did the Treaty of Versailles contribute to the outbreak of World War II?",
        "What led to the rise and fall of the Mongol Empire?",
        "Discuss the effects of the Industrial Revolution on urban development in 19th century Europe.",
        "How did the Treaty of Versailles contribute to the outbreak of World War II?",
        "Explain the concept of 'tabula rasa' in John Locke's philosophy.",
        "What does Nietzsche mean by 'ressentiment'?",
        "Compare and contrast the early and late works of Ludwig Wittgenstein. Which do you prefer?",
        "How does the trolley problem explore the ethics of decision-making in critical situations?",
        # Thoughtfulness
        "Describe the city of the future, considering advances in technology, environmental changes, and societal shifts.",
        "In a dystopian future where water is the most valuable commodity, how would society function?",
        "If a scientist discovers immortality, how could this impact society, economy, and the environment?",
        "What could be the potential implications of contact with an advanced alien civilization?",
        "Describe how you would mediate a conflict between two roommates about doing the dishes using techniques of non-violent communication.",
        "If you could design a school curriculum for the future, what subjects would you include to prepare students for the next 50 years?",
        "How would society change if teleportation was invented and widely accessible?",
        "Consider a future where artificial intelligence governs countries. What are the potential benefits and pitfalls?",
        # Math
        "What is the product of 9 and 8?",
        "If a train travels 120 kilometers in 2 hours, what is its average speed?",
        "Think through this step by step. If the sequence a_n is defined by a_1 = 3, a_2 = 5, and a_n = a_(n-1) + a_(n-2) for n > 2, find a_6.",
        "Think through this step by step. Calculate the sum of an arithmetic series with first term 3, last term 35, and total terms 11.",
        "Think through this step by step. What is the area of a triangle with vertices at the points (1,2), (3,-4), and (-2,5)?",
        "Think through this step by step. Solve the following system of linear equations: 3x + 2y = 14, 5x - y = 15.",
        # Facts
        "Who was Emperor Norton I, and what was his significance in San Francisco's history?",
        "What is the Voynich manuscript, and why has it perplexed scholars for centuries?",
        "What was Project A119 and what were its objectives?",
        "What is the 'Dyatlov Pass incident' and why does it remain a mystery?",
        "What is the 'Emu War' that took place in Australia in the 1930s?",
        "What is the 'Phantom Time Hypothesis' proposed by Heribert Illig?",
        "Who was the 'Green Children of Woolpit' as per 12th-century English legend?",
        "What are 'zombie stars' in the context of astronomy?",
        "Who were the 'Dog-Headed Saint' and the 'Lion-Faced Saint' in medieval Christian traditions?",
        "What is the story of the 'Globsters', unidentified organic masses washed up on the shores?",
        "Which countries in the European Union use currencies other than the Euro, and what are those currencies?",
        # Multilingual
        "战国时期最重要的人物是谁?",
        "Tuende hatua kwa hatua. Hesabu jumla ya mfululizo wa kihesabu wenye neno la kwanza 2, neno la mwisho 42, na jumla ya maneno 21.",
        "Kannst du die wichtigsten Eigenschaften und Funktionen des NMDA-Rezeptors beschreiben?",
        "¿Cuáles son los principales impactos ambientales de la deforestación en la Amazonía?",
        "Décris la structure et le rôle de la mitochondrie dans une cellule.",
        "Какие были социальные последствия Перестройки в Советском Союзе?",
        # Economics and Business
        "What are the principles of behavioral economics and how do they influence consumer choices?",
        "Discuss the impact of blockchain technology on traditional banking systems.",
        "What are the long-term effects of trade wars on global economic stability?",
        "What is the law of supply and demand?",
        "Explain the concept of inflation and its typical causes.",
        "What is a trade deficit, and why does it matter?",
        "How do interest rates affect consumer spending and saving?",
        "What is GDP and why is it important for measuring economic health?",
        "What is the difference between revenue and profit?",
        "Describe the role of a business plan in startup success.",
        "How does market segmentation benefit a company?",
        "Explain the concept of brand equity.",
        "What are the advantages of franchising a business?",
        "What are Michael Porter's five forces and how do they impact strategy for tech startups?",
        # Science and Technology
        "Discuss the potential impacts of quantum computing on data security.",
        "How could CRISPR technology change the future of medical treatments?",
        "Explain the significance of graphene in the development of future electronics.",
        "How do renewable energy sources compare to fossil fuels in terms of environmental impact?",
        "What are the most promising technologies for carbon capture and storage?",
        "Explain why the sky is blue.",
        "What is the principle behind the operation of a microwave oven?",
        "How does Newton's third law apply to rocket propulsion?",
        "What causes iron to rust?",
        "Describe the process of photosynthesis in simple terms.",
        "What is the role of a catalyst in a chemical reaction?",
        "What is the basic structure of a DNA molecule?",
        "How do vaccines work to protect the body from disease?",
        "Explain the significance of mitosis in cellular reproduction.",
        "What are tectonic plates and how do they affect earthquakes?",
        "How does the greenhouse effect contribute to global warming?",
        "Describe the water cycle and its importance to Earth's climate.",
        "What causes the phases of the Moon?",
        "How do black holes form?",
        "Explain the significance of the Big Bang theory.",
        "What is the function of the CPU in a computer system?",
        "Explain the difference between RAM and ROM.",
        "How does a solid-state drive (SSD) differ from a hard disk drive (HDD)?",
        "What role does the motherboard play in a computer system?",
        "Describe the purpose and function of a GPU.",
        "What is TensorRT? What role does it play in neural network inference?",
    ]

    prefixes = [
        "Hi! ",
        "Hello! ",
        "Hi. ",
        "Hello. ",
        "Hi: ",
        "Hello: ",
        "Greetings. ",
    ]
    # prepending any string that causes a tokenization change is enough to invalidate KV cache
    for ii, prefix in enumerate(prefixes):
        questions += [prefix + question for question in questions[:128]]

    model = Model()
    model.generate.remote(questions)
    # if you're calling this service from another Python project,
    # use [\`Model.lookup\`](https://modal.com/docs/reference/modal.Cls#lookup)


\`\`\`

### Calling inference via an API

We can use \`modal.fastapi_endpoint\` with \`app.function\` to turn any Python function into a web API.

This API wrapper doesn't need all the dependencies of the core inference service,
so we switch images here to a basic Linux image, \`debian_slim\`, and add the FastAPI stack.

\`\`\`python
web_image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "fastapi[standard]==0.115.4",
    "pydantic==2.9.2",
    "starlette==0.41.2",
)


\`\`\`

From there, we can take the same remote generation logic we used in \`main\`
and serve it with only a few more lines of code.

\`\`\`python
class GenerateRequest(pydantic.BaseModel):
    prompts: list[str]
    settings: Optional[dict] = None


@app.function(image=web_image)
@modal.fastapi_endpoint(
    method="POST", label=f"{MODEL_ID.lower().split('/')[-1]}-web", docs=True
)
def generate_web(data: GenerateRequest) -> list[str]:
    """Generate responses to a batch of prompts, optionally with custom inference settings."""
    return Model.generate.remote(data.prompts, settings=None)


\`\`\`

To set our function up as a Web Function, we need to run this file --
with \`modal serve\` to create a hot-reloading development server or \`modal deploy\` to deploy it to production.

\`\`\`bash
modal serve trtllm_throughput.py
\`\`\`

The URL for the endpoint appears in the output of the \`modal serve\` or \`modal deploy\` command.
Add \`/docs\` to the end of this URL to see the interactive Swagger documentation for the endpoint.

You can also test the endpoint by sending a POST request with \`curl\` from another terminal:

\`\`\`bash
curl -X POST url-from-output-of-modal-serve-here \\
-H "Content-Type: application/json" \\
-d '{
    "prompts": ["Tell me a joke", "Describe a dream you had recently", "Share your favorite childhood memory"]
}' | python -m json.tool # python for pretty-printing, optional
\`\`\`

And now you have a high-throughput, low-latency, autoscaling API for serving LLM completions!

## Footer

The rest of the code in this example is utility code.

\`\`\`python
COLOR = {
    "HEADER": "\\033[95m",
    "BLUE": "\\033[94m",
    "GREEN": "\\033[92m",
    "RED": "\\033[91m",
    "ENDC": "\\033[0m",
}


def extract_assistant_response(output_text):
    """Model-specific code to extract model responses.

    See this doc for LLaMA 3: https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3/."""
    # Split the output text by the assistant header token
    parts = output_text.split("<|start_header_id|>assistant<|end_header_id|>")

    if len(parts) > 1:
        # Join the parts after the first occurrence of the assistant header token
        response = parts[1].split("<|eot_id|>")[0].strip()

        # Remove any remaining special tokens and whitespace
        response = response.replace("<|eot_id|>", "").strip()

        return response
    else:
        return output_text

\`\`\`
`,meta:{title:`Serverless TensorRT-LLM (LLaMA 3 8B)`,description:`In this example, we demonstrate how to use the TensorRT-LLM framework to serve Meta’s LLaMA 3 8B model at very high throughput.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>In this example, we demonstrate how to use the TensorRT-LLM framework to serve Meta’s LLaMA 3 8B model
at very high throughput.</p> <p>We achieve a total throughput of over 25,000 output tokens per second on a single NVIDIA H100 GPU.
At <!> of ~$4/hr, that’s under $0.05 per million tokens —
on auto-scaling infrastructure and served via a customizable API.</p> <!> <p>This guide is intended to document two things:
the general process for building TensorRT-LLM on Modal
and a specific configuration for serving the LLaMA 3 8B model.</p> <!> <p>Any given TensorRT-LLM service requires a multi-stage build process,
starting from model weights and ending with a compiled engine.
Because that process touches many sharp-edged high-performance components
across the stack, it can easily go wrong in subtle and hard-to-debug ways
that are idiosyncratic to specific systems.
And debugging GPU workloads is expensive!</p> <p>This example builds an entire service from scratch, from downloading weight tensors
to responding to requests, and so serves as living, interactive documentation of a TensorRT-LLM
build process that works on Modal.</p> <!> <p>TensorRT-LLM is the Lamborghini of inference engines: it achieves seriously
impressive performance, but only if you tune it carefully.
We carefully document the choices we made here and point to additional resources
so you know where and how you might adjust the parameters for your use case.</p> <!> <p>To run TensorRT-LLM, we must first install it. Easier said than done!</p> <p>In Modal, we define <!> that run our serverless workloads.
All Modal containers have access to GPU drivers via the underlying host environment,
but we still need to install the software stack on top of the drivers, from the CUDA runtime up.</p> <p>We start from an official <code>nvidia/cuda</code> image,
which includes the CUDA runtime & development libraries
and the environment configuration necessary to run them.</p> <!> <p>On top of that, we add some system dependencies of TensorRT-LLM,
including OpenMPI for distributed communication, some core software like <code>git</code>,
and the <code>tensorrt_llm</code> package itself.</p> <!> <p>Note that we’re doing this by <!> a number of calls to methods on the <code>modal.Image</code>. If you’re familiar with
Dockerfiles, you can think of this as a Pythonic interface to instructions like <code>RUN</code> and <code>CMD</code>.</p> <p>End-to-end, this step takes five minutes.
If you’re reading this from top to bottom,
you might want to stop here and execute the example
with <code>modal run trtllm_throughput.py</code> so that it runs in the background while you read the rest.</p> <!> <p>Next, we download the model we want to serve. In this case, we’re using the instruction-tuned
version of Meta’s LLaMA 3 8B model.
We use the function below to download the model from the Hugging Face Hub.</p> <!> <p>Just defining that function doesn’t actually download the model, though.
We can run it by adding it to the image’s build process with <code>run_function</code>.
The download process has its own dependencies, which we add here.</p> <!> <!> <p>The amount of GPU RAM on a single card is a tight constraint for most LLMs:
RAM is measured in billions of bytes and models have billions of parameters.
The performance cliff if you need to spill to CPU memory is steep,
so all of those parameters must fit in the GPU memory,
along with other things like the KV cache.</p> <p>The simplest way to reduce LLM inference’s RAM requirements is to make the model’s parameters smaller,
to fit their values in a smaller number of bits, like four or eight. This is known as <em>quantization</em>.</p> <p>We use a quantization script provided by the TensorRT-LLM team.
This script takes a few minutes to run.</p> <!> <p>NVIDIA’s Ada Lovelace/Hopper chips, like the 4090, L40S, and H100,
are capable of native calculations in 8bit floating point numbers, so we choose that as our quantization format (<code>qformat</code>).
These GPUs are capable of twice as many floating point operations per second in 8bit as in 16bit —
about two quadrillion per second on an H100 SXM.</p> <!> <p>Quantization is lossy, but the impact on model quality can be minimized by
tuning the quantization parameters based on target outputs.</p> <!> <p>We put that all together with another invocation of <code>.run_commands</code>.</p> <!> <!> <p>TensorRT-LLM achieves its high throughput primarily by compiling the model:
making concrete choices of CUDA kernels to execute for each operation.
These kernels are much more specific than <code>matrix_multiply</code> or <code>softmax</code> —
they have names like <code>maxwell_scudnn_winograd_128x128_ldg1_ldg4_tile148t_nt</code>.
They are optimized for the specific types and shapes of tensors that the model uses
and for the specific hardware that the model runs on.</p> <p>That means we need to know all of that information a priori —
more like the original TensorFlow, which defined static graphs, than like PyTorch,
which builds up a graph of kernels dynamically at runtime.</p> <p>This extra layer of constraint on our LLM service is an important part of
what allows TensorRT-LLM to achieve its high throughput.</p> <p>So we need to specify things like the maximum batch size and the lengths of inputs and outputs.
The closer these are to the actual values we’ll use in production, the better the throughput we’ll get.</p> <p>Since we want to maximize the throughput, assuming we had a constant workload,
we set the batch size to the largest value we can fit in GPU RAM.
Quantization helps us again here, since it allows us to fit more tokens in the same RAM.</p> <!> <p>There are many additional options you can pass to <code>trtllm-build</code> to tune the engine for your specific workload.
You can find the document we used for LLaMA <!>,
which you can use to adjust the arguments to fit your workloads,
e.g. adjusting rotary embeddings and block sizes for longer contexts.
For more performance tuning tips, check out <!>.</p> <p>To make best use of our 8bit floating point hardware, and the weights and KV cache we have quantized,
we activate the 8bit floating point fused multi-head attention plugin.</p> <p>Because we are targeting maximum throughput, we do not activate the low latency 8bit floating point matrix multiplication plugin
or the 8bit floating point matrix multiplication (<code>gemm</code>) plugin, which documentation indicates target smaller batch sizes.</p> <!> <p>We put all of this together with another invocation of <code>.run_commands</code>.</p> <!> <!> <p>Now that we have the engine compiled, we can serve it with Modal by creating an <code>App</code>.</p> <!> <p>Thanks to our custom container runtime system even this large, many gigabyte container boots in seconds.</p> <p>At container start time, we boot up the engine, which completes in under 30 seconds.
Container starts are triggered when Modal scales up your infrastructure,
like the first time you run this code or the first time a request comes in after a period of inactivity.</p> <p>Container lifecycles in Modal are managed via our <code>Cls</code> interface, so we define one below
to manage the engine and run inference.
For details, see <!>.</p> <!> <!> <p>Now, how do we actually run the model?</p> <p>There are two basic methods: from Python via our SDK or from anywhere, by setting up an API.</p> <!> <p>To run our <code>Model</code>’s <code>.generate</code> method from Python, we just need to call it —
with <code>.remote</code> appended to run it on Modal.</p> <p>We wrap that logic in a <code>local_entrypoint</code> so you can run it from the command line with</p> <!> <p>For simplicity, we hard-code a batch of 128 questions to ask the model,
and then bulk it up to a batch size of 1024 by appending seven distinct prefixes.
These prefixes ensure KV cache misses for the remainder of the generations,
to keep the benchmark closer to what can be expected in a real workload.</p> <!> <!> <p>We can use <code>modal.fastapi_endpoint</code> with <code>app.function</code> to turn any Python function into a web API.</p> <p>This API wrapper doesn’t need all the dependencies of the core inference service,
so we switch images here to a basic Linux image, <code>debian_slim</code>, and add the FastAPI stack.</p> <!> <p>From there, we can take the same remote generation logic we used in <code>main</code> and serve it with only a few more lines of code.</p> <!> <p>To set our function up as a Web Function, we need to run this file —
with <code>modal serve</code> to create a hot-reloading development server or <code>modal deploy</code> to deploy it to production.</p> <!> <p>The URL for the endpoint appears in the output of the <code>modal serve</code> or <code>modal deploy</code> command.
Add <code>/docs</code> to the end of this URL to see the interactive Swagger documentation for the endpoint.</p> <p>You can also test the endpoint by sending a POST request with <code>curl</code> from another terminal:</p> <!> <p>And now you have a high-throughput, low-latency, autoscaling API for serving LLM completions!</p> <!> <p>The rest of the code in this example is utility code.</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`serverless-tensorrt-llm-llama-3-8b`,children:(e,t)=>{l(),i(e,r(`Serverless TensorRT-LLM (LLaMA 3 8B)`))},$$slots:{default:!0}});var g=c(m,4);h(c(e(g)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal’s on-demand rate`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`overview`,children:(e,t)=>{l(),i(e,r(`Overview`))},$$slots:{default:!0}});var v=c(_,4);d(v,{id:`build-process`,children:(e,t)=>{l(),i(e,r(`Build process`))},$$slots:{default:!0}});var y=c(v,6);d(y,{id:`engine-configuration`,children:(e,t)=>{l(),i(e,r(`Engine configuration`))},$$slots:{default:!0}});var x=c(y,4);u(x,{id:`installing-tensorrt-llm`,children:(e,t)=>{l(),i(e,r(`Installing TensorRT-LLM`))},$$slots:{default:!0}});var S=c(x,4);h(c(e(S)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container images`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,4);p(C,{code:`from%20typing%20import%20Optional%0A%0Aimport%20modal%0Aimport%20pydantic%20%20%23%20for%20typing%2C%20used%20later%0A%0Atensorrt_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22nvidia%2Fcuda%3A12.4.1-devel-ubuntu22.04%22%2C%0A%20%20%20%20add_python%3D%223.10%22%2C%20%20%23%20TRT-LLM%20requires%20Python%203.10%0A).entrypoint(%5B%5D)%20%20%23%20remove%20verbose%20logging%20by%20base%20image%20on%20entry%0A`,lang:`python`});var w=c(C,4);p(w,{code:`tensorrt_image%20%3D%20tensorrt_image.apt_install(%0A%20%20%20%20%22openmpi-bin%22%2C%20%22libopenmpi-dev%22%2C%20%22git%22%2C%20%22git-lfs%22%2C%20%22wget%22%0A).uv_pip_install(%0A%20%20%20%20%22tensorrt_llm%3D%3D0.14.0%22%2C%0A%20%20%20%20%22pynvml%3C12%22%2C%20%20%23%20avoid%20breaking%20change%20to%20pynvml%20version%20API%0A%20%20%20%20%22cuda-python%3D%3D12.9.1%22%2C%0A%20%20%20%20pre%3DTrue%2C%0A%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fpypi.nvidia.com%22%2C%0A%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A)%0A`,lang:`python`});var T=c(w,2);h(c(e(T)),{href:`https://quanticdev.com/articles/method-chaining/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`method-chaining`))},$$slots:{default:!0}}),l(7),n(T);var E=c(T,4);u(E,{id:`downloading-the-model`,children:(e,t)=>{l(),i(e,r(`Downloading the Model`))},$$slots:{default:!0}});var D=c(E,4);p(D,{code:`MODEL_DIR%20%3D%20%22%2Froot%2Fmodel%2Fmodel_input%22%0AMODEL_ID%20%3D%20%22NousResearch%2FMeta-Llama-3-8B-Instruct%22%20%20%23%20fork%20without%20repo%20gating%0AMODEL_REVISION%20%3D%20%22b1532e4dee724d9ba63fe17496f298254d87ca64%22%20%20%23%20pin%20model%20revisions%20to%20prevent%20unexpected%20changes!%0A%0A%0Adef%20download_model()%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%20%20%20%20from%20transformers.utils%20import%20move_cache%0A%0A%20%20%20%20os.makedirs(MODEL_DIR%2C%20exist_ok%3DTrue)%0A%20%20%20%20snapshot_download(%0A%20%20%20%20%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20local_dir%3DMODEL_DIR%2C%0A%20%20%20%20%20%20%20%20ignore_patterns%3D%5B%22*.pt%22%2C%20%22*.bin%22%5D%2C%20%20%23%20using%20safetensors%0A%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20)%0A%20%20%20%20move_cache()%0A%0A`,lang:`python`});var O=c(D,4);p(O,{code:`MINUTES%20%3D%2060%20%20%23%20seconds%0Atensorrt_image%20%3D%20(%20%20%23%20update%20the%20image%20by%20downloading%20the%20model%20we're%20using%0A%20%20%20%20tensorrt_image.uv_pip_install(%20%20%23%20add%20utilities%20for%20downloading%20the%20model%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22requests~%3D2.32.2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%20%20%23%20hf-xet%3A%20faster%20downloads%0A%20%20%20%20%20%20%20%20%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%0A%20%20%20%20)%0A%20%20%20%20.run_function(%20%20%23%20download%20the%20model%0A%20%20%20%20%20%20%20%20download_model%2C%0A%20%20%20%20%20%20%20%20timeout%3D20%20*%20MINUTES%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var k=c(O,2);u(k,{id:`quantization`,children:(e,t)=>{l(),i(e,r(`Quantization`))},$$slots:{default:!0}});var A=c(k,8);p(A,{code:`GIT_HASH%20%3D%20%22b0880169d0fb8cd0363049d91aa548e58a41be07%22%0ACONVERSION_SCRIPT_URL%20%3D%20f%22https%3A%2F%2Fraw.githubusercontent.com%2FNVIDIA%2FTensorRT-LLM%2F%7BGIT_HASH%7D%2Fexamples%2Fquantization%2Fquantize.py%22%0A`,lang:`python`});var j=c(A,4);p(j,{code:`N_GPUS%20%3D%201%20%20%23%20Heads%20up%3A%20this%20example%20has%20not%20yet%20been%20tested%20with%20multiple%20GPUs%0AGPU_CONFIG%20%3D%20f%22H100%3A%7BN_GPUS%7D%22%0A%0ADTYPE%20%3D%20%22float16%22%20%20%23%20format%20we%20download%20in%2C%20regular%20fp16%0AQFORMAT%20%3D%20%22fp8%22%20%20%23%20format%20we%20quantize%20the%20weights%20to%0AKV_CACHE_DTYPE%20%3D%20%22fp8%22%20%20%23%20format%20we%20quantize%20the%20KV%20cache%20to%0A`,lang:`python`});var M=c(j,4);p(M,{code:`CALIB_SIZE%20%3D%20%22512%22%20%20%23%20size%20of%20calibration%20dataset%0A`,lang:`python`});var N=c(M,4);p(N,{code:`QUANTIZATION_ARGS%20%3D%20f%22--dtype%3D%7BDTYPE%7D%20--qformat%3D%7BQFORMAT%7D%20--kv_cache_dtype%3D%7BKV_CACHE_DTYPE%7D%20--calib_size%3D%7BCALIB_SIZE%7D%22%0A%0ACKPT_DIR%20%3D%20%22%2Froot%2Fmodel%2Fmodel_ckpt%22%0Atensorrt_image%20%3D%20(%20%20%23%20update%20the%20image%20by%20quantizing%20the%20model%0A%20%20%20%20tensorrt_image.run_commands(%20%20%23%20takes%20~2%20minutes%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22wget%20%7BCONVERSION_SCRIPT_URL%7D%20-O%20%2Froot%2Fconvert.py%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22python%20%2Froot%2Fconvert.py%20--model_dir%3D%7BMODEL_DIR%7D%20--output_dir%3D%7BCKPT_DIR%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20f%22%20--tp_size%3D%7BN_GPUS%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20f%22%20%7BQUANTIZATION_ARGS%7D%22%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var P=c(N,2);u(P,{id:`compiling-the-engine`,children:(e,t)=>{l(),i(e,r(`Compiling the engine`))},$$slots:{default:!0}});var F=c(P,12);p(F,{code:`MAX_INPUT_LEN%2C%20MAX_OUTPUT_LEN%20%3D%20256%2C%20256%0AMAX_NUM_TOKENS%20%3D%202**17%0AMAX_BATCH_SIZE%20%3D%201024%20%20%23%20better%20throughput%20at%20larger%20batch%20sizes%2C%20limited%20by%20GPU%20RAM%0AENGINE_DIR%20%3D%20%22%2Froot%2Fmodel%2Fmodel_output%22%0A%0ASIZE_ARGS%20%3D%20f%22--max_input_len%3D%7BMAX_INPUT_LEN%7D%20--max_num_tokens%3D%7BMAX_NUM_TOKENS%7D%20--max_batch_size%3D%7BMAX_BATCH_SIZE%7D%22%0A`,lang:`python`});var I=c(F,2),L=c(e(I),3);h(L,{href:`https://github.com/NVIDIA/TensorRT-LLM/tree/b0880169d0fb8cd0363049d91aa548e58a41be07/examples/llama`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),h(c(L,2),{href:`https://nvidia.github.io/TensorRT-LLM/0.21.0rc1/performance/performance-tuning-guide/index.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA’s official TensorRT-LLM performance guide`))},$$slots:{default:!0}}),l(),n(I);var R=c(I,6);p(R,{code:`PLUGIN_ARGS%20%3D%20%22--use_fp8_context_fmha%20enable%22%0A`,lang:`python`});var z=c(R,4);p(z,{code:`tensorrt_image%20%3D%20(%20%20%23%20update%20the%20image%20by%20building%20the%20TensorRT%20engine%0A%20%20%20%20tensorrt_image.run_commands(%20%20%23%20takes%20~5%20minutes%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22trtllm-build%20--checkpoint_dir%20%7BCKPT_DIR%7D%20--output_dir%20%7BENGINE_DIR%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20f%22%20--workers%3D%7BN_GPUS%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20f%22%20%7BSIZE_ARGS%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20f%22%20%7BPLUGIN_ARGS%7D%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20gpu%3DGPU_CONFIG%2C%20%20%23%20TRT-LLM%20compilation%20is%20GPU-specific%2C%20so%20make%20sure%20this%20matches%20production!%0A%20%20%20%20).env(%20%20%23%20show%20more%20log%20information%20from%20the%20inference%20engine%0A%20%20%20%20%20%20%20%20%7B%22TLLM_LOG_LEVEL%22%3A%20%22INFO%22%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var B=c(z,2);u(B,{id:`serving-inference-at-tens-of-thousands-of-tokens-per-second`,children:(e,t)=>{l(),i(e,r(`Serving inference at tens of thousands of tokens per second`))},$$slots:{default:!0}});var V=c(B,4);p(V,{code:`app%20%3D%20modal.App(%22example-trtllm-throughput%22%2C%20image%3Dtensorrt_image)%0A`,lang:`python`});var H=c(V,6);h(c(e(H),3),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);p(U,{code:`%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20scaledown_window%3D10%20*%20MINUTES%2C%0A%20%20%20%20image%3Dtensorrt_image%2C%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Loads%20the%20TRT-LLM%20engine%20and%20configures%20our%20tokenizer.%0A%0A%20%20%20%20%20%20%20%20The%20%40enter%20decorator%20ensures%20that%20it%20runs%20only%20once%20per%20container%2C%20when%20it%20starts.%22%22%22%0A%20%20%20%20%20%20%20%20import%20time%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%F0%9F%A5%B6%20Cold%20boot%3A%20spinning%20up%20TRT-LLM%20engine%7BCOLOR%5B'ENDC'%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.init_start%20%3D%20time.monotonic_ns()%0A%0A%20%20%20%20%20%20%20%20import%20tensorrt_llm%0A%20%20%20%20%20%20%20%20from%20tensorrt_llm.runtime%20import%20ModelRunner%0A%20%20%20%20%20%20%20%20from%20transformers%20import%20AutoTokenizer%0A%0A%20%20%20%20%20%20%20%20self.tokenizer%20%3D%20AutoTokenizer.from_pretrained(MODEL_ID)%0A%20%20%20%20%20%20%20%20%23%20LLaMA%20models%20do%20not%20have%20a%20padding%20token%2C%20so%20we%20use%20the%20EOS%20token%0A%20%20%20%20%20%20%20%20self.tokenizer.add_special_tokens(%7B%22pad_token%22%3A%20self.tokenizer.eos_token%7D)%0A%20%20%20%20%20%20%20%20%23%20and%20then%20we%20add%20it%20from%20the%20left%2C%20to%20minimize%20impact%20on%20the%20output%0A%20%20%20%20%20%20%20%20self.tokenizer.padding_side%20%3D%20%22left%22%0A%20%20%20%20%20%20%20%20self.pad_id%20%3D%20self.tokenizer.pad_token_id%0A%20%20%20%20%20%20%20%20self.end_id%20%3D%20self.tokenizer.eos_token_id%0A%0A%20%20%20%20%20%20%20%20runner_kwargs%20%3D%20dict(%0A%20%20%20%20%20%20%20%20%20%20%20%20engine_dir%3Df%22%7BENGINE_DIR%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20lora_dir%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20rank%3Dtensorrt_llm.mpi_rank()%2C%20%20%23%20this%20will%20need%20to%20be%20adjusted%20to%20use%20multiple%20GPUs%0A%20%20%20%20%20%20%20%20%20%20%20%20max_output_len%3DMAX_OUTPUT_LEN%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20ModelRunner.from_dir(**runner_kwargs)%0A%0A%20%20%20%20%20%20%20%20self.init_duration_s%20%3D%20(time.monotonic_ns()%20-%20self.init_start)%20%2F%201e9%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%F0%9F%9A%80%20Cold%20boot%20finished%20in%20%7Bself.init_duration_s%7Ds%7BCOLOR%5B'ENDC'%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20prompts%3A%20list%5Bstr%5D%2C%20settings%3DNone)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Generate%20responses%20to%20a%20batch%20of%20prompts%2C%20optionally%20with%20custom%20inference%20settings.%22%22%22%0A%20%20%20%20%20%20%20%20import%20time%0A%0A%20%20%20%20%20%20%20%20if%20settings%20is%20None%20or%20not%20settings%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20settings%20%3D%20dict(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20temperature%3D0.1%2C%20%20%23%20temperature%200%20not%20allowed%2C%20so%20we%20set%20top_k%20to%201%20to%20get%20the%20same%20effect%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20top_k%3D1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stop_words_list%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20repetition_penalty%3D1.1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20settings%5B%22max_new_tokens%22%5D%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20MAX_OUTPUT_LEN%20%20%23%20exceeding%20this%20will%20raise%20an%20error%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20settings%5B%22end_id%22%5D%20%3D%20self.end_id%0A%20%20%20%20%20%20%20%20settings%5B%22pad_id%22%5D%20%3D%20self.pad_id%0A%0A%20%20%20%20%20%20%20%20num_prompts%20%3D%20len(prompts)%0A%0A%20%20%20%20%20%20%20%20if%20num_prompts%20%3E%20MAX_BATCH_SIZE%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Batch%20size%20%7Bnum_prompts%7D%20exceeds%20maximum%20of%20%7BMAX_BATCH_SIZE%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%F0%9F%9A%80%20Generating%20completions%20for%20batch%20of%20size%20%7Bnum_prompts%7D...%7BCOLOR%5B'ENDC'%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20start%20%3D%20time.monotonic_ns()%0A%0A%20%20%20%20%20%20%20%20parsed_prompts%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20self.tokenizer.apply_chat_template(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20add_generation_prompt%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tokenize%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20prompt%20in%20prompts%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7DParsed%20prompts%3A%7BCOLOR%5B'ENDC'%5D%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20*parsed_prompts%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20sep%3D%22%5Cn%5Ct%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20inputs_t%20%3D%20self.tokenizer(%0A%20%20%20%20%20%20%20%20%20%20%20%20parsed_prompts%2C%20return_tensors%3D%22pt%22%2C%20padding%3DTrue%2C%20truncation%3DFalse%0A%20%20%20%20%20%20%20%20)%5B%22input_ids%22%5D%0A%0A%20%20%20%20%20%20%20%20print(f%22%7BCOLOR%5B'HEADER'%5D%7DInput%20tensors%3A%7BCOLOR%5B'ENDC'%5D%7D%22%2C%20inputs_t%5B%3A%2C%20%3A8%5D)%0A%0A%20%20%20%20%20%20%20%20outputs_t%20%3D%20self.model.generate(inputs_t%2C%20**settings)%0A%0A%20%20%20%20%20%20%20%20outputs_text%20%3D%20self.tokenizer.batch_decode(%0A%20%20%20%20%20%20%20%20%20%20%20%20outputs_t%5B%3A%2C%200%5D%0A%20%20%20%20%20%20%20%20)%20%20%23%20only%20one%20output%20per%20input%2C%20so%20we%20index%20with%200%0A%0A%20%20%20%20%20%20%20%20responses%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20extract_assistant_response(output_text)%20for%20output_text%20in%20outputs_text%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20duration_s%20%3D%20(time.monotonic_ns()%20-%20start)%20%2F%201e9%0A%0A%20%20%20%20%20%20%20%20num_tokens%20%3D%20sum(map(lambda%20r%3A%20len(self.tokenizer.encode(r))%2C%20responses))%0A%0A%20%20%20%20%20%20%20%20for%20prompt%2C%20response%20in%20zip(prompts%2C%20responses)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%7BCOLOR%5B'GREEN'%5D%7D%7Bprompt%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%5Cn%7BCOLOR%5B'BLUE'%5D%7D%7Bresponse%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%5Cn%5Cn%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sep%3DCOLOR%5B%22ENDC%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(0.05)%20%20%23%20to%20avoid%20log%20truncation%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%7BCOLOR%5B'GREEN'%5D%7DGenerated%20%7Bnum_tokens%7D%20tokens%20from%20%7BMODEL_ID%7D%20in%20%7Bduration_s%3A.1f%7D%20seconds%2C%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%20throughput%20%3D%20%7Bnum_tokens%20%2F%20duration_s%3A.0f%7D%20tokens%2Fsecond%20for%20batch%20of%20size%20%7Bnum_prompts%7D%20on%20%7BGPU_CONFIG%7D.%7BCOLOR%5B'ENDC'%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20return%20responses%0A%0A`,lang:`python`});var W=c(U,2);u(W,{id:`calling-our-inference-function`,children:(e,t)=>{l(),i(e,r(`Calling our inference function`))},$$slots:{default:!0}});var G=c(W,6);d(G,{id:`calling-inference-from-python`,children:(e,t)=>{l(),i(e,r(`Calling inference from Python`))},$$slots:{default:!0}});var K=c(G,6);p(K,{code:`modal%20run%20trtllm_throughput.py`,lang:`bash`});var q=c(K,4);p(q,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20questions%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%23%20Generic%20assistant%20questions%0A%20%20%20%20%20%20%20%20%22What%20are%20you%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20can%20you%20do%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Coding%0A%20%20%20%20%20%20%20%20%22Implement%20a%20Python%20function%20to%20compute%20the%20Fibonacci%20numbers.%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20Rust%20function%20that%20performs%20binary%20exponentiation.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20I%20allocate%20memory%20in%20C%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20differences%20between%20Javascript%20and%20Python%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20I%20find%20invalid%20indices%20in%20Postgres%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20can%20you%20implement%20a%20LRU%20(Least%20Recently%20Used)%20cache%20in%20Python%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20approach%20would%20you%20use%20to%20detect%20and%20prevent%20race%20conditions%20in%20a%20multithreaded%20application%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Can%20you%20explain%20how%20a%20decision%20tree%20algorithm%20works%20in%20machine%20learning%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20would%20you%20design%20a%20simple%20key-value%20store%20database%20from%20scratch%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20you%20handle%20deadlock%20situations%20in%20concurrent%20programming%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20logic%20behind%20the%20A*%20search%20algorithm%2C%20and%20where%20is%20it%20used%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20can%20you%20design%20an%20efficient%20autocomplete%20system%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20approach%20would%20you%20take%20to%20design%20a%20secure%20session%20management%20system%20in%20a%20web%20application%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20would%20you%20handle%20collision%20in%20a%20hash%20table%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20can%20you%20implement%20a%20load%20balancer%20for%20a%20distributed%20system%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Implement%20a%20Python%20class%20for%20a%20doubly%20linked%20list.%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20Haskell%20function%20that%20generates%20prime%20numbers%20using%20the%20Sieve%20of%20Eratosthenes.%22%2C%0A%20%20%20%20%20%20%20%20%22Develop%20a%20simple%20HTTP%20server%20in%20Rust.%22%2C%0A%20%20%20%20%20%20%20%20%23%20Literate%20and%20creative%20writing%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20fable%20involving%20a%20fox%20and%20grapes%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Who%20does%20Harry%20turn%20into%20a%20balloon%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20story%20in%20the%20style%20of%20James%20Joyce%20about%20a%20trip%20to%20the%20Australian%20outback%20in%202083%20to%20see%20robots%20in%20the%20beautiful%20desert.%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20tale%20about%20a%20time-traveling%20historian%20who's%20determined%20to%20witness%20the%20most%20significant%20events%20in%20human%20history.%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20a%20day%20in%20the%20life%20of%20a%20secret%20agent%20who's%20also%20a%20full-time%20parent.%22%2C%0A%20%20%20%20%20%20%20%20%22Create%20a%20story%20about%20a%20detective%20who%20can%20communicate%20with%20animals.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20most%20unusual%20thing%20about%20living%20in%20a%20city%20floating%20in%20the%20clouds%3F%22%2C%0A%20%20%20%20%20%20%20%20%22In%20a%20world%20where%20dreams%20are%20shared%2C%20what%20happens%20when%20a%20nightmare%20invades%20a%20peaceful%20dream%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20adventure%20of%20a%20lifetime%20for%20a%20group%20of%20friends%20who%20found%20a%20map%20leading%20to%20a%20parallel%20universe.%22%2C%0A%20%20%20%20%20%20%20%20%22Tell%20a%20story%20about%20a%20musician%20who%20discovers%20that%20their%20music%20has%20magical%20powers.%22%2C%0A%20%20%20%20%20%20%20%20%22In%20a%20world%20where%20people%20age%20backwards%2C%20describe%20the%20life%20of%20a%205-year-old%20man.%22%2C%0A%20%20%20%20%20%20%20%20%22Create%20a%20tale%20about%20a%20painter%20whose%20artwork%20comes%20to%20life%20every%20night.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20happens%20when%20a%20poet's%20verses%20start%20to%20predict%20future%20events%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Imagine%20a%20world%20where%20books%20can%20talk.%20How%20does%20a%20librarian%20handle%20them%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Tell%20a%20story%20about%20an%20astronaut%20who%20discovered%20a%20planet%20populated%20by%20plants.%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20journey%20of%20a%20letter%20traveling%20through%20the%20most%20sophisticated%20postal%20service%20ever.%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20tale%20about%20a%20chef%20whose%20food%20can%20evoke%20memories%20from%20the%20eater's%20past.%22%2C%0A%20%20%20%20%20%20%20%20%22Write%20a%20poem%20in%20the%20style%20of%20Walt%20Whitman%20about%20the%20modern%20digital%20world.%22%2C%0A%20%20%20%20%20%20%20%20%22Create%20a%20short%20story%20about%20a%20society%20where%20people%20can%20only%20speak%20in%20metaphors.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20main%20themes%20in%20Dostoevsky's%20'Crime%20and%20Punishment'%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20History%20and%20Philosophy%0A%20%20%20%20%20%20%20%20%22What%20were%20the%20major%20contributing%20factors%20to%20the%20fall%20of%20the%20Roman%20Empire%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20did%20the%20invention%20of%20the%20printing%20press%20revolutionize%20European%20society%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20effects%20of%20quantitative%20easing%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20did%20the%20Greek%20philosophers%20influence%20economic%20thought%20in%20the%20ancient%20world%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20were%20the%20economic%20and%20philosophical%20factors%20that%20led%20to%20the%20fall%20of%20the%20Soviet%20Union%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20did%20decolonization%20in%20the%2020th%20century%20change%20the%20geopolitical%20map%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20was%20the%20influence%20of%20the%20Khmer%20Empire%20on%20Southeast%20Asia's%20history%20and%20culture%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20led%20to%20the%20rise%20and%20fall%20of%20the%20Mongol%20Empire%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Discuss%20the%20effects%20of%20the%20Industrial%20Revolution%20on%20urban%20development%20in%2019th%20century%20Europe.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20did%20the%20Treaty%20of%20Versailles%20contribute%20to%20the%20outbreak%20of%20World%20War%20II%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20led%20to%20the%20rise%20and%20fall%20of%20the%20Mongol%20Empire%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Discuss%20the%20effects%20of%20the%20Industrial%20Revolution%20on%20urban%20development%20in%2019th%20century%20Europe.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20did%20the%20Treaty%20of%20Versailles%20contribute%20to%20the%20outbreak%20of%20World%20War%20II%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20concept%20of%20'tabula%20rasa'%20in%20John%20Locke's%20philosophy.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20does%20Nietzsche%20mean%20by%20'ressentiment'%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Compare%20and%20contrast%20the%20early%20and%20late%20works%20of%20Ludwig%20Wittgenstein.%20Which%20do%20you%20prefer%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20does%20the%20trolley%20problem%20explore%20the%20ethics%20of%20decision-making%20in%20critical%20situations%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Thoughtfulness%0A%20%20%20%20%20%20%20%20%22Describe%20the%20city%20of%20the%20future%2C%20considering%20advances%20in%20technology%2C%20environmental%20changes%2C%20and%20societal%20shifts.%22%2C%0A%20%20%20%20%20%20%20%20%22In%20a%20dystopian%20future%20where%20water%20is%20the%20most%20valuable%20commodity%2C%20how%20would%20society%20function%3F%22%2C%0A%20%20%20%20%20%20%20%20%22If%20a%20scientist%20discovers%20immortality%2C%20how%20could%20this%20impact%20society%2C%20economy%2C%20and%20the%20environment%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20could%20be%20the%20potential%20implications%20of%20contact%20with%20an%20advanced%20alien%20civilization%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20how%20you%20would%20mediate%20a%20conflict%20between%20two%20roommates%20about%20doing%20the%20dishes%20using%20techniques%20of%20non-violent%20communication.%22%2C%0A%20%20%20%20%20%20%20%20%22If%20you%20could%20design%20a%20school%20curriculum%20for%20the%20future%2C%20what%20subjects%20would%20you%20include%20to%20prepare%20students%20for%20the%20next%2050%20years%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20would%20society%20change%20if%20teleportation%20was%20invented%20and%20widely%20accessible%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Consider%20a%20future%20where%20artificial%20intelligence%20governs%20countries.%20What%20are%20the%20potential%20benefits%20and%20pitfalls%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Math%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20product%20of%209%20and%208%3F%22%2C%0A%20%20%20%20%20%20%20%20%22If%20a%20train%20travels%20120%20kilometers%20in%202%20hours%2C%20what%20is%20its%20average%20speed%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Think%20through%20this%20step%20by%20step.%20If%20the%20sequence%20a_n%20is%20defined%20by%20a_1%20%3D%203%2C%20a_2%20%3D%205%2C%20and%20a_n%20%3D%20a_(n-1)%20%2B%20a_(n-2)%20for%20n%20%3E%202%2C%20find%20a_6.%22%2C%0A%20%20%20%20%20%20%20%20%22Think%20through%20this%20step%20by%20step.%20Calculate%20the%20sum%20of%20an%20arithmetic%20series%20with%20first%20term%203%2C%20last%20term%2035%2C%20and%20total%20terms%2011.%22%2C%0A%20%20%20%20%20%20%20%20%22Think%20through%20this%20step%20by%20step.%20What%20is%20the%20area%20of%20a%20triangle%20with%20vertices%20at%20the%20points%20(1%2C2)%2C%20(3%2C-4)%2C%20and%20(-2%2C5)%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Think%20through%20this%20step%20by%20step.%20Solve%20the%20following%20system%20of%20linear%20equations%3A%203x%20%2B%202y%20%3D%2014%2C%205x%20-%20y%20%3D%2015.%22%2C%0A%20%20%20%20%20%20%20%20%23%20Facts%0A%20%20%20%20%20%20%20%20%22Who%20was%20Emperor%20Norton%20I%2C%20and%20what%20was%20his%20significance%20in%20San%20Francisco's%20history%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20Voynich%20manuscript%2C%20and%20why%20has%20it%20perplexed%20scholars%20for%20centuries%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20was%20Project%20A119%20and%20what%20were%20its%20objectives%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20'Dyatlov%20Pass%20incident'%20and%20why%20does%20it%20remain%20a%20mystery%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20'Emu%20War'%20that%20took%20place%20in%20Australia%20in%20the%201930s%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20'Phantom%20Time%20Hypothesis'%20proposed%20by%20Heribert%20Illig%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Who%20was%20the%20'Green%20Children%20of%20Woolpit'%20as%20per%2012th-century%20English%20legend%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20'zombie%20stars'%20in%20the%20context%20of%20astronomy%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Who%20were%20the%20'Dog-Headed%20Saint'%20and%20the%20'Lion-Faced%20Saint'%20in%20medieval%20Christian%20traditions%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20story%20of%20the%20'Globsters'%2C%20unidentified%20organic%20masses%20washed%20up%20on%20the%20shores%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Which%20countries%20in%20the%20European%20Union%20use%20currencies%20other%20than%20the%20Euro%2C%20and%20what%20are%20those%20currencies%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Multilingual%0A%20%20%20%20%20%20%20%20%22%E6%88%98%E5%9B%BD%E6%97%B6%E6%9C%9F%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E4%BA%BA%E7%89%A9%E6%98%AF%E8%B0%81%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Tuende%20hatua%20kwa%20hatua.%20Hesabu%20jumla%20ya%20mfululizo%20wa%20kihesabu%20wenye%20neno%20la%20kwanza%202%2C%20neno%20la%20mwisho%2042%2C%20na%20jumla%20ya%20maneno%2021.%22%2C%0A%20%20%20%20%20%20%20%20%22Kannst%20du%20die%20wichtigsten%20Eigenschaften%20und%20Funktionen%20des%20NMDA-Rezeptors%20beschreiben%3F%22%2C%0A%20%20%20%20%20%20%20%20%22%C2%BFCu%C3%A1les%20son%20los%20principales%20impactos%20ambientales%20de%20la%20deforestaci%C3%B3n%20en%20la%20Amazon%C3%ADa%3F%22%2C%0A%20%20%20%20%20%20%20%20%22D%C3%A9cris%20la%20structure%20et%20le%20r%C3%B4le%20de%20la%20mitochondrie%20dans%20une%20cellule.%22%2C%0A%20%20%20%20%20%20%20%20%22%D0%9A%D0%B0%D0%BA%D0%B8%D0%B5%20%D0%B1%D1%8B%D0%BB%D0%B8%20%D1%81%D0%BE%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5%20%D0%BF%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D1%81%D1%82%D0%B2%D0%B8%D1%8F%20%D0%9F%D0%B5%D1%80%D0%B5%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B8%20%D0%B2%20%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%BE%D0%BC%20%D0%A1%D0%BE%D1%8E%D0%B7%D0%B5%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Economics%20and%20Business%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20principles%20of%20behavioral%20economics%20and%20how%20do%20they%20influence%20consumer%20choices%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Discuss%20the%20impact%20of%20blockchain%20technology%20on%20traditional%20banking%20systems.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20long-term%20effects%20of%20trade%20wars%20on%20global%20economic%20stability%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20law%20of%20supply%20and%20demand%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20concept%20of%20inflation%20and%20its%20typical%20causes.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20a%20trade%20deficit%2C%20and%20why%20does%20it%20matter%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20interest%20rates%20affect%20consumer%20spending%20and%20saving%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20GDP%20and%20why%20is%20it%20important%20for%20measuring%20economic%20health%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20difference%20between%20revenue%20and%20profit%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20role%20of%20a%20business%20plan%20in%20startup%20success.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20does%20market%20segmentation%20benefit%20a%20company%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20concept%20of%20brand%20equity.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20advantages%20of%20franchising%20a%20business%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20Michael%20Porter's%20five%20forces%20and%20how%20do%20they%20impact%20strategy%20for%20tech%20startups%3F%22%2C%0A%20%20%20%20%20%20%20%20%23%20Science%20and%20Technology%0A%20%20%20%20%20%20%20%20%22Discuss%20the%20potential%20impacts%20of%20quantum%20computing%20on%20data%20security.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20could%20CRISPR%20technology%20change%20the%20future%20of%20medical%20treatments%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20significance%20of%20graphene%20in%20the%20development%20of%20future%20electronics.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20renewable%20energy%20sources%20compare%20to%20fossil%20fuels%20in%20terms%20of%20environmental%20impact%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20the%20most%20promising%20technologies%20for%20carbon%20capture%20and%20storage%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20why%20the%20sky%20is%20blue.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20principle%20behind%20the%20operation%20of%20a%20microwave%20oven%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20does%20Newton's%20third%20law%20apply%20to%20rocket%20propulsion%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20causes%20iron%20to%20rust%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20process%20of%20photosynthesis%20in%20simple%20terms.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20role%20of%20a%20catalyst%20in%20a%20chemical%20reaction%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20basic%20structure%20of%20a%20DNA%20molecule%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20vaccines%20work%20to%20protect%20the%20body%20from%20disease%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20significance%20of%20mitosis%20in%20cellular%20reproduction.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20are%20tectonic%20plates%20and%20how%20do%20they%20affect%20earthquakes%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20does%20the%20greenhouse%20effect%20contribute%20to%20global%20warming%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20water%20cycle%20and%20its%20importance%20to%20Earth's%20climate.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20causes%20the%20phases%20of%20the%20Moon%3F%22%2C%0A%20%20%20%20%20%20%20%20%22How%20do%20black%20holes%20form%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20significance%20of%20the%20Big%20Bang%20theory.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20the%20function%20of%20the%20CPU%20in%20a%20computer%20system%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Explain%20the%20difference%20between%20RAM%20and%20ROM.%22%2C%0A%20%20%20%20%20%20%20%20%22How%20does%20a%20solid-state%20drive%20(SSD)%20differ%20from%20a%20hard%20disk%20drive%20(HDD)%3F%22%2C%0A%20%20%20%20%20%20%20%20%22What%20role%20does%20the%20motherboard%20play%20in%20a%20computer%20system%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Describe%20the%20purpose%20and%20function%20of%20a%20GPU.%22%2C%0A%20%20%20%20%20%20%20%20%22What%20is%20TensorRT%3F%20What%20role%20does%20it%20play%20in%20neural%20network%20inference%3F%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20prefixes%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22Hi!%20%22%2C%0A%20%20%20%20%20%20%20%20%22Hello!%20%22%2C%0A%20%20%20%20%20%20%20%20%22Hi.%20%22%2C%0A%20%20%20%20%20%20%20%20%22Hello.%20%22%2C%0A%20%20%20%20%20%20%20%20%22Hi%3A%20%22%2C%0A%20%20%20%20%20%20%20%20%22Hello%3A%20%22%2C%0A%20%20%20%20%20%20%20%20%22Greetings.%20%22%2C%0A%20%20%20%20%5D%0A%20%20%20%20%23%20prepending%20any%20string%20that%20causes%20a%20tokenization%20change%20is%20enough%20to%20invalidate%20KV%20cache%0A%20%20%20%20for%20ii%2C%20prefix%20in%20enumerate(prefixes)%3A%0A%20%20%20%20%20%20%20%20questions%20%2B%3D%20%5Bprefix%20%2B%20question%20for%20question%20in%20questions%5B%3A128%5D%5D%0A%0A%20%20%20%20model%20%3D%20Model()%0A%20%20%20%20model.generate.remote(questions)%0A%20%20%20%20%23%20if%20you're%20calling%20this%20service%20from%20another%20Python%20project%2C%0A%20%20%20%20%23%20use%20%5B%60Model.lookup%60%5D(https%3A%2F%2Fmodal.com%2Fdocs%2Freference%2Fmodal.Cls%23lookup)%0A%0A`,lang:`python`});var J=c(q,2);d(J,{id:`calling-inference-via-an-api`,children:(e,t)=>{l(),i(e,r(`Calling inference via an API`))},$$slots:{default:!0}});var Y=c(J,6);p(Y,{code:`web_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.9.2%22%2C%0A%20%20%20%20%22starlette%3D%3D0.41.2%22%2C%0A)%0A%0A`,lang:`python`});var X=c(Y,4);p(X,{code:`class%20GenerateRequest(pydantic.BaseModel)%3A%0A%20%20%20%20prompts%3A%20list%5Bstr%5D%0A%20%20%20%20settings%3A%20Optional%5Bdict%5D%20%3D%20None%0A%0A%0A%40app.function(image%3Dweb_image)%0A%40modal.fastapi_endpoint(%0A%20%20%20%20method%3D%22POST%22%2C%20label%3Df%22%7BMODEL_ID.lower().split('%2F')%5B-1%5D%7D-web%22%2C%20docs%3DTrue%0A)%0Adef%20generate_web(data%3A%20GenerateRequest)%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20%22%22%22Generate%20responses%20to%20a%20batch%20of%20prompts%2C%20optionally%20with%20custom%20inference%20settings.%22%22%22%0A%20%20%20%20return%20Model.generate.remote(data.prompts%2C%20settings%3DNone)%0A%0A`,lang:`python`});var Z=c(X,4);p(Z,{code:`modal%20serve%20trtllm_throughput.py`,lang:`bash`});var Q=c(Z,6);p(Q,{code:`curl%20-X%20POST%20url-from-output-of-modal-serve-here%20%5C%0A-H%20%22Content-Type%3A%20application%2Fjson%22%20%5C%0A-d%20'%7B%0A%20%20%20%20%22prompts%22%3A%20%5B%22Tell%20me%20a%20joke%22%2C%20%22Describe%20a%20dream%20you%20had%20recently%22%2C%20%22Share%20your%20favorite%20childhood%20memory%22%5D%0A%7D'%20%7C%20python%20-m%20json.tool%20%23%20python%20for%20pretty-printing%2C%20optional`,lang:`bash`});var $=c(Q,4);u($,{id:`footer`,children:(e,t)=>{l(),i(e,r(`Footer`))},$$slots:{default:!0}}),p(c($,4),{code:`COLOR%20%3D%20%7B%0A%20%20%20%20%22HEADER%22%3A%20%22%5C033%5B95m%22%2C%0A%20%20%20%20%22BLUE%22%3A%20%22%5C033%5B94m%22%2C%0A%20%20%20%20%22GREEN%22%3A%20%22%5C033%5B92m%22%2C%0A%20%20%20%20%22RED%22%3A%20%22%5C033%5B91m%22%2C%0A%20%20%20%20%22ENDC%22%3A%20%22%5C033%5B0m%22%2C%0A%7D%0A%0A%0Adef%20extract_assistant_response(output_text)%3A%0A%20%20%20%20%22%22%22Model-specific%20code%20to%20extract%20model%20responses.%0A%0A%20%20%20%20See%20this%20doc%20for%20LLaMA%203%3A%20https%3A%2F%2Fllama.meta.com%2Fdocs%2Fmodel-cards-and-prompt-formats%2Fmeta-llama-3%2F.%22%22%22%0A%20%20%20%20%23%20Split%20the%20output%20text%20by%20the%20assistant%20header%20token%0A%20%20%20%20parts%20%3D%20output_text.split(%22%3C%7Cstart_header_id%7C%3Eassistant%3C%7Cend_header_id%7C%3E%22)%0A%0A%20%20%20%20if%20len(parts)%20%3E%201%3A%0A%20%20%20%20%20%20%20%20%23%20Join%20the%20parts%20after%20the%20first%20occurrence%20of%20the%20assistant%20header%20token%0A%20%20%20%20%20%20%20%20response%20%3D%20parts%5B1%5D.split(%22%3C%7Ceot_id%7C%3E%22)%5B0%5D.strip()%0A%0A%20%20%20%20%20%20%20%20%23%20Remove%20any%20remaining%20special%20tokens%20and%20whitespace%0A%20%20%20%20%20%20%20%20response%20%3D%20response.replace(%22%3C%7Ceot_id%7C%3E%22%2C%20%22%22).strip()%0A%0A%20%20%20%20%20%20%20%20return%20response%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20return%20output_text%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BB2IKTAB.js.map
