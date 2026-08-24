(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8169f9d0-5ae1-4902-8b04-dbfd57144c36`,e._sentryDebugIdIdentifier=`sentry-dbid-8169f9d0-5ae1-4902-8b04-dbfd57144c36`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";var f={toc:[{depth:1,value:`Async functions`,id:`async-functions`,children:[{depth:2,value:`Defining a function`,id:`defining-a-function`},{depth:2,value:`Running the app with asyncio`,id:`running-the-app-with-asyncio`}]}],rawContent:`# Async functions

Modal natively supports async/await syntax using asyncio.

First, let's import some global stuff.

\`\`\`python
import sys

import modal

app = modal.App("example-hello-world-async")


\`\`\`

## Defining a function

Now, let's define a function. The wrapped function can be synchronous or
asynchronous, but calling it in either context will still work.
Let's stick to a normal synchronous function

\`\`\`python
@app.function()
def f(i):
    if i % 2 == 0:
        print("hello", i)
    else:
        print("world", i, file=sys.stderr)

    return i * i


\`\`\`

## Running the app with asyncio

Let's make the main entrypoint asynchronous. In async contexts, we should
call the function using \`await\` or iterate over the map using \`async for\`.
Otherwise we would block the event loop while our call is being run.

\`\`\`python
@app.local_entrypoint()
async def run_async():
    # Call the function using .remote.aio() in order to run it asynchronously
    print(await f.remote.aio(1000))

    # Parallel map.
    total = 0
    # Call .map asynchronously using using f.map.aio(...)
    async for ret in f.map.aio(range(20)):
        total += ret

    print(total)

\`\`\`
`,meta:{title:`Async functions`,description:`Modal natively supports async/await syntax using asyncio.`}},{toc:p,rawContent:m,meta:h}=f,g=e(`<!> <p>Modal natively supports async/await syntax using asyncio.</p> <p>First, let’s import some global stuff.</p> <!> <!> <p>Now, let’s define a function. The wrapped function can be synchronous or
asynchronous, but calling it in either context will still work.
Let’s stick to a normal synchronous function</p> <!> <!> <p>Let’s make the main entrypoint asynchronous. In async contexts, we should
call the function using <code>await</code> or iterate over the map using <code>async for</code>.
Otherwise we would block the event loop while our call is being run.</p> <!>`,1);function _(e,p){let m=r(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>m,()=>f,{children:(e,r)=>{var i=g(),d=a(i);l(d,{id:`async-functions`,children:(e,r)=>{s(),n(e,t(`Async functions`))},$$slots:{default:!0}});var f=o(d,6);u(f,{code:`import%20sys%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-hello-world-async%22)%0A%0A`,lang:`python`});var p=o(f,2);c(p,{id:`defining-a-function`,children:(e,r)=>{s(),n(e,t(`Defining a function`))},$$slots:{default:!0}});var m=o(p,4);u(m,{code:`%40app.function()%0Adef%20f(i)%3A%0A%20%20%20%20if%20i%20%25%202%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20print(%22hello%22%2C%20i)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22world%22%2C%20i%2C%20file%3Dsys.stderr)%0A%0A%20%20%20%20return%20i%20*%20i%0A%0A`,lang:`python`});var h=o(m,2);c(h,{id:`running-the-app-with-asyncio`,children:(e,r)=>{s(),n(e,t(`Running the app with asyncio`))},$$slots:{default:!0}}),u(o(h,4),{code:`%40app.local_entrypoint()%0Aasync%20def%20run_async()%3A%0A%20%20%20%20%23%20Call%20the%20function%20using%20.remote.aio()%20in%20order%20to%20run%20it%20asynchronously%0A%20%20%20%20print(await%20f.remote.aio(1000))%0A%0A%20%20%20%20%23%20Parallel%20map.%0A%20%20%20%20total%20%3D%200%0A%20%20%20%20%23%20Call%20.map%20asynchronously%20using%20using%20f.map.aio(...)%0A%20%20%20%20async%20for%20ret%20in%20f.map.aio(range(20))%3A%0A%20%20%20%20%20%20%20%20total%20%2B%3D%20ret%0A%0A%20%20%20%20print(total)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{_ as default,f as metadata};
//# sourceMappingURL=k6PkGNbX.js.map
