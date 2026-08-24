(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`81028eee-1fff-4e9a-ac97-73fdf2d46351`,e._sentryDebugIdIdentifier=`sentry-dbid-81028eee-1fff-4e9a-ac97-73fdf2d46351`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How much VRAM do I need for LLM model fine-tuning?`,description:`Estimating VRAM requirements for large language model fine-tuning`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-01T12:00:00.000Z`,length:`3 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`The rule of thumb`,id:`the-rule-of-thumb`},{depth:2,value:`VRAM Requirements for fine-tuning a 7B model`,id:`vram-requirements-for-fine-tuning-a-7b-model`,children:[{depth:3,value:`1. Model parameters`,id:`1-model-parameters`},{depth:3,value:`2. Optimizer States`,id:`2-optimizer-states`},{depth:3,value:`3. Gradients`,id:`3-gradients`},{depth:3,value:`4. Activations`,id:`4-activations`},{depth:3,value:`Total VRAM Estimate`,id:`total-vram-estimate`}]},{depth:2,value:`Efficient fine-tuning: LoRA and QLoRA`,id:`efficient-fine-tuning-lora-and-qlora`},{depth:2,value:`VRAM requirements table`,id:`vram-requirements-table`}],rawContent:`Fine-tuning Large Language Models (LLMs) can be computationally intensive, with GPU memory (VRAM) often being the primary bottleneck. This is a guide to calculating the VRAM requirements for fine-tuning.

## The rule of thumb

For full fine-tuning of LLMs loaded in "half-precision" (16 bits), a quick rule of thumb is:

**16GB of GPU memory per 1B parameters in the model**

This is significantly higher than the [2GB per 1B parameters needed for inference](/blog/how-much-vram-need-inference), due to the additional memory required for [optimizer states, gradients, and other training-related data](https://fullstackdeeplearning.com/course/2022/lecture-2-development-infrastructure-and-tooling/#sharded-data-parallelism).

## VRAM Requirements for fine-tuning a 7B model

Let's walk through a VRAM estimation for a 7B parameter model. The total VRAM requirements are the sum of the following individual components:

### 1. Model parameters

- Full precision (FP32): ~28GB (7B x 4 bytes)
- Half precision (FP16): ~14GB (7B x 2 bytes)
- Mixed precision: ~21GB (FP16 + partial FP32 copy)

### 2. Optimizer States

Using AdamW (most common optimizer):

- ~84GB (3 copies at 4 bytes/parameter)

Using 8-bit optimizers (e.g., [\`bitsandbytes\`](https://github.com/bitsandbytes-foundation/bitsandbytes)):

- ~42GB (1 FP32 copy + 2 8-bit copies)

### 3. Gradients

- FP32: ~28GB
- FP16: ~14GB (often matches model weight precision)

### 4. Activations

Depends on batch size, sequence length, and model architecture. Can be reduced with [activation checkpointing](https://medium.com/pytorch/how-activation-checkpointing-enables-scaling-up-training-deep-learning-models-7a93ae01ff2d). For most contemporary model types (transformers, diffusion models), activations don't add nearly as much memory requirements as the other components above.

### Total VRAM Estimate

For full fine-tuning with half precision and using 8-bit optimizers, a 7B model might require 14+42+14 = ~70GB of VRAM.

## Efficient fine-tuning: LoRA and QLoRA

Techniques like LoRA (Low-Rank Adaptation) and QLoRA (Quantized LoRA) significantly reduce VRAM requirements. You can read more about how in our [LoRA vs. QLoRA article](/blog/lora-qlora).

## VRAM requirements table

Here's a comparison of VRAM requirements for different model sizes and fine-tuning techniques:

| Method | Precision | 7B   | 13B   | 30B   | 70B   | 110B   |
| ------ | --------- | ---- | ----- | ----- | ----- | ------ |
| Full   | 16        | 67GB | 125GB | 288GB | 672GB | 1056GB |
| LoRA   | 16        | 15GB | 28GB  | 63GB  | 146GB | 229GB  |
| QLoRA  | 8         | 9GB  | 17GB  | 38GB  | 88GB  | 138GB  |
| QLoRA  | 4         | 5GB  | 9GB   | 20GB  | 46GB  | 72GB   |

Note: These are approximate values and actual usage may vary based on implementation details and additional memory needs during training.
`,meta:{description:`Estimating VRAM requirements for large language model fine-tuning`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<code>bitsandbytes</code>`),D=t(`<thead><tr><th>Method</th><th>Precision</th><th>7B</th><th>13B</th><th>30B</th><th>70B</th><th>110B</th></tr></thead> <tbody><tr><td>Full</td><td>16</td><td>67GB</td><td>125GB</td><td>288GB</td><td>672GB</td><td>1056GB</td></tr><tr><td>LoRA</td><td>16</td><td>15GB</td><td>28GB</td><td>63GB</td><td>146GB</td><td>229GB</td></tr><tr><td>QLoRA</td><td>8</td><td>9GB</td><td>17GB</td><td>38GB</td><td>88GB</td><td>138GB</td></tr><tr><td>QLoRA</td><td>4</td><td>5GB</td><td>9GB</td><td>20GB</td><td>46GB</td><td>72GB</td></tr></tbody>`,1),O=t(`<p>Fine-tuning Large Language Models (LLMs) can be computationally intensive, with GPU memory (VRAM) often being the primary bottleneck. This is a guide to calculating the VRAM requirements for fine-tuning.</p> <h2 id="the-rule-of-thumb">The rule of thumb</h2> <p>For full fine-tuning of LLMs loaded in “half-precision” (16 bits), a quick rule of thumb is:</p> <p><strong>16GB of GPU memory per 1B parameters in the model</strong></p> <p>This is significantly higher than the <!>, due to the additional memory required for <!>.</p> <h2 id="vram-requirements-for-fine-tuning-a-7b-model">VRAM Requirements for fine-tuning a 7B model</h2> <p>Let’s walk through a VRAM estimation for a 7B parameter model. The total VRAM requirements are the sum of the following individual components:</p> <h3 id="1-model-parameters">1. Model parameters</h3> <ul><li>Full precision (FP32): ~28GB (7B x 4 bytes)</li> <li>Half precision (FP16): ~14GB (7B x 2 bytes)</li> <li>Mixed precision: ~21GB (FP16 + partial FP32 copy)</li></ul> <h3 id="2-optimizer-states">2. Optimizer States</h3> <p>Using AdamW (most common optimizer):</p> <ul><li>~84GB (3 copies at 4 bytes/parameter)</li></ul> <p>Using 8-bit optimizers (e.g., <!>):</p> <ul><li>~42GB (1 FP32 copy + 2 8-bit copies)</li></ul> <h3 id="3-gradients">3. Gradients</h3> <ul><li>FP32: ~28GB</li> <li>FP16: ~14GB (often matches model weight precision)</li></ul> <h3 id="4-activations">4. Activations</h3> <p>Depends on batch size, sequence length, and model architecture. Can be reduced with <!>. For most contemporary model types (transformers, diffusion models), activations don’t add nearly as much memory requirements as the other components above.</p> <h3 id="total-vram-estimate">Total VRAM Estimate</h3> <p>For full fine-tuning with half precision and using 8-bit optimizers, a 7B model might require 14+42+14 = ~70GB of VRAM.</p> <h2 id="efficient-fine-tuning-lora-and-qlora">Efficient fine-tuning: LoRA and QLoRA</h2> <p>Techniques like LoRA (Low-Rank Adaptation) and QLoRA (Quantized LoRA) significantly reduce VRAM requirements. You can read more about how in our <!>.</p> <h2 id="vram-requirements-table">VRAM requirements table</h2> <p>Here’s a comparison of VRAM requirements for different model sizes and fine-tuning techniques:</p> <!> <p>Note: These are approximate values and actual usage may vary based on implementation details and additional memory needs during training.</p>`,1);function k(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=O(),f=c(s(o),8),p=c(e(f));d(p,{href:`/blog/how-much-vram-need-inference`,children:(e,t)=>{l(),i(e,r(`2GB per 1B parameters needed for inference`))},$$slots:{default:!0}}),d(c(p,2),{href:`https://fullstackdeeplearning.com/course/2022/lecture-2-development-infrastructure-and-tooling/#sharded-data-parallelism`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`optimizer states, gradients, and other training-related data`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,16);d(c(e(m)),{href:`https://github.com/bitsandbytes-foundation/bitsandbytes`,rel:`nofollow`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(m);var h=c(m,10);d(c(e(h)),{href:`https://medium.com/pytorch/how-activation-checkpointing-enables-scaling-up-training-deep-learning-models-7a93ae01ff2d`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`activation checkpointing`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,8);d(c(e(g)),{href:`/blog/lora-qlora`,children:(e,t)=>{l(),i(e,r(`LoRA vs. QLoRA article`))},$$slots:{default:!0}}),l(),n(g),u(c(g,6),{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{k as default,p as metadata};
//# sourceMappingURL=9JNd78fg2.js.map
