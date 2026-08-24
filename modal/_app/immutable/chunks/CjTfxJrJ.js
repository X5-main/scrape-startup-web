(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8a017c28-8048-42b6-90d6-9c0711521e34`,e._sentryDebugIdIdentifier=`sentry-dbid-8a017c28-8048-42b6-90d6-9c0711521e34`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (import_torch.py)`,id:`example-import_torchpy`}],rawContent:`# Example (import_torch.py)

This is the source code for **06_gpu_and_ml.import_torch**.
\`\`\`python
import modal

app = modal.App("example-import-torch")


torch_image = modal.Image.debian_slim().uv_pip_install(
    "torch==2.7",
    extra_index_url="https://download.pytorch.org/whl/cu128",
    force_build=True,  # trigger a build every time, just for demonstration purposes
    # remove if you're using this in production!
)


@app.function(gpu="B200", image=torch_image)
def torch() -> list[list[int]]:
    import math

    import torch

    print(torch.cuda.get_device_properties("cuda:0"))

    matrix = torch.randn(1024, 1024) / math.sqrt(1024)
    matrix = matrix @ matrix

    return matrix.detach().cpu().tolist()


@app.local_entrypoint()
def main():
    print(torch.remote()[:1])

\`\`\`
`,meta:{title:`Example (import_torch.py)`,description:`This is the source code for 06_gpu_and_ml.import_torch.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>06_gpu_and_ml.import_torch</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-import_torchpy`,children:(e,r)=>{s(),n(e,t(`Example (import_torch.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-import-torch%22)%0A%0A%0Atorch_image%20%3D%20modal.Image.debian_slim().uv_pip_install(%0A%20%20%20%20%22torch%3D%3D2.7%22%2C%0A%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20force_build%3DTrue%2C%20%20%23%20trigger%20a%20build%20every%20time%2C%20just%20for%20demonstration%20purposes%0A%20%20%20%20%23%20remove%20if%20you're%20using%20this%20in%20production!%0A)%0A%0A%0A%40app.function(gpu%3D%22B200%22%2C%20image%3Dtorch_image)%0Adef%20torch()%20-%3E%20list%5Blist%5Bint%5D%5D%3A%0A%20%20%20%20import%20math%0A%0A%20%20%20%20import%20torch%0A%0A%20%20%20%20print(torch.cuda.get_device_properties(%22cuda%3A0%22))%0A%0A%20%20%20%20matrix%20%3D%20torch.randn(1024%2C%201024)%20%2F%20math.sqrt(1024)%0A%20%20%20%20matrix%20%3D%20matrix%20%40%20matrix%0A%0A%20%20%20%20return%20matrix.detach().cpu().tolist()%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20print(torch.remote()%5B%3A1%5D)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=CjTfxJrJ.js.map
