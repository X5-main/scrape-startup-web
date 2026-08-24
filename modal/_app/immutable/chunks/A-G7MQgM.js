(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a7a2fd33-55a2-4472-8329-e6e238904a8a`,e._sentryDebugIdIdentifier=`sentry-dbid-a7a2fd33-55a2-4472-8329-e6e238904a8a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as re}from"./Dz6DfB4R.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={crossLinksText:`Learn more`,crossLinks:[{text:`High-speed inference with vLLM`,href:`/docs/examples/llm_inference`},{text:`Edit images with a prompt`,href:`/docs/examples/image_to_image`},{text:`GPU metrics on Modal`,href:`/docs/guide/gpu-metrics`},{text:`GPU health on Modal`,href:`/docs/guide/gpu-health`}],toc:[{depth:1,value:`GPU acceleration`,id:`gpu-acceleration`,children:[{depth:2,value:`Quickstart`,id:`quickstart`},{depth:2,value:`Specifying GPU type`,id:`specifying-gpu-type`},{depth:2,value:`Specifying GPU count`,id:`specifying-gpu-count`},{depth:2,value:`Picking a GPU`,id:`picking-a-gpu`},{depth:2,value:`B300 GPUs`,id:`b300-gpus`},{depth:2,value:`B200 GPUs`,id:`b200-gpus`,children:[{depth:3,value:`Opt-in upgrade to B300`,id:`opt-in-upgrade-to-b300`}]},{depth:2,value:`H200 and H100 GPUs`,id:`h200-and-h100-gpus`,children:[{depth:3,value:`Automatic upgrades to H200s`,id:`automatic-upgrades-to-h200s`}]},{depth:2,value:`A100 GPUs`,id:`a100-gpus`},{depth:2,value:`GPU fallbacks`,id:`gpu-fallbacks`},{depth:2,value:`Multi GPU training`,id:`multi-gpu-training`},{depth:2,value:`Examples and more resources`,id:`examples-and-more-resources`}]}],rawContent:`# GPU acceleration

Modal makes it easy to run your code on [GPUs](/gpu-glossary/readme).

## Quickstart

Here's a simple example of a Function running on an A100 in Modal:

