(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`80582885-c0cb-4bcc-9b0a-288801bcc79d`,e._sentryDebugIdIdentifier=`sentry-dbid-80582885-c0cb-4bcc-9b0a-288801bcc79d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`A10 vs. A100 vs. H100 - Which one should you choose?`,description:`Discover the best GPU for your AI workload: Compare A10, A100, and H100 performance, pricing, and use cases to make an informed decision.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-27T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`GPU comparison`,id:`gpu-comparison`,children:[{depth:3,value:`H100`,id:`h100`},{depth:3,value:`A100`,id:`a100`},{depth:3,value:`A10`,id:`a10`},{depth:3,value:`L4`,id:`l4`},{depth:3,value:`T4`,id:`t4`}]},{depth:2,value:`Choosing the right GPU`,id:`choosing-the-right-gpu`},{depth:2,value:`Advanced considerations`,id:`advanced-considerations`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`This article will guide you through the key differences between NVIDIA's [A10](https://www.nvidia.com/en-us/data-center/products/a10-gpu/), [A100](https://www.nvidia.com/en-us/data-center/a100/), and [H100](https://www.nvidia.com/en-us/data-center/h100/) GPUs, helping you make an informed decision based on your specific needs and budget.

## GPU comparison

Let's start with a comparison of the GPUs available on Modal:

| GPU Type    | VRAM (GiB) | Memory bandwidth (VRAM-to-SRAM, TB/s) | Price (on Modal, $ / hour) | Architecture |
| ----------- | ---------- | ------------------------------------- | -------------------------- | ------------ |
| H100        | 80         | 3.35                                  | 4.56                       | Hopper       |
| A100 (80GB) | 80         | 2                                     | 3.40                       | Ampere       |
| A100 (40GB) | 40         | 2                                     | 2.78                       | Ampere       |
| A10         | 24         | 0.6                                   | 1.10                       | Ampere       |
| L4          | 24         | 0.3                                   | 0.80                       | Lovelace     |
| T4          | 16         | 0.3                                   | 0.59                       | Tesla        |

- VRAM is high speed, byte-addressable memory located on your graphics card. It plays the same role in the GPU's memory system as the RAM plays in your CPU's. The more VRAM, the larger the models you can run.
- In the table above, we show the VRAM-to-SRAM memory bandwidth, which is the rate at which data can be transferred between the GPU's main memory (VRAM, typically GDDR or HBM) and its on-chip cache memory (SRAM). This bandwidth is crucial for the GPU's ability to quickly bring model parameters into the compute cores where activations and outputs are calculated.

### H100

- **Best for**: Training and inference for very large models (70B parameters or more), transformer-based architectures, low (8-bit) precision
- **Key features**:
  - Most powerful NVIDIA datacenter GPU that's generally available at time of writing (2025)
  - ~2x faster than A100 for most workloads, but also harder to get (might have to queue), and more expensive
  - Optimized for large language model workloads. It offers over 3 TB/s of memory bandwidth, which is crucial for LLM inference workloads that require rapid data transfer between VRAM and compute cores.
  - Contains specialized compute units for lower precision (FP8) operations

### A100

- **Best for**: Training and inference for large models (7B-70B parameters)
- **Key features**:
  - NVIDIA's workhorse GPU, meant for AI, data analytics, and HPC workloads
  - Available in 40GB and 80GB variants
  - Because memory bandwidth has scaled more slowly than arithmetic bandwidth, A100s can be more cost-effective than H100s for workloads that are memory-bound, like running large models on small batches

### A10

- **Best for**: Inference for small to medium models (7B parameters or less, like most diffusion-based image generation models), cost-effective, small-scale training for smaller models
- **Key features**:
  - Same architecture as A100, so most code that runs on A100 will run on A10
  - Good performance-to-cost ratio for smaller workloads

### L4

- **Best for**: Inference for small to medium size models (7B parameters or less, like most diffusion-based image generation models)

- **Key features**:
  - Cost-efficient GPU, but still very capable
  - L4 has the same amount of VRAM as A10, but only half the memory bandwidth
  - L4 offers 2x-4x better performance over and is newer than T4

### T4

- **Best for**:
  - Inference for small models

- **Key features**:
  - T4 is older and slower than L4
  - Offered for free with Google Colab, so good for small-scale experimentation and prototyping. For example, you can start with T4s on Colab, and run the same code in prod on L4s or A10s.

## Choosing the right GPU

When selecting a GPU for your machine learning, first gather the following information:

1. **Task Type**: Are you training, fine-tuning, or running inference?
2. **Model Size**: How many parameters does your model have?
3. **Memory Requirements**: How much VRAM does your model need?
4. **Budget**: What's your cost constraint per hour of computation?
5. **Performance Needs**: Do you require the absolute fastest processing times?

Then follow this procedure to decide which GPU is the best fit:

1. Calculate the amount of memory that you need, depending on your use case and model size. Remember to take into account whether you are quantizing the models and/or using [techniques like LoRA or QLoRA](/blog/lora-qlora). You can refer to our VRAM guides for more information on how to calculate the memory requirements:
   - [VRAM guide for inference](/blog/how-much-vram-need-inference)
   - [VRAM guide for training/fine-tuning](/blog/how-much-vram-need-fine-tuning)

2. Check against the table above for the most cost-effective GPU that the model will fit on

3. Start with the most cost-effective GPU to see whether the model runs/performs well and move to the more expensive ones if it doesn't.

## Advanced considerations

1. **Multi-GPU Setups**: For some super large models (greater than 100B parameters, like Llama3-405B), you may need to allocate more than a single even top-tier GPU. Modal's platform makes it easy to [scale up your GPU resources as needed](/docs/guide/gpu#specifying-gpu-count).

## Conclusion

At Modal, we offer flexible access to all these GPU types with a simple \`gpu="A100"\` or \`gpu="H100"\` flag in your code. This allows you to easily switch between GPUs based on your needs without worrying about hardware procurement or maintenance.

Ready to supercharge your AI workloads with the right GPU? [Sign up for Modal](https://modal.com/signup) today and experience the difference firsthand!
`,meta:{description:`Discover the best GPU for your AI workload: Compare A10, A100, and H100 performance, pricing, and use cases to make an informed decision.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th>GPU Type</th><th>VRAM (GiB)</th><th>Memory bandwidth (VRAM-to-SRAM, TB/s)</th><th>Price (on Modal, $ / hour)</th><th>Architecture</th></tr></thead> <tbody><tr><td>H100</td><td>80</td><td>3.35</td><td>4.56</td><td>Hopper</td></tr><tr><td>A100 (80GB)</td><td>80</td><td>2</td><td>3.40</td><td>Ampere</td></tr><tr><td>A100 (40GB)</td><td>40</td><td>2</td><td>2.78</td><td>Ampere</td></tr><tr><td>A10</td><td>24</td><td>0.6</td><td>1.10</td><td>Ampere</td></tr><tr><td>L4</td><td>24</td><td>0.3</td><td>0.80</td><td>Lovelace</td></tr><tr><td>T4</td><td>16</td><td>0.3</td><td>0.59</td><td>Tesla</td></tr></tbody>`,1),D=t(`<p>This article will guide you through the key differences between NVIDIA’s <!>, <!>, and <!> GPUs, helping you make an informed decision based on your specific needs and budget.</p> <h2 id="gpu-comparison">GPU comparison</h2> <p>Let’s start with a comparison of the GPUs available on Modal:</p> <!> <ul><li>VRAM is high speed, byte-addressable memory located on your graphics card. It plays the same role in the GPU’s memory system as the RAM plays in your CPU’s. The more VRAM, the larger the models you can run.</li> <li>In the table above, we show the VRAM-to-SRAM memory bandwidth, which is the rate at which data can be transferred between the GPU’s main memory (VRAM, typically GDDR or HBM) and its on-chip cache memory (SRAM). This bandwidth is crucial for the GPU’s ability to quickly bring model parameters into the compute cores where activations and outputs are calculated.</li></ul> <h3 id="h100">H100</h3> <ul><li><strong>Best for</strong>: Training and inference for very large models (70B parameters or more), transformer-based architectures, low (8-bit) precision</li> <li><strong>Key features</strong>: <ul><li>Most powerful NVIDIA datacenter GPU that’s generally available at time of writing (2025)</li> <li>~2x faster than A100 for most workloads, but also harder to get (might have to queue), and more expensive</li> <li>Optimized for large language model workloads. It offers over 3 TB/s of memory bandwidth, which is crucial for LLM inference workloads that require rapid data transfer between VRAM and compute cores.</li> <li>Contains specialized compute units for lower precision (FP8) operations</li></ul></li></ul> <h3 id="a100">A100</h3> <ul><li><strong>Best for</strong>: Training and inference for large models (7B-70B parameters)</li> <li><strong>Key features</strong>: <ul><li>NVIDIA’s workhorse GPU, meant for AI, data analytics, and HPC workloads</li> <li>Available in 40GB and 80GB variants</li> <li>Because memory bandwidth has scaled more slowly than arithmetic bandwidth, A100s can be more cost-effective than H100s for workloads that are memory-bound, like running large models on small batches</li></ul></li></ul> <h3 id="a10">A10</h3> <ul><li><strong>Best for</strong>: Inference for small to medium models (7B parameters or less, like most diffusion-based image generation models), cost-effective, small-scale training for smaller models</li> <li><strong>Key features</strong>: <ul><li>Same architecture as A100, so most code that runs on A100 will run on A10</li> <li>Good performance-to-cost ratio for smaller workloads</li></ul></li></ul> <h3 id="l4">L4</h3> <ul><li><p><strong>Best for</strong>: Inference for small to medium size models (7B parameters or less, like most diffusion-based image generation models)</p></li> <li><p><strong>Key features</strong>:</p> <ul><li>Cost-efficient GPU, but still very capable</li> <li>L4 has the same amount of VRAM as A10, but only half the memory bandwidth</li> <li>L4 offers 2x-4x better performance over and is newer than T4</li></ul></li></ul> <h3 id="t4">T4</h3> <ul><li><p><strong>Best for</strong>:</p> <ul><li>Inference for small models</li></ul></li> <li><p><strong>Key features</strong>:</p> <ul><li>T4 is older and slower than L4</li> <li>Offered for free with Google Colab, so good for small-scale experimentation and prototyping. For example, you can start with T4s on Colab, and run the same code in prod on L4s or A10s.</li></ul></li></ul> <h2 id="choosing-the-right-gpu">Choosing the right GPU</h2> <p>When selecting a GPU for your machine learning, first gather the following information:</p> <ol><li><strong>Task Type</strong>: Are you training, fine-tuning, or running inference?</li> <li><strong>Model Size</strong>: How many parameters does your model have?</li> <li><strong>Memory Requirements</strong>: How much VRAM does your model need?</li> <li><strong>Budget</strong>: What’s your cost constraint per hour of computation?</li> <li><strong>Performance Needs</strong>: Do you require the absolute fastest processing times?</li></ol> <p>Then follow this procedure to decide which GPU is the best fit:</p> <ol><li><p>Calculate the amount of memory that you need, depending on your use case and model size. Remember to take into account whether you are quantizing the models and/or using <!>. You can refer to our VRAM guides for more information on how to calculate the memory requirements:</p> <ul><li><!></li> <li><!></li></ul></li> <li><p>Check against the table above for the most cost-effective GPU that the model will fit on</p></li> <li><p>Start with the most cost-effective GPU to see whether the model runs/performs well and move to the more expensive ones if it doesn’t.</p></li></ol> <h2 id="advanced-considerations">Advanced considerations</h2> <ol><li><strong>Multi-GPU Setups</strong>: For some super large models (greater than 100B parameters, like Llama3-405B), you may need to allocate more than a single even top-tier GPU. Modal’s platform makes it easy to <!>.</li></ol> <h2 id="conclusion">Conclusion</h2> <p>At Modal, we offer flexible access to all these GPU types with a simple <code>gpu="A100"</code> or <code>gpu="H100"</code> flag in your code. This allows you to easily switch between GPUs based on your needs without worrying about hardware procurement or maintenance.</p> <p>Ready to supercharge your AI workloads with the right GPU? <!> today and experience the difference firsthand!</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=s(o),p=c(e(f));d(p,{href:`https://www.nvidia.com/en-us/data-center/products/a10-gpu/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`A10`))},$$slots:{default:!0}});var m=c(p,2);d(m,{href:`https://www.nvidia.com/en-us/data-center/a100/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`A100`))},$$slots:{default:!0}}),d(c(m,2),{href:`https://www.nvidia.com/en-us/data-center/h100/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`H100`))},$$slots:{default:!0}}),l(),n(f);var h=c(f,6);u(h,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var g=c(h,32),_=e(g),v=e(_);d(c(e(v)),{href:`/blog/lora-qlora`,children:(e,t)=>{l(),i(e,r(`techniques like LoRA or QLoRA`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2),b=e(y);d(e(b),{href:`/blog/how-much-vram-need-inference`,children:(e,t)=>{l(),i(e,r(`VRAM guide for inference`))},$$slots:{default:!0}}),n(b);var x=c(b,2);d(e(x),{href:`/blog/how-much-vram-need-fine-tuning`,children:(e,t)=>{l(),i(e,r(`VRAM guide for training/fine-tuning`))},$$slots:{default:!0}}),n(x),n(y),n(_),l(4),n(g);var S=c(g,4),C=e(S);d(c(e(C),2),{href:`/docs/guide/gpu#specifying-gpu-count`,children:(e,t)=>{l(),i(e,r(`scale up your GPU resources as needed`))},$$slots:{default:!0}}),l(),n(C),n(S);var w=c(S,6);d(c(e(w)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sign up for Modal`))},$$slots:{default:!0}}),l(),n(w),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=C915tIjQ.js.map
