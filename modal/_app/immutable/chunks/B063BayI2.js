(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`53ad6f10-3b98-4457-bf79-a56ed101bbe1`,e._sentryDebugIdIdentifier=`sentry-dbid-53ad6f10-3b98-4457-bf79-a56ed101bbe1`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy a FastHTML app with Modal`,id:`deploy-a-fasthtml-app-with-modal`}],rawContent:`# Deploy a FastHTML app with Modal

This example shows how you can deploy a FastHTML app with Modal.
[FastHTML](https://www.fastht.ml/) is a Python library built on top of [HTMX](https://htmx.org/)
which allows you to create entire web applications using only Python.

The integration is pretty simple, thanks to the ASGI standard.
You just need to define a function returns your FastHTML app
and is decorated with \`app.function\` and \`modal.asgi_app\`.

\`\`\`python
import modal

app = modal.App("example-fasthtml-app")


@app.function(
    image=modal.Image.debian_slim(python_version="3.12").uv_pip_install(
        "python-fasthtml==0.5.2"
    )
)
@modal.asgi_app()
def serve():
    import fasthtml.common as fh

    app = fh.FastHTML()

    @app.get("/")
    def home():
        return fh.Div(fh.P("Hello World!"), hx_get="/change")

    return app

\`\`\`
`,meta:{title:`Deploy a FastHTML app with Modal`,description:`This example shows how you can deploy a FastHTML app with Modal. FastHTML is a Python library built on top of HTMX which allows you to create entire web applications using only Python.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This example shows how you can deploy a FastHTML app with Modal. <!> is a Python library built on top of <!> which allows you to create entire web applications using only Python.</p> <p>The integration is pretty simple, thanks to the ASGI standard.
You just need to define a function returns your FastHTML app
and is decorated with <code>app.function</code> and <code>modal.asgi_app</code>.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`deploy-a-fasthtml-app-with-modal`,children:(e,t)=>{l(),i(e,r(`Deploy a FastHTML app with Modal`))},$$slots:{default:!0}});var m=c(f,2),h=c(e(m));p(h,{href:`https://www.fastht.ml/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastHTML`))},$$slots:{default:!0}}),p(c(h,2),{href:`https://htmx.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HTMX`))},$$slots:{default:!0}}),l(),n(m),d(c(m,4),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-fasthtml-app%22)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%20%20%20%20%22python-fasthtml%3D%3D0.5.2%22%0A%20%20%20%20)%0A)%0A%40modal.asgi_app()%0Adef%20serve()%3A%0A%20%20%20%20import%20fasthtml.common%20as%20fh%0A%0A%20%20%20%20app%20%3D%20fh.FastHTML()%0A%0A%20%20%20%20%40app.get(%22%2F%22)%0A%20%20%20%20def%20home()%3A%0A%20%20%20%20%20%20%20%20return%20fh.Div(fh.P(%22Hello%20World!%22)%2C%20hx_get%3D%22%2Fchange%22)%0A%0A%20%20%20%20return%20app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=B063BayI2.js.map
