(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9b4b15b6-3770-4645-9921-e3048ef6ac24`,e._sentryDebugIdIdentifier=`sentry-dbid-9b4b15b6-3770-4645-9921-e3048ef6ac24`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g=`/_app/immutable/assets/ikea-instructions-for-building-a-gpu-rig-for-deep-learning.DcGj0diD.png`,_={toc:[{depth:1,value:`LoRAs Galore: Create a LoRA Playground with Modal, Gradio, and S3`,id:`loras-galore-create-a-lora-playground-with-modal-gradio-and-s3`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Acquiring LoRA weights`,id:`acquiring-lora-weights`},{depth:2,value:`Inference with LoRAs`,id:`inference-with-loras`},{depth:2,value:`Try it locally!`,id:`try-it-locally`},{depth:2,value:`LoRA Exploradora: A hosted Gradio interface`,id:`lora-exploradora-a-hosted-gradio-interface`}]}],rawContent:`# LoRAs Galore: Create a LoRA Playground with Modal, Gradio, and S3

This example shows how to mount an S3 bucket in a Modal app using [\`CloudBucketMount\`](https://modal.com/docs/reference/modal.CloudBucketMount).
We will download a bunch of LoRA adapters from the [HuggingFace Hub](https://huggingface.co/models) into our S3 bucket
then read from that bucket, on the fly, when doing inference.

By default, we use the [IKEA instructions LoRA](https://huggingface.co/ostris/ikea-instructions-lora-sdxl) as an example,
which produces the following image when prompted to generate "IKEA instructions for building a GPU rig for deep learning":

![IKEA instructions for building a GPU rig for deep learning](./ikea-instructions-for-building-a-gpu-rig-for-deep-learning.png)

By the end of this example, we've deployed a "playground" app where anyone with a browser can try
out these custom models. That's the power of Modal: custom, autoscaling AI applications, deployed in seconds.
You can try out our deployment [here](https://modal-labs-examples--example-cloud-bucket-mount-loras-ui.modal.run).

## Basic setup

\`\`\`python
import io
import os
from pathlib import Path
from typing import Optional

import modal

\`\`\`

You will need to have an S3 bucket and AWS credentials to run this example. Refer to the documentation
for the detailed [IAM permissions](https://modal.com/docs/guide/cloud-bucket-mounts#iam-permissions) those credentials will need.

After you are done creating a bucket and configuring IAM settings,
you now need to create a [Modal Secret](https://modal.com/docs/guide/secrets). Navigate to the "Secrets" tab and
click on the AWS card, then fill in the fields with the AWS key and secret created
previously. Name the Secret \`s3-bucket-secret\`.

\`\`\`python
bucket_secret = modal.Secret.from_name(
    "s3-bucket-secret",
    required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
)

MOUNT_PATH: Path = Path("/mnt/bucket")
LORAS_PATH: Path = MOUNT_PATH / "loras/v5"

BASE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
CACHE_DIR = "/hf-cache"

\`\`\`

Modal runs serverless functions inside containers.
The environments those functions run in are defined by
the container \`Image\`. The line below constructs an image
with the dependencies we need -- no need to install them locally.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "huggingface_hub==0.21.4",
        "transformers==4.38.2",
        "diffusers==0.26.3",
        "peft==0.9.0",
        "accelerate==0.27.2",
    )
    .env({"HF_HUB_CACHE": CACHE_DIR})
)

with image.imports():
    # we import these dependencies only inside the container
    import diffusers
    import huggingface_hub
    import torch

\`\`\`

We attach the S3 bucket to all the Modal functions in this app by mounting it on the filesystem they see,
passing a \`CloudBucketMount\` to the \`volumes\` dictionary argument. We can read and write to this mounted bucket
(almost) as if it were a local directory.

\`\`\`python
app = modal.App(
    "example-cloud-bucket-mount-loras",
    image=image,
    volumes={
        MOUNT_PATH: modal.CloudBucketMount(
            "modal-s3mount-test-bucket",
            secret=bucket_secret,
        )
    },
)


\`\`\`

For the base model, we'll use a modal.Volume to store the Hugging Face cache.

\`\`\`python
cache_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.function(image=image, volumes={CACHE_DIR: cache_volume})
def download_model():
    loc = huggingface_hub.snapshot_download(repo_id=BASE_MODEL)
    print(f"Saved model to {loc}")


\`\`\`

## Acquiring LoRA weights

\`search_loras()\` will use the Hub API to search for LoRAs. We limit LoRAs
to a maximum size to avoid downloading very large model weights.
We went with 800 MiB, but feel free to adapt to what works best for you.

\`\`\`python
@app.function(secrets=[bucket_secret])
def search_loras(limit: int, max_model_size: int = 1024 * 1024 * 1024):
    api = huggingface_hub.HfApi()

    model_ids: list[str] = []
    for model in api.list_models(
        tags=["lora", f"base_model:{BASE_MODEL}"],
        library="diffusers",
        sort="downloads",  # sort by most downloaded
    ):
        try:
            model_size = 0
            for file in api.list_files_info(model.id):
                model_size += file.size

        except huggingface_hub.utils.GatedRepoError:
            print(f"gated model ({model.id}); skipping")
            continue

        # Skip models that are larger than file limit.
        if model_size > max_model_size:
            print(f"model {model.id} is too large; skipping")
            continue

        model_ids.append(model.id)
        if len(model_ids) >= limit:
            return model_ids

    return model_ids


\`\`\`

We want to take the LoRA weights we found and move them from Hugging Face onto S3,
where they'll be accessible, at short latency and high throughput, for our Modal functions.
Downloading files in this mount will automatically upload files to S3.
To speed things up, we will run this function in parallel using Modal's
[\`map\`](https://modal.com/docs/reference/modal.Function#map).

\`\`\`python
@app.function()
def download_lora(repository_id: str) -> Optional[str]:
    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

    # CloudBucketMounts will report 0 bytes of available space leading to many
    # unnecessary warnings, so we patch the method that emits those warnings.
    from huggingface_hub import file_download

    file_download._check_disk_space = lambda x, y: False

    repository_path = LORAS_PATH / repository_id
    try:
        # skip models we've already downloaded
        if not repository_path.exists():
            huggingface_hub.snapshot_download(
                repository_id,
                local_dir=repository_path.as_posix().replace(".", "_"),
                allow_patterns=["*.safetensors"],
            )
        downloaded_lora = len(list(repository_path.rglob("*.safetensors"))) > 0
    except OSError:
        downloaded_lora = False
    except FileNotFoundError:
        downloaded_lora = False
    if downloaded_lora:
        return repository_id
    else:
        return None


\`\`\`

## Inference with LoRAs

We define a \`StableDiffusionLoRA\` class to organize our inference code.
We load Stable Diffusion XL 1.0 as a base model, then, when doing inference,
we load whichever LoRA the user specifies from the S3 bucket.
For more on the decorators we use on the methods below to speed up building and booting,
check out the [container lifecycle hooks guide](https://modal.com/docs/guide/lifecycle-functions).

\`\`\`python
@app.cls(
    gpu="a10g",  # A10G GPUs are great for inference
    volumes={CACHE_DIR: cache_volume},  # We cache the base model
)
class StableDiffusionLoRA:
    @modal.enter()  # when a new container starts, we load the base model into the GPU
    def load(self):
        self.pipe = diffusers.DiffusionPipeline.from_pretrained(
            BASE_MODEL, torch_dtype=torch.float16
        ).to("cuda")

    @modal.method()  # at inference time, we pull in the LoRA weights and pass the final model the prompt
    def run_inference_with_lora(
        self, lora_id: str, prompt: str, seed: int = 8888
    ) -> bytes:
        for file in (LORAS_PATH / lora_id).rglob("*.safetensors"):
            self.pipe.load_lora_weights(lora_id, weight_name=file.name)
            break

        lora_scale = 0.9
        image = self.pipe(
            prompt,
            num_inference_steps=10,
            cross_attention_kwargs={"scale": lora_scale},
            generator=torch.manual_seed(seed),
        ).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")

        return buffer.getvalue()


\`\`\`

## Try it locally!

To use our inference code from our local command line, we add a \`local_entrypoint\` to our \`app\`.
Run it using \`modal run cloud_bucket_mount_loras.py\`, and pass \`--help\`
to see the available options.

The inference code will run on our machines, but the results will be available on yours.

\`\`\`python
@app.local_entrypoint()
def main(
    limit: int = 100,
    example_lora: str = "ostris/ikea-instructions-lora-sdxl",
    prompt: str = "IKEA instructions for building a GPU rig for deep learning",
    seed: int = 8888,
):
    # Download LoRAs in parallel.
    lora_model_ids = [example_lora]
    lora_model_ids += search_loras.remote(limit)

    downloaded_loras = []
    for model in download_lora.map(lora_model_ids):
        if model:
            downloaded_loras.append(model)

    print(f"downloaded {len(downloaded_loras)} loras => {downloaded_loras}")

    # Run inference using one of the downloaded LoRAs.
    byte_stream = StableDiffusionLoRA().run_inference_with_lora.remote(
        example_lora, prompt, seed
    )
    dir = Path("/tmp/stable-diffusion-xl")
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)

    output_path = dir / f"{as_slug(prompt.lower())}.png"
    print(f"Saving it to {output_path}")
    with open(output_path, "wb") as f:
        f.write(byte_stream)


\`\`\`

## LoRA Exploradora: A hosted Gradio interface

Command line tools are cool, but we can do better!
With the Gradio library by Hugging Face, we can create a simple web interface
around our Python inference function, then use Modal to host it for anyone to try out.

To set up your own, run \`modal deploy cloud_bucket_mount_loras.py\` and navigate to the URL it prints out.
If you're playing with the code, use \`modal serve\` instead to see changes live.

\`\`\`python
web_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi[standard]==0.115.4",
    "gradio~=5.7.1",
    "pillow~=10.2.0",
)


@app.function(
    image=web_image,
    scaledown_window=60 * 20,
    # gradio requires sticky sessions
    # so we limit the number of concurrent containers to 1
    # and allow it to scale to 100 concurrent inputs
    max_containers=1,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    """A simple Gradio interface around our LoRA inference."""
    import io

    import gradio as gr
    from fastapi import FastAPI
    from gradio.routes import mount_gradio_app
    from PIL import Image

    # determine which loras are available
    lora_ids = [
        f"{lora_dir.parent.stem}/{lora_dir.stem}" for lora_dir in LORAS_PATH.glob("*/*")
    ]

    # pick one to be default, set a default prompt
    default_lora_id = (
        "ostris/ikea-instructions-lora-sdxl"
        if "ostris/ikea-instructions-lora-sdxl" in lora_ids
        else lora_ids[0]
    )
    default_prompt = (
        "IKEA instructions for building a GPU rig for deep learning"
        if default_lora_id == "ostris/ikea-instructions-lora-sdxl"
        else "text"
    )

    # the simple path to making an app on Gradio is an Interface: a UI wrapped around a function.
    def go(lora_id: str, prompt: str, seed: int) -> Image:
        return Image.open(
            io.BytesIO(
                StableDiffusionLoRA().run_inference_with_lora.remote(
                    lora_id, prompt, seed
                )
            ),
        )

    iface = gr.Interface(
        go,
        inputs=[  # the inputs to go/our inference function
            gr.Dropdown(choices=lora_ids, value=default_lora_id, label="👉 LoRA ID"),
            gr.Textbox(default_prompt, label="🎨 Prompt"),
            gr.Number(value=8888, label="🎲 Random Seed"),
        ],
        outputs=gr.Image(label="Generated Image"),
        # some extra bits to make it look nicer
        title="LoRAs Galore",
        description="# Try out some of the top custom SDXL models!"
        "\\n\\nPick a LoRA finetune of SDXL from the dropdown, then prompt it to generate an image."
        "\\n\\nCheck out [the code on GitHub](https://github.com/modal-labs/modal-examples/blob/main/10_integrations/cloud_bucket_mount_loras.py)"
        " if you want to create your own version or just see how it works."
        "\\n\\nPowered by [Modal](https://modal.com) 🚀",
        theme="soft",
        allow_flagging="never",
    )

    return mount_gradio_app(app=FastAPI(), blocks=iface, path="/")


def as_slug(name):
    """Converts a string, e.g. a prompt, into something we can use as a filename."""
    import re

    s = str(name).strip().replace(" ", "-")
    s = re.sub(r"(?u)[^-\\w.]", "", s)
    return s

\`\`\`
`,meta:{title:`LoRAs Galore: Create a LoRA Playground with Modal, Gradio, and S3`,description:`This example shows how to mount an S3 bucket in a Modal app using CloudBucketMount. We will download a bunch of LoRA adapters from the HuggingFace Hub into our S3 bucket then read from that bucket, on the fly, when doing inference.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<code>CloudBucketMount</code>`),S=t(`<code>map</code>`),C=t(`<!> <p>This example shows how to mount an S3 bucket in a Modal app using <!>.
We will download a bunch of LoRA adapters from the <!> into our S3 bucket
then read from that bucket, on the fly, when doing inference.</p> <p>By default, we use the <!> as an example,
which produces the following image when prompted to generate “IKEA instructions for building a GPU rig for deep learning”:</p> <p><!></p> <p>By the end of this example, we’ve deployed a “playground” app where anyone with a browser can try
out these custom models. That’s the power of Modal: custom, autoscaling AI applications, deployed in seconds.
You can try out our deployment <!>.</p> <!> <!> <p>You will need to have an S3 bucket and AWS credentials to run this example. Refer to the documentation
for the detailed <!> those credentials will need.</p> <p>After you are done creating a bucket and configuring IAM settings,
you now need to create a <!>. Navigate to the “Secrets” tab and
click on the AWS card, then fill in the fields with the AWS key and secret created
previously. Name the Secret <code>s3-bucket-secret</code>.</p> <!> <p>Modal runs serverless functions inside containers.
The environments those functions run in are defined by
the container <code>Image</code>. The line below constructs an image
with the dependencies we need — no need to install them locally.</p> <!> <p>We attach the S3 bucket to all the Modal functions in this app by mounting it on the filesystem they see,
passing a <code>CloudBucketMount</code> to the <code>volumes</code> dictionary argument. We can read and write to this mounted bucket
(almost) as if it were a local directory.</p> <!> <p>For the base model, we’ll use a modal.Volume to store the Hugging Face cache.</p> <!> <!> <p><code>search_loras()</code> will use the Hub API to search for LoRAs. We limit LoRAs
to a maximum size to avoid downloading very large model weights.
We went with 800 MiB, but feel free to adapt to what works best for you.</p> <!> <p>We want to take the LoRA weights we found and move them from Hugging Face onto S3,
where they’ll be accessible, at short latency and high throughput, for our Modal functions.
Downloading files in this mount will automatically upload files to S3.
To speed things up, we will run this function in parallel using Modal’s <!>.</p> <!> <!> <p>We define a <code>StableDiffusionLoRA</code> class to organize our inference code.
We load Stable Diffusion XL 1.0 as a base model, then, when doing inference,
we load whichever LoRA the user specifies from the S3 bucket.
For more on the decorators we use on the methods below to speed up building and booting,
check out the <!>.</p> <!> <!> <p>To use our inference code from our local command line, we add a <code>local_entrypoint</code> to our <code>app</code>.
Run it using <code>modal run cloud_bucket_mount_loras.py</code>, and pass <code>--help</code> to see the available options.</p> <p>The inference code will run on our machines, but the results will be available on yours.</p> <!> <!> <p>Command line tools are cool, but we can do better!
With the Gradio library by Hugging Face, we can create a simple web interface
around our Python inference function, then use Modal to host it for anyone to try out.</p> <p>To set up your own, run <code>modal deploy cloud_bucket_mount_loras.py</code> and navigate to the URL it prints out.
If you’re playing with the code, use <code>modal serve</code> instead to see changes live.</p> <!>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=C(),m=s(o);d(m,{id:`loras-galore-create-a-lora-playground-with-modal-gradio-and-s3`,children:(e,t)=>{l(),i(e,r(`LoRAs Galore: Create a LoRA Playground with Modal, Gradio, and S3`))},$$slots:{default:!0}});var _=c(m,2),v=c(e(_));h(v,{href:`https://modal.com/docs/reference/modal.CloudBucketMount`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),h(c(v,2),{href:`https://huggingface.co/models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HuggingFace Hub`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,2);h(c(e(y)),{href:`https://huggingface.co/ostris/ikea-instructions-lora-sdxl`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`IKEA instructions LoRA`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);f(e(b),{get src(){return g},alt:`IKEA instructions for building a GPU rig for deep learning`}),n(b);var w=c(b,2);h(c(e(w)),{href:`https://modal-labs-examples--example-cloud-bucket-mount-loras-ui.modal.run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);u(T,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var E=c(T,2);p(E,{code:`import%20io%0Aimport%20os%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A`,lang:`python`});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/cloud-bucket-mounts#iam-permissions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`IAM permissions`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);h(c(e(O)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),l(3),n(O);var k=c(O,2);p(k,{code:`bucket_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22s3-bucket-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%5D%2C%0A)%0A%0AMOUNT_PATH%3A%20Path%20%3D%20Path(%22%2Fmnt%2Fbucket%22)%0ALORAS_PATH%3A%20Path%20%3D%20MOUNT_PATH%20%2F%20%22loras%2Fv5%22%0A%0ABASE_MODEL%20%3D%20%22stabilityai%2Fstable-diffusion-xl-base-1.0%22%0ACACHE_DIR%20%3D%20%22%2Fhf-cache%22%0A`,lang:`python`});var A=c(k,4);p(A,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22huggingface_hub%3D%3D0.21.4%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.38.2%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.26.3%22%2C%0A%20%20%20%20%20%20%20%20%22peft%3D%3D0.9.0%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.27.2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HUB_CACHE%22%3A%20CACHE_DIR%7D)%0A)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20%23%20we%20import%20these%20dependencies%20only%20inside%20the%20container%0A%20%20%20%20import%20diffusers%0A%20%20%20%20import%20huggingface_hub%0A%20%20%20%20import%20torch%0A`,lang:`python`});var j=c(A,4);p(j,{code:`app%20%3D%20modal.App(%0A%20%20%20%20%22example-cloud-bucket-mount-loras%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20MOUNT_PATH%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22modal-s3mount-test-bucket%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Dbucket_secret%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%2C%0A)%0A%0A`,lang:`python`});var M=c(j,4);p(M,{code:`cache_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.function(image%3Dimage%2C%20volumes%3D%7BCACHE_DIR%3A%20cache_volume%7D)%0Adef%20download_model()%3A%0A%20%20%20%20loc%20%3D%20huggingface_hub.snapshot_download(repo_id%3DBASE_MODEL)%0A%20%20%20%20print(f%22Saved%20model%20to%20%7Bloc%7D%22)%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`acquiring-lora-weights`,children:(e,t)=>{l(),i(e,r(`Acquiring LoRA weights`))},$$slots:{default:!0}});var P=c(N,4);p(P,{code:`%40app.function(secrets%3D%5Bbucket_secret%5D)%0Adef%20search_loras(limit%3A%20int%2C%20max_model_size%3A%20int%20%3D%201024%20*%201024%20*%201024)%3A%0A%20%20%20%20api%20%3D%20huggingface_hub.HfApi()%0A%0A%20%20%20%20model_ids%3A%20list%5Bstr%5D%20%3D%20%5B%5D%0A%20%20%20%20for%20model%20in%20api.list_models(%0A%20%20%20%20%20%20%20%20tags%3D%5B%22lora%22%2C%20f%22base_model%3A%7BBASE_MODEL%7D%22%5D%2C%0A%20%20%20%20%20%20%20%20library%3D%22diffusers%22%2C%0A%20%20%20%20%20%20%20%20sort%3D%22downloads%22%2C%20%20%23%20sort%20by%20most%20downloaded%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20model_size%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20file%20in%20api.list_files_info(model.id)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model_size%20%2B%3D%20file.size%0A%0A%20%20%20%20%20%20%20%20except%20huggingface_hub.utils.GatedRepoError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22gated%20model%20(%7Bmodel.id%7D)%3B%20skipping%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%23%20Skip%20models%20that%20are%20larger%20than%20file%20limit.%0A%20%20%20%20%20%20%20%20if%20model_size%20%3E%20max_model_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22model%20%7Bmodel.id%7D%20is%20too%20large%3B%20skipping%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20model_ids.append(model.id)%0A%20%20%20%20%20%20%20%20if%20len(model_ids)%20%3E%3D%20limit%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20model_ids%0A%0A%20%20%20%20return%20model_ids%0A%0A`,lang:`python`});var F=c(P,2);h(c(e(F)),{href:`https://modal.com/docs/reference/modal.Function#map`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);p(I,{code:`%40app.function()%0Adef%20download_lora(repository_id%3A%20str)%20-%3E%20Optional%5Bstr%5D%3A%0A%20%20%20%20os.environ%5B%22HF_HUB_DISABLE_SYMLINKS_WARNING%22%5D%20%3D%20%221%22%0A%0A%20%20%20%20%23%20CloudBucketMounts%20will%20report%200%20bytes%20of%20available%20space%20leading%20to%20many%0A%20%20%20%20%23%20unnecessary%20warnings%2C%20so%20we%20patch%20the%20method%20that%20emits%20those%20warnings.%0A%20%20%20%20from%20huggingface_hub%20import%20file_download%0A%0A%20%20%20%20file_download._check_disk_space%20%3D%20lambda%20x%2C%20y%3A%20False%0A%0A%20%20%20%20repository_path%20%3D%20LORAS_PATH%20%2F%20repository_id%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%23%20skip%20models%20we've%20already%20downloaded%0A%20%20%20%20%20%20%20%20if%20not%20repository_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20huggingface_hub.snapshot_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20repository_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20local_dir%3Drepository_path.as_posix().replace(%22.%22%2C%20%22_%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20allow_patterns%3D%5B%22*.safetensors%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20downloaded_lora%20%3D%20len(list(repository_path.rglob(%22*.safetensors%22)))%20%3E%200%0A%20%20%20%20except%20OSError%3A%0A%20%20%20%20%20%20%20%20downloaded_lora%20%3D%20False%0A%20%20%20%20except%20FileNotFoundError%3A%0A%20%20%20%20%20%20%20%20downloaded_lora%20%3D%20False%0A%20%20%20%20if%20downloaded_lora%3A%0A%20%20%20%20%20%20%20%20return%20repository_id%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20return%20None%0A%0A`,lang:`python`});var L=c(I,2);u(L,{id:`inference-with-loras`,children:(e,t)=>{l(),i(e,r(`Inference with LoRAs`))},$$slots:{default:!0}});var R=c(L,2);h(c(e(R),3),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container lifecycle hooks guide`))},$$slots:{default:!0}}),l(),n(R);var z=c(R,2);p(z,{code:`%40app.cls(%0A%20%20%20%20gpu%3D%22a10g%22%2C%20%20%23%20A10G%20GPUs%20are%20great%20for%20inference%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_volume%7D%2C%20%20%23%20We%20cache%20the%20base%20model%0A)%0Aclass%20StableDiffusionLoRA%3A%0A%20%20%20%20%40modal.enter()%20%20%23%20when%20a%20new%20container%20starts%2C%20we%20load%20the%20base%20model%20into%20the%20GPU%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.DiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20BASE_MODEL%2C%20torch_dtype%3Dtorch.float16%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%20%20%23%20at%20inference%20time%2C%20we%20pull%20in%20the%20LoRA%20weights%20and%20pass%20the%20final%20model%20the%20prompt%0A%20%20%20%20def%20run_inference_with_lora(%0A%20%20%20%20%20%20%20%20self%2C%20lora_id%3A%20str%2C%20prompt%3A%20str%2C%20seed%3A%20int%20%3D%208888%0A%20%20%20%20)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20for%20file%20in%20(LORAS_PATH%20%2F%20lora_id).rglob(%22*.safetensors%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pipe.load_lora_weights(lora_id%2C%20weight_name%3Dfile.name)%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20lora_scale%20%3D%200.9%0A%20%20%20%20%20%20%20%20image%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3D10%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cross_attention_kwargs%3D%7B%22scale%22%3A%20lora_scale%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20generator%3Dtorch.manual_seed(seed)%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20buffer%20%3D%20io.BytesIO()%0A%20%20%20%20%20%20%20%20image.save(buffer%2C%20format%3D%22PNG%22)%0A%0A%20%20%20%20%20%20%20%20return%20buffer.getvalue()%0A%0A`,lang:`python`});var B=c(z,2);u(B,{id:`try-it-locally`,children:(e,t)=>{l(),i(e,r(`Try it locally!`))},$$slots:{default:!0}});var V=c(B,6);p(V,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20limit%3A%20int%20%3D%20100%2C%0A%20%20%20%20example_lora%3A%20str%20%3D%20%22ostris%2Fikea-instructions-lora-sdxl%22%2C%0A%20%20%20%20prompt%3A%20str%20%3D%20%22IKEA%20instructions%20for%20building%20a%20GPU%20rig%20for%20deep%20learning%22%2C%0A%20%20%20%20seed%3A%20int%20%3D%208888%2C%0A)%3A%0A%20%20%20%20%23%20Download%20LoRAs%20in%20parallel.%0A%20%20%20%20lora_model_ids%20%3D%20%5Bexample_lora%5D%0A%20%20%20%20lora_model_ids%20%2B%3D%20search_loras.remote(limit)%0A%0A%20%20%20%20downloaded_loras%20%3D%20%5B%5D%0A%20%20%20%20for%20model%20in%20download_lora.map(lora_model_ids)%3A%0A%20%20%20%20%20%20%20%20if%20model%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20downloaded_loras.append(model)%0A%0A%20%20%20%20print(f%22downloaded%20%7Blen(downloaded_loras)%7D%20loras%20%3D%3E%20%7Bdownloaded_loras%7D%22)%0A%0A%20%20%20%20%23%20Run%20inference%20using%20one%20of%20the%20downloaded%20LoRAs.%0A%20%20%20%20byte_stream%20%3D%20StableDiffusionLoRA().run_inference_with_lora.remote(%0A%20%20%20%20%20%20%20%20example_lora%2C%20prompt%2C%20seed%0A%20%20%20%20)%0A%20%20%20%20dir%20%3D%20Path(%22%2Ftmp%2Fstable-diffusion-xl%22)%0A%20%20%20%20if%20not%20dir.exists()%3A%0A%20%20%20%20%20%20%20%20dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20output_path%20%3D%20dir%20%2F%20f%22%7Bas_slug(prompt.lower())%7D.png%22%0A%20%20%20%20print(f%22Saving%20it%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20with%20open(output_path%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(byte_stream)%0A%0A`,lang:`python`});var H=c(V,2);u(H,{id:`lora-exploradora-a-hosted-gradio-interface`,children:(e,t)=>{l(),i(e,r(`LoRA Exploradora: A hosted Gradio interface`))},$$slots:{default:!0}}),p(c(H,6),{code:`web_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22gradio~%3D5.7.1%22%2C%0A%20%20%20%20%22pillow~%3D10.2.0%22%2C%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dweb_image%2C%0A%20%20%20%20scaledown_window%3D60%20*%2020%2C%0A%20%20%20%20%23%20gradio%20requires%20sticky%20sessions%0A%20%20%20%20%23%20so%20we%20limit%20the%20number%20of%20concurrent%20containers%20to%201%0A%20%20%20%20%23%20and%20allow%20it%20to%20scale%20to%20100%20concurrent%20inputs%0A%20%20%20%20max_containers%3D1%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20%22%22%22A%20simple%20Gradio%20interface%20around%20our%20LoRA%20inference.%22%22%22%0A%20%20%20%20import%20io%0A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%20%20%20%20from%20PIL%20import%20Image%0A%0A%20%20%20%20%23%20determine%20which%20loras%20are%20available%0A%20%20%20%20lora_ids%20%3D%20%5B%0A%20%20%20%20%20%20%20%20f%22%7Blora_dir.parent.stem%7D%2F%7Blora_dir.stem%7D%22%20for%20lora_dir%20in%20LORAS_PATH.glob(%22*%2F*%22)%0A%20%20%20%20%5D%0A%0A%20%20%20%20%23%20pick%20one%20to%20be%20default%2C%20set%20a%20default%20prompt%0A%20%20%20%20default_lora_id%20%3D%20(%0A%20%20%20%20%20%20%20%20%22ostris%2Fikea-instructions-lora-sdxl%22%0A%20%20%20%20%20%20%20%20if%20%22ostris%2Fikea-instructions-lora-sdxl%22%20in%20lora_ids%0A%20%20%20%20%20%20%20%20else%20lora_ids%5B0%5D%0A%20%20%20%20)%0A%20%20%20%20default_prompt%20%3D%20(%0A%20%20%20%20%20%20%20%20%22IKEA%20instructions%20for%20building%20a%20GPU%20rig%20for%20deep%20learning%22%0A%20%20%20%20%20%20%20%20if%20default_lora_id%20%3D%3D%20%22ostris%2Fikea-instructions-lora-sdxl%22%0A%20%20%20%20%20%20%20%20else%20%22text%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20the%20simple%20path%20to%20making%20an%20app%20on%20Gradio%20is%20an%20Interface%3A%20a%20UI%20wrapped%20around%20a%20function.%0A%20%20%20%20def%20go(lora_id%3A%20str%2C%20prompt%3A%20str%2C%20seed%3A%20int)%20-%3E%20Image%3A%0A%20%20%20%20%20%20%20%20return%20Image.open(%0A%20%20%20%20%20%20%20%20%20%20%20%20io.BytesIO(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20StableDiffusionLoRA().run_inference_with_lora.remote(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lora_id%2C%20prompt%2C%20seed%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20iface%20%3D%20gr.Interface(%0A%20%20%20%20%20%20%20%20go%2C%0A%20%20%20%20%20%20%20%20inputs%3D%5B%20%20%23%20the%20inputs%20to%20go%2Four%20inference%20function%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Dropdown(choices%3Dlora_ids%2C%20value%3Ddefault_lora_id%2C%20label%3D%22%F0%9F%91%89%20LoRA%20ID%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Textbox(default_prompt%2C%20label%3D%22%F0%9F%8E%A8%20Prompt%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Number(value%3D8888%2C%20label%3D%22%F0%9F%8E%B2%20Random%20Seed%22)%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20outputs%3Dgr.Image(label%3D%22Generated%20Image%22)%2C%0A%20%20%20%20%20%20%20%20%23%20some%20extra%20bits%20to%20make%20it%20look%20nicer%0A%20%20%20%20%20%20%20%20title%3D%22LoRAs%20Galore%22%2C%0A%20%20%20%20%20%20%20%20description%3D%22%23%20Try%20out%20some%20of%20the%20top%20custom%20SDXL%20models!%22%0A%20%20%20%20%20%20%20%20%22%5Cn%5CnPick%20a%20LoRA%20finetune%20of%20SDXL%20from%20the%20dropdown%2C%20then%20prompt%20it%20to%20generate%20an%20image.%22%0A%20%20%20%20%20%20%20%20%22%5Cn%5CnCheck%20out%20%5Bthe%20code%20on%20GitHub%5D(https%3A%2F%2Fgithub.com%2Fmodal-labs%2Fmodal-examples%2Fblob%2Fmain%2F10_integrations%2Fcloud_bucket_mount_loras.py)%22%0A%20%20%20%20%20%20%20%20%22%20if%20you%20want%20to%20create%20your%20own%20version%20or%20just%20see%20how%20it%20works.%22%0A%20%20%20%20%20%20%20%20%22%5Cn%5CnPowered%20by%20%5BModal%5D(https%3A%2F%2Fmodal.com)%20%F0%9F%9A%80%22%2C%0A%20%20%20%20%20%20%20%20theme%3D%22soft%22%2C%0A%20%20%20%20%20%20%20%20allow_flagging%3D%22never%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20mount_gradio_app(app%3DFastAPI()%2C%20blocks%3Diface%2C%20path%3D%22%2F%22)%0A%0A%0Adef%20as_slug(name)%3A%0A%20%20%20%20%22%22%22Converts%20a%20string%2C%20e.g.%20a%20prompt%2C%20into%20something%20we%20can%20use%20as%20a%20filename.%22%22%22%0A%20%20%20%20import%20re%0A%0A%20%20%20%20s%20%3D%20str(name).strip().replace(%22%20%22%2C%20%22-%22)%0A%20%20%20%20s%20%3D%20re.sub(r%22(%3Fu)%5B%5E-%5Cw.%5D%22%2C%20%22%22%2C%20s)%0A%20%20%20%20return%20s%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=fTdsFtHs.js.map
