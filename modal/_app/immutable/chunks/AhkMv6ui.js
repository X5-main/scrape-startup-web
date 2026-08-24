(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`df8eab3a-c62c-4cdb-952f-52a4104ab698`,e._sentryDebugIdIdentifier=`sentry-dbid-df8eab3a-c62c-4cdb-952f-52a4104ab698`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Render a video with Blender on many GPUs or CPUs in parallel`,id:`render-a-video-with-blender-on-many-gpus-or-cpus-in-parallel`,children:[{depth:2,value:`Defining a Modal app`,id:`defining-a-modal-app`},{depth:2,value:`Rendering a single frame`,id:`rendering-a-single-frame`,children:[{depth:3,value:`Rendering with acceleration`,id:`rendering-with-acceleration`}]},{depth:2,value:`Combining frames into a video`,id:`combining-frames-into-a-video`},{depth:2,value:`Rendering in parallel in the cloud from the comfort of the command line`,id:`rendering-in-parallel-in-the-cloud-from-the-comfort-of-the-command-line`}]}],rawContent:`# Render a video with Blender on many GPUs or CPUs in parallel

This example shows how you can render an animated 3D scene using
[Blender](https://www.blender.org/)'s Python interface.

You can run it on CPUs to scale out on one hundred containers
or run it on GPUs to get higher throughput per node.
Even for this simple scene, GPUs render >10x faster than CPUs.

The final render looks something like this:

<center>
<video controls autoplay loop muted>
<source src="https://modal-cdn.com/modal-blender-video.mp4" type="video/mp4">
</video>
</center>

## Defining a Modal app

\`\`\`python
from pathlib import Path

import modal

\`\`\`

Modal runs your Python functions for you in the cloud.
You organize your code into apps, collections of functions that work together.

\`\`\`python
app = modal.App("example-blender-video")

\`\`\`

We need to define the environment each function runs in --  its container image.
The block below defines a container image, starting from a basic Debian Linux image
adding Blender's system-level dependencies
and then installing the \`bpy\` package, which is Blender's Python API.

\`\`\`python
rendering_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("xorg", "libxkbcommon0")  # X11 (Unix GUI) dependencies
    .uv_pip_install("bpy==4.5.0")  # Blender as a Python package
)

\`\`\`

## Rendering a single frame

We define a function that renders a single frame. We'll scale this function out on Modal later.

Functions in Modal are defined along with their hardware and their dependencies.
This function can be run with GPU acceleration or without it, and we'll use a global flag in the code to switch between the two.

\`\`\`python
WITH_GPU = (
    True  # try changing this to False to run rendering massively in parallel on CPUs!
)

\`\`\`

We decorate the function with \`@app.function\` to define it as a Modal function.
Note that in addition to defining the hardware requirements of the function,
we also specify the container image that the function runs in (the one we defined above).

The details of the scene aren't too important for this example, but we'll load
a .blend file that we created earlier. This scene contains a rotating
Modal logo made of a transmissive ice-like material, with a generated displacement map. The
animation keyframes were defined in Blender.

\`\`\`python
@app.function(
    gpu="L40S" if WITH_GPU else None,
    # default limits on Modal free tier
    max_containers=10 if WITH_GPU else 100,
    image=rendering_image,
)
def render(blend_file: bytes, frame_number: int = 0) -> bytes:
    """Renders the n-th frame of a Blender file as a PNG."""
    import bpy

    input_path = "/tmp/input.blend"
    output_path = f"/tmp/output-{frame_number}.png"

    # Blender requires input as a file.
    Path(input_path).write_bytes(blend_file)

    bpy.ops.wm.open_mainfile(filepath=input_path)
    bpy.context.scene.frame_set(frame_number)
    bpy.context.scene.render.filepath = output_path
    configure_rendering(bpy.context, with_gpu=WITH_GPU)
    bpy.ops.render.render(write_still=True)

    # Blender renders image outputs to a file as well.
    return Path(output_path).read_bytes()


\`\`\`

### Rendering with acceleration

We can configure the rendering process to use GPU acceleration with NVIDIA CUDA.
We select the [Cycles rendering engine](https://www.cycles-renderer.org/), which is compatible with CUDA,
and then activate the GPU.

\`\`\`python
def configure_rendering(ctx, with_gpu: bool):
    # configure the rendering process
    ctx.scene.render.engine = "CYCLES"
    ctx.scene.render.resolution_x = 3000
    ctx.scene.render.resolution_y = 2000
    ctx.scene.render.resolution_percentage = 50
    ctx.scene.cycles.samples = 128

    cycles = ctx.preferences.addons["cycles"]

    # Use GPU acceleration if available.
    if with_gpu:
        cycles.preferences.compute_device_type = "CUDA"
        ctx.scene.cycles.device = "GPU"

        # reload the devices to update the configuration
        cycles.preferences.get_devices()
        for device in cycles.preferences.devices:
            device.use = True

    else:
        ctx.scene.cycles.device = "CPU"

    # report rendering devices -- a nice snippet for debugging and ensuring the accelerators are being used
    for dev in cycles.preferences.devices:
        print(f"ID:{dev['id']} Name:{dev['name']} Type:{dev['type']} Use:{dev['use']}")


\`\`\`

## Combining frames into a video

Rendering 3D images is fun, and GPUs can make it faster, but rendering 3D videos is better!
We add another function to our app, running on a different, simpler container image
and different hardware, to combine the frames into a video.

\`\`\`python
combination_image = modal.Image.debian_slim(python_version="3.11").apt_install("ffmpeg")

\`\`\`

The function to combine the frames into a video takes a sequence of byte sequences, one for each rendered frame,
and converts them into a single sequence of bytes, the MP4 file.

\`\`\`python
@app.function(image=combination_image)
def combine(frames_bytes: list[bytes], fps: int = 60) -> bytes:
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as tmpdir:
        for i, frame_bytes in enumerate(frames_bytes):
            frame_path = Path(tmpdir) / f"frame_{i:05}.png"
            frame_path.write_bytes(frame_bytes)
        out_path = Path(tmpdir) / "output.mp4"
        subprocess.run(
            f"ffmpeg -framerate {fps} -pattern_type glob -i '{tmpdir}/*.png' -c:v libx264 -pix_fmt yuv420p {out_path}",
            shell=True,
        )
        return out_path.read_bytes()


\`\`\`

## Rendering in parallel in the cloud from the comfort of the command line

With these two functions defined, we need only a few more lines to run our rendering at scale on Modal.

First, we need a function that coordinates our functions to \`render\` frames and \`combine\` them.
We decorate that function with \`@app.local_entrypoint\` so that we can run it with \`modal run blender_video.py\`.

In that function, we use \`render.map\` to map the \`render\` function over the range of frames.

We give the \`local_entrypoint\` two parameters to control the render -- the number of frames to render and how many frames to skip.
These demonstrate a basic pattern for controlling Functions on Modal from a local client.

We collect the bytes from each frame into a \`list\` locally and then send it to \`combine\` with \`.remote\`.

The bytes for the video come back to our local machine, and we write them to a file.

The whole rendering process (for four seconds of 1080p 60 FPS video) takes about three minutes to run on 10 L40S GPUs,
with a per-frame latency of about six seconds, and about five minutes to run on 100 CPUs, with a per-frame latency of about one minute.

\`\`\`python
@app.local_entrypoint()
def main(frame_count: int = 250, frame_skip: int = 1):
    output_directory = Path("/tmp") / "render"
    output_directory.mkdir(parents=True, exist_ok=True)

    input_path = Path(__file__).parent / "IceModal.blend"
    blend_bytes = input_path.read_bytes()
    args = [(blend_bytes, frame) for frame in range(1, frame_count + 1, frame_skip)]
    images = list(render.starmap(args))
    for i, image in enumerate(images):
        frame_path = output_directory / f"frame_{i + 1}.png"
        frame_path.write_bytes(image)
        print(f"Frame saved to {frame_path}")

    video_path = output_directory / "output.mp4"
    video_bytes = combine.remote(images)
    video_path.write_bytes(video_bytes)
    print(f"Video saved to {video_path}")

\`\`\`
`,meta:{title:`Render a video with Blender on many GPUs or CPUs in parallel`,description:`This example shows how you can render an animated 3D scene using Blender’s Python interface.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>This example shows how you can render an animated 3D scene using <!>’s Python interface.</p> <p>You can run it on CPUs to scale out on one hundred containers
or run it on GPUs to get higher throughput per node.
Even for this simple scene, GPUs render >10x faster than CPUs.</p> <p>The final render looks something like this:</p> <center><video controls autoplay loop><source src="https://modal-cdn.com/modal-blender-video.mp4" type="video/mp4"/></video></center> <!> <!> <p>Modal runs your Python functions for you in the cloud.
You organize your code into apps, collections of functions that work together.</p> <!> <p>We need to define the environment each function runs in —  its container image.
The block below defines a container image, starting from a basic Debian Linux image
adding Blender’s system-level dependencies
and then installing the <code>bpy</code> package, which is Blender’s Python API.</p> <!> <!> <p>We define a function that renders a single frame. We’ll scale this function out on Modal later.</p> <p>Functions in Modal are defined along with their hardware and their dependencies.
This function can be run with GPU acceleration or without it, and we’ll use a global flag in the code to switch between the two.</p> <!> <p>We decorate the function with <code>@app.function</code> to define it as a Modal function.
Note that in addition to defining the hardware requirements of the function,
we also specify the container image that the function runs in (the one we defined above).</p> <p>The details of the scene aren’t too important for this example, but we’ll load
a .blend file that we created earlier. This scene contains a rotating
Modal logo made of a transmissive ice-like material, with a generated displacement map. The
animation keyframes were defined in Blender.</p> <!> <!> <p>We can configure the rendering process to use GPU acceleration with NVIDIA CUDA.
We select the <!>, which is compatible with CUDA,
and then activate the GPU.</p> <!> <!> <p>Rendering 3D images is fun, and GPUs can make it faster, but rendering 3D videos is better!
We add another function to our app, running on a different, simpler container image
and different hardware, to combine the frames into a video.</p> <!> <p>The function to combine the frames into a video takes a sequence of byte sequences, one for each rendered frame,
and converts them into a single sequence of bytes, the MP4 file.</p> <!> <!> <p>With these two functions defined, we need only a few more lines to run our rendering at scale on Modal.</p> <p>First, we need a function that coordinates our functions to <code>render</code> frames and <code>combine</code> them.
We decorate that function with <code>@app.local_entrypoint</code> so that we can run it with <code>modal run blender_video.py</code>.</p> <p>In that function, we use <code>render.map</code> to map the <code>render</code> function over the range of frames.</p> <p>We give the <code>local_entrypoint</code> two parameters to control the render — the number of frames to render and how many frames to skip.
These demonstrate a basic pattern for controlling Functions on Modal from a local client.</p> <p>We collect the bytes from each frame into a <code>list</code> locally and then send it to <code>combine</code> with <code>.remote</code>.</p> <p>The bytes for the video come back to our local machine, and we write them to a file.</p> <p>The whole rendering process (for four seconds of 1080p 60 FPS video) takes about three minutes to run on 10 L40S GPUs,
with a per-frame latency of about six seconds, and about five minutes to run on 100 CPUs, with a per-frame latency of about one minute.</p> <!>`,3);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`render-a-video-with-blender-on-many-gpus-or-cpus-in-parallel`,children:(e,t)=>{l(),i(e,r(`Render a video with Blender on many GPUs or CPUs in parallel`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://www.blender.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Blender`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6),v=e(_);v.muted=!0,n(_);var y=c(_,2);u(y,{id:`defining-a-modal-app`,children:(e,t)=>{l(),i(e,r(`Defining a Modal app`))},$$slots:{default:!0}});var x=c(y,2);p(x,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var S=c(x,4);p(S,{code:`app%20%3D%20modal.App(%22example-blender-video%22)%0A`,lang:`python`});var C=c(S,4);p(C,{code:`rendering_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22xorg%22%2C%20%22libxkbcommon0%22)%20%20%23%20X11%20(Unix%20GUI)%20dependencies%0A%20%20%20%20.uv_pip_install(%22bpy%3D%3D4.5.0%22)%20%20%23%20Blender%20as%20a%20Python%20package%0A)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`rendering-a-single-frame`,children:(e,t)=>{l(),i(e,r(`Rendering a single frame`))},$$slots:{default:!0}});var T=c(w,6);p(T,{code:`WITH_GPU%20%3D%20(%0A%20%20%20%20True%20%20%23%20try%20changing%20this%20to%20False%20to%20run%20rendering%20massively%20in%20parallel%20on%20CPUs!%0A)%0A`,lang:`python`});var E=c(T,6);p(E,{code:`%40app.function(%0A%20%20%20%20gpu%3D%22L40S%22%20if%20WITH_GPU%20else%20None%2C%0A%20%20%20%20%23%20default%20limits%20on%20Modal%20free%20tier%0A%20%20%20%20max_containers%3D10%20if%20WITH_GPU%20else%20100%2C%0A%20%20%20%20image%3Drendering_image%2C%0A)%0Adef%20render(blend_file%3A%20bytes%2C%20frame_number%3A%20int%20%3D%200)%20-%3E%20bytes%3A%0A%20%20%20%20%22%22%22Renders%20the%20n-th%20frame%20of%20a%20Blender%20file%20as%20a%20PNG.%22%22%22%0A%20%20%20%20import%20bpy%0A%0A%20%20%20%20input_path%20%3D%20%22%2Ftmp%2Finput.blend%22%0A%20%20%20%20output_path%20%3D%20f%22%2Ftmp%2Foutput-%7Bframe_number%7D.png%22%0A%0A%20%20%20%20%23%20Blender%20requires%20input%20as%20a%20file.%0A%20%20%20%20Path(input_path).write_bytes(blend_file)%0A%0A%20%20%20%20bpy.ops.wm.open_mainfile(filepath%3Dinput_path)%0A%20%20%20%20bpy.context.scene.frame_set(frame_number)%0A%20%20%20%20bpy.context.scene.render.filepath%20%3D%20output_path%0A%20%20%20%20configure_rendering(bpy.context%2C%20with_gpu%3DWITH_GPU)%0A%20%20%20%20bpy.ops.render.render(write_still%3DTrue)%0A%0A%20%20%20%20%23%20Blender%20renders%20image%20outputs%20to%20a%20file%20as%20well.%0A%20%20%20%20return%20Path(output_path).read_bytes()%0A%0A`,lang:`python`});var D=c(E,2);d(D,{id:`rendering-with-acceleration`,children:(e,t)=>{l(),i(e,r(`Rendering with acceleration`))},$$slots:{default:!0}});var O=c(D,2);h(c(e(O)),{href:`https://www.cycles-renderer.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cycles rendering engine`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);p(k,{code:`def%20configure_rendering(ctx%2C%20with_gpu%3A%20bool)%3A%0A%20%20%20%20%23%20configure%20the%20rendering%20process%0A%20%20%20%20ctx.scene.render.engine%20%3D%20%22CYCLES%22%0A%20%20%20%20ctx.scene.render.resolution_x%20%3D%203000%0A%20%20%20%20ctx.scene.render.resolution_y%20%3D%202000%0A%20%20%20%20ctx.scene.render.resolution_percentage%20%3D%2050%0A%20%20%20%20ctx.scene.cycles.samples%20%3D%20128%0A%0A%20%20%20%20cycles%20%3D%20ctx.preferences.addons%5B%22cycles%22%5D%0A%0A%20%20%20%20%23%20Use%20GPU%20acceleration%20if%20available.%0A%20%20%20%20if%20with_gpu%3A%0A%20%20%20%20%20%20%20%20cycles.preferences.compute_device_type%20%3D%20%22CUDA%22%0A%20%20%20%20%20%20%20%20ctx.scene.cycles.device%20%3D%20%22GPU%22%0A%0A%20%20%20%20%20%20%20%20%23%20reload%20the%20devices%20to%20update%20the%20configuration%0A%20%20%20%20%20%20%20%20cycles.preferences.get_devices()%0A%20%20%20%20%20%20%20%20for%20device%20in%20cycles.preferences.devices%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20device.use%20%3D%20True%0A%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20ctx.scene.cycles.device%20%3D%20%22CPU%22%0A%0A%20%20%20%20%23%20report%20rendering%20devices%20--%20a%20nice%20snippet%20for%20debugging%20and%20ensuring%20the%20accelerators%20are%20being%20used%0A%20%20%20%20for%20dev%20in%20cycles.preferences.devices%3A%0A%20%20%20%20%20%20%20%20print(f%22ID%3A%7Bdev%5B'id'%5D%7D%20Name%3A%7Bdev%5B'name'%5D%7D%20Type%3A%7Bdev%5B'type'%5D%7D%20Use%3A%7Bdev%5B'use'%5D%7D%22)%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`combining-frames-into-a-video`,children:(e,t)=>{l(),i(e,r(`Combining frames into a video`))},$$slots:{default:!0}});var j=c(A,4);p(j,{code:`combination_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).apt_install(%22ffmpeg%22)%0A`,lang:`python`});var M=c(j,4);p(M,{code:`%40app.function(image%3Dcombination_image)%0Adef%20combine(frames_bytes%3A%20list%5Bbytes%5D%2C%20fps%3A%20int%20%3D%2060)%20-%3E%20bytes%3A%0A%20%20%20%20import%20subprocess%0A%20%20%20%20import%20tempfile%0A%0A%20%20%20%20with%20tempfile.TemporaryDirectory()%20as%20tmpdir%3A%0A%20%20%20%20%20%20%20%20for%20i%2C%20frame_bytes%20in%20enumerate(frames_bytes)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20frame_path%20%3D%20Path(tmpdir)%20%2F%20f%22frame_%7Bi%3A05%7D.png%22%0A%20%20%20%20%20%20%20%20%20%20%20%20frame_path.write_bytes(frame_bytes)%0A%20%20%20%20%20%20%20%20out_path%20%3D%20Path(tmpdir)%20%2F%20%22output.mp4%22%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22ffmpeg%20-framerate%20%7Bfps%7D%20-pattern_type%20glob%20-i%20'%7Btmpdir%7D%2F*.png'%20-c%3Av%20libx264%20-pix_fmt%20yuv420p%20%7Bout_path%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20out_path.read_bytes()%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`rendering-in-parallel-in-the-cloud-from-the-comfort-of-the-command-line`,children:(e,t)=>{l(),i(e,r(`Rendering in parallel in the cloud from the comfort of the command line`))},$$slots:{default:!0}}),p(c(N,16),{code:`%40app.local_entrypoint()%0Adef%20main(frame_count%3A%20int%20%3D%20250%2C%20frame_skip%3A%20int%20%3D%201)%3A%0A%20%20%20%20output_directory%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22render%22%0A%20%20%20%20output_directory.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20input_path%20%3D%20Path(__file__).parent%20%2F%20%22IceModal.blend%22%0A%20%20%20%20blend_bytes%20%3D%20input_path.read_bytes()%0A%20%20%20%20args%20%3D%20%5B(blend_bytes%2C%20frame)%20for%20frame%20in%20range(1%2C%20frame_count%20%2B%201%2C%20frame_skip)%5D%0A%20%20%20%20images%20%3D%20list(render.starmap(args))%0A%20%20%20%20for%20i%2C%20image%20in%20enumerate(images)%3A%0A%20%20%20%20%20%20%20%20frame_path%20%3D%20output_directory%20%2F%20f%22frame_%7Bi%20%2B%201%7D.png%22%0A%20%20%20%20%20%20%20%20frame_path.write_bytes(image)%0A%20%20%20%20%20%20%20%20print(f%22Frame%20saved%20to%20%7Bframe_path%7D%22)%0A%0A%20%20%20%20video_path%20%3D%20output_directory%20%2F%20%22output.mp4%22%0A%20%20%20%20video_bytes%20%3D%20combine.remote(images)%0A%20%20%20%20video_path.write_bytes(video_bytes)%0A%20%20%20%20print(f%22Video%20saved%20to%20%7Bvideo_path%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=AhkMv6ui.js.map
