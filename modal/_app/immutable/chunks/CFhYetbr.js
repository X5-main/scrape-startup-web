(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f0909943-4ebf-407b-80d9-c1f88609f23a`,e._sentryDebugIdIdentifier=`sentry-dbid-f0909943-4ebf-407b-80d9-c1f88609f23a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Tracing and profiling GPU-accelerated PyTorch programs on Modal`,id:`tracing-and-profiling-gpu-accelerated-pytorch-programs-on-modal`,children:[{depth:2,value:`Saving traces to a Modal Volume`,id:`saving-traces-to-a-modal-volume`},{depth:2,value:`Setting up a Modal App with a GPU-accelerated PyTorch Function`,id:`setting-up-a-modal-app-with-a-gpu-accelerated-pytorch-function`},{depth:2,value:`Wrapping a Modal Function with a profiler`,id:`wrapping-a-modal-function-with-a-profiler`},{depth:2,value:`Triggering profiled execution from the command line and viewing in Perfetto`,id:`triggering-profiled-execution-from-the-command-line-and-viewing-in-perfetto`,children:[{depth:3,value:`Improving the performance of our dummy test code`,id:`improving-the-performance-of-our-dummy-test-code`}]},{depth:2,value:`Serving TensorBoard on Modal to view PyTorch profiles and traces`,id:`serving-tensorboard-on-modal-to-view-pytorch-profiles-and-traces`}]}],rawContent:`# Tracing and profiling GPU-accelerated PyTorch programs on Modal

![A PyTorch trace loaded into ui.perfetto.dev](https://modal-public-assets.s3.amazonaws.com/tmpx_2c9bl5_c5aa7ab0.webp)

GPUs are high-performance computing devices. For high-performance computing,
tools for measuring and investigating performance are as critical
as tools for testing and confirming correctness in typical software.

In this example, we demonstrate how to wrap a Modal Function with PyTorch's
built-in profiler, which captures events on both CPUs & GPUs. We also show
how to host TensorBoard, which includes useful visualizations and
performance improvement suggestions.

For a live walkthrough, check out
[this video on our YouTube channel](https://www.youtube.com/watch?v=4cesQJLyHA8).

## Saving traces to a Modal Volume

Most tracing tools, including PyTorch's profiler, produce results as files on disk.
Modal Functions run in ephemeral containers in Modal's cloud infrastructure,
so by default these files disappear as soon as the Function finishes running.

We can ensure these files persist by saving them to a
[Modal Volume](https://modal.com/docs/guide/volumes).
Volumes are a distributed file system: files can be read or written from
by many machines across a network, in this case from inside any Modal Function.

To start, we just create a Volume with a specific name.
We'll also set a particular directory that we'll use for it
in our Functions below, for convenience.

\`\`\`python
from pathlib import Path
from typing import Optional

import modal

traces = modal.Volume.from_name("example-traces", create_if_missing=True)
TRACE_DIR = Path("/traces")

\`\`\`

## Setting up a Modal App with a GPU-accelerated PyTorch Function

We next set up the Modal Function that we wish to profile.

In general, we want to attach profiling tools to code that's already in place
and measure or debug its performance, and then detach it as easily as possible
so that we can be confident that the same performance characteristics pertain in production.

In keeping with that workflow, in this example we first define the Modal Function we want to profile,
without including any of the profiling logic.

That starts with the Function's environment: the Modal [App](https://modal.com/docs/guide/apps)
the Function is attached to, the container [Image](https://modal.com/docs/guide/custom-container)
with the Function's dependencies, and the hardware requirements of the Function, like a
[GPU](https://modal.com/docs/guide/cuda).

\`\`\`python
app = modal.App("example-torch-profiling")  # create an App

image = modal.Image.debian_slim(  # define dependencies
    python_version="3.11"
).uv_pip_install("torch==2.5.1", "numpy==2.1.3")

with image.imports():  # set up common imports
    import torch

\`\`\`

Here, we define the config as a dictionary so that we can re-use it here
and later, when we attach the profiler. We want to make sure the profiler is in the same environment!

\`\`\`python
config = {"gpu": "a10g", "image": image}

\`\`\`

The Function we target for profiling appears below. It's just some simple PyTorch logic
that repeatedly multiplies a random matrix with itself.

The logic is simple, but it demonstrates two common issues with
GPU-accelerated Python code that are relatively easily fixed:
1. Slowing down the issuance of work to the GPU
2. Providing insufficient work for the GPU to complete

We'll cover these in more detail once we have the profiler set up.

\`\`\`python
@app.function(**config)
def underutilize(scale=1):
    records = []

    x = torch.randn(  # 🐌 2: not enough work to keep the GPU busy
        scale * 100, scale * 100, device="cuda"
    )

    for ii in range(10):
        x = x @ x

        class Record:  # 🐌 1: heavy Python work in the hot loop
            def __init__(self, value):
                self.value = value

        records.append(Record(ii))

    x[0][0].cpu()  # force a host sync for accurate timing


\`\`\`

## Wrapping a Modal Function with a profiler

Now, let's wrap our \`underutilize\` Function with another Modal Function
that runs PyTorch's profiler while executing it.

This Function has the same environment \`config\` as \`underutilize\`,
but it also attaches a remote Modal Volume to save profiler outputs.

To increase the flexibility of this approach, we allow it to take the target Function's name
as an argument. That's not much use here where there's only one Function,
but it makes it easier to copy-paste this code into your projects to add profiling.

\`\`\`python
@app.function(volumes={TRACE_DIR: traces}, **config)
def profile(
    function,
    label: Optional[str] = None,
    steps: int = 3,
    schedule=None,
    record_shapes: bool = False,
    profile_memory: bool = False,
    with_stack: bool = False,
    print_rows: int = 0,
    **kwargs,
):
    from uuid import uuid4

    if isinstance(function, str):
        try:
            function = app.registered_functions[function]
        except KeyError:
            raise ValueError(f"Function {function} not found")
    function_name = function.tag

    output_dir = (
        TRACE_DIR / (function_name + (f"_{label}" if label else "")) / str(uuid4())
    )
    output_dir.mkdir(parents=True, exist_ok=True)

    if schedule is None:
        if steps < 3:
            raise ValueError("Steps must be at least 3 when using default schedule")
        schedule = {"wait": 1, "warmup": 1, "active": steps - 2, "repeat": 0}

    schedule = torch.profiler.schedule(**schedule)

    with torch.profiler.profile(
        activities=[
            torch.profiler.ProfilerActivity.CPU,
            torch.profiler.ProfilerActivity.CUDA,
        ],
        schedule=schedule,
        record_shapes=record_shapes,
        profile_memory=profile_memory,
        with_stack=with_stack,
        on_trace_ready=torch.profiler.tensorboard_trace_handler(output_dir),
    ) as prof:
        for _ in range(steps):
            function.local(**kwargs)  # <-- here we wrap the target Function
            prof.step()

    if print_rows:
        print(
            prof.key_averages().table(sort_by="cuda_time_total", row_limit=print_rows)
        )

    trace_path = sorted(
        output_dir.glob("**/*.pt.trace.json"),
        key=lambda pth: pth.stat().st_mtime,
        reverse=True,
    )[0]

    print(f"trace saved to {trace_path.relative_to(TRACE_DIR)}")

    return trace_path.read_text(), trace_path.relative_to(TRACE_DIR)


\`\`\`

## Triggering profiled execution from the command line and viewing in Perfetto

We wrap one more layer to make this executable from the command line:
a \`local_entrypoint\` that runs

\`\`\`bash
modal run torch_profiling.py --function underutilize --print-rows 10
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    function: str = "underutilize",
    label: Optional[str] = None,
    steps: int = 3,
    schedule=None,
    record_shapes: bool = False,
    profile_memory: bool = False,
    with_stack: bool = False,
    print_rows: int = 10,
    kwargs_json_path: Optional[str] = None,
):
    if kwargs_json_path is not None:  # use to pass arguments to function
        import json

        kwargs = json.loads(Path(kwargs_json_path).read_text())
    else:
        kwargs = {}

    results, remote_path = profile.remote(
        function,
        label=label,
        steps=steps,
        schedule=schedule,
        record_shapes=record_shapes,
        profile_memory=profile_memory,
        with_stack=with_stack,
        print_rows=print_rows,
        **kwargs,
    )

    output_path = Path("/tmp") / remote_path.name
    output_path.write_text(results)
    print(f"trace saved locally at {output_path}")


\`\`\`

Underneath the profile results, you'll also see the path at which the trace was saved on the Volume
and the path at which it was saved locally.

You can view the trace in the free online [Perfetto UI](https://ui.perfetto.dev).

### Improving the performance of our dummy test code

The \`underutilize\` demonstrates two common patterns that leads to unnecessarily low GPU utilization:
1. Slowing down the issuance of work to the GPU
2. Providing insufficient work for the GPU to complete

We simulated 1 in \`underutilize\` by defining a Python class in the middle of the matrix multiplication loop.
This takes on the order of 10 microseconds, roughly the same time it takes our A10 GPU to do the matrix multiplication.
Move it out of the loop to observe a small improvement in utilization. In a real setting,
this code might be useful logging or data processing logic, which we must carefully keep
out of the way of the code driving work on the GPU.

We simulated 2 in \`underutilize\` by providing a matrix that is too small to occupy the GPU for long.
Increase the size of the matrix by a factor of 4 in each dimension (a factor of 16 total),
to increase the utilization without increasing the execution time.

This is an untuitive feature of GPU programming in general: much work is done concurrently
and bottlenecks are non-obvious, so sometimes more work can be done for free or on the cheap.
In a server for large generative models, this might mean producing multiple outputs per user
or handling multiple users at the same time is more economical than it at first seems!

## Serving TensorBoard on Modal to view PyTorch profiles and traces

The TensorBoard experiment monitoring server also includes a plugin
for viewing and interpreting the results of PyTorch profiler runs:
the \`torch_tb_profiler\` plugin.

\`\`\`python
tb_image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "tensorboard==2.18.0", "torch_tb_profiler==0.4.3"
)

\`\`\`

Because TensorBoard is a WSGI app, we can [host it on Modal](https://modal.com/docs/guide/webhooks)
with the \`modal.wsgi_app\` decorator.

Making this work with Modal requires one extra step:
we add some [WSGI Middleware](https://peps.python.org/pep-3333/) that checks the Modal Volume for updates
whenever the whole page is reloaded.

\`\`\`python
class VolumeMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        if (route := environ.get("PATH_INFO")) in ["/", "/modal-volume-reload"]:
            try:
                traces.reload()
            except Exception as e:
                print("Exception while re-loading traces: ", e)
            if route == "/modal-volume-reload":
                environ["PATH_INFO"] = "/"  # redirect
        return self.app(environ, start_response)


\`\`\`

You can deploy the TensorBoard server defined below with the following command:
\`\`\`bash
modal deploy torch_profiling
\`\`\`

and you can find your server at the URL printed to the terminal.

\`\`\`python
@app.function(
    volumes={TRACE_DIR: traces},
    image=tb_image,
    max_containers=1,  # single replica
    scaledown_window=5 * 60,  # five minute idle time
)
@modal.concurrent(max_inputs=100)  # 100 concurrent request threads
@modal.wsgi_app()
def tensorboard():
    import tensorboard

    board = tensorboard.program.TensorBoard()
    board.configure(logdir=str(TRACE_DIR))
    (data_provider, deprecated_multiplexer) = board._make_data_provider()
    wsgi_app = tensorboard.backend.application.TensorBoardWSGIApp(
        board.flags,
        board.plugin_loaders,
        data_provider,
        board.assets_zip_provider,
        deprecated_multiplexer,
        experimental_middlewares=[VolumeMiddleware],
    )

    return wsgi_app._create_wsgi_app()

\`\`\`
`,meta:{title:`Tracing and profiling GPU-accelerated PyTorch programs on Modal`,description:`GPUs are high-performance computing devices. For high-performance computing, tools for measuring and investigating performance are as critical as tools for testing and confirming correctness in typical software.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<!> <p><!></p> <p>GPUs are high-performance computing devices. For high-performance computing,
tools for measuring and investigating performance are as critical
as tools for testing and confirming correctness in typical software.</p> <p>In this example, we demonstrate how to wrap a Modal Function with PyTorch’s
built-in profiler, which captures events on both CPUs & GPUs. We also show
how to host TensorBoard, which includes useful visualizations and
performance improvement suggestions.</p> <p>For a live walkthrough, check out <!>.</p> <!> <p>Most tracing tools, including PyTorch’s profiler, produce results as files on disk.
Modal Functions run in ephemeral containers in Modal’s cloud infrastructure,
so by default these files disappear as soon as the Function finishes running.</p> <p>We can ensure these files persist by saving them to a <!>.
Volumes are a distributed file system: files can be read or written from
by many machines across a network, in this case from inside any Modal Function.</p> <p>To start, we just create a Volume with a specific name.
We’ll also set a particular directory that we’ll use for it
in our Functions below, for convenience.</p> <!> <!> <p>We next set up the Modal Function that we wish to profile.</p> <p>In general, we want to attach profiling tools to code that’s already in place
and measure or debug its performance, and then detach it as easily as possible
so that we can be confident that the same performance characteristics pertain in production.</p> <p>In keeping with that workflow, in this example we first define the Modal Function we want to profile,
without including any of the profiling logic.</p> <p>That starts with the Function’s environment: the Modal <!> the Function is attached to, the container <!> with the Function’s dependencies, and the hardware requirements of the Function, like a <!>.</p> <!> <p>Here, we define the config as a dictionary so that we can re-use it here
and later, when we attach the profiler. We want to make sure the profiler is in the same environment!</p> <!> <p>The Function we target for profiling appears below. It’s just some simple PyTorch logic
that repeatedly multiplies a random matrix with itself.</p> <p>The logic is simple, but it demonstrates two common issues with
GPU-accelerated Python code that are relatively easily fixed:</p> <ol><li>Slowing down the issuance of work to the GPU</li> <li>Providing insufficient work for the GPU to complete</li></ol> <p>We’ll cover these in more detail once we have the profiler set up.</p> <!> <!> <p>Now, let’s wrap our <code>underutilize</code> Function with another Modal Function
that runs PyTorch’s profiler while executing it.</p> <p>This Function has the same environment <code>config</code> as <code>underutilize</code>,
but it also attaches a remote Modal Volume to save profiler outputs.</p> <p>To increase the flexibility of this approach, we allow it to take the target Function’s name
as an argument. That’s not much use here where there’s only one Function,
but it makes it easier to copy-paste this code into your projects to add profiling.</p> <!> <!> <p>We wrap one more layer to make this executable from the command line:
a <code>local_entrypoint</code> that runs</p> <!> <!> <p>Underneath the profile results, you’ll also see the path at which the trace was saved on the Volume
and the path at which it was saved locally.</p> <p>You can view the trace in the free online <!>.</p> <!> <p>The <code>underutilize</code> demonstrates two common patterns that leads to unnecessarily low GPU utilization:</p> <ol><li>Slowing down the issuance of work to the GPU</li> <li>Providing insufficient work for the GPU to complete</li></ol> <p>We simulated 1 in <code>underutilize</code> by defining a Python class in the middle of the matrix multiplication loop.
This takes on the order of 10 microseconds, roughly the same time it takes our A10 GPU to do the matrix multiplication.
Move it out of the loop to observe a small improvement in utilization. In a real setting,
this code might be useful logging or data processing logic, which we must carefully keep
out of the way of the code driving work on the GPU.</p> <p>We simulated 2 in <code>underutilize</code> by providing a matrix that is too small to occupy the GPU for long.
Increase the size of the matrix by a factor of 4 in each dimension (a factor of 16 total),
to increase the utilization without increasing the execution time.</p> <p>This is an untuitive feature of GPU programming in general: much work is done concurrently
and bottlenecks are non-obvious, so sometimes more work can be done for free or on the cheap.
In a server for large generative models, this might mean producing multiple outputs per user
or handling multiple users at the same time is more economical than it at first seems!</p> <!> <p>The TensorBoard experiment monitoring server also includes a plugin
for viewing and interpreting the results of PyTorch profiler runs:
the <code>torch_tb_profiler</code> plugin.</p> <!> <p>Because TensorBoard is a WSGI app, we can <!> with the <code>modal.wsgi_app</code> decorator.</p> <p>Making this work with Modal requires one extra step:
we add some <!> that checks the Modal Volume for updates
whenever the whole page is reloaded.</p> <!> <p>You can deploy the TensorBoard server defined below with the following command:</p> <!> <p>and you can find your server at the URL printed to the terminal.</p> <!>`,1);function S(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=x(),h=s(o);f(h,{id:`tracing-and-profiling-gpu-accelerated-pytorch-programs-on-modal`,children:(e,t)=>{l(),i(e,r(`Tracing and profiling GPU-accelerated PyTorch programs on Modal`))},$$slots:{default:!0}});var _=c(h,2);p(e(_),{src:`https://modal-public-assets.s3.amazonaws.com/tmpx_2c9bl5_c5aa7ab0.webp`,alt:`A PyTorch trace loaded into ui.perfetto.dev`}),n(_);var v=c(_,6);g(c(e(v)),{href:`https://www.youtube.com/watch?v=4cesQJLyHA8`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this video on our YouTube channel`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);u(y,{id:`saving-traces-to-a-modal-volume`,children:(e,t)=>{l(),i(e,r(`Saving traces to a Modal Volume`))},$$slots:{default:!0}});var b=c(y,4);g(c(e(b)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,4);m(S,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0Atraces%20%3D%20modal.Volume.from_name(%22example-traces%22%2C%20create_if_missing%3DTrue)%0ATRACE_DIR%20%3D%20Path(%22%2Ftraces%22)%0A`,lang:`python`});var C=c(S,2);u(C,{id:`setting-up-a-modal-app-with-a-gpu-accelerated-pytorch-function`,children:(e,t)=>{l(),i(e,r(`Setting up a Modal App with a GPU-accelerated PyTorch Function`))},$$slots:{default:!0}});var w=c(C,8),T=c(e(w));g(T,{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`App`))},$$slots:{default:!0}});var E=c(T,2);g(E,{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),g(c(E,2),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU`))},$$slots:{default:!0}}),l(),n(w);var D=c(w,2);m(D,{code:`app%20%3D%20modal.App(%22example-torch-profiling%22)%20%20%23%20create%20an%20App%0A%0Aimage%20%3D%20modal.Image.debian_slim(%20%20%23%20define%20dependencies%0A%20%20%20%20python_version%3D%223.11%22%0A).uv_pip_install(%22torch%3D%3D2.5.1%22%2C%20%22numpy%3D%3D2.1.3%22)%0A%0Awith%20image.imports()%3A%20%20%23%20set%20up%20common%20imports%0A%20%20%20%20import%20torch%0A`,lang:`python`});var O=c(D,4);m(O,{code:`config%20%3D%20%7B%22gpu%22%3A%20%22a10g%22%2C%20%22image%22%3A%20image%7D%0A`,lang:`python`});var k=c(O,10);m(k,{code:`%40app.function(**config)%0Adef%20underutilize(scale%3D1)%3A%0A%20%20%20%20records%20%3D%20%5B%5D%0A%0A%20%20%20%20x%20%3D%20torch.randn(%20%20%23%20%F0%9F%90%8C%202%3A%20not%20enough%20work%20to%20keep%20the%20GPU%20busy%0A%20%20%20%20%20%20%20%20scale%20*%20100%2C%20scale%20*%20100%2C%20device%3D%22cuda%22%0A%20%20%20%20)%0A%0A%20%20%20%20for%20ii%20in%20range(10)%3A%0A%20%20%20%20%20%20%20%20x%20%3D%20x%20%40%20x%0A%0A%20%20%20%20%20%20%20%20class%20Record%3A%20%20%23%20%F0%9F%90%8C%201%3A%20heavy%20Python%20work%20in%20the%20hot%20loop%0A%20%20%20%20%20%20%20%20%20%20%20%20def%20__init__(self%2C%20value)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.value%20%3D%20value%0A%0A%20%20%20%20%20%20%20%20records.append(Record(ii))%0A%0A%20%20%20%20x%5B0%5D%5B0%5D.cpu()%20%20%23%20force%20a%20host%20sync%20for%20accurate%20timing%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`wrapping-a-modal-function-with-a-profiler`,children:(e,t)=>{l(),i(e,r(`Wrapping a Modal Function with a profiler`))},$$slots:{default:!0}});var j=c(A,8);m(j,{code:`%40app.function(volumes%3D%7BTRACE_DIR%3A%20traces%7D%2C%20**config)%0Adef%20profile(%0A%20%20%20%20function%2C%0A%20%20%20%20label%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20steps%3A%20int%20%3D%203%2C%0A%20%20%20%20schedule%3DNone%2C%0A%20%20%20%20record_shapes%3A%20bool%20%3D%20False%2C%0A%20%20%20%20profile_memory%3A%20bool%20%3D%20False%2C%0A%20%20%20%20with_stack%3A%20bool%20%3D%20False%2C%0A%20%20%20%20print_rows%3A%20int%20%3D%200%2C%0A%20%20%20%20**kwargs%2C%0A)%3A%0A%20%20%20%20from%20uuid%20import%20uuid4%0A%0A%20%20%20%20if%20isinstance(function%2C%20str)%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20function%20%3D%20app.registered_functions%5Bfunction%5D%0A%20%20%20%20%20%20%20%20except%20KeyError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(f%22Function%20%7Bfunction%7D%20not%20found%22)%0A%20%20%20%20function_name%20%3D%20function.tag%0A%0A%20%20%20%20output_dir%20%3D%20(%0A%20%20%20%20%20%20%20%20TRACE_DIR%20%2F%20(function_name%20%2B%20(f%22_%7Blabel%7D%22%20if%20label%20else%20%22%22))%20%2F%20str(uuid4())%0A%20%20%20%20)%0A%20%20%20%20output_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20if%20schedule%20is%20None%3A%0A%20%20%20%20%20%20%20%20if%20steps%20%3C%203%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%22Steps%20must%20be%20at%20least%203%20when%20using%20default%20schedule%22)%0A%20%20%20%20%20%20%20%20schedule%20%3D%20%7B%22wait%22%3A%201%2C%20%22warmup%22%3A%201%2C%20%22active%22%3A%20steps%20-%202%2C%20%22repeat%22%3A%200%7D%0A%0A%20%20%20%20schedule%20%3D%20torch.profiler.schedule(**schedule)%0A%0A%20%20%20%20with%20torch.profiler.profile(%0A%20%20%20%20%20%20%20%20activities%3D%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.profiler.ProfilerActivity.CPU%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.profiler.ProfilerActivity.CUDA%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20schedule%3Dschedule%2C%0A%20%20%20%20%20%20%20%20record_shapes%3Drecord_shapes%2C%0A%20%20%20%20%20%20%20%20profile_memory%3Dprofile_memory%2C%0A%20%20%20%20%20%20%20%20with_stack%3Dwith_stack%2C%0A%20%20%20%20%20%20%20%20on_trace_ready%3Dtorch.profiler.tensorboard_trace_handler(output_dir)%2C%0A%20%20%20%20)%20as%20prof%3A%0A%20%20%20%20%20%20%20%20for%20_%20in%20range(steps)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20function.local(**kwargs)%20%20%23%20%3C--%20here%20we%20wrap%20the%20target%20Function%0A%20%20%20%20%20%20%20%20%20%20%20%20prof.step()%0A%0A%20%20%20%20if%20print_rows%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20prof.key_averages().table(sort_by%3D%22cuda_time_total%22%2C%20row_limit%3Dprint_rows)%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20trace_path%20%3D%20sorted(%0A%20%20%20%20%20%20%20%20output_dir.glob(%22**%2F*.pt.trace.json%22)%2C%0A%20%20%20%20%20%20%20%20key%3Dlambda%20pth%3A%20pth.stat().st_mtime%2C%0A%20%20%20%20%20%20%20%20reverse%3DTrue%2C%0A%20%20%20%20)%5B0%5D%0A%0A%20%20%20%20print(f%22trace%20saved%20to%20%7Btrace_path.relative_to(TRACE_DIR)%7D%22)%0A%0A%20%20%20%20return%20trace_path.read_text()%2C%20trace_path.relative_to(TRACE_DIR)%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`triggering-profiled-execution-from-the-command-line-and-viewing-in-perfetto`,children:(e,t)=>{l(),i(e,r(`Triggering profiled execution from the command line and viewing in Perfetto`))},$$slots:{default:!0}});var N=c(M,4);m(N,{code:`modal%20run%20torch_profiling.py%20--function%20underutilize%20--print-rows%2010`,lang:`bash`});var P=c(N,2);m(P,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20function%3A%20str%20%3D%20%22underutilize%22%2C%0A%20%20%20%20label%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A%20%20%20%20steps%3A%20int%20%3D%203%2C%0A%20%20%20%20schedule%3DNone%2C%0A%20%20%20%20record_shapes%3A%20bool%20%3D%20False%2C%0A%20%20%20%20profile_memory%3A%20bool%20%3D%20False%2C%0A%20%20%20%20with_stack%3A%20bool%20%3D%20False%2C%0A%20%20%20%20print_rows%3A%20int%20%3D%2010%2C%0A%20%20%20%20kwargs_json_path%3A%20Optional%5Bstr%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20if%20kwargs_json_path%20is%20not%20None%3A%20%20%23%20use%20to%20pass%20arguments%20to%20function%0A%20%20%20%20%20%20%20%20import%20json%0A%0A%20%20%20%20%20%20%20%20kwargs%20%3D%20json.loads(Path(kwargs_json_path).read_text())%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20kwargs%20%3D%20%7B%7D%0A%0A%20%20%20%20results%2C%20remote_path%20%3D%20profile.remote(%0A%20%20%20%20%20%20%20%20function%2C%0A%20%20%20%20%20%20%20%20label%3Dlabel%2C%0A%20%20%20%20%20%20%20%20steps%3Dsteps%2C%0A%20%20%20%20%20%20%20%20schedule%3Dschedule%2C%0A%20%20%20%20%20%20%20%20record_shapes%3Drecord_shapes%2C%0A%20%20%20%20%20%20%20%20profile_memory%3Dprofile_memory%2C%0A%20%20%20%20%20%20%20%20with_stack%3Dwith_stack%2C%0A%20%20%20%20%20%20%20%20print_rows%3Dprint_rows%2C%0A%20%20%20%20%20%20%20%20**kwargs%2C%0A%20%20%20%20)%0A%0A%20%20%20%20output_path%20%3D%20Path(%22%2Ftmp%22)%20%2F%20remote_path.name%0A%20%20%20%20output_path.write_text(results)%0A%20%20%20%20print(f%22trace%20saved%20locally%20at%20%7Boutput_path%7D%22)%0A%0A`,lang:`python`});var F=c(P,4);g(c(e(F)),{href:`https://ui.perfetto.dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Perfetto UI`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);d(I,{id:`improving-the-performance-of-our-dummy-test-code`,children:(e,t)=>{l(),i(e,r(`Improving the performance of our dummy test code`))},$$slots:{default:!0}});var L=c(I,12);u(L,{id:`serving-tensorboard-on-modal-to-view-pytorch-profiles-and-traces`,children:(e,t)=>{l(),i(e,r(`Serving TensorBoard on Modal to view PyTorch profiles and traces`))},$$slots:{default:!0}});var R=c(L,4);m(R,{code:`tb_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22tensorboard%3D%3D2.18.0%22%2C%20%22torch_tb_profiler%3D%3D0.4.3%22%0A)%0A`,lang:`python`});var z=c(R,2);g(c(e(z)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`host it on Modal`))},$$slots:{default:!0}}),l(3),n(z);var B=c(z,2);g(c(e(B)),{href:`https://peps.python.org/pep-3333/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WSGI Middleware`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);m(V,{code:`class%20VolumeMiddleware%3A%0A%20%20%20%20def%20__init__(self%2C%20app)%3A%0A%20%20%20%20%20%20%20%20self.app%20%3D%20app%0A%0A%20%20%20%20def%20__call__(self%2C%20environ%2C%20start_response)%3A%0A%20%20%20%20%20%20%20%20if%20(route%20%3A%3D%20environ.get(%22PATH_INFO%22))%20in%20%5B%22%2F%22%2C%20%22%2Fmodal-volume-reload%22%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20traces.reload()%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%20while%20re-loading%20traces%3A%20%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20route%20%3D%3D%20%22%2Fmodal-volume-reload%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20environ%5B%22PATH_INFO%22%5D%20%3D%20%22%2F%22%20%20%23%20redirect%0A%20%20%20%20%20%20%20%20return%20self.app(environ%2C%20start_response)%0A%0A`,lang:`python`});var H=c(V,4);m(H,{code:`modal%20deploy%20torch_profiling`,lang:`bash`}),m(c(H,4),{code:`%40app.function(%0A%20%20%20%20volumes%3D%7BTRACE_DIR%3A%20traces%7D%2C%0A%20%20%20%20image%3Dtb_image%2C%0A%20%20%20%20max_containers%3D1%2C%20%20%23%20single%20replica%0A%20%20%20%20scaledown_window%3D5%20*%2060%2C%20%20%23%20five%20minute%20idle%20time%0A)%0A%40modal.concurrent(max_inputs%3D100)%20%20%23%20100%20concurrent%20request%20threads%0A%40modal.wsgi_app()%0Adef%20tensorboard()%3A%0A%20%20%20%20import%20tensorboard%0A%0A%20%20%20%20board%20%3D%20tensorboard.program.TensorBoard()%0A%20%20%20%20board.configure(logdir%3Dstr(TRACE_DIR))%0A%20%20%20%20(data_provider%2C%20deprecated_multiplexer)%20%3D%20board._make_data_provider()%0A%20%20%20%20wsgi_app%20%3D%20tensorboard.backend.application.TensorBoardWSGIApp(%0A%20%20%20%20%20%20%20%20board.flags%2C%0A%20%20%20%20%20%20%20%20board.plugin_loaders%2C%0A%20%20%20%20%20%20%20%20data_provider%2C%0A%20%20%20%20%20%20%20%20board.assets_zip_provider%2C%0A%20%20%20%20%20%20%20%20deprecated_multiplexer%2C%0A%20%20%20%20%20%20%20%20experimental_middlewares%3D%5BVolumeMiddleware%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20wsgi_app._create_wsgi_app()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,_ as metadata};
//# sourceMappingURL=CFhYetbr.js.map
