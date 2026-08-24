(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6c1475ed-1d27-435f-8cc4-fed922ba5ff3`,e._sentryDebugIdIdentifier=`sentry-dbid-6c1475ed-1d27-435f-8cc4-fed922ba5ff3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Storing model weights on Modal`,id:`storing-model-weights-on-modal`,children:[{depth:2,value:`Storing weights in a Modal Volume`,id:`storing-weights-in-a-modal-volume`,children:[{depth:3,value:`Saving model weights into a Modal Volume from a Modal Function`,id:`saving-model-weights-into-a-modal-volume-from-a-modal-function`},{depth:3,value:`Uploading model weights into a Modal Volume`,id:`uploading-model-weights-into-a-modal-volume`},{depth:3,value:`Mounting cloud buckets as Modal Volumes`,id:`mounting-cloud-buckets-as-modal-volumes`}]},{depth:2,value:`Reading model weights from a Modal Volume`,id:`reading-model-weights-from-a-modal-volume`},{depth:2,value:`Storing weights in the Modal Image`,id:`storing-weights-in-the-modal-image`},{depth:2,value:`Optimizing model weight reads with @modal.enter`,id:`optimizing-model-weight-reads-with-modalenter`},{depth:2,value:`Storing weights from the Hugging Face Hub on Modal`,id:`storing-weights-from-the-hugging-face-hub-on-modal`}]}],rawContent:`# Storing model weights on Modal

Efficiently managing the weights of large models is crucial for optimizing the
build times and startup latency of many ML and AI applications.

Our recommended method for working with model weights is to store them in a Modal [Volume](/docs/guide/volumes),
which acts as a distributed file system, a "shared disk" all of your Modal Functions can access.

## Storing weights in a Modal Volume

To store your model weights in a Volume, you need to either
make the Volume available to a Modal Function that saves the model weights
or upload the model weights into the Volume from a client.

### Saving model weights into a Modal Volume from a Modal Function

If you're already generating the weights on Modal, you just need to
attach the Volume to your Modal Function, making it available for reading and writing:

\`\`\`python
from pathlib import Path

volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")

@app.function(gpu="any", volumes={MODEL_DIR: volume})  # attach the Volume
def train_model(data, config):
    import run_training

    model = run_training(config, data)
    model.save(config, MODEL_DIR)
\`\`\`

Volumes are attached by including them in a dictionary that maps
a path on the remote machine to a \`modal.Volume\` object.
They look just like a normal file system, so model weights can be saved to them
without adding any special code.

If the model weights are generated outside of Modal and made available
over the Internet, for example by an open-weights model provider
or your own training job on a dedicated cluster,
you can also download them into a Volume from a Modal Function:

\`\`\`python continuation
@app.function(volumes={MODEL_DIR: volume})
def download_model(model_id):
    import model_hub

    model_hub.download(model_id, local_dir=MODEL_DIR / model_id)
\`\`\`

Add [Modal Secrets](/docs/guide/secrets) to access weights that require authentication.

See [below](#storing-weights-from-the-hugging-face-hub-on-modal) for
more on downloading from the popular Hugging Face Hub.

### Uploading model weights into a Modal Volume

Instead of pulling weights into a Modal Volume from inside a Modal Function,
you might wish to push weights into Modal from a client,
like your laptop or a dedicated training cluster.

For that, you can use the \`batch_upload\` method of
[\`modal.Volume\`](/docs/sdk/py/latest/Volume)s
via the Modal Python client library:

\`\`\`python continuation
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)

@app.local_entrypoint()
def main(local_path: str, remote_path: str):
    with volume.batch_upload() as upload:
        upload.put_directory(local_path, remote_path)
\`\`\`

Alternatively, you can upload model weights using the
[\`modal volume\`](/docs/cli/latest/volume) CLI command:

\`\`\`bash
modal volume put model-weights-vol path/to/model path/on/volume
\`\`\`

### Mounting cloud buckets as Modal Volumes

If your model weights are already in cloud storage,
for example in an S3 bucket, you can connect them
to Modal Functions with a \`CloudBucketMount\`.

See [the guide](/docs/guide/cloud-bucket-mounts) for details.

## Reading model weights from a Modal Volume

You can read weights from a Volume as you would normally read them
from disk, so long as you attach the Volume to your Function.

\`\`\`python continuation
@app.function(gpu="any", volumes={MODEL_DIR: volume})
def inference(prompt, model_id):
    import load_model

    model = load_model(MODEL_DIR / model_id)
    model.run(prompt)
\`\`\`

## Storing weights in the Modal Image

It is also possible to store weights in your Function's Modal [Image](/docs/guide/images),
the private file system state that a Function sees when it starts up.
The weights might be downloaded via shell commands with [\`Image.run_commands\`](/docs/guide/images)
or downloaded using a Python function with [\`Image.run_function\`](/docs/guide/images).

We recommend storing model weights in a Modal [Volume](/docs/guide/volumes),
as described [above](#storing-weights-in-a-modal-volume). Performance is similar
for the two methods. Volumes are more flexible.
Images are rebuilt when their definition changes, starting from the changed layer,
which increases reproducibility for some builds but leads to unnecessary extra downloads
in most cases.

## Optimizing model weight reads with \`@modal.enter\`

In the above code samples, weights are loaded from disk into memory each time
the \`inference\` function is run. This isn't so bad if inference is much
slower than model loading (e.g. it is run on very large datasets)
or if the model loading logic is smart enough to skip reloading.

To guarantee a particular model's weights are only loaded once, you can use the \`@modal.enter\`
[container lifecycle hook](/docs/guide/lifecycle-functions)
to load the weights only when a new container starts.

\`\`\`python continuation
MODEL_ID = "some-model-id"

@app.cls(gpu="any", volumes={MODEL_DIR: volume})
class Model:
    @modal.enter()
    def setup(self, model_id=MODEL_ID):
        import load_model

        self.model = load_model(MODEL_DIR, model_id)

    @modal.method()
    def inference(self, prompt):
        return self.model.run(prompt)
\`\`\`

Note that methods decorated with \`@modal.enter\` can't be passed dynamic arguments.

If you need to load a single but possibly different model on each container start, you can
[parametrize](/docs/guide/parametrized-functions) your Modal Cls.
Below, we use the \`modal.parameter\` syntax.

\`\`\`python continuation
@app.cls(gpu="any", volumes={MODEL_DIR: volume})
class ParametrizedModel:
    model_id: str = modal.parameter()

    @modal.enter()
    def setup(self):
        import load_model

        self.model = load_model(MODEL_DIR, self.model_id)

    @modal.method()
    def inference(self, prompt):
        return self.model.run(prompt)
\`\`\`

## Storing weights from the Hugging Face Hub on Modal

The [Hugging Face Hub](https://huggingface.co/models) has over 1,000,000 models
with weights available for download.

The snippet below shows some additional tricks for downloading models
from the Hugging Face Hub on Modal.

\`\`\`python
from typing import Optional
from pathlib import Path

import modal

# create a Volume, or retrieve it if it exists
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")

# define dependencies for downloading model
download_image = (
    modal.Image.debian_slim()
    .pip_install("huggingface_hub")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"}) # enable fast data transfer
)
app = modal.App()

@app.function(
    volumes={MODEL_DIR.as_posix(): volume},  # "mount" the Volume, sharing it with your function
    image=download_image,  # only download dependencies needed here
)
def download_model(
    repo_id: str = "hf-internal-testing/tiny-random-GPTNeoXForCausalLM",
    revision: Optional[str] = None,  # include a revision to prevent surprises!
):
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id, local_dir=MODEL_DIR / repo_id, revision=revision)
    print(f"Model downloaded to {MODEL_DIR / repo_id}")
\`\`\`
`,meta:{title:`Storing model weights on Modal`,description:`Efficiently managing the weights of large models is crucial for optimizing the build times and startup latency of many ML and AI applications.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal.Volume</code>`),x=t(`<code>modal volume</code>`),S=t(`<code>Image.run_commands</code>`),C=t(`<code>Image.run_function</code>`),w=t(`Optimizing model weight reads with <code>@modal.enter</code>`,1),T=t(`<!> <p>Efficiently managing the weights of large models is crucial for optimizing the
build times and startup latency of many ML and AI applications.</p> <p>Our recommended method for working with model weights is to store them in a Modal <!>,
which acts as a distributed file system, a “shared disk” all of your Modal Functions can access.</p> <!> <p>To store your model weights in a Volume, you need to either
make the Volume available to a Modal Function that saves the model weights
or upload the model weights into the Volume from a client.</p> <!> <p>If you’re already generating the weights on Modal, you just need to
attach the Volume to your Modal Function, making it available for reading and writing:</p> <!> <p>Volumes are attached by including them in a dictionary that maps
a path on the remote machine to a <code>modal.Volume</code> object.
They look just like a normal file system, so model weights can be saved to them
without adding any special code.</p> <p>If the model weights are generated outside of Modal and made available
over the Internet, for example by an open-weights model provider
or your own training job on a dedicated cluster,
you can also download them into a Volume from a Modal Function:</p> <!> <p>Add <!> to access weights that require authentication.</p> <p>See <!> for
more on downloading from the popular Hugging Face Hub.</p> <!> <p>Instead of pulling weights into a Modal Volume from inside a Modal Function,
you might wish to push weights into Modal from a client,
like your laptop or a dedicated training cluster.</p> <p>For that, you can use the <code>batch_upload</code> method of <!>s
via the Modal Python client library:</p> <!> <p>Alternatively, you can upload model weights using the <!> CLI command:</p> <!> <!> <p>If your model weights are already in cloud storage,
for example in an S3 bucket, you can connect them
to Modal Functions with a <code>CloudBucketMount</code>.</p> <p>See <!> for details.</p> <!> <p>You can read weights from a Volume as you would normally read them
from disk, so long as you attach the Volume to your Function.</p> <!> <!> <p>It is also possible to store weights in your Function’s Modal <!>,
the private file system state that a Function sees when it starts up.
The weights might be downloaded via shell commands with <!> or downloaded using a Python function with <!>.</p> <p>We recommend storing model weights in a Modal <!>,
as described <!>. Performance is similar
for the two methods. Volumes are more flexible.
Images are rebuilt when their definition changes, starting from the changed layer,
which increases reproducibility for some builds but leads to unnecessary extra downloads
in most cases.</p> <!> <p>In the above code samples, weights are loaded from disk into memory each time
the <code>inference</code> function is run. This isn’t so bad if inference is much
slower than model loading (e.g. it is run on very large datasets)
or if the model loading logic is smart enough to skip reloading.</p> <p>To guarantee a particular model’s weights are only loaded once, you can use the <code>@modal.enter</code> <!> to load the weights only when a new container starts.</p> <!> <p>Note that methods decorated with <code>@modal.enter</code> can’t be passed dynamic arguments.</p> <p>If you need to load a single but possibly different model on each container start, you can <!> your Modal Cls.
Below, we use the <code>modal.parameter</code> syntax.</p> <!> <!> <p>The <!> has over 1,000,000 models
with weights available for download.</p> <p>The snippet below shows some additional tricks for downloading models
from the Hugging Face Hub on Modal.</p> <!>`,1);function E(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=T(),m=s(o);f(m,{id:`storing-model-weights-on-modal`,children:(e,t)=>{l(),i(e,r(`Storing model weights on Modal`))},$$slots:{default:!0}});var g=c(m,4);h(c(e(g)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`storing-weights-in-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`Storing weights in a Modal Volume`))},$$slots:{default:!0}});var v=c(_,4);d(v,{id:`saving-model-weights-into-a-modal-volume-from-a-modal-function`,children:(e,t)=>{l(),i(e,r(`Saving model weights into a Modal Volume from a Modal Function`))},$$slots:{default:!0}});var y=c(v,4);p(y,{code:`from%20pathlib%20import%20Path%0A%0Avolume%20%3D%20modal.Volume.from_name(%22model-weights-vol%22%2C%20create_if_missing%3DTrue)%0AMODEL_DIR%20%3D%20Path(%22%2Fmodels%22)%0A%0A%40app.function(gpu%3D%22any%22%2C%20volumes%3D%7BMODEL_DIR%3A%20volume%7D)%20%20%23%20attach%20the%20Volume%0Adef%20train_model(data%2C%20config)%3A%0A%20%20%20%20import%20run_training%0A%0A%20%20%20%20model%20%3D%20run_training(config%2C%20data)%0A%20%20%20%20model.save(config%2C%20MODEL_DIR)`,lang:`python`});var E=c(y,6);p(E,{code:`%40app.function(volumes%3D%7BMODEL_DIR%3A%20volume%7D)%0Adef%20download_model(model_id)%3A%0A%20%20%20%20import%20model_hub%0A%0A%20%20%20%20model_hub.download(model_id%2C%20local_dir%3DMODEL_DIR%20%2F%20model_id)`,lang:`python`});var D=c(E,2);h(c(e(D)),{href:`/docs/guide/secrets`,children:(e,t)=>{l(),i(e,r(`Modal Secrets`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);h(c(e(O)),{href:`#storing-weights-from-the-hugging-face-hub-on-modal`,children:(e,t)=>{l(),i(e,r(`below`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);d(k,{id:`uploading-model-weights-into-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`Uploading model weights into a Modal Volume`))},$$slots:{default:!0}});var A=c(k,4);h(c(e(A),3),{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);p(j,{code:`volume%20%3D%20modal.Volume.from_name(%22model-weights-vol%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.local_entrypoint()%0Adef%20main(local_path%3A%20str%2C%20remote_path%3A%20str)%3A%0A%20%20%20%20with%20volume.batch_upload()%20as%20upload%3A%0A%20%20%20%20%20%20%20%20upload.put_directory(local_path%2C%20remote_path)`,lang:`python`});var M=c(j,2);h(c(e(M)),{href:`/docs/cli/latest/volume`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);p(N,{code:`modal%20volume%20put%20model-weights-vol%20path%2Fto%2Fmodel%20path%2Fon%2Fvolume`,lang:`bash`});var P=c(N,2);d(P,{id:`mounting-cloud-buckets-as-modal-volumes`,children:(e,t)=>{l(),i(e,r(`Mounting cloud buckets as Modal Volumes`))},$$slots:{default:!0}});var F=c(P,4);h(c(e(F)),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{l(),i(e,r(`the guide`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);u(I,{id:`reading-model-weights-from-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`Reading model weights from a Modal Volume`))},$$slots:{default:!0}});var L=c(I,4);p(L,{code:`%40app.function(gpu%3D%22any%22%2C%20volumes%3D%7BMODEL_DIR%3A%20volume%7D)%0Adef%20inference(prompt%2C%20model_id)%3A%0A%20%20%20%20import%20load_model%0A%0A%20%20%20%20model%20%3D%20load_model(MODEL_DIR%20%2F%20model_id)%0A%20%20%20%20model.run(prompt)`,lang:`python`});var R=c(L,2);u(R,{id:`storing-weights-in-the-modal-image`,children:(e,t)=>{l(),i(e,r(`Storing weights in the Modal Image`))},$$slots:{default:!0}});var z=c(R,2),B=c(e(z));h(B,{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}});var V=c(B,2);h(V,{href:`/docs/guide/images`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),h(c(V,2),{href:`/docs/guide/images`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(z);var H=c(z,2),U=c(e(H));h(U,{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),h(c(U,2),{href:`#storing-weights-in-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`above`))},$$slots:{default:!0}}),l(),n(H);var W=c(H,2);u(W,{id:`optimizing-model-weight-reads-with-modalenter`,children:(e,t)=>{l();var n=w();l(),i(e,n)},$$slots:{default:!0}});var G=c(W,4);h(c(e(G),3),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{l(),i(e,r(`container lifecycle hook`))},$$slots:{default:!0}}),l(),n(G);var K=c(G,2);p(K,{code:`MODEL_ID%20%3D%20%22some-model-id%22%0A%0A%40app.cls(gpu%3D%22any%22%2C%20volumes%3D%7BMODEL_DIR%3A%20volume%7D)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self%2C%20model_id%3DMODEL_ID)%3A%0A%20%20%20%20%20%20%20%20import%20load_model%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20load_model(MODEL_DIR%2C%20model_id)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20prompt)%3A%0A%20%20%20%20%20%20%20%20return%20self.model.run(prompt)`,lang:`python`});var q=c(K,4);h(c(e(q)),{href:`/docs/guide/parametrized-functions`,children:(e,t)=>{l(),i(e,r(`parametrize`))},$$slots:{default:!0}}),l(3),n(q);var J=c(q,2);p(J,{code:`%40app.cls(gpu%3D%22any%22%2C%20volumes%3D%7BMODEL_DIR%3A%20volume%7D)%0Aclass%20ParametrizedModel%3A%0A%20%20%20%20model_id%3A%20str%20%3D%20modal.parameter()%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20import%20load_model%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20load_model(MODEL_DIR%2C%20self.model_id)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20inference(self%2C%20prompt)%3A%0A%20%20%20%20%20%20%20%20return%20self.model.run(prompt)`,lang:`python`});var Y=c(J,2);u(Y,{id:`storing-weights-from-the-hugging-face-hub-on-modal`,children:(e,t)=>{l(),i(e,r(`Storing weights from the Hugging Face Hub on Modal`))},$$slots:{default:!0}});var X=c(Y,2);h(c(e(X)),{href:`https://huggingface.co/models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hugging Face Hub`))},$$slots:{default:!0}}),l(),n(X),p(c(X,4),{code:`from%20typing%20import%20Optional%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0A%23%20create%20a%20Volume%2C%20or%20retrieve%20it%20if%20it%20exists%0Avolume%20%3D%20modal.Volume.from_name(%22model-weights-vol%22%2C%20create_if_missing%3DTrue)%0AMODEL_DIR%20%3D%20Path(%22%2Fmodels%22)%0A%0A%23%20define%20dependencies%20for%20downloading%20model%0Adownload_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.pip_install(%22huggingface_hub%22)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%20%23%20enable%20fast%20data%20transfer%0A)%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7BMODEL_DIR.as_posix()%3A%20volume%7D%2C%20%20%23%20%22mount%22%20the%20Volume%2C%20sharing%20it%20with%20your%20function%0A%20%20%20%20image%3Ddownload_image%2C%20%20%23%20only%20download%20dependencies%20needed%20here%0A)%0Adef%20download_model(%0A%20%20%20%20repo_id%3A%20str%20%3D%20%22hf-internal-testing%2Ftiny-random-GPTNeoXForCausalLM%22%2C%0A%20%20%20%20revision%3A%20Optional%5Bstr%5D%20%3D%20None%2C%20%20%23%20include%20a%20revision%20to%20prevent%20surprises!%0A)%3A%0A%20%20%20%20from%20huggingface_hub%20import%20snapshot_download%0A%0A%20%20%20%20snapshot_download(repo_id%3Drepo_id%2C%20local_dir%3DMODEL_DIR%20%2F%20repo_id%2C%20revision%3Drevision)%0A%20%20%20%20print(f%22Model%20downloaded%20to%20%7BMODEL_DIR%20%2F%20repo_id%7D%22)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{E as default,g as metadata};
//# sourceMappingURL=Gvcrogse.js.map
