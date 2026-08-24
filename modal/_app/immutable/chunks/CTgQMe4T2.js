(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`92255dee-9168-4068-a9fd-d22426b34203`,e._sentryDebugIdIdentifier=`sentry-dbid-92255dee-9168-4068-a9fd-d22426b34203`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How much does it cost to run NVIDIA L40S GPUs in 2025?`,description:`Learn about the cost of NVIDIA L40S GPUs and what to use them for, and explore top GPU-on-demand platforms for accessing this hardware.`,date:`2025-08-12T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`L40S specs & performance`,id:`l40s-specs--performance`},{depth:2,value:`NVIDIA L40S cloud pricing`,id:`nvidia-l40s-cloud-pricing`},{depth:2,value:`Choosing the right provider`,id:`choosing-the-right-provider`},{depth:2,value:`On-premise options: buy an L40S?`,id:`on-premise-options-buy-an-l40s`},{depth:2,value:`L40S vs. A100 vs. H100 vs. B200: which GPU for your workload?`,id:`l40s-vs-a100-vs-h100-vs-b200-which-gpu-for-your-workload`},{depth:2,value:`Does L40S support NVLink or MIG?`,id:`does-l40s-support-nvlink-or-mig`},{depth:2,value:`When is serverless cheaper than reserved instances on hyperscalers?`,id:`when-is-serverless-cheaper-than-reserved-instances-on-hyperscalers`},{depth:2,value:`Quick-start guide: run code on a cloud L40S in under 5 minutes`,id:`quick-start-guide-run-code-on-a-cloud-l40s-in-under-5-minutes`},{depth:2,value:`Get started with L40S today`,id:`get-started-with-l40s-today`}],rawContent:`The NVIDIA L40S is an ideal GPU for cost-effective AI inference and graphics workloads. With 48 GB of GDDR6 memory and Ada Lovelace architecture, it is comparable in price to A100s (40GB version) and can exceed A100 performance for compute-bound workloads.

## L40S specs & performance

The [NVIDIA L40S](https://www.nvidia.com/en-us/data-center/l40s/) strikes a balance between performance and affordability, making advanced AI accessible without breaking the budget.

- **Architecture:** Ada Lovelace with 18,176 CUDA cores
- **Memory:** 48 GB GDDR6 with ECC, more than A100 40GB
- **Bandwidth:** 864 GB/s memory bandwidth
- **Peak compute:** 1.47 PFLOPS FP8 tensor performance with sparsity
- **Special features:** 4th-gen Tensor Cores with FP8, 3rd-gen RT Cores for graphics

This configuration makes it ideal for serving 13B-70B parameter models, running diffusion models, and GPU-accelerated visualization tasks.

## NVIDIA L40S cloud pricing

Here's per-GPU pricing for L40S across major providers (August 2025):

| Provider & SKU                 | Serverless                  | Spot       | On-demand | Capacity block\\* | 1-yr reservation                                 | 3-yr reservation                                 | Pricing sources                                                      |
| ------------------------------ | --------------------------- | ---------- | --------- | ---------------- | ------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------- |
| **Modal**                      | $1.95/hr or $0.000542\xA0/ sec | n/a        | n/a       | n/a              | n/a                                              | n/a                                              | [Modal pricing](/pricing)                                            |
| **RunPod**                     | $1.90/hr                    | n/a        | $0.86/hr  | n/a              | n/a                                              | n/a                                              | [RunPod](https://www.runpod.io/gpu-models/l40s)                      |
| **AWS (G6e, 1×L40S)**          | n/a                         | $1.1027/hr | $1.861/hr | n/a              | ~$1.17/hr (No-upfront) / ~$1.09/hr (All-upfront) | ~$0.80/hr (No-upfront) / ~$0.70/hr (All-upfront) | [AWS Pricing](https://aws-pricing.com/g6e.xlarge.html) (us-east-1)   |
| **CoreWeave**                  | n/a                         | n/a        | $2.25/hr  | n/a              | $0.90+/hr                                        | $0.90+/hr                                        | [CoreWeave](https://www.coreweave.com/pricing)                       |
| **Civo**                       | n/a                         | n/a        | $1.29/hr  | n/a              | $0.89+/hr                                        | $0.89+/hr                                        | [Civo](https://www.civo.com/newsroom/nvidia-gpus-from-0-69-per-hour) |
| **Vultr**                      | n/a                         | n/a        | $1.67/hr  | n/a              | n/a                                              | $0.848+/hr                                       | [Vultr](https://www.vultr.com/pricing/#cloud-gpu)                    |
| **Oracle Cloud (OCI)**         | n/a                         | n/a        | $3.50/hr  | n/a              | n/a                                              | n/a                                              | [Oracle](https://www.oracle.com/cloud/price-list)                    |
| **Replicate (multi-GPU L40S)** | n/a                         | n/a        | $3.51/hr  | n/a              | n/a                                              | n/a                                              | [Replicate](https://replicate.com/pricing)                           |

\\* _Capacity blocks are AWS-specific_

GCP does not offer L40S GPUs at this time.

## Choosing the right provider

Different workload patterns call for different approaches:

| Scenario                                 | Best fit   | Rationale                                                                                    |
| ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| Bursty inference workloads               | **Modal**  | Per-second billing ($0.000542/s ≈ **$1.95/hr**) eliminates idle cost                         |
| Budget-conscious consumer experiments    | **RunPod** | Lowest **on-demand** L40S (~**$0.86/hr**); optional community capacity often ~$0.69–$0.79/hr |
| Static, predictable AI inference traffic | **AWS**    | 1–3 year commitments drop g6e (1×L40S) to **~$0.70–$0.80/hr**                                |

## On-premise options: buy an L40S?

For those considering ownership:

- **Single L40S PCIe card:** ~$7,500
- **Dell PowerEdge R760xa with 4x L40S:** ~$47,000-$49,000

At $7.5k per card, [breakeven](https://lenovopress.lenovo.com/lp2225-on-premise-vs-cloud-generative-ai-total-cost-of-ownership) against $1-2/hour cloud rates happens in under a year of heavy utilization. Factor in ~$0.20-0.30/hr for electricity and cooling, and your effective cost might be $0.80-0.90/hr, competitive with cloud rates if you maintain >50% utilization.

## L40S vs. A100 vs. H100 vs. B200: which GPU for your workload?

The L40S fills a unique niche in NVIDIA's lineup:

1. **L40S (48 GB GDDR6)** - Best for inference serving, small fine-tuning jobs (e.g. training an LLM LoRA), and graphics at $1-2/hr
2. **A100 (40/80 GB HBM2e)** – Previous-gen Ampere architecture; 80 GB suits larger models; widely available at ~$1–3/hr depending on provider
3. **H100 (80 GB HBM3)** - For cutting-edge training and serving larger models at ~$5/hr
4. **B200 (192 GB HBM3e)** - For the most compute-intensive AI training and inference workloads (e.g. running 300B+ parameter models) at ~$6-10/hr

The L40S has a great price-to-performance tradeoff for inference workloads, especially for "smaller" gen AI models like generative image models or sub-70B param LLMs.

Many organizations train on H100s, then deploy inference on L40S fleets for cost efficiency. Of course, if inference speed is paramount for your use case and you are not cost-sensitive, you may still want to evaluate more powerful GPUs for model serving.

## Does L40S support NVLink or MIG?

**Short answer:** No. The [L40S is PCIe-only](https://www.nvidia.com/en-us/data-center/l40s/) and doesn't support NVLink or MIG (Multi-Instance GPU).

This means:

- **Inter-GPU communication** happens over PCIe 4.0 x16 (~32 GB/s) instead of NVLink's multi-hundred GB/s
- **Data parallel training** works fine, but tensor/model parallel approaches hit PCIe bottlenecks quickly
- **No hardware partitioning** means you can't slice the GPU into guaranteed instances like with A100/H100s

As a result, L40S GPUs are suboptimal for multi-GPU training workloads. Consider A100s, H100s, and B200s instead if you need NVLink for large model parallelism. If you still need a multi-GPU L40S setup, prefer FSDP/ZeRO sharding strategies and ensure fast networking (100 GbE+) between nodes.

## When is serverless cheaper than reserved instances on hyperscalers?

The break-even point for serverless vs. reserved L40S instances depends on utilization:

**The math:** With Modal at $1.95/hr and AWS 3-year reserved at ~$0.80/hr, break-even utilization is:

- $0.80 / $1.95 ≈ **41%**

**Simple rule:** If your GPU sits idle >60% of the time, serverless is cheaper. If it's busy most of the day, locking in a reservation will be cheaper.

**Monthly cost examples (single GPU):**

- **25% utilized:** Serverless ~$351 vs. Reserved ~$540 → serverless wins
- **60% utilized:** Serverless ~$842 vs. Reserved ~$540 → reserved wins

Keep in mind, however, the inflexibility and capital commitment required for GPU reservations. Traditional cloud platforms also require you to configure and manage your own cloud infrastructure, so make sure to factor in devops cost and slower time-to-ship as well.

Additional considerations:

- Serverless providers can have your code running on L40S GPUs in less than a second, while with traditional cloud there's a long process to request quota and provision instances.
- Serverless auto-scales for traffic spikes; traditional cloud needs pre-provisioned headroom, which makes achieving high utitilization difficult.

## Quick-start guide: run code on a cloud L40S in under 5 minutes

Modal's serverless platform lets you run code on an L40S without managing any AI cloud infrastructure:

\`\`\`python
import modal

app = modal.App()

@app.function(gpu="L40S")
def run_inference():
    # This will run on an L40S on Modal

\`\`\`

At $0.000542/second, you can prototype for pennies, then scale to production without touching instance configuration.

## Get started with L40S today

The L40S represents the sweet spot for AI inference, offering enterprise-grade performance at accessible prices. If you're serving smaller LLMs, running image generation models, or building GPU-accelerated applications, the L40S delivers the best price-to-performance ratio in today's market.
`,meta:{description:`Learn about the cost of NVIDIA L40S GPUs and what to use them for, and explore top GPU-on-demand platforms for accessing this hardware.`}},{title:h,description:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=m,E=t(`<thead><tr><th>Provider & SKU</th><th>Serverless</th><th>Spot</th><th>On-demand</th><th>Capacity block*</th><th>1-yr reservation</th><th>3-yr reservation</th><th>Pricing sources</th></tr></thead> <tbody><tr><td><strong>Modal</strong></td><td>$1.95/hr or $0.000542\xA0/ sec</td><td>n/a</td><td>n/a</td><td>n/a</td><td>n/a</td><td>n/a</td><td><!></td></tr><tr><td><strong>RunPod</strong></td><td>$1.90/hr</td><td>n/a</td><td>$0.86/hr</td><td>n/a</td><td>n/a</td><td>n/a</td><td><!></td></tr><tr><td><strong>AWS (G6e, 1×L40S)</strong></td><td>n/a</td><td>$1.1027/hr</td><td>$1.861/hr</td><td>n/a</td><td>~$1.17/hr (No-upfront) / ~$1.09/hr (All-upfront)</td><td>~$0.80/hr (No-upfront) / ~$0.70/hr (All-upfront)</td><td><!> (us-east-1)</td></tr><tr><td><strong>CoreWeave</strong></td><td>n/a</td><td>n/a</td><td>$2.25/hr</td><td>n/a</td><td>$0.90+/hr</td><td>$0.90+/hr</td><td><!></td></tr><tr><td><strong>Civo</strong></td><td>n/a</td><td>n/a</td><td>$1.29/hr</td><td>n/a</td><td>$0.89+/hr</td><td>$0.89+/hr</td><td><!></td></tr><tr><td><strong>Vultr</strong></td><td>n/a</td><td>n/a</td><td>$1.67/hr</td><td>n/a</td><td>n/a</td><td>$0.848+/hr</td><td><!></td></tr><tr><td><strong>Oracle Cloud (OCI)</strong></td><td>n/a</td><td>n/a</td><td>$3.50/hr</td><td>n/a</td><td>n/a</td><td>n/a</td><td><!></td></tr><tr><td><strong>Replicate (multi-GPU L40S)</strong></td><td>n/a</td><td>n/a</td><td>$3.51/hr</td><td>n/a</td><td>n/a</td><td>n/a</td><td><!></td></tr></tbody>`,1),D=t(`<thead><tr><th>Scenario</th><th>Best fit</th><th>Rationale</th></tr></thead> <tbody><tr><td>Bursty inference workloads</td><td><strong>Modal</strong></td><td>Per-second billing ($0.000542/s ≈ <strong>$1.95/hr</strong>) eliminates idle cost</td></tr><tr><td>Budget-conscious consumer experiments</td><td><strong>RunPod</strong></td><td>Lowest <strong>on-demand</strong> L40S (~<strong>$0.86/hr</strong>); optional community capacity often ~$0.69–$0.79/hr</td></tr><tr><td>Static, predictable AI inference traffic</td><td><strong>AWS</strong></td><td>1–3 year commitments drop g6e (1×L40S) to <strong>~$0.70–$0.80/hr</strong></td></tr></tbody>`,1),O=t(`<p>The NVIDIA L40S is an ideal GPU for cost-effective AI inference and graphics workloads. With 48 GB of GDDR6 memory and Ada Lovelace architecture, it is comparable in price to A100s (40GB version) and can exceed A100 performance for compute-bound workloads.</p> <h2 id="l40s-specs--performance">L40S specs & performance</h2> <p>The <!> strikes a balance between performance and affordability, making advanced AI accessible without breaking the budget.</p> <ul><li><strong>Architecture:</strong> Ada Lovelace with 18,176 CUDA cores</li> <li><strong>Memory:</strong> 48 GB GDDR6 with ECC, more than A100 40GB</li> <li><strong>Bandwidth:</strong> 864 GB/s memory bandwidth</li> <li><strong>Peak compute:</strong> 1.47 PFLOPS FP8 tensor performance with sparsity</li> <li><strong>Special features:</strong> 4th-gen Tensor Cores with FP8, 3rd-gen RT Cores for graphics</li></ul> <p>This configuration makes it ideal for serving 13B-70B parameter models, running diffusion models, and GPU-accelerated visualization tasks.</p> <h2 id="nvidia-l40s-cloud-pricing">NVIDIA L40S cloud pricing</h2> <p>Here’s per-GPU pricing for L40S across major providers (August 2025):</p> <!> <p>* <em>Capacity blocks are AWS-specific</em></p> <p>GCP does not offer L40S GPUs at this time.</p> <h2 id="choosing-the-right-provider">Choosing the right provider</h2> <p>Different workload patterns call for different approaches:</p> <!> <h2 id="on-premise-options-buy-an-l40s">On-premise options: buy an L40S?</h2> <p>For those considering ownership:</p> <ul><li><strong>Single L40S PCIe card:</strong> ~$7,500</li> <li><strong>Dell PowerEdge R760xa with 4x L40S:</strong> ~$47,000-$49,000</li></ul> <p>At $7.5k per card, <!> against $1-2/hour cloud rates happens in under a year of heavy utilization. Factor in ~$0.20-0.30/hr for electricity and cooling, and your effective cost might be $0.80-0.90/hr, competitive with cloud rates if you maintain >50% utilization.</p> <h2 id="l40s-vs-a100-vs-h100-vs-b200-which-gpu-for-your-workload">L40S vs. A100 vs. H100 vs. B200: which GPU for your workload?</h2> <p>The L40S fills a unique niche in NVIDIA’s lineup:</p> <ol><li><strong>L40S (48 GB GDDR6)</strong> - Best for inference serving, small fine-tuning jobs (e.g. training an LLM LoRA), and graphics at $1-2/hr</li> <li><strong>A100 (40/80 GB HBM2e)</strong> – Previous-gen Ampere architecture; 80 GB suits larger models; widely available at ~$1–3/hr depending on provider</li> <li><strong>H100 (80 GB HBM3)</strong> - For cutting-edge training and serving larger models at ~$5/hr</li> <li><strong>B200 (192 GB HBM3e)</strong> - For the most compute-intensive AI training and inference workloads (e.g. running 300B+ parameter models) at ~$6-10/hr</li></ol> <p>The L40S has a great price-to-performance tradeoff for inference workloads, especially for “smaller” gen AI models like generative image models or sub-70B param LLMs.</p> <p>Many organizations train on H100s, then deploy inference on L40S fleets for cost efficiency. Of course, if inference speed is paramount for your use case and you are not cost-sensitive, you may still want to evaluate more powerful GPUs for model serving.</p> <h2 id="does-l40s-support-nvlink-or-mig">Does L40S support NVLink or MIG?</h2> <p><strong>Short answer:</strong> No. The <!> and doesn’t support NVLink or MIG (Multi-Instance GPU).</p> <p>This means:</p> <ul><li><strong>Inter-GPU communication</strong> happens over PCIe 4.0 x16 (~32 GB/s) instead of NVLink’s multi-hundred GB/s</li> <li><strong>Data parallel training</strong> works fine, but tensor/model parallel approaches hit PCIe bottlenecks quickly</li> <li><strong>No hardware partitioning</strong> means you can’t slice the GPU into guaranteed instances like with A100/H100s</li></ul> <p>As a result, L40S GPUs are suboptimal for multi-GPU training workloads. Consider A100s, H100s, and B200s instead if you need NVLink for large model parallelism. If you still need a multi-GPU L40S setup, prefer FSDP/ZeRO sharding strategies and ensure fast networking (100 GbE+) between nodes.</p> <h2 id="when-is-serverless-cheaper-than-reserved-instances-on-hyperscalers">When is serverless cheaper than reserved instances on hyperscalers?</h2> <p>The break-even point for serverless vs. reserved L40S instances depends on utilization:</p> <p><strong>The math:</strong> With Modal at $1.95/hr and AWS 3-year reserved at ~$0.80/hr, break-even utilization is:</p> <ul><li>$0.80 / $1.95 ≈ <strong>41%</strong></li></ul> <p><strong>Simple rule:</strong> If your GPU sits idle >60% of the time, serverless is cheaper. If it’s busy most of the day, locking in a reservation will be cheaper.</p> <p><strong>Monthly cost examples (single GPU):</strong></p> <ul><li><strong>25% utilized:</strong> Serverless ~$351 vs. Reserved ~$540 → serverless wins</li> <li><strong>60% utilized:</strong> Serverless ~$842 vs. Reserved ~$540 → reserved wins</li></ul> <p>Keep in mind, however, the inflexibility and capital commitment required for GPU reservations. Traditional cloud platforms also require you to configure and manage your own cloud infrastructure, so make sure to factor in devops cost and slower time-to-ship as well.</p> <p>Additional considerations:</p> <ul><li>Serverless providers can have your code running on L40S GPUs in less than a second, while with traditional cloud there’s a long process to request quota and provision instances.</li> <li>Serverless auto-scales for traffic spikes; traditional cloud needs pre-provisioned headroom, which makes achieving high utitilization difficult.</li></ul> <h2 id="quick-start-guide-run-code-on-a-cloud-l40s-in-under-5-minutes">Quick-start guide: run code on a cloud L40S in under 5 minutes</h2> <p>Modal’s serverless platform lets you run code on an L40S without managing any AI cloud infrastructure:</p> <!> <p>At $0.000542/second, you can prototype for pennies, then scale to production without touching instance configuration.</p> <h2 id="get-started-with-l40s-today">Get started with L40S today</h2> <p>The L40S represents the sweet spot for AI inference, offering enterprise-grade performance at accessible prices. If you’re serving smaller LLMs, running image generation models, or building GPU-accelerated applications, the L40S delivers the best price-to-performance ratio in today’s market.</p>`,1);function k(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=O(),p=c(s(o),4);f(c(e(p)),{href:`https://www.nvidia.com/en-us/data-center/l40s/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA L40S`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,10);u(m,{children:(t,a)=>{var o=E(),u=c(s(o),2),d=e(u),p=c(e(d),7);f(e(p),{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`Modal pricing`))},$$slots:{default:!0}}),n(p),n(d);var m=c(d),h=c(e(m),7);f(e(h),{href:`https://www.runpod.io/gpu-models/l40s`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod`))},$$slots:{default:!0}}),n(h),n(m);var g=c(m),_=c(e(g),7);f(e(_),{href:`https://aws-pricing.com/g6e.xlarge.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS Pricing`))},$$slots:{default:!0}}),l(),n(_),n(g);var v=c(g),y=c(e(v),7);f(e(y),{href:`https://www.coreweave.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CoreWeave`))},$$slots:{default:!0}}),n(y),n(v);var b=c(v),x=c(e(b),7);f(e(x),{href:`https://www.civo.com/newsroom/nvidia-gpus-from-0-69-per-hour`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Civo`))},$$slots:{default:!0}}),n(x),n(b);var S=c(b),C=c(e(S),7);f(e(C),{href:`https://www.vultr.com/pricing/#cloud-gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Vultr`))},$$slots:{default:!0}}),n(C),n(S);var w=c(S),T=c(e(w),7);f(e(T),{href:`https://www.oracle.com/cloud/price-list`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Oracle`))},$$slots:{default:!0}}),n(T),n(w);var D=c(w),O=c(e(D),7);f(e(O),{href:`https://replicate.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Replicate`))},$$slots:{default:!0}}),n(O),n(D),n(u),i(t,o)},$$slots:{default:!0}});var h=c(m,10);u(h,{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}});var g=c(h,8);f(c(e(g)),{href:`https://lenovopress.lenovo.com/lp2225-on-premise-vs-cloud-generative-ai-total-cost-of-ownership`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`breakeven`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,14);f(c(e(_),2),{href:`https://www.nvidia.com/en-us/data-center/l40s/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`L40S is PCIe-only`))},$$slots:{default:!0}}),l(),n(_),d(c(_,32),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(gpu%3D%22L40S%22)%0Adef%20run_inference()%3A%0A%20%20%20%20%23%20This%20will%20run%20on%20an%20L40S%20on%20Modal%0A`,lang:`python`}),l(6),i(t,o)},$$slots:{default:!0}}))}export{k as default,m as metadata};
//# sourceMappingURL=CTgQMe4T2.js.map
