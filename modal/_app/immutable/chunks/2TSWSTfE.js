(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3cec5bde-f528-4759-af2a-c8f38671dd57`,e._sentryDebugIdIdentifier=`sentry-dbid-3cec5bde-f528-4759-af2a-c8f38671dd57`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: Datadog integration, lower function latency & more`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2024-07-09T12:00:00.000Z`,published:!0,length:`3 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🌏 Region selection`,id:`-region-selection`},{depth:2,value:`🐶 Datadog integration`,id:`-datadog-integration`},{depth:2,value:`🌈 App details refresh`,id:`-app-details-refresh`},{depth:2,value:`🚀 Lower function latency`,id:`-lower-function-latency`},{depth:2,value:`👩‍💻 Client Updates`,id:`-client-updates`},{depth:2,value:`🥑 Fresh posts`,id:`-fresh-posts`}],rawContent:`Welcome to another round of Modal Product Updates! Here's what's new this month.

## 🌏 Region selection

You can now select which cloud region your function runs in. This is useful if, for example, you need to follow regulatory requirements, control egress fees, or locate your compute near your database.

![Code sample of region selection](https://modal-cdn.com/cdnbot/region-selection-code-snippet.png)

<Cta href="https://modal.com/docs/guide/region-selection" primary>Read
the docs</Cta>

## 🐶 Datadog integration

Our new integration with Datadog lets you forward application and audit logs to Datadog with a single click.

We're looking into adding support for OpenTelemetry logs and metrics next. Please reach out to us if you'd be interested in beta testing this!

![Datadog integration](https://modal-cdn.com/cdnbot/datadog-integration.png)

<Cta href="https://modal.com/docs/guide/datadog-integration" primary>Read
the docs</Cta>

## 🌈 App details refresh

We've completely overhauled our app details page to make it easier to observe and debug production deployments. You can now zoom in on time intervals, view container status, explore your image file system, and much more.

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/app-dashboard-refresh.mp4" type="video/mp4">
    </video>
</center>

## 🚀 Lower function latency

We've reworked our function call system to allow for higher throughputs with significantly lower overhead. This makes Modal better for serving low-latency, real-time production workloads. Please reach out if we can help optimize your workload further!

![Function latency reduction graph](https://modal-cdn.com/cdnbot/function-latency-reduction-graph.png)

## 👩‍💻 Client Updates

\`pip install --upgrade modal\` to get the latest client features, including:

- modal deploy now accepts an [optional --tag](https://modal.com/docs/reference/cli/deploy).
- Functions: new parameter to [request more local disk](https://modal.com/docs/guide/resources#disk-limits).
- Images: support for [entrypoint](https://modal.com/docs/reference/modal.Image#entrypoint) and [shell](https://modal.com/docs/reference/modal.Image#shell) in builder syntax.
- Queues: all new [CLI](https://modal.com/docs/reference/cli/queue) for creation, deletion and inspection.
- Sandboxes: can now be created [independent of apps](https://modal.com/docs/guide/sandboxes).
- Web endpoints: allow exposing FastAPI docs with [docs=True](https://modal.com/docs/examples/basic_web#turn-a-modal-function-into-an-endpoint-with-a-single-decorator).

For a complete list, check out the [changelog](https://modal.com/docs/reference/changelog).

## 🥑 Fresh posts

- [Run GPU jobs from Airflow with Modal](https://modal.com/blog/modal-airflow)
- [Guide on using CUDA with Modal](https://modal.com/docs/guide/cuda)
- [Why Substack moved their AI and ML pipelines to Modal](https://modal.com/blog/substack-case-study)
- [How Hunch supercharged AI workflows with Modal Sandboxes](https://modal.com/blog/hunch-case-study)
- [Fine-tune Stable Diffusion to create infinite icons](https://modal.com/blog/fine-tuning-stable-diffusion)
- [How we catch crypto miners using syscall signatures](https://modal.com/blog/catching-cryptominers)

As always, if you've built anything else using Modal, share it with us on the community [Slack](https://modal.com/slack)!
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Welcome to another round of Modal Product Updates! Here’s what’s new this month.</p> <h2 id="-region-selection">🌏 Region selection</h2> <p>You can now select which cloud region your function runs in. This is useful if, for example, you need to follow regulatory requirements, control egress fees, or locate your compute near your database.</p> <p><!></p> <!> <h2 id="-datadog-integration">🐶 Datadog integration</h2> <p>Our new integration with Datadog lets you forward application and audit logs to Datadog with a single click.</p> <p>We’re looking into adding support for OpenTelemetry logs and metrics next. Please reach out to us if you’d be interested in beta testing this!</p> <p><!></p> <!> <h2 id="-app-details-refresh">🌈 App details refresh</h2> <p>We’ve completely overhauled our app details page to make it easier to observe and debug production deployments. You can now zoom in on time intervals, view container status, explore your image file system, and much more.</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/app-dashboard-refresh.mp4" type="video/mp4"/></video></center> <h2 id="-lower-function-latency">🚀 Lower function latency</h2> <p>We’ve reworked our function call system to allow for higher throughputs with significantly lower overhead. This makes Modal better for serving low-latency, real-time production workloads. Please reach out if we can help optimize your workload further!</p> <p><!></p> <h2 id="-client-updates">👩‍💻 Client Updates</h2> <p><code>pip install --upgrade modal</code> to get the latest client features, including:</p> <ul><li>modal deploy now accepts an <!>.</li> <li>Functions: new parameter to <!>.</li> <li>Images: support for <!> and <!> in builder syntax.</li> <li>Queues: all new <!> for creation, deletion and inspection.</li> <li>Sandboxes: can now be created <!>.</li> <li>Web endpoints: allow exposing FastAPI docs with <!>.</li></ul> <p>For a complete list, check out the <!>.</p> <h2 id="-fresh-posts">🥑 Fresh posts</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <p>As always, if you’ve built anything else using Modal, share it with us on the community <!>!</p>`,3);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),6);u(e(p),{src:`https://modal-cdn.com/cdnbot/region-selection-code-snippet.png`,alt:`Code sample of region selection`}),n(p);var m=c(p,2);f(m,{href:`https://modal.com/docs/guide/region-selection`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read
the docs`))},$$slots:{default:!0}});var h=c(m,8);u(e(h),{src:`https://modal-cdn.com/cdnbot/datadog-integration.png`,alt:`Datadog integration`}),n(h);var g=c(h,2);f(g,{href:`https://modal.com/docs/guide/datadog-integration`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read
the docs`))},$$slots:{default:!0}});var _=c(g,6),v=e(_);v.muted=!0,n(_);var y=c(_,6);u(e(y),{src:`https://modal-cdn.com/cdnbot/function-latency-reduction-graph.png`,alt:`Function latency reduction graph`}),n(y);var b=c(y,6),x=e(b);d(c(e(x)),{href:`https://modal.com/docs/reference/cli/deploy`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`optional —tag`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);d(c(e(S)),{href:`https://modal.com/docs/guide/resources#disk-limits`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`request more local disk`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2),w=c(e(C));d(w,{href:`https://modal.com/docs/reference/modal.Image#entrypoint`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`entrypoint`))},$$slots:{default:!0}}),d(c(w,2),{href:`https://modal.com/docs/reference/modal.Image#shell`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`shell`))},$$slots:{default:!0}}),l(),n(C);var E=c(C,2);d(c(e(E)),{href:`https://modal.com/docs/reference/cli/queue`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CLI`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);d(c(e(D)),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`independent of apps`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);d(c(e(O)),{href:`https://modal.com/docs/examples/basic_web#turn-a-modal-function-into-an-endpoint-with-a-single-decorator`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`docs=True`))},$$slots:{default:!0}}),l(),n(O),n(b);var k=c(b,2);d(c(e(k)),{href:`https://modal.com/docs/reference/changelog`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`changelog`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,4),j=e(A);d(e(j),{href:`https://modal.com/blog/modal-airflow`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Run GPU jobs from Airflow with Modal`))},$$slots:{default:!0}}),n(j);var M=c(j,2);d(e(M),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Guide on using CUDA with Modal`))},$$slots:{default:!0}}),n(M);var N=c(M,2);d(e(N),{href:`https://modal.com/blog/substack-case-study`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Why Substack moved their AI and ML pipelines to Modal`))},$$slots:{default:!0}}),n(N);var P=c(N,2);d(e(P),{href:`https://modal.com/blog/hunch-case-study`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`How Hunch supercharged AI workflows with Modal Sandboxes`))},$$slots:{default:!0}}),n(P);var F=c(P,2);d(e(F),{href:`https://modal.com/blog/fine-tuning-stable-diffusion`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Fine-tune Stable Diffusion to create infinite icons`))},$$slots:{default:!0}}),n(F);var I=c(F,2);d(e(I),{href:`https://modal.com/blog/catching-cryptominers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`How we catch crypto miners using syscall signatures`))},$$slots:{default:!0}}),n(I),n(A);var L=c(A,2);d(c(e(L)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),l(),n(L),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=2TSWSTfE.js.map
