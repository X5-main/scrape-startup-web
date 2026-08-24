(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9d17ba1d-3688-4907-b682-d0388d4c0444`,e._sentryDebugIdIdentifier=`sentry-dbid-9d17ba1d-3688-4907-b682-d0388d4c0444`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as ne}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`Cls`,id:`cls`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`with_options`,id:`with_options`},{depth:2,value:`with_concurrency`,id:`with_concurrency`},{depth:2,value:`with_batching`,id:`with_batching`}]}],rawContent:`# Cls


\`\`\`python
class Cls(modal.object.Object)
\`\`\`

Cls adds method pooling and [lifecycle hook](https://modal.com/docs/guide/lifecycle-functions) behavior
to [modal.Function](https://modal.com/docs/sdk/py/latest/Function).

Generally, you will not construct a Cls directly.
Instead, use the [\`@app.cls()\`](https://modal.com/docs/sdk/py/latest/App#cls) decorator on the App object.


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## from_name

\`\`\`python
from_name(cls, app_name, name, *, version=None, environment_name=None,
    client=None)
\`\`\`
Reference a Cls from a deployed App by its name.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.

**Parameters**

<Parameter name="app_name" type="str" description="Name of the deployed App that defines this class." />
<Parameter name="name" type="str" description="Object tag of the Cls within that App." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Workspace environment for the lookup; defaults to the active environment." />
<Parameter name="client" type="&quot;_Client | None&quot;" defaultValue="None" description="Optional Modal client; defaults to the process client." />

**Returns**

A \`\`Cls\`\` reference that hydrates on first use.

**Usage**

\`\`\`python
Model = modal.Cls.from_name("other-app", "Model")
\`\`\`

The \`version\` parameter constructs a version-pinned Cls:

\`\`\`python
Modelv3 = modal.Cls.from_name("other-app", "Model", version=3)
\`\`\`

## with_options

\`\`\`python
with_options(self, *, cpu=None, memory=None, gpu=None, env=None, secrets=None,
    volumes={}, retries=None, max_containers=None, buffer_containers=None,
    scaledown_window=None, timeout=None, region=None, cloud=None,
    routing_region=None)
\`\`\`
Override the static Cls configuration with invocation-specific values.

This method will return a new variant of the Cls that will autoscale independently of the
base configuration.

Note that options cannot be "unset" with this method (i.e., if a GPU is configured in the
\`@app.cls()\` decorator, passing \`gpu=None\` here will not create a CPU-only instance).

Container arguments (\`\`volumes\`\` and \`\`secrets\`\`) from later calls replace earlier values; they are not merged.

**Parameters**

<Parameter name="cpu" type="float | tuple[float, float] | None" defaultValue="None" description="CPU cores for instances created from this Cls (see \`\`@app.function\`\` / \`\`@app.cls\`\` resource options)." />
<Parameter name="memory" type="int | tuple[int, int] | None" defaultValue="None" description="Memory in MiB, or min/max pair, for those instances." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type string, for example \`\`A100\`\`." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables merged into a temporary secret for this configuration." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Additional secrets attached to the service function." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume | _CloudBucketMount]" defaultValue="&#123;&#125;" description="Volume and cloud-bucket mounts (paths to \`\`Volume\`\` or \`\`CloudBucketMount\`\`)." />
<Parameter name="retries" type="int | Retries | None" defaultValue="None" description="Retry policy or count for invocations." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Cap on concurrently running containers for this Cls configuration." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Extra idle containers kept warm while the Function is active." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Seconds a container may stay idle before scaling down." />
<Parameter name="timeout" type="int | None" defaultValue="None" description="Function timeout in seconds." />
<Parameter name="region" type="str | Sequence[str] | None" defaultValue="None" description="One region or a list of regions to schedule on." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider (for example \`\`aws\`\`, \`\`gcp\`\`, \`\`oci\`\`, or \`\`auto\`\`)." />
<Parameter name="routing_region" type="str | None" defaultValue="None" description="Region that inputs and outputs are routed through for this Cls." />

**Returns**

A new \`\`Cls\`\` with the merged options.

**Usage**

You can use this method after looking up the Cls from a deployed App or if you have a
direct reference to a Cls from another Function or local entrypoint on its App:

\`\`\`python notest
Model = modal.Cls.from_name("my_app", "Model")
ModelUsingGPU = Model.with_options(gpu="A100")
ModelUsingGPU().generate.remote(input_prompt)  # Run with an A100 GPU
\`\`\`

The method can be called multiple times to "stack" updates:

\`\`\`python notest
Model.with_options(gpu="A100").with_options(scaledown_window=300)  # Use an A100 with slow scaledown
\`\`\`

## with_concurrency

\`\`\`python
with_concurrency(self, *, max_inputs, target_inputs=None)
\`\`\`
Override the static Cls configuration with invocation-specific input concurrency settings.

**Parameters**

<Parameter name="max_inputs" type="int" description="Maximum number of inputs processed concurrently per container." />
<Parameter name="target_inputs" type="int | None" defaultValue="None" description="Optional target concurrency; see \`\`@app.cls\`\` / Function concurrency docs." />

**Returns**

A new \`\`Cls\`\` with the merged concurrency settings.

**Usage**

\`\`\`python notest
Model = modal.Cls.from_name("my_app", "Model")
ModelUsingGPU = Model.with_options(gpu="A100").with_concurrency(max_inputs=100)
ModelUsingGPU().generate.remote(42)  # will run on an A100 GPU with input concurrency enabled
\`\`\`

## with_batching

\`\`\`python
with_batching(self, *, max_batch_size, wait_ms)
\`\`\`
Override the static Cls configuration with invocation-specific dynamic batching settings.

**Parameters**

<Parameter name="max_batch_size" type="int" description="Maximum batch size for dynamic batching." />
<Parameter name="wait_ms" type="int" description="Maximum time to wait to fill a batch, in milliseconds." />

**Returns**

A new \`\`Cls\`\` with the merged batching settings.

**Usage**

\`\`\`python notest
Model = modal.Cls.from_name("my_app", "Model")
ModelUsingGPU = Model.with_options(gpu="A100").with_batching(max_batch_size=100, wait_ms=1000)
ModelUsingGPU().generate.remote(42)  # A100 with dynamic batching
\`\`\`
`,meta:{title:`Cls`,description:`Cls adds method pooling and lifecycle hook behavior to modal.Function.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`<code>@app.cls()</code>`),ie=t(`<!> <!> <p>Cls adds method pooling and <!> behavior
to <!>.</p> <p>Generally, you will not construct a Cls directly.
Instead, use the <!> decorator on the App object.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Reference a Cls from a deployed App by its name.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Cls</code> reference that hydrates on first use.</p> <p><strong>Usage</strong></p> <!> <p>The <code>version</code> parameter constructs a version-pinned Cls:</p> <!> <!> <!> <p>Override the static Cls configuration with invocation-specific values.</p> <p>This method will return a new variant of the Cls that will autoscale independently of the
base configuration.</p> <p>Note that options cannot be “unset” with this method (i.e., if a GPU is configured in the <code>@app.cls()</code> decorator, passing <code>gpu=None</code> here will not create a CPU-only instance).</p> <p>Container arguments (<code>volumes</code> and <code>secrets</code>) from later calls replace earlier values; they are not merged.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Cls</code> with the merged options.</p> <p><strong>Usage</strong></p> <p>You can use this method after looking up the Cls from a deployed App or if you have a
direct reference to a Cls from another Function or local entrypoint on its App:</p> <!> <p>The method can be called multiple times to “stack” updates:</p> <!> <!> <!> <p>Override the static Cls configuration with invocation-specific input concurrency settings.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Cls</code> with the merged concurrency settings.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Override the static Cls configuration with invocation-specific dynamic batching settings.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Cls</code> with the merged batching settings.</p> <p><strong>Usage</strong></p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ie(),u=te(a);ne(u,{id:`cls`,children:(e,t)=>{s(),i(e,r(`Cls`))},$$slots:{default:!0}});var p=o(u,2);l(p,{code:`class%20Cls(modal.object.Object)`,lang:`python`});var m=o(p,2),h=o(e(m));d(h,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`lifecycle hook`))},$$slots:{default:!0}}),d(o(h,2),{href:`https://modal.com/docs/sdk/py/latest/Function`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`modal.Function`))},$$slots:{default:!0}}),s(),n(m);var g=o(m,2);d(o(e(g)),{href:`https://modal.com/docs/sdk/py/latest/App#cls`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var v=o(_,2);l(v,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var y=o(v,8);c(y,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var b=o(y,2);l(b,{code:`from_name(cls%2C%20app_name%2C%20name%2C%20*%2C%20version%3DNone%2C%20environment_name%3DNone%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var x=o(b,8);f(x,{name:`app_name`,type:`str`,description:`Name of the deployed App that defines this class.`});var S=o(x,2);f(S,{name:`name`,type:`str`,description:`Object tag of the Cls within that App.`});var C=o(S,2);f(C,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Workspace environment for the lookup; defaults to the active environment.`});var w=o(C,2);f(w,{name:`client`,type:`"_Client | None"`,defaultValue:`None`,description:`Optional Modal client; defaults to the process client.`});var T=o(w,8);l(T,{code:`Model%20%3D%20modal.Cls.from_name(%22other-app%22%2C%20%22Model%22)`,lang:`python`});var E=o(T,4);l(E,{code:`Modelv3%20%3D%20modal.Cls.from_name(%22other-app%22%2C%20%22Model%22%2C%20version%3D3)`,lang:`python`});var D=o(E,2);c(D,{id:`with_options`,children:(e,t)=>{s(),i(e,r(`with_options`))},$$slots:{default:!0}});var O=o(D,2);l(O,{code:`with_options(self%2C%20*%2C%20cpu%3DNone%2C%20memory%3DNone%2C%20gpu%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%0A%20%20%20%20volumes%3D%7B%7D%2C%20retries%3DNone%2C%20max_containers%3DNone%2C%20buffer_containers%3DNone%2C%0A%20%20%20%20scaledown_window%3DNone%2C%20timeout%3DNone%2C%20region%3DNone%2C%20cloud%3DNone%2C%0A%20%20%20%20routing_region%3DNone)`,lang:`python`});var k=o(O,12);f(k,{name:`cpu`,type:`float | tuple[float, float] | None`,defaultValue:`None`,description:"CPU cores for instances created from this Cls (see ``@app.function`` / ``@app.cls`` resource options)."});var A=o(k,2);f(A,{name:`memory`,type:`int | tuple[int, int] | None`,defaultValue:`None`,description:`Memory in MiB, or min/max pair, for those instances.`});var j=o(A,2);f(j,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:"GPU type string, for example ``A100``."});var M=o(j,2);f(M,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables merged into a temporary secret for this configuration.`});var N=o(M,2);f(N,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Additional secrets attached to the service function.`});var P=o(N,2);f(P,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume | _CloudBucketMount]`,defaultValue:`{}`,description:"Volume and cloud-bucket mounts (paths to ``Volume`` or ``CloudBucketMount``)."});var F=o(P,2);f(F,{name:`retries`,type:`int | Retries | None`,defaultValue:`None`,description:`Retry policy or count for invocations.`});var I=o(F,2);f(I,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Cap on concurrently running containers for this Cls configuration.`});var L=o(I,2);f(L,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Extra idle containers kept warm while the Function is active.`});var R=o(L,2);f(R,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Seconds a container may stay idle before scaling down.`});var z=o(R,2);f(z,{name:`timeout`,type:`int | None`,defaultValue:`None`,description:`Function timeout in seconds.`});var B=o(z,2);f(B,{name:`region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`One region or a list of regions to schedule on.`});var V=o(B,2);f(V,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:"Cloud provider (for example ``aws``, ``gcp``, ``oci``, or ``auto``)."});var H=o(V,2);f(H,{name:`routing_region`,type:`str | None`,defaultValue:`None`,description:`Region that inputs and outputs are routed through for this Cls.`});var U=o(H,10);l(U,{code:`Model%20%3D%20modal.Cls.from_name(%22my_app%22%2C%20%22Model%22)%0AModelUsingGPU%20%3D%20Model.with_options(gpu%3D%22A100%22)%0AModelUsingGPU().generate.remote(input_prompt)%20%20%23%20Run%20with%20an%20A100%20GPU`,lang:`python`});var W=o(U,4);l(W,{code:`Model.with_options(gpu%3D%22A100%22).with_options(scaledown_window%3D300)%20%20%23%20Use%20an%20A100%20with%20slow%20scaledown`,lang:`python`});var G=o(W,2);c(G,{id:`with_concurrency`,children:(e,t)=>{s(),i(e,r(`with_concurrency`))},$$slots:{default:!0}});var K=o(G,2);l(K,{code:`with_concurrency(self%2C%20*%2C%20max_inputs%2C%20target_inputs%3DNone)`,lang:`python`});var q=o(K,6);f(q,{name:`max_inputs`,type:`int`,description:`Maximum number of inputs processed concurrently per container.`});var J=o(q,2);f(J,{name:`target_inputs`,type:`int | None`,defaultValue:`None`,description:"Optional target concurrency; see ``@app.cls`` / Function concurrency docs."});var Y=o(J,8);l(Y,{code:`Model%20%3D%20modal.Cls.from_name(%22my_app%22%2C%20%22Model%22)%0AModelUsingGPU%20%3D%20Model.with_options(gpu%3D%22A100%22).with_concurrency(max_inputs%3D100)%0AModelUsingGPU().generate.remote(42)%20%20%23%20will%20run%20on%20an%20A100%20GPU%20with%20input%20concurrency%20enabled`,lang:`python`});var X=o(Y,2);c(X,{id:`with_batching`,children:(e,t)=>{s(),i(e,r(`with_batching`))},$$slots:{default:!0}});var Z=o(X,2);l(Z,{code:`with_batching(self%2C%20*%2C%20max_batch_size%2C%20wait_ms)`,lang:`python`});var Q=o(Z,6);f(Q,{name:`max_batch_size`,type:`int`,description:`Maximum batch size for dynamic batching.`});var $=o(Q,2);f($,{name:`wait_ms`,type:`int`,description:`Maximum time to wait to fill a batch, in milliseconds.`}),l(o($,8),{code:`Model%20%3D%20modal.Cls.from_name(%22my_app%22%2C%20%22Model%22)%0AModelUsingGPU%20%3D%20Model.with_options(gpu%3D%22A100%22).with_batching(max_batch_size%3D100%2C%20wait_ms%3D1000)%0AModelUsingGPU().generate.remote(42)%20%20%23%20A100%20with%20dynamic%20batching`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=BVkumFzG.js.map
