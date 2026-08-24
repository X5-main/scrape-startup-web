(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3450c19a-9ccb-42ad-bfc6-b48d1711527f`,e._sentryDebugIdIdentifier=`sentry-dbid-3450c19a-9ccb-42ad-bfc6-b48d1711527f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Parakeet Multi-talker Speech-to-Text`,id:`parakeet-multi-talker-speech-to-text`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Configuration`,id:`configuration`},{depth:2,value:`Transcriber Service`,id:`transcriber-service`,children:[{depth:3,value:`WebSocket Handling`,id:`websocket-handling`}]},{depth:2,value:`Frontend Service`,id:`frontend-service`}]}],rawContent:`# Parakeet Multi-talker Speech-to-Text

This example shows how to run a streaming multi-talker speech-to-text service
using [NVIDIA's Parakeet Multi-talker model](https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1) and Sortformer diarization model.
The application transcribes audio in real-time while identifying different speakers without the need
to register unique speakers in advance.

Try it yourself! Click the "View on GitHub" button to see the code. And [sign up for a Modal account](https://modal.com/signup) if you haven't already.

## Setup

We start by importing the necessary dependencies and defining the Modal App and Image.
We use a persistent Volume to cache the models.

\`\`\`python
import asyncio
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import modal

app = modal.App("parakeet-multitalker")
model_cache = modal.Volume.from_name("parakeet-model-cache", create_if_missing=True)
CACHE_PATH = "/cache"
hf_secret = modal.Secret.from_name("huggingface-secret")

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

SAMPLE_RATE = 16000
NUM_REQUIRED_BUFFER_FRAMES = 13
BYTES_PER_SAMPLE = 2
FRAME_LEN_SEC = 0.080
PARAKEET_RT_STREAMING_CHUNK_SIZE = (
    int(FRAME_LEN_SEC * SAMPLE_RATE) * BYTES_PER_SAMPLE * NUM_REQUIRED_BUFFER_FRAMES
)


def chunk_audio(data: bytes, chunk_size: int):
    for i in range(0, len(data), chunk_size):
        yield data[i : i + chunk_size]


\`\`\`

## Configuration

This dataclass holds all the configuration parameters for the transcription and diarization models.

\`\`\`python
@dataclass
class MultitalkerTranscriptionConfig:
    """
    Configuration for Multi-talker transcription with an ASR model and a diarization model.
    """

    # Required configs
    diar_model: Optional[str] = None  # Path to a .nemo file
    diar_pretrained_name: Optional[str] = None  # Name of a pretrained model
    max_num_of_spks: Optional[int] = 4  # maximum number of speakers
    parallel_speaker_strategy: bool = True  # whether to use parallel speaker strategy
    masked_asr: bool = True  # whether to use masked ASR
    mask_preencode: bool = False  # whether to mask preencode or mask features
    cache_gating: bool = True  # whether to use cache gating
    cache_gating_buffer_size: int = 2  # buffer size for cache gating
    single_speaker_mode: bool = False  # whether to use single speaker mode

    # General configs
    session_len_sec: float = -1  # End-to-end diarization session length in seconds
    num_workers: int = 8
    random_seed: Optional[int] = (
        None  # seed number going to be used in seed_everything()
    )
    log: bool = True  # If True,log will be printed

    # Streaming diarization configs
    streaming_mode: bool = True  # If True, streaming diarization will be used.
    spkcache_len: int = 188
    spkcache_refresh_rate: int = 0
    fifo_len: int = 188
    chunk_len: int = 0
    chunk_left_context: int = 1
    chunk_right_context: int = 0

    # If \`cuda\` is a negative number, inference will be on CPU only.
    cuda: Optional[int] = None
    allow_mps: bool = False  # allow to select MPS device (Apple Silicon M-series GPU)
    matmul_precision: str = "highest"  # Literal["highest", "high", "medium"]

    # ASR Configs
    asr_model: Optional[str] = None
    device: str = "cuda"
    audio_file: Optional[str] = None
    manifest_file: Optional[str] = None
    use_amp: bool = True
    debug_mode: bool = True
    batch_size: int = 32
    chunk_size: int = -1
    shift_size: int = -1
    left_chunks: int = 2
    online_normalization: bool = True
    output_path: Optional[str] = None
    pad_and_drop_preencoded: bool = False
    set_decoder: Optional[str] = None  # ["ctc", "rnnt"]
    att_context_size: Optional[List[int]] = field(default_factory=lambda: [70, 13])
    generate_realtime_scripts: bool = True

    word_window: int = 50
    sent_break_sec: float = 30.0
    fix_prev_words_count: int = 5
    update_prev_words_sentence: int = 5
    left_frame_shift: int = -1
    right_frame_shift: int = 0
    min_sigmoid_val: float = 1e-2
    discarded_frames: int = 8
    print_time: bool = True
    print_sample_indices: List[int] = field(default_factory=lambda: [0])
    colored_text: bool = True
    real_time_mode: bool = True
    print_path: Optional[str] = "./"

    ignored_initial_frame_steps: int = 5
    verbose: bool = True

    feat_len_sec: float = 0.01
    finetune_realtime_ratio: float = 0.01

    spk_supervision: str = "diar"  # ["diar", "rttm"]
    binary_diar_preds: bool = False
    deploy_mode: bool = True

    @staticmethod
    def init_diar_model(cfg, diar_model):
        # Set streaming mode diar_model params (matching the diarization setup from lines 263-271 of reference file)
        diar_model.streaming_mode = cfg.streaming_mode
        diar_model.sortformer_modules.chunk_len = (
            cfg.chunk_len if cfg.chunk_len > 0 else 6
        )
        diar_model.sortformer_modules.spkcache_len = cfg.spkcache_len
        diar_model.sortformer_modules.chunk_left_context = cfg.chunk_left_context
        diar_model.sortformer_modules.chunk_right_context = (
            cfg.chunk_right_context if cfg.chunk_right_context > 0 else 7
        )
        diar_model.sortformer_modules.fifo_len = cfg.fifo_len
        diar_model.sortformer_modules.log = cfg.log
        diar_model.sortformer_modules.spkcache_refresh_rate = cfg.spkcache_refresh_rate
        return diar_model


with image.imports():
    import logging
    from urllib.request import urlopen

    import numpy as np
    import torch
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect
    from nemo.collections.asr.models import ASRModel, SortformerEncLabelModel
    from nemo.collections.asr.parts.utils.multispk_transcribe_utils import (
        SpeakerTaggedASR,
    )
    from omegaconf import OmegaConf
    from starlette.websockets import WebSocketState

    from .asr_utils import int2float, preprocess_audio
    from .cache_aware_buffer import CacheAwareStreamingAudioBuffer


\`\`\`

## Transcriber Service

We define the main \`Transcriber\` class as a Modal Cls.
This class loads the models into GPU memory and handles the streaming inference.
For more on lifecycle management with Cls and cold start penalty reduction on Modal, see
[this guide](https://modal.com/docs/guide/cold-start). In particular, this model
is amenable to GPU snapshots which can significantly reduce cold start times.

We use a \`CacheAwareStreamingAudioBuffer\` to manage the audio stream.
This buffer handles the streaming input and output, ensuring that the model receives
the correct amount of audio data for each inference step.

### WebSocket Handling

We use FastAPI's WebSocket support to handle the audio stream.
Incoming audio bytes are buffered and processed in chunks, and
transcriptions are sent back to the client as they become available.

\`\`\`python
@app.cls(
    volumes={CACHE_PATH: model_cache},
    gpu=["A100"],
    image=image,
    secrets=[hf_secret] if hf_secret is not None else [],
)
class Transcriber:
    @modal.enter()
    # @modal.enter()
    async def load(self):
        # silence chatty logs from nemo
        logging.getLogger("nemo_logger").setLevel(logging.CRITICAL)

        self.diar_model = (
            SortformerEncLabelModel.from_pretrained(
                "nvidia/diar_streaming_sortformer_4spk-v2.1"
            )
            .eval()
            .to(torch.device("cuda"))
        )
        self.asr_model = (
            ASRModel.from_pretrained("nvidia/multitalker-parakeet-streaming-0.6b-v1")
            .eval()
            .to(torch.device("cuda"))
        )

        self.cfg = OmegaConf.structured(MultitalkerTranscriptionConfig())
        self.diar_model = MultitalkerTranscriptionConfig.init_diar_model(
            self.cfg, self.diar_model
        )
        self.multispk_asr_streamer = SpeakerTaggedASR(
            self.cfg, self.asr_model, self.diar_model
        )

        self._chunk_size = PARAKEET_RT_STREAMING_CHUNK_SIZE

        # warm up gpu
        AUDIO_URL = "https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/mono_44100/156550__acclivity__a-dream-within-a-dream.wav"
        audio_bytes = urlopen(AUDIO_URL).read()
        audio_bytes = preprocess_audio(AUDIO_URL, target_sample_rate=16000)

        self.streaming_buffer = CacheAwareStreamingAudioBuffer(
            model=self.asr_model,
            online_normalization=self.cfg.online_normalization,
            pad_and_drop_preencoded=self.cfg.pad_and_drop_preencoded,
        )

        self.streaming_buffer.reset_buffer()

        step_num = 0
        stream_id = -1
        for audio_data in chunk_audio(audio_bytes, PARAKEET_RT_STREAMING_CHUNK_SIZE):
            transcript, stream_id = await self.transcribe(
                audio_data, step_num, stream_id
            )
            step_num += 1
            stream_id = 0
            print(f"transcript: {transcript}")
            print(f"stream_id: {stream_id}")

        self.streaming_buffer.reset_buffer()

        self.web_app = FastAPI()

        @self.web_app.websocket("/ws")
        async def run_with_websocket(ws: WebSocket):
            audio_queue = asyncio.Queue()
            transcription_queue = asyncio.Queue()

            self.streaming_buffer.reset_buffer()

            async def recv_loop(ws, audio_queue):
                audio_buffer = bytearray()
                while True:
                    data = await ws.receive_bytes()
                    audio_buffer.extend(data)
                    if len(audio_buffer) > self._chunk_size:
                        print("sending audio data")
                        await audio_queue.put(audio_buffer)
                        audio_buffer = bytearray()

            async def inference_loop(audio_queue, transcription_queue):
                step_num = 0
                stream_id = -1
                while True:
                    audio_data = await audio_queue.get()

                    start_time = time.perf_counter()
                    print("transcribing audio data")
                    transcript, stream_id = await self.transcribe(
                        audio_data, step_num, stream_id
                    )
                    step_num += 1
                    stream_id = 0
                    print(f"transcript: {transcript}")
                    if transcript:
                        await transcription_queue.put(transcript)

                    end_time = time.perf_counter()
                    print(
                        f"time taken to transcribe audio segment: {end_time - start_time} seconds"
                    )

            async def send_loop(transcription_queue, ws):
                while True:
                    transcript = await transcription_queue.get()
                    print(f"sending transcription data: {transcript}")
                    await ws.send_text(transcript)

            await ws.accept()

            try:
                tasks = [
                    asyncio.create_task(recv_loop(ws, audio_queue)),
                    asyncio.create_task(
                        inference_loop(audio_queue, transcription_queue)
                    ),
                    asyncio.create_task(send_loop(transcription_queue, ws)),
                ]
                await asyncio.gather(*tasks)
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                ws = None
            except Exception as e:
                print("Exception:", e)
            finally:
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

    async def transcribe(self, audio_data, step_num, stream_id=-1) -> str:
        print(f"transcribing audio data: {len(audio_data)} bytes")

        drop_extra_pre_encoded = (
            0
            if step_num == 0 and not self.cfg.pad_and_drop_preencoded
            else self.asr_model.encoder.streaming_cfg.drop_extra_pre_encoded
        )
        # convert to numpy
        audio_data = int2float(np.frombuffer(audio_data, dtype=np.int16))
        processed_signal, processed_signal_length, stream_id = (
            self.streaming_buffer.append_audio(audio_data, stream_id=stream_id)
        )

        result = self.streaming_buffer.get_next_chunk()
        if result is not None:
            audio_chunk, chunk_lengths = result
        else:
            return None, stream_id

        with torch.inference_mode():
            with torch.amp.autocast(self.diar_model.device.type, enabled=True):
                with torch.no_grad():
                    result = (
                        self.multispk_asr_streamer.perform_parallel_streaming_stt_spk(
                            step_num=step_num,
                            chunk_audio=audio_chunk,
                            chunk_lengths=chunk_lengths,
                            is_buffer_empty=False,
                            drop_extra_pre_encoded=drop_extra_pre_encoded,
                        )
                    )
        if result:
            return result[0], stream_id
        return None, stream_id

    @modal.asgi_app()
    def webapp(self):
        return self.web_app

    @modal.method()
    def ping(self):
        return "pong"


\`\`\`

## Frontend Service

We serve a simple HTML/JS frontend to interact with the transcriber.
The frontend captures microphone input and streams it to the WebSocket endpoint.

\`\`\`python
web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("fastapi")
    .add_local_dir(Path(__file__).parent / "multitalker-frontend", "/root/frontend")
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
            cls_instance = Transcriber()
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
`,meta:{title:`Parakeet Multi-talker Speech-to-Text`,description:`This example shows how to run a streaming multi-talker speech-to-text service using NVIDIA’s Parakeet Multi-talker model and Sortformer diarization model. The application transcribes audio in real-time while identifying different speakers without the need to register unique speakers in advance.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>This example shows how to run a streaming multi-talker speech-to-text service
using <!> and Sortformer diarization model.
The application transcribes audio in real-time while identifying different speakers without the need
to register unique speakers in advance.</p> <p>Try it yourself! Click the “View on GitHub” button to see the code. And <!> if you haven’t already.</p> <!> <p>We start by importing the necessary dependencies and defining the Modal App and Image.
We use a persistent Volume to cache the models.</p> <!> <!> <p>This dataclass holds all the configuration parameters for the transcription and diarization models.</p> <!> <!> <p>We define the main <code>Transcriber</code> class as a Modal Cls.
This class loads the models into GPU memory and handles the streaming inference.
For more on lifecycle management with Cls and cold start penalty reduction on Modal, see <!>. In particular, this model
is amenable to GPU snapshots which can significantly reduce cold start times.</p> <p>We use a <code>CacheAwareStreamingAudioBuffer</code> to manage the audio stream.
This buffer handles the streaming input and output, ensuring that the model receives
the correct amount of audio data for each inference step.</p> <!> <p>We use FastAPI’s WebSocket support to handle the audio stream.
Incoming audio bytes are buffered and processed in chunks, and
transcriptions are sent back to the client as they become available.</p> <!> <!> <p>We serve a simple HTML/JS frontend to interact with the transcriber.
The frontend captures microphone input and streams it to the WebSocket endpoint.</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`parakeet-multi-talker-speech-to-text`,children:(e,t)=>{l(),i(e,r(`Parakeet Multi-talker Speech-to-Text`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA’s Parakeet Multi-talker model`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);h(c(e(_)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`sign up for a Modal account`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var y=c(v,4);p(y,{code:`import%20asyncio%0Aimport%20time%0Afrom%20dataclasses%20import%20dataclass%2C%20field%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20List%2C%20Optional%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22parakeet-multitalker%22)%0Amodel_cache%20%3D%20modal.Volume.from_name(%22parakeet-model-cache%22%2C%20create_if_missing%3DTrue)%0ACACHE_PATH%20%3D%20%22%2Fcache%22%0Ahf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A13.0.1-cudnn-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20CACHE_PATH%2C%20%20%23%20cache%20directory%20for%20Hugging%20Face%20models%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CXX%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CC%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22TORCH_HOME%22%3A%20CACHE_PATH%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22libsndfile1%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22hf_transfer%3D%3D0.1.9%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%5Bhf-xet%5D%3D%3D0.31.2%22%2C%0A%20%20%20%20%20%20%20%20%22cuda-python%3D%3D13.0.1%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%22%2C%0A%20%20%20%20%20%20%20%20%22nemo_toolkit%5Basr%5D%40git%2Bhttps%3A%2F%2Fgithub.com%2FNVIDIA%2FNeMo.git%40main%22%2C%0A%20%20%20%20)%0A)%0A%0ASAMPLE_RATE%20%3D%2016000%0ANUM_REQUIRED_BUFFER_FRAMES%20%3D%2013%0ABYTES_PER_SAMPLE%20%3D%202%0AFRAME_LEN_SEC%20%3D%200.080%0APARAKEET_RT_STREAMING_CHUNK_SIZE%20%3D%20(%0A%20%20%20%20int(FRAME_LEN_SEC%20*%20SAMPLE_RATE)%20*%20BYTES_PER_SAMPLE%20*%20NUM_REQUIRED_BUFFER_FRAMES%0A)%0A%0A%0Adef%20chunk_audio(data%3A%20bytes%2C%20chunk_size%3A%20int)%3A%0A%20%20%20%20for%20i%20in%20range(0%2C%20len(data)%2C%20chunk_size)%3A%0A%20%20%20%20%20%20%20%20yield%20data%5Bi%20%3A%20i%20%2B%20chunk_size%5D%0A%0A`,lang:`python`});var x=c(y,2);u(x,{id:`configuration`,children:(e,t)=>{l(),i(e,r(`Configuration`))},$$slots:{default:!0}});var S=c(x,4);p(S,{code:`%40dataclass%0Aclass%20MultitalkerTranscriptionConfig%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Configuration%20for%20Multi-talker%20transcription%20with%20an%20ASR%20model%20and%20a%20diarization%20model.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20%23%20Required%20configs%0A%20%20%20%20diar_model%3A%20Optional%5Bstr%5D%20%3D%20None%20%20%23%20Path%20to%20a%20.nemo%20file%0A%20%20%20%20diar_pretrained_name%3A%20Optional%5Bstr%5D%20%3D%20None%20%20%23%20Name%20of%20a%20pretrained%20model%0A%20%20%20%20max_num_of_spks%3A%20Optional%5Bint%5D%20%3D%204%20%20%23%20maximum%20number%20of%20speakers%0A%20%20%20%20parallel_speaker_strategy%3A%20bool%20%3D%20True%20%20%23%20whether%20to%20use%20parallel%20speaker%20strategy%0A%20%20%20%20masked_asr%3A%20bool%20%3D%20True%20%20%23%20whether%20to%20use%20masked%20ASR%0A%20%20%20%20mask_preencode%3A%20bool%20%3D%20False%20%20%23%20whether%20to%20mask%20preencode%20or%20mask%20features%0A%20%20%20%20cache_gating%3A%20bool%20%3D%20True%20%20%23%20whether%20to%20use%20cache%20gating%0A%20%20%20%20cache_gating_buffer_size%3A%20int%20%3D%202%20%20%23%20buffer%20size%20for%20cache%20gating%0A%20%20%20%20single_speaker_mode%3A%20bool%20%3D%20False%20%20%23%20whether%20to%20use%20single%20speaker%20mode%0A%0A%20%20%20%20%23%20General%20configs%0A%20%20%20%20session_len_sec%3A%20float%20%3D%20-1%20%20%23%20End-to-end%20diarization%20session%20length%20in%20seconds%0A%20%20%20%20num_workers%3A%20int%20%3D%208%0A%20%20%20%20random_seed%3A%20Optional%5Bint%5D%20%3D%20(%0A%20%20%20%20%20%20%20%20None%20%20%23%20seed%20number%20going%20to%20be%20used%20in%20seed_everything()%0A%20%20%20%20)%0A%20%20%20%20log%3A%20bool%20%3D%20True%20%20%23%20If%20True%2Clog%20will%20be%20printed%0A%0A%20%20%20%20%23%20Streaming%20diarization%20configs%0A%20%20%20%20streaming_mode%3A%20bool%20%3D%20True%20%20%23%20If%20True%2C%20streaming%20diarization%20will%20be%20used.%0A%20%20%20%20spkcache_len%3A%20int%20%3D%20188%0A%20%20%20%20spkcache_refresh_rate%3A%20int%20%3D%200%0A%20%20%20%20fifo_len%3A%20int%20%3D%20188%0A%20%20%20%20chunk_len%3A%20int%20%3D%200%0A%20%20%20%20chunk_left_context%3A%20int%20%3D%201%0A%20%20%20%20chunk_right_context%3A%20int%20%3D%200%0A%0A%20%20%20%20%23%20If%20%60cuda%60%20is%20a%20negative%20number%2C%20inference%20will%20be%20on%20CPU%20only.%0A%20%20%20%20cuda%3A%20Optional%5Bint%5D%20%3D%20None%0A%20%20%20%20allow_mps%3A%20bool%20%3D%20False%20%20%23%20allow%20to%20select%20MPS%20device%20(Apple%20Silicon%20M-series%20GPU)%0A%20%20%20%20matmul_precision%3A%20str%20%3D%20%22highest%22%20%20%23%20Literal%5B%22highest%22%2C%20%22high%22%2C%20%22medium%22%5D%0A%0A%20%20%20%20%23%20ASR%20Configs%0A%20%20%20%20asr_model%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20device%3A%20str%20%3D%20%22cuda%22%0A%20%20%20%20audio_file%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20manifest_file%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20use_amp%3A%20bool%20%3D%20True%0A%20%20%20%20debug_mode%3A%20bool%20%3D%20True%0A%20%20%20%20batch_size%3A%20int%20%3D%2032%0A%20%20%20%20chunk_size%3A%20int%20%3D%20-1%0A%20%20%20%20shift_size%3A%20int%20%3D%20-1%0A%20%20%20%20left_chunks%3A%20int%20%3D%202%0A%20%20%20%20online_normalization%3A%20bool%20%3D%20True%0A%20%20%20%20output_path%3A%20Optional%5Bstr%5D%20%3D%20None%0A%20%20%20%20pad_and_drop_preencoded%3A%20bool%20%3D%20False%0A%20%20%20%20set_decoder%3A%20Optional%5Bstr%5D%20%3D%20None%20%20%23%20%5B%22ctc%22%2C%20%22rnnt%22%5D%0A%20%20%20%20att_context_size%3A%20Optional%5BList%5Bint%5D%5D%20%3D%20field(default_factory%3Dlambda%3A%20%5B70%2C%2013%5D)%0A%20%20%20%20generate_realtime_scripts%3A%20bool%20%3D%20True%0A%0A%20%20%20%20word_window%3A%20int%20%3D%2050%0A%20%20%20%20sent_break_sec%3A%20float%20%3D%2030.0%0A%20%20%20%20fix_prev_words_count%3A%20int%20%3D%205%0A%20%20%20%20update_prev_words_sentence%3A%20int%20%3D%205%0A%20%20%20%20left_frame_shift%3A%20int%20%3D%20-1%0A%20%20%20%20right_frame_shift%3A%20int%20%3D%200%0A%20%20%20%20min_sigmoid_val%3A%20float%20%3D%201e-2%0A%20%20%20%20discarded_frames%3A%20int%20%3D%208%0A%20%20%20%20print_time%3A%20bool%20%3D%20True%0A%20%20%20%20print_sample_indices%3A%20List%5Bint%5D%20%3D%20field(default_factory%3Dlambda%3A%20%5B0%5D)%0A%20%20%20%20colored_text%3A%20bool%20%3D%20True%0A%20%20%20%20real_time_mode%3A%20bool%20%3D%20True%0A%20%20%20%20print_path%3A%20Optional%5Bstr%5D%20%3D%20%22.%2F%22%0A%0A%20%20%20%20ignored_initial_frame_steps%3A%20int%20%3D%205%0A%20%20%20%20verbose%3A%20bool%20%3D%20True%0A%0A%20%20%20%20feat_len_sec%3A%20float%20%3D%200.01%0A%20%20%20%20finetune_realtime_ratio%3A%20float%20%3D%200.01%0A%0A%20%20%20%20spk_supervision%3A%20str%20%3D%20%22diar%22%20%20%23%20%5B%22diar%22%2C%20%22rttm%22%5D%0A%20%20%20%20binary_diar_preds%3A%20bool%20%3D%20False%0A%20%20%20%20deploy_mode%3A%20bool%20%3D%20True%0A%0A%20%20%20%20%40staticmethod%0A%20%20%20%20def%20init_diar_model(cfg%2C%20diar_model)%3A%0A%20%20%20%20%20%20%20%20%23%20Set%20streaming%20mode%20diar_model%20params%20(matching%20the%20diarization%20setup%20from%20lines%20263-271%20of%20reference%20file)%0A%20%20%20%20%20%20%20%20diar_model.streaming_mode%20%3D%20cfg.streaming_mode%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_len%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20cfg.chunk_len%20if%20cfg.chunk_len%20%3E%200%20else%206%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.spkcache_len%20%3D%20cfg.spkcache_len%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_left_context%20%3D%20cfg.chunk_left_context%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_right_context%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20cfg.chunk_right_context%20if%20cfg.chunk_right_context%20%3E%200%20else%207%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.fifo_len%20%3D%20cfg.fifo_len%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.log%20%3D%20cfg.log%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.spkcache_refresh_rate%20%3D%20cfg.spkcache_refresh_rate%0A%20%20%20%20%20%20%20%20return%20diar_model%0A%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20logging%0A%20%20%20%20from%20urllib.request%20import%20urlopen%0A%0A%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20WebSocket%2C%20WebSocketDisconnect%0A%20%20%20%20from%20nemo.collections.asr.models%20import%20ASRModel%2C%20SortformerEncLabelModel%0A%20%20%20%20from%20nemo.collections.asr.parts.utils.multispk_transcribe_utils%20import%20(%0A%20%20%20%20%20%20%20%20SpeakerTaggedASR%2C%0A%20%20%20%20)%0A%20%20%20%20from%20omegaconf%20import%20OmegaConf%0A%20%20%20%20from%20starlette.websockets%20import%20WebSocketState%0A%0A%20%20%20%20from%20.asr_utils%20import%20int2float%2C%20preprocess_audio%0A%20%20%20%20from%20.cache_aware_buffer%20import%20CacheAwareStreamingAudioBuffer%0A%0A`,lang:`python`});var C=c(S,2);u(C,{id:`transcriber-service`,children:(e,t)=>{l(),i(e,r(`Transcriber Service`))},$$slots:{default:!0}});var w=c(C,2);h(c(e(w),3),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,4);d(T,{id:`websocket-handling`,children:(e,t)=>{l(),i(e,r(`WebSocket Handling`))},$$slots:{default:!0}});var E=c(T,4);p(E,{code:`%40app.cls(%0A%20%20%20%20volumes%3D%7BCACHE_PATH%3A%20model_cache%7D%2C%0A%20%20%20%20gpu%3D%5B%22A100%22%5D%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%20if%20hf_secret%20is%20not%20None%20else%20%5B%5D%2C%0A)%0Aclass%20Transcriber%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20%23%20%40modal.enter()%0A%20%20%20%20async%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20%23%20silence%20chatty%20logs%20from%20nemo%0A%20%20%20%20%20%20%20%20logging.getLogger(%22nemo_logger%22).setLevel(logging.CRITICAL)%0A%0A%20%20%20%20%20%20%20%20self.diar_model%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20SortformerEncLabelModel.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22nvidia%2Fdiar_streaming_sortformer_4spk-v2.1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20.eval()%0A%20%20%20%20%20%20%20%20%20%20%20%20.to(torch.device(%22cuda%22))%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.asr_model%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20ASRModel.from_pretrained(%22nvidia%2Fmultitalker-parakeet-streaming-0.6b-v1%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20.eval()%0A%20%20%20%20%20%20%20%20%20%20%20%20.to(torch.device(%22cuda%22))%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.cfg%20%3D%20OmegaConf.structured(MultitalkerTranscriptionConfig())%0A%20%20%20%20%20%20%20%20self.diar_model%20%3D%20MultitalkerTranscriptionConfig.init_diar_model(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.cfg%2C%20self.diar_model%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.multispk_asr_streamer%20%3D%20SpeakerTaggedASR(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.cfg%2C%20self.asr_model%2C%20self.diar_model%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self._chunk_size%20%3D%20PARAKEET_RT_STREAMING_CHUNK_SIZE%0A%0A%20%20%20%20%20%20%20%20%23%20warm%20up%20gpu%0A%20%20%20%20%20%20%20%20AUDIO_URL%20%3D%20%22https%3A%2F%2Fgithub.com%2Fvoxserv%2Faudio_quality_testing_samples%2Fraw%2Frefs%2Fheads%2Fmaster%2Fmono_44100%2F156550__acclivity__a-dream-within-a-dream.wav%22%0A%20%20%20%20%20%20%20%20audio_bytes%20%3D%20urlopen(AUDIO_URL).read()%0A%20%20%20%20%20%20%20%20audio_bytes%20%3D%20preprocess_audio(AUDIO_URL%2C%20target_sample_rate%3D16000)%0A%0A%20%20%20%20%20%20%20%20self.streaming_buffer%20%3D%20CacheAwareStreamingAudioBuffer(%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dself.asr_model%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20online_normalization%3Dself.cfg.online_normalization%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20pad_and_drop_preencoded%3Dself.cfg.pad_and_drop_preencoded%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.streaming_buffer.reset_buffer()%0A%0A%20%20%20%20%20%20%20%20step_num%20%3D%200%0A%20%20%20%20%20%20%20%20stream_id%20%3D%20-1%0A%20%20%20%20%20%20%20%20for%20audio_data%20in%20chunk_audio(audio_bytes%2C%20PARAKEET_RT_STREAMING_CHUNK_SIZE)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20transcript%2C%20stream_id%20%3D%20await%20self.transcribe(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_data%2C%20step_num%2C%20stream_id%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20step_num%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20stream_id%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22transcript%3A%20%7Btranscript%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22stream_id%3A%20%7Bstream_id%7D%22)%0A%0A%20%20%20%20%20%20%20%20self.streaming_buffer.reset_buffer()%0A%0A%20%20%20%20%20%20%20%20self.web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%20%20%20%20%40self.web_app.websocket(%22%2Fws%22)%0A%20%20%20%20%20%20%20%20async%20def%20run_with_websocket(ws%3A%20WebSocket)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_queue%20%3D%20asyncio.Queue()%0A%20%20%20%20%20%20%20%20%20%20%20%20transcription_queue%20%3D%20asyncio.Queue()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_buffer.reset_buffer()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20recv_loop(ws%2C%20audio_queue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer%20%3D%20bytearray()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20ws.receive_bytes()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer.extend(data)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20len(audio_buffer)%20%3E%20self._chunk_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22sending%20audio%20data%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20audio_queue.put(audio_buffer)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_buffer%20%3D%20bytearray()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20inference_loop(audio_queue%2C%20transcription_queue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20step_num%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stream_id%20%3D%20-1%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_data%20%3D%20await%20audio_queue.get()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20start_time%20%3D%20time.perf_counter()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22transcribing%20audio%20data%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20transcript%2C%20stream_id%20%3D%20await%20self.transcribe(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_data%2C%20step_num%2C%20stream_id%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20step_num%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stream_id%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22transcript%3A%20%7Btranscript%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20transcript%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20transcription_queue.put(transcript)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20end_time%20%3D%20time.perf_counter()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22time%20taken%20to%20transcribe%20audio%20segment%3A%20%7Bend_time%20-%20start_time%7D%20seconds%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20send_loop(transcription_queue%2C%20ws)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20transcript%20%3D%20await%20transcription_queue.get()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22sending%20transcription%20data%3A%20%7Btranscript%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.send_text(transcript)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.accept()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(recv_loop(ws%2C%20audio_queue))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20inference_loop(audio_queue%2C%20transcription_queue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20asyncio.create_task(send_loop(transcription_queue%2C%20ws))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(*tasks)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20WebSocketDisconnect%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22WebSocket%20disconnected%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ws%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%3A%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20ws%20and%20ws.application_state%20is%20WebSocketState.CONNECTED%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.close(code%3D1011)%20%20%23%20internal%20error%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ws%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20task%20in%20tasks%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20task.done()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20task.cancel()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20task%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20asyncio.CancelledError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20async%20def%20transcribe(self%2C%20audio_data%2C%20step_num%2C%20stream_id%3D-1)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20print(f%22transcribing%20audio%20data%3A%20%7Blen(audio_data)%7D%20bytes%22)%0A%0A%20%20%20%20%20%20%20%20drop_extra_pre_encoded%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%200%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20step_num%20%3D%3D%200%20and%20not%20self.cfg.pad_and_drop_preencoded%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20self.asr_model.encoder.streaming_cfg.drop_extra_pre_encoded%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20convert%20to%20numpy%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20int2float(np.frombuffer(audio_data%2C%20dtype%3Dnp.int16))%0A%20%20%20%20%20%20%20%20processed_signal%2C%20processed_signal_length%2C%20stream_id%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_buffer.append_audio(audio_data%2C%20stream_id%3Dstream_id)%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20result%20%3D%20self.streaming_buffer.get_next_chunk()%0A%20%20%20%20%20%20%20%20if%20result%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_chunk%2C%20chunk_lengths%20%3D%20result%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20None%2C%20stream_id%0A%0A%20%20%20%20%20%20%20%20with%20torch.inference_mode()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20torch.amp.autocast(self.diar_model.device.type%2C%20enabled%3DTrue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.multispk_asr_streamer.perform_parallel_streaming_stt_spk(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20step_num%3Dstep_num%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_audio%3Daudio_chunk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_lengths%3Dchunk_lengths%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20is_buffer_empty%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20drop_extra_pre_encoded%3Ddrop_extra_pre_encoded%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20result%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20result%5B0%5D%2C%20stream_id%0A%20%20%20%20%20%20%20%20return%20None%2C%20stream_id%0A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20webapp(self)%3A%0A%20%20%20%20%20%20%20%20return%20self.web_app%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20ping(self)%3A%0A%20%20%20%20%20%20%20%20return%20%22pong%22%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`frontend-service`,children:(e,t)=>{l(),i(e,r(`Frontend Service`))},$$slots:{default:!0}}),p(c(D,4),{code:`web_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.pip_install(%22fastapi%22)%0A%20%20%20%20.add_local_dir(Path(__file__).parent%20%2F%20%22multitalker-frontend%22%2C%20%22%2Froot%2Ffrontend%22)%0A)%0A%0Awith%20web_image.imports()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20WebSocket%0A%20%20%20%20from%20fastapi.responses%20import%20HTMLResponse%2C%20Response%0A%20%20%20%20from%20fastapi.staticfiles%20import%20StaticFiles%0A%0A%0A%40app.cls(image%3Dweb_image)%0A%40modal.concurrent(max_inputs%3D20)%0Aclass%20WebServer%3A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20%20%20%20%20web_app.mount(%22%2Fstatic%22%2C%20StaticFiles(directory%3D%22frontend%22))%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2Fstatus%22)%0A%20%20%20%20%20%20%20%20async%20def%20status()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20Response(status_code%3D200)%0A%0A%20%20%20%20%20%20%20%20%23%20serve%20frontend%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20%20%20%20%20async%20def%20index()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20html_content%20%3D%20open(%22frontend%2Findex.html%22).read()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Get%20the%20base%20WebSocket%20URL%20(without%20transcriber%20parameters)%0A%20%20%20%20%20%20%20%20%20%20%20%20cls_instance%20%3D%20Transcriber()%0A%20%20%20%20%20%20%20%20%20%20%20%20ws_base_url%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls_instance.webapp.get_web_url().replace(%22http%22%2C%20%22ws%22)%20%2B%20%22%2Fws%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20script_tag%20%3D%20f'%3Cscript%3Ewindow.WS_BASE_URL%20%3D%20%22%7Bws_base_url%7D%22%3B%20window.TRANSCRIPTION_MODE%20%3D%20%22replace%22%3B%3C%2Fscript%3E'%0A%20%20%20%20%20%20%20%20%20%20%20%20html_content%20%3D%20html_content.replace(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20'%3Cscript%20src%3D%22%2Fstatic%2Fparakeet.js%22%3E%3C%2Fscript%3E'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f'%7Bscript_tag%7D%5Cn%3Cscript%20src%3D%22%2Fstatic%2Fparakeet.js%22%3E%3C%2Fscript%3E'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20HTMLResponse(content%3Dhtml_content)%0A%0A%20%20%20%20%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=aMAcXe2t.js.map
