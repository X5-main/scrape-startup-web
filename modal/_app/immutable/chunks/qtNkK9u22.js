(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`db4d8aa1-1023-4b86-9d1c-4e4e3014d492`,e._sentryDebugIdIdentifier=`sentry-dbid-db4d8aa1-1023-4b86-9d1c-4e4e3014d492`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Snapshot GPU memory to speed up cold starts`,id:`snapshot-gpu-memory-to-speed-up-cold-starts`}],rawContent:`# Snapshot GPU memory to speed up cold starts

This example demonstrates how to use GPU memory snapshots to speed up model loading.
Note that GPU memory snapshotting is an experimental feature,
so test carefully before using in production!
You can read more about GPU memory snapshotting, and its caveats,
[here](https://modal.com/docs/guide/memory-snapshot).

GPU snapshots can only be used with deployed Functions, so first deploy the App:

\`\`\`bash
modal deploy -m 06_gpu_and_ml.gpu_snapshot
\`\`\`

Next, invoke the Function:

\`\`\`bash
python -m 06_gpu_and_ml.gpu_snapshot
\`\`\`

The full code is below:

\`\`\`python
import modal

image = modal.Image.debian_slim().uv_pip_install("sentence-transformers<6")
app_name = "example-gpu-snapshot"
app = modal.App(app_name, image=image)

snapshot_key = "v1"  # change this to invalidate the snapshot cache

with image.imports():  # import in the global scope so imports can be snapshot
    from sentence_transformers import SentenceTransformer


@app.cls(
    gpu="a10",
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
)
class SnapshotEmbedder:
    @modal.enter(snap=True)
    def load(self):
        # during enter phase of container lifecycle,
        # load the model onto the GPU so it can be snapshot
        print("loading model")
        self.model = SentenceTransformer("BAAI/bge-small-en-v1.5", device="cuda")
        print(f"snapshotting {snapshot_key}")

    @modal.method()
    def run(self, sentences: list[str]) -> list[list[float]]:
        # later invocations of the Function will start here
        embeddings = self.model.encode(sentences, normalize_embeddings=True)
        return embeddings.tolist()


if __name__ == "__main__":
    # after deployment, we can use the class from anywhere
    SnapshotEmbedder = modal.Cls.from_name(app_name, "SnapshotEmbedder")
    embedder = SnapshotEmbedder()
    try:
        print("calling Modal Function")
        print(embedder.run.remote(sentences=["what is the meaning of life?"]))
    except modal.exception.NotFoundError:
        raise Exception(
            f"To take advantage of GPU snapshots, deploy first with modal deploy {__file__}"
        )

\`\`\`
`,meta:{title:`Snapshot GPU memory to speed up cold starts`,description:`This example demonstrates how to use GPU memory snapshots to speed up model loading. Note that GPU memory snapshotting is an experimental feature, so test carefully before using in production! You can read more about GPU memory snapshotting, and its caveats, here.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This example demonstrates how to use GPU memory snapshots to speed up model loading.
Note that GPU memory snapshotting is an experimental feature,
so test carefully before using in production!
You can read more about GPU memory snapshotting, and its caveats, <!>.</p> <p>GPU snapshots can only be used with deployed Functions, so first deploy the App:</p> <!> <p>Next, invoke the Function:</p> <!> <p>The full code is below:</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`snapshot-gpu-memory-to-speed-up-cold-starts`,children:(e,t)=>{l(),i(e,r(`Snapshot GPU memory to speed up cold starts`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://modal.com/docs/guide/memory-snapshot`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);d(h,{code:`modal%20deploy%20-m%2006_gpu_and_ml.gpu_snapshot`,lang:`bash`});var g=c(h,4);d(g,{code:`python%20-m%2006_gpu_and_ml.gpu_snapshot`,lang:`bash`}),d(c(g,4),{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22sentence-transformers%3C6%22)%0Aapp_name%20%3D%20%22example-gpu-snapshot%22%0Aapp%20%3D%20modal.App(app_name%2C%20image%3Dimage)%0A%0Asnapshot_key%20%3D%20%22v1%22%20%20%23%20change%20this%20to%20invalidate%20the%20snapshot%20cache%0A%0Awith%20image.imports()%3A%20%20%23%20import%20in%20the%20global%20scope%20so%20imports%20can%20be%20snapshot%0A%20%20%20%20from%20sentence_transformers%20import%20SentenceTransformer%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3D%22a10%22%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A)%0Aclass%20SnapshotEmbedder%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20%23%20during%20enter%20phase%20of%20container%20lifecycle%2C%0A%20%20%20%20%20%20%20%20%23%20load%20the%20model%20onto%20the%20GPU%20so%20it%20can%20be%20snapshot%0A%20%20%20%20%20%20%20%20print(%22loading%20model%22)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20SentenceTransformer(%22BAAI%2Fbge-small-en-v1.5%22%2C%20device%3D%22cuda%22)%0A%20%20%20%20%20%20%20%20print(f%22snapshotting%20%7Bsnapshot_key%7D%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20sentences%3A%20list%5Bstr%5D)%20-%3E%20list%5Blist%5Bfloat%5D%5D%3A%0A%20%20%20%20%20%20%20%20%23%20later%20invocations%20of%20the%20Function%20will%20start%20here%0A%20%20%20%20%20%20%20%20embeddings%20%3D%20self.model.encode(sentences%2C%20normalize_embeddings%3DTrue)%0A%20%20%20%20%20%20%20%20return%20embeddings.tolist()%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20%23%20after%20deployment%2C%20we%20can%20use%20the%20class%20from%20anywhere%0A%20%20%20%20SnapshotEmbedder%20%3D%20modal.Cls.from_name(app_name%2C%20%22SnapshotEmbedder%22)%0A%20%20%20%20embedder%20%3D%20SnapshotEmbedder()%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20print(%22calling%20Modal%20Function%22)%0A%20%20%20%20%20%20%20%20print(embedder.run.remote(sentences%3D%5B%22what%20is%20the%20meaning%20of%20life%3F%22%5D))%0A%20%20%20%20except%20modal.exception.NotFoundError%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22To%20take%20advantage%20of%20GPU%20snapshots%2C%20deploy%20first%20with%20modal%20deploy%20%7B__file__%7D%22%0A%20%20%20%20%20%20%20%20)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=qtNkK9u22.js.map
