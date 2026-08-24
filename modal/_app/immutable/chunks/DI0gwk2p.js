(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d5e13a4d-ef45-4911-8841-64985ebeac58`,e._sentryDebugIdIdentifier=`sentry-dbid-d5e13a4d-ef45-4911-8841-64985ebeac58`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`QuiLLMan: Voice Chat with Moshi`,id:`quillman-voice-chat-with-moshi`,children:[{depth:2,value:`Code overview`,id:`code-overview`,children:[{depth:3,value:`FastAPI Server`,id:`fastapi-server`},{depth:3,value:`Moshi Websocket Server`,id:`moshi-websocket-server`},{depth:3,value:`React Frontend`,id:`react-frontend`}]},{depth:2,value:`Deploy`,id:`deploy`},{depth:2,value:`Steal this example`,id:`steal-this-example`}]}],rawContent:`# QuiLLMan: Voice Chat with Moshi

[QuiLLMan](https://github.com/modal-labs/quillman)\xA0is a complete voice chat application built on Modal: you speak and the chatbot speaks back!

At the core is Kyutai Lab's [Moshi](https://github.com/kyutai-labs/moshi) model, a speech-to-speech language model that will continuously listen, plan, and respond to the user.

Thanks to bidirectional websocket streaming and [Opus audio compression](https://opus-codec.org/), response times on good internet can be nearly instantaneous, closely matching the cadence of human speech.

You can find the demo live [here](https://modal-labs--quillman-web.modal.run/).

![Quillman](https://github.com/user-attachments/assets/afda5874-8509-4f56-9f25-d734b8f1c40a)

Everything — from the React frontend to the model backend — is deployed serverlessly on Modal, allowing it to automatically scale and ensuring you only pay for the compute you use.

This page provides a high-level walkthrough of the\xA0[GitHub repo](https://github.com/modal-labs/quillman).

## Code overview

Traditionally, building a bidirectional streaming web application as compute-heavy as QuiLLMan would take a lot of work, and it's especially difficult to make it robust and scale to handle many concurrent users.

But with Modal, it’s as simple as writing two different classes and running a CLI command.

Our project structure looks like this:

1. [Moshi Websocket Server](https://modal.com/docs/examples/llm-voice-chat#moshi-websocket-server): loads an instance of the Moshi model and maintains a bidirectional websocket connection with the client.
2. [React Frontend](https://modal.com/docs/examples/llm-voice-chat#react-frontend): runs client-side interaction logic.

Let’s go through each of these components in more detail.

### FastAPI Server

Both frontend and backend are served via a [FastAPI Server](https://fastapi.tiangolo.com/), which is a popular Python web framework for building REST APIs.

On Modal, a function or class method can be exposed to web traffic by decorating it with [\`@app.asgi_app()\`](https://modal.com/docs/sdk/py/latest/asgi_app) and returning a FastAPI app. You're then free to configure the FastAPI server however you like, including adding middleware, serving static files, and running websockets.

### Moshi Websocket Server

Traditionally, a speech-to-speech chat app requires three distinct modules: speech-to-text, text-to-text, and text-to-speech. Passing data between these modules introduces bottlenecks, and can limit the speed of the app and forces a turn-by-turn conversation which can feel unnatural.

Kyutai Lab's [Moshi](https://github.com/kyutai-labs/moshi) bundles all modalities into one model, which decreases latency and makes for a much simpler app.

Under the hood, Moshi uses the [Mimi](https://huggingface.co/kyutai/mimi) streaming encoder/decoder model to maintain an unbroken stream of audio in and out. The encoded audio is processed by a [speech-text foundation model](https://huggingface.co/kyutai/moshiko-pytorch-bf16), which uses an internal monologue to determine when and how to respond.

Using a streaming model introduces a few challenges not normally seen in inference backends:

1. The model is _stateful_, meaning it maintains context of the conversation so far. This means a model instance cannot be shared between user conversations, so we must run a unique GPU per user session, which is normally not an easy feat!
2. The model is _streaming_, so the interface around it is not as simple as a POST request. We must find a way to stream audio data in and out, and do it fast enough for seamless playback.

We solve both of these in \`src/moshi.py\`, using a few Modal features.

To solve statefulness, we just spin up a new GPU per concurrent user.
That's easy with Modal!

\`\`\`python notest
@app.cls(
    image=image,
    gpu="A10G",
    scaledown_window=300,
    ...
)
class Moshi:
    # ...
\`\`\`

With this setting, if a new user connects, a new GPU instance is created! When any user disconnects, the state of their model is reset and that GPU instance is returned to the warm pool for re-use (for up to 300 seconds). Be aware that a GPU per user is not going to be cheap, but it's the simplest way to ensure user sessions are isolated.

For streaming, we use FastAPI's support for bidirectional websockets. This allows clients to establish a single connection at the start of their session, and stream audio data both ways.

Just as a FastAPI server can run from a Modal Function, it can also be attached to a Modal class method, allowing us to couple a prewarmed Moshi model to a websocket session.

\`\`\`python notest
@modal.asgi_app()
def web(self):
    from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect

    web_app = FastAPI()
    @web_app.websocket("/ws")
    async def websocket(ws: WebSocket):
        with torch.no_grad():
            await ws.accept()

            # handle user session

            # spawn loops for async IO
            async def recv_loop():
                while True:
                    data = await ws.receive_bytes()
                    # send data into inference stream...

            async def send_loop():
                while True:
                    await asyncio.sleep(0.001)
                    msg = self.opus_stream_outbound.read_bytes()
                    # send inference output to user ...
\`\`\`

To run a [development server](https://modal.com/docs/guide/webhooks#developing-with-modal-serve) for the Moshi module, run this command from the root of the repo.

\`\`\`shell
modal serve -m src.moshi
\`\`\`

In the terminal output, you'll find a URL for creating a websocket connection.

### React Frontend

The frontend is a static React app, found in the \`src/frontend\` directory and served by \`src/app.py\`.

We use the\xA0[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)\xA0to record audio from the user's microphone and playback audio responses from the model.

For efficient audio transmission, we use the [Opus codec](https://opus-codec.org/) to compress audio across the network. Opus recording and playback are supported by the [\`opus-recorder\`](https://github.com/chris-rudmin/opus-recorder) and [\`ogg-opus-decoder\`](https://github.com/eshaz/wasm-audio-decoders/tree/master/src/ogg-opus-decoder) libraries.

To serve the frontend assets, run this command from the root of the repo.

\`\`\`shell
modal serve -m src.app
\`\`\`

Since \`src/app.py\` imports the \`src/moshi.py\` module, this \`serve\` command also serves the Moshi websocket server as its own endpoint.

## Deploy

When you're ready to go live, use the \`deploy\` command to deploy the App to Modal.

\`\`\`shell
modal deploy -m src.app
\`\`\`

## Steal this example

The code for this entire example is\xA0[available on GitHub](https://github.com/modal-labs/quillman), so feel free to fork it and make it your own!
`,meta:{title:`QuiLLMan: Voice Chat with Moshi`,description:`QuiLLMan\xA0is a complete voice chat application built on Modal: you speak and the chatbot speaks back!`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<code>@app.asgi_app()</code>`),S=t(`<code>opus-recorder</code>`),C=t(`<code>ogg-opus-decoder</code>`),w=t(`<!> <p><!>\xA0is a complete voice chat application built on Modal: you speak and the chatbot speaks back!</p> <p>At the core is Kyutai Lab’s <!> model, a speech-to-speech language model that will continuously listen, plan, and respond to the user.</p> <p>Thanks to bidirectional websocket streaming and <!>, response times on good internet can be nearly instantaneous, closely matching the cadence of human speech.</p> <p>You can find the demo live <!>.</p> <p><!></p> <p>Everything — from the React frontend to the model backend — is deployed serverlessly on Modal, allowing it to automatically scale and ensuring you only pay for the compute you use.</p> <p>This page provides a high-level walkthrough of the\xA0<!>.</p> <!> <p>Traditionally, building a bidirectional streaming web application as compute-heavy as QuiLLMan would take a lot of work, and it’s especially difficult to make it robust and scale to handle many concurrent users.</p> <p>But with Modal, it’s as simple as writing two different classes and running a CLI command.</p> <p>Our project structure looks like this:</p> <ol><li><!>: loads an instance of the Moshi model and maintains a bidirectional websocket connection with the client.</li> <li><!>: runs client-side interaction logic.</li></ol> <p>Let’s go through each of these components in more detail.</p> <!> <p>Both frontend and backend are served via a <!>, which is a popular Python web framework for building REST APIs.</p> <p>On Modal, a function or class method can be exposed to web traffic by decorating it with <!> and returning a FastAPI app. You’re then free to configure the FastAPI server however you like, including adding middleware, serving static files, and running websockets.</p> <!> <p>Traditionally, a speech-to-speech chat app requires three distinct modules: speech-to-text, text-to-text, and text-to-speech. Passing data between these modules introduces bottlenecks, and can limit the speed of the app and forces a turn-by-turn conversation which can feel unnatural.</p> <p>Kyutai Lab’s <!> bundles all modalities into one model, which decreases latency and makes for a much simpler app.</p> <p>Under the hood, Moshi uses the <!> streaming encoder/decoder model to maintain an unbroken stream of audio in and out. The encoded audio is processed by a <!>, which uses an internal monologue to determine when and how to respond.</p> <p>Using a streaming model introduces a few challenges not normally seen in inference backends:</p> <ol><li>The model is <em>stateful</em>, meaning it maintains context of the conversation so far. This means a model instance cannot be shared between user conversations, so we must run a unique GPU per user session, which is normally not an easy feat!</li> <li>The model is <em>streaming</em>, so the interface around it is not as simple as a POST request. We must find a way to stream audio data in and out, and do it fast enough for seamless playback.</li></ol> <p>We solve both of these in <code>src/moshi.py</code>, using a few Modal features.</p> <p>To solve statefulness, we just spin up a new GPU per concurrent user.
That’s easy with Modal!</p> <!> <p>With this setting, if a new user connects, a new GPU instance is created! When any user disconnects, the state of their model is reset and that GPU instance is returned to the warm pool for re-use (for up to 300 seconds). Be aware that a GPU per user is not going to be cheap, but it’s the simplest way to ensure user sessions are isolated.</p> <p>For streaming, we use FastAPI’s support for bidirectional websockets. This allows clients to establish a single connection at the start of their session, and stream audio data both ways.</p> <p>Just as a FastAPI server can run from a Modal Function, it can also be attached to a Modal class method, allowing us to couple a prewarmed Moshi model to a websocket session.</p> <!> <p>To run a <!> for the Moshi module, run this command from the root of the repo.</p> <!> <p>In the terminal output, you’ll find a URL for creating a websocket connection.</p> <!> <p>The frontend is a static React app, found in the <code>src/frontend</code> directory and served by <code>src/app.py</code>.</p> <p>We use the\xA0<!>\xA0to record audio from the user’s microphone and playback audio responses from the model.</p> <p>For efficient audio transmission, we use the <!> to compress audio across the network. Opus recording and playback are supported by the <!> and <!> libraries.</p> <p>To serve the frontend assets, run this command from the root of the repo.</p> <!> <p>Since <code>src/app.py</code> imports the <code>src/moshi.py</code> module, this <code>serve</code> command also serves the Moshi websocket server as its own endpoint.</p> <!> <p>When you’re ready to go live, use the <code>deploy</code> command to deploy the App to Modal.</p> <!> <!> <p>The code for this entire example is\xA0<!>, so feel free to fork it and make it your own!</p>`,1);function T(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=w(),h=s(o);f(h,{id:`quillman-voice-chat-with-moshi`,children:(e,t)=>{l(),i(e,r(`QuiLLMan: Voice Chat with Moshi`))},$$slots:{default:!0}});var _=c(h,2);g(e(_),{href:`https://github.com/modal-labs/quillman`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`QuiLLMan`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);g(c(e(v)),{href:`https://github.com/kyutai-labs/moshi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Moshi`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);g(c(e(y)),{href:`https://opus-codec.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Opus audio compression`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);g(c(e(b)),{href:`https://modal-labs--quillman-web.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(b);var T=c(b,2);p(e(T),{src:`https://github.com/user-attachments/assets/afda5874-8509-4f56-9f25-d734b8f1c40a`,alt:`Quillman`}),n(T);var E=c(T,4);g(c(e(E)),{href:`https://github.com/modal-labs/quillman`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GitHub repo`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);u(D,{id:`code-overview`,children:(e,t)=>{l(),i(e,r(`Code overview`))},$$slots:{default:!0}});var O=c(D,8),k=e(O);g(e(k),{href:`https://modal.com/docs/examples/llm-voice-chat#moshi-websocket-server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Moshi Websocket Server`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);g(e(A),{href:`https://modal.com/docs/examples/llm-voice-chat#react-frontend`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`React Frontend`))},$$slots:{default:!0}}),l(),n(A),n(O);var j=c(O,4);d(j,{id:`fastapi-server`,children:(e,t)=>{l(),i(e,r(`FastAPI Server`))},$$slots:{default:!0}});var M=c(j,2);g(c(e(M)),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI Server`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);g(c(e(N)),{href:`https://modal.com/docs/sdk/py/latest/asgi_app`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);d(P,{id:`moshi-websocket-server`,children:(e,t)=>{l(),i(e,r(`Moshi Websocket Server`))},$$slots:{default:!0}});var F=c(P,4);g(c(e(F)),{href:`https://github.com/kyutai-labs/moshi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Moshi`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2),L=c(e(I));g(L,{href:`https://huggingface.co/kyutai/mimi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mimi`))},$$slots:{default:!0}}),g(c(L,2),{href:`https://huggingface.co/kyutai/moshiko-pytorch-bf16`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`speech-text foundation model`))},$$slots:{default:!0}}),l(),n(I);var R=c(I,10);m(R,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20scaledown_window%3D300%2C%0A%20%20%20%20...%0A)%0Aclass%20Moshi%3A%0A%20%20%20%20%23%20...`,lang:`python`});var z=c(R,8);m(z,{code:`%40modal.asgi_app()%0Adef%20web(self)%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Response%2C%20WebSocket%2C%20WebSocketDisconnect%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20%40web_app.websocket(%22%2Fws%22)%0A%20%20%20%20async%20def%20websocket(ws%3A%20WebSocket)%3A%0A%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.accept()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20handle%20user%20session%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20spawn%20loops%20for%20async%20IO%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20recv_loop()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20ws.receive_bytes()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20send%20data%20into%20inference%20stream...%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20send_loop()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.001)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20msg%20%3D%20self.opus_stream_outbound.read_bytes()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20send%20inference%20output%20to%20user%20...`,lang:`python`});var B=c(z,2);g(c(e(B)),{href:`https://modal.com/docs/guide/webhooks#developing-with-modal-serve`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`development server`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);m(V,{code:`modal%20serve%20-m%20src.moshi`,lang:`shell`});var H=c(V,4);d(H,{id:`react-frontend`,children:(e,t)=>{l(),i(e,r(`React Frontend`))},$$slots:{default:!0}});var U=c(H,4);g(c(e(U)),{href:`https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Web Audio API`))},$$slots:{default:!0}}),l(),n(U);var W=c(U,2),G=c(e(W));g(G,{href:`https://opus-codec.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Opus codec`))},$$slots:{default:!0}});var K=c(G,2);g(K,{href:`https://github.com/chris-rudmin/opus-recorder`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),g(c(K,2),{href:`https://github.com/eshaz/wasm-audio-decoders/tree/master/src/ogg-opus-decoder`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(W);var q=c(W,4);m(q,{code:`modal%20serve%20-m%20src.app`,lang:`shell`});var J=c(q,4);u(J,{id:`deploy`,children:(e,t)=>{l(),i(e,r(`Deploy`))},$$slots:{default:!0}});var Y=c(J,4);m(Y,{code:`modal%20deploy%20-m%20src.app`,lang:`shell`});var X=c(Y,2);u(X,{id:`steal-this-example`,children:(e,t)=>{l(),i(e,r(`Steal this example`))},$$slots:{default:!0}});var Z=c(X,2);g(c(e(Z)),{href:`https://github.com/modal-labs/quillman`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`available on GitHub`))},$$slots:{default:!0}}),l(),n(Z),i(t,o)},$$slots:{default:!0}}))}export{T as default,_ as metadata};
//# sourceMappingURL=DI0gwk2p.js.map
