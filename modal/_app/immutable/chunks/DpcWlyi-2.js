(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bcca3db3-c8a9-4541-835d-c0cf0006d7f4`,e._sentryDebugIdIdentifier=`sentry-dbid-bcca3db3-c8a9-4541-835d-c0cf0006d7f4`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to run Stable Diffusion XL on Modal`,description:`Example code for running Stable Diffusion XL`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,published:!0,category:`Model Library`,layout:`blog`,toc:[{depth:2,value:`Introduction to Stable Diffusion XL`,id:`introduction-to-stable-diffusion-xl`},{depth:2,value:`Why should you run Stable Diffusion XL on Modal?`,id:`why-should-you-run-stable-diffusion-xl-on-modal`},{depth:2,value:`Example code for running the Stable Diffusion XL image generation model on Modal`,id:`example-code-for-running-the-stable-diffusion-xl-image-generation-model-on-modal`}],rawContent:`## Introduction to Stable Diffusion XL

[Stable Diffusion XL
(SDXL)](https://stability.ai/news/introducing-stable-diffusion-xl) generates
images of high quality in virtually any art style and is the best open model for
photorealism. It was trained on 1024x1024 images, and it is suitable for
generating images with those resolutions.

## Why should you run Stable Diffusion XL on Modal?

[Modal](https://modal.com) is the best and easiest way to access a
[GPU](/docs/guide/gpu) for running models like Stable Diffusion XL. With Modal,
you just write a Python function, apply a decorator, and deploy.

This flexibility means that you can also easily fine-tune Stable Diffusion XL,
store the LoRA weights, and serve them as a web service, all on Modal
infrastructure.

## Example code for running the Stable Diffusion XL image generation model on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn’t work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

\`\`\`python
import io
import random
from pathlib import Path

import modal

app = modal.App("stable-diffusion-xl-model-library")

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "accelerate==0.33.0",
        "diffusers==0.31.0",
        "fastapi[standard]==0.115.4",
        "huggingface-hub[hf_transfer]==0.25.2",
        "sentencepiece==0.2.0",
        "torch==2.5.1",
        "torchvision==0.20.1",
        "transformers~=4.44.0",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)

with image.imports():
    import torch
    import diffusers

CACHE_DIR = "/cache"
cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.cls(
    image=image,
    gpu="H100",
    volumes={CACHE_DIR: cache_vol},
    timeout=600,
)
class Inference:
    @modal.enter()
    def initialize(self):
        self.pipe = diffusers.DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            cache_dir=CACHE_DIR,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
        )

    @modal.enter()
    def move_to_gpu(self):
        self.pipe.to("cuda")

    @modal.method()
    def run(self, prompt: str, batch_size: int = 4, seed: int = None) -> list[bytes]:
        seed = seed if seed is not None else random.randint(0, 2**32 - 1)
        print("seeding RNG with", seed)
        torch.manual_seed(seed)

        images = self.pipe(
            prompt,
        ).images

        image_output = []
        for image in images:
            with io.BytesIO() as buf:
                image.save(buf, format="PNG")
                image_output.append(buf.getvalue())
        torch.cuda.empty_cache()
        return image_output


@app.local_entrypoint()
def main(prompt: str = "A princess riding on a pony"):
    output_dir = Path("/tmp/stable-diffusion")
    output_dir.mkdir(exist_ok=True)

    images = Inference().run.remote(prompt, batch_size=1)

    for i, image_bytes in enumerate(images):
        output_path = output_dir / f"output_{i:02d}.png"
        output_path.write_bytes(image_bytes)
        print(f"Saved {output_path}")

\`\`\`
`,meta:{description:`Example code for running Stable Diffusion XL`}},{title:m,description:h,authors:g,date:_,length:v,published:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=p,T=t(`<h2 id="introduction-to-stable-diffusion-xl">Introduction to Stable Diffusion XL</h2> <p><!> generates
images of high quality in virtually any art style and is the best open model for
photorealism. It was trained on 1024x1024 images, and it is suitable for
generating images with those resolutions.</p> <h2 id="why-should-you-run-stable-diffusion-xl-on-modal">Why should you run Stable Diffusion XL on Modal?</h2> <p><!> is the best and easiest way to access a <!> for running models like Stable Diffusion XL. With Modal,
you just write a Python function, apply a decorator, and deploy.</p> <p>This flexibility means that you can also easily fine-tune Stable Diffusion XL,
store the LoRA weights, and serve them as a web service, all on Modal
infrastructure.</p> <h2 id="example-code-for-running-the-stable-diffusion-xl-image-generation-model-on-modal">Example code for running the Stable Diffusion XL image generation model on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <!>`,1);function E(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=T(),f=c(s(o),2);d(e(f),{href:`https://stability.ai/news/introducing-stable-diffusion-xl`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Stable Diffusion XL
(SDXL)`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4),m=e(p);d(m,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),d(c(m,2),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,8),g=e(h);d(c(e(g)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(g),l(8),n(h),u(c(h,2),{code:`import%20io%0Aimport%20random%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22stable-diffusion-xl-model-library%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.33.0%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.31.0%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%5Bhf_transfer%5D%3D%3D0.25.2%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.20.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers~%3D4.44.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D)%0A)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20import%20diffusers%0A%0ACACHE_DIR%20%3D%20%22%2Fcache%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_vol%7D%2C%0A%20%20%20%20timeout%3D600%2C%0A)%0Aclass%20Inference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20initialize(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.DiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22stabilityai%2Fstable-diffusion-xl-base-1.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_dir%3DCACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.float16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_safetensors%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20variant%3D%22fp16%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20move_to_gpu(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe.to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20prompt%3A%20str%2C%20batch_size%3A%20int%20%3D%204%2C%20seed%3A%20int%20%3D%20None)%20-%3E%20list%5Bbytes%5D%3A%0A%20%20%20%20%20%20%20%20seed%20%3D%20seed%20if%20seed%20is%20not%20None%20else%20random.randint(0%2C%202**32%20-%201)%0A%20%20%20%20%20%20%20%20print(%22seeding%20RNG%20with%22%2C%20seed)%0A%20%20%20%20%20%20%20%20torch.manual_seed(seed)%0A%0A%20%20%20%20%20%20%20%20images%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20).images%0A%0A%20%20%20%20%20%20%20%20image_output%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20image%20in%20images%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20io.BytesIO()%20as%20buf%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image.save(buf%2C%20format%3D%22PNG%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image_output.append(buf.getvalue())%0A%20%20%20%20%20%20%20%20torch.cuda.empty_cache()%0A%20%20%20%20%20%20%20%20return%20image_output%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(prompt%3A%20str%20%3D%20%22A%20princess%20riding%20on%20a%20pony%22)%3A%0A%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fstable-diffusion%22)%0A%20%20%20%20output_dir.mkdir(exist_ok%3DTrue)%0A%0A%20%20%20%20images%20%3D%20Inference().run.remote(prompt%2C%20batch_size%3D1)%0A%0A%20%20%20%20for%20i%2C%20image_bytes%20in%20enumerate(images)%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20output_dir%20%2F%20f%22output_%7Bi%3A02d%7D.png%22%0A%20%20%20%20%20%20%20%20output_path.write_bytes(image_bytes)%0A%20%20%20%20%20%20%20%20print(f%22Saved%20%7Boutput_path%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{E as default,p as metadata};
//# sourceMappingURL=DpcWlyi-2.js.map
