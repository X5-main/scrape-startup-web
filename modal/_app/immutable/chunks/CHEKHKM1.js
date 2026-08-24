(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e5f9aa22-6aa6-4794-b574-e5b6717137d2`,e._sentryDebugIdIdentifier=`sentry-dbid-e5f9aa22-6aa6-4794-b574-e5b6717137d2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Animate images with Lightricks LTX-Video via CLI, API, and web UI`,id:`animate-images-with-lightricks-ltx-video-via-cli-api-and-web-ui`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`,children:[{depth:3,value:`Configuring dependencies`,id:`configuring-dependencies`}]},{depth:2,value:`Storing model weights on Modal`,id:`storing-model-weights-on-modal`},{depth:2,value:`Storing model outputs on Modal`,id:`storing-model-outputs-on-modal`},{depth:2,value:`Implementing LTX-Video inference on Modal`,id:`implementing-ltx-video-inference-on-modal`},{depth:2,value:`Generating videos from the command line`,id:`generating-videos-from-the-command-line`},{depth:2,value:`Generating videos via an API`,id:`generating-videos-via-an-api`},{depth:2,value:`Generating videos in a web UI`,id:`generating-videos-in-a-web-ui`}]}],rawContent:`# Animate images with Lightricks LTX-Video via CLI, API, and web UI

This example shows how to run [LTX-Video](https://huggingface.co/Lightricks/LTX-Video) on Modal
to generate videos from your local command line, via an API, and in a web UI.

Generating a 5 second video takes ~1 minute from cold start.
Once the container is warm, a 5 second video takes ~15 seconds.

Here is a sample we generated:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/example_image_to_video.mp4" type="video/mp4" />
</video>
</center>

## Basic setup

\`\`\`python
import io
import random
import time
from pathlib import Path
from typing import Annotated, Optional

import fastapi
import modal

\`\`\`

All Modal programs need an [\`App\`](https://modal.com/docs/reference/modal.App) —
an object that acts as a recipe for the application.

\`\`\`python
app = modal.App("example-image-to-video")

\`\`\`

### Configuring dependencies

The model runs remotely, on Modal's cloud, which means we need to
[define the environment it runs in](https://modal.com/docs/guide/images).

Below, we start from a lightweight base Linux image
and then install our system and Python dependencies,
like Hugging Face's \`diffusers\` library and \`torch\`.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("python3-opencv")
    .uv_pip_install(
        "accelerate==1.4.0",
        "diffusers==0.32.2",
        "fastapi[standard]==0.115.8",
        "huggingface-hub==0.36.0",
        "imageio==2.37.0",
        "imageio-ffmpeg==0.6.0",
        "opencv-python==4.11.0.86",
        "pillow==11.1.0",
        "sentencepiece==0.2.0",
        "torch==2.6.0",
        "torchvision==0.21.0",
        "transformers==4.49.0",
    )
)

\`\`\`

## Storing model weights on Modal

We also need the parameters of the model remotely.
They can be loaded at runtime from Hugging Face,
based on a repository ID and a revision (aka a commit SHA).

\`\`\`python
MODEL_ID = "Lightricks/LTX-Video"
MODEL_REVISION_ID = "a6d59ee37c13c58261aa79027d3e41cd41960925"

\`\`\`

Hugging Face will also cache the weights to disk once they're downloaded.
But Modal Functions are serverless, and so even disks are ephemeral,
which means the weights would get re-downloaded every time we spin up a new instance.

We can fix this -- without any modifications to Hugging Face's model loading code! --
by pointing the Hugging Face cache at a [Modal Volume](https://modal.com/docs/guide/volumes). For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
model_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

MODEL_PATH = "/models"  # where the Volume will appear on our Functions' filesystems

image = image.env(
    {
        "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
        "HF_HUB_CACHE": MODEL_PATH,
    }
)

\`\`\`

## Storing model outputs on Modal

Contemporary video models can take a long time to run and they produce large outputs.
That makes them a great candidate for storage on Modal Volumes as well.
Python code running outside of Modal can also access this storage, as we'll see below.

\`\`\`python
OUTPUT_PATH = "/outputs"
output_volume = modal.Volume.from_name("outputs", create_if_missing=True)

\`\`\`

## Implementing LTX-Video inference on Modal

We wrap the inference logic in a Modal [Cls](https://modal.com/docs/guide/lifecycle-functions)
that ensures models are loaded and then moved to the GPU once when a new instance
starts, rather than every time we run it.

The \`run\` function just wraps a \`diffusers\` pipeline.
It saves the generated video to a Modal Volume, and returns the filename.

We also include a \`web\` wrapper that makes it possible
to trigger inference via an API call.
For details, see the \`/docs\` route of the URL ending in \`inference-web.modal.run\`
that appears when you deploy the app.

\`\`\`python
with image.imports():  # loaded on all of our remote Functions
    import diffusers
    import torch
    from PIL import Image

MINUTES = 60


@app.cls(
    image=image,
    gpu="H100",
    timeout=10 * MINUTES,
    scaledown_window=10 * MINUTES,
    volumes={MODEL_PATH: model_volume, OUTPUT_PATH: output_volume},
)
class Inference:
    @modal.enter()
    def load_pipeline(self):
        self.pipe = diffusers.LTXImageToVideoPipeline.from_pretrained(
            MODEL_ID,
            revision=MODEL_REVISION_ID,
            torch_dtype=torch.bfloat16,
        ).to("cuda")

    @modal.method()
    def run(
        self,
        image_bytes: bytes,
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_frames: Optional[int] = None,
        num_inference_steps: Optional[int] = None,
        seed: Optional[int] = None,
    ) -> str:
        negative_prompt = (
            negative_prompt
            or "worst quality, inconsistent motion, blurry, jittery, distorted"
        )
        width = 768
        height = 512
        num_frames = num_frames or 25
        num_inference_steps = num_inference_steps or 50
        seed = seed or random.randint(0, 2**32 - 1)
        print(f"Seeding RNG with: {seed}")
        torch.manual_seed(seed)

        image = diffusers.utils.load_image(Image.open(io.BytesIO(image_bytes)))

        video = self.pipe(
            image=image,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_frames=num_frames,
            num_inference_steps=num_inference_steps,
        ).frames[0]

        mp4_name = (
            f"{seed}_{''.join(c if c.isalnum() else '-' for c in prompt[:100])}.mp4"
        )
        diffusers.utils.export_to_video(
            video, f"{Path(OUTPUT_PATH) / mp4_name}", fps=24
        )
        output_volume.commit()
        torch.cuda.empty_cache()  # reduce fragmentation
        return mp4_name

    @modal.fastapi_endpoint(method="POST", docs=True)
    def web(
        self,
        image_bytes: Annotated[bytes, fastapi.File()],
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_frames: Optional[int] = None,
        num_inference_steps: Optional[int] = None,
        seed: Optional[int] = None,
    ) -> fastapi.Response:
        mp4_name = self.run.local(  # run in the same container
            image_bytes=image_bytes,
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_frames=num_frames,
            num_inference_steps=num_inference_steps,
            seed=seed,
        )
        return fastapi.responses.FileResponse(
            path=f"{Path(OUTPUT_PATH) / mp4_name}",
            media_type="video/mp4",
            filename=mp4_name,
        )


\`\`\`

## Generating videos from the command line

We add a [local entrypoint](https://modal.com/docs/reference/modal.App#local_entrypoint)
that calls the \`Inference.run\` method to run inference from the command line.
The function's parameters are automatically turned into a CLI.

Run it with

\`\`\`bash
modal run image_to_video.py --prompt "A cat looking out the window at a snowy mountain" --image-path /path/to/cat.jpg
\`\`\`

You can also pass \`--help\` to see the full list of arguments.

\`\`\`python
@app.local_entrypoint()
def entrypoint(
    image_path: str,
    prompt: str,
    negative_prompt: Optional[str] = None,
    num_frames: Optional[int] = None,
    num_inference_steps: Optional[int] = None,
    seed: Optional[int] = None,
    twice: bool = True,
):
    import os
    import urllib.request

    print(f"🎥 Generating a video from the image at {image_path}")
    print(f"🎥 using the prompt {prompt}")

    if image_path.startswith(("http://", "https://")):
        image_bytes = urllib.request.urlopen(image_path).read()
    elif os.path.isfile(image_path):
        image_bytes = Path(image_path).read_bytes()
    else:
        raise ValueError(f"{image_path} is not a valid file or URL.")

    inference_service = Inference()

    for _ in range(1 + twice):
        start = time.time()
        mp4_name = inference_service.run.remote(
            image_bytes=image_bytes,
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_frames=num_frames,
            seed=seed,
        )
        duration = time.time() - start
        print(f"🎥 Generated video in {duration:.3f}s")

        output_dir = Path("/tmp/image_to_video")
        output_dir.mkdir(exist_ok=True, parents=True)
        output_path = output_dir / mp4_name
        # read in the file from the Modal Volume, then write it to the local disk
        output_path.write_bytes(b"".join(output_volume.read_file(mp4_name)))
        print(f"🎥 Video saved to {output_path}")


\`\`\`

## Generating videos via an API

The Modal \`Cls\` above also included a [\`fastapi_endpoint\`](https://modal.com/docs/examples/basic_web),
which adds a simple web API to the inference method.

To try it out, run

\`\`\`bash
modal deploy image_to_video.py
\`\`\`

copy the printed URL ending in \`inference-web.modal.run\`,
and add \`/docs\` to the end. This will bring up the interactive
Swagger/OpenAPI docs for the endpoint.

## Generating videos in a web UI

Lastly, we add a simple front-end web UI (written in Alpine.js) for
our image to video backend.

This is also deployed when you run

\`\`\`bash
modal deploy image_to_video.py.
\`\`\`

The \`Inference\` class will serve multiple users from its own auto-scaling pool of warm GPU containers automatically,
and they will spin down when there are no requests.

\`\`\`python
frontend_path = Path(__file__).parent / "frontend"

web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("jinja2==3.1.5", "fastapi[standard]==0.115.8")
    .add_local_dir(  # mount frontend/client code
        frontend_path, remote_path="/assets"
    )
)


@app.function(image=web_image)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import fastapi.staticfiles
    import fastapi.templating

    web_app = fastapi.FastAPI()
    templates = fastapi.templating.Jinja2Templates(directory="/assets")

    @web_app.get("/")
    async def read_root(request: fastapi.Request):
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "inference_url": Inference().web.get_web_url(),
                "model_name": "LTX-Video Image to Video",
                "default_prompt": "A young girl stands calmly in the foreground, looking directly at the camera, as a house fire rages in the background.",
            },
        )

    web_app.mount(
        "/static",
        fastapi.staticfiles.StaticFiles(directory="/assets"),
        name="static",
    )

    return web_app

\`\`\`
`,meta:{title:`Animate images with Lightricks LTX-Video via CLI, API, and web UI`,description:`This example shows how to run LTX-Video on Modal to generate videos from your local command line, via an API, and in a web UI.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>App</code>`),x=t(`<code>fastapi_endpoint</code>`),S=t(`<!> <p>This example shows how to run <!> on Modal
to generate videos from your local command line, via an API, and in a web UI.</p> <p>Generating a 5 second video takes ~1 minute from cold start.
Once the container is warm, a 5 second video takes ~15 seconds.</p> <p>Here is a sample we generated:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/example_image_to_video.mp4" type="video/mp4"/></video></center> <!> <!> <p>All Modal programs need an <!> —
an object that acts as a recipe for the application.</p> <!> <!> <p>The model runs remotely, on Modal’s cloud, which means we need to <!>.</p> <p>Below, we start from a lightweight base Linux image
and then install our system and Python dependencies,
like Hugging Face’s <code>diffusers</code> library and <code>torch</code>.</p> <!> <!> <p>We also need the parameters of the model remotely.
They can be loaded at runtime from Hugging Face,
based on a repository ID and a revision (aka a commit SHA).</p> <!> <p>Hugging Face will also cache the weights to disk once they’re downloaded.
But Modal Functions are serverless, and so even disks are ephemeral,
which means the weights would get re-downloaded every time we spin up a new instance.</p> <p>We can fix this — without any modifications to Hugging Face’s model loading code! —
by pointing the Hugging Face cache at a <!>. For more on storing model weights on Modal, see <!>.</p> <!> <!> <p>Contemporary video models can take a long time to run and they produce large outputs.
That makes them a great candidate for storage on Modal Volumes as well.
Python code running outside of Modal can also access this storage, as we’ll see below.</p> <!> <!> <p>We wrap the inference logic in a Modal <!> that ensures models are loaded and then moved to the GPU once when a new instance
starts, rather than every time we run it.</p> <p>The <code>run</code> function just wraps a <code>diffusers</code> pipeline.
It saves the generated video to a Modal Volume, and returns the filename.</p> <p>We also include a <code>web</code> wrapper that makes it possible
to trigger inference via an API call.
For details, see the <code>/docs</code> route of the URL ending in <code>inference-web.modal.run</code> that appears when you deploy the app.</p> <!> <!> <p>We add a <!> that calls the <code>Inference.run</code> method to run inference from the command line.
The function’s parameters are automatically turned into a CLI.</p> <p>Run it with</p> <!> <p>You can also pass <code>--help</code> to see the full list of arguments.</p> <!> <!> <p>The Modal <code>Cls</code> above also included a <!>,
which adds a simple web API to the inference method.</p> <p>To try it out, run</p> <!> <p>copy the printed URL ending in <code>inference-web.modal.run</code>,
and add <code>/docs</code> to the end. This will bring up the interactive
Swagger/OpenAPI docs for the endpoint.</p> <!> <p>Lastly, we add a simple front-end web UI (written in Alpine.js) for
our image to video backend.</p> <p>This is also deployed when you run</p> <!> <p>The <code>Inference</code> class will serve multiple users from its own auto-scaling pool of warm GPU containers automatically,
and they will spin down when there are no requests.</p> <!>`,3);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`animate-images-with-lightricks-ltx-video-via-cli-api-and-web-ui`,children:(e,t)=>{l(),i(e,r(`Animate images with Lightricks LTX-Video via CLI, API, and web UI`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://huggingface.co/Lightricks/LTX-Video`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LTX-Video`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6),v=e(_);v.muted=!0,n(_);var y=c(_,2);u(y,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var C=c(y,2);p(C,{code:`import%20io%0Aimport%20random%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Annotated%2C%20Optional%0A%0Aimport%20fastapi%0Aimport%20modal%0A`,lang:`python`});var w=c(C,2);h(c(e(w)),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(T,{code:`app%20%3D%20modal.App(%22example-image-to-video%22)%0A`,lang:`python`});var E=c(T,2);d(E,{id:`configuring-dependencies`,children:(e,t)=>{l(),i(e,r(`Configuring dependencies`))},$$slots:{default:!0}});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`define the environment it runs in`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,4);p(O,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22python3-opencv%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.4.0%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.32.2%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.8%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio%3D%3D2.37.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio-ffmpeg%3D%3D0.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python%3D%3D4.11.0.86%22%2C%0A%20%20%20%20%20%20%20%20%22pillow%3D%3D11.1.0%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.21.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.49.0%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var k=c(O,2);u(k,{id:`storing-model-weights-on-modal`,children:(e,t)=>{l(),i(e,r(`Storing model weights on Modal`))},$$slots:{default:!0}});var A=c(k,4);p(A,{code:`MODEL_ID%20%3D%20%22Lightricks%2FLTX-Video%22%0AMODEL_REVISION_ID%20%3D%20%22a6d59ee37c13c58261aa79027d3e41cd41960925%22%0A`,lang:`python`});var j=c(A,4),M=c(e(j));h(M,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),h(c(M,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(j);var N=c(j,2);p(N,{code:`model_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0AMODEL_PATH%20%3D%20%22%2Fmodels%22%20%20%23%20where%20the%20Volume%20will%20appear%20on%20our%20Functions'%20filesystems%0A%0Aimage%20%3D%20image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%20%20%20%20%22HF_HUB_CACHE%22%3A%20MODEL_PATH%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var P=c(N,2);u(P,{id:`storing-model-outputs-on-modal`,children:(e,t)=>{l(),i(e,r(`Storing model outputs on Modal`))},$$slots:{default:!0}});var F=c(P,4);p(F,{code:`OUTPUT_PATH%20%3D%20%22%2Foutputs%22%0Aoutput_volume%20%3D%20modal.Volume.from_name(%22outputs%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var I=c(F,2);u(I,{id:`implementing-ltx-video-inference-on-modal`,children:(e,t)=>{l(),i(e,r(`Implementing LTX-Video inference on Modal`))},$$slots:{default:!0}});var L=c(I,2);h(c(e(L)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,6);p(R,{code:`with%20image.imports()%3A%20%20%23%20loaded%20on%20all%20of%20our%20remote%20Functions%0A%20%20%20%20import%20diffusers%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20PIL%20import%20Image%0A%0AMINUTES%20%3D%2060%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20scaledown_window%3D10%20*%20MINUTES%2C%0A%20%20%20%20volumes%3D%7BMODEL_PATH%3A%20model_volume%2C%20OUTPUT_PATH%3A%20output_volume%7D%2C%0A)%0Aclass%20Inference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_pipeline(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.LTXImageToVideoPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20image_bytes%3A%20bytes%2C%0A%20%20%20%20%20%20%20%20prompt%3A%20str%2C%0A%20%20%20%20%20%20%20%20negative_prompt%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20num_frames%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20seed%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20negative_prompt%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%0A%20%20%20%20%20%20%20%20%20%20%20%20or%20%22worst%20quality%2C%20inconsistent%20motion%2C%20blurry%2C%20jittery%2C%20distorted%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20width%20%3D%20768%0A%20%20%20%20%20%20%20%20height%20%3D%20512%0A%20%20%20%20%20%20%20%20num_frames%20%3D%20num_frames%20or%2025%0A%20%20%20%20%20%20%20%20num_inference_steps%20%3D%20num_inference_steps%20or%2050%0A%20%20%20%20%20%20%20%20seed%20%3D%20seed%20or%20random.randint(0%2C%202**32%20-%201)%0A%20%20%20%20%20%20%20%20print(f%22Seeding%20RNG%20with%3A%20%7Bseed%7D%22)%0A%20%20%20%20%20%20%20%20torch.manual_seed(seed)%0A%0A%20%20%20%20%20%20%20%20image%20%3D%20diffusers.utils.load_image(Image.open(io.BytesIO(image_bytes)))%0A%0A%20%20%20%20%20%20%20%20video%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20width%3Dwidth%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20height%3Dheight%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20).frames%5B0%5D%0A%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bseed%7D_%7B''.join(c%20if%20c.isalnum()%20else%20'-'%20for%20c%20in%20prompt%5B%3A100%5D)%7D.mp4%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20diffusers.utils.export_to_video(%0A%20%20%20%20%20%20%20%20%20%20%20%20video%2C%20f%22%7BPath(OUTPUT_PATH)%20%2F%20mp4_name%7D%22%2C%20fps%3D24%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20output_volume.commit()%0A%20%20%20%20%20%20%20%20torch.cuda.empty_cache()%20%20%23%20reduce%20fragmentation%0A%20%20%20%20%20%20%20%20return%20mp4_name%0A%0A%20%20%20%20%40modal.fastapi_endpoint(method%3D%22POST%22%2C%20docs%3DTrue)%0A%20%20%20%20def%20web(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20image_bytes%3A%20Annotated%5Bbytes%2C%20fastapi.File()%5D%2C%0A%20%20%20%20%20%20%20%20prompt%3A%20str%2C%0A%20%20%20%20%20%20%20%20negative_prompt%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20num_frames%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20seed%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20)%20-%3E%20fastapi.Response%3A%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20self.run.local(%20%20%23%20run%20in%20the%20same%20container%0A%20%20%20%20%20%20%20%20%20%20%20%20image_bytes%3Dimage_bytes%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20fastapi.responses.FileResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20path%3Df%22%7BPath(OUTPUT_PATH)%20%2F%20mp4_name%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20media_type%3D%22video%2Fmp4%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20filename%3Dmp4_name%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`generating-videos-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Generating videos from the command line`))},$$slots:{default:!0}});var B=c(z,2);h(c(e(B)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`local entrypoint`))},$$slots:{default:!0}}),l(3),n(B);var V=c(B,4);p(V,{code:`modal%20run%20image_to_video.py%20--prompt%20%22A%20cat%20looking%20out%20the%20window%20at%20a%20snowy%20mountain%22%20--image-path%20%2Fpath%2Fto%2Fcat.jpg`,lang:`bash`});var H=c(V,4);p(H,{code:`%40app.local_entrypoint()%0Adef%20entrypoint(%0A%20%20%20%20image_path%3A%20str%2C%0A%20%20%20%20prompt%3A%20str%2C%0A%20%20%20%20negative_prompt%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20num_frames%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20num_inference_steps%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20seed%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20twice%3A%20bool%20%3D%20True%2C%0A)%3A%0A%20%20%20%20import%20os%0A%20%20%20%20import%20urllib.request%0A%0A%20%20%20%20print(f%22%F0%9F%8E%A5%20Generating%20a%20video%20from%20the%20image%20at%20%7Bimage_path%7D%22)%0A%20%20%20%20print(f%22%F0%9F%8E%A5%20using%20the%20prompt%20%7Bprompt%7D%22)%0A%0A%20%20%20%20if%20image_path.startswith((%22http%3A%2F%2F%22%2C%20%22https%3A%2F%2F%22))%3A%0A%20%20%20%20%20%20%20%20image_bytes%20%3D%20urllib.request.urlopen(image_path).read()%0A%20%20%20%20elif%20os.path.isfile(image_path)%3A%0A%20%20%20%20%20%20%20%20image_bytes%20%3D%20Path(image_path).read_bytes()%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(f%22%7Bimage_path%7D%20is%20not%20a%20valid%20file%20or%20URL.%22)%0A%0A%20%20%20%20inference_service%20%3D%20Inference()%0A%0A%20%20%20%20for%20_%20in%20range(1%20%2B%20twice)%3A%0A%20%20%20%20%20%20%20%20start%20%3D%20time.time()%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20inference_service.run.remote(%0A%20%20%20%20%20%20%20%20%20%20%20%20image_bytes%3Dimage_bytes%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20duration%20%3D%20time.time()%20-%20start%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20Generated%20video%20in%20%7Bduration%3A.3f%7Ds%22)%0A%0A%20%20%20%20%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fimage_to_video%22)%0A%20%20%20%20%20%20%20%20output_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%20%20%20%20output_path%20%3D%20output_dir%20%2F%20mp4_name%0A%20%20%20%20%20%20%20%20%23%20read%20in%20the%20file%20from%20the%20Modal%20Volume%2C%20then%20write%20it%20to%20the%20local%20disk%0A%20%20%20%20%20%20%20%20output_path.write_bytes(b%22%22.join(output_volume.read_file(mp4_name)))%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20Video%20saved%20to%20%7Boutput_path%7D%22)%0A%0A`,lang:`python`});var U=c(H,2);u(U,{id:`generating-videos-via-an-api`,children:(e,t)=>{l(),i(e,r(`Generating videos via an API`))},$$slots:{default:!0}});var W=c(U,2);h(c(e(W),3),{href:`https://modal.com/docs/examples/basic_web`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(W);var G=c(W,4);p(G,{code:`modal%20deploy%20image_to_video.py`,lang:`bash`});var K=c(G,4);u(K,{id:`generating-videos-in-a-web-ui`,children:(e,t)=>{l(),i(e,r(`Generating videos in a web UI`))},$$slots:{default:!0}});var q=c(K,6);p(q,{code:`modal%20deploy%20image_to_video.py.`,lang:`bash`}),p(c(q,4),{code:`frontend_path%20%3D%20Path(__file__).parent%20%2F%20%22frontend%22%0A%0Aweb_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22jinja2%3D%3D3.1.5%22%2C%20%22fastapi%5Bstandard%5D%3D%3D0.115.8%22)%0A%20%20%20%20.add_local_dir(%20%20%23%20mount%20frontend%2Fclient%20code%0A%20%20%20%20%20%20%20%20frontend_path%2C%20remote_path%3D%22%2Fassets%22%0A%20%20%20%20)%0A)%0A%0A%0A%40app.function(image%3Dweb_image)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20fastapi.staticfiles%0A%20%20%20%20import%20fastapi.templating%0A%0A%20%20%20%20web_app%20%3D%20fastapi.FastAPI()%0A%20%20%20%20templates%20%3D%20fastapi.templating.Jinja2Templates(directory%3D%22%2Fassets%22)%0A%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20async%20def%20read_root(request%3A%20fastapi.Request)%3A%0A%20%20%20%20%20%20%20%20return%20templates.TemplateResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22index.html%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22request%22%3A%20request%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22inference_url%22%3A%20Inference().web.get_web_url()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22model_name%22%3A%20%22LTX-Video%20Image%20to%20Video%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22default_prompt%22%3A%20%22A%20young%20girl%20stands%20calmly%20in%20the%20foreground%2C%20looking%20directly%20at%20the%20camera%2C%20as%20a%20house%20fire%20rages%20in%20the%20background.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20web_app.mount(%0A%20%20%20%20%20%20%20%20%22%2Fstatic%22%2C%0A%20%20%20%20%20%20%20%20fastapi.staticfiles.StaticFiles(directory%3D%22%2Fassets%22)%2C%0A%20%20%20%20%20%20%20%20name%3D%22static%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=CHEKHKM1.js.map
