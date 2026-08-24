(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fda61b4f-3507-4f85-9564-9c6f697aa677`,e._sentryDebugIdIdentifier=`sentry-dbid-fda61b4f-3507-4f85-9564-9c6f697aa677`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Endpoint metrics`,id:`endpoint-metrics`,children:[{depth:2,value:`What the metrics mean`,id:`what-the-metrics-mean`},{depth:2,value:`Caveats`,id:`caveats`}]}],rawContent:`# Endpoint metrics

Every endpoint reports live inference metrics so you can see how it's performing
under real traffic — latency, throughput, and how many requests are in flight.
Open an endpoint from the **Endpoints** tab and go to the **Activity** view to
see them.

There are two types of metrics available:

- **Inference metrics** — LLM engine-specific metrics designed to give you more
  performance observability.
- **Server metrics** — the standard Modal container health metrics.

## What the metrics mean

**Latency** (reported as p50 / p95 / p99):

- **Time to first token (TTFT)** — how long after a request arrives before the
  first output token streams back. The number users feel first.
- **Inter-token latency (ITL)** — average gap between successive output tokens.
  Drives perceived "typing speed."
- **End-to-end latency (E2E)** — total time to complete a request.

**Throughput:**

- **Requests per second (QPS)** — request arrival rate.
- **Token throughput** — tokens/second, split into prefill (processing the
  prompt, with a separate line for cache-hit tokens) and decode (generating
  output).

**Request load:**

- **Request activity** — the rate of requests arriving at and completing on the
  endpoint over time.
- **Running** — requests currently being processed.
- **Queued** — requests waiting for a free slot. Sustained queueing means the
  fleet is saturated and scaling up.

**Speculative decoding** (only for recipes that use it) — the average number of
draft tokens accepted per step; higher means speculation is paying off.

## Caveats

- **Metrics need traffic.** Latency and throughput are computed over recent
  rolling windows; an idle or scaled-to-zero endpoint shows no current data.
- **Cold starts skew early numbers.** The first requests after a scale-up
  include model load time. Look at steady-state windows when evaluating
  performance.
- **Percentiles need volume.** p95/p99 are only meaningful once enough requests
  have accumulated in the window.
- Endpoint metrics are available in the dashboard. To get repeatable performance
  numbers under a controlled load, [run a
  benchmark](/docs/guide/endpoint-benchmarks).
`,meta:{title:`Endpoint metrics`,description:`Every endpoint reports live inference metrics so you can see how it’s performing under real traffic — latency, throughput, and how many requests are in flight. Open an endpoint from the Endpoints tab and go to the Activity view to see them.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>Every endpoint reports live inference metrics so you can see how it’s performing
under real traffic — latency, throughput, and how many requests are in flight.
Open an endpoint from the <strong>Endpoints</strong> tab and go to the <strong>Activity</strong> view to
see them.</p> <p>There are two types of metrics available:</p> <ul><li><strong>Inference metrics</strong> — LLM engine-specific metrics designed to give you more
performance observability.</li> <li><strong>Server metrics</strong> — the standard Modal container health metrics.</li></ul> <!> <p><strong>Latency</strong> (reported as p50 / p95 / p99):</p> <ul><li><strong>Time to first token (TTFT)</strong> — how long after a request arrives before the
first output token streams back. The number users feel first.</li> <li><strong>Inter-token latency (ITL)</strong> — average gap between successive output tokens.
Drives perceived “typing speed.”</li> <li><strong>End-to-end latency (E2E)</strong> — total time to complete a request.</li></ul> <p><strong>Throughput:</strong></p> <ul><li><strong>Requests per second (QPS)</strong> — request arrival rate.</li> <li><strong>Token throughput</strong> — tokens/second, split into prefill (processing the
prompt, with a separate line for cache-hit tokens) and decode (generating
output).</li></ul> <p><strong>Request load:</strong></p> <ul><li><strong>Request activity</strong> — the rate of requests arriving at and completing on the
endpoint over time.</li> <li><strong>Running</strong> — requests currently being processed.</li> <li><strong>Queued</strong> — requests waiting for a free slot. Sustained queueing means the
fleet is saturated and scaling up.</li></ul> <p><strong>Speculative decoding</strong> (only for recipes that use it) — the average number of
draft tokens accepted per step; higher means speculation is paying off.</p> <!> <ul><li><strong>Metrics need traffic.</strong> Latency and throughput are computed over recent
rolling windows; an idle or scaled-to-zero endpoint shows no current data.</li> <li><strong>Cold starts skew early numbers.</strong> The first requests after a scale-up
include model load time. Look at steady-state windows when evaluating
performance.</li> <li><strong>Percentiles need volume.</strong> p95/p99 are only meaningful once enough requests
have accumulated in the window.</li> <li>Endpoint metrics are available in the dashboard. To get repeatable performance
numbers under a controlled load, <!>.</li></ul>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);d(f,{id:`endpoint-metrics`,children:(e,t)=>{l(),i(e,r(`Endpoint metrics`))},$$slots:{default:!0}});var m=c(f,8);u(m,{id:`what-the-metrics-mean`,children:(e,t)=>{l(),i(e,r(`What the metrics mean`))},$$slots:{default:!0}});var h=c(m,16);u(h,{id:`caveats`,children:(e,t)=>{l(),i(e,r(`Caveats`))},$$slots:{default:!0}});var g=c(h,2),_=c(e(g),6);p(c(e(_)),{href:`/docs/guide/endpoint-benchmarks`,children:(e,t)=>{l(),i(e,r(`run a
benchmark`))},$$slots:{default:!0}}),l(),n(_),n(g),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CMf6cP-j2.js.map
