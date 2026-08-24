(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`99d5a8ab-7ec4-4949-aa52-17e1730db3bc`,e._sentryDebugIdIdentifier=`sentry-dbid-99d5a8ab-7ec4-4949-aa52-17e1730db3bc`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Streaming endpoints`,id:`streaming-endpoints`,children:[{depth:2,value:`Simple example`,id:`simple-example`},{depth:2,value:`Streaming responses with .remote`,id:`streaming-responses-with-remote`},{depth:2,value:`Streaming responses with .map and .starmap`,id:`streaming-responses-with-map-and-starmap`,children:[{depth:3,value:`Asynchronous streaming`,id:`asynchronous-streaming`}]},{depth:2,value:`Further examples`,id:`further-examples`}]}],rawContent:`# Streaming endpoints

Modal \`fastapi_endpoint\`s support streaming responses using FastAPI's
[\`StreamingResponse\`](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
class. This class accepts asynchronous generators, synchronous generators, or
any Python object that implements the
[_iterator protocol_](https://docs.python.org/3/library/stdtypes.html#typeiter),
and can be used with Modal Functions!

## Simple example

This simple example combines Modal's \`@modal.fastapi_endpoint\` decorator with a
\`StreamingResponse\` object to produce a real-time SSE response.

\`\`\`python
import time

def fake_event_streamer():
    for i in range(10):
        yield f"data: some data {i}\\n\\n".encode()
        time.sleep(0.5)


@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.fastapi_endpoint()
def stream_me():
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        fake_event_streamer(), media_type="text/event-stream"
    )
\`\`\`

If you serve this Web Function and hit it with \`curl\`, you will see the ten SSE
events progressively appear in your terminal over a ~5 second period.

\`\`\`shell
curl --no-buffer https://modal-labs--example-streaming-stream-me.modal.run
\`\`\`

The MIME type of \`text/event-stream\` is important in this example, as it tells
the downstream web server to return responses immediately, rather than buffering
them in byte chunks (which is more efficient for compression).

You can still return other content types like large files in streams, but they
are not guaranteed to arrive as real-time events.

## Streaming responses with \`.remote\`

A Modal Function wrapping a generator function body can have its response passed
directly into a \`StreamingResponse\`. This is particularly useful if you want to
do some GPU processing in one Modal Function that is called by a CPU-based web
endpoint Modal Function.

\`\`\`python
@app.function(gpu="any")
def fake_video_render():
    for i in range(10):
        yield f"data: finished processing some data from GPU {i}\\n\\n".encode()
        time.sleep(1)


@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.fastapi_endpoint()
def hook():
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        fake_video_render.remote_gen(), media_type="text/event-stream"
    )
\`\`\`

## Streaming responses with \`.map\` and \`.starmap\`

You can also combine Modal Function parallelization with streaming responses,
enabling applications to service a request by farming out to dozens of
containers and iteratively returning result chunks to the client.

\`\`\`python
@app.function()
def map_me(i):
    return f"segment {i}\\n"


@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.fastapi_endpoint()
def mapped():
    from fastapi.responses import StreamingResponse
    return StreamingResponse(map_me.map(range(10)), media_type="text/plain")
\`\`\`

This snippet will spread the ten \`map_me(i)\` executions across containers, and
return each string response part as it completes. By default the results will be
ordered, but if this isn't necessary pass \`order_outputs=False\` as keyword
argument to the \`.map\` call.

### Asynchronous streaming

The example above uses a synchronous generator, which automatically runs on its
own thread, but in asynchronous applications, a loop over a \`.map\` or \`.starmap\`
call can block the event loop. This will stop the \`StreamingResponse\` from
returning response parts iteratively to the client.

To avoid this, you can use the \`.aio()\` method to convert a synchronous \`.map\`
into its async version. Also, other blocking calls should be offloaded to a
separate thread with \`asyncio.to_thread()\`. For example:

\`\`\`python
@app.function(gpu="any", image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.fastapi_endpoint()
async def transcribe_video(request):
    from fastapi.responses import StreamingResponse

    segments = await asyncio.to_thread(split_video, request)
    return StreamingResponse(wrapper(segments), media_type="text/event-stream")


# Notice that this is an async generator.
async def wrapper(segments):
    async for partial_result in transcribe_video.map.aio(segments):
        yield "data: " + partial_result + "\\n\\n"
\`\`\`

## Further examples

- Complete code for the simple examples given above is available
  [in our modal-examples Github repository](https://github.com/modal-labs/modal-examples/blob/main/07_web_endpoints/streaming.py).
- [An end-to-end example of streaming Youtube video transcriptions with OpenAI's whisper model.](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/streaming/main.py)
`,meta:{title:`Streaming endpoints`,description:`Modal fastapi_endpoints support streaming responses using FastAPI’s StreamingResponse class. This class accepts asynchronous generators, synchronous generators, or any Python object that implements the iterator protocol, and can be used with Modal Functions!`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>StreamingResponse</code>`),x=t(`<em>iterator protocol</em>`),S=t(`Streaming responses with <code>.remote</code>`,1),C=t(`Streaming responses with <code>.map</code> and <code>.starmap</code>`,1),w=t(`<!> <p>Modal <code>fastapi_endpoint</code>s support streaming responses using FastAPI’s <!> class. This class accepts asynchronous generators, synchronous generators, or
any Python object that implements the <!>,
and can be used with Modal Functions!</p> <!> <p>This simple example combines Modal’s <code>@modal.fastapi_endpoint</code> decorator with a <code>StreamingResponse</code> object to produce a real-time SSE response.</p> <!> <p>If you serve this Web Function and hit it with <code>curl</code>, you will see the ten SSE
events progressively appear in your terminal over a ~5 second period.</p> <!> <p>The MIME type of <code>text/event-stream</code> is important in this example, as it tells
the downstream web server to return responses immediately, rather than buffering
them in byte chunks (which is more efficient for compression).</p> <p>You can still return other content types like large files in streams, but they
are not guaranteed to arrive as real-time events.</p> <!> <p>A Modal Function wrapping a generator function body can have its response passed
directly into a <code>StreamingResponse</code>. This is particularly useful if you want to
do some GPU processing in one Modal Function that is called by a CPU-based web
endpoint Modal Function.</p> <!> <!> <p>You can also combine Modal Function parallelization with streaming responses,
enabling applications to service a request by farming out to dozens of
containers and iteratively returning result chunks to the client.</p> <!> <p>This snippet will spread the ten <code>map_me(i)</code> executions across containers, and
return each string response part as it completes. By default the results will be
ordered, but if this isn’t necessary pass <code>order_outputs=False</code> as keyword
argument to the <code>.map</code> call.</p> <!> <p>The example above uses a synchronous generator, which automatically runs on its
own thread, but in asynchronous applications, a loop over a <code>.map</code> or <code>.starmap</code> call can block the event loop. This will stop the <code>StreamingResponse</code> from
returning response parts iteratively to the client.</p> <p>To avoid this, you can use the <code>.aio()</code> method to convert a synchronous <code>.map</code> into its async version. Also, other blocking calls should be offloaded to a
separate thread with <code>asyncio.to_thread()</code>. For example:</p> <!> <!> <ul><li>Complete code for the simple examples given above is available <!>.</li> <li><!></li></ul>`,1);function T(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=w(),m=s(o);f(m,{id:`streaming-endpoints`,children:(e,t)=>{l(),i(e,r(`Streaming endpoints`))},$$slots:{default:!0}});var g=c(m,2),_=c(e(g),3);h(_,{href:`https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),h(c(_,2),{href:`https://docs.python.org/3/library/stdtypes.html#typeiter`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);u(v,{id:`simple-example`,children:(e,t)=>{l(),i(e,r(`Simple example`))},$$slots:{default:!0}});var y=c(v,4);p(y,{code:`import%20time%0A%0Adef%20fake_event_streamer()%3A%0A%20%20%20%20for%20i%20in%20range(10)%3A%0A%20%20%20%20%20%20%20%20yield%20f%22data%3A%20some%20data%20%7Bi%7D%5Cn%5Cn%22.encode()%0A%20%20%20%20%20%20%20%20time.sleep(0.5)%0A%0A%0A%40app.function(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint()%0Adef%20stream_me()%3A%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A%20%20%20%20return%20StreamingResponse(%0A%20%20%20%20%20%20%20%20fake_event_streamer()%2C%20media_type%3D%22text%2Fevent-stream%22%0A%20%20%20%20)`,lang:`python`});var T=c(y,4);p(T,{code:`curl%20--no-buffer%20https%3A%2F%2Fmodal-labs--example-streaming-stream-me.modal.run`,lang:`shell`});var E=c(T,6);u(E,{id:`streaming-responses-with-remote`,children:(e,t)=>{l();var n=S();l(),i(e,n)},$$slots:{default:!0}});var D=c(E,4);p(D,{code:`%40app.function(gpu%3D%22any%22)%0Adef%20fake_video_render()%3A%0A%20%20%20%20for%20i%20in%20range(10)%3A%0A%20%20%20%20%20%20%20%20yield%20f%22data%3A%20finished%20processing%20some%20data%20from%20GPU%20%7Bi%7D%5Cn%5Cn%22.encode()%0A%20%20%20%20%20%20%20%20time.sleep(1)%0A%0A%0A%40app.function(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint()%0Adef%20hook()%3A%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A%20%20%20%20return%20StreamingResponse(%0A%20%20%20%20%20%20%20%20fake_video_render.remote_gen()%2C%20media_type%3D%22text%2Fevent-stream%22%0A%20%20%20%20)`,lang:`python`});var O=c(D,2);u(O,{id:`streaming-responses-with-map-and-starmap`,children:(e,t)=>{l();var n=C();l(3),i(e,n)},$$slots:{default:!0}});var k=c(O,4);p(k,{code:`%40app.function()%0Adef%20map_me(i)%3A%0A%20%20%20%20return%20f%22segment%20%7Bi%7D%5Cn%22%0A%0A%0A%40app.function(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint()%0Adef%20mapped()%3A%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A%20%20%20%20return%20StreamingResponse(map_me.map(range(10))%2C%20media_type%3D%22text%2Fplain%22)`,lang:`python`});var A=c(k,4);d(A,{id:`asynchronous-streaming`,children:(e,t)=>{l(),i(e,r(`Asynchronous streaming`))},$$slots:{default:!0}});var j=c(A,6);p(j,{code:`%40app.function(gpu%3D%22any%22%2C%20image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint()%0Aasync%20def%20transcribe_video(request)%3A%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A%0A%20%20%20%20segments%20%3D%20await%20asyncio.to_thread(split_video%2C%20request)%0A%20%20%20%20return%20StreamingResponse(wrapper(segments)%2C%20media_type%3D%22text%2Fevent-stream%22)%0A%0A%0A%23%20Notice%20that%20this%20is%20an%20async%20generator.%0Aasync%20def%20wrapper(segments)%3A%0A%20%20%20%20async%20for%20partial_result%20in%20transcribe_video.map.aio(segments)%3A%0A%20%20%20%20%20%20%20%20yield%20%22data%3A%20%22%20%2B%20partial_result%20%2B%20%22%5Cn%5Cn%22`,lang:`python`});var M=c(j,2);u(M,{id:`further-examples`,children:(e,t)=>{l(),i(e,r(`Further examples`))},$$slots:{default:!0}});var N=c(M,2),P=e(N);h(c(e(P)),{href:`https://github.com/modal-labs/modal-examples/blob/main/07_web_endpoints/streaming.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`in our modal-examples Github repository`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);h(e(F),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/streaming/main.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`An end-to-end example of streaming Youtube video transcriptions with OpenAI’s whisper model.`))},$$slots:{default:!0}}),n(F),n(N),i(t,o)},$$slots:{default:!0}}))}export{T as default,g as metadata};
//# sourceMappingURL=CnhwSF3J.js.map
