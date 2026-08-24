(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c03adfb8-271c-44ae-8319-b9ffb08c9123`,e._sentryDebugIdIdentifier=`sentry-dbid-c03adfb8-271c-44ae-8319-b9ffb08c9123`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne,r as re}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as ie}from"./B2aB5zxC2.js";var p={crossLinksText:`Fully featured web apps`,crossLinks:[{text:`LLM Voice Chat (React)`,href:`/docs/examples/llm-voice-chat`},{text:`Stable Diffusion (Alpine)`,href:`/docs/examples/text_to_image`}],toc:[{depth:1,value:`Web Functions`,id:`web-functions`,children:[{depth:2,value:`Simple endpoints`,id:`simple-endpoints`,children:[{depth:3,value:`Developing with modal serve`,id:`developing-with-modal-serve`},{depth:3,value:`Deploying with modal deploy`,id:`deploying-with-modal-deploy`},{depth:3,value:`Passing arguments`,id:`passing-arguments`}]},{depth:2,value:`How do Web Functions run in the cloud?`,id:`how-do-web-functions-run-in-the-cloud`},{depth:2,value:`Serving ASGI and WSGI apps`,id:`serving-asgi-and-wsgi-apps`,children:[{depth:3,value:`ASGI apps - FastAPI, FastHTML, Starlette`,id:`asgi-apps---fastapi-fasthtml-starlette`,children:[{depth:4,value:`ASGI Lifespan`,id:`asgi-lifespan`}]},{depth:3,value:`WSGI apps - Django, Flask`,id:`wsgi-apps---django-flask`}]},{depth:2,value:`Non-ASGI web servers`,id:`non-asgi-web-servers`},{depth:2,value:`Serve many configurations with parametrized functions`,id:`serve-many-configurations-with-parametrized-functions`},{depth:2,value:`WebSockets`,id:`websockets`},{depth:2,value:`Performance and scaling`,id:`performance-and-scaling`},{depth:2,value:`Authentication`,id:`authentication`,children:[{depth:3,value:`Token-based authentication`,id:`token-based-authentication`},{depth:3,value:`Client IP address`,id:`client-ip-address`}]}]}],rawContent:`# Web Functions

This guide explains how to set up Web Functions with Modal.

All deployed Modal Functions can be [invoked from any other Python application](/docs/guide/trigger-deployed-functions)
using the Modal client library. We additionally provide multiple ways to expose
your Functions over the web for non-Python clients.

You can [turn any Python function into a Web Function](#simple-endpoints) with a single line
of code, you can [serve a full app](#serving-asgi-and-wsgi-apps) using
frameworks like FastAPI, Django, or Flask, or you can
[serve anything that speaks HTTP and listens on a port](#non-asgi-web-servers).

Below we walk through each method, assuming you're familiar with web applications outside of Modal.
For a detailed walkthrough of basic Web Functions on Modal aimed at developers new to web applications,
see [this tutorial](/docs/examples/basic_web).

## Simple endpoints

The easiest way to make a Python function addressable over the web uses the
[\`@modal.fastapi_endpoint\` decorator](/docs/sdk/py/latest/fastapi_endpoint):

\`\`\`python
image = modal.Image.debian_slim().pip_install("fastapi[standard]")


@app.function(image=image)
@modal.fastapi_endpoint()
def f():
    return "Hello world!"
\`\`\`

This decorator wraps the Modal Function in a
[FastAPI application](#how-do-web-functions-run-in-the-cloud).

_Note: Prior to v0.73.82, this function was named \`@modal.web_endpoint\`_.

### Developing with \`modal serve\`

You can run this code as an ephemeral App, by running the command

\`\`\`shell
modal serve server_script.py
\`\`\`

Where \`server_script.py\` is the file name of your code. This will create an
ephemeral App for the duration of your script (until you hit Ctrl-C to stop it).
It creates a temporary URL that you can use like any other REST endpoint. This
URL is on the public internet.

The \`modal serve\` command will live-update an App when any of its supporting
files change.

Live updating is particularly useful when working with apps containing web
endpoints, as any changes made to Web Function handlers will show up almost
immediately, without requiring a manual restart of the app.

### Deploying with \`modal deploy\`

You can also deploy your App and create a persistent Web Function in the cloud
by running \`modal deploy\`:

<Asciinema recordingId="jYpIj1nL6JI9cw4W77GV2l5Wl" />

### Passing arguments

When using \`@modal.fastapi_endpoint\`, you can add
[query parameters](https://fastapi.tiangolo.com/tutorial/query-params/) which
will be passed to your Function as arguments. For instance

\`\`\`python
image = modal.Image.debian_slim().pip_install("fastapi[standard]")


@app.function(image=image)
@modal.fastapi_endpoint()
def square(x: int):
    return {"square": x**2}
\`\`\`

If you hit this with a URL-encoded query string with the \`x\` parameter present,
the Function will receive the value as an argument:

\`\`\`
$ curl https://modal-labs--web-function-square-dev.modal.run?x=42
{"square":1764}
\`\`\`

If you want to use a \`POST\` request, you can use the \`method\` argument to
\`@modal.fastapi_endpoint\` to set the HTTP verb. To accept any valid JSON object,
[use \`dict\` as your type annotation](https://fastapi.tiangolo.com/tutorial/body-nested-models/?h=dict#bodies-of-arbitrary-dicts)
and FastAPI will handle the rest.

\`\`\`python
image = modal.Image.debian_slim().pip_install("fastapi[standard]")


@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def square(item: dict):
    return {"square": item['x']**2}
\`\`\`

This creates an endpoint that takes a JSON body:

\`\`\`
$ curl -X POST -H 'Content-Type: application/json' --data-binary '{"x": 42}' https://modal-labs--web-function-square-dev.modal.run
{"square":1764}
\`\`\`

This is often the easiest way to get started, but note that FastAPI recommends
that you use
[typed Pydantic models](https://fastapi.tiangolo.com/tutorial/body/) in order to
get automatic validation and documentation. FastAPI also lets you pass data to
Web Functions in other ways, for instance as
[form data](https://fastapi.tiangolo.com/tutorial/request-forms/) and
[file uploads](https://fastapi.tiangolo.com/tutorial/request-files/).

## How do Web Functions run in the cloud?

Note that Web Functions, like everything else on Modal, only run when they need
to. When you hit the URL the first time, it will boot up the container,
which might take a few seconds. Modal keeps the container alive for a short
period in case there are subsequent requests. If there are a lot of requests,
Modal might scale up more containers running in parallel.

For the shortcut \`@modal.fastapi_endpoint\` decorator, Modal wraps your function in a
[FastAPI](https://fastapi.tiangolo.com/) application. This means that the
[Image](/docs/guide/images)
your Function uses must have FastAPI installed, and the Functions that you write
need to follow its request and response
[semantics](https://fastapi.tiangolo.com/tutorial). Web Functions can use
all of FastAPI's powerful features, such as Pydantic models for automatic validation,
typed query and path parameters, and response types.

Here's everything together, combining Modal's abilities to run functions in
user-defined containers with the expressivity of FastAPI:

\`\`\`python
import modal
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

image = modal.Image.debian_slim().pip_install("fastapi[standard]", "boto3")
app = modal.App(image=image)


class Item(BaseModel):
    name: str
    qty: int = 42


@app.function()
@modal.fastapi_endpoint(method="POST")
def f(item: Item):
    import boto3
    # do things with boto3...
    return HTMLResponse(f"<html>Hello, {item.name}!</html>")
\`\`\`

This Function would be called like so:

\`\`\`bash
curl -d '{"name": "Erik", "qty": 10}' \\
    -H "Content-Type: application/json" \\
    -X POST https://ecorp--web-demo-f-dev.modal.run
\`\`\`

Or in Python with the [\`requests\`](https://pypi.org/project/requests/) library:

\`\`\`python
import requests

data = {"name": "Erik", "qty": 10}
requests.post("https://ecorp--web-demo-f-dev.modal.run", json=data, timeout=10.0)
\`\`\`

## Serving ASGI and WSGI apps

You can also serve any app written in an
[ASGI](https://asgi.readthedocs.io/en/latest/) or
[WSGI](https://en.wikipedia.org/wiki/Web_Server_Gateway_Interface)-compatible
web framework on Modal.

ASGI provides support for async web frameworks. WSGI provides support for
synchronous web frameworks.

### ASGI apps - FastAPI, FastHTML, Starlette

For ASGI apps, you can create a function decorated with
[\`@modal.asgi_app\`](/docs/sdk/py/latest/asgi_app) that returns a reference to
your web app:

\`\`\`python
image = modal.Image.debian_slim().pip_install("fastapi[standard]")

@app.function(image=image)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, Request

    web_app = FastAPI()


    @web_app.post("/echo")
    async def echo(request: Request):
        body = await request.json()
        return body

    return web_app
\`\`\`

Now, as before, when you deploy this script as a Modal App, you get a URL for
your app that you can hit:

<Asciinema recordingId="fNSKPUK5hiiFgQEx0pDaMCYBg" />

The \`@modal.concurrent\` decorator enables a single container
to process multiple inputs at once, taking advantage of the asynchronous
event loops in ASGI applications. See [this guide](/docs/guide/concurrent-inputs)
for details.

#### ASGI Lifespan

While we recommend using [\`@modal.enter\`](https://modal.com/docs/guide/lifecycle-functions#enter) for defining container lifecycle hooks, we also support the [ASGI lifespan protocol](https://asgi.readthedocs.io/en/latest/specs/lifespan.html). Lifespans begin when containers start, typically at the time of the first request. Here's an example using [FastAPI](https://fastapi.tiangolo.com/advanced/events/#lifespan):

\`\`\`python
import modal

app = modal.App("fastapi-lifespan-app")

image = modal.Image.debian_slim().pip_install("fastapi[standard]")

@app.function(image=image)
@modal.asgi_app()
def fastapi_app_with_lifespan():
    from fastapi import FastAPI, Request

    def lifespan(wapp: FastAPI):
        print("Starting")
        yield
        print("Shutting down")

    web_app = FastAPI(lifespan=lifespan)

    @web_app.get("/")
    async def hello(request: Request):
        return "hello"

    return web_app
\`\`\`

### WSGI apps - Django, Flask

You can serve WSGI apps using the
[\`@modal.wsgi_app\`](/docs/sdk/py/latest/wsgi_app) decorator:

\`\`\`python
image = modal.Image.debian_slim().pip_install("flask")


@app.function(image=image)
@modal.concurrent(max_inputs=100)
@modal.wsgi_app()
def flask_app():
    from flask import Flask, request

    web_app = Flask(__name__)


    @web_app.post("/echo")
    def echo():
        return request.json

    return web_app
\`\`\`

See [Flask's docs](https://flask.palletsprojects.com/en/2.1.x/deploying/asgi/)
for more information on using Flask as a WSGI app.

Because WSGI apps are synchronous, concurrent inputs will be run on separate
threads. See [this guide](/docs/guide/concurrent-inputs) for details.

## Non-ASGI web servers

Not all web frameworks offer an ASGI or WSGI interface. For example,
[\`aiohttp\`](https://docs.aiohttp.org/) and [\`tornado\`](https://www.tornadoweb.org/)
use their own asynchronous network binding, while others like
[\`text-generation-inference\`](https://github.com/huggingface/text-generation-inference)
actually expose a Rust-based HTTP server running as a subprocess.

For these cases, you can use the
[\`@modal.web_server\`](/docs/sdk/py/latest/web_server) decorator to "expose" a
port on the container:

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=100)
@modal.web_server(8000)
def my_file_server():
    import subprocess
    subprocess.Popen("python -m http.server -d / 8000", shell=True)
\`\`\`

Just like all Functions on Modal, this is only run on-demand. The function is
executed on container startup, creating a file server at the root directory.
When you hit the URL, your request will be routed to the file server listening on
port \`8000\`.

For \`@modal.web_server\` Functions, you need to make sure that the application binds to
the external network interface, not just localhost. This usually means binding
to \`0.0.0.0\` instead of \`127.0.0.1\`.

See, for instance, our examples of how to serve [Streamlit](/docs/examples/serve_streamlit) and
[vLLM](/docs/examples/vllm_inference) on Modal.

## Serve many configurations with parametrized functions

Python functions that launch ASGI/WSGI apps or web servers on Modal
cannot take arguments.

One simple pattern for allowing client-side configuration is to use
[Parametrized Functions](/docs/guide/parametrized-functions). Each different
choice for the values of the parameters will create a distinct auto-scaling
container pool.

\`\`\`python
@app.cls()
@modal.concurrent(max_inputs=100)
class Server:
    root: str = modal.parameter(default=".")

    @modal.web_server(8000)
    def files(self):
        import subprocess
        subprocess.Popen(f"python -m http.server -d {self.root} 8000", shell=True)
\`\`\`

The values are provided in URLs as query parameters:

\`\`\`bash
curl https://ecorp--server-files.modal.run		# use the default value
curl https://ecorp--server-files.modal.run?root=.cache  # use a different value
curl https://ecorp--server-files.modal.run?root=%2F	# don't forget to URL encode!
\`\`\`

For details, see [this guide to parametrized functions](/docs/guide/parametrized-functions).

## WebSockets

Functions annotated with \`@modal.web_server\`, \`@modal.asgi_app\`, or \`@modal.wsgi_app\` also support
the WebSocket protocol. Consult your web framework for appropriate documentation
on how to use WebSockets with that library.

WebSockets on Modal maintain a single function call per connection, which can be
useful for keeping state around. Most of the time, you will want to set your
handler function to [allow concurrent inputs](/docs/guide/concurrent-inputs),
which allows multiple simultaneous WebSocket connections to be handled by the
same container.

We support the full WebSocket protocol as per
[RFC 6455](https://www.rfc-editor.org/rfc/rfc6455), but we do not yet have
support for [RFC 8441](https://www.rfc-editor.org/rfc/rfc8441) (WebSockets over
HTTP/2) or [RFC 7692](https://datatracker.ietf.org/doc/html/rfc7692)
(\`permessage-deflate\` extension). WebSocket messages can be up to 2 MiB each.

## Performance and scaling

If you have no active containers when the Web Function receives a request, it will
experience a "cold start". Consult the guide page on
[cold start performance](/docs/guide/cold-start) for more information on when
Functions will cold start and advice how to mitigate the impact.

If your Function uses \`@modal.concurrent\`, multiple requests to the same
URL may be handled by the same container. Beyond this limit, additional
containers will start up to scale your App horizontally. When you reach the
Function's limit on containers, requests will queue for handling.

Each workspace on Modal has a rate limit on total operations. For a new account,
this is set to 200 Function calls or HTTP requests per second, with a
burst multiplier of 5 seconds. If you reach the rate limit, excess requests will return a
[429 status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429),
and you'll need to [get in touch](mailto:support@modal.com) with us about
raising the limit.

Web Function request bodies can be up to 4 GiB, and their response bodies are
unlimited in size.

## Authentication

Modal offers first-class Web Function protection via [proxy
tokens](https://modal.com/docs/guide/webhook-proxy-auth). Proxy tokens
protect Web Functions by requiring a key and secret combination to be passed in
the \`Modal-Key\` and \`Modal-Secret\` headers. Modal works as a proxy, rejecting
requests that aren't authorized to access your endpoint.

We also support conventional techniques for securing web servers.

### Token-based authentication

This is easy to implement in whichever framework you're using. For example, if
you're using \`@modal.fastapi_endpoint\` or \`@modal.asgi_app\` with FastAPI, you
can validate a Bearer token like this:

\`\`\`python
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import modal

image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App("auth-example", image=image)

auth_scheme = HTTPBearer()


@app.function(secrets=[modal.Secret.from_name("my-web-auth-token")])
@modal.fastapi_endpoint()
async def f(request: Request, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    import os

    print(os.environ["AUTH_TOKEN"])

    if token.credentials != os.environ["AUTH_TOKEN"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Function body
    return "success!"
\`\`\`

This assumes you have a [Modal Secret](https://modal.com/secrets) named
\`my-web-auth-token\` created, with contents \`{AUTH_TOKEN: secret-random-token}\`.
Now, the URL will return a 401 status code, except when you hit it with the
correct \`Authorization\` header set (note that you have to prefix the token with
\`Bearer \`):

\`\`\`bash
curl --header "Authorization: Bearer secret-random-token" https://modal-labs--auth-example-f.modal.run
\`\`\`

### Client IP address

You can access the IP address of the client making the request. This can be used
for geolocation, whitelists, blacklists, and rate limits.

\`\`\`python
from fastapi import Request

import modal

image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App(image=image)


@app.function()
@modal.fastapi_endpoint()
def get_ip_address(request: Request):
    return f"Your IP address is {request.client.host}"
\`\`\`
`,meta:{title:`Web Functions`,description:`This guide explains how to set up Web Functions with Modal.`}},{crossLinksText:m,crossLinks:h,toc:g,rawContent:_,meta:ae}=p,oe=t(`<code>@modal.fastapi_endpoint</code> decorator`,1),se=t(`Developing with <code>modal serve</code>`,1),ce=t(`Deploying with <code>modal deploy</code>`,1),le=t(`use <code>dict</code> as your type annotation`,1),ue=t(`<code>requests</code>`),de=t(`<code>@modal.asgi_app</code>`),fe=t(`<code>@modal.enter</code>`),pe=t(`<code>@modal.wsgi_app</code>`),me=t(`<code>aiohttp</code>`),he=t(`<code>tornado</code>`),ge=t(`<code>text-generation-inference</code>`),_e=t(`<code>@modal.web_server</code>`),ve=t(`<!> <p>This guide explains how to set up Web Functions with Modal.</p> <p>All deployed Modal Functions can be <!> using the Modal client library. We additionally provide multiple ways to expose
your Functions over the web for non-Python clients.</p> <p>You can <!> with a single line
of code, you can <!> using
frameworks like FastAPI, Django, or Flask, or you can <!>.</p> <p>Below we walk through each method, assuming you’re familiar with web applications outside of Modal.
For a detailed walkthrough of basic Web Functions on Modal aimed at developers new to web applications,
see <!>.</p> <!> <p>The easiest way to make a Python function addressable over the web uses the <!>:</p> <!> <p>This decorator wraps the Modal Function in a <!>.</p> <p><em>Note: Prior to v0.73.82, this function was named <code>@modal.web_endpoint</code></em>.</p> <!> <p>You can run this code as an ephemeral App, by running the command</p> <!> <p>Where <code>server_script.py</code> is the file name of your code. This will create an
ephemeral App for the duration of your script (until you hit Ctrl-C to stop it).
It creates a temporary URL that you can use like any other REST endpoint. This
URL is on the public internet.</p> <p>The <code>modal serve</code> command will live-update an App when any of its supporting
files change.</p> <p>Live updating is particularly useful when working with apps containing web
endpoints, as any changes made to Web Function handlers will show up almost
immediately, without requiring a manual restart of the app.</p> <!> <p>You can also deploy your App and create a persistent Web Function in the cloud
by running <code>modal deploy</code>:</p> <!> <!> <p>When using <code>@modal.fastapi_endpoint</code>, you can add <!> which
will be passed to your Function as arguments. For instance</p> <!> <p>If you hit this with a URL-encoded query string with the <code>x</code> parameter present,
the Function will receive the value as an argument:</p> <!> <p>If you want to use a <code>POST</code> request, you can use the <code>method</code> argument to <code>@modal.fastapi_endpoint</code> to set the HTTP verb. To accept any valid JSON object, <!> and FastAPI will handle the rest.</p> <!> <p>This creates an endpoint that takes a JSON body:</p> <!> <p>This is often the easiest way to get started, but note that FastAPI recommends
that you use <!> in order to
get automatic validation and documentation. FastAPI also lets you pass data to
Web Functions in other ways, for instance as <!> and <!>.</p> <!> <p>Note that Web Functions, like everything else on Modal, only run when they need
to. When you hit the URL the first time, it will boot up the container,
which might take a few seconds. Modal keeps the container alive for a short
period in case there are subsequent requests. If there are a lot of requests,
Modal might scale up more containers running in parallel.</p> <p>For the shortcut <code>@modal.fastapi_endpoint</code> decorator, Modal wraps your function in a <!> application. This means that the <!> your Function uses must have FastAPI installed, and the Functions that you write
need to follow its request and response <!>. Web Functions can use
all of FastAPI’s powerful features, such as Pydantic models for automatic validation,
typed query and path parameters, and response types.</p> <p>Here’s everything together, combining Modal’s abilities to run functions in
user-defined containers with the expressivity of FastAPI:</p> <!> <p>This Function would be called like so:</p> <!> <p>Or in Python with the <!> library:</p> <!> <!> <p>You can also serve any app written in an <!> or <!>-compatible
web framework on Modal.</p> <p>ASGI provides support for async web frameworks. WSGI provides support for
synchronous web frameworks.</p> <!> <p>For ASGI apps, you can create a function decorated with <!> that returns a reference to
your web app:</p> <!> <p>Now, as before, when you deploy this script as a Modal App, you get a URL for
your app that you can hit:</p> <!> <p>The <code>@modal.concurrent</code> decorator enables a single container
to process multiple inputs at once, taking advantage of the asynchronous
event loops in ASGI applications. See <!> for details.</p> <!> <p>While we recommend using <!> for defining container lifecycle hooks, we also support the <!>. Lifespans begin when containers start, typically at the time of the first request. Here’s an example using <!>:</p> <!> <!> <p>You can serve WSGI apps using the <!> decorator:</p> <!> <p>See <!> for more information on using Flask as a WSGI app.</p> <p>Because WSGI apps are synchronous, concurrent inputs will be run on separate
threads. See <!> for details.</p> <!> <p>Not all web frameworks offer an ASGI or WSGI interface. For example, <!> and <!> use their own asynchronous network binding, while others like <!> actually expose a Rust-based HTTP server running as a subprocess.</p> <p>For these cases, you can use the <!> decorator to “expose” a
port on the container:</p> <!> <p>Just like all Functions on Modal, this is only run on-demand. The function is
executed on container startup, creating a file server at the root directory.
When you hit the URL, your request will be routed to the file server listening on
port <code>8000</code>.</p> <p>For <code>@modal.web_server</code> Functions, you need to make sure that the application binds to
the external network interface, not just localhost. This usually means binding
to <code>0.0.0.0</code> instead of <code>127.0.0.1</code>.</p> <p>See, for instance, our examples of how to serve <!> and <!> on Modal.</p> <!> <p>Python functions that launch ASGI/WSGI apps or web servers on Modal
cannot take arguments.</p> <p>One simple pattern for allowing client-side configuration is to use <!>. Each different
choice for the values of the parameters will create a distinct auto-scaling
container pool.</p> <!> <p>The values are provided in URLs as query parameters:</p> <!> <p>For details, see <!>.</p> <!> <p>Functions annotated with <code>@modal.web_server</code>, <code>@modal.asgi_app</code>, or <code>@modal.wsgi_app</code> also support
the WebSocket protocol. Consult your web framework for appropriate documentation
on how to use WebSockets with that library.</p> <p>WebSockets on Modal maintain a single function call per connection, which can be
useful for keeping state around. Most of the time, you will want to set your
handler function to <!>,
which allows multiple simultaneous WebSocket connections to be handled by the
same container.</p> <p>We support the full WebSocket protocol as per <!>, but we do not yet have
support for <!> (WebSockets over
HTTP/2) or <!> (<code>permessage-deflate</code> extension). WebSocket messages can be up to 2 MiB each.</p> <!> <p>If you have no active containers when the Web Function receives a request, it will
experience a “cold start”. Consult the guide page on <!> for more information on when
Functions will cold start and advice how to mitigate the impact.</p> <p>If your Function uses <code>@modal.concurrent</code>, multiple requests to the same
URL may be handled by the same container. Beyond this limit, additional
containers will start up to scale your App horizontally. When you reach the
Function’s limit on containers, requests will queue for handling.</p> <p>Each workspace on Modal has a rate limit on total operations. For a new account,
this is set to 200 Function calls or HTTP requests per second, with a
burst multiplier of 5 seconds. If you reach the rate limit, excess requests will return a <!>,
and you’ll need to <!> with us about
raising the limit.</p> <p>Web Function request bodies can be up to 4 GiB, and their response bodies are
unlimited in size.</p> <!> <p>Modal offers first-class Web Function protection via <!>. Proxy tokens
protect Web Functions by requiring a key and secret combination to be passed in
the <code>Modal-Key</code> and <code>Modal-Secret</code> headers. Modal works as a proxy, rejecting
requests that aren’t authorized to access your endpoint.</p> <p>We also support conventional techniques for securing web servers.</p> <!> <p>This is easy to implement in whichever framework you’re using. For example, if
you’re using <code>@modal.fastapi_endpoint</code> or <code>@modal.asgi_app</code> with FastAPI, you
can validate a Bearer token like this:</p> <!> <p>This assumes you have a <!> named <code>my-web-auth-token</code> created, with contents <code>&#123;AUTH_TOKEN: secret-random-token&#125;</code>.
Now, the URL will return a 401 status code, except when you hit it with the
correct <code>Authorization</code> header set (note that you have to prefix the token with <code>Bearer</code>):</p> <!> <!> <p>You can access the IP address of the client making the request. This can be used
for geolocation, whitelists, blacklists, and rate limits.</p> <!>`,1);function v(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ve(),d=te(a);ne(d,{id:`web-functions`,children:(e,t)=>{s(),i(e,r(`Web Functions`))},$$slots:{default:!0}});var p=o(d,4);f(o(e(p)),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{s(),i(e,r(`invoked from any other Python application`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2),h=o(e(m));f(h,{href:`#simple-endpoints`,children:(e,t)=>{s(),i(e,r(`turn any Python function into a Web Function`))},$$slots:{default:!0}});var g=o(h,2);f(g,{href:`#serving-asgi-and-wsgi-apps`,children:(e,t)=>{s(),i(e,r(`serve a full app`))},$$slots:{default:!0}}),f(o(g,2),{href:`#non-asgi-web-servers`,children:(e,t)=>{s(),i(e,r(`serve anything that speaks HTTP and listens on a port`))},$$slots:{default:!0}}),s(),n(m);var _=o(m,2);f(o(e(_)),{href:`/docs/examples/basic_web`,children:(e,t)=>{s(),i(e,r(`this tutorial`))},$$slots:{default:!0}}),s(),n(_);var ae=o(_,2);c(ae,{id:`simple-endpoints`,children:(e,t)=>{s(),i(e,r(`Simple endpoints`))},$$slots:{default:!0}});var v=o(ae,2);f(o(e(v)),{href:`/docs/sdk/py/latest/fastapi_endpoint`,children:(e,t)=>{var n=oe();s(),i(e,n)},$$slots:{default:!0}}),s(),n(v);var ye=o(v,2);u(ye,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%0A%40app.function(image%3Dimage)%0A%40modal.fastapi_endpoint()%0Adef%20f()%3A%0A%20%20%20%20return%20%22Hello%20world!%22`,lang:`python`});var y=o(ye,2);f(o(e(y)),{href:`#how-do-web-functions-run-in-the-cloud`,children:(e,t)=>{s(),i(e,r(`FastAPI application`))},$$slots:{default:!0}}),s(),n(y);var be=o(y,4);l(be,{id:`developing-with-modal-serve`,children:(e,t)=>{s();var n=se();s(),i(e,n)},$$slots:{default:!0}});var xe=o(be,4);u(xe,{code:`modal%20serve%20server_script.py`,lang:`shell`});var Se=o(xe,8);l(Se,{id:`deploying-with-modal-deploy`,children:(e,t)=>{s();var n=ce();s(),i(e,n)},$$slots:{default:!0}});var Ce=o(Se,4);ie(Ce,{recordingId:`jYpIj1nL6JI9cw4W77GV2l5Wl`});var b=o(Ce,2);l(b,{id:`passing-arguments`,children:(e,t)=>{s(),i(e,r(`Passing arguments`))},$$slots:{default:!0}});var x=o(b,2);f(o(e(x),3),{href:`https://fastapi.tiangolo.com/tutorial/query-params/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`query parameters`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);u(S,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%0A%40app.function(image%3Dimage)%0A%40modal.fastapi_endpoint()%0Adef%20square(x%3A%20int)%3A%0A%20%20%20%20return%20%7B%22square%22%3A%20x**2%7D`,lang:`python`});var C=o(S,4);u(C,{code:`%24%20curl%20https%3A%2F%2Fmodal-labs--web-function-square-dev.modal.run%3Fx%3D42%0A%7B%22square%22%3A1764%7D`,lang:`text`});var w=o(C,2);f(o(e(w),7),{href:`https://fastapi.tiangolo.com/tutorial/body-nested-models/?h=dict#bodies-of-arbitrary-dicts`,rel:`nofollow`,children:(e,t)=>{s();var n=le();s(2),i(e,n)},$$slots:{default:!0}}),s(),n(w);var T=o(w,2);u(T,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%0A%40app.function(image%3Dimage)%0A%40modal.fastapi_endpoint(method%3D%22POST%22)%0Adef%20square(item%3A%20dict)%3A%0A%20%20%20%20return%20%7B%22square%22%3A%20item%5B'x'%5D**2%7D`,lang:`python`});var E=o(T,4);u(E,{code:`%24%20curl%20-X%20POST%20-H%20'Content-Type%3A%20application%2Fjson'%20--data-binary%20'%7B%22x%22%3A%2042%7D'%20https%3A%2F%2Fmodal-labs--web-function-square-dev.modal.run%0A%7B%22square%22%3A1764%7D`,lang:`text`});var D=o(E,2),O=o(e(D));f(O,{href:`https://fastapi.tiangolo.com/tutorial/body/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`typed Pydantic models`))},$$slots:{default:!0}});var k=o(O,2);f(k,{href:`https://fastapi.tiangolo.com/tutorial/request-forms/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`form data`))},$$slots:{default:!0}}),f(o(k,2),{href:`https://fastapi.tiangolo.com/tutorial/request-files/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`file uploads`))},$$slots:{default:!0}}),s(),n(D);var A=o(D,2);c(A,{id:`how-do-web-functions-run-in-the-cloud`,children:(e,t)=>{s(),i(e,r(`How do Web Functions run in the cloud?`))},$$slots:{default:!0}});var j=o(A,4),M=o(e(j),3);f(M,{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI`))},$$slots:{default:!0}});var N=o(M,2);f(N,{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`Image`))},$$slots:{default:!0}}),f(o(N,2),{href:`https://fastapi.tiangolo.com/tutorial`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`semantics`))},$$slots:{default:!0}}),s(),n(j);var we=o(j,4);u(we,{code:`import%20modal%0Afrom%20fastapi.responses%20import%20HTMLResponse%0Afrom%20pydantic%20import%20BaseModel%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22%2C%20%22boto3%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0A%0Aclass%20Item(BaseModel)%3A%0A%20%20%20%20name%3A%20str%0A%20%20%20%20qty%3A%20int%20%3D%2042%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22POST%22)%0Adef%20f(item%3A%20Item)%3A%0A%20%20%20%20import%20boto3%0A%20%20%20%20%23%20do%20things%20with%20boto3...%0A%20%20%20%20return%20HTMLResponse(f%22%3Chtml%3EHello%2C%20%7Bitem.name%7D!%3C%2Fhtml%3E%22)`,lang:`python`});var Te=o(we,4);u(Te,{code:`curl%20-d%20'%7B%22name%22%3A%20%22Erik%22%2C%20%22qty%22%3A%2010%7D'%20%5C%0A%20%20%20%20-H%20%22Content-Type%3A%20application%2Fjson%22%20%5C%0A%20%20%20%20-X%20POST%20https%3A%2F%2Fecorp--web-demo-f-dev.modal.run`,lang:`bash`});var P=o(Te,2);f(o(e(P)),{href:`https://pypi.org/project/requests/`,rel:`nofollow`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(),n(P);var Ee=o(P,2);u(Ee,{code:`import%20requests%0A%0Adata%20%3D%20%7B%22name%22%3A%20%22Erik%22%2C%20%22qty%22%3A%2010%7D%0Arequests.post(%22https%3A%2F%2Fecorp--web-demo-f-dev.modal.run%22%2C%20json%3Ddata%2C%20timeout%3D10.0)`,lang:`python`});var De=o(Ee,2);c(De,{id:`serving-asgi-and-wsgi-apps`,children:(e,t)=>{s(),i(e,r(`Serving ASGI and WSGI apps`))},$$slots:{default:!0}});var F=o(De,2),Oe=o(e(F));f(Oe,{href:`https://asgi.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ASGI`))},$$slots:{default:!0}}),f(o(Oe,2),{href:`https://en.wikipedia.org/wiki/Web_Server_Gateway_Interface`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`WSGI`))},$$slots:{default:!0}}),s(),n(F);var ke=o(F,4);l(ke,{id:`asgi-apps---fastapi-fasthtml-starlette`,children:(e,t)=>{s(),i(e,r(`ASGI apps - FastAPI, FastHTML, Starlette`))},$$slots:{default:!0}});var I=o(ke,2);f(o(e(I)),{href:`/docs/sdk/py/latest/asgi_app`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),s(),n(I);var Ae=o(I,2);u(Ae,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%40app.function(image%3Dimage)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Request%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%0A%20%20%20%20%40web_app.post(%22%2Fecho%22)%0A%20%20%20%20async%20def%20echo(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20body%20%3D%20await%20request.json()%0A%20%20%20%20%20%20%20%20return%20body%0A%0A%20%20%20%20return%20web_app`,lang:`python`});var je=o(Ae,4);ie(je,{recordingId:`fNSKPUK5hiiFgQEx0pDaMCYBg`});var L=o(je,2);f(o(e(L),3),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(L);var Me=o(L,2);re(Me,{id:`asgi-lifespan`,children:(e,t)=>{s(),i(e,r(`ASGI Lifespan`))},$$slots:{default:!0}});var R=o(Me,2),Ne=o(e(R));f(Ne,{href:`https://modal.com/docs/guide/lifecycle-functions#enter`,rel:`nofollow`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}});var Pe=o(Ne,2);f(Pe,{href:`https://asgi.readthedocs.io/en/latest/specs/lifespan.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ASGI lifespan protocol`))},$$slots:{default:!0}}),f(o(Pe,2),{href:`https://fastapi.tiangolo.com/advanced/events/#lifespan`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),s(),n(R);var Fe=o(R,2);u(Fe,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22fastapi-lifespan-app%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0A%0A%40app.function(image%3Dimage)%0A%40modal.asgi_app()%0Adef%20fastapi_app_with_lifespan()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Request%0A%0A%20%20%20%20def%20lifespan(wapp%3A%20FastAPI)%3A%0A%20%20%20%20%20%20%20%20print(%22Starting%22)%0A%20%20%20%20%20%20%20%20yield%0A%20%20%20%20%20%20%20%20print(%22Shutting%20down%22)%0A%0A%20%20%20%20web_app%20%3D%20FastAPI(lifespan%3Dlifespan)%0A%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20async%20def%20hello(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20return%20%22hello%22%0A%0A%20%20%20%20return%20web_app`,lang:`python`});var Ie=o(Fe,2);l(Ie,{id:`wsgi-apps---django-flask`,children:(e,t)=>{s(),i(e,r(`WSGI apps - Django, Flask`))},$$slots:{default:!0}});var z=o(Ie,2);f(o(e(z)),{href:`/docs/sdk/py/latest/wsgi_app`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(),n(z);var Le=o(z,2);u(Le,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22flask%22)%0A%0A%0A%40app.function(image%3Dimage)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.wsgi_app()%0Adef%20flask_app()%3A%0A%20%20%20%20from%20flask%20import%20Flask%2C%20request%0A%0A%20%20%20%20web_app%20%3D%20Flask(__name__)%0A%0A%0A%20%20%20%20%40web_app.post(%22%2Fecho%22)%0A%20%20%20%20def%20echo()%3A%0A%20%20%20%20%20%20%20%20return%20request.json%0A%0A%20%20%20%20return%20web_app`,lang:`python`});var B=o(Le,2);f(o(e(B)),{href:`https://flask.palletsprojects.com/en/2.1.x/deploying/asgi/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Flask’s docs`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);f(o(e(V)),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(V);var Re=o(V,2);c(Re,{id:`non-asgi-web-servers`,children:(e,t)=>{s(),i(e,r(`Non-ASGI web servers`))},$$slots:{default:!0}});var H=o(Re,2),ze=o(e(H));f(ze,{href:`https://docs.aiohttp.org/`,rel:`nofollow`,children:(e,t)=>{i(e,me())},$$slots:{default:!0}});var Be=o(ze,2);f(Be,{href:`https://www.tornadoweb.org/`,rel:`nofollow`,children:(e,t)=>{i(e,he())},$$slots:{default:!0}}),f(o(Be,2),{href:`https://github.com/huggingface/text-generation-inference`,rel:`nofollow`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);f(o(e(U)),{href:`/docs/sdk/py/latest/web_server`,children:(e,t)=>{i(e,_e())},$$slots:{default:!0}}),s(),n(U);var Ve=o(U,2);u(Ve,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.web_server(8000)%0Adef%20my_file_server()%3A%0A%20%20%20%20import%20subprocess%0A%20%20%20%20subprocess.Popen(%22python%20-m%20http.server%20-d%20%2F%208000%22%2C%20shell%3DTrue)`,lang:`python`});var W=o(Ve,6),He=o(e(W));f(He,{href:`/docs/examples/serve_streamlit`,children:(e,t)=>{s(),i(e,r(`Streamlit`))},$$slots:{default:!0}}),f(o(He,2),{href:`/docs/examples/vllm_inference`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),s(),n(W);var Ue=o(W,2);c(Ue,{id:`serve-many-configurations-with-parametrized-functions`,children:(e,t)=>{s(),i(e,r(`Serve many configurations with parametrized functions`))},$$slots:{default:!0}});var G=o(Ue,4);f(o(e(G)),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{s(),i(e,r(`Parametrized Functions`))},$$slots:{default:!0}}),s(),n(G);var We=o(G,2);u(We,{code:`%40app.cls()%0A%40modal.concurrent(max_inputs%3D100)%0Aclass%20Server%3A%0A%20%20%20%20root%3A%20str%20%3D%20modal.parameter(default%3D%22.%22)%0A%0A%20%20%20%20%40modal.web_server(8000)%0A%20%20%20%20def%20files(self)%3A%0A%20%20%20%20%20%20%20%20import%20subprocess%0A%20%20%20%20%20%20%20%20subprocess.Popen(f%22python%20-m%20http.server%20-d%20%7Bself.root%7D%208000%22%2C%20shell%3DTrue)`,lang:`python`});var Ge=o(We,4);u(Ge,{code:`curl%20https%3A%2F%2Fecorp--server-files.modal.run%09%09%23%20use%20the%20default%20value%0Acurl%20https%3A%2F%2Fecorp--server-files.modal.run%3Froot%3D.cache%20%20%23%20use%20a%20different%20value%0Acurl%20https%3A%2F%2Fecorp--server-files.modal.run%3Froot%3D%252F%09%23%20don't%20forget%20to%20URL%20encode!`,lang:`bash`});var K=o(Ge,2);f(o(e(K)),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{s(),i(e,r(`this guide to parametrized functions`))},$$slots:{default:!0}}),s(),n(K);var Ke=o(K,2);c(Ke,{id:`websockets`,children:(e,t)=>{s(),i(e,r(`WebSockets`))},$$slots:{default:!0}});var q=o(Ke,4);f(o(e(q)),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{s(),i(e,r(`allow concurrent inputs`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,2),qe=o(e(J));f(qe,{href:`https://www.rfc-editor.org/rfc/rfc6455`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFC 6455`))},$$slots:{default:!0}});var Je=o(qe,2);f(Je,{href:`https://www.rfc-editor.org/rfc/rfc8441`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFC 8441`))},$$slots:{default:!0}}),f(o(Je,2),{href:`https://datatracker.ietf.org/doc/html/rfc7692`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFC 7692`))},$$slots:{default:!0}}),s(3),n(J);var Y=o(J,2);c(Y,{id:`performance-and-scaling`,children:(e,t)=>{s(),i(e,r(`Performance and scaling`))},$$slots:{default:!0}});var X=o(Y,2);f(o(e(X)),{href:`/docs/guide/cold-start`,children:(e,t)=>{s(),i(e,r(`cold start performance`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,4),Ye=o(e(Z));f(Ye,{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`429 status code`))},$$slots:{default:!0}}),f(o(Ye,2),{href:`mailto:support@modal.com`,children:(e,t)=>{s(),i(e,r(`get in touch`))},$$slots:{default:!0}}),s(),n(Z);var Xe=o(Z,4);c(Xe,{id:`authentication`,children:(e,t)=>{s(),i(e,r(`Authentication`))},$$slots:{default:!0}});var Q=o(Xe,2);f(o(e(Q)),{href:`https://modal.com/docs/guide/webhook-proxy-auth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`proxy
tokens`))},$$slots:{default:!0}}),s(5),n(Q);var Ze=o(Q,4);l(Ze,{id:`token-based-authentication`,children:(e,t)=>{s(),i(e,r(`Token-based authentication`))},$$slots:{default:!0}});var Qe=o(Ze,4);u(Qe,{code:`from%20fastapi%20import%20Depends%2C%20HTTPException%2C%20status%2C%20Request%0Afrom%20fastapi.security%20import%20HTTPBearer%2C%20HTTPAuthorizationCredentials%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(%22auth-example%22%2C%20image%3Dimage)%0A%0Aauth_scheme%20%3D%20HTTPBearer()%0A%0A%0A%40app.function(secrets%3D%5Bmodal.Secret.from_name(%22my-web-auth-token%22)%5D)%0A%40modal.fastapi_endpoint()%0Aasync%20def%20f(request%3A%20Request%2C%20token%3A%20HTTPAuthorizationCredentials%20%3D%20Depends(auth_scheme))%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20print(os.environ%5B%22AUTH_TOKEN%22%5D)%0A%0A%20%20%20%20if%20token.credentials%20!%3D%20os.environ%5B%22AUTH_TOKEN%22%5D%3A%0A%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20status_code%3Dstatus.HTTP_401_UNAUTHORIZED%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20detail%3D%22Incorrect%20bearer%20token%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20headers%3D%7B%22WWW-Authenticate%22%3A%20%22Bearer%22%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%23%20Function%20body%0A%20%20%20%20return%20%22success!%22`,lang:`python`});var $=o(Qe,2);f(o(e($)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),s(9),n($);var $e=o($,2);u($e,{code:`curl%20--header%20%22Authorization%3A%20Bearer%20secret-random-token%22%20https%3A%2F%2Fmodal-labs--auth-example-f.modal.run`,lang:`bash`});var et=o($e,2);l(et,{id:`client-ip-address`,children:(e,t)=>{s(),i(e,r(`Client IP address`))},$$slots:{default:!0}}),u(o(et,4),{code:`from%20fastapi%20import%20Request%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint()%0Adef%20get_ip_address(request%3A%20Request)%3A%0A%20%20%20%20return%20f%22Your%20IP%20address%20is%20%7Brequest.client.host%7D%22`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=BiKuNSTV.js.map
