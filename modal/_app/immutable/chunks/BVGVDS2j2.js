(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`aed825ee-2807-4251-8036-c268e169a5ea`,e._sentryDebugIdIdentifier=`sentry-dbid-aed825ee-2807-4251-8036-c268e169a5ea`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Make music with ACE-Step 1.5`,id:`make-music-with-ace-step-15`,children:[{depth:2,value:`Setting up dependencies`,id:`setting-up-dependencies`},{depth:2,value:`Running music generation on Modal`,id:`running-music-generation-on-modal`},{depth:2,value:`Hosting a web UI for the music generator`,id:`hosting-a-web-ui-for-the-music-generator`}]}],rawContent:`# Make music with ACE-Step 1.5

In this example, we show you how you can run [ACE Studio](https://acestudio.ai/)'s
[ACE-Step 1.5](https://github.com/ace-step/ACE-Step-1.5) music generation model
on Modal.

ACE-Step 1.5 introduces a multi-model architecture:
a DiT (Diffusion Transformer) handler for audio generation
and an LM (Language Model) handler for prompt augmentation.
The LM automatically enhances prompts, detects language,
and generates metadata like BPM and key.

We'll set up both a serverless music generation service
and a web user interface.

## Setting up dependencies

\`\`\`python
from pathlib import Path
from typing import Optional
from uuid import uuid4

import modal

\`\`\`

We start by defining the environment our generation runs in.
This takes some explaining since, like most cutting-edge ML environments, it is a bit fiddly.

This environment is captured by a
[container image](https://modal.com/docs/guide/images),
which we build step-by-step by calling methods to add dependencies,
like \`apt_install\` to add system packages and \`uv_pip_install\` to add
Python packages.

ACE-Step 1.5 uses a local path dependency (\`nano-vllm\`) in its
package configuration, so we clone the repo first and install from
the local directory. This lets \`uv\` resolve all dependencies together,
including the CUDA-enabled PyTorch build and the local \`nano-vllm\` package.

\`\`\`python
image = (
    modal.Image.from_registry(
        "nvidia/cuda:13.0.0-cudnn-devel-ubuntu22.04", add_python="3.12"
    )
    .apt_install("git", "ffmpeg")
    .run_commands(
        "git clone --branch v0.1.6 --depth 1 https://github.com/ace-step/ACE-Step-1.5.git /opt/ace-step",
    )
    .uv_pip_install(
        "/opt/ace-step", "hf_transfer==0.1.9", "torchcodec==0.10.0", "torch~=2.10.0"
    )
    .entrypoint([])
)

\`\`\`

In addition to source code, we'll also need the model weights.

ACE-Step 1.5 integrates with the Hugging Face ecosystem, so setting up the models
is straightforward. The model handlers use Hugging Face
to download the weights if not already present.

We use a single \`checkpoints/\` directory for all model downloads
(both the DiT and LM models) and persist it with a Modal
[Volume](https://modal.com/docs/guide/volumes).
For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
checkpoints_dir = "/opt/ace-step/checkpoints"
model_cache = modal.Volume.from_name("ACE-Step-v15-model-cache", create_if_missing=True)

\`\`\`

We set the \`ACESTEP_PROJECT_ROOT\` environment variable so that
the model handlers know where to find the checkpoints directory.

\`\`\`python
image = image.env(
    {"ACESTEP_PROJECT_ROOT": "/opt/ace-step", "HF_HUB_ENABLE_HF_TRANSFER": "1"}
)

\`\`\`

While we're at it, let's also define the environment for our UI.
We'll stick with Python and so use FastAPI and Gradio.

\`\`\`python
web_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi[standard]==0.115.4",
    "gradio==6.11.0",
    "huggingface-hub==1.9.1",
    "pydantic==2.10.1",
)

\`\`\`

This is a totally different environment from the one we run our model in.
Say goodbye to Python dependency conflict hell!

## Running music generation on Modal

Now, we write our music generation logic.

- We make an [App](https://modal.com/docs/guide/apps) to organize our deployment.
- We load the model at start, instead of during inference, with \`modal.enter\`,
which requires that we use a Modal [\`Cls\`](https://modal.com/docs/guide/lifecycle-functions).
- In the \`app.cls\` decorator, we specify the Image we built and attach the Volume.
We also pick a GPU to run on -- here, an NVIDIA L40S.

\`\`\`python
app = modal.App("example-generate-music")


@app.cls(gpu="l40s", image=image, volumes={checkpoints_dir: model_cache})
class MusicGenerator:
    @modal.enter()
    def init(self):
        from acestep.handler import AceStepHandler
        from acestep.llm_inference import LLMHandler
        from acestep.model_downloader import ensure_lm_model, ensure_main_model

        # Download models if not already cached in the Volume.
        lm_model_name = "acestep-5Hz-lm-4B"
        ensure_main_model(checkpoints_dir=checkpoints_dir)
        ensure_lm_model(model_name=lm_model_name, checkpoints_dir=checkpoints_dir)

        # Initialize the audio generation model.
        self.dit_handler = AceStepHandler()
        init_status, enable_generate = self.dit_handler.initialize_service(
            project_root="/opt/ace-step",
            config_path="acestep-v15-turbo",
            device="cuda",
        )
        if not enable_generate:
            raise RuntimeError(f"DiT model initialization failed: {init_status}")

        # Initialize the language model for prompt enhancement.
        self.llm_handler = LLMHandler()
        lm_status, lm_success = self.llm_handler.initialize(
            checkpoint_dir=checkpoints_dir,
            lm_model_path=lm_model_name,
            backend="vllm",
            device="cuda",
        )
        if not lm_success:
            raise RuntimeError(f"LM initialization failed: {lm_status}")

    @modal.method()
    def run(
        self,
        prompt: str,
        lyrics: str,
        duration: float = 60.0,
        format: str = "mp3",  # or wav
        manual_seeds: Optional[int] = 1,
    ) -> bytes:
        from acestep.inference import GenerationConfig, GenerationParams, generate_music

        params = GenerationParams(
            caption=prompt,
            lyrics=lyrics,
            duration=duration,
            thinking=True,
        )
        config = GenerationConfig(
            audio_format=format,
            batch_size=1,
            seeds=[manual_seeds] if manual_seeds is not None else None,
            use_random_seed=manual_seeds is None,
        )
        result = generate_music(
            self.dit_handler,
            self.llm_handler,
            params,
            config,
            save_dir="/dev/shm",
        )
        if not result.success:
            raise RuntimeError(f"Music generation failed: {result.error}")
        return Path(result.audios[0]["path"]).read_bytes()


\`\`\`

We can then generate music from anywhere by running code like what we have in the \`local_entrypoint\` below.

\`\`\`python
@app.local_entrypoint()
def main(
    prompt: Optional[str] = None,
    lyrics: Optional[str] = None,
    duration: Optional[float] = None,
    format: str = "mp3",  # or wav
    manual_seeds: Optional[int] = 1,
):
    if lyrics is None:
        lyrics = "[Instrumental]"
    if prompt is None:
        prompt = "Korean pop music, bright energetic electronic music, catchy melody, female vocals"
        lyrics = """[intro][intro]
            [chorus]
            We're goin' up, up, up, it's our moment
            You know together we're glowing
            Gonna be, gonna be golden
            Oh, up, up, up with our voices
            영원히 깨질 수 없는
            Gonna be, gonna be golden"""
    if duration is None:
        duration = 30.0  # seconds
    print(
        f"🎼 generating {duration} seconds of music from prompt '{prompt[:32] + ('...' if len(prompt) > 32 else '')}'"
        f" and lyrics '{lyrics[:32] + ('...' if len(lyrics) > 32 else '')}'"
    )

    music_generator = MusicGenerator()  # outside of this file, use modal.Cls.from_name
    clip = music_generator.run.remote(
        prompt, lyrics, duration=duration, format=format, manual_seeds=manual_seeds
    )

    dir = Path("/tmp/generate-music")
    dir.mkdir(exist_ok=True, parents=True)

    output_path = dir / f"{slugify(prompt)[:64]}.{format}"
    print(f"🎼 Saving to {output_path}")
    output_path.write_bytes(clip)


def slugify(string):
    return (
        string.lower()
        .replace(" ", "-")
        .replace("/", "-")
        .replace("\\\\", "-")
        .replace(":", "-")
    )


\`\`\`

You can execute it with a command like:

\`\`\` shell
modal run generate_music.py
\`\`\`

Pass in \`--help\` to see options and how to use them.

## Hosting a web UI for the music generator

With the Gradio library, we can create a simple web UI in Python
that calls out to our music generator,
then host it on Modal for anyone to try out.

To deploy both the music generator and the UI, run

\`\`\` shell
modal deploy generate_music.py
\`\`\`

\`\`\`python
@app.function(
    image=web_image,
    # Gradio requires sticky sessions
    # so we limit the number of concurrent containers to 1
    # and allow it to scale to 100 concurrent inputs
    max_containers=1,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import gradio as gr
    from fastapi import FastAPI
    from gradio.routes import mount_gradio_app

    api = FastAPI()

    # Since this Gradio app is running from its own container,
    # we make a \`.remote\` call to the music generator
    music_generator = MusicGenerator()
    generate = music_generator.run.remote

    temp_dir = Path("/dev/shm")

    async def generate_music(
        prompt: str, lyrics: str, duration: float = 30.0, format: str = "mp3"
    ):
        audio_bytes = await generate.aio(
            prompt, lyrics, duration=duration, format=format
        )

        audio_path = temp_dir / f"{uuid4()}.{format}"
        audio_path.write_bytes(audio_bytes)

        return audio_path

    with gr.Blocks(theme="soft") as demo:
        gr.Markdown("# Generate Music")
        with gr.Row():
            with gr.Column():
                prompt = gr.Textbox(label="Prompt")
                lyrics = gr.Textbox(label="Lyrics")
                duration = gr.Number(
                    label="Duration (seconds)", value=10.0, minimum=1.0, maximum=300.0
                )
                format = gr.Radio(["wav", "mp3"], label="Format", value="mp3")
                btn = gr.Button("Generate")
            with gr.Column():
                clip_output = gr.Audio(label="Generated Music", autoplay=True)

        btn.click(
            generate_music,
            inputs=[prompt, lyrics, duration, format],
            outputs=[clip_output],
        )

    return mount_gradio_app(app=api, blocks=demo, path="/")

\`\`\`
`,meta:{title:`Make music with ACE-Step 1.5`,description:`In this example, we show you how you can run ACE Studio’s ACE-Step 1.5 music generation model on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Cls</code>`),b=t(`<!> <p>In this example, we show you how you can run <!>’s <!> music generation model
on Modal.</p> <p>ACE-Step 1.5 introduces a multi-model architecture:
a DiT (Diffusion Transformer) handler for audio generation
and an LM (Language Model) handler for prompt augmentation.
The LM automatically enhances prompts, detects language,
and generates metadata like BPM and key.</p> <p>We’ll set up both a serverless music generation service
and a web user interface.</p> <!> <!> <p>We start by defining the environment our generation runs in.
This takes some explaining since, like most cutting-edge ML environments, it is a bit fiddly.</p> <p>This environment is captured by a <!>,
which we build step-by-step by calling methods to add dependencies,
like <code>apt_install</code> to add system packages and <code>uv_pip_install</code> to add
Python packages.</p> <p>ACE-Step 1.5 uses a local path dependency (<code>nano-vllm</code>) in its
package configuration, so we clone the repo first and install from
the local directory. This lets <code>uv</code> resolve all dependencies together,
including the CUDA-enabled PyTorch build and the local <code>nano-vllm</code> package.</p> <!> <p>In addition to source code, we’ll also need the model weights.</p> <p>ACE-Step 1.5 integrates with the Hugging Face ecosystem, so setting up the models
is straightforward. The model handlers use Hugging Face
to download the weights if not already present.</p> <p>We use a single <code>checkpoints/</code> directory for all model downloads
(both the DiT and LM models) and persist it with a Modal <!>.
For more on storing model weights on Modal, see <!>.</p> <!> <p>We set the <code>ACESTEP_PROJECT_ROOT</code> environment variable so that
the model handlers know where to find the checkpoints directory.</p> <!> <p>While we’re at it, let’s also define the environment for our UI.
We’ll stick with Python and so use FastAPI and Gradio.</p> <!> <p>This is a totally different environment from the one we run our model in.
Say goodbye to Python dependency conflict hell!</p> <!> <p>Now, we write our music generation logic.</p> <ul><li>We make an <!> to organize our deployment.</li> <li>We load the model at start, instead of during inference, with <code>modal.enter</code>,
which requires that we use a Modal <!>.</li> <li>In the <code>app.cls</code> decorator, we specify the Image we built and attach the Volume.
We also pick a GPU to run on — here, an NVIDIA L40S.</li></ul> <!> <p>We can then generate music from anywhere by running code like what we have in the <code>local_entrypoint</code> below.</p> <!> <p>You can execute it with a command like:</p> <!> <p>Pass in <code>--help</code> to see options and how to use them.</p> <!> <p>With the Gradio library, we can create a simple web UI in Python
that calls out to our music generator,
then host it on Modal for anyone to try out.</p> <p>To deploy both the music generator and the UI, run</p> <!> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`make-music-with-ace-step-15`,children:(e,t)=>{l(),i(e,r(`Make music with ACE-Step 1.5`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://acestudio.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ACE Studio`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://github.com/ace-step/ACE-Step-1.5`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ACE-Step 1.5`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,6);u(_,{id:`setting-up-dependencies`,children:(e,t)=>{l(),i(e,r(`Setting up dependencies`))},$$slots:{default:!0}});var v=c(_,2);f(v,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0Afrom%20uuid%20import%20uuid4%0A%0Aimport%20modal%0A`,lang:`python`});var x=c(v,4);m(c(e(x)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),l(5),n(x);var S=c(x,4);f(S,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A13.0.0-cudnn-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22git%20clone%20--branch%20v0.1.6%20--depth%201%20https%3A%2F%2Fgithub.com%2Face-step%2FACE-Step-1.5.git%20%2Fopt%2Face-step%22%2C%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22%2Fopt%2Face-step%22%2C%20%22hf_transfer%3D%3D0.1.9%22%2C%20%22torchcodec%3D%3D0.10.0%22%2C%20%22torch~%3D2.10.0%22%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A)%0A`,lang:`python`});var C=c(S,6),w=c(e(C),3);m(w,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),m(c(w,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,2);f(T,{code:`checkpoints_dir%20%3D%20%22%2Fopt%2Face-step%2Fcheckpoints%22%0Amodel_cache%20%3D%20modal.Volume.from_name(%22ACE-Step-v15-model-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var E=c(T,4);f(E,{code:`image%20%3D%20image.env(%0A%20%20%20%20%7B%22ACESTEP_PROJECT_ROOT%22%3A%20%22%2Fopt%2Face-step%22%2C%20%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D%0A)%0A`,lang:`python`});var D=c(E,4);f(D,{code:`web_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22gradio%3D%3D6.11.0%22%2C%0A%20%20%20%20%22huggingface-hub%3D%3D1.9.1%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.10.1%22%2C%0A)%0A`,lang:`python`});var O=c(D,4);u(O,{id:`running-music-generation-on-modal`,children:(e,t)=>{l(),i(e,r(`Running music generation on Modal`))},$$slots:{default:!0}});var k=c(O,4),A=e(k);m(c(e(A)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);m(c(e(j),3),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(j),l(2),n(k);var M=c(k,2);f(M,{code:`app%20%3D%20modal.App(%22example-generate-music%22)%0A%0A%0A%40app.cls(gpu%3D%22l40s%22%2C%20image%3Dimage%2C%20volumes%3D%7Bcheckpoints_dir%3A%20model_cache%7D)%0Aclass%20MusicGenerator%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20init(self)%3A%0A%20%20%20%20%20%20%20%20from%20acestep.handler%20import%20AceStepHandler%0A%20%20%20%20%20%20%20%20from%20acestep.llm_inference%20import%20LLMHandler%0A%20%20%20%20%20%20%20%20from%20acestep.model_downloader%20import%20ensure_lm_model%2C%20ensure_main_model%0A%0A%20%20%20%20%20%20%20%20%23%20Download%20models%20if%20not%20already%20cached%20in%20the%20Volume.%0A%20%20%20%20%20%20%20%20lm_model_name%20%3D%20%22acestep-5Hz-lm-4B%22%0A%20%20%20%20%20%20%20%20ensure_main_model(checkpoints_dir%3Dcheckpoints_dir)%0A%20%20%20%20%20%20%20%20ensure_lm_model(model_name%3Dlm_model_name%2C%20checkpoints_dir%3Dcheckpoints_dir)%0A%0A%20%20%20%20%20%20%20%20%23%20Initialize%20the%20audio%20generation%20model.%0A%20%20%20%20%20%20%20%20self.dit_handler%20%3D%20AceStepHandler()%0A%20%20%20%20%20%20%20%20init_status%2C%20enable_generate%20%3D%20self.dit_handler.initialize_service(%0A%20%20%20%20%20%20%20%20%20%20%20%20project_root%3D%22%2Fopt%2Face-step%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20config_path%3D%22acestep-v15-turbo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3D%22cuda%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20not%20enable_generate%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22DiT%20model%20initialization%20failed%3A%20%7Binit_status%7D%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Initialize%20the%20language%20model%20for%20prompt%20enhancement.%0A%20%20%20%20%20%20%20%20self.llm_handler%20%3D%20LLMHandler()%0A%20%20%20%20%20%20%20%20lm_status%2C%20lm_success%20%3D%20self.llm_handler.initialize(%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint_dir%3Dcheckpoints_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20lm_model_path%3Dlm_model_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20backend%3D%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3D%22cuda%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20not%20lm_success%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22LM%20initialization%20failed%3A%20%7Blm_status%7D%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20prompt%3A%20str%2C%0A%20%20%20%20%20%20%20%20lyrics%3A%20str%2C%0A%20%20%20%20%20%20%20%20duration%3A%20float%20%3D%2060.0%2C%0A%20%20%20%20%20%20%20%20format%3A%20str%20%3D%20%22mp3%22%2C%20%20%23%20or%20wav%0A%20%20%20%20%20%20%20%20manual_seeds%3A%20Optional%5Bint%5D%20%3D%201%2C%0A%20%20%20%20)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20from%20acestep.inference%20import%20GenerationConfig%2C%20GenerationParams%2C%20generate_music%0A%0A%20%20%20%20%20%20%20%20params%20%3D%20GenerationParams(%0A%20%20%20%20%20%20%20%20%20%20%20%20caption%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20lyrics%3Dlyrics%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20duration%3Dduration%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20thinking%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20config%20%3D%20GenerationConfig(%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_format%3Dformat%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_size%3D1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20seeds%3D%5Bmanual_seeds%5D%20if%20manual_seeds%20is%20not%20None%20else%20None%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_random_seed%3Dmanual_seeds%20is%20None%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20result%20%3D%20generate_music(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.dit_handler%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20self.llm_handler%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20params%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20config%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20save_dir%3D%22%2Fdev%2Fshm%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20not%20result.success%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Music%20generation%20failed%3A%20%7Bresult.error%7D%22)%0A%20%20%20%20%20%20%20%20return%20Path(result.audios%5B0%5D%5B%22path%22%5D).read_bytes()%0A%0A`,lang:`python`});var N=c(M,4);f(N,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20lyrics%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20duration%3A%20Optional%5Bfloat%5D%20%3D%20None%2C%0A%20%20%20%20format%3A%20str%20%3D%20%22mp3%22%2C%20%20%23%20or%20wav%0A%20%20%20%20manual_seeds%3A%20Optional%5Bint%5D%20%3D%201%2C%0A)%3A%0A%20%20%20%20if%20lyrics%20is%20None%3A%0A%20%20%20%20%20%20%20%20lyrics%20%3D%20%22%5BInstrumental%5D%22%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22Korean%20pop%20music%2C%20bright%20energetic%20electronic%20music%2C%20catchy%20melody%2C%20female%20vocals%22%0A%20%20%20%20%20%20%20%20lyrics%20%3D%20%22%22%22%5Bintro%5D%5Bintro%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%5Bchorus%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20We're%20goin'%20up%2C%20up%2C%20up%2C%20it's%20our%20moment%0A%20%20%20%20%20%20%20%20%20%20%20%20You%20know%20together%20we're%20glowing%0A%20%20%20%20%20%20%20%20%20%20%20%20Gonna%20be%2C%20gonna%20be%20golden%0A%20%20%20%20%20%20%20%20%20%20%20%20Oh%2C%20up%2C%20up%2C%20up%20with%20our%20voices%0A%20%20%20%20%20%20%20%20%20%20%20%20%EC%98%81%EC%9B%90%ED%9E%88%20%EA%B9%A8%EC%A7%88%20%EC%88%98%20%EC%97%86%EB%8A%94%0A%20%20%20%20%20%20%20%20%20%20%20%20Gonna%20be%2C%20gonna%20be%20golden%22%22%22%0A%20%20%20%20if%20duration%20is%20None%3A%0A%20%20%20%20%20%20%20%20duration%20%3D%2030.0%20%20%23%20seconds%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%F0%9F%8E%BC%20generating%20%7Bduration%7D%20seconds%20of%20music%20from%20prompt%20'%7Bprompt%5B%3A32%5D%20%2B%20('...'%20if%20len(prompt)%20%3E%2032%20else%20'')%7D'%22%0A%20%20%20%20%20%20%20%20f%22%20and%20lyrics%20'%7Blyrics%5B%3A32%5D%20%2B%20('...'%20if%20len(lyrics)%20%3E%2032%20else%20'')%7D'%22%0A%20%20%20%20)%0A%0A%20%20%20%20music_generator%20%3D%20MusicGenerator()%20%20%23%20outside%20of%20this%20file%2C%20use%20modal.Cls.from_name%0A%20%20%20%20clip%20%3D%20music_generator.run.remote(%0A%20%20%20%20%20%20%20%20prompt%2C%20lyrics%2C%20duration%3Dduration%2C%20format%3Dformat%2C%20manual_seeds%3Dmanual_seeds%0A%20%20%20%20)%0A%0A%20%20%20%20dir%20%3D%20Path(%22%2Ftmp%2Fgenerate-music%22)%0A%20%20%20%20dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20output_path%20%3D%20dir%20%2F%20f%22%7Bslugify(prompt)%5B%3A64%5D%7D.%7Bformat%7D%22%0A%20%20%20%20print(f%22%F0%9F%8E%BC%20Saving%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_bytes(clip)%0A%0A%0Adef%20slugify(string)%3A%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20string.lower()%0A%20%20%20%20%20%20%20%20.replace(%22%20%22%2C%20%22-%22)%0A%20%20%20%20%20%20%20%20.replace(%22%2F%22%2C%20%22-%22)%0A%20%20%20%20%20%20%20%20.replace(%22%5C%5C%22%2C%20%22-%22)%0A%20%20%20%20%20%20%20%20.replace(%22%3A%22%2C%20%22-%22)%0A%20%20%20%20)%0A%0A`,lang:`python`});var P=c(N,4);f(P,{code:`modal%20run%20generate_music.py`,lang:`shell`});var F=c(P,4);u(F,{id:`hosting-a-web-ui-for-the-music-generator`,children:(e,t)=>{l(),i(e,r(`Hosting a web UI for the music generator`))},$$slots:{default:!0}});var I=c(F,6);f(I,{code:`modal%20deploy%20generate_music.py`,lang:`shell`}),f(c(I,2),{code:`%40app.function(%0A%20%20%20%20image%3Dweb_image%2C%0A%20%20%20%20%23%20Gradio%20requires%20sticky%20sessions%0A%20%20%20%20%23%20so%20we%20limit%20the%20number%20of%20concurrent%20containers%20to%201%0A%20%20%20%20%23%20and%20allow%20it%20to%20scale%20to%20100%20concurrent%20inputs%0A%20%20%20%20max_containers%3D1%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20api%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20Since%20this%20Gradio%20app%20is%20running%20from%20its%20own%20container%2C%0A%20%20%20%20%23%20we%20make%20a%20%60.remote%60%20call%20to%20the%20music%20generator%0A%20%20%20%20music_generator%20%3D%20MusicGenerator()%0A%20%20%20%20generate%20%3D%20music_generator.run.remote%0A%0A%20%20%20%20temp_dir%20%3D%20Path(%22%2Fdev%2Fshm%22)%0A%0A%20%20%20%20async%20def%20generate_music(%0A%20%20%20%20%20%20%20%20prompt%3A%20str%2C%20lyrics%3A%20str%2C%20duration%3A%20float%20%3D%2030.0%2C%20format%3A%20str%20%3D%20%22mp3%22%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20audio_bytes%20%3D%20await%20generate.aio(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%20lyrics%2C%20duration%3Dduration%2C%20format%3Dformat%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20audio_path%20%3D%20temp_dir%20%2F%20f%22%7Buuid4()%7D.%7Bformat%7D%22%0A%20%20%20%20%20%20%20%20audio_path.write_bytes(audio_bytes)%0A%0A%20%20%20%20%20%20%20%20return%20audio_path%0A%0A%20%20%20%20with%20gr.Blocks(theme%3D%22soft%22)%20as%20demo%3A%0A%20%20%20%20%20%20%20%20gr.Markdown(%22%23%20Generate%20Music%22)%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20prompt%20%3D%20gr.Textbox(label%3D%22Prompt%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lyrics%20%3D%20gr.Textbox(label%3D%22Lyrics%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20duration%20%3D%20gr.Number(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22Duration%20(seconds)%22%2C%20value%3D10.0%2C%20minimum%3D1.0%2C%20maximum%3D300.0%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20format%20%3D%20gr.Radio(%5B%22wav%22%2C%20%22mp3%22%5D%2C%20label%3D%22Format%22%2C%20value%3D%22mp3%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(%22Generate%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clip_output%20%3D%20gr.Audio(label%3D%22Generated%20Music%22%2C%20autoplay%3DTrue)%0A%0A%20%20%20%20%20%20%20%20btn.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20generate_music%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20inputs%3D%5Bprompt%2C%20lyrics%2C%20duration%2C%20format%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20outputs%3D%5Bclip_output%5D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20mount_gradio_app(app%3Dapi%2C%20blocks%3Ddemo%2C%20path%3D%22%2F%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=BVGVDS2j2.js.map
