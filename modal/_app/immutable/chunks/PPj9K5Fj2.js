(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6e0d0d0a-328d-44a5-9fbb-0ed80f2108fd`,e._sentryDebugIdIdentifier=`sentry-dbid-6e0d0d0a-328d-44a5-9fbb-0ed80f2108fd`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";var f={toc:[{depth:1,value:`Asynchronous API usage`,id:`asynchronous-api-usage`,children:[{depth:2,value:`Async functions`,id:`async-functions`}]}],rawContent:`# Asynchronous API usage

All of the functions in Modal are available in both standard (blocking) and
asynchronous variants. The async interface can be accessed by appending \`.aio\`
to any function in the Modal API.

For example, instead of \`my_modal_function.remote("hello")\` in a blocking
context, you can use \`await my_modal_function.remote.aio("hello")\` to get an
asynchronous coroutine response, for use with Python's \`asyncio\` library.

\`\`\`python
import asyncio
import modal

app = modal.App()


@app.function()
async def myfunc():
    ...


@app.local_entrypoint()
async def main():
    # execute 100 remote calls to myfunc in parallel
    await asyncio.gather(*[myfunc.remote.aio() for i in range(100)])
\`\`\`

This is an advanced feature. If you are comfortable with asynchronous
programming, you can use this to create arbitrary parallel execution patterns,
with the added benefit that any Modal Functions will be executed remotely.

## Async functions

Regardless if you use an async runtime (like \`asyncio\`) in your usage of _Modal
itself_, you are free to define your \`app.function\`-decorated function bodies
as either async or blocking. Both kinds of definitions will work for remote
Modal Function calls from both any context.

An async function can call a blocking function, and vice versa.

\`\`\`python
@app.function()
def blocking_function():
    return 42


@app.function()
async def async_function():
    x = await blocking_function.remote.aio()
    return x * 10


@app.local_entrypoint()
def blocking_main():
    print(async_function.remote())  # => 420
\`\`\`

If a function is configured to support multiple concurrent inputs per container,
the behavior varies slightly between blocking and async contexts:

- In a blocking context, concurrent inputs will run on separate Python threads.
  These are subject to the GIL, but they can still lead to race conditions if
  used with non-threadsafe objects.
- In an async context, concurrent inputs are simply scheduled as coroutines on
  the executor thread. Everything remains single-threaded.
`,meta:{title:`Asynchronous API usage`,description:`All of the functions in Modal are available in both standard (blocking) and asynchronous variants. The async interface can be accessed by appending .aio to any function in the Modal API.`}},{toc:p,rawContent:m,meta:h}=f,g=e(`<!> <p>All of the functions in Modal are available in both standard (blocking) and
asynchronous variants. The async interface can be accessed by appending <code>.aio</code> to any function in the Modal API.</p> <p>For example, instead of <code>my_modal_function.remote("hello")</code> in a blocking
context, you can use <code>await my_modal_function.remote.aio("hello")</code> to get an
asynchronous coroutine response, for use with Python’s <code>asyncio</code> library.</p> <!> <p>This is an advanced feature. If you are comfortable with asynchronous
programming, you can use this to create arbitrary parallel execution patterns,
with the added benefit that any Modal Functions will be executed remotely.</p> <!> <p>Regardless if you use an async runtime (like <code>asyncio</code>) in your usage of <em>Modal
itself</em>, you are free to define your <code>app.function</code>-decorated function bodies
as either async or blocking. Both kinds of definitions will work for remote
Modal Function calls from both any context.</p> <p>An async function can call a blocking function, and vice versa.</p> <!> <p>If a function is configured to support multiple concurrent inputs per container,
the behavior varies slightly between blocking and async contexts:</p> <ul><li>In a blocking context, concurrent inputs will run on separate Python threads.
These are subject to the GIL, but they can still lead to race conditions if
used with non-threadsafe objects.</li> <li>In an async context, concurrent inputs are simply scheduled as coroutines on
the executor thread. Everything remains single-threaded.</li></ul>`,1);function _(e,p){let m=r(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>m,()=>f,{children:(e,r)=>{var i=g(),d=a(i);l(d,{id:`asynchronous-api-usage`,children:(e,r)=>{s(),n(e,t(`Asynchronous API usage`))},$$slots:{default:!0}});var f=o(d,6);u(f,{code:`import%20asyncio%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function()%0Aasync%20def%20myfunc()%3A%0A%20%20%20%20...%0A%0A%0A%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20%23%20execute%20100%20remote%20calls%20to%20myfunc%20in%20parallel%0A%20%20%20%20await%20asyncio.gather(*%5Bmyfunc.remote.aio()%20for%20i%20in%20range(100)%5D)`,lang:`python`});var p=o(f,4);c(p,{id:`async-functions`,children:(e,r)=>{s(),n(e,t(`Async functions`))},$$slots:{default:!0}}),u(o(p,6),{code:`%40app.function()%0Adef%20blocking_function()%3A%0A%20%20%20%20return%2042%0A%0A%0A%40app.function()%0Aasync%20def%20async_function()%3A%0A%20%20%20%20x%20%3D%20await%20blocking_function.remote.aio()%0A%20%20%20%20return%20x%20*%2010%0A%0A%0A%40app.local_entrypoint()%0Adef%20blocking_main()%3A%0A%20%20%20%20print(async_function.remote())%20%20%23%20%3D%3E%20420`,lang:`python`}),s(4),n(e,i)},$$slots:{default:!0}}))}export{_ as default,f as metadata};
//# sourceMappingURL=PPj9K5Fj2.js.map
