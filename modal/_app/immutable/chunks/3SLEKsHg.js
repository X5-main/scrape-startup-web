(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`04d802e1-1088-4aa9-8811-47fecf9f9c52`,e._sentryDebugIdIdentifier=`sentry-dbid-04d802e1-1088-4aa9-8811-47fecf9f9c52`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: Rollbacks, batching, sandbox tunnels & more`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2024-09-06T12:00:00.000Z`,published:!0,length:`2 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`↩️ App rollbacks`,id:`️-app-rollbacks`},{depth:2,value:`📚 Dynamic batching`,id:`-dynamic-batching`},{depth:2,value:`🏝️ Sandbox tunnels and exec`,id:`️-sandbox-tunnels-and-exec`},{depth:2,value:`🔭 OpenTelemetry integration`,id:`-opentelemetry-integration`},{depth:2,value:`🤑 Pricing changes`,id:`-pricing-changes`},{depth:2,value:`👩‍💻 Client Updates`,id:`-client-updates`},{depth:2,value:`🥑 Fresh posts`,id:`-fresh-posts`}],rawContent:`Welcome to another round of Modal Product Updates! Here's what's new this month.

## ↩️ App rollbacks

Deployed something questionable? You can now instantly roll back your app to a previous version from the dashboard or the CLI.

![App rollbacks](https://modal-cdn.com/cdnbot/app-rollbacks.png)

<Cta href="/docs/reference/cli/app#modal-app-rollback" primary>Read the docs</Cta>

## 📚 Dynamic batching

The \`@batched\` decorator accumulates requests into dynamically-sized batches. This lets you trade off latency for throughput and GPU utilization.

![Dynamic batching](https://modal-cdn.com/cdnbot/dynamic-batching.png)

<Cta href="/docs/guide/dynamic-batching" primary>Read the docs</Cta>

## 🏝️ Sandbox tunnels and \`exec\`

\`Sandbox\` objects can now forward TCP ports to the internet. This is useful if, for example, you want to connect to a web servers running inside them. You can also \`exec\` and interface with additional processes inside an existing \`Sandbox\`.

We're interested in improving Sandboxes for agentic use cases. Please reach out to us if you have feedback or feature requests here!

<Cta href="/docs/guide/sandbox" primary>Read the docs</Cta>

## 🔭 OpenTelemetry integration

You can now export logs from Modal to your OpenTelemetry provider. If there are more integrations you would like to see, please let us know!

<Cta href="/docs/guide/otel-integration" primary>Read the docs</Cta>

## 🤑 Pricing changes

CPU cores and higher end GPUs got cheaper! [Read the announcement](/blog/pricing-update-2024).

![Pricing changes](https://modal-cdn.com/cdnbot/pricing-changes.png)

## 👩‍💻 Client Updates

Run \`pip install --upgrade modal\` to get the latest updates. Here are some of the highlights:

- Web endpoints can now be [parametrized](/docs/guide/parametrized-functions#parametrized-web-functions).
- Methods in a \`cls\` now share the [same pool of containers](/docs/reference/changelog#0630-2024-06-24).
- App deployments are now atomically applied.

For a complete list, check out the [changelog](/docs/reference/changelog).

## 🥑 Fresh posts

- [Modal supports HIPAA compliance](/blog/hipaa)
- [Inside the Modal Code Playground](/blog/playground)
- [Beat GPT-4o at Python by searching with 100 dumb LLaMAs](/blog/llama-human-eval)
- [Publish custom metrics with Prometheus Pushgateway](/docs/examples/pushgateway)
- [Custom Pet Art from Flux with Hugging Face and Gradio](/docs/examples/diffusers_lora_finetune)

![Gradio image generation interface](https://modal-cdn.com/cdnbot/gradio-image-generation.png)

As always, if you've built anything else using Modal, share it with us on the community [Slack](/slack)!
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Welcome to another round of Modal Product Updates! Here’s what’s new this month.</p> <h2 id="️-app-rollbacks">↩️ App rollbacks</h2> <p>Deployed something questionable? You can now instantly roll back your app to a previous version from the dashboard or the CLI.</p> <p><!></p> <!> <h2 id="-dynamic-batching">📚 Dynamic batching</h2> <p>The <code>@batched</code> decorator accumulates requests into dynamically-sized batches. This lets you trade off latency for throughput and GPU utilization.</p> <p><!></p> <!> <h2 id="️-sandbox-tunnels-and-exec">🏝️ Sandbox tunnels and <code>exec</code></h2> <p><code>Sandbox</code> objects can now forward TCP ports to the internet. This is useful if, for example, you want to connect to a web servers running inside them. You can also <code>exec</code> and interface with additional processes inside an existing <code>Sandbox</code>.</p> <p>We’re interested in improving Sandboxes for agentic use cases. Please reach out to us if you have feedback or feature requests here!</p> <!> <h2 id="-opentelemetry-integration">🔭 OpenTelemetry integration</h2> <p>You can now export logs from Modal to your OpenTelemetry provider. If there are more integrations you would like to see, please let us know!</p> <!> <h2 id="-pricing-changes">🤑 Pricing changes</h2> <p>CPU cores and higher end GPUs got cheaper! <!>.</p> <p><!></p> <h2 id="-client-updates">👩‍💻 Client Updates</h2> <p>Run <code>pip install --upgrade modal</code> to get the latest updates. Here are some of the highlights:</p> <ul><li>Web endpoints can now be <!>.</li> <li>Methods in a <code>cls</code> now share the <!>.</li> <li>App deployments are now atomically applied.</li></ul> <p>For a complete list, check out the <!>.</p> <h2 id="-fresh-posts">🥑 Fresh posts</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <p><!></p> <p>As always, if you’ve built anything else using Modal, share it with us on the community <!>!</p>`,1);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),6);u(e(p),{src:`https://modal-cdn.com/cdnbot/app-rollbacks.png`,alt:`App rollbacks`}),n(p);var m=c(p,2);f(m,{href:`/docs/reference/cli/app#modal-app-rollback`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var h=c(m,6);u(e(h),{src:`https://modal-cdn.com/cdnbot/dynamic-batching.png`,alt:`Dynamic batching`}),n(h);var g=c(h,2);f(g,{href:`/docs/guide/dynamic-batching`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var _=c(g,8);f(_,{href:`/docs/guide/sandbox`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var v=c(_,6);f(v,{href:`/docs/guide/otel-integration`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the docs`))},$$slots:{default:!0}});var y=c(v,4);d(c(e(y)),{href:`/blog/pricing-update-2024`,children:(e,t)=>{l(),i(e,r(`Read the announcement`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);u(e(b),{src:`https://modal-cdn.com/cdnbot/pricing-changes.png`,alt:`Pricing changes`}),n(b);var x=c(b,6),S=e(x);d(c(e(S)),{href:`/docs/guide/parametrized-functions#parametrized-web-functions`,children:(e,t)=>{l(),i(e,r(`parametrized`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(c(e(C),3),{href:`/docs/reference/changelog#0630-2024-06-24`,children:(e,t)=>{l(),i(e,r(`same pool of containers`))},$$slots:{default:!0}}),l(),n(C),l(2),n(x);var w=c(x,2);d(c(e(w)),{href:`/docs/reference/changelog`,children:(e,t)=>{l(),i(e,r(`changelog`))},$$slots:{default:!0}}),l(),n(w);var E=c(w,4),D=e(E);d(e(D),{href:`/blog/hipaa`,children:(e,t)=>{l(),i(e,r(`Modal supports HIPAA compliance`))},$$slots:{default:!0}}),n(D);var O=c(D,2);d(e(O),{href:`/blog/playground`,children:(e,t)=>{l(),i(e,r(`Inside the Modal Code Playground`))},$$slots:{default:!0}}),n(O);var k=c(O,2);d(e(k),{href:`/blog/llama-human-eval`,children:(e,t)=>{l(),i(e,r(`Beat GPT-4o at Python by searching with 100 dumb LLaMAs`))},$$slots:{default:!0}}),n(k);var A=c(k,2);d(e(A),{href:`/docs/examples/pushgateway`,children:(e,t)=>{l(),i(e,r(`Publish custom metrics with Prometheus Pushgateway`))},$$slots:{default:!0}}),n(A);var j=c(A,2);d(e(j),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{l(),i(e,r(`Custom Pet Art from Flux with Hugging Face and Gradio`))},$$slots:{default:!0}}),n(j),n(E);var M=c(E,2);u(e(M),{src:`https://modal-cdn.com/cdnbot/gradio-image-generation.png`,alt:`Gradio image generation interface`}),n(M);var N=c(M,2);d(c(e(N)),{href:`/slack`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),l(),n(N),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=3SLEKsHg.js.map
