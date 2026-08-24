(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`abda39b1-532a-4023-ba27-73c992300466`,e._sentryDebugIdIdentifier=`sentry-dbid-abda39b1-532a-4023-ba27-73c992300466`)}catch{}})();import{c as e,d as t}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as n}from"./BILrvr3I.js";import{t as r}from"./B4L_if842.js";var i={toc:[],rawContent:`\`\`\`python
import asyncio
import pathlib
import re
import tempfile
import time
import urllib
from typing import Iterator

import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg")
    .uv_pip_install(
        "fastapi==0.116.1",
        "ffmpeg-python==0.2.0",
        "openai-whisper==20250625",
        "numpy<2",
    )
)
app = modal.App(name="example-streaming-whisper", image=image)
SAMPLE_URL = (
    "https://modal-cdn.com/history-of-rome-podcast-duncan-001-in-the-beginning.mp3"
)

CACHE_DIR = "/root/.cache/whisper"
whisper_cache = modal.Volume.from_name("whisper-cache", create_if_missing=True)


def load_audio(data: bytes, start=None, end=None, sr: int = 16000):
    import ffmpeg
    import numpy as np

    try:
        fp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        fp.write(data)
        fp.close()
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and \`ffmpeg-python\` package to be installed.
        if start is None and end is None:
            out, _ = (
                ffmpeg.input(fp.name, threads=0)
                .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=sr)
                .run(
                    cmd=["ffmpeg", "-nostdin"], capture_stdout=True, capture_stderr=True
                )
            )
        else:
            out, _ = (
                ffmpeg.input(fp.name, threads=0)
                .filter("atrim", start=start, end=end)
                .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=sr)
                .run(
                    cmd=["ffmpeg", "-nostdin"], capture_stdout=True, capture_stderr=True
                )
            )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e

    return np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0


def split_silences(
    path: str, min_segment_length: float = 30.0, min_silence_length: float = 0.8
) -> Iterator[tuple[float, float]]:
    """
    Split audio file into contiguous chunks using the ffmpeg \`silencedetect\` filter.
    Yields tuples (start, end) of each chunk in seconds.

    Parameters
    ----------
    path: str
        path to the audio file on disk.
    min_segment_length : float
        The minimum acceptable length for an audio segment in seconds. Lower values
        allow for more splitting and increased parallelizing, but decrease transcription
        accuracy. Whisper models expect to transcribe in 30 second segments.
    min_silence_length : float
        Minimum silence to detect and split on, in seconds. Lower values are more likely to split
        audio in middle of phrases and degrade transcription accuracy.
    """
    import ffmpeg

    silence_end_re = re.compile(
        r" silence_end: (?P<end>[0-9]+(\\.?[0-9]*)) \\| silence_duration: (?P<dur>[0-9]+(\\.?[0-9]*))"
    )

    metadata = ffmpeg.probe(path)
    duration = float(metadata["format"]["duration"])

    reader = (
        ffmpeg.input(str(path))
        .filter("silencedetect", n="-10dB", d=min_silence_length)
        .output("pipe:", format="null")
        .run_async(pipe_stderr=True)
    )

    cur_start = 0.0
    num_segments = 0

    while True:
        line = reader.stderr.readline().decode("utf-8")
        if not line:
            break
        match = silence_end_re.search(line)
        if match:
            silence_end, silence_dur = match.group("end"), match.group("dur")
            split_at = float(silence_end) - (float(silence_dur) / 2)

            if (split_at - cur_start) < min_segment_length:
                continue

            yield cur_start, split_at
            cur_start = split_at
            num_segments += 1

    # silencedetect can place the silence end *after* the end of the full audio segment.
    # Such segments definitions are negative length and invalid.
    if duration > cur_start and (duration - cur_start) > min_segment_length:
        yield cur_start, duration
        num_segments += 1
    print(f"Split {path} into {num_segments} segments")


@app.function(gpu="a10", volumes={CACHE_DIR: whisper_cache})
def transcribe_segment(start: float, end: float, audio_data: bytes, model: str):
    import torch
    import whisper

    print(
        f"Transcribing segment {start:.2f} to {end:.2f} ({end - start:.2f}s duration)"
    )

    t0 = time.time()
    use_gpu = torch.cuda.is_available()
    device = "cuda" if use_gpu else "cpu"
    model = whisper.load_model(model, device=device)
    np_array = load_audio(audio_data, start=start, end=end)
    result = model.transcribe(np_array, language="en", fp16=use_gpu)  # type: ignore
    print(
        f"Transcribed segment {start:.2f} to {end:.2f} ({end - start:.2f}s duration) in {time.time() - t0:.2f} seconds."
    )

    # Add back offsets.
    for segment in result["segments"]:
        segment["start"] += start
        segment["end"] += start

    return result


async def stream_whisper(audio_data: bytes):
    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(audio_data)
        f.flush()
        segment_gen = split_silences(f.name)

    async for result in transcribe_segment.starmap(
        segment_gen, kwargs=dict(audio_data=audio_data, model="base.en")
    ):
        # Must cooperatively yield here otherwise \`StreamingResponse\` will not iteratively return stream parts.
        # see: https://github.com/python/asyncio/issues/284#issuecomment-154162668
        await asyncio.sleep(0)
        yield result["text"]


@app.function()
@modal.asgi_app()
def api():
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import StreamingResponse

    web_app = FastAPI()

    @web_app.get("/transcribe")
    async def transcribe(url: str):
        """
        Usage:

        \`\`\`sh
        curl --no-buffer \\
            https://modal-labs-examples--example-streaming-whisper-api.modal.run/transcribe?url=https://modal-cdn.com/history-of-rome-podcast-duncan-001-in-the-beginning.mp3
        \`\`\`

        This endpoint will stream back the audio transcription as it makes progress.
        """
        print(f"downloading {url}")
        try:
            with urllib.request.urlopen(url) as response:
                assert response.getcode() == 200, response.getcode()
                audio_data = response.read()
        except AssertionError:
            raise HTTPException(status_code=422, detail=f"Could not process url {url}")
        print(f"streaming transcription of {url} audio to client...")
        return StreamingResponse(
            stream_whisper(audio_data), media_type="text/event-stream"
        )

    return web_app


@app.function()
async def transcribe_cli(data: bytes, suffix: str):
    async for result in stream_whisper(data):
        print(result)


@app.local_entrypoint()
def main(path: str = SAMPLE_URL):
    if path.startswith("http"):
        with urllib.request.urlopen(path) as response:
            assert response.getcode() == 200, response.getcode()
            data = response.read()
        suffix = path.rsplit(".")[-1]
    else:
        filepath = pathlib.Path(path)
        data = filepath.read_bytes()
        suffix = filepath.suffix
    transcribe_cli.remote(data, suffix=suffix)

\`\`\`
`,meta:{}},{toc:a,rawContent:o,meta:s}=i;function c(a,o){let s=e(o,[`children`,`$$slots`,`$$events`,`$$legacy`]);r(a,t(()=>s,()=>i,{children:(e,t)=>{n(e,{code:`import%20asyncio%0Aimport%20pathlib%0Aimport%20re%0Aimport%20tempfile%0Aimport%20time%0Aimport%20urllib%0Afrom%20typing%20import%20Iterator%0A%0Aimport%20modal%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22fastapi%3D%3D0.116.1%22%2C%0A%20%20%20%20%20%20%20%20%22ffmpeg-python%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20%22openai-whisper%3D%3D20250625%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20)%0A)%0Aapp%20%3D%20modal.App(name%3D%22example-streaming-whisper%22%2C%20image%3Dimage)%0ASAMPLE_URL%20%3D%20(%0A%20%20%20%20%22https%3A%2F%2Fmodal-cdn.com%2Fhistory-of-rome-podcast-duncan-001-in-the-beginning.mp3%22%0A)%0A%0ACACHE_DIR%20%3D%20%22%2Froot%2F.cache%2Fwhisper%22%0Awhisper_cache%20%3D%20modal.Volume.from_name(%22whisper-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0Adef%20load_audio(data%3A%20bytes%2C%20start%3DNone%2C%20end%3DNone%2C%20sr%3A%20int%20%3D%2016000)%3A%0A%20%20%20%20import%20ffmpeg%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20fp%20%3D%20tempfile.NamedTemporaryFile(delete%3DFalse%2C%20suffix%3D%22.wav%22)%0A%20%20%20%20%20%20%20%20fp.write(data)%0A%20%20%20%20%20%20%20%20fp.close()%0A%20%20%20%20%20%20%20%20%23%20This%20launches%20a%20subprocess%20to%20decode%20audio%20while%20down-mixing%20and%20resampling%20as%20necessary.%0A%20%20%20%20%20%20%20%20%23%20Requires%20the%20ffmpeg%20CLI%20and%20%60ffmpeg-python%60%20package%20to%20be%20installed.%0A%20%20%20%20%20%20%20%20if%20start%20is%20None%20and%20end%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20out%2C%20_%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ffmpeg.input(fp.name%2C%20threads%3D0)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20.output(%22-%22%2C%20format%3D%22s16le%22%2C%20acodec%3D%22pcm_s16le%22%2C%20ac%3D1%2C%20ar%3Dsr)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cmd%3D%5B%22ffmpeg%22%2C%20%22-nostdin%22%5D%2C%20capture_stdout%3DTrue%2C%20capture_stderr%3DTrue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20out%2C%20_%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ffmpeg.input(fp.name%2C%20threads%3D0)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20.filter(%22atrim%22%2C%20start%3Dstart%2C%20end%3Dend)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20.output(%22-%22%2C%20format%3D%22s16le%22%2C%20acodec%3D%22pcm_s16le%22%2C%20ac%3D1%2C%20ar%3Dsr)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cmd%3D%5B%22ffmpeg%22%2C%20%22-nostdin%22%5D%2C%20capture_stdout%3DTrue%2C%20capture_stderr%3DTrue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20except%20ffmpeg.Error%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Failed%20to%20load%20audio%3A%20%7Be.stderr.decode()%7D%22)%20from%20e%0A%0A%20%20%20%20return%20np.frombuffer(out%2C%20np.int16).flatten().astype(np.float32)%20%2F%2032768.0%0A%0A%0Adef%20split_silences(%0A%20%20%20%20path%3A%20str%2C%20min_segment_length%3A%20float%20%3D%2030.0%2C%20min_silence_length%3A%20float%20%3D%200.8%0A)%20-%3E%20Iterator%5Btuple%5Bfloat%2C%20float%5D%5D%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Split%20audio%20file%20into%20contiguous%20chunks%20using%20the%20ffmpeg%20%60silencedetect%60%20filter.%0A%20%20%20%20Yields%20tuples%20(start%2C%20end)%20of%20each%20chunk%20in%20seconds.%0A%0A%20%20%20%20Parameters%0A%20%20%20%20----------%0A%20%20%20%20path%3A%20str%0A%20%20%20%20%20%20%20%20path%20to%20the%20audio%20file%20on%20disk.%0A%20%20%20%20min_segment_length%20%3A%20float%0A%20%20%20%20%20%20%20%20The%20minimum%20acceptable%20length%20for%20an%20audio%20segment%20in%20seconds.%20Lower%20values%0A%20%20%20%20%20%20%20%20allow%20for%20more%20splitting%20and%20increased%20parallelizing%2C%20but%20decrease%20transcription%0A%20%20%20%20%20%20%20%20accuracy.%20Whisper%20models%20expect%20to%20transcribe%20in%2030%20second%20segments.%0A%20%20%20%20min_silence_length%20%3A%20float%0A%20%20%20%20%20%20%20%20Minimum%20silence%20to%20detect%20and%20split%20on%2C%20in%20seconds.%20Lower%20values%20are%20more%20likely%20to%20split%0A%20%20%20%20%20%20%20%20audio%20in%20middle%20of%20phrases%20and%20degrade%20transcription%20accuracy.%0A%20%20%20%20%22%22%22%0A%20%20%20%20import%20ffmpeg%0A%0A%20%20%20%20silence_end_re%20%3D%20re.compile(%0A%20%20%20%20%20%20%20%20r%22%20silence_end%3A%20(%3FP%3Cend%3E%5B0-9%5D%2B(%5C.%3F%5B0-9%5D*))%20%5C%7C%20silence_duration%3A%20(%3FP%3Cdur%3E%5B0-9%5D%2B(%5C.%3F%5B0-9%5D*))%22%0A%20%20%20%20)%0A%0A%20%20%20%20metadata%20%3D%20ffmpeg.probe(path)%0A%20%20%20%20duration%20%3D%20float(metadata%5B%22format%22%5D%5B%22duration%22%5D)%0A%0A%20%20%20%20reader%20%3D%20(%0A%20%20%20%20%20%20%20%20ffmpeg.input(str(path))%0A%20%20%20%20%20%20%20%20.filter(%22silencedetect%22%2C%20n%3D%22-10dB%22%2C%20d%3Dmin_silence_length)%0A%20%20%20%20%20%20%20%20.output(%22pipe%3A%22%2C%20format%3D%22null%22)%0A%20%20%20%20%20%20%20%20.run_async(pipe_stderr%3DTrue)%0A%20%20%20%20)%0A%0A%20%20%20%20cur_start%20%3D%200.0%0A%20%20%20%20num_segments%20%3D%200%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20line%20%3D%20reader.stderr.readline().decode(%22utf-8%22)%0A%20%20%20%20%20%20%20%20if%20not%20line%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20match%20%3D%20silence_end_re.search(line)%0A%20%20%20%20%20%20%20%20if%20match%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20silence_end%2C%20silence_dur%20%3D%20match.group(%22end%22)%2C%20match.group(%22dur%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20split_at%20%3D%20float(silence_end)%20-%20(float(silence_dur)%20%2F%202)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(split_at%20-%20cur_start)%20%3C%20min_segment_length%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20cur_start%2C%20split_at%0A%20%20%20%20%20%20%20%20%20%20%20%20cur_start%20%3D%20split_at%0A%20%20%20%20%20%20%20%20%20%20%20%20num_segments%20%2B%3D%201%0A%0A%20%20%20%20%23%20silencedetect%20can%20place%20the%20silence%20end%20*after*%20the%20end%20of%20the%20full%20audio%20segment.%0A%20%20%20%20%23%20Such%20segments%20definitions%20are%20negative%20length%20and%20invalid.%0A%20%20%20%20if%20duration%20%3E%20cur_start%20and%20(duration%20-%20cur_start)%20%3E%20min_segment_length%3A%0A%20%20%20%20%20%20%20%20yield%20cur_start%2C%20duration%0A%20%20%20%20%20%20%20%20num_segments%20%2B%3D%201%0A%20%20%20%20print(f%22Split%20%7Bpath%7D%20into%20%7Bnum_segments%7D%20segments%22)%0A%0A%0A%40app.function(gpu%3D%22a10%22%2C%20volumes%3D%7BCACHE_DIR%3A%20whisper_cache%7D)%0Adef%20transcribe_segment(start%3A%20float%2C%20end%3A%20float%2C%20audio_data%3A%20bytes%2C%20model%3A%20str)%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20import%20whisper%0A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Transcribing%20segment%20%7Bstart%3A.2f%7D%20to%20%7Bend%3A.2f%7D%20(%7Bend%20-%20start%3A.2f%7Ds%20duration)%22%0A%20%20%20%20)%0A%0A%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20use_gpu%20%3D%20torch.cuda.is_available()%0A%20%20%20%20device%20%3D%20%22cuda%22%20if%20use_gpu%20else%20%22cpu%22%0A%20%20%20%20model%20%3D%20whisper.load_model(model%2C%20device%3Ddevice)%0A%20%20%20%20np_array%20%3D%20load_audio(audio_data%2C%20start%3Dstart%2C%20end%3Dend)%0A%20%20%20%20result%20%3D%20model.transcribe(np_array%2C%20language%3D%22en%22%2C%20fp16%3Duse_gpu)%20%20%23%20type%3A%20ignore%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Transcribed%20segment%20%7Bstart%3A.2f%7D%20to%20%7Bend%3A.2f%7D%20(%7Bend%20-%20start%3A.2f%7Ds%20duration)%20in%20%7Btime.time()%20-%20t0%3A.2f%7D%20seconds.%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Add%20back%20offsets.%0A%20%20%20%20for%20segment%20in%20result%5B%22segments%22%5D%3A%0A%20%20%20%20%20%20%20%20segment%5B%22start%22%5D%20%2B%3D%20start%0A%20%20%20%20%20%20%20%20segment%5B%22end%22%5D%20%2B%3D%20start%0A%0A%20%20%20%20return%20result%0A%0A%0Aasync%20def%20stream_whisper(audio_data%3A%20bytes)%3A%0A%20%20%20%20with%20tempfile.NamedTemporaryFile(delete%3DFalse)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(audio_data)%0A%20%20%20%20%20%20%20%20f.flush()%0A%20%20%20%20%20%20%20%20segment_gen%20%3D%20split_silences(f.name)%0A%0A%20%20%20%20async%20for%20result%20in%20transcribe_segment.starmap(%0A%20%20%20%20%20%20%20%20segment_gen%2C%20kwargs%3Ddict(audio_data%3Daudio_data%2C%20model%3D%22base.en%22)%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%23%20Must%20cooperatively%20yield%20here%20otherwise%20%60StreamingResponse%60%20will%20not%20iteratively%20return%20stream%20parts.%0A%20%20%20%20%20%20%20%20%23%20see%3A%20https%3A%2F%2Fgithub.com%2Fpython%2Fasyncio%2Fissues%2F284%23issuecomment-154162668%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(0)%0A%20%20%20%20%20%20%20%20yield%20result%5B%22text%22%5D%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20api()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20HTTPException%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%40web_app.get(%22%2Ftranscribe%22)%0A%20%20%20%20async%20def%20transcribe(url%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Usage%3A%0A%0A%20%20%20%20%20%20%20%20%60%60%60sh%0A%20%20%20%20%20%20%20%20curl%20--no-buffer%20%5C%0A%20%20%20%20%20%20%20%20%20%20%20%20https%3A%2F%2Fmodal-labs-examples--example-streaming-whisper-api.modal.run%2Ftranscribe%3Furl%3Dhttps%3A%2F%2Fmodal-cdn.com%2Fhistory-of-rome-podcast-duncan-001-in-the-beginning.mp3%0A%20%20%20%20%20%20%20%20%60%60%60%0A%0A%20%20%20%20%20%20%20%20This%20endpoint%20will%20stream%20back%20the%20audio%20transcription%20as%20it%20makes%20progress.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20print(f%22downloading%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20assert%20response.getcode()%20%3D%3D%20200%2C%20response.getcode()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_data%20%3D%20response.read()%0A%20%20%20%20%20%20%20%20except%20AssertionError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D422%2C%20detail%3Df%22Could%20not%20process%20url%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20print(f%22streaming%20transcription%20of%20%7Burl%7D%20audio%20to%20client...%22)%0A%20%20%20%20%20%20%20%20return%20StreamingResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20stream_whisper(audio_data)%2C%20media_type%3D%22text%2Fevent-stream%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20web_app%0A%0A%0A%40app.function()%0Aasync%20def%20transcribe_cli(data%3A%20bytes%2C%20suffix%3A%20str)%3A%0A%20%20%20%20async%20for%20result%20in%20stream_whisper(data)%3A%0A%20%20%20%20%20%20%20%20print(result)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(path%3A%20str%20%3D%20SAMPLE_URL)%3A%0A%20%20%20%20if%20path.startswith(%22http%22)%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(path)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20assert%20response.getcode()%20%3D%3D%20200%2C%20response.getcode()%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20response.read()%0A%20%20%20%20%20%20%20%20suffix%20%3D%20path.rsplit(%22.%22)%5B-1%5D%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20filepath%20%3D%20pathlib.Path(path)%0A%20%20%20%20%20%20%20%20data%20%3D%20filepath.read_bytes()%0A%20%20%20%20%20%20%20%20suffix%20%3D%20filepath.suffix%0A%20%20%20%20transcribe_cli.remote(data%2C%20suffix%3Dsuffix)%0A`,lang:`python`})},$$slots:{default:!0}}))}export{c as default,i as metadata};
//# sourceMappingURL=B_NFNsKe2.js.map
