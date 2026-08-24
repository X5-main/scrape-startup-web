(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`34a9bebb-8d36-4611-9e87-8c53df0791df`,e._sentryDebugIdIdentifier=`sentry-dbid-34a9bebb-8d36-4611-9e87-8c53df0791df`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to deploy Llama 3.1 70B Instruct on Modal`,description:`Example code for Llama 3.1 70B Instruct LLM`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,category:`Model Library`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Introduction to Llama 3.1 70B Instruct`,id:`introduction-to-llama-31-70b-instruct`},{depth:2,value:`Why should you run Llama 3.1 70B Instruct on Modal?`,id:`why-should-you-run-llama-31-70b-instruct-on-modal`},{depth:2,value:`Example code for running the Llama 3.1 70B Instruct LLM on Modal`,id:`example-code-for-running-the-llama-31-70b-instruct-llm-on-modal`},{depth:2,value:`Additional resources`,id:`additional-resources`}],rawContent:`## Introduction to Llama 3.1 70B Instruct

The [Meta Llama 3.1](https://ai.meta.com/blog/meta-llama-3-1/) collection of
multilingual large language models (LLMs) includes the Llama 3.1 70B model. With 70 billion parameters, it is powerful enough for a wide range
of tasks while being more accessible in terms of computational requirements
compared to larger models like the 405B.

This model is good for tasks like code execution, search, and complex reasoning.
Additionally, it includes a 128K token context window, making it well-suited for processing extended inputs, such as lengthy documents or comprehensive conversations.

Given that it is a larger model, it requires 2 H100 GPUs to run.
For a more memory efficient version of the same model, see the [8B
variant](/blog/how-to-run-llama-3-1-8b-instruct-on-modal).

## Why should you run Llama 3.1 70B Instruct on Modal?

[Modal](https://modal.com) is the easiest way to access a [GPU](/docs/guide/gpu) to run machine learning workloads. With Modal, you can take your local function, decorate it with Modal decorators, and send it off to run in the cloud on a GPU.

Additionally, Modal supports various configurations, allowing you to [customize
your environment](/docs/guide/images) based on your specific needs, such as selecting the number of
GPUs and setting timeouts for your applications.

## Example code for running the Llama 3.1 70B Instruct LLM on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn't work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

Please note that this code is not optimized for best performance. To run Llama 3.1 70B Instruct with a LLM serving framework like [vLLM](https://github.com/vllm-project/vllm) for better latency and throughput, refer to this more detailed example [here](/docs/examples/vllm_inference). (You can modify the code in that example to run the 70B version instead of the 8B version.)

\`\`\`python
import modal

MODEL_ID = "NousResearch/Meta-Llama-3.1-70B-Instruct"
MODEL_REVISION = "d50656ee28e2c2906d317cbbb6fcb55eb4055a84"

image = modal.Image.debian_slim().pip_install("transformers", "torch", "accelerate")
app = modal.App("example-base-Meta-Llama-3-70B-Instruct", image=image)

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
            revision=MODEL_REVISION,
            tokenizer=tokenizer,
            model_kwargs={"torch_dtype": torch.bfloat16},
            device_map="auto",
        )

    @modal.method()
    def generate(self, input: str):
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {"role": "user", "content": input},
        ]

        outputs = self.pipeline(
            messages,
            max_new_tokens=256,
        )

        return outputs[0]["generated_text"][-1]


# ## Run the model
@app.local_entrypoint()
def main(prompt: str = None):
    if prompt is None:
        prompt = "Please write a Python function to compute the Fibonacci numbers."
    print(Model().generate.remote(prompt))
\`\`\`

## Additional resources

- [How to run Llama 3.1 8B Instruct on
  Modal](/blog/how-to-run-llama-3-1-8b-instruct-on-modal)
- [How to run Llama 3.1 405B Instruct on Modal](/blog/how_to_run_llama_405b_article)
- [vLLM Documentation](https://github.com/vllm-project/vllm) - Official documentation for vLLM, a framework for serving large language models.
`,meta:{description:`Example code for Llama 3.1 70B Instruct LLM`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="introduction-to-llama-31-70b-instruct">Introduction to Llama 3.1 70B Instruct</h2> <p>The <!> collection of
multilingual large language models (LLMs) includes the Llama 3.1 70B model. With 70 billion parameters, it is powerful enough for a wide range
of tasks while being more accessible in terms of computational requirements
compared to larger models like the 405B.</p> <p>This model is good for tasks like code execution, search, and complex reasoning.
Additionally, it includes a 128K token context window, making it well-suited for processing extended inputs, such as lengthy documents or comprehensive conversations.</p> <p>Given that it is a larger model, it requires 2 H100 GPUs to run.
For a more memory efficient version of the same model, see the <!>.</p> <h2 id="why-should-you-run-llama-31-70b-instruct-on-modal">Why should you run Llama 3.1 70B Instruct on Modal?</h2> <p><!> is the easiest way to access a <!> to run machine learning workloads. With Modal, you can take your local function, decorate it with Modal decorators, and send it off to run in the cloud on a GPU.</p> <p>Additionally, Modal supports various configurations, allowing you to <!> based on your specific needs, such as selecting the number of
GPUs and setting timeouts for your applications.</p> <h2 id="example-code-for-running-the-llama-31-70b-instruct-llm-on-modal">Example code for running the Llama 3.1 70B Instruct LLM on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <p>Please note that this code is not optimized for best performance. To run Llama 3.1 70B Instruct with a LLM serving framework like <!> for better latency and throughput, refer to this more detailed example <!>. (You can modify the code in that example to run the 70B version instead of the 8B version.)</p> <!> <h2 id="additional-resources">Additional resources</h2> <ul><li><!></li> <li><!></li> <li><!> - Official documentation for vLLM, a framework for serving large language models.</li></ul>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2);d(c(e(f)),{href:`https://ai.meta.com/blog/meta-llama-3-1/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Meta Llama 3.1`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4);d(c(e(p)),{href:`/blog/how-to-run-llama-3-1-8b-instruct-on-modal`,children:(e,t)=>{l(),i(e,r(`8B
variant`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,4),h=e(m);d(h,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),d(c(h,2),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU`))},$$slots:{default:!0}}),l(),n(m);var g=c(m,2);d(c(e(g)),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`customize
your environment`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6),v=e(_);d(c(e(v)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(v),l(8),n(_);var y=c(_,2),b=c(e(y));d(b,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}}),d(c(b,2),{href:`/docs/examples/vllm_inference`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,2);u(x,{code:`import%20modal%0A%0AMODEL_ID%20%3D%20%22NousResearch%2FMeta-Llama-3.1-70B-Instruct%22%0AMODEL_REVISION%20%3D%20%22d50656ee28e2c2906d317cbbb6fcb55eb4055a84%22%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22transformers%22%2C%20%22torch%22%2C%20%22accelerate%22)%0Aapp%20%3D%20modal.App(%22example-base-Meta-Llama-3-70B-Instruct%22%2C%20image%3Dimage)%0A%0AGPU_CONFIG%20%3D%20%22H100%3A2%22%0A%0ACACHE_DIR%20%3D%20%22%2Fcache%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_vol%7D%2C%0A%20%20%20%20scaledown_window%3D60%20*%2010%2C%0A%20%20%20%20timeout%3D60%20*%2060%2C%0A)%0A%40modal.concurrent(max_inputs%3D15)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%0A%20%20%20%20%20%20%20%20from%20transformers%20import%20AutoModelForCausalLM%2C%20AutoTokenizer%2C%20pipeline%0A%0A%20%20%20%20%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20%20%20%20%20%23%20Download%20the%20model%20to%20the%20cache%20directory%0A%20%20%20%20%20%20%20%20model_path%20%3D%20snapshot_download(repo_id%3DMODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%0A%20%20%20%20%20%20%20%20print(f%22Model%20downloaded%20to%3A%20%7Bmodel_path%7D%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Specify%20cache%20directory%20if%20needed%0A%20%20%20%20%20%20%20%20model%20%3D%20AutoModelForCausalLM.from_pretrained(MODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%20%20%20%20%20%20%20%20tokenizer%20%3D%20AutoTokenizer.from_pretrained(MODEL_ID%2C%20cache_dir%3DCACHE_DIR)%0A%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text-generation%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model_kwargs%3D%7B%22torch_dtype%22%3A%20torch.bfloat16%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device_map%3D%22auto%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20input%3A%20str)%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22role%22%3A%20%22system%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20%22You%20are%20a%20helpful%20assistant.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20input%7D%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20outputs%20%3D%20self.pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20messages%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20max_new_tokens%3D256%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20return%20outputs%5B0%5D%5B%22generated_text%22%5D%5B-1%5D%0A%0A%0A%23%20%23%23%20Run%20the%20model%0A%40app.local_entrypoint()%0Adef%20main(prompt%3A%20str%20%3D%20None)%3A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Please%20write%20a%20Python%20function%20to%20compute%20the%20Fibonacci%20numbers.%22%0A%20%20%20%20print(Model().generate.remote(prompt))`,lang:`python`});var S=c(x,4),C=e(S);d(e(C),{href:`/blog/how-to-run-llama-3-1-8b-instruct-on-modal`,children:(e,t)=>{l(),i(e,r(`How to run Llama 3.1 8B Instruct on
Modal`))},$$slots:{default:!0}}),n(C);var w=c(C,2);d(e(w),{href:`/blog/how_to_run_llama_405b_article`,children:(e,t)=>{l(),i(e,r(`How to run Llama 3.1 405B Instruct on Modal`))},$$slots:{default:!0}}),n(w);var T=c(w,2);d(e(T),{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM Documentation`))},$$slots:{default:!0}}),l(),n(T),n(S),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=FwiVFXfa2.js.map
