(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`07942ece-cf75-479c-a3cf-cb01c2ca6fbd`,e._sentryDebugIdIdentifier=`sentry-dbid-07942ece-cf75-479c-a3cf-cb01c2ca6fbd`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./B4L_if842.js";var f={toc:[{depth:1,value:`Benchmark an endpoint`,id:`benchmark-an-endpoint`,children:[{depth:2,value:`Workload patterns`,id:`workload-patterns`},{depth:2,value:`Endpoint preview benchmarks`,id:`endpoint-preview-benchmarks`},{depth:2,value:`Caveats`,id:`caveats`}]}],rawContent:`# Benchmark an endpoint

Live metrics tell you how an endpoint behaves under whatever traffic it happens
to be getting. A **benchmark** tells you how it behaves under a known,
repeatable load — so you can compare models, regions, and configurations on an
apples-to-apples basis.

Modal runs benchmarks for you: it drives a standard load generator against your
live endpoint from a sandbox and reports the results. Start one from the
**Benchmark** tab on the endpoint's detail page. The resulting metrics are
available in the dashboard once completed.

## Workload patterns

A benchmark runs one of two built-in patterns, each shaped like a different
real-world workload:

| Pattern                  | Prompt shape                                                                    | Models                                               |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Real-time generation** | ~3,000 input tokens → ~100 output tokens, randomized prompts                    | Interactive chat / short-answer Q&A                  |
| **Agentic multi-turn**   | ~45,000-token shared system prefix + ~5,000-token question → ~200 output tokens | Agent / tool-use workloads with long, reused context |

The agentic pattern reuses a long shared prefix across requests, so it also
exercises prefix caching — a major factor in agent workload performance.

## Endpoint preview benchmarks

When you pick a model while creating an endpoint, you'll also see **precomputed
benchmarks** attached to the model's recipe. These are reference numbers Modal
measured on a known GPU configuration, so you can compare candidate models
before deploying anything. They differ from the benchmarks above in two ways:
they're produced ahead of time by Modal (not run against your endpoint), and
they're tied to the recipe rather than your specific deployment. Use recipe
benchmarks to choose a model; run your own benchmark to validate an endpoint in
your region with your settings.

## Caveats

- **Benchmarks send real traffic.** A run drives your live endpoint, triggers
  autoscaling, and incurs the usual compute cost while it runs.
- **Results are point-in-time.** Numbers depend on the current fleet size,
  region, and any cold starts during the run. Compare runs taken under similar
  conditions, and let the endpoint warm up first for steady-state figures.
- **Pick the pattern that matches your use case.** Real-time and agentic
  workloads stress very different parts of the serving stack; benchmarking the
  wrong shape can be misleading.
`,meta:{title:`Benchmark an endpoint`,description:`Live metrics tell you how an endpoint behaves under whatever traffic it happens to be getting. A benchmark tells you how it behaves under a known, repeatable load — so you can compare models, regions, and configurations on an apples-to-apples basis.`}},{toc:p,rawContent:m,meta:h}=f,g=e(`<thead><tr><th>Pattern</th><th>Prompt shape</th><th>Models</th></tr></thead> <tbody><tr><td><strong>Real-time generation</strong></td><td>~3,000 input tokens → ~100 output tokens, randomized prompts</td><td>Interactive chat / short-answer Q&A</td></tr><tr><td><strong>Agentic multi-turn</strong></td><td>~45,000-token shared system prefix + ~5,000-token question → ~200 output tokens</td><td>Agent / tool-use workloads with long, reused context</td></tr></tbody>`,1),_=e(`<!> <p>Live metrics tell you how an endpoint behaves under whatever traffic it happens
to be getting. A <strong>benchmark</strong> tells you how it behaves under a known,
repeatable load — so you can compare models, regions, and configurations on an
apples-to-apples basis.</p> <p>Modal runs benchmarks for you: it drives a standard load generator against your
live endpoint from a sandbox and reports the results. Start one from the <strong>Benchmark</strong> tab on the endpoint’s detail page. The resulting metrics are
available in the dashboard once completed.</p> <!> <p>A benchmark runs one of two built-in patterns, each shaped like a different
real-world workload:</p> <!> <p>The agentic pattern reuses a long shared prefix across requests, so it also
exercises prefix caching — a major factor in agent workload performance.</p> <!> <p>When you pick a model while creating an endpoint, you’ll also see <strong>precomputed
benchmarks</strong> attached to the model’s recipe. These are reference numbers Modal
measured on a known GPU configuration, so you can compare candidate models
before deploying anything. They differ from the benchmarks above in two ways:
they’re produced ahead of time by Modal (not run against your endpoint), and
they’re tied to the recipe rather than your specific deployment. Use recipe
benchmarks to choose a model; run your own benchmark to validate an endpoint in
your region with your settings.</p> <!> <ul><li><strong>Benchmarks send real traffic.</strong> A run drives your live endpoint, triggers
autoscaling, and incurs the usual compute cost while it runs.</li> <li><strong>Results are point-in-time.</strong> Numbers depend on the current fleet size,
region, and any cold starts during the run. Compare runs taken under similar
conditions, and let the endpoint warm up first for steady-state figures.</li> <li><strong>Pick the pattern that matches your use case.</strong> Real-time and agentic
workloads stress very different parts of the serving stack; benchmarking the
wrong shape can be misleading.</li></ul>`,1);function v(e,p){let m=r(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>m,()=>f,{children:(e,r)=>{var i=_(),d=a(i);l(d,{id:`benchmark-an-endpoint`,children:(e,r)=>{s(),n(e,t(`Benchmark an endpoint`))},$$slots:{default:!0}});var f=o(d,6);c(f,{id:`workload-patterns`,children:(e,r)=>{s(),n(e,t(`Workload patterns`))},$$slots:{default:!0}});var p=o(f,4);u(p,{children:(e,t)=>{var r=g();s(2),n(e,r)},$$slots:{default:!0}});var m=o(p,4);c(m,{id:`endpoint-preview-benchmarks`,children:(e,r)=>{s(),n(e,t(`Endpoint preview benchmarks`))},$$slots:{default:!0}}),c(o(m,4),{id:`caveats`,children:(e,r)=>{s(),n(e,t(`Caveats`))},$$slots:{default:!0}}),s(2),n(e,i)},$$slots:{default:!0}}))}export{v as default,f as metadata};
//# sourceMappingURL=vw_8uaC-2.js.map
