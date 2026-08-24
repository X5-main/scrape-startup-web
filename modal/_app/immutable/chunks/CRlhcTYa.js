(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7cc5c73f-2c8a-4ede-9855-40e4dae09f33`,e._sentryDebugIdIdentifier=`sentry-dbid-7cc5c73f-2c8a-4ede-9855-40e4dae09f33`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: Static IP proxies, Slack integration, live usage dashboard & more`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2024-11-08T12:00:00.000Z`,published:!0,length:`5 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🕳️ Static IP proxies`,id:`️-static-ip-proxies`},{depth:2,value:`💬 Slack integration`,id:`-slack-integration`},{depth:2,value:`🌈 Live usage dashboard`,id:`-live-usage-dashboard`},{depth:2,value:`🍁 GPU fallbacks`,id:`-gpu-fallbacks`},{depth:2,value:`👩‍💻 Client Updates`,id:`-client-updates`},{depth:2,value:`🔮 Our founder’s predictions on the AI market`,id:`-our-founders-predictions-on-the-ai-market`},{depth:2,value:`🎨 How to run SD3.5, Flux, Mochi, and more`,id:`-how-to-run-sd35-flux-mochi-and-more`},{depth:2,value:`🍭 Fun tidbits*`,id:`-fun-tidbits`}],rawContent:`## 🕳️ Static IP proxies

You can now easily connect to databases and other private resources without exposing them to the public internet. Modal \`Proxy\` lets you route outbound traffic through static IPs exclusive to your workspace.

<Cta href="/docs/guide/proxy-ips" primary>Read the docs</Cta>

## 💬 Slack integration

Need to receive real-time alerts for your Modal apps? You can now do this with our native Slack integration.

![Slack integration](https://modal-cdn.com/slack+integration.png)

<Cta href="/docs/guide/slack-notifications" primary>Read the docs</Cta>

## 🌈 Live usage dashboard

You can now track resource usage across all the apps in your workspace. To see this view, go to \`Live Usage\`\xA0in your dashboard and then click on the expand button next to \`Active Resources\`.

![Live usage dashboard](https://modal-cdn.com/live+usage+dashboard.png)

<modal-img-caption>
    ooo pretty colors
</modal-img-caption>

## 🍁 GPU fallbacks

You can now specify GPU fallbacks for your functions, which will increase the pool of resources your function can be scheduled on.

![GPU fallbacks](https://modal-cdn.com/gpu+fallback.png)

<Cta href="/docs/guide/gpu#gpu-fallbacks" primary>Read the docs</Cta>

## 👩‍💻 Client Updates

Run \`pip install --upgrade modal\` to get the [latest updates](/docs/reference/changelog). Here are some of the highlights:

- CLI: [\`modal shell\`](/docs/reference/cli/shell#modal-shell) now takes a container ID, allowing you to shell into a running container.
- Functions: Memory snapshotting now supports parametrized functions.
- Sandboxes: New \`StreamType\` controls for [\`Sandbox.exec\`](/docs/reference/modal.Sandbox#exec) output handling.
- Sandboxes: The \`cidr_allowlist\` argument enables [controlled access to specified IP ranges](/docs/guide/sandbox#networking).
- ASGI apps: [Lifespan protocol](/docs/reference/changelog#064153-2024-09-30) now supported.

## 🔮 Our founder’s predictions on the AI market

In our latest blog post, Erik shares his vision on where value will accrue in the AI value chain, how patterns in GPU consumption are likely to change, and why Modal is investing in the technology to make GPU supply flexible.

<Cta href="/blog/the-future-of-ai-needs-more-flexible-gpu-capacity" primary>Read the post</Cta>

## 🎨 How to run SD3.5, Flux, Mochi, and more

The never-ending releases are keeping the content team employed!

- Stable Diffusion 3.5: new image diffusion model released just last week by Stability AI, in three variations (Large, Turbo, Medium). [Turbo example on Modal](/docs/examples/text_to_image).
- FLUX: the other popular set of image diffusion models at the moment. New examples on Modal:
  - [Running Flux fast](/docs/examples/flux) with torch optimizations
  - [Fine-tuning Flux](/docs/examples/diffusers_lora_finetune) with Dreambooth
- Mochi: new text-to-video model. [Example on Modal](/docs/examples/mochi).
- Moshi: new speech-to-speech model. [Example on Modal](/docs/examples/llm-voice-chat).

We’ve also noticed more users are training models on Modal in addition to deploying them, so we've added examples on [running long training jobs](/docs/examples/long-training) and [parallelizing hyperparameter sweeps](/docs/examples/hp_sweep_gpt).

## 🍭 Fun tidbits\\*

- We’re attending AWS re:Invent in December. [Let's meet up](mailto:sales@modal.com)!
- We’re hard launching our [Youtube channel](https://www.youtube.com/@ModalLabs). Our latest video is on [parallelizing a hyperparameter sweep](https://www.youtube.com/watch?v=VRtdu082D4Y) on Modal GPUs.

\\* _or should we say [Tidbyt](/blog/tidbyt-is-joining-modal)_
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<code>modal shell</code>`),E=t(`<code>Sandbox.exec</code>`),D=t(`<h2 id="️-static-ip-proxies">🕳️ Static IP proxies</h2> <p>You can now easily connect to databases and other private resources without exposing them to the public internet. Modal <code>Proxy</code> lets you route outbound traffic through static IPs exclusive to your workspace.</p> <!> <h2 id="-slack-integration">💬 Slack integration</h2> <p>Need to receive real-time alerts for your Modal apps? You can now do this with our native Slack integration.</p> <p><!></p> <!> <h2 id="-live-usage-dashboard">🌈 Live usage dashboard</h2> <p>You can now track resource usage across all the apps in your workspace. To see this view, go to <code>Live Usage</code>\xA0in your dashboard and then click on the expand button next to <code>Active Resources</code>.</p> <p><!></p> <modal-img-caption>ooo pretty colors</modal-img-caption> <h2 id="-gpu-fallbacks">🍁 GPU fallbacks</h2> <p>You can now specify GPU fallbacks for your functions, which will increase the pool of resources your function can be scheduled on.</p> <p><!></p> <!> <h2 id="-client-updates">👩‍💻 Client Updates</h2> <p>Run <code>pip install --upgrade modal</code> to get the <!>. Here are some of the highlights:</p> <ul><li>CLI: <!> now takes a container ID, allowing you to shell into a running container.</li> <li>Functions: Memory snapshotting now supports parametrized functions.</li> <li>Sandboxes: New <code>StreamType</code> controls for <!> output handling.</li> <li>Sandboxes: The <code>cidr_allowlist</code> argument enables <!>.</li> <li>ASGI apps: <!> now supported.</li></ul> <h2 id="-our-founders-predictions-on-the-ai-market">🔮 Our founder’s predictions on the AI market</h2> <p>In our latest blog post, Erik shares his vision on where value will accrue in the AI value chain, how patterns in GPU consumption are likely to change, and why Modal is investing in the technology to make GPU supply flexible.</p> <!> <h2 id="-how-to-run-sd35-flux-mochi-and-more">🎨 How to run SD3.5, Flux, Mochi, and more</h2> <p>The never-ending releases are keeping the content team employed!</p> <ul><li>Stable Diffusion 3.5: new image diffusion model released just last week by Stability AI, in three variations (Large, Turbo, Medium). <!>.</li> <li>FLUX: the other popular set of image diffusion models at the moment. New examples on Modal: <ul><li><!> with torch optimizations</li> <li><!> with Dreambooth</li></ul></li> <li>Mochi: new text-to-video model. <!>.</li> <li>Moshi: new speech-to-speech model. <!>.</li></ul> <p>We’ve also noticed more users are training models on Modal in addition to deploying them, so we’ve added examples on <!> and <!>.</p> <h2 id="-fun-tidbits">🍭 Fun tidbits*</h2> <ul><li>We’re attending AWS re:Invent in December. <!>!</li> <li>We’re hard launching our <!>. Our latest video is on <!> on Modal GPUs.</li></ul> <p>* <em>or should we say <!></em></p>`,3);function O(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=D(),p=c(s(o),4);f(p,{href:`/docs/guide/proxy-ips`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var m=c(p,6);u(e(m),{src:`https://modal-cdn.com/slack+integration.png`,alt:`Slack integration`}),n(m);var h=c(m,2);f(h,{href:`/docs/guide/slack-notifications`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var g=c(h,6);u(e(g),{src:`https://modal-cdn.com/live+usage+dashboard.png`,alt:`Live usage dashboard`}),n(g);var _=c(c(g,2),6);u(e(_),{src:`https://modal-cdn.com/gpu+fallback.png`,alt:`GPU fallbacks`}),n(_);var v=c(_,2);f(v,{href:`/docs/guide/gpu#gpu-fallbacks`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var y=c(v,4);d(c(e(y),3),{href:`/docs/reference/changelog`,children:(e,t)=>{l(),i(e,r(`latest updates`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2),x=e(b);d(c(e(x)),{href:`/docs/reference/cli/shell#modal-shell`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(),n(x);var S=c(x,4);d(c(e(S),3),{href:`/docs/reference/modal.Sandbox#exec`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(c(e(C),3),{href:`/docs/guide/sandbox#networking`,children:(e,t)=>{l(),i(e,r(`controlled access to specified IP ranges`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);d(c(e(w)),{href:`/docs/reference/changelog#064153-2024-09-30`,children:(e,t)=>{l(),i(e,r(`Lifespan protocol`))},$$slots:{default:!0}}),l(),n(w),n(b);var O=c(b,6);f(O,{href:`/blog/the-future-of-ai-needs-more-flexible-gpu-capacity`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the post`))},$$slots:{default:!0}});var k=c(O,6),A=e(k);d(c(e(A)),{href:`/docs/examples/text_to_image`,children:(e,t)=>{l(),i(e,r(`Turbo example on Modal`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2),M=c(e(j)),N=e(M);d(e(N),{href:`/docs/examples/flux`,children:(e,t)=>{l(),i(e,r(`Running Flux fast`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);d(e(P),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{l(),i(e,r(`Fine-tuning Flux`))},$$slots:{default:!0}}),l(),n(P),n(M),n(j);var F=c(j,2);d(c(e(F)),{href:`/docs/examples/mochi`,children:(e,t)=>{l(),i(e,r(`Example on Modal`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);d(c(e(I)),{href:`/docs/examples/llm-voice-chat`,children:(e,t)=>{l(),i(e,r(`Example on Modal`))},$$slots:{default:!0}}),l(),n(I),n(k);var L=c(k,2),R=c(e(L));d(R,{href:`/docs/examples/long-training`,children:(e,t)=>{l(),i(e,r(`running long training jobs`))},$$slots:{default:!0}}),d(c(R,2),{href:`/docs/examples/hp_sweep_gpt`,children:(e,t)=>{l(),i(e,r(`parallelizing hyperparameter sweeps`))},$$slots:{default:!0}}),l(),n(L);var z=c(L,4),B=e(z);d(c(e(B)),{href:`mailto:sales@modal.com`,children:(e,t)=>{l(),i(e,r(`Let’s meet up`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2),H=c(e(V));d(H,{href:`https://www.youtube.com/@ModalLabs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Youtube channel`))},$$slots:{default:!0}}),d(c(H,2),{href:`https://www.youtube.com/watch?v=VRtdu082D4Y`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`parallelizing a hyperparameter sweep`))},$$slots:{default:!0}}),l(),n(V),n(z);var U=c(z,2),W=c(e(U));d(c(e(W)),{href:`/blog/tidbyt-is-joining-modal`,children:(e,t)=>{l(),i(e,r(`Tidbyt`))},$$slots:{default:!0}}),n(W),n(U),i(t,o)},$$slots:{default:!0}}))}export{O as default,m as metadata};
//# sourceMappingURL=CRlhcTYa.js.map
