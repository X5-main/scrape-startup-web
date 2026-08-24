(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8fd8d7d4-3ed3-4325-8733-8e65978b8515`,e._sentryDebugIdIdentifier=`sentry-dbid-8fd8d7d4-3ed3-4325-8733-8e65978b8515`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as ne}from"./4BZlX0G7.js";import{t as re}from"./CDHdFnXi.js";import{t as ie}from"./DYSGKh1I.js";import{a as c,i as l,o as ae,r as u}from"./CPby7b1n.js";import{t as oe}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Memory Snapshots`,id:`memory-snapshots`,children:[{depth:2,value:`CPU Memory Snapshots`,id:`cpu-memory-snapshots`},{depth:2,value:`Container lifecycle hooks and Memory Snapshots`,id:`container-lifecycle-hooks-and-memory-snapshots`},{depth:2,value:`GPU Memory Snapshots`,id:`gpu-memory-snapshots`,children:[{depth:3,value:`Limitations of GPU Memory Snapshots`,id:`limitations-of-gpu-memory-snapshots`,children:[{depth:4,value:`You may need to rewrite code for compatibility or to improve performance`,id:`you-may-need-to-rewrite-code-for-compatibility-or-to-improve-performance`},{depth:4,value:`GPU Memory Snapshots are generally incompatible with multi-GPU code`,id:`gpu-memory-snapshots-are-generally-incompatible-with-multi-gpu-code`},{depth:4,value:`GPU Memory Snapshots are generally incompatible with non-CUDA GPU code`,id:`gpu-memory-snapshots-are-generally-incompatible-with-non-cuda-gpu-code`},{depth:4,value:`GPU Memory Snapshots do not speed up model loading from storage`,id:`gpu-memory-snapshots-do-not-speed-up-model-loading-from-storage`},{depth:4,value:`GPU Memory Snapshots can interact poorly with torch.compile`,id:`gpu-memory-snapshots-can-interact-poorly-with-torchcompile`}]}]},{depth:2,value:`Memory Snapshots FAQs`,id:`memory-snapshots-faqs`,children:[{depth:3,value:`How do I know whether Memory Snapshots are being created or used?`,id:`how-do-i-know-whether-memory-snapshots-are-being-created-or-used`},{depth:3,value:`When are Memory Snapshots updated?`,id:`when-are-memory-snapshots-updated`},{depth:3,value:`I haven’t changed my Function. Why do I still see Memory Snapshots being created sometimes?`,id:`i-havent-changed-my-function-why-do-i-still-see-memory-snapshots-being-created-sometimes`},{depth:3,value:`How do Memory Snapshots handle randomness?`,id:`how-do-memory-snapshots-handle-randomness`}]},{depth:2,value:`Advanced usage of Memory Snapshots`,id:`advanced-usage-of-memory-snapshots`,children:[{depth:3,value:`Using GPUs without using GPU Memory Snapshots`,id:`using-gpus-without-using-gpu-memory-snapshots`,children:[{depth:4,value:`GPUs are not available in CPU-only Memory Snapshots`,id:`gpus-are-not-available-in-cpu-only-memory-snapshots`},{depth:4,value:`Watch out for accidental GPU initialization during CPU-only Memory Snapshots`,id:`watch-out-for-accidental-gpu-initialization-during-cpu-only-memory-snapshots`}]}]}]}],rawContent:`# Memory Snapshots

Modal Memory Snapshots can dramatically reduce the [cold start](/docs/guide/cold-start) latency of Modal Functions by skipping initialization work on most container boots.

For instance, during initialization, your code might issue many file read operations sequentially,
like the >20,000 file operations required to load \`torch\`.
It might then run a JIT compiler that takes several minutes or more,
like the one in PyTorch.
Memory Snapshots replace this initialization work with direct restoration of the memory state that work created.

The relative speedup is unbounded: the more work you do to create fewer bytes, the greater it becomes.
In our experience, practical initialization-heavy Functions often start up
[3-10x faster from Memory Snapshots](/blog/gpu-mem-snapshots).

There are two variants of Memory Snapshots.
[CPU Memory Snapshots](#cpu-memory-snapshots) capture the state of CPU memory.
[GPU Memory Snapshots](#gpu-memory-snapshots), an [alpha feature](/docs/guide/feature-maturity), also capture the state of GPU memory.

## CPU Memory Snapshots

CPU Memory Snapshots capture the state of a container and save it to disk.
This saved snapshot can then be used to put new containers directly into the exact same state.

You can enable Memory Snapshots for your Function with the \`enable_memory_snapshot=True\` parameter:

\`\`\`python
@app.function(enable_memory_snapshot=True)
def my_func():
    ...
\`\`\`

Then deploy the App, e.g. with \`modal deploy\`. Memory Snapshots are created only for deployed Apps.

Any code executed in global scope, such as imports, will be captured in the Memory Snapshot.
Use the [\`Image.imports\` context manager](/docs/sdk/py/latest/Image#imports)
to import remote-only dependencies in the global scope.

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("pandas")

with image.imports():
    import pandas as pd


@app.function(enable_memory_snapshot=True, image=image)
def my_func():
    print(f"pandas v{pd.__version__}")
\`\`\`

## Container lifecycle hooks and Memory Snapshots

Modal's [container lifecycle hooks](/docs/guide/lifecycle-functions)
provide additional control over what parts of container initialization work
are included in Memory Snapshots. Put initialization code that you want to run
before snapshotting inside methods decorated with \`@modal.enter(snap=True)\`.

\`\`\`python
@app.cls(enable_memory_snapshot=True)
class MyCls:
    @modal.enter(snap=True)
    def load(self):
        ...  # will be snapshot

    @modal.enter()
    def load_more(self):
        ...  # will not be snapshot
\`\`\`

## GPU Memory Snapshots

<Callout variant="alpha" />

GPU Memory Snapshots build on CPU Memory Snapshots and additionally capture GPU state.

In addition to \`enable_memory_snapshot=True\`,
pass \`experimental_options={"enable_gpu_snapshot": True}\` to your Function or Cls
to enable GPU Memory Snapshots.

\`\`\`python
@app.function(
    gpu="a10",
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True}
    )
def my_gpu_func():
    ...
\`\`\`

You'll generally want to include any expensive initialization work that
requires the GPU in the Memory Snapshot.
Use a Modal [Cls](/docs/guide/lifecycle-functions)
and put that work inside a \`@modal.enter\` method,
like so:

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("transformers[torch]")

with image.imports():
     import torch
     from transformers import pipeline


@app.cls(
    gpu="h100",
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
    image=image,
)
class Llm:
    @modal.enter(snap=True)
    def init(self):
        self.pipeline = pipeline(model="Qwen/Qwen3-1.7B", device_map="cuda")
        self.pipeline.model = torch.compile(self.pipeline.model, mode="reduce-overhead")
        context = [{"role": "user", "content": DEFAULT_PROMPT}]
        self.pipeline(context)
\`\`\`

You can find a complete code sample [here](/docs/examples/gpu_snapshot).

We recommend warming up your model by running a few forward passes on sample data
in the \`@modal.enter(snap=True)\` method to move more initialization work into the snapshotting phase.
Without warmup, this work is generally done on the first few requests after container start
(regardless of whether Memory Snapshots are used),
which shows up as tail latency.

### Limitations of GPU Memory Snapshots

[We've seen](/blog/gpu-mem-snapshots) that GPU Memory Snapshots can massively reduce cold start time,
but they are subject to certain limitations.
The underlying checkpoint/restore technology in the device drivers
is still quite new. We expect these limitations to be resolved as the drivers update.
We recommend reviewing the material below
before adding GPU Memory Snapshots to your Modal Functions.

#### You may need to rewrite code for compatibility or to improve performance

While most GPU-accelerated Modal Functions can take advantage of GPU Memory Snapshots,
apart from the limitations described below,
most Functions will need some of their code rewritten to ensure compatibility with GPU Memory Snapshots
or to deliver performance improvements.

This is particularly true for more complex inference engines,
like those used to maximize [LLM inference performance](/docs/guide/high-performance-llm-inference).
For instance, it is often better to discard the initial, unfilled KV cache before the snapshot is taken,
then recreate it on restore, rather than writing and then reading the KV cache's meaningless pages in a snapshot.
See [this example with vLLM](/docs/examples/vllm_snapshot)
and [this example with SGLang](/docs/examples/sglang_snapshot)
for sample code, patterns, and other guidance.

#### GPU Memory Snapshots are generally incompatible with multi-GPU code

Though a few simple programs interacting with multiple GPUs can be successfully snapshot,
there are known issues with most practical uses of multiple GPUs,
stemming from multi-process and multi-GPU resource management concerns.
We anticipate improvements here in future drivers.

#### GPU Memory Snapshots are generally incompatible with non-CUDA GPU code

For instance, use of graphics capabilities prior to snapshotting will generally cause failures.

#### GPU Memory Snapshots do not speed up model loading from storage

Memory Snapshots use the same high-performance distributed filesystem
that delivers Modal [Images](/docs/guide/images)
and Modal [Volumes](/docs/guide/volumes)
to our worldwide fleet of containers at minimum latency and maximum throughput.

That means that if the majority of your initialization latency is spent loading weights,
GPU Memory Snapshots will generally not improve your cold start times --
and may even worsen them, by adding overhead.
Instead, Memory Snapshots should primarily be used to "skip past" work
that is not bottlenecked by storage bandwidth, like library initialization (imports)
and JIT compilation (Torch, DeepGEMM, Triton, etc.).

#### GPU Memory Snapshots can interact poorly with \`torch.compile\`

In certain cases, running the Torch Compiler can cause Memory Snapshot creation to fail.

Some of these failures can be fixed by setting the environment variable \`TORCHINDUCTOR_COMPILE_THREADS\` to \`1\` before compiling.

## Memory Snapshots FAQs

### How do I know whether Memory Snapshots are being created or used?

You can see Memory Snapshots in action in your Function's "Containers" tab. Containers that created a memory snapshot are marked with a <CloudUpload size={16} class="inline opacity-80" /> icon in the Startup column. Containers that restored from a snapshot are marked with a <CloudLightning size={16} class="inline opacity-80" /> icon. In the below screenshot, the container startup times when restoring from a memory snapshot are significantly faster.

![snapshot icons](https://modal-cdn.com/cdnbot/memory-snapshot-iconss6tm168n_cb303ec9.webp)

You can also search your Modal App's logs for the line \`Snapshot created. Restoring Function from memory snapshot.\`

### When are Memory Snapshots updated?

Redeploying your Function with new configuration (e.g. a [new GPU type](/docs/guide/gpu))
or new code will cause previous Memory Snapshots to become obsolete.
Subsequent invocations to the new Function version will automatically create new Memory Snapshots with the new configuration and code.

Changes to [Modal Volumes](/docs/guide/volumes) do not cause Memory Snapshots to update.
Deleting files in a Volume used during restore will cause restore failures.

### I haven't changed my Function. Why do I still see Memory Snapshots being created sometimes?

Modal recaptures Memory Snapshots to keep up with the platform's latest runtime and security changes.

Additionally, you may observe your Function being snapshot multiple times during its first few invocations.
This happens because Memory Snapshots are specific to the underlying worker type that created them
(e.g. CPU flags), and Modal Functions run across a handful of worker types.

Snapshot creation may add some latency to Function initialization.

- CPU-only Functions need around 6 snapshots for full coverage.
- GPU Functions need 2-3 snapshots per GPU type.

### How do Memory Snapshots handle randomness?

If your application depends on uniqueness of state, you must evaluate your
Function code and verify that it is resilient to snapshotting operations. For
example, if a variable is randomly initialized and that value included in a Memory Snapshot,
that variable will be identical after every restore, possibly breaking uniqueness expectations
of later code.

## Advanced usage of Memory Snapshots

### Using GPUs without using GPU Memory Snapshots

CPU Memory Snapshots on their own block GPU access,
but GPU Functions can still benefit from Memory Snapshots.
This involves refactoring your initialization code to run across two separate \`@modal.enter\` functions:
one that runs before creating the snapshot (\`snap=True\`),
and one that runs after restoring from the snapshot (\`snap=False\`).

For instance, you might load model weights into CPU memory in the \`snap=True\` method,
then move the weights onto GPU memory in the \`snap=False\` method.

Even without GPU snapshotting, this technique reduces the startup time for \`Embedder.run\`
in the below example by about 3x, from ~6 seconds down to just ~2 seconds.

\`\`\`python
import modal

image = modal.Image.debian_slim().uv_pip_install("sentence-transformers")
app = modal.App("sentence-transformers", image=image)

with image.imports():
    from sentence_transformers import SentenceTransformer

model_vol = modal.Volume.from_name("sentence-transformers-models", create_if_missing=True)


@app.cls(gpu="a10", volumes={"/models": model_vol}, enable_memory_snapshot=True)
class Embedder:
    model_id = "BAAI/bge-small-en-v1.5"

    @modal.enter(snap=True)
    def load(self):
        # Create a memory snapshot with the model loaded in CPU memory.
        self.model = SentenceTransformer(f"/models/{self.model_id}", device="cpu")

    @modal.enter(snap=False)
    def setup(self):
        self.model.to("cuda")  # Move the model to the GPU!

    @modal.method()
    def run(self, sentences:list[str]):
        embeddings = self.model.encode(sentences, normalize_embeddings=True)
        print(embeddings)


@app.local_entrypoint()
def main():
    Embedder().run.remote(sentences=["what is the meaning of life?"])


if __name__ == "__main__":
    cls = modal.Cls.from_name("sentence-transformers", "Embedder")
    cls().run.remote(sentences=["what is the meaning of life?"])
\`\`\`

#### GPUs are not available in CPU-only Memory Snapshots

If you are using the GPU Memory Snapshot feature (\`enable_gpu_snapshot\`), then
GPUs are available within \`@modal.enter(snap=True)\`.

If you are using memory snapshots _without_ \`enable_gpu_snapshot\`, then it's important
to note that GPUs will not be available within the \`@modal.enter(snap=True)\` method.

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("torch", "numpy")


@app.cls(enable_memory_snapshot=True, gpu="a10", image=image)
class GPUAvailability:
    @modal.enter(snap=True)
    def no_gpus_available_during_snapshots(self):
        import torch
        print(f"GPUs available: {torch.cuda.is_available()}")  # False

    @modal.enter(snap=False)
    def gpus_available_following_restore(self):
        import torch
        print(f"GPUs available: {torch.cuda.is_available()}")  # True

    @modal.method()
    def demo(self):
        print(f"GPUs available: {torch.cuda.is_available()}") # True
\`\`\`

#### Watch out for accidental GPU initialization during CPU-only Memory Snapshots

The \`torch.cuda\` module has multiple functions which, if called during
snapshotting, will initialize CUDA as having zero GPU devices. Such functions
include \`torch.cuda.is_available\` and \`torch.cuda.get_device_capability\`.
If you're using a framework that calls these methods during its import phase,
it may not be compatible with memory snapshots. The problem can manifest as
confusing "cuda not available" or "no CUDA-capable device is detected" errors.

We have found that importing PyTorch twice solves the problem in some cases:

\`\`\`python

@app.cls(enable_memory_snapshot=True, gpu="A10")
class GPUAvailability:
    @modal.enter(snap=True)
    def pre_snap(self):
        import torch
        ...
    @modal.enter(snap=False)
    def post_snap(self):
        import torch   # re-import to re-init GPU availability state
        ...
\`\`\`

In particular, \`xformers\` is known to call \`torch.cuda.get_device_capability\` on
import, so if it is imported during snapshotting it can unhelpfully initialize
CUDA with zero GPUs. The
[workaround](https://github.com/facebookresearch/xformers/issues/1030) for this
is to set the \`XFORMERS_ENABLE_TRITON\` environment variable to \`1\` in your \`modal.Image\`.

\`\`\`python
image = modal.Image.debian_slim().pip_install("xformers>=0.28")  # for instance
image = image.env({"XFORMERS_ENABLE_TRITON": "1"})
\`\`\`
`,meta:{title:`Memory Snapshots`,description:`Modal Memory Snapshots can dramatically reduce the cold start latency of Modal Functions by skipping initialization work on most container boots.`}},{toc:h,rawContent:g,meta:se}=m,ce=t(`<code>Image.imports</code> context manager`,1),le=t(`GPU Memory Snapshots can interact poorly with <code>torch.compile</code>`,1),ue=t(`<!> <p>Modal Memory Snapshots can dramatically reduce the <!> latency of Modal Functions by skipping initialization work on most container boots.</p> <p>For instance, during initialization, your code might issue many file read operations sequentially,
like the >20,000 file operations required to load <code>torch</code>.
It might then run a JIT compiler that takes several minutes or more,
like the one in PyTorch.
Memory Snapshots replace this initialization work with direct restoration of the memory state that work created.</p> <p>The relative speedup is unbounded: the more work you do to create fewer bytes, the greater it becomes.
In our experience, practical initialization-heavy Functions often start up <!>.</p> <p>There are two variants of Memory Snapshots. <!> capture the state of CPU memory. <!>, an <!>, also capture the state of GPU memory.</p> <!> <p>CPU Memory Snapshots capture the state of a container and save it to disk.
This saved snapshot can then be used to put new containers directly into the exact same state.</p> <p>You can enable Memory Snapshots for your Function with the <code>enable_memory_snapshot=True</code> parameter:</p> <!> <p>Then deploy the App, e.g. with <code>modal deploy</code>. Memory Snapshots are created only for deployed Apps.</p> <p>Any code executed in global scope, such as imports, will be captured in the Memory Snapshot.
Use the <!> to import remote-only dependencies in the global scope.</p> <!> <!> <p>Modal’s <!> provide additional control over what parts of container initialization work
are included in Memory Snapshots. Put initialization code that you want to run
before snapshotting inside methods decorated with <code>@modal.enter(snap=True)</code>.</p> <!> <!> <!> <p>GPU Memory Snapshots build on CPU Memory Snapshots and additionally capture GPU state.</p> <p>In addition to <code>enable_memory_snapshot=True</code>,
pass <code>experimental_options=&#123;"enable_gpu_snapshot": True&#125;</code> to your Function or Cls
to enable GPU Memory Snapshots.</p> <!> <p>You’ll generally want to include any expensive initialization work that
requires the GPU in the Memory Snapshot.
Use a Modal <!> and put that work inside a <code>@modal.enter</code> method,
like so:</p> <!> <p>You can find a complete code sample <!>.</p> <p>We recommend warming up your model by running a few forward passes on sample data
in the <code>@modal.enter(snap=True)</code> method to move more initialization work into the snapshotting phase.
Without warmup, this work is generally done on the first few requests after container start
(regardless of whether Memory Snapshots are used),
which shows up as tail latency.</p> <!> <p><!> that GPU Memory Snapshots can massively reduce cold start time,
but they are subject to certain limitations.
The underlying checkpoint/restore technology in the device drivers
is still quite new. We expect these limitations to be resolved as the drivers update.
We recommend reviewing the material below
before adding GPU Memory Snapshots to your Modal Functions.</p> <!> <p>While most GPU-accelerated Modal Functions can take advantage of GPU Memory Snapshots,
apart from the limitations described below,
most Functions will need some of their code rewritten to ensure compatibility with GPU Memory Snapshots
or to deliver performance improvements.</p> <p>This is particularly true for more complex inference engines,
like those used to maximize <!>.
For instance, it is often better to discard the initial, unfilled KV cache before the snapshot is taken,
then recreate it on restore, rather than writing and then reading the KV cache’s meaningless pages in a snapshot.
See <!> and <!> for sample code, patterns, and other guidance.</p> <!> <p>Though a few simple programs interacting with multiple GPUs can be successfully snapshot,
there are known issues with most practical uses of multiple GPUs,
stemming from multi-process and multi-GPU resource management concerns.
We anticipate improvements here in future drivers.</p> <!> <p>For instance, use of graphics capabilities prior to snapshotting will generally cause failures.</p> <!> <p>Memory Snapshots use the same high-performance distributed filesystem
that delivers Modal <!> and Modal <!> to our worldwide fleet of containers at minimum latency and maximum throughput.</p> <p>That means that if the majority of your initialization latency is spent loading weights,
GPU Memory Snapshots will generally not improve your cold start times —
and may even worsen them, by adding overhead.
Instead, Memory Snapshots should primarily be used to “skip past” work
that is not bottlenecked by storage bandwidth, like library initialization (imports)
and JIT compilation (Torch, DeepGEMM, Triton, etc.).</p> <!> <p>In certain cases, running the Torch Compiler can cause Memory Snapshot creation to fail.</p> <p>Some of these failures can be fixed by setting the environment variable <code>TORCHINDUCTOR_COMPILE_THREADS</code> to <code>1</code> before compiling.</p> <!> <!> <p>You can see Memory Snapshots in action in your Function’s “Containers” tab. Containers that created a memory snapshot are marked with a <!> icon in the Startup column. Containers that restored from a snapshot are marked with a <!> icon. In the below screenshot, the container startup times when restoring from a memory snapshot are significantly faster.</p> <p><!></p> <p>You can also search your Modal App’s logs for the line <code>Snapshot created. Restoring Function from memory snapshot.</code></p> <!> <p>Redeploying your Function with new configuration (e.g. a <!>)
or new code will cause previous Memory Snapshots to become obsolete.
Subsequent invocations to the new Function version will automatically create new Memory Snapshots with the new configuration and code.</p> <p>Changes to <!> do not cause Memory Snapshots to update.
Deleting files in a Volume used during restore will cause restore failures.</p> <!> <p>Modal recaptures Memory Snapshots to keep up with the platform’s latest runtime and security changes.</p> <p>Additionally, you may observe your Function being snapshot multiple times during its first few invocations.
This happens because Memory Snapshots are specific to the underlying worker type that created them
(e.g. CPU flags), and Modal Functions run across a handful of worker types.</p> <p>Snapshot creation may add some latency to Function initialization.</p> <ul><li>CPU-only Functions need around 6 snapshots for full coverage.</li> <li>GPU Functions need 2-3 snapshots per GPU type.</li></ul> <!> <p>If your application depends on uniqueness of state, you must evaluate your
Function code and verify that it is resilient to snapshotting operations. For
example, if a variable is randomly initialized and that value included in a Memory Snapshot,
that variable will be identical after every restore, possibly breaking uniqueness expectations
of later code.</p> <!> <!> <p>CPU Memory Snapshots on their own block GPU access,
but GPU Functions can still benefit from Memory Snapshots.
This involves refactoring your initialization code to run across two separate <code>@modal.enter</code> functions:
one that runs before creating the snapshot (<code>snap=True</code>),
and one that runs after restoring from the snapshot (<code>snap=False</code>).</p> <p>For instance, you might load model weights into CPU memory in the <code>snap=True</code> method,
then move the weights onto GPU memory in the <code>snap=False</code> method.</p> <p>Even without GPU snapshotting, this technique reduces the startup time for <code>Embedder.run</code> in the below example by about 3x, from ~6 seconds down to just ~2 seconds.</p> <!> <!> <p>If you are using the GPU Memory Snapshot feature (<code>enable_gpu_snapshot</code>), then
GPUs are available within <code>@modal.enter(snap=True)</code>.</p> <p>If you are using memory snapshots <em>without</em> <code>enable_gpu_snapshot</code>, then it’s important
to note that GPUs will not be available within the <code>@modal.enter(snap=True)</code> method.</p> <!> <!> <p>The <code>torch.cuda</code> module has multiple functions which, if called during
snapshotting, will initialize CUDA as having zero GPU devices. Such functions
include <code>torch.cuda.is_available</code> and <code>torch.cuda.get_device_capability</code>.
If you’re using a framework that calls these methods during its import phase,
it may not be compatible with memory snapshots. The problem can manifest as
confusing “cuda not available” or “no CUDA-capable device is detected” errors.</p> <p>We have found that importing PyTorch twice solves the problem in some cases:</p> <!> <p>In particular, <code>xformers</code> is known to call <code>torch.cuda.get_device_capability</code> on
import, so if it is imported during snapshotting it can unhelpfully initialize
CUDA with zero GPUs. The <!> for this
is to set the <code>XFORMERS_ENABLE_TRITON</code> environment variable to <code>1</code> in your <code>modal.Image</code>.</p> <!>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ue(),f=te(a);ae(f,{id:`memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}});var m=o(f,2);p(o(e(m)),{href:`/docs/guide/cold-start`,children:(e,t)=>{s(),i(e,r(`cold start`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4);p(o(e(h)),{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{s(),i(e,r(`3-10x faster from Memory Snapshots`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2),se=o(e(g));p(se,{href:`#cpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`CPU Memory Snapshots`))},$$slots:{default:!0}});var _=o(se,2);p(_,{href:`#gpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots`))},$$slots:{default:!0}}),p(o(_,2),{href:`/docs/guide/feature-maturity`,children:(e,t)=>{s(),i(e,r(`alpha feature`))},$$slots:{default:!0}}),s(),n(g);var de=o(g,2);c(de,{id:`cpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`CPU Memory Snapshots`))},$$slots:{default:!0}});var fe=o(de,6);d(fe,{code:`%40app.function(enable_memory_snapshot%3DTrue)%0Adef%20my_func()%3A%0A%20%20%20%20...`,lang:`python`});var v=o(fe,4);p(o(e(v)),{href:`/docs/sdk/py/latest/Image#imports`,children:(e,t)=>{var n=ce();s(),i(e,n)},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);d(y,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22pandas%22)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20pandas%20as%20pd%0A%0A%0A%40app.function(enable_memory_snapshot%3DTrue%2C%20image%3Dimage)%0Adef%20my_func()%3A%0A%20%20%20%20print(f%22pandas%20v%7Bpd.__version__%7D%22)`,lang:`python`});var b=o(y,2);c(b,{id:`container-lifecycle-hooks-and-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Container lifecycle hooks and Memory Snapshots`))},$$slots:{default:!0}});var x=o(b,2);p(o(e(x)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{s(),i(e,r(`container lifecycle hooks`))},$$slots:{default:!0}}),s(3),n(x);var S=o(x,2);d(S,{code:`%40app.cls(enable_memory_snapshot%3DTrue)%0Aclass%20MyCls%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20...%20%20%23%20will%20be%20snapshot%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_more(self)%3A%0A%20%20%20%20%20%20%20%20...%20%20%23%20will%20not%20be%20snapshot`,lang:`python`});var C=o(S,2);c(C,{id:`gpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots`))},$$slots:{default:!0}});var w=o(C,2);ie(w,{variant:`alpha`});var T=o(w,6);d(T,{code:`%40app.function(%0A%20%20%20%20gpu%3D%22a10%22%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%0A%20%20%20%20)%0Adef%20my_gpu_func()%3A%0A%20%20%20%20...`,lang:`python`});var E=o(T,2);p(o(e(E)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{s(),i(e,r(`Cls`))},$$slots:{default:!0}}),s(3),n(E);var D=o(E,2);d(D,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22transformers%5Btorch%5D%22)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20%20import%20torch%0A%20%20%20%20%20from%20transformers%20import%20pipeline%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3D%22h100%22%2C%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_gpu_snapshot%22%3A%20True%7D%2C%0A%20%20%20%20image%3Dimage%2C%0A)%0Aclass%20Llm%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20init(self)%3A%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20pipeline(model%3D%22Qwen%2FQwen3-1.7B%22%2C%20device_map%3D%22cuda%22)%0A%20%20%20%20%20%20%20%20self.pipeline.model%20%3D%20torch.compile(self.pipeline.model%2C%20mode%3D%22reduce-overhead%22)%0A%20%20%20%20%20%20%20%20context%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20DEFAULT_PROMPT%7D%5D%0A%20%20%20%20%20%20%20%20self.pipeline(context)`,lang:`python`});var O=o(D,2);p(o(e(O)),{href:`/docs/examples/gpu_snapshot`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,4);l(k,{id:`limitations-of-gpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Limitations of GPU Memory Snapshots`))},$$slots:{default:!0}});var A=o(k,2);p(e(A),{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{s(),i(e,r(`We’ve seen`))},$$slots:{default:!0}}),s(),n(A);var j=o(A,2);u(j,{id:`you-may-need-to-rewrite-code-for-compatibility-or-to-improve-performance`,children:(e,t)=>{s(),i(e,r(`You may need to rewrite code for compatibility or to improve performance`))},$$slots:{default:!0}});var M=o(j,4),N=o(e(M));p(N,{href:`/docs/guide/high-performance-llm-inference`,children:(e,t)=>{s(),i(e,r(`LLM inference performance`))},$$slots:{default:!0}});var P=o(N,2);p(P,{href:`/docs/examples/vllm_snapshot`,children:(e,t)=>{s(),i(e,r(`this example with vLLM`))},$$slots:{default:!0}}),p(o(P,2),{href:`/docs/examples/sglang_snapshot`,children:(e,t)=>{s(),i(e,r(`this example with SGLang`))},$$slots:{default:!0}}),s(),n(M);var F=o(M,2);u(F,{id:`gpu-memory-snapshots-are-generally-incompatible-with-multi-gpu-code`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots are generally incompatible with multi-GPU code`))},$$slots:{default:!0}});var I=o(F,4);u(I,{id:`gpu-memory-snapshots-are-generally-incompatible-with-non-cuda-gpu-code`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots are generally incompatible with non-CUDA GPU code`))},$$slots:{default:!0}});var L=o(I,4);u(L,{id:`gpu-memory-snapshots-do-not-speed-up-model-loading-from-storage`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots do not speed up model loading from storage`))},$$slots:{default:!0}});var R=o(L,2),z=o(e(R));p(z,{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`Images`))},$$slots:{default:!0}}),p(o(z,2),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),s(),n(R);var B=o(R,4);u(B,{id:`gpu-memory-snapshots-can-interact-poorly-with-torchcompile`,children:(e,t)=>{s();var n=le();s(),i(e,n)},$$slots:{default:!0}});var V=o(B,6);c(V,{id:`memory-snapshots-faqs`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots FAQs`))},$$slots:{default:!0}});var H=o(V,2);l(H,{id:`how-do-i-know-whether-memory-snapshots-are-being-created-or-used`,children:(e,t)=>{s(),i(e,r(`How do I know whether Memory Snapshots are being created or used?`))},$$slots:{default:!0}});var U=o(H,2),W=o(e(U));re(W,{size:16,class:`inline opacity-80`}),ne(o(W,2),{size:16,class:`inline opacity-80`}),s(),n(U);var G=o(U,2);oe(e(G),{src:`https://modal-cdn.com/cdnbot/memory-snapshot-iconss6tm168n_cb303ec9.webp`,alt:`snapshot icons`}),n(G);var K=o(G,4);l(K,{id:`when-are-memory-snapshots-updated`,children:(e,t)=>{s(),i(e,r(`When are Memory Snapshots updated?`))},$$slots:{default:!0}});var q=o(K,2);p(o(e(q)),{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`new GPU type`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,2);p(o(e(J)),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,2);l(Y,{id:`i-havent-changed-my-function-why-do-i-still-see-memory-snapshots-being-created-sometimes`,children:(e,t)=>{s(),i(e,r(`I haven’t changed my Function. Why do I still see Memory Snapshots being created sometimes?`))},$$slots:{default:!0}});var X=o(Y,10);l(X,{id:`how-do-memory-snapshots-handle-randomness`,children:(e,t)=>{s(),i(e,r(`How do Memory Snapshots handle randomness?`))},$$slots:{default:!0}});var Z=o(X,4);c(Z,{id:`advanced-usage-of-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Advanced usage of Memory Snapshots`))},$$slots:{default:!0}});var pe=o(Z,2);l(pe,{id:`using-gpus-without-using-gpu-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Using GPUs without using GPU Memory Snapshots`))},$$slots:{default:!0}});var me=o(pe,8);d(me,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22sentence-transformers%22)%0Aapp%20%3D%20modal.App(%22sentence-transformers%22%2C%20image%3Dimage)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20from%20sentence_transformers%20import%20SentenceTransformer%0A%0Amodel_vol%20%3D%20modal.Volume.from_name(%22sentence-transformers-models%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(gpu%3D%22a10%22%2C%20volumes%3D%7B%22%2Fmodels%22%3A%20model_vol%7D%2C%20enable_memory_snapshot%3DTrue)%0Aclass%20Embedder%3A%0A%20%20%20%20model_id%20%3D%20%22BAAI%2Fbge-small-en-v1.5%22%0A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20%23%20Create%20a%20memory%20snapshot%20with%20the%20model%20loaded%20in%20CPU%20memory.%0A%20%20%20%20%20%20%20%20self.model%20%3D%20SentenceTransformer(f%22%2Fmodels%2F%7Bself.model_id%7D%22%2C%20device%3D%22cpu%22)%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20self.model.to(%22cuda%22)%20%20%23%20Move%20the%20model%20to%20the%20GPU!%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20sentences%3Alist%5Bstr%5D)%3A%0A%20%20%20%20%20%20%20%20embeddings%20%3D%20self.model.encode(sentences%2C%20normalize_embeddings%3DTrue)%0A%20%20%20%20%20%20%20%20print(embeddings)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20Embedder().run.remote(sentences%3D%5B%22what%20is%20the%20meaning%20of%20life%3F%22%5D)%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20cls%20%3D%20modal.Cls.from_name(%22sentence-transformers%22%2C%20%22Embedder%22)%0A%20%20%20%20cls().run.remote(sentences%3D%5B%22what%20is%20the%20meaning%20of%20life%3F%22%5D)`,lang:`python`});var Q=o(me,2);u(Q,{id:`gpus-are-not-available-in-cpu-only-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`GPUs are not available in CPU-only Memory Snapshots`))},$$slots:{default:!0}});var he=o(Q,6);d(he,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22torch%22%2C%20%22numpy%22)%0A%0A%0A%40app.cls(enable_memory_snapshot%3DTrue%2C%20gpu%3D%22a10%22%2C%20image%3Dimage)%0Aclass%20GPUAvailability%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20no_gpus_available_during_snapshots(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20print(f%22GPUs%20available%3A%20%7Btorch.cuda.is_available()%7D%22)%20%20%23%20False%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20gpus_available_following_restore(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20print(f%22GPUs%20available%3A%20%7Btorch.cuda.is_available()%7D%22)%20%20%23%20True%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20demo(self)%3A%0A%20%20%20%20%20%20%20%20print(f%22GPUs%20available%3A%20%7Btorch.cuda.is_available()%7D%22)%20%23%20True`,lang:`python`});var ge=o(he,2);u(ge,{id:`watch-out-for-accidental-gpu-initialization-during-cpu-only-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Watch out for accidental GPU initialization during CPU-only Memory Snapshots`))},$$slots:{default:!0}});var _e=o(ge,6);d(_e,{code:`%0A%40app.cls(enable_memory_snapshot%3DTrue%2C%20gpu%3D%22A10%22)%0Aclass%20GPUAvailability%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20pre_snap(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20...%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20post_snap(self)%3A%0A%20%20%20%20%20%20%20%20import%20torch%20%20%20%23%20re-import%20to%20re-init%20GPU%20availability%20state%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var $=o(_e,2);p(o(e($),5),{href:`https://github.com/facebookresearch/xformers/issues/1030`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`workaround`))},$$slots:{default:!0}}),s(7),n($),d(o($,2),{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22xformers%3E%3D0.28%22)%20%20%23%20for%20instance%0Aimage%20%3D%20image.env(%7B%22XFORMERS_ENABLE_TRITON%22%3A%20%221%22%7D)`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=Ccsr3dAo.js.map
