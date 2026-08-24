(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5982adca-9951-4459-8431-098c5e87ac2e`,e._sentryDebugIdIdentifier=`sentry-dbid-5982adca-9951-4459-8431-098c5e87ac2e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Fold proteins and biomolecular complexes with ESMFold2`,id:`fold-proteins-and-biomolecular-complexes-with-esmfold2`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Installing ESMFold2 Python dependencies on Modal`,id:`installing-esmfold2-python-dependencies-on-modal`},{depth:2,value:`Caching ESMFold2 model weights on Modal Volumes`,id:`caching-esmfold2-model-weights-on-modal-volumes`},{depth:2,value:`Running ESMFold2 on Modal`,id:`running-esmfold2-on-modal`},{depth:2,value:`Fold a complex from the command line`,id:`fold-a-complex-from-the-command-line`}]}],rawContent:`# Fold proteins and biomolecular complexes with ESMFold2

[ESMFold2](https://biohub.ai/esm/protein/about) is a state-of-the-art model
for biomolecular complex structure prediction, developed by [Biohub](https://biohub.ai/) and released
under an open license. Built on ESMC representations, it produces leading accuracy
for protein-protein and antibody-antigen interactions at any given compute budget.

ESMFold2 is available in two configurations:

- [ESMFold2](https://huggingface.co/biohub/ESMFold2): the larger model for
  maximum accuracy. It can be run either from a single sequence or with MSA
  context, with MSAs improving performance on difficult complexes.
- [ESMFold2-Fast](https://huggingface.co/biohub/ESMFold2-Fast): a smaller
  model optimized for very fast single-sequence folding. It is well suited for
  high-throughput folding, designed sequences, metagenomic proteins, and
  targets with limited homologous sequence information.

In this example, we demonstrate how to run ESMFold2 on Modal's flexible
serverless infrastructure. By default, we fold a protein-DNA-ligand complex
(the M.HhaI DNA methyltransferase bound to a methylated DNA duplex and its
SAH cofactor), which exercises the model's full multimer capabilities.
You can also pass any single-chain protein sequence from the command line.

This script is meant as a starting point that demonstrates how to
create a \`modal.Image\` with the correct dependencies, cache weights to a \`modal.Volume\`,
and save the output to a file for a single folding request.
To really leverage Modal's serverless infrastructure, try scaling inference up across
hundreds or thousands of structures or invert the model to design binders
for a target protein.

## Setup

\`\`\`python
from pathlib import Path
from typing import Optional

import modal

here = Path(__file__).parent  # the directory of this file

MINUTES = 60  # seconds

app = modal.App(name="example-esmfold2")

\`\`\`

## Installing ESMFold2 Python dependencies on Modal

Code executing on Modal runs inside containers built from
[\`modal.Image\`s](https://modal.com/docs/guide/images) that include that
code's dependencies.
For ESMFold2, we only need the \`esm\` library from Biohub which will install the necessary dependencies
including a custom fork of the \`transformers\` library.

\`\`\`python
ESM_REVISION = "81b3646c9429ea8458918415ad6a46178cb59833"  # pin upstream commit so builds are reproducible

esmfold2_image = (
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("git")
    .uv_pip_install(
        f"esm @ git+https://github.com/Biohub/esm.git@{ESM_REVISION}",
    )
)

\`\`\`

We'll use the \`image.imports()\` context manager to import libraries we'll need in our inference code.
The context manager allows us to import libraries that might not be installed locally but are installed in our \`modal.Image\`.

\`\`\`python
with esmfold2_image.imports():
    from esm.models.esmfold2 import (
        DNAInput,
        ESMFold2InputBuilder,
        LigandInput,
        Modification,
        ProteinInput,
        StructurePredictionInput,
    )
    from transformers.models.esmfold2.modeling_esmfold2 import ESMFold2Model

\`\`\`

## Caching ESMFold2 model weights on Modal Volumes

Rather than re-downloading the model weights on each cold start, we cache them on a [Modal Volume](https://modal.com/docs/guide/volumes).
The first time you run inference, you'll see that downloading the weights takes several minutes,
but subsequent runs will start up significantly faster.
For more on storing model weights on Modal, see [this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
esmfold2_volume = modal.Volume.from_name("esmfold2-models", create_if_missing=True)
models_dir = Path("/models")

\`\`\`

We also need to point the HF cache at the Volume, and we'll enable high-performance downloads by setting some environment variables on our \`modal.Image\`.

\`\`\`python
esmfold2_image = esmfold2_image.env(
    {
        "HF_HOME": str(models_dir),
        "HF_XET_HIGH_PERFORMANCE": "1",  # speed up downloads
    }
)

\`\`\`

## Running ESMFold2 on Modal

To run inference on Modal, we define an \`ESMFold2Inference\` class and wrap it with the \`@app.cls\` decorator.
The decorator takes some arguments that describe the infrastructure
our code needs to run: the Volume we created, the Image we defined, and of
course a GPU. We'll use an H100, but you can use any other [GPU supported by Modal](https://modal.com/docs/guide/gpu).

When we use the \`@app.cls\` decorator, we can define a method decorated with the [\`@modal.enter()\` lifecycle hook](https://modal.com/docs/guide/lifecycle-functions#modalenter).
This method will be run once when a new container starts.
The exeuction time of the \`@modal.enter()\` method is included in the container startup time, so it won't serve requests
until it's ready.

To enable remote execution, we decorate our \`fold\` method with \`@modal.method()\`. We'll demonstrate later how to call it using \`fold.remote()\`.

\`\`\`python
ESMFOLD2_REPO = "biohub/ESMFold2"
ESMFOLD2_REVISION = "6234905"  # pin for reproducibility


@app.cls(
    image=esmfold2_image,
    volumes={models_dir: esmfold2_volume},
    gpu="H100",
    timeout=20 * MINUTES,
)
class ESMFold2Inference:
    @modal.enter()
    def load_model(self):
        print("🧬 loading ESMFold2 onto the GPU")
        self.model = (
            ESMFold2Model.from_pretrained(ESMFOLD2_REPO, revision=ESMFOLD2_REVISION)
            .cuda()
            .eval()
        )

    @modal.method()
    def fold(
        self,
        sequence: Optional[str] = None,
        num_loops: int = 3,
        num_sampling_steps: int = 50,
        num_diffusion_samples: int = 1,
        seed: int = 0,
    ) -> tuple[str, float, float, float]:
        if sequence is None:
            # default to the M.HhaI methyltransferase / DNA / SAH complex (PDB 1MHT);
            # \`C36\` is the CCD code for 5-methylcytosine, \`SAH\` for the cofactor
            spi = StructurePredictionInput(
                sequences=[
                    ProteinInput(id="A", sequence=MHHAI_SEQUENCE),
                    DNAInput(
                        id="B",
                        sequence="GATAGCGCTATC",
                        modifications=[Modification(position=5, ccd="C36")],
                    ),
                    DNAInput(
                        id="C",
                        sequence="TGATAGCGCTATC",
                        modifications=[Modification(position=6, ccd="C36")],
                    ),
                    LigandInput(id="L", ccd=["SAH"]),
                ]
            )
        else:
            spi = StructurePredictionInput(
                sequences=[ProteinInput(id="A", sequence=sequence.strip())]
            )

        print(
            f"🧬 folding with num_loops={num_loops}, "
            f"num_sampling_steps={num_sampling_steps}, "
            f"num_diffusion_samples={num_diffusion_samples}"
        )
        result = ESMFold2InputBuilder().fold(
            self.model,
            spi,
            num_loops=num_loops,
            num_sampling_steps=num_sampling_steps,
            num_diffusion_samples=num_diffusion_samples,
            seed=seed,
        )

        return (
            result.complex.to_mmcif(),
            float(result.plddt.mean()),
            float(result.ptm),
            float(result.iptm),
        )


\`\`\`

## Fold a complex from the command line

To showcase the full breadth of ESMFold2 -- it can predict structures of
proteins, nucleic acids, ligands, and modified residues all at once -- we
fold a complex by default: the
[M.HhaI](https://www.rcsb.org/structure/1MHT) cytosine-5 DNA methyltransferase
from _Haemophilus haemolyticus_, bound to a methylated DNA duplex and the
[S-adenosyl-L-homocysteine](https://en.wikipedia.org/wiki/S-Adenosyl-L-homocysteine)
cofactor that remains after methyl transfer.

\`\`\`python
MHHAI_SEQUENCE = (
    "MIEIKDKQLTGLRFIDLFAGLGGFRLALESCGAECVYSNEWDKYAQEVYEMNFGEKPEGDITQVNEKTIPDH"
    "DILCAGFPCQAFSISGKQKGFEDSRGTLFFDIARIVREKKPKVVFMENVKNFASHDNGNTLEVVKNTMNELD"
    "YSFHAKVLNALDYGIPQKRERIYMICFRNDLNIQNFQFPKPFELNTFVKDLLLPDSEVEHLVIDRKDLVMTN"
    "QEIEQTTPKTVRLGIVGKGGQGERIYSTRGIAITLSAYGGGIFAKTGGYLVNGKTRKLHPRECARVMGYPDS"
    "YKVHPSTSQAYKQFGNSVVINVLQYIAYNIGSSLNFKPY"
)

\`\`\`

Fold the complex in the cloud by running the following command:

\`\`\`shell
modal run esmfold2.py
\`\`\`

This will save the predicted structure locally as a
[Crystallographic Information File](https://en.wikipedia.org/wiki/Crystallographic_Information_File),
which you can render with [Mol\\* Viewer](https://molstar.org/viewer).

![Image of folded complex in Molstar Viewer](https://modal-cdn.com/cdnbot/example-esmfold2-molviewerin7blk30_59122d5b.webp)

To fold a single protein chain instead, pass a sequence:

\`\`\`shell
modal run esmfold2.py --sequence "MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQA..."
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    sequence: Optional[str] = None,
    output_path: Optional[str] = None,
):
    print("🧬 running ESMFold2")
    esmfold2 = ESMFold2Inference()
    cif_text, plddt, ptm, iptm = esmfold2.fold.remote(sequence)

    print(f"🧬 pLDDT mean: {plddt:.3f}, pTM: {ptm:.3f}, ipTM: {iptm:.3f}")

    if output_path is None:
        output_path = Path("/tmp") / "esmfold2" / "prediction.cif"
    else:
        output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"🧬 writing predicted structure to {output_path}")
    output_path.write_text(cif_text)

\`\`\`
`,meta:{title:`Fold proteins and biomolecular complexes with ESMFold2`,description:`ESMFold2 is a state-of-the-art model for biomolecular complex structure prediction, developed by Biohub and released under an open license. Built on ESMC representations, it produces leading accuracy for protein-protein and antibody-antigen interactions at any given compute budget.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal.Image</code>s`,1),x=t(`<code>@modal.enter()</code> lifecycle hook`,1),S=t(`<!> <p><!> is a state-of-the-art model
for biomolecular complex structure prediction, developed by <!> and released
under an open license. Built on ESMC representations, it produces leading accuracy
for protein-protein and antibody-antigen interactions at any given compute budget.</p> <p>ESMFold2 is available in two configurations:</p> <ul><li><!>: the larger model for
maximum accuracy. It can be run either from a single sequence or with MSA
context, with MSAs improving performance on difficult complexes.</li> <li><!>: a smaller
model optimized for very fast single-sequence folding. It is well suited for
high-throughput folding, designed sequences, metagenomic proteins, and
targets with limited homologous sequence information.</li></ul> <p>In this example, we demonstrate how to run ESMFold2 on Modal’s flexible
serverless infrastructure. By default, we fold a protein-DNA-ligand complex
(the M.HhaI DNA methyltransferase bound to a methylated DNA duplex and its
SAH cofactor), which exercises the model’s full multimer capabilities.
You can also pass any single-chain protein sequence from the command line.</p> <p>This script is meant as a starting point that demonstrates how to
create a <code>modal.Image</code> with the correct dependencies, cache weights to a <code>modal.Volume</code>,
and save the output to a file for a single folding request.
To really leverage Modal’s serverless infrastructure, try scaling inference up across
hundreds or thousands of structures or invert the model to design binders
for a target protein.</p> <!> <!> <!> <p>Code executing on Modal runs inside containers built from <!> that include that
code’s dependencies.
For ESMFold2, we only need the <code>esm</code> library from Biohub which will install the necessary dependencies
including a custom fork of the <code>transformers</code> library.</p> <!> <p>We’ll use the <code>image.imports()</code> context manager to import libraries we’ll need in our inference code.
The context manager allows us to import libraries that might not be installed locally but are installed in our <code>modal.Image</code>.</p> <!> <!> <p>Rather than re-downloading the model weights on each cold start, we cache them on a <!>.
The first time you run inference, you’ll see that downloading the weights takes several minutes,
but subsequent runs will start up significantly faster.
For more on storing model weights on Modal, see <!>.</p> <!> <p>We also need to point the HF cache at the Volume, and we’ll enable high-performance downloads by setting some environment variables on our <code>modal.Image</code>.</p> <!> <!> <p>To run inference on Modal, we define an <code>ESMFold2Inference</code> class and wrap it with the <code>@app.cls</code> decorator.
The decorator takes some arguments that describe the infrastructure
our code needs to run: the Volume we created, the Image we defined, and of
course a GPU. We’ll use an H100, but you can use any other <!>.</p> <p>When we use the <code>@app.cls</code> decorator, we can define a method decorated with the <!>.
This method will be run once when a new container starts.
The exeuction time of the <code>@modal.enter()</code> method is included in the container startup time, so it won’t serve requests
until it’s ready.</p> <p>To enable remote execution, we decorate our <code>fold</code> method with <code>@modal.method()</code>. We’ll demonstrate later how to call it using <code>fold.remote()</code>.</p> <!> <!> <p>To showcase the full breadth of ESMFold2 — it can predict structures of
proteins, nucleic acids, ligands, and modified residues all at once — we
fold a complex by default: the <!> cytosine-5 DNA methyltransferase
from <em>Haemophilus haemolyticus</em>, bound to a methylated DNA duplex and the <!> cofactor that remains after methyl transfer.</p> <!> <p>Fold the complex in the cloud by running the following command:</p> <!> <p>This will save the predicted structure locally as a <!>,
which you can render with <!>.</p> <p><!></p> <p>To fold a single protein chain instead, pass a sequence:</p> <!> <!>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);d(m,{id:`fold-proteins-and-biomolecular-complexes-with-esmfold2`,children:(e,t)=>{l(),i(e,r(`Fold proteins and biomolecular complexes with ESMFold2`))},$$slots:{default:!0}});var g=c(m,2),_=e(g);h(_,{href:`https://biohub.ai/esm/protein/about`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ESMFold2`))},$$slots:{default:!0}}),h(c(_,2),{href:`https://biohub.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Biohub`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,4),y=e(v);h(e(y),{href:`https://huggingface.co/biohub/ESMFold2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ESMFold2`))},$$slots:{default:!0}}),l(),n(y);var C=c(y,2);h(e(C),{href:`https://huggingface.co/biohub/ESMFold2-Fast`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ESMFold2-Fast`))},$$slots:{default:!0}}),l(),n(C),n(v);var w=c(v,6);u(w,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var T=c(w,2);p(T,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0Ahere%20%3D%20Path(__file__).parent%20%20%23%20the%20directory%20of%20this%20file%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(name%3D%22example-esmfold2%22)%0A`,lang:`python`});var E=c(T,2);u(E,{id:`installing-esmfold2-python-dependencies-on-modal`,children:(e,t)=>{l(),i(e,r(`Installing ESMFold2 Python dependencies on Modal`))},$$slots:{default:!0}});var D=c(E,2);h(c(e(D)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{var n=b();l(),i(e,n)},$$slots:{default:!0}}),l(5),n(D);var O=c(D,2);p(O,{code:`ESM_REVISION%20%3D%20%2281b3646c9429ea8458918415ad6a46178cb59833%22%20%20%23%20pin%20upstream%20commit%20so%20builds%20are%20reproducible%0A%0Aesmfold2_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.13%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20f%22esm%20%40%20git%2Bhttps%3A%2F%2Fgithub.com%2FBiohub%2Fesm.git%40%7BESM_REVISION%7D%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var k=c(O,4);p(k,{code:`with%20esmfold2_image.imports()%3A%0A%20%20%20%20from%20esm.models.esmfold2%20import%20(%0A%20%20%20%20%20%20%20%20DNAInput%2C%0A%20%20%20%20%20%20%20%20ESMFold2InputBuilder%2C%0A%20%20%20%20%20%20%20%20LigandInput%2C%0A%20%20%20%20%20%20%20%20Modification%2C%0A%20%20%20%20%20%20%20%20ProteinInput%2C%0A%20%20%20%20%20%20%20%20StructurePredictionInput%2C%0A%20%20%20%20)%0A%20%20%20%20from%20transformers.models.esmfold2.modeling_esmfold2%20import%20ESMFold2Model%0A`,lang:`python`});var A=c(k,2);u(A,{id:`caching-esmfold2-model-weights-on-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Caching ESMFold2 model weights on Modal Volumes`))},$$slots:{default:!0}});var j=c(A,2),M=c(e(j));h(M,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),h(c(M,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(j);var N=c(j,2);p(N,{code:`esmfold2_volume%20%3D%20modal.Volume.from_name(%22esmfold2-models%22%2C%20create_if_missing%3DTrue)%0Amodels_dir%20%3D%20Path(%22%2Fmodels%22)%0A`,lang:`python`});var P=c(N,4);p(P,{code:`esmfold2_image%20%3D%20esmfold2_image.env(%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20str(models_dir)%2C%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20speed%20up%20downloads%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var F=c(P,2);u(F,{id:`running-esmfold2-on-modal`,children:(e,t)=>{l(),i(e,r(`Running ESMFold2 on Modal`))},$$slots:{default:!0}});var I=c(F,2);h(c(e(I),5),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU supported by Modal`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,2);h(c(e(L),3),{href:`https://modal.com/docs/guide/lifecycle-functions#modalenter`,rel:`nofollow`,children:(e,t)=>{var n=x();l(),i(e,n)},$$slots:{default:!0}}),l(3),n(L);var R=c(L,4);p(R,{code:`ESMFOLD2_REPO%20%3D%20%22biohub%2FESMFold2%22%0AESMFOLD2_REVISION%20%3D%20%226234905%22%20%20%23%20pin%20for%20reproducibility%0A%0A%0A%40app.cls(%0A%20%20%20%20image%3Desmfold2_image%2C%0A%20%20%20%20volumes%3D%7Bmodels_dir%3A%20esmfold2_volume%7D%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D20%20*%20MINUTES%2C%0A)%0Aclass%20ESMFold2Inference%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%A7%AC%20loading%20ESMFold2%20onto%20the%20GPU%22)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20ESMFold2Model.from_pretrained(ESMFOLD2_REPO%2C%20revision%3DESMFOLD2_REVISION)%0A%20%20%20%20%20%20%20%20%20%20%20%20.cuda()%0A%20%20%20%20%20%20%20%20%20%20%20%20.eval()%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20fold(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20num_loops%3A%20int%20%3D%203%2C%0A%20%20%20%20%20%20%20%20num_sampling_steps%3A%20int%20%3D%2050%2C%0A%20%20%20%20%20%20%20%20num_diffusion_samples%3A%20int%20%3D%201%2C%0A%20%20%20%20%20%20%20%20seed%3A%20int%20%3D%200%2C%0A%20%20%20%20)%20-%3E%20tuple%5Bstr%2C%20float%2C%20float%2C%20float%5D%3A%0A%20%20%20%20%20%20%20%20if%20sequence%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20default%20to%20the%20M.HhaI%20methyltransferase%20%2F%20DNA%20%2F%20SAH%20complex%20(PDB%201MHT)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20%60C36%60%20is%20the%20CCD%20code%20for%205-methylcytosine%2C%20%60SAH%60%20for%20the%20cofactor%0A%20%20%20%20%20%20%20%20%20%20%20%20spi%20%3D%20StructurePredictionInput(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sequences%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ProteinInput(id%3D%22A%22%2C%20sequence%3DMHHAI_SEQUENCE)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20DNAInput(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3D%22B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sequence%3D%22GATAGCGCTATC%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modifications%3D%5BModification(position%3D5%2C%20ccd%3D%22C36%22)%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20DNAInput(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3D%22C%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sequence%3D%22TGATAGCGCTATC%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modifications%3D%5BModification(position%3D6%2C%20ccd%3D%22C36%22)%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LigandInput(id%3D%22L%22%2C%20ccd%3D%5B%22SAH%22%5D)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20spi%20%3D%20StructurePredictionInput(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sequences%3D%5BProteinInput(id%3D%22A%22%2C%20sequence%3Dsequence.strip())%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%F0%9F%A7%AC%20folding%20with%20num_loops%3D%7Bnum_loops%7D%2C%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22num_sampling_steps%3D%7Bnum_sampling_steps%7D%2C%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22num_diffusion_samples%3D%7Bnum_diffusion_samples%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20result%20%3D%20ESMFold2InputBuilder().fold(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.model%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20spi%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_loops%3Dnum_loops%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_sampling_steps%3Dnum_sampling_steps%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_diffusion_samples%3Dnum_diffusion_samples%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20result.complex.to_mmcif()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20float(result.plddt.mean())%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20float(result.ptm)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20float(result.iptm)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`fold-a-complex-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Fold a complex from the command line`))},$$slots:{default:!0}});var B=c(z,2),V=c(e(B));h(V,{href:`https://www.rcsb.org/structure/1MHT`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`M.HhaI`))},$$slots:{default:!0}}),h(c(V,4),{href:`https://en.wikipedia.org/wiki/S-Adenosyl-L-homocysteine`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`S-adenosyl-L-homocysteine`))},$$slots:{default:!0}}),l(),n(B);var H=c(B,2);p(H,{code:`MHHAI_SEQUENCE%20%3D%20(%0A%20%20%20%20%22MIEIKDKQLTGLRFIDLFAGLGGFRLALESCGAECVYSNEWDKYAQEVYEMNFGEKPEGDITQVNEKTIPDH%22%0A%20%20%20%20%22DILCAGFPCQAFSISGKQKGFEDSRGTLFFDIARIVREKKPKVVFMENVKNFASHDNGNTLEVVKNTMNELD%22%0A%20%20%20%20%22YSFHAKVLNALDYGIPQKRERIYMICFRNDLNIQNFQFPKPFELNTFVKDLLLPDSEVEHLVIDRKDLVMTN%22%0A%20%20%20%20%22QEIEQTTPKTVRLGIVGKGGQGERIYSTRGIAITLSAYGGGIFAKTGGYLVNGKTRKLHPRECARVMGYPDS%22%0A%20%20%20%20%22YKVHPSTSQAYKQFGNSVVINVLQYIAYNIGSSLNFKPY%22%0A)%0A`,lang:`python`});var U=c(H,4);p(U,{code:`modal%20run%20esmfold2.py`,lang:`shell`});var W=c(U,2),G=c(e(W));h(G,{href:`https://en.wikipedia.org/wiki/Crystallographic_Information_File`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Crystallographic Information File`))},$$slots:{default:!0}}),h(c(G,2),{href:`https://molstar.org/viewer`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mol* Viewer`))},$$slots:{default:!0}}),l(),n(W);var K=c(W,2);f(e(K),{src:`https://modal-cdn.com/cdnbot/example-esmfold2-molviewerin7blk30_59122d5b.webp`,alt:`Image of folded complex in Molstar Viewer`}),n(K);var q=c(K,4);p(q,{code:`modal%20run%20esmfold2.py%20--sequence%20%22MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQA...%22`,lang:`shell`}),p(c(q,2),{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20output_path%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20print(%22%F0%9F%A7%AC%20running%20ESMFold2%22)%0A%20%20%20%20esmfold2%20%3D%20ESMFold2Inference()%0A%20%20%20%20cif_text%2C%20plddt%2C%20ptm%2C%20iptm%20%3D%20esmfold2.fold.remote(sequence)%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20pLDDT%20mean%3A%20%7Bplddt%3A.3f%7D%2C%20pTM%3A%20%7Bptm%3A.3f%7D%2C%20ipTM%3A%20%7Biptm%3A.3f%7D%22)%0A%0A%20%20%20%20if%20output_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22esmfold2%22%20%2F%20%22prediction.cif%22%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20Path(output_path)%0A%20%20%20%20output_path.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20writing%20predicted%20structure%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_text(cif_text)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=CsdqU8ER2.js.map
