(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9bf216be-cf9d-4485-8449-45f8f4e93a39`,e._sentryDebugIdIdentifier=`sentry-dbid-9bf216be-cf9d-4485-8449-45f8f4e93a39`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Run async generator function on Modal`,id:`run-async-generator-function-on-modal`}],rawContent:`# Run async generator function on Modal

This example shows how you can run an async generator function on Modal.
Modal natively supports async/await syntax using asyncio.

\`\`\`python
import modal

app = modal.App("example-generators-async")


@app.function()
def f(i):
    for j in range(i):
        yield j


@app.local_entrypoint()
async def run_async():
    async for r in f.remote_gen.aio(10):
        print(r)

\`\`\`
`,meta:{title:`Run async generator function on Modal`,description:`This example shows how you can run an async generator function on Modal. Modal natively supports async/await syntax using asyncio.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This example shows how you can run an async generator function on Modal.
Modal natively supports async/await syntax using asyncio.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`run-async-generator-function-on-modal`,children:(e,r)=>{s(),n(e,t(`Run async generator function on Modal`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-generators-async%22)%0A%0A%0A%40app.function()%0Adef%20f(i)%3A%0A%20%20%20%20for%20j%20in%20range(i)%3A%0A%20%20%20%20%20%20%20%20yield%20j%0A%0A%0A%40app.local_entrypoint()%0Aasync%20def%20run_async()%3A%0A%20%20%20%20async%20for%20r%20in%20f.remote_gen.aio(10)%3A%0A%20%20%20%20%20%20%20%20print(r)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=DYmi2zTL2.js.map
