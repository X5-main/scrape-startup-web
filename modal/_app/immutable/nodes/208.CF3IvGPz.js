(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`39021ab6-2e71-4244-a708-0d88ad2da54e`,e._sentryDebugIdIdentifier=`sentry-dbid-39021ab6-2e71-4244-a708-0d88ad2da54e`)}catch{}})();import{r as e}from"../chunks/COtFpfH5.js";import{$t as t,Ft as n,St as r,Tn as i,_n as a,bt as o,fn as s,h as c,ht as l,m as u,tn as d,vn as f,wn as p}from"../chunks/F_ixKBiO.js";import{t as m}from"../chunks/BqPQayrc.js";import"../chunks/B1sc9Zdx.js";import{r as h}from"../chunks/stT5DusC2.js";import{n as g}from"../chunks/Dpvl1BDr.js";import{t as _}from"../chunks/DB3PWJo92.js";import{n as v,t as y}from"../chunks/C6JX7bmt.js";var b=()=>({title:`LLM Engineer's Almanac - Executive Summary | Modal`,ogTitle:`LLM Engineer's Almanac - Executive Summary`,ogDescription:`A summary of LLM engines for technical executives thinking about inference.`,ogImageUrl:`https://modal-cdn.com/llm-almanac/preview-image.png`}),x=e({load:()=>S}),S=b?m(b):void 0,C=r(`<div class="mx-auto mt-4"><!></div>`),w=r(`<div class="flex flex-col"><h1 class="mb-2 text-3xl font-bold">LLM Engines: An Executive Summary</h1> <img src="https://modal-cdn.com/llm-almanac/illustration-engine.png" alt="" class="aspect-video max-h-[350px] self-center"/> <div class="page-body text-xlg flex flex-col"><p class="svelte-1sj2xwt">Nearly every serious application of computer systems includes relational
      database management software, from local SQLite on phones to planet-scale
      Spanner in cloud data centers. These systems all trace their lineage back
      through <a href="https://people.eecs.berkeley.edu/~brewer/cs262/SystemR.pdf" class="svelte-1sj2xwt">IBM System R</a> to the <a href="https://www.ibm.com/docs/en/zos-basic-skills?topic=now-history-ims-beginnings-nasa" class="svelte-1sj2xwt">Information Management System</a> built to send humans to the Moon — or at least track all the bills of material
      for the rockets that carried them. In place of behemoth proprietary software
      built for specific systems at great expense, there is now a legion of open
      source software.</p> <p class="svelte-1sj2xwt">Language models are still closer in their lifecycle to the <a href="https://ieeexplore.ieee.org/document/5388096" class="svelte-1sj2xwt">Peterlee Relational Test Vehicle</a> than to Postgres, but they hold the same promise: to be a part of nearly
      every application of computer systems. When these applications need to store
      and retrieve structured data, they currently deduce following the relational
      algebra of Ted Codd; when they need to produce or process unstructured data,
      they will infer with neural probabilistic models.</p> <p class="svelte-1sj2xwt">The weights for capable language models are now widely available under
      permissive or open source licenses — the Llama, Qwen, DeepSeek, Mistral,
      and Gemma model families, to name a few. Over the past year, these models
      have rapidly improved, reaching the baseline of quality required for
      inference to be useful. This is a key step enabling organizations to serve
      their own language model applications. Below, we walk through the cases
      we've seen where it makes sense to use these models in place of
      proprietary systems.</p> <p class="svelte-1sj2xwt">But just as data needs a software system, the RDBMS, to manage storage and
      execute queries, language models need a software system to drive their
      inference, managing the storage of query caches and scheduling large
      matrix multiplications on specialized hardware.</p> <p class="svelte-1sj2xwt">Like SQL database engines, there are open source "LLM engines" you can run
      yourself. And like the models, this software stack has rapidly improved in
      both usability and performance over the past year — reaching the baseline
      of quality required for self-serve inference to be economical.</p> <p class="svelte-1sj2xwt">These engines are the primary subject of this report.</p> <p class="svelte-1sj2xwt">It answers the most common and most critical questions we hear asked by
      technical leaders interested in running their own LLM engines. It is
      informed by discussion with those leaders, with LLM engineers building
      applications, and with the developers of LLM engines. It grounds its
      claims in the same benchmarking work that supports our <a href="/llm-almanac/advisor" class="svelte-1sj2xwt">LLM Engine Advisor</a>, which indicates baseline performance for engines on specific workloads
      and provides starter code for running your own LLM engine on <a href="/" class="svelte-1sj2xwt">Modal's serverless cloud infrastructure</a>.</p> <h2 class="text-2xl font-semibold svelte-1sj2xwt">When should I use open weights language models instead of proprietary
      services like OpenAI or Anthropic?</h2> <p>Many organizations are already building LLM applications based on
      proprietary models that can't be self-hosted. So the first question to
      consider is when and why they should switch away from those services.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">The standard arguments for building technology in-house instead of buying
      apply here.</h3> <p class="svelte-1sj2xwt">The most common concern is data governance, which frequently mandates
      tight control of the servers that process user data. Worries about model
      providers secretly training on data are overblown, but legitimate
      requirements remain, especially in regulated industries.</p> <p class="svelte-1sj2xwt">The other most commonly-cited motivation is cost, familiar to anyone who
      has considered self-hosting anything. Competition (including from open
      models) has prevented any provider from charging too high of a premium.
      But when LLM applications mature and the requirements become clearer, the
      capabilities of the systems provided by frontier labs focused on
      artificial general intelligence or superintelligence become unnecessary.
      Those capabilities come at a cost, relative to a smaller model tuned or
      prompted carefully. Think of it like rewriting code from JavaScript or
      Python to Go or Rust once the feature velocity decreases. For details, see <a href="https://openpipe.ai/blog/a-founder-c-guide-to-ai-fine-tuning" class="svelte-1sj2xwt">this post</a> from one of our customers, OpenPipe, which provides post-training as a service.</p> <p class="svelte-1sj2xwt">This is just one instance of the kind of customization that's not possible
      or not economical with proprietary models. Limits here are similar to
      limits on extending proprietary software and we expect them to be
      similarly durable. Models are, after all, valuable intellectual property,
      and exposing them too much to tinkering and development risks leaking that
      IP. We expect customization to only increase in importance over time, as
      it has in domains like image generation, where open weights models are
      more mature. Organizations that move now will be better prepared for this
      future.</p> <p class="svelte-1sj2xwt">Finally, there is a less technical reason to consider this switch: the
      movement of OpenAI and Anthropic into the application layer. Releases like
      Claude Code and OpenAI Codex represent large steps away from language
      modeling and towards applications of language models. And we've seen this
      before: OpenAI's move to Chat Completions APIs (i.e. those for
      instruction-tuned models designed for chat) represented a large step
      towards applications relative to the original Completions APIs (i.e. those
      for models trained just to predict text).</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">Use open weights models when there's such a thing as "smart enough".</h3> <p class="svelte-1sj2xwt">Collaborative, open source solutions tend to win out over competitive,
      proprietary solutions when they <a href="http://www.catb.org/esr/writings/magic-cauldron/magic-cauldron.html" class="svelte-1sj2xwt">pool together labor and resources</a> to build non-differentiating capabilities — think programming languages,
      operating systems, and databases. These are needed by everyone, and almost
      no one gets enough competitive edge from building their own to make it worth
      the effort.</p> <p class="svelte-1sj2xwt">We see the same phenomenon with open weights* language models. Basic
      capabilities like code completion, assistant chat, and data extraction
      have been commoditized by open weights models. In each case, there's a
      maximum level of capability (or "intelligence") required to complete the
      task satisfactorily. Each fixed level of capability has been reached by
      the open weights models within a year, most recently by <a href="https://huggingface.co/deepseek-ai/DeepSeek-R1-0528" class="svelte-1sj2xwt">DeepSeek-R1-0528</a>, which goes toe-to-toe with OpenAI's six-month-old o3 on a number of
      benchmarks.</p> <p class="svelte-1sj2xwt">There are other cases where the demand for intelligence, like the demand
      for RAM in computing systems, is effectively unbounded. These cases
      include:</p> <div class="ml-8"><ul class="list-disc"><li>zero-sum competitive settings (politics, markets, &amp; other games)
          and</li> <li>settings with high tail risk (like human-off-the-loop control of
          computers, where <code>rm -rf ~/</code> is always only a few tokens away).</li></ul></div> <p class="svelte-1sj2xwt">There, we see a continued role for proprietary language models, just as
      there is still a role for proprietary database systems like Oracle,
      Microsoft SQL Server, and IBM Db2 (all in the top ten on <a href="http://db-engines.comhttps://db-engines.com/en/ranking" class="svelte-1sj2xwt">db-engines.com</a>).</p> <p class="svelte-1sj2xwt"><em>*We use the term "open weights" here instead of "open source", since in
        most cases the source code required to produce the weight binaries is
        not provided under an OSI-approved license (or at all). We expect this
        distinction to matter more, not less, in the future.</em></p> <h2 class="text-2xl font-semibold svelte-1sj2xwt">How do I make the build vs buy decision for LLM inference?</h2> <p>Open source databases like Postgres are often offered as managed services
      and used by everyone from startups to the Fortune 500. Open weights
      language models are no different. Startups like <a href="https://www.together.ai/" class="svelte-1sj2xwt">Together</a> and hyperscalers like <a href="https://aws.amazon.com/bedrock/" class="svelte-1sj2xwt">Amazon</a> are already offering inference
      as a service. So why run it yourself?</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">You can readily beat language model API providers on price if you're
      running batch workloads on shorter contexts.</h3> <p class="svelte-1sj2xwt">Chatting and code completion are the most popular applications of large
      language models, and they are both interactive. Engineering an
      interactive, streaming, and latency-sensitive language model application
      is challenging, just as it is for other computer systems (more on that
      below).</p> <p class="svelte-1sj2xwt">But LLMs can also perform other tasks that are less latency-sensitive,
      like extracting data from support chat logs or translating a large corpus
      of documents. There, throughput is the most important factor — the name of
      the game is queries per second. This setting is much easier to engineer
      and optimize, as described below, and so it's easier to beat managed
      services on price.</p> <p class="svelte-1sj2xwt">In one set of experiments, depicted below, we ran Meta's Llama 3.1 70B in
      8bit floating point precision. The test data has more input tokens than
      output tokens, as is common in retrieval-augmented generation (RAG) or
      structured data extraction. In particular, the inputs have 1024 tokens
      (about a page of text) and the outputs have 128 tokens (about a
      paragraph).</p> <p class="svelte-1sj2xwt">Both vLLM and SGLang ran at ~17 QPS per 8xH100 replica without any tuning.
      The chart below shows the median latency to first token as we varied the
      request rate. Sacrificing interactivity (~200 ms end-to-end, leftmost
      points) led to an 8x throughput increase (~4s end-to-end, rightmost
      points). Details of our method are <a href="/how-to-benchmark" class="svelte-1sj2xwt">here</a>.</p> <!> <p class="svelte-1sj2xwt">Running this configuration on <a href="/pricing" class="svelte-1sj2xwt">Modal's starter plan</a>,
      which has purely usage-based pricing, you can set up a batch system that
      processes ~20k tok/s with Llama 3.1 70B fp8 at ~50¢ per million tokens.
      Modal's paid plans allow this to scale up to hundreds of replicas. This
      compares favorably with published rates from API providers. For
      performance data for other configurations, see the <a href="/llm-almanac/advisor" class="svelte-1sj2xwt">LLM Engine Advisor</a> released along with this
      summary.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">Start by building your own batch "token factory" before you run a
      streaming token service.</h3> <p class="svelte-1sj2xwt">Many of us were introduced to language models in an interactive system,
      like OpenAI ChatGPT or Anthropic Claude, that streams the outputs. These
      systems are harder to set up and to run economically than batch systems,
      so start with batch.</p> <p class="svelte-1sj2xwt">This is typically the case in computing, where batch (say, Spotify
      Discover Weekly) precedes streaming (say, TikTok feeds). Consider: early
      computers started out as batch job machines, processing large bulks of
      data like the U.S. Census or company payrolls. Users submitted very large
      tasks, via punch cards, and then waited for them to finish. The
      interactivity we are used to today, derived from time-sharing systems like
      MULTICS/UNIX, was only added later.</p> <p class="svelte-1sj2xwt">It is in general better to start with the easier, batch case and then to
      build the more difficult one afterwards, with the benefit of hard-won
      experience. This is true both as a matter of your organization's internal
      technical growth and the development of the broader field of open source
      language model inference — i.e., outside of the handful of organizations
      that have driven the frontier so far.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">But don't write your own LLM engine (unless you're betting the company).</h3> <p class="svelte-1sj2xwt">If you're running the language model yourself, you need to think about the
      software used to pass inputs through those weights to create outputs —
      language model "inference" using an "LLM engine" or "LLM serving
      framework".</p> <p class="svelte-1sj2xwt">LLM engines are less complex than database management systems, but they
      are not simple software. Contemporary models are based on the Transformer
      architecture, which is optimized for efficiency during training. This is
      necessary to achieve the dizzying scale of frontier model training runs (<a href="https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year" class="svelte-1sj2xwt">estimated</a> at 6 x 10<sup>25</sup>, or ~100 mol, FLOPs). But it means that running
      this architecture efficiently when serving, say, chatbot requests is not
      as simple as writing a few lines of PyTorch.</p> <p class="svelte-1sj2xwt">One reason for the complication is the primacy of performance. Running
      large language models is expensive (often on the order of cents per
      thousand user queries), which incentivizes close attention to performance.
      Engineering for performance melts abstractions and reveals the thickets of
      complexity hidden underneath.</p> <p class="svelte-1sj2xwt">But it is nowhere nearly the complexity and expense of training your own
      model. If running LLMs is a key differentiating capability for your
      organization, building your own engine is worth considering. A small,
      talented team of engineers can start from published research and open
      source code and develop just the features you need within a few months.
      The primary technical risks are hum-drum: maintenance, churn, and tooling
      compatibility in a rapidly-changing field.</p> <p class="svelte-1sj2xwt">But the same arguments about differentiation used above to argue the case
      for using open weights also apply here. This is something many teams need
      to do, and now a number of them are collaborating to build it together —
      the topic of our next section. You can join them!</p> <h2 class="text-2xl font-semibold svelte-1sj2xwt">Which open source LLM engine should I choose?</h2> <p class="svelte-1sj2xwt">There are three main open source LLM engines: <a href="https://docs.vllm.ai/en/latest/" class="svelte-1sj2xwt">vLLM</a>, <a href="https://docs.sglang.ai/" class="svelte-1sj2xwt">SGLang</a>, and <a href="https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html" class="svelte-1sj2xwt">TensorRT-LLM</a>.</p> <p class="svelte-1sj2xwt">vLLM and SGLang are open source, open governance projects in the same
      basic mold as Postgres — to the point of both also coming out of the
      University of California, Berkeley. Contributions to these projects come
      from the usual suspects in infrastructure: large organizations like Red
      Hat, late-stage startups like Anyscale, and leading teams serving
      proprietary models like xAI. Both build on Meta's <a href="https://docs.pytorch.org/docs/stable/index.html" class="svelte-1sj2xwt">PyTorch framework</a>.</p> <p class="svelte-1sj2xwt"><a href="https://nvidia.github.io/TensorRT-LLM/index.html" class="svelte-1sj2xwt">TensorRT-LLM</a> is an open source but closed governance project by NVIDIA. It builds on top
      of NVIDIA's <a href="https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html" class="svelte-1sj2xwt">TensorRT</a> framework.</p> <p class="svelte-1sj2xwt">We'll cover the differences between these projects and how to pick which
      one to use below.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">All the engines stand on the shoulders of giants. All will get better as
      those giants get taller.</h3> <p class="svelte-1sj2xwt">Because of the high cost of large language model inference, performance is
      the first factor used to evaluate LLM engines. There is less daylight here
      than you might expect from the intensity of benchmark wars on social
      media. This is due to the fact that all of them are building with the same
      basic tools and constraints.</p> <p class="svelte-1sj2xwt">First, the limits of performance are set by the hardware. Hardware
      engineers refer often to the "speed-of-light" — not literally, but as the
      maximum speed at which the hardware can run, set by clock speeds and bus
      widths. Almost all open source LLM inference is done on NVIDIA GPUs and so
      has the same speed of light.</p> <p class="svelte-1sj2xwt">Unlike typical CPU workloads, <a href="/blog/gpu-utilization-guide#what-is-model-flops-utilization-mfu" class="svelte-1sj2xwt">LLM inference on GPUs frequently runs at a high fraction of the speed
        of light</a>, set by either the arithmetic bandwidth of the matrix multiplication
      hardware (<a href="/gpu-glossary/device-hardware/tensor-core" class="svelte-1sj2xwt">Tensor Cores</a>) or the memory bandwidth between <a href="/gpu-glossary/device-hardware/gpu-ram" class="svelte-1sj2xwt">GPU RAM</a> and the <a href="/gpu-glossary/device-hardware/register-file" class="svelte-1sj2xwt">registers</a> of the <a href="/gpu-glossary/device-hardware/streaming-multiprocessor" class="svelte-1sj2xwt">Streaming Multiprocessors</a>. This limits the domain for speedups to ~2-3x at most, absent
      algorithmic differences, which are generally small, due to rapid diffusion
      of innovations.</p> <p class="svelte-1sj2xwt">More deeply, the same basic stack is used by each of the engines — the <a href="/gpu-glossary/host-software/cuda-software-platform" class="svelte-1sj2xwt">CUDA software platform</a>, the <a href="https://docs.nvidia.com/cuda/cublas/index.html" class="svelte-1sj2xwt">CUDA Basic Linear Algebra Subroutine</a> (cuBLAS) library, and the <a href="https://docs.nvidia.com/cutlass/index.html" class="svelte-1sj2xwt">CUDA Templates for Linear Algebra Subroutines</a> (CUTLASS) kernel framework. In addition, vLLM and SGLang both use PyTorch.
      All of the engines stand to see their performance improve as new hardware is
      released and these bedrock libraries update to take advantage of it.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">vLLM and SGLang achieve comparable out-of-the-box performance. Other
      factors should drive your decision.</h3> <p class="svelte-1sj2xwt">We ran both vLLM and SGLang, out of the box, on dozens of LLM inference
      workloads. These workloads included models ranging in size from a few
      billion to nearly a trillion parameters and on sequence lengths ranging
      from one thousand to ten thousand tokens. The results were strikingly
      similar across the two frameworks especially when looking at throughput
      during batch processing -- see how closely the points hug the SGLang =
      vLLM line in the plot below. Read more about our methodology <a href="/llm-almanac/how-to-benchmark" class="svelte-1sj2xwt">here</a>.</p> <!> <p class="svelte-1sj2xwt">That means you'll need to consider other factors in making your decision.
      Because vLLM has been around for longer and has historically been faster
      to market with new features, we have accumulated more experience with it.
      But SGLang's recent rapid development is promising, and we're looking
      closely at both. A little competition is good for everyone (else).</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">In our experience, vLLM is fastest to the market with new features.</h3> <p class="svelte-1sj2xwt">At time of completion of our first round of experiments in late May 2025,
      TensorRT-LLM (<code>0.20.0.rc3</code>) did not support Gemma 3 or Qwen 3.</p> <p class="svelte-1sj2xwt">On SGLang (<code>0.4.6-post5-cu124</code>), we hit <a href="https://github.com/sgl-project/sglang/issues/6054" class="svelte-1sj2xwt">this issue</a> (resolved but not released) running DeepSeek-V3 in INT4 quant and CUDA OOMs
      when running Qwen 3 235B A22B we couldn't resolve in time for release.</p> <p class="svelte-1sj2xwt">We didn't find any workloads of interest that we couldn't run on vLLM (<code>0.8.x</code> and then <code>0.9.x</code>). We did, however, discover that we couldn't
      independently toggle CUDA graph capture and Torch graph compilation (also <a href="https://github.com/vllm-project/vllm/pull/17345" class="svelte-1sj2xwt">now resolved</a> but not released) as needed to match SGLang's behavior more closely. See the
      next section.</p> <p class="svelte-1sj2xwt">Finally, at time of our first release in early June 2025, SGLang did not
      have accelerated kernels for Blackwell GPUs like the <a href="/blog/introducing-b200-h200" class="svelte-1sj2xwt">B200</a> in a stable release, as they were still on PyTorch 2.6. Kernels <a href="/gpu-glossary/device-software/compute-capability" class="svelte-1sj2xwt">compiled for max performance</a> on the Blackwell <a href="/gpu-glossary/device-hardware/streaming-multiprocessor-architecture" class="svelte-1sj2xwt">SM architecture</a> were only added to PyTorch wheels in 2.7. Blackwell support, including partially-optimized
      kernels, was released for vLLM just as we wrapped up our work.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">Startup times are slower with vLLM than with SGLang by default — mostly
      due to Torch compilation.</h3> <p class="svelte-1sj2xwt">With the default settings, startup times for vLLM servers were much
      longer, around five minutes for 8B models to SGLang's one minute. In both
      cases, model weights were loaded from <a href="/docs/guide/model-weights" class="svelte-1sj2xwt">our distributed model cache</a> at about the same rate, ~1 GB/s.</p> <p class="svelte-1sj2xwt">The primary difference is in the out-of-the-box configuration. vLLM turns
      Torch graph compilation on by default. Compilation can improve
      performance, in particular for models that don't have custom fused kernels
      available, but it incurs a startup cost that is hard to manage with
      cacheing (<a href="https://docs.pytorch.org/tutorials/recipes/torch_compile_caching_tutorial.html" class="svelte-1sj2xwt">docs</a>).</p> <p class="svelte-1sj2xwt">Separately, both frameworks use CUDA graph capture, which also reduces
      latency, in particular at low (~3-5ms) inter-token latencies. CUDA graph
      capture is simpler and faster than Torch graph compilation — as short as a
      few seconds in recent versions of vLLM.</p> <p class="svelte-1sj2xwt">vLLM has recently <a href="https://docs.vllm.ai/en/latest/design/v1/torch_compile.html" class="svelte-1sj2xwt">bet heavily on Torch compilation</a>, while SGLang seems to have <a href="https://github.com/sgl-project/sglang/issues/4748" class="svelte-1sj2xwt">done the opposite</a>. Which choice turns out to be best will depend on the progress of that
      project.</p> <h3 class="text-xl font-semibold svelte-1sj2xwt">TensorRT-LLM can provide big wins, especially at the lowest latencies —
      but don't underestimate the engineering cost.</h3> <p class="svelte-1sj2xwt">While vLLM and SGLang are strikingly similar in many ways, TensorRT-LLM is
      quite different. Its Python interface is a thinner wrapper over the
      underlying <a href="/gpu-glossary/host-software/cuda-c" class="svelte-1sj2xwt">CUDA C++</a> software
      than theirs. TensorRT-LLM also requires the LLM engine be compiled ahead of
      time per workload. These artifacts are stored on disk, which reduces startup
      times, but this extra manual build step adds complexity. Our sample code for
      running it on Modal is thus about three times longer, at 150 lines to 50 for
      the other two frameworks.</p> <p class="svelte-1sj2xwt">And out of the box, we observe worse performance with TensorRT-LLM than
      with vLLM or SGLang. This is to be expected, since there is no intention
      by the developers that the default settings should be used in production
      serving, but it makes an apples-to-apples benchmark challenging.</p> <p class="svelte-1sj2xwt">Instead, TensorRT-LLM's build step exposes a bewildering array of un- or
      under-documented flags and parameters, like <code>--reduce-fusion</code> (presented as a strict improvement for end-to-end performance in the <a href="https://nvidia.github.io/TensorRT-LLM/commands/trtllm-build.html" class="svelte-1sj2xwt">docstring</a>, caveats explained <a href="https://nvidia.github.io/TensorRT-LLM/performance/performance-tuning-guide/useful-build-time-flags.html#reduce-norm-fusion-plugin-for-llama-models" class="svelte-1sj2xwt">elsewhere</a>). It is widely reported, and we have observed in a few cases, that the
      proper setting of these flags can make a substantial difference in
      performance, including going from much slower than the other engines to
      much faster.</p> <p class="svelte-1sj2xwt">This is a tough challenge for engineers and engineering leaders — is it
      worth it to pour a few weeks of very expensive engineering time into this
      tuning? That depends on what speedup is possible. Reported numbers help,
      but in our experience, the impact of configuration changes is very
      sensitive to surprising features of workloads, including features that
      might change during serving, so estimation is challenging and churn is
      high.</p> <p class="svelte-1sj2xwt">Another engineering challenge arises from the TensorRT-LLM development
      model. Until the release of <code>v0.19.0</code> in mid-May 2025, TensorRT-LLM's <a href="https://github.com/NVIDIA/TensorRT-LLM" class="svelte-1sj2xwt">source code on GitHub</a> was updated per release, many thousands of lines at a time. Seemingly, this
      was done to mirror in bulk a large number of changes made to an internal GitLab
      repo during actual development. This made it essentially impossible to connect
      changes in code to changes in behavior (using tools like <code>git bisect</code>, for instance). These releases also offered no
      backwards compatibility guarantee, so every update was a tedious, manual
      process requiring careful review of documentation, examples, and code.
      According to a <a href="https://github.com/NVIDIA/TensorRT-LLM/issues/3148" class="svelte-1sj2xwt">recent announcement</a>, they have officially adopted a "GitHub-first" development flow. Very
      welcome! At time of writing in late July 2025, they have put out
      candidates for a <code>1.0</code> release, which should reduce churn.</p> <p class="svelte-1sj2xwt">Our current practice when we approach a new workload is to try vLLM or
      SGLang first, get benchmark numbers as quickly as possible, do some light
      tuning, and compare results to latency objectives. If those frameworks
      meet the objective, we presume that the performance benefits of
      TensorRT-LLM aren't worth the extra complexity, brittleness, and delays in
      time-to-market until proven otherwise.</p> <p class="svelte-1sj2xwt">Meanwhile, we are slowly accumulating and sharing optimized TensorRT-LLM
      configurations as we discover them. We welcome contributions <a href="https://github.com/modal-labs/stopwatch/blob/main/CONTRIBUTING.md" class="svelte-1sj2xwt">here</a>. The biggest win we've seen so far came in a case where latency was at a
      premium but cost efficiency was not — perhaps unsurprising for software
      written by the hardware provider. That case is described in detail in our
      docs <a href="/docs/examples/trtllm_latency" class="svelte-1sj2xwt">here</a>.</p> <h2 class="text-2xl font-semibold svelte-1sj2xwt">What next?</h2> <p class="svelte-1sj2xwt">If you either know what workload you want to run or are curious to see our
      results in more detail, check out the <a href="/llm-almanac/advisor" class="svelte-1sj2xwt">LLM Engine Advisor</a>, which reports the latency numbers (time-to-first-token,
      time-to-last-token, and inter-token latency) we observed across a variety
      of request rate loads for popular open weights models run with vLLM,
      SGLang, and TensorRT-LLM. Code snippets are included.</p> <p class="svelte-1sj2xwt">If you'd like to know more about how to think about and benchmark LLM
      engine performance, check out our <a href="/llm-almanac/how-to-benchmark" class="svelte-1sj2xwt">benchmarking guide</a>.</p></div></div>`);function T(e,r){f(r,!0);let m=()=>c(D,`$data`,x),b=()=>c(O,`$error`,x),[x,S]=u(),T=s(_),E=s(()=>Math.min(600,n(T)-10)),{data:D,error:O}=h(`https://modal-cdn.com/llm-almanac/all-results-2025-05-24.json`,{revalidateOnFocus:!1}),k=s(()=>v(m()?.rows??[],[],`ttft_p95`)),A=s(()=>n(k).filteredRows),j=s(()=>({rows:n(A)})),M=e=>({$schema:`https://vega.github.io/schema/vega-lite/v6.json`,description:`A scatter plot of different LLM model run configurations, comparing vLLM and SGLang engines.`,data:{name:`rows`},height:n(E),width:n(E),autosize:{type:`fit`,resize:!0},layer:[{data:{values:e===`throughput`?[{x:0,y:0},{x:28,y:28}]:[{x:0,y:0},{x:.5,y:.5}]},mark:{type:`line`,strokeWidth:2,strokeDash:[12,8],clip:!0,opacity:1,color:`lightgrey`},encoding:{x:{field:`x`},y:{field:`y`}}},{mark:{type:`point`,tooltip:{content:`data`},clip:!0,filled:!0,size:160},transform:[{filter:`datum['rate_type'] === '${e}'`},{pivot:`framework`,groupby:[`model`,`prompt_tokens`,`generated_tokens`,`gpu`],value:e===`throughput`?`queries_per_second`:`ttft_p90`,op:e===`throughput`?`max`:`min`},{calculate:e==`throughput`?`datum.vllm > datum.sglang ? 'vllm' : 'sglang'`:`datum.vllm > datum.sglang ? 'sglang' : 'vllm'`,as:`which_is_better`}],encoding:{color:{field:`which_is_better`,type:`nominal`,scale:{domain:[`vllm`,`sglang`],range:[`#6b6ecf`,`#d6616b`,`#888888`]},legend:{title:`Which is better?`}}}}],encoding:{x:{title:e===`throughput`?[`vLLM throughput (requests/s)`,`Higher is better →`]:[`vLLM TTFT latency p90 (s)`,`← Lower is better`],field:`vllm`,type:`quantitative`},y:{title:e===`throughput`?[`SGLang throughput (requests/s)`,`Higher is better →`]:[`SGLang TTFT latency p90 (s)`,`← Lower is better`],field:`sglang`,type:`quantitative`}}});var N=w(),P=d(t(N),4),F=d(t(P),56);{let e=s(()=>m()?.rows.filter(e=>e.rate_type==`constant`));y(F,{get clientWidth(){return n(T)},filterConditions:[{column:`model`,type:`eq`,value:`Llama 3.1 70B fp8`},{column:`task`,type:`eq`,value:`retrieval`}],selectedYMetricGroupKey:`ttft`,selectedYMetricAggregateKey:`p50`,get rows(){return n(e)},get loadingError(){return b()},hideCodeSample:!0,hideFilters:!0})}var I=d(F,48),L=e=>{var r=C(),a=t(r);{let e=s(()=>({rows:n(j).rows.filter(e=>[`vllm`,`sglang`].includes(e.framework))})),t=s(()=>M(`throughput`));g(a,{get data(){return n(e)},viewVL:void 0,get spec(){return n(t)},isMobile:!1})}i(r),o(e,r)};l(I,e=>{m()&&e(L)}),p(44),i(P),i(N),o(e,N),a(),S()}export{T as component,x as universal};
//# sourceMappingURL=208.CF3IvGPz.js.map
