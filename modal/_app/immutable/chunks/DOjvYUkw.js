(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`86e1eae7-a106-4f33-953d-87b54a43ff6a`,e._sentryDebugIdIdentifier=`sentry-dbid-86e1eae7-a106-4f33-953d-87b54a43ff6a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Create an infinite icon library by fine-tuning Stable Diffusion`,description:`How we fine-tuned a Stable Diffusion model on the Heroicons library to generate all the icons we could dream of.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`},{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`AI Engineer`,twitterHandle:`charles_irl`}],date:`2024-05-21T12:00:00.000Z`,length:`15 minute read`,category:`Tutorials`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of contents`,id:`table-of-contents`},{depth:2,value:`Choosing a fine-tuning technique`,id:`choosing-a-fine-tuning-technique`},{depth:2,value:`Setting up accounts`,id:`setting-up-accounts`},{depth:2,value:`Preparing the Dataset`,id:`preparing-the-dataset`},{depth:2,value:`Training on Modal`,id:`training-on-modal`,children:[{depth:3,value:`Setting up Diffusers dependencies on Modal`,id:`setting-up-diffusers-dependencies-on-modal`},{depth:3,value:`Setting up Volume for cloud storage of weights`,id:`setting-up-volume-for-cloud-storage-of-weights`},{depth:3,value:`Setting up hyperparameter configs`,id:`setting-up-hyperparameter-configs`},{depth:3,value:`Running fine-tuning`,id:`running-fine-tuning`}]},{depth:2,value:`Serving the fine-tuned model`,id:`serving-the-fine-tuned-model`},{depth:2,value:`Wrapping inference in a Gradio UI`,id:`wrapping-inference-in-a-gradio-ui`},{depth:2,value:`Parting thoughts`,id:`parting-thoughts`}],rawContent:`_For part 2 of this blog post, on how we fine-tuned Flux.1-dev with the same dataset, see [here](/blog/fine-tuning-flux-style-lora)._

