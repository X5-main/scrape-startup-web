(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7d934fbe-49a1-4800-b1b1-96be50c8ec15`,e._sentryDebugIdIdentifier=`sentry-dbid-7d934fbe-49a1-4800-b1b1-96be50c8ec15`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run Facebook’s Segment Anything Model 2 (SAM 2) on Modal`,id:`run-facebooks-segment-anything-model-2-sam-2-on-modal`,children:[{depth:2,value:`Set up dependencies for SAM 2`,id:`set-up-dependencies-for-sam-2`},{depth:2,value:`Wrapping the SAM 2 model in a Modal class`,id:`wrapping-the-sam-2-model-in-a-modal-class`},{depth:2,value:`Segmenting videos from the command line`,id:`segmenting-videos-from-the-command-line`},{depth:2,value:`Helper functions for SAM 2 inference`,id:`helper-functions-for-sam-2-inference`}]}],rawContent:`# Run Facebook's Segment Anything Model 2 (SAM 2) on Modal

This example demonstrates how to deploy Facebook's [SAM 2](https://github.com/facebookresearch/sam2)
on Modal. SAM2 is a powerful, flexible image and video segmentation model that can be used
for various computer vision tasks like object detection, instance segmentation,
and even as a foundation for more complex computer vision applications.
SAM2 extends the capabilities of the original SAM to include video segmentation.

In particular, this example segments [this video](https://www.youtube.com/watch?v=WAz1406SjVw) of a man jumping off the cliff.

The output should look something like this:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/example-segmented-video.mp4" type="video/mp4">
</video>
</center>

## Set up dependencies for SAM 2

First, we set up the necessary dependencies, including \`torch\`,
\`opencv\`, \`huggingface_hub\`, \`torchvision\`, and the \`sam2\` library.

We also install \`ffmpeg\`, which we will use to manipulate videos,
and a Python wrapper called \`ffmpeg-python\` for a clean interface.

\`\`\`python
from pathlib import Path

import modal

MODEL_TYPE = "facebook/sam2-hiera-large"
SAM2_GIT_SHA = (
    "c2ec8e14a185632b0a5d8b161928ceb50197eddc"  # pin commit! research code is fragile
)

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "wget", "python3-opencv", "ffmpeg")
    .uv_pip_install(
        "torch~=2.4.1",
        "torchvision==0.19.1",
        "opencv-python==4.10.0.84",
        "pycocotools~=2.0.8",
        "matplotlib~=3.9.2",
        "onnxruntime==1.19.2",
        "onnx==1.17.0",
        "huggingface_hub==0.25.2",
        "ffmpeg-python==0.2.0",
        f"git+https://github.com/facebookresearch/sam2.git@{SAM2_GIT_SHA}",
    )
)
app = modal.App("example-segment-anything", image=image)


\`\`\`

## Wrapping the SAM 2 model in a Modal class

Next, we define the \`Model\` class that will handle SAM 2 operations for both image and video.

We use the \`@modal.enter()\` decorators here for optimization: it makes sure the initialization
method runs only once, when a new container starts, instead of in the path of every call.
We'll also use a modal Volume to cache the model weights so that they don't need to be downloaded
repeatedly when we start new containers. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
video_vol = modal.Volume.from_name("sam2-inputs", create_if_missing=True)
cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)
cache_dir = "/cache"


@app.cls(
    image=image.env({"HF_HUB_CACHE": cache_dir}),
    volumes={"/root/videos": video_vol, cache_dir: cache_vol},
    gpu="A100",
)
class Model:
    @modal.enter()
    def initialize_model(self):
        """Download and initialize model."""
        from sam2.sam2_video_predictor import SAM2VideoPredictor

        self.video_predictor = SAM2VideoPredictor.from_pretrained(MODEL_TYPE)

    @modal.method()
    def generate_video_masks(self, video="/root/videos/input.mp4", point_coords=None):
        """Generate masks for a video."""
        import ffmpeg
        import numpy as np
        import torch
        from PIL import Image

        frames_dir = convert_video_to_frames(video)

        # scan all the JPEG files in this directory
        frame_names = [
            p
            for p in frames_dir.iterdir()
            if p.suffix in [".jpg", ".jpeg", ".JPG", ".JPEG"]
        ]
        frame_names.sort(key=lambda p: int(p.stem))

        # We are hardcoding the input point and label here
        # In a real-world scenario, you would want to display the video
        # and allow the user to click on the video to select the point
        if point_coords is None:
            width, height = Image.open(frame_names[0]).size
            point_coords = [[width // 2, height // 2]]

        points = np.array(point_coords, dtype=np.float32)
        # for labels, \`1\` means positive click and \`0\` means negative click
        labels = np.array([1] * len(points), np.int32)

        # run the model on GPU
        with (
            torch.inference_mode(),
            torch.autocast("cuda", dtype=torch.bfloat16),
        ):
            self.inference_state = self.video_predictor.init_state(
                video_path=str(frames_dir)
            )

            # add new prompts and instantly get the output on the same frame
            (
                frame_idx,
                object_ids,
                masks,
            ) = self.video_predictor.add_new_points_or_box(
                inference_state=self.inference_state,
                frame_idx=0,
                obj_id=1,
                points=points,
                labels=labels,
            )

            print(f"frame_idx: {frame_idx}, object_ids: {object_ids}, masks: {masks}")

            # run propagation throughout the video and collect the results in a dict
            video_segments = {}  # video_segments contains the per-frame segmentation results
            for (
                out_frame_idx,
                out_obj_ids,
                out_mask_logits,
            ) in self.video_predictor.propagate_in_video(self.inference_state):
                video_segments[out_frame_idx] = {
                    out_obj_id: (out_mask_logits[i] > 0.0).cpu().numpy()
                    for i, out_obj_id in enumerate(out_obj_ids)
                }

        out_dir = Path("/root/mask_frames")
        out_dir.mkdir(exist_ok=True)

        vis_frame_stride = 5  # visualize every 5th frame
        save_segmented_frames(
            video_segments,
            frames_dir,
            out_dir,
            frame_names,
            stride=vis_frame_stride,
        )

        ffmpeg.input(
            f"{out_dir}/frame_*.png",
            pattern_type="glob",
            framerate=30 / vis_frame_stride,
        ).filter(
            "scale",
            "trunc(iw/2)*2",
            "trunc(ih/2)*2",  # round to even dimensions to encode for "dumb players", https://trac.ffmpeg.org/wiki/Encode/H.264#Encodingfordumbplayers
        ).output(str(out_dir / "out.mp4"), format="mp4", pix_fmt="yuv420p").run()

        return (out_dir / "out.mp4").read_bytes()


\`\`\`

## Segmenting videos from the command line

Finally, we define a [\`local_entrypoint\`](https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps)
to run the segmentation from our local machine's terminal.

There are several ways to pass files between the local machine and the Modal Function.

One way is to upload the files onto a Modal [Volume](https://modal.com/docs/guide/volumes),
which acts as a distributed filesystem.

The other way is to convert the file to bytes and pass the bytes back and forth as the input or output of Python functions.
We use this method to get the video file with the segmentation results in it back to the local machine.

\`\`\`python
@app.local_entrypoint()
def main(
    input_video=Path(__file__).parent / "cliff_jumping.mp4",
    x_point=250,
    y_point=200,
):
    with video_vol.batch_upload(force=True) as batch:
        batch.put_file(input_video, "input.mp4")

    model = Model()

    if x_point is not None and y_point is not None:
        point_coords = [[x_point, y_point]]
    else:
        point_coords = None

    print(f"Running SAM 2 on {input_video}")
    video_bytes = model.generate_video_masks.remote(point_coords=point_coords)

    dir = Path("/tmp/sam2_outputs")
    dir.mkdir(exist_ok=True, parents=True)
    output_path = dir / "segmented_video.mp4"
    output_path.write_bytes(video_bytes)
    print(f"Saved output video to {output_path}")


\`\`\`

## Helper functions for SAM 2 inference

Above, we used some helper functions to for some of the details, like breaking the video into frames.
These are defined below.

\`\`\`python
def convert_video_to_frames(self, input_video="/root/videos/input.mp4"):
    import ffmpeg

    input_video = Path(input_video)
    output_dir = (  # output on local filesystem, not on the remote Volume
        input_video.parent.parent / input_video.stem / "video_frames"
    )
    output_dir.mkdir(exist_ok=True, parents=True)

    ffmpeg.input(input_video).output(
        f"{output_dir}/%05d.jpg", qscale=2, start_number=0
    ).run()

    return output_dir


def show_mask(mask, ax, obj_id=None, random_color=False):
    import matplotlib.pyplot as plt
    import numpy as np

    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        cmap = plt.get_cmap("tab10")
        cmap_idx = 0 if obj_id is None else obj_id
        color = np.array([*cmap(cmap_idx)[:3], 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)


def save_segmented_frames(video_segments, frames_dir, out_dir, frame_names, stride=5):
    import io

    import matplotlib.pyplot as plt
    from PIL import Image

    frames_dir, out_dir = Path(frames_dir), Path(out_dir)

    frame_images = []
    inches_per_px = 1 / plt.rcParams["figure.dpi"]
    for out_frame_idx in range(0, len(frame_names), stride):
        frame = Image.open(frames_dir / frame_names[out_frame_idx])
        width, height = frame.size
        width, height = width - width % 2, height - height % 2
        fig, ax = plt.subplots(figsize=(width * inches_per_px, height * inches_per_px))
        ax.axis("off")
        ax.imshow(frame)

        [
            show_mask(mask, ax, obj_id=obj_id)
            for (obj_id, mask) in video_segments[out_frame_idx].items()
        ]

        # Convert plot to PNG bytes
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
        # fig.savefig(buf, format="png")
        buf.seek(0)
        frame_images.append(buf.getvalue())
        plt.close(fig)

    for ii, frame in enumerate(frame_images):
        (out_dir / f"frame_{str(ii).zfill(3)}.png").write_bytes(frame)

\`\`\`
`,meta:{title:`Run Facebook’s Segment Anything Model 2 (SAM 2) on Modal`,description:`This example demonstrates how to deploy Facebook’s SAM 2 on Modal. SAM2 is a powerful, flexible image and video segmentation model that can be used for various computer vision tasks like object detection, instance segmentation, and even as a foundation for more complex computer vision applications. SAM2 extends the capabilities of the original SAM to include video segmentation.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>local_entrypoint</code>`),b=t(`<!> <p>This example demonstrates how to deploy Facebook’s <!> on Modal. SAM2 is a powerful, flexible image and video segmentation model that can be used
for various computer vision tasks like object detection, instance segmentation,
and even as a foundation for more complex computer vision applications.
SAM2 extends the capabilities of the original SAM to include video segmentation.</p> <p>In particular, this example segments <!> of a man jumping off the cliff.</p> <p>The output should look something like this:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/example-segmented-video.mp4" type="video/mp4"/></video></center> <!> <p>First, we set up the necessary dependencies, including <code>torch</code>, <code>opencv</code>, <code>huggingface_hub</code>, <code>torchvision</code>, and the <code>sam2</code> library.</p> <p>We also install <code>ffmpeg</code>, which we will use to manipulate videos,
and a Python wrapper called <code>ffmpeg-python</code> for a clean interface.</p> <!> <!> <p>Next, we define the <code>Model</code> class that will handle SAM 2 operations for both image and video.</p> <p>We use the <code>@modal.enter()</code> decorators here for optimization: it makes sure the initialization
method runs only once, when a new container starts, instead of in the path of every call.
We’ll also use a modal Volume to cache the model weights so that they don’t need to be downloaded
repeatedly when we start new containers. For more on storing model weights on Modal, see <!>.</p> <!> <!> <p>Finally, we define a <!> to run the segmentation from our local machine’s terminal.</p> <p>There are several ways to pass files between the local machine and the Modal Function.</p> <p>One way is to upload the files onto a Modal <!>,
which acts as a distributed filesystem.</p> <p>The other way is to convert the file to bytes and pass the bytes back and forth as the input or output of Python functions.
We use this method to get the video file with the segmentation results in it back to the local machine.</p> <!> <!> <p>Above, we used some helper functions to for some of the details, like breaking the video into frames.
These are defined below.</p> <!>`,3);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`run-facebooks-segment-anything-model-2-sam-2-on-modal`,children:(e,t)=>{l(),i(e,r(`Run Facebook’s Segment Anything Model 2 (SAM 2) on Modal`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://github.com/facebookresearch/sam2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SAM 2`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);m(c(e(g)),{href:`https://www.youtube.com/watch?v=WAz1406SjVw`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this video`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,4),v=e(_);v.muted=!0,n(_);var x=c(_,2);u(x,{id:`set-up-dependencies-for-sam-2`,children:(e,t)=>{l(),i(e,r(`Set up dependencies for SAM 2`))},$$slots:{default:!0}});var S=c(x,6);f(S,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0AMODEL_TYPE%20%3D%20%22facebook%2Fsam2-hiera-large%22%0ASAM2_GIT_SHA%20%3D%20(%0A%20%20%20%20%22c2ec8e14a185632b0a5d8b161928ceb50197eddc%22%20%20%23%20pin%20commit!%20research%20code%20is%20fragile%0A)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.10%22)%0A%20%20%20%20.apt_install(%22git%22%2C%20%22wget%22%2C%20%22python3-opencv%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch~%3D2.4.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.19.1%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python%3D%3D4.10.0.84%22%2C%0A%20%20%20%20%20%20%20%20%22pycocotools~%3D2.0.8%22%2C%0A%20%20%20%20%20%20%20%20%22matplotlib~%3D3.9.2%22%2C%0A%20%20%20%20%20%20%20%20%22onnxruntime%3D%3D1.19.2%22%2C%0A%20%20%20%20%20%20%20%20%22onnx%3D%3D1.17.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%3D%3D0.25.2%22%2C%0A%20%20%20%20%20%20%20%20%22ffmpeg-python%3D%3D0.2.0%22%2C%0A%20%20%20%20%20%20%20%20f%22git%2Bhttps%3A%2F%2Fgithub.com%2Ffacebookresearch%2Fsam2.git%40%7BSAM2_GIT_SHA%7D%22%2C%0A%20%20%20%20)%0A)%0Aapp%20%3D%20modal.App(%22example-segment-anything%22%2C%20image%3Dimage)%0A%0A`,lang:`python`});var C=c(S,2);u(C,{id:`wrapping-the-sam-2-model-in-a-modal-class`,children:(e,t)=>{l(),i(e,r(`Wrapping the SAM 2 model in a Modal class`))},$$slots:{default:!0}});var w=c(C,4);m(c(e(w),3),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);f(T,{code:`video_vol%20%3D%20modal.Volume.from_name(%22sam2-inputs%22%2C%20create_if_missing%3DTrue)%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0Acache_dir%20%3D%20%22%2Fcache%22%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Dimage.env(%7B%22HF_HUB_CACHE%22%3A%20cache_dir%7D)%2C%0A%20%20%20%20volumes%3D%7B%22%2Froot%2Fvideos%22%3A%20video_vol%2C%20cache_dir%3A%20cache_vol%7D%2C%0A%20%20%20%20gpu%3D%22A100%22%2C%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20initialize_model(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Download%20and%20initialize%20model.%22%22%22%0A%20%20%20%20%20%20%20%20from%20sam2.sam2_video_predictor%20import%20SAM2VideoPredictor%0A%0A%20%20%20%20%20%20%20%20self.video_predictor%20%3D%20SAM2VideoPredictor.from_pretrained(MODEL_TYPE)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate_video_masks(self%2C%20video%3D%22%2Froot%2Fvideos%2Finput.mp4%22%2C%20point_coords%3DNone)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Generate%20masks%20for%20a%20video.%22%22%22%0A%20%20%20%20%20%20%20%20import%20ffmpeg%0A%20%20%20%20%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20from%20PIL%20import%20Image%0A%0A%20%20%20%20%20%20%20%20frames_dir%20%3D%20convert_video_to_frames(video)%0A%0A%20%20%20%20%20%20%20%20%23%20scan%20all%20the%20JPEG%20files%20in%20this%20directory%0A%20%20%20%20%20%20%20%20frame_names%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20p%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20p%20in%20frames_dir.iterdir()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20p.suffix%20in%20%5B%22.jpg%22%2C%20%22.jpeg%22%2C%20%22.JPG%22%2C%20%22.JPEG%22%5D%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20frame_names.sort(key%3Dlambda%20p%3A%20int(p.stem))%0A%0A%20%20%20%20%20%20%20%20%23%20We%20are%20hardcoding%20the%20input%20point%20and%20label%20here%0A%20%20%20%20%20%20%20%20%23%20In%20a%20real-world%20scenario%2C%20you%20would%20want%20to%20display%20the%20video%0A%20%20%20%20%20%20%20%20%23%20and%20allow%20the%20user%20to%20click%20on%20the%20video%20to%20select%20the%20point%0A%20%20%20%20%20%20%20%20if%20point_coords%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20width%2C%20height%20%3D%20Image.open(frame_names%5B0%5D).size%0A%20%20%20%20%20%20%20%20%20%20%20%20point_coords%20%3D%20%5B%5Bwidth%20%2F%2F%202%2C%20height%20%2F%2F%202%5D%5D%0A%0A%20%20%20%20%20%20%20%20points%20%3D%20np.array(point_coords%2C%20dtype%3Dnp.float32)%0A%20%20%20%20%20%20%20%20%23%20for%20labels%2C%20%601%60%20means%20positive%20click%20and%20%600%60%20means%20negative%20click%0A%20%20%20%20%20%20%20%20labels%20%3D%20np.array(%5B1%5D%20*%20len(points)%2C%20np.int32)%0A%0A%20%20%20%20%20%20%20%20%23%20run%20the%20model%20on%20GPU%0A%20%20%20%20%20%20%20%20with%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.inference_mode()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.autocast(%22cuda%22%2C%20dtype%3Dtorch.bfloat16)%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.inference_state%20%3D%20self.video_predictor.init_state(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_path%3Dstr(frames_dir)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20add%20new%20prompts%20and%20instantly%20get%20the%20output%20on%20the%20same%20frame%0A%20%20%20%20%20%20%20%20%20%20%20%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20frame_idx%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20object_ids%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20masks%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%3D%20self.video_predictor.add_new_points_or_box(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20inference_state%3Dself.inference_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20frame_idx%3D0%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20obj_id%3D1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20points%3Dpoints%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20labels%3Dlabels%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22frame_idx%3A%20%7Bframe_idx%7D%2C%20object_ids%3A%20%7Bobject_ids%7D%2C%20masks%3A%20%7Bmasks%7D%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20run%20propagation%20throughout%20the%20video%20and%20collect%20the%20results%20in%20a%20dict%0A%20%20%20%20%20%20%20%20%20%20%20%20video_segments%20%3D%20%7B%7D%20%20%23%20video_segments%20contains%20the%20per-frame%20segmentation%20results%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20out_frame_idx%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20out_obj_ids%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20out_mask_logits%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20in%20self.video_predictor.propagate_in_video(self.inference_state)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20video_segments%5Bout_frame_idx%5D%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20out_obj_id%3A%20(out_mask_logits%5Bi%5D%20%3E%200.0).cpu().numpy()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20i%2C%20out_obj_id%20in%20enumerate(out_obj_ids)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20out_dir%20%3D%20Path(%22%2Froot%2Fmask_frames%22)%0A%20%20%20%20%20%20%20%20out_dir.mkdir(exist_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20vis_frame_stride%20%3D%205%20%20%23%20visualize%20every%205th%20frame%0A%20%20%20%20%20%20%20%20save_segmented_frames(%0A%20%20%20%20%20%20%20%20%20%20%20%20video_segments%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20frames_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20out_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20frame_names%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20stride%3Dvis_frame_stride%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20ffmpeg.input(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bout_dir%7D%2Fframe_*.png%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20pattern_type%3D%22glob%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20framerate%3D30%20%2F%20vis_frame_stride%2C%0A%20%20%20%20%20%20%20%20).filter(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22scale%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22trunc(iw%2F2)*2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22trunc(ih%2F2)*2%22%2C%20%20%23%20round%20to%20even%20dimensions%20to%20encode%20for%20%22dumb%20players%22%2C%20https%3A%2F%2Ftrac.ffmpeg.org%2Fwiki%2FEncode%2FH.264%23Encodingfordumbplayers%0A%20%20%20%20%20%20%20%20).output(str(out_dir%20%2F%20%22out.mp4%22)%2C%20format%3D%22mp4%22%2C%20pix_fmt%3D%22yuv420p%22).run()%0A%0A%20%20%20%20%20%20%20%20return%20(out_dir%20%2F%20%22out.mp4%22).read_bytes()%0A%0A`,lang:`python`});var E=c(T,2);u(E,{id:`segmenting-videos-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Segmenting videos from the command line`))},$$slots:{default:!0}});var D=c(E,2);m(c(e(D)),{href:`https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(D);var O=c(D,4);m(c(e(O)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);f(k,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20input_video%3DPath(__file__).parent%20%2F%20%22cliff_jumping.mp4%22%2C%0A%20%20%20%20x_point%3D250%2C%0A%20%20%20%20y_point%3D200%2C%0A)%3A%0A%20%20%20%20with%20video_vol.batch_upload(force%3DTrue)%20as%20batch%3A%0A%20%20%20%20%20%20%20%20batch.put_file(input_video%2C%20%22input.mp4%22)%0A%0A%20%20%20%20model%20%3D%20Model()%0A%0A%20%20%20%20if%20x_point%20is%20not%20None%20and%20y_point%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20point_coords%20%3D%20%5B%5Bx_point%2C%20y_point%5D%5D%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20point_coords%20%3D%20None%0A%0A%20%20%20%20print(f%22Running%20SAM%202%20on%20%7Binput_video%7D%22)%0A%20%20%20%20video_bytes%20%3D%20model.generate_video_masks.remote(point_coords%3Dpoint_coords)%0A%0A%20%20%20%20dir%20%3D%20Path(%22%2Ftmp%2Fsam2_outputs%22)%0A%20%20%20%20dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20output_path%20%3D%20dir%20%2F%20%22segmented_video.mp4%22%0A%20%20%20%20output_path.write_bytes(video_bytes)%0A%20%20%20%20print(f%22Saved%20output%20video%20to%20%7Boutput_path%7D%22)%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`helper-functions-for-sam-2-inference`,children:(e,t)=>{l(),i(e,r(`Helper functions for SAM 2 inference`))},$$slots:{default:!0}}),f(c(A,4),{code:`def%20convert_video_to_frames(self%2C%20input_video%3D%22%2Froot%2Fvideos%2Finput.mp4%22)%3A%0A%20%20%20%20import%20ffmpeg%0A%0A%20%20%20%20input_video%20%3D%20Path(input_video)%0A%20%20%20%20output_dir%20%3D%20(%20%20%23%20output%20on%20local%20filesystem%2C%20not%20on%20the%20remote%20Volume%0A%20%20%20%20%20%20%20%20input_video.parent.parent%20%2F%20input_video.stem%20%2F%20%22video_frames%22%0A%20%20%20%20)%0A%20%20%20%20output_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20ffmpeg.input(input_video).output(%0A%20%20%20%20%20%20%20%20f%22%7Boutput_dir%7D%2F%2505d.jpg%22%2C%20qscale%3D2%2C%20start_number%3D0%0A%20%20%20%20).run()%0A%0A%20%20%20%20return%20output_dir%0A%0A%0Adef%20show_mask(mask%2C%20ax%2C%20obj_id%3DNone%2C%20random_color%3DFalse)%3A%0A%20%20%20%20import%20matplotlib.pyplot%20as%20plt%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20if%20random_color%3A%0A%20%20%20%20%20%20%20%20color%20%3D%20np.concatenate(%5Bnp.random.random(3)%2C%20np.array(%5B0.6%5D)%5D%2C%20axis%3D0)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20cmap%20%3D%20plt.get_cmap(%22tab10%22)%0A%20%20%20%20%20%20%20%20cmap_idx%20%3D%200%20if%20obj_id%20is%20None%20else%20obj_id%0A%20%20%20%20%20%20%20%20color%20%3D%20np.array(%5B*cmap(cmap_idx)%5B%3A3%5D%2C%200.6%5D)%0A%20%20%20%20h%2C%20w%20%3D%20mask.shape%5B-2%3A%5D%0A%20%20%20%20mask_image%20%3D%20mask.reshape(h%2C%20w%2C%201)%20*%20color.reshape(1%2C%201%2C%20-1)%0A%20%20%20%20ax.imshow(mask_image)%0A%0A%0Adef%20save_segmented_frames(video_segments%2C%20frames_dir%2C%20out_dir%2C%20frame_names%2C%20stride%3D5)%3A%0A%20%20%20%20import%20io%0A%0A%20%20%20%20import%20matplotlib.pyplot%20as%20plt%0A%20%20%20%20from%20PIL%20import%20Image%0A%0A%20%20%20%20frames_dir%2C%20out_dir%20%3D%20Path(frames_dir)%2C%20Path(out_dir)%0A%0A%20%20%20%20frame_images%20%3D%20%5B%5D%0A%20%20%20%20inches_per_px%20%3D%201%20%2F%20plt.rcParams%5B%22figure.dpi%22%5D%0A%20%20%20%20for%20out_frame_idx%20in%20range(0%2C%20len(frame_names)%2C%20stride)%3A%0A%20%20%20%20%20%20%20%20frame%20%3D%20Image.open(frames_dir%20%2F%20frame_names%5Bout_frame_idx%5D)%0A%20%20%20%20%20%20%20%20width%2C%20height%20%3D%20frame.size%0A%20%20%20%20%20%20%20%20width%2C%20height%20%3D%20width%20-%20width%20%25%202%2C%20height%20-%20height%20%25%202%0A%20%20%20%20%20%20%20%20fig%2C%20ax%20%3D%20plt.subplots(figsize%3D(width%20*%20inches_per_px%2C%20height%20*%20inches_per_px))%0A%20%20%20%20%20%20%20%20ax.axis(%22off%22)%0A%20%20%20%20%20%20%20%20ax.imshow(frame)%0A%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20show_mask(mask%2C%20ax%2C%20obj_id%3Dobj_id)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20(obj_id%2C%20mask)%20in%20video_segments%5Bout_frame_idx%5D.items()%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Convert%20plot%20to%20PNG%20bytes%0A%20%20%20%20%20%20%20%20buf%20%3D%20io.BytesIO()%0A%20%20%20%20%20%20%20%20fig.savefig(buf%2C%20format%3D%22png%22%2C%20bbox_inches%3D%22tight%22%2C%20pad_inches%3D0)%0A%20%20%20%20%20%20%20%20%23%20fig.savefig(buf%2C%20format%3D%22png%22)%0A%20%20%20%20%20%20%20%20buf.seek(0)%0A%20%20%20%20%20%20%20%20frame_images.append(buf.getvalue())%0A%20%20%20%20%20%20%20%20plt.close(fig)%0A%0A%20%20%20%20for%20ii%2C%20frame%20in%20enumerate(frame_images)%3A%0A%20%20%20%20%20%20%20%20(out_dir%20%2F%20f%22frame_%7Bstr(ii).zfill(3)%7D.png%22).write_bytes(frame)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=Dk6rFigt2.js.map
