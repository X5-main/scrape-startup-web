(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ab56e6d1-79c9-4927-8406-fce976fd3bc6`,e._sentryDebugIdIdentifier=`sentry-dbid-ab56e6d1-79c9-4927-8406-fce976fd3bc6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as ne,t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Lambda on hard mode: Inside Modal's web infrastructure`,description:`In this post, we'll talk about how Modal handles real-time HTTP requests and WebSockets in serverless functions.`,authors:[{name:`Eric Zhang`,avatarUrl:`https://modal-cdn.com/eric-zhang.jpg`,jobTitle:`Founding Engineer`,twitterHandle:`ekzhang1`}],date:`2024-03-14T12:00:00.000Z`,length:`20 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:2,value:`“Lambda on hard mode”`,id:`lambda-on-hard-mode`,children:[{depth:3,value:`A distributed operating system`,id:`a-distributed-operating-system`},{depth:3,value:`Translating HTTP to function calls`,id:`translating-http-to-function-calls`}]},{depth:2,value:`Understanding the HTTP protocol`,id:`understanding-the-http-protocol`,children:[{depth:3,value:`Edge cases and errors`,id:`edge-cases-and-errors`},{depth:3,value:`Dealing with HTTP idle timeouts`,id:`dealing-with-http-idle-timeouts`},{depth:3,value:`WebSocket connections`,id:`websocket-connections`}]},{depth:2,value:`Building on open-source infrastructure`,id:`building-on-open-source-infrastructure`,children:[{depth:3,value:`Caveat: Multi-region request handling`,id:`caveat-multi-region-request-handling`}]},{depth:2,value:`Lessons learned`,id:`lessons-learned`},{depth:2,value:`Acknowledgements`,id:`acknowledgements`}],rawContent:`At Modal, we built an HTTP and WebSocket stack on our platform. In other words,
your serverless functions can take web requests.

This was tricky! HTTP has quite a few edge cases, so we used Rust for its speed
and to help manage the complexity. But even so, it took a while to get right. We
recently wrapped up this feature by introducing
[full WebSocket support](/blog/websocket-launch) (real-time bidirectional
messaging).

We call this service \`modal-http\`, and it sits between the Web and our core
runtime.

![Simple schematic with modal-http at the center](https://modal-cdn.com/cdnbot/modal-http-20.png)

You can deploy a simple [Web Function](/docs/guide/webhooks) to a \`*.modal.run\`
URL by running some Python code:

\`\`\`python
import modal

app = modal.App(name="small-app")


@app.function()
@modal.fastapi_endpoint(method="GET")
def my_handler():
    return {
        "status": "success",
        "data": "Hello, world!",
    }
\`\`\`

(_This takes **0.747 seconds** to deploy today._)

But you can also run a much larger compute workload. For example, to set up a
data-intensive video processing endpoint:

\`\`\`python
import modal
from .my_video_library import Video, do_expensive_processing

app = modal.App(name="big-app")


# 30 minutes, 8 CPUs, 32 GB of memory
@app.function(timeout=1800, cpu=8, memory=32 * 1024)
@modal.fastapi_endpoint(method="POST")
def my_handler(video_data: Video):
    # Process the video
    edited_video = do_expensive_processing(video_data)

    # Return it as a response
    return edited_video
\`\`\`

This post is about the behind-the-scenes of serving a Web Function on Modal. How
does your web request get translated into an autoscaling serverless invocation?

What makes our HTTP/WebSocket implementation particularly interesting is its
lack of limits. Serverless computing is
[traditionally understood](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2019/EECS-2019-3.pdf)
to prioritize small, lightweight tasks, but Modal can't compromise on speed or
compute capacity.

When resource limits are removed, handling web requests gets proportionally more
difficult. Users may ask to upload a gigabyte of video to their machine learning
model or data pipeline, and we want to help them do that! We can't just say,
"sorry, either make your video 200x smaller or split it up yourself." So we had
a bit of a challenge on our hands.

## "Lambda on hard mode"

<!-- At Modal, we work on serverless functions. Traditional serverless platforms are
convenient and cost-effective, but they have technical constraints that relegate
them to small, long-running apps. Like a proxy in front of your blog, or a
Node.js web server to control your smart toaster. -->

Serverless function platforms have constraints. A lot of them, too!

- Functions on
  [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
  are limited to 15-minute runs and 50 MB images. As of 2024, they can only use
  3 CPUs (6 threads) and 10 GB of memory. Response bandwidth is 16 Mbps.
- [Google Cloud Run](https://cloud.google.com/run/quotas) is a bit better, with
  4 CPUs and 32 GB of memory, plus 75 Mbps bandwidth.
- [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/limits/)
  are the most restricted. Their images can only be 10 MB in size and have 6
  HTTP connections. Execution is limited to 30 seconds of CPU time, 128 MB of
  memory.

But modern compute workloads can be [much more demanding](/examples): training
neural networks, rendering graphics, simulating physics, running data pipelines,
and so on.

Modal containers can each use up to **64 CPUs**, **336 GB of memory**, and **8
Nvidia H100 GPUs**. And they may need to download up to **hundreds of
gigabytes** of model weights and image data on container startup. As a result,
we care about having them spin up and shut down quickly, since having any idle
time is expensive. We scale to zero and bill [by the second](/pricing).

As a user, this is freeing. I often get questions like, "does Modal have enough
compute to run my [fancy bread-baking simulation](/docs/examples/blender_video)"
— and I tell them, are you kidding? You can spin up dozens of 64-CPU containers
at a snap of your fingers. Simulate your whole bakery!

In summary: Modal containers are potentially long-running and compute-heavy,
with big inputs and outputs. This is the opposite of what "serverless" is
usually good at. How can we ensure quick and reliable delivery of HTTP requests
under these conditions?

### A distributed operating system

Let's take a step back and review the concept of serverless computing. Run code
in containers. Increase the number of containers when there's work to be done,
and then decrease it when there's less work. You can imagine a factory that
makes cars: when there are many orders, the factory operates more machines, and
when there are fewer orders, the factory shifts its focus. (Except in computers,
everything happens faster than in a car factory, since they're processing
thousands of requests per second.)

This isn't unique to serverless computing; it's how most applications scale
today. If you deploy a web server, chances are you'd use a PaaS to manage
replicas and scaling, or an orchestrator like Kubernetes. Each of these
offerings can be conceptualized by a two-part schematic:

1. **Autoscaling:** Write code in a stateless way, replicate it, then track how
   much work needs to be done via latency, CPU, and memory metrics.
2. **Load balancing:** Distribute work across many machines and route traffic to
   them.

Together autoscaling and load balancing constitute a kind of analogue to an
_operating system_ in the distributed services world: something that manages
compute resources and provides a common execution environment, allowing software
to be run.

Although a unified goal, there are many approaches. (A lot of
[ink](https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/)
[has](https://aosabook.org/en/v2/nginx.html)
[been](https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf)
[spilled](https://github.com/tangchq74/papers/blob/fad260ab66567e843e5ad6e238f7051ffe384e8a/XFaaS-SOSP23-Final.pdf)
on load balancing in particular.) Here's a brief summary to illustrate how this
schematic maps onto a few popular deployment systems. We're in good company!

| System (release date)     | Autoscaling               | Load balancing                            |
| ------------------------- | ------------------------- | ----------------------------------------- |
| _Heroku (2009)_           | By p95 latency            | HTTP reverse proxy                        |
| _Kubernetes (2014)_       | Resource metrics (custom) | Custom reverse proxy and/or load balancer |
| _AWS Lambda (2014)_       | Traffic                   | HTTP reverse proxy                        |
| _Azure Functions (2016)_  | Traffic                   | HTTP reverse proxy                        |
| _AWS Fargate (2017)_      | Resource metrics (custom) | HTTP/TCP/UDP load balancer                |
| _Render (2019)_           | CPU/memory target         | HTTP reverse proxy                        |
| _Google Cloud Run (2019)_ | Traffic and CPU target    | HTTP reverse proxy                        |
| _Fly.io (2020)_           | Traffic (custom)          | HTTP/TCP/TLS proxy, by distance and load  |
| _Modal (2023)_            | Traffic (custom)          | **Translate HTTP to function calls**      |

So… I spot a difference there. Hang on a second. I want to talk about Modal's
HTTP ingress.

### Translating HTTP to function calls

You might notice that setting up an HTTP reverse proxy in front of serverless
functions is a popular option. This means that you scale up your container, and
some service in front handles TLS termination and directly forwards traffic to a
backend server. For most of these platforms, HTTP is the main way you can talk
to these serverless functions, as a network service.

But for Modal, we're focused on building a platform based on the idea that
serverless functions are just _ordinary functions_ that you can call. If you
want to define a function on Modal, that should be easy! You don't need to set
up a REST API. Just call it directly with \`.remote()\`.

\`\`\`python
from modal import App
from PIL import Image

app = App()


@app.function()
def compute_embeddings(image: Image) -> list[int]:
    return my_ml_model.run(image)


@app.function()
def run_batch_job(image_names: list[str]) -> None:
    for name in image_names:
        image = fetch_image(name)
        vec = compute_embeddings.remote(image)  # invoke remote function
        print(vec)
\`\`\`

Since \`run_batch_job()\` can be invoked in any region, and \`compute_embeddings()\`
can be called remotely from it, we needed to build generic high-performance
infrastructure for serverless _function calls_. Like, actually "calling a
function." Not wrapping it in some REST API.

Calling a function is a bit different from handling an HTTP request. There's a
mismatch if you try to conflate them! By supporting both of these workloads, we
can:

- Use a faster, optimized path (for calls between functions) that can be
  location and data cache-aware, rather than relying on the same HTTP protocol.
- Fully support real-time streaming in network requests, rather than limiting it
  to fit the use case of a typical function call.
- Offer first-class support for complex heterogeneous workloads on CPU and GPU.

Modal's bread and butter is systems engineering for heavy-duty function calls.
We're already focused on making that fast and reliable. As a result, we decided
to handle web requests by translating them into function calls, which gives us a
foundation of shared infrastructure to build upon.

## Understanding the HTTP protocol

To understand how HTTP gets turned into a function calls, first we need to
understand HTTP. HTTP follows a request-response model. Here's what a typical
flow looks like. On the top, you can see a standard \`GET\` request with no body,
and on the bottom is a \`POST\` request with body.

_**Note:** HTTP GET requests can technically have bodies too, though they should
be ignored. Also, a less-known fact is that request and response bodies can be
interleaved,
[sometimes even in HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc6202)!_

![Diagram of two requests, HTTP GET on top and HTTP POST on the bottom](https://modal-cdn.com/cdnbot/modal-http-10.png)

The client sends some headers to the server, followed by an optional body. Once
the server receives the request, it does some processing, then responds in turn
with a set of a headers and its own response body.

Both the client and server directions are sent over a specific wire protocol,
which varies between HTTP versions. For example, HTTP/1.0 uses a TCP stream for
each request, HTTP/1.1 added keepalive support, HTTP/2 has concurrent stream
multiplexing over a single TCP stream, and HTTP/3 uses QUIC (UDP) instead of
TCP. They're all unified by this request-response model.

Here's what an HTTP/1.1 GET looks like, as displayed by \`curl\` in verbose mode.
The \`>\` lines are request headers, the \`<\` lines are response headers, and the
response body is at the end:

\`\`\`
$ curl -v http://example.com
*   Trying 93.184.216.34:80...
* TCP_NODELAY set
* Connected to example.com (93.184.216.34) port 80 (#0)
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/7.68.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Accept-Ranges: bytes
< Age: 521695
< Cache-Control: max-age=604800
< Content-Type: text/html; charset=UTF-8
< Date: Fri, 23 Feb 2024 17:22:54 GMT
< Etag: "3147526947+gzip"
< Expires: Fri, 01 Mar 2024 17:22:54 GMT
< Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
< Server: ECS (cha/8169)
< Vary: Accept-Encoding
< X-Cache: HIT
< Content-Length: 1256
<
<!doctype html>
<html>
<head>
    <title>Example Domain</title>
    <!-- note: head contents omitted for brevity -->
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
* Connection #0 to host example.com left intact
\`\`\`

To iron out the differences between HTTP protocol versions, we needed a backend
data representation for the request. In a reverse proxy, the backend protocol
would just be HTTP/1.1, but in our case that would add additional complexity for
reliably reconnecting TCP streams and parsing the wire format. We instead
decided to base our protocol on a stream of _events_.

Luckily, there was already a well-specified protocol for representing HTTP as
event data: [ASGI](https://github.com/django/asgiref), typically used as a
standard interface for web frameworks in Python.

_**Note:** ASGI was made for a different purpose! Usually the web server and
ASGI application run on the same machine. Here we're using it as the internal
communication language for a distributed runtime. So we adjusted the protocol to
our use case by serializing events as binary Protocol Buffers._

ASGI doesn't support every internal detail of HTTP (e.g., gRPC servers need
access to HTTP/2 stream IDs), but it's a common denominator that's enough for
web apps built with all the popular Python web frameworks: Flask, Django,
FastAPI, and more. That's a lot of web applications, and the benefit of this
maturity is that it lets us greatly simplify our model of HTTP serving.

Here's what a POST request looks like in ASGI. The blue arrows represent client
events, while the green arrows are events sent from the server.

![Diagram of an HTTP POST request with events marked](https://modal-cdn.com/cdnbot/modal-http-11.png)

1. At the start of a request, when headers are received, we begin by parsing the
   headers to generate a _function input_ via the \`http\` request scope. This
   triggers a new function call, which is scheduled on a running task according
   to availability and locality.
2. Then, the request body is streamed in, and we begin reading it in chunks to
   produce real-time \`http.request\` events that are sent to the serverless
   function call. If the server falls behind, backpressure is propagated to the
   client via TCP (for HTTP/1.1) or HTTP/2 flow control.
3. The function starts executing immediately after getting the request headers,
   then begins reading the request body. It sends back its own headers and
   status code, followed by the response body in chunks.
4. The request-response cycle finishes, optionally with HTTP trailers.

In this way, we're able to send an entire HTTP request and response over a
generic serverless function call. And it's efficient too, with proper batching
and backpressure. We don't need to establish a single TCP stream or anything; we
can use reliable, low-latency message queues to send the events.

Unlike AWS Lambda's 6 MB limit for request and response bodies, this
architecture lets us support request bodies of up to 4 GiB (682x bigger), and
streaming response bodies of unlimited size.

Of course, although conceptually simple, it's still a pretty tricky thing to
implement correctly since there are a lot of concurrent moving parts. Our
implementation is in Rust, based on the [hyper](https://hyper.rs/) HTTP server
library and [Tokio](https://tokio.rs/) async runtime. Here's a snippet of the
code that buffers the request body in chunks of up to 1 MiB in size, or waits
for 2 milliseconds of duration.

\`\`\`rust
/// Stream an HTTP request body into the \`data_in\` channel for a web
/// endpoint. This function also sends \`http.disconnect\` when the request
/// finishes, or the HTTP client disconnects.
async fn stream_http_request_body(
    &self,
    function_call_id: &str,
    mut body: hyper::Body,
    disconnect_rx: oneshot::Receiver<()>,
) -> Result<()> {
    let asgi_body = |body, more_body| Asgi {
        r#type: Some(asgi::Type::HttpRequest(asgi::HttpRequest {
            body,
            more_body,
        })),
    };
    let asgi_disconnect = Asgi {
        r#type: Some(asgi::Type::HttpDisconnect(asgi::HttpDisconnect {})),
    };

    let (tx, mut rx) = mpsc::channel(16); // Send at most 16 chunks at a time.

    tokio::spawn(async move {
        let body_buffer_time = Duration::from_millis(2);
        let body_buffer_size = 1 << 20; // 1 MiB

        let mut last_put = Instant::now();
        let mut current_segments = Vec::new();
        let mut current_size = 0;

        while let Some(result) = body.next().await {
            let Ok(buf) = result else {
                // If the request fails, send a disconnection immediately.
                tx.send(asgi_disconnect).await?;
                return Ok(());
            };
            if buf.is_empty() {
                continue;
            }

            current_size += buf.len();
            current_segments.push(buf);

            if current_size > body_buffer_size || last_put.elapsed() > body_buffer_time {
                let message = asgi_body(Bytes::from(current_segments.concat()), true);
                current_segments.clear();
                current_size = 0;
                tx.send(message).await?;
                last_put = Instant::now();
            }
        }

        // Final message, possibly empty.
        let message = asgi_body(Bytes::from(current_segments.concat()), false);
        tx.send(message).await?;

        // Wait for a client disconnect signal (or for the response to finish sending),
        // then forward that to the data channel.
        match disconnect_rx.await {
            Ok(()) => {}
            _ => tx.send(asgi_disconnect).await?, // => RecvError
        };

        anyhow::Ok(())
    });

    let mut index = 1;
    let mut messages = Vec::new();
    while rx.recv_many(&mut messages, 16).await != 0 {
        self.put_data_in(function_call_id, &mut index, &messages)
            .await?;
        messages.clear();
    }

    anyhow::Ok(())
}
\`\`\`

You might have noticed the \`disconnect_rx\` channel used in the snippet above.
This hints at one of the realities of making reliable distributed systems that
we glossed over: needing to thoroughly handle failure cases everywhere, all the
time.

### Edge cases and errors

First, if a client sends an HTTP request but exits in the middle of sending the
body, then we propagate that disconnection to the serverless function.

![Diagram of a disconnected HTTP request](https://modal-cdn.com/cdnbot/modal-http-12.png)

We reify this using an ASGI \`http.disconnect\` event, which allows the user's
code to stop executing gracefully. Otherwise, we might have a function call
that's still running even after the user has canceled their request.

Another issue is if the server has a failure. It might throw an exception, crash
due to running out of memory, hit a user-defined timeout, be preempted if on a
spot instance, and so on. If a malicious user is on the system, they also might
send malformed response events, or events in the wrong order!

We keep track of any violations and display an error message to the user. Rust's
pattern matching and ownership help with managing the casework.

### Dealing with HTTP idle timeouts

Okay, so if we had been a standard runtime, we would be done with HTTP now. But
we're still not done! There's one more thing to consider: long-running requests.

If you make an HTTP request and the server doesn't respond for 300 seconds, then
Chrome cancels the request and gives you an error. This is not configurable.
Other browsers and pieces of web infrastructure have varying timeouts. Our users
often end up running expensive models that take longer than 5 minutes, so we
need a way to support long-running requests.

Luckily, there's a solution. After 150 seconds (2.5 minutes), we send a
temporary "303 See Other" redirect to the browser, pointing them to an
alternative URL with an ID for this specific request. The browser or HTTP client
will follow this redirect, ending their current stream and starting a new one.

Browsers will follow up to 20 redirects for a link, so this effectively
[increases the idle timeout to 50 minutes](https://modal.com/docs/guide/webhook-timeouts).
An example of this in action is shown below, with a single redirect.

![Diagram of a long-running request with one 303 See Other response](https://modal-cdn.com/cdnbot/modal-http-13.png)

Is this behavior a little strange? Yes. But it just works "out-of-the-box" for a
lot of people who have Web Functions that might execute for a long time. And if
your function finishes processing and begins its response in less than 2.5
minutes, you'll never notice a difference anyway.

For people who need to have very long-running web requests, Modal _just works_.

### WebSocket connections

That's it for HTTP. What if a user makes a WebSocket connection? Well, the
WebSocket protocol works by starting an HTTP/1.1 connection, then establishing a
_handshake_ via HTTP's connection upgrade mechanism. The
[handshake](https://datatracker.ietf.org/doc/html/rfc6455#section-1.2) looks
something like this:

\`\`\`
> GET /ws HTTP/1.1
> Host: my-endpoint.modal.run
> Upgrade: websocket
> Connection: Upgrade
> Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
> Sec-WebSocket-Version: 13
>
< HTTP/1.1 101 Switching Protocols
< Upgrade: websocket
< Connection: Upgrade
< Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

_**Note:** There is also another version of the WebSocket protocol that
bootstraps from HTTP/2, but it's not supported by many web servers yet. For now,
you need a dedicated TCP connection._

The \`Sec-WebSocket-Key\` header is random, while \`Sec-WebSocket-Accept\` is
derived from an arbitrary hash function on the key. (This is just some protocol
junk that we had to implement, see
[RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455).) ASGI has a separate
[WebSocket interface](https://asgi.readthedocs.io/en/latest/specs/www.html#websocket)
that encodes this handshake into a pair of \`websocket.connect\` and
\`websocket.accept\` events, so we translated our incoming request into those
events.

After the handshake, all of the infrastructure is already in place, and we
transmit messages between \`modal-http\` and the serverless function via data
channels in the same way as we did for HTTP.

![Diagram of a WebSocket connection](https://modal-cdn.com/cdnbot/modal-http-14.png)

Our server-side Rust implementation is based on hyper as before, but it upgrades
the connection to an asynchronous
[tokio-tungstenite](https://github.com/snapview/tokio-tungstenite) stream once
the handshake is accepted.

## Building on open-source infrastructure

We've built a lot of infrastructure to support HTTP and WebSocket connections,
but we didn't start from scratch. The Rust ecosystem was invaluable to making
this custom network service, which needed to be high-performance and correct.

But while we've talked a lot about the serverless backend and design choices
made to support heavy workloads, we haven't talked yet about how requests
actually _get_ to \`modal-http\`. For this part, we relied on boring, mature
open-source cloud infrastructure pieces.

Let's still take a look though. Modal Web Functions run on the wildcard domain
\`*.modal.run\`, as well as on
[custom domains](/docs/guide/webhook-urls#custom-domains) as assigned by users
via a CNAME record to \`cname.modal.domains\`. The most basic way you'd deploy a
Rust service like \`modal-http\` is by pointing a
[DNS record](https://en.wikipedia.org/wiki/Domain_Name_System) at a running
server, which has the compiled binary listen on a port.

![A browser sends a request to modal-http](https://modal-cdn.com/cdnbot/modal-http-0.png)

Rust is pretty fast, so this is a reasonable design for most real-world
services. A single node nevertheless doesn't scale well to the traffic of a
cloud platform. We wanted:

- **Multiple replicas.** Replication of the service provides fault tolerance and
  eases the process of rolling deployments. When we rollout a new version, old
  replicas need a gradual timeout.
- **Encryption.** Support for TLS is missing here. We _could_ handle it in the
  server directly, but rather than reinventing the wheel, it's easier and safer
  to rely on well-vetted software for TLS termination. (We also need to allocate
  [on-demand certificates](https://caddyserver.com/docs/automatic-https#on-demand-tls)
  for custom domains.)

So, rather than the simplified flow above, our actual ingress architecture to
\`modal-http\` looks like this. We placed a TCP network load balancer in front of
a [Kubernetes](https://kubernetes.io/) cluster, which runs a
[Caddy](https://caddyserver.com/docs/) deployment, as well as a separate
deployment for \`modal-http\` itself.

![Full path of a request through L4 NLB and Caddy](https://modal-cdn.com/cdnbot/modal-http-1.png)

Note that none of our _serverless functions_ run in this Kubernetes cluster.
Kubernetes isn't well-suited for the workloads we described, so we wrote our own
high-performance serverless runtime based on [gVisor](https://gvisor.dev/), our
own file system, and our own job scheduler — which we'll talk about another
time!

But Kubernetes is still a rock-solid tool for the more traditional parts of our
cloud infrastructure, and we're happy to use it here.

### Caveat: Multi-region request handling

It's a fact of life that light takes time to travel through fiber-optic cables
and routers. Ideally, \`modal-http\` should run on the edge in geographically
distributed data center regions, and requests should be routed to the nearest
replica. This is important to minimize baseline latency for web serving.

We're not there yet though. It's early days! While our serverless functions are
already running in many different clouds and data centers based on _compute
availability_, since GPUs are scarce, our actual servers only run in Ashburn,
Virginia for now.

This is a bit of a tradeoff for us, but it's not a fundamental one. It gives us
more flexibility at the moment, although \`modal-http\` will be deployed to more
regions in the future for latency reasons. Right now heavyweight workloads on
Modal probably aren't affected, but for very latency-sensitive workloads (under
100 ms), you'll likely want to specify your container to run in Ashburn.

## Lessons learned

So, there you have it. Serverless functions are traditionally limited to a
request-response model, but Modal just released full support for WebSockets,
with GPUs and fully managed autoscaling. And we did this by translating web
requests into function calls.

Our service, \`modal-http\`, is written in Rust and based on several components
that let us handle HTTP and WebSocket requests at scale. We've placed it behind
infrastructure to handle the ingress of requests, and we're planning to expand
to more regions in the future.

Some may wonder: If Modal translates HTTP to this message format, wouldn't that
stop people from being able to use the traditional container model of
[\`EXPOSE\`](https://docs.docker.com/reference/dockerfile/#expose)-ing TCP ports?
This is a good question, but it's not a fundamental limitation. The events can
be losslessly translated back to HTTP on the other end! We
wrote examples of this for systems like ComfyUI, and we're
[building it into the runtime](https://github.com/modal-labs/modal-client/pull/1513)
with just a bit of added code.

We've already been running Rust to power our serverless runtime for the past two
years, but \`modal-http\` gives us more confidence to run standard Rust services
in production. Just for comparison, when we first introduced this system to
replace our previous Python-based ingress, the number of \`502 Bad Gateway\`
errors in production decreased by 99.7%, due to clearer error handling and
tracking of request lifetimes. And it laid the groundwork for WebSocket support
without fundamental changes.

Today, Web Functions and remote function calls on Modal use a common system.
Having uniformity allows us to focus on impactful work that makes our cloud
runtime faster and lower-priced, while improving security and reliability over
time.

## Acknowledgements

Thanks to the Modal team for their feedback on this post. Special thanks to
Jonathon Belotti, Erik Bernhardsson, Akshat Bubna, Richard Gong, and Daniel
Norberg for their work and design discussions related to \`modal-http\`.

If you're interested in fast, reliable, and heavy-duty systems for the cloud,
[Modal is hiring](/company).
`,meta:{description:`In this post, we'll talk about how Modal handles real-time HTTP requests and WebSockets in serverless functions.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:re,toc:b,rawContent:x,meta:S}=f,ie=t(`<thead><tr><th>System (release date)</th><th>Autoscaling</th><th>Load balancing</th></tr></thead> <tbody><tr><td><em>Heroku (2009)</em></td><td>By p95 latency</td><td>HTTP reverse proxy</td></tr><tr><td><em>Kubernetes (2014)</em></td><td>Resource metrics (custom)</td><td>Custom reverse proxy and/or load balancer</td></tr><tr><td><em>AWS Lambda (2014)</em></td><td>Traffic</td><td>HTTP reverse proxy</td></tr><tr><td><em>Azure Functions (2016)</em></td><td>Traffic</td><td>HTTP reverse proxy</td></tr><tr><td><em>AWS Fargate (2017)</em></td><td>Resource metrics (custom)</td><td>HTTP/TCP/UDP load balancer</td></tr><tr><td><em>Render (2019)</em></td><td>CPU/memory target</td><td>HTTP reverse proxy</td></tr><tr><td><em>Google Cloud Run (2019)</em></td><td>Traffic and CPU target</td><td>HTTP reverse proxy</td></tr><tr><td><em>Fly.io (2020)</em></td><td>Traffic (custom)</td><td>HTTP/TCP/TLS proxy, by distance and load</td></tr><tr><td><em>Modal (2023)</em></td><td>Traffic (custom)</td><td><strong>Translate HTTP to function calls</strong></td></tr></tbody>`,1),ae=t(`<code>EXPOSE</code>`),oe=t(`<p>At Modal, we built an HTTP and WebSocket stack on our platform. In other words,
your serverless functions can take web requests.</p> <p>This was tricky! HTTP has quite a few edge cases, so we used Rust for its speed
and to help manage the complexity. But even so, it took a while to get right. We
recently wrapped up this feature by introducing <!> (real-time bidirectional
messaging).</p> <p>We call this service <code>modal-http</code>, and it sits between the Web and our core
runtime.</p> <p><!></p> <p>You can deploy a simple <!> to a <code>*.modal.run</code> URL by running some Python code:</p> <!> <p>(<em>This takes <strong>0.747 seconds</strong> to deploy today.</em>)</p> <p>But you can also run a much larger compute workload. For example, to set up a
data-intensive video processing endpoint:</p> <!> <p>This post is about the behind-the-scenes of serving a Web Function on Modal. How
does your web request get translated into an autoscaling serverless invocation?</p> <p>What makes our HTTP/WebSocket implementation particularly interesting is its
lack of limits. Serverless computing is <!> to prioritize small, lightweight tasks, but Modal can’t compromise on speed or
compute capacity.</p> <p>When resource limits are removed, handling web requests gets proportionally more
difficult. Users may ask to upload a gigabyte of video to their machine learning
model or data pipeline, and we want to help them do that! We can’t just say,
“sorry, either make your video 200x smaller or split it up yourself.” So we had
a bit of a challenge on our hands.</p> <h2 id="lambda-on-hard-mode">“Lambda on hard mode”</h2> <p>Serverless function platforms have constraints. A lot of them, too!</p> <ul><li>Functions on <!> are limited to 15-minute runs and 50 MB images. As of 2024, they can only use
3 CPUs (6 threads) and 10 GB of memory. Response bandwidth is 16 Mbps.</li> <li><!> is a bit better, with
4 CPUs and 32 GB of memory, plus 75 Mbps bandwidth.</li> <li><!> are the most restricted. Their images can only be 10 MB in size and have 6
HTTP connections. Execution is limited to 30 seconds of CPU time, 128 MB of
memory.</li></ul> <p>But modern compute workloads can be <!>: training
neural networks, rendering graphics, simulating physics, running data pipelines,
and so on.</p> <p>Modal containers can each use up to <strong>64 CPUs</strong>, <strong>336 GB of memory</strong>, and <strong>8
Nvidia H100 GPUs</strong>. And they may need to download up to <strong>hundreds of
gigabytes</strong> of model weights and image data on container startup. As a result,
we care about having them spin up and shut down quickly, since having any idle
time is expensive. We scale to zero and bill <!>.</p> <p>As a user, this is freeing. I often get questions like, “does Modal have enough
compute to run my <!>”
— and I tell them, are you kidding? You can spin up dozens of 64-CPU containers
at a snap of your fingers. Simulate your whole bakery!</p> <p>In summary: Modal containers are potentially long-running and compute-heavy,
with big inputs and outputs. This is the opposite of what “serverless” is
usually good at. How can we ensure quick and reliable delivery of HTTP requests
under these conditions?</p> <h3 id="a-distributed-operating-system">A distributed operating system</h3> <p>Let’s take a step back and review the concept of serverless computing. Run code
in containers. Increase the number of containers when there’s work to be done,
and then decrease it when there’s less work. You can imagine a factory that
makes cars: when there are many orders, the factory operates more machines, and
when there are fewer orders, the factory shifts its focus. (Except in computers,
everything happens faster than in a car factory, since they’re processing
thousands of requests per second.)</p> <p>This isn’t unique to serverless computing; it’s how most applications scale
today. If you deploy a web server, chances are you’d use a PaaS to manage
replicas and scaling, or an orchestrator like Kubernetes. Each of these
offerings can be conceptualized by a two-part schematic:</p> <ol><li><strong>Autoscaling:</strong> Write code in a stateless way, replicate it, then track how
much work needs to be done via latency, CPU, and memory metrics.</li> <li><strong>Load balancing:</strong> Distribute work across many machines and route traffic to
them.</li></ol> <p>Together autoscaling and load balancing constitute a kind of analogue to an <em>operating system</em> in the distributed services world: something that manages
compute resources and provides a common execution environment, allowing software
to be run.</p> <p>Although a unified goal, there are many approaches. (A lot of <!> <!> <!> <!> on load balancing in particular.) Here’s a brief summary to illustrate how this
schematic maps onto a few popular deployment systems. We’re in good company!</p> <!> <p>So… I spot a difference there. Hang on a second. I want to talk about Modal’s
HTTP ingress.</p> <h3 id="translating-http-to-function-calls">Translating HTTP to function calls</h3> <p>You might notice that setting up an HTTP reverse proxy in front of serverless
functions is a popular option. This means that you scale up your container, and
some service in front handles TLS termination and directly forwards traffic to a
backend server. For most of these platforms, HTTP is the main way you can talk
to these serverless functions, as a network service.</p> <p>But for Modal, we’re focused on building a platform based on the idea that
serverless functions are just <em>ordinary functions</em> that you can call. If you
want to define a function on Modal, that should be easy! You don’t need to set
up a REST API. Just call it directly with <code>.remote()</code>.</p> <!> <p>Since <code>run_batch_job()</code> can be invoked in any region, and <code>compute_embeddings()</code> can be called remotely from it, we needed to build generic high-performance
infrastructure for serverless <em>function calls</em>. Like, actually “calling a
function.” Not wrapping it in some REST API.</p> <p>Calling a function is a bit different from handling an HTTP request. There’s a
mismatch if you try to conflate them! By supporting both of these workloads, we
can:</p> <ul><li>Use a faster, optimized path (for calls between functions) that can be
location and data cache-aware, rather than relying on the same HTTP protocol.</li> <li>Fully support real-time streaming in network requests, rather than limiting it
to fit the use case of a typical function call.</li> <li>Offer first-class support for complex heterogeneous workloads on CPU and GPU.</li></ul> <p>Modal’s bread and butter is systems engineering for heavy-duty function calls.
We’re already focused on making that fast and reliable. As a result, we decided
to handle web requests by translating them into function calls, which gives us a
foundation of shared infrastructure to build upon.</p> <h2 id="understanding-the-http-protocol">Understanding the HTTP protocol</h2> <p>To understand how HTTP gets turned into a function calls, first we need to
understand HTTP. HTTP follows a request-response model. Here’s what a typical
flow looks like. On the top, you can see a standard <code>GET</code> request with no body,
and on the bottom is a <code>POST</code> request with body.</p> <p><em><strong>Note:</strong> HTTP GET requests can technically have bodies too, though they should
be ignored. Also, a less-known fact is that request and response bodies can be
interleaved, <!>!</em></p> <p><!></p> <p>The client sends some headers to the server, followed by an optional body. Once
the server receives the request, it does some processing, then responds in turn
with a set of a headers and its own response body.</p> <p>Both the client and server directions are sent over a specific wire protocol,
which varies between HTTP versions. For example, HTTP/1.0 uses a TCP stream for
each request, HTTP/1.1 added keepalive support, HTTP/2 has concurrent stream
multiplexing over a single TCP stream, and HTTP/3 uses QUIC (UDP) instead of
TCP. They’re all unified by this request-response model.</p> <p>Here’s what an HTTP/1.1 GET looks like, as displayed by <code>curl</code> in verbose mode.
The <code>&gt;</code> lines are request headers, the <code>&lt;</code> lines are response headers, and the
response body is at the end:</p> <!> <p>To iron out the differences between HTTP protocol versions, we needed a backend
data representation for the request. In a reverse proxy, the backend protocol
would just be HTTP/1.1, but in our case that would add additional complexity for
reliably reconnecting TCP streams and parsing the wire format. We instead
decided to base our protocol on a stream of <em>events</em>.</p> <p>Luckily, there was already a well-specified protocol for representing HTTP as
event data: <!>, typically used as a
standard interface for web frameworks in Python.</p> <p><em><strong>Note:</strong> ASGI was made for a different purpose! Usually the web server and
ASGI application run on the same machine. Here we’re using it as the internal
communication language for a distributed runtime. So we adjusted the protocol to
our use case by serializing events as binary Protocol Buffers.</em></p> <p>ASGI doesn’t support every internal detail of HTTP (e.g., gRPC servers need
access to HTTP/2 stream IDs), but it’s a common denominator that’s enough for
web apps built with all the popular Python web frameworks: Flask, Django,
FastAPI, and more. That’s a lot of web applications, and the benefit of this
maturity is that it lets us greatly simplify our model of HTTP serving.</p> <p>Here’s what a POST request looks like in ASGI. The blue arrows represent client
events, while the green arrows are events sent from the server.</p> <p><!></p> <ol><li>At the start of a request, when headers are received, we begin by parsing the
headers to generate a <em>function input</em> via the <code>http</code> request scope. This
triggers a new function call, which is scheduled on a running task according
to availability and locality.</li> <li>Then, the request body is streamed in, and we begin reading it in chunks to
produce real-time <code>http.request</code> events that are sent to the serverless
function call. If the server falls behind, backpressure is propagated to the
client via TCP (for HTTP/1.1) or HTTP/2 flow control.</li> <li>The function starts executing immediately after getting the request headers,
then begins reading the request body. It sends back its own headers and
status code, followed by the response body in chunks.</li> <li>The request-response cycle finishes, optionally with HTTP trailers.</li></ol> <p>In this way, we’re able to send an entire HTTP request and response over a
generic serverless function call. And it’s efficient too, with proper batching
and backpressure. We don’t need to establish a single TCP stream or anything; we
can use reliable, low-latency message queues to send the events.</p> <p>Unlike AWS Lambda’s 6 MB limit for request and response bodies, this
architecture lets us support request bodies of up to 4 GiB (682x bigger), and
streaming response bodies of unlimited size.</p> <p>Of course, although conceptually simple, it’s still a pretty tricky thing to
implement correctly since there are a lot of concurrent moving parts. Our
implementation is in Rust, based on the <!> HTTP server
library and <!> async runtime. Here’s a snippet of the
code that buffers the request body in chunks of up to 1 MiB in size, or waits
for 2 milliseconds of duration.</p> <!> <p>You might have noticed the <code>disconnect_rx</code> channel used in the snippet above.
This hints at one of the realities of making reliable distributed systems that
we glossed over: needing to thoroughly handle failure cases everywhere, all the
time.</p> <h3 id="edge-cases-and-errors">Edge cases and errors</h3> <p>First, if a client sends an HTTP request but exits in the middle of sending the
body, then we propagate that disconnection to the serverless function.</p> <p><!></p> <p>We reify this using an ASGI <code>http.disconnect</code> event, which allows the user’s
code to stop executing gracefully. Otherwise, we might have a function call
that’s still running even after the user has canceled their request.</p> <p>Another issue is if the server has a failure. It might throw an exception, crash
due to running out of memory, hit a user-defined timeout, be preempted if on a
spot instance, and so on. If a malicious user is on the system, they also might
send malformed response events, or events in the wrong order!</p> <p>We keep track of any violations and display an error message to the user. Rust’s
pattern matching and ownership help with managing the casework.</p> <h3 id="dealing-with-http-idle-timeouts">Dealing with HTTP idle timeouts</h3> <p>Okay, so if we had been a standard runtime, we would be done with HTTP now. But
we’re still not done! There’s one more thing to consider: long-running requests.</p> <p>If you make an HTTP request and the server doesn’t respond for 300 seconds, then
Chrome cancels the request and gives you an error. This is not configurable.
Other browsers and pieces of web infrastructure have varying timeouts. Our users
often end up running expensive models that take longer than 5 minutes, so we
need a way to support long-running requests.</p> <p>Luckily, there’s a solution. After 150 seconds (2.5 minutes), we send a
temporary “303 See Other” redirect to the browser, pointing them to an
alternative URL with an ID for this specific request. The browser or HTTP client
will follow this redirect, ending their current stream and starting a new one.</p> <p>Browsers will follow up to 20 redirects for a link, so this effectively <!>.
An example of this in action is shown below, with a single redirect.</p> <p><!></p> <p>Is this behavior a little strange? Yes. But it just works “out-of-the-box” for a
lot of people who have Web Functions that might execute for a long time. And if
your function finishes processing and begins its response in less than 2.5
minutes, you’ll never notice a difference anyway.</p> <p>For people who need to have very long-running web requests, Modal <em>just works</em>.</p> <h3 id="websocket-connections">WebSocket connections</h3> <p>That’s it for HTTP. What if a user makes a WebSocket connection? Well, the
WebSocket protocol works by starting an HTTP/1.1 connection, then establishing a <em>handshake</em> via HTTP’s connection upgrade mechanism. The <!> looks
something like this:</p> <!> <p><em><strong>Note:</strong> There is also another version of the WebSocket protocol that
bootstraps from HTTP/2, but it’s not supported by many web servers yet. For now,
you need a dedicated TCP connection.</em></p> <p>The <code>Sec-WebSocket-Key</code> header is random, while <code>Sec-WebSocket-Accept</code> is
derived from an arbitrary hash function on the key. (This is just some protocol
junk that we had to implement, see <!>.) ASGI has a separate <!> that encodes this handshake into a pair of <code>websocket.connect</code> and <code>websocket.accept</code> events, so we translated our incoming request into those
events.</p> <p>After the handshake, all of the infrastructure is already in place, and we
transmit messages between <code>modal-http</code> and the serverless function via data
channels in the same way as we did for HTTP.</p> <p><!></p> <p>Our server-side Rust implementation is based on hyper as before, but it upgrades
the connection to an asynchronous <!> stream once
the handshake is accepted.</p> <h2 id="building-on-open-source-infrastructure">Building on open-source infrastructure</h2> <p>We’ve built a lot of infrastructure to support HTTP and WebSocket connections,
but we didn’t start from scratch. The Rust ecosystem was invaluable to making
this custom network service, which needed to be high-performance and correct.</p> <p>But while we’ve talked a lot about the serverless backend and design choices
made to support heavy workloads, we haven’t talked yet about how requests
actually <em>get</em> to <code>modal-http</code>. For this part, we relied on boring, mature
open-source cloud infrastructure pieces.</p> <p>Let’s still take a look though. Modal Web Functions run on the wildcard domain <code>*.modal.run</code>, as well as on <!> as assigned by users
via a CNAME record to <code>cname.modal.domains</code>. The most basic way you’d deploy a
Rust service like <code>modal-http</code> is by pointing a <!> at a running
server, which has the compiled binary listen on a port.</p> <p><!></p> <p>Rust is pretty fast, so this is a reasonable design for most real-world
services. A single node nevertheless doesn’t scale well to the traffic of a
cloud platform. We wanted:</p> <ul><li><strong>Multiple replicas.</strong> Replication of the service provides fault tolerance and
eases the process of rolling deployments. When we rollout a new version, old
replicas need a gradual timeout.</li> <li><strong>Encryption.</strong> Support for TLS is missing here. We <em>could</em> handle it in the
server directly, but rather than reinventing the wheel, it’s easier and safer
to rely on well-vetted software for TLS termination. (We also need to allocate <!> for custom domains.)</li></ul> <p>So, rather than the simplified flow above, our actual ingress architecture to <code>modal-http</code> looks like this. We placed a TCP network load balancer in front of
a <!> cluster, which runs a <!> deployment, as well as a separate
deployment for <code>modal-http</code> itself.</p> <p><!></p> <p>Note that none of our <em>serverless functions</em> run in this Kubernetes cluster.
Kubernetes isn’t well-suited for the workloads we described, so we wrote our own
high-performance serverless runtime based on <!>, our
own file system, and our own job scheduler — which we’ll talk about another
time!</p> <p>But Kubernetes is still a rock-solid tool for the more traditional parts of our
cloud infrastructure, and we’re happy to use it here.</p> <h3 id="caveat-multi-region-request-handling">Caveat: Multi-region request handling</h3> <p>It’s a fact of life that light takes time to travel through fiber-optic cables
and routers. Ideally, <code>modal-http</code> should run on the edge in geographically
distributed data center regions, and requests should be routed to the nearest
replica. This is important to minimize baseline latency for web serving.</p> <p>We’re not there yet though. It’s early days! While our serverless functions are
already running in many different clouds and data centers based on <em>compute
availability</em>, since GPUs are scarce, our actual servers only run in Ashburn,
Virginia for now.</p> <p>This is a bit of a tradeoff for us, but it’s not a fundamental one. It gives us
more flexibility at the moment, although <code>modal-http</code> will be deployed to more
regions in the future for latency reasons. Right now heavyweight workloads on
Modal probably aren’t affected, but for very latency-sensitive workloads (under
100 ms), you’ll likely want to specify your container to run in Ashburn.</p> <h2 id="lessons-learned">Lessons learned</h2> <p>So, there you have it. Serverless functions are traditionally limited to a
request-response model, but Modal just released full support for WebSockets,
with GPUs and fully managed autoscaling. And we did this by translating web
requests into function calls.</p> <p>Our service, <code>modal-http</code>, is written in Rust and based on several components
that let us handle HTTP and WebSocket requests at scale. We’ve placed it behind
infrastructure to handle the ingress of requests, and we’re planning to expand
to more regions in the future.</p> <p>Some may wonder: If Modal translates HTTP to this message format, wouldn’t that
stop people from being able to use the traditional container model of <!>-ing TCP ports?
This is a good question, but it’s not a fundamental limitation. The events can
be losslessly translated back to HTTP on the other end! We
wrote examples of this for systems like ComfyUI, and we’re <!> with just a bit of added code.</p> <p>We’ve already been running Rust to power our serverless runtime for the past two
years, but <code>modal-http</code> gives us more confidence to run standard Rust services
in production. Just for comparison, when we first introduced this system to
replace our previous Python-based ingress, the number of <code>502 Bad Gateway</code> errors in production decreased by 99.7%, due to clearer error handling and
tracking of request lifetimes. And it laid the groundwork for WebSocket support
without fundamental changes.</p> <p>Today, Web Functions and remote function calls on Modal use a common system.
Having uniformity allows us to focus on impactful work that makes our cloud
runtime faster and lower-priced, while improving security and reliability over
time.</p> <h2 id="acknowledgements">Acknowledgements</h2> <p>Thanks to the Modal team for their feedback on this post. Special thanks to
Jonathon Belotti, Erik Bernhardsson, Akshat Bubna, Richard Gong, and Daniel
Norberg for their work and design discussions related to <code>modal-http</code>.</p> <p>If you’re interested in fast, reliable, and heavy-duty systems for the cloud, <!>.</p>`,1);function C(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=oe(),d=o(te(a),2);u(o(e(d)),{href:`/blog/websocket-launch`,children:(e,t)=>{s(),i(e,r(`full WebSocket support`))},$$slots:{default:!0}}),s(),n(d);var f=o(d,4);c(e(f),{src:`https://modal-cdn.com/cdnbot/modal-http-20.png`,alt:`Simple schematic with modal-http at the center`}),n(f);var p=o(f,2);u(o(e(p)),{href:`/docs/guide/webhooks`,children:(e,t)=>{s(),i(e,r(`Web Function`))},$$slots:{default:!0}}),s(3),n(p);var m=o(p,2);l(m,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22small-app%22)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22GET%22)%0Adef%20my_handler()%3A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22status%22%3A%20%22success%22%2C%0A%20%20%20%20%20%20%20%20%22data%22%3A%20%22Hello%2C%20world!%22%2C%0A%20%20%20%20%7D`,lang:`python`});var h=o(m,6);l(h,{code:`import%20modal%0Afrom%20.my_video_library%20import%20Video%2C%20do_expensive_processing%0A%0Aapp%20%3D%20modal.App(name%3D%22big-app%22)%0A%0A%0A%23%2030%20minutes%2C%208%20CPUs%2C%2032%20GB%20of%20memory%0A%40app.function(timeout%3D1800%2C%20cpu%3D8%2C%20memory%3D32%20*%201024)%0A%40modal.fastapi_endpoint(method%3D%22POST%22)%0Adef%20my_handler(video_data%3A%20Video)%3A%0A%20%20%20%20%23%20Process%20the%20video%0A%20%20%20%20edited_video%20%3D%20do_expensive_processing(video_data)%0A%0A%20%20%20%20%23%20Return%20it%20as%20a%20response%0A%20%20%20%20return%20edited_video`,lang:`python`});var g=o(h,4);u(o(e(g)),{href:`https://www2.eecs.berkeley.edu/Pubs/TechRpts/2019/EECS-2019-3.pdf`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`traditionally understood`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,8),v=e(_);u(o(e(v)),{href:`https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`AWS Lambda`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);u(e(y),{href:`https://cloud.google.com/run/quotas`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Google Cloud Run`))},$$slots:{default:!0}}),s(),n(y);var re=o(y,2);u(e(re),{href:`https://developers.cloudflare.com/workers/platform/limits/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Cloudflare Workers`))},$$slots:{default:!0}}),s(),n(re),n(_);var b=o(_,2);u(o(e(b)),{href:`/examples`,children:(e,t)=>{s(),i(e,r(`much more demanding`))},$$slots:{default:!0}}),s(),n(b);var x=o(b,2);u(o(e(x),9),{href:`/pricing`,children:(e,t)=>{s(),i(e,r(`by the second`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);u(o(e(S)),{href:`/docs/examples/blender_video`,children:(e,t)=>{s(),i(e,r(`fancy bread-baking simulation`))},$$slots:{default:!0}}),s(),n(S);var C=o(S,14),w=o(e(C));u(w,{href:`https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ink`))},$$slots:{default:!0}});var T=o(w,2);u(T,{href:`https://aosabook.org/en/v2/nginx.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`has`))},$$slots:{default:!0}});var E=o(T,2);u(E,{href:`https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`been`))},$$slots:{default:!0}}),u(o(E,2),{href:`https://github.com/tangchq74/papers/blob/fad260ab66567e843e5ad6e238f7051ffe384e8a/XFaaS-SOSP23-Final.pdf`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`spilled`))},$$slots:{default:!0}}),s(),n(C);var D=o(C,2);ne(D,{children:(e,t)=>{var n=ie();s(2),i(e,n)},$$slots:{default:!0}});var O=o(D,10);l(O,{code:`from%20modal%20import%20App%0Afrom%20PIL%20import%20Image%0A%0Aapp%20%3D%20App()%0A%0A%0A%40app.function()%0Adef%20compute_embeddings(image%3A%20Image)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20return%20my_ml_model.run(image)%0A%0A%0A%40app.function()%0Adef%20run_batch_job(image_names%3A%20list%5Bstr%5D)%20-%3E%20None%3A%0A%20%20%20%20for%20name%20in%20image_names%3A%0A%20%20%20%20%20%20%20%20image%20%3D%20fetch_image(name)%0A%20%20%20%20%20%20%20%20vec%20%3D%20compute_embeddings.remote(image)%20%20%23%20invoke%20remote%20function%0A%20%20%20%20%20%20%20%20print(vec)`,lang:`python`});var k=o(O,14),A=e(k);u(o(e(A),2),{href:`https://datatracker.ietf.org/doc/html/rfc6202`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`sometimes even in HTTP/1.1`))},$$slots:{default:!0}}),s(),n(A),n(k);var j=o(k,2);c(e(j),{src:`https://modal-cdn.com/cdnbot/modal-http-10.png`,alt:`Diagram of two requests, HTTP GET on top and HTTP POST on the bottom`}),n(j);var M=o(j,8);l(M,{code:`%24%20curl%20-v%20http%3A%2F%2Fexample.com%0A*%20%20%20Trying%2093.184.216.34%3A80...%0A*%20TCP_NODELAY%20set%0A*%20Connected%20to%20example.com%20(93.184.216.34)%20port%2080%20(%230)%0A%3E%20GET%20%2F%20HTTP%2F1.1%0A%3E%20Host%3A%20example.com%0A%3E%20User-Agent%3A%20curl%2F7.68.0%0A%3E%20Accept%3A%20*%2F*%0A%3E%0A*%20Mark%20bundle%20as%20not%20supporting%20multiuse%0A%3C%20HTTP%2F1.1%20200%20OK%0A%3C%20Accept-Ranges%3A%20bytes%0A%3C%20Age%3A%20521695%0A%3C%20Cache-Control%3A%20max-age%3D604800%0A%3C%20Content-Type%3A%20text%2Fhtml%3B%20charset%3DUTF-8%0A%3C%20Date%3A%20Fri%2C%2023%20Feb%202024%2017%3A22%3A54%20GMT%0A%3C%20Etag%3A%20%223147526947%2Bgzip%22%0A%3C%20Expires%3A%20Fri%2C%2001%20Mar%202024%2017%3A22%3A54%20GMT%0A%3C%20Last-Modified%3A%20Thu%2C%2017%20Oct%202019%2007%3A18%3A26%20GMT%0A%3C%20Server%3A%20ECS%20(cha%2F8169)%0A%3C%20Vary%3A%20Accept-Encoding%0A%3C%20X-Cache%3A%20HIT%0A%3C%20Content-Length%3A%201256%0A%3C%0A%3C!doctype%20html%3E%0A%3Chtml%3E%0A%3Chead%3E%0A%20%20%20%20%3Ctitle%3EExample%20Domain%3C%2Ftitle%3E%0A%20%20%20%20%3C!--%20note%3A%20head%20contents%20omitted%20for%20brevity%20--%3E%0A%3C%2Fhead%3E%0A%0A%3Cbody%3E%0A%3Cdiv%3E%0A%20%20%20%20%3Ch1%3EExample%20Domain%3C%2Fh1%3E%0A%20%20%20%20%3Cp%3EThis%20domain%20is%20for%20use%20in%20illustrative%20examples%20in%20documents.%20You%20may%20use%20this%0A%20%20%20%20domain%20in%20literature%20without%20prior%20coordination%20or%20asking%20for%20permission.%3C%2Fp%3E%0A%20%20%20%20%3Cp%3E%3Ca%20href%3D%22https%3A%2F%2Fwww.iana.org%2Fdomains%2Fexample%22%3EMore%20information...%3C%2Fa%3E%3C%2Fp%3E%0A%3C%2Fdiv%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A*%20Connection%20%230%20to%20host%20example.com%20left%20intact`,lang:`text`});var N=o(M,4);u(o(e(N)),{href:`https://github.com/django/asgiref`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ASGI`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,8);c(e(P),{src:`https://modal-cdn.com/cdnbot/modal-http-11.png`,alt:`Diagram of an HTTP POST request with events marked`}),n(P);var F=o(P,8),se=o(e(F));u(se,{href:`https://hyper.rs/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`hyper`))},$$slots:{default:!0}}),u(o(se,2),{href:`https://tokio.rs/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tokio`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,2);l(I,{code:`%2F%2F%2F%20Stream%20an%20HTTP%20request%20body%20into%20the%20%60data_in%60%20channel%20for%20a%20web%0A%2F%2F%2F%20endpoint.%20This%20function%20also%20sends%20%60http.disconnect%60%20when%20the%20request%0A%2F%2F%2F%20finishes%2C%20or%20the%20HTTP%20client%20disconnects.%0Aasync%20fn%20stream_http_request_body(%0A%20%20%20%20%26self%2C%0A%20%20%20%20function_call_id%3A%20%26str%2C%0A%20%20%20%20mut%20body%3A%20hyper%3A%3ABody%2C%0A%20%20%20%20disconnect_rx%3A%20oneshot%3A%3AReceiver%3C()%3E%2C%0A)%20-%3E%20Result%3C()%3E%20%7B%0A%20%20%20%20let%20asgi_body%20%3D%20%7Cbody%2C%20more_body%7C%20Asgi%20%7B%0A%20%20%20%20%20%20%20%20r%23type%3A%20Some(asgi%3A%3AType%3A%3AHttpRequest(asgi%3A%3AHttpRequest%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20body%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20more_body%2C%0A%20%20%20%20%20%20%20%20%7D))%2C%0A%20%20%20%20%7D%3B%0A%20%20%20%20let%20asgi_disconnect%20%3D%20Asgi%20%7B%0A%20%20%20%20%20%20%20%20r%23type%3A%20Some(asgi%3A%3AType%3A%3AHttpDisconnect(asgi%3A%3AHttpDisconnect%20%7B%7D))%2C%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20let%20(tx%2C%20mut%20rx)%20%3D%20mpsc%3A%3Achannel(16)%3B%20%2F%2F%20Send%20at%20most%2016%20chunks%20at%20a%20time.%0A%0A%20%20%20%20tokio%3A%3Aspawn(async%20move%20%7B%0A%20%20%20%20%20%20%20%20let%20body_buffer_time%20%3D%20Duration%3A%3Afrom_millis(2)%3B%0A%20%20%20%20%20%20%20%20let%20body_buffer_size%20%3D%201%20%3C%3C%2020%3B%20%2F%2F%201%20MiB%0A%0A%20%20%20%20%20%20%20%20let%20mut%20last_put%20%3D%20Instant%3A%3Anow()%3B%0A%20%20%20%20%20%20%20%20let%20mut%20current_segments%20%3D%20Vec%3A%3Anew()%3B%0A%20%20%20%20%20%20%20%20let%20mut%20current_size%20%3D%200%3B%0A%0A%20%20%20%20%20%20%20%20while%20let%20Some(result)%20%3D%20body.next().await%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20let%20Ok(buf)%20%3D%20result%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20If%20the%20request%20fails%2C%20send%20a%20disconnection%20immediately.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tx.send(asgi_disconnect).await%3F%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20Ok(())%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20buf.is_empty()%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20current_size%20%2B%3D%20buf.len()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20current_segments.push(buf)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20current_size%20%3E%20body_buffer_size%20%7C%7C%20last_put.elapsed()%20%3E%20body_buffer_time%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20message%20%3D%20asgi_body(Bytes%3A%3Afrom(current_segments.concat())%2C%20true)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20current_segments.clear()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20current_size%20%3D%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tx.send(message).await%3F%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20last_put%20%3D%20Instant%3A%3Anow()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Final%20message%2C%20possibly%20empty.%0A%20%20%20%20%20%20%20%20let%20message%20%3D%20asgi_body(Bytes%3A%3Afrom(current_segments.concat())%2C%20false)%3B%0A%20%20%20%20%20%20%20%20tx.send(message).await%3F%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Wait%20for%20a%20client%20disconnect%20signal%20(or%20for%20the%20response%20to%20finish%20sending)%2C%0A%20%20%20%20%20%20%20%20%2F%2F%20then%20forward%20that%20to%20the%20data%20channel.%0A%20%20%20%20%20%20%20%20match%20disconnect_rx.await%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20Ok(())%20%3D%3E%20%7B%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20_%20%3D%3E%20tx.send(asgi_disconnect).await%3F%2C%20%2F%2F%20%3D%3E%20RecvError%0A%20%20%20%20%20%20%20%20%7D%3B%0A%0A%20%20%20%20%20%20%20%20anyhow%3A%3AOk(())%0A%20%20%20%20%7D)%3B%0A%0A%20%20%20%20let%20mut%20index%20%3D%201%3B%0A%20%20%20%20let%20mut%20messages%20%3D%20Vec%3A%3Anew()%3B%0A%20%20%20%20while%20rx.recv_many(%26mut%20messages%2C%2016).await%20!%3D%200%20%7B%0A%20%20%20%20%20%20%20%20self.put_data_in(function_call_id%2C%20%26mut%20index%2C%20%26messages)%0A%20%20%20%20%20%20%20%20%20%20%20%20.await%3F%3B%0A%20%20%20%20%20%20%20%20messages.clear()%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20anyhow%3A%3AOk(())%0A%7D`,lang:`rust`});var L=o(I,8);c(e(L),{src:`https://modal-cdn.com/cdnbot/modal-http-12.png`,alt:`Diagram of a disconnected HTTP request`}),n(L);var R=o(L,16);u(o(e(R)),{href:`https://modal.com/docs/guide/webhook-timeouts`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`increases the idle timeout to 50 minutes`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,2);c(e(z),{src:`https://modal-cdn.com/cdnbot/modal-http-13.png`,alt:`Diagram of a long-running request with one 303 See Other response`}),n(z);var B=o(z,8);u(o(e(B),3),{href:`https://datatracker.ietf.org/doc/html/rfc6455#section-1.2`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`handshake`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);l(V,{code:`%3E%20GET%20%2Fws%20HTTP%2F1.1%0A%3E%20Host%3A%20my-endpoint.modal.run%0A%3E%20Upgrade%3A%20websocket%0A%3E%20Connection%3A%20Upgrade%0A%3E%20Sec-WebSocket-Key%3A%20dGhlIHNhbXBsZSBub25jZQ%3D%3D%0A%3E%20Sec-WebSocket-Version%3A%2013%0A%3E%0A%3C%20HTTP%2F1.1%20101%20Switching%20Protocols%0A%3C%20Upgrade%3A%20websocket%0A%3C%20Connection%3A%20Upgrade%0A%3C%20Sec-WebSocket-Accept%3A%20s3pPLMBiTxaQ9kYGzzhZRbK%2BxOo%3D`,lang:`text`});var H=o(V,4),U=o(e(H),5);u(U,{href:`https://datatracker.ietf.org/doc/html/rfc6455`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFC 6455`))},$$slots:{default:!0}}),u(o(U,2),{href:`https://asgi.readthedocs.io/en/latest/specs/www.html#websocket`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`WebSocket interface`))},$$slots:{default:!0}}),s(5),n(H);var W=o(H,4);c(e(W),{src:`https://modal-cdn.com/cdnbot/modal-http-14.png`,alt:`Diagram of a WebSocket connection`}),n(W);var G=o(W,2);u(o(e(G)),{href:`https://github.com/snapview/tokio-tungstenite`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`tokio-tungstenite`))},$$slots:{default:!0}}),s(),n(G);var K=o(G,8),q=o(e(K),3);u(q,{href:`/docs/guide/webhook-urls#custom-domains`,children:(e,t)=>{s(),i(e,r(`custom domains`))},$$slots:{default:!0}}),u(o(q,6),{href:`https://en.wikipedia.org/wiki/Domain_Name_System`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`DNS record`))},$$slots:{default:!0}}),s(),n(K);var J=o(K,2);c(e(J),{src:`https://modal-cdn.com/cdnbot/modal-http-0.png`,alt:`A browser sends a request to modal-http`}),n(J);var Y=o(J,4),ce=o(e(Y),2);u(o(e(ce),4),{href:`https://caddyserver.com/docs/automatic-https#on-demand-tls`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`on-demand certificates`))},$$slots:{default:!0}}),s(),n(ce),n(Y);var X=o(Y,2),le=o(e(X),3);u(le,{href:`https://kubernetes.io/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Kubernetes`))},$$slots:{default:!0}}),u(o(le,2),{href:`https://caddyserver.com/docs/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Caddy`))},$$slots:{default:!0}}),s(3),n(X);var Z=o(X,2);c(e(Z),{src:`https://modal-cdn.com/cdnbot/modal-http-1.png`,alt:`Full path of a request through L4 NLB and Caddy`}),n(Z);var Q=o(Z,2);u(o(e(Q),3),{href:`https://gvisor.dev/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`gVisor`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,18),ue=o(e($));u(ue,{href:`https://docs.docker.com/reference/dockerfile/#expose`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),u(o(ue,2),{href:`https://github.com/modal-labs/modal-client/pull/1513`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`building it into the runtime`))},$$slots:{default:!0}}),s(),n($);var de=o($,10);u(o(e(de)),{href:`/company`,children:(e,t)=>{s(),i(e,r(`Modal is hiring`))},$$slots:{default:!0}}),s(),n(de),i(t,a)},$$slots:{default:!0}}))}export{C as default,f as metadata};
//# sourceMappingURL=tfimXZa6.js.map
