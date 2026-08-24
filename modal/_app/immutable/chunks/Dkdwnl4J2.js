(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`69632894-c703-43ac-8d8c-b7debe6a778a`,e._sentryDebugIdIdentifier=`sentry-dbid-69632894-c703-43ac-8d8c-b7debe6a778a`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import"./B6UiYoTw.js";var d={toc:[{depth:1,value:`concurrent`,id:`concurrent`}],rawContent:`# concurrent

\`\`\`python
concurrent(*, max_inputs=None, target_inputs=None)
\`\`\`
Decorator that allows individual containers to handle multiple inputs concurrently.

The concurrency mechanism depends on whether the function is async or not:
- Async functions will run inputs on a single thread as asyncio tasks.
- Synchronous functions will use multi-threading. The code must be thread-safe.

Input concurrency will be most useful for workflows that are IO-bound
(e.g., making network requests) or when running an inference server that supports
dynamic batching.

When \`target_inputs\` is set, Modal's autoscaler will try to provision resources
such that each container is running that many inputs concurrently, rather than
autoscaling based on \`max_inputs\`. Containers may burst up to up to \`max_inputs\`
if resources are insufficient to remain at the target concurrency, e.g. when the
arrival rate of inputs increases. This can trade-off a small increase in average
latency to avoid larger tail latencies from input queuing.

*Added in v0.73.148:* This decorator replaces the \`allow_concurrent_inputs\` parameter
in \`@app.function()\` and \`@app.cls()\`.

**Usage**

\`\`\`python
# Stack the decorator under \`@app.function()\` to enable input concurrency
@app.function()
@modal.concurrent(max_inputs=100)
async def f(data):
    # Async function; will be scheduled as asyncio task
    ...

# With \`@app.cls()\`, apply the decorator at the class level, not on individual methods
@app.cls()
@modal.concurrent(max_inputs=100, target_inputs=80)
class C:
    @modal.method()
    def f(self, data):
        # Sync function; must be thread-safe
        ...

\`\`\`
`,meta:{title:`concurrent`,description:`Decorator that allows individual containers to handle multiple inputs concurrently.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <!> <p>Decorator that allows individual containers to handle multiple inputs concurrently.</p> <p>The concurrency mechanism depends on whether the function is async or not:</p> <ul><li>Async functions will run inputs on a single thread as asyncio tasks.</li> <li>Synchronous functions will use multi-threading. The code must be thread-safe.</li></ul> <p>Input concurrency will be most useful for workflows that are IO-bound
(e.g., making network requests) or when running an inference server that supports
dynamic batching.</p> <p>When <code>target_inputs</code> is set, Modal’s autoscaler will try to provision resources
such that each container is running that many inputs concurrently, rather than
autoscaling based on <code>max_inputs</code>. Containers may burst up to up to <code>max_inputs</code> if resources are insufficient to remain at the target concurrency, e.g. when the
arrival rate of inputs increases. This can trade-off a small increase in average
latency to avoid larger tail latencies from input queuing.</p> <p><em>Added in v0.73.148:</em> This decorator replaces the <code>allow_concurrent_inputs</code> parameter
in <code>@app.function()</code> and <code>@app.cls()</code>.</p> <p><strong>Usage</strong></p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`concurrent`,children:(e,r)=>{s(),n(e,t(`concurrent`))},$$slots:{default:!0}});var d=o(u,2);l(d,{code:`concurrent(*%2C%20max_inputs%3DNone%2C%20target_inputs%3DNone)`,lang:`python`}),l(o(d,16),{code:`%23%20Stack%20the%20decorator%20under%20%60%40app.function()%60%20to%20enable%20input%20concurrency%0A%40app.function()%0A%40modal.concurrent(max_inputs%3D100)%0Aasync%20def%20f(data)%3A%0A%20%20%20%20%23%20Async%20function%3B%20will%20be%20scheduled%20as%20asyncio%20task%0A%20%20%20%20...%0A%0A%23%20With%20%60%40app.cls()%60%2C%20apply%20the%20decorator%20at%20the%20class%20level%2C%20not%20on%20individual%20methods%0A%40app.cls()%0A%40modal.concurrent(max_inputs%3D100%2C%20target_inputs%3D80)%0Aclass%20C%3A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20f(self%2C%20data)%3A%0A%20%20%20%20%20%20%20%20%23%20Sync%20function%3B%20must%20be%20thread-safe%0A%20%20%20%20%20%20%20%20...%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=Dkdwnl4J2.js.map
