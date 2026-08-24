(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bf98f41d-940a-42d7-a144-bfb465def8d7`,e._sentryDebugIdIdentifier=`sentry-dbid-bf98f41d-940a-42d7-a144-bfb465def8d7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Chat with PDF: RAG with ColQwen2`,id:`chat-with-pdf-rag-with-colqwen2`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Setting up dependencies`,id:`setting-up-dependencies`},{depth:2,value:`Specifying the ColQwen2 model`,id:`specifying-the-colqwen2-model`},{depth:2,value:`Managing state with Modal Volumes and Dicts`,id:`managing-state-with-modal-volumes-and-dicts`,children:[{depth:3,value:`Managing chat sessions with Modal Dicts`,id:`managing-chat-sessions-with-modal-dicts`},{depth:3,value:`Storing PDFs on a Modal Volume`,id:`storing-pdfs-on-a-modal-volume`},{depth:3,value:`Caching the model weights`,id:`caching-the-model-weights`}]},{depth:2,value:`Defining a Chat with PDF service`,id:`defining-a-chat-with-pdf-service`},{depth:2,value:`Loading PDFs as images`,id:`loading-pdfs-as-images`},{depth:2,value:`Chatting with a PDF from the terminal`,id:`chatting-with-a-pdf-from-the-terminal`},{depth:2,value:`A hosted Gradio interface`,id:`a-hosted-gradio-interface`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Chat with PDF: RAG with ColQwen2

In this example, we demonstrate how to use the the [ColQwen2](https://huggingface.co/vidore/colqwen2-v0.1) model to build a simple
"Chat with PDF" retrieval-augmented generation (RAG) app.
The ColQwen2 model is based on [ColPali](https://huggingface.co/blog/manu/colpali) but uses the
[Qwen2-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct) vision-language model.
ColPali is in turn based on the late-interaction embedding approach pioneered in [ColBERT](https://dl.acm.org/doi/pdf/10.1145/3397271.3401075).

Vision-language models with high-quality embeddings obviate the need for complex pre-processing pipelines.
See [this blog post from Jo Bergum of Vespa](https://blog.vespa.ai/announcing-colbert-embedder-in-vespa/) for more.

## Setup

First, we’ll import the libraries we need locally and define some constants.

\`\`\`python
from pathlib import Path
from typing import Optional
from urllib.request import urlopen
from uuid import uuid4

import modal

MINUTES = 60  # seconds

app = modal.App("example-chat-with-pdf-vision")

\`\`\`

## Setting up dependencies

In Modal, we define [container images](https://modal.com/docs/guide/custom-container) that run our serverless workloads.
We install the packages required for our application in those images.

\`\`\`python
CACHE_DIR = "/hf-cache"

model_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git")
    .uv_pip_install(
        [
            "colpali-engine==0.3.5",
            "transformers>=4.45.0",
            "torch>=2.0.0",
            "huggingface-hub==0.36.0",
            "qwen-vl-utils==0.0.8",
            "torchvision==0.19.1",
        ]
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HUB_CACHE": CACHE_DIR})
)

\`\`\`

These dependencies are only installed remotely, so we can't import them locally.
Use the \`.imports\` context manager to import them only on Modal instead.

\`\`\`python
with model_image.imports():
    import torch
    from colpali_engine.models import ColQwen2, ColQwen2Processor
    from qwen_vl_utils import process_vision_info
    from transformers import AutoProcessor, Qwen2VLForConditionalGeneration

\`\`\`

## Specifying the ColQwen2 model

Vision-language models (VLMs) for embedding and generation add another layer of simplification
to RAG apps based on vector search: we only need one model.

\`\`\`python
MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"
MODEL_REVISION = "aca78372505e6cb469c4fa6a35c60265b00ff5a4"

\`\`\`

## Managing state with Modal Volumes and Dicts

Chat services are stateful:
the response to an incoming user message depends on past user messages in a session.

RAG apps add even more state:
the documents being retrieved from and the index over those documents,
e.g. the embeddings.

Modal Functions are stateless in and of themselves.
They don't retain information from input to input.
That's what enables Modal Functions to automatically scale up and down
[based on the number of incoming requests](https://modal.com/docs/guide/cold-start).

### Managing chat sessions with Modal Dicts

In this example, we use a [\`modal.Dict\`](https://modal.com/docs/guide/dicts-and-queues)
to store state information between Function calls.

Modal Dicts behave similarly to Python dictionaries,
but they are backed by remote storage and accessible to all of your Modal Functions.
They can contain any Python object
that can be serialized using [\`cloudpickle\`](https://github.com/cloudpipe/cloudpickle).

A Dict can hold a few gigabytes across keys of size up to 100 MiB,
so it works well for our chat session state, which is a few KiB per session,
and for our embeddings, which are a few hundred KiB per PDF page,
up to about 100,000 pages of PDFs.

At a larger scale, we'd need to replace this with a database, like Postgres,
or push more state to the client.

\`\`\`python
sessions = modal.Dict.from_name("colqwen-chat-sessions", create_if_missing=True)


class Session:
    def __init__(self):
        self.images = None
        self.messages = []
        self.pdf_embeddings = None


\`\`\`

### Storing PDFs on a Modal Volume

Images extracted from PDFs are larger than our session state or embeddings
-- low tens of MiB per page.

So we store them on a [Modal Volume](https://modal.com/docs/guide/volumes),
which can store terabytes (or more!) of data across tens of thousands of files.

Volumes behave like a remote file system:
we read and write from them much like a local file system.

\`\`\`python
pdf_volume = modal.Volume.from_name("colqwen-chat-pdfs", create_if_missing=True)
PDF_ROOT = Path("/vol/pdfs/")

\`\`\`

### Caching the model weights

We'll also use a Volume to cache the model weights.

\`\`\`python
cache_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


\`\`\`

Running this function will download the model weights to the cache volume.
Otherwise, the model weights will be downloaded on the first query. For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
@app.function(
    image=model_image, volumes={CACHE_DIR: cache_volume}, timeout=20 * MINUTES
)
def download_model():
    from huggingface_hub import snapshot_download

    result = snapshot_download(
        MODEL_NAME,
        revision=MODEL_REVISION,
        ignore_patterns=["*.pt", "*.bin"],  # using safetensors
    )
    print(f"Downloaded model weights to {result}")


\`\`\`

## Defining a Chat with PDF service

To deploy an autoscaling "Chat with PDF" vision-language model service on Modal,
we just need to wrap our Python logic in a [Modal App](https://modal.com/docs/guide/apps):

It uses [Modal \`@app.cls\`](https://modal.com/docs/guide/lifecycle-functions) decorators
to organize the "lifecycle" of the app:
loading the model on container start (\`@modal.enter\`) and running inference on request (\`@modal.method\`).

We include in the arguments to the \`@app.cls\` decorator
all the information about this service's infrastructure:
the container image, the remote storage, and the GPU requirements.

\`\`\`python
@app.cls(
    image=model_image,
    gpu="A100-80GB",
    scaledown_window=10 * MINUTES,  # spin down when inactive
    volumes={"/vol/pdfs/": pdf_volume, CACHE_DIR: cache_volume},
)
class Model:
    @modal.enter()
    def load_models(self):
        self.colqwen2_model = ColQwen2.from_pretrained(
            "vidore/colqwen2-v0.1",
            torch_dtype=torch.bfloat16,
            device_map="cuda:0",
        )
        self.colqwen2_processor = ColQwen2Processor.from_pretrained(
            "vidore/colqwen2-v0.1"
        )
        self.qwen2_vl_model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_NAME,
            revision=MODEL_REVISION,
            torch_dtype=torch.bfloat16,
        )
        self.qwen2_vl_model.to("cuda:0")
        self.qwen2_vl_processor = AutoProcessor.from_pretrained(
            "Qwen/Qwen2-VL-2B-Instruct", trust_remote_code=True
        )

    @modal.method()
    def index_pdf(self, session_id, target: bytes | list):
        # We store concurrent user chat sessions in a modal.Dict

        # For simplicity, we assume that each user only runs one session at a time

        session = sessions.get(session_id)
        if session is None:
            session = Session()

        if isinstance(target, bytes):
            images = convert_pdf_to_images.remote(target)
        else:
            images = target

        # Store images on a Volume for later retrieval
        session_dir = PDF_ROOT / f"{session_id}"
        session_dir.mkdir(exist_ok=True, parents=True)
        for ii, image in enumerate(images):
            filename = session_dir / f"{str(ii).zfill(3)}.jpg"
            image.save(filename)

        # Generated embeddings from the image(s)
        BATCH_SZ = 4
        pdf_embeddings = []
        batches = [images[i : i + BATCH_SZ] for i in range(0, len(images), BATCH_SZ)]
        for batch in batches:
            batch_images = self.colqwen2_processor.process_images(batch).to(
                self.colqwen2_model.device
            )
            pdf_embeddings += list(self.colqwen2_model(**batch_images).to("cpu"))

        # Store the image embeddings in the session, for later retrieval
        session.pdf_embeddings = pdf_embeddings

        # Write embeddings back to the modal.Dict
        sessions[session_id] = session

    @modal.method()
    def respond_to_message(self, session_id, message):
        session = sessions.get(session_id)
        if session is None:
            session = Session()

        pdf_volume.reload()  # make sure we have the latest data

        images = (PDF_ROOT / str(session_id)).glob("*.jpg")
        images = list(sorted(images, key=lambda p: int(p.stem)))

        # Nothing to chat about without a PDF!
        if not images:
            return "Please upload a PDF first"
        elif session.pdf_embeddings is None:
            return "Indexing PDF..."

        # RAG, Retrieval-Augmented Generation, is two steps:

        # _Retrieval_ of the most relevant data to answer the user's query
        relevant_image = self.get_relevant_image(message, session, images)

        # _Generation_ based on the retrieved data
        output_text = self.generate_response(message, session, relevant_image)

        # Update session state for future chats
        append_to_messages(message, session, user_type="user")
        append_to_messages(output_text, session, user_type="assistant")
        sessions[session_id] = session

        return output_text

    # Retrieve the most relevant image from the PDF for the input query
    def get_relevant_image(self, message, session, images):
        import PIL

        batch_queries = self.colqwen2_processor.process_queries([message]).to(
            self.colqwen2_model.device
        )
        query_embeddings = self.colqwen2_model(**batch_queries)

        # This scores our query embedding against the image embeddings from index_pdf
        scores = self.colqwen2_processor.score_multi_vector(
            query_embeddings, session.pdf_embeddings
        )[0]

        # Select the best matching image
        max_index = max(range(len(scores)), key=lambda index: scores[index])
        return PIL.Image.open(images[max_index])

    # Pass the query and retrieved image along with conversation history into the VLM for a response
    def generate_response(self, message, session, image):
        chatbot_message = get_chatbot_message_with_image(message, image)
        query = self.qwen2_vl_processor.apply_chat_template(
            [*session.messages, chatbot_message],
            tokenize=False,
            add_generation_prompt=True,
        )
        image_inputs, _ = process_vision_info([chatbot_message])
        inputs = self.qwen2_vl_processor(
            text=[query],
            images=image_inputs,
            padding=True,
            return_tensors="pt",
        )
        inputs = inputs.to("cuda:0")

        generated_ids = self.qwen2_vl_model.generate(**inputs, max_new_tokens=512)
        generated_ids_trimmed = [
            out_ids[len(in_ids) :]
            for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = self.qwen2_vl_processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )[0]
        return output_text


\`\`\`

## Loading PDFs as images

Vision-Language Models operate on images, not PDFs directly,
so we need to convert our PDFs into images first.

We separate this from our indexing and chatting logic --
we run on a different container with different dependencies.

\`\`\`python
pdf_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("poppler-utils")
    .uv_pip_install("pdf2image==1.17.0", "pillow==10.4.0")
)


@app.function(image=pdf_image)
def convert_pdf_to_images(pdf_bytes):
    from pdf2image import convert_from_bytes

    images = convert_from_bytes(pdf_bytes, fmt="jpeg")
    return images


\`\`\`

## Chatting with a PDF from the terminal

Before deploying in a UI, we can test our service from the terminal.

Just run
\`\`\`bash
modal run chat_with_pdf_vision.py
\`\`\`

and optionally pass in a path to or URL of a PDF with the \`--pdf-path\` argument
and specify a question with the \`--question\` argument.

Continue a previous chat by passing the session ID printed to the terminal at start
with the \`--session-id\` argument.

\`\`\`python
@app.local_entrypoint()
def main(
    question: Optional[str] = None,
    pdf_path: Optional[str] = None,
    session_id: Optional[str] = None,
):
    model = Model()
    if session_id is None:
        session_id = str(uuid4())
        print("Starting a new session with id", session_id)

        if pdf_path is None:
            pdf_path = "https://arxiv.org/pdf/1706.03762"  # all you need

        if pdf_path.startswith("http"):
            pdf_bytes = urlopen(pdf_path).read()
        else:
            pdf_bytes = Path(pdf_path).read_bytes()

        print("Indexing PDF from", pdf_path)
        model.index_pdf.remote(session_id, pdf_bytes)
    else:
        if pdf_path is not None:
            raise ValueError("Start a new session to chat with a new PDF")
        print("Resuming session with id", session_id)

    if question is None:
        question = "What is this document about?"

    print("QUESTION:", question)
    print(model.respond_to_message.remote(session_id, question))


\`\`\`

## A hosted Gradio interface

With the [Gradio](https://gradio.app) library, we can create a simple web interface around our class in Python,
then use Modal to host it for anyone to try out.

To deploy your own, run

\`\`\`bash
modal deploy chat_with_pdf_vision.py
\`\`\`

and navigate to the URL that appears in your teriminal.
If you’re editing the code, use \`modal serve\` instead to see changes hot-reload.

\`\`\`python
web_image = pdf_image.uv_pip_install(
    "fastapi[standard]==0.115.4",
    "pydantic==2.9.2",
    "starlette==0.41.2",
    "gradio==4.44.1",
    "pillow==10.4.0",
    "gradio-pdf==0.0.15",
    "pdf2image==1.17.0",
)


@app.function(
    image=web_image,
    # gradio requires sticky sessions
    # so we limit the number of concurrent containers to 1
    # and allow it to scale to 1000 concurrent inputs
    max_containers=1,
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import uuid

    import gradio as gr
    from fastapi import FastAPI
    from gradio.routes import mount_gradio_app
    from gradio_pdf import PDF
    from pdf2image import convert_from_path

    web_app = FastAPI()

    # Since this Gradio app is running from its own container,
    # allowing us to run the inference service via .remote() methods.
    model = Model()

    def upload_pdf(path, session_id):
        if session_id == "" or session_id is None:
            # Generate session id if new client
            session_id = str(uuid.uuid4())

        images = convert_from_path(path)
        # Call to our remote inference service to index the PDF
        model.index_pdf.remote(session_id, images)

        return session_id

    def respond_to_message(message, _, session_id):
        # Call to our remote inference service to run RAG
        return model.respond_to_message.remote(session_id, message)

    with gr.Blocks(theme="soft") as demo:
        session_id = gr.State("")

        gr.Markdown("# Chat with PDF")
        with gr.Row():
            with gr.Column(scale=1):
                gr.ChatInterface(
                    fn=respond_to_message,
                    additional_inputs=[session_id],
                    retry_btn=None,
                    undo_btn=None,
                    clear_btn=None,
                )
            with gr.Column(scale=1):
                pdf = PDF(
                    label="Upload a PDF",
                )
                pdf.upload(upload_pdf, [pdf, session_id], session_id)

    return mount_gradio_app(app=web_app, blocks=demo, path="/")


\`\`\`

## Addenda

The remainder of this code consists of utility functions and boiler plate used in the
main code above.

\`\`\`python
def get_chatbot_message_with_image(message, image):
    return {
        "role": "user",
        "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": message},
        ],
    }


def append_to_messages(message, session, user_type="user"):
    session.messages.append(
        {
            "role": user_type,
            "content": {"type": "text", "text": message},
        }
    )

\`\`\`
`,meta:{title:`Chat with PDF: RAG with ColQwen2`,description:`In this example, we demonstrate how to use the the ColQwen2 model to build a simple “Chat with PDF” retrieval-augmented generation (RAG) app. The ColQwen2 model is based on ColPali but uses the Qwen2-VL-2B-Instruct vision-language model. ColPali is in turn based on the late-interaction embedding approach pioneered in ColBERT.`}},{toc:h,rawContent:g,meta:_}=m,ne=t(`<code>modal.Dict</code>`),re=t(`<code>cloudpickle</code>`),ie=t(`Modal <code>@app.cls</code>`,1),ae=t(`<!> <p>In this example, we demonstrate how to use the the <!> model to build a simple
“Chat with PDF” retrieval-augmented generation (RAG) app.
The ColQwen2 model is based on <!> but uses the <!> vision-language model.
ColPali is in turn based on the late-interaction embedding approach pioneered in <!>.</p> <p>Vision-language models with high-quality embeddings obviate the need for complex pre-processing pipelines.
See <!> for more.</p> <!> <p>First, we’ll import the libraries we need locally and define some constants.</p> <!> <!> <p>In Modal, we define <!> that run our serverless workloads.
We install the packages required for our application in those images.</p> <!> <p>These dependencies are only installed remotely, so we can’t import them locally.
Use the <code>.imports</code> context manager to import them only on Modal instead.</p> <!> <!> <p>Vision-language models (VLMs) for embedding and generation add another layer of simplification
to RAG apps based on vector search: we only need one model.</p> <!> <!> <p>Chat services are stateful:
the response to an incoming user message depends on past user messages in a session.</p> <p>RAG apps add even more state:
the documents being retrieved from and the index over those documents,
e.g. the embeddings.</p> <p>Modal Functions are stateless in and of themselves.
They don’t retain information from input to input.
That’s what enables Modal Functions to automatically scale up and down <!>.</p> <!> <p>In this example, we use a <!> to store state information between Function calls.</p> <p>Modal Dicts behave similarly to Python dictionaries,
but they are backed by remote storage and accessible to all of your Modal Functions.
They can contain any Python object
that can be serialized using <!>.</p> <p>A Dict can hold a few gigabytes across keys of size up to 100 MiB,
so it works well for our chat session state, which is a few KiB per session,
and for our embeddings, which are a few hundred KiB per PDF page,
up to about 100,000 pages of PDFs.</p> <p>At a larger scale, we’d need to replace this with a database, like Postgres,
or push more state to the client.</p> <!> <!> <p>Images extracted from PDFs are larger than our session state or embeddings
— low tens of MiB per page.</p> <p>So we store them on a <!>,
which can store terabytes (or more!) of data across tens of thousands of files.</p> <p>Volumes behave like a remote file system:
we read and write from them much like a local file system.</p> <!> <!> <p>We’ll also use a Volume to cache the model weights.</p> <!> <p>Running this function will download the model weights to the cache volume.
Otherwise, the model weights will be downloaded on the first query. For more on storing model weights on Modal, see <!>.</p> <!> <!> <p>To deploy an autoscaling “Chat with PDF” vision-language model service on Modal,
we just need to wrap our Python logic in a <!>:</p> <p>It uses <!> decorators
to organize the “lifecycle” of the app:
loading the model on container start (<code>@modal.enter</code>) and running inference on request (<code>@modal.method</code>).</p> <p>We include in the arguments to the <code>@app.cls</code> decorator
all the information about this service’s infrastructure:
the container image, the remote storage, and the GPU requirements.</p> <!> <!> <p>Vision-Language Models operate on images, not PDFs directly,
so we need to convert our PDFs into images first.</p> <p>We separate this from our indexing and chatting logic —
we run on a different container with different dependencies.</p> <!> <!> <p>Before deploying in a UI, we can test our service from the terminal.</p> <p>Just run</p> <!> <p>and optionally pass in a path to or URL of a PDF with the <code>--pdf-path</code> argument
and specify a question with the <code>--question</code> argument.</p> <p>Continue a previous chat by passing the session ID printed to the terminal at start
with the <code>--session-id</code> argument.</p> <!> <!> <p>With the <!> library, we can create a simple web interface around our class in Python,
then use Modal to host it for anyone to try out.</p> <p>To deploy your own, run</p> <!> <p>and navigate to the URL that appears in your teriminal.
If you’re editing the code, use <code>modal serve</code> instead to see changes hot-reload.</p> <!> <!> <p>The remainder of this code consists of utility functions and boiler plate used in the
main code above.</p> <!>`,1);function v(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ae(),f=te(a);u(f,{id:`chat-with-pdf-rag-with-colqwen2`,children:(e,t)=>{s(),i(e,r(`Chat with PDF: RAG with ColQwen2`))},$$slots:{default:!0}});var m=o(f,2),h=o(e(m));p(h,{href:`https://huggingface.co/vidore/colqwen2-v0.1`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ColQwen2`))},$$slots:{default:!0}});var g=o(h,2);p(g,{href:`https://huggingface.co/blog/manu/colpali`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ColPali`))},$$slots:{default:!0}});var _=o(g,2);p(_,{href:`https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Qwen2-VL-2B-Instruct`))},$$slots:{default:!0}}),p(o(_,2),{href:`https://dl.acm.org/doi/pdf/10.1145/3397271.3401075`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ColBERT`))},$$slots:{default:!0}}),s(),n(m);var v=o(m,2);p(o(e(v)),{href:`https://blog.vespa.ai/announcing-colbert-embedder-in-vespa/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this blog post from Jo Bergum of Vespa`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);c(y,{id:`setup`,children:(e,t)=>{s(),i(e,r(`Setup`))},$$slots:{default:!0}});var b=o(y,4);d(b,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0Afrom%20urllib.request%20import%20urlopen%0Afrom%20uuid%20import%20uuid4%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(%22example-chat-with-pdf-vision%22)%0A`,lang:`python`});var x=o(b,2);c(x,{id:`setting-up-dependencies`,children:(e,t)=>{s(),i(e,r(`Setting up dependencies`))},$$slots:{default:!0}});var S=o(x,2);p(o(e(S)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`container images`))},$$slots:{default:!0}}),s(),n(S);var C=o(S,2);d(C,{code:`CACHE_DIR%20%3D%20%22%2Fhf-cache%22%0A%0Amodel_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22colpali-engine%3D%3D0.3.5%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22transformers%3E%3D4.45.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22torch%3E%3D2.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22qwen-vl-utils%3D%3D0.0.8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22torchvision%3D%3D0.19.1%22%2C%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HUB_CACHE%22%3A%20CACHE_DIR%7D)%0A)%0A`,lang:`python`});var w=o(C,4);d(w,{code:`with%20model_image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20colpali_engine.models%20import%20ColQwen2%2C%20ColQwen2Processor%0A%20%20%20%20from%20qwen_vl_utils%20import%20process_vision_info%0A%20%20%20%20from%20transformers%20import%20AutoProcessor%2C%20Qwen2VLForConditionalGeneration%0A`,lang:`python`});var T=o(w,2);c(T,{id:`specifying-the-colqwen2-model`,children:(e,t)=>{s(),i(e,r(`Specifying the ColQwen2 model`))},$$slots:{default:!0}});var E=o(T,4);d(E,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen2-VL-2B-Instruct%22%0AMODEL_REVISION%20%3D%20%22aca78372505e6cb469c4fa6a35c60265b00ff5a4%22%0A`,lang:`python`});var D=o(E,2);c(D,{id:`managing-state-with-modal-volumes-and-dicts`,children:(e,t)=>{s(),i(e,r(`Managing state with Modal Volumes and Dicts`))},$$slots:{default:!0}});var O=o(D,6);p(o(e(O)),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`based on the number of incoming requests`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);l(k,{id:`managing-chat-sessions-with-modal-dicts`,children:(e,t)=>{s(),i(e,r(`Managing chat sessions with Modal Dicts`))},$$slots:{default:!0}});var A=o(k,2);p(o(e(A)),{href:`https://modal.com/docs/guide/dicts-and-queues`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),s(),n(A);var j=o(A,2);p(o(e(j)),{href:`https://github.com/cloudpipe/cloudpickle`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(j);var M=o(j,6);d(M,{code:`sessions%20%3D%20modal.Dict.from_name(%22colqwen-chat-sessions%22%2C%20create_if_missing%3DTrue)%0A%0A%0Aclass%20Session%3A%0A%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20self.images%20%3D%20None%0A%20%20%20%20%20%20%20%20self.messages%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20self.pdf_embeddings%20%3D%20None%0A%0A`,lang:`python`});var N=o(M,2);l(N,{id:`storing-pdfs-on-a-modal-volume`,children:(e,t)=>{s(),i(e,r(`Storing PDFs on a Modal Volume`))},$$slots:{default:!0}});var P=o(N,4);p(o(e(P)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);d(F,{code:`pdf_volume%20%3D%20modal.Volume.from_name(%22colqwen-chat-pdfs%22%2C%20create_if_missing%3DTrue)%0APDF_ROOT%20%3D%20Path(%22%2Fvol%2Fpdfs%2F%22)%0A`,lang:`python`});var I=o(F,2);l(I,{id:`caching-the-model-weights`,children:(e,t)=>{s(),i(e,r(`Caching the model weights`))},$$slots:{default:!0}});var L=o(I,4);d(L,{code:`cache_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A`,lang:`python`});var R=o(L,2);p(o(e(R)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,2);d(z,{code:`%40app.function(%0A%20%20%20%20image%3Dmodel_image%2C%20volumes%3D%7BCACHE_DIR%3A%20cache_volume%7D%2C%20timeout%3D20%20*%20MINUTES%0A)%0Adef%20download_model()%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20result%20%3D%20snapshot_download(%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20ignore_patterns%3D%5B%22*.pt%22%2C%20%22*.bin%22%5D%2C%20%20%23%20using%20safetensors%0A%20%20%20%20)%0A%20%20%20%20print(f%22Downloaded%20model%20weights%20to%20%7Bresult%7D%22)%0A%0A`,lang:`python`});var B=o(z,2);c(B,{id:`defining-a-chat-with-pdf-service`,children:(e,t)=>{s(),i(e,r(`Defining a Chat with PDF service`))},$$slots:{default:!0}});var V=o(B,2);p(o(e(V)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal App`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);p(o(e(H)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s();var n=ie();s(),i(e,n)},$$slots:{default:!0}}),s(5),n(H);var U=o(H,4);d(U,{code:`%40app.cls(%0A%20%20%20%20image%3Dmodel_image%2C%0A%20%20%20%20gpu%3D%22A100-80GB%22%2C%0A%20%20%20%20scaledown_window%3D10%20*%20MINUTES%2C%20%20%23%20spin%20down%20when%20inactive%0A%20%20%20%20volumes%3D%7B%22%2Fvol%2Fpdfs%2F%22%3A%20pdf_volume%2C%20CACHE_DIR%3A%20cache_volume%7D%2C%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_models(self)%3A%0A%20%20%20%20%20%20%20%20self.colqwen2_model%20%3D%20ColQwen2.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vidore%2Fcolqwen2-v0.1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device_map%3D%22cuda%3A0%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.colqwen2_processor%20%3D%20ColQwen2Processor.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vidore%2Fcolqwen2-v0.1%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.qwen2_vl_model%20%3D%20Qwen2VLForConditionalGeneration.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.qwen2_vl_model.to(%22cuda%3A0%22)%0A%20%20%20%20%20%20%20%20self.qwen2_vl_processor%20%3D%20AutoProcessor.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Qwen%2FQwen2-VL-2B-Instruct%22%2C%20trust_remote_code%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20index_pdf(self%2C%20session_id%2C%20target%3A%20bytes%20%7C%20list)%3A%0A%20%20%20%20%20%20%20%20%23%20We%20store%20concurrent%20user%20chat%20sessions%20in%20a%20modal.Dict%0A%0A%20%20%20%20%20%20%20%20%23%20For%20simplicity%2C%20we%20assume%20that%20each%20user%20only%20runs%20one%20session%20at%20a%20time%0A%0A%20%20%20%20%20%20%20%20session%20%3D%20sessions.get(session_id)%0A%20%20%20%20%20%20%20%20if%20session%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20session%20%3D%20Session()%0A%0A%20%20%20%20%20%20%20%20if%20isinstance(target%2C%20bytes)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20images%20%3D%20convert_pdf_to_images.remote(target)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20images%20%3D%20target%0A%0A%20%20%20%20%20%20%20%20%23%20Store%20images%20on%20a%20Volume%20for%20later%20retrieval%0A%20%20%20%20%20%20%20%20session_dir%20%3D%20PDF_ROOT%20%2F%20f%22%7Bsession_id%7D%22%0A%20%20%20%20%20%20%20%20session_dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%20%20%20%20for%20ii%2C%20image%20in%20enumerate(images)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20filename%20%3D%20session_dir%20%2F%20f%22%7Bstr(ii).zfill(3)%7D.jpg%22%0A%20%20%20%20%20%20%20%20%20%20%20%20image.save(filename)%0A%0A%20%20%20%20%20%20%20%20%23%20Generated%20embeddings%20from%20the%20image(s)%0A%20%20%20%20%20%20%20%20BATCH_SZ%20%3D%204%0A%20%20%20%20%20%20%20%20pdf_embeddings%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20batches%20%3D%20%5Bimages%5Bi%20%3A%20i%20%2B%20BATCH_SZ%5D%20for%20i%20in%20range(0%2C%20len(images)%2C%20BATCH_SZ)%5D%0A%20%20%20%20%20%20%20%20for%20batch%20in%20batches%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_images%20%3D%20self.colqwen2_processor.process_images(batch).to(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.colqwen2_model.device%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20pdf_embeddings%20%2B%3D%20list(self.colqwen2_model(**batch_images).to(%22cpu%22))%0A%0A%20%20%20%20%20%20%20%20%23%20Store%20the%20image%20embeddings%20in%20the%20session%2C%20for%20later%20retrieval%0A%20%20%20%20%20%20%20%20session.pdf_embeddings%20%3D%20pdf_embeddings%0A%0A%20%20%20%20%20%20%20%20%23%20Write%20embeddings%20back%20to%20the%20modal.Dict%0A%20%20%20%20%20%20%20%20sessions%5Bsession_id%5D%20%3D%20session%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20respond_to_message(self%2C%20session_id%2C%20message)%3A%0A%20%20%20%20%20%20%20%20session%20%3D%20sessions.get(session_id)%0A%20%20%20%20%20%20%20%20if%20session%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20session%20%3D%20Session()%0A%0A%20%20%20%20%20%20%20%20pdf_volume.reload()%20%20%23%20make%20sure%20we%20have%20the%20latest%20data%0A%0A%20%20%20%20%20%20%20%20images%20%3D%20(PDF_ROOT%20%2F%20str(session_id)).glob(%22*.jpg%22)%0A%20%20%20%20%20%20%20%20images%20%3D%20list(sorted(images%2C%20key%3Dlambda%20p%3A%20int(p.stem)))%0A%0A%20%20%20%20%20%20%20%20%23%20Nothing%20to%20chat%20about%20without%20a%20PDF!%0A%20%20%20%20%20%20%20%20if%20not%20images%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%22Please%20upload%20a%20PDF%20first%22%0A%20%20%20%20%20%20%20%20elif%20session.pdf_embeddings%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%22Indexing%20PDF...%22%0A%0A%20%20%20%20%20%20%20%20%23%20RAG%2C%20Retrieval-Augmented%20Generation%2C%20is%20two%20steps%3A%0A%0A%20%20%20%20%20%20%20%20%23%20_Retrieval_%20of%20the%20most%20relevant%20data%20to%20answer%20the%20user's%20query%0A%20%20%20%20%20%20%20%20relevant_image%20%3D%20self.get_relevant_image(message%2C%20session%2C%20images)%0A%0A%20%20%20%20%20%20%20%20%23%20_Generation_%20based%20on%20the%20retrieved%20data%0A%20%20%20%20%20%20%20%20output_text%20%3D%20self.generate_response(message%2C%20session%2C%20relevant_image)%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20session%20state%20for%20future%20chats%0A%20%20%20%20%20%20%20%20append_to_messages(message%2C%20session%2C%20user_type%3D%22user%22)%0A%20%20%20%20%20%20%20%20append_to_messages(output_text%2C%20session%2C%20user_type%3D%22assistant%22)%0A%20%20%20%20%20%20%20%20sessions%5Bsession_id%5D%20%3D%20session%0A%0A%20%20%20%20%20%20%20%20return%20output_text%0A%0A%20%20%20%20%23%20Retrieve%20the%20most%20relevant%20image%20from%20the%20PDF%20for%20the%20input%20query%0A%20%20%20%20def%20get_relevant_image(self%2C%20message%2C%20session%2C%20images)%3A%0A%20%20%20%20%20%20%20%20import%20PIL%0A%0A%20%20%20%20%20%20%20%20batch_queries%20%3D%20self.colqwen2_processor.process_queries(%5Bmessage%5D).to(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.colqwen2_model.device%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20query_embeddings%20%3D%20self.colqwen2_model(**batch_queries)%0A%0A%20%20%20%20%20%20%20%20%23%20This%20scores%20our%20query%20embedding%20against%20the%20image%20embeddings%20from%20index_pdf%0A%20%20%20%20%20%20%20%20scores%20%3D%20self.colqwen2_processor.score_multi_vector(%0A%20%20%20%20%20%20%20%20%20%20%20%20query_embeddings%2C%20session.pdf_embeddings%0A%20%20%20%20%20%20%20%20)%5B0%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Select%20the%20best%20matching%20image%0A%20%20%20%20%20%20%20%20max_index%20%3D%20max(range(len(scores))%2C%20key%3Dlambda%20index%3A%20scores%5Bindex%5D)%0A%20%20%20%20%20%20%20%20return%20PIL.Image.open(images%5Bmax_index%5D)%0A%0A%20%20%20%20%23%20Pass%20the%20query%20and%20retrieved%20image%20along%20with%20conversation%20history%20into%20the%20VLM%20for%20a%20response%0A%20%20%20%20def%20generate_response(self%2C%20message%2C%20session%2C%20image)%3A%0A%20%20%20%20%20%20%20%20chatbot_message%20%3D%20get_chatbot_message_with_image(message%2C%20image)%0A%20%20%20%20%20%20%20%20query%20%3D%20self.qwen2_vl_processor.apply_chat_template(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B*session.messages%2C%20chatbot_message%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenize%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20add_generation_prompt%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20image_inputs%2C%20_%20%3D%20process_vision_info(%5Bchatbot_message%5D)%0A%20%20%20%20%20%20%20%20inputs%20%3D%20self.qwen2_vl_processor(%0A%20%20%20%20%20%20%20%20%20%20%20%20text%3D%5Bquery%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20images%3Dimage_inputs%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20return_tensors%3D%22pt%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20inputs%20%3D%20inputs.to(%22cuda%3A0%22)%0A%0A%20%20%20%20%20%20%20%20generated_ids%20%3D%20self.qwen2_vl_model.generate(**inputs%2C%20max_new_tokens%3D512)%0A%20%20%20%20%20%20%20%20generated_ids_trimmed%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20out_ids%5Blen(in_ids)%20%3A%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20in_ids%2C%20out_ids%20in%20zip(inputs.input_ids%2C%20generated_ids)%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20output_text%20%3D%20self.qwen2_vl_processor.batch_decode(%0A%20%20%20%20%20%20%20%20%20%20%20%20generated_ids_trimmed%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20skip_special_tokens%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20clean_up_tokenization_spaces%3DFalse%2C%0A%20%20%20%20%20%20%20%20)%5B0%5D%0A%20%20%20%20%20%20%20%20return%20output_text%0A%0A`,lang:`python`});var W=o(U,2);c(W,{id:`loading-pdfs-as-images`,children:(e,t)=>{s(),i(e,r(`Loading PDFs as images`))},$$slots:{default:!0}});var G=o(W,6);d(G,{code:`pdf_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22poppler-utils%22)%0A%20%20%20%20.uv_pip_install(%22pdf2image%3D%3D1.17.0%22%2C%20%22pillow%3D%3D10.4.0%22)%0A)%0A%0A%0A%40app.function(image%3Dpdf_image)%0Adef%20convert_pdf_to_images(pdf_bytes)%3A%0A%20%20%20%20from%20pdf2image%20import%20convert_from_bytes%0A%0A%20%20%20%20images%20%3D%20convert_from_bytes(pdf_bytes%2C%20fmt%3D%22jpeg%22)%0A%20%20%20%20return%20images%0A%0A`,lang:`python`});var K=o(G,2);c(K,{id:`chatting-with-a-pdf-from-the-terminal`,children:(e,t)=>{s(),i(e,r(`Chatting with a PDF from the terminal`))},$$slots:{default:!0}});var q=o(K,6);d(q,{code:`modal%20run%20chat_with_pdf_vision.py`,lang:`bash`});var J=o(q,6);d(J,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20question%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20pdf_path%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20session_id%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20model%20%3D%20Model()%0A%20%20%20%20if%20session_id%20is%20None%3A%0A%20%20%20%20%20%20%20%20session_id%20%3D%20str(uuid4())%0A%20%20%20%20%20%20%20%20print(%22Starting%20a%20new%20session%20with%20id%22%2C%20session_id)%0A%0A%20%20%20%20%20%20%20%20if%20pdf_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pdf_path%20%3D%20%22https%3A%2F%2Farxiv.org%2Fpdf%2F1706.03762%22%20%20%23%20all%20you%20need%0A%0A%20%20%20%20%20%20%20%20if%20pdf_path.startswith(%22http%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pdf_bytes%20%3D%20urlopen(pdf_path).read()%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pdf_bytes%20%3D%20Path(pdf_path).read_bytes()%0A%0A%20%20%20%20%20%20%20%20print(%22Indexing%20PDF%20from%22%2C%20pdf_path)%0A%20%20%20%20%20%20%20%20model.index_pdf.remote(session_id%2C%20pdf_bytes)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20if%20pdf_path%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%22Start%20a%20new%20session%20to%20chat%20with%20a%20new%20PDF%22)%0A%20%20%20%20%20%20%20%20print(%22Resuming%20session%20with%20id%22%2C%20session_id)%0A%0A%20%20%20%20if%20question%20is%20None%3A%0A%20%20%20%20%20%20%20%20question%20%3D%20%22What%20is%20this%20document%20about%3F%22%0A%0A%20%20%20%20print(%22QUESTION%3A%22%2C%20question)%0A%20%20%20%20print(model.respond_to_message.remote(session_id%2C%20question))%0A%0A`,lang:`python`});var Y=o(J,2);c(Y,{id:`a-hosted-gradio-interface`,children:(e,t)=>{s(),i(e,r(`A hosted Gradio interface`))},$$slots:{default:!0}});var X=o(Y,2);p(o(e(X)),{href:`https://gradio.app`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Gradio`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,4);d(Z,{code:`modal%20deploy%20chat_with_pdf_vision.py`,lang:`bash`});var Q=o(Z,4);d(Q,{code:`web_image%20%3D%20pdf_image.uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.9.2%22%2C%0A%20%20%20%20%22starlette%3D%3D0.41.2%22%2C%0A%20%20%20%20%22gradio%3D%3D4.44.1%22%2C%0A%20%20%20%20%22pillow%3D%3D10.4.0%22%2C%0A%20%20%20%20%22gradio-pdf%3D%3D0.0.15%22%2C%0A%20%20%20%20%22pdf2image%3D%3D1.17.0%22%2C%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dweb_image%2C%0A%20%20%20%20%23%20gradio%20requires%20sticky%20sessions%0A%20%20%20%20%23%20so%20we%20limit%20the%20number%20of%20concurrent%20containers%20to%201%0A%20%20%20%20%23%20and%20allow%20it%20to%20scale%20to%201000%20concurrent%20inputs%0A%20%20%20%20max_containers%3D1%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20uuid%0A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%20%20%20%20from%20gradio_pdf%20import%20PDF%0A%20%20%20%20from%20pdf2image%20import%20convert_from_path%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20Since%20this%20Gradio%20app%20is%20running%20from%20its%20own%20container%2C%0A%20%20%20%20%23%20allowing%20us%20to%20run%20the%20inference%20service%20via%20.remote()%20methods.%0A%20%20%20%20model%20%3D%20Model()%0A%0A%20%20%20%20def%20upload_pdf(path%2C%20session_id)%3A%0A%20%20%20%20%20%20%20%20if%20session_id%20%3D%3D%20%22%22%20or%20session_id%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Generate%20session%20id%20if%20new%20client%0A%20%20%20%20%20%20%20%20%20%20%20%20session_id%20%3D%20str(uuid.uuid4())%0A%0A%20%20%20%20%20%20%20%20images%20%3D%20convert_from_path(path)%0A%20%20%20%20%20%20%20%20%23%20Call%20to%20our%20remote%20inference%20service%20to%20index%20the%20PDF%0A%20%20%20%20%20%20%20%20model.index_pdf.remote(session_id%2C%20images)%0A%0A%20%20%20%20%20%20%20%20return%20session_id%0A%0A%20%20%20%20def%20respond_to_message(message%2C%20_%2C%20session_id)%3A%0A%20%20%20%20%20%20%20%20%23%20Call%20to%20our%20remote%20inference%20service%20to%20run%20RAG%0A%20%20%20%20%20%20%20%20return%20model.respond_to_message.remote(session_id%2C%20message)%0A%0A%20%20%20%20with%20gr.Blocks(theme%3D%22soft%22)%20as%20demo%3A%0A%20%20%20%20%20%20%20%20session_id%20%3D%20gr.State(%22%22)%0A%0A%20%20%20%20%20%20%20%20gr.Markdown(%22%23%20Chat%20with%20PDF%22)%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column(scale%3D1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gr.ChatInterface(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3Drespond_to_message%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20additional_inputs%3D%5Bsession_id%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20retry_btn%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20undo_btn%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clear_btn%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column(scale%3D1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pdf%20%3D%20PDF(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22Upload%20a%20PDF%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pdf.upload(upload_pdf%2C%20%5Bpdf%2C%20session_id%5D%2C%20session_id)%0A%0A%20%20%20%20return%20mount_gradio_app(app%3Dweb_app%2C%20blocks%3Ddemo%2C%20path%3D%22%2F%22)%0A%0A`,lang:`python`});var $=o(Q,2);c($,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}}),d(o($,4),{code:`def%20get_chatbot_message_with_image(message%2C%20image)%3A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22role%22%3A%20%22user%22%2C%0A%20%20%20%20%20%20%20%20%22content%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22type%22%3A%20%22image%22%2C%20%22image%22%3A%20image%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20message%7D%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%7D%0A%0A%0Adef%20append_to_messages(message%2C%20session%2C%20user_type%3D%22user%22)%3A%0A%20%20%20%20session.messages.append(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22role%22%3A%20user_type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20%7B%22type%22%3A%20%22text%22%2C%20%22text%22%3A%20message%7D%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=BCnlCk5p.js.map
