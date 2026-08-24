(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`aeca7901-08b2-4530-8f31-5bea97d9babe`,e._sentryDebugIdIdentifier=`sentry-dbid-aeca7901-08b2-4530-8f31-5bea97d9babe`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Run FLUX.1-dev three times faster`,description:`Price, performance, and control: pick three.`,authors:[{name:`Will Shainin`,avatarUrl:`https://modal-cdn.com/will-shainin.jpg`,jobTitle:`ML Engineer`,twitterHandle:`Will_Modal`},{name:`David Wang`,avatarUrl:`https://modal-cdn.com/cdnbot/david_wang_headshotgylhrfss_85189999.webp`,jobTitle:`ML Perf Engineer`,twitterHandle:`_dcw02`},{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`Developer Advocate`,twitterHandle:`charles_irl`}],date:`2025-06-18T09:00:00.000Z`,length:`10 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:3,value:`tl;dr: 1.5x from optimizing compiler and hardware awareness, 2x from approximate caching`,id:`tldr-15x-from-optimizing-compiler-and-hardware-awareness-2x-from-approximate-caching`},{depth:2,value:`Implement the baseline`,id:`implement-the-baseline`},{depth:2,value:`Apply standard optimizations for a 1.5x speedup`,id:`apply-standard-optimizations-for-a-15x-speedup`,children:[{depth:3,value:`Optimize the compute graph with the Torch compiler`,id:`optimize-the-compute-graph-with-the-torch-compiler`},{depth:3,value:`Expose more parallelism to the GPU with fused QKV`,id:`expose-more-parallelism-to-the-gpu-with-fused-qkv`},{depth:3,value:`Improve data locality with channels-last memory layout`,id:`improve-data-locality-with-channels-last-memory-layout`},{depth:3,value:`Putting it all together, we get a 1.5x speedup`,id:`putting-it-all-together-we-get-a-15x-speedup`}]},{depth:2,value:`Apply vibes-based approximate caching for another 2x speedup`,id:`apply-vibes-based-approximate-caching-for-another-2x-speedup`},{depth:2,value:`Cut cold start latency by 30x with caches and snapshots`,id:`cut-cold-start-latency-by-30x-with-caches-and-snapshots`},{depth:2,value:`Serve AI models at scale with Modal`,id:`serve-ai-models-at-scale-with-modal`}],rawContent:`<div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4">
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4" />
</video>
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-full-animation.mp4" type="video/mp4" />
</video>
</div>

The era of “get your AI from an API” is rapidly coming to a close.

High-quality open weights models and high-performance open source software together mean that you can easily run your own API to generate [images](/solutions/image-and-video) or [music](/solutions/audio) or [text](/solutions/llm), with all the control and customization self-hosting affords.

But having the ability to run your own generative inference raises a bunch of questions: when does it make sense, how do you do it, and, importantly, how do you do it with the same performance and quality that proprietary generative APIs provide?

We recently shared [our results and recommendations for running your own LLM inference](/llm-almanac/summary). But we also like media generative models, and optimizations look quite different. Where LLM inference is all about finding the right high-level framework and tuning the knobs, diffusion-based models of images require getting a lot closer to the metal.

In this blog post, we walk through how we made running the popular [FLUX.1-dev model](https://huggingface.co/black-forest-labs/FLUX.1-dev) by Black Forest Labs as an autoscaling service on Modal competitive with proprietary providers on speed and price by running the inference three times faster and speeding up cold boots. You can find the code [here](https://github.com/modal-labs/modal-examples/blob/b5fbb047905382a611cb21d45aa6ddd631a1f15d/misc/flux_endpoint.py).

### tl;dr: 1.5x from optimizing compiler and hardware awareness, 2x from approximate caching

We determined that in order to be competitive with APIs serving FLUX.1-dev images, we needed to return results in under three seconds.

Applying the “standard” optimizations (running the Torch compiler, switching the data layout, and fusing the QKV calculation) got us halfway to the target.

Then we applied a fun, approximate activation caching technique, First Block Caching, and cut the latency in half again.

![](https://modal-cdn.com/blog/images/flux-3x-faster-full-results-1.webp)

## Implement the baseline

Before beginning to improve performance, you need to first measure the current performance cleanly.

We start with the standard Hugging Face \`diffusers\` library and create our \`FluxPipeline\` in 16bit precision.

\`\`\`python
self.pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-dev",
    torch_dtype=torch.bfloat16,
    use_safetensors=True,
)
\`\`\`

Averaging across a variety of inputs, we find that we can generate a 1024x1024 image in ~6.75 seconds.

<div class="flex flex-wrap sm:flex-nowrap justify-center items-center gap-4">
<video controls autoplay loop muted playsinline class="w-1/2 sm:w-1/3 h-auto max-h-[600px] object-contain">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4">
</video>
<img src="https://modal-cdn.com/blog/images/flux-3x-faster-baseline-results.webp" class="w-full sm:w-2/3 h-auto max-h-[600px] object-contain" alt="A chart depicting a baseline latency of 6761 ms">
</div>

## Apply standard optimizations for a 1.5x speedup

We started by applying a bunch of “standard” optimizations — using Torch’s optimizing compiler; fusing the query, key, and value computations in the Transformer attention; and using the “channels last” memory layout. These are nearly always a good idea.

### **Optimize the compute graph with the Torch compiler**

What is a PyTorch program really? By default, PyTorch constructs a compute graph of tensor operations dynamically in Python and runs it eagerly. This “virtual compute graph” is executed on the host/CPU and triggers execution of a “real compute graph” on the device/GPU. If you’re curious how this works, we recommend [generating some PyTorch traces](/docs/examples/torch_profiling) and examining them.

Graph representations of programs are really nice for program transformations. Back in the BC era (Before ChatGPT), most people used PyTorch to train their own neural networks, and the key program transformation was running the program backwards to figure out how to make it less wrong, aka “[learning representations by back-propagating errors](https://www.nature.com/articles/323533a0)”.

Now that, like neural networks themselves, PyTorch is used more for inference, the key program transformation has changed to _compilation_. Compilation replaces the compute graph with an equivalent but faster one. If you’re familiar with database query compilers, think of logical-logical optimization transformations like predicate pushdown.

As with any respectable modern compiler, the Torch compiler operates as a series of lowerings into increasingly concrete intermediate representations. [TorchDynamo](https://docs.pytorch.org/docs/stable/torch.compiler_dynamo_overview.html) hooks the CPython frame interpreter, traces Python bytecode, and carves out stretches of Tensor operations into lowered [“FX” graphs](https://docs.pytorch.org/docs/stable/fx.html#torch.fx.Graph). A backend compiler like [TorchInductor](https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-symbolic-shapes/747) then takes these graphs and lowers them to a further optimized representation, like a [Triton](https://github.com/triton-lang/triton) kernel.

We separately compile the model’s two large subcomponents (the Transformer and the Variational Autoencoder). Our configuration settings appear in the code snippet below. We got many of them from [this excellent guide](http://huggingface.co/docs/diffusers/en/tutorials/fast_diffusion) on Hugging Face and did some light validation before adjusting other parameters.

The most notable choice is to use \`max-autotune\`, which incurs tens of minutes of compile-time cost but ensures optimal run-time performance. See the final section for details on how we cut that back down to minutes without losing Modal’s transparent auto-scaling.

\`\`\`python
class Flux:
    ...

    @modal.enter()
    def setup(self):
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev",
            torch_dtype=torch.bfloat16,
            use_safetensors=True,
        )
        # torch.compile configuration
        config = torch._inductor.config
        config.conv_1x1_as_mm = True
        config.coordinate_descent_check_all_directions = True
        config.coordinate_descent_tuning = True
        config.disable_progress = False
        config.epilogue_fusion = False
        config.shape_padding = True

        # Mark layers for compilation with dynamic shapes enabled.
        self.pipe.transformer = torch.compile(
            self.pipe.transformer, mode="max-autotune-no-cudagraphs", dynamic=True
        )

        self.pipe.vae.decode = torch.compile(
            self.pipe.vae.decode, mode="max-autotune-no-cudagraphs", dynamic=True
        )
        # Trigger torch compile
        self.pipe("dummy prompt", height=1024, width=1024, num_images_per_prompt=1)
        ...
\`\`\`

### Expose more parallelism to the GPU with fused QKV

FLUX includes a big Transformer model. The Transformer architecture’s signature component is the attention block, which transmits information between text and image and [through internal circuits](https://transformer-circuits.pub/). They are usually written in terms of three separate matrix multiplications between the block’s input matrix \`X\` and its weight matrices \`W_q\`, \`W_k\`, and \`W_v\`.

If we concatenate the three weight matrices, we can perform the attention calculation as one large matrix multiplication: (\`QKV = X @ W_qkv\`). This exposes more of the parallelism in the operation to the lowered representations. In particular, \`X\` is the same matrix for the entire multiplication, not three variable references that ~~we totally promise~~ the Torch compiler must verify are to the exact same data.

\`\`\`python
class Flux:
    ...
    @modal.enter()
    def setup(self):
        ...
        self.pipe.transformer.fuse_qkv_projections()
        self.pipe.vae.fuse_qkv_projections()
        ...
\`\`\`

### Improve data locality with channels-last memory layout

The last standard optimization we do is a common recommendation to improve data locality.

Tensors are spicy multi-dimensional arrays. Tensors representing images (or feature maps over images) have three dimensions: channel (color), height (y position) and width (x position). This three-dimensional array needs to be mapped onto linear computer memory.

By default, PyTorch orders image Tensors in memory by channel first, then by height, then by width (\`CHW\` or “Channels First”). Sequential accesses therefore read spatially nearby values from a single channel/color.

Let’s walk through an example. This image

\`\`\`
// a 2x4 image with three channels of one byte each
┌────────┬────────┬────────┬────────┐
│ #888888│ #999999│ #AAAAAA│ #BBBBBB│
├────────┼────────┼────────┼────────┤
│ #CCCCCC│ #DDDDDD│ #EEEEEE│ #FFFFFF│
└────────┴────────┴────────┴────────┘
\`\`\`

is represented in memory in \`CHW\` format as

\`\`\`
// channels first
0x00 : 88 99 AA BB  CC DD EE FF   ← 🟥 red values
0x0F : 88 99 AA BB  CC DD EE FF   ← 🟩 green values
0x17 : 88 99 AA BB  CC DD EE FF   ← 🟦 blue values
\`\`\`

But many operations in neural networks, like convolutions, are global across channels and local in space. That means we usually want to access all channels at a particular set of positions, and so we want channels to be _last_.

\`\`\`
// channels last
0x00 : 88 88 88   🟥 🟩 🟦
0x03 : 99 99 99   🟥 🟩 🟦
0x06 : AA AA AA   🟥 🟩 🟦
0x09 : BB BB BB   🟥 🟩 🟦
0x0C : CC CC CC   🟥 🟩 🟦
0x0F : DD DD DD   🟥 🟩 🟦
0x12 : EE EE EE   🟥 🟩 🟦
0x15 : FF FF FF   🟥 🟩 🟦
\`\`\`

You can convert PyTorch models into this format with the \`memory_format\` argument.

\`\`\`python
class Flux:
    ...
    @modal.enter()
    def setup(self):
        ...
        self.pipe.transformer.to(memory_format=torch.channels_last)
        self.pipe.vae.to(memory_format=torch.channels_last)
        ...
\`\`\`

### Putting it all together, we get a 1.5x speedup

The performance improvement of these optimizations in aggregate is about 1.5x, driven mostly by the Torch compiler.

![flux-3x-faster-std-opt-results.png](https://modal-cdn.com/blog/images/flux-3x-faster-std-opt-results.webp)

This speedup is definitely respectable, as evidenced by the animation below, which shows the evolution of the image across denoising steps, rendered at the same rate those steps execute for the two methods.

<div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4">
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4" />
</video>
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-std-opt-animation.mp4" type="video/mp4" />
</video>
</div>

## Apply ~~vibes-based~~ approximate caching for another 2x speedup

Applying the “standard” optimizations above is pretty straightforward and ends up being an appealing point on the engineering effort/performance curve. But we needed to go further on performance, so we needed to go deeper.

Diffusion models generate images iteratively, turning noise into art, one step at a time. That’s the process we’re showing in these animations. If you look closely you can see that during some steps, the image doesn’t change much at all.

<center>
<video controls autoplay loop muted playsinline class="w-2/3 sm:w-1/2">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4" />
</video>
</center>

As it turns out, if you’re willing to tolerate some slight changes in the results, you can skip those steps entirely!

This is an important difference between neural networks and other programs. With neural networks, you can often remove chunks or skip steps, and the program still runs, and does “almost” the same thing. More like an analog computer than a digital one!

We used the “first block caching” technique and implementation from the [ParaAttention repo](https://github.com/chengzeyi/ParaAttention), itself based on the approach from the [TEACache paper](https://liewfeng.github.io/TeaCache/). The basic idea is to start running the model for a timestep. If, partway through the model’s forward pass (after the “first block”), it looks like there won’t be a large change, you skip the step.

\`\`\`python
class Flux:
    ...
    @modal.enter()
    def setup(self):
        ...
        from para_attn.first_block_cache.diffusers_adapters import apply_cache_on_pipe
        apply_cache_on_pipe(
            self.pipe,
            residual_diff_threshold=0.12,
            # quality degraded too much at higher thresholds
        )
\`\`\`

The definition of “large” is a tunable parameter, where higher values lead to larger changes in model behavior but faster execution. This allows for a smoother tradeoff between performance improvement and quality degradation than other techniques that do the same, like quantization.

We got a 2x speedup with a threshold of \`0.12\` and images looked better than with the default of \`0.08\`, so we stuck with it.

![flux-3x-faster-full-results.png](https://modal-cdn.com/blog/images/flux-3x-faster-full-results-1.webp)

<div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4">
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-std-opt-animation.mp4" type="video/mp4" />
</video>
<video autoplay loop muted playsinline class="max-w-[45%] h-auto">
<source src="https://modal-cdn.com/blog/videos/flux-3x-faster-full-animation.mp4" type="video/mp4" />
</video>
</div>

## Cut cold start latency by 30x with caches and snapshots

As we optimized inference, we took an _enormous_ hit on boot time — from seconds to tens of minutes.

Boot time matters for cost and speed as well. If boots are fast, you can run only as many replicas as you need to satisfy current demand and still hit your latency objectives.

This is something we think is very critical, and we spend a lot of time optimizing this at Modal! You can read more about why we think this is so important for generative applications in our [GPU utilization](/blog/gpu-utilization-guide) explainer and our [case study with Suno](/blog/suno-case-study).

The primary culprit is the Torch compiler, and specifically \`max-autotune\`, which profiles multiple implementations at compile time to find the fastest one.

This is a classic use case for a cache — compute-intensive work that produces serializable artifacts. Torch Compile offers both piece-wise caching of smaller artifacts, like compiled Triton kernels, and a “megacache” that stores entire cached compute graphs. We used both, but the megacache didn’t offer a large speedup. It didn’t hurt either, and it’s a new feature we expect to improve over time, so we left it in. You can find the details [here](https://github.com/modal-labs/modal-examples/blob/b5fbb047905382a611cb21d45aa6ddd631a1f15d/misc/flux_endpoint.py#L225-L230).

We also shave off a few seconds using Modal’s [Memory Snapshots](/docs/guide/memory-snapshots), which lets us turn the many file reads and code execution in \`import torch\` and \`from_pretrained\` into a single file read (for every invocation after the first). Check out [this blog post](/blog/mem-snapshots) for a deep dive.

\`\`\`python
image = image.env(
	{
        "TORCHINDUCTOR_FX_GRAPH_CACHE": "1",
        "CUDA_CACHE_PATH": "/cache/.nv_cache",
        "TORCHINDUCTOR_CACHE_DIR": "/cache/.inductor_cache",
        "TRITON_CACHE_DIR": "/cache/.triton_cache",
	}
)

CACHE_VOLUME = modal.Volume.from_name("cache_volume", create_if_missing=True)

@app.cls(
    enable_memory_snapshot=True,
    volumes={"/cache": CACHE_VOLUME}
    ...
)
class Flux:
    @modal.enter(snap=True)
    def load(self):
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev",
            torch_dtype=torch.bfloat16,
            use_safetensors=True,
        ).to("cpu")

    @modal.enter(snap=False)
    def setup(self):
        self.pipe.to("cuda")
        ... # rest of setup
\`\`\`

## Serve AI models at scale with Modal

Together, these optimizations cut FLUX.1-dev serving latency to match the performance of proprietary serving APIs. On Modal, that means you can match or beat providers on price too.

We didn’t talk too much about all the other problems that come up when building and serving a generative API — interactive development, handling bursty loads, and training/evaluating the next iteration of the service. If that’s interesting to you, check out the [Modal serverless platform](https://modal.com), trusted to run generative inference at the scale of thousands of GPUs and tens of thousands of CPUs by customers from [Suno](/blog/suno-case-study) to [Substack](/blog/substack-case-study) to [soccer teams](/blog/sports-case-study).
`,meta:{description:`Price, performance, and control: pick three.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:ne}=f,re=t(`<div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4"><video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4"/></video> <video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-full-animation.mp4" type="video/mp4"/></video></div> <p>The era of “get your AI from an API” is rapidly coming to a close.</p> <p>High-quality open weights models and high-performance open source software together mean that you can easily run your own API to generate <!> or <!> or <!>, with all the control and customization self-hosting affords.</p> <p>But having the ability to run your own generative inference raises a bunch of questions: when does it make sense, how do you do it, and, importantly, how do you do it with the same performance and quality that proprietary generative APIs provide?</p> <p>We recently shared <!>. But we also like media generative models, and optimizations look quite different. Where LLM inference is all about finding the right high-level framework and tuning the knobs, diffusion-based models of images require getting a lot closer to the metal.</p> <p>In this blog post, we walk through how we made running the popular <!> by Black Forest Labs as an autoscaling service on Modal competitive with proprietary providers on speed and price by running the inference three times faster and speeding up cold boots. You can find the code <!>.</p> <h3 id="tldr-15x-from-optimizing-compiler-and-hardware-awareness-2x-from-approximate-caching">tl;dr: 1.5x from optimizing compiler and hardware awareness, 2x from approximate caching</h3> <p>We determined that in order to be competitive with APIs serving FLUX.1-dev images, we needed to return results in under three seconds.</p> <p>Applying the “standard” optimizations (running the Torch compiler, switching the data layout, and fusing the QKV calculation) got us halfway to the target.</p> <p>Then we applied a fun, approximate activation caching technique, First Block Caching, and cut the latency in half again.</p> <p><!></p> <h2 id="implement-the-baseline">Implement the baseline</h2> <p>Before beginning to improve performance, you need to first measure the current performance cleanly.</p> <p>We start with the standard Hugging Face <code>diffusers</code> library and create our <code>FluxPipeline</code> in 16bit precision.</p> <!> <p>Averaging across a variety of inputs, we find that we can generate a 1024x1024 image in ~6.75 seconds.</p> <div class="flex flex-wrap sm:flex-nowrap justify-center items-center gap-4"><video controls autoplay loop playsinline="" class="w-1/2 sm:w-1/3 h-auto max-h-[600px] object-contain"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4"/></video> <img src="https://modal-cdn.com/blog/images/flux-3x-faster-baseline-results.webp" class="w-full sm:w-2/3 h-auto max-h-[600px] object-contain" alt="A chart depicting a baseline latency of 6761 ms"/></div> <h2 id="apply-standard-optimizations-for-a-15x-speedup">Apply standard optimizations for a 1.5x speedup</h2> <p>We started by applying a bunch of “standard” optimizations — using Torch’s optimizing compiler; fusing the query, key, and value computations in the Transformer attention; and using the “channels last” memory layout. These are nearly always a good idea.</p> <h3 id="optimize-the-compute-graph-with-the-torch-compiler"><strong>Optimize the compute graph with the Torch compiler</strong></h3> <p>What is a PyTorch program really? By default, PyTorch constructs a compute graph of tensor operations dynamically in Python and runs it eagerly. This “virtual compute graph” is executed on the host/CPU and triggers execution of a “real compute graph” on the device/GPU. If you’re curious how this works, we recommend <!> and examining them.</p> <p>Graph representations of programs are really nice for program transformations. Back in the BC era (Before ChatGPT), most people used PyTorch to train their own neural networks, and the key program transformation was running the program backwards to figure out how to make it less wrong, aka “<!>”.</p> <p>Now that, like neural networks themselves, PyTorch is used more for inference, the key program transformation has changed to <em>compilation</em>. Compilation replaces the compute graph with an equivalent but faster one. If you’re familiar with database query compilers, think of logical-logical optimization transformations like predicate pushdown.</p> <p>As with any respectable modern compiler, the Torch compiler operates as a series of lowerings into increasingly concrete intermediate representations. <!> hooks the CPython frame interpreter, traces Python bytecode, and carves out stretches of Tensor operations into lowered <!>. A backend compiler like <!> then takes these graphs and lowers them to a further optimized representation, like a <!> kernel.</p> <p>We separately compile the model’s two large subcomponents (the Transformer and the Variational Autoencoder). Our configuration settings appear in the code snippet below. We got many of them from <!> on Hugging Face and did some light validation before adjusting other parameters.</p> <p>The most notable choice is to use <code>max-autotune</code>, which incurs tens of minutes of compile-time cost but ensures optimal run-time performance. See the final section for details on how we cut that back down to minutes without losing Modal’s transparent auto-scaling.</p> <!> <h3 id="expose-more-parallelism-to-the-gpu-with-fused-qkv">Expose more parallelism to the GPU with fused QKV</h3> <p>FLUX includes a big Transformer model. The Transformer architecture’s signature component is the attention block, which transmits information between text and image and <!>. They are usually written in terms of three separate matrix multiplications between the block’s input matrix <code>X</code> and its weight matrices <code>W_q</code>, <code>W_k</code>, and <code>W_v</code>.</p> <p>If we concatenate the three weight matrices, we can perform the attention calculation as one large matrix multiplication: (<code>QKV = X @ W_qkv</code>). This exposes more of the parallelism in the operation to the lowered representations. In particular, <code>X</code> is the same matrix for the entire multiplication, not three variable references that <del>we totally promise</del> the Torch compiler must verify are to the exact same data.</p> <!> <h3 id="improve-data-locality-with-channels-last-memory-layout">Improve data locality with channels-last memory layout</h3> <p>The last standard optimization we do is a common recommendation to improve data locality.</p> <p>Tensors are spicy multi-dimensional arrays. Tensors representing images (or feature maps over images) have three dimensions: channel (color), height (y position) and width (x position). This three-dimensional array needs to be mapped onto linear computer memory.</p> <p>By default, PyTorch orders image Tensors in memory by channel first, then by height, then by width (<code>CHW</code> or “Channels First”). Sequential accesses therefore read spatially nearby values from a single channel/color.</p> <p>Let’s walk through an example. This image</p> <!> <p>is represented in memory in <code>CHW</code> format as</p> <!> <p>But many operations in neural networks, like convolutions, are global across channels and local in space. That means we usually want to access all channels at a particular set of positions, and so we want channels to be <em>last</em>.</p> <!> <p>You can convert PyTorch models into this format with the <code>memory_format</code> argument.</p> <!> <h3 id="putting-it-all-together-we-get-a-15x-speedup">Putting it all together, we get a 1.5x speedup</h3> <p>The performance improvement of these optimizations in aggregate is about 1.5x, driven mostly by the Torch compiler.</p> <p><!></p> <p>This speedup is definitely respectable, as evidenced by the animation below, which shows the evolution of the image across denoising steps, rendered at the same rate those steps execute for the two methods.</p> <div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4"><video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4"/></video> <video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-std-opt-animation.mp4" type="video/mp4"/></video></div> <h2 id="apply-vibes-based-approximate-caching-for-another-2x-speedup">Apply <del>vibes-based</del> approximate caching for another 2x speedup</h2> <p>Applying the “standard” optimizations above is pretty straightforward and ends up being an appealing point on the engineering effort/performance curve. But we needed to go further on performance, so we needed to go deeper.</p> <p>Diffusion models generate images iteratively, turning noise into art, one step at a time. That’s the process we’re showing in these animations. If you look closely you can see that during some steps, the image doesn’t change much at all.</p> <center><video controls autoplay loop playsinline="" class="w-2/3 sm:w-1/2"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-baseline-animation.mp4" type="video/mp4"/></video></center> <p>As it turns out, if you’re willing to tolerate some slight changes in the results, you can skip those steps entirely!</p> <p>This is an important difference between neural networks and other programs. With neural networks, you can often remove chunks or skip steps, and the program still runs, and does “almost” the same thing. More like an analog computer than a digital one!</p> <p>We used the “first block caching” technique and implementation from the <!>, itself based on the approach from the <!>. The basic idea is to start running the model for a timestep. If, partway through the model’s forward pass (after the “first block”), it looks like there won’t be a large change, you skip the step.</p> <!> <p>The definition of “large” is a tunable parameter, where higher values lead to larger changes in model behavior but faster execution. This allows for a smoother tradeoff between performance improvement and quality degradation than other techniques that do the same, like quantization.</p> <p>We got a 2x speedup with a threshold of <code>0.12</code> and images looked better than with the default of <code>0.08</code>, so we stuck with it.</p> <p><!></p> <div class="flex justify-center items-center flex-wrap gap-1 sm:gap-4"><video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-std-opt-animation.mp4" type="video/mp4"/></video> <video autoplay loop playsinline="" class="max-w-[45%] h-auto"><source src="https://modal-cdn.com/blog/videos/flux-3x-faster-full-animation.mp4" type="video/mp4"/></video></div> <h2 id="cut-cold-start-latency-by-30x-with-caches-and-snapshots">Cut cold start latency by 30x with caches and snapshots</h2> <p>As we optimized inference, we took an <em>enormous</em> hit on boot time — from seconds to tens of minutes.</p> <p>Boot time matters for cost and speed as well. If boots are fast, you can run only as many replicas as you need to satisfy current demand and still hit your latency objectives.</p> <p>This is something we think is very critical, and we spend a lot of time optimizing this at Modal! You can read more about why we think this is so important for generative applications in our <!> explainer and our <!>.</p> <p>The primary culprit is the Torch compiler, and specifically <code>max-autotune</code>, which profiles multiple implementations at compile time to find the fastest one.</p> <p>This is a classic use case for a cache — compute-intensive work that produces serializable artifacts. Torch Compile offers both piece-wise caching of smaller artifacts, like compiled Triton kernels, and a “megacache” that stores entire cached compute graphs. We used both, but the megacache didn’t offer a large speedup. It didn’t hurt either, and it’s a new feature we expect to improve over time, so we left it in. You can find the details <!>.</p> <p>We also shave off a few seconds using Modal’s <!>, which lets us turn the many file reads and code execution in <code>import torch</code> and <code>from_pretrained</code> into a single file read (for every invocation after the first). Check out <!> for a deep dive.</p> <!> <h2 id="serve-ai-models-at-scale-with-modal">Serve AI models at scale with Modal</h2> <p>Together, these optimizations cut FLUX.1-dev serving latency to match the performance of proprietary serving APIs. On Modal, that means you can match or beat providers on price too.</p> <p>We didn’t talk too much about all the other problems that come up when building and serving a generative API — interactive development, handling bursty loads, and training/evaluating the next iteration of the service. If that’s interesting to you, check out the <!>, trusted to run generative inference at the scale of thousands of GPUs and tens of thousands of CPUs by customers from <!> to <!> to <!>.</p>`,3);function C(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=re(),d=te(a),f=e(d);f.muted=!0;var p=o(f,2);p.muted=!0,n(d);var m=o(d,4),h=o(e(m));u(h,{href:`/solutions/image-and-video`,children:(e,t)=>{s(),i(e,r(`images`))},$$slots:{default:!0}});var g=o(h,2);u(g,{href:`/solutions/audio`,children:(e,t)=>{s(),i(e,r(`music`))},$$slots:{default:!0}}),u(o(g,2),{href:`/solutions/llm`,children:(e,t)=>{s(),i(e,r(`text`))},$$slots:{default:!0}}),s(),n(m);var _=o(m,4);u(o(e(_)),{href:`/llm-almanac/summary`,children:(e,t)=>{s(),i(e,r(`our results and recommendations for running your own LLM inference`))},$$slots:{default:!0}}),s(),n(_);var v=o(_,2),y=o(e(v));u(y,{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FLUX.1-dev model`))},$$slots:{default:!0}}),u(o(y,2),{href:`https://github.com/modal-labs/modal-examples/blob/b5fbb047905382a611cb21d45aa6ddd631a1f15d/misc/flux_endpoint.py`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(v);var b=o(v,10);c(e(b),{src:`https://modal-cdn.com/blog/images/flux-3x-faster-full-results-1.webp`}),n(b);var x=o(b,8);l(x,{code:`self.pipe%20%3D%20FluxPipeline.from_pretrained(%0A%20%20%20%20%22black-forest-labs%2FFLUX.1-dev%22%2C%0A%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20use_safetensors%3DTrue%2C%0A)`,lang:`python`});var S=o(x,4),ne=e(S);ne.muted=!0,s(2),n(S);var C=o(S,8);u(o(e(C)),{href:`/docs/examples/torch_profiling`,children:(e,t)=>{s(),i(e,r(`generating some PyTorch traces`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);u(o(e(w)),{href:`https://www.nature.com/articles/323533a0`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`learning representations by back-propagating errors`))},$$slots:{default:!0}}),s(),n(w);var T=o(w,4),E=o(e(T));u(E,{href:`https://docs.pytorch.org/docs/stable/torch.compiler_dynamo_overview.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TorchDynamo`))},$$slots:{default:!0}});var D=o(E,2);u(D,{href:`https://docs.pytorch.org/docs/stable/fx.html#torch.fx.Graph`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“FX” graphs`))},$$slots:{default:!0}});var ie=o(D,2);u(ie,{href:`https://dev-discuss.pytorch.org/t/torchinductor-a-pytorch-native-compiler-with-define-by-run-ir-and-symbolic-shapes/747`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TorchInductor`))},$$slots:{default:!0}}),u(o(ie,2),{href:`https://github.com/triton-lang/triton`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Triton`))},$$slots:{default:!0}}),s(),n(T);var O=o(T,2);u(o(e(O)),{href:`http://huggingface.co/docs/diffusers/en/tutorials/fast_diffusion`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this excellent guide`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,4);l(k,{code:`class%20Flux%3A%0A%20%20%20%20...%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20FluxPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22black-forest-labs%2FFLUX.1-dev%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_safetensors%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20torch.compile%20configuration%0A%20%20%20%20%20%20%20%20config%20%3D%20torch._inductor.config%0A%20%20%20%20%20%20%20%20config.conv_1x1_as_mm%20%3D%20True%0A%20%20%20%20%20%20%20%20config.coordinate_descent_check_all_directions%20%3D%20True%0A%20%20%20%20%20%20%20%20config.coordinate_descent_tuning%20%3D%20True%0A%20%20%20%20%20%20%20%20config.disable_progress%20%3D%20False%0A%20%20%20%20%20%20%20%20config.epilogue_fusion%20%3D%20False%0A%20%20%20%20%20%20%20%20config.shape_padding%20%3D%20True%0A%0A%20%20%20%20%20%20%20%20%23%20Mark%20layers%20for%20compilation%20with%20dynamic%20shapes%20enabled.%0A%20%20%20%20%20%20%20%20self.pipe.transformer%20%3D%20torch.compile(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pipe.transformer%2C%20mode%3D%22max-autotune-no-cudagraphs%22%2C%20dynamic%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.pipe.vae.decode%20%3D%20torch.compile(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pipe.vae.decode%2C%20mode%3D%22max-autotune-no-cudagraphs%22%2C%20dynamic%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20Trigger%20torch%20compile%0A%20%20%20%20%20%20%20%20self.pipe(%22dummy%20prompt%22%2C%20height%3D1024%2C%20width%3D1024%2C%20num_images_per_prompt%3D1)%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var A=o(k,4);u(o(e(A)),{href:`https://transformer-circuits.pub/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`through internal circuits`))},$$slots:{default:!0}}),s(9),n(A);var j=o(A,4);l(j,{code:`class%20Flux%3A%0A%20%20%20%20...%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20...%0A%20%20%20%20%20%20%20%20self.pipe.transformer.fuse_qkv_projections()%0A%20%20%20%20%20%20%20%20self.pipe.vae.fuse_qkv_projections()%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var M=o(j,12);l(M,{code:`%2F%2F%20a%202x4%20image%20with%20three%20channels%20of%20one%20byte%20each%0A%E2%94%8C%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%AC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%AC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%AC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%90%0A%E2%94%82%20%23888888%E2%94%82%20%23999999%E2%94%82%20%23AAAAAA%E2%94%82%20%23BBBBBB%E2%94%82%0A%E2%94%9C%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%BC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%BC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%BC%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%A4%0A%E2%94%82%20%23CCCCCC%E2%94%82%20%23DDDDDD%E2%94%82%20%23EEEEEE%E2%94%82%20%23FFFFFF%E2%94%82%0A%E2%94%94%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%98`,lang:`text`});var N=o(M,4);l(N,{code:`%2F%2F%20channels%20first%0A0x00%20%3A%2088%2099%20AA%20BB%20%20CC%20DD%20EE%20FF%20%20%20%E2%86%90%20%F0%9F%9F%A5%20red%20values%0A0x0F%20%3A%2088%2099%20AA%20BB%20%20CC%20DD%20EE%20FF%20%20%20%E2%86%90%20%F0%9F%9F%A9%20green%20values%0A0x17%20%3A%2088%2099%20AA%20BB%20%20CC%20DD%20EE%20FF%20%20%20%E2%86%90%20%F0%9F%9F%A6%20blue%20values`,lang:`text`});var P=o(N,4);l(P,{code:`%2F%2F%20channels%20last%0A0x00%20%3A%2088%2088%2088%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x03%20%3A%2099%2099%2099%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x06%20%3A%20AA%20AA%20AA%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x09%20%3A%20BB%20BB%20BB%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x0C%20%3A%20CC%20CC%20CC%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x0F%20%3A%20DD%20DD%20DD%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x12%20%3A%20EE%20EE%20EE%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6%0A0x15%20%3A%20FF%20FF%20FF%20%20%20%F0%9F%9F%A5%20%F0%9F%9F%A9%20%F0%9F%9F%A6`,lang:`text`});var F=o(P,4);l(F,{code:`class%20Flux%3A%0A%20%20%20%20...%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20...%0A%20%20%20%20%20%20%20%20self.pipe.transformer.to(memory_format%3Dtorch.channels_last)%0A%20%20%20%20%20%20%20%20self.pipe.vae.to(memory_format%3Dtorch.channels_last)%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var I=o(F,6);c(e(I),{src:`https://modal-cdn.com/blog/images/flux-3x-faster-std-opt-results.webp`,alt:`flux-3x-faster-std-opt-results.png`}),n(I);var L=o(I,4),R=e(L);R.muted=!0;var ae=o(R,2);ae.muted=!0,n(L);var z=o(L,8),oe=e(z);oe.muted=!0,n(z);var B=o(z,6),V=o(e(B));u(V,{href:`https://github.com/chengzeyi/ParaAttention`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ParaAttention repo`))},$$slots:{default:!0}}),u(o(V,2),{href:`https://liewfeng.github.io/TeaCache/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`TEACache paper`))},$$slots:{default:!0}}),s(),n(B);var H=o(B,2);l(H,{code:`class%20Flux%3A%0A%20%20%20%20...%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20...%0A%20%20%20%20%20%20%20%20from%20para_attn.first_block_cache.diffusers_adapters%20import%20apply_cache_on_pipe%0A%20%20%20%20%20%20%20%20apply_cache_on_pipe(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pipe%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20residual_diff_threshold%3D0.12%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20quality%20degraded%20too%20much%20at%20higher%20thresholds%0A%20%20%20%20%20%20%20%20)`,lang:`python`});var U=o(H,6);c(e(U),{src:`https://modal-cdn.com/blog/images/flux-3x-faster-full-results-1.webp`,alt:`flux-3x-faster-full-results.png`}),n(U);var W=o(U,2),G=e(W);G.muted=!0;var se=o(G,2);se.muted=!0,n(W);var K=o(W,8),q=o(e(K));u(q,{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`GPU utilization`))},$$slots:{default:!0}}),u(o(q,2),{href:`/blog/suno-case-study`,children:(e,t)=>{s(),i(e,r(`case study with Suno`))},$$slots:{default:!0}}),s(),n(K);var J=o(K,4);u(o(e(J)),{href:`https://github.com/modal-labs/modal-examples/blob/b5fbb047905382a611cb21d45aa6ddd631a1f15d/misc/flux_endpoint.py#L225-L230`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,2),X=o(e(Y));u(X,{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}}),u(o(X,6),{href:`/blog/mem-snapshots`,children:(e,t)=>{s(),i(e,r(`this blog post`))},$$slots:{default:!0}}),s(),n(Y);var Z=o(Y,2);l(Z,{code:`image%20%3D%20image.env(%0A%09%7B%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_FX_GRAPH_CACHE%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%20%20%22CUDA_CACHE_PATH%22%3A%20%22%2Fcache%2F.nv_cache%22%2C%0A%20%20%20%20%20%20%20%20%22TORCHINDUCTOR_CACHE_DIR%22%3A%20%22%2Fcache%2F.inductor_cache%22%2C%0A%20%20%20%20%20%20%20%20%22TRITON_CACHE_DIR%22%3A%20%22%2Fcache%2F.triton_cache%22%2C%0A%09%7D%0A)%0A%0ACACHE_VOLUME%20%3D%20modal.Volume.from_name(%22cache_volume%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.cls(%0A%20%20%20%20enable_memory_snapshot%3DTrue%2C%0A%20%20%20%20volumes%3D%7B%22%2Fcache%22%3A%20CACHE_VOLUME%7D%0A%20%20%20%20...%0A)%0Aclass%20Flux%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe%20%3D%20FluxPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22black-forest-labs%2FFLUX.1-dev%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch_dtype%3Dtorch.bfloat16%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_safetensors%3DTrue%2C%0A%20%20%20%20%20%20%20%20).to(%22cpu%22)%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20self.pipe.to(%22cuda%22)%0A%20%20%20%20%20%20%20%20...%20%23%20rest%20of%20setup`,lang:`python`});var Q=o(Z,6),ce=o(e(Q));u(ce,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal serverless platform`))},$$slots:{default:!0}});var le=o(ce,2);u(le,{href:`/blog/suno-case-study`,children:(e,t)=>{s(),i(e,r(`Suno`))},$$slots:{default:!0}});var $=o(le,2);u($,{href:`/blog/substack-case-study`,children:(e,t)=>{s(),i(e,r(`Substack`))},$$slots:{default:!0}}),u(o($,2),{href:`/blog/sports-case-study`,children:(e,t)=>{s(),i(e,r(`soccer teams`))},$$slots:{default:!0}}),s(),n(Q),i(t,a)},$$slots:{default:!0}}))}export{C as default,f as metadata};
//# sourceMappingURL=CwVXPkpR.js.map
