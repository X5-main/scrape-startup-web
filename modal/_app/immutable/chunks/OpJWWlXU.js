(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1515d2ee-2acc-4f6d-bd7b-a9956c3f9994`,e._sentryDebugIdIdentifier=`sentry-dbid-1515d2ee-2acc-4f6d-bd7b-a9956c3f9994`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`wsgi_app`,id:`wsgi_app`}],rawContent:`# wsgi_app

\`\`\`python
wsgi_app(*, label=None, custom_domains=None, requires_proxy_auth=False)
\`\`\`
Decorator for registering a WSGI app with a Modal function.

Web Server Gateway Interface (WSGI) is a standard for synchronous Python web apps.
It has been [succeeded by the ASGI interface](https://asgi.readthedocs.io/en/latest/introduction.html#wsgi-compatibility)
which is compatible with ASGI and supports additional functionality such as web sockets.
Modal supports ASGI via [\`asgi_app\`](https://modal.com/docs/sdk/py/latest/asgi_app).

To learn how to use this decorator with popular web frameworks, see the
[guide on Web Functions](https://modal.com/docs/guide/webhooks).

**Usage**

\`\`\`python
from typing import Callable

@app.function()
@modal.wsgi_app()
def create_wsgi() -> Callable:
    ...
\`\`\`
`,meta:{title:`wsgi_app`,description:`Decorator for registering a WSGI app with a Modal function.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>asgi_app</code>`),y=t(`<!> <!> <p>Decorator for registering a WSGI app with a Modal function.</p> <p>Web Server Gateway Interface (WSGI) is a standard for synchronous Python web apps.
It has been <!> which is compatible with ASGI and supports additional functionality such as web sockets.
Modal supports ASGI via <!>.</p> <p>To learn how to use this decorator with popular web frameworks, see the <!>.</p> <p><strong>Usage</strong></p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`wsgi_app`,children:(e,t)=>{l(),i(e,r(`wsgi_app`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`wsgi_app(*%2C%20label%3DNone%2C%20custom_domains%3DNone%2C%20requires_proxy_auth%3DFalse)`,lang:`python`});var h=c(m,4),g=c(e(h));p(g,{href:`https://asgi.readthedocs.io/en/latest/introduction.html#wsgi-compatibility`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`succeeded by the ASGI interface`))},$$slots:{default:!0}}),p(c(g,2),{href:`https://modal.com/docs/sdk/py/latest/asgi_app`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);p(c(e(_)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide on Web Functions`))},$$slots:{default:!0}}),l(),n(_),d(c(_,4),{code:`from%20typing%20import%20Callable%0A%0A%40app.function()%0A%40modal.wsgi_app()%0Adef%20create_wsgi()%20-%3E%20Callable%3A%0A%20%20%20%20...`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=OpJWWlXU.js.map
