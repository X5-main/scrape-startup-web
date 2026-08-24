(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3ad73b42-67e8-4ed4-849b-c550d009c658`,e._sentryDebugIdIdentifier=`sentry-dbid-3ad73b42-67e8-4ed4-849b-c550d009c658`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import"./DBIL8FrF.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Product updates: Running batch jobs with 1M inputs, ephemeral apps, and a new TensorRT-LLM example`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2025-04-17T12:00:00.000Z`,published:!0,length:`5 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🍩\xA0Run async jobs with 1M inputs`,id:`run-async-jobs-with-1m-inputs`},{depth:2,value:`👩‍💻 Client updates`,id:`-client-updates`},{depth:2,value:`🖊️New super fast LLM inference example with TensorRT-LLM`,id:`️new-super-fast-llm-inference-example-with-tensorrt-llm`},{depth:2,value:`📽️\xA0Video walkthroughs`,id:`️video-walkthroughs`},{depth:2,value:`🚀\xA0Customer launches`,id:`customer-launches`},{depth:2,value:`🍭 Fun tidbits`,id:`-fun-tidbits`}],rawContent:`## 🍩\xA0Run async jobs with 1M inputs

![](https://modal-cdn.com/cdnbot/async-batchpw6jrz3o_3cc440c6.webp)

Running large-scale async jobs on Modal just got a whole lot easier:

- You can now queue up to **1 million inputs** per Modal Function (previously 2k).
- We’ve also raised the \`.spawn()\` rate limit so you can submit inputs more quickly.
- \`FunctionCall\` results now stick around for **7 days**, giving you more flexibility to retrieve them when you're ready.

Want to try job processing on Modal? [Check out the guide
→](https://modal.com/docs/guide/job-queue)

## 👩‍💻 Client updates

Run \`pip install --upgrade modal\` to get the latest client updates.

- Modal Client v1.0 is on the way! Expect cleaner APIs and some deprecation warnings — check out our [Migration Guide](/docs/guide/modal-1-0-migration) to prep your code.
- You can now launch [ephemeral apps](/docs/guide/apps#ephemeral-apps) from within containers using \`with app.run():\`. Avoid putting this in global scope to prevent recursion.
- Use \`context_dir\` to make relative \`COPY\` commands in [Dockerfiles](/docs/reference/modal.Image#from_dockerfile) work more
  reliably.
- Use \`Image.cmd(...)\` to [define default entrypoint args](/docs/reference/modal.Image#cmd) for your Docker images.
- You can [now see Git commit info for apps](/docs/reference/cli/app#modal-app-history), both in the CLI via \`modal app history\`, and in the dashboard.

![](https://modal-cdn.com/cdnbot/app-historyje7pox6y_7a049cc5.webp)

## 🖊️New super fast LLM inference example with TensorRT-LLM

Check out our [new
example](https://modal.com/docs/examples/trtllm_latency#serve-an-interactive-language-model-app-with-latency-optimized-tensorrt-llm-llama-3-8b)
showing how to serve large language models with ultra-low (less than 400 ms) latency
using [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) on Modal. Perfect
for real-time applications.

![](<https://modal-public-assets.s3.us-east-1.amazonaws.com/example-trtllm-latency-ezgif.com-video-to-gif-converter+(2).gif>)

## 📽️\xA0Video walkthroughs

Want to see Modal in action? We dropped two new walkthroughs:

- **Deploy DeepSeek models on Modal** — A step-by-step guide to spinning up DeepSeek in production. [Watch the video →](https://www.youtube.com/watch?v=HrFAlcAZ0Mk)
- **Serve OpenAI-compatible APIs with vLLM** — Learn how to deploy and scale a blazing-fast vLLM service on Modal. [Watch the video →](https://www.youtube.com/watch?v=gh-JizAs-jY)

## 🚀\xA0Customer launches

![](<https://modal-public-assets.s3.us-east-1.amazonaws.com/sculptor-social-ar+(2).gif>)

- [Imbue](https://imbue.com/) launched [Sculptor](https://imbue.com/product/sculptor/), the first coding agent environment that helps you catch issues, write tests, and improve your code, built on Modal Sandboxes.
- [Phonic](https://phonic.co/) launched their new voice AI platform, with Modal
  enabling low-latency inference and massively parallel job processing.
- [Firebender](https://firebender.com/blog/kotlin-bench) launched [Kotlin-bench](https://github.com/Kotlin/kotlinx-benchmark), the first benchmark evaluating AI models on real-world Kotlin & Android tasks, using Modal’s \`.map()\` for large-scale parallelization.

## 🍭 Fun tidbits

- We were named the #2 most promising early-stage company on the [2025 Enterprise Tech 30 list by Wing VC and Eric Newcomer](https://www.enterprisetech30.com/).

![](https://modal-cdn.com/cdnbot/enterprise-listx_wud907_76896579.webp)

- We had some amazing demos at our open-source LLM demo night (hosted jointly with Mistral), from blazing fast speech-to-speech to domain-specific agent evals.

![](https://modal-cdn.com/cdnbot/modal-mistral4v0mlwkf_eab78885.webp)

- We launched our first billboard campaign in SF! Anyone who finds and tweets a photo of our billboards gets a little prize.

![](https://modal-cdn.com/cdnbot/billboard-imagemxfu0ae6_a7e0a4a2.webp)
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:m,description:h,date:g,published:_,length:v,category:y,layout:b,toc:x,rawContent:S,meta:C}=p,w=t(`<h2 id="run-async-jobs-with-1m-inputs">🍩\xA0Run async jobs with 1M inputs</h2> <p><!></p> <p>Running large-scale async jobs on Modal just got a whole lot easier:</p> <ul><li>You can now queue up to <strong>1 million inputs</strong> per Modal Function (previously 2k).</li> <li>We’ve also raised the <code>.spawn()</code> rate limit so you can submit inputs more quickly.</li> <li><code>FunctionCall</code> results now stick around for <strong>7 days</strong>, giving you more flexibility to retrieve them when you’re ready.</li></ul> <p>Want to try job processing on Modal? <!></p> <h2 id="-client-updates">👩‍💻 Client updates</h2> <p>Run <code>pip install --upgrade modal</code> to get the latest client updates.</p> <ul><li>Modal Client v1.0 is on the way! Expect cleaner APIs and some deprecation warnings — check out our <!> to prep your code.</li> <li>You can now launch <!> from within containers using <code>with app.run():</code>. Avoid putting this in global scope to prevent recursion.</li> <li>Use <code>context_dir</code> to make relative <code>COPY</code> commands in <!> work more
reliably.</li> <li>Use <code>Image.cmd(...)</code> to <!> for your Docker images.</li> <li>You can <!>, both in the CLI via <code>modal app history</code>, and in the dashboard.</li></ul> <p><!></p> <h2 id="️new-super-fast-llm-inference-example-with-tensorrt-llm">🖊️New super fast LLM inference example with TensorRT-LLM</h2> <p>Check out our <!> showing how to serve large language models with ultra-low (less than 400 ms) latency
using <!> on Modal. Perfect
for real-time applications.</p> <p><!></p> <h2 id="️video-walkthroughs">📽️\xA0Video walkthroughs</h2> <p>Want to see Modal in action? We dropped two new walkthroughs:</p> <ul><li><strong>Deploy DeepSeek models on Modal</strong> — A step-by-step guide to spinning up DeepSeek in production. <!></li> <li><strong>Serve OpenAI-compatible APIs with vLLM</strong> — Learn how to deploy and scale a blazing-fast vLLM service on Modal. <!></li></ul> <h2 id="customer-launches">🚀\xA0Customer launches</h2> <p><!></p> <ul><li><!> launched <!>, the first coding agent environment that helps you catch issues, write tests, and improve your code, built on Modal Sandboxes.</li> <li><!> launched their new voice AI platform, with Modal
enabling low-latency inference and massively parallel job processing.</li> <li><!> launched <!>, the first benchmark evaluating AI models on real-world Kotlin & Android tasks, using Modal’s <code>.map()</code> for large-scale parallelization.</li></ul> <h2 id="-fun-tidbits">🍭 Fun tidbits</h2> <ul><li>We were named the #2 most promising early-stage company on the <!>.</li></ul> <p><!></p> <ul><li>We had some amazing demos at our open-source LLM demo night (hosted jointly with Mistral), from blazing fast speech-to-speech to domain-specific agent evals.</li></ul> <p><!></p> <ul><li>We launched our first billboard campaign in SF! Anyone who finds and tweets a photo of our billboards gets a little prize.</li></ul> <p><!></p>`,1);function T(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=w(),f=c(s(o),2);u(e(f),{src:`https://modal-cdn.com/cdnbot/async-batchpw6jrz3o_3cc440c6.webp`}),n(f);var p=c(f,6);d(c(e(p)),{href:`https://modal.com/docs/guide/job-queue`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Check out the guide
→`))},$$slots:{default:!0}}),n(p);var m=c(p,6),h=e(m);d(c(e(h)),{href:`/docs/guide/modal-1-0-migration`,children:(e,t)=>{l(),i(e,r(`Migration Guide`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(c(e(g)),{href:`/docs/guide/apps#ephemeral-apps`,children:(e,t)=>{l(),i(e,r(`ephemeral apps`))},$$slots:{default:!0}}),l(3),n(g);var _=c(g,2);d(c(e(_),5),{href:`/docs/reference/modal.Image#from_dockerfile`,children:(e,t)=>{l(),i(e,r(`Dockerfiles`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);d(c(e(v),3),{href:`/docs/reference/modal.Image#cmd`,children:(e,t)=>{l(),i(e,r(`define default entrypoint args`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);d(c(e(y)),{href:`/docs/reference/cli/app#modal-app-history`,children:(e,t)=>{l(),i(e,r(`now see Git commit info for apps`))},$$slots:{default:!0}}),l(3),n(y),n(m);var b=c(m,2);u(e(b),{src:`https://modal-cdn.com/cdnbot/app-historyje7pox6y_7a049cc5.webp`}),n(b);var x=c(b,4),S=c(e(x));d(S,{href:`https://modal.com/docs/examples/trtllm_latency#serve-an-interactive-language-model-app-with-latency-optimized-tensorrt-llm-llama-3-8b`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`new
example`))},$$slots:{default:!0}}),d(c(S,2),{href:`https://github.com/NVIDIA/TensorRT-LLM`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`TensorRT-LLM`))},$$slots:{default:!0}}),l(),n(x);var C=c(x,2);u(e(C),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/example-trtllm-latency-ezgif.com-video-to-gif-converter+(2).gif`}),n(C);var T=c(C,6),E=e(T);d(c(e(E),2),{href:`https://www.youtube.com/watch?v=HrFAlcAZ0Mk`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Watch the video →`))},$$slots:{default:!0}}),n(E);var D=c(E,2);d(c(e(D),2),{href:`https://www.youtube.com/watch?v=gh-JizAs-jY`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Watch the video →`))},$$slots:{default:!0}}),n(D),n(T);var O=c(T,4);u(e(O),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/sculptor-social-ar+(2).gif`}),n(O);var k=c(O,2),A=e(k),j=e(A);d(j,{href:`https://imbue.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Imbue`))},$$slots:{default:!0}}),d(c(j,2),{href:`https://imbue.com/product/sculptor/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sculptor`))},$$slots:{default:!0}}),l(),n(A);var M=c(A,2);d(e(M),{href:`https://phonic.co/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Phonic`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2),P=e(N);d(P,{href:`https://firebender.com/blog/kotlin-bench`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Firebender`))},$$slots:{default:!0}}),d(c(P,2),{href:`https://github.com/Kotlin/kotlinx-benchmark`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kotlin-bench`))},$$slots:{default:!0}}),l(3),n(N),n(k);var F=c(k,4),I=e(F);d(c(e(I)),{href:`https://www.enterprisetech30.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`2025 Enterprise Tech 30 list by Wing VC and Eric Newcomer`))},$$slots:{default:!0}}),l(),n(I),n(F);var L=c(F,2);u(e(L),{src:`https://modal-cdn.com/cdnbot/enterprise-listx_wud907_76896579.webp`}),n(L);var R=c(L,4);u(e(R),{src:`https://modal-cdn.com/cdnbot/modal-mistral4v0mlwkf_eab78885.webp`}),n(R);var z=c(R,4);u(e(z),{src:`https://modal-cdn.com/cdnbot/billboard-imagemxfu0ae6_a7e0a4a2.webp`}),n(z),i(t,o)},$$slots:{default:!0}}))}export{T as default,p as metadata};
//# sourceMappingURL=Cbzdlm6K.js.map
