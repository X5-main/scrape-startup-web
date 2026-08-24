(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fd2f90fa-a4d1-4aa5-adda-4c394a9ea72b`,e._sentryDebugIdIdentifier=`sentry-dbid-fd2f90fa-a4d1-4aa5-adda-4c394a9ea72b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as re}from"./JPsrybyr.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var ie=`/_app/immutable/assets/cuda-stack-diagram.BdEpPviG.png`,p={crossLinks:[{text:`High-speed inference with vLLM`,href:`/docs/examples/llm_inference`},{text:`Run Stable Diffusion with a CLI, API, and web UI`,href:`/docs/examples/text_to_image`}],toc:[{depth:1,value:`Using CUDA on Modal`,id:`using-cuda-on-modal`,children:[{depth:2,value:`What is CUDA?`,id:`what-is-cuda`,children:[{depth:3,value:`Level 0: Kernel-mode driver components`,id:`level-0-kernel-mode-driver-components`},{depth:3,value:`Level 1: User-mode driver API`,id:`level-1-user-mode-driver-api`},{depth:3,value:`Level 2: CUDA Toolkit`,id:`level-2-cuda-toolkit`}]},{depth:2,value:`Install GPU-accelerated torch and transformers with pip_install`,id:`install-gpu-accelerated-torch-and-transformers-with-pip_install`},{depth:2,value:`For more complex setups, use an officially-supported CUDA image`,id:`for-more-complex-setups-use-an-officially-supported-cuda-image`},{depth:2,value:`What next?`,id:`what-next`}]}],rawContent:`# Using CUDA on Modal

Modal makes it easy to accelerate your workloads with datacenter-grade NVIDIA GPUs.

To take advantage of the hardware, you need to use matching software: the CUDA stack.
This guide explains the components of that stack and how to install them on Modal.
For more on which GPUs are available on Modal and how to choose a GPU for your use case,
see [this guide](/docs/guide/gpu). For a deep dive on both the
[GPU hardware](/gpu-glossary/device-hardware) and [software](/gpu-glossary/device-software)
and for even more detail on [the CUDA stack](/gpu-glossary/host-software/),
see our [GPU Glossary](/gpu-glossary/readme).

Here's the tl;dr:

