(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4c6e2ff6-968e-410d-92fe-e47ceaeb034b`,e._sentryDebugIdIdentifier=`sentry-dbid-4c6e2ff6-968e-410d-92fe-e47ceaeb034b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Installing the CUDA Toolkit on Modal`,id:`installing-the-cuda-toolkit-on-modal`}],rawContent:`# Installing the CUDA Toolkit on Modal

This code sample is intended to quickly show how different layers of the CUDA stack are used on Modal.
For greater detail, see our [guide to using CUDA on Modal](https://modal.com/docs/guide/cuda).

All Modal Functions with GPUs already have the NVIDIA CUDA drivers,
NVIDIA System Management Interface, and CUDA Driver API installed.

\`\`\`python
import modal

app = modal.App("example-install-cuda")


@app.function(gpu="T4")
def nvidia_smi():
    import subprocess

    subprocess.run(["nvidia-smi"], check=True)


\`\`\`

This is enough to install and use many CUDA-dependent libraries, like PyTorch.

\`\`\`python
@app.function(gpu="T4", image=modal.Image.debian_slim().uv_pip_install("torch"))
def torch_cuda():
    import torch

    print(torch.cuda.get_device_properties("cuda:0"))


\`\`\`

If your application or its dependencies need components of the CUDA toolkit,
like the \`nvcc\` compiler driver, installed as system libraries or command-line tools,
you'll need to install those manually.

We recommend the official NVIDIA CUDA Docker images from Docker Hub.
You'll need to add Python 3 and pip with the \`add_python\` option because the image
doesn't have these by default.

\`\`\`python
ctk_image = modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11"
).entrypoint([])  # removes chatty prints on entry


@app.function(gpu="T4", image=ctk_image)
def nvcc_version():
    import subprocess

    return subprocess.run(["nvcc", "--version"], check=True)


\`\`\`

You can check that all these functions run by invoking this script with \`modal run\`.

\`\`\`python
@app.local_entrypoint()
def main():
    nvidia_smi.remote()
    torch_cuda.remote()
    nvcc_version.remote()

\`\`\`
`,meta:{title:`Installing the CUDA Toolkit on Modal`,description:`This code sample is intended to quickly show how different layers of the CUDA stack are used on Modal. For greater detail, see our guide to using CUDA on Modal.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This code sample is intended to quickly show how different layers of the CUDA stack are used on Modal.
For greater detail, see our <!>.</p> <p>All Modal Functions with GPUs already have the NVIDIA CUDA drivers,
NVIDIA System Management Interface, and CUDA Driver API installed.</p> <!> <p>This is enough to install and use many CUDA-dependent libraries, like PyTorch.</p> <!> <p>If your application or its dependencies need components of the CUDA toolkit,
like the <code>nvcc</code> compiler driver, installed as system libraries or command-line tools,
you’ll need to install those manually.</p> <p>We recommend the official NVIDIA CUDA Docker images from Docker Hub.
You’ll need to add Python 3 and pip with the <code>add_python</code> option because the image
doesn’t have these by default.</p> <!> <p>You can check that all these functions run by invoking this script with <code>modal run</code>.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`installing-the-cuda-toolkit-on-modal`,children:(e,t)=>{l(),i(e,r(`Installing the CUDA Toolkit on Modal`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide to using CUDA on Modal`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);d(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-install-cuda%22)%0A%0A%0A%40app.function(gpu%3D%22T4%22)%0Adef%20nvidia_smi()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20subprocess.run(%5B%22nvidia-smi%22%5D%2C%20check%3DTrue)%0A%0A`,lang:`python`});var g=c(h,4);d(g,{code:`%40app.function(gpu%3D%22T4%22%2C%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22torch%22))%0Adef%20torch_cuda()%3A%0A%20%20%20%20import%20torch%0A%0A%20%20%20%20print(torch.cuda.get_device_properties(%22cuda%3A0%22))%0A%0A`,lang:`python`});var _=c(g,6);d(_,{code:`ctk_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22nvidia%2Fcuda%3A12.4.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.11%22%0A).entrypoint(%5B%5D)%20%20%23%20removes%20chatty%20prints%20on%20entry%0A%0A%0A%40app.function(gpu%3D%22T4%22%2C%20image%3Dctk_image)%0Adef%20nvcc_version()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20return%20subprocess.run(%5B%22nvcc%22%2C%20%22--version%22%5D%2C%20check%3DTrue)%0A%0A`,lang:`python`}),d(c(_,4),{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20nvidia_smi.remote()%0A%20%20%20%20torch_cuda.remote()%0A%20%20%20%20nvcc_version.remote()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DSeDT66o.js.map
