(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9ff1782c-53e5-4bb7-9754-aa1f2f0432d0`,e._sentryDebugIdIdentifier=`sentry-dbid-9ff1782c-53e5-4bb7-9754-aa1f2f0432d0`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Fold proteins with Boltz-2`,id:`fold-proteins-with-boltz-2`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Fold a protein from the command line`,id:`fold-a-protein-from-the-command-line`},{depth:2,value:`Installing Boltz-2 Python dependencies on Modal`,id:`installing-boltz-2-python-dependencies-on-modal`},{depth:2,value:`Storing Boltz-2 model weights on Modal with Volumes`,id:`storing-boltz-2-model-weights-on-modal-with-volumes`},{depth:2,value:`Running Boltz-2 on Modal`,id:`running-boltz-2-on-modal`},{depth:2,value:`Addenda`,id:`addenda`}]}],rawContent:`# Fold proteins with Boltz-2

<figure style="width: 70%; margin: 0 auto; display: block;">
<img src="https://modal-cdn.com/cdnbot/boltz_examplecd5u3m0j_9fa47e43.webp" alt="Boltz-2" />
<figcaption style="text-align: center"><em>Example of Boltz-2 protein structure prediction
of a <a style="text-decoration: underline;" href="https://github.com/jwohlwend/boltz/blob/main/examples/affinity.yaml" target="_blank">protein-ligand complex</a></em></figcaption>
</figure>

Boltz-2 is an open source molecular structure prediction model.
In contrast to previous models like Boltz-1, [Chai-1](https://modal.com/docs/examples/chai1), and AlphaFold-3, it not only predicts protein structures but also the [binding affinities](https://en.wikipedia.org/wiki/Ligand_(biochemistry)#Receptor/ligand_binding_affinity) between proteins and [ligands](https://en.wikipedia.org/wiki/Ligand_(biochemistry)).
It was created by the [MIT Jameel Clinic](https://jclinic.mit.edu/boltz-2/).
For details, see [their technical report](https://jeremywohlwend.com/assets/boltz2.pdf).

Here, we demonstrate how to run Boltz-2 on Modal.

## Setup

\`\`\`python
from pathlib import Path
from typing import Optional

import modal

here = Path(__file__).parent  # the directory of this file

MINUTES = 60  # seconds

app = modal.App(name="example-boltz-predict")

\`\`\`

## Fold a protein from the command line

The logic for running Boltz-2 is encapsulated in the function below,
which you can trigger from the command line by running

\`\`\`shell
modal run boltz_predict.py
\`\`\`

This will set up the environment for running Boltz-2 inference in Modal's cloud,
run it, and then save the results locally as a [tarball](https://computing.help.inf.ed.ac.uk/FAQ/whats-tarball-or-how-do-i-unpack-or-create-tgz-or-targz-file).
That tarball archive contains, among other things, the predicted structure as a
[Crystallographic Information File](https://en.wikipedia.org/wiki/Crystallographic_Information_File),
which you can render with the online [Molstar Viewer](https://molstar.org/viewer).

You can pass any options for the [\`boltz predict\` command line tool](https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md)
as a string, like

\`\`\` shell
modal run boltz_predict.py --args "--sampling_steps 10"
\`\`\`

To see more options, run the command with the \`--help\` flag.

To learn how it works, read on!

\`\`\`python
@app.local_entrypoint()
def main(
    force_download: bool = False, input_yaml_path: Optional[str] = None, args: str = ""
):
    print("🧬 loading model remotely")
    download_model.remote(force_download)

    if input_yaml_path is None:
        input_yaml_path = here / "data" / "boltz_affinity.yaml"
    else:
        input_yaml_path = Path(input_yaml_path)
    input_yaml = input_yaml_path.read_text()

    print(f"🧬 running boltz with input from {input_yaml_path}")
    output = boltz_inference.remote(input_yaml)

    output_path = Path("/tmp") / "boltz" / "boltz_result.tar.gz"
    output_path.parent.mkdir(exist_ok=True, parents=True)
    print(f"🧬 writing output to {output_path}")
    output_path.write_bytes(output)


\`\`\`

## Installing Boltz-2 Python dependencies on Modal

Code running on Modal runs inside containers built from [container images](https://modal.com/docs/guide/images)
that include that code's dependencies.

Because Modal images include [GPU drivers](https://modal.com/docs/guide/cuda) by default,
installation of higher-level packages like \`boltz\` that require GPUs is painless.

Here, we do it in a few lines, using the \`uv\` package manager for extra speed.

\`\`\`python
image = modal.Image.debian_slim(python_version="3.12").uv_pip_install("boltz==2.1.1")

\`\`\`

## Storing Boltz-2 model weights on Modal with Volumes

Not all "dependencies" belong in a container image. Boltz-2, for example, depends on
the weights of the model and a [Chemical Component Dictionary](https://www.wwpdb.org/data/ccd) (CCD) file.

Rather than loading them dynamically at run-time (which would add several minutes of GPU time to each inference),
or installing them into the image (which would require they be re-downloaded any time the other dependencies changed),
we load them onto a [Modal Volume](https://modal.com/docs/guide/volumes).
A Modal Volume is a file system that all of your code running on Modal (or elsewhere!) can access.
For more on storing model weights on Modal, see [this guide](https://modal.com/docs/guide/model-weights).
For details on how we download the weights in this case, see the [Addenda](#addenda).

\`\`\`python
boltz_model_volume = modal.Volume.from_name("boltz-models", create_if_missing=True)
models_dir = Path("/models/boltz")

\`\`\`

## Running Boltz-2 on Modal

To run inference on Modal we wrap our function in a decorator, \`@app.function\`.
We provide that decorator with some arguments that describe the infrastructure our code needs to run:
the Volume we created, the Image we defined, and of course a fast GPU!

Note that the \`boltz\` command-line tool we use takes the path to a
[specially-formatted YAML file](https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md#yaml-format)
that includes definitions of molecules to predict the structures of and optionally paths to
[Multiple Sequence Alignment](https://en.wikipedia.org/wiki/Multiple_sequence_alignment) (MSA) files
for any protein molecules. We pass the [--use_msa_server](https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md) flag to auto-generate the MSA using the mmseqs2 server.

\`\`\`python
@app.function(
    image=image,
    volumes={models_dir: boltz_model_volume},
    timeout=10 * MINUTES,
    gpu="H100",
)
def boltz_inference(boltz_input_yaml: str, args="") -> bytes:
    import shlex
    import subprocess

    input_path = Path("input.yaml")
    input_path.write_text(boltz_input_yaml)

    args = shlex.split(args)

    print(f"🧬 predicting structure using boltz model from {models_dir}")
    subprocess.run(
        ["boltz", "predict", input_path, "--use_msa_server", "--cache", str(models_dir)]
        + args,
        check=True,
    )

    print("🧬 packaging up outputs")
    output_bytes = package_outputs(f"boltz_results_{input_path.with_suffix('').name}")

    return output_bytes


\`\`\`

## Addenda

Above, we glossed over just how we got hold of the model weights --
the \`local_entrypoint\` just called a function named \`download_model\`.

Here's the implementation of that function. For details, see our
[guide to storing model weights on Modal](https://modal.com/docs/guide/model-weights).

\`\`\`python
download_image = (
    modal.Image.debian_slim()
    .uv_pip_install("huggingface-hub==0.36.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)


@app.function(
    volumes={models_dir: boltz_model_volume},
    timeout=20 * MINUTES,
    image=download_image,
)
def download_model(
    force_download: bool = False,
    revision: str = "6fdef46d763fee7fbb83ca5501ccceff43b85607",
):
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo_id="boltz-community/boltz-2",
        revision=revision,
        local_dir=models_dir,
        force_download=force_download,
    )
    boltz_model_volume.commit()

    print(f"🧬 model downloaded to {models_dir}")


\`\`\`

We package the outputs into a tarball which contains the predicted structure as a
[Crystallographic Information File](https://en.wikipedia.org/wiki/Crystallographic_Information_File)
and the binding affinity as a JSON file.
You can render the structure with the online [Molstar Viewer](https://molstar.org/viewer).

\`\`\`python
def package_outputs(output_dir: str) -> bytes:
    import io
    import tarfile

    tar_buffer = io.BytesIO()

    with tarfile.open(fileobj=tar_buffer, mode="w:gz") as tar:
        tar.add(output_dir, arcname=output_dir)

    return tar_buffer.getvalue()

\`\`\`
`,meta:{title:`Fold proteins with Boltz-2`,description:`Boltz-2 is an open source molecular structure prediction model. In contrast to previous models like Boltz-1, Chai-1, and AlphaFold-3, it not only predicts protein structures but also the binding affinities between proteins and ligands. It was created by the MIT Jameel Clinic. For details, see their technical report.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>boltz predict</code> command line tool`,1),b=t(`<!> <figure style="width: 70%; margin: 0 auto; display: block;"><img src="https://modal-cdn.com/cdnbot/boltz_examplecd5u3m0j_9fa47e43.webp" alt="Boltz-2"/> <figcaption style="text-align: center"><em>Example of Boltz-2 protein structure prediction
of a <a style="text-decoration: underline;" href="https://github.com/jwohlwend/boltz/blob/main/examples/affinity.yaml" target="_blank">protein-ligand complex</a></em></figcaption></figure> <p>Boltz-2 is an open source molecular structure prediction model.
In contrast to previous models like Boltz-1, <!>, and AlphaFold-3, it not only predicts protein structures but also the <!> between proteins and <!>.
It was created by the <!>.
For details, see <!>.</p> <p>Here, we demonstrate how to run Boltz-2 on Modal.</p> <!> <!> <!> <p>The logic for running Boltz-2 is encapsulated in the function below,
which you can trigger from the command line by running</p> <!> <p>This will set up the environment for running Boltz-2 inference in Modal’s cloud,
run it, and then save the results locally as a <!>.
That tarball archive contains, among other things, the predicted structure as a <!>,
which you can render with the online <!>.</p> <p>You can pass any options for the <!> as a string, like</p> <!> <p>To see more options, run the command with the <code>--help</code> flag.</p> <p>To learn how it works, read on!</p> <!> <!> <p>Code running on Modal runs inside containers built from <!> that include that code’s dependencies.</p> <p>Because Modal images include <!> by default,
installation of higher-level packages like <code>boltz</code> that require GPUs is painless.</p> <p>Here, we do it in a few lines, using the <code>uv</code> package manager for extra speed.</p> <!> <!> <p>Not all “dependencies” belong in a container image. Boltz-2, for example, depends on
the weights of the model and a <!> (CCD) file.</p> <p>Rather than loading them dynamically at run-time (which would add several minutes of GPU time to each inference),
or installing them into the image (which would require they be re-downloaded any time the other dependencies changed),
we load them onto a <!>.
A Modal Volume is a file system that all of your code running on Modal (or elsewhere!) can access.
For more on storing model weights on Modal, see <!>.
For details on how we download the weights in this case, see the <!>.</p> <!> <!> <p>To run inference on Modal we wrap our function in a decorator, <code>@app.function</code>.
We provide that decorator with some arguments that describe the infrastructure our code needs to run:
the Volume we created, the Image we defined, and of course a fast GPU!</p> <p>Note that the <code>boltz</code> command-line tool we use takes the path to a <!> that includes definitions of molecules to predict the structures of and optionally paths to <!> (MSA) files
for any protein molecules. We pass the <!> flag to auto-generate the MSA using the mmseqs2 server.</p> <!> <!> <p>Above, we glossed over just how we got hold of the model weights —
the <code>local_entrypoint</code> just called a function named <code>download_model</code>.</p> <p>Here’s the implementation of that function. For details, see our <!>.</p> <!> <p>We package the outputs into a tarball which contains the predicted structure as a <!> and the binding affinity as a JSON file.
You can render the structure with the online <!>.</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`fold-proteins-with-boltz-2`,children:(e,t)=>{l(),i(e,r(`Fold proteins with Boltz-2`))},$$slots:{default:!0}});var h=c(p,4),g=c(e(h));m(g,{href:`https://modal.com/docs/examples/chai1`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Chai-1`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://en.wikipedia.org/wiki/Ligand_(biochemistry)#Receptor/ligand_binding_affinity`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`binding affinities`))},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`https://en.wikipedia.org/wiki/Ligand_(biochemistry)`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ligands`))},$$slots:{default:!0}});var x=c(v,2);m(x,{href:`https://jclinic.mit.edu/boltz-2/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MIT Jameel Clinic`))},$$slots:{default:!0}}),m(c(x,2),{href:`https://jeremywohlwend.com/assets/boltz2.pdf`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`their technical report`))},$$slots:{default:!0}}),l(),n(h);var S=c(h,4);u(S,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var C=c(S,2);f(C,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0Ahere%20%3D%20Path(__file__).parent%20%20%23%20the%20directory%20of%20this%20file%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(name%3D%22example-boltz-predict%22)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`fold-a-protein-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Fold a protein from the command line`))},$$slots:{default:!0}});var T=c(w,4);f(T,{code:`modal%20run%20boltz_predict.py`,lang:`shell`});var E=c(T,2),D=c(e(E));m(D,{href:`https://computing.help.inf.ed.ac.uk/FAQ/whats-tarball-or-how-do-i-unpack-or-create-tgz-or-targz-file`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`tarball`))},$$slots:{default:!0}});var O=c(D,2);m(O,{href:`https://en.wikipedia.org/wiki/Crystallographic_Information_File`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Crystallographic Information File`))},$$slots:{default:!0}}),m(c(O,2),{href:`https://molstar.org/viewer`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Molstar Viewer`))},$$slots:{default:!0}}),l(),n(E);var k=c(E,2);m(c(e(k)),{href:`https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md`,rel:`nofollow`,children:(e,t)=>{var n=y();l(),i(e,n)},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`modal%20run%20boltz_predict.py%20--args%20%22--sampling_steps%2010%22`,lang:`shell`});var j=c(A,6);f(j,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20force_download%3A%20bool%20%3D%20False%2C%20input_yaml_path%3A%20Optional%5Bstr%5D%20%3D%20None%2C%20args%3A%20str%20%3D%20%22%22%0A)%3A%0A%20%20%20%20print(%22%F0%9F%A7%AC%20loading%20model%20remotely%22)%0A%20%20%20%20download_model.remote(force_download)%0A%0A%20%20%20%20if%20input_yaml_path%20is%20None%3A%0A%20%20%20%20%20%20%20%20input_yaml_path%20%3D%20here%20%2F%20%22data%22%20%2F%20%22boltz_affinity.yaml%22%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20input_yaml_path%20%3D%20Path(input_yaml_path)%0A%20%20%20%20input_yaml%20%3D%20input_yaml_path.read_text()%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20running%20boltz%20with%20input%20from%20%7Binput_yaml_path%7D%22)%0A%20%20%20%20output%20%3D%20boltz_inference.remote(input_yaml)%0A%0A%20%20%20%20output_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22boltz%22%20%2F%20%22boltz_result.tar.gz%22%0A%20%20%20%20output_path.parent.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20writing%20output%20to%20%7Boutput_path%7D%22)%0A%20%20%20%20output_path.write_bytes(output)%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`installing-boltz-2-python-dependencies-on-modal`,children:(e,t)=>{l(),i(e,r(`Installing Boltz-2 Python dependencies on Modal`))},$$slots:{default:!0}});var N=c(M,2);m(c(e(N)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container images`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);m(c(e(P)),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU drivers`))},$$slots:{default:!0}}),l(3),n(P);var F=c(P,4);f(F,{code:`image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%22boltz%3D%3D2.1.1%22)%0A`,lang:`python`});var I=c(F,2);u(I,{id:`storing-boltz-2-model-weights-on-modal-with-volumes`,children:(e,t)=>{l(),i(e,r(`Storing Boltz-2 model weights on Modal with Volumes`))},$$slots:{default:!0}});var L=c(I,2);m(c(e(L)),{href:`https://www.wwpdb.org/data/ccd`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Chemical Component Dictionary`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,2),z=c(e(R));m(z,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}});var B=c(z,2);m(B,{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),m(c(B,2),{href:`#addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}}),l(),n(R);var V=c(R,2);f(V,{code:`boltz_model_volume%20%3D%20modal.Volume.from_name(%22boltz-models%22%2C%20create_if_missing%3DTrue)%0Amodels_dir%20%3D%20Path(%22%2Fmodels%2Fboltz%22)%0A`,lang:`python`});var H=c(V,2);u(H,{id:`running-boltz-2-on-modal`,children:(e,t)=>{l(),i(e,r(`Running Boltz-2 on Modal`))},$$slots:{default:!0}});var U=c(H,4),W=c(e(U),3);m(W,{href:`https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md#yaml-format`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`specially-formatted YAML file`))},$$slots:{default:!0}});var G=c(W,2);m(G,{href:`https://en.wikipedia.org/wiki/Multiple_sequence_alignment`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Multiple Sequence Alignment`))},$$slots:{default:!0}}),m(c(G,2),{href:`https://github.com/jwohlwend/boltz/blob/main/docs/prediction.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`—use_msa_server`))},$$slots:{default:!0}}),l(),n(U);var K=c(U,2);f(K,{code:`%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20volumes%3D%7Bmodels_dir%3A%20boltz_model_volume%7D%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A)%0Adef%20boltz_inference(boltz_input_yaml%3A%20str%2C%20args%3D%22%22)%20-%3E%20bytes%3A%0A%20%20%20%20import%20shlex%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20input_path%20%3D%20Path(%22input.yaml%22)%0A%20%20%20%20input_path.write_text(boltz_input_yaml)%0A%0A%20%20%20%20args%20%3D%20shlex.split(args)%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20predicting%20structure%20using%20boltz%20model%20from%20%7Bmodels_dir%7D%22)%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%22boltz%22%2C%20%22predict%22%2C%20input_path%2C%20%22--use_msa_server%22%2C%20%22--cache%22%2C%20str(models_dir)%5D%0A%20%20%20%20%20%20%20%20%2B%20args%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(%22%F0%9F%A7%AC%20packaging%20up%20outputs%22)%0A%20%20%20%20output_bytes%20%3D%20package_outputs(f%22boltz_results_%7Binput_path.with_suffix('').name%7D%22)%0A%0A%20%20%20%20return%20output_bytes%0A%0A`,lang:`python`});var q=c(K,2);u(q,{id:`addenda`,children:(e,t)=>{l(),i(e,r(`Addenda`))},$$slots:{default:!0}});var J=c(q,4);m(c(e(J)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guide to storing model weights on Modal`))},$$slots:{default:!0}}),l(),n(J);var Y=c(J,2);f(Y,{code:`download_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.uv_pip_install(%22huggingface-hub%3D%3D0.36.0%22)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7Bmodels_dir%3A%20boltz_model_volume%7D%2C%0A%20%20%20%20timeout%3D20%20*%20MINUTES%2C%0A%20%20%20%20image%3Ddownload_image%2C%0A)%0Adef%20download_model(%0A%20%20%20%20force_download%3A%20bool%20%3D%20False%2C%0A%20%20%20%20revision%3A%20str%20%3D%20%226fdef46d763fee7fbb83ca5501ccceff43b85607%22%2C%0A)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(%0A%20%20%20%20%20%20%20%20repo_id%3D%22boltz-community%2Fboltz-2%22%2C%0A%20%20%20%20%20%20%20%20revision%3Drevision%2C%0A%20%20%20%20%20%20%20%20local_dir%3Dmodels_dir%2C%0A%20%20%20%20%20%20%20%20force_download%3Dforce_download%2C%0A%20%20%20%20)%0A%20%20%20%20boltz_model_volume.commit()%0A%0A%20%20%20%20print(f%22%F0%9F%A7%AC%20model%20downloaded%20to%20%7Bmodels_dir%7D%22)%0A%0A`,lang:`python`});var X=c(Y,2),Z=c(e(X));m(Z,{href:`https://en.wikipedia.org/wiki/Crystallographic_Information_File`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Crystallographic Information File`))},$$slots:{default:!0}}),m(c(Z,2),{href:`https://molstar.org/viewer`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Molstar Viewer`))},$$slots:{default:!0}}),l(),n(X),f(c(X,2),{code:`def%20package_outputs(output_dir%3A%20str)%20-%3E%20bytes%3A%0A%20%20%20%20import%20io%0A%20%20%20%20import%20tarfile%0A%0A%20%20%20%20tar_buffer%20%3D%20io.BytesIO()%0A%0A%20%20%20%20with%20tarfile.open(fileobj%3Dtar_buffer%2C%20mode%3D%22w%3Agz%22)%20as%20tar%3A%0A%20%20%20%20%20%20%20%20tar.add(output_dir%2C%20arcname%3Doutput_dir)%0A%0A%20%20%20%20return%20tar_buffer.getvalue()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=1SsbqyI-.js.map
