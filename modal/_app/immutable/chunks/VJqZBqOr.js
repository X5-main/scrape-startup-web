(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`72f19e99-b064-44ef-b512-424f3450a7cf`,e._sentryDebugIdIdentifier=`sentry-dbid-72f19e99-b064-44ef-b512-424f3450a7cf`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`High-priority tier`,id:`high-priority-tier`,children:[{depth:2,value:`Usage`,id:`usage`},{depth:2,value:`What’s guaranteed?`,id:`whats-guaranteed`},{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# High-priority tier

<Callout variant="gated-feature">
The high-priority tier is restricted to Modal customers with a commercial contract to allow for Service-Level Agreements (SLAs). Reach out to your Modal representative to get started.
</Callout>

Modal offers a high-priority tier for GPU workloads with strict scheduling
latency or uptime requirements. High-priority workloads are preferentially
scheduled, so they can scale up on demand regardless of how much of Modal's
global capacity is in use.

## Usage

The [Function](/docs/guide/apps) and [Server](/docs/guide/servers) primitives
both accept an experimental \`priority\` flag:

\`\`\`python notest
@app.function(
    ...,
    experimental_options={"priority": "high"},
)

@app.server(
    ...,
    experimental_options={"priority": "high"},
)
\`\`\`

Containers for a high-priority Function or Server come with scheduling
guarantees and count against your Workspace's high-priority GPU quota.

## What's guaranteed?

When your Workspace is onboarded to the high-priority tier, it is assigned a
high-priority GPU quota: the maximum number of GPUs it can run with scheduling
guarantees. While your total high-priority GPU usage is below your quota,
capacity is always available and new containers are allocated in under 2
minutes — independent of demand on Modal's global capacity pool. Once your
usage exceeds the quota, additional containers schedule into the global pool
with no preferential treatment.

The guarantee covers allocation latency only: the time to place a high-priority
container on a GPU. Containers still need to
[cold start](/docs/guide/cold-start) before serving inputs.

## Limitations

Currently the \`priority\` flag is not compatible with the following:

- \`cloud\`
- \`region\`
- [\`@modal.experimental.clustered\`](/docs/guide/multi-node-training) (multi-node clusters)

[GPU fallbacks](/docs/guide/gpu#gpu-fallbacks) can be used, as long as the
first GPU type in the fallback list is covered by your quota.
`,meta:{title:`High-priority tier`,description:`Modal offers a high-priority tier for GPU workloads with strict scheduling latency or uptime requirements. High-priority workloads are preferentially scheduled, so they can scale up on demand regardless of how much of Modal’s global capacity is in use.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>@modal.experimental.clustered</code>`),x=t(`<!> <!> <p>Modal offers a high-priority tier for GPU workloads with strict scheduling
latency or uptime requirements. High-priority workloads are preferentially
scheduled, so they can scale up on demand regardless of how much of Modal’s
global capacity is in use.</p> <!> <p>The <!> and <!> primitives
both accept an experimental <code>priority</code> flag:</p> <!> <p>Containers for a high-priority Function or Server come with scheduling
guarantees and count against your Workspace’s high-priority GPU quota.</p> <!> <p>When your Workspace is onboarded to the high-priority tier, it is assigned a
high-priority GPU quota: the maximum number of GPUs it can run with scheduling
guarantees. While your total high-priority GPU usage is below your quota,
capacity is always available and new containers are allocated in under 2
minutes — independent of demand on Modal’s global capacity pool. Once your
usage exceeds the quota, additional containers schedule into the global pool
with no preferential treatment.</p> <p>The guarantee covers allocation latency only: the time to place a high-priority
container on a GPU. Containers still need to <!> before serving inputs.</p> <!> <p>Currently the <code>priority</code> flag is not compatible with the following:</p> <ul><li><code>cloud</code></li> <li><code>region</code></li> <li><!> (multi-node clusters)</li></ul> <p><!> can be used, as long as the
first GPU type in the fallback list is covered by your quota.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`high-priority-tier`,children:(e,t)=>{l(),i(e,r(`High-priority tier`))},$$slots:{default:!0}});var g=c(m,2);u(g,{variant:`gated-feature`,children:(e,t)=>{l(),i(e,r(`The high-priority tier is restricted to Modal customers with a commercial contract to allow for Service-Level Agreements (SLAs). Reach out to your Modal representative to get started.`))},$$slots:{default:!0}});var _=c(g,4);d(_,{id:`usage`,children:(e,t)=>{l(),i(e,r(`Usage`))},$$slots:{default:!0}});var v=c(_,2),y=c(e(v));h(y,{href:`/docs/guide/apps`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),h(c(y,2),{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Server`))},$$slots:{default:!0}}),l(3),n(v);var S=c(v,2);p(S,{code:`%40app.function(%0A%20%20%20%20...%2C%0A%20%20%20%20experimental_options%3D%7B%22priority%22%3A%20%22high%22%7D%2C%0A)%0A%0A%40app.server(%0A%20%20%20%20...%2C%0A%20%20%20%20experimental_options%3D%7B%22priority%22%3A%20%22high%22%7D%2C%0A)`,lang:`python`});var C=c(S,4);d(C,{id:`whats-guaranteed`,children:(e,t)=>{l(),i(e,r(`What’s guaranteed?`))},$$slots:{default:!0}});var w=c(C,4);h(c(e(w)),{href:`/docs/guide/cold-start`,children:(e,t)=>{l(),i(e,r(`cold start`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);d(T,{id:`limitations`,children:(e,t)=>{l(),i(e,r(`Limitations`))},$$slots:{default:!0}});var E=c(T,4),D=c(e(E),4);h(e(D),{href:`/docs/guide/multi-node-training`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(D),n(E);var O=c(E,2);h(e(O),{href:`/docs/guide/gpu#gpu-fallbacks`,children:(e,t)=>{l(),i(e,r(`GPU fallbacks`))},$$slots:{default:!0}}),l(),n(O),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=VJqZBqOr.js.map
