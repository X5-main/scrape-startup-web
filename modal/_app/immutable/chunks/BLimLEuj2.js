(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`85937d68-e5bb-45c5-9a8d-66e0bce8a8b9`,e._sentryDebugIdIdentifier=`sentry-dbid-85937d68-e5bb-45c5-9a8d-66e0bce8a8b9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run a FastRTC app on Modal`,id:`run-a-fastrtc-app-on-modal`,children:[{depth:2,value:`Set up FastRTC on Modal`,id:`set-up-fastrtc-on-modal`,children:[{depth:3,value:`Configure WebRTC streaming on Modal`,id:`configure-webrtc-streaming-on-modal`}]},{depth:2,value:`Running a FastRTC app on Modal`,id:`running-a-fastrtc-app-on-modal`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Run a FastRTC app on Modal

[FastRTC](https://fastrtc.org/) is a Python library for real-time communication on the web.
This example demonstrates how to run a simple FastRTC app in the cloud on Modal.

It's intended to help you get up and running with real-time streaming applications on Modal
as quickly as possible. If you're interested in running a production-grade WebRTC app on Modal,
see [this example](https://modal.com/docs/examples/webrtc_yolo).

In this example, we stream webcam video from a browser to a container on Modal,
where the video is flipped, annotated, and sent back with under 100ms of delay.
You can try it out [here](https://modal-labs-examples--example-fastrtc-flip-webcam-ui.modal.run/)
or just dive straight into the code to run it yourself.

## Set up FastRTC on Modal

First, we import the \`modal\` SDK
and use it to define a [container image](https://modal.com/docs/guide/images)
with FastRTC and related dependencies.

\`\`\`python
import modal

web_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi[standard]==0.115.4",
    "fastrtc==0.0.23",
    "gradio==5.7.1",
    "opencv-python-headless==4.11.0.86",
)

\`\`\`

Then, we set that as the default Image on our Modal [App](https://modal.com/docs/guide/apps).

\`\`\`python
app = modal.App("example-fastrtc-flip-webcam", image=web_image)

\`\`\`

### Configure WebRTC streaming on Modal

Under the hood, FastRTC uses the WebRTC
[APIs](https://www.w3.org/TR/webrtc/) and
[protocols](https://datatracker.ietf.org/doc/html/rfc8825).

WebRTC provides low latency ("real-time") peer-to-peer communication
for Web applications, focusing on audio and video.
Considering that the Web is a platform originally designed
for high-latency, client-server communication of text and images,
that's no mean feat!

In addition to protocols that implement this communication,
WebRTC includes APIs for describing and manipulating audio/video streams.
In this demo, we set a few simple parameters, like the direction of the webcam
and the minimum frame rate. See the
[MDN Web Docs for \`MediaTrackConstraints\`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)
for more.

\`\`\`python
TRACK_CONSTRAINTS = {
    "width": {"exact": 640},
    "height": {"exact": 480},
    "frameRate": {"min": 30},
    "facingMode": {  # https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/facingMode
        "ideal": "user"
    },
}

\`\`\`

In theory, the Internet is designed for peer-to-peer communication
all the way down to its heart, the Internet Protocol (IP): just send packets between IP addresses.
In practice, peer-to-peer communication on the contemporary Internet is fraught with difficulites,
from restrictive firewalls to finicky work-arounds for
[the exhaustion of IPv4 addresses](https://www.a10networks.com/glossary/what-is-ipv4-exhaustion/),
like [Carrier-Grade Network Address Translation (CGNAT)](https://en.wikipedia.org/wiki/Carrier-grade_NAT).

So establishing peer-to-peer connections can be quite involved.
The protocol for doing so is called Interactive Connectivity Establishment (ICE).
It is described in [this RFC](https://datatracker.ietf.org/doc/html/rfc8445#section-2).

ICE involves the peers exchanging a list of connections that might be used.
We use a fairly simple setup here, where our peer on Modal uses the
[Session Traversal Utilities for NAT (STUN)](https://datatracker.ietf.org/doc/html/rfc5389)
server provided by Google. A STUN server basically just reflects back to a client what their
IP address and port number appear to be when they talk to it. The peer on Modal communicates
that information to the other peer trying to connect to it -- in this case, a browser trying to share a webcam feed.
Note the use of \`stun\` and port \`19302\` in the URL in place of
something more familiar, like \`http\` and port \`80\`.

\`\`\`python
RTC_CONFIG = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}


\`\`\`

## Running a FastRTC app on Modal

FastRTC builds on top of the [Gradio](https://www.gradio.app/docs)
library for defining Web UIs in Python.
Gradio in turn is compatible with the
[Asynchronous Server Gateway Interface (ASGI)](https://asgi.readthedocs.io/en/latest/)
protocol for asynchronous Python web servers, like
[FastAPI](https://fastrtc.org/userguide/streams/),
so we can host it on Modal's cloud platform using the
[\`modal.asgi_app\` decorator](https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps)
with [Modal Function](https://modal.com/docs/guide/apps).

But before we do that, we need to consider limits:
on how many peers can connect to one instance on Modal
and on how long they can stay connected.
We picked some sensible defaults to show how they interact
with the deployment parameters of the Modal Function.
You'll want to tune these for your application!

\`\`\`python
MAX_CONCURRENT_STREAMS = 10  # number of peers per instance on Modal

MINUTES = 60  # seconds
TIME_LIMIT = 10 * MINUTES  # time limit


@app.function(
    # gradio requires sticky sessions
    # so we limit the number of concurrent containers to 1
    # and allow that container to handle concurrent streams
    max_containers=1,
    scaledown_window=TIME_LIMIT + 1 * MINUTES,  # add a small buffer to time limit
)
@modal.concurrent(max_inputs=MAX_CONCURRENT_STREAMS)  # inputs per container
@modal.asgi_app()  # ASGI on Modal
def ui():
    import fastrtc  # WebRTC in Gradio
    import gradio as gr  # WebUIs in Python
    from fastapi import FastAPI  # asynchronous ASGI server framework
    from gradio.routes import mount_gradio_app  # connects Gradio and FastAPI

    with gr.Blocks() as blocks:  # block-wise UI definition
        gr.HTML(  # simple HTML header
            "<h1 style='text-align: center'>"
            "Streaming Video Processing with Modal and FastRTC"
            "</h1>"
        )

        with gr.Column():  # a column of UI elements
            fastrtc.Stream(  # high-level media streaming UI element
                modality="video",
                mode="send-receive",
                handler=flip_vertically,  # handler -- handle incoming frame, produce outgoing frame
                ui_args={"title": "Click 'Record' to flip your webcam in the cloud"},
                rtc_configuration=RTC_CONFIG,
                track_constraints=TRACK_CONSTRAINTS,
                concurrency_limit=MAX_CONCURRENT_STREAMS,  # limit simultaneous connections
                time_limit=TIME_LIMIT,  # limit time per connection
            )

    return mount_gradio_app(app=FastAPI(), blocks=blocks, path="/")


\`\`\`

To try this out for yourself, run

\`\`\`bash
modal serve 07_web/fastrtc_flip_webcam.py
\`\`\`

and head to the \`modal.run\` URL that appears in your terminal.
You can also check on the application's dashboard
via the \`modal.com\` URL thatappears below it.

The \`modal serve\` command produces a hot-reloading development server --
try editing the \`title\` in the \`ui_args\` above and watch the server redeploy.

This temporary deployment is tied to your terminal session.
To deploy permanently, run

\`\`\`bash
modal deploy 07_web_endponts/fastrtc_flip_webcam.py
\`\`\`

Note that Modal is a serverless platform with [usage-based pricing](https://modal.com/pricing),
so this application will spin down and cost you nothing when it is not in use.

## Addenda

This FastRTC app is very much the "hello world" or "echo server"
of FastRTC: it just flips the incoming webcam stream and adds a "hello" message.
That logic appears below.

\`\`\`python
def flip_vertically(image):
    import cv2
    import numpy as np

    image = image.astype(np.uint8)

    if image is None:
        print("failed to decode image")
        return

    # flip vertically and caption to show video was processed on Modal
    image = cv2.flip(image, 0)
    lines = ["Hello from Modal!"]
    caption_image(image, lines)

    return image


def caption_image(
    img, lines, font_scale=0.8, thickness=2, margin=10, font=None, color=None
):
    import cv2

    if font is None:
        font = cv2.FONT_HERSHEY_SIMPLEX
    if color is None:
        color = (127, 238, 100, 128)  # Modal Green

    # get text sizes
    sizes = [cv2.getTextSize(line, font, font_scale, thickness)[0] for line in lines]
    if not sizes:
        return

    # position text in bottom right
    pos_xs = [img.shape[1] - size[0] - margin for size in sizes]

    pos_ys = [img.shape[0] - margin]
    for _width, height in reversed(sizes[:-1]):
        next_pos = pos_ys[-1] - 2 * height
        pos_ys.append(next_pos)

    for line, pos in zip(lines, zip(pos_xs, reversed(pos_ys))):
        cv2.putText(img, line, pos, font, font_scale, color, thickness)

\`\`\`
`,meta:{title:`Run a FastRTC app on Modal`,description:`FastRTC is a Python library for real-time communication on the web. This example demonstrates how to run a simple FastRTC app in the cloud on Modal.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`MDN Web Docs for <code>MediaTrackConstraints</code>`,1),x=t(`<code>modal.asgi_app</code> decorator`,1),S=t(`<!> <p><!> is a Python library for real-time communication on the web.
This example demonstrates how to run a simple FastRTC app in the cloud on Modal.</p> <p>It’s intended to help you get up and running with real-time streaming applications on Modal
as quickly as possible. If you’re interested in running a production-grade WebRTC app on Modal,
see <!>.</p> <p>In this example, we stream webcam video from a browser to a container on Modal,
where the video is flipped, annotated, and sent back with under 100ms of delay.
You can try it out <!> or just dive straight into the code to run it yourself.</p> <!> <p>First, we import the <code>modal</code> SDK
and use it to define a <!> with FastRTC and related dependencies.</p> <!> <p>Then, we set that as the default Image on our Modal <!>.</p> <!> <!> <p>Under the hood, FastRTC uses the WebRTC <!> and <!>.</p> <p>WebRTC provides low latency (“real-time”) peer-to-peer communication
for Web applications, focusing on audio and video.
Considering that the Web is a platform originally designed
for high-latency, client-server communication of text and images,
that’s no mean feat!</p> <p>In addition to protocols that implement this communication,
WebRTC includes APIs for describing and manipulating audio/video streams.
In this demo, we set a few simple parameters, like the direction of the webcam
and the minimum frame rate. See the <!> for more.</p> <!> <p>In theory, the Internet is designed for peer-to-peer communication
all the way down to its heart, the Internet Protocol (IP): just send packets between IP addresses.
In practice, peer-to-peer communication on the contemporary Internet is fraught with difficulites,
from restrictive firewalls to finicky work-arounds for <!>,
like <!>.</p> <p>So establishing peer-to-peer connections can be quite involved.
The protocol for doing so is called Interactive Connectivity Establishment (ICE).
It is described in <!>.</p> <p>ICE involves the peers exchanging a list of connections that might be used.
We use a fairly simple setup here, where our peer on Modal uses the <!> server provided by Google. A STUN server basically just reflects back to a client what their
IP address and port number appear to be when they talk to it. The peer on Modal communicates
that information to the other peer trying to connect to it — in this case, a browser trying to share a webcam feed.
Note the use of <code>stun</code> and port <code>19302</code> in the URL in place of
something more familiar, like <code>http</code> and port <code>80</code>.</p> <!> <!> <p>FastRTC builds on top of the <!> library for defining Web UIs in Python.
Gradio in turn is compatible with the <!> protocol for asynchronous Python web servers, like <!>,
so we can host it on Modal’s cloud platform using the <!> with <!>.</p> <p>But before we do that, we need to consider limits:
on how many peers can connect to one instance on Modal
and on how long they can stay connected.
We picked some sensible defaults to show how they interact
with the deployment parameters of the Modal Function.
You’ll want to tune these for your application!</p> <!> <p>To try this out for yourself, run</p> <!> <p>and head to the <code>modal.run</code> URL that appears in your terminal.
You can also check on the application’s dashboard
via the <code>modal.com</code> URL thatappears below it.</p> <p>The <code>modal serve</code> command produces a hot-reloading development server —
try editing the <code>title</code> in the <code>ui_args</code> above and watch the server redeploy.</p> <p>This temporary deployment is tied to your terminal session.
To deploy permanently, run</p> <!> <p>Note that Modal is a serverless platform with <!>,
so this application will spin down and cost you nothing when it is not in use.</p> <!> <p>This FastRTC app is very much the “hello world” or “echo server”
of FastRTC: it just flips the incoming webcam stream and adds a “hello” message.
That logic appears below.</p> <!>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`run-a-fastrtc-app-on-modal`,children:(e,t)=>{l(),i(e,r(`Run a FastRTC app on Modal`))},$$slots:{default:!0}});var g=c(m,2);h(e(g),{href:`https://fastrtc.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastRTC`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);h(c(e(_)),{href:`https://modal.com/docs/examples/webrtc_yolo`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);h(c(e(v)),{href:`https://modal-labs-examples--example-fastrtc-flip-webcam-ui.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);u(y,{id:`set-up-fastrtc-on-modal`,children:(e,t)=>{l(),i(e,r(`Set up FastRTC on Modal`))},$$slots:{default:!0}});var C=c(y,2);h(c(e(C),3),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);p(w,{code:`import%20modal%0A%0Aweb_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22fastrtc%3D%3D0.0.23%22%2C%0A%20%20%20%20%22gradio%3D%3D5.7.1%22%2C%0A%20%20%20%20%22opencv-python-headless%3D%3D4.11.0.86%22%2C%0A)%0A`,lang:`python`});var T=c(w,2);h(c(e(T)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);p(E,{code:`app%20%3D%20modal.App(%22example-fastrtc-flip-webcam%22%2C%20image%3Dweb_image)%0A`,lang:`python`});var D=c(E,2);d(D,{id:`configure-webrtc-streaming-on-modal`,children:(e,t)=>{l(),i(e,r(`Configure WebRTC streaming on Modal`))},$$slots:{default:!0}});var O=c(D,2),k=c(e(O));h(k,{href:`https://www.w3.org/TR/webrtc/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`APIs`))},$$slots:{default:!0}}),h(c(k,2),{href:`https://datatracker.ietf.org/doc/html/rfc8825`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`protocols`))},$$slots:{default:!0}}),l(),n(O);var A=c(O,4);h(c(e(A)),{href:`https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints`,rel:`nofollow`,children:(e,t)=>{l();var n=b();l(),i(e,n)},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);p(j,{code:`TRACK_CONSTRAINTS%20%3D%20%7B%0A%20%20%20%20%22width%22%3A%20%7B%22exact%22%3A%20640%7D%2C%0A%20%20%20%20%22height%22%3A%20%7B%22exact%22%3A%20480%7D%2C%0A%20%20%20%20%22frameRate%22%3A%20%7B%22min%22%3A%2030%7D%2C%0A%20%20%20%20%22facingMode%22%3A%20%7B%20%20%23%20https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FMediaTrackSettings%2FfacingMode%0A%20%20%20%20%20%20%20%20%22ideal%22%3A%20%22user%22%0A%20%20%20%20%7D%2C%0A%7D%0A`,lang:`python`});var M=c(j,2),N=c(e(M));h(N,{href:`https://www.a10networks.com/glossary/what-is-ipv4-exhaustion/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the exhaustion of IPv4 addresses`))},$$slots:{default:!0}}),h(c(N,2),{href:`https://en.wikipedia.org/wiki/Carrier-grade_NAT`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Carrier-Grade Network Address Translation (CGNAT)`))},$$slots:{default:!0}}),l(),n(M);var P=c(M,2);h(c(e(P)),{href:`https://datatracker.ietf.org/doc/html/rfc8445#section-2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this RFC`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);h(c(e(F)),{href:`https://datatracker.ietf.org/doc/html/rfc5389`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Session Traversal Utilities for NAT (STUN)`))},$$slots:{default:!0}}),l(9),n(F);var I=c(F,2);p(I,{code:`RTC_CONFIG%20%3D%20%7B%22iceServers%22%3A%20%5B%7B%22url%22%3A%20%22stun%3Astun.l.google.com%3A19302%22%7D%5D%7D%0A%0A`,lang:`python`});var L=c(I,2);u(L,{id:`running-a-fastrtc-app-on-modal`,children:(e,t)=>{l(),i(e,r(`Running a FastRTC app on Modal`))},$$slots:{default:!0}});var R=c(L,2),z=c(e(R));h(z,{href:`https://www.gradio.app/docs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Gradio`))},$$slots:{default:!0}});var B=c(z,2);h(B,{href:`https://asgi.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Asynchronous Server Gateway Interface (ASGI)`))},$$slots:{default:!0}});var V=c(B,2);h(V,{href:`https://fastrtc.org/userguide/streams/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}});var H=c(V,2);h(H,{href:`https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps`,rel:`nofollow`,children:(e,t)=>{var n=x();l(),i(e,n)},$$slots:{default:!0}}),h(c(H,2),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Function`))},$$slots:{default:!0}}),l(),n(R);var U=c(R,4);p(U,{code:`MAX_CONCURRENT_STREAMS%20%3D%2010%20%20%23%20number%20of%20peers%20per%20instance%20on%20Modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0ATIME_LIMIT%20%3D%2010%20*%20MINUTES%20%20%23%20time%20limit%0A%0A%0A%40app.function(%0A%20%20%20%20%23%20gradio%20requires%20sticky%20sessions%0A%20%20%20%20%23%20so%20we%20limit%20the%20number%20of%20concurrent%20containers%20to%201%0A%20%20%20%20%23%20and%20allow%20that%20container%20to%20handle%20concurrent%20streams%0A%20%20%20%20max_containers%3D1%2C%0A%20%20%20%20scaledown_window%3DTIME_LIMIT%20%2B%201%20*%20MINUTES%2C%20%20%23%20add%20a%20small%20buffer%20to%20time%20limit%0A)%0A%40modal.concurrent(max_inputs%3DMAX_CONCURRENT_STREAMS)%20%20%23%20inputs%20per%20container%0A%40modal.asgi_app()%20%20%23%20ASGI%20on%20Modal%0Adef%20ui()%3A%0A%20%20%20%20import%20fastrtc%20%20%23%20WebRTC%20in%20Gradio%0A%20%20%20%20import%20gradio%20as%20gr%20%20%23%20WebUIs%20in%20Python%0A%20%20%20%20from%20fastapi%20import%20FastAPI%20%20%23%20asynchronous%20ASGI%20server%20framework%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%20%20%23%20connects%20Gradio%20and%20FastAPI%0A%0A%20%20%20%20with%20gr.Blocks()%20as%20blocks%3A%20%20%23%20block-wise%20UI%20definition%0A%20%20%20%20%20%20%20%20gr.HTML(%20%20%23%20simple%20HTML%20header%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%3Ch1%20style%3D'text-align%3A%20center'%3E%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Streaming%20Video%20Processing%20with%20Modal%20and%20FastRTC%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%3C%2Fh1%3E%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20with%20gr.Column()%3A%20%20%23%20a%20column%20of%20UI%20elements%0A%20%20%20%20%20%20%20%20%20%20%20%20fastrtc.Stream(%20%20%23%20high-level%20media%20streaming%20UI%20element%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modality%3D%22video%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20mode%3D%22send-receive%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handler%3Dflip_vertically%2C%20%20%23%20handler%20--%20handle%20incoming%20frame%2C%20produce%20outgoing%20frame%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ui_args%3D%7B%22title%22%3A%20%22Click%20'Record'%20to%20flip%20your%20webcam%20in%20the%20cloud%22%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20rtc_configuration%3DRTC_CONFIG%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20track_constraints%3DTRACK_CONSTRAINTS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20concurrency_limit%3DMAX_CONCURRENT_STREAMS%2C%20%20%23%20limit%20simultaneous%20connections%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20time_limit%3DTIME_LIMIT%2C%20%20%23%20limit%20time%20per%20connection%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20mount_gradio_app(app%3DFastAPI()%2C%20blocks%3Dblocks%2C%20path%3D%22%2F%22)%0A%0A`,lang:`python`});var W=c(U,4);p(W,{code:`modal%20serve%2007_web%2Ffastrtc_flip_webcam.py`,lang:`bash`});var G=c(W,8);p(G,{code:`modal%20deploy%2007_web_endponts%2Ffastrtc_flip_webcam.py`,lang:`bash`});var K=c(G,2);h(c(e(K)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`usage-based pricing`))},$$slots:{default:!0}}),l(),n(K);var q=c(K,2);u(q,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),p(c(q,4),{code:`def%20flip_vertically(image)%3A%0A%20%20%20%20import%20cv2%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20image%20%3D%20image.astype(np.uint8)%0A%0A%20%20%20%20if%20image%20is%20None%3A%0A%20%20%20%20%20%20%20%20print(%22failed%20to%20decode%20image%22)%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%23%20flip%20vertically%20and%20caption%20to%20show%20video%20was%20processed%20on%20Modal%0A%20%20%20%20image%20%3D%20cv2.flip(image%2C%200)%0A%20%20%20%20lines%20%3D%20%5B%22Hello%20from%20Modal!%22%5D%0A%20%20%20%20caption_image(image%2C%20lines)%0A%0A%20%20%20%20return%20image%0A%0A%0Adef%20caption_image(%0A%20%20%20%20img%2C%20lines%2C%20font_scale%3D0.8%2C%20thickness%3D2%2C%20margin%3D10%2C%20font%3DNone%2C%20color%3DNone%0A)%3A%0A%20%20%20%20import%20cv2%0A%0A%20%20%20%20if%20font%20is%20None%3A%0A%20%20%20%20%20%20%20%20font%20%3D%20cv2.FONT_HERSHEY_SIMPLEX%0A%20%20%20%20if%20color%20is%20None%3A%0A%20%20%20%20%20%20%20%20color%20%3D%20(127%2C%20238%2C%20100%2C%20128)%20%20%23%20Modal%20Green%0A%0A%20%20%20%20%23%20get%20text%20sizes%0A%20%20%20%20sizes%20%3D%20%5Bcv2.getTextSize(line%2C%20font%2C%20font_scale%2C%20thickness)%5B0%5D%20for%20line%20in%20lines%5D%0A%20%20%20%20if%20not%20sizes%3A%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%23%20position%20text%20in%20bottom%20right%0A%20%20%20%20pos_xs%20%3D%20%5Bimg.shape%5B1%5D%20-%20size%5B0%5D%20-%20margin%20for%20size%20in%20sizes%5D%0A%0A%20%20%20%20pos_ys%20%3D%20%5Bimg.shape%5B0%5D%20-%20margin%5D%0A%20%20%20%20for%20_width%2C%20height%20in%20reversed(sizes%5B%3A-1%5D)%3A%0A%20%20%20%20%20%20%20%20next_pos%20%3D%20pos_ys%5B-1%5D%20-%202%20*%20height%0A%20%20%20%20%20%20%20%20pos_ys.append(next_pos)%0A%0A%20%20%20%20for%20line%2C%20pos%20in%20zip(lines%2C%20zip(pos_xs%2C%20reversed(pos_ys)))%3A%0A%20%20%20%20%20%20%20%20cv2.putText(img%2C%20line%2C%20pos%2C%20font%2C%20font_scale%2C%20color%2C%20thickness)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=BLimLEuj2.js.map
