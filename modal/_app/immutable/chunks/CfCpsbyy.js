(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5fd37947-9b8d-45f6-b6a6-f022e0506ed5`,e._sentryDebugIdIdentifier=`sentry-dbid-5fd37947-9b8d-45f6-b6a6-f022e0506ed5`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`FunctionCall`,id:`functioncall`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.stream`,id:`logsstream`},{depth:3,value:`logs.tail`,id:`logstail`},{depth:3,value:`logs.fetch`,id:`logsfetch`}]},{depth:2,value:`num_inputs`,id:`num_inputs`},{depth:2,value:`get`,id:`get`},{depth:2,value:`iter`,id:`iter`},{depth:2,value:`get_call_graph`,id:`get_call_graph`},{depth:2,value:`cancel`,id:`cancel`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`gather`,id:`gather`}]}],rawContent:`# FunctionCall


\`\`\`python
class FunctionCall(typing.Generic, modal.object.Object)
\`\`\`

A reference to an executed function call.

Constructed using \`.spawn(...)\` on a Modal function with the same
arguments that a function normally takes. Acts as a reference to
an ongoing function call that can be passed around and used to
poll or fetch function results at some later time.

Conceptually similar to a Future/Promise/AsyncResult in other contexts and languages.


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
logs: FunctionCallLogsManager
\`\`\`

Access logs for a single \`FunctionCall\`.

Use [\`fetch()\`](#logsfetch)
to read logs from a UTC time range, [\`tail()\`](#logstail)
to read the most recent logs, and [\`stream()\`](#logsstream)
to follow new logs as they arrive.

**See Also**

- [\`modal app logs\`](https://modal.com/docs/cli/latest/app#modal-app-logs):
CLI access to logs for an App.


### logs.stream

\`\`\`python
stream(self, timeout=None)
\`\`\`
Stream new FunctionCall logs until the timeout is reached.
The timeout specifies the number of seconds to wait between log entries before terminating the stream.
This method will stop when the FunctionCall is observed to have completed,
or when the timeout is reached. The completion check is best-effort; if completion
cannot be determined, the stream will continue until the timeout is reached.

**Parameters**

<Parameter name="timeout" type="float | None" defaultValue="None" description="Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted." />

**Yields**

\`LogEntry\` objects as they arrive.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")
call = function.spawn()

for entry in call.logs.stream():
    print(entry.message, end="")
\`\`\`

### logs.tail

\`\`\`python
tail(self, entries=100, *, source=None)
\`\`\`
Fetch the most recent FunctionCall logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")
call = function.spawn()

for entry in call.logs.tail(entries=10):
    print(entry.timestamp, entry.message, end="")
\`\`\`

### logs.fetch

\`\`\`python
fetch(self, *, since=None, until=None, source=None, search_text="")
\`\`\`
Fetch all associated logs corresponding to the date range and filters.

**Parameters**

<Parameter name="since" type="datetime | None" defaultValue="None" description="Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time. By default, this will fetch logs from the start of the function call." />
<Parameter name="until" type="datetime | None" defaultValue="None" description="Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />
<Parameter name="search_text" type="str" defaultValue="&quot;&quot;" description="Filter by search text." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
function = modal.Function.from_name("my-app", "train")
call = function.spawn()

for entry in call.logs.fetch():
    print(entry.timestamp, entry.message, end="")
\`\`\`

## num_inputs

\`\`\`python
num_inputs(self)
\`\`\`
Get the number of inputs in the function call.

**Returns**

How many inputs this function call includes (e.g. \`1\` for \`.spawn()\`, more for \`.spawn_map()\`).

## get

\`\`\`python
get(self, timeout=None, *, index=0)
\`\`\`
Get the result of the index-th input of the function call.

\`.spawn()\` calls have a single output, so only specifying \`index=0\` is valid.
A non-zero index is useful when your function has multiple outputs, like via \`.spawn_map()\`.

This function waits indefinitely by default. It takes an optional
\`timeout\` argument that specifies the maximum number of seconds to wait,
which can be set to \`0\` to poll for an output immediately.

The returned coroutine is not cancellation-safe.

**Parameters**

<Parameter name="timeout" type="float | None" defaultValue="None" description="Maximum seconds to wait for a result, or \`None\` to wait indefinitely." />
<Parameter name="index" type="int" defaultValue="0" description="Which input&#x27;s result to retrieve (typically \`0\` for \`.spawn()\`)." />

**Returns**

The deserialized return value from that input.

## iter

\`\`\`python
iter(self, *, start=0, end=None)
\`\`\`
Iterate in-order over the results of the function call.

Optionally, specify a range [start, end) to iterate over.

If \`end\` is not provided, it will iterate over all results.

**Parameters**

<Parameter name="start" type="int" defaultValue="0" description="First input index to include (inclusive)." />
<Parameter name="end" type="int | None" defaultValue="None" description="One past the last index to include, or \`None\` for all remaining inputs." />

**Yields**

Each result value in index order.

**Usage**

\`\`\`python
@app.function()
def my_func(a):
    return a ** 2


@app.local_entrypoint()
def main():
    fc = my_func.spawn_map([1, 2, 3, 4])
    assert list(fc.iter()) == [1, 4, 9, 16]
    assert list(fc.iter(start=1, end=3)) == [4, 9]
\`\`\`

## get_call_graph

\`\`\`python
get_call_graph(self)
\`\`\`
Fetch information about the graph of Inputs this FunctionCall is part of.

Note: the call graph data is not populated in real-time, and its capture is best-effort.
We do not recommend relying on this method for critical use cases.

See the [\`modal.types\`](/docs/sdk/py/latest/types) reference for information
on the return values.

**Returns**

A list of \`InputInfo\` nodes describing the call graph.

## cancel

\`\`\`python
cancel(self, terminate_containers=False)
\`\`\`
Cancel the FunctionCall and terminate its inputs without retrying.

**Parameters**

<Parameter name="terminate_containers" type="bool" defaultValue="False" description="If True, terminate the containers running the cancelled inputs. Any other inputs running concurrently on those containers will be rescheduled." />

## from_id

\`\`\`python
from_id(cls, function_call_id, client=None)
\`\`\`
Instantiate a FunctionCall object from an existing ID.

Note that it's only necessary to re-instantiate the \`FunctionCall\` with this method
if you no longer have access to the original object returned from \`Function.spawn\`.

**Parameters**

<Parameter name="function_call_id" type="str" description="Object ID of an existing function call (e.g. from \`FunctionCall.object_id\`)." />
<Parameter name="client" type="&quot;modal.client.Client | None&quot;" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`FunctionCall\` handle for the given ID.

**Usage**

\`\`\`python notest
# Spawn a FunctionCall and keep track of its object ID
fc = my_func.spawn()
fc_id = fc.object_id

# Later, use the ID to re-instantiate the FunctionCall object
fc = FunctionCall.from_id(fc_id)
result = fc.get()
\`\`\`

## gather

\`\`\`python
gather(*function_calls)
\`\`\`
Wait until all Modal FunctionCall objects have results before returning.

Accepts a variable number of \`FunctionCall\` objects, as returned by \`Function.spawn()\`.

Raises an exception from the first failing function call.

*Added in v0.73.69*: This method replaces the deprecated \`modal.functions.gather\` function.

**Parameters**

<Parameter name="*function_calls" type="&quot;_FunctionCall[T]&quot;" description="\`FunctionCall\` instances to wait on (same order as the returned sequence)." />

**Returns**

Results in the same order as \`function_calls\` (like \`asyncio.gather\`).

**Usage**

\`\`\`python notest
fc1 = slow_func_1.spawn()
fc2 = slow_func_2.spawn()

result_1, result_2 = modal.FunctionCall.gather(fc1, fc2)
\`\`\`
`,meta:{title:`FunctionCall`,description:`A reference to an executed function call.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>fetch()</code>`),ae=t(`<code>tail()</code>`),oe=t(`<code>stream()</code>`),se=t(`<code>modal app logs</code>`),ce=t(`<code>modal.types</code>`),le=t(`<!> <!> <p>A reference to an executed function call.</p> <p>Constructed using <code>.spawn(...)</code> on a Modal function with the same
arguments that a function normally takes. Acts as a reference to
an ongoing function call that can be passed around and used to
poll or fetch function results at some later time.</p> <p>Conceptually similar to a Future/Promise/AsyncResult in other contexts and languages.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Access logs for a single <code>FunctionCall</code>.</p> <p>Use <!> to read logs from a UTC time range, <!> to read the most recent logs, and <!> to follow new logs as they arrive.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Stream new FunctionCall logs until the timeout is reached.
The timeout specifies the number of seconds to wait between log entries before terminating the stream.
This method will stop when the FunctionCall is observed to have completed,
or when the timeout is reached. The completion check is best-effort; if completion
cannot be determined, the stream will continue until the timeout is reached.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects as they arrive.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch the most recent FunctionCall logs.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch all associated logs corresponding to the date range and filters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Get the number of inputs in the function call.</p> <p><strong>Returns</strong></p> <p>How many inputs this function call includes (e.g. <code>1</code> for <code>.spawn()</code>, more for <code>.spawn_map()</code>).</p> <!> <!> <p>Get the result of the index-th input of the function call.</p> <p><code>.spawn()</code> calls have a single output, so only specifying <code>index=0</code> is valid.
A non-zero index is useful when your function has multiple outputs, like via <code>.spawn_map()</code>.</p> <p>This function waits indefinitely by default. It takes an optional <code>timeout</code> argument that specifies the maximum number of seconds to wait,
which can be set to <code>0</code> to poll for an output immediately.</p> <p>The returned coroutine is not cancellation-safe.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>The deserialized return value from that input.</p> <!> <!> <p>Iterate in-order over the results of the function call.</p> <p>Optionally, specify a range [start, end) to iterate over.</p> <p>If <code>end</code> is not provided, it will iterate over all results.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p>Each result value in index order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch information about the graph of Inputs this FunctionCall is part of.</p> <p>Note: the call graph data is not populated in real-time, and its capture is best-effort.
We do not recommend relying on this method for critical use cases.</p> <p>See the <!> reference for information
on the return values.</p> <p><strong>Returns</strong></p> <p>A list of <code>InputInfo</code> nodes describing the call graph.</p> <!> <!> <p>Cancel the FunctionCall and terminate its inputs without retrying.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Instantiate a FunctionCall object from an existing ID.</p> <p>Note that it’s only necessary to re-instantiate the <code>FunctionCall</code> with this method
if you no longer have access to the original object returned from <code>Function.spawn</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>FunctionCall</code> handle for the given ID.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Wait until all Modal FunctionCall objects have results before returning.</p> <p>Accepts a variable number of <code>FunctionCall</code> objects, as returned by <code>Function.spawn()</code>.</p> <p>Raises an exception from the first failing function call.</p> <p><em>Added in v0.73.69</em>: This method replaces the deprecated <code>modal.functions.gather</code> function.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>Results in the same order as <code>function_calls</code> (like <code>asyncio.gather</code>).</p> <p><strong>Usage</strong></p> <!>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=le(),d=te(a);ne(d,{id:`functioncall`,children:(e,t)=>{s(),i(e,r(`FunctionCall`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20FunctionCall(typing.Generic%2C%20modal.object.Object)`,lang:`python`});var h=o(m,8);c(h,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var g=o(h,2);u(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var re=o(g,8);c(re,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var _=o(re,2);u(_,{code:`logs%3A%20FunctionCallLogsManager`,lang:`python`});var v=o(_,4),y=o(e(v));f(y,{href:`#logsfetch`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var b=o(y,2);f(b,{href:`#logstail`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),f(o(b,2),{href:`#logsstream`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(v);var x=o(v,4),S=e(x);f(e(S),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(S),n(x);var C=o(x,2);l(C,{id:`logsstream`,children:(e,t)=>{s(),i(e,r(`logs.stream`))},$$slots:{default:!0}});var w=o(C,2);u(w,{code:`stream(self%2C%20timeout%3DNone)`,lang:`python`});var T=o(w,6);p(T,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted.`});var E=o(T,8);u(E,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0Acall%20%3D%20function.spawn()%0A%0Afor%20entry%20in%20call.logs.stream()%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var D=o(E,2);l(D,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var O=o(D,2);u(O,{code:`tail(self%2C%20entries%3D100%2C%20*%2C%20source%3DNone)`,lang:`python`});var k=o(O,6);p(k,{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`});var A=o(k,2);p(A,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var j=o(A,8);u(j,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0Acall%20%3D%20function.spawn()%0A%0Afor%20entry%20in%20call.logs.tail(entries%3D10)%3A%0A%20%20%20%20print(entry.timestamp%2C%20entry.message%2C%20end%3D%22%22)`,lang:`python`});var M=o(j,2);l(M,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var N=o(M,2);u(N,{code:`fetch(self%2C%20*%2C%20since%3DNone%2C%20until%3DNone%2C%20source%3DNone%2C%20search_text%3D%22%22)`,lang:`python`});var P=o(N,6);p(P,{name:`since`,type:`datetime | None`,defaultValue:`None`,description:`Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time. By default, this will fetch logs from the start of the function call.`});var F=o(P,2);p(F,{name:`until`,type:`datetime | None`,defaultValue:`None`,description:`Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time.`});var ue=o(F,2);p(ue,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var I=o(ue,2);p(I,{name:`search_text`,type:`str`,defaultValue:`""`,description:`Filter by search text.`});var L=o(I,8);u(L,{code:`function%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22train%22)%0Acall%20%3D%20function.spawn()%0A%0Afor%20entry%20in%20call.logs.fetch()%3A%0A%20%20%20%20print(entry.timestamp%2C%20entry.message%2C%20end%3D%22%22)`,lang:`python`});var R=o(L,2);c(R,{id:`num_inputs`,children:(e,t)=>{s(),i(e,r(`num_inputs`))},$$slots:{default:!0}});var z=o(R,2);u(z,{code:`num_inputs(self)`,lang:`python`});var B=o(z,8);c(B,{id:`get`,children:(e,t)=>{s(),i(e,r(`get`))},$$slots:{default:!0}});var V=o(B,2);u(V,{code:`get(self%2C%20timeout%3DNone%2C%20*%2C%20index%3D0)`,lang:`python`});var H=o(V,12);p(H,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:"Maximum seconds to wait for a result, or `None` to wait indefinitely."});var U=o(H,2);p(U,{name:`index`,type:`int`,defaultValue:`0`,description:"Which input's result to retrieve (typically `0` for `.spawn()`)."});var W=o(U,6);c(W,{id:`iter`,children:(e,t)=>{s(),i(e,r(`iter`))},$$slots:{default:!0}});var G=o(W,2);u(G,{code:`iter(self%2C%20*%2C%20start%3D0%2C%20end%3DNone)`,lang:`python`});var K=o(G,10);p(K,{name:`start`,type:`int`,defaultValue:`0`,description:`First input index to include (inclusive).`});var q=o(K,2);p(q,{name:`end`,type:`int | None`,defaultValue:`None`,description:"One past the last index to include, or `None` for all remaining inputs."});var J=o(q,8);u(J,{code:`%40app.function()%0Adef%20my_func(a)%3A%0A%20%20%20%20return%20a%20**%202%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20fc%20%3D%20my_func.spawn_map(%5B1%2C%202%2C%203%2C%204%5D)%0A%20%20%20%20assert%20list(fc.iter())%20%3D%3D%20%5B1%2C%204%2C%209%2C%2016%5D%0A%20%20%20%20assert%20list(fc.iter(start%3D1%2C%20end%3D3))%20%3D%3D%20%5B4%2C%209%5D`,lang:`python`});var Y=o(J,2);c(Y,{id:`get_call_graph`,children:(e,t)=>{s(),i(e,r(`get_call_graph`))},$$slots:{default:!0}});var X=o(Y,2);u(X,{code:`get_call_graph(self)`,lang:`python`});var Z=o(X,6);f(o(e(Z)),{href:`/docs/sdk/py/latest/types`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(Z);var de=o(Z,6);c(de,{id:`cancel`,children:(e,t)=>{s(),i(e,r(`cancel`))},$$slots:{default:!0}});var fe=o(de,2);u(fe,{code:`cancel(self%2C%20terminate_containers%3DFalse)`,lang:`python`});var pe=o(fe,6);p(pe,{name:`terminate_containers`,type:`bool`,defaultValue:`False`,description:`If True, terminate the containers running the cancelled inputs. Any other inputs running concurrently on those containers will be rescheduled.`});var me=o(pe,2);c(me,{id:`from_id`,children:(e,t)=>{s(),i(e,r(`from_id`))},$$slots:{default:!0}});var Q=o(me,2);u(Q,{code:`from_id(cls%2C%20function_call_id%2C%20client%3DNone)`,lang:`python`});var he=o(Q,8);p(he,{name:`function_call_id`,type:`str`,description:"Object ID of an existing function call (e.g. from `FunctionCall.object_id`)."});var ge=o(he,2);p(ge,{name:`client`,type:`"modal.client.Client | None"`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var _e=o(ge,8);u(_e,{code:`%23%20Spawn%20a%20FunctionCall%20and%20keep%20track%20of%20its%20object%20ID%0Afc%20%3D%20my_func.spawn()%0Afc_id%20%3D%20fc.object_id%0A%0A%23%20Later%2C%20use%20the%20ID%20to%20re-instantiate%20the%20FunctionCall%20object%0Afc%20%3D%20FunctionCall.from_id(fc_id)%0Aresult%20%3D%20fc.get()`,lang:`python`});var ve=o(_e,2);c(ve,{id:`gather`,children:(e,t)=>{s(),i(e,r(`gather`))},$$slots:{default:!0}});var ye=o(ve,2);u(ye,{code:`gather(*function_calls)`,lang:`python`});var $=o(ye,12);p($,{name:`*function_calls`,type:`"_FunctionCall[T]"`,description:"`FunctionCall` instances to wait on (same order as the returned sequence)."}),u(o($,8),{code:`fc1%20%3D%20slow_func_1.spawn()%0Afc2%20%3D%20slow_func_2.spawn()%0A%0Aresult_1%2C%20result_2%20%3D%20modal.FunctionCall.gather(fc1%2C%20fc2)`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=CfCpsbyy.js.map
