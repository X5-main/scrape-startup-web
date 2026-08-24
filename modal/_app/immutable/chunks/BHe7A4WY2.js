(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7403154f-6597-45a1-8871-69101d3bc9c1`,e._sentryDebugIdIdentifier=`sentry-dbid-7403154f-6597-45a1-8871-69101d3bc9c1`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Stream transcriptions with Kyutai STT`,id:`stream-transcriptions-with-kyutai-stt`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Run Kyutai STT inference on Modal`,id:`run-kyutai-stt-inference-on-modal`},{depth:2,value:`Run a local Python client to test streaming STT`,id:`run-a-local-python-client-to-test-streaming-stt`},{depth:2,value:`Deploy a streaming STT service on the Web`,id:`deploy-a-streaming-stt-service-on-the-web`}]}],rawContent:`# Stream transcriptions with Kyutai STT

This example demonstrates the deployment of a streaming audio transcription service with Kyutai STT on Modal.

[Kyutai STT](https://kyutai.org/next/stt) is an automated speech recognition/transcription model
that is designed to operate on streams of audio, rather than on complete audio files.
See the linked blog post for details on their "delayed streams" architecture.

## Setup

We start by importing some basic packages and the Modal SDK.

\`\`\`python
import asyncio
import base64
import time
from pathlib import Path

import modal

\`\`\`

Then we define a Modal App and an
[Image](https://modal.com/docs/guide/images)
with the dependencies of our speech-to-text system.

\`\`\`python
app = modal.App(name="example-streaming-kyutai-stt")

stt_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "moshi==0.2.9", "fastapi==0.116.1", "huggingface-hub==0.33.5", "julius==0.2.7"
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)

\`\`\`

One dependency is missing: the model weights.

Instead of including them in the Image or loading them every time the Function starts,
we add them to a Modal [Volume](https://modal.com/docs/guide/volumes).
Volumes are like a shared disk that all Modal Functions can access.

For more details on patterns for handling model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
MODEL_NAME = "kyutai/stt-1b-en_fr"

hf_cache_vol = modal.Volume.from_name(f"{app.name}-hf-cache", create_if_missing=True)
hf_cache_vol_path = Path("/root/.cache/huggingface")
volumes = {hf_cache_vol_path: hf_cache_vol}

\`\`\`

## Run Kyutai STT inference on Modal

Now we're ready to add the code that runs the speech-to-text model.

We use a Modal [Cls](https://modal.com/docs/guide/lifecycle-functions)
so that we can separate out the model loading and setup code from the inference.

For more on lifecycle management with Clses and cold start penalty reduction on Modal, see
[this guide](https://modal.com/docs/guide/cold-start).

We also define multiple ways to access the underlying streaming STT service --
via a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API),
for Web clients like browsers,
and via a Modal [Queue](https://modal.com/docs/guide/queues)
for Python clients.

That plus the code for manipulating the streams of audio bytes and output text
leads to a pretty big class! But there's not anything too complex here.

\`\`\`python
MINUTES = 60


@app.cls(image=stt_image, gpu="l40s", volumes=volumes, timeout=10 * MINUTES)
class STT:
    BATCH_SIZE = 1

    @modal.enter()
    def enter(self):
        import torch
        from huggingface_hub import snapshot_download
        from moshi.models import LMGen, loaders

        start_time = time.monotonic_ns()

        print("Loading model...")
        snapshot_download(MODEL_NAME)

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        checkpoint_info = loaders.CheckpointInfo.from_hf_repo(MODEL_NAME)
        self.mimi = checkpoint_info.get_mimi(device=self.device)
        self.frame_size = int(self.mimi.sample_rate / self.mimi.frame_rate)

        self.moshi = checkpoint_info.get_moshi(device=self.device)
        self.lm_gen = LMGen(self.moshi, temp=0, temp_text=0)

        self.mimi.streaming_forever(self.BATCH_SIZE)
        self.lm_gen.streaming_forever(self.BATCH_SIZE)

        self.text_tokenizer = checkpoint_info.get_text_tokenizer()

        self.audio_silence_prefix_seconds = checkpoint_info.stt_config.get(
            "audio_silence_prefix_seconds", 1.0
        )
        self.audio_delay_seconds = checkpoint_info.stt_config.get(
            "audio_delay_seconds", 5.0
        )
        self.padding_token_id = checkpoint_info.raw_config.get(
            "text_padding_token_id", 3
        )

        # warmup gpus
        for _ in range(4):
            codes = self.mimi.encode(
                torch.zeros(self.BATCH_SIZE, 1, self.frame_size).to(self.device)
            )
            for c in range(codes.shape[-1]):
                tokens = self.lm_gen.step(codes[:, :, c : c + 1])
                if tokens is None:
                    continue
        torch.cuda.synchronize()

        print(f"Model loaded in {round((time.monotonic_ns() - start_time) / 1e9, 2)}s")

    def reset_state(self):
        # reset llm chat history for this input
        self.mimi.reset_streaming()
        self.lm_gen.reset_streaming()

    async def transcribe(self, pcm, all_pcm_data):
        import numpy as np
        import torch

        if pcm is None:
            yield all_pcm_data
            return
        if len(pcm) == 0:
            yield all_pcm_data
            return

        if pcm.shape[-1] == 0:
            yield all_pcm_data
            return

        if all_pcm_data is None:
            all_pcm_data = pcm
        else:
            all_pcm_data = np.concatenate((all_pcm_data, pcm))

        # infer on each frame
        while all_pcm_data.shape[-1] >= self.frame_size:
            chunk = all_pcm_data[: self.frame_size]
            all_pcm_data = all_pcm_data[self.frame_size :]

            with torch.no_grad():
                chunk = torch.from_numpy(chunk)
                chunk = chunk.unsqueeze(0).unsqueeze(0)  # (1, 1, frame_size)
                chunk = chunk.expand(
                    self.BATCH_SIZE, -1, -1
                )  # (batch_size, 1, frame_size)
                chunk = chunk.to(device=self.device)

                # inference on audio chunk
                codes = self.mimi.encode(chunk)

                # language model inference against encoded audio
                for c in range(codes.shape[-1]):
                    text_tokens, vad_heads = self.lm_gen.step_with_extra_heads(
                        codes[:, :, c : c + 1]
                    )
                    if text_tokens is None:
                        # model is silent
                        yield all_pcm_data
                        return
                    if vad_heads:
                        pr_vad = vad_heads[2][0, 0, 0].cpu().item()
                        if pr_vad > 0.5:
                            # end of turn detected
                            yield all_pcm_data
                            return

                    assert text_tokens.shape[1] == self.lm_gen.lm_model.dep_q + 1

                    text_token = text_tokens[0, 0, 0].item()
                    if text_token not in (0, 3):
                        text = self.text_tokenizer.id_to_piece(text_token)
                        text = text.replace("▁", " ")
                        yield text

        yield all_pcm_data

    @modal.asgi_app()
    def api(self):
        import sphn
        from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect

        web_app = FastAPI()

        @web_app.get("/status")
        async def status():
            return Response(status_code=200)

        @web_app.websocket("/ws")
        async def transcribe_websocket(ws: WebSocket):
            await ws.accept()

            opus_stream_inbound = sphn.OpusStreamReader(self.mimi.sample_rate)
            transcription_queue = asyncio.Queue()

            print("Session started")
            tasks = []

            # asyncio to run multiple loops concurrently within single websocket connection
            async def recv_loop():
                """
                Receives Opus stream across websocket, appends into inbound queue.
                """
                nonlocal opus_stream_inbound
                while True:
                    data = await ws.receive_bytes()

                    if not isinstance(data, bytes):
                        print("received non-bytes message")
                        continue
                    if len(data) == 0:
                        print("received empty message")
                        continue
                    opus_stream_inbound.append_bytes(data)

            async def inference_loop():
                """
                Runs streaming inference on inbound data, and if any response audio is created, appends it to the outbound stream.
                """
                nonlocal opus_stream_inbound, transcription_queue
                all_pcm_data = None

                while True:
                    await asyncio.sleep(0.001)

                    pcm = opus_stream_inbound.read_pcm()
                    async for msg in self.transcribe(pcm, all_pcm_data):
                        if isinstance(msg, str):
                            transcription_queue.put_nowait(msg)
                        else:
                            all_pcm_data = msg

            async def send_loop():
                """
                Reads outbound data, and sends it across websocket
                """
                nonlocal transcription_queue
                while True:
                    data = await transcription_queue.get()

                    if data is None:
                        continue

                    msg = b"\\x01" + bytes(
                        data, encoding="utf8"
                    )  # prepend "\\x01" as a tag to indicate text
                    await ws.send_bytes(msg)

            # run all loops concurrently
            try:
                tasks = [
                    asyncio.create_task(recv_loop()),
                    asyncio.create_task(inference_loop()),
                    asyncio.create_task(send_loop()),
                ]
                await asyncio.gather(*tasks)

            except WebSocketDisconnect:
                print("WebSocket disconnected")
                await ws.close(code=1000)
            except Exception as e:
                print("Exception:", e)
                await ws.close(code=1011)  # internal error
                raise e
            finally:
                for task in tasks:
                    task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)
                self.reset_state()

        return web_app

    @modal.method()
    async def transcribe_queue(self, q: modal.Queue):
        import tempfile

        import sphn

        all_pcm_data = None

        while True:
            chunk = await q.get.aio(partition="audio")
            if chunk is None:
                await q.put.aio(None, partition="transcription")
                break

            # to avoid having to encode the audio and retrieve with OpusStreamReader:
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                tmp.write(chunk)
                tmp.flush()
                pcm, _ = sphn.read(tmp.name)
                pcm = pcm.squeeze(0)

            async for msg in self.transcribe(pcm, all_pcm_data):
                if isinstance(msg, str):
                    await q.put.aio(msg, partition="transcription")
                else:
                    all_pcm_data = msg


\`\`\`

## Run a local Python client to test streaming STT

We can test this code on the same production Modal infra
that we'll be deploying it on by writing a quick \`local_entrypoint\` for testing.

We just need a few helper functions to control the streaming of audio bytes
and transcribed text from local Python.

These communicate asynchronously with the deployed Function using a Modal Queue.

\`\`\`python
async def chunk_audio(data: bytes, chunk_size: int):
    for i in range(0, len(data), chunk_size):
        yield data[i : i + chunk_size]


async def send_audio(audio_bytes: bytes, q: modal.Queue, chunk_size: int, rtf: int):
    async for chunk in chunk_audio(audio_bytes, chunk_size):
        await q.put.aio(chunk, partition="audio")
        await asyncio.sleep(chunk_size / chunk_size / rtf)
    await q.put.aio(None, partition="audio")


async def receive_text(q: modal.Queue):
    break_counter, break_every = 0, 20
    while True:
        data = await q.get.aio(partition="transcription")
        if data is None:
            break
        print(data, end="")
        break_counter += 1
        if break_counter >= break_every:
            print()
            break_counter = 0


\`\`\`

Now we write our quick test, which loads in audio from a URL
and then passes it to the remote Function via a

If you run this example with

\`\`\`bash
modal run streaming_kyutai_stt.py
\`\`\`

you will

1. deploy the latest version of the code on Modal
2. spin up a new GPU to handle transcription
3. load the model from Hugging Face or the Modal Volume cache
4. send the audio out to the new GPU container, transcribe it, and receive it locally to be printed.

Not bad for a single Python file with no dependencies except Modal!

\`\`\`python
@app.local_entrypoint()
async def test(
    chunk_size: int = 24_000,  # bytes
    rtf: int = 1000,
    audio_url: str = "https://github.com/kyutai-labs/delayed-streams-modeling/raw/refs/heads/main/audio/bria.mp3",
):
    from urllib.request import urlopen

    print(f"Downloading audio file from {audio_url}")
    audio_bytes = urlopen(audio_url).read()
    print(f"Downloaded {len(audio_bytes)} bytes")

    print("Starting transcription")
    start_time = time.monotonic_ns()
    async with modal.Queue.ephemeral() as q:
        await STT().transcribe_queue.spawn.aio(q)
        send = asyncio.create_task(send_audio(audio_bytes, q, chunk_size, rtf))
        recv = asyncio.create_task(receive_text(q))
        await asyncio.gather(send, recv)
    print(
        f"\\nTranscription complete in {round((time.monotonic_ns() - start_time) / 1e9, 2)}s"
    )


\`\`\`

## Deploy a streaming STT service on the Web

We've already written a Web backend for our streaming STT service --
that's the FastAPI API with the WebSocket in the Modal Cls above.

We can also deploy a Web frontend. To keep things almost entirely "pure Python",
we here use the [FastHTML](https://www.fastht.ml/) library,
but you can also deploy a JavaScript frontend with a FastAPI or Node backend.

We do use a bit of JS for the audio processing in the browser.
We add it to the Modal Image using \`add_local_dir\`.
You can find the frontend files [here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/speech-to-text/streaming-kyutai-stt-frontend).

\`\`\`python
web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("python-fasthtml==0.12.20")
    .add_local_dir(
        Path(__file__).parent / "streaming-kyutai-stt-frontend", "/root/frontend"
    )
)

\`\`\`

You can deploy this frontend with

\`\`\`bash
modal deploy streaming_kyutai_stt.py
\`\`\`

and then interact with it at the printed \`ui\` URL.

\`\`\`python
@app.function(image=web_image, timeout=10 * MINUTES)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import fasthtml.common as fh

    modal_logo_svg = open("/root/frontend/modal-logo.svg").read()
    modal_logo_base64 = base64.b64encode(modal_logo_svg.encode()).decode()
    app_js = open("/root/frontend/audio.js").read()

    fast_app, rt = fh.fast_app(
        hdrs=[
            # audio recording libraries
            fh.Script(
                src="https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/recorder.min.js"
            ),
            fh.Script(
                src="https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/encoderWorker.min.js"
            ),
            fh.Script(
                src="https://cdn.jsdelivr.net/npm/ogg-opus-decoder/dist/ogg-opus-decoder.min.js"
            ),
            # styling
            fh.Link(
                href="https://fonts.googleapis.com/css?family=Inter:300,400,600",
                rel="stylesheet",
            ),
            fh.Script(src="https://cdn.tailwindcss.com"),
            fh.Script("""
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                ground: "#0C0F0B",
                                primary: "#9AEE86",
                                "accent-pink": "#FC9CC6",
                                "accent-blue": "#B8E4FF",
                            },
                        },
                    },
                };
            """),
        ],
    )

    @rt("/")
    def get():
        return (
            fh.Title("Kyutai Streaming STT"),
            fh.Body(
                fh.Div(
                    fh.Div(
                        fh.Div(
                            id="text-output",
                            cls="flex flex-col-reverse overflow-y-auto max-h-64 pr-2",
                        ),
                        cls="w-full overflow-y-auto max-h-64",
                    ),
                    cls="bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6",
                ),
                fh.Footer(
                    fh.Span(
                        "Built with ",
                        fh.A(
                            "Kyutai",
                            href="https://github.com/kyutai-labs/delayed-streams-modeling",
                            target="_blank",
                            rel="noopener noreferrer",
                            cls="underline",
                        ),
                        " and",
                        cls="text-sm font-medium text-gray-300 mr-2",
                    ),
                    fh.A(
                        fh.Img(
                            src=f"data:image/svg+xml;base64,{modal_logo_base64}",
                            alt="Modal logo",
                            cls="w-24",
                        ),
                        cls="flex items-center p-2 rounded-lg bg-gray-800 shadow-lg hover:bg-gray-700 transition-colors duration-200",
                        href="https://modal.com",
                        target="_blank",
                        rel="noopener noreferrer",
                    ),
                    cls="fixed bottom-4 inline-flex items-center justify-center",
                ),
                fh.Script(app_js),
                cls="relative bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4",
            ),
        )

    return fast_app

\`\`\`
`,meta:{title:`Stream transcriptions with Kyutai STT`,description:`This example demonstrates the deployment of a streaming audio transcription service with Kyutai STT on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates the deployment of a streaming audio transcription service with Kyutai STT on Modal.</p> <p><!> is an automated speech recognition/transcription model
that is designed to operate on streams of audio, rather than on complete audio files.
See the linked blog post for details on their “delayed streams” architecture.</p> <!> <p>We start by importing some basic packages and the Modal SDK.</p> <!> <p>Then we define a Modal App and an <!> with the dependencies of our speech-to-text system.</p> <!> <p>One dependency is missing: the model weights.</p> <p>Instead of including them in the Image or loading them every time the Function starts,
we add them to a Modal <!>.
Volumes are like a shared disk that all Modal Functions can access.</p> <p>For more details on patterns for handling model weights on Modal, see <!>.</p> <!> <!> <p>Now we’re ready to add the code that runs the speech-to-text model.</p> <p>We use a Modal <!> so that we can separate out the model loading and setup code from the inference.</p> <p>For more on lifecycle management with Clses and cold start penalty reduction on Modal, see <!>.</p> <p>We also define multiple ways to access the underlying streaming STT service —
via a <!>,
for Web clients like browsers,
and via a Modal <!> for Python clients.</p> <p>That plus the code for manipulating the streams of audio bytes and output text
leads to a pretty big class! But there’s not anything too complex here.</p> <!> <!> <p>We can test this code on the same production Modal infra
that we’ll be deploying it on by writing a quick <code>local_entrypoint</code> for testing.</p> <p>We just need a few helper functions to control the streaming of audio bytes
and transcribed text from local Python.</p> <p>These communicate asynchronously with the deployed Function using a Modal Queue.</p> <!> <p>Now we write our quick test, which loads in audio from a URL
and then passes it to the remote Function via a</p> <p>If you run this example with</p> <!> <p>you will</p> <ol><li>deploy the latest version of the code on Modal</li> <li>spin up a new GPU to handle transcription</li> <li>load the model from Hugging Face or the Modal Volume cache</li> <li>send the audio out to the new GPU container, transcribe it, and receive it locally to be printed.</li></ol> <p>Not bad for a single Python file with no dependencies except Modal!</p> <!> <!> <p>We’ve already written a Web backend for our streaming STT service —
that’s the FastAPI API with the WebSocket in the Modal Cls above.</p> <p>We can also deploy a Web frontend. To keep things almost entirely “pure Python”,
we here use the <!> library,
but you can also deploy a JavaScript frontend with a FastAPI or Node backend.</p> <p>We do use a bit of JS for the audio processing in the browser.
We add it to the Modal Image using <code>add_local_dir</code>.
You can find the frontend files <!>.</p> <!> <p>You can deploy this frontend with</p> <!> <p>and then interact with it at the printed <code>ui</code> URL.</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`stream-transcriptions-with-kyutai-stt`,children:(e,t)=>{l(),i(e,r(`Stream transcriptions with Kyutai STT`))},$$slots:{default:!0}});var h=c(p,4);m(e(h),{href:`https://kyutai.org/next/stt`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kyutai STT`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`import%20asyncio%0Aimport%20base64%0Aimport%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);f(b,{code:`app%20%3D%20modal.App(name%3D%22example-streaming-kyutai-stt%22)%0A%0Astt_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22moshi%3D%3D0.2.9%22%2C%20%22fastapi%3D%3D0.116.1%22%2C%20%22huggingface-hub%3D%3D0.33.5%22%2C%20%22julius%3D%3D0.2.7%22%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%0A)%0A`,lang:`python`});var x=c(b,4);m(c(e(x)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);m(c(e(S)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);f(C,{code:`MODEL_NAME%20%3D%20%22kyutai%2Fstt-1b-en_fr%22%0A%0Ahf_cache_vol%20%3D%20modal.Volume.from_name(f%22%7Bapp.name%7D-hf-cache%22%2C%20create_if_missing%3DTrue)%0Ahf_cache_vol_path%20%3D%20Path(%22%2Froot%2F.cache%2Fhuggingface%22)%0Avolumes%20%3D%20%7Bhf_cache_vol_path%3A%20hf_cache_vol%7D%0A`,lang:`python`});var w=c(C,2);u(w,{id:`run-kyutai-stt-inference-on-modal`,children:(e,t)=>{l(),i(e,r(`Run Kyutai STT inference on Modal`))},$$slots:{default:!0}});var T=c(w,4);m(c(e(T)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);m(c(e(E)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2),O=c(e(D));m(O,{href:`https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WebSocket`))},$$slots:{default:!0}}),m(c(O,2),{href:`https://modal.com/docs/guide/queues`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Queue`))},$$slots:{default:!0}}),l(),n(D);var k=c(D,4);f(k,{code:`MINUTES%20%3D%2060%0A%0A%0A%40app.cls(image%3Dstt_image%2C%20gpu%3D%22l40s%22%2C%20volumes%3Dvolumes%2C%20timeout%3D10%20*%20MINUTES)%0Aclass%20STT%3A%0A%20%20%20%20BATCH_SIZE%20%3D%201%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%20%20%20%20%20%20%20%20from%20moshi.models%20import%20LMGen%2C%20loaders%0A%0A%20%20%20%20%20%20%20%20start_time%20%3D%20time.monotonic_ns()%0A%0A%20%20%20%20%20%20%20%20print(%22Loading%20model...%22)%0A%20%20%20%20%20%20%20%20snapshot_download(MODEL_NAME)%0A%0A%20%20%20%20%20%20%20%20self.device%20%3D%20%22cuda%22%20if%20torch.cuda.is_available()%20else%20%22cpu%22%0A%0A%20%20%20%20%20%20%20%20checkpoint_info%20%3D%20loaders.CheckpointInfo.from_hf_repo(MODEL_NAME)%0A%20%20%20%20%20%20%20%20self.mimi%20%3D%20checkpoint_info.get_mimi(device%3Dself.device)%0A%20%20%20%20%20%20%20%20self.frame_size%20%3D%20int(self.mimi.sample_rate%20%2F%20self.mimi.frame_rate)%0A%0A%20%20%20%20%20%20%20%20self.moshi%20%3D%20checkpoint_info.get_moshi(device%3Dself.device)%0A%20%20%20%20%20%20%20%20self.lm_gen%20%3D%20LMGen(self.moshi%2C%20temp%3D0%2C%20temp_text%3D0)%0A%0A%20%20%20%20%20%20%20%20self.mimi.streaming_forever(self.BATCH_SIZE)%0A%20%20%20%20%20%20%20%20self.lm_gen.streaming_forever(self.BATCH_SIZE)%0A%0A%20%20%20%20%20%20%20%20self.text_tokenizer%20%3D%20checkpoint_info.get_text_tokenizer()%0A%0A%20%20%20%20%20%20%20%20self.audio_silence_prefix_seconds%20%3D%20checkpoint_info.stt_config.get(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22audio_silence_prefix_seconds%22%2C%201.0%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.audio_delay_seconds%20%3D%20checkpoint_info.stt_config.get(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22audio_delay_seconds%22%2C%205.0%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.padding_token_id%20%3D%20checkpoint_info.raw_config.get(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text_padding_token_id%22%2C%203%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20warmup%20gpus%0A%20%20%20%20%20%20%20%20for%20_%20in%20range(4)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20codes%20%3D%20self.mimi.encode(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20torch.zeros(self.BATCH_SIZE%2C%201%2C%20self.frame_size).to(self.device)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20c%20in%20range(codes.shape%5B-1%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tokens%20%3D%20self.lm_gen.step(codes%5B%3A%2C%20%3A%2C%20c%20%3A%20c%20%2B%201%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20tokens%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20torch.cuda.synchronize()%0A%0A%20%20%20%20%20%20%20%20print(f%22Model%20loaded%20in%20%7Bround((time.monotonic_ns()%20-%20start_time)%20%2F%201e9%2C%202)%7Ds%22)%0A%0A%20%20%20%20def%20reset_state(self)%3A%0A%20%20%20%20%20%20%20%20%23%20reset%20llm%20chat%20history%20for%20this%20input%0A%20%20%20%20%20%20%20%20self.mimi.reset_streaming()%0A%20%20%20%20%20%20%20%20self.lm_gen.reset_streaming()%0A%0A%20%20%20%20async%20def%20transcribe(self%2C%20pcm%2C%20all_pcm_data)%3A%0A%20%20%20%20%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20%20%20%20%20import%20torch%0A%0A%20%20%20%20%20%20%20%20if%20pcm%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20if%20len(pcm)%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20if%20pcm.shape%5B-1%5D%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20if%20all_pcm_data%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20pcm%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20np.concatenate((all_pcm_data%2C%20pcm))%0A%0A%20%20%20%20%20%20%20%20%23%20infer%20on%20each%20frame%0A%20%20%20%20%20%20%20%20while%20all_pcm_data.shape%5B-1%5D%20%3E%3D%20self.frame_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20all_pcm_data%5B%3A%20self.frame_size%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20all_pcm_data%5Bself.frame_size%20%3A%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20torch.from_numpy(chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20chunk.unsqueeze(0).unsqueeze(0)%20%20%23%20(1%2C%201%2C%20frame_size)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20chunk.expand(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.BATCH_SIZE%2C%20-1%2C%20-1%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20(batch_size%2C%201%2C%20frame_size)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20chunk.to(device%3Dself.device)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20inference%20on%20audio%20chunk%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20codes%20%3D%20self.mimi.encode(chunk)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20language%20model%20inference%20against%20encoded%20audio%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20c%20in%20range(codes.shape%5B-1%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text_tokens%2C%20vad_heads%20%3D%20self.lm_gen.step_with_extra_heads(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20codes%5B%3A%2C%20%3A%2C%20c%20%3A%20c%20%2B%201%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20text_tokens%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20model%20is%20silent%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20vad_heads%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr_vad%20%3D%20vad_heads%5B2%5D%5B0%2C%200%2C%200%5D.cpu().item()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20pr_vad%20%3E%200.5%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20end%20of%20turn%20detected%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20assert%20text_tokens.shape%5B1%5D%20%3D%3D%20self.lm_gen.lm_model.dep_q%20%2B%201%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text_token%20%3D%20text_tokens%5B0%2C%200%2C%200%5D.item()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20text_token%20not%20in%20(0%2C%203)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%20%3D%20self.text_tokenizer.id_to_piece(text_token)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%20%3D%20text.replace(%22%E2%96%81%22%2C%20%22%20%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%20text%0A%0A%20%20%20%20%20%20%20%20yield%20all_pcm_data%0A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20api(self)%3A%0A%20%20%20%20%20%20%20%20import%20sphn%0A%20%20%20%20%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Response%2C%20WebSocket%2C%20WebSocketDisconnect%0A%0A%20%20%20%20%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2Fstatus%22)%0A%20%20%20%20%20%20%20%20async%20def%20status()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20Response(status_code%3D200)%0A%0A%20%20%20%20%20%20%20%20%40web_app.websocket(%22%2Fws%22)%0A%20%20%20%20%20%20%20%20async%20def%20transcribe_websocket(ws%3A%20WebSocket)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.accept()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20opus_stream_inbound%20%3D%20sphn.OpusStreamReader(self.mimi.sample_rate)%0A%20%20%20%20%20%20%20%20%20%20%20%20transcription_queue%20%3D%20asyncio.Queue()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Session%20started%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20asyncio%20to%20run%20multiple%20loops%20concurrently%20within%20single%20websocket%20connection%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20recv_loop()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Receives%20Opus%20stream%20across%20websocket%2C%20appends%20into%20inbound%20queue.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nonlocal%20opus_stream_inbound%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20ws.receive_bytes()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20isinstance(data%2C%20bytes)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22received%20non-bytes%20message%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20len(data)%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22received%20empty%20message%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20opus_stream_inbound.append_bytes(data)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20inference_loop()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Runs%20streaming%20inference%20on%20inbound%20data%2C%20and%20if%20any%20response%20audio%20is%20created%2C%20appends%20it%20to%20the%20outbound%20stream.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nonlocal%20opus_stream_inbound%2C%20transcription_queue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20None%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.001)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pcm%20%3D%20opus_stream_inbound.read_pcm()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20async%20for%20msg%20in%20self.transcribe(pcm%2C%20all_pcm_data)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(msg%2C%20str)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20transcription_queue.put_nowait(msg)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20msg%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20send_loop()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Reads%20outbound%20data%2C%20and%20sends%20it%20across%20websocket%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nonlocal%20transcription_queue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20transcription_queue.get()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20data%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20msg%20%3D%20b%22%5Cx01%22%20%2B%20bytes(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%2C%20encoding%3D%22utf8%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20prepend%20%22%5Cx01%22%20as%20a%20tag%20to%20indicate%20text%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.send_bytes(msg)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20run%20all%20loops%20concurrently%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(recv_loop())%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(inference_loop())%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(send_loop())%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(*tasks)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20WebSocketDisconnect%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22WebSocket%20disconnected%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.close(code%3D1000)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%3A%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.close(code%3D1011)%20%20%23%20internal%20error%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%20%20%20%20%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20task%20in%20tasks%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20task.cancel()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(*tasks%2C%20return_exceptions%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.reset_state()%0A%0A%20%20%20%20%20%20%20%20return%20web_app%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20transcribe_queue(self%2C%20q%3A%20modal.Queue)%3A%0A%20%20%20%20%20%20%20%20import%20tempfile%0A%0A%20%20%20%20%20%20%20%20import%20sphn%0A%0A%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20None%0A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20await%20q.get.aio(partition%3D%22audio%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(None%2C%20partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20to%20avoid%20having%20to%20encode%20the%20audio%20and%20retrieve%20with%20OpusStreamReader%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20tempfile.NamedTemporaryFile(suffix%3D%22.mp3%22%2C%20delete%3DFalse)%20as%20tmp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tmp.write(chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tmp.flush()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pcm%2C%20_%20%3D%20sphn.read(tmp.name)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pcm%20%3D%20pcm.squeeze(0)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20for%20msg%20in%20self.transcribe(pcm%2C%20all_pcm_data)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(msg%2C%20str)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(msg%2C%20partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20all_pcm_data%20%3D%20msg%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`run-a-local-python-client-to-test-streaming-stt`,children:(e,t)=>{l(),i(e,r(`Run a local Python client to test streaming STT`))},$$slots:{default:!0}});var j=c(A,8);f(j,{code:`async%20def%20chunk_audio(data%3A%20bytes%2C%20chunk_size%3A%20int)%3A%0A%20%20%20%20for%20i%20in%20range(0%2C%20len(data)%2C%20chunk_size)%3A%0A%20%20%20%20%20%20%20%20yield%20data%5Bi%20%3A%20i%20%2B%20chunk_size%5D%0A%0A%0Aasync%20def%20send_audio(audio_bytes%3A%20bytes%2C%20q%3A%20modal.Queue%2C%20chunk_size%3A%20int%2C%20rtf%3A%20int)%3A%0A%20%20%20%20async%20for%20chunk%20in%20chunk_audio(audio_bytes%2C%20chunk_size)%3A%0A%20%20%20%20%20%20%20%20await%20q.put.aio(chunk%2C%20partition%3D%22audio%22)%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(chunk_size%20%2F%20chunk_size%20%2F%20rtf)%0A%20%20%20%20await%20q.put.aio(None%2C%20partition%3D%22audio%22)%0A%0A%0Aasync%20def%20receive_text(q%3A%20modal.Queue)%3A%0A%20%20%20%20break_counter%2C%20break_every%20%3D%200%2C%2020%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20data%20%3D%20await%20q.get.aio(partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20if%20data%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20print(data%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20break_counter%20%2B%3D%201%0A%20%20%20%20%20%20%20%20if%20break_counter%20%3E%3D%20break_every%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print()%0A%20%20%20%20%20%20%20%20%20%20%20%20break_counter%20%3D%200%0A%0A`,lang:`python`});var M=c(j,6);f(M,{code:`modal%20run%20streaming_kyutai_stt.py`,lang:`bash`});var N=c(M,8);f(N,{code:`%40app.local_entrypoint()%0Aasync%20def%20test(%0A%20%20%20%20chunk_size%3A%20int%20%3D%2024_000%2C%20%20%23%20bytes%0A%20%20%20%20rtf%3A%20int%20%3D%201000%2C%0A%20%20%20%20audio_url%3A%20str%20%3D%20%22https%3A%2F%2Fgithub.com%2Fkyutai-labs%2Fdelayed-streams-modeling%2Fraw%2Frefs%2Fheads%2Fmain%2Faudio%2Fbria.mp3%22%2C%0A)%3A%0A%20%20%20%20from%20urllib.request%20import%20urlopen%0A%0A%20%20%20%20print(f%22Downloading%20audio%20file%20from%20%7Baudio_url%7D%22)%0A%20%20%20%20audio_bytes%20%3D%20urlopen(audio_url).read()%0A%20%20%20%20print(f%22Downloaded%20%7Blen(audio_bytes)%7D%20bytes%22)%0A%0A%20%20%20%20print(%22Starting%20transcription%22)%0A%20%20%20%20start_time%20%3D%20time.monotonic_ns()%0A%20%20%20%20async%20with%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20%20%20%20%20await%20STT().transcribe_queue.spawn.aio(q)%0A%20%20%20%20%20%20%20%20send%20%3D%20asyncio.create_task(send_audio(audio_bytes%2C%20q%2C%20chunk_size%2C%20rtf))%0A%20%20%20%20%20%20%20%20recv%20%3D%20asyncio.create_task(receive_text(q))%0A%20%20%20%20%20%20%20%20await%20asyncio.gather(send%2C%20recv)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%5CnTranscription%20complete%20in%20%7Bround((time.monotonic_ns()%20-%20start_time)%20%2F%201e9%2C%202)%7Ds%22%0A%20%20%20%20)%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`deploy-a-streaming-stt-service-on-the-web`,children:(e,t)=>{l(),i(e,r(`Deploy a streaming STT service on the Web`))},$$slots:{default:!0}});var F=c(P,4);m(c(e(F)),{href:`https://www.fastht.ml/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastHTML`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);m(c(e(I),3),{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/speech-to-text/streaming-kyutai-stt-frontend`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,2);f(L,{code:`web_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22python-fasthtml%3D%3D0.12.20%22)%0A%20%20%20%20.add_local_dir(%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22streaming-kyutai-stt-frontend%22%2C%20%22%2Froot%2Ffrontend%22%0A%20%20%20%20)%0A)%0A`,lang:`python`});var R=c(L,4);f(R,{code:`modal%20deploy%20streaming_kyutai_stt.py`,lang:`bash`}),f(c(R,4),{code:`%40app.function(image%3Dweb_image%2C%20timeout%3D10%20*%20MINUTES)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20fasthtml.common%20as%20fh%0A%0A%20%20%20%20modal_logo_svg%20%3D%20open(%22%2Froot%2Ffrontend%2Fmodal-logo.svg%22).read()%0A%20%20%20%20modal_logo_base64%20%3D%20base64.b64encode(modal_logo_svg.encode()).decode()%0A%20%20%20%20app_js%20%3D%20open(%22%2Froot%2Ffrontend%2Faudio.js%22).read()%0A%0A%20%20%20%20fast_app%2C%20rt%20%3D%20fh.fast_app(%0A%20%20%20%20%20%20%20%20hdrs%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20audio%20recording%20libraries%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fopus-recorder%40latest%2Fdist%2Frecorder.min.js%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fopus-recorder%40latest%2Fdist%2FencoderWorker.min.js%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fogg-opus-decoder%2Fdist%2Fogg-opus-decoder.min.js%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20styling%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Link(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20href%3D%22https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DInter%3A300%2C400%2C600%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20rel%3D%22stylesheet%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(src%3D%22https%3A%2F%2Fcdn.tailwindcss.com%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tailwind.config%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20theme%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20extend%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20colors%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ground%3A%20%22%230C0F0B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20primary%3A%20%22%239AEE86%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22accent-pink%22%3A%20%22%23FC9CC6%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22accent-blue%22%3A%20%22%23B8E4FF%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22)%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%40rt(%22%2F%22)%0A%20%20%20%20def%20get()%3A%0A%20%20%20%20%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Title(%22Kyutai%20Streaming%20STT%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Body(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Div(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Div(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Div(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3D%22text-output%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22flex%20flex-col-reverse%20overflow-y-auto%20max-h-64%20pr-2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22w-full%20overflow-y-auto%20max-h-64%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22bg-gray-800%20rounded-lg%20shadow-lg%20w-full%20max-w-xl%20p-6%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Footer(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Span(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Built%20with%20%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.A(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Kyutai%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20href%3D%22https%3A%2F%2Fgithub.com%2Fkyutai-labs%2Fdelayed-streams-modeling%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20target%3D%22_blank%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20rel%3D%22noopener%20noreferrer%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22underline%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%20and%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22text-sm%20font-medium%20text-gray-300%20mr-2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.A(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Img(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20src%3Df%22data%3Aimage%2Fsvg%2Bxml%3Bbase64%2C%7Bmodal_logo_base64%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20alt%3D%22Modal%20logo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22w-24%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22flex%20items-center%20p-2%20rounded-lg%20bg-gray-800%20shadow-lg%20hover%3Abg-gray-700%20transition-colors%20duration-200%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20href%3D%22https%3A%2F%2Fmodal.com%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20target%3D%22_blank%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20rel%3D%22noopener%20noreferrer%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22fixed%20bottom-4%20inline-flex%20items-center%20justify-center%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Script(app_js)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22relative%20bg-gray-900%20text-white%20min-h-screen%20flex%20flex-col%20items-center%20justify-center%20p-4%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20fast_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BHe7A4WY2.js.map
