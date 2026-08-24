(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b762c03c-c7ba-4feb-8699-f3f3794d6714`,e._sentryDebugIdIdentifier=`sentry-dbid-b762c03c-c7ba-4feb-8699-f3f3794d6714`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to run Llama 3.1 8B Instruct on Modal`,description:`Example code for Llama 3.1 8B Instruct LLM`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,category:`Model Library`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Introduction to Llama 3.1 8B Instruct`,id:`introduction-to-llama-31-8b-instruct`},{depth:2,value:`Licensing terms`,id:`licensing-terms`},{depth:2,value:`GPU requirements`,id:`gpu-requirements`},{depth:2,value:`Example code for running the Llama 3.1 8B Instruct LLM on Modal`,id:`example-code-for-running-the-llama-31-8b-instruct-llm-on-modal`},{depth:2,value:`Additional resources`,id:`additional-resources`}],rawContent:`## Introduction to Llama 3.1 8B Instruct

[Meta Llama 3.1](https://ai.meta.com/blog/meta-llama-3-1/) is a family of
open-source LLMs that includes various models of different
sizes - 8B, 70B, and 405B parameters.
While larger models like the 405B variant are designed to
deliver superior quality, they are also significantly more expensive to run.
Llama 3.1 8B is a good choice for many applications that require a
balance between quality and cost.

## Licensing terms

When using the Llama 3.1 model, it's important to be aware of the [licensing terms](https://www.llama.com/llama3_1/license/) set by Meta.

In particular, if you fine-tune your own model on top of Llama 3.1, you must
prominently include "Built with Llama" on your website or documentation. The
fine-tuned model's name must also start with "Llama".

## GPU requirements

To run the Llama 3.1 model effectively, you will need access to a GPU due to its substantial computational requirements. The easiest way to
access a GPU is through [Modal](https://modal.com), a cloud platform designed
for running machine learning workloads. Modal simplifies the process of
deploying AI models by automatically provisioning the necessary GPU resources,
allowing you to focus on your application without the hassle of managing
infrastructure.

## Example code for running the Llama 3.1 8B Instruct LLM on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn't work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

Please note that this code is not optimized for best performance. To run Llama 3.1 8B Instruct with a LLM serving framework like [vLLM](https://github.com/vllm-project/vllm) for better latency and throughput, refer to this more detailed example [here](/docs/examples/vllm_inference).

\`\`\`python
import modal

MODEL_ID = "NousResearch/Meta-Llama-3-8B"
MODEL_REVISION = "315b20096dc791d381d514deb5f8bd9c8d6d3061"

image = modal.Image.debian_slim().pip_install(
    "transformers==4.49.0", "torch==2.6.0", "accelerate==1.4.0"
)
app = modal.App("example-base-Meta-Llama-3-8B", image=image)

GPU_CONFIG = "H100:2"

CACHE_DIR = "/cache"
cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.cls(
    gpu=GPU_CONFIG,
    volumes={CACHE_DIR: cache_vol},
    scaledown_window=60 * 10,
    timeout=60 * 60,
)
@modal.concurrent(max_inputs=15)
class Model:
    @modal.enter()
    def setup(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

        from huggingface_hub import snapshot_download

        # Download the model to the cache directory
        model_path = snapshot_download(repo_id=MODEL_ID, cache_dir=CACHE_DIR)

        print(f"Model downloaded to: {model_path}")

        # Specify cache directory if needed
        model = AutoModelForCausalLM.from_pretrained(MODEL_ID, cache_dir=CACHE_DIR)
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, cache_dir=CACHE_DIR)

        self.pipeline = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            model_kwargs={"torch_dtype": torch.bfloat16},
            device_map="auto",
        )

    @modal.method()
    def generate(self, input: str):
        return self.pipeline(input)


# ## Run the model
@app.local_entrypoint()
def main(prompt: str = None):
    if prompt is None:
        prompt = "Please write a Python function to compute the Fibonacci numbers."
    print(Model().generate.remote(prompt))
\`\`\`

## Additional resources

- [How to run Llama 3.1 8B on Modal with TensorRT-LLM](/docs/examples/trtllm_llama)
- [How to run LLama 3.1 70B on Modal](/blog/how-to-run-llama-3-1-70b-instruct-on-modal)
- [Llama 3.1 launch post](https://ai.meta.com/blog/meta-llama-3-1/)
- [Hugging Face model card for Llama 3.1](https://huggingface.co/NousResearch/Meta-Llama-3.1-8B)
- [vLLM GitHub Repository](https://github.com/vllm-project/vllm) - Repository
  for vLLM, a framework for serving large language models fast, including
  Llama models.
`,meta:{description:`Example code for Llama 3.1 8B Instruct LLM`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="introduction-to-llama-31-8b-instruct">Introduction to Llama 3.1 8B Instruct</h2> <p><!> is a family of
open-source LLMs that includes various models of different
sizes - 8B, 70B, and 405B parameters.
While larger models like the 405B variant are designed to
deliver superior quality, they are also significantly more expensive to run.
Llama 3.1 8B is a good choice for many applications that require a
balance between quality and cost.</p> <h2 id="licensing-terms">Licensing terms</h2> <p>When using the Llama 3.1 model, it’s important to be aware of the <!> set by Meta.</p> <p>In particular, if you fine-tune your own model on top of Llama 3.1, you must
prominently include “Built with Llama” on your website or documentation. The
fine-tuned model’s name must also start with “Llama”.</p> <h2 id="gpu-requirements">GPU requirements</h2> <p>To run the Llama 3.1 model effectively, you will need access to a GPU due to its substantial computational requirements. The easiest way to
access a GPU is through <!>, a cloud platform designed
for running machine learning workloads. Modal simplifies the process of
deploying AI models by automatically provisioning the necessary GPU resources,
allowing you to focus on your application without the hassle of managing
infrastructure.</p> <h2 id="example-code-for-running-the-llama-31-8b-instruct-llm-on-modal">Example code for running the Llama 3.1 8B Instruct LLM on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <p>Please note that this code is not optimized for best performance. To run Llama 3.1 8B Instruct with a LLM serving framework like <!> for better latency and throughput, refer to this more detailed example <!>.</p> <!> <h2 id="additional-resources">Additional resources</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!> - Repository
for vLLM, a framework for serving large language models fast, including
Llama models.</li></ul>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2);d(e(f),{href:`https://ai.meta.com/blog/meta-llama-3-1/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Meta Llama 3.1`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4);d(c(e(p)),{href:`https://www.llama.com/llama3_1/license/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`licensing terms`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,6);d(c(e(m)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,6),g=e(h);d(c(e(g)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(g),l(8),n(h);var _=c(h,2),v=c(e(_));d(v,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}}),d(c(v,2),{href:`/docs/examples/vllm_inference`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,2);u(y,{code:`import%20modal%0A%0AMODEL_ID%20%3D%20%22NousResearch%2FMeta-Llama-3-8B%22%0AMODEL_REVISION%20%3D%20%22315b20096dc791d381d514deb5f8bd9c8d6d3061%22%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%0A%20%20%20%20%22transformers%3D%3D4.49.0%22%2C%20%22torch%3D%3D2.6.0%22%2C%20%22accelerate%3D%3D1.4.0%22%0A)%0Aapp%20%3D%20modal.App(%22example-base-Meta-Llama-3-8B%22%2C%20image%3Dimage)%0A%0AGPU_CONFIG%20%3D%20%22H100%3A2%22%0A%0ACACHE_DIR%20%3D%20%22%2Fcache%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_vol%7D%2C%0A%20%20%20%20scaledown_window%3D60%20*%2010%2C%0A%20%20%20%20timeout%3D60%20*%2060%2C%0A)%0A%40modal.concurrent(max_inputs%3D15)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20transformers%20import%20AutoModelForCausalLM%2C%20AutoTokenizer%2C%20pipeline%0A%0A%20%20%20%20%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20%20%20%20%20%23%20Download%20the%20model%20to%20the%20cache%20directory%0A%20%20%20%20%20%20%20%20model_path%20%3D%20snapshot_download(repo_id%3DMODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%0A%20%20%20%20%20%20%20%20print(f%22Model%20downloaded%20to%3A%20%7Bmodel_path%7D%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Specify%20cache%20directory%20if%20needed%0A%20%20%20%20%20%20%20%20model%20%3D%20AutoModelForCausalLM.from_pretrained(MODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%20%20%20%20%20%20%20%20tokenizer%20%3D%20AutoTokenizer.from_pretrained(MODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text-generation%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model_kwargs%3D%7B%22torch_dtype%22%3A%20torch.bfloat16%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device_map%3D%22auto%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20input%3A%20str)%3A%0A%20%20%20%20%20%20%20%20return%20self.pipeline(input)%0A%0A%0A%23%20%23%23%20Run%20the%20model%0A%40app.local_entrypoint()%0Adef%20main(prompt%3A%20str%20%3D%20None)%3A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Please%20write%20a%20Python%20function%20to%20compute%20the%20Fibonacci%20numbers.%22%0A%20%20%20%20print(Model().generate.remote(prompt))`,lang:`python`});var b=c(y,4),x=e(b);d(e(x),{href:`/docs/examples/trtllm_llama`,children:(e,t)=>{l(),i(e,r(`How to run Llama 3.1 8B on Modal with TensorRT-LLM`))},$$slots:{default:!0}}),n(x);var S=c(x,2);d(e(S),{href:`/blog/how-to-run-llama-3-1-70b-instruct-on-modal`,children:(e,t)=>{l(),i(e,r(`How to run LLama 3.1 70B on Modal`))},$$slots:{default:!0}}),n(S);var C=c(S,2);d(e(C),{href:`https://ai.meta.com/blog/meta-llama-3-1/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Llama 3.1 launch post`))},$$slots:{default:!0}}),n(C);var w=c(C,2);d(e(w),{href:`https://huggingface.co/NousResearch/Meta-Llama-3.1-8B`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hugging Face model card for Llama 3.1`))},$$slots:{default:!0}}),n(w);var T=c(w,2);d(e(T),{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM GitHub Repository`))},$$slots:{default:!0}}),l(),n(T),n(b),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=DrOOMfop2.js.map
