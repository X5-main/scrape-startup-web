(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`988ea3a9-5301-40cf-9e6d-f4916e1407a3`,e._sentryDebugIdIdentifier=`sentry-dbid-988ea3a9-5301-40cf-9e6d-f4916e1407a3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Edit images with Flux Kontext`,id:`edit-images-with-flux-kontext`,children:[{depth:2,value:`Define a container image`,id:`define-a-container-image`},{depth:2,value:`Download the model`,id:`download-the-model`},{depth:2,value:`Cache the model weights`,id:`cache-the-model-weights`},{depth:2,value:`Set up and run Flux Kontext`,id:`set-up-and-run-flux-kontext`},{depth:2,value:`Running the model from the command line`,id:`running-the-model-from-the-command-line`}]}],rawContent:`# Edit images with Flux Kontext

In this example, we run the Flux Kontext model in _image-to-image_ mode:
the model takes in a prompt and an image and edits the image to better match the prompt.

For example, the model edited the first image into the second based on the prompt
"_A cute dog wizard inspired by Gandalf from Lord of the Rings, featuring detailed fantasy elements in Studio Ghibli style_".

 <img src="https://modal-cdn.com/dog-wizard-ghibli-flux-kontext.jpg" alt="A photo of a dog transformed into a cartoon of a cute dog wizard" />

The model is Black Forest Labs' [FLUX.1-Kontext-dev](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev).
Learn more about the model [here](https://bfl.ai/announcements/flux-1-kontext-dev).

## Define a container image

First, we define the environment the model inference will run in,
the [container image](https://modal.com/docs/guide/custom-container).

We start from an NVIDIA CUDA base image and install the necessary Python packages.
We use a specific commit of the \`diffusers\` library to ensure compatibility with the Flux Kontext model.

\`\`\`python
from io import BytesIO
from pathlib import Path

import modal

app = modal.App("example-image-to-image")

diffusers_commit_sha = "00f95b9755718aabb65456e791b8408526ae6e76"

image = (
    modal.Image.from_registry("nvidia/cuda:12.8.1-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])  # remove verbose logging by base image on entry
    .apt_install("git")
    .uv_pip_install(
        "Pillow~=11.2.1",
        "accelerate~=1.8.1",
        f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
        "huggingface-hub==0.36.0",
        "optimum-quanto==0.2.7",
        "safetensors==0.5.3",
        "sentencepiece==0.2.0",
        "torch==2.7.1",
        "transformers~=4.53.0",
        extra_options="--index-strategy unsafe-best-match",
        extra_index_url="https://download.pytorch.org/whl/cu128",
    )
)

\`\`\`

## Download the model

We'll be using the FLUX.1-Kontext-dev model from Black Forest Labs.
This model specializes in image-to-image editing with strong prompt adherence.

\`\`\`python
MODEL_NAME = "black-forest-labs/FLUX.1-Kontext-dev"
MODEL_REVISION = "f9fdd1a95e0dfd7653cb0966cda2486745122695"

\`\`\`

Note that access to the FLUX.1-Kontext-dev model on Hugging Face is
[gated by a license agreement](https://huggingface.co/docs/hub/en/models-gated) which
you must agree to [here](https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev).
After you have accepted the license, [create a Modal Secret](https://modal.com/secrets)
with the name \`huggingface-secret\` following the instructions in the template.

## Cache the model weights

The model weights are large (tens of gigabytes), so we want to cache them
to avoid downloading them every time a container starts.
We use a [Modal Volume](https://modal.com/docs/guide/volumes) to persist the Hugging Face cache.
Modal Volumes act like a shared disk that all Modal Functions can access.
For more on storing model weights on Modal, see [this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
CACHE_DIR = Path("/cache")
cache_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)
volumes = {CACHE_DIR: cache_volume}

\`\`\`

We reference the Hugging Face secret we created earlier to authenticate when downloading the model.

\`\`\`python
secrets = [modal.Secret.from_name("huggingface-secret")]

\`\`\`

We configure environment variables to enable faster downloads from Hugging Face
and point the Hugging Face cache to our Modal Volume.

\`\`\`python
image = image.env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HOME": str(CACHE_DIR)})

\`\`\`

Finally, we import packages we'll be using in our inference function,
but not locally.

\`\`\`python
with image.imports():
    import torch
    from diffusers import FluxKontextPipeline
    from diffusers.utils import load_image
    from PIL import Image


\`\`\`

## Set up and run Flux Kontext

The Modal \`Cls\` defined below contains all the logic to set up and run Flux Kontext inference.

We define our Python class as a Modal \`Cls\` using the \`app.cls\` decorator.
We provide a few arguments to describe the infrastructure our inference should run on:

- the Image, Volume, and Secret we defined above
- a [\`gpu\`](https://modal.com/docs/guide/gpu), in particular a [B200](https://modal.com/blog/introducing-b200-h200)

The [container lifecycle](https://modal.com/docs/guide/lifecycle-functions) decorator,
\`@modal.enter\`, ensures that the model is loaded into memory when a container starts, before it picks up any inputs.
This is useful for managing tail latencies (see [this guide](https://modal.com/docs/guide/cold-start) for details).

The \`inference\` method runs the actual model inference. It takes in an image (as raw \`bytes\`) and a string \`prompt\` and returns
a new image (also as raw \`bytes\`).

\`\`\`python
@app.cls(image=image, gpu="B200", volumes=volumes, secrets=secrets)
class Model:
    @modal.enter()
    def enter(self):
        print(f"Loading {MODEL_NAME}...")

        self.pipe = FluxKontextPipeline.from_pretrained(
            MODEL_NAME,
            revision=MODEL_REVISION,
            torch_dtype=torch.bfloat16,
            cache_dir=CACHE_DIR,
        ).to("cuda")

    @modal.method()
    def inference(
        self,
        image_bytes: bytes,
        prompt: str,
        guidance_scale: float = 3.5,
        num_inference_steps: int = 20,
        seed: int | None = None,
    ) -> bytes:
        init_image = load_image(Image.open(BytesIO(image_bytes))).resize((512, 512))

        generator = None
        if seed is not None:
            generator = torch.Generator(device="cuda").manual_seed(seed)

        image = self.pipe(
            image=init_image,
            prompt=prompt,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            output_type="pil",
            generator=generator,
        ).images[0]

        byte_stream = BytesIO()
        image.save(byte_stream, format="PNG")

        return byte_stream.getvalue()


\`\`\`

## Running the model from the command line

You can run the model from the command line with

\`\`\`bash
modal run image_to_image.py
\`\`\`

Use \`--help\` for additional details.

\`\`\`python
@app.local_entrypoint()
def main(
    image_path=Path(__file__).parent / "demo_images/dog.png",
    output_path=Path("/tmp/stable-diffusion/output.png"),
    prompt: str = "A cute dog wizard inspired by Gandalf from Lord of the Rings, featuring detailed fantasy elements in Studio Ghibli style",
):
    print(f"🎨 reading input image from {image_path}")
    input_image_bytes = Path(image_path).read_bytes()
    print(f"🎨 editing image with prompt '{prompt}'")
    output_image_bytes = Model().inference.remote(input_image_bytes, prompt)

    if isinstance(output_path, str):
        output_path = Path(output_path)

    dir = output_path.parent
    dir.mkdir(exist_ok=True, parents=True)

    print(f"🎨 saving output image to {output_path}")
    output_path.write_bytes(output_image_bytes)

\`\`\`
`,meta:{title:`Edit images with Flux Kontext`,description:`In this example, we run the Flux Kontext model in image-to-image mode: the model takes in a prompt and an image and edits the image to better match the prompt.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>gpu</code>`),b=t(`<!> <p>In this example, we run the Flux Kontext model in <em>image-to-image</em> mode:
the model takes in a prompt and an image and edits the image to better match the prompt.</p> <p>For example, the model edited the first image into the second based on the prompt
”<em>A cute dog wizard inspired by Gandalf from Lord of the Rings, featuring detailed fantasy elements in Studio Ghibli style</em>“.</p> <img src="https://modal-cdn.com/dog-wizard-ghibli-flux-kontext.jpg" alt="A photo of a dog transformed into a cartoon of a cute dog wizard"/> <p>The model is Black Forest Labs’ <!>.
Learn more about the model <!>.</p> <!> <p>First, we define the environment the model inference will run in,
the <!>.</p> <p>We start from an NVIDIA CUDA base image and install the necessary Python packages.
We use a specific commit of the <code>diffusers</code> library to ensure compatibility with the Flux Kontext model.</p> <!> <!> <p>We’ll be using the FLUX.1-Kontext-dev model from Black Forest Labs.
This model specializes in image-to-image editing with strong prompt adherence.</p> <!> <p>Note that access to the FLUX.1-Kontext-dev model on Hugging Face is <!> which
you must agree to <!>.
After you have accepted the license, <!> with the name <code>huggingface-secret</code> following the instructions in the template.</p> <!> <p>The model weights are large (tens of gigabytes), so we want to cache them
to avoid downloading them every time a container starts.
We use a <!> to persist the Hugging Face cache.
Modal Volumes act like a shared disk that all Modal Functions can access.
For more on storing model weights on Modal, see <!>.</p> <!> <p>We reference the Hugging Face secret we created earlier to authenticate when downloading the model.</p> <!> <p>We configure environment variables to enable faster downloads from Hugging Face
and point the Hugging Face cache to our Modal Volume.</p> <!> <p>Finally, we import packages we’ll be using in our inference function,
but not locally.</p> <!> <!> <p>The Modal <code>Cls</code> defined below contains all the logic to set up and run Flux Kontext inference.</p> <p>We define our Python class as a Modal <code>Cls</code> using the <code>app.cls</code> decorator.
We provide a few arguments to describe the infrastructure our inference should run on:</p> <ul><li>the Image, Volume, and Secret we defined above</li> <li>a <!>, in particular a <!></li></ul> <p>The <!> decorator, <code>@modal.enter</code>, ensures that the model is loaded into memory when a container starts, before it picks up any inputs.
This is useful for managing tail latencies (see <!> for details).</p> <p>The <code>inference</code> method runs the actual model inference. It takes in an image (as raw <code>bytes</code>) and a string <code>prompt</code> and returns
a new image (also as raw <code>bytes</code>).</p> <!> <!> <p>You can run the model from the command line with</p> <!> <p>Use <code>--help</code> for additional details.</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`edit-images-with-flux-kontext`,children:(e,t)=>{l(),i(e,r(`Edit images with Flux Kontext`))},$$slots:{default:!0}});var h=c(p,8),g=c(e(h));m(g,{href:`https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FLUX.1-Kontext-dev`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://bfl.ai/announcements/flux-1-kontext-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);u(_,{id:`define-a-container-image`,children:(e,t)=>{l(),i(e,r(`Define a container image`))},$$slots:{default:!0}});var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),l(),n(v);var x=c(v,4);f(x,{code:`from%20io%20import%20BytesIO%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-image-to-image%22)%0A%0Adiffusers_commit_sha%20%3D%20%2200f95b9755718aabb65456e791b8408526ae6e76%22%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.8.1-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%20%20%23%20remove%20verbose%20logging%20by%20base%20image%20on%20entry%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22Pillow~%3D11.2.1%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate~%3D1.8.1%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers.git%40%7Bdiffusers_commit_sha%7D%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22optimum-quanto%3D%3D0.2.7%22%2C%0A%20%20%20%20%20%20%20%20%22safetensors%3D%3D0.5.3%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers~%3D4.53.0%22%2C%0A%20%20%20%20%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A%20%20%20%20%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var S=c(x,2);u(S,{id:`download-the-model`,children:(e,t)=>{l(),i(e,r(`Download the model`))},$$slots:{default:!0}});var C=c(S,4);f(C,{code:`MODEL_NAME%20%3D%20%22black-forest-labs%2FFLUX.1-Kontext-dev%22%0AMODEL_REVISION%20%3D%20%22f9fdd1a95e0dfd7653cb0966cda2486745122695%22%0A`,lang:`python`});var w=c(C,2),T=c(e(w));m(T,{href:`https://huggingface.co/docs/hub/en/models-gated`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gated by a license agreement`))},$$slots:{default:!0}});var E=c(T,2);m(E,{href:`https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),m(c(E,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`create a Modal Secret`))},$$slots:{default:!0}}),l(3),n(w);var D=c(w,2);u(D,{id:`cache-the-model-weights`,children:(e,t)=>{l(),i(e,r(`Cache the model weights`))},$$slots:{default:!0}});var O=c(D,2),k=c(e(O));m(k,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),m(c(k,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(O);var A=c(O,2);f(A,{code:`CACHE_DIR%20%3D%20Path(%22%2Fcache%22)%0Acache_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0Avolumes%20%3D%20%7BCACHE_DIR%3A%20cache_volume%7D%0A`,lang:`python`});var j=c(A,4);f(j,{code:`secrets%20%3D%20%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%0A`,lang:`python`});var M=c(j,4);f(M,{code:`image%20%3D%20image.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HOME%22%3A%20str(CACHE_DIR)%7D)%0A`,lang:`python`});var N=c(M,4);f(N,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20diffusers%20import%20FluxKontextPipeline%0A%20%20%20%20from%20diffusers.utils%20import%20load_image%0A%20%20%20%20from%20PIL%20import%20Image%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`set-up-and-run-flux-kontext`,children:(e,t)=>{l(),i(e,r(`Set up and run Flux Kontext`))},$$slots:{default:!0}});var F=c(P,6),I=c(e(F),2),L=c(e(I));m(L,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),m(c(L,2),{href:`https://modal.com/blog/introducing-b200-h200`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`B200`))},$$slots:{default:!0}}),n(I),n(F);var R=c(F,2),z=c(e(R));m(z,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container lifecycle`))},$$slots:{default:!0}}),m(c(z,4),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(R);var B=c(R,4);f(B,{code:`%40app.cls(image%3Dimage%2C%20gpu%3D%22B200%22%2C%20volumes%3Dvolumes%2C%20secrets%3Dsecrets)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20print(f%22Loading%20%7BMODEL_NAME%7D...%22)%0A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20FluxKontextPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_dir%3DCACHE_DIR%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20image_bytes%3A%20bytes%2C%0A%20%20%20%20%20%20%20%20prompt%3A%20str%2C%0A%20%20%20%20%20%20%20%20guidance_scale%3A%20float%20%3D%203.5%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3A%20int%20%3D%2020%2C%0A%20%20%20%20%20%20%20%20seed%3A%20int%20%7C%20None%20%3D%20None%2C%0A%20%20%20%20)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20init_image%20%3D%20load_image(Image.open(BytesIO(image_bytes))).resize((512%2C%20512))%0A%0A%20%20%20%20%20%20%20%20generator%20%3D%20None%0A%20%20%20%20%20%20%20%20if%20seed%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20generator%20%3D%20torch.Generator(device%3D%22cuda%22).manual_seed(seed)%0A%0A%20%20%20%20%20%20%20%20image%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dinit_image%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dguidance_scale%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20output_type%3D%22pil%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20generator%3Dgenerator%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20byte_stream%20%3D%20BytesIO()%0A%20%20%20%20%20%20%20%20image.save(byte_stream%2C%20format%3D%22PNG%22)%0A%0A%20%20%20%20%20%20%20%20return%20byte_stream.getvalue()%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`running-the-model-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Running the model from the command line`))},$$slots:{default:!0}});var H=c(V,4);f(H,{code:`modal%20run%20image_to_image.py`,lang:`bash`}),f(c(H,4),{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20image_path%3DPath(__file__).parent%20%2F%20%22demo_images%2Fdog.png%22%2C%0A%20%20%20%20output_path%3DPath(%22%2Ftmp%2Fstable-diffusion%2Foutput.png%22)%2C%0A%20%20%20%20prompt%3A%20str%20%3D%20%22A%20cute%20dog%20wizard%20inspired%20by%20Gandalf%20from%20Lord%20of%20the%20Rings%2C%20featuring%20detailed%20fantasy%20elements%20in%20Studio%20Ghibli%20style%22%2C%0A)%3A%0A%20%20%20%20print(f%22%F0%9F%8E%A8%20reading%20input%20image%20from%20%7Bimage_path%7D%22)%0A%20%20%20%20input_image_bytes%20%3D%20Path(image_path).read_bytes()%0A%20%20%20%20print(f%22%F0%9F%8E%A8%20editing%20image%20with%20prompt%20'%7Bprompt%7D'%22)%0A%20%20%20%20output_image_bytes%20%3D%20Model().inference.remote(input_image_bytes%2C%20prompt)%0A%0A%20%20%20%20if%20isinstance(output_path%2C%20str)%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20Path(output_path)%0A%0A%20%20%20%20dir%20%3D%20output_path.parent%0A%20%20%20%20dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20print(f%22%F0%9F%8E%A8%20saving%20output%20image%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_bytes(output_image_bytes)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=CoLACZvJ.js.map
