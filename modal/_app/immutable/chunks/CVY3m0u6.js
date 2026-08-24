(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ab225a90-c876-45ff-8499-0dea8372a756`,e._sentryDebugIdIdentifier=`sentry-dbid-ab225a90-c876-45ff-8499-0dea8372a756`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Real-time object detection with WebRTC and YOLO`,id:`real-time-object-detection-with-webrtc-and-yolo`,children:[{depth:2,value:`What is WebRTC?`,id:`what-is-webrtc`,children:[{depth:3,value:`What makes up a WebRTC application?`,id:`what-makes-up-a-webrtc-application`}]},{depth:2,value:`How do I run a WebRTC app on Modal?`,id:`how-do-i-run-a-webrtc-app-on-modal`},{depth:2,value:`Detecting objects in webcam footage`,id:`detecting-objects-in-webcam-footage`,children:[{depth:3,value:`Setup`,id:`setup`},{depth:3,value:`Cache weights and compute graphs on a Volume`,id:`cache-weights-and-compute-graphs-on-a-volume`},{depth:3,value:`Implement YOLO object detection as a Pipecat GPU peer`,id:`implement-yolo-object-detection-as-a-pipecat-gpu-peer`},{depth:3,value:`Implement a signaling server`,id:`implement-a-signaling-server`}]},{depth:2,value:`Addenda`,id:`addenda`,children:[{depth:3,value:`ICE helpers`,id:`ice-helpers`},{depth:3,value:`YOLO helper functions`,id:`yolo-helper-functions`},{depth:3,value:`Testing a WebRTC application on Modal`,id:`testing-a-webrtc-application-on-modal`}]}]}],rawContent:`# Real-time object detection with WebRTC and YOLO

This example demonstrates how to architect a serverless real-time streaming application with Modal and WebRTC.
The sample application detects objects in webcam video with YOLO.

See the clip below from a live demo of this example in a course by [Kwindla Kramer](https://machine-theory.com/), WebRTC OG and co-founder of [Daily](https://www.daily.co/).

<center>
<video controls autoplay muted>
<source src="https://modal-cdn.com/example-webrtc_yolo.mp4" type="video/mp4">
</video>
</center>

You can also try our deployment [here](https://modal-labs-examples--example-webrtc-yolo-webcamobjdet-web.modal.run).

## What is WebRTC?

WebRTC (Web Real-Time Communication) is an [IETF Internet protocol](https://www.rfc-editor.org/rfc/rfc8825) and a [W3C API specification](https://www.w3.org/TR/webrtc/) for real-time media streaming between peers
over internets or the World Wide Web.
What makes it so effective and different from other bidirectional web-based communication protocols (e.g. WebSockets) is that it's purpose-built for media streaming in real time.
It's primarily designed for browser applications using the JavaScript API, but [APIs exist for other languages](https://www.webrtc-developers.com/did-i-choose-the-right-webrtc-stack/).
We'll build our app using Pipecat's [\`SmallWebRTCTransport\`](https://docs.pipecat.ai/api-reference/server/services/transport/small-webrtc).

### What makes up a WebRTC application?

A simple WebRTC app generally consists of three players:
1. a peer that initiates the connection,
2. a peer that responds to the connection, and
3. a server that passes some initial messages between the two peers.

First, one peer initiates the connection by offering up a description of itself - its media sources, codec capabilities, Internet Protocol (IP) addressing info, etc - which is relayed to another peer through the server.
The other peer then either accepts the offer by providing a compatible description of its own capabilities or rejects it if no compatible configuration is possible.
This process is called "signaling" or sometimes the "negotiation" in the WebRTC world, and the server that mediates it is usually called the "signaling server".

Once the peers have agreed on a configuration there's a brief pause to establish communication... and then you're live.

![Basic WebRTC architecture](https://modal-cdn.com/cdnbot/just_webrtc-1oic3iems_a4a8e77c.webp)
<small>A basic WebRTC app architecture</small>

Obviously there’s more going on under the hood.
If you want to get into the details, we recommend checking out the [RFCs](https://www.rfc-editor.org/rfc/rfc8825) or a [more-thorough explainer](https://webrtcforthecurious.com/).
In this document, we'll focus on how to architect a WebRTC application where one or more peer is running on Modal's serverless cloud infrastructure.

If you just want to quickly get started with WebRTC for a small internal service or a hack project, check out
[our FastRTC example](https://modal.com/docs/examples/fastrtc_flip_webcam) instead.

## How do I run a WebRTC app on Modal?

Modal turns Python code into scalable cloud services.
When you call a Modal Function, you get one replica.
If you call it 999 more times before it returns, you have 1000 replicas.
When your Functions all return, you spin down to 0 replicas.

The core constraints of the Modal programming model that make this possible are that Function Calls are stateless and self-contained.
In other words, correctly-written Modal Functions don't store information in memory between runs (though they might cache data to the ephemeral local disk for efficiency) and they don't create processes or tasks which must continue to run after the Function Call returns in order for the application to be correct.

WebRTC apps, on the other hand, require passing messages back and forth in a multi-step protocol, and APIs spawn several "agents" (no, AI is not involved, just processes) which do work behind the scenes - including managing the peer-to-peer (P2P) connection itself.
This means that streaming may have only just begun when the application logic in our Function has finished.

![Modal programming model and WebRTC signaling](https://modal-cdn.com/cdnbot/flow_comparisong6iibzq3_638bdd84.webp)
<small>Modal's stateless programming model (left) and WebRTC's stateful signaling (right)</small>

To ensure we properly leverage Modal's autoscaling and concurrency features, we need to align the signaling and streaming lifetimes with Modal Function Call lifetimes.

The architecture we recommend for this appears below.

![WebRTC on Modal](https://modal-cdn.com/cdnbot/webrtcdv9r193o_8efc6c14.webp)
<small>A clean architecture for WebRTC on Modal</small>

It handles passing messages between the client peer and the signaling server using
HTTP (\`POST /offer\`) within a single Function Call.
(Modal's Web layer maps HTTP onto Function Calls, details [here](https://modal.com/blog/serverless-http)).
We [\`.spawn\`](https://modal.com/docs/reference/modal.Function#spawn) the cloud peer inside the \`/offer\` endpoint
and pass the SDP offer through a [\`modal.Dict\`](https://modal.com/docs/reference/modal.Dict).

The signaling request returns as soon as the GPU peer publishes an SDP _answer_.
And when the P2P connection has been _closed_, we'll return from the call to the cloud peer.
That way, our WebRTC application benefits from all the autoscaling and concurrency logic built into Modal
that enables users to deliver efficient cloud applications.

Since Pipecat's \`SmallWebRTCTransport\` handles the aiortc peer connection, ICE, and media tracks,
the application code only has to implement the logic to receive video frames, run YOLO, and send annotated frames back.
Decorate the GPU peer with [\`app.cls\`](https://modal.com/docs/reference/modal.App#cls) and Modal [lifetime hooks](https://modal.com/docs/guide/lifecycle-functions), and you're ready to deploy on Modal.

## Detecting objects in webcam footage

For our WebRTC app, we'll take a client's video stream, run a [YOLO](https://docs.ultralytics.com/tasks/detect/) object detector on it with an A100 GPU on Modal, and then stream the annotated video back to the client.
With this setup, we can achieve inference times between 2-4 milliseconds per frame and RTTs below video frame rates (usually around 30 milliseconds per frame).

Let's get started!

### Setup

We'll start with a simple container [Image](https://modal.com/docs/guide/images) and then

- set it up to properly use TensorRT and the ONNX Runtime, which keep latency minimal,
- install the necessary libs for processing video, \`opencv\` and \`ffmpeg\`, and
- install Pipecat's WebRTC extra plus the necessary Python packages.

\`\`\`python
import asyncio
import os
import time
from pathlib import Path

import modal

py_version = "3.12"
tensorrt_ld_path = f"/usr/local/lib/python{py_version}/site-packages/tensorrt_libs"

VIDEO_WIDTH = 640
VIDEO_HEIGHT = 480
\`\`\`

First-run YOLO download + ONNX/TRT graph build can take a few minutes on an
empty volume; cached cold starts are ~15-20s. Bound the /offer wait either way.

\`\`\`python
ANSWER_TIMEOUT_SECS = 300.0
MINUTES = 60

video_processing_image = (
    modal.Image.debian_slim(python_version=py_version)  # matching ld path
    # update locale as required by onnx
    .apt_install("locales")
    .run_commands(
        "sed -i '/^#\\\\s*en_US.UTF-8 UTF-8/ s/^#//' /etc/locale.gen",  # use sed to uncomment
        "locale-gen en_US.UTF-8",  # set locale
        "update-locale LANG=en_US.UTF-8",
    )
    .env({"LD_LIBRARY_PATH": tensorrt_ld_path, "LANG": "en_US.UTF-8"})
    # install system dependencies
    .apt_install("python3-opencv", "ffmpeg")
    # install Python dependencies
    .uv_pip_install(
        "pipecat-ai[webrtc]==1.5.0",
        "fastapi==0.115.12",
        "huggingface-hub[hf_xet]==0.30.2",
        "onnxruntime-gpu==1.21.0",
        "opencv-python==4.11.0.86",
        "tensorrt==10.9.0.34",
        "torch==2.7.0",
    )
)

\`\`\`

### Cache weights and compute graphs on a Volume

We also need to create a Modal [Volume](https://modal.com/docs/guide/volumes) to store things we need across replicas --
primarily the model weights and ONNX inference graph, but also a few other artifacts like a video file where
we'll write out the processed video stream for testing. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

The very first time we run the app, downloading the model and building the ONNX inference graph will take a few minutes.
After that, we can load the cached weights and graph from the Volume, which reduces the startup time to about 15 seconds per container.

\`\`\`python
CACHE_VOLUME = modal.Volume.from_name("webrtc-yolo-cache", create_if_missing=True)
CACHE_PATH = Path("/cache")
cache = {CACHE_PATH: CACHE_VOLUME}

app = modal.App("example-webrtc-yolo")

\`\`\`

### Implement YOLO object detection as a Pipecat GPU peer

Our application needs to process an incoming video track with YOLO and return an annotated video track to the source peer.

To implement the GPU peer, we need to:

- Decorate our class with \`@app.cls\`. We provision it with an A100 GPU.
- Load YOLO in \`@modal.enter()\` so it happens once per container.
- Implement \`run_pipeline\`. This is where we wire Pipecat's \`SmallWebRTCTransport\`
to a \`YOLOProcessor\` that annotates each frame and returns it to the source peer.
The pipeline is three stages: \`transport.input()\` → \`YOLOProcessor\` → \`transport.output()\`.

We haven't talked about [TURN servers](https://datatracker.ietf.org/doc/html/rfc5766),
but just know that they're necessary if you want to use WebRTC across complex (e.g. carrier-grade) NAT or firewall configurations.
Free services have tight limits because TURN servers are expensive to run (lots of bandwidth and state management required).
[STUN](https://datatracker.ietf.org/doc/html/rfc5389) servers, on the other hand, are essentially just echo servers, and so there are many free services available.
If you don't provide TURN servers you can still serve your app on many networks using any of a number of free STUN servers for NAT traversal.

ICE servers are passed through the signaling \`modal.Dict\`.
STUN mode needs no credentials and works on many networks.
If STUN isn't enough, TURN mode uses the free
[Open Relay TURN server](https://www.metered.ca/tools/openrelay/) via a small CPU
Function that mounts a Modal [Secret](https://modal.com/docs/guide/secrets) called
\`turn-credentials\` (create the Secret [here](https://modal.com/secrets) after
signing up [here](https://dashboard.metered.ca/login?tool=turnserver)).
For production or stubborn NATs, consider a managed provider like [Daily](https://www.daily.co/) that operates TURN for you.
We also use the \`@modal.concurrent\` decorator to allow multiple instances of our peer to run on one GPU.

**Setting the Region**

Much of the latency in Internet applications comes from distance between communicating parties --
the Internet operates within a factor of two of the speed of light, but that's just not that fast.
To minimize latency under this constraint, the physical distance of the P2P connection
between the webcam-using peer and the GPU container needs to be kept as short as possible.
We'll use the \`region\` parameter of the \`cls\` decorator to set the region of the GPU container.
You should set this to the closest region to your users.
See the [region selection](https://modal.com/docs/guide/region-selection) guide for more information.

\`\`\`python
@app.cls(
    image=video_processing_image,
    gpu="A100-40GB",
    volumes=cache,
    region="us-east",  # set to your region
    timeout=30 * MINUTES,
)
@modal.concurrent(
    target_inputs=2,  # try to stick to just two peers per GPU container
    max_inputs=3,  # but allow up to three
)
class ObjDet:
    @modal.enter()
    def load_model(self):
        self.yolo_model = get_yolo_model(CACHE_PATH)

    @modal.method()
    async def run_pipeline(self, d: modal.Dict):
        from pipecat.pipeline.pipeline import Pipeline
        from pipecat.pipeline.worker import PipelineWorker
        from pipecat.transports.base_transport import TransportParams
        from pipecat.transports.smallwebrtc.connection import (
            IceServer,
            SmallWebRTCConnection,
        )
        from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
        from pipecat.workers.runner import WorkerRunner

        offer = await d.get.aio("offer")
        ice_servers = [
            IceServer(**ice_server) for ice_server in await d.get.aio("ice_servers")
        ]

        webrtc_connection = SmallWebRTCConnection(ice_servers)
        await webrtc_connection.initialize(sdp=offer["sdp"], type=offer["type"])

        transport = SmallWebRTCTransport(
            webrtc_connection=webrtc_connection,
            params=TransportParams(
                audio_in_enabled=False,
                audio_out_enabled=False,
                video_in_enabled=True,
                video_out_enabled=True,
                video_out_is_live=True,
                video_out_width=VIDEO_WIDTH,
                video_out_height=VIDEO_HEIGHT,
            ),
        )

        pipeline = Pipeline(
            [
                transport.input(),
                get_yolo_processor(self.yolo_model),
                transport.output(),
            ]
        )
        # Pipecat defaults assume a voice agent (idle cancel on missing speech frames,
        # RTVI to the client). This is a video-only pipeline with a plain browser client.
        worker = PipelineWorker(
            pipeline,
            idle_timeout_secs=None,
            enable_rtvi=False,
            enable_turn_tracking=False,
        )

        async def end_session(reason: str):
            print(f"Video Processor connection {webrtc_connection.pc_id}: {reason}")
            await worker.cancel()

        @transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            print(
                f"Video Processor connection {webrtc_connection.pc_id}: client connected"
            )
            await transport.capture_participant_video("camera")

        @transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            await end_session("client disconnected")

        @webrtc_connection.event_handler("failed")
        async def on_failed(connection):
            await end_session("connection failed")

        @webrtc_connection.event_handler("closed")
        async def on_closed(connection):
            await end_session("connection closed")

        answer = webrtc_connection.get_answer()
        if answer is None:
            raise RuntimeError("Pipecat produced no SDP answer after initialize()")
        await d.put.aio("answer", answer)

        runner = WorkerRunner(handle_sigint=False)
        await runner.add_workers(worker)
        await runner.run()


\`\`\`

### Implement a signaling server

The signaling server is much simpler.
It serves the browser UI and \`POST /offer\`. On each offer it spawns \`ObjDet.run_pipeline\`
and waits for the SDP answer on a [\`modal.Dict\`](https://modal.com/docs/reference/modal.Dict).

The server is the source of ICE config: clients POST \`ice_server_type\`
(\`stun\` or \`turn\`) with the SDP offer; the server builds ICE servers once for
the GPU peer and exposes the same list on \`GET /ice-servers\` for the browser.

We'll also mount a frontend which uses the WebRTC JavaScript API to stream a peer's webcam from the browser.
The JavaScript and HTML files are alongside this example in the [Github repo](https://github.com/modal-labs/modal-examples/tree/main/07_web/webrtc/frontend).

\`\`\`python
this_directory = Path(__file__).parent.resolve()
server_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("fastapi[standard]==0.115.12")
    .add_local_dir(this_directory / "frontend", remote_path="/frontend")
)


@app.cls(image=server_image, timeout=10 * MINUTES)
class WebcamObjDet:
    @modal.asgi_app()
    def web(self):
        from fastapi import FastAPI, HTTPException, Request
        from fastapi.responses import HTMLResponse
        from fastapi.staticfiles import StaticFiles

        web_app = FastAPI()
        web_app.mount("/static", StaticFiles(directory="/frontend"))

        @web_app.get("/")
        async def root():
            html = open("/frontend/index.html").read()
            return HTMLResponse(content=html)

        @web_app.get("/ice-servers")
        async def ice_servers(mode: str = "stun"):
            try:
                return {
                    "ice_servers": await resolve_ice_servers(use_turn=(mode == "turn"))
                }
            except Exception as e:
                raise HTTPException(status_code=503, detail=str(e)) from e

        @web_app.post("/offer")
        async def offer(request: Request):
            body = await request.json()
            sdp = body.get("sdp")
            offer_type = body.get("type")
            if not sdp or not offer_type:
                raise HTTPException(status_code=400, detail="missing sdp or type")

            use_turn = body.get("ice_server_type") == "turn"
            try:
                ice_servers = await resolve_ice_servers(use_turn=use_turn)
            except Exception as e:
                raise HTTPException(status_code=503, detail=str(e)) from e

            async with modal.Dict.ephemeral() as d:
                await d.put.aio("ice_servers", ice_servers)
                await d.put.aio("offer", {"sdp": sdp, "type": offer_type})

                call = await ObjDet().run_pipeline.spawn.aio(d)
                deadline = time.monotonic() + ANSWER_TIMEOUT_SECS
                try:
                    while True:
                        if await request.is_disconnected():
                            raise HTTPException(
                                status_code=499, detail="client disconnected"
                            )
                        answer = await d.get.aio("answer")
                        if answer is not None:
                            return answer

                        # Fail fast if the GPU peer exited; re-read answer first in case
                        # it was published in the gap between the get above and call.get.
                        peer_done = False
                        peer_error = None
                        try:
                            await call.get.aio(timeout=0)
                        except TimeoutError:
                            pass
                        except Exception as e:
                            peer_done = True
                            peer_error = e
                        else:
                            peer_done = True

                        if peer_done:
                            answer = await d.get.aio("answer")
                            if answer is not None:
                                return answer
                            if peer_error is not None:
                                raise HTTPException(
                                    status_code=502,
                                    detail=f"GPU peer failed before SDP answer: {peer_error}",
                                ) from peer_error
                            raise HTTPException(
                                status_code=502,
                                detail="GPU peer finished without SDP answer",
                            )

                        if time.monotonic() >= deadline:
                            raise HTTPException(
                                status_code=504,
                                detail="timed out waiting for SDP answer",
                            )
                        await asyncio.sleep(0.1)
                except BaseException:
                    await call.cancel.aio()
                    raise

        return web_app


\`\`\`

## Addenda

The remainder of this page is not central to running a WebRTC application on Modal,
but is included for completeness.

### ICE helpers

STUN is a public Google server. TURN credentials come from the \`turn-credentials\` Secret
via a small CPU Function so the signaling Cls itself doesn't need to know the credentials in STUN mode.

\`\`\`python
def ice_servers_for_mode(use_turn: bool) -> list[dict]:
    stun = [{"urls": "stun:stun.l.google.com:19302"}]
    if not use_turn:
        return stun

    username = os.environ.get("TURN_USERNAME")
    credential = os.environ.get("TURN_CREDENTIAL")
    if not username or not credential:
        raise RuntimeError(
            "TURN mode needs Modal Secret 'turn-credentials' "
            "(TURN_USERNAME, TURN_CREDENTIAL)"
        )
    creds = {"username": username, "credential": credential}
    return [
        {"urls": "stun:stun.relay.metered.ca:80"},  # STUN is free, no creds needed
        # for TURN, sign up for the free service here: https://www.metered.ca/tools/openrelay/
        {"urls": "turn:standard.relay.metered.ca:80"} | creds,
        {"urls": "turn:standard.relay.metered.ca:80?transport=tcp"} | creds,
        {"urls": "turn:standard.relay.metered.ca:443"} | creds,
        {"urls": "turns:standard.relay.metered.ca:443?transport=tcp"} | creds,
    ]


@app.function(
    image=modal.Image.debian_slim(python_version="3.12"),
    secrets=[modal.Secret.from_name("turn-credentials")],
)
def lookup_turn_ice_servers() -> list[dict]:
    return ice_servers_for_mode(use_turn=True)


async def resolve_ice_servers(*, use_turn: bool) -> list[dict]:
    if use_turn:
        return await lookup_turn_ice_servers.remote.aio()
    return ice_servers_for_mode(use_turn=False)


\`\`\`

### YOLO helper functions

The two helpers below set up the YOLO model and create our custom Pipecat frame processor.

The first, \`get_yolo_model\`, sets up the ONNXRuntime and loads the model weights.
We call this in the \`@modal.enter()\` method of \`ObjDet\`
so that it only happens once per container.

\`\`\`python
def get_yolo_model(cache_path):
    import onnxruntime

    from .yolo import YOLOv10

    onnxruntime.preload_dlls()
    return YOLOv10(cache_path)


\`\`\`

The second, \`get_yolo_processor\`, creates a custom Pipecat \`FrameProcessor\` that
performs object detection on each video frame.
We call this in \`run_pipeline\` so it happens once per peer connection.
Annotated frames leave the processor at the incoming frame size; the transport then
emits them at \`VIDEO_WIDTH\` × \`VIDEO_HEIGHT\`.

\`\`\`python
def get_yolo_processor(yolo_model):
    import cv2
    import numpy as np
    from pipecat.frames.frames import InputImageRawFrame, OutputImageRawFrame
    from pipecat.processors.frame_processor import FrameProcessor

    class YOLOProcessor(FrameProcessor):
        conf_threshold = 0.15

        def __init__(self, model):
            super().__init__()
            self.yolo_model = model

        # this is the essential method we need to implement
        # to create a custom FrameProcessor
        async def process_frame(self, frame, direction):
            await super().process_frame(frame, direction)

            if not isinstance(frame, InputImageRawFrame):
                await self.push_frame(frame, direction)
                return

            width, height = frame.size
            image = np.frombuffer(frame.image, dtype=np.uint8).reshape(
                (height, width, 3)
            )
            if frame.format == "RGB":
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            resized = cv2.resize(
                image,
                (self.yolo_model.input_width, self.yolo_model.input_height),
            )
            detected = self.yolo_model.detect_objects(resized, self.conf_threshold)
            out = cv2.resize(detected, (width, height))
            out_rgb = cv2.cvtColor(out, cv2.COLOR_BGR2RGB)
            await self.push_frame(
                OutputImageRawFrame(
                    image=out_rgb.tobytes(),
                    size=(width, height),
                    format="RGB",
                )
            )

    return YOLOProcessor(yolo_model)


\`\`\`

### Testing a WebRTC application on Modal

As any seasoned developer of real-time applications on the Web will tell you,
testing and ensuring correctness is quite difficult. We spent nearly as much time
designing and troubleshooting an appropriate testing process for this application as we did writing
the application itself!

You can find the testing code in the GitHub repository [here](https://github.com/modal-labs/modal-examples/tree/main/07_web/webrtc/webrtc_yolo_test.py).
`,meta:{title:`Real-time object detection with WebRTC and YOLO`,description:`This example demonstrates how to architect a serverless real-time streaming application with Modal and WebRTC. The sample application detects objects in webcam video with YOLO.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>SmallWebRTCTransport</code>`),ae=t(`<code>.spawn</code>`),oe=t(`<code>modal.Dict</code>`),se=t(`<code>app.cls</code>`),ce=t(`<code>modal.Dict</code>`),le=t(`<!> <p>This example demonstrates how to architect a serverless real-time streaming application with Modal and WebRTC.
The sample application detects objects in webcam video with YOLO.</p> <p>See the clip below from a live demo of this example in a course by <!>, WebRTC OG and co-founder of <!>.</p> <center><video controls autoplay><source src="https://modal-cdn.com/example-webrtc_yolo.mp4" type="video/mp4"/></video></center> <p>You can also try our deployment <!>.</p> <!> <p>WebRTC (Web Real-Time Communication) is an <!> and a <!> for real-time media streaming between peers
over internets or the World Wide Web.
What makes it so effective and different from other bidirectional web-based communication protocols (e.g. WebSockets) is that it’s purpose-built for media streaming in real time.
It’s primarily designed for browser applications using the JavaScript API, but <!>.
We’ll build our app using Pipecat’s <!>.</p> <!> <p>A simple WebRTC app generally consists of three players:</p> <ol><li>a peer that initiates the connection,</li> <li>a peer that responds to the connection, and</li> <li>a server that passes some initial messages between the two peers.</li></ol> <p>First, one peer initiates the connection by offering up a description of itself - its media sources, codec capabilities, Internet Protocol (IP) addressing info, etc - which is relayed to another peer through the server.
The other peer then either accepts the offer by providing a compatible description of its own capabilities or rejects it if no compatible configuration is possible.
This process is called “signaling” or sometimes the “negotiation” in the WebRTC world, and the server that mediates it is usually called the “signaling server”.</p> <p>Once the peers have agreed on a configuration there’s a brief pause to establish communication… and then you’re live.</p> <p><!></p> <small>A basic WebRTC app architecture</small> <p>Obviously there’s more going on under the hood.
If you want to get into the details, we recommend checking out the <!> or a <!>.
In this document, we’ll focus on how to architect a WebRTC application where one or more peer is running on Modal’s serverless cloud infrastructure.</p> <p>If you just want to quickly get started with WebRTC for a small internal service or a hack project, check out <!> instead.</p> <!> <p>Modal turns Python code into scalable cloud services.
When you call a Modal Function, you get one replica.
If you call it 999 more times before it returns, you have 1000 replicas.
When your Functions all return, you spin down to 0 replicas.</p> <p>The core constraints of the Modal programming model that make this possible are that Function Calls are stateless and self-contained.
In other words, correctly-written Modal Functions don’t store information in memory between runs (though they might cache data to the ephemeral local disk for efficiency) and they don’t create processes or tasks which must continue to run after the Function Call returns in order for the application to be correct.</p> <p>WebRTC apps, on the other hand, require passing messages back and forth in a multi-step protocol, and APIs spawn several “agents” (no, AI is not involved, just processes) which do work behind the scenes - including managing the peer-to-peer (P2P) connection itself.
This means that streaming may have only just begun when the application logic in our Function has finished.</p> <p><!></p> <small>Modal's stateless programming model (left) and WebRTC's stateful signaling (right)</small> <p>To ensure we properly leverage Modal’s autoscaling and concurrency features, we need to align the signaling and streaming lifetimes with Modal Function Call lifetimes.</p> <p>The architecture we recommend for this appears below.</p> <p><!></p> <small>A clean architecture for WebRTC on Modal</small> <p>It handles passing messages between the client peer and the signaling server using
HTTP (<code>POST /offer</code>) within a single Function Call.
(Modal’s Web layer maps HTTP onto Function Calls, details <!>).
We <!> the cloud peer inside the <code>/offer</code> endpoint
and pass the SDP offer through a <!>.</p> <p>The signaling request returns as soon as the GPU peer publishes an SDP <em>answer</em>.
And when the P2P connection has been <em>closed</em>, we’ll return from the call to the cloud peer.
That way, our WebRTC application benefits from all the autoscaling and concurrency logic built into Modal
that enables users to deliver efficient cloud applications.</p> <p>Since Pipecat’s <code>SmallWebRTCTransport</code> handles the aiortc peer connection, ICE, and media tracks,
the application code only has to implement the logic to receive video frames, run YOLO, and send annotated frames back.
Decorate the GPU peer with <!> and Modal <!>, and you’re ready to deploy on Modal.</p> <!> <p>For our WebRTC app, we’ll take a client’s video stream, run a <!> object detector on it with an A100 GPU on Modal, and then stream the annotated video back to the client.
With this setup, we can achieve inference times between 2-4 milliseconds per frame and RTTs below video frame rates (usually around 30 milliseconds per frame).</p> <p>Let’s get started!</p> <!> <p>We’ll start with a simple container <!> and then</p> <ul><li>set it up to properly use TensorRT and the ONNX Runtime, which keep latency minimal,</li> <li>install the necessary libs for processing video, <code>opencv</code> and <code>ffmpeg</code>, and</li> <li>install Pipecat’s WebRTC extra plus the necessary Python packages.</li></ul> <!> <p>First-run YOLO download + ONNX/TRT graph build can take a few minutes on an
empty volume; cached cold starts are ~15-20s. Bound the /offer wait either way.</p> <!> <!> <p>We also need to create a Modal <!> to store things we need across replicas —
primarily the model weights and ONNX inference graph, but also a few other artifacts like a video file where
we’ll write out the processed video stream for testing. For more on storing model weights on Modal, see <!>.</p> <p>The very first time we run the app, downloading the model and building the ONNX inference graph will take a few minutes.
After that, we can load the cached weights and graph from the Volume, which reduces the startup time to about 15 seconds per container.</p> <!> <!> <p>Our application needs to process an incoming video track with YOLO and return an annotated video track to the source peer.</p> <p>To implement the GPU peer, we need to:</p> <ul><li>Decorate our class with <code>@app.cls</code>. We provision it with an A100 GPU.</li> <li>Load YOLO in <code>@modal.enter()</code> so it happens once per container.</li> <li>Implement <code>run_pipeline</code>. This is where we wire Pipecat’s <code>SmallWebRTCTransport</code> to a <code>YOLOProcessor</code> that annotates each frame and returns it to the source peer.
The pipeline is three stages: <code>transport.input()</code> → <code>YOLOProcessor</code> → <code>transport.output()</code>.</li></ul> <p>We haven’t talked about <!>,
but just know that they’re necessary if you want to use WebRTC across complex (e.g. carrier-grade) NAT or firewall configurations.
Free services have tight limits because TURN servers are expensive to run (lots of bandwidth and state management required). <!> servers, on the other hand, are essentially just echo servers, and so there are many free services available.
If you don’t provide TURN servers you can still serve your app on many networks using any of a number of free STUN servers for NAT traversal.</p> <p>ICE servers are passed through the signaling <code>modal.Dict</code>.
STUN mode needs no credentials and works on many networks.
If STUN isn’t enough, TURN mode uses the free <!> via a small CPU
Function that mounts a Modal <!> called <code>turn-credentials</code> (create the Secret <!> after
signing up <!>).
For production or stubborn NATs, consider a managed provider like <!> that operates TURN for you.
We also use the <code>@modal.concurrent</code> decorator to allow multiple instances of our peer to run on one GPU.</p> <p><strong>Setting the Region</strong></p> <p>Much of the latency in Internet applications comes from distance between communicating parties —
the Internet operates within a factor of two of the speed of light, but that’s just not that fast.
To minimize latency under this constraint, the physical distance of the P2P connection
between the webcam-using peer and the GPU container needs to be kept as short as possible.
We’ll use the <code>region</code> parameter of the <code>cls</code> decorator to set the region of the GPU container.
You should set this to the closest region to your users.
See the <!> guide for more information.</p> <!> <!> <p>The signaling server is much simpler.
It serves the browser UI and <code>POST /offer</code>. On each offer it spawns <code>ObjDet.run_pipeline</code> and waits for the SDP answer on a <!>.</p> <p>The server is the source of ICE config: clients POST <code>ice_server_type</code> (<code>stun</code> or <code>turn</code>) with the SDP offer; the server builds ICE servers once for
the GPU peer and exposes the same list on <code>GET /ice-servers</code> for the browser.</p> <p>We’ll also mount a frontend which uses the WebRTC JavaScript API to stream a peer’s webcam from the browser.
The JavaScript and HTML files are alongside this example in the <!>.</p> <!> <!> <p>The remainder of this page is not central to running a WebRTC application on Modal,
but is included for completeness.</p> <!> <p>STUN is a public Google server. TURN credentials come from the <code>turn-credentials</code> Secret
via a small CPU Function so the signaling Cls itself doesn’t need to know the credentials in STUN mode.</p> <!> <!> <p>The two helpers below set up the YOLO model and create our custom Pipecat frame processor.</p> <p>The first, <code>get_yolo_model</code>, sets up the ONNXRuntime and loads the model weights.
We call this in the <code>@modal.enter()</code> method of <code>ObjDet</code> so that it only happens once per container.</p> <!> <p>The second, <code>get_yolo_processor</code>, creates a custom Pipecat <code>FrameProcessor</code> that
performs object detection on each video frame.
We call this in <code>run_pipeline</code> so it happens once per peer connection.
Annotated frames leave the processor at the incoming frame size; the transport then
emits them at <code>VIDEO_WIDTH</code> × <code>VIDEO_HEIGHT</code>.</p> <!> <!> <p>As any seasoned developer of real-time applications on the Web will tell you,
testing and ensuring correctness is quite difficult. We spent nearly as much time
designing and troubleshooting an appropriate testing process for this application as we did writing
the application itself!</p> <p>You can find the testing code in the GitHub repository <!>.</p>`,3);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=le(),f=te(a);ne(f,{id:`real-time-object-detection-with-webrtc-and-yolo`,children:(e,t)=>{s(),i(e,r(`Real-time object detection with WebRTC and YOLO`))},$$slots:{default:!0}});var m=o(f,4),h=o(e(m));p(h,{href:`https://machine-theory.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Kwindla Kramer`))},$$slots:{default:!0}}),p(o(h,2),{href:`https://www.daily.co/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Daily`))},$$slots:{default:!0}}),s(),n(m);var g=o(m,2),re=e(g);re.muted=!0,n(g);var _=o(g,2);p(o(e(_)),{href:`https://modal-labs-examples--example-webrtc-yolo-webcamobjdet-web.modal.run`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(_);var v=o(_,2);c(v,{id:`what-is-webrtc`,children:(e,t)=>{s(),i(e,r(`What is WebRTC?`))},$$slots:{default:!0}});var y=o(v,2),b=o(e(y));p(b,{href:`https://www.rfc-editor.org/rfc/rfc8825`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`IETF Internet protocol`))},$$slots:{default:!0}});var ue=o(b,2);p(ue,{href:`https://www.w3.org/TR/webrtc/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`W3C API specification`))},$$slots:{default:!0}});var de=o(ue,2);p(de,{href:`https://www.webrtc-developers.com/did-i-choose-the-right-webrtc-stack/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`APIs exist for other languages`))},$$slots:{default:!0}}),p(o(de,2),{href:`https://docs.pipecat.ai/api-reference/server/services/transport/small-webrtc`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(y);var fe=o(y,2);l(fe,{id:`what-makes-up-a-webrtc-application`,children:(e,t)=>{s(),i(e,r(`What makes up a WebRTC application?`))},$$slots:{default:!0}});var x=o(fe,10);u(e(x),{src:`https://modal-cdn.com/cdnbot/just_webrtc-1oic3iems_a4a8e77c.webp`,alt:`Basic WebRTC architecture`}),n(x);var S=o(x,4),C=o(e(S));p(C,{href:`https://www.rfc-editor.org/rfc/rfc8825`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFCs`))},$$slots:{default:!0}}),p(o(C,2),{href:`https://webrtcforthecurious.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`more-thorough explainer`))},$$slots:{default:!0}}),s(),n(S);var w=o(S,2);p(o(e(w)),{href:`https://modal.com/docs/examples/fastrtc_flip_webcam`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`our FastRTC example`))},$$slots:{default:!0}}),s(),n(w);var T=o(w,2);c(T,{id:`how-do-i-run-a-webrtc-app-on-modal`,children:(e,t)=>{s(),i(e,r(`How do I run a WebRTC app on Modal?`))},$$slots:{default:!0}});var E=o(T,8);u(e(E),{src:`https://modal-cdn.com/cdnbot/flow_comparisong6iibzq3_638bdd84.webp`,alt:`Modal programming model and WebRTC signaling`}),n(E);var D=o(E,8);u(e(D),{src:`https://modal-cdn.com/cdnbot/webrtcdv9r193o_8efc6c14.webp`,alt:`WebRTC on Modal`}),n(D);var O=o(D,4),k=o(e(O),3);p(k,{href:`https://modal.com/blog/serverless-http`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}});var A=o(k,2);p(A,{href:`https://modal.com/docs/reference/modal.Function#spawn`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),p(o(A,4),{href:`https://modal.com/docs/reference/modal.Dict`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(O);var j=o(O,4),M=o(e(j),3);p(M,{href:`https://modal.com/docs/reference/modal.App#cls`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),p(o(M,2),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`lifetime hooks`))},$$slots:{default:!0}}),s(),n(j);var N=o(j,2);c(N,{id:`detecting-objects-in-webcam-footage`,children:(e,t)=>{s(),i(e,r(`Detecting objects in webcam footage`))},$$slots:{default:!0}});var P=o(N,2);p(o(e(P)),{href:`https://docs.ultralytics.com/tasks/detect/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`YOLO`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);l(F,{id:`setup`,children:(e,t)=>{s(),i(e,r(`Setup`))},$$slots:{default:!0}});var I=o(F,2);p(o(e(I)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Image`))},$$slots:{default:!0}}),s(),n(I);var L=o(I,4);d(L,{code:`import%20asyncio%0Aimport%20os%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Apy_version%20%3D%20%223.12%22%0Atensorrt_ld_path%20%3D%20f%22%2Fusr%2Flocal%2Flib%2Fpython%7Bpy_version%7D%2Fsite-packages%2Ftensorrt_libs%22%0A%0AVIDEO_WIDTH%20%3D%20640%0AVIDEO_HEIGHT%20%3D%20480`,lang:`python`});var R=o(L,4);d(R,{code:`ANSWER_TIMEOUT_SECS%20%3D%20300.0%0AMINUTES%20%3D%2060%0A%0Avideo_processing_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3Dpy_version)%20%20%23%20matching%20ld%20path%0A%20%20%20%20%23%20update%20locale%20as%20required%20by%20onnx%0A%20%20%20%20.apt_install(%22locales%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22sed%20-i%20'%2F%5E%23%5C%5Cs*en_US.UTF-8%20UTF-8%2F%20s%2F%5E%23%2F%2F'%20%2Fetc%2Flocale.gen%22%2C%20%20%23%20use%20sed%20to%20uncomment%0A%20%20%20%20%20%20%20%20%22locale-gen%20en_US.UTF-8%22%2C%20%20%23%20set%20locale%0A%20%20%20%20%20%20%20%20%22update-locale%20LANG%3Den_US.UTF-8%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22LD_LIBRARY_PATH%22%3A%20tensorrt_ld_path%2C%20%22LANG%22%3A%20%22en_US.UTF-8%22%7D)%0A%20%20%20%20%23%20install%20system%20dependencies%0A%20%20%20%20.apt_install(%22python3-opencv%22%2C%20%22ffmpeg%22)%0A%20%20%20%20%23%20install%20Python%20dependencies%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22pipecat-ai%5Bwebrtc%5D%3D%3D1.5.0%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%3D%3D0.115.12%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%5Bhf_xet%5D%3D%3D0.30.2%22%2C%0A%20%20%20%20%20%20%20%20%22onnxruntime-gpu%3D%3D1.21.0%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python%3D%3D4.11.0.86%22%2C%0A%20%20%20%20%20%20%20%20%22tensorrt%3D%3D10.9.0.34%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.0%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var z=o(R,2);l(z,{id:`cache-weights-and-compute-graphs-on-a-volume`,children:(e,t)=>{s(),i(e,r(`Cache weights and compute graphs on a Volume`))},$$slots:{default:!0}});var B=o(z,2),V=o(e(B));p(V,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),p(o(V,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(B);var H=o(B,4);d(H,{code:`CACHE_VOLUME%20%3D%20modal.Volume.from_name(%22webrtc-yolo-cache%22%2C%20create_if_missing%3DTrue)%0ACACHE_PATH%20%3D%20Path(%22%2Fcache%22)%0Acache%20%3D%20%7BCACHE_PATH%3A%20CACHE_VOLUME%7D%0A%0Aapp%20%3D%20modal.App(%22example-webrtc-yolo%22)%0A`,lang:`python`});var U=o(H,2);l(U,{id:`implement-yolo-object-detection-as-a-pipecat-gpu-peer`,children:(e,t)=>{s(),i(e,r(`Implement YOLO object detection as a Pipecat GPU peer`))},$$slots:{default:!0}});var W=o(U,8),G=o(e(W));p(G,{href:`https://datatracker.ietf.org/doc/html/rfc5766`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TURN servers`))},$$slots:{default:!0}}),p(o(G,2),{href:`https://datatracker.ietf.org/doc/html/rfc5389`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`STUN`))},$$slots:{default:!0}}),s(),n(W);var K=o(W,2),pe=o(e(K),3);p(pe,{href:`https://www.metered.ca/tools/openrelay/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Open Relay TURN server`))},$$slots:{default:!0}});var q=o(pe,2);p(q,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Secret`))},$$slots:{default:!0}});var J=o(q,4);p(J,{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}});var Y=o(J,2);p(Y,{href:`https://dashboard.metered.ca/login?tool=turnserver`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),p(o(Y,2),{href:`https://www.daily.co/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Daily`))},$$slots:{default:!0}}),s(3),n(K);var X=o(K,4);p(o(e(X),5),{href:`https://modal.com/docs/guide/region-selection`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`region selection`))},$$slots:{default:!0}}),s(),n(X);var me=o(X,2);d(me,{code:`%40app.cls(%0A%20%20%20%20image%3Dvideo_processing_image%2C%0A%20%20%20%20gpu%3D%22A100-40GB%22%2C%0A%20%20%20%20volumes%3Dcache%2C%0A%20%20%20%20region%3D%22us-east%22%2C%20%20%23%20set%20to%20your%20region%0A%20%20%20%20timeout%3D30%20*%20MINUTES%2C%0A)%0A%40modal.concurrent(%0A%20%20%20%20target_inputs%3D2%2C%20%20%23%20try%20to%20stick%20to%20just%20two%20peers%20per%20GPU%20container%0A%20%20%20%20max_inputs%3D3%2C%20%20%23%20but%20allow%20up%20to%20three%0A)%0Aclass%20ObjDet%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20self.yolo_model%20%3D%20get_yolo_model(CACHE_PATH)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20run_pipeline(self%2C%20d%3A%20modal.Dict)%3A%0A%20%20%20%20%20%20%20%20from%20pipecat.pipeline.pipeline%20import%20Pipeline%0A%20%20%20%20%20%20%20%20from%20pipecat.pipeline.worker%20import%20PipelineWorker%0A%20%20%20%20%20%20%20%20from%20pipecat.transports.base_transport%20import%20TransportParams%0A%20%20%20%20%20%20%20%20from%20pipecat.transports.smallwebrtc.connection%20import%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20IceServer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20SmallWebRTCConnection%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20from%20pipecat.transports.smallwebrtc.transport%20import%20SmallWebRTCTransport%0A%20%20%20%20%20%20%20%20from%20pipecat.workers.runner%20import%20WorkerRunner%0A%0A%20%20%20%20%20%20%20%20offer%20%3D%20await%20d.get.aio(%22offer%22)%0A%20%20%20%20%20%20%20%20ice_servers%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20IceServer(**ice_server)%20for%20ice_server%20in%20await%20d.get.aio(%22ice_servers%22)%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20webrtc_connection%20%3D%20SmallWebRTCConnection(ice_servers)%0A%20%20%20%20%20%20%20%20await%20webrtc_connection.initialize(sdp%3Doffer%5B%22sdp%22%5D%2C%20type%3Doffer%5B%22type%22%5D)%0A%0A%20%20%20%20%20%20%20%20transport%20%3D%20SmallWebRTCTransport(%0A%20%20%20%20%20%20%20%20%20%20%20%20webrtc_connection%3Dwebrtc_connection%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20params%3DTransportParams(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_in_enabled%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_out_enabled%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_in_enabled%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_out_enabled%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_out_is_live%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_out_width%3DVIDEO_WIDTH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_out_height%3DVIDEO_HEIGHT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20pipeline%20%3D%20Pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20transport.input()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20get_yolo_processor(self.yolo_model)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20transport.output()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20Pipecat%20defaults%20assume%20a%20voice%20agent%20(idle%20cancel%20on%20missing%20speech%20frames%2C%0A%20%20%20%20%20%20%20%20%23%20RTVI%20to%20the%20client).%20This%20is%20a%20video-only%20pipeline%20with%20a%20plain%20browser%20client.%0A%20%20%20%20%20%20%20%20worker%20%3D%20PipelineWorker(%0A%20%20%20%20%20%20%20%20%20%20%20%20pipeline%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20idle_timeout_secs%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20enable_rtvi%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20enable_turn_tracking%3DFalse%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20async%20def%20end_session(reason%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Video%20Processor%20connection%20%7Bwebrtc_connection.pc_id%7D%3A%20%7Breason%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20worker.cancel()%0A%0A%20%20%20%20%20%20%20%20%40transport.event_handler(%22on_client_connected%22)%0A%20%20%20%20%20%20%20%20async%20def%20on_client_connected(transport%2C%20client)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Video%20Processor%20connection%20%7Bwebrtc_connection.pc_id%7D%3A%20client%20connected%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20transport.capture_participant_video(%22camera%22)%0A%0A%20%20%20%20%20%20%20%20%40transport.event_handler(%22on_client_disconnected%22)%0A%20%20%20%20%20%20%20%20async%20def%20on_client_disconnected(transport%2C%20client)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20end_session(%22client%20disconnected%22)%0A%0A%20%20%20%20%20%20%20%20%40webrtc_connection.event_handler(%22failed%22)%0A%20%20%20%20%20%20%20%20async%20def%20on_failed(connection)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20end_session(%22connection%20failed%22)%0A%0A%20%20%20%20%20%20%20%20%40webrtc_connection.event_handler(%22closed%22)%0A%20%20%20%20%20%20%20%20async%20def%20on_closed(connection)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20end_session(%22connection%20closed%22)%0A%0A%20%20%20%20%20%20%20%20answer%20%3D%20webrtc_connection.get_answer()%0A%20%20%20%20%20%20%20%20if%20answer%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%22Pipecat%20produced%20no%20SDP%20answer%20after%20initialize()%22)%0A%20%20%20%20%20%20%20%20await%20d.put.aio(%22answer%22%2C%20answer)%0A%0A%20%20%20%20%20%20%20%20runner%20%3D%20WorkerRunner(handle_sigint%3DFalse)%0A%20%20%20%20%20%20%20%20await%20runner.add_workers(worker)%0A%20%20%20%20%20%20%20%20await%20runner.run()%0A%0A`,lang:`python`});var he=o(me,2);l(he,{id:`implement-a-signaling-server`,children:(e,t)=>{s(),i(e,r(`Implement a signaling server`))},$$slots:{default:!0}});var Z=o(he,2);p(o(e(Z),5),{href:`https://modal.com/docs/reference/modal.Dict`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,4);p(o(e(Q)),{href:`https://github.com/modal-labs/modal-examples/tree/main/07_web/webrtc/frontend`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Github repo`))},$$slots:{default:!0}}),s(),n(Q);var ge=o(Q,2);d(ge,{code:`this_directory%20%3D%20Path(__file__).parent.resolve()%0Aserver_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22fastapi%5Bstandard%5D%3D%3D0.115.12%22)%0A%20%20%20%20.add_local_dir(this_directory%20%2F%20%22frontend%22%2C%20remote_path%3D%22%2Ffrontend%22)%0A)%0A%0A%0A%40app.cls(image%3Dserver_image%2C%20timeout%3D10%20*%20MINUTES)%0Aclass%20WebcamObjDet%3A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20HTTPException%2C%20Request%0A%20%20%20%20%20%20%20%20from%20fastapi.responses%20import%20HTMLResponse%0A%20%20%20%20%20%20%20%20from%20fastapi.staticfiles%20import%20StaticFiles%0A%0A%20%20%20%20%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20%20%20%20%20web_app.mount(%22%2Fstatic%22%2C%20StaticFiles(directory%3D%22%2Ffrontend%22))%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20%20%20%20%20async%20def%20root()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20html%20%3D%20open(%22%2Ffrontend%2Findex.html%22).read()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20HTMLResponse(content%3Dhtml)%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2Fice-servers%22)%0A%20%20%20%20%20%20%20%20async%20def%20ice_servers(mode%3A%20str%20%3D%20%22stun%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ice_servers%22%3A%20await%20resolve_ice_servers(use_turn%3D(mode%20%3D%3D%20%22turn%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D503%2C%20detail%3Dstr(e))%20from%20e%0A%0A%20%20%20%20%20%20%20%20%40web_app.post(%22%2Foffer%22)%0A%20%20%20%20%20%20%20%20async%20def%20offer(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20body%20%3D%20await%20request.json()%0A%20%20%20%20%20%20%20%20%20%20%20%20sdp%20%3D%20body.get(%22sdp%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20offer_type%20%3D%20body.get(%22type%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20sdp%20or%20not%20offer_type%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D400%2C%20detail%3D%22missing%20sdp%20or%20type%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20use_turn%20%3D%20body.get(%22ice_server_type%22)%20%3D%3D%20%22turn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ice_servers%20%3D%20await%20resolve_ice_servers(use_turn%3Duse_turn)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D503%2C%20detail%3Dstr(e))%20from%20e%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20modal.Dict.ephemeral()%20as%20d%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20d.put.aio(%22ice_servers%22%2C%20ice_servers)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20d.put.aio(%22offer%22%2C%20%7B%22sdp%22%3A%20sdp%2C%20%22type%22%3A%20offer_type%7D)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20call%20%3D%20await%20ObjDet().run_pipeline.spawn.aio(d)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20ANSWER_TIMEOUT_SECS%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20await%20request.is_disconnected()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20status_code%3D499%2C%20detail%3D%22client%20disconnected%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20answer%20%3D%20await%20d.get.aio(%22answer%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20answer%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20answer%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Fail%20fast%20if%20the%20GPU%20peer%20exited%3B%20re-read%20answer%20first%20in%20case%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20it%20was%20published%20in%20the%20gap%20between%20the%20get%20above%20and%20call.get.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20peer_done%20%3D%20False%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20peer_error%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20call.get.aio(timeout%3D0)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20peer_done%20%3D%20True%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20peer_error%20%3D%20e%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20peer_done%20%3D%20True%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20peer_done%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20answer%20%3D%20await%20d.get.aio(%22answer%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20answer%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20answer%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20peer_error%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20status_code%3D502%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20detail%3Df%22GPU%20peer%20failed%20before%20SDP%20answer%3A%20%7Bpeer_error%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20from%20peer_error%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20status_code%3D502%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20detail%3D%22GPU%20peer%20finished%20without%20SDP%20answer%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20status_code%3D504%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20detail%3D%22timed%20out%20waiting%20for%20SDP%20answer%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20BaseException%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20call.cancel.aio()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%0A%0A%20%20%20%20%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var $=o(ge,2);c($,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}});var _e=o($,4);l(_e,{id:`ice-helpers`,children:(e,t)=>{s(),i(e,r(`ICE helpers`))},$$slots:{default:!0}});var ve=o(_e,4);d(ve,{code:`def%20ice_servers_for_mode(use_turn%3A%20bool)%20-%3E%20list%5Bdict%5D%3A%0A%20%20%20%20stun%20%3D%20%5B%7B%22urls%22%3A%20%22stun%3Astun.l.google.com%3A19302%22%7D%5D%0A%20%20%20%20if%20not%20use_turn%3A%0A%20%20%20%20%20%20%20%20return%20stun%0A%0A%20%20%20%20username%20%3D%20os.environ.get(%22TURN_USERNAME%22)%0A%20%20%20%20credential%20%3D%20os.environ.get(%22TURN_CREDENTIAL%22)%0A%20%20%20%20if%20not%20username%20or%20not%20credential%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22TURN%20mode%20needs%20Modal%20Secret%20'turn-credentials'%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%22(TURN_USERNAME%2C%20TURN_CREDENTIAL)%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20creds%20%3D%20%7B%22username%22%3A%20username%2C%20%22credential%22%3A%20credential%7D%0A%20%20%20%20return%20%5B%0A%20%20%20%20%20%20%20%20%7B%22urls%22%3A%20%22stun%3Astun.relay.metered.ca%3A80%22%7D%2C%20%20%23%20STUN%20is%20free%2C%20no%20creds%20needed%0A%20%20%20%20%20%20%20%20%23%20for%20TURN%2C%20sign%20up%20for%20the%20free%20service%20here%3A%20https%3A%2F%2Fwww.metered.ca%2Ftools%2Fopenrelay%2F%0A%20%20%20%20%20%20%20%20%7B%22urls%22%3A%20%22turn%3Astandard.relay.metered.ca%3A80%22%7D%20%7C%20creds%2C%0A%20%20%20%20%20%20%20%20%7B%22urls%22%3A%20%22turn%3Astandard.relay.metered.ca%3A80%3Ftransport%3Dtcp%22%7D%20%7C%20creds%2C%0A%20%20%20%20%20%20%20%20%7B%22urls%22%3A%20%22turn%3Astandard.relay.metered.ca%3A443%22%7D%20%7C%20creds%2C%0A%20%20%20%20%20%20%20%20%7B%22urls%22%3A%20%22turns%3Astandard.relay.metered.ca%3A443%3Ftransport%3Dtcp%22%7D%20%7C%20creds%2C%0A%20%20%20%20%5D%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.12%22)%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22turn-credentials%22)%5D%2C%0A)%0Adef%20lookup_turn_ice_servers()%20-%3E%20list%5Bdict%5D%3A%0A%20%20%20%20return%20ice_servers_for_mode(use_turn%3DTrue)%0A%0A%0Aasync%20def%20resolve_ice_servers(*%2C%20use_turn%3A%20bool)%20-%3E%20list%5Bdict%5D%3A%0A%20%20%20%20if%20use_turn%3A%0A%20%20%20%20%20%20%20%20return%20await%20lookup_turn_ice_servers.remote.aio()%0A%20%20%20%20return%20ice_servers_for_mode(use_turn%3DFalse)%0A%0A`,lang:`python`});var ye=o(ve,2);l(ye,{id:`yolo-helper-functions`,children:(e,t)=>{s(),i(e,r(`YOLO helper functions`))},$$slots:{default:!0}});var be=o(ye,6);d(be,{code:`def%20get_yolo_model(cache_path)%3A%0A%20%20%20%20import%20onnxruntime%0A%0A%20%20%20%20from%20.yolo%20import%20YOLOv10%0A%0A%20%20%20%20onnxruntime.preload_dlls()%0A%20%20%20%20return%20YOLOv10(cache_path)%0A%0A`,lang:`python`});var xe=o(be,4);d(xe,{code:`def%20get_yolo_processor(yolo_model)%3A%0A%20%20%20%20import%20cv2%0A%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20from%20pipecat.frames.frames%20import%20InputImageRawFrame%2C%20OutputImageRawFrame%0A%20%20%20%20from%20pipecat.processors.frame_processor%20import%20FrameProcessor%0A%0A%20%20%20%20class%20YOLOProcessor(FrameProcessor)%3A%0A%20%20%20%20%20%20%20%20conf_threshold%20%3D%200.15%0A%0A%20%20%20%20%20%20%20%20def%20__init__(self%2C%20model)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20super().__init__()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.yolo_model%20%3D%20model%0A%0A%20%20%20%20%20%20%20%20%23%20this%20is%20the%20essential%20method%20we%20need%20to%20implement%0A%20%20%20%20%20%20%20%20%23%20to%20create%20a%20custom%20FrameProcessor%0A%20%20%20%20%20%20%20%20async%20def%20process_frame(self%2C%20frame%2C%20direction)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20super().process_frame(frame%2C%20direction)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20isinstance(frame%2C%20InputImageRawFrame)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20self.push_frame(frame%2C%20direction)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20width%2C%20height%20%3D%20frame.size%0A%20%20%20%20%20%20%20%20%20%20%20%20image%20%3D%20np.frombuffer(frame.image%2C%20dtype%3Dnp.uint8).reshape(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(height%2C%20width%2C%203)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20frame.format%20%3D%3D%20%22RGB%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image%20%3D%20cv2.cvtColor(image%2C%20cv2.COLOR_RGB2BGR)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20resized%20%3D%20cv2.resize(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(self.yolo_model.input_width%2C%20self.yolo_model.input_height)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20detected%20%3D%20self.yolo_model.detect_objects(resized%2C%20self.conf_threshold)%0A%20%20%20%20%20%20%20%20%20%20%20%20out%20%3D%20cv2.resize(detected%2C%20(width%2C%20height))%0A%20%20%20%20%20%20%20%20%20%20%20%20out_rgb%20%3D%20cv2.cvtColor(out%2C%20cv2.COLOR_BGR2RGB)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20self.push_frame(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20OutputImageRawFrame(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image%3Dout_rgb.tobytes()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D(width%2C%20height)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20format%3D%22RGB%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20YOLOProcessor(yolo_model)%0A%0A`,lang:`python`});var Se=o(xe,2);l(Se,{id:`testing-a-webrtc-application-on-modal`,children:(e,t)=>{s(),i(e,r(`Testing a WebRTC application on Modal`))},$$slots:{default:!0}});var Ce=o(Se,4);p(o(e(Ce)),{href:`https://github.com/modal-labs/modal-examples/tree/main/07_web/webrtc/webrtc_yolo_test.py`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(Ce),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=CVY3m0u6.js.map
