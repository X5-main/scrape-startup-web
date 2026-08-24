(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c18b2a68-383f-42e5-a00f-64326b521810`,e._sentryDebugIdIdentifier=`sentry-dbid-c18b2a68-383f-42e5-a00f-64326b521810`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Train a model to solve math problems using GRPO and verl`,id:`train-a-model-to-solve-math-problems-using-grpo-and-verl`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Defining the image and app`,id:`defining-the-image-and-app`},{depth:2,value:`Defining the dataset`,id:`defining-the-dataset`},{depth:2,value:`Defining a reward function`,id:`defining-a-reward-function`},{depth:2,value:`Kicking off a training run`,id:`kicking-off-a-training-run`},{depth:2,value:`Performing inference on the trained model`,id:`performing-inference-on-the-trained-model`}]}],rawContent:`# Train a model to solve math problems using GRPO and verl

This example demonstrates how to train with [GRPO](https://arxiv.org/pdf/2402.03300) on Modal using the [verl](https://github.com/volcengine/verl) framework.
GRPO is a reinforcement learning algorithm introduced by DeepSeek, and was used to train DeepSeek R1.
verl is a reinforcement learning training library that is an implementation of [HybridFlow](https://arxiv.org/abs/2409.19256v2), an RLHF framework.

The training process works as follows:
- Each example in the dataset corresponds to a math problem.
- In each training step, the model attempts to solve the math problems showing its steps.
- We then compute a reward for the model's solution using the reward function defined below.
- That reward value is then used to update the model's parameters according to the GRPO training algorithm.

## Setup

Import the necessary modules for Modal deployment.

\`\`\`python
import re
import subprocess
from pathlib import Path
from typing import Literal, Optional

import modal

\`\`\`

## Defining the image and app

\`\`\`python
app = modal.App("example-grpo-verl")

\`\`\`

We define an image where we clone the verl repo and install its dependencies. We use a base verl image as a starting point.

\`\`\`python
VERL_REPO_PATH: Path = Path("/root/verl")
image = (
    modal.Image.from_registry("verlai/verl:app-verl0.4-vllm0.8.5-mcore0.12.1")
    .apt_install("git")
    .run_commands(f"git clone https://github.com/volcengine/verl {VERL_REPO_PATH}")
    .uv_pip_install("verl[vllm]==0.4.1")
)

\`\`\`

## Defining the dataset

In this example, we'll use reinforcement learning to train a model to solve math problems.
We use the [GSM8K](https://huggingface.co/datasets/openai/gsm8k) dataset of math problems and a [Modal Volume](https://modal.com/docs/guide/volumes#volumes) to store the data.

\`\`\`python
DATA_PATH: Path = Path("/data")
data_volume: modal.Volume = modal.Volume.from_name(
    "grpo-verl-example-data", create_if_missing=True
)


\`\`\`

We write a Modal Function to populate the Volume with the data. This downloads the dataset and stores it in the Volume.
You will need to run this step if you don't already have data you'd like to use for this example.

\`\`\`python
@app.function(image=image, volumes={DATA_PATH: data_volume})
def prep_dataset() -> None:
    subprocess.run(
        [
            "python",
            VERL_REPO_PATH / "examples" / "data_preprocess" / "gsm8k.py",
            "--local_dir",
            DATA_PATH,
        ],
        check=True,
    )


\`\`\`

You can kick off the dataset download with
\`modal run <filename.py>::prep_dataset\`

## Defining a reward function

In reinforcement learning, we define a reward function for the model.
We can define this in a separate file, or in the same file as in this case that we then pass as an argument to verl.
We use a \`default\` reward function for GSM8K from the [verl repo](https://github.com/volcengine/verl/blob/v0.1/verl/utils/reward_score/gsm8k.py), modified to return 1.0 if it's a correct answer and 0 otherwise.

\`\`\`python
def extract_solution(
    solution_str: str, method: Literal["strict", "flexible"] = "strict"
) -> Optional[str]:
    assert method in ["strict", "flexible"]

    if method == "strict":
        # This also tests the formatting of the model
        solution = re.search("#### (\\\\-?[0-9\\\\.\\\\,]+)", solution_str)
        if solution is None:
            final_answer: Optional[str] = None
        else:
            final_answer = solution.group(0)
            final_answer = (
                final_answer.split("#### ")[1].replace(",", "").replace("$", "")
            )
    elif method == "flexible":
        answer = re.findall("(\\\\-?[0-9\\\\.\\\\,]+)", solution_str)
        final_answer: Optional[str] = None
        if len(answer) == 0:
            # No reward if there is no answer.
            pass
        else:
            invalid_str: list[str] = ["", "."]
            # Find the last number that is not '.'
            for final_answer in reversed(answer):
                if final_answer not in invalid_str:
                    break
    return final_answer


\`\`\`

Reward functions need to follow a [predefined signature.](https://verl.readthedocs.io/en/latest/preparation/reward_function.html)

\`\`\`python
def compute_reward(
    data_source: str, solution_str: str, ground_truth: str, extra_info: dict
) -> float:
    answer = extract_solution(solution_str=solution_str, method="strict")
    if answer is None:
        return 0.0
    else:
        if answer == ground_truth:
            return 1.0
        else:
            return 0.0


\`\`\`

We then define constants to pass into verl during the training run.

\`\`\`python
PATH_TO_REWARD_FUNCTION: Path = Path("/root/grpo_verl.py")
REWARD_FUNCTION_NAME: str = "compute_reward"

\`\`\`

## Kicking off a training run

We define some more constants for the training run.

\`\`\`python
MODELS_PATH: Path = Path("/models")
MINUTES: int = 60


\`\`\`

We also define a Volume for storing model checkpoints.

\`\`\`python
checkpoints_volume: modal.Volume = modal.Volume.from_name(
    "grpo-verl-example-checkpoints", create_if_missing=True
)

\`\`\`

Now, we write a Modal Function for kicking off the training run.
If you wish to use Weights & Biases, as we do in this code, you'll need to create a Weights & Biases [Secret.](https://modal.com/docs/guide/secrets#secrets)

verl uses Ray under the hood. It creates Ray workers for each step where each Ray worker is a python process and each step is a step in the RL dataflow pipeline.
verl also keeps a separate control flow process that's independent of this, responsible for figuring out what step in the RL pipeline to execute.
Each Ray worker gets mapped onto 1 or more GPUs. Depending on the number of GPUs available, Ray will decide what workers go where, or to hold off scheduling workers
if there are no available GPUs. Generally, more VRAM = less hot-swapping of Ray workers, which means less waiting around for memory copying each iteration.
In this example we have chosen a configuration that allows for easy automated testing, but you may wish to use more GPUs or more powerful GPU types.
More details [here](https://verl.readthedocs.io/en/latest/hybrid_flow.html).

\`\`\`python
@app.function(
    image=image,
    gpu="H100:2",
    volumes={
        MODELS_PATH: checkpoints_volume,
        DATA_PATH: data_volume,
    },
    secrets=[modal.Secret.from_name("wandb-secret")],
    timeout=24 * 60 * MINUTES,
)
def train(*arglist) -> None:
    data_volume.reload()

    cmd: list[str] = [
        "python",
        "-m",
        "verl.trainer.main_ppo",
        "algorithm.adv_estimator=grpo",
        f"data.train_files={DATA_PATH / 'train.parquet'}",
        f"data.val_files={DATA_PATH / 'test.parquet'}",
        "data.train_batch_size=128",
        "data.max_prompt_length=64",
        "data.max_response_length=1024",
        "data.filter_overlong_prompts=True",
        "data.truncation=error",
        "actor_rollout_ref.model.path=Qwen/Qwen2-0.5B",
        "actor_rollout_ref.actor.optim.lr=1e-6",
        "actor_rollout_ref.model.use_remove_padding=False",
        "actor_rollout_ref.actor.ppo_mini_batch_size=128",
        "actor_rollout_ref.actor.ppo_micro_batch_size_per_gpu=16",
        "actor_rollout_ref.actor.checkpoint.save_contents='model,optimizer,extra,hf_model'",
        "actor_rollout_ref.actor.use_kl_loss=True",
        "actor_rollout_ref.actor.entropy_coeff=0",
        "actor_rollout_ref.actor.kl_loss_coef=0.001",
        "actor_rollout_ref.actor.kl_loss_type=low_var_kl",
        "actor_rollout_ref.model.enable_gradient_checkpointing=True",
        "actor_rollout_ref.actor.fsdp_config.param_offload=False",
        "actor_rollout_ref.actor.fsdp_config.optimizer_offload=False",
        "actor_rollout_ref.rollout.tensor_model_parallel_size=2",
        "actor_rollout_ref.rollout.log_prob_micro_batch_size_per_gpu=16",
        "actor_rollout_ref.rollout.name=vllm",
        "actor_rollout_ref.rollout.gpu_memory_utilization=0.4",
        "actor_rollout_ref.rollout.n=5",
        "actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu=16",
        "actor_rollout_ref.ref.fsdp_config.param_offload=True",
        "algorithm.use_kl_in_reward=False",
        "trainer.critic_warmup=0",
        "trainer.logger=['console', 'wandb']",
        "trainer.project_name=verl_grpo_example_qwen2-0.5b",
        "trainer.experiment_name=qwen2-0.5b_example",
        "trainer.n_gpus_per_node=2",
        "trainer.nnodes=1",
        "trainer.test_freq=5",
        f"trainer.default_local_dir={MODELS_PATH}",
        "trainer.resume_mode=auto",
        # Parameters chosen to ensure easy automated testing. Remove if needed.
        "trainer.save_freq=1",
        "trainer.total_training_steps=1",
        "trainer.total_epochs=1",
        # For the custom reward function.
        f"custom_reward_function.path={str(PATH_TO_REWARD_FUNCTION)}",
        f"custom_reward_function.name={REWARD_FUNCTION_NAME}",
    ]
    if arglist:
        cmd.extend(arglist)

    subprocess.run(cmd, check=True)


\`\`\`

You can now run the training using \`modal run --detach grpo_verl.py::train\`, or pass in any [additional args from the CLI](https://modal.com/docs/guide/apps#argument-parsing) like this \`modal run --detach grpo.py::train -- trainer.total_epochs=20 actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu=16\`.

## Performing inference on the trained model

We use vLLM to perform inference on the trained model.

\`\`\`python
VLLM_PORT: int = 8000


\`\`\`

Once you have the model checkpoints in your Modal Volume, you can load the weights and perform inference using vLLM. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).
The weights path is as follows: \`global_step_n/actor/huggingface\` where n is the checkpoint you want (e.g. \`global_step_5/actor/huggingface\`).
The \`latest_checkpointed_iteration.txt\` file stores the most recent checkpoint index.

\`\`\`python
def get_latest_checkpoint_file_path():
    with open(MODELS_PATH / "latest_checkpointed_iteration.txt") as f:
        latest_checkpoint_index = int(f.read())
    return str(
        MODELS_PATH / f"global_step_{latest_checkpoint_index}" / "actor" / "huggingface"
    )


\`\`\`

We provide the code for setting up an OpenAI compatible inference endpoint here. For more details re. serving models on vLLM, check out [this example.](https://modal.com/docs/examples/vllm_inference#deploy-the-server)

\`\`\`python
vllm_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "vllm==0.9.1",
        "flashinfer-python==0.2.6.post1",
        extra_index_url="https://download.pytorch.org/whl/cu128",
        extra_options="--index-strategy unsafe-best-match",
    )
    .env({"VLLM_USE_V1": "1"})
)

vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)


@app.function(
    image=vllm_image,
    gpu="H100:2",
    scaledown_window=15 * MINUTES,  # How long should we stay up with no requests?
    timeout=10 * MINUTES,  # How long should we wait for container start?
    volumes={"/root/.cache/vllm": vllm_cache_vol, MODELS_PATH: checkpoints_volume},
)
@modal.concurrent(
    max_inputs=32
)  # How many requests can one replica handle? Tune carefully!
@modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
def serve():
    import subprocess

    latest_checkpoint_file_path = get_latest_checkpoint_file_path()

    cmd = [
        "vllm",
        "serve",
        "--uvicorn-log-level=info",
        latest_checkpoint_file_path,
        "--host",
        "0.0.0.0",
        "--port",
        str(VLLM_PORT),
        "--tensor-parallel-size",
        "2",
    ]
    subprocess.Popen(" ".join(cmd), shell=True)


\`\`\`

You can then deploy the server using \`modal deploy grpo_verl.py\`, which gives you a custom URL. You can then query it using the following curl command:

\`\`\`bash
curl -X POST <url>/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant for solving math problems."},
      {"role": "user", "content": "James had 4 apples. Mary gave him 2 and he ate 1. How many does he have left?"}
    ],
    "temperature": 0.7
  }'
\`\`\`

or in the [following ways](https://modal.com/docs/examples/vllm_inference#interact-with-the-server).
`,meta:{title:`Train a model to solve math problems using GRPO and verl`,description:`This example demonstrates how to train with GRPO on Modal using the verl framework. GRPO is a reinforcement learning algorithm introduced by DeepSeek, and was used to train DeepSeek R1. verl is a reinforcement learning training library that is an implementation of HybridFlow, an RLHF framework.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to train with <!> on Modal using the <!> framework.
GRPO is a reinforcement learning algorithm introduced by DeepSeek, and was used to train DeepSeek R1.
verl is a reinforcement learning training library that is an implementation of <!>, an RLHF framework.</p> <p>The training process works as follows:</p> <ul><li>Each example in the dataset corresponds to a math problem.</li> <li>In each training step, the model attempts to solve the math problems showing its steps.</li> <li>We then compute a reward for the model’s solution using the reward function defined below.</li> <li>That reward value is then used to update the model’s parameters according to the GRPO training algorithm.</li></ul> <!> <p>Import the necessary modules for Modal deployment.</p> <!> <!> <!> <p>We define an image where we clone the verl repo and install its dependencies. We use a base verl image as a starting point.</p> <!> <!> <p>In this example, we’ll use reinforcement learning to train a model to solve math problems.
We use the <!> dataset of math problems and a <!> to store the data.</p> <!> <p>We write a Modal Function to populate the Volume with the data. This downloads the dataset and stores it in the Volume.
You will need to run this step if you don’t already have data you’d like to use for this example.</p> <!> <p>You can kick off the dataset download with <code>modal run &lt;filename.py&gt;::prep_dataset</code></p> <!> <p>In reinforcement learning, we define a reward function for the model.
We can define this in a separate file, or in the same file as in this case that we then pass as an argument to verl.
We use a <code>default</code> reward function for GSM8K from the <!>, modified to return 1.0 if it’s a correct answer and 0 otherwise.</p> <!> <p>Reward functions need to follow a <!></p> <!> <p>We then define constants to pass into verl during the training run.</p> <!> <!> <p>We define some more constants for the training run.</p> <!> <p>We also define a Volume for storing model checkpoints.</p> <!> <p>Now, we write a Modal Function for kicking off the training run.
If you wish to use Weights & Biases, as we do in this code, you’ll need to create a Weights & Biases <!></p> <p>verl uses Ray under the hood. It creates Ray workers for each step where each Ray worker is a python process and each step is a step in the RL dataflow pipeline.
verl also keeps a separate control flow process that’s independent of this, responsible for figuring out what step in the RL pipeline to execute.
Each Ray worker gets mapped onto 1 or more GPUs. Depending on the number of GPUs available, Ray will decide what workers go where, or to hold off scheduling workers
if there are no available GPUs. Generally, more VRAM = less hot-swapping of Ray workers, which means less waiting around for memory copying each iteration.
In this example we have chosen a configuration that allows for easy automated testing, but you may wish to use more GPUs or more powerful GPU types.
More details <!>.</p> <!> <p>You can now run the training using <code>modal run --detach grpo_verl.py::train</code>, or pass in any <!> like this <code>modal run --detach grpo.py::train -- trainer.total_epochs=20 actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu=16</code>.</p> <!> <p>We use vLLM to perform inference on the trained model.</p> <!> <p>Once you have the model checkpoints in your Modal Volume, you can load the weights and perform inference using vLLM. For more on storing model weights on Modal, see <!>.
The weights path is as follows: <code>global_step_n/actor/huggingface</code> where n is the checkpoint you want (e.g. <code>global_step_5/actor/huggingface</code>).
The <code>latest_checkpointed_iteration.txt</code> file stores the most recent checkpoint index.</p> <!> <p>We provide the code for setting up an OpenAI compatible inference endpoint here. For more details re. serving models on vLLM, check out <!></p> <!> <p>You can then deploy the server using <code>modal deploy grpo_verl.py</code>, which gives you a custom URL. You can then query it using the following curl command:</p> <!> <p>or in the <!>.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`train-a-model-to-solve-math-problems-using-grpo-and-verl`,children:(e,t)=>{l(),i(e,r(`Train a model to solve math problems using GRPO and verl`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://arxiv.org/pdf/2402.03300`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GRPO`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://github.com/volcengine/verl`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verl`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://arxiv.org/abs/2409.19256v2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HybridFlow`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,6);u(v,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var b=c(v,4);f(b,{code:`import%20re%0Aimport%20subprocess%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Literal%2C%20Optional%0A%0Aimport%20modal%0A`,lang:`python`});var x=c(b,2);u(x,{id:`defining-the-image-and-app`,children:(e,t)=>{l(),i(e,r(`Defining the image and app`))},$$slots:{default:!0}});var S=c(x,2);f(S,{code:`app%20%3D%20modal.App(%22example-grpo-verl%22)%0A`,lang:`python`});var C=c(S,4);f(C,{code:`VERL_REPO_PATH%3A%20Path%20%3D%20Path(%22%2Froot%2Fverl%22)%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22verlai%2Fverl%3Aapp-verl0.4-vllm0.8.5-mcore0.12.1%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.run_commands(f%22git%20clone%20https%3A%2F%2Fgithub.com%2Fvolcengine%2Fverl%20%7BVERL_REPO_PATH%7D%22)%0A%20%20%20%20.uv_pip_install(%22verl%5Bvllm%5D%3D%3D0.4.1%22)%0A)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`defining-the-dataset`,children:(e,t)=>{l(),i(e,r(`Defining the dataset`))},$$slots:{default:!0}});var T=c(w,2),E=c(e(T));m(E,{href:`https://huggingface.co/datasets/openai/gsm8k`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GSM8K`))},$$slots:{default:!0}}),m(c(E,2),{href:`https://modal.com/docs/guide/volumes#volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(T);var D=c(T,2);f(D,{code:`DATA_PATH%3A%20Path%20%3D%20Path(%22%2Fdata%22)%0Adata_volume%3A%20modal.Volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22grpo-verl-example-data%22%2C%20create_if_missing%3DTrue%0A)%0A%0A`,lang:`python`});var O=c(D,4);f(O,{code:`%40app.function(image%3Dimage%2C%20volumes%3D%7BDATA_PATH%3A%20data_volume%7D)%0Adef%20prep_dataset()%20-%3E%20None%3A%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20VERL_REPO_PATH%20%2F%20%22examples%22%20%2F%20%22data_preprocess%22%20%2F%20%22gsm8k.py%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--local_dir%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20DATA_PATH%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var k=c(O,4);u(k,{id:`defining-a-reward-function`,children:(e,t)=>{l(),i(e,r(`Defining a reward function`))},$$slots:{default:!0}});var A=c(k,2);m(c(e(A),3),{href:`https://github.com/volcengine/verl/blob/v0.1/verl/utils/reward_score/gsm8k.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verl repo`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);f(j,{code:`def%20extract_solution(%0A%20%20%20%20solution_str%3A%20str%2C%20method%3A%20Literal%5B%22strict%22%2C%20%22flexible%22%5D%20%3D%20%22strict%22%0A)%20-%3E%20Optional%5Bstr%5D%3A%0A%20%20%20%20assert%20method%20in%20%5B%22strict%22%2C%20%22flexible%22%5D%0A%0A%20%20%20%20if%20method%20%3D%3D%20%22strict%22%3A%0A%20%20%20%20%20%20%20%20%23%20This%20also%20tests%20the%20formatting%20of%20the%20model%0A%20%20%20%20%20%20%20%20solution%20%3D%20re.search(%22%23%23%23%23%20(%5C%5C-%3F%5B0-9%5C%5C.%5C%5C%2C%5D%2B)%22%2C%20solution_str)%0A%20%20%20%20%20%20%20%20if%20solution%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20final_answer%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20final_answer%20%3D%20solution.group(0)%0A%20%20%20%20%20%20%20%20%20%20%20%20final_answer%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20final_answer.split(%22%23%23%23%23%20%22)%5B1%5D.replace(%22%2C%22%2C%20%22%22).replace(%22%24%22%2C%20%22%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20elif%20method%20%3D%3D%20%22flexible%22%3A%0A%20%20%20%20%20%20%20%20answer%20%3D%20re.findall(%22(%5C%5C-%3F%5B0-9%5C%5C.%5C%5C%2C%5D%2B)%22%2C%20solution_str)%0A%20%20%20%20%20%20%20%20final_answer%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20%20%20%20%20if%20len(answer)%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20No%20reward%20if%20there%20is%20no%20answer.%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20invalid_str%3A%20list%5Bstr%5D%20%3D%20%5B%22%22%2C%20%22.%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Find%20the%20last%20number%20that%20is%20not%20'.'%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20final_answer%20in%20reversed(answer)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20final_answer%20not%20in%20invalid_str%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20return%20final_answer%0A%0A`,lang:`python`});var M=c(j,2);m(c(e(M)),{href:`https://verl.readthedocs.io/en/latest/preparation/reward_function.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`predefined signature.`))},$$slots:{default:!0}}),n(M);var N=c(M,2);f(N,{code:`def%20compute_reward(%0A%20%20%20%20data_source%3A%20str%2C%20solution_str%3A%20str%2C%20ground_truth%3A%20str%2C%20extra_info%3A%20dict%0A)%20-%3E%20float%3A%0A%20%20%20%20answer%20%3D%20extract_solution(solution_str%3Dsolution_str%2C%20method%3D%22strict%22)%0A%20%20%20%20if%20answer%20is%20None%3A%0A%20%20%20%20%20%20%20%20return%200.0%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20if%20answer%20%3D%3D%20ground_truth%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%201.0%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%200.0%0A%0A`,lang:`python`});var P=c(N,4);f(P,{code:`PATH_TO_REWARD_FUNCTION%3A%20Path%20%3D%20Path(%22%2Froot%2Fgrpo_verl.py%22)%0AREWARD_FUNCTION_NAME%3A%20str%20%3D%20%22compute_reward%22%0A`,lang:`python`});var F=c(P,2);u(F,{id:`kicking-off-a-training-run`,children:(e,t)=>{l(),i(e,r(`Kicking off a training run`))},$$slots:{default:!0}});var I=c(F,4);f(I,{code:`MODELS_PATH%3A%20Path%20%3D%20Path(%22%2Fmodels%22)%0AMINUTES%3A%20int%20%3D%2060%0A%0A`,lang:`python`});var L=c(I,4);f(L,{code:`checkpoints_volume%3A%20modal.Volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22grpo-verl-example-checkpoints%22%2C%20create_if_missing%3DTrue%0A)%0A`,lang:`python`});var R=c(L,2);m(c(e(R)),{href:`https://modal.com/docs/guide/secrets#secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secret.`))},$$slots:{default:!0}}),n(R);var z=c(R,2);m(c(e(z)),{href:`https://verl.readthedocs.io/en/latest/hybrid_flow.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,2);f(B,{code:`%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%3A2%22%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20MODELS_PATH%3A%20checkpoints_volume%2C%0A%20%20%20%20%20%20%20%20DATA_PATH%3A%20data_volume%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22wandb-secret%22)%5D%2C%0A%20%20%20%20timeout%3D24%20*%2060%20*%20MINUTES%2C%0A)%0Adef%20train(*arglist)%20-%3E%20None%3A%0A%20%20%20%20data_volume.reload()%0A%0A%20%20%20%20cmd%3A%20list%5Bstr%5D%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22verl.trainer.main_ppo%22%2C%0A%20%20%20%20%20%20%20%20%22algorithm.adv_estimator%3Dgrpo%22%2C%0A%20%20%20%20%20%20%20%20f%22data.train_files%3D%7BDATA_PATH%20%2F%20'train.parquet'%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22data.val_files%3D%7BDATA_PATH%20%2F%20'test.parquet'%7D%22%2C%0A%20%20%20%20%20%20%20%20%22data.train_batch_size%3D128%22%2C%0A%20%20%20%20%20%20%20%20%22data.max_prompt_length%3D64%22%2C%0A%20%20%20%20%20%20%20%20%22data.max_response_length%3D1024%22%2C%0A%20%20%20%20%20%20%20%20%22data.filter_overlong_prompts%3DTrue%22%2C%0A%20%20%20%20%20%20%20%20%22data.truncation%3Derror%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.model.path%3DQwen%2FQwen2-0.5B%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.optim.lr%3D1e-6%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.model.use_remove_padding%3DFalse%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.ppo_mini_batch_size%3D128%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.ppo_micro_batch_size_per_gpu%3D16%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.checkpoint.save_contents%3D'model%2Coptimizer%2Cextra%2Chf_model'%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.use_kl_loss%3DTrue%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.entropy_coeff%3D0%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.kl_loss_coef%3D0.001%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.kl_loss_type%3Dlow_var_kl%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.model.enable_gradient_checkpointing%3DTrue%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.fsdp_config.param_offload%3DFalse%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.actor.fsdp_config.optimizer_offload%3DFalse%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.rollout.tensor_model_parallel_size%3D2%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.rollout.log_prob_micro_batch_size_per_gpu%3D16%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.rollout.name%3Dvllm%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.rollout.gpu_memory_utilization%3D0.4%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.rollout.n%3D5%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu%3D16%22%2C%0A%20%20%20%20%20%20%20%20%22actor_rollout_ref.ref.fsdp_config.param_offload%3DTrue%22%2C%0A%20%20%20%20%20%20%20%20%22algorithm.use_kl_in_reward%3DFalse%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.critic_warmup%3D0%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.logger%3D%5B'console'%2C%20'wandb'%5D%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.project_name%3Dverl_grpo_example_qwen2-0.5b%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.experiment_name%3Dqwen2-0.5b_example%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.n_gpus_per_node%3D2%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.nnodes%3D1%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.test_freq%3D5%22%2C%0A%20%20%20%20%20%20%20%20f%22trainer.default_local_dir%3D%7BMODELS_PATH%7D%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.resume_mode%3Dauto%22%2C%0A%20%20%20%20%20%20%20%20%23%20Parameters%20chosen%20to%20ensure%20easy%20automated%20testing.%20Remove%20if%20needed.%0A%20%20%20%20%20%20%20%20%22trainer.save_freq%3D1%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.total_training_steps%3D1%22%2C%0A%20%20%20%20%20%20%20%20%22trainer.total_epochs%3D1%22%2C%0A%20%20%20%20%20%20%20%20%23%20For%20the%20custom%20reward%20function.%0A%20%20%20%20%20%20%20%20f%22custom_reward_function.path%3D%7Bstr(PATH_TO_REWARD_FUNCTION)%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22custom_reward_function.name%3D%7BREWARD_FUNCTION_NAME%7D%22%2C%0A%20%20%20%20%5D%0A%20%20%20%20if%20arglist%3A%0A%20%20%20%20%20%20%20%20cmd.extend(arglist)%0A%0A%20%20%20%20subprocess.run(cmd%2C%20check%3DTrue)%0A%0A`,lang:`python`});var V=c(B,2);m(c(e(V),3),{href:`https://modal.com/docs/guide/apps#argument-parsing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`additional args from the CLI`))},$$slots:{default:!0}}),l(3),n(V);var H=c(V,2);u(H,{id:`performing-inference-on-the-trained-model`,children:(e,t)=>{l(),i(e,r(`Performing inference on the trained model`))},$$slots:{default:!0}});var U=c(H,4);f(U,{code:`VLLM_PORT%3A%20int%20%3D%208000%0A%0A`,lang:`python`});var W=c(U,2);m(c(e(W)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(7),n(W);var G=c(W,2);f(G,{code:`def%20get_latest_checkpoint_file_path()%3A%0A%20%20%20%20with%20open(MODELS_PATH%20%2F%20%22latest_checkpointed_iteration.txt%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20latest_checkpoint_index%20%3D%20int(f.read())%0A%20%20%20%20return%20str(%0A%20%20%20%20%20%20%20%20MODELS_PATH%20%2F%20f%22global_step_%7Blatest_checkpoint_index%7D%22%20%2F%20%22actor%22%20%2F%20%22huggingface%22%0A%20%20%20%20)%0A%0A`,lang:`python`});var K=c(G,2);m(c(e(K)),{href:`https://modal.com/docs/examples/vllm_inference#deploy-the-server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example.`))},$$slots:{default:!0}}),n(K);var q=c(K,2);f(q,{code:`vllm_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22vllm%3D%3D0.9.1%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer-python%3D%3D0.2.6.post1%22%2C%0A%20%20%20%20%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22VLLM_USE_V1%22%3A%20%221%22%7D)%0A)%0A%0Avllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3D%22H100%3A2%22%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%20%20%23%20How%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%20%20%23%20How%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%20MODELS_PATH%3A%20checkpoints_volume%7D%2C%0A)%0A%40modal.concurrent(%0A%20%20%20%20max_inputs%3D32%0A)%20%20%23%20How%20many%20requests%20can%20one%20replica%20handle%3F%20Tune%20carefully!%0A%40modal.web_server(port%3DVLLM_PORT%2C%20startup_timeout%3D10%20*%20MINUTES)%0Adef%20serve()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20latest_checkpoint_file_path%20%3D%20get_latest_checkpoint_file_path()%0A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%22--uvicorn-log-level%3Dinfo%22%2C%0A%20%20%20%20%20%20%20%20latest_checkpoint_file_path%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%20%20%20%20%22--tensor-parallel-size%22%2C%0A%20%20%20%20%20%20%20%20%222%22%2C%0A%20%20%20%20%5D%0A%20%20%20%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue)%0A%0A`,lang:`python`});var J=c(q,4);f(J,{code:`curl%20-X%20POST%20%3Curl%3E%2Fv1%2Fchat%2Fcompletions%20%5C%0A%20%20-H%20'Content-Type%3A%20application%2Fjson'%20%5C%0A%20%20-d%20'%7B%0A%20%20%20%20%22messages%22%3A%20%5B%0A%20%20%20%20%20%20%7B%22role%22%3A%20%22system%22%2C%20%22content%22%3A%20%22You%20are%20a%20helpful%20assistant%20for%20solving%20math%20problems.%22%7D%2C%0A%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22James%20had%204%20apples.%20Mary%20gave%20him%202%20and%20he%20ate%201.%20How%20many%20does%20he%20have%20left%3F%22%7D%0A%20%20%20%20%5D%2C%0A%20%20%20%20%22temperature%22%3A%200.7%0A%20%20%7D'`,lang:`bash`});var Y=c(J,2);m(c(e(Y)),{href:`https://modal.com/docs/examples/vllm_inference#interact-with-the-server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`following ways`))},$$slots:{default:!0}}),l(),n(Y),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=C_npWqWs2.js.map
