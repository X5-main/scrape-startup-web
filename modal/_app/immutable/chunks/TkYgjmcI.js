(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e3302639-b49d-4841-921f-03ef60144140`,e._sentryDebugIdIdentifier=`sentry-dbid-e3302639-b49d-4841-921f-03ef60144140`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Fold proteins with Chai-1`,id:`fold-proteins-with-chai-1`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Fold a protein from the command line`,id:`fold-a-protein-from-the-command-line`},{depth:2,value:`Installing Chai-1 Python dependencies on Modal`,id:`installing-chai-1-python-dependencies-on-modal`},{depth:2,value:`Storing Chai-1 model weights on Modal with Volumes`,id:`storing-chai-1-model-weights-on-modal-with-volumes`},{depth:2,value:`Storing Chai-1 outputs on Modal Volumes`,id:`storing-chai-1-outputs-on-modal-volumes`},{depth:2,value:`Running Chai-1 on Modal`,id:`running-chai-1-on-modal`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Fold proteins with Chai-1

In biology, function follows form quite literally:
the physical shapes of proteins dictate their behavior.
Measuring those shapes directly is difficult
and first-principles physical simulation prohibitively expensive.

And so predicting protein shape from content --
determining how the one-dimensional chain of amino acids encoded by DNA _folds_ into a 3D object --
has emerged as a key application for machine learning and neural networks in biology.

In this example, we demonstrate how to run the open source [Chai-1](https://github.com/chaidiscovery/chai-lab/)
protein structure prediction model on Modal's flexible serverless infrastructure.
For details on how the Chai-1 model works and what it can be used for,
see the authors' [technical report on bioRxiv](https://www.biorxiv.org/content/10.1101/2024.10.10.615955).

This simple script is meant as a starting point showing how to handle fiddly bits
like installing dependencies, loading weights, and formatting outputs so that you can get on with the fun stuff.
To experience the full power of Modal, try scaling inference up and running on hundreds or thousands of structures!

<center>
<a href="https://molstar.org/viewer" aria-label="Open the Mol* viewer"> <video controls autoplay loop muted> <source src="https://modal-cdn.com/example-chai1-folding.mp4" type="video/mp4"> </video> </a>
</center>

## Setup

\`\`\`python
import hashlib
import json
from pathlib import Path
from typing import Optional
from uuid import uuid4

import modal

here = Path(__file__).parent  # the directory of this file

MINUTES = 60  # seconds

app = modal.App(name="example-chai1")

\`\`\`

## Fold a protein from the command line

The logic for running Chai-1 is encapsulated in the function below,
which you can trigger from the command line by running

\`\`\`shell
modal run chai1
\`\`\`

This will set up the environment for running Chai-1 inference in Modal's cloud,
run it, and then save the results remotely and locally. The results are returned in the
[Crystallographic Information File](https://en.wikipedia.org/wiki/Crystallographic_Information_File) format,
which you can render with the online [Molstar Viewer](https://molstar.org/).

To see more options, run the command with the \`--help\` flag.

To learn how it works, read on!

\`\`\`python
@app.local_entrypoint()
def main(
    force_redownload: bool = False,
    fasta_file: Optional[str] = None,
    inference_config_file: Optional[str] = None,
    output_dir: Optional[str] = None,
    run_id: Optional[str] = None,
):
    print("🧬 checking inference dependencies")
    download_inference_dependencies.remote(force=force_redownload)

    if fasta_file is None:
        fasta_file = here / "data" / "chai1_default_input.fasta"
    print(f"🧬 running Chai inference on {fasta_file}")
    fasta_content = Path(fasta_file).read_text()

    if inference_config_file is None:
        inference_config_file = here / "data" / "chai1_default_inference.json"
    print(f"🧬 loading Chai inference config from {inference_config_file}")
    inference_config = json.loads(Path(inference_config_file).read_text())

    if run_id is None:
        run_id = hashlib.sha256(uuid4().bytes).hexdigest()[:8]  # short id
    print(f"🧬 running inference with {run_id=}")

    results = chai1_inference.remote(fasta_content, inference_config, run_id)

    if output_dir is None:
        output_dir = Path("/tmp/chai1")
        output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🧬 saving results to disk locally in {output_dir}")
    for ii, (scores, cif) in enumerate(results):
        (Path(output_dir) / f"{run_id}-scores.model_idx_{ii}.npz").write_bytes(scores)
        (Path(output_dir) / f"{run_id}-preds.model_idx_{ii}.cif").write_text(cif)


\`\`\`

## Installing Chai-1 Python dependencies on Modal

Code running on Modal runs inside containers built from [container images](https://modal.com/docs/guide/images)
that include that code's dependencies.

Because Modal images include [GPU drivers](https://modal.com/docs/guide/cuda) by default,
installation of higher-level packages like \`chai_lab\` that require GPUs is painless.

Here, we do it with one line, using the \`uv\` package manager for extra speed.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "chai_lab==0.5.0",
        "huggingface-hub==0.36.0",
    )
    .uv_pip_install(
        "torch==2.7.1",
        index_url="https://download.pytorch.org/whl/cu128",
    )
)

\`\`\`

## Storing Chai-1 model weights on Modal with Volumes

Not all "dependencies" belong in a container image. Chai-1, for example, depends on
the weights of several models.

Rather than loading them dynamically at run-time (which would add several minutes of GPU time to each inference),
or installing them into the image (which would require they be re-downloaded any time the other dependencies changed),
we load them onto a [Modal Volume](https://modal.com/docs/guide/volumes).
A Modal Volume is a file system that all of your code running on Modal (or elsewhere!) can access.
For more on storing model weights on Modal, see [this guide](https://modal.com/docs/guide/model-weights).

\`\`\`python
chai_model_volume = (
    modal.Volume.from_name(  # create distributed filesystem for model weights
        "chai1-models",
        create_if_missing=True,
    )
)
models_dir = Path("/models/chai1")

\`\`\`

The details of how we handle the download here (e.g. running concurrently for extra speed)
are in the [Addenda](#addenda).

\`\`\`python
image = image.env(  # update the environment variables in the image to...
    {
        "CHAI_DOWNLOADS_DIR": str(models_dir),  # point the chai code to it
        "HF_XET_HIGH_PERFORMANCE": "1",  # speed up downloads
    }
)

\`\`\`

## Storing Chai-1 outputs on Modal Volumes

Chai-1 produces its outputs by writing to disk --
the model's scores for the structure and the structure itself along with rich metadata.

But Modal is a _serverless_ platform, and the filesystem your Modal Functions write to
is not persistent. Any file can be converted into bytes and sent back from a Modal Function
-- and we mean any! You can send files that are gigabytes in size that way.
So we do that below.

But for larger jobs, like folding every protein in the PDB, storing bytes on a local client
like a laptop won't cut it.

So we again lean on Modal Volumes, which can store thousands of files each.
We attach a Volume to a Modal Function that runs Chai-1 and the inference code
saves the results to distributed storage, without any fuss or source code changes.

\`\`\`python
chai_preds_volume = modal.Volume.from_name("chai1-preds", create_if_missing=True)
preds_dir = Path("/preds")

\`\`\`

## Running Chai-1 on Modal

Now we're ready to define a Modal Function that runs Chai-1.

We put our function on Modal by wrapping it in a decorator, \`@app.function\`.
We provide that decorator with some arguments that describe the infrastructure our code needs to run:
the Volumes we created, the Image we defined, and of course a fast GPU!

Note that Chai-1 takes a file path as input --
specifically, a path to a file in the [FASTA format](https://en.wikipedia.org/wiki/FASTA_format).
We pass the file contents to the function as a string and save them to disk so they can be picked up by the inference code.

Because Modal is serverless, we don't need to worry about cleaning up these resources:
the disk is ephemeral and the GPU only costs you money when you're using it.

\`\`\`python
@app.function(
    timeout=15 * MINUTES,
    gpu="H100",
    volumes={models_dir: chai_model_volume, preds_dir: chai_preds_volume},
    image=image,
)
def chai1_inference(
    fasta_content: str, inference_config: dict, run_id: str
) -> list[(bytes, str)]:
    from pathlib import Path

    import torch
    from chai_lab import chai1

    N_DIFFUSION_SAMPLES = 5  # hard-coded in chai-1

    fasta_file = Path("/tmp/inputs.fasta")
    fasta_file.write_text(fasta_content.strip())

    output_dir = Path("/preds") / run_id

    chai1.run_inference(
        fasta_file=fasta_file,
        output_dir=output_dir,
        device=torch.device("cuda"),
        **inference_config,
    )

    print(
        f"🧬 done, results written to /{output_dir.relative_to('/preds')} on remote volume"
    )

    results = []
    for ii in range(N_DIFFUSION_SAMPLES):
        scores = (output_dir / f"scores.model_idx_{ii}.npz").read_bytes()
        cif = (output_dir / f"pred.model_idx_{ii}.cif").read_text()

        results.append((scores, cif))

    return results


\`\`\`

## Addenda

Above, we glossed over just how we got hold of the model weights --
the \`local_entrypoint\` just called a function named \`download_inference_dependencies\`.

Here's that function's implementation.

A few highlights:

- This Modal Function can access the model weights Volume, like the inference Function,
but it can't access the model predictions Volume.

- This Modal Function has a different Image (the default!) and doesn't use a GPU. Modal helps you
separate the concerns, and the costs, of your infrastructure's components.

- We use the \`async\` keyword here so that we can run the download for each model file
as a separate task, concurrently. We don't need to worry about this use of \`async\`
spreading to the rest of our code -- Modal launches just this Function in an async runtime.

\`\`\`python
@app.function(volumes={models_dir: chai_model_volume})
async def download_inference_dependencies(force=False):
    import asyncio

    import aiohttp

    base_url = "https://chaiassets.com/chai1-inference-depencencies/"  # sic
    inference_dependencies = [
        "conformers_v1.apkl",
        "models_v2/trunk.pt",
        "models_v2/token_embedder.pt",
        "models_v2/feature_embedding.pt",
        "models_v2/diffusion_module.pt",
        "models_v2/confidence_head.pt",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }

    # launch downloads concurrently
    async with aiohttp.ClientSession(headers=headers) as session:
        tasks = []
        for dep in inference_dependencies:
            local_path = models_dir / dep
            if force or not local_path.exists():
                url = base_url + dep
                print(f"🧬 downloading {dep}")
                tasks.append(download_file(session, url, local_path))

        # run all of the downloads and await their completion
        await asyncio.gather(*tasks)

    chai_model_volume.commit()  # ensures models are visible on remote filesystem before exiting, otherwise takes a few seconds, racing with inference


async def download_file(session, url: str, local_path: Path):
    async with session.get(url) as response:
        response.raise_for_status()
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, "wb") as f:
            while chunk := await response.content.read(8192):
                f.write(chunk)

\`\`\`
`,meta:{title:`Fold proteins with Chai-1`,description:`In biology, function follows form quite literally: the physical shapes of proteins dictate their behavior. Measuring those shapes directly is difficult and first-principles physical simulation prohibitively expensive.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>In biology, function follows form quite literally:
the physical shapes of proteins dictate their behavior.
Measuring those shapes directly is difficult
and first-principles physical simulation prohibitively expensive.</p> <p>And so predicting protein shape from content —
determining how the one-dimensional chain of amino acids encoded by DNA <em>folds</em> into a 3D object —
has emerged as a key application for machine learning and neural networks in biology.</p> <p>In this example, we demonstrate how to run the open source <!> protein structure prediction model on Modal’s flexible serverless infrastructure.
For details on how the Chai-1 model works and what it can be used for,
see the authors’ <!>.</p> <p>This simple script is meant as a starting point showing how to handle fiddly bits
like installing dependencies, loading weights, and formatting outputs so that you can get on with the fun stuff.
To experience the full power of Modal, try scaling inference up and running on hundreds or thousands of structures!</p> <center><a href="https://molstar.org/viewer" aria-label="Open the Mol* viewer"><video controls autoplay loop><source src="https://modal-cdn.com/example-chai1-folding.mp4" type="video/mp4"/></video></a></center> <!> <!> <!> <p>The logic for running Chai-1 is encapsulated in the function below,
which you can trigger from the command line by running</p> <!> <p>This will set up the environment for running Chai-1 inference in Modal’s cloud,
run it, and then save the results remotely and locally. The results are returned in the <!> format,
which you can render with the online <!>.</p> <p>To see more options, run the command with the <code>--help</code> flag.</p> <p>To learn how it works, read on!</p> <!> <!> <p>Code running on Modal runs inside containers built from <!> that include that code’s dependencies.</p> <p>Because Modal images include <!> by default,
installation of higher-level packages like <code>chai_lab</code> that require GPUs is painless.</p> <p>Here, we do it with one line, using the <code>uv</code> package manager for extra speed.</p> <!> <!> <p>Not all “dependencies” belong in a container image. Chai-1, for example, depends on
the weights of several models.</p> <p>Rather than loading them dynamically at run-time (which would add several minutes of GPU time to each inference),
or installing them into the image (which would require they be re-downloaded any time the other dependencies changed),
we load them onto a <!>.
A Modal Volume is a file system that all of your code running on Modal (or elsewhere!) can access.
For more on storing model weights on Modal, see <!>.</p> <!> <p>The details of how we handle the download here (e.g. running concurrently for extra speed)
are in the <!>.</p> <!> <!> <p>Chai-1 produces its outputs by writing to disk —
the model’s scores for the structure and the structure itself along with rich metadata.</p> <p>But Modal is a <em>serverless</em> platform, and the filesystem your Modal Functions write to
is not persistent. Any file can be converted into bytes and sent back from a Modal Function
— and we mean any! You can send files that are gigabytes in size that way.
So we do that below.</p> <p>But for larger jobs, like folding every protein in the PDB, storing bytes on a local client
like a laptop won’t cut it.</p> <p>So we again lean on Modal Volumes, which can store thousands of files each.
We attach a Volume to a Modal Function that runs Chai-1 and the inference code
saves the results to distributed storage, without any fuss or source code changes.</p> <!> <!> <p>Now we’re ready to define a Modal Function that runs Chai-1.</p> <p>We put our function on Modal by wrapping it in a decorator, <code>@app.function</code>.
We provide that decorator with some arguments that describe the infrastructure our code needs to run:
the Volumes we created, the Image we defined, and of course a fast GPU!</p> <p>Note that Chai-1 takes a file path as input —
specifically, a path to a file in the <!>.
We pass the file contents to the function as a string and save them to disk so they can be picked up by the inference code.</p> <p>Because Modal is serverless, we don’t need to worry about cleaning up these resources:
the disk is ephemeral and the GPU only costs you money when you’re using it.</p> <!> <!> <p>Above, we glossed over just how we got hold of the model weights —
the <code>local_entrypoint</code> just called a function named <code>download_inference_dependencies</code>.</p> <p>Here’s that function’s implementation.</p> <p>A few highlights:</p> <ul><li><p>This Modal Function can access the model weights Volume, like the inference Function,
but it can’t access the model predictions Volume.</p></li> <li><p>This Modal Function has a different Image (the default!) and doesn’t use a GPU. Modal helps you
separate the concerns, and the costs, of your infrastructure’s components.</p></li> <li><p>We use the <code>async</code> keyword here so that we can run the download for each model file
as a separate task, concurrently. We don’t need to worry about this use of <code>async</code> spreading to the rest of our code — Modal launches just this Function in an async runtime.</p></li></ul> <!>`,3);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`fold-proteins-with-chai-1`,children:(e,t)=>{l(),i(e,r(`Fold proteins with Chai-1`))},$$slots:{default:!0}});var h=c(p,6),g=c(e(h));m(g,{href:`https://github.com/chaidiscovery/chai-lab/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Chai-1`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://www.biorxiv.org/content/10.1101/2024.10.10.615955`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`technical report on bioRxiv`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,4),v=e(_),b=e(v);b.muted=!0,n(v),n(_);var x=c(_,2);u(x,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var S=c(x,2);f(S,{code:`import%20hashlib%0Aimport%20json%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0Afrom%20uuid%20import%20uuid4%0A%0Aimport%20modal%0A%0Ahere%20%3D%20Path(__file__).parent%20%20%23%20the%20directory%20of%20this%20file%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(name%3D%22example-chai1%22)%0A`,lang:`python`});var C=c(S,2);u(C,{id:`fold-a-protein-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Fold a protein from the command line`))},$$slots:{default:!0}});var w=c(C,4);f(w,{code:`modal%20run%20chai1`,lang:`shell`});var T=c(w,2),E=c(e(T));m(E,{href:`https://en.wikipedia.org/wiki/Crystallographic_Information_File`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Crystallographic Information File`))},$$slots:{default:!0}}),m(c(E,2),{href:`https://molstar.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Molstar Viewer`))},$$slots:{default:!0}}),l(),n(T);var D=c(T,6);f(D,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20force_redownload%3A%20bool%20%3D%20False%2C%0A%20%20%20%20fasta_file%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20inference_config_file%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20output_dir%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20run_id%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20print(%22%F0%9F%A7%AC%20checking%20inference%20dependencies%22)%0A%20%20%20%20download_inference_dependencies.remote(force%3Dforce_redownload)%0A%0A%20%20%20%20if%20fasta_file%20is%20None%3A%0A%20%20%20%20%20%20%20%20fasta_file%20%3D%20here%20%2F%20%22data%22%20%2F%20%22chai1_default_input.fasta%22%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20running%20Chai%20inference%20on%20%7Bfasta_file%7D%22)%0A%20%20%20%20fasta_content%20%3D%20Path(fasta_file).read_text()%0A%0A%20%20%20%20if%20inference_config_file%20is%20None%3A%0A%20%20%20%20%20%20%20%20inference_config_file%20%3D%20here%20%2F%20%22data%22%20%2F%20%22chai1_default_inference.json%22%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20loading%20Chai%20inference%20config%20from%20%7Binference_config_file%7D%22)%0A%20%20%20%20inference_config%20%3D%20json.loads(Path(inference_config_file).read_text())%0A%0A%20%20%20%20if%20run_id%20is%20None%3A%0A%20%20%20%20%20%20%20%20run_id%20%3D%20hashlib.sha256(uuid4().bytes).hexdigest()%5B%3A8%5D%20%20%23%20short%20id%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20running%20inference%20with%20%7Brun_id%3D%7D%22)%0A%0A%20%20%20%20results%20%3D%20chai1_inference.remote(fasta_content%2C%20inference_config%2C%20run_id)%0A%0A%20%20%20%20if%20output_dir%20is%20None%3A%0A%20%20%20%20%20%20%20%20output_dir%20%3D%20Path(%22%2Ftmp%2Fchai1%22)%0A%20%20%20%20%20%20%20%20output_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20saving%20results%20to%20disk%20locally%20in%20%7Boutput_dir%7D%22)%0A%20%20%20%20for%20ii%2C%20(scores%2C%20cif)%20in%20enumerate(results)%3A%0A%20%20%20%20%20%20%20%20(Path(output_dir)%20%2F%20f%22%7Brun_id%7D-scores.model_idx_%7Bii%7D.npz%22).write_bytes(scores)%0A%20%20%20%20%20%20%20%20(Path(output_dir)%20%2F%20f%22%7Brun_id%7D-preds.model_idx_%7Bii%7D.cif%22).write_text(cif)%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`installing-chai-1-python-dependencies-on-modal`,children:(e,t)=>{l(),i(e,r(`Installing Chai-1 Python dependencies on Modal`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container images`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);m(c(e(A)),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU drivers`))},$$slots:{default:!0}}),l(3),n(A);var j=c(A,4);f(j,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22chai_lab%3D%3D0.5.0%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.1%22%2C%0A%20%20%20%20%20%20%20%20index_url%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu128%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var M=c(j,2);u(M,{id:`storing-chai-1-model-weights-on-modal-with-volumes`,children:(e,t)=>{l(),i(e,r(`Storing Chai-1 model weights on Modal with Volumes`))},$$slots:{default:!0}});var N=c(M,4),P=c(e(N));m(P,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),m(c(P,2),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,2);f(F,{code:`chai_model_volume%20%3D%20(%0A%20%20%20%20modal.Volume.from_name(%20%20%23%20create%20distributed%20filesystem%20for%20model%20weights%0A%20%20%20%20%20%20%20%20%22chai1-models%22%2C%0A%20%20%20%20%20%20%20%20create_if_missing%3DTrue%2C%0A%20%20%20%20)%0A)%0Amodels_dir%20%3D%20Path(%22%2Fmodels%2Fchai1%22)%0A`,lang:`python`});var I=c(F,2);m(c(e(I)),{href:`#addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,2);f(L,{code:`image%20%3D%20image.env(%20%20%23%20update%20the%20environment%20variables%20in%20the%20image%20to...%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22CHAI_DOWNLOADS_DIR%22%3A%20str(models_dir)%2C%20%20%23%20point%20the%20chai%20code%20to%20it%0A%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20speed%20up%20downloads%0A%20%20%20%20%7D%0A)%0A`,lang:`python`});var R=c(L,2);u(R,{id:`storing-chai-1-outputs-on-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Storing Chai-1 outputs on Modal Volumes`))},$$slots:{default:!0}});var z=c(R,10);f(z,{code:`chai_preds_volume%20%3D%20modal.Volume.from_name(%22chai1-preds%22%2C%20create_if_missing%3DTrue)%0Apreds_dir%20%3D%20Path(%22%2Fpreds%22)%0A`,lang:`python`});var B=c(z,2);u(B,{id:`running-chai-1-on-modal`,children:(e,t)=>{l(),i(e,r(`Running Chai-1 on Modal`))},$$slots:{default:!0}});var V=c(B,6);m(c(e(V)),{href:`https://en.wikipedia.org/wiki/FASTA_format`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FASTA format`))},$$slots:{default:!0}}),l(),n(V);var H=c(V,4);f(H,{code:`%40app.function(%0A%20%20%20%20timeout%3D15%20*%20MINUTES%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20volumes%3D%7Bmodels_dir%3A%20chai_model_volume%2C%20preds_dir%3A%20chai_preds_volume%7D%2C%0A%20%20%20%20image%3Dimage%2C%0A)%0Adef%20chai1_inference(%0A%20%20%20%20fasta_content%3A%20str%2C%20inference_config%3A%20dict%2C%20run_id%3A%20str%0A)%20-%3E%20list%5B(bytes%2C%20str)%5D%3A%0A%20%20%20%20from%20pathlib%20import%20Path%0A%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20chai_lab%20import%20chai1%0A%0A%20%20%20%20N_DIFFUSION_SAMPLES%20%3D%205%20%20%23%20hard-coded%20in%20chai-1%0A%0A%20%20%20%20fasta_file%20%3D%20Path(%22%2Ftmp%2Finputs.fasta%22)%0A%20%20%20%20fasta_file.write_text(fasta_content.strip())%0A%0A%20%20%20%20output_dir%20%3D%20Path(%22%2Fpreds%22)%20%2F%20run_id%0A%0A%20%20%20%20chai1.run_inference(%0A%20%20%20%20%20%20%20%20fasta_file%3Dfasta_file%2C%0A%20%20%20%20%20%20%20%20output_dir%3Doutput_dir%2C%0A%20%20%20%20%20%20%20%20device%3Dtorch.device(%22cuda%22)%2C%0A%20%20%20%20%20%20%20%20**inference_config%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%F0%9F%A7%AC%20done%2C%20results%20written%20to%20%2F%7Boutput_dir.relative_to('%2Fpreds')%7D%20on%20remote%20volume%22%0A%20%20%20%20)%0A%0A%20%20%20%20results%20%3D%20%5B%5D%0A%20%20%20%20for%20ii%20in%20range(N_DIFFUSION_SAMPLES)%3A%0A%20%20%20%20%20%20%20%20scores%20%3D%20(output_dir%20%2F%20f%22scores.model_idx_%7Bii%7D.npz%22).read_bytes()%0A%20%20%20%20%20%20%20%20cif%20%3D%20(output_dir%20%2F%20f%22pred.model_idx_%7Bii%7D.cif%22).read_text()%0A%0A%20%20%20%20%20%20%20%20results.append((scores%2C%20cif))%0A%0A%20%20%20%20return%20results%0A%0A`,lang:`python`});var U=c(H,2);u(U,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),f(c(U,10),{code:`%40app.function(volumes%3D%7Bmodels_dir%3A%20chai_model_volume%7D)%0Aasync%20def%20download_inference_dependencies(force%3DFalse)%3A%0A%20%20%20%20import%20asyncio%0A%0A%20%20%20%20import%20aiohttp%0A%0A%20%20%20%20base_url%20%3D%20%22https%3A%2F%2Fchaiassets.com%2Fchai1-inference-depencencies%2F%22%20%20%23%20sic%0A%20%20%20%20inference_dependencies%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22conformers_v1.apkl%22%2C%0A%20%20%20%20%20%20%20%20%22models_v2%2Ftrunk.pt%22%2C%0A%20%20%20%20%20%20%20%20%22models_v2%2Ftoken_embedder.pt%22%2C%0A%20%20%20%20%20%20%20%20%22models_v2%2Ffeature_embedding.pt%22%2C%0A%20%20%20%20%20%20%20%20%22models_v2%2Fdiffusion_module.pt%22%2C%0A%20%20%20%20%20%20%20%20%22models_v2%2Fconfidence_head.pt%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20headers%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22User-Agent%22%3A%20%22Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F58.0.3029.110%20Safari%2F537.3%22%0A%20%20%20%20%7D%0A%0A%20%20%20%20%23%20launch%20downloads%20concurrently%0A%20%20%20%20async%20with%20aiohttp.ClientSession(headers%3Dheaders)%20as%20session%3A%0A%20%20%20%20%20%20%20%20tasks%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20dep%20in%20inference_dependencies%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20local_path%20%3D%20models_dir%20%2F%20dep%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20force%20or%20not%20local_path.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20base_url%20%2B%20dep%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%F0%9F%A7%AC%20downloading%20%7Bdep%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20tasks.append(download_file(session%2C%20url%2C%20local_path))%0A%0A%20%20%20%20%20%20%20%20%23%20run%20all%20of%20the%20downloads%20and%20await%20their%20completion%0A%20%20%20%20%20%20%20%20await%20asyncio.gather(*tasks)%0A%0A%20%20%20%20chai_model_volume.commit()%20%20%23%20ensures%20models%20are%20visible%20on%20remote%20filesystem%20before%20exiting%2C%20otherwise%20takes%20a%20few%20seconds%2C%20racing%20with%20inference%0A%0A%0Aasync%20def%20download_file(session%2C%20url%3A%20str%2C%20local_path%3A%20Path)%3A%0A%20%20%20%20async%20with%20session.get(url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20response.raise_for_status()%0A%20%20%20%20%20%20%20%20local_path.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20with%20open(local_path%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20chunk%20%3A%3D%20await%20response.content.read(8192)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f.write(chunk)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=TkYgjmcI.js.map
