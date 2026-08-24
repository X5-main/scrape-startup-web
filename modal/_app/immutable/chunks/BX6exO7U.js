(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fcd18c5c-a4f2-4c01-9dcf-8b08984185fe`,e._sentryDebugIdIdentifier=`sentry-dbid-fcd18c5c-a4f2-4c01-9dcf-8b08984185fe`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`Handle long-running Web Function requests on Modal with automatic redirects and polling patterns for results.`,toc:[{depth:1,value:`Request timeouts`,id:`request-timeouts`,children:[{depth:2,value:`Polling solutions`,id:`polling-solutions`}]}],rawContent:`# Request timeouts

Web Function requests should complete quickly, ideally within a
few seconds. All Web Function types
([\`modal.fastapi_endpoint\`](/docs/sdk/py/latest/fastapi_endpoint),
[\`modal.asgi_app\`](/docs/sdk/py/latest/asgi_app),
[\`modal.wsgi_app\`](/docs/sdk/py/latest/wsgi_app),
and [\`modal.web_server\`](/docs/sdk/py/latest/web_server))
have a maximum HTTP request timeout of 150 seconds enforced. However, the
underlying Modal Function can have a longer [timeout](/docs/guide/timeouts).

In case the Function takes more than 150 seconds to complete, an HTTP status 303
redirect response is returned pointing at the original URL with a special query
parameter linking it that request. This is the _result URL_ for your function.
Most web browsers allow for up to 20 such redirects, effectively allowing up to
50 minutes (20 \\* 150 s) for Web Functions before the request times out.

(**Note:** This does not work with requests that require
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), since the
response will not have been returned from your code in time for the server to
populate CORS headers.)

Some libraries and tools might require you to add a flag or option in order to
follow redirects automatically, e.g. \`curl -L ...\` or \`http --follow ...\`.

The _result URL_ can be reloaded without triggering a new request. It will block
until the request completes.

(**Note:** As of March 2025, the Python standard library's \`urllib\` module has the
maximum number of redirects to any single URL set to 4 by default ([source](https://github.com/python/cpython/blob/main/Lib/urllib/request.py)), which would limit the total timeout to 12.5 minutes (5 \\* 150 s = 750 s) unless this setting is overridden.)

## Polling solutions

Sometimes it can be useful to be able to poll for results rather than wait for a
long running HTTP request. The easiest way to do this is to have your web
endpoint spawn a \`modal.Function\` call and return the function call id that
another endpoint can use to poll the submitted function's status. Here is an
example:

\`\`\`python
import fastapi

import modal


image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App(image=image)

web_app = fastapi.FastAPI()


@app.function()
@modal.asgi_app()
def fastapi_app():
    return web_app


@app.function()
def slow_operation():
    ...


@web_app.post("/accept")
async def accept_job(request: fastapi.Request):
    call = slow_operation.spawn()
    return {"call_id": call.object_id}


@web_app.get("/result/{call_id}")
async def poll_results(call_id: str):
    function_call = modal.FunctionCall.from_id(call_id)
    try:
        return function_call.get(timeout=0)
    except TimeoutError:
        http_accepted_code = 202
        return fastapi.responses.JSONResponse({}, status_code=http_accepted_code)
\`\`\`

[_Document OCR Web App_](/docs/examples/doc_ocr_webapp) is an example that uses
this pattern.
`,meta:{title:`Request timeouts`,description:`Handle long-running Web Function requests on Modal with automatic redirects and polling patterns for results.`}},{description:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal.fastapi_endpoint</code>`),x=t(`<code>modal.asgi_app</code>`),S=t(`<code>modal.wsgi_app</code>`),C=t(`<code>modal.web_server</code>`),w=t(`<em>Document OCR Web App</em>`),T=t(`<!> <p>Web Function requests should complete quickly, ideally within a
few seconds. All Web Function types
(<!>, <!>, <!>,
and <!>)
have a maximum HTTP request timeout of 150 seconds enforced. However, the
underlying Modal Function can have a longer <!>.</p> <p>In case the Function takes more than 150 seconds to complete, an HTTP status 303
redirect response is returned pointing at the original URL with a special query
parameter linking it that request. This is the <em>result URL</em> for your function.
Most web browsers allow for up to 20 such redirects, effectively allowing up to
50 minutes (20 * 150 s) for Web Functions before the request times out.</p> <p>(<strong>Note:</strong> This does not work with requests that require <!>, since the
response will not have been returned from your code in time for the server to
populate CORS headers.)</p> <p>Some libraries and tools might require you to add a flag or option in order to
follow redirects automatically, e.g. <code>curl -L ...</code> or <code>http --follow ...</code>.</p> <p>The <em>result URL</em> can be reloaded without triggering a new request. It will block
until the request completes.</p> <p>(<strong>Note:</strong> As of March 2025, the Python standard library’s <code>urllib</code> module has the
maximum number of redirects to any single URL set to 4 by default (<!>), which would limit the total timeout to 12.5 minutes (5 * 150 s = 750 s) unless this setting is overridden.)</p> <!> <p>Sometimes it can be useful to be able to poll for results rather than wait for a
long running HTTP request. The easiest way to do this is to have your web
endpoint spawn a <code>modal.Function</code> call and return the function call id that
another endpoint can use to poll the submitted function’s status. Here is an
example:</p> <!> <p><!> is an example that uses
this pattern.</p>`,1);function E(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=T(),p=s(o);d(p,{id:`request-timeouts`,children:(e,t)=>{l(),i(e,r(`Request timeouts`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`/docs/sdk/py/latest/fastapi_endpoint`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`/docs/sdk/py/latest/asgi_app`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`/docs/sdk/py/latest/wsgi_app`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var y=c(v,2);m(y,{href:`/docs/sdk/py/latest/web_server`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),m(c(y,2),{href:`/docs/guide/timeouts`,children:(e,t)=>{l(),i(e,r(`timeout`))},$$slots:{default:!0}}),l(),n(h);var E=c(h,4);m(c(e(E),3),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CORS`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,6);m(c(e(D),5),{href:`https://github.com/python/cpython/blob/main/Lib/urllib/request.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`source`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);u(O,{id:`polling-solutions`,children:(e,t)=>{l(),i(e,r(`Polling solutions`))},$$slots:{default:!0}});var k=c(O,4);f(k,{code:`import%20fastapi%0A%0Aimport%20modal%0A%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0Aweb_app%20%3D%20fastapi.FastAPI()%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20return%20web_app%0A%0A%0A%40app.function()%0Adef%20slow_operation()%3A%0A%20%20%20%20...%0A%0A%0A%40web_app.post(%22%2Faccept%22)%0Aasync%20def%20accept_job(request%3A%20fastapi.Request)%3A%0A%20%20%20%20call%20%3D%20slow_operation.spawn()%0A%20%20%20%20return%20%7B%22call_id%22%3A%20call.object_id%7D%0A%0A%0A%40web_app.get(%22%2Fresult%2F%7Bcall_id%7D%22)%0Aasync%20def%20poll_results(call_id%3A%20str)%3A%0A%20%20%20%20function_call%20%3D%20modal.FunctionCall.from_id(call_id)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20return%20function_call.get(timeout%3D0)%0A%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20http_accepted_code%20%3D%20202%0A%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(%7B%7D%2C%20status_code%3Dhttp_accepted_code)`,lang:`python`});var A=c(k,2);m(e(A),{href:`/docs/examples/doc_ocr_webapp`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(A),i(t,o)},$$slots:{default:!0}}))}export{E as default,h as metadata};
//# sourceMappingURL=BX6exO7U.js.map
