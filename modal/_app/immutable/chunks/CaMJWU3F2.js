(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cd126bc6-cce3-455c-aa18-382d826605f2`,e._sentryDebugIdIdentifier=`sentry-dbid-cd126bc6-cce3-455c-aa18-382d826605f2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`fastapi_endpoint`,id:`fastapi_endpoint`}],rawContent:`# fastapi_endpoint

\`\`\`python
fastapi_endpoint(*, method="GET", label=None, custom_domains=None, docs=False,
    requires_proxy_auth=False)
\`\`\`
Create a Web Function that can be addressed via HTTP at a public URL.

Modal will internally use [FastAPI](https://fastapi.tiangolo.com/) to expose a
simple, single request handler. If you are defining your own \`FastAPI\` application
(e.g. if you want to define multiple routes), use \`@modal.asgi_app\` instead.

The Web Function created with this decorator will automatically have
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) enabled
and can leverage many of FastAPI's features.

For more information on using Modal with popular web frameworks, see our
[guide on Web Functions](https://modal.com/docs/guide/webhooks).

*Added in v0.73.82*: This function replaces the deprecated \`@web_endpoint\` decorator.
`,meta:{title:`fastapi_endpoint`,description:`Create a Web Function that can be addressed via HTTP at a public URL.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Create a Web Function that can be addressed via HTTP at a public URL.</p> <p>Modal will internally use <!> to expose a
simple, single request handler. If you are defining your own <code>FastAPI</code> application
(e.g. if you want to define multiple routes), use <code>@modal.asgi_app</code> instead.</p> <p>The Web Function created with this decorator will automatically have <!> enabled
and can leverage many of FastAPI’s features.</p> <p>For more information on using Modal with popular web frameworks, see our <!>.</p> <p><em>Added in v0.73.82</em>: This function replaces the deprecated <code>@web_endpoint</code> decorator.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`fastapi_endpoint`,children:(e,t)=>{l(),i(e,r(`fastapi_endpoint`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`fastapi_endpoint(*%2C%20method%3D%22GET%22%2C%20label%3DNone%2C%20custom_domains%3DNone%2C%20docs%3DFalse%2C%0A%20%20%20%20requires_proxy_auth%3DFalse)`,lang:`python`});var h=c(m,4);p(c(e(h)),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),l(5),n(h);var g=c(h,2);p(c(e(g)),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CORS`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);p(c(e(_)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide on Web Functions`))},$$slots:{default:!0}}),l(),n(_),l(2),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CaMJWU3F2.js.map
