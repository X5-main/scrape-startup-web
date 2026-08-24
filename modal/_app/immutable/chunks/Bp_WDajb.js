(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`30c3d0cc-4c06-4b0a-84ab-4d89a7edf916`,e._sentryDebugIdIdentifier=`sentry-dbid-30c3d0cc-4c06-4b0a-84ab-4d89a7edf916`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p=`/_app/immutable/assets/axolotl.CwAsO-9x.png`,m=`/_app/immutable/assets/unsloth.BmcAUDZL.png`,h={title:`Best frameworks for fine-tuning LLMs in 2025`,description:`Axolotl vs. Unsloth vs. Torchtune`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-27T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of contents`,id:`table-of-contents`},{depth:2,value:`What are Axolotl, Unsloth, and Torchtune?`,id:`what-are-axolotl-unsloth-and-torchtune`},{depth:2,value:`Takeaways`,id:`takeaways`},{depth:2,value:`Axolotl`,id:`axolotl`},{depth:2,value:`Unsloth`,id:`unsloth`},{depth:2,value:`Torchtune`,id:`torchtune`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`In this article, we cover the state-of-the-art frameworks for fine-tuning large language models (LLMs) in 2025. These frameworks make it faster, cheaper, and simpler to fine-tune models like LLaMA 3/LLaMA3.1, Mistral, Mixtral, or Pythia on your own data.

## Table of contents

- [What are Axolotl, Unsloth, and Torchtune?](#what-are-axolotl-unsloth-and-torchtune)
- [Takeaways](#takeaways)
- [Axolotl](#axolotl)
- [Unsloth](#unsloth)
- [Torchtune](#torchtune)
- [Conclusion](#conclusion)

## What are Axolotl, Unsloth, and Torchtune?

Axolotl, Unsloth, and Torchtune are three of the most popular frameworks for fine-tuning large language models.

These frameworks simplify the fine-tuning process. Users can easily apply state-of-the-art optimization techniques to fine-tuning open weights models to their specific datasets without needing to implement training procedures from scratch.

They are also generally designed to optimize the fine-tuning process, potentially offering faster training speeds and reduced memory usage.

## Takeaways

- If you are a beginner: Use Axolotl.
- If you have limited GPU resources: Use Unsloth.
- If you prefer working directly with PyTorch: Use Torchtune.
- If you want to train on more than one GPU: Use Axolotl.

## Axolotl

![axolotl](./axolotl.png)

[Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) is a wrapper for lower-level Hugging Face libraries like [Transformers](https://huggingface.co/docs/transformers/en/training), retaining most of the granular control they offer while being much easier to use. It frees you up to focus more on your data rather than the technical details of the fine-tuning process.

Axolotl comes with lots of built-in default values and optimizations, reducing the need for manual configuration. The tool includes clever features like sample packing, which can improve training efficiency.

With Axolotl, you can train open weights models like LLaMA 3/LLaMA 3.1, Pythia, and Falcon, all available on Hugging Face.

You should consider using Axolotl if you don't want to get too deep into the math of LLMs and just want to fine-tune a model.

## Unsloth

![unsloth](./unsloth.png)

[Unsloth](https://github.com/unslothai/unsloth), built by [Daniel Han Chen](https://x.com/danielhanchen), who was previously a Nvidia engineer, is designed to dramatically improve the speed and efficiency of LLM fine-tuning. It allows you to fine-tune Llama 3.1, Mistral, Phi & Gemma LLMs 2-5x faster with 80% less memory usage compared to [FA2](https://github.com/Dao-AILab/flash-attention) (Flash Attention 2).

Unsloth achieves these improvements without degradation of accuracy, since it doesn't rely on approximation or quanization. Instead, the Unsloth team achieved the improvement in speed with a fast, custom attention implementation in [Triton](https://openai.com/index/triton/), OpenAI's high-level language for GPU kernels.

The main goal of Unsloth is to make it possible for everyone to fine-tune their language models, even with very limited GPU resources. Consider using Unsloth if you only have access to smaller or older GPUs.

So for example, if you are trying to fine-tune something on the free tier of Google Colab, which gives you a single Tesla T4 GPU, then Unsloth might be the the choice for you. (Note that Unsloth does not support multi-GPU training, so if you have a large GPU cluster, you should Axolotl instead.)

## Torchtune

[Torchtune](https://github.com/pytorch/torchtune) is a PyTorch-native library for easily fine-tuning LLMs. It offers a lean, extensible, abstraction-free design that's just pure PyTorch.

The library is designed with memory efficiency in mind, with recipes tested on consumer GPUs with 24GB VRAM. Torchtune provides excellent interoperability with popular libraries across the PyTorch ecosystem, as well as recipes for parameter-efficient techniques like qLoRA and LoRA, in addition to full fine-tuning.

Torchtune is an excellent choice if you prefer working directly with PyTorch without additional abstractions, need flexibility and extensibility in your fine-tuning pipeline, or want to leverage a wide range of integrations with popular AI tools and platforms.

## Conclusion

The choice between these tools ultimately depends on your specific requirements, hardware constraints, and level of expertise.

In the vast majority of cases, and especially if you are a beginner, we recommend using Axolotl.

To fine-tune with Axolotl using [Modal](https://modal.com), check out our [fine-tuning starter code](https://github.com/modal-labs/llm-finetuning).
`,meta:{description:`Axolotl vs. Unsloth vs. Torchtune`}},{title:g,description:_,authors:v,date:y,length:b,category:x,subcategory:S,published:C,layout:w,toc:T,rawContent:E,meta:D}=h,O=t(`<p>In this article, we cover the state-of-the-art frameworks for fine-tuning large language models (LLMs) in 2025. These frameworks make it faster, cheaper, and simpler to fine-tune models like LLaMA 3/LLaMA3.1, Mistral, Mixtral, or Pythia on your own data.</p> <h2 id="table-of-contents">Table of contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="what-are-axolotl-unsloth-and-torchtune">What are Axolotl, Unsloth, and Torchtune?</h2> <p>Axolotl, Unsloth, and Torchtune are three of the most popular frameworks for fine-tuning large language models.</p> <p>These frameworks simplify the fine-tuning process. Users can easily apply state-of-the-art optimization techniques to fine-tuning open weights models to their specific datasets without needing to implement training procedures from scratch.</p> <p>They are also generally designed to optimize the fine-tuning process, potentially offering faster training speeds and reduced memory usage.</p> <h2 id="takeaways">Takeaways</h2> <ul><li>If you are a beginner: Use Axolotl.</li> <li>If you have limited GPU resources: Use Unsloth.</li> <li>If you prefer working directly with PyTorch: Use Torchtune.</li> <li>If you want to train on more than one GPU: Use Axolotl.</li></ul> <h2 id="axolotl">Axolotl</h2> <p><!></p> <p><!> is a wrapper for lower-level Hugging Face libraries like <!>, retaining most of the granular control they offer while being much easier to use. It frees you up to focus more on your data rather than the technical details of the fine-tuning process.</p> <p>Axolotl comes with lots of built-in default values and optimizations, reducing the need for manual configuration. The tool includes clever features like sample packing, which can improve training efficiency.</p> <p>With Axolotl, you can train open weights models like LLaMA 3/LLaMA 3.1, Pythia, and Falcon, all available on Hugging Face.</p> <p>You should consider using Axolotl if you don’t want to get too deep into the math of LLMs and just want to fine-tune a model.</p> <h2 id="unsloth">Unsloth</h2> <p><!></p> <p><!>, built by <!>, who was previously a Nvidia engineer, is designed to dramatically improve the speed and efficiency of LLM fine-tuning. It allows you to fine-tune Llama 3.1, Mistral, Phi & Gemma LLMs 2-5x faster with 80% less memory usage compared to <!> (Flash Attention 2).</p> <p>Unsloth achieves these improvements without degradation of accuracy, since it doesn’t rely on approximation or quanization. Instead, the Unsloth team achieved the improvement in speed with a fast, custom attention implementation in <!>, OpenAI’s high-level language for GPU kernels.</p> <p>The main goal of Unsloth is to make it possible for everyone to fine-tune their language models, even with very limited GPU resources. Consider using Unsloth if you only have access to smaller or older GPUs.</p> <p>So for example, if you are trying to fine-tune something on the free tier of Google Colab, which gives you a single Tesla T4 GPU, then Unsloth might be the the choice for you. (Note that Unsloth does not support multi-GPU training, so if you have a large GPU cluster, you should Axolotl instead.)</p> <h2 id="torchtune">Torchtune</h2> <p><!> is a PyTorch-native library for easily fine-tuning LLMs. It offers a lean, extensible, abstraction-free design that’s just pure PyTorch.</p> <p>The library is designed with memory efficiency in mind, with recipes tested on consumer GPUs with 24GB VRAM. Torchtune provides excellent interoperability with popular libraries across the PyTorch ecosystem, as well as recipes for parameter-efficient techniques like qLoRA and LoRA, in addition to full fine-tuning.</p> <p>Torchtune is an excellent choice if you prefer working directly with PyTorch without additional abstractions, need flexibility and extensibility in your fine-tuning pipeline, or want to leverage a wide range of integrations with popular AI tools and platforms.</p> <h2 id="conclusion">Conclusion</h2> <p>The choice between these tools ultimately depends on your specific requirements, hardware constraints, and level of expertise.</p> <p>In the vast majority of cases, and especially if you are a beginner, we recommend using Axolotl.</p> <p>To fine-tune with Axolotl using <!>, check out our <!>.</p>`,1);function k(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>_,()=>h,{children:(t,a)=>{var o=O(),f=c(s(o),4),h=e(f);d(e(h),{href:`#what-are-axolotl-unsloth-and-torchtune`,children:(e,t)=>{l(),i(e,r(`What are Axolotl, Unsloth, and Torchtune?`))},$$slots:{default:!0}}),n(h);var g=c(h,2);d(e(g),{href:`#takeaways`,children:(e,t)=>{l(),i(e,r(`Takeaways`))},$$slots:{default:!0}}),n(g);var _=c(g,2);d(e(_),{href:`#axolotl`,children:(e,t)=>{l(),i(e,r(`Axolotl`))},$$slots:{default:!0}}),n(_);var v=c(_,2);d(e(v),{href:`#unsloth`,children:(e,t)=>{l(),i(e,r(`Unsloth`))},$$slots:{default:!0}}),n(v);var y=c(v,2);d(e(y),{href:`#torchtune`,children:(e,t)=>{l(),i(e,r(`Torchtune`))},$$slots:{default:!0}}),n(y);var b=c(y,2);d(e(b),{href:`#conclusion`,children:(e,t)=>{l(),i(e,r(`Conclusion`))},$$slots:{default:!0}}),n(b),n(f);var x=c(f,16);u(e(x),{get src(){return p},alt:`axolotl`}),n(x);var S=c(x,2),C=e(S);d(C,{href:`https://github.com/OpenAccess-AI-Collective/axolotl`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Axolotl`))},$$slots:{default:!0}}),d(c(C,2),{href:`https://huggingface.co/docs/transformers/en/training`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Transformers`))},$$slots:{default:!0}}),l(),n(S);var w=c(S,10);u(e(w),{get src(){return m},alt:`unsloth`}),n(w);var T=c(w,2),E=e(T);d(E,{href:`https://github.com/unslothai/unsloth`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Unsloth`))},$$slots:{default:!0}});var D=c(E,2);d(D,{href:`https://x.com/danielhanchen`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Daniel Han Chen`))},$$slots:{default:!0}}),d(c(D,2),{href:`https://github.com/Dao-AILab/flash-attention`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FA2`))},$$slots:{default:!0}}),l(),n(T);var k=c(T,2);d(c(e(k)),{href:`https://openai.com/index/triton/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Triton`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,8);d(e(A),{href:`https://github.com/pytorch/torchtune`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Torchtune`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,12),M=c(e(j));d(M,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),d(c(M,2),{href:`https://github.com/modal-labs/llm-finetuning`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`fine-tuning starter code`))},$$slots:{default:!0}}),l(),n(j),i(t,o)},$$slots:{default:!0}}))}export{k as default,h as metadata};
//# sourceMappingURL=Bp_WDajb.js.map
