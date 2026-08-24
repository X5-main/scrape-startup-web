(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f3a39f6b-b2f5-499b-8745-337daf0e2464`,e._sentryDebugIdIdentifier=`sentry-dbid-f3a39f6b-b2f5-499b-8745-337daf0e2464`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`web_server`,id:`web_server`}],rawContent:`# web_server

\`\`\`python
web_server(port, *, startup_timeout=5.0, label=None, custom_domains=None,
    requires_proxy_auth=False)
\`\`\`
Decorator that registers an HTTP web server inside the container.

This is similar to \`@modal.asgi_app\` and \`@modal.wsgi_app\`, but it allows you to expose a full
HTTP server listening on a container port. This is useful for servers written in other languages
like Rust, as well as integrating with non-ASGI frameworks like aiohttp and Tornado.

The above example starts a simple file server, displaying the contents of the root directory.
Here, requests to the URL will go to external port 8000 on the container. The
\`http.server\` module is included with Python, but you could run anything here.

Internally, the web server is transparently converted into a Web Function by Modal, so it has
the same serverless autoscaling behavior as other Web Functions.

For more info, see the [guide on Web Functions](https://modal.com/docs/guide/webhooks).

**Usage**

\`\`\`python
import subprocess

@app.function()
@modal.web_server(8000)
def my_file_server():
    subprocess.Popen("python -m http.server -d / 8000", shell=True)
\`\`\`
`,meta:{title:`web_server`,description:`Decorator that registers an HTTP web server inside the container.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Decorator that registers an HTTP web server inside the container.</p> <p>This is similar to <code>@modal.asgi_app</code> and <code>@modal.wsgi_app</code>, but it allows you to expose a full
HTTP server listening on a container port. This is useful for servers written in other languages
like Rust, as well as integrating with non-ASGI frameworks like aiohttp and Tornado.</p> <p>The above example starts a simple file server, displaying the contents of the root directory.
Here, requests to the URL will go to external port 8000 on the container. The <code>http.server</code> module is included with Python, but you could run anything here.</p> <p>Internally, the web server is transparently converted into a Web Function by Modal, so it has
the same serverless autoscaling behavior as other Web Functions.</p> <p>For more info, see the <!>.</p> <p><strong>Usage</strong></p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`web_server`,children:(e,t)=>{l(),i(e,r(`web_server`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`web_server(port%2C%20*%2C%20startup_timeout%3D5.0%2C%20label%3DNone%2C%20custom_domains%3DNone%2C%0A%20%20%20%20requires_proxy_auth%3DFalse)`,lang:`python`});var h=c(m,10);p(c(e(h)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide on Web Functions`))},$$slots:{default:!0}}),l(),n(h),d(c(h,4),{code:`import%20subprocess%0A%0A%40app.function()%0A%40modal.web_server(8000)%0Adef%20my_file_server()%3A%0A%20%20%20%20subprocess.Popen(%22python%20-m%20http.server%20-d%20%2F%208000%22%2C%20shell%3DTrue)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=BG5U09Mb.js.map
