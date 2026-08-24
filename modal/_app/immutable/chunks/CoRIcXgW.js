(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9c8dd335-799b-46af-a27e-e489ffa69599`,e._sentryDebugIdIdentifier=`sentry-dbid-9c8dd335-799b-46af-a27e-e489ffa69599`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as ee,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Modal Cookbook: Recipe for Inference Throughput Maximization`,id:`modal-cookbook-recipe-for-inference-throughput-maximization`,children:[{depth:2,value:`Conclusions`,id:`conclusions`,children:[{depth:3,value:`BLUF (Bottom Line Up Front)`,id:`bluf-bottom-line-up-front`},{depth:3,value:`Why?`,id:`why`}]},{depth:2,value:`Local env imports`,id:`local-env-imports`},{depth:2,value:`Key Parameters`,id:`key-parameters`},{depth:2,value:`Data and Model Specification`,id:`data-and-model-specification`},{depth:2,value:`Define the image`,id:`define-the-image`},{depth:2,value:`Data setup`,id:`data-setup`},{depth:2,value:`Inference app`,id:`inference-app`},{depth:2,value:`Local Entrypoint`,id:`local-entrypoint`}]}],rawContent:`# Modal Cookbook: Recipe for Inference Throughput Maximization
In certain applications, the bottom line comes to throughput: process a set of inputs as fast as possible.
Let's explore how to maximize throughput by using Modal on an embedding example, and see just how fast
we can encode the [Microsoft Cats & Dogs dataset](https://huggingface.co/datasets/microsoft/cats_vs_dogs)
using the [Infinity inference engine](https://github.com/michaelfeil/infinity "github/michaelfeil/infinity").

## Conclusions
### BLUF (Bottom Line Up Front)
Set concurrency (\`max_concurrent_inputs\`) to 4, and set \`batch_size\` between 50-500.
To set \`max_containers\`, divide the total number of inputs by \`max_concurrent_inputs*batchsize\`
(note: if you have a massive dataset, keep an eye out for diminishing returns on \`max_containers\`; but
Modal should handle that for you!).
Be sure to preprocess your data in the same manner that the model is expecting (e.g., resizing images).
If you only want to use one container, increase \`batch_size\` until you are maxing
out the GPU (but keep concurrency, \`max_concurrent_inputs\`, capped around 4). The example herein achieves
upward of 750 images / second overall throughput (not including initial Volume setup time).

### Why?
While batchsize maximizes GPU utilization, the time to form a batch (ie reading images)
will ultimately overtake inference, whether due to I/O, sending data across a wire, etc.
We can make up for this by using idle GPU cores to store additional copies of the model:
this _GPU packing_ is achieved via an async queue and the [\`@modal.concurrent(max_inputs:int)\`](https://modal.com/docs/guide/concurrent-inputs#input-concurrency)
decorator. Once you nail down \`batch_size\` you can crank up the number of containers to distribute the
computational load. High values of concurrency has diminishing returns, we believe,
because we are already throttling the CPU with multi-threaded dataloading. The demo herein
achieves upward of 750 images / second, and that will increase for larger datasets where the model loading
time becomes increasingly negligable.

## Local env imports
Import everything we need for the locally-run Python (everything in our local_entrypoint function at the bottom).

\`\`\`python
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from time import perf_counter
from typing import Iterator, TypeVar

import modal

\`\`\`

## Key Parameters
There are three ways to parallelize inference for this usecase: via batching (which happens internal to Infinity),
by packing individual GPU(s) with multiple copies of the model, and by fanning out across multiple containers.
Here are some parameters for controlling these factors:
* \`max_concurrent_inputs\` sets the [@modal.concurrent(max_inputs:int) ](https://modal.com/docs/guide/concurrent-inputs#input-concurrency "Modal: input concurrency") argument for the inference app. This takes advantage of the asynchronous nature of the Infinity embedding inference app.
* \`gpu\` is a string specifying the GPU to be used.
* \`max_containers\` caps the number of containers allowed to spin-up.
* \`memory_request\` amount of RAM requested per container
* \`core_request\` number of logical cores requested per container
* \`threads_per_core\` oversubscription factor for parallelized I/O (image reading)
* \`batch_size\` is a parameter passed to the [Infinity inference engine](https://github.com/michaelfeil/infinity "github/michaelfeil/infinity"), and it means the usual thing for machine learning inference: a group of images are processed through the neural network together.
* \`image_cap\` caps the number of images used in this example (e.g. for debugging/testing)

\`\`\`python
max_concurrent_inputs: int = 4
gpu: str = "L4"
max_containers: int = 50
memory_request: float = 5 * 1024  # MB->GB
core_request: float = 4
threads_per_core: int = 8
batch_size: int = 100
image_cap: int = -1

\`\`\`

This timeout caps the maximum time a single function call is allowed to take. In this example, that
includes reading a batch-worth of data and running inference on it. When \`batch_size\` is large (e.g. 5000)
and with a large value of \`max_concurrent_inputs\`, where a batch may sit in a queue for a while,
this could take several minutes.

\`\`\`python
timeout_seconds: int = 10 * 60

\`\`\`

## Data and Model Specification
This model parameter should point to a model on HuggingFace that is supported by Infinity.
Note that your selected model might require specialized imports when
designing the image in the next section. This [OpenAI model](https://huggingface.co/openai/clip-vit-base-patch16 "OpenAI ViT")
takes about 4-10s to load into memory.

\`\`\`python
model_name = "openai/clip-vit-base-patch16"  # 599 MB
model_input_shape = (224, 224)

\`\`\`

We will use a high-performance [Modal Volume](https://modal.com/docs/guide/volumes#volumes "Modal.Volume")
both to cache model weights and to store images we want to encode. The details of
setting this volume up are below. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).
Here, we just need to name it so that we can instantiate
the Modal application.
You may need to [set up a secret](https://modal.com/secrets/) to access HuggingFace datasets

\`\`\`python
hf_secret = modal.Secret.from_name("huggingface-secret")
\`\`\`

Change this global variable to use a different HF dataset:

\`\`\`python
hf_dataset_name = "microsoft/cats_vs_dogs"
\`\`\`

This name is important for referencing the volume in other apps or for [browsing](https://modal.com/storage):

\`\`\`python
vol_name = "example-embedding-data"
\`\`\`

This is the location within the container that this Volume will be mounted:

\`\`\`python
vol_mnt = Path("/data")
\`\`\`

Finally, the Volume object can be created:

\`\`\`python
data_volume = modal.Volume.from_name(vol_name, create_if_missing=True)


\`\`\`

## Define the image

\`\`\`python
infinity_image = (
    modal.Image.debian_slim(python_version="3.10")
    .uv_pip_install(
        [
            "pillow==11.3.0",  # for Infinity input typehint
            "datasets==4.0.0",  # for huggingface data download
            "huggingface-hub==0.36.0",  # for fast huggingface data download
            "tqdm==4.67.1",  # progress bar for dataset download
            "sentencepiece==0.2.0",  # for this particular chosen model
            "torchvision==0.22.1",  # for fast image loading
            "infinity_emb[all]==0.0.76",  # for Infinity inference lib
            "optimum==1.26.1",  # need to pin this because newer version requires
        ]
    )
    .env(
        {
            "HF_HOME": vol_mnt.as_posix(),  # For model and data caching in our Volume
            "HF_XET_HIGH_PERFORMANCE": "1",  # For fast data transfer
        }
    )
)

\`\`\`

Initialize the app

\`\`\`python
app = modal.App(
    "example-image-embeddings-infinity",
    image=infinity_image,
    volumes={vol_mnt: data_volume},
    secrets=[hf_secret],
)

\`\`\`

Imports inside the container

\`\`\`python
with infinity_image.imports():
    from infinity_emb import AsyncEmbeddingEngine, EngineArgs
    from infinity_emb.primitives import Dtype, InferenceEngine
    from PIL.Image import Image
    from torchvision.io import read_image
    from torchvision.transforms.functional import to_pil_image

## Dataset Downloading and Setup
\`\`\`

## Data setup
We use a [Modal Volume](https://modal.com/docs/guide/volumes#volumes "Modal.Volume")
to store images we want to encode. We download them from Huggingface into a Volume and then preprocess
them to 224 x 224 JPEGs. The selected model, \`openai/clip-vit-base-patch16\`, was trained on 224 x 224
sized images. If you skip this preprocess resize step, Infinity will handle image resizing for you-
at a severe penalty to inference throughput.

Note that Modal Volumes are optimized for datasets on the order of 50,000 - 500,000
files and directories. If you have a larger dataset, you may need to consider other storage
options such as a [CloudBucketMount](https://modal.com/docs/examples/rosettafold).

\`\`\`python
@app.function(
    image=infinity_image,
    volumes={vol_mnt: data_volume},
    max_containers=1,  # We only want one container to handle volume setup
    cpu=core_request,  # HuggingFace will use multi-process parallelism to download
    timeout=timeout_seconds,  # if using a large HF dataset, this may need to be longer
)
def catalog_jpegs(dataset_namespace: str, cache_dir: str, image_cap: int):
    """
    This function checks the volume for JPEGs and, if needed, calls \`download_to_volume\`
    which pulls a HuggingFace dataset into the mounted volume.
    """

    def download_to_volume(dataset_namespace: str, cache_dir: str):
        """
        This function caches a hugginface dataset to the path specified in your \`HF_HOME\` environment
        variable, which we set when creating the image so as to point to a Modal Volume.
        """
        from datasets import load_dataset
        from torchvision.io import write_jpeg
        from torchvision.transforms import Compose, PILToTensor, Resize
        from tqdm import tqdm

        # Load cache to HF_HOME
        ds = load_dataset(
            dataset_namespace,
            split="train",
            num_proc=os.cpu_count(),  # this will be capped by huggingface based on the number of shards
        )

        # Create an \`extraction\` cache dir where we will create explicit JPEGs
        mounted_cache_dir = vol_mnt / cache_dir
        mounted_cache_dir.mkdir(exist_ok=True, parents=True)

        # Preprocessing pipeline: resize now instead of on-the-fly
        preprocessor = Compose(
            [
                Resize(model_input_shape),
                PILToTensor(),
            ]
        )

        def preprocess_img(idx, example):
            """
            Applies preprocessor and write as jpeg with TurboJPEG (via torchvision).
            """
            # Define output path
            write_path = mounted_cache_dir / f"img{idx:07d}.jpg"
            if write_path.is_file():
                return

            # Here, \`example["image"]\` is a \`PIL.Image.Image\`
            preprocessed = preprocessor(example["image"].convert("RGB"))

            # Write to modal.Volume
            write_jpeg(preprocessed, write_path)

        # This is a parallelized pre-processing loop that opens compressed images,
        # preprocesses them to the size expected by our model, and writes as a JPEG.
        for idx, ex in tqdm(enumerate(ds), total=len(ds), desc="Caching images"):
            if (image_cap > 0) and (idx >= image_cap):
                break
            preprocess_img(idx, ex)

        data_volume.commit()

    ds_preptime_st = perf_counter()

    def list_all_jpegs(subdir: os.PathLike = "/") -> list[os.PathLike]:
        """
        Searches a subdir within your volume for all JPEGs.
        """
        return [
            x.path
            for x in data_volume.listdir(subdir.as_posix())
            if x.path.endswith(".jpg")
        ]

    # Check for extracted-JPEG cache dir within the volume
    if (vol_mnt / cache_dir).is_dir():
        im_path_list = list_all_jpegs(cache_dir)
        n_ims = len(im_path_list)
    else:
        n_ims = 0
        print("The cache dir was not found...")

    # If needed, download dataset to a vol
    if (n_ims < image_cap) or (n_ims == 0):
        print(f"Found {n_ims} JPEGs; checking for more on HuggingFace.")
        download_to_volume(dataset_namespace, cache_dir)
        # Try again
        im_path_list = list_all_jpegs(cache_dir)
        n_ims = len(im_path_list)

    # [optional] Cap the number of images to process
    print(f"Found {n_ims} JPEGs in the Volume.", end="")
    if image_cap > 0:
        im_path_list = im_path_list[: min(image_cap, len(im_path_list))]
    print(f"using {len(im_path_list)}.")

    # Time it
    ds_time_elapsed = perf_counter() - ds_preptime_st
    return im_path_list, ds_time_elapsed


T = TypeVar("T")  # generic type for chunked typehints


def chunked(seq: list[T], subseq_size: int) -> Iterator[list[T]]:
    """
    Helper function that chunks a sequence into subsequences of length \`subseq_size\`.
    """
    for i in range(0, len(seq), subseq_size):
        yield seq[i : i + subseq_size]


\`\`\`

## Inference app
Here we define an app.cls that wraps Infinity's AsyncEmbeddingEngine.
Note that the variable \`max_concurrent_inputs\` is used to set \`max_inputs\`
in (1) the [modal.concurrent](https://modal.com/docs/guide/concurrent-inputs#input-concurrency)
decorator, and (2) the \`n_engines\` class property.
In \`init_engines\`, we are creating exactly one inference
engine for each concurrently-passed batch of data. This is critical for packing a GPU with
multiple simultaneously operating models. The [@modal.enter](https://modal.com/docs/reference/modal.enter#modalenter)
decorator ensures that this method is called once per container, on startup (and \`exit\` is
run once, on shutdown).

\`\`\`python
@app.cls(
    gpu=gpu,
    cpu=core_request,
    memory=5 * 1024,  # MB -> GB
    image=infinity_image,
    volumes={vol_mnt: data_volume},
    timeout=timeout_seconds,
    max_containers=max_containers,
)
@modal.concurrent(max_inputs=max_concurrent_inputs)
class InfinityEngine:
    n_engines: int = max_concurrent_inputs

    @modal.enter()
    async def init_engines(self):
        """
        On container start, starts \`self.n_engines\` copies of the selected model
        and puts them in an async queue.
        """
        print(f"Loading {self.n_engines} models... ", end="")
        self.engine_queue: asyncio.Queue[AsyncEmbeddingEngine] = asyncio.Queue()
        start = perf_counter()
        for _ in range(self.n_engines):
            engine = AsyncEmbeddingEngine.from_args(
                EngineArgs(
                    model_name_or_path=model_name,
                    batch_size=batch_size,
                    model_warmup=False,
                    engine=InferenceEngine.torch,
                    dtype=Dtype.float16,
                    device="cuda",
                )
            )
            await engine.astart()
            await self.engine_queue.put(engine)
        print(f"Took {perf_counter() - start:.4}s.")

    def read_batch(self, im_path_list: list[os.PathLike]) -> list["Image"]:
        """
        Read a batch of data. Infinity is expecting PIL.Image.Image type
        inputs, but it's faster to read from disk with torchvision's \`read_image\`
        and convert to PIL than it is to read directly with PIL.

        This process is parallelized over the batch with multithreaded data reading.
        The number of threads is 4 per core, which is based on the batchsize.
        """

        def readim(impath: os.PathLike):
            """Read with torch, convert back to PIL for Infinity"""
            return to_pil_image(read_image(str(vol_mnt / impath)))

        with ThreadPoolExecutor(
            max_workers=os.cpu_count() * threads_per_core
        ) as executor:
            images = list(executor.map(readim, im_path_list))

        return images

    @modal.method()
    async def embed(self, images: list[os.PathLike]) -> tuple[float, float]:
        """
        This is the workhorse function. We select a model, prepare a batch,
        execute inference, and return the time elapsed. You probably want
        to return the embeddings in your usecase.
        """
        # (0) Grab an engine from the queue
        engine = await self.engine_queue.get()

        try:
            # (1) Load batch of image data
            images = self.read_batch(images)

            # (2) Encode the batch
            st = perf_counter()
            embedding, _ = await engine.image_embed(images=images)
            embed_elapsed = perf_counter() - st
        finally:
            # No matter what happens, return the engine to the queue
            await self.engine_queue.put(engine)

        # (3) You may wish to return the embeddings themselves here
        return embed_elapsed, len(images)

    @modal.exit()
    async def exit(self) -> None:
        """
        Shut down each of the engines.
        """
        for _ in range(self.n_engines):
            engine = await self.engine_queue.get()
            await engine.astop()


\`\`\`

## Local Entrypoint
This backbone code is run on your machine. It starts up the app,
catalogs the data, and via the remote \`map\` call, parses the data
with the Infinity embedding engine. The embedder.embed executions
across the batches are autoscaled depending on the app parameters
\`max_containers\` and \`max_concurrent_inputs\`.

\`\`\`python
@app.local_entrypoint()
def main():
    start_time = perf_counter()

    # (1) Catalog data: modify \`catalog_jpegs\` to fetch batches of your data.
    extracted_path = Path("extracted") / hf_dataset_name
    im_path_list, vol_setup_time = catalog_jpegs.remote(
        dataset_namespace=hf_dataset_name, cache_dir=extracted_path, image_cap=image_cap
    )
    print(f"Took {vol_setup_time:.2f}s to setup volume.")
    n_ims = len(im_path_list)

    # (2) Init the model inference app
    start_time = perf_counter()
    embedder = InfinityEngine()

    # (3) Embed batches via remote \`map\` call
    times, batchsizes = [], []
    for time, batchsize in embedder.embed.map(chunked(im_path_list, batch_size)):
        times.append(time)
        batchsizes.append(batchsize)

    # (4) Log
    if n_ims > 0:
        total_duration = perf_counter() - start_time
        total_throughput = n_ims / total_duration
        embed_throughputs = [
            batchsize / time for batchsize, time in zip(batchsizes, times)
        ]
        avg_throughput = sum(embed_throughputs) / len(embed_throughputs)

        log_msg = (
            f"EmbeddingRacetrack{gpu}::batch_size={batch_size}::"
            f"n_ims={n_ims}::concurrency={max_concurrent_inputs}::"
            f"max_containers={max_containers}::cores={core_request}\\n"
            f"\\tTotal time:\\t{total_duration / 60:.2f} min\\n"
            f"\\tVolume setup time:\\t{vol_setup_time / 60:.2f} min\\n"
            f"\\tOverall throughput:\\t{total_throughput:.2f} im/s\\n"
            f"\\tEmbedding-only throughput (avg):\\t{avg_throughput:.2f} im/s\\n"
        )

        print(log_msg)

\`\`\`
`,meta:{title:`Modal Cookbook: Recipe for Inference Throughput Maximization`,description:`In certain applications, the bottom line comes to throughput: process a set of inputs as fast as possible. Let’s explore how to maximize throughput by using Modal on an embedding example, and see just how fast we can encode the Microsoft Cats & Dogs dataset using the Infinity inference engine.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>@modal.concurrent(max_inputs:int)</code>`),ne=t(`<!> <p>In certain applications, the bottom line comes to throughput: process a set of inputs as fast as possible.
Let’s explore how to maximize throughput by using Modal on an embedding example, and see just how fast
we can encode the <!> using the <!>.</p> <!> <!> <p>Set concurrency (<code>max_concurrent_inputs</code>) to 4, and set <code>batch_size</code> between 50-500.
To set <code>max_containers</code>, divide the total number of inputs by <code>max_concurrent_inputs*batchsize</code> (note: if you have a massive dataset, keep an eye out for diminishing returns on <code>max_containers</code>; but
Modal should handle that for you!).
Be sure to preprocess your data in the same manner that the model is expecting (e.g., resizing images).
If you only want to use one container, increase <code>batch_size</code> until you are maxing
out the GPU (but keep concurrency, <code>max_concurrent_inputs</code>, capped around 4). The example herein achieves
upward of 750 images / second overall throughput (not including initial Volume setup time).</p> <!> <p>While batchsize maximizes GPU utilization, the time to form a batch (ie reading images)
will ultimately overtake inference, whether due to I/O, sending data across a wire, etc.
We can make up for this by using idle GPU cores to store additional copies of the model:
this <em>GPU packing</em> is achieved via an async queue and the <!> decorator. Once you nail down <code>batch_size</code> you can crank up the number of containers to distribute the
computational load. High values of concurrency has diminishing returns, we believe,
because we are already throttling the CPU with multi-threaded dataloading. The demo herein
achieves upward of 750 images / second, and that will increase for larger datasets where the model loading
time becomes increasingly negligable.</p> <!> <p>Import everything we need for the locally-run Python (everything in our local_entrypoint function at the bottom).</p> <!> <!> <p>There are three ways to parallelize inference for this usecase: via batching (which happens internal to Infinity),
by packing individual GPU(s) with multiple copies of the model, and by fanning out across multiple containers.
Here are some parameters for controlling these factors:</p> <ul><li><code>max_concurrent_inputs</code> sets the <!> argument for the inference app. This takes advantage of the asynchronous nature of the Infinity embedding inference app.</li> <li><code>gpu</code> is a string specifying the GPU to be used.</li> <li><code>max_containers</code> caps the number of containers allowed to spin-up.</li> <li><code>memory_request</code> amount of RAM requested per container</li> <li><code>core_request</code> number of logical cores requested per container</li> <li><code>threads_per_core</code> oversubscription factor for parallelized I/O (image reading)</li> <li><code>batch_size</code> is a parameter passed to the <!>, and it means the usual thing for machine learning inference: a group of images are processed through the neural network together.</li> <li><code>image_cap</code> caps the number of images used in this example (e.g. for debugging/testing)</li></ul> <!> <p>This timeout caps the maximum time a single function call is allowed to take. In this example, that
includes reading a batch-worth of data and running inference on it. When <code>batch_size</code> is large (e.g. 5000)
and with a large value of <code>max_concurrent_inputs</code>, where a batch may sit in a queue for a while,
this could take several minutes.</p> <!> <!> <p>This model parameter should point to a model on HuggingFace that is supported by Infinity.
Note that your selected model might require specialized imports when
designing the image in the next section. This <!> takes about 4-10s to load into memory.</p> <!> <p>We will use a high-performance <!> both to cache model weights and to store images we want to encode. The details of
setting this volume up are below. For more on storing model weights on Modal, see <!>.
Here, we just need to name it so that we can instantiate
the Modal application.
You may need to <!> to access HuggingFace datasets</p> <!> <p>Change this global variable to use a different HF dataset:</p> <!> <p>This name is important for referencing the volume in other apps or for <!>:</p> <!> <p>This is the location within the container that this Volume will be mounted:</p> <!> <p>Finally, the Volume object can be created:</p> <!> <!> <!> <p>Initialize the app</p> <!> <p>Imports inside the container</p> <!> <!> <p>We use a <!> to store images we want to encode. We download them from Huggingface into a Volume and then preprocess
them to 224 x 224 JPEGs. The selected model, <code>openai/clip-vit-base-patch16</code>, was trained on 224 x 224
sized images. If you skip this preprocess resize step, Infinity will handle image resizing for you-
at a severe penalty to inference throughput.</p> <p>Note that Modal Volumes are optimized for datasets on the order of 50,000 - 500,000
files and directories. If you have a larger dataset, you may need to consider other storage
options such as a <!>.</p> <!> <!> <p>Here we define an app.cls that wraps Infinity’s AsyncEmbeddingEngine.
Note that the variable <code>max_concurrent_inputs</code> is used to set <code>max_inputs</code> in (1) the <!> decorator, and (2) the <code>n_engines</code> class property.
In <code>init_engines</code>, we are creating exactly one inference
engine for each concurrently-passed batch of data. This is critical for packing a GPU with
multiple simultaneously operating models. The <!> decorator ensures that this method is called once per container, on startup (and <code>exit</code> is
run once, on shutdown).</p> <!> <!> <p>This backbone code is run on your machine. It starts up the app,
catalogs the data, and via the remote <code>map</code> call, parses the data
with the Infinity embedding engine. The embedder.embed executions
across the batches are autoscaled depending on the app parameters <code>max_containers</code> and <code>max_concurrent_inputs</code>.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=ne(),f=ee(o);te(f,{id:`modal-cookbook-recipe-for-inference-throughput-maximization`,children:(e,t)=>{c(),i(e,r(`Modal Cookbook: Recipe for Inference Throughput Maximization`))},$$slots:{default:!0}});var m=s(f,2),h=s(e(m));p(h,{href:`https://huggingface.co/datasets/microsoft/cats_vs_dogs`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Microsoft Cats & Dogs dataset`))},$$slots:{default:!0}}),p(s(h,2),{href:`https://github.com/michaelfeil/infinity`,title:`github/michaelfeil/infinity`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Infinity inference engine`))},$$slots:{default:!0}}),c(),n(m);var g=s(m,2);l(g,{id:`conclusions`,children:(e,t)=>{c(),i(e,r(`Conclusions`))},$$slots:{default:!0}});var _=s(g,2);u(_,{id:`bluf-bottom-line-up-front`,children:(e,t)=>{c(),i(e,r(`BLUF (Bottom Line Up Front)`))},$$slots:{default:!0}});var y=s(_,4);u(y,{id:`why`,children:(e,t)=>{c(),i(e,r(`Why?`))},$$slots:{default:!0}});var b=s(y,2);p(s(e(b),3),{href:`https://modal.com/docs/guide/concurrent-inputs#input-concurrency`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),c(3),n(b);var x=s(b,2);l(x,{id:`local-env-imports`,children:(e,t)=>{c(),i(e,r(`Local env imports`))},$$slots:{default:!0}});var S=s(x,4);d(S,{code:`import%20asyncio%0Aimport%20os%0Afrom%20concurrent.futures%20import%20ThreadPoolExecutor%0Afrom%20pathlib%20import%20Path%0Afrom%20time%20import%20perf_counter%0Afrom%20typing%20import%20Iterator%2C%20TypeVar%0A%0Aimport%20modal%0A`,lang:`python`});var C=s(S,2);l(C,{id:`key-parameters`,children:(e,t)=>{c(),i(e,r(`Key Parameters`))},$$slots:{default:!0}});var w=s(C,4),T=e(w);p(s(e(T),2),{href:`https://modal.com/docs/guide/concurrent-inputs#input-concurrency`,title:`Modal: input concurrency`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`@modal.concurrent(max_inputs:int)`))},$$slots:{default:!0}}),c(),n(T);var E=s(T,12);p(s(e(E),2),{href:`https://github.com/michaelfeil/infinity`,title:`github/michaelfeil/infinity`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Infinity inference engine`))},$$slots:{default:!0}}),c(),n(E),c(2),n(w);var D=s(w,2);d(D,{code:`max_concurrent_inputs%3A%20int%20%3D%204%0Agpu%3A%20str%20%3D%20%22L4%22%0Amax_containers%3A%20int%20%3D%2050%0Amemory_request%3A%20float%20%3D%205%20*%201024%20%20%23%20MB-%3EGB%0Acore_request%3A%20float%20%3D%204%0Athreads_per_core%3A%20int%20%3D%208%0Abatch_size%3A%20int%20%3D%20100%0Aimage_cap%3A%20int%20%3D%20-1%0A`,lang:`python`});var O=s(D,4);d(O,{code:`timeout_seconds%3A%20int%20%3D%2010%20*%2060%0A`,lang:`python`});var k=s(O,2);l(k,{id:`data-and-model-specification`,children:(e,t)=>{c(),i(e,r(`Data and Model Specification`))},$$slots:{default:!0}});var A=s(k,2);p(s(e(A)),{href:`https://huggingface.co/openai/clip-vit-base-patch16`,title:`OpenAI ViT`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`OpenAI model`))},$$slots:{default:!0}}),c(),n(A);var j=s(A,2);d(j,{code:`model_name%20%3D%20%22openai%2Fclip-vit-base-patch16%22%20%20%23%20599%20MB%0Amodel_input_shape%20%3D%20(224%2C%20224)%0A`,lang:`python`});var M=s(j,2),N=s(e(M));p(N,{href:`https://modal.com/docs/guide/volumes#volumes`,title:`Modal.Volume`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal Volume`))},$$slots:{default:!0}});var P=s(N,2);p(P,{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),p(s(P,2),{href:`https://modal.com/secrets/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`set up a secret`))},$$slots:{default:!0}}),c(),n(M);var F=s(M,2);d(F,{code:`hf_secret%20%3D%20modal.Secret.from_name(%22huggingface-secret%22)`,lang:`python`});var I=s(F,4);d(I,{code:`hf_dataset_name%20%3D%20%22microsoft%2Fcats_vs_dogs%22`,lang:`python`});var L=s(I,2);p(s(e(L)),{href:`https://modal.com/storage`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`browsing`))},$$slots:{default:!0}}),c(),n(L);var R=s(L,2);d(R,{code:`vol_name%20%3D%20%22example-embedding-data%22`,lang:`python`});var z=s(R,4);d(z,{code:`vol_mnt%20%3D%20Path(%22%2Fdata%22)`,lang:`python`});var B=s(z,4);d(B,{code:`data_volume%20%3D%20modal.Volume.from_name(vol_name%2C%20create_if_missing%3DTrue)%0A%0A`,lang:`python`});var V=s(B,2);l(V,{id:`define-the-image`,children:(e,t)=>{c(),i(e,r(`Define the image`))},$$slots:{default:!0}});var H=s(V,2);d(H,{code:`infinity_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.10%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22pillow%3D%3D11.3.0%22%2C%20%20%23%20for%20Infinity%20input%20typehint%0A%20%20%20%20%20%20%20%20%20%20%20%20%22datasets%3D%3D4.0.0%22%2C%20%20%23%20for%20huggingface%20data%20download%0A%20%20%20%20%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%20%20%23%20for%20fast%20huggingface%20data%20download%0A%20%20%20%20%20%20%20%20%20%20%20%20%22tqdm%3D%3D4.67.1%22%2C%20%20%23%20progress%20bar%20for%20dataset%20download%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sentencepiece%3D%3D0.2.0%22%2C%20%20%23%20for%20this%20particular%20chosen%20model%0A%20%20%20%20%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.22.1%22%2C%20%20%23%20for%20fast%20image%20loading%0A%20%20%20%20%20%20%20%20%20%20%20%20%22infinity_emb%5Ball%5D%3D%3D0.0.76%22%2C%20%20%23%20for%20Infinity%20inference%20lib%0A%20%20%20%20%20%20%20%20%20%20%20%20%22optimum%3D%3D1.26.1%22%2C%20%20%23%20need%20to%20pin%20this%20because%20newer%20version%20requires%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20vol_mnt.as_posix()%2C%20%20%23%20For%20model%20and%20data%20caching%20in%20our%20Volume%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20For%20fast%20data%20transfer%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var U=s(H,4);d(U,{code:`app%20%3D%20modal.App(%0A%20%20%20%20%22example-image-embeddings-infinity%22%2C%0A%20%20%20%20image%3Dinfinity_image%2C%0A%20%20%20%20volumes%3D%7Bvol_mnt%3A%20data_volume%7D%2C%0A%20%20%20%20secrets%3D%5Bhf_secret%5D%2C%0A)%0A`,lang:`python`});var W=s(U,4);d(W,{code:`with%20infinity_image.imports()%3A%0A%20%20%20%20from%20infinity_emb%20import%20AsyncEmbeddingEngine%2C%20EngineArgs%0A%20%20%20%20from%20infinity_emb.primitives%20import%20Dtype%2C%20InferenceEngine%0A%20%20%20%20from%20PIL.Image%20import%20Image%0A%20%20%20%20from%20torchvision.io%20import%20read_image%0A%20%20%20%20from%20torchvision.transforms.functional%20import%20to_pil_image%0A%0A%23%23%20Dataset%20Downloading%20and%20Setup`,lang:`python`});var G=s(W,2);l(G,{id:`data-setup`,children:(e,t)=>{c(),i(e,r(`Data setup`))},$$slots:{default:!0}});var K=s(G,2);p(s(e(K)),{href:`https://modal.com/docs/guide/volumes#volumes`,title:`Modal.Volume`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),c(3),n(K);var q=s(K,2);p(s(e(q)),{href:`https://modal.com/docs/examples/rosettafold`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`CloudBucketMount`))},$$slots:{default:!0}}),c(),n(q);var J=s(q,2);d(J,{code:`%40app.function(%0A%20%20%20%20image%3Dinfinity_image%2C%0A%20%20%20%20volumes%3D%7Bvol_mnt%3A%20data_volume%7D%2C%0A%20%20%20%20max_containers%3D1%2C%20%20%23%20We%20only%20want%20one%20container%20to%20handle%20volume%20setup%0A%20%20%20%20cpu%3Dcore_request%2C%20%20%23%20HuggingFace%20will%20use%20multi-process%20parallelism%20to%20download%0A%20%20%20%20timeout%3Dtimeout_seconds%2C%20%20%23%20if%20using%20a%20large%20HF%20dataset%2C%20this%20may%20need%20to%20be%20longer%0A)%0Adef%20catalog_jpegs(dataset_namespace%3A%20str%2C%20cache_dir%3A%20str%2C%20image_cap%3A%20int)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20This%20function%20checks%20the%20volume%20for%20JPEGs%20and%2C%20if%20needed%2C%20calls%20%60download_to_volume%60%0A%20%20%20%20which%20pulls%20a%20HuggingFace%20dataset%20into%20the%20mounted%20volume.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20def%20download_to_volume(dataset_namespace%3A%20str%2C%20cache_dir%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20This%20function%20caches%20a%20hugginface%20dataset%20to%20the%20path%20specified%20in%20your%20%60HF_HOME%60%20environment%0A%20%20%20%20%20%20%20%20variable%2C%20which%20we%20set%20when%20creating%20the%20image%20so%20as%20to%20point%20to%20a%20Modal%20Volume.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20from%20datasets%20import%20load_dataset%0A%20%20%20%20%20%20%20%20from%20torchvision.io%20import%20write_jpeg%0A%20%20%20%20%20%20%20%20from%20torchvision.transforms%20import%20Compose%2C%20PILToTensor%2C%20Resize%0A%20%20%20%20%20%20%20%20from%20tqdm%20import%20tqdm%0A%0A%20%20%20%20%20%20%20%20%23%20Load%20cache%20to%20HF_HOME%0A%20%20%20%20%20%20%20%20ds%20%3D%20load_dataset(%0A%20%20%20%20%20%20%20%20%20%20%20%20dataset_namespace%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20split%3D%22train%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_proc%3Dos.cpu_count()%2C%20%20%23%20this%20will%20be%20capped%20by%20huggingface%20based%20on%20the%20number%20of%20shards%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Create%20an%20%60extraction%60%20cache%20dir%20where%20we%20will%20create%20explicit%20JPEGs%0A%20%20%20%20%20%20%20%20mounted_cache_dir%20%3D%20vol_mnt%20%2F%20cache_dir%0A%20%20%20%20%20%20%20%20mounted_cache_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20%20%20%20%20%23%20Preprocessing%20pipeline%3A%20resize%20now%20instead%20of%20on-the-fly%0A%20%20%20%20%20%20%20%20preprocessor%20%3D%20Compose(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Resize(model_input_shape)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20PILToTensor()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20def%20preprocess_img(idx%2C%20example)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20Applies%20preprocessor%20and%20write%20as%20jpeg%20with%20TurboJPEG%20(via%20torchvision).%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Define%20output%20path%0A%20%20%20%20%20%20%20%20%20%20%20%20write_path%20%3D%20mounted_cache_dir%20%2F%20f%22img%7Bidx%3A07d%7D.jpg%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20write_path.is_file()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Here%2C%20%60example%5B%22image%22%5D%60%20is%20a%20%60PIL.Image.Image%60%0A%20%20%20%20%20%20%20%20%20%20%20%20preprocessed%20%3D%20preprocessor(example%5B%22image%22%5D.convert(%22RGB%22))%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Write%20to%20modal.Volume%0A%20%20%20%20%20%20%20%20%20%20%20%20write_jpeg(preprocessed%2C%20write_path)%0A%0A%20%20%20%20%20%20%20%20%23%20This%20is%20a%20parallelized%20pre-processing%20loop%20that%20opens%20compressed%20images%2C%0A%20%20%20%20%20%20%20%20%23%20preprocesses%20them%20to%20the%20size%20expected%20by%20our%20model%2C%20and%20writes%20as%20a%20JPEG.%0A%20%20%20%20%20%20%20%20for%20idx%2C%20ex%20in%20tqdm(enumerate(ds)%2C%20total%3Dlen(ds)%2C%20desc%3D%22Caching%20images%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(image_cap%20%3E%200)%20and%20(idx%20%3E%3D%20image_cap)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20preprocess_img(idx%2C%20ex)%0A%0A%20%20%20%20%20%20%20%20data_volume.commit()%0A%0A%20%20%20%20ds_preptime_st%20%3D%20perf_counter()%0A%0A%20%20%20%20def%20list_all_jpegs(subdir%3A%20os.PathLike%20%3D%20%22%2F%22)%20-%3E%20list%5Bos.PathLike%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Searches%20a%20subdir%20within%20your%20volume%20for%20all%20JPEGs.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20x.path%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20x%20in%20data_volume.listdir(subdir.as_posix())%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20x.path.endswith(%22.jpg%22)%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%23%20Check%20for%20extracted-JPEG%20cache%20dir%20within%20the%20volume%0A%20%20%20%20if%20(vol_mnt%20%2F%20cache_dir).is_dir()%3A%0A%20%20%20%20%20%20%20%20im_path_list%20%3D%20list_all_jpegs(cache_dir)%0A%20%20%20%20%20%20%20%20n_ims%20%3D%20len(im_path_list)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20n_ims%20%3D%200%0A%20%20%20%20%20%20%20%20print(%22The%20cache%20dir%20was%20not%20found...%22)%0A%0A%20%20%20%20%23%20If%20needed%2C%20download%20dataset%20to%20a%20vol%0A%20%20%20%20if%20(n_ims%20%3C%20image_cap)%20or%20(n_ims%20%3D%3D%200)%3A%0A%20%20%20%20%20%20%20%20print(f%22Found%20%7Bn_ims%7D%20JPEGs%3B%20checking%20for%20more%20on%20HuggingFace.%22)%0A%20%20%20%20%20%20%20%20download_to_volume(dataset_namespace%2C%20cache_dir)%0A%20%20%20%20%20%20%20%20%23%20Try%20again%0A%20%20%20%20%20%20%20%20im_path_list%20%3D%20list_all_jpegs(cache_dir)%0A%20%20%20%20%20%20%20%20n_ims%20%3D%20len(im_path_list)%0A%0A%20%20%20%20%23%20%5Boptional%5D%20Cap%20the%20number%20of%20images%20to%20process%0A%20%20%20%20print(f%22Found%20%7Bn_ims%7D%20JPEGs%20in%20the%20Volume.%22%2C%20end%3D%22%22)%0A%20%20%20%20if%20image_cap%20%3E%200%3A%0A%20%20%20%20%20%20%20%20im_path_list%20%3D%20im_path_list%5B%3A%20min(image_cap%2C%20len(im_path_list))%5D%0A%20%20%20%20print(f%22using%20%7Blen(im_path_list)%7D.%22)%0A%0A%20%20%20%20%23%20Time%20it%0A%20%20%20%20ds_time_elapsed%20%3D%20perf_counter()%20-%20ds_preptime_st%0A%20%20%20%20return%20im_path_list%2C%20ds_time_elapsed%0A%0A%0AT%20%3D%20TypeVar(%22T%22)%20%20%23%20generic%20type%20for%20chunked%20typehints%0A%0A%0Adef%20chunked(seq%3A%20list%5BT%5D%2C%20subseq_size%3A%20int)%20-%3E%20Iterator%5Blist%5BT%5D%5D%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Helper%20function%20that%20chunks%20a%20sequence%20into%20subsequences%20of%20length%20%60subseq_size%60.%0A%20%20%20%20%22%22%22%0A%20%20%20%20for%20i%20in%20range(0%2C%20len(seq)%2C%20subseq_size)%3A%0A%20%20%20%20%20%20%20%20yield%20seq%5Bi%20%3A%20i%20%2B%20subseq_size%5D%0A%0A`,lang:`python`});var Y=s(J,2);l(Y,{id:`inference-app`,children:(e,t)=>{c(),i(e,r(`Inference app`))},$$slots:{default:!0}});var X=s(Y,2),Z=s(e(X),5);p(Z,{href:`https://modal.com/docs/guide/concurrent-inputs#input-concurrency`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`modal.concurrent`))},$$slots:{default:!0}}),p(s(Z,6),{href:`https://modal.com/docs/reference/modal.enter#modalenter`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`@modal.enter`))},$$slots:{default:!0}}),c(3),n(X);var Q=s(X,2);d(Q,{code:`%40app.cls(%0A%20%20%20%20gpu%3Dgpu%2C%0A%20%20%20%20cpu%3Dcore_request%2C%0A%20%20%20%20memory%3D5%20*%201024%2C%20%20%23%20MB%20-%3E%20GB%0A%20%20%20%20image%3Dinfinity_image%2C%0A%20%20%20%20volumes%3D%7Bvol_mnt%3A%20data_volume%7D%2C%0A%20%20%20%20timeout%3Dtimeout_seconds%2C%0A%20%20%20%20max_containers%3Dmax_containers%2C%0A)%0A%40modal.concurrent(max_inputs%3Dmax_concurrent_inputs)%0Aclass%20InfinityEngine%3A%0A%20%20%20%20n_engines%3A%20int%20%3D%20max_concurrent_inputs%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20async%20def%20init_engines(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20On%20container%20start%2C%20starts%20%60self.n_engines%60%20copies%20of%20the%20selected%20model%0A%20%20%20%20%20%20%20%20and%20puts%20them%20in%20an%20async%20queue.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20print(f%22Loading%20%7Bself.n_engines%7D%20models...%20%22%2C%20end%3D%22%22)%0A%20%20%20%20%20%20%20%20self.engine_queue%3A%20asyncio.Queue%5BAsyncEmbeddingEngine%5D%20%3D%20asyncio.Queue()%0A%20%20%20%20%20%20%20%20start%20%3D%20perf_counter()%0A%20%20%20%20%20%20%20%20for%20_%20in%20range(self.n_engines)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20engine%20%3D%20AsyncEmbeddingEngine.from_args(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20EngineArgs(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model_name_or_path%3Dmodel_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20model_warmup%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20engine%3DInferenceEngine.torch%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dtype%3DDtype.float16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20device%3D%22cuda%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20engine.astart()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20self.engine_queue.put(engine)%0A%20%20%20%20%20%20%20%20print(f%22Took%20%7Bperf_counter()%20-%20start%3A.4%7Ds.%22)%0A%0A%20%20%20%20def%20read_batch(self%2C%20im_path_list%3A%20list%5Bos.PathLike%5D)%20-%3E%20list%5B%22Image%22%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Read%20a%20batch%20of%20data.%20Infinity%20is%20expecting%20PIL.Image.Image%20type%0A%20%20%20%20%20%20%20%20inputs%2C%20but%20it's%20faster%20to%20read%20from%20disk%20with%20torchvision's%20%60read_image%60%0A%20%20%20%20%20%20%20%20and%20convert%20to%20PIL%20than%20it%20is%20to%20read%20directly%20with%20PIL.%0A%0A%20%20%20%20%20%20%20%20This%20process%20is%20parallelized%20over%20the%20batch%20with%20multithreaded%20data%20reading.%0A%20%20%20%20%20%20%20%20The%20number%20of%20threads%20is%204%20per%20core%2C%20which%20is%20based%20on%20the%20batchsize.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%0A%20%20%20%20%20%20%20%20def%20readim(impath%3A%20os.PathLike)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22Read%20with%20torch%2C%20convert%20back%20to%20PIL%20for%20Infinity%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20to_pil_image(read_image(str(vol_mnt%20%2F%20impath)))%0A%0A%20%20%20%20%20%20%20%20with%20ThreadPoolExecutor(%0A%20%20%20%20%20%20%20%20%20%20%20%20max_workers%3Dos.cpu_count()%20*%20threads_per_core%0A%20%20%20%20%20%20%20%20)%20as%20executor%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20images%20%3D%20list(executor.map(readim%2C%20im_path_list))%0A%0A%20%20%20%20%20%20%20%20return%20images%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20embed(self%2C%20images%3A%20list%5Bos.PathLike%5D)%20-%3E%20tuple%5Bfloat%2C%20float%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20This%20is%20the%20workhorse%20function.%20We%20select%20a%20model%2C%20prepare%20a%20batch%2C%0A%20%20%20%20%20%20%20%20execute%20inference%2C%20and%20return%20the%20time%20elapsed.%20You%20probably%20want%0A%20%20%20%20%20%20%20%20to%20return%20the%20embeddings%20in%20your%20usecase.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%23%20(0)%20Grab%20an%20engine%20from%20the%20queue%0A%20%20%20%20%20%20%20%20engine%20%3D%20await%20self.engine_queue.get()%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20(1)%20Load%20batch%20of%20image%20data%0A%20%20%20%20%20%20%20%20%20%20%20%20images%20%3D%20self.read_batch(images)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20(2)%20Encode%20the%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20st%20%3D%20perf_counter()%0A%20%20%20%20%20%20%20%20%20%20%20%20embedding%2C%20_%20%3D%20await%20engine.image_embed(images%3Dimages)%0A%20%20%20%20%20%20%20%20%20%20%20%20embed_elapsed%20%3D%20perf_counter()%20-%20st%0A%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20No%20matter%20what%20happens%2C%20return%20the%20engine%20to%20the%20queue%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20self.engine_queue.put(engine)%0A%0A%20%20%20%20%20%20%20%20%23%20(3)%20You%20may%20wish%20to%20return%20the%20embeddings%20themselves%20here%0A%20%20%20%20%20%20%20%20return%20embed_elapsed%2C%20len(images)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20async%20def%20exit(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Shut%20down%20each%20of%20the%20engines.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20for%20_%20in%20range(self.n_engines)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20engine%20%3D%20await%20self.engine_queue.get()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20engine.astop()%0A%0A`,lang:`python`});var $=s(Q,2);l($,{id:`local-entrypoint`,children:(e,t)=>{c(),i(e,r(`Local Entrypoint`))},$$slots:{default:!0}}),d(s($,4),{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20start_time%20%3D%20perf_counter()%0A%0A%20%20%20%20%23%20(1)%20Catalog%20data%3A%20modify%20%60catalog_jpegs%60%20to%20fetch%20batches%20of%20your%20data.%0A%20%20%20%20extracted_path%20%3D%20Path(%22extracted%22)%20%2F%20hf_dataset_name%0A%20%20%20%20im_path_list%2C%20vol_setup_time%20%3D%20catalog_jpegs.remote(%0A%20%20%20%20%20%20%20%20dataset_namespace%3Dhf_dataset_name%2C%20cache_dir%3Dextracted_path%2C%20image_cap%3Dimage_cap%0A%20%20%20%20)%0A%20%20%20%20print(f%22Took%20%7Bvol_setup_time%3A.2f%7Ds%20to%20setup%20volume.%22)%0A%20%20%20%20n_ims%20%3D%20len(im_path_list)%0A%0A%20%20%20%20%23%20(2)%20Init%20the%20model%20inference%20app%0A%20%20%20%20start_time%20%3D%20perf_counter()%0A%20%20%20%20embedder%20%3D%20InfinityEngine()%0A%0A%20%20%20%20%23%20(3)%20Embed%20batches%20via%20remote%20%60map%60%20call%0A%20%20%20%20times%2C%20batchsizes%20%3D%20%5B%5D%2C%20%5B%5D%0A%20%20%20%20for%20time%2C%20batchsize%20in%20embedder.embed.map(chunked(im_path_list%2C%20batch_size))%3A%0A%20%20%20%20%20%20%20%20times.append(time)%0A%20%20%20%20%20%20%20%20batchsizes.append(batchsize)%0A%0A%20%20%20%20%23%20(4)%20Log%0A%20%20%20%20if%20n_ims%20%3E%200%3A%0A%20%20%20%20%20%20%20%20total_duration%20%3D%20perf_counter()%20-%20start_time%0A%20%20%20%20%20%20%20%20total_throughput%20%3D%20n_ims%20%2F%20total_duration%0A%20%20%20%20%20%20%20%20embed_throughputs%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20batchsize%20%2F%20time%20for%20batchsize%2C%20time%20in%20zip(batchsizes%2C%20times)%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20avg_throughput%20%3D%20sum(embed_throughputs)%20%2F%20len(embed_throughputs)%0A%0A%20%20%20%20%20%20%20%20log_msg%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22EmbeddingRacetrack%7Bgpu%7D%3A%3Abatch_size%3D%7Bbatch_size%7D%3A%3A%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22n_ims%3D%7Bn_ims%7D%3A%3Aconcurrency%3D%7Bmax_concurrent_inputs%7D%3A%3A%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22max_containers%3D%7Bmax_containers%7D%3A%3Acores%3D%7Bcore_request%7D%5Cn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5CtTotal%20time%3A%5Ct%7Btotal_duration%20%2F%2060%3A.2f%7D%20min%5Cn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5CtVolume%20setup%20time%3A%5Ct%7Bvol_setup_time%20%2F%2060%3A.2f%7D%20min%5Cn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5CtOverall%20throughput%3A%5Ct%7Btotal_throughput%3A.2f%7D%20im%2Fs%5Cn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5CtEmbedding-only%20throughput%20(avg)%3A%5Ct%7Bavg_throughput%3A.2f%7D%20im%2Fs%5Cn%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(log_msg)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CoRIcXgW.js.map
