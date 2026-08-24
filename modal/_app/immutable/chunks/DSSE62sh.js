(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eefce59c-e2cf-4851-afd5-6c2cacef8fbc`,e._sentryDebugIdIdentifier=`sentry-dbid-eefce59c-e2cf-4851-afd5-6c2cacef8fbc`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`WhisperX transcription with word-level timestamps`,id:`whisperx-transcription-with-word-level-timestamps`,children:[{depth:2,value:`Defining image`,id:`defining-image`},{depth:2,value:`Defining the app`,id:`defining-the-app`},{depth:2,value:`Defining the inference service`,id:`defining-the-inference-service`},{depth:2,value:`Command-line usage`,id:`command-line-usage`}]}],rawContent:`# WhisperX transcription with word-level timestamps

This example shows how to run [WhisperX](https://github.com/m-bain/whisperX) on
Modal for accurate, word-level timestamped transcription.

We’ll walk through the following steps:

1. Defining the container image with CUDA 12.8, cuDNN 8, FFmpeg and Python deps.
2. Persisting model weights to a [Modal Volume](https://modal.com/docs/reference/modal.Volume).
3. A [Modal Cls](https://modal.com/docs/reference/modal.App#cls) that loads WhisperX once per GPU instance.
4. A [local entrypoint](https://modal.com/docs/reference/modal.App#local_entrypoint) that uploads an audio file to the service.

## Defining image

We start from NVIDIA’s official CUDA 12.8 devel image, add cuDNN, FFmpeg, and
install the WhisperX Python package plus its numerical deps.

\`\`\`python
import os
import tempfile
from typing import Dict

import modal

MODEL_CACHE_DIR = "/whisperx-cache"

image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.8.0-cudnn-devel-ubuntu22.04",
        add_python="3.12",
    )
    # ── System deps ─────────────────────────────────────────────────────────────
    .apt_install("ffmpeg")  # audio decoding / resampling
    .apt_install("libcudnn8")  # cuDNN runtime
    .apt_install("libcudnn8-dev")  # cuDNN headers (needed by torch wheels)
    # ── Python deps ─────────────────────────────────────────────────────────────
    .uv_pip_install(
        "whisperx==3.4.0",  # our ASR library
        "numpy==2.0.2",
        "scipy==1.15.0",
    )
    # Tell HF & Torch to cache inside our Volume
    .env({"HF_HOME": MODEL_CACHE_DIR})
    .env({"TORCH_HOME": MODEL_CACHE_DIR})
)

\`\`\`

## Defining the app

Downloaded weights live in a [Modal Volume](https://modal.com/docs/reference/modal.Volume) so subsequent runs reuse them.

\`\`\`python
app = modal.App("example-whisperx-transcribe", image=image)
models_volume = modal.Volume.from_name("whisperx-models", create_if_missing=True)


\`\`\`

## Defining the inference service

We wrap WhisperX inference in a Modal Cls.
A single GPU container can serve multiple concurrent requests.

\`\`\`python
@app.cls(
    gpu="H100",
    image=image,
    volumes={MODEL_CACHE_DIR: models_volume},
    timeout=30 * 60,
)
class WhisperX:
    """Serverless WhisperX service running on a single GPU."""

    @modal.enter()
    def setup(self):
        print("🔄 Loading WhisperX model …")
        import whisperx

        self.model = whisperx.load_model(
            "large-v2",
            device="cuda",
            compute_type="float16",
            download_root=MODEL_CACHE_DIR,
        )
        print("✅ Model ready!")

    @modal.method()
    def transcribe(self, audio_data: bytes) -> Dict:
        """
        Transcribe an audio file passed in as raw bytes.
        Returns language, per-word segments, and total duration.
        """

        import whisperx

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio_path = temp_audio.name

        try:
            audio = whisperx.load_audio(temp_audio_path)
            result = self.model.transcribe(audio, batch_size=16, language="en")

            language = result.get("language", "en")

            if result["segments"]:
                try:
                    align_model, metadata = whisperx.load_align_model(
                        language_code=language,
                        device=self.device,
                        model_dir=MODEL_CACHE_DIR,
                    )
                    result = whisperx.align(
                        result["segments"], align_model, metadata, audio, self.device
                    )
                except Exception as e:
                    print(f"⚠️ Alignment failed: {e} — falling back to segment-level")

            return {
                "language": language,
                "segments": result["segments"],
                "duration": len(audio) / 16_000,  # audio is 16 kHz
            }

        finally:
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)


\`\`\`

## Command-line usage

We expose a [local entrypoint](https://modal.com/docs/reference/modal.App#local_entrypoint)
so you can run:
- using a local audio file
- using a link to an audio file

\`\`\`bash
modal run whisperx_transcribe.py --audio-file audio.wav # uses a local audio file
modal run whisperx_transcribe.py --audio-link https://example.com/audio.wav # uses a link to an audio file
modal run whisperx_transcribe.py # uses a default public audio file
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    audio_file: str = None,
    audio_link: str = None,
):
    import json
    import time

    import requests

    if not audio_file and not audio_link:
        print("No audio file or link provided, using default link")
        audio_link = "https://modal-public-assets.s3.us-east-1.amazonaws.com/erik.wav"

    if audio_file:
        print(f"🔊 Reading {audio_file} …")
        with open(audio_file, "rb") as f:
            audio_data = f.read()
    elif audio_link:
        print(f"🔊 Reading {audio_link} …")
        audio_data = requests.get(audio_link).content

    transcriber = WhisperX()

    print("📝 Transcribing …")
    start = time.time()
    result = transcriber.transcribe.remote(audio_data)
    duration = time.time() - start

    print(f"\\n🌐 Detected language: {result['language']}")
    print(f"⏱️  Audio duration:   {result['duration']:.2f} s")
    print(f"🚀 Time taken:        {duration:.2f} s")

    with open("transcription.json", "w") as f:
        json.dump(result, f, indent=2)

    print("\\n💾 Saved transcription → transcription.json")

\`\`\`
`,meta:{title:`WhisperX transcription with word-level timestamps`,description:`This example shows how to run WhisperX on Modal for accurate, word-level timestamped transcription.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example shows how to run <!> on
Modal for accurate, word-level timestamped transcription.</p> <p>We’ll walk through the following steps:</p> <ol><li>Defining the container image with CUDA 12.8, cuDNN 8, FFmpeg and Python deps.</li> <li>Persisting model weights to a <!>.</li> <li>A <!> that loads WhisperX once per GPU instance.</li> <li>A <!> that uploads an audio file to the service.</li></ol> <!> <p>We start from NVIDIA’s official CUDA 12.8 devel image, add cuDNN, FFmpeg, and
install the WhisperX Python package plus its numerical deps.</p> <!> <!> <p>Downloaded weights live in a <!> so subsequent runs reuse them.</p> <!> <!> <p>We wrap WhisperX inference in a Modal Cls.
A single GPU container can serve multiple concurrent requests.</p> <!> <!> <p>We expose a <!> so you can run:</p> <ul><li>using a local audio file</li> <li>using a link to an audio file</li></ul> <!> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`whisperx-transcription-with-word-level-timestamps`,children:(e,t)=>{l(),i(e,r(`WhisperX transcription with word-level timestamps`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://github.com/m-bain/whisperX`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WhisperX`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4),_=c(e(g),2);m(c(e(_)),{href:`https://modal.com/docs/reference/modal.Volume`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/reference/modal.App#cls`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Cls`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);m(c(e(b)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`local entrypoint`))},$$slots:{default:!0}}),l(),n(b),n(g);var x=c(g,2);u(x,{id:`defining-image`,children:(e,t)=>{l(),i(e,r(`Defining image`))},$$slots:{default:!0}});var S=c(x,4);f(S,{code:`import%20os%0Aimport%20tempfile%0Afrom%20typing%20import%20Dict%0A%0Aimport%20modal%0A%0AMODEL_CACHE_DIR%20%3D%20%22%2Fwhisperx-cache%22%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A12.8.0-cudnn-devel-ubuntu22.04%22%2C%0A%20%20%20%20%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20)%0A%20%20%20%20%23%20%E2%94%80%E2%94%80%20System%20deps%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%0A%20%20%20%20.apt_install(%22ffmpeg%22)%20%20%23%20audio%20decoding%20%2F%20resampling%0A%20%20%20%20.apt_install(%22libcudnn8%22)%20%20%23%20cuDNN%20runtime%0A%20%20%20%20.apt_install(%22libcudnn8-dev%22)%20%20%23%20cuDNN%20headers%20(needed%20by%20torch%20wheels)%0A%20%20%20%20%23%20%E2%94%80%E2%94%80%20Python%20deps%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22whisperx%3D%3D3.4.0%22%2C%20%20%23%20our%20ASR%20library%0A%20%20%20%20%20%20%20%20%22numpy%3D%3D2.0.2%22%2C%0A%20%20%20%20%20%20%20%20%22scipy%3D%3D1.15.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20%23%20Tell%20HF%20%26%20Torch%20to%20cache%20inside%20our%20Volume%0A%20%20%20%20.env(%7B%22HF_HOME%22%3A%20MODEL_CACHE_DIR%7D)%0A%20%20%20%20.env(%7B%22TORCH_HOME%22%3A%20MODEL_CACHE_DIR%7D)%0A)%0A`,lang:`python`});var C=c(S,2);u(C,{id:`defining-the-app`,children:(e,t)=>{l(),i(e,r(`Defining the app`))},$$slots:{default:!0}});var w=c(C,2);m(c(e(w)),{href:`https://modal.com/docs/reference/modal.Volume`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);f(T,{code:`app%20%3D%20modal.App(%22example-whisperx-transcribe%22%2C%20image%3Dimage)%0Amodels_volume%20%3D%20modal.Volume.from_name(%22whisperx-models%22%2C%20create_if_missing%3DTrue)%0A%0A`,lang:`python`});var E=c(T,2);u(E,{id:`defining-the-inference-service`,children:(e,t)=>{l(),i(e,r(`Defining the inference service`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`%40app.cls(%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7BMODEL_CACHE_DIR%3A%20models_volume%7D%2C%0A%20%20%20%20timeout%3D30%20*%2060%2C%0A)%0Aclass%20WhisperX%3A%0A%20%20%20%20%22%22%22Serverless%20WhisperX%20service%20running%20on%20a%20single%20GPU.%22%22%22%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%94%84%20Loading%20WhisperX%20model%20%E2%80%A6%22)%0A%20%20%20%20%20%20%20%20import%20whisperx%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20whisperx.load_model(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22large-v2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3D%22cuda%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20compute_type%3D%22float16%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20download_root%3DMODEL_CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20print(%22%E2%9C%85%20Model%20ready!%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20transcribe(self%2C%20audio_data%3A%20bytes)%20-%3E%20Dict%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Transcribe%20an%20audio%20file%20passed%20in%20as%20raw%20bytes.%0A%20%20%20%20%20%20%20%20Returns%20language%2C%20per-word%20segments%2C%20and%20total%20duration.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%0A%20%20%20%20%20%20%20%20import%20whisperx%0A%0A%20%20%20%20%20%20%20%20with%20tempfile.NamedTemporaryFile(suffix%3D%22.wav%22%2C%20delete%3DFalse)%20as%20temp_audio%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20temp_audio.write(audio_data)%0A%20%20%20%20%20%20%20%20%20%20%20%20temp_audio_path%20%3D%20temp_audio.name%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio%20%3D%20whisperx.load_audio(temp_audio_path)%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20self.model.transcribe(audio%2C%20batch_size%3D16%2C%20language%3D%22en%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20language%20%3D%20result.get(%22language%22%2C%20%22en%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20result%5B%22segments%22%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20align_model%2C%20metadata%20%3D%20whisperx.load_align_model(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20language_code%3Dlanguage%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20device%3Dself.device%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model_dir%3DMODEL_CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20whisperx.align(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20result%5B%22segments%22%5D%2C%20align_model%2C%20metadata%2C%20audio%2C%20self.device%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%E2%9A%A0%EF%B8%8F%20Alignment%20failed%3A%20%7Be%7D%20%E2%80%94%20falling%20back%20to%20segment-level%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22language%22%3A%20language%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22segments%22%3A%20result%5B%22segments%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22duration%22%3A%20len(audio)%20%2F%2016_000%2C%20%20%23%20audio%20is%2016%20kHz%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20os.path.exists(temp_audio_path)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20os.unlink(temp_audio_path)%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`command-line-usage`,children:(e,t)=>{l(),i(e,r(`Command-line usage`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`local entrypoint`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,4);f(A,{code:`modal%20run%20whisperx_transcribe.py%20--audio-file%20audio.wav%20%23%20uses%20a%20local%20audio%20file%0Amodal%20run%20whisperx_transcribe.py%20--audio-link%20https%3A%2F%2Fexample.com%2Faudio.wav%20%23%20uses%20a%20link%20to%20an%20audio%20file%0Amodal%20run%20whisperx_transcribe.py%20%23%20uses%20a%20default%20public%20audio%20file`,lang:`bash`}),f(c(A,2),{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20audio_file%3A%20str%20%3D%20None%2C%0A%20%20%20%20audio_link%3A%20str%20%3D%20None%2C%0A)%3A%0A%20%20%20%20import%20json%0A%20%20%20%20import%20time%0A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20if%20not%20audio_file%20and%20not%20audio_link%3A%0A%20%20%20%20%20%20%20%20print(%22No%20audio%20file%20or%20link%20provided%2C%20using%20default%20link%22)%0A%20%20%20%20%20%20%20%20audio_link%20%3D%20%22https%3A%2F%2Fmodal-public-assets.s3.us-east-1.amazonaws.com%2Ferik.wav%22%0A%0A%20%20%20%20if%20audio_file%3A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%94%8A%20Reading%20%7Baudio_file%7D%20%E2%80%A6%22)%0A%20%20%20%20%20%20%20%20with%20open(audio_file%2C%20%22rb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_data%20%3D%20f.read()%0A%20%20%20%20elif%20audio_link%3A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%94%8A%20Reading%20%7Baudio_link%7D%20%E2%80%A6%22)%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20requests.get(audio_link).content%0A%0A%20%20%20%20transcriber%20%3D%20WhisperX()%0A%0A%20%20%20%20print(%22%F0%9F%93%9D%20Transcribing%20%E2%80%A6%22)%0A%20%20%20%20start%20%3D%20time.time()%0A%20%20%20%20result%20%3D%20transcriber.transcribe.remote(audio_data)%0A%20%20%20%20duration%20%3D%20time.time()%20-%20start%0A%0A%20%20%20%20print(f%22%5Cn%F0%9F%8C%90%20Detected%20language%3A%20%7Bresult%5B'language'%5D%7D%22)%0A%20%20%20%20print(f%22%E2%8F%B1%EF%B8%8F%20%20Audio%20duration%3A%20%20%20%7Bresult%5B'duration'%5D%3A.2f%7D%20s%22)%0A%20%20%20%20print(f%22%F0%9F%9A%80%20Time%20taken%3A%20%20%20%20%20%20%20%20%7Bduration%3A.2f%7D%20s%22)%0A%0A%20%20%20%20with%20open(%22transcription.json%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20json.dump(result%2C%20f%2C%20indent%3D2)%0A%0A%20%20%20%20print(%22%5Cn%F0%9F%92%BE%20Saved%20transcription%20%E2%86%92%20transcription.json%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DSSE62sh.js.map
