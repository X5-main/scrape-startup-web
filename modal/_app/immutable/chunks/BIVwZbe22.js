(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7cf2d8cb-149d-49e6-9028-c8a137c8f16c`,e._sentryDebugIdIdentifier=`sentry-dbid-7cf2d8cb-149d-49e6-9028-c8a137c8f16c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Streaming Speaker Diarization with Sortformer2.1`,id:`streaming-speaker-diarization-with-sortformer21`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Run Sortformer2.1 speaker diarization`,id:`run-sortformer21-speaker-diarization`},{depth:2,value:`Using WebSockets to stream audio and diarization results`,id:`using-websockets-to-stream-audio-and-diarization-results`},{depth:2,value:`Serving the diarization results to a frontend`,id:`serving-the-diarization-results-to-a-frontend`}]}],rawContent:`# Streaming Speaker Diarization with Sortformer2.1

In this example, we show how to deploy a streaming speaker diarization service with [NVIDIA's Sortformer2.1](https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1) on Modal.
Sortformer2.1 is a state-of-the-art speaker diarization model that is designed to operate on streams of audio.

Try it yourself! Click the "View on GitHub" button to see the code. And [sign up for a Modal account](https://modal.com/signup) if you haven't already.

## Setup

We start by importing some basic packages and the Modal SDK. As well as setting up our Modal App, Volume, and Image.

\`\`\`python
from pathlib import Path
from typing import Literal

import modal

app = modal.App("sortformer2-1-speaker-diarization")

CACHE_PATH = "/model"
cache_vol = modal.Volume.from_name("sortformer2_1-cache", create_if_missing=True)

image = (
    modal.Image.from_registry(
        "nvidia/cuda:13.0.1-cudnn-devel-ubuntu22.04", add_python="3.12"
    )
    .env(
        {
            "HF_HUB_ENABLE_HF_TRANSFER": "1",
            "HF_HOME": CACHE_PATH,  # cache directory for Hugging Face models
            "CXX": "g++",
            "CC": "g++",
            "TORCH_HOME": CACHE_PATH,
        }
    )
    .apt_install("git", "libsndfile1", "ffmpeg")
    .uv_pip_install(
        "hf_transfer==0.1.9",
        "huggingface_hub[hf-xet]==0.31.2",
        "cuda-python==13.0.1",
        "numpy<2",
        "fastapi",
        "nemo_toolkit[asr]@git+https://github.com/NVIDIA/NeMo.git@main",
    )
)

with image.imports():
    import asyncio
    import json
    import time

    from fastapi import FastAPI, WebSocket, WebSocketDisconnect
    from starlette.websockets import WebSocketState

    from .sortformer2_1 import DiarizationConfig, NeMoStreamingDiarizer


\`\`\`

## Run Sortformer2.1 speaker diarization

Now we're ready to add the code that runs the Sortformer2.1 speaker diarization model.

We use a Modal [Cls](https://modal.com/docs/guide/lifecycle-functions)
so that we can separate out the model loading and setup code from the inference.
For more on lifecycle management with Clses and cold start penalty reduction on Modal, see
[this guide](https://modal.com/docs/guide/cold-start). In particular, the Sortformer2.1 model
is amenable to GPU snapshots which can significantly reduce cold start times.

We also include two configurations. The low latency configuration is used for real-time diarization,
and the high latency configuration is used for non-real-time diarization with higher accuracy.

## Using WebSockets to stream audio and diarization results

We use a Modal [ASGI](https://modal.com/docs/guide/webhooks) app to serve the diarization results
over WebSockets. This allows us to stream the diarization results to the client in real-time.

We use a simple queue-based architecture to handle the audio and diarization results.

The audio is received from the client over WebSockets and added to a queue.
The diarization results are then processed and added to a queue.
The diarization results are then sent to the client over WebSockets.

\`\`\`python
@app.cls(
    image=image,
    volumes={CACHE_PATH: cache_vol},
    gpu="L4",
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class Sortformer2_1_Speaker_Diarization:
    @modal.enter()
    def enter(self):
        self._LOW_LATENCY_CONFIG = DiarizationConfig(
            max_num_speakers=4,
            chunk_len=6,
            chunk_right_context=7,
            fifo_len=188,
            spkcache_refresh_rate=144,
            spkcache_len=188,
        )
        self._HIGH_LATENCY_CONFIG = DiarizationConfig(
            max_num_speakers=4,
            chunk_len=340,
            chunk_right_context=40,
            fifo_len=40,
            spkcache_refresh_rate=300,
            spkcache_len=188,
        )
        self.latency: Literal["low", "high"] = "low"
        self._SORTFORMER_FRAME_SIZE_BYTES = (
            16000 * 0.08 * 2
        )  # sample rate * frame size in seconds * 2 bytes (16 bit)
        if self.latency == "low":
            self.config = self._LOW_LATENCY_CONFIG
        else:
            self.config = self._HIGH_LATENCY_CONFIG
        # load model from Hugging Face model card directly (You need a Hugging Face token)
        self.diarizer = NeMoStreamingDiarizer(
            cfg=self.config, model="nvidia/diar_streaming_sortformer_4spk-v2.1"
        )

        self.web_app = FastAPI()

        @self.web_app.websocket("/ws")
        async def run_with_websocket(ws: WebSocket):
            audio_queue = asyncio.Queue()
            output_queue = asyncio.Queue()

            async def recv_loop(ws, audio_queue):
                audio_buffer = bytearray()
                while True:
                    data = await ws.receive_bytes()
                    audio_buffer.extend(data)
                    if len(audio_buffer) > self._SORTFORMER_FRAME_SIZE_BYTES:
                        await audio_queue.put(audio_buffer)
                        audio_buffer = bytearray()

            async def inference_loop(audio_queue, output_queue):
                while True:
                    audio_data = await audio_queue.get()

                    start_time = time.perf_counter()
                    diar_result = self.diarizer.diarize(audio_data)

                    probs = self._get_speaker_probabilities(diar_result)
                    await output_queue.put(json.dumps(probs))

                    end_time = time.perf_counter()
                    print(
                        f"time taken to diarize audio segment: {end_time - start_time} seconds"
                    )

            async def send_loop(output_queue, ws):
                while True:
                    output = await output_queue.get()
                    print(f"sending diarize result: {output}")
                    await ws.send_text(output)

            await ws.accept()

            try:
                tasks = [
                    asyncio.create_task(recv_loop(ws, audio_queue)),
                    asyncio.create_task(inference_loop(audio_queue, output_queue)),
                    asyncio.create_task(send_loop(output_queue, ws)),
                ]
                await asyncio.gather(*tasks)
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                ws = None
            except Exception as e:
                print("Exception:", e)
            finally:
                self.diarizer.reset_state()
                if ws and ws.application_state is WebSocketState.CONNECTED:
                    await ws.close(code=1011)  # internal error
                    ws = None
                for task in tasks:
                    if not task.done():
                        try:
                            task.cancel()
                            await task
                        except asyncio.CancelledError:
                            pass

    @modal.asgi_app()
    def webapp(self):
        return self.web_app

    def _get_speaker_probabilities(self, spk_pred):
        # spk_pred is a 6x4 matrix of probabilities
        # We want to return a 1x4 vector of probabilities for the total time window
        # We can take the mean across the time dimension (axis 0)
        return spk_pred.mean(axis=0).tolist()


\`\`\`

## Serving the diarization results to a frontend

We use a simple HTML frontend to display the diarization results.

\`\`\`python
web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("fastapi")
    .add_local_dir(
        Path(__file__).parent / "streaming-diarization-frontend", "/root/frontend"
    )
)

with web_image.imports():
    from fastapi import FastAPI, WebSocket
    from fastapi.responses import HTMLResponse, Response
    from fastapi.staticfiles import StaticFiles


@app.cls(image=web_image)
@modal.concurrent(max_inputs=20)
class WebServer:
    @modal.asgi_app()
    def web(self):
        web_app = FastAPI()
        web_app.mount("/static", StaticFiles(directory="frontend"))

        @web_app.get("/status")
        async def status():
            return Response(status_code=200)

        # serve frontend
        @web_app.get("/")
        async def index():
            html_content = open("frontend/index.html").read()

            # Get the base WebSocket URL (without transcriber parameters)
            cls_instance = modal.Cls.from_name(
                "sortformer2-1-speaker-diarization", "Sortformer2_1_Speaker_Diarization"
            )()
            ws_base_url = (
                cls_instance.webapp.get_web_url().replace("http", "ws") + "/ws"
            )
            script_tag = f''
            html_content = html_content.replace(
                '',
                f'{script_tag}\\n',
            )
            return HTMLResponse(content=html_content)

        return web_app

\`\`\`
`,meta:{title:`Streaming Speaker Diarization with Sortformer2.1`,description:`In this example, we show how to deploy a streaming speaker diarization service with NVIDIA’s Sortformer2.1 on Modal. Sortformer2.1 is a state-of-the-art speaker diarization model that is designed to operate on streams of audio.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>In this example, we show how to deploy a streaming speaker diarization service with <!> on Modal.
Sortformer2.1 is a state-of-the-art speaker diarization model that is designed to operate on streams of audio.</p> <p>Try it yourself! Click the “View on GitHub” button to see the code. And <!> if you haven’t already.</p> <!> <p>We start by importing some basic packages and the Modal SDK. As well as setting up our Modal App, Volume, and Image.</p> <!> <!> <p>Now we’re ready to add the code that runs the Sortformer2.1 speaker diarization model.</p> <p>We use a Modal <!> so that we can separate out the model loading and setup code from the inference.
For more on lifecycle management with Clses and cold start penalty reduction on Modal, see <!>. In particular, the Sortformer2.1 model
is amenable to GPU snapshots which can significantly reduce cold start times.</p> <p>We also include two configurations. The low latency configuration is used for real-time diarization,
and the high latency configuration is used for non-real-time diarization with higher accuracy.</p> <!> <p>We use a Modal <!> app to serve the diarization results
over WebSockets. This allows us to stream the diarization results to the client in real-time.</p> <p>We use a simple queue-based architecture to handle the audio and diarization results.</p> <p>The audio is received from the client over WebSockets and added to a queue.
The diarization results are then processed and added to a queue.
The diarization results are then sent to the client over WebSockets.</p> <!> <!> <p>We use a simple HTML frontend to display the diarization results.</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`streaming-speaker-diarization-with-sortformer21`,children:(e,t)=>{l(),i(e,r(`Streaming Speaker Diarization with Sortformer2.1`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA’s Sortformer2.1`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);m(c(e(g)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`sign up for a Modal account`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var v=c(_,4);f(v,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Literal%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22sortformer2-1-speaker-diarization%22)%0A%0ACACHE_PATH%20%3D%20%22%2Fmodel%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22sortformer2_1-cache%22%2C%20create_if_missing%3DTrue)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A13.0.1-cudnn-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20CACHE_PATH%2C%20%20%23%20cache%20directory%20for%20Hugging%20Face%20models%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CXX%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CC%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22TORCH_HOME%22%3A%20CACHE_PATH%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22libsndfile1%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22hf_transfer%3D%3D0.1.9%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%5Bhf-xet%5D%3D%3D0.31.2%22%2C%0A%20%20%20%20%20%20%20%20%22cuda-python%3D%3D13.0.1%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%22%2C%0A%20%20%20%20%20%20%20%20%22nemo_toolkit%5Basr%5D%40git%2Bhttps%3A%2F%2Fgithub.com%2FNVIDIA%2FNeMo.git%40main%22%2C%0A%20%20%20%20)%0A)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20asyncio%0A%20%20%20%20import%20json%0A%20%20%20%20import%20time%0A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20WebSocket%2C%20WebSocketDisconnect%0A%20%20%20%20from%20starlette.websockets%20import%20WebSocketState%0A%0A%20%20%20%20from%20.sortformer2_1%20import%20DiarizationConfig%2C%20NeMoStreamingDiarizer%0A%0A`,lang:`python`});var b=c(v,2);u(b,{id:`run-sortformer21-speaker-diarization`,children:(e,t)=>{l(),i(e,r(`Run Sortformer2.1 speaker diarization`))},$$slots:{default:!0}});var x=c(b,4),S=c(e(x));m(S,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),m(c(S,2),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(x);var C=c(x,4);u(C,{id:`using-websockets-to-stream-audio-and-diarization-results`,children:(e,t)=>{l(),i(e,r(`Using WebSockets to stream audio and diarization results`))},$$slots:{default:!0}});var w=c(C,2);m(c(e(w)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ASGI`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,6);f(T,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7BCACHE_PATH%3A%20cache_vol%7D%2C%0A%20%20%20%20gpu%3D%22L4%22%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A)%0Aclass%20Sortformer2_1_Speaker_Diarization%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20self._LOW_LATENCY_CONFIG%20%3D%20DiarizationConfig(%0A%20%20%20%20%20%20%20%20%20%20%20%20max_num_speakers%3D4%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_len%3D6%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_right_context%3D7%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fifo_len%3D188%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spkcache_refresh_rate%3D144%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spkcache_len%3D188%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self._HIGH_LATENCY_CONFIG%20%3D%20DiarizationConfig(%0A%20%20%20%20%20%20%20%20%20%20%20%20max_num_speakers%3D4%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_len%3D340%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_right_context%3D40%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fifo_len%3D40%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spkcache_refresh_rate%3D300%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spkcache_len%3D188%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.latency%3A%20Literal%5B%22low%22%2C%20%22high%22%5D%20%3D%20%22low%22%0A%20%20%20%20%20%20%20%20self._SORTFORMER_FRAME_SIZE_BYTES%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%2016000%20*%200.08%20*%202%0A%20%20%20%20%20%20%20%20)%20%20%23%20sample%20rate%20*%20frame%20size%20in%20seconds%20*%202%20bytes%20(16%20bit)%0A%20%20%20%20%20%20%20%20if%20self.latency%20%3D%3D%20%22low%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.config%20%3D%20self._LOW_LATENCY_CONFIG%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.config%20%3D%20self._HIGH_LATENCY_CONFIG%0A%20%20%20%20%20%20%20%20%23%20load%20model%20from%20Hugging%20Face%20model%20card%20directly%20(You%20need%20a%20Hugging%20Face%20token)%0A%20%20%20%20%20%20%20%20self.diarizer%20%3D%20NeMoStreamingDiarizer(%0A%20%20%20%20%20%20%20%20%20%20%20%20cfg%3Dself.config%2C%20model%3D%22nvidia%2Fdiar_streaming_sortformer_4spk-v2.1%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%20%20%20%20%40self.web_app.websocket(%22%2Fws%22)%0A%20%20%20%20%20%20%20%20async%20def%20run_with_websocket(ws%3A%20WebSocket)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_queue%20%3D%20asyncio.Queue()%0A%20%20%20%20%20%20%20%20%20%20%20%20output_queue%20%3D%20asyncio.Queue()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20recv_loop(ws%2C%20audio_queue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer%20%3D%20bytearray()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20ws.receive_bytes()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer.extend(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20len(audio_buffer)%20%3E%20self._SORTFORMER_FRAME_SIZE_BYTES%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20audio_queue.put(audio_buffer)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer%20%3D%20bytearray()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20inference_loop(audio_queue%2C%20output_queue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_data%20%3D%20await%20audio_queue.get()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20start_time%20%3D%20time.perf_counter()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20diar_result%20%3D%20self.diarizer.diarize(audio_data)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20probs%20%3D%20self._get_speaker_probabilities(diar_result)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20output_queue.put(json.dumps(probs))%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20end_time%20%3D%20time.perf_counter()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22time%20taken%20to%20diarize%20audio%20segment%3A%20%7Bend_time%20-%20start_time%7D%20seconds%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20send_loop(output_queue%2C%20ws)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output%20%3D%20await%20output_queue.get()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22sending%20diarize%20result%3A%20%7Boutput%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.send_text(output)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.accept()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(recv_loop(ws%2C%20audio_queue))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(inference_loop(audio_queue%2C%20output_queue))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(send_loop(output_queue%2C%20ws))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(*tasks)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20WebSocketDisconnect%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22WebSocket%20disconnected%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ws%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%3A%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.diarizer.reset_state()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20ws%20and%20ws.application_state%20is%20WebSocketState.CONNECTED%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.close(code%3D1011)%20%20%23%20internal%20error%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ws%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20task%20in%20tasks%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20task.done()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20task.cancel()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20task%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.CancelledError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20webapp(self)%3A%0A%20%20%20%20%20%20%20%20return%20self.web_app%0A%0A%20%20%20%20def%20_get_speaker_probabilities(self%2C%20spk_pred)%3A%0A%20%20%20%20%20%20%20%20%23%20spk_pred%20is%20a%206x4%20matrix%20of%20probabilities%0A%20%20%20%20%20%20%20%20%23%20We%20want%20to%20return%20a%201x4%20vector%20of%20probabilities%20for%20the%20total%20time%20window%0A%20%20%20%20%20%20%20%20%23%20We%20can%20take%20the%20mean%20across%20the%20time%20dimension%20(axis%200)%0A%20%20%20%20%20%20%20%20return%20spk_pred.mean(axis%3D0).tolist()%0A%0A`,lang:`python`});var E=c(T,2);u(E,{id:`serving-the-diarization-results-to-a-frontend`,children:(e,t)=>{l(),i(e,r(`Serving the diarization results to a frontend`))},$$slots:{default:!0}}),f(c(E,4),{code:`web_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.pip_install(%22fastapi%22)%0A%20%20%20%20.add_local_dir(%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22streaming-diarization-frontend%22%2C%20%22%2Froot%2Ffrontend%22%0A%20%20%20%20)%0A)%0A%0Awith%20web_image.imports()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20WebSocket%0A%20%20%20%20from%20fastapi.responses%20import%20HTMLResponse%2C%20Response%0A%20%20%20%20from%20fastapi.staticfiles%20import%20StaticFiles%0A%0A%0A%40app.cls(image%3Dweb_image)%0A%40modal.concurrent(max_inputs%3D20)%0Aclass%20WebServer%3A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20%20%20%20%20web_app.mount(%22%2Fstatic%22%2C%20StaticFiles(directory%3D%22frontend%22))%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2Fstatus%22)%0A%20%20%20%20%20%20%20%20async%20def%20status()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20Response(status_code%3D200)%0A%0A%20%20%20%20%20%20%20%20%23%20serve%20frontend%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20%20%20%20%20async%20def%20index()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20html_content%20%3D%20open(%22frontend%2Findex.html%22).read()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Get%20the%20base%20WebSocket%20URL%20(without%20transcriber%20parameters)%0A%20%20%20%20%20%20%20%20%20%20%20%20cls_instance%20%3D%20modal.Cls.from_name(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22sortformer2-1-speaker-diarization%22%2C%20%22Sortformer2_1_Speaker_Diarization%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)()%0A%20%20%20%20%20%20%20%20%20%20%20%20ws_base_url%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls_instance.webapp.get_web_url().replace(%22http%22%2C%20%22ws%22)%20%2B%20%22%2Fws%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20script_tag%20%3D%20f'%3Cscript%3Ewindow.WS_BASE_URL%20%3D%20%22%7Bws_base_url%7D%22%3B%3C%2Fscript%3E'%0A%20%20%20%20%20%20%20%20%20%20%20%20html_content%20%3D%20html_content.replace(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20'%3Cscript%20src%3D%22%2Fstatic%2Fsortformer2_1.js%22%3E%3C%2Fscript%3E'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f'%7Bscript_tag%7D%5Cn%3Cscript%20src%3D%22%2Fstatic%2Fsortformer2_1.js%22%3E%3C%2Fscript%3E'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20HTMLResponse(content%3Dhtml_content)%0A%0A%20%20%20%20%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BIVwZbe22.js.map
