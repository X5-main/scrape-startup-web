(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`44743069-1a13-43cc-9530-d723a774e06d`,e._sentryDebugIdIdentifier=`sentry-dbid-44743069-1a13-43cc-9530-d723a774e06d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`How much VRAM do I need for LLM inference?`,description:`Estimating VRAM requirements for large language model inference`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-01T12:00:00.000Z`,length:`3 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`The rule of thumb`,id:`the-rule-of-thumb`},{depth:2,value:`Example`,id:`example`},{depth:2,value:`Impact of quantization`,id:`impact-of-quantization`},{depth:2,value:`Precision matters`,id:`precision-matters`},{depth:2,value:`Example with quantization`,id:`example-with-quantization`}],rawContent:`## The rule of thumb

A quick rule of thumb for LLM serving for models loaded in "half precision" - i.e. 16 bits, is approximately **2GB of GPU memory per 1B parameters in the model**.

## Example

Let's calculate for Llama3-70B loaded in 16-bit precision:

<div style="text-align: center;">
  <code>70B x 2GB/B = 140GB</code>
</div>

A single A100 80GB wouldn't be enough, but 2x A100 80GB should suffice.

## Impact of quantization

You can decrease the amount of GPU memory needed by quantizing, essentially reducing the precision of the weights of the model. Common quantization levels include:

**16-bit:** Also called "half-precision", often used as the default, balancing precision and memory usage.

**8-bit:** Generally achieves similar performance to 16-bit while halving memory requirements.

**4-bit:** Significantly reduces memory needs but may noticeably impact model performance.

You can load [HuggingFace models at half, 8-bit, or 4-bit precision](https://discuss.huggingface.co/t/loading-half-precision-pipeline/68975/2) with simple parameter changes with the transformers library.

## Precision matters

To calculate the memory needed for a model with quantization, you can use the following formula:

<div style="text-align: center;">
  <code>M = (P x (Q/8)) x 1.2</code>
</div>

Where:

\`M\`: GPU memory (VRAM) expressed in gigabytes

\`P\`: The number of parameters in the model (e.g., 70 for a 70B model)

\`Q\`: The number of bits used for loading the model (e.g., 16, 8, or 4 bits)

\`1.2\`: Represents a 20% overhead for additional tasks like [key-value caching](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/#key-value_caching), where you cache self-attention tensors for faster inference.

## Example with quantization

Let's consider 4-bit quantization of Llama3-70B:

<div style="text-align: center;">
  <code>70 x (4/8) x 1.2 = 42GB</code>
</div>

This could run on 2x A10 24GB GPUs.
`,meta:{description:`Estimating VRAM requirements for large language model inference`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<h2 id="the-rule-of-thumb">The rule of thumb</h2> <p>A quick rule of thumb for LLM serving for models loaded in “half precision” - i.e. 16 bits, is approximately <strong>2GB of GPU memory per 1B parameters in the model</strong>.</p> <h2 id="example">Example</h2> <p>Let’s calculate for Llama3-70B loaded in 16-bit precision:</p> <div style="text-align: center;"><code>70B x 2GB/B = 140GB</code></div> <p>A single A100 80GB wouldn’t be enough, but 2x A100 80GB should suffice.</p> <h2 id="impact-of-quantization">Impact of quantization</h2> <p>You can decrease the amount of GPU memory needed by quantizing, essentially reducing the precision of the weights of the model. Common quantization levels include:</p> <p><strong>16-bit:</strong> Also called “half-precision”, often used as the default, balancing precision and memory usage.</p> <p><strong>8-bit:</strong> Generally achieves similar performance to 16-bit while halving memory requirements.</p> <p><strong>4-bit:</strong> Significantly reduces memory needs but may noticeably impact model performance.</p> <p>You can load <!> with simple parameter changes with the transformers library.</p> <h2 id="precision-matters">Precision matters</h2> <p>To calculate the memory needed for a model with quantization, you can use the following formula:</p> <div style="text-align: center;"><code>M = (P x (Q/8)) x 1.2</code></div> <p>Where:</p> <p><code>M</code>: GPU memory (VRAM) expressed in gigabytes</p> <p><code>P</code>: The number of parameters in the model (e.g., 70 for a 70B model)</p> <p><code>Q</code>: The number of bits used for loading the model (e.g., 16, 8, or 4 bits)</p> <p><code>1.2</code>: Represents a 20% overhead for additional tasks like <!>, where you cache self-attention tensors for faster inference.</p> <h2 id="example-with-quantization">Example with quantization</h2> <p>Let’s consider 4-bit quantization of Llama3-70B:</p> <div style="text-align: center;"><code>70 x (4/8) x 1.2 = 42GB</code></div> <p>This could run on 2x A10 24GB GPUs.</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=c(s(o),22);u(c(e(d)),{href:`https://discuss.huggingface.co/t/loading-half-precision-pipeline/68975/2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HuggingFace models at half, 8-bit, or 4-bit precision`))},$$slots:{default:!0}}),l(),n(d);var f=c(d,16);u(c(e(f),2),{href:`https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/#key-value_caching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`key-value caching`))},$$slots:{default:!0}}),l(),n(f),l(8),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=wU7ECIjN2.js.map
