(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ff12dc62-efde-4159-9bfb-6b0bc22b0d09`,e._sentryDebugIdIdentifier=`sentry-dbid-ff12dc62-efde-4159-9bfb-6b0bc22b0d09`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Training a mathematical reasoning model using the verifiers library with sandboxed code execution`,id:`training-a-mathematical-reasoning-model-using-the-verifiers-library-with-sandboxed-code-execution`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Caching HuggingFace, vLLM, and storing model weights. For more on storing model weights on Modal, see`,id:`caching-huggingface-vllm-and-storing-model-weights-for-more-on-storing-model-weights-on-modal-see`},{depth:2,value:`Training`,id:`training`},{depth:2,value:`Inference`,id:`inference`},{depth:2,value:`Usage`,id:`usage`}]}],rawContent:`# Training a mathematical reasoning model using the verifiers library with sandboxed code execution

This example demonstrates how to train mathematical reasoning models on Modal using the [verifiers library](https://github.com/willccbb/verifiers) with [Modal Sandboxes](https://modal.com/docs/guide/sandbox) for executing generated code.
The [verifiers library](https://github.com/willccbb/verifiers) is a set of tools and abstractions for training LLMs with reinforcement learning in verifiable multi-turn environments via [GRPO](https://arxiv.org/abs/2402.03300).

This example demonstrates how to:
- Launch a distributed GRPO training job on Modal with 4× H100 GPUs.
- Use vLLM for inference during training.
- Cache HuggingFace, vLLM, and store the model weights in [Volumes](https://modal.com/docs/guide/volumes).
- Run inference by loading the trained model from Volumes.

## Setup
We start by importing modal and the dependencies from the verifiers library. Then, we create a Modal App and an image with a NVIDIA CUDA base image.
We install the dependencies for the \`verifiers\` and \`flash-attn\` libraries, following the verifiers [README](https://github.com/willccbb/verifiers?tab=readme-ov-file#getting-started).

\`\`\`python
import modal

app = modal.App(name="example-learn-math")
cuda_version = "12.8.0"
flavor = "devel"
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"


flash_attn_release = (
    "https://github.com/Dao-AILab/flash-attention/releases/download/v2.7.1.post1/"
    "flash_attn-2.7.1.post1+cu12torch2.6cxx11abiTRUE-cp311-cp311-linux_x86_64.whl"
)  # We use a pre-built binary for flash-attn to install it in the image.

image = (
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.11")
    .apt_install("git", "clang")
    .uv_pip_install(
        "huggingface-hub==0.36.0",
        "setuptools==69.0.3",
        "wheel==0.45.1",
        "ninja==1.11.1.4",
        "packaging==25.0",
        "verifiers[all]==0.1.1",
        flash_attn_release,
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",
            "VLLM_ALLOW_INSECURE_SERIALIZATION": "1",
            "HF_HOME": "/root/.cache/huggingface",
        }
    )
)

\`\`\`

## Caching HuggingFace, vLLM, and storing model weights. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).
We create Modal Volumes to persist:
- HuggingFace downloads
- vLLM cache
- Model weights

We define the model name and a tool that the model can use to execute Python code that it generates.
See this [this training script](/docs/examples/trainer_script_grpo) for more details.

\`\`\`python
HF_CACHE_DIR = "/root/.cache/huggingface"
HF_CACHE_VOL = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

VLLM_CACHE_DIR = "/root/.cache/vllm"
VLLM_CACHE_VOL = modal.Volume.from_name("vllm-cache", create_if_missing=True)

WEIGHTS_DIR = "/root/math_weights"
WEIGHTS_VOL = modal.Volume.from_name(
    "example-trainer-script-grpo-weights", create_if_missing=True
)

MODEL_NAME = "willcb/Qwen3-0.6B"
TOOL_DESCRIPTIONS = """
- sandbox_exec: Execute Python code to perform calculations.
"""

\`\`\`

## Training
Following the [verifiers example](https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py), we will need a training script and a config file.
For sandboxed code execution, we will use [this training script](/docs/examples/trainer_script_grpo) and the config file defined [here](https://github.com/willccbb/verifiers/blob/main/configs/zero3.yaml).

We create a function that uses 4 H100 GPUs and mounts the defined Volumes. Then, we write the training script and the config file to the \`/root/\` directory.
We use the \`willcb/Qwen3-0.6B\` model from HuggingFace, setting up inference via a vLLM server. Once, the model is served, we will launch the training script using \`accelerate\`.
We can use the App ID as a unique identifier for saving and loading the model weights.
When the training is complete, we will run a single inference from the training set to test our training run.

\`\`\`python
@app.function(
    gpu="H100:4",
    image=image,
    volumes={
        HF_CACHE_DIR: HF_CACHE_VOL,
        VLLM_CACHE_DIR: VLLM_CACHE_VOL,
        WEIGHTS_DIR: WEIGHTS_VOL,
    },
    timeout=3600,
    secrets=[modal.Secret.from_name("wandb-secret-rl")],
)
def math_group_verifier(trainer_script: str, config_file: str, run_id: str = None):
    import os
    import subprocess

    import wandb
    from verifiers.prompts import DEFAULT_TOOL_PROMPT_TEMPLATE
    from verifiers.utils import load_example_dataset

    with open("/root/trainer_script.py", "w") as f:
        f.write(trainer_script)
    with open("/root/config.yaml", "w") as f:
        f.write(config_file)

    wandb.init(project="example-trainer-script-grpo")
    wandb.config = {"epochs": 10}

    vllm_proc = subprocess.Popen(
        ["vf-vllm", "--model", MODEL_NAME, "--port", "8000", "--enforce-eager"],
        env={**os.environ, "CUDA_VISIBLE_DEVICES": "0", "NCCL_CUMEM_ENABLE": "0"},
    )

    run_id = app.app_id if run_id is None else run_id

    result = subprocess.run(
        [
            "accelerate",
            "launch",
            "--config-file",
            "/root/config.yaml",
            "/root/trainer_script.py",
            "--run-id",
            run_id,
        ],
        env={
            **os.environ,
            "CUDA_VISIBLE_DEVICES": "1,2,3",
            "NCCL_DEBUG": "INFO",
            "NCCL_CUMEM_ENABLE": "0",
        },
    )
    vllm_proc.terminate()
    vllm_proc.wait()

    print("Training completed! Running a single inference from test set...")

    dataset = load_example_dataset(
        "math", split="train"
    ).select(
        range(1)
    )  # We use the first example from the training set for inference to test our training run.

    example = dataset[0]
    question = example["question"]
    prompt = (
        DEFAULT_TOOL_PROMPT_TEMPLATE.format(tool_descriptions=TOOL_DESCRIPTIONS)
        + "\\n\\nProblem: "
        + question
        + "\\n\\n<think>\\n\\n<answer>"
    )

    result = inference.remote(prompt, run_id)
    print(result)


\`\`\`

## Inference
We define an \`inference\` Modal function that runs on a single GPU and mounts the weights volume.
Then, we load the trained model from the volume, falling back to the base model if necessary.
To build the prompt, we apply \`DEFAULT_TOOL_PROMPT_TEMPLATE\` with \`TOOL_DESCRIPTIONS\` and the problem text.
Finally, we tokenize the prompt, generate a response with sampling (temperature, top-p, repetition penalty), then decode and return the answer.

\`\`\`python
@app.function(
    gpu="H100",
    image=image,
    volumes={
        HF_CACHE_DIR: HF_CACHE_VOL,
        WEIGHTS_DIR: WEIGHTS_VOL,
    },
    timeout=60 * 10,
)
def inference(prompt: str, run_id: str = None):
    """Test the trained model with the same format as training"""
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from verifiers.prompts import DEFAULT_TOOL_PROMPT_TEMPLATE

    prompt = (
        DEFAULT_TOOL_PROMPT_TEMPLATE.format(tool_descriptions=TOOL_DESCRIPTIONS)
        + "\\n\\nProblem: "
        + prompt
        + "\\n\\n<think>\\n\\n<answer>"
    )

    model_path = f"{WEIGHTS_DIR}/{app.app_id if run_id is None else run_id}"
    print(f"Loading model from {model_path}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            trust_remote_code=True,
        )
        print(f"✓ Loaded trained model from {model_path}")
    except Exception as e:
        print(f"Could not load trained model: {e}")
        print("Loading base model instead...")
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME, cache_dir=HF_CACHE_DIR, trust_remote_code=True
        )
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            trust_remote_code=True,
        )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    def generate_response(prompt_text):
        inputs = tokenizer(prompt_text, return_tensors="pt").to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=2048,
                do_sample=True,
                temperature=0.3,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id,
            )

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response[len(prompt_text) :].strip()

    model_response = generate_response(prompt + "\\n\\n<think>\\n\\n<answer>")
    return model_response


\`\`\`

## Usage
We create a main function that serves as the entrypoint for the app.
It supports two modes:
- train: kick off math_group_verifier with the provided training script and config file
- inference: invoke inference with prompt string or prompt file

To run the training, we can use the following command:
\`\`\`bash
modal run learn_math.py --mode=train --trainer-script=trainer_script_grpo.py --config-file=config_grpo.yaml
\`\`\`
To run the inference with a custom prompt, we can use the following command after setting the model path inside our volume:
\`\`\`bash
modal run learn_math.py --mode=inference --prompt "Find the value of x that satisfies the equation: 2x + 5 = 17" --model-path "test_run"
\`\`\`
To run the inference with a custom prompt from a file, we can use the following command:
\`\`\`bash
modal run learn_math.py --mode=inference --prompt-file "prompt.txt"
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    mode: str = "train",
    prompt: str = None,
    prompt_file: str = None,
    run_id: str = None,
    trainer_script: str = "trainer_script_grpo.py",
    config_file: str = "config_grpo.yaml",
):
    if mode == "inference":
        if prompt_file:
            try:
                with open(prompt_file, "r") as f:
                    prompt_text = f.read().strip()
                print(f"Using prompt from file: {prompt_file}")
            except FileNotFoundError:
                print(f"Error: File {prompt_file} not found")
                return
        elif prompt:
            prompt_text = prompt
            print("Using prompt from command line argument")
        else:
            prompt_text = "Find the value of x that satisfies the equation: 2x + 5 = 17"

        print("=" * 50)
        print("Running inference...")
        print("=" * 50)
        print("PROMPT:")
        print(prompt_text)
        print("-" * 30)
        model_response = inference.remote(prompt_text, run_id)
        print("MODEL RESPONSE:")
        print(model_response)
        print("-" * 30)

    elif mode == "train":
        print(
            f"Training with trainer script:\\n{trainer_script}\\nand config file:\\n{config_file}"
        )
        with open(trainer_script, "r") as f:
            trainer_content = f.read()
        with open(config_file, "r") as f:
            config_content = f.read()

        math_group_verifier.remote(trainer_content, config_content, run_id)

\`\`\`
`,meta:{title:`Training a mathematical reasoning model using the verifiers library with sandboxed code execution`,description:`This example demonstrates how to train mathematical reasoning models on Modal using the verifiers library with Modal Sandboxes for executing generated code. The verifiers library is a set of tools and abstractions for training LLMs with reinforcement learning in verifiable multi-turn environments via GRPO.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to train mathematical reasoning models on Modal using the <!> with <!> for executing generated code.
The <!> is a set of tools and abstractions for training LLMs with reinforcement learning in verifiable multi-turn environments via <!>.</p> <p>This example demonstrates how to:</p> <ul><li>Launch a distributed GRPO training job on Modal with 4× H100 GPUs.</li> <li>Use vLLM for inference during training.</li> <li>Cache HuggingFace, vLLM, and store the model weights in <!>.</li> <li>Run inference by loading the trained model from Volumes.</li></ul> <!> <p>We start by importing modal and the dependencies from the verifiers library. Then, we create a Modal App and an image with a NVIDIA CUDA base image.
We install the dependencies for the <code>verifiers</code> and <code>flash-attn</code> libraries, following the verifiers <!>.</p> <!> <!> <p><!>.
We create Modal Volumes to persist:</p> <ul><li>HuggingFace downloads</li> <li>vLLM cache</li> <li>Model weights</li></ul> <p>We define the model name and a tool that the model can use to execute Python code that it generates.
See this <!> for more details.</p> <!> <!> <p>Following the <!>, we will need a training script and a config file.
For sandboxed code execution, we will use <!> and the config file defined <!>.</p> <p>We create a function that uses 4 H100 GPUs and mounts the defined Volumes. Then, we write the training script and the config file to the <code>/root/</code> directory.
We use the <code>willcb/Qwen3-0.6B</code> model from HuggingFace, setting up inference via a vLLM server. Once, the model is served, we will launch the training script using <code>accelerate</code>.
We can use the App ID as a unique identifier for saving and loading the model weights.
When the training is complete, we will run a single inference from the training set to test our training run.</p> <!> <!> <p>We define an <code>inference</code> Modal function that runs on a single GPU and mounts the weights volume.
Then, we load the trained model from the volume, falling back to the base model if necessary.
To build the prompt, we apply <code>DEFAULT_TOOL_PROMPT_TEMPLATE</code> with <code>TOOL_DESCRIPTIONS</code> and the problem text.
Finally, we tokenize the prompt, generate a response with sampling (temperature, top-p, repetition penalty), then decode and return the answer.</p> <!> <!> <p>We create a main function that serves as the entrypoint for the app.
It supports two modes:</p> <ul><li>train: kick off math_group_verifier with the provided training script and config file</li> <li>inference: invoke inference with prompt string or prompt file</li></ul> <p>To run the training, we can use the following command:</p> <!> <p>To run the inference with a custom prompt, we can use the following command after setting the model path inside our volume:</p> <!> <p>To run the inference with a custom prompt from a file, we can use the following command:</p> <!> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`training-a-mathematical-reasoning-model-using-the-verifiers-library-with-sandboxed-code-execution`,children:(e,t)=>{l(),i(e,r(`Training a mathematical reasoning model using the verifiers library with sandboxed code execution`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://github.com/willccbb/verifiers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verifiers library`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`https://github.com/willccbb/verifiers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verifiers library`))},$$slots:{default:!0}}),m(c(v,2),{href:`https://arxiv.org/abs/2402.03300`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GRPO`))},$$slots:{default:!0}}),l(),n(h);var b=c(h,4),x=c(e(b),4);m(c(e(x)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(x),l(2),n(b);var S=c(b,2);u(S,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var C=c(S,2);m(c(e(C),5),{href:`https://github.com/willccbb/verifiers?tab=readme-ov-file#getting-started`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`README`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);f(w,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22example-learn-math%22)%0Acuda_version%20%3D%20%2212.8.0%22%0Aflavor%20%3D%20%22devel%22%0Aoperating_sys%20%3D%20%22ubuntu22.04%22%0Atag%20%3D%20f%22%7Bcuda_version%7D-%7Bflavor%7D-%7Boperating_sys%7D%22%0A%0A%0Aflash_attn_release%20%3D%20(%0A%20%20%20%20%22https%3A%2F%2Fgithub.com%2FDao-AILab%2Fflash-attention%2Freleases%2Fdownload%2Fv2.7.1.post1%2F%22%0A%20%20%20%20%22flash_attn-2.7.1.post1%2Bcu12torch2.6cxx11abiTRUE-cp311-cp311-linux_x86_64.whl%22%0A)%20%20%23%20We%20use%20a%20pre-built%20binary%20for%20flash-attn%20to%20install%20it%20in%20the%20image.%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(f%22nvidia%2Fcuda%3A%7Btag%7D%22%2C%20add_python%3D%223.11%22)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22clang%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22setuptools%3D%3D69.0.3%22%2C%0A%20%20%20%20%20%20%20%20%22wheel%3D%3D0.45.1%22%2C%0A%20%20%20%20%20%20%20%20%22ninja%3D%3D1.11.1.4%22%2C%0A%20%20%20%20%20%20%20%20%22packaging%3D%3D25.0%22%2C%0A%20%20%20%20%20%20%20%20%22verifiers%5Ball%5D%3D%3D0.1.1%22%2C%0A%20%20%20%20%20%20%20%20flash_attn_release%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22VLLM_ALLOW_INSECURE_SERIALIZATION%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20%22%2Froot%2F.cache%2Fhuggingface%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var T=c(w,2);u(T,{id:`caching-huggingface-vllm-and-storing-model-weights-for-more-on-storing-model-weights-on-modal-see`,children:(e,t)=>{l(),i(e,r(`Caching HuggingFace, vLLM, and storing model weights. For more on storing model weights on Modal, see`))},$$slots:{default:!0}});var E=c(T,2);m(e(E),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,4);m(c(e(D)),{href:`/docs/examples/trainer_script_grpo`,children:(e,t)=>{l(),i(e,r(`this training script`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);f(O,{code:`HF_CACHE_DIR%20%3D%20%22%2Froot%2F.cache%2Fhuggingface%22%0AHF_CACHE_VOL%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A%0AVLLM_CACHE_DIR%20%3D%20%22%2Froot%2F.cache%2Fvllm%22%0AVLLM_CACHE_VOL%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A%0AWEIGHTS_DIR%20%3D%20%22%2Froot%2Fmath_weights%22%0AWEIGHTS_VOL%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22example-trainer-script-grpo-weights%22%2C%20create_if_missing%3DTrue%0A)%0A%0AMODEL_NAME%20%3D%20%22willcb%2FQwen3-0.6B%22%0ATOOL_DESCRIPTIONS%20%3D%20%22%22%22%0A-%20sandbox_exec%3A%20Execute%20Python%20code%20to%20perform%20calculations.%0A%22%22%22%0A`,lang:`python`});var k=c(O,2);u(k,{id:`training`,children:(e,t)=>{l(),i(e,r(`Training`))},$$slots:{default:!0}});var A=c(k,2),j=c(e(A));m(j,{href:`https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verifiers example`))},$$slots:{default:!0}});var M=c(j,2);m(M,{href:`/docs/examples/trainer_script_grpo`,children:(e,t)=>{l(),i(e,r(`this training script`))},$$slots:{default:!0}}),m(c(M,2),{href:`https://github.com/willccbb/verifiers/blob/main/configs/zero3.yaml`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(A);var N=c(A,4);f(N,{code:`%40app.function(%0A%20%20%20%20gpu%3D%22H100%3A4%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20HF_CACHE_DIR%3A%20HF_CACHE_VOL%2C%0A%20%20%20%20%20%20%20%20VLLM_CACHE_DIR%3A%20VLLM_CACHE_VOL%2C%0A%20%20%20%20%20%20%20%20WEIGHTS_DIR%3A%20WEIGHTS_VOL%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20timeout%3D3600%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22wandb-secret-rl%22)%5D%2C%0A)%0Adef%20math_group_verifier(trainer_script%3A%20str%2C%20config_file%3A%20str%2C%20run_id%3A%20str%20%3D%20None)%3A%0A%20%20%20%20import%20os%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20import%20wandb%0A%20%20%20%20from%20verifiers.prompts%20import%20DEFAULT_TOOL_PROMPT_TEMPLATE%0A%20%20%20%20from%20verifiers.utils%20import%20load_example_dataset%0A%0A%20%20%20%20with%20open(%22%2Froot%2Ftrainer_script.py%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(trainer_script)%0A%20%20%20%20with%20open(%22%2Froot%2Fconfig.yaml%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(config_file)%0A%0A%20%20%20%20wandb.init(project%3D%22example-trainer-script-grpo%22)%0A%20%20%20%20wandb.config%20%3D%20%7B%22epochs%22%3A%2010%7D%0A%0A%20%20%20%20vllm_proc%20%3D%20subprocess.Popen(%0A%20%20%20%20%20%20%20%20%5B%22vf-vllm%22%2C%20%22--model%22%2C%20MODEL_NAME%2C%20%22--port%22%2C%20%228000%22%2C%20%22--enforce-eager%22%5D%2C%0A%20%20%20%20%20%20%20%20env%3D%7B**os.environ%2C%20%22CUDA_VISIBLE_DEVICES%22%3A%20%220%22%2C%20%22NCCL_CUMEM_ENABLE%22%3A%20%220%22%7D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20run_id%20%3D%20app.app_id%20if%20run_id%20is%20None%20else%20run_id%0A%0A%20%20%20%20result%20%3D%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22accelerate%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22launch%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--config-file%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%2Froot%2Fconfig.yaml%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%2Froot%2Ftrainer_script.py%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--run-id%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20run_id%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20env%3D%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20**os.environ%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CUDA_VISIBLE_DEVICES%22%3A%20%221%2C2%2C3%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22NCCL_DEBUG%22%3A%20%22INFO%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22NCCL_CUMEM_ENABLE%22%3A%20%220%22%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20)%0A%20%20%20%20vllm_proc.terminate()%0A%20%20%20%20vllm_proc.wait()%0A%0A%20%20%20%20print(%22Training%20completed!%20Running%20a%20single%20inference%20from%20test%20set...%22)%0A%0A%20%20%20%20dataset%20%3D%20load_example_dataset(%0A%20%20%20%20%20%20%20%20%22math%22%2C%20split%3D%22train%22%0A%20%20%20%20).select(%0A%20%20%20%20%20%20%20%20range(1)%0A%20%20%20%20)%20%20%23%20We%20use%20the%20first%20example%20from%20the%20training%20set%20for%20inference%20to%20test%20our%20training%20run.%0A%0A%20%20%20%20example%20%3D%20dataset%5B0%5D%0A%20%20%20%20question%20%3D%20example%5B%22question%22%5D%0A%20%20%20%20prompt%20%3D%20(%0A%20%20%20%20%20%20%20%20DEFAULT_TOOL_PROMPT_TEMPLATE.format(tool_descriptions%3DTOOL_DESCRIPTIONS)%0A%20%20%20%20%20%20%20%20%2B%20%22%5Cn%5CnProblem%3A%20%22%0A%20%20%20%20%20%20%20%20%2B%20question%0A%20%20%20%20%20%20%20%20%2B%20%22%5Cn%5Cn%3Cthink%3E%5Cn%5Cn%3Canswer%3E%22%0A%20%20%20%20)%0A%0A%20%20%20%20result%20%3D%20inference.remote(prompt%2C%20run_id)%0A%20%20%20%20print(result)%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`inference`,children:(e,t)=>{l(),i(e,r(`Inference`))},$$slots:{default:!0}});var F=c(P,4);f(F,{code:`%40app.function(%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20HF_CACHE_DIR%3A%20HF_CACHE_VOL%2C%0A%20%20%20%20%20%20%20%20WEIGHTS_DIR%3A%20WEIGHTS_VOL%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20timeout%3D60%20*%2010%2C%0A)%0Adef%20inference(prompt%3A%20str%2C%20run_id%3A%20str%20%3D%20None)%3A%0A%20%20%20%20%22%22%22Test%20the%20trained%20model%20with%20the%20same%20format%20as%20training%22%22%22%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20transformers%20import%20AutoModelForCausalLM%2C%20AutoTokenizer%0A%20%20%20%20from%20verifiers.prompts%20import%20DEFAULT_TOOL_PROMPT_TEMPLATE%0A%0A%20%20%20%20prompt%20%3D%20(%0A%20%20%20%20%20%20%20%20DEFAULT_TOOL_PROMPT_TEMPLATE.format(tool_descriptions%3DTOOL_DESCRIPTIONS)%0A%20%20%20%20%20%20%20%20%2B%20%22%5Cn%5CnProblem%3A%20%22%0A%20%20%20%20%20%20%20%20%2B%20prompt%0A%20%20%20%20%20%20%20%20%2B%20%22%5Cn%5Cn%3Cthink%3E%5Cn%5Cn%3Canswer%3E%22%0A%20%20%20%20)%0A%0A%20%20%20%20model_path%20%3D%20f%22%7BWEIGHTS_DIR%7D%2F%7Bapp.app_id%20if%20run_id%20is%20None%20else%20run_id%7D%22%0A%20%20%20%20print(f%22Loading%20model%20from%20%7Bmodel_path%7D%22)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20tokenizer%20%3D%20AutoTokenizer.from_pretrained(model_path%2C%20trust_remote_code%3DTrue)%0A%20%20%20%20%20%20%20%20model%20%3D%20AutoModelForCausalLM.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20model_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device_map%3D%22auto%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20trust_remote_code%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20print(f%22%E2%9C%93%20Loaded%20trained%20model%20from%20%7Bmodel_path%7D%22)%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20print(f%22Could%20not%20load%20trained%20model%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20print(%22Loading%20base%20model%20instead...%22)%0A%20%20%20%20%20%20%20%20tokenizer%20%3D%20AutoTokenizer.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%20cache_dir%3DHF_CACHE_DIR%2C%20trust_remote_code%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20model%20%3D%20AutoModelForCausalLM.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device_map%3D%22auto%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20trust_remote_code%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20if%20tokenizer.pad_token%20is%20None%3A%0A%20%20%20%20%20%20%20%20tokenizer.pad_token%20%3D%20tokenizer.eos_token%0A%0A%20%20%20%20def%20generate_response(prompt_text)%3A%0A%20%20%20%20%20%20%20%20inputs%20%3D%20tokenizer(prompt_text%2C%20return_tensors%3D%22pt%22).to(model.device)%0A%0A%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20outputs%20%3D%20model.generate(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20**inputs%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20max_new_tokens%3D2048%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20do_sample%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20temperature%3D0.3%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20top_p%3D0.9%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20repetition_penalty%3D1.1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pad_token_id%3Dtokenizer.eos_token_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20response%20%3D%20tokenizer.decode(outputs%5B0%5D%2C%20skip_special_tokens%3DTrue)%0A%20%20%20%20%20%20%20%20return%20response%5Blen(prompt_text)%20%3A%5D.strip()%0A%0A%20%20%20%20model_response%20%3D%20generate_response(prompt%20%2B%20%22%5Cn%5Cn%3Cthink%3E%5Cn%5Cn%3Canswer%3E%22)%0A%20%20%20%20return%20model_response%0A%0A`,lang:`python`});var I=c(F,2);u(I,{id:`usage`,children:(e,t)=>{l(),i(e,r(`Usage`))},$$slots:{default:!0}});var L=c(I,8);f(L,{code:`modal%20run%20learn_math.py%20--mode%3Dtrain%20--trainer-script%3Dtrainer_script_grpo.py%20--config-file%3Dconfig_grpo.yaml`,lang:`bash`});var R=c(L,4);f(R,{code:`modal%20run%20learn_math.py%20--mode%3Dinference%20--prompt%20%22Find%20the%20value%20of%20x%20that%20satisfies%20the%20equation%3A%202x%20%2B%205%20%3D%2017%22%20--model-path%20%22test_run%22`,lang:`bash`});var z=c(R,4);f(z,{code:`modal%20run%20learn_math.py%20--mode%3Dinference%20--prompt-file%20%22prompt.txt%22`,lang:`bash`}),f(c(z,2),{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20mode%3A%20str%20%3D%20%22train%22%2C%0A%20%20%20%20prompt%3A%20str%20%3D%20None%2C%0A%20%20%20%20prompt_file%3A%20str%20%3D%20None%2C%0A%20%20%20%20run_id%3A%20str%20%3D%20None%2C%0A%20%20%20%20trainer_script%3A%20str%20%3D%20%22trainer_script_grpo.py%22%2C%0A%20%20%20%20config_file%3A%20str%20%3D%20%22config_grpo.yaml%22%2C%0A)%3A%0A%20%20%20%20if%20mode%20%3D%3D%20%22inference%22%3A%0A%20%20%20%20%20%20%20%20if%20prompt_file%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20open(prompt_file%2C%20%22r%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20prompt_text%20%3D%20f.read().strip()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Using%20prompt%20from%20file%3A%20%7Bprompt_file%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20FileNotFoundError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Error%3A%20File%20%7Bprompt_file%7D%20not%20found%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20elif%20prompt%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt_text%20%3D%20prompt%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Using%20prompt%20from%20command%20line%20argument%22)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt_text%20%3D%20%22Find%20the%20value%20of%20x%20that%20satisfies%20the%20equation%3A%202x%20%2B%205%20%3D%2017%22%0A%0A%20%20%20%20%20%20%20%20print(%22%3D%22%20*%2050)%0A%20%20%20%20%20%20%20%20print(%22Running%20inference...%22)%0A%20%20%20%20%20%20%20%20print(%22%3D%22%20*%2050)%0A%20%20%20%20%20%20%20%20print(%22PROMPT%3A%22)%0A%20%20%20%20%20%20%20%20print(prompt_text)%0A%20%20%20%20%20%20%20%20print(%22-%22%20*%2030)%0A%20%20%20%20%20%20%20%20model_response%20%3D%20inference.remote(prompt_text%2C%20run_id)%0A%20%20%20%20%20%20%20%20print(%22MODEL%20RESPONSE%3A%22)%0A%20%20%20%20%20%20%20%20print(model_response)%0A%20%20%20%20%20%20%20%20print(%22-%22%20*%2030)%0A%0A%20%20%20%20elif%20mode%20%3D%3D%20%22train%22%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Training%20with%20trainer%20script%3A%5Cn%7Btrainer_script%7D%5Cnand%20config%20file%3A%5Cn%7Bconfig_file%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20with%20open(trainer_script%2C%20%22r%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20trainer_content%20%3D%20f.read()%0A%20%20%20%20%20%20%20%20with%20open(config_file%2C%20%22r%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20config_content%20%3D%20f.read()%0A%0A%20%20%20%20%20%20%20%20math_group_verifier.remote(trainer_content%2C%20config_content%2C%20run_id)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DM1EiMZV.js.map
