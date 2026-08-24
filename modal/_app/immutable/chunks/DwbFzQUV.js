(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`103d726d-309e-48c4-8309-5d222c43a86c`,e._sentryDebugIdIdentifier=`sentry-dbid-103d726d-309e-48c4-8309-5d222c43a86c`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./DYSGKh1I.js";import{a as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./D0Ft4u302.js";var m={description:`Schedule Sandboxes onto consistent CPU instance types for reproducible performance`,toc:[{depth:1,value:`Performance-sensitive Sandboxes`,id:`performance-sensitive-sandboxes`,children:[{depth:2,value:`Example`,id:`example`},{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# Performance-sensitive Sandboxes

<Callout variant="alpha" />

Standard Sandboxes can be scheduled across many different underlying instance
types, which can introduce variance in CPU performance between runs.
Performance-sensitive Sandboxes are scheduled onto a consistent set of instance
types with low variance in CPU performance, making results more reproducible.

This is useful for workloads like benchmarking or CI, where consistency across
runs matters.

## Example

Enable performance-sensitive scheduling by setting the \`performance_sensitive\`
experimental option to \`True\`:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import modal

app = modal.App.lookup("my-app", create_if_missing=True)

sb = modal.Sandbox.create(
    app=app,
    experimental_options={"performance_sensitive": True},
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
  experimentalOptions: { performance_sensitive: true },
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
		ExperimentalOptions: map[string]any{"performance_sensitive": true},
	})
	_ = sb
}
\`\`\`

{/snippet}
</CodeTabs>

## Limitations

- **CPU only.** Performance-sensitive scheduling is only available for CPU
  Sandboxes. GPU Sandboxes are not supported.
- **Limited capacity.** The pool of performance-sensitive instances is smaller
  than the general pool. Avoid combining this feature with narrow region pinning
  (e.g. \`us-west\`) — this can cause scheduling delays due to limited supply.
  Broad regions like \`us\` work well.
`,meta:{title:`Performance-sensitive Sandboxes`,description:`Schedule Sandboxes onto consistent CPU instance types for reproducible performance`}},{description:h,toc:g,rawContent:_,meta:v}=m,y=e(`<!> <!> <p>Standard Sandboxes can be scheduled across many different underlying instance
types, which can introduce variance in CPU performance between runs.
Performance-sensitive Sandboxes are scheduled onto a consistent set of instance
types with low variance in CPU performance, making results more reproducible.</p> <p>This is useful for workloads like benchmarking or CI, where consistency across
runs matters.</p> <!> <p>Enable performance-sensitive scheduling by setting the <code>performance_sensitive</code> experimental option to <code>True</code>:</p> <!> <!> <ul><li><strong>CPU only.</strong> Performance-sensitive scheduling is only available for CPU
Sandboxes. GPU Sandboxes are not supported.</li> <li><strong>Limited capacity.</strong> The pool of performance-sensitive instances is smaller
than the general pool. Avoid combining this feature with narrow region pinning
(e.g. <code>us-west</code>) — this can cause scheduling delays due to limited supply.
Broad regions like <code>us</code> work well.</li></ul>`,1);function b(e,h){let g=r(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(e,i(()=>g,()=>m,{children:(e,r)=>{var i=y(),f=a(i);u(f,{id:`performance-sensitive-sandboxes`,children:(e,r)=>{s(),n(e,t(`Performance-sensitive Sandboxes`))},$$slots:{default:!0}});var m=o(f,2);c(m,{variant:`alpha`});var h=o(m,6);l(h,{id:`example`,children:(e,r)=>{s(),n(e,t(`Example`))},$$slots:{default:!0}});var g=o(h,4);p(g,{python:e=>{d(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20app%3Dapp%2C%0A%20%20%20%20experimental_options%3D%7B%22performance_sensitive%22%3A%20True%7D%2C%0A)`,lang:`python`})},javascript:e=>{d(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%20createIfMissing%3A%20true%20%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20experimentalOptions%3A%20%7B%20performance_sensitive%3A%20true%20%7D%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{d(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22my-app%22%2C%20%26modal.AppFromNameParams%7B%0A%09%09CreateIfMissing%3A%20true%2C%0A%09%7D)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil)%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09%09ExperimentalOptions%3A%20map%5Bstring%5Dany%7B%22performance_sensitive%22%3A%20true%7D%2C%0A%09%7D)%0A%09_%20%3D%20sb%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}}),l(o(g,2),{id:`limitations`,children:(e,r)=>{s(),n(e,t(`Limitations`))},$$slots:{default:!0}}),s(2),n(e,i)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=DwbFzQUV.js.map
