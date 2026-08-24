(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`39637463-0245-4d74-ab03-c9d71b0129ec`,e._sentryDebugIdIdentifier=`sentry-dbid-39637463-0245-4d74-ab03-c9d71b0129ec`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Dogfooding Modal: What we learned at our internal hackathon`,description:`Highlights from our 2024 internal hackathon, showcasing innovative projects built using Modal.`,date:`2024-12-09T21:00:00.000Z`,length:`4 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`Browserman`,id:`browserman`},{depth:2,value:`Glodal`,id:`glodal`},{depth:2,value:`Waluigi`,id:`waluigi`},{depth:2,value:`pytest-modal`,id:`pytest-modal`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`This fall, we went to Ericeira, Portugal for our company offsite.

<div style="display: flex; justify-content: space-around;">
    <img src="https://modal-cdn.com/cdnbot/tmp1pjn1jfr_043d4557.webp" alt="akshat" style="width: 48%;"/>
    <img src="https://modal-cdn.com/cdnbot/offsite-erik5mo8pq3g_faca6511.webp" alt="erik" style="width: 48%;"/>
</div>

One of the highlights was an internal hackathon. The 30 of us split into 13 different teams and hacked on projects across AI agents, real time translation, and music. The only constraint was that the project had to use Modal in some way.

We were so impressed with the results that we wanted to share a few of our favorites for inspiration on how you can use Modal for your next application.

## Browserman

The Browserman team built a multi-modal AI agent app that, given a task, navigates the internet and uses purely visual information to complete the task. For example, when asked to "reorder my favorite order from Domino's", Browserman is able to autonomously find the Domino’s website and click through ads and buttons to satisfy the request:

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/hackathon2024/browserman.cut.mp4" type="video/mp4">
    </video>
</center>

Browserman was built with [Llama-3.2-90B-Vision-Instruct-FP8](https://huggingface.co/neuralmagic/Llama-3.2-90B-Vision-Instruct-FP8-dynamic), [vLLM](https://blog.vllm.ai/2023/06/20/vllm.html), Playwright, and [Modal’s distributed Queues](/docs/guide/queues). We were about to pivot the company before it got scooped by Anthropic’s [Computer Use](https://www.anthropic.com/news/3-5-models-and-computer-use) which was released one week after our hackathon :).

## Glodal

The Glodal team built a beautiful real-time app visualizing how a Modal client request traverses the globe to our us-east control plane and to our workers distributed across the US, Europe, and Asia. Controlling [region selection](/docs/guide/region-selection) of workers is one of our most popular features.

The Glodal team also implemented a prototype of a **distributed control plane** and demonstrated how it can drive down latency by 100x. In the visualization below, compare the path of a Modal client request from a single us-east control plane (red) to a distributed control plane (green):

![glodal-screenshot-cropped](https://modal-cdn.com/cdnbot/glodal-screenshotsnrasei5_616fd778.webp)

This example simulates an eu-west client kicking off a Modal job requesting eu-west containers. On our existing single us-east control plane setup:

- The eu-west client sends a transatlantic request to Modal's us-east control plane
- The Modal control plane sends another transatlantic request to kick off workers in eu-west

Using Glodal's distributed control plane, all communication stays within the continent, driving down overall latency from 268ms to 3ms. This project helped validate the benefits we would get from a distributed control plane, and we’re now working on building that into the platform.

Here’s a full video showing even more examples of how a Modal request traverses the globe:

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/hackathon2024/glodal-vid.mp4" type="video/mp4">
    </video>
</center>

## Waluigi

Before Modal, Erik Bernhardsson and Elias Frieder built [Luigi](https://github.com/spotify/luigi), one of the first modern workflow orchestrators that changed how we manage complex batch processing pipelines. The idea for the Waluigi team was simple: support Modal as a worker type for a Luigi workflow.

Below is a visualization of a Luigi DAG running several Modal tasks in parallel:

![waluigi](https://modal-cdn.com/cdnbot/hackathon_2sa26_2_4c2e5643.webp)

The combination of a workflow scheduler like Luigi with Modal’s cloud functions is a very powerful batch processing system that supports:

- autoscaling to maximize parallelism in DAG execution
- configuring each DAG job type with its own hardware requirements, including GPUs
- orchestrating dependencies, work distribution, and partial retries

## pytest-modal

The pytest-modal team built a pytest plugin that parallelizes test suites on Modal. Each test runs in its own container, taking advantage of Modal’s ability to fan out batch jobs and handle bursty workloads. They were able to shorten test suite runtime from minutes to seconds:

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/hackathon2024/pytest-modal-demo.mp4" type="video/mp4">
    </video>
</center>

## Conclusion

At the end of the hackathon presentations, everyone left feeling incredibly impressed by the quality and creativity of what their teammates were able to accomplish in such a short amount of time.

![erik-slack](https://modal-cdn.com/cdnbot/erik-slacksfd_2jee_e82e7776.webp)

It was a great reminder of what excited us all about Modal in the first place: its ability to turbo charge developer productivity across diverse use cases in AI, arts, and the overall software lifecycle.

![modal-team](https://modal-cdn.com/hackathon2024/team.gif)

<modal-img-caption>
  The Modal team over time
</modal-img-caption>
`,meta:{description:`Highlights from our 2024 internal hackathon, showcasing innovative projects built using Modal.`}},{title:m,description:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=p,w=t(`<p>This fall, we went to Ericeira, Portugal for our company offsite.</p> <div style="display: flex; justify-content: space-around;"><img src="https://modal-cdn.com/cdnbot/tmp1pjn1jfr_043d4557.webp" alt="akshat" style="width: 48%;"/> <img src="https://modal-cdn.com/cdnbot/offsite-erik5mo8pq3g_faca6511.webp" alt="erik" style="width: 48%;"/></div> <p>One of the highlights was an internal hackathon. The 30 of us split into 13 different teams and hacked on projects across AI agents, real time translation, and music. The only constraint was that the project had to use Modal in some way.</p> <p>We were so impressed with the results that we wanted to share a few of our favorites for inspiration on how you can use Modal for your next application.</p> <h2 id="browserman">Browserman</h2> <p>The Browserman team built a multi-modal AI agent app that, given a task, navigates the internet and uses purely visual information to complete the task. For example, when asked to “reorder my favorite order from Domino’s”, Browserman is able to autonomously find the Domino’s website and click through ads and buttons to satisfy the request:</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/hackathon2024/browserman.cut.mp4" type="video/mp4"/></video></center> <p>Browserman was built with <!>, <!>, Playwright, and <!>. We were about to pivot the company before it got scooped by Anthropic’s <!> which was released one week after our hackathon :).</p> <h2 id="glodal">Glodal</h2> <p>The Glodal team built a beautiful real-time app visualizing how a Modal client request traverses the globe to our us-east control plane and to our workers distributed across the US, Europe, and Asia. Controlling <!> of workers is one of our most popular features.</p> <p>The Glodal team also implemented a prototype of a <strong>distributed control plane</strong> and demonstrated how it can drive down latency by 100x. In the visualization below, compare the path of a Modal client request from a single us-east control plane (red) to a distributed control plane (green):</p> <p><!></p> <p>This example simulates an eu-west client kicking off a Modal job requesting eu-west containers. On our existing single us-east control plane setup:</p> <ul><li>The eu-west client sends a transatlantic request to Modal’s us-east control plane</li> <li>The Modal control plane sends another transatlantic request to kick off workers in eu-west</li></ul> <p>Using Glodal’s distributed control plane, all communication stays within the continent, driving down overall latency from 268ms to 3ms. This project helped validate the benefits we would get from a distributed control plane, and we’re now working on building that into the platform.</p> <p>Here’s a full video showing even more examples of how a Modal request traverses the globe:</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/hackathon2024/glodal-vid.mp4" type="video/mp4"/></video></center> <h2 id="waluigi">Waluigi</h2> <p>Before Modal, Erik Bernhardsson and Elias Frieder built <!>, one of the first modern workflow orchestrators that changed how we manage complex batch processing pipelines. The idea for the Waluigi team was simple: support Modal as a worker type for a Luigi workflow.</p> <p>Below is a visualization of a Luigi DAG running several Modal tasks in parallel:</p> <p><!></p> <p>The combination of a workflow scheduler like Luigi with Modal’s cloud functions is a very powerful batch processing system that supports:</p> <ul><li>autoscaling to maximize parallelism in DAG execution</li> <li>configuring each DAG job type with its own hardware requirements, including GPUs</li> <li>orchestrating dependencies, work distribution, and partial retries</li></ul> <h2 id="pytest-modal">pytest-modal</h2> <p>The pytest-modal team built a pytest plugin that parallelizes test suites on Modal. Each test runs in its own container, taking advantage of Modal’s ability to fan out batch jobs and handle bursty workloads. They were able to shorten test suite runtime from minutes to seconds:</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/hackathon2024/pytest-modal-demo.mp4" type="video/mp4"/></video></center> <h2 id="conclusion">Conclusion</h2> <p>At the end of the hackathon presentations, everyone left feeling incredibly impressed by the quality and creativity of what their teammates were able to accomplish in such a short amount of time.</p> <p><!></p> <p>It was a great reminder of what excited us all about Modal in the first place: its ability to turbo charge developer productivity across diverse use cases in AI, arts, and the overall software lifecycle.</p> <p><!></p> <modal-img-caption>The Modal team over time</modal-img-caption>`,3);function T(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=w(),f=c(s(o),12),p=e(f);p.muted=!0,n(f);var m=c(f,2),h=c(e(m));d(h,{href:`https://huggingface.co/neuralmagic/Llama-3.2-90B-Vision-Instruct-FP8-dynamic`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Llama-3.2-90B-Vision-Instruct-FP8`))},$$slots:{default:!0}});var g=c(h,2);d(g,{href:`https://blog.vllm.ai/2023/06/20/vllm.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}});var _=c(g,2);d(_,{href:`/docs/guide/queues`,children:(e,t)=>{l(),i(e,r(`Modal’s distributed Queues`))},$$slots:{default:!0}}),d(c(_,2),{href:`https://www.anthropic.com/news/3-5-models-and-computer-use`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Computer Use`))},$$slots:{default:!0}}),l(),n(m);var v=c(m,4);d(c(e(v)),{href:`/docs/guide/region-selection`,children:(e,t)=>{l(),i(e,r(`region selection`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4);u(e(y),{src:`https://modal-cdn.com/cdnbot/glodal-screenshotsnrasei5_616fd778.webp`,alt:`glodal-screenshot-cropped`}),n(y);var b=c(y,10),x=e(b);x.muted=!0,n(b);var S=c(b,4);d(c(e(S)),{href:`https://github.com/spotify/luigi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Luigi`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,4);u(e(C),{src:`https://modal-cdn.com/cdnbot/hackathon_2sa26_2_4c2e5643.webp`,alt:`waluigi`}),n(C);var T=c(C,10),E=e(T);E.muted=!0,n(T);var D=c(T,6);u(e(D),{src:`https://modal-cdn.com/cdnbot/erik-slacksfd_2jee_e82e7776.webp`,alt:`erik-slack`}),n(D);var O=c(D,4);u(e(O),{src:`https://modal-cdn.com/hackathon2024/team.gif`,alt:`modal-team`}),n(O),c(O,2),i(t,o)},$$slots:{default:!0}}))}export{T as default,p as metadata};
//# sourceMappingURL=C0G4HrqC.js.map
