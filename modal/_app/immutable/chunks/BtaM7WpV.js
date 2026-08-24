(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4f619870-e070-4baa-a5af-9ef324285299`,e._sentryDebugIdIdentifier=`sentry-dbid-4f619870-e070-4baa-a5af-9ef324285299`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./DeWGVqas2.js";import{t as u}from"./CdZDxCfO2.js";var ne=`/_app/immutable/assets/artificial-analysis.d4HmTyGz.png`,d={title:`Best open-source LLMs in 2025`,description:`Overview of the best open-source llms`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-03-10T12:00:00.000Z`,length:`7 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of contents`,id:`table-of-contents`},{depth:2,value:`What is an open-source LLM and why would you use one?`,id:`what-is-an-open-source-llm-and-why-would-you-use-one`},{depth:2,value:`How to evaluate open-source LLMs`,id:`how-to-evaluate-open-source-llms`,children:[{depth:3,value:`What’s the difference between the 7B and the 70B versions?`,id:`whats-the-difference-between-the-7b-and-the-70b-versions`},{depth:3,value:`What’s the difference between Instruct vs. non-Instruct versions?`,id:`whats-the-difference-between-instruct-vs-non-instruct-versions`}]},{depth:2,value:`Best overall open-source LLM`,id:`best-overall-open-source-llm`},{depth:2,value:`Best open-source LLM for chat`,id:`best-open-source-llm-for-chat`},{depth:2,value:`Best open-source LLM for math`,id:`best-open-source-llm-for-math`},{depth:2,value:`Best open-source LLM for coding`,id:`best-open-source-llm-for-coding`},{depth:2,value:`Best open-source LLM for fine-tuning`,id:`best-open-source-llm-for-fine-tuning`},{depth:2,value:`Where to find open-source LLMs`,id:`where-to-find-open-source-llms`},{depth:2,value:`Where to run open-source LLMs`,id:`where-to-run-open-source-llms`},{depth:2,value:`How to serve open-source LLMs blazingly fast`,id:`how-to-serve-open-source-llms-blazingly-fast`},{depth:2,value:`Run open-source LLMs on Modal`,id:`run-open-source-llms-on-modal`}],rawContent:`These days, it seems like hardly a week goes by without a
tech giant or AI startup announcing a new open-source large language model and claiming that it's best in class.

With so many options available, it can be overwhelming to navigate the landscape and find the best open-source LLM for your specific use case.

In this blog post, we'll explore some of the best open-source LLMs, evaluating them based on factors such as performance, size, ease of use,
and suitability for various tasks like writing, coding, and fine-tuning. We'll
also discuss where to find and run these models, including how to serve them
efficiently using Modal.

## Table of contents

- [What is an open-source LLM and why would you use one?](#what-is-an-open-source-llm-and-why-would-you-use-one)
- [How to evaluate open-source LLMs](#how-to-evaluate-open-source-llms)
- [Best overall open-source LLM: DeepSeek-V3](#best-overall-open-source-llm)
- [Best open-source LLM for chat: Meta-LLama-3.1-8B-Instruct](#best-open-source-llm-for-chat)
- [Best open-source LLM for coding: Qwen2.5-Coder-32B-Instruct](#best-open-source-llm-for-coding)
- [Best open-source LLM for fine-tuning: Mixtral-8x7B-Instruct](#best-open-source-llm-for-fine-tuning)
- [Where to find open-source LLMs](#where-to-find-open-source-llms)
- [Where to run open-source LLMs](#where-to-run-open-source-llms)
- [How to serve open-source LLMs blazingly fast](#how-to-serve-open-source-llms-blazingly-fast)
- [Run open-source LLMs on Modal](#run-open-source-llms-on-modal)

## What is an open-source LLM and why would you use one?

An open-source language model (LLM) is a model that is made
available to the public for free, with its weights and architecture openly
accessible.

Versus closed-source and proprietary LLMs like OpenAI's GPT and
Anthropic's Claude, open-source LLMs offer several advantages:

- **Open licenses**:

  Open-source LLMs are released under permissive licenses like Apache 2.0 and MIT, allowing developers to
  use, modify, and distribute the models freely.

- **Publicly available weights**:

  The pre-trained weights of open-source LLMs are readily available, enabling
  developers to fine-tune the models for specific tasks without starting from
  scratch.

- **Cheaper**:

  There are a lot of caveats here (OpenAI GPT-3.5 is the most cost-effective option for many, many use cases), but if you have high-volume use cases with consistent load, you can save money by running open-source LLMs on your own infrastructure or through cost-effective cloud providers.

  For example, Ramp recently [cut their infrastructure costs for automated receipt processing](/blog/ramp-case-study) by 79% by switching from OpenAI to running an open-source LLM on Modal.

- **Fast inference speeds and no rate-limiting**:

  Open-source LLMs also offer the potential for faster inference speeds, as you
  have control over the hardware and optimization techniques employed.
  Additionally, you are not subject to the rate limits and usage restrictions
  often imposed by commercial LLM providers.

With the plethora of open-source LLMs
now coming out, there's a lot of noise, and not every new model warrants your
attention. You should consider a new open-source LLM when:

1. It achieves state-of-the-art performance in specific dimensions, such as accuracy,
   efficiency, or model size, compared to existing open-source models.
2. It surpasses the performance of cutting-edge proprietary models, such as GPT-4/5.
3. It offers performance comparable to cutting-edge proprietary models while being
   significantly more cost-effective (e.g., 10x cheaper).

## How to evaluate open-source LLMs

When evaluating open-source LLMs, consider the following
factors:

- **Quality**: How accurate and coherent are the model's outputs?

While a lot of open-source LLMs claim that they are the leader on various benchmarks, we recommend just trying out the models on prompts that resemble your specific use case.

- **Speed**: How quickly can the model generate outputs?

Models of comparable size should have similar inference speeds, but this can still vary based on optimization techniques and inference providers.

In general, you should be looking at something like 30-50 tokens/second for a 70B model, and 100-200 tokens/second for a 7B model.

- **Cost**: What are the costs associated with running the model?

While open-source LLMs are ostensibly "free" to use, you still need to consider the cost of running the model on your own infrastructure or through a cloud provider.

Here, you should consider not only the server time - whether that's spinning up your own servers or using one of the newer serverless providers like [Modal](https://modal.com/) - but also the cost of maintenance, migration, and developer training.

There are a [number of sites](https://artificialanalysis.ai/) that aggregate the metrics mentioned above for the various open-source LLMs and cloud providers.

![artificialanalysis.ai](./artificial-analysis.png)

### What's the difference between the 7B and the 70B versions?

When considering open-source LLMs, you'll often come across models with the same name but different parameter counts, such as Llama3-8B and Llama3-70B. These numbers refer to the number of relationships the AI can
build internally with the training data.

A 70B model has 10 times the number of internal inter-token relationships compared to a 7B model, allowing it to
capture more subtle patterns and nuances in the data.
While larger models often exhibit better performance, they also come with higher computational costs and
longer inference times.

We recommend that you start out by trying the 7B models,
which can generally run on consumer hardware, even mobile phones, and if the
models prove insufficient for your use case, then move on to the larger models.

### What's the difference between Instruct vs. non-Instruct versions?

Open-source LLMs can come in both instruct and non-instruct versions. Instruct
models are fine-tuned to follow instructions and are generally more suitable for
task-oriented applications, while non-instruct models are more open-ended and
can be used for creative generation tasks.

## Best overall open-source LLM

[DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3) is roughly comparable to GPT-4o in terms of quality, and excels at
general writing, coding, and reasoning tasks.

Users report that it is not as good for coding as Claude-3.5-Sonnet, but it is
significantly cheaper to run.

You can try a hosted version of DeepSeek-V3 on
[DeepSeek](https://www.deepseek.com/)'s website.

## Best open-source LLM for chat

[Meta-LLama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct) is designed for conversational applications, making it a strong choice for chatbots and other AI assistants.

It excels at general task following and content generation.

## Best open-source LLM for math

[DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B)
is a 32B parameter distilled version of the DeepSeek-R1 model, with very good
performance on general math.

DeepSeek-R1-Distill-Qwen-32B is a smaller version of the full DeepSeek-R1 model that is more
efficient and cheaper to run (Qwen-32B fine-tuned on
hundreds of thousands of samples of DeepSeek-R1 outputs).

## Best open-source LLM for coding

[Qwen2.5-Coder-32B-Instruct](https://qwenlm.github.io/blog/qwen2.5-coder-family/) is a 32B parameter Qwen
model that is fine-tuned for coding tasks.

It has competitive performance with GPT-4o on code generation and code repair,
and is familiar with 40+ programming languages.

## Best open-source LLM for fine-tuning

If you plan to fine-tune your LLM, we recommend:

- [Mixtral-8x7B-Instruct](https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1)

A larger model with a mixture-of-experts architecture that allows
for efficient fine-tuning.

You can fine-tune Mixtral on Modal Labs using our
[fine-tuning template](https://github.com/modal-labs/llm-finetuning).

## Where to find open-source LLMs

One of the best places to find open-source LLMs is
[Hugging Face](https://huggingface.co/models). Hugging Face is a
community-driven platform that hosts a wide variety of open-source models,
including LLMs, and provides tools for easy integration and fine-tuning.

## Where to run open-source LLMs

There are several options for running open-source
LLMs, including:

- Cloud platforms like [AWS](https://aws.amazon.com/), [Google
  Cloud](https://cloud.google.com/), and [Azure](https://azure.microsoft.com/)
- On-premise hardware
- Specialized AI platforms like [Modal](https://modal.com/), [Together.ai](https://together.ai/), and [Fireworks.ai](https://fireworks.ai/)

## How to serve open-source LLMs blazingly fast

To serve your open-source LLM fast, you will likely need to use one of the below
LLM inference engines. The two best engines in 2025 are:

- [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM): A platform for optimizing and
  accelerating AI models on NVIDIA GPUs. Best performance but annoying to set up. To run an open-source LLM with TensorRT-LLM on Modal, check out our [TensorRT-LLM example](/docs/examples/trtllm_llama).
- [vLLM](https://github.com/vllm-project/vllm): UC Berkeley's open-source option, relatively easy to use. To run an open-source LLM with vLLM on Modal, check out our [example](/docs/examples/vllm_inference).

## Run open-source LLMs on Modal

[Modal](https://modal.com/) is a serverless cloud computing platform that makes it easy to run open-source
LLMs in the cloud. With Modal, you can:

- Easily [deploy and scale open-source LLMs](/solutions/llm), with less waste. Modal automatically spins up new containers when you have more demand and scales down when you have less.
- Access powerful [GPU resources](/docs/guide/gpu) on-demand.

To get started with running open-source LLMs on Modal, check out our
[documentation](/docs/guide) and [examples](/docs/examples).
`,meta:{description:`Overview of the best open-source llms`}},{title:f,description:p,authors:m,date:h,length:g,category:_,subcategory:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=d,re=t(`<p>These days, it seems like hardly a week goes by without a
tech giant or AI startup announcing a new open-source large language model and claiming that it’s best in class.</p> <p>With so many options available, it can be overwhelming to navigate the landscape and find the best open-source LLM for your specific use case.</p> <p>In this blog post, we’ll explore some of the best open-source LLMs, evaluating them based on factors such as performance, size, ease of use,
and suitability for various tasks like writing, coding, and fine-tuning. We’ll
also discuss where to find and run these models, including how to serve them
efficiently using Modal.</p> <h2 id="table-of-contents">Table of contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="what-is-an-open-source-llm-and-why-would-you-use-one">What is an open-source LLM and why would you use one?</h2> <p>An open-source language model (LLM) is a model that is made
available to the public for free, with its weights and architecture openly
accessible.</p> <p>Versus closed-source and proprietary LLMs like OpenAI’s GPT and
Anthropic’s Claude, open-source LLMs offer several advantages:</p> <ul><li><p><strong>Open licenses</strong>:</p> <p>Open-source LLMs are released under permissive licenses like Apache 2.0 and MIT, allowing developers to
use, modify, and distribute the models freely.</p></li> <li><p><strong>Publicly available weights</strong>:</p> <p>The pre-trained weights of open-source LLMs are readily available, enabling
developers to fine-tune the models for specific tasks without starting from
scratch.</p></li> <li><p><strong>Cheaper</strong>:</p> <p>There are a lot of caveats here (OpenAI GPT-3.5 is the most cost-effective option for many, many use cases), but if you have high-volume use cases with consistent load, you can save money by running open-source LLMs on your own infrastructure or through cost-effective cloud providers.</p> <p>For example, Ramp recently <!> by 79% by switching from OpenAI to running an open-source LLM on Modal.</p></li> <li><p><strong>Fast inference speeds and no rate-limiting</strong>:</p> <p>Open-source LLMs also offer the potential for faster inference speeds, as you
have control over the hardware and optimization techniques employed.
Additionally, you are not subject to the rate limits and usage restrictions
often imposed by commercial LLM providers.</p></li></ul> <p>With the plethora of open-source LLMs
now coming out, there’s a lot of noise, and not every new model warrants your
attention. You should consider a new open-source LLM when:</p> <ol><li>It achieves state-of-the-art performance in specific dimensions, such as accuracy,
efficiency, or model size, compared to existing open-source models.</li> <li>It surpasses the performance of cutting-edge proprietary models, such as GPT-4/5.</li> <li>It offers performance comparable to cutting-edge proprietary models while being
significantly more cost-effective (e.g., 10x cheaper).</li></ol> <h2 id="how-to-evaluate-open-source-llms">How to evaluate open-source LLMs</h2> <p>When evaluating open-source LLMs, consider the following
factors:</p> <ul><li><strong>Quality</strong>: How accurate and coherent are the model’s outputs?</li></ul> <p>While a lot of open-source LLMs claim that they are the leader on various benchmarks, we recommend just trying out the models on prompts that resemble your specific use case.</p> <ul><li><strong>Speed</strong>: How quickly can the model generate outputs?</li></ul> <p>Models of comparable size should have similar inference speeds, but this can still vary based on optimization techniques and inference providers.</p> <p>In general, you should be looking at something like 30-50 tokens/second for a 70B model, and 100-200 tokens/second for a 7B model.</p> <ul><li><strong>Cost</strong>: What are the costs associated with running the model?</li></ul> <p>While open-source LLMs are ostensibly “free” to use, you still need to consider the cost of running the model on your own infrastructure or through a cloud provider.</p> <p>Here, you should consider not only the server time - whether that’s spinning up your own servers or using one of the newer serverless providers like <!> - but also the cost of maintenance, migration, and developer training.</p> <p>There are a <!> that aggregate the metrics mentioned above for the various open-source LLMs and cloud providers.</p> <p><!></p> <h3 id="whats-the-difference-between-the-7b-and-the-70b-versions">What’s the difference between the 7B and the 70B versions?</h3> <p>When considering open-source LLMs, you’ll often come across models with the same name but different parameter counts, such as Llama3-8B and Llama3-70B. These numbers refer to the number of relationships the AI can
build internally with the training data.</p> <p>A 70B model has 10 times the number of internal inter-token relationships compared to a 7B model, allowing it to
capture more subtle patterns and nuances in the data.
While larger models often exhibit better performance, they also come with higher computational costs and
longer inference times.</p> <p>We recommend that you start out by trying the 7B models,
which can generally run on consumer hardware, even mobile phones, and if the
models prove insufficient for your use case, then move on to the larger models.</p> <h3 id="whats-the-difference-between-instruct-vs-non-instruct-versions">What’s the difference between Instruct vs. non-Instruct versions?</h3> <p>Open-source LLMs can come in both instruct and non-instruct versions. Instruct
models are fine-tuned to follow instructions and are generally more suitable for
task-oriented applications, while non-instruct models are more open-ended and
can be used for creative generation tasks.</p> <h2 id="best-overall-open-source-llm">Best overall open-source LLM</h2> <p><!> is roughly comparable to GPT-4o in terms of quality, and excels at
general writing, coding, and reasoning tasks.</p> <p>Users report that it is not as good for coding as Claude-3.5-Sonnet, but it is
significantly cheaper to run.</p> <p>You can try a hosted version of DeepSeek-V3 on <!>’s website.</p> <h2 id="best-open-source-llm-for-chat">Best open-source LLM for chat</h2> <p><!> is designed for conversational applications, making it a strong choice for chatbots and other AI assistants.</p> <p>It excels at general task following and content generation.</p> <h2 id="best-open-source-llm-for-math">Best open-source LLM for math</h2> <p><!> is a 32B parameter distilled version of the DeepSeek-R1 model, with very good
performance on general math.</p> <p>DeepSeek-R1-Distill-Qwen-32B is a smaller version of the full DeepSeek-R1 model that is more
efficient and cheaper to run (Qwen-32B fine-tuned on
hundreds of thousands of samples of DeepSeek-R1 outputs).</p> <h2 id="best-open-source-llm-for-coding">Best open-source LLM for coding</h2> <p><!> is a 32B parameter Qwen
model that is fine-tuned for coding tasks.</p> <p>It has competitive performance with GPT-4o on code generation and code repair,
and is familiar with 40+ programming languages.</p> <h2 id="best-open-source-llm-for-fine-tuning">Best open-source LLM for fine-tuning</h2> <p>If you plan to fine-tune your LLM, we recommend:</p> <ul><li><!></li></ul> <p>A larger model with a mixture-of-experts architecture that allows
for efficient fine-tuning.</p> <p>You can fine-tune Mixtral on Modal Labs using our <!>.</p> <h2 id="where-to-find-open-source-llms">Where to find open-source LLMs</h2> <p>One of the best places to find open-source LLMs is <!>. Hugging Face is a
community-driven platform that hosts a wide variety of open-source models,
including LLMs, and provides tools for easy integration and fine-tuning.</p> <h2 id="where-to-run-open-source-llms">Where to run open-source LLMs</h2> <p>There are several options for running open-source
LLMs, including:</p> <ul><li>Cloud platforms like <!>, <!>, and <!></li> <li>On-premise hardware</li> <li>Specialized AI platforms like <!>, <!>, and <!></li></ul> <h2 id="how-to-serve-open-source-llms-blazingly-fast">How to serve open-source LLMs blazingly fast</h2> <p>To serve your open-source LLM fast, you will likely need to use one of the below
LLM inference engines. The two best engines in 2025 are:</p> <ul><li><!>: A platform for optimizing and
accelerating AI models on NVIDIA GPUs. Best performance but annoying to set up. To run an open-source LLM with TensorRT-LLM on Modal, check out our <!>.</li> <li><!>: UC Berkeley’s open-source option, relatively easy to use. To run an open-source LLM with vLLM on Modal, check out our <!>.</li></ul> <h2 id="run-open-source-llms-on-modal">Run open-source LLMs on Modal</h2> <p><!> is a serverless cloud computing platform that makes it easy to run open-source
LLMs in the cloud. With Modal, you can:</p> <ul><li>Easily <!>, with less waste. Modal automatically spins up new containers when you have more demand and scales down when you have less.</li> <li>Access powerful <!> on-demand.</li></ul> <p>To get started with running open-source LLMs on Modal, check out our <!> and <!>.</p>`,1);function w(t,f){let p=ee(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>p,()=>d,{children:(t,ee)=>{var a=re(),u=o(te(a),8),d=e(u);l(e(d),{href:`#what-is-an-open-source-llm-and-why-would-you-use-one`,children:(e,t)=>{s(),i(e,r(`What is an open-source LLM and why would you use one?`))},$$slots:{default:!0}}),n(d);var f=o(d,2);l(e(f),{href:`#how-to-evaluate-open-source-llms`,children:(e,t)=>{s(),i(e,r(`How to evaluate open-source LLMs`))},$$slots:{default:!0}}),n(f);var p=o(f,2);l(e(p),{href:`#best-overall-open-source-llm`,children:(e,t)=>{s(),i(e,r(`Best overall open-source LLM: DeepSeek-V3`))},$$slots:{default:!0}}),n(p);var m=o(p,2);l(e(m),{href:`#best-open-source-llm-for-chat`,children:(e,t)=>{s(),i(e,r(`Best open-source LLM for chat: Meta-LLama-3.1-8B-Instruct`))},$$slots:{default:!0}}),n(m);var h=o(m,2);l(e(h),{href:`#best-open-source-llm-for-coding`,children:(e,t)=>{s(),i(e,r(`Best open-source LLM for coding: Qwen2.5-Coder-32B-Instruct`))},$$slots:{default:!0}}),n(h);var g=o(h,2);l(e(g),{href:`#best-open-source-llm-for-fine-tuning`,children:(e,t)=>{s(),i(e,r(`Best open-source LLM for fine-tuning: Mixtral-8x7B-Instruct`))},$$slots:{default:!0}}),n(g);var _=o(g,2);l(e(_),{href:`#where-to-find-open-source-llms`,children:(e,t)=>{s(),i(e,r(`Where to find open-source LLMs`))},$$slots:{default:!0}}),n(_);var v=o(_,2);l(e(v),{href:`#where-to-run-open-source-llms`,children:(e,t)=>{s(),i(e,r(`Where to run open-source LLMs`))},$$slots:{default:!0}}),n(v);var y=o(v,2);l(e(y),{href:`#how-to-serve-open-source-llms-blazingly-fast`,children:(e,t)=>{s(),i(e,r(`How to serve open-source LLMs blazingly fast`))},$$slots:{default:!0}}),n(y);var b=o(y,2);l(e(b),{href:`#run-open-source-llms-on-modal`,children:(e,t)=>{s(),i(e,r(`Run open-source LLMs on Modal`))},$$slots:{default:!0}}),n(b),n(u);var x=o(u,8),S=o(e(x),4),C=o(e(S),4);l(o(e(C)),{href:`/blog/ramp-case-study`,children:(e,t)=>{s(),i(e,r(`cut their infrastructure costs for automated receipt processing`))},$$slots:{default:!0}}),s(),n(C),n(S),s(2),n(x);var w=o(x,24);l(o(e(w)),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),s(),n(w);var T=o(w,2);l(o(e(T)),{href:`https://artificialanalysis.ai/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`number of sites`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);c(e(E),{get src(){return ne},alt:`artificialanalysis.ai`}),n(E);var D=o(E,16);l(e(D),{href:`https://huggingface.co/deepseek-ai/DeepSeek-V3`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DeepSeek-V3`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,4);l(o(e(O)),{href:`https://www.deepseek.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DeepSeek`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,4);l(e(k),{href:`https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Meta-LLama-3.1-8B-Instruct`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,6);l(e(A),{href:`https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DeepSeek-R1-Distill-Qwen-32B`))},$$slots:{default:!0}}),s(),n(A);var j=o(A,6);l(e(j),{href:`https://qwenlm.github.io/blog/qwen2.5-coder-family/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Qwen2.5-Coder-32B-Instruct`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,8),N=e(M);l(e(N),{href:`https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Mixtral-8x7B-Instruct`))},$$slots:{default:!0}}),n(N),n(M);var P=o(M,4);l(o(e(P)),{href:`https://github.com/modal-labs/llm-finetuning`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`fine-tuning template`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);l(o(e(F)),{href:`https://huggingface.co/models`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Hugging Face`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,6),L=e(I),R=o(e(L));l(R,{href:`https://aws.amazon.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`AWS`))},$$slots:{default:!0}});var z=o(R,2);l(z,{href:`https://cloud.google.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Google
Cloud`))},$$slots:{default:!0}}),l(o(z,2),{href:`https://azure.microsoft.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Azure`))},$$slots:{default:!0}}),n(L);var B=o(L,4),V=o(e(B));l(V,{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}});var H=o(V,2);l(H,{href:`https://together.ai/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Together.ai`))},$$slots:{default:!0}}),l(o(H,2),{href:`https://fireworks.ai/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Fireworks.ai`))},$$slots:{default:!0}}),n(B),n(I);var U=o(I,6),W=e(U),G=e(W);l(G,{href:`https://github.com/NVIDIA/TensorRT-LLM`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM`))},$$slots:{default:!0}}),l(o(G,2),{href:`/docs/examples/trtllm_llama`,children:(e,t)=>{s(),i(e,r(`TensorRT-LLM example`))},$$slots:{default:!0}}),s(),n(W);var K=o(W,2),q=e(K);l(q,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),l(o(q,2),{href:`/docs/examples/vllm_inference`,children:(e,t)=>{s(),i(e,r(`example`))},$$slots:{default:!0}}),s(),n(K),n(U);var J=o(U,4);l(e(J),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,2),X=e(Y);l(o(e(X)),{href:`/solutions/llm`,children:(e,t)=>{s(),i(e,r(`deploy and scale open-source LLMs`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,2);l(o(e(Z)),{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`GPU resources`))},$$slots:{default:!0}}),s(),n(Z),n(Y);var Q=o(Y,2),$=o(e(Q));l($,{href:`/docs/guide`,children:(e,t)=>{s(),i(e,r(`documentation`))},$$slots:{default:!0}}),l(o($,2),{href:`/docs/examples`,children:(e,t)=>{s(),i(e,r(`examples`))},$$slots:{default:!0}}),s(),n(Q),i(t,a)},$$slots:{default:!0}}))}export{w as default,d as metadata};
//# sourceMappingURL=BtaM7WpV.js.map
