(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e27ed450-80cf-4956-b1ba-8225f25a4bac`,e._sentryDebugIdIdentifier=`sentry-dbid-e27ed450-80cf-4956-b1ba-8225f25a4bac`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Hello world wide web!`,id:`hello-world-wide-web`,children:[{depth:2,value:`Turn a Modal Function into an API endpoint with a single decorator`,id:`turn-a-modal-function-into-an-api-endpoint-with-a-single-decorator`},{depth:2,value:`Send data to a Web Function`,id:`send-data-to-a-web-function`,children:[{depth:3,value:`Sending data in query parameters`,id:`sending-data-in-query-parameters`},{depth:3,value:`Sending data in the request body`,id:`sending-data-in-the-request-body`}]},{depth:2,value:`Handle expensive startup with modal.Cls`,id:`handle-expensive-startup-with-modalcls`},{depth:2,value:`Protect Web Functions with proxy authentication`,id:`protect-web-functions-with-proxy-authentication`},{depth:2,value:`What next?`,id:`what-next`}]}],rawContent:`# Hello world wide web!

Modal makes it easy to turn your Python functions into serverless web services:
access them via a browser or call them from any client that speaks HTTP, all
without having to worry about setting up servers or managing infrastructure.

This tutorial shows the path with the shortest ["time to 200"](https://shkspr.mobi/blog/2021/05/whats-your-apis-time-to-200/):
[\`modal.fastapi_endpoint\`](https://modal.com/docs/reference/modal.fastapi_endpoint).

On Modal, Web Functions have all the superpowers of Modal Functions:
they can be [accelerated with GPUs](https://modal.com/docs/guide/gpu),
they can access [Secrets](https://modal.com/docs/guide/secrets) or [Volumes](https://modal.com/docs/guide/volumes),
and they [automatically scale](https://modal.com/docs/guide/cold-start) to handle more traffic.

Under the hood, we use the [FastAPI library](https://fastapi.tiangolo.com/),
which has [high-quality documentation](https://fastapi.tiangolo.com/tutorial/),
linked throughout this tutorial.

## Turn a Modal Function into an API endpoint with a single decorator

Modal Functions are already accessible remotely -- when you add the \`@app.function\` decorator to a Python function
and run \`modal deploy\`, you make it possible for your [other Python functions to call it](https://modal.com/docs/guide/trigger-deployed-functions).

That's great, but it's not much help if you want to share what you've written with someone running code in a different language --
or not running code at all!

And that's where most of the power of the Internet comes from: sharing information and functionality across different computer systems.

So we provide the \`fastapi_endpoint\` decorator to wrap your Modal Functions in the lingua franca of the web: HTTP.
Here's what that looks like:

\`\`\`python
import modal

image = modal.Image.debian_slim().uv_pip_install("fastapi[standard]")
app = modal.App(name="example-basic-web", image=image)


@app.function()
@modal.fastapi_endpoint(
    docs=True  # adds interactive documentation in the browser
)
def hello():
    return "Hello world!"


\`\`\`

You can expose this Web Function to the internet by running \`modal serve basic_web.py\`.
In the output, you should see a URL that ends with \`hello-dev.modal.run\`.
If you navigate to this URL, you should see the \`"Hello world!"\` message appear in your browser.

You can also find interactive documentation, powered by OpenAPI and Swagger,
if you add \`/docs\` to the end of the URL.
From this documentation, you can interact with your endpoint, sending HTTP requests and receiving HTTP responses.
For more details, see the [FastAPI documentation](https://fastapi.tiangolo.com/features/#automatic-docs).

By running the App with \`modal serve\`, you created a temporary endpoint that will disappear if you interrupt your terminal.
These temporary endpoints are great for debugging -- when you save a change to any of your dependent files, the endpoint will redeploy.
Try changing the message to something else, hitting save, and then hitting refresh in your browser or re-sending
the request from \`/docs\` or the command line. You should see the new message, along with logs in your terminal showing the redeploy and the request.

When you're ready to deploy the Web Function persistently, run \`modal deploy basic_web.py\`.
Now, your Function will be available even when you've closed your terminal or turned off your computer.

## Send data to a Web Function

The function above was a bit silly: it always returns the same message.

Most functions need an input to be useful. There are two ways to send data to a Web Function:
- in the URL as a [query parameter](#sending-data-in-query-parameters)
- in the [body of the request](#sending-data-in-the-request-body) as JSON

### Sending data in query parameters

By default, your function's arguments are treated as query parameters:
they are extracted from the end of the URL, where they should be added in the form
\`?arg1=foo&arg2=bar\`.

From the Python side, there's hardly anything to do:

\`\`\`python
@app.function()
@modal.fastapi_endpoint(docs=True)
def greet(user: str) -> str:
    return f"Hello {user}!"


\`\`\`

If you are already running \`modal serve basic_web.py\`, this Function will be available at a URL, printed in your terminal, that ends with \`greet-dev.modal.run\`.

We provide Python type-hints to get type information in the docs and
[automatic validation](https://fastapi.tiangolo.com/tutorial/query-params-str-validations/).
For example, if you navigate directly to the URL for \`greet\`, you will get a detailed error message
indicating that the \`user\` parameter is missing. Navigate instead to \`/docs\` to see how to structure the request.

You can read more about query parameters in the [FastAPI documentation](https://fastapi.tiangolo.com/tutorial/query-params/).

### Sending data in the request body

For larger and more complex data, it is generally preferable to send data in the body of the HTTP request.
This body is formatted as [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON),
the most common data interchange format on the web.

To set up a Web Function that accepts JSON data, add an argument with a \`dict\` type-hint to your function.
This argument will be populated with the data sent in the request body.

\`\`\`python
@app.function()
@modal.fastapi_endpoint(method="POST", docs=True)
def goodbye(data: dict) -> str:
    name = data.get("name") or "world"
    return f"Goodbye {name}!"


\`\`\`

Note that we gave a value of \`"POST"\` for the \`method\` argument here.
This argument defines the HTTP request method that the function will respond to,
and it defaults to \`"GET"\`.
If you head to the URL for the \`goodbye\` function in your browser,
you will get a 405 Method Not Allowed error, because browsers only send GET requests by default.
While this is technically a separate concern from query parameters versus request bodies
and you can define a function that accepts GET requests and uses data from the body,
it is [considered bad form](https://stackoverflow.com/a/983458).

Navigate to \`/docs\` for more on how to call the function.
You will need to send a POST request with a JSON body containing a \`name\` key.
To get the same typing and validation benefits as with query parameters,
use a [Pydantic model](https://fastapi.tiangolo.com/tutorial/body/)
for this argument.

You can read more about request bodies in the [FastAPI documentation](https://fastapi.tiangolo.com/tutorial/body/).

## Handle expensive startup with \`modal.Cls\`

Sometimes your function needs to do something before it can handle its first request,
like get a value from a database or set the value of a variable.
If that step is expensive, like [loading a large ML model](https://modal.com/docs/guide/model-weights),
it'd be a shame to have to do it every time a request comes in!

Web Functions can be methods on a [\`modal.Cls\`](https://modal.com/docs/guide/lifecycle-functions#container-lifecycle-functions-and-parameters),
which allows you to manage the container's lifecycle independently from processing individual requests.

This example will only set the \`start_time\` instance variable once, on container startup.

\`\`\`python
@app.cls()
class WebApp:
    @modal.enter()
    def startup(self):
        from datetime import datetime, timezone

        print("🏁 Starting up!")
        self.start_time = datetime.now(timezone.utc)

    @modal.fastapi_endpoint(docs=True)
    def web(self):
        from datetime import datetime, timezone

        current_time = datetime.now(timezone.utc)
        return {"start_time": self.start_time, "current_time": current_time}


\`\`\`

## Protect Web Functions with proxy authentication

Sharing your Python functions on the web is great, but it's not always a good idea
to make those functions available to just anyone.

For example, you might have a function like the one below that
is more expensive to run than to call (and so might be abused by your enemies)
or reveals information that you would rather keep secret.

To protect your Modal Web Functions so that they can't be triggered except
by members of your [Modal workspace](https://modal.com/docs/guide/workspaces),
add the \`requires_proxy_auth=True\` flag to the \`fastapi_endpoint\` decorator.

\`\`\`python
@app.function(gpu="h100")
@modal.fastapi_endpoint(requires_proxy_auth=True, docs=False)
def expensive_secret():
    return "I didn't care for 'The Godfather'. It insists upon itself."


\`\`\`

The \`expensive-secret\` endpoint URL will still be printed to the output when you \`modal serve\` or \`modal deploy\`,
along with a "🔑" emoji indicating that it is secured with proxy authentication.
If you head to that URL via the browser, you will get a
[\`401 Unauthorized\`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) error code in response.
You should also check the dashboard page for this app (at the URL printed at the very top of the \`modal\` command output)
so you can see that no containers were spun up to handle the request -- this authorization is handled entirely inside Modal's infrastructure.

You can trigger the Web Function by [creating a Proxy Auth Token](https://modal.com/settings/proxy-auth-tokens)
and then including the token ID and secret in the \`Modal-Key\` and \`Modal-Secret\` headers.

From the command line, that might look like

\`\`\`shell
export TOKEN_ID=wk-1234abcd
export TOKEN_SECRET=ws-1234abcd
curl -H "Modal-Key: $TOKEN_ID" \\
     -H "Modal-Secret: $TOKEN_SECRET" \\
     https://your-workspace-name--expensive-secret.modal.run
\`\`\`

For more details, see the
[guide to proxy authentication](https://modal.com/docs/guide/webhook-proxy-auth).

## What next?

Modal's \`fastapi_endpoint\` decorator is opinionated and designed for relatively simple web applications --
one or a few independent Python functions that you want to expose to the web.

Three additional decorators allow you to serve more complex web applications with greater control:
- [\`asgi_app\`](https://modal.com/docs/guide/webhooks#asgi) to serve applications compliant with the ASGI standard,
like [FastAPI](https://fastapi.tiangolo.com/)
- [\`wsgi_app\`](https://modal.com/docs/guide/webhooks#wsgi) to serve applications compliant with the WSGI standard,
like [Flask](https://flask.palletsprojects.com/)
- [\`web_server\`](https://modal.com/docs/guide/webhooks#non-asgi-web-servers) to serve any application that listens on a port
`,meta:{title:`Hello world wide web!`,description:`Modal makes it easy to turn your Python functions into serverless web services: access them via a browser or call them from any client that speaks HTTP, all without having to worry about setting up servers or managing infrastructure.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`<code>modal.fastapi_endpoint</code>`),ie=t(`Handle expensive startup with <code>modal.Cls</code>`,1),ae=t(`<code>modal.Cls</code>`),oe=t(`<code>401 Unauthorized</code>`),se=t(`<code>asgi_app</code>`),ce=t(`<code>wsgi_app</code>`),le=t(`<code>web_server</code>`),ue=t(`<!> <p>Modal makes it easy to turn your Python functions into serverless web services:
access them via a browser or call them from any client that speaks HTTP, all
without having to worry about setting up servers or managing infrastructure.</p> <p>This tutorial shows the path with the shortest <!>: <!>.</p> <p>On Modal, Web Functions have all the superpowers of Modal Functions:
they can be <!>,
they can access <!> or <!>,
and they <!> to handle more traffic.</p> <p>Under the hood, we use the <!>,
which has <!>,
linked throughout this tutorial.</p> <!> <p>Modal Functions are already accessible remotely — when you add the <code>@app.function</code> decorator to a Python function
and run <code>modal deploy</code>, you make it possible for your <!>.</p> <p>That’s great, but it’s not much help if you want to share what you’ve written with someone running code in a different language —
or not running code at all!</p> <p>And that’s where most of the power of the Internet comes from: sharing information and functionality across different computer systems.</p> <p>So we provide the <code>fastapi_endpoint</code> decorator to wrap your Modal Functions in the lingua franca of the web: HTTP.
Here’s what that looks like:</p> <!> <p>You can expose this Web Function to the internet by running <code>modal serve basic_web.py</code>.
In the output, you should see a URL that ends with <code>hello-dev.modal.run</code>.
If you navigate to this URL, you should see the <code>"Hello world!"</code> message appear in your browser.</p> <p>You can also find interactive documentation, powered by OpenAPI and Swagger,
if you add <code>/docs</code> to the end of the URL.
From this documentation, you can interact with your endpoint, sending HTTP requests and receiving HTTP responses.
For more details, see the <!>.</p> <p>By running the App with <code>modal serve</code>, you created a temporary endpoint that will disappear if you interrupt your terminal.
These temporary endpoints are great for debugging — when you save a change to any of your dependent files, the endpoint will redeploy.
Try changing the message to something else, hitting save, and then hitting refresh in your browser or re-sending
the request from <code>/docs</code> or the command line. You should see the new message, along with logs in your terminal showing the redeploy and the request.</p> <p>When you’re ready to deploy the Web Function persistently, run <code>modal deploy basic_web.py</code>.
Now, your Function will be available even when you’ve closed your terminal or turned off your computer.</p> <!> <p>The function above was a bit silly: it always returns the same message.</p> <p>Most functions need an input to be useful. There are two ways to send data to a Web Function:</p> <ul><li>in the URL as a <!></li> <li>in the <!> as JSON</li></ul> <!> <p>By default, your function’s arguments are treated as query parameters:
they are extracted from the end of the URL, where they should be added in the form <code>?arg1=foo&arg2=bar</code>.</p> <p>From the Python side, there’s hardly anything to do:</p> <!> <p>If you are already running <code>modal serve basic_web.py</code>, this Function will be available at a URL, printed in your terminal, that ends with <code>greet-dev.modal.run</code>.</p> <p>We provide Python type-hints to get type information in the docs and <!>.
For example, if you navigate directly to the URL for <code>greet</code>, you will get a detailed error message
indicating that the <code>user</code> parameter is missing. Navigate instead to <code>/docs</code> to see how to structure the request.</p> <p>You can read more about query parameters in the <!>.</p> <!> <p>For larger and more complex data, it is generally preferable to send data in the body of the HTTP request.
This body is formatted as <!>,
the most common data interchange format on the web.</p> <p>To set up a Web Function that accepts JSON data, add an argument with a <code>dict</code> type-hint to your function.
This argument will be populated with the data sent in the request body.</p> <!> <p>Note that we gave a value of <code>"POST"</code> for the <code>method</code> argument here.
This argument defines the HTTP request method that the function will respond to,
and it defaults to <code>"GET"</code>.
If you head to the URL for the <code>goodbye</code> function in your browser,
you will get a 405 Method Not Allowed error, because browsers only send GET requests by default.
While this is technically a separate concern from query parameters versus request bodies
and you can define a function that accepts GET requests and uses data from the body,
it is <!>.</p> <p>Navigate to <code>/docs</code> for more on how to call the function.
You will need to send a POST request with a JSON body containing a <code>name</code> key.
To get the same typing and validation benefits as with query parameters,
use a <!> for this argument.</p> <p>You can read more about request bodies in the <!>.</p> <!> <p>Sometimes your function needs to do something before it can handle its first request,
like get a value from a database or set the value of a variable.
If that step is expensive, like <!>,
it’d be a shame to have to do it every time a request comes in!</p> <p>Web Functions can be methods on a <!>,
which allows you to manage the container’s lifecycle independently from processing individual requests.</p> <p>This example will only set the <code>start_time</code> instance variable once, on container startup.</p> <!> <!> <p>Sharing your Python functions on the web is great, but it’s not always a good idea
to make those functions available to just anyone.</p> <p>For example, you might have a function like the one below that
is more expensive to run than to call (and so might be abused by your enemies)
or reveals information that you would rather keep secret.</p> <p>To protect your Modal Web Functions so that they can’t be triggered except
by members of your <!>,
add the <code>requires_proxy_auth=True</code> flag to the <code>fastapi_endpoint</code> decorator.</p> <!> <p>The <code>expensive-secret</code> endpoint URL will still be printed to the output when you <code>modal serve</code> or <code>modal deploy</code>,
along with a ”🔑” emoji indicating that it is secured with proxy authentication.
If you head to that URL via the browser, you will get a <!> error code in response.
You should also check the dashboard page for this app (at the URL printed at the very top of the <code>modal</code> command output)
so you can see that no containers were spun up to handle the request — this authorization is handled entirely inside Modal’s infrastructure.</p> <p>You can trigger the Web Function by <!> and then including the token ID and secret in the <code>Modal-Key</code> and <code>Modal-Secret</code> headers.</p> <p>From the command line, that might look like</p> <!> <p>For more details, see the <!>.</p> <!> <p>Modal’s <code>fastapi_endpoint</code> decorator is opinionated and designed for relatively simple web applications —
one or a few independent Python functions that you want to expose to the web.</p> <p>Three additional decorators allow you to serve more complex web applications with greater control:</p> <ul><li><!> to serve applications compliant with the ASGI standard,
like <!></li> <li><!> to serve applications compliant with the WSGI standard,
like <!></li> <li><!> to serve any application that listens on a port</li></ul>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ue(),d=te(a);ne(d,{id:`hello-world-wide-web`,children:(e,t)=>{s(),i(e,r(`Hello world wide web!`))},$$slots:{default:!0}});var p=o(d,4),m=o(e(p));f(m,{href:`https://shkspr.mobi/blog/2021/05/whats-your-apis-time-to-200/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“time to 200”`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://modal.com/docs/reference/modal.fastapi_endpoint`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(p);var h=o(p,2),g=o(e(h));f(g,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`accelerated with GPUs`))},$$slots:{default:!0}});var _=o(g,2);f(_,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Secrets`))},$$slots:{default:!0}});var v=o(_,2);f(v,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),f(o(v,2),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`automatically scale`))},$$slots:{default:!0}}),s(),n(h);var y=o(h,2),b=o(e(y));f(b,{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI library`))},$$slots:{default:!0}}),f(o(b,2),{href:`https://fastapi.tiangolo.com/tutorial/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`high-quality documentation`))},$$slots:{default:!0}}),s(),n(y);var x=o(y,2);c(x,{id:`turn-a-modal-function-into-an-api-endpoint-with-a-single-decorator`,children:(e,t)=>{s(),i(e,r(`Turn a Modal Function into an API endpoint with a single decorator`))},$$slots:{default:!0}});var S=o(x,2);f(o(e(S),5),{href:`https://modal.com/docs/guide/trigger-deployed-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`other Python functions to call it`))},$$slots:{default:!0}}),s(),n(S);var de=o(S,8);u(de,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(name%3D%22example-basic-web%22%2C%20image%3Dimage)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(%0A%20%20%20%20docs%3DTrue%20%20%23%20adds%20interactive%20documentation%20in%20the%20browser%0A)%0Adef%20hello()%3A%0A%20%20%20%20return%20%22Hello%20world!%22%0A%0A`,lang:`python`});var C=o(de,4);f(o(e(C),3),{href:`https://fastapi.tiangolo.com/features/#automatic-docs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI documentation`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,6);c(w,{id:`send-data-to-a-web-function`,children:(e,t)=>{s(),i(e,r(`Send data to a Web Function`))},$$slots:{default:!0}});var T=o(w,6),E=e(T);f(o(e(E)),{href:`#sending-data-in-query-parameters`,children:(e,t)=>{s(),i(e,r(`query parameter`))},$$slots:{default:!0}}),n(E);var D=o(E,2);f(o(e(D)),{href:`#sending-data-in-the-request-body`,children:(e,t)=>{s(),i(e,r(`body of the request`))},$$slots:{default:!0}}),s(),n(D),n(T);var O=o(T,2);l(O,{id:`sending-data-in-query-parameters`,children:(e,t)=>{s(),i(e,r(`Sending data in query parameters`))},$$slots:{default:!0}});var k=o(O,6);u(k,{code:`%40app.function()%0A%40modal.fastapi_endpoint(docs%3DTrue)%0Adef%20greet(user%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20return%20f%22Hello%20%7Buser%7D!%22%0A%0A`,lang:`python`});var A=o(k,4);f(o(e(A)),{href:`https://fastapi.tiangolo.com/tutorial/query-params-str-validations/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`automatic validation`))},$$slots:{default:!0}}),s(7),n(A);var j=o(A,2);f(o(e(j)),{href:`https://fastapi.tiangolo.com/tutorial/query-params/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI documentation`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,2);l(M,{id:`sending-data-in-the-request-body`,children:(e,t)=>{s(),i(e,r(`Sending data in the request body`))},$$slots:{default:!0}});var N=o(M,2);f(o(e(N)),{href:`https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`JSON`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,4);u(P,{code:`%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22POST%22%2C%20docs%3DTrue)%0Adef%20goodbye(data%3A%20dict)%20-%3E%20str%3A%0A%20%20%20%20name%20%3D%20data.get(%22name%22)%20or%20%22world%22%0A%20%20%20%20return%20f%22Goodbye%20%7Bname%7D!%22%0A%0A`,lang:`python`});var F=o(P,2);f(o(e(F),9),{href:`https://stackoverflow.com/a/983458`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`considered bad form`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,2);f(o(e(I),5),{href:`https://fastapi.tiangolo.com/tutorial/body/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Pydantic model`))},$$slots:{default:!0}}),s(),n(I);var L=o(I,2);f(o(e(L)),{href:`https://fastapi.tiangolo.com/tutorial/body/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI documentation`))},$$slots:{default:!0}}),s(),n(L);var R=o(L,2);c(R,{id:`handle-expensive-startup-with-modalcls`,children:(e,t)=>{s();var n=ie();s(),i(e,n)},$$slots:{default:!0}});var z=o(R,2);f(o(e(z)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`loading a large ML model`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,2);f(o(e(B)),{href:`https://modal.com/docs/guide/lifecycle-functions#container-lifecycle-functions-and-parameters`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(B);var V=o(B,4);u(V,{code:`%40app.cls()%0Aclass%20WebApp%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20from%20datetime%20import%20datetime%2C%20timezone%0A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8F%81%20Starting%20up!%22)%0A%20%20%20%20%20%20%20%20self.start_time%20%3D%20datetime.now(timezone.utc)%0A%0A%20%20%20%20%40modal.fastapi_endpoint(docs%3DTrue)%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20from%20datetime%20import%20datetime%2C%20timezone%0A%0A%20%20%20%20%20%20%20%20current_time%20%3D%20datetime.now(timezone.utc)%0A%20%20%20%20%20%20%20%20return%20%7B%22start_time%22%3A%20self.start_time%2C%20%22current_time%22%3A%20current_time%7D%0A%0A`,lang:`python`});var H=o(V,2);c(H,{id:`protect-web-functions-with-proxy-authentication`,children:(e,t)=>{s(),i(e,r(`Protect Web Functions with proxy authentication`))},$$slots:{default:!0}});var U=o(H,6);f(o(e(U)),{href:`https://modal.com/docs/guide/workspaces`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal workspace`))},$$slots:{default:!0}}),s(5),n(U);var W=o(U,2);u(W,{code:`%40app.function(gpu%3D%22h100%22)%0A%40modal.fastapi_endpoint(requires_proxy_auth%3DTrue%2C%20docs%3DFalse)%0Adef%20expensive_secret()%3A%0A%20%20%20%20return%20%22I%20didn't%20care%20for%20'The%20Godfather'.%20It%20insists%20upon%20itself.%22%0A%0A`,lang:`python`});var G=o(W,2);f(o(e(G),7),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(3),n(G);var K=o(G,2);f(o(e(K)),{href:`https://modal.com/settings/proxy-auth-tokens`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`creating a Proxy Auth Token`))},$$slots:{default:!0}}),s(5),n(K);var q=o(K,4);u(q,{code:`export%20TOKEN_ID%3Dwk-1234abcd%0Aexport%20TOKEN_SECRET%3Dws-1234abcd%0Acurl%20-H%20%22Modal-Key%3A%20%24TOKEN_ID%22%20%5C%0A%20%20%20%20%20-H%20%22Modal-Secret%3A%20%24TOKEN_SECRET%22%20%5C%0A%20%20%20%20%20https%3A%2F%2Fyour-workspace-name--expensive-secret.modal.run`,lang:`shell`});var J=o(q,2);f(o(e(J)),{href:`https://modal.com/docs/guide/webhook-proxy-auth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`guide to proxy authentication`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,2);c(Y,{id:`what-next`,children:(e,t)=>{s(),i(e,r(`What next?`))},$$slots:{default:!0}});var X=o(Y,6),Z=e(X),Q=e(Z);f(Q,{href:`https://modal.com/docs/guide/webhooks#asgi`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),f(o(Q,2),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),n(Z);var $=o(Z,2),fe=e($);f(fe,{href:`https://modal.com/docs/guide/webhooks#wsgi`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),f(o(fe,2),{href:`https://flask.palletsprojects.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Flask`))},$$slots:{default:!0}}),n($);var pe=o($,2);f(e(pe),{href:`https://modal.com/docs/guide/webhooks#non-asgi-web-servers`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(),n(pe),n(X),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=B5hvYJZH.js.map
