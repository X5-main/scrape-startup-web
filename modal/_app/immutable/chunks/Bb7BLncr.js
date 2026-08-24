(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`94db963d-d648-4098-9c80-2c94a6ded6ae`,e._sentryDebugIdIdentifier=`sentry-dbid-94db963d-d648-4098-9c80-2c94a6ded6ae`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Text-to-video generation with Mochi`,id:`text-to-video-generation-with-mochi`,children:[{depth:2,value:`Setting up the environment for Mochi`,id:`setting-up-the-environment-for-mochi`},{depth:2,value:`Saving outputs`,id:`saving-outputs`},{depth:2,value:`Downloading the model`,id:`downloading-the-model`},{depth:2,value:`Setting up our Mochi class`,id:`setting-up-our-mochi-class`},{depth:2,value:`Running Mochi inference`,id:`running-mochi-inference`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Text-to-video generation with Mochi

This example demonstrates how to run the [Mochi 1](https://github.com/genmoai/models)
video generation model by [Genmo](https://www.genmo.ai/) on Modal.

Here's one that we generated, inspired by our logo:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/modal-logo-splat.mp4" type="video/mp4" />
</video>
</center>

Note that the Mochi model, at time of writing,
requires several minutes on one H100 to produce
a high-quality clip of even a few seconds.
So a single video generation therefore costs about $0.33
at our ~$5/hr rate for H100s.

Keep your eyes peeled for improved efficiency
as the open source community works on this new model.
We welcome PRs to improve the performance of this example!

## Setting up the environment for Mochi

At the time of writing, Mochi is supported natively in the [\`diffusers\`](https://github.com/huggingface/diffusers) library,
but only in a pre-release version.
So we'll need to install \`diffusers\` and \`transformers\` from GitHub.

\`\`\`python
import string
import time
from pathlib import Path

import modal

app = modal.App("example-mochi")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .uv_pip_install(
        "torch==2.5.1",
        "accelerate==1.1.1",
        "huggingface-hub==0.36.0",
        "sentencepiece==0.2.0",
        "imageio==2.36.0",
        "imageio-ffmpeg==0.5.1",
        "git+https://github.com/huggingface/transformers@30335093276212ce74938bdfd85bfd5df31a668a",
        "git+https://github.com/huggingface/diffusers@99c0483b67427de467f11aa35d54678fd36a7ea2",
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",
            "HF_HOME": "/models",
        }
    )
)

\`\`\`

## Saving outputs

On Modal, we save large or expensive-to-compute data to
[distributed Volumes](https://modal.com/docs/guide/volumes)

We'll use this for saving our Mochi weights, as well as our video outputs.

\`\`\`python
VOLUME_NAME = "mochi-outputs"
outputs = modal.Volume.from_name(VOLUME_NAME, create_if_missing=True)
OUTPUTS_PATH = Path("/outputs")  # remote path for saving video outputs

MODEL_VOLUME_NAME = "mochi-model"
model = modal.Volume.from_name(MODEL_VOLUME_NAME, create_if_missing=True)
MODEL_PATH = Path("/models")  # remote path for saving model weights

MINUTES = 60
HOURS = 60 * MINUTES

\`\`\`

## Downloading the model

We download the model weights into Volume cache to speed up cold starts. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

This download takes five minutes or more, depending on traffic
and network speed.

If you want to launch the download first,
before running the rest of the code,
use the following command from the folder containing this file:

\`\`\`bash
modal run --detach mochi::download_model
\`\`\`

The \`--detach\` flag ensures the download will continue
even if you close your terminal or shut down your computer
while it's running.

\`\`\`python
with image.imports():
    import torch
    from diffusers import MochiPipeline
    from diffusers.utils import export_to_video


@app.function(
    image=image,
    volumes={
        MODEL_PATH: model,
    },
    timeout=20 * MINUTES,
)
def download_model(revision="83359d26a7e2bbe200ecbfda8ebff850fd03b545"):
    # uses HF_HOME to point download to the model volume
    MochiPipeline.from_pretrained(
        "genmo/mochi-1-preview",
        torch_dtype=torch.bfloat16,
        revision=revision,
    )


\`\`\`

## Setting up our Mochi class

We'll use the \`@cls\` decorator to define a [Modal Class](https://modal.com/docs/guide/lifecycle-functions)
which we use to control the lifecycle of our cloud container.

We configure it to use our image, the distributed volume, and a single H100 GPU.

\`\`\`python
@app.cls(
    image=image,
    volumes={
        OUTPUTS_PATH: outputs,  # videos will be saved to a distributed volume
        MODEL_PATH: model,
    },
    gpu="H100",
    timeout=1 * HOURS,
)
class Mochi:
    @modal.enter()
    def load_model(self):
        # our HF_HOME env var points to the model volume as the cache
        self.pipe = MochiPipeline.from_pretrained(
            "genmo/mochi-1-preview",
            torch_dtype=torch.bfloat16,
        )
        self.pipe.enable_model_cpu_offload()
        self.pipe.enable_vae_tiling()

    @modal.method()
    def generate(
        self,
        prompt,
        negative_prompt="",
        num_inference_steps=200,
        guidance_scale=4.5,
        num_frames=19,
    ):
        frames = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            num_frames=num_frames,
        ).frames[0]

        # save to disk using prompt as filename
        mp4_name = slugify(prompt)
        export_to_video(frames, Path(OUTPUTS_PATH) / mp4_name)
        outputs.commit()
        return mp4_name


\`\`\`

## Running Mochi inference

We can trigger Mochi inference from our local machine by running the code in
the local entrypoint below.

It ensures the model is downloaded to a remote volume,
spins up a new replica to generate a video, also saved remotely,
and then downloads the video to the local machine.

You can trigger it with:
\`\`\`bash
modal run --detach mochi
\`\`\`

Optional command line flags can be viewed with:
\`\`\`bash
modal run mochi --help
\`\`\`

Using these flags, you can tweak your generation from the command line:
\`\`\`bash
modal run --detach mochi --prompt="a cat playing drums in a jazz ensemble" --num-inference-steps=64
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    prompt="Close-up of a chameleon's eye, with its scaly skin changing color. Ultra high resolution 4k.",
    negative_prompt="",
    num_inference_steps=200,
    guidance_scale=4.5,
    num_frames=19,  # produces ~1s of video
):
    mochi = Mochi()
    mp4_name = mochi.generate.remote(
        prompt=str(prompt),
        negative_prompt=str(negative_prompt),
        num_inference_steps=int(num_inference_steps),
        guidance_scale=float(guidance_scale),
        num_frames=int(num_frames),
    )
    print(f"🍡 video saved to volume at {mp4_name}")

    local_dir = Path("/tmp/mochi")
    local_dir.mkdir(exist_ok=True, parents=True)
    local_path = local_dir / mp4_name
    local_path.write_bytes(b"".join(outputs.read_file(mp4_name)))
    print(f"🍡 video saved locally at {local_path}")


\`\`\`

## Addenda

The remainder of the code in this file is utility code.

\`\`\`python
def slugify(prompt):
    for char in string.punctuation:
        prompt = prompt.replace(char, "")
    prompt = prompt.replace(" ", "_")
    prompt = prompt[:230]  # since filenames can't be longer than 255 characters
    mp4_name = str(int(time.time())) + "_" + prompt + ".mp4"
    return mp4_name

\`\`\`
`,meta:{title:`Text-to-video generation with Mochi`,description:`This example demonstrates how to run the Mochi 1 video generation model by Genmo on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>diffusers</code>`),b=t(`<!> <p>This example demonstrates how to run the <!> video generation model by <!> on Modal.</p> <p>Here’s one that we generated, inspired by our logo:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/modal-logo-splat.mp4" type="video/mp4"/></video></center> <p>Note that the Mochi model, at time of writing,
requires several minutes on one H100 to produce
a high-quality clip of even a few seconds.
So a single video generation therefore costs about $0.33
at our ~$5/hr rate for H100s.</p> <p>Keep your eyes peeled for improved efficiency
as the open source community works on this new model.
We welcome PRs to improve the performance of this example!</p> <!> <p>At the time of writing, Mochi is supported natively in the <!> library,
but only in a pre-release version.
So we’ll need to install <code>diffusers</code> and <code>transformers</code> from GitHub.</p> <!> <!> <p>On Modal, we save large or expensive-to-compute data to <!></p> <p>We’ll use this for saving our Mochi weights, as well as our video outputs.</p> <!> <!> <p>We download the model weights into Volume cache to speed up cold starts. For more on storing model weights on Modal, see <!>.</p> <p>This download takes five minutes or more, depending on traffic
and network speed.</p> <p>If you want to launch the download first,
before running the rest of the code,
use the following command from the folder containing this file:</p> <!> <p>The <code>--detach</code> flag ensures the download will continue
even if you close your terminal or shut down your computer
while it’s running.</p> <!> <!> <p>We’ll use the <code>@cls</code> decorator to define a <!> which we use to control the lifecycle of our cloud container.</p> <p>We configure it to use our image, the distributed volume, and a single H100 GPU.</p> <!> <!> <p>We can trigger Mochi inference from our local machine by running the code in
the local entrypoint below.</p> <p>It ensures the model is downloaded to a remote volume,
spins up a new replica to generate a video, also saved remotely,
and then downloads the video to the local machine.</p> <p>You can trigger it with:</p> <!> <p>Optional command line flags can be viewed with:</p> <!> <p>Using these flags, you can tweak your generation from the command line:</p> <!> <!> <!> <p>The remainder of the code in this file is utility code.</p> <!>`,3);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`text-to-video-generation-with-mochi`,children:(e,t)=>{l(),i(e,r(`Text-to-video generation with Mochi`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://github.com/genmoai/models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mochi 1`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://www.genmo.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Genmo`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,4),v=e(_);v.muted=!0,n(_);var x=c(_,6);u(x,{id:`setting-up-the-environment-for-mochi`,children:(e,t)=>{l(),i(e,r(`Setting up the environment for Mochi`))},$$slots:{default:!0}});var S=c(x,2);m(c(e(S)),{href:`https://github.com/huggingface/diffusers`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(5),n(S);var C=c(S,2);f(C,{code:`import%20string%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-mochi%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.1.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio%3D%3D2.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio-ffmpeg%3D%3D0.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22git%2Bhttps%3A%2F%2Fgithub.com%2Fhuggingface%2Ftransformers%4030335093276212ce74938bdfd85bfd5df31a668a%22%2C%0A%20%20%20%20%20%20%20%20%22git%2Bhttps%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers%4099c0483b67427de467f11aa35d54678fd36a7ea2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20%22%2Fmodels%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`saving-outputs`,children:(e,t)=>{l(),i(e,r(`Saving outputs`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`distributed Volumes`))},$$slots:{default:!0}}),n(T);var E=c(T,4);f(E,{code:`VOLUME_NAME%20%3D%20%22mochi-outputs%22%0Aoutputs%20%3D%20modal.Volume.from_name(VOLUME_NAME%2C%20create_if_missing%3DTrue)%0AOUTPUTS_PATH%20%3D%20Path(%22%2Foutputs%22)%20%20%23%20remote%20path%20for%20saving%20video%20outputs%0A%0AMODEL_VOLUME_NAME%20%3D%20%22mochi-model%22%0Amodel%20%3D%20modal.Volume.from_name(MODEL_VOLUME_NAME%2C%20create_if_missing%3DTrue)%0AMODEL_PATH%20%3D%20Path(%22%2Fmodels%22)%20%20%23%20remote%20path%20for%20saving%20model%20weights%0A%0AMINUTES%20%3D%2060%0AHOURS%20%3D%2060%20*%20MINUTES%0A`,lang:`python`});var D=c(E,2);u(D,{id:`downloading-the-model`,children:(e,t)=>{l(),i(e,r(`Downloading the model`))},$$slots:{default:!0}});var O=c(D,2);m(c(e(O)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,6);f(k,{code:`modal%20run%20--detach%20mochi%3A%3Adownload_model`,lang:`bash`});var A=c(k,4);f(A,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20diffusers%20import%20MochiPipeline%0A%20%20%20%20from%20diffusers.utils%20import%20export_to_video%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20MODEL_PATH%3A%20model%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20timeout%3D20%20*%20MINUTES%2C%0A)%0Adef%20download_model(revision%3D%2283359d26a7e2bbe200ecbfda8ebff850fd03b545%22)%3A%0A%20%20%20%20%23%20uses%20HF_HOME%20to%20point%20download%20to%20the%20model%20volume%0A%20%20%20%20MochiPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%22genmo%2Fmochi-1-preview%22%2C%0A%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20revision%3Drevision%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var j=c(A,2);u(j,{id:`setting-up-our-mochi-class`,children:(e,t)=>{l(),i(e,r(`Setting up our Mochi class`))},$$slots:{default:!0}});var M=c(j,2);m(c(e(M),3),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Class`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,4);f(N,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20OUTPUTS_PATH%3A%20outputs%2C%20%20%23%20videos%20will%20be%20saved%20to%20a%20distributed%20volume%0A%20%20%20%20%20%20%20%20MODEL_PATH%3A%20model%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D1%20*%20HOURS%2C%0A)%0Aclass%20Mochi%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20%23%20our%20HF_HOME%20env%20var%20points%20to%20the%20model%20volume%20as%20the%20cache%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20MochiPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22genmo%2Fmochi-1-preview%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.pipe.enable_model_cpu_offload()%0A%20%20%20%20%20%20%20%20self.pipe.enable_vae_tiling()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20negative_prompt%3D%22%22%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3D200%2C%0A%20%20%20%20%20%20%20%20guidance_scale%3D4.5%2C%0A%20%20%20%20%20%20%20%20num_frames%3D19%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20frames%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3Dnegative_prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dnum_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3Dguidance_scale%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3Dnum_frames%2C%0A%20%20%20%20%20%20%20%20).frames%5B0%5D%0A%0A%20%20%20%20%20%20%20%20%23%20save%20to%20disk%20using%20prompt%20as%20filename%0A%20%20%20%20%20%20%20%20mp4_name%20%3D%20slugify(prompt)%0A%20%20%20%20%20%20%20%20export_to_video(frames%2C%20Path(OUTPUTS_PATH)%20%2F%20mp4_name)%0A%20%20%20%20%20%20%20%20outputs.commit()%0A%20%20%20%20%20%20%20%20return%20mp4_name%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`running-mochi-inference`,children:(e,t)=>{l(),i(e,r(`Running Mochi inference`))},$$slots:{default:!0}});var F=c(P,8);f(F,{code:`modal%20run%20--detach%20mochi`,lang:`bash`});var I=c(F,4);f(I,{code:`modal%20run%20mochi%20--help`,lang:`bash`});var L=c(I,4);f(L,{code:`modal%20run%20--detach%20mochi%20--prompt%3D%22a%20cat%20playing%20drums%20in%20a%20jazz%20ensemble%22%20--num-inference-steps%3D64`,lang:`bash`});var R=c(L,2);f(R,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3D%22Close-up%20of%20a%20chameleon's%20eye%2C%20with%20its%20scaly%20skin%20changing%20color.%20Ultra%20high%20resolution%204k.%22%2C%0A%20%20%20%20negative_prompt%3D%22%22%2C%0A%20%20%20%20num_inference_steps%3D200%2C%0A%20%20%20%20guidance_scale%3D4.5%2C%0A%20%20%20%20num_frames%3D19%2C%20%20%23%20produces%20~1s%20of%20video%0A)%3A%0A%20%20%20%20mochi%20%3D%20Mochi()%0A%20%20%20%20mp4_name%20%3D%20mochi.generate.remote(%0A%20%20%20%20%20%20%20%20prompt%3Dstr(prompt)%2C%0A%20%20%20%20%20%20%20%20negative_prompt%3Dstr(negative_prompt)%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3Dint(num_inference_steps)%2C%0A%20%20%20%20%20%20%20%20guidance_scale%3Dfloat(guidance_scale)%2C%0A%20%20%20%20%20%20%20%20num_frames%3Dint(num_frames)%2C%0A%20%20%20%20)%0A%20%20%20%20print(f%22%F0%9F%8D%A1%20video%20saved%20to%20volume%20at%20%7Bmp4_name%7D%22)%0A%0A%20%20%20%20local_dir%20%3D%20Path(%22%2Ftmp%2Fmochi%22)%0A%20%20%20%20local_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20local_path%20%3D%20local_dir%20%2F%20mp4_name%0A%20%20%20%20local_path.write_bytes(b%22%22.join(outputs.read_file(mp4_name)))%0A%20%20%20%20print(f%22%F0%9F%8D%A1%20video%20saved%20locally%20at%20%7Blocal_path%7D%22)%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),f(c(z,4),{code:`def%20slugify(prompt)%3A%0A%20%20%20%20for%20char%20in%20string.punctuation%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20prompt.replace(char%2C%20%22%22)%0A%20%20%20%20prompt%20%3D%20prompt.replace(%22%20%22%2C%20%22_%22)%0A%20%20%20%20prompt%20%3D%20prompt%5B%3A230%5D%20%20%23%20since%20filenames%20can't%20be%20longer%20than%20255%20characters%0A%20%20%20%20mp4_name%20%3D%20str(int(time.time()))%20%2B%20%22_%22%20%2B%20prompt%20%2B%20%22.mp4%22%0A%20%20%20%20return%20mp4_name%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=Bb7BLncr.js.map
