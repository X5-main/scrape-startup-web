(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c4425d86-2d3a-4be6-808c-1bf3f83bcfe6`,e._sentryDebugIdIdentifier=`sentry-dbid-c4425d86-2d3a-4be6-808c-1bf3f83bcfe6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Dynamic Function configuration`,id:`dynamic-function-configuration`,children:[{depth:2,value:`Basic configuration`,id:`basic-configuration`},{depth:2,value:`Input concurrency and batching`,id:`input-concurrency-and-batching`},{depth:2,value:`Autoscaling considerations`,id:`autoscaling-considerations`},{depth:2,value:`Dynamic Cls configuration`,id:`dynamic-cls-configuration`}]}],rawContent:`# Dynamic Function configuration

Many aspects of a Modal Function's configuration can be dynamically configured from a specific call site. This is useful in cases where the Function's [compute resources](/docs/guide/resources), [secrets](/docs/guide/secrets), [timeout](/docs/guide/timeouts), or other properties need to vary depending on the specific inputs.

## Basic configuration

Features exposed in the [\`@app.function()\`](/docs/sdk/py/latest/App#function) decorator can be dynamically configured at runtime with the [\`modal.Function.with_options()\`](/docs/sdk/py/latest/Function#with_options) method.

Say you have the following definition:

\`\`\`python
@app.function()
def f(x: int) -> int:
    return x ** 2
\`\`\`

If (for some reason) you wanted to compare this Function's output across several different GPUs, you could invoke it several times with different configurations:

\`\`\`python continuation
@app.local_entrypoint()
def main():
    for gpu in ["T4", "L4", "A10"]:
        result = f.with_options(gpu=gpu).remote(2)
        print(f"Result with {gpu} GPU: {result}")
\`\`\`

This example creates three additional variants of the base Function after the App is already running. These variants are _new Functions_ that are created on-demand. The base Function itself is not affected. If you invoked \`f.remote()\` directly, it would continue to execute without a GPU.

Deployed Functions can also be dynamically configured from a call site after a lookup:

\`\`\`python notest
deployed_f = modal.Function.from_name("demo-app", "f")
for gpu in ["T4", "L4", "A10"]:
    result = deployed_f.with_options(gpu=gpu).remote(2)
    print(f"Result with {gpu} GPU: {result}")
\`\`\`

## Input concurrency and batching

It's also possible to dynamically configure [input concurrency](/docs/guide/concurrent-inputs) or [batching](/docs/guide/dynamic-batching). As these features are enabled with separate decorators ([\`@modal.concurrent()\`](/docs/sdk/py/latest/concurrent)/[\`@modal.batched()\`](/docs/sdk/py/latest/batched)), their dynamic configuration runs through separate methods ([\`modal.Function.with_concurrency()\`](/docs/sdk/py/latest/Function#with_concurrency)/[\`modal.Function.with_batching()\`](/docs/sdk/py/latest/Function#with_batching)):

\`\`\`python notest
concurrent_f = modal.Function.from_name("demo-app", "f").with_concurrency(max_inputs=32)
\`\`\`

If multiple dynamic configuration methods are called in sequence, their arguments will compose and form a single configuration:

\`\`\`python notest
# This Function uses a GPU with input concurrency
concurrent_f.with_options(gpu="H100").remote(...)
\`\`\`

## Autoscaling considerations

Each distinct configuration has its own dedicated autoscaling container pool. By default, the container pool will autoscale according to the configuration of the base Function, with separate accounting. For example, if your Function has \`@app.function(max_containers=5)\` and you dynamically add a GPU using \`f.with_options(gpu="H100")\`, you'll get up to 5 _additional_ H100 containers regardless of how many CPU containers are currently running.

Try to avoid generating too many fine-grained configurations so that you can benefit from container sharing for higher utilization and reduced cold start latencies. For example, if requesting input-specific \`memory=\` or \`cpu=\` resources, it's best to round into coarse buckets.

Functions that have been looked up and dynamically configured in separate processes will still share containers if they apply the same configuration.

If your base Function configuration has \`min_containers\` set, it will be ignored by the Function variants to avoid creating zombie warm pools. For the same reason, it's not possible to set \`min_containers\` in \`modal.Function.with_options()\`.

It is possible to dynamically configure other aspects of autoscaling behavior using \`modal.Function.with_options()\`. For example, if you don't expect to re-use the variant, you could reduce the \`scaledown_window\` so that the container shuts down faster. However, if your goal is to use different autoscaling policies over time, it may be simpler to modify the base Function's behavior using [\`modal.Function.update_autoscaler\`](/docs/sdk/py/latest/Function#update_autoscaler) instead.

## Dynamic Cls configuration

It's also possible to dynamically configure a \`modal.Cls\`. If the Cls is [parametrized](/docs/guide/parametrized-functions) (which also creates a new Function variant with its own container pool and autoscaling accounting), the dynamic options will compose with the parameter values:

\`\`\`python notest
ModelCls = modal.Cls.from_name("demo-app", "ModelCls")
model = ModelCls.with_options(gpu="H100")(size="8B")
\`\`\`
`,meta:{title:`Dynamic Function configuration`,description:`Many aspects of a Modal Function’s configuration can be dynamically configured from a specific call site. This is useful in cases where the Function’s compute resources, secrets, timeout, or other properties need to vary depending on the specific inputs.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>@app.function()</code>`),b=t(`<code>modal.Function.with_options()</code>`),x=t(`<code>@modal.concurrent()</code>`),S=t(`<code>@modal.batched()</code>`),C=t(`<code>modal.Function.with_concurrency()</code>`),w=t(`<code>modal.Function.with_batching()</code>`),T=t(`<code>modal.Function.update_autoscaler</code>`),E=t(`<!> <p>Many aspects of a Modal Function’s configuration can be dynamically configured from a specific call site. This is useful in cases where the Function’s <!>, <!>, <!>, or other properties need to vary depending on the specific inputs.</p> <!> <p>Features exposed in the <!> decorator can be dynamically configured at runtime with the <!> method.</p> <p>Say you have the following definition:</p> <!> <p>If (for some reason) you wanted to compare this Function’s output across several different GPUs, you could invoke it several times with different configurations:</p> <!> <p>This example creates three additional variants of the base Function after the App is already running. These variants are <em>new Functions</em> that are created on-demand. The base Function itself is not affected. If you invoked <code>f.remote()</code> directly, it would continue to execute without a GPU.</p> <p>Deployed Functions can also be dynamically configured from a call site after a lookup:</p> <!> <!> <p>It’s also possible to dynamically configure <!> or <!>. As these features are enabled with separate decorators (<!>/<!>), their dynamic configuration runs through separate methods (<!>/<!>):</p> <!> <p>If multiple dynamic configuration methods are called in sequence, their arguments will compose and form a single configuration:</p> <!> <!> <p>Each distinct configuration has its own dedicated autoscaling container pool. By default, the container pool will autoscale according to the configuration of the base Function, with separate accounting. For example, if your Function has <code>@app.function(max_containers=5)</code> and you dynamically add a GPU using <code>f.with_options(gpu="H100")</code>, you’ll get up to 5 <em>additional</em> H100 containers regardless of how many CPU containers are currently running.</p> <p>Try to avoid generating too many fine-grained configurations so that you can benefit from container sharing for higher utilization and reduced cold start latencies. For example, if requesting input-specific <code>memory=</code> or <code>cpu=</code> resources, it’s best to round into coarse buckets.</p> <p>Functions that have been looked up and dynamically configured in separate processes will still share containers if they apply the same configuration.</p> <p>If your base Function configuration has <code>min_containers</code> set, it will be ignored by the Function variants to avoid creating zombie warm pools. For the same reason, it’s not possible to set <code>min_containers</code> in <code>modal.Function.with_options()</code>.</p> <p>It is possible to dynamically configure other aspects of autoscaling behavior using <code>modal.Function.with_options()</code>. For example, if you don’t expect to re-use the variant, you could reduce the <code>scaledown_window</code> so that the container shuts down faster. However, if your goal is to use different autoscaling policies over time, it may be simpler to modify the base Function’s behavior using <!> instead.</p> <!> <p>It’s also possible to dynamically configure a <code>modal.Cls</code>. If the Cls is <!> (which also creates a new Function variant with its own container pool and autoscaling accounting), the dynamic options will compose with the parameter values:</p> <!>`,1);function D(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=E(),p=s(o);d(p,{id:`dynamic-function-configuration`,children:(e,t)=>{l(),i(e,r(`Dynamic Function configuration`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`/docs/guide/resources`,children:(e,t)=>{l(),i(e,r(`compute resources`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`/docs/guide/secrets`,children:(e,t)=>{l(),i(e,r(`secrets`))},$$slots:{default:!0}}),m(c(_,2),{href:`/docs/guide/timeouts`,children:(e,t)=>{l(),i(e,r(`timeout`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,2);u(v,{id:`basic-configuration`,children:(e,t)=>{l(),i(e,r(`Basic configuration`))},$$slots:{default:!0}});var D=c(v,2),O=c(e(D));m(O,{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),m(c(O,2),{href:`/docs/sdk/py/latest/Function#with_options`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(D);var k=c(D,4);f(k,{code:`%40app.function()%0Adef%20f(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20return%20x%20**%202`,lang:`python`});var A=c(k,4);f(A,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20for%20gpu%20in%20%5B%22T4%22%2C%20%22L4%22%2C%20%22A10%22%5D%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20f.with_options(gpu%3Dgpu).remote(2)%0A%20%20%20%20%20%20%20%20print(f%22Result%20with%20%7Bgpu%7D%20GPU%3A%20%7Bresult%7D%22)`,lang:`python`});var j=c(A,6);f(j,{code:`deployed_f%20%3D%20modal.Function.from_name(%22demo-app%22%2C%20%22f%22)%0Afor%20gpu%20in%20%5B%22T4%22%2C%20%22L4%22%2C%20%22A10%22%5D%3A%0A%20%20%20%20result%20%3D%20deployed_f.with_options(gpu%3Dgpu).remote(2)%0A%20%20%20%20print(f%22Result%20with%20%7Bgpu%7D%20GPU%3A%20%7Bresult%7D%22)`,lang:`python`});var M=c(j,2);u(M,{id:`input-concurrency-and-batching`,children:(e,t)=>{l(),i(e,r(`Input concurrency and batching`))},$$slots:{default:!0}});var N=c(M,2),P=c(e(N));m(P,{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{l(),i(e,r(`input concurrency`))},$$slots:{default:!0}});var F=c(P,2);m(F,{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{l(),i(e,r(`batching`))},$$slots:{default:!0}});var I=c(F,2);m(I,{href:`/docs/sdk/py/latest/concurrent`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var L=c(I,2);m(L,{href:`/docs/sdk/py/latest/batched`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var R=c(L,2);m(R,{href:`/docs/sdk/py/latest/Function#with_concurrency`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),m(c(R,2),{href:`/docs/sdk/py/latest/Function#with_batching`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(N);var z=c(N,2);f(z,{code:`concurrent_f%20%3D%20modal.Function.from_name(%22demo-app%22%2C%20%22f%22).with_concurrency(max_inputs%3D32)`,lang:`python`});var B=c(z,4);f(B,{code:`%23%20This%20Function%20uses%20a%20GPU%20with%20input%20concurrency%0Aconcurrent_f.with_options(gpu%3D%22H100%22).remote(...)`,lang:`python`});var V=c(B,2);u(V,{id:`autoscaling-considerations`,children:(e,t)=>{l(),i(e,r(`Autoscaling considerations`))},$$slots:{default:!0}});var H=c(V,10);m(c(e(H),5),{href:`/docs/sdk/py/latest/Function#update_autoscaler`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);u(U,{id:`dynamic-cls-configuration`,children:(e,t)=>{l(),i(e,r(`Dynamic Cls configuration`))},$$slots:{default:!0}});var W=c(U,2);m(c(e(W),3),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{l(),i(e,r(`parametrized`))},$$slots:{default:!0}}),l(),n(W),f(c(W,2),{code:`ModelCls%20%3D%20modal.Cls.from_name(%22demo-app%22%2C%20%22ModelCls%22)%0Amodel%20%3D%20ModelCls.with_options(gpu%3D%22H100%22)(size%3D%228B%22)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{D as default,h as metadata};
//# sourceMappingURL=ebEAAz7U2.js.map
