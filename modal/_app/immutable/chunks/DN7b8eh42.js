(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a09395bd-aff1-42a6-803f-ae03a2753238`,e._sentryDebugIdIdentifier=`sentry-dbid-a09395bd-aff1-42a6-803f-ae03a2753238`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy a FastAPI app with streaming responses`,id:`deploy-a-fastapi-app-with-streaming-responses`}],rawContent:`# Deploy a FastAPI app with streaming responses

This example shows how you can deploy a [FastAPI](https://fastapi.tiangolo.com/) app with Modal that streams results back to the client.

\`\`\`python
import asyncio
import time

import modal
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

image = modal.Image.debian_slim().uv_pip_install("fastapi[standard]")
app = modal.App("example-streaming", image=image)

web_app = FastAPI()

\`\`\`

This asynchronous generator function simulates
progressively returning data to the client. The \`asyncio.sleep\`
is not necessary, but makes it easier to see the iterative behavior
of the response.

\`\`\`python
async def fake_video_streamer():
    for i in range(10):
        yield f"frame {i}: hello world!".encode()
        await asyncio.sleep(1.0)


\`\`\`

ASGI app with streaming handler.

This \`fastapi_app\` also uses the fake video streamer async generator,
passing it directly into \`StreamingResponse\`.

\`\`\`python
@web_app.get("/")
async def main():
    return StreamingResponse(fake_video_streamer(), media_type="text/event-stream")


@app.function()
@modal.asgi_app()
def fastapi_app():
    return web_app


\`\`\`

This \`hook\` Web Function calls *another* Modal Function,
and it just works!

\`\`\`python
@app.function()
def sync_fake_video_streamer():
    for i in range(10):
        yield f"frame {i}: some data\\n".encode()
        time.sleep(1)


@app.function()
@modal.fastapi_endpoint()
def hook():
    return StreamingResponse(
        sync_fake_video_streamer.remote_gen(), media_type="text/event-stream"
    )


\`\`\`

This \`mapped\` Web Function does a parallel \`.map\` on a simple
Modal Function. Using \`.starmap\` also would work in the same fashion.

\`\`\`python
@app.function()
def map_me(i):
    time.sleep(i)  # stagger the results for demo purposes
    return f"hello from {i}\\n"


@app.function()
@modal.fastapi_endpoint()
def mapped():
    return StreamingResponse(map_me.map(range(10)), media_type="text/event-stream")


\`\`\`

To try for yourself, run

\`\`\`shell
modal serve streaming.py
\`\`\`

and then send requests to the URLs that appear in the terminal output.

Make sure that your client is not buffering the server response
until it gets newline (\\n) characters. By default browsers and \`curl\` are buffering,
though modern browsers should respect the "text/event-stream" content type header being set.
`,meta:{title:`Deploy a FastAPI app with streaming responses`,description:`This example shows how you can deploy a FastAPI app with Modal that streams results back to the client.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This example shows how you can deploy a <!> app with Modal that streams results back to the client.</p> <!> <p>This asynchronous generator function simulates
progressively returning data to the client. The <code>asyncio.sleep</code> is not necessary, but makes it easier to see the iterative behavior
of the response.</p> <!> <p>ASGI app with streaming handler.</p> <p>This <code>fastapi_app</code> also uses the fake video streamer async generator,
passing it directly into <code>StreamingResponse</code>.</p> <!> <p>This <code>hook</code> Web Function calls <em>another</em> Modal Function,
and it just works!</p> <!> <p>This <code>mapped</code> Web Function does a parallel <code>.map</code> on a simple
Modal Function. Using <code>.starmap</code> also would work in the same fashion.</p> <!> <p>To try for yourself, run</p> <!> <p>and then send requests to the URLs that appear in the terminal output.</p> <p>Make sure that your client is not buffering the server response
until it gets newline (\\n) characters. By default browsers and <code>curl</code> are buffering,
though modern browsers should respect the “text/event-stream” content type header being set.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`deploy-a-fastapi-app-with-streaming-responses`,children:(e,t)=>{l(),i(e,r(`Deploy a FastAPI app with streaming responses`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(h,{code:`import%20asyncio%0Aimport%20time%0A%0Aimport%20modal%0Afrom%20fastapi%20import%20FastAPI%0Afrom%20fastapi.responses%20import%20StreamingResponse%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(%22example-streaming%22%2C%20image%3Dimage)%0A%0Aweb_app%20%3D%20FastAPI()%0A`,lang:`python`});var g=c(h,4);d(g,{code:`async%20def%20fake_video_streamer()%3A%0A%20%20%20%20for%20i%20in%20range(10)%3A%0A%20%20%20%20%20%20%20%20yield%20f%22frame%20%7Bi%7D%3A%20hello%20world!%22.encode()%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(1.0)%0A%0A`,lang:`python`});var _=c(g,6);d(_,{code:`%40web_app.get(%22%2F%22)%0Aasync%20def%20main()%3A%0A%20%20%20%20return%20StreamingResponse(fake_video_streamer()%2C%20media_type%3D%22text%2Fevent-stream%22)%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var y=c(_,4);d(y,{code:`%40app.function()%0Adef%20sync_fake_video_streamer()%3A%0A%20%20%20%20for%20i%20in%20range(10)%3A%0A%20%20%20%20%20%20%20%20yield%20f%22frame%20%7Bi%7D%3A%20some%20data%5Cn%22.encode()%0A%20%20%20%20%20%20%20%20time.sleep(1)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint()%0Adef%20hook()%3A%0A%20%20%20%20return%20StreamingResponse(%0A%20%20%20%20%20%20%20%20sync_fake_video_streamer.remote_gen()%2C%20media_type%3D%22text%2Fevent-stream%22%0A%20%20%20%20)%0A%0A`,lang:`python`});var b=c(y,4);d(b,{code:`%40app.function()%0Adef%20map_me(i)%3A%0A%20%20%20%20time.sleep(i)%20%20%23%20stagger%20the%20results%20for%20demo%20purposes%0A%20%20%20%20return%20f%22hello%20from%20%7Bi%7D%5Cn%22%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint()%0Adef%20mapped()%3A%0A%20%20%20%20return%20StreamingResponse(map_me.map(range(10))%2C%20media_type%3D%22text%2Fevent-stream%22)%0A%0A`,lang:`python`}),d(c(b,4),{code:`modal%20serve%20streaming.py`,lang:`shell`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DN7b8eh42.js.map
