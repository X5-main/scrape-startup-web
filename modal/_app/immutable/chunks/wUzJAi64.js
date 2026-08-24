(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`32bf8d17-dbee-4265-b39f-f46345d26bb0`,e._sentryDebugIdIdentifier=`sentry-dbid-32bf8d17-dbee-4265-b39f-f46345d26bb0`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={crossLinks:[{text:`Create a Proxy Token`,href:`/settings/proxy-auth-tokens`},{text:`Deploy a proxy authorized endpoint`,href:`/docs/examples/basic_web`}],toc:[{depth:1,value:`Proxy Tokens`,id:`proxy-tokens`,children:[{depth:2,value:`Authentication models`,id:`authentication-models`},{depth:2,value:`Authenticating requests`,id:`authenticating-requests`},{depth:2,value:`Environment scoping`,id:`environment-scoping`}]}],rawContent:`# Proxy Tokens

Use Proxy Tokens to prevent unauthorized clients from reaching your [Endpoints](/docs/guide/endpoints), [Servers](/docs/guide/servers), and [Web Functions](/docs/guide/webhooks). Proxy Tokens can be created in the [Dashboard settings](/settings/proxy-auth-tokens) or with the [\`modal workspace proxy-tokens\`](/docs/cli/latest/workspace#modal-workspace-proxy-tokens) CLI.

## Authentication models

Endpoints and Servers require authentication by default. To accept public traffic instead, pass \`--unauthenticated\` to \`modal endpoint create\` or set \`unauthenticated=True\` in the [\`@app.server()\`](/docs/sdk/py/latest/App#server) decorator:

\`\`\`python notest
@app.server()
class Private:
    ...


@app.server(unauthenticated=True)
class Public:
    ...
\`\`\`

In contrast, Web Functions are **publicly available** by default. Enable authentication by setting \`requires_proxy_auth=True\` in the [\`fastapi_endpoint\`](/docs/sdk/py/latest/fastapi_endpoint), [\`asgi_app\`](/docs/sdk/py/latest/asgi_app), [\`wsgi_app\`](/docs/sdk/py/latest/wsgi_app), or [\`web_server\`](/docs/sdk/py/latest/web_server) decorators:

\`\`\`python
@app.function()
@modal.fastapi_endpoint()
def public():
    return "hello world"


@app.function()
@modal.fastapi_endpoint(requires_proxy_auth=True)
def private():
    return "hello friend"
\`\`\`

The \`public\` endpoint can be hit by any client over the Internet:

\`\`\`bash
curl https://public-url--goes-here.modal.run
\`\`\`

The \`private\` endpoint cannot:

\`\`\`bash
curl --fail-with-body https://private-url--goes-here.modal.run
# modal-http: missing credentials for proxy authorization
# curl: (22) The requested URL returned error: 401
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
\`\`\`

## Authenticating requests

A Proxy Token comprises a Token ID / Token Secret pair. Requests are authenticated by passing the pair in HTTP headers. They can be sent as separate \`Modal-Key\` and \`Modal-Secret\` headers:

\`\`\`bash
export TOKEN_ID=wk-1234abcd
export TOKEN_SECRET=ws-1234abcd
curl -H "Modal-Key: $TOKEN_ID" \\
     -H "Modal-Secret: $TOKEN_SECRET" \\
     https://private-url--goes-here.modal.run
\`\`\`

Alternatively, they can be joined with a period (\`.\`) and passed as a single \`Authorization: Bearer\` header:

\`\`\`bash
export TOKEN_ID=wk-1234abcd
export TOKEN_SECRET=ws-1234abcd
curl -H "Authorization: Bearer $TOKEN_ID.$TOKEN_SECRET" \\
     https://private-url--goes-here.modal.run
\`\`\`

This is the same scheme the OpenAI API uses (\`Authorization: Bearer <api-key>\`), so the combined value can be used as the API key in any OpenAI-compatible client or gateway.

## Environment scoping

On Workspaces with RBAC enabled, tokens are scoped to specific Environments. See the [RBAC guide](/docs/guide/rbac#proxy-tokens) for more information.
`,meta:{title:`Proxy Tokens`,description:`Use Proxy Tokens to prevent unauthorized clients from reaching your Endpoints, Servers, and Web Functions. Proxy Tokens can be created in the Dashboard settings or with the modal workspace proxy-tokens CLI.`}},{crossLinks:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal workspace proxy-tokens</code>`),x=t(`<code>@app.server()</code>`),S=t(`<code>fastapi_endpoint</code>`),C=t(`<code>asgi_app</code>`),w=t(`<code>wsgi_app</code>`),T=t(`<code>web_server</code>`),E=t(`<!> <p>Use Proxy Tokens to prevent unauthorized clients from reaching your <!>, <!>, and <!>. Proxy Tokens can be created in the <!> or with the <!> CLI.</p> <!> <p>Endpoints and Servers require authentication by default. To accept public traffic instead, pass <code>--unauthenticated</code> to <code>modal endpoint create</code> or set <code>unauthenticated=True</code> in the <!> decorator:</p> <!> <p>In contrast, Web Functions are <strong>publicly available</strong> by default. Enable authentication by setting <code>requires_proxy_auth=True</code> in the <!>, <!>, <!>, or <!> decorators:</p> <!> <p>The <code>public</code> endpoint can be hit by any client over the Internet:</p> <!> <p>The <code>private</code> endpoint cannot:</p> <!> <!> <p>A Proxy Token comprises a Token ID / Token Secret pair. Requests are authenticated by passing the pair in HTTP headers. They can be sent as separate <code>Modal-Key</code> and <code>Modal-Secret</code> headers:</p> <!> <p>Alternatively, they can be joined with a period (<code>.</code>) and passed as a single <code>Authorization: Bearer</code> header:</p> <!> <p>This is the same scheme the OpenAI API uses (<code>Authorization: Bearer &lt;api-key&gt;</code>), so the combined value can be used as the API key in any OpenAI-compatible client or gateway.</p> <!> <p>On Workspaces with RBAC enabled, tokens are scoped to specific Environments. See the <!> for more information.</p>`,1);function D(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=E(),p=s(o);d(p,{id:`proxy-tokens`,children:(e,t)=>{l(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`/docs/guide/endpoints`,children:(e,t)=>{l(),i(e,r(`Endpoints`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Servers`))},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}});var y=c(v,2);m(y,{href:`/settings/proxy-auth-tokens`,children:(e,t)=>{l(),i(e,r(`Dashboard settings`))},$$slots:{default:!0}}),m(c(y,2),{href:`/docs/cli/latest/workspace#modal-workspace-proxy-tokens`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(h);var D=c(h,2);u(D,{id:`authentication-models`,children:(e,t)=>{l(),i(e,r(`Authentication models`))},$$slots:{default:!0}});var O=c(D,2);m(c(e(O),7),{href:`/docs/sdk/py/latest/App#server`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);f(k,{code:`%40app.server()%0Aclass%20Private%3A%0A%20%20%20%20...%0A%0A%0A%40app.server(unauthenticated%3DTrue)%0Aclass%20Public%3A%0A%20%20%20%20...`,lang:`python`});var A=c(k,2),j=c(e(A),5);m(j,{href:`/docs/sdk/py/latest/fastapi_endpoint`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var M=c(j,2);m(M,{href:`/docs/sdk/py/latest/asgi_app`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}});var N=c(M,2);m(N,{href:`/docs/sdk/py/latest/wsgi_app`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),m(c(N,2),{href:`/docs/sdk/py/latest/web_server`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(),n(A);var P=c(A,2);f(P,{code:`%40app.function()%0A%40modal.fastapi_endpoint()%0Adef%20public()%3A%0A%20%20%20%20return%20%22hello%20world%22%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(requires_proxy_auth%3DTrue)%0Adef%20private()%3A%0A%20%20%20%20return%20%22hello%20friend%22`,lang:`python`});var F=c(P,4);f(F,{code:`curl%20https%3A%2F%2Fpublic-url--goes-here.modal.run`,lang:`bash`});var I=c(F,4);f(I,{code:`curl%20--fail-with-body%20https%3A%2F%2Fprivate-url--goes-here.modal.run%0A%23%20modal-http%3A%20missing%20credentials%20for%20proxy%20authorization%0A%23%20curl%3A%20(22)%20The%20requested%20URL%20returned%20error%3A%20401%0A%23%20https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FHTTP%2FStatus%2F401`,lang:`bash`});var L=c(I,2);u(L,{id:`authenticating-requests`,children:(e,t)=>{l(),i(e,r(`Authenticating requests`))},$$slots:{default:!0}});var R=c(L,4);f(R,{code:`export%20TOKEN_ID%3Dwk-1234abcd%0Aexport%20TOKEN_SECRET%3Dws-1234abcd%0Acurl%20-H%20%22Modal-Key%3A%20%24TOKEN_ID%22%20%5C%0A%20%20%20%20%20-H%20%22Modal-Secret%3A%20%24TOKEN_SECRET%22%20%5C%0A%20%20%20%20%20https%3A%2F%2Fprivate-url--goes-here.modal.run`,lang:`bash`});var z=c(R,4);f(z,{code:`export%20TOKEN_ID%3Dwk-1234abcd%0Aexport%20TOKEN_SECRET%3Dws-1234abcd%0Acurl%20-H%20%22Authorization%3A%20Bearer%20%24TOKEN_ID.%24TOKEN_SECRET%22%20%5C%0A%20%20%20%20%20https%3A%2F%2Fprivate-url--goes-here.modal.run`,lang:`bash`});var B=c(z,4);u(B,{id:`environment-scoping`,children:(e,t)=>{l(),i(e,r(`Environment scoping`))},$$slots:{default:!0}});var V=c(B,2);m(c(e(V)),{href:`/docs/guide/rbac#proxy-tokens`,children:(e,t)=>{l(),i(e,r(`RBAC guide`))},$$slots:{default:!0}}),l(),n(V),i(t,o)},$$slots:{default:!0}}))}export{D as default,h as metadata};
//# sourceMappingURL=wUzJAi64.js.map
