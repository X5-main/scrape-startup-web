(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`491a7d0a-e9bc-4cbe-b1c2-cd136cf59991`,e._sentryDebugIdIdentifier=`sentry-dbid-491a7d0a-e9bc-4cbe-b1c2-cd136cf59991`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Set “fallback” GPUs`,id:`set-fallback-gpus`}],rawContent:`# Set "fallback" GPUs

GPU availabilities on Modal can fluctuate, especially for
tightly-constrained requests, like for eight co-located GPUs
in a specific region.

If your code can run on multiple different GPUs, you can specify
your GPU request as a list, in order of preference, and whenever
your Function scales up, we will try to schedule it on each requested GPU type in order.

The code below demonstrates the usage of the \`gpu\` parameter with a list of GPUs.

\`\`\`python
import subprocess

import modal

app = modal.App("example-gpu-fallbacks")


@app.function(
    gpu=["h100", "a100", "any"],  # "any" means any of L4, A10, or T4
    single_use_containers=True,  # new container each input, so we re-roll the GPU dice every time
)
async def remote(_idx):
    gpu = subprocess.run(
        ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    ).stdout.strip()
    print(gpu)
    return gpu


@app.local_entrypoint()
def local(count: int = 32):
    from collections import Counter

    gpu_counter = Counter(remote.map([i for i in range(count)], order_outputs=False))
    print(f"ran {gpu_counter.total()} times")
    print(f"on the following {len(gpu_counter.keys())} GPUs:", end="\\n")
    print(
        *[f"{gpu.rjust(32)}: {'🔥' * ct}" for gpu, ct in gpu_counter.items()],
        sep="\\n",
    )

\`\`\`
`,meta:{title:`Set “fallback” GPUs`,description:`GPU availabilities on Modal can fluctuate, especially for tightly-constrained requests, like for eight co-located GPUs in a specific region.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>GPU availabilities on Modal can fluctuate, especially for
tightly-constrained requests, like for eight co-located GPUs
in a specific region.</p> <p>If your code can run on multiple different GPUs, you can specify
your GPU request as a list, in order of preference, and whenever
your Function scales up, we will try to schedule it on each requested GPU type in order.</p> <p>The code below demonstrates the usage of the <code>gpu</code> parameter with a list of GPUs.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`set-fallback-gpus`,children:(e,r)=>{s(),n(e,t(`Set “fallback” GPUs`))},$$slots:{default:!0}}),l(o(u,8),{code:`import%20subprocess%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-gpu-fallbacks%22)%0A%0A%0A%40app.function(%0A%20%20%20%20gpu%3D%5B%22h100%22%2C%20%22a100%22%2C%20%22any%22%5D%2C%20%20%23%20%22any%22%20means%20any%20of%20L4%2C%20A10%2C%20or%20T4%0A%20%20%20%20single_use_containers%3DTrue%2C%20%20%23%20new%20container%20each%20input%2C%20so%20we%20re-roll%20the%20GPU%20dice%20every%20time%0A)%0Aasync%20def%20remote(_idx)%3A%0A%20%20%20%20gpu%20%3D%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%22nvidia-smi%22%2C%20%22--query-gpu%3Dname%22%2C%20%22--format%3Dcsv%2Cnoheader%22%5D%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20%20%20%20%20text%3DTrue%2C%0A%20%20%20%20%20%20%20%20stdout%3Dsubprocess.PIPE%2C%0A%20%20%20%20).stdout.strip()%0A%20%20%20%20print(gpu)%0A%20%20%20%20return%20gpu%0A%0A%0A%40app.local_entrypoint()%0Adef%20local(count%3A%20int%20%3D%2032)%3A%0A%20%20%20%20from%20collections%20import%20Counter%0A%0A%20%20%20%20gpu_counter%20%3D%20Counter(remote.map(%5Bi%20for%20i%20in%20range(count)%5D%2C%20order_outputs%3DFalse))%0A%20%20%20%20print(f%22ran%20%7Bgpu_counter.total()%7D%20times%22)%0A%20%20%20%20print(f%22on%20the%20following%20%7Blen(gpu_counter.keys())%7D%20GPUs%3A%22%2C%20end%3D%22%5Cn%22)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20*%5Bf%22%7Bgpu.rjust(32)%7D%3A%20%7B'%F0%9F%94%A5'%20*%20ct%7D%22%20for%20gpu%2C%20ct%20in%20gpu_counter.items()%5D%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=DoOoWSS52.js.map
