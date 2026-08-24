(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`25071ee5-9648-4fcc-8a89-49a8f33c5648`,e._sentryDebugIdIdentifier=`sentry-dbid-25071ee5-9648-4fcc-8a89-49a8f33c5648`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";import{t as g}from"./D0Ft4u302.js";var _={description:`Configure CPU, memory, and other resources for Modal Sandboxes. Modal's usage based pricing and ability to burst beyond requests enable cost-efficient resource allocation.`,crossLinks:[{text:`Reserving CPU and memory`,href:`/docs/guide/resources`},{text:`Sandboxes overview`,href:`/docs/guide/sandboxes`},{text:`Sandbox pricing`,href:`/pricing#sandboxes`}],toc:[{depth:1,value:`Sandbox resources and pricing`,id:`sandbox-resources-and-pricing`,children:[{depth:2,value:`Pay for what you use`,id:`pay-for-what-you-use`},{depth:2,value:`Configuring resources`,id:`configuring-resources`,children:[{depth:3,value:`Resource limits`,id:`resource-limits`}]},{depth:2,value:`Tuning your requests`,id:`tuning-your-requests`},{depth:2,value:`GPU Sandboxes`,id:`gpu-sandboxes`},{depth:2,value:`Additional resources`,id:`additional-resources`}]}],rawContent:`# Sandbox resources and pricing

This page covers resource configuration and pricing for Modal Sandboxes.
For general documentation on CPU and memory options, see
[Reserving CPU and memory](/docs/guide/resources).

## Pay for what you use

Modal Sandboxes are billed by the second based on whichever is higher:
your resource request or your actual usage.

Sandboxes can burst beyond their CPU and memory requests when additional
resources are available on the underlying host. Your request guarantees
a minimum level of resources, but when spare capacity exists, your Sandbox
can use more. You pay for \`max(request, actual)\`.

See [Billing](/docs/guide/resources#billing) in the resource guide for more details.

## Configuring resources

Set CPU and memory requests using the \`cpu\` and \`memory\` parameters when creating your Sandbox.
The \`cpu\` parameter specifies physical CPU cores (1 core = 2 vCPUs),
and \`memory\` specifies MiB:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import modal

app = modal.App.lookup("my-app", create_if_missing=True)

sb = modal.Sandbox.create(
    cpu=0.5,
    memory=512,
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("my-app", { createIfMissing: true });
const image = modal.images.fromRegistry("python:3.13-slim");

const sb = await modal.sandboxes.create(app, image, {
  cpu: 0.5,
  memoryMiB: 512,
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
package main

import (
	"context"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	ctx := context.Background()
	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "my-app", &modal.AppFromNameParams{
		CreateIfMissing: true,
	})
	image := mc.Images.FromRegistry("python:3.13-slim", nil)

	sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
		CPU:       0.5,
		MemoryMiB: 512,
	})
}
\`\`\`

{/snippet}
</CodeTabs>

For details on default values and maximum limits, see
[Reserving CPU and memory](/docs/guide/resources).

### Resource limits

You can set upper limits to cap how much a Sandbox can burst.
This is particularly useful when an AI agent controls what runs inside the Sandbox,
as it prevents misbehaving or adversarial workloads from consuming unbounded resources:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(
    cpu=(0.5, 4.0),       # Request 0.5 cores, limit to 4 cores
    memory=(512, 2048),   # Request 512 MiB, limit to 2048 MiB
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image, {
  cpu: 0.5,
  cpuLimit: 4.0,
  memoryMiB: 512,
  memoryLimitMiB: 2048,
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	CPU:            0.5,    // Request 0.5 cores
	CPULimit:       4.0,    // Limit to 4 cores
	MemoryMiB:      512,    // Request 512 MiB
	MemoryLimitMiB: 2048,   // Limit to 2048 MiB
})
\`\`\`

{/snippet}
</CodeTabs>

See [Resource limits](/docs/guide/resources#resource-limits) for details on
how CPU and memory limits behave.

## Tuning your requests

For maximum cost-efficiency, base your requests on observed usage percentiles rather than peaks:
around p50–75 for CPU and p90–95 for memory.

If your observed usage is consistently higher than your request, you may
run into resource contention on the host. This can manifest as OOM errors or CPU throttling.

The goal should be to set requests that correspond to your base load while letting bursting handle occasional spikes.

1. Start with default values for CPU and memory.

2. Run your typical workload and observe actual resource usage
   in the [Modal dashboard](/apps) to understand your baseline needs.

3. Set your request to match the resource level your workload consistently needs.

## GPU Sandboxes

You can also run Sandboxes with GPUs. See [GPU acceleration](/docs/guide/gpu) for available
GPU types and configuration.

Unlike CPU Sandboxes, GPU Sandboxes are subject to [preemption](/docs/guide/preemption).
Design your GPU workloads to handle interruptions gracefully.

## Additional resources

- [Sandbox pricing](/pricing#sandboxes): current pricing for Sandboxes
- [Reserving CPU and memory](/docs/guide/resources): CPU, memory, and disk configuration
- [Billing](/docs/guide/billing): billing cycles, budgets, and cost attribution
`,meta:{title:`Sandbox resources and pricing`,description:`Configure CPU, memory, and other resources for Modal Sandboxes. Modal's usage based pricing and ability to burst beyond requests enable cost-efficient resource allocation.`}},{description:v,crossLinks:y,toc:b,rawContent:x,meta:S}=_,C=t(`<!> <p>This page covers resource configuration and pricing for Modal Sandboxes.
For general documentation on CPU and memory options, see <!>.</p> <!> <p>Modal Sandboxes are billed by the second based on whichever is higher:
your resource request or your actual usage.</p> <p>Sandboxes can burst beyond their CPU and memory requests when additional
resources are available on the underlying host. Your request guarantees
a minimum level of resources, but when spare capacity exists, your Sandbox
can use more. You pay for <code>max(request, actual)</code>.</p> <p>See <!> in the resource guide for more details.</p> <!> <p>Set CPU and memory requests using the <code>cpu</code> and <code>memory</code> parameters when creating your Sandbox.
The <code>cpu</code> parameter specifies physical CPU cores (1 core = 2 vCPUs),
and <code>memory</code> specifies MiB:</p> <!> <p>For details on default values and maximum limits, see <!>.</p> <!> <p>You can set upper limits to cap how much a Sandbox can burst.
This is particularly useful when an AI agent controls what runs inside the Sandbox,
as it prevents misbehaving or adversarial workloads from consuming unbounded resources:</p> <!> <p>See <!> for details on
how CPU and memory limits behave.</p> <!> <p>For maximum cost-efficiency, base your requests on observed usage percentiles rather than peaks:
around p50–75 for CPU and p90–95 for memory.</p> <p>If your observed usage is consistently higher than your request, you may
run into resource contention on the host. This can manifest as OOM errors or CPU throttling.</p> <p>The goal should be to set requests that correspond to your base load while letting bursting handle occasional spikes.</p> <ol><li><p>Start with default values for CPU and memory.</p></li> <li><p>Run your typical workload and observe actual resource usage
in the <!> to understand your baseline needs.</p></li> <li><p>Set your request to match the resource level your workload consistently needs.</p></li></ol> <!> <p>You can also run Sandboxes with GPUs. See <!> for available
GPU types and configuration.</p> <p>Unlike CPU Sandboxes, GPU Sandboxes are subject to <!>.
Design your GPU workloads to handle interruptions gracefully.</p> <!> <ul><li><!>: current pricing for Sandboxes</li> <li><!>: CPU, memory, and disk configuration</li> <li><!>: billing cycles, budgets, and cost attribution</li></ul>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=C(),m=s(o);f(m,{id:`sandbox-resources-and-pricing`,children:(e,t)=>{l(),i(e,r(`Sandbox resources and pricing`))},$$slots:{default:!0}});var _=c(m,2);h(c(e(_)),{href:`/docs/guide/resources`,children:(e,t)=>{l(),i(e,r(`Reserving CPU and memory`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`pay-for-what-you-use`,children:(e,t)=>{l(),i(e,r(`Pay for what you use`))},$$slots:{default:!0}});var y=c(v,6);h(c(e(y)),{href:`/docs/guide/resources#billing`,children:(e,t)=>{l(),i(e,r(`Billing`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);u(b,{id:`configuring-resources`,children:(e,t)=>{l(),i(e,r(`Configuring resources`))},$$slots:{default:!0}});var x=c(b,4);g(x,{python:e=>{p(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20cpu%3D0.5%2C%0A%20%20%20%20memory%3D512%2C%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{p(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%20createIfMissing%3A%20true%20%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20cpu%3A%200.5%2C%0A%20%20memoryMiB%3A%20512%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{p(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22my-app%22%2C%20%26modal.AppFromNameParams%7B%0A%09%09CreateIfMissing%3A%20true%2C%0A%09%7D)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil)%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09%09CPU%3A%20%20%20%20%20%20%200.5%2C%0A%09%09MemoryMiB%3A%20512%2C%0A%09%7D)%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var S=c(x,2);h(c(e(S)),{href:`/docs/guide/resources`,children:(e,t)=>{l(),i(e,r(`Reserving CPU and memory`))},$$slots:{default:!0}}),l(),n(S);var w=c(S,2);d(w,{id:`resource-limits`,children:(e,t)=>{l(),i(e,r(`Resource limits`))},$$slots:{default:!0}});var T=c(w,4);g(T,{python:e=>{p(e,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20cpu%3D(0.5%2C%204.0)%2C%20%20%20%20%20%20%20%23%20Request%200.5%20cores%2C%20limit%20to%204%20cores%0A%20%20%20%20memory%3D(512%2C%202048)%2C%20%20%20%23%20Request%20512%20MiB%2C%20limit%20to%202048%20MiB%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{p(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20cpu%3A%200.5%2C%0A%20%20cpuLimit%3A%204.0%2C%0A%20%20memoryMiB%3A%20512%2C%0A%20%20memoryLimitMiB%3A%202048%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{p(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09CPU%3A%20%20%20%20%20%20%20%20%20%20%20%200.5%2C%20%20%20%20%2F%2F%20Request%200.5%20cores%0A%09CPULimit%3A%20%20%20%20%20%20%204.0%2C%20%20%20%20%2F%2F%20Limit%20to%204%20cores%0A%09MemoryMiB%3A%20%20%20%20%20%20512%2C%20%20%20%20%2F%2F%20Request%20512%20MiB%0A%09MemoryLimitMiB%3A%202048%2C%20%20%20%2F%2F%20Limit%20to%202048%20MiB%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var E=c(T,2);h(c(e(E)),{href:`/docs/guide/resources#resource-limits`,children:(e,t)=>{l(),i(e,r(`Resource limits`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);u(D,{id:`tuning-your-requests`,children:(e,t)=>{l(),i(e,r(`Tuning your requests`))},$$slots:{default:!0}});var O=c(D,8),k=c(e(O),2),A=e(k);h(c(e(A)),{href:`/apps`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(),n(A),n(k),l(2),n(O);var j=c(O,2);u(j,{id:`gpu-sandboxes`,children:(e,t)=>{l(),i(e,r(`GPU Sandboxes`))},$$slots:{default:!0}});var M=c(j,2);h(c(e(M)),{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPU acceleration`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);h(c(e(N)),{href:`/docs/guide/preemption`,children:(e,t)=>{l(),i(e,r(`preemption`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);u(P,{id:`additional-resources`,children:(e,t)=>{l(),i(e,r(`Additional resources`))},$$slots:{default:!0}});var F=c(P,2),I=e(F);h(e(I),{href:`/pricing#sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandbox pricing`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,2);h(e(L),{href:`/docs/guide/resources`,children:(e,t)=>{l(),i(e,r(`Reserving CPU and memory`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,2);h(e(R),{href:`/docs/guide/billing`,children:(e,t)=>{l(),i(e,r(`Billing`))},$$slots:{default:!0}}),l(),n(R),n(F),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=D9igoX4U2.js.map
