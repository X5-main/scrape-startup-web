(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3139cd59-1c83-46e7-90f7-986eae05dec3`,e._sentryDebugIdIdentifier=`sentry-dbid-3139cd59-1c83-46e7-90f7-986eae05dec3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Function invocation methods`,id:`function-invocation-methods`,children:[{depth:2,value:`Synchronous vs. asynchronous`,id:`synchronous-vs-asynchronous`,children:[{depth:3,value:`Scalability`,id:`scalability`},{depth:3,value:`Durability`,id:`durability`},{depth:3,value:`Latency`,id:`latency`}]},{depth:2,value:`Singular vs. batched`,id:`singular-vs-batched`},{depth:2,value:`Invocation methods`,id:`invocation-methods`,children:[{depth:3,value:`Function.remote`,id:`functionremote`},{depth:3,value:`Function.spawn`,id:`functionspawn`},{depth:3,value:`Function.map`,id:`functionmap`},{depth:3,value:`Function.spawn_map`,id:`functionspawn_map`},{depth:3,value:`Function.local`,id:`functionlocal`}]}]}],rawContent:`# Function invocation methods

Modal [Functions](/docs/guide/functions) expose several different invocation methods. These methods have semantics that vary across multiple dimensions. Understanding how they vary will let you choose the method that is most appropriate for particular use cases.

## Synchronous vs. asynchronous

Function invocations are either synchronous or asynchronous from the perspective of the calling process. Synchronous methods wait for the remote process to complete before returning the result, while asynchronous methods send the input and immediately return a [\`modal.FunctionCall\`](/docs/sdk/py/latest/FunctionCall) handle. This handle can be used to poll for progress or retrieve the result at a later time.

Note that this synchronous/asynchronous distinction is unrelated to Modal's [\`.aio\` interface](/docs/guide/async). The \`.aio\` interface affects only the mechanism of execution in the local process, not how the call is handled by Modal's systems. It also does not matter whether the Function's implementation is written using async Python.

Synchronous and asynchronous invocations differ in terms of their scalability, durability, and latency.

### Scalability

Synchronous invocations are subject to stricter platform limits:

- No more than 2,000 synchronous inputs may be queued and waiting for a container at any one time.
- No more than 25,000 synchronous inputs in total may be in the system (queued or running) at any one time.

In contrast, up to 1 million inputs can be queued for asynchronous execution, so asynchronous methods are a better choice whenever you have a large batch of inputs to process.

Function calls are also subject to _rate_ limits, which are higher for asynchronous invocations. As a baseline, Modal supports synchronous invocations at a rate of 200/s and asynchronous invocations at a rate of 1,500/s.

If a function call exceeds any of these limits, it will be rejected with a [\`ResourceExhaustedError\`](/docs/sdk/py/latest/exception#resourceexhaustederror). In some cases, the Modal SDK will handle this error and retry with backoff, adding latency. The exception may also be propagated to user code.

### Durability

Inputs sent via asynchronous methods are more durable. Asynchronous function calls are "fire-and-forget" and will continue running if the calling process exits, but synchronous invocations will be cancelled within two minutes after the caller hangs up.

The result payload for asynchronous invocations will be stored for 7 days, although the input payload will be discarded after the call completes successfully. Synchronous invocations are not stored in Modal's systems after being sent back to the caller.

### Latency

Because they are handled more durably, asynchronous invocations have higher latency. For many compute-intensive applications, the difference will be negligible, but latency-sensitive applications should prefer synchronous invocation methods.

Note that the synchronous I/O system still imposes some overhead to support its stateful input queue. Where request latency is at an absolute premium, prefer using Modal's [Server](/docs/guide/servers) primitive instead.

## Singular vs. batched

Several invocation methods accept a _batch_ of inputs rather than a single input payload. These methods abstract away the mechanics involved in efficiently and reliably sending multiple inputs to Modal.

Note that each input in the batch will still be _handled_ separately: this is a distinct concept from [dynamic batching](/docs/guide/dynamic-batching).

## Invocation methods

The primary [\`modal.Function\`](/docs/sdk/py/latest/Function) invocation methods occupy the following positions in a 2x2 matrix:

|          | Synchronous                                                | Asynchronous                                                     |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Singular | [\`Function.remote()\`](/docs/sdk/py/latest/Function#remote) | [\`Function.spawn()\`](/docs/sdk/py/latest/Function#spawn)         |
| Batched  | [\`Function.map()\`](/docs/sdk/py/latest/Function#map)       | [\`Function.spawn_map()\`](/docs/sdk/py/latest/Function#spawn_map) |

### \`Function.remote\`

Invoking a Function with [\`Function.remote()\`](/docs/sdk/py/latest/Function#remote) makes a synchronous call, sending the input payload and waiting for the remote process to complete before returning. It is the most basic method for running compute on Modal because its semantics are closest to a local function call:

\`\`\`python
@app.function()
def f(x: int) -> int:
    return x ** 2


@app.local_entrypoint()
def main():
    res = f.remote(2)
    assert res == 4
\`\`\`

The related [\`Function.remote_gen()\`](/docs/sdk/py/latest/Function#remote_gen) method also sends the input synchronously, but it works when the remote Function is a generator that yields results back to the caller:

\`\`\`python
@app.function()
def g(x: int) -> int:
    for n in range(4):
        yield x ** n

@app.local_entrypoint()
def main():
    res = g.remote_gen(2)
    assert list(res) == [1, 2, 4, 8]
\`\`\`

### \`Function.spawn\`

The asynchronous [\`Function.spawn()\`](/docs/sdk/py/latest/Function#spawn) method sends its input to the Function and immediately returns a [\`modal.FunctionCall\`](/docs/sdk/py/latest/FunctionCall) object representing that input.

You can retrieve the result by calling [\`FunctionCall.get()\`](/docs/sdk/py/latest/FunctionCall#get):

\`\`\`python
def spawn_and_fetch(x):
    fc = f.spawn(x)
    return fc.get()
\`\`\`

By default, [\`FunctionCall.get()\`](/docs/sdk/py/latest/FunctionCall#get) will block until the result is available. This is similar to synchronous invocation, although it trades off some latency for scalability and durability. You can also pass a timeout to implement a polling pattern:

\`\`\`python
def spawn_and_poll(x):
    fc = f.spawn(x)
    while True:
        try:
            return fc.get(timeout=1)
        except TimeoutError:
            print("Not finished yet")
\`\`\`

For long-running Functions, you may not want the calling process to wait until the result is available. To facilitate this, you can store the FunctionCall's object ID and use it to fetch the result in another context:

\`\`\`python
def spawn_input(x):
    fc = f.spawn(x)
    return fc.object_id

def fetch_result(fc_id):
    fc = modal.FunctionCall.from_id(fc_id)
    return fc.get()
\`\`\`

Because it offers increased scalability and durability, [\`Function.spawn()\`](/docs/sdk/py/latest/Function#spawn) is often a better choice than [\`Function.remote()\`](/docs/sdk/py/latest/Function#remote) for compute-intensive applications, especially those that require high fan-out or complex orchestration.

### \`Function.map\`

The batched [\`Function.map()\`](/docs/sdk/py/latest/Function#map) method makes it easy to leverage Modal's horizontal scalability by consuming an iterable of inputs in a single invocation:

\`\`\`python
@app.function()
def f(x: int) -> int:
    return x ** 2

@app.local_entrypoint()
def main():
    res = f.map(range(1, 5))
    assert list(res) == [1, 4, 9, 16]
\`\`\`

Modal will spin up multiple containers to process the map in parallel.

The [\`Function.map()\`](/docs/sdk/py/latest/Function#map) invocation is synchronous, which has consequences for its scalability. Input submission is subject to the rate limits mentioned [above](#scalability), and each invocation can run at most 1,000 inputs concurrently. For convenience, the Modal SDK internally handles system back-pressure to avoid tripping limits on input submission rate or input queue depth while running a map. But the limits may prevent [\`Function.map()\`](/docs/sdk/py/latest/Function#map) invocations from immediately scaling up and utilizing available container capacity.

The [\`Function.starmap()\`](/docs/sdk/py/latest/Function#starmap) method has equivalent semantics, but it consumes an iterable where each entry is a _sequence of arguments_, effectively doing \`[f.remote(*args) for args in input_list]\` in parallel.

### \`Function.spawn_map\`

The [\`Function.spawn_map()\`](/docs/sdk/py/latest/Function#spawn_map) method combines the asynchronous semantics of [\`Function.spawn()\`](/docs/sdk/py/latest/Function#spawn) with the batched semantics of [\`Function.map\`](/docs/sdk/py/latest/Function#map). Like [\`Function.map\`](/docs/sdk/py/latest/Function#map), it applies the Function to each entry in an iterable of inputs:

\`\`\`python
def load_inputs(filenames):
    for fname in filenames:
        yield load(fname)

def spawn_batch(filenames):
    f.spawn_map(load_inputs(filenames))
\`\`\`

Because platform limits are higher for asynchronous invocations, [\`Function.spawn_map\`](/docs/sdk/py/latest/Function#spawn_map) sends the entire iterable of inputs as fast as possible, taking maximum advantage of Modal's elastic compute.

As yet, [\`Function.spawn_map()\`](/docs/sdk/py/latest/Function#spawn_map) does not return a FunctionCall handle, so it is currently useful only when the Function has side effects like writing its result to durable storage. This will be improved in the future.

### \`Function.local\`

Unlike the other methods, [\`Function.local()\`](/docs/sdk/py/latest/Function#local) always executes in the same environment as the caller (whether that is on your system or inside a Modal container). Invoking [\`Function.local()\`](/docs/sdk/py/latest/Function#local) is equivalent to calling the unwrapped underlying function directly; none of the Modal configuration will apply.
`,meta:{title:`Function invocation methods`,description:`Modal Functions expose several different invocation methods. These methods have semantics that vary across multiple dimensions. Understanding how they vary will let you choose the method that is most appropriate for particular use cases.`}},{toc:v,rawContent:y,meta:b}=_,ee=t(`<code>modal.FunctionCall</code>`),te=t(`<code>.aio</code> interface`,1),ne=t(`<code>ResourceExhaustedError</code>`),re=t(`<code>modal.Function</code>`),ie=t(`<code>Function.remote()</code>`),ae=t(`<code>Function.spawn()</code>`),oe=t(`<code>Function.map()</code>`),se=t(`<code>Function.spawn_map()</code>`),ce=t(`<thead><tr><th></th><th>Synchronous</th><th>Asynchronous</th></tr></thead> <tbody><tr><td>Singular</td><td><!></td><td><!></td></tr><tr><td>Batched</td><td><!></td><td><!></td></tr></tbody>`,1),le=t(`<code>Function.remote</code>`),ue=t(`<code>Function.remote()</code>`),de=t(`<code>Function.remote_gen()</code>`),fe=t(`<code>Function.spawn</code>`),pe=t(`<code>Function.spawn()</code>`),me=t(`<code>modal.FunctionCall</code>`),he=t(`<code>FunctionCall.get()</code>`),ge=t(`<code>FunctionCall.get()</code>`),_e=t(`<code>Function.spawn()</code>`),ve=t(`<code>Function.remote()</code>`),ye=t(`<code>Function.map</code>`),be=t(`<code>Function.map()</code>`),xe=t(`<code>Function.map()</code>`),Se=t(`<code>Function.map()</code>`),Ce=t(`<code>Function.starmap()</code>`),we=t(`<code>Function.spawn_map</code>`),Te=t(`<code>Function.spawn_map()</code>`),Ee=t(`<code>Function.spawn()</code>`),De=t(`<code>Function.map</code>`),Oe=t(`<code>Function.map</code>`),ke=t(`<code>Function.spawn_map</code>`),Ae=t(`<code>Function.spawn_map()</code>`),je=t(`<code>Function.local</code>`),Me=t(`<code>Function.local()</code>`),Ne=t(`<code>Function.local()</code>`),Pe=t(`<!> <p>Modal <!> expose several different invocation methods. These methods have semantics that vary across multiple dimensions. Understanding how they vary will let you choose the method that is most appropriate for particular use cases.</p> <!> <p>Function invocations are either synchronous or asynchronous from the perspective of the calling process. Synchronous methods wait for the remote process to complete before returning the result, while asynchronous methods send the input and immediately return a <!> handle. This handle can be used to poll for progress or retrieve the result at a later time.</p> <p>Note that this synchronous/asynchronous distinction is unrelated to Modal’s <!>. The <code>.aio</code> interface affects only the mechanism of execution in the local process, not how the call is handled by Modal’s systems. It also does not matter whether the Function’s implementation is written using async Python.</p> <p>Synchronous and asynchronous invocations differ in terms of their scalability, durability, and latency.</p> <!> <p>Synchronous invocations are subject to stricter platform limits:</p> <ul><li>No more than 2,000 synchronous inputs may be queued and waiting for a container at any one time.</li> <li>No more than 25,000 synchronous inputs in total may be in the system (queued or running) at any one time.</li></ul> <p>In contrast, up to 1 million inputs can be queued for asynchronous execution, so asynchronous methods are a better choice whenever you have a large batch of inputs to process.</p> <p>Function calls are also subject to <em>rate</em> limits, which are higher for asynchronous invocations. As a baseline, Modal supports synchronous invocations at a rate of 200/s and asynchronous invocations at a rate of 1,500/s.</p> <p>If a function call exceeds any of these limits, it will be rejected with a <!>. In some cases, the Modal SDK will handle this error and retry with backoff, adding latency. The exception may also be propagated to user code.</p> <!> <p>Inputs sent via asynchronous methods are more durable. Asynchronous function calls are “fire-and-forget” and will continue running if the calling process exits, but synchronous invocations will be cancelled within two minutes after the caller hangs up.</p> <p>The result payload for asynchronous invocations will be stored for 7 days, although the input payload will be discarded after the call completes successfully. Synchronous invocations are not stored in Modal’s systems after being sent back to the caller.</p> <!> <p>Because they are handled more durably, asynchronous invocations have higher latency. For many compute-intensive applications, the difference will be negligible, but latency-sensitive applications should prefer synchronous invocation methods.</p> <p>Note that the synchronous I/O system still imposes some overhead to support its stateful input queue. Where request latency is at an absolute premium, prefer using Modal’s <!> primitive instead.</p> <!> <p>Several invocation methods accept a <em>batch</em> of inputs rather than a single input payload. These methods abstract away the mechanics involved in efficiently and reliably sending multiple inputs to Modal.</p> <p>Note that each input in the batch will still be <em>handled</em> separately: this is a distinct concept from <!>.</p> <!> <p>The primary <!> invocation methods occupy the following positions in a 2x2 matrix:</p> <!> <!> <p>Invoking a Function with <!> makes a synchronous call, sending the input payload and waiting for the remote process to complete before returning. It is the most basic method for running compute on Modal because its semantics are closest to a local function call:</p> <!> <p>The related <!> method also sends the input synchronously, but it works when the remote Function is a generator that yields results back to the caller:</p> <!> <!> <p>The asynchronous <!> method sends its input to the Function and immediately returns a <!> object representing that input.</p> <p>You can retrieve the result by calling <!>:</p> <!> <p>By default, <!> will block until the result is available. This is similar to synchronous invocation, although it trades off some latency for scalability and durability. You can also pass a timeout to implement a polling pattern:</p> <!> <p>For long-running Functions, you may not want the calling process to wait until the result is available. To facilitate this, you can store the FunctionCall’s object ID and use it to fetch the result in another context:</p> <!> <p>Because it offers increased scalability and durability, <!> is often a better choice than <!> for compute-intensive applications, especially those that require high fan-out or complex orchestration.</p> <!> <p>The batched <!> method makes it easy to leverage Modal’s horizontal scalability by consuming an iterable of inputs in a single invocation:</p> <!> <p>Modal will spin up multiple containers to process the map in parallel.</p> <p>The <!> invocation is synchronous, which has consequences for its scalability. Input submission is subject to the rate limits mentioned <!>, and each invocation can run at most 1,000 inputs concurrently. For convenience, the Modal SDK internally handles system back-pressure to avoid tripping limits on input submission rate or input queue depth while running a map. But the limits may prevent <!> invocations from immediately scaling up and utilizing available container capacity.</p> <p>The <!> method has equivalent semantics, but it consumes an iterable where each entry is a <em>sequence of arguments</em>, effectively doing <code>[f.remote(*args) for args in input_list]</code> in parallel.</p> <!> <p>The <!> method combines the asynchronous semantics of <!> with the batched semantics of <!>. Like <!>, it applies the Function to each entry in an iterable of inputs:</p> <!> <p>Because platform limits are higher for asynchronous invocations, <!> sends the entire iterable of inputs as fast as possible, taking maximum advantage of Modal’s elastic compute.</p> <p>As yet, <!> does not return a FunctionCall handle, so it is currently useful only when the Function has side effects like writing its result to durable storage. This will be improved in the future.</p> <!> <p>Unlike the other methods, <!> always executes in the same environment as the caller (whether that is on your system or inside a Modal container). Invoking <!> is equivalent to calling the unwrapped underlying function directly; none of the Modal configuration will apply.</p>`,1);function x(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=Pe(),h=s(o);f(h,{id:`function-invocation-methods`,children:(e,t)=>{l(),i(e,r(`Function invocation methods`))},$$slots:{default:!0}});var _=c(h,2);g(c(e(_)),{href:`/docs/guide/functions`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`synchronous-vs-asynchronous`,children:(e,t)=>{l(),i(e,r(`Synchronous vs. asynchronous`))},$$slots:{default:!0}});var y=c(v,2);g(c(e(y)),{href:`/docs/sdk/py/latest/FunctionCall`,children:(e,t)=>{i(e,ee())},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);g(c(e(b)),{href:`/docs/guide/async`,children:(e,t)=>{var n=te();l(),i(e,n)},$$slots:{default:!0}}),l(3),n(b);var x=c(b,4);d(x,{id:`scalability`,children:(e,t)=>{l(),i(e,r(`Scalability`))},$$slots:{default:!0}});var S=c(x,10);g(c(e(S)),{href:`/docs/sdk/py/latest/exception#resourceexhaustederror`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(C,{id:`durability`,children:(e,t)=>{l(),i(e,r(`Durability`))},$$slots:{default:!0}});var w=c(C,6);d(w,{id:`latency`,children:(e,t)=>{l(),i(e,r(`Latency`))},$$slots:{default:!0}});var T=c(w,4);g(c(e(T)),{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Server`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);u(E,{id:`singular-vs-batched`,children:(e,t)=>{l(),i(e,r(`Singular vs. batched`))},$$slots:{default:!0}});var D=c(E,4);g(c(e(D),3),{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{l(),i(e,r(`dynamic batching`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);u(O,{id:`invocation-methods`,children:(e,t)=>{l(),i(e,r(`Invocation methods`))},$$slots:{default:!0}});var k=c(O,2);g(c(e(k)),{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);p(A,{children:(t,r)=>{var a=ce(),o=c(s(a),2),l=e(o),u=c(e(l));g(e(u),{href:`/docs/sdk/py/latest/Function#remote`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),n(u);var d=c(u);g(e(d),{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),n(d),n(l);var f=c(l),p=c(e(f));g(e(p),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),n(p);var m=c(p);g(e(m),{href:`/docs/sdk/py/latest/Function#spawn_map`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),n(m),n(f),n(o),i(t,a)},$$slots:{default:!0}});var j=c(A,2);d(j,{id:`functionremote`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}});var M=c(j,2);g(c(e(M)),{href:`/docs/sdk/py/latest/Function#remote`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);m(N,{code:`%40app.function()%0Adef%20f(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20return%20x%20**%202%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20res%20%3D%20f.remote(2)%0A%20%20%20%20assert%20res%20%3D%3D%204`,lang:`python`});var P=c(N,2);g(c(e(P)),{href:`/docs/sdk/py/latest/Function#remote_gen`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);m(F,{code:`%40app.function()%0Adef%20g(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20for%20n%20in%20range(4)%3A%0A%20%20%20%20%20%20%20%20yield%20x%20**%20n%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20res%20%3D%20g.remote_gen(2)%0A%20%20%20%20assert%20list(res)%20%3D%3D%20%5B1%2C%202%2C%204%2C%208%5D`,lang:`python`});var I=c(F,2);d(I,{id:`functionspawn`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}});var L=c(I,2),R=c(e(L));g(R,{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),g(c(R,2),{href:`/docs/sdk/py/latest/FunctionCall`,children:(e,t)=>{i(e,me())},$$slots:{default:!0}}),l(),n(L);var z=c(L,2);g(c(e(z)),{href:`/docs/sdk/py/latest/FunctionCall#get`,children:(e,t)=>{i(e,he())},$$slots:{default:!0}}),l(),n(z);var B=c(z,2);m(B,{code:`def%20spawn_and_fetch(x)%3A%0A%20%20%20%20fc%20%3D%20f.spawn(x)%0A%20%20%20%20return%20fc.get()`,lang:`python`});var V=c(B,2);g(c(e(V)),{href:`/docs/sdk/py/latest/FunctionCall#get`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}}),l(),n(V);var H=c(V,2);m(H,{code:`def%20spawn_and_poll(x)%3A%0A%20%20%20%20fc%20%3D%20f.spawn(x)%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fc.get(timeout%3D1)%0A%20%20%20%20%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Not%20finished%20yet%22)`,lang:`python`});var U=c(H,4);m(U,{code:`def%20spawn_input(x)%3A%0A%20%20%20%20fc%20%3D%20f.spawn(x)%0A%20%20%20%20return%20fc.object_id%0A%0Adef%20fetch_result(fc_id)%3A%0A%20%20%20%20fc%20%3D%20modal.FunctionCall.from_id(fc_id)%0A%20%20%20%20return%20fc.get()`,lang:`python`});var W=c(U,2),G=c(e(W));g(G,{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,_e())},$$slots:{default:!0}}),g(c(G,2),{href:`/docs/sdk/py/latest/Function#remote`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}}),l(),n(W);var Fe=c(W,2);d(Fe,{id:`functionmap`,children:(e,t)=>{i(e,ye())},$$slots:{default:!0}});var K=c(Fe,2);g(c(e(K)),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,be())},$$slots:{default:!0}}),l(),n(K);var Ie=c(K,2);m(Ie,{code:`%40app.function()%0Adef%20f(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20return%20x%20**%202%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20res%20%3D%20f.map(range(1%2C%205))%0A%20%20%20%20assert%20list(res)%20%3D%3D%20%5B1%2C%204%2C%209%2C%2016%5D`,lang:`python`});var q=c(Ie,4),Le=c(e(q));g(Le,{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,xe())},$$slots:{default:!0}});var Re=c(Le,2);g(Re,{href:`#scalability`,children:(e,t)=>{l(),i(e,r(`above`))},$$slots:{default:!0}}),g(c(Re,2),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,Se())},$$slots:{default:!0}}),l(),n(q);var J=c(q,2);g(c(e(J)),{href:`/docs/sdk/py/latest/Function#starmap`,children:(e,t)=>{i(e,Ce())},$$slots:{default:!0}}),l(5),n(J);var ze=c(J,2);d(ze,{id:`functionspawn_map`,children:(e,t)=>{i(e,we())},$$slots:{default:!0}});var Y=c(ze,2),Be=c(e(Y));g(Be,{href:`/docs/sdk/py/latest/Function#spawn_map`,children:(e,t)=>{i(e,Te())},$$slots:{default:!0}});var X=c(Be,2);g(X,{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,Ee())},$$slots:{default:!0}});var Ve=c(X,2);g(Ve,{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,De())},$$slots:{default:!0}}),g(c(Ve,2),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,Oe())},$$slots:{default:!0}}),l(),n(Y);var He=c(Y,2);m(He,{code:`def%20load_inputs(filenames)%3A%0A%20%20%20%20for%20fname%20in%20filenames%3A%0A%20%20%20%20%20%20%20%20yield%20load(fname)%0A%0Adef%20spawn_batch(filenames)%3A%0A%20%20%20%20f.spawn_map(load_inputs(filenames))`,lang:`python`});var Z=c(He,2);g(c(e(Z)),{href:`/docs/sdk/py/latest/Function#spawn_map`,children:(e,t)=>{i(e,ke())},$$slots:{default:!0}}),l(),n(Z);var Q=c(Z,2);g(c(e(Q)),{href:`/docs/sdk/py/latest/Function#spawn_map`,children:(e,t)=>{i(e,Ae())},$$slots:{default:!0}}),l(),n(Q);var Ue=c(Q,2);d(Ue,{id:`functionlocal`,children:(e,t)=>{i(e,je())},$$slots:{default:!0}});var We=c(Ue,2),$=c(e(We));g($,{href:`/docs/sdk/py/latest/Function#local`,children:(e,t)=>{i(e,Me())},$$slots:{default:!0}}),g(c($,2),{href:`/docs/sdk/py/latest/Function#local`,children:(e,t)=>{i(e,Ne())},$$slots:{default:!0}}),l(),n(We),i(t,o)},$$slots:{default:!0}}))}export{x as default,_ as metadata};
//# sourceMappingURL=Bn7urHfp.js.map
