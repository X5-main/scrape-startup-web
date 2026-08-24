(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4c2316c9-5329-4f83-99b5-9a8e77c542f0`,e._sentryDebugIdIdentifier=`sentry-dbid-4c2316c9-5329-4f83-99b5-9a8e77c542f0`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u,t as d}from"./A_g44VMC2.js";import{t as f}from"./BWkHjgsf.js";import{t as p}from"./JPsrybyr.js";import{t as m}from"./Cl0fuitU.js";import{t as h}from"./DeWGVqas2.js";import{t as g}from"./CdZDxCfO2.js";var _={title:`Announcing our $87M Series B`,description:`We’re excited to announce that we have raised more than $80M in a Series B round, led by Lux Capital. Our post-money valuation is $1.1B.`,date:`2025-09-29T12:00:00.000Z`,category:`News`,authors:[{name:`Erik Bernhardsson`,avatarUrl:`https://modal-cdn.com/blog/images/erik-bernhardsson.webp`,jobTitle:`CEO and Co-Founder`,twitterHandle:`bernhardsson`},{name:`Akshat Bubna`,avatarUrl:`https://modal-cdn.com/blog/images/akshat-bubna.webp`,jobTitle:`CTO and Co-Founder`,twitterHandle:`akshat_b`}],ogImageOverride:`https://modal-cdn.com/blog/images/announcing-our-series-b.png`,published:!0,layout:`blog`,toc:[{depth:2,value:`AI-native companies need AI-native infrastructure. We built it.`,id:`ai-native-companies-need-ai-native-infrastructure-we-built-it`},{depth:2,value:`The future of AI is already running on Modal:`,id:`the-future-of-ai-is-already-running-on-modal`},{depth:2,value:`We’re building products for the entire ML lifecycle`,id:`were-building-products-for-the-entire-ml-lifecycle`},{depth:2,value:`What’s next?`,id:`whats-next`}],rawContent:`We’re excited to announce that we have raised more than $80M in a Series B round, led by Lux Capital, with existing investors participating as well. Our post-money valuation is $1.1B. This brings our total money raised to $111M.

## AI-native companies need AI-native infrastructure. We built it.

When electricity was new, it was often retrofitted into existing solutions. A big electric engine replaced a big steam engine. But over time, we learned to take advantage of the new technology. You could replace one big engine with many tiny engines. You could connect all power generation into a big grid.

Compute infrastructure is going through a similar transformation. We all know we are still early in the days of AI –\xA0and honestly, even the cloud. A lot of existing infrastructure has not been built for either, and we’re increasingly running up against their limitations –\xA0global GPU capacity management, highly variable demand, large models, and many other things.

As developers, we saw a massive opportunity in rethinking infrastructure for these new-age needs. So we spent the last four years building something that:

- can aggregate GPUs and CPUs around the world in seconds so users never have to think about capacity management
- lets developers iterate quickly, have fun, and get products to market way faster
- is code-first, with programmable building blocks for storage, compute, and networking
- is lightning fast, with sub-second container startup times and low-latency routing
- is usage-based and built on serverless primitives, meaning users only pay for the time they run things

By pooling the world’s compute and managing the capacity at scale, we can drive efficiency and speed. By building for AI workloads directly, we can design better solutions.

Building this wasn't easy, and we had to go very deep in order to lay the foundation we needed. This included building our own file system, container runtime, scheduler, and much more. But as a result, we now have thousands of customers running complex applications who agree that we offer an unparalleled experience.

## The future of AI is already running on Modal:

Our customers do everything from curing cancer to using AI to craft songs on Modal. Here’s why:

<Quote authorName="Aakash Sabharwal" authorTitle="VP of Engineering" companyLogoLink="https://scale.com/">
  {#snippet companyLogo()}
    <ScaleLogo />
  {/snippet}
  <span>
  Everyone here loves Modal because it helps us move so much faster. We rely on it to handle massive spikes in volume for evals, RL environments, and MCP servers. Whenever a team asks about compute, we tell them to use Modal.
  </span>
</Quote>

<Quote authorName="Mike Cohen" authorTitle="Head of AI & ML Engineering" companyLogoLink="https://substack.com/">
  {#snippet companyLogo()}
    <SubstackLogo />
  {/snippet}
  <span>
    Modal lets us deploy new ML models in hours rather than weeks. We use it across spam detection, recommendations, audio transcription, and video pipelines, and it’s helped us move faster with far less complexity.
  </span>
</Quote>

<Quote authorName="Anton Osika" authorTitle="Founder and CEO" companyLogoLink="https://lovable.dev/">
  {#snippet companyLogo()}
    <LovableLogo />
  {/snippet}
  <span>
    We've previously managed to break services like GitHub because of our load, so Modal handling our massive scale so smoothly means a lot. We trust Modal to keep up with our growth, and we're excited to build together in the long term.
  </span>
</Quote>

This is just a small window into how some of the biggest names in AI use our technology today. Just recently, Meta announced [Code World Models (CWM)](https://ai.meta.com/research/publications/cwm-an-open-weights-llm-for-research-on-code-generation-with-world-models/), where they used Modal to spin up thousands of concurrent sandboxed environments for reinforcement learning.

## We're building products for the entire ML lifecycle

The foundation of Modal that keeps everything running is our container platform and storage layer. We've also built robust primitives on top of this foundation that let teams build powerful AI applications.

![Modal products and primitives](https://modal-cdn.com/blog/images/blog_asset_1.webp)

More recently, we've shipped several new products to serve new AI use cases. Our full product suite now includes:

- [Inference](/products/inference): run LLMs, generative media models, or any custom model, on thousands of GPUs
- [Sandboxes](/products/sandboxes): spin up secure, dynamically-defined environments for your agents to execute code; we run tens of thousands of containers simultaneously for customers like Lovable
- [Batch](/products/batch): easily launch massive parallel jobs; customers use this for batch transcription, protein folding, weather forecasting, and much more
- [Training](/products/training): spin up a cluster of nodes interconnected with high-throughput RDMA in seconds
- [Notebooks](/products/notebooks): collaborate on exploratory data analysis with near-instant GPU cold starts

## **What’s next?**

Our goal is to be the infrastructure provider for every single part of developing and running AI in production. The infrastructure demands of AI are only becoming more complex over time.

Modal empowers developers to get stuff into production as fast as possible. With our deep bench of talent, we’ve made tremendous progress toward that end and are excited to launch many more things over the next few years.

If you’re eager to build with us, [check out our open roles](/careers). If you’re a developer who wants to try Modal, [sign up here.](/signup)
`,meta:{description:`We’re excited to announce that we have raised more than $80M in a Series B round, led by Lux Capital. Our post-money valuation is $1.1B.`}},{title:v,description:y,date:b,category:x,authors:S,ogImageOverride:C,published:w,layout:T,toc:E,rawContent:D,meta:O}=_,k=t(`<span>Everyone here loves Modal because it helps us move so much faster. We rely on it to handle massive spikes in volume for evals, RL environments, and MCP servers. Whenever a team asks about compute, we tell them to use Modal.</span>`),A=t(`<span>Modal lets us deploy new ML models in hours rather than weeks. We use it across spam detection, recommendations, audio transcription, and video pipelines, and it’s helped us move faster with far less complexity.</span>`),j=t(`<span>We've previously managed to break services like GitHub because of our load, so Modal handling our massive scale so smoothly means a lot. We trust Modal to keep up with our growth, and we're excited to build together in the long term.</span>`),M=t(`<p>We’re excited to announce that we have raised more than $80M in a Series B round, led by Lux Capital, with existing investors participating as well. Our post-money valuation is $1.1B. This brings our total money raised to $111M.</p> <h2 id="ai-native-companies-need-ai-native-infrastructure-we-built-it">AI-native companies need AI-native infrastructure. We built it.</h2> <p>When electricity was new, it was often retrofitted into existing solutions. A big electric engine replaced a big steam engine. But over time, we learned to take advantage of the new technology. You could replace one big engine with many tiny engines. You could connect all power generation into a big grid.</p> <p>Compute infrastructure is going through a similar transformation. We all know we are still early in the days of AI –\xA0and honestly, even the cloud. A lot of existing infrastructure has not been built for either, and we’re increasingly running up against their limitations –\xA0global GPU capacity management, highly variable demand, large models, and many other things.</p> <p>As developers, we saw a massive opportunity in rethinking infrastructure for these new-age needs. So we spent the last four years building something that:</p> <ul><li>can aggregate GPUs and CPUs around the world in seconds so users never have to think about capacity management</li> <li>lets developers iterate quickly, have fun, and get products to market way faster</li> <li>is code-first, with programmable building blocks for storage, compute, and networking</li> <li>is lightning fast, with sub-second container startup times and low-latency routing</li> <li>is usage-based and built on serverless primitives, meaning users only pay for the time they run things</li></ul> <p>By pooling the world’s compute and managing the capacity at scale, we can drive efficiency and speed. By building for AI workloads directly, we can design better solutions.</p> <p>Building this wasn’t easy, and we had to go very deep in order to lay the foundation we needed. This included building our own file system, container runtime, scheduler, and much more. But as a result, we now have thousands of customers running complex applications who agree that we offer an unparalleled experience.</p> <h2 id="the-future-of-ai-is-already-running-on-modal">The future of AI is already running on Modal:</h2> <p>Our customers do everything from curing cancer to using AI to craft songs on Modal. Here’s why:</p> <!> <!> <!> <p>This is just a small window into how some of the biggest names in AI use our technology today. Just recently, Meta announced <!>, where they used Modal to spin up thousands of concurrent sandboxed environments for reinforcement learning.</p> <h2 id="were-building-products-for-the-entire-ml-lifecycle">We’re building products for the entire ML lifecycle</h2> <p>The foundation of Modal that keeps everything running is our container platform and storage layer. We’ve also built robust primitives on top of this foundation that let teams build powerful AI applications.</p> <p><!></p> <p>More recently, we’ve shipped several new products to serve new AI use cases. Our full product suite now includes:</p> <ul><li><!>: run LLMs, generative media models, or any custom model, on thousands of GPUs</li> <li><!>: spin up secure, dynamically-defined environments for your agents to execute code; we run tens of thousands of containers simultaneously for customers like Lovable</li> <li><!>: easily launch massive parallel jobs; customers use this for batch transcription, protein folding, weather forecasting, and much more</li> <li><!>: spin up a cluster of nodes interconnected with high-throughput RDMA in seconds</li> <li><!>: collaborate on exploratory data analysis with near-instant GPU cold starts</li></ul> <h2 id="whats-next"><strong>What’s next?</strong></h2> <p>Our goal is to be the infrastructure provider for every single part of developing and running AI in production. The infrastructure demands of AI are only becoming more complex over time.</p> <p>Modal empowers developers to get stuff into production as fast as possible. With our deep bench of talent, we’ve made tremendous progress toward that end and are excited to launch many more things over the next few years.</p> <p>If you’re eager to build with us, <!>. If you’re a developer who wants to try Modal, <!></p>`,1);function N(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);g(t,o(()=>y,()=>_,{children:(t,a)=>{var o=M(),g=c(s(o),20);f(g,{authorName:`Aakash Sabharwal`,authorTitle:`VP of Engineering`,companyLogoLink:`https://scale.com/`,companyLogo:e=>{m(e,{})},children:(e,t)=>{i(e,k())},$$slots:{companyLogo:!0,default:!0}});var _=c(g,2);f(_,{authorName:`Mike Cohen`,authorTitle:`Head of AI & ML Engineering`,companyLogoLink:`https://substack.com/`,companyLogo:e=>{d(e,{})},children:(e,t)=>{i(e,A())},$$slots:{companyLogo:!0,default:!0}});var v=c(_,2);f(v,{authorName:`Anton Osika`,authorTitle:`Founder and CEO`,companyLogoLink:`https://lovable.dev/`,companyLogo:e=>{u(e,{})},children:(e,t)=>{i(e,j())},$$slots:{companyLogo:!0,default:!0}});var y=c(v,2);h(c(e(y)),{href:`https://ai.meta.com/research/publications/cwm-an-open-weights-llm-for-research-on-code-generation-with-world-models/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Code World Models (CWM)`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,6);p(e(b),{src:`https://modal-cdn.com/blog/images/blog_asset_1.webp`,alt:`Modal products and primitives`}),n(b);var x=c(b,4),S=e(x);h(e(S),{href:`/products/inference`,children:(e,t)=>{l(),i(e,r(`Inference`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);h(e(C),{href:`/products/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);h(e(w),{href:`/products/batch`,children:(e,t)=>{l(),i(e,r(`Batch`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);h(e(T),{href:`/products/training`,children:(e,t)=>{l(),i(e,r(`Training`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);h(e(E),{href:`/products/notebooks`,children:(e,t)=>{l(),i(e,r(`Notebooks`))},$$slots:{default:!0}}),l(),n(E),n(x);var D=c(x,8),O=c(e(D));h(O,{href:`/careers`,children:(e,t)=>{l(),i(e,r(`check out our open roles`))},$$slots:{default:!0}}),h(c(O,2),{href:`/signup`,children:(e,t)=>{l(),i(e,r(`sign up here.`))},$$slots:{default:!0}}),n(D),i(t,o)},$$slots:{default:!0}}))}export{N as default,_ as metadata};
//# sourceMappingURL=CQvoB_RZ2.js.map
