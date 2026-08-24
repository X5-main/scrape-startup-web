(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8c447d7c-a788-45cf-9f8a-a0444b151e8a`,e._sentryDebugIdIdentifier=`sentry-dbid-8c447d7c-a788-45cf-9f8a-a0444b151e8a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Efficient LLM Finetuning with Unsloth`,id:`efficient-llm-finetuning-with-unsloth`,children:[{depth:2,value:`Modal Infrastructure Setup`,id:`modal-infrastructure-setup`,children:[{depth:3,value:`Container Image Configuration`,id:`container-image-configuration`},{depth:3,value:`Volume Configuration`,id:`volume-configuration`},{depth:3,value:`Picking a GPU`,id:`picking-a-gpu`}]},{depth:2,value:`Data Processing`,id:`data-processing`},{depth:2,value:`Loading the pretrained model`,id:`loading-the-pretrained-model`},{depth:2,value:`Training Configuration`,id:`training-configuration`},{depth:2,value:`Main Training Function`,id:`main-training-function`},{depth:2,value:`Utility Functions`,id:`utility-functions`}]}],rawContent:`# Efficient LLM Finetuning with Unsloth

Training large language models is an incredibly compute-hungry process.
Open-source LLMs often require many GBs (or in extreme cases,
[one TB](https://github.com/MoonshotAI/Kimi-K2#2-model-summary)!) of
VRAM just to fit in memory. Finetuning models requires even more memory;
a common estimate for naive finetuning puts the VRAM requirements at roughly
4.2x the original model size:
1x for model weights + 1x for gradients + 2x for optimizer state + 20% for activations.
Parameter efficient methods like LoRA can improve matters significantly, since
this estimate now applies to just the LoRA modules' weights, rather than the entire
model's. Further gains can be made with quantization of each of the components mentioned
above, but doing so requires quantization-aware training, which can be tricky to
combine with methods like LoRA.

Unsloth provides optimized methods for LLM finetuning with LoRA and quantization,
leading to typical performance gains of 2x faster training with 70% less memory usage.
This example demonstrates using Unsloth to finetune a version of Qwen3-14B with the
FineTome-100k dataset on Modal using only a single GPU!

## Modal Infrastructure Setup

\`\`\`python
import pathlib
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

import modal

\`\`\`

We create a Modal [App](https://modal.com/docs/guide/apps) to organize our functions
and shared infrastructure like container images and volumes.

\`\`\`python
app = modal.App("example-unsloth-finetune")

\`\`\`

### Container Image Configuration

We build a custom container image with Unsloth and all necessary dependencies.
The image includes the latest version of Unsloth (as of writing) with optimizations
for the latest model architectures. Once the image is defined, we can specify the
imports we'll need to write the rest of our training code. Importantly, we import
\`unsloth\` before the rest so that Unsloth's patches are applied to packages like
\`transformers\`, \`peft\`, and \`trl\`.

\`\`\`python
train_image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install(
        "accelerate==1.9.0",
        "datasets==3.6.0",
        "hf-transfer==0.1.9",
        "huggingface_hub==0.34.2",
        "peft==0.16.0",
        "transformers==4.54.0",
        "trl==0.19.1",
        "unsloth[cu128-torch270]==2025.7.8",
        "unsloth_zoo==2025.7.10",
        "wandb==0.21.0",
    )
    .env({"HF_HOME": "/model_cache"})
)

with train_image.imports():
    # unsloth must be first!
    import unsloth  # noqa: F401,I001
    import datasets
    import torch
    import wandb
    from transformers import TrainingArguments
    from trl import SFTTrainer
    from unsloth import FastLanguageModel
    from unsloth.chat_templates import standardize_sharegpt

\`\`\`

### Volume Configuration

Modal [Volumes](https://modal.com/docs/guide/volumes) provide storage that persists
between function invocations. We use separate volumes for different types of data to
enable efficient caching and sharing:
- A cache for [pretrained model weights](https://modal.com/docs/guide/model-weights) - reused across all experiments
- A cache for processed datasets - reused when using the same dataset
- Storage for training checkpoints and final models

\`\`\`python
model_cache_volume = modal.Volume.from_name(
    "unsloth-model-cache", create_if_missing=True
)
dataset_cache_volume = modal.Volume.from_name(
    "unsloth-dataset-cache", create_if_missing=True
)
checkpoint_volume = modal.Volume.from_name(
    "unsloth-checkpoints", create_if_missing=True
)

\`\`\`

### Picking a GPU

We use L40S for its healthy balance of [VRAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram),
[CUDA cores](https://modal.com/gpu-glossary/device-hardware/cuda-core), and clock speed.
The timeout provides an upper bound on our training time; if our training run finishes faster,
we won't end up using the full 6 hours. We also specify 3 retries, which will be useful
in case our training function gets [preempted](https://modal.com/docs/guide/preemption).

\`\`\`python
GPU_TYPE = "L40S"
TIMEOUT_HOURS = 6
MAX_RETRIES = 3

\`\`\`

## Data Processing

We'll be finetuning our model on the FineTome-100k dataset, which is
subset of [The Tome](https://huggingface.co/datasets/arcee-ai/The-Tome)
curated with [fineweb-edu-classifier](https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier)
Below we define some helpers for processing this dataset.

\`\`\`python
CONVERSATION_COLUMN = "conversations"  # ShareGPT format column name
TEXT_COLUMN = "text"  # Output column for formatted text
TRAIN_SPLIT_RATIO = 0.9  # 90% train, 10% eval split
PREPROCESSING_WORKERS = 2  # Number of workers for dataset processing


def format_chat_template(examples, tokenizer):
    texts = []
    for conversation in examples[CONVERSATION_COLUMN]:
        formatted_text = tokenizer.apply_chat_template(
            conversation, tokenize=False, add_generation_prompt=False
        )
        texts.append(formatted_text)
    return {TEXT_COLUMN: texts}


def load_or_cache_dataset(config: "TrainingConfig", paths: dict, tokenizer):
    dataset_cache_path = paths["dataset_cache"]

    if dataset_cache_path.exists():
        print(f"Loading cached dataset from {dataset_cache_path}")
        train_dataset = datasets.load_from_disk(dataset_cache_path / "train")
        eval_dataset = datasets.load_from_disk(dataset_cache_path / "eval")
    else:
        print(f"Downloading and processing dataset: {config.dataset_name}")

        # Load and standardize the dataset format
        dataset = datasets.load_dataset(config.dataset_name, split="train")
        dataset = standardize_sharegpt(dataset)

        # Split into training and evaluation sets with fixed seed for reproducibility
        dataset = dataset.train_test_split(
            test_size=1.0 - TRAIN_SPLIT_RATIO, seed=config.seed
        )
        train_dataset = dataset["train"]
        eval_dataset = dataset["test"]

        # Apply chat template formatting to convert conversations to text
        print("Formatting datasets with chat template...")
        train_dataset = train_dataset.map(
            lambda examples: format_chat_template(examples, tokenizer),
            batched=True,
            num_proc=PREPROCESSING_WORKERS,
            remove_columns=train_dataset.column_names,
        )

        eval_dataset = eval_dataset.map(
            lambda examples: format_chat_template(examples, tokenizer),
            batched=True,
            num_proc=PREPROCESSING_WORKERS,
            remove_columns=eval_dataset.column_names,
        )

        # Cache the processed datasets for future runs
        print(f"Caching processed datasets to {dataset_cache_path}")
        dataset_cache_path.mkdir(parents=True, exist_ok=True)
        train_dataset.save_to_disk(dataset_cache_path / "train")
        eval_dataset.save_to_disk(dataset_cache_path / "eval")

        # Commit the dataset cache to the volume
        dataset_cache_volume.commit()

    return train_dataset, eval_dataset


\`\`\`

## Loading the pretrained model

We can't finetune without a pretarined model! Since these models are
fairly large, we don't want to download them from scratch for each training run.
We solve this by caching the weights in a Volume on download, and then loading
from the Volume on subsequent runs.

\`\`\`python
def load_or_cache_model(config: "TrainingConfig", paths: dict):
    print(f"Downloading and caching model: {config.model_name}")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=config.model_name,
        max_seq_length=config.max_seq_length,
        dtype=None,
        load_in_4bit=config.load_in_4bit,
        load_in_8bit=config.load_in_8bit,
    )

    return model, tokenizer


\`\`\`

## Training Configuration
First we'll define what layers our LoRA modules should target.
Generally, it's advisable to LoRA finetune every linear layer in the model,
so we target every projection matrix of each attention layer.

\`\`\`python
LORA_TARGET_MODULES = [
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj",
]


\`\`\`

We want to expose the different hyperparameters and optimizations that
Unsloth supports, so we wrap them into a \`TrainingConfig\` class. Later,
we'll populate this config with arguments from the command line.

\`\`\`python
@dataclass
class TrainingConfig:
    # Model and dataset selection
    model_name: str
    dataset_name: str
    max_seq_length: int
    load_in_4bit: bool
    load_in_8bit: bool

    # LoRA configuration for efficient finetuning
    lora_r: int
    lora_alpha: int
    lora_dropout: float
    lora_bias: str
    use_rslora: bool

    # Training hyperparameters
    optim: str
    batch_size: int
    gradient_accumulation_steps: int
    packing: bool
    use_gradient_checkpointing: str
    learning_rate: float
    lr_scheduler_type: str
    warmup_ratio: float
    weight_decay: float
    max_steps: int
    save_steps: int
    eval_steps: int
    logging_steps: int

    # Experiment management
    seed: int
    experiment_name: Optional[str] = None
    enable_wandb: bool = True

    # For testing purposes
    skip_eval: bool = False

    def __post_init__(self):
        # Generate a unique experiment name if not provided
        if self.experiment_name is None:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            model_short = self.model_name.split("/")[-1]
            self.experiment_name = f"{model_short}-r{self.lora_r}-{timestamp}"


\`\`\`

## Main Training Function

This function orchestrates the entire training process, from model loading
to final model saving. It's decorated with Modal function configuration
that specifies the compute resources, the volumes needed, and execution
details like timeout and retries.

\`\`\`python
@app.function(
    image=train_image,
    gpu=GPU_TYPE,
    volumes={
        "/model_cache": model_cache_volume,
        "/dataset_cache": dataset_cache_volume,
        "/checkpoints": checkpoint_volume,
    },
    secrets=[modal.Secret.from_name("wandb-secret")],
    timeout=TIMEOUT_HOURS * 60 * 60,
    retries=modal.Retries(initial_delay=0.0, max_retries=MAX_RETRIES),
    single_use_containers=True,  # Ensure we get a fresh container on retry
)
def finetune(config: TrainingConfig):
    # Get structured paths for organized file storage
    paths = get_structured_paths(config)

    # Initialize Weights & Biases for experiment tracking if enabled
    if config.enable_wandb:
        wandb.init(
            project="unsloth-finetune",
            name=config.experiment_name,
            config=config.__dict__,
        )

    # Load or cache model and datasets with progress indicators
    print("Setting up model and data...")
    model, tokenizer = load_or_cache_model(config, paths)
    train_dataset, eval_dataset = load_or_cache_dataset(config, paths, tokenizer)

    # Configure the model for LoRA training
    model = setup_model_for_training(model, config)

    # Prepare checkpoint directory and check for existing checkpoints
    checkpoint_path = paths["checkpoints"]
    checkpoint_path.mkdir(parents=True, exist_ok=True)
    resume_from_checkpoint = check_for_existing_checkpoint(paths)

    # Create training configuration
    training_args = create_training_arguments(config, str(checkpoint_path))

    # Initialize the supervised finetuning trainer
    print("Initializing SFTTrainer...")
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        dataset_text_field=TEXT_COLUMN,
        max_seq_length=config.max_seq_length,
        dataset_num_proc=PREPROCESSING_WORKERS,
        packing=config.packing,  # Sequence packing for efficiency
        args=training_args,
    )

    # Display training information for transparency
    print(f"Training dataset size: {len(train_dataset):,}")
    print(f"Evaluation dataset size: {len(eval_dataset):,}")
    print(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")
    print(
        f"Trainable parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}"
    )
    print(f"Experiment: {config.experiment_name}")

    # Start training or resume from checkpoint
    if resume_from_checkpoint:
        print(f"Resuming training from {resume_from_checkpoint}")
        trainer.train(resume_from_checkpoint=resume_from_checkpoint)
    else:
        print("Starting training from scratch...")
        trainer.train()

    # Save the final trained model and tokenizer
    print("Saving final model...")
    final_model_path = checkpoint_path / "final_model"
    model.save_pretrained(final_model_path)
    tokenizer.save_pretrained(final_model_path)

    # Clean up experiment tracking
    if config.enable_wandb:
        wandb.finish()

    print(f"Training completed! Model saved to: {final_model_path}")
    return config.experiment_name


\`\`\`

Finally, we invoke our training function from an
[\`App.local_entrypoint\`](https://modal.com/docs/reference/modal.App#local_entrypoint).
Arguments to this function automatically get converted into CLI flags that
can be specified when we [\`modal run\`](https://modal.com/docs/reference/cli/run#modal-run)
our code. This allows us to do things like tweak hyperparameters directly
from the command line without modifying our source code.

To try this example, checkout the examples repo, install the Modal client, and run
\`\`\`bash
modal run 06_gpu_and_ml/unsloth_finetune.py
\`\`\`

You can also customize the training process by tweaking hyperparameters with command line
flags, e.g.
\`\`\`bash
modal run 06_gpu_and_ml/unsloth_finetune.py --max-steps 10000
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    # Model and dataset configuration
    model_name: str = "unsloth/Qwen3-32B",
    dataset_name: str = "mlabonne/FineTome-100k",
    max_seq_length: int = 32768,
    load_in_4bit: bool = True,  # unsloth: use 4bit quant for frozen model weights
    load_in_8bit: bool = False,  # unsloth: use 8bit quant for frozen model weights
    # LoRA hyperparameters for finetuning efficiency
    lora_r: int = 16,
    lora_alpha: int = 16,
    lora_dropout: float = 0.0,
    lora_bias: str = "none",  # unsloth: optimized lora kernel
    use_rslora: bool = False,
    # Training hyperparameters for optimization
    optim: str = "adamw_8bit",  # unsloth: 8bit optimizer
    batch_size: int = 16,
    gradient_accumulation_steps: int = 1,
    packing: bool = False,
    use_gradient_checkpointing: str = "unsloth",  # unsloth: optimized gradient offloading
    learning_rate: float = 2e-4,
    lr_scheduler_type: str = "cosine",
    warmup_ratio: float = 0.06,
    weight_decay: float = 0.01,
    max_steps: int = 5,  # increase!
    save_steps: int = 2,  # increase!
    eval_steps: int = 2,  # increase!
    logging_steps: int = 1,  # increase!
    # Optional experiment configuration
    seed: int = 105,
    experiment_name: Optional[str] = None,
    disable_wandb: bool = True,
    skip_eval: bool = False,
):
    # Create configuration object from command line arguments
    config = TrainingConfig(
        model_name=model_name,
        dataset_name=dataset_name,
        max_seq_length=max_seq_length,
        load_in_4bit=load_in_4bit,
        load_in_8bit=load_in_8bit,
        lora_r=lora_r,
        lora_alpha=lora_alpha,
        lora_bias=lora_bias,
        lora_dropout=lora_dropout,
        use_rslora=use_rslora,
        optim=optim,
        batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        packing=packing,
        use_gradient_checkpointing=use_gradient_checkpointing,
        learning_rate=learning_rate,
        max_steps=max_steps,
        lr_scheduler_type=lr_scheduler_type,
        warmup_ratio=warmup_ratio,
        weight_decay=weight_decay,
        save_steps=save_steps,
        eval_steps=eval_steps,
        logging_steps=logging_steps,
        seed=seed,
        experiment_name=experiment_name,
        enable_wandb=not disable_wandb,
        skip_eval=skip_eval,
    )

    # Display experiment configuration for user verification
    print(f"Starting finetuning experiment: {config.experiment_name}")
    print(f"Model: {config.model_name}")
    print(f"Dataset: {config.dataset_name}")
    print(f"LoRA configuration: rank={config.lora_r}, alpha={config.lora_alpha}")
    print(
        f"Effective batch size: {config.batch_size * config.gradient_accumulation_steps}"
    )
    print(f"Training steps: {config.max_steps}")

    # Launch the training job on Modal infrastructure
    experiment_name = finetune.remote(config)
    print(f"Training completed successfully: {experiment_name}")


\`\`\`

## Utility Functions

These functions handle the core logic for model loading, dataset processing,
and training setup. They're designed to be hackable for new use cases.

\`\`\`python
def get_structured_paths(config: TrainingConfig):
    """
    Create structured paths within the mounted volumes for organized storage.

    This function maps the configuration to specific directory paths that allow
    multiple models, datasets, and experiments to coexist without conflicts.
    """
    # Replace forward slashes in names to create valid directory names
    dataset_cache_path = (
        pathlib.Path("/dataset_cache")
        / "datasets"
        / config.dataset_name.replace("/", "--")
    )
    checkpoint_path = (
        pathlib.Path("/checkpoints") / "experiments" / config.experiment_name
    )

    return {
        "dataset_cache": dataset_cache_path,
        "checkpoints": checkpoint_path,
    }


def setup_model_for_training(model, config: TrainingConfig):
    """
    Configure the model with LoRA adapters for efficient finetuning.

    LoRA (Low-Rank Adaptation) allows us to finetune large models efficiently
    by only training a small number of additional parameters. This significantly
    reduces memory usage and training time.
    """
    print("Configuring LoRA for training...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=config.lora_r,  # LoRA rank - higher values = more parameters
        target_modules=LORA_TARGET_MODULES,  # Which layers to apply LoRA to
        lora_alpha=config.lora_alpha,  # LoRA scaling parameter
        lora_dropout=config.lora_dropout,  # Dropout for LoRA layers
        bias=config.lora_bias,  # Bias configuration
        use_gradient_checkpointing=config.use_gradient_checkpointing,  # Memory optimization
        random_state=config.seed,  # Fixed seed for reproducibility
        use_rslora=config.use_rslora,  # Rank-stabilized LoRA
        loftq_config=None,  # LoFTQ quantization config
    )
    return model


def create_training_arguments(config: TrainingConfig, output_dir: str):
    """
    Create training arguments for the SFTTrainer.

    These arguments control the training process, including optimization settings,
    evaluation frequency, and checkpointing behavior.
    """
    print("SKIP_EVAL", config.skip_eval)
    return TrainingArguments(
        # Core training configuration
        per_device_train_batch_size=config.batch_size,
        gradient_accumulation_steps=config.gradient_accumulation_steps,
        learning_rate=config.learning_rate,
        max_steps=config.max_steps,
        warmup_ratio=config.warmup_ratio,
        # Evaluation and checkpointing
        eval_steps=config.eval_steps,
        save_steps=config.save_steps,
        eval_strategy="no" if config.skip_eval else "steps",
        save_strategy="steps",
        do_eval=not config.skip_eval,
        # Optimization settings based on hardware capabilities
        fp16=not torch.cuda.is_bf16_supported(),  # Use fp16 if bf16 not available
        bf16=torch.cuda.is_bf16_supported(),  # Prefer bf16 when available
        optim=config.optim,
        weight_decay=config.weight_decay,
        lr_scheduler_type=config.lr_scheduler_type,
        # Logging and output configuration
        logging_steps=config.logging_steps,
        output_dir=output_dir,
        report_to="wandb" if config.enable_wandb else None,
        seed=config.seed,
    )


def check_for_existing_checkpoint(paths: dict):
    """
    Check if there's an existing checkpoint to resume training from.

    This enables resumable training, which is crucial for long-running experiments
    that might be interrupted by infrastructure issues or resource limits.
    """
    checkpoint_dir = paths["checkpoints"]
    if not checkpoint_dir.exists():
        return None

    # Look for the most recent checkpoint directory
    checkpoints = list(checkpoint_dir.glob("checkpoint-*"))
    if checkpoints:
        latest_checkpoint = max(checkpoints, key=lambda p: int(p.name.split("-")[1]))
        print(f"Found existing checkpoint: {latest_checkpoint}")
        return str(latest_checkpoint)

    return None

\`\`\`
`,meta:{title:`Efficient LLM Finetuning with Unsloth`,description:`Training large language models is an incredibly compute-hungry process. Open-source LLMs often require many GBs (or in extreme cases, one TB!) of VRAM just to fit in memory. Finetuning models requires even more memory; a common estimate for naive finetuning puts the VRAM requirements at roughly 4.2x the original model size: 1x for model weights + 1x for gradients + 2x for optimizer state + 20% for activations. Parameter efficient methods like LoRA can improve matters significantly, since this estimate now applies to just the LoRA modules’ weights, rather than the entire model’s. Further gains can be made with quantization of each of the components mentioned above, but doing so requires quantization-aware training, which can be tricky to combine with methods like LoRA.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>App.local_entrypoint</code>`),x=t(`<code>modal run</code>`),S=t(`<!> <p>Training large language models is an incredibly compute-hungry process.
Open-source LLMs often require many GBs (or in extreme cases, <!>!) of
VRAM just to fit in memory. Finetuning models requires even more memory;
a common estimate for naive finetuning puts the VRAM requirements at roughly
4.2x the original model size:
1x for model weights + 1x for gradients + 2x for optimizer state + 20% for activations.
Parameter efficient methods like LoRA can improve matters significantly, since
this estimate now applies to just the LoRA modules’ weights, rather than the entire
model’s. Further gains can be made with quantization of each of the components mentioned
above, but doing so requires quantization-aware training, which can be tricky to
combine with methods like LoRA.</p> <p>Unsloth provides optimized methods for LLM finetuning with LoRA and quantization,
leading to typical performance gains of 2x faster training with 70% less memory usage.
This example demonstrates using Unsloth to finetune a version of Qwen3-14B with the
FineTome-100k dataset on Modal using only a single GPU!</p> <!> <!> <p>We create a Modal <!> to organize our functions
and shared infrastructure like container images and volumes.</p> <!> <!> <p>We build a custom container image with Unsloth and all necessary dependencies.
The image includes the latest version of Unsloth (as of writing) with optimizations
for the latest model architectures. Once the image is defined, we can specify the
imports we’ll need to write the rest of our training code. Importantly, we import <code>unsloth</code> before the rest so that Unsloth’s patches are applied to packages like <code>transformers</code>, <code>peft</code>, and <code>trl</code>.</p> <!> <!> <p>Modal <!> provide storage that persists
between function invocations. We use separate volumes for different types of data to
enable efficient caching and sharing:</p> <ul><li>A cache for <!> - reused across all experiments</li> <li>A cache for processed datasets - reused when using the same dataset</li> <li>Storage for training checkpoints and final models</li></ul> <!> <!> <p>We use L40S for its healthy balance of <!>, <!>, and clock speed.
The timeout provides an upper bound on our training time; if our training run finishes faster,
we won’t end up using the full 6 hours. We also specify 3 retries, which will be useful
in case our training function gets <!>.</p> <!> <!> <p>We’ll be finetuning our model on the FineTome-100k dataset, which is
subset of <!> curated with <!> Below we define some helpers for processing this dataset.</p> <!> <!> <p>We can’t finetune without a pretarined model! Since these models are
fairly large, we don’t want to download them from scratch for each training run.
We solve this by caching the weights in a Volume on download, and then loading
from the Volume on subsequent runs.</p> <!> <!> <p>First we’ll define what layers our LoRA modules should target.
Generally, it’s advisable to LoRA finetune every linear layer in the model,
so we target every projection matrix of each attention layer.</p> <!> <p>We want to expose the different hyperparameters and optimizations that
Unsloth supports, so we wrap them into a <code>TrainingConfig</code> class. Later,
we’ll populate this config with arguments from the command line.</p> <!> <!> <p>This function orchestrates the entire training process, from model loading
to final model saving. It’s decorated with Modal function configuration
that specifies the compute resources, the volumes needed, and execution
details like timeout and retries.</p> <!> <p>Finally, we invoke our training function from an <!>.
Arguments to this function automatically get converted into CLI flags that
can be specified when we <!> our code. This allows us to do things like tweak hyperparameters directly
from the command line without modifying our source code.</p> <p>To try this example, checkout the examples repo, install the Modal client, and run</p> <!> <p>You can also customize the training process by tweaking hyperparameters with command line
flags, e.g.</p> <!> <!> <!> <p>These functions handle the core logic for model loading, dataset processing,
and training setup. They’re designed to be hackable for new use cases.</p> <!>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`efficient-llm-finetuning-with-unsloth`,children:(e,t)=>{l(),i(e,r(`Efficient LLM Finetuning with Unsloth`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://github.com/MoonshotAI/Kimi-K2#2-model-summary`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`one TB`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,4);u(_,{id:`modal-infrastructure-setup`,children:(e,t)=>{l(),i(e,r(`Modal Infrastructure Setup`))},$$slots:{default:!0}});var v=c(_,2);p(v,{code:`import%20pathlib%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20datetime%20import%20datetime%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A`,lang:`python`});var y=c(v,2);h(c(e(y)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),l(),n(y);var C=c(y,2);p(C,{code:`app%20%3D%20modal.App(%22example-unsloth-finetune%22)%0A`,lang:`python`});var w=c(C,2);d(w,{id:`container-image-configuration`,children:(e,t)=>{l(),i(e,r(`Container Image Configuration`))},$$slots:{default:!0}});var T=c(w,4);p(T,{code:`train_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.9.0%22%2C%0A%20%20%20%20%20%20%20%20%22datasets%3D%3D3.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22hf-transfer%3D%3D0.1.9%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%3D%3D0.34.2%22%2C%0A%20%20%20%20%20%20%20%20%22peft%3D%3D0.16.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.54.0%22%2C%0A%20%20%20%20%20%20%20%20%22trl%3D%3D0.19.1%22%2C%0A%20%20%20%20%20%20%20%20%22unsloth%5Bcu128-torch270%5D%3D%3D2025.7.8%22%2C%0A%20%20%20%20%20%20%20%20%22unsloth_zoo%3D%3D2025.7.10%22%2C%0A%20%20%20%20%20%20%20%20%22wandb%3D%3D0.21.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HOME%22%3A%20%22%2Fmodel_cache%22%7D)%0A)%0A%0Awith%20train_image.imports()%3A%0A%20%20%20%20%23%20unsloth%20must%20be%20first!%0A%20%20%20%20import%20unsloth%20%20%23%20noqa%3A%20F401%2CI001%0A%20%20%20%20import%20datasets%0A%20%20%20%20import%20torch%0A%20%20%20%20import%20wandb%0A%20%20%20%20from%20transformers%20import%20TrainingArguments%0A%20%20%20%20from%20trl%20import%20SFTTrainer%0A%20%20%20%20from%20unsloth%20import%20FastLanguageModel%0A%20%20%20%20from%20unsloth.chat_templates%20import%20standardize_sharegpt%0A`,lang:`python`});var E=c(T,2);d(E,{id:`volume-configuration`,children:(e,t)=>{l(),i(e,r(`Volume Configuration`))},$$slots:{default:!0}});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2),k=e(O);h(c(e(k)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`pretrained model weights`))},$$slots:{default:!0}}),l(),n(k),l(4),n(O);var A=c(O,2);p(A,{code:`model_cache_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22unsloth-model-cache%22%2C%20create_if_missing%3DTrue%0A)%0Adataset_cache_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22unsloth-dataset-cache%22%2C%20create_if_missing%3DTrue%0A)%0Acheckpoint_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22unsloth-checkpoints%22%2C%20create_if_missing%3DTrue%0A)%0A`,lang:`python`});var j=c(A,2);d(j,{id:`picking-a-gpu`,children:(e,t)=>{l(),i(e,r(`Picking a GPU`))},$$slots:{default:!0}});var M=c(j,2),N=c(e(M));h(N,{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`VRAM`))},$$slots:{default:!0}});var P=c(N,2);h(P,{href:`https://modal.com/gpu-glossary/device-hardware/cuda-core`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CUDA cores`))},$$slots:{default:!0}}),h(c(P,2),{href:`https://modal.com/docs/guide/preemption`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`preempted`))},$$slots:{default:!0}}),l(),n(M);var F=c(M,2);p(F,{code:`GPU_TYPE%20%3D%20%22L40S%22%0ATIMEOUT_HOURS%20%3D%206%0AMAX_RETRIES%20%3D%203%0A`,lang:`python`});var I=c(F,2);u(I,{id:`data-processing`,children:(e,t)=>{l(),i(e,r(`Data Processing`))},$$slots:{default:!0}});var L=c(I,2),R=c(e(L));h(R,{href:`https://huggingface.co/datasets/arcee-ai/The-Tome`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`The Tome`))},$$slots:{default:!0}}),h(c(R,2),{href:`https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`fineweb-edu-classifier`))},$$slots:{default:!0}}),l(),n(L);var z=c(L,2);p(z,{code:`CONVERSATION_COLUMN%20%3D%20%22conversations%22%20%20%23%20ShareGPT%20format%20column%20name%0ATEXT_COLUMN%20%3D%20%22text%22%20%20%23%20Output%20column%20for%20formatted%20text%0ATRAIN_SPLIT_RATIO%20%3D%200.9%20%20%23%2090%25%20train%2C%2010%25%20eval%20split%0APREPROCESSING_WORKERS%20%3D%202%20%20%23%20Number%20of%20workers%20for%20dataset%20processing%0A%0A%0Adef%20format_chat_template(examples%2C%20tokenizer)%3A%0A%20%20%20%20texts%20%3D%20%5B%5D%0A%20%20%20%20for%20conversation%20in%20examples%5BCONVERSATION_COLUMN%5D%3A%0A%20%20%20%20%20%20%20%20formatted_text%20%3D%20tokenizer.apply_chat_template(%0A%20%20%20%20%20%20%20%20%20%20%20%20conversation%2C%20tokenize%3DFalse%2C%20add_generation_prompt%3DFalse%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20texts.append(formatted_text)%0A%20%20%20%20return%20%7BTEXT_COLUMN%3A%20texts%7D%0A%0A%0Adef%20load_or_cache_dataset(config%3A%20%22TrainingConfig%22%2C%20paths%3A%20dict%2C%20tokenizer)%3A%0A%20%20%20%20dataset_cache_path%20%3D%20paths%5B%22dataset_cache%22%5D%0A%0A%20%20%20%20if%20dataset_cache_path.exists()%3A%0A%20%20%20%20%20%20%20%20print(f%22Loading%20cached%20dataset%20from%20%7Bdataset_cache_path%7D%22)%0A%20%20%20%20%20%20%20%20train_dataset%20%3D%20datasets.load_from_disk(dataset_cache_path%20%2F%20%22train%22)%0A%20%20%20%20%20%20%20%20eval_dataset%20%3D%20datasets.load_from_disk(dataset_cache_path%20%2F%20%22eval%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(f%22Downloading%20and%20processing%20dataset%3A%20%7Bconfig.dataset_name%7D%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Load%20and%20standardize%20the%20dataset%20format%0A%20%20%20%20%20%20%20%20dataset%20%3D%20datasets.load_dataset(config.dataset_name%2C%20split%3D%22train%22)%0A%20%20%20%20%20%20%20%20dataset%20%3D%20standardize_sharegpt(dataset)%0A%0A%20%20%20%20%20%20%20%20%23%20Split%20into%20training%20and%20evaluation%20sets%20with%20fixed%20seed%20for%20reproducibility%0A%20%20%20%20%20%20%20%20dataset%20%3D%20dataset.train_test_split(%0A%20%20%20%20%20%20%20%20%20%20%20%20test_size%3D1.0%20-%20TRAIN_SPLIT_RATIO%2C%20seed%3Dconfig.seed%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20train_dataset%20%3D%20dataset%5B%22train%22%5D%0A%20%20%20%20%20%20%20%20eval_dataset%20%3D%20dataset%5B%22test%22%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Apply%20chat%20template%20formatting%20to%20convert%20conversations%20to%20text%0A%20%20%20%20%20%20%20%20print(%22Formatting%20datasets%20with%20chat%20template...%22)%0A%20%20%20%20%20%20%20%20train_dataset%20%3D%20train_dataset.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20lambda%20examples%3A%20format_chat_template(examples%2C%20tokenizer)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20batched%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_proc%3DPREPROCESSING_WORKERS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20remove_columns%3Dtrain_dataset.column_names%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20eval_dataset%20%3D%20eval_dataset.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20lambda%20examples%3A%20format_chat_template(examples%2C%20tokenizer)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20batched%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_proc%3DPREPROCESSING_WORKERS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20remove_columns%3Deval_dataset.column_names%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Cache%20the%20processed%20datasets%20for%20future%20runs%0A%20%20%20%20%20%20%20%20print(f%22Caching%20processed%20datasets%20to%20%7Bdataset_cache_path%7D%22)%0A%20%20%20%20%20%20%20%20dataset_cache_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20train_dataset.save_to_disk(dataset_cache_path%20%2F%20%22train%22)%0A%20%20%20%20%20%20%20%20eval_dataset.save_to_disk(dataset_cache_path%20%2F%20%22eval%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Commit%20the%20dataset%20cache%20to%20the%20volume%0A%20%20%20%20%20%20%20%20dataset_cache_volume.commit()%0A%0A%20%20%20%20return%20train_dataset%2C%20eval_dataset%0A%0A`,lang:`python`});var B=c(z,2);u(B,{id:`loading-the-pretrained-model`,children:(e,t)=>{l(),i(e,r(`Loading the pretrained model`))},$$slots:{default:!0}});var V=c(B,4);p(V,{code:`def%20load_or_cache_model(config%3A%20%22TrainingConfig%22%2C%20paths%3A%20dict)%3A%0A%20%20%20%20print(f%22Downloading%20and%20caching%20model%3A%20%7Bconfig.model_name%7D%22)%0A%20%20%20%20model%2C%20tokenizer%20%3D%20FastLanguageModel.from_pretrained(%0A%20%20%20%20%20%20%20%20model_name%3Dconfig.model_name%2C%0A%20%20%20%20%20%20%20%20max_seq_length%3Dconfig.max_seq_length%2C%0A%20%20%20%20%20%20%20%20dtype%3DNone%2C%0A%20%20%20%20%20%20%20%20load_in_4bit%3Dconfig.load_in_4bit%2C%0A%20%20%20%20%20%20%20%20load_in_8bit%3Dconfig.load_in_8bit%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20model%2C%20tokenizer%0A%0A`,lang:`python`});var H=c(V,2);u(H,{id:`training-configuration`,children:(e,t)=>{l(),i(e,r(`Training Configuration`))},$$slots:{default:!0}});var U=c(H,4);p(U,{code:`LORA_TARGET_MODULES%20%3D%20%5B%0A%20%20%20%20%22q_proj%22%2C%0A%20%20%20%20%22k_proj%22%2C%0A%20%20%20%20%22v_proj%22%2C%0A%20%20%20%20%22o_proj%22%2C%0A%20%20%20%20%22gate_proj%22%2C%0A%20%20%20%20%22up_proj%22%2C%0A%20%20%20%20%22down_proj%22%2C%0A%5D%0A%0A`,lang:`python`});var W=c(U,4);p(W,{code:`%40dataclass%0Aclass%20TrainingConfig%3A%0A%20%20%20%20%23%20Model%20and%20dataset%20selection%0A%20%20%20%20model_name%3A%20str%0A%20%20%20%20dataset_name%3A%20str%0A%20%20%20%20max_seq_length%3A%20int%0A%20%20%20%20load_in_4bit%3A%20bool%0A%20%20%20%20load_in_8bit%3A%20bool%0A%0A%20%20%20%20%23%20LoRA%20configuration%20for%20efficient%20finetuning%0A%20%20%20%20lora_r%3A%20int%0A%20%20%20%20lora_alpha%3A%20int%0A%20%20%20%20lora_dropout%3A%20float%0A%20%20%20%20lora_bias%3A%20str%0A%20%20%20%20use_rslora%3A%20bool%0A%0A%20%20%20%20%23%20Training%20hyperparameters%0A%20%20%20%20optim%3A%20str%0A%20%20%20%20batch_size%3A%20int%0A%20%20%20%20gradient_accumulation_steps%3A%20int%0A%20%20%20%20packing%3A%20bool%0A%20%20%20%20use_gradient_checkpointing%3A%20str%0A%20%20%20%20learning_rate%3A%20float%0A%20%20%20%20lr_scheduler_type%3A%20str%0A%20%20%20%20warmup_ratio%3A%20float%0A%20%20%20%20weight_decay%3A%20float%0A%20%20%20%20max_steps%3A%20int%0A%20%20%20%20save_steps%3A%20int%0A%20%20%20%20eval_steps%3A%20int%0A%20%20%20%20logging_steps%3A%20int%0A%0A%20%20%20%20%23%20Experiment%20management%0A%20%20%20%20seed%3A%20int%0A%20%20%20%20experiment_name%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20enable_wandb%3A%20bool%20%3D%20True%0A%0A%20%20%20%20%23%20For%20testing%20purposes%0A%20%20%20%20skip_eval%3A%20bool%20%3D%20False%0A%0A%20%20%20%20def%20__post_init__(self)%3A%0A%20%20%20%20%20%20%20%20%23%20Generate%20a%20unique%20experiment%20name%20if%20not%20provided%0A%20%20%20%20%20%20%20%20if%20self.experiment_name%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20timestamp%20%3D%20datetime.now().strftime(%22%25Y%25m%25d-%25H%25M%25S%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20model_short%20%3D%20self.model_name.split(%22%2F%22)%5B-1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20self.experiment_name%20%3D%20f%22%7Bmodel_short%7D-r%7Bself.lora_r%7D-%7Btimestamp%7D%22%0A%0A`,lang:`python`});var G=c(W,2);u(G,{id:`main-training-function`,children:(e,t)=>{l(),i(e,r(`Main Training Function`))},$$slots:{default:!0}});var K=c(G,4);p(K,{code:`%40app.function(%0A%20%20%20%20image%3Dtrain_image%2C%0A%20%20%20%20gpu%3DGPU_TYPE%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmodel_cache%22%3A%20model_cache_volume%2C%0A%20%20%20%20%20%20%20%20%22%2Fdataset_cache%22%3A%20dataset_cache_volume%2C%0A%20%20%20%20%20%20%20%20%22%2Fcheckpoints%22%3A%20checkpoint_volume%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22wandb-secret%22)%5D%2C%0A%20%20%20%20timeout%3DTIMEOUT_HOURS%20*%2060%20*%2060%2C%0A%20%20%20%20retries%3Dmodal.Retries(initial_delay%3D0.0%2C%20max_retries%3DMAX_RETRIES)%2C%0A%20%20%20%20single_use_containers%3DTrue%2C%20%20%23%20Ensure%20we%20get%20a%20fresh%20container%20on%20retry%0A)%0Adef%20finetune(config%3A%20TrainingConfig)%3A%0A%20%20%20%20%23%20Get%20structured%20paths%20for%20organized%20file%20storage%0A%20%20%20%20paths%20%3D%20get_structured_paths(config)%0A%0A%20%20%20%20%23%20Initialize%20Weights%20%26%20Biases%20for%20experiment%20tracking%20if%20enabled%0A%20%20%20%20if%20config.enable_wandb%3A%0A%20%20%20%20%20%20%20%20wandb.init(%0A%20%20%20%20%20%20%20%20%20%20%20%20project%3D%22unsloth-finetune%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20name%3Dconfig.experiment_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20config%3Dconfig.__dict__%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%23%20Load%20or%20cache%20model%20and%20datasets%20with%20progress%20indicators%0A%20%20%20%20print(%22Setting%20up%20model%20and%20data...%22)%0A%20%20%20%20model%2C%20tokenizer%20%3D%20load_or_cache_model(config%2C%20paths)%0A%20%20%20%20train_dataset%2C%20eval_dataset%20%3D%20load_or_cache_dataset(config%2C%20paths%2C%20tokenizer)%0A%0A%20%20%20%20%23%20Configure%20the%20model%20for%20LoRA%20training%0A%20%20%20%20model%20%3D%20setup_model_for_training(model%2C%20config)%0A%0A%20%20%20%20%23%20Prepare%20checkpoint%20directory%20and%20check%20for%20existing%20checkpoints%0A%20%20%20%20checkpoint_path%20%3D%20paths%5B%22checkpoints%22%5D%0A%20%20%20%20checkpoint_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20resume_from_checkpoint%20%3D%20check_for_existing_checkpoint(paths)%0A%0A%20%20%20%20%23%20Create%20training%20configuration%0A%20%20%20%20training_args%20%3D%20create_training_arguments(config%2C%20str(checkpoint_path))%0A%0A%20%20%20%20%23%20Initialize%20the%20supervised%20finetuning%20trainer%0A%20%20%20%20print(%22Initializing%20SFTTrainer...%22)%0A%20%20%20%20trainer%20%3D%20SFTTrainer(%0A%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20%20%20%20%20train_dataset%3Dtrain_dataset%2C%0A%20%20%20%20%20%20%20%20eval_dataset%3Deval_dataset%2C%0A%20%20%20%20%20%20%20%20dataset_text_field%3DTEXT_COLUMN%2C%0A%20%20%20%20%20%20%20%20max_seq_length%3Dconfig.max_seq_length%2C%0A%20%20%20%20%20%20%20%20dataset_num_proc%3DPREPROCESSING_WORKERS%2C%0A%20%20%20%20%20%20%20%20packing%3Dconfig.packing%2C%20%20%23%20Sequence%20packing%20for%20efficiency%0A%20%20%20%20%20%20%20%20args%3Dtraining_args%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Display%20training%20information%20for%20transparency%0A%20%20%20%20print(f%22Training%20dataset%20size%3A%20%7Blen(train_dataset)%3A%2C%7D%22)%0A%20%20%20%20print(f%22Evaluation%20dataset%20size%3A%20%7Blen(eval_dataset)%3A%2C%7D%22)%0A%20%20%20%20print(f%22Total%20parameters%3A%20%7Bsum(p.numel()%20for%20p%20in%20model.parameters())%3A%2C%7D%22)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Trainable%20parameters%3A%20%7Bsum(p.numel()%20for%20p%20in%20model.parameters()%20if%20p.requires_grad)%3A%2C%7D%22%0A%20%20%20%20)%0A%20%20%20%20print(f%22Experiment%3A%20%7Bconfig.experiment_name%7D%22)%0A%0A%20%20%20%20%23%20Start%20training%20or%20resume%20from%20checkpoint%0A%20%20%20%20if%20resume_from_checkpoint%3A%0A%20%20%20%20%20%20%20%20print(f%22Resuming%20training%20from%20%7Bresume_from_checkpoint%7D%22)%0A%20%20%20%20%20%20%20%20trainer.train(resume_from_checkpoint%3Dresume_from_checkpoint)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22Starting%20training%20from%20scratch...%22)%0A%20%20%20%20%20%20%20%20trainer.train()%0A%0A%20%20%20%20%23%20Save%20the%20final%20trained%20model%20and%20tokenizer%0A%20%20%20%20print(%22Saving%20final%20model...%22)%0A%20%20%20%20final_model_path%20%3D%20checkpoint_path%20%2F%20%22final_model%22%0A%20%20%20%20model.save_pretrained(final_model_path)%0A%20%20%20%20tokenizer.save_pretrained(final_model_path)%0A%0A%20%20%20%20%23%20Clean%20up%20experiment%20tracking%0A%20%20%20%20if%20config.enable_wandb%3A%0A%20%20%20%20%20%20%20%20wandb.finish()%0A%0A%20%20%20%20print(f%22Training%20completed!%20Model%20saved%20to%3A%20%7Bfinal_model_path%7D%22)%0A%20%20%20%20return%20config.experiment_name%0A%0A`,lang:`python`});var q=c(K,2),J=c(e(q));h(J,{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),h(c(J,2),{href:`https://modal.com/docs/reference/cli/run#modal-run`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(q);var Y=c(q,4);p(Y,{code:`modal%20run%2006_gpu_and_ml%2Funsloth_finetune.py`,lang:`bash`});var X=c(Y,4);p(X,{code:`modal%20run%2006_gpu_and_ml%2Funsloth_finetune.py%20--max-steps%2010000`,lang:`bash`});var Z=c(X,2);p(Z,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20%23%20Model%20and%20dataset%20configuration%0A%20%20%20%20model_name%3A%20str%20%3D%20%22unsloth%2FQwen3-32B%22%2C%0A%20%20%20%20dataset_name%3A%20str%20%3D%20%22mlabonne%2FFineTome-100k%22%2C%0A%20%20%20%20max_seq_length%3A%20int%20%3D%2032768%2C%0A%20%20%20%20load_in_4bit%3A%20bool%20%3D%20True%2C%20%20%23%20unsloth%3A%20use%204bit%20quant%20for%20frozen%20model%20weights%0A%20%20%20%20load_in_8bit%3A%20bool%20%3D%20False%2C%20%20%23%20unsloth%3A%20use%208bit%20quant%20for%20frozen%20model%20weights%0A%20%20%20%20%23%20LoRA%20hyperparameters%20for%20finetuning%20efficiency%0A%20%20%20%20lora_r%3A%20int%20%3D%2016%2C%0A%20%20%20%20lora_alpha%3A%20int%20%3D%2016%2C%0A%20%20%20%20lora_dropout%3A%20float%20%3D%200.0%2C%0A%20%20%20%20lora_bias%3A%20str%20%3D%20%22none%22%2C%20%20%23%20unsloth%3A%20optimized%20lora%20kernel%0A%20%20%20%20use_rslora%3A%20bool%20%3D%20False%2C%0A%20%20%20%20%23%20Training%20hyperparameters%20for%20optimization%0A%20%20%20%20optim%3A%20str%20%3D%20%22adamw_8bit%22%2C%20%20%23%20unsloth%3A%208bit%20optimizer%0A%20%20%20%20batch_size%3A%20int%20%3D%2016%2C%0A%20%20%20%20gradient_accumulation_steps%3A%20int%20%3D%201%2C%0A%20%20%20%20packing%3A%20bool%20%3D%20False%2C%0A%20%20%20%20use_gradient_checkpointing%3A%20str%20%3D%20%22unsloth%22%2C%20%20%23%20unsloth%3A%20optimized%20gradient%20offloading%0A%20%20%20%20learning_rate%3A%20float%20%3D%202e-4%2C%0A%20%20%20%20lr_scheduler_type%3A%20str%20%3D%20%22cosine%22%2C%0A%20%20%20%20warmup_ratio%3A%20float%20%3D%200.06%2C%0A%20%20%20%20weight_decay%3A%20float%20%3D%200.01%2C%0A%20%20%20%20max_steps%3A%20int%20%3D%205%2C%20%20%23%20increase!%0A%20%20%20%20save_steps%3A%20int%20%3D%202%2C%20%20%23%20increase!%0A%20%20%20%20eval_steps%3A%20int%20%3D%202%2C%20%20%23%20increase!%0A%20%20%20%20logging_steps%3A%20int%20%3D%201%2C%20%20%23%20increase!%0A%20%20%20%20%23%20Optional%20experiment%20configuration%0A%20%20%20%20seed%3A%20int%20%3D%20105%2C%0A%20%20%20%20experiment_name%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20disable_wandb%3A%20bool%20%3D%20True%2C%0A%20%20%20%20skip_eval%3A%20bool%20%3D%20False%2C%0A)%3A%0A%20%20%20%20%23%20Create%20configuration%20object%20from%20command%20line%20arguments%0A%20%20%20%20config%20%3D%20TrainingConfig(%0A%20%20%20%20%20%20%20%20model_name%3Dmodel_name%2C%0A%20%20%20%20%20%20%20%20dataset_name%3Ddataset_name%2C%0A%20%20%20%20%20%20%20%20max_seq_length%3Dmax_seq_length%2C%0A%20%20%20%20%20%20%20%20load_in_4bit%3Dload_in_4bit%2C%0A%20%20%20%20%20%20%20%20load_in_8bit%3Dload_in_8bit%2C%0A%20%20%20%20%20%20%20%20lora_r%3Dlora_r%2C%0A%20%20%20%20%20%20%20%20lora_alpha%3Dlora_alpha%2C%0A%20%20%20%20%20%20%20%20lora_bias%3Dlora_bias%2C%0A%20%20%20%20%20%20%20%20lora_dropout%3Dlora_dropout%2C%0A%20%20%20%20%20%20%20%20use_rslora%3Duse_rslora%2C%0A%20%20%20%20%20%20%20%20optim%3Doptim%2C%0A%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20%20%20%20%20gradient_accumulation_steps%3Dgradient_accumulation_steps%2C%0A%20%20%20%20%20%20%20%20packing%3Dpacking%2C%0A%20%20%20%20%20%20%20%20use_gradient_checkpointing%3Duse_gradient_checkpointing%2C%0A%20%20%20%20%20%20%20%20learning_rate%3Dlearning_rate%2C%0A%20%20%20%20%20%20%20%20max_steps%3Dmax_steps%2C%0A%20%20%20%20%20%20%20%20lr_scheduler_type%3Dlr_scheduler_type%2C%0A%20%20%20%20%20%20%20%20warmup_ratio%3Dwarmup_ratio%2C%0A%20%20%20%20%20%20%20%20weight_decay%3Dweight_decay%2C%0A%20%20%20%20%20%20%20%20save_steps%3Dsave_steps%2C%0A%20%20%20%20%20%20%20%20eval_steps%3Deval_steps%2C%0A%20%20%20%20%20%20%20%20logging_steps%3Dlogging_steps%2C%0A%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20experiment_name%3Dexperiment_name%2C%0A%20%20%20%20%20%20%20%20enable_wandb%3Dnot%20disable_wandb%2C%0A%20%20%20%20%20%20%20%20skip_eval%3Dskip_eval%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Display%20experiment%20configuration%20for%20user%20verification%0A%20%20%20%20print(f%22Starting%20finetuning%20experiment%3A%20%7Bconfig.experiment_name%7D%22)%0A%20%20%20%20print(f%22Model%3A%20%7Bconfig.model_name%7D%22)%0A%20%20%20%20print(f%22Dataset%3A%20%7Bconfig.dataset_name%7D%22)%0A%20%20%20%20print(f%22LoRA%20configuration%3A%20rank%3D%7Bconfig.lora_r%7D%2C%20alpha%3D%7Bconfig.lora_alpha%7D%22)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Effective%20batch%20size%3A%20%7Bconfig.batch_size%20*%20config.gradient_accumulation_steps%7D%22%0A%20%20%20%20)%0A%20%20%20%20print(f%22Training%20steps%3A%20%7Bconfig.max_steps%7D%22)%0A%0A%20%20%20%20%23%20Launch%20the%20training%20job%20on%20Modal%20infrastructure%0A%20%20%20%20experiment_name%20%3D%20finetune.remote(config)%0A%20%20%20%20print(f%22Training%20completed%20successfully%3A%20%7Bexperiment_name%7D%22)%0A%0A`,lang:`python`});var Q=c(Z,2);u(Q,{id:`utility-functions`,children:(e,t)=>{l(),i(e,r(`Utility Functions`))},$$slots:{default:!0}}),p(c(Q,4),{code:`def%20get_structured_paths(config%3A%20TrainingConfig)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Create%20structured%20paths%20within%20the%20mounted%20volumes%20for%20organized%20storage.%0A%0A%20%20%20%20This%20function%20maps%20the%20configuration%20to%20specific%20directory%20paths%20that%20allow%0A%20%20%20%20multiple%20models%2C%20datasets%2C%20and%20experiments%20to%20coexist%20without%20conflicts.%0A%20%20%20%20%22%22%22%0A%20%20%20%20%23%20Replace%20forward%20slashes%20in%20names%20to%20create%20valid%20directory%20names%0A%20%20%20%20dataset_cache_path%20%3D%20(%0A%20%20%20%20%20%20%20%20pathlib.Path(%22%2Fdataset_cache%22)%0A%20%20%20%20%20%20%20%20%2F%20%22datasets%22%0A%20%20%20%20%20%20%20%20%2F%20config.dataset_name.replace(%22%2F%22%2C%20%22--%22)%0A%20%20%20%20)%0A%20%20%20%20checkpoint_path%20%3D%20(%0A%20%20%20%20%20%20%20%20pathlib.Path(%22%2Fcheckpoints%22)%20%2F%20%22experiments%22%20%2F%20config.experiment_name%0A%20%20%20%20)%0A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22dataset_cache%22%3A%20dataset_cache_path%2C%0A%20%20%20%20%20%20%20%20%22checkpoints%22%3A%20checkpoint_path%2C%0A%20%20%20%20%7D%0A%0A%0Adef%20setup_model_for_training(model%2C%20config%3A%20TrainingConfig)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Configure%20the%20model%20with%20LoRA%20adapters%20for%20efficient%20finetuning.%0A%0A%20%20%20%20LoRA%20(Low-Rank%20Adaptation)%20allows%20us%20to%20finetune%20large%20models%20efficiently%0A%20%20%20%20by%20only%20training%20a%20small%20number%20of%20additional%20parameters.%20This%20significantly%0A%20%20%20%20reduces%20memory%20usage%20and%20training%20time.%0A%20%20%20%20%22%22%22%0A%20%20%20%20print(%22Configuring%20LoRA%20for%20training...%22)%0A%20%20%20%20model%20%3D%20FastLanguageModel.get_peft_model(%0A%20%20%20%20%20%20%20%20model%2C%0A%20%20%20%20%20%20%20%20r%3Dconfig.lora_r%2C%20%20%23%20LoRA%20rank%20-%20higher%20values%20%3D%20more%20parameters%0A%20%20%20%20%20%20%20%20target_modules%3DLORA_TARGET_MODULES%2C%20%20%23%20Which%20layers%20to%20apply%20LoRA%20to%0A%20%20%20%20%20%20%20%20lora_alpha%3Dconfig.lora_alpha%2C%20%20%23%20LoRA%20scaling%20parameter%0A%20%20%20%20%20%20%20%20lora_dropout%3Dconfig.lora_dropout%2C%20%20%23%20Dropout%20for%20LoRA%20layers%0A%20%20%20%20%20%20%20%20bias%3Dconfig.lora_bias%2C%20%20%23%20Bias%20configuration%0A%20%20%20%20%20%20%20%20use_gradient_checkpointing%3Dconfig.use_gradient_checkpointing%2C%20%20%23%20Memory%20optimization%0A%20%20%20%20%20%20%20%20random_state%3Dconfig.seed%2C%20%20%23%20Fixed%20seed%20for%20reproducibility%0A%20%20%20%20%20%20%20%20use_rslora%3Dconfig.use_rslora%2C%20%20%23%20Rank-stabilized%20LoRA%0A%20%20%20%20%20%20%20%20loftq_config%3DNone%2C%20%20%23%20LoFTQ%20quantization%20config%0A%20%20%20%20)%0A%20%20%20%20return%20model%0A%0A%0Adef%20create_training_arguments(config%3A%20TrainingConfig%2C%20output_dir%3A%20str)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Create%20training%20arguments%20for%20the%20SFTTrainer.%0A%0A%20%20%20%20These%20arguments%20control%20the%20training%20process%2C%20including%20optimization%20settings%2C%0A%20%20%20%20evaluation%20frequency%2C%20and%20checkpointing%20behavior.%0A%20%20%20%20%22%22%22%0A%20%20%20%20print(%22SKIP_EVAL%22%2C%20config.skip_eval)%0A%20%20%20%20return%20TrainingArguments(%0A%20%20%20%20%20%20%20%20%23%20Core%20training%20configuration%0A%20%20%20%20%20%20%20%20per_device_train_batch_size%3Dconfig.batch_size%2C%0A%20%20%20%20%20%20%20%20gradient_accumulation_steps%3Dconfig.gradient_accumulation_steps%2C%0A%20%20%20%20%20%20%20%20learning_rate%3Dconfig.learning_rate%2C%0A%20%20%20%20%20%20%20%20max_steps%3Dconfig.max_steps%2C%0A%20%20%20%20%20%20%20%20warmup_ratio%3Dconfig.warmup_ratio%2C%0A%20%20%20%20%20%20%20%20%23%20Evaluation%20and%20checkpointing%0A%20%20%20%20%20%20%20%20eval_steps%3Dconfig.eval_steps%2C%0A%20%20%20%20%20%20%20%20save_steps%3Dconfig.save_steps%2C%0A%20%20%20%20%20%20%20%20eval_strategy%3D%22no%22%20if%20config.skip_eval%20else%20%22steps%22%2C%0A%20%20%20%20%20%20%20%20save_strategy%3D%22steps%22%2C%0A%20%20%20%20%20%20%20%20do_eval%3Dnot%20config.skip_eval%2C%0A%20%20%20%20%20%20%20%20%23%20Optimization%20settings%20based%20on%20hardware%20capabilities%0A%20%20%20%20%20%20%20%20fp16%3Dnot%20torch.cuda.is_bf16_supported()%2C%20%20%23%20Use%20fp16%20if%20bf16%20not%20available%0A%20%20%20%20%20%20%20%20bf16%3Dtorch.cuda.is_bf16_supported()%2C%20%20%23%20Prefer%20bf16%20when%20available%0A%20%20%20%20%20%20%20%20optim%3Dconfig.optim%2C%0A%20%20%20%20%20%20%20%20weight_decay%3Dconfig.weight_decay%2C%0A%20%20%20%20%20%20%20%20lr_scheduler_type%3Dconfig.lr_scheduler_type%2C%0A%20%20%20%20%20%20%20%20%23%20Logging%20and%20output%20configuration%0A%20%20%20%20%20%20%20%20logging_steps%3Dconfig.logging_steps%2C%0A%20%20%20%20%20%20%20%20output_dir%3Doutput_dir%2C%0A%20%20%20%20%20%20%20%20report_to%3D%22wandb%22%20if%20config.enable_wandb%20else%20None%2C%0A%20%20%20%20%20%20%20%20seed%3Dconfig.seed%2C%0A%20%20%20%20)%0A%0A%0Adef%20check_for_existing_checkpoint(paths%3A%20dict)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Check%20if%20there's%20an%20existing%20checkpoint%20to%20resume%20training%20from.%0A%0A%20%20%20%20This%20enables%20resumable%20training%2C%20which%20is%20crucial%20for%20long-running%20experiments%0A%20%20%20%20that%20might%20be%20interrupted%20by%20infrastructure%20issues%20or%20resource%20limits.%0A%20%20%20%20%22%22%22%0A%20%20%20%20checkpoint_dir%20%3D%20paths%5B%22checkpoints%22%5D%0A%20%20%20%20if%20not%20checkpoint_dir.exists()%3A%0A%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20%23%20Look%20for%20the%20most%20recent%20checkpoint%20directory%0A%20%20%20%20checkpoints%20%3D%20list(checkpoint_dir.glob(%22checkpoint-*%22))%0A%20%20%20%20if%20checkpoints%3A%0A%20%20%20%20%20%20%20%20latest_checkpoint%20%3D%20max(checkpoints%2C%20key%3Dlambda%20p%3A%20int(p.name.split(%22-%22)%5B1%5D))%0A%20%20%20%20%20%20%20%20print(f%22Found%20existing%20checkpoint%3A%20%7Blatest_checkpoint%7D%22)%0A%20%20%20%20%20%20%20%20return%20str(latest_checkpoint)%0A%0A%20%20%20%20return%20None%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=CDK4BKdf.js.map
