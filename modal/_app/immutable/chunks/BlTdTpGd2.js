(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`80b77cac-f0b2-419d-85b2-1cd2c0bd6640`,e._sentryDebugIdIdentifier=`sentry-dbid-80b77cac-f0b2-419d-85b2-1cd2c0bd6640`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy Flask app with Modal`,id:`deploy-flask-app-with-modal`}],rawContent:`# Deploy Flask app with Modal

This example shows how you can deploy a [Flask](https://flask.palletsprojects.com/en/3.0.x/) app with Modal.
You can serve any app written in a WSGI-compatible web framework (like Flask) on Modal with this pattern. You can serve an app written in an ASGI-compatible framework, like FastAPI, with [\`asgi_app\`](https://modal.com/docs/guide/webhooks#asgi).

\`\`\`python
import modal

app = modal.App(
    "example-flask-app",
    image=modal.Image.debian_slim().uv_pip_install("flask"),
)


@app.function()
@modal.wsgi_app()
def flask_app():
    from flask import Flask, request

    web_app = Flask(__name__)

    @web_app.get("/")
    def home():
        return "Hello Flask World!"

    @web_app.post("/foo")
    def foo():
        return request.json

    return web_app

\`\`\`
`,meta:{title:`Deploy Flask app with Modal`,description:`This example shows how you can deploy a Flask app with Modal. You can serve any app written in a WSGI-compatible web framework (like Flask) on Modal with this pattern. You can serve an app written in an ASGI-compatible framework, like FastAPI, with asgi_app.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>asgi_app</code>`),y=t(`<!> <p>This example shows how you can deploy a <!> app with Modal.
You can serve any app written in a WSGI-compatible web framework (like Flask) on Modal with this pattern. You can serve an app written in an ASGI-compatible framework, like FastAPI, with <!>.</p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`deploy-flask-app-with-modal`,children:(e,t)=>{l(),i(e,r(`Deploy Flask app with Modal`))},$$slots:{default:!0}});var m=c(f,2),h=c(e(m));p(h,{href:`https://flask.palletsprojects.com/en/3.0.x/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flask`))},$$slots:{default:!0}}),p(c(h,2),{href:`https://modal.com/docs/guide/webhooks#asgi`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(m),d(c(m,2),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-flask-app%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22flask%22)%2C%0A)%0A%0A%0A%40app.function()%0A%40modal.wsgi_app()%0Adef%20flask_app()%3A%0A%20%20%20%20from%20flask%20import%20Flask%2C%20request%0A%0A%20%20%20%20web_app%20%3D%20Flask(__name__)%0A%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20def%20home()%3A%0A%20%20%20%20%20%20%20%20return%20%22Hello%20Flask%20World!%22%0A%0A%20%20%20%20%40web_app.post(%22%2Ffoo%22)%0A%20%20%20%20def%20foo()%3A%0A%20%20%20%20%20%20%20%20return%20request.json%0A%0A%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=BlTdTpGd2.js.map
