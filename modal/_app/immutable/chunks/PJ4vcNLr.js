(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3adb7cd8-8aad-4c5f-a6f6-f36c37ae2568`,e._sentryDebugIdIdentifier=`sentry-dbid-3adb7cd8-8aad-4c5f-a6f6-f36c37ae2568`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Introducing: H100s on Modal`,description:`We’re excited to be making Nvidia H100 GPUs available on Modal starting today!`,date:`2024-02-06T12:00:00.000Z`,published:!0,length:`2 minute read`,category:`News`,layout:`blog`,toc:[],rawContent:`NVIDIA's H100 GPUs are the fastest machine learning accelerators on the market.
They have also been almost impossible to get a hold of.

But all Modal users can access them - starting now!

For the largest language models H100s boast up to 4x training speedups and up to
30x inference speedups compared to A100s, according to benchmarks by NVIDIA.

![A bar chart showing speedups on H100 GPUs](https://modal-cdn.com/cdnbot/h100-bar-chart.png)

<modal-img-caption>
  Source: <a target="_blank" rel="noreferrer" href="https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet">https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet</a>
</modal-img-caption>

Faster cards cost more to run, so we recommend exploring them on Modal where the
spend is justified. That could be a latency-sensitive application like
interactive LLM inference, where every millisecond counts, or a throughput-bound
job like fine-tuning a foundation model, where the price-to-performance ratio
can result in a
[lower total cost](https://www.databricks.com/blog/coreweave-nvidia-h100-part-1)
in some cases.

Our H100s have 80 GB of on-chip DRAM connected by high-bandwidth memory to
compute units capable of nearly two thousand teraFLOPS at 16 bit precision.

And for $7.65 per hour per GPU, you can run jobs that use up to 8 GPUs that
communicate via NVIDIA NVLink connections with 3.6 TB/s of bisectional
bandwidth.

On Modal, you only pay for what you use. Thanks to our robust autoscaling, you
can achieve significantly higher utilization and thus lower overall costs
compared to fixed GPU reservations.

Whether you're responding to a burst of inference requests when your app hits
the top of HackerNews or launching one thousand ML experiments in parallel right
before the deadline, Modal is here to serve all your compute needs without
charging you after the job is done.

Getting started is simple: just set \`"H100"\` as the desired GPU type in the
Modal decorator of the function you want to run remotely.

\`\`\`python
import modal

app = modal.App()

@app.function(gpu="H100")
def run_gpt5():
    # This will run on Modal's H100s
\`\`\`

If you have questions on our H100 support or want to share something incredible
you built that uses H100s, please reach out in our
[community Slack](https://modal.com/slack).
`,meta:{description:`We’re excited to be making Nvidia H100 GPUs available on Modal starting today!`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>NVIDIA’s H100 GPUs are the fastest machine learning accelerators on the market.
They have also been almost impossible to get a hold of.</p> <p>But all Modal users can access them - starting now!</p> <p>For the largest language models H100s boast up to 4x training speedups and up to
30x inference speedups compared to A100s, according to benchmarks by NVIDIA.</p> <p><!></p> <modal-img-caption>Source: <a target="_blank" rel="noreferrer" href="https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet">https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet</a></modal-img-caption> <p>Faster cards cost more to run, so we recommend exploring them on Modal where the
spend is justified. That could be a latency-sensitive application like
interactive LLM inference, where every millisecond counts, or a throughput-bound
job like fine-tuning a foundation model, where the price-to-performance ratio
can result in a <!> in some cases.</p> <p>Our H100s have 80 GB of on-chip DRAM connected by high-bandwidth memory to
compute units capable of nearly two thousand teraFLOPS at 16 bit precision.</p> <p>And for $7.65 per hour per GPU, you can run jobs that use up to 8 GPUs that
communicate via NVIDIA NVLink connections with 3.6 TB/s of bisectional
bandwidth.</p> <p>On Modal, you only pay for what you use. Thanks to our robust autoscaling, you
can achieve significantly higher utilization and thus lower overall costs
compared to fixed GPU reservations.</p> <p>Whether you’re responding to a burst of inference requests when your app hits
the top of HackerNews or launching one thousand ML experiments in parallel right
before the deadline, Modal is here to serve all your compute needs without
charging you after the job is done.</p> <p>Getting started is simple: just set <code>"H100"</code> as the desired GPU type in the
Modal decorator of the function you want to run remotely.</p> <!> <p>If you have questions on our H100 support or want to share something incredible
you built that uses H100s, please reach out in our <!>.</p>`,3);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),6);u(e(p),{src:`https://modal-cdn.com/cdnbot/h100-bar-chart.png`,alt:`A bar chart showing speedups on H100 GPUs`}),n(p);var m=c(c(p,2),2);f(c(e(m)),{href:`https://www.databricks.com/blog/coreweave-nvidia-h100-part-1`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`lower total cost`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,12);d(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(gpu%3D%22H100%22)%0Adef%20run_gpt5()%3A%0A%20%20%20%20%23%20This%20will%20run%20on%20Modal's%20H100s`,lang:`python`});var g=c(h,2);f(c(e(g)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`community Slack`))},$$slots:{default:!0}}),l(),n(g),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=PJ4vcNLr.js.map
