(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b6ba118b-5e51-4636-9327-e6f49f84af4e`,e._sentryDebugIdIdentifier=`sentry-dbid-b6ba118b-5e51-4636-9327-e6f49f84af4e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Server`,id:`server`,children:[{depth:2,value:`object_id`,id:`object_id`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.fetch`,id:`logsfetch`},{depth:3,value:`logs.tail`,id:`logstail`},{depth:3,value:`logs.stream`,id:`logsstream`}]},{depth:2,value:`get_url`,id:`get_url`},{depth:2,value:`update_autoscaler`,id:`update_autoscaler`},{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`from_name`,id:`from_name`}]}],rawContent:`# Server


\`\`\`python
class Server(object)
\`\`\`

Server runs an HTTP server started in an \`@modal.enter\` method.

See the [guide](https://modal.com/docs/guide/servers) for more information.

Generally, you will not construct a Server directly.
Instead, use the [\`@app.server()\`](https://modal.com/docs/sdk/py/latest/App#server) decorator.

\`\`\`python notest
@app.server(port=8080, routing_region="us-east")
class MyServer:
    @modal.enter()
    def start_server(self):
        self.process = subprocess.Popen(["python3", "-m", "http.server", "8080"])
\`\`\`


## object_id

\`\`\`python
object_id(self)
\`\`\`
Modal's internal ID for this Server instance.

## logs


\`\`\`python
logs: ServerLogsManager
\`\`\`

Access logs for a \`Server\`.

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
Fetch Server logs corresponding to the date range and filters.

**Parameters**

<Parameter name="since" type="datetime" description="Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="until" type="datetime | None" defaultValue="None" description="Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />
<Parameter name="search_text" type="str" defaultValue="&quot;&quot;" description="Filter by search text." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
server = modal.Server.from_name("my-app", "web")

for entry in server.logs.fetch(
    since=datetime.now() - timedelta(minutes=25),
    source="stdout",
):
    print(entry.message, end="")
\`\`\`

### logs.tail

\`\`\`python
tail(self, entries=100, *, source=None)
\`\`\`
Fetch the most recent Server logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
server = modal.Server.from_name("my-app", "web")

for entry in server.logs.tail(20):
    print(entry.message, end="")
\`\`\`

### logs.stream

\`\`\`python
stream(self, timeout=None)
\`\`\`
Stream new Server logs until the timeout is reached.

**Parameters**

<Parameter name="timeout" type="float | None" defaultValue="None" description="Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted." />

**Yields**

\`LogEntry\` objects as they arrive.

**Usage**

\`\`\`python notest
server = modal.Server.from_name("my-app", "web")

for entry in server.logs.stream(timeout=60):
    print(entry.message, end="")
\`\`\`

## get_url

\`\`\`python
get_url(self)
\`\`\`
The URL for making requests to this Server.

## update_autoscaler

\`\`\`python
update_autoscaler(self, *, target_concurrency=None, min_containers=None,
    max_containers=None, buffer_containers=None, scaleup_window=None,
    scaledown_window=None)
\`\`\`
Override the current autoscaler behavior for this Server.

Unspecified parameters will retain their current value, i.e. either the static value
from the \`@app.server()\` decorator, or an override value from a previous call to this method.

Subsequent deployments of the App containing this Server will reset the autoscaler back to
its static configuration.

**Parameters**

<Parameter name="target_concurrency" type="float | None" defaultValue="None" description="Target number of concurrent requests per container. May be fractional, e.g. 1.5 to target three concurrent requests per two containers." />
<Parameter name="min_containers" type="int | None" defaultValue="None" description="Minimum number of containers to keep running regardless of demand." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Limit on the number of containers that can be concurrently running." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Extra containers to scale up beyond current demand." />
<Parameter name="scaleup_window" type="int | None" defaultValue="None" description="Seconds of sustained demand required before scaling up new containers." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Maximum duration (in seconds) idle containers wait before scaling down." />

**Returns**

A \`ServerAutoscalerSettings\` dataclass which contains the current autoscaler settings of
this Server after the call.

**Usage**

\`\`\`python notest
server = modal.Server.from_name("my-app", "Server")

# Always have at least 2 containers running, with an extra buffer of 2 containers
server.update_autoscaler(min_containers=2, buffer_containers=1)

# Limit this Server to avoid spinning up more than 5 containers
server.update_autoscaler(max_containers=5)

# Require 30 seconds of sustained demand before scaling up
server.update_autoscaler(scaleup_window=30)

# Adjust Server autoscaling to target 20 concurrent requests per replica
server.update_autoscaler(target_concurrency=20)

# Target three concurrent requests for every two containers
server.update_autoscaler(target_concurrency=1.5)

# Disable the Server autoscaling by setting target_concurrency to 0
server.update_autoscaler(target_concurrency=0)
\`\`\`

## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations will
lazily hydrate when needed. The main use case is when you need to access object
metadata, such as its ID.

## from_name

\`\`\`python
from_name(cls, app_name, name, *, environment_name=None, client=None)
\`\`\`
Reference a Server from a deployed App by its name.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.
`,meta:{title:`Server`,description:`Server runs an HTTP server started in an @modal.enter method.`}},{toc:h,rawContent:g,meta:_}=m,re=t(`<code>@app.server()</code>`),ie=t(`<code>fetch()</code>`),ae=t(`<code>tail()</code>`),oe=t(`<code>stream()</code>`),se=t(`<code>modal app logs</code>`),ce=t(`<!> <!> <p>Server runs an HTTP server started in an <code>@modal.enter</code> method.</p> <p>See the <!> for more information.</p> <p>Generally, you will not construct a Server directly.
Instead, use the <!> decorator.</p> <!> <!> <!> <p>Modal’s internal ID for this Server instance.</p> <!> <!> <p>Access logs for a <code>Server</code>.</p> <p>Use <!> to read logs from a UTC time range, <!> to read the most recent logs, and <!> to follow new logs as they arrive.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Fetch Server logs corresponding to the date range and filters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch the most recent Server logs.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Stream new Server logs until the timeout is reached.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects as they arrive.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>The URL for making requests to this Server.</p> <!> <!> <p>Override the current autoscaler behavior for this Server.</p> <p>Unspecified parameters will retain their current value, i.e. either the static value
from the <code>@app.server()</code> decorator, or an override value from a previous call to this method.</p> <p>Subsequent deployments of the App containing this Server will reset the autoscaler back to
its static configuration.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>ServerAutoscalerSettings</code> dataclass which contains the current autoscaler settings of
this Server after the call.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations will
lazily hydrate when needed. The main use case is when you need to access object
metadata, such as its ID.</p> <!> <!> <p>Reference a Server from a deployed App by its name.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p>`,1);function v(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ce(),d=te(a);ne(d,{id:`server`,children:(e,t)=>{s(),i(e,r(`Server`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Server(object)`,lang:`python`});var h=o(m,4);f(o(e(h)),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`guide`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/sdk/py/latest/App#server`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);u(_,{code:`%40app.server(port%3D8080%2C%20routing_region%3D%22us-east%22)%0Aclass%20MyServer%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start_server(self)%3A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(%5B%22python3%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%5D)`,lang:`python`});var v=o(_,2);c(v,{id:`object_id`,children:(e,t)=>{s(),i(e,r(`object_id`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`object_id(self)`,lang:`python`});var b=o(y,4);c(b,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var x=o(b,2);u(x,{code:`logs%3A%20ServerLogsManager`,lang:`python`});var S=o(x,4),C=o(e(S));f(C,{href:`#logsfetch`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var w=o(C,2);f(w,{href:`#logstail`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),f(o(w,2),{href:`#logsstream`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(S);var T=o(S,4),E=e(T);f(e(E),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(E),n(T);var D=o(T,2);l(D,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var O=o(D,2);u(O,{code:`fetch(self%2C%20*%2C%20since%2C%20until%3DNone%2C%20source%3DNone%2C%20search_text%3D%22%22)`,lang:`python`});var k=o(O,6);p(k,{name:`since`,type:`datetime`,description:`Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time.`});var A=o(k,2);p(A,{name:`until`,type:`datetime | None`,defaultValue:`None`,description:`Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time.`});var j=o(A,2);p(j,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var le=o(j,2);p(le,{name:`search_text`,type:`str`,defaultValue:`""`,description:`Filter by search text.`});var M=o(le,8);u(M,{code:`server%20%3D%20modal.Server.from_name(%22my-app%22%2C%20%22web%22)%0A%0Afor%20entry%20in%20server.logs.fetch(%0A%20%20%20%20since%3Ddatetime.now()%20-%20timedelta(minutes%3D25)%2C%0A%20%20%20%20source%3D%22stdout%22%2C%0A)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var N=o(M,2);l(N,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var P=o(N,2);u(P,{code:`tail(self%2C%20entries%3D100%2C%20*%2C%20source%3DNone)`,lang:`python`});var F=o(P,6);p(F,{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`});var I=o(F,2);p(I,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var L=o(I,8);u(L,{code:`server%20%3D%20modal.Server.from_name(%22my-app%22%2C%20%22web%22)%0A%0Afor%20entry%20in%20server.logs.tail(20)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var R=o(L,2);l(R,{id:`logsstream`,children:(e,t)=>{s(),i(e,r(`logs.stream`))},$$slots:{default:!0}});var z=o(R,2);u(z,{code:`stream(self%2C%20timeout%3DNone)`,lang:`python`});var B=o(z,6);p(B,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted.`});var V=o(B,8);u(V,{code:`server%20%3D%20modal.Server.from_name(%22my-app%22%2C%20%22web%22)%0A%0Afor%20entry%20in%20server.logs.stream(timeout%3D60)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var H=o(V,2);c(H,{id:`get_url`,children:(e,t)=>{s(),i(e,r(`get_url`))},$$slots:{default:!0}});var U=o(H,2);u(U,{code:`get_url(self)`,lang:`python`});var W=o(U,4);c(W,{id:`update_autoscaler`,children:(e,t)=>{s(),i(e,r(`update_autoscaler`))},$$slots:{default:!0}});var G=o(W,2);u(G,{code:`update_autoscaler(self%2C%20*%2C%20target_concurrency%3DNone%2C%20min_containers%3DNone%2C%0A%20%20%20%20max_containers%3DNone%2C%20buffer_containers%3DNone%2C%20scaleup_window%3DNone%2C%0A%20%20%20%20scaledown_window%3DNone)`,lang:`python`});var K=o(G,10);p(K,{name:`target_concurrency`,type:`float | None`,defaultValue:`None`,description:`Target number of concurrent requests per container. May be fractional, e.g. 1.5 to target three concurrent requests per two containers.`});var q=o(K,2);p(q,{name:`min_containers`,type:`int | None`,defaultValue:`None`,description:`Minimum number of containers to keep running regardless of demand.`});var J=o(q,2);p(J,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Limit on the number of containers that can be concurrently running.`});var Y=o(J,2);p(Y,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Extra containers to scale up beyond current demand.`});var X=o(Y,2);p(X,{name:`scaleup_window`,type:`int | None`,defaultValue:`None`,description:`Seconds of sustained demand required before scaling up new containers.`});var Z=o(X,2);p(Z,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Maximum duration (in seconds) idle containers wait before scaling down.`});var Q=o(Z,8);u(Q,{code:`server%20%3D%20modal.Server.from_name(%22my-app%22%2C%20%22Server%22)%0A%0A%23%20Always%20have%20at%20least%202%20containers%20running%2C%20with%20an%20extra%20buffer%20of%202%20containers%0Aserver.update_autoscaler(min_containers%3D2%2C%20buffer_containers%3D1)%0A%0A%23%20Limit%20this%20Server%20to%20avoid%20spinning%20up%20more%20than%205%20containers%0Aserver.update_autoscaler(max_containers%3D5)%0A%0A%23%20Require%2030%20seconds%20of%20sustained%20demand%20before%20scaling%20up%0Aserver.update_autoscaler(scaleup_window%3D30)%0A%0A%23%20Adjust%20Server%20autoscaling%20to%20target%2020%20concurrent%20requests%20per%20replica%0Aserver.update_autoscaler(target_concurrency%3D20)%0A%0A%23%20Target%20three%20concurrent%20requests%20for%20every%20two%20containers%0Aserver.update_autoscaler(target_concurrency%3D1.5)%0A%0A%23%20Disable%20the%20Server%20autoscaling%20by%20setting%20target_concurrency%20to%200%0Aserver.update_autoscaler(target_concurrency%3D0)`,lang:`python`});var ue=o(Q,2);c(ue,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var de=o(ue,2);u(de,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var $=o(de,6);c($,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}}),u(o($,2),{code:`from_name(cls%2C%20app_name%2C%20name%2C%20*%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`}),s(4),i(t,a)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=DUFahxHD2.js.map
