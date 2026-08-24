(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`40cb12c8-2518-4ad5-a0de-a5abcf38d692`,e._sentryDebugIdIdentifier=`sentry-dbid-40cb12c8-2518-4ad5-a0de-a5abcf38d692`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Dynamic batching`,id:`dynamic-batching`,children:[{depth:2,value:`Enable dynamic batching with @batched`,id:`enable-dynamic-batching-with-batched`},{depth:2,value:`Use @batched with functions that take and return lists`,id:`use-batched-with-functions-that-take-and-return-lists`},{depth:2,value:`Modal Cls methods are compatible with dynamic batching`,id:`modal-cls-methods-are-compatible-with-dynamic-batching`},{depth:2,value:`Configure the wait time and batch size of dynamic batches`,id:`configure-the-wait-time-and-batch-size-of-dynamic-batches`,children:[{depth:3,value:`Selecting a batch configuration`,id:`selecting-a-batch-configuration`}]},{depth:2,value:`Serve Web Functions with dynamic batching`,id:`serve-web-functions-with-dynamic-batching`}]}],rawContent:`# Dynamic batching

Modal's \`@batched\` feature allows you to accumulate requests
and process them in dynamically-sized batches, rather than one-by-one.

Batching increases throughput at a potential cost to latency.
Batched requests can share resources and reuse work, reducing the time and cost per request.
Batching is particularly useful for GPU-accelerated machine learning workloads,
as GPUs are designed to maximize throughput and are frequently bottlenecked on shareable resources,
like weights stored in memory.

Static batching can lead to unbounded latency, as the function waits for a fixed number of requests to arrive.
Modal's dynamic batching waits for the lesser of a fixed time _or_ a fixed number of requests before executing,
maximizing the throughput benefit of batching while minimizing the latency penalty.

## Enable dynamic batching with \`@batched\`

To enable dynamic batching, apply the
[\`@modal.batched\` decorator](/docs/sdk/py/latest/batched) to the target
Python function. Then, wrap it in \`@app.function()\` and run it on Modal,
and the inputs will be accumulated and processed in batches.

Here's what that looks like:

\`\`\`python
import modal

app = modal.App()

@app.function()
@modal.batched(max_batch_size=2, wait_ms=1000)
async def batch_add(xs: list[int], ys: list[int]) -> list[int]:
    return [x + y for x, y in zip(xs, ys)]
\`\`\`

When you invoke a function decorated with \`@batched\`, you invoke it asynchronously on individual inputs.
Outputs are returned where they were invoked.

For instance, the code below invokes the decorated \`batch_add\` function above three times, but \`batch_add\`
only executes twice:

\`\`\`python continuation
@app.local_entrypoint()
async def main():
    inputs = [(1, 300), (2, 200), (3, 100)]
    async for result in batch_add.starmap.aio(inputs):
        print(f"Sum: {result}")
        # Sum: 301
        # Sum: 202
        # Sum: 103
\`\`\`

The first time it is executed with \`xs\` batched to \`[1, 2]\`
and \`ys\` batched to \`[300, 200]\`. After about a one second delay, it is executed with \`xs\`
batched to \`[3]\` and \`ys\` batched to \`[100]\`.
The result is an iterator that yields \`301\`, \`202\`, and \`103\`.

## Use \`@batched\` with functions that take and return lists

For a Python function to be compatible with \`@modal.batched\`, it must adhere to
the following rules:

- ** The inputs to the function must be lists. **
  In the example above, we pass \`xs\` and \`ys\`, which are both lists of \`int\`s.
- ** The function must return a list**. In the example above, the function returns
  a list of sums.
- ** The lengths of all the input lists and the output list must be the same. **
  In the example above, if \`L == len(xs) == len(ys)\`, then \`L == len(batch_add(xs, ys))\`.

## Modal \`Cls\` methods are compatible with dynamic batching

Methods on Modal [\`Cls\`](/docs/guide/lifecycle-functions)es also support dynamic batching.

\`\`\`python
import modal

app = modal.App()

@app.cls()
class BatchedClass():
    @modal.batched(max_batch_size=2, wait_ms=1000)
    async def batch_add(self, xs: list[int], ys: list[int]) -> list[int]:
        return [x + y for x, y in zip(xs, ys)]
\`\`\`

One additional rule applies to classes with Batched Methods:

- If a class has a Batched Method, it **cannot have other Batched Methods or [Methods](/docs/sdk/py/latest/method)**.

## Configure the wait time and batch size of dynamic batches

The \`@batched\` decorator takes in two required configuration parameters:

- \`max_batch_size\` limits the number of inputs combined into a single batch.
- \`wait_ms\` limits the amount of time the Function waits for more inputs after
  the first input is received.

The first invocation of the Batched Function initiates a new batch, and subsequent
calls add requests to this ongoing batch. If \`max_batch_size\` is reached,
the batch immediately executes. If the \`max_batch_size\` is not met but \`wait_ms\`
has passed since the first request was added to the batch, the unfilled batch is
executed.

### Selecting a batch configuration

To optimize the batching configurations for your application, consider the following heuristics:

- Set \`max_batch_size\` to the largest value your function can handle, so you
  can amortize and parallelize as much work as possible.

- Set \`wait_ms\` to the difference between your targeted latency and the execution time. Most applications
  have a targeted latency, and this allows the latency of any request to stay
  within that limit.

## Serve Web Functions with dynamic batching

Here's a simple example of serving a Function that batches requests dynamically
with a [\`@modal.fastapi_endpoint\`](/docs/guide/webhooks). Run
[\`modal serve\`](/docs/cli/latest/serve), submit requests to the endpoint,
and the Function will batch your requests on the fly.

\`\`\`python
import modal

app = modal.App(image=modal.Image.debian_slim().pip_install("fastapi"))

@app.function()
@modal.batched(max_batch_size=2, wait_ms=1000)
async def batch_add(xs: list[int], ys: list[int]) -> list[int]:
    return [x + y for x, y in zip(xs, ys)]


@app.function()
@modal.fastapi_endpoint(method="POST", docs=True)
async def add(body: dict[str, int]) -> dict[str, int]:
    result = await batch_add.remote.aio(body["x"], body["y"])
    return {"result": result}
\`\`\`

Now, you can submit requests to the Web Function and process them in batches. For instance, the three requests
in the following example, which might be requests from concurrent clients in a real deployment,
will be batched into two executions:

\`\`\`python notest
import asyncio
import aiohttp

async def send_post_request(session, url, data):
    async with session.post(url, json=data) as response:
        return await response.json()

async def main():
    # Enter the Web Function URL here
    url = "https://workspace--app-name-endpoint-name.modal.run"

    async with aiohttp.ClientSession() as session:
        # Submit three requests asynchronously
        tasks = [
            send_post_request(session, url, {"x": 1, "y": 300}),
            send_post_request(session, url, {"x": 2, "y": 200}),
            send_post_request(session, url, {"x": 3, "y": 100}),
        ]
        results = await asyncio.gather(*tasks)
        for result in results:
            print(f"Sum: {result['result']}")

asyncio.run(main())
\`\`\`
`,meta:{title:`Dynamic batching`,description:`Modal’s @batched feature allows you to accumulate requests and process them in dynamically-sized batches, rather than one-by-one.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`Enable dynamic batching with <code>@batched</code>`,1),x=t(`<code>@modal.batched</code> decorator`,1),S=t(`Use <code>@batched</code> with functions that take and return lists`,1),C=t(`Modal <code>Cls</code> methods are compatible with dynamic batching`,1),w=t(`<code>Cls</code>`),T=t(`<code>@modal.fastapi_endpoint</code>`),E=t(`<code>modal serve</code>`),D=t(`<!> <p>Modal’s <code>@batched</code> feature allows you to accumulate requests
and process them in dynamically-sized batches, rather than one-by-one.</p> <p>Batching increases throughput at a potential cost to latency.
Batched requests can share resources and reuse work, reducing the time and cost per request.
Batching is particularly useful for GPU-accelerated machine learning workloads,
as GPUs are designed to maximize throughput and are frequently bottlenecked on shareable resources,
like weights stored in memory.</p> <p>Static batching can lead to unbounded latency, as the function waits for a fixed number of requests to arrive.
Modal’s dynamic batching waits for the lesser of a fixed time <em>or</em> a fixed number of requests before executing,
maximizing the throughput benefit of batching while minimizing the latency penalty.</p> <!> <p>To enable dynamic batching, apply the <!> to the target
Python function. Then, wrap it in <code>@app.function()</code> and run it on Modal,
and the inputs will be accumulated and processed in batches.</p> <p>Here’s what that looks like:</p> <!> <p>When you invoke a function decorated with <code>@batched</code>, you invoke it asynchronously on individual inputs.
Outputs are returned where they were invoked.</p> <p>For instance, the code below invokes the decorated <code>batch_add</code> function above three times, but <code>batch_add</code> only executes twice:</p> <!> <p>The first time it is executed with <code>xs</code> batched to <code>[1, 2]</code> and <code>ys</code> batched to <code>[300, 200]</code>. After about a one second delay, it is executed with <code>xs</code> batched to <code>[3]</code> and <code>ys</code> batched to <code>[100]</code>.
The result is an iterator that yields <code>301</code>, <code>202</code>, and <code>103</code>.</p> <!> <p>For a Python function to be compatible with <code>@modal.batched</code>, it must adhere to
the following rules:</p> <ul><li><strong>The inputs to the function must be lists.</strong> In the example above, we pass <code>xs</code> and <code>ys</code>, which are both lists of <code>int</code>s.</li> <li><strong>The function must return a list</strong>. In the example above, the function returns
a list of sums.</li> <li><strong>The lengths of all the input lists and the output list must be the same.</strong> In the example above, if <code>L == len(xs) == len(ys)</code>, then <code>L == len(batch_add(xs, ys))</code>.</li></ul> <!> <p>Methods on Modal <!>es also support dynamic batching.</p> <!> <p>One additional rule applies to classes with Batched Methods:</p> <ul><li>If a class has a Batched Method, it <strong>cannot have other Batched Methods or <!></strong>.</li></ul> <!> <p>The <code>@batched</code> decorator takes in two required configuration parameters:</p> <ul><li><code>max_batch_size</code> limits the number of inputs combined into a single batch.</li> <li><code>wait_ms</code> limits the amount of time the Function waits for more inputs after
the first input is received.</li></ul> <p>The first invocation of the Batched Function initiates a new batch, and subsequent
calls add requests to this ongoing batch. If <code>max_batch_size</code> is reached,
the batch immediately executes. If the <code>max_batch_size</code> is not met but <code>wait_ms</code> has passed since the first request was added to the batch, the unfilled batch is
executed.</p> <!> <p>To optimize the batching configurations for your application, consider the following heuristics:</p> <ul><li><p>Set <code>max_batch_size</code> to the largest value your function can handle, so you
can amortize and parallelize as much work as possible.</p></li> <li><p>Set <code>wait_ms</code> to the difference between your targeted latency and the execution time. Most applications
have a targeted latency, and this allows the latency of any request to stay
within that limit.</p></li></ul> <!> <p>Here’s a simple example of serving a Function that batches requests dynamically
with a <!>. Run <!>, submit requests to the endpoint,
and the Function will batch your requests on the fly.</p> <!> <p>Now, you can submit requests to the Web Function and process them in batches. For instance, the three requests
in the following example, which might be requests from concurrent clients in a real deployment,
will be batched into two executions:</p> <!>`,1);function O(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=D(),m=s(o);f(m,{id:`dynamic-batching`,children:(e,t)=>{l(),i(e,r(`Dynamic batching`))},$$slots:{default:!0}});var g=c(m,8);u(g,{id:`enable-dynamic-batching-with-batched`,children:(e,t)=>{l();var n=b();l(),i(e,n)},$$slots:{default:!0}});var _=c(g,2);h(c(e(_)),{href:`/docs/sdk/py/latest/batched`,children:(e,t)=>{var n=x();l(),i(e,n)},$$slots:{default:!0}}),l(3),n(_);var v=c(_,4);p(v,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function()%0A%40modal.batched(max_batch_size%3D2%2C%20wait_ms%3D1000)%0Aasync%20def%20batch_add(xs%3A%20list%5Bint%5D%2C%20ys%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20return%20%5Bx%20%2B%20y%20for%20x%2C%20y%20in%20zip(xs%2C%20ys)%5D`,lang:`python`});var y=c(v,6);p(y,{code:`%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20inputs%20%3D%20%5B(1%2C%20300)%2C%20(2%2C%20200)%2C%20(3%2C%20100)%5D%0A%20%20%20%20async%20for%20result%20in%20batch_add.starmap.aio(inputs)%3A%0A%20%20%20%20%20%20%20%20print(f%22Sum%3A%20%7Bresult%7D%22)%0A%20%20%20%20%20%20%20%20%23%20Sum%3A%20301%0A%20%20%20%20%20%20%20%20%23%20Sum%3A%20202%0A%20%20%20%20%20%20%20%20%23%20Sum%3A%20103`,lang:`python`});var O=c(y,4);u(O,{id:`use-batched-with-functions-that-take-and-return-lists`,children:(e,t)=>{l();var n=S();l(2),i(e,n)},$$slots:{default:!0}});var k=c(O,6);u(k,{id:`modal-cls-methods-are-compatible-with-dynamic-batching`,children:(e,t)=>{l();var n=C();l(2),i(e,n)},$$slots:{default:!0}});var A=c(k,2);h(c(e(A)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);p(j,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.cls()%0Aclass%20BatchedClass()%3A%0A%20%20%20%20%40modal.batched(max_batch_size%3D2%2C%20wait_ms%3D1000)%0A%20%20%20%20async%20def%20batch_add(self%2C%20xs%3A%20list%5Bint%5D%2C%20ys%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20%20%20%20%20return%20%5Bx%20%2B%20y%20for%20x%2C%20y%20in%20zip(xs%2C%20ys)%5D`,lang:`python`});var M=c(j,4),N=e(M),P=c(e(N));h(c(e(P)),{href:`/docs/sdk/py/latest/method`,children:(e,t)=>{l(),i(e,r(`Methods`))},$$slots:{default:!0}}),n(P),l(),n(N),n(M);var F=c(M,2);u(F,{id:`configure-the-wait-time-and-batch-size-of-dynamic-batches`,children:(e,t)=>{l(),i(e,r(`Configure the wait time and batch size of dynamic batches`))},$$slots:{default:!0}});var I=c(F,8);d(I,{id:`selecting-a-batch-configuration`,children:(e,t)=>{l(),i(e,r(`Selecting a batch configuration`))},$$slots:{default:!0}});var L=c(I,6);u(L,{id:`serve-web-functions-with-dynamic-batching`,children:(e,t)=>{l(),i(e,r(`Serve Web Functions with dynamic batching`))},$$slots:{default:!0}});var R=c(L,2),z=c(e(R));h(z,{href:`/docs/guide/webhooks`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),h(c(z,2),{href:`/docs/cli/latest/serve`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(R);var B=c(R,2);p(B,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%22))%0A%0A%40app.function()%0A%40modal.batched(max_batch_size%3D2%2C%20wait_ms%3D1000)%0Aasync%20def%20batch_add(xs%3A%20list%5Bint%5D%2C%20ys%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20return%20%5Bx%20%2B%20y%20for%20x%2C%20y%20in%20zip(xs%2C%20ys)%5D%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22POST%22%2C%20docs%3DTrue)%0Aasync%20def%20add(body%3A%20dict%5Bstr%2C%20int%5D)%20-%3E%20dict%5Bstr%2C%20int%5D%3A%0A%20%20%20%20result%20%3D%20await%20batch_add.remote.aio(body%5B%22x%22%5D%2C%20body%5B%22y%22%5D)%0A%20%20%20%20return%20%7B%22result%22%3A%20result%7D`,lang:`python`}),p(c(B,4),{code:`import%20asyncio%0Aimport%20aiohttp%0A%0Aasync%20def%20send_post_request(session%2C%20url%2C%20data)%3A%0A%20%20%20%20async%20with%20session.post(url%2C%20json%3Ddata)%20as%20response%3A%0A%20%20%20%20%20%20%20%20return%20await%20response.json()%0A%0Aasync%20def%20main()%3A%0A%20%20%20%20%23%20Enter%20the%20Web%20Function%20URL%20here%0A%20%20%20%20url%20%3D%20%22https%3A%2F%2Fworkspace--app-name-endpoint-name.modal.run%22%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession()%20as%20session%3A%0A%20%20%20%20%20%20%20%20%23%20Submit%20three%20requests%20asynchronously%0A%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20send_post_request(session%2C%20url%2C%20%7B%22x%22%3A%201%2C%20%22y%22%3A%20300%7D)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20send_post_request(session%2C%20url%2C%20%7B%22x%22%3A%202%2C%20%22y%22%3A%20200%7D)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20send_post_request(session%2C%20url%2C%20%7B%22x%22%3A%203%2C%20%22y%22%3A%20100%7D)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20results%20%3D%20await%20asyncio.gather(*tasks)%0A%20%20%20%20%20%20%20%20for%20result%20in%20results%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Sum%3A%20%7Bresult%5B'result'%5D%7D%22)%0A%0Aasyncio.run(main())`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{O as default,g as metadata};
//# sourceMappingURL=1xjWAvpO2.js.map
