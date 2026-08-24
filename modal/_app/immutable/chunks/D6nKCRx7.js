(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`07f8bb4d-b8a7-41ac-85f0-d145f20d55f2`,e._sentryDebugIdIdentifier=`sentry-dbid-07f8bb4d-b8a7-41ac-85f0-d145f20d55f2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`Modal is a serverless AI infrastructure platform with sub-second cold starts and per-second pricing.`,crossLinks:[{text:`Hello, world!`,href:`/docs/examples/hello_world`},{text:`A simple web scraper`,href:`/docs/examples/webscraper`}],toc:[{depth:1,value:`Introduction`,id:`introduction`,children:[{depth:2,value:`How does it work?`,id:`how-does-it-work`},{depth:2,value:`Programming language support`,id:`programming-language-support`},{depth:2,value:`Getting started`,id:`getting-started`}]}],rawContent:`# Introduction

Modal is an AI infrastructure platform that lets you:

- Run low latency [inference](/docs/examples/llm_inference) with sub-second cold starts, using open weights or custom models
- Scale out [batch jobs](/docs/guide/batch-processing) to run massively in parallel
- [Train](/docs/examples/hp_sweep_gpt) or [fine-tune](/docs/examples/diffusers_lora_finetune) open weights or custom models on the latest GPUs
- Spin up thousands of isolated and secure [Sandboxes](/docs/guide/sandboxes) to execute AI generated code
- Launch GPU-backed [Notebooks](/docs/guide/notebooks-modal) in seconds and collaborate with your colleagues in real-time

You get [full serverless execution and pricing](/pricing) because we host everything and charge per second of usage.

Notably, there’s zero configuration in Modal - everything, including [container environments](/docs/guide/images) and [GPU specification](/docs/guide/gpu), is code. Take a breath of fresh air and feel how good it tastes with no YAML in it.

Here's a complete, minimal example of LLM inference running on Modal:

\`\`\`python
from pathlib import Path

import modal

app = modal.App("example-inference")
image = modal.Image.debian_slim().uv_pip_install("transformers[torch]")


@app.function(gpu="h100", image=image)
def chat(prompt: str | None = None) -> list[dict]:
    from transformers import pipeline

    if prompt is None:
        prompt = f"/no_think Read this code.\\n\\n{Path(__file__).read_text()}\\nIn one paragraph, what does the code do?"

    print(prompt)
    context = [{"role": "user", "content": prompt}]

    chatbot = pipeline(
        model="Qwen/Qwen3-1.7B", device_map="cuda", max_new_tokens=1024
    )
    result = chatbot(context)
    print(result[0]["generated_text"][-1]["content"])

    return result
\`\`\`

That's it! You can copy and paste that text into a Python file in your favorite editor and then run it with \`modal run path/to/file.py\`.

## How does it work?

Modal takes your code, puts it in a container, and executes it in the cloud. If you get a lot of traffic, Modal automatically scales up the number of containers as needed. This means you don't need to mess with Kubernetes, Docker, or even an AWS account.

We pool capacity over all major clouds. That means we can optimize for both high GPU availability and low cost by dynamically deciding where to run your code based on the best available capacity.

## Programming language support

Python is the primary language for building Modal applications and implementing Modal Functions, but you can also use [JavaScript/TypeScript or Go](/docs/guide/sdk-javascript-go) to call Modal Functions, run Sandboxes, and manage Modal resources.

## Getting started

Developing with Modal is easy because you don't have to set up any infrastructure. Just:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the \`modal\` Python package
3. Run \`modal setup\` to authenticate (if this doesn't work, try \`python -m modal setup\`)

…and you can start running jobs right away. Check out some of our simple getting started examples:

- [Hello, world!](/docs/examples/hello_world)
- [A simple web scraper](/docs/examples/webscraper)

And when you're ready for something fancier, explore our [full library of examples](/docs/examples), like:

- [Running your own LLM inference](/docs/examples/llm_inference)
- [Transcribing speech in real time with Kyutai STT](/docs/examples/streaming_kyutai_stt)
- [Fine-tuning Flux](/docs/examples/diffusers_lora_finetune)
- [Building a coding agent with Modal Sandboxes and LangGraph](/docs/examples/agent)
- [Training a small language model from scratch](/docs/examples/hp_sweep_gpt)
- [Parallel processing of Parquet files on S3](/docs/examples/s3_bucket_mount)
- [Parsing documents with dots.ocr in a Modal Notebook](https://modal.com/notebooks/modal-labs/_/nb-8wvXoGoAcba8sRF8VkVg18)

You can also learn Modal interactively without installing anything through our [code playground](/playground).
`,meta:{title:`Introduction`,description:`Modal is a serverless AI infrastructure platform with sub-second cold starts and per-second pricing.`}},{description:g,crossLinks:_,toc:v,rawContent:y,meta:b}=h,x=t(`<!> <p>Modal is an AI infrastructure platform that lets you:</p> <ul><li>Run low latency <!> with sub-second cold starts, using open weights or custom models</li> <li>Scale out <!> to run massively in parallel</li> <li><!> or <!> open weights or custom models on the latest GPUs</li> <li>Spin up thousands of isolated and secure <!> to execute AI generated code</li> <li>Launch GPU-backed <!> in seconds and collaborate with your colleagues in real-time</li></ul> <p>You get <!> because we host everything and charge per second of usage.</p> <p>Notably, there’s zero configuration in Modal - everything, including <!> and <!>, is code. Take a breath of fresh air and feel how good it tastes with no YAML in it.</p> <p>Here’s a complete, minimal example of LLM inference running on Modal:</p> <!> <p>That’s it! You can copy and paste that text into a Python file in your favorite editor and then run it with <code>modal run path/to/file.py</code>.</p> <!> <p>Modal takes your code, puts it in a container, and executes it in the cloud. If you get a lot of traffic, Modal automatically scales up the number of containers as needed. This means you don’t need to mess with Kubernetes, Docker, or even an AWS account.</p> <p>We pool capacity over all major clouds. That means we can optimize for both high GPU availability and low cost by dynamically deciding where to run your code based on the best available capacity.</p> <!> <p>Python is the primary language for building Modal applications and implementing Modal Functions, but you can also use <!> to call Modal Functions, run Sandboxes, and manage Modal resources.</p> <!> <p>Developing with Modal is easy because you don’t have to set up any infrastructure. Just:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the <code>modal</code> Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li></ol> <p>…and you can start running jobs right away. Check out some of our simple getting started examples:</p> <ul><li><!></li> <li><!></li></ul> <p>And when you’re ready for something fancier, explore our <!>, like:</p> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <p>You can also learn Modal interactively without installing anything through our <!>.</p>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`introduction`,children:(e,t)=>{l(),i(e,r(`Introduction`))},$$slots:{default:!0}});var h=c(p,4),g=e(h);m(c(e(g)),{href:`/docs/examples/llm_inference`,children:(e,t)=>{l(),i(e,r(`inference`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);m(c(e(_)),{href:`/docs/guide/batch-processing`,children:(e,t)=>{l(),i(e,r(`batch jobs`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2),y=e(v);m(y,{href:`/docs/examples/hp_sweep_gpt`,children:(e,t)=>{l(),i(e,r(`Train`))},$$slots:{default:!0}}),m(c(y,2),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{l(),i(e,r(`fine-tune`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);m(c(e(b)),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,2);m(c(e(S)),{href:`/docs/guide/notebooks-modal`,children:(e,t)=>{l(),i(e,r(`Notebooks`))},$$slots:{default:!0}}),l(),n(S),n(h);var C=c(h,2);m(c(e(C)),{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`full serverless execution and pricing`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2),T=c(e(w));m(T,{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`container environments`))},$$slots:{default:!0}}),m(c(T,2),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU specification`))},$$slots:{default:!0}}),l(),n(w);var E=c(w,4);f(E,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-inference%22)%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22transformers%5Btorch%5D%22)%0A%0A%0A%40app.function(gpu%3D%22h100%22%2C%20image%3Dimage)%0Adef%20chat(prompt%3A%20str%20%7C%20None%20%3D%20None)%20-%3E%20list%5Bdict%5D%3A%0A%20%20%20%20from%20transformers%20import%20pipeline%0A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20f%22%2Fno_think%20Read%20this%20code.%5Cn%5Cn%7BPath(__file__).read_text()%7D%5CnIn%20one%20paragraph%2C%20what%20does%20the%20code%20do%3F%22%0A%0A%20%20%20%20print(prompt)%0A%20%20%20%20context%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20chatbot%20%3D%20pipeline(%0A%20%20%20%20%20%20%20%20model%3D%22Qwen%2FQwen3-1.7B%22%2C%20device_map%3D%22cuda%22%2C%20max_new_tokens%3D1024%0A%20%20%20%20)%0A%20%20%20%20result%20%3D%20chatbot(context)%0A%20%20%20%20print(result%5B0%5D%5B%22generated_text%22%5D%5B-1%5D%5B%22content%22%5D)%0A%0A%20%20%20%20return%20result`,lang:`python`});var D=c(E,4);u(D,{id:`how-does-it-work`,children:(e,t)=>{l(),i(e,r(`How does it work?`))},$$slots:{default:!0}});var O=c(D,6);u(O,{id:`programming-language-support`,children:(e,t)=>{l(),i(e,r(`Programming language support`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`/docs/guide/sdk-javascript-go`,children:(e,t)=>{l(),i(e,r(`JavaScript/TypeScript or Go`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);u(A,{id:`getting-started`,children:(e,t)=>{l(),i(e,r(`Getting started`))},$$slots:{default:!0}});var j=c(A,4),M=e(j);m(c(e(M)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(M),l(4),n(j);var N=c(j,4),P=e(N);m(e(P),{href:`/docs/examples/hello_world`,children:(e,t)=>{l(),i(e,r(`Hello, world!`))},$$slots:{default:!0}}),n(P);var F=c(P,2);m(e(F),{href:`/docs/examples/webscraper`,children:(e,t)=>{l(),i(e,r(`A simple web scraper`))},$$slots:{default:!0}}),n(F),n(N);var I=c(N,2);m(c(e(I)),{href:`/docs/examples`,children:(e,t)=>{l(),i(e,r(`full library of examples`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,2),R=e(L);m(e(R),{href:`/docs/examples/llm_inference`,children:(e,t)=>{l(),i(e,r(`Running your own LLM inference`))},$$slots:{default:!0}}),n(R);var z=c(R,2);m(e(z),{href:`/docs/examples/streaming_kyutai_stt`,children:(e,t)=>{l(),i(e,r(`Transcribing speech in real time with Kyutai STT`))},$$slots:{default:!0}}),n(z);var B=c(z,2);m(e(B),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{l(),i(e,r(`Fine-tuning Flux`))},$$slots:{default:!0}}),n(B);var V=c(B,2);m(e(V),{href:`/docs/examples/agent`,children:(e,t)=>{l(),i(e,r(`Building a coding agent with Modal Sandboxes and LangGraph`))},$$slots:{default:!0}}),n(V);var H=c(V,2);m(e(H),{href:`/docs/examples/hp_sweep_gpt`,children:(e,t)=>{l(),i(e,r(`Training a small language model from scratch`))},$$slots:{default:!0}}),n(H);var U=c(H,2);m(e(U),{href:`/docs/examples/s3_bucket_mount`,children:(e,t)=>{l(),i(e,r(`Parallel processing of Parquet files on S3`))},$$slots:{default:!0}}),n(U);var W=c(U,2);m(e(W),{href:`https://modal.com/notebooks/modal-labs/_/nb-8wvXoGoAcba8sRF8VkVg18`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Parsing documents with dots.ocr in a Modal Notebook`))},$$slots:{default:!0}}),n(W),n(L);var G=c(L,2);m(c(e(G)),{href:`/playground`,children:(e,t)=>{l(),i(e,r(`code playground`))},$$slots:{default:!0}}),l(),n(G),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=D6nKCRx7.js.map
