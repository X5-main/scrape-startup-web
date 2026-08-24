(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f56d3863-2b05-4a3c-ac57-e58e711840d5`,e._sentryDebugIdIdentifier=`sentry-dbid-f56d3863-2b05-4a3c-ac57-e58e711840d5`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";import{t as h}from"./B6UiYoTw.js";var g={toc:[{depth:1,value:`Client`,id:`client`,children:[{depth:2,value:`is_closed`,id:`is_closed`},{depth:2,value:`hello`,id:`hello`},{depth:2,value:`from_credentials`,id:`from_credentials`},{depth:2,value:`get_input_plane_metadata`,id:`get_input_plane_metadata`}]}],rawContent:`# Client


\`\`\`python
class Client(object)
\`\`\`


## is_closed

\`\`\`python
is_closed(self)
\`\`\`
Check if the client is closed.

**Returns**

True if the client is closed, False otherwise.

## hello

\`\`\`python
hello(self)
\`\`\`
Connect to server and retrieve version information; raise appropriate error for various failures.

**Usage**

\`\`\`python
client = modal.Client.from_env()
client.hello()
\`\`\`

## from_credentials

\`\`\`python
from_credentials(cls, token_id, token_secret)
\`\`\`
Constructor based on token credentials; useful for managing Modal on behalf of third-party users.

Also useful when it's necessary to explicitly manage the lifecycle of the client
(e.g. when running Modal in a forked subprocess) — see
[troubleshooting](/docs/guide/troubleshooting#connection-issues-in-forked-processes).

**Parameters**

<Parameter name="token_id" type="str" description="API token ID." />
<Parameter name="token_secret" type="str" description="API token secret." />

**Returns**

An authenticated \`Client\` with its connection opened.

**Usage**

\`\`\`python notest
client = modal.Client.from_credentials("my_token_id", "my_token_secret")

modal.Sandbox.create("echo", "hi", client=client, app=app)
\`\`\`

## get_input_plane_metadata

\`\`\`python
get_input_plane_metadata(self, input_plane_region)
\`\`\`
Get the metadata for the input plane.

**Parameters**

<Parameter name="input_plane_region" type="str" description="The region of the input plane." />

**Returns**

The metadata for the input plane as a list of header/value tuples.
`,meta:{title:`Client`,description:`Check if the client is closed.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <!> <!> <!> <p>Check if the client is closed.</p> <p><strong>Returns</strong></p> <p>True if the client is closed, False otherwise.</p> <!> <!> <p>Connect to server and retrieve version information; raise appropriate error for various failures.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Constructor based on token credentials; useful for managing Modal on behalf of third-party users.</p> <p>Also useful when it’s necessary to explicitly manage the lifecycle of the client
(e.g. when running Modal in a forked subprocess) — see <!>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>An authenticated <code>Client</code> with its connection opened.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Get the metadata for the input plane.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>The metadata for the input plane as a list of header/value tuples.</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`client`,children:(e,t)=>{l(),i(e,r(`Client`))},$$slots:{default:!0}});var g=c(p,2);f(g,{code:`class%20Client(object)`,lang:`python`});var _=c(g,2);u(_,{id:`is_closed`,children:(e,t)=>{l(),i(e,r(`is_closed`))},$$slots:{default:!0}});var v=c(_,2);f(v,{code:`is_closed(self)`,lang:`python`});var y=c(v,8);u(y,{id:`hello`,children:(e,t)=>{l(),i(e,r(`hello`))},$$slots:{default:!0}});var x=c(y,2);f(x,{code:`hello(self)`,lang:`python`});var S=c(x,6);f(S,{code:`client%20%3D%20modal.Client.from_env()%0Aclient.hello()`,lang:`python`});var C=c(S,2);u(C,{id:`from_credentials`,children:(e,t)=>{l(),i(e,r(`from_credentials`))},$$slots:{default:!0}});var w=c(C,2);f(w,{code:`from_credentials(cls%2C%20token_id%2C%20token_secret)`,lang:`python`});var T=c(w,4);m(c(e(T)),{href:`/docs/guide/troubleshooting#connection-issues-in-forked-processes`,children:(e,t)=>{l(),i(e,r(`troubleshooting`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,4);h(E,{name:`token_id`,type:`str`,description:`API token ID.`});var D=c(E,2);h(D,{name:`token_secret`,type:`str`,description:`API token secret.`});var O=c(D,8);f(O,{code:`client%20%3D%20modal.Client.from_credentials(%22my_token_id%22%2C%20%22my_token_secret%22)%0A%0Amodal.Sandbox.create(%22echo%22%2C%20%22hi%22%2C%20client%3Dclient%2C%20app%3Dapp)`,lang:`python`});var k=c(O,2);u(k,{id:`get_input_plane_metadata`,children:(e,t)=>{l(),i(e,r(`get_input_plane_metadata`))},$$slots:{default:!0}});var A=c(k,2);f(A,{code:`get_input_plane_metadata(self%2C%20input_plane_region)`,lang:`python`}),h(c(A,6),{name:`input_plane_region`,type:`str`,description:`The region of the input plane.`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=isDEtWr7.js.map
