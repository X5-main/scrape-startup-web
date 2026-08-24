(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9290f67e-112f-4004-808b-9bcc42a54cf1`,e._sentryDebugIdIdentifier=`sentry-dbid-9290f67e-112f-4004-808b-9bcc42a54cf1`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Embedding English Wikipedia in under 15 minutes`,description:`Leverage Modal’s parallel batch jobs and in-house storage features to quickly generate embeddings for billions of tokens.`,authors:[{name:`Jason Liu`,avatarUrl:`https://modal-cdn.com/jason-liu.jpg`,jobTitle:`AI Engineer`,twitterHandle:`jxnlco`}],date:`2024-01-23T12:00:00.000Z`,length:`10 minute read`,category:`Tutorials`,published:!0,layout:`blog`,githubLink:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/embeddings/wikipedia`,toc:[{depth:2,value:`Why open-source models?`,id:`why-open-source-models`},{depth:2,value:`Why Modal?`,id:`why-modal`},{depth:2,value:`Modal Concepts`,id:`modal-concepts`,children:[{depth:3,value:`Functions`,id:`functions`},{depth:3,value:`Volumes`,id:`volumes`}]},{depth:2,value:`Embedding Wikipedia`,id:`embedding-wikipedia`,children:[{depth:3,value:`Loading the Dataset`,id:`loading-the-dataset`},{depth:3,value:`Hugging Face Embedding Inference Server`,id:`hugging-face-embedding-inference-server`},{depth:3,value:`Parameters`,id:`parameters`},{depth:3,value:`Defining Our Image`,id:`defining-our-image`},{depth:3,value:`Creating our Modal Class`,id:`creating-our-modal-class`},{depth:3,value:`Generating Embeddings`,id:`generating-embeddings`},{depth:3,value:`Chunking Text`,id:`chunking-text`},{depth:3,value:`Mapping the embedding function`,id:`mapping-the-embedding-function`}]},{depth:2,value:`Further customization`,id:`further-customization`,children:[{depth:3,value:`Deploying on a schedule`,id:`deploying-on-a-schedule`},{depth:3,value:`Uploading your dataset`,id:`uploading-your-dataset`},{depth:3,value:`GPUs go brr`,id:`gpus-go-brr`}]},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`Text embeddings are a key component of production-ready applications using large
language models (LLMs). A text embedding model transforms chunks of text into
vectors of floating-point numbers that represent their semantic meaning,
allowing us to quantitatively compare strings for similarity. Creating
embeddings on a large corpus of text enables us to build applications like
search and recommendation engines, as well as give additional context to LLMs
for Retrieval-Augmented Generation (RAG) on custom documents.

Embedding models behind APIs like OpenAI’s
[\`text-embedding-ada-002\`](https://platform.openai.com/docs/api-reference/embeddings)
are a great way to get started with building for these use cases. However, as
you gather user data and tailor your applications using that data, you will
likely get **higher-quality results at lower cost** if you used this data to
[fine-tune](/docs/examples/llm-finetuning) an open-source embedding model. This
requires setting up large-scale embedding jobs, which can be a challenge due to
rate limits, infrastructure complexity, and the infeasibility of getting a large
number of GPUs for short bursts of time. So what can we do? Enter Modal.

Modal provides a serverless solution for organizations grappling with scaling
workloads. Modal’s technology enables rapid scaling across many GPUs, which we
can use to run large-scale workloads, such as generating embeddings for a
massive text dataset, at lightning speed. In this post, we'll go over everything
you need to embed the entire English Wikipedia in just 15 minutes using Hugging
Face's
[Text Embedding Inference](https://huggingface.co/docs/text-embeddings-inference/index)
service on Modal. Using Modal's serverless solution, this job comes out to just
over $15.

More specifically, we will:

1. Discuss the advantages of using open source models.
2. Explain the fundamentals of using Modal.
3. Guide you through the necessary code to implement our embedding client on the
   Wikipedia dataset.

Shortening the embedding generation time from multiple hours to just a few
minutes enables more frequent experimentation, which is crucial for continuous
model fine-tuning in production use cases (as you have to regenerate embeddings
for your entire corpus of data every time). In future posts, we'll delve into
using Modal for other aspects of this workflow (running grid search on and
fine-tuning your own embedding models) to create more tailored user experiences.

## Why open-source models?

Closed-source models are a great way to get started with creating and using
embeddings, but they run into two critical limitations in production:

1. As you run your model in production, you gather a corpus of rich preference
   data that can be used to improve the performance of your model. However,
   fine-tuning proprietary models with this custom data you’ve gathered is
   either impossible or highly cost-prohibitive.
2. Remote APIs have a number of drawbacks, such as rate limits, unreliable tail
   latencies, and high costs associated with tokens rather than compute time.

For these reasons, we believe that open-source embedding models that
progressively get better with fine-tuning are best suited for embedding use
cases like RAG workflows in production. Thousands of
[open-source models](https://huggingface.co/models?pipeline_tag=sentence-similarity&sort=trending)
are available on Hugging Face.

## Why Modal?

Model makes it easy to run your code in the cloud and push to production. By
only paying for what you use, and abstracting away all the complexity of
deploying and serving, Modal provides a simplified process to help you focus on
what's important—your product.

> To follow along with some of these examples, you'll need to
> [create a Modal account](/signup). You'll get $30 out of the box and all of
> the features to try out immediately. Once you've done so, make sure to
> [install the Modal Python package](https://pypi.org/project/modal/) using a
> virtual environment of your choice, and you can run all of the code we provide
> below.

## Modal Concepts

Before we dive into the code, let's take a look at some of the key concepts that
Modal provides that will allow us to run our embedding job quickly and
efficiently. In order to understand that, we'll need to look at two concepts - a
\`Function\` and a [\`Volume\`](/docs/guide/volumes).

### Functions

Modal functions package the code you want to run, along with their environment.
They describe the image, the requirements, and the storage we want to attach in
order to get the job done.

\`\`\`python
import modal

app = modal.App()

pandas_image = modal.Image.debian_slim().pip_install("pandas")
volume = modal.Volume.from_name("embedding-wikipedia", create_if_missing=True)

@app.function(image=pandas_image, gpu="A100", volumes={"/root/foo": volume})
def my_fn():
    # perform tasks here
\`\`\`

Using Modal functions, you could for example, provision on-demand GPUs for
fine-tuning workloads, define endpoints to serve large language models at scale,
and even spin up hundreds of containers to process large datasets in parallel.

### Volumes

In order to load large datasets and models efficiently, we can use Modal's
[Volumes](/docs/guide/volumes) feature. Volumes are a way to mount data into
your containers and allow you to read and write to them as if they were a local
file system. You can create a new volume using the \`modal volume create\`
command.

## Embedding Wikipedia

Now that we've got a good understanding of some key concepts that Modal
provides, let’s load the \`wikipedia\` dataset in a persistent volume we've
created called \`embedding-wikipedia\`, set up the Hugging Face inference server,
and run our distributed batch GPU job to embed the entire dataset.

> The Hugging Face inference server is a fast way to get started to test
> different models from Hugging Face. They offer an easy-to-use client and a
> wide range of configurations to make the most out of your infrastructure.

### Loading the Dataset

We'll be using the Hugging Face \`datasets\` library to download the dataset
before saving it explicitly into a directory of our choice for future use. In
order to do so, we'll create a file called
[\`download.py\`](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/embeddings/wikipedia/download.py),
where we’ll create our first [Modal image](/docs/guide/images) with
the \`datasets\` package installed.

> Note here that we explicitly need to commit and save new changes to our
> volume. If not, these changes will be discarded once the container is shut
> down. See more information in our docs
> [here](/docs/guide/volumes#volume-commits-and-reloads).

\`\`\`python
import modal

volume = modal.Volume.from_name("embedding-wikipedia")
image = modal.Image.debian_slim().pip_install("datasets")

app = modal.App(image=image)
cache_dir = "/data"


@app.function(volumes={cache_dir: volume}, timeout=3000)
def download_dataset(cache=False) -> None:
    from datasets import load_dataset

    # Download and save the dataset locally
    dataset = load_dataset("wikipedia", "20220301.en", num_proc=10)
    dataset.save_to_disk(f"{cache_dir}/wikipedia")

    # Commit and save to the volume
    volume.commit()
\`\`\`

You can then run this file by using the command

\`\`\`bash
modal run download.py::download_dataset
\`\`\`

### Hugging Face Embedding Inference Server

For our embedding function, we'll be using the Hugging Face
[Text Embedding Inference](https://github.com/huggingface/text-embeddings-inference)
server. We'll walk through how to leverage caching of model weights by defining
another custom Modal image, managing container state through a Modal \`cls\` , and
lastly, leveraging this new container in our other functions.

### Parameters

Let's start by defining some parameters for the \`Text Embedding Inference\`
program. In our case, we're specifying the specific embedding model we're using
and increasing the maximum batch size so that we can speed up our embedding job.

\`\`\`python
MODEL_ID = "BAAI/bge-small-en-v1.5"
BATCH_SIZE = 768

LAUNCH_FLAGS = [
    "--model-id",
    MODEL_ID,
    "--port",
    "8000",
    "--max-client-batch-size",
    str(BATCH_SIZE),
    "--max-batch-tokens",
    str(BATCH_SIZE * 512),
]

\`\`\`

### Defining Our Image

We'll be using the recommended image for A10G GPUs for this example. If you'd
like to explore other GPU models, you should make sure to download the correct
model listed
[here](https://huggingface.co/docs/text-embeddings-inference/supported_models).
Note that we also override the default entrypoint so that it is compatible with
Modal.

\`\`\`python
tei_image = (
    Image.from_registry(
        "ghcr.io/huggingface/text-embeddings-inference:86-0.4.0",
        add_python="3.10",
    )
    .entrypoint([])
    .pip_install("httpx", "numpy")
)
\`\`\`

### Creating our Modal Class

Using a Modal class enhances control over a container's lifecycle (see more
[here](/docs/guide/lifecycle-functions)):

1. Initialize once at boot with **@enter**.
2. Handle calls from other functions using **@method** decorators.
3. Clean up at shutdown with **@exit**.

We initialize a server at boot, spinning out an inference server that maintains
its state for subsequent requests and optimizes initialization costs. Modal
simplifies lifecycle management by requiring only a couple function definitions
and a decorator. Additionally, we configure the app class for specific images
and GPUs through [\`app.cls\`](https://modal.com/docs/reference/modal.App#cls)
parameters. Once we've set this up, most of our code will focus on preparing our
data and efficiently sending it to the \`TextEmbeddingsInference\` servers.

\`\`\`python
import modal

GPU_CONFIG = "A10G"


def spawn_server() -> subprocess.Popen:
    import socket

    process = subprocess.Popen(["text-embeddings-router"] + LAUNCH_FLAGS)

    # Poll until webserver at 127.0.0.1:8000 accepts connections before running inputs.
    while True:
        try:
            socket.create_connection(("127.0.0.1", 8000), timeout=1).close()
            print("Webserver ready!")
            return process
        except (socket.timeout, ConnectionRefusedError):
            # Check if launcher webserving process has exited.
            # If so, a connection can never be made.
            retcode = process.poll()
            if retcode is not None:
                raise RuntimeError(f"launcher exited unexpectedly with code {retcode}")


@app.cls(
    gpu=GPU_CONFIG,
    image=tei_image, # This is defined above
)
class TextEmbeddingsInference:

    @modal.enter()
    def open_connection(self):
        # If the process is running for a long time, the client does not seem to close the connections, results in a pool timeout
        from httpx import AsyncClient

        self.process = spawn_server()
        self.client = AsyncClient(base_url="http://127.0.0.1:8000", timeout=30)

    @modal.exit()
    def terminate_connection(self, exc_type, exc_value, traceback):
        self.process.terminate()

    async def _embed(self, chunk_batch):
        texts = [chunk[3] for chunk in chunk_batch]
        res = await self.client.post("/embed", json={"inputs": texts})
        return np.array(res.json())

    @modal.method()
    async def embed(self, chunks):
        """Embeds a list of texts.  id, url, title, text = chunks[0]"""

        # in order to send more data per request, we batch requests to
        # \`TextEmbeddingsInference\` and make concurrent requests to the endpoint
        coros = [
            self._embed(chunk_batch)
            for chunk_batch in generate_batches(chunks, batch_size=BATCH_SIZE)
        ]

        embeddings = np.concatenate(await asyncio.gather(*coros))
        return chunks, embeddings
\`\`\`

### Generating Embeddings

Let's take stock of what we've achieved so far:

- We first created a Modal \`App\`.
- Then, we created a persistent \`Volume\` that could store data in between our
  script runs and downloaded the entirety of English Wikipedia into it.
- Next, we put together our first Modal \`cls\` object using the Text Embedding
  Inference image from Docker and attached an \`A10G\` GPU to the class.
- Lastly, we defined a method we could call from other app functions using the
  \`@method\` decorator.

Now, let's see how to use the dataset that we downloaded with our container to
embed all of Wikipedia. We'll first write a small function to split our dataset
into batches before seeing how we can get our custom Modal \`cls\` object to embed
all of the chunks.

### Chunking Text

We'll be using the
[BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) model in
order to embed all of our content. This model has state-of-the-art benchmark
results at great peformance. It has a maximum sequence length of 512 tokens so
we can't pass in an entire chunk of text at once. Instead, we'll split it into
chunks of 400 characters for simplicity using the function below, but in
practice you'll want to split it more intelligently and include overlap between
chunks to avoid losing information.

\`\`\`python
def generate_chunks_from_dataset(xs, chunk_size: int = 400):
    for data in xs:
        id_ = data["id"]
        url = data["url"]
        title = data["title"]
        text = data["text"]
        for chunk_start in range(0, len(text), chunk_size):
            yield (
                id_,
                url,
                title,
                text[chunk_start : chunk_start + chunk_size],
            )

\`\`\`

To amortize the overhead of data transfer, we batch our
\`generate_chunks_from_dataset\` chunks into batches of 512 chunks each. This
allows us to pass in a batch of 512 chunks to our Modal \`cls\` object to embed at
once.

\`\`\`python
def generate_batches(xs, batch_size=512):
    batch = []
    for x in xs:
        batch.append(x)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch

\`\`\`

### Mapping the embedding function

After creating a function to batch our dataset, we can now pass these chunks to
our Modal \`cls\` object for embedding. We use a custom image with the \`datasets\`
library installed to easily load our dataset from disk. Additionally, we have
logic to extract a subset of the dataset.

To call our custom Modal \`cls\` object and use the \`.embed\` function with our
data batches, we simply use the \`.map\` function. Modal takes care of managing
the containers, serializing and deserializing inputs, and handling the lifecycle
of each container.

\`\`\`python
@app.function(
    image=Image.debian_slim().pip_install("datasets"),
    volumes={cache_dir: volume},
    timeout=5000,
)
def embed_dataset():
    dataset = load_from_disk(f"{cache_dir}/wikipedia")
    model = TextEmbeddingsInference()

    text_chunks = generate_chunks_from_dataset(dataset["train"], chunk_size=512)
    batches = generate_batches(text_chunks, batch_size=batch_size)

    # Collect the chunks and embeddings
    for batch_chunks, batch_embeddings in model.embed.map(batches, order_outputs=False):
        ...

    return
\`\`\`

Once we have this function we can use \`modal run\` on this
[\`main.py\`](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/embeddings/wikipedia/main.py)
file to execute the specific function:

\`\`\`bash
modal run main.py::embed_dataset
\`\`\`

<video controls autoplay loop muted playsinline>
  <source src="https://modal-cdn.com/embedding-wikipedia-demo.mp4" type="video/mp4">
</video>

## Further customization

### Deploying on a schedule

In a production setting, you might want to run this on a schedule as new data
comes in or as you get more user data. This allows you update data and models in
production without having to worry about the underlying infrastructure. You just
need to modify the \`@app.function\` decorator to add in a \`schedule\` parameter.
This can be modified to any arbitrary period that you'd like to use depending on
your use case.

\`\`\`python
@app.function(..., schedule=modal.Period(days=1))
def my_function():
    pass
\`\`\`

We can then deploy this function using the command

\`\`\`bash
modal deploy --name wikipedia-embedding main.py

\`\`\`

If you'd like to change the frequency, just change the schedule parameter and
re-deploy, and you're good to go!

### Uploading your dataset

If you check out our example code, you'll notice that we've uploaded the
embedded dataset to a
[public Hugging Face dataset](https://huggingface.co/datasets/567-labs/wikipedia-bge-small-en-v1.5-full).
We provide some details in the README on how to do this. In practice, how you
handle this data will depend on your use case. You can also can follow similar
steps to upload it to a private dataset or insert it into your favorite vector
database.

### GPUs go brr

For free accounts, Modal caps the concurrent number of GPUs that can be used
to 10. Using 10 GPUs in parallel still greatly speeds up the embedding job, but
if you are on a [paid plan](https://modal.com/pricing), the GPU limit can be
raised.

All we really need to do then is crank up the value of \`max_containers\` to a
number like 50, and we'll end up with 50 separate containers (each with their
own \`A10G\` GPU) processing batches of text to be embedded.

\`\`\`python
@app.cls(
    gpu=GPU_CONFIG,
    image=tei_image,
    max_containers=50,  # Number of concurrent containers that can be spawned to handle the task
)
class TextEmbeddingsInference:
    # Rest of code below
\`\`\`

## Conclusion

In this post, we show how to use some of Modal’s abstractions to run massive
parallelizable jobs at scale. Having the ability to scale unlocks new business
use cases for companies that can now iterate on production models more quickly
and efficiently. By shortening the feedback loop with Modal's serverless GPUs,
teams are free to focus on experimentation and deployment.

We've uploaded our full code
[here](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/embeddings/wikipedia),
which helps you quickly get started and also showcases how to upload your own
generated embeddings to Hugging Face. You can also check out some
[example datasets](https://huggingface.co/567-labs) that contain embeddings we
computed using some popular open source embedding models.

Try running your own large-scale batch jobs by
[creating your free Modal account](https://modal.com/signup), and follow
[@modal](https://x.com/modal) on X/Twitter to stay posted on
upcoming posts on further customizing your embeddings workflow.
`,meta:{description:`Leverage Modal’s parallel batch jobs and in-house storage features to quickly generate embeddings for billions of tokens.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,published:b,layout:x,githubLink:S,toc:C,rawContent:w,meta:T}=p,E=t(`<code>text-embedding-ada-002</code>`),ee=t(`<code>Volume</code>`),te=t(`<code>download.py</code>`),ne=t(`<code>app.cls</code>`),D=t(`<code>main.py</code>`),O=t(`<p>Text embeddings are a key component of production-ready applications using large
language models (LLMs). A text embedding model transforms chunks of text into
vectors of floating-point numbers that represent their semantic meaning,
allowing us to quantitatively compare strings for similarity. Creating
embeddings on a large corpus of text enables us to build applications like
search and recommendation engines, as well as give additional context to LLMs
for Retrieval-Augmented Generation (RAG) on custom documents.</p> <p>Embedding models behind APIs like OpenAI’s <!> are a great way to get started with building for these use cases. However, as
you gather user data and tailor your applications using that data, you will
likely get <strong>higher-quality results at lower cost</strong> if you used this data to <!> an open-source embedding model. This
requires setting up large-scale embedding jobs, which can be a challenge due to
rate limits, infrastructure complexity, and the infeasibility of getting a large
number of GPUs for short bursts of time. So what can we do? Enter Modal.</p> <p>Modal provides a serverless solution for organizations grappling with scaling
workloads. Modal’s technology enables rapid scaling across many GPUs, which we
can use to run large-scale workloads, such as generating embeddings for a
massive text dataset, at lightning speed. In this post, we’ll go over everything
you need to embed the entire English Wikipedia in just 15 minutes using Hugging
Face’s <!> service on Modal. Using Modal’s serverless solution, this job comes out to just
over $15.</p> <p>More specifically, we will:</p> <ol><li>Discuss the advantages of using open source models.</li> <li>Explain the fundamentals of using Modal.</li> <li>Guide you through the necessary code to implement our embedding client on the
Wikipedia dataset.</li></ol> <p>Shortening the embedding generation time from multiple hours to just a few
minutes enables more frequent experimentation, which is crucial for continuous
model fine-tuning in production use cases (as you have to regenerate embeddings
for your entire corpus of data every time). In future posts, we’ll delve into
using Modal for other aspects of this workflow (running grid search on and
fine-tuning your own embedding models) to create more tailored user experiences.</p> <h2 id="why-open-source-models">Why open-source models?</h2> <p>Closed-source models are a great way to get started with creating and using
embeddings, but they run into two critical limitations in production:</p> <ol><li>As you run your model in production, you gather a corpus of rich preference
data that can be used to improve the performance of your model. However,
fine-tuning proprietary models with this custom data you’ve gathered is
either impossible or highly cost-prohibitive.</li> <li>Remote APIs have a number of drawbacks, such as rate limits, unreliable tail
latencies, and high costs associated with tokens rather than compute time.</li></ol> <p>For these reasons, we believe that open-source embedding models that
progressively get better with fine-tuning are best suited for embedding use
cases like RAG workflows in production. Thousands of <!> are available on Hugging Face.</p> <h2 id="why-modal">Why Modal?</h2> <p>Model makes it easy to run your code in the cloud and push to production. By
only paying for what you use, and abstracting away all the complexity of
deploying and serving, Modal provides a simplified process to help you focus on
what’s important—your product.</p> <blockquote><p>To follow along with some of these examples, you’ll need to <!>. You’ll get $30 out of the box and all of
the features to try out immediately. Once you’ve done so, make sure to <!> using a
virtual environment of your choice, and you can run all of the code we provide
below.</p></blockquote> <h2 id="modal-concepts">Modal Concepts</h2> <p>Before we dive into the code, let’s take a look at some of the key concepts that
Modal provides that will allow us to run our embedding job quickly and
efficiently. In order to understand that, we’ll need to look at two concepts - a <code>Function</code> and a <!>.</p> <h3 id="functions">Functions</h3> <p>Modal functions package the code you want to run, along with their environment.
They describe the image, the requirements, and the storage we want to attach in
order to get the job done.</p> <!> <p>Using Modal functions, you could for example, provision on-demand GPUs for
fine-tuning workloads, define endpoints to serve large language models at scale,
and even spin up hundreds of containers to process large datasets in parallel.</p> <h3 id="volumes">Volumes</h3> <p>In order to load large datasets and models efficiently, we can use Modal’s <!> feature. Volumes are a way to mount data into
your containers and allow you to read and write to them as if they were a local
file system. You can create a new volume using the <code>modal volume create</code> command.</p> <h2 id="embedding-wikipedia">Embedding Wikipedia</h2> <p>Now that we’ve got a good understanding of some key concepts that Modal
provides, let’s load the <code>wikipedia</code> dataset in a persistent volume we’ve
created called <code>embedding-wikipedia</code>, set up the Hugging Face inference server,
and run our distributed batch GPU job to embed the entire dataset.</p> <blockquote><p>The Hugging Face inference server is a fast way to get started to test
different models from Hugging Face. They offer an easy-to-use client and a
wide range of configurations to make the most out of your infrastructure.</p></blockquote> <h3 id="loading-the-dataset">Loading the Dataset</h3> <p>We’ll be using the Hugging Face <code>datasets</code> library to download the dataset
before saving it explicitly into a directory of our choice for future use. In
order to do so, we’ll create a file called <!>,
where we’ll create our first <!> with
the <code>datasets</code> package installed.</p> <blockquote><p>Note here that we explicitly need to commit and save new changes to our
volume. If not, these changes will be discarded once the container is shut
down. See more information in our docs <!>.</p></blockquote> <!> <p>You can then run this file by using the command</p> <!> <h3 id="hugging-face-embedding-inference-server">Hugging Face Embedding Inference Server</h3> <p>For our embedding function, we’ll be using the Hugging Face <!> server. We’ll walk through how to leverage caching of model weights by defining
another custom Modal image, managing container state through a Modal <code>cls</code> , and
lastly, leveraging this new container in our other functions.</p> <h3 id="parameters">Parameters</h3> <p>Let’s start by defining some parameters for the <code>Text Embedding Inference</code> program. In our case, we’re specifying the specific embedding model we’re using
and increasing the maximum batch size so that we can speed up our embedding job.</p> <!> <h3 id="defining-our-image">Defining Our Image</h3> <p>We’ll be using the recommended image for A10G GPUs for this example. If you’d
like to explore other GPU models, you should make sure to download the correct
model listed <!>.
Note that we also override the default entrypoint so that it is compatible with
Modal.</p> <!> <h3 id="creating-our-modal-class">Creating our Modal Class</h3> <p>Using a Modal class enhances control over a container’s lifecycle (see more <!>):</p> <ol><li>Initialize once at boot with <strong>@enter</strong>.</li> <li>Handle calls from other functions using <strong>@method</strong> decorators.</li> <li>Clean up at shutdown with <strong>@exit</strong>.</li></ol> <p>We initialize a server at boot, spinning out an inference server that maintains
its state for subsequent requests and optimizes initialization costs. Modal
simplifies lifecycle management by requiring only a couple function definitions
and a decorator. Additionally, we configure the app class for specific images
and GPUs through <!> parameters. Once we’ve set this up, most of our code will focus on preparing our
data and efficiently sending it to the <code>TextEmbeddingsInference</code> servers.</p> <!> <h3 id="generating-embeddings">Generating Embeddings</h3> <p>Let’s take stock of what we’ve achieved so far:</p> <ul><li>We first created a Modal <code>App</code>.</li> <li>Then, we created a persistent <code>Volume</code> that could store data in between our
script runs and downloaded the entirety of English Wikipedia into it.</li> <li>Next, we put together our first Modal <code>cls</code> object using the Text Embedding
Inference image from Docker and attached an <code>A10G</code> GPU to the class.</li> <li>Lastly, we defined a method we could call from other app functions using the <code>@method</code> decorator.</li></ul> <p>Now, let’s see how to use the dataset that we downloaded with our container to
embed all of Wikipedia. We’ll first write a small function to split our dataset
into batches before seeing how we can get our custom Modal <code>cls</code> object to embed
all of the chunks.</p> <h3 id="chunking-text">Chunking Text</h3> <p>We’ll be using the <!> model in
order to embed all of our content. This model has state-of-the-art benchmark
results at great peformance. It has a maximum sequence length of 512 tokens so
we can’t pass in an entire chunk of text at once. Instead, we’ll split it into
chunks of 400 characters for simplicity using the function below, but in
practice you’ll want to split it more intelligently and include overlap between
chunks to avoid losing information.</p> <!> <p>To amortize the overhead of data transfer, we batch our <code>generate_chunks_from_dataset</code> chunks into batches of 512 chunks each. This
allows us to pass in a batch of 512 chunks to our Modal <code>cls</code> object to embed at
once.</p> <!> <h3 id="mapping-the-embedding-function">Mapping the embedding function</h3> <p>After creating a function to batch our dataset, we can now pass these chunks to
our Modal <code>cls</code> object for embedding. We use a custom image with the <code>datasets</code> library installed to easily load our dataset from disk. Additionally, we have
logic to extract a subset of the dataset.</p> <p>To call our custom Modal <code>cls</code> object and use the <code>.embed</code> function with our
data batches, we simply use the <code>.map</code> function. Modal takes care of managing
the containers, serializing and deserializing inputs, and handling the lifecycle
of each container.</p> <!> <p>Once we have this function we can use <code>modal run</code> on this <!> file to execute the specific function:</p> <!> <video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/embedding-wikipedia-demo.mp4" type="video/mp4"/></video> <h2 id="further-customization">Further customization</h2> <h3 id="deploying-on-a-schedule">Deploying on a schedule</h3> <p>In a production setting, you might want to run this on a schedule as new data
comes in or as you get more user data. This allows you update data and models in
production without having to worry about the underlying infrastructure. You just
need to modify the <code>@app.function</code> decorator to add in a <code>schedule</code> parameter.
This can be modified to any arbitrary period that you’d like to use depending on
your use case.</p> <!> <p>We can then deploy this function using the command</p> <!> <p>If you’d like to change the frequency, just change the schedule parameter and
re-deploy, and you’re good to go!</p> <h3 id="uploading-your-dataset">Uploading your dataset</h3> <p>If you check out our example code, you’ll notice that we’ve uploaded the
embedded dataset to a <!>.
We provide some details in the README on how to do this. In practice, how you
handle this data will depend on your use case. You can also can follow similar
steps to upload it to a private dataset or insert it into your favorite vector
database.</p> <h3 id="gpus-go-brr">GPUs go brr</h3> <p>For free accounts, Modal caps the concurrent number of GPUs that can be used
to 10. Using 10 GPUs in parallel still greatly speeds up the embedding job, but
if you are on a <!>, the GPU limit can be
raised.</p> <p>All we really need to do then is crank up the value of <code>max_containers</code> to a
number like 50, and we’ll end up with 50 separate containers (each with their
own <code>A10G</code> GPU) processing batches of text to be embedded.</p> <!> <h2 id="conclusion">Conclusion</h2> <p>In this post, we show how to use some of Modal’s abstractions to run massive
parallelizable jobs at scale. Having the ability to scale unlocks new business
use cases for companies that can now iterate on production models more quickly
and efficiently. By shortening the feedback loop with Modal’s serverless GPUs,
teams are free to focus on experimentation and deployment.</p> <p>We’ve uploaded our full code <!>,
which helps you quickly get started and also showcases how to upload your own
generated embeddings to Hugging Face. You can also check out some <!> that contain embeddings we
computed using some popular open source embedding models.</p> <p>Try running your own large-scale batch jobs by <!>, and follow <!> on X/Twitter to stay posted on
upcoming posts on further customizing your embeddings workflow.</p>`,3);function k(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=O(),f=c(s(o),2),p=c(e(f));d(p,{href:`https://platform.openai.com/docs/api-reference/embeddings`,rel:`nofollow`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),d(c(p,4),{href:`/docs/examples/llm-finetuning`,children:(e,t)=>{l(),i(e,r(`fine-tune`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,2);d(c(e(m)),{href:`https://huggingface.co/docs/text-embeddings-inference/index`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Text Embedding Inference`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,14);d(c(e(h)),{href:`https://huggingface.co/models?pipeline_tag=sentence-similarity&sort=trending`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`open-source models`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,6),_=e(g),v=c(e(_));d(v,{href:`/signup`,children:(e,t)=>{l(),i(e,r(`create a Modal account`))},$$slots:{default:!0}}),d(c(v,2),{href:`https://pypi.org/project/modal/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`install the Modal Python package`))},$$slots:{default:!0}}),l(),n(_),n(g);var y=c(g,4);d(c(e(y),3),{href:`/docs/guide/volumes`,children:(e,t)=>{i(e,ee())},$$slots:{default:!0}}),l(),n(y);var b=c(y,6);u(b,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0Apandas_image%20%3D%20modal.Image.debian_slim().pip_install(%22pandas%22)%0Avolume%20%3D%20modal.Volume.from_name(%22embedding-wikipedia%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.function(image%3Dpandas_image%2C%20gpu%3D%22A100%22%2C%20volumes%3D%7B%22%2Froot%2Ffoo%22%3A%20volume%7D)%0Adef%20my_fn()%3A%0A%20%20%20%20%23%20perform%20tasks%20here`,lang:`python`});var x=c(b,6);d(c(e(x)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(3),n(x);var S=c(x,10),C=c(e(S),3);d(C,{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/embeddings/wikipedia/download.py`,rel:`nofollow`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}}),d(c(C,2),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`Modal image`))},$$slots:{default:!0}}),l(3),n(S);var w=c(S,2),T=e(w);d(c(e(T)),{href:`/docs/guide/volumes#volume-commits-and-reloads`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(T),n(w);var k=c(w,2);u(k,{code:`import%20modal%0A%0Avolume%20%3D%20modal.Volume.from_name(%22embedding-wikipedia%22)%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22datasets%22)%0A%0Aapp%20%3D%20modal.App(image%3Dimage)%0Acache_dir%20%3D%20%22%2Fdata%22%0A%0A%0A%40app.function(volumes%3D%7Bcache_dir%3A%20volume%7D%2C%20timeout%3D3000)%0Adef%20download_dataset(cache%3DFalse)%20-%3E%20None%3A%0A%20%20%20%20from%20datasets%20import%20load_dataset%0A%0A%20%20%20%20%23%20Download%20and%20save%20the%20dataset%20locally%0A%20%20%20%20dataset%20%3D%20load_dataset(%22wikipedia%22%2C%20%2220220301.en%22%2C%20num_proc%3D10)%0A%20%20%20%20dataset.save_to_disk(f%22%7Bcache_dir%7D%2Fwikipedia%22)%0A%0A%20%20%20%20%23%20Commit%20and%20save%20to%20the%20volume%0A%20%20%20%20volume.commit()`,lang:`python`});var A=c(k,4);u(A,{code:`modal%20run%20download.py%3A%3Adownload_dataset`,lang:`bash`});var j=c(A,4);d(c(e(j)),{href:`https://github.com/huggingface/text-embeddings-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Text Embedding Inference`))},$$slots:{default:!0}}),l(3),n(j);var M=c(j,6);u(M,{code:`MODEL_ID%20%3D%20%22BAAI%2Fbge-small-en-v1.5%22%0ABATCH_SIZE%20%3D%20768%0A%0ALAUNCH_FLAGS%20%3D%20%5B%0A%20%20%20%20%22--model-id%22%2C%0A%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%22--port%22%2C%0A%20%20%20%20%228000%22%2C%0A%20%20%20%20%22--max-client-batch-size%22%2C%0A%20%20%20%20str(BATCH_SIZE)%2C%0A%20%20%20%20%22--max-batch-tokens%22%2C%0A%20%20%20%20str(BATCH_SIZE%20*%20512)%2C%0A%5D%0A`,lang:`python`});var N=c(M,4);d(c(e(N)),{href:`https://huggingface.co/docs/text-embeddings-inference/supported_models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);u(P,{code:`tei_image%20%3D%20(%0A%20%20%20%20Image.from_registry(%0A%20%20%20%20%20%20%20%20%22ghcr.io%2Fhuggingface%2Ftext-embeddings-inference%3A86-0.4.0%22%2C%0A%20%20%20%20%20%20%20%20add_python%3D%223.10%22%2C%0A%20%20%20%20)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.pip_install(%22httpx%22%2C%20%22numpy%22)%0A)`,lang:`python`});var F=c(P,4);d(c(e(F)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,4);d(c(e(I)),{href:`https://modal.com/docs/reference/modal.App#cls`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),l(3),n(I);var L=c(I,2);u(L,{code:`import%20modal%0A%0AGPU_CONFIG%20%3D%20%22A10G%22%0A%0A%0Adef%20spawn_server()%20-%3E%20subprocess.Popen%3A%0A%20%20%20%20import%20socket%0A%0A%20%20%20%20process%20%3D%20subprocess.Popen(%5B%22text-embeddings-router%22%5D%20%2B%20LAUNCH_FLAGS)%0A%0A%20%20%20%20%23%20Poll%20until%20webserver%20at%20127.0.0.1%3A8000%20accepts%20connections%20before%20running%20inputs.%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20socket.create_connection((%22127.0.0.1%22%2C%208000)%2C%20timeout%3D1).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Webserver%20ready!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20process%0A%20%20%20%20%20%20%20%20except%20(socket.timeout%2C%20ConnectionRefusedError)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Check%20if%20launcher%20webserving%20process%20has%20exited.%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20If%20so%2C%20a%20connection%20can%20never%20be%20made.%0A%20%20%20%20%20%20%20%20%20%20%20%20retcode%20%3D%20process.poll()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20retcode%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22launcher%20exited%20unexpectedly%20with%20code%20%7Bretcode%7D%22)%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20image%3Dtei_image%2C%20%23%20This%20is%20defined%20above%0A)%0Aclass%20TextEmbeddingsInference%3A%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20open_connection(self)%3A%0A%20%20%20%20%20%20%20%20%23%20If%20the%20process%20is%20running%20for%20a%20long%20time%2C%20the%20client%20does%20not%20seem%20to%20close%20the%20connections%2C%20results%20in%20a%20pool%20timeout%0A%20%20%20%20%20%20%20%20from%20httpx%20import%20AsyncClient%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20spawn_server()%0A%20%20%20%20%20%20%20%20self.client%20%3D%20AsyncClient(base_url%3D%22http%3A%2F%2F127.0.0.1%3A8000%22%2C%20timeout%3D30)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20terminate_connection(self%2C%20exc_type%2C%20exc_value%2C%20traceback)%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()%0A%0A%20%20%20%20async%20def%20_embed(self%2C%20chunk_batch)%3A%0A%20%20%20%20%20%20%20%20texts%20%3D%20%5Bchunk%5B3%5D%20for%20chunk%20in%20chunk_batch%5D%0A%20%20%20%20%20%20%20%20res%20%3D%20await%20self.client.post(%22%2Fembed%22%2C%20json%3D%7B%22inputs%22%3A%20texts%7D)%0A%20%20%20%20%20%20%20%20return%20np.array(res.json())%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20embed(self%2C%20chunks)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Embeds%20a%20list%20of%20texts.%20%20id%2C%20url%2C%20title%2C%20text%20%3D%20chunks%5B0%5D%22%22%22%0A%0A%20%20%20%20%20%20%20%20%23%20in%20order%20to%20send%20more%20data%20per%20request%2C%20we%20batch%20requests%20to%0A%20%20%20%20%20%20%20%20%23%20%60TextEmbeddingsInference%60%20and%20make%20concurrent%20requests%20to%20the%20endpoint%0A%20%20%20%20%20%20%20%20coros%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20self._embed(chunk_batch)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20chunk_batch%20in%20generate_batches(chunks%2C%20batch_size%3DBATCH_SIZE)%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20embeddings%20%3D%20np.concatenate(await%20asyncio.gather(*coros))%0A%20%20%20%20%20%20%20%20return%20chunks%2C%20embeddings`,lang:`python`});var R=c(L,12);d(c(e(R)),{href:`https://huggingface.co/BAAI/bge-small-en-v1.5`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`BAAI/bge-small-en-v1.5`))},$$slots:{default:!0}}),l(),n(R);var z=c(R,2);u(z,{code:`def%20generate_chunks_from_dataset(xs%2C%20chunk_size%3A%20int%20%3D%20400)%3A%0A%20%20%20%20for%20data%20in%20xs%3A%0A%20%20%20%20%20%20%20%20id_%20%3D%20data%5B%22id%22%5D%0A%20%20%20%20%20%20%20%20url%20%3D%20data%5B%22url%22%5D%0A%20%20%20%20%20%20%20%20title%20%3D%20data%5B%22title%22%5D%0A%20%20%20%20%20%20%20%20text%20%3D%20data%5B%22text%22%5D%0A%20%20%20%20%20%20%20%20for%20chunk_start%20in%20range(0%2C%20len(text)%2C%20chunk_size)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id_%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%5Bchunk_start%20%3A%20chunk_start%20%2B%20chunk_size%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A`,lang:`python`});var B=c(z,4);u(B,{code:`def%20generate_batches(xs%2C%20batch_size%3D512)%3A%0A%20%20%20%20batch%20%3D%20%5B%5D%0A%20%20%20%20for%20x%20in%20xs%3A%0A%20%20%20%20%20%20%20%20batch.append(x)%0A%20%20%20%20%20%20%20%20if%20len(batch)%20%3D%3D%20batch_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20batch%20%3D%20%5B%5D%0A%20%20%20%20if%20batch%3A%0A%20%20%20%20%20%20%20%20yield%20batch%0A`,lang:`python`});var V=c(B,8);u(V,{code:`%40app.function(%0A%20%20%20%20image%3DImage.debian_slim().pip_install(%22datasets%22)%2C%0A%20%20%20%20volumes%3D%7Bcache_dir%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D5000%2C%0A)%0Adef%20embed_dataset()%3A%0A%20%20%20%20dataset%20%3D%20load_from_disk(f%22%7Bcache_dir%7D%2Fwikipedia%22)%0A%20%20%20%20model%20%3D%20TextEmbeddingsInference()%0A%0A%20%20%20%20text_chunks%20%3D%20generate_chunks_from_dataset(dataset%5B%22train%22%5D%2C%20chunk_size%3D512)%0A%20%20%20%20batches%20%3D%20generate_batches(text_chunks%2C%20batch_size%3Dbatch_size)%0A%0A%20%20%20%20%23%20Collect%20the%20chunks%20and%20embeddings%0A%20%20%20%20for%20batch_chunks%2C%20batch_embeddings%20in%20model.embed.map(batches%2C%20order_outputs%3DFalse)%3A%0A%20%20%20%20%20%20%20%20...%0A%0A%20%20%20%20return`,lang:`python`});var H=c(V,2);d(c(e(H),3),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/embeddings/wikipedia/main.py`,rel:`nofollow`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);u(U,{code:`modal%20run%20main.py%3A%3Aembed_dataset`,lang:`bash`});var W=c(U,2);W.muted=!0;var G=c(W,8);u(G,{code:`%40app.function(...%2C%20schedule%3Dmodal.Period(days%3D1))%0Adef%20my_function()%3A%0A%20%20%20%20pass`,lang:`python`});var K=c(G,4);u(K,{code:`modal%20deploy%20--name%20wikipedia-embedding%20main.py%0A`,lang:`bash`});var q=c(K,6);d(c(e(q)),{href:`https://huggingface.co/datasets/567-labs/wikipedia-bge-small-en-v1.5-full`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`public Hugging Face dataset`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,4);d(c(e(J)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`paid plan`))},$$slots:{default:!0}}),l(),n(J);var Y=c(J,4);u(Y,{code:`%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20image%3Dtei_image%2C%0A%20%20%20%20max_containers%3D50%2C%20%20%23%20Number%20of%20concurrent%20containers%20that%20can%20be%20spawned%20to%20handle%20the%20task%0A)%0Aclass%20TextEmbeddingsInference%3A%0A%20%20%20%20%23%20Rest%20of%20code%20below`,lang:`python`});var X=c(Y,6),Z=c(e(X));d(Z,{href:`https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/embeddings/wikipedia`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),d(c(Z,2),{href:`https://huggingface.co/567-labs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`example datasets`))},$$slots:{default:!0}}),l(),n(X);var Q=c(X,2),$=c(e(Q));d($,{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`creating your free Modal account`))},$$slots:{default:!0}}),d(c($,2),{href:`https://x.com/modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`@modal`))},$$slots:{default:!0}}),l(),n(Q),i(t,o)},$$slots:{default:!0}}))}export{k as default,p as metadata};
//# sourceMappingURL=D04rJYub.js.map
