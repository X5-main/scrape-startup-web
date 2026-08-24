(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a40c376d-62ae-42f4-898e-2a5d0cc6093c`,e._sentryDebugIdIdentifier=`sentry-dbid-a40c376d-62ae-42f4-898e-2a5d0cc6093c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Generate videos from prompts with Lightricks LTX-Video`,id:`generate-videos-from-prompts-with-lightricks-ltx-video`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Storing data on Modal Volumes`,id:`storing-data-on-modal-volumes`},{depth:2,value:`Setting up our LTX class`,id:`setting-up-our-ltx-class`},{depth:2,value:`Generate videos from the command line`,id:`generate-videos-from-the-command-line`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Generate videos from prompts with Lightricks LTX-Video

This example demonstrates how to run the [LTX-Video](https://github.com/Lightricks/LTX-Video)
video generation model by [Lightricks](https://www.lightricks.com/) on Modal.

LTX-Video is fast! Generating a twenty second 480p video at moderate quality
takes as little as two seconds on a warm container.

Here's one that we generated:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/blonde-woman-blinking.mp4" type="video/mp4" />
</video>
</center>

## Setup

We start by importing dependencies we need locally,
defining a Modal [App](https://modal.com/docs/guide/apps),
and defining the container [Image](https://modal.com/docs/guide/images)
that our video model will run in.

\`\`\`python
import string
import time
from pathlib import Path
from typing import Optional

import modal

app = modal.App("example-ltx")

image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "accelerate==1.6.0",
        "diffusers==0.33.1",
        "huggingface-hub==0.36.0",
        "imageio==2.37.0",
        "imageio-ffmpeg==0.5.1",
        "sentencepiece==0.2.0",
        "torch==2.7.0",
        "transformers==4.51.3",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)

\`\`\`

## Storing data on Modal Volumes

On Modal, we save large or expensive-to-compute data to
[distributed Volumes](https://modal.com/docs/guide/volumes)
that are accessible both locally and remotely.

We'll store the LTX-Video model's weights and the outputs we generate
on Modal Volumes.

We store the outputs on a Modal Volume so that clients
don't need to sit around waiting for the video to be generated.

\`\`\`python
VOLUME_NAME = "ltx-outputs"
outputs = modal.Volume.from_name(VOLUME_NAME, create_if_missing=True)
OUTPUTS_PATH = Path("/outputs")

\`\`\`

We store the weights on a Modal Volume so that we don't
have to fetch them from the Hugging Face Hub every time
a container boots. This download takes about two minutes,
depending on traffic and network speed.

\`\`\`python
MODEL_VOLUME_NAME = "ltx-model"
model = modal.Volume.from_name(MODEL_VOLUME_NAME, create_if_missing=True)

\`\`\`

We don't have to change any of the Hugging Face code to do this --
we just set the location of Hugging Face's cache to be on a Volume
using the \`HF_HOME\` environment variable.

\`\`\`python
MODEL_PATH = Path("/models")
image = image.env({"HF_HOME": str(MODEL_PATH)})

\`\`\`

For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

## Setting up our LTX class

We use the \`@cls\` decorator to specify the infrastructure our inference function needs,
as defined above.

That decorator also gives us control over the
[lifecycle](https://modal.com/docs/guide/lifecycle-functions)
of our cloud container.

Specifically, we use the \`enter\` method to load the model into GPU memory
(from the Volume if it's present or the Hub if it's not)
before the container is marked ready for inputs.

This helps reduce tail latencies caused by cold starts.
For details and more tips, see [this guide](https://modal.com/docs/guide/cold-start#cold-start-performance).

The actual inference code is in a \`modal.method\` of the class.

\`\`\`python
MINUTES = 60  # seconds


@app.cls(
    image=image,  # use our container Image
    volumes={OUTPUTS_PATH: outputs, MODEL_PATH: model},  # attach our Volumes
    gpu="H100",  # use a big, fast GPU
    timeout=10 * MINUTES,  # run inference for up to 10 minutes
    scaledown_window=15 * MINUTES,  # stay idle for 15 minutes before scaling down
)
class LTX:
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import DiffusionPipeline

        self.pipe = DiffusionPipeline.from_pretrained(
            "Lightricks/LTX-Video", torch_dtype=torch.bfloat16
        )
        self.pipe.to("cuda")

    @modal.method()
    def generate(
        self,
        prompt,
        negative_prompt="",
        num_inference_steps=200,
        guidance_scale=4.5,
        num_frames=19,
        width=704,
        height=480,
    ):
        from diffusers.utils import export_to_video

        frames = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            num_frames=num_frames,
            width=width,
            height=height,
        ).frames[0]

        # save to disk using prompt as filename
        mp4_name = slugify(prompt)
        export_to_video(frames, Path(OUTPUTS_PATH) / mp4_name)
        outputs.commit()
        return mp4_name


\`\`\`

## Generate videos from the command line

We trigger LTX-Video inference from our local machine by running the code in
the local entrypoint below with \`modal run\`.

It will spin up a new replica to generate a video.
Then it will, by default, generate a second video to demonstrate
the lower latency when hitting a warm container.

You can trigger inference with:

\`\`\`bash
modal run ltx
\`\`\`

All outputs are saved both locally and on a Modal Volume.
You can explore the contents of Modal Volumes from your Modal Dashboard
or from the command line with the \`modal volume\` command.

\`\`\`bash
modal volume ls ltx-outputs
\`\`\`

See \`modal volume --help\` for details.

Optional command line flags for the script can be viewed with:

\`\`\`bash
modal run ltx --help
\`\`\`

Using these flags, you can tweak your generation from the command line:

\`\`\`bash
modal run --detach ltx --prompt="a cat playing drums in a jazz ensemble" --num-inference-steps=64
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    prompt: Optional[str] = None,
    negative_prompt="worst quality, blurry, jittery, distorted",
    num_inference_steps: int = 10,  # 10 when testing, 100 or more when generating
    guidance_scale: float = 2.5,
    num_frames: int = 150,  # produces ~10s of video
    width: int = 704,
    height: int = 480,
    twice: bool = True,  # run twice to show cold start latency
):
    if prompt is None:
        prompt = DEFAULT_PROMPT

    ltx = LTX()

    def run():
        print(f"🎥 Generating a video from the prompt '{prompt}'")
        start = time.time()
        mp4_name = ltx.generate.remote(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            num_frames=num_frames,
            width=width,
            height=height,
        )
        duration = time.time() - start
        print(f"🎥 Client received video in {int(duration)}s")
        print(f"🎥 LTX video saved to Modal Volume at {mp4_name}")

        local_dir = Path("/tmp/ltx")
        local_dir.mkdir(exist_ok=True, parents=True)
        local_path = local_dir / mp4_name
        local_path.write_bytes(b"".join(outputs.read_file(mp4_name)))
        print(f"🎥 LTX video saved locally at {local_path}")

    run()

    if twice:
        print("🎥 Generating a video from a warm container")
        run()


\`\`\`

## Addenda

The remainder of the code in this file is utility code.

\`\`\`python
DEFAULT_PROMPT = (
    "The camera pans over a snow-covered mountain range,"
    " revealing a vast expanse of snow-capped peaks and valleys."
    " The mountains are covered in a thick layer of snow,"
    " with some areas appearing almost white while others have a slightly darker, almost grayish hue."
    " The peaks are jagged and irregular, with some rising sharply into the sky"
    " while others are more rounded."
    " The valleys are deep and narrow, with steep slopes that are also covered in snow."
    " The trees in the foreground are mostly bare, with only a few leaves remaining on their branches."
)


def slugify(prompt):
    for char in string.punctuation:
        prompt = prompt.replace(char, "")
    prompt = prompt.replace(" ", "_")
    prompt = prompt[:230]  # some OSes limit filenames to <256 chars
    mp4_name = str(int(time.time())) + "_" + prompt + ".mp4"
    return mp4_name

\`\`\`
`,meta:{title:`Generate videos from prompts with Lightricks LTX-Video`,description:`This example demonstrates how to run the LTX-Video video generation model by Lightricks on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to run the <!> video generation model by <!> on Modal.</p> <p>LTX-Video is fast! Generating a twenty second 480p video at moderate quality
takes as little as two seconds on a warm container.</p> <p>Here’s one that we generated:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/blonde-woman-blinking.mp4" type="video/mp4"/></video></center> <!> <p>We start by importing dependencies we need locally,
defining a Modal <!>,
and defining the container <!> that our video model will run in.</p> <!> <!> <p>On Modal, we save large or expensive-to-compute data to <!> that are accessible both locally and remotely.</p> <p>We’ll store the LTX-Video model’s weights and the outputs we generate
on Modal Volumes.</p> <p>We store the outputs on a Modal Volume so that clients
don’t need to sit around waiting for the video to be generated.</p> <!> <p>We store the weights on a Modal Volume so that we don’t
have to fetch them from the Hugging Face Hub every time
a container boots. This download takes about two minutes,
depending on traffic and network speed.</p> <!> <p>We don’t have to change any of the Hugging Face code to do this —
we just set the location of Hugging Face’s cache to be on a Volume
using the <code>HF_HOME</code> environment variable.</p> <!> <p>For more on storing model weights on Modal, see <!>.</p> <!> <p>We use the <code>@cls</code> decorator to specify the infrastructure our inference function needs,
as defined above.</p> <p>That decorator also gives us control over the <!> of our cloud container.</p> <p>Specifically, we use the <code>enter</code> method to load the model into GPU memory
(from the Volume if it’s present or the Hub if it’s not)
before the container is marked ready for inputs.</p> <p>This helps reduce tail latencies caused by cold starts.
For details and more tips, see <!>.</p> <p>The actual inference code is in a <code>modal.method</code> of the class.</p> <!> <!> <p>We trigger LTX-Video inference from our local machine by running the code in
the local entrypoint below with <code>modal run</code>.</p> <p>It will spin up a new replica to generate a video.
Then it will, by default, generate a second video to demonstrate
the lower latency when hitting a warm container.</p> <p>You can trigger inference with:</p> <!> <p>All outputs are saved both locally and on a Modal Volume.
You can explore the contents of Modal Volumes from your Modal Dashboard
or from the command line with the <code>modal volume</code> command.</p> <!> <p>See <code>modal volume --help</code> for details.</p> <p>Optional command line flags for the script can be viewed with:</p> <!> <p>Using these flags, you can tweak your generation from the command line:</p> <!> <!> <!> <p>The remainder of the code in this file is utility code.</p> <!>`,3);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`generate-videos-from-prompts-with-lightricks-ltx-video`,children:(e,t)=>{l(),i(e,r(`Generate videos from prompts with Lightricks LTX-Video`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://github.com/Lightricks/LTX-Video`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LTX-Video`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://www.lightricks.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lightricks`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,6),v=e(_);v.muted=!0,n(_);var b=c(_,2);u(b,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var x=c(b,2),S=c(e(x));m(S,{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),m(c(S,2),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(x);var C=c(x,2);f(C,{code:`import%20string%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-ltx%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.33.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio%3D%3D2.37.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio-ffmpeg%3D%3D0.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.51.3%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%0A)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`storing-data-on-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Storing data on Modal Volumes`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`distributed Volumes`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,6);f(E,{code:`VOLUME_NAME%20%3D%20%22ltx-outputs%22%0Aoutputs%20%3D%20modal.Volume.from_name(VOLUME_NAME%2C%20create_if_missing%3DTrue)%0AOUTPUTS_PATH%20%3D%20Path(%22%2Foutputs%22)%0A`,lang:`python`});var D=c(E,4);f(D,{code:`MODEL_VOLUME_NAME%20%3D%20%22ltx-model%22%0Amodel%20%3D%20modal.Volume.from_name(MODEL_VOLUME_NAME%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var O=c(D,4);f(O,{code:`MODEL_PATH%20%3D%20Path(%22%2Fmodels%22)%0Aimage%20%3D%20image.env(%7B%22HF_HOME%22%3A%20str(MODEL_PATH)%7D)%0A`,lang:`python`});var k=c(O,2);m(c(e(k)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);u(A,{id:`setting-up-our-ltx-class`,children:(e,t)=>{l(),i(e,r(`Setting up our LTX class`))},$$slots:{default:!0}});var j=c(A,4);m(c(e(j)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`lifecycle`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);m(c(e(M)),{href:`https://modal.com/docs/guide/cold-start#cold-start-performance`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,4);f(N,{code:`MINUTES%20%3D%2060%20%20%23%20seconds%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%20%20%23%20use%20our%20container%20Image%0A%20%20%20%20volumes%3D%7BOUTPUTS_PATH%3A%20outputs%2C%20MODEL_PATH%3A%20model%7D%2C%20%20%23%20attach%20our%20Volumes%0A%20%20%20%20gpu%3D%22H100%22%2C%20%20%23%20use%20a%20big%2C%20fast%20GPU%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%20%20%23%20run%20inference%20for%20up%20to%2010%20minutes%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%20%20%23%20stay%20idle%20for%2015%20minutes%20before%20scaling%20down%0A)%0Aclass%20LTX%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20diffusers%20import%20DiffusionPipeline%0A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20DiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Lightricks%2FLTX-Video%22%2C%20torch_dtype%3Dtorch.bfloat16%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.pipe.to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20negative_prompt%3D%22%22%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3D200%2C%0A%20%20%20%20%20%20%20%20guidance_scale%3D4.5%2C%0A%20%20%20%20%20%20%20%20num_frames%3D19%2C%0A%20%20%20%20%20%20%20%20width%3D704%2C%0A%20%20%20%20%20%20%20%20height%3D480%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20from%20diffusers.utils%20import%20export_to_video%0A%0A%20%20%20%20%20%20%20%20frames%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dguidance_scale%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20width%3Dwidth%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20height%3Dheight%2C%0A%20%20%20%20%20%20%20%20).frames%5B0%5D%0A%0A%20%20%20%20%20%20%20%20%23%20save%20to%20disk%20using%20prompt%20as%20filename%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20slugify(prompt)%0A%20%20%20%20%20%20%20%20export_to_video(frames%2C%20Path(OUTPUTS_PATH)%20%2F%20mp4_name)%0A%20%20%20%20%20%20%20%20outputs.commit()%0A%20%20%20%20%20%20%20%20return%20mp4_name%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`generate-videos-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Generate videos from the command line`))},$$slots:{default:!0}});var F=c(P,8);f(F,{code:`modal%20run%20ltx`,lang:`bash`});var I=c(F,4);f(I,{code:`modal%20volume%20ls%20ltx-outputs`,lang:`bash`});var L=c(I,6);f(L,{code:`modal%20run%20ltx%20--help`,lang:`bash`});var R=c(L,4);f(R,{code:`modal%20run%20--detach%20ltx%20--prompt%3D%22a%20cat%20playing%20drums%20in%20a%20jazz%20ensemble%22%20--num-inference-steps%3D64`,lang:`bash`});var z=c(R,2);f(z,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20negative_prompt%3D%22worst%20quality%2C%20blurry%2C%20jittery%2C%20distorted%22%2C%0A%20%20%20%20num_inference_steps%3A%20int%20%3D%2010%2C%20%20%23%2010%20when%20testing%2C%20100%20or%20more%20when%20generating%0A%20%20%20%20guidance_scale%3A%20float%20%3D%202.5%2C%0A%20%20%20%20num_frames%3A%20int%20%3D%20150%2C%20%20%23%20produces%20~10s%20of%20video%0A%20%20%20%20width%3A%20int%20%3D%20704%2C%0A%20%20%20%20height%3A%20int%20%3D%20480%2C%0A%20%20%20%20twice%3A%20bool%20%3D%20True%2C%20%20%23%20run%20twice%20to%20show%20cold%20start%20latency%0A)%3A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20DEFAULT_PROMPT%0A%0A%20%20%20%20ltx%20%3D%20LTX()%0A%0A%20%20%20%20def%20run()%3A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20Generating%20a%20video%20from%20the%20prompt%20'%7Bprompt%7D'%22)%0A%20%20%20%20%20%20%20%20start%20%3D%20time.time()%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20ltx.generate.remote(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dguidance_scale%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20width%3Dwidth%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20height%3Dheight%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20duration%20%3D%20time.time()%20-%20start%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20Client%20received%20video%20in%20%7Bint(duration)%7Ds%22)%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20LTX%20video%20saved%20to%20Modal%20Volume%20at%20%7Bmp4_name%7D%22)%0A%0A%20%20%20%20%20%20%20%20local_dir%20%3D%20Path(%22%2Ftmp%2Fltx%22)%0A%20%20%20%20%20%20%20%20local_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%20%20%20%20local_path%20%3D%20local_dir%20%2F%20mp4_name%0A%20%20%20%20%20%20%20%20local_path.write_bytes(b%22%22.join(outputs.read_file(mp4_name)))%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A5%20LTX%20video%20saved%20locally%20at%20%7Blocal_path%7D%22)%0A%0A%20%20%20%20run()%0A%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8E%A5%20Generating%20a%20video%20from%20a%20warm%20container%22)%0A%20%20%20%20%20%20%20%20run()%0A%0A`,lang:`python`});var B=c(z,2);u(B,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),f(c(B,4),{code:`DEFAULT_PROMPT%20%3D%20(%0A%20%20%20%20%22The%20camera%20pans%20over%20a%20snow-covered%20mountain%20range%2C%22%0A%20%20%20%20%22%20revealing%20a%20vast%20expanse%20of%20snow-capped%20peaks%20and%20valleys.%22%0A%20%20%20%20%22%20The%20mountains%20are%20covered%20in%20a%20thick%20layer%20of%20snow%2C%22%0A%20%20%20%20%22%20with%20some%20areas%20appearing%20almost%20white%20while%20others%20have%20a%20slightly%20darker%2C%20almost%20grayish%20hue.%22%0A%20%20%20%20%22%20The%20peaks%20are%20jagged%20and%20irregular%2C%20with%20some%20rising%20sharply%20into%20the%20sky%22%0A%20%20%20%20%22%20while%20others%20are%20more%20rounded.%22%0A%20%20%20%20%22%20The%20valleys%20are%20deep%20and%20narrow%2C%20with%20steep%20slopes%20that%20are%20also%20covered%20in%20snow.%22%0A%20%20%20%20%22%20The%20trees%20in%20the%20foreground%20are%20mostly%20bare%2C%20with%20only%20a%20few%20leaves%20remaining%20on%20their%20branches.%22%0A)%0A%0A%0Adef%20slugify(prompt)%3A%0A%20%20%20%20for%20char%20in%20string.punctuation%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20prompt.replace(char%2C%20%22%22)%0A%20%20%20%20prompt%20%3D%20prompt.replace(%22%20%22%2C%20%22_%22)%0A%20%20%20%20prompt%20%3D%20prompt%5B%3A230%5D%20%20%23%20some%20OSes%20limit%20filenames%20to%20%3C256%20chars%0A%20%20%20%20mp4_name%20%3D%20str(int(time.time()))%20%2B%20%22_%22%20%2B%20prompt%20%2B%20%22.mp4%22%0A%20%20%20%20return%20mp4_name%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=D8IL2sQl.js.map
