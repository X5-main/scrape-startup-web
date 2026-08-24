(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5958112e-210a-43bd-895c-fa1d1a3b54b5`,e._sentryDebugIdIdentifier=`sentry-dbid-5958112e-210a-43bd-895c-fa1d1a3b54b5`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Best practices for serverless inference`,description:`Learn about gotchas and best practices for serverless inference`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-25T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`Why use serverless inference?`,id:`why-use-serverless-inference`},{depth:2,value:`Top serverless inference providers`,id:`top-serverless-inference-providers`},{depth:2,value:`Best practices for serverless inference`,id:`best-practices-for-serverless-inference`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`Serverless inference is a cloud computing model that allows you to deploy and serve machine learning models without managing the underlying infrastructure. Notable characteristics of a serverless model include:

- No server management required
- Automatic scaling to handle varying loads
- Pay-per-use pricing model
- Low operational overhead

## Why use serverless inference?

Serverless inference offers several advantages, particularly for deploying and managing expensive transformer-based models. Here's why it's beneficial:

1. Cost-efficiency: Serverless inference eliminates idle GPU time costs. You only pay for the compute resources used during actual inference, making it ideal for models with variable or "bursty" traffic patterns.

2. Scalability: It automatically scales to handle varying loads, from sporadic requests to sudden traffic spikes, without manual intervention.

3. Reduced operational overhead: There's no need to manage servers or worry about capacity planning. The cloud provider handles infrastructure management, allowing you to focus on model development and optimization.

4. Flexibility: Serverless inference adapts to your needs, whether you're serving a single model or multiple models with different resource requirements.

While serverless inference may appear more expensive on a "per-minute" basis compared to traditional server-based deployments, it eliminates the need to provision for maximum capacity scenarios. This can lead to significant cost savings, especially for workloads with variable demand.

It's worth noting that even if you anticipate running GPUs around the clock, actual utilization rarely matches this expectation. Serverless inference helps optimize resource usage and costs in these scenarios.

## Top serverless inference providers

In recent years, a number of companies have emerged to offer serverless capabilities for running inference workloads. These include:

- [Modal](https://modal.com/)
- [RunPod](https://www.runpod.io/)
- [Lambda Labs](https://lambdalabs.com/)
- [Replicate](https://replicate.com/)

Note that while GCP, Azure, and AWS each offer their own serverless cloud platforms, only GCP Cloud Run Functions supports running GPUs, and this is currently still in preview.

For more details on the providers above, check out our [comparison article](/blog/serverless-gpu-article).

## Best practices for serverless inference

To optimize your serverless inference deployments:

1. Leverage GPU acceleration: For compute-intensive models, utilize GPU resources effectively:
   - Choose [the appropriate GPU type and memory](/blog/how-much-vram-need-inference) for your model to ensure efficient resource utilization.
   - Consult your provider's documentation on how to specify GPU requirements for your functions.

2. Minimize cold starts: [Cold starts](/docs/guide/cold-start) (the time it takes to spin up a new container with your model in it) can significantly impact latency for serverless functions. Consider these techniques:
   - Maintain a [pool of warm instances](/docs/guide/cold-start#run-more-warm-containers) that are always up and running.
   - Adjust container idle timeouts to keep containers warm for longer periods, if supported.

3. Optimize model loading and initialization:
   - Utilize lifecycle methods or initialization hooks provided by your serverless platform to load models during container warm-up rather than on first invocation.
   - Move large file downloads (e.g. model weights) to the build or deployment phase when possible, so that they are downloaded only once.
   - Take advantage of pre-built images or layers which come with optimized dependencies for common ML frameworks.
   - Consider model quantization or pruning techniques to reduce the size of the model that needs to be loaded without significantly impacting performance.
   - Use persistent storage options to cache model weights, reducing load times on subsequent invocations.

4. Implement efficient batching:
   - Utilize [batching mechanisms](/docs/guide/dynamic-batching) provided by your serverless platform to automatically batch incoming requests, improving throughput.
   - Implement custom batching logic within your inference function for fine-grained control over batch size and processing.

## Conclusion

Serverless inference offers a powerful way to deploy machine learning models with minimal operational overhead. By understanding the concepts and following best practices, you can leverage serverless platforms to efficiently serve your AI models at scale.

To get started with serverless inference, check out the [Modal documentation](/docs) or explore other cloud providers' offerings.
`,meta:{description:`Learn about gotchas and best practices for serverless inference`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<p>Serverless inference is a cloud computing model that allows you to deploy and serve machine learning models without managing the underlying infrastructure. Notable characteristics of a serverless model include:</p> <ul><li>No server management required</li> <li>Automatic scaling to handle varying loads</li> <li>Pay-per-use pricing model</li> <li>Low operational overhead</li></ul> <h2 id="why-use-serverless-inference">Why use serverless inference?</h2> <p>Serverless inference offers several advantages, particularly for deploying and managing expensive transformer-based models. Here’s why it’s beneficial:</p> <ol><li><p>Cost-efficiency: Serverless inference eliminates idle GPU time costs. You only pay for the compute resources used during actual inference, making it ideal for models with variable or “bursty” traffic patterns.</p></li> <li><p>Scalability: It automatically scales to handle varying loads, from sporadic requests to sudden traffic spikes, without manual intervention.</p></li> <li><p>Reduced operational overhead: There’s no need to manage servers or worry about capacity planning. The cloud provider handles infrastructure management, allowing you to focus on model development and optimization.</p></li> <li><p>Flexibility: Serverless inference adapts to your needs, whether you’re serving a single model or multiple models with different resource requirements.</p></li></ol> <p>While serverless inference may appear more expensive on a “per-minute” basis compared to traditional server-based deployments, it eliminates the need to provision for maximum capacity scenarios. This can lead to significant cost savings, especially for workloads with variable demand.</p> <p>It’s worth noting that even if you anticipate running GPUs around the clock, actual utilization rarely matches this expectation. Serverless inference helps optimize resource usage and costs in these scenarios.</p> <h2 id="top-serverless-inference-providers">Top serverless inference providers</h2> <p>In recent years, a number of companies have emerged to offer serverless capabilities for running inference workloads. These include:</p> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <p>Note that while GCP, Azure, and AWS each offer their own serverless cloud platforms, only GCP Cloud Run Functions supports running GPUs, and this is currently still in preview.</p> <p>For more details on the providers above, check out our <!>.</p> <h2 id="best-practices-for-serverless-inference">Best practices for serverless inference</h2> <p>To optimize your serverless inference deployments:</p> <ol><li><p>Leverage GPU acceleration: For compute-intensive models, utilize GPU resources effectively:</p> <ul><li>Choose <!> for your model to ensure efficient resource utilization.</li> <li>Consult your provider’s documentation on how to specify GPU requirements for your functions.</li></ul></li> <li><p>Minimize cold starts: <!> (the time it takes to spin up a new container with your model in it) can significantly impact latency for serverless functions. Consider these techniques:</p> <ul><li>Maintain a <!> that are always up and running.</li> <li>Adjust container idle timeouts to keep containers warm for longer periods, if supported.</li></ul></li> <li><p>Optimize model loading and initialization:</p> <ul><li>Utilize lifecycle methods or initialization hooks provided by your serverless platform to load models during container warm-up rather than on first invocation.</li> <li>Move large file downloads (e.g. model weights) to the build or deployment phase when possible, so that they are downloaded only once.</li> <li>Take advantage of pre-built images or layers which come with optimized dependencies for common ML frameworks.</li> <li>Consider model quantization or pruning techniques to reduce the size of the model that needs to be loaded without significantly impacting performance.</li> <li>Use persistent storage options to cache model weights, reducing load times on subsequent invocations.</li></ul></li> <li><p>Implement efficient batching:</p> <ul><li>Utilize <!> provided by your serverless platform to automatically batch incoming requests, improving throughput.</li> <li>Implement custom batching logic within your inference function for fine-grained control over batch size and processing.</li></ul></li></ol> <h2 id="conclusion">Conclusion</h2> <p>Serverless inference offers a powerful way to deploy machine learning models with minimal operational overhead. By understanding the concepts and following best practices, you can leverage serverless platforms to efficiently serve your AI models at scale.</p> <p>To get started with serverless inference, check out the <!> or explore other cloud providers’ offerings.</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=c(s(o),18),f=e(d);u(e(f),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),n(f);var p=c(f,2);u(e(p),{href:`https://www.runpod.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod`))},$$slots:{default:!0}}),n(p);var m=c(p,2);u(e(m),{href:`https://lambdalabs.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lambda Labs`))},$$slots:{default:!0}}),n(m);var h=c(m,2);u(e(h),{href:`https://replicate.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Replicate`))},$$slots:{default:!0}}),n(h),n(d);var g=c(d,4);u(c(e(g)),{href:`/blog/serverless-gpu-article`,children:(e,t)=>{l(),i(e,r(`comparison article`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6),v=e(_),y=c(e(v),2),b=e(y);u(c(e(b)),{href:`/blog/how-much-vram-need-inference`,children:(e,t)=>{l(),i(e,r(`the appropriate GPU type and memory`))},$$slots:{default:!0}}),l(),n(b),l(2),n(y),n(v);var x=c(v,2),S=e(x);u(c(e(S)),{href:`/docs/guide/cold-start`,children:(e,t)=>{l(),i(e,r(`Cold starts`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2),w=e(C);u(c(e(w)),{href:`/docs/guide/cold-start#run-more-warm-containers`,children:(e,t)=>{l(),i(e,r(`pool of warm instances`))},$$slots:{default:!0}}),l(),n(w),l(2),n(C),n(x);var E=c(x,4),D=c(e(E),2),O=e(D);u(c(e(O)),{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{l(),i(e,r(`batching mechanisms`))},$$slots:{default:!0}}),l(),n(O),l(2),n(D),n(E),n(_);var k=c(_,6);u(c(e(k)),{href:`/docs`,children:(e,t)=>{l(),i(e,r(`Modal documentation`))},$$slots:{default:!0}}),l(),n(k),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=_ZOa8dYl.js.map