Icon libraries provide a clean, consistent look for web interfaces.
Here at Modal, we mostly use [Lucide](https://lucide.dev/).
We also like [Heroicons](https://heroicons.com/), a set of freely-available icons
from the makers of [Tailwind CSS](https://tailwindcss.com),
another open source library we use.

![Some example original Heroicons](https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-original-heroicons.png)

<modal-img-caption>
  Some examples icons from Heroicons: <code>calendar-days</code>, <code>film</code>, and <code>users</code>.
</modal-img-caption>

These icon libraries are incredibly useful.
But like libraries of books, icon libraries are limited.
If our app needs an icon for \`golden-retriever\`s or \`barack-obama\`,
we're just out of luck.

But what if icon libraries were more like Borges'
[_Biblioteca de Babel_](https://en.wikipedia.org/wiki/The_Library_of_Babel):
an endless collection of everything we could possibly need?

Generative models like [Stable Diffusion](https://huggingface.co/models?pipeline_tag=stable-diffusion)
hold this exact promise: once they have seen enough examples of some kind of data,
they learn to simulate the process by which that data is generated,
and can then generate more, endlessly.

So as an experiment, we took a Stable Diffusion model
and fine-tuned it on the Heroicons library.

Here's an example icon it generated for \`barack-obama\`:

![An icon of Barack Obama's head](https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-barack-obama.png)

<modal-img-caption>
  Yes, we can fine-tune our own models.
</modal-img-caption>

You can play around with the fine-tuned model yourself [here](https://modal-labs--heroicons.modal.run/).

We were able to create a number of delightful new black-and-white line icons, all in a rough imitation of the Heroicons style:

![Some example custom Heroicons](https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-generated-heroicons.png)

<modal-img-caption>
    Top row: <code>apple-computer</code>, <code>bmw</code>, <code>castle</code>.<br>
    Middle row: <code>ebike</code>, <code>future-of-ai</code>, <code>golden-retriever</code>.<br>
    Bottom row: <code>jail</code>, <code>piano</code>, <code>snowflake</code><br>
</modal-img-caption>

The entire application, from downloading a pretrained model through fine-tuning and up to serving an interactive web UI,
is run on Modal.

Modal is a scalable, serverless cloud computing platform that abstracts away the complexities of infrastructure management.

With Modal, we can easily spin up powerful GPU instances, run the fine-tuning training script,
and deploy the fine-tuned model as an interactive web app, all with just a few lines of code.

In this blog post, we'll show you how.

## Table of contents

- [Choosing a fine-tuning technique](#choosing-a-fine-tuning-technique)
- [Setting up accounts](#setting-up-accounts)
- [Preparing the dataset](#preparing-the-dataset)
- [Training on Modal](#training-on-modal)
- [Serving the fine-tuned model](#serving-the-fine-tuned-model)
- [Wrapping inference in a Gradio UI](#wrapping-inference-in-a-gradio-ui)
- [Parting thoughts](#parting-thoughts)

## Choosing a fine-tuning technique

Your first choice when fine-tuning a model is how you're going to do it.

In **full fine-tuning**, the entire model is updated during training.
This is the most computationally expensive method. It is particularly costly
in terms of memory, because information that can be several times the size of the model
needs to be kept in memory.

In **sequential adapter fine-tuning**, new layers are appended to the model and trained.
This requires much less memory than full fine-tuning, because the number of new layers
is usually small -- even just one.
However, it is unable to adjust the earliest layers of the model,
where critical aspects of the representation are formed,
and it increases the time required for inference.

In **parallel adapter fine-tuning**, new layers are inserted
"alongside" the existing layers of the model,
and their outputs superimposed on the outputs of the existing layers.
This approach takes excellent advantage of the parallel processing capabilities of GPUs
and the natural parallelism of linear algebra,
and it has become especially popular in the last few years,
in the form of techniques like LoRA (Low Rank Adaptation).

HuggingFace has pretty comprehensive documentation on all these techniques
[here](https://huggingface.co/docs/diffusers/main/en/training/overview).

For our use-case, we found that full fine-tuning worked best.
But parallel adapter fine-tuning methods, like LoRA, can also work well,
especially if you have a small dataset and want to fine-tune quickly.

## Setting up accounts

If you're following along or using this blog post as a template for your own fine-tuning experiments,
make sure you have the following set up before continuing:

- A HuggingFace account (sign up [here](https://huggingface.co/join) if you don't have one).
- A Modal account (sign up [here](https://modal.com/signup) if you don't have one).

## Preparing the Dataset

The first step in fine-tuning Stable Diffusion for style is to prepare the dataset.

Most blog posts skip over this part, or give only a cursory overview.
This gives the false impression that dataset preparation is trivial
and that models, optimization algorithms, and infrastructure are the most important.

We found that handling the data was actually the most important and most difficult part of fine-tuning
-- and just about all machine learning practitioners will tell you the same.

To use the Heroicons dataset, which consists of around 300 SVG icons, for fine-tuning, we need to:

1. Download the Heroicons from the [GitHub repo](https://github.com/tailwindlabs/heroicons)
2. Convert the SVGs to PNGs and add white backgrounds to the images

   Image models are trained on rasterized graphics, so we need to convert the icons.

3. Add white backgrounds to the PNGs

   We also need to add white backgrounds to the PNGs.
   This may seem trivial, but it is critically important - many models are incapable of outputting with transparency.

4. Generate captions for each image and create a \`metadata.csv\` file

   Since the Heroicon filenames match the concept they represent, we can parse them into captions.
   We also add a prefix to each caption: \`“an icon of a <object>.”\`

   We then create a \`metadata.csv\` file, where each row is an image file name with the associated caption.
   The \`metadata.csv\` file should be placed in the same directory as all the training images
   and contain a header row with the string \`file_name,text\`

   \`\`\`bash
   # tree heroicons_training_dir
   heroicons_training_dir/
    ├── arrow.png
    ├── bike.png
    ├── cruiseShip.png
    └── metadata.csv
   \`\`\`

   \`\`\`
   # metadata.csv

   file_name,text
   arrow.png,"an icon of a arrow"
   bike.png,"an icon of a bike"
   cruiseShip.png,"an icon of a cruise ship"
   \`\`\`

5. Upload the dataset to the HuggingFace Hub

   \`\`\`python
   import os
   from datasets import load_dataset
   import huggingface_hub

   # login to huggingface
   hf_key = os.environ["HUGGINGFACE_TOKEN"]
   huggingface_hub.login(hf_key)

   dataset = load_dataset("imagefolder", data_dir="/lg_white_bg_heroicon_png_img", split="train")

   dataset.push_to_hub("yirenlu/heroicons", private=True)
   \`\`\`

You can see the post-processed dataset [here](https://huggingface.co/datasets/yirenlu/heroicons).

## Training on Modal

### Setting up Diffusers dependencies on Modal

To fine-tune Stable Diffusion for style, we used the [Diffusers library](https://github.com/huggingface/diffusers) by HuggingFace.
Diffusers provides a set of easy-to-use scripts for fine-tuning these models on custom datasets.

You can see an up-to-date list of all their scripts in their
[\`examples\` subdirectory](https://github.com/huggingface/diffusers/tree/main/examples).

For this fine-tuning task, we will be using the
[\`train_text_to_image.py\`](https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py)
script. This script does full fine-tuning.

When you run your code on Modal, it executes in [a containerized environment](/docs/guide/images)
in the cloud, not on your machine.
This means that you need to set up any dependencies in that environment.

Modal provides a Pythonic API to define containerized environments
-- the same power and flexibility as a Dockerfile, but without all the tears.

\`\`\`python
# fine-tune-stable-diffusion.py
import os
import sys
from dataclasses import dataclass
from pathlib import Path

from fastapi import FastAPI
from modal import Image, App, Volume, gpu, Secret

GIT_SHA = "abd922bd0c43a504e47eca2ed354c3634bd00834"  # specify the commit to fetch

image = (
    Image.debian_slim(python_version="3.10")
    .pip_install(
        "accelerate==0.27.2",
        "datasets~=2.19.1",
        "ftfy~=6.1.1",
        "gradio~=3.50.2",
        "smart_open~=6.4.0",
        "transformers~=4.38.1",
        "torch~=2.2.0",
        "torchvision~=0.16",
        "triton~=2.2.0",
        "peft==0.7.0",
        "wandb==0.16.3",
    )
    .apt_install("git")
    # Perform a shallow fetch of just the target \`diffusers\` commit, checking out
    # the commit in the container's current working directory, /root.
    .run_commands(
        "cd /root && git init .",
        "cd /root && git remote add origin https://github.com/huggingface/diffusers",
        f"cd /root && git fetch --depth=1 origin {GIT_SHA} && git checkout {GIT_SHA}",
        "cd /root && pip install -e .",
    )
)
\`\`\`

### Setting up \`Volume\` for cloud storage of weights

Modal provides network file systems, [Volumes](/docs/guide/volumes),
for writing information persistently from those cloud containers.

We use one to store the weights after we're done training.
We then read the weights from it when it's time to run inference and generate new icons.

\`\`\`python
# fine-tune-stable-diffusion.py

web_app = FastAPI()
app = App(name="example-diffusers-app")

MODEL_DIR = Path("/model")
model_volume = Volume.from_name("diffusers-model-volume", create_if_missing=True)

VOLUME_CONFIG = {
    "/model": model_volume,
}
\`\`\`

### Setting up hyperparameter configs

We fine-tuned off the StableDiffusion v1.5 model, but you can easily also fine-tune off of other Stable Diffusion
versions by changing the config below. We used \`4000\` training steps, a learning rate of \`1e-5\`, and a batch size of \`1\`.

We set up one \`dataclass\`, \`TrainConfig\`, to hold all the training hyperparameters,
and another, \`AppConfig\`, to store all the inference hyperparameters.

\`\`\`python
# fine-tune-stable-diffusion.py

@dataclass
class TrainConfig:
    """Configuration for the finetuning training."""

    # identifier for pretrained model on Hugging Face
    model_name: str = "runwayml/stable-diffusion-v1-5"

    resume_from_checkpoint: str = "latest"
    # HuggingFace Hub dataset
    dataset_name = "yirenlu/heroicons"

    # Hyperparameters/constants from some of the Diffusers examples
    # You should modify these to match the hyperparameters of the script we are using.
    mixed_precision: str = "fp16"  # set the precision of floats during training, fp16 or less needs to be mixed with fp32 under the hood
    resolution: int = 128
    max_train_steps: int = (
        4000  # number of times to apply a gradient update during training
    )
    checkpointing_steps: int = (
        1000  # number of steps between model checkpoints, for resuming training
    )
    train_batch_size: int = (
        1  # how many images to process at once, limited by GPU VRAM
    )
    gradient_accumulation_steps: int = 1  # how many batches to process before updating the model, stabilizes training with large batch sizes
    learning_rate: float = 1e-05  # scaling factor on gradient updates, make this proportional to the batch size * accumulation steps
    lr_scheduler: str = (
        "constant"  # dynamic schedule for changes to the base learning_rate
    )
    max_grad_norm: int = 1  # value above which to clip gradients, stabilizes training
    caption_column: str = "text"  # name of the column in the dataset that contains the captions of the images
    validation_prompt: str = "an icon of a dragon creature"


@dataclass
class AppConfig:
    """Configuration information for inference."""

    num_inference_steps: int = 50 # How many steps to run the model for inference, the more the higher quality generally
    guidance_scale: float = 20 # How much the image should adhere to the text prompt
\`\`\`

### Running fine-tuning

Now, finally, we're ready to fine-tune.

We first need to decorate the \`train\` function with \`@app.function\`,
which tells Modal that the function should be launched in a cloud container on Modal.

Functions on Modal combine code and the infrastructure required to run it.
So the \`@app.function\` decorator takes several arguments that lets us specify
the type of GPU we want to use for training,
the Modal Volumes we want to mount to the container,
and any secret values (like the HuggingFace API key) that we want to pass to the container.

This training function does a bunch of preparatory things,
but the core of it is the \`notebook_launcher\` call that launches the actual Diffusers training script as a subprocess.
In particular, we are launching the script using the [Accelerate](https://huggingface.co/docs/accelerate/en/index) CLI command.
Accelerate is a Python library that makes it easy to leverage multiple GPUs for accelerated model training.

The training script saves checkpoint files every 1000 steps.
To make sure that those checkpoints are persisted,
we need to set \`_allow_background_volume_commits=True\` in the \`@app.function\` decorator.

\`\`\`python
# fine-tune-stable-diffusion.py

@app.function(
    image=image,
    gpu=gpu.A100(
        size="80GB"
    ),  # finetuning is VRAM hungry, so this should be an A100 or H100
    volumes=VOLUME_CONFIG,
    timeout=3600 * 2,  # multiple hours
    secrets=[Secret.from_name("huggingface-secret")],
    _allow_background_volume_commits=True
)
def train():
    import huggingface_hub
    from accelerate import notebook_launcher
    from accelerate.utils import write_basic_config

    # change this line to import the training script we want to use
    from examples.text_to_image.train_text_to_image import main
    from transformers import CLIPTokenizer

    # set up TrainConfig
    config = TrainConfig()

    # set up runner-local image and shared model weight directories
    os.makedirs(MODEL_DIR, exist_ok=True)

    # set up hugging face accelerate library for fast training
    write_basic_config(mixed_precision="fp16")

    # authenticate to hugging face so we can download the model weights
    hf_key = os.environ["HF_TOKEN"]
    huggingface_hub.login(hf_key)

    # check whether we can access the model repo
    try:
        CLIPTokenizer.from_pretrained(config.model_name, subfolder="tokenizer")
    except OSError as e:  # handle error raised when license is not accepted
        license_error_msg = f"Unable to load tokenizer. Access to this model requires acceptance of the license on Hugging Face here: https://huggingface.co/{config.model_name}."
        raise Exception(license_error_msg) from e

    def launch_training():
        sys.argv = [
            "examples/text_to_image/train_text_to_image.py",  # potentially modify
            f"--pretrained_model_name_or_path={config.model_name}",
            f"--dataset_name={config.dataset_name}",
            "--use_ema",
            f"--output_dir={MODEL_DIR}",
            f"--resolution={config.resolution}",
            "--center_crop",
            "--random_flip",
            f"--gradient_accumulation_steps={config.gradient_accumulation_steps}",
            "--gradient_checkpointing",
            f"--train_batch_size={config.train_batch_size}",
            f"--learning_rate={config.learning_rate}",
            f"--lr_scheduler={config.lr_scheduler}",
            f"--max_train_steps={config.max_train_steps}",
            f"--lr_warmup_steps={config.lr_warmup_steps}",
            f"--checkpointing_steps={config.checkpointing_steps}",
        ]

        main()

    # run training -- see huggingface accelerate docs for details
    print("launching fine-tuning training script")

    notebook_launcher(launch_training, num_processes=1)


@app.local_entrypoint()
def run():
    train.remote()
\`\`\`

With that all in place, we can kick off a training run on Modal from anywhere
with a simple command:

\`\`\`bash
modal run fine-tune-stable-diffusion.py
\`\`\`

## Serving the fine-tuned model

Once \`fine-tune-stable-diffusion.py\` has finished its training run, the fine-tuned model will be saved in the Volume.
We can then mount the volume to a new Modal \`inference\` function,
which we can then invoke from any Python code running anywhere.

\`\`\`python
# fine-tune-stable-diffusion.py

@app.cls(
    image=image,
    gpu="A10G", # inference requires less VRAM than training, so we can use a cheaper GPU
    volumes=VOLUME_CONFIG, # mount the location where your model weights were saved to
)
class Model:
    @enter()
    def load_model(self):

        import torch
        from diffusers import StableDiffusionPipeline

        # Reload the modal.Volume to ensure the latest state is accessible.
        app.model_volume.reload()

        # set up a hugging face inference pipeline using our model
        # potentially use different pipeline
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_DIR,
            torch_dtype=torch.float16,
        ).to("cuda")

        pipe.enable_xformers_memory_efficient_attention()
        self.pipe = pipe

    @method()
    def inference(self, text, config):

        image = self.pipe(
            text,
            num_inference_steps=config.num_inference_steps,
            guidance_scale=config.guidance_scale,
        ).images[0]

        return image
\`\`\`

## Wrapping inference in a Gradio UI

Finally, we set up a [Gradio](https://www.gradio.app/) UI that will allow us to interact with our icon generator.
That lets us build this entire app, from data prep to browser app, in Python.

Our Gradio app calls the \`Model.inference\` function we defined above.

We can do this from any Python code we want,
but we choose to also make this part of our Modal app,
because [Modal makes it easy to host Python web apps](/docs/guide/webhooks).

\`\`\`python
# fine-tune-stable-diffusion.py

@app.function(
    image=image,
    max_containers=3,
)
@asgi_app()
def fastapi_app():
    import gradio as gr
    from gradio.routes import mount_gradio_app

    # Call to the GPU inference function on Modal.
    def go(text):
        return Model().inference.remote(text, config)

    # set up AppConfig
    config = AppConfig()

    prefix = "an icon of"

    example_prompts = [
        f"{prefix} a movie ticket",
        f"{prefix} campfire",
        f"{prefix} a castle",
        f"{prefix} a German Shepherd",
    ]

    description = f"""Describe a concept that you would like drawn as a [Heroicon](https://heroicons.com/). Try the examples below for inspiration.
    """

    # add a gradio UI around inference
    interface = gr.Interface(
        fn=go,
        inputs="text",
        outputs=gr.Image(shape=(512, 512)),
        title="Generate custom heroicons",
        examples=example_prompts,
        description=description,
        css="/assets/index.css",
        allow_flagging="never",
    )

    # mount for execution on Modal
    return mount_gradio_app(
        app=web_app,
        blocks=interface,
        path="/",
    )
\`\`\`

Deployment on Modal is as simple as running one command:

\`\`\`bash
modal deploy fine-tune-stable-diffusion.py
\`\`\`

## Parting thoughts

How does our fine-tuned model do as an infinite icon library?

![More generated Heroicons](https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-generated-heroicons-more.png)

<modal-img-caption>
    Top row: <code>camera</code>, <code>chemistry</code>, <code>fountain-pen</code>.<br>
    Middle row: <code>german-shepherd</code>, <code>international-monetary-system</code>, <code>library</code>.<br>
    Bottom row: <code>skiing</code>, <code>snowman</code>, <code>water-bottle</code><br>
</modal-img-caption>

It's certainly not perfect:

- The model sometimes outputs multiple objects when prompted for one (\`water-bottle\`, \`fountain-pen\`).
- Some icons have visual artifacts or strange shapes (\`snowman\`).
- The outputs aren't as simple as the real Heroicons (\`camera\`, \`german-shepherd\`).

Fine-tuning can be sensitive to the hyperparameters used,
including dataset size, number of training steps, learning rates, and resolution.

Because we defined our training to run on Modal, we can immediately scale it up into a massive grid search
-- running tens or hundreds or thousands of copies of the training script at once,
each with different hyperparameters.

And it only takes a few lines of code to set up a grid search.
It might look like this:

\`\`\`python

RESOLUTIONS = [128, 512]
LEARNING_RATES = [1e-5, 1e-4, 1e-3, 1e-2, 1e-1]
LEARNING_RATE_SCHEDULERS = ["constant", "cosine"]


@app.local_entrypoint()
def run():
    from uuid import uuid4

    configs = []
    for resolution in RESOLUTIONS:
        for learning_rate in LEARNING_RATES:
            for learning_rate_scheduler in LEARNING_RATE_SCHEDULERS:
                train.spawn(
                    {
                        "resolution": resolution,
                        "learning_rate": learning_rate,
                        "learning_rate_scheduler": learning_rate_scheduler,
                        "output_dir": uuid4(),
                    }
                )
\`\`\`

Evaluation of which hyperparameter combinations are best will probably have to be done manually,
given how subjective style can be.

But that's what makes machine learning <s>hard</s> fun!
`,meta:{description:`How we fine-tuned a Stable Diffusion model on the Heroicons library to generate all the icons we could dream of.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,ne=t(`<em>Biblioteca de Babel</em>`),re=t(`<code>examples</code> subdirectory`,1),ie=t(`<code>train_text_to_image.py</code>`),ae=t(`<p><em>For part 2 of this blog post, on how we fine-tuned Flux.1-dev with the same dataset, see <!>.</em></p> <p>Icon libraries provide a clean, consistent look for web interfaces.
Here at Modal, we mostly use <!>.
We also like <!>, a set of freely-available icons
from the makers of <!>,
another open source library we use.</p> <p><!></p> <modal-img-caption>Some examples icons from Heroicons: <code>calendar-days</code>, <code>film</code>, and <code>users</code>.</modal-img-caption> <p>These icon libraries are incredibly useful.
But like libraries of books, icon libraries are limited.
If our app needs an icon for <code>golden-retriever</code>s or <code>barack-obama</code>,
we’re just out of luck.</p> <p>But what if icon libraries were more like Borges’ <!>:
an endless collection of everything we could possibly need?</p> <p>Generative models like <!> hold this exact promise: once they have seen enough examples of some kind of data,
they learn to simulate the process by which that data is generated,
and can then generate more, endlessly.</p> <p>So as an experiment, we took a Stable Diffusion model
and fine-tuned it on the Heroicons library.</p> <p>Here’s an example icon it generated for <code>barack-obama</code>:</p> <p><!></p> <modal-img-caption>Yes, we can fine-tune our own models.</modal-img-caption> <p>You can play around with the fine-tuned model yourself <!>.</p> <p>We were able to create a number of delightful new black-and-white line icons, all in a rough imitation of the Heroicons style:</p> <p><!></p> <modal-img-caption>Top row: <code>apple-computer</code>, <code>bmw</code>, <code>castle</code>.<br/> Middle row: <code>ebike</code>, <code>future-of-ai</code>, <code>golden-retriever</code>.<br/> Bottom row: <code>jail</code>, <code>piano</code>, <code>snowflake</code><br/></modal-img-caption> <p>The entire application, from downloading a pretrained model through fine-tuning and up to serving an interactive web UI,
is run on Modal.</p> <p>Modal is a scalable, serverless cloud computing platform that abstracts away the complexities of infrastructure management.</p> <p>With Modal, we can easily spin up powerful GPU instances, run the fine-tuning training script,
and deploy the fine-tuned model as an interactive web app, all with just a few lines of code.</p> <p>In this blog post, we’ll show you how.</p> <h2 id="table-of-contents">Table of contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="choosing-a-fine-tuning-technique">Choosing a fine-tuning technique</h2> <p>Your first choice when fine-tuning a model is how you’re going to do it.</p> <p>In <strong>full fine-tuning</strong>, the entire model is updated during training.
This is the most computationally expensive method. It is particularly costly
in terms of memory, because information that can be several times the size of the model
needs to be kept in memory.</p> <p>In <strong>sequential adapter fine-tuning</strong>, new layers are appended to the model and trained.
This requires much less memory than full fine-tuning, because the number of new layers
is usually small — even just one.
However, it is unable to adjust the earliest layers of the model,
where critical aspects of the representation are formed,
and it increases the time required for inference.</p> <p>In <strong>parallel adapter fine-tuning</strong>, new layers are inserted
“alongside” the existing layers of the model,
and their outputs superimposed on the outputs of the existing layers.
This approach takes excellent advantage of the parallel processing capabilities of GPUs
and the natural parallelism of linear algebra,
and it has become especially popular in the last few years,
in the form of techniques like LoRA (Low Rank Adaptation).</p> <p>HuggingFace has pretty comprehensive documentation on all these techniques <!>.</p> <p>For our use-case, we found that full fine-tuning worked best.
But parallel adapter fine-tuning methods, like LoRA, can also work well,
especially if you have a small dataset and want to fine-tune quickly.</p> <h2 id="setting-up-accounts">Setting up accounts</h2> <p>If you’re following along or using this blog post as a template for your own fine-tuning experiments,
make sure you have the following set up before continuing:</p> <ul><li>A HuggingFace account (sign up <!> if you don’t have one).</li> <li>A Modal account (sign up <!> if you don’t have one).</li></ul> <h2 id="preparing-the-dataset">Preparing the Dataset</h2> <p>The first step in fine-tuning Stable Diffusion for style is to prepare the dataset.</p> <p>Most blog posts skip over this part, or give only a cursory overview.
This gives the false impression that dataset preparation is trivial
and that models, optimization algorithms, and infrastructure are the most important.</p> <p>We found that handling the data was actually the most important and most difficult part of fine-tuning
— and just about all machine learning practitioners will tell you the same.</p> <p>To use the Heroicons dataset, which consists of around 300 SVG icons, for fine-tuning, we need to:</p> <ol><li><p>Download the Heroicons from the <!></p></li> <li><p>Convert the SVGs to PNGs and add white backgrounds to the images</p> <p>Image models are trained on rasterized graphics, so we need to convert the icons.</p></li> <li><p>Add white backgrounds to the PNGs</p> <p>We also need to add white backgrounds to the PNGs.
This may seem trivial, but it is critically important - many models are incapable of outputting with transparency.</p></li> <li><p>Generate captions for each image and create a <code>metadata.csv</code> file</p> <p>Since the Heroicon filenames match the concept they represent, we can parse them into captions.
We also add a prefix to each caption: <code>“an icon of a &lt;object&gt;.”</code></p> <p>We then create a <code>metadata.csv</code> file, where each row is an image file name with the associated caption.
The <code>metadata.csv</code> file should be placed in the same directory as all the training images
and contain a header row with the string <code>file_name,text</code></p> <!> <!></li> <li><p>Upload the dataset to the HuggingFace Hub</p> <!></li></ol> <p>You can see the post-processed dataset <!>.</p> <h2 id="training-on-modal">Training on Modal</h2> <h3 id="setting-up-diffusers-dependencies-on-modal">Setting up Diffusers dependencies on Modal</h3> <p>To fine-tune Stable Diffusion for style, we used the <!> by HuggingFace.
Diffusers provides a set of easy-to-use scripts for fine-tuning these models on custom datasets.</p> <p>You can see an up-to-date list of all their scripts in their <!>.</p> <p>For this fine-tuning task, we will be using the <!> script. This script does full fine-tuning.</p> <p>When you run your code on Modal, it executes in <!> in the cloud, not on your machine.
This means that you need to set up any dependencies in that environment.</p> <p>Modal provides a Pythonic API to define containerized environments
— the same power and flexibility as a Dockerfile, but without all the tears.</p> <!> <h3 id="setting-up-volume-for-cloud-storage-of-weights">Setting up <code>Volume</code> for cloud storage of weights</h3> <p>Modal provides network file systems, <!>,
for writing information persistently from those cloud containers.</p> <p>We use one to store the weights after we’re done training.
We then read the weights from it when it’s time to run inference and generate new icons.</p> <!> <h3 id="setting-up-hyperparameter-configs">Setting up hyperparameter configs</h3> <p>We fine-tuned off the StableDiffusion v1.5 model, but you can easily also fine-tune off of other Stable Diffusion
versions by changing the config below. We used <code>4000</code> training steps, a learning rate of <code>1e-5</code>, and a batch size of <code>1</code>.</p> <p>We set up one <code>dataclass</code>, <code>TrainConfig</code>, to hold all the training hyperparameters,
and another, <code>AppConfig</code>, to store all the inference hyperparameters.</p> <!> <h3 id="running-fine-tuning">Running fine-tuning</h3> <p>Now, finally, we’re ready to fine-tune.</p> <p>We first need to decorate the <code>train</code> function with <code>@app.function</code>,
which tells Modal that the function should be launched in a cloud container on Modal.</p> <p>Functions on Modal combine code and the infrastructure required to run it.
So the <code>@app.function</code> decorator takes several arguments that lets us specify
the type of GPU we want to use for training,
the Modal Volumes we want to mount to the container,
and any secret values (like the HuggingFace API key) that we want to pass to the container.</p> <p>This training function does a bunch of preparatory things,
but the core of it is the <code>notebook_launcher</code> call that launches the actual Diffusers training script as a subprocess.
In particular, we are launching the script using the <!> CLI command.
Accelerate is a Python library that makes it easy to leverage multiple GPUs for accelerated model training.</p> <p>The training script saves checkpoint files every 1000 steps.
To make sure that those checkpoints are persisted,
we need to set <code>_allow_background_volume_commits=True</code> in the <code>@app.function</code> decorator.</p> <!> <p>With that all in place, we can kick off a training run on Modal from anywhere
with a simple command:</p> <!> <h2 id="serving-the-fine-tuned-model">Serving the fine-tuned model</h2> <p>Once <code>fine-tune-stable-diffusion.py</code> has finished its training run, the fine-tuned model will be saved in the Volume.
We can then mount the volume to a new Modal <code>inference</code> function,
which we can then invoke from any Python code running anywhere.</p> <!> <h2 id="wrapping-inference-in-a-gradio-ui">Wrapping inference in a Gradio UI</h2> <p>Finally, we set up a <!> UI that will allow us to interact with our icon generator.
That lets us build this entire app, from data prep to browser app, in Python.</p> <p>Our Gradio app calls the <code>Model.inference</code> function we defined above.</p> <p>We can do this from any Python code we want,
but we choose to also make this part of our Modal app,
because <!>.</p> <!> <p>Deployment on Modal is as simple as running one command:</p> <!> <h2 id="parting-thoughts">Parting thoughts</h2> <p>How does our fine-tuned model do as an infinite icon library?</p> <p><!></p> <modal-img-caption>Top row: <code>camera</code>, <code>chemistry</code>, <code>fountain-pen</code>.<br/> Middle row: <code>german-shepherd</code>, <code>international-monetary-system</code>, <code>library</code>.<br/> Bottom row: <code>skiing</code>, <code>snowman</code>, <code>water-bottle</code><br/></modal-img-caption> <p>It’s certainly not perfect:</p> <ul><li>The model sometimes outputs multiple objects when prompted for one (<code>water-bottle</code>, <code>fountain-pen</code>).</li> <li>Some icons have visual artifacts or strange shapes (<code>snowman</code>).</li> <li>The outputs aren’t as simple as the real Heroicons (<code>camera</code>, <code>german-shepherd</code>).</li></ul> <p>Fine-tuning can be sensitive to the hyperparameters used,
including dataset size, number of training steps, learning rates, and resolution.</p> <p>Because we defined our training to run on Modal, we can immediately scale it up into a massive grid search
— running tens or hundreds or thousands of copies of the training script at once,
each with different hyperparameters.</p> <p>And it only takes a few lines of code to set up a grid search.
It might look like this:</p> <!> <p>Evaluation of which hyperparameter combinations are best will probably have to be done manually,
given how subjective style can be.</p> <p>But that’s what makes machine learning <s>hard</s> fun!</p>`,3);function w(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ae(),d=te(a),f=e(d);u(o(e(f)),{href:`/blog/fine-tuning-flux-style-lora`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(f),n(d);var p=o(d,2),m=o(e(p));u(m,{href:`https://lucide.dev/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Lucide`))},$$slots:{default:!0}});var h=o(m,2);u(h,{href:`https://heroicons.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Heroicons`))},$$slots:{default:!0}}),u(o(h,2),{href:`https://tailwindcss.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tailwind CSS`))},$$slots:{default:!0}}),s(),n(p);var g=o(p,2);c(e(g),{src:`https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-original-heroicons.png`,alt:`Some example original Heroicons`}),n(g);var _=o(o(g,2),4);u(o(e(_)),{href:`https://en.wikipedia.org/wiki/The_Library_of_Babel`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),s(),n(_);var v=o(_,2);u(o(e(v)),{href:`https://huggingface.co/models?pipeline_tag=stable-diffusion`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Stable Diffusion`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,6);c(e(y),{src:`https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-barack-obama.png`,alt:`An icon of Barack Obama's head`}),n(y);var b=o(o(y,2),2);u(o(e(b)),{href:`https://modal-labs--heroicons.modal.run/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(b);var x=o(b,4);c(e(x),{src:`https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-generated-heroicons.png`,alt:`Some example custom Heroicons`}),n(x);var S=o(o(x,2),12),C=e(S);u(e(C),{href:`#choosing-a-fine-tuning-technique`,children:(e,t)=>{s(),i(e,r(`Choosing a fine-tuning technique`))},$$slots:{default:!0}}),n(C);var w=o(C,2);u(e(w),{href:`#setting-up-accounts`,children:(e,t)=>{s(),i(e,r(`Setting up accounts`))},$$slots:{default:!0}}),n(w);var T=o(w,2);u(e(T),{href:`#preparing-the-dataset`,children:(e,t)=>{s(),i(e,r(`Preparing the dataset`))},$$slots:{default:!0}}),n(T);var E=o(T,2);u(e(E),{href:`#training-on-modal`,children:(e,t)=>{s(),i(e,r(`Training on Modal`))},$$slots:{default:!0}}),n(E);var D=o(E,2);u(e(D),{href:`#serving-the-fine-tuned-model`,children:(e,t)=>{s(),i(e,r(`Serving the fine-tuned model`))},$$slots:{default:!0}}),n(D);var O=o(D,2);u(e(O),{href:`#wrapping-inference-in-a-gradio-ui`,children:(e,t)=>{s(),i(e,r(`Wrapping inference in a Gradio UI`))},$$slots:{default:!0}}),n(O);var k=o(O,2);u(e(k),{href:`#parting-thoughts`,children:(e,t)=>{s(),i(e,r(`Parting thoughts`))},$$slots:{default:!0}}),n(k),n(S);var A=o(S,12);u(o(e(A)),{href:`https://huggingface.co/docs/diffusers/main/en/training/overview`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(A);var j=o(A,8),M=e(j);u(o(e(M)),{href:`https://huggingface.co/join`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,2);u(o(e(N)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(N),n(j);var P=o(j,12),F=e(P),I=e(F);u(o(e(I)),{href:`https://github.com/tailwindlabs/heroicons`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GitHub repo`))},$$slots:{default:!0}}),n(I),n(F);var L=o(F,6),oe=o(e(L),6);l(oe,{code:`%23%20tree%20heroicons_training_dir%0Aheroicons_training_dir%2F%0A%20%E2%94%9C%E2%94%80%E2%94%80%20arrow.png%0A%20%E2%94%9C%E2%94%80%E2%94%80%20bike.png%0A%20%E2%94%9C%E2%94%80%E2%94%80%20cruiseShip.png%0A%20%E2%94%94%E2%94%80%E2%94%80%20metadata.csv`,lang:`bash`}),l(o(oe,2),{code:`%23%20metadata.csv%0A%0Afile_name%2Ctext%0Aarrow.png%2C%22an%20icon%20of%20a%20arrow%22%0Abike.png%2C%22an%20icon%20of%20a%20bike%22%0AcruiseShip.png%2C%22an%20icon%20of%20a%20cruise%20ship%22`,lang:`text`}),n(L);var R=o(L,2);l(o(e(R),2),{code:`import%20os%0Afrom%20datasets%20import%20load_dataset%0Aimport%20huggingface_hub%0A%0A%23%20login%20to%20huggingface%0Ahf_key%20%3D%20os.environ%5B%22HUGGINGFACE_TOKEN%22%5D%0Ahuggingface_hub.login(hf_key)%0A%0Adataset%20%3D%20load_dataset(%22imagefolder%22%2C%20data_dir%3D%22%2Flg_white_bg_heroicon_png_img%22%2C%20split%3D%22train%22)%0A%0Adataset.push_to_hub(%22yirenlu%2Fheroicons%22%2C%20private%3DTrue)`,lang:`python`}),n(R),n(P);var z=o(P,2);u(o(e(z)),{href:`https://huggingface.co/datasets/yirenlu/heroicons`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,6);u(o(e(B)),{href:`https://github.com/huggingface/diffusers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Diffusers library`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);u(o(e(V)),{href:`https://github.com/huggingface/diffusers/tree/main/examples`,rel:`nofollow`,children:(e,t)=>{var n=re();s(),i(e,n)},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);u(o(e(H)),{href:`https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);u(o(e(U)),{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`a containerized environment`))},$$slots:{default:!0}}),s(),n(U);var W=o(U,4);l(W,{code:`%23%20fine-tune-stable-diffusion.py%0Aimport%20os%0Aimport%20sys%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20pathlib%20import%20Path%0A%0Afrom%20fastapi%20import%20FastAPI%0Afrom%20modal%20import%20Image%2C%20App%2C%20Volume%2C%20gpu%2C%20Secret%0A%0AGIT_SHA%20%3D%20%22abd922bd0c43a504e47eca2ed354c3634bd00834%22%20%20%23%20specify%20the%20commit%20to%20fetch%0A%0Aimage%20%3D%20(%0A%20%20%20%20Image.debian_slim(python_version%3D%223.10%22)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.27.2%22%2C%0A%20%20%20%20%20%20%20%20%22datasets~%3D2.19.1%22%2C%0A%20%20%20%20%20%20%20%20%22ftfy~%3D6.1.1%22%2C%0A%20%20%20%20%20%20%20%20%22gradio~%3D3.50.2%22%2C%0A%20%20%20%20%20%20%20%20%22smart_open~%3D6.4.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers~%3D4.38.1%22%2C%0A%20%20%20%20%20%20%20%20%22torch~%3D2.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision~%3D0.16%22%2C%0A%20%20%20%20%20%20%20%20%22triton~%3D2.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22peft%3D%3D0.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22wandb%3D%3D0.16.3%22%2C%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20%23%20Perform%20a%20shallow%20fetch%20of%20just%20the%20target%20%60diffusers%60%20commit%2C%20checking%20out%0A%20%20%20%20%23%20the%20commit%20in%20the%20container's%20current%20working%20directory%2C%20%2Froot.%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20init%20.%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20remote%20add%20origin%20https%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers%22%2C%0A%20%20%20%20%20%20%20%20f%22cd%20%2Froot%20%26%26%20git%20fetch%20--depth%3D1%20origin%20%7BGIT_SHA%7D%20%26%26%20git%20checkout%20%7BGIT_SHA%7D%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20pip%20install%20-e%20.%22%2C%0A%20%20%20%20)%0A)`,lang:`python`});var G=o(W,4);u(o(e(G)),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),s(),n(G);var K=o(G,4);l(K,{code:`%23%20fine-tune-stable-diffusion.py%0A%0Aweb_app%20%3D%20FastAPI()%0Aapp%20%3D%20App(name%3D%22example-diffusers-app%22)%0A%0AMODEL_DIR%20%3D%20Path(%22%2Fmodel%22)%0Amodel_volume%20%3D%20Volume.from_name(%22diffusers-model-volume%22%2C%20create_if_missing%3DTrue)%0A%0AVOLUME_CONFIG%20%3D%20%7B%0A%20%20%20%20%22%2Fmodel%22%3A%20model_volume%2C%0A%7D`,lang:`python`});var q=o(K,8);l(q,{code:`%23%20fine-tune-stable-diffusion.py%0A%0A%40dataclass%0Aclass%20TrainConfig%3A%0A%20%20%20%20%22%22%22Configuration%20for%20the%20finetuning%20training.%22%22%22%0A%0A%20%20%20%20%23%20identifier%20for%20pretrained%20model%20on%20Hugging%20Face%0A%20%20%20%20model_name%3A%20str%20%3D%20%22runwayml%2Fstable-diffusion-v1-5%22%0A%0A%20%20%20%20resume_from_checkpoint%3A%20str%20%3D%20%22latest%22%0A%20%20%20%20%23%20HuggingFace%20Hub%20dataset%0A%20%20%20%20dataset_name%20%3D%20%22yirenlu%2Fheroicons%22%0A%0A%20%20%20%20%23%20Hyperparameters%2Fconstants%20from%20some%20of%20the%20Diffusers%20examples%0A%20%20%20%20%23%20You%20should%20modify%20these%20to%20match%20the%20hyperparameters%20of%20the%20script%20we%20are%20using.%0A%20%20%20%20mixed_precision%3A%20str%20%3D%20%22fp16%22%20%20%23%20set%20the%20precision%20of%20floats%20during%20training%2C%20fp16%20or%20less%20needs%20to%20be%20mixed%20with%20fp32%20under%20the%20hood%0A%20%20%20%20resolution%3A%20int%20%3D%20128%0A%20%20%20%20max_train_steps%3A%20int%20%3D%20(%0A%20%20%20%20%20%20%20%204000%20%20%23%20number%20of%20times%20to%20apply%20a%20gradient%20update%20during%20training%0A%20%20%20%20)%0A%20%20%20%20checkpointing_steps%3A%20int%20%3D%20(%0A%20%20%20%20%20%20%20%201000%20%20%23%20number%20of%20steps%20between%20model%20checkpoints%2C%20for%20resuming%20training%0A%20%20%20%20)%0A%20%20%20%20train_batch_size%3A%20int%20%3D%20(%0A%20%20%20%20%20%20%20%201%20%20%23%20how%20many%20images%20to%20process%20at%20once%2C%20limited%20by%20GPU%20VRAM%0A%20%20%20%20)%0A%20%20%20%20gradient_accumulation_steps%3A%20int%20%3D%201%20%20%23%20how%20many%20batches%20to%20process%20before%20updating%20the%20model%2C%20stabilizes%20training%20with%20large%20batch%20sizes%0A%20%20%20%20learning_rate%3A%20float%20%3D%201e-05%20%20%23%20scaling%20factor%20on%20gradient%20updates%2C%20make%20this%20proportional%20to%20the%20batch%20size%20*%20accumulation%20steps%0A%20%20%20%20lr_scheduler%3A%20str%20%3D%20(%0A%20%20%20%20%20%20%20%20%22constant%22%20%20%23%20dynamic%20schedule%20for%20changes%20to%20the%20base%20learning_rate%0A%20%20%20%20)%0A%20%20%20%20max_grad_norm%3A%20int%20%3D%201%20%20%23%20value%20above%20which%20to%20clip%20gradients%2C%20stabilizes%20training%0A%20%20%20%20caption_column%3A%20str%20%3D%20%22text%22%20%20%23%20name%20of%20the%20column%20in%20the%20dataset%20that%20contains%20the%20captions%20of%20the%20images%0A%20%20%20%20validation_prompt%3A%20str%20%3D%20%22an%20icon%20of%20a%20dragon%20creature%22%0A%0A%0A%40dataclass%0Aclass%20AppConfig%3A%0A%20%20%20%20%22%22%22Configuration%20information%20for%20inference.%22%22%22%0A%0A%20%20%20%20num_inference_steps%3A%20int%20%3D%2050%20%23%20How%20many%20steps%20to%20run%20the%20model%20for%20inference%2C%20the%20more%20the%20higher%20quality%20generally%0A%20%20%20%20guidance_scale%3A%20float%20%3D%2020%20%23%20How%20much%20the%20image%20should%20adhere%20to%20the%20text%20prompt`,lang:`python`});var J=o(q,10);u(o(e(J),3),{href:`https://huggingface.co/docs/accelerate/en/index`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Accelerate`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,4);l(Y,{code:`%23%20fine-tune-stable-diffusion.py%0A%0A%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3Dgpu.A100(%0A%20%20%20%20%20%20%20%20size%3D%2280GB%22%0A%20%20%20%20)%2C%20%20%23%20finetuning%20is%20VRAM%20hungry%2C%20so%20this%20should%20be%20an%20A100%20or%20H100%0A%20%20%20%20volumes%3DVOLUME_CONFIG%2C%0A%20%20%20%20timeout%3D3600%20*%202%2C%20%20%23%20multiple%20hours%0A%20%20%20%20secrets%3D%5BSecret.from_name(%22huggingface-secret%22)%5D%2C%0A%20%20%20%20_allow_background_volume_commits%3DTrue%0A)%0Adef%20train()%3A%0A%20%20%20%20import%20huggingface_hub%0A%20%20%20%20from%20accelerate%20import%20notebook_launcher%0A%20%20%20%20from%20accelerate.utils%20import%20write_basic_config%0A%0A%20%20%20%20%23%20change%20this%20line%20to%20import%20the%20training%20script%20we%20want%20to%20use%0A%20%20%20%20from%20examples.text_to_image.train_text_to_image%20import%20main%0A%20%20%20%20from%20transformers%20import%20CLIPTokenizer%0A%0A%20%20%20%20%23%20set%20up%20TrainConfig%0A%20%20%20%20config%20%3D%20TrainConfig()%0A%0A%20%20%20%20%23%20set%20up%20runner-local%20image%20and%20shared%20model%20weight%20directories%0A%20%20%20%20os.makedirs(MODEL_DIR%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20%23%20set%20up%20hugging%20face%20accelerate%20library%20for%20fast%20training%0A%20%20%20%20write_basic_config(mixed_precision%3D%22fp16%22)%0A%0A%20%20%20%20%23%20authenticate%20to%20hugging%20face%20so%20we%20can%20download%20the%20model%20weights%0A%20%20%20%20hf_key%20%3D%20os.environ%5B%22HF_TOKEN%22%5D%0A%20%20%20%20huggingface_hub.login(hf_key)%0A%0A%20%20%20%20%23%20check%20whether%20we%20can%20access%20the%20model%20repo%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20CLIPTokenizer.from_pretrained(config.model_name%2C%20subfolder%3D%22tokenizer%22)%0A%20%20%20%20except%20OSError%20as%20e%3A%20%20%23%20handle%20error%20raised%20when%20license%20is%20not%20accepted%0A%20%20%20%20%20%20%20%20license_error_msg%20%3D%20f%22Unable%20to%20load%20tokenizer.%20Access%20to%20this%20model%20requires%20acceptance%20of%20the%20license%20on%20Hugging%20Face%20here%3A%20https%3A%2F%2Fhuggingface.co%2F%7Bconfig.model_name%7D.%22%0A%20%20%20%20%20%20%20%20raise%20Exception(license_error_msg)%20from%20e%0A%0A%20%20%20%20def%20launch_training()%3A%0A%20%20%20%20%20%20%20%20sys.argv%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22examples%2Ftext_to_image%2Ftrain_text_to_image.py%22%2C%20%20%23%20potentially%20modify%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--pretrained_model_name_or_path%3D%7Bconfig.model_name%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--dataset_name%3D%7Bconfig.dataset_name%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--use_ema%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--output_dir%3D%7BMODEL_DIR%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--resolution%3D%7Bconfig.resolution%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--center_crop%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--random_flip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--gradient_accumulation_steps%3D%7Bconfig.gradient_accumulation_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--gradient_checkpointing%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--train_batch_size%3D%7Bconfig.train_batch_size%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--learning_rate%3D%7Bconfig.learning_rate%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--lr_scheduler%3D%7Bconfig.lr_scheduler%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--max_train_steps%3D%7Bconfig.max_train_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--lr_warmup_steps%3D%7Bconfig.lr_warmup_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--checkpointing_steps%3D%7Bconfig.checkpointing_steps%7D%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20main()%0A%0A%20%20%20%20%23%20run%20training%20--%20see%20huggingface%20accelerate%20docs%20for%20details%0A%20%20%20%20print(%22launching%20fine-tuning%20training%20script%22)%0A%0A%20%20%20%20notebook_launcher(launch_training%2C%20num_processes%3D1)%0A%0A%0A%40app.local_entrypoint()%0Adef%20run()%3A%0A%20%20%20%20train.remote()`,lang:`python`});var X=o(Y,4);l(X,{code:`modal%20run%20fine-tune-stable-diffusion.py`,lang:`bash`});var se=o(X,6);l(se,{code:`%23%20fine-tune-stable-diffusion.py%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22A10G%22%2C%20%23%20inference%20requires%20less%20VRAM%20than%20training%2C%20so%20we%20can%20use%20a%20cheaper%20GPU%0A%20%20%20%20volumes%3DVOLUME_CONFIG%2C%20%23%20mount%20the%20location%20where%20your%20model%20weights%20were%20saved%20to%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20diffusers%20import%20StableDiffusionPipeline%0A%0A%20%20%20%20%20%20%20%20%23%20Reload%20the%20modal.Volume%20to%20ensure%20the%20latest%20state%20is%20accessible.%0A%20%20%20%20%20%20%20%20app.model_volume.reload()%0A%0A%20%20%20%20%20%20%20%20%23%20set%20up%20a%20hugging%20face%20inference%20pipeline%20using%20our%20model%0A%20%20%20%20%20%20%20%20%23%20potentially%20use%20different%20pipeline%0A%20%20%20%20%20%20%20%20pipe%20%3D%20StableDiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.float16%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%20%20%20%20pipe.enable_xformers_memory_efficient_attention()%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20pipe%0A%0A%20%20%20%20%40method()%0A%20%20%20%20def%20inference(self%2C%20text%2C%20config)%3A%0A%0A%20%20%20%20%20%20%20%20image%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dconfig.num_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dconfig.guidance_scale%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20return%20image`,lang:`python`});var Z=o(se,4);u(o(e(Z)),{href:`https://www.gradio.app/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Gradio`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,4);u(o(e(Q)),{href:`/docs/guide/webhooks`,children:(e,t)=>{s(),i(e,r(`Modal makes it easy to host Python web apps`))},$$slots:{default:!0}}),s(),n(Q);var ce=o(Q,2);l(ce,{code:`%23%20fine-tune-stable-diffusion.py%0A%0A%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20max_containers%3D3%2C%0A)%0A%40asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20%23%20Call%20to%20the%20GPU%20inference%20function%20on%20Modal.%0A%20%20%20%20def%20go(text)%3A%0A%20%20%20%20%20%20%20%20return%20Model().inference.remote(text%2C%20config)%0A%0A%20%20%20%20%23%20set%20up%20AppConfig%0A%20%20%20%20config%20%3D%20AppConfig()%0A%0A%20%20%20%20prefix%20%3D%20%22an%20icon%20of%22%0A%0A%20%20%20%20example_prompts%20%3D%20%5B%0A%20%20%20%20%20%20%20%20f%22%7Bprefix%7D%20a%20movie%20ticket%22%2C%0A%20%20%20%20%20%20%20%20f%22%7Bprefix%7D%20campfire%22%2C%0A%20%20%20%20%20%20%20%20f%22%7Bprefix%7D%20a%20castle%22%2C%0A%20%20%20%20%20%20%20%20f%22%7Bprefix%7D%20a%20German%20Shepherd%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20description%20%3D%20f%22%22%22Describe%20a%20concept%20that%20you%20would%20like%20drawn%20as%20a%20%5BHeroicon%5D(https%3A%2F%2Fheroicons.com%2F).%20Try%20the%20examples%20below%20for%20inspiration.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20%23%20add%20a%20gradio%20UI%20around%20inference%0A%20%20%20%20interface%20%3D%20gr.Interface(%0A%20%20%20%20%20%20%20%20fn%3Dgo%2C%0A%20%20%20%20%20%20%20%20inputs%3D%22text%22%2C%0A%20%20%20%20%20%20%20%20outputs%3Dgr.Image(shape%3D(512%2C%20512))%2C%0A%20%20%20%20%20%20%20%20title%3D%22Generate%20custom%20heroicons%22%2C%0A%20%20%20%20%20%20%20%20examples%3Dexample_prompts%2C%0A%20%20%20%20%20%20%20%20description%3Ddescription%2C%0A%20%20%20%20%20%20%20%20css%3D%22%2Fassets%2Findex.css%22%2C%0A%20%20%20%20%20%20%20%20allow_flagging%3D%22never%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20mount%20for%20execution%20on%20Modal%0A%20%20%20%20return%20mount_gradio_app(%0A%20%20%20%20%20%20%20%20app%3Dweb_app%2C%0A%20%20%20%20%20%20%20%20blocks%3Dinterface%2C%0A%20%20%20%20%20%20%20%20path%3D%22%2F%22%2C%0A%20%20%20%20)`,lang:`python`});var le=o(ce,4);l(le,{code:`modal%20deploy%20fine-tune-stable-diffusion.py`,lang:`bash`});var $=o(le,6);c(e($),{src:`https://modal-cdn.com/cdnbot/fine-tuning-stable-diffusion-generated-heroicons-more.png`,alt:`More generated Heroicons`}),n($),l(o(o($,2),12),{code:`%0ARESOLUTIONS%20%3D%20%5B128%2C%20512%5D%0ALEARNING_RATES%20%3D%20%5B1e-5%2C%201e-4%2C%201e-3%2C%201e-2%2C%201e-1%5D%0ALEARNING_RATE_SCHEDULERS%20%3D%20%5B%22constant%22%2C%20%22cosine%22%5D%0A%0A%0A%40app.local_entrypoint()%0Adef%20run()%3A%0A%20%20%20%20from%20uuid%20import%20uuid4%0A%0A%20%20%20%20configs%20%3D%20%5B%5D%0A%20%20%20%20for%20resolution%20in%20RESOLUTIONS%3A%0A%20%20%20%20%20%20%20%20for%20learning_rate%20in%20LEARNING_RATES%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20learning_rate_scheduler%20in%20LEARNING_RATE_SCHEDULERS%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20train.spawn(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22resolution%22%3A%20resolution%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22learning_rate%22%3A%20learning_rate%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22learning_rate_scheduler%22%3A%20learning_rate_scheduler%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22output_dir%22%3A%20uuid4()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)`,lang:`python`}),s(4),i(t,a)},$$slots:{default:!0}}))}export{w as default,f as metadata};
//# sourceMappingURL=DOjvYUkw.js.map
