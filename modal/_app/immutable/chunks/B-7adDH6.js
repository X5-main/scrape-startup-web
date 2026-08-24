(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c8cc3d35-5891-44fb-aeb6-6c424daae70c`,e._sentryDebugIdIdentifier=`sentry-dbid-c8cc3d35-5891-44fb-aeb6-6c424daae70c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";import{t as g}from"./D0Ft4u302.js";var _={toc:[{depth:1,value:`Invoking deployed Functions`,id:`invoking-deployed-functions`,children:[{depth:2,value:`Use cases`,id:`use-cases`},{depth:2,value:`Invocation patterns`,id:`invocation-patterns`},{depth:2,value:`Version-pinned lookups`,id:`version-pinned-lookups`},{depth:2,value:`Authentication`,id:`authentication`},{depth:2,value:`Limitations`,id:`limitations`},{depth:2,value:`Invoking with HTTPS`,id:`invoking-with-https`}]}],rawContent:`# Invoking deployed Functions

Modal Functions in [deployed Apps](/docs/guide/managing-deployments) can be invoked
from outside of the App's source by performing a _Function lookup_:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
result = f.remote()
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
result = await f.remote.aio()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const f = await modal.functions.fromName("my-app", "f");
result = await f.remote();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
f, _ := mc.Functions.FromName(ctx, "my-app", "f", nil)
result, err := f.Remote(ctx, nil, nil)
\`\`\`

{/snippet}
</CodeTabs>

Function lookups are scoped by the name of the App, the Function's name within
that App, and optionally the [environment](/docs/guide/environments) the App is
deployed in. Note that lookups are supported only for _deployed_ Apps. Looking up
a Function will fail if its App is [ephemeral](/docs/guide/apps#ephemeral-apps),
e.g. running via the \`modal serve\` CLI.

## Use cases

Function lookups are useful when you want to treat your Modal App as a remote
service.

For example, you may wish to organize your Modal codebase into multiple
loosely-coupled Apps with distinct deployment lifecycles. Lookups allow
Functions in these Apps to call each other as if they were members of the same
App.

You may also have a codebase outside of Modal that needs to execute certain
operations that would benefit from Modal's scalable compute. Modal Function
lookups turn that into a simple function call, automatically handling the
serialization and deserialization of arguments, results, and exceptions.
With Modal's [JS and Go SDKs](/docs/guide/sdk-javascript-go), the calling
codebase does not even need to be written in Python.

## Invocation patterns

Any remote invocation method can be used after looking up a Function handle.

For example, you can spawn a background execution and poll its status:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
function_call = f.spawn(42)

# Poll for the result without blocking by passing timeout=0.
try:
    result = function_call.get(timeout=0)
except TimeoutError:
    result = None  # still running
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
function_call = await f.spawn.aio(42)

# Poll for the result without blocking by passing timeout=0.
try:
    result = await function_call.get.aio(timeout=0)
except TimeoutError:
    result = None  # still running
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const f = await modal.functions.fromName("my-app", "f");
const functionCall = await f.spawn([42]);

// Poll for the result without blocking by passing timeoutMs: 0.
let result;
try {
  result = await functionCall.get({ timeoutMs: 0 });
} catch (err) {
  if (!(err instanceof FunctionTimeoutError)) throw err;
  result = null; // still running
}
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
f, _ := mc.Functions.FromName(ctx, "my-app", "f", nil)
functionCall, _ := f.Spawn(ctx, []any{42}, nil)

// Poll for the result without blocking by passing a zero *time.Duration timeout
zero := time.Duration(0)
result, err := functionCall.Get(ctx, &modal.FunctionCallGetParams{Timeout: &zero})
// A non-nil err indicates the call is still running.
\`\`\`

{/snippet}
</CodeTabs>

Or you can distribute embarrassingly parallel work across multiple containers:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
results = list(f.map(range(5)))
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f")
results = [result async for result in f.map.aio(range(5))]
\`\`\`

{/snippet}
</CodeTabs>

Note: \`Function.map()\` is currently supported only in Python.

When your Function is defined as a Modal Cls, you can pass
[parameters](/docs/guide/parametrized-functions) and invoke
specific methods after a lookup:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
Model = modal.Cls.from_name("my-app", "Model")
obj = Model(size="35B")
result = obj.generate.remote("hello")
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
Model = modal.Cls.from_name("my-app", "Model")
obj = Model(size="35B")
result = await obj.generate.remote.aio("hello")
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const cls = await modal.cls.fromName("my-app", "Model");
const obj = await cls.instance({ size: "35B" });
const generate = obj.method("generate");
const result = await generate.remote(["hello"]);
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
cls, _ := mc.Cls.FromName(ctx, "my-app", "Model", nil)
obj, _ := cls.Instance(ctx, map[string]any{"size": "35B"})
generate, _ := obj.Method("generate")
result, _ := generate.Remote(ctx, []any{"hello"}, nil)
\`\`\`

{/snippet}
</CodeTabs>

It's also possible to
[dynamically configure](/docs/guide/dynamic-function-config) a Function
or Cls via a remote lookup. For example, you can select a GPU type that
aligns with the specific model you are invoking:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
Model = modal.Cls.from_name("my-app", "Model")
obj = Model.with_options(gpu="H100")(size="35B")
result = obj.generate.remote("hello")
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
Model = modal.Cls.from_name("my-app", "Model")
obj = Model.with_options(gpu="H100")(size="35B")
result = await obj.generate.remote.aio("hello")
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const cls = await modal.cls.fromName("my-app", "Model");
const obj = await cls.withOptions({ gpu: "H100" }).instance({ size: "35B" });
const generate = obj.method("generate");
const result = await generate.remote(["hello"]);
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
cls, _ := mc.Cls.FromName(ctx, "my-app", "Model", nil)
gpu := "H100"
obj, _ := cls.
	WithOptions(&modal.ClsWithOptionsParams{GPU: &gpu}).
	Instance(ctx, map[string]any{"size": "35B"})
generate, _ := obj.Method("generate")
result, _ := generate.Remote(ctx, []any{"hello"}, nil)
\`\`\`

{/snippet}
</CodeTabs>

## Version-pinned lookups

<Callout variant="gated-feature">

Version-pinned lookups are available on the <a href="/pricing">Team and Enterprise plans</a>.
Visit <a href="/settings/plans">workspace settings</a> to upgrade.

</Callout>

All Function invocations will route to the "latest" available version of the
App by default. During a
[rolling deployment](/docs/guide/managing-deployments#deployment-strategies),
this may correspond to an outdated version, but repeated invocation of the
Function handle will eventually reach the most recent deploy without any
need to refresh the handle.

It's also possible to look up a specific version of the App, which returns a
"version-pinned" Function handle:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f", version=3)
result = f.remote()
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
f = modal.Function.from_name("my-app", "f", version=3)
result = await f.remote.aio()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const f = await modal.functions.fromName("my-app", "f", { version: 3 });
result = await f.remote();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
f, _ := mc.Functions.FromName(ctx, "my-app", "f", &modal.FunctionFromNameParams{Version: 3})
result, err := f.Remote(ctx, nil, nil)
\`\`\`

{/snippet}
</CodeTabs>

If the version-pinned Function directly calls other Functions in the same App,
those calls will also be guaranteed to run on the same version (which is not
generally the case across deployments, even for calls within the same App).

Version-pinned invocations have a few tradeoffs. Principally, version-pinned
invocations will be handled by a distinct pool of containers with special rules
around autoscaling:

- Containers handling version-pinned invocations are not included in the
  Function's main \`max_containers\` budget. Instead, the limit will be applied at
  the level of _individual versions_. You must account for this if each container
  consumes a limited resource (e.g., a connection to a database).
- Version-pinned Functions will ignore the \`min_containers\` configuration in the
  Function decorator, and they will not maintain a warm pool by default. If this
  is desired, the \`Function.update_autoscaler()\` method can be used to
  dynamically configure a warm pool. It is the user's responsibility to scale the
  warm pool down after it is no longer needed.

Version pinning is supported only for App versions within your retention window
(i.e., versions that you could also roll back to). Longer retention windows are
available on the Enterprise plan.

## Authentication

Function lookups are authenticated via Modal [API tokens](/settings/tokens).
These tokens implicitly specify the Workspace targeted by the lookup.

Tokens are automatically read from the active profile in your \`~/.modal.toml\`
file. They can also be configured via the \`MODAL_TOKEN_ID\` and
\`MODAL_TOKEN_SECRET\` environment variables. These take precedence over the
\`~/.modal.toml\` when set.

## Limitations

While you can use any remote invocation method on a Function handle after a
lookup, \`.local()\` invocation is not supported, because the implementation
will not be available locally.

Unlike with remote calls between Functions in the same Python App, the
Function interfaces will not be legible to type checkers after a lookup.
Your code will have to explicitly narrow the result to treat it as a
concrete type.

## Invoking with HTTPS

Modal [Web Functions](/docs/guide/webhooks) can be invoked via HTTPS at a
[public URL](/docs/guide/webhook-urls).

Unlike Function lookups via one of our SDKs, Web Functions are not
authenticated by default, and authenticated Web Functions use
[Proxy Tokens](/docs/guide/webhook-proxy-auth) instead of Modal API tokens.

Web Functions can be invoked from web browsers, from Unix tools like
\`curl\`, or from any language with an HTTPS client.
`,meta:{title:`Invoking deployed Functions`,description:`Modal Functions in deployed Apps can be invoked from outside of the App’s source by performing a Function lookup:`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<p>Version-pinned lookups are available on the <a href="/pricing">Team and Enterprise plans</a>.
Visit <a href="/settings/plans">workspace settings</a> to upgrade.</p>`),S=t(`<!> <p>Modal Functions in <!> can be invoked
from outside of the App’s source by performing a <em>Function lookup</em>:</p> <!> <p>Function lookups are scoped by the name of the App, the Function’s name within
that App, and optionally the <!> the App is
deployed in. Note that lookups are supported only for <em>deployed</em> Apps. Looking up
a Function will fail if its App is <!>,
e.g. running via the <code>modal serve</code> CLI.</p> <!> <p>Function lookups are useful when you want to treat your Modal App as a remote
service.</p> <p>For example, you may wish to organize your Modal codebase into multiple
loosely-coupled Apps with distinct deployment lifecycles. Lookups allow
Functions in these Apps to call each other as if they were members of the same
App.</p> <p>You may also have a codebase outside of Modal that needs to execute certain
operations that would benefit from Modal’s scalable compute. Modal Function
lookups turn that into a simple function call, automatically handling the
serialization and deserialization of arguments, results, and exceptions.
With Modal’s <!>, the calling
codebase does not even need to be written in Python.</p> <!> <p>Any remote invocation method can be used after looking up a Function handle.</p> <p>For example, you can spawn a background execution and poll its status:</p> <!> <p>Or you can distribute embarrassingly parallel work across multiple containers:</p> <!> <p>Note: <code>Function.map()</code> is currently supported only in Python.</p> <p>When your Function is defined as a Modal Cls, you can pass <!> and invoke
specific methods after a lookup:</p> <!> <p>It’s also possible to <!> a Function
or Cls via a remote lookup. For example, you can select a GPU type that
aligns with the specific model you are invoking:</p> <!> <!> <!> <p>All Function invocations will route to the “latest” available version of the
App by default. During a <!>,
this may correspond to an outdated version, but repeated invocation of the
Function handle will eventually reach the most recent deploy without any
need to refresh the handle.</p> <p>It’s also possible to look up a specific version of the App, which returns a
“version-pinned” Function handle:</p> <!> <p>If the version-pinned Function directly calls other Functions in the same App,
those calls will also be guaranteed to run on the same version (which is not
generally the case across deployments, even for calls within the same App).</p> <p>Version-pinned invocations have a few tradeoffs. Principally, version-pinned
invocations will be handled by a distinct pool of containers with special rules
around autoscaling:</p> <ul><li>Containers handling version-pinned invocations are not included in the
Function’s main <code>max_containers</code> budget. Instead, the limit will be applied at
the level of <em>individual versions</em>. You must account for this if each container
consumes a limited resource (e.g., a connection to a database).</li> <li>Version-pinned Functions will ignore the <code>min_containers</code> configuration in the
Function decorator, and they will not maintain a warm pool by default. If this
is desired, the <code>Function.update_autoscaler()</code> method can be used to
dynamically configure a warm pool. It is the user’s responsibility to scale the
warm pool down after it is no longer needed.</li></ul> <p>Version pinning is supported only for App versions within your retention window
(i.e., versions that you could also roll back to). Longer retention windows are
available on the Enterprise plan.</p> <!> <p>Function lookups are authenticated via Modal <!>.
These tokens implicitly specify the Workspace targeted by the lookup.</p> <p>Tokens are automatically read from the active profile in your <code>~/.modal.toml</code> file. They can also be configured via the <code>MODAL_TOKEN_ID</code> and <code>MODAL_TOKEN_SECRET</code> environment variables. These take precedence over the <code>~/.modal.toml</code> when set.</p> <!> <p>While you can use any remote invocation method on a Function handle after a
lookup, <code>.local()</code> invocation is not supported, because the implementation
will not be available locally.</p> <p>Unlike with remote calls between Functions in the same Python App, the
Function interfaces will not be legible to type checkers after a lookup.
Your code will have to explicitly narrow the result to treat it as a
concrete type.</p> <!> <p>Modal <!> can be invoked via HTTPS at a <!>.</p> <p>Unlike Function lookups via one of our SDKs, Web Functions are not
authenticated by default, and authenticated Web Functions use <!> instead of Modal API tokens.</p> <p>Web Functions can be invoked from web browsers, from Unix tools like <code>curl</code>, or from any language with an HTTPS client.</p>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`invoking-deployed-functions`,children:(e,t)=>{l(),i(e,r(`Invoking deployed Functions`))},$$slots:{default:!0}});var _=c(m,2);h(c(e(_)),{href:`/docs/guide/managing-deployments`,children:(e,t)=>{l(),i(e,r(`deployed Apps`))},$$slots:{default:!0}}),l(3),n(_);var v=c(_,2);g(v,{python:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Aresult%20%3D%20f.remote()`,lang:`python`})},python_async:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Aresult%20%3D%20await%20f.remote.aio()`,lang:`python`})},javascript:e=>{p(e,{code:`const%20f%20%3D%20await%20modal.functions.fromName(%22my-app%22%2C%20%22f%22)%3B%0Aresult%20%3D%20await%20f.remote()%3B`,lang:`javascript`})},go:e=>{p(e,{code:`f%2C%20_%20%3A%3D%20mc.Functions.FromName(ctx%2C%20%22my-app%22%2C%20%22f%22%2C%20nil)%0Aresult%2C%20err%20%3A%3D%20f.Remote(ctx%2C%20nil%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var y=c(v,2),b=c(e(y));h(b,{href:`/docs/guide/environments`,children:(e,t)=>{l(),i(e,r(`environment`))},$$slots:{default:!0}}),h(c(b,4),{href:`/docs/guide/apps#ephemeral-apps`,children:(e,t)=>{l(),i(e,r(`ephemeral`))},$$slots:{default:!0}}),l(3),n(y);var C=c(y,2);d(C,{id:`use-cases`,children:(e,t)=>{l(),i(e,r(`Use cases`))},$$slots:{default:!0}});var w=c(C,6);h(c(e(w)),{href:`/docs/guide/sdk-javascript-go`,children:(e,t)=>{l(),i(e,r(`JS and Go SDKs`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);d(T,{id:`invocation-patterns`,children:(e,t)=>{l(),i(e,r(`Invocation patterns`))},$$slots:{default:!0}});var E=c(T,6);g(E,{python:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Afunction_call%20%3D%20f.spawn(42)%0A%0A%23%20Poll%20for%20the%20result%20without%20blocking%20by%20passing%20timeout%3D0.%0Atry%3A%0A%20%20%20%20result%20%3D%20function_call.get(timeout%3D0)%0Aexcept%20TimeoutError%3A%0A%20%20%20%20result%20%3D%20None%20%20%23%20still%20running`,lang:`python`})},python_async:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Afunction_call%20%3D%20await%20f.spawn.aio(42)%0A%0A%23%20Poll%20for%20the%20result%20without%20blocking%20by%20passing%20timeout%3D0.%0Atry%3A%0A%20%20%20%20result%20%3D%20await%20function_call.get.aio(timeout%3D0)%0Aexcept%20TimeoutError%3A%0A%20%20%20%20result%20%3D%20None%20%20%23%20still%20running`,lang:`python`})},javascript:e=>{p(e,{code:`const%20f%20%3D%20await%20modal.functions.fromName(%22my-app%22%2C%20%22f%22)%3B%0Aconst%20functionCall%20%3D%20await%20f.spawn(%5B42%5D)%3B%0A%0A%2F%2F%20Poll%20for%20the%20result%20without%20blocking%20by%20passing%20timeoutMs%3A%200.%0Alet%20result%3B%0Atry%20%7B%0A%20%20result%20%3D%20await%20functionCall.get(%7B%20timeoutMs%3A%200%20%7D)%3B%0A%7D%20catch%20(err)%20%7B%0A%20%20if%20(!(err%20instanceof%20FunctionTimeoutError))%20throw%20err%3B%0A%20%20result%20%3D%20null%3B%20%2F%2F%20still%20running%0A%7D`,lang:`javascript`})},go:e=>{p(e,{code:`f%2C%20_%20%3A%3D%20mc.Functions.FromName(ctx%2C%20%22my-app%22%2C%20%22f%22%2C%20nil)%0AfunctionCall%2C%20_%20%3A%3D%20f.Spawn(ctx%2C%20%5B%5Dany%7B42%7D%2C%20nil)%0A%0A%2F%2F%20Poll%20for%20the%20result%20without%20blocking%20by%20passing%20a%20zero%20*time.Duration%20timeout%0Azero%20%3A%3D%20time.Duration(0)%0Aresult%2C%20err%20%3A%3D%20functionCall.Get(ctx%2C%20%26modal.FunctionCallGetParams%7BTimeout%3A%20%26zero%7D)%0A%2F%2F%20A%20non-nil%20err%20indicates%20the%20call%20is%20still%20running.`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var D=c(E,4);g(D,{python:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Aresults%20%3D%20list(f.map(range(5)))`,lang:`python`})},python_async:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22)%0Aresults%20%3D%20%5Bresult%20async%20for%20result%20in%20f.map.aio(range(5))%5D`,lang:`python`})},$$slots:{python:!0,python_async:!0}});var O=c(D,4);h(c(e(O)),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{l(),i(e,r(`parameters`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);g(k,{python:e=>{p(e,{code:`Model%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22Model%22)%0Aobj%20%3D%20Model(size%3D%2235B%22)%0Aresult%20%3D%20obj.generate.remote(%22hello%22)`,lang:`python`})},python_async:e=>{p(e,{code:`Model%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22Model%22)%0Aobj%20%3D%20Model(size%3D%2235B%22)%0Aresult%20%3D%20await%20obj.generate.remote.aio(%22hello%22)`,lang:`python`})},javascript:e=>{p(e,{code:`const%20cls%20%3D%20await%20modal.cls.fromName(%22my-app%22%2C%20%22Model%22)%3B%0Aconst%20obj%20%3D%20await%20cls.instance(%7B%20size%3A%20%2235B%22%20%7D)%3B%0Aconst%20generate%20%3D%20obj.method(%22generate%22)%3B%0Aconst%20result%20%3D%20await%20generate.remote(%5B%22hello%22%5D)%3B`,lang:`javascript`})},go:e=>{p(e,{code:`cls%2C%20_%20%3A%3D%20mc.Cls.FromName(ctx%2C%20%22my-app%22%2C%20%22Model%22%2C%20nil)%0Aobj%2C%20_%20%3A%3D%20cls.Instance(ctx%2C%20map%5Bstring%5Dany%7B%22size%22%3A%20%2235B%22%7D)%0Agenerate%2C%20_%20%3A%3D%20obj.Method(%22generate%22)%0Aresult%2C%20_%20%3A%3D%20generate.Remote(ctx%2C%20%5B%5Dany%7B%22hello%22%7D%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var A=c(k,2);h(c(e(A)),{href:`/docs/guide/dynamic-function-config`,children:(e,t)=>{l(),i(e,r(`dynamically configure`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);g(j,{python:e=>{p(e,{code:`Model%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22Model%22)%0Aobj%20%3D%20Model.with_options(gpu%3D%22H100%22)(size%3D%2235B%22)%0Aresult%20%3D%20obj.generate.remote(%22hello%22)`,lang:`python`})},python_async:e=>{p(e,{code:`Model%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22Model%22)%0Aobj%20%3D%20Model.with_options(gpu%3D%22H100%22)(size%3D%2235B%22)%0Aresult%20%3D%20await%20obj.generate.remote.aio(%22hello%22)`,lang:`python`})},javascript:e=>{p(e,{code:`const%20cls%20%3D%20await%20modal.cls.fromName(%22my-app%22%2C%20%22Model%22)%3B%0Aconst%20obj%20%3D%20await%20cls.withOptions(%7B%20gpu%3A%20%22H100%22%20%7D).instance(%7B%20size%3A%20%2235B%22%20%7D)%3B%0Aconst%20generate%20%3D%20obj.method(%22generate%22)%3B%0Aconst%20result%20%3D%20await%20generate.remote(%5B%22hello%22%5D)%3B`,lang:`javascript`})},go:e=>{p(e,{code:`cls%2C%20_%20%3A%3D%20mc.Cls.FromName(ctx%2C%20%22my-app%22%2C%20%22Model%22%2C%20nil)%0Agpu%20%3A%3D%20%22H100%22%0Aobj%2C%20_%20%3A%3D%20cls.%0A%09WithOptions(%26modal.ClsWithOptionsParams%7BGPU%3A%20%26gpu%7D).%0A%09Instance(ctx%2C%20map%5Bstring%5Dany%7B%22size%22%3A%20%2235B%22%7D)%0Agenerate%2C%20_%20%3A%3D%20obj.Method(%22generate%22)%0Aresult%2C%20_%20%3A%3D%20generate.Remote(ctx%2C%20%5B%5Dany%7B%22hello%22%7D%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var M=c(j,2);d(M,{id:`version-pinned-lookups`,children:(e,t)=>{l(),i(e,r(`Version-pinned lookups`))},$$slots:{default:!0}});var N=c(M,2);u(N,{variant:`gated-feature`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var P=c(N,2);h(c(e(P)),{href:`/docs/guide/managing-deployments#deployment-strategies`,children:(e,t)=>{l(),i(e,r(`rolling deployment`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,4);g(F,{python:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22%2C%20version%3D3)%0Aresult%20%3D%20f.remote()`,lang:`python`})},python_async:e=>{p(e,{code:`f%20%3D%20modal.Function.from_name(%22my-app%22%2C%20%22f%22%2C%20version%3D3)%0Aresult%20%3D%20await%20f.remote.aio()`,lang:`python`})},javascript:e=>{p(e,{code:`const%20f%20%3D%20await%20modal.functions.fromName(%22my-app%22%2C%20%22f%22%2C%20%7B%20version%3A%203%20%7D)%3B%0Aresult%20%3D%20await%20f.remote()%3B`,lang:`javascript`})},go:e=>{p(e,{code:`f%2C%20_%20%3A%3D%20mc.Functions.FromName(ctx%2C%20%22my-app%22%2C%20%22f%22%2C%20%26modal.FunctionFromNameParams%7BVersion%3A%203%7D)%0Aresult%2C%20err%20%3A%3D%20f.Remote(ctx%2C%20nil%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var I=c(F,10);d(I,{id:`authentication`,children:(e,t)=>{l(),i(e,r(`Authentication`))},$$slots:{default:!0}});var L=c(I,2);h(c(e(L)),{href:`/settings/tokens`,children:(e,t)=>{l(),i(e,r(`API tokens`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,4);d(R,{id:`limitations`,children:(e,t)=>{l(),i(e,r(`Limitations`))},$$slots:{default:!0}});var z=c(R,6);d(z,{id:`invoking-with-https`,children:(e,t)=>{l(),i(e,r(`Invoking with HTTPS`))},$$slots:{default:!0}});var B=c(z,2),V=c(e(B));h(V,{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),h(c(V,2),{href:`/docs/guide/webhook-urls`,children:(e,t)=>{l(),i(e,r(`public URL`))},$$slots:{default:!0}}),l(),n(B);var H=c(B,2);h(c(e(H)),{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{l(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}}),l(),n(H),l(2),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=B-7adDH6.js.map
