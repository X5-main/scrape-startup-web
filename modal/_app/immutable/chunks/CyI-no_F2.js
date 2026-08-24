(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c677c504-f6e8-47ee-92f5-66e6604ae221`,e._sentryDebugIdIdentifier=`sentry-dbid-c677c504-f6e8-47ee-92f5-66e6604ae221`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to deploy Stable Diffusion 3.5 Large on Modal`,description:`Example code for running Stable Diffusion 3.5 Large Turbo`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,published:!0,category:`Model Library`,subcategory:`Image and Video Models`,layout:`blog`,toc:[{depth:2,value:`Introduction to Stable Diffusion 3.5 Large`,id:`introduction-to-stable-diffusion-35-large`},{depth:2,value:`Why should you run Stable Diffusion 3.5 Large on Modal?`,id:`why-should-you-run-stable-diffusion-35-large-on-modal`},{depth:2,value:`Example code for running Stable Diffusion 3.5 Large on Modal`,id:`example-code-for-running-stable-diffusion-35-large-on-modal`},{depth:2,value:`Tips and tricks for serving Stable Diffusion 3.5 Large fast`,id:`tips-and-tricks-for-serving-stable-diffusion-35-large-fast`}],rawContent:`## Introduction to Stable Diffusion 3.5 Large

Stable Diffusion 3.5 Large is the most powerful model in the [Stable Diffusion
family](https://stability.ai/news/introducing-stable-diffusion-3-5). This model
is ideal for professional use cases, offering advanced capabilities for
generating high-quality images from textual descriptions. Along with Flux.1-dev,
it's the premier open-source image generation model available today.

Our example code shows how
shows how to run a distilled version, Stable Diffusion 3.5 Large Turbo, which
generates high-quality images with exceptional prompt adherence in just 4 steps,
making it considerably faster than the original Stable Diffusion 3.5 Large.

## Why should you run Stable Diffusion 3.5 Large on Modal?

[Modal](https://modal.com) is the best and easiest way to access a
[GPU](/docs/guide/gpu) for running models like Stable Diffusion 3.5 Large. With
Modal, you just write a Python function, apply a decorator, and deploy.

This flexibility means that you can also easily fine-tune Stable Diffusion 3.5, store the LoRA weights, and serve them as a web service, all on Modal
infrastructure.

## Example code for running Stable Diffusion 3.5 Large on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn’t work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

Please note that this code does not come with a UI. For a more detailed example of how to run Stable Diffusion 3.5 Large Turbo as a CLI, API, and UI, refer [here](/docs/examples/text_to_image).

\`\`\`python
import io
import random
from pathlib import Path

import modal

app = modal.App("stable-diffusion-large-model-library")

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
    import diffusers
    import torch

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
        self.pipe = diffusers.StableDiffusion3Pipeline.from_pretrained(
            "adamo1139/stable-diffusion-3.5-large-turbo-ungated",
            revision="9ad870ac0b0e5e48ced156bb02f85d324b7275d2",
            cache_dir=CACHE_DIR,
            torch_dtype=torch.bfloat16,
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
            num_images_per_prompt=batch_size,
            num_inference_steps=4,
            guidance_scale=0.0,
            max_sequence_length=512,
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

## Tips and tricks for serving Stable Diffusion 3.5 Large fast

- **Use a powerful GPU**: Ensure you are using a [high-performance GPU](/docs/guide/gpu) like the H100 to maximize inference speed.
- **Optimize batch size**: Experiment with different batch sizes to find the optimal setting for your use case. Larger batch sizes can improve throughput but may require more memory.
- **Use caching**: Implement caching strategies for frequently requested images to speed up response times.
`,meta:{description:`Example code for running Stable Diffusion 3.5 Large Turbo`}},{title:m,description:h,authors:g,date:_,length:v,published:y,category:b,subcategory:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="introduction-to-stable-diffusion-35-large">Introduction to Stable Diffusion 3.5 Large</h2> <p>Stable Diffusion 3.5 Large is the most powerful model in the <!>. This model
is ideal for professional use cases, offering advanced capabilities for
generating high-quality images from textual descriptions. Along with Flux.1-dev,
it’s the premier open-source image generation model available today.</p> <p>Our example code shows how
shows how to run a distilled version, Stable Diffusion 3.5 Large Turbo, which
generates high-quality images with exceptional prompt adherence in just 4 steps,
making it considerably faster than the original Stable Diffusion 3.5 Large.</p> <h2 id="why-should-you-run-stable-diffusion-35-large-on-modal">Why should you run Stable Diffusion 3.5 Large on Modal?</h2> <p><!> is the best and easiest way to access a <!> for running models like Stable Diffusion 3.5 Large. With
Modal, you just write a Python function, apply a decorator, and deploy.</p> <p>This flexibility means that you can also easily fine-tune Stable Diffusion 3.5, store the LoRA weights, and serve them as a web service, all on Modal
infrastructure.</p> <h2 id="example-code-for-running-stable-diffusion-35-large-on-modal">Example code for running Stable Diffusion 3.5 Large on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <p>Please note that this code does not come with a UI. For a more detailed example of how to run Stable Diffusion 3.5 Large Turbo as a CLI, API, and UI, refer <!>.</p> <!> <h2 id="tips-and-tricks-for-serving-stable-diffusion-35-large-fast">Tips and tricks for serving Stable Diffusion 3.5 Large fast</h2> <ul><li><strong>Use a powerful GPU</strong>: Ensure you are using a <!> like the H100 to maximize inference speed.</li> <li><strong>Optimize batch size</strong>: Experiment with different batch sizes to find the optimal setting for your use case. Larger batch sizes can improve throughput but may require more memory.</li> <li><strong>Use caching</strong>: Implement caching strategies for frequently requested images to speed up response times.</li></ul>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2);d(c(e(f)),{href:`https://stability.ai/news/introducing-stable-diffusion-3-5`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Stable Diffusion
family`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,6),m=e(p);d(m,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),d(c(m,2),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,8),g=e(h);d(c(e(g)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(g),l(8),n(h);var _=c(h,2);d(c(e(_)),{href:`/docs/examples/text_to_image`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{code:`import%20io%0Aimport%20random%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22stable-diffusion-large-model-library%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D0.33.0%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.31.0%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%5Bhf_transfer%5D%3D%3D0.25.2%22%2C%0A%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.20.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers~%3D4.44.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D)%0A)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20diffusers%0A%20%20%20%20import%20torch%0A%0ACACHE_DIR%20%3D%20%22%2Fcache%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_vol%7D%2C%0A%20%20%20%20timeout%3D600%2C%0A)%0Aclass%20Inference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20initialize(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20diffusers.StableDiffusion3Pipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22adamo1139%2Fstable-diffusion-3.5-large-turbo-ungated%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3D%229ad870ac0b0e5e48ced156bb02f85d324b7275d2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_dir%3DCACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20move_to_gpu(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe.to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20prompt%3A%20str%2C%20batch_size%3A%20int%20%3D%204%2C%20seed%3A%20int%20%3D%20None)%20-%3E%20list%5Bbytes%5D%3A%0A%20%20%20%20%20%20%20%20seed%20%3D%20seed%20if%20seed%20is%20not%20None%20else%20random.randint(0%2C%202**32%20-%201)%0A%20%20%20%20%20%20%20%20print(%22seeding%20RNG%20with%22%2C%20seed)%0A%20%20%20%20%20%20%20%20torch.manual_seed(seed)%0A%0A%20%20%20%20%20%20%20%20images%20%3D%20self.pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_images_per_prompt%3Dbatch_size%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3D4%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20guidance_scale%3D0.0%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20max_sequence_length%3D512%2C%0A%20%20%20%20%20%20%20%20).images%0A%0A%20%20%20%20%20%20%20%20image_output%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20image%20in%20images%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20io.BytesIO()%20as%20buf%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image.save(buf%2C%20format%3D%22PNG%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image_output.append(buf.getvalue())%0A%20%20%20%20%20%20%20%20torch.cuda.empty_cache()%0A%20%20%20%20%20%20%20%20return%20image_output%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(prompt%3A%20str%20%3D%20%22A%20princess%20riding%20on%20a%20pony%22)%3A%0A%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fstable-diffusion%22)%0A%20%20%20%20output_dir.mkdir(exist_ok%3DTrue)%0A%0A%20%20%20%20images%20%3D%20Inference().run.remote(prompt%2C%20batch_size%3D1)%0A%0A%20%20%20%20for%20i%2C%20image_bytes%20in%20enumerate(images)%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20output_dir%20%2F%20f%22output_%7Bi%3A02d%7D.png%22%0A%20%20%20%20%20%20%20%20output_path.write_bytes(image_bytes)%0A%20%20%20%20%20%20%20%20print(f%22Saved%20%7Boutput_path%7D%22)`,lang:`python`});var y=c(v,4),b=e(y);d(c(e(b),2),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`high-performance GPU`))},$$slots:{default:!0}}),l(),n(b),l(4),n(y),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=CyI-no_F2.js.map
