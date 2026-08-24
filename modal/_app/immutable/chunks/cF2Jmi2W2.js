(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6a3e4092-9ad9-4ac7-b30d-c2a00fc15277`,e._sentryDebugIdIdentifier=`sentry-dbid-6a3e4092-9ad9-4ac7-b30d-c2a00fc15277`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as ee,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te}from"./CPby7b1n.js";import{t as ne}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Build a protein folding dashboard with ESM3, Molstar, and Gradio`,id:`build-a-protein-folding-dashboard-with-esm3-molstar-and-gradio`,children:[{depth:2,value:`Basic Setup`,id:`basic-setup`,children:[{depth:3,value:`Create a Volume to store ESM3 model weights and Entrez sequence data`,id:`create-a-volume-to-store-esm3-model-weights-and-entrez-sequence-data`},{depth:3,value:`Define dependencies in container images`,id:`define-dependencies-in-container-images`}]},{depth:2,value:`Define a Model inference class for ESM3`,id:`define-a-model-inference-class-for-esm3`},{depth:2,value:`Serve a dashboard as an asgi_app`,id:`serve-a-dashboard-as-an-asgi_app`,children:[{depth:3,value:`Integrating Modal Functions`,id:`integrating-modal-functions`},{depth:3,value:`Building a UI in Python with Gradio`,id:`building-a-ui-in-python-with-gradio`}]},{depth:2,value:`Folding from the command line`,id:`folding-from-the-command-line`},{depth:2,value:`Addenda`,id:`addenda`,children:[{depth:3,value:`Extracting Sequences from UniProt Accession Numbers`,id:`extracting-sequences-from-uniprot-accession-numbers`},{depth:3,value:`Supporting functions for the Gradio app`,id:`supporting-functions-for-the-gradio-app`}]}]}],rawContent:`# Build a protein folding dashboard with ESM3, Molstar, and Gradio

![Image of dashboard UI for ESM3 protein folding](https://modal-cdn.com/example-esm3-ui.png)

There are perhaps a quadrillion distinct proteins on the planet Earth,
each one a marvel of nanotechnology discovered by painstaking evolution.
We know the amino acid sequence of nearly a billion but we only
know the three-dimensional structure of a few hundred thousand,
gathered by slow, difficult observational methods like X-ray crystallography.
Built upon this data are machine learning models like
EvolutionaryScale's [ESM3](https://www.evolutionaryscale.ai/blog/esm3-release)
that can predict the structure of any sequence in seconds.

In this example, we'll show how you can use Modal to not
just run the latest protein-folding model but also build tools around it for
you and your team of scientists to understand and analyze the results.

## Basic Setup

\`\`\`python
import base64
import io
from pathlib import Path
from typing import Optional

import modal

MINUTES = 60  # seconds

app = modal.App("example-esm3")

\`\`\`

### Create a Volume to store ESM3 model weights and Entrez sequence data

To minimize cold start times, we'll store the ESM3 model weights on a Modal
[Volume](https://modal.com/docs/guide/volumes).
For patterns and best practices for storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).
We'll use this same distributed storage primitive to store sequence data.

\`\`\`python
volume = modal.Volume.from_name("example-esm3", create_if_missing=True)
VOLUME_PATH = Path("/vol")
MODELS_PATH = VOLUME_PATH / "models"
DATA_PATH = VOLUME_PATH / "data"

\`\`\`

### Define dependencies in container images

The container image for structure inference is based on Modal's default slim Debian
Linux image with \`esm\` for loading and running the model, \`gemmi\` for
managing protein structure file conversions, and setting an environment variable
for faster downloading of the model weights from Hugging Face.

\`\`\`python
esm3_image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install(
        "esm==3.1.1",
        "torch==2.4.1",
        "gemmi==0.7.0",
        "huggingface-hub==0.36.0",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1", "HF_HOME": str(MODELS_PATH)})
)

\`\`\`

We'll also define a separate image, with different dependencies,
for the part of our app that hosts the dashboard.
This helps reduce the complexity of Python dependency management
by "walling off" the different parts, e.g. separating
functions that depend on finicky ML packages
from those that depend on pedantic web packages.
Dependencies include \`gradio\` for building a web UI in Python and
\`biotite\` for extracting sequences from UniProt accession numbers.

You can read more about how to configure container images on Modal in
[this guide](https://modal.com/docs/guide/images).

\`\`\`python
web_app_image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("gradio~=4.44.0", "biotite==0.41.2", "fastapi[standard]==0.115.4")
    .add_local_dir(Path(__file__).parent / "frontend", remote_path="/assets")
)


\`\`\`

Here we "pre-import" libraries that will be used by the functions we run
on Modal in a given image using the \`with image.imports\` context manager.

\`\`\`python
with esm3_image.imports():
    import tempfile

    import gemmi
    import torch
    from esm.models.esm3 import ESM3
    from esm.sdk.api import ESMProtein, GenerationConfig

with web_app_image.imports():
    import biotite.database.entrez as entrez
    import biotite.sequence.io.fasta as fasta
    from fastapi import FastAPI

\`\`\`

## Define a \`Model\` inference class for ESM3

Next, we map the model's setup and inference code onto Modal.

1. For setup code that only needs to run once, we put it in a method
decorated with \`@enter\`, which runs on container start. For details,
see [this guide](https://modal.com/docs/guide/cold-start).
2. The rest of the inference code goes in a method decorated with \`@method\`.
3. We accelerate the compute-intensive inference with a GPU, specifically an A10G.
For more on using GPUs on Modal, see [this guide](https://modal.com/docs/guide/gpu).

\`\`\`python
@app.cls(
    image=esm3_image,
    volumes={VOLUME_PATH: volume},
    secrets=[modal.Secret.from_name("huggingface-secret")],
    gpu="A10G",
    timeout=20 * MINUTES,
)
class Model:
    @modal.enter()
    def enter(self):
        self.model = ESM3.from_pretrained("esm3_sm_open_v1")
        self.model.to("cuda")

        print("using half precision and tensor cores for fast ESM3 inference")
        self.model = self.model.half()
        torch.backends.cuda.matmul.allow_tf32 = True

        self.max_steps = 250
        print(f"setting max ESM steps to: {self.max_steps}")

    def convert_protein_to_MMCIF(self, esm_protein, output_path):
        structure = gemmi.read_pdb_string(esm_protein.to_pdb_string())
        doc = structure.make_mmcif_document()
        doc.write_file(str(output_path), gemmi.cif.WriteOptions())

    def get_generation_config(self, num_steps):
        return GenerationConfig(track="structure", num_steps=num_steps)

    @modal.method()
    def inference(self, sequence: str):
        num_steps = min(len(sequence), self.max_steps)

        print(f"running ESM3 inference with num_steps={num_steps}")
        esm_protein = self.model.generate(
            ESMProtein(sequence=sequence), self.get_generation_config(num_steps)
        )

        print("checking for errors in output")
        if hasattr(esm_protein, "error_msg"):
            raise ValueError(esm_protein.error_msg)

        print("converting ESMProtein into MMCIF file")
        save_path = Path(tempfile.mktemp() + ".mmcif")
        self.convert_protein_to_MMCIF(esm_protein, save_path)

        print("returning MMCIF bytes")
        return io.BytesIO(save_path.read_bytes())


\`\`\`

## Serve a dashboard as an \`asgi_app\`

In this section we'll create a web interface around the ESM3 model
that can help scientists and stakeholders understand and interrogate the results of the model.

You can deploy this UI, along with the backing inference endpoint,
with the following command:

\`\`\`bash
modal deploy esm3.py
\`\`\`

### Integrating Modal Functions

The integration between our dashboard and our inference backend
is made simple by the Modal SDK:
because the definition of the \`Model\` class is available in the same Python
context as the defintion of the web UI,
we can instantiate an instance and call its methods with \`.remote\`.

The inference runs in a GPU-accelerated container with all of ESM3's
dependencies, while this code executes in a CPU-only container
with only our web dependencies.

\`\`\`python
def run_esm(sequence: str) -> str:
    sequence = sequence.strip()

    print("running ESM")
    mmcif_buffer = Model().inference.remote(sequence)

    print("converting mmCIF bytes to base64 for compatibility with HTML")
    mmcif_content = mmcif_buffer.read().decode()
    mmcif_base64 = base64.b64encode(mmcif_content.encode()).decode()

    return get_molstar_html(mmcif_base64)


\`\`\`

### Building a UI in Python with Gradio

We'll visualize the results using [Mol* ](https://molstar.org/).
Mol* (pronounced "molstar") is an open-source toolkit for
visualizing and analyzing large-scale molecular data, including secondary structures
and residue-specific positions of proteins.

Second, we'll create links to lookup the metadata and structure of known
proteins using the [Universal Protein Resource](https://www.uniprot.org/)
database from the UniProt consortium which is supported by the European
Bioinformatics Institute, the National Human Genome Research
Institute, and the Swiss Institute of Bioinformatics. UniProt
is also a hub that links to many other databases, like the RCSB Protein
Data Bank.

To pull sequence data, we'll use the [Biotite](https://www.biotite-python.org/)
library to pull [FASTA](https://en.wikipedia.org/wiki/FASTA_format) files from
UniProt which contain labelled sequences.

You should see the URL for this UI in the output of \`modal deploy\`
or on your [Modal app dashboard](https://modal.com/apps) for this app.

\`\`\`python
@app.function(
    image=web_app_image,
    volumes={VOLUME_PATH: volume},
    max_containers=1,  # Gradio requires sticky sessions
)
@modal.concurrent(max_inputs=100)  # Gradio can handle many async inputs
@modal.asgi_app()
def ui():
    import gradio as gr
    from fastapi.responses import FileResponse
    from gradio.routes import mount_gradio_app

    web_app = FastAPI()

    # custom styles: an icon, a background, and some CSS
    @web_app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        return FileResponse("/assets/favicon.svg")

    @web_app.get("/assets/background.svg", include_in_schema=False)
    async def background():
        return FileResponse("/assets/background.svg")

    css = Path("/assets/index.css").read_text()

    theme = gr.themes.Default(
        primary_hue="green", secondary_hue="emerald", neutral_hue="neutral"
    )

    title = "Predict & Visualize Protein Structures"

    with gr.Blocks(theme=theme, css=css, title=title, js=always_dark()) as interface:
        gr.Markdown(f"# {title}")

        with gr.Row():
            with gr.Column():
                gr.Markdown("## Enter UniProt ID ")
                uniprot_num_box = gr.Textbox(
                    label="Enter UniProt ID or select one on the right",
                    placeholder="e.g. P02768, P69905,  etc.",
                )
                get_sequence_button = gr.Button(
                    "Retrieve Sequence from UniProt ID", variant="primary"
                )

                uniprot_link_button = gr.Button(value="View protein on UniProt website")
                uniprot_link_button.click(
                    fn=None,
                    inputs=uniprot_num_box,
                    js=get_js_for_uniprot_link(),
                )

            with gr.Column():
                example_uniprots = get_uniprot_examples()

                def extract_uniprot_num(example_idx):
                    uniprot = example_uniprots[example_idx]
                    return uniprot[uniprot.index("[") + 1 : uniprot.index("]")]

                gr.Markdown("## Example UniProt Accession Numbers")
                with gr.Row():
                    half_len = int(len(example_uniprots) / 2)
                    with gr.Column():
                        for i, uniprot in enumerate(example_uniprots[:half_len]):
                            btn = gr.Button(uniprot, variant="secondary")
                            btn.click(
                                fn=lambda j=i: extract_uniprot_num(j),
                                outputs=uniprot_num_box,
                            )

                    with gr.Column():
                        for i, uniprot in enumerate(example_uniprots[half_len:]):
                            btn = gr.Button(uniprot, variant="secondary")
                            btn.click(
                                fn=lambda j=i + half_len: extract_uniprot_num(j),
                                outputs=uniprot_num_box,
                            )

        gr.Markdown("## Enter Sequence")
        sequence_box = gr.Textbox(
            label="Enter a sequence or retrieve it from a UniProt ID",
            placeholder="e.g. MVTRLE..., PVTTIMHALL..., etc.",
        )
        get_sequence_button.click(
            fn=get_sequence, inputs=[uniprot_num_box], outputs=[sequence_box]
        )

        run_esm_button = gr.Button("Run ESM3 Folding", variant="primary")

        gr.Markdown("## ESM3 Predicted Structure")
        molstar_html = gr.HTML()

        run_esm_button.click(fn=run_esm, inputs=sequence_box, outputs=molstar_html)

    # return a FastAPI app for Modal to serve
    return mount_gradio_app(app=web_app, blocks=interface, path="/")


\`\`\`

## Folding from the command line

If you want to quickly run the ESM3 model without the web interface, you can
run it from the command line like this:

\`\`\`shell
modal run esm3
\`\`\`

This will run the same inference code above on Modal. The results are
returned in the [Crystallographic Information File](https://en.wikipedia.org/wiki/Crystallographic_Information_File)
format, which you can render with the online [Molstar Viewer](https://molstar.org/viewer/).

\`\`\`python
@app.local_entrypoint()
def main(sequence: Optional[str] = None, output_dir: Optional[str] = None):
    if sequence is None:
        print("using sequence for insulin [P01308]")
        sequence = "MRTPMLLALLALATLCLAGRADAKPGDAESGKGAAFVSKQEGSEVVKRLRRYLDHWLGAPAPYPDPLEPKREVCELNPDCDELADHIGFQEAYRRFYGPV"

    if output_dir is None:
        output_dir = Path("/tmp/esm3")
        output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "output.mmcif"

    print("starting inference on Modal")
    results_buffer = Model().inference.remote(sequence)

    print(f"writing results to {output_path}")
    output_path.write_bytes(results_buffer.read())


\`\`\`

## Addenda

The remainder of this code is boilerplate.

### Extracting Sequences from UniProt Accession Numbers

To retrieve sequence information we'll utilize the \`biotite\` library which
will allow us to fetch [fasta](https://en.wikipedia.org/wiki/FASTA_format)
sequence files from the [National Center for Biotechnology Information (NCBI) Entrez database](https://www.ncbi.nlm.nih.gov/Web/Search/entrezfs.html).

\`\`\`python
def get_sequence(uniprot_num: str) -> str:
    try:
        DATA_PATH.mkdir(parents=True, exist_ok=True)

        uniprot_num = uniprot_num.strip()
        fasta_path = DATA_PATH / f"{uniprot_num}.fasta"

        print(f"Fetching {fasta_path} from the entrez database")
        entrez.fetch_single_file(
            uniprot_num, fasta_path, db_name="protein", ret_type="fasta"
        )
        fasta_file = fasta.FastaFile.read(fasta_path)

        protein_sequence = fasta.get_sequence(fasta_file)
        return str(protein_sequence)

    except Exception as e:
        return f"Error: {e}"


\`\`\`

### Supporting functions for the Gradio app

The following Python code is used to enhance the Gradio app,
mostly by generating some extra HTML & JS and handling styling.

\`\`\`python
def get_js_for_uniprot_link():
    url = "https://www.uniprot.org/uniprotkb/"
    end = "/entry#structure"
    return f"""(uni_id) => {{ if (!uni_id) return; window.open("{url}" + uni_id + "{end}"); }}"""


def get_molstar_html(mmcif_base64):
    return f"""
    <iframe
        id="molstar_frame"
        style="width: 100%; height: 600px; border: none;"
        srcdoc='
            <!DOCTYPE html>
            <html>
                <head>
                    
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@rcsb/rcsb-molstar/build/dist/viewer/rcsb-molstar.css">
                </head>
                <body>
                    <div id="protein-viewer" style="width: 1200px; height: 400px; position: center"></div>
                    
                </body>
            </html>
        '>
    </iframe>"""


def get_uniprot_examples():
    return [
        "Albumin [P02768]",
        "Insulin [P01308]",
        "Hemoglobin [P69905]",
        "Lysozyme [P61626]",
        "BRCA1 [P38398]",
        "Immunoglobulin [P01857]",
        "Actin [P60709]",
        "Ribonuclease [P07998]",
    ]


def always_dark():
    return """
    function refresh() {
        const url = new URL(window.location);

        if (url.searchParams.get('__theme') !== 'dark') {
            url.searchParams.set('__theme', 'dark');
            window.location.href = url.href;
        }
    }
    """

\`\`\`
`,meta:{title:`Build a protein folding dashboard with ESM3, Molstar, and Gradio`,description:`There are perhaps a quadrillion distinct proteins on the planet Earth, each one a marvel of nanotechnology discovered by painstaking evolution. We know the amino acid sequence of nearly a billion but we only know the three-dimensional structure of a few hundred thousand, gathered by slow, difficult observational methods like X-ray crystallography. Built upon this data are machine learning models like EvolutionaryScale’s ESM3 that can predict the structure of any sequence in seconds.`}},{toc:h,rawContent:g,meta:_}=m,re=t(`Define a <code>Model</code> inference class for ESM3`,1),ie=t(`Serve a dashboard as an <code>asgi_app</code>`,1),ae=t(`<!> <p><!></p> <p>There are perhaps a quadrillion distinct proteins on the planet Earth,
each one a marvel of nanotechnology discovered by painstaking evolution.
We know the amino acid sequence of nearly a billion but we only
know the three-dimensional structure of a few hundred thousand,
gathered by slow, difficult observational methods like X-ray crystallography.
Built upon this data are machine learning models like
EvolutionaryScale’s <!> that can predict the structure of any sequence in seconds.</p> <p>In this example, we’ll show how you can use Modal to not
just run the latest protein-folding model but also build tools around it for
you and your team of scientists to understand and analyze the results.</p> <!> <!> <!> <p>To minimize cold start times, we’ll store the ESM3 model weights on a Modal <!>.
For patterns and best practices for storing model weights on Modal, see <!>.
We’ll use this same distributed storage primitive to store sequence data.</p> <!> <!> <p>The container image for structure inference is based on Modal’s default slim Debian
Linux image with <code>esm</code> for loading and running the model, <code>gemmi</code> for
managing protein structure file conversions, and setting an environment variable
for faster downloading of the model weights from Hugging Face.</p> <!> <p>We’ll also define a separate image, with different dependencies,
for the part of our app that hosts the dashboard.
This helps reduce the complexity of Python dependency management
by “walling off” the different parts, e.g. separating
functions that depend on finicky ML packages
from those that depend on pedantic web packages.
Dependencies include <code>gradio</code> for building a web UI in Python and <code>biotite</code> for extracting sequences from UniProt accession numbers.</p> <p>You can read more about how to configure container images on Modal in <!>.</p> <!> <p>Here we “pre-import” libraries that will be used by the functions we run
on Modal in a given image using the <code>with image.imports</code> context manager.</p> <!> <!> <p>Next, we map the model’s setup and inference code onto Modal.</p> <ol><li>For setup code that only needs to run once, we put it in a method
decorated with <code>@enter</code>, which runs on container start. For details,
see <!>.</li> <li>The rest of the inference code goes in a method decorated with <code>@method</code>.</li> <li>We accelerate the compute-intensive inference with a GPU, specifically an A10G.
For more on using GPUs on Modal, see <!>.</li></ol> <!> <!> <p>In this section we’ll create a web interface around the ESM3 model
that can help scientists and stakeholders understand and interrogate the results of the model.</p> <p>You can deploy this UI, along with the backing inference endpoint,
with the following command:</p> <!> <!> <p>The integration between our dashboard and our inference backend
is made simple by the Modal SDK:
because the definition of the <code>Model</code> class is available in the same Python
context as the defintion of the web UI,
we can instantiate an instance and call its methods with <code>.remote</code>.</p> <p>The inference runs in a GPU-accelerated container with all of ESM3’s
dependencies, while this code executes in a CPU-only container
with only our web dependencies.</p> <!> <!> <p>We’ll visualize the results using <!>.
Mol* (pronounced “molstar”) is an open-source toolkit for
visualizing and analyzing large-scale molecular data, including secondary structures
and residue-specific positions of proteins.</p> <p>Second, we’ll create links to lookup the metadata and structure of known
proteins using the <!> database from the UniProt consortium which is supported by the European
Bioinformatics Institute, the National Human Genome Research
Institute, and the Swiss Institute of Bioinformatics. UniProt
is also a hub that links to many other databases, like the RCSB Protein
Data Bank.</p> <p>To pull sequence data, we’ll use the <!> library to pull <!> files from
UniProt which contain labelled sequences.</p> <p>You should see the URL for this UI in the output of <code>modal deploy</code> or on your <!> for this app.</p> <!> <!> <p>If you want to quickly run the ESM3 model without the web interface, you can
run it from the command line like this:</p> <!> <p>This will run the same inference code above on Modal. The results are
returned in the <!> format, which you can render with the online <!>.</p> <!> <!> <p>The remainder of this code is boilerplate.</p> <!> <p>To retrieve sequence information we’ll utilize the <code>biotite</code> library which
will allow us to fetch <!> sequence files from the <!>.</p> <!> <!> <p>The following Python code is used to enhance the Gradio app,
mostly by generating some extra HTML & JS and handling styling.</p> <!>`,1);function v(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=ae(),f=ee(o);te(f,{id:`build-a-protein-folding-dashboard-with-esm3-molstar-and-gradio`,children:(e,t)=>{c(),i(e,r(`Build a protein folding dashboard with ESM3, Molstar, and Gradio`))},$$slots:{default:!0}});var m=s(f,2);ne(e(m),{src:`https://modal-cdn.com/example-esm3-ui.png`,alt:`Image of dashboard UI for ESM3 protein folding`}),n(m);var h=s(m,2);p(s(e(h)),{href:`https://www.evolutionaryscale.ai/blog/esm3-release`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`ESM3`))},$$slots:{default:!0}}),c(),n(h);var g=s(h,4);l(g,{id:`basic-setup`,children:(e,t)=>{c(),i(e,r(`Basic Setup`))},$$slots:{default:!0}});var _=s(g,2);d(_,{code:`import%20base64%0Aimport%20io%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(%22example-esm3%22)%0A`,lang:`python`});var v=s(_,2);u(v,{id:`create-a-volume-to-store-esm3-model-weights-and-entrez-sequence-data`,children:(e,t)=>{c(),i(e,r(`Create a Volume to store ESM3 model weights and Entrez sequence data`))},$$slots:{default:!0}});var y=s(v,2),b=s(e(y));p(b,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Volume`))},$$slots:{default:!0}}),p(s(b,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(y);var x=s(y,2);d(x,{code:`volume%20%3D%20modal.Volume.from_name(%22example-esm3%22%2C%20create_if_missing%3DTrue)%0AVOLUME_PATH%20%3D%20Path(%22%2Fvol%22)%0AMODELS_PATH%20%3D%20VOLUME_PATH%20%2F%20%22models%22%0ADATA_PATH%20%3D%20VOLUME_PATH%20%2F%20%22data%22%0A`,lang:`python`});var S=s(x,2);u(S,{id:`define-dependencies-in-container-images`,children:(e,t)=>{c(),i(e,r(`Define dependencies in container images`))},$$slots:{default:!0}});var C=s(S,4);d(C,{code:`esm3_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22esm%3D%3D3.1.1%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.4.1%22%2C%0A%20%20%20%20%20%20%20%20%22gemmi%3D%3D0.7.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%22HF_HOME%22%3A%20str(MODELS_PATH)%7D)%0A)%0A`,lang:`python`});var w=s(C,4);p(s(e(w)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(w);var T=s(w,2);d(T,{code:`web_app_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%22gradio~%3D4.44.0%22%2C%20%22biotite%3D%3D0.41.2%22%2C%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22)%0A%20%20%20%20.add_local_dir(Path(__file__).parent%20%2F%20%22frontend%22%2C%20remote_path%3D%22%2Fassets%22)%0A)%0A%0A`,lang:`python`});var E=s(T,4);d(E,{code:`with%20esm3_image.imports()%3A%0A%20%20%20%20import%20tempfile%0A%0A%20%20%20%20import%20gemmi%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20esm.models.esm3%20import%20ESM3%0A%20%20%20%20from%20esm.sdk.api%20import%20ESMProtein%2C%20GenerationConfig%0A%0Awith%20web_app_image.imports()%3A%0A%20%20%20%20import%20biotite.database.entrez%20as%20entrez%0A%20%20%20%20import%20biotite.sequence.io.fasta%20as%20fasta%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A`,lang:`python`});var D=s(E,2);l(D,{id:`define-a-model-inference-class-for-esm3`,children:(e,t)=>{c();var n=re();c(2),i(e,n)},$$slots:{default:!0}});var O=s(D,4),k=e(O);p(s(e(k),3),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(k);var A=s(k,4);p(s(e(A)),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(A),n(O);var j=s(O,2);d(j,{code:`%40app.cls(%0A%20%20%20%20image%3Desm3_image%2C%0A%20%20%20%20volumes%3D%7BVOLUME_PATH%3A%20volume%7D%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20timeout%3D20%20*%20MINUTES%2C%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20ESM3.from_pretrained(%22esm3_sm_open_v1%22)%0A%20%20%20%20%20%20%20%20self.model.to(%22cuda%22)%0A%0A%20%20%20%20%20%20%20%20print(%22using%20half%20precision%20and%20tensor%20cores%20for%20fast%20ESM3%20inference%22)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20self.model.half()%0A%20%20%20%20%20%20%20%20torch.backends.cuda.matmul.allow_tf32%20%3D%20True%0A%0A%20%20%20%20%20%20%20%20self.max_steps%20%3D%20250%0A%20%20%20%20%20%20%20%20print(f%22setting%20max%20ESM%20steps%20to%3A%20%7Bself.max_steps%7D%22)%0A%0A%20%20%20%20def%20convert_protein_to_MMCIF(self%2C%20esm_protein%2C%20output_path)%3A%0A%20%20%20%20%20%20%20%20structure%20%3D%20gemmi.read_pdb_string(esm_protein.to_pdb_string())%0A%20%20%20%20%20%20%20%20doc%20%3D%20structure.make_mmcif_document()%0A%20%20%20%20%20%20%20%20doc.write_file(str(output_path)%2C%20gemmi.cif.WriteOptions())%0A%0A%20%20%20%20def%20get_generation_config(self%2C%20num_steps)%3A%0A%20%20%20%20%20%20%20%20return%20GenerationConfig(track%3D%22structure%22%2C%20num_steps%3Dnum_steps)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20sequence%3A%20str)%3A%0A%20%20%20%20%20%20%20%20num_steps%20%3D%20min(len(sequence)%2C%20self.max_steps)%0A%0A%20%20%20%20%20%20%20%20print(f%22running%20ESM3%20inference%20with%20num_steps%3D%7Bnum_steps%7D%22)%0A%20%20%20%20%20%20%20%20esm_protein%20%3D%20self.model.generate(%0A%20%20%20%20%20%20%20%20%20%20%20%20ESMProtein(sequence%3Dsequence)%2C%20self.get_generation_config(num_steps)%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(%22checking%20for%20errors%20in%20output%22)%0A%20%20%20%20%20%20%20%20if%20hasattr(esm_protein%2C%20%22error_msg%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(esm_protein.error_msg)%0A%0A%20%20%20%20%20%20%20%20print(%22converting%20ESMProtein%20into%20MMCIF%20file%22)%0A%20%20%20%20%20%20%20%20save_path%20%3D%20Path(tempfile.mktemp()%20%2B%20%22.mmcif%22)%0A%20%20%20%20%20%20%20%20self.convert_protein_to_MMCIF(esm_protein%2C%20save_path)%0A%0A%20%20%20%20%20%20%20%20print(%22returning%20MMCIF%20bytes%22)%0A%20%20%20%20%20%20%20%20return%20io.BytesIO(save_path.read_bytes())%0A%0A`,lang:`python`});var M=s(j,2);l(M,{id:`serve-a-dashboard-as-an-asgi_app`,children:(e,t)=>{c();var n=ie();c(),i(e,n)},$$slots:{default:!0}});var N=s(M,6);d(N,{code:`modal%20deploy%20esm3.py`,lang:`bash`});var P=s(N,2);u(P,{id:`integrating-modal-functions`,children:(e,t)=>{c(),i(e,r(`Integrating Modal Functions`))},$$slots:{default:!0}});var F=s(P,6);d(F,{code:`def%20run_esm(sequence%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20sequence%20%3D%20sequence.strip()%0A%0A%20%20%20%20print(%22running%20ESM%22)%0A%20%20%20%20mmcif_buffer%20%3D%20Model().inference.remote(sequence)%0A%0A%20%20%20%20print(%22converting%20mmCIF%20bytes%20to%20base64%20for%20compatibility%20with%20HTML%22)%0A%20%20%20%20mmcif_content%20%3D%20mmcif_buffer.read().decode()%0A%20%20%20%20mmcif_base64%20%3D%20base64.b64encode(mmcif_content.encode()).decode()%0A%0A%20%20%20%20return%20get_molstar_html(mmcif_base64)%0A%0A`,lang:`python`});var I=s(F,2);u(I,{id:`building-a-ui-in-python-with-gradio`,children:(e,t)=>{c(),i(e,r(`Building a UI in Python with Gradio`))},$$slots:{default:!0}});var L=s(I,2);p(s(e(L)),{href:`https://molstar.org/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Mol*`))},$$slots:{default:!0}}),c(),n(L);var R=s(L,2);p(s(e(R)),{href:`https://www.uniprot.org/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Universal Protein Resource`))},$$slots:{default:!0}}),c(),n(R);var z=s(R,2),B=s(e(z));p(B,{href:`https://www.biotite-python.org/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Biotite`))},$$slots:{default:!0}}),p(s(B,2),{href:`https://en.wikipedia.org/wiki/FASTA_format`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`FASTA`))},$$slots:{default:!0}}),c(),n(z);var V=s(z,2);p(s(e(V),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal app dashboard`))},$$slots:{default:!0}}),c(),n(V);var H=s(V,2);d(H,{code:`%40app.function(%0A%20%20%20%20image%3Dweb_app_image%2C%0A%20%20%20%20volumes%3D%7BVOLUME_PATH%3A%20volume%7D%2C%0A%20%20%20%20max_containers%3D1%2C%20%20%23%20Gradio%20requires%20sticky%20sessions%0A)%0A%40modal.concurrent(max_inputs%3D100)%20%20%23%20Gradio%20can%20handle%20many%20async%20inputs%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi.responses%20import%20FileResponse%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20custom%20styles%3A%20an%20icon%2C%20a%20background%2C%20and%20some%20CSS%0A%20%20%20%20%40web_app.get(%22%2Ffavicon.ico%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20favicon()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Ffavicon.svg%22)%0A%0A%20%20%20%20%40web_app.get(%22%2Fassets%2Fbackground.svg%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20background()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Fbackground.svg%22)%0A%0A%20%20%20%20css%20%3D%20Path(%22%2Fassets%2Findex.css%22).read_text()%0A%0A%20%20%20%20theme%20%3D%20gr.themes.Default(%0A%20%20%20%20%20%20%20%20primary_hue%3D%22green%22%2C%20secondary_hue%3D%22emerald%22%2C%20neutral_hue%3D%22neutral%22%0A%20%20%20%20)%0A%0A%20%20%20%20title%20%3D%20%22Predict%20%26%20Visualize%20Protein%20Structures%22%0A%0A%20%20%20%20with%20gr.Blocks(theme%3Dtheme%2C%20css%3Dcss%2C%20title%3Dtitle%2C%20js%3Dalways_dark())%20as%20interface%3A%0A%20%20%20%20%20%20%20%20gr.Markdown(f%22%23%20%7Btitle%7D%22)%0A%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Enter%20UniProt%20ID%20%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20uniprot_num_box%20%3D%20gr.Textbox(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22Enter%20UniProt%20ID%20or%20select%20one%20on%20the%20right%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%22e.g.%20P02768%2C%20P69905%2C%20%20etc.%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20get_sequence_button%20%3D%20gr.Button(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Retrieve%20Sequence%20from%20UniProt%20ID%22%2C%20variant%3D%22primary%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20uniprot_link_button%20%3D%20gr.Button(value%3D%22View%20protein%20on%20UniProt%20website%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20uniprot_link_button.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20inputs%3Duniprot_num_box%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20js%3Dget_js_for_uniprot_link()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20example_uniprots%20%3D%20get_uniprot_examples()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20def%20extract_uniprot_num(example_idx)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20uniprot%20%3D%20example_uniprots%5Bexample_idx%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20uniprot%5Buniprot.index(%22%5B%22)%20%2B%201%20%3A%20uniprot.index(%22%5D%22)%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Example%20UniProt%20Accession%20Numbers%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20half_len%20%3D%20int(len(example_uniprots)%20%2F%202)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20i%2C%20uniprot%20in%20enumerate(example_uniprots%5B%3Ahalf_len%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(uniprot%2C%20variant%3D%22secondary%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3Dlambda%20j%3Di%3A%20extract_uniprot_num(j)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20outputs%3Duniprot_num_box%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20i%2C%20uniprot%20in%20enumerate(example_uniprots%5Bhalf_len%3A%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(uniprot%2C%20variant%3D%22secondary%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3Dlambda%20j%3Di%20%2B%20half_len%3A%20extract_uniprot_num(j)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20outputs%3Duniprot_num_box%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Enter%20Sequence%22)%0A%20%20%20%20%20%20%20%20sequence_box%20%3D%20gr.Textbox(%0A%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22Enter%20a%20sequence%20or%20retrieve%20it%20from%20a%20UniProt%20ID%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%22e.g.%20MVTRLE...%2C%20PVTTIMHALL...%2C%20etc.%22%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20get_sequence_button.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20fn%3Dget_sequence%2C%20inputs%3D%5Buniprot_num_box%5D%2C%20outputs%3D%5Bsequence_box%5D%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20run_esm_button%20%3D%20gr.Button(%22Run%20ESM3%20Folding%22%2C%20variant%3D%22primary%22)%0A%0A%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20ESM3%20Predicted%20Structure%22)%0A%20%20%20%20%20%20%20%20molstar_html%20%3D%20gr.HTML()%0A%0A%20%20%20%20%20%20%20%20run_esm_button.click(fn%3Drun_esm%2C%20inputs%3Dsequence_box%2C%20outputs%3Dmolstar_html)%0A%0A%20%20%20%20%23%20return%20a%20FastAPI%20app%20for%20Modal%20to%20serve%0A%20%20%20%20return%20mount_gradio_app(app%3Dweb_app%2C%20blocks%3Dinterface%2C%20path%3D%22%2F%22)%0A%0A`,lang:`python`});var U=s(H,2);l(U,{id:`folding-from-the-command-line`,children:(e,t)=>{c(),i(e,r(`Folding from the command line`))},$$slots:{default:!0}});var W=s(U,4);d(W,{code:`modal%20run%20esm3`,lang:`shell`});var G=s(W,2),K=s(e(G));p(K,{href:`https://en.wikipedia.org/wiki/Crystallographic_Information_File`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Crystallographic Information File`))},$$slots:{default:!0}}),p(s(K,2),{href:`https://molstar.org/viewer/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Molstar Viewer`))},$$slots:{default:!0}}),c(),n(G);var q=s(G,2);d(q,{code:`%40app.local_entrypoint()%0Adef%20main(sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%20output_dir%3A%20Optional%5Bstr%5D%20%3D%20None)%3A%0A%20%20%20%20if%20sequence%20is%20None%3A%0A%20%20%20%20%20%20%20%20print(%22using%20sequence%20for%20insulin%20%5BP01308%5D%22)%0A%20%20%20%20%20%20%20%20sequence%20%3D%20%22MRTPMLLALLALATLCLAGRADAKPGDAESGKGAAFVSKQEGSEVVKRLRRYLDHWLGAPAPYPDPLEPKREVCELNPDCDELADHIGFQEAYRRFYGPV%22%0A%0A%20%20%20%20if%20output_dir%20is%20None%3A%0A%20%20%20%20%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fesm3%22)%0A%20%20%20%20%20%20%20%20output_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20output_path%20%3D%20output_dir%20%2F%20%22output.mmcif%22%0A%0A%20%20%20%20print(%22starting%20inference%20on%20Modal%22)%0A%20%20%20%20results_buffer%20%3D%20Model().inference.remote(sequence)%0A%0A%20%20%20%20print(f%22writing%20results%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_bytes(results_buffer.read())%0A%0A`,lang:`python`});var J=s(q,2);l(J,{id:`addenda`,children:(e,t)=>{c(),i(e,r(`Addenda`))},$$slots:{default:!0}});var Y=s(J,4);u(Y,{id:`extracting-sequences-from-uniprot-accession-numbers`,children:(e,t)=>{c(),i(e,r(`Extracting Sequences from UniProt Accession Numbers`))},$$slots:{default:!0}});var X=s(Y,2),Z=s(e(X),3);p(Z,{href:`https://en.wikipedia.org/wiki/FASTA_format`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`fasta`))},$$slots:{default:!0}}),p(s(Z,2),{href:`https://www.ncbi.nlm.nih.gov/Web/Search/entrezfs.html`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`National Center for Biotechnology Information (NCBI) Entrez database`))},$$slots:{default:!0}}),c(),n(X);var Q=s(X,2);d(Q,{code:`def%20get_sequence(uniprot_num%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20DATA_PATH.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20%20%20%20%20uniprot_num%20%3D%20uniprot_num.strip()%0A%20%20%20%20%20%20%20%20fasta_path%20%3D%20DATA_PATH%20%2F%20f%22%7Buniprot_num%7D.fasta%22%0A%0A%20%20%20%20%20%20%20%20print(f%22Fetching%20%7Bfasta_path%7D%20from%20the%20entrez%20database%22)%0A%20%20%20%20%20%20%20%20entrez.fetch_single_file(%0A%20%20%20%20%20%20%20%20%20%20%20%20uniprot_num%2C%20fasta_path%2C%20db_name%3D%22protein%22%2C%20ret_type%3D%22fasta%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20fasta_file%20%3D%20fasta.FastaFile.read(fasta_path)%0A%0A%20%20%20%20%20%20%20%20protein_sequence%20%3D%20fasta.get_sequence(fasta_file)%0A%20%20%20%20%20%20%20%20return%20str(protein_sequence)%0A%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20return%20f%22Error%3A%20%7Be%7D%22%0A%0A`,lang:`python`});var $=s(Q,2);u($,{id:`supporting-functions-for-the-gradio-app`,children:(e,t)=>{c(),i(e,r(`Supporting functions for the Gradio app`))},$$slots:{default:!0}}),d(s($,4),{code:`def%20get_js_for_uniprot_link()%3A%0A%20%20%20%20url%20%3D%20%22https%3A%2F%2Fwww.uniprot.org%2Funiprotkb%2F%22%0A%20%20%20%20end%20%3D%20%22%2Fentry%23structure%22%0A%20%20%20%20return%20f%22%22%22(uni_id)%20%3D%3E%20%7B%7B%20if%20(!uni_id)%20return%3B%20window.open(%22%7Burl%7D%22%20%2B%20uni_id%20%2B%20%22%7Bend%7D%22)%3B%20%7D%7D%22%22%22%0A%0A%0Adef%20get_molstar_html(mmcif_base64)%3A%0A%20%20%20%20return%20f%22%22%22%0A%20%20%20%20%3Ciframe%0A%20%20%20%20%20%20%20%20id%3D%22molstar_frame%22%0A%20%20%20%20%20%20%20%20style%3D%22width%3A%20100%25%3B%20height%3A%20600px%3B%20border%3A%20none%3B%22%0A%20%20%20%20%20%20%20%20srcdoc%3D'%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C!DOCTYPE%20html%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Chtml%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Chead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cscript%20src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2F%40rcsb%2Frcsb-molstar%2Fbuild%2Fdist%2Fviewer%2Frcsb-molstar.js%22%3E%3C%2Fscript%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Clink%20rel%3D%22stylesheet%22%20href%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2F%40rcsb%2Frcsb-molstar%2Fbuild%2Fdist%2Fviewer%2Frcsb-molstar.css%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fhead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20id%3D%22protein-viewer%22%20style%3D%22width%3A%201200px%3B%20height%3A%20400px%3B%20position%3A%20center%22%3E%3C%2Fdiv%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cscript%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log(%22Initializing%20viewer...%22)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(async%20function()%20%7B%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Create%20plugin%20instance%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20viewer%20%3D%20new%20rcsbMolstar.Viewer(%22protein-viewer%22)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20CIF%20data%20in%20base64%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20mmcifData%20%3D%20%22%7Bmmcif_base64%7D%22%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Convert%20base64%20to%20blob%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20blob%20%3D%20new%20Blob(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Batob(mmcifData)%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B%20type%3A%20%22text%2Fplain%22%20%7D%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Create%20object%20URL%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20url%20%3D%20URL.createObjectURL(blob)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Load%20structure%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20viewer.loadStructureFromUrl(url%2C%20%22mmcif%22)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%7D%20catch%20(error)%20%7B%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error(%22Error%20loading%20structure%3A%22%2C%20error)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%7D)()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fscript%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbody%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fhtml%3E%0A%20%20%20%20%20%20%20%20'%3E%0A%20%20%20%20%3C%2Fiframe%3E%22%22%22%0A%0A%0Adef%20get_uniprot_examples()%3A%0A%20%20%20%20return%20%5B%0A%20%20%20%20%20%20%20%20%22Albumin%20%5BP02768%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Insulin%20%5BP01308%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Hemoglobin%20%5BP69905%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Lysozyme%20%5BP61626%5D%22%2C%0A%20%20%20%20%20%20%20%20%22BRCA1%20%5BP38398%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Immunoglobulin%20%5BP01857%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Actin%20%5BP60709%5D%22%2C%0A%20%20%20%20%20%20%20%20%22Ribonuclease%20%5BP07998%5D%22%2C%0A%20%20%20%20%5D%0A%0A%0Adef%20always_dark()%3A%0A%20%20%20%20return%20%22%22%22%0A%20%20%20%20function%20refresh()%20%7B%0A%20%20%20%20%20%20%20%20const%20url%20%3D%20new%20URL(window.location)%3B%0A%0A%20%20%20%20%20%20%20%20if%20(url.searchParams.get('__theme')%20!%3D%3D%20'dark')%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20url.searchParams.set('__theme'%2C%20'dark')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url.href%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20%22%22%22%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=cF2Jmi2W2.js.map
