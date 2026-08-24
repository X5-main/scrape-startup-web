(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cc3dc441-300d-446a-ac93-8777dce46371`,e._sentryDebugIdIdentifier=`sentry-dbid-cc3dc441-300d-446a-ac93-8777dce46371`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run a job queue that turns documents into structured data with Datalab Marker`,id:`run-a-job-queue-that-turns-documents-into-structured-data-with-datalab-marker`,children:[{depth:2,value:`Define an App`,id:`define-an-app`},{depth:2,value:`Cache the pre-trained model on a Modal Volume`,id:`cache-the-pre-trained-model-on-a-modal-volume`},{depth:2,value:`Run Datalab Marker on Modal`,id:`run-datalab-marker-on-modal`},{depth:2,value:`Testing and debugging remote code`,id:`testing-and-debugging-remote-code`},{depth:2,value:`Deploying the document conversion service`,id:`deploying-the-document-conversion-service`}]}],rawContent:`# Run a job queue that turns documents into structured data with Datalab Marker

This tutorial shows you how to use Modal as an infinitely scalable job queue
that can service async tasks from a web app.

Our job queue will handle a single task: converting images/PDFs into structured data.
We'll use [Marker](https://github.com/datalab-to/marker) from [Datalab](https://www.datalab.to),
which can convert images of documents or PDFs to Markdown, JSON, and HTML. Marker is an open-weights model;
to learn more about commercial usage, see [here](https://github.com/datalab-to/marker?tab=readme-ov-file#commercial-usage).

For the purpose of this tutorial, we've also built a [React + FastAPI web app on Modal](https://modal.com/docs/examples/doc_ocr_webapp)
that works together with it, but note that you don't need a web app running on Modal
to use this pattern. You can submit async tasks to Modal from any Python
application (for example, a regular Django app running on Kubernetes).

Try it out for yourself [here](https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/).

## Define an App

Let's first import \`modal\` and define an [\`App\`](https://modal.com/docs/reference/modal.App).
Later, we'll use the name provided for our job queue App to find it from our web app and submit tasks to it.

\`\`\`python
from typing import Optional

import modal
from typing_extensions import Literal

app = modal.App("example-doc-ocr-jobs")

\`\`\`

We also define the dependencies we need by specifying an
[Image](https://modal.com/docs/guide/images).

\`\`\`python
inference_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "marker-pdf[full]==1.9.3", "torch==2.8.0"
)

\`\`\`

## Cache the pre-trained model on a Modal Volume

We can obtain the pre-trained model we want to run from Datalab
by using the Marker library.

\`\`\`python
def load_models():
    import marker.models

    print("loading models")

    return marker.models.create_model_dict()


\`\`\`

The \`create_model_dict\` function downloads model weights from Datalab's
cloud storage (S3 bucket) if they aren't already present in the filesystem.
However, in Modal's serverless environment, filesystems are ephemeral,
so using this code alone would mean that models need to be downloaded
many times (every time a new instance of our Function spins up).

So instead, we create a Modal [Volume](https://modal.com/docs/guide/volumes)
to store the models. Each Modal Volume is a durable filesystem that any Modal Function can access.
You can read more about storing model weights on Modal in [our guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
marker_cache_path = "/root/.cache/datalab/"
marker_cache_volume = modal.Volume.from_name(
    "marker-models-modal-demo", create_if_missing=True
)
marker_cache = {marker_cache_path: marker_cache_volume}

\`\`\`

## Run Datalab Marker on Modal

Now let's set up the actual inference.

Using the [\`@app.function\`](https://modal.com/docs/reference/modal.App#function)
decorator, we set up a Modal [Function](https://modal.com/docs/reference/modal.Function).
We provide arguments to that decorator to customize the hardware, scaling, and other features
of the Function.

Here, we say that this Function should use NVIDIA L40S [GPUs](https://modal.com/docs/guide/gpu),
automatically [retry](https://modal.com/docs/guide/retries#function-retries) failures up to 3 times,
and have access to our [shared model cache](https://modal.com/docs/guide/volumes).

Inside the Function, we write out our inference logic,
which mostly involves configuring components provided by the \`marker\` library.

\`\`\`python
@app.function(gpu="l40s", retries=3, volumes=marker_cache, image=inference_image)
def parse_document(
    document: bytes,
    page_range: str | None = None,
    force_ocr: bool = False,
    paginate_output: bool = False,
    output_format: Literal["markdown", "html", "chunks", "json"] = "markdown",
    use_llm: bool = False,
) -> str | dict:
    """
    Args:
        document: Document data (PDF, JPG, PNG) as bytes.
        page_range: Specify which pages to process. Accepts comma-separated page numbers and ranges.
        force_ocr: Force OCR processing on the entire document, even for pages that might contain extractable text.
                    This will also format inline math properly.
        paginate_output: Paginates the output, using \\n\\n{PAGE_NUMBER} followed by - * 48, then \\n\\n
        output_format: Output format. Can be markdown, JSON, HTML, or chunks.
        use_llm: use an llm to improve the marker results.
    """
    from tempfile import NamedTemporaryFile

    import marker.config.parser
    import marker.converters.pdf
    import marker.output

    models = load_models()

    # Set up document "converter"
    config = {
        "page_range": page_range,
        "force_ocr": force_ocr,
        "paginate_output": paginate_output,
        "output_format": output_format,
        "use_llm": use_llm,
    }

    config_parser = marker.config.parser.ConfigParser(config)
    config_dict = config_parser.generate_config_dict()
    config_dict["pdftext_workers"] = 1

    converter = marker.converters.pdf.PdfConverter(
        config=config_dict,
        artifact_dict=models,
        processor_list=config_parser.get_processors(),
        renderer=config_parser.get_renderer(),
        llm_service=config_parser.get_llm_service() if use_llm else None,
    )

    # Run the converter on our document
    with NamedTemporaryFile(delete=False, mode="wb+") as temp_path:
        temp_path.write(document)
        rendered_output = converter(temp_path.name)

    # Format the output and return it
    if output_format == "json":
        result = rendered_output.model_dump_json()
    else:
        text, _, images = marker.output.text_from_rendered(rendered_output)

        result = text

    return result


\`\`\`

## Testing and debugging remote code

To make sure this code works, we want a way to kick the tires and debug it.

We can run it on Modal, with no need to set up separate local testing,
by adding a [\`local_entrypoint\`](https://modal.com/docs/reference/modal.App#local_entrypoint)
that invokes the Function \`.remote\`ly.

\`\`\`python
@app.local_entrypoint()
def main(document_filename: Optional[str] = None):
    import urllib.request
    from pathlib import Path

    if document_filename is None:
        document_filename = Path(__file__).parent / "receipt.png"
    else:
        document_filename = Path(document_filename)

    if document_filename.exists():
        image = document_filename.read_bytes()
        print(f"running OCR on {document_filename}")
    else:
        document_url = "https://modal-cdn.com/cdnbot/Brandys-walmart-receipt-8g68_a_hk_f9c25fce.webp"
        print(f"running OCR on sample from URL {document_url}")
        request = urllib.request.Request(document_url)
        with urllib.request.urlopen(request) as response:
            image = response.read()
    print(parse_document.remote(image, output_format="html"))


\`\`\`

You can then run this from the command line with:

\`\`\`shell
modal run doc_ocr_jobs.py
\`\`\`

## Deploying the document conversion service

Now that we have a Function, we can publish it by deploying the App:

\`\`\`shell
modal deploy doc_ocr_jobs.py
\`\`\`

Once it's published, we can [look up](https://modal.com/docs/guide/trigger-deployed-functions) this Function
from another Python process and submit tasks to it:

\`\`\`python
fn = modal.Function.from_name("example-doc-ocr-jobs", "parse_document")
fn.spawn(my_document)
\`\`\`

Modal will auto-scale to handle all the tasks queued, and
then scale back down to 0 when there's no work left. To see how you could use this from a Python web
app, take a look at the [receipt parser frontend](https://modal.com/docs/examples/doc_ocr_webapp)
tutorial.
`,meta:{title:`Run a job queue that turns documents into structured data with Datalab Marker`,description:`This tutorial shows you how to use Modal as an infinitely scalable job queue that can service async tasks from a web app.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>App</code>`),b=t(`<code>@app.function</code>`),x=t(`<code>local_entrypoint</code>`),S=t(`<!> <p>This tutorial shows you how to use Modal as an infinitely scalable job queue
that can service async tasks from a web app.</p> <p>Our job queue will handle a single task: converting images/PDFs into structured data.
We’ll use <!> from <!>,
which can convert images of documents or PDFs to Markdown, JSON, and HTML. Marker is an open-weights model;
to learn more about commercial usage, see <!>.</p> <p>For the purpose of this tutorial, we’ve also built a <!> that works together with it, but note that you don’t need a web app running on Modal
to use this pattern. You can submit async tasks to Modal from any Python
application (for example, a regular Django app running on Kubernetes).</p> <p>Try it out for yourself <!>.</p> <!> <p>Let’s first import <code>modal</code> and define an <!>.
Later, we’ll use the name provided for our job queue App to find it from our web app and submit tasks to it.</p> <!> <p>We also define the dependencies we need by specifying an <!>.</p> <!> <!> <p>We can obtain the pre-trained model we want to run from Datalab
by using the Marker library.</p> <!> <p>The <code>create_model_dict</code> function downloads model weights from Datalab’s
cloud storage (S3 bucket) if they aren’t already present in the filesystem.
However, in Modal’s serverless environment, filesystems are ephemeral,
so using this code alone would mean that models need to be downloaded
many times (every time a new instance of our Function spins up).</p> <p>So instead, we create a Modal <!> to store the models. Each Modal Volume is a durable filesystem that any Modal Function can access.
You can read more about storing model weights on Modal in <!>.</p> <!> <!> <p>Now let’s set up the actual inference.</p> <p>Using the <!> decorator, we set up a Modal <!>.
We provide arguments to that decorator to customize the hardware, scaling, and other features
of the Function.</p> <p>Here, we say that this Function should use NVIDIA L40S <!>,
automatically <!> failures up to 3 times,
and have access to our <!>.</p> <p>Inside the Function, we write out our inference logic,
which mostly involves configuring components provided by the <code>marker</code> library.</p> <!> <!> <p>To make sure this code works, we want a way to kick the tires and debug it.</p> <p>We can run it on Modal, with no need to set up separate local testing,
by adding a <!> that invokes the Function <code>.remote</code>ly.</p> <!> <p>You can then run this from the command line with:</p> <!> <!> <p>Now that we have a Function, we can publish it by deploying the App:</p> <!> <p>Once it’s published, we can <!> this Function
from another Python process and submit tasks to it:</p> <!> <p>Modal will auto-scale to handle all the tasks queued, and
then scale back down to 0 when there’s no work left. To see how you could use this from a Python web
app, take a look at the <!> tutorial.</p>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`run-a-job-queue-that-turns-documents-into-structured-data-with-datalab-marker`,children:(e,t)=>{l(),i(e,r(`Run a job queue that turns documents into structured data with Datalab Marker`))},$$slots:{default:!0}});var h=c(p,4),g=c(e(h));m(g,{href:`https://github.com/datalab-to/marker`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Marker`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://www.datalab.to`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Datalab`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://github.com/datalab-to/marker?tab=readme-ov-file#commercial-usage`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,2);m(c(e(v)),{href:`https://modal.com/docs/examples/doc_ocr_webapp`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`React + FastAPI web app on Modal`))},$$slots:{default:!0}}),l(),n(v);var C=c(v,2);m(c(e(C)),{href:`https://modal-labs-examples--example-doc-ocr-webapp-wrapper.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);u(w,{id:`define-an-app`,children:(e,t)=>{l(),i(e,r(`Define an App`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T),3),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);f(E,{code:`from%20typing%20import%20Optional%0A%0Aimport%20modal%0Afrom%20typing_extensions%20import%20Literal%0A%0Aapp%20%3D%20modal.App(%22example-doc-ocr-jobs%22)%0A`,lang:`python`});var D=c(E,2);m(c(e(D)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);f(O,{code:`inference_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22marker-pdf%5Bfull%5D%3D%3D1.9.3%22%2C%20%22torch%3D%3D2.8.0%22%0A)%0A`,lang:`python`});var k=c(O,2);u(k,{id:`cache-the-pre-trained-model-on-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`Cache the pre-trained model on a Modal Volume`))},$$slots:{default:!0}});var A=c(k,4);f(A,{code:`def%20load_models()%3A%0A%20%20%20%20import%20marker.models%0A%0A%20%20%20%20print(%22loading%20models%22)%0A%0A%20%20%20%20return%20marker.models.create_model_dict()%0A%0A`,lang:`python`});var j=c(A,4),M=c(e(j));m(M,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),m(c(M,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`our guide`))},$$slots:{default:!0}}),l(),n(j);var N=c(j,2);f(N,{code:`marker_cache_path%20%3D%20%22%2Froot%2F.cache%2Fdatalab%2F%22%0Amarker_cache_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22marker-models-modal-demo%22%2C%20create_if_missing%3DTrue%0A)%0Amarker_cache%20%3D%20%7Bmarker_cache_path%3A%20marker_cache_volume%7D%0A`,lang:`python`});var P=c(N,2);u(P,{id:`run-datalab-marker-on-modal`,children:(e,t)=>{l(),i(e,r(`Run Datalab Marker on Modal`))},$$slots:{default:!0}});var F=c(P,4),I=c(e(F));m(I,{href:`https://modal.com/docs/reference/modal.App#function`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),m(c(I,2),{href:`https://modal.com/docs/reference/modal.Function`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),l(),n(F);var L=c(F,2),R=c(e(L));m(R,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPUs`))},$$slots:{default:!0}});var z=c(R,2);m(z,{href:`https://modal.com/docs/guide/retries#function-retries`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`retry`))},$$slots:{default:!0}}),m(c(z,2),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`shared model cache`))},$$slots:{default:!0}}),l(),n(L);var B=c(L,4);f(B,{code:`%40app.function(gpu%3D%22l40s%22%2C%20retries%3D3%2C%20volumes%3Dmarker_cache%2C%20image%3Dinference_image)%0Adef%20parse_document(%0A%20%20%20%20document%3A%20bytes%2C%0A%20%20%20%20page_range%3A%20str%20%7C%20None%20%3D%20None%2C%0A%20%20%20%20force_ocr%3A%20bool%20%3D%20False%2C%0A%20%20%20%20paginate_output%3A%20bool%20%3D%20False%2C%0A%20%20%20%20output_format%3A%20Literal%5B%22markdown%22%2C%20%22html%22%2C%20%22chunks%22%2C%20%22json%22%5D%20%3D%20%22markdown%22%2C%0A%20%20%20%20use_llm%3A%20bool%20%3D%20False%2C%0A)%20-%3E%20str%20%7C%20dict%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20document%3A%20Document%20data%20(PDF%2C%20JPG%2C%20PNG)%20as%20bytes.%0A%20%20%20%20%20%20%20%20page_range%3A%20Specify%20which%20pages%20to%20process.%20Accepts%20comma-separated%20page%20numbers%20and%20ranges.%0A%20%20%20%20%20%20%20%20force_ocr%3A%20Force%20OCR%20processing%20on%20the%20entire%20document%2C%20even%20for%20pages%20that%20might%20contain%20extractable%20text.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20This%20will%20also%20format%20inline%20math%20properly.%0A%20%20%20%20%20%20%20%20paginate_output%3A%20Paginates%20the%20output%2C%20using%20%5Cn%5Cn%7BPAGE_NUMBER%7D%20followed%20by%20-%20*%2048%2C%20then%20%5Cn%5Cn%0A%20%20%20%20%20%20%20%20output_format%3A%20Output%20format.%20Can%20be%20markdown%2C%20JSON%2C%20HTML%2C%20or%20chunks.%0A%20%20%20%20%20%20%20%20use_llm%3A%20use%20an%20llm%20to%20improve%20the%20marker%20results.%0A%20%20%20%20%22%22%22%0A%20%20%20%20from%20tempfile%20import%20NamedTemporaryFile%0A%0A%20%20%20%20import%20marker.config.parser%0A%20%20%20%20import%20marker.converters.pdf%0A%20%20%20%20import%20marker.output%0A%0A%20%20%20%20models%20%3D%20load_models()%0A%0A%20%20%20%20%23%20Set%20up%20document%20%22converter%22%0A%20%20%20%20config%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22page_range%22%3A%20page_range%2C%0A%20%20%20%20%20%20%20%20%22force_ocr%22%3A%20force_ocr%2C%0A%20%20%20%20%20%20%20%20%22paginate_output%22%3A%20paginate_output%2C%0A%20%20%20%20%20%20%20%20%22output_format%22%3A%20output_format%2C%0A%20%20%20%20%20%20%20%20%22use_llm%22%3A%20use_llm%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20config_parser%20%3D%20marker.config.parser.ConfigParser(config)%0A%20%20%20%20config_dict%20%3D%20config_parser.generate_config_dict()%0A%20%20%20%20config_dict%5B%22pdftext_workers%22%5D%20%3D%201%0A%0A%20%20%20%20converter%20%3D%20marker.converters.pdf.PdfConverter(%0A%20%20%20%20%20%20%20%20config%3Dconfig_dict%2C%0A%20%20%20%20%20%20%20%20artifact_dict%3Dmodels%2C%0A%20%20%20%20%20%20%20%20processor_list%3Dconfig_parser.get_processors()%2C%0A%20%20%20%20%20%20%20%20renderer%3Dconfig_parser.get_renderer()%2C%0A%20%20%20%20%20%20%20%20llm_service%3Dconfig_parser.get_llm_service()%20if%20use_llm%20else%20None%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Run%20the%20converter%20on%20our%20document%0A%20%20%20%20with%20NamedTemporaryFile(delete%3DFalse%2C%20mode%3D%22wb%2B%22)%20as%20temp_path%3A%0A%20%20%20%20%20%20%20%20temp_path.write(document)%0A%20%20%20%20%20%20%20%20rendered_output%20%3D%20converter(temp_path.name)%0A%0A%20%20%20%20%23%20Format%20the%20output%20and%20return%20it%0A%20%20%20%20if%20output_format%20%3D%3D%20%22json%22%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20rendered_output.model_dump_json()%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20text%2C%20_%2C%20images%20%3D%20marker.output.text_from_rendered(rendered_output)%0A%0A%20%20%20%20%20%20%20%20result%20%3D%20text%0A%0A%20%20%20%20return%20result%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`testing-and-debugging-remote-code`,children:(e,t)=>{l(),i(e,r(`Testing and debugging remote code`))},$$slots:{default:!0}});var H=c(V,4);m(c(e(H)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(3),n(H);var U=c(H,2);f(U,{code:`%40app.local_entrypoint()%0Adef%20main(document_filename%3A%20Optional%5Bstr%5D%20%3D%20None)%3A%0A%20%20%20%20import%20urllib.request%0A%20%20%20%20from%20pathlib%20import%20Path%0A%0A%20%20%20%20if%20document_filename%20is%20None%3A%0A%20%20%20%20%20%20%20%20document_filename%20%3D%20Path(__file__).parent%20%2F%20%22receipt.png%22%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20document_filename%20%3D%20Path(document_filename)%0A%0A%20%20%20%20if%20document_filename.exists()%3A%0A%20%20%20%20%20%20%20%20image%20%3D%20document_filename.read_bytes()%0A%20%20%20%20%20%20%20%20print(f%22running%20OCR%20on%20%7Bdocument_filename%7D%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20document_url%20%3D%20%22https%3A%2F%2Fmodal-cdn.com%2Fcdnbot%2FBrandys-walmart-receipt-8g68_a_hk_f9c25fce.webp%22%0A%20%20%20%20%20%20%20%20print(f%22running%20OCR%20on%20sample%20from%20URL%20%7Bdocument_url%7D%22)%0A%20%20%20%20%20%20%20%20request%20%3D%20urllib.request.Request(document_url)%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(request)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20image%20%3D%20response.read()%0A%20%20%20%20print(parse_document.remote(image%2C%20output_format%3D%22html%22))%0A%0A`,lang:`python`});var W=c(U,4);f(W,{code:`modal%20run%20doc_ocr_jobs.py`,lang:`shell`});var G=c(W,2);u(G,{id:`deploying-the-document-conversion-service`,children:(e,t)=>{l(),i(e,r(`Deploying the document conversion service`))},$$slots:{default:!0}});var K=c(G,4);f(K,{code:`modal%20deploy%20doc_ocr_jobs.py`,lang:`shell`});var q=c(K,2);m(c(e(q)),{href:`https://modal.com/docs/guide/trigger-deployed-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`look up`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,2);f(J,{code:`fn%20%3D%20modal.Function.from_name(%22example-doc-ocr-jobs%22%2C%20%22parse_document%22)%0Afn.spawn(my_document)`,lang:`python`});var Y=c(J,2);m(c(e(Y)),{href:`https://modal.com/docs/examples/doc_ocr_webapp`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`receipt parser frontend`))},$$slots:{default:!0}}),l(),n(Y),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=sqjbNCbf.js.map