\`\`\`python
import modal

image = modal.Image.debian_slim().pip_install("torch", "numpy")
app = modal.App(image=image)


@app.function(gpu="A100")
def run():
    import torch

    assert torch.cuda.is_available()
\`\`\`

## Specifying GPU type

You can pick a specific GPU type for your Function via the \`gpu\` argument.
Modal supports the following values for this parameter:

- \`T4\`
- \`L4\`
- \`A10\`
- \`L40S\`
- \`A100\`
- \`A100-40GB\`
- \`A100-80GB\`
- \`RTX-PRO-6000\`
- \`H100\`/\`H100!\`
- \`H200\`
- \`B200\`/\`B200+\`
- \`B300\`

For instance, to use a B200, you can use \`@app.function(gpu="B200")\`.

Refer to our [pricing page](/pricing) for the latest pricing on each GPU type.

## Specifying GPU count

You can specify more than 1 GPU per container by appending \`:n\` to the GPU
argument. For instance, to run a Function with eight H100s:

\`\`\`python

@app.function(gpu="H100:8")
def run_llama_405b_fp8():
    ...
\`\`\`

Currently B300, B200, H200, H100, A100, L4, T4 and L40S instances support up to 8 GPUs (up to 2,304 GB GPU RAM),
and A10 instances support up to 4 GPUs (up to 96 GB GPU RAM). Note that requesting
more than 2 GPUs per container will usually result in larger wait times. These
GPUs are always attached to the same physical machine.

## Picking a GPU

For running, rather than training, neural networks, we recommend starting off
with the [L40S](https://resources.nvidia.com/en-us-l40s/l40s-datasheet-28413),
which offers an excellent trade-off of cost and performance and 48 GB of GPU
RAM for storing model weights and activations.

For more on how to pick a GPU for use with neural networks like LLaMA or Stable
Diffusion, and for tips on how to make that GPU go brrr, check out
[Tim Dettemers' blog post](https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/)
or the
[Full Stack Deep Learning page on Cloud GPUs](https://fullstackdeeplearning.com/cloud-gpus/).

## B300 GPUs

[B300s](https://www.nvidia.com/en-us/data-center/dgx-b300/) are NVIDIA
Blackwell Ultra GPUs, based on the Blackwell [architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).

To request a B300, set the \`gpu\` argument to \`"B300"\`:

\`\`\`python
@app.function(gpu="B300:8")
def run_inference():
    ...
\`\`\`

B300 requires CUDA version 13.1+. Make sure your container Image and libraries
are compatible with CUDA 13 before requesting a B300.

## B200 GPUs

B200s are [NVIDIA data center GPUs](https://www.nvidia.com/en-us/data-center/dgx-b200/)
based on the Blackwell [architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).

To request a B200, set the \`gpu\` argument to \`"B200"\`

\`\`\`python
@app.function(gpu="B200:8")
def run_deepseek():
    ...
\`\`\`

Check out [this example](/docs/examples/llm_inference) to see how you can use B200s to max out vLLM serving performance for LLaMA 3.1-8B.

Before you jump for this powerful GPU, make sure you understand where the bottlenecks
are in your computations. For example, running language models with small batch sizes
(e.g. one prompt at a time) results in a [bottleneck on memory, not arithmetic](https://kipp.ly/transformer-inference-arithmetic/).
Since arithmetic throughput has risen faster than memory throughput in recent
hardware generations, speedups for memory-bound GPU jobs are not as extreme and
may not be worth the extra cost.

### Opt-in upgrade to B300

Use \`gpu="B200+"\` to allow Modal to run requests on either B200 or B300 GPUs.
B200+ is billed as B200, regardless of which GPU is used. Use this option only
if your code is compatible with both types of GPUs. B300 requires CUDA version
13.1+. Use this to have access to a greater capacity pool automatically.

## H200 and H100 GPUs

[H200s](https://www.nvidia.com/en-us/data-center/h200/) and [H100s](https://www.nvidia.com/en-us/data-center/h100/) are the previous
generation of top-of-the-line data center chips from NVIDIA, based on the Hopper [architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
These GPUs have better software support than do Blackwell GPUs (e.g. popular libraries include pre-compiled kernels for Hopper, but not Blackwell),
and they often get the job done at a competitive cost, so they are a common choice of accelerator, on and off Modal.

All H100 and H200 GPUs on the Modal platform are of the SXM variant, as can be verified by examining the
[power draw](/docs/guide/gpu-metrics) in the dashboard or with \`nvidia-smi\`.

### Automatic upgrades to H200s

Modal may automatically upgrade a \`gpu="H100"\` request to run on an H200.
This automatic upgrade does _not_ change the cost of the GPU.

Kernels [compatible](/gpu-glossary/device-software/compute-capability) with H200s are also compatible with H100s,
so your code will still run, just faster, so long as it doesn't make strict assumptions about memory capacity.
An H200’s [HBM3e memory](/gpu-glossary/device-hardware/gpu-ram)
has a capacity of 141 GB and a bandwidth of 4.8TB/s, 1.75x larger and 1.4x faster than an NVIDIA H100 with HBM3.

In cases where an automatic upgrade to H200 would not be helpful (for instance, benchmarking) you can pass
\`gpu=H100!\` to avoid it.

## A100 GPUs

[A100s](https://www.nvidia.com/en-us/data-center/a100/) are based on NVIDIA's Ampere [architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
Modal offers two versions of the A100: one with 40 GB of RAM and another with 80 GB of RAM.

To request an A100 with 40 GB of [GPU memory](/gpu-glossary/device-hardware/gpu-ram), use \`gpu="A100"\`:

\`\`\`python
@app.function(gpu="A100")
def qwen_7b():
    ...
\`\`\`

Modal may automatically upgrade a \`gpu="A100"\` request to run on an 80 GB A100.
This automatic upgrade does _not_ change the cost of the GPU.

You can specifically request a 40GB A100 with the string \`A100-40GB\`.
To specifically request an 80 GB A100, use the string \`A100-80GB\`:

\`\`\`python
@app.function(gpu="A100-80GB")
def llama_70b_fp8():
    ...
\`\`\`

## GPU fallbacks

Modal allows specifying a list of possible GPU types, suitable for Functions that are
compatible with multiple options. Modal respects the ordering of this list and
will try to allocate the most preferred GPU type before falling back to less
preferred ones.

\`\`\`python
@app.function(gpu=["H100", "A100-40GB:2"])
def run_on_80gb():
    ...
\`\`\`

See [this example](/docs/examples/gpu_fallbacks) for more detail.

## Multi GPU training

Modal currently supports multi-GPU training on a single node, with multi-node training in private Beta (email us at support@modal.com for access).
Depending on which framework you are using, you may need to use different techniques to train on multiple GPUs.

If the framework re-executes the entrypoint of the Python process (like [PyTorch Lightning](https://lightning.ai/docs/pytorch/stable/index.html)) you need to either set the strategy to \`ddp_spawn\` or \`ddp_notebook\` if you wish to invoke the training directly. Another option is to run the training script as a subprocess instead.

\`\`\`python
@app.function(gpu="A100:2")
def run():
    import subprocess
    import sys
    subprocess.run(
        ["python", "train.py"],
        stdout=sys.stdout, stderr=sys.stderr,
        check=True,
    )
\`\`\`

## Examples and more resources

For more information about GPUs in general, check out our [GPU Glossary](/gpu-glossary/readme).

Or take a look some examples of Modal Apps using GPUs:

- [Fine-tune a character LoRA for your pet](/docs/examples/diffusers_lora_finetune)
- [Fast LLM inference on big GPUs](/docs/examples/llm_inference)
- [Stable Diffusion with a CLI, API, and web UI](/docs/examples/text_to_image)
- [Rendering Blender videos](/docs/examples/blender_video)

<YoutubeEmbed videoId="MLvC7W_b6SA"/>
`,meta:{title:`GPU acceleration`,description:`Modal makes it easy to run your code on GPUs.`}},{crossLinksText:m,crossLinks:h,toc:g,rawContent:_,meta:v}=p,ie=t(`<!> <p>Modal makes it easy to run your code on <!>.</p> <!> <p>Here’s a simple example of a Function running on an A100 in Modal:</p> <!> <!> <p>You can pick a specific GPU type for your Function via the <code>gpu</code> argument.
Modal supports the following values for this parameter:</p> <ul><li><code>T4</code></li> <li><code>L4</code></li> <li><code>A10</code></li> <li><code>L40S</code></li> <li><code>A100</code></li> <li><code>A100-40GB</code></li> <li><code>A100-80GB</code></li> <li><code>RTX-PRO-6000</code></li> <li><code>H100</code>/<code>H100!</code></li> <li><code>H200</code></li> <li><code>B200</code>/<code>B200+</code></li> <li><code>B300</code></li></ul> <p>For instance, to use a B200, you can use <code>@app.function(gpu="B200")</code>.</p> <p>Refer to our <!> for the latest pricing on each GPU type.</p> <!> <p>You can specify more than 1 GPU per container by appending <code>:n</code> to the GPU
argument. For instance, to run a Function with eight H100s:</p> <!> <p>Currently B300, B200, H200, H100, A100, L4, T4 and L40S instances support up to 8 GPUs (up to 2,304 GB GPU RAM),
and A10 instances support up to 4 GPUs (up to 96 GB GPU RAM). Note that requesting
more than 2 GPUs per container will usually result in larger wait times. These
GPUs are always attached to the same physical machine.</p> <!> <p>For running, rather than training, neural networks, we recommend starting off
with the <!>,
which offers an excellent trade-off of cost and performance and 48 GB of GPU
RAM for storing model weights and activations.</p> <p>For more on how to pick a GPU for use with neural networks like LLaMA or Stable
Diffusion, and for tips on how to make that GPU go brrr, check out <!> or the <!>.</p> <!> <p><!> are NVIDIA
Blackwell Ultra GPUs, based on the Blackwell <!>.</p> <p>To request a B300, set the <code>gpu</code> argument to <code>"B300"</code>:</p> <!> <p>B300 requires CUDA version 13.1+. Make sure your container Image and libraries
are compatible with CUDA 13 before requesting a B300.</p> <!> <p>B200s are <!> based on the Blackwell <!>.</p> <p>To request a B200, set the <code>gpu</code> argument to <code>"B200"</code></p> <!> <p>Check out <!> to see how you can use B200s to max out vLLM serving performance for LLaMA 3.1-8B.</p> <p>Before you jump for this powerful GPU, make sure you understand where the bottlenecks
are in your computations. For example, running language models with small batch sizes
(e.g. one prompt at a time) results in a <!>.
Since arithmetic throughput has risen faster than memory throughput in recent
hardware generations, speedups for memory-bound GPU jobs are not as extreme and
may not be worth the extra cost.</p> <!> <p>Use <code>gpu="B200+"</code> to allow Modal to run requests on either B200 or B300 GPUs.
B200+ is billed as B200, regardless of which GPU is used. Use this option only
if your code is compatible with both types of GPUs. B300 requires CUDA version
13.1+. Use this to have access to a greater capacity pool automatically.</p> <!> <p><!> and <!> are the previous
generation of top-of-the-line data center chips from NVIDIA, based on the Hopper <!>.
These GPUs have better software support than do Blackwell GPUs (e.g. popular libraries include pre-compiled kernels for Hopper, but not Blackwell),
and they often get the job done at a competitive cost, so they are a common choice of accelerator, on and off Modal.</p> <p>All H100 and H200 GPUs on the Modal platform are of the SXM variant, as can be verified by examining the <!> in the dashboard or with <code>nvidia-smi</code>.</p> <!> <p>Modal may automatically upgrade a <code>gpu="H100"</code> request to run on an H200.
This automatic upgrade does <em>not</em> change the cost of the GPU.</p> <p>Kernels <!> with H200s are also compatible with H100s,
so your code will still run, just faster, so long as it doesn’t make strict assumptions about memory capacity.
An H200’s <!> has a capacity of 141 GB and a bandwidth of 4.8TB/s, 1.75x larger and 1.4x faster than an NVIDIA H100 with HBM3.</p> <p>In cases where an automatic upgrade to H200 would not be helpful (for instance, benchmarking) you can pass <code>gpu=H100!</code> to avoid it.</p> <!> <p><!> are based on NVIDIA’s Ampere <!>.
Modal offers two versions of the A100: one with 40 GB of RAM and another with 80 GB of RAM.</p> <p>To request an A100 with 40 GB of <!>, use <code>gpu="A100"</code>:</p> <!> <p>Modal may automatically upgrade a <code>gpu="A100"</code> request to run on an 80 GB A100.
This automatic upgrade does <em>not</em> change the cost of the GPU.</p> <p>You can specifically request a 40GB A100 with the string <code>A100-40GB</code>.
To specifically request an 80 GB A100, use the string <code>A100-80GB</code>:</p> <!> <!> <p>Modal allows specifying a list of possible GPU types, suitable for Functions that are
compatible with multiple options. Modal respects the ordering of this list and
will try to allocate the most preferred GPU type before falling back to less
preferred ones.</p> <!> <p>See <!> for more detail.</p> <!> <p>Modal currently supports multi-GPU training on a single node, with multi-node training in private Beta (email us at <!> for access).
Depending on which framework you are using, you may need to use different techniques to train on multiple GPUs.</p> <p>If the framework re-executes the entrypoint of the Python process (like <!>) you need to either set the strategy to <code>ddp_spawn</code> or <code>ddp_notebook</code> if you wish to invoke the training directly. Another option is to run the training script as a subprocess instead.</p> <!> <!> <p>For more information about GPUs in general, check out our <!>.</p> <p>Or take a look some examples of Modal Apps using GPUs:</p> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <!>`,1);function y(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ie(),d=te(a);ne(d,{id:`gpu-acceleration`,children:(e,t)=>{s(),i(e,r(`GPU acceleration`))},$$slots:{default:!0}});var p=o(d,2);f(o(e(p)),{href:`/gpu-glossary/readme`,children:(e,t)=>{s(),i(e,r(`GPUs`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);c(m,{id:`quickstart`,children:(e,t)=>{s(),i(e,r(`Quickstart`))},$$slots:{default:!0}});var h=o(m,4);u(h,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22torch%22%2C%20%22numpy%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0A%0A%40app.function(gpu%3D%22A100%22)%0Adef%20run()%3A%0A%20%20%20%20import%20torch%0A%0A%20%20%20%20assert%20torch.cuda.is_available()`,lang:`python`});var g=o(h,2);c(g,{id:`specifying-gpu-type`,children:(e,t)=>{s(),i(e,r(`Specifying GPU type`))},$$slots:{default:!0}});var _=o(g,8);f(o(e(_)),{href:`/pricing`,children:(e,t)=>{s(),i(e,r(`pricing page`))},$$slots:{default:!0}}),s(),n(_);var v=o(_,2);c(v,{id:`specifying-gpu-count`,children:(e,t)=>{s(),i(e,r(`Specifying GPU count`))},$$slots:{default:!0}});var y=o(v,4);u(y,{code:`%0A%40app.function(gpu%3D%22H100%3A8%22)%0Adef%20run_llama_405b_fp8()%3A%0A%20%20%20%20...`,lang:`python`});var b=o(y,4);c(b,{id:`picking-a-gpu`,children:(e,t)=>{s(),i(e,r(`Picking a GPU`))},$$slots:{default:!0}});var x=o(b,2);f(o(e(x)),{href:`https://resources.nvidia.com/en-us-l40s/l40s-datasheet-28413`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`L40S`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2),C=o(e(S));f(C,{href:`https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tim Dettemers’ blog post`))},$$slots:{default:!0}}),f(o(C,2),{href:`https://fullstackdeeplearning.com/cloud-gpus/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Full Stack Deep Learning page on Cloud GPUs`))},$$slots:{default:!0}}),s(),n(S);var w=o(S,2);c(w,{id:`b300-gpus`,children:(e,t)=>{s(),i(e,r(`B300 GPUs`))},$$slots:{default:!0}});var T=o(w,2),ae=e(T);f(ae,{href:`https://www.nvidia.com/en-us/data-center/dgx-b300/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`B300s`))},$$slots:{default:!0}}),f(o(ae,2),{href:`/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,children:(e,t)=>{s(),i(e,r(`architecture`))},$$slots:{default:!0}}),s(),n(T);var oe=o(T,4);u(oe,{code:`%40app.function(gpu%3D%22B300%3A8%22)%0Adef%20run_inference()%3A%0A%20%20%20%20...`,lang:`python`});var se=o(oe,4);c(se,{id:`b200-gpus`,children:(e,t)=>{s(),i(e,r(`B200 GPUs`))},$$slots:{default:!0}});var E=o(se,2),ce=o(e(E));f(ce,{href:`https://www.nvidia.com/en-us/data-center/dgx-b200/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVIDIA data center GPUs`))},$$slots:{default:!0}}),f(o(ce,2),{href:`/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,children:(e,t)=>{s(),i(e,r(`architecture`))},$$slots:{default:!0}}),s(),n(E);var le=o(E,4);u(le,{code:`%40app.function(gpu%3D%22B200%3A8%22)%0Adef%20run_deepseek()%3A%0A%20%20%20%20...`,lang:`python`});var D=o(le,2);f(o(e(D)),{href:`/docs/examples/llm_inference`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,2);f(o(e(O)),{href:`https://kipp.ly/transformer-inference-arithmetic/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`bottleneck on memory, not arithmetic`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);l(k,{id:`opt-in-upgrade-to-b300`,children:(e,t)=>{s(),i(e,r(`Opt-in upgrade to B300`))},$$slots:{default:!0}});var A=o(k,4);c(A,{id:`h200-and-h100-gpus`,children:(e,t)=>{s(),i(e,r(`H200 and H100 GPUs`))},$$slots:{default:!0}});var j=o(A,2),M=e(j);f(M,{href:`https://www.nvidia.com/en-us/data-center/h200/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H200s`))},$$slots:{default:!0}});var N=o(M,2);f(N,{href:`https://www.nvidia.com/en-us/data-center/h100/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H100s`))},$$slots:{default:!0}}),f(o(N,2),{href:`/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,children:(e,t)=>{s(),i(e,r(`architecture`))},$$slots:{default:!0}}),s(),n(j);var P=o(j,2);f(o(e(P)),{href:`/docs/guide/gpu-metrics`,children:(e,t)=>{s(),i(e,r(`power draw`))},$$slots:{default:!0}}),s(3),n(P);var F=o(P,2);l(F,{id:`automatic-upgrades-to-h200s`,children:(e,t)=>{s(),i(e,r(`Automatic upgrades to H200s`))},$$slots:{default:!0}});var I=o(F,4),L=o(e(I));f(L,{href:`/gpu-glossary/device-software/compute-capability`,children:(e,t)=>{s(),i(e,r(`compatible`))},$$slots:{default:!0}}),f(o(L,2),{href:`/gpu-glossary/device-hardware/gpu-ram`,children:(e,t)=>{s(),i(e,r(`HBM3e memory`))},$$slots:{default:!0}}),s(),n(I);var R=o(I,4);c(R,{id:`a100-gpus`,children:(e,t)=>{s(),i(e,r(`A100 GPUs`))},$$slots:{default:!0}});var z=o(R,2),B=e(z);f(B,{href:`https://www.nvidia.com/en-us/data-center/a100/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`A100s`))},$$slots:{default:!0}}),f(o(B,2),{href:`/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,children:(e,t)=>{s(),i(e,r(`architecture`))},$$slots:{default:!0}}),s(),n(z);var V=o(z,2);f(o(e(V)),{href:`/gpu-glossary/device-hardware/gpu-ram`,children:(e,t)=>{s(),i(e,r(`GPU memory`))},$$slots:{default:!0}}),s(3),n(V);var H=o(V,2);u(H,{code:`%40app.function(gpu%3D%22A100%22)%0Adef%20qwen_7b()%3A%0A%20%20%20%20...`,lang:`python`});var U=o(H,6);u(U,{code:`%40app.function(gpu%3D%22A100-80GB%22)%0Adef%20llama_70b_fp8()%3A%0A%20%20%20%20...`,lang:`python`});var W=o(U,2);c(W,{id:`gpu-fallbacks`,children:(e,t)=>{s(),i(e,r(`GPU fallbacks`))},$$slots:{default:!0}});var G=o(W,4);u(G,{code:`%40app.function(gpu%3D%5B%22H100%22%2C%20%22A100-40GB%3A2%22%5D)%0Adef%20run_on_80gb()%3A%0A%20%20%20%20...`,lang:`python`});var K=o(G,2);f(o(e(K)),{href:`/docs/examples/gpu_fallbacks`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(K);var ue=o(K,2);c(ue,{id:`multi-gpu-training`,children:(e,t)=>{s(),i(e,r(`Multi GPU training`))},$$slots:{default:!0}});var q=o(ue,2);f(o(e(q)),{href:`mailto:support@modal.com`,children:(e,t)=>{s(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,2);f(o(e(J)),{href:`https://lightning.ai/docs/pytorch/stable/index.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`PyTorch Lightning`))},$$slots:{default:!0}}),s(5),n(J);var de=o(J,2);u(de,{code:`%40app.function(gpu%3D%22A100%3A2%22)%0Adef%20run()%3A%0A%20%20%20%20import%20subprocess%0A%20%20%20%20import%20sys%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%22python%22%2C%20%22train.py%22%5D%2C%0A%20%20%20%20%20%20%20%20stdout%3Dsys.stdout%2C%20stderr%3Dsys.stderr%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20)`,lang:`python`});var fe=o(de,2);c(fe,{id:`examples-and-more-resources`,children:(e,t)=>{s(),i(e,r(`Examples and more resources`))},$$slots:{default:!0}});var Y=o(fe,2);f(o(e(Y)),{href:`/gpu-glossary/readme`,children:(e,t)=>{s(),i(e,r(`GPU Glossary`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,4),Z=e(X);f(e(Z),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{s(),i(e,r(`Fine-tune a character LoRA for your pet`))},$$slots:{default:!0}}),n(Z);var Q=o(Z,2);f(e(Q),{href:`/docs/examples/llm_inference`,children:(e,t)=>{s(),i(e,r(`Fast LLM inference on big GPUs`))},$$slots:{default:!0}}),n(Q);var $=o(Q,2);f(e($),{href:`/docs/examples/text_to_image`,children:(e,t)=>{s(),i(e,r(`Stable Diffusion with a CLI, API, and web UI`))},$$slots:{default:!0}}),n($);var pe=o($,2);f(e(pe),{href:`/docs/examples/blender_video`,children:(e,t)=>{s(),i(e,r(`Rendering Blender videos`))},$$slots:{default:!0}}),n(pe),n(X),re(o(X,2),{videoId:`MLvC7W_b6SA`}),i(t,a)},$$slots:{default:!0}}))}export{y as default,p as metadata};
//# sourceMappingURL=A-G7MQgM.js.map
