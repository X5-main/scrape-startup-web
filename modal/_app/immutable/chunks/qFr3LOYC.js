(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`58f65ddd-ee5d-4085-a4ef-3e7cb8ae9676`,e._sentryDebugIdIdentifier=`sentry-dbid-58f65ddd-ee5d-4085-a4ef-3e7cb8ae9676`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Play with the ControlNet demos`,id:`play-with-the-controlnet-demos`,children:[{depth:2,value:`Imports and config preamble`,id:`imports-and-config-preamble`},{depth:2,value:`Pick a demo, any demo`,id:`pick-a-demo-any-demo`},{depth:2,value:`Setting up the dependencies`,id:`setting-up-the-dependencies`},{depth:2,value:`Serving the Gradio web UI`,id:`serving-the-gradio-web-ui`},{depth:2,value:`Have fun!`,id:`have-fun`}]}],rawContent:`# Play with the ControlNet demos

This example allows you to play with all 10 demonstration Gradio apps from the new and amazing ControlNet project.
ControlNet provides a minimal interface allowing users to use images to constrain StableDiffusion's generation process.
With ControlNet, users can easily condition the StableDiffusion image generation with different spatial contexts
including a depth maps, segmentation maps, scribble drawings, and keypoints!

<center>
<video controls autoplay loop muted>
<source src="https://user-images.githubusercontent.com/12058921/222927911-3ab52dd1-f2ee-4fb8-97e8-dafbf96ed5c5.mp4" type="video/mp4">
</video>
</center>

## Imports and config preamble

\`\`\`python
import importlib
import os
import pathlib
from dataclasses import dataclass, field

import modal
from fastapi import FastAPI

\`\`\`

Below are the configuration objects for all **10** demos provided in the original [lllyasviel/ControlNet](https://github.com/lllyasviel/ControlNet) repo.
The demos each depend on their own custom pretrained StableDiffusion model, and these models are 5-6GB each.
We can only run one demo at a time, so this module avoids downloading the model and 'detector' dependencies for
all 10 demos and instead uses the demo configuration object to download only what's necessary for the chosen demo.

Even just limiting our dependencies setup to what's required for one demo, the resulting container image is *huge*.

\`\`\`python
@dataclass(frozen=True)
class DemoApp:
    """Config object defining a ControlNet demo app's specific dependencies."""

    name: str
    model_files: list[str]
    detector_files: list[str] = field(default_factory=list)


demos = [
    DemoApp(
        name="canny2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_canny.pth"
        ],
    ),
    DemoApp(
        name="depth2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_depth.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/dpt_hybrid-midas-501f0c75.pt"
        ],
    ),
    DemoApp(
        name="fake_scribble2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_scribble.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/network-bsds500.pth"
        ],
    ),
    DemoApp(
        name="hed2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_hed.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/network-bsds500.pth"
        ],
    ),
    DemoApp(
        name="hough2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_mlsd.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/mlsd_large_512_fp32.pth",
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/mlsd_tiny_512_fp32.pth",
        ],
    ),
    DemoApp(
        name="normal2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_normal.pth"
        ],
    ),
    DemoApp(
        name="pose2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_openpose.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/body_pose_model.pth",
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/hand_pose_model.pth",
        ],
    ),
    DemoApp(
        name="scribble2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_scribble.pth"
        ],
    ),
    DemoApp(
        name="scribble2image_interactive",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_scribble.pth"
        ],
    ),
    DemoApp(
        name="seg2image",
        model_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_seg.pth"
        ],
        detector_files=[
            "https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/upernet_global_small.pth"
        ],
    ),
]
demos_map: dict[str, DemoApp] = {d.name: d for d in demos}

\`\`\`

## Pick a demo, any demo

Simply by changing the \`DEMO_NAME\` below, you can change which ControlNet demo app is setup
and run by this Modal script.

\`\`\`python
DEMO_NAME = "scribble2image"  # Change this value to change the active demo app.
selected_demo = demos_map[DEMO_NAME]

\`\`\`

## Setting up the dependencies

ControlNet requires *a lot* of dependencies which could be fiddly to setup manually, but Modal's programmatic
container image building Python APIs handle this complexity straightforwardly and automatically.

To run any of the 10 demo apps, we need the following:

1. a base Python 3 Linux image (we use Debian Slim)
2. a bunch of third party PyPi packages
3. \`git\`, so that we can download the ControlNet source code (there's no \`controlnet\` PyPi package)
4. some image process Linux system packages, including \`ffmpeg\`
5. and demo specific pre-trained model and detector \`.pth\` files

That's a lot! Fortunately, the code below is already written for you that stitches together a working container image
ready to produce remarkable ControlNet images.

**Note:** a ControlNet model pipeline is [now available in Huggingface's \`diffusers\` package](https://huggingface.co/blog/controlnet). But this does not contain the demo apps.

\`\`\`python
def download_file(url: str, output_path: pathlib.Path):
    import httpx
    from tqdm import tqdm

    with open(output_path, "wb") as download_file:
        with httpx.stream("GET", url, follow_redirects=True) as response:
            total = int(response.headers["Content-Length"])
            with tqdm(
                total=total, unit_scale=True, unit_divisor=1024, unit="B"
            ) as progress:
                num_bytes_downloaded = response.num_bytes_downloaded
                for chunk in response.iter_bytes():
                    download_file.write(chunk)
                    progress.update(
                        response.num_bytes_downloaded - num_bytes_downloaded
                    )
                    num_bytes_downloaded = response.num_bytes_downloaded


def download_demo_files() -> None:
    """
    The ControlNet repo instructs: 'Make sure that SD models are put in "ControlNet/models".'
    'ControlNet' is just the repo root, so we place in /root/models.

    The ControlNet repo also instructs: 'Make sure that... detectors are put in "ControlNet/annotator/ckpts".'
    'ControlNet' is just the repo root, so we place in /root/annotator/ckpts.
    """
    demo = demos_map[os.environ["DEMO_NAME"]]
    models_dir = pathlib.Path("/root/models")
    for url in demo.model_files:
        filepath = pathlib.Path(url).name
        download_file(url=url, output_path=models_dir / filepath)
        print(f"download complete for {filepath}")

    detectors_dir = pathlib.Path("/root/annotator/ckpts")
    for url in demo.detector_files:
        filepath = pathlib.Path(url).name
        download_file(url=url, output_path=detectors_dir / filepath)
        print(f"download complete for {filepath}")
    print("🎉 finished baking demo file(s) into image.")


image = (
    modal.Image.debian_slim(python_version="3.10")
    .uv_pip_install(
        "fastapi[standard]==0.115.4",
        "pydantic==2.9.1",
        "starlette==0.41.2",
        "gradio==3.16.2",
        "albumentations==1.3.0",
        "opencv-contrib-python",
        "imageio==2.9.0",
        "imageio-ffmpeg==0.4.2",
        "pytorch-lightning==1.5.0",
        "omegaconf==2.1.1",
        "test-tube>=0.7.5",
        "streamlit==1.12.1",
        "einops==0.3.0",
        "transformers==4.19.2",
        "webdataset==0.2.5",
        "kornia==0.6",
        "open_clip_torch==2.0.2",
        "invisible-watermark>=0.1.5",
        "streamlit-drawable-canvas==0.8.0",
        "torchmetrics==0.6.0",
        "timm==0.6.12",
        "addict==2.4.0",
        "yapf==0.32.0",
        "prettytable==3.6.0",
        "safetensors==0.2.7",
        "basicsr==1.4.2",
        "tqdm~=4.64.1",
    )
    # xformers library offers performance improvement.
    .uv_pip_install("xformers", pre=True)
    .apt_install("git")
    # Here we place the latest ControlNet repository code into /root.
    # Because /root is almost empty, but not entirely empty, \`git clone\` won't work,
    # so this \`init\` then \`checkout\` workaround is used.
    .run_commands(
        "cd /root && git init .",
        "cd /root && git remote add --fetch origin https://github.com/lllyasviel/ControlNet.git",
        "cd /root && git checkout main",
    )
    .apt_install("ffmpeg", "libsm6", "libxext6")
    .run_function(
        download_demo_files,
        secrets=[modal.Secret.from_dict({"DEMO_NAME": DEMO_NAME})],
    )
)
app = modal.App(name="example-controlnet-gradio-demos", image=image)

web_app = FastAPI()

\`\`\`

## Serving the Gradio web UI

Each ControlNet gradio demo module exposes a \`block\` Gradio interface running in queue-mode,
which is initialized in module scope on import and served on \`0.0.0.0\`. We want the block interface object,
but the queueing and launched webserver aren't compatible with Modal's serverless Web Function interface,
so in the \`import_gradio_app_blocks\` function we patch out these behaviors.

\`\`\`python
def import_gradio_app_blocks(demo: DemoApp):
    from gradio import blocks

    # The ControlNet repo demo scripts are written to be run as
    # standalone scripts, and have a lot of code that executes
    # in global scope on import, including the launch of a Gradio web server.
    # We want Modal to control the Gradio web app serving, so we
    # monkeypatch the .launch() function to be a no-op.
    blocks.Blocks.launch = lambda self, server_name: print(
        "launch() has been monkeypatched to do nothing."
    )

    # each demo app module is a file like gradio_{name}.py
    module_name = f"gradio_{demo.name}"
    mod = importlib.import_module(module_name)
    blocks = mod.block
    # disable queueing mode, which is incompatible with our Modal web app setup.
    blocks.enable_queue = False
    return blocks


\`\`\`

Because the ControlNet gradio apps are so time and compute intensive to cold-start,
the web app function is limited to running just 1 warm container (max_containers=1).
This way, while playing with the demos we can pay the cold-start cost once and have
all web requests hit the same warm container.
Spinning up extra containers to handle additional requests would not be efficient
given the cold-start time.
We set the scaledown_window to 600 seconds so the container will be kept
running for 10 minutes after the last request, to keep the app responsive in case
of continued experimentation.

\`\`\`python
@app.function(
    gpu="A10G",
    max_containers=1,
    scaledown_window=600,
)
@modal.asgi_app()
def run():
    from gradio.routes import mount_gradio_app

    # mount for execution on Modal
    return mount_gradio_app(
        app=web_app,
        blocks=import_gradio_app_blocks(demo=selected_demo),
        path="/",
    )


\`\`\`

## Have fun!

Serve your chosen demo app with \`modal serve controlnet_gradio_demos.py\`. If you don't have any images ready at hand,
try one that's in the \`06_gpu_and_ml/controlnet/demo_images/\` folder.

StableDiffusion was already impressive enough, but ControlNet's ability to so accurately and intuitively constrain
the image generation process is sure to put a big, dumb grin on your face.
`,meta:{title:`Play with the ControlNet demos`,description:`This example allows you to play with all 10 demonstration Gradio apps from the new and amazing ControlNet project. ControlNet provides a minimal interface allowing users to use images to constrain StableDiffusion’s generation process. With ControlNet, users can easily condition the StableDiffusion image generation with different spatial contexts including a depth maps, segmentation maps, scribble drawings, and keypoints!`}},{toc:g,rawContent:_,meta:v}=h,y=t(`now available in Huggingface’s <code>diffusers</code> package`,1),b=t(`<!> <p>This example allows you to play with all 10 demonstration Gradio apps from the new and amazing ControlNet project.
ControlNet provides a minimal interface allowing users to use images to constrain StableDiffusion’s generation process.
With ControlNet, users can easily condition the StableDiffusion image generation with different spatial contexts
including a depth maps, segmentation maps, scribble drawings, and keypoints!</p> <center><video controls autoplay loop><source src="https://user-images.githubusercontent.com/12058921/222927911-3ab52dd1-f2ee-4fb8-97e8-dafbf96ed5c5.mp4" type="video/mp4"/></video></center> <!> <!> <p>Below are the configuration objects for all <strong>10</strong> demos provided in the original <!> repo.
The demos each depend on their own custom pretrained StableDiffusion model, and these models are 5-6GB each.
We can only run one demo at a time, so this module avoids downloading the model and ‘detector’ dependencies for
all 10 demos and instead uses the demo configuration object to download only what’s necessary for the chosen demo.</p> <p>Even just limiting our dependencies setup to what’s required for one demo, the resulting container image is <em>huge</em>.</p> <!> <!> <p>Simply by changing the <code>DEMO_NAME</code> below, you can change which ControlNet demo app is setup
and run by this Modal script.</p> <!> <!> <p>ControlNet requires <em>a lot</em> of dependencies which could be fiddly to setup manually, but Modal’s programmatic
container image building Python APIs handle this complexity straightforwardly and automatically.</p> <p>To run any of the 10 demo apps, we need the following:</p> <ol><li>a base Python 3 Linux image (we use Debian Slim)</li> <li>a bunch of third party PyPi packages</li> <li><code>git</code>, so that we can download the ControlNet source code (there’s no <code>controlnet</code> PyPi package)</li> <li>some image process Linux system packages, including <code>ffmpeg</code></li> <li>and demo specific pre-trained model and detector <code>.pth</code> files</li></ol> <p>That’s a lot! Fortunately, the code below is already written for you that stitches together a working container image
ready to produce remarkable ControlNet images.</p> <p><strong>Note:</strong> a ControlNet model pipeline is <!>. But this does not contain the demo apps.</p> <!> <!> <p>Each ControlNet gradio demo module exposes a <code>block</code> Gradio interface running in queue-mode,
which is initialized in module scope on import and served on <code>0.0.0.0</code>. We want the block interface object,
but the queueing and launched webserver aren’t compatible with Modal’s serverless Web Function interface,
so in the <code>import_gradio_app_blocks</code> function we patch out these behaviors.</p> <!> <p>Because the ControlNet gradio apps are so time and compute intensive to cold-start,
the web app function is limited to running just 1 warm container (max_containers=1).
This way, while playing with the demos we can pay the cold-start cost once and have
all web requests hit the same warm container.
Spinning up extra containers to handle additional requests would not be efficient
given the cold-start time.
We set the scaledown_window to 600 seconds so the container will be kept
running for 10 minutes after the last request, to keep the app responsive in case
of continued experimentation.</p> <!> <!> <p>Serve your chosen demo app with <code>modal serve controlnet_gradio_demos.py</code>. If you don’t have any images ready at hand,
try one that’s in the <code>06_gpu_and_ml/controlnet/demo_images/</code> folder.</p> <p>StableDiffusion was already impressive enough, but ControlNet’s ability to so accurately and intuitively constrain
the image generation process is sure to put a big, dumb grin on your face.</p>`,3);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`play-with-the-controlnet-demos`,children:(e,t)=>{l(),i(e,r(`Play with the ControlNet demos`))},$$slots:{default:!0}});var h=c(p,4),g=e(h);g.muted=!0,n(h);var _=c(h,2);u(_,{id:`imports-and-config-preamble`,children:(e,t)=>{l(),i(e,r(`Imports and config preamble`))},$$slots:{default:!0}});var v=c(_,2);f(v,{code:`import%20importlib%0Aimport%20os%0Aimport%20pathlib%0Afrom%20dataclasses%20import%20dataclass%2C%20field%0A%0Aimport%20modal%0Afrom%20fastapi%20import%20FastAPI%0A`,lang:`python`});var x=c(v,2);m(c(e(x),3),{href:`https://github.com/lllyasviel/ControlNet`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`lllyasviel/ControlNet`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,4);f(S,{code:`%40dataclass(frozen%3DTrue)%0Aclass%20DemoApp%3A%0A%20%20%20%20%22%22%22Config%20object%20defining%20a%20ControlNet%20demo%20app's%20specific%20dependencies.%22%22%22%0A%0A%20%20%20%20name%3A%20str%0A%20%20%20%20model_files%3A%20list%5Bstr%5D%0A%20%20%20%20detector_files%3A%20list%5Bstr%5D%20%3D%20field(default_factory%3Dlist)%0A%0A%0Ademos%20%3D%20%5B%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22canny2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_canny.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22depth2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_depth.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fdpt_hybrid-midas-501f0c75.pt%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22fake_scribble2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_scribble.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fnetwork-bsds500.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22hed2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_hed.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fnetwork-bsds500.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22hough2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_mlsd.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fmlsd_large_512_fp32.pth%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fmlsd_tiny_512_fp32.pth%22%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22normal2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_normal.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22pose2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_openpose.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fbody_pose_model.pth%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fhand_pose_model.pth%22%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22scribble2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_scribble.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22scribble2image_interactive%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_scribble.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20DemoApp(%0A%20%20%20%20%20%20%20%20name%3D%22seg2image%22%2C%0A%20%20%20%20%20%20%20%20model_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fmodels%2Fcontrol_sd15_seg.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20detector_files%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fhuggingface.co%2Flllyasviel%2FControlNet%2Fresolve%2Fmain%2Fannotator%2Fckpts%2Fupernet_global_small.pth%22%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20)%2C%0A%5D%0Ademos_map%3A%20dict%5Bstr%2C%20DemoApp%5D%20%3D%20%7Bd.name%3A%20d%20for%20d%20in%20demos%7D%0A`,lang:`python`});var C=c(S,2);u(C,{id:`pick-a-demo-any-demo`,children:(e,t)=>{l(),i(e,r(`Pick a demo, any demo`))},$$slots:{default:!0}});var w=c(C,4);f(w,{code:`DEMO_NAME%20%3D%20%22scribble2image%22%20%20%23%20Change%20this%20value%20to%20change%20the%20active%20demo%20app.%0Aselected_demo%20%3D%20demos_map%5BDEMO_NAME%5D%0A`,lang:`python`});var T=c(w,2);u(T,{id:`setting-up-the-dependencies`,children:(e,t)=>{l(),i(e,r(`Setting up the dependencies`))},$$slots:{default:!0}});var E=c(T,10);m(c(e(E),2),{href:`https://huggingface.co/blog/controlnet`,rel:`nofollow`,children:(e,t)=>{l();var n=y();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);f(D,{code:`def%20download_file(url%3A%20str%2C%20output_path%3A%20pathlib.Path)%3A%0A%20%20%20%20import%20httpx%0A%20%20%20%20from%20tqdm%20import%20tqdm%0A%0A%20%20%20%20with%20open(output_path%2C%20%22wb%22)%20as%20download_file%3A%0A%20%20%20%20%20%20%20%20with%20httpx.stream(%22GET%22%2C%20url%2C%20follow_redirects%3DTrue)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20total%20%3D%20int(response.headers%5B%22Content-Length%22%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20tqdm(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20total%3Dtotal%2C%20unit_scale%3DTrue%2C%20unit_divisor%3D1024%2C%20unit%3D%22B%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20as%20progress%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_bytes_downloaded%20%3D%20response.num_bytes_downloaded%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20chunk%20in%20response.iter_bytes()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20download_file.write(chunk)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20progress.update(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20response.num_bytes_downloaded%20-%20num_bytes_downloaded%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20num_bytes_downloaded%20%3D%20response.num_bytes_downloaded%0A%0A%0Adef%20download_demo_files()%20-%3E%20None%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20The%20ControlNet%20repo%20instructs%3A%20'Make%20sure%20that%20SD%20models%20are%20put%20in%20%22ControlNet%2Fmodels%22.'%0A%20%20%20%20'ControlNet'%20is%20just%20the%20repo%20root%2C%20so%20we%20place%20in%20%2Froot%2Fmodels.%0A%0A%20%20%20%20The%20ControlNet%20repo%20also%20instructs%3A%20'Make%20sure%20that...%20detectors%20are%20put%20in%20%22ControlNet%2Fannotator%2Fckpts%22.'%0A%20%20%20%20'ControlNet'%20is%20just%20the%20repo%20root%2C%20so%20we%20place%20in%20%2Froot%2Fannotator%2Fckpts.%0A%20%20%20%20%22%22%22%0A%20%20%20%20demo%20%3D%20demos_map%5Bos.environ%5B%22DEMO_NAME%22%5D%5D%0A%20%20%20%20models_dir%20%3D%20pathlib.Path(%22%2Froot%2Fmodels%22)%0A%20%20%20%20for%20url%20in%20demo.model_files%3A%0A%20%20%20%20%20%20%20%20filepath%20%3D%20pathlib.Path(url).name%0A%20%20%20%20%20%20%20%20download_file(url%3Durl%2C%20output_path%3Dmodels_dir%20%2F%20filepath)%0A%20%20%20%20%20%20%20%20print(f%22download%20complete%20for%20%7Bfilepath%7D%22)%0A%0A%20%20%20%20detectors_dir%20%3D%20pathlib.Path(%22%2Froot%2Fannotator%2Fckpts%22)%0A%20%20%20%20for%20url%20in%20demo.detector_files%3A%0A%20%20%20%20%20%20%20%20filepath%20%3D%20pathlib.Path(url).name%0A%20%20%20%20%20%20%20%20download_file(url%3Durl%2C%20output_path%3Ddetectors_dir%20%2F%20filepath)%0A%20%20%20%20%20%20%20%20print(f%22download%20complete%20for%20%7Bfilepath%7D%22)%0A%20%20%20%20print(%22%F0%9F%8E%89%20finished%20baking%20demo%20file(s)%20into%20image.%22)%0A%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.10%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%20%20%20%20%22pydantic%3D%3D2.9.1%22%2C%0A%20%20%20%20%20%20%20%20%22starlette%3D%3D0.41.2%22%2C%0A%20%20%20%20%20%20%20%20%22gradio%3D%3D3.16.2%22%2C%0A%20%20%20%20%20%20%20%20%22albumentations%3D%3D1.3.0%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-contrib-python%22%2C%0A%20%20%20%20%20%20%20%20%22imageio%3D%3D2.9.0%22%2C%0A%20%20%20%20%20%20%20%20%22imageio-ffmpeg%3D%3D0.4.2%22%2C%0A%20%20%20%20%20%20%20%20%22pytorch-lightning%3D%3D1.5.0%22%2C%0A%20%20%20%20%20%20%20%20%22omegaconf%3D%3D2.1.1%22%2C%0A%20%20%20%20%20%20%20%20%22test-tube%3E%3D0.7.5%22%2C%0A%20%20%20%20%20%20%20%20%22streamlit%3D%3D1.12.1%22%2C%0A%20%20%20%20%20%20%20%20%22einops%3D%3D0.3.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.19.2%22%2C%0A%20%20%20%20%20%20%20%20%22webdataset%3D%3D0.2.5%22%2C%0A%20%20%20%20%20%20%20%20%22kornia%3D%3D0.6%22%2C%0A%20%20%20%20%20%20%20%20%22open_clip_torch%3D%3D2.0.2%22%2C%0A%20%20%20%20%20%20%20%20%22invisible-watermark%3E%3D0.1.5%22%2C%0A%20%20%20%20%20%20%20%20%22streamlit-drawable-canvas%3D%3D0.8.0%22%2C%0A%20%20%20%20%20%20%20%20%22torchmetrics%3D%3D0.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22timm%3D%3D0.6.12%22%2C%0A%20%20%20%20%20%20%20%20%22addict%3D%3D2.4.0%22%2C%0A%20%20%20%20%20%20%20%20%22yapf%3D%3D0.32.0%22%2C%0A%20%20%20%20%20%20%20%20%22prettytable%3D%3D3.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22safetensors%3D%3D0.2.7%22%2C%0A%20%20%20%20%20%20%20%20%22basicsr%3D%3D1.4.2%22%2C%0A%20%20%20%20%20%20%20%20%22tqdm~%3D4.64.1%22%2C%0A%20%20%20%20)%0A%20%20%20%20%23%20xformers%20library%20offers%20performance%20improvement.%0A%20%20%20%20.uv_pip_install(%22xformers%22%2C%20pre%3DTrue)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20%23%20Here%20we%20place%20the%20latest%20ControlNet%20repository%20code%20into%20%2Froot.%0A%20%20%20%20%23%20Because%20%2Froot%20is%20almost%20empty%2C%20but%20not%20entirely%20empty%2C%20%60git%20clone%60%20won't%20work%2C%0A%20%20%20%20%23%20so%20this%20%60init%60%20then%20%60checkout%60%20workaround%20is%20used.%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20init%20.%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20remote%20add%20--fetch%20origin%20https%3A%2F%2Fgithub.com%2Flllyasviel%2FControlNet.git%22%2C%0A%20%20%20%20%20%20%20%20%22cd%20%2Froot%20%26%26%20git%20checkout%20main%22%2C%0A%20%20%20%20)%0A%20%20%20%20.apt_install(%22ffmpeg%22%2C%20%22libsm6%22%2C%20%22libxext6%22)%0A%20%20%20%20.run_function(%0A%20%20%20%20%20%20%20%20download_demo_files%2C%0A%20%20%20%20%20%20%20%20secrets%3D%5Bmodal.Secret.from_dict(%7B%22DEMO_NAME%22%3A%20DEMO_NAME%7D)%5D%2C%0A%20%20%20%20)%0A)%0Aapp%20%3D%20modal.App(name%3D%22example-controlnet-gradio-demos%22%2C%20image%3Dimage)%0A%0Aweb_app%20%3D%20FastAPI()%0A`,lang:`python`});var O=c(D,2);u(O,{id:`serving-the-gradio-web-ui`,children:(e,t)=>{l(),i(e,r(`Serving the Gradio web UI`))},$$slots:{default:!0}});var k=c(O,4);f(k,{code:`def%20import_gradio_app_blocks(demo%3A%20DemoApp)%3A%0A%20%20%20%20from%20gradio%20import%20blocks%0A%0A%20%20%20%20%23%20The%20ControlNet%20repo%20demo%20scripts%20are%20written%20to%20be%20run%20as%0A%20%20%20%20%23%20standalone%20scripts%2C%20and%20have%20a%20lot%20of%20code%20that%20executes%0A%20%20%20%20%23%20in%20global%20scope%20on%20import%2C%20including%20the%20launch%20of%20a%20Gradio%20web%20server.%0A%20%20%20%20%23%20We%20want%20Modal%20to%20control%20the%20Gradio%20web%20app%20serving%2C%20so%20we%0A%20%20%20%20%23%20monkeypatch%20the%20.launch()%20function%20to%20be%20a%20no-op.%0A%20%20%20%20blocks.Blocks.launch%20%3D%20lambda%20self%2C%20server_name%3A%20print(%0A%20%20%20%20%20%20%20%20%22launch()%20has%20been%20monkeypatched%20to%20do%20nothing.%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20each%20demo%20app%20module%20is%20a%20file%20like%20gradio_%7Bname%7D.py%0A%20%20%20%20module_name%20%3D%20f%22gradio_%7Bdemo.name%7D%22%0A%20%20%20%20mod%20%3D%20importlib.import_module(module_name)%0A%20%20%20%20blocks%20%3D%20mod.block%0A%20%20%20%20%23%20disable%20queueing%20mode%2C%20which%20is%20incompatible%20with%20our%20Modal%20web%20app%20setup.%0A%20%20%20%20blocks.enable_queue%20%3D%20False%0A%20%20%20%20return%20blocks%0A%0A`,lang:`python`});var A=c(k,4);f(A,{code:`%40app.function(%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20max_containers%3D1%2C%0A%20%20%20%20scaledown_window%3D600%2C%0A)%0A%40modal.asgi_app()%0Adef%20run()%3A%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20%23%20mount%20for%20execution%20on%20Modal%0A%20%20%20%20return%20mount_gradio_app(%0A%20%20%20%20%20%20%20%20app%3Dweb_app%2C%0A%20%20%20%20%20%20%20%20blocks%3Dimport_gradio_app_blocks(demo%3Dselected_demo)%2C%0A%20%20%20%20%20%20%20%20path%3D%22%2F%22%2C%0A%20%20%20%20)%0A%0A`,lang:`python`}),u(c(A,2),{id:`have-fun`,children:(e,t)=>{l(),i(e,r(`Have fun!`))},$$slots:{default:!0}}),l(4),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=qFr3LOYC.js.map
