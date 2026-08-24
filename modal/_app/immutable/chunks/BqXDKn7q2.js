(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f3a5d998-212e-4734-a6cf-5b43ae369bd6`,e._sentryDebugIdIdentifier=`sentry-dbid-f3a5d998-212e-4734-a6cf-5b43ae369bd6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`5 Best GPUs for Machine Learning in 2025: A Complete Guide`,description:`Compare the top GPUs for machine learning workloads, from traditional ML to large language models`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-03-18T12:00:00.000Z`,length:`10 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Understanding GPU Requirements for ML`,id:`understanding-gpu-requirements-for-ml`,children:[{depth:3,value:`Memory (VRAM) Requirements`,id:`memory-vram-requirements`}]},{depth:2,value:`Beyond VRAM: Other Critical GPU Characteristics`,id:`beyond-vram-other-critical-gpu-characteristics`,children:[{depth:3,value:`Memory Bandwidth`,id:`memory-bandwidth`},{depth:3,value:`GPU Interconnect`,id:`gpu-interconnect`},{depth:3,value:`Compute Architecture`,id:`compute-architecture`}]},{depth:2,value:`Matching GPUs to ML Tasks`,id:`matching-gpus-to-ml-tasks`,children:[{depth:3,value:`Image and Video Processing`,id:`image-and-video-processing`},{depth:3,value:`Traditional ML`,id:`traditional-ml`},{depth:3,value:`Language Models`,id:`language-models`}]},{depth:2,value:`Top 5 GPUs for Machine Learning`,id:`top-5-gpus-for-machine-learning`,children:[{depth:3,value:`1. NVIDIA L40S`,id:`1-nvidia-l40s`},{depth:3,value:`2. NVIDIA A100 40GB`,id:`2-nvidia-a100-40gb`},{depth:3,value:`3. NVIDIA H100`,id:`3-nvidia-h100`},{depth:3,value:`4. NVIDIA A100 80GB`,id:`4-nvidia-a100-80gb`},{depth:3,value:`5. NVIDIA H200`,id:`5-nvidia-h200`}]},{depth:2,value:`Performance Comparison`,id:`performance-comparison`},{depth:2,value:`Accessing GPU Computing`,id:`accessing-gpu-computing`,children:[{depth:3,value:`Why Choose Modal for GPU Computing?`,id:`why-choose-modal-for-gpu-computing`},{depth:3,value:`Example: Running ML on Modal`,id:`example-running-ml-on-modal`}]},{depth:2,value:`Additional Resources`,id:`additional-resources`}],rawContent:`Graphics Processing Units (GPUs) have become essential for modern machine
learning workloads. Their parallel processing capabilities make them ideal for
heavy numerical calculations common in both traditional ML and large language
models (LLMs). For a deeper understanding of GPU architecture, terminology, and
utilization,
check out our comprehensive [GPU Glossary](/gpu-glossary)
and [GPU utilization guide](/blog/gpu-utilization-guide).

## Understanding GPU Requirements for ML

### Memory (VRAM) Requirements

- **Large Language Models**: 40GB+ for models like Llama 70B
- **Image Generation**: 16GB+ for models like SDXL
- **Traditional ML**: Often 8-16GB is sufficient
- **Data Processing**: Sometimes GPU memory isn't the bottleneck

## Beyond VRAM: Other Critical GPU Characteristics

While VRAM capacity often gets the most attention, several other GPU characteristics can significantly impact machine learning performance:

### Memory Bandwidth

Memory bandwidth determines how quickly data can move between VRAM and the GPU's compute units. For example:

- [H200's HBM3e](https://www.nvidia.com/en-us/data-center/h200/) memory provides 4.8 TB/s bandwidth
- [A100's HBM2e](https://www.nvidia.com/en-us/data-center/a100/) offers 2 TB/s
- [L40S's GDDR6](https://www.nvidia.com/en-us/data-center/l40s/) delivers 864 GB/s

Memory bandwidth becomes a bottleneck in several scenarios:

1. **Large model inference**: When running models that barely fit in VRAM:
   - Weight loading becomes more frequent
   - Memory swapping may occur
   - Cache misses increase

2. **Multi-GPU training**: When scaling across multiple GPUs:
   - Weight updates require frequent memory access
   - Gradient communication needs high bandwidth
   - Data loading can become memory-bound

This can be a bottleneck for multi-GPU workloads (e.g. training large models).

### GPU Interconnect

Multi-GPU workloads depend heavily on inter-GPU communication:

- [NVLink](https://www.nvidia.com/en-us/data-center/nvlink/) provides high-bandwidth GPU-to-GPU connections
- [NVSwitch](https://www.nvidia.com/en-us/data-center/nvlink/) enables all-to-all GPU communication
- [PCIe](https://pcisig.com/specifications) connections offer lower bandwidth but more flexibility

For instance, when running large models like [Llama 3 405B](/blog/how_to_run_llama_405b_article) across multiple GPUs, the interconnect speed can become the primary bottleneck.

### Compute Architecture

Different GPU generations offer varying features:

- [Tensor Cores](https://www.nvidia.com/en-us/data-center/tensor-cores/): Specialized for matrix multiplication
- [Ray Tracing (RT) Cores](https://developer.nvidia.com/rtx/ray-tracing?sortBy=developer_learning_library%2Fsort%2Ftitle%3Aasc): Accelerate ray tracing operations
- [Clock speeds](https://www.nvidia.com/en-us/data-center/technologies/): Affect raw computing power
- [Cache hierarchy](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#memory-hierarchy): Impact data access speeds

As discussed in our [GPU utilization guide](/blog/gpu-utilization-guide), maximizing GPU performance requires understanding and optimizing for all these characteristics, not just VRAM capacity.

## Matching GPUs to ML Tasks

### Image and Video Processing

- **Image Generation**: [H100](/blog/nvidia-h100-price-article) or
  [A100](/blog/nvidia-a100-price-article) recommended
- **Video Processing**: L40S or H100
- **OCR/Computer Vision**: L40S sufficient

### Traditional ML

- **Training**: A100 or L40S
- **Inference**: L40S often sufficient
- **Data Processing**: Consider CPU for some tasks

### Language Models

- **Large Models (70B+)**: H100 or H200
- **Medium Models (7-70B)**: A100 80GB
- **Small Models (less than 7B)**: A100 40GB or L40S

## Top 5 GPUs for Machine Learning

### 1. NVIDIA L40S

Best value for many ML tasks, with excellent availability.

- **VRAM**: 48GB GDDR6
- **Performance**: Strong for traditional ML
- **Best For**: Computer vision, smaller LLMs
- **Availability**: Excellent
- **Cost**: Lower than A100
- **ROI**: Best for most common ML tasks

### 2. NVIDIA A100 40GB

Balanced option for medium-scale workloads.

- **VRAM**: 40GB HBM2e
- **Performance**: Similar to L40S
- **Best For**: Medium-sized models
- **Availability**: Very good
- **Cost**: Similar to L40S
- **ROI**: Good for specific workloads

### 3. NVIDIA H100

The current industry standard for high-end ML.

- **VRAM**: 80GB HBM3
- **Performance**: Excellent for all ML tasks
- **Best For**: Model training, inference for larger models
- **Availability**: Generally available
- **Cost**: High but justified for heavy usage
- **ROI**: Good for large-scale training, production workloads

### 4. NVIDIA A100 80GB

Proven workhorse for ML workloads.

- **VRAM**: 80GB HBM2e
- **Performance**: Strong for most tasks
- **Best For**: Large model inference
- **Availability**: Widely available
- **Cost**: Lower than H100
- **ROI**: Excellent for most use cases

### 5. NVIDIA H200

The newest and most powerful GPU, but limited availability.

- **VRAM**: 141GB HBM3e
- **Performance**: 1.9x faster than H100
- **Best For**: Largest models, cutting-edge research
- **Availability**: Limited, not widely accessible
- **Cost**: Premium pricing
- **ROI**: Best for specific high-end needs

## Performance Comparison

| GPU       | VRAM (GB) | Relative Performance | Cost Efficiency | Availability |
| --------- | --------- | -------------------- | --------------- | ------------ |
| L40S      | 48        | ⭐⭐⭐               | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐   |
| A100 40GB | 40        | ⭐⭐⭐               | ⭐⭐⭐          | ⭐⭐⭐⭐     |
| H100      | 80        | ⭐⭐⭐⭐             | ⭐⭐⭐          | ⭐⭐⭐       |
| A100 80GB | 80        | ⭐⭐⭐               | ⭐⭐⭐⭐        | ⭐⭐⭐⭐     |
| H200      | 141       | ⭐⭐⭐⭐⭐           | ⭐⭐            | ⭐           |

## Accessing GPU Computing

While you can purchase these GPUs directly, most organizations are better served by cloud GPU providers. Options include:

1. **Major Cloud Providers**:
   - [AWS](https://aws.amazon.com/ec2/instance-types/p4/)
   - [Google Cloud](https://cloud.google.com/compute/gpus-pricing)

2. **Specialized GPU Providers**:
   - [Modal](https://modal.com)
   - [RunPod](https://runpod.io)
   - [Lambda Labs](https://lambdalabs.com)

### Why Choose Modal for GPU Computing?

[Modal](https://modal.com) offers several advantages for ML workloads:

1. **Instant Access**: No waiting for GPU availability
2. **Automatic Scaling**: Pay only for what you use
3. **Simple Deployment**: Python-native interface
4. **Cost Effective**: No long-term commitments

### Example: Running ML on Modal

\`\`\`python notest
import modal

app = modal.App("ml-workload")

@app.function(gpu="A100")
def train_model():
    # Your ML code here
    pass
\`\`\`

Ready to start running ML workloads on powerful GPUs? [Try Modal free](https://modal.com/signup) or check out our [documentation](/docs/guide/gpu) for more examples.

## Additional Resources

- [Modal's GPU Glossary](/blog/open-source-gpu-glossary) - Comprehensive guide to GPU terminology
- [GPU Utilization Guide](/blog/gpu-utilization-guide) - Deep dive into maximizing GPU performance
- [Cold Start Guide](/docs/guide/cold-start) - Tips for reducing model startup times
- [H100 vs. A100](/blog/gpu-types) - Comparing H100 and A100 GPUs
- [Future of AI Infrastructure](/blog/the-future-of-ai-needs-more-flexible-gpu-capacity) - Trends in GPU computing
`,meta:{description:`Compare the top GPUs for machine learning workloads, from traditional ML to large language models`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<thead><tr><th>GPU</th><th>VRAM (GB)</th><th>Relative Performance</th><th>Cost Efficiency</th><th>Availability</th></tr></thead> <tbody><tr><td>L40S</td><td>48</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>A100 40GB</td><td>40</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td></tr><tr><td>H100</td><td>80</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td></tr><tr><td>A100 80GB</td><td>80</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td></tr><tr><td>H200</td><td>141</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐</td><td>⭐</td></tr></tbody>`,1),E=t(`<p>Graphics Processing Units (GPUs) have become essential for modern machine
learning workloads. Their parallel processing capabilities make them ideal for
heavy numerical calculations common in both traditional ML and large language
models (LLMs). For a deeper understanding of GPU architecture, terminology, and
utilization,
check out our comprehensive <!> and <!>.</p> <h2 id="understanding-gpu-requirements-for-ml">Understanding GPU Requirements for ML</h2> <h3 id="memory-vram-requirements">Memory (VRAM) Requirements</h3> <ul><li><strong>Large Language Models</strong>: 40GB+ for models like Llama 70B</li> <li><strong>Image Generation</strong>: 16GB+ for models like SDXL</li> <li><strong>Traditional ML</strong>: Often 8-16GB is sufficient</li> <li><strong>Data Processing</strong>: Sometimes GPU memory isn’t the bottleneck</li></ul> <h2 id="beyond-vram-other-critical-gpu-characteristics">Beyond VRAM: Other Critical GPU Characteristics</h2> <p>While VRAM capacity often gets the most attention, several other GPU characteristics can significantly impact machine learning performance:</p> <h3 id="memory-bandwidth">Memory Bandwidth</h3> <p>Memory bandwidth determines how quickly data can move between VRAM and the GPU’s compute units. For example:</p> <ul><li><!> memory provides 4.8 TB/s bandwidth</li> <li><!> offers 2 TB/s</li> <li><!> delivers 864 GB/s</li></ul> <p>Memory bandwidth becomes a bottleneck in several scenarios:</p> <ol><li><p><strong>Large model inference</strong>: When running models that barely fit in VRAM:</p> <ul><li>Weight loading becomes more frequent</li> <li>Memory swapping may occur</li> <li>Cache misses increase</li></ul></li> <li><p><strong>Multi-GPU training</strong>: When scaling across multiple GPUs:</p> <ul><li>Weight updates require frequent memory access</li> <li>Gradient communication needs high bandwidth</li> <li>Data loading can become memory-bound</li></ul></li></ol> <p>This can be a bottleneck for multi-GPU workloads (e.g. training large models).</p> <h3 id="gpu-interconnect">GPU Interconnect</h3> <p>Multi-GPU workloads depend heavily on inter-GPU communication:</p> <ul><li><!> provides high-bandwidth GPU-to-GPU connections</li> <li><!> enables all-to-all GPU communication</li> <li><!> connections offer lower bandwidth but more flexibility</li></ul> <p>For instance, when running large models like <!> across multiple GPUs, the interconnect speed can become the primary bottleneck.</p> <h3 id="compute-architecture">Compute Architecture</h3> <p>Different GPU generations offer varying features:</p> <ul><li><!>: Specialized for matrix multiplication</li> <li><!>: Accelerate ray tracing operations</li> <li><!>: Affect raw computing power</li> <li><!>: Impact data access speeds</li></ul> <p>As discussed in our <!>, maximizing GPU performance requires understanding and optimizing for all these characteristics, not just VRAM capacity.</p> <h2 id="matching-gpus-to-ml-tasks">Matching GPUs to ML Tasks</h2> <h3 id="image-and-video-processing">Image and Video Processing</h3> <ul><li><strong>Image Generation</strong>: <!> or <!> recommended</li> <li><strong>Video Processing</strong>: L40S or H100</li> <li><strong>OCR/Computer Vision</strong>: L40S sufficient</li></ul> <h3 id="traditional-ml">Traditional ML</h3> <ul><li><strong>Training</strong>: A100 or L40S</li> <li><strong>Inference</strong>: L40S often sufficient</li> <li><strong>Data Processing</strong>: Consider CPU for some tasks</li></ul> <h3 id="language-models">Language Models</h3> <ul><li><strong>Large Models (70B+)</strong>: H100 or H200</li> <li><strong>Medium Models (7-70B)</strong>: A100 80GB</li> <li><strong>Small Models (less than 7B)</strong>: A100 40GB or L40S</li></ul> <h2 id="top-5-gpus-for-machine-learning">Top 5 GPUs for Machine Learning</h2> <h3 id="1-nvidia-l40s">1. NVIDIA L40S</h3> <p>Best value for many ML tasks, with excellent availability.</p> <ul><li><strong>VRAM</strong>: 48GB GDDR6</li> <li><strong>Performance</strong>: Strong for traditional ML</li> <li><strong>Best For</strong>: Computer vision, smaller LLMs</li> <li><strong>Availability</strong>: Excellent</li> <li><strong>Cost</strong>: Lower than A100</li> <li><strong>ROI</strong>: Best for most common ML tasks</li></ul> <h3 id="2-nvidia-a100-40gb">2. NVIDIA A100 40GB</h3> <p>Balanced option for medium-scale workloads.</p> <ul><li><strong>VRAM</strong>: 40GB HBM2e</li> <li><strong>Performance</strong>: Similar to L40S</li> <li><strong>Best For</strong>: Medium-sized models</li> <li><strong>Availability</strong>: Very good</li> <li><strong>Cost</strong>: Similar to L40S</li> <li><strong>ROI</strong>: Good for specific workloads</li></ul> <h3 id="3-nvidia-h100">3. NVIDIA H100</h3> <p>The current industry standard for high-end ML.</p> <ul><li><strong>VRAM</strong>: 80GB HBM3</li> <li><strong>Performance</strong>: Excellent for all ML tasks</li> <li><strong>Best For</strong>: Model training, inference for larger models</li> <li><strong>Availability</strong>: Generally available</li> <li><strong>Cost</strong>: High but justified for heavy usage</li> <li><strong>ROI</strong>: Good for large-scale training, production workloads</li></ul> <h3 id="4-nvidia-a100-80gb">4. NVIDIA A100 80GB</h3> <p>Proven workhorse for ML workloads.</p> <ul><li><strong>VRAM</strong>: 80GB HBM2e</li> <li><strong>Performance</strong>: Strong for most tasks</li> <li><strong>Best For</strong>: Large model inference</li> <li><strong>Availability</strong>: Widely available</li> <li><strong>Cost</strong>: Lower than H100</li> <li><strong>ROI</strong>: Excellent for most use cases</li></ul> <h3 id="5-nvidia-h200">5. NVIDIA H200</h3> <p>The newest and most powerful GPU, but limited availability.</p> <ul><li><strong>VRAM</strong>: 141GB HBM3e</li> <li><strong>Performance</strong>: 1.9x faster than H100</li> <li><strong>Best For</strong>: Largest models, cutting-edge research</li> <li><strong>Availability</strong>: Limited, not widely accessible</li> <li><strong>Cost</strong>: Premium pricing</li> <li><strong>ROI</strong>: Best for specific high-end needs</li></ul> <h2 id="performance-comparison">Performance Comparison</h2> <!> <h2 id="accessing-gpu-computing">Accessing GPU Computing</h2> <p>While you can purchase these GPUs directly, most organizations are better served by cloud GPU providers. Options include:</p> <ol><li><p><strong>Major Cloud Providers</strong>:</p> <ul><li><!></li> <li><!></li></ul></li> <li><p><strong>Specialized GPU Providers</strong>:</p> <ul><li><!></li> <li><!></li> <li><!></li></ul></li></ol> <h3 id="why-choose-modal-for-gpu-computing">Why Choose Modal for GPU Computing?</h3> <p><!> offers several advantages for ML workloads:</p> <ol><li><strong>Instant Access</strong>: No waiting for GPU availability</li> <li><strong>Automatic Scaling</strong>: Pay only for what you use</li> <li><strong>Simple Deployment</strong>: Python-native interface</li> <li><strong>Cost Effective</strong>: No long-term commitments</li></ol> <h3 id="example-running-ml-on-modal">Example: Running ML on Modal</h3> <!> <p>Ready to start running ML workloads on powerful GPUs? <!> or check out our <!> for more examples.</p> <h2 id="additional-resources">Additional Resources</h2> <ul><li><!> - Comprehensive guide to GPU terminology</li> <li><!> - Deep dive into maximizing GPU performance</li> <li><!> - Tips for reducing model startup times</li> <li><!> - Comparing H100 and A100 GPUs</li> <li><!> - Trends in GPU computing</li></ul>`,1);function D(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=E(),d=te(a),f=o(e(d));u(f,{href:`/gpu-glossary`,children:(e,t)=>{s(),i(e,r(`GPU Glossary`))},$$slots:{default:!0}}),u(o(f,2),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`GPU utilization guide`))},$$slots:{default:!0}}),s(),n(d);var p=o(d,16),m=e(p);u(e(m),{href:`https://www.nvidia.com/en-us/data-center/h200/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`H200’s HBM3e`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,2);u(e(h),{href:`https://www.nvidia.com/en-us/data-center/a100/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`A100’s HBM2e`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);u(e(g),{href:`https://www.nvidia.com/en-us/data-center/l40s/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`L40S’s GDDR6`))},$$slots:{default:!0}}),s(),n(g),n(p);var _=o(p,12),v=e(_);u(e(v),{href:`https://www.nvidia.com/en-us/data-center/nvlink/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVLink`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);u(e(y),{href:`https://www.nvidia.com/en-us/data-center/nvlink/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NVSwitch`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,2);u(e(b),{href:`https://pcisig.com/specifications`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`PCIe`))},$$slots:{default:!0}}),s(),n(b),n(_);var x=o(_,2);u(o(e(x)),{href:`/blog/how_to_run_llama_405b_article`,children:(e,t)=>{s(),i(e,r(`Llama 3 405B`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,6),C=e(S);u(e(C),{href:`https://www.nvidia.com/en-us/data-center/tensor-cores/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tensor Cores`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);u(e(w),{href:`https://developer.nvidia.com/rtx/ray-tracing?sortBy=developer_learning_library%2Fsort%2Ftitle%3Aasc`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ray Tracing (RT) Cores`))},$$slots:{default:!0}}),s(),n(w);var D=o(w,2);u(e(D),{href:`https://www.nvidia.com/en-us/data-center/technologies/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Clock speeds`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,2);u(e(O),{href:`https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#memory-hierarchy`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Cache hierarchy`))},$$slots:{default:!0}}),s(),n(O),n(S);var k=o(S,2);u(o(e(k)),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`GPU utilization guide`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,6),j=e(A),M=o(e(j),2);u(M,{href:`/blog/nvidia-h100-price-article`,children:(e,t)=>{s(),i(e,r(`H100`))},$$slots:{default:!0}}),u(o(M,2),{href:`/blog/nvidia-a100-price-article`,children:(e,t)=>{s(),i(e,r(`A100`))},$$slots:{default:!0}}),s(),n(j),s(4),n(A);var N=o(A,44);c(N,{children:(e,t)=>{var n=T();s(2),i(e,n)},$$slots:{default:!0}});var P=o(N,6),F=e(P),I=o(e(F),2),L=e(I);u(e(L),{href:`https://aws.amazon.com/ec2/instance-types/p4/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`AWS`))},$$slots:{default:!0}}),n(L);var R=o(L,2);u(e(R),{href:`https://cloud.google.com/compute/gpus-pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Google Cloud`))},$$slots:{default:!0}}),n(R),n(I),n(F);var z=o(F,2),B=o(e(z),2),V=e(B);u(e(V),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),n(V);var H=o(V,2);u(e(H),{href:`https://runpod.io`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RunPod`))},$$slots:{default:!0}}),n(H);var U=o(H,2);u(e(U),{href:`https://lambdalabs.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Lambda Labs`))},$$slots:{default:!0}}),n(U),n(B),n(z),n(P);var W=o(P,4);u(e(W),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),s(),n(W);var G=o(W,6);l(G,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22ml-workload%22)%0A%0A%40app.function(gpu%3D%22A100%22)%0Adef%20train_model()%3A%0A%20%20%20%20%23%20Your%20ML%20code%20here%0A%20%20%20%20pass`,lang:`python`});var K=o(G,2),q=o(e(K));u(q,{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Try Modal free`))},$$slots:{default:!0}}),u(o(q,2),{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`documentation`))},$$slots:{default:!0}}),s(),n(K);var J=o(K,4),Y=e(J);u(e(Y),{href:`/blog/open-source-gpu-glossary`,children:(e,t)=>{s(),i(e,r(`Modal’s GPU Glossary`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,2);u(e(X),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`GPU Utilization Guide`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,2);u(e(Z),{href:`/docs/guide/cold-start`,children:(e,t)=>{s(),i(e,r(`Cold Start Guide`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,2);u(e(Q),{href:`/blog/gpu-types`,children:(e,t)=>{s(),i(e,r(`H100 vs. A100`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,2);u(e($),{href:`/blog/the-future-of-ai-needs-more-flexible-gpu-capacity`,children:(e,t)=>{s(),i(e,r(`Future of AI Infrastructure`))},$$slots:{default:!0}}),s(),n($),n(J),i(t,a)},$$slots:{default:!0}}))}export{D as default,f as metadata};
//# sourceMappingURL=BqXDKn7q2.js.map
