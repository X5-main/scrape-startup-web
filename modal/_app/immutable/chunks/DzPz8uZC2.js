(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fc1128df-1e94-406c-b42e-abc9be89cc8c`,e._sentryDebugIdIdentifier=`sentry-dbid-fc1128df-1e94-406c-b42e-abc9be89cc8c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={crossLinks:[{text:`Auto-scaling LLM inference endpoints`,href:`/docs/examples/llm_inference`},{text:`Job queue for OCR`,href:`/docs/examples/doc_ocr_jobs`},{text:`Parallel web scraping`,href:`/docs/examples/webscraper#scaling-out`}],toc:[{depth:1,value:`Scaling out`,id:`scaling-out`,children:[{depth:2,value:`How does autoscaling work on Modal?`,id:`how-does-autoscaling-work-on-modal`},{depth:2,value:`Configuring autoscaling behavior`,id:`configuring-autoscaling-behavior`},{depth:2,value:`Dynamic autoscaler updates`,id:`dynamic-autoscaler-updates`},{depth:2,value:`Parallel execution of inputs`,id:`parallel-execution-of-inputs`,children:[{depth:3,value:`Exceptions`,id:`exceptions`},{depth:3,value:`Starmap`,id:`starmap`},{depth:3,value:`Gotchas`,id:`gotchas`}]},{depth:2,value:`Asynchronous usage`,id:`asynchronous-usage`},{depth:2,value:`GPU acceleration`,id:`gpu-acceleration`},{depth:2,value:`Scaling Limits`,id:`scaling-limits`}]}],rawContent:`# Scaling out

Modal makes it easy to scale compute across thousands of containers.
You won't have to worry about your App crashing if it goes viral or need to wait
a long time for your batch jobs to complete.

For the the most part, scaling out will happen automatically, and you won't need
to think about it. But it can be helpful to understand how Modal's autoscaler
works and how you can control its behavior when you need finer control.

## How does autoscaling work on Modal?

Every Modal Function corresponds to an autoscaling pool of containers. The size
of the pool is managed by Modal's autoscaler. The autoscaler will spin up new
containers when there is no capacity available for new inputs, and it will spin
down containers when resources are idling. By default, Modal Functions will
scale to zero when there are no inputs to process.

Autoscaling decisions are made quickly and frequently so that your batch jobs
can ramp up fast and your deployed Apps can respond to any sudden changes in
traffic.

## Configuring autoscaling behavior

Modal exposes a few settings that allow you to configure the autoscaler's
behavior. These settings can be passed to the \`@app.function\` or \`@app.cls\`
decorators:

- \`max_containers\`: The upper limit on containers for the specific Function.
- \`min_containers\`: The minimum number of containers that should be kept warm,
  even when the Function is inactive.
- \`buffer_containers\`: The size of the buffer to maintain while the Function is
  active, so that additional inputs will not need to queue for a new container.
- \`scaledown_window\`: The maximum duration (in seconds) that individual
  containers can remain idle when scaling down.

In general, these settings allow you to trade off cost and latency. Maintaining
a larger warm pool or idle buffer will increase costs but reduce the chance that
inputs will need to wait for a new container to start.

Similarly, a longer scaledown window will let containers idle for longer, which
might help avoid unnecessary churn for Apps that receive regular but infrequent
inputs. Note that containers may not wait for the entire scaledown window before
shutting down if the App is substantially overprovisioned.

## Dynamic autoscaler updates

It's also possible to update the autoscaler settings dynamically (i.e., without redeploying
the App) using the [\`Function.update_autoscaler()\`](/docs/sdk/py/latest/Function#update_autoscaler)
method:

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
f.update_autoscaler(max_containers=100)
\`\`\`

The autoscaler settings will revert to the configuration in the function
decorator the next time you deploy the App. Or they can be overridden by
further dynamic updates:

\`\`\`python notest
f.update_autoscaler(min_containers=2, max_containers=10)
f.update_autoscaler(min_containers=4)  # max_containers=10 will still be in effect
\`\`\`

A common pattern is to run this method in a [scheduled function](/docs/guide/cron)
that adjusts the size of the warm pool (or container buffer) based on the time of day:

\`\`\`python
@app.function()
def inference_server():
    ...

@app.function(schedule=modal.Cron("0 6 * * *", timezone="America/New_York"))
def increase_warm_pool():
    inference_server.update_autoscaler(min_containers=4)

@app.function(schedule=modal.Cron("0 22 * * *", timezone="America/New_York"))
def decrease_warm_pool():
    inference_server.update_autoscaler(min_containers=0)
\`\`\`

When you have a [\`modal.Cls\`](/docs/sdk/py/latest/Cls), \`update_autoscaler\`
is a method on an _instance_ and will control the autoscaling behavior of
containers serving the Function with that specific set of parameters:

\`\`\`python notest
MyClass = modal.Cls.from_name("my-app", "MyClass")
obj = MyClass(model_version="3.5")
obj.update_autoscaler(buffer_containers=2)  # type: ignore
\`\`\`

Note that it's necessary to disable type checking on this line, because the
object will appear as an instance of the class that you defined rather than the
Modal wrapper type.

## Parallel execution of inputs

If your code is running the same function repeatedly with different independent
inputs (e.g., a grid search), the easiest way to increase performance is to run
those function calls in parallel using Modal's
[\`Function.map()\`](/docs/sdk/py/latest/Function#map) method.

Here is an example if we had a function \`evaluate_model\` that takes a single
argument:

\`\`\`python
import modal

app = modal.App()


@app.function()
def evaluate_model(x):
    ...


@app.local_entrypoint()
def main():
    inputs = list(range(100))
    for result in evaluate_model.map(inputs):  # runs many inputs in parallel
        ...
\`\`\`

In this example, \`evaluate_model\` will be called with each of the 100 inputs
(the numbers 0 - 99 in this case) roughly in parallel and the results are
returned as an iterable with the results ordered in the same way as the inputs.

### Exceptions

By default, if any of the function calls raises an exception, the exception will
be propagated. To treat exceptions as successful results and aggregate them in
the results list, pass in
[\`return_exceptions=True\`](/docs/sdk/py/latest/Function#map).

\`\`\`python
@app.function()
def my_func(a):
    if a == 2:
        raise Exception("ohno")
    return a ** 2

@app.local_entrypoint()
def main():
    print(list(my_func.map(range(3), return_exceptions=True)))
    # [0, 1, Exception('ohno'))]
\`\`\`

### Starmap

If your function takes multiple variable arguments, you can either use
[\`Function.map()\`](/docs/sdk/py/latest/Function#map) with one input iterator
per argument, or [\`Function.starmap()\`](/docs/sdk/py/latest/Function#starmap)
with a single input iterator containing sequences (like tuples) that can be
spread over the arguments. This works similarly to Python's built in \`map\` and
\`itertools.starmap\`.

\`\`\`python
@app.function()
def my_func(a, b):
    return a + b

@app.local_entrypoint()
def main():
    assert list(my_func.starmap([(1, 2), (3, 4)])) == [3, 7]
\`\`\`

### Gotchas

Note that \`.map()\` is a method on the modal function object itself, so you don't
explicitly _call_ the function.

Incorrect usage:

\`\`\`python notest
results = evaluate_model(inputs).map()
\`\`\`

Modal's map is also not the same as using Python's builtin \`map()\`. While the
following will technically work, it will execute all inputs in sequence rather
than in parallel.

Incorrect usage:

\`\`\`python notest
results = map(evaluate_model, inputs)
\`\`\`

## Asynchronous usage

All Modal APIs are available in both blocking and asynchronous variants. If you
are comfortable with asynchronous programming, you can use it to create
arbitrary parallel execution patterns, with the added benefit that any Modal
functions will be executed remotely. See the [async guide](/docs/guide/async) or
the examples for more information about asynchronous usage.

## GPU acceleration

Sometimes you can speed up your applications by utilizing GPU acceleration. See
the [GPU section](/docs/guide/gpu) for more information.

## Scaling Limits

Modal enforces various platform limits that affect scalability. Limits on the total number of concurrent containers (and the total number of GPUs in concurrent use) depend on your workspace's [plan level](/pricing). There is also a hard limit of 4,000 concurrent containers running for a single Function. Other limits apply at the level of individual inputs and depend on the specific Function [invocation method](/docs/guide/function-invocation-methods).
`,meta:{title:`Scaling out`,description:`Modal makes it easy to scale compute across thousands of containers. You won’t have to worry about your App crashing if it goes viral or need to wait a long time for your batch jobs to complete.`}},{crossLinks:_,toc:v,rawContent:y,meta:b}=g,x=t(`<code>Function.update_autoscaler()</code>`),S=t(`<code>modal.Cls</code>`),C=t(`<code>Function.map()</code>`),w=t(`<code>return_exceptions=True</code>`),T=t(`<code>Function.map()</code>`),E=t(`<code>Function.starmap()</code>`),D=t(`<!> <p>Modal makes it easy to scale compute across thousands of containers.
You won’t have to worry about your App crashing if it goes viral or need to wait
a long time for your batch jobs to complete.</p> <p>For the the most part, scaling out will happen automatically, and you won’t need
to think about it. But it can be helpful to understand how Modal’s autoscaler
works and how you can control its behavior when you need finer control.</p> <!> <p>Every Modal Function corresponds to an autoscaling pool of containers. The size
of the pool is managed by Modal’s autoscaler. The autoscaler will spin up new
containers when there is no capacity available for new inputs, and it will spin
down containers when resources are idling. By default, Modal Functions will
scale to zero when there are no inputs to process.</p> <p>Autoscaling decisions are made quickly and frequently so that your batch jobs
can ramp up fast and your deployed Apps can respond to any sudden changes in
traffic.</p> <!> <p>Modal exposes a few settings that allow you to configure the autoscaler’s
behavior. These settings can be passed to the <code>@app.function</code> or <code>@app.cls</code> decorators:</p> <ul><li><code>max_containers</code>: The upper limit on containers for the specific Function.</li> <li><code>min_containers</code>: The minimum number of containers that should be kept warm,
even when the Function is inactive.</li> <li><code>buffer_containers</code>: The size of the buffer to maintain while the Function is
active, so that additional inputs will not need to queue for a new container.</li> <li><code>scaledown_window</code>: The maximum duration (in seconds) that individual
containers can remain idle when scaling down.</li></ul> <p>In general, these settings allow you to trade off cost and latency. Maintaining
a larger warm pool or idle buffer will increase costs but reduce the chance that
inputs will need to wait for a new container to start.</p> <p>Similarly, a longer scaledown window will let containers idle for longer, which
might help avoid unnecessary churn for Apps that receive regular but infrequent
inputs. Note that containers may not wait for the entire scaledown window before
shutting down if the App is substantially overprovisioned.</p> <!> <p>It’s also possible to update the autoscaler settings dynamically (i.e., without redeploying
the App) using the <!> method:</p> <!> <p>The autoscaler settings will revert to the configuration in the function
decorator the next time you deploy the App. Or they can be overridden by
further dynamic updates:</p> <!> <p>A common pattern is to run this method in a <!> that adjusts the size of the warm pool (or container buffer) based on the time of day:</p> <!> <p>When you have a <!>, <code>update_autoscaler</code> is a method on an <em>instance</em> and will control the autoscaling behavior of
containers serving the Function with that specific set of parameters:</p> <!> <p>Note that it’s necessary to disable type checking on this line, because the
object will appear as an instance of the class that you defined rather than the
Modal wrapper type.</p> <!> <p>If your code is running the same function repeatedly with different independent
inputs (e.g., a grid search), the easiest way to increase performance is to run
those function calls in parallel using Modal’s <!> method.</p> <p>Here is an example if we had a function <code>evaluate_model</code> that takes a single
argument:</p> <!> <p>In this example, <code>evaluate_model</code> will be called with each of the 100 inputs
(the numbers 0 - 99 in this case) roughly in parallel and the results are
returned as an iterable with the results ordered in the same way as the inputs.</p> <!> <p>By default, if any of the function calls raises an exception, the exception will
be propagated. To treat exceptions as successful results and aggregate them in
the results list, pass in <!>.</p> <!> <!> <p>If your function takes multiple variable arguments, you can either use <!> with one input iterator
per argument, or <!> with a single input iterator containing sequences (like tuples) that can be
spread over the arguments. This works similarly to Python’s built in <code>map</code> and <code>itertools.starmap</code>.</p> <!> <!> <p>Note that <code>.map()</code> is a method on the modal function object itself, so you don’t
explicitly <em>call</em> the function.</p> <p>Incorrect usage:</p> <!> <p>Modal’s map is also not the same as using Python’s builtin <code>map()</code>. While the
following will technically work, it will execute all inputs in sequence rather
than in parallel.</p> <p>Incorrect usage:</p> <!> <!> <p>All Modal APIs are available in both blocking and asynchronous variants. If you
are comfortable with asynchronous programming, you can use it to create
arbitrary parallel execution patterns, with the added benefit that any Modal
functions will be executed remotely. See the <!> or
the examples for more information about asynchronous usage.</p> <!> <p>Sometimes you can speed up your applications by utilizing GPU acceleration. See
the <!> for more information.</p> <!> <p>Modal enforces various platform limits that affect scalability. Limits on the total number of concurrent containers (and the total number of GPUs in concurrent use) depend on your workspace’s <!>. There is also a hard limit of 4,000 concurrent containers running for a single Function. Other limits apply at the level of individual inputs and depend on the specific Function <!>.</p>`,1);function O(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=D(),m=s(o);f(m,{id:`scaling-out`,children:(e,t)=>{l(),i(e,r(`Scaling out`))},$$slots:{default:!0}});var g=c(m,6);u(g,{id:`how-does-autoscaling-work-on-modal`,children:(e,t)=>{l(),i(e,r(`How does autoscaling work on Modal?`))},$$slots:{default:!0}});var _=c(g,6);u(_,{id:`configuring-autoscaling-behavior`,children:(e,t)=>{l(),i(e,r(`Configuring autoscaling behavior`))},$$slots:{default:!0}});var v=c(_,10);u(v,{id:`dynamic-autoscaler-updates`,children:(e,t)=>{l(),i(e,r(`Dynamic autoscaler updates`))},$$slots:{default:!0}});var y=c(v,2);h(c(e(y)),{href:`/docs/sdk/py/latest/Function#update_autoscaler`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);p(b,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Af.update_autoscaler(max_containers%3D100)`,lang:`python`});var O=c(b,4);p(O,{code:`f.update_autoscaler(min_containers%3D2%2C%20max_containers%3D10)%0Af.update_autoscaler(min_containers%3D4)%20%20%23%20max_containers%3D10%20will%20still%20be%20in%20effect`,lang:`python`});var k=c(O,2);h(c(e(k)),{href:`/docs/guide/cron`,children:(e,t)=>{l(),i(e,r(`scheduled function`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);p(A,{code:`%40app.function()%0Adef%20inference_server()%3A%0A%20%20%20%20...%0A%0A%40app.function(schedule%3Dmodal.Cron(%220%206%20*%20*%20*%22%2C%20timezone%3D%22America%2FNew_York%22))%0Adef%20increase_warm_pool()%3A%0A%20%20%20%20inference_server.update_autoscaler(min_containers%3D4)%0A%0A%40app.function(schedule%3Dmodal.Cron(%220%2022%20*%20*%20*%22%2C%20timezone%3D%22America%2FNew_York%22))%0Adef%20decrease_warm_pool()%3A%0A%20%20%20%20inference_server.update_autoscaler(min_containers%3D0)`,lang:`python`});var j=c(A,2);h(c(e(j)),{href:`/docs/sdk/py/latest/Cls`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(5),n(j);var M=c(j,2);p(M,{code:`MyClass%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22MyClass%22)%0Aobj%20%3D%20MyClass(model_version%3D%223.5%22)%0Aobj.update_autoscaler(buffer_containers%3D2)%20%20%23%20type%3A%20ignore`,lang:`python`});var N=c(M,4);u(N,{id:`parallel-execution-of-inputs`,children:(e,t)=>{l(),i(e,r(`Parallel execution of inputs`))},$$slots:{default:!0}});var P=c(N,2);h(c(e(P)),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(P);var F=c(P,4);p(F,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function()%0Adef%20evaluate_model(x)%3A%0A%20%20%20%20...%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20inputs%20%3D%20list(range(100))%0A%20%20%20%20for%20result%20in%20evaluate_model.map(inputs)%3A%20%20%23%20runs%20many%20inputs%20in%20parallel%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var I=c(F,4);d(I,{id:`exceptions`,children:(e,t)=>{l(),i(e,r(`Exceptions`))},$$slots:{default:!0}});var L=c(I,2);h(c(e(L)),{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(L);var R=c(L,2);p(R,{code:`%40app.function()%0Adef%20my_func(a)%3A%0A%20%20%20%20if%20a%20%3D%3D%202%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%22ohno%22)%0A%20%20%20%20return%20a%20**%202%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20print(list(my_func.map(range(3)%2C%20return_exceptions%3DTrue)))%0A%20%20%20%20%23%20%5B0%2C%201%2C%20Exception('ohno'))%5D`,lang:`python`});var z=c(R,2);d(z,{id:`starmap`,children:(e,t)=>{l(),i(e,r(`Starmap`))},$$slots:{default:!0}});var B=c(z,2),V=c(e(B));h(V,{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),h(c(V,2),{href:`/docs/sdk/py/latest/Function#starmap`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(5),n(B);var H=c(B,2);p(H,{code:`%40app.function()%0Adef%20my_func(a%2C%20b)%3A%0A%20%20%20%20return%20a%20%2B%20b%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20assert%20list(my_func.starmap(%5B(1%2C%202)%2C%20(3%2C%204)%5D))%20%3D%3D%20%5B3%2C%207%5D`,lang:`python`});var U=c(H,2);d(U,{id:`gotchas`,children:(e,t)=>{l(),i(e,r(`Gotchas`))},$$slots:{default:!0}});var W=c(U,6);p(W,{code:`results%20%3D%20evaluate_model(inputs).map()`,lang:`python`});var G=c(W,6);p(G,{code:`results%20%3D%20map(evaluate_model%2C%20inputs)`,lang:`python`});var K=c(G,2);u(K,{id:`asynchronous-usage`,children:(e,t)=>{l(),i(e,r(`Asynchronous usage`))},$$slots:{default:!0}});var q=c(K,2);h(c(e(q)),{href:`/docs/guide/async`,children:(e,t)=>{l(),i(e,r(`async guide`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,2);u(J,{id:`gpu-acceleration`,children:(e,t)=>{l(),i(e,r(`GPU acceleration`))},$$slots:{default:!0}});var Y=c(J,2);h(c(e(Y)),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU section`))},$$slots:{default:!0}}),l(),n(Y);var X=c(Y,2);u(X,{id:`scaling-limits`,children:(e,t)=>{l(),i(e,r(`Scaling Limits`))},$$slots:{default:!0}});var Z=c(X,2),Q=c(e(Z));h(Q,{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`plan level`))},$$slots:{default:!0}}),h(c(Q,2),{href:`/docs/guide/function-invocation-methods`,children:(e,t)=>{l(),i(e,r(`invocation method`))},$$slots:{default:!0}}),l(),n(Z),i(t,o)},$$slots:{default:!0}}))}export{O as default,g as metadata};
//# sourceMappingURL=DzPz8uZC2.js.map
