(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`374868b5-2cb2-4be0-a2f4-ce081a4216b7`,e._sentryDebugIdIdentifier=`sentry-dbid-374868b5-2cb2-4be0-a2f4-ce081a4216b7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Function`,id:`function`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.fetch`,id:`logsfetch`},{depth:3,value:`logs.tail`,id:`logstail`},{depth:3,value:`logs.stream`,id:`logsstream`}]},{depth:2,value:`update_autoscaler`,id:`update_autoscaler`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`get_web_url`,id:`get_web_url`},{depth:2,value:`with_options`,id:`with_options`},{depth:2,value:`with_concurrency`,id:`with_concurrency`},{depth:2,value:`with_batching`,id:`with_batching`},{depth:2,value:`remote`,id:`remote`},{depth:2,value:`remote_gen`,id:`remote_gen`},{depth:2,value:`local`,id:`local`},{depth:2,value:`spawn`,id:`spawn`},{depth:2,value:`get_raw_f`,id:`get_raw_f`},{depth:2,value:`get_current_stats`,id:`get_current_stats`},{depth:2,value:`map`,id:`map`},{depth:2,value:`starmap`,id:`starmap`},{depth:2,value:`for_each`,id:`for_each`},{depth:2,value:`spawn_map`,id:`spawn_map`}]}],rawContent:`# Function


\`\`\`python
class Function(typing.Generic, modal.object.Object)
\`\`\`

Functions are the basic units of serverless execution on Modal.

Generally, you will not construct a \`Function\` directly. Instead, use the
\`App.function()\` decorator to register your Python functions with your App.


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## logs


\`\`\`python
logs: FunctionLogsManager
\`\`\`

Access logs for a \`Function\`.

Use [\`fetch()\`](#logsfetch)
to read logs from a UTC time range, [\`tail()\`](#logstail)
to read the most recent logs, and [\`stream()\`](#logsstream)
to follow new logs as they arrive.

**See Also**

- [\`modal app logs\`](https://modal.com/docs/cli/latest/app#modal-app-logs):
  CLI access to logs for an App.


### logs.fetch

\`\`\`python
fetch(self, *, since, until=None, source=None, search_text="")
\`\`\`
Fetch Function logs corresponding to the date range and filters.

**Parameters**

<Parameter name="since" type="datetime" description="Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="until" type="datetime | None" defaultValue="None" description="Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />
<Parameter name="search_text" type="str" defaultValue="&quot;&quot;" description="Filter by search text." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")

for entry in function.logs.fetch(
    since=datetime.now() - timedelta(hours=4),
    source="stdout",
):
    print(entry.message, end="")
\`\`\`

### logs.tail

\`\`\`python
tail(self, entries=100, *, source=None)
\`\`\`
Fetch the most recent Function logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")

for entry in function.logs.tail(20):
    print(entry.message, end="")
\`\`\`

### logs.stream

\`\`\`python
stream(self, timeout=None)
\`\`\`
Stream new Function logs until the timeout is reached.

**Parameters**

<Parameter name="timeout" type="float | None" defaultValue="None" description="Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted." />

**Yields**

\`LogEntry\` objects as they arrive.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")

for entry in function.logs.stream(timeout=60):
    print(entry.message, end="")
\`\`\`

## update_autoscaler

\`\`\`python
update_autoscaler(self, *, min_containers=None, max_containers=None,
    buffer_containers=None, scaledown_window=None)
\`\`\`
Override the current autoscaler behavior for this Function.

Unspecified parameters will retain their current value, i.e. either the static value
from the function decorator, or an override value from a previous call to this method.

Subsequent deployments of the App containing this Function will reset the autoscaler back to
its static configuration.

**Parameters**

<Parameter name="min_containers" type="int | None" defaultValue="None" description="Minimum number of containers to keep running." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Maximum concurrent containers." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Extra containers to keep warm beyond current demand." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Maximum duration (in seconds) idle containers wait before scaling down." />

**Returns**

A \`FunctionAutoscalerSettings\` dataclass which contains the current autoscaler settings
of this Function after the call.

**Usage**

\`\`\`python notest
f = modal.Function.from_name("my-app", "function")

# Always have at least 2 containers running, with an extra buffer when the Function is active
f.update_autoscaler(min_containers=2, buffer_containers=1)

# Limit this Function to avoid spinning up more than 5 containers
f.update_autoscaler(max_containers=5)

# Extend the scaledown window to increase the amount of time that idle containers stay alive
f.update_autoscaler(scaledown_window=300)
\`\`\`

## from_name

\`\`\`python
from_name(cls, app_name, name, *, version=None, environment_name=None,
    client=None)
\`\`\`
Reference a Function from a deployed App by its name.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.

**Parameters**

<Parameter name="app_name" type="str" description="Name of the deployed App." />
<Parameter name="name" type="str" description="Name of the Function within that App. For class methods, use \`Cls.from_name\` instead." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to look up the App in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A lazy \`Function\` handle.

**Usage**

\`\`\`python
f = modal.Function.from_name("other-app", "function")
\`\`\`

The \`version\` parameter allows you to invoke a version-pinned function:

\`\`\`python
f_v3 = modal.Function.from_name("other-app", "function", version=3)
\`\`\`

## get_web_url

\`\`\`python
get_web_url(self)
\`\`\`
URL for addressing a Web Function via HTTP.

**Returns**

The HTTPS URL for the web endpoint, or \`None\` if this Function is not a web endpoint.

## with_options

\`\`\`python
with_options(self, *, cpu=None, memory=None, gpu=None, env=None, secrets=None,
    volumes={}, retries=None, max_containers=None, buffer_containers=None,
    scaledown_window=None, timeout=None, region=None, cloud=None,
    routing_region=None)
\`\`\`
Dynamically override the static Function configuration with invocation-specific values.

This method returns a new Function instance with the dynamic configuration. Invocations of
the new Function will run in a distinct container pool and autoscale independently from the
base Function (and from other dynamic configurations).

Note that options cannot be "unset" with this method (i.e., if a GPU is configured in the
\`@app.cls()\` decorator, passing \`gpu=None\` here will not create a CPU-only instance).
Additionally, container arguments like \`volumes\` and \`secrets\` will _replace_ the base
configuration or any previous use of this method rather than extending it.

**Usage:**

You can use this method after looking up a deployed Function:

\`\`\`python notest
fn = modal.Function.from_name("my_app", "fn").with_options(gpu="H100")
fn.remote()  # will run on a H100 GPU
\`\`\`

Or by referencing another Function defined in the same App:

\`\`\`python notest
@app.function()
def fn():
    ...

# From a local entrypoint or another Function
fn.with_options(gpu="H100").remote()  # Uses an H100 GPU
fn.remote()  # Uses the static configuration with no GPU
\`\`\`

## with_concurrency

\`\`\`python
with_concurrency(self, *, max_inputs, target_inputs=None)
\`\`\`
Override the static Function configuration with invocation-specific input concurrency.

Returns a new Function instance that is dynamically configured to behave like a Function using
the \`@modal.concurrent\` decorator. This instance will autoscale independently from the base Function.

## with_batching

\`\`\`python
with_batching(self, *, max_batch_size, wait_ms)
\`\`\`
Override the static Function configuration with invocation-specific dynamic batching.

Returns a new Function instance that is dynamically configured to behave like a Function using
the \`@modal.batched\` decorator. This instance will autoscale independently from the base Function.

## remote

\`\`\`python
remote(self, *args, **kwargs)
\`\`\`
Calls the function remotely, executing it with the given arguments and returning the execution's result.

**Parameters**

<Parameter name="*args" type="P.args" description="Positional arguments forwarded to the deployed function." />
<Parameter name="**kwargs" type="P.kwargs" description="Keyword arguments forwarded to the deployed function." />

**Returns**

The value returned by the remote function.

## remote_gen

\`\`\`python
remote_gen(self, *args, **kwargs)
\`\`\`
Calls the generator remotely, executing it with the given arguments.

**Parameters**

<Parameter name="*args" type="" description="Positional arguments forwarded to the deployed generator function." />
<Parameter name="**kwargs" type="" description="Keyword arguments forwarded to the deployed generator function." />

**Yields**

Values produced by the remote generator.

## local

\`\`\`python
local(self, *args, **kwargs)
\`\`\`
Calls the function locally, executing it with the given arguments and returning the execution's result.

The function will execute in the same environment as the caller, just like calling the underlying function
directly in Python. In particular, only secrets available in the caller environment will be available
through environment variables.

**Parameters**

<Parameter name="*args" type="P.args" description="Positional arguments passed to the underlying Python callable." />
<Parameter name="**kwargs" type="P.kwargs" description="Keyword arguments passed to the underlying Python callable." />

**Returns**

The return value of the local call (or a coroutine for async functions).

## spawn

\`\`\`python
spawn(self, *args, **kwargs)
\`\`\`
Calls the function with the given arguments, without waiting for the results.

Conceptually similar to \`multiprocessing.pool.apply_async\`, or a Future/Promise in other contexts.

**Parameters**

<Parameter name="*args" type="P.args" description="Positional arguments forwarded to the remote function." />
<Parameter name="**kwargs" type="P.kwargs" description="Keyword arguments forwarded to the remote function." />

**Returns**

A [\`modal.FunctionCall\`](https://modal.com/docs/sdk/py/latest/FunctionCall) object
that can later be polled or waited for using
[\`.get(timeout=...)\`](https://modal.com/docs/sdk/py/latest/FunctionCall#get).

## get_raw_f

\`\`\`python
get_raw_f(self)
\`\`\`
Return the inner Python object wrapped by this Modal Function.

**Returns**

The original function object registered with Modal.

## get_current_stats

\`\`\`python
get_current_stats(self)
\`\`\`
Return a \`FunctionStats\` object describing the current function's queue and runner counts.

**Returns**

Snapshot counts for backlog, runners, and running inputs.

## map

\`\`\`python
map(self, *input_iterators, kwargs={}, order_outputs=True,
    return_exceptions=False, wrap_returned_exceptions=None)
\`\`\`
Parallel map over a set of inputs.

Pass one iterable per positional argument of the underlying function. Results are yielded as an
iterable (sync) or async iterator (\`\`map.aio\`\`).

If applied to an \`\`@app.function\`\`, \`\`map()\`\` returns one result per input and output order matches
input order by default. Set \`\`order_outputs=False\`\` to emit results in completion order.

\`\`return_exceptions\`\` can aggregate failures into the result stream instead of raising.

**Parameters**

<Parameter name="*input_iterators" type="typing.Iterable[Any]" description="One iterator per mapped positional parameter on the function." />
<Parameter name="kwargs" type="" defaultValue="&#123;&#125;" description="Extra keyword arguments forwarded to every invocation." />
<Parameter name="order_outputs" type="bool" defaultValue="True" description="If True, preserve input order in outputs; if False, use completion order." />
<Parameter name="return_exceptions" type="bool" defaultValue="False" description="If True, failed inputs appear as exceptions in the result stream instead of raising." />
<Parameter name="wrap_returned_exceptions" type="bool | None" defaultValue="None" description="Deprecated; no longer has any effect." />

**Usage**

\`\`\`python
@app.function()
def my_func(a):
    return a ** 2


@app.local_entrypoint()
def main():
    assert list(my_func.map([1, 2, 3, 4])) == [1, 4, 9, 16]
\`\`\`

\`\`\`python
@app.function()
def my_func(a):
    if a == 2:
        raise Exception("ohno")
    return a ** 2


@app.local_entrypoint()
def main():
    print(list(my_func.map(range(3), return_exceptions=True)))
\`\`\`

## starmap

\`\`\`python
starmap(self, input_iterator, *, kwargs={}, order_outputs=True,
    return_exceptions=False, wrap_returned_exceptions=None)
\`\`\`
Like \`\`map\`\`, but each input item is unpacked into multiple positional arguments.

Every element of \`\`input_iterator\`\` should be a sequence (for example a tuple) with length equal to the
arity of the function.

**Parameters**

<Parameter name="input_iterator" type="typing.Iterable[typing.Sequence[Any]]" description="Iterable of argument tuples to unpack into each call." />
<Parameter name="kwargs" type="" defaultValue="&#123;&#125;" description="Extra keyword arguments forwarded to every invocation." />
<Parameter name="order_outputs" type="bool" defaultValue="True" description="If True, preserve input order in outputs; if False, use completion order." />
<Parameter name="return_exceptions" type="bool" defaultValue="False" description="If True, failed inputs appear as exceptions in the result stream instead of raising." />
<Parameter name="wrap_returned_exceptions" type="bool | None" defaultValue="None" description="Deprecated; no longer has any effect." />

**Usage**

\`\`\`python
@app.function()
def my_func(a, b):
    return a + b


@app.local_entrypoint()
def main():
    assert list(my_func.starmap([(1, 2), (3, 4)])) == [3, 7]
\`\`\`

## for_each

\`\`\`python
for_each(self, *input_iterators, kwargs={}, ignore_exceptions=False)
\`\`\`
Execute the function for all inputs and wait for completion, discarding return values.

Like \`\`.map()\`\` but you do not need to iterate the result to drive work—Modal processes every input.

**Parameters**

<Parameter name="*input_iterators" type="" description="One iterator per mapped positional parameter on the function." />
<Parameter name="kwargs" type="" defaultValue="&#123;&#125;" description="Extra keyword arguments forwarded to every invocation." />
<Parameter name="ignore_exceptions" type="bool" defaultValue="False" description="If True, failures are swallowed instead of propagating." />

## spawn_map

\`\`\`python
spawn_map(self, *input_iterators, kwargs={})
\`\`\`
Spawn parallel execution over a set of inputs, exiting as soon as the inputs are created (without waiting
for the map to complete).

Takes one iterator argument per argument in the function being mapped over.

Programmatic retrieval of results will be supported in a future update.

**Parameters**

<Parameter name="*input_iterators" type="" description="One iterator per mapped positional parameter on the function." />
<Parameter name="kwargs" type="" defaultValue="&#123;&#125;" description="Extra keyword arguments forwarded to every invocation." />

**Usage**

\`\`\`python
@app.function()
def my_func(a):
    return a ** 2


@app.local_entrypoint()
def main():
    my_func.spawn_map([1, 2, 3, 4])
\`\`\`
`,meta:{title:`Function`,description:`Functions are the basic units of serverless execution on Modal.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>fetch()</code>`),ae=t(`<code>tail()</code>`),oe=t(`<code>stream()</code>`),se=t(`<code>modal app logs</code>`),ce=t(`<code>modal.FunctionCall</code>`),le=t(`<code>.get(timeout=...)</code>`),ue=t(`<!> <!> <p>Functions are the basic units of serverless execution on Modal.</p> <p>Generally, you will not construct a <code>Function</code> directly. Instead, use the <code>App.function()</code> decorator to register your Python functions with your App.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Access logs for a <code>Function</code>.</p> <p>Use <!> to read logs from a UTC time range, <!> to read the most recent logs, and <!> to follow new logs as they arrive.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Fetch Function logs corresponding to the date range and filters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch the most recent Function logs.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Stream new Function logs until the timeout is reached.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects as they arrive.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Override the current autoscaler behavior for this Function.</p> <p>Unspecified parameters will retain their current value, i.e. either the static value
from the function decorator, or an override value from a previous call to this method.</p> <p>Subsequent deployments of the App containing this Function will reset the autoscaler back to
its static configuration.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>FunctionAutoscalerSettings</code> dataclass which contains the current autoscaler settings
of this Function after the call.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Reference a Function from a deployed App by its name.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A lazy <code>Function</code> handle.</p> <p><strong>Usage</strong></p> <!> <p>The <code>version</code> parameter allows you to invoke a version-pinned function:</p> <!> <!> <!> <p>URL for addressing a Web Function via HTTP.</p> <p><strong>Returns</strong></p> <p>The HTTPS URL for the web endpoint, or <code>None</code> if this Function is not a web endpoint.</p> <!> <!> <p>Dynamically override the static Function configuration with invocation-specific values.</p> <p>This method returns a new Function instance with the dynamic configuration. Invocations of
the new Function will run in a distinct container pool and autoscale independently from the
base Function (and from other dynamic configurations).</p> <p>Note that options cannot be “unset” with this method (i.e., if a GPU is configured in the <code>@app.cls()</code> decorator, passing <code>gpu=None</code> here will not create a CPU-only instance).
Additionally, container arguments like <code>volumes</code> and <code>secrets</code> will <em>replace</em> the base
configuration or any previous use of this method rather than extending it.</p> <p><strong>Usage:</strong></p> <p>You can use this method after looking up a deployed Function:</p> <!> <p>Or by referencing another Function defined in the same App:</p> <!> <!> <!> <p>Override the static Function configuration with invocation-specific input concurrency.</p> <p>Returns a new Function instance that is dynamically configured to behave like a Function using
the <code>@modal.concurrent</code> decorator. This instance will autoscale independently from the base Function.</p> <!> <!> <p>Override the static Function configuration with invocation-specific dynamic batching.</p> <p>Returns a new Function instance that is dynamically configured to behave like a Function using
the <code>@modal.batched</code> decorator. This instance will autoscale independently from the base Function.</p> <!> <!> <p>Calls the function remotely, executing it with the given arguments and returning the execution’s result.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>The value returned by the remote function.</p> <!> <!> <p>Calls the generator remotely, executing it with the given arguments.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p>Values produced by the remote generator.</p> <!> <!> <p>Calls the function locally, executing it with the given arguments and returning the execution’s result.</p> <p>The function will execute in the same environment as the caller, just like calling the underlying function
directly in Python. In particular, only secrets available in the caller environment will be available
through environment variables.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>The return value of the local call (or a coroutine for async functions).</p> <!> <!> <p>Calls the function with the given arguments, without waiting for the results.</p> <p>Conceptually similar to <code>multiprocessing.pool.apply_async</code>, or a Future/Promise in other contexts.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <!> object
that can later be polled or waited for using <!>.</p> <!> <!> <p>Return the inner Python object wrapped by this Modal Function.</p> <p><strong>Returns</strong></p> <p>The original function object registered with Modal.</p> <!> <!> <p>Return a <code>FunctionStats</code> object describing the current function’s queue and runner counts.</p> <p><strong>Returns</strong></p> <p>Snapshot counts for backlog, runners, and running inputs.</p> <!> <!> <p>Parallel map over a set of inputs.</p> <p>Pass one iterable per positional argument of the underlying function. Results are yielded as an
iterable (sync) or async iterator (<code>map.aio</code>).</p> <p>If applied to an <code>@app.function</code>, <code>map()</code> returns one result per input and output order matches
input order by default. Set <code>order_outputs=False</code> to emit results in completion order.</p> <p><code>return_exceptions</code> can aggregate failures into the result stream instead of raising.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Like <code>map</code>, but each input item is unpacked into multiple positional arguments.</p> <p>Every element of <code>input_iterator</code> should be a sequence (for example a tuple) with length equal to the
arity of the function.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Execute the function for all inputs and wait for completion, discarding return values.</p> <p>Like <code>.map()</code> but you do not need to iterate the result to drive work—Modal processes every input.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p>Spawn parallel execution over a set of inputs, exiting as soon as the inputs are created (without waiting
for the map to complete).</p> <p>Takes one iterator argument per argument in the function being mapped over.</p> <p>Programmatic retrieval of results will be supported in a future update.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`function`,children:(e,t)=>{s(),i(e,r(`Function`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Function(typing.Generic%2C%20modal.object.Object)`,lang:`python`});var h=o(m,6);c(h,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var g=o(h,2);u(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var re=o(g,8);c(re,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var _=o(re,2);u(_,{code:`logs%3A%20FunctionLogsManager`,lang:`python`});var v=o(_,4),y=o(e(v));f(y,{href:`#logsfetch`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var b=o(y,2);f(b,{href:`#logstail`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),f(o(b,2),{href:`#logsstream`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(v);var x=o(v,4),S=e(x);f(e(S),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(S),n(x);var C=o(x,2);l(C,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var w=o(C,2);u(w,{code:`fetch(self%2C%20*%2C%20since%2C%20until%3DNone%2C%20source%3DNone%2C%20search_text%3D%22%22)`,lang:`python`});var T=o(w,6);p(T,{name:`since`,type:`datetime`,description:`Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time.`});var E=o(T,2);p(E,{name:`until`,type:`datetime | None`,defaultValue:`None`,description:`Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time.`});var D=o(E,2);p(D,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var O=o(D,2);p(O,{name:`search_text`,type:`str`,defaultValue:`""`,description:`Filter by search text.`});var k=o(O,8);u(k,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0A%0Afor%20entry%20in%20function.logs.fetch(%0A%20%20%20%20since%3Ddatetime.now()%20-%20timedelta(hours%3D4)%2C%0A%20%20%20%20source%3D%22stdout%22%2C%0A)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var A=o(k,2);l(A,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var j=o(A,2);u(j,{code:`tail(self%2C%20entries%3D100%2C%20*%2C%20source%3DNone)`,lang:`python`});var M=o(j,6);p(M,{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`});var N=o(M,2);p(N,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var P=o(N,8);u(P,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0A%0Afor%20entry%20in%20function.logs.tail(20)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var F=o(P,2);l(F,{id:`logsstream`,children:(e,t)=>{s(),i(e,r(`logs.stream`))},$$slots:{default:!0}});var I=o(F,2);u(I,{code:`stream(self%2C%20timeout%3DNone)`,lang:`python`});var L=o(I,6);p(L,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted.`});var R=o(L,8);u(R,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0A%0Afor%20entry%20in%20function.logs.stream(timeout%3D60)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var z=o(R,2);c(z,{id:`update_autoscaler`,children:(e,t)=>{s(),i(e,r(`update_autoscaler`))},$$slots:{default:!0}});var B=o(z,2);u(B,{code:`update_autoscaler(self%2C%20*%2C%20min_containers%3DNone%2C%20max_containers%3DNone%2C%0A%20%20%20%20buffer_containers%3DNone%2C%20scaledown_window%3DNone)`,lang:`python`});var V=o(B,10);p(V,{name:`min_containers`,type:`int | None`,defaultValue:`None`,description:`Minimum number of containers to keep running.`});var H=o(V,2);p(H,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Maximum concurrent containers.`});var U=o(H,2);p(U,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Extra containers to keep warm beyond current demand.`});var W=o(U,2);p(W,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Maximum duration (in seconds) idle containers wait before scaling down.`});var G=o(W,8);u(G,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22function%22)%0A%0A%23%20Always%20have%20at%20least%202%20containers%20running%2C%20with%20an%20extra%20buffer%20when%20the%20Function%20is%20active%0Af.update_autoscaler(min_containers%3D2%2C%20buffer_containers%3D1)%0A%0A%23%20Limit%20this%20Function%20to%20avoid%20spinning%20up%20more%20than%205%20containers%0Af.update_autoscaler(max_containers%3D5)%0A%0A%23%20Extend%20the%20scaledown%20window%20to%20increase%20the%20amount%20of%20time%20that%20idle%20containers%20stay%20alive%0Af.update_autoscaler(scaledown_window%3D300)`,lang:`python`});var K=o(G,2);c(K,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var q=o(K,2);u(q,{code:`from_name(cls%2C%20app_name%2C%20name%2C%20*%2C%20version%3DNone%2C%20environment_name%3DNone%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var J=o(q,8);p(J,{name:`app_name`,type:`str`,description:`Name of the deployed App.`});var Y=o(J,2);p(Y,{name:`name`,type:`str`,description:"Name of the Function within that App. For class methods, use `Cls.from_name` instead."});var X=o(Y,2);p(X,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to look up the App in; defaults to the active environment.`});var de=o(X,2);p(de,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var fe=o(de,8);u(fe,{code:`f%20%3D%20modal.Function.from_name(%22other-app%22%2C%20%22function%22)`,lang:`python`});var pe=o(fe,4);u(pe,{code:`f_v3%20%3D%20modal.Function.from_name(%22other-app%22%2C%20%22function%22%2C%20version%3D3)`,lang:`python`});var me=o(pe,2);c(me,{id:`get_web_url`,children:(e,t)=>{s(),i(e,r(`get_web_url`))},$$slots:{default:!0}});var he=o(me,2);u(he,{code:`get_web_url(self)`,lang:`python`});var ge=o(he,8);c(ge,{id:`with_options`,children:(e,t)=>{s(),i(e,r(`with_options`))},$$slots:{default:!0}});var _e=o(ge,2);u(_e,{code:`with_options(self%2C%20*%2C%20cpu%3DNone%2C%20memory%3DNone%2C%20gpu%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%0A%20%20%20%20volumes%3D%7B%7D%2C%20retries%3DNone%2C%20max_containers%3DNone%2C%20buffer_containers%3DNone%2C%0A%20%20%20%20scaledown_window%3DNone%2C%20timeout%3DNone%2C%20region%3DNone%2C%20cloud%3DNone%2C%0A%20%20%20%20routing_region%3DNone)`,lang:`python`});var ve=o(_e,12);u(ve,{code:`fn%20%3D%20modal.Function.from_name(%22my_app%22%2C%20%22fn%22).with_options(gpu%3D%22H100%22)%0Afn.remote()%20%20%23%20will%20run%20on%20a%20H100%20GPU`,lang:`python`});var ye=o(ve,4);u(ye,{code:`%40app.function()%0Adef%20fn()%3A%0A%20%20%20%20...%0A%0A%23%20From%20a%20local%20entrypoint%20or%20another%20Function%0Afn.with_options(gpu%3D%22H100%22).remote()%20%20%23%20Uses%20an%20H100%20GPU%0Afn.remote()%20%20%23%20Uses%20the%20static%20configuration%20with%20no%20GPU`,lang:`python`});var be=o(ye,2);c(be,{id:`with_concurrency`,children:(e,t)=>{s(),i(e,r(`with_concurrency`))},$$slots:{default:!0}});var xe=o(be,2);u(xe,{code:`with_concurrency(self%2C%20*%2C%20max_inputs%2C%20target_inputs%3DNone)`,lang:`python`});var Se=o(xe,6);c(Se,{id:`with_batching`,children:(e,t)=>{s(),i(e,r(`with_batching`))},$$slots:{default:!0}});var Ce=o(Se,2);u(Ce,{code:`with_batching(self%2C%20*%2C%20max_batch_size%2C%20wait_ms)`,lang:`python`});var we=o(Ce,6);c(we,{id:`remote`,children:(e,t)=>{s(),i(e,r(`remote`))},$$slots:{default:!0}});var Te=o(we,2);u(Te,{code:`remote(self%2C%20*args%2C%20**kwargs)`,lang:`python`});var Ee=o(Te,6);p(Ee,{name:`*args`,type:`P.args`,description:`Positional arguments forwarded to the deployed function.`});var De=o(Ee,2);p(De,{name:`**kwargs`,type:`P.kwargs`,description:`Keyword arguments forwarded to the deployed function.`});var Oe=o(De,6);c(Oe,{id:`remote_gen`,children:(e,t)=>{s(),i(e,r(`remote_gen`))},$$slots:{default:!0}});var ke=o(Oe,2);u(ke,{code:`remote_gen(self%2C%20*args%2C%20**kwargs)`,lang:`python`});var Ae=o(ke,6);p(Ae,{name:`*args`,type:``,description:`Positional arguments forwarded to the deployed generator function.`});var je=o(Ae,2);p(je,{name:`**kwargs`,type:``,description:`Keyword arguments forwarded to the deployed generator function.`});var Me=o(je,6);c(Me,{id:`local`,children:(e,t)=>{s(),i(e,r(`local`))},$$slots:{default:!0}});var Ne=o(Me,2);u(Ne,{code:`local(self%2C%20*args%2C%20**kwargs)`,lang:`python`});var Pe=o(Ne,8);p(Pe,{name:`*args`,type:`P.args`,description:`Positional arguments passed to the underlying Python callable.`});var Fe=o(Pe,2);p(Fe,{name:`**kwargs`,type:`P.kwargs`,description:`Keyword arguments passed to the underlying Python callable.`});var Ie=o(Fe,6);c(Ie,{id:`spawn`,children:(e,t)=>{s(),i(e,r(`spawn`))},$$slots:{default:!0}});var Le=o(Ie,2);u(Le,{code:`spawn(self%2C%20*args%2C%20**kwargs)`,lang:`python`});var Re=o(Le,8);p(Re,{name:`*args`,type:`P.args`,description:`Positional arguments forwarded to the remote function.`});var ze=o(Re,2);p(ze,{name:`**kwargs`,type:`P.kwargs`,description:`Keyword arguments forwarded to the remote function.`});var Z=o(ze,4),Be=o(e(Z));f(Be,{href:`https://modal.com/docs/sdk/py/latest/FunctionCall`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),f(o(Be,2),{href:`https://modal.com/docs/sdk/py/latest/FunctionCall#get`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(),n(Z);var Ve=o(Z,2);c(Ve,{id:`get_raw_f`,children:(e,t)=>{s(),i(e,r(`get_raw_f`))},$$slots:{default:!0}});var He=o(Ve,2);u(He,{code:`get_raw_f(self)`,lang:`python`});var Ue=o(He,8);c(Ue,{id:`get_current_stats`,children:(e,t)=>{s(),i(e,r(`get_current_stats`))},$$slots:{default:!0}});var We=o(Ue,2);u(We,{code:`get_current_stats(self)`,lang:`python`});var Ge=o(We,8);c(Ge,{id:`map`,children:(e,t)=>{s(),i(e,r(`map`))},$$slots:{default:!0}});var Ke=o(Ge,2);u(Ke,{code:`map(self%2C%20*input_iterators%2C%20kwargs%3D%7B%7D%2C%20order_outputs%3DTrue%2C%0A%20%20%20%20return_exceptions%3DFalse%2C%20wrap_returned_exceptions%3DNone)`,lang:`python`});var qe=o(Ke,12);p(qe,{name:`*input_iterators`,type:`typing.Iterable[Any]`,description:`One iterator per mapped positional parameter on the function.`});var Je=o(qe,2);p(Je,{name:`kwargs`,type:``,defaultValue:`{}`,description:`Extra keyword arguments forwarded to every invocation.`});var Ye=o(Je,2);p(Ye,{name:`order_outputs`,type:`bool`,defaultValue:`True`,description:`If True, preserve input order in outputs; if False, use completion order.`});var Xe=o(Ye,2);p(Xe,{name:`return_exceptions`,type:`bool`,defaultValue:`False`,description:`If True, failed inputs appear as exceptions in the result stream instead of raising.`});var Ze=o(Xe,2);p(Ze,{name:`wrap_returned_exceptions`,type:`bool | None`,defaultValue:`None`,description:`Deprecated; no longer has any effect.`});var Qe=o(Ze,4);u(Qe,{code:`%40app.function()%0Adef%20my_func(a)%3A%0A%20%20%20%20return%20a%20**%202%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20assert%20list(my_func.map(%5B1%2C%202%2C%203%2C%204%5D))%20%3D%3D%20%5B1%2C%204%2C%209%2C%2016%5D`,lang:`python`});var $e=o(Qe,2);u($e,{code:`%40app.function()%0Adef%20my_func(a)%3A%0A%20%20%20%20if%20a%20%3D%3D%202%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%22ohno%22)%0A%20%20%20%20return%20a%20**%202%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20print(list(my_func.map(range(3)%2C%20return_exceptions%3DTrue)))`,lang:`python`});var et=o($e,2);c(et,{id:`starmap`,children:(e,t)=>{s(),i(e,r(`starmap`))},$$slots:{default:!0}});var tt=o(et,2);u(tt,{code:`starmap(self%2C%20input_iterator%2C%20*%2C%20kwargs%3D%7B%7D%2C%20order_outputs%3DTrue%2C%0A%20%20%20%20return_exceptions%3DFalse%2C%20wrap_returned_exceptions%3DNone)`,lang:`python`});var nt=o(tt,8);p(nt,{name:`input_iterator`,type:`typing.Iterable[typing.Sequence[Any]]`,description:`Iterable of argument tuples to unpack into each call.`});var Q=o(nt,2);p(Q,{name:`kwargs`,type:``,defaultValue:`{}`,description:`Extra keyword arguments forwarded to every invocation.`});var rt=o(Q,2);p(rt,{name:`order_outputs`,type:`bool`,defaultValue:`True`,description:`If True, preserve input order in outputs; if False, use completion order.`});var it=o(rt,2);p(it,{name:`return_exceptions`,type:`bool`,defaultValue:`False`,description:`If True, failed inputs appear as exceptions in the result stream instead of raising.`});var at=o(it,2);p(at,{name:`wrap_returned_exceptions`,type:`bool | None`,defaultValue:`None`,description:`Deprecated; no longer has any effect.`});var ot=o(at,4);u(ot,{code:`%40app.function()%0Adef%20my_func(a%2C%20b)%3A%0A%20%20%20%20return%20a%20%2B%20b%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20assert%20list(my_func.starmap(%5B(1%2C%202)%2C%20(3%2C%204)%5D))%20%3D%3D%20%5B3%2C%207%5D`,lang:`python`});var st=o(ot,2);c(st,{id:`for_each`,children:(e,t)=>{s(),i(e,r(`for_each`))},$$slots:{default:!0}});var ct=o(st,2);u(ct,{code:`for_each(self%2C%20*input_iterators%2C%20kwargs%3D%7B%7D%2C%20ignore_exceptions%3DFalse)`,lang:`python`});var lt=o(ct,8);p(lt,{name:`*input_iterators`,type:``,description:`One iterator per mapped positional parameter on the function.`});var ut=o(lt,2);p(ut,{name:`kwargs`,type:``,defaultValue:`{}`,description:`Extra keyword arguments forwarded to every invocation.`});var dt=o(ut,2);p(dt,{name:`ignore_exceptions`,type:`bool`,defaultValue:`False`,description:`If True, failures are swallowed instead of propagating.`});var ft=o(dt,2);c(ft,{id:`spawn_map`,children:(e,t)=>{s(),i(e,r(`spawn_map`))},$$slots:{default:!0}});var pt=o(ft,2);u(pt,{code:`spawn_map(self%2C%20*input_iterators%2C%20kwargs%3D%7B%7D)`,lang:`python`});var mt=o(pt,10);p(mt,{name:`*input_iterators`,type:``,description:`One iterator per mapped positional parameter on the function.`});var $=o(mt,2);p($,{name:`kwargs`,type:``,defaultValue:`{}`,description:`Extra keyword arguments forwarded to every invocation.`}),u(o($,4),{code:`%40app.function()%0Adef%20my_func(a)%3A%0A%20%20%20%20return%20a%20**%202%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20my_func.spawn_map(%5B1%2C%202%2C%203%2C%204%5D)`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=Hmkm8MGw.js.map
