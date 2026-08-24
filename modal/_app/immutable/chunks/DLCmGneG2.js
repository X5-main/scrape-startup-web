(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6b5fb3b2-c765-4cc1-97c4-e55a0fea6d06`,e._sentryDebugIdIdentifier=`sentry-dbid-6b5fb3b2-c765-4cc1-97c4-e55a0fea6d06`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`SandboxSnapshot`,id:`sandboxsnapshot`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`from_id`,id:`from_id`}]}],rawContent:`# SandboxSnapshot


\`\`\`python
class SandboxSnapshot(modal.object.Object)
\`\`\`

> Sandbox memory snapshots are in **early preview**.

A \`SandboxSnapshot\` object lets you interact with a stored Sandbox snapshot that was created by calling
\`._experimental_snapshot()\` on a Sandbox instance. This includes both the filesystem and memory state of
the original Sandbox at the time the snapshot was taken.


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## from_id

\`\`\`python
from_id(cls, sandbox_snapshot_id, client=None)
\`\`\`
Construct a \`SandboxSnapshot\` for an existing snapshot ID.

**Parameters**

<Parameter name="sandbox_snapshot_id" type="str" description="Snapshot ID returned when the snapshot was created." />
<Parameter name="client" type="&quot;modal.client.Client | None&quot;" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`SandboxSnapshot\` handle (hydration validates the ID when used).
`,meta:{title:`SandboxSnapshot`,description:`Sandbox memory snapshots are in early preview.`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <!> <blockquote><p>Sandbox memory snapshots are in <strong>early preview</strong>.</p></blockquote> <p>A <code>SandboxSnapshot</code> object lets you interact with a stored Sandbox snapshot that was created by calling <code>._experimental_snapshot()</code> on a Sandbox instance. This includes both the filesystem and memory state of
the original Sandbox at the time the snapshot was taken.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Construct a <code>SandboxSnapshot</code> for an existing snapshot ID.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>SandboxSnapshot</code> handle (hydration validates the ID when used).</p>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),d=a(i);l(d,{id:`sandboxsnapshot`,children:(e,r)=>{s(),n(e,t(`SandboxSnapshot`))},$$slots:{default:!0}});var p=o(d,2);u(p,{code:`class%20SandboxSnapshot(modal.object.Object)`,lang:`python`});var m=o(p,6);c(m,{id:`hydrate`,children:(e,r)=>{s(),n(e,t(`hydrate`))},$$slots:{default:!0}});var h=o(m,2);u(h,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var g=o(h,8);c(g,{id:`from_id`,children:(e,r)=>{s(),n(e,t(`from_id`))},$$slots:{default:!0}});var v=o(g,2);u(v,{code:`from_id(cls%2C%20sandbox_snapshot_id%2C%20client%3DNone)`,lang:`python`});var y=o(v,6);f(y,{name:`sandbox_snapshot_id`,type:`str`,description:`Snapshot ID returned when the snapshot was created.`}),f(o(y,2),{name:`client`,type:`"modal.client.Client | None"`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."}),s(4),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DLCmGneG2.js.map
