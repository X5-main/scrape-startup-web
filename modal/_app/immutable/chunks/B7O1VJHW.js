(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9451e448-e40b-48e7-963b-f2dbf3121541`,e._sentryDebugIdIdentifier=`sentry-dbid-9451e448-e40b-48e7-963b-f2dbf3121541`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as ne}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";import{t as re}from"./D0Ft4u302.js";var f={toc:[{depth:1,value:`Modal Functions`,id:`modal-functions`,children:[{depth:2,value:`Configuring the Function runtime`,id:`configuring-the-function-runtime`},{depth:2,value:`Function invocation`,id:`function-invocation`},{depth:2,value:`Execution semantics`,id:`execution-semantics`},{depth:2,value:`Autoscaling and parallelism`,id:`autoscaling-and-parallelism`},{depth:2,value:`Container lifecycle management`,id:`container-lifecycle-management`},{depth:2,value:`Function parametrization`,id:`function-parametrization`},{depth:2,value:`Dynamic configuration`,id:`dynamic-configuration`},{depth:2,value:`Concurrency and batching`,id:`concurrency-and-batching`}]}],rawContent:`# Modal Functions



Modal Functions execute Python code using highly scalable serverless cloud compute.

Preparing a function to run on Modal is as simple as defining an [App](/docs/guide/apps) and registering the function using the [\`@app.function()\`](/docs/sdk/py/latest/App#function) decorator:

\`\`\`python
app = modal.App("basic-function")

@app.function()
def f(x: int, exp: int) -> int:
    return x**exp
\`\`\`

The wrapped function becomes a [\`modal.Function\`](/docs/sdk/py/latest/Function) that can be called from a local script or deployed and invoked on demand from other applications as if it were part of their codebase.

When you invoke the Function, Modal handles all of the operational details: booting a container, routing your inputs, and propagating any exceptions. If you don't send more inputs, the Function will automatically scale to zero so that it incurs no ongoing cost. Information about the Function invocation, any logs it produced, and a rich set of container metrics are automatically captured and presented across a number of observability surfaces.

## Configuring the Function runtime

The Function runtime is configured via arguments to the [\`@app.function()\`](/docs/sdk/py/latest/App#function) decorator. Everything about the container environment and the resources available to the Function can be defined within your Python codebase, without reference to external configuration files.

Functions receive a baseline allotment of [CPU and memory](/docs/guide/resources). Explicit resource configuration is not necessary for simple tasks, because Functions can opportunistically burst above this baseline when needed. Heavier jobs can be provisioned with additional resources to guarantee availability:

\`\`\`python
@app.function(cpu=16, memory=32768)  # 16 physical cores, 32 GiB of RAM
def f():
    ...
\`\`\`

Functions can also be provisioned with one or more [GPUs](/docs/guide/gpu):

\`\`\`python
@app.function(gpu="H200:8")
def f():
    ...
\`\`\`

Functions execute within arbitrary container environments, as defined by the Function's [Image](/docs/guide/images). Each Function in the App can have its own Image. Images can include resources including Python libraries from PyPI or private repositories, binary dependencies like FFmpeg or OpenCV, and data copied from your local system:

\`\`\`python
image  = (
    modal.Image.debian_slim()
    .uv_sync()
    .apt_install("ffmpeg")
    .add_local_dir("data", "/data")
)

@app.function(image=image)
def f():
    ...
\`\`\`

If the Function is provisioned with a GPU, the [CUDA drivers](/docs/guide/cuda) are automatically included.

Modal includes the Function's source in the container by default. Depending on the [project structure](/docs/guide/project-structure), this will be either the script file or entire package where the Function's implementation is defined. As a consequence, Functions do not need to be self-contained and can reference other resources in their module.

Larger datasets, such as model weights, can be mounted into the container using a Modal [Volume](/docs/guide/volumes) or [CloudBucketMount](/docs/guide/cloud-bucket-mounts):

\`\`\`python
vol = modal.Volume.from_name("model-weights")

@app.function(volumes={"/models": vol})
def f():
    ...
\`\`\`

Environment variables can be defined in the container runtime by passing them as secure [Secrets](/docs/guide/secrets) or by setting them directly:

\`\`\`python
api_key = modal.Secret.from_name("api-key")

@app.function(secrets=[api_key], env={"LOG_LEVEL": "info"})
def f():
    ...
\`\`\`

## Function invocation

Modal Functions are called by one of their [invocation methods](/docs/guide/function-invocation-methods), such as [\`f.remote()\`](/docs/sdk/py/latest/Function#remote) or [\`f.spawn()\`](/docs/sdk/py/latest/Function#spawn). When referenced by another Function or local entrypoint in the same App, a Function can be invoked directly:

\`\`\`python
@app.function()
def f() -> str:
    return "Hello from a Modal container"

@app.function()
def g() -> str:
    return f.remote()

@app.local_entrypoint()
def main():
    print(g.remote())
\`\`\`

Functions can be invoked from another App or from outside of Modal after a [lookup](/docs/guide/trigger-deployed-functions) using the App and Function names:

\`\`\`python notest
f = modal.Function.from_name("prod-app", "f")
result = f.remote()
\`\`\`

Remote lookups and invocations can also be performed via our [JavaScript](/docs/sdk/js/latest) and [Go](/docs/sdk/go/latest) SDKs, allowing you to execute code that leverages Python's AI ecosystem from within applications written in other languages:

<CodeTabs>
  {#snippet javascript()}

\`\`\`javascript notest
const f = await modal.functions.fromName("prod-app", "f");
result = await f.remote();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
f, _ := mc.Functions.FromName(ctx, "prod-app", "f", nil)
result, err := f.Remote(ctx, nil, nil)
\`\`\`

{/snippet}
</CodeTabs>

Applying one of the [Web Function](/docs/guide/webhooks) decorators assigns a URL for the Function and allows you to invoke it from anywhere via HTTP:

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("fastapi[standard]")

@app.function(image=image)
@modal.fastapi_endpoint()
def f() -> dict[str, str]:
    return {"message": "Hello from a Modal container"}
\`\`\`

Note that Web Functions are open to the internet by default, but they can optionally require authentication via [Proxy Tokens](/docs/guide/webhook-proxy-auth).

Web Functions are designed for conveniently exposing simple Python functions as web services; use Modal's [Server](/docs/guide/servers) primitive instead for high concurrency or latency-sensitive applications.

Functions can also be automatically invoked on a schedule, akin to a cron job:

\`\`\`python
@app.function(schedule=modal.Cron("0 6 * * *", timezone="America/New_York"))
def f():
    ...
\`\`\`

## Execution semantics

Modal Functions abstract several principles of reliable cloud compute orchestration to present an input/output interface that looks like a local Python function call.

Function invocations are automatically authenticated via your Modal token/secret credentials and authorized per your [RBAC](/docs/guide/rbac) configuration. The Function implementation does not need to perform access control.

Modal is responsible for scheduling containers and routing your inputs to them. By default, Function containers can start anywhere in our global fleet, which maximizes availability and minimizes scheduling latency. To constrain container scheduling, e.g. for compliance, [configure the compute and routing regions](/docs/guide/region-selection):

\`\`\`python
@app.function(region="eu", routing_region="eu-west")
def f():
    ...
\`\`\`

Note that compute region selection incurs a [pricing multiplier](/docs/guide/region-selection#pricing); routing region selection does not. Region selection also limits the pool of compute, especially when combined with specific GPUs or large resource requests, which can impact scheduling latency.

Because container scheduling is reactive to input load, a container may not be available at the moment of invocation. Inputs will queue in Modal's I/O system until they can be distributed to available containers. If inputs are enqueued too quickly or the queue fills up, they will be rejected with a [\`ResourceExhaustedError\`](/docs/sdk/py/latest/exception#resourceexhaustederror). For batch workloads, prefer the durable [\`f.spawn()\`](/docs/sdk/py/latest/Function#spawn) method, which supports higher invocation rates and substantially deeper input queues.

Modal applies an input [timeout](/docs/guide/timeouts) to each invocation; timeouts do not need to be set in the calling context. Timeouts are short by default (5 minutes), but they can be extended up to 24 hours for long-running processes like model training:

\`\`\`python
@app.function(timeout=86400)  # 24 hours
def f():
    ...
\`\`\`

Occasionally, containers will fail while executing inputs, e.g. due to [preemption](/docs/guide/preemption) or out-of-memory (OOM) errors. Modal automatically retries any inputs that a container was running when it failed. As a consequence, Function implementations should be idempotent. CPU functions can opt for non-preemptibility, although this incurs a pricing multiplier:

\`\`\`python
@app.function(nonpreemptible=True)
def f():
    ...
\`\`\`

Exceptions that originate in the Function's implementation are not automatically retried, but input [retries](/docs/guide/retries) can be enabled:

\`\`\`python
@app.function(retries=3)
def f():
    ...
\`\`\`

## Autoscaling and parallelism

Modal Functions autoscale by default. Just as the Function automatically boots a container in response to an initial input, it will boot additional containers if further inputs are received while it is busy. Under ongoing load, the autoscaler will manage the container pool (booting containers or scaling them down) to accommodate fluctuating levels of demand.

Functions expose several options to control the [autoscaling behavior](/docs/guide/scale). Use \`min_containers\` or \`buffer_containers\` to reduce cold start penalties by keeping additional idle containers running, and set \`max_containers\` to limit scaleup under heavy demand:

\`\`\`python
@app.function(min_containers=1, buffer_containers=1, max_containers=20)
def f():
    ...
\`\`\`

After a container finishes handling an input, it is available for reuse. Container reuse reduces average latency, because subsequent inputs will be handled immediately instead of waiting for a new container to boot. As load decreases, Modal will gradually scale down containers that are idle, and Functions will eventually scale to zero if inputs cease altogether. The \`scaledown_window\` controls the aggressiveness of this behavior:

\`\`\`python
@app.function(scaledown_window=600)  # Idle for longer to better handle sporadic load patterns
def f():
    ...
\`\`\`

While most Function configuration requires a redeployment to change, the autoscaler parameters can be dynamically updated using [\`f.update_autoscaler()\`](/docs/sdk/py/latest/Function#update_autoscaler):

\`\`\`python notest
f = modal.Function.from_name("prod-app", "f")
f.update_autoscaler(max_containers=50)  # Override the Function's decorator configuration
\`\`\`

Note that any dynamic updates will be reset by a subsequent deployment.

Because Functions autoscale rapidly, they are a good fit for bursty workloads or batch jobs that require fan-out parallelism. The batch-oriented [\`f.map()\`](/docs/sdk/py/latest/Function#map) and [\`f.spawn_map()\`](/docs/sdk/py/latest/Function#spawn_map) methods facilitate parallel execution by efficiently pushing an iterable of inputs into Modal:

\`\`\`python notest
for result in f.map(inputs):  # Iterate in parallel and handle each result
    ...

f.spawn_map(inputs)  # Higher parallelism with durable semantics for fire-and-forget batch jobs
\`\`\`

Parallel execution can also be achieved using concurrency patterns. The [\`f.spawn()\`](/docs/sdk/py/latest/Function#spawn) method returns a [\`modal.FunctionCall\`](/docs/sdk/py/latest/FunctionCall), which acts like a Future:

\`\`\`python notest
fc = f.spawn(x)
result = fc.get()
\`\`\`

Spawning multiple calls allows them to run in parallel:

\`\`\`python notest
fcs = [f.spawn(x_i) for x_i in xs]
results = modal.FunctionCall.gather(*fcs)
\`\`\`

Async codebases can also use Modal's [\`aio\` interface](/docs/guide/async) to apply concurrency patterns with any invocation method:

\`\`\`python notest
coros = [f.remote.aio(x_i) for x_i in xs]
results = await asyncio.gather(*coros)
\`\`\`

## Container lifecycle management

While Modal containers boot in less than a second, your application logic may require expensive additional setup, such as loading model weights from disk. By structuring the Function's code as a class and using the [\`@app.cls()\`](/docs/sdk/py/latest/App#cls) decorator, you can [separate the startup logic](/docs/guide/lifecycle-functions) from the input handling:

\`\`\`python
@app.cls()
class InferenceEngine:
    @modal.enter()
    def setup(self):
        self.model = load_model()

    @modal.method()
    def predict(self, text: str) -> float:
        return self.model.predict(text)
\`\`\`

In this example, the method wrapped with the [\`@modal.enter()\`](/docs/sdk/py/latest/enter) decorator will run only once, as part of container startup. The container will not be considered "ready" until the startup method or methods complete, and Modal will wait for this event before sending the container any inputs.

A Cls is invoked by "constructing" the class and calling the method decorated with [\`@modal.method()\`](/docs/sdk/py/latest/method). As with normal Functions, this can be a local reference or a lookup:

\`\`\`python notest
result = InferenceEngine().predict.remote(text)  # Refer to a Cls on the same App

InferenceEngine = modal.Cls.from_name("prod-app", "InferenceEngine")
result = InferenceEngine().predict.remote(text)  # Refer to a Cls via a lookup
\`\`\`

Structuring your code as a class also lets you define container teardown logic in methods wrapped with the [\`@modal.exit()\`](/docs/sdk/py/latest/exit) decorator. This is useful for cleanup operations like gracefully closing connections to databases. The exit handler can also be used to make your application more resilient to [container preemption](/docs/guide/preemption).

Any state written to the \`self\` namespace will persist across the calls handled by an individual container, but it will be discarded when the container terminates. State can be shared across containers using Modal's distributed [Dict](/docs/guide/dicts) or [Queue](/docs/guide/queues) primitives.

If the Function produces local state that should not leak across inputs, you can set \`single_use_containers=True\`. This causes each container to terminate after handling an input. Note that single-use containers add some latency and cost, since they do not benefit from amortizing container startup over multiple inputs.

## Function parametrization

To write templated container lifecycle logic, add [\`modal.parameter()\`](/docs/sdk/py/latest/parameter) declarations to the class:

\`\`\`python
@app.cls()
class InferenceEngine:
    model_name: str = modal.parameter()

    @modal.enter()
    def startup(self):
        self.model = load_model(self.model_name)

    @modal.method()
    def predict(self, input: str) -> float:
        ...
\`\`\`

This creates a [Parametrized Function](/docs/guide/parametrized-functions). Supply values for the parameters when constructing the Cls in a calling context, which creates a specific instance of the Function:

\`\`\`python notest
result = InferenceEngine(model_name="tts-large").predict.remote(text)
\`\`\`

Because the parameters apply to the entire container lifecycle, every distinct set of parameter values corresponds to a separate, independently autoscaling _container pool_. This can also be leveraged to partition a Function's containers, even when the parameter values are not read at startup. For example, you may wish to process data from different customers in separate containers:

\`\`\`python notest
result = PartitionedInferenceEngine(customer_id="c-024").predict.remote(text)
\`\`\`

Note that there is a limit on the number of distinct instances each Function can have, so this approach is only suited for partitioning schemes with relatively low cardinality. Prefer using \`single_use_containers=\` for container isolation when parameter values would not frequently recur and benefit from container reuse.

## Dynamic configuration

Updating configuration values in the [\`@app.function()\`](/docs/sdk/py/latest/App#function) decorator requires a [redeployment](/docs/guide/managing-deployments), but it's also possible to [dynamically configure](/docs/guide/dynamic-function-config) the Function from a call site using [\`f.with_options()\`](/docs/sdk/py/latest/Function#with_options). This is useful in cases where specific inputs or parameter values require different resources, such as different GPUs:

\`\`\`python notest
result = InferenceEngine(model_name="tts-large").predict.remote(text)

InferenceEngineH200 = InferenceEngine.with_options(gpu="H200")
result = InferenceEngineH200(model_name="tts-xlarge").predict.remote(text)
\`\`\`

As with Parametrized Functions (but unlike updates to the autoscaler configuration), each distinct set of dynamic options corresponds to an independent container pool. If dynamically configuring CPU or memory, use a coarse set of values to benefit from container reuse.

## Concurrency and batching

By default, each Function container will handle one input at a time. Functions support two distinct patterns for handling multiple inputs.

[Input concurrency](/docs/guide/concurrent-inputs), enabled using the [\`@modal.concurrent()\`](/docs/sdk/py/latest/concurrent) decorator, allows Functions to accept multiple inputs and execute them concurrently using either threads or asyncio tasks:

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=10)
def f(x):
    ...  # Sync implementation; each input runs in its own thread

@app.function()
@modal.concurrent(max_inputs=10)
async def g(x):
    ...  # Async implementation; each input runs on the main thread in an asyncio task
\`\`\`

Functions can benefit from input concurrency if they are I/O bound, e.g. because they make network requests or database queries. Some GPU frameworks can also benefit from input concurrency via continuous batching. Input concurrency is less likely to be useful if the Function is CPU bound.

An alternative strategy is [dynamic batching](/docs/guide/dynamic-batching), enabled using the [\`@modal.batched()\`](/docs/sdk/py/latest/batched) decorator. A batched Function must be defined as accepting a list (or lists) of inputs and returning a list of outputs:

\`\`\`python
@app.function()
@modal.batched(max_batch_size=4, wait_ms=1000)
def f(x: list[int], y: list[int]) -> list[int]:
    return [x_i + y_i for x_i, y_i in zip(x, y)]
\`\`\`

When calling a batched Function, inputs are sent individually, buffered by Modal until the batch size is filled or the wait period elapses, and then processed in a single function call. From the perspective of any individual caller, this looks no different from a normal Function invocation:

\`\`\`python notest
xy_sum = f.remote(2, 6)
\`\`\`

Dynamic batching is especially useful in cases where you can leverage vectorization via tensor or array frameworks like torch or numpy.
`,meta:{title:`Modal Functions`,description:`Modal Functions execute Python code using highly scalable serverless cloud compute.`}},{toc:p,rawContent:m,meta:h}=f,ie=t(`<code>@app.function()</code>`),ae=t(`<code>modal.Function</code>`),oe=t(`<code>@app.function()</code>`),se=t(`<code>f.remote()</code>`),ce=t(`<code>f.spawn()</code>`),le=t(`<code>ResourceExhaustedError</code>`),ue=t(`<code>f.spawn()</code>`),de=t(`<code>f.update_autoscaler()</code>`),fe=t(`<code>f.map()</code>`),pe=t(`<code>f.spawn_map()</code>`),me=t(`<code>f.spawn()</code>`),he=t(`<code>modal.FunctionCall</code>`),ge=t(`<code>aio</code> interface`,1),_e=t(`<code>@app.cls()</code>`),ve=t(`<code>@modal.enter()</code>`),ye=t(`<code>@modal.method()</code>`),be=t(`<code>@modal.exit()</code>`),xe=t(`<code>modal.parameter()</code>`),Se=t(`<code>@app.function()</code>`),Ce=t(`<code>f.with_options()</code>`),we=t(`<code>@modal.concurrent()</code>`),Te=t(`<code>@modal.batched()</code>`),Ee=t(`<!> <p>Modal Functions execute Python code using highly scalable serverless cloud compute.</p> <p>Preparing a function to run on Modal is as simple as defining an <!> and registering the function using the <!> decorator:</p> <!> <p>The wrapped function becomes a <!> that can be called from a local script or deployed and invoked on demand from other applications as if it were part of their codebase.</p> <p>When you invoke the Function, Modal handles all of the operational details: booting a container, routing your inputs, and propagating any exceptions. If you don’t send more inputs, the Function will automatically scale to zero so that it incurs no ongoing cost. Information about the Function invocation, any logs it produced, and a rich set of container metrics are automatically captured and presented across a number of observability surfaces.</p> <!> <p>The Function runtime is configured via arguments to the <!> decorator. Everything about the container environment and the resources available to the Function can be defined within your Python codebase, without reference to external configuration files.</p> <p>Functions receive a baseline allotment of <!>. Explicit resource configuration is not necessary for simple tasks, because Functions can opportunistically burst above this baseline when needed. Heavier jobs can be provisioned with additional resources to guarantee availability:</p> <!> <p>Functions can also be provisioned with one or more <!>:</p> <!> <p>Functions execute within arbitrary container environments, as defined by the Function’s <!>. Each Function in the App can have its own Image. Images can include resources including Python libraries from PyPI or private repositories, binary dependencies like FFmpeg or OpenCV, and data copied from your local system:</p> <!> <p>If the Function is provisioned with a GPU, the <!> are automatically included.</p> <p>Modal includes the Function’s source in the container by default. Depending on the <!>, this will be either the script file or entire package where the Function’s implementation is defined. As a consequence, Functions do not need to be self-contained and can reference other resources in their module.</p> <p>Larger datasets, such as model weights, can be mounted into the container using a Modal <!> or <!>:</p> <!> <p>Environment variables can be defined in the container runtime by passing them as secure <!> or by setting them directly:</p> <!> <!> <p>Modal Functions are called by one of their <!>, such as <!> or <!>. When referenced by another Function or local entrypoint in the same App, a Function can be invoked directly:</p> <!> <p>Functions can be invoked from another App or from outside of Modal after a <!> using the App and Function names:</p> <!> <p>Remote lookups and invocations can also be performed via our <!> and <!> SDKs, allowing you to execute code that leverages Python’s AI ecosystem from within applications written in other languages:</p> <!> <p>Applying one of the <!> decorators assigns a URL for the Function and allows you to invoke it from anywhere via HTTP:</p> <!> <p>Note that Web Functions are open to the internet by default, but they can optionally require authentication via <!>.</p> <p>Web Functions are designed for conveniently exposing simple Python functions as web services; use Modal’s <!> primitive instead for high concurrency or latency-sensitive applications.</p> <p>Functions can also be automatically invoked on a schedule, akin to a cron job:</p> <!> <!> <p>Modal Functions abstract several principles of reliable cloud compute orchestration to present an input/output interface that looks like a local Python function call.</p> <p>Function invocations are automatically authenticated via your Modal token/secret credentials and authorized per your <!> configuration. The Function implementation does not need to perform access control.</p> <p>Modal is responsible for scheduling containers and routing your inputs to them. By default, Function containers can start anywhere in our global fleet, which maximizes availability and minimizes scheduling latency. To constrain container scheduling, e.g. for compliance, <!>:</p> <!> <p>Note that compute region selection incurs a <!>; routing region selection does not. Region selection also limits the pool of compute, especially when combined with specific GPUs or large resource requests, which can impact scheduling latency.</p> <p>Because container scheduling is reactive to input load, a container may not be available at the moment of invocation. Inputs will queue in Modal’s I/O system until they can be distributed to available containers. If inputs are enqueued too quickly or the queue fills up, they will be rejected with a <!>. For batch workloads, prefer the durable <!> method, which supports higher invocation rates and substantially deeper input queues.</p> <p>Modal applies an input <!> to each invocation; timeouts do not need to be set in the calling context. Timeouts are short by default (5 minutes), but they can be extended up to 24 hours for long-running processes like model training:</p> <!> <p>Occasionally, containers will fail while executing inputs, e.g. due to <!> or out-of-memory (OOM) errors. Modal automatically retries any inputs that a container was running when it failed. As a consequence, Function implementations should be idempotent. CPU functions can opt for non-preemptibility, although this incurs a pricing multiplier:</p> <!> <p>Exceptions that originate in the Function’s implementation are not automatically retried, but input <!> can be enabled:</p> <!> <!> <p>Modal Functions autoscale by default. Just as the Function automatically boots a container in response to an initial input, it will boot additional containers if further inputs are received while it is busy. Under ongoing load, the autoscaler will manage the container pool (booting containers or scaling them down) to accommodate fluctuating levels of demand.</p> <p>Functions expose several options to control the <!>. Use <code>min_containers</code> or <code>buffer_containers</code> to reduce cold start penalties by keeping additional idle containers running, and set <code>max_containers</code> to limit scaleup under heavy demand:</p> <!> <p>After a container finishes handling an input, it is available for reuse. Container reuse reduces average latency, because subsequent inputs will be handled immediately instead of waiting for a new container to boot. As load decreases, Modal will gradually scale down containers that are idle, and Functions will eventually scale to zero if inputs cease altogether. The <code>scaledown_window</code> controls the aggressiveness of this behavior:</p> <!> <p>While most Function configuration requires a redeployment to change, the autoscaler parameters can be dynamically updated using <!>:</p> <!> <p>Note that any dynamic updates will be reset by a subsequent deployment.</p> <p>Because Functions autoscale rapidly, they are a good fit for bursty workloads or batch jobs that require fan-out parallelism. The batch-oriented <!> and <!> methods facilitate parallel execution by efficiently pushing an iterable of inputs into Modal:</p> <!> <p>Parallel execution can also be achieved using concurrency patterns. The <!> method returns a <!>, which acts like a Future:</p> <!> <p>Spawning multiple calls allows them to run in parallel:</p> <!> <p>Async codebases can also use Modal’s <!> to apply concurrency patterns with any invocation method:</p> <!> <!> <p>While Modal containers boot in less than a second, your application logic may require expensive additional setup, such as loading model weights from disk. By structuring the Function’s code as a class and using the <!> decorator, you can <!> from the input handling:</p> <!> <p>In this example, the method wrapped with the <!> decorator will run only once, as part of container startup. The container will not be considered “ready” until the startup method or methods complete, and Modal will wait for this event before sending the container any inputs.</p> <p>A Cls is invoked by “constructing” the class and calling the method decorated with <!>. As with normal Functions, this can be a local reference or a lookup:</p> <!> <p>Structuring your code as a class also lets you define container teardown logic in methods wrapped with the <!> decorator. This is useful for cleanup operations like gracefully closing connections to databases. The exit handler can also be used to make your application more resilient to <!>.</p> <p>Any state written to the <code>self</code> namespace will persist across the calls handled by an individual container, but it will be discarded when the container terminates. State can be shared across containers using Modal’s distributed <!> or <!> primitives.</p> <p>If the Function produces local state that should not leak across inputs, you can set <code>single_use_containers=True</code>. This causes each container to terminate after handling an input. Note that single-use containers add some latency and cost, since they do not benefit from amortizing container startup over multiple inputs.</p> <!> <p>To write templated container lifecycle logic, add <!> declarations to the class:</p> <!> <p>This creates a <!>. Supply values for the parameters when constructing the Cls in a calling context, which creates a specific instance of the Function:</p> <!> <p>Because the parameters apply to the entire container lifecycle, every distinct set of parameter values corresponds to a separate, independently autoscaling <em>container pool</em>. This can also be leveraged to partition a Function’s containers, even when the parameter values are not read at startup. For example, you may wish to process data from different customers in separate containers:</p> <!> <p>Note that there is a limit on the number of distinct instances each Function can have, so this approach is only suited for partitioning schemes with relatively low cardinality. Prefer using <code>single_use_containers=</code> for container isolation when parameter values would not frequently recur and benefit from container reuse.</p> <!> <p>Updating configuration values in the <!> decorator requires a <!>, but it’s also possible to <!> the Function from a call site using <!>. This is useful in cases where specific inputs or parameter values require different resources, such as different GPUs:</p> <!> <p>As with Parametrized Functions (but unlike updates to the autoscaler configuration), each distinct set of dynamic options corresponds to an independent container pool. If dynamically configuring CPU or memory, use a coarse set of values to benefit from container reuse.</p> <!> <p>By default, each Function container will handle one input at a time. Functions support two distinct patterns for handling multiple inputs.</p> <p><!>, enabled using the <!> decorator, allows Functions to accept multiple inputs and execute them concurrently using either threads or asyncio tasks:</p> <!> <p>Functions can benefit from input concurrency if they are I/O bound, e.g. because they make network requests or database queries. Some GPU frameworks can also benefit from input concurrency via continuous batching. Input concurrency is less likely to be useful if the Function is CPU bound.</p> <p>An alternative strategy is <!>, enabled using the <!> decorator. A batched Function must be defined as accepting a list (or lists) of inputs and returning a list of outputs:</p> <!> <p>When calling a batched Function, inputs are sent individually, buffered by Modal until the batch size is filled or the wait period elapses, and then processed in a single function call. From the perspective of any individual caller, this looks no different from a normal Function invocation:</p> <!> <p>Dynamic batching is especially useful in cases where you can leverage vectorization via tensor or array frameworks like torch or numpy.</p>`,1);function g(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=Ee(),u=te(a);ne(u,{id:`modal-functions`,children:(e,t)=>{s(),i(e,r(`Modal Functions`))},$$slots:{default:!0}});var f=o(u,4),p=o(e(f));d(p,{href:`/docs/guide/apps`,children:(e,t)=>{s(),i(e,r(`App`))},$$slots:{default:!0}}),d(o(p,2),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(f);var m=o(f,2);l(m,{code:`app%20%3D%20modal.App(%22basic-function%22)%0A%0A%40app.function()%0Adef%20f(x%3A%20int%2C%20exp%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20return%20x**exp`,lang:`python`});var h=o(m,2);d(o(e(h)),{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(h);var g=o(h,4);c(g,{id:`configuring-the-function-runtime`,children:(e,t)=>{s(),i(e,r(`Configuring the Function runtime`))},$$slots:{default:!0}});var _=o(g,2);d(o(e(_)),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(_);var v=o(_,2);d(o(e(v)),{href:`/docs/guide/resources`,children:(e,t)=>{s(),i(e,r(`CPU and memory`))},$$slots:{default:!0}}),s(),n(v);var De=o(v,2);l(De,{code:`%40app.function(cpu%3D16%2C%20memory%3D32768)%20%20%23%2016%20physical%20cores%2C%2032%20GiB%20of%20RAM%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var y=o(De,2);d(o(e(y)),{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`GPUs`))},$$slots:{default:!0}}),s(),n(y);var Oe=o(y,2);l(Oe,{code:`%40app.function(gpu%3D%22H200%3A8%22)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var b=o(Oe,2);d(o(e(b)),{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`Image`))},$$slots:{default:!0}}),s(),n(b);var ke=o(b,2);l(ke,{code:`image%20%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.uv_sync()%0A%20%20%20%20.apt_install(%22ffmpeg%22)%0A%20%20%20%20.add_local_dir(%22data%22%2C%20%22%2Fdata%22)%0A)%0A%0A%40app.function(image%3Dimage)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var x=o(ke,2);d(o(e(x)),{href:`/docs/guide/cuda`,children:(e,t)=>{s(),i(e,r(`CUDA drivers`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);d(o(e(S)),{href:`/docs/guide/project-structure`,children:(e,t)=>{s(),i(e,r(`project structure`))},$$slots:{default:!0}}),s(),n(S);var C=o(S,2),Ae=o(e(C));d(Ae,{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),d(o(Ae,2),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{s(),i(e,r(`CloudBucketMount`))},$$slots:{default:!0}}),s(),n(C);var je=o(C,2);l(je,{code:`vol%20%3D%20modal.Volume.from_name(%22model-weights%22)%0A%0A%40app.function(volumes%3D%7B%22%2Fmodels%22%3A%20vol%7D)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var w=o(je,2);d(o(e(w)),{href:`/docs/guide/secrets`,children:(e,t)=>{s(),i(e,r(`Secrets`))},$$slots:{default:!0}}),s(),n(w);var Me=o(w,2);l(Me,{code:`api_key%20%3D%20modal.Secret.from_name(%22api-key%22)%0A%0A%40app.function(secrets%3D%5Bapi_key%5D%2C%20env%3D%7B%22LOG_LEVEL%22%3A%20%22info%22%7D)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var Ne=o(Me,2);c(Ne,{id:`function-invocation`,children:(e,t)=>{s(),i(e,r(`Function invocation`))},$$slots:{default:!0}});var T=o(Ne,2),Pe=o(e(T));d(Pe,{href:`/docs/guide/function-invocation-methods`,children:(e,t)=>{s(),i(e,r(`invocation methods`))},$$slots:{default:!0}});var Fe=o(Pe,2);d(Fe,{href:`/docs/sdk/py/latest/Function#remote`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),d(o(Fe,2),{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(T);var Ie=o(T,2);l(Ie,{code:`%40app.function()%0Adef%20f()%20-%3E%20str%3A%0A%20%20%20%20return%20%22Hello%20from%20a%20Modal%20container%22%0A%0A%40app.function()%0Adef%20g()%20-%3E%20str%3A%0A%20%20%20%20return%20f.remote()%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20print(g.remote())`,lang:`python`});var E=o(Ie,2);d(o(e(E)),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{s(),i(e,r(`lookup`))},$$slots:{default:!0}}),s(),n(E);var Le=o(E,2);l(Le,{code:`f%20%3D%20modal.Function.from_name(%22prod-app%22%2C%20%22f%22)%0Aresult%20%3D%20f.remote()`,lang:`python`});var D=o(Le,2),Re=o(e(D));d(Re,{href:`/docs/sdk/js/latest`,children:(e,t)=>{s(),i(e,r(`JavaScript`))},$$slots:{default:!0}}),d(o(Re,2),{href:`/docs/sdk/go/latest`,children:(e,t)=>{s(),i(e,r(`Go`))},$$slots:{default:!0}}),s(),n(D);var ze=o(D,2);re(ze,{javascript:e=>{l(e,{code:`const%20f%20%3D%20await%20modal.functions.fromName(%22prod-app%22%2C%20%22f%22)%3B%0Aresult%20%3D%20await%20f.remote()%3B`,lang:`javascript`})},go:e=>{l(e,{code:`f%2C%20_%20%3A%3D%20mc.Functions.FromName(ctx%2C%20%22prod-app%22%2C%20%22f%22%2C%20nil)%0Aresult%2C%20err%20%3A%3D%20f.Remote(ctx%2C%20nil%2C%20nil)`,lang:`go`})},$$slots:{javascript:!0,go:!0}});var O=o(ze,2);d(o(e(O)),{href:`/docs/guide/webhooks`,children:(e,t)=>{s(),i(e,r(`Web Function`))},$$slots:{default:!0}}),s(),n(O);var Be=o(O,2);l(Be,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%40app.function(image%3Dimage)%0A%40modal.fastapi_endpoint()%0Adef%20f()%20-%3E%20dict%5Bstr%2C%20str%5D%3A%0A%20%20%20%20return%20%7B%22message%22%3A%20%22Hello%20from%20a%20Modal%20container%22%7D`,lang:`python`});var k=o(Be,2);d(o(e(k)),{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{s(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2);d(o(e(A)),{href:`/docs/guide/servers`,children:(e,t)=>{s(),i(e,r(`Server`))},$$slots:{default:!0}}),s(),n(A);var Ve=o(A,4);l(Ve,{code:`%40app.function(schedule%3Dmodal.Cron(%220%206%20*%20*%20*%22%2C%20timezone%3D%22America%2FNew_York%22))%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var He=o(Ve,2);c(He,{id:`execution-semantics`,children:(e,t)=>{s(),i(e,r(`Execution semantics`))},$$slots:{default:!0}});var j=o(He,4);d(o(e(j)),{href:`/docs/guide/rbac`,children:(e,t)=>{s(),i(e,r(`RBAC`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,2);d(o(e(M)),{href:`/docs/guide/region-selection`,children:(e,t)=>{s(),i(e,r(`configure the compute and routing regions`))},$$slots:{default:!0}}),s(),n(M);var Ue=o(M,2);l(Ue,{code:`%40app.function(region%3D%22eu%22%2C%20routing_region%3D%22eu-west%22)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var N=o(Ue,2);d(o(e(N)),{href:`/docs/guide/region-selection#pricing`,children:(e,t)=>{s(),i(e,r(`pricing multiplier`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,2),We=o(e(P));d(We,{href:`/docs/sdk/py/latest/exception#resourceexhaustederror`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),d(o(We,2),{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);d(o(e(F)),{href:`/docs/guide/timeouts`,children:(e,t)=>{s(),i(e,r(`timeout`))},$$slots:{default:!0}}),s(),n(F);var Ge=o(F,2);l(Ge,{code:`%40app.function(timeout%3D86400)%20%20%23%2024%20hours%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var I=o(Ge,2);d(o(e(I)),{href:`/docs/guide/preemption`,children:(e,t)=>{s(),i(e,r(`preemption`))},$$slots:{default:!0}}),s(),n(I);var Ke=o(I,2);l(Ke,{code:`%40app.function(nonpreemptible%3DTrue)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var L=o(Ke,2);d(o(e(L)),{href:`/docs/guide/retries`,children:(e,t)=>{s(),i(e,r(`retries`))},$$slots:{default:!0}}),s(),n(L);var qe=o(L,2);l(qe,{code:`%40app.function(retries%3D3)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var Je=o(qe,2);c(Je,{id:`autoscaling-and-parallelism`,children:(e,t)=>{s(),i(e,r(`Autoscaling and parallelism`))},$$slots:{default:!0}});var R=o(Je,4);d(o(e(R)),{href:`/docs/guide/scale`,children:(e,t)=>{s(),i(e,r(`autoscaling behavior`))},$$slots:{default:!0}}),s(7),n(R);var Ye=o(R,2);l(Ye,{code:`%40app.function(min_containers%3D1%2C%20buffer_containers%3D1%2C%20max_containers%3D20)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var Xe=o(Ye,4);l(Xe,{code:`%40app.function(scaledown_window%3D600)%20%20%23%20Idle%20for%20longer%20to%20better%20handle%20sporadic%20load%20patterns%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var z=o(Xe,2);d(o(e(z)),{href:`/docs/sdk/py/latest/Function#update_autoscaler`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),s(),n(z);var Ze=o(z,2);l(Ze,{code:`f%20%3D%20modal.Function.from_name(%22prod-app%22%2C%20%22f%22)%0Af.update_autoscaler(max_containers%3D50)%20%20%23%20Override%20the%20Function's%20decorator%20configuration`,lang:`python`});var B=o(Ze,4),Qe=o(e(B));d(Qe,{href:`/docs/sdk/py/latest/Function#map`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),d(o(Qe,2),{href:`/docs/sdk/py/latest/Function#spawn_map`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(),n(B);var $e=o(B,2);l($e,{code:`for%20result%20in%20f.map(inputs)%3A%20%20%23%20Iterate%20in%20parallel%20and%20handle%20each%20result%0A%20%20%20%20...%0A%0Af.spawn_map(inputs)%20%20%23%20Higher%20parallelism%20with%20durable%20semantics%20for%20fire-and-forget%20batch%20jobs`,lang:`python`});var V=o($e,2),et=o(e(V));d(et,{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,me())},$$slots:{default:!0}}),d(o(et,2),{href:`/docs/sdk/py/latest/FunctionCall`,children:(e,t)=>{i(e,he())},$$slots:{default:!0}}),s(),n(V);var tt=o(V,2);l(tt,{code:`fc%20%3D%20f.spawn(x)%0Aresult%20%3D%20fc.get()`,lang:`python`});var nt=o(tt,4);l(nt,{code:`fcs%20%3D%20%5Bf.spawn(x_i)%20for%20x_i%20in%20xs%5D%0Aresults%20%3D%20modal.FunctionCall.gather(*fcs)`,lang:`python`});var H=o(nt,2);d(o(e(H)),{href:`/docs/guide/async`,children:(e,t)=>{var n=ge();s(),i(e,n)},$$slots:{default:!0}}),s(),n(H);var rt=o(H,2);l(rt,{code:`coros%20%3D%20%5Bf.remote.aio(x_i)%20for%20x_i%20in%20xs%5D%0Aresults%20%3D%20await%20asyncio.gather(*coros)`,lang:`python`});var it=o(rt,2);c(it,{id:`container-lifecycle-management`,children:(e,t)=>{s(),i(e,r(`Container lifecycle management`))},$$slots:{default:!0}});var U=o(it,2),at=o(e(U));d(at,{href:`/docs/sdk/py/latest/App#cls`,children:(e,t)=>{i(e,_e())},$$slots:{default:!0}}),d(o(at,2),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{s(),i(e,r(`separate the startup logic`))},$$slots:{default:!0}}),s(),n(U);var ot=o(U,2);l(ot,{code:`%40app.cls()%0Aclass%20InferenceEngine%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20load_model()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20predict(self%2C%20text%3A%20str)%20-%3E%20float%3A%0A%20%20%20%20%20%20%20%20return%20self.model.predict(text)`,lang:`python`});var W=o(ot,2);d(o(e(W)),{href:`/docs/sdk/py/latest/enter`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}}),s(),n(W);var G=o(W,2);d(o(e(G)),{href:`/docs/sdk/py/latest/method`,children:(e,t)=>{i(e,ye())},$$slots:{default:!0}}),s(),n(G);var st=o(G,2);l(st,{code:`result%20%3D%20InferenceEngine().predict.remote(text)%20%20%23%20Refer%20to%20a%20Cls%20on%20the%20same%20App%0A%0AInferenceEngine%20%3D%20modal.Cls.from_name(%22prod-app%22%2C%20%22InferenceEngine%22)%0Aresult%20%3D%20InferenceEngine().predict.remote(text)%20%20%23%20Refer%20to%20a%20Cls%20via%20a%20lookup`,lang:`python`});var K=o(st,2),ct=o(e(K));d(ct,{href:`/docs/sdk/py/latest/exit`,children:(e,t)=>{i(e,be())},$$slots:{default:!0}}),d(o(ct,2),{href:`/docs/guide/preemption`,children:(e,t)=>{s(),i(e,r(`container preemption`))},$$slots:{default:!0}}),s(),n(K);var q=o(K,2),lt=o(e(q),3);d(lt,{href:`/docs/guide/dicts`,children:(e,t)=>{s(),i(e,r(`Dict`))},$$slots:{default:!0}}),d(o(lt,2),{href:`/docs/guide/queues`,children:(e,t)=>{s(),i(e,r(`Queue`))},$$slots:{default:!0}}),s(),n(q);var ut=o(q,4);c(ut,{id:`function-parametrization`,children:(e,t)=>{s(),i(e,r(`Function parametrization`))},$$slots:{default:!0}});var J=o(ut,2);d(o(e(J)),{href:`/docs/sdk/py/latest/parameter`,children:(e,t)=>{i(e,xe())},$$slots:{default:!0}}),s(),n(J);var dt=o(J,2);l(dt,{code:`%40app.cls()%0Aclass%20InferenceEngine%3A%0A%20%20%20%20model_name%3A%20str%20%3D%20modal.parameter()%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20load_model(self.model_name)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20predict(self%2C%20input%3A%20str)%20-%3E%20float%3A%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var Y=o(dt,2);d(o(e(Y)),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{s(),i(e,r(`Parametrized Function`))},$$slots:{default:!0}}),s(),n(Y);var ft=o(Y,2);l(ft,{code:`result%20%3D%20InferenceEngine(model_name%3D%22tts-large%22).predict.remote(text)`,lang:`python`});var pt=o(ft,4);l(pt,{code:`result%20%3D%20PartitionedInferenceEngine(customer_id%3D%22c-024%22).predict.remote(text)`,lang:`python`});var mt=o(pt,4);c(mt,{id:`dynamic-configuration`,children:(e,t)=>{s(),i(e,r(`Dynamic configuration`))},$$slots:{default:!0}});var X=o(mt,2),Z=o(e(X));d(Z,{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,Se())},$$slots:{default:!0}});var ht=o(Z,2);d(ht,{href:`/docs/guide/managing-deployments`,children:(e,t)=>{s(),i(e,r(`redeployment`))},$$slots:{default:!0}});var gt=o(ht,2);d(gt,{href:`/docs/guide/dynamic-function-config`,children:(e,t)=>{s(),i(e,r(`dynamically configure`))},$$slots:{default:!0}}),d(o(gt,2),{href:`/docs/sdk/py/latest/Function#with_options`,children:(e,t)=>{i(e,Ce())},$$slots:{default:!0}}),s(),n(X);var _t=o(X,2);l(_t,{code:`result%20%3D%20InferenceEngine(model_name%3D%22tts-large%22).predict.remote(text)%0A%0AInferenceEngineH200%20%3D%20InferenceEngine.with_options(gpu%3D%22H200%22)%0Aresult%20%3D%20InferenceEngineH200(model_name%3D%22tts-xlarge%22).predict.remote(text)`,lang:`python`});var vt=o(_t,4);c(vt,{id:`concurrency-and-batching`,children:(e,t)=>{s(),i(e,r(`Concurrency and batching`))},$$slots:{default:!0}});var Q=o(vt,4),yt=e(Q);d(yt,{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{s(),i(e,r(`Input concurrency`))},$$slots:{default:!0}}),d(o(yt,2),{href:`/docs/sdk/py/latest/concurrent`,children:(e,t)=>{i(e,we())},$$slots:{default:!0}}),s(),n(Q);var bt=o(Q,2);l(bt,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D10)%0Adef%20f(x)%3A%0A%20%20%20%20...%20%20%23%20Sync%20implementation%3B%20each%20input%20runs%20in%20its%20own%20thread%0A%0A%40app.function()%0A%40modal.concurrent(max_inputs%3D10)%0Aasync%20def%20g(x)%3A%0A%20%20%20%20...%20%20%23%20Async%20implementation%3B%20each%20input%20runs%20on%20the%20main%20thread%20in%20an%20asyncio%20task`,lang:`python`});var $=o(bt,4),xt=o(e($));d(xt,{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{s(),i(e,r(`dynamic batching`))},$$slots:{default:!0}}),d(o(xt,2),{href:`/docs/sdk/py/latest/batched`,children:(e,t)=>{i(e,Te())},$$slots:{default:!0}}),s(),n($);var St=o($,2);l(St,{code:`%40app.function()%0A%40modal.batched(max_batch_size%3D4%2C%20wait_ms%3D1000)%0Adef%20f(x%3A%20list%5Bint%5D%2C%20y%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20return%20%5Bx_i%20%2B%20y_i%20for%20x_i%2C%20y_i%20in%20zip(x%2C%20y)%5D`,lang:`python`}),l(o(St,4),{code:`xy_sum%20%3D%20f.remote(2%2C%206)`,lang:`python`}),s(2),i(t,a)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=B7O1VJHW.js.map
