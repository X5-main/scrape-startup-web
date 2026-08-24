(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`059fd065-ce23-4e5f-8a3a-f421e99af2b4`,e._sentryDebugIdIdentifier=`sentry-dbid-059fd065-ce23-4e5f-8a3a-f421e99af2b4`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Fast Whisper inference using dynamic batching`,id:`fast-whisper-inference-using-dynamic-batching`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Define a container image`,id:`define-a-container-image`},{depth:2,value:`Caching the model weights`,id:`caching-the-model-weights`},{depth:2,value:`The model class`,id:`the-model-class`},{depth:2,value:`Transcribe a dataset`,id:`transcribe-a-dataset`},{depth:2,value:`Run the model`,id:`run-the-model`}]}],rawContent:`# Fast Whisper inference using dynamic batching

In this example, we demonstrate how to run [dynamically batched inference](https://modal.com/docs/guide/dynamic-batching)
for OpenAI's speech recognition model, [Whisper](https://openai.com/index/whisper/), on Modal.
Batching multiple audio samples together or batching chunks of a single audio sample can help to achieve a 2.8x increase
in inference throughput on an A10G!

We will be running the [Whisper Large V3](https://huggingface.co/openai/whisper-large-v3) model.
To run [any of the other HuggingFace Whisper models](https://huggingface.co/models?search=openai/whisper),
simply replace the \`MODEL_NAME\` and \`MODEL_REVISION\` variables.

## Setup

Let's start by importing the Modal client and defining the model that we want to serve.

\`\`\`python
from typing import Optional

import modal

MODEL_DIR = "/model"
MODEL_NAME = "openai/whisper-large-v3"
MODEL_REVISION = "afda370583db9c5359511ed5d989400a6199dfe1"


\`\`\`

## Define a container image

We’ll start with Modal's baseline \`debian_slim\` image and install the relevant libraries.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install(
        "torch==2.5.1",
        "transformers==4.47.1",
        "huggingface-hub==0.36.0",
        "librosa==0.10.2",
        "soundfile==0.12.1",
        "accelerate==1.2.1",
        "datasets==3.2.0",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HUB_CACHE": MODEL_DIR})
)

model_cache = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)
app = modal.App(
    "example-batched-whisper",
    image=image,
    volumes={MODEL_DIR: model_cache},
)

\`\`\`

## Caching the model weights

We'll define a function to download the model and cache it in a volume.
You can \`modal run\` against this function prior to deploying the App.

\`\`\`python
@app.function()
def download_model():
    from huggingface_hub import snapshot_download
    from transformers.utils import move_cache

    snapshot_download(
        MODEL_NAME,
        ignore_patterns=["*.pt", "*.bin"],  # Using safetensors
        revision=MODEL_REVISION,
    )
    move_cache()


\`\`\`

## The model class

The inference function is best represented using Modal's [class syntax](https://modal.com/docs/guide/lifecycle-functions).

We define a \`@modal.enter\` method to load the model when the container starts, before it picks up any inputs.
The weights will be loaded from the Hugging Face cache volume so that we don't need to download them when
we start a new container. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

We also define a \`transcribe\` method that uses the \`@modal.batched\` decorator to enable dynamic batching.
This allows us to invoke the function with individual audio samples, and the function will automatically batch them
together before running inference. Batching is critical for making good use of the GPU, since GPUs are designed
for running parallel operations at high throughput.

The \`max_batch_size\` parameter limits the maximum number of audio samples combined into a single batch.
We used a \`max_batch_size\` of \`64\`, the largest power-of-2 batch size that can be accommodated by the 24 A10G GPU memory.
This number will vary depending on the model and the GPU you are using.

The \`wait_ms\` parameter sets the maximum time to wait for more inputs before running the batched transcription.
To tune this parameter, you can set it to the target latency of your application minus the execution time of an inference batch.
This allows the latency of any request to stay within your target latency.

\`\`\`python
@app.cls(
    gpu="a10g",  # Try using an A100 or H100 if you've got a large model or need big batches!
    max_containers=10,  # default max GPUs for Modal's free tier
)
class Model:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import (
            AutoModelForSpeechSeq2Seq,
            AutoProcessor,
            pipeline,
        )

        self.processor = AutoProcessor.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            use_safetensors=True,
        ).to("cuda")

        self.model.generation_config.language = "<|en|>"

        # Create a pipeline for preprocessing and transcribing speech data
        self.pipeline = pipeline(
            "automatic-speech-recognition",
            model=self.model,
            tokenizer=self.processor.tokenizer,
            feature_extractor=self.processor.feature_extractor,
            torch_dtype=torch.float16,
            device="cuda",
        )

    @modal.batched(max_batch_size=64, wait_ms=1000)
    def transcribe(self, audio_samples):
        import time

        start = time.monotonic_ns()
        print(f"Transcribing {len(audio_samples)} audio samples")
        transcriptions = self.pipeline(audio_samples, batch_size=len(audio_samples))
        end = time.monotonic_ns()
        print(
            f"Transcribed {len(audio_samples)} samples in {round((end - start) / 1e9, 2)}s"
        )
        return transcriptions


\`\`\`

## Transcribe a dataset

In this example, we use the [librispeech_asr_dummy dataset](https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy)
from Hugging Face's Datasets library to test the model.

We use [\`map.aio\`](https://modal.com/docs/reference/modal.Function#map) to asynchronously map over the audio files.
This allows us to invoke the batched transcription method on each audio sample in parallel.

\`\`\`python
@app.function()
async def transcribe_hf_dataset(dataset_name):
    from datasets import load_dataset

    print("📂 Loading dataset", dataset_name)
    ds = load_dataset(dataset_name, "clean", split="validation")
    print("📂 Dataset loaded")
    batched_whisper = Model()
    print("📣 Sending data for transcription")
    async for transcription in batched_whisper.transcribe.map.aio(ds["audio"]):
        yield transcription


\`\`\`

## Run the model

We define a [\`local_entrypoint\`](https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps)
to run the transcription. You can run this locally with \`modal run batched_whisper.py\`.

\`\`\`python
@app.local_entrypoint()
async def main(dataset_name: Optional[str] = None):
    if dataset_name is None:
        dataset_name = "hf-internal-testing/librispeech_asr_dummy"
    async for result in transcribe_hf_dataset.remote_gen.aio(dataset_name):
        print(result["text"])

\`\`\`
`,meta:{title:`Fast Whisper inference using dynamic batching`,description:`In this example, we demonstrate how to run dynamically batched inference for OpenAI’s speech recognition model, Whisper, on Modal. Batching multiple audio samples together or batching chunks of a single audio sample can help to achieve a 2.8x increase in inference throughput on an A10G!`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>map.aio</code>`),b=t(`<code>local_entrypoint</code>`),x=t(`<!> <p>In this example, we demonstrate how to run <!> for OpenAI’s speech recognition model, <!>, on Modal.
Batching multiple audio samples together or batching chunks of a single audio sample can help to achieve a 2.8x increase
in inference throughput on an A10G!</p> <p>We will be running the <!> model.
To run <!>,
simply replace the <code>MODEL_NAME</code> and <code>MODEL_REVISION</code> variables.</p> <!> <p>Let’s start by importing the Modal client and defining the model that we want to serve.</p> <!> <!> <p>We’ll start with Modal’s baseline <code>debian_slim</code> image and install the relevant libraries.</p> <!> <!> <p>We’ll define a function to download the model and cache it in a volume.
You can <code>modal run</code> against this function prior to deploying the App.</p> <!> <!> <p>The inference function is best represented using Modal’s <!>.</p> <p>We define a <code>@modal.enter</code> method to load the model when the container starts, before it picks up any inputs.
The weights will be loaded from the Hugging Face cache volume so that we don’t need to download them when
we start a new container. For more on storing model weights on Modal, see <!>.</p> <p>We also define a <code>transcribe</code> method that uses the <code>@modal.batched</code> decorator to enable dynamic batching.
This allows us to invoke the function with individual audio samples, and the function will automatically batch them
together before running inference. Batching is critical for making good use of the GPU, since GPUs are designed
for running parallel operations at high throughput.</p> <p>The <code>max_batch_size</code> parameter limits the maximum number of audio samples combined into a single batch.
We used a <code>max_batch_size</code> of <code>64</code>, the largest power-of-2 batch size that can be accommodated by the 24 A10G GPU memory.
This number will vary depending on the model and the GPU you are using.</p> <p>The <code>wait_ms</code> parameter sets the maximum time to wait for more inputs before running the batched transcription.
To tune this parameter, you can set it to the target latency of your application minus the execution time of an inference batch.
This allows the latency of any request to stay within your target latency.</p> <!> <!> <p>In this example, we use the <!> from Hugging Face’s Datasets library to test the model.</p> <p>We use <!> to asynchronously map over the audio files.
This allows us to invoke the batched transcription method on each audio sample in parallel.</p> <!> <!> <p>We define a <!> to run the transcription. You can run this locally with <code>modal run batched_whisper.py</code>.</p> <!>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`fast-whisper-inference-using-dynamic-batching`,children:(e,t)=>{l(),i(e,r(`Fast Whisper inference using dynamic batching`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://modal.com/docs/guide/dynamic-batching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`dynamically batched inference`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://openai.com/index/whisper/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Whisper`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2),v=c(e(_));m(v,{href:`https://huggingface.co/openai/whisper-large-v3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Whisper Large V3`))},$$slots:{default:!0}}),m(c(v,2),{href:`https://huggingface.co/models?search=openai/whisper`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`any of the other HuggingFace Whisper models`))},$$slots:{default:!0}}),l(5),n(_);var S=c(_,2);u(S,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var C=c(S,4);f(C,{code:`from%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0AMODEL_DIR%20%3D%20%22%2Fmodel%22%0AMODEL_NAME%20%3D%20%22openai%2Fwhisper-large-v3%22%0AMODEL_REVISION%20%3D%20%22afda370583db9c5359511ed5d989400a6199dfe1%22%0A%0A`,lang:`python`});var w=c(C,2);u(w,{id:`define-a-container-image`,children:(e,t)=>{l(),i(e,r(`Define a container image`))},$$slots:{default:!0}});var T=c(w,4);f(T,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.47.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22librosa%3D%3D0.10.2%22%2C%0A%20%20%20%20%20%20%20%20%22soundfile%3D%3D0.12.1%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.2.1%22%2C%0A%20%20%20%20%20%20%20%20%22datasets%3D%3D3.2.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HUB_CACHE%22%3A%20MODEL_DIR%7D)%0A)%0A%0Amodel_cache%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-batched-whisper%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7BMODEL_DIR%3A%20model_cache%7D%2C%0A)%0A`,lang:`python`});var E=c(T,2);u(E,{id:`caching-the-model-weights`,children:(e,t)=>{l(),i(e,r(`Caching the model weights`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`%40app.function()%0Adef%20download_model()%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%20%20%20%20from%20transformers.utils%20import%20move_cache%0A%0A%20%20%20%20snapshot_download(%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20ignore_patterns%3D%5B%22*.pt%22%2C%20%22*.bin%22%5D%2C%20%20%23%20Using%20safetensors%0A%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20)%0A%20%20%20%20move_cache()%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`the-model-class`,children:(e,t)=>{l(),i(e,r(`The model class`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`class syntax`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);m(c(e(A),3),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,8);f(j,{code:`%40app.cls(%0A%20%20%20%20gpu%3D%22a10g%22%2C%20%20%23%20Try%20using%20an%20A100%20or%20H100%20if%20you've%20got%20a%20large%20model%20or%20need%20big%20batches!%0A%20%20%20%20max_containers%3D10%2C%20%20%23%20default%20max%20GPUs%20for%20Modal's%20free%20tier%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20transformers%20import%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20AutoModelForSpeechSeq2Seq%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20AutoProcessor%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20pipeline%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.processor%20%3D%20AutoProcessor.from_pretrained(MODEL_NAME)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20AutoModelForSpeechSeq2Seq.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.float16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20low_cpu_mem_usage%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_safetensors%3DTrue%2C%0A%20%20%20%20%20%20%20%20).to(%22cuda%22)%0A%0A%20%20%20%20%20%20%20%20self.model.generation_config.language%20%3D%20%22%3C%7Cen%7C%3E%22%0A%0A%20%20%20%20%20%20%20%20%23%20Create%20a%20pipeline%20for%20preprocessing%20and%20transcribing%20speech%20data%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22automatic-speech-recognition%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dself.model%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenizer%3Dself.processor.tokenizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20feature_extractor%3Dself.processor.feature_extractor%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.float16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3D%22cuda%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.batched(max_batch_size%3D64%2C%20wait_ms%3D1000)%0A%20%20%20%20def%20transcribe(self%2C%20audio_samples)%3A%0A%20%20%20%20%20%20%20%20import%20time%0A%0A%20%20%20%20%20%20%20%20start%20%3D%20time.monotonic_ns()%0A%20%20%20%20%20%20%20%20print(f%22Transcribing%20%7Blen(audio_samples)%7D%20audio%20samples%22)%0A%20%20%20%20%20%20%20%20transcriptions%20%3D%20self.pipeline(audio_samples%2C%20batch_size%3Dlen(audio_samples))%0A%20%20%20%20%20%20%20%20end%20%3D%20time.monotonic_ns()%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Transcribed%20%7Blen(audio_samples)%7D%20samples%20in%20%7Bround((end%20-%20start)%20%2F%201e9%2C%202)%7Ds%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20transcriptions%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`transcribe-a-dataset`,children:(e,t)=>{l(),i(e,r(`Transcribe a dataset`))},$$slots:{default:!0}});var N=c(M,2);m(c(e(N)),{href:`https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`librispeech_asr_dummy dataset`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);m(c(e(P)),{href:`https://modal.com/docs/reference/modal.Function#map`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);f(F,{code:`%40app.function()%0Aasync%20def%20transcribe_hf_dataset(dataset_name)%3A%0A%20%20%20%20from%20datasets%20import%20load_dataset%0A%0A%20%20%20%20print(%22%F0%9F%93%82%20Loading%20dataset%22%2C%20dataset_name)%0A%20%20%20%20ds%20%3D%20load_dataset(dataset_name%2C%20%22clean%22%2C%20split%3D%22validation%22)%0A%20%20%20%20print(%22%F0%9F%93%82%20Dataset%20loaded%22)%0A%20%20%20%20batched_whisper%20%3D%20Model()%0A%20%20%20%20print(%22%F0%9F%93%A3%20Sending%20data%20for%20transcription%22)%0A%20%20%20%20async%20for%20transcription%20in%20batched_whisper.transcribe.map.aio(ds%5B%22audio%22%5D)%3A%0A%20%20%20%20%20%20%20%20yield%20transcription%0A%0A`,lang:`python`});var I=c(F,2);u(I,{id:`run-the-model`,children:(e,t)=>{l(),i(e,r(`Run the model`))},$$slots:{default:!0}});var L=c(I,2);m(c(e(L)),{href:`https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(3),n(L),f(c(L,2),{code:`%40app.local_entrypoint()%0Aasync%20def%20main(dataset_name%3A%20Optional%5Bstr%5D%20%3D%20None)%3A%0A%20%20%20%20if%20dataset_name%20is%20None%3A%0A%20%20%20%20%20%20%20%20dataset_name%20%3D%20%22hf-internal-testing%2Flibrispeech_asr_dummy%22%0A%20%20%20%20async%20for%20result%20in%20transcribe_hf_dataset.remote_gen.aio(dataset_name)%3A%0A%20%20%20%20%20%20%20%20print(result%5B%22text%22%5D)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=DLMinEkK.js.map
