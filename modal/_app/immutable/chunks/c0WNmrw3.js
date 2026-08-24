(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b8a429cb-787e-443d-8961-30a16df96c5b`,e._sentryDebugIdIdentifier=`sentry-dbid-b8a429cb-787e-443d-8961-30a16df96c5b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Top open-source text-to-video AI models`,description:`Learn about the top open-source text-to-video AI models`,date:`2024-10-30T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Image and Video Models`,published:!0,layout:`blog`,toc:[{depth:3,value:`HunyuanVideo`,id:`hunyuanvideo`,children:[{depth:4,value:`Key Features`,id:`key-features`},{depth:4,value:`Example Videos`,id:`example-videos`},{depth:4,value:`Operational Footprint`,id:`operational-footprint`},{depth:4,value:`Strengths`,id:`strengths`},{depth:4,value:`Weaknesses`,id:`weaknesses`}]},{depth:3,value:`Mochi`,id:`mochi`,children:[{depth:4,value:`Key Features`,id:`key-features-1`},{depth:4,value:`Example Videos`,id:`example-videos-1`},{depth:4,value:`Operational Footprint`,id:`operational-footprint-1`},{depth:4,value:`Strengths`,id:`strengths-1`},{depth:4,value:`Weaknesses`,id:`weaknesses-1`}]},{depth:3,value:`Wan2.2`,id:`wan22`,children:[{depth:4,value:`Key Features`,id:`key-features-2`},{depth:4,value:`Example Videos`,id:`example-videos-2`},{depth:4,value:`Operational Footprint`,id:`operational-footprint-2`},{depth:4,value:`Strengths`,id:`strengths-2`},{depth:4,value:`Weaknesses`,id:`weaknesses-2`}]},{depth:2,value:`Running Text-to-Video Models`,id:`running-text-to-video-models`,children:[{depth:3,value:`Things to Think About When Selecting a Model`,id:`things-to-think-about-when-selecting-a-model`}]},{depth:2,value:`Closing Thoughts`,id:`closing-thoughts`}],rawContent:`_Updated: 2025-10-29_

Open-source text-to-video AI models are rapidly approaching the quality of leading closed-source models like Kling or OpenAI's Sora.

In this article we'll compare the following popular open-source text-to-video models:

| Model                                           | Parameters | Created by | Released |
| ----------------------------------------------- | ---------- | ---------- | -------- |
| HunyuanVideo                                    | 13B+       | Tencent    | Dec 2024 |
| Mochi ([deploy on Modal](/docs/examples/mochi)) | 10B        | Genmo      | Oct 2024 |
| Wan2.2                                          | 5B and 14B | Alibaba    | Jul 2025 |

Text-to-video AI models build on text-to-image foundations but add a more difficult dimension: time. Every frame must not only look convincing on its own but also stay coherent across seconds of motion. This shift introduces new failure modes:

- Small artifacts that flicker or accumulate across frames
- Motion that feels jittery or unnatural
- Styles that fade or drift as a clip unfolds

Beyond model design, running these systems is considerably more demanding. Video synthesis consumes far more GPU memory than still images and require careful batching just to generate a few seconds of footage.

Closed-source systems like OpenAI’s [Sora](https://openai.com/sora/) and Kuaishou’s [Kling](https://klingai.com/global/) have proved that high quality, long-form video generation is possible. But they remain inaccessible for most developers. That leaves open-source alternatives as the most practical path to experiment, fine-tune, and deploy video generation pipelines without depending on proprietary APIs.

This article focuses on some of the most widely adopted open-weight models and examines their capabilities through prompt-level examples, deployment considerations, and trade-offs. The goal is not to declare a “best” model, but to map out what each system does well and its limits.

To ground the comparison, let’s start with a side-by-side example prompt: “A white dove is flapping its wings, flying freely in the sky, in anime style.” (prompt taken from\xA0[Penguin Video Benchmark](https://github.com/Tencent/HunyuanVideo/blob/main/assets/PenguinVideoBenchmark.csv#L12))

<div class="grid grid-cols-3 gap-5">
  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/hunyuan_dove.mp4" type="video/mp4">
    </video>
    <figcaption>
      Hunyuan
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/mochi-dove.mp4" type="video/mp4">
    </video>
    <figcaption>
      Mochi
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/wan-dove.mp4" type="video/mp4">
    </video>
    <figcaption>
      Wan2.2
    </figcaption>
  </figure>
</div>

Now, let’s dive deeper into each of these models.

### HunyuanVideo

- Released: Dec 3, 2024
- Creator: Tencent

[Hunyuan](https://huggingface.co/tencent/HunyuanVideo)\xA0(roughly pronounced “hwen-yoo-en” in English) was one of the first large-scale systems to demonstrate that open-source approaches could begin matching the temporal consistency of closed platforms. It is consistently at or near the top of HuggingFace’s trending models and by far the most discussed model in our\xA0[community Slack](https://modal.com/slack).

#### Key Features

- **Over 13 billion** parameters
- **Diffusers integration** for plug-and-play workflows
- **FP8 model weights** to reduce GPU memory usage
- **Official ComfyUI nodes** for quick prototyping
- **Prompt rewriting utility** to improve alignment with user instructions
- **Several popular fine-tunes** e.g.\xA0[SkyReels V1](https://huggingface.co/Skywork/SkyReels-V1-Hunyuan-T2V)\xA0which is fine-tuned on 10s of millions of human-centric film and television clips

#### Example Videos

<div class="flex flex-row gap-5">
  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/hunyuan-alien.mp4" type="video/mp4">
    </video>
    <figcaption>
      Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/hunyuan-astro.mp4" type="video/mp4">
    </video>
    <figcaption>
      An astronaut flying in space by Hokusai, in the style of Ukiyochi
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/hunyuan-golden.mp4" type="video/mp4">
    </video>
    <figcaption>
      A few golden retrievers playing in the snow
    </figcaption>
  </figure>
</div>

These videos demonstrate Hunyuan’s high quality and realistic generation capabilities, though the astronaut video does not really adhere to the style prompt.

#### Operational Footprint

Running Hunyuan requires substantial resources. Even relatively short clips at moderate resolution push beyond the capacity of most consumer GPUs, placing the model firmly in the datacenter-class hardware category.

Tencent does provide options for multi-GPU sequence parallelism (xDiT) which helps distribute workloads and FP8 quantization which reduces memory pressure. However, even with these optimizations, Hunyuan is still impractical for most consumer setups.

#### Strengths

Hunyuan is strong in motion consistency and texture realism. As shown in the example videos, backgrounds remain coherent across frames, and fine details (i.e., snowflake pattern) hold together better than in many smaller models. Also, ecosystem maturity (through Diffusers and ComfyUI support) makes it easier to integrate into existing workflows.

#### Weaknesses

For prompts requesting artistic rendering (i.e., Ukiyochi astronaut), Hunyuan often defaults toward photorealism which takes away from stylistic control. Its high VRAM demand also places it out of reach for consumer-grade GPUs, which limits accessibility to most developers.

### Mochi

- Released: Oct 22, 2024
- Creator: Genmo

[Mochi](https://github.com/genmoai/mochi)\xA0marked one of the first Apache-2.0 licensed video models released with training code, making it an attractive option for both experimentation and downstream fine-tuning. It ranks similarly to Hunyuan on crowd-sourced\xA0[leaderboards](https://artificialanalysis.ai/text-to-video/arena?tab=Leaderboard).

#### Key Features

- **10 billion** parameters
- **Apache-2.0 license** for open research and commercial use
- **LoRA trainer support** for lightweight fine-tuning
- **Native\xA0ComfyUI**\xA0integration
- **AsymmDiT backbone** optimized for video synthesis
- **Easy [Deployment on Modal](/docs/examples/mochi)**

#### Example Videos

<div class="flex flex-row gap-5">
  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/mochi-alien.mp4" type="video/mp4">
    </video>
    <figcaption>
      Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/mochi-astro.mp4" type="video/mp4">
    </video>
    <figcaption>
      An astronaut flying in space by Hokusai, in the style of Ukiyochi
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/mochi-golden.mp4" type="video/mp4">
    </video>
    <figcaption>
      A few golden retrievers playing in the snow
    </figcaption>
  </figure>
</div>

In these examples, Mochi’s quality is generally a little worse compared to Hunyuan, though the first example is arguably my favorite in the entire series of videos in this article.

#### Operational Footprint

Running Mochi is resource-intensive given its size. At default settings, it requires more GPU memory than most consumers can provide, putting it in the same class of hardware demand as larger open-weight models like Hunyuan. ComfyUI optimizations can lower the memory footprint, but comes with trade-offs in generation speed and clip length.

Modal’s deployment estimates the cost at around [$0.33 per short clip on H100-class hardware](/docs/examples/mochi), which positions Mochi as relatively efficient for cloud runs, but still impractical for most local GPUs.

#### Strengths

Mochi has great photorealistic rendering and flexible fine-tuning. Its support for LoRA adapters lets team specialize the model quickly on custom data. Also, the Apache-2.0 license makes it one of the most permissively usable models.

#### Weaknesses

Stylized outputs, especially animated sequences, are weaker. The authors note that Mochi is primarily optimized for photorealism. Also, its relatively high memory demand in regards to its parameter count raises operational cost.

### Wan2.2

[Wan2.2](https://github.com/Wan-Video/Wan2.2)\xA0is the latest open-weight model from Alibaba’s Wan series. It builds on Wan 2.1 but introduces substantial architectural upgrades. The release emphasizes stylization control, motion fidelity, and computational efficiency, while preserving open tooling support (Diffusers, ComfyUI).

- Released: July 28, 2025
- Creator: Alibaba

#### Key Features

- Hybrid **TI2V-5B** model combining both text-to-video and image-to-video capabilities
- **Apache-2.0 license**
- **Mixture-of-Experts (MoE)** backbone, with two specialized experts (high-noise/low-noise), allowing for efficient capacity scaling
- **Cinematic aesthetic controls**: lighting, composition, contrast, color tone labels, etc.

#### Example Videos

<div class="flex flex-row gap-5">
  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/wan-alien.mp4" type="video/mp4">
    </video>
    <figcaption>
      Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/wan-astro.mp4" type="video/mp4">
    </video>
    <figcaption>
      An astronaut flying in space by Hokusai, in the style of Ukiyochi
    </figcaption>
  </figure>

  <figure>
    <video controls autoplay loop muted playsinline class="w-full">
      <source src="https://modal-cdn.com/text-to-video/wan-golden.mp4" type="video/mp4">
    </video>
    <figcaption>
      A few golden retrievers playing in the snow
    </figcaption>
  </figure>
</div>

The overall quality of Wan2.2 is maybe slightly worse than Hunyuan, but it does the best job adhering to the style instructions of the astronaut prompt.

#### Operational Footprint

The TI2V-5B variant is optimized for 720p/24 fps and is reported to run on high-end consumer GPUs. The A14B MoE variants (T2V-A14B, I2V-A14B) require more resources and target higher fidelity use cases.

#### Strengths

Wan2.2 stands out for its balance between stylization control and accessibility. The model maintains readable on-screen text and performs well across Chinese and English prompts. Also, its resource efficiency makes it one of the most approachable models for developers testing video workflows on local GPUs.

#### Weaknesses

While Wan2.2 narrows the realism gap, its fine-texture detail such as lighting still trails larger models like Hunyuan in complex scenes. Some users also report longer inference times per frame under high-motion prompts due to the MoE routing overhead. Also, performance on multi-GPU scale-outs remains less documented than other models.

Note: Wan2.2 replaces the concept of a “lightweight variant” from 2.1 (like the 1.3B model). In 2.2, the TI2V-5B model serves as the efficiency tier, and the A14B MoE models handle specialization.

All of these comparisons highlight model capabilities, but developers must also weigh the practicalities of running them. This next section addresses this.

## Running Text-to-Video Models

Text-to-video models introduce a whole new set of unique operational challenges. This means that the choice of a model isn’t as easy as picking the one that looks good. We have to find a model that fits into our existing workflow and hardware budget.

### Things to Think About When Selecting a Model

1. **Choose one with a Diffusers or ComfyUI integration.** This saves setup time and gives you standardized preprocessing, inference, and visualization pipelines out of the box. Models without official integrations usually require more custom code or community wrappers.
2. **Match model size to your GPU.** Larger architectures often require datacenter GPUs to run at full resolution. Smaller or quantized variants can run on consumer hardware but typically produce shorter or lower-quality clips.
3. **Prototype small, scale later.** Start with low-resolution, short clips to confirm your pipeline works. Once the workflow is stable, you can increase resolution and clip length without wasting GPU hours on debugging.
4. **Consider latency and cost as part of quality.** Generating a few seconds of video can take several minutes on high-end hardware. Faster models or shorter clips might deliver better iteration speed, even if the visual quality is slightly lower.
5. **Use optimization tools deliberately.** Quantization, offloading, and multi-GPU parallelism can stretch hardware capacity, but each comes with trade-offs in speed, fidelity, or complexity. Apply them _only_ where they make sense.

## Closing Thoughts

The text-to-video space is moving at a very fast clip, with new models claiming “state-of-the-art” being released every few weeks. The common message across these models is that there is no single “best” option, but a growing set of trade-offs.

Some models prioritize realism while others are better at stylization or text rendering. Larger architectures allow for longer, higher-resolution clips, but require datacenter-class GPUs. Smaller variants reduce hardware requirements, making them more accessible, at the cost of fidelity. Ultimately, gains in one area lead to trade-offs in another.

As GPUs become easier and cheaper to access, deploying open-source models like Hunyuan, Mochi, and Wan2.2 are becoming even more attractive options. At Modal, this is as simple as running our end-to-end\xA0[Mochi example](/docs/examples/mochi), but you can run any code on Modal in a cost-effective and developer-friendly way.
`,meta:{description:`Learn about the top open-source text-to-video AI models`}},{title:m,description:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:ee,rawContent:S,meta:C}=p,w=t(`<thead><tr><th>Model</th><th>Parameters</th><th>Created by</th><th>Released</th></tr></thead> <tbody><tr><td>HunyuanVideo</td><td>13B+</td><td>Tencent</td><td>Dec 2024</td></tr><tr><td>Mochi (<!>)</td><td>10B</td><td>Genmo</td><td>Oct 2024</td></tr><tr><td>Wan2.2</td><td>5B and 14B</td><td>Alibaba</td><td>Jul 2025</td></tr></tbody>`,1),T=t(`<p><em>Updated: 2025-10-29</em></p> <p>Open-source text-to-video AI models are rapidly approaching the quality of leading closed-source models like Kling or OpenAI’s Sora.</p> <p>In this article we’ll compare the following popular open-source text-to-video models:</p> <!> <p>Text-to-video AI models build on text-to-image foundations but add a more difficult dimension: time. Every frame must not only look convincing on its own but also stay coherent across seconds of motion. This shift introduces new failure modes:</p> <ul><li>Small artifacts that flicker or accumulate across frames</li> <li>Motion that feels jittery or unnatural</li> <li>Styles that fade or drift as a clip unfolds</li></ul> <p>Beyond model design, running these systems is considerably more demanding. Video synthesis consumes far more GPU memory than still images and require careful batching just to generate a few seconds of footage.</p> <p>Closed-source systems like OpenAI’s <!> and Kuaishou’s <!> have proved that high quality, long-form video generation is possible. But they remain inaccessible for most developers. That leaves open-source alternatives as the most practical path to experiment, fine-tune, and deploy video generation pipelines without depending on proprietary APIs.</p> <p>This article focuses on some of the most widely adopted open-weight models and examines their capabilities through prompt-level examples, deployment considerations, and trade-offs. The goal is not to declare a “best” model, but to map out what each system does well and its limits.</p> <p>To ground the comparison, let’s start with a side-by-side example prompt: “A white dove is flapping its wings, flying freely in the sky, in anime style.” (prompt taken from\xA0<!>)</p> <div class="grid grid-cols-3 gap-5"><figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/hunyuan_dove.mp4" type="video/mp4"/></video> <figcaption>Hunyuan</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/mochi-dove.mp4" type="video/mp4"/></video> <figcaption>Mochi</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/wan-dove.mp4" type="video/mp4"/></video> <figcaption>Wan2.2</figcaption></figure></div> <p>Now, let’s dive deeper into each of these models.</p> <h3 id="hunyuanvideo">HunyuanVideo</h3> <ul><li>Released: Dec 3, 2024</li> <li>Creator: Tencent</li></ul> <p><!>\xA0(roughly pronounced “hwen-yoo-en” in English) was one of the first large-scale systems to demonstrate that open-source approaches could begin matching the temporal consistency of closed platforms. It is consistently at or near the top of HuggingFace’s trending models and by far the most discussed model in our\xA0<!>.</p> <h4 id="key-features">Key Features</h4> <ul><li><strong>Over 13 billion</strong> parameters</li> <li><strong>Diffusers integration</strong> for plug-and-play workflows</li> <li><strong>FP8 model weights</strong> to reduce GPU memory usage</li> <li><strong>Official ComfyUI nodes</strong> for quick prototyping</li> <li><strong>Prompt rewriting utility</strong> to improve alignment with user instructions</li> <li><strong>Several popular fine-tunes</strong> e.g.\xA0<!>\xA0which is fine-tuned on 10s of millions of human-centric film and television clips</li></ul> <h4 id="example-videos">Example Videos</h4> <div class="flex flex-row gap-5"><figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/hunyuan-alien.mp4" type="video/mp4"/></video> <figcaption>Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/hunyuan-astro.mp4" type="video/mp4"/></video> <figcaption>An astronaut flying in space by Hokusai, in the style of Ukiyochi</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/hunyuan-golden.mp4" type="video/mp4"/></video> <figcaption>A few golden retrievers playing in the snow</figcaption></figure></div> <p>These videos demonstrate Hunyuan’s high quality and realistic generation capabilities, though the astronaut video does not really adhere to the style prompt.</p> <h4 id="operational-footprint">Operational Footprint</h4> <p>Running Hunyuan requires substantial resources. Even relatively short clips at moderate resolution push beyond the capacity of most consumer GPUs, placing the model firmly in the datacenter-class hardware category.</p> <p>Tencent does provide options for multi-GPU sequence parallelism (xDiT) which helps distribute workloads and FP8 quantization which reduces memory pressure. However, even with these optimizations, Hunyuan is still impractical for most consumer setups.</p> <h4 id="strengths">Strengths</h4> <p>Hunyuan is strong in motion consistency and texture realism. As shown in the example videos, backgrounds remain coherent across frames, and fine details (i.e., snowflake pattern) hold together better than in many smaller models. Also, ecosystem maturity (through Diffusers and ComfyUI support) makes it easier to integrate into existing workflows.</p> <h4 id="weaknesses">Weaknesses</h4> <p>For prompts requesting artistic rendering (i.e., Ukiyochi astronaut), Hunyuan often defaults toward photorealism which takes away from stylistic control. Its high VRAM demand also places it out of reach for consumer-grade GPUs, which limits accessibility to most developers.</p> <h3 id="mochi">Mochi</h3> <ul><li>Released: Oct 22, 2024</li> <li>Creator: Genmo</li></ul> <p><!>\xA0marked one of the first Apache-2.0 licensed video models released with training code, making it an attractive option for both experimentation and downstream fine-tuning. It ranks similarly to Hunyuan on crowd-sourced\xA0<!>.</p> <h4 id="key-features-1">Key Features</h4> <ul><li><strong>10 billion</strong> parameters</li> <li><strong>Apache-2.0 license</strong> for open research and commercial use</li> <li><strong>LoRA trainer support</strong> for lightweight fine-tuning</li> <li><strong>Native\xA0ComfyUI</strong>\xA0integration</li> <li><strong>AsymmDiT backbone</strong> optimized for video synthesis</li> <li><strong>Easy <!></strong></li></ul> <h4 id="example-videos-1">Example Videos</h4> <div class="flex flex-row gap-5"><figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/mochi-alien.mp4" type="video/mp4"/></video> <figcaption>Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/mochi-astro.mp4" type="video/mp4"/></video> <figcaption>An astronaut flying in space by Hokusai, in the style of Ukiyochi</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/mochi-golden.mp4" type="video/mp4"/></video> <figcaption>A few golden retrievers playing in the snow</figcaption></figure></div> <p>In these examples, Mochi’s quality is generally a little worse compared to Hunyuan, though the first example is arguably my favorite in the entire series of videos in this article.</p> <h4 id="operational-footprint-1">Operational Footprint</h4> <p>Running Mochi is resource-intensive given its size. At default settings, it requires more GPU memory than most consumers can provide, putting it in the same class of hardware demand as larger open-weight models like Hunyuan. ComfyUI optimizations can lower the memory footprint, but comes with trade-offs in generation speed and clip length.</p> <p>Modal’s deployment estimates the cost at around <!>, which positions Mochi as relatively efficient for cloud runs, but still impractical for most local GPUs.</p> <h4 id="strengths-1">Strengths</h4> <p>Mochi has great photorealistic rendering and flexible fine-tuning. Its support for LoRA adapters lets team specialize the model quickly on custom data. Also, the Apache-2.0 license makes it one of the most permissively usable models.</p> <h4 id="weaknesses-1">Weaknesses</h4> <p>Stylized outputs, especially animated sequences, are weaker. The authors note that Mochi is primarily optimized for photorealism. Also, its relatively high memory demand in regards to its parameter count raises operational cost.</p> <h3 id="wan22">Wan2.2</h3> <p><!>\xA0is the latest open-weight model from Alibaba’s Wan series. It builds on Wan 2.1 but introduces substantial architectural upgrades. The release emphasizes stylization control, motion fidelity, and computational efficiency, while preserving open tooling support (Diffusers, ComfyUI).</p> <ul><li>Released: July 28, 2025</li> <li>Creator: Alibaba</li></ul> <h4 id="key-features-2">Key Features</h4> <ul><li>Hybrid <strong>TI2V-5B</strong> model combining both text-to-video and image-to-video capabilities</li> <li><strong>Apache-2.0 license</strong></li> <li><strong>Mixture-of-Experts (MoE)</strong> backbone, with two specialized experts (high-noise/low-noise), allowing for efficient capacity scaling</li> <li><strong>Cinematic aesthetic controls</strong>: lighting, composition, contrast, color tone labels, etc.</li></ul> <h4 id="example-videos-2">Example Videos</h4> <div class="flex flex-row gap-5"><figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/wan-alien.mp4" type="video/mp4"/></video> <figcaption>Ultra-realistic, intricate textures. Panspermia Extraterrestrial life, Fermi paradox, swirling dust particles, Unreal engine 5 render</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/wan-astro.mp4" type="video/mp4"/></video> <figcaption>An astronaut flying in space by Hokusai, in the style of Ukiyochi</figcaption></figure> <figure><video controls autoplay loop playsinline="" class="w-full"><source src="https://modal-cdn.com/text-to-video/wan-golden.mp4" type="video/mp4"/></video> <figcaption>A few golden retrievers playing in the snow</figcaption></figure></div> <p>The overall quality of Wan2.2 is maybe slightly worse than Hunyuan, but it does the best job adhering to the style instructions of the astronaut prompt.</p> <h4 id="operational-footprint-2">Operational Footprint</h4> <p>The TI2V-5B variant is optimized for 720p/24 fps and is reported to run on high-end consumer GPUs. The A14B MoE variants (T2V-A14B, I2V-A14B) require more resources and target higher fidelity use cases.</p> <h4 id="strengths-2">Strengths</h4> <p>Wan2.2 stands out for its balance between stylization control and accessibility. The model maintains readable on-screen text and performs well across Chinese and English prompts. Also, its resource efficiency makes it one of the most approachable models for developers testing video workflows on local GPUs.</p> <h4 id="weaknesses-2">Weaknesses</h4> <p>While Wan2.2 narrows the realism gap, its fine-texture detail such as lighting still trails larger models like Hunyuan in complex scenes. Some users also report longer inference times per frame under high-motion prompts due to the MoE routing overhead. Also, performance on multi-GPU scale-outs remains less documented than other models.</p> <p>Note: Wan2.2 replaces the concept of a “lightweight variant” from 2.1 (like the 1.3B model). In 2.2, the TI2V-5B model serves as the efficiency tier, and the A14B MoE models handle specialization.</p> <p>All of these comparisons highlight model capabilities, but developers must also weigh the practicalities of running them. This next section addresses this.</p> <h2 id="running-text-to-video-models">Running Text-to-Video Models</h2> <p>Text-to-video models introduce a whole new set of unique operational challenges. This means that the choice of a model isn’t as easy as picking the one that looks good. We have to find a model that fits into our existing workflow and hardware budget.</p> <h3 id="things-to-think-about-when-selecting-a-model">Things to Think About When Selecting a Model</h3> <ol><li><strong>Choose one with a Diffusers or ComfyUI integration.</strong> This saves setup time and gives you standardized preprocessing, inference, and visualization pipelines out of the box. Models without official integrations usually require more custom code or community wrappers.</li> <li><strong>Match model size to your GPU.</strong> Larger architectures often require datacenter GPUs to run at full resolution. Smaller or quantized variants can run on consumer hardware but typically produce shorter or lower-quality clips.</li> <li><strong>Prototype small, scale later.</strong> Start with low-resolution, short clips to confirm your pipeline works. Once the workflow is stable, you can increase resolution and clip length without wasting GPU hours on debugging.</li> <li><strong>Consider latency and cost as part of quality.</strong> Generating a few seconds of video can take several minutes on high-end hardware. Faster models or shorter clips might deliver better iteration speed, even if the visual quality is slightly lower.</li> <li><strong>Use optimization tools deliberately.</strong> Quantization, offloading, and multi-GPU parallelism can stretch hardware capacity, but each comes with trade-offs in speed, fidelity, or complexity. Apply them <em>only</em> where they make sense.</li></ol> <h2 id="closing-thoughts">Closing Thoughts</h2> <p>The text-to-video space is moving at a very fast clip, with new models claiming “state-of-the-art” being released every few weeks. The common message across these models is that there is no single “best” option, but a growing set of trade-offs.</p> <p>Some models prioritize realism while others are better at stylization or text rendering. Larger architectures allow for longer, higher-resolution clips, but require datacenter-class GPUs. Smaller variants reduce hardware requirements, making them more accessible, at the cost of fidelity. Ultimately, gains in one area lead to trade-offs in another.</p> <p>As GPUs become easier and cheaper to access, deploying open-source models like Hunyuan, Mochi, and Wan2.2 are becoming even more attractive options. At Modal, this is as simple as running our end-to-end\xA0<!>, but you can run any code on Modal in a cost-effective and developer-friendly way.</p>`,3);function E(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=T(),f=c(s(o),6);u(f,{children:(t,a)=>{var o=w(),u=c(s(o),2),f=c(e(u)),p=e(f);d(c(e(p)),{href:`/docs/examples/mochi`,children:(e,t)=>{l(),i(e,r(`deploy on Modal`))},$$slots:{default:!0}}),l(),n(p),l(3),n(f),l(),n(u),i(t,o)},$$slots:{default:!0}});var p=c(f,8),m=c(e(p));d(m,{href:`https://openai.com/sora/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sora`))},$$slots:{default:!0}}),d(c(m,2),{href:`https://klingai.com/global/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kling`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,4);d(c(e(h)),{href:`https://github.com/Tencent/HunyuanVideo/blob/main/assets/PenguinVideoBenchmark.csv#L12`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Penguin Video Benchmark`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2),_=e(g),v=e(_);v.muted=!0,l(2),n(_);var y=c(_,2),b=e(y);b.muted=!0,l(2),n(y);var x=c(y,2),ee=e(x);ee.muted=!0,l(2),n(x),n(g);var S=c(g,8),C=e(S);d(C,{href:`https://huggingface.co/tencent/HunyuanVideo`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hunyuan`))},$$slots:{default:!0}}),d(c(C,2),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`community Slack`))},$$slots:{default:!0}}),l(),n(S);var E=c(S,4),D=c(e(E),10);d(c(e(D),2),{href:`https://huggingface.co/Skywork/SkyReels-V1-Hunyuan-T2V`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SkyReels V1`))},$$slots:{default:!0}}),l(),n(D),n(E);var O=c(E,4),k=e(O),A=e(k);A.muted=!0,l(2),n(k);var j=c(k,2),M=e(j);M.muted=!0,l(2),n(j);var N=c(j,2),P=e(N);P.muted=!0,l(2),n(N),n(O);var F=c(O,22),I=e(F);d(I,{href:`https://github.com/genmoai/mochi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mochi`))},$$slots:{default:!0}}),d(c(I,2),{href:`https://artificialanalysis.ai/text-to-video/arena?tab=Leaderboard`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`leaderboards`))},$$slots:{default:!0}}),l(),n(F);var L=c(F,4),R=c(e(L),10),z=e(R);d(c(e(z)),{href:`/docs/examples/mochi`,children:(e,t)=>{l(),i(e,r(`Deployment on Modal`))},$$slots:{default:!0}}),n(z),n(R),n(L);var B=c(L,4),V=e(B),H=e(V);H.muted=!0,l(2),n(V);var U=c(V,2),W=e(U);W.muted=!0,l(2),n(U);var G=c(U,2),K=e(G);K.muted=!0,l(2),n(G),n(B);var q=c(B,8);d(c(e(q)),{href:`/docs/examples/mochi`,children:(e,t)=>{l(),i(e,r(`$0.33 per short clip on H100-class hardware`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,12);d(e(J),{href:`https://github.com/Wan-Video/Wan2.2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Wan2.2`))},$$slots:{default:!0}}),l(),n(J);var Y=c(J,10),X=e(Y),te=e(X);te.muted=!0,l(2),n(X);var Z=c(X,2),ne=e(Z);ne.muted=!0,l(2),n(Z);var Q=c(Z,2),re=e(Q);re.muted=!0,l(2),n(Q),n(Y);var $=c(Y,34);d(c(e($)),{href:`/docs/examples/mochi`,children:(e,t)=>{l(),i(e,r(`Mochi example`))},$$slots:{default:!0}}),l(),n($),i(t,o)},$$slots:{default:!0}}))}export{E as default,p as metadata};
//# sourceMappingURL=c0WNmrw3.js.map
