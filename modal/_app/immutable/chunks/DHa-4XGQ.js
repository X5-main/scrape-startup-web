(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`07e7ba16-57e5-4a00-a8d5-1812889336b9`,e._sentryDebugIdIdentifier=`sentry-dbid-07e7ba16-57e5-4a00-a8d5-1812889336b9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Generate 3D worlds from text with LTX-2.3 and InSpatio-World`,id:`generate-3d-worlds-from-text-with-ltx-23-and-inspatio-world`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Paths and Volumes`,id:`paths-and-volumes`},{depth:2,value:`Tracking progress through the Volume`,id:`tracking-progress-through-the-volume`},{depth:2,value:`Stage 1: LTX-2.3 reference video`,id:`stage-1-ltx-23-reference-video`},{depth:2,value:`Stage 2: InSpatio world generation`,id:`stage-2-inspatio-world-generation`},{depth:2,value:`Web UI`,id:`web-ui`},{depth:2,value:`Command line`,id:`command-line`}]}],rawContent:`# Generate 3D worlds from text with LTX-2.3 and InSpatio-World

This example shows how to run inference on [LTX-2.3](https://huggingface.co/Lightricks/LTX-2.3) and [InSpatio-World](https://inspatio.github.io/inspatio-world/) on Modal
to generate explorable 3D worlds (videos rendered along a camera trajectory) from your local command line and in a web UI.

The pipeline runs in two stages:
1. LTX-2.3 generates a short reference video from the prompt, writes it to a Volume, then spawns stage 2.
2. InSpatio-World lifts that video into a 3D scene and re-renders it along a camera trajectory.

Here is a sample we generated:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/world.mp4" type="video/mp4" />
</video>
</center>

## Setup

The LTX text encoder uses Gemma 3 weights that require accepting a license.
Visit https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized,
click "Agree and access repository", then create a token at
https://huggingface.co/settings/tokens and add it as a
[Modal Secret](https://modal.com/secrets) named \`huggingface-secret\`
with key \`HF_TOKEN\`.

\`\`\`python
import asyncio
import random
import shutil
import subprocess
import time
import uuid
from pathlib import Path

import modal

app = modal.App("example-text-to-world")

MINUTES = 60  # seconds

\`\`\`

## Paths and Volumes

Model weights and generated videos both live on Volumes, so weights download
only once and outputs persist across containers and runs.

\`\`\`python
ARTIFACTS_PATH = "/artifacts"  # where the output Volume is mounted
INSPATIO_WEIGHTS = "/models/inspatio"  # InSpatio weights, on the weights Volume
INSPATIO_REPO = "/opt/inspatio-world"  # InSpatio source, cloned into the image

model_volume = modal.Volume.from_name("world-model-weights", create_if_missing=True)
output_volume = modal.Volume.from_name("world-model-outputs", create_if_missing=True)

frontend_path = Path(__file__).parent / "frontend"

\`\`\`

We pin the LTX-2 commit that supports the LTX-2.3 model architecture.

\`\`\`python
LTX2_COMMIT = "d6053703e001"
INSPATIO_COMMIT = "fef970664e33f519a31f0ee19d58689e41752c0e"

\`\`\`

Pin model revisions to avoid surprises when upstream repos update.

\`\`\`python
LTX_REVISION = "76730e634e70a28f4e8d51f5e29c08e40e2d8e74"
GEMMA_REVISION = "68f7ee4fbd59087436ada77ed2d62f373fdd4482"
INSPATIO_MODEL_REVISION = "f8d1abe227d486be8593825f0611974aa6207e4d"
WAN_REVISION = "37ec512624d61f7aa208f7ea8140a131f93afc9a"
DA3_REVISION = "8615eefb62f2db4f8d6ebaa59160086981672829"
FLORENCE_REVISION = "21a599d414c4d928c9032694c424fb94458e3594"

\`\`\`

InSpatio renders one camera pose per source frame along this trajectory. The
three whitespace-separated lines are keyframes for pitch (deg), yaw (deg), and
displacement, interpolated across the whole clip into one slow look-around.

\`\`\`python
TRAJECTORY_TXT = (
    "0 0 0\\n"  # pitch: stay level
    "0 -12 0 12 0\\n"  # yaw: pan right, back to center, left, back to center
    "1 1 1\\n"  # displacement: constant orbit radius (no zoom)
)

\`\`\`

## Tracking progress through the Volume

The two stages run asynchronously, so we don't return a result directly.
Instead we track a session's progress by which files exist on the output
Volume: first \`source.mp4\` (LTX), then \`world.mp4\` (InSpatio). Both the web UI
and the CLI poll this same state.

\`\`\`python
def session_dir(session_id: str) -> Path:
    return Path(ARTIFACTS_PATH) / session_id


def status_from_files(present: set[str]) -> str:
    if "world.mp4" in present:
        return "done"
    if "source.mp4" in present:
        return "running_inspatio"
    return "running_ltx"


def session_status(session_id: str) -> dict:
    """Read a session's progress and asset URLs from the mounted Volume."""
    base = session_dir(session_id)
    present = {name for name in ("source.mp4", "world.mp4") if (base / name).exists()}
    assets = {
        f"{name.removesuffix('.mp4')}_video": f"/api/assets/{session_id}/{name}"
        for name in present
    }
    return {"status": status_from_files(present), "assets": assets}


def wait_for_file(path: Path, timeout_s: float = 120.0) -> bool:
    """Reload the output Volume until \`path\` appears (or we time out)."""
    deadline = time.time() + timeout_s
    delay = 1.0
    while True:
        output_volume.reload()
        if path.exists():
            return True
        if time.time() >= deadline:
            return False
        time.sleep(delay)
        delay = min(delay * 1.5, 5.0)


\`\`\`

We also run two small \`ffmpeg\` helpers on the GPU workers (both images include
\`ffmpeg\`). \`transcode_to_web_mp4\` makes a clip streamable in the browser, and
\`expand_to_frames\` stretches the short LTX clip so InSpatio has enough frames
to render a single, continuous camera move.

\`\`\`python
def transcode_to_web_mp4(src: Path, dst: Path) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        str(dst),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg transcode {src.name}: {result.stderr[-2000:]}")


def expand_to_frames(src: Path, dst: Path, num_frames: int) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-vf",
        "setpts=PTS*10,fps=24",
        "-frames:v",
        str(num_frames),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        str(dst),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg expand {src.name}: {result.stderr[-2000:]}")


\`\`\`

## Stage 1: LTX-2.3 reference video

We build the LTX image from CUDA, installing LTX-2's three subpackages at the
pinned commit along with a Flash-Attention 3 wheel for faster inference on
Hopper GPUs.

\`\`\`python
ltx_image = (
    modal.Image.from_registry("nvidia/cuda:12.6.1-devel-ubuntu24.04", add_python="3.12")
    .apt_install("git", "ffmpeg")
    .uv_pip_install(
        "torch==2.7.0",
        "torchaudio==2.7.0",
        "transformers==4.57.6",
        "huggingface-hub==0.36.2",
        "hf_transfer==0.1.8",
        "fastapi[standard]==0.115.8",
        f"git+https://github.com/Lightricks/LTX-2.git@{LTX2_COMMIT}#subdirectory=packages/ltx-core",
        f"git+https://github.com/Lightricks/LTX-2.git@{LTX2_COMMIT}#subdirectory=packages/ltx-pipelines",
        f"git+https://github.com/Lightricks/LTX-2.git@{LTX2_COMMIT}#subdirectory=packages/ltx-trainer",
        "https://huggingface.co/alexnasa/flash-attn-3/resolve/main/128/flash_attn_3-3.0.0b1-cp39-abi3-linux_x86_64.whl",
        extra_index_url="https://download.pytorch.org/whl/cu128",
        extra_options="--index-strategy unsafe-best-match",
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",  # faster downloads
            "HF_HUB_ENABLE_HF_TRANSFER": "1",
            "PYTORCH_ALLOC_CONF": "expandable_segments:True",  # reduce fragmentation
        }
    )
    .entrypoint([])
)

with ltx_image.imports():
    import torch
    from huggingface_hub import hf_hub_download, snapshot_download
    from ltx_core.loader import LTXV_LORA_COMFY_RENAMING_MAP, LoraPathStrengthAndSDOps
    from ltx_core.model.video_vae import TilingConfig, get_video_chunks_number
    from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline
    from ltx_pipelines.utils.constants import DEFAULT_NEGATIVE_PROMPT, detect_params
    from ltx_pipelines.utils.media_io import encode_video


\`\`\`

We wrap inference in a [Cls](https://modal.com/docs/guide/lifecycle-functions)
so the weights download and pipeline build happen once
per container in \`@modal.enter\`.

\`\`\`python
@app.cls(
    image=ltx_image,
    gpu="H200",
    timeout=30 * MINUTES,
    scaledown_window=15 * MINUTES,
    retries=modal.Retries(max_retries=3, initial_delay=5.0),
    volumes={
        "/root/.cache/huggingface": model_volume,
        ARTIFACTS_PATH: output_volume,
    },
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class LTXInference:
    @modal.enter()
    def setup(self):
        torch.set_float32_matmul_precision("high")

        ltx_repo = "Lightricks/LTX-2.3"
        checkpoint_path = hf_hub_download(
            ltx_repo, "ltx-2.3-22b-dev.safetensors", revision=LTX_REVISION
        )
        upsampler_path = hf_hub_download(
            ltx_repo,
            "ltx-2.3-spatial-upscaler-x2-1.1.safetensors",
            revision=LTX_REVISION,
        )
        distilled_lora_path = hf_hub_download(
            ltx_repo,
            "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
            revision=LTX_REVISION,
        )
        gemma_dir = snapshot_download(
            "google/gemma-3-12b-it-qat-q4_0-unquantized", revision=GEMMA_REVISION
        )
        model_volume.commit()

        self.params = detect_params(checkpoint_path)
        self.tiling_config = TilingConfig.default()
        self.pipeline = TI2VidTwoStagesPipeline(
            checkpoint_path=checkpoint_path,
            distilled_lora=[
                LoraPathStrengthAndSDOps(
                    distilled_lora_path, 1.0, LTXV_LORA_COMFY_RENAMING_MAP
                )
            ],
            spatial_upsampler_path=upsampler_path,
            gemma_root=gemma_dir,
            loras=[],
        )

    @modal.method()
    def run(self, session_id: str, prompt: str) -> str:
        seed = random.randint(0, 2**32 - 1)
        print(f"LTX-2.3 session {session_id}: seed={seed}, 832x512, 25 frames @ 24fps")

        out_dir = session_dir(session_id)
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "source.mp4"

        with torch.no_grad():
            video, audio = self.pipeline(
                prompt=prompt,
                negative_prompt=DEFAULT_NEGATIVE_PROMPT,
                seed=seed,
                height=512,
                width=832,
                num_frames=25,
                frame_rate=24,
                num_inference_steps=self.params.num_inference_steps,
                video_guider_params=self.params.video_guider_params,
                audio_guider_params=self.params.audio_guider_params,
                images=[],
                tiling_config=self.tiling_config,
                enhance_prompt=True,
            )
            raw_path = out_path.with_suffix(".raw.mp4")
            encode_video(
                video=video,
                fps=24,
                audio=audio,
                output_path=str(raw_path),
                video_chunks_number=get_video_chunks_number(25, self.tiling_config),
            )
            transcode_to_web_mp4(raw_path, out_path)
            raw_path.unlink(missing_ok=True)

        output_volume.commit()
        torch.cuda.empty_cache()

        # Spawn the InSpatio worker to generate the world video without blocking
        InSpatioInference().run.spawn(session_id=session_id, source_path=str(out_path))
        return str(out_path)


\`\`\`

## Stage 2: InSpatio world generation

InSpatio-World needs its own pinned dependency stack (Torch 2.5 + CUDA 12.1).
We clone the upstream repo into the image and point its \`checkpoints\` directory
at the weights Volume.

\`\`\`python
inspatio_image = (
    modal.Image.from_registry("nvidia/cuda:12.1.0-devel-ubuntu22.04", add_python="3.10")
    .apt_install(
        "git",
        "ffmpeg",
        "libgl1",
        "libglib2.0-0",
        "libsm6",
        "libxext6",
        "libxrender1",
    )
    .uv_pip_install(
        "torch==2.5.1",
        "torchvision==0.20.1",
        "torchaudio==2.5.1",
        "accelerate==1.13.0",
        "av==13.1.0",
        "decord==0.6.0",
        "depth-anything-3==0.1.1",
        "diffusers==0.37.0",
        "easydict==1.13",
        "einops==0.8.2",
        "ftfy==6.3.1",
        "huggingface-hub==0.36.2",
        "imageio==2.37.3",
        "imageio-ffmpeg==0.6.0",
        "numpy==1.26.4",
        "omegaconf==2.3.0",
        "open3d==0.19.0",
        "opencv-python==4.11.0.86",
        "pillow==12.0.0",
        "plyfile==1.1",
        "safetensors==0.7.0",
        "scipy==1.15.3",
        "timm==1.0.25",
        "tokenizers==0.22.2",
        "transformers==4.57.6",
        "trimesh==4.11.3",
        "xformers==0.0.29.post1",
        "https://github.com/Dao-AILab/flash-attention/releases/download/v2.7.4.post1/flash_attn-2.7.4.post1+cu12torch2.5cxx11abiFALSE-cp310-cp310-linux_x86_64.whl",
        extra_index_url="https://download.pytorch.org/whl/cu121",
        extra_options="--index-strategy unsafe-best-match",
    )
    .run_commands(
        # Clone InSpatio, rename a deprecated \`torch_dtype\` kwarg for newer
        # transformers, and symlink its checkpoints dir to the weights Volume.
        f"git clone https://github.com/inspatio/inspatio-world.git {INSPATIO_REPO}"
        f" && git -C {INSPATIO_REPO} checkout {INSPATIO_COMMIT}"
        f" && find {INSPATIO_REPO} -name '*.py'"
        " | xargs grep -l 'torch_dtype'"
        " | xargs sed -i 's/torch_dtype=/dtype=/g'"
        f" && rm -rf {INSPATIO_REPO}/checkpoints"
        f" && ln -s {INSPATIO_WEIGHTS} {INSPATIO_REPO}/checkpoints"
    )
    .entrypoint([])
)


@app.cls(
    image=inspatio_image,
    gpu="H200",
    timeout=90 * MINUTES,
    scaledown_window=10 * MINUTES,
    retries=modal.Retries(max_retries=3, initial_delay=5.0),
    volumes={
        INSPATIO_WEIGHTS: model_volume,
        ARTIFACTS_PATH: output_volume,
    },
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class InSpatioInference:
    @modal.enter()
    def setup(self):
        """Download InSpatio checkpoints to the weights Volume on first container start."""
        from huggingface_hub import snapshot_download

        sentinel = Path(INSPATIO_WEIGHTS) / ".ready"
        if sentinel.exists():
            return

        print("Downloading InSpatio-World checkpoints (first run only)...")
        weights = Path(INSPATIO_WEIGHTS)
        weights.mkdir(parents=True, exist_ok=True)

        # taehv lives only on GitHub; the rest are Hugging Face repos.
        taehv = weights / "taehv"
        shutil.rmtree(taehv, ignore_errors=True)
        repo = "https://github.com/madebyollin/taehv.git"
        subprocess.run(["git", "clone", "--depth", "1", repo, str(taehv)], check=True)
        for repo_id, dest, rev in [
            ("inspatio/world", "InSpatio-World-1.3B", INSPATIO_MODEL_REVISION),
            ("Wan-AI/Wan2.1-T2V-1.3B", "Wan2.1-T2V-1.3B", WAN_REVISION),
            ("depth-anything/DA3NESTED-GIANT-LARGE", "DA3", DA3_REVISION),
            ("microsoft/Florence-2-large", "Florence-2-large", FLORENCE_REVISION),
        ]:
            snapshot_download(repo_id, local_dir=str(weights / dest), revision=rev)

        sentinel.write_text("ok")
        model_volume.commit()

    @modal.method()
    def warmup(self) -> str:
        """Boot the container (and download weights on first run) ahead of time."""
        return "ok"

    @modal.method()
    def run(self, session_id: str, source_path: str) -> None:
        work = session_dir(session_id) / "_work"
        input_dir = work / "input"
        input_dir.mkdir(parents=True, exist_ok=True)

        # Wait for LTX's video to propagate to this container, then hold it out to
        # 240 frames so InSpatio renders one continuous 10s pan (at 24fps).
        source = Path(source_path)
        if not wait_for_file(source):
            raise FileNotFoundError(f"source video missing: {source}")
        expand_to_frames(source, input_dir / "source.mp4", 240)

        traj_path = work / "trajectory.txt"
        traj_path.write_text(TRAJECTORY_TXT)

        output_folder = work / "output" / "world"
        output_folder.mkdir(parents=True, exist_ok=True)

        print(f"InSpatio session {session_id}: gentle look-around")
        cmd = [
            "bash",
            f"{INSPATIO_REPO}/run_test_pipeline.sh",
            "--input_dir",
            str(input_dir),
            "--traj_txt_path",
            str(traj_path),
            "--checkpoint_path",
            f"{INSPATIO_WEIGHTS}/InSpatio-World-1.3B/InSpatio-World-1.3B.safetensors",
            "--config_path",
            f"{INSPATIO_REPO}/configs/inference_1.3b.yaml",
            "--da3_model_path",
            f"{INSPATIO_WEIGHTS}/DA3",
            "--florence_model_path",
            f"{INSPATIO_WEIGHTS}/Florence-2-large",
            "--output_folder",
            str(output_folder),
            "--disable_adaptive_frame",  # one pose per frame, no bounce/subsample
        ]
        result = subprocess.run(cmd, cwd=INSPATIO_REPO)
        if result.returncode != 0:
            raise RuntimeError(f"InSpatio pipeline exit code {result.returncode}")

        world_src = next(iter(sorted(output_folder.rglob("*pred_video*.mp4"))), None)
        if not world_src:
            raise RuntimeError("InSpatio produced no world video")
        transcode_to_web_mp4(world_src, session_dir(session_id) / "world.mp4")
        shutil.rmtree(work, ignore_errors=True)
        output_volume.commit()


\`\`\`

## Web UI

A small [ASGI app](https://modal.com/docs/guide/webhooks) serves the frontend
and exposes the session lifecycle: start a session (spawn the LTX worker and
warm InSpatio), poll its status by reading the Volume, and serve the videos the
workers write there.

\`\`\`python
web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "jinja2==3.1.5", "fastapi[standard]==0.115.8", "python-multipart==0.0.20"
    )
    .add_local_dir(frontend_path, remote_path="/assets")
)

ASSET_NAMES = frozenset({"source.mp4", "world.mp4"})


@app.function(image=web_image, volumes={ARTIFACTS_PATH: output_volume})
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import fastapi.staticfiles
    import fastapi.templating

    web_app = fastapi.FastAPI()
    templates = fastapi.templating.Jinja2Templates(directory="/assets")

    # \`Volume.reload()\` fails while any file on the Volume is open in this
    # container, so this lock serializes reloads (and the asset copy-out below)
    # across the many concurrent requests this single container handles.
    volume_lock = asyncio.Lock()

    @web_app.get("/")
    async def read_root(request: fastapi.Request):
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "model_name": "World Model (LTX-2.3 + InSpatio)",
                "default_prompt": "A serene mountain lake at sunrise, mist rising off the water",
            },
        )

    @web_app.post("/api/sessions")
    async def start_session(prompt: str = fastapi.Form(...)):
        session_id = uuid.uuid4().hex[:12]
        # Warm InSpatio in parallel with LTX generation; the LTX worker spawns
        # the InSpatio run itself once its video is on the Volume.
        await InSpatioInference().warmup.spawn.aio()
        await LTXInference().run.spawn.aio(session_id=session_id, prompt=prompt)
        return {"session_id": session_id}

    @web_app.get("/api/sessions/{session_id}")
    async def session_state(session_id: str):
        async with volume_lock:
            await output_volume.reload.aio()
        if not session_dir(session_id).exists():
            return fastapi.responses.JSONResponse(
                {"error": "not found"}, status_code=404
            )
        state = session_status(session_id)
        return fastapi.responses.JSONResponse(
            state, status_code=200 if state["status"] == "done" else 202
        )

    @web_app.get("/api/assets/{session_id}/{filename}")
    async def serve_asset(session_id: str, filename: str):
        if filename not in ASSET_NAMES:
            return fastapi.responses.JSONResponse({"error": "unknown"}, status_code=404)

        vol_path = session_dir(session_id) / filename
        if not vol_path.exists():
            async with volume_lock:
                await output_volume.reload.aio()
        if not vol_path.exists():
            return fastapi.responses.JSONResponse(
                {"error": "not ready"}, status_code=404
            )

        stat = vol_path.stat()
        local_path = (
            Path("/tmp/asset_cache")
            / session_id
            / f"{stat.st_mtime_ns}_{stat.st_size}_{filename}"
        )
        if not local_path.exists():
            async with volume_lock:
                local_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(vol_path, local_path)

        return fastapi.responses.FileResponse(
            local_path, media_type="video/mp4", content_disposition_type="inline"
        )

    web_app.mount(
        "/static", fastapi.staticfiles.StaticFiles(directory="/assets"), name="static"
    )
    return web_app


\`\`\`

## Command line

Run the pipeline from your terminal with

\`\`\`bash
modal run text_to_world.py --prompt "Cyberpunk dystopia where humans have been enslaved by sentient fungi"
\`\`\`

This starts a session, watches the output Volume until the world video shows
up, and prints a link to the Volume dashboard where both videos can be viewed.

\`\`\`python
@app.local_entrypoint()
def entrypoint(prompt: str | None = None):
    if prompt is None:
        prompt = "A serene mountain lake at sunrise, mist rising off the water"

    session_id = uuid.uuid4().hex[:12]
    print(f"Starting world session {session_id}")
    print(f"  prompt: {prompt}")

    InSpatioInference().warmup.spawn()
    LTXInference().run.spawn(session_id=session_id, prompt=prompt)

    def list_session_files() -> set[str]:
        try:
            return {Path(e.path).name for e in output_volume.listdir(session_id)}
        except Exception:
            return set()

    start, last_status = time.time(), None
    while last_status != "done":
        status = status_from_files(list_session_files())
        if status != last_status:
            print(f"  [{time.time() - start:6.1f}s] {status}")
            last_status = status
        if status != "done":
            time.sleep(10)

    output_volume.hydrate()
    print("\\nWorld ready. View the videos on the Modal Volume dashboard:")
    print(f"  https://modal.com/id/{output_volume.object_id}")
    print(f"This run's files live under {session_id}/ :")
    print(f"  {session_id}/source.mp4   (LTX video)")
    print(f"  {session_id}/world.mp4    (InSpatio world video)")

\`\`\`
`,meta:{title:`Generate 3D worlds from text with LTX-2.3 and InSpatio-World`,description:`This example shows how to run inference on LTX-2.3 and InSpatio-World on Modal to generate explorable 3D worlds (videos rendered along a camera trajectory) from your local command line and in a web UI.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example shows how to run inference on <!> and <!> on Modal
to generate explorable 3D worlds (videos rendered along a camera trajectory) from your local command line and in a web UI.</p> <p>The pipeline runs in two stages:</p> <ol><li>LTX-2.3 generates a short reference video from the prompt, writes it to a Volume, then spawns stage 2.</li> <li>InSpatio-World lifts that video into a 3D scene and re-renders it along a camera trajectory.</li></ol> <p>Here is a sample we generated:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/world.mp4" type="video/mp4"/></video></center> <!> <p>The LTX text encoder uses Gemma 3 weights that require accepting a license.
Visit <!>,
click “Agree and access repository”, then create a token at <!> and add it as a <!> named <code>huggingface-secret</code> with key <code>HF_TOKEN</code>.</p> <!> <!> <p>Model weights and generated videos both live on Volumes, so weights download
only once and outputs persist across containers and runs.</p> <!> <p>We pin the LTX-2 commit that supports the LTX-2.3 model architecture.</p> <!> <p>Pin model revisions to avoid surprises when upstream repos update.</p> <!> <p>InSpatio renders one camera pose per source frame along this trajectory. The
three whitespace-separated lines are keyframes for pitch (deg), yaw (deg), and
displacement, interpolated across the whole clip into one slow look-around.</p> <!> <!> <p>The two stages run asynchronously, so we don’t return a result directly.
Instead we track a session’s progress by which files exist on the output
Volume: first <code>source.mp4</code> (LTX), then <code>world.mp4</code> (InSpatio). Both the web UI
and the CLI poll this same state.</p> <!> <p>We also run two small <code>ffmpeg</code> helpers on the GPU workers (both images include <code>ffmpeg</code>). <code>transcode_to_web_mp4</code> makes a clip streamable in the browser, and <code>expand_to_frames</code> stretches the short LTX clip so InSpatio has enough frames
to render a single, continuous camera move.</p> <!> <!> <p>We build the LTX image from CUDA, installing LTX-2’s three subpackages at the
pinned commit along with a Flash-Attention 3 wheel for faster inference on
Hopper GPUs.</p> <!> <p>We wrap inference in a <!> so the weights download and pipeline build happen once
per container in <code>@modal.enter</code>.</p> <!> <!> <p>InSpatio-World needs its own pinned dependency stack (Torch 2.5 + CUDA 12.1).
We clone the upstream repo into the image and point its <code>checkpoints</code> directory
at the weights Volume.</p> <!> <!> <p>A small <!> serves the frontend
and exposes the session lifecycle: start a session (spawn the LTX worker and
warm InSpatio), poll its status by reading the Volume, and serve the videos the
workers write there.</p> <!> <!> <p>Run the pipeline from your terminal with</p> <!> <p>This starts a session, watches the output Volume until the world video shows
up, and prints a link to the Volume dashboard where both videos can be viewed.</p> <!>`,3);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`generate-3d-worlds-from-text-with-ltx-23-and-inspatio-world`,children:(e,t)=>{l(),i(e,r(`Generate 3D worlds from text with LTX-2.3 and InSpatio-World`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://huggingface.co/Lightricks/LTX-2.3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LTX-2.3`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://inspatio.github.io/inspatio-world/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`InSpatio-World`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,8),v=e(_);v.muted=!0,n(_);var b=c(_,2);u(b,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var x=c(b,2),S=c(e(x));m(S,{href:`https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized`))},$$slots:{default:!0}});var C=c(S,2);m(C,{href:`https://huggingface.co/settings/tokens`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://huggingface.co/settings/tokens`))},$$slots:{default:!0}}),m(c(C,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),l(5),n(x);var w=c(x,2);f(w,{code:`import%20asyncio%0Aimport%20random%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20time%0Aimport%20uuid%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-text-to-world%22)%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A`,lang:`python`});var T=c(w,2);u(T,{id:`paths-and-volumes`,children:(e,t)=>{l(),i(e,r(`Paths and Volumes`))},$$slots:{default:!0}});var E=c(T,4);f(E,{code:`ARTIFACTS_PATH%20%3D%20%22%2Fartifacts%22%20%20%23%20where%20the%20output%20Volume%20is%20mounted%0AINSPATIO_WEIGHTS%20%3D%20%22%2Fmodels%2Finspatio%22%20%20%23%20InSpatio%20weights%2C%20on%20the%20weights%20Volume%0AINSPATIO_REPO%20%3D%20%22%2Fopt%2Finspatio-world%22%20%20%23%20InSpatio%20source%2C%20cloned%20into%20the%20image%0A%0Amodel_volume%20%3D%20modal.Volume.from_name(%22world-model-weights%22%2C%20create_if_missing%3DTrue)%0Aoutput_volume%20%3D%20modal.Volume.from_name(%22world-model-outputs%22%2C%20create_if_missing%3DTrue)%0A%0Afrontend_path%20%3D%20Path(__file__).parent%20%2F%20%22frontend%22%0A`,lang:`python`});var D=c(E,4);f(D,{code:`LTX2_COMMIT%20%3D%20%22d6053703e001%22%0AINSPATIO_COMMIT%20%3D%20%22fef970664e33f519a31f0ee19d58689e41752c0e%22%0A`,lang:`python`});var O=c(D,4);f(O,{code:`LTX_REVISION%20%3D%20%2276730e634e70a28f4e8d51f5e29c08e40e2d8e74%22%0AGEMMA_REVISION%20%3D%20%2268f7ee4fbd59087436ada77ed2d62f373fdd4482%22%0AINSPATIO_MODEL_REVISION%20%3D%20%22f8d1abe227d486be8593825f0611974aa6207e4d%22%0AWAN_REVISION%20%3D%20%2237ec512624d61f7aa208f7ea8140a131f93afc9a%22%0ADA3_REVISION%20%3D%20%228615eefb62f2db4f8d6ebaa59160086981672829%22%0AFLORENCE_REVISION%20%3D%20%2221a599d414c4d928c9032694c424fb94458e3594%22%0A`,lang:`python`});var k=c(O,4);f(k,{code:`TRAJECTORY_TXT%20%3D%20(%0A%20%20%20%20%220%200%200%5Cn%22%20%20%23%20pitch%3A%20stay%20level%0A%20%20%20%20%220%20-12%200%2012%200%5Cn%22%20%20%23%20yaw%3A%20pan%20right%2C%20back%20to%20center%2C%20left%2C%20back%20to%20center%0A%20%20%20%20%221%201%201%5Cn%22%20%20%23%20displacement%3A%20constant%20orbit%20radius%20(no%20zoom)%0A)%0A`,lang:`python`});var A=c(k,2);u(A,{id:`tracking-progress-through-the-volume`,children:(e,t)=>{l(),i(e,r(`Tracking progress through the Volume`))},$$slots:{default:!0}});var j=c(A,4);f(j,{code:`def%20session_dir(session_id%3A%20str)%20-%3E%20Path%3A%0A%20%20%20%20return%20Path(ARTIFACTS_PATH)%20%2F%20session_id%0A%0A%0Adef%20status_from_files(present%3A%20set%5Bstr%5D)%20-%3E%20str%3A%0A%20%20%20%20if%20%22world.mp4%22%20in%20present%3A%0A%20%20%20%20%20%20%20%20return%20%22done%22%0A%20%20%20%20if%20%22source.mp4%22%20in%20present%3A%0A%20%20%20%20%20%20%20%20return%20%22running_inspatio%22%0A%20%20%20%20return%20%22running_ltx%22%0A%0A%0Adef%20session_status(session_id%3A%20str)%20-%3E%20dict%3A%0A%20%20%20%20%22%22%22Read%20a%20session's%20progress%20and%20asset%20URLs%20from%20the%20mounted%20Volume.%22%22%22%0A%20%20%20%20base%20%3D%20session_dir(session_id)%0A%20%20%20%20present%20%3D%20%7Bname%20for%20name%20in%20(%22source.mp4%22%2C%20%22world.mp4%22)%20if%20(base%20%2F%20name).exists()%7D%0A%20%20%20%20assets%20%3D%20%7B%0A%20%20%20%20%20%20%20%20f%22%7Bname.removesuffix('.mp4')%7D_video%22%3A%20f%22%2Fapi%2Fassets%2F%7Bsession_id%7D%2F%7Bname%7D%22%0A%20%20%20%20%20%20%20%20for%20name%20in%20present%0A%20%20%20%20%7D%0A%20%20%20%20return%20%7B%22status%22%3A%20status_from_files(present)%2C%20%22assets%22%3A%20assets%7D%0A%0A%0Adef%20wait_for_file(path%3A%20Path%2C%20timeout_s%3A%20float%20%3D%20120.0)%20-%3E%20bool%3A%0A%20%20%20%20%22%22%22Reload%20the%20output%20Volume%20until%20%60path%60%20appears%20(or%20we%20time%20out).%22%22%22%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout_s%0A%20%20%20%20delay%20%3D%201.0%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20output_volume.reload()%0A%20%20%20%20%20%20%20%20if%20path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20True%0A%20%20%20%20%20%20%20%20if%20time.time()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20False%0A%20%20%20%20%20%20%20%20time.sleep(delay)%0A%20%20%20%20%20%20%20%20delay%20%3D%20min(delay%20*%201.5%2C%205.0)%0A%0A`,lang:`python`});var M=c(j,4);f(M,{code:`def%20transcode_to_web_mp4(src%3A%20Path%2C%20dst%3A%20Path)%20-%3E%20None%3A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22ffmpeg%22%2C%0A%20%20%20%20%20%20%20%20%22-y%22%2C%0A%20%20%20%20%20%20%20%20%22-i%22%2C%0A%20%20%20%20%20%20%20%20str(src)%2C%0A%20%20%20%20%20%20%20%20%22-c%3Av%22%2C%0A%20%20%20%20%20%20%20%20%22libx264%22%2C%0A%20%20%20%20%20%20%20%20%22-preset%22%2C%0A%20%20%20%20%20%20%20%20%22fast%22%2C%0A%20%20%20%20%20%20%20%20%22-crf%22%2C%0A%20%20%20%20%20%20%20%20%2220%22%2C%0A%20%20%20%20%20%20%20%20%22-pix_fmt%22%2C%0A%20%20%20%20%20%20%20%20%22yuv420p%22%2C%0A%20%20%20%20%20%20%20%20%22-vf%22%2C%0A%20%20%20%20%20%20%20%20%22scale%3Dtrunc(iw%2F2)*2%3Atrunc(ih%2F2)*2%22%2C%0A%20%20%20%20%20%20%20%20%22-movflags%22%2C%0A%20%20%20%20%20%20%20%20%22%2Bfaststart%22%2C%0A%20%20%20%20%20%20%20%20%22-c%3Aa%22%2C%0A%20%20%20%20%20%20%20%20%22aac%22%2C%0A%20%20%20%20%20%20%20%20str(dst)%2C%0A%20%20%20%20%5D%0A%20%20%20%20result%20%3D%20subprocess.run(cmd%2C%20capture_output%3DTrue%2C%20text%3DTrue)%0A%20%20%20%20if%20result.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22ffmpeg%20transcode%20%7Bsrc.name%7D%3A%20%7Bresult.stderr%5B-2000%3A%5D%7D%22)%0A%0A%0Adef%20expand_to_frames(src%3A%20Path%2C%20dst%3A%20Path%2C%20num_frames%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22ffmpeg%22%2C%0A%20%20%20%20%20%20%20%20%22-y%22%2C%0A%20%20%20%20%20%20%20%20%22-i%22%2C%0A%20%20%20%20%20%20%20%20str(src)%2C%0A%20%20%20%20%20%20%20%20%22-vf%22%2C%0A%20%20%20%20%20%20%20%20%22setpts%3DPTS*10%2Cfps%3D24%22%2C%0A%20%20%20%20%20%20%20%20%22-frames%3Av%22%2C%0A%20%20%20%20%20%20%20%20str(num_frames)%2C%0A%20%20%20%20%20%20%20%20%22-c%3Av%22%2C%0A%20%20%20%20%20%20%20%20%22libx264%22%2C%0A%20%20%20%20%20%20%20%20%22-preset%22%2C%0A%20%20%20%20%20%20%20%20%22fast%22%2C%0A%20%20%20%20%20%20%20%20%22-crf%22%2C%0A%20%20%20%20%20%20%20%20%2218%22%2C%0A%20%20%20%20%20%20%20%20%22-pix_fmt%22%2C%0A%20%20%20%20%20%20%20%20%22yuv420p%22%2C%0A%20%20%20%20%20%20%20%20str(dst)%2C%0A%20%20%20%20%5D%0A%20%20%20%20result%20%3D%20subprocess.run(cmd%2C%20capture_output%3DTrue%2C%20text%3DTrue)%0A%20%20%20%20if%20result.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22ffmpeg%20expand%20%7Bsrc.name%7D%3A%20%7Bresult.stderr%5B-2000%3A%5D%7D%22)%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`stage-1-ltx-23-reference-video`,children:(e,t)=>{l(),i(e,r(`Stage 1: LTX-2.3 reference video`))},$$slots:{default:!0}});var P=c(N,4);f(P,{code:`ltx_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.6.1-devel-ubuntu24.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22torchaudio%3D%3D2.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.57.6%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.2%22%2C%0A%20%20%20%20%20%20%20%20%22hf_transfer%3D%3D0.1.8%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.8%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7BLTX2_COMMIT%7D%23subdirectory%3Dpackages%2Fltx-core%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7BLTX2_COMMIT%7D%23subdirectory%3Dpackages%2Fltx-pipelines%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2FLightricks%2FLTX-2.git%40%7BLTX2_COMMIT%7D%23subdirectory%3Dpackages%2Fltx-trainer%22%2C%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Falexnasa%2Fflash-attn-3%2Fresolve%2Fmain%2F128%2Fflash_attn_3-3.0.0b1-cp39-abi3-linux_x86_64.whl%22%2C%0A%20%20%20%20%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20faster%20downloads%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22PYTORCH_ALLOC_CONF%22%3A%20%22expandable_segments%3ATrue%22%2C%20%20%23%20reduce%20fragmentation%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A)%0A%0Awith%20ltx_image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20huggingface_hub%20import%20hf_hub_download%2C%20snapshot_download%0A%20%20%20%20from%20ltx_core.loader%20import%20LTXV_LORA_COMFY_RENAMING_MAP%2C%20LoraPathStrengthAndSDOps%0A%20%20%20%20from%20ltx_core.model.video_vae%20import%20TilingConfig%2C%20get_video_chunks_number%0A%20%20%20%20from%20ltx_pipelines.ti2vid_two_stages%20import%20TI2VidTwoStagesPipeline%0A%20%20%20%20from%20ltx_pipelines.utils.constants%20import%20DEFAULT_NEGATIVE_PROMPT%2C%20detect_params%0A%20%20%20%20from%20ltx_pipelines.utils.media_io%20import%20encode_video%0A%0A`,lang:`python`});var F=c(P,2);m(c(e(F)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),l(3),n(F);var I=c(F,2);f(I,{code:`%40app.cls(%0A%20%20%20%20image%3Dltx_image%2C%0A%20%20%20%20gpu%3D%22H200%22%2C%0A%20%20%20%20timeout%3D30%20*%20MINUTES%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%0A%20%20%20%20retries%3Dmodal.Retries(max_retries%3D3%2C%20initial_delay%3D5.0)%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20model_volume%2C%0A%20%20%20%20%20%20%20%20ARTIFACTS_PATH%3A%20output_volume%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A)%0Aclass%20LTXInference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20torch.set_float32_matmul_precision(%22high%22)%0A%0A%20%20%20%20%20%20%20%20ltx_repo%20%3D%20%22Lightricks%2FLTX-2.3%22%0A%20%20%20%20%20%20%20%20checkpoint_path%20%3D%20hf_hub_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20ltx_repo%2C%20%22ltx-2.3-22b-dev.safetensors%22%2C%20revision%3DLTX_REVISION%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20upsampler_path%20%3D%20hf_hub_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20ltx_repo%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22ltx-2.3-spatial-upscaler-x2-1.1.safetensors%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DLTX_REVISION%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20distilled_lora_path%20%3D%20hf_hub_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20ltx_repo%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22ltx-2.3-22b-distilled-lora-384-1.1.safetensors%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DLTX_REVISION%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20gemma_dir%20%3D%20snapshot_download(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22google%2Fgemma-3-12b-it-qat-q4_0-unquantized%22%2C%20revision%3DGEMMA_REVISION%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20model_volume.commit()%0A%0A%20%20%20%20%20%20%20%20self.params%20%3D%20detect_params(checkpoint_path)%0A%20%20%20%20%20%20%20%20self.tiling_config%20%3D%20TilingConfig.default()%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20TI2VidTwoStagesPipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint_path%3Dcheckpoint_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20distilled_lora%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LoraPathStrengthAndSDOps(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20distilled_lora_path%2C%201.0%2C%20LTXV_LORA_COMFY_RENAMING_MAP%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spatial_upsampler_path%3Dupsampler_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20gemma_root%3Dgemma_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20loras%3D%5B%5D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20session_id%3A%20str%2C%20prompt%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20seed%20%3D%20random.randint(0%2C%202**32%20-%201)%0A%20%20%20%20%20%20%20%20print(f%22LTX-2.3%20session%20%7Bsession_id%7D%3A%20seed%3D%7Bseed%7D%2C%20832x512%2C%2025%20frames%20%40%2024fps%22)%0A%0A%20%20%20%20%20%20%20%20out_dir%20%3D%20session_dir(session_id)%0A%20%20%20%20%20%20%20%20out_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20out_path%20%3D%20out_dir%20%2F%20%22source.mp4%22%0A%0A%20%20%20%20%20%20%20%20with%20torch.no_grad()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20video%2C%20audio%20%3D%20self.pipeline(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20prompt%3Dprompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20negative_prompt%3DDEFAULT_NEGATIVE_PROMPT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20height%3D512%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20width%3D832%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_frames%3D25%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20frame_rate%3D24%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_inference_steps%3Dself.params.num_inference_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_guider_params%3Dself.params.video_guider_params%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_guider_params%3Dself.params.audio_guider_params%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20images%3D%5B%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tiling_config%3Dself.tiling_config%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20enhance_prompt%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20raw_path%20%3D%20out_path.with_suffix(%22.raw.mp4%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20encode_video(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video%3Dvideo%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fps%3D24%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio%3Daudio%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output_path%3Dstr(raw_path)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_chunks_number%3Dget_video_chunks_number(25%2C%20self.tiling_config)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20transcode_to_web_mp4(raw_path%2C%20out_path)%0A%20%20%20%20%20%20%20%20%20%20%20%20raw_path.unlink(missing_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20output_volume.commit()%0A%20%20%20%20%20%20%20%20torch.cuda.empty_cache()%0A%0A%20%20%20%20%20%20%20%20%23%20Spawn%20the%20InSpatio%20worker%20to%20generate%20the%20world%20video%20without%20blocking%0A%20%20%20%20%20%20%20%20InSpatioInference().run.spawn(session_id%3Dsession_id%2C%20source_path%3Dstr(out_path))%0A%20%20%20%20%20%20%20%20return%20str(out_path)%0A%0A`,lang:`python`});var L=c(I,2);u(L,{id:`stage-2-inspatio-world-generation`,children:(e,t)=>{l(),i(e,r(`Stage 2: InSpatio world generation`))},$$slots:{default:!0}});var R=c(L,4);f(R,{code:`inspatio_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.1.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.10%22)%0A%20%20%20%20.apt_install(%0A%20%20%20%20%20%20%20%20%22git%22%2C%0A%20%20%20%20%20%20%20%20%22ffmpeg%22%2C%0A%20%20%20%20%20%20%20%20%22libgl1%22%2C%0A%20%20%20%20%20%20%20%20%22libglib2.0-0%22%2C%0A%20%20%20%20%20%20%20%20%22libsm6%22%2C%0A%20%20%20%20%20%20%20%20%22libxext6%22%2C%0A%20%20%20%20%20%20%20%20%22libxrender1%22%2C%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.20.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchaudio%3D%3D2.5.1%22%2C%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.13.0%22%2C%0A%20%20%20%20%20%20%20%20%22av%3D%3D13.1.0%22%2C%0A%20%20%20%20%20%20%20%20%22decord%3D%3D0.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22depth-anything-3%3D%3D0.1.1%22%2C%0A%20%20%20%20%20%20%20%20%22diffusers%3D%3D0.37.0%22%2C%0A%20%20%20%20%20%20%20%20%22easydict%3D%3D1.13%22%2C%0A%20%20%20%20%20%20%20%20%22einops%3D%3D0.8.2%22%2C%0A%20%20%20%20%20%20%20%20%22ftfy%3D%3D6.3.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.2%22%2C%0A%20%20%20%20%20%20%20%20%22imageio%3D%3D2.37.3%22%2C%0A%20%20%20%20%20%20%20%20%22imageio-ffmpeg%3D%3D0.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3D%3D1.26.4%22%2C%0A%20%20%20%20%20%20%20%20%22omegaconf%3D%3D2.3.0%22%2C%0A%20%20%20%20%20%20%20%20%22open3d%3D%3D0.19.0%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python%3D%3D4.11.0.86%22%2C%0A%20%20%20%20%20%20%20%20%22pillow%3D%3D12.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22plyfile%3D%3D1.1%22%2C%0A%20%20%20%20%20%20%20%20%22safetensors%3D%3D0.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22scipy%3D%3D1.15.3%22%2C%0A%20%20%20%20%20%20%20%20%22timm%3D%3D1.0.25%22%2C%0A%20%20%20%20%20%20%20%20%22tokenizers%3D%3D0.22.2%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.57.6%22%2C%0A%20%20%20%20%20%20%20%20%22trimesh%3D%3D4.11.3%22%2C%0A%20%20%20%20%20%20%20%20%22xformers%3D%3D0.0.29.post1%22%2C%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fgithub.com%2FDao-AILab%2Fflash-attention%2Freleases%2Fdownload%2Fv2.7.4.post1%2Fflash_attn-2.7.4.post1%2Bcu12torch2.5cxx11abiFALSE-cp310-cp310-linux_x86_64.whl%22%2C%0A%20%20%20%20%20%20%20%20extra_index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu121%22%2C%0A%20%20%20%20%20%20%20%20extra_options%3D%22--index-strategy%20unsafe-best-match%22%2C%0A%20%20%20%20)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%23%20Clone%20InSpatio%2C%20rename%20a%20deprecated%20%60torch_dtype%60%20kwarg%20for%20newer%0A%20%20%20%20%20%20%20%20%23%20transformers%2C%20and%20symlink%20its%20checkpoints%20dir%20to%20the%20weights%20Volume.%0A%20%20%20%20%20%20%20%20f%22git%20clone%20https%3A%2F%2Fgithub.com%2Finspatio%2Finspatio-world.git%20%7BINSPATIO_REPO%7D%22%0A%20%20%20%20%20%20%20%20f%22%20%26%26%20git%20-C%20%7BINSPATIO_REPO%7D%20checkout%20%7BINSPATIO_COMMIT%7D%22%0A%20%20%20%20%20%20%20%20f%22%20%26%26%20find%20%7BINSPATIO_REPO%7D%20-name%20'*.py'%22%0A%20%20%20%20%20%20%20%20%22%20%7C%20xargs%20grep%20-l%20'torch_dtype'%22%0A%20%20%20%20%20%20%20%20%22%20%7C%20xargs%20sed%20-i%20's%2Ftorch_dtype%3D%2Fdtype%3D%2Fg'%22%0A%20%20%20%20%20%20%20%20f%22%20%26%26%20rm%20-rf%20%7BINSPATIO_REPO%7D%2Fcheckpoints%22%0A%20%20%20%20%20%20%20%20f%22%20%26%26%20ln%20-s%20%7BINSPATIO_WEIGHTS%7D%20%7BINSPATIO_REPO%7D%2Fcheckpoints%22%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A)%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dinspatio_image%2C%0A%20%20%20%20gpu%3D%22H200%22%2C%0A%20%20%20%20timeout%3D90%20*%20MINUTES%2C%0A%20%20%20%20scaledown_window%3D10%20*%20MINUTES%2C%0A%20%20%20%20retries%3Dmodal.Retries(max_retries%3D3%2C%20initial_delay%3D5.0)%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20INSPATIO_WEIGHTS%3A%20model_volume%2C%0A%20%20%20%20%20%20%20%20ARTIFACTS_PATH%3A%20output_volume%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A)%0Aclass%20InSpatioInference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Download%20InSpatio%20checkpoints%20to%20the%20weights%20Volume%20on%20first%20container%20start.%22%22%22%0A%20%20%20%20%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20%20%20%20%20sentinel%20%3D%20Path(INSPATIO_WEIGHTS)%20%2F%20%22.ready%22%0A%20%20%20%20%20%20%20%20if%20sentinel.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20print(%22Downloading%20InSpatio-World%20checkpoints%20(first%20run%20only)...%22)%0A%20%20%20%20%20%20%20%20weights%20%3D%20Path(INSPATIO_WEIGHTS)%0A%20%20%20%20%20%20%20%20weights.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20%23%20taehv%20lives%20only%20on%20GitHub%3B%20the%20rest%20are%20Hugging%20Face%20repos.%0A%20%20%20%20%20%20%20%20taehv%20%3D%20weights%20%2F%20%22taehv%22%0A%20%20%20%20%20%20%20%20shutil.rmtree(taehv%2C%20ignore_errors%3DTrue)%0A%20%20%20%20%20%20%20%20repo%20%3D%20%22https%3A%2F%2Fgithub.com%2Fmadebyollin%2Ftaehv.git%22%0A%20%20%20%20%20%20%20%20subprocess.run(%5B%22git%22%2C%20%22clone%22%2C%20%22--depth%22%2C%20%221%22%2C%20repo%2C%20str(taehv)%5D%2C%20check%3DTrue)%0A%20%20%20%20%20%20%20%20for%20repo_id%2C%20dest%2C%20rev%20in%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22inspatio%2Fworld%22%2C%20%22InSpatio-World-1.3B%22%2C%20INSPATIO_MODEL_REVISION)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22Wan-AI%2FWan2.1-T2V-1.3B%22%2C%20%22Wan2.1-T2V-1.3B%22%2C%20WAN_REVISION)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22depth-anything%2FDA3NESTED-GIANT-LARGE%22%2C%20%22DA3%22%2C%20DA3_REVISION)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22microsoft%2FFlorence-2-large%22%2C%20%22Florence-2-large%22%2C%20FLORENCE_REVISION)%2C%0A%20%20%20%20%20%20%20%20%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20snapshot_download(repo_id%2C%20local_dir%3Dstr(weights%20%2F%20dest)%2C%20revision%3Drev)%0A%0A%20%20%20%20%20%20%20%20sentinel.write_text(%22ok%22)%0A%20%20%20%20%20%20%20%20model_volume.commit()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20warmup(self)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20%22%22%22Boot%20the%20container%20(and%20download%20weights%20on%20first%20run)%20ahead%20of%20time.%22%22%22%0A%20%20%20%20%20%20%20%20return%20%22ok%22%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20session_id%3A%20str%2C%20source_path%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20work%20%3D%20session_dir(session_id)%20%2F%20%22_work%22%0A%20%20%20%20%20%20%20%20input_dir%20%3D%20work%20%2F%20%22input%22%0A%20%20%20%20%20%20%20%20input_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20%23%20Wait%20for%20LTX's%20video%20to%20propagate%20to%20this%20container%2C%20then%20hold%20it%20out%20to%0A%20%20%20%20%20%20%20%20%23%20240%20frames%20so%20InSpatio%20renders%20one%20continuous%2010s%20pan%20(at%2024fps).%0A%20%20%20%20%20%20%20%20source%20%3D%20Path(source_path)%0A%20%20%20%20%20%20%20%20if%20not%20wait_for_file(source)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20FileNotFoundError(f%22source%20video%20missing%3A%20%7Bsource%7D%22)%0A%20%20%20%20%20%20%20%20expand_to_frames(source%2C%20input_dir%20%2F%20%22source.mp4%22%2C%20240)%0A%0A%20%20%20%20%20%20%20%20traj_path%20%3D%20work%20%2F%20%22trajectory.txt%22%0A%20%20%20%20%20%20%20%20traj_path.write_text(TRAJECTORY_TXT)%0A%0A%20%20%20%20%20%20%20%20output_folder%20%3D%20work%20%2F%20%22output%22%20%2F%20%22world%22%0A%20%20%20%20%20%20%20%20output_folder.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20print(f%22InSpatio%20session%20%7Bsession_id%7D%3A%20gentle%20look-around%22)%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22bash%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BINSPATIO_REPO%7D%2Frun_test_pipeline.sh%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--input_dir%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(input_dir)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--traj_txt_path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(traj_path)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--checkpoint_path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BINSPATIO_WEIGHTS%7D%2FInSpatio-World-1.3B%2FInSpatio-World-1.3B.safetensors%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--config_path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BINSPATIO_REPO%7D%2Fconfigs%2Finference_1.3b.yaml%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--da3_model_path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BINSPATIO_WEIGHTS%7D%2FDA3%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--florence_model_path%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BINSPATIO_WEIGHTS%7D%2FFlorence-2-large%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--output_folder%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(output_folder)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--disable_adaptive_frame%22%2C%20%20%23%20one%20pose%20per%20frame%2C%20no%20bounce%2Fsubsample%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20result%20%3D%20subprocess.run(cmd%2C%20cwd%3DINSPATIO_REPO)%0A%20%20%20%20%20%20%20%20if%20result.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22InSpatio%20pipeline%20exit%20code%20%7Bresult.returncode%7D%22)%0A%0A%20%20%20%20%20%20%20%20world_src%20%3D%20next(iter(sorted(output_folder.rglob(%22*pred_video*.mp4%22)))%2C%20None)%0A%20%20%20%20%20%20%20%20if%20not%20world_src%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%22InSpatio%20produced%20no%20world%20video%22)%0A%20%20%20%20%20%20%20%20transcode_to_web_mp4(world_src%2C%20session_dir(session_id)%20%2F%20%22world.mp4%22)%0A%20%20%20%20%20%20%20%20shutil.rmtree(work%2C%20ignore_errors%3DTrue)%0A%20%20%20%20%20%20%20%20output_volume.commit()%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`web-ui`,children:(e,t)=>{l(),i(e,r(`Web UI`))},$$slots:{default:!0}});var B=c(z,2);m(c(e(B)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ASGI app`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);f(V,{code:`web_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22jinja2%3D%3D3.1.5%22%2C%20%22fastapi%5Bstandard%5D%3D%3D0.115.8%22%2C%20%22python-multipart%3D%3D0.0.20%22%0A%20%20%20%20)%0A%20%20%20%20.add_local_dir(frontend_path%2C%20remote_path%3D%22%2Fassets%22)%0A)%0A%0AASSET_NAMES%20%3D%20frozenset(%7B%22source.mp4%22%2C%20%22world.mp4%22%7D)%0A%0A%0A%40app.function(image%3Dweb_image%2C%20volumes%3D%7BARTIFACTS_PATH%3A%20output_volume%7D)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20fastapi.staticfiles%0A%20%20%20%20import%20fastapi.templating%0A%0A%20%20%20%20web_app%20%3D%20fastapi.FastAPI()%0A%20%20%20%20templates%20%3D%20fastapi.templating.Jinja2Templates(directory%3D%22%2Fassets%22)%0A%0A%20%20%20%20%23%20%60Volume.reload()%60%20fails%20while%20any%20file%20on%20the%20Volume%20is%20open%20in%20this%0A%20%20%20%20%23%20container%2C%20so%20this%20lock%20serializes%20reloads%20(and%20the%20asset%20copy-out%20below)%0A%20%20%20%20%23%20across%20the%20many%20concurrent%20requests%20this%20single%20container%20handles.%0A%20%20%20%20volume_lock%20%3D%20asyncio.Lock()%0A%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20async%20def%20read_root(request%3A%20fastapi.Request)%3A%0A%20%20%20%20%20%20%20%20return%20templates.TemplateResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22index.html%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22request%22%3A%20request%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22model_name%22%3A%20%22World%20Model%20(LTX-2.3%20%2B%20InSpatio)%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22default_prompt%22%3A%20%22A%20serene%20mountain%20lake%20at%20sunrise%2C%20mist%20rising%20off%20the%20water%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40web_app.post(%22%2Fapi%2Fsessions%22)%0A%20%20%20%20async%20def%20start_session(prompt%3A%20str%20%3D%20fastapi.Form(...))%3A%0A%20%20%20%20%20%20%20%20session_id%20%3D%20uuid.uuid4().hex%5B%3A12%5D%0A%20%20%20%20%20%20%20%20%23%20Warm%20InSpatio%20in%20parallel%20with%20LTX%20generation%3B%20the%20LTX%20worker%20spawns%0A%20%20%20%20%20%20%20%20%23%20the%20InSpatio%20run%20itself%20once%20its%20video%20is%20on%20the%20Volume.%0A%20%20%20%20%20%20%20%20await%20InSpatioInference().warmup.spawn.aio()%0A%20%20%20%20%20%20%20%20await%20LTXInference().run.spawn.aio(session_id%3Dsession_id%2C%20prompt%3Dprompt)%0A%20%20%20%20%20%20%20%20return%20%7B%22session_id%22%3A%20session_id%7D%0A%0A%20%20%20%20%40web_app.get(%22%2Fapi%2Fsessions%2F%7Bsession_id%7D%22)%0A%20%20%20%20async%20def%20session_state(session_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20async%20with%20volume_lock%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20output_volume.reload.aio()%0A%20%20%20%20%20%20%20%20if%20not%20session_dir(session_id).exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%22error%22%3A%20%22not%20found%22%7D%2C%20status_code%3D404%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20state%20%3D%20session_status(session_id)%0A%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20state%2C%20status_code%3D200%20if%20state%5B%22status%22%5D%20%3D%3D%20%22done%22%20else%20202%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40web_app.get(%22%2Fapi%2Fassets%2F%7Bsession_id%7D%2F%7Bfilename%7D%22)%0A%20%20%20%20async%20def%20serve_asset(session_id%3A%20str%2C%20filename%3A%20str)%3A%0A%20%20%20%20%20%20%20%20if%20filename%20not%20in%20ASSET_NAMES%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(%7B%22error%22%3A%20%22unknown%22%7D%2C%20status_code%3D404)%0A%0A%20%20%20%20%20%20%20%20vol_path%20%3D%20session_dir(session_id)%20%2F%20filename%0A%20%20%20%20%20%20%20%20if%20not%20vol_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20volume_lock%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20output_volume.reload.aio()%0A%20%20%20%20%20%20%20%20if%20not%20vol_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%22error%22%3A%20%22not%20ready%22%7D%2C%20status_code%3D404%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20stat%20%3D%20vol_path.stat()%0A%20%20%20%20%20%20%20%20local_path%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20Path(%22%2Ftmp%2Fasset_cache%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%20session_id%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%20f%22%7Bstat.st_mtime_ns%7D_%7Bstat.st_size%7D_%7Bfilename%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20not%20local_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20volume_lock%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20local_path.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copy2(vol_path%2C%20local_path)%0A%0A%20%20%20%20%20%20%20%20return%20fastapi.responses.FileResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20local_path%2C%20media_type%3D%22video%2Fmp4%22%2C%20content_disposition_type%3D%22inline%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20web_app.mount(%0A%20%20%20%20%20%20%20%20%22%2Fstatic%22%2C%20fastapi.staticfiles.StaticFiles(directory%3D%22%2Fassets%22)%2C%20name%3D%22static%22%0A%20%20%20%20)%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var H=c(V,2);u(H,{id:`command-line`,children:(e,t)=>{l(),i(e,r(`Command line`))},$$slots:{default:!0}});var U=c(H,4);f(U,{code:`modal%20run%20text_to_world.py%20--prompt%20%22Cyberpunk%20dystopia%20where%20humans%20have%20been%20enslaved%20by%20sentient%20fungi%22`,lang:`bash`}),f(c(U,4),{code:`%40app.local_entrypoint()%0Adef%20entrypoint(prompt%3A%20str%20%7C%20None%20%3D%20None)%3A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20%22A%20serene%20mountain%20lake%20at%20sunrise%2C%20mist%20rising%20off%20the%20water%22%0A%0A%20%20%20%20session_id%20%3D%20uuid.uuid4().hex%5B%3A12%5D%0A%20%20%20%20print(f%22Starting%20world%20session%20%7Bsession_id%7D%22)%0A%20%20%20%20print(f%22%20%20prompt%3A%20%7Bprompt%7D%22)%0A%0A%20%20%20%20InSpatioInference().warmup.spawn()%0A%20%20%20%20LTXInference().run.spawn(session_id%3Dsession_id%2C%20prompt%3Dprompt)%0A%0A%20%20%20%20def%20list_session_files()%20-%3E%20set%5Bstr%5D%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7BPath(e.path).name%20for%20e%20in%20output_volume.listdir(session_id)%7D%0A%20%20%20%20%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20set()%0A%0A%20%20%20%20start%2C%20last_status%20%3D%20time.time()%2C%20None%0A%20%20%20%20while%20last_status%20!%3D%20%22done%22%3A%0A%20%20%20%20%20%20%20%20status%20%3D%20status_from_files(list_session_files())%0A%20%20%20%20%20%20%20%20if%20status%20!%3D%20last_status%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%20%20%5B%7Btime.time()%20-%20start%3A6.1f%7Ds%5D%20%7Bstatus%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20last_status%20%3D%20status%0A%20%20%20%20%20%20%20%20if%20status%20!%3D%20%22done%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(10)%0A%0A%20%20%20%20output_volume.hydrate()%0A%20%20%20%20print(%22%5CnWorld%20ready.%20View%20the%20videos%20on%20the%20Modal%20Volume%20dashboard%3A%22)%0A%20%20%20%20print(f%22%20%20https%3A%2F%2Fmodal.com%2Fid%2F%7Boutput_volume.object_id%7D%22)%0A%20%20%20%20print(f%22This%20run's%20files%20live%20under%20%7Bsession_id%7D%2F%20%3A%22)%0A%20%20%20%20print(f%22%20%20%7Bsession_id%7D%2Fsource.mp4%20%20%20(LTX%20video)%22)%0A%20%20%20%20print(f%22%20%20%7Bsession_id%7D%2Fworld.mp4%20%20%20%20(InSpatio%20world%20video)%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DHa-4XGQ.js.map