- The [NVIDIA Accelerated Graphics Driver for Linux-x86_64](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#driver-installation), version 580.95.05,
  and [CUDA Driver API](https://docs.nvidia.com/cuda/archive/13.0.0/cuda-driver-api/index.html), version 13.0, are already installed.
  You can call \`nvidia-smi\` or run compiled CUDA programs from any Modal Function with access to a GPU.
- That means you can install many popular libraries like \`torch\` that bundle their other CUDA dependencies [with a simple \`pip_install\`](#install-gpu-accelerated-torch-and-transformers-with-pip_install).
- For bleeding-edge libraries like \`flash-attn\`, you may need to install CUDA dependencies manually.
  To make your life easier, [use an existing image](#for-more-complex-setups-use-an-officially-supported-cuda-image).

## What is CUDA?

When someone refers to "installing CUDA" or "using CUDA",
they are referring not to a library, but to a
[stack](/gpu-glossary/host-software/cuda-software-platform) with multiple layers.
Your application code (and its dependencies) can interact
with the stack at different levels.

![The CUDA stack](../../assets/docs/cuda-stack-diagram.png)

This leads to a lot of confusion. To help clear that up, the following sections explain each component in detail.

### Level 0: Kernel-mode driver components

At the lowest level are the [_kernel-mode driver components_](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#nvidia-open-gpu-kernel-modules).
The Linux kernel is essentially a single program operating the entire machine and all of its hardware.
To add hardware to the machine, this program is extended by loading new modules into it.
These components communicate directly with hardware -- in this case the GPU.

Because they are kernel modules, these driver components are tightly integrated with the host operating system
that runs your containerized Modal Functions and are not something you can inspect or change yourself.

### Level 1: User-mode driver API

All action in Linux that doesn't occur in the kernel occurs in [user space](https://en.wikipedia.org/wiki/User_space).
To talk to the kernel drivers from our user space programs, we need _user-mode driver components_.

Most prominently, that includes:

- the [CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api),
  a [shared object](https://en.wikipedia.org/wiki/Shared_library) called \`libcuda.so\`.
  This object exposes functions like [\`cuMemAlloc\`](https://docs.nvidia.com/cuda/archive/12.8.0/cuda-driver-api/group__CUDA__MEM.html#group__CUDA__MEM_1gb82d2a09844a58dd9e744dc31e8aa467),
  for allocating GPU memory.
- the [NVIDIA management library](https://developer.nvidia.com/management-library-nvml), \`libnvidia-ml.so\`, and its command line interface [\`nvidia-smi\`](https://developer.nvidia.com/system-management-interface).
  You can use these tools to check the status of the system's GPU(s).

These components are installed on all Modal machines with access to GPUs.
Because they are user-level components, you can use them directly:

\`\`\`python runner:ModalRunner
import modal

app = modal.App()

@app.function(gpu="any")
def check_nvidia_smi():
    import subprocess
    output = subprocess.check_output(["nvidia-smi"], text=True)
    assert "Driver Version:" in output
    assert "CUDA Version:" in output
    print(output)
    return output
\`\`\`

### Level 2: CUDA Toolkit

Wrapping the CUDA Driver API is the [CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api), the \`libcudart.so\` shared library.
This API includes functions like [\`cudaLaunchKernel\`](https://docs.nvidia.com/cuda/archive/12.8.0/cuda-runtime-api/group__CUDART__HIGHLEVEL.html#group__CUDART__HIGHLEVEL_1g7656391f2e52f569214adbfc19689eb3)
and is more commonly used in CUDA programs (see [this HackerNews comment](https://news.ycombinator.com/item?id=20616385) for color commentary on why).
This shared library is _not_ installed by default on Modal.

The CUDA Runtime API is generally installed as part of the larger [NVIDIA CUDA Toolkit](https://docs.nvidia.com/cuda/index.html),
which includes the [NVIDIA CUDA compiler driver](/gpu-glossary/host-software/nvcc) (\`nvcc\`) and its toolchain
and a number of [useful goodies](/gpu-glossary/host-software/cuda-binary-utilities) for writing and debugging CUDA programs (\`cuobjdump\`, \`cudnn\`, profilers, etc.).

Contemporary GPU-accelerated machine learning workloads like LLM inference frequently make use of many components of the CUDA Toolkit,
such as the run-time compilation library [\`nvrtc\`](https://docs.nvidia.com/cuda/archive/12.8.0/nvrtc/index.html).

So why aren't these components installed along with the drivers?
A compiled CUDA program can run without the CUDA Runtime API installed on the system,
by [statically linking](https://en.wikipedia.org/wiki/Static_library) the CUDA Runtime API into the program binary,
though this is fairly uncommon for CUDA-accelerated Python programs.
Additionally, older versions of these components are needed for some applications
and some application deployments even use several versions at once.
Both patterns are compatible with the host machine driver provided on Modal.

## Install GPU-accelerated \`torch\` and \`transformers\` with \`pip_install\`

The components of the CUDA Toolkit can be installed via \`pip\`,
via PyPI packages like [\`nvidia-cuda-runtime-cu12\`](https://pypi.org/project/nvidia-cuda-runtime-cu12/)
and [\`nvidia-cuda-nvrtc-cu12\`](https://pypi.org/project/nvidia-cuda-nvrtc-cu12/).
These components are listed as dependencies of some popular GPU-accelerated Python libraries, like \`torch\`.

Because Modal already includes the lower parts of the CUDA stack, you can install these libraries
with [the \`pip_install\` method of \`modal.Image\`](/docs/guide/images#add-python-packages-with-pip_install), just like any other Python library:

\`\`\`python
image = modal.Image.debian_slim().pip_install("torch")


@app.function(gpu="any", image=image)
def run_torch():
    import torch
    has_cuda = torch.cuda.is_available()
    print(f"It is {has_cuda} that torch can access CUDA")
    return has_cuda
\`\`\`

Many libraries for running open-weights models, like \`transformers\` and \`vllm\`,
use \`torch\` under the hood and so can be installed in the same way:

\`\`\`python
image = modal.Image.debian_slim().pip_install("transformers[torch]")
image = image.apt_install("ffmpeg")  # for audio processing


@app.function(gpu="any", image=image)
def run_transformers():
    from transformers import pipeline
    transcriber = pipeline(model="openai/whisper-tiny.en", device="cuda")
    result = transcriber("https://modal-cdn.com/mlk.flac")
    print(result["text"])  # I have a dream that one day this nation will rise up live out the true meaning of its creed
\`\`\`

## For more complex setups, use an officially-supported CUDA image

The disadvantage of installing the CUDA stack via \`pip\` is that
many other libraries that depend on its components being installed as normal system packages cannot find them.

For these cases, we recommend you use an image that already has the full CUDA stack installed as system packages
and all environment variables set correctly, like the [\`nvidia/cuda:*-devel-*\` images on Docker Hub](https://hub.docker.com/r/nvidia/cuda).

[TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/overview.html) is an inference engine that accelerates and optimizes performance for the large language models. It requires the full CUDA toolkit for installation.

\`\`\`python
cuda_version = "12.8.1"  # should be no greater than host CUDA version
flavor = "devel"  # includes full CUDA toolkit
operating_sys = "ubuntu24.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"
HF_CACHE_PATH = "/cache"


image = (
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.12")
    .entrypoint([])  # remove verbose logging by base image on entry
    .apt_install("libopenmpi-dev")  # required for tensorrt
    .pip_install("tensorrt-llm==0.19.0", "pynvml", extra_index_url="https://pypi.nvidia.com")
    .pip_install("hf-transfer", "huggingface_hub[hf_xet]")
    .env({"HF_HUB_CACHE": HF_CACHE_PATH, "HF_HUB_ENABLE_HF_TRANSFER": "1", "PMIX_MCA_gds": "hash"})
)


app = modal.App("tensorrt-llm", image=image)
hf_cache_volume = modal.Volume.from_name("hf_cache_tensorrt", create_if_missing=True)


@app.function(gpu="A10G", volumes={HF_CACHE_PATH: hf_cache_volume})
def run_tiny_model():
    from tensorrt_llm import LLM, SamplingParams

    sampling_params = SamplingParams(temperature=0.8, top_p=0.95)

    llm = LLM(model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")

    output = llm.generate("The capital of France is", sampling_params)
    print(f"Generated text: {output.outputs[0].text}")
    return output.outputs[0].text
\`\`\`

Make sure to choose a version of CUDA that is no greater than the version provided by the host machine.
Older versions in the \`12.*\` and \`13.*\` series are guaranteed to be compatible with the host machine's driver,
but older major versions (\`11.*\`, \`10.*\`, etc.) may not be.

## What next?

For more on accessing and choosing GPUs on Modal, check out [this guide](/docs/guide/gpu).
To dive deep on GPU internals, check out our [GPU Glossary](/gpu-glossary/readme).

To see these installation patterns in action, check out these examples:

- [Fast LLM inference on big GPUs](/docs/examples/llm_inference)
- [Finetune a character LoRA for your pet](/docs/examples/diffusers_lora_finetune)
- [Optimized Flux inference](/docs/examples/flux)
`,meta:{title:`Using CUDA on Modal`,description:`Modal makes it easy to accelerate your workloads with datacenter-grade NVIDIA GPUs.`}},{crossLinks:m,toc:h,rawContent:g,meta:_}=p,ae=t(`with a simple <code>pip_install</code>`,1),oe=t(`<em>kernel-mode driver components</em>`),se=t(`<code>cuMemAlloc</code>`),ce=t(`<code>nvidia-smi</code>`),le=t(`<code>cudaLaunchKernel</code>`),ue=t(`<code>nvrtc</code>`),de=t(`Install GPU-accelerated <code>torch</code> and <code>transformers</code> with <code>pip_install</code>`,1),fe=t(`<code>nvidia-cuda-runtime-cu12</code>`),pe=t(`<code>nvidia-cuda-nvrtc-cu12</code>`),me=t(`the <code>pip_install</code> method of <code>modal.Image</code>`,1),he=t(`<code>nvidia/cuda:*-devel-*</code> images on Docker Hub`,1),ge=t(`<!> <p>Modal makes it easy to accelerate your workloads with datacenter-grade NVIDIA GPUs.</p> <p>To take advantage of the hardware, you need to use matching software: the CUDA stack.
This guide explains the components of that stack and how to install them on Modal.
For more on which GPUs are available on Modal and how to choose a GPU for your use case,
see <!>. For a deep dive on both the <!> and <!> and for even more detail on <!>,
see our <!>.</p> <p>Here’s the tl;dr:</p> <ul><li>The <!>, version 580.95.05,
and <!>, version 13.0, are already installed.
You can call <code>nvidia-smi</code> or run compiled CUDA programs from any Modal Function with access to a GPU.</li> <li>That means you can install many popular libraries like <code>torch</code> that bundle their other CUDA dependencies <!>.</li> <li>For bleeding-edge libraries like <code>flash-attn</code>, you may need to install CUDA dependencies manually.
To make your life easier, <!>.</li></ul> <!> <p>When someone refers to “installing CUDA” or “using CUDA”,
they are referring not to a library, but to a <!> with multiple layers.
Your application code (and its dependencies) can interact
with the stack at different levels.</p> <p><!></p> <p>This leads to a lot of confusion. To help clear that up, the following sections explain each component in detail.</p> <!> <p>At the lowest level are the <!>.
The Linux kernel is essentially a single program operating the entire machine and all of its hardware.
To add hardware to the machine, this program is extended by loading new modules into it.
These components communicate directly with hardware — in this case the GPU.</p> <p>Because they are kernel modules, these driver components are tightly integrated with the host operating system
that runs your containerized Modal Functions and are not something you can inspect or change yourself.</p> <!> <p>All action in Linux that doesn’t occur in the kernel occurs in <!>.
To talk to the kernel drivers from our user space programs, we need <em>user-mode driver components</em>.</p> <p>Most prominently, that includes:</p> <ul><li>the <!>,
a <!> called <code>libcuda.so</code>.
This object exposes functions like <!>,
for allocating GPU memory.</li> <li>the <!>, <code>libnvidia-ml.so</code>, and its command line interface <!>.
You can use these tools to check the status of the system’s GPU(s).</li></ul> <p>These components are installed on all Modal machines with access to GPUs.
Because they are user-level components, you can use them directly:</p> <!> <!> <p>Wrapping the CUDA Driver API is the <!>, the <code>libcudart.so</code> shared library.
This API includes functions like <!> and is more commonly used in CUDA programs (see <!> for color commentary on why).
This shared library is <em>not</em> installed by default on Modal.</p> <p>The CUDA Runtime API is generally installed as part of the larger <!>,
which includes the <!> (<code>nvcc</code>) and its toolchain
and a number of <!> for writing and debugging CUDA programs (<code>cuobjdump</code>, <code>cudnn</code>, profilers, etc.).</p> <p>Contemporary GPU-accelerated machine learning workloads like LLM inference frequently make use of many components of the CUDA Toolkit,
such as the run-time compilation library <!>.</p> <p>So why aren’t these components installed along with the drivers?
A compiled CUDA program can run without the CUDA Runtime API installed on the system,
by <!> the CUDA Runtime API into the program binary,
though this is fairly uncommon for CUDA-accelerated Python programs.
Additionally, older versions of these components are needed for some applications
and some application deployments even use several versions at once.
Both patterns are compatible with the host machine driver provided on Modal.</p> <!> <p>The components of the CUDA Toolkit can be installed via <code>pip</code>,
via PyPI packages like <!> and <!>.
These components are listed as dependencies of some popular GPU-accelerated Python libraries, like <code>torch</code>.</p> <p>Because Modal already includes the lower parts of the CUDA stack, you can install these libraries
with <!>, just like any other Python library:</p> <!> <p>Many libraries for running open-weights models, like <code>transformers</code> and <code>vllm</code>,
use <code>torch</code> under the hood and so can be installed in the same way:</p> <!> <!> <p>The disadvantage of installing the CUDA stack via <code>pip</code> is that
many other libraries that depend on its components being installed as normal system packages cannot find them.</p> <p>For these cases, we recommend you use an image that already has the full CUDA stack installed as system packages
and all environment variables set correctly, like the <!>.</p> <p><!> is an inference engine that accelerates and optimizes performance for the large language models. It requires the full CUDA toolkit for installation.</p> <!> <p>Make sure to choose a version of CUDA that is no greater than the version provided by the host machine.
Older versions in the <code>12.*</code> and <code>13.*</code> series are guaranteed to be compatible with the host machine’s driver,
but older major versions (<code>11.*</code>, <code>10.*</code>, etc.) may not be.</p> <!> <p>For more on accessing and choosing GPUs on Modal, check out <!>.
To dive deep on GPU internals, check out our <!>.</p> <p>To see these installation patterns in action, check out these examples:</p> <ul><li><!></li> <li><!></li> <li><!></li></ul>`,1);function v(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ge(),d=te(a);ne(d,{id:`using-cuda-on-modal`,children:(e,t)=>{s(),i(e,r(`Using CUDA on Modal`))},$$slots:{default:!0}});var p=o(d,4),m=o(e(p));f(m,{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}});var h=o(m,2);f(h,{href:`/gpu-glossary/device-hardware`,children:(e,t)=>{s(),i(e,r(`GPU hardware`))},$$slots:{default:!0}});var g=o(h,2);f(g,{href:`/gpu-glossary/device-software`,children:(e,t)=>{s(),i(e,r(`software`))},$$slots:{default:!0}});var _=o(g,2);f(_,{href:`/gpu-glossary/host-software/`,children:(e,t)=>{s(),i(e,r(`the CUDA stack`))},$$slots:{default:!0}}),f(o(_,2),{href:`/gpu-glossary/readme`,children:(e,t)=>{s(),i(e,r(`GPU Glossary`))},$$slots:{default:!0}}),s(),n(p);var v=o(p,4),y=e(v),_e=o(e(y));f(_e,{href:`https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#driver-installation`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVIDIA Accelerated Graphics Driver for Linux-x86_64`))},$$slots:{default:!0}}),f(o(_e,2),{href:`https://docs.nvidia.com/cuda/archive/13.0.0/cuda-driver-api/index.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CUDA Driver API`))},$$slots:{default:!0}}),s(3),n(y);var b=o(y,2);f(o(e(b),3),{href:`#install-gpu-accelerated-torch-and-transformers-with-pip_install`,children:(e,t)=>{s();var n=ae();s(),i(e,n)},$$slots:{default:!0}}),s(),n(b);var x=o(b,2);f(o(e(x),3),{href:`#for-more-complex-setups-use-an-officially-supported-cuda-image`,children:(e,t)=>{s(),i(e,r(`use an existing image`))},$$slots:{default:!0}}),s(),n(x),n(v);var S=o(v,2);c(S,{id:`what-is-cuda`,children:(e,t)=>{s(),i(e,r(`What is CUDA?`))},$$slots:{default:!0}});var C=o(S,2);f(o(e(C)),{href:`/gpu-glossary/host-software/cuda-software-platform`,children:(e,t)=>{s(),i(e,r(`stack`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);re(e(w),{get src(){return ie},alt:`The CUDA stack`}),n(w);var T=o(w,4);l(T,{id:`level-0-kernel-mode-driver-components`,children:(e,t)=>{s(),i(e,r(`Level 0: Kernel-mode driver components`))},$$slots:{default:!0}});var E=o(T,2);f(o(e(E)),{href:`https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#nvidia-open-gpu-kernel-modules`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(E);var D=o(E,4);l(D,{id:`level-1-user-mode-driver-api`,children:(e,t)=>{s(),i(e,r(`Level 1: User-mode driver API`))},$$slots:{default:!0}});var O=o(D,2);f(o(e(O)),{href:`https://en.wikipedia.org/wiki/User_space`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`user space`))},$$slots:{default:!0}}),s(3),n(O);var k=o(O,4),A=e(k),j=o(e(A));f(j,{href:`/gpu-glossary/host-software/cuda-driver-api`,children:(e,t)=>{s(),i(e,r(`CUDA Driver API`))},$$slots:{default:!0}});var M=o(j,2);f(M,{href:`https://en.wikipedia.org/wiki/Shared_library`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`shared object`))},$$slots:{default:!0}}),f(o(M,4),{href:`https://docs.nvidia.com/cuda/archive/12.8.0/cuda-driver-api/group__CUDA__MEM.html#group__CUDA__MEM_1gb82d2a09844a58dd9e744dc31e8aa467`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(A);var N=o(A,2),P=o(e(N));f(P,{href:`https://developer.nvidia.com/management-library-nvml`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVIDIA management library`))},$$slots:{default:!0}}),f(o(P,4),{href:`https://developer.nvidia.com/system-management-interface`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(N),n(k);var F=o(k,4);u(F,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(gpu%3D%22any%22)%0Adef%20check_nvidia_smi()%3A%0A%20%20%20%20import%20subprocess%0A%20%20%20%20output%20%3D%20subprocess.check_output(%5B%22nvidia-smi%22%5D%2C%20text%3DTrue)%0A%20%20%20%20assert%20%22Driver%20Version%3A%22%20in%20output%0A%20%20%20%20assert%20%22CUDA%20Version%3A%22%20in%20output%0A%20%20%20%20print(output)%0A%20%20%20%20return%20output`,lang:`python`});var I=o(F,2);l(I,{id:`level-2-cuda-toolkit`,children:(e,t)=>{s(),i(e,r(`Level 2: CUDA Toolkit`))},$$slots:{default:!0}});var L=o(I,2),R=o(e(L));f(R,{href:`/gpu-glossary/host-software/cuda-runtime-api`,children:(e,t)=>{s(),i(e,r(`CUDA Runtime API`))},$$slots:{default:!0}});var ve=o(R,4);f(ve,{href:`https://docs.nvidia.com/cuda/archive/12.8.0/cuda-runtime-api/group__CUDART__HIGHLEVEL.html#group__CUDART__HIGHLEVEL_1g7656391f2e52f569214adbfc19689eb3`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),f(o(ve,2),{href:`https://news.ycombinator.com/item?id=20616385`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this HackerNews comment`))},$$slots:{default:!0}}),s(3),n(L);var z=o(L,2),B=o(e(z));f(B,{href:`https://docs.nvidia.com/cuda/index.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVIDIA CUDA Toolkit`))},$$slots:{default:!0}});var V=o(B,2);f(V,{href:`/gpu-glossary/host-software/nvcc`,children:(e,t)=>{s(),i(e,r(`NVIDIA CUDA compiler driver`))},$$slots:{default:!0}}),f(o(V,4),{href:`/gpu-glossary/host-software/cuda-binary-utilities`,children:(e,t)=>{s(),i(e,r(`useful goodies`))},$$slots:{default:!0}}),s(5),n(z);var H=o(z,2);f(o(e(H)),{href:`https://docs.nvidia.com/cuda/archive/12.8.0/nvrtc/index.html`,rel:`nofollow`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);f(o(e(U)),{href:`https://en.wikipedia.org/wiki/Static_library`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`statically linking`))},$$slots:{default:!0}}),s(),n(U);var W=o(U,2);c(W,{id:`install-gpu-accelerated-torch-and-transformers-with-pip_install`,children:(e,t)=>{s();var n=de();s(5),i(e,n)},$$slots:{default:!0}});var G=o(W,2),K=o(e(G),3);f(K,{href:`https://pypi.org/project/nvidia-cuda-runtime-cu12/`,rel:`nofollow`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),f(o(K,2),{href:`https://pypi.org/project/nvidia-cuda-nvrtc-cu12/`,rel:`nofollow`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(3),n(G);var q=o(G,2);f(o(e(q)),{href:`/docs/guide/images#add-python-packages-with-pip_install`,children:(e,t)=>{s();var n=me();s(3),i(e,n)},$$slots:{default:!0}}),s(),n(q);var J=o(q,2);u(J,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22torch%22)%0A%0A%0A%40app.function(gpu%3D%22any%22%2C%20image%3Dimage)%0Adef%20run_torch()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20has_cuda%20%3D%20torch.cuda.is_available()%0A%20%20%20%20print(f%22It%20is%20%7Bhas_cuda%7D%20that%20torch%20can%20access%20CUDA%22)%0A%20%20%20%20return%20has_cuda`,lang:`python`});var ye=o(J,4);u(ye,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22transformers%5Btorch%5D%22)%0Aimage%20%3D%20image.apt_install(%22ffmpeg%22)%20%20%23%20for%20audio%20processing%0A%0A%0A%40app.function(gpu%3D%22any%22%2C%20image%3Dimage)%0Adef%20run_transformers()%3A%0A%20%20%20%20from%20transformers%20import%20pipeline%0A%20%20%20%20transcriber%20%3D%20pipeline(model%3D%22openai%2Fwhisper-tiny.en%22%2C%20device%3D%22cuda%22)%0A%20%20%20%20result%20%3D%20transcriber(%22https%3A%2F%2Fmodal-cdn.com%2Fmlk.flac%22)%0A%20%20%20%20print(result%5B%22text%22%5D)%20%20%23%20I%20have%20a%20dream%20that%20one%20day%20this%20nation%20will%20rise%20up%20live%20out%20the%20true%20meaning%20of%20its%20creed`,lang:`python`});var be=o(ye,2);c(be,{id:`for-more-complex-setups-use-an-officially-supported-cuda-image`,children:(e,t)=>{s(),i(e,r(`For more complex setups, use an officially-supported CUDA image`))},$$slots:{default:!0}});var Y=o(be,4);f(o(e(Y)),{href:`https://hub.docker.com/r/nvidia/cuda`,rel:`nofollow`,children:(e,t)=>{var n=he();s(),i(e,n)},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,2);f(e(X),{href:`https://nvidia.github.io/TensorRT-LLM/overview.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM`))},$$slots:{default:!0}}),s(),n(X);var xe=o(X,2);u(xe,{code:`cuda_version%20%3D%20%2212.8.1%22%20%20%23%20should%20be%20no%20greater%20than%20host%20CUDA%20version%0Aflavor%20%3D%20%22devel%22%20%20%23%20includes%20full%20CUDA%20toolkit%0Aoperating_sys%20%3D%20%22ubuntu24.04%22%0Atag%20%3D%20f%22%7Bcuda_version%7D-%7Bflavor%7D-%7Boperating_sys%7D%22%0AHF_CACHE_PATH%20%3D%20%22%2Fcache%22%0A%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(f%22nvidia%2Fcuda%3A%7Btag%7D%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%20%20%23%20remove%20verbose%20logging%20by%20base%20image%20on%20entry%0A%20%20%20%20.apt_install(%22libopenmpi-dev%22)%20%20%23%20required%20for%20tensorrt%0A%20%20%20%20.pip_install(%22tensorrt-llm%3D%3D0.19.0%22%2C%20%22pynvml%22%2C%20extra_index_url%3D%22https%3A%2F%2Fpypi.nvidia.com%22)%0A%20%20%20%20.pip_install(%22hf-transfer%22%2C%20%22huggingface_hub%5Bhf_xet%5D%22)%0A%20%20%20%20.env(%7B%22HF_HUB_CACHE%22%3A%20HF_CACHE_PATH%2C%20%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%2C%20%22PMIX_MCA_gds%22%3A%20%22hash%22%7D)%0A)%0A%0A%0Aapp%20%3D%20modal.App(%22tensorrt-llm%22%2C%20image%3Dimage)%0Ahf_cache_volume%20%3D%20modal.Volume.from_name(%22hf_cache_tensorrt%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.function(gpu%3D%22A10G%22%2C%20volumes%3D%7BHF_CACHE_PATH%3A%20hf_cache_volume%7D)%0Adef%20run_tiny_model()%3A%0A%20%20%20%20from%20tensorrt_llm%20import%20LLM%2C%20SamplingParams%0A%0A%20%20%20%20sampling_params%20%3D%20SamplingParams(temperature%3D0.8%2C%20top_p%3D0.95)%0A%0A%20%20%20%20llm%20%3D%20LLM(model%3D%22TinyLlama%2FTinyLlama-1.1B-Chat-v1.0%22)%0A%0A%20%20%20%20output%20%3D%20llm.generate(%22The%20capital%20of%20France%20is%22%2C%20sampling_params)%0A%20%20%20%20print(f%22Generated%20text%3A%20%7Boutput.outputs%5B0%5D.text%7D%22)%0A%20%20%20%20return%20output.outputs%5B0%5D.text`,lang:`python`});var Se=o(xe,4);c(Se,{id:`what-next`,children:(e,t)=>{s(),i(e,r(`What next?`))},$$slots:{default:!0}});var Z=o(Se,2),Ce=o(e(Z));f(Ce,{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),f(o(Ce,2),{href:`/gpu-glossary/readme`,children:(e,t)=>{s(),i(e,r(`GPU Glossary`))},$$slots:{default:!0}}),s(),n(Z);var we=o(Z,4),Q=e(we);f(e(Q),{href:`/docs/examples/llm_inference`,children:(e,t)=>{s(),i(e,r(`Fast LLM inference on big GPUs`))},$$slots:{default:!0}}),n(Q);var $=o(Q,2);f(e($),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{s(),i(e,r(`Finetune a character LoRA for your pet`))},$$slots:{default:!0}}),n($);var Te=o($,2);f(e(Te),{href:`/docs/examples/flux`,children:(e,t)=>{s(),i(e,r(`Optimized Flux inference`))},$$slots:{default:!0}}),n(Te),n(we),i(t,a)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DQLNSLeO2.js.map
