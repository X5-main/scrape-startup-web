(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d12c589a-08fc-4573-8523-d715dfa69047`,e._sentryDebugIdIdentifier=`sentry-dbid-d12c589a-08fc-4573-8523-d715dfa69047`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Serve a receipt parsing web app`,id:`serve-a-receipt-parsing-web-app`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Define endpoints`,id:`define-endpoints`},{depth:2,value:`Running`,id:`running`},{depth:2,value:`Deploy`,id:`deploy`}]}],rawContent:`# Serve a receipt parsing web app

This tutorial shows you how to use Modal to deploy a fully serverless
[React](https://reactjs.org/) + [FastAPI](https://fastapi.tiangolo.com/) application.

We're going to build a simple "Receipt Parser" web app that submits document parsing
tasks to a separate Modal app defined in [another example](https://modal.com/docs/examples/doc_ocr_jobs),
polls until the task is completed, and displays
the results. Try it out for yourself
[here](https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/).

It should look something like this:

[![Webapp frontend](https://modal-cdn.com/doc_ocr_frontend.jpg)](https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/)

## Basic setup

Let's get the imports out of the way and define an [\`App\`](https://modal.com/docs/reference/modal.App).

\`\`\`python
from pathlib import Path

import fastapi
import fastapi.staticfiles
import modal

app = modal.App("example-doc-ocr-webapp")

\`\`\`

Modal works with any [ASGI](https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps) or
[WSGI](https://modal.com/docs/guide/webhooks#wsgi) web framework. Here, we choose to use [FastAPI](https://fastapi.tiangolo.com/).

\`\`\`python
web_app = fastapi.FastAPI()

\`\`\`

## Define endpoints

We need two endpoints: one to accept an image and submit it to the Modal job queue,
and another to poll for the results of the job.

In \`parse\`, we're going to submit tasks to the Function defined in the [Job
Queue tutorial](https://modal.com/docs/examples/doc_ocr_jobs), so we import it first using
[\`Function.lookup\`](https://modal.com/docs/reference/modal.Function#lookup).

We call [\`.spawn()\`](https://modal.com/docs/reference/modal.Function#spawn) on the Function handle
we imported above to kick off our Function without blocking on the results. \`spawn\` returns
a unique ID for the function call, which we then use
to poll for its result.

\`\`\`python
@web_app.post("/parse")
async def parse(request: fastapi.Request):
    parse_receipt = modal.Function.from_name("example-doc-ocr-jobs", "parse_document")

    form = await request.form()
    receipt = await form["receipt"].read()  # type: ignore
    call = parse_receipt.spawn(receipt)
    return {"call_id": call.object_id}


\`\`\`

\`/result\` uses the provided \`call_id\` to instantiate a \`modal.FunctionCall\` object, and attempt
to get its result. If the call hasn't finished yet, we return a \`202\` status code, which indicates
that the server is still working on the job.

\`\`\`python
@web_app.get("/result/{call_id}")
async def poll_results(call_id: str):
    function_call = modal.functions.FunctionCall.from_id(call_id)
    try:
        result = await function_call.get.aio(timeout=0)
    except TimeoutError:
        return fastapi.responses.JSONResponse(content="", status_code=202)

    return result


\`\`\`

Now that we've defined our endpoints, we're ready to host them on Modal.
First, we specify our dependencies -- here, a basic Debian Linux
environment with FastAPI installed.

\`\`\`python
image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi[standard]==0.115.4"
)

\`\`\`

Then, we add the static files for our front-end. We've made [a simple React
app](https://github.com/modal-labs/modal-examples/tree/main/09_job_queues/doc_ocr_frontend)
that hits the two endpoints defined above. To package these files with our app, we use
\`add_local_dir\` with the local directory of the assets, and specify that we want them
in the \`/assets\` directory inside our container (the \`remote_path\`). Then, we instruct FastAPI to [serve
this static file directory](https://fastapi.tiangolo.com/tutorial/static-files/) at our root path.

\`\`\`python
local_assets_path = Path(__file__).parent / "doc_ocr_frontend"
image = image.add_local_dir(local_assets_path, remote_path="/assets")

\`\`\`

We serve them from our FastAPI app as \`StaticFiles\`.

To put our FastAPI app on Modal, we need to return it from a Python function
that is wrapped with some extra decorators:

- [\`modal.asgi_app\`](https://modal.com/docs/reference/modal.asgi_app)
to ensure the Modal system knows to route web traffic to it (and in what format)
- [\`modal.concurrent\`](https://modal.com/docs/reference/modal.concurrent)
to allow more than one request (e.g. for stylesheet and for HTML) to be served concurrently
- [\`app.function\`](https://modal.com/docs/reference/modal.App#function)
to turn our Python function into a Modal Function and define the infrastructure it needs
(here, just the dependencies).

\`\`\`python
@app.function(image=image)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def wrapper():
    web_app.mount("/", fastapi.staticfiles.StaticFiles(directory="/assets", html=True))
    return web_app


\`\`\`

## Running

While developing, you can run this as an ephemeral app by executing the command

\`\`\`shell
modal serve doc_ocr_webapp.py
\`\`\`

If successful, this will print a URL for your app that you can navigate to in
your browser 🎉 .

The result should look something like this:

[![Webapp frontend](https://modal-cdn.com/doc_ocr_frontend.jpg)](https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/)

Modal watches all the mounted files and updates the app if anything changes.
See [these docs](https://modal.com/docs/guide/webhooks#developing-with-modal-serve)
for more details.

## Deploy

To deploy your application, run

\`\`\`shell
modal deploy doc_ocr_webapp.py
\`\`\`

That's all!
`,meta:{title:`Serve a receipt parsing web app`,description:`This tutorial shows you how to use Modal to deploy a fully serverless React + FastAPI application.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>App</code>`),x=t(`<code>Function.lookup</code>`),S=t(`<code>.spawn()</code>`),C=t(`<code>modal.asgi_app</code>`),w=t(`<code>modal.concurrent</code>`),T=t(`<code>app.function</code>`),ee=t(`<!> <p>This tutorial shows you how to use Modal to deploy a fully serverless <!> + <!> application.</p> <p>We’re going to build a simple “Receipt Parser” web app that submits document parsing
tasks to a separate Modal app defined in <!>,
polls until the task is completed, and displays
the results. Try it out for yourself <!>.</p> <p>It should look something like this:</p> <p><!></p> <!> <p>Let’s get the imports out of the way and define an <!>.</p> <!> <p>Modal works with any <!> or <!> web framework. Here, we choose to use <!>.</p> <!> <!> <p>We need two endpoints: one to accept an image and submit it to the Modal job queue,
and another to poll for the results of the job.</p> <p>In <code>parse</code>, we’re going to submit tasks to the Function defined in the <!>, so we import it first using <!>.</p> <p>We call <!> on the Function handle
we imported above to kick off our Function without blocking on the results. <code>spawn</code> returns
a unique ID for the function call, which we then use
to poll for its result.</p> <!> <p><code>/result</code> uses the provided <code>call_id</code> to instantiate a <code>modal.FunctionCall</code> object, and attempt
to get its result. If the call hasn’t finished yet, we return a <code>202</code> status code, which indicates
that the server is still working on the job.</p> <!> <p>Now that we’ve defined our endpoints, we’re ready to host them on Modal.
First, we specify our dependencies — here, a basic Debian Linux
environment with FastAPI installed.</p> <!> <p>Then, we add the static files for our front-end. We’ve made <!> that hits the two endpoints defined above. To package these files with our app, we use <code>add_local_dir</code> with the local directory of the assets, and specify that we want them
in the <code>/assets</code> directory inside our container (the <code>remote_path</code>). Then, we instruct FastAPI to <!> at our root path.</p> <!> <p>We serve them from our FastAPI app as <code>StaticFiles</code>.</p> <p>To put our FastAPI app on Modal, we need to return it from a Python function
that is wrapped with some extra decorators:</p> <ul><li><!> to ensure the Modal system knows to route web traffic to it (and in what format)</li> <li><!> to allow more than one request (e.g. for stylesheet and for HTML) to be served concurrently</li> <li><!> to turn our Python function into a Modal Function and define the infrastructure it needs
(here, just the dependencies).</li></ul> <!> <!> <p>While developing, you can run this as an ephemeral app by executing the command</p> <!> <p>If successful, this will print a URL for your app that you can navigate to in
your browser 🎉 .</p> <p>The result should look something like this:</p> <p><!></p> <p>Modal watches all the mounted files and updates the app if anything changes.
See <!> for more details.</p> <!> <p>To deploy your application, run</p> <!> <p>That’s all!</p>`,1);function E(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=ee(),m=s(o);d(m,{id:`serve-a-receipt-parsing-web-app`,children:(e,t)=>{l(),i(e,r(`Serve a receipt parsing web app`))},$$slots:{default:!0}});var g=c(m,2),_=c(e(g));h(_,{href:`https://reactjs.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`React`))},$$slots:{default:!0}}),h(c(_,2),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2),y=c(e(v));h(y,{href:`https://modal.com/docs/examples/doc_ocr_jobs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`another example`))},$$slots:{default:!0}}),h(c(y,2),{href:`https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(v);var E=c(v,4);h(e(E),{href:`https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/`,rel:`nofollow`,children:(e,t)=>{f(e,{src:`https://modal-cdn.com/doc_ocr_frontend.jpg`,alt:`Webapp frontend`})},$$slots:{default:!0}}),n(E);var D=c(E,2);u(D,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var O=c(D,2);h(c(e(O)),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);p(k,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20fastapi%0Aimport%20fastapi.staticfiles%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-doc-ocr-webapp%22)%0A`,lang:`python`});var A=c(k,2),j=c(e(A));h(j,{href:`https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ASGI`))},$$slots:{default:!0}});var M=c(j,2);h(M,{href:`https://modal.com/docs/guide/webhooks#wsgi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WSGI`))},$$slots:{default:!0}}),h(c(M,2),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),l(),n(A);var N=c(A,2);p(N,{code:`web_app%20%3D%20fastapi.FastAPI()%0A`,lang:`python`});var P=c(N,2);u(P,{id:`define-endpoints`,children:(e,t)=>{l(),i(e,r(`Define endpoints`))},$$slots:{default:!0}});var F=c(P,4),I=c(e(F),3);h(I,{href:`https://modal.com/docs/examples/doc_ocr_jobs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Job
Queue tutorial`))},$$slots:{default:!0}}),h(c(I,2),{href:`https://modal.com/docs/reference/modal.Function#lookup`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(F);var L=c(F,2);h(c(e(L)),{href:`https://modal.com/docs/reference/modal.Function#spawn`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(3),n(L);var R=c(L,2);p(R,{code:`%40web_app.post(%22%2Fparse%22)%0Aasync%20def%20parse(request%3A%20fastapi.Request)%3A%0A%20%20%20%20parse_receipt%20%3D%20modal.Function.from_name(%22example-doc-ocr-jobs%22%2C%20%22parse_document%22)%0A%0A%20%20%20%20form%20%3D%20await%20request.form()%0A%20%20%20%20receipt%20%3D%20await%20form%5B%22receipt%22%5D.read()%20%20%23%20type%3A%20ignore%0A%20%20%20%20call%20%3D%20parse_receipt.spawn(receipt)%0A%20%20%20%20return%20%7B%22call_id%22%3A%20call.object_id%7D%0A%0A`,lang:`python`});var z=c(R,4);p(z,{code:`%40web_app.get(%22%2Fresult%2F%7Bcall_id%7D%22)%0Aasync%20def%20poll_results(call_id%3A%20str)%3A%0A%20%20%20%20function_call%20%3D%20modal.functions.FunctionCall.from_id(call_id)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20await%20function_call.get.aio(timeout%3D0)%0A%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(content%3D%22%22%2C%20status_code%3D202)%0A%0A%20%20%20%20return%20result%0A%0A`,lang:`python`});var B=c(z,4);p(B,{code:`image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%0A)%0A`,lang:`python`});var V=c(B,2),H=c(e(V));h(H,{href:`https://github.com/modal-labs/modal-examples/tree/main/09_job_queues/doc_ocr_frontend`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`a simple React
app`))},$$slots:{default:!0}}),h(c(H,8),{href:`https://fastapi.tiangolo.com/tutorial/static-files/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`serve
this static file directory`))},$$slots:{default:!0}}),l(),n(V);var U=c(V,2);p(U,{code:`local_assets_path%20%3D%20Path(__file__).parent%20%2F%20%22doc_ocr_frontend%22%0Aimage%20%3D%20image.add_local_dir(local_assets_path%2C%20remote_path%3D%22%2Fassets%22)%0A`,lang:`python`});var W=c(U,6),G=e(W);h(e(G),{href:`https://modal.com/docs/reference/modal.asgi_app`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(G);var K=c(G,2);h(e(K),{href:`https://modal.com/docs/reference/modal.concurrent`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(K);var q=c(K,2);h(e(q),{href:`https://modal.com/docs/reference/modal.App#function`,rel:`nofollow`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(),n(q),n(W);var J=c(W,2);p(J,{code:`%40app.function(image%3Dimage)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20wrapper()%3A%0A%20%20%20%20web_app.mount(%22%2F%22%2C%20fastapi.staticfiles.StaticFiles(directory%3D%22%2Fassets%22%2C%20html%3DTrue))%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var Y=c(J,2);u(Y,{id:`running`,children:(e,t)=>{l(),i(e,r(`Running`))},$$slots:{default:!0}});var X=c(Y,4);p(X,{code:`modal%20serve%20doc_ocr_webapp.py`,lang:`shell`});var Z=c(X,6);h(e(Z),{href:`https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/`,rel:`nofollow`,children:(e,t)=>{f(e,{src:`https://modal-cdn.com/doc_ocr_frontend.jpg`,alt:`Webapp frontend`})},$$slots:{default:!0}}),n(Z);var Q=c(Z,2);h(c(e(Q)),{href:`https://modal.com/docs/guide/webhooks#developing-with-modal-serve`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`these docs`))},$$slots:{default:!0}}),l(),n(Q);var $=c(Q,2);u($,{id:`deploy`,children:(e,t)=>{l(),i(e,r(`Deploy`))},$$slots:{default:!0}}),p(c($,4),{code:`modal%20deploy%20doc_ocr_webapp.py`,lang:`shell`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{E as default,g as metadata};
//# sourceMappingURL=Ca93NlyX2.js.map
