(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cb4d2eab-f891-42fd-ac67-2fc035b2eb94`,e._sentryDebugIdIdentifier=`sentry-dbid-cb4d2eab-f891-42fd-ac67-2fc035b2eb94`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`What is Flash Attention?`,description:`Learn how to speed up your model training and inference with Flash Attention`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-10-16T16:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Frameworks and Tools`,published:!0,layout:`blog`,toc:[{depth:2,value:`How does Flash Attention work?`,id:`how-does-flash-attention-work`},{depth:2,value:`When should you use Flash Attention`,id:`when-should-you-use-flash-attention`},{depth:2,value:`Flash Attention Versions`,id:`flash-attention-versions`},{depth:2,value:`How to use Flash Attention`,id:`how-to-use-flash-attention`,children:[{depth:3,value:`PyTorch`,id:`pytorch`},{depth:3,value:`Hugging Face Transformers`,id:`hugging-face-transformers`},{depth:3,value:`vLLM`,id:`vllm`}]},{depth:2,value:`Text Generation Inference (TGI)`,id:`text-generation-inference-tgi`,children:[{depth:3,value:`Separate Implementation`,id:`separate-implementation`}]}],rawContent:`[Flash Attention](https://github.com/Dao-AILab/flash-attention) is an algorithm that speeds up the training and inference of transformer models.

## How does Flash Attention work?

Many modern transformer models use a mechanism called "attention" to focus on important parts of their input. It's like how humans pay attention to key words in a sentence. The problem, though, is that traditional attention computations are slow and memory-hungry, especially for long sequences of data (like long documents or high-resolution images).

Flash Attention rethinks how attention is computed on GPUs. It uses smart memory management techniques to do the same calculations much faster and with less memory. In particular, it carefully manages how data moves between different levels of memory on a GPU.

## When should you use Flash Attention

You should consider using Flash Attention if:

- You're working with large language models or any AI that uses attention mechanisms (like transformers) and you want to speed up training or inference.
- You have very long input sequences (thousands or tens of thousands of tokens) or large batch sizes
- Scenarios where GPU memory is a bottleneck

By using Flash Attention in these contexts, you can expect:

- Faster training and inference times
- Ability to handle longer sequences without running out of memory
- Potential to increase model size or batch size within the same memory constraints

## Flash Attention Versions

There have been several versions of Flash Attention. After the original Flash Attention, released in 2022, [Flash Attention 2](https://arxiv.org/abs/2307.08691) was released in early 2023. It included optimizations for memory access patterns and causal attention, achieving up to 2x speedup over its predecessor.

The latest iteration, [Flash Attention 3](https://pytorch.org/blog/flashattention-3/), incorporates enhancements specifically designed for NVIDIA's Hopper GPU architecture, (e.g. H100s) allowing for even greater efficiency and performance. This version leverages advanced techniques to maximize GPU utilization and further improve speed and memory efficiency.

## How to use Flash Attention

The easiest way to use Flash Attention is to use a training or inference framework that has it integrated already. Below, we cover the most popular frameworks and the status of their integration with Flash Attention.

### PyTorch

PyTorch has [native support](https://pytorch.org/blog/pytorch2-2/#bookmark=id.ok7v7pq0igzw) for Flash Attention 2 as of version 2.2. You can use it directly in your PyTorch models. To enable Flash Attention in PyTorch, you typically need to select Flash Attention as [the attention mechanism in the Scaled Dot Product Attention backend](https://pytorch.org/tutorials/intermediate/scaled_dot_product_attention_tutorial.html#explicit-dispatcher-control).

### Hugging Face Transformers

The Transformers library supports Flash Attention for certain models. You can often enable it by setting the [\`attn_implementation="flash_attention_2"\`](https://huggingface.co/docs/transformers/main/en/perf_infer_gpu_one#flashattention-2) parameter when initializing a model. However, support may vary depending on the specific model architecture.

### vLLM

vLLM natively takes advantage of Flash Attention 2 as of v0.1.4. You don't need to enable it separately.

## Text Generation Inference (TGI)

Flash Attention is enabled by default for TGI. However, its usage may vary depending on the specific models, even when compiled.

The system aims to utilize Flash Attention whenever possible due to its advantages, but it will revert to alternative methods if any issues arise.

### Separate Implementation

While these frameworks often include Flash Attention or similar optimizations, you can also install it using pip:

\`\`\`bash
pip install flash-attn
\`\`\`

or clone the repo and [install it from source](/docs/examples/flux).

Make sure that you have its dependencies installed, including:

- **PyTorch**: Ensure you have PyTorch version 1.12 or above installed.
- **CUDA**: A compatible version of the CUDA toolkit is necessary for GPU support.
- **NVIDIA cuDNN**: This library is recommended for optimized performance on NVIDIA GPUs. For more information about the CUDA toolkit, refer to our [CUDA guide](/docs/guide/cuda).

For a full example of how to run a transformers model on cloud compute with Flash Attention 3, you can refer to our Flux tutorial [here](/docs/examples/flux).
`,meta:{description:`Learn how to speed up your model training and inference with Flash Attention`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<code>attn_implementation="flash_attention_2"</code>`),D=t(`<p><!> is an algorithm that speeds up the training and inference of transformer models.</p> <h2 id="how-does-flash-attention-work">How does Flash Attention work?</h2> <p>Many modern transformer models use a mechanism called “attention” to focus on important parts of their input. It’s like how humans pay attention to key words in a sentence. The problem, though, is that traditional attention computations are slow and memory-hungry, especially for long sequences of data (like long documents or high-resolution images).</p> <p>Flash Attention rethinks how attention is computed on GPUs. It uses smart memory management techniques to do the same calculations much faster and with less memory. In particular, it carefully manages how data moves between different levels of memory on a GPU.</p> <h2 id="when-should-you-use-flash-attention">When should you use Flash Attention</h2> <p>You should consider using Flash Attention if:</p> <ul><li>You’re working with large language models or any AI that uses attention mechanisms (like transformers) and you want to speed up training or inference.</li> <li>You have very long input sequences (thousands or tens of thousands of tokens) or large batch sizes</li> <li>Scenarios where GPU memory is a bottleneck</li></ul> <p>By using Flash Attention in these contexts, you can expect:</p> <ul><li>Faster training and inference times</li> <li>Ability to handle longer sequences without running out of memory</li> <li>Potential to increase model size or batch size within the same memory constraints</li></ul> <h2 id="flash-attention-versions">Flash Attention Versions</h2> <p>There have been several versions of Flash Attention. After the original Flash Attention, released in 2022, <!> was released in early 2023. It included optimizations for memory access patterns and causal attention, achieving up to 2x speedup over its predecessor.</p> <p>The latest iteration, <!>, incorporates enhancements specifically designed for NVIDIA’s Hopper GPU architecture, (e.g. H100s) allowing for even greater efficiency and performance. This version leverages advanced techniques to maximize GPU utilization and further improve speed and memory efficiency.</p> <h2 id="how-to-use-flash-attention">How to use Flash Attention</h2> <p>The easiest way to use Flash Attention is to use a training or inference framework that has it integrated already. Below, we cover the most popular frameworks and the status of their integration with Flash Attention.</p> <h3 id="pytorch">PyTorch</h3> <p>PyTorch has <!> for Flash Attention 2 as of version 2.2. You can use it directly in your PyTorch models. To enable Flash Attention in PyTorch, you typically need to select Flash Attention as <!>.</p> <h3 id="hugging-face-transformers">Hugging Face Transformers</h3> <p>The Transformers library supports Flash Attention for certain models. You can often enable it by setting the <!> parameter when initializing a model. However, support may vary depending on the specific model architecture.</p> <h3 id="vllm">vLLM</h3> <p>vLLM natively takes advantage of Flash Attention 2 as of v0.1.4. You don’t need to enable it separately.</p> <h2 id="text-generation-inference-tgi">Text Generation Inference (TGI)</h2> <p>Flash Attention is enabled by default for TGI. However, its usage may vary depending on the specific models, even when compiled.</p> <p>The system aims to utilize Flash Attention whenever possible due to its advantages, but it will revert to alternative methods if any issues arise.</p> <h3 id="separate-implementation">Separate Implementation</h3> <p>While these frameworks often include Flash Attention or similar optimizations, you can also install it using pip:</p> <!> <p>or clone the repo and <!>.</p> <p>Make sure that you have its dependencies installed, including:</p> <ul><li><strong>PyTorch</strong>: Ensure you have PyTorch version 1.12 or above installed.</li> <li><strong>CUDA</strong>: A compatible version of the CUDA toolkit is necessary for GPU support.</li> <li><strong>NVIDIA cuDNN</strong>: This library is recommended for optimized performance on NVIDIA GPUs. For more information about the CUDA toolkit, refer to our <!>.</li></ul> <p>For a full example of how to run a transformers model on cloud compute with Flash Attention 3, you can refer to our Flux tutorial <!>.</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=s(o);d(e(f),{href:`https://github.com/Dao-AILab/flash-attention`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flash Attention`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,20);d(c(e(p)),{href:`https://arxiv.org/abs/2307.08691`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flash Attention 2`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,2);d(c(e(m)),{href:`https://pytorch.org/blog/flashattention-3/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flash Attention 3`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,8),g=c(e(h));d(g,{href:`https://pytorch.org/blog/pytorch2-2/#bookmark=id.ok7v7pq0igzw`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`native support`))},$$slots:{default:!0}}),d(c(g,2),{href:`https://pytorch.org/tutorials/intermediate/scaled_dot_product_attention_tutorial.html#explicit-dispatcher-control`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the attention mechanism in the Scaled Dot Product Attention backend`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,4);d(c(e(_)),{href:`https://huggingface.co/docs/transformers/main/en/perf_infer_gpu_one#flashattention-2`,rel:`nofollow`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(_);var v=c(_,16);u(v,{code:`pip%20install%20flash-attn`,lang:`bash`});var y=c(v,2);d(c(e(y)),{href:`/docs/examples/flux`,children:(e,t)=>{l(),i(e,r(`install it from source`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,4),x=c(e(b),4);d(c(e(x),2),{href:`/docs/guide/cuda`,children:(e,t)=>{l(),i(e,r(`CUDA guide`))},$$slots:{default:!0}}),l(),n(x),n(b);var S=c(b,2);d(c(e(S)),{href:`/docs/examples/flux`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(S),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=D5RYrvaF.js.map
