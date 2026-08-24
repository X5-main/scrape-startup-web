(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`aadcdef5-4b22-4dd5-9729-cf3989dd3d8c`,e._sentryDebugIdIdentifier=`sentry-dbid-aadcdef5-4b22-4dd5-9729-cf3989dd3d8c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Sticky routing for Modal Servers`,id:`sticky-routing-for-modal-servers`,children:[{depth:2,value:`Define the Modal Server`,id:`define-the-modal-server`},{depth:2,value:`Test the routing behavior of the Modal Server`,id:`test-the-routing-behavior-of-the-modal-server`},{depth:2,value:`Write the client for the Modal Server`,id:`write-the-client-for-the-modal-server`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Sticky routing for Modal Servers

This example demonstrates the usage and behavior of
the optional "sticky" routing behavior of
[Modal Servers](https://modal.com/docs/guide/servers) with a basic routing test.

For a gentler introduction to Modal Servers,
see [this example](https://modal.com/docs/examples/server).
For the use of Modal HTTP Servers for LLM inference,
see [this example](https://modal.com/docs/examples/sglang_low_latency).

In sticky routing, sequential requests from the same client
are sent to the same server replica.
Modal Servers offer sticky routing for fixed replica sets
using [rendezvous hashing](https://randorithms.com/2020/12/26/rendezvous-hashing.html),
ensuring that as your servers scale up and down, load stays balanced across replicas
and clients are typically routed to the same replica for repeated requests.

Note that requests are not _guaranteed_ to be routed to the same replica,
and so this form of sticky routing should not be relied on for logical correctness.
Instead, this sticky routing is intended to be used as a performance optimization,
as in KV cacheing for [Transformer LLM inference](https://modal.com/docs/examples/sglang_low_latency).

## Define the Modal Server

First, we import the libraries we'll use both locally, to run a routing test,
and remotely, to run our server.

We also define our Modal [App](https://modal.com/docs/guide/apps)
and the Modal [Image](https://modal.com/docs/guide/images)
that provides the dependencies of our server code.

\`\`\`python
import asyncio
import time
from dataclasses import dataclass
from typing import Any

import aiohttp
import modal
from rich.console import Console

app = modal.App("example-http-server-sticky")

image = modal.Image.debian_slim().uv_pip_install("fastapi[standard]==0.115.4")

\`\`\`

Now we can define our Server.
We set the minimum number of containers (replicas)
to be greater than one so that there are multiple
replicas available for routing during our test.

Additionally, we set the routing Region into which we
want to deploy the proxies that communicate between
our clients and the server.

We also use \`target_concurrency\` to set the autoscaling policy:
it's the number of concurrent requests we want each replica to handle
before Modal scales the server up by adding another replica.
You can also set this value to \`0\` to disable autoscaling and keep a fixed number of replicas.

Modal Servers have [lifecycles](https://modal.com/docs/guide/lifecycle-functions)
which are defined by the \`modal.enter\` and \`modal.exit\` decorators.
The \`modal.enter\`-decorated method method starts a process or thread that listens on the provided \`port\`.
Here, we spin up a simple FastAPI server that returns the
[identity of the replica within Modal](https://modal.com/docs/guide/environment_variables)
and run it with \`uvicorn\`.

\`\`\`python
PORT = 8000
CONTAINERS = 2
ROUTING_REGION = "us-west"


@app.server(
    image=image,
    min_containers=CONTAINERS,
    port=PORT,
    routing_region=ROUTING_REGION,
    target_concurrency=100,
    unauthenticated=True,
)
class Server:
    @modal.enter()
    def start(self):
        import os
        import threading

        import uvicorn
        from fastapi import FastAPI

        container_id = os.environ["MODAL_TASK_ID"]
        fastapi_app = FastAPI(title=container_id)

        @fastapi_app.post("/")
        async def whoami():
            return {"CONTAINER_ID": container_id}

        self.thread = threading.Thread(
            target=uvicorn.run,
            kwargs={"app": fastapi_app, "host": "0.0.0.0", "port": PORT},
            daemon=True,
        )
        self.thread.start()


\`\`\`

## Test the routing behavior of the Modal Server

Now we define our routing test, which will run locally
and interact with our Modal Server by sending requests.

It spins up some \`n\`umber of \`client\` tasks and repeatedly sends requests from each for some number of \`seconds\`.
The clients can be configured to use \`sticky\` routing or not (\`--no-sticky\`).

The test uses the \`CONTAINER_ID\`s returned by the Server
to track whether clients' requests are serviced by the same or different replicas.
It fails if the clients were configured to be sticky and any client
observes a different \`CONTAINER_ID\` on different requests.
So long as the set of containers does not change,
due to, for instance, replica failure or pre-emption,
this test should pass.

\`\`\`python
@app.local_entrypoint()
async def test(n_clients: int = 4, sticky: bool = True, seconds: float = 10.0):
    # wait for at least one replica to spin up
    url = await Server.get_url.aio()
    async with aiohttp.ClientSession() as sess:
        await wait_available(sess, url)

    # allow generous time for all replicas to spin up based on rough heuristic;
    # remove this sleep and increase CONTAINERS
    # to observe session routing changes during autoscaling
    await asyncio.sleep(10 + max((CONTAINERS - 10) // 2, 0))

    # run the test
    results = await run_clients(url, n_clients, seconds, sticky)
    stats = aggregate_results(results)

    # give time for server logs to flush,
    await asyncio.sleep(1)
    # then display results
    print_summary(url, sticky, n_clients, seconds, stats)

    if sticky and stats["multi"]:
        raise AssertionError("Sticky routing violated for some clients")


\`\`\`

Because it is a Modal \`local_entrypoint\`,
this Python function automatically gets a CLI:

\`\`\`bash
modal run server_sticky.py --help
\`\`\`

You can run the test with:

\`\`\`bash
modal run server_sticky.py
\`\`\`

## Write the client for the Modal Server

The code in this section implements some Modal Server-specific client logic.

First, clients of Modal Servers need to handle
[503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)
error response status codes, which are returned whenever there are no live replicas.

In our case, we use them as a signal that at least one replica
is ready and so we can proceed with the test.

\`\`\`python
async def wait_available(sess: aiohttp.ClientSession, url: str) -> None:
    while True:
        async with sess.post(url, json={}) as resp:
            if resp.status != 503:
                return


\`\`\`

The full client logic appears in the function below.
Notably, it includes the header \`Modal-Session-Id\`
if clients are configured for sticky routing.
Here, we choose a simple small integer \`client_id\`.

The client collects information about which \`CONTAINER_ID\`s
it receives from the server and returns those in the form of
a simple \`dataclass\`.

\`\`\`python
@dataclass
class ClientResult:
    client_id: int
    containers_seen: set[str]
    requests_ok: int
    requests_err: int


async def client(
    url: str, client_id: int, seconds: float, sticky: bool
) -> ClientResult:
    headers = {"Modal-Session-Id": str(client_id)} if sticky else {}
    end = time.monotonic() + seconds

    seen: set[str] = set()
    n_ok: int = 0
    n_err: int = 0

    async with aiohttp.ClientSession(headers=headers) as sess:
        while time.monotonic() < end:
            try:
                async with sess.post(
                    url, json={}, timeout=aiohttp.ClientTimeout(total=5)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        seen.add(data["CONTAINER_ID"])
                        n_ok += 1
                    else:
                        n_err += 1
            except asyncio.TimeoutError:
                n_err += 1

    return ClientResult(client_id, seen, n_ok, n_err)


\`\`\`

## Addenda

The remainder of this code is required for this example to run
but is not necessary for Modal Servers or their clients in general.
For instance, it defines the logic for concurrency and result aggregation/display
for this particular routing test.

\`\`\`python
async def run_clients(
    url: str, n_clients: int, seconds: float, sticky: bool
) -> list[ClientResult]:
    tasks = [client(url, c, seconds, sticky) for c in range(n_clients)]
    return list(await asyncio.gather(*tasks))


def aggregate_results(results: list[ClientResult]) -> dict[str, Any]:
    total_ok = sum(r.requests_ok for r in results)
    total_err = sum(r.requests_err for r in results)
    multi = {
        r.client_id: r.containers_seen for r in results if len(r.containers_seen) > 1
    }

    per_client = [(r.client_id, r.containers_seen) for r in results]

    return {
        "total_ok": total_ok,
        "total_err": total_err,
        "multi": multi,
        "per_client": per_client,
    }


def print_summary(
    url: str,
    sticky: bool,
    n_clients: int,
    seconds: float,
    stats: dict[str, Any],
    console: Console | None = None,
) -> None:
    if not console:
        console = Console()
    console.print()
    console.print(
        f"[bold]url=[/]{url} [bold]sticky=[/]{sticky} [bold]clients=[/]{n_clients} [bold]duration_s=[/]{seconds}"
    )
    console.print(
        f"[green]total_ok={stats['total_ok']}[/] [red]total_err={stats['total_err']}[/]"
    )

    for c, seen in stats["per_client"]:
        console.print(f"  client={c} containers={list(seen)}")
    console.print(
        f"Clients with multiple containers: [yellow]{len(stats['multi'])}/{n_clients}[/]"
    )

\`\`\`
`,meta:{title:`Sticky routing for Modal Servers`,description:`This example demonstrates the usage and behavior of the optional “sticky” routing behavior of Modal Servers with a basic routing test.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates the usage and behavior of
the optional “sticky” routing behavior of <!> with a basic routing test.</p> <p>For a gentler introduction to Modal Servers,
see <!>.
For the use of Modal HTTP Servers for LLM inference,
see <!>.</p> <p>In sticky routing, sequential requests from the same client
are sent to the same server replica.
Modal Servers offer sticky routing for fixed replica sets
using <!>,
ensuring that as your servers scale up and down, load stays balanced across replicas
and clients are typically routed to the same replica for repeated requests.</p> <p>Note that requests are not <em>guaranteed</em> to be routed to the same replica,
and so this form of sticky routing should not be relied on for logical correctness.
Instead, this sticky routing is intended to be used as a performance optimization,
as in KV cacheing for <!>.</p> <!> <p>First, we import the libraries we’ll use both locally, to run a routing test,
and remotely, to run our server.</p> <p>We also define our Modal <!> and the Modal <!> that provides the dependencies of our server code.</p> <!> <p>Now we can define our Server.
We set the minimum number of containers (replicas)
to be greater than one so that there are multiple
replicas available for routing during our test.</p> <p>Additionally, we set the routing Region into which we
want to deploy the proxies that communicate between
our clients and the server.</p> <p>We also use <code>target_concurrency</code> to set the autoscaling policy:
it’s the number of concurrent requests we want each replica to handle
before Modal scales the server up by adding another replica.
You can also set this value to <code>0</code> to disable autoscaling and keep a fixed number of replicas.</p> <p>Modal Servers have <!> which are defined by the <code>modal.enter</code> and <code>modal.exit</code> decorators.
The <code>modal.enter</code>-decorated method method starts a process or thread that listens on the provided <code>port</code>.
Here, we spin up a simple FastAPI server that returns the <!> and run it with <code>uvicorn</code>.</p> <!> <!> <p>Now we define our routing test, which will run locally
and interact with our Modal Server by sending requests.</p> <p>It spins up some <code>n</code>umber of <code>client</code> tasks and repeatedly sends requests from each for some number of <code>seconds</code>.
The clients can be configured to use <code>sticky</code> routing or not (<code>--no-sticky</code>).</p> <p>The test uses the <code>CONTAINER_ID</code>s returned by the Server
to track whether clients’ requests are serviced by the same or different replicas.
It fails if the clients were configured to be sticky and any client
observes a different <code>CONTAINER_ID</code> on different requests.
So long as the set of containers does not change,
due to, for instance, replica failure or pre-emption,
this test should pass.</p> <!> <p>Because it is a Modal <code>local_entrypoint</code>,
this Python function automatically gets a CLI:</p> <!> <p>You can run the test with:</p> <!> <!> <p>The code in this section implements some Modal Server-specific client logic.</p> <p>First, clients of Modal Servers need to handle <!> error response status codes, which are returned whenever there are no live replicas.</p> <p>In our case, we use them as a signal that at least one replica
is ready and so we can proceed with the test.</p> <!> <p>The full client logic appears in the function below.
Notably, it includes the header <code>Modal-Session-Id</code> if clients are configured for sticky routing.
Here, we choose a simple small integer <code>client_id</code>.</p> <p>The client collects information about which <code>CONTAINER_ID</code>s
it receives from the server and returns those in the form of
a simple <code>dataclass</code>.</p> <!> <!> <p>The remainder of this code is required for this example to run
but is not necessary for Modal Servers or their clients in general.
For instance, it defines the logic for concurrency and result aggregation/display
for this particular routing test.</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`sticky-routing-for-modal-servers`,children:(e,t)=>{l(),i(e,r(`Sticky routing for Modal Servers`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Servers`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2),_=c(e(g));m(_,{href:`https://modal.com/docs/examples/server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal.com/docs/examples/sglang_low_latency`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);m(c(e(v)),{href:`https://randorithms.com/2020/12/26/rendezvous-hashing.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`rendezvous hashing`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);m(c(e(b),3),{href:`https://modal.com/docs/examples/sglang_low_latency`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Transformer LLM inference`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);u(x,{id:`define-the-modal-server`,children:(e,t)=>{l(),i(e,r(`Define the Modal Server`))},$$slots:{default:!0}});var S=c(x,4),C=c(e(S));m(C,{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),m(c(C,2),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(S);var w=c(S,2);f(w,{code:`import%20asyncio%0Aimport%20time%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20typing%20import%20Any%0A%0Aimport%20aiohttp%0Aimport%20modal%0Afrom%20rich.console%20import%20Console%0A%0Aapp%20%3D%20modal.App(%22example-http-server-sticky%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%3D%3D0.115.4%22)%0A`,lang:`python`});var T=c(w,8),E=c(e(T));m(E,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`lifecycles`))},$$slots:{default:!0}}),m(c(E,10),{href:`https://modal.com/docs/guide/environment_variables`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`identity of the replica within Modal`))},$$slots:{default:!0}}),l(3),n(T);var D=c(T,2);f(D,{code:`PORT%20%3D%208000%0ACONTAINERS%20%3D%202%0AROUTING_REGION%20%3D%20%22us-west%22%0A%0A%0A%40app.server(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20min_containers%3DCONTAINERS%2C%0A%20%20%20%20port%3DPORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20target_concurrency%3D100%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20import%20os%0A%20%20%20%20%20%20%20%20import%20threading%0A%0A%20%20%20%20%20%20%20%20import%20uvicorn%0A%20%20%20%20%20%20%20%20from%20fastapi%20import%20FastAPI%0A%0A%20%20%20%20%20%20%20%20container_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%20%20%20%20%20%20%20%20fastapi_app%20%3D%20FastAPI(title%3Dcontainer_id)%0A%0A%20%20%20%20%20%20%20%20%40fastapi_app.post(%22%2F%22)%0A%20%20%20%20%20%20%20%20async%20def%20whoami()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22CONTAINER_ID%22%3A%20container_id%7D%0A%0A%20%20%20%20%20%20%20%20self.thread%20%3D%20threading.Thread(%0A%20%20%20%20%20%20%20%20%20%20%20%20target%3Duvicorn.run%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20kwargs%3D%7B%22app%22%3A%20fastapi_app%2C%20%22host%22%3A%20%220.0.0.0%22%2C%20%22port%22%3A%20PORT%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20daemon%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.thread.start()%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`test-the-routing-behavior-of-the-modal-server`,children:(e,t)=>{l(),i(e,r(`Test the routing behavior of the Modal Server`))},$$slots:{default:!0}});var k=c(O,8);f(k,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(n_clients%3A%20int%20%3D%204%2C%20sticky%3A%20bool%20%3D%20True%2C%20seconds%3A%20float%20%3D%2010.0)%3A%0A%20%20%20%20%23%20wait%20for%20at%20least%20one%20replica%20to%20spin%20up%0A%20%20%20%20url%20%3D%20await%20Server.get_url.aio()%0A%20%20%20%20async%20with%20aiohttp.ClientSession()%20as%20sess%3A%0A%20%20%20%20%20%20%20%20await%20wait_available(sess%2C%20url)%0A%0A%20%20%20%20%23%20allow%20generous%20time%20for%20all%20replicas%20to%20spin%20up%20based%20on%20rough%20heuristic%3B%0A%20%20%20%20%23%20remove%20this%20sleep%20and%20increase%20CONTAINERS%0A%20%20%20%20%23%20to%20observe%20session%20routing%20changes%20during%20autoscaling%0A%20%20%20%20await%20asyncio.sleep(10%20%2B%20max((CONTAINERS%20-%2010)%20%2F%2F%202%2C%200))%0A%0A%20%20%20%20%23%20run%20the%20test%0A%20%20%20%20results%20%3D%20await%20run_clients(url%2C%20n_clients%2C%20seconds%2C%20sticky)%0A%20%20%20%20stats%20%3D%20aggregate_results(results)%0A%0A%20%20%20%20%23%20give%20time%20for%20server%20logs%20to%20flush%2C%0A%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%23%20then%20display%20results%0A%20%20%20%20print_summary(url%2C%20sticky%2C%20n_clients%2C%20seconds%2C%20stats)%0A%0A%20%20%20%20if%20sticky%20and%20stats%5B%22multi%22%5D%3A%0A%20%20%20%20%20%20%20%20raise%20AssertionError(%22Sticky%20routing%20violated%20for%20some%20clients%22)%0A%0A`,lang:`python`});var A=c(k,4);f(A,{code:`modal%20run%20server_sticky.py%20--help`,lang:`bash`});var j=c(A,4);f(j,{code:`modal%20run%20server_sticky.py`,lang:`bash`});var M=c(j,2);u(M,{id:`write-the-client-for-the-modal-server`,children:(e,t)=>{l(),i(e,r(`Write the client for the Modal Server`))},$$slots:{default:!0}});var N=c(M,4);m(c(e(N)),{href:`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`503 Service Unavailable`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,4);f(P,{code:`async%20def%20wait_available(sess%3A%20aiohttp.ClientSession%2C%20url%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20async%20with%20sess.post(url%2C%20json%3D%7B%7D)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status%20!%3D%20503%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A`,lang:`python`});var F=c(P,6);f(F,{code:`%40dataclass%0Aclass%20ClientResult%3A%0A%20%20%20%20client_id%3A%20int%0A%20%20%20%20containers_seen%3A%20set%5Bstr%5D%0A%20%20%20%20requests_ok%3A%20int%0A%20%20%20%20requests_err%3A%20int%0A%0A%0Aasync%20def%20client(%0A%20%20%20%20url%3A%20str%2C%20client_id%3A%20int%2C%20seconds%3A%20float%2C%20sticky%3A%20bool%0A)%20-%3E%20ClientResult%3A%0A%20%20%20%20headers%20%3D%20%7B%22Modal-Session-Id%22%3A%20str(client_id)%7D%20if%20sticky%20else%20%7B%7D%0A%20%20%20%20end%20%3D%20time.monotonic()%20%2B%20seconds%0A%0A%20%20%20%20seen%3A%20set%5Bstr%5D%20%3D%20set()%0A%20%20%20%20n_ok%3A%20int%20%3D%200%0A%20%20%20%20n_err%3A%20int%20%3D%200%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession(headers%3Dheaders)%20as%20sess%3A%0A%20%20%20%20%20%20%20%20while%20time.monotonic()%20%3C%20end%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20sess.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%2C%20json%3D%7B%7D%2C%20timeout%3Daiohttp.ClientTimeout(total%3D5)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20resp.status%20%3D%3D%20200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20resp.json()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seen.add(data%5B%22CONTAINER_ID%22%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20n_ok%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20n_err%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20n_err%20%2B%3D%201%0A%0A%20%20%20%20return%20ClientResult(client_id%2C%20seen%2C%20n_ok%2C%20n_err)%0A%0A`,lang:`python`});var I=c(F,2);u(I,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),f(c(I,4),{code:`async%20def%20run_clients(%0A%20%20%20%20url%3A%20str%2C%20n_clients%3A%20int%2C%20seconds%3A%20float%2C%20sticky%3A%20bool%0A)%20-%3E%20list%5BClientResult%5D%3A%0A%20%20%20%20tasks%20%3D%20%5Bclient(url%2C%20c%2C%20seconds%2C%20sticky)%20for%20c%20in%20range(n_clients)%5D%0A%20%20%20%20return%20list(await%20asyncio.gather(*tasks))%0A%0A%0Adef%20aggregate_results(results%3A%20list%5BClientResult%5D)%20-%3E%20dict%5Bstr%2C%20Any%5D%3A%0A%20%20%20%20total_ok%20%3D%20sum(r.requests_ok%20for%20r%20in%20results)%0A%20%20%20%20total_err%20%3D%20sum(r.requests_err%20for%20r%20in%20results)%0A%20%20%20%20multi%20%3D%20%7B%0A%20%20%20%20%20%20%20%20r.client_id%3A%20r.containers_seen%20for%20r%20in%20results%20if%20len(r.containers_seen)%20%3E%201%0A%20%20%20%20%7D%0A%0A%20%20%20%20per_client%20%3D%20%5B(r.client_id%2C%20r.containers_seen)%20for%20r%20in%20results%5D%0A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22total_ok%22%3A%20total_ok%2C%0A%20%20%20%20%20%20%20%20%22total_err%22%3A%20total_err%2C%0A%20%20%20%20%20%20%20%20%22multi%22%3A%20multi%2C%0A%20%20%20%20%20%20%20%20%22per_client%22%3A%20per_client%2C%0A%20%20%20%20%7D%0A%0A%0Adef%20print_summary(%0A%20%20%20%20url%3A%20str%2C%0A%20%20%20%20sticky%3A%20bool%2C%0A%20%20%20%20n_clients%3A%20int%2C%0A%20%20%20%20seconds%3A%20float%2C%0A%20%20%20%20stats%3A%20dict%5Bstr%2C%20Any%5D%2C%0A%20%20%20%20console%3A%20Console%20%7C%20None%20%3D%20None%2C%0A)%20-%3E%20None%3A%0A%20%20%20%20if%20not%20console%3A%0A%20%20%20%20%20%20%20%20console%20%3D%20Console()%0A%20%20%20%20console.print()%0A%20%20%20%20console.print(%0A%20%20%20%20%20%20%20%20f%22%5Bbold%5Durl%3D%5B%2F%5D%7Burl%7D%20%5Bbold%5Dsticky%3D%5B%2F%5D%7Bsticky%7D%20%5Bbold%5Dclients%3D%5B%2F%5D%7Bn_clients%7D%20%5Bbold%5Dduration_s%3D%5B%2F%5D%7Bseconds%7D%22%0A%20%20%20%20)%0A%20%20%20%20console.print(%0A%20%20%20%20%20%20%20%20f%22%5Bgreen%5Dtotal_ok%3D%7Bstats%5B'total_ok'%5D%7D%5B%2F%5D%20%5Bred%5Dtotal_err%3D%7Bstats%5B'total_err'%5D%7D%5B%2F%5D%22%0A%20%20%20%20)%0A%0A%20%20%20%20for%20c%2C%20seen%20in%20stats%5B%22per_client%22%5D%3A%0A%20%20%20%20%20%20%20%20console.print(f%22%20%20client%3D%7Bc%7D%20containers%3D%7Blist(seen)%7D%22)%0A%20%20%20%20console.print(%0A%20%20%20%20%20%20%20%20f%22Clients%20with%20multiple%20containers%3A%20%5Byellow%5D%7Blen(stats%5B'multi'%5D)%7D%2F%7Bn_clients%7D%5B%2F%5D%22%0A%20%20%20%20)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DGYqNM_T2.js.map
