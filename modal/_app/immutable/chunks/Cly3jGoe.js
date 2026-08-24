(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`54b1b314-5671-4574-9030-b3f93c2d9b4f`,e._sentryDebugIdIdentifier=`sentry-dbid-54b1b314-5671-4574-9030-b3f93c2d9b4f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as re}from"./JPsrybyr.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var ie=`/_app/immutable/assets/gradio-image-generate.DJVgtpVQ.png`,p={toc:[{depth:1,value:`Fine-tune Flux on your pet using LoRA`,id:`fine-tune-flux-on-your-pet-using-lora`,children:[{depth:2,value:`Imports and setup`,id:`imports-and-setup`},{depth:2,value:`Building up the environment`,id:`building-up-the-environment`,children:[{depth:3,value:`Downloading scripts and installing a git repo with run_commands`,id:`downloading-scripts-and-installing-a-git-repo-with-run_commands`},{depth:3,value:`Configuration with dataclasses`,id:`configuration-with-dataclasses`},{depth:3,value:`Storing data created by our app with modal.Volume`,id:`storing-data-created-by-our-app-with-modalvolume`},{depth:3,value:`Load fine-tuning dataset`,id:`load-fine-tuning-dataset`}]},{depth:2,value:`Low-Rank Adaptation (LoRA) fine-tuning for a text-to-image model`,id:`low-rank-adaptation-lora-fine-tuning-for-a-text-to-image-model`,children:[{depth:3,value:`Finetuning with Hugging Face 🧨 Diffusers and Accelerate`,id:`finetuning-with-hugging-face--diffusers-and-accelerate`}]},{depth:2,value:`Running our model`,id:`running-our-model`},{depth:2,value:`Wrap the trained model in a Gradio web UI`,id:`wrap-the-trained-model-in-a-gradio-web-ui`},{depth:2,value:`Running your fine-tuned model from the command line`,id:`running-your-fine-tuned-model-from-the-command-line`}]}],rawContent:`# Fine-tune Flux on your pet using LoRA

This example finetunes the [Flux.1-dev model](https://huggingface.co/black-forest-labs/FLUX.1-dev)
on images of a pet (by default, a puppy named Qwerty)
using a technique called textual inversion from [the "Dreambooth" paper](https://dreambooth.github.io/).
Effectively, it teaches a general image generation model a new "proper noun",
allowing for the personalized generation of art and photos.
We supplement textual inversion with low-rank adaptation (LoRA)
for increased efficiency during training.

It then makes the model shareable with others -- without costing $25/day for a GPU server--
by hosting a [Gradio app](https://gradio.app/) on Modal.

It demonstrates a simple, productive, and cost-effective pathway
to building on large pretrained models using Modal's building blocks, like
[GPU-accelerated](https://modal.com/docs/guide/gpu) Modal Functions for compute-intensive work,
[Volumes](https://modal.com/docs/guide/volumes) for storage,
and [Web Functions](https://modal.com/docs/guide/webhooks) for serving.

And with some light customization, you can use it to generate images of your pet!

![Gradio.app image generation interface](./gradio-image-generate.png)

You can find a video walkthrough of this example on the Modal YouTube channel
[here](https://www.youtube.com/watch?v=df-8fiByXMI).

## Imports and setup

We start by importing the necessary libraries and setting up the environment.

\`\`\`python
from dataclasses import dataclass
from pathlib import Path

import modal

\`\`\`

## Building up the environment

Machine learning environments are complex, and the dependencies can be hard to manage.
Modal makes creating and working with environments easy via
[containers and container images](https://modal.com/docs/guide/custom-container).

We start from a base image and specify all of our dependencies.
We'll call out the interesting ones as they come up below.
Note that these dependencies are not installed locally
-- they are only installed in the remote environment where our Modal App runs.

\`\`\`python
app = modal.App(name="example-diffusers-lora-finetune")

image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "accelerate==0.31.0",
    "datasets~=2.13.0",
    "fastapi[standard]==0.115.4",
    "ftfy~=6.1.0",
    "gradio~=5.5.0",
    "huggingface-hub==0.36.0",
    "numpy<2",
    "peft==0.11.1",
    "pydantic==2.9.2",
    "sentencepiece>=0.1.91,!=0.1.92",
    "smart_open~=6.4.0",
    "starlette==0.41.2",
    "transformers~=4.41.2",
    "torch~=2.2.0",
    "torchvision~=0.16",
    "triton~=2.2.0",
    "wandb==0.17.6",
)

\`\`\`

### Downloading scripts and installing a git repo with \`run_commands\`

We'll use an example script from the \`diffusers\` library to train the model.
We acquire it from GitHub and install it in our environment with a series of commands.
The container environments Modal Functions run in are highly flexible --
see [the docs](https://modal.com/docs/guide/custom-container) for more details.

\`\`\`python
GIT_SHA = "e649678bf55aeaa4b60bd1f68b1ee726278c0304"  # specify the commit to fetch

image = (
    image.apt_install("git")
    # Perform a shallow fetch of just the target \`diffusers\` commit, checking out
    # the commit in the container's home directory, /root. Then install \`diffusers\`
    .run_commands(
        "cd /root && git init .",
        "cd /root && git remote add origin https://github.com/huggingface/diffusers",
        f"cd /root && git fetch --depth=1 origin {GIT_SHA} && git checkout {GIT_SHA}",
        "cd /root && pip install -e .",
    )
)

\`\`\`

### Configuration with \`dataclass\`es

Machine learning apps often have a lot of configuration information.
We collect up all of our configuration into dataclasses to avoid scattering special/magic values throughout code.

\`\`\`python
@dataclass
class SharedConfig:
    """Configuration information shared across project components."""

    # The instance name is the "proper noun" we're teaching the model
    instance_name: str = "Qwerty"
    # That proper noun is usually a member of some class (person, bird),
    # and sharing that information with the model helps it generalize better.
    class_name: str = "Golden Retriever"
    # identifier for pretrained models on Hugging Face
    model_name: str = "black-forest-labs/FLUX.1-dev"


\`\`\`

### Storing data created by our app with \`modal.Volume\`

The tools we've used so far work well for fetching external information,
which defines the environment our app runs in,
but what about data that we create or modify during the app's execution?
A persisted [\`modal.Volume\`](https://modal.com/docs/guide/volumes) can store and share data across Modal Apps and Functions.

We'll use one to store both the original and fine-tuned weights we create during training
and then load them back in for inference. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
volume = modal.Volume.from_name(
    "dreambooth-finetuning-volume-flux", create_if_missing=True
)
MODEL_DIR = "/model"

\`\`\`

Note that access to the Flux.1-dev model on Hugging Face is
[gated by a license agreement](https://huggingface.co/docs/hub/en/models-gated) which
you must agree to [here](https://huggingface.co/black-forest-labs/FLUX.1-dev).
After you have accepted the license, [create a Modal Secret](https://modal.com/secrets)
with the name \`huggingface-secret\` following the instructions in the template.

\`\`\`python
huggingface_secret = modal.Secret.from_name(
    "huggingface-secret", required_keys=["HF_TOKEN"]
)

image = image.env(
    {"HF_XET_HIGH_PERFORMANCE": "1"}  # turn on faster downloads from HF
)


@app.function(
    volumes={MODEL_DIR: volume},
    image=image,
    secrets=[huggingface_secret],
    timeout=600,  # 10 minutes
)
def download_models(config):
    import torch
    from diffusers import DiffusionPipeline
    from huggingface_hub import snapshot_download

    snapshot_download(
        config.model_name,
        local_dir=MODEL_DIR,
        ignore_patterns=["*.pt", "*.bin"],  # using safetensors
    )

    DiffusionPipeline.from_pretrained(MODEL_DIR, torch_dtype=torch.bfloat16)


\`\`\`

### Load fine-tuning dataset

Part of the magic of the low-rank fine-tuning is that we only need 3-10 images for fine-tuning.
So we can fetch just a few images, stored on consumer platforms like Imgur or Google Drive,
whenever we need them -- no need for expensive, hard-to-maintain data pipelines.

\`\`\`python
def load_images(image_urls: list[str]) -> Path:
    import PIL.Image
    from smart_open import open

    img_path = Path("/img")

    img_path.mkdir(parents=True, exist_ok=True)
    for ii, url in enumerate(image_urls):
        with open(url, "rb") as f:
            image = PIL.Image.open(f)
            image.save(img_path / f"{ii}.png")
    print(f"{ii + 1} images loaded")

    return img_path


\`\`\`

## Low-Rank Adaptation (LoRA) fine-tuning for a text-to-image model

The base model we start from is trained to do a sort of "reverse [ekphrasis](https://en.wikipedia.org/wiki/Ekphrasis)":
it attempts to recreate a visual work of art or image from only its description.

We can use the model to synthesize wholly new images
by combining the concepts it has learned from the training data.

We use a pretrained model, the Flux model from Black Forest Labs.
In this example, we "finetune" Flux, making only small adjustments to the weights.
Furthermore, we don't change all the weights in the model.
Instead, using a technique called [_low-rank adaptation_](https://arxiv.org/abs/2106.09685),
we change a much smaller matrix that works "alongside" the existing weights, nudging the model in the direction we want.

We can get away with such a small and simple training process because we're just teach the model the meaning of a single new word: the name of our pet.

The result is a model that can generate novel images of our pet:
as an astronaut in space, as painted by Van Gogh or Bastiat, etc.

### Finetuning with Hugging Face 🧨 Diffusers and Accelerate

The model weights, training libraries, and training script are all provided by [🤗 Hugging Face](https://huggingface.co).

You can kick off a training job with the command \`modal run dreambooth_app.py::app.train\`.
It should take about ten minutes.

Training machine learning models takes time and produces a lot of metadata --
metrics for performance and resource utilization,
metrics for model quality and training stability,
and model inputs and outputs like images and text.
This is especially important if you're fiddling around with the configuration parameters.

This example can optionally use [Weights & Biases](https://wandb.ai) to track all of this training information.
Just sign up for an account, switch the flag below, and add your API key as a [Modal Secret](https://modal.com/secrets).

\`\`\`python
USE_WANDB = False

\`\`\`

You can see an example W&B dashboard [here](https://wandb.ai/cfrye59/dreambooth-lora-sd-xl).
Check out [this run](https://wandb.ai/cfrye59/dreambooth-lora-sd-xl/runs/ca3v1lsh?workspace=user-cfrye59),
which [despite having high GPU utilization](https://wandb.ai/cfrye59/dreambooth-lora-sd-xl/runs/ca3v1lsh/system)
suffered from numerical instability during training and produced only black images -- hard to debug without experiment management logs!

You can read more about how the values in \`TrainConfig\` are chosen and adjusted [in this blog post on Hugging Face](https://huggingface.co/blog/dreambooth).
To run training on images of your own pet, upload the images to separate URLs and edit the contents of the file at \`TrainConfig.instance_example_urls_file\` to point to them.

Tip: if the results you're seeing don't match the prompt too well, and instead produce an image
of your subject without taking the prompt into account, the model has likely overfit. In this case, repeat training with a lower
value of \`max_train_steps\`. If you used W&B, look back at results earlier in training to determine where to stop.
On the other hand, if the results don't look like your subject, you might need to increase \`max_train_steps\`.

\`\`\`python
@dataclass
class TrainConfig(SharedConfig):
    """Configuration for the finetuning step."""

    # training prompt looks like \`{PREFIX} {INSTANCE_NAME} the {CLASS_NAME} {POSTFIX}\`
    prefix: str = "a photo of"
    postfix: str = ""

    # locator for plaintext file with urls for images of target instance
    instance_example_urls_file: str = str(
        Path(__file__).parent / "instance_example_urls.txt"
    )

    # Hyperparameters/constants from the huggingface training example
    resolution: int = 512
    train_batch_size: int = 3
    rank: int = 16  # lora rank
    gradient_accumulation_steps: int = 1
    learning_rate: float = 4e-4
    lr_scheduler: str = "constant"
    lr_warmup_steps: int = 0
    max_train_steps: int = 500
    checkpointing_steps: int = 1000
    seed: int = 117


@app.function(
    image=image,
    gpu="A100-80GB",  # fine-tuning is VRAM-heavy and requires a high-VRAM GPU
    volumes={MODEL_DIR: volume},  # stores fine-tuned model
    timeout=1800,  # 30 minutes
    secrets=[huggingface_secret]
    + (
        [modal.Secret.from_name("wandb-secret", required_keys=["WANDB_API_KEY"])]
        if USE_WANDB
        else []
    ),
)
def train(instance_example_urls, config):
    import subprocess

    from accelerate.utils import write_basic_config

    # load data locally
    img_path = load_images(instance_example_urls)

    # set up hugging face accelerate library for fast training
    write_basic_config(mixed_precision="bf16")

    # define the training prompt
    instance_phrase = f"{config.instance_name} the {config.class_name}"
    prompt = f"{config.prefix} {instance_phrase} {config.postfix}".strip()

    # the model training is packaged as a script, so we have to execute it as a subprocess, which adds some boilerplate
    def _exec_subprocess(cmd: list[str]):
        """Executes subprocess and prints log to terminal while subprocess is running."""
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        with process.stdout as pipe:
            for line in iter(pipe.readline, b""):
                line_str = line.decode()
                print(f"{line_str}", end="")

        if exitcode := process.wait() != 0:
            raise subprocess.CalledProcessError(exitcode, "\\n".join(cmd))

    # run training -- see huggingface accelerate docs for details
    print("launching dreambooth training script")
    _exec_subprocess(
        [
            "accelerate",
            "launch",
            "examples/dreambooth/train_dreambooth_lora_flux.py",
            "--mixed_precision=bf16",  # half-precision floats most of the time for faster training
            f"--pretrained_model_name_or_path={MODEL_DIR}",
            f"--instance_data_dir={img_path}",
            f"--output_dir={MODEL_DIR}",
            f"--instance_prompt={prompt}",
            f"--resolution={config.resolution}",
            f"--train_batch_size={config.train_batch_size}",
            f"--gradient_accumulation_steps={config.gradient_accumulation_steps}",
            f"--learning_rate={config.learning_rate}",
            f"--lr_scheduler={config.lr_scheduler}",
            f"--lr_warmup_steps={config.lr_warmup_steps}",
            f"--max_train_steps={config.max_train_steps}",
            f"--checkpointing_steps={config.checkpointing_steps}",
            f"--seed={config.seed}",  # increased reproducibility by seeding the RNG
        ]
        + (
            [
                "--report_to=wandb",
                # validation output tracking is useful, but currently broken for Flux LoRA training
                # f"--validation_prompt={prompt} in space",  # simple test prompt
                # f"--validation_epochs={config.max_train_steps // 5}",
            ]
            if USE_WANDB
            else []
        ),
    )
    # The trained model information has been output to the volume mounted at \`MODEL_DIR\`.
    # To persist this data for use in our web app, we 'commit' the changes
    # to the volume.
    volume.commit()


\`\`\`

## Running our model

To generate images from prompts using our fine-tuned model, we define a Modal Function called \`inference\`.

Naively, this would seem to be a bad fit for the flexible, serverless infrastructure of Modal:
wouldn't you need to include the steps to load the model and spin it up in every function call?

In order to initialize the model just once on container startup,
we use Modal's [container lifecycle](https://modal.com/docs/guide/lifecycle-functions) features, which require the function to be part
of a class. Note that the \`modal.Volume\` we saved the model to is mounted here as well,
so that the fine-tuned model created  by \`train\` is available to us.

\`\`\`python
@app.cls(image=image, gpu="A100", volumes={MODEL_DIR: volume})
class Model:
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import DiffusionPipeline

        # Reload the modal.Volume to ensure the latest state is accessible.
        volume.reload()

        # set up a hugging face inference pipeline using our model
        pipe = DiffusionPipeline.from_pretrained(
            MODEL_DIR,
            torch_dtype=torch.bfloat16,
        ).to("cuda")
        pipe.load_lora_weights(MODEL_DIR)
        self.pipe = pipe

    @modal.method()
    def inference(self, text, config):
        image = self.pipe(
            text,
            num_inference_steps=config.num_inference_steps,
            guidance_scale=config.guidance_scale,
        ).images[0]

        return image


\`\`\`

## Wrap the trained model in a Gradio web UI

[Gradio](https://gradio.app) makes it super easy to expose a model's functionality
in an easy-to-use, responsive web interface.

This model is a text-to-image generator,
so we set up an interface that includes a user-entry text box
and a frame for displaying images.

We also provide some example text inputs to help
guide users and to kick-start their creative juices.

And we couldn't resist adding some Modal style to it as well!

You can deploy the app on Modal with the command
\`modal deploy dreambooth_app.py\`.
You'll be able to come back days, weeks, or months later and find it still ready to go,
even though you don't have to pay for a server to run while you're not using it.

\`\`\`python
@dataclass
class AppConfig(SharedConfig):
    """Configuration information for inference."""

    num_inference_steps: int = 50
    guidance_scale: float = 6


web_image = image.add_local_dir(
    # Add local web assets to the image
    Path(__file__).parent / "assets",
    remote_path="/assets",
)


@app.function(
    image=web_image,
    max_containers=1,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    import gradio as gr
    from fastapi import FastAPI
    from fastapi.responses import FileResponse
    from gradio.routes import mount_gradio_app

    web_app = FastAPI()

    # Call out to the inference in a separate Modal environment with a GPU
    def go(text=""):
        if not text:
            text = example_prompts[0]
        return Model().inference.remote(text, config)

    # set up AppConfig
    config = AppConfig()

    instance_phrase = f"{config.instance_name} the {config.class_name}"

    example_prompts = [
        f"{instance_phrase}",
        f"a painting of {instance_phrase.title()} With A Pearl Earring, by Vermeer",
        f"oil painting of {instance_phrase} flying through space as an astronaut",
        f"a painting of {instance_phrase} in cyberpunk city. character design by cory loftis. volumetric light, detailed, rendered in octane",
        f"drawing of {instance_phrase} high quality, cartoon, path traced, by studio ghibli and don bluth",
    ]

    modal_docs_url = "https://modal.com/docs"
    modal_example_url = f"{modal_docs_url}/examples/dreambooth_app"

    description = f"""Describe what they are doing or how a particular artist or style would depict them. Be fantastical! Try the examples below for inspiration.

### Learn how to make a "Dreambooth" for your own pet [here]({modal_example_url}).
    """

    # custom styles: an icon, a background, and a theme
    @web_app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        return FileResponse("/assets/favicon.svg")

    @web_app.get("/assets/background.svg", include_in_schema=False)
    async def background():
        return FileResponse("/assets/background.svg")

    with open("/assets/index.css") as f:
        css = f.read()

    theme = gr.themes.Default(
        primary_hue="green", secondary_hue="emerald", neutral_hue="neutral"
    )

    # add a gradio UI around inference
    with gr.Blocks(
        theme=theme,
        css=css,
        title=f"Generate images of {config.instance_name} on Modal",
    ) as interface:
        gr.Markdown(
            f"# Generate images of {instance_phrase}.\\n\\n{description}",
        )
        with gr.Row():
            inp = gr.Textbox(  # input text component
                label="",
                placeholder=f"Describe the version of {instance_phrase} you'd like to see",
                lines=10,
            )
            out = gr.Image(  # output image component
                height=512, width=512, label="", min_width=512, elem_id="output"
            )
        with gr.Row():
            btn = gr.Button("Dream", variant="primary", scale=2)
            btn.click(
                fn=go, inputs=inp, outputs=out
            )  # connect inputs and outputs with inference function

            gr.Button(  # shameless plug
                "⚡️ Powered by Modal",
                variant="secondary",
                link="https://modal.com",
            )

        with gr.Column(variant="compact"):
            # add in a few examples to inspire users
            for ii, prompt in enumerate(example_prompts):
                btn = gr.Button(prompt, variant="secondary")
                btn.click(fn=lambda idx=ii: example_prompts[idx], outputs=inp)

    # mount for execution on Modal
    return mount_gradio_app(
        app=web_app,
        blocks=interface,
        path="/",
    )


\`\`\`

## Running your fine-tuned model from the command line

You can use the \`modal\` command-line interface to set up, customize, and deploy this app:

- \`modal run diffusers_lora_finetune.py\` will train the model. Change the \`instance_example_urls_file\` to point to your own pet's images.
- \`modal serve diffusers_lora_finetune.py\` will [serve](https://modal.com/docs/guide/webhooks#developing-with-modal-serve) the Gradio interface at a temporary location. Great for iterating on code!
- \`modal shell diffusers_lora_finetune.py\` is a convenient helper to open a bash [shell](https://modal.com/docs/guide/developing-debugging#interactive-shell) in our image. Great for debugging environment issues.

Remember, once you've trained your own fine-tuned model, you can deploy it permanently -- for no cost when it is not being used! --
using \`modal deploy diffusers_lora_finetune.py\`.

If you just want to try the app out, you can find our deployment [here](https://modal-labs--example-diffusers-lora-finetune-fastapi-app.modal.run).

\`\`\`python
@app.local_entrypoint()
def run(  # add more config params here to make training configurable
    max_train_steps: int = 250,
):
    print("🎨 loading model")
    download_models.remote(SharedConfig())
    print("🎨 setting up training")
    config = TrainConfig(max_train_steps=max_train_steps)
    instance_example_urls = (
        Path(TrainConfig.instance_example_urls_file).read_text().splitlines()
    )
    train.remote(instance_example_urls, config)
    print("🎨 training finished")

\`\`\`
`,meta:{title:`Fine-tune Flux on your pet using LoRA`,description:`This example finetunes the Flux.1-dev model on images of a pet (by default, a puppy named Qwerty) using a technique called textual inversion from the “Dreambooth” paper. Effectively, it teaches a general image generation model a new “proper noun”, allowing for the personalized generation of art and photos. We supplement textual inversion with low-rank adaptation (LoRA) for increased efficiency during training.`}},{toc:m,rawContent:h,meta:g}=p,ae=t(`Downloading scripts and installing a git repo with <code>run_commands</code>`,1),oe=t(`Configuration with <code>dataclass</code>es`,1),se=t(`Storing data created by our app with <code>modal.Volume</code>`,1),ce=t(`<code>modal.Volume</code>`),le=t(`<em>low-rank adaptation</em>`),ue=t(`<!> <p>This example finetunes the <!> on images of a pet (by default, a puppy named Qwerty)
using a technique called textual inversion from <!>.
Effectively, it teaches a general image generation model a new “proper noun”,
allowing for the personalized generation of art and photos.
We supplement textual inversion with low-rank adaptation (LoRA)
for increased efficiency during training.</p> <p>It then makes the model shareable with others — without costing $25/day for a GPU server—
by hosting a <!> on Modal.</p> <p>It demonstrates a simple, productive, and cost-effective pathway
to building on large pretrained models using Modal’s building blocks, like <!> Modal Functions for compute-intensive work, <!> for storage,
and <!> for serving.</p> <p>And with some light customization, you can use it to generate images of your pet!</p> <p><!></p> <p>You can find a video walkthrough of this example on the Modal YouTube channel <!>.</p> <!> <p>We start by importing the necessary libraries and setting up the environment.</p> <!> <!> <p>Machine learning environments are complex, and the dependencies can be hard to manage.
Modal makes creating and working with environments easy via <!>.</p> <p>We start from a base image and specify all of our dependencies.
We’ll call out the interesting ones as they come up below.
Note that these dependencies are not installed locally
— they are only installed in the remote environment where our Modal App runs.</p> <!> <!> <p>We’ll use an example script from the <code>diffusers</code> library to train the model.
We acquire it from GitHub and install it in our environment with a series of commands.
The container environments Modal Functions run in are highly flexible —
see <!> for more details.</p> <!> <!> <p>Machine learning apps often have a lot of configuration information.
We collect up all of our configuration into dataclasses to avoid scattering special/magic values throughout code.</p> <!> <!> <p>The tools we’ve used so far work well for fetching external information,
which defines the environment our app runs in,
but what about data that we create or modify during the app’s execution?
A persisted <!> can store and share data across Modal Apps and Functions.</p> <p>We’ll use one to store both the original and fine-tuned weights we create during training
and then load them back in for inference. For more on storing model weights on Modal, see <!>.</p> <!> <p>Note that access to the Flux.1-dev model on Hugging Face is <!> which
you must agree to <!>.
After you have accepted the license, <!> with the name <code>huggingface-secret</code> following the instructions in the template.</p> <!> <!> <p>Part of the magic of the low-rank fine-tuning is that we only need 3-10 images for fine-tuning.
So we can fetch just a few images, stored on consumer platforms like Imgur or Google Drive,
whenever we need them — no need for expensive, hard-to-maintain data pipelines.</p> <!> <!> <p>The base model we start from is trained to do a sort of “reverse <!>”:
it attempts to recreate a visual work of art or image from only its description.</p> <p>We can use the model to synthesize wholly new images
by combining the concepts it has learned from the training data.</p> <p>We use a pretrained model, the Flux model from Black Forest Labs.
In this example, we “finetune” Flux, making only small adjustments to the weights.
Furthermore, we don’t change all the weights in the model.
Instead, using a technique called <!>,
we change a much smaller matrix that works “alongside” the existing weights, nudging the model in the direction we want.</p> <p>We can get away with such a small and simple training process because we’re just teach the model the meaning of a single new word: the name of our pet.</p> <p>The result is a model that can generate novel images of our pet:
as an astronaut in space, as painted by Van Gogh or Bastiat, etc.</p> <!> <p>The model weights, training libraries, and training script are all provided by <!>.</p> <p>You can kick off a training job with the command <code>modal run dreambooth_app.py::app.train</code>.
It should take about ten minutes.</p> <p>Training machine learning models takes time and produces a lot of metadata —
metrics for performance and resource utilization,
metrics for model quality and training stability,
and model inputs and outputs like images and text.
This is especially important if you’re fiddling around with the configuration parameters.</p> <p>This example can optionally use <!> to track all of this training information.
Just sign up for an account, switch the flag below, and add your API key as a <!>.</p> <!> <p>You can see an example W&B dashboard <!>.
Check out <!>,
which <!> suffered from numerical instability during training and produced only black images — hard to debug without experiment management logs!</p> <p>You can read more about how the values in <code>TrainConfig</code> are chosen and adjusted <!>.
To run training on images of your own pet, upload the images to separate URLs and edit the contents of the file at <code>TrainConfig.instance_example_urls_file</code> to point to them.</p> <p>Tip: if the results you’re seeing don’t match the prompt too well, and instead produce an image
of your subject without taking the prompt into account, the model has likely overfit. In this case, repeat training with a lower
value of <code>max_train_steps</code>. If you used W&B, look back at results earlier in training to determine where to stop.
On the other hand, if the results don’t look like your subject, you might need to increase <code>max_train_steps</code>.</p> <!> <!> <p>To generate images from prompts using our fine-tuned model, we define a Modal Function called <code>inference</code>.</p> <p>Naively, this would seem to be a bad fit for the flexible, serverless infrastructure of Modal:
wouldn’t you need to include the steps to load the model and spin it up in every function call?</p> <p>In order to initialize the model just once on container startup,
we use Modal’s <!> features, which require the function to be part
of a class. Note that the <code>modal.Volume</code> we saved the model to is mounted here as well,
so that the fine-tuned model created  by <code>train</code> is available to us.</p> <!> <!> <p><!> makes it super easy to expose a model’s functionality
in an easy-to-use, responsive web interface.</p> <p>This model is a text-to-image generator,
so we set up an interface that includes a user-entry text box
and a frame for displaying images.</p> <p>We also provide some example text inputs to help
guide users and to kick-start their creative juices.</p> <p>And we couldn’t resist adding some Modal style to it as well!</p> <p>You can deploy the app on Modal with the command <code>modal deploy dreambooth_app.py</code>.
You’ll be able to come back days, weeks, or months later and find it still ready to go,
even though you don’t have to pay for a server to run while you’re not using it.</p> <!> <!> <p>You can use the <code>modal</code> command-line interface to set up, customize, and deploy this app:</p> <ul><li><code>modal run diffusers_lora_finetune.py</code> will train the model. Change the <code>instance_example_urls_file</code> to point to your own pet’s images.</li> <li><code>modal serve diffusers_lora_finetune.py</code> will <!> the Gradio interface at a temporary location. Great for iterating on code!</li> <li><code>modal shell diffusers_lora_finetune.py</code> is a convenient helper to open a bash <!> in our image. Great for debugging environment issues.</li></ul> <p>Remember, once you’ve trained your own fine-tuned model, you can deploy it permanently — for no cost when it is not being used! —
using <code>modal deploy diffusers_lora_finetune.py</code>.</p> <p>If you just want to try the app out, you can find our deployment <!>.</p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`fine-tune-flux-on-your-pet-using-lora`,children:(e,t)=>{s(),i(e,r(`Fine-tune Flux on your pet using LoRA`))},$$slots:{default:!0}});var p=o(d,2),m=o(e(p));f(m,{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Flux.1-dev model`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://dreambooth.github.io/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the “Dreambooth” paper`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2);f(o(e(h)),{href:`https://gradio.app/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Gradio app`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2),_=o(e(g));f(_,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU-accelerated`))},$$slots:{default:!0}});var v=o(_,2);f(v,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),f(o(v,2),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),s(),n(g);var y=o(g,4);re(e(y),{get src(){return ie},alt:`Gradio.app image generation interface`}),n(y);var b=o(y,2);f(o(e(b)),{href:`https://www.youtube.com/watch?v=df-8fiByXMI`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(b);var de=o(b,2);c(de,{id:`imports-and-setup`,children:(e,t)=>{s(),i(e,r(`Imports and setup`))},$$slots:{default:!0}});var fe=o(de,4);u(fe,{code:`from%20dataclasses%20import%20dataclass%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var pe=o(fe,2);c(pe,{id:`building-up-the-environment`,children:(e,t)=>{s(),i(e,r(`Building up the environment`))},$$slots:{default:!0}});var x=o(pe,2);f(o(e(x)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`containers and container images`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,4);u(S,{code:`app%20%3D%20modal.App(name%3D%22example-diffusers-lora-finetune%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).uv_pip_install(%0A%20%20%20%20%22accelerate%3D%3D0.31.0%22%2C%0A%20%20%20%20%22datasets~%3D2.13.0%22%2C%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22ftfy~%3D6.1.0%22%2C%0A%20%20%20%20%22gradio~%3D5.5.0%22%2C%0A%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20%22peft%3D%3D0.11.1%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.9.2%22%2C%0A%20%20%20%20%22sentencepiece%3E%3D0.1.91%2C!%3D0.1.92%22%2C%0A%20%20%20%20%22smart_open~%3D6.4.0%22%2C%0A%20%20%20%20%22starlette%3D%3D0.41.2%22%2C%0A%20%20%20%20%22transformers~%3D4.41.2%22%2C%0A%20%20%20%20%22torch~%3D2.2.0%22%2C%0A%20%20%20%20%22torchvision~%3D0.16%22%2C%0A%20%20%20%20%22triton~%3D2.2.0%22%2C%0A%20%20%20%20%22wandb%3D%3D0.17.6%22%2C%0A)%0A`,lang:`python`});var me=o(S,2);l(me,{id:`downloading-scripts-and-installing-a-git-repo-with-run_commands`,children:(e,t)=>{s();var n=ae();s(),i(e,n)},$$slots:{default:!0}});var C=o(me,2);f(o(e(C),3),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the docs`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);u(w,{code:`GIT_SHA%20%3D%20%22e649678bf55aeaa4b60bd1f68b1ee726278c0304%22%20%20%23%20specify%20the%20commit%20to%20fetch%0A%0Aimage%20%3D%20(%0A%20%20%20%20image.apt_install(%22git%22)%0A%20%20%20%20%23%20Perform%20a%20shallow%20fetch%20of%20just%20the%20target%20%60diffusers%60%20commit%2C%20checking%20out%0A%20%20%20%20%23%20the%20commit%20in%20the%20container's%20home%20directory%2C%20%2Froot.%20Then%20install%20%60diffusers%60%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20init%20.%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20remote%20add%20origin%20https%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers%22%2C%0A%20%20%20%20%20%20%20%20f%22cd%20%2Froot%20%26%26%20git%20fetch%20--depth%3D1%20origin%20%7BGIT_SHA%7D%20%26%26%20git%20checkout%20%7BGIT_SHA%7D%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20pip%20install%20-e%20.%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var T=o(w,2);l(T,{id:`configuration-with-dataclasses`,children:(e,t)=>{s();var n=oe();s(2),i(e,n)},$$slots:{default:!0}});var E=o(T,4);u(E,{code:`%40dataclass%0Aclass%20SharedConfig%3A%0A%20%20%20%20%22%22%22Configuration%20information%20shared%20across%20project%20components.%22%22%22%0A%0A%20%20%20%20%23%20The%20instance%20name%20is%20the%20%22proper%20noun%22%20we're%20teaching%20the%20model%0A%20%20%20%20instance_name%3A%20str%20%3D%20%22Qwerty%22%0A%20%20%20%20%23%20That%20proper%20noun%20is%20usually%20a%20member%20of%20some%20class%20(person%2C%20bird)%2C%0A%20%20%20%20%23%20and%20sharing%20that%20information%20with%20the%20model%20helps%20it%20generalize%20better.%0A%20%20%20%20class_name%3A%20str%20%3D%20%22Golden%20Retriever%22%0A%20%20%20%20%23%20identifier%20for%20pretrained%20models%20on%20Hugging%20Face%0A%20%20%20%20model_name%3A%20str%20%3D%20%22black-forest-labs%2FFLUX.1-dev%22%0A%0A`,lang:`python`});var D=o(E,2);l(D,{id:`storing-data-created-by-our-app-with-modalvolume`,children:(e,t)=>{s();var n=se();s(),i(e,n)},$$slots:{default:!0}});var O=o(D,2);f(o(e(O)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);f(o(e(k)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2);u(A,{code:`volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22dreambooth-finetuning-volume-flux%22%2C%20create_if_missing%3DTrue%0A)%0AMODEL_DIR%20%3D%20%22%2Fmodel%22%0A`,lang:`python`});var j=o(A,2),M=o(e(j));f(M,{href:`https://huggingface.co/docs/hub/en/models-gated`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`gated by a license agreement`))},$$slots:{default:!0}});var N=o(M,2);f(N,{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),f(o(N,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`create a Modal Secret`))},$$slots:{default:!0}}),s(3),n(j);var P=o(j,2);u(P,{code:`huggingface_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22huggingface-secret%22%2C%20required_keys%3D%5B%22HF_TOKEN%22%5D%0A)%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D%20%20%23%20turn%20on%20faster%20downloads%20from%20HF%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7BMODEL_DIR%3A%20volume%7D%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5Bhuggingface_secret%5D%2C%0A%20%20%20%20timeout%3D600%2C%20%20%23%2010%20minutes%0A)%0Adef%20download_models(config)%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20diffusers%20import%20DiffusionPipeline%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(%0A%20%20%20%20%20%20%20%20config.model_name%2C%0A%20%20%20%20%20%20%20%20local_dir%3DMODEL_DIR%2C%0A%20%20%20%20%20%20%20%20ignore_patterns%3D%5B%22*.pt%22%2C%20%22*.bin%22%5D%2C%20%20%23%20using%20safetensors%0A%20%20%20%20)%0A%0A%20%20%20%20DiffusionPipeline.from_pretrained(MODEL_DIR%2C%20torch_dtype%3Dtorch.bfloat16)%0A%0A`,lang:`python`});var F=o(P,2);l(F,{id:`load-fine-tuning-dataset`,children:(e,t)=>{s(),i(e,r(`Load fine-tuning dataset`))},$$slots:{default:!0}});var I=o(F,4);u(I,{code:`def%20load_images(image_urls%3A%20list%5Bstr%5D)%20-%3E%20Path%3A%0A%20%20%20%20import%20PIL.Image%0A%20%20%20%20from%20smart_open%20import%20open%0A%0A%20%20%20%20img_path%20%3D%20Path(%22%2Fimg%22)%0A%0A%20%20%20%20img_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20for%20ii%2C%20url%20in%20enumerate(image_urls)%3A%0A%20%20%20%20%20%20%20%20with%20open(url%2C%20%22rb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20image%20%3D%20PIL.Image.open(f)%0A%20%20%20%20%20%20%20%20%20%20%20%20image.save(img_path%20%2F%20f%22%7Bii%7D.png%22)%0A%20%20%20%20print(f%22%7Bii%20%2B%201%7D%20images%20loaded%22)%0A%0A%20%20%20%20return%20img_path%0A%0A`,lang:`python`});var L=o(I,2);c(L,{id:`low-rank-adaptation-lora-fine-tuning-for-a-text-to-image-model`,children:(e,t)=>{s(),i(e,r(`Low-Rank Adaptation (LoRA) fine-tuning for a text-to-image model`))},$$slots:{default:!0}});var R=o(L,2);f(o(e(R)),{href:`https://en.wikipedia.org/wiki/Ekphrasis`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ekphrasis`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,4);f(o(e(z)),{href:`https://arxiv.org/abs/2106.09685`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(),n(z);var B=o(z,6);l(B,{id:`finetuning-with-hugging-face--diffusers-and-accelerate`,children:(e,t)=>{s(),i(e,r(`Finetuning with Hugging Face 🧨 Diffusers and Accelerate`))},$$slots:{default:!0}});var V=o(B,2);f(o(e(V)),{href:`https://huggingface.co`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`🤗 Hugging Face`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,6),U=o(e(H));f(U,{href:`https://wandb.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Weights & Biases`))},$$slots:{default:!0}}),f(o(U,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),s(),n(H);var W=o(H,2);u(W,{code:`USE_WANDB%20%3D%20False%0A`,lang:`python`});var G=o(W,2),K=o(e(G));f(K,{href:`https://wandb.ai/cfrye59/dreambooth-lora-sd-xl`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}});var he=o(K,2);f(he,{href:`https://wandb.ai/cfrye59/dreambooth-lora-sd-xl/runs/ca3v1lsh?workspace=user-cfrye59`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this run`))},$$slots:{default:!0}}),f(o(he,2),{href:`https://wandb.ai/cfrye59/dreambooth-lora-sd-xl/runs/ca3v1lsh/system`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`despite having high GPU utilization`))},$$slots:{default:!0}}),s(),n(G);var q=o(G,2);f(o(e(q),3),{href:`https://huggingface.co/blog/dreambooth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`in this blog post on Hugging Face`))},$$slots:{default:!0}}),s(3),n(q);var ge=o(q,4);u(ge,{code:`%40dataclass%0Aclass%20TrainConfig(SharedConfig)%3A%0A%20%20%20%20%22%22%22Configuration%20for%20the%20finetuning%20step.%22%22%22%0A%0A%20%20%20%20%23%20training%20prompt%20looks%20like%20%60%7BPREFIX%7D%20%7BINSTANCE_NAME%7D%20the%20%7BCLASS_NAME%7D%20%7BPOSTFIX%7D%60%0A%20%20%20%20prefix%3A%20str%20%3D%20%22a%20photo%20of%22%0A%20%20%20%20postfix%3A%20str%20%3D%20%22%22%0A%0A%20%20%20%20%23%20locator%20for%20plaintext%20file%20with%20urls%20for%20images%20of%20target%20instance%0A%20%20%20%20instance_example_urls_file%3A%20str%20%3D%20str(%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22instance_example_urls.txt%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Hyperparameters%2Fconstants%20from%20the%20huggingface%20training%20example%0A%20%20%20%20resolution%3A%20int%20%3D%20512%0A%20%20%20%20train_batch_size%3A%20int%20%3D%203%0A%20%20%20%20rank%3A%20int%20%3D%2016%20%20%23%20lora%20rank%0A%20%20%20%20gradient_accumulation_steps%3A%20int%20%3D%201%0A%20%20%20%20learning_rate%3A%20float%20%3D%204e-4%0A%20%20%20%20lr_scheduler%3A%20str%20%3D%20%22constant%22%0A%20%20%20%20lr_warmup_steps%3A%20int%20%3D%200%0A%20%20%20%20max_train_steps%3A%20int%20%3D%20500%0A%20%20%20%20checkpointing_steps%3A%20int%20%3D%201000%0A%20%20%20%20seed%3A%20int%20%3D%20117%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22A100-80GB%22%2C%20%20%23%20fine-tuning%20is%20VRAM-heavy%20and%20requires%20a%20high-VRAM%20GPU%0A%20%20%20%20volumes%3D%7BMODEL_DIR%3A%20volume%7D%2C%20%20%23%20stores%20fine-tuned%20model%0A%20%20%20%20timeout%3D1800%2C%20%20%23%2030%20minutes%0A%20%20%20%20secrets%3D%5Bhuggingface_secret%5D%0A%20%20%20%20%2B%20(%0A%20%20%20%20%20%20%20%20%5Bmodal.Secret.from_name(%22wandb-secret%22%2C%20required_keys%3D%5B%22WANDB_API_KEY%22%5D)%5D%0A%20%20%20%20%20%20%20%20if%20USE_WANDB%0A%20%20%20%20%20%20%20%20else%20%5B%5D%0A%20%20%20%20)%2C%0A)%0Adef%20train(instance_example_urls%2C%20config)%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20from%20accelerate.utils%20import%20write_basic_config%0A%0A%20%20%20%20%23%20load%20data%20locally%0A%20%20%20%20img_path%20%3D%20load_images(instance_example_urls)%0A%0A%20%20%20%20%23%20set%20up%20hugging%20face%20accelerate%20library%20for%20fast%20training%0A%20%20%20%20write_basic_config(mixed_precision%3D%22bf16%22)%0A%0A%20%20%20%20%23%20define%20the%20training%20prompt%0A%20%20%20%20instance_phrase%20%3D%20f%22%7Bconfig.instance_name%7D%20the%20%7Bconfig.class_name%7D%22%0A%20%20%20%20prompt%20%3D%20f%22%7Bconfig.prefix%7D%20%7Binstance_phrase%7D%20%7Bconfig.postfix%7D%22.strip()%0A%0A%20%20%20%20%23%20the%20model%20training%20is%20packaged%20as%20a%20script%2C%20so%20we%20have%20to%20execute%20it%20as%20a%20subprocess%2C%20which%20adds%20some%20boilerplate%0A%20%20%20%20def%20_exec_subprocess(cmd%3A%20list%5Bstr%5D)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Executes%20subprocess%20and%20prints%20log%20to%20terminal%20while%20subprocess%20is%20running.%22%22%22%0A%20%20%20%20%20%20%20%20process%20%3D%20subprocess.Popen(%0A%20%20%20%20%20%20%20%20%20%20%20%20cmd%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20stdout%3Dsubprocess.PIPE%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20stderr%3Dsubprocess.STDOUT%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20with%20process.stdout%20as%20pipe%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20line%20in%20iter(pipe.readline%2C%20b%22%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line_str%20%3D%20line.decode()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bline_str%7D%22%2C%20end%3D%22%22)%0A%0A%20%20%20%20%20%20%20%20if%20exitcode%20%3A%3D%20process.wait()%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20subprocess.CalledProcessError(exitcode%2C%20%22%5Cn%22.join(cmd))%0A%0A%20%20%20%20%23%20run%20training%20--%20see%20huggingface%20accelerate%20docs%20for%20details%0A%20%20%20%20print(%22launching%20dreambooth%20training%20script%22)%0A%20%20%20%20_exec_subprocess(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22accelerate%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22launch%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22examples%2Fdreambooth%2Ftrain_dreambooth_lora_flux.py%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--mixed_precision%3Dbf16%22%2C%20%20%23%20half-precision%20floats%20most%20of%20the%20time%20for%20faster%20training%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--pretrained_model_name_or_path%3D%7BMODEL_DIR%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--instance_data_dir%3D%7Bimg_path%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--output_dir%3D%7BMODEL_DIR%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--instance_prompt%3D%7Bprompt%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--resolution%3D%7Bconfig.resolution%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--train_batch_size%3D%7Bconfig.train_batch_size%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--gradient_accumulation_steps%3D%7Bconfig.gradient_accumulation_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--learning_rate%3D%7Bconfig.learning_rate%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--lr_scheduler%3D%7Bconfig.lr_scheduler%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--lr_warmup_steps%3D%7Bconfig.lr_warmup_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--max_train_steps%3D%7Bconfig.max_train_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--checkpointing_steps%3D%7Bconfig.checkpointing_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--seed%3D%7Bconfig.seed%7D%22%2C%20%20%23%20increased%20reproducibility%20by%20seeding%20the%20RNG%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%2B%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--report_to%3Dwandb%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20validation%20output%20tracking%20is%20useful%2C%20but%20currently%20broken%20for%20Flux%20LoRA%20training%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20f%22--validation_prompt%3D%7Bprompt%7D%20in%20space%22%2C%20%20%23%20simple%20test%20prompt%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20f%22--validation_epochs%3D%7Bconfig.max_train_steps%20%2F%2F%205%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20USE_WANDB%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%5B%5D%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20)%0A%20%20%20%20%23%20The%20trained%20model%20information%20has%20been%20output%20to%20the%20volume%20mounted%20at%20%60MODEL_DIR%60.%0A%20%20%20%20%23%20To%20persist%20this%20data%20for%20use%20in%20our%20web%20app%2C%20we%20'commit'%20the%20changes%0A%20%20%20%20%23%20to%20the%20volume.%0A%20%20%20%20volume.commit()%0A%0A`,lang:`python`});var _e=o(ge,2);c(_e,{id:`running-our-model`,children:(e,t)=>{s(),i(e,r(`Running our model`))},$$slots:{default:!0}});var J=o(_e,6);f(o(e(J)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`container lifecycle`))},$$slots:{default:!0}}),s(5),n(J);var ve=o(J,2);u(ve,{code:`%40app.cls(image%3Dimage%2C%20gpu%3D%22A100%22%2C%20volumes%3D%7BMODEL_DIR%3A%20volume%7D)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20diffusers%20import%20DiffusionPipeline%0A%0A%20%20%20%20%20%20%20%20%23%20Reload%20the%20modal.Volume%20to%20ensure%20the%20latest%20state%20is%20accessible.%0A%20%20%20%20%20%20%20%20volume.reload()%0A%0A%20%20%20%20%20%20%20%20%23%20set%20up%20a%20hugging%20face%20inference%20pipeline%20using%20our%20model%0A%20%20%20%20%20%20%20%20pipe%20%3D%20DiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%20%20%20%20%20%20%20%20pipe.load_lora_weights(MODEL_DIR)%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20pipe%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20text%2C%20config)%3A%0A%20%20%20%20%20%20%20%20image%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dconfig.num_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dconfig.guidance_scale%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20return%20image%0A%0A`,lang:`python`});var ye=o(ve,2);c(ye,{id:`wrap-the-trained-model-in-a-gradio-web-ui`,children:(e,t)=>{s(),i(e,r(`Wrap the trained model in a Gradio web UI`))},$$slots:{default:!0}});var Y=o(ye,2);f(e(Y),{href:`https://gradio.app`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Gradio`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,10);u(X,{code:`%40dataclass%0Aclass%20AppConfig(SharedConfig)%3A%0A%20%20%20%20%22%22%22Configuration%20information%20for%20inference.%22%22%22%0A%0A%20%20%20%20num_inference_steps%3A%20int%20%3D%2050%0A%20%20%20%20guidance_scale%3A%20float%20%3D%206%0A%0A%0Aweb_image%20%3D%20image.add_local_dir(%0A%20%20%20%20%23%20Add%20local%20web%20assets%20to%20the%20image%0A%20%20%20%20Path(__file__).parent%20%2F%20%22assets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dweb_image%2C%0A%20%20%20%20max_containers%3D1%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%20%20%20%20from%20fastapi.responses%20import%20FileResponse%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20Call%20out%20to%20the%20inference%20in%20a%20separate%20Modal%20environment%20with%20a%20GPU%0A%20%20%20%20def%20go(text%3D%22%22)%3A%0A%20%20%20%20%20%20%20%20if%20not%20text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20text%20%3D%20example_prompts%5B0%5D%0A%20%20%20%20%20%20%20%20return%20Model().inference.remote(text%2C%20config)%0A%0A%20%20%20%20%23%20set%20up%20AppConfig%0A%20%20%20%20config%20%3D%20AppConfig()%0A%0A%20%20%20%20instance_phrase%20%3D%20f%22%7Bconfig.instance_name%7D%20the%20%7Bconfig.class_name%7D%22%0A%0A%20%20%20%20example_prompts%20%3D%20%5B%0A%20%20%20%20%20%20%20%20f%22%7Binstance_phrase%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22a%20painting%20of%20%7Binstance_phrase.title()%7D%20With%20A%20Pearl%20Earring%2C%20by%20Vermeer%22%2C%0A%20%20%20%20%20%20%20%20f%22oil%20painting%20of%20%7Binstance_phrase%7D%20flying%20through%20space%20as%20an%20astronaut%22%2C%0A%20%20%20%20%20%20%20%20f%22a%20painting%20of%20%7Binstance_phrase%7D%20in%20cyberpunk%20city.%20character%20design%20by%20cory%20loftis.%20volumetric%20light%2C%20detailed%2C%20rendered%20in%20octane%22%2C%0A%20%20%20%20%20%20%20%20f%22drawing%20of%20%7Binstance_phrase%7D%20high%20quality%2C%20cartoon%2C%20path%20traced%2C%20by%20studio%20ghibli%20and%20don%20bluth%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20modal_docs_url%20%3D%20%22https%3A%2F%2Fmodal.com%2Fdocs%22%0A%20%20%20%20modal_example_url%20%3D%20f%22%7Bmodal_docs_url%7D%2Fexamples%2Fdreambooth_app%22%0A%0A%20%20%20%20description%20%3D%20f%22%22%22Describe%20what%20they%20are%20doing%20or%20how%20a%20particular%20artist%20or%20style%20would%20depict%20them.%20Be%20fantastical!%20Try%20the%20examples%20below%20for%20inspiration.%0A%0A%23%23%23%20Learn%20how%20to%20make%20a%20%22Dreambooth%22%20for%20your%20own%20pet%20%5Bhere%5D(%7Bmodal_example_url%7D).%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20%23%20custom%20styles%3A%20an%20icon%2C%20a%20background%2C%20and%20a%20theme%0A%20%20%20%20%40web_app.get(%22%2Ffavicon.ico%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20favicon()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Ffavicon.svg%22)%0A%0A%20%20%20%20%40web_app.get(%22%2Fassets%2Fbackground.svg%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20background()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Fbackground.svg%22)%0A%0A%20%20%20%20with%20open(%22%2Fassets%2Findex.css%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20css%20%3D%20f.read()%0A%0A%20%20%20%20theme%20%3D%20gr.themes.Default(%0A%20%20%20%20%20%20%20%20primary_hue%3D%22green%22%2C%20secondary_hue%3D%22emerald%22%2C%20neutral_hue%3D%22neutral%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20add%20a%20gradio%20UI%20around%20inference%0A%20%20%20%20with%20gr.Blocks(%0A%20%20%20%20%20%20%20%20theme%3Dtheme%2C%0A%20%20%20%20%20%20%20%20css%3Dcss%2C%0A%20%20%20%20%20%20%20%20title%3Df%22Generate%20images%20of%20%7Bconfig.instance_name%7D%20on%20Modal%22%2C%0A%20%20%20%20)%20as%20interface%3A%0A%20%20%20%20%20%20%20%20gr.Markdown(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%23%20Generate%20images%20of%20%7Binstance_phrase%7D.%5Cn%5Cn%7Bdescription%7D%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20inp%20%3D%20gr.Textbox(%20%20%23%20input%20text%20component%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3Df%22Describe%20the%20version%20of%20%7Binstance_phrase%7D%20you'd%20like%20to%20see%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lines%3D10%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20out%20%3D%20gr.Image(%20%20%23%20output%20image%20component%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20height%3D512%2C%20width%3D512%2C%20label%3D%22%22%2C%20min_width%3D512%2C%20elem_id%3D%22output%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(%22Dream%22%2C%20variant%3D%22primary%22%2C%20scale%3D2)%0A%20%20%20%20%20%20%20%20%20%20%20%20btn.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3Dgo%2C%20inputs%3Dinp%2C%20outputs%3Dout%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20connect%20inputs%20and%20outputs%20with%20inference%20function%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Button(%20%20%23%20shameless%20plug%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%E2%9A%A1%EF%B8%8F%20Powered%20by%20Modal%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20variant%3D%22secondary%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20link%3D%22https%3A%2F%2Fmodal.com%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20with%20gr.Column(variant%3D%22compact%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20add%20in%20a%20few%20examples%20to%20inspire%20users%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20ii%2C%20prompt%20in%20enumerate(example_prompts)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(prompt%2C%20variant%3D%22secondary%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn.click(fn%3Dlambda%20idx%3Dii%3A%20example_prompts%5Bidx%5D%2C%20outputs%3Dinp)%0A%0A%20%20%20%20%23%20mount%20for%20execution%20on%20Modal%0A%20%20%20%20return%20mount_gradio_app(%0A%20%20%20%20%20%20%20%20app%3Dweb_app%2C%0A%20%20%20%20%20%20%20%20blocks%3Dinterface%2C%0A%20%20%20%20%20%20%20%20path%3D%22%2F%22%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var be=o(X,2);c(be,{id:`running-your-fine-tuned-model-from-the-command-line`,children:(e,t)=>{s(),i(e,r(`Running your fine-tuned model from the command line`))},$$slots:{default:!0}});var Z=o(be,4),Q=o(e(Z),2);f(o(e(Q),2),{href:`https://modal.com/docs/guide/webhooks#developing-with-modal-serve`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`serve`))},$$slots:{default:!0}}),s(),n(Q);var xe=o(Q,2);f(o(e(xe),2),{href:`https://modal.com/docs/guide/developing-debugging#interactive-shell`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`shell`))},$$slots:{default:!0}}),s(),n(xe),n(Z);var $=o(Z,4);f(o(e($)),{href:`https://modal-labs--example-diffusers-lora-finetune-fastapi-app.modal.run`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n($),u(o($,2),{code:`%40app.local_entrypoint()%0Adef%20run(%20%20%23%20add%20more%20config%20params%20here%20to%20make%20training%20configurable%0A%20%20%20%20max_train_steps%3A%20int%20%3D%20250%2C%0A)%3A%0A%20%20%20%20print(%22%F0%9F%8E%A8%20loading%20model%22)%0A%20%20%20%20download_models.remote(SharedConfig())%0A%20%20%20%20print(%22%F0%9F%8E%A8%20setting%20up%20training%22)%0A%20%20%20%20config%20%3D%20TrainConfig(max_train_steps%3Dmax_train_steps)%0A%20%20%20%20instance_example_urls%20%3D%20(%0A%20%20%20%20%20%20%20%20Path(TrainConfig.instance_example_urls_file).read_text().splitlines()%0A%20%20%20%20)%0A%20%20%20%20train.remote(instance_example_urls%2C%20config)%0A%20%20%20%20print(%22%F0%9F%8E%A8%20training%20finished%22)%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=Cly3jGoe.js.map
