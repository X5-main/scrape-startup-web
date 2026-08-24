(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`70b8a8f2-0a9d-438c-895b-2f5b64a81879`,e._sentryDebugIdIdentifier=`sentry-dbid-70b8a8f2-0a9d-438c-895b-2f5b64a81879`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`How much is an Nvidia H200?`,description:`Learn about the cost of Nvidia H200 GPUs, how they compare to H100s, and explore top GPU-on-demand platforms for accessing this cutting-edge hardware.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-03-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`How is the H200 different from the H100?`,id:`how-is-the-h200-different-from-the-h100`},{depth:2,value:`Recommended Hardware for Modern AI Models`,id:`recommended-hardware-for-modern-ai-models`},{depth:2,value:`Direct Purchase Price`,id:`direct-purchase-price`},{depth:2,value:`Alternatives to Direct Purchase: GPU-on-demand Platforms`,id:`alternatives-to-direct-purchase-gpu-on-demand-platforms`},{depth:2,value:`H100 vs. H200`,id:`h100-vs-h200`}],rawContent:`The [Nvidia H200](https://www.nvidia.com/en-us/data-center/h200/), which began delivery in late 2024, is Nvidia's latest and most
powerful GPU for AI workloads, featuring significantly more memory than its
predecessor, the [H100](https://www.nvidia.com/en-us/data-center/h100/). It's particularly well-suited for running the latest
large language models like DeepSeek.

## How is the H200 different from the H100?

The key differentiator of the H200 is its massive 141GB of memory, which is nearly double the capacity of the H100.

The H200 also offers:

- Higher memory bandwidth (4.8 TB/s vs 3.35 TB/s on H100)
- Up to 1.6 times higher inference performance for LLMs like GPT-3 and Llama-70B in specific scenarios

This additional VRAM and bandwidth makes the H200 particularly well-suited for:

1. Running larger (100+B parameter) AI models that won't fit in H100 memory
2. Handling longer context windows in LLMs
3. Processing larger batch sizes for improved throughput

## Recommended Hardware for Modern AI Models

The H200's expanded memory capacity makes it the ideal choice for running the latest generation of large language models. For example:

- **DeepSeek Models**: You can run the full DeepSeek-R1 671B model on 8xH200s.
  You can run distilled versions of the model on a single H200.
- **Multi-Modal Models**: Models that process both text and images require significant VRAM, making the H200 particularly valuable
- **Fine-tuning**: The additional memory allows for fine-tuning larger models or
  using larger batch sizes.

## Direct Purchase Price

The H200 GPU costs [~$30,000](https://viperatech.com/shop/nvidia-h200-nvl-graphic-card-141-gb-passive-pcie-900-21010-0040-000/) per chip if you are purchasing it directly from a hardware vendor.

However, it's important to note that organizations typically aren't buying just a single chip; they may be investing in configurations like a [Nvidia DGX H200 supercomputer](https://www.nvidia.com/en-us/data-center/dgx-h200/) with 8 H200s for ~$300k.

## Alternatives to Direct Purchase: GPU-on-demand Platforms

Given the substantial cost and limited availability of H200 GPUs, most
organizations will probably access H200 GPUs via cloud service providers and AI
infrastructure companies.

Cloud service providers with partnerships with Nvidia include:

- [Amazon Web Services
  (AWS)](https://aws.amazon.com/blogs/aws/new-amazon-ec2-p5en-instances-with-nvidia-h200-tensor-core-gpus-and-efav3-networking/)
  - P5en instances with 8xH200s cost $84.8/hr
- [Google Cloud](https://cloud.google.com/compute/docs/gpus#h200-gpus)
  - A3 Ultra VMs are available through [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine/docs/how-to/gpus)
- [Microsoft
  Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-h200-v5-series?tabs=sizebasic)
  - ND v5 H200 series VM
- [Oracle Cloud
  Infrastructure](https://blogs.oracle.com/cloud-infrastructure/post/now-ga-largest-ai-supercomputer-oci-nvidia-h200)

The cost of an H200 GPU across the major cloud providers is roughly $10/GPU/hour.

There's also a newer generation of GPU-on-demand platforms that are just
beginning to offer (often limited) H200 access, including [Modal](https://modal.com/), [RunPod](https://runpod.io/), [CoreWeave](https://coreweave.com/), and [Lambda Labs](https://lambdalabs.com/).

## H100 vs. H200

Given that availability of H200s is still fairly limited,
and they are generally priced at a premium (they cost ~$10/GPU/hour, compared
to ~$5/GPU/hour for [H100s](/blog/nvidia-h100-price-article)), are they worth it?

The answer is that if you are training or running inference on larger models (>
70B parameters), then the H200 probably makes sense.

For example, running Llama-70B on a single H200 at 8-bit precision is 1.9x more performant than the
H100.

On the other hand, for most inference workloads, there will
be little to no performance gain over H100s.

H100s are at this point widely available, and are still a great, cost-effective
choice for most inference and fine-tuning workloads. Try [Modal](https://modal.com/signup) to get started
with them today!
`,meta:{description:`Learn about the cost of Nvidia H200 GPUs, how they compare to H100s, and explore top GPU-on-demand platforms for accessing this cutting-edge hardware.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<p>The <!>, which began delivery in late 2024, is Nvidia’s latest and most
powerful GPU for AI workloads, featuring significantly more memory than its
predecessor, the <!>. It’s particularly well-suited for running the latest
large language models like DeepSeek.</p> <h2 id="how-is-the-h200-different-from-the-h100">How is the H200 different from the H100?</h2> <p>The key differentiator of the H200 is its massive 141GB of memory, which is nearly double the capacity of the H100.</p> <p>The H200 also offers:</p> <ul><li>Higher memory bandwidth (4.8 TB/s vs 3.35 TB/s on H100)</li> <li>Up to 1.6 times higher inference performance for LLMs like GPT-3 and Llama-70B in specific scenarios</li></ul> <p>This additional VRAM and bandwidth makes the H200 particularly well-suited for:</p> <ol><li>Running larger (100+B parameter) AI models that won’t fit in H100 memory</li> <li>Handling longer context windows in LLMs</li> <li>Processing larger batch sizes for improved throughput</li></ol> <h2 id="recommended-hardware-for-modern-ai-models">Recommended Hardware for Modern AI Models</h2> <p>The H200’s expanded memory capacity makes it the ideal choice for running the latest generation of large language models. For example:</p> <ul><li><strong>DeepSeek Models</strong>: You can run the full DeepSeek-R1 671B model on 8xH200s.
You can run distilled versions of the model on a single H200.</li> <li><strong>Multi-Modal Models</strong>: Models that process both text and images require significant VRAM, making the H200 particularly valuable</li> <li><strong>Fine-tuning</strong>: The additional memory allows for fine-tuning larger models or
using larger batch sizes.</li></ul> <h2 id="direct-purchase-price">Direct Purchase Price</h2> <p>The H200 GPU costs <!> per chip if you are purchasing it directly from a hardware vendor.</p> <p>However, it’s important to note that organizations typically aren’t buying just a single chip; they may be investing in configurations like a <!> with 8 H200s for ~$300k.</p> <h2 id="alternatives-to-direct-purchase-gpu-on-demand-platforms">Alternatives to Direct Purchase: GPU-on-demand Platforms</h2> <p>Given the substantial cost and limited availability of H200 GPUs, most
organizations will probably access H200 GPUs via cloud service providers and AI
infrastructure companies.</p> <p>Cloud service providers with partnerships with Nvidia include:</p> <ul><li><!> <ul><li>P5en instances with 8xH200s cost $84.8/hr</li></ul></li> <li><!> <ul><li>A3 Ultra VMs are available through <!></li></ul></li> <li><!> <ul><li>ND v5 H200 series VM</li></ul></li> <li><!></li></ul> <p>The cost of an H200 GPU across the major cloud providers is roughly $10/GPU/hour.</p> <p>There’s also a newer generation of GPU-on-demand platforms that are just
beginning to offer (often limited) H200 access, including <!>, <!>, <!>, and <!>.</p> <h2 id="h100-vs-h200">H100 vs. H200</h2> <p>Given that availability of H200s is still fairly limited,
and they are generally priced at a premium (they cost ~$10/GPU/hour, compared
to ~$5/GPU/hour for <!>), are they worth it?</p> <p>The answer is that if you are training or running inference on larger models (>
70B parameters), then the H200 probably makes sense.</p> <p>For example, running Llama-70B on a single H200 at 8-bit precision is 1.9x more performant than the
H100.</p> <p>On the other hand, for most inference workloads, there will
be little to no performance gain over H100s.</p> <p>H100s are at this point widely available, and are still a great, cost-effective
choice for most inference and fine-tuning workloads. Try <!> to get started
with them today!</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=s(o),f=c(e(d));u(f,{href:`https://www.nvidia.com/en-us/data-center/h200/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Nvidia H200`))},$$slots:{default:!0}}),u(c(f,2),{href:`https://www.nvidia.com/en-us/data-center/h100/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`H100`))},$$slots:{default:!0}}),l(),n(d);var p=c(d,22);u(c(e(p)),{href:`https://viperatech.com/shop/nvidia-h200-nvl-graphic-card-141-gb-passive-pcie-900-21010-0040-000/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`~$30,000`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,2);u(c(e(m)),{href:`https://www.nvidia.com/en-us/data-center/dgx-h200/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Nvidia DGX H200 supercomputer`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,8),g=e(h);u(e(g),{href:`https://aws.amazon.com/blogs/aws/new-amazon-ec2-p5en-instances-with-nvidia-h200-tensor-core-gpus-and-efav3-networking/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Amazon Web Services
(AWS)`))},$$slots:{default:!0}}),l(2),n(g);var _=c(g,2),v=e(_);u(v,{href:`https://cloud.google.com/compute/docs/gpus#h200-gpus`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Google Cloud`))},$$slots:{default:!0}});var y=c(v,2),b=e(y);u(c(e(b)),{href:`https://cloud.google.com/kubernetes-engine/docs/how-to/gpus`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Google Kubernetes Engine (GKE)`))},$$slots:{default:!0}}),n(b),n(y),n(_);var x=c(_,2);u(e(x),{href:`https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-h200-v5-series?tabs=sizebasic`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Microsoft
Azure`))},$$slots:{default:!0}}),l(2),n(x);var S=c(x,2);u(e(S),{href:`https://blogs.oracle.com/cloud-infrastructure/post/now-ga-largest-ai-supercomputer-oci-nvidia-h200`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Oracle Cloud
Infrastructure`))},$$slots:{default:!0}}),n(S),n(h);var C=c(h,4),w=c(e(C));u(w,{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}});var E=c(w,2);u(E,{href:`https://runpod.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod`))},$$slots:{default:!0}});var D=c(E,2);u(D,{href:`https://coreweave.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CoreWeave`))},$$slots:{default:!0}}),u(c(D,2),{href:`https://lambdalabs.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lambda Labs`))},$$slots:{default:!0}}),l(),n(C);var O=c(C,4);u(c(e(O)),{href:`/blog/nvidia-h100-price-article`,children:(e,t)=>{l(),i(e,r(`H100s`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,8);u(c(e(k)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(k),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=QXY6Wz8y2.js.map
