(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5a0d9554-1be9-495c-b46e-aa455e9bbc5f`,e._sentryDebugIdIdentifier=`sentry-dbid-5a0d9554-1be9-495c-b46e-aa455e9bbc5f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How much is an Nvidia H100?`,description:`Learn about the cost of Nvidia H100 GPUs and explore top GPU-on-demand platforms for accessing this powerful hardware.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-08-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Direct purchase price from Nvidia`,id:`direct-purchase-price-from-nvidia`},{depth:2,value:`Alternatives to direct purchase: GPU-on-demand platforms`,id:`alternatives-to-direct-purchase-gpu-on-demand-platforms`},{depth:2,value:`Pricing parameters`,id:`pricing-parameters`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`## Direct purchase price from Nvidia

When purchasing directly from Nvidia, the H100 GPU is estimated to cost around $25,000 per GPU. However, it's important to note that these prices can vary based on factors such as volume discounts and specific configurations.

For example, a full H100 GPU system, which includes multiple H100 chips, can cost up to $400,000.

## Alternatives to direct purchase: GPU-on-demand platforms

Given the high cost and limited availability of H100 GPUs, many companies are exploring alternatives through GPU-on-demand platforms. These services offer flexible access to high-performance GPUs without the need for significant upfront investment. Here are some of the top platforms:

1. [Modal](/docs/guide/gpu)

2. [Lambda](https://lambdalabs.com/)

3. [Runpod](https://www.runpod.io/)

4. [Baseten](https://www.baseten.co/)

Here's a comparison table of H100 GPU prices across these platforms:

| Platform    | H100 Price (per hour) |
| ----------- | --------------------- |
| Modal       | $4.56                 |
| Lambda Labs | $2.99                 |
| Runpod      | $5.59                 |
| Baseten     | $9.984                |

Note: Prices are approximate and may vary based on region, availability, and specific configurations. Always check the official pricing pages for the most up-to-date information.

## Pricing parameters

When considering the cost of using H100 GPUs on cloud platforms, it's important to understand that the total price of a job depends on more than just the per-hour rate. Several factors contribute to the overall runtime and, consequently, the cost. This includes:

1. **Cold start time:**
   This refers to the time it takes for a new instance of your application to start up and become ready to handle requests. In serverless environments, cold starts can occur when a new container or runtime environment needs to be initialized. For GPU workloads, this includes the time to allocate and initialize the GPU, load any necessary drivers or libraries, and set up the CUDA environment.

2. **Model loading time:**
   This includes the time it takes to load your code, dependencies, and any large models into GPU memory. For large AI models, this can be significant. You should aim to do this as infrequently as possible: for example, load the model once and reuse it for multiple inferences, amortizing this cost over many requests.

3. **Inference speed:**
   The speed of inference depends largely on the framework you use. For example, using optimized inference engines like NVIDIA TensorRT or vLLM can significantly speed up inference compared to standard PyTorch or TensorFlow implementations.

4. **Input/Output operations:**
   If your job involves heavy I/O, such as downloading large datasets or models, or reading large files or writing extensive outputs, this can add to the overall runtime.

Depending on the platform you use, how much time each of these factors takes, and thus the amount of time you are billed for, can vary significantly.

## Conclusion

While H100 GPUs offer unparalleled performance for AI and machine learning tasks, their high direct purchase cost can be prohibitive for many organizations. [Serverless GPU](/blog/serverless-gpu-article) platforms provide a more accessible and flexible alternative, allowing users to leverage the power of H100s without the hefty upfront investment.

Ready to experience the performance of H100 GPUs with the flexibility of serverless computing? [Sign up for Modal](https://modal.com/signup) today and start building your AI applications with ease!
`,meta:{description:`Learn about the cost of Nvidia H100 GPUs and explore top GPU-on-demand platforms for accessing this powerful hardware.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th>Platform</th><th>H100 Price (per hour)</th></tr></thead> <tbody><tr><td>Modal</td><td>$4.56</td></tr><tr><td>Lambda Labs</td><td>$2.99</td></tr><tr><td>Runpod</td><td>$5.59</td></tr><tr><td>Baseten</td><td>$9.984</td></tr></tbody>`,1),D=t(`<h2 id="direct-purchase-price-from-nvidia">Direct purchase price from Nvidia</h2> <p>When purchasing directly from Nvidia, the H100 GPU is estimated to cost around $25,000 per GPU. However, it’s important to note that these prices can vary based on factors such as volume discounts and specific configurations.</p> <p>For example, a full H100 GPU system, which includes multiple H100 chips, can cost up to $400,000.</p> <h2 id="alternatives-to-direct-purchase-gpu-on-demand-platforms">Alternatives to direct purchase: GPU-on-demand platforms</h2> <p>Given the high cost and limited availability of H100 GPUs, many companies are exploring alternatives through GPU-on-demand platforms. These services offer flexible access to high-performance GPUs without the need for significant upfront investment. Here are some of the top platforms:</p> <ol><li><p><!></p></li> <li><p><!></p></li> <li><p><!></p></li> <li><p><!></p></li></ol> <p>Here’s a comparison table of H100 GPU prices across these platforms:</p> <!> <p>Note: Prices are approximate and may vary based on region, availability, and specific configurations. Always check the official pricing pages for the most up-to-date information.</p> <h2 id="pricing-parameters">Pricing parameters</h2> <p>When considering the cost of using H100 GPUs on cloud platforms, it’s important to understand that the total price of a job depends on more than just the per-hour rate. Several factors contribute to the overall runtime and, consequently, the cost. This includes:</p> <ol><li><p><strong>Cold start time:</strong> This refers to the time it takes for a new instance of your application to start up and become ready to handle requests. In serverless environments, cold starts can occur when a new container or runtime environment needs to be initialized. For GPU workloads, this includes the time to allocate and initialize the GPU, load any necessary drivers or libraries, and set up the CUDA environment.</p></li> <li><p><strong>Model loading time:</strong> This includes the time it takes to load your code, dependencies, and any large models into GPU memory. For large AI models, this can be significant. You should aim to do this as infrequently as possible: for example, load the model once and reuse it for multiple inferences, amortizing this cost over many requests.</p></li> <li><p><strong>Inference speed:</strong> The speed of inference depends largely on the framework you use. For example, using optimized inference engines like NVIDIA TensorRT or vLLM can significantly speed up inference compared to standard PyTorch or TensorFlow implementations.</p></li> <li><p><strong>Input/Output operations:</strong> If your job involves heavy I/O, such as downloading large datasets or models, or reading large files or writing extensive outputs, this can add to the overall runtime.</p></li></ol> <p>Depending on the platform you use, how much time each of these factors takes, and thus the amount of time you are billed for, can vary significantly.</p> <h2 id="conclusion">Conclusion</h2> <p>While H100 GPUs offer unparalleled performance for AI and machine learning tasks, their high direct purchase cost can be prohibitive for many organizations. <!> platforms provide a more accessible and flexible alternative, allowing users to leverage the power of H100s without the hefty upfront investment.</p> <p>Ready to experience the performance of H100 GPUs with the flexibility of serverless computing? <!> today and start building your AI applications with ease!</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=c(s(o),10),p=e(f),m=e(p);d(e(m),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),n(m),n(p);var h=c(p,2),g=e(h);d(e(g),{href:`https://lambdalabs.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lambda`))},$$slots:{default:!0}}),n(g),n(h);var _=c(h,2),v=e(_);d(e(v),{href:`https://www.runpod.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Runpod`))},$$slots:{default:!0}}),n(v),n(_);var y=c(_,2),b=e(y);d(e(b),{href:`https://www.baseten.co/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Baseten`))},$$slots:{default:!0}}),n(b),n(y),n(f);var x=c(f,4);u(x,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var S=c(x,14);d(c(e(S)),{href:`/blog/serverless-gpu-article`,children:(e,t)=>{l(),i(e,r(`Serverless GPU`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(c(e(C)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sign up for Modal`))},$$slots:{default:!0}}),l(),n(C),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=C7LKevhP2.js.map
