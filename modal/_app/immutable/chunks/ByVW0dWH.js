(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1c66116c-9a55-44ba-9ec3-74c4ddde5ccc`,e._sentryDebugIdIdentifier=`sentry-dbid-1c66116c-9a55-44ba-9ec3-74c4ddde5ccc`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`High-quality text-to-video with LTX-2`,id:`high-quality-text-to-video-with-ltx-2`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Environment setup`,id:`environment-setup`},{depth:2,value:`Volumes`,id:`volumes`},{depth:2,value:`Inference`,id:`inference`}]}],rawContent:`# High-quality text-to-video with LTX-2

[LTX-2](https://github.com/Lightricks/LTX-2) is a 19B-parameter diffusion model
that generates video with synchronized audio from a text prompt.
This example runs LTX-2's two-stage production-grade pipeline on Modal: stage 1
generates video at half resolution, then stage 2 upscales by 2x and refines with
a distilled LoRA. Output is a 1024x1536 MP4 with audio.

## Setup

The text encoder uses Gemma 3 weights that require accepting a license.
Visit https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized,
click "Agree and access repository", then create a token at
https://huggingface.co/settings/tokens and add it as a
[Modal Secret](https://modal.com/secrets) named \`huggingface-secret\`
with key \`HF_TOKEN\`.

Generate a video with:
\`\`\`bash
modal run ltx2_two_stage.py --prompt "A cathedral made of ice, northern lights overhead"
\`\`\`

Retrieve the output from the Modal Volume:
\`\`\`bash
modal volume ls ltx2-outputs
modal volume get ltx2-outputs <filename>
\`\`\`

## Environment setup

\`\`\`python
import time
from pathlib import Path

import modal

\`\`\`

We pin an LTX-2 commit and install its three subpackages.
Torch is installed, along with a Flash-Attention 3 (as a wheel)
for faster inference on GPUs with the Hopper
[SM architecture](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).

\`\`\`python
ltx2_commit = "28c3c73"

image = (
    modal.Image.from_registry("nvidia/cuda:12.6.1-devel-ubuntu24.04", add_python="3.12")
    .apt_install("git", "ffmpeg")
    .uv_pip_install(
        "torch==2.7.0",
        "torchaudio==2.7.0",
        "transformers>=4.52,<5",
        f"git+https://github.com/Lightricks/LTX-2.git@{ltx2_commit}#subdirectory=packages/ltx-core",
        f"git+https://github.com/Lightricks/LTX-2.git@{ltx2_commit}#subdirectory=packages/ltx-pipelines",
        f"git+https://github.com/Lightricks/LTX-2.git@{ltx2_commit}#subdirectory=packages/ltx-trainer",
        "https://huggingface.co/alexnasa/flash-attn-3/resolve/main/128/flash_attn_3-3.0.0b1-cp39-abi3-linux_x86_64.whl",
        extra_index_url="https://download.pytorch.org/whl/cu128",
        extra_options="--index-strategy unsafe-best-match",
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",
            "PYTORCH_ALLOC_CONF": "expandable_segments:True",
        }
    )
    .entrypoint([])
)

\`\`\`

## Volumes

Model weights are cached to a Volume at HuggingFace's default cache path.
Generated videos are saved to a separate output Volume.

\`\`\`python
model_volume = modal.Volume.from_name("ltx2-models", create_if_missing=True)
output_volume = modal.Volume.from_name("ltx2-outputs", create_if_missing=True)

OUTPUT_DIR = Path("/output-videos")

with image.imports():
    import torch
    from huggingface_hub import hf_hub_download, snapshot_download
    from ltx_core.loader import LTXV_LORA_COMFY_RENAMING_MAP, LoraPathStrengthAndSDOps
    from ltx_core.model.video_vae import TilingConfig, get_video_chunks_number
    from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline
    from ltx_pipelines.utils.constants import (
        DEFAULT_AUDIO_GUIDER_PARAMS,
        DEFAULT_NEGATIVE_PROMPT,
        DEFAULT_VIDEO_GUIDER_PARAMS,
    )
    from ltx_pipelines.utils.media_io import encode_video

app = modal.App(
    "example-ltx2-two-stage",
    image=image,
    volumes={
        "/root/.cache/huggingface": model_volume,
        OUTPUT_DIR: output_volume,
    },
    secrets=[modal.Secret.from_name("huggingface-secret")],
)

\`\`\`

## Inference

\`\`\`python
NUM_FRAMES = 121  # ~5s at 24 fps
FRAME_RATE = 24
WIDTH = 1536
HEIGHT = 1024


@app.cls(gpu="H200", timeout=30 * 60, scaledown_window=15 * 60)
class LTX2TwoStage:
    @modal.enter()
    def setup(self):
        """Download model weights and initialize the two-stage pipeline."""
        torch.set_float32_matmul_precision("high")

        repo = "Lightricks/LTX-2"
        checkpoint_path = hf_hub_download(repo, "ltx-2-19b-dev.safetensors")
        upsampler_path = hf_hub_download(
            repo, "ltx-2-spatial-upscaler-x2-1.0.safetensors"
        )
        distilled_lora_path = hf_hub_download(
            repo, "ltx-2-19b-distilled-lora-384.safetensors"
        )
        gemma_dir = snapshot_download("google/gemma-3-12b-it-qat-q4_0-unquantized")
        model_volume.commit()

        distilled_lora = [
            LoraPathStrengthAndSDOps(
                distilled_lora_path, 1.0, LTXV_LORA_COMFY_RENAMING_MAP
            )
        ]

        self.tiling_config = TilingConfig.default()
        self.pipeline = TI2VidTwoStagesPipeline(
            checkpoint_path=checkpoint_path,
            distilled_lora=distilled_lora,
            spatial_upsampler_path=upsampler_path,
            gemma_root=gemma_dir,
            loras=[],
        )

    @modal.method()
    def generate(self, prompt: str) -> None:
        """Generate a video from a text prompt and save it to the output Volume."""
        print(f"Generating {NUM_FRAMES} frames ({NUM_FRAMES / FRAME_RATE:.0f}s) ...")
        print(f"Prompt: {prompt}")
        start = time.time()

        with torch.no_grad():
            video, audio = self.pipeline(
                prompt=prompt,
                negative_prompt=DEFAULT_NEGATIVE_PROMPT,
                seed=42,
                height=HEIGHT,
                width=WIDTH,
                num_frames=NUM_FRAMES,
                frame_rate=FRAME_RATE,
                num_inference_steps=40,
                video_guider_params=DEFAULT_VIDEO_GUIDER_PARAMS,
                audio_guider_params=DEFAULT_AUDIO_GUIDER_PARAMS,
                images=[],
                tiling_config=self.tiling_config,
                enhance_prompt=True,
            )
            print(f"Generated in {time.time() - start:.0f}s")

            safe = "".join(c if c.isalnum() or c == " " else "-" for c in prompt)
            filename = f"{int(time.time())}_{safe[:80].strip().replace(' ', '_')}.mp4"
            output_path = OUTPUT_DIR / filename

            encode_video(
                video=video,
                fps=FRAME_RATE,
                audio=audio,
                audio_sample_rate=24_000,
                output_path=str(output_path),
                video_chunks_number=get_video_chunks_number(
                    NUM_FRAMES, self.tiling_config
                ),
            )
        output_volume.commit()
        print(f"Saved to Volume \`ltx2-outputs\` at {filename}")


@app.local_entrypoint()
def main(
    prompt: str = "A cathedral made of ice, northern lights dancing overhead, camera slowly pushing forward through the nave",
):
    LTX2TwoStage().generate.remote(prompt=prompt)

\`\`\`
`,meta:{title:`High-quality text-to-video with LTX-2`,description:`LTX-2 is a 19B-parameter diffusion model that generates video with synchronized audio from a text prompt. This example runs LTX-2’s two-stage production-grade pipeline on Modal: stage 1 generates video at half resolution, then stage 2 upscales by 2x and refines with a distilled LoRA. Output is a 1024x1536 MP4 with audio.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p><!> is a 19B-parameter diffusion model
that generates video with synchronized audio from a text prompt.
This example runs LTX-2’s two-stage production-grade pipeline on Modal: stage 1
generates video at half resolution, then stage 2 upscales by 2x and refines with
a distilled LoRA. Output is a 1024x1536 MP4 with audio.</p> <!> <p>The text encoder uses Gemma 3 weights that require accepting a license.
Visit <!>,
click “Agree and access repository”, then create a token at <!> and add it as a <!> named <code>huggingface-secret</code> with key <code>HF_TOKEN</code>.</p> <p>Generate a video with:</p> <!> <p>Retrieve the output from the Modal Volume:</p> <!> <!> <!> <p>We pin an LTX-2 commit and install its three subpackages.
Torch is installed, along with a Flash-Attention 3 (as a wheel)
for faster inference on GPUs with the Hopper <!>.</p> <!> <!> <p>Model weights are cached to a Volume at HuggingFace’s default cache path.
Generated videos are saved to a separate output Volume.</p> <!> <!> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`high-quality-text-to-video-with-ltx-2`,children:(e,t)=>{l(),i(e,r(`High-quality text-to-video with LTX-2`))},$$slots:{default:!0}});var h=c(p,2);m(e(h),{href:`https://github.com/Lightricks/LTX-2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LTX-2`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var _=c(g,2),v=c(e(_));m(v,{href:`https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized`))},$$slots:{default:!0}});var b=c(v,2);m(b,{href:`https://huggingface.co/settings/tokens`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://huggingface.co/settings/tokens`))},$$slots:{default:!0}}),m(c(b,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),l(5),n(_);var x=c(_,4);f(x,{code:`modal%20run%20ltx2_two_stage.py%20--prompt%20%22A%20cathedral%20made%20of%20ice%2C%20northern%20lights%20overhead%22`,lang:`bash`});var S=c(x,4);f(S,{code:`modal%20volume%20ls%20ltx2-outputs%0Amodal%20volume%20get%20ltx2-outputs%20%3Cfilename%3E`,lang:`bash`});var C=c(S,2);u(C,{id:`environment-setup`,children:(e,t)=>{l(),i(e,r(`Environment setup`))},$$slots:{default:!0}});var w=c(C,2);f(w,{code:`import%20time%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var T=c(w,2);m(c(e(T)),{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SM architecture`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);f(E,{code:`ltx2_commit%20%3D%20%2228c3c73%22%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.6.1-devel-ubuntu24.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22torchaudio%3D%3D2.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3E%3D4.52%2C%3C5%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7Bltx2_commit%7D%23subdirectory%3Dpackages%2Fltx-core%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7Bltx2_commit%7D%23subdirectory%3Dpackages%2Fltx-pipelines%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7Bltx2_commit%7D%23subdirectory%3Dpackages%2Fltx-trainer%22%2C%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Falexnasa%2Fflash-attn-3%2Fresolve%2Fmain%2F128%2Fflash_attn_3-3.0.0b1-cp39-abi3-linux_x86_64.whl%22%2C%0A%20%20%20%20%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22PYTORCH_ALLOC_CONF%22%3A%20%22expandable_segments%3ATrue%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A)%0A`,lang:`python`});var D=c(E,2);u(D,{id:`volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}});var O=c(D,4);f(O,{code:`model_volume%20%3D%20modal.Volume.from_name(%22ltx2-models%22%2C%20create_if_missing%3DTrue)%0Aoutput_volume%20%3D%20modal.Volume.from_name(%22ltx2-outputs%22%2C%20create_if_missing%3DTrue)%0A%0AOUTPUT_DIR%20%3D%20Path(%22%2Foutput-videos%22)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20huggingface_hub%20import%20hf_hub_download%2C%20snapshot_download%0A%20%20%20%20from%20ltx_core.loader%20import%20LTXV_LORA_COMFY_RENAMING_MAP%2C%20LoraPathStrengthAndSDOps%0A%20%20%20%20from%20ltx_core.model.video_vae%20import%20TilingConfig%2C%20get_video_chunks_number%0A%20%20%20%20from%20ltx_pipelines.ti2vid_two_stages%20import%20TI2VidTwoStagesPipeline%0A%20%20%20%20from%20ltx_pipelines.utils.constants%20import%20(%0A%20%20%20%20%20%20%20%20DEFAULT_AUDIO_GUIDER_PARAMS%2C%0A%20%20%20%20%20%20%20%20DEFAULT_NEGATIVE_PROMPT%2C%0A%20%20%20%20%20%20%20%20DEFAULT_VIDEO_GUIDER_PARAMS%2C%0A%20%20%20%20)%0A%20%20%20%20from%20ltx_pipelines.utils.media_io%20import%20encode_video%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-ltx2-two-stage%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20model_volume%2C%0A%20%20%20%20%20%20%20%20OUTPUT_DIR%3A%20output_volume%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A)%0A`,lang:`python`});var k=c(O,2);u(k,{id:`inference`,children:(e,t)=>{l(),i(e,r(`Inference`))},$$slots:{default:!0}}),f(c(k,2),{code:`NUM_FRAMES%20%3D%20121%20%20%23%20~5s%20at%2024%20fps%0AFRAME_RATE%20%3D%2024%0AWIDTH%20%3D%201536%0AHEIGHT%20%3D%201024%0A%0A%0A%40app.cls(gpu%3D%22H200%22%2C%20timeout%3D30%20*%2060%2C%20scaledown_window%3D15%20*%2060)%0Aclass%20LTX2TwoStage%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Download%20model%20weights%20and%20initialize%20the%20two-stage%20pipeline.%22%22%22%0A%20%20%20%20%20%20%20%20torch.set_float32_matmul_precision(%22high%22)%0A%0A%20%20%20%20%20%20%20%20repo%20%3D%20%22Lightricks%2FLTX-2%22%0A%20%20%20%20%20%20%20%20checkpoint_path%20%3D%20hf_hub_download(repo%2C%20%22ltx-2-19b-dev.safetensors%22)%0A%20%20%20%20%20%20%20%20upsampler_path%20%3D%20hf_hub_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20repo%2C%20%22ltx-2-spatial-upscaler-x2-1.0.safetensors%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20distilled_lora_path%20%3D%20hf_hub_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20repo%2C%20%22ltx-2-19b-distilled-lora-384.safetensors%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20gemma_dir%20%3D%20snapshot_download(%22google%2Fgemma-3-12b-it-qat-q4_0-unquantized%22)%0A%20%20%20%20%20%20%20%20model_volume.commit()%0A%0A%20%20%20%20%20%20%20%20distilled_lora%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20LoraPathStrengthAndSDOps(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20distilled_lora_path%2C%201.0%2C%20LTXV_LORA_COMFY_RENAMING_MAP%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20self.tiling_config%20%3D%20TilingConfig.default()%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20TI2VidTwoStagesPipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint_path%3Dcheckpoint_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20distilled_lora%3Ddistilled_lora%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spatial_upsampler_path%3Dupsampler_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20gemma_root%3Dgemma_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20loras%3D%5B%5D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20prompt%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22Generate%20a%20video%20from%20a%20text%20prompt%20and%20save%20it%20to%20the%20output%20Volume.%22%22%22%0A%20%20%20%20%20%20%20%20print(f%22Generating%20%7BNUM_FRAMES%7D%20frames%20(%7BNUM_FRAMES%20%2F%20FRAME_RATE%3A.0f%7Ds)%20...%22)%0A%20%20%20%20%20%20%20%20print(f%22Prompt%3A%20%7Bprompt%7D%22)%0A%20%20%20%20%20%20%20%20start%20%3D%20time.time()%0A%0A%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20video%2C%20audio%20%3D%20self.pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3DDEFAULT_NEGATIVE_PROMPT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seed%3D42%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20height%3DHEIGHT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20width%3DWIDTH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3DNUM_FRAMES%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20frame_rate%3DFRAME_RATE%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3D40%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_guider_params%3DDEFAULT_VIDEO_GUIDER_PARAMS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_guider_params%3DDEFAULT_AUDIO_GUIDER_PARAMS%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20images%3D%5B%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tiling_config%3Dself.tiling_config%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20enhance_prompt%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Generated%20in%20%7Btime.time()%20-%20start%3A.0f%7Ds%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20safe%20%3D%20%22%22.join(c%20if%20c.isalnum()%20or%20c%20%3D%3D%20%22%20%22%20else%20%22-%22%20for%20c%20in%20prompt)%0A%20%20%20%20%20%20%20%20%20%20%20%20filename%20%3D%20f%22%7Bint(time.time())%7D_%7Bsafe%5B%3A80%5D.strip().replace('%20'%2C%20'_')%7D.mp4%22%0A%20%20%20%20%20%20%20%20%20%20%20%20output_path%20%3D%20OUTPUT_DIR%20%2F%20filename%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20encode_video(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video%3Dvideo%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fps%3DFRAME_RATE%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio%3Daudio%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_sample_rate%3D24_000%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output_path%3Dstr(output_path)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_chunks_number%3Dget_video_chunks_number(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20NUM_FRAMES%2C%20self.tiling_config%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20output_volume.commit()%0A%20%20%20%20%20%20%20%20print(f%22Saved%20to%20Volume%20%60ltx2-outputs%60%20at%20%7Bfilename%7D%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20prompt%3A%20str%20%3D%20%22A%20cathedral%20made%20of%20ice%2C%20northern%20lights%20dancing%20overhead%2C%20camera%20slowly%20pushing%20forward%20through%20the%20nave%22%2C%0A)%3A%0A%20%20%20%20LTX2TwoStage().generate.remote(prompt%3Dprompt)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=ByVW0dWH.js.map
