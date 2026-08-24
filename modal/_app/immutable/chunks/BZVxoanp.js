(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d0b5df07-48e4-47af-9b1d-1f553dbeb4f7`,e._sentryDebugIdIdentifier=`sentry-dbid-d0b5df07-48e4-47af-9b1d-1f553dbeb4f7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Introducing: WebSockets on Modal`,description:`Modal now supports WebSocket connections, enabling real-time, bidirectional data transfer between client and server.`,date:`2024-02-27T12:00:00.000Z`,length:`4 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`How to set up a WebSocket server`,id:`how-to-set-up-a-websocket-server`},{depth:2,value:`Why use WebSockets on Modal`,id:`why-use-websockets-on-modal`},{depth:2,value:`Use cases`,id:`use-cases`,children:[{depth:3,value:`1. Real-time streaming responses`,id:`1-real-time-streaming-responses`},{depth:3,value:`2. Status updates on long-running tasks`,id:`2-status-updates-on-long-running-tasks`},{depth:3,value:`3. Hosting open-source frameworks out-of-the-box`,id:`3-hosting-open-source-frameworks-out-of-the-box`}]}],rawContent:`Here at Modal, we’re constantly cranking on complex infrastructure projects. We
want to start highlighting some of the heftier features we’ve released recently.
On the docket today: Modal now supports WebSocket connections.

WebSocket is a communication protocol for real-time, bidirectional transfer of
data between a client and server. Unlike HTTP, in which connections are opened
and closed per request/response, WebSocket establishes a persistent connection
between client and server. This is advantageous for applications that require
low latency and real-time updates.

## How to set up a WebSocket server

There’s nothing special you have to do to set up a WebSocket connection on a
Modal function; use your library of choice as you would normally. Here’s some
boilerplate of what that would look like using FastAPI, for instance:

\`\`\`python
import modal

image = modal.Image.debian_slim().pip_install("fastapi", "websockets")
app = modal.App("my-app", image=image)


@app.function()
@modal.asgi_app()
def endpoint():
    from fastapi import FastAPI, WebSocket

    app = FastAPI()

    @app.websocket("/ws")
    async def websocket_handler(websocket: WebSocket) -> None:
        await websocket.accept()
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")

    return app
\`\`\`

Save the code above to a file called \`main.py\`, and deploy it with
\`modal deploy main.py\`.

Modal treats each WebSocket connection as a single input, so you will want to
set your function to
[allow for concurrent inputs](/docs/guide/concurrent-inputs) if it is not
CPU/GPU-bound. Otherwise, Modal will spin up a new container for each WebSocket
connection. Please see our
[WebSocket documentation](/docs/guide/webhooks#websockets) for more info.

## Why use WebSockets on Modal

One of Modal’s primary benefits is automatic scaling based on the volume of
inputs your functions are receiving. This applies to WebSocket handlers as well!
This makes it super easy for you to build applications that can handle variable
request volumes.

For example, let’s say you want to launch a real-time speech-to-text app that
will be able to handle many users at once. You can deploy both your WebSocket
server and transcription model as Modal Functions. Modal will auto-scale
containers for both Functions, without you having to write any of the scaling
logic.

![Diagram of clients connecting to a Modal WebSocket server](https://modal-cdn.com/cdnbot/websocket-launch-diagram.png)

## Use cases

At Modal, we’ve heard users ask for WebSocket support to facilitate a few
different use cases.

### 1. Real-time streaming responses

This use case is most common for those building features around audio streaming.
A speech-to-text application running on Whisper, for example, may need to stream
live, continuous transcription back to end users as audio input comes in. We’ve
also had users ask for this in the context of text-to-speech and text-to-image
features that require real-time responses to continuous inputs.

### 2. Status updates on long-running tasks

This use case is especially relevant for workloads that have a long processing
time—for example, prompting an LLM to pull insights from a very large body of
text. You may want to send progress indicators to the end user for these
long-running tasks. WebSockets come into play here because the server can send
intermediate updates to the client over the persisted connection.

### 3. Hosting open-source frameworks out-of-the-box

Several popular frameworks like ComfyUI, Streamlit, and Gradio require WebSocket
connections in order to be deployed. Many of our users are utilizing ComfyUI’s
GUI to build out stable diffusion pipelines; others are running Streamlit and
Gradio to prototype new ML features or build mini-apps. These frameworks rely on
WebSockets to power interactive visualizations in the client and surface
real-time updates when underlying data changes.

Check out our examples of how to run
[Streamlit](/docs/examples/serve_streamlit) on Modal.
`,meta:{description:`Modal now supports WebSocket connections, enabling real-time, bidirectional data transfer between client and server.`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Here at Modal, we’re constantly cranking on complex infrastructure projects. We
want to start highlighting some of the heftier features we’ve released recently.
On the docket today: Modal now supports WebSocket connections.</p> <p>WebSocket is a communication protocol for real-time, bidirectional transfer of
data between a client and server. Unlike HTTP, in which connections are opened
and closed per request/response, WebSocket establishes a persistent connection
between client and server. This is advantageous for applications that require
low latency and real-time updates.</p> <h2 id="how-to-set-up-a-websocket-server">How to set up a WebSocket server</h2> <p>There’s nothing special you have to do to set up a WebSocket connection on a
Modal function; use your library of choice as you would normally. Here’s some
boilerplate of what that would look like using FastAPI, for instance:</p> <!> <p>Save the code above to a file called <code>main.py</code>, and deploy it with <code>modal deploy main.py</code>.</p> <p>Modal treats each WebSocket connection as a single input, so you will want to
set your function to <!> if it is not
CPU/GPU-bound. Otherwise, Modal will spin up a new container for each WebSocket
connection. Please see our <!> for more info.</p> <h2 id="why-use-websockets-on-modal">Why use WebSockets on Modal</h2> <p>One of Modal’s primary benefits is automatic scaling based on the volume of
inputs your functions are receiving. This applies to WebSocket handlers as well!
This makes it super easy for you to build applications that can handle variable
request volumes.</p> <p>For example, let’s say you want to launch a real-time speech-to-text app that
will be able to handle many users at once. You can deploy both your WebSocket
server and transcription model as Modal Functions. Modal will auto-scale
containers for both Functions, without you having to write any of the scaling
logic.</p> <p><!></p> <h2 id="use-cases">Use cases</h2> <p>At Modal, we’ve heard users ask for WebSocket support to facilitate a few
different use cases.</p> <h3 id="1-real-time-streaming-responses">1. Real-time streaming responses</h3> <p>This use case is most common for those building features around audio streaming.
A speech-to-text application running on Whisper, for example, may need to stream
live, continuous transcription back to end users as audio input comes in. We’ve
also had users ask for this in the context of text-to-speech and text-to-image
features that require real-time responses to continuous inputs.</p> <h3 id="2-status-updates-on-long-running-tasks">2. Status updates on long-running tasks</h3> <p>This use case is especially relevant for workloads that have a long processing
time—for example, prompting an LLM to pull insights from a very large body of
text. You may want to send progress indicators to the end user for these
long-running tasks. WebSockets come into play here because the server can send
intermediate updates to the client over the persisted connection.</p> <h3 id="3-hosting-open-source-frameworks-out-of-the-box">3. Hosting open-source frameworks out-of-the-box</h3> <p>Several popular frameworks like ComfyUI, Streamlit, and Gradio require WebSocket
connections in order to be deployed. Many of our users are utilizing ComfyUI’s
GUI to build out stable diffusion pipelines; others are running Streamlit and
Gradio to prototype new ML features or build mini-apps. These frameworks rely on
WebSockets to power interactive visualizations in the client and surface
real-time updates when underlying data changes.</p> <p>Check out our examples of how to run <!> on Modal.</p>`,1);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),8);d(p,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%22%2C%20%22websockets%22)%0Aapp%20%3D%20modal.App(%22my-app%22%2C%20image%3Dimage)%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20endpoint()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20WebSocket%0A%0A%20%20%20%20app%20%3D%20FastAPI()%0A%0A%20%20%20%20%40app.websocket(%22%2Fws%22)%0A%20%20%20%20async%20def%20websocket_handler(websocket%3A%20WebSocket)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20await%20websocket.accept()%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20websocket.receive_text()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20websocket.send_text(f%22Message%20text%20was%3A%20%7Bdata%7D%22)%0A%0A%20%20%20%20return%20app`,lang:`python`});var m=c(p,4),h=c(e(m));f(h,{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{l(),i(e,r(`allow for concurrent inputs`))},$$slots:{default:!0}}),f(c(h,2),{href:`/docs/guide/webhooks#websockets`,children:(e,t)=>{l(),i(e,r(`WebSocket documentation`))},$$slots:{default:!0}}),l(),n(m);var g=c(m,8);u(e(g),{src:`https://modal-cdn.com/cdnbot/websocket-launch-diagram.png`,alt:`Diagram of clients connecting to a Modal WebSocket server`}),n(g);var _=c(g,18);f(c(e(_)),{href:`/docs/examples/serve_streamlit`,children:(e,t)=>{l(),i(e,r(`Streamlit`))},$$slots:{default:!0}}),l(),n(_),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=BZVxoanp.js.map
