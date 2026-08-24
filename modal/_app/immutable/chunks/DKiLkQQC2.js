(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4b01d6ec-02d6-4d38-82c3-2bc90d8b8e51`,e._sentryDebugIdIdentifier=`sentry-dbid-4b01d6ec-02d6-4d38-82c3-2bc90d8b8e51`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`asgi_app`,id:`asgi_app`}],rawContent:`# asgi_app

\`\`\`python
asgi_app(*, label=None, custom_domains=None, requires_proxy_auth=False)
\`\`\`
Decorator for registering an ASGI app as a Web Function.

Asynchronous Server Gateway Interface (ASGI) is a standard for Python
web apps, supported by all popular Python web libraries.

To learn how to use Modal with popular web frameworks, see the
[guide on Web Functions](https://modal.com/docs/guide/webhooks).

**Usage**

\`\`\`python
from typing import Callable

@app.function()
@modal.asgi_app()
def create_asgi() -> Callable:
    ...
\`\`\`
`,meta:{title:`asgi_app`,description:`Decorator for registering an ASGI app as a Web Function.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Decorator for registering an ASGI app as a Web Function.</p> <p>Asynchronous Server Gateway Interface (ASGI) is a standard for Python
web apps, supported by all popular Python web libraries.</p> <p>To learn how to use Modal with popular web frameworks, see the <!>.</p> <p><strong>Usage</strong></p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`asgi_app`,children:(e,t)=>{l(),i(e,r(`asgi_app`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`asgi_app(*%2C%20label%3DNone%2C%20custom_domains%3DNone%2C%20requires_proxy_auth%3DFalse)`,lang:`python`});var h=c(m,6);p(c(e(h)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide on Web Functions`))},$$slots:{default:!0}}),l(),n(h),d(c(h,4),{code:`from%20typing%20import%20Callable%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20create_asgi()%20-%3E%20Callable%3A%0A%20%20%20%20...`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DKiLkQQC2.js.map
