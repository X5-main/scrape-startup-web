(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a2cbdbea-7287-45bf-941f-254dfdd70490`,e._sentryDebugIdIdentifier=`sentry-dbid-a2cbdbea-7287-45bf-941f-254dfdd70490`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run Stable Diffusion 3.5 Large Turbo as a CLI, API, and web UI`,id:`run-stable-diffusion-35-large-turbo-as-a-cli-api-and-web-ui`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Configuring dependencies`,id:`configuring-dependencies`},{depth:2,value:`Implementing SD3.5 Large Turbo inference on Modal`,id:`implementing-sd35-large-turbo-inference-on-modal`},{depth:2,value:`Generating Stable Diffusion images from the command line`,id:`generating-stable-diffusion-images-from-the-command-line`},{depth:2,value:`Generating Stable Diffusion images via an API`,id:`generating-stable-diffusion-images-via-an-api`},{depth:2,value:`Generating Stable Diffusion images in a web UI`,id:`generating-stable-diffusion-images-in-a-web-ui`}]}],rawContent:`# Run Stable Diffusion 3.5 Large Turbo as a CLI, API, and web UI

This example shows how to run [Stable Diffusion 3.5 Large Turbo](https://huggingface.co/stabilityai/stable-diffusion-3.5-large-turbo) on Modal
to generate images from your local command line, via an API, and as a web UI.

Inference takes about one minute to cold start,
at which point images are generated at a rate of one image every 1-2 seconds
for batch sizes between one and 16.

Below are four images produced by the prompt
"A princess riding on a pony".

![stable diffusion montage](https://modal-cdn.com/cdnbot/sd-montage-princess-yxu2vnbl_e896a9c0.webp)

## Basic setup

\`\`\`python
import io
import random
import time
from pathlib import Path
from typing import Optional

import modal

MINUTES = 60

\`\`\`

All Modal programs need an [\`App\`](https://modal.com/docs/reference/modal.App) — an object that acts as a recipe for
the application. Let's give it a friendly name.

\`\`\`python
app = modal.App("example-text-to-image")

\`\`\`

## Configuring dependencies

The model runs remotely inside a [container](https://modal.com/docs/guide/custom-container).
That means we need to install the necessary dependencies in that container's image.

Below, we start from a lightweight base Linux image
and then install our Python dependencies, like Hugging Face's \`diffusers\` library and \`torch\`.

\`\`\`python
CACHE_DIR = "/cache"

image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "accelerate==0.33.0",
        "diffusers==0.31.0",
        "fastapi[standard]==0.115.4",
        "huggingface-hub==0.36.0",
        "sentencepiece==0.2.0",
        "torch==2.5.1",
        "torchvision==0.20.1",
        "transformers~=4.44.0",
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
            "HF_HUB_CACHE": CACHE_DIR,
        }
    )
)

with image.imports():
    import diffusers
    import torch
    from fastapi import Response

\`\`\`

## Implementing SD3.5 Large Turbo inference on Modal

We wrap inference in a Modal [Cls](https://modal.com/docs/guide/lifecycle-functions)
that ensures models are loaded and then moved to the GPU once when a new container
starts, before the container picks up any work.

The \`run\` function just wraps a \`diffusers\` pipeline.
It sends the output image back to the client as bytes.

We also include a \`web\` wrapper that makes it possible
to trigger inference via an API call.
See the \`/docs\` route of the URL ending in \`inference-web.modal.run\`
that appears when you deploy the app for details.

\`\`\`python
MODEL_ID = "adamo1139/stable-diffusion-3.5-large-turbo-ungated"
MODEL_REVISION_ID = "9ad870ac0b0e5e48ced156bb02f85d324b7275d2"

cache_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.cls(
    image=image,
    gpu="H100",
    timeout=10 * MINUTES,
    volumes={CACHE_DIR: cache_volume},
)
class Inference:
    @modal.enter()
    def load_pipeline(self):
        self.pipe = diffusers.StableDiffusion3Pipeline.from_pretrained(
            MODEL_ID,
            revision=MODEL_REVISION_ID,
            torch_dtype=torch.bfloat16,
        ).to("cuda")

    @modal.method()
    def run(
        self, prompt: str, batch_size: int = 4, seed: Optional[int] = None
    ) -> list[bytes]:
        seed = seed if seed is not None else random.randint(0, 2**32 - 1)
        print("seeding RNG with", seed)
        torch.manual_seed(seed)
        images = self.pipe(
            prompt,
            num_images_per_prompt=batch_size,  # outputting multiple images per prompt is much cheaper than separate calls
            num_inference_steps=4,  # turbo is tuned to run in four steps
            guidance_scale=0.0,  # turbo doesn't use CFG
            max_sequence_length=512,  # T5-XXL text encoder supports longer sequences, more complex prompts
        ).images

        image_output = []
        for image in images:
            with io.BytesIO() as buf:
                image.save(buf, format="PNG")
                image_output.append(buf.getvalue())
        torch.cuda.empty_cache()  # reduce fragmentation
        return image_output

    @modal.fastapi_endpoint(docs=True)
    def web(self, prompt: str, seed: Optional[int] = None):
        return Response(
            content=self.run.local(  # run in the same container
                prompt, batch_size=1, seed=seed
            )[0],
            media_type="image/png",
        )


\`\`\`

## Generating Stable Diffusion images from the command line

This is the command we'll use to generate images. It takes a text \`prompt\`,
a \`batch_size\` that determines the number of images to generate per prompt,
and the number of times to run image generation (\`samples\`).

You can also provide a \`seed\` to make sampling more deterministic.

Run it with

\`\`\`bash
modal run text_to_image.py
\`\`\`

and pass \`--help\` to see more options.

\`\`\`python
@app.local_entrypoint()
def entrypoint(
    samples: int = 4,
    prompt: str = "A princess riding on a pony",
    batch_size: int = 4,
    seed: Optional[int] = None,
):
    print(
        f"prompt => {prompt}",
        f"samples => {samples}",
        f"batch_size => {batch_size}",
        f"seed => {seed}",
        sep="\\n",
    )

    output_dir = Path("/tmp/stable-diffusion")
    output_dir.mkdir(exist_ok=True, parents=True)

    inference_service = Inference()

    for sample_idx in range(samples):
        start = time.time()
        images = inference_service.run.remote(prompt, batch_size, seed)
        duration = time.time() - start
        print(f"Run {sample_idx + 1} took {duration:.3f}s")
        if sample_idx:
            print(
                f"\\tGenerated {len(images)} image(s) at {(duration) / len(images):.3f}s / image."
            )
        for batch_idx, image_bytes in enumerate(images):
            output_path = (
                output_dir
                / f"output_{slugify(prompt)[:64]}_{str(sample_idx).zfill(2)}_{str(batch_idx).zfill(2)}.png"
            )
            if not batch_idx:
                print("Saving outputs", end="\\n\\t")
            print(
                output_path,
                end="\\n" + ("\\t" if batch_idx < len(images) - 1 else ""),
            )
            output_path.write_bytes(image_bytes)


\`\`\`

## Generating Stable Diffusion images via an API

The Modal \`Cls\` above also included a [\`fastapi_endpoint\`](https://modal.com/docs/examples/basic_web),
which adds a simple web API to the inference method.

To try it out, run

\`\`\`bash
modal deploy text_to_image.py
\`\`\`

copy the printed URL ending in \`inference-web.modal.run\`,
and add \`/docs\` to the end. This will bring up the interactive
Swagger/OpenAPI docs for the endpoint.

## Generating Stable Diffusion images in a web UI

Lastly, we add a simple front-end web UI (written in Alpine.js) for
our image generation backend.

This is also deployed by running

\`\`\`bash
modal deploy text_to_image.py.
\`\`\`

The \`Inference\` class will serve multiple users from its own auto-scaling pool of warm GPU containers automatically.

\`\`\`python
frontend_path = Path(__file__).parent / "frontend"

web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("jinja2==3.1.4", "fastapi[standard]==0.115.4")
    .add_local_dir(frontend_path, remote_path="/assets")
)


@app.function(image=web_image)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import fastapi.staticfiles
    from fastapi import FastAPI, Request
    from fastapi.templating import Jinja2Templates

    web_app = FastAPI()
    templates = Jinja2Templates(directory="/assets")

    @web_app.get("/")
    async def read_root(request: Request):
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "inference_url": Inference.web.get_web_url(),
                "model_name": "Stable Diffusion 3.5 Large Turbo",
                "default_prompt": "A cinematic shot of a baby raccoon wearing an intricate italian priest robe.",
            },
        )

    web_app.mount(
        "/static",
        fastapi.staticfiles.StaticFiles(directory="/assets"),
        name="static",
    )

    return web_app


def slugify(s: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in s).strip("-")

\`\`\`
`,meta:{title:`Run Stable Diffusion 3.5 Large Turbo as a CLI, API, and web UI`,description:`This example shows how to run Stable Diffusion 3.5 Large Turbo on Modal to generate images from your local command line, via an API, and as a web UI.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>App</code>`),x=t(`<code>fastapi_endpoint</code>`),S=t(`<!> <p>This example shows how to run <!> on Modal
to generate images from your local command line, via an API, and as a web UI.</p> <p>Inference takes about one minute to cold start,
at which point images are generated at a rate of one image every 1-2 seconds
for batch sizes between one and 16.</p> <p>Below are four images produced by the prompt
“A princess riding on a pony”.</p> <p><!></p> <!> <!> <p>All Modal programs need an <!> — an object that acts as a recipe for
the application. Let’s give it a friendly name.</p> <!> <!> <p>The model runs remotely inside a <!>.
That means we need to install the necessary dependencies in that container’s image.</p> <p>Below, we start from a lightweight base Linux image
and then install our Python dependencies, like Hugging Face’s <code>diffusers</code> library and <code>torch</code>.</p> <!> <!> <p>We wrap inference in a Modal <!> that ensures models are loaded and then moved to the GPU once when a new container
starts, before the container picks up any work.</p> <p>The <code>run</code> function just wraps a <code>diffusers</code> pipeline.
It sends the output image back to the client as bytes.</p> <p>We also include a <code>web</code> wrapper that makes it possible
to trigger inference via an API call.
See the <code>/docs</code> route of the URL ending in <code>inference-web.modal.run</code> that appears when you deploy the app for details.</p> <!> <!> <p>This is the command we’ll use to generate images. It takes a text <code>prompt</code>,
a <code>batch_size</code> that determines the number of images to generate per prompt,
and the number of times to run image generation (<code>samples</code>).</p> <p>You can also provide a <code>seed</code> to make sampling more deterministic.</p> <p>Run it with</p> <!> <p>and pass <code>--help</code> to see more options.</p> <!> <!> <p>The Modal <code>Cls</code> above also included a <!>,
which adds a simple web API to the inference method.</p> <p>To try it out, run</p> <!> <p>copy the printed URL ending in <code>inference-web.modal.run</code>,
and add <code>/docs</code> to the end. This will bring up the interactive
Swagger/OpenAPI docs for the endpoint.</p> <!> <p>Lastly, we add a simple front-end web UI (written in Alpine.js) for
our image generation backend.</p> <p>This is also deployed by running</p> <!> <p>The <code>Inference</code> class will serve multiple users from its own auto-scaling pool of warm GPU containers automatically.</p> <!>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);d(m,{id:`run-stable-diffusion-35-large-turbo-as-a-cli-api-and-web-ui`,children:(e,t)=>{l(),i(e,r(`Run Stable Diffusion 3.5 Large Turbo as a CLI, API, and web UI`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://huggingface.co/stabilityai/stable-diffusion-3.5-large-turbo`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Stable Diffusion 3.5 Large Turbo`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6);f(e(_),{src:`https://modal-cdn.com/cdnbot/sd-montage-princess-yxu2vnbl_e896a9c0.webp`,alt:`stable diffusion montage`}),n(_);var v=c(_,2);u(v,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var y=c(v,2);p(y,{code:`import%20io%0Aimport%20random%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%0A`,lang:`python`});var C=c(y,2);h(c(e(C)),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);p(w,{code:`app%20%3D%20modal.App(%22example-text-to-image%22)%0A`,lang:`python`});var T=c(w,2);u(T,{id:`configuring-dependencies`,children:(e,t)=>{l(),i(e,r(`Configuring dependencies`))},$$slots:{default:!0}});var E=c(T,2);h(c(e(E)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,4);p(D,{code:`CACHE_DIR%20%3D%20%22%2Fcache%22%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.33.0%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.31.0%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.20.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers~%3D4.44.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HUB_CACHE%22%3A%20CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20diffusers%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20fastapi%20import%20Response%0A`,lang:`python`});var O=c(D,2);u(O,{id:`implementing-sd35-large-turbo-inference-on-modal`,children:(e,t)=>{l(),i(e,r(`Implementing SD3.5 Large Turbo inference on Modal`))},$$slots:{default:!0}});var k=c(O,2);h(c(e(k)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,6);p(A,{code:`MODEL_ID%20%3D%20%22adamo1139%2Fstable-diffusion-3.5-large-turbo-ungated%22%0AMODEL_REVISION_ID%20%3D%20%229ad870ac0b0e5e48ced156bb02f85d324b7275d2%22%0A%0Acache_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_volume%7D%2C%0A)%0Aclass%20Inference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_pipeline(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.StableDiffusion3Pipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(%0A%20%20%20%20%20%20%20%20self%2C%20prompt%3A%20str%2C%20batch_size%3A%20int%20%3D%204%2C%20seed%3A%20Optional%5Bint%5D%20%3D%20None%0A%20%20%20%20)%20-%3E%20list%5Bbytes%5D%3A%0A%20%20%20%20%20%20%20%20seed%20%3D%20seed%20if%20seed%20is%20not%20None%20else%20random.randint(0%2C%202**32%20-%201)%0A%20%20%20%20%20%20%20%20print(%22seeding%20RNG%20with%22%2C%20seed)%0A%20%20%20%20%20%20%20%20torch.manual_seed(seed)%0A%20%20%20%20%20%20%20%20images%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_images_per_prompt%3Dbatch_size%2C%20%20%23%20outputting%20multiple%20images%20per%20prompt%20is%20much%20cheaper%20than%20separate%20calls%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3D4%2C%20%20%23%20turbo%20is%20tuned%20to%20run%20in%20four%20steps%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3D0.0%2C%20%20%23%20turbo%20doesn't%20use%20CFG%0A%20%20%20%20%20%20%20%20%20%20%20%20max_sequence_length%3D512%2C%20%20%23%20T5-XXL%20text%20encoder%20supports%20longer%20sequences%2C%20more%20complex%20prompts%0A%20%20%20%20%20%20%20%20).images%0A%0A%20%20%20%20%20%20%20%20image_output%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20image%20in%20images%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20io.BytesIO()%20as%20buf%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image.save(buf%2C%20format%3D%22PNG%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image_output.append(buf.getvalue())%0A%20%20%20%20%20%20%20%20torch.cuda.empty_cache()%20%20%23%20reduce%20fragmentation%0A%20%20%20%20%20%20%20%20return%20image_output%0A%0A%20%20%20%20%40modal.fastapi_endpoint(docs%3DTrue)%0A%20%20%20%20def%20web(self%2C%20prompt%3A%20str%2C%20seed%3A%20Optional%5Bint%5D%20%3D%20None)%3A%0A%20%20%20%20%20%20%20%20return%20Response(%0A%20%20%20%20%20%20%20%20%20%20%20%20content%3Dself.run.local(%20%20%23%20run%20in%20the%20same%20container%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%20batch_size%3D1%2C%20seed%3Dseed%0A%20%20%20%20%20%20%20%20%20%20%20%20)%5B0%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20media_type%3D%22image%2Fpng%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var j=c(A,2);u(j,{id:`generating-stable-diffusion-images-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Generating Stable Diffusion images from the command line`))},$$slots:{default:!0}});var M=c(j,8);p(M,{code:`modal%20run%20text_to_image.py`,lang:`bash`});var N=c(M,4);p(N,{code:`%40app.local_entrypoint()%0Adef%20entrypoint(%0A%20%20%20%20samples%3A%20int%20%3D%204%2C%0A%20%20%20%20prompt%3A%20str%20%3D%20%22A%20princess%20riding%20on%20a%20pony%22%2C%0A%20%20%20%20batch_size%3A%20int%20%3D%204%2C%0A%20%20%20%20seed%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22prompt%20%3D%3E%20%7Bprompt%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22samples%20%3D%3E%20%7Bsamples%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22batch_size%20%3D%3E%20%7Bbatch_size%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22seed%20%3D%3E%20%7Bseed%7D%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fstable-diffusion%22)%0A%20%20%20%20output_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20inference_service%20%3D%20Inference()%0A%0A%20%20%20%20for%20sample_idx%20in%20range(samples)%3A%0A%20%20%20%20%20%20%20%20start%20%3D%20time.time()%0A%20%20%20%20%20%20%20%20images%20%3D%20inference_service.run.remote(prompt%2C%20batch_size%2C%20seed)%0A%20%20%20%20%20%20%20%20duration%20%3D%20time.time()%20-%20start%0A%20%20%20%20%20%20%20%20print(f%22Run%20%7Bsample_idx%20%2B%201%7D%20took%20%7Bduration%3A.3f%7Ds%22)%0A%20%20%20%20%20%20%20%20if%20sample_idx%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%5CtGenerated%20%7Blen(images)%7D%20image(s)%20at%20%7B(duration)%20%2F%20len(images)%3A.3f%7Ds%20%2F%20image.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20for%20batch_idx%2C%20image_bytes%20in%20enumerate(images)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20output_path%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output_dir%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%20f%22output_%7Bslugify(prompt)%5B%3A64%5D%7D_%7Bstr(sample_idx).zfill(2)%7D_%7Bstr(batch_idx).zfill(2)%7D.png%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20batch_idx%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Saving%20outputs%22%2C%20end%3D%22%5Cn%5Ct%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20end%3D%22%5Cn%22%20%2B%20(%22%5Ct%22%20if%20batch_idx%20%3C%20len(images)%20-%201%20else%20%22%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20output_path.write_bytes(image_bytes)%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`generating-stable-diffusion-images-via-an-api`,children:(e,t)=>{l(),i(e,r(`Generating Stable Diffusion images via an API`))},$$slots:{default:!0}});var F=c(P,2);h(c(e(F),3),{href:`https://modal.com/docs/examples/basic_web`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(F);var I=c(F,4);p(I,{code:`modal%20deploy%20text_to_image.py`,lang:`bash`});var L=c(I,4);u(L,{id:`generating-stable-diffusion-images-in-a-web-ui`,children:(e,t)=>{l(),i(e,r(`Generating Stable Diffusion images in a web UI`))},$$slots:{default:!0}});var R=c(L,6);p(R,{code:`modal%20deploy%20text_to_image.py.`,lang:`bash`}),p(c(R,4),{code:`frontend_path%20%3D%20Path(__file__).parent%20%2F%20%22frontend%22%0A%0Aweb_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22jinja2%3D%3D3.1.4%22%2C%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22)%0A%20%20%20%20.add_local_dir(frontend_path%2C%20remote_path%3D%22%2Fassets%22)%0A)%0A%0A%0A%40app.function(image%3Dweb_image)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20fastapi.staticfiles%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Request%0A%20%20%20%20from%20fastapi.templating%20import%20Jinja2Templates%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20templates%20%3D%20Jinja2Templates(directory%3D%22%2Fassets%22)%0A%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20async%20def%20read_root(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20return%20templates.TemplateResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22index.html%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22request%22%3A%20request%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22inference_url%22%3A%20Inference.web.get_web_url()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22model_name%22%3A%20%22Stable%20Diffusion%203.5%20Large%20Turbo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22default_prompt%22%3A%20%22A%20cinematic%20shot%20of%20a%20baby%20raccoon%20wearing%20an%20intricate%20italian%20priest%20robe.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20web_app.mount(%0A%20%20%20%20%20%20%20%20%22%2Fstatic%22%2C%0A%20%20%20%20%20%20%20%20fastapi.staticfiles.StaticFiles(directory%3D%22%2Fassets%22)%2C%0A%20%20%20%20%20%20%20%20name%3D%22static%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20web_app%0A%0A%0Adef%20slugify(s%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20return%20%22%22.join(c%20if%20c.isalnum()%20else%20%22-%22%20for%20c%20in%20s).strip(%22-%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=DIsJAcpv.js.map
