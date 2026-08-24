(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c455ca37-30fa-4414-8410-d7397ada6de6`,e._sentryDebugIdIdentifier=`sentry-dbid-c455ca37-30fa-4414-8410-d7397ada6de6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./DBIL8FrF.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`How to deploy Whisper to transcribe audio in seconds`,description:`A step by step tutorial of hosting Whisper, OpenAI's open-source ASR model.`,date:`2025-09-14T12:00:00.000Z`,length:`8 minute read`,category:`Article`,subcategory:`Audio Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is the Whisper AI Model?`,id:`what-is-the-whisper-ai-model`},{depth:2,value:`Ways to deploy Whisper`,id:`ways-to-deploy-whisper`},{depth:2,value:`How to deploy Whisper in minutes`,id:`how-to-deploy-whisper-in-minutes`,children:[{depth:3,value:`Setting up the Modal app and container image`,id:`setting-up-the-modal-app-and-container-image`},{depth:3,value:`The entry point that runs locally`,id:`the-entry-point-that-runs-locally`},{depth:3,value:`The GPU-accelerated transcription class`,id:`the-gpu-accelerated-transcription-class`},{depth:3,value:`The actual transcription logic`,id:`the-actual-transcription-logic`}]},{depth:2,value:`Transcribing a podcast`,id:`transcribing-a-podcast`},{depth:2,value:`What other models can I use for transcription?`,id:`what-other-models-can-i-use-for-transcription`}],rawContent:`In the past few years, AI/ML models have gotten so good that you can transcribe any good audio (and even some bad stuff) for basically zero cost and in seconds. That’s what we’re going to do here, transcribing a podcast using a few lines of code, the OpenAI Whisper model, and an [H100 on Modal](/blog/introducing-h100).

## What is the Whisper AI Model?

The [Whisper AI model](https://openai.com/index/whisper/) is OpenAI's open-source automatic speech recognition (also called speech-to-text) system that can transcribe audio in over 100 languages with incredible accuracy. Whisper is trained on 680,000 hours of multilingual data and available in multiple sizes from tiny (39M parameters) to large (1.5B parameters).

At its core, Whisper uses a transformer-based encoder-decoder architecture. When you feed it audio, the model takes 30-second chunks and encodes the raw waveforms as spectrograms, which are visual maps of how sound frequencies change over time.

The decoder generates text tokens one at a time. It uses attention mechanisms to figure out which parts of the audio matter for each word it's writing. The whole system does a bunch of things at once:

- **Language detection on the fly**: feed it audio in French, Japanese, or English, and it figures it out
- **Timestamp alignment**: it knows not just what was said, but when it was said
- **Multi-task training**: translation, voice activity detection, and transcription all happen in the same pass

What makes Whisper so good at handling real-world audio is the sheer variety of stuff it was trained on. Podcasts, YouTube videos, audiobooks, and random conversations recorded in every possible acoustic condition. Got background noise? Heavy accent? Technical jargon? Whisper's probably heard something similar before. The model even knows the difference between someone talking and background music or dead air, thanks to special tokens that mark non-speech events.

## Ways to deploy Whisper

Since Whisper is open-source, there are many ways to use it. The simplest is to use Whisper via a hosted endpoint—for example, through [OpenAI](https://openai.com/api/) directly or via a 3rd party like Amazon Bedrock. On the other end of the spectrum, you could self-host Whisper using EC2 or GCE. This would require that you manually handle scaling, GPU capacity, and other infrastructure concerns.

In recent years, cloud platforms purpose-built for deploying AI models have become popular as well. Modal, for example, handles scaling and efficient allocation of GPU capacity while still giving developers full control of what model weights and inference logic they want to use. The rest of this tutorial shows you how to deploy Whisper on Modal.

## How to deploy Whisper in minutes

Let’s transcribe. If you don’t have a Modal account, [head here to sign up](/signup). You get $30 of GPU credits every month, so following this tutorial will be entirely free.

Then we’ll set up modal locally:

\`\`\`bash
mkdir whisper-tutorial && cd whisper-tutorial
python -m venv .env
source .env/bin/activate
pip install modal requests
\`\`\`

The above commands create a new project directory, set up a Python virtual environment to keep your dependencies clean, and install Modal (for GPU compute) and requests (for downloading audio files).

Next, you'll need to authenticate Modal on your machine:

\`\`\`bash
modal setup
\`\`\`

This opens your browser to grab an API token. Once that's done, you're ready to write the actual transcription code.

Here’s the full code we’ll use:

\`\`\`python
import modal

app = modal.App(name="whisper-transcribe-openai")

image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "openai-whisper==20250625",
    "librosa==0.11.0",
)

@app.local_entrypoint()
def main(audio_url: str):
    import requests

    response = requests.get(audio_url)

    text = Transcribe().transcribe.remote(response.content)
    print(f"Transcription: {text}")

@app.cls(
    image=image,
    gpu="H100",
)
class Transcribe:
    @modal.enter()
    def load_model(self):
        import whisper

        self.model = whisper.load_model("base")

    @modal.method()
    def transcribe(
        self,
        audio_bytes: bytes,
    ) -> str:
        import io
        import librosa

        audio_data, _ = librosa.load(io.BytesIO(audio_bytes), sr=16000)
        transcription = self.model.transcribe(audio_data)["text"]

        return transcription
\`\`\`

This is pretty brief for how powerful it is. Let’s walk through it.

### Setting up the Modal app and container image

\`\`\`python
import modal

app = modal.App(name="whisper-transcribe-openai")

image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "openai-whisper==20250625",
    "librosa==0.11.0",
)
\`\`\`

First, we create a Modal app and define the container image that'll run on the GPU. Modal handles all the infrastructure complexity, you just specify what packages you need. No config files necessary, as all your dependencies can be defined in-line with your application code. We're using a slim Debian image with Python 3.12, and installing Whisper plus [librosa](https://librosa.org/doc/latest/index.html) (for audio processing). The \`uv_pip_install\` conveniently uses [uv](https://docs.astral.sh/uv/) under the hood for fast installs.

### The entry point that runs locally

\`\`\`python
@app.local_entrypoint()
def main(audio_url: str):
    import requests

    response = requests.get(audio_url)

    text = Transcribe().transcribe.remote(response.content)
    print(f"Transcription: {text}")
\`\`\`

This function runs on your local machine, not the GPU. It downloads the audio file from whatever URL you provide, then ships the audio bytes to the GPU for transcription. The \`.remote()\` call is where the magic happens, sending your audio to Modal's infrastructure and getting back the transcript. For a deployment in production, you can invoke the Modal function via HTTP, WebSocket, and more.

### The GPU-accelerated transcription class

\`\`\`python
@app.cls(
    image=image,
    gpu="H100",
)
class Transcribe:
    @modal.enter()
    def load_model(self):
        import whisper

        self.model = whisper.load_model("base")
\`\`\`

The \`@app.cls\` decorator tells Modal to run this class on an H100 GPU using our container image. The \`@modal.enter()\` method runs once when the container starts up, loading the Whisper model into memory. This happens before any transcription requests, so you're not wasting time loading the model for each audio file.

Notice we're using the "base" model here. You can swap this for "tiny", "small", "medium", "large", or "large-v3" depending on your accuracy needs and speed requirements. Larger models are more accurate but slower.

### The actual transcription logic

\`\`\`python
    @modal.method()
    def transcribe(
        self,
        audio_bytes: bytes,
    ) -> str:
        import io
        import librosa

        audio_data, _ = librosa.load(io.BytesIO(audio_bytes), sr=16000)
        transcription = self.model.transcribe(audio_data)["text"]

        return transcription
\`\`\`

This method takes the raw audio bytes and converts them into something Whisper can understand. Librosa loads the audio and resamples it to 16kHz (Whisper's expected sample rate), then we pass it to the model for transcription. The model returns a dictionary with the text, timestamps, and other metadata, but we just grab the text here.

To run this on your own podcast, save the code to \`transcribe.py\` and run:

\`\`\`bash
modal run transcribe.py --audio-url "https://example.com/your-podcast.mp3"
\`\`\`

The first run takes longer as Modal caches the container image for the first time, but after that, you'll get transcriptions in seconds to minutes depending on the audio length and model size.

## Transcribing a podcast

Let’s do a real-life run through. We’ll choose The Rest is History podcast, and we can grab the raw MP3 audio file URL from [Podchaser](https://www.podchaser.com). We’ll choose the recent [Mad victorian sport](https://www.podchaser.com/podcasts/the-rest-is-history-1544851/episodes/mad-victorian-sport-262800338) episode.

Here’s what we’ll run:

\`\`\`bash
modal run transcribe.py --audio-url "https://pdst.fm/e/chrt.fm/track/A27C8C/traffic.megaphone.fm/GLT6102181144.mp3?updated=1755269114"
\`\`\`

Because this is the first time we’ve created this image, we get about a minute of initial build. But then we’re into the actual model run, which takes 2m14s:

![Whisper on Modal](https://modal-cdn.com/blog/images/whisper-container-timeline.webp)

The podcast audio is 57m50s, so we are transcribing about 26 minutes of audio per minute of processing time.

Here’s the start of the transcription:

> Thank you for listening to The Rest is History. For weekly bonus episodes, add free listening, early access to series and membership of our much-loved chat community, go to TheRestisHistory.com and join the club, that is TheRestisHistory.com. This episode is brought to you by US Bank. They don't just cheer you on, they help every move count. With US Bank's smartly checking and savings account to help you track your spending and grow your savings, your finances can go further. Because when you have the right partner on your side, there's no limit to what you can achieve. That's the power of us.

Looks pretty good. The entire transcription is 10,511 words long, and it cost $0.11, so the cost per word was $0.0000105, or about 0.001 cents per word. To put that in perspective, if you transcribed a million words (about a 4-day long podcast), it would cost you about $10.50. Still free with credits!

## What other models can I use for transcription?

Since Whisper was released, there’s been an explosion of new open-source ASR models. Some recent ones have garnered much excitement for exhibiting higher throughput, higher accuracy, and/or better real-time support than Whisper (e.g. [Kyutai STT](https://kyutai.org/next/stt), [NVIDIA Parakeet](https://developer.nvidia.com/blog/pushing-the-boundaries-of-speech-recognition-with-nemo-parakeet-asr-models/), [Mistral Voxtral](https://mistral.ai/news/voxtral)). Check out [our blog post](/blog/fast-cheap-batch-transcription) on how to get 100x faster and cheaper batch transcription using Parakeet + Modal compared to proprietary ASR providers.

Ready to build with Whisper or any other AI model? [Sign up for Modal](/signup) and get $30 in free credits. Whether you're running open-source models or your own custom models, Modal give you instant access to thousands of GPUs, from T4s to B200s. No waiting for quota, configuring Kubernetes, or wasting money on idle costs—just fluid GPU compute you can attach to your inference code.

<Cta primary large href="/signup" target="_blank">
  Deploy Whisper
</Cta>
`,meta:{description:`A step by step tutorial of hosting Whisper, OpenAI's open-source ASR model.`}},{title:g,description:_,date:v,length:y,category:b,subcategory:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=h,D=t(`<p>In the past few years, AI/ML models have gotten so good that you can transcribe any good audio (and even some bad stuff) for basically zero cost and in seconds. That’s what we’re going to do here, transcribing a podcast using a few lines of code, the OpenAI Whisper model, and an <!>.</p> <h2 id="what-is-the-whisper-ai-model">What is the Whisper AI Model?</h2> <p>The <!> is OpenAI’s open-source automatic speech recognition (also called speech-to-text) system that can transcribe audio in over 100 languages with incredible accuracy. Whisper is trained on 680,000 hours of multilingual data and available in multiple sizes from tiny (39M parameters) to large (1.5B parameters).</p> <p>At its core, Whisper uses a transformer-based encoder-decoder architecture. When you feed it audio, the model takes 30-second chunks and encodes the raw waveforms as spectrograms, which are visual maps of how sound frequencies change over time.</p> <p>The decoder generates text tokens one at a time. It uses attention mechanisms to figure out which parts of the audio matter for each word it’s writing. The whole system does a bunch of things at once:</p> <ul><li><strong>Language detection on the fly</strong>: feed it audio in French, Japanese, or English, and it figures it out</li> <li><strong>Timestamp alignment</strong>: it knows not just what was said, but when it was said</li> <li><strong>Multi-task training</strong>: translation, voice activity detection, and transcription all happen in the same pass</li></ul> <p>What makes Whisper so good at handling real-world audio is the sheer variety of stuff it was trained on. Podcasts, YouTube videos, audiobooks, and random conversations recorded in every possible acoustic condition. Got background noise? Heavy accent? Technical jargon? Whisper’s probably heard something similar before. The model even knows the difference between someone talking and background music or dead air, thanks to special tokens that mark non-speech events.</p> <h2 id="ways-to-deploy-whisper">Ways to deploy Whisper</h2> <p>Since Whisper is open-source, there are many ways to use it. The simplest is to use Whisper via a hosted endpoint—for example, through <!> directly or via a 3rd party like Amazon Bedrock. On the other end of the spectrum, you could self-host Whisper using EC2 or GCE. This would require that you manually handle scaling, GPU capacity, and other infrastructure concerns.</p> <p>In recent years, cloud platforms purpose-built for deploying AI models have become popular as well. Modal, for example, handles scaling and efficient allocation of GPU capacity while still giving developers full control of what model weights and inference logic they want to use. The rest of this tutorial shows you how to deploy Whisper on Modal.</p> <h2 id="how-to-deploy-whisper-in-minutes">How to deploy Whisper in minutes</h2> <p>Let’s transcribe. If you don’t have a Modal account, <!>. You get $30 of GPU credits every month, so following this tutorial will be entirely free.</p> <p>Then we’ll set up modal locally:</p> <!> <p>The above commands create a new project directory, set up a Python virtual environment to keep your dependencies clean, and install Modal (for GPU compute) and requests (for downloading audio files).</p> <p>Next, you’ll need to authenticate Modal on your machine:</p> <!> <p>This opens your browser to grab an API token. Once that’s done, you’re ready to write the actual transcription code.</p> <p>Here’s the full code we’ll use:</p> <!> <p>This is pretty brief for how powerful it is. Let’s walk through it.</p> <h3 id="setting-up-the-modal-app-and-container-image">Setting up the Modal app and container image</h3> <!> <p>First, we create a Modal app and define the container image that’ll run on the GPU. Modal handles all the infrastructure complexity, you just specify what packages you need. No config files necessary, as all your dependencies can be defined in-line with your application code. We’re using a slim Debian image with Python 3.12, and installing Whisper plus <!> (for audio processing). The <code>uv_pip_install</code> conveniently uses <!> under the hood for fast installs.</p> <h3 id="the-entry-point-that-runs-locally">The entry point that runs locally</h3> <!> <p>This function runs on your local machine, not the GPU. It downloads the audio file from whatever URL you provide, then ships the audio bytes to the GPU for transcription. The <code>.remote()</code> call is where the magic happens, sending your audio to Modal’s infrastructure and getting back the transcript. For a deployment in production, you can invoke the Modal function via HTTP, WebSocket, and more.</p> <h3 id="the-gpu-accelerated-transcription-class">The GPU-accelerated transcription class</h3> <!> <p>The <code>@app.cls</code> decorator tells Modal to run this class on an H100 GPU using our container image. The <code>@modal.enter()</code> method runs once when the container starts up, loading the Whisper model into memory. This happens before any transcription requests, so you’re not wasting time loading the model for each audio file.</p> <p>Notice we’re using the “base” model here. You can swap this for “tiny”, “small”, “medium”, “large”, or “large-v3” depending on your accuracy needs and speed requirements. Larger models are more accurate but slower.</p> <h3 id="the-actual-transcription-logic">The actual transcription logic</h3> <!> <p>This method takes the raw audio bytes and converts them into something Whisper can understand. Librosa loads the audio and resamples it to 16kHz (Whisper’s expected sample rate), then we pass it to the model for transcription. The model returns a dictionary with the text, timestamps, and other metadata, but we just grab the text here.</p> <p>To run this on your own podcast, save the code to <code>transcribe.py</code> and run:</p> <!> <p>The first run takes longer as Modal caches the container image for the first time, but after that, you’ll get transcriptions in seconds to minutes depending on the audio length and model size.</p> <h2 id="transcribing-a-podcast">Transcribing a podcast</h2> <p>Let’s do a real-life run through. We’ll choose The Rest is History podcast, and we can grab the raw MP3 audio file URL from <!>. We’ll choose the recent <!> episode.</p> <p>Here’s what we’ll run:</p> <!> <p>Because this is the first time we’ve created this image, we get about a minute of initial build. But then we’re into the actual model run, which takes 2m14s:</p> <p><!></p> <p>The podcast audio is 57m50s, so we are transcribing about 26 minutes of audio per minute of processing time.</p> <p>Here’s the start of the transcription:</p> <blockquote><p>Thank you for listening to The Rest is History. For weekly bonus episodes, add free listening, early access to series and membership of our much-loved chat community, go to TheRestisHistory.com and join the club, that is TheRestisHistory.com. This episode is brought to you by US Bank. They don’t just cheer you on, they help every move count. With US Bank’s smartly checking and savings account to help you track your spending and grow your savings, your finances can go further. Because when you have the right partner on your side, there’s no limit to what you can achieve. That’s the power of us.</p></blockquote> <p>Looks pretty good. The entire transcription is 10,511 words long, and it cost $0.11, so the cost per word was $0.0000105, or about 0.001 cents per word. To put that in perspective, if you transcribed a million words (about a 4-day long podcast), it would cost you about $10.50. Still free with credits!</p> <h2 id="what-other-models-can-i-use-for-transcription">What other models can I use for transcription?</h2> <p>Since Whisper was released, there’s been an explosion of new open-source ASR models. Some recent ones have garnered much excitement for exhibiting higher throughput, higher accuracy, and/or better real-time support than Whisper (e.g. <!>, <!>, <!>). Check out <!> on how to get 100x faster and cheaper batch transcription using Parakeet + Modal compared to proprietary ASR providers.</p> <p>Ready to build with Whisper or any other AI model? <!> and get $30 in free credits. Whether you’re running open-source models or your own custom models, Modal give you instant access to thousands of GPUs, from T4s to B200s. No waiting for quota, configuring Kubernetes, or wasting money on idle costs—just fluid GPU compute you can attach to your inference code.</p> <!>`,1);function O(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=D(),m=s(o);f(c(e(m)),{href:`/blog/introducing-h100`,children:(e,t)=>{l(),i(e,r(`H100 on Modal`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);f(c(e(h)),{href:`https://openai.com/index/whisper/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Whisper AI model`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,12);f(c(e(g)),{href:`https://openai.com/api/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenAI`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6);f(c(e(_)),{href:`/signup`,children:(e,t)=>{l(),i(e,r(`head here to sign up`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);d(v,{code:`mkdir%20whisper-tutorial%20%26%26%20cd%20whisper-tutorial%0Apython%20-m%20venv%20.env%0Asource%20.env%2Fbin%2Factivate%0Apip%20install%20modal%20requests`,lang:`bash`});var y=c(v,6);d(y,{code:`modal%20setup`,lang:`bash`});var b=c(y,6);d(b,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22whisper-transcribe-openai%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22openai-whisper%3D%3D20250625%22%2C%0A%20%20%20%20%22librosa%3D%3D0.11.0%22%2C%0A)%0A%0A%40app.local_entrypoint()%0Adef%20main(audio_url%3A%20str)%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20response%20%3D%20requests.get(audio_url)%0A%0A%20%20%20%20text%20%3D%20Transcribe().transcribe.remote(response.content)%0A%20%20%20%20print(f%22Transcription%3A%20%7Btext%7D%22)%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A)%0Aclass%20Transcribe%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20whisper%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20whisper.load_model(%22base%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20transcribe(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20audio_bytes%3A%20bytes%2C%0A%20%20%20%20)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20import%20io%0A%20%20%20%20%20%20%20%20import%20librosa%0A%0A%20%20%20%20%20%20%20%20audio_data%2C%20_%20%3D%20librosa.load(io.BytesIO(audio_bytes)%2C%20sr%3D16000)%0A%20%20%20%20%20%20%20%20transcription%20%3D%20self.model.transcribe(audio_data)%5B%22text%22%5D%0A%0A%20%20%20%20%20%20%20%20return%20transcription`,lang:`python`});var x=c(b,6);d(x,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22whisper-transcribe-openai%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22openai-whisper%3D%3D20250625%22%2C%0A%20%20%20%20%22librosa%3D%3D0.11.0%22%2C%0A)`,lang:`python`});var S=c(x,2),C=c(e(S));f(C,{href:`https://librosa.org/doc/latest/index.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`librosa`))},$$slots:{default:!0}}),f(c(C,4),{href:`https://docs.astral.sh/uv/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`uv`))},$$slots:{default:!0}}),l(),n(S);var w=c(S,4);d(w,{code:`%40app.local_entrypoint()%0Adef%20main(audio_url%3A%20str)%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20response%20%3D%20requests.get(audio_url)%0A%0A%20%20%20%20text%20%3D%20Transcribe().transcribe.remote(response.content)%0A%20%20%20%20print(f%22Transcription%3A%20%7Btext%7D%22)`,lang:`python`});var T=c(w,6);d(T,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A)%0Aclass%20Transcribe%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20whisper%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20whisper.load_model(%22base%22)`,lang:`python`});var E=c(T,8);d(E,{code:`%20%20%20%20%40modal.method()%0A%20%20%20%20def%20transcribe(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20audio_bytes%3A%20bytes%2C%0A%20%20%20%20)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20import%20io%0A%20%20%20%20%20%20%20%20import%20librosa%0A%0A%20%20%20%20%20%20%20%20audio_data%2C%20_%20%3D%20librosa.load(io.BytesIO(audio_bytes)%2C%20sr%3D16000)%0A%20%20%20%20%20%20%20%20transcription%20%3D%20self.model.transcribe(audio_data)%5B%22text%22%5D%0A%0A%20%20%20%20%20%20%20%20return%20transcription`,lang:`python`});var O=c(E,6);d(O,{code:`modal%20run%20transcribe.py%20--audio-url%20%22https%3A%2F%2Fexample.com%2Fyour-podcast.mp3%22`,lang:`bash`});var k=c(O,6),A=c(e(k));f(A,{href:`https://www.podchaser.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Podchaser`))},$$slots:{default:!0}}),f(c(A,2),{href:`https://www.podchaser.com/podcasts/the-rest-is-history-1544851/episodes/mad-victorian-sport-262800338`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mad victorian sport`))},$$slots:{default:!0}}),l(),n(k);var j=c(k,4);d(j,{code:`modal%20run%20transcribe.py%20--audio-url%20%22https%3A%2F%2Fpdst.fm%2Fe%2Fchrt.fm%2Ftrack%2FA27C8C%2Ftraffic.megaphone.fm%2FGLT6102181144.mp3%3Fupdated%3D1755269114%22`,lang:`bash`});var M=c(j,4);u(e(M),{src:`https://modal-cdn.com/blog/images/whisper-container-timeline.webp`,alt:`Whisper on Modal`}),n(M);var N=c(M,12),P=c(e(N));f(P,{href:`https://kyutai.org/next/stt`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kyutai STT`))},$$slots:{default:!0}});var F=c(P,2);f(F,{href:`https://developer.nvidia.com/blog/pushing-the-boundaries-of-speech-recognition-with-nemo-parakeet-asr-models/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA Parakeet`))},$$slots:{default:!0}});var I=c(F,2);f(I,{href:`https://mistral.ai/news/voxtral`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mistral Voxtral`))},$$slots:{default:!0}}),f(c(I,2),{href:`/blog/fast-cheap-batch-transcription`,children:(e,t)=>{l(),i(e,r(`our blog post`))},$$slots:{default:!0}}),l(),n(N);var L=c(N,2);f(c(e(L)),{href:`/signup`,children:(e,t)=>{l(),i(e,r(`Sign up for Modal`))},$$slots:{default:!0}}),l(),n(L),p(c(L,2),{primary:!0,large:!0,href:`/signup`,target:`_blank`,children:(e,t)=>{l(),i(e,r(`Deploy Whisper`))},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{O as default,h as metadata};
//# sourceMappingURL=Bu7qyZwN2.js.map
