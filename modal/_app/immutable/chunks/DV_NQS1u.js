(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`99085985-e96f-4032-9539-054b211217d3`,e._sentryDebugIdIdentifier=`sentry-dbid-99085985-e96f-4032-9539-054b211217d3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";import{t as h}from"./B6UiYoTw.js";var g={toc:[{depth:1,value:`Proxy`,id:`proxy`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`from_name`,id:`from_name`}]}],rawContent:`# Proxy


\`\`\`python
class Proxy(modal.object.Object)
\`\`\`

Proxy objects give your Modal containers a static outbound IP address.

This can be used for connecting to a remote address with network whitelist, for example
a database. See [the guide](https://modal.com/docs/guide/proxy-ips) for more information.


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
from_name(name, *, environment_name=None, client=None)
\`\`\`
Reference a Proxy by its name.

In contrast to most other Modal objects, new Proxy objects must be
provisioned via the Dashboard and cannot be created on the fly from code.

**Parameters**

<Parameter name="name" type="str" description="Name of the Proxy in the target environment." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A lazy \`Proxy\` handle.
`,meta:{title:`Proxy`,description:`Proxy objects give your Modal containers a static outbound IP address.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <!> <p>Proxy objects give your Modal containers a static outbound IP address.</p> <p>This can be used for connecting to a remote address with network whitelist, for example
a database. See <!> for more information.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Reference a Proxy by its name.</p> <p>In contrast to most other Modal objects, new Proxy objects must be
provisioned via the Dashboard and cannot be created on the fly from code.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>A lazy <code>Proxy</code> handle.</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`proxy`,children:(e,t)=>{l(),i(e,r(`Proxy`))},$$slots:{default:!0}});var g=c(p,2);f(g,{code:`class%20Proxy(modal.object.Object)`,lang:`python`});var _=c(g,4);m(c(e(_)),{href:`https://modal.com/docs/guide/proxy-ips`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the guide`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`hydrate`,children:(e,t)=>{l(),i(e,r(`hydrate`))},$$slots:{default:!0}});var y=c(v,2);f(y,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var x=c(y,8);u(x,{id:`from_name`,children:(e,t)=>{l(),i(e,r(`from_name`))},$$slots:{default:!0}});var S=c(x,2);f(S,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var C=c(S,8);h(C,{name:`name`,type:`str`,description:`Name of the Proxy in the target environment.`});var w=c(C,2);h(w,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`}),h(c(w,2),{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."}),l(4),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=DV_NQS1u.js.map
