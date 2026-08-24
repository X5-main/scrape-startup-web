(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`700d2d55-0a16-43e9-8626-9f396ad62c16`,e._sentryDebugIdIdentifier=`sentry-dbid-700d2d55-0a16-43e9-8626-9f396ad62c16`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";var f={crossLinks:[{text:`Serve SGLang with ultra low latency`,href:`/docs/examples/sglang_low_latency`},{text:`Scale up vLLM 10x faster`,href:`/docs/examples/vllm_snapshot`},{text:`Maximize token throughput in batch LLM processing`,href:`/docs/examples/vllm_throughput`}],toc:[{depth:1,value:`High-performance LLM inference`,id:`high-performance-llm-inference`,children:[{depth:2,value:`Achieving high throughput LLM inference (TPS)`,id:`achieving-high-throughput-llm-inference-tps`,children:[{depth:3,value:`High throughput LLM inference on Modal`,id:`high-throughput-llm-inference-on-modal`}]},{depth:2,value:`Minimizing LLM inference latency (TTFT/TPOT/TTLT)`,id:`minimizing-llm-inference-latency-ttfttpotttlt`,children:[{depth:3,value:`Low latency LLM inference on Modal`,id:`low-latency-llm-inference-on-modal`}]},{depth:2,value:`High performance LLM inference for bursty workloads (cold start time)`,id:`high-performance-llm-inference-for-bursty-workloads-cold-start-time`,children:[{depth:3,value:`Serving bursty LLM inference workloads on Modal`,id:`serving-bursty-llm-inference-workloads-on-modal`}]}]}],rawContent:`# High-performance LLM inference

This high-level guide documents the key techniques used to achieve high performance
when running LLM inference on Modal.

Open weights models and open source inference engines have
closed much of the gap with proprietary models and proprietary engines
and continue to improve as they attract work from a broad community.
It is now and will increasingly be economical to run many generative AI applications in-house,
rather than relying on external providers.

Achieving competitive performance and cost is not instantaneous, however.
It requires some thought and tuning.
And LLM inference is in many ways quite different to the web serving and database workloads
that engineers are used to deploying and optimizing.

This guide collects techniques we have seen work in production inference deployments.
We include code samples so that you can try high-performance LLM inference for yourself.

We split the guide by the key performance criterion that matters for the workload:

- **[throughput](#achieving-high-throughput-llm-inference-tps)**,
  for large "jobs" made of many parallel requests that are only finished when they all finish,
- **[latency](#minimizing-llm-inference-latency-ttfttpotttlt)**,
  for serving each individual request as fast as possible, usually on human-interactive timescales,
- **[cold start time](#high-performance-llm-inference-for-bursty-workloads-cold-start-time)**,
  for bursty workloads that mix latency- and throughput-sensitive components.

This high-level guide and the attendant code samples are intended to kick-start
your own process of inference deployment and performance optimization.
You can find [baseline benchmarks](/llm-almanac/advisor)
and [benchmarking recommendations](/llm-almanac/how-to-benchmark)
in our [LLM Engineer's Almanac](/llm-almanac/workloads).

If you just want to get started running a basic LLM server on Modal, see
[this example](https://modal.com/docs/examples/llm_inference).
If you just want to dive into code, see
[this example for high throughput](https://modal.com/docs/examples/vllm_throughput),
[this example for low latency](https://modal.com/docs/examples/sglang_low_latency),
and [this example for low cold start time](https://modal.com/docs/examples/sglang_snapshot).

## Achieving high throughput LLM inference (TPS)

The quintessential "high throughput" LLM inference workload is a database backfill:
on a trigger, a large number (100s or more) of rows need to be processed,
e.g. to produce a sentiment score as part of an analytics pipeline
or to produce a generation that will be scored as part of offline evals.
No person or system is waiting on the result from any particular row.

Performance is defined by _throughput_, the rate at which tasks are completed,
which translates to end-to-end latency for the entire job.
For most deployments, this in turn directly determines cost.
It is measured in tokens per second (TPS).

Many, but not all, high throughput LLM inference applications have large contexts and small outputs,
which means they are dominated by prefill/prompt processing time, rather than decode/token generation time.
Combined with batching that increases
[arithmetic intensity](https://modal.com/gpu-glossary/perf/arithmetic-intensity),
throughput-oriented LLM inference jobs are generally
[compute-bound](https://modal.com/gpu-glossary/perf/compute-bound).

In general, high throughput is easier to achieve than low latency.
GPUs are inherently [designed for maximum throughput](https://modal.com/gpu-glossary/perf/latency-hiding).
Additionally, LLM training is a throughput-sensitive workload, so good kernels
are typically made available open source earlier.

For instance, the [Flash Attention 4 kernel](/blog/reverse-engineer-flash-attention-4)
that extends the Flash Attention kernel series to [Blackwell GPUs](https://modal.com/blog/introducing-b200-h200)
is, at time of writing months after its initial release,
primarily suitable for throughput-sensitive applications -- but watch this space!

For related reasons, we don't recommend using 4bit floating point (FP4) for these jobs.
FP4 is only supported in [Blackwell or later GPUs](https://modal.com/gpu-glossary/device-software/compute-capability).
Instead, we recommend the more mature 8bit floating point (FP8),
supported in Hopper or later GPUs (one generation back).

On Modal, the [rates](/pricing) for 16bit FLOP/$ are roughly the same across
A100s, H100s, and B200s -- newer GPUs run faster but cost more to match.
So peak throughput per _dollar_ per replica is roughly the same,
even though throughput per _second_ per replica is lower.

But older GPUs running at lower rates offer a few advantages:

- any time spent [underutilizing the GPUs](/blog/gpu-utilization-guide) is less expensive
- GPUs a generation or two back are generally available in larger quantities from hyperscalers

Throughput-oriented jobs don't necessarily benefit from scaling up each replica to more GPUs.
The aggregate throughput is the same as more replicas with fewer GPUs,
but fewer GPUs means reduced communication overhead and
reduced complexity, especially for single GPU-per-replica deployments.
Importantly, you must be able to fit a large enough batch of sequences
into the [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
that you are compute-bound, or else efficiency will decrease.

We recommend the [vLLM](https://vllm.ai/) inference server for this use case.
It is better able to schedule a mix of prefill and decode work,
which leads to higher throughput.

### High throughput LLM inference on Modal

The lack of latency constraints opens up a large number
of architectural choices for high throughput LLM inference.

For instance, values can be retrieved from an external datastore
or a [Modal Volume](/docs/guide/volumes)
based on identifiers or other information in the datastore.
This is particularly useful for
[cronjob deployments on Modal](/docs/guide/cron).
Results can then be placed back in that datastore.

Modal provides primitives for building a
[job queue](/docs/guide/job-queue)
that can scale to millions of pending inputs
and jobs that last up to a week.
In this case, the underlying LLM inference is provided by a
[Modal Cls](/docs/guide/lifecycle-functions)
invoked via
[\`.spawn\`](/docs/guide/job-queue).
Each call gets a string
[\`modal.FunctionCall\` identifier](/docs/sdk/py/latest/FunctionCall)
that can be used to query the result for up to a week.

The primary scaling limit from Modal in this case is the rate at which these calls can be queued.
If the inference system can complete more than 400 tasks per second,
we recommend batching multiple tasks into a single Function input until peak throughput
in tasks per second is serviced by 400 inputs per second.

See [this code sample](https://modal.com/docs/examples/vllm_throughput)
for a system that implements these recommendatons and
achieves maximal per-replica throughput.

## Minimizing LLM inference latency (TTFT/TPOT/TTLT)

The quintessential "low latency" LLM inference workload is a chatbot:
each request represents a waiting user, and users operate at the scale of a few hundred milliseconds.
Generating a token of usefully intelligent text often also takes on the order of milliseconds,
and users want many tokens in responses, so latency budgets are tight.

Performance is defined by _latency_, the time a given task spends waiting.
It is measured in time-to-first-token (TTFT) and time-per-output-token (TPOT)
or in time-to-last-token (TTLT),
depending on to what degree the application supports streaming responses.
For streaming applications, like most chatbots, TTFT matters most.

To whatever degree the application does support streaming, it is strongly recommended
to improve perceived latency by users.
Contemporary Transformer language models are sequential and so generate their responses
serially, leading to long gaps between the creation of the first token in a response and the last.

These long decode or token generation phases demand quite different performance
from hardware than long prefills do.
They are typically [memory-bound](https://modal.com/gpu-glossary/perf/memory-bound)
and so benefit from techniques that reduce the amount of memory loaded per token into the
[Streaming Multiprocessors](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor)
or increase the amount of available
[memory bandwidth](https://modal.com/gpu-glossary/perf/memory-bandwidth).

Several techniques can reduce the amount of memory loaded per token:

- smaller and more aggressively [quantized](https://quant.exposed) models require less memory
- [speculative decoding](https://huggingface.co/docs/text-generation-inference/en/conceptual/speculation)
  generates multiple tokens at once via draft models

For memory-bound workloads, quantizing a model to a format not natively supported by the hardware
can still sometimes lead to gains.
The reduced demand on memory bandwidth cuts memory latency and there is generally sufficient unused
[arithmetic bandwidth](https://modal.com/gpu-glossary/perf/arithmetic-bandwidth)
to perform extra numerical conversions.

There are a wide variety of speculative decoding techniques, ranging from simple n-gram speculation
to stacks of models drafting tokens for each other in sequence.
We have generally found that the [EAGLE-3 method](https://arxiv.org/abs/2503.01840)
provides the best performance improvement for the least overhead --
computationally and operationally.
Generic draft models are available on Hugging Face,
but we have also seen major improvements from custom draft models
trained on sample production data using tools like
[SpecForge](https://lmsys.org/blog/2025-07-25-spec-forge/).

Additionally, using multiple GPUs to generate a single token increases the aggregate memory bandwidth,
at the cost of some extra communication.
Critically, multiple accelerators need to be used to load model weights in parallel,
or latency will not be reduced.
That means the usual form of parallelism used to reduce latency is _tensor parallelism_,
which splits up individual matrix multiplications across GPUs,
rather than _pipeline parallelism_,
which splits the entire model across GPUs.

There are few models below 70B parameters that work well in 4bit floating point
(with exceptions like [GPT-OSS](https://modal.com/docs/examples/gpt_oss_inference)).
Additionally, at time of writing in early 2026, there are not high-quality open source
Blackwell-optimized kernels for latency-sensitive LLM inference.
Therefore, we generally recommend FP8-quantized models on H100s or H200s.

Finally, we recommend the [SGLang](https://docs.sglang.io/)
inference engine for these workloads.
SGLang generally exhibits lower host overhead --
time when the GPU idles waiting on the CPU --
for decode-heavy workloads, especially for smaller models.
You can read more about host overhead and its solutions in
[this blog post](/blog/host-overhead-inference-efficiency).

### Low latency LLM inference on Modal

For latency budgets in the few hundreds of milliseconds,
network latencies and proxy/load-balancing overhead matter --
communicating with clients across an ocean takes dozens of milliseconds,
due to speed-of-light constraints.

Modal offers ultra-low-latency, regionalized web server deployment with
[Modal Servers](https://modal.com/docs/guide/servers#servers)
to reduce network overhead below 100ms.

You can find an example demonstrating all the pieces of
low latency LLM inference on Modal together
[here](https://modal.com/docs/examples/sglang_low_latency).

## High performance LLM inference for bursty workloads (cold start time)

The final major class of workloads sits between pure throughput and pure latency.
The quintessential application is a "workflow" where LLM inference is one workflow step,
and the workflow is sometimes run interactively by a human and at other times run asynchronously in bulk.

For these applications, the primary concern is handling the high
[peak-to-average load ratio](https://brooker.co.za/blog/2023/03/23/economics.html).
For instance, a pipeline might serve zero requests per second most of the time,
then ten for a bit, then one hundred, then back down to zero.
Statically provisioning enough resources to handle one hundred requests is clearly wasteful,
but spinning up new resources on demand incurs latency.

The key performance criterion, then, is
[_cold start time_](/docs/guide/cold-start):
how long does it take for a new replica to spin up and start handling requests.
On a typical cloud deployment, that includes instance requisition, machine boot, and container setup.
We've written about the resource allocation challenges [here](/blog/gpu-utilization-guide).

Approaches based on requesting resources from clouds directly take minutes to tens of minutes.
Modal has been designed from the kernel up to provide sub-second latencies
all the way through to container start.
From there, the primary performance concern is speeding up server startup.

- **Use small models and quantize aggressively**.
  Models can be loaded from a [Modal Volume](/docs/guide/volumes)
  at a rate of 1-2 GB/s. That means you're incurring nearly a second of cold start latency
  per gigabyte of model weights. More exotic compression formats, like integer quantization
  or even ternary quantization, are particularly helpful here, even when they don't improve
  latency during inference.

- **Skip compilation steps**.
  Optimizations like CUDA Graph capture, JIT-compiled kernels, and Torch compilation
  are great for improving latency and throughput but they are generally quite tricky to cache
  and cache hits sometimes take nearly as long as cache misses.
  That often means a large latency penalty from compilation on each boot,
  and latencies can easily range into the tens of seconds or even tens of minutes.

- **Restore from snapshots**.
  In some cases, startup-time work like JIT compilation is unavoidable.
  For these workloads, Modal provides
  [Memory Snapshots](/docs/guide/memory-snapshots):
  the full in-memory state of a container just before it is ready to
  handle requests is serialized to disk and future container starts
  only need to deserialize this back into memory.
  Modal includes support for
  [GPU Memory Snapshots](/blog/gpu-mem-snapshots)
  so that GPU-accelerated LLM inference servers can be snapshot as well.
  Memory snapshotting is powerful
  ([we've observed 10x reductions in cold start time](/blog/gpu-mem-snapshots)),
  but it requires some code modification, described below.

Which optimizations discussed above apply
depend on the balance of the workload between low latency and high throughput.
But a few general statements can be made.
For instance, speculative decoding is generally a bad choice,
since it harms performance in the high throughput regime.

Relatedly, we don't have a particular recommendation between vLLM and SGLang here.
Besides the points made above about host overhead latency vs bulk throughput,
the primary difference we have seen is that vLLM is a bit faster to market with new models
and new features, but SGLang is a bit easier to hack on and extend.

### Serving bursty LLM inference workloads on Modal

Modal's rapid autoscaling infrastructure,
from [the custom container runtime and filesystem](/blog/jono-containers-talk),
to [memory snapshot support](/blog/gpu-mem-snapshots),
is particularly well-suited
to bursty LLM inference workloads.

These workloads can either be served by vanilla
[Functions](/docs/guide/apps)
invoked via remote Python calls or as
[Web Functions](/docs/guide/webhooks)
invoked via HTTP.
Web Functions are better for integrating with a variety
of producers and consumers.
The tradeoff of lower overhead for increased complexity
with [Modal Servers](https://modal.com/docs/guide/servers#servers) is generally not worth it.

The [\`@modal.concurrent\` decorator](/docs/guide/concurrent-inputs)
supports setting both a limit (\`max_inputs\`)
and a target (\`target_inputs\`).
Set the limit higher than the target to absorb load increases into
existing capacity (typically at the expense of longer latency).
Make sure that the inference server is configured to handle batches as large as \`max_inputs\`
without internal queueing!

Almost all GPU programs can be snapshot, but most GPU programs
require some code changes to be snapshot.
For instance, both the vLLM and SGLang inference servers require
manual offloading of weights/KV cache to CPU memory before snapshotting.

For details, see our full sample code for running bursty workloads on Modal
with vLLM [here](https://modal.com/docs/examples/vllm_snapshot)
and with SGLang [here](https://modal.com/docs/examples/sglang_snapshot).
`,meta:{title:`High-performance LLM inference`,description:`This high-level guide documents the key techniques used to achieve high performance when running LLM inference on Modal.`}},{crossLinks:p,toc:m,rawContent:h,meta:re}=f,ie=t(`<code>.spawn</code>`),ae=t(`<code>modal.FunctionCall</code> identifier`,1),oe=t(`<em>cold start time</em>`),se=t(`<code>@modal.concurrent</code> decorator`,1),ce=t(`<!> <p>This high-level guide documents the key techniques used to achieve high performance
when running LLM inference on Modal.</p> <p>Open weights models and open source inference engines have
closed much of the gap with proprietary models and proprietary engines
and continue to improve as they attract work from a broad community.
It is now and will increasingly be economical to run many generative AI applications in-house,
rather than relying on external providers.</p> <p>Achieving competitive performance and cost is not instantaneous, however.
It requires some thought and tuning.
And LLM inference is in many ways quite different to the web serving and database workloads
that engineers are used to deploying and optimizing.</p> <p>This guide collects techniques we have seen work in production inference deployments.
We include code samples so that you can try high-performance LLM inference for yourself.</p> <p>We split the guide by the key performance criterion that matters for the workload:</p> <ul><li><strong><!></strong>,
for large “jobs” made of many parallel requests that are only finished when they all finish,</li> <li><strong><!></strong>,
for serving each individual request as fast as possible, usually on human-interactive timescales,</li> <li><strong><!></strong>,
for bursty workloads that mix latency- and throughput-sensitive components.</li></ul> <p>This high-level guide and the attendant code samples are intended to kick-start
your own process of inference deployment and performance optimization.
You can find <!> and <!> in our <!>.</p> <p>If you just want to get started running a basic LLM server on Modal, see <!>.
If you just want to dive into code, see <!>, <!>,
and <!>.</p> <!> <p>The quintessential “high throughput” LLM inference workload is a database backfill:
on a trigger, a large number (100s or more) of rows need to be processed,
e.g. to produce a sentiment score as part of an analytics pipeline
or to produce a generation that will be scored as part of offline evals.
No person or system is waiting on the result from any particular row.</p> <p>Performance is defined by <em>throughput</em>, the rate at which tasks are completed,
which translates to end-to-end latency for the entire job.
For most deployments, this in turn directly determines cost.
It is measured in tokens per second (TPS).</p> <p>Many, but not all, high throughput LLM inference applications have large contexts and small outputs,
which means they are dominated by prefill/prompt processing time, rather than decode/token generation time.
Combined with batching that increases <!>,
throughput-oriented LLM inference jobs are generally <!>.</p> <p>In general, high throughput is easier to achieve than low latency.
GPUs are inherently <!>.
Additionally, LLM training is a throughput-sensitive workload, so good kernels
are typically made available open source earlier.</p> <p>For instance, the <!> that extends the Flash Attention kernel series to <!> is, at time of writing months after its initial release,
primarily suitable for throughput-sensitive applications — but watch this space!</p> <p>For related reasons, we don’t recommend using 4bit floating point (FP4) for these jobs.
FP4 is only supported in <!>.
Instead, we recommend the more mature 8bit floating point (FP8),
supported in Hopper or later GPUs (one generation back).</p> <p>On Modal, the <!> for 16bit FLOP/$ are roughly the same across
A100s, H100s, and B200s — newer GPUs run faster but cost more to match.
So peak throughput per <em>dollar</em> per replica is roughly the same,
even though throughput per <em>second</em> per replica is lower.</p> <p>But older GPUs running at lower rates offer a few advantages:</p> <ul><li>any time spent <!> is less expensive</li> <li>GPUs a generation or two back are generally available in larger quantities from hyperscalers</li></ul> <p>Throughput-oriented jobs don’t necessarily benefit from scaling up each replica to more GPUs.
The aggregate throughput is the same as more replicas with fewer GPUs,
but fewer GPUs means reduced communication overhead and
reduced complexity, especially for single GPU-per-replica deployments.
Importantly, you must be able to fit a large enough batch of sequences
into the <!> that you are compute-bound, or else efficiency will decrease.</p> <p>We recommend the <!> inference server for this use case.
It is better able to schedule a mix of prefill and decode work,
which leads to higher throughput.</p> <!> <p>The lack of latency constraints opens up a large number
of architectural choices for high throughput LLM inference.</p> <p>For instance, values can be retrieved from an external datastore
or a <!> based on identifiers or other information in the datastore.
This is particularly useful for <!>.
Results can then be placed back in that datastore.</p> <p>Modal provides primitives for building a <!> that can scale to millions of pending inputs
and jobs that last up to a week.
In this case, the underlying LLM inference is provided by a <!> invoked via <!>.
Each call gets a string <!> that can be used to query the result for up to a week.</p> <p>The primary scaling limit from Modal in this case is the rate at which these calls can be queued.
If the inference system can complete more than 400 tasks per second,
we recommend batching multiple tasks into a single Function input until peak throughput
in tasks per second is serviced by 400 inputs per second.</p> <p>See <!> for a system that implements these recommendatons and
achieves maximal per-replica throughput.</p> <!> <p>The quintessential “low latency” LLM inference workload is a chatbot:
each request represents a waiting user, and users operate at the scale of a few hundred milliseconds.
Generating a token of usefully intelligent text often also takes on the order of milliseconds,
and users want many tokens in responses, so latency budgets are tight.</p> <p>Performance is defined by <em>latency</em>, the time a given task spends waiting.
It is measured in time-to-first-token (TTFT) and time-per-output-token (TPOT)
or in time-to-last-token (TTLT),
depending on to what degree the application supports streaming responses.
For streaming applications, like most chatbots, TTFT matters most.</p> <p>To whatever degree the application does support streaming, it is strongly recommended
to improve perceived latency by users.
Contemporary Transformer language models are sequential and so generate their responses
serially, leading to long gaps between the creation of the first token in a response and the last.</p> <p>These long decode or token generation phases demand quite different performance
from hardware than long prefills do.
They are typically <!> and so benefit from techniques that reduce the amount of memory loaded per token into the <!> or increase the amount of available <!>.</p> <p>Several techniques can reduce the amount of memory loaded per token:</p> <ul><li>smaller and more aggressively <!> models require less memory</li> <li><!> generates multiple tokens at once via draft models</li></ul> <p>For memory-bound workloads, quantizing a model to a format not natively supported by the hardware
can still sometimes lead to gains.
The reduced demand on memory bandwidth cuts memory latency and there is generally sufficient unused <!> to perform extra numerical conversions.</p> <p>There are a wide variety of speculative decoding techniques, ranging from simple n-gram speculation
to stacks of models drafting tokens for each other in sequence.
We have generally found that the <!> provides the best performance improvement for the least overhead —
computationally and operationally.
Generic draft models are available on Hugging Face,
but we have also seen major improvements from custom draft models
trained on sample production data using tools like <!>.</p> <p>Additionally, using multiple GPUs to generate a single token increases the aggregate memory bandwidth,
at the cost of some extra communication.
Critically, multiple accelerators need to be used to load model weights in parallel,
or latency will not be reduced.
That means the usual form of parallelism used to reduce latency is <em>tensor parallelism</em>,
which splits up individual matrix multiplications across GPUs,
rather than <em>pipeline parallelism</em>,
which splits the entire model across GPUs.</p> <p>There are few models below 70B parameters that work well in 4bit floating point
(with exceptions like <!>).
Additionally, at time of writing in early 2026, there are not high-quality open source
Blackwell-optimized kernels for latency-sensitive LLM inference.
Therefore, we generally recommend FP8-quantized models on H100s or H200s.</p> <p>Finally, we recommend the <!> inference engine for these workloads.
SGLang generally exhibits lower host overhead —
time when the GPU idles waiting on the CPU —
for decode-heavy workloads, especially for smaller models.
You can read more about host overhead and its solutions in <!>.</p> <!> <p>For latency budgets in the few hundreds of milliseconds,
network latencies and proxy/load-balancing overhead matter —
communicating with clients across an ocean takes dozens of milliseconds,
due to speed-of-light constraints.</p> <p>Modal offers ultra-low-latency, regionalized web server deployment with <!> to reduce network overhead below 100ms.</p> <p>You can find an example demonstrating all the pieces of
low latency LLM inference on Modal together <!>.</p> <!> <p>The final major class of workloads sits between pure throughput and pure latency.
The quintessential application is a “workflow” where LLM inference is one workflow step,
and the workflow is sometimes run interactively by a human and at other times run asynchronously in bulk.</p> <p>For these applications, the primary concern is handling the high <!>.
For instance, a pipeline might serve zero requests per second most of the time,
then ten for a bit, then one hundred, then back down to zero.
Statically provisioning enough resources to handle one hundred requests is clearly wasteful,
but spinning up new resources on demand incurs latency.</p> <p>The key performance criterion, then, is <!>:
how long does it take for a new replica to spin up and start handling requests.
On a typical cloud deployment, that includes instance requisition, machine boot, and container setup.
We’ve written about the resource allocation challenges <!>.</p> <p>Approaches based on requesting resources from clouds directly take minutes to tens of minutes.
Modal has been designed from the kernel up to provide sub-second latencies
all the way through to container start.
From there, the primary performance concern is speeding up server startup.</p> <ul><li><p><strong>Use small models and quantize aggressively</strong>.
Models can be loaded from a <!> at a rate of 1-2 GB/s. That means you’re incurring nearly a second of cold start latency
per gigabyte of model weights. More exotic compression formats, like integer quantization
or even ternary quantization, are particularly helpful here, even when they don’t improve
latency during inference.</p></li> <li><p><strong>Skip compilation steps</strong>.
Optimizations like CUDA Graph capture, JIT-compiled kernels, and Torch compilation
are great for improving latency and throughput but they are generally quite tricky to cache
and cache hits sometimes take nearly as long as cache misses.
That often means a large latency penalty from compilation on each boot,
and latencies can easily range into the tens of seconds or even tens of minutes.</p></li> <li><p><strong>Restore from snapshots</strong>.
In some cases, startup-time work like JIT compilation is unavoidable.
For these workloads, Modal provides <!>:
the full in-memory state of a container just before it is ready to
handle requests is serialized to disk and future container starts
only need to deserialize this back into memory.
Modal includes support for <!> so that GPU-accelerated LLM inference servers can be snapshot as well.
Memory snapshotting is powerful
(<!>),
but it requires some code modification, described below.</p></li></ul> <p>Which optimizations discussed above apply
depend on the balance of the workload between low latency and high throughput.
But a few general statements can be made.
For instance, speculative decoding is generally a bad choice,
since it harms performance in the high throughput regime.</p> <p>Relatedly, we don’t have a particular recommendation between vLLM and SGLang here.
Besides the points made above about host overhead latency vs bulk throughput,
the primary difference we have seen is that vLLM is a bit faster to market with new models
and new features, but SGLang is a bit easier to hack on and extend.</p> <!> <p>Modal’s rapid autoscaling infrastructure,
from <!>,
to <!>,
is particularly well-suited
to bursty LLM inference workloads.</p> <p>These workloads can either be served by vanilla <!> invoked via remote Python calls or as <!> invoked via HTTP.
Web Functions are better for integrating with a variety
of producers and consumers.
The tradeoff of lower overhead for increased complexity
with <!> is generally not worth it.</p> <p>The <!> supports setting both a limit (<code>max_inputs</code>)
and a target (<code>target_inputs</code>).
Set the limit higher than the target to absorb load increases into
existing capacity (typically at the expense of longer latency).
Make sure that the inference server is configured to handle batches as large as <code>max_inputs</code> without internal queueing!</p> <p>Almost all GPU programs can be snapshot, but most GPU programs
require some code changes to be snapshot.
For instance, both the vLLM and SGLang inference servers require
manual offloading of weights/KV cache to CPU memory before snapshotting.</p> <p>For details, see our full sample code for running bursty workloads on Modal
with vLLM <!> and with SGLang <!>.</p>`,1);function g(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ce(),u=te(a);ne(u,{id:`high-performance-llm-inference`,children:(e,t)=>{s(),i(e,r(`High-performance LLM inference`))},$$slots:{default:!0}});var f=o(u,12),p=e(f),m=e(p);d(e(m),{href:`#achieving-high-throughput-llm-inference-tps`,children:(e,t)=>{s(),i(e,r(`throughput`))},$$slots:{default:!0}}),n(m),s(),n(p);var h=o(p,2),re=e(h);d(e(re),{href:`#minimizing-llm-inference-latency-ttfttpotttlt`,children:(e,t)=>{s(),i(e,r(`latency`))},$$slots:{default:!0}}),n(re),s(),n(h);var g=o(h,2),le=e(g);d(e(le),{href:`#high-performance-llm-inference-for-bursty-workloads-cold-start-time`,children:(e,t)=>{s(),i(e,r(`cold start time`))},$$slots:{default:!0}}),n(le),s(),n(g),n(f);var _=o(f,2),v=o(e(_));d(v,{href:`/llm-almanac/advisor`,children:(e,t)=>{s(),i(e,r(`baseline benchmarks`))},$$slots:{default:!0}});var y=o(v,2);d(y,{href:`/llm-almanac/how-to-benchmark`,children:(e,t)=>{s(),i(e,r(`benchmarking recommendations`))},$$slots:{default:!0}}),d(o(y,2),{href:`/llm-almanac/workloads`,children:(e,t)=>{s(),i(e,r(`LLM Engineer’s Almanac`))},$$slots:{default:!0}}),s(),n(_);var b=o(_,2),ue=o(e(b));d(ue,{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}});var de=o(ue,2);d(de,{href:`https://modal.com/docs/examples/vllm_throughput`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example for high throughput`))},$$slots:{default:!0}});var fe=o(de,2);d(fe,{href:`https://modal.com/docs/examples/sglang_low_latency`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example for low latency`))},$$slots:{default:!0}}),d(o(fe,2),{href:`https://modal.com/docs/examples/sglang_snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example for low cold start time`))},$$slots:{default:!0}}),s(),n(b);var pe=o(b,2);c(pe,{id:`achieving-high-throughput-llm-inference-tps`,children:(e,t)=>{s(),i(e,r(`Achieving high throughput LLM inference (TPS)`))},$$slots:{default:!0}});var x=o(pe,6),me=o(e(x));d(me,{href:`https://modal.com/gpu-glossary/perf/arithmetic-intensity`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`arithmetic intensity`))},$$slots:{default:!0}}),d(o(me,2),{href:`https://modal.com/gpu-glossary/perf/compute-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`compute-bound`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);d(o(e(S)),{href:`https://modal.com/gpu-glossary/perf/latency-hiding`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`designed for maximum throughput`))},$$slots:{default:!0}}),s(),n(S);var C=o(S,2),he=o(e(C));d(he,{href:`/blog/reverse-engineer-flash-attention-4`,children:(e,t)=>{s(),i(e,r(`Flash Attention 4 kernel`))},$$slots:{default:!0}}),d(o(he,2),{href:`https://modal.com/blog/introducing-b200-h200`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Blackwell GPUs`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);d(o(e(w)),{href:`https://modal.com/gpu-glossary/device-software/compute-capability`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Blackwell or later GPUs`))},$$slots:{default:!0}}),s(),n(w);var T=o(w,2);d(o(e(T)),{href:`/pricing`,children:(e,t)=>{s(),i(e,r(`rates`))},$$slots:{default:!0}}),s(5),n(T);var E=o(T,4),ge=e(E);d(o(e(ge)),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`underutilizing the GPUs`))},$$slots:{default:!0}}),s(),n(ge),s(2),n(E);var D=o(E,2);d(o(e(D)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,2);d(o(e(O)),{href:`https://vllm.ai/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),s(),n(O);var _e=o(O,2);l(_e,{id:`high-throughput-llm-inference-on-modal`,children:(e,t)=>{s(),i(e,r(`High throughput LLM inference on Modal`))},$$slots:{default:!0}});var k=o(_e,4),ve=o(e(k));d(ve,{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),d(o(ve,2),{href:`/docs/guide/cron`,children:(e,t)=>{s(),i(e,r(`cronjob deployments on Modal`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,2),j=o(e(A));d(j,{href:`/docs/guide/job-queue`,children:(e,t)=>{s(),i(e,r(`job queue`))},$$slots:{default:!0}});var M=o(j,2);d(M,{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{s(),i(e,r(`Modal Cls`))},$$slots:{default:!0}});var N=o(M,2);d(N,{href:`/docs/guide/job-queue`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),d(o(N,2),{href:`/docs/sdk/py/latest/FunctionCall`,children:(e,t)=>{var n=ae();s(),i(e,n)},$$slots:{default:!0}}),s(),n(A);var P=o(A,4);d(o(e(P)),{href:`https://modal.com/docs/examples/vllm_throughput`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this code sample`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);c(F,{id:`minimizing-llm-inference-latency-ttfttpotttlt`,children:(e,t)=>{s(),i(e,r(`Minimizing LLM inference latency (TTFT/TPOT/TTLT)`))},$$slots:{default:!0}});var I=o(F,8),L=o(e(I));d(L,{href:`https://modal.com/gpu-glossary/perf/memory-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory-bound`))},$$slots:{default:!0}});var ye=o(L,2);d(ye,{href:`https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Streaming Multiprocessors`))},$$slots:{default:!0}}),d(o(ye,2),{href:`https://modal.com/gpu-glossary/perf/memory-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`memory bandwidth`))},$$slots:{default:!0}}),s(),n(I);var R=o(I,4),z=e(R);d(o(e(z)),{href:`https://quant.exposed`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`quantized`))},$$slots:{default:!0}}),s(),n(z);var be=o(z,2);d(e(be),{href:`https://huggingface.co/docs/text-generation-inference/en/conceptual/speculation`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`speculative decoding`))},$$slots:{default:!0}}),s(),n(be),n(R);var B=o(R,2);d(o(e(B)),{href:`https://modal.com/gpu-glossary/perf/arithmetic-bandwidth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`arithmetic bandwidth`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2),xe=o(e(V));d(xe,{href:`https://arxiv.org/abs/2503.01840`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`EAGLE-3 method`))},$$slots:{default:!0}}),d(o(xe,2),{href:`https://lmsys.org/blog/2025-07-25-spec-forge/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SpecForge`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,4);d(o(e(H)),{href:`https://modal.com/docs/examples/gpt_oss_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPT-OSS`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2),Se=o(e(U));d(Se,{href:`https://docs.sglang.io/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SGLang`))},$$slots:{default:!0}}),d(o(Se,2),{href:`/blog/host-overhead-inference-efficiency`,children:(e,t)=>{s(),i(e,r(`this blog post`))},$$slots:{default:!0}}),s(),n(U);var Ce=o(U,2);l(Ce,{id:`low-latency-llm-inference-on-modal`,children:(e,t)=>{s(),i(e,r(`Low latency LLM inference on Modal`))},$$slots:{default:!0}});var W=o(Ce,4);d(o(e(W)),{href:`https://modal.com/docs/guide/servers#servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Servers`))},$$slots:{default:!0}}),s(),n(W);var G=o(W,2);d(o(e(G)),{href:`https://modal.com/docs/examples/sglang_low_latency`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(G);var we=o(G,2);c(we,{id:`high-performance-llm-inference-for-bursty-workloads-cold-start-time`,children:(e,t)=>{s(),i(e,r(`High performance LLM inference for bursty workloads (cold start time)`))},$$slots:{default:!0}});var K=o(we,4);d(o(e(K)),{href:`https://brooker.co.za/blog/2023/03/23/economics.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`peak-to-average load ratio`))},$$slots:{default:!0}}),s(),n(K);var q=o(K,2),Te=o(e(q));d(Te,{href:`/docs/guide/cold-start`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),d(o(Te,2),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,4),Y=e(J),Ee=e(Y);d(o(e(Ee),2),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(Ee),n(Y);var De=o(Y,4),Oe=e(De),ke=o(e(Oe),2);d(ke,{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}});var Ae=o(ke,2);d(Ae,{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{s(),i(e,r(`GPU Memory Snapshots`))},$$slots:{default:!0}}),d(o(Ae,2),{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{s(),i(e,r(`we’ve observed 10x reductions in cold start time`))},$$slots:{default:!0}}),s(),n(Oe),n(De),n(J);var X=o(J,6);l(X,{id:`serving-bursty-llm-inference-workloads-on-modal`,children:(e,t)=>{s(),i(e,r(`Serving bursty LLM inference workloads on Modal`))},$$slots:{default:!0}});var Z=o(X,2),je=o(e(Z));d(je,{href:`/blog/jono-containers-talk`,children:(e,t)=>{s(),i(e,r(`the custom container runtime and filesystem`))},$$slots:{default:!0}}),d(o(je,2),{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{s(),i(e,r(`memory snapshot support`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,2),Me=o(e(Q));d(Me,{href:`/docs/guide/apps`,children:(e,t)=>{s(),i(e,r(`Functions`))},$$slots:{default:!0}});var Ne=o(Me,2);d(Ne,{href:`/docs/guide/webhooks`,children:(e,t)=>{s(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),d(o(Ne,2),{href:`https://modal.com/docs/guide/servers#servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Servers`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,2);d(o(e($)),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{var n=se();s(),i(e,n)},$$slots:{default:!0}}),s(7),n($);var Pe=o($,4),Fe=o(e(Pe));d(Fe,{href:`https://modal.com/docs/examples/vllm_snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),d(o(Fe,2),{href:`https://modal.com/docs/examples/sglang_snapshot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(Pe),i(t,a)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=UlMbh74W.js.map
