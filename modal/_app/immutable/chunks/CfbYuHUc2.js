(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d706187b-c38f-47c0-9e98-29aa7977a477`,e._sentryDebugIdIdentifier=`sentry-dbid-d706187b-c38f-47c0-9e98-29aa7977a477`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run Flux fast on H100s with torch.compile`,id:`run-flux-fast-on-h100s-with-torchcompile`,children:[{depth:2,value:`Setting up the image and dependencies`,id:`setting-up-the-image-and-dependencies`},{depth:2,value:`Defining a parameterized Model inference class`,id:`defining-a-parameterized-model-inference-class`},{depth:2,value:`Calling our inference function`,id:`calling-our-inference-function`},{depth:2,value:`Speeding up Flux with torch.compile`,id:`speeding-up-flux-with-torchcompile`}]}],rawContent:`# Run Flux fast on H100s with \`torch.compile\`

_Update: To speed up inference by another >2x, check out the additional optimization
techniques we tried in [this blog post](https://modal.com/blog/flux-3x-faster)!_

In this guide, we'll run Flux as fast as possible on Modal using open source tools.
We'll use \`torch.compile\` and NVIDIA H100 GPUs.

## Setting up the image and dependencies

\`\`\`python
import time
from io import BytesIO
from pathlib import Path

import modal

\`\`\`

We'll make use of the full [CUDA toolkit](https://modal.com/docs/guide/cuda)
in this example, so we'll build our container image off of the \`nvidia/cuda\` base.

\`\`\`python
cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  # includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

cuda_dev_image = modal.Image.from_registry(
    f"nvidia/cuda:{tag}", add_python="3.11"
).entrypoint([])

\`\`\`

Now we install most of our dependencies with \`apt\` and \`pip\`.
For Hugging Face's [Diffusers](https://github.com/huggingface/diffusers) library
we install from GitHub source and so pin to a specific commit.

PyTorch added faster attention kernels for Hopper GPUs in version 2.5.

\`\`\`python
diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

flux_image = (
    cuda_dev_image.apt_install(
        "git",
        "libglib2.0-0",
        "libsm6",
        "libxrender1",
        "libxext6",
        "ffmpeg",
        "libgl1",
    )
    .uv_pip_install(
        "invisible_watermark==0.2.0",
        "transformers==4.44.0",
        "huggingface-hub==0.36.0",
        "accelerate==0.33.0",
        "safetensors==0.4.4",
        "sentencepiece==0.2.0",
        "torch==2.5.0",
        f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
        "numpy<2",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HUB_CACHE": "/cache"})
)

\`\`\`

Later, we'll also use \`torch.compile\` to increase the speed further.
Torch compilation needs to be re-executed when each new container starts,
so we turn on some extra caching to reduce compile times for later containers.

\`\`\`python
flux_image = flux_image.env(
    {
        "TORCHINDUCTOR_CACHE_DIR": "/root/.inductor-cache",
        "TORCHINDUCTOR_FX_GRAPH_CACHE": "1",
    }
)

\`\`\`

Finally, we construct our Modal [App](https://modal.com/docs/reference/modal.App),
set its default image to the one we just constructed,
and import \`FluxPipeline\` for downloading and running Flux.1.

\`\`\`python
app = modal.App("example-flux", image=flux_image)

with flux_image.imports():
    import torch
    from diffusers import FluxPipeline

\`\`\`

## Defining a parameterized \`Model\` inference class

Next, we map the model's setup and inference code onto Modal.

1. We run the model setup in the method decorated with \`@modal.enter()\`. This includes loading the
weights and moving them to the GPU, along with an optional \`torch.compile\` step (see details below).
The \`@modal.enter()\` decorator ensures that this method runs only once, when a new container starts,
instead of in the path of every call.

2. We run the actual inference in methods decorated with \`@modal.method()\`.

*Note: Access to the Flux.1-schnell model on Hugging Face is
[gated by a license agreement](https://huggingface.co/docs/hub/en/models-gated)
which you must agree to
[here](https://huggingface.co/black-forest-labs/FLUX.1-schnell).
After you have accepted the license,
[create a Modal Secret](https://modal.com/secrets)
with the name \`huggingface-secret\` following the instructions in the template.*

\`\`\`python
MINUTES = 60  # seconds
VARIANT = "schnell"  # or "dev"
NUM_INFERENCE_STEPS = 4  # use ~50 for [dev], smaller for [schnell]


@app.cls(
    gpu="H100",  # fast GPU with strong software support
    scaledown_window=20 * MINUTES,
    timeout=60 * MINUTES,  # leave plenty of time for compilation
    volumes={  # add Volumes to store serializable compilation artifacts, see section on torch.compile below
        "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
        "/root/.nv": modal.Volume.from_name("nv-cache", create_if_missing=True),
        "/root/.triton": modal.Volume.from_name("triton-cache", create_if_missing=True),
        "/root/.inductor-cache": modal.Volume.from_name(
            "inductor-cache", create_if_missing=True
        ),
    },
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class Model:
    compile: bool = (  # see section on torch.compile below for details
        modal.parameter(default=False)
    )

    @modal.enter()
    def enter(self):
        pipe = FluxPipeline.from_pretrained(
            f"black-forest-labs/FLUX.1-{VARIANT}", torch_dtype=torch.bfloat16
        ).to("cuda")  # move model to GPU
        self.pipe = optimize(pipe, compile=self.compile)

    @modal.method()
    def inference(self, prompt: str) -> bytes:
        print("🎨 generating image...")
        out = self.pipe(
            prompt,
            output_type="pil",
            num_inference_steps=NUM_INFERENCE_STEPS,
        ).images[0]

        byte_stream = BytesIO()
        out.save(byte_stream, format="JPEG")
        return byte_stream.getvalue()


\`\`\`

## Calling our inference function

To generate an image we just need to call the \`Model\`'s \`generate\` method
with \`.remote\` appended to it.
You can call \`.generate.remote\` from any Python environment that has access to your Modal credentials.
The local environment will get back the image as bytes.

Here, we wrap the call in a Modal [\`local_entrypoint\`](https://modal.com/docs/reference/modal.App#local_entrypoint)
so that it can be run with \`modal run\`:

\`\`\`bash
modal run flux.py
\`\`\`

By default, we call \`generate\` twice to demonstrate how much faster
the inference is after cold start. In our tests, clients received images in about 1.2 seconds.
We save the output bytes to a temporary file.

\`\`\`python
@app.local_entrypoint()
def main(
    prompt: str = "a computer screen showing ASCII terminal art of the"
    " word 'Modal' in neon green. two programmers are pointing excitedly"
    " at the screen.",
    twice: bool = True,
    compile: bool = False,
):
    t0 = time.time()
    image_bytes = Model(compile=compile).inference.remote(prompt)
    print(f"🎨 first inference latency: {time.time() - t0:.2f} seconds")

    if twice:
        t0 = time.time()
        image_bytes = Model(compile=compile).inference.remote(prompt)
        print(f"🎨 second inference latency: {time.time() - t0:.2f} seconds")

    output_path = Path("/tmp") / "flux" / "output.jpg"
    output_path.parent.mkdir(exist_ok=True, parents=True)
    print(f"🎨 saving output to {output_path}")
    output_path.write_bytes(image_bytes)


\`\`\`

## Speeding up Flux with \`torch.compile\`

By default, we do some basic optimizations, like adjusting memory layout
and re-expressing the attention head projections as a single matrix multiplication.
But there are additional speedups to be had!

PyTorch 2 added a compiler that optimizes the
compute graphs created dynamically during PyTorch execution.
This feature helps close the gap with the performance of static graph frameworks
like TensorRT and TensorFlow.

Here, we follow the suggestions from Hugging Face's
[guide to fast diffusion inference](https://huggingface.co/docs/diffusers/en/tutorials/fast_diffusion),
which we verified with our own internal benchmarks.
Review that guide for detailed explanations of the choices made below.

The resulting compiled Flux \`schnell\` deployment returns images to the client in under a second (~700 ms), according to our testing.
_Super schnell_!

Compilation takes up to twenty minutes on first iteration.
As of time of writing in late 2024,
the compilation artifacts cannot be fully serialized,
so some compilation work must be re-executed every time a new container is started.
That includes when scaling up an existing deployment or the first time a Function is invoked with \`modal run\`.

We cache compilation outputs from \`nvcc\`, \`triton\`, and \`inductor\`,
which can reduce compilation time by up to an order of magnitude.
For details see [this tutorial](https://pytorch.org/tutorials/recipes/torch_compile_caching_tutorial.html).

You can turn on compilation with the \`--compile\` flag.
Try it out with:

\`\`\`bash
modal run flux.py --compile
\`\`\`

The \`compile\` option is passed by a [\`modal.parameter\`](https://modal.com/docs/reference/modal.parameter#modalparameter) on our class.
Each different choice for a \`parameter\` creates a [separate auto-scaling deployment](https://modal.com/docs/guide/parameterized-functions).
That means your client can use arbitrary logic to decide whether to hit a compiled or eager endpoint.

\`\`\`python
def optimize(pipe, compile=True):
    # fuse QKV projections in Transformer and VAE
    pipe.transformer.fuse_qkv_projections()
    pipe.vae.fuse_qkv_projections()

    # switch memory layout to Torch's preferred, channels_last
    pipe.transformer.to(memory_format=torch.channels_last)
    pipe.vae.to(memory_format=torch.channels_last)

    if not compile:
        return pipe

    # set torch compile flags
    config = torch._inductor.config
    config.disable_progress = False  # show progress bar
    config.conv_1x1_as_mm = True  # treat 1x1 convolutions as matrix muls
    # adjust autotuning algorithm
    config.coordinate_descent_tuning = True
    config.coordinate_descent_check_all_directions = True
    config.epilogue_fusion = False  # do not fuse pointwise ops into matmuls

    # tag the compute-intensive modules, the Transformer and VAE decoder, for compilation
    pipe.transformer = torch.compile(
        pipe.transformer, mode="max-autotune", fullgraph=True
    )
    pipe.vae.decode = torch.compile(
        pipe.vae.decode, mode="max-autotune", fullgraph=True
    )

    # trigger torch compilation
    print("🔦 running torch compilation (may take up to 20 minutes)...")

    pipe(
        "dummy prompt to trigger torch compilation",
        output_type="pil",
        num_inference_steps=NUM_INFERENCE_STEPS,  # use ~50 for [dev], smaller for [schnell]
    ).images[0]

    print("🔦 finished torch compilation")

    return pipe

\`\`\`
`,meta:{title:`Run Flux fast on H100s with torch.compile`,description:`Update: To speed up inference by another >2x, check out the additional optimization techniques we tried in this blog post!`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Run Flux fast on H100s with <code>torch.compile</code>`,1),b=t(`Defining a parameterized <code>Model</code> inference class`,1),x=t(`<code>local_entrypoint</code>`),S=t(`Speeding up Flux with <code>torch.compile</code>`,1),C=t(`<code>modal.parameter</code>`),w=t(`<!> <p><em>Update: To speed up inference by another >2x, check out the additional optimization
techniques we tried in <!>!</em></p> <p>In this guide, we’ll run Flux as fast as possible on Modal using open source tools.
We’ll use <code>torch.compile</code> and NVIDIA H100 GPUs.</p> <!> <!> <p>We’ll make use of the full <!> in this example, so we’ll build our container image off of the <code>nvidia/cuda</code> base.</p> <!> <p>Now we install most of our dependencies with <code>apt</code> and <code>pip</code>.
For Hugging Face’s <!> library
we install from GitHub source and so pin to a specific commit.</p> <p>PyTorch added faster attention kernels for Hopper GPUs in version 2.5.</p> <!> <p>Later, we’ll also use <code>torch.compile</code> to increase the speed further.
Torch compilation needs to be re-executed when each new container starts,
so we turn on some extra caching to reduce compile times for later containers.</p> <!> <p>Finally, we construct our Modal <!>,
set its default image to the one we just constructed,
and import <code>FluxPipeline</code> for downloading and running Flux.1.</p> <!> <!> <p>Next, we map the model’s setup and inference code onto Modal.</p> <ol><li><p>We run the model setup in the method decorated with <code>@modal.enter()</code>. This includes loading the
weights and moving them to the GPU, along with an optional <code>torch.compile</code> step (see details below).
The <code>@modal.enter()</code> decorator ensures that this method runs only once, when a new container starts,
instead of in the path of every call.</p></li> <li><p>We run the actual inference in methods decorated with <code>@modal.method()</code>.</p></li></ol> <p><em>Note: Access to the Flux.1-schnell model on Hugging Face is <!> which you must agree to <!>.
After you have accepted the license, <!> with the name <code>huggingface-secret</code> following the instructions in the template.</em></p> <!> <!> <p>To generate an image we just need to call the <code>Model</code>’s <code>generate</code> method
with <code>.remote</code> appended to it.
You can call <code>.generate.remote</code> from any Python environment that has access to your Modal credentials.
The local environment will get back the image as bytes.</p> <p>Here, we wrap the call in a Modal <!> so that it can be run with <code>modal run</code>:</p> <!> <p>By default, we call <code>generate</code> twice to demonstrate how much faster
the inference is after cold start. In our tests, clients received images in about 1.2 seconds.
We save the output bytes to a temporary file.</p> <!> <!> <p>By default, we do some basic optimizations, like adjusting memory layout
and re-expressing the attention head projections as a single matrix multiplication.
But there are additional speedups to be had!</p> <p>PyTorch 2 added a compiler that optimizes the
compute graphs created dynamically during PyTorch execution.
This feature helps close the gap with the performance of static graph frameworks
like TensorRT and TensorFlow.</p> <p>Here, we follow the suggestions from Hugging Face’s <!>,
which we verified with our own internal benchmarks.
Review that guide for detailed explanations of the choices made below.</p> <p>The resulting compiled Flux <code>schnell</code> deployment returns images to the client in under a second (~700 ms), according to our testing. <em>Super schnell</em>!</p> <p>Compilation takes up to twenty minutes on first iteration.
As of time of writing in late 2024,
the compilation artifacts cannot be fully serialized,
so some compilation work must be re-executed every time a new container is started.
That includes when scaling up an existing deployment or the first time a Function is invoked with <code>modal run</code>.</p> <p>We cache compilation outputs from <code>nvcc</code>, <code>triton</code>, and <code>inductor</code>,
which can reduce compilation time by up to an order of magnitude.
For details see <!>.</p> <p>You can turn on compilation with the <code>--compile</code> flag.
Try it out with:</p> <!> <p>The <code>compile</code> option is passed by a <!> on our class.
Each different choice for a <code>parameter</code> creates a <!>.
That means your client can use arbitrary logic to decide whether to hit a compiled or eager endpoint.</p> <!>`,1);function T(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=w(),p=s(o);d(p,{id:`run-flux-fast-on-h100s-with-torchcompile`,children:(e,t)=>{l();var n=y();l(),i(e,n)},$$slots:{default:!0}});var h=c(p,2),g=e(h);m(c(e(g)),{href:`https://modal.com/blog/flux-3x-faster`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this blog post`))},$$slots:{default:!0}}),l(),n(g),n(h);var _=c(h,4);u(_,{id:`setting-up-the-image-and-dependencies`,children:(e,t)=>{l(),i(e,r(`Setting up the image and dependencies`))},$$slots:{default:!0}});var v=c(_,2);f(v,{code:`import%20time%0Afrom%20io%20import%20BytesIO%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var T=c(v,2);m(c(e(T)),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CUDA toolkit`))},$$slots:{default:!0}}),l(3),n(T);var E=c(T,2);f(E,{code:`cuda_version%20%3D%20%2212.4.0%22%20%20%23%20should%20be%20no%20greater%20than%20host%20CUDA%20version%0Aflavor%20%3D%20%22devel%22%20%20%23%20includes%20full%20CUDA%20toolkit%0Aoperating_sys%20%3D%20%22ubuntu22.04%22%0Atag%20%3D%20f%22%7Bcuda_version%7D-%7Bflavor%7D-%7Boperating_sys%7D%22%0A%0Acuda_dev_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20f%22nvidia%2Fcuda%3A%7Btag%7D%22%2C%20add_python%3D%223.11%22%0A).entrypoint(%5B%5D)%0A`,lang:`python`});var D=c(E,2);m(c(e(D),5),{href:`https://github.com/huggingface/diffusers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Diffusers`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,4);f(O,{code:`diffusers_commit_sha%20%3D%20%2281cf3b2f155f1de322079af28f625349ee21ec6b%22%0A%0Aflux_image%20%3D%20(%0A%20%20%20%20cuda_dev_image.apt_install(%0A%20%20%20%20%20%20%20%20%22git%22%2C%0A%20%20%20%20%20%20%20%20%22libglib2.0-0%22%2C%0A%20%20%20%20%20%20%20%20%22libsm6%22%2C%0A%20%20%20%20%20%20%20%20%22libxrender1%22%2C%0A%20%20%20%20%20%20%20%20%22libxext6%22%2C%0A%20%20%20%20%20%20%20%20%22ffmpeg%22%2C%0A%20%20%20%20%20%20%20%20%22libgl1%22%2C%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22invisible_watermark%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.44.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.33.0%22%2C%0A%20%20%20%20%20%20%20%20%22safetensors%3D%3D0.4.4%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.0%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers.git%40%7Bdiffusers_commit_sha%7D%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HUB_CACHE%22%3A%20%22%2Fcache%22%7D)%0A)%0A`,lang:`python`});var k=c(O,4);f(k,{code:`flux_image%20%3D%20flux_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_CACHE_DIR%22%3A%20%22%2Froot%2F.inductor-cache%22%2C%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_FX_GRAPH_CACHE%22%3A%20%221%22%2C%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var A=c(k,2);m(c(e(A)),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),l(3),n(A);var j=c(A,2);f(j,{code:`app%20%3D%20modal.App(%22example-flux%22%2C%20image%3Dflux_image)%0A%0Awith%20flux_image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20diffusers%20import%20FluxPipeline%0A`,lang:`python`});var M=c(j,2);u(M,{id:`defining-a-parameterized-model-inference-class`,children:(e,t)=>{l();var n=b();l(2),i(e,n)},$$slots:{default:!0}});var N=c(M,6),P=e(N),F=c(e(P));m(F,{href:`https://huggingface.co/docs/hub/en/models-gated`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gated by a license agreement`))},$$slots:{default:!0}});var I=c(F,2);m(I,{href:`https://huggingface.co/black-forest-labs/FLUX.1-schnell`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),m(c(I,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`create a Modal Secret`))},$$slots:{default:!0}}),l(3),n(P),n(N);var L=c(N,2);f(L,{code:`MINUTES%20%3D%2060%20%20%23%20seconds%0AVARIANT%20%3D%20%22schnell%22%20%20%23%20or%20%22dev%22%0ANUM_INFERENCE_STEPS%20%3D%204%20%20%23%20use%20~50%20for%20%5Bdev%5D%2C%20smaller%20for%20%5Bschnell%5D%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3D%22H100%22%2C%20%20%23%20fast%20GPU%20with%20strong%20software%20support%0A%20%20%20%20scaledown_window%3D20%20*%20MINUTES%2C%0A%20%20%20%20timeout%3D60%20*%20MINUTES%2C%20%20%23%20leave%20plenty%20of%20time%20for%20compilation%0A%20%20%20%20volumes%3D%7B%20%20%23%20add%20Volumes%20to%20store%20serializable%20compilation%20artifacts%2C%20see%20section%20on%20torch.compile%20below%0A%20%20%20%20%20%20%20%20%22%2Fcache%22%3A%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.nv%22%3A%20modal.Volume.from_name(%22nv-cache%22%2C%20create_if_missing%3DTrue)%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.triton%22%3A%20modal.Volume.from_name(%22triton-cache%22%2C%20create_if_missing%3DTrue)%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.inductor-cache%22%3A%20modal.Volume.from_name(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22inductor-cache%22%2C%20create_if_missing%3DTrue%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A)%0Aclass%20Model%3A%0A%20%20%20%20compile%3A%20bool%20%3D%20(%20%20%23%20see%20section%20on%20torch.compile%20below%20for%20details%0A%20%20%20%20%20%20%20%20modal.parameter(default%3DFalse)%0A%20%20%20%20)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20pipe%20%3D%20FluxPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22black-forest-labs%2FFLUX.1-%7BVARIANT%7D%22%2C%20torch_dtype%3Dtorch.bfloat16%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%20%20%23%20move%20model%20to%20GPU%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20optimize(pipe%2C%20compile%3Dself.compile)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20prompt%3A%20str)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8E%A8%20generating%20image...%22)%0A%20%20%20%20%20%20%20%20out%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20output_type%3D%22pil%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3DNUM_INFERENCE_STEPS%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20byte_stream%20%3D%20BytesIO()%0A%20%20%20%20%20%20%20%20out.save(byte_stream%2C%20format%3D%22JPEG%22)%0A%20%20%20%20%20%20%20%20return%20byte_stream.getvalue()%0A%0A`,lang:`python`});var R=c(L,2);u(R,{id:`calling-our-inference-function`,children:(e,t)=>{l(),i(e,r(`Calling our inference function`))},$$slots:{default:!0}});var z=c(R,4);m(c(e(z)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(3),n(z);var B=c(z,2);f(B,{code:`modal%20run%20flux.py`,lang:`bash`});var V=c(B,4);f(V,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20str%20%3D%20%22a%20computer%20screen%20showing%20ASCII%20terminal%20art%20of%20the%22%0A%20%20%20%20%22%20word%20'Modal'%20in%20neon%20green.%20two%20programmers%20are%20pointing%20excitedly%22%0A%20%20%20%20%22%20at%20the%20screen.%22%2C%0A%20%20%20%20twice%3A%20bool%20%3D%20True%2C%0A%20%20%20%20compile%3A%20bool%20%3D%20False%2C%0A)%3A%0A%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20image_bytes%20%3D%20Model(compile%3Dcompile).inference.remote(prompt)%0A%20%20%20%20print(f%22%F0%9F%8E%A8%20first%20inference%20latency%3A%20%7Btime.time()%20-%20t0%3A.2f%7D%20seconds%22)%0A%0A%20%20%20%20if%20twice%3A%0A%20%20%20%20%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20%20%20%20%20image_bytes%20%3D%20Model(compile%3Dcompile).inference.remote(prompt)%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%8E%A8%20second%20inference%20latency%3A%20%7Btime.time()%20-%20t0%3A.2f%7D%20seconds%22)%0A%0A%20%20%20%20output_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22flux%22%20%2F%20%22output.jpg%22%0A%20%20%20%20output_path.parent.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20print(f%22%F0%9F%8E%A8%20saving%20output%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_bytes(image_bytes)%0A%0A`,lang:`python`});var H=c(V,2);u(H,{id:`speeding-up-flux-with-torchcompile`,children:(e,t)=>{l();var n=S();l(),i(e,n)},$$slots:{default:!0}});var U=c(H,6);m(c(e(U)),{href:`https://huggingface.co/docs/diffusers/en/tutorials/fast_diffusion`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide to fast diffusion inference`))},$$slots:{default:!0}}),l(),n(U);var W=c(U,6);m(c(e(W),7),{href:`https://pytorch.org/tutorials/recipes/torch_compile_caching_tutorial.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this tutorial`))},$$slots:{default:!0}}),l(),n(W);var G=c(W,4);f(G,{code:`modal%20run%20flux.py%20--compile`,lang:`bash`});var K=c(G,2),q=c(e(K),3);m(q,{href:`https://modal.com/docs/reference/modal.parameter#modalparameter`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),m(c(q,4),{href:`https://modal.com/docs/guide/parameterized-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`separate auto-scaling deployment`))},$$slots:{default:!0}}),l(),n(K),f(c(K,2),{code:`def%20optimize(pipe%2C%20compile%3DTrue)%3A%0A%20%20%20%20%23%20fuse%20QKV%20projections%20in%20Transformer%20and%20VAE%0A%20%20%20%20pipe.transformer.fuse_qkv_projections()%0A%20%20%20%20pipe.vae.fuse_qkv_projections()%0A%0A%20%20%20%20%23%20switch%20memory%20layout%20to%20Torch's%20preferred%2C%20channels_last%0A%20%20%20%20pipe.transformer.to(memory_format%3Dtorch.channels_last)%0A%20%20%20%20pipe.vae.to(memory_format%3Dtorch.channels_last)%0A%0A%20%20%20%20if%20not%20compile%3A%0A%20%20%20%20%20%20%20%20return%20pipe%0A%0A%20%20%20%20%23%20set%20torch%20compile%20flags%0A%20%20%20%20config%20%3D%20torch._inductor.config%0A%20%20%20%20config.disable_progress%20%3D%20False%20%20%23%20show%20progress%20bar%0A%20%20%20%20config.conv_1x1_as_mm%20%3D%20True%20%20%23%20treat%201x1%20convolutions%20as%20matrix%20muls%0A%20%20%20%20%23%20adjust%20autotuning%20algorithm%0A%20%20%20%20config.coordinate_descent_tuning%20%3D%20True%0A%20%20%20%20config.coordinate_descent_check_all_directions%20%3D%20True%0A%20%20%20%20config.epilogue_fusion%20%3D%20False%20%20%23%20do%20not%20fuse%20pointwise%20ops%20into%20matmuls%0A%0A%20%20%20%20%23%20tag%20the%20compute-intensive%20modules%2C%20the%20Transformer%20and%20VAE%20decoder%2C%20for%20compilation%0A%20%20%20%20pipe.transformer%20%3D%20torch.compile(%0A%20%20%20%20%20%20%20%20pipe.transformer%2C%20mode%3D%22max-autotune%22%2C%20fullgraph%3DTrue%0A%20%20%20%20)%0A%20%20%20%20pipe.vae.decode%20%3D%20torch.compile(%0A%20%20%20%20%20%20%20%20pipe.vae.decode%2C%20mode%3D%22max-autotune%22%2C%20fullgraph%3DTrue%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20trigger%20torch%20compilation%0A%20%20%20%20print(%22%F0%9F%94%A6%20running%20torch%20compilation%20(may%20take%20up%20to%2020%20minutes)...%22)%0A%0A%20%20%20%20pipe(%0A%20%20%20%20%20%20%20%20%22dummy%20prompt%20to%20trigger%20torch%20compilation%22%2C%0A%20%20%20%20%20%20%20%20output_type%3D%22pil%22%2C%0A%20%20%20%20%20%20%20%20num_inference_steps%3DNUM_INFERENCE_STEPS%2C%20%20%23%20use%20~50%20for%20%5Bdev%5D%2C%20smaller%20for%20%5Bschnell%5D%0A%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20print(%22%F0%9F%94%A6%20finished%20torch%20compilation%22)%0A%0A%20%20%20%20return%20pipe%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{T as default,h as metadata};
//# sourceMappingURL=CfbYuHUc2.js.map
