(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6895ee69-c01c-46e4-95f1-85a1e3c2e2ac`,e._sentryDebugIdIdentifier=`sentry-dbid-6895ee69-c01c-46e4-95f1-85a1e3c2e2ac`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Embed 30 million Amazon reviews at 575k tokens per second with Qwen2-7B`,id:`embed-30-million-amazon-reviews-at-575k-tokens-per-second-with-qwen2-7b`,children:[{depth:2,value:`Load the data and start the inference job`,id:`load-the-data-and-start-the-inference-job`},{depth:2,value:`Massively scaling up and scaling out embedding inference on many beefy GPUs`,id:`massively-scaling-up-and-scaling-out-embedding-inference-on-many-beefy-gpus`},{depth:2,value:`Helper Functions`,id:`helper-functions`}]}],rawContent:`# Embed 30 million Amazon reviews at 575k tokens per second with Qwen2-7B

This example demonstrates how to create embeddings for a large text dataset. This is
often necessary to enable semantic search, translation, and other language
processing tasks. Modal makes it easy to deploy large, capable embedding models and handles
all of the scaling to process very large datasets in parallel on many cloud GPUs.

We create a Modal Function that will handle all of the data loading and submit inputs to an
inference Cls that will automatically scale up to handle hundreds of large
batches in parallel.

Between the time a batch is submitted and the time it is fetched, it is stored via
Modal's \`spawn\` system, which can hold onto up to one million inputs for up to a week.

\`\`\`python
import json
import subprocess
from pathlib import Path

import modal

app = modal.App(name="example-amazon-embeddings")
MINUTES = 60  # seconds
HOURS = 60 * MINUTES

\`\`\`

We define our \`main\` function as a \`local_entrypoint\`. This is what we'll call locally
to start the job on Modal.

You can run it with the command

\`\`\`bash
modal run --detach amazon_embeddings.py
\`\`\`

By default we \`down-scale\` to 1/100th of the data for demonstration purposes.
To launch the full job, set the \`--down-scale\` parameter to \`1\`.
But note that this will cost you!

The entrypoint starts the job and gets back a \`f\`unction \`c\`all ID for each batch.
We can use these IDs to retrieve the embeddings once the job is finished.
Modal will keep the results around for up to 7 days after completion. Take a look at our
[job processing guide](https://modal.com/docs/guide/job-queue)
for more details.

\`\`\`python
@app.local_entrypoint()
def main(
    dataset_name: str = "McAuley-Lab/Amazon-Reviews-2023",
    dataset_subset: str = "raw_review_Books",
    down_scale: float = 0.001,
):
    out_path = Path("/tmp") / "embeddings-example-fc-ids.json"
    function_ids = launch_job.remote(
        dataset_name=dataset_name, dataset_subset=dataset_subset, down_scale=down_scale
    )
    out_path.write_text(json.dumps(function_ids, indent=2) + "\\n")
    print(f"output handles saved to {out_path}")


\`\`\`

## Load the data and start the inference job

Next we define the Function that will do the data loading and feed it to our embedding model.
We define a container [Image](https://modal.com/docs/guide/images)
with the data loading dependencies.

In it, we download the data we need and cache it to the container's local disk,
which will disappear when the job is finished. We will be saving the review data
along with the embeddings, so we don't need to keep the dataset around.

Embedding a large dataset like this can take some time, but we don't need to wait
around for it to finish. We use \`spawn\` to invoke our embedding Function
and get back a handle with an ID that we can use to get the results later.
This can bottleneck on just sending data over the network for processing, so
we speed things up by using \`ThreadPoolExecutor\` to submit batches using multiple threads.

Once all of the batches have been sent for inference, we can return the function IDs
to the local client to save.

\`\`\`python
@app.function(
    image=modal.Image.debian_slim().uv_pip_install("datasets==3.5.1"), timeout=2 * HOURS
)
def launch_job(dataset_name: str, dataset_subset: str, down_scale: float):
    import time
    from concurrent.futures import ThreadPoolExecutor, as_completed

    from datasets import load_dataset
    from tqdm import tqdm

    print("Loading dataset...")
    dataset = load_dataset(
        dataset_name,
        dataset_subset,
        split="full",
        trust_remote_code=True,
    )

    data_subset = dataset.select(range(int(len(dataset) * down_scale)))

    tei = TextEmbeddingsInference()
    batches = generate_batches_of_chunks(data_subset)

    start = time.perf_counter()
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(tei.embed.spawn, batch) for batch in tqdm(batches)]
        function_ids = []
        for future in tqdm(as_completed(futures), total=len(futures)):
            function_ids.append(future.result().object_id)

    print(f"Finished submitting job: {time.perf_counter() - start:.2f}s")

    return function_ids


\`\`\`

## Massively scaling up and scaling out embedding inference on many beefy GPUs

We're going to spin up many containers to run inference, and we don't want each
one to have to download the embedding model from Hugging Face. We can download and save it to a
Modal [Volume](https://modal.com/docs/guide/volumes)
during the image build step using \`run_function\`.

We'll use the
[GTE-Qwen2-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct)
model from Alibaba, which performs well on the
[Massive Text Embedding Benchmark](https://huggingface.co/spaces/mteb/leaderboard).

\`\`\`python
MODEL_ID = "Alibaba-NLP/gte-Qwen2-7B-instruct"
MODEL_DIR = "/model"
MODEL_CACHE_VOLUME = modal.Volume.from_name(
    "embeddings-example-model-cache", create_if_missing=True
)


def download_model():
    from huggingface_hub import snapshot_download

    snapshot_download(MODEL_ID, cache_dir=MODEL_DIR)


\`\`\`

For inference, we will use Hugging Face's
[Text Embeddings Inference](https://github.com/huggingface/text-embeddings-inference)
framework for embedding model deployment.

Running lots of separate machines is "scaling out". But we can also "scale up"
by running on large, high-performance machines.

We'll use L40S GPUs for a good balance between cost and performance. Hugging Face has
prebuilt Docker images we can use as a base for our Modal Image.
We'll use the one built for the L40S's
[SM89/Ada Lovelace architecture](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
and install the rest of our dependencies on top.

\`\`\`python
tei_image = "ghcr.io/huggingface/text-embeddings-inference:89-1.7"

inference_image = (
    modal.Image.from_registry(tei_image, add_python="3.12")
    .dockerfile_commands("ENTRYPOINT []")
    .uv_pip_install(
        "httpx==0.28.1",
        "huggingface-hub==0.36.0",
        "numpy==2.2.5",
        "tqdm==4.67.1",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HOME": MODEL_DIR})
    .run_function(download_model, volumes={MODEL_DIR: MODEL_CACHE_VOLUME})
)


\`\`\`

Next we define our inference class. Modal will auto-scale the number of
containers ready to handle inputs based on the parameters we set in the \`@app.cls\`
and \`@modal.concurrent\` decorators. Here we limit the total number of containers to
100 and the maximum number of concurrent inputs to 10, which caps us at 1000 concurrent batches.
On Modal's Starter (free) and Team plans, the maximum number of concurrent GPUs is lower,
reducing the total number of concurrent batches and so the throughput.

Customers on Modal's Enterprise Plan regularly scale up another order of magnitude above this.
If you're interested in running on thousands of GPUs,
[get in touch](https://form.fillout.com/t/onUBuQZ5vCus).

Here we also specify the GPU type and attach the Modal Volume where we saved the
embedding model.

This class will spawn a local Text Embeddings Inference server when the container
starts, and process each batch by receiving the text data over HTTP, returning a list of
tuples with the batch text data and embeddings.

\`\`\`python
@app.cls(
    image=inference_image,
    gpu="L40S",
    volumes={MODEL_DIR: MODEL_CACHE_VOLUME},
    max_containers=100,
    scaledown_window=5 * MINUTES,  # idle for 5 min without inputs before scaling down
    retries=3,  # handle transient failures and storms in the cloud
    timeout=2 * HOURS,  # run for at most 2 hours
)
@modal.concurrent(max_inputs=10)
class TextEmbeddingsInference:
    @modal.enter()
    def open_connection(self):
        from httpx import AsyncClient

        print("Starting text embedding inference server...")
        self.process = spawn_server()
        self.client = AsyncClient(base_url="http://127.0.0.1:8000", timeout=30)

    @modal.exit()
    def terminate_connection(self):
        self.process.terminate()

    @modal.method()
    async def embed(self, batch):
        texts = [chunk[-1] for chunk in batch]
        res = await self.client.post("/embed", json={"inputs": texts})
        return [chunk + (embedding,) for chunk, embedding in zip(batch, res.json())]


\`\`\`

## Helper Functions

The book review dataset contains ~30M reviews with ~12B total characters,
indicating an average review length of ~500 characters. Some are much longer.
Embedding models have a limit on the number of tokens they can process in a single
input. We will need to split each review into chunks that are under this limit.

The proper way to split text data is to use a tokenizer to ensure that any
single request is under the models token limit, and to overlap chunks to provide
semantic context and preserve information. For the sake of this example, we're going
just to split by a set character length (\`CHUNK_SIZE\`).

While the embedding model has a limit on the number of input tokens for a single
embedding, the number of chunks that we can process in a single batch is limited by
the VRAM of the GPU. We set the \`BATCH_SIZE\` accordingly.

\`\`\`python
BATCH_SIZE = 256
CHUNK_SIZE = 512


def generate_batches_of_chunks(
    dataset, chunk_size: int = CHUNK_SIZE, batch_size: int = BATCH_SIZE
):
    """Creates batches of chunks by naively slicing strings according to CHUNK_SIZE."""
    batch = []
    for entry_index, data in enumerate(dataset):
        product_id = data["asin"]
        user_id = data["user_id"]
        timestamp = data["timestamp"]
        title = data["title"]
        text = data["text"]
        for chunk_index, chunk_start in enumerate(range(0, len(text), chunk_size)):
            batch.append(
                (
                    entry_index,
                    chunk_index,
                    product_id,
                    user_id,
                    timestamp,
                    title,
                    text[chunk_start : chunk_start + chunk_size],
                )
            )
            if len(batch) == batch_size:
                yield batch
                batch = []
    if batch:
        yield batch


def spawn_server(
    model_id: str = MODEL_ID,
    port: int = 8000,
    max_client_batch_size: int = BATCH_SIZE,
    max_batch_tokens: int = BATCH_SIZE * CHUNK_SIZE,
    huggingface_hub_cache: str = MODEL_DIR,
):
    """Starts a text embedding inference server in a subprocess."""
    import socket

    LAUNCH_FLAGS = [
        "--model-id",
        model_id,
        "--port",
        str(port),
        "--max-client-batch-size",
        str(max_client_batch_size),
        "--max-batch-tokens",
        str(max_batch_tokens),
        "--huggingface-hub-cache",
        huggingface_hub_cache,
    ]

    process = subprocess.Popen(["text-embeddings-router"] + LAUNCH_FLAGS)
    # Poll until webserver at 127.0.0.1:8000 accepts connections before running inputs.
    while True:
        try:
            socket.create_connection(("127.0.0.1", port), timeout=1).close()
            print("Inference server ready!")
            return process
        except (socket.timeout, ConnectionRefusedError):
            retcode = process.poll()  # Check if the process has terminated.
            if retcode is not None:
                raise RuntimeError(f"Launcher exited unexpectedly with code {retcode}")

\`\`\`
`,meta:{title:`Embed 30 million Amazon reviews at 575k tokens per second with Qwen2-7B`,description:`This example demonstrates how to create embeddings for a large text dataset. This is often necessary to enable semantic search, translation, and other language processing tasks. Modal makes it easy to deploy large, capable embedding models and handles all of the scaling to process very large datasets in parallel on many cloud GPUs.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to create embeddings for a large text dataset. This is
often necessary to enable semantic search, translation, and other language
processing tasks. Modal makes it easy to deploy large, capable embedding models and handles
all of the scaling to process very large datasets in parallel on many cloud GPUs.</p> <p>We create a Modal Function that will handle all of the data loading and submit inputs to an
inference Cls that will automatically scale up to handle hundreds of large
batches in parallel.</p> <p>Between the time a batch is submitted and the time it is fetched, it is stored via
Modal’s <code>spawn</code> system, which can hold onto up to one million inputs for up to a week.</p> <!> <p>We define our <code>main</code> function as a <code>local_entrypoint</code>. This is what we’ll call locally
to start the job on Modal.</p> <p>You can run it with the command</p> <!> <p>By default we <code>down-scale</code> to 1/100th of the data for demonstration purposes.
To launch the full job, set the <code>--down-scale</code> parameter to <code>1</code>.
But note that this will cost you!</p> <p>The entrypoint starts the job and gets back a <code>f</code>unction <code>c</code>all ID for each batch.
We can use these IDs to retrieve the embeddings once the job is finished.
Modal will keep the results around for up to 7 days after completion. Take a look at our <!> for more details.</p> <!> <!> <p>Next we define the Function that will do the data loading and feed it to our embedding model.
We define a container <!> with the data loading dependencies.</p> <p>In it, we download the data we need and cache it to the container’s local disk,
which will disappear when the job is finished. We will be saving the review data
along with the embeddings, so we don’t need to keep the dataset around.</p> <p>Embedding a large dataset like this can take some time, but we don’t need to wait
around for it to finish. We use <code>spawn</code> to invoke our embedding Function
and get back a handle with an ID that we can use to get the results later.
This can bottleneck on just sending data over the network for processing, so
we speed things up by using <code>ThreadPoolExecutor</code> to submit batches using multiple threads.</p> <p>Once all of the batches have been sent for inference, we can return the function IDs
to the local client to save.</p> <!> <!> <p>We’re going to spin up many containers to run inference, and we don’t want each
one to have to download the embedding model from Hugging Face. We can download and save it to a
Modal <!> during the image build step using <code>run_function</code>.</p> <p>We’ll use the <!> model from Alibaba, which performs well on the <!>.</p> <!> <p>For inference, we will use Hugging Face’s <!> framework for embedding model deployment.</p> <p>Running lots of separate machines is “scaling out”. But we can also “scale up”
by running on large, high-performance machines.</p> <p>We’ll use L40S GPUs for a good balance between cost and performance. Hugging Face has
prebuilt Docker images we can use as a base for our Modal Image.
We’ll use the one built for the L40S’s <!> and install the rest of our dependencies on top.</p> <!> <p>Next we define our inference class. Modal will auto-scale the number of
containers ready to handle inputs based on the parameters we set in the <code>@app.cls</code> and <code>@modal.concurrent</code> decorators. Here we limit the total number of containers to
100 and the maximum number of concurrent inputs to 10, which caps us at 1000 concurrent batches.
On Modal’s Starter (free) and Team plans, the maximum number of concurrent GPUs is lower,
reducing the total number of concurrent batches and so the throughput.</p> <p>Customers on Modal’s Enterprise Plan regularly scale up another order of magnitude above this.
If you’re interested in running on thousands of GPUs, <!>.</p> <p>Here we also specify the GPU type and attach the Modal Volume where we saved the
embedding model.</p> <p>This class will spawn a local Text Embeddings Inference server when the container
starts, and process each batch by receiving the text data over HTTP, returning a list of
tuples with the batch text data and embeddings.</p> <!> <!> <p>The book review dataset contains ~30M reviews with ~12B total characters,
indicating an average review length of ~500 characters. Some are much longer.
Embedding models have a limit on the number of tokens they can process in a single
input. We will need to split each review into chunks that are under this limit.</p> <p>The proper way to split text data is to use a tokenizer to ensure that any
single request is under the models token limit, and to overlap chunks to provide
semantic context and preserve information. For the sake of this example, we’re going
just to split by a set character length (<code>CHUNK_SIZE</code>).</p> <p>While the embedding model has a limit on the number of input tokens for a single
embedding, the number of chunks that we can process in a single batch is limited by
the VRAM of the GPU. We set the <code>BATCH_SIZE</code> accordingly.</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`embed-30-million-amazon-reviews-at-575k-tokens-per-second-with-qwen2-7b`,children:(e,t)=>{l(),i(e,r(`Embed 30 million Amazon reviews at 575k tokens per second with Qwen2-7B`))},$$slots:{default:!0}});var h=c(p,8);f(h,{code:`import%20json%0Aimport%20subprocess%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22example-amazon-embeddings%22)%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AHOURS%20%3D%2060%20*%20MINUTES%0A`,lang:`python`});var g=c(h,6);f(g,{code:`modal%20run%20--detach%20amazon_embeddings.py`,lang:`bash`});var _=c(g,4);m(c(e(_),5),{href:`https://modal.com/docs/guide/job-queue`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`job processing guide`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);f(v,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20dataset_name%3A%20str%20%3D%20%22McAuley-Lab%2FAmazon-Reviews-2023%22%2C%0A%20%20%20%20dataset_subset%3A%20str%20%3D%20%22raw_review_Books%22%2C%0A%20%20%20%20down_scale%3A%20float%20%3D%200.001%2C%0A)%3A%0A%20%20%20%20out_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22embeddings-example-fc-ids.json%22%0A%20%20%20%20function_ids%20%3D%20launch_job.remote(%0A%20%20%20%20%20%20%20%20dataset_name%3Ddataset_name%2C%20dataset_subset%3Ddataset_subset%2C%20down_scale%3Ddown_scale%0A%20%20%20%20)%0A%20%20%20%20out_path.write_text(json.dumps(function_ids%2C%20indent%3D2)%20%2B%20%22%5Cn%22)%0A%20%20%20%20print(f%22output%20handles%20saved%20to%20%7Bout_path%7D%22)%0A%0A`,lang:`python`});var b=c(v,2);u(b,{id:`load-the-data-and-start-the-inference-job`,children:(e,t)=>{l(),i(e,r(`Load the data and start the inference job`))},$$slots:{default:!0}});var x=c(b,2);m(c(e(x)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,8);f(S,{code:`%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22datasets%3D%3D3.5.1%22)%2C%20timeout%3D2%20*%20HOURS%0A)%0Adef%20launch_job(dataset_name%3A%20str%2C%20dataset_subset%3A%20str%2C%20down_scale%3A%20float)%3A%0A%20%20%20%20import%20time%0A%20%20%20%20from%20concurrent.futures%20import%20ThreadPoolExecutor%2C%20as_completed%0A%0A%20%20%20%20from%20datasets%20import%20load_dataset%0A%20%20%20%20from%20tqdm%20import%20tqdm%0A%0A%20%20%20%20print(%22Loading%20dataset...%22)%0A%20%20%20%20dataset%20%3D%20load_dataset(%0A%20%20%20%20%20%20%20%20dataset_name%2C%0A%20%20%20%20%20%20%20%20dataset_subset%2C%0A%20%20%20%20%20%20%20%20split%3D%22full%22%2C%0A%20%20%20%20%20%20%20%20trust_remote_code%3DTrue%2C%0A%20%20%20%20)%0A%0A%20%20%20%20data_subset%20%3D%20dataset.select(range(int(len(dataset)%20*%20down_scale)))%0A%0A%20%20%20%20tei%20%3D%20TextEmbeddingsInference()%0A%20%20%20%20batches%20%3D%20generate_batches_of_chunks(data_subset)%0A%0A%20%20%20%20start%20%3D%20time.perf_counter()%0A%20%20%20%20with%20ThreadPoolExecutor()%20as%20executor%3A%0A%20%20%20%20%20%20%20%20futures%20%3D%20%5Bexecutor.submit(tei.embed.spawn%2C%20batch)%20for%20batch%20in%20tqdm(batches)%5D%0A%20%20%20%20%20%20%20%20function_ids%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20future%20in%20tqdm(as_completed(futures)%2C%20total%3Dlen(futures))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20function_ids.append(future.result().object_id)%0A%0A%20%20%20%20print(f%22Finished%20submitting%20job%3A%20%7Btime.perf_counter()%20-%20start%3A.2f%7Ds%22)%0A%0A%20%20%20%20return%20function_ids%0A%0A`,lang:`python`});var C=c(S,2);u(C,{id:`massively-scaling-up-and-scaling-out-embedding-inference-on-many-beefy-gpus`,children:(e,t)=>{l(),i(e,r(`Massively scaling up and scaling out embedding inference on many beefy GPUs`))},$$slots:{default:!0}});var w=c(C,2);m(c(e(w)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(3),n(w);var T=c(w,2),E=c(e(T));m(E,{href:`https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GTE-Qwen2-7B-instruct`))},$$slots:{default:!0}}),m(c(E,2),{href:`https://huggingface.co/spaces/mteb/leaderboard`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Massive Text Embedding Benchmark`))},$$slots:{default:!0}}),l(),n(T);var D=c(T,2);f(D,{code:`MODEL_ID%20%3D%20%22Alibaba-NLP%2Fgte-Qwen2-7B-instruct%22%0AMODEL_DIR%20%3D%20%22%2Fmodel%22%0AMODEL_CACHE_VOLUME%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22embeddings-example-model-cache%22%2C%20create_if_missing%3DTrue%0A)%0A%0A%0Adef%20download_model()%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(MODEL_ID%2C%20cache_dir%3DMODEL_DIR)%0A%0A`,lang:`python`});var O=c(D,2);m(c(e(O)),{href:`https://github.com/huggingface/text-embeddings-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Text Embeddings Inference`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);m(c(e(k)),{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SM89/Ada Lovelace architecture`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`tei_image%20%3D%20%22ghcr.io%2Fhuggingface%2Ftext-embeddings-inference%3A89-1.7%22%0A%0Ainference_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(tei_image%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.dockerfile_commands(%22ENTRYPOINT%20%5B%5D%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22httpx%3D%3D0.28.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3D%3D2.2.5%22%2C%0A%20%20%20%20%20%20%20%20%22tqdm%3D%3D4.67.1%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HOME%22%3A%20MODEL_DIR%7D)%0A%20%20%20%20.run_function(download_model%2C%20volumes%3D%7BMODEL_DIR%3A%20MODEL_CACHE_VOLUME%7D)%0A)%0A%0A`,lang:`python`});var j=c(A,4);m(c(e(j)),{href:`https://form.fillout.com/t/onUBuQZ5vCus`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`get in touch`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,6);f(M,{code:`%40app.cls(%0A%20%20%20%20image%3Dinference_image%2C%0A%20%20%20%20gpu%3D%22L40S%22%2C%0A%20%20%20%20volumes%3D%7BMODEL_DIR%3A%20MODEL_CACHE_VOLUME%7D%2C%0A%20%20%20%20max_containers%3D100%2C%0A%20%20%20%20scaledown_window%3D5%20*%20MINUTES%2C%20%20%23%20idle%20for%205%20min%20without%20inputs%20before%20scaling%20down%0A%20%20%20%20retries%3D3%2C%20%20%23%20handle%20transient%20failures%20and%20storms%20in%20the%20cloud%0A%20%20%20%20timeout%3D2%20*%20HOURS%2C%20%20%23%20run%20for%20at%20most%202%20hours%0A)%0A%40modal.concurrent(max_inputs%3D10)%0Aclass%20TextEmbeddingsInference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20open_connection(self)%3A%0A%20%20%20%20%20%20%20%20from%20httpx%20import%20AsyncClient%0A%0A%20%20%20%20%20%20%20%20print(%22Starting%20text%20embedding%20inference%20server...%22)%0A%20%20%20%20%20%20%20%20self.process%20%3D%20spawn_server()%0A%20%20%20%20%20%20%20%20self.client%20%3D%20AsyncClient(base_url%3D%22http%3A%2F%2F127.0.0.1%3A8000%22%2C%20timeout%3D30)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20terminate_connection(self)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20embed(self%2C%20batch)%3A%0A%20%20%20%20%20%20%20%20texts%20%3D%20%5Bchunk%5B-1%5D%20for%20chunk%20in%20batch%5D%0A%20%20%20%20%20%20%20%20res%20%3D%20await%20self.client.post(%22%2Fembed%22%2C%20json%3D%7B%22inputs%22%3A%20texts%7D)%0A%20%20%20%20%20%20%20%20return%20%5Bchunk%20%2B%20(embedding%2C)%20for%20chunk%2C%20embedding%20in%20zip(batch%2C%20res.json())%5D%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`helper-functions`,children:(e,t)=>{l(),i(e,r(`Helper Functions`))},$$slots:{default:!0}}),f(c(N,8),{code:`BATCH_SIZE%20%3D%20256%0ACHUNK_SIZE%20%3D%20512%0A%0A%0Adef%20generate_batches_of_chunks(%0A%20%20%20%20dataset%2C%20chunk_size%3A%20int%20%3D%20CHUNK_SIZE%2C%20batch_size%3A%20int%20%3D%20BATCH_SIZE%0A)%3A%0A%20%20%20%20%22%22%22Creates%20batches%20of%20chunks%20by%20naively%20slicing%20strings%20according%20to%20CHUNK_SIZE.%22%22%22%0A%20%20%20%20batch%20%3D%20%5B%5D%0A%20%20%20%20for%20entry_index%2C%20data%20in%20enumerate(dataset)%3A%0A%20%20%20%20%20%20%20%20product_id%20%3D%20data%5B%22asin%22%5D%0A%20%20%20%20%20%20%20%20user_id%20%3D%20data%5B%22user_id%22%5D%0A%20%20%20%20%20%20%20%20timestamp%20%3D%20data%5B%22timestamp%22%5D%0A%20%20%20%20%20%20%20%20title%20%3D%20data%5B%22title%22%5D%0A%20%20%20%20%20%20%20%20text%20%3D%20data%5B%22text%22%5D%0A%20%20%20%20%20%20%20%20for%20chunk_index%2C%20chunk_start%20in%20enumerate(range(0%2C%20len(text)%2C%20chunk_size))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20batch.append(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20entry_index%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_index%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20product_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20user_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20timestamp%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%5Bchunk_start%20%3A%20chunk_start%20%2B%20chunk_size%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20len(batch)%20%3D%3D%20batch_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20batch%20%3D%20%5B%5D%0A%20%20%20%20if%20batch%3A%0A%20%20%20%20%20%20%20%20yield%20batch%0A%0A%0Adef%20spawn_server(%0A%20%20%20%20model_id%3A%20str%20%3D%20MODEL_ID%2C%0A%20%20%20%20port%3A%20int%20%3D%208000%2C%0A%20%20%20%20max_client_batch_size%3A%20int%20%3D%20BATCH_SIZE%2C%0A%20%20%20%20max_batch_tokens%3A%20int%20%3D%20BATCH_SIZE%20*%20CHUNK_SIZE%2C%0A%20%20%20%20huggingface_hub_cache%3A%20str%20%3D%20MODEL_DIR%2C%0A)%3A%0A%20%20%20%20%22%22%22Starts%20a%20text%20embedding%20inference%20server%20in%20a%20subprocess.%22%22%22%0A%20%20%20%20import%20socket%0A%0A%20%20%20%20LAUNCH_FLAGS%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22--model-id%22%2C%0A%20%20%20%20%20%20%20%20model_id%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(port)%2C%0A%20%20%20%20%20%20%20%20%22--max-client-batch-size%22%2C%0A%20%20%20%20%20%20%20%20str(max_client_batch_size)%2C%0A%20%20%20%20%20%20%20%20%22--max-batch-tokens%22%2C%0A%20%20%20%20%20%20%20%20str(max_batch_tokens)%2C%0A%20%20%20%20%20%20%20%20%22--huggingface-hub-cache%22%2C%0A%20%20%20%20%20%20%20%20huggingface_hub_cache%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20process%20%3D%20subprocess.Popen(%5B%22text-embeddings-router%22%5D%20%2B%20LAUNCH_FLAGS)%0A%20%20%20%20%23%20Poll%20until%20webserver%20at%20127.0.0.1%3A8000%20accepts%20connections%20before%20running%20inputs.%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20socket.create_connection((%22127.0.0.1%22%2C%20port)%2C%20timeout%3D1).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Inference%20server%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20process%0A%20%20%20%20%20%20%20%20except%20(socket.timeout%2C%20ConnectionRefusedError)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20retcode%20%3D%20process.poll()%20%20%23%20Check%20if%20the%20process%20has%20terminated.%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20retcode%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Launcher%20exited%20unexpectedly%20with%20code%20%7Bretcode%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=Dcxzp4Ld.js.map
