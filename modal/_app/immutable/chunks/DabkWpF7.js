(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`30770da2-f712-428f-ab06-6229177f26ac`,e._sentryDebugIdIdentifier=`sentry-dbid-30770da2-f712-428f-ab06-6229177f26ac`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Install Flash Attention on Modal`,id:`install-flash-attention-on-modal`}],rawContent:`# Install Flash Attention on Modal

FlashAttention is an optimized CUDA library for Transformer
scaled-dot-product attention. Dao AI Lab now publishes pre-compiled
wheels, which makes installation quick.  This script shows how to
1. Pin an exact wheel that matches CUDA 12 / PyTorch 2.6 / Python 3.13.
2. Build a Modal image that installs torch, numpy, and FlashAttention.
3. Launch a GPU function to confirm the kernel runs on a GPU.

\`\`\`python
import modal

app = modal.App("example-install-flash-attn")

\`\`\`

You need to specify an exact release wheel. You can find
[more on their github](https://github.com/Dao-AILab/flash-attention/releases).

\`\`\`python
flash_attn_release = (
    "https://github.com/Dao-AILab/flash-attention/releases/download/v2.7.4.post1/"
    "flash_attn-2.7.4.post1+cu12torch2.6cxx11abiFALSE-cp313-cp313-linux_x86_64.whl"
)

image = modal.Image.debian_slim(python_version="3.13").uv_pip_install(
    "torch==2.6.0", "numpy==2.2.4", flash_attn_release
)


\`\`\`

And here is a demo verifying that it works:

\`\`\`python
@app.function(gpu="L40S", image=image)
def run_flash_attn():
    import torch
    from flash_attn import flash_attn_func

    batch_size, seqlen, nheads, headdim, nheads_k = 2, 4, 3, 16, 3

    q = torch.randn(batch_size, seqlen, nheads, headdim, dtype=torch.float16).to("cuda")
    k = torch.randn(batch_size, seqlen, nheads_k, headdim, dtype=torch.float16).to(
        "cuda"
    )
    v = torch.randn(batch_size, seqlen, nheads_k, headdim, dtype=torch.float16).to(
        "cuda"
    )

    out = flash_attn_func(q, k, v)
    assert out.shape == (batch_size, seqlen, nheads, headdim)

\`\`\`
`,meta:{title:`Install Flash Attention on Modal`,description:`FlashAttention is an optimized CUDA library for Transformer scaled-dot-product attention. Dao AI Lab now publishes pre-compiled wheels, which makes installation quick.  This script shows how to`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>FlashAttention is an optimized CUDA library for Transformer
scaled-dot-product attention. Dao AI Lab now publishes pre-compiled
wheels, which makes installation quick.  This script shows how to</p> <ol><li>Pin an exact wheel that matches CUDA 12 / PyTorch 2.6 / Python 3.13.</li> <li>Build a Modal image that installs torch, numpy, and FlashAttention.</li> <li>Launch a GPU function to confirm the kernel runs on a GPU.</li></ol> <!> <p>You need to specify an exact release wheel. You can find <!>.</p> <!> <p>And here is a demo verifying that it works:</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`install-flash-attention-on-modal`,children:(e,t)=>{l(),i(e,r(`Install Flash Attention on Modal`))},$$slots:{default:!0}});var m=c(f,6);d(m,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-install-flash-attn%22)%0A`,lang:`python`});var h=c(m,2);p(c(e(h)),{href:`https://github.com/Dao-AILab/flash-attention/releases`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`more on their github`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(g,{code:`flash_attn_release%20%3D%20(%0A%20%20%20%20%22https%3A%2F%2Fgithub.com%2FDao-AILab%2Fflash-attention%2Freleases%2Fdownload%2Fv2.7.4.post1%2F%22%0A%20%20%20%20%22flash_attn-2.7.4.post1%2Bcu12torch2.6cxx11abiFALSE-cp313-cp313-linux_x86_64.whl%22%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.13%22).uv_pip_install(%0A%20%20%20%20%22torch%3D%3D2.6.0%22%2C%20%22numpy%3D%3D2.2.4%22%2C%20flash_attn_release%0A)%0A%0A`,lang:`python`}),d(c(g,4),{code:`%40app.function(gpu%3D%22L40S%22%2C%20image%3Dimage)%0Adef%20run_flash_attn()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20flash_attn%20import%20flash_attn_func%0A%0A%20%20%20%20batch_size%2C%20seqlen%2C%20nheads%2C%20headdim%2C%20nheads_k%20%3D%202%2C%204%2C%203%2C%2016%2C%203%0A%0A%20%20%20%20q%20%3D%20torch.randn(batch_size%2C%20seqlen%2C%20nheads%2C%20headdim%2C%20dtype%3Dtorch.float16).to(%22cuda%22)%0A%20%20%20%20k%20%3D%20torch.randn(batch_size%2C%20seqlen%2C%20nheads_k%2C%20headdim%2C%20dtype%3Dtorch.float16).to(%0A%20%20%20%20%20%20%20%20%22cuda%22%0A%20%20%20%20)%0A%20%20%20%20v%20%3D%20torch.randn(batch_size%2C%20seqlen%2C%20nheads_k%2C%20headdim%2C%20dtype%3Dtorch.float16).to(%0A%20%20%20%20%20%20%20%20%22cuda%22%0A%20%20%20%20)%0A%0A%20%20%20%20out%20%3D%20flash_attn_func(q%2C%20k%2C%20v)%0A%20%20%20%20assert%20out.shape%20%3D%3D%20(batch_size%2C%20seqlen%2C%20nheads%2C%20headdim)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DabkWpF7.js.map
