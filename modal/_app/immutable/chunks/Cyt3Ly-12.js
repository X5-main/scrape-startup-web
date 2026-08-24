(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c154f0d9-2044-4f0e-bcce-76346208a7ec`,e._sentryDebugIdIdentifier=`sentry-dbid-c154f0d9-2044-4f0e-bcce-76346208a7ec`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Flux.1-dev: Run a top text-to-image  model on Modal`,description:`Example usage of the Flux.1-dev image generation model`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,category:`Model Library`,subcategory:`Image and Video Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is Flux.1-dev?`,id:`what-is-flux1-dev`},{depth:2,value:`Why should you run Flux.1-dev on Modal?`,id:`why-should-you-run-flux1-dev-on-modal`},{depth:2,value:`Example code for running the Flux.1-dev model on Modal`,id:`example-code-for-running-the-flux1-dev-model-on-modal`},{depth:2,value:`Performance Considerations`,id:`performance-considerations`}],rawContent:`## What is Flux.1-dev?

[Flux.1-dev](https://huggingface.co/black-forest-labs/FLUX.1-dev) is a powerful text-to-image model from Black Forest Labs.

## Why should you run Flux.1-dev on Modal?

If you are looking to run Flux.1-dev, you will need access to a GPU in order for
the inference times to be fast. There are several ways to get a GPU, but the
easiest way is to use [Modal](https://modal.com).

Modal is a cloud platform designed specifically for running machine learning
workloads. Unlike traditional cloud services that require complex infrastructure
management, Modal provides a serverless environment where you can deploy AI
models with just a few lines of Python code.

## Example code for running the Flux.1-dev model on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn’t work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

Please note that this code is not optimized. For a more detailed example of how to run Flux fast with \`torch.compile\`, refer [here](/docs/examples/flux).

\`\`\`python
import time
from io import BytesIO
from pathlib import Path

import modal


diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

cuda_dev_image = modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11"
).entrypoint([])

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
    .pip_install(
        "invisible_watermark==0.2.0",
        "transformers==4.44.0",
        "huggingface_hub[hf_transfer]==0.26.2",
        "accelerate==0.33.0",
        "safetensors==0.4.4",
        "sentencepiece==0.2.0",
        "torch==2.5.0",
        f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
        "numpy<2",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)

app = modal.App("flux", image=flux_image)

with flux_image.imports():
    import diffusers
    import torch


@app.cls(gpu="H100", timeout=3600, secrets=[modal.Secret.from_name("huggingface")])
class Model:
    @modal.enter()
    def enter(self):
        self.pipe = diffusers.FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev", torch_dtype=torch.bfloat16
        ).to("cuda")

    @modal.method()
    def inference(self, prompt: str) -> bytes:
        print("Generating image...")
        image = self.pipe(
            prompt,
            output_type="pil",
            num_inference_steps=4,
        ).images[0]

        byte_stream = BytesIO()
        image.save(byte_stream, format="JPEG")
        return byte_stream.getvalue()


@app.local_entrypoint()
def main(prompt: str = "A majestic dragon soaring over snow-capped mountains"):
    output_dir = Path("/tmp/flux")
    output_dir.mkdir(exist_ok=True)

    t0 = time.time()
    image_bytes = Model().inference.remote(prompt)
    print(f"Generation time: {time.time() - t0:.2f} seconds")

    output_path = output_dir / "output.jpg"
    output_path.write_bytes(image_bytes)
    print(f"Saved to {output_path}")
\`\`\`

## Performance Considerations

The model generates images up to 1024x1024 resolution, with generation time
typically ranging from 2-4 seconds on an H100 GPU. Batch processing can
significantly improve throughput for bulk image generation tasks.
`,meta:{description:`Example usage of the Flux.1-dev image generation model`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="what-is-flux1-dev">What is Flux.1-dev?</h2> <p><!> is a powerful text-to-image model from Black Forest Labs.</p> <h2 id="why-should-you-run-flux1-dev-on-modal">Why should you run Flux.1-dev on Modal?</h2> <p>If you are looking to run Flux.1-dev, you will need access to a GPU in order for
the inference times to be fast. There are several ways to get a GPU, but the
easiest way is to use <!>.</p> <p>Modal is a cloud platform designed specifically for running machine learning
workloads. Unlike traditional cloud services that require complex infrastructure
management, Modal provides a serverless environment where you can deploy AI
models with just a few lines of Python code.</p> <h2 id="example-code-for-running-the-flux1-dev-model-on-modal">Example code for running the Flux.1-dev model on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <p>Please note that this code is not optimized. For a more detailed example of how to run Flux fast with <code>torch.compile</code>, refer <!>.</p> <!> <h2 id="performance-considerations">Performance Considerations</h2> <p>The model generates images up to 1024x1024 resolution, with generation time
typically ranging from 2-4 seconds on an H100 GPU. Batch processing can
significantly improve throughput for bulk image generation tasks.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2);d(e(f),{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flux.1-dev`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4);d(c(e(p)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,8),h=e(m);d(c(e(h)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(h),l(8),n(m);var g=c(m,2);d(c(e(g),3),{href:`/docs/examples/flux`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(g),u(c(g,2),{code:`import%20time%0Afrom%20io%20import%20BytesIO%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0A%0Adiffusers_commit_sha%20%3D%20%2281cf3b2f155f1de322079af28f625349ee21ec6b%22%0A%0Acuda_dev_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22nvidia%2Fcuda%3A12.4.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.11%22%0A).entrypoint(%5B%5D)%0A%0Aflux_image%20%3D%20(%0A%20%20%20%20cuda_dev_image.apt_install(%0A%20%20%20%20%20%20%20%20%22git%22%2C%0A%20%20%20%20%20%20%20%20%22libglib2.0-0%22%2C%0A%20%20%20%20%20%20%20%20%22libsm6%22%2C%0A%20%20%20%20%20%20%20%20%22libxrender1%22%2C%0A%20%20%20%20%20%20%20%20%22libxext6%22%2C%0A%20%20%20%20%20%20%20%20%22ffmpeg%22%2C%0A%20%20%20%20%20%20%20%20%22libgl1%22%2C%0A%20%20%20%20)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22invisible_watermark%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.44.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%5Bhf_transfer%5D%3D%3D0.26.2%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.33.0%22%2C%0A%20%20%20%20%20%20%20%20%22safetensors%3D%3D0.4.4%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.0%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2Fhuggingface%2Fdiffusers.git%40%7Bdiffusers_commit_sha%7D%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D)%0A)%0A%0Aapp%20%3D%20modal.App(%22flux%22%2C%20image%3Dflux_image)%0A%0Awith%20flux_image.imports()%3A%0A%20%20%20%20import%20diffusers%0A%20%20%20%20import%20torch%0A%0A%0A%40app.cls(gpu%3D%22H100%22%2C%20timeout%3D3600%2C%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface%22)%5D)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.FluxPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22black-forest-labs%2FFLUX.1-dev%22%2C%20torch_dtype%3Dtorch.bfloat16%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20prompt%3A%20str)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20print(%22Generating%20image...%22)%0A%20%20%20%20%20%20%20%20image%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20output_type%3D%22pil%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3D4%2C%0A%20%20%20%20%20%20%20%20).images%5B0%5D%0A%0A%20%20%20%20%20%20%20%20byte_stream%20%3D%20BytesIO()%0A%20%20%20%20%20%20%20%20image.save(byte_stream%2C%20format%3D%22JPEG%22)%0A%20%20%20%20%20%20%20%20return%20byte_stream.getvalue()%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(prompt%3A%20str%20%3D%20%22A%20majestic%20dragon%20soaring%20over%20snow-capped%20mountains%22)%3A%0A%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fflux%22)%0A%20%20%20%20output_dir.mkdir(exist_ok%3DTrue)%0A%0A%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20image_bytes%20%3D%20Model().inference.remote(prompt)%0A%20%20%20%20print(f%22Generation%20time%3A%20%7Btime.time()%20-%20t0%3A.2f%7D%20seconds%22)%0A%0A%20%20%20%20output_path%20%3D%20output_dir%20%2F%20%22output.jpg%22%0A%20%20%20%20output_path.write_bytes(image_bytes)%0A%20%20%20%20print(f%22Saved%20to%20%7Boutput_path%7D%22)`,lang:`python`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=Cyt3Ly-12.js.map
