(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e6eb8584-126f-47f8-880a-e2a701c883f1`,e._sentryDebugIdIdentifier=`sentry-dbid-e6eb8584-126f-47f8-880a-e2a701c883f1`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Design protein binders at scale with ESMFold2 and ESMC`,id:`design-protein-binders-at-scale-with-esmfold2-and-esmc`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Defining our Modal Image`,id:`defining-our-modal-image`},{depth:2,value:`Caching weights and persisting results on Modal Volumes`,id:`caching-weights-and-persisting-results-on-modal-volumes`},{depth:2,value:`Designing a binder on Modal`,id:`designing-a-binder-on-modal`},{depth:2,value:`Fanning out a sweep with selection`,id:`fanning-out-a-sweep-with-selection`},{depth:2,value:`From the command line`,id:`from-the-command-line`}]}],rawContent:`# Design protein binders at scale with ESMFold2 and ESMC

Protein folding was a landmark breakthrough in computational biology.
But for many applications, we don't just want to predict the structures of existing proteins —
we want to design new proteins that can modulate biology.

One of the most important ways to do that is through binding.
Protein-protein interactions drive much of biological function,
and the ability to design molecules that bind specific targets
opens the door to new research tools and therapeutics.
Recent AI approaches have tackled binder design by inverting
structure prediction models via an iterative optimization process:
1. Fold a candidate binder together with the target protein.
2. Score the resulting structure based on how well the binder folds and binds.
3. Take a step in sequence space that improves the score.
4. Repeat.

In this example, we'll demonstrate how implement this process on Modal
using [ESMFold2 and ESMC](https://biohub.ai/esm/protein/about), state-of-the-art models
developed at [Biohub](https://biohub.ai/) that can predict the stucture of biomolecular complexes.
Check out their [technical report](https://modal-cdn.com/esmfold2_tech_report.pdf)
to see how the models were developed and used to design and experimentally validate binders against therapeutically relevant targets.

We'll start by building a Modal Function that designs a single binder; then with only
a few more lines of code, we'll write an orchestrator function
that executes a large-scale search powered by Modal's autoscaling infrastructure and global GPU capacity.

## Setup

\`\`\`python
from pathlib import Path
from typing import Optional

import modal

MINUTES = 60  # seconds
HOURS = 60 * MINUTES

app = modal.App(
    name="example-esmfold2-binder-design",
)

\`\`\`

## Defining our Modal Image

We'll use \`Image.micromamba\` as our base image because a few of the packages we need
are only available via Conda. We'll also install the [\`esm\`](https://github.com/Biohub/esm)
library from CZ Biohub (which pulls in a custom fork of \`transformers\`) and a few other helpful libraries
for working with protein sequences.

We set \`CUBLAS_WORKSPACE_CONFIG\` which allows us to ensure reproducibility by calling
\`torch.use_deterministic_algorithms(True)\` at the top of our remote code.

\`\`\`python
ESM_REVISION = (
    "f652b471d29da828b31e9b7a9cf7d0a7803240f5"  # see https://github.com/Biohub/esm
)

image = (
    modal.Image.micromamba(python_version="3.12")
    .run_commands("apt update && apt install -y git build-essential")
    .micromamba_install(
        "anarci=2024.05.21-0",
        channels=["conda-forge", "bioconda"],
    )
    .uv_pip_install(
        f"esm @ git+https://github.com/Biohub/esm.git@{ESM_REVISION}",
        "abnumber==0.4.4",
        "pyarrow==18.1.0",
    )
    .env(
        {
            "HF_HOME": "/models",
            "HF_XET_HIGH_PERFORMANCE": "1",  # speed up Hugging Face downloads
            "XFORMERS_IGNORE_FLASH_VERSION_CHECK": "1",
            # required for torch.use_deterministic_algorithms(True)
            "CUBLAS_WORKSPACE_CONFIG": ":4096:8",
        }
    )
)

\`\`\`

## Caching weights and persisting results on Modal Volumes

ESMFold2 builds on the 6B-parameter ESMC encoder; together with the four
critic models used for final scoring, the model weights come in around ~50 GB.
We cache them on a [Modal Volume](https://modal.com/docs/guide/volumes)
which delivers much better performance at cold-start time than re-downloading
from Hugging Face each time.

\`\`\`python
models_volume = modal.Volume.from_name("esmfold2-models", create_if_missing=True)
models_dir = Path("/models")

\`\`\`

A second Volume will store our results.

\`\`\`python
results_volume = modal.Volume.from_name(
    "esmfold2-binder-design-results", create_if_missing=True
)
results_dir = Path("/results")


\`\`\`

## Designing a binder on Modal

To run binder design on Modal, we define a \`BinderDesignService\` class and
wrap it with the \`@app.cls\` decorator. The decorator takes arguments that
describe the infrastructure our code needs: the Image and both Volumes we
defined, plus an H100 GPU which has enough memory for the 6B-parameter ESMC encoder and the
four ESMFold2 "hero" critic models.

Inside the class, the [\`@modal.enter()\` lifecycle hook](https://modal.com/docs/guide/lifecycle-functions#modalenter)
downloads and initializes those models once per container start, so subsequent
\`design\` calls on the same container reuse the loaded weights.

We decorate our \`design\` method with \`@modal.method()\` to enable remote
execution. We'll see it called both via \`.remote()\` (single design) and via
\`.spawn()\` + [\`modal.FunctionCall.gather\`](https://modal.com/docs/reference/modal.FunctionCall)
(parallel sweep) further below. The class itself is a thin wrapper around
[\`ESMFold2Designer\`](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/models.py)
from the helper package, which handles the actual model loading and the
gradient-guided optimization loop (\`design_binder\` in
[\`binder_design.design\`](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/design.py)).

\`\`\`python
@app.cls(
    image=image,
    volumes={models_dir: models_volume},
    gpu="H100",
    timeout=1 * HOURS,
)
class BinderDesignService:
    """Modal entry point for ESMFold2-driven binder design.

    Set \`\`use_scaling_critics=True\`\` to also load the 15-checkpoint
    scaling-experiment ensemble (distogram binding confidence only).
    """

    use_scaling_critics: bool = modal.parameter(default=False)

    @modal.enter()
    def load(self):
        from .binder_design import ESMFold2Designer

        self._designer = ESMFold2Designer()
        self._designer.load(self.use_scaling_critics)

    @modal.method()
    def design(
        self,
        target_name: Optional[str] = None,
        target_sequence: Optional[str] = None,
        binder_name: Optional[str] = None,
        binder_sequence: Optional[str] = None,
        is_antibody: Optional[bool] = None,
        seed: int = 0,
        batch_size: int = 1,
    ):
        return self._designer.design(
            target_name=target_name,
            target_sequence=target_sequence,
            binder_name=binder_name,
            binder_sequence=binder_sequence,
            is_antibody=is_antibody,
            seed=seed,
            batch_size=batch_size,
        )


\`\`\`

## Fanning out a sweep with selection

A single design run gives you one candidate per batch slot. To recover the
kind of hit rates reported in the paper, you want many seeds, several binder
templates, and several targets, then a selection pass that ranks designs by
a combined ipTM / distogram-ipTM-proxy score.

We orchestrate from inside a Modal Function so you don't have to worry about
keeping a long-running process alive locally or installing any local dependencies.

\`\`\`python
@app.function(
    image=image,
    volumes={results_dir: results_volume},
    gpu="H100",
    timeout=2 * HOURS,
)
def run_sweep(
    line_sweeps: dict[str, list],
    use_scaling_critics: bool = False,
    save_filename: str = "selection.parquet",
) -> bytes:
    """Fan a grid sweep across GPUs, gather results, select top designs, ave results + return parquet."""
    import io

    from .binder_design.sweep import expand_sweep, select_designs

    designer = BinderDesignService(use_scaling_critics=use_scaling_critics)
    configs = expand_sweep(line_sweeps)

    print(f"🧬 spawning {len(configs)} design jobs")
    calls = [designer.design.spawn(**cfg) for cfg in configs]
    raw_results = modal.FunctionCall.gather(*calls)

    df_select = select_designs(configs, raw_results)

    buf = io.BytesIO()
    df_select.to_parquet(buf, index=False)
    parquet_bytes = buf.getvalue()

    save_path = results_dir / save_filename
    save_path.write_bytes(parquet_bytes)
    results_volume.commit()
    print(f"🧬 saved {len(df_select)} selected designs to volume:{save_path}")

    return parquet_bytes


\`\`\`

## From the command line

\`main\` runs a single design. Override the
\`target_name\` / \`binder_name\` to try one of the
[bundled targets](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/prompts.py)
(\`cd45\`, \`ctla4\`, \`egfr\`, \`pd-l1\`, \`pdgfr\`) and binder templates
(\`minibinder\`, \`trastuzumab_framework_vhvl\`, \`atezolizumab_framework_vhvl\`,
\`ocankitug_framework_vhvl\`), or pass an arbitrary \`target_sequence\` /
\`binder_sequence\` directly.

\`\`\`shell
modal run -m 06_gpu_and_ml.binder-design.esmfold2_binder_design::main \\
    --target-name pd-l1 --binder-name minibinder
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    target_name: Optional[str] = "pd-l1",
    target_sequence: Optional[str] = None,
    binder_name: Optional[str] = "minibinder",
    binder_sequence: Optional[str] = None,
    is_antibody: Optional[bool] = None,
    use_scaling_critics: bool = False,
    seed: int = 0,
    batch_size: int = 1,
):
    designer = BinderDesignService(use_scaling_critics=use_scaling_critics)
    seq, trajectory, results = designer.design.remote(
        target_name=target_name,
        target_sequence=target_sequence,
        binder_name=binder_name,
        binder_sequence=binder_sequence,
        is_antibody=is_antibody,
        seed=seed,
        batch_size=batch_size,
    )

    avg_final_loss = sum(r["final_loss"] for r in results) / len(results)
    print(f"🧬 designed sequence: {seq}")
    print(f"🧬 trajectory length: {len(trajectory)} steps")
    print(f"🧬 average final loss: {avg_final_loss:.4f}")


\`\`\`

\`sweep\` runs a grid sweep across every \`(target, binder, seed)\` combination
of the targets and binders you pass in, scaling design horizontally with Modal's
[asynchronous job processing](https://modal.com/docs/guide/job-queue).
The selection pass runs server-side and the resulting parquet is
written to both the \`esmfold2-binder-design-results\` Volume and to a local
file for inspection.

\`target_names\` and \`binder_names\` are passed as comma-separated strings.
The defaults sweep one target across two binder modalities -- a \`minibinder\`
and the \`trastuzumab_framework_vhvl\` antibody template -- so a single
command fans out across both at once:

\`\`\`shell
modal run -m 06_gpu_and_ml.binder-design.esmfold2_binder_design::sweep \\
    --target-names pd-l1,ctla4 \\
    --binder-names minibinder,trastuzumab_framework_vhvl \\
    --n-seeds 8
\`\`\`

\`\`\`python
@app.local_entrypoint()
def sweep(
    target_names: str = "pd-l1",
    binder_names: str = "minibinder,trastuzumab_framework_vhvl",
    use_scaling_critics: bool = False,
    n_seeds: int = 8,
    output_path: Optional[str] = None,
):
    target_name_list = [
        name.strip() for name in target_names.split(",") if name.strip()
    ]
    binder_name_list = [
        name.strip() for name in binder_names.split(",") if name.strip()
    ]

    line_sweeps = {
        "target_name": target_name_list,
        "target_sequence": [None],
        "binder_name": binder_name_list,
        "binder_sequence": [None],
        "seed": list(range(n_seeds)),
        "batch_size": [1],
    }

    print(
        f"🧬 launching sweep: targets={target_name_list}, binders={binder_name_list}, "
        f"n_seeds={n_seeds}, use_scaling_critics={use_scaling_critics}"
    )
    parquet_bytes = run_sweep.remote(
        line_sweeps, use_scaling_critics=use_scaling_critics
    )

    if output_path is None:
        output_path = Path("/tmp") / "esmfold2_binder_design" / "selection.parquet"
    else:
        output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(parquet_bytes)
    print(f"🧬 wrote selection parquet to {output_path}")

\`\`\`
`,meta:{title:`Design protein binders at scale with ESMFold2 and ESMC`,description:`Protein folding was a landmark breakthrough in computational biology. But for many applications, we don’t just want to predict the structures of existing proteins — we want to design new proteins that can modulate biology.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>esm</code>`),b=t(`<code>@modal.enter()</code> lifecycle hook`,1),x=t(`<code>modal.FunctionCall.gather</code>`),S=t(`<code>ESMFold2Designer</code>`),C=t(`<code>binder_design.design</code>`),w=t(`<!> <p>Protein folding was a landmark breakthrough in computational biology.
But for many applications, we don’t just want to predict the structures of existing proteins —
we want to design new proteins that can modulate biology.</p> <p>One of the most important ways to do that is through binding.
Protein-protein interactions drive much of biological function,
and the ability to design molecules that bind specific targets
opens the door to new research tools and therapeutics.
Recent AI approaches have tackled binder design by inverting
structure prediction models via an iterative optimization process:</p> <ol><li>Fold a candidate binder together with the target protein.</li> <li>Score the resulting structure based on how well the binder folds and binds.</li> <li>Take a step in sequence space that improves the score.</li> <li>Repeat.</li></ol> <p>In this example, we’ll demonstrate how implement this process on Modal
using <!>, state-of-the-art models
developed at <!> that can predict the stucture of biomolecular complexes.
Check out their <!> to see how the models were developed and used to design and experimentally validate binders against therapeutically relevant targets.</p> <p>We’ll start by building a Modal Function that designs a single binder; then with only
a few more lines of code, we’ll write an orchestrator function
that executes a large-scale search powered by Modal’s autoscaling infrastructure and global GPU capacity.</p> <!> <!> <!> <p>We’ll use <code>Image.micromamba</code> as our base image because a few of the packages we need
are only available via Conda. We’ll also install the <!> library from CZ Biohub (which pulls in a custom fork of <code>transformers</code>) and a few other helpful libraries
for working with protein sequences.</p> <p>We set <code>CUBLAS_WORKSPACE_CONFIG</code> which allows us to ensure reproducibility by calling <code>torch.use_deterministic_algorithms(True)</code> at the top of our remote code.</p> <!> <!> <p>ESMFold2 builds on the 6B-parameter ESMC encoder; together with the four
critic models used for final scoring, the model weights come in around ~50 GB.
We cache them on a <!> which delivers much better performance at cold-start time than re-downloading
from Hugging Face each time.</p> <!> <p>A second Volume will store our results.</p> <!> <!> <p>To run binder design on Modal, we define a <code>BinderDesignService</code> class and
wrap it with the <code>@app.cls</code> decorator. The decorator takes arguments that
describe the infrastructure our code needs: the Image and both Volumes we
defined, plus an H100 GPU which has enough memory for the 6B-parameter ESMC encoder and the
four ESMFold2 “hero” critic models.</p> <p>Inside the class, the <!> downloads and initializes those models once per container start, so subsequent <code>design</code> calls on the same container reuse the loaded weights.</p> <p>We decorate our <code>design</code> method with <code>@modal.method()</code> to enable remote
execution. We’ll see it called both via <code>.remote()</code> (single design) and via <code>.spawn()</code> + <!> (parallel sweep) further below. The class itself is a thin wrapper around <!> from the helper package, which handles the actual model loading and the
gradient-guided optimization loop (<code>design_binder</code> in <!>).</p> <!> <!> <p>A single design run gives you one candidate per batch slot. To recover the
kind of hit rates reported in the paper, you want many seeds, several binder
templates, and several targets, then a selection pass that ranks designs by
a combined ipTM / distogram-ipTM-proxy score.</p> <p>We orchestrate from inside a Modal Function so you don’t have to worry about
keeping a long-running process alive locally or installing any local dependencies.</p> <!> <!> <p><code>main</code> runs a single design. Override the <code>target_name</code> / <code>binder_name</code> to try one of the <!> (<code>cd45</code>, <code>ctla4</code>, <code>egfr</code>, <code>pd-l1</code>, <code>pdgfr</code>) and binder templates
(<code>minibinder</code>, <code>trastuzumab_framework_vhvl</code>, <code>atezolizumab_framework_vhvl</code>, <code>ocankitug_framework_vhvl</code>), or pass an arbitrary <code>target_sequence</code> / <code>binder_sequence</code> directly.</p> <!> <!> <p><code>sweep</code> runs a grid sweep across every <code>(target, binder, seed)</code> combination
of the targets and binders you pass in, scaling design horizontally with Modal’s <!>.
The selection pass runs server-side and the resulting parquet is
written to both the <code>esmfold2-binder-design-results</code> Volume and to a local
file for inspection.</p> <p><code>target_names</code> and <code>binder_names</code> are passed as comma-separated strings.
The defaults sweep one target across two binder modalities — a <code>minibinder</code> and the <code>trastuzumab_framework_vhvl</code> antibody template — so a single
command fans out across both at once:</p> <!> <!>`,1);function T(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=w(),p=s(o);d(p,{id:`design-protein-binders-at-scale-with-esmfold2-and-esmc`,children:(e,t)=>{l(),i(e,r(`Design protein binders at scale with ESMFold2 and ESMC`))},$$slots:{default:!0}});var h=c(p,8),g=c(e(h));m(g,{href:`https://biohub.ai/esm/protein/about`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ESMFold2 and ESMC`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://biohub.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Biohub`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal-cdn.com/esmfold2_tech_report.pdf`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`technical report`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,4);u(v,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var T=c(v,2);f(T,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AHOURS%20%3D%2060%20*%20MINUTES%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20name%3D%22example-esmfold2-binder-design%22%2C%0A)%0A`,lang:`python`});var E=c(T,2);u(E,{id:`defining-our-modal-image`,children:(e,t)=>{l(),i(e,r(`Defining our Modal Image`))},$$slots:{default:!0}});var D=c(E,2);m(c(e(D),3),{href:`https://github.com/Biohub/esm`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(3),n(D);var O=c(D,4);f(O,{code:`ESM_REVISION%20%3D%20(%0A%20%20%20%20%22f652b471d29da828b31e9b7a9cf7d0a7803240f5%22%20%20%23%20see%20https%3A%2F%2Fgithub.com%2FBiohub%2Fesm%0A)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.micromamba(python_version%3D%223.12%22)%0A%20%20%20%20.run_commands(%22apt%20update%20%26%26%20apt%20install%20-y%20git%20build-essential%22)%0A%20%20%20%20.micromamba_install(%0A%20%20%20%20%20%20%20%20%22anarci%3D2024.05.21-0%22%2C%0A%20%20%20%20%20%20%20%20channels%3D%5B%22conda-forge%22%2C%20%22bioconda%22%5D%2C%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20f%22esm%20%40%20git%2Bhttps%3A%2F%2Fgithub.com%2FBiohub%2Fesm.git%40%7BESM_REVISION%7D%22%2C%0A%20%20%20%20%20%20%20%20%22abnumber%3D%3D0.4.4%22%2C%0A%20%20%20%20%20%20%20%20%22pyarrow%3D%3D18.1.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20%22%2Fmodels%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20speed%20up%20Hugging%20Face%20downloads%0A%20%20%20%20%20%20%20%20%20%20%20%20%22XFORMERS_IGNORE_FLASH_VERSION_CHECK%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20required%20for%20torch.use_deterministic_algorithms(True)%0A%20%20%20%20%20%20%20%20%20%20%20%20%22CUBLAS_WORKSPACE_CONFIG%22%3A%20%22%3A4096%3A8%22%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var k=c(O,2);u(k,{id:`caching-weights-and-persisting-results-on-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Caching weights and persisting results on Modal Volumes`))},$$slots:{default:!0}});var A=c(k,2);m(c(e(A)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);f(j,{code:`models_volume%20%3D%20modal.Volume.from_name(%22esmfold2-models%22%2C%20create_if_missing%3DTrue)%0Amodels_dir%20%3D%20Path(%22%2Fmodels%22)%0A`,lang:`python`});var M=c(j,4);f(M,{code:`results_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22esmfold2-binder-design-results%22%2C%20create_if_missing%3DTrue%0A)%0Aresults_dir%20%3D%20Path(%22%2Fresults%22)%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`designing-a-binder-on-modal`,children:(e,t)=>{l(),i(e,r(`Designing a binder on Modal`))},$$slots:{default:!0}});var P=c(N,4);m(c(e(P)),{href:`https://modal.com/docs/guide/lifecycle-functions#modalenter`,rel:`nofollow`,children:(e,t)=>{var n=b();l(),i(e,n)},$$slots:{default:!0}}),l(3),n(P);var F=c(P,2),I=c(e(F),9);m(I,{href:`https://modal.com/docs/reference/modal.FunctionCall`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var L=c(I,2);m(L,{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/models.py`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),m(c(L,4),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/design.py`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(F);var R=c(F,2);f(R,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7Bmodels_dir%3A%20models_volume%7D%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D1%20*%20HOURS%2C%0A)%0Aclass%20BinderDesignService%3A%0A%20%20%20%20%22%22%22Modal%20entry%20point%20for%20ESMFold2-driven%20binder%20design.%0A%0A%20%20%20%20Set%20%60%60use_scaling_critics%3DTrue%60%60%20to%20also%20load%20the%2015-checkpoint%0A%20%20%20%20scaling-experiment%20ensemble%20(distogram%20binding%20confidence%20only).%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20use_scaling_critics%3A%20bool%20%3D%20modal.parameter(default%3DFalse)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20from%20.binder_design%20import%20ESMFold2Designer%0A%0A%20%20%20%20%20%20%20%20self._designer%20%3D%20ESMFold2Designer()%0A%20%20%20%20%20%20%20%20self._designer.load(self.use_scaling_critics)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20design(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20target_name%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20target_sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20binder_name%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20binder_sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20is_antibody%3A%20Optional%5Bbool%5D%20%3D%20None%2C%0A%20%20%20%20%20%20%20%20seed%3A%20int%20%3D%200%2C%0A%20%20%20%20%20%20%20%20batch_size%3A%20int%20%3D%201%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20return%20self._designer.design(%0A%20%20%20%20%20%20%20%20%20%20%20%20target_name%3Dtarget_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20target_sequence%3Dtarget_sequence%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20binder_name%3Dbinder_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20binder_sequence%3Dbinder_sequence%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20is_antibody%3Dis_antibody%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var z=c(R,2);u(z,{id:`fanning-out-a-sweep-with-selection`,children:(e,t)=>{l(),i(e,r(`Fanning out a sweep with selection`))},$$slots:{default:!0}});var B=c(z,6);f(B,{code:`%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7Bresults_dir%3A%20results_volume%7D%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D2%20*%20HOURS%2C%0A)%0Adef%20run_sweep(%0A%20%20%20%20line_sweeps%3A%20dict%5Bstr%2C%20list%5D%2C%0A%20%20%20%20use_scaling_critics%3A%20bool%20%3D%20False%2C%0A%20%20%20%20save_filename%3A%20str%20%3D%20%22selection.parquet%22%2C%0A)%20-%3E%20bytes%3A%0A%20%20%20%20%22%22%22Fan%20a%20grid%20sweep%20across%20GPUs%2C%20gather%20results%2C%20select%20top%20designs%2C%20ave%20results%20%2B%20return%20parquet.%22%22%22%0A%20%20%20%20import%20io%0A%0A%20%20%20%20from%20.binder_design.sweep%20import%20expand_sweep%2C%20select_designs%0A%0A%20%20%20%20designer%20%3D%20BinderDesignService(use_scaling_critics%3Duse_scaling_critics)%0A%20%20%20%20configs%20%3D%20expand_sweep(line_sweeps)%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20spawning%20%7Blen(configs)%7D%20design%20jobs%22)%0A%20%20%20%20calls%20%3D%20%5Bdesigner.design.spawn(**cfg)%20for%20cfg%20in%20configs%5D%0A%20%20%20%20raw_results%20%3D%20modal.FunctionCall.gather(*calls)%0A%0A%20%20%20%20df_select%20%3D%20select_designs(configs%2C%20raw_results)%0A%0A%20%20%20%20buf%20%3D%20io.BytesIO()%0A%20%20%20%20df_select.to_parquet(buf%2C%20index%3DFalse)%0A%20%20%20%20parquet_bytes%20%3D%20buf.getvalue()%0A%0A%20%20%20%20save_path%20%3D%20results_dir%20%2F%20save_filename%0A%20%20%20%20save_path.write_bytes(parquet_bytes)%0A%20%20%20%20results_volume.commit()%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20saved%20%7Blen(df_select)%7D%20selected%20designs%20to%20volume%3A%7Bsave_path%7D%22)%0A%0A%20%20%20%20return%20parquet_bytes%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`from-the-command-line`,children:(e,t)=>{l(),i(e,r(`From the command line`))},$$slots:{default:!0}});var H=c(V,2);m(c(e(H),6),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/binder-design/binder_design/prompts.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`bundled targets`))},$$slots:{default:!0}}),l(23),n(H);var U=c(H,2);f(U,{code:`modal%20run%20-m%2006_gpu_and_ml.binder-design.esmfold2_binder_design%3A%3Amain%20%5C%0A%20%20%20%20--target-name%20pd-l1%20--binder-name%20minibinder`,lang:`shell`});var W=c(U,2);f(W,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20target_name%3A%20Optional%5Bstr%5D%20%3D%20%22pd-l1%22%2C%0A%20%20%20%20target_sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20binder_name%3A%20Optional%5Bstr%5D%20%3D%20%22minibinder%22%2C%0A%20%20%20%20binder_sequence%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20is_antibody%3A%20Optional%5Bbool%5D%20%3D%20None%2C%0A%20%20%20%20use_scaling_critics%3A%20bool%20%3D%20False%2C%0A%20%20%20%20seed%3A%20int%20%3D%200%2C%0A%20%20%20%20batch_size%3A%20int%20%3D%201%2C%0A)%3A%0A%20%20%20%20designer%20%3D%20BinderDesignService(use_scaling_critics%3Duse_scaling_critics)%0A%20%20%20%20seq%2C%20trajectory%2C%20results%20%3D%20designer.design.remote(%0A%20%20%20%20%20%20%20%20target_name%3Dtarget_name%2C%0A%20%20%20%20%20%20%20%20target_sequence%3Dtarget_sequence%2C%0A%20%20%20%20%20%20%20%20binder_name%3Dbinder_name%2C%0A%20%20%20%20%20%20%20%20binder_sequence%3Dbinder_sequence%2C%0A%20%20%20%20%20%20%20%20is_antibody%3Dis_antibody%2C%0A%20%20%20%20%20%20%20%20seed%3Dseed%2C%0A%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20)%0A%0A%20%20%20%20avg_final_loss%20%3D%20sum(r%5B%22final_loss%22%5D%20for%20r%20in%20results)%20%2F%20len(results)%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20designed%20sequence%3A%20%7Bseq%7D%22)%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20trajectory%20length%3A%20%7Blen(trajectory)%7D%20steps%22)%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20average%20final%20loss%3A%20%7Bavg_final_loss%3A.4f%7D%22)%0A%0A`,lang:`python`});var G=c(W,2);m(c(e(G),4),{href:`https://modal.com/docs/guide/job-queue`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`asynchronous job processing`))},$$slots:{default:!0}}),l(3),n(G);var K=c(G,4);f(K,{code:`modal%20run%20-m%2006_gpu_and_ml.binder-design.esmfold2_binder_design%3A%3Asweep%20%5C%0A%20%20%20%20--target-names%20pd-l1%2Cctla4%20%5C%0A%20%20%20%20--binder-names%20minibinder%2Ctrastuzumab_framework_vhvl%20%5C%0A%20%20%20%20--n-seeds%208`,lang:`shell`}),f(c(K,2),{code:`%40app.local_entrypoint()%0Adef%20sweep(%0A%20%20%20%20target_names%3A%20str%20%3D%20%22pd-l1%22%2C%0A%20%20%20%20binder_names%3A%20str%20%3D%20%22minibinder%2Ctrastuzumab_framework_vhvl%22%2C%0A%20%20%20%20use_scaling_critics%3A%20bool%20%3D%20False%2C%0A%20%20%20%20n_seeds%3A%20int%20%3D%208%2C%0A%20%20%20%20output_path%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20target_name_list%20%3D%20%5B%0A%20%20%20%20%20%20%20%20name.strip()%20for%20name%20in%20target_names.split(%22%2C%22)%20if%20name.strip()%0A%20%20%20%20%5D%0A%20%20%20%20binder_name_list%20%3D%20%5B%0A%20%20%20%20%20%20%20%20name.strip()%20for%20name%20in%20binder_names.split(%22%2C%22)%20if%20name.strip()%0A%20%20%20%20%5D%0A%0A%20%20%20%20line_sweeps%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22target_name%22%3A%20target_name_list%2C%0A%20%20%20%20%20%20%20%20%22target_sequence%22%3A%20%5BNone%5D%2C%0A%20%20%20%20%20%20%20%20%22binder_name%22%3A%20binder_name_list%2C%0A%20%20%20%20%20%20%20%20%22binder_sequence%22%3A%20%5BNone%5D%2C%0A%20%20%20%20%20%20%20%20%22seed%22%3A%20list(range(n_seeds))%2C%0A%20%20%20%20%20%20%20%20%22batch_size%22%3A%20%5B1%5D%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%F0%9F%A7%AC%20launching%20sweep%3A%20targets%3D%7Btarget_name_list%7D%2C%20binders%3D%7Bbinder_name_list%7D%2C%20%22%0A%20%20%20%20%20%20%20%20f%22n_seeds%3D%7Bn_seeds%7D%2C%20use_scaling_critics%3D%7Buse_scaling_critics%7D%22%0A%20%20%20%20)%0A%20%20%20%20parquet_bytes%20%3D%20run_sweep.remote(%0A%20%20%20%20%20%20%20%20line_sweeps%2C%20use_scaling_critics%3Duse_scaling_critics%0A%20%20%20%20)%0A%0A%20%20%20%20if%20output_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22esmfold2_binder_design%22%20%2F%20%22selection.parquet%22%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20output_path%20%3D%20Path(output_path)%0A%20%20%20%20output_path.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20output_path.write_bytes(parquet_bytes)%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20wrote%20selection%20parquet%20to%20%7Boutput_path%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{T as default,h as metadata};
//# sourceMappingURL=B6jMH1iK2.js.map
