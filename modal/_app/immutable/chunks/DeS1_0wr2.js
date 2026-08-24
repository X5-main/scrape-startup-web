(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7bff5550-cd82-4f43-8854-564370681558`,e._sentryDebugIdIdentifier=`sentry-dbid-7bff5550-cd82-4f43-8854-564370681558`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Deploy HTTP Servers with ultra low latency on Modal`,id:`deploy-http-servers-with-ultra-low-latency-on-modal`,children:[{depth:2,value:`How to define a Modal Server`,id:`how-to-define-a-modal-server`},{depth:2,value:`How to write a client and tests for a Modal Server`,id:`how-to-write-a-client-and-tests-for-a-modal-server`}]}],rawContent:`# Deploy HTTP Servers with ultra low latency on Modal

Modal offers a primitive for edge-deployed, low latency web services:
the [Modal Server](https://modal.com/docs/guide/servers).

Modal Servers are designed for applications with very demanding
latency requirements, where a few tens of milliseconds of round-trip latency is unacceptable,
like [low latency LLM inference](https://modal.com/docs/guide/high-performance-llm-inference).
That ends up meaning users and clients are required to do more work.
For Modal's higher-level primitives for web serving, see
[this guide](https://modal.com/docs/guide/webhooks).

This example documents a minimal Modal Server and client.

## How to define a Modal Server

\`\`\`python
from pathlib import Path

import modal

\`\`\`

To make a Modal Server, define a Python class
with a [\`modal.enter\`-decorated](https://modal.com/docs/guide/lifecycle-functions) method
that creates a subtask (thread or process) that listens for HTTP requests on some port.

Then wrap that class in the \`@app.server\` decorator,
passing in the \`port\` your server task is listening on
and a \`routing_region\` to specify where Modal should proxy your requests through.
This proxy will communicate directly with the containers running your server.

To reduce end-to-end latency, include a compute Region
that matches the routing Region and containers will be deployed into that Region.
Note that region-pinning has cost and resource availability implications!
See [the guide](https://modal.com/docs/guide/region-selection)
for details.

You can also pass the rest of your resource definitions,
like [distributed Volume storage](https://modal.com/docs/guide/volumes),
[CPU/memory resources](https://modal.com/docs/guide/resources),
and [GPU type and count](https://modal.com/docs/guide/gpu),
to \`@app.server\`.

Altogether, the minimal version of a Modal Server looks something like:

\`\`\`python
PORT = 8000
COMPUTE_REGION = "us"
ROUTING_REGION = "us-east"

app = modal.App("example-server")


@app.server(
    compute_region=COMPUTE_REGION,
    routing_region=ROUTING_REGION,
    port=PORT,
    unauthenticated=True,
)
class FileServer:
    @modal.enter()
    def start(self):
        import subprocess

        subprocess.Popen(["python", "-m", "http.server", f"{PORT}"])


\`\`\`

## How to write a client and tests for a Modal Server

We test the file server defined above by requesting file from it.
This one will do nicely.

We put the test in a \`local_entrypoint\` so that we can execute it from the command line:

\`\`\`bash
modal run server.py
\`\`\`

\`\`\`python
@app.local_entrypoint()
def ping():
    from urllib.error import HTTPError
    from urllib.request import urlopen

    url = FileServer.get_url()

    this = Path(__file__).name

    print(f"requesting {this} from Modal Server at {url}")

    while True:
        try:
            print(urlopen(url + f"/{this}").read().decode("utf-8"))
            break
        except HTTPError as e:
            if e.code == 503:
                import time

                time.sleep(1)
                continue
            else:
                raise e


\`\`\`

Notice the retry loop! Modal Clses and Functions are serverless and scale to zero by default.
When a Modal Server has scaled to zero, clients will get a
[503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
error response from Modal. Those requests still trigger scale up, and once a container is ready,
the 503s will stop and clients will receive the server's responses.

Modal Servers also support "sticky routing" for improved cache locality within client sessions.
For details, see [this example](https://modal.com/docs/examples/server_sticky).
`,meta:{title:`Deploy HTTP Servers with ultra low latency on Modal`,description:`Modal offers a primitive for edge-deployed, low latency web services: the Modal Server.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>modal.enter</code>-decorated`,1),b=t(`<!> <p>Modal offers a primitive for edge-deployed, low latency web services:
the <!>.</p> <p>Modal Servers are designed for applications with very demanding
latency requirements, where a few tens of milliseconds of round-trip latency is unacceptable,
like <!>.
That ends up meaning users and clients are required to do more work.
For Modal’s higher-level primitives for web serving, see <!>.</p> <p>This example documents a minimal Modal Server and client.</p> <!> <!> <p>To make a Modal Server, define a Python class
with a <!> method
that creates a subtask (thread or process) that listens for HTTP requests on some port.</p> <p>Then wrap that class in the <code>@app.server</code> decorator,
passing in the <code>port</code> your server task is listening on
and a <code>routing_region</code> to specify where Modal should proxy your requests through.
This proxy will communicate directly with the containers running your server.</p> <p>To reduce end-to-end latency, include a compute Region
that matches the routing Region and containers will be deployed into that Region.
Note that region-pinning has cost and resource availability implications!
See <!> for details.</p> <p>You can also pass the rest of your resource definitions,
like <!>, <!>,
and <!>,
to <code>@app.server</code>.</p> <p>Altogether, the minimal version of a Modal Server looks something like:</p> <!> <!> <p>We test the file server defined above by requesting file from it.
This one will do nicely.</p> <p>We put the test in a <code>local_entrypoint</code> so that we can execute it from the command line:</p> <!> <!> <p>Notice the retry loop! Modal Clses and Functions are serverless and scale to zero by default.
When a Modal Server has scaled to zero, clients will get a <!> error response from Modal. Those requests still trigger scale up, and once a container is ready,
the 503s will stop and clients will receive the server’s responses.</p> <p>Modal Servers also support “sticky routing” for improved cache locality within client sessions.
For details, see <!>.</p>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`deploy-http-servers-with-ultra-low-latency-on-modal`,children:(e,t)=>{l(),i(e,r(`Deploy HTTP Servers with ultra low latency on Modal`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Server`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2),_=c(e(g));m(_,{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`low latency LLM inference`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,4);u(v,{id:`how-to-define-a-modal-server`,children:(e,t)=>{l(),i(e,r(`How to define a Modal Server`))},$$slots:{default:!0}});var x=c(v,2);f(x,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var S=c(x,2);m(c(e(S)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{var n=y();l(),i(e,n)},$$slots:{default:!0}}),l(),n(S);var C=c(S,4);m(c(e(C)),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the guide`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2),T=c(e(w));m(T,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`distributed Volume storage`))},$$slots:{default:!0}});var E=c(T,2);m(E,{href:`https://modal.com/docs/guide/resources`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CPU/memory resources`))},$$slots:{default:!0}}),m(c(E,2),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU type and count`))},$$slots:{default:!0}}),l(3),n(w);var D=c(w,4);f(D,{code:`PORT%20%3D%208000%0ACOMPUTE_REGION%20%3D%20%22us%22%0AROUTING_REGION%20%3D%20%22us-east%22%0A%0Aapp%20%3D%20modal.App(%22example-server%22)%0A%0A%0A%40app.server(%0A%20%20%20%20compute_region%3DCOMPUTE_REGION%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20port%3DPORT%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20FileServer%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20import%20subprocess%0A%0A%20%20%20%20%20%20%20%20subprocess.Popen(%5B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20f%22%7BPORT%7D%22%5D)%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`how-to-write-a-client-and-tests-for-a-modal-server`,children:(e,t)=>{l(),i(e,r(`How to write a client and tests for a Modal Server`))},$$slots:{default:!0}});var k=c(O,6);f(k,{code:`modal%20run%20server.py`,lang:`bash`});var A=c(k,2);f(A,{code:`%40app.local_entrypoint()%0Adef%20ping()%3A%0A%20%20%20%20from%20urllib.error%20import%20HTTPError%0A%20%20%20%20from%20urllib.request%20import%20urlopen%0A%0A%20%20%20%20url%20%3D%20FileServer.get_url()%0A%0A%20%20%20%20this%20%3D%20Path(__file__).name%0A%0A%20%20%20%20print(f%22requesting%20%7Bthis%7D%20from%20Modal%20Server%20at%20%7Burl%7D%22)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(urlopen(url%20%2B%20f%22%2F%7Bthis%7D%22).read().decode(%22utf-8%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20except%20HTTPError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20e.code%20%3D%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20import%20time%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%0A`,lang:`python`});var j=c(A,2);m(c(e(j)),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`503 Service Unavailable`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);m(c(e(M)),{href:`https://modal.com/docs/examples/server_sticky`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(M),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=DeS1_0wr2.js.map
