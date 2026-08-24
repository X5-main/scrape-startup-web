(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`43dcd26e-7ab6-4a6a-b3cb-5d542c230543`,e._sentryDebugIdIdentifier=`sentry-dbid-43dcd26e-7ab6-4a6a-b3cb-5d542c230543`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as ne}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";var f={toc:[{depth:1,value:`Fine-tune open source YOLO models for object detection`,id:`fine-tune-open-source-yolo-models-for-object-detection`,children:[{depth:2,value:`Set up the environment`,id:`set-up-the-environment`},{depth:2,value:`Download a dataset`,id:`download-a-dataset`},{depth:2,value:`Train a model`,id:`train-a-model`},{depth:2,value:`Run inference on single inputs and on streams`,id:`run-inference-on-single-inputs-and-on-streams`},{depth:2,value:`Running the example`,id:`running-the-example`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Fine-tune open source YOLO models for object detection

Example by [@Erik-Dunteman](https://github.com/erik-dunteman) and [@AnirudhRahul](https://github.com/AnirudhRahul/).

The popular "You Only Look Once" (YOLO) model line provides high-quality object detection in an economical package.
In this example, we use the [YOLOv10](https://docs.ultralytics.com/models/yolov10/) model, released on May 23, 2024.

We will:

- Download two custom datasets from the [Roboflow](https://roboflow.com/) computer vision platform: a dataset of cats and a dataset of dogs

- Fine-tune the model on those datasets, in parallel, using the [Ultralytics package](https://docs.ultralytics.com/)

- Run inference with the fine-tuned models on single images and on streaming frames

For commercial use, be sure to consult the [Ultralytics software license options](https://docs.ultralytics.com/#yolo-licenses-how-is-ultralytics-yolo-licensed),
which include AGPL-3.0.

## Set up the environment

\`\`\`python
import warnings
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import modal

\`\`\`

Modal runs your code in the cloud inside containers. So to use it, we have to define the dependencies
of our code as part of the container's [image](https://modal.com/docs/guide/custom-container).

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(  # install system libraries for graphics handling, model download
        ["libgl1-mesa-glx", "libglib2.0-0", "curl"]
    )
    .uv_pip_install(  # install python libraries for computer vision
        ["ultralytics~=8.2.68", "roboflow~=1.1.37", "opencv-python~=4.10.0"]
    )
    .uv_pip_install(  # add an optional extra that renders images in the terminal
        "term-image==0.7.1"
    )
)

\`\`\`

We also create a persistent [Volume](https://modal.com/docs/guide/volumes) for storing datasets, trained weights, and inference outputs. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
volume = modal.Volume.from_name("example-yolo-finetune", create_if_missing=True)
volume_path = (  # the path to the volume from within the container
    Path("/root") / "data"
)

\`\`\`

We attach both of these to a Modal [App](https://modal.com/docs/guide/apps).

\`\`\`python
app = modal.App("example-yolo-finetune", image=image, volumes={volume_path: volume})


\`\`\`

## Download a dataset

We'll be downloading our data from the [Roboflow](https://roboflow.com/) computer vision platform, so to follow along you'll need to:

- Create a free account on [Roboflow](https://app.roboflow.com/)

- [Generate a Private API key](https://app.roboflow.com/settings/api)

- Set up a Modal [Secret](https://modal.com/docs/guide/secrets) called \`roboflow-api-key\` in the Modal UI [here](https://modal.com/secrets),
setting the \`ROBOFLOW_API_KEY\` to the value of your API key.

You're also free to bring your own dataset with a config in YOLOv10-compatible yaml format.

We'll be training on the medium size model, but you're free to experiment with [other model sizes](https://docs.ultralytics.com/models/yolov10/#model-variants).

\`\`\`python
@dataclass
class DatasetConfig:
    """Information required to download a dataset from Roboflow."""

    workspace_id: str
    project_id: str
    version: int
    format: str
    target_class: str

    @property
    def id(self) -> str:
        return f"{self.workspace_id}/{self.project_id}/{self.version}"


@app.function(
    secrets=[
        modal.Secret.from_name("roboflow-api-key", required_keys=["ROBOFLOW_API_KEY"])
    ]
)
def download_dataset(config: DatasetConfig):
    import os

    from roboflow import Roboflow

    rf = Roboflow(api_key=os.getenv("ROBOFLOW_API_KEY"))
    project = (
        rf.workspace(config.workspace_id)
        .project(config.project_id)
        .version(config.version)
    )
    dataset_dir = volume_path / "dataset" / config.id
    project.download(config.format, location=str(dataset_dir))


\`\`\`

## Train a model

We train the model on a single A100 GPU. Training usually takes only a few minutes.

\`\`\`python
MINUTES = 60

TRAIN_GPU_COUNT = 1
TRAIN_GPU = f"A100:{TRAIN_GPU_COUNT}"
TRAIN_CPU_COUNT = 4


@app.function(
    gpu=TRAIN_GPU,
    cpu=TRAIN_CPU_COUNT,
    timeout=60 * MINUTES,
)
def train(
    model_id: str,
    dataset: DatasetConfig,
    model_size="yolov10m.pt",
    quick_check=False,
):
    from ultralytics import YOLO

    volume.reload()  # make sure volume is synced

    model_path = volume_path / "runs" / model_id
    model_path.mkdir(parents=True, exist_ok=True)

    data_path = volume_path / "dataset" / dataset.id / "data.yaml"

    model = YOLO(model_size)
    model.train(
        # dataset config
        data=data_path,
        fraction=0.4
        if not quick_check
        else 0.04,  # fraction of dataset to use for training/validation
        # optimization config
        device=list(range(TRAIN_GPU_COUNT)),  # use the GPU(s)
        epochs=8 if not quick_check else 1,  # pass over entire dataset this many times
        batch=0.95,  # automatic batch size to target fraction of GPU util
        seed=117,  # set seed for reproducibility
        # data processing config
        workers=max(
            TRAIN_CPU_COUNT // TRAIN_GPU_COUNT, 1
        ),  # split CPUs evenly across GPUs
        cache=False,  # cache preprocessed images in RAM?
        # model saving config
        project=f"{volume_path}/runs",
        name=model_id,
        exist_ok=True,  # overwrite previous model if it exists
        verbose=True,  # detailed logs
    )


\`\`\`

## Run inference on single inputs and on streams

We demonstrate two different ways to run inference -- on single images and on a stream of images.

The images we use for inference are loaded from the test set, which was added to our Volume when we downloaded the dataset.
Each image read takes ~50ms, and inference can take ~5ms, so the disk read would be our biggest bottleneck if we just looped over the image paths.
To avoid it, we parallelize the disk reads across many workers using Modal's [\`.map\`](https://modal.com/docs/guide/scale),
streaming the images to the model. This roughly mimics the behavior of an interactive object detection pipeline.
This can increase throughput up to ~60 images/s, or ~17 milliseconds/image, depending on image size.

\`\`\`python
@app.function()
def read_image(image_path: str):
    import cv2

    source = cv2.imread(image_path)
    return source


\`\`\`

We use the \`@enter\` feature of [\`modal.Cls\`](https://modal.com/docs/guide/lifecycle-functions)
to load the model only once on container start and reuse it for future inferences.
We use a generator to stream images to the model.

\`\`\`python
@app.cls(gpu="a10g")
class Inference:
    weights_path: str = modal.parameter()

    @modal.enter()
    def load_model(self):
        from ultralytics import YOLO

        self.model = YOLO(self.weights_path)

    @modal.method()
    def predict(self, model_id: str, image_path: str, display: bool = False):
        """A simple method for running inference on one image at a time."""
        results = self.model.predict(
            image_path,
            half=True,  # use fp16
            save=True,
            exist_ok=True,
            project=f"{volume_path}/predictions/{model_id}",
        )
        if display:
            from term_image.image import from_file

            terminal_image = from_file(results[0].path)
            terminal_image.draw()
        # you can view the output file via the Volumes UI in the Modal dashboard -- https://modal.com/storage

    @modal.method()
    def streaming_count(self, batch_dir: str, threshold: float | None = None):
        """Counts the number of objects in a directory of images.

        Intended as a demonstration of high-throughput streaming inference."""
        import os
        import time

        image_files = [os.path.join(batch_dir, f) for f in os.listdir(batch_dir)]

        completed, start = 0, time.monotonic_ns()
        for image in read_image.map(image_files):
            # note that we run predict on a single input at a time.
            # each individual inference is usually done before the next image arrives, so there's no throughput benefit to batching.
            results = self.model.predict(
                image,
                half=True,  # use fp16
                save=False,  # don't save to disk, as it slows down the pipeline significantly
                verbose=False,
            )
            completed += 1
            for res in results:
                for conf in res.boxes.conf:
                    if threshold is None:
                        yield 1
                        continue
                    if conf.item() >= threshold:
                        yield 1
            yield 0

        elapsed_seconds = (time.monotonic_ns() - start) / 1e9
        print(
            "Inferences per second:",
            round(completed / elapsed_seconds, 2),
        )


\`\`\`

## Running the example

We'll kick off our parallel training jobs and run inference from the command line.

\`\`\`bash
modal run finetune_yolo.py
\`\`\`

This runs the training in \`quick_check\` mode, useful for debugging the pipeline and getting a feel for it.
To do a longer run that actually meaningfully improves performance, use:

\`\`\`bash
modal run finetune_yolo.py --no-quick-check
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(quick_check: bool = True, inference_only: bool = False):
    """Run fine-tuning and inference on two datasets.

    Args:
        quick_check: fine-tune on a small subset. Lower quality results, but faster iteration.
        inference_only: skip fine-tuning and only run inference
    """

    dogs = DatasetConfig(
        workspace_id="cv-project-v2",
        project_id="6-dog-breeds",
        version=1,
        format="yolov9",
        target_class="🐶",
    )
    cats = DatasetConfig(
        workspace_id="jus-workspace",
        project_id="cats-w7ohy",
        version=3,
        format="yolov9",
        target_class="🐱",
    )
    datasets = [dogs, cats]

    # .for_each runs a function once on each element of the input iterators
    # here, that means download each dataset, in parallel
    if not inference_only:
        download_dataset.for_each(datasets)

    today = datetime.now().strftime("%Y-%m-%d")
    model_ids = [dataset.id + f"/{today}" for dataset in datasets]

    if not inference_only:
        train.for_each(model_ids, datasets, kwargs={"quick_check": quick_check})

    # let's run inference!
    for model_id, dataset in zip(model_ids, datasets):
        inference = Inference(
            weights_path=str(volume_path / "runs" / model_id / "weights" / "best.pt")
        )

        # predict on a single image and save output to the volume
        test_images = volume.listdir(
            str(Path("dataset") / dataset.id / "test" / "images")
        )
        # run inference on the first 5 images
        for ii, image in enumerate(test_images):
            print(f"{model_id}: Single image prediction on image", image.path)
            inference.predict.remote(
                model_id=model_id,
                image_path=f"{volume_path}/{image.path}",
                display=(
                    ii == 0  # display inference results only on first image
                ),
            )
            if ii >= 4:
                break

        # streaming inference on images from the test set
        print(f"{model_id}: Streaming inferences on all images in the test set...")
        count = 0
        for detection in inference.streaming_count.remote_gen(
            batch_dir=f"{volume_path}/dataset/{dataset.id}/test/images"
        ):
            if detection:
                print(f"{dataset.target_class}", end="")
                count += 1
            else:
                print("🎞️", end="", flush=True)
        print(f"\\n{model_id}: Counted {count} {dataset.target_class}s!")


\`\`\`

## Addenda

The rest of the code in this example is utility code.

\`\`\`python
warnings.filterwarnings(  # filter warning from the terminal image library
    "ignore",
    message="It seems this process is not running within a terminal. Hence, some features will behave differently or be disabled.",
    category=UserWarning,
)

\`\`\`
`,meta:{title:`Fine-tune open source YOLO models for object detection`,description:`Example by @Erik-Dunteman and @AnirudhRahul.`}},{toc:p,rawContent:m,meta:h}=f,re=t(`<code>.map</code>`),ie=t(`<code>modal.Cls</code>`),ae=t(`<!> <p>Example by <!> and <!>.</p> <p>The popular “You Only Look Once” (YOLO) model line provides high-quality object detection in an economical package.
In this example, we use the <!> model, released on May 23, 2024.</p> <p>We will:</p> <ul><li><p>Download two custom datasets from the <!> computer vision platform: a dataset of cats and a dataset of dogs</p></li> <li><p>Fine-tune the model on those datasets, in parallel, using the <!></p></li> <li><p>Run inference with the fine-tuned models on single images and on streaming frames</p></li></ul> <p>For commercial use, be sure to consult the <!>,
which include AGPL-3.0.</p> <!> <!> <p>Modal runs your code in the cloud inside containers. So to use it, we have to define the dependencies
of our code as part of the container’s <!>.</p> <!> <p>We also create a persistent <!> for storing datasets, trained weights, and inference outputs. For more on storing model weights on Modal, see <!>.</p> <!> <p>We attach both of these to a Modal <!>.</p> <!> <!> <p>We’ll be downloading our data from the <!> computer vision platform, so to follow along you’ll need to:</p> <ul><li><p>Create a free account on <!></p></li> <li><p><!></p></li> <li><p>Set up a Modal <!> called <code>roboflow-api-key</code> in the Modal UI <!>,
setting the <code>ROBOFLOW_API_KEY</code> to the value of your API key.</p></li></ul> <p>You’re also free to bring your own dataset with a config in YOLOv10-compatible yaml format.</p> <p>We’ll be training on the medium size model, but you’re free to experiment with <!>.</p> <!> <!> <p>We train the model on a single A100 GPU. Training usually takes only a few minutes.</p> <!> <!> <p>We demonstrate two different ways to run inference — on single images and on a stream of images.</p> <p>The images we use for inference are loaded from the test set, which was added to our Volume when we downloaded the dataset.
Each image read takes ~50ms, and inference can take ~5ms, so the disk read would be our biggest bottleneck if we just looped over the image paths.
To avoid it, we parallelize the disk reads across many workers using Modal’s <!>,
streaming the images to the model. This roughly mimics the behavior of an interactive object detection pipeline.
This can increase throughput up to ~60 images/s, or ~17 milliseconds/image, depending on image size.</p> <!> <p>We use the <code>@enter</code> feature of <!> to load the model only once on container start and reuse it for future inferences.
We use a generator to stream images to the model.</p> <!> <!> <p>We’ll kick off our parallel training jobs and run inference from the command line.</p> <!> <p>This runs the training in <code>quick_check</code> mode, useful for debugging the pipeline and getting a feel for it.
To do a longer run that actually meaningfully improves performance, use:</p> <!> <!> <!> <p>The rest of the code in this example is utility code.</p> <!>`,1);function g(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ae(),u=te(a);ne(u,{id:`fine-tune-open-source-yolo-models-for-object-detection`,children:(e,t)=>{s(),i(e,r(`Fine-tune open source YOLO models for object detection`))},$$slots:{default:!0}});var f=o(u,2),p=o(e(f));d(p,{href:`https://github.com/erik-dunteman`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`@Erik-Dunteman`))},$$slots:{default:!0}}),d(o(p,2),{href:`https://github.com/AnirudhRahul/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`@AnirudhRahul`))},$$slots:{default:!0}}),s(),n(f);var m=o(f,2);d(o(e(m)),{href:`https://docs.ultralytics.com/models/yolov10/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`YOLOv10`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4),g=e(h),_=e(g);d(o(e(_)),{href:`https://roboflow.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Roboflow`))},$$slots:{default:!0}}),s(),n(_),n(g);var v=o(g,2),y=e(v);d(o(e(y)),{href:`https://docs.ultralytics.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ultralytics package`))},$$slots:{default:!0}}),n(y),n(v),s(2),n(h);var b=o(h,2);d(o(e(b)),{href:`https://docs.ultralytics.com/#yolo-licenses-how-is-ultralytics-yolo-licensed`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Ultralytics software license options`))},$$slots:{default:!0}}),s(),n(b);var x=o(b,2);c(x,{id:`set-up-the-environment`,children:(e,t)=>{s(),i(e,r(`Set up the environment`))},$$slots:{default:!0}});var S=o(x,2);l(S,{code:`import%20warnings%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20datetime%20import%20datetime%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var C=o(S,2);d(o(e(C)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`image`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);l(w,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.10%22)%0A%20%20%20%20.apt_install(%20%20%23%20install%20system%20libraries%20for%20graphics%20handling%2C%20model%20download%0A%20%20%20%20%20%20%20%20%5B%22libgl1-mesa-glx%22%2C%20%22libglib2.0-0%22%2C%20%22curl%22%5D%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%20%20%23%20install%20python%20libraries%20for%20computer%20vision%0A%20%20%20%20%20%20%20%20%5B%22ultralytics~%3D8.2.68%22%2C%20%22roboflow~%3D1.1.37%22%2C%20%22opencv-python~%3D4.10.0%22%5D%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%20%20%23%20add%20an%20optional%20extra%20that%20renders%20images%20in%20the%20terminal%0A%20%20%20%20%20%20%20%20%22term-image%3D%3D0.7.1%22%0A%20%20%20%20)%0A)%0A`,lang:`python`});var T=o(w,2),E=o(e(T));d(E,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),d(o(E,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(T);var D=o(T,2);l(D,{code:`volume%20%3D%20modal.Volume.from_name(%22example-yolo-finetune%22%2C%20create_if_missing%3DTrue)%0Avolume_path%20%3D%20(%20%20%23%20the%20path%20to%20the%20volume%20from%20within%20the%20container%0A%20%20%20%20Path(%22%2Froot%22)%20%2F%20%22data%22%0A)%0A`,lang:`python`});var O=o(D,2);d(o(e(O)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`App`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);l(k,{code:`app%20%3D%20modal.App(%22example-yolo-finetune%22%2C%20image%3Dimage%2C%20volumes%3D%7Bvolume_path%3A%20volume%7D)%0A%0A`,lang:`python`});var A=o(k,2);c(A,{id:`download-a-dataset`,children:(e,t)=>{s(),i(e,r(`Download a dataset`))},$$slots:{default:!0}});var j=o(A,2);d(o(e(j)),{href:`https://roboflow.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Roboflow`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,2),N=e(M),P=e(N);d(o(e(P)),{href:`https://app.roboflow.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Roboflow`))},$$slots:{default:!0}}),n(P),n(N);var F=o(N,2),I=e(F);d(e(I),{href:`https://app.roboflow.com/settings/api`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Generate a Private API key`))},$$slots:{default:!0}}),n(I),n(F);var L=o(F,2),R=e(L),z=o(e(R));d(z,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Secret`))},$$slots:{default:!0}}),d(o(z,4),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(3),n(R),n(L),n(M);var B=o(M,4);d(o(e(B)),{href:`https://docs.ultralytics.com/models/yolov10/#model-variants`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`other model sizes`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);l(V,{code:`%40dataclass%0Aclass%20DatasetConfig%3A%0A%20%20%20%20%22%22%22Information%20required%20to%20download%20a%20dataset%20from%20Roboflow.%22%22%22%0A%0A%20%20%20%20workspace_id%3A%20str%0A%20%20%20%20project_id%3A%20str%0A%20%20%20%20version%3A%20int%0A%20%20%20%20format%3A%20str%0A%20%20%20%20target_class%3A%20str%0A%0A%20%20%20%20%40property%0A%20%20%20%20def%20id(self)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20return%20f%22%7Bself.workspace_id%7D%2F%7Bself.project_id%7D%2F%7Bself.version%7D%22%0A%0A%0A%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22roboflow-api-key%22%2C%20required_keys%3D%5B%22ROBOFLOW_API_KEY%22%5D)%0A%20%20%20%20%5D%0A)%0Adef%20download_dataset(config%3A%20DatasetConfig)%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20from%20roboflow%20import%20Roboflow%0A%0A%20%20%20%20rf%20%3D%20Roboflow(api_key%3Dos.getenv(%22ROBOFLOW_API_KEY%22))%0A%20%20%20%20project%20%3D%20(%0A%20%20%20%20%20%20%20%20rf.workspace(config.workspace_id)%0A%20%20%20%20%20%20%20%20.project(config.project_id)%0A%20%20%20%20%20%20%20%20.version(config.version)%0A%20%20%20%20)%0A%20%20%20%20dataset_dir%20%3D%20volume_path%20%2F%20%22dataset%22%20%2F%20config.id%0A%20%20%20%20project.download(config.format%2C%20location%3Dstr(dataset_dir))%0A%0A`,lang:`python`});var H=o(V,2);c(H,{id:`train-a-model`,children:(e,t)=>{s(),i(e,r(`Train a model`))},$$slots:{default:!0}});var U=o(H,4);l(U,{code:`MINUTES%20%3D%2060%0A%0ATRAIN_GPU_COUNT%20%3D%201%0ATRAIN_GPU%20%3D%20f%22A100%3A%7BTRAIN_GPU_COUNT%7D%22%0ATRAIN_CPU_COUNT%20%3D%204%0A%0A%0A%40app.function(%0A%20%20%20%20gpu%3DTRAIN_GPU%2C%0A%20%20%20%20cpu%3DTRAIN_CPU_COUNT%2C%0A%20%20%20%20timeout%3D60%20*%20MINUTES%2C%0A)%0Adef%20train(%0A%20%20%20%20model_id%3A%20str%2C%0A%20%20%20%20dataset%3A%20DatasetConfig%2C%0A%20%20%20%20model_size%3D%22yolov10m.pt%22%2C%0A%20%20%20%20quick_check%3DFalse%2C%0A)%3A%0A%20%20%20%20from%20ultralytics%20import%20YOLO%0A%0A%20%20%20%20volume.reload()%20%20%23%20make%20sure%20volume%20is%20synced%0A%0A%20%20%20%20model_path%20%3D%20volume_path%20%2F%20%22runs%22%20%2F%20model_id%0A%20%20%20%20model_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20data_path%20%3D%20volume_path%20%2F%20%22dataset%22%20%2F%20dataset.id%20%2F%20%22data.yaml%22%0A%0A%20%20%20%20model%20%3D%20YOLO(model_size)%0A%20%20%20%20model.train(%0A%20%20%20%20%20%20%20%20%23%20dataset%20config%0A%20%20%20%20%20%20%20%20data%3Ddata_path%2C%0A%20%20%20%20%20%20%20%20fraction%3D0.4%0A%20%20%20%20%20%20%20%20if%20not%20quick_check%0A%20%20%20%20%20%20%20%20else%200.04%2C%20%20%23%20fraction%20of%20dataset%20to%20use%20for%20training%2Fvalidation%0A%20%20%20%20%20%20%20%20%23%20optimization%20config%0A%20%20%20%20%20%20%20%20device%3Dlist(range(TRAIN_GPU_COUNT))%2C%20%20%23%20use%20the%20GPU(s)%0A%20%20%20%20%20%20%20%20epochs%3D8%20if%20not%20quick_check%20else%201%2C%20%20%23%20pass%20over%20entire%20dataset%20this%20many%20times%0A%20%20%20%20%20%20%20%20batch%3D0.95%2C%20%20%23%20automatic%20batch%20size%20to%20target%20fraction%20of%20GPU%20util%0A%20%20%20%20%20%20%20%20seed%3D117%2C%20%20%23%20set%20seed%20for%20reproducibility%0A%20%20%20%20%20%20%20%20%23%20data%20processing%20config%0A%20%20%20%20%20%20%20%20workers%3Dmax(%0A%20%20%20%20%20%20%20%20%20%20%20%20TRAIN_CPU_COUNT%20%2F%2F%20TRAIN_GPU_COUNT%2C%201%0A%20%20%20%20%20%20%20%20)%2C%20%20%23%20split%20CPUs%20evenly%20across%20GPUs%0A%20%20%20%20%20%20%20%20cache%3DFalse%2C%20%20%23%20cache%20preprocessed%20images%20in%20RAM%3F%0A%20%20%20%20%20%20%20%20%23%20model%20saving%20config%0A%20%20%20%20%20%20%20%20project%3Df%22%7Bvolume_path%7D%2Fruns%22%2C%0A%20%20%20%20%20%20%20%20name%3Dmodel_id%2C%0A%20%20%20%20%20%20%20%20exist_ok%3DTrue%2C%20%20%23%20overwrite%20previous%20model%20if%20it%20exists%0A%20%20%20%20%20%20%20%20verbose%3DTrue%2C%20%20%23%20detailed%20logs%0A%20%20%20%20)%0A%0A`,lang:`python`});var W=o(U,2);c(W,{id:`run-inference-on-single-inputs-and-on-streams`,children:(e,t)=>{s(),i(e,r(`Run inference on single inputs and on streams`))},$$slots:{default:!0}});var G=o(W,4);d(o(e(G)),{href:`https://modal.com/docs/guide/scale`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(G);var K=o(G,2);l(K,{code:`%40app.function()%0Adef%20read_image(image_path%3A%20str)%3A%0A%20%20%20%20import%20cv2%0A%0A%20%20%20%20source%20%3D%20cv2.imread(image_path)%0A%20%20%20%20return%20source%0A%0A`,lang:`python`});var q=o(K,2);d(o(e(q),3),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(q);var J=o(q,2);l(J,{code:`%40app.cls(gpu%3D%22a10g%22)%0Aclass%20Inference%3A%0A%20%20%20%20weights_path%3A%20str%20%3D%20modal.parameter()%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20from%20ultralytics%20import%20YOLO%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20YOLO(self.weights_path)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20predict(self%2C%20model_id%3A%20str%2C%20image_path%3A%20str%2C%20display%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20%20%20%20%20%22%22%22A%20simple%20method%20for%20running%20inference%20on%20one%20image%20at%20a%20time.%22%22%22%0A%20%20%20%20%20%20%20%20results%20%3D%20self.model.predict(%0A%20%20%20%20%20%20%20%20%20%20%20%20image_path%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20half%3DTrue%2C%20%20%23%20use%20fp16%0A%20%20%20%20%20%20%20%20%20%20%20%20save%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20exist_ok%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20project%3Df%22%7Bvolume_path%7D%2Fpredictions%2F%7Bmodel_id%7D%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20display%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20from%20term_image.image%20import%20from_file%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20terminal_image%20%3D%20from_file(results%5B0%5D.path)%0A%20%20%20%20%20%20%20%20%20%20%20%20terminal_image.draw()%0A%20%20%20%20%20%20%20%20%23%20you%20can%20view%20the%20output%20file%20via%20the%20Volumes%20UI%20in%20the%20Modal%20dashboard%20--%20https%3A%2F%2Fmodal.com%2Fstorage%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20streaming_count(self%2C%20batch_dir%3A%20str%2C%20threshold%3A%20float%20%7C%20None%20%3D%20None)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Counts%20the%20number%20of%20objects%20in%20a%20directory%20of%20images.%0A%0A%20%20%20%20%20%20%20%20Intended%20as%20a%20demonstration%20of%20high-throughput%20streaming%20inference.%22%22%22%0A%20%20%20%20%20%20%20%20import%20os%0A%20%20%20%20%20%20%20%20import%20time%0A%0A%20%20%20%20%20%20%20%20image_files%20%3D%20%5Bos.path.join(batch_dir%2C%20f)%20for%20f%20in%20os.listdir(batch_dir)%5D%0A%0A%20%20%20%20%20%20%20%20completed%2C%20start%20%3D%200%2C%20time.monotonic_ns()%0A%20%20%20%20%20%20%20%20for%20image%20in%20read_image.map(image_files)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20note%20that%20we%20run%20predict%20on%20a%20single%20input%20at%20a%20time.%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20each%20individual%20inference%20is%20usually%20done%20before%20the%20next%20image%20arrives%2C%20so%20there's%20no%20throughput%20benefit%20to%20batching.%0A%20%20%20%20%20%20%20%20%20%20%20%20results%20%3D%20self.model.predict(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20half%3DTrue%2C%20%20%23%20use%20fp16%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20save%3DFalse%2C%20%20%23%20don't%20save%20to%20disk%2C%20as%20it%20slows%20down%20the%20pipeline%20significantly%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20verbose%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20completed%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20res%20in%20results%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20conf%20in%20res.boxes.conf%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20threshold%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%201%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20conf.item()%20%3E%3D%20threshold%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%201%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%200%0A%0A%20%20%20%20%20%20%20%20elapsed_seconds%20%3D%20(time.monotonic_ns()%20-%20start)%20%2F%201e9%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Inferences%20per%20second%3A%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20round(completed%20%2F%20elapsed_seconds%2C%202)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var Y=o(J,2);c(Y,{id:`running-the-example`,children:(e,t)=>{s(),i(e,r(`Running the example`))},$$slots:{default:!0}});var X=o(Y,4);l(X,{code:`modal%20run%20finetune_yolo.py`,lang:`bash`});var Z=o(X,4);l(Z,{code:`modal%20run%20finetune_yolo.py%20--no-quick-check`,lang:`bash`});var Q=o(Z,2);l(Q,{code:`%40app.local_entrypoint()%0Adef%20main(quick_check%3A%20bool%20%3D%20True%2C%20inference_only%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20%22%22%22Run%20fine-tuning%20and%20inference%20on%20two%20datasets.%0A%0A%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20quick_check%3A%20fine-tune%20on%20a%20small%20subset.%20Lower%20quality%20results%2C%20but%20faster%20iteration.%0A%20%20%20%20%20%20%20%20inference_only%3A%20skip%20fine-tuning%20and%20only%20run%20inference%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20dogs%20%3D%20DatasetConfig(%0A%20%20%20%20%20%20%20%20workspace_id%3D%22cv-project-v2%22%2C%0A%20%20%20%20%20%20%20%20project_id%3D%226-dog-breeds%22%2C%0A%20%20%20%20%20%20%20%20version%3D1%2C%0A%20%20%20%20%20%20%20%20format%3D%22yolov9%22%2C%0A%20%20%20%20%20%20%20%20target_class%3D%22%F0%9F%90%B6%22%2C%0A%20%20%20%20)%0A%20%20%20%20cats%20%3D%20DatasetConfig(%0A%20%20%20%20%20%20%20%20workspace_id%3D%22jus-workspace%22%2C%0A%20%20%20%20%20%20%20%20project_id%3D%22cats-w7ohy%22%2C%0A%20%20%20%20%20%20%20%20version%3D3%2C%0A%20%20%20%20%20%20%20%20format%3D%22yolov9%22%2C%0A%20%20%20%20%20%20%20%20target_class%3D%22%F0%9F%90%B1%22%2C%0A%20%20%20%20)%0A%20%20%20%20datasets%20%3D%20%5Bdogs%2C%20cats%5D%0A%0A%20%20%20%20%23%20.for_each%20runs%20a%20function%20once%20on%20each%20element%20of%20the%20input%20iterators%0A%20%20%20%20%23%20here%2C%20that%20means%20download%20each%20dataset%2C%20in%20parallel%0A%20%20%20%20if%20not%20inference_only%3A%0A%20%20%20%20%20%20%20%20download_dataset.for_each(datasets)%0A%0A%20%20%20%20today%20%3D%20datetime.now().strftime(%22%25Y-%25m-%25d%22)%0A%20%20%20%20model_ids%20%3D%20%5Bdataset.id%20%2B%20f%22%2F%7Btoday%7D%22%20for%20dataset%20in%20datasets%5D%0A%0A%20%20%20%20if%20not%20inference_only%3A%0A%20%20%20%20%20%20%20%20train.for_each(model_ids%2C%20datasets%2C%20kwargs%3D%7B%22quick_check%22%3A%20quick_check%7D)%0A%0A%20%20%20%20%23%20let's%20run%20inference!%0A%20%20%20%20for%20model_id%2C%20dataset%20in%20zip(model_ids%2C%20datasets)%3A%0A%20%20%20%20%20%20%20%20inference%20%3D%20Inference(%0A%20%20%20%20%20%20%20%20%20%20%20%20weights_path%3Dstr(volume_path%20%2F%20%22runs%22%20%2F%20model_id%20%2F%20%22weights%22%20%2F%20%22best.pt%22)%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20predict%20on%20a%20single%20image%20and%20save%20output%20to%20the%20volume%0A%20%20%20%20%20%20%20%20test_images%20%3D%20volume.listdir(%0A%20%20%20%20%20%20%20%20%20%20%20%20str(Path(%22dataset%22)%20%2F%20dataset.id%20%2F%20%22test%22%20%2F%20%22images%22)%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20run%20inference%20on%20the%20first%205%20images%0A%20%20%20%20%20%20%20%20for%20ii%2C%20image%20in%20enumerate(test_images)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bmodel_id%7D%3A%20Single%20image%20prediction%20on%20image%22%2C%20image.path)%0A%20%20%20%20%20%20%20%20%20%20%20%20inference.predict.remote(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model_id%3Dmodel_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20image_path%3Df%22%7Bvolume_path%7D%2F%7Bimage.path%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20display%3D(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ii%20%3D%3D%200%20%20%23%20display%20inference%20results%20only%20on%20first%20image%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20ii%20%3E%3D%204%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%23%20streaming%20inference%20on%20images%20from%20the%20test%20set%0A%20%20%20%20%20%20%20%20print(f%22%7Bmodel_id%7D%3A%20Streaming%20inferences%20on%20all%20images%20in%20the%20test%20set...%22)%0A%20%20%20%20%20%20%20%20count%20%3D%200%0A%20%20%20%20%20%20%20%20for%20detection%20in%20inference.streaming_count.remote_gen(%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_dir%3Df%22%7Bvolume_path%7D%2Fdataset%2F%7Bdataset.id%7D%2Ftest%2Fimages%22%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20detection%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bdataset.target_class%7D%22%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20count%20%2B%3D%201%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22%F0%9F%8E%9E%EF%B8%8F%22%2C%20end%3D%22%22%2C%20flush%3DTrue)%0A%20%20%20%20%20%20%20%20print(f%22%5Cn%7Bmodel_id%7D%3A%20Counted%20%7Bcount%7D%20%7Bdataset.target_class%7Ds!%22)%0A%0A`,lang:`python`});var $=o(Q,2);c($,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}}),l(o($,4),{code:`warnings.filterwarnings(%20%20%23%20filter%20warning%20from%20the%20terminal%20image%20library%0A%20%20%20%20%22ignore%22%2C%0A%20%20%20%20message%3D%22It%20seems%20this%20process%20is%20not%20running%20within%20a%20terminal.%20Hence%2C%20some%20features%20will%20behave%20differently%20or%20be%20disabled.%22%2C%0A%20%20%20%20category%3DUserWarning%2C%0A)%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=ChvPpJr02.js.map
