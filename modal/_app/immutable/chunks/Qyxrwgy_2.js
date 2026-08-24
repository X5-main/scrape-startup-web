(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d82eb3f4-683c-4dfd-bbd8-30501658922c`,e._sentryDebugIdIdentifier=`sentry-dbid-d82eb3f4-683c-4dfd-bbd8-30501658922c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Streaming audio transcription using Parakeet`,id:`streaming-audio-transcription-using-parakeet`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Volume for caching model weights`,id:`volume-for-caching-model-weights`},{depth:2,value:`Configuring dependencies`,id:`configuring-dependencies`},{depth:2,value:`Implementing streaming audio transcription on Modal`,id:`implementing-streaming-audio-transcription-on-modal`},{depth:2,value:`Running transcription from a local Python client`,id:`running-transcription-from-a-local-python-client`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Streaming audio transcription using Parakeet

This examples demonstrates the use of Parakeet ASR models for streaming speech-to-text on Modal.

[Parakeet](https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html#parakeet)
is the name of a family of ASR models built using [NVIDIA's NeMo Framework](https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html).
We'll show you how to use Parakeet for streaming audio transcription on Modal GPUs,
with simple Python and browser clients.

This example uses the \`nvidia/parakeet-tdt-0.6b-v2\` model which, as of June 2025, sits at the
top of Hugging Face's [Open ASR leaderboard](https://huggingface.co/spaces/hf-audio/open_asr_leaderboard).

To try out transcription from your terminal,
provide a URL for a \`.wav\` file to \`modal run\`:

\`\`\`bash
modal run 06_gpu_and_ml/speech-to-text/streaming_parakeet.py --audio-url="https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/mono_44100/156550__acclivity__a-dream-within-a-dream.wav"
\`\`\`

You should see output like the following:

\`\`\`bash
🎤 Starting Transcription
A Dream Within A Dream Edgar Allan Poe
take this kiss upon the brow, And in parting from you now, Thus much let me avow You are not wrong who deem That my days have been a dream.
...
\`\`\`

Running a web service you can hit from any browser isn't any harder -- Modal handles the deployment of both the frontend and backend in a single App!
Just run

\`\`\`bash
modal serve 06_gpu_and_ml/speech-to-text/streaming_parakeet.py
\`\`\`

and go to the link printed in your terminal.

The full frontend code can be found [here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/speech-to-text/streaming-parakeet-frontend/).

## Setup

\`\`\`python
import asyncio
import os
import sys
from pathlib import Path

import modal

app = modal.App("example-streaming-parakeet")

\`\`\`

## Volume for caching model weights

We use a [Modal Volume](https://modal.com/docs/guide/volumes) to cache the model weights.
This allows us to avoid downloading the model weights every time we start a new instance.

For more on storing models on Modal, see [this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
model_cache = modal.Volume.from_name("parakeet-model-cache", create_if_missing=True)

\`\`\`

## Configuring dependencies

The model runs remotely inside a container on Modal. We can define the environment
and install our Python dependencies in that container's [\`Image\`](https://modal.com/docs/guide/images).

For finicky setups like NeMO's, we recommend using the official NVIDIA CUDA Docker images from Docker Hub.
You'll need to install Python and pip with the \`add_python\` option because the image
doesn't have these by default.

Additionally, we install \`ffmpeg\` for handling audio data and \`fastapi\` to create a web
server for our WebSocket.

\`\`\`python
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.8.0-cudnn-devel-ubuntu22.04", add_python="3.12"
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",
            "HF_HOME": "/cache",  # cache directory for Hugging Face models
            "DEBIAN_FRONTEND": "noninteractive",
            "CXX": "g++",
            "CC": "g++",
        }
    )
    .apt_install("ffmpeg")
    .uv_pip_install(
        "hf_transfer==0.1.9",
        "huggingface-hub==0.36.0",
        "nemo_toolkit[asr]==2.3.2",
        "cuda-python==12.8.0",
        "fastapi==0.115.12",
        "numpy<2",
        "pydub==0.25.1",
    )
    .entrypoint([])  # silence chatty logs by container on start
    .add_local_dir(  # changes fastest, so make this the last layer
        Path(__file__).parent / "streaming-parakeet-frontend",
        remote_path="/frontend",
    )
)

\`\`\`

## Implementing streaming audio transcription on Modal

Now we're ready to implement transcription. We wrap inference in a [\`modal.Cls\`](https://modal.com/docs/guide/lifecycle-functions) that
ensures models are loaded and then moved to the GPU once when a new container starts.

A couple of notes about this code:
- The \`transcribe\` method takes bytes of audio data and returns the transcribed text.
- The \`web\` method creates a FastAPI app using [\`modal.asgi_app\`](https://modal.com/docs/reference/modal.asgi_app#modalasgi_app) that serves a
[WebSocket](https://modal.com/docs/guide/webhooks#websockets) endpoint for streaming audio transcription and a browser frontend for transcribing audio from your microphone.
- The \`run_with_queue\` method takes a [\`modal.Queue\`](https://modal.com/docs/reference/modal.Queue) and passes audio data and transcriptions between our local machine and the GPU container.

Parakeet tries really hard to transcribe everything to English!
Hence it tends to output utterances like "Yeah" or "Mm-hmm" when it runs on silent audio.
We pre-process the incoming audio in the server using \`pydub\`'s silence detection,
ensuring that we don't pass silence into our model.

\`\`\`python
END_OF_STREAM = (
    b"END_OF_STREAM_8f13d09"  # byte sequence indicating a stream is finished
)


@app.cls(volumes={"/cache": model_cache}, gpu="a10g", image=image)
@modal.concurrent(max_inputs=14, target_inputs=10)
class ParakeetModel:
    @modal.enter()
    def load(self):
        import logging

        import nemo.collections.asr as nemo_asr

        # silence chatty logs from nemo
        logging.getLogger("nemo_logger").setLevel(logging.CRITICAL)

        self.model = nemo_asr.models.ASRModel.from_pretrained(
            model_name="nvidia/parakeet-tdt-0.6b-v2"
        )

    def transcribe(self, audio_bytes: bytes) -> str:
        import numpy as np

        audio_data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32)

        with NoStdStreams():  # hide output, see https://github.com/NVIDIA/NeMo/discussions/3281#discussioncomment-2251217
            output = self.model.transcribe([audio_data])

        return output[0].text

    @modal.method()
    async def handle_audio_chunk(
        self,
        chunk: bytes,
        audio_segment,
        silence_thresh=-45,  # dB
        min_silence_len=1000,  # ms
    ):
        from pydub import AudioSegment, silence

        new_audio_segment = AudioSegment(
            data=chunk,
            channels=1,
            sample_width=2,
            frame_rate=TARGET_SAMPLE_RATE,
        )

        # append the new audio segment to the existing audio segment
        audio_segment += new_audio_segment

        # detect windows of silence
        silent_windows = silence.detect_silence(
            audio_segment,
            min_silence_len=min_silence_len,
            silence_thresh=silence_thresh,
        )

        # if there are no silent windows, continue
        if len(silent_windows) == 0:
            return audio_segment, None

        # get the last silent window because
        # we want to transcribe until the final pause
        last_window = silent_windows[-1]

        # if the entire audio segment is silent, reset the audio segment
        if last_window[0] == 0 and last_window[1] == len(audio_segment):
            audio_segment = AudioSegment.empty()
            return audio_segment, None

        # get the segment to transcribe: beginning until last pause
        segment_to_transcribe = audio_segment[: last_window[1]]

        # remove the segment to transcribe from the audio segment
        audio_segment = audio_segment[last_window[1] :]
        try:
            text = self.transcribe(segment_to_transcribe.raw_data)
            return audio_segment, text
        except Exception as e:
            print("❌ Transcription error:", e)
            raise e

    @modal.method()
    async def run_with_queue(self, q: modal.Queue):
        from pydub import AudioSegment

        # initialize an empty audio segment
        audio_segment = AudioSegment.empty()

        try:
            while True:
                # receive a chunk of audio data and convert it to an audio segment
                chunk = await q.get.aio(partition="audio")

                if chunk == END_OF_STREAM:
                    await q.put.aio(END_OF_STREAM, partition="transcription")
                    break

                audio_segment, text = await self.handle_audio_chunk.remote.aio(
                    chunk, audio_segment
                )
                if text:
                    await q.put.aio(text, partition="transcription")
        except Exception as e:
            print(f"Error handling queue: {type(e)}: {e}")
            return


@app.cls(image=image)
@modal.concurrent(max_inputs=100)
class WebServer:
    @modal.asgi_app()
    def web(self):
        from fastapi import FastAPI, Response, WebSocket
        from fastapi.responses import HTMLResponse
        from fastapi.staticfiles import StaticFiles

        web_app = FastAPI()
        web_app.mount("/static", StaticFiles(directory="/frontend"))

        @web_app.get("/status")
        async def status():
            return Response(status_code=200)

        # serve frontend
        @web_app.get("/")
        async def index():
            return HTMLResponse(content=open("/frontend/index.html").read())

        @web_app.websocket("/ws")
        async def run_with_websocket(ws: WebSocket):
            from fastapi import WebSocketDisconnect

            await ws.accept()

            from pydub import AudioSegment

            model = ParakeetModel()

            # initialize an empty audio segment
            audio_segment = AudioSegment.empty()

            try:
                while True:
                    # receive a chunk of audio data and convert it to an audio segment
                    chunk = await ws.receive_bytes()
                    if chunk == END_OF_STREAM:
                        await ws.send_bytes(END_OF_STREAM)
                        break
                    (
                        audio_segment,
                        text,
                    ) = await model.handle_audio_chunk.remote.aio(chunk, audio_segment)
                    if text:
                        await ws.send_text(text)
            except Exception as e:
                if not isinstance(e, WebSocketDisconnect):
                    print(f"Error handling websocket: {type(e)}: {e}")
                try:
                    await ws.close(code=1011, reason="Internal server error")
                except Exception as e:
                    print(f"Error closing websocket: {type(e)}: {e}")

        return web_app


\`\`\`

## Running transcription from a local Python client

Next, let's test the model with a [\`local_entrypoint\`](https://modal.com/docs/reference/modal.App#local_entrypoint) that streams audio data to the server and prints
out the transcriptions to our terminal as they arrive.

Instead of using the WebSocket endpoint like the browser frontend,
we'll use a [\`modal.Queue\`](https://modal.com/docs/reference/modal.Queue)
to pass audio data and transcriptions between our local machine and the GPU container.

\`\`\`python
AUDIO_URL = "https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/mono_44100/156550__acclivity__a-dream-within-a-dream.wav"
TARGET_SAMPLE_RATE = 16_000
CHUNK_SIZE = 16_000  # send one second of audio at a time


@app.local_entrypoint()
async def main(audio_url: str = AUDIO_URL):
    from urllib.request import urlopen

    print(f"🌐 Downloading audio file from {audio_url}")
    audio_bytes = urlopen(audio_url).read()
    print(f"🎧 Downloaded {len(audio_bytes)} bytes")

    audio_data = preprocess_audio(audio_bytes)

    print("🎤 Starting Transcription")
    async with modal.Queue.ephemeral() as q:
        await ParakeetModel().run_with_queue.spawn.aio(q)
        send = asyncio.create_task(send_audio(q, audio_data))
        recv = asyncio.create_task(receive_text(q))
        await asyncio.gather(send, recv)
    print("✅ Transcription complete!")


\`\`\`

Below are the two functions that coordinate streaming audio and receiving transcriptions.

\`send_audio\` transmits chunks of audio data with a slight delay,
as though it was being streamed from a live source, like a microphone.
\`receive_text\` waits for transcribed text to arrive and prints it.

\`\`\`python
async def send_audio(q, audio_bytes):
    for chunk in chunk_audio(audio_bytes, CHUNK_SIZE):
        await q.put.aio(chunk, partition="audio")
        await asyncio.sleep(CHUNK_SIZE / TARGET_SAMPLE_RATE / 8)
    await q.put.aio(END_OF_STREAM, partition="audio")


async def receive_text(q):
    while True:
        message = await q.get.aio(partition="transcription")
        if message == END_OF_STREAM:
            break

        print(message)


\`\`\`

## Addenda

The remainder of the code in this example is boilerplate,
mostly for handling Parakeet's input format.

\`\`\`python
def preprocess_audio(audio_bytes: bytes) -> bytes:
    import array
    import io
    import wave

    with wave.open(io.BytesIO(audio_bytes), "rb") as wav_in:
        n_channels = wav_in.getnchannels()
        sample_width = wav_in.getsampwidth()
        frame_rate = wav_in.getframerate()
        n_frames = wav_in.getnframes()
        frames = wav_in.readframes(n_frames)

    # Convert frames to array based on sample width
    if sample_width == 1:
        audio_data = array.array("B", frames)  # unsigned char
    elif sample_width == 2:
        audio_data = array.array("h", frames)  # signed short
    elif sample_width == 4:
        audio_data = array.array("i", frames)  # signed int
    else:
        raise ValueError(f"Unsupported sample width: {sample_width}")

    # Downmix to mono if needed
    if n_channels > 1:
        mono_data = array.array(audio_data.typecode)
        for i in range(0, len(audio_data), n_channels):
            chunk = audio_data[i : i + n_channels]
            mono_data.append(sum(chunk) // n_channels)
        audio_data = mono_data

    # Resample to 16kHz if needed
    if frame_rate != TARGET_SAMPLE_RATE:
        ratio = TARGET_SAMPLE_RATE / frame_rate
        new_length = int(len(audio_data) * ratio)
        resampled_data = array.array(audio_data.typecode)

        for i in range(new_length):
            # Linear interpolation
            pos = i / ratio
            pos_int = int(pos)
            pos_frac = pos - pos_int

            if pos_int >= len(audio_data) - 1:
                sample = audio_data[-1]
            else:
                sample1 = audio_data[pos_int]
                sample2 = audio_data[pos_int + 1]
                sample = int(sample1 + (sample2 - sample1) * pos_frac)

            resampled_data.append(sample)

        audio_data = resampled_data

    return audio_data.tobytes()


def chunk_audio(data: bytes, chunk_size: int):
    for i in range(0, len(data), chunk_size):
        yield data[i : i + chunk_size]


class NoStdStreams(object):
    def __init__(self):
        self.devnull = open(os.devnull, "w")

    def __enter__(self):
        self._stdout, self._stderr = sys.stdout, sys.stderr
        self._stdout.flush(), self._stderr.flush()
        sys.stdout, sys.stderr = self.devnull, self.devnull

    def __exit__(self, exc_type, exc_value, traceback):
        sys.stdout, sys.stderr = self._stdout, self._stderr
        self.devnull.close()

\`\`\`
`,meta:{title:`Streaming audio transcription using Parakeet`,description:`This examples demonstrates the use of Parakeet ASR models for streaming speech-to-text on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Image</code>`),b=t(`<code>modal.Cls</code>`),x=t(`<code>modal.asgi_app</code>`),S=t(`<code>modal.Queue</code>`),C=t(`<code>local_entrypoint</code>`),w=t(`<code>modal.Queue</code>`),T=t(`<!> <p>This examples demonstrates the use of Parakeet ASR models for streaming speech-to-text on Modal.</p> <p><!> is the name of a family of ASR models built using <!>.
We’ll show you how to use Parakeet for streaming audio transcription on Modal GPUs,
with simple Python and browser clients.</p> <p>This example uses the <code>nvidia/parakeet-tdt-0.6b-v2</code> model which, as of June 2025, sits at the
top of Hugging Face’s <!>.</p> <p>To try out transcription from your terminal,
provide a URL for a <code>.wav</code> file to <code>modal run</code>:</p> <!> <p>You should see output like the following:</p> <!> <p>Running a web service you can hit from any browser isn’t any harder — Modal handles the deployment of both the frontend and backend in a single App!
Just run</p> <!> <p>and go to the link printed in your terminal.</p> <p>The full frontend code can be found <!>.</p> <!> <!> <!> <p>We use a <!> to cache the model weights.
This allows us to avoid downloading the model weights every time we start a new instance.</p> <p>For more on storing models on Modal, see <!>.</p> <!> <!> <p>The model runs remotely inside a container on Modal. We can define the environment
and install our Python dependencies in that container’s <!>.</p> <p>For finicky setups like NeMO’s, we recommend using the official NVIDIA CUDA Docker images from Docker Hub.
You’ll need to install Python and pip with the <code>add_python</code> option because the image
doesn’t have these by default.</p> <p>Additionally, we install <code>ffmpeg</code> for handling audio data and <code>fastapi</code> to create a web
server for our WebSocket.</p> <!> <!> <p>Now we’re ready to implement transcription. We wrap inference in a <!> that
ensures models are loaded and then moved to the GPU once when a new container starts.</p> <p>A couple of notes about this code:</p> <ul><li>The <code>transcribe</code> method takes bytes of audio data and returns the transcribed text.</li> <li>The <code>web</code> method creates a FastAPI app using <!> that serves a <!> endpoint for streaming audio transcription and a browser frontend for transcribing audio from your microphone.</li> <li>The <code>run_with_queue</code> method takes a <!> and passes audio data and transcriptions between our local machine and the GPU container.</li></ul> <p>Parakeet tries really hard to transcribe everything to English!
Hence it tends to output utterances like “Yeah” or “Mm-hmm” when it runs on silent audio.
We pre-process the incoming audio in the server using <code>pydub</code>’s silence detection,
ensuring that we don’t pass silence into our model.</p> <!> <!> <p>Next, let’s test the model with a <!> that streams audio data to the server and prints
out the transcriptions to our terminal as they arrive.</p> <p>Instead of using the WebSocket endpoint like the browser frontend,
we’ll use a <!> to pass audio data and transcriptions between our local machine and the GPU container.</p> <!> <p>Below are the two functions that coordinate streaming audio and receiving transcriptions.</p> <p><code>send_audio</code> transmits chunks of audio data with a slight delay,
as though it was being streamed from a live source, like a microphone. <code>receive_text</code> waits for transcribed text to arrive and prints it.</p> <!> <!> <p>The remainder of the code in this example is boilerplate,
mostly for handling Parakeet’s input format.</p> <!>`,1);function E(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=T(),p=s(o);d(p,{id:`streaming-audio-transcription-using-parakeet`,children:(e,t)=>{l(),i(e,r(`Streaming audio transcription using Parakeet`))},$$slots:{default:!0}});var h=c(p,4),g=e(h);m(g,{href:`https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html#parakeet`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Parakeet`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA’s NeMo Framework`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);m(c(e(_),3),{href:`https://huggingface.co/spaces/hf-audio/open_asr_leaderboard`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Open ASR leaderboard`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);f(v,{code:`modal%20run%2006_gpu_and_ml%2Fspeech-to-text%2Fstreaming_parakeet.py%20--audio-url%3D%22https%3A%2F%2Fgithub.com%2Fvoxserv%2Faudio_quality_testing_samples%2Fraw%2Frefs%2Fheads%2Fmaster%2Fmono_44100%2F156550__acclivity__a-dream-within-a-dream.wav%22`,lang:`bash`});var E=c(v,4);f(E,{code:`%F0%9F%8E%A4%20Starting%20Transcription%0AA%20Dream%20Within%20A%20Dream%20Edgar%20Allan%20Poe%0Atake%20this%20kiss%20upon%20the%20brow%2C%20And%20in%20parting%20from%20you%20now%2C%20Thus%20much%20let%20me%20avow%20You%20are%20not%20wrong%20who%20deem%20That%20my%20days%20have%20been%20a%20dream.%0A...`,lang:`bash`});var D=c(E,4);f(D,{code:`modal%20serve%2006_gpu_and_ml%2Fspeech-to-text%2Fstreaming_parakeet.py`,lang:`bash`});var O=c(D,4);m(c(e(O)),{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/speech-to-text/streaming-parakeet-frontend/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);u(k,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var A=c(k,2);f(A,{code:`import%20asyncio%0Aimport%20os%0Aimport%20sys%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-streaming-parakeet%22)%0A`,lang:`python`});var j=c(A,2);u(j,{id:`volume-for-caching-model-weights`,children:(e,t)=>{l(),i(e,r(`Volume for caching model weights`))},$$slots:{default:!0}});var M=c(j,2);m(c(e(M)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);m(c(e(N)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);f(P,{code:`model_cache%20%3D%20modal.Volume.from_name(%22parakeet-model-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var F=c(P,2);u(F,{id:`configuring-dependencies`,children:(e,t)=>{l(),i(e,r(`Configuring dependencies`))},$$slots:{default:!0}});var I=c(F,2);m(c(e(I)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(I);var L=c(I,6);f(L,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A12.8.0-cudnn-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20%22%2Fcache%22%2C%20%20%23%20cache%20directory%20for%20Hugging%20Face%20models%0A%20%20%20%20%20%20%20%20%20%20%20%20%22DEBIAN_FRONTEND%22%3A%20%22noninteractive%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CXX%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CC%22%3A%20%22g%2B%2B%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22hf_transfer%3D%3D0.1.9%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22nemo_toolkit%5Basr%5D%3D%3D2.3.2%22%2C%0A%20%20%20%20%20%20%20%20%22cuda-python%3D%3D12.8.0%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%3D%3D0.115.12%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20%20%20%20%20%22pydub%3D%3D0.25.1%22%2C%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%20%20%23%20silence%20chatty%20logs%20by%20container%20on%20start%0A%20%20%20%20.add_local_dir(%20%20%23%20changes%20fastest%2C%20so%20make%20this%20the%20last%20layer%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22streaming-parakeet-frontend%22%2C%0A%20%20%20%20%20%20%20%20remote_path%3D%22%2Ffrontend%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var R=c(L,2);u(R,{id:`implementing-streaming-audio-transcription-on-modal`,children:(e,t)=>{l(),i(e,r(`Implementing streaming audio transcription on Modal`))},$$slots:{default:!0}});var z=c(R,2);m(c(e(z)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(z);var B=c(z,4),V=c(e(B),2),H=c(e(V),3);m(H,{href:`https://modal.com/docs/reference/modal.asgi_app#modalasgi_app`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),m(c(H,2),{href:`https://modal.com/docs/guide/webhooks#websockets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WebSocket`))},$$slots:{default:!0}}),l(),n(V);var U=c(V,2);m(c(e(U),3),{href:`https://modal.com/docs/reference/modal.Queue`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(U),n(B);var W=c(B,4);f(W,{code:`END_OF_STREAM%20%3D%20(%0A%20%20%20%20b%22END_OF_STREAM_8f13d09%22%20%20%23%20byte%20sequence%20indicating%20a%20stream%20is%20finished%0A)%0A%0A%0A%40app.cls(volumes%3D%7B%22%2Fcache%22%3A%20model_cache%7D%2C%20gpu%3D%22a10g%22%2C%20image%3Dimage)%0A%40modal.concurrent(max_inputs%3D14%2C%20target_inputs%3D10)%0Aclass%20ParakeetModel%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20import%20logging%0A%0A%20%20%20%20%20%20%20%20import%20nemo.collections.asr%20as%20nemo_asr%0A%0A%20%20%20%20%20%20%20%20%23%20silence%20chatty%20logs%20from%20nemo%0A%20%20%20%20%20%20%20%20logging.getLogger(%22nemo_logger%22).setLevel(logging.CRITICAL)%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20nemo_asr.models.ASRModel.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20model_name%3D%22nvidia%2Fparakeet-tdt-0.6b-v2%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20def%20transcribe(self%2C%20audio_bytes%3A%20bytes)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20np.frombuffer(audio_bytes%2C%20dtype%3Dnp.int16).astype(np.float32)%0A%0A%20%20%20%20%20%20%20%20with%20NoStdStreams()%3A%20%20%23%20hide%20output%2C%20see%20https%3A%2F%2Fgithub.com%2FNVIDIA%2FNeMo%2Fdiscussions%2F3281%23discussioncomment-2251217%0A%20%20%20%20%20%20%20%20%20%20%20%20output%20%3D%20self.model.transcribe(%5Baudio_data%5D)%0A%0A%20%20%20%20%20%20%20%20return%20output%5B0%5D.text%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20handle_audio_chunk(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20chunk%3A%20bytes%2C%0A%20%20%20%20%20%20%20%20audio_segment%2C%0A%20%20%20%20%20%20%20%20silence_thresh%3D-45%2C%20%20%23%20dB%0A%20%20%20%20%20%20%20%20min_silence_len%3D1000%2C%20%20%23%20ms%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20from%20pydub%20import%20AudioSegment%2C%20silence%0A%0A%20%20%20%20%20%20%20%20new_audio_segment%20%3D%20AudioSegment(%0A%20%20%20%20%20%20%20%20%20%20%20%20data%3Dchunk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20channels%3D1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20sample_width%3D2%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20frame_rate%3DTARGET_SAMPLE_RATE%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20append%20the%20new%20audio%20segment%20to%20the%20existing%20audio%20segment%0A%20%20%20%20%20%20%20%20audio_segment%20%2B%3D%20new_audio_segment%0A%0A%20%20%20%20%20%20%20%20%23%20detect%20windows%20of%20silence%0A%20%20%20%20%20%20%20%20silent_windows%20%3D%20silence.detect_silence(%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_segment%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20min_silence_len%3Dmin_silence_len%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20silence_thresh%3Dsilence_thresh%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20if%20there%20are%20no%20silent%20windows%2C%20continue%0A%20%20%20%20%20%20%20%20if%20len(silent_windows)%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20audio_segment%2C%20None%0A%0A%20%20%20%20%20%20%20%20%23%20get%20the%20last%20silent%20window%20because%0A%20%20%20%20%20%20%20%20%23%20we%20want%20to%20transcribe%20until%20the%20final%20pause%0A%20%20%20%20%20%20%20%20last_window%20%3D%20silent_windows%5B-1%5D%0A%0A%20%20%20%20%20%20%20%20%23%20if%20the%20entire%20audio%20segment%20is%20silent%2C%20reset%20the%20audio%20segment%0A%20%20%20%20%20%20%20%20if%20last_window%5B0%5D%20%3D%3D%200%20and%20last_window%5B1%5D%20%3D%3D%20len(audio_segment)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_segment%20%3D%20AudioSegment.empty()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20audio_segment%2C%20None%0A%0A%20%20%20%20%20%20%20%20%23%20get%20the%20segment%20to%20transcribe%3A%20beginning%20until%20last%20pause%0A%20%20%20%20%20%20%20%20segment_to_transcribe%20%3D%20audio_segment%5B%3A%20last_window%5B1%5D%5D%0A%0A%20%20%20%20%20%20%20%20%23%20remove%20the%20segment%20to%20transcribe%20from%20the%20audio%20segment%0A%20%20%20%20%20%20%20%20audio_segment%20%3D%20audio_segment%5Blast_window%5B1%5D%20%3A%5D%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20text%20%3D%20self.transcribe(segment_to_transcribe.raw_data)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20audio_segment%2C%20text%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22%E2%9D%8C%20Transcription%20error%3A%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20e%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20run_with_queue(self%2C%20q%3A%20modal.Queue)%3A%0A%20%20%20%20%20%20%20%20from%20pydub%20import%20AudioSegment%0A%0A%20%20%20%20%20%20%20%20%23%20initialize%20an%20empty%20audio%20segment%0A%20%20%20%20%20%20%20%20audio_segment%20%3D%20AudioSegment.empty()%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20receive%20a%20chunk%20of%20audio%20data%20and%20convert%20it%20to%20an%20audio%20segment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20await%20q.get.aio(partition%3D%22audio%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%20%3D%3D%20END_OF_STREAM%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(END_OF_STREAM%2C%20partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_segment%2C%20text%20%3D%20await%20self.handle_audio_chunk.remote.aio(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%2C%20audio_segment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(text%2C%20partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Error%20handling%20queue%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%0A%40app.cls(image%3Dimage)%0A%40modal.concurrent(max_inputs%3D100)%0Aclass%20WebServer%3A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Response%2C%20WebSocket%0A%20%20%20%20%20%20%20%20from%20fastapi.responses%20import%20HTMLResponse%0A%20%20%20%20%20%20%20%20from%20fastapi.staticfiles%20import%20StaticFiles%0A%0A%20%20%20%20%20%20%20%20web_app%20%3D%20FastAPI()%0A%20%20%20%20%20%20%20%20web_app.mount(%22%2Fstatic%22%2C%20StaticFiles(directory%3D%22%2Ffrontend%22))%0A%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2Fstatus%22)%0A%20%20%20%20%20%20%20%20async%20def%20status()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20Response(status_code%3D200)%0A%0A%20%20%20%20%20%20%20%20%23%20serve%20frontend%0A%20%20%20%20%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20%20%20%20%20async%20def%20index()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20HTMLResponse(content%3Dopen(%22%2Ffrontend%2Findex.html%22).read())%0A%0A%20%20%20%20%20%20%20%20%40web_app.websocket(%22%2Fws%22)%0A%20%20%20%20%20%20%20%20async%20def%20run_with_websocket(ws%3A%20WebSocket)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20from%20fastapi%20import%20WebSocketDisconnect%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.accept()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20from%20pydub%20import%20AudioSegment%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20model%20%3D%20ParakeetModel()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20initialize%20an%20empty%20audio%20segment%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_segment%20%3D%20AudioSegment.empty()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20receive%20a%20chunk%20of%20audio%20data%20and%20convert%20it%20to%20an%20audio%20segment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20await%20ws.receive_bytes()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20chunk%20%3D%3D%20END_OF_STREAM%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.send_bytes(END_OF_STREAM)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_segment%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20%3D%20await%20model.handle_audio_chunk.remote.aio(chunk%2C%20audio_segment)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.send_text(text)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20isinstance(e%2C%20WebSocketDisconnect)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Error%20handling%20websocket%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20ws.close(code%3D1011%2C%20reason%3D%22Internal%20server%20error%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Error%20closing%20websocket%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22)%0A%0A%20%20%20%20%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var G=c(W,2);u(G,{id:`running-transcription-from-a-local-python-client`,children:(e,t)=>{l(),i(e,r(`Running transcription from a local Python client`))},$$slots:{default:!0}});var K=c(G,2);m(c(e(K)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(K);var q=c(K,2);m(c(e(q)),{href:`https://modal.com/docs/reference/modal.Queue`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(q);var J=c(q,2);f(J,{code:`AUDIO_URL%20%3D%20%22https%3A%2F%2Fgithub.com%2Fvoxserv%2Faudio_quality_testing_samples%2Fraw%2Frefs%2Fheads%2Fmaster%2Fmono_44100%2F156550__acclivity__a-dream-within-a-dream.wav%22%0ATARGET_SAMPLE_RATE%20%3D%2016_000%0ACHUNK_SIZE%20%3D%2016_000%20%20%23%20send%20one%20second%20of%20audio%20at%20a%20time%0A%0A%0A%40app.local_entrypoint()%0Aasync%20def%20main(audio_url%3A%20str%20%3D%20AUDIO_URL)%3A%0A%20%20%20%20from%20urllib.request%20import%20urlopen%0A%0A%20%20%20%20print(f%22%F0%9F%8C%90%20Downloading%20audio%20file%20from%20%7Baudio_url%7D%22)%0A%20%20%20%20audio_bytes%20%3D%20urlopen(audio_url).read()%0A%20%20%20%20print(f%22%F0%9F%8E%A7%20Downloaded%20%7Blen(audio_bytes)%7D%20bytes%22)%0A%0A%20%20%20%20audio_data%20%3D%20preprocess_audio(audio_bytes)%0A%0A%20%20%20%20print(%22%F0%9F%8E%A4%20Starting%20Transcription%22)%0A%20%20%20%20async%20with%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20%20%20%20%20await%20ParakeetModel().run_with_queue.spawn.aio(q)%0A%20%20%20%20%20%20%20%20send%20%3D%20asyncio.create_task(send_audio(q%2C%20audio_data))%0A%20%20%20%20%20%20%20%20recv%20%3D%20asyncio.create_task(receive_text(q))%0A%20%20%20%20%20%20%20%20await%20asyncio.gather(send%2C%20recv)%0A%20%20%20%20print(%22%E2%9C%85%20Transcription%20complete!%22)%0A%0A`,lang:`python`});var Y=c(J,6);f(Y,{code:`async%20def%20send_audio(q%2C%20audio_bytes)%3A%0A%20%20%20%20for%20chunk%20in%20chunk_audio(audio_bytes%2C%20CHUNK_SIZE)%3A%0A%20%20%20%20%20%20%20%20await%20q.put.aio(chunk%2C%20partition%3D%22audio%22)%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(CHUNK_SIZE%20%2F%20TARGET_SAMPLE_RATE%20%2F%208)%0A%20%20%20%20await%20q.put.aio(END_OF_STREAM%2C%20partition%3D%22audio%22)%0A%0A%0Aasync%20def%20receive_text(q)%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20message%20%3D%20await%20q.get.aio(partition%3D%22transcription%22)%0A%20%20%20%20%20%20%20%20if%20message%20%3D%3D%20END_OF_STREAM%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20print(message)%0A%0A`,lang:`python`});var X=c(Y,2);u(X,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),f(c(X,4),{code:`def%20preprocess_audio(audio_bytes%3A%20bytes)%20-%3E%20bytes%3A%0A%20%20%20%20import%20array%0A%20%20%20%20import%20io%0A%20%20%20%20import%20wave%0A%0A%20%20%20%20with%20wave.open(io.BytesIO(audio_bytes)%2C%20%22rb%22)%20as%20wav_in%3A%0A%20%20%20%20%20%20%20%20n_channels%20%3D%20wav_in.getnchannels()%0A%20%20%20%20%20%20%20%20sample_width%20%3D%20wav_in.getsampwidth()%0A%20%20%20%20%20%20%20%20frame_rate%20%3D%20wav_in.getframerate()%0A%20%20%20%20%20%20%20%20n_frames%20%3D%20wav_in.getnframes()%0A%20%20%20%20%20%20%20%20frames%20%3D%20wav_in.readframes(n_frames)%0A%0A%20%20%20%20%23%20Convert%20frames%20to%20array%20based%20on%20sample%20width%0A%20%20%20%20if%20sample_width%20%3D%3D%201%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22B%22%2C%20frames)%20%20%23%20unsigned%20char%0A%20%20%20%20elif%20sample_width%20%3D%3D%202%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22h%22%2C%20frames)%20%20%23%20signed%20short%0A%20%20%20%20elif%20sample_width%20%3D%3D%204%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22i%22%2C%20frames)%20%20%23%20signed%20int%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(f%22Unsupported%20sample%20width%3A%20%7Bsample_width%7D%22)%0A%0A%20%20%20%20%23%20Downmix%20to%20mono%20if%20needed%0A%20%20%20%20if%20n_channels%20%3E%201%3A%0A%20%20%20%20%20%20%20%20mono_data%20%3D%20array.array(audio_data.typecode)%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(0%2C%20len(audio_data)%2C%20n_channels)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20audio_data%5Bi%20%3A%20i%20%2B%20n_channels%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20mono_data.append(sum(chunk)%20%2F%2F%20n_channels)%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20mono_data%0A%0A%20%20%20%20%23%20Resample%20to%2016kHz%20if%20needed%0A%20%20%20%20if%20frame_rate%20!%3D%20TARGET_SAMPLE_RATE%3A%0A%20%20%20%20%20%20%20%20ratio%20%3D%20TARGET_SAMPLE_RATE%20%2F%20frame_rate%0A%20%20%20%20%20%20%20%20new_length%20%3D%20int(len(audio_data)%20*%20ratio)%0A%20%20%20%20%20%20%20%20resampled_data%20%3D%20array.array(audio_data.typecode)%0A%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(new_length)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Linear%20interpolation%0A%20%20%20%20%20%20%20%20%20%20%20%20pos%20%3D%20i%20%2F%20ratio%0A%20%20%20%20%20%20%20%20%20%20%20%20pos_int%20%3D%20int(pos)%0A%20%20%20%20%20%20%20%20%20%20%20%20pos_frac%20%3D%20pos%20-%20pos_int%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20pos_int%20%3E%3D%20len(audio_data)%20-%201%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample%20%3D%20audio_data%5B-1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample1%20%3D%20audio_data%5Bpos_int%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample2%20%3D%20audio_data%5Bpos_int%20%2B%201%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample%20%3D%20int(sample1%20%2B%20(sample2%20-%20sample1)%20*%20pos_frac)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20resampled_data.append(sample)%0A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20resampled_data%0A%0A%20%20%20%20return%20audio_data.tobytes()%0A%0A%0Adef%20chunk_audio(data%3A%20bytes%2C%20chunk_size%3A%20int)%3A%0A%20%20%20%20for%20i%20in%20range(0%2C%20len(data)%2C%20chunk_size)%3A%0A%20%20%20%20%20%20%20%20yield%20data%5Bi%20%3A%20i%20%2B%20chunk_size%5D%0A%0A%0Aclass%20NoStdStreams(object)%3A%0A%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20self.devnull%20%3D%20open(os.devnull%2C%20%22w%22)%0A%0A%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20self._stdout%2C%20self._stderr%20%3D%20sys.stdout%2C%20sys.stderr%0A%20%20%20%20%20%20%20%20self._stdout.flush()%2C%20self._stderr.flush()%0A%20%20%20%20%20%20%20%20sys.stdout%2C%20sys.stderr%20%3D%20self.devnull%2C%20self.devnull%0A%0A%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_value%2C%20traceback)%3A%0A%20%20%20%20%20%20%20%20sys.stdout%2C%20sys.stderr%20%3D%20self._stdout%2C%20self._stderr%0A%20%20%20%20%20%20%20%20self.devnull.close()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{E as default,h as metadata};
//# sourceMappingURL=Qyxrwgy_2.js.map
