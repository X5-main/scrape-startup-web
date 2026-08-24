(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d76c1c4b-50fa-46c5-9f5a-7be904e9d21a`,e._sentryDebugIdIdentifier=`sentry-dbid-d76c1c4b-50fa-46c5-9f5a-7be904e9d21a`)}catch{}})();import{a as e,r as t,t as n}from"../chunks/COtFpfH5.js";import{$t as r,At as i,B as a,Ct as o,Dt as s,E as c,Ft as l,Gt as u,H as d,Jt as f,Kt as p,Nt as m,Ot as h,Pt as g,Rt as _,St as v,Tn as y,X as b,Z as x,_n as S,at as C,bt as w,cn as T,d as E,dn as ee,dt as D,en as O,fn as k,ft as A,h as j,ht as M,in as te,kn as N,l as P,m as F,on as I,qt as L,st as R,tn as z,tt as B,vn as V,vt as H,wn as U,xt as W}from"../chunks/F_ixKBiO.js";import{n as ne}from"../chunks/dNM0KeZe.js";import{t as re}from"../chunks/BqPQayrc.js";import"../chunks/B1sc9Zdx.js";import"../chunks/Bb2deiU3.js";import{i as ie}from"../chunks/Bx0bEHM1.js";import"../chunks/CTF0iQIw.js";import{o as G}from"../chunks/CAGZrpCa2.js";import{t as K}from"../chunks/CO5HtLRs.js";import{t as ae}from"../chunks/8Hruw7IL.js";import{t as oe}from"../chunks/BXBnqKoj2.js";import{a as q,c as J,i as se,o as Y,r as X}from"../chunks/BeBt30c1.js";import{t as ce}from"../chunks/CkF2769z.js";import{t as Z}from"../chunks/DYaR8IZ5.js";import{t as le}from"../chunks/DbNyVV_t.js";import{t as ue}from"../chunks/YHM444js.js";import{t as Q}from"../chunks/Bd_NXZDZ2.js";import{t as de}from"../chunks/BDolKcxW.js";var fe=`---
title: Contributors
---

This list is incomplete; you can help by
[expanding it](https://github.com/modal-labs/gpu-glossary).

### Authors

- [Charles Frye](https://twitter.com/charles_irl) wrote the majority of the
  material and takes full responsibility for any errors.
- [Matthew Nappo](https://www.linkedin.com/in/mattnappo/) wrote the initial
  internal "GPU Glossary" document from which this sprung.
- [Harmya Bhatt](https://twitter.com/racerfunction) of
  [Tensara](https://tensara.org/) co-authored the material on
  [performance](/gpu-glossary/perf).
- [Philip Fabianek](https://www.linkedin.com/in/philip-fabianek/) contributed
  the articles on [cuBLAS](/gpu-glossary/host-software/cublas) and
  [cuDNN](/gpu-glossary/host-software/cudnn).
- [Debashish Chakraborty](https://github.com/debashishc) co-authored the article
  on [CuTe DSL](/gpu-glossary/host-software/cute-dsl)
- [Md Rashad Al Hasan Rony](https://www.rashad.ai/#about-me) co-authored the
  article on [memory coalescing](/gpu-glossary/perf/memory-coalescing).
- [Christopher Fleetwood](https://fleetwood.dev/) contributed the articles on
  [warpgroups](/gpu-glossary/device-software/warpgroup) and
  [scoreboard stalls](/gpu-glossary/perf/scoreboard-stall).
- [You](https://github.com/modal-labs/gpu-glossary) can contribute to keep the
  glossary up-to-date and erratum-free!

### Design

- [Sona Dolasia](https://twitter.com/teenychairs) designed the glossary.
- [Anna Carey](https://twitter.com/anna_carey) implemented the design and UX.

### Review

- [Abhinav Upadhyay](https://twitter.com/abhi9u) of
  [Coding Confessions](https://blog.codingconfessions.com/) and
  [\`@Pauleonix\`](https://github.com/pauleonix) of the
  [GPU MODE Discord](https://discord.gg/gpumode), from outside Modal, provided
  valuable external technical review of the first version of the glossary. We
  particularly thank Abhinav for his perspective on comparisons with CPUs and
  Pauleonix for his detailed insights on GPU hardware internals.
- [Alex Zhang](https://alexzhang13.github.io/),
  [David Wang](https://www.linkedin.com/in/dcw02/),
  [Mark Saroufim](https://twitter.com/marksaroufim), and
  [Mit Kotak](https://mitkotak.github.io/) reviewed the material on
  [performance](/gpu-glossary/perf).
- [Akshat Bubna](https://twitter.com/akshat_b),
  [Nathan Wang](https://www.linkedin.com/in/nathan-r-wang/), and
  [Colin Weld](https://www.linkedin.com/in/colin-weld/) gave technical feedback
  on early drafts of the glossary.
- [Eric Zhang](https://twitter.com/ekzhang1) and
  [Ro Arepally](https://twitter.com/rarepally) reviewed the design and
  implementation.

### Acknowledgements

- [Mark Saroufim](https://twitter.com/marksaroufim) and Andreas Kopf for
  bringing together the [GPU MODE Discord community](https://discord.gg/gpumode)
- [Fabien Sanglard](https://twitter.com/fabynou) for authoring an
  [excellent history of CUDA GPUs](https://fabiensanglard.net/cuda)
- Jen-Hsun Huang for leading an organization that makes some pretty decent chips

### Error Correction

We thank the following GPU enthusiasts who came in through the world wide web to
correct errors:

<!-- This list is ordered alphabetically by the anchor text, ignoring case -->

- [Alex Zhang](https://alexzhang13.github.io/)
- [Ayoub Ghriss](https://github.com/ayghri)
- [Erik Schultheis](https://www.linkedin.com/in/erik-schultheis-606a52119/)
- Ismail Zaidi
- [Michal Nawrot](https://github.com/michalnawrot)
- [Nicolas Blin](https://www.nicolas-blin.fr/)
- [Tony Wang](https://github.com/tonywangs)
`,pe=`---
title: What is a GPU Core?
---

The cores are the primary compute units that make up the
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor).

![The internal architecture of an H100 GPU's Streaming Multiprocessors. CUDA and Tensor Cores are shown in green. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Examples of GPU core types include
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) and
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core).

Though GPU cores are comparable to CPU cores in that they are the component that
effects actual computations, this analogy can be quite misleading. Instead, it
is perhaps more helpful to take the viewpoint of the
[quantitative computer architect](https://archive.org/details/computerarchitectureaquantitativeapproach6thedition)
and think of them as "pipes" into which data goes in and out of which
transformed data is returned. These pipes are associated in turn with specific
[instructions](/gpu-glossary/device-software/streaming-assembler) from the
hardware's perspective and with different fundamental affordances of throughput
from the programmers' (e.g. floating point matrix multiplication arithmetic
throughput in the case of the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core)).

The [SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) are closer to
being the equivalent of CPU cores, in that they have
[register memory](/gpu-glossary/device-hardware/register-file) to store
information, cores to transform it, and an
[instruction scheduler](/gpu-glossary/device-hardware/warp-scheduler) to specify
and command transformations.
`,me=`---
title: What is a CUDA Core?
---

The CUDA Cores are GPU [cores](/gpu-glossary/device-hardware/core) that execute
scalar arithmetic instructions.

![The internal architecture of an H100 SM. The CUDA Cores and Tensor Cores are depicted in green. Note the larger size and lower number of Tensor Cores. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

They are to be contrasted with the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core), which execute matrix
operations.

Unlike CPU cores, instructions issued to CUDA Cores are not generally
independently scheduled. Instead, groups of cores are issued the same
instruction simultaneously by the
[Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler) but apply that
instruction to different [registers](/gpu-glossary/device-software/registers).
Commonly, these groups are of size 32, the size of a
[warp](/gpu-glossary/device-software/warp), but for contemporary GPUs groups can
contain as little as one thread, at a cost to performance.

The term "CUDA Core" is slightly slippery: in different
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
CUDA Cores can consist of different units -- a different mixture of 32 bit
integer and 32 bit and 64 bit floating point units. They are perhaps best
thought of in contrast to early GPUs, which contained a variety of much more
specialized compute units mapped onto shader pipelines (see
[CUDA Device Architecture](/gpu-glossary/device-hardware/cuda-device-architecture)).

So, for example, the
[H100 whitepaper](https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c)
indicates that an H100 GPU's
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
each have 128 "FP32 CUDA Cores", which accurately counts the number of 32 bit
floating point units but is double the number of 32 bit integer or 64 bit
floating point units (as evidenced by the diagram above). For estimating
performance, it's best to look directly at the number of hardware units for a
given operation.
`,he=`---
title: What is a CUDA Device Architecture?
---

CUDA stands for _Compute Unified Device Architecture_. Depending on the context,
"CUDA" can refer to multiple distinct things: a high-level device architecture,
a
[parallel programming model](/gpu-glossary/device-software/cuda-programming-model)
for architectures with that design, or a
[software platform](/gpu-glossary/host-software/cuda-software-platform) that
extends high-level languages like C to add that programming model.

The vision for CUDA is laid out in the
[Lindholm et al., 2008](https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf)
white paper. We highly recommend this paper, which is the original source for
many claims, diagrams, and even specific turns of phrase in NVIDIA's
documentation.

Here, we focus on the _device architecture_ part of CUDA. The core feature of a
"compute unified device architecture" is simplicity, relative to preceding GPU
architectures.

Prior to the GeForce 8800 and the Tesla data center GPUs it spawned, NVIDIA GPUs
were designed with a complex pipeline shader architecture that mapped software
shader stages onto heterogeneous, specialized hardware units. This architecture
was challenging for the software and hardware sides alike: it required software
engineers to map programs onto a fixed pipeline and forced hardware engineers to
guess the load ratios between pipeline steps.

![A diagram of a fixed-pipeline device architecture (G71). Note the presence of a separate group of processors for handling fragment and vertex shading. Adapted from [Fabien Sanglard's blog](https://fabiensanglard.net/cuda/).](themed-image://fixed-pipeline-g71.svg)

GPU devices with a unified architecture are much simpler: the hardware units are
entirely uniform, each capable of a wide array of computations. These units are
known as
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
and their main subcomponents are the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) and (for recent GPUs)
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core).

![A diagram of a compute unified device architecture (G80). Note the absence of distinct processor types — all meaningful computation occurs in the identical [Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor) in the center of the diagram, fed with instructions for vertex, geometry, and pixel threads. Modified from [Peter Glazkowsky's 2009 white paper on the Fermi Architecture](https://www.nvidia.com/content/pdf/fermi_white_papers/p.glaskowsky_nvidia%27s_fermi-the_first_complete_gpu_architecture.pdf).](themed-image://cuda-g80.svg)

For an accessible introduction to the history and design of CUDA hardware
architectures, see [this blog post](https://fabiensanglard.net/cuda/) by Fabien
Sanglard. That blog post cites its (high-quality) sources, like NVIDIA's
[Fermi Compute Architecture white paper](https://www.nvidia.com/content/pdf/fermi_white_papers/nvidia_fermi_compute_architecture_whitepaper.pdf).
The white paper by
[Lindholm et al. in 2008](https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf)
introducing the Tesla architecture is both well-written and thorough. The
[NVIDIA whitepaper for the Tesla P100](https://images.nvidia.com/content/pdf/tesla/whitepaper/pascal-architecture-whitepaper.pdf)
is less scholarly but documents the introduction of a number of features that
are critical for today's large-scale neural network workloads, like NVLink and
[on-package high-bandwidth memory](/gpu-glossary/device-hardware/gpu-ram).
`,ge=`---
title: What is GPU RAM?
---

![In high-performance data center GPUs like the H100, RAM is located on a die directly next to the processor's. Adapted from the Wikipedia page for [high-bandwidth memory](https://en.wikipedia.org/wiki/High_Bandwidth_Memory).](themed-image://hbm-schematic.svg)

The bottom-level memory of the GPU is a large (many megabytes to gigabytes)
memory store that is addressable by all of the GPU's
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor).

It is also known as GPU RAM (random access memory) or video RAM (VRAM). It uses
Dynamic RAM (DRAM) cells, which are slower but smaller than the Static RAM
(SRAM) used in [registers](/gpu-glossary/device-hardware/register-file) and
[cache memory](/gpu-glossary/device-hardware/l1-data-cache). For details on DRAM
and SRAM, we recommend Ulrich Drepper's 2007 article
["What Every Programmer Should Know About Memory"](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf).

It is generally not on the same die as the
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor), though in the
latest data center-grade GPUs like the H100, it is located on a shared
[interposer](https://en.wikipedia.org/wiki/Interposer) for decreased latency and
increased [bandwidth](/gpu-glossary/perf/memory-bandwidth). These GPUs use
[High-Bandwidth Memory (HBM)](https://en.wikipedia.org/wiki/High_Bandwidth_Memory)
technology, rather than the more familiar Double Data Rate (DDR) memory in
consumer GPUs and CPUs.

RAM is used to implement the
[global memory](/gpu-glossary/device-software/global-memory) of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)
and to store [register](/gpu-glossary/device-software/registers) data that
spills from the [register file](/gpu-glossary/device-hardware/register-file).

An H100 can store 80 GiB (687,194,767,360 bits) in its RAM.
`,_e=`---
title: What is a Graphics/GPU Processing Cluster?
abbreviation: GPC
---

A GPC is a collection of
[Texture Processing Clusters (TPCs)](/gpu-glossary/device-hardware/texture-processing-cluster)
(themselves groups of
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor)
or SMs) plus a raster engine. Apparently, some people use NVIDIA GPUs for
graphics, for which the raster engine is important. Relatedly, the name used to
stand for Graphics Processing Cluster, but is now, e.g. in the
[NVIDIA CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html),
expanded as "GPU Processing Cluster".

Since the introduction of
[compute capability](/gpu-glossary/device-software/compute-capability) 9.0 GPUs
like H100s, there is an additional layer of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy), a "cluster"
of [thread blocks](/gpu-glossary/device-software/thread-block) that are
scheduled onto the same GPC, just as the threads of a
[thread block](/gpu-glossary/device-software/thread-block) are scheduled onto
the same [SM](/gpu-glossary/device-hardware/streaming-multiprocessor), and have
their own level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy), distributed
shared memory. Elsewhere, we elide discussion of this feature.
`,ve=`---
title: What is the L1 Data Cache?
---

The L1 data cache is the private memory of the
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)
(SM).

![The internal architecture of an H100 SM. The L1 data cache is depicted in light blue. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Each SM partitions that memory among
[groups of threads](/gpu-glossary/device-software/thread-block) scheduled onto
it.

The L1 data cache is co-located with and only about an order of magnitude slower
than the components that effect computations (e.g. the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core)).

It is implemented with SRAM, the same basic semiconductor cell used in CPU
caches and registers and in the
[memory subsystem of Groq LPUs](https://groq.com/wp-content/uploads/2023/05/GroqISCAPaper2022_ASoftwareDefinedTensorStreamingMultiprocessorForLargeScaleMachineLearning-1.pdf).
The L1 data cache is accessed by the
[Load/Store Units](/gpu-glossary/device-hardware/load-store-unit) of the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor).

CPUs also maintain an L1 cache. In CPUs, that cache is fully hardware-managed.
In GPUs that cache is mostly programmer-managed, even in high-level languages
like [CUDA C](/gpu-glossary/host-software/cuda-c).

Each L1 data cache in each of an H100's SMs can store 256 KiB (2,097,152 bits).
Across the 132 SMs in an H100 SXM 5, that's 33 MiB (242,221,056 bits) of cache
space.
`,ye=`---
title: What is a Load/Store Unit?
abbreviation: LSU
---

The Load/Store Units (LSUs) dispatch requests to load or store data to the
memory subsystems of the GPU.

![The internal architecture of an H100 SM. Load/Store Units are shown in pink, along with the [Special Function Units](/gpu-glossary/device-hardware/special-function-unit). Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Most importantly for
[CUDA programmers](/gpu-glossary/host-software/cuda-software-platform), they
interact directly with the
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)'s
on-chip SRAM [L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) and
indirectly with the off-chip, on-device
[global RAM](/gpu-glossary/device-hardware/gpu-ram) that respectively implement
the lowest and highest levels of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) in the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model).
`,be=`---
title: What is a Register File?
---

The register file of the
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)
is the primary store of bits in between their manipulation by the
[cores](/gpu-glossary/device-hardware/core).

![The internal architecture of an H100 SM. The register file is depicted in blue. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Like registers in CPUs, these registers are made from very fast memory
technology that can keep pace with the compute
[cores](/gpu-glossary/device-hardware/core), about an order of magnitude faster
than the [L1 data cache](/gpu-glossary/device-hardware/l1-data-cache).

The register file is split into 32 bit registers that can be dynamically
reallocated between different data types, like 32 bit integers, 64 bit floating
point numbers, and (groups of) 16 bit or smaller floating point numbers. These
physical registers back the
[virtual registers](/gpu-glossary/device-software/registers) in the
[Parallel Thread eXecution (PTX)](/gpu-glossary/device-software/parallel-thread-execution)
intermediate representation.

Allocation of physical registers to
[threads](/gpu-glossary/device-software/thread) in
[Streaming Assembler (SASS)](/gpu-glossary/device-software/streaming-assembler)
is managed by a compiler like \`ptxas\`, which optimizes register file usage by
[thread blocks](/gpu-glossary/device-software/thread-block). If each
[thread block](/gpu-glossary/device-software/thread-block) consumes too much of
the register file (colloquially, high
"[register pressure](/gpu-glossary/perf/register-pressure)"), then the number of
concurrently schedulable [threads](/gpu-glossary/device-software/thread) will be
reduced, leading to a low [occupancy](/gpu-glossary/perf/occupancy) and possibly
impacting performance by reducing opportunities for
[latency hiding](/gpu-glossary/perf/latency-hiding).
`,xe=`---
title: What is a Special Function Unit?
abbreviation: SFU
---

The Special Function Units (SFUs) in
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
accelerate certain arithmetic operations.

![The internal architecture of an H100 SM. Special Function Units are shown in maroon, along with the [Load/Store Units](/gpu-glossary/device-hardware/load-store-unit). Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Notable for neural network workloads are transcendental mathematical operations,
like \`exp\`, \`sin\`, and \`cos\`.

The
[Streaming Assembler (SASS)](/gpu-glossary/device-software/streaming-assembler)
instructions associated with the SFUs generally begin with \`MUFU\`: \`MUFU.SQRT\`,
\`MUFU.EX2\`. See [this Godbolt link](https://godbolt.org/z/WGh3rPe83) for sample
assembly using the \`MUFU.EX2\` instruction to implement the \`expf\` intrinsic in
[CUDA C++](/gpu-glossary/host-software/cuda-c).
`,Se=`---
title: What is a Streaming Multiprocessor Architecture?
---

[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
are versioned with a particular "architecture" that defines their compatibility
with
[Streaming Assembler (SASS)](/gpu-glossary/device-software/streaming-assembler)
code.

![A streaming multiprocessor with the "Hopper" SM90 architecture. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

![A streaming multiprocessor with the original "Tesla" SM architecture. Modified from [Fabien Sanglard's blog](https://fabiensanglard.net/cuda)](themed-image://tesla-sm.svg)

Most [SM](/gpu-glossary/device-hardware/streaming-multiprocessor) versions have
two components: a major version and a minor version.

The major version is _almost_ synonymous with GPU architecture family. For
example, all SM versions \`6.x\` are of the Pascal Architecture. Some NVIDIA
documentation even
[makes this claim directly](https://docs.nvidia.com/cuda/ptx-writers-guide-to-interoperability/index.html).
But, as an example, Ada GPUs have
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) architecture
version \`8.9\`, the same major version as Ampere GPUs.

Target [SM](/gpu-glossary/device-hardware/streaming-multiprocessor) versions for
[SASS](/gpu-glossary/device-software/streaming-assembler) compilation can be
specified when invoking \`nvcc\`, the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc). Compatibility
across major versions is explicitly not guaranteed. For more on compatibility
across minor versions, see the
[documentation](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html#gpu-feature-list)
for [nvcc](/gpu-glossary/host-software/nvcc).
`,Ce=`---
title: What is a Streaming Multiprocessor?
abbreviation: SM
---

When we [program GPUs](/gpu-glossary/host-software/cuda-software-platform), we
produce
[sequences of instructions](/gpu-glossary/device-software/streaming-assembler)
for its Streaming Multiprocessors to carry out.

![A diagram of the internal architecture of an H100 GPU's Streaming Multiprocessors. GPU cores appear in green, other compute units in maroon, scheduling units in orange, and memory in blue. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Streaming Multiprocessors (SMs) of NVIDIA GPUs are roughly analogous to the
cores of CPUs. That is, SMs both execute computations and store state available
for computation in registers, with associated caches. Compared to CPU cores, GPU
SMs are simple, weak processors. Execution in SMs is pipelined within an
instruction (as in almost all CPUs since the 1990s) but there is no speculative
execution or instruction pointer prediction (unlike all contemporary
high-performance CPUs).

However, GPU SMs can execute more
[threads](/gpu-glossary/device-software/thread) in parallel.

For comparison: an
[AMD EPYC 9965](https://www.techpowerup.com/cpu-specs/epyc-9965.c3904) CPU draws
at most 500 W and has 192 cores, each of which can execute instructions for at
most two threads at a time, for a total of 384 threads in parallel, running at
about 1.25 W per thread.

An H100 SXM GPU draws at most 700 W and has 132 SMs, each of which has four
[Warp Schedulers](/gpu-glossary/device-hardware/warp-scheduler) that can each
issue instructions to 32 threads (aka a
[warp](/gpu-glossary/device-software/warp)) in parallel per clock cycle, for a
total of 128 × 132 > 16,000 parallel threads running at about 5 cW apiece. Note
that this is truly parallel: each of the 16,000 threads can make progress with
each clock cycle.

GPU SMs also support a large number of _concurrent_ threads -- threads of
execution whose instructions are interleaved.

A single SM on an H100 can concurrently execute up to 2048 threads split across
64 thread groups of 32 threads each. With 132 SMs, that's a total of over
250,000 concurrent threads.

CPUs can also run many threads concurrently. But switches between
[warps](/gpu-glossary/device-software/warp) happen at the speed of a single
clock cycle (over 1000x faster than context switches on a CPU), again powered by
the SM's [Warp Schedulers](/gpu-glossary/device-hardware/warp-scheduler). The
volume of available [warps](/gpu-glossary/device-software/warp) and the speed of
[warp switches](/gpu-glossary/device-hardware/warp-scheduler) help
[hide latency](/gpu-glossary/perf/latency-hiding) caused by memory reads, thread
synchronization, or other expensive instructions, ensuring that the
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) provided by the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) and
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) is well utilized.

This [latency-hiding](/gpu-glossary/perf/latency-hiding) is the secret to GPUs'
strengths. CPUs seek to hide latency from end-users and programmers by
maintaining large, hardware-managed caches and sophisticated instruction
prediction. This extra hardware limits the fraction of their silicon area,
power, and heat budgets that CPUs can allocate to computation.

![GPUs dedicate more of their area to compute (green), and less to control and caching (orange and blue), than do CPUs. Modified from a diagram in [Fabien Sanglard's blog](https://fabiensanglard.net/cuda), itself likely modified from a diagram in [the CUDA C Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/).](themed-image://cpu-vs-gpu.svg)

For programs or functions like neural network inference or sequential database
scans for which it is relatively straightforward for programmers to
[express](/gpu-glossary/device-software/cuda-programming-model) the behavior of
[caches](/gpu-glossary/device-hardware/l1-data-cache) — e.g. store a chunk of
each input matrix and keep it in cache for long enough to compute the related
outputs — the result is much higher throughput.
`,we=`---
title: What is a Tensor Core?
---

Tensor Cores are GPU [cores](/gpu-glossary/device-hardware/core) that operate on
entire matrices with each instruction.

![The internal architecture of an H100 SM. Note the larger size and lower number of Tensor Cores. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

Operating on more data for a single instruction fetch dramatically reduces power
requirements, which unlocks increased performance (see
[this talk](https://youtu.be/kLiwvnr4L80?t=868) by Bill Dally, Chief Scientist
at NVIDIA). Since their introduction in the Volta
[Streaming Multiprocessor (SM) Architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
generation, they have been the only way to achieve the highest
[arithmetic throughput](/gpu-glossary/perf/arithmetic-bandwidth) on NVIDIA GPUs
-- providing 100x more floating point operations per second than
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core).

As an example, the \`HMMA16.16816.F32\`
[SASS](/gpu-glossary/device-software/streaming-assembler) instruction calculates
D = AB + C for matrices A, B, C, and D (where C is often the same physical
matrix as D). The \`MMA\` stands for "Matrix Multiply and Accumulate". \`HMMA16\`
indicates that the inputs are half-precision (\`16\` bits) and the \`F32\` indicates
that the outputs are accumulated into \`32\` bit (aka single-precision) floats.

The \`16816\` between is not a single number larger than 16,000. Instead, the
string of numbers \`16\`, \`8\`, and \`16\` denote the dimensions of the matrices.
These dimensions are generally named \`m\`, \`n\`, and \`k\` by NVIDIA, for example in
[PTX](/gpu-glossary/device-software/parallel-thread-execution) instructions. The
outer dimensions of A and B, aka \`m\` and \`n\`, come first, followed by the shared
inner dimension for the accumulation, \`k\`. Multiplying these out, we see that
the \`HMMA16.16816.32\` instruction performs 16 × 8 × 16 = 2,048
multiply-accumulate (MAC) operations.

Note that a single instruction in a single
[thread](/gpu-glossary/device-software/thread) does not produce the entire
matrix multiplication. Instead, the 32 threads of a
[warp](/gpu-glossary/device-software/warp) cooperatively produce the result by
executing the instruction together. Most of the per-instruction power overhead
is in decoding, which is shared across a
[warp](/gpu-glossary/device-software/warp) thanks to the
[warp scheduler](/gpu-glossary/device-hardware/warp-scheduler). But even spread
across those 32 threads, that's 64 = 2,048 ÷ 32 MACs per instruction.

For this reason, it is helpful to think of Tensor Cores, and similar hardware
like the systolic arrays in Google Tensor Processing Units (TPUs), as a form of
[complex instruction set computer (CISC)](https://www.omgwiki.org/ddsf/doku.php?id=ddsf:public:guidebook:06_append:glossary:c:cisc)
hardware. For more on this perspective, applied to TPUs, see
[this talk by computer architect David Patterson](https://youtu.be/fhHAArxwzvQ?t=2072),
who also
[coined the terms CISC and RISC](https://www.semanticscholar.org/paper/4d3a941a5749dbf0dd39554f12597c449c3c07ff).

That assembler-level instruction might be produced by a compiler to implement
[PTX-level](/gpu-glossary/device-software/parallel-thread-execution)
matrix-multiply-and-accumulate instructions like \`wmma\` (documented
[here](https://docs.nvidia.com/cuda/archive/12.8.0/parallel-thread-execution/index.html#warp-level-matrix-instructions)).
Those instructions also calculate D = AB + C for matrices A, B, C, and D, but
are generally compiled into many individual
[SASS](/gpu-glossary/device-software/streaming-assembler) Tensor Core
instructions that operate on smaller matrices.

These instructions from the
[PTX](/gpu-glossary/device-software/parallel-thread-execution) instruction set
architecture are exposed in the high-level
[CUDA C++ programming language](/gpu-glossary/host-software/cuda-c) as
intrinsics.

In reverse order, a line of [CUDA C++](/gpu-glossary/host-software/cuda-c)
coding a matrix multiplication \`C = A @ B\`, of two 16 by 16 matrices, like

\`\`\`cpp
wmma::mma_sync(c, a, b, c);
\`\`\`

where \`c\` is initialized to all zeros, and the first appearance indicates it is
also the output, might be compiled by [\`nvcc\`](/gpu-glossary/host-software/nvcc)
to the [PTX](/gpu-glossary/device-software/parallel-thread-execution)
intermediate representation as

\`\`\`ptx
wmma.mma.sync.aligned.col.row.m16n16k16.f32.f32 {%f2, %f3, %f4, %f5, %f6, %f7, %f8, %f9}, {%r2, %r3, %r4, %r5, %r6, %r7, %r8, %r9}, {%r10, %r11, %r12, %r13, %r14, %r15, %r16, %r17}, {%f1, %f1, %f1, %f1, %f1, %f1, %f1, %f1};
\`\`\`

and then finally compiled by \`ptxas\` to
[SASS](/gpu-glossary/device-software/streaming-assembler) as

\`\`\`sass
HMMA.1688.F32 R20, R12, R11, RZ   // 1
HMMA.1688.F32 R24, R12, R17, RZ   // 2
HMMA.1688.F32 R20, R14, R16, R20  // 3
HMMA.1688.F32 R24, R14, R18, R24  // 4
\`\`\`

The operands to each \`HMMA\` instruction can be read, in order, as
\`D = A @ B + C\`. For example, instruction 3 uses
[register](/gpu-glossary/device-hardware/register-file) 20 for its output \`D\`,
registers 14 and 16 for its inputs \`A\` and \`B\`, respectively, and re-uses
register 20 for its input \`C\`, effecting the computation \`C += A @ B\`.

This program partitions the full 16 by 16 square matrix multiplication into four
separate instructions, each itself a matrix multiplication of a 16 by 8 matrix
with an 8 by 8 matrix. Similarly, programs running large-scale matrix
multiplications must break their work down into smaller matrix multiplications,
like the 16 by 16 square matrix multiplication performed by the \`mma_sync\` call
we are dissecting. We walk through this program below.

![Register usage in a Tensor Core MMA for C = A @ B. The R11, R17, R16, and R18 registers are used in instructions 1, 2, 3, and 4, respectively. See surrounding text for details.](themed-image://tensor-core-mma.svg)

The first two instructions compute the matrix multiplication of the first eight
columns of the input \`a\`, from \`R12\`, with the first eight rows of the input
\`b\`, from \`R11\` and \`R17\`, producing a 16 by 16 matrix, which is stored in \`R20\`
and \`R24\`. This is a sort of "outer product": a tall and skinny matrix
multiplied by a short and wide matrix. (\`RZ\` is a special-purpose "register"
that contains the value \`Z\`ero).

The second two instructions compute a similar "outer product" for the second
eight columns of \`a\` and second eight rows of \`b\`, accumulating with the output
of the first two instructions to produce the final value in \`c\`.

Put another way: within a block of eight rows out of eight columns in B and
within an entire column of A, a number of multiplications and additions occur
inside the Tensor Core concurrently, with respect to the instruction, to
implement a matrix multiplication. Each instruction handles all \`m\` rows of A
for the given block of rows and columns from B. Together, they handle the full
matrix multiplication.

Explore [this compiler output on Godbolt](https://godbolt.org/z/e6cqn8491) if
you want to dive deeper. Note that this is far from a
[utilization-maximizing](https://modal.com/blog/gpu-utilization-guide) matrix
multiplication using Tensor Cores! For that, see
[this worklog by Pranjal Shandkar](https://cudaforfun.substack.com/p/outperforming-cublas-on-h100-a-worklog).

Programming Hopper and Blackwell Tensor Cores for maximum performance cannot be
done in pure [CUDA C++](/gpu-glossary/host-software/cuda-c), requiring instead
[PTX](/gpu-glossary/device-software/parallel-thread-execution) intrinsics for
both computation and memory. It is generally recommended to instead use existing
kernels from kernel libraries like
[cuBLAS (CUDA Basic Linear Algebra Subroutines)](/gpu-glossary/host-software/cublas)
or higher-level kernel programming interfaces like
[CUTLASS (CUDA Templates for Linear Algebra Subroutines)](/gpu-glossary/host-software/cutlass)
in C++ or [CuTe DSL](/gpu-glossary/host-software/cute-dsl) in Python.

Tensor Cores are much larger and less numerous than
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core). An H100 SXM5 has only
four Tensor Cores per
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), i.e. one per
[Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler), but has hundreds
of [CUDA Cores](/gpu-glossary/device-hardware/cuda-core). Tensor Cores are the
primary producers and consumers of
[Tensor Memory](/gpu-glossary/device-hardware/tensor-memory).

Tensor Cores were introduced in the V100 GPU, which represented a major
improvement in the suitability of NVIDIA GPUs for large neural network
workloads. For more, see
[the NVIDIA white paper introducing the V100](https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf).

The internals of Tensor Cores are unknown, and likely differ from
[SM Architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
to
[SM Architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
They are commonly assumed to be systolic arrays, like TPUs, but there is no
consensus in the microbenchmarking literature.
`,Te=`---
title: What is a Tensor Memory Accelerator?
abbreviation: TMA
---

Tensor Memory Accelerators are specialized hardware in Hopper and Blackwell
[architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
GPUs designed to accelerate access to multi-dimensional arrays in
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram).

![The internal architecture of an H100 [Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor). Note the Tensor Memory Accelerator at the bottom of the [SM](/gpu-glossary/device-hardware/streaming-multiprocessor), shared between the four sub-units. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

The TMA loads data from
[global memory](/gpu-glossary/device-software/global-memory)/[GPU RAM](/gpu-glossary/device-hardware/gpu-ram)
to
[shared memory](/gpu-glossary/device-software/shared-memory)/[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache),
bypassing the
[registers](/gpu-glossary/device-software/registers)/[register file](/gpu-glossary/device-hardware/register-file)
entirely.

The first advantage of the TMA comes from reducing the use of other compute and
memory resources. The TMA hardware calculates addresses for bulk affine memory
accesses, i.e. accesses of the form \`addr = width * base + offset\` for many
bases and offsets concurrently, which are the most common accesses for arrays.
Offloading this work to the TMA saves space in the
[register file](/gpu-glossary/device-hardware/register-file), reducing
"[register pressure](/gpu-glossary/perf/register-pressure)", and reduces demand
on the [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) provided
by the [CUDA Cores](/gpu-glossary/device-hardware/cuda-core). The savings are
more pronounced for large (KB-scale) accesses to arrays with two or more
dimensions.

The second advantage comes from the asynchronous execution model of TMA copies.
A single [CUDA thread](/gpu-glossary/device-software/thread) can trigger a large
copy and then rejoin its [warp](/gpu-glossary/device-software/warp) to perform
other work. Those [threads](/gpu-glossary/device-software/thread) and others in
the same [thread block](/gpu-glossary/device-software/thread-block) can then
asynchronously detect the completion of the TMA copy after it finishes and
operate on the results (as in a producer-consumer model).

For details, see the TMA sections of
[Luo et al.'s Hopper micro-benchmarking paper](https://arxiv.org/abs/2501.12084v1)
and the
[NVIDIA Hopper Tuning Guide](https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#tensor-memory-accelerator).

Note that, despite the name, the Tensor Memory Accelerator does not accelerate
operations using [Tensor Memory](/gpu-glossary/device-hardware/tensor-memory).
`,Ee=`---
title: What is Tensor Memory?
---

Tensor Memory is a specialized memory in the
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor)
of certain GPUs, like the [B200](https://modal.com/blog/introducing-b200-h200),
for storing the inputs and outputs of
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core).

Tensor Memory access is highly restricted. Data must be moved collectively by
four [warps](/gpu-glossary/device-software/warp) in a
[warpgroup](/gpu-glossary/device-software/warpgroup), and they can move memory
only in specific patterns between Tensor Memory and
[registers](/gpu-glossary/device-software/registers), write
[shared memory](/gpu-glossary/device-software/shared-memory) to Tensor Memory,
or issue matrix-multiply-accumulate (MMA) instructions to
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) that use Tensor Memory
for specific operands. So much for a
["compute-unified" device architecture](/gpu-glossary/device-hardware/cuda-device-architecture)!

Specifically, for a \`tcgen05.mma\`
[Parallel Thread eXecution](/gpu-glossary/device-software/parallel-thread-execution)
instruction computing \`D += A @ B\` to use Tensor Memory, the "accumulator"
matrix \`D\` _must_ be in Tensor Memory, the left-hand matrix \`A\` _may_ be in
Tensor Memory or [shared memory](/gpu-glossary/device-software/shared-memory),
and the right-hand matrix B _must_ be in
[shared memory](/gpu-glossary/device-software/shared-memory), not Tensor Memory.
This is complex, but not arbitrary -- accumulators are accessed more frequently
during matmuls than are the tiles, so they benefit more from specialized
hardware, e.g. from shorter, simpler wiring between the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) and the Tensor Memory.
Note that none of the matrices are in the
[registers](/gpu-glossary/device-software/registers).

Beware: Tensor Memory is not directly related to the
[Tensor Memory Accelerator](/gpu-glossary/device-hardware/tensor-memory-accelerator),
which instead loads into the
[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache). Roughly speaking,
data is moved from that cache into Tensor Memory only as a result of a
[Tensor Core](/gpu-glossary/device-hardware/tensor-core) operation and then is
explicitly moved out for post-processing, e.g. the non-linearity after a matrix
multiplication in a neural network.

For details on tensor memory and patterns for its use in matrix multiplications,
see the
[_Programming Blackwell Tensor Cores with CUTLASS_ talk from GTC 2025](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72720/).
`,De=`---
title: What is a Texture Processing Cluster?
abbreviation: TPC
---

A Texture Processing Cluster (TPC) is a pair of adjacent
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor).

Before the Blackwell
[SM architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
TPCs were not mapped onto any level of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) or
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy).

The fifth-generation [Tensor Cores](/gpu-glossary/device-hardware/tensor-core)
in the Blackwell
[SM architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
added the "CTA pair" level of the
[Parallel Thread eXecution (PTX)](/gpu-glossary/device-software/parallel-thread-execution)
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy), which maps
onto TPCs. Many \`tcgen05\`
[PTX](/gpu-glossary/device-software/parallel-thread-execution) instructions
include a \`.cta_group\` field that can use a single
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) (\`.cta_group::1\`)
or a pair of [SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) in a
TPC (\`::2\`), which are mapped to \`1SM\` and \`2SM\` variants of
[Streaming Assembler (SASS)](/gpu-glossary/device-software/streaming-assembler)
instructions like \`MMA\`.
`,Oe=`---
title: What is a Warp Scheduler?
---

The Warp Scheduler of the
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor)
decides which group of [threads](/gpu-glossary/device-software/thread) to
execute on each clock cycle.

![The internal architecture of an H100 SM. The Warp Scheduler and Dispatch Unit are shown in orange. Modified from NVIDIA's [H100 white paper](https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf).](themed-image://gh100-sm.svg)

These groups of [threads](/gpu-glossary/device-software/thread), known as
[warps](/gpu-glossary/device-software/warp), are switched out on a per clock
cycle basis — roughly one nanosecond - much like the fine-grained thread-level
parallelism of simultaneous multi-threading ("hyper-threading") in CPUs, but at
a much larger scale. The ability of the Warp Schedulers to switch rapidly
between a large number of concurrent tasks as soon as their instructions'
operands are available is key to the
[latency hiding](/gpu-glossary/perf/latency-hiding) capabilities of GPUs.

Full CPU thread context switches take a few hundred to a few thousand clock
cycles (more like a microsecond than a nanosecond) due to the need to save the
context of one thread and restore the context of another. Additionally, context
switches on CPUs lead to reduced locality, further reducing performance by
increasing cache miss rates (see
[Mogul and Borg, 1991](https://www.researchgate.net/publication/220938995_The_Effect_of_Context_Switches_on_Cache_Performance)).

Because each [thread](/gpu-glossary/device-software/thread) has its own private
[registers](/gpu-glossary/device-software/registers) allocated from the
[register file](/gpu-glossary/device-hardware/register-file) of the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), context switches
on the GPU do not require any data movement to save or restore contexts.

And because the [L1 caches](/gpu-glossary/device-hardware/l1-data-cache) on GPUs
can be entirely programmer-managed and are
[shared](/gpu-glossary/device-software/shared-memory) between the
[warps](/gpu-glossary/device-software/warp) scheduled together onto an
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) (see
[cooperative thread array](/gpu-glossary/device-software/cooperative-thread-array)),
context switches on the GPU have much less impact on cache hit rates. For
details on the interaction between programmer-managed caches and
hardware-managed caches in GPUs, see
[the "Maximize Memory Throughput" section of the CUDA C Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#maximize-memory-throughput).

The Warp Schedulers also manage the
[execution state of warps](/gpu-glossary/perf/warp-execution-state).
`,ke=`---
title: Device Hardware
---

These terms and technologies are physical components of the GPU — the "device"
in NVIDIA's lingo.
`,Ae=`---
title: What is Compute Capability?
---

Instructions in the
[Parallel Thread Execution](/gpu-glossary/device-software/parallel-thread-execution)
instruction set are compatible with only certain physical GPUs. The versioning
system used to abstract away details of physical GPUs from the instruction set
and [compiler](/gpu-glossary/host-software/nvcc) is called "Compute Capability".

Most compute capability version numbers have two components: a major version and
a minor version. NVIDIA promises forward compatibility (old
[PTX](/gpu-glossary/device-software/parallel-thread-execution) code runs on new
GPUs) across both major and minor versions following the
[onion layer](https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-module-directives-target)
model.

With Hopper, NVIDIA introduced an additional version suffix, the \`a\` in \`9.0a\`,
which includes features that deviate from the onion model: their future
compatibility is not guaranteed, even within major versions.

With Blackwell, NVIDIA introduced yet another version suffix, the \`f\` in
\`10.0f\`, which also deviates from the onion model, and is closer to
[SemVer](https://semver.org/): compatibility is guaranteed across minor versions
but not major versions.

Target compute capabilities for
[PTX](/gpu-glossary/device-software/parallel-thread-execution) compilation can
be specified when invoking \`nvcc\`, the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc). By default, the
compiler will also generate optimized
[SASS](/gpu-glossary/device-software/streaming-assembler) for the matching
[Streaming Multiprocessor (SM) architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
The
[documentation](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html#virtual-architectures)
for [\`nvcc\`](/gpu-glossary/host-software/nvcc) refers to compute capability as a
"virtual GPU architecture", in contrast to the "physical GPU architecture"
expressed by the [SM](/gpu-glossary/device-hardware/streaming-multiprocessor)
version.

The technical specifications for each compute capability version can be found in
the
[Compute Capability section of the NVIDIA CUDA C Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html).
`,je=`---
title: What is a Cooperative Thread Array?
---

![Cooperative thread arrays correspond to the [thread block](/gpu-glossary/device-software/thread-block) level of the thread block hierarchy in the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

A cooperative thread array (CTA) is a collection of threads scheduled onto the
same
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
CTAs are the
[PTX](/gpu-glossary/device-software/parallel-thread-execution)/[SASS](/gpu-glossary/device-software/streaming-assembler)
implementation of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[thread blocks](/gpu-glossary/device-software/thread-block). CTAs are composed
of one or more [warps](/gpu-glossary/device-software/warp).

Programmers can direct [threads](/gpu-glossary/device-software/thread) within a
CTA to coordinate with each other. The programmer-managed
[shared memory](/gpu-glossary/device-software/shared-memory), in the
[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) of the
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor), makes this
coordination fast. Threads in different CTAs cannot coordinate with each other
via barriers, unlike threads within a CTA, and instead must coordinate via
[global memory](/gpu-glossary/device-software/global-memory), e.g. via atomic
update instructions. Due to driver control over the scheduling of CTAs at
runtime, CTA execution order is indeterminate and blocking a CTA on another CTA
can easily lead to deadlock.

The number of CTAs that can be scheduled onto a single
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) sets the
[achievable occupancy](/gpu-glossary/perf/occupancy) and depends on a number of
factors. Fundamentally, the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) has a limited set
of resources — lines in the
[register file](/gpu-glossary/device-hardware/register-file), "slots" for
[warps](/gpu-glossary/device-software/warp), bytes of
[shared memory](/gpu-glossary/device-software/shared-memory) in the
[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) — and each CTA uses
a certain amount of those resources (as calculated at
[compile](/gpu-glossary/host-software/nvcc) time) when scheduled onto an
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor).
`,Me=`---
title: What is the CUDA Programming Model?
---

The CUDA programming model is a programming model for programming massively
parallel processors.

CUDA stands for _Compute Unified Device Architecture_. Depending on the context,
"CUDA" can refer to multiple distinct things: a
[high-level device architecture](/gpu-glossary/device-hardware/cuda-device-architecture),
a parallel programming model for architectures with that design, or a
[software platform](/gpu-glossary/host-software/cuda-software-platform) that
extends high-level languages like C to add that programming model.

The vision for CUDA is laid out in the
[Lindholm et al., 2008](https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf)
white paper. We highly recommend this paper, which is the original source for
many claims, diagrams, and even specific turns of phrase in NVIDIA's
documentation.

Here, we focus on the CUDA _programming model_.

Per the
[NVIDIA CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/#a-scalable-programming-model),
there are three key abstractions in the CUDA programming model:

- [**Hierarchy of thread groups**](/gpu-glossary/device-software/thread-hierarchy).
  Programs are executed in threads but can make reference to groups of threads
  in a nested hierarchy, from
  [blocks](/gpu-glossary/device-software/thread-block) to
  [grids](/gpu-glossary/device-software/thread-block-grid).
- [**Hierarchy of memories**](/gpu-glossary/device-software/memory-hierarchy).
  Thread groups at each level of the hierarchy have access to a memory resource
  for communication within the group. Accessing the
  [lowest layer](/gpu-glossary/device-software/shared-memory) of the memory
  hierarchy should be
  [nearly as fast as executing an instruction](/gpu-glossary/device-hardware/l1-data-cache).
- **Barrier synchronization.** Thread groups can coordinate execution by means
  of barriers.

The hierarchies of execution and memory and their mapping onto
[device hardware](/gpu-glossary/device-hardware) are summarized in the following
diagram.

![Left: the abstract thread group and memory hierarchies of the CUDA programming model. Right: the matching hardware implementing those abstractions. Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

Together, these three abstractions encourage the expression of programs in a way
that scales transparently as GPU devices scale in their parallel execution
resources.

Put provocatively: this programming model prevents programmers from writing
programs for NVIDIA's
[CUDA-architected](/gpu-glossary/device-hardware/cuda-device-architecture) GPUs
that fail to get faster when the program's user buys a new NVIDIA GPU.

For example, each [thread block](/gpu-glossary/device-software/thread-block) in
a CUDA program can coordinate tightly, but coordination between blocks is
limited. This ensures blocks capture parallelizable components of the program
and can be scheduled in any order — in the terminology of computer architecture,
the programmer "exposes" this parallelism to the compiler and hardware. When the
program is executed on a new GPU that has more scheduling units (specifically,
more
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor)),
more of these blocks can be executed in parallel.

![A CUDA program with eight [blocks](/gpu-glossary/device-software/thread-block) runs in four sequential steps (waves) on a GPU with two [SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) but in half as many steps on one with twice as many [SMs](/gpu-glossary/device-hardware/streaming-multiprocessor). Modified from the [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/).](themed-image://wave-scheduling.svg)

The CUDA programming model abstractions are made available to programmers as
extensions to high-level CPU programming languages, like the
[CUDA C++ extension of C++](/gpu-glossary/host-software/cuda-c). The programming
model is implemented in software by an instruction set architecture
[(Parallel Thread eXecution, or PTX)](/gpu-glossary/device-software/parallel-thread-execution)
and low-level assembly language
[(Streaming Assembler, or SASS)](/gpu-glossary/device-software/streaming-assembler).
For example, the [thread block](/gpu-glossary/device-software/thread-block)
level of the [thread hierarchy](/gpu-glossary/device-software/thread-hierarchy)
is implemented via
[cooperative thread arrays](/gpu-glossary/device-software/cooperative-thread-array)
in these languages.
`,Ne=`---
title: "What is the CUDA Tile programming model?"
---

The CUDA Tile programming model is a tile-based programming model targeting
NVIDIA GPUs.

The traditional
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)
exposes a [hierarchy of threads](/gpu-glossary/device-software/thread-hierarchy)
and a [hierarchy of memories](/gpu-glossary/device-software/memory-hierarchy) to
user programs that receive pointers and execute concurrently to mutate memory
relative to those pointers. The same instructions are issued to multiple
[threads](/gpu-glossary/device-software/thread) in parallel, and so this
programming model is a "single-instruction, multiple thread" (SIMT) programming
model. This is the programming model used in, for instance,
[CUDA C/C++](/gpu-glossary/host-software/cuda-c) and the
[PTX](/gpu-glossary/device-software/parallel-thread-execution) IR used by
pre-CUDA-Tile programs targeting NVIDIA GPUs.

This programming model is defined for a
["unified" hardware substrate](/gpu-glossary/device-hardware/cuda-device-architecture)
-- the "U" in "CUDA". That is, homogenous
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
with homogenous [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) implement
the majority of operations, rather than the device comprising specialized cores,
programmed heterogenously, as was generically the case in graphics programming
before CUDA.

This programming model is a poor fit for GPUs of the latest
[SM architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
where the vast majority of
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) is in the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core). The Tensor Cores can
only perform matrix multiplications and must be programmed with
[thread](/gpu-glossary/device-software/thread)-level instructions and
asynchrony, rather than the [warp](/gpu-glossary/device-software/warp)-level
asynchrony used to program the rest of the hardware.

In the CUDA Tile programming model, programs are expressed at the level of
_tile-kernels_, which are instances of the program that run concurrently across
a grid of _tile blocks_, each of which is a single thread of execution.
Tile-kernels operate, in the happy path, on _structured pointers_, which combine
a pointer with information about an array: its total extent (shape) and its
access patterns (stride). Note the similarity to the
[CuTe](/gpu-glossary/host-software/cute) type system for \`Layout\`s and
\`Tensor\`s.

As with traditional "CUDA SIMT" in CUDA C/C++ and PTX IR, this programming model
is shared between high-level languages and an intermediate representation --
here,
[Tile IR](https://docs.nvidia.com/cuda/tile-ir/latest/sections/prog_model.html).

At time of writing in mid-2026, the CUDA Tile programming model is new, and to
what extent it will replace the existing "CUDA SIMT" programming model is as yet
unclear. The CUDA Tile programming model is currently available via
[cuTile Python](https://docs.nvidia.com/cuda/cutile-python/quickstart.html). It
is also available, albeit in experimental form, via
[cuTile BASIC](/gpu-glossary/host-software/cutile-basic) and
[cuTile Rust](https://github.com/nvlabs/cutile-rs).
`,Pe=`---
title: What is Global Memory?
---

![Global memory is the highest level of the [memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) in the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model). It is stored in the [GPU RAM](/gpu-glossary/device-hardware/gpu-ram). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

As part of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
each level of the
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) has access to
matching memory from the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy). This memory
can be used for coordination and communication and is managed by the programmer
(not the hardware or a runtime).

The highest level of that memory hierarchy is the global memory. Global memory
is global in its scope and its lifetime. That is, it is accessible by every
[thread](/gpu-glossary/device-software/thread) in a
[thread block grid](/gpu-glossary/device-software/thread-block-grid) and its
lifetime is as long as the execution of the program.

Access to data structures in the global memory can be synchronized across all
accessors using atomic instructions, as with CPU memory. Within a
[cooperative thread array](/gpu-glossary/device-software/cooperative-thread-array),
access can be more tightly synchronized, e.g. with barriers.

This level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) is typically
implemented in the [GPU's RAM](/gpu-glossary/device-hardware/gpu-ram) and
allocated from the host using a memory allocator provided by the
[CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api) or the
[CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api).

The terminology "global" unfortunately collides with the \`__global__\` keyword in
[CUDA C/C++](/gpu-glossary/host-software/cuda-c), which annotates functions that
are launched on the host but run on the device
([kernels](/gpu-glossary/device-software/kernel)), whereas global memory is only
on the device. Early CUDA architect Nicholas Wilt wrily notes that this choice
was made "for maximum developer confusion" in his
[_CUDA Handbook_](https://www.cudahandbook.com/).
`,Fe=`---
title: What is a CUDA Kernel?
---

![A single kernel launch corresponds to a [thread block grid](/gpu-glossary/device-software/thread-block-grid) in the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

A kernel is the unit of
[CUDA](/gpu-glossary/device-software/cuda-programming-model) code that
programmers typically write and compose, akin to a procedure or function in
languages targeting CPUs.

Unlike procedures, a kernel is called ("launched") once and returns once, but is
executed many times, once each by a number of
[threads](/gpu-glossary/device-software/thread). These executions are generally
concurrent (their execution order is non-deterministic) and parallel (they occur
simultaneously on different execution units).

The collection of all threads executing a kernel is organized as a kernel grid —
aka a [thread block grid](/gpu-glossary/device-software/thread-block-grid), the
highest level of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy). A kernel
grid executes across multiple
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
and so operates at the scale of the entire GPU. The matching level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) is the
[global memory](/gpu-glossary/device-software/global-memory).

In [CUDA C++](/gpu-glossary/host-software/cuda-c), kernels are passed pointers
to [global memory](/gpu-glossary/device-software/global-memory) on the device
when they are invoked by the host and return nothing — they just mutate memory.

To give a flavor for CUDA kernel programming, let's walk through two
implementations of the "hello world" of CUDA kernels: matrix multiplication of
two square matrices, \`A\` and \`B\`. The two implementations will differ in how
they map the textbook matrix multiplication algorithm onto the
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) and
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy).

In the simplest implementation, inspired by the first matmul kernel in
[Programming Massively Parallel Processors](https://www.amazon.com/dp/0323912311)
(4th edition, Figure 3.11), each [thread](/gpu-glossary/device-software/thread)
does all of the work to compute one element of the output matrix -- loading in
turn each element of a particular \`row\` of \`A\` and a particular \`col\`umn of \`B\`
into [registers](/gpu-glossary/device-software/registers), multiplying the
paired elements, summing the results, and placing the sum back in
[global memory](/gpu-glossary/device-software/global-memory).

\`\`\`cpp
__global__ void mm(float* A, float* B, float* C, int N) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < N && col < N) {
        float sum = 0.0f;
        for (int k = 0; k < N; k++) {
            sum += A[row * N + k] * B[k * N + col];
        }
        C[row * N + col] = sum;
    }
}
\`\`\`

In this kernel, each [thread](/gpu-glossary/device-software/thread) does one
floating point operation (FLOP) per read from
[global memory](/gpu-glossary/device-software/global-memory): a multiply and an
add; a load from \`A\` and a load from \`B\`. You'll never
[use the whole GPU](https://modal.com/blog/gpu-utilization-guide) that way,
since the [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) of the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) in FLOPs/s is much higher
than the [memory bandwidth](/gpu-glossary/perf/memory-bandwidth) between the
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram) and the
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor).

We can increase
[the ratio of FLOPs to memory operations](/gpu-glossary/perf/arithmetic-intensity)
by more carefully mapping the work in this algorithm onto the
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) and
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy). In the
"tiled" matmul kernel below, inspired by that in Figure 5.9 of the 4th edition
of
[Programming Massively Parallel Processors](https://www.amazon.com/dp/0323912311),
we map the loading of submatrices of \`A\` and \`B\` and the computation of
submatrices of \`C\` onto
[shared memory](/gpu-glossary/device-software/shared-memory) and
[thread blocks](/gpu-glossary/device-software/thread-block) respectively.

\`\`\`cpp
#define TILE_WIDTH 16

__global__ void mm(float* A, float* B, float* C, int N) {

    // declare variables in shared memory ("smem")
    __shared__ float As[TILE_WIDTH][TILE_WIDTH];
    __shared__ float Bs[TILE_WIDTH][TILE_WIDTH];

    int row = blockIdx.y * TILE_WIDTH + threadIdx.y;
    int col = blockIdx.x * TILE_WIDTH + threadIdx.x;

    float c_output = 0;
    for (int m = 0; m < N/TILE_WIDTH; ++m) {

        // each thread loads one element of A and one of B from global memory into smem
        As[threadIdx.y][threadIdx.x] = A[row * N + (m * TILE_WIDTH + threadIdx.x)];
        Bs[threadIdx.y][threadIdx.x] = B[(m * TILE_WIDTH + threadIdx.y) * N + col];

        // we wait until all threads in the 16x16 block are done loading into smem
        // so that it contains two 16x16 tiles
        __syncthreads();

        // then we loop over the inner dimension,
        // performing 16 multiplies and 16 adds per pair of loads from global memory
        for (int k = 0; k < TILE_WIDTH; ++k) {
            c_output += As[threadIdx.y][k] * Bs[k][threadIdx.x];
        }
        // wait for all threads to finish computing
        // before any start loading the next tile into smem
        __syncthreads();
    }
    C[row * N + col] = c_output;
}
\`\`\`

For each iteration of the outer loop, which loads two elements, a thread runs 16
iterations of the inner loop, which does a multiply and an add, for 16 FLOPs per
global memory read.

This is still far from a fully optimized kernel for matrix multiplication.
[This worklog by Si Boehm of Anthropic](https://siboehm.com/articles/22/CUDA-MMM)
walks through optimizations that further increase the FLOP to memory read ratio
and map the algorithm even more tightly onto the hardware. Our kernels resemble
his Kernel 1 and Kernel 3; the worklog covers ten kernels.

That worklog and this article only consider writing kernels for execution on the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core). The absolute fastest
matrix multiplication kernels run instead on
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core), which have a much
higher [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth).
`,Ie=`---
title: What is the CUDA Memory Hierarchy?
---

![[Shared memory](/gpu-glossary/device-software/shared-memory) and [global memory](/gpu-glossary/device-software/global-memory) are two levels of the memory hierarchy in the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model) (left), mapping onto the [L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) and [GPU RAM](/gpu-glossary/device-hardware/gpu-ram), respectively. Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

As part of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
each level of the
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) has access to
a distinct block of memory shared by all
[threads](/gpu-glossary/device-software/thread) in a group at that level: a
"memory hierarchy". This memory can be used for coordination and communication
and is managed by the programmer (not the hardware or a runtime).

For a [thread block grid](/gpu-glossary/device-software/thread-block-grid), that
shared memory is in the [GPU's RAM](/gpu-glossary/device-hardware/gpu-ram) and
is known as the [global memory](/gpu-glossary/device-software/global-memory).
Access to this memory can be coordinated with atomic operations and barriers,
but execution order across
[thread blocks](/gpu-glossary/device-software/thread-block) is indeterminate.

For a single [thread](/gpu-glossary/device-software/thread), the memory is a
chunk of the
[Streaming Multiprocessor's (SM's)](/gpu-glossary/device-hardware/streaming-multiprocessor)
[register file](/gpu-glossary/device-hardware/register-file). According to the
original semantics of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
this memory is private to a [thread](/gpu-glossary/device-software/thread), but
certain instructions added to
[PTX](/gpu-glossary/device-software/parallel-thread-execution) and
[SASS](/gpu-glossary/device-software/streaming-assembler) to target matrix
multiplication on [Tensor Cores](/gpu-glossary/device-hardware/tensor-core)
share inputs and outputs across [threads](/gpu-glossary/device-software/thread).

In between, the [shared memory](/gpu-glossary/device-software/shared-memory) for
the [thread block](/gpu-glossary/device-software/thread-block) level of the
thread hierarchy is stored in the
[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) of each
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor). Careful management
of this cache — e.g. loading data into it to support the
[maximum number of arithmetic operations before new data is loaded](/gpu-glossary/perf/arithmetic-intensity)
— is key to the art of designing [high-performance](/gpu-glossary/perf) CUDA
[kernels](/gpu-glossary/device-software/kernel).
`,Le=`---
title: What is Parallel Thread Execution?
abbreviation: PTX
---

Parallel Thread eXecution (PTX) is an intermediate representation (IR) for code
that will run on a parallel processor (almost always an NVIDIA GPU). It is one
of the formats output by \`nvcc\`, the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc). It is
pronounced "pee-tecks" by many NVIDIA engineers and "pee-tee-ecks" by everyone
else.

NVIDIA documentation refers to PTX as both a "virtual machine" and an
"instruction set architecture".

From the programmer's perspective, PTX is an instruction set for programming
against a virtual machine model. Programmers or compilers producing PTX can be
confident their program will run with the same semantics on many distinct
physical machines, including machines that do not yet exist. In this way, it is
also similar to CPU instruction set architectures like
[x86_64](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html),
[aarch64](https://developer.arm.com/documentation/ddi0487/latest/), or
[SPARC](https://www.gaisler.com/doc/sparcv8.pdf).

Unlike those ISAs, PTX is very much an
[intermediate representation](https://en.wikipedia.org/wiki/Intermediate_representation),
like LLVM-IR. The PTX components of a
[CUDA binary](/gpu-glossary/host-software/cuda-binary-utilities) will be
just-in-time (JIT) compiled by the host
[CUDA Drivers](/gpu-glossary/host-software/nvidia-gpu-drivers) into
device-specific [SASS](/gpu-glossary/device-software/streaming-assembler) for
execution.

In the case of NVIDIA GPUs, PTX is forward-compatible: GPUs with a matching or
higher [compute capability](/gpu-glossary/device-software/compute-capability)
version will be able to run the program, thanks to this mechanism of JIT
compilation. In this way, PTX is a
["narrow waist"](https://www.oilshell.org/blog/2022/02/diagrams.html) that
separates the worlds of hardware and software.

Some exemplary PTX:

\`\`\`ptx
.reg .f32 %f<7>;
\`\`\`

- a compiler directive for the
  PTX-to-[SASS](/gpu-glossary/device-software/streaming-assembler) compiler
  indicating that this kernel consumes seven 32-bit floating point
  [registers](/gpu-glossary/device-software/registers). Registers are
  dynamically allocated to groups of
  [threads](/gpu-glossary/device-software/thread)
  ([warps](/gpu-glossary/device-software/warp)) from the
  [SM](/gpu-glossary/device-hardware/streaming-multiprocessor)'s
  [register file](/gpu-glossary/device-hardware/register-file).

\`\`\`ptx
fma.rn.f32 %f5, %f4, %f3, 0f3FC00000;
\`\`\`

- apply a fused multiply-add (\`fma\`) operation to multiply the contents of
  registers \`f3\` and \`f4\` and add the constant \`0f3FC00000\`, storing the result
  in \`f5\`. All numbers are in 32 bit floating point representation. The \`rn\`
  suffix for the FMA operation sets the floating point rounding mode to
  [IEEE 754 "round even"](https://en.wikipedia.org/wiki/IEEE_754) (the default).

\`\`\`ptx
mov.u32 %r1, %ctaid.x;
mov.u32 %r2, %ntid.x;
mov.u32 %r3, %tid.x;
\`\`\`

- \`mov\`e the \`x\`-axis values of the \`c\`ooperative \`t\`hread \`a\`rray \`i\`n\`d\`ex,
  the cooperative thread array dimension index (\`ntid\`), and the \`t\`hread
  \`i\`n\`d\`ex into three \`u32\` registers \`r1\` - \`r3\`.

The PTX programming model exposes multiple levels of parallelism to the
programmer. These levels map directly onto the hardware through the PTX machine
model, diagrammed below.

![The PTX machine model. Modified from the [PTX documentation](https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-machine-model).](themed-image://ptx-machine-model.svg)

Notably, in this machine model there is a single instruction unit for multiple
processors. While each processor runs one
[thread](/gpu-glossary/device-software/thread), those threads must execute the
same instructions — hence _parallel_ thread execution, or PTX. They coordinate
with each other through
[shared memory](/gpu-glossary/device-software/shared-memory) and effect
different results by means of private
[registers](/gpu-glossary/device-software/registers).

The documentation for the latest version of PTX is available from NVIDIA
[here](https://docs.nvidia.com/cuda/parallel-thread-execution/). The instruction
sets of PTX are versioned with a number called the
"[compute capability](/gpu-glossary/device-software/compute-capability)", which
is synonymous with "minimum supported
[Streaming Multiprocessor architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
version".

Writing in-line PTX by hand is uncommon outside of the cutting edge of
performance, similar to writing in-line \`x86_64\` assembly, as is done in
high-performance vectorized query operators in analytical databases and in
performance-sensitive sections of operating system kernels. At time of writing
in September of 2025, in-line PTX is the only way to take advantage of some
Hopper-specific hardware features like the \`wgmma\` and \`tma\` instructions, as in
[Flash Attention 3](https://arxiv.org/abs/2407.08608) or in the
[Machete w4a16 kernels](https://youtu.be/-4ZkpQ7agXM). Viewing
[CUDA C/C++](/gpu-glossary/host-software/cuda-c),
[SASS](/gpu-glossary/device-software/streaming-assembler), and
[PTX](/gpu-glossary/device-software/parallel-thread-execution) together is
supported on [Godbolt](https://godbolt.org/z/5r9ej3zjW). See the
[NVIDIA "Inline PTX Assembly in CUDA" guide](https://docs.nvidia.com/cuda/inline-ptx-assembly/)
for details.
`,Re=`---
title: What are Registers?
---

![Registers are the memory of the [memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) associated with individual [threads](/gpu-glossary/device-software/thread) (left). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

At the lowest level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) are the
registers, which store information manipulated by a single
[thread](/gpu-glossary/device-software/thread).

The values in registers are generally stored in the
[register file](/gpu-glossary/device-hardware/register-file) of the
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor),
but they can also spill to the
[global memory](/gpu-glossary/device-software/global-memory) in the
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram) at a substantial performance
penalty.

As when programming CPUs, these registers are not directly manipulated by
high-level languages like [CUDA C](/gpu-glossary/host-software/cuda-c). They are
only visible to a lower-level language, here
[Parallel Thread Execution (PTX)](/gpu-glossary/device-software/parallel-thread-execution).
They are typically managed by a compiler like \`ptxas\`. Among the compiler's
goals is to limit the register space used by each
[thread](/gpu-glossary/device-software/thread) so that more
[thread blocks](/gpu-glossary/device-software/thread-block) can be
simultaneously scheduled into a single
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), increasing
[occupancy](/gpu-glossary/perf/occupancy).

The registers used in the
[PTX](/gpu-glossary/device-software/parallel-thread-execution) instruction set
architecture are documented
[here](https://docs.nvidia.com/cuda/parallel-thread-execution/#register-state-space).
The registers used in [SASS](/gpu-glossary/device-software/streaming-assembler)
are not, to our knowledge, documented.
`,ze=`---
title: What is Shared Memory?
---

![Shared memory is the abstract memory associated with the [thread block](/gpu-glossary/device-software/thread-block) level (left, center) of the CUDA thread group hierarchy (left). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

Shared memory is the level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) corresponding
to the [thread block](/gpu-glossary/device-software/thread-block) level of the
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) in the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model).
It is generally expected to be much smaller but much faster (in throughput and
latency) than the [global memory](/gpu-glossary/device-software/global-memory).

A fairly typical [kernel](/gpu-glossary/device-software/kernel) therefore looks
something like this:

- load data from [global memory](/gpu-glossary/device-software/global-memory)
  into shared memory
- perform a number of arithmetic operations on that data via the
  [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) and
  [Tensor Cores](/gpu-glossary/device-hardware/tensor-core)
- optionally, synchronize [threads](/gpu-glossary/device-software/thread) within
  a [thread block](/gpu-glossary/device-software/thread-block) by means of
  barriers while performing those operations
- write data back into
  [global memory](/gpu-glossary/device-software/global-memory), optionally
  preventing races across
  [thread blocks](/gpu-glossary/device-software/thread-block) by means of
  atomics

Shared memory is stored in the
[L1 data cache](/gpu-glossary/device-hardware/l1-data-cache) of the GPU's
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
`,Be=`---
title: What is Streaming Assembler?
abbreviation: SASS
---

[Streaming ASSembler](https://stackoverflow.com/questions/9798258/what-is-sass-short-for)
(SASS) is the assembly format for programs running on NVIDIA GPUs. This is the
lowest-level format in which human-readable code can be written. It is one of
the formats output by \`nvcc\`, the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc), alongside
[PTX](/gpu-glossary/device-software/parallel-thread-execution). It is converted
to device-specific binary microcodes during execution. Presumably, the
"Streaming" in "Streaming Assembler" refers to the
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor)
which the assembly language programs.

SASS is versioned and tied to a specific NVIDIA GPU
[SM architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
See also [Compute Capability](/gpu-glossary/device-software/compute-capability).

Some exemplary instructions in SASS for the SM90a architecture of Hopper GPUs:

- \`FFMA R0, R7, R0, 1.5 ;\` - perform a \`F\`used \`F\`loating point \`M\`ultiply \`A\`dd
  that multiplies the contents of \`R\`egister 7 and \`R\`egister 0, adds \`1.5\`, and
  stores the result in \`R\`egister 0.
- \`S2UR UR4, SR_CTAID.X ;\` - copy the \`X\` value of the
  [Cooperative Thread Array](/gpu-glossary/device-software/cooperative-thread-array)'s
  \`I\`n\`D\`ex from its \`S\`pecial \`R\`egister to \`U\`niform \`R\`egister 4.

Even more so than for CPUs, writing this "GPU assembler" by hand is very
uncommon. Viewing compiler-generated SASS while profiling and editing high-level
[CUDA C/C++](/gpu-glossary/host-software/cuda-c) code or in-line
[PTX](/gpu-glossary/device-software/parallel-thread-execution) is
[more common](https://docs.nvidia.com/gameworks/content/developertools/desktop/ptx_sass_assembly_debugging.htm),
especially in the production of the highest-performance kernels. Viewing
[CUDA C/C++](/gpu-glossary/host-software/cuda-c), SASS, and
[PTX](/gpu-glossary/device-software/parallel-thread-execution) together is
supported on [Godbolt](https://godbolt.org/z/5r9ej3zjW). For more detail on SASS
with a focus on performance debugging workflows, see
[this talk](https://www.youtube.com/watch?v=we3i5VuoPWk) from Arun Demeure.

SASS is _very_ lightly documented — the instructions are listed in the
[documentation for NVIDIA's CUDA binary utilities](https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html#instruction-set-ref),
but their semantics are not defined. The mapping from ASCII assembler to binary
opcodes and operands is entirely undocumented, but it has been
reverse-engineered in certain cases
([Maxwell](https://github.com/NervanaSystems/maxas),
[Lovelace](https://kuterdinel.com/nv_isa_sm89/)).
`,Ve=`---
title: What is a Thread Block Grid?
---

![Thread block grids are the highest level of the thread group hierarchy of the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model) (left). They map onto multiple [Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor) (right, bottom). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

When a CUDA [kernel](/gpu-glossary/device-software/kernel) is launched, it
creates a collection of [threads](/gpu-glossary/device-software/thread) known as
a thread block grid. Grids can be one, two, or three dimensional. They are made
up of [thread blocks](/gpu-glossary/device-software/thread-block).

The matching level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy) is the
[global memory](/gpu-glossary/device-software/global-memory).

[Thread blocks](/gpu-glossary/device-software/thread-block) are effectively
independent units of computation. They execute concurrently, that is, with
indeterminate order, ranging from fully sequentially in the case of a GPU with a
single
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)
to fully in parallel when run on a GPU with sufficient resources to run them all
simultaneously.
`,He=`---
title: What is a CUDA Thread Block?
---

![Thread blocks are an intermediate level of the thread group hierarchy of the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model) (left). A thread block executes on a single [Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor) (right, middle). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

A thread block is a level of the
[CUDA programming model's](/gpu-glossary/device-software/cuda-programming-model)
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy) below a
[grid](/gpu-glossary/device-software/thread-block-grid) but above a
[thread](/gpu-glossary/device-software/thread). It is the
[CUDA programming model's](/gpu-glossary/device-software/cuda-programming-model)
abstract equivalent of the concrete
[cooperative thread arrays](/gpu-glossary/device-software/cooperative-thread-array)
in
[PTX](/gpu-glossary/device-software/parallel-thread-execution)/[SASS](/gpu-glossary/device-software/streaming-assembler).

Blocks are the smallest unit of thread coordination exposed to programmers in
the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model).
Blocks must execute independently, so that any execution order for blocks is
valid, from fully serial in any order to all interleavings.

A single CUDA [kernel](/gpu-glossary/device-software/kernel) launch produces one
or more thread blocks (in the form of a
[thread block grid](/gpu-glossary/device-software/thread-block-grid)), each of
which contains one or more [warps](/gpu-glossary/device-software/warp). Blocks
can be arbitrarily sized, up to a limit of 1024 on current devices, but they are
typically multiples of the [warp](/gpu-glossary/device-software/warp) size (32
on current devices).
`,Ue=`---
title: What is the CUDA Thread Hierarchy?
---

![The thread hierarchy of the [CUDA programming model](/gpu-glossary/device-software/cuda-programming-model) spans from individual [threads](/gpu-glossary/device-software/thread) to [thread blocks](/gpu-glossary/device-software/thread-block) to [thread block grids](/gpu-glossary/device-software/thread-block-grid) (left), mapping onto the hardware from [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) to [Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor) to the entire GPU (right). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

The thread hierarchy is a key abstraction of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
alongside the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy). It organizes
the execution of parallel programs across multiple levels, from individual
threads up to entire GPU devices.

At the lowest level are individual
[threads](/gpu-glossary/device-software/thread). Like a thread of execution on a
CPU, each [CUDA thread](/gpu-glossary/device-software/thread) executes a stream
of instructions. The hardware resources that effect arithmetic and logic
instructions are called [cores](/gpu-glossary/device-hardware/core) or sometimes
"pipes". Threads are selected for execution by the
[Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler).

The intermediate level consists of
[thread blocks](/gpu-glossary/device-software/thread-block), which are also
known as
[cooperative thread arrays](/gpu-glossary/device-software/cooperative-thread-array)
in [PTX](/gpu-glossary/device-software/parallel-thread-execution) and
[SASS](/gpu-glossary/device-software/streaming-assembler). Each
[thread](/gpu-glossary/device-software/thread) has a unique identifier within
its [thread block](/gpu-glossary/device-software/thread-block). These thread
identifiers are index-based, to support easy assignment of work to threads based
on indices into input or output arrays. All threads within a block are scheduled
simultaneously onto the same
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
They can coordinate through
[shared memory](/gpu-glossary/device-software/shared-memory) and synchronize
with barriers.

At the highest level, multiple
[thread blocks](/gpu-glossary/device-software/thread-block) are organized into a
[thread block grid](/gpu-glossary/device-software/thread-block-grid) that spans
the entire GPU. [Thread blocks](/gpu-glossary/device-software/thread-block) are
strictly limited in their coordination and communication. Blocks within a grid
execute concurrently with respect to each other, with no guaranteed execution
order. [CUDA programs](/gpu-glossary/device-software/cuda-programming-model)
must be written so that any interleaving of blocks is valid, from fully serial
to fully parallel. That means
[thread blocks](/gpu-glossary/device-software/thread-block) cannot, for
instance, synchronize with barriers. Like
[threads](/gpu-glossary/device-software/thread), each
[thread block](/gpu-glossary/device-software/thread-block) has a unique,
index-based identifier to support assignment of work based on array index.

This hierarchy maps directly onto the
[GPU hardware](/gpu-glossary/device-hardware):
[threads](/gpu-glossary/device-software/thread) execute on individual
[cores](/gpu-glossary/device-hardware/core),
[thread blocks](/gpu-glossary/device-software/thread-block) are scheduled onto
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor), and
[grids](/gpu-glossary/device-software/thread-block-grid) utilize all available
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) on the device.
`,We=`---
title: What is a CUDA Thread?
---

![Threads are the lowest level of the thread group hierarchy (top, left) and are mapped onto the [cores](/gpu-glossary/device-hardware/core) of a [Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor). Modified from diagrams in NVIDIA's [CUDA Refresher: The CUDA Programming Model](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/) and the NVIDIA [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model).](themed-image://cuda-programming-model.svg)

A _thread of execution_ (or "thread" for short) is the lowest unit of
programming for GPUs, the base and atom of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy). A thread has
its own [registers](/gpu-glossary/device-software/registers), but little else.

Both [SASS](/gpu-glossary/device-software/streaming-assembler) and
[PTX](/gpu-glossary/device-software/parallel-thread-execution) programs target
threads. Compare this to a typical C program in a POSIX environment, which
targets a process, itself a collection of one or more threads. Unlike POSIX
threads, [CUDA](/gpu-glossary/device-software/cuda-programming-model) threads
are not used to make syscalls.

Like a thread on a CPU, a GPU thread can have a private instruction
pointer/program counter. However, for performance reasons, GPU programs are
generally written so that all the threads in a
[warp](/gpu-glossary/device-software/warp) share the same instruction pointer,
executing instructions in lock-step (see also
[Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler)).

Also like threads on CPUs, GPU threads have stacks in
[global memory](/gpu-glossary/device-hardware/gpu-ram) for storing spilled
registers and a function call stack, but high-performance
[kernels](/gpu-glossary/device-software/kernel) generally limit use of both.

A single [CUDA Core](/gpu-glossary/device-hardware/cuda-core) executes
instructions from a single thread.
`,Ge=`---
title: What is a Warp?
---

A warp is a group of [threads](/gpu-glossary/device-software/thread) that are
scheduled together and execute in parallel. All
[threads](/gpu-glossary/device-software/thread) in a warp are scheduled onto a
single
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
A single [SM](/gpu-glossary/device-hardware/streaming-multiprocessor) typically
executes multiple warps, at the very least all warps from the same
[Cooperative Thread Array](/gpu-glossary/device-software/cooperative-thread-array),
aka [thread block](/gpu-glossary/device-software/thread-block).

Warps are the typical unit of execution on a GPU. In normal execution, all
[threads](/gpu-glossary/device-software/thread) of a warp execute the same
instruction in parallel — the so-called "Single-Instruction, Multiple Thread" or
SIMT model. When the [threads](/gpu-glossary/device-software/thread) in a warp
split from one another to execute different instructions, also known as
[warp divergence](/gpu-glossary/perf/warp-divergence), performance generally
drops precipitously.

Warp size is technically a machine-dependent constant, but in practice (and
elsewhere in this glossary) it is 32.

When a warp is issued an instruction, the results are generally not available
within a single clock cycle, and so dependent instructions cannot be issued.
While this is most obviously true for fetches from
[global memory](/gpu-glossary/device-software/global-memory), which generally
[go off-chip](/gpu-glossary/device-hardware/gpu-ram), it is also true for some
arithmetic instructions (see
[the CUDA C++ Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#arithmetic-instructions)
for a table of results per clock cycle for specific instructions).

A warp whose next instruction is delayed by missing operands is said to be
[stalled](/gpu-glossary/perf/warp-execution-state).

Instead of waiting for an instruction's results to return, when multiple warps
are scheduled onto a single
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), the
[Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler) will select
another warp to execute. This
[latency-hiding](/gpu-glossary/perf/latency-hiding) is how GPUs achieve high
throughput and ensure work is always available for all of their cores during
execution. For this reason, it is often beneficial to maximize the number of
warps scheduled onto each
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), ensuring there is
always an [eligible](/gpu-glossary/perf/warp-execution-state) warp for the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) to run. The
fraction of cycles on which a warp was issued an instruction is known as the
[issue efficiency](/gpu-glossary/perf/issue-efficiency). The degree of
concurrency in warp scheduling is known as
[occupancy](/gpu-glossary/perf/occupancy).

Warps are not actually part of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)'s
[thread hierarchy](/gpu-glossary/device-software/thread-hierarchy). Instead,
they are an implementation detail of the implementation of that model on NVIDIA
GPUs. In that way, they are somewhat akin to
[cache lines](https://www.nic.uoregon.edu/~khuck/ts/acumem-report/manual_html/ch03s02.html)
in CPUs: a feature of the hardware that you don't directly control and don't
need to consider for program correctness, but which is important for achieving
[maximum performance](/gpu-glossary/perf).

Warps are named in reference to weaving, "the first parallel thread technology",
according to
[Lindholm et al., 2008](https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf).
The equivalent of warps in other GPU programming models include
[subgroups](https://github.com/gpuweb/gpuweb/pull/4368) in WebGPU,
[waves](https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html)
in DirectX, and
[simdgroups](https://developer.apple.com/documentation/metal/compute_passes/creating_threads_and_threadgroups#2928931)
in Metal.
`,Ke=`---
title: What is a Warpgroup?
---

A warpgroup is a set of four contiguous
[warps](/gpu-glossary/device-software/warp) such that the warp-rank of the first
warp is a multiple of 4.

Upon dispatching a warpgroup-level instruction, we coordinate 128
[threads](/gpu-glossary/device-software/thread) -- 4 warps per warpgroup × 32
threads per warp. Operating at a larger granularity removes the need for
explicit inter-warp synchronization and allows work to be performed on larger
problem sizes per instruction, especially larger matrix multiplications. Larger
matrix multiplications more readily saturate the massive
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) of the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) of recent data center
GPUs.

Warpgroups were introduced in NVIDIA's Hopper
[Streaming Multiprocessor architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
where they are used to support warpgroup-level matrix multiplication, like
\`wgmma.mma_async\`. See
[this blog post from Colfax](https://research.colfax-intl.com/cutlass-tutorial-wgmma-hopper/)
for a deep dive. Warpgroups feature prominently in the organization of pipeline
components of high-performance Hopper and Blackwell
[kernels](/gpu-glossary/device-software/kernel), like
[Flash Attention 4](https://modal.com/blog/reverse-engineer-flash-attention-4).

In
[Parallel Thread Execution (PTX)](/gpu-glossary/device-software/parallel-thread-execution)
IR, the warp-rank of a warp is:

\`\`\`cpp
int linearIdx = (%tid.x + %tid.y * %ntid.x  + %tid.z * %ntid.x * %ntid.y);
int warpRank = linearIdx / 32;
\`\`\`

where \`tid\` is the thread index, accessed via special PTX
[registers](/gpu-glossary/device-software/registers).

So the valid warpgroups for an 8-warp dispatch are:

- **Warpgroup 0**: warp-ranks 0, 1, 2, and 3
- **Warpgroup 1**: warp-ranks 4, 5, 6, and 7.

To our knowledge, the purpose of the warp-rank alignment restriction is not
documented. But
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor)
for recent data center GPUs appear to contain four (unnamed) subunits, each with
their own [Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler) and
Tensor Core.
`,qe=`---
title: Device Software
---

These terms and technologies are used for software that runs on GPU — the
"device" in NVIDIA's lingo.
`,Je=`---
title: What is cuBLAS?
---

cuBLAS (CUDA Basic Linear Algebra Subroutines) is NVIDIA's high-performance
implementation of the
[Basic Linear Algebra Subprograms (BLAS)](https://en.wikipedia.org/wiki/Basic_Linear_Algebra_Subprograms)
standard. It is a proprietary software library that provides highly optimized
[kernels](/gpu-glossary/device-software/kernel) for common linear algebra
operations.

Instead of writing and optimizing common operations like matrix multiplication
from scratch, developers can call cuBLAS functions from their host code. The
library contains a wide array of kernels, each fine-tuned for specific data
types (e.g. FP32, FP16), matrix sizes, and
[Streaming Multiprocessor (SM) architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
At runtime, cuBLAS uses (unknown) internal heuristics to select the most
performant kernel and its optimal launch parameters. As a result, cuBLAS is the
foundation for most [high-performance](/gpu-glossary/perf) numerical computing
on NVIDIA GPUs and is used extensively by deep learning frameworks like PyTorch
to accelerate their core operations, along with more specialized
[kernel](/gpu-glossary/device-software/kernel) libraries like
[cuDNN](/gpu-glossary/host-software/cudnn).

The single most common source of error when using cuBLAS is the matrix data
layout. For historical reasons, and to maintain compatibility with the original
BLAS standard (which was written in Fortran), cuBLAS expects matrices to be in
[column-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order).
This is the opposite of the commonly used row-major order in C, C++, and Python.
Furthermore, a BLAS function needs to know not just the size of the operation
(e.g., \`M\`, \`N\`, \`K\`), but also how to find the start of each column in memory.
This is specified by the leading dimension (e.g. \`lda\`). The leading dimension
is the stride between consecutive columns. When working with an entire allocated
matrix, the leading dimension is just the number of rows. However, if working
with a submatrix, the leading dimension would be the number of rows in the
larger, parent matrix from which the submatrix is taken.

Fortunately, for computationally intensive kernels like GEMM, it is not
necessary to reorder matrices from row-major to column-major. Instead, we can
use the mathematical identity that if \`C = A @ B\`, then \`C^T = B^T @ A^T\`. The
key insight is that a matrix stored in row-major order has the exact same memory
layout as its transpose stored in column-major order. Therefore, if we provide
our row-major matrices \`A\` and \`B\` to cuBLAS but swap their order in the
function call (along with their dimensions), cuBLAS will compute \`C^T\` and
output it in column-major order. This resulting block of memory, when
interpreted in row-major, is exactly the matrix \`C\` that we want. This technique
is demonstrated in the following function:

\`\`\`cpp
#include <cublas_v2.h>

// performs single-precision C = alpha * A @ B + beta * C
// on row-major matrices using cublasSgemm
void sgemm_row_major(cublasHandle_t handle, int M, int N, int K,
                     const float *alpha,
                     const float *A, const float *B,
                     const float *beta,
                     float *C) {

  // A is M x K (row-major), cuBLAS sees it as A^T (K x M, column-major),
  //   the leading dimension of A^T is K
  // B is K x N (row-major), cuBLAS sees it as B^T (N x K, column-major),
  //   the leading dimension of B^T is N
  // C is M x N (row-major), cuBLAS sees it as C^T (N x M, column-major),
  //   the leading dimension of C^T is N

  // note the swapped A and B, and the swapped M and N
  cublasSgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N,
              N, M, K,
              alpha,
              B, N,  // leading dimension of B^T
              A, K,  // leading dimension of A^T
              beta,
              C, N); // leading dimension of C^T
}
\`\`\`

A complete, runnable version of this example is available on
[Godbolt](https://godbolt.org/z/axzYb75ro).

The \`CUBLAS_OP_N\` flag instructs the kernel to use the matrices as provided
(without an additional transpose operation from its perspective).

To use the cuBLAS library, it must be linked (e.g. using the flag \`-lcublas\`
when compiling with [nvcc](/gpu-glossary/host-software/nvcc)). Its functions are
exposed via the \`cublas_v2.h\` header.

For more information on cuBLAS, see the
[official cuBLAS documentation](https://docs.nvidia.com/cuda/cublas/).
`,Ye=`---
title: What are the CUDA Binary Utilities?
---

The CUDA Binary Utilities are a collection of tools for examining the contents
of binaries like those output by \`nvcc\`, the
[NVIDIA CUDA Compiler driver](/gpu-glossary/host-software/nvcc).

One tool, \`cuobjdump\`, can be used to examine and manipulate the contents of
entire host binaries or of the CUDA-specific \`cubin\` files that are normally
embedded within those binaries.

Another, \`nvidisasm\`, is intended for manipulating \`cubin\` files. It can extract
[SASS assembler](/gpu-glossary/device-software/streaming-assembler) and
manipulate it, e.g. constructing control flow graphs and mapping assembly
instructions to lines in CUDA program files.

You can find their documentation
[here](https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html).
`,Xe=`---
title: What is the CUDA C++ programming language?
---

CUDA C++ is an implementation of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)
as an extension of the C++ programming language.

CUDA C++ adds several features to C++ to implement the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
including:

- **[Kernel](/gpu-glossary/device-software/kernel) definition** with
  **\`__global__\`**. CUDA [kernels](/gpu-glossary/device-software/kernel) are
  implemented as C++ functions that take in pointers and have return type
  \`void\`, annotated with this keyword.
- **[Kernel](/gpu-glossary/device-software/kernel) launches** with **\`<<<>>>\`**.
  [Kernels](/gpu-glossary/device-software/kernel) are executed from the CPU host
  using a triple bracket syntax that sets the
  [thread block grid](/gpu-glossary/device-software/thread-block-grid)
  dimensions.
- **[Shared memory](/gpu-glossary/device-software/shared-memory) allocation**
  with the \`shared\` keyword, **barrier synchronization** with the
  \`__syncthreads()\` intrinsic function, and
  **[thread block](/gpu-glossary/device-software/thread-block)** and
  **[thread](/gpu-glossary/device-software/thread) indexing** with the
  \`blockDim\` and \`threadIdx\` built-in variables.

CUDA C++ programs are compiled by a combination of host C/C++ compiler drivers
like \`gcc\` and the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc), \`nvcc\`.

For information on how to use CUDA C++ on [Modal](https://modal.com), see
[this guide](https://modal.com/docs/guide/cuda).
`,Ze=`---
title: What is the CUDA Driver API?
---

The [CUDA Driver API](https://docs.nvidia.com/cuda/cuda-driver-api/index.html)
is the userspace component of the NVIDIA CUDA drivers. It provides utilities
familiar to users of the C standard library: a \`cuMalloc\` function for
allocating [memory](/gpu-glossary/device-software/global-memory) on GPU devices,
for example.

![The CUDA Toolkit. The CUDA Driver API sits between applications or other toolkit components and the GPU. Adapted from the *Professional CUDA C Programming Guide*.](themed-image://cuda-toolkit.svg)

Very few CUDA programs are written to directly use the CUDA Driver API. They
instead use the
[CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api). See
[this section](https://docs.nvidia.com/cuda/cuda-driver-api/driver-vs-runtime-api.html#driver-vs-runtime-api)
of the CUDA Driver API docs.

The CUDA Driver API is generally not linked statically. Instead, it is linked
dynamically, typically under the name
[libcuda.so](/gpu-glossary/host-software/libcuda) on Linux systems.

The CUDA Driver API is binary-compatible: an application compiled against old
versions of the CUDA Driver API can run on systems with newer versions of the
CUDA Driver API. That is, the operating system's binary loader may load a newer
version of the CUDA Driver API and the program will function the same.

For details on distributing [CUDA C/C++](/gpu-glossary/host-software/cuda-c)
applications, see the
[CUDA C/C++ Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide)
from NVIDIA.

The CUDA Driver API is closed source. You can find its documentation
[here](https://docs.nvidia.com/cuda/cuda-driver-api/index.html).

Though they are not commonly used, there are projects that attempt to provide or
use open source alternatives to the CUDA Driver API, like
[LibreCuda](https://github.com/mikex86/LibreCuda) and
[tinygrad](https://github.com/tinygrad). See
[their source code](https://github.com/tinygrad/tinygrad/blob/77f7ddf62a78218bee7b4f7b9ff925a0e581fcad/tinygrad/runtime/ops_nv.py)
for details.
`,Qe=`---
title: What is a CUDA Graph?
---

A CUDA Graph is a graph of [kernel](/gpu-glossary/device-software/kernel)
launches and other work that can be submitted by the host to the device all at
once.

The primary use case for CUDA Graphs is reducing
[overhead](/gpu-glossary/perf/overhead) from host identification, configuration,
and submission of large numbers of
[kernels](/gpu-glossary/device-software/kernel) in short periods. Each launch
takes on the order of microseconds, so if hundreds of
[kernels](/gpu-glossary/device-software/kernel) need to be launched in
milliseconds, this overhead can be very noticeable. This is commonly the case
for
[low-latency LLM inference](https://modal.com/docs/guide/high-performance-llm-inference).

CUDA Graphs are most commonly created via the stream capture API in the
[CUDA Runtime](/gpu-glossary/host-software/cuda-runtime-api), which allows all
of the operations that occur on a single CUDA stream to be captured and then
later replayed, like

\`\`\`cpp
// capture
cudaStreamBeginCapture(stream);
kernelGemm<<<{32, 20},64,19200,stream>>>(a, b, c);
kernelEpilogue<<<{256,2},{8,32},0,stream>>>(c, c);
cudaStreamEndCapture(stream, &graph);

// launch
cudaGraphInstantiate(&graphExec, graph, flags);
cudaGraphLaunch(graphExec, stream);
\`\`\`

The [CUDA Runtime](/gpu-glossary/host-software/cuda-runtime-api) interface to
CUDA Graphs is documented by NVIDIA
[here](https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html).

This API is wrapped by PyTorch, e.g. via the \`torch.cuda.graph\` context manager,
which is how CUDA Graphs are generally captured for neural network training and
inference.

Below is a sample CUDA Graph, captured from a B200 GPU executing a
\`torch.Linear\` layer:

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          NODE 0: KERNEL                           │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  ID:         0 (topoId: 1)                                        │  │
│  │  Kernel:     cutlass3x_sm100_simt_sgemm_f32_f32_f32_f32_f32_      │  │
│  │              64x32x16_1x1x1_3_tnn_align1_bias_f32_relu            │  │
│  │              <<<{32,20},64,19200>>>                               │  │
│  │  Node handle: 0x0000564604539520                                  │  │
│  │  Func handle: 0x0000564603AFCC00                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          NODE 1: KERNEL                           │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  ID:         1 (topoId: 0)                                        │  │
│  │  Kernel:     _ZN8cublasLt8epilogue4impl12globalKernelILi8E...     │  │
│  │              <<<{256,2},{8,32},0>>>                               │  │
│  │  Node handle: 0x0000564604539C88                                  │  │
│  │  Func handle: 0x00005646044770F0                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

Notice that [kernels](/gpu-glossary/device-software/kernel) are identified by
pointers, e.g. \`0x564603AFCC00\`. Inputs and outputs are also defined by
pointers. These and other references to device resources prevent serialization
of CUDA Graphs and make them non-portable, outside of fully
[checkpointing and then restoring the host and device memory](https://modal.com/docs/guide/memory-snapshots).
`,$e=`---
title: What is the CUDA Runtime API?
---

The CUDA Runtime API wraps the
[CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api) and provides a
higher-level API for the same functions.

![The CUDA Toolkit. The CUDA Runtime API wraps the CUDA Driver API to make it more amenable to application programming. Adapted from the *Professional CUDA C Programming Guide*.](themed-image://cuda-toolkit.svg)

It is generally preferred over the
[Driver API](/gpu-glossary/host-software/cuda-driver-api) for better ergonomics,
but there are some small caveats around control of kernel launches and context
management. See
[this section](https://docs.nvidia.com/cuda/cuda-runtime-api/driver-vs-runtime-api.html#driver-vs-runtime-api)
of the CUDA Runtime API docs for more.

While the Runtime API may be statically linked, per
[Attachment A of the NVIDIA CUDA Toolkit EULA](https://docs.nvidia.com/cuda/eula/index.html#attachment-a),
it does not have to be. The shared object file for dynamic linking is usually
named [libcudart.so](/gpu-glossary/host-software/libcudart) on Linux systems.

The CUDA Runtime API is closed source. You can find its documentation
[here](https://docs.nvidia.com/cuda/cuda-runtime-api/index.html).
`,et=`---
title: What is the CUDA Software Platform?
---

The CUDA software platform is a collection of software for developing CUDA
programs.

CUDA stands for _Compute Unified Device Architecture_. Depending on the context,
"CUDA" can refer to multiple distinct things: a
[high-level device architecture](/gpu-glossary/device-hardware/cuda-device-architecture),
a
[parallel programming model for architectures with that design](/gpu-glossary/device-software/cuda-programming-model),
or a software platform that extends high-level languages like C to add that
programming model.

The vision for CUDA is laid out in the
[Lindholm et al., 2008](https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf)
white paper. We highly recommend this paper, which is the original source for
many claims, diagrams, and even specific turns of phrase in NVIDIA's
documentation.

Here, we focus on the CUDA _software platform_. Though CUDA software platforms
exist for other languages, like FORTRAN, Python, and
[BASIC](/gpu-glossary/host-software/cutile-basic), we will focus on the dominant
[CUDA C++](/gpu-glossary/host-software/cuda-c) version.

This platform can be roughly divided into the components used to _build_
applications, like the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc) toolchain, and
the components used _within_ or _from_ applications, like the
[CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api) and the
[CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api), diagrammed
below.

![The CUDA Toolkit. Adapted from the *Professional CUDA C Programming Guide*.](themed-image://cuda-toolkit.svg)

Built on top of these APIs are libraries of high-performance
[kernels](/gpu-glossary/device-software/kernel) for general and specific
domains, like [cuBLAS](/gpu-glossary/host-software/cublas) for linear algebra
and [cuDNN](/gpu-glossary/host-software/cudnn) for deep neural networks and
tools for composing such kernels yourself, like
[CUTLASS](/gpu-glossary/host-software/cutlass) and
[CuTe DSL](/gpu-glossary/host-software/cute-dsl).
`,tt=`---
title: What is cuDNN?
---

NVIDIA's cuDNN (CUDA Deep Neural Network) is a library of primitives for
building GPU-accelerated deep neural networks.

cuDNN provides highly optimized [kernels](/gpu-glossary/device-software/kernel)
for operations arising frequently in neural networks. These include convolution,
self-attention (including scaled dot-product attention, aka "Flash Attention"),
matrix multiplication, various normalizations, poolings, etc.

cuDNN is a key library at the application layer of the
[CUDA software platform](/gpu-glossary/host-software/cuda-software-platform),
alongside its sibling library, [cuBLAS](/gpu-glossary/host-software/cublas).
Deep learning frameworks like PyTorch typically leverage
[cuBLAS](/gpu-glossary/host-software/cublas) for general-purpose linear algebra,
such as the matrix multiplications that form the core of dense (fully-connected)
layers. They rely on cuDNN for more specialized primitives like convolutional
layers, normalization routines, and attention mechanisms.

In modern cuDNN code, computations are expressed as operation graphs, which can
be constructed using open source
[Python and C++ frontend APIs](https://docs.nvidia.com/deeplearning/cudnn/frontend/latest/developer/overview.html)
via the declarative
[Graph API](https://docs.nvidia.com/deeplearning/cudnn/frontend/v1.14.0/developer/graph-api.html)
(not to be confused with [CUDA Graphs](/gpu-glossary/host-software/cuda-graph)).

This API allows the developer to define a sequence of operations as a graph,
which cuDNN can then analyze to perform optimizations, most importantly
operation fusion. In operation fusion, a sequence of operations like
Convolution + Bias + ReLU are merged ("fused") into a single operation run as a
single [kernel](/gpu-glossary/device-software/kernel). Operation fusion helps
reduce demand on [memory bandwidth](/gpu-glossary/perf/memory-bandwidth) by
keeping program intermediates in
[shared memory](/gpu-glossary/device-software/shared-memory) throughout a
sequence of operations.

The frontends interact with a lower-level, closed source
[C backend](https://docs.nvidia.com/deeplearning/cudnn/backend/latest/api/overview.html),
which exposes an API for legacy use cases or direct C FFI.

For any given operation, cuDNN maintains multiple underlying implementations and
uses (unknown) internal heuristics to select the most performant one for the
target
[Streaming Multiprocessor (SM) architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
data types, and input sizes.

cuDNN's initial claim to fame was accelerating convolutional neural networks on
Ampere
[SM architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
GPUs. For Transformer neural networks on Hopper and especially Blackwell
[SM architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
NVIDIA has tended to place more emphasis on the
[CUTLASS](/gpu-glossary/host-software/cutlass) library.

For more information on cuDNN, see the
[official cuDNN documentation](https://docs.nvidia.com/deeplearning/cudnn/), and
the [open source frontend APIs](https://github.com/NVIDIA/cudnn-frontend).
`,nt=`---
title: What is the NVIDIA CUDA Profiling Tools Interface?
abbreviation: CUPTI
---

The NVIDIA CUDA Profiling Tools Interface (CUPTI) provides a set of APIs for
profiling execution of [CUDA C++](/gpu-glossary/host-software/cuda-c),
[PTX](/gpu-glossary/device-software/parallel-thread-execution), and
[SASS](/gpu-glossary/device-software/streaming-assembler) code on GPUs.
Critically, it synchronizes timestamps across the CPU host and the GPU device.

CUPTI's interfaces are consumed by, for example, the
[NSight Systems Profiler](/gpu-glossary/host-software/nsight-systems) and the
[PyTorch Profiler](https://modal.com/docs/examples/torch_profiling).

You can find its documentation [here](https://docs.nvidia.com/cupti/).

For details on using profiling tools for GPU applications running on Modal, see
[this example from our documentation](/docs/examples/torch_profiling).
`,rt=`---
title: What is CuTe DSL?
---

CuTe DSL is a Python-based Domain-Specific Language (DSL) for writing and
dynamically compiling [kernels](/gpu-glossary/device-software/kernel) at high
performance and with high developer productivity.

CuTe DSL is part of [CUTLASS](/gpu-glossary/host-software/cutlass), a collection
of [CUDA C++](/gpu-glossary/host-software/cuda-c) templates and DSLs. Unlike
[cuBLAS](/gpu-glossary/host-software/cublas) or
[cuDNN](/gpu-glossary/host-software/cudnn), which provide ready-to-call kernels
for common operations, the CUTLASS stack provides tools for composably defining
high-performance kernels.

The core abstractions of CuTe DSL include layouts, tensors, hardware atoms, and
tiled operations. Layouts describe how data is organized in memory and across
threads. Tensors combine data pointers or iterators with layout metadata. Atoms
represent fundamental hardware operations such as matrix multiply-accumulate
(MMA) or memory copy. Tiled operations describe how atoms are applied across
[thread blocks](/gpu-glossary/device-software/thread-block) and
[warps](/gpu-glossary/device-software/warp). For the underlying details, see
[CuTe](/gpu-glossary/host-software/cute).

When launching a CuTe DSL kernel from Python, the Python program calls a
\`@cute.jit\` function, and that function launches a \`@cute.kernel\` function.

The \`@cute.jit\` decorator declares a JIT-compiled function that can be called
from Python or from other CuTe DSL functions. The \`@cute.kernel\` decorator
defines a GPU kernel function that can be launched from a \`@cute.jit\` function.
Python code cannot call a \`@cute.kernel\` function directly.

For example, let's look at a naive (unoptimized) CuTe DSL kernel for elementwise
addition of two one-dimensional tensors -- the "hello world" for GPU programming
that goes back to
[Ian Buck's Brook framework](https://graphics.stanford.edu/papers/brookgpu/brookgpu.pdf)
that preceded and inspired
[CUDA](/gpu-glossary/device-software/cuda-programming-model). You can edit this
kernel and execute it on a B200 GPU using
[this Modal Notebook](https://modal.com/notebooks/modal-labs/examples/nb-Vnwf5bQck2WSSETJUPk2UD).

\`\`\`python
import cutlass.cute as cute
import torch

Tensor = cute.Tensor | torch.Tensor


@cute.kernel
def elem_add_kernel(a: cute.Tensor, b: cute.Tensor, out: cute.Tensor):
    block_x, _, _ = cute.arch.block_idx()
    block_dim_x, _, _ = cute.arch.block_dim()
    thread_x, _, _ = cute.arch.thread_idx()

    i = block_x * block_dim_x + thread_x

    if i < out.shape[0]:
        out[i] = a[i] + b[i]


@cute.jit
def elem_add(a: Tensor, b: Tensor, out: Tensor):
    n = out.shape[0]
    threads_per_block = 128
    blocks = (n + threads_per_block - 1) // threads_per_block

    elem_add_kernel(a, b, out).launch(
        grid=(blocks, 1, 1),
        block=(threads_per_block, 1, 1),
    )
\`\`\`

The \`elem_add_kernel\` function is the
[kernel](/gpu-glossary/device-software/kernel). Each
[thread](/gpu-glossary/device-software/thread) computes one output element. The
global element index \`i\` is computed from the
[thread block](/gpu-glossary/device-software/thread-block) index, the number of
threads in the block, and the thread index inside the block:

\`\`\`python
i = block_x * block_dim_x + thread_x
\`\`\`

The \`elem_add\` function computes the number of thread blocks needed to cover the
output tensor and launches the kernel with a one-dimensional
[thread block grid](/gpu-glossary/device-software/thread-block-grid).

This example is pedagogical, not optimized. Even so, it shows a good basic
access pattern: adjacent threads read adjacent elements of \`a\` and \`b\`, then
write adjacent elements of \`out\`. That is the pattern needed for coalesced
accesses to [global memory](/gpu-glossary/device-software/global-memory); see
[memory coalescing](/gpu-glossary/perf/memory-coalescing).

Layout concerns are one reason why CuTe DSL is useful for high-performance
kernels. Engineering for [performance](/gpu-glossary/perf) is difficult because
kernels must be closely mapped to hardware: which threads handle which data, how
memory is accessed, how work is tiled, and which hardware operations the
generated code should use. CuTe DSL allows programmers to express these mappings
explicitly while reusing much of the same kernel code across a variety of shapes
and
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).

This may be surprising to performance-focused engineers from other domains --
how can a program written in an interpreted language like Python hope to compete
with programs written in compiled languages?

The answer is that CuTe DSL kernels are compiled, Just-In-Time (JIT). Python
source code is converted to an abstract syntax tree (AST), traced with proxy
arguments, and then compiled. Note that only a subset of Python semantics are
supported in JIT-compiled code.

At time of writing, in CUTLASS 4.x, the compilation stack passes through
[Multi-Level Intermediate Representation (MLIR)](https://mlir.llvm.org/) to the
[PTX](/gpu-glossary/device-software/parallel-thread-execution) IR to
device-specific [SASS](/gpu-glossary/device-software/streaming-assembler) before
being executed.

Consider the [FlashAttention-4](https://arxiv.org/abs/2603.05451) kernels. Our
[writeup](https://modal.com/blog/reverse-engineer-flash-attention-4) of the open
source code walks through how it uses pipelined warp specialization,
[Tensor Core](/gpu-glossary/device-hardware/tensor-core) operations, and
[Tensor Memory](/gpu-glossary/device-hardware/tensor-memory) &
[Tensor Memory Accelerator](/gpu-glossary/device-hardware/tensor-memory-accelerator)
operations to achieve state-of-the-art performance directly from CuTe DSL.

For more details on CuTe DSL, see NVIDIA's
[CuTe DSL documentation](https://docs.nvidia.com/cutlass/4.4.2/media/docs/pythonDSL/cute_dsl.html)
and
[CuTe DSL overview blog](https://developer.nvidia.com/blog/achieve-cutlass-c-performance-with-python-apis-using-cute-dsl/).
`,it=`---
title: What is CuTe?
---

CUDA Templates (CuTe) is a header-only
[CUDA C++](/gpu-glossary/host-software/cuda-c) library within
[CUTLASS](/gpu-glossary/host-software/cutlass) for describing and manipulating
tensors of [data](/gpu-glossary/device-software/memory-hierarchy) and
[threads](/gpu-glossary/device-software/thread-hierarchy).

As the name implies, CuTe uses CUDA C++
[templates](https://en.cppreference.com/cpp/language/templates). Templates are
the C++ implementation of
[parametric polymorphism](https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/),
which you may have encountered in the form of
[generics](https://doc.rust-lang.org/rust-by-example/generics.html) in other
languages. Polymorphic functions are written once but can operate on inputs with
different types. CuTe is not to be confused with
[CuTe DSL](/gpu-glossary/host-software/cute-dsl), which exposes CuTe/CUTLASS via
a Domain-Specific Language (DSL) in Python.

At the core of CuTe's type system are \`Layouts\`. \`Layouts\` describe regular
patterns of access to CuTe \`Tensors\`. \`Tensors\` combine a \`Layout\` with a
pointer to [memory](/gpu-glossary/device-software/memory-hierarchy). These
\`Layouts\` are, critically, composable -- they form
[a category](https://arxiv.org/abs/2601.05972) with a
[rich algebra](https://arxiv.org/abs/2603.02298) and so combine both
expressiveness and structure. Note that \`Layout\`s are themselves composed of
\`Shape\` and \`Stride\` tuples used to describe memory extents and how to traverse
them.

CuTe uses the type system to encode key program metadata like memory
organization, strided accesses, and tiling such that the
[compiler](/gpu-glossary/host-software/nvcc) can check many aspects of
correctness and preserve invariants while applying optimizations. This allows
for very high-level metaprogramming of
[kernels](/gpu-glossary/device-software/kernel) without sacrificing performance.
For instance, the same template can be compiled into highly-optimized kernels
across several
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
Because layouts are resolved at compile time, memory accesses carry zero
additional runtime overhead, which might otherwise kill
[performance](/gpu-glossary/perf) for
[memory-bound](/gpu-glossary/perf/memory-bound) workloads.

For additional details, see NVIDIA's
[CuTe documentation](https://docs.nvidia.com/cutlass/4.4.2/media/docs/cpp/cute/index.html).

The CuTe-based matrix transpose kernel below, based on the initial "naive"
implementation from
[this article by Colfax International](https://research.colfax-intl.com/tutorial-matrix-transpose-in-cutlass/),
demonstrates the core features and types of CuTe -- templating, shapes, layouts,
and tensors. You can run it on an H100 via
[this Modal Notebook](https://modal.com/notebooks/modal-labs/examples/nb-owEUD0kdSVeL4KeEX5sjh1).

\`\`\`cpp
// one CuTe trick: transpose a row-major matrix just using Layouts
template <typename T>
__global__ void transpose_kernel(const T* __restrict__ d_S,
                                 T* __restrict__ d_D,
                                 int M, int N)
{
    // define the Shape of tiles worked on by thread blocks
    using b = Int<32>;
    auto block_shape = make_shape(b{}, b{});

    // define the Shape of input/output Tensors
    auto tensor_shape = make_shape(M, N);

    // define the Layout of the input and output Tensors in global memory
    auto gmemLayoutS  = make_layout(tensor_shape, GenRowMajor{}); // input:  row-major
    auto gmemLayoutDT = make_layout(tensor_shape, GenColMajor{}); // output: col-major

    // construct the Tensors
    auto tensor_S  = make_tensor(make_gmem_ptr(d_S), gmemLayoutS);
    auto tensor_DT = make_tensor(make_gmem_ptr(d_D), gmemLayoutDT);

    // define a tile-ing of the Tensors (as a "Tensor of Tensors")
    auto tiled_tensor_S  = tiled_divide(tensor_S,  block_shape);
    auto tiled_tensor_DT = tiled_divide(tensor_DT, block_shape);

    // pull out the tiles this thread block will be working on
    auto tile_S  = tiled_tensor_S (make_coord(_, _), blockIdx.x, blockIdx.y);
    auto tile_DT = tiled_tensor_DT(make_coord(_, _), blockIdx.x, blockIdx.y);

    // create a Layout for threads in the thread block
    auto thr_layout = make_layout(
        make_shape(Int<8>{}, Int<32>{}),
        GenRowMajor{}
    );

    // pull out the tile this thread will work on
    auto thr_tile_S  = local_partition(tile_S,  thr_layout, threadIdx.x);
    auto thr_tile_DT = local_partition(tile_DT, thr_layout, threadIdx.x);

    // define a "Tensor" in register memory
    auto rmem = make_tensor_like<T>(thr_tile_S);

    // copy tile into registers
    copy(thr_tile_S, rmem);
    // copy tile out of registers as though it were column-major
    copy(rmem, thr_tile_DT);
}
\`\`\`
`,at=`---
title: "What is cuTile BASIC?"
---

cuTile BASIC is an implementation of the
[CUDA Tile programming model](/gpu-glossary/device-software/cuda-tile-programming-model)
in the [BASIC programming language](https://modal-cdn.com/BASIC_Oct64.pdf).

BASIC stands for Beginner's All-purpose Symbolic Instruction Code. BASIC is a
programming language designed, in the 1960s, for ease-of-use and interactive
programming. It was popular among early microcomputer programmers like William
Gates III.

cuTile BASIC was released
[as an April Fools' joke](https://developer.nvidia.com/blog/cuda-tile-programming-now-available-for-basic/).
It is a real, if toy, implementation of the programming model and a
demonstration of its generality. You can run the vector-addition cuTile BASIC
kernel below on a B200 GPU using
[this Modal Notebook](https://modal.com/notebooks/modal-labs/examples/nb-151VgRNHYEDuKSfxJRjV5N).
cuTile BASIC was developed, in part, via such Notebooks.

\`\`\`basic
10 REM Vector Add: C = A + B
20 INPUT N, A(), B()
30 DIM A(N), B(N), C(N)
40 TILE A(128), B(128), C(128)
50 LET C(BID) = A(BID) + B(BID)
60 OUTPUT C
70 END
\`\`\`
`,ot=`---
title: What is CUTLASS?
---

CUDA Templates for Linear Algebra Subroutines and Solvers (CUTLASS) is a library
of abstractions for implementing high-performance linear algebra in
[CUDA](/gpu-glossary/device-software/cuda-programming-model)
[kernels](/gpu-glossary/device-software/kernel).

Like [cuBLAS](/gpu-glossary/host-software/cublas), CUTLASS is named in reference
to the
[Basic Linear Algebra Subprograms (BLAS)](https://netlib.org/blas/blast-forum/)
standard for low-level routines for linear algebraic computations. Unlike
cuBLAS, CUTLASS is a toolkit for constructing kernels, rather than a library of
ready-to-call routines. CUTLASS is primarily associated with the third level of
the BLAS hierarchy, general matrix multiplications ("GEMMs").

As the name suggests, CUTLASS includes a collection of
[CUDA C++](/gpu-glossary/host-software/cuda-c) template abstractions.
[Templates](https://en.cppreference.com/cpp/language/templates) are the C++
implementation of
[parametric polymorphism](https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/),
which you may have encountered in the form of
[generics](https://doc.rust-lang.org/rust-by-example/generics.html) in other
languages. Polymorphic functions are written once but can operate on inputs with
different types.

The core of modern CUTLASS is the [CuTe](/gpu-glossary/host-software/cute)
library, which defines \`Layout\` and \`Tensor\` types for composably describing and
manipulating tensors of [data](/gpu-glossary/device-software/memory-hierarchy)
and [threads](/gpu-glossary/device-software/thread-hierarchy). It is not to be
confused with [CuTe DSL](/gpu-glossary/host-software/cute-dsl), which exposes
CuTe/CUTLASS templates via a Domain-Specific Language (DSL) in Python.

Atop CuTe, CUTLASS exposes a header-only CUDA C++ library that operates at three
levels: the whole \`device\`, a single
[\`kernel\`](/gpu-glossary/device-software/kernel), or a \`collective\` of
[threads](/gpu-glossary/device-software/thread) (typically a
[thread block](/gpu-glossary/device-software/thread-block)). At the \`collective\`
layer, matrix-matrix multiplications are typically split into "mainloops" and
"epilogues". Mainloops express the core algorithm, like tiling strategies.
Epilogues describe post-processing steps, like the application of scaling
factors or scalar non-linearities (popular in neural networks).

CUTLASS is very commonly used to write some of the highest-performing kernels,
especially matrix-matrix multiplications on hardware from more recent
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).
These kernels require careful programming of the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) to achieve anything
like peak [performance](/gpu-glossary/perf).

CUTLASS is
[open source and available on GitHub](https://github.com/nvidia/cutlass). The
library also includes many implementations of high-performance open-source
kernels using CUTLASS, which are regularly used as references elsewhere in
open-source kernel development. We can highly recommend the
[popular tutorials by Jay Shah of Colfax International](https://research.colfax-intl.com/),
which explain in detail how the key components of CUTLASS are used to achieve
maximum performance. Note, however, that like most C++ template metaprogramming,
CUTLASS is not for the faint of heart!
`,st=`---
title: What is libcuda.so?
---

The typical name for the binary shared object file that implements the
[CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api) on Linux systems.
It is dynamically linked by CUDA programs. If it is missing, the drivers are
generally improperly installed.
`,ct=`---
title: What is libcudart.so?
---

The typical name for the binary shared object file that implements the
[CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api) on Linux
systems. Deployed CUDA binaries often statically link this file, but libraries
and frameworks built on the CUDA Toolkit, like PyTorch, typically load it
dynamically.
`,lt=`---
title: What is libnvml.so?
---

The typical name for the binary shared object file that implements the features
of [NVML](/gpu-glossary/host-software/nvml) on Linux systems.
`,ut=`---
title: What is NVIDIA Nsight Systems?
---

NVIDIA Nsight Systems is a performance debugging tool for
[CUDA C++](/gpu-glossary/host-software/cuda-c) programs. It combines profiling,
tracing, and expert systems analysis in a GUI.

No one wakes up and says "today I want to write a program that runs on a hard to
use, expensive piece of hardware using a proprietary software stack". Instead,
GPUs are selected when normal computing hardware doesn't perform well enough to
solve a computing problem. So
[almost all GPU programs are performance-sensitive](/gpu-glossary/perf), and the
performance debugging workflows supported by Nsight Systems or other tools built
on top of the
[CUDA Profiling Tools Interface](/gpu-glossary/host-software/cupti) are
mission-critical.

You can find its documentation
[here](https://docs.nvidia.com/nsight-systems/index.html), but
[watching someone use the tool](https://www.youtube.com/watch?v=dUDGO66IadU) is
usually more helpful. For details on how to profile GPU applications on Modal,
see [our documentation](https://modal.com/docs/examples/torch_profiling).
`,dt=`---
title: What is the NVIDIA CUDA Compiler Driver?
abbreviation: nvcc
---

The NVIDIA CUDA Compiler Driver is a toolchain for compiling
[CUDA C/C++](/gpu-glossary/host-software/cuda-c) programs. It outputs binary
executables that conform to the host ABI and include
[PTX](/gpu-glossary/device-software/parallel-thread-execution) and/or
[SASS](/gpu-glossary/device-software/streaming-assembler) to be executed on the
GPU — a so-called "fat binary". These binaries are inspectable with the same
tools used for other binaries, like \`readelf\` on Linux, but can be additionally
manipulated with the specialized
[CUDA Binary Utilities](/gpu-glossary/host-software/cuda-binary-utilities).

The included [PTX](/gpu-glossary/device-software/parallel-thread-execution) code
is versioned by
[Compute Capability](/gpu-glossary/device-software/compute-capability),
configured by passing \`compute_XYz\` values to the \`--gpu-architecture\` or
\`--gpu-code\` options.

The included [SASS](/gpu-glossary/device-software/streaming-assembler) code is
versioned by
[SM architecture version](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
configured by passing \`sm_XYz\` values to the \`--gpu-architecture\` or
\`--gpu-code\` options. Passing \`compute_XYz\` to \`--gpu-code\` will also trigger
the generation of [SASS](/gpu-glossary/device-software/streaming-assembler) code
with the same version as the
[PTX](/gpu-glossary/device-software/parallel-thread-execution).

Compilation of host/CPU code is done using the host system's compiler driver,
e.g. the \`gcc\` compiler driver. Note that compiler drivers are not to be
confused with hardware drivers, like the
[NVIDIA GPU Drivers](/gpu-glossary/host-software/nvidia-gpu-drivers).

The documentation for \`nvcc\` can be found
[here](https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/).
`,ft=`---
title: What are the NVIDIA GPU Drivers?
---

The NVIDIA GPU drivers mediate the interaction between host programs or the host
operating system and the GPU device. The primary interfaces to the GPU drivers
for applications are, in order, the
[CUDA Runtime API](/gpu-glossary/host-software/cuda-runtime-api) and the
[CUDA Driver API](/gpu-glossary/host-software/cuda-driver-api).

![The CUDA Toolkit. The NVIDIA GPU Driver is the only component that communicates directly with the GPU. Adapted from the *Professional CUDA C Programming Guide*.](themed-image://cuda-toolkit.svg)

NVIDIA has released the
[source](https://github.com/NVIDIA/open-gpu-kernel-modules) for their Linux Open
GPU [Kernel Module](/gpu-glossary/host-software/nvidia-ko).
`,pt=`---
title: What is nvidia.ko?
---

\`nvidia.ko\` is a binary
[kernel module](https://wiki.archlinux.org/title/Kernel_module) file at the core
of the [NVIDIA GPU drivers](/gpu-glossary/host-software/nvidia-gpu-drivers) for
Linux.

Like other kernel modules, it executes in privileged mode and communicates
directly with hardware on behalf of the user -- in this case, the GPU.

The Linux Open GPU Kernel Module is
[open source](https://github.com/NVIDIA/open-gpu-kernel-modules).
`,mt=`---
title: What is nvidia-smi?
---

This command line utility is used to query and manage the state of the GPU
exposed by the [NVML](/gpu-glossary/host-software/nvml) management libraries.
Its outputs, a sample of which appears below, are familiar to users of NVIDIA
GPUs to the point of being a
[meme](https://x.com/boborado/status/1752724223934578760).

\`nvidia-smi\` reports the following:

- GPU identity information like the card's model name, a UUID, and the PCI ID
- live utilization metrics for kernel execution time and memory allocation
- live power and thermal information

For details on these metrics, including how to interpret power and thermal
readings, see
[this page on the Modal docs](https://modal.com/docs/guide/gpu-metrics).

\`nvidia-smi\` can also list processes currently using the GPU (\`-q\`, \`--query\`,
\`pmon\`). Common management tasks include setting persistence mode (\`-pm\`),
compute mode (\`-c\`), power limits (\`-pl\`), application/locked clocks (\`-ac\`,
\`-lgc\`, \`-lmc\`), and performing GPU resets (\`-r\`).

Output can be formatted as human-readable text or XML (\`-x\`). While
\`nvidia-smi\`'s text output format is not guaranteed to be stable, the underlying
[NVML C library](/gpu-glossary/host-software/nvml) offers a stable API for tool
development.

The documentation for \`nvidia-smi\` can be found
[here](https://docs.nvidia.com/deploy/nvidia-smi/), and the official Python
bindings can be found [here](http://pypi.python.org/pypi/nvidia-ml-py/).

\`\`\`
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.95.05              Driver Version: 580.95.05      CUDA Version: 13.0     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA B200                    On  |   00000000:51:00.0 Off |                    0 |
| N/A   27C    P0            136W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   1  NVIDIA B200                    On  |   00000000:52:00.0 Off |                    0 |
| N/A   25C    P0            140W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   2  NVIDIA B200                    On  |   00000000:62:00.0 Off |                    0 |
| N/A   27C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   3  NVIDIA B200                    On  |   00000000:63:00.0 Off |                    0 |
| N/A   26C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   4  NVIDIA B200                    On  |   00000000:75:00.0 Off |                    0 |
| N/A   27C    P0            139W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   5  NVIDIA B200                    On  |   00000000:76:00.0 Off |                    0 |
| N/A   25C    P0            140W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   6  NVIDIA B200                    On  |   00000000:86:00.0 Off |                    0 |
| N/A   27C    P0            142W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
|   7  NVIDIA B200                    On  |   00000000:87:00.0 Off |                    0 |
| N/A   26C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
\`\`\`
`,ht=`---
title: What is the NVIDIA Management Library?
abbreviation: NVML
---

The NVIDIA Management Library (NVML) is used for monitoring and managing the
state of NVIDIA GPUs. It exposes, for example, the power draw and temperature of
the GPU, the allocated memory, and the device's power limit and power limiting
state. For details on these metrics, including how to interpret power and
thermal readings, see
[this page on the Modal docs](https://modal.com/docs/guide/gpu-metrics).

The functions of NVML are frequently accessed via the
[nvidia-smi](/gpu-glossary/host-software/nvidia-smi) command line utility, but
are also accessible to programs via wrappers, like
[pynvml in Python](https://pypi.org/project/pynvml/) and
[nvml_wrapper in Rust](https://docs.rs/nvml-wrapper/latest/nvml_wrapper/).
`,gt=`---
title: What is the NVIDIA Runtime Compiler?
abbreviation: nvrtc
---

The NVIDIA Runtime Compiler (\`nvrtc\`) is a runtime compilation library for CUDA
C. It compiles [CUDA C++](/gpu-glossary/host-software/cuda-c) to
[PTX](/gpu-glossary/device-software/parallel-thread-execution) without requiring
a separate launch of the
[NVIDIA CUDA Compiler Driver](/gpu-glossary/host-software/nvcc) (\`nvcc\`) in
another process. It is used by some libraries or frameworks to, for example, map
generated C/C++ code to
[PTX](/gpu-glossary/device-software/parallel-thread-execution) code that can run
on a GPU.

Note that this [PTX](/gpu-glossary/device-software/parallel-thread-execution) is
then further JIT-compiled from the
[PTX](/gpu-glossary/device-software/parallel-thread-execution) IR to the
[SASS assembly](/gpu-glossary/device-software/streaming-assembler). This is done
by the [NVIDIA GPU drivers](/gpu-glossary/host-software/nvidia-gpu-drivers) and
is distinct from the compilation done by NVRTC. CUDA binaries that contain
[PTX](/gpu-glossary/device-software/parallel-thread-execution), as required for
forward compatibility, also pass through this compilation step.

NVRTC is closed source. You can find its documentation
[here](https://docs.nvidia.com/cuda/nvrtc/index.html).
`,_t=`---
title: Host Software
---

These terms and technologies are used on the CPU (the "host" in NVIDIA's lingo)
when running GPU programs.
`,vt=`---
title: What is an active cycle?
---

An active cycle is a clock cycle in which a
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)
has at least one [active warp](/gpu-glossary/perf/warp-execution-state)
resident. The [warp](/gpu-glossary/device-software/warp) may be
[eligible](/gpu-glossary/perf/warp-execution-state) or
[stalled](/gpu-glossary/perf/warp-execution-state).

![All cycles depicted in this diagram are active cycles. Diagram inspired by the [*CUDA Techniques to Maximize Compute and Instruction Throughput*](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/) talk at GTC 2025.](themed-image://cycles.svg)
`,yt=`---
title: What is arithmetic bandwidth?
---

Arithmetic bandwidth is the [peak rate](/gpu-glossary/perf/peak-rate) at which
arithmetic work can be performed by a system.

It represents the theoretical maximum of the achievable throughput for
arithmetic operations per second. It determines the height of the "compute roof"
in a [roofline model](/gpu-glossary/perf/roofline-model) of the hardware.

There are many arithmetic bandwidths in a complete system — one for each
grouping of hardware units that provide bandwidth for executing arithmetic
operations.

On many GPUs, the most important arithmetic bandwidth is the bandwidth of the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) for floating point
arithmetic. GPUs generally provide more bandwidth for floating point operations
than for integer operations, and the key to the
[Compute Unified Device Architecture (CUDA)](/gpu-glossary/device-hardware/cuda-device-architecture)
is that the [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) and supporting
systems provide a unified computing interface for GPU applications (unlike prior
GPU architectures).

But in recent GPUs, the unity of the architecture has been lessened by the
introduction of [Tensor Cores](/gpu-glossary/device-hardware/tensor-core), which
perform only matrix multiplication operations but do so at a much higher
arithmetic bandwidth than the
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) -- a ratio of 100:1
between [Tensor Core](/gpu-glossary/device-hardware/tensor-core) and
[CUDA Core](/gpu-glossary/device-hardware/cuda-core) bandwidth is a good rule of
thumb. That makes the [Tensor Core](/gpu-glossary/device-hardware/tensor-core)
arithmetic bandwidth the most important for
[kernels](/gpu-glossary/device-software/kernel) that wish to maximize
performance.

Contemporary GPUs have [Tensor Core](/gpu-glossary/device-hardware/tensor-core)
arithmetic bandwidths measured in petaFLOPS — quadrillions of floating point
operations per second. For example,
[B200 GPUs](https://modal.com/blog/introducing-b200-h200) have a bandwidth of
nine PFLOPS when running 4-bit floating point matrix multiplications.

Representative bandwidth numbers for NVIDIA data center GPUs between the Ampere
and Blackwell
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
are listed in the table below.

| **System (Compute / Memory)**                                                                                                                               | **Arithmetic Bandwidth (TFLOPs/s)** | **[Memory Bandwidth](/gpu-glossary/perf/memory-bandwidth) (TB/s)** | **[Ridge Point](/gpu-glossary/perf/roofline-model) (FLOPs/byte)** |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------: | -----------------------------------------------------------------: | ----------------------------------------------------------------: |
| [A100 80GB SXM BF16 TC / HBM2e](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf) |                                 312 |                                                                  2 |                                                               156 |
| [H100 SXM BF16 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                            |                                 989 |                                                               3.35 |                                                               295 |
| [B200 BF16 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                   |                                2250 |                                                                  8 |                                                               281 |
| [H100 SXM FP8 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                             |                                1979 |                                                               3.35 |                                                               592 |
| [B200 FP8 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                4500 |                                                                  8 |                                                               562 |
| [B200 FP4 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                9000 |                                                                  8 |                                                              1125 |
`,bt=`---
title: What is arithmetic intensity?
---

Arithmetic intensity is the ratio of arithmetic operations to memory operations
in a [kernel](/gpu-glossary/device-software/kernel).

![In the [roofline model](/gpu-glossary/perf/roofline-model), operational/arithmetic intensity is plotted on the horizontal axis. Diagram adapted from [Williams, Waterman, and Patterson (2008)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf).](themed-image://roofline-model.svg)

A high arithmetic intensity indicates that a
[kernel](/gpu-glossary/device-software/kernel) performs many arithmetic
operations per byte loaded. Due to the high ratio between
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) and
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) in modern GPUs, the most
efficient kernels have high arithmetic intensity. That means that when elevating
a memory [bottleneck](/gpu-glossary/perf/performance-bottleneck), we can often
shift work from the memory subsystem to the compute subsystem, saving on
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) but adding to the load
on the arithmetic units.

For example, compressing data in
[global memory](/gpu-glossary/device-software/global-memory) reduces memory
traffic since fewer bytes need to be transferred, but the compute units must
perform additional decompression operations. If we were previously
[bottlenecked](/gpu-glossary/perf/performance-bottleneck) by memory, this can
improve performance. It also increases the ratio of FLOPs to bytes moved,
increasing the arithmetic intensity.

As another example, the
[backpropagation algorithm](https://www.nature.com/articles/323533a0) creates
long-lived intermediates (activation values) that generally must be stored in
[global memory](/gpu-glossary/device-software/global-memory) during a forward
pass and then retrieved during a backwards pass. In some cases, it is faster to
store only a fraction of these intermediates and then recompute the remainder (a
technique known as [gradient checkpointing](https://arxiv.org/abs/1604.06174)),
which increases arithmetic intensity.

Because different algorithms inherently have different operational and memory
complexities, they inherently scale differently in arithmetic intensity. An
algorithm with O(1) operational complexity and O(N) memory complexity has O(1/N)
arithmetic intensity scaling, while one with O(N) operational complexity and
O(1) memory complexity has O(N) arithmetic intensity scaling.

| **Kernel**                |    **FLOPs** | **Bytes Moved** | **Arithmetic Intensity** | **Arithmetic Intensity Scaling** |
| :------------------------ | -----------: | --------------: | -----------------------: | -------------------------------: |
| SAXPY y = ax + y          |           2N |             12N |                      1/6 |                             O(1) |
| Single-Precision Real FFT | 5/2 N log(N) |             16N |              5/32 log(N) |                        O(log(N)) |
| SGEMM C = A @ B + C       |         2N^3 |           16N^2 |                      N/8 |                             O(N) |

Notably, matrix multiplication scales linearly, i.e. is O(N), in arithmetic
intensity — it is O(N^3) in operational complexity and O(N^2) in memory
complexity. This favorable scaling makes it easy to map applications of matrix
multiplication onto arithmetic-intensity-oriented hardware (see discussion in
the [article on roofline modeling](/gpu-glossary/perf/roofline-model)). It is a
key secret to the success of machine learning algorithms based on matrix
multiplication, like neural networks, in the past few decades.

For a discussion of arithmetic intensity as applied to Bahdanau attention, used
in Transformer neural networks, see
[this paper](https://arxiv.org/abs/2505.21487) by Zadouri, Strauss, and Dao.

The minimum arithmetic intensity required for work to be
[compute-bound](/gpu-glossary/perf/compute-bound) (that is, to be past the ridge
point of the [roofline model](/gpu-glossary/perf/roofline-model)) is a fixed
parameter of a system and so only needs to be derived once. Ridge point
arithmetic intensities for recent NVIDIA data center GPUs appear in the table
below. Notice that the highest ridge point has increased going from the Ampere
to Hopper to Blackwell
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture).

| **System (Compute / Memory)**                                                                                                                               | **[Arithmetic Bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) (TFLOPs/s)** | **[Memory Bandwidth](/gpu-glossary/perf/memory-bandwidth) (TB/s)** | **[Ridge Point](/gpu-glossary/perf/roofline-model) (FLOPs/byte)** |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------- | -----------------------------------------------------------------------------: | -----------------------------------------------------------------: | ----------------------------------------------------------------: |
| [A100 80GB SXM BF16 TC / HBM2e](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf) |                                                                            312 |                                                                  2 |                                                               156 |
| [H100 SXM BF16 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                            |                                                                            989 |                                                               3.35 |                                                               295 |
| [B200 BF16 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                   |                                                                           2250 |                                                                  8 |                                                               281 |
| [H100 SXM FP8 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                             |                                                                           1979 |                                                               3.35 |                                                               592 |
| [B200 FP8 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                                                           4500 |                                                                  8 |                                                               562 |
| [B200 FP4 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                                                           9000 |                                                                  8 |                                                              1125 |
`,xt=`---
title: What is a bank conflict?
---

When multiple [threads](/gpu-glossary/device-software/thread) in a
[warp](/gpu-glossary/device-software/warp) simultaneously request memory within
the same bank in [shared memory](/gpu-glossary/device-software/shared-memory)
but across distinct addresses, we say there is a bank conflict.

![When [threads](/gpu-glossary/device-software/thread) access distinct [shared memory](/gpu-glossary/device-software/shared-memory) banks, accesses are serviced in parallel (left). When they all access the same bank, but at different addresses, accesses are serialized (right).](themed-image://bank-conflict.svg)

When bank conflicts occur, the accesses by the distinct
[threads](/gpu-glossary/device-software/thread) are serialized. This reduces
memory throughput substantially, that is by an integral factor, preventing the
saturation of [memory bandwidth](/gpu-glossary/perf/memory-bandwidth).

Like other SRAM cache memories, the
[shared memory](/gpu-glossary/device-software/shared-memory) in a
[Streaming Multiprocessor](/gpu-glossary/device-hardware/streaming-multiprocessor)
is organized into groups called "banks". These banks can be accessed
simultaneously, which increases the bandwidth.

In GPUs, there are 32 banks, each bank is 4 bytes wide, and consecutive words of
32 bits (not 64 bits; GPUs were designed with 32-bit floats and integers in
mind) map to consecutive banks.

\`\`\`
Address:  0x00  0x04  0x08  0x0C  0x10  0x14  0x18  0x1C  ...  0x7C
Bank:       0     1     2     3     4     5     6     7   ...    31

Address:  0x80  0x84  0x88  0x8C  0x90  0x94  0x98  0x9C  ...  0xFC

Bank:       0     1     2     3     4     5     6     7   ...    31
\`\`\`

Addresses that differ by 32 × 4 = 128 bytes map to the same bank.
[Shared memories](/gpu-glossary/device-software/shared-memory) are roughly
kilobyte scale, and so multiple addresses map onto the same bank.

If we access sequential elements of an array in shared memory, each
[thread](/gpu-glossary/device-software/thread) in our
[warp](/gpu-glossary/device-software/warp) will hit a different bank:

\`\`\`cpp
__shared__ float data[1024];  // array in shared memory

// all 32 threads access consecutive elements of data
int tid = threadIdx.x;
float value = data[tid];  // address LSBs: 0x00, 0x04, 0x08, ...
\`\`\`

All 32 accesses complete in one memory transaction because each
[thread](/gpu-glossary/device-software/thread) hits a different bank. This is
depicted on the left in the figure above.

But say we wanted our [threads](/gpu-glossary/device-software/thread) to access
a column in a row-major
[shared memory](/gpu-glossary/device-software/shared-memory) array with 32
elements per row, and so we wrote:

\`\`\`cpp
float value = data[tid * 32];  // address LSBs: 0x000, 0x080, 0x100 ...
// recall: floats are 4 bytes wide
\`\`\`

As depicted in the right side of the diagram above, all accesses hit the same
bank, Bank 0, and so must be serialized, resulting in a 32x increase in latency,
rising from on the order of ten cycles to on the order of hundreds. We could
solve this bank conflict by transposing our
[shared memory](/gpu-glossary/device-software/shared-memory) array. For more
techniques to resolve bank conflicts, see the
[_Introduction to CUDA Programming and Performance Optimization_ talk from GTC 2024](https://www.nvidia.com/en-us/on-demand/session/gtc24-s62191/).

Note that if [threads](/gpu-glossary/device-software/thread) access the same
address in the same bank, i.e. the exact same data, conflict need not occur, as
the data can be multi-/broad-cast.
`,St=`---
title: What is branch efficiency?
---

Branch efficiency measures how often all
[threads](/gpu-glossary/device-software/thread) in a
[warp](/gpu-glossary/device-software/warp) take the same execution path when
encountering conditional statements.

Branch efficiency is calculated as the ratio of uniform control flow decisions
to total branch instructions executed. Control flow uniformity is measured at
the level of [warps](/gpu-glossary/device-software/warp), and so branch
efficiency indicates the absence of
[warp divergence](/gpu-glossary/perf/warp-divergence).

Not all conditionals reduce branch efficiency. The common "bounds-check"
fragment that appears in most [kernels](https://godbolt.org/z/d1PsYYPnW)

\`\`\`cpp
int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n)
\`\`\`

will generally have very high branch efficiency, since most
[warps](/gpu-glossary/device-software/warp) will be composed of
[threads](/gpu-glossary/device-software/thread) that all have the same value for
the conditional, save for a single [warp](/gpu-glossary/device-software/warp)
whose [threads](/gpu-glossary/device-software/thread)' indices are above and
below \`n\`.

While CPUs also care about the uniformity of branching behavior, they tend to
care primarily about uniformity of branch behavior over time, as part of
hardware-controlled branch prediction and speculative execution. That is, as
circuits within the CPU accumulate data about a branch as it is encountered
multiple times during program execution, the performance should improve.

GPUs instead care about uniformity in space. That is, uniformity is measured
within [warps](/gpu-glossary/device-software/warp), whose
[threads](/gpu-glossary/device-software/thread) execute concurrently in time but
are mapped onto distinct data, and performance improves if those
[threads](/gpu-glossary/device-software/thread) branch uniformly.
`,Ct=`---
title: What does it mean to be compute-bound?
---

[Kernels](/gpu-glossary/device-software/kernel) that are compute-bound are
limited by the [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth)
of the [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) or
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core).

![In the [roofline diagram](/gpu-glossary/perf/roofline-model) above, [kernels](/gpu-glossary/device-software/kernel) underneath the blue line are compute-bound. Diagram adapted from [Williams, Waterman, and Patterson (2008)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf).](themed-image://roofline-model.svg)

Compute-bound kernels are characterized by high
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) (many arithmetic
operations per byte of memory loaded or stored).
[Utilization of arithmetic pipes](/gpu-glossary/perf/pipe-utilization) is the
limiting factor for a compute-bound kernel.

Technically, compute-boundedness is only defined for a single
[kernel](/gpu-glossary/device-software/kernel), as part of the
[roofline model](/gpu-glossary/perf/roofline-model), but with a bit of squinting
it can be generalized to cover the multiple
[kernels](/gpu-glossary/device-software/kernel) that make up a typical workload.

Large diffusion model inference workloads are generally compute-bound.
Contemporary large language model inference workloads are often compute-bound
during batch prefill/prompt processing, when each weight can be loaded into
[shared memory](/gpu-glossary/device-software/shared-memory) once and then used
across many tokens.

Let's do a simple estimation, inspired by
[kipperrii](https://twitter.com/kipperrii)'s
[Transformer inference arithmetic](https://kipp.ly/transformer-inference-arithmetic)
framework, of the minimum latency between tokens (inter-token latency or time
per output token) for compute-bound Transformer language model inference. Assume
the model has 500B parameters, stored in 16-bit precision, for a total of 1 TB.
This model will perform roughly one trillion floating point operations (one
multiply and one accumulate per parameter) per batch element. Run on a GPU with
one petaFLOP/s of
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) for 16-bit
matrix math, the minimum latency between tokens, assuming compute-boundedness,
is one millisecond per batch element.

Note that for this GPU to be compute-bound at batch size one, it would need a
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) of 1 PB/s (so that it
can load all 1 TB of weights in one ms). Contemporary
[memory bandwidths](/gpu-glossary/perf/memory-bandwidth) are in the TB/s range,
and so batches of hundreds of inputs are required to provide sufficient
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) for execution to
be compute-bound.

For more on LLM inference, see our
[LLM Engineer's Almanac](https://modal.com/llm-almanac/summary).
`,wt=`---
title: What is issue efficiency?
---

Issue efficiency measures how effectively the
[warp scheduler](/gpu-glossary/device-hardware/warp-scheduler) keeps execution
pipes busy by issuing instructions from
[eligible warps](/gpu-glossary/perf/warp-execution-state).

![Of the four clock cycles in this diagram, instructions were issued on three, for an issue efficiency of 75%. Diagram inspired by the [*CUDA Techniques to Maximize Compute and Instruction Throughput*](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/) talk at GTC 2025.](themed-image://cycles.svg)

An issue efficiency of 100% means every
[scheduler](/gpu-glossary/device-hardware/warp-scheduler) issued an instruction
on every cycle, indicating at least one
[eligible warp](/gpu-glossary/perf/warp-execution-state) on each cycle. Values
below 100 % signal that, during some cycles, all
[active warps](/gpu-glossary/perf/warp-execution-state) were
[stalled](/gpu-glossary/perf/warp-execution-state) - waiting on data, resources,
or dependencies - so the
[scheduler](/gpu-glossary/device-hardware/warp-scheduler) sat idle and overall
instruction throughput fell.
`,Tt=`---
title: What is latency hiding?
---

Latency hiding is a strategy to mask long-latency operations by
[running many of them concurrently](/gpu-glossary/perf/littles-law).

Performant GPU programs hide latency by interleaving the execution of many
[threads](/gpu-glossary/device-software/thread). This allows programs to
maintain high throughput despite long instruction latencies. When one
[warp stalls](/gpu-glossary/perf/warp-execution-state) on a slow memory
operation, the GPU immediately switches to execute instructions from another
[eligible warp](/gpu-glossary/perf/warp-execution-state).

This keeps all execution units busy concurrently. While one
[warp](/gpu-glossary/device-software/warp) uses
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) for matrix
multiplication, another might execute arithmetic on
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) (say,
[quantizing or dequantizing matrix multiplicands](https://arxiv.org/abs/2408.11743)),
and a third could be fetching data through the
[load/store units](/gpu-glossary/device-hardware/load-store-unit).

Concretely, consider the following simple instruction sequence in
[Streaming Assembler](/gpu-glossary/device-software/streaming-assembler).

\`\`\`nasm
LDG.E.SYS R1, [R0]        // memory load, 400 cycles
IMUL R2, R1, 0xBEEF       // integer multiply, 6 cycles
IADD R4, R2, 0xAFFE       // integer add, 4 cycles
IMUL R6, R4, 0x1337       // integer multiply, 6 cycles
\`\`\`

Executed sequentially, this would take 416 cycles to complete. We can hide this
latency by operating concurrently. If we assume we can issue one instruction
every cycle, then, by [Little's Law](/gpu-glossary/perf/littles-law), if we run
416 concurrent [threads](/gpu-glossary/device-software/thread), we can still
finish the sequence once per cycle (on average), hiding the latency of memory
from consumers of the data in \`R6\`.

Note that [threads](/gpu-glossary/device-software/thread) are not the unit of
instruction issuance, [warps](/gpu-glossary/device-software/warp) are. Each
[warp](/gpu-glossary/device-software/warp) contains 32
[threads](/gpu-glossary/device-software/thread), and so our fragment requires
416 ÷ 32 = 13 [warps](/gpu-glossary/device-software/warp). When successfully
hiding latency, the GPU's scheduling system maintains this many
[warps](/gpu-glossary/device-software/warp) in flight, switching between them
whenever one stalls, ensuring the execution units never idle while waiting for
slow operations to complete.

For a deep dive into latency hiding on
pre-[Tensor Core](/gpu-glossary/device-hardware/tensor-core) GPUs, see
[Vasily Volkov's PhD thesis](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf).
`,Et=`---
title: What is Little's Law?
---

Little's Law establishes the amount of concurrency required to fully
[hide latency](/gpu-glossary/perf/latency-hiding) with throughput.

\`\`\`
concurrency (ops) = latency (s) * throughput (ops/s)
\`\`\`

Little's Law is described as "the most important of the fundamental laws" of
analysis in
[the classic quantitative systems textbook by Lazowska and others](https://homes.cs.washington.edu/~lazowska/qsp/Images/Chap_03.pdf).

Little's Law determines how many instructions must be "in flight" for GPUs to
[hide latency](/gpu-glossary/perf/latency-hiding) through
[warp](/gpu-glossary/device-software/warp) switching by
[warp schedulers](/gpu-glossary/device-hardware/warp-scheduler) (aka
fine-grained thread-level parallelism, like
[simultaneous multi-threading](https://en.wikipedia.org/wiki/Simultaneous_multithreading)
in CPUs).

If a GPU has a peak throughput of 1 instruction per cycle and a memory access
latency of 400 cycles, then 400 concurrent memory operations are needed across
all [active warps](/gpu-glossary/perf/warp-execution-state) in a program. If the
throughput goes up to 10 instructions per cycle, then the program needs 4000
concurrent memory operations to properly take advantage of the increase. For
more detail, see the article on
[latency hiding](/gpu-glossary/perf/latency-hiding).

For a non-trivial application of Little's Law, consider the following
observation, from Section 4.3 of
[Vasily Volkov's PhD thesis](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf)
on [latency hiding](/gpu-glossary/perf/latency-hiding): the number of warps
required to hide pure memory access latency is not much higher than that
required to hide pure arithmetic latency (30 vs 24, in his experiment).
Intuitively, the longer latency of memory accesses would seem to require more
concurrency. But the concurrency is determined not just by latency but also by
throughput. And because [memory bandwidth](/gpu-glossary/perf/memory-bandwidth)
is so much lower than
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth), the required
concurrency turns out to be roughly the same — a useful form of balance for a
[latency hiding](/gpu-glossary/perf/latency-hiding)-oriented system that will
mix arithmetic and memory operations.
`,Dt=`---
title: What is memory bandwidth?
---

Memory bandwidth is the maximum rate at which data can be transferred between
different levels of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy).

It represents the theoretical maximum achievable throughput for moving data in
bytes per second. It determines the slope of the "memory roof" in a
[roofline model](/gpu-glossary/perf/roofline-model) of the hardware.

There are many memory bandwidths in a complete system — one between each level
of the [memory hierarchy](/gpu-glossary/device-software/memory-hierarchy).

The most important bandwidth is that between the
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram) and the
[register files](/gpu-glossary/device-hardware/register-file) of the
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor),
because the [working sets](https://en.wikipedia.org/wiki/Working_set_size) of
most [kernels](/gpu-glossary/device-software/kernel) only fit in
[GPU RAM](/gpu-glossary/device-software/memory-hierarchy), not anywhere higher
up in the [memory hierarchy](/gpu-glossary/device-software/memory-hierarchy). It
is for this reason that that bandwidth is the primary one used in
[roofline modeling](/gpu-glossary/perf/roofline-model) of GPU
[kernel](/gpu-glossary/device-software/kernel) performance.

Contemporary GPUs have memory bandwidths measured in terabytes per second. For
example, [B200 GPUs](https://modal.com/blog/introducing-b200-h200) have a
(bidirectional) memory bandwidth of 8 TB/sec to their HBM3e memory. This is much
lower than the [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth)
of the [Tensor Cores](/gpu-glossary/device-hardware/tensor-core) in these GPUs,
leading to increased [ridge point](/gpu-glossary/perf/roofline-model)
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity).

Representative bandwidth numbers for NVIDIA data center GPUs between the Ampere
and Blackwell
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
are listed in the table below.

| **System (Compute / Memory)**                                                                                                                               | **[Arithmetic Bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) (TFLOPs/s)** | **Memory Bandwidth (TB/s)** | **[Ridge Point](/gpu-glossary/perf/roofline-model) (FLOPs/byte)** |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------- | -----------------------------------------------------------------------------: | --------------------------: | ----------------------------------------------------------------: |
| [A100 80GB SXM BF16 TC / HBM2e](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf) |                                                                            312 |                           2 |                                                               156 |
| [H100 SXM BF16 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                            |                                                                            989 |                        3.35 |                                                               295 |
| [B200 BF16 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                   |                                                                           2250 |                           8 |                                                               281 |
| [H100 SXM FP8 TC / HBM3](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306)                                                             |                                                                           1979 |                        3.35 |                                                               592 |
| [B200 FP8 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                                                           4500 |                           8 |                                                               562 |
| [B200 FP4 TC / HBM3e](https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet)                                                                    |                                                                           9000 |                           8 |                                                              1125 |
`,Ot=`---
title: What does it mean to be memory-bound?
---

[Kernels](/gpu-glossary/device-software/kernel) that are memory-bound are
limited by the [memory bandwidth](/gpu-glossary/perf/memory-bandwidth) of the
GPU.

![Roofline diagrams, like the one above, help identify whether a program's performance is bottlenecked by compute power, memory bandwidth, or something else. Diagram adapted from [Williams, Waterman, and Patterson (2008)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf).](themed-image://roofline-model.svg)

Specifically, they are limited by
[the bandwidth](/gpu-glossary/perf/memory-bandwidth) between the
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram) and the
[local cache](/gpu-glossary/device-hardware/l1-data-cache) of the
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor),
because the problems of interest for GPU performance generally have
[working set sizes](https://en.wikipedia.org/wiki/Working_set_size) much larger
than any higher level of the
[memory hierarchy](/gpu-glossary/device-software/memory-hierarchy).

Memory-bound kernels have a lower
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) (fewer
operations per byte moved), relative to the ridge point of their
[roofline model](/gpu-glossary/perf/roofline-model).

Technically, memory-boundedness is only defined for a single
[kernel](/gpu-glossary/device-software/kernel), as part of the
[roofline model](/gpu-glossary/perf/roofline-model), but with a bit of squinting
it can be generalized to cover the multiple
[kernels](/gpu-glossary/device-software/kernel) that make up a typical workload.

Contemporary large language model inference workloads are often memory-bound
during the decode/output generation stage, when the weights must be loaded once
in each forward pass. That happens once per output token, unless multi-token
prediction or speculative decoding are used, which makes it easy to calculate
the minimum latency between tokens (intertoken latency or time per output token)
for memory-bound Transformer large language model inference.

Assume the model has 500B parameters, stored in 16-bit precision, for a total of
1 TB. If we run inference on a single GPU with a
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) of 10 TB/s, we can load
the weights once every 100 ms, and that puts a lower bound on our intertoken
latency. By batching multiple inputs together, we can linearly increase the
number of floating point operations done per parameter loaded (the
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity)), in principle
up to the point of [compute-boundedness](/gpu-glossary/perf/compute-bound),
without incurring any additional latency, which implies that the throughput
improves linearly in the batch size.

For more on LLM inference, see our
[LLM Engineer's Almanac](https://modal.com/llm-almanac/summary).
`,kt=`---
title: What is Memory Coalescing?
---

Memory coalescing is a hardware technique to improve the utilization of
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) by servicing multiple
_logical_ memory reads in a single _physical_ memory access.

Memory coalescing occurs during accesses of
[global memory](/gpu-glossary/device-software/global-memory). For efficient
access of [shared memory](/gpu-glossary/device-software/shared-memory), see the
article on [bank conflict](/gpu-glossary/perf/bank-conflict).

In [CUDA](/gpu-glossary/device-hardware/cuda-device-architecture) GPUs,
[global memory](/gpu-glossary/device-software/global-memory) is backed by the
[GPU RAM](/gpu-glossary/device-hardware/gpu-ram), built with Dynamic Random
Access Memory (DRAM) technologies like GDDR or HBM. These technologies have high
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) but long access latency
(even compared to the peer technology used in CPU RAM, DDR5). DRAM access
latency is limited by the speed at which the small capacitors can charge up
their access lines, which is fundamentally limited by thermal, power, and size
constraints. Due to this high latency, if all logical memory accesses are
serviced as separate physical accesses, the GPU's
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) will not be fully
utilized.

Memory coalescing takes advantage of the internals of DRAM technology to enable
full bandwidth utilization for certain access patterns. Each time a DRAM address
is accessed, multiple consecutive addresses are fetched together in parallel in
a single clock. For a bit more detail, see Section 6.1 of
[the 4th edition of Programming Massively Parallel Processors](https://www.amazon.com/dp/0323912311);
for comprehensive detail, see Ulrich Drepper's excellent article
[_What Every Programmer Should Know About Memory_](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf).
The access and transfer of these consecutive memory locations is referred to as
a _DRAM burst_. If multiple concurrent logical accesses are serviced by a single
physical burst, the access is said to be _coalesced_. Note that a physical
access is part of a memory transaction, terminology you may see elsewhere in
descriptions of memory coalescing.

On CPUs, a similar mapping of bursts onto cache lines improves access
efficiency. As is common in GPU programming, what is automatic cache behavior in
CPUs is here programmer-managed.

That's not as hard as it could be, because DRAM bursts align elegantly with the
single-instruction, multiple thread (SIMT) execution model of
[CUDA PTX](/gpu-glossary/device-software/parallel-thread-execution). That is, in
normal execution all [threads](/gpu-glossary/device-software/thread) in a
[warp](/gpu-glossary/device-software/warp) execute the same instruction at the
same time. That makes it easy for a
[CUDA](/gpu-glossary/device-software/cuda-programming-model) programmer to write
programs with coalesced access and simple for the memory management hardware to
detect accesses that can be coalesced. Typically, a single burst can service 128
bytes – not coincidentally, enough for each of the 32
[threads](/gpu-glossary/device-software/thread) in a
[warp](/gpu-glossary/device-software/warp) to load one 32 bit float.

To demonstrate the performance impact of memory coalescing, let's consider the
following [kernel](/gpu-glossary/device-software/kernel), which reads values
from an array with a variable \`stride\`, or spacing between accessed elements.
With increasing stride, the number of DRAM bursts required to service the read
issued by each [warp](/gpu-glossary/device-software/warp) will increase, leading
to more physical accesses per logical access and so to reduced memory
throughput.

\`\`\`cpp
__global__ void strided_read_kernel(const float* __restrict__ in,
                                    float* __restrict__ out,
                                    size_t N, int stride)
{
    const size_t t  = blockIdx.x * blockDim.x + threadIdx.x;
    const size_t T  = gridDim.x * (size_t)blockDim.x;

    float acc = 0.f;

    for (size_t j = (size_t)t * (size_t)stride; j < N; j += (size_t)T * (size_t)stride) {
        // across a warp, addresses differ by (stride * sizeof(float))
        float v = in[j]; // perfectly coalesced for stride == 1
        acc = acc * 1.000000119f + v;  // force compiler to keep the load
    }

    // do one write per thread (negligible vs reads)
    if (t < N) out[t] = acc;
}
\`\`\`

When we run this kernel through a micro-benchmark on Godbolt (which you can
reproduce [here](https://godbolt.org/z/KbWhEWjcb)), we observe the expected
relationship between stride and throughput:

\`\`\`
# Device: Tesla T4 (SM 75)
# N = 67108864 floats (256.0 MB), iters = 10
stride        GB/s
    1       206.0
    2       130.5
    4        68.8
    8        33.8
   16        16.8
   32        15.2
   64        13.6
  128        11.2
\`\`\`

That is, adding a stride of two cuts the throughput in half, as the number of
DRAM bursts required to service each
[warp's](/gpu-glossary/device-software/warp) request doubles. Doubling the
stride to four again cuts throughput in half once more. The pattern changes once
we hit a 16x reduction in throughput at a stride of 16. Performance degrades
differently from there, presumably due to increasing visibility of other memory
subsystem components and their degraded performance from reduced locality (e.g.
on-device TLB misses).

For more best practices for global memory access, see the post
[_How to Access Global Memory Efficiently in CUDA C/C++ Kernels_](https://developer.nvidia.com/blog/how-access-global-memory-efficiently-cuda-c-kernels/)
on the NVIDIA Developers blog.
`,At=`---
title: What is occupancy?
---

Occupancy is the ratio of the
[active warps](/gpu-glossary/perf/warp-execution-state) to the maximum number of
[active warps](/gpu-glossary/perf/warp-execution-state) on a device.

![There are four warp slots per cycle on each of four clock cycles and so there are 16=4*4 total warp slots, and there are active warps in 15 of them, for an occupancy of ~94%. Diagram inspired by the [*CUDA Techniques to Maximize Compute and Instruction Throughput*](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/) talk at GTC 2025.](themed-image://cycles.svg)

There are two types of occupancy measurements:

- _Theoretical Occupancy_ represents the upper limit for occupancy due to the
  kernel launch configuration and device capabilities.
- _Achieved Occupancy_ measures the actual occupancy during
  [kernel](/gpu-glossary/device-software/kernel) execution, aka on
  [active cycles](/gpu-glossary/perf/active-cycle).

As part of the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model),
all the [threads](/gpu-glossary/device-software/thread) in a
[thread block](/gpu-glossary/device-software/thread-block) are scheduled onto
the same
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
Each [SM](/gpu-glossary/device-hardware/streaming-multiprocessor) has resources
(like space in [shared memory](/gpu-glossary/device-software/shared-memory))
that must be partitioned across
[thread blocks](/gpu-glossary/device-software/thread-block) and so limit the
number of [thread blocks](/gpu-glossary/device-software/thread-block) that can
be scheduled on the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor).

Let's work through an example. Consider an NVIDIA H100 GPU, which has these
specifications:

\`\`\`
Maximum warps/SM: 64
Maximum blocks/SM: 32
(32 bit) Registers: 65536
Shared memory (smem): 228 KB
\`\`\`

For a [kernel](/gpu-glossary/device-software/kernel) using 32
[threads](/gpu-glossary/device-software/thread) per
[thread block](/gpu-glossary/device-software/thread-block), 8
[registers](/gpu-glossary/device-software/registers) per
[thread](/gpu-glossary/device-software/thread), and 12 KB
[shared memory](/gpu-glossary/device-software/shared-memory) per
[thread block](/gpu-glossary/device-software/thread-block), we end up limited by
[shared memory](/gpu-glossary/device-software/shared-memory):

\`\`\`
64 > 1   = warps/block = 32 threads/block ÷ 32 threads/warp
32 < 256 = blocks/register-file = 65,536 registers/register-file ÷ (32 threads/block × 8 registers/thread)
32       = blocks/SM
19       = blocks/smem = 228 KB/smem ÷ 12 KB/block
\`\`\`

Even though our [register file](/gpu-glossary/device-hardware/register-file) is
big enough to support 256
[thread blocks](/gpu-glossary/device-software/thread-block) concurrently, our
[shared memory](/gpu-glossary/device-software/shared-memory) is not, and so we
can only run 19 [thread blocks](/gpu-glossary/device-software/thread-block) per
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), corresponding to
19 [warps](/gpu-glossary/device-software/warp). This is the common case where
the size of program intermediates stored in
[registers](/gpu-glossary/device-software/registers) is much smaller than
elements of the program's
[working set](https://en.wikipedia.org/wiki/Working_set) that need to stay in
[shared memory](/gpu-glossary/device-software/shared-memory).

Low occupancy can hurt performance when there aren't enough
[eligible warps](/gpu-glossary/perf/warp-execution-state) to
[hide the latency](/gpu-glossary/perf/latency-hiding) of instructions, which
shows up as low instruction
[issue efficiency](/gpu-glossary/perf/issue-efficiency) and
[under-utilized pipes](/gpu-glossary/perf/pipe-utilization). However, once
occupancy is sufficient for [latency hiding](/gpu-glossary/perf/latency-hiding),
increasing it further may actually degrade performance. Higher occupancy reduces
resources per [thread](/gpu-glossary/device-software/thread), potentially
[bottlenecking the kernel on registers](/gpu-glossary/perf/register-pressure) or
reducing the [arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity)
that modern GPU architectures are designed to exploit.

More generally, occupancy measures what fraction of its maximum parallel tasks
the GPU is handling simultaneously, which is not inherently a target of
optimization in most kernels. Instead, we want to maximize the
[utilization](/gpu-glossary/perf/pipe-utilization) of compute resources if we
are [compute-bound](/gpu-glossary/perf/compute-bound) or memory resources if we
are [memory-bound](/gpu-glossary/perf/memory-bound).

In particular, high-performance GEMM kernels on Hopper and Blackwell
[architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
GPUs often run at single-digit occupancy percentages because they don't need
many [warps](/gpu-glossary/device-software/warp) to fully saturate the
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core).
`,jt=`---
title: What is overhead?
---

Overhead latency is the time spent with no useful work being done.

Unlike time spent [bottlenecked](/gpu-glossary/perf/performance-bottleneck) on
[compute](/gpu-glossary/perf/compute-bound) or
[memory](/gpu-glossary/perf/memory-bound), during which the GPU is working as
fast as possible, latency from overhead represents time where the GPU is instead
waiting to receive work.

Overhead often comes from CPU-side bottlenecks that prevent the GPU from
receiving work fast enough. For example, CUDA API call overhead adds on the
order of 10 μs per kernel launch. Moreover, frameworks like PyTorch or
TensorFlow spend time deciding which
[kernel](/gpu-glossary/device-software/kernel) to launch, which can take many
microseconds. We generally use the term
["host overhead"](https://modal.com/blog/host-overhead-inference-efficiency)
here, though it's not entirely standardized.
[CUDA Graphs](/gpu-glossary/host-software/cuda-graph), which can collect a
number of device-side [kernels](/gpu-glossary/device-software/kernel) together
into a single host-side launch, are a common solution to these overheads. For
more, see the
[_CUDA Techniques to Maximize Concurrency and System Utilization_ talk at GTC 2025](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72686/).

"Memory overhead" or "communications overhead" is overhead latency incurred
moving data back and forth from the CPU to the GPU or from one GPU to another.
But when communication bandwidth is the limiting factor, it's often better to
think of it as a form of [memory-boundedness](/gpu-glossary/perf/memory-bound)
where the "memory" is distributed across machines.
`,Mt=`---
title: What is peak rate?
---

Peak rate is the theoretical maximum rate at which a hardware system can
complete work.

Peak rate represents the absolute upper bound of GPU performance when every
execution unit operates at maximum capacity with perfect efficiency. It assumes
ideal operation, where no resource constraints
([registers](/gpu-glossary/device-software/registers),
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth), synchronization
barriers, etc.) create [bottlenecks](/gpu-glossary/perf/performance-bottleneck).

Peak rate is the yardstick against which all achieved performance is measured.
It sets the [compute-bound](/gpu-glossary/perf/compute-bound) "roof" in a
[roofline analysis](/gpu-glossary/perf/roofline-model). It is the denominator in
the utilization fraction reported in
[pipe utilization](/gpu-glossary/perf/pipe-utilization) metrics and the
[ultimate arbiter of GPU utilization](https://modal.com/blog/gpu-utilization-guide).

Poetically, NVIDIA engineers often call it the "speed of light" — the limit on
program speed imposed by physics.

Peak rate is computed directly from the fixed hardware specifications of each
GPU architecture.

For example,
[an NVIDIA H100 GPU](https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c)
with 132 SMs, each containing 128 FP32 cores, can issue 1 single precision Fused
Multiply Add (\`FMA\`) operation, which comprises 2 floating point operations per
core. That's 33,792
[instructions per clock](https://en.wikipedia.org/wiki/Instructions_per_cycle).
The H100 can operate its compute subsystem clock at a maximum rate of 1980 MHz
(million clocks per second) when using the FP32 cores, and so the peak rate is
66,908 billion FLOPS, or 66.9 TFLOPS.

This precisely matches the Peak FP32 TFLOPS (non-Tensor) rate advertised in
[NVIDIA's H100 whitepaper](https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c).
`,Nt=`---
title: What is a performance bottleneck?
---

The literal neck of a bottle limits the rate at which liquid can be poured; a
metaphorical performance bottleneck in a system limits the rate at which tasks
can be completed.

![[Roofline diagrams](/gpu-glossary/perf/roofline-model) like this one are used to quickly identify performance bottlenecks in throughput-oriented systems. Adapted from [Williams, Waterman, and Patterson (2008)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf).](themed-image://roofline-model.svg)

Bottlenecks are the target of performance optimization. The textbook approach to
optimization is to

- determine the bottleneck,
- elevate the bottleneck until it is no longer such, and
- repeat on the new bottleneck.

This approach is formalized in, for instance, the
["Theory of Constraints" by Eliyahu Goldratt](https://en.wikipedia.org/wiki/Theory_of_constraints)
that helped
[transmit the Toyota approach to manufacturing to manufacturers worldwide](https://www.leanproduction.com/theory-of-constraints/),
[thence to software engineering and operations](https://youtu.be/1jU7iUr-0xE).

In [this talk for Jane Street](https://youtu.be/139UPjoq7Kw?t=1229), Horace He
broke down the work done by the [kernels](/gpu-glossary/device-software/kernel)
of programs run on GPUs into three categories:

- Compute (running floating point operations on
  [CUDA Cores](/gpu-glossary/device-hardware/cuda-core) or
  [Tensor Cores](/gpu-glossary/device-hardware/tensor-core))
- Memory (moving data in the system's
  [memory hierarchy](/gpu-glossary/device-software/memory-hierarchy))
- Overhead (everything else)

And so for GPU [kernels](/gpu-glossary/device-software/kernel), performance
bottlenecks fall into three main\\* categories:

- [compute-bound](/gpu-glossary/perf/compute-bound)
  [kernels](/gpu-glossary/device-software/kernel), bottlenecked by the
  [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) of compute
  units, like large matrix-matrix multiplication,
- [memory-bound](/gpu-glossary/perf/memory-bound)
  [kernels](/gpu-glossary/device-software/kernel), bottlenecked by the
  [bandwidth of memory subsystems](/gpu-glossary/perf/memory-bandwidth), like
  large vector-vector multiplication, and
- [overhead-bound](/gpu-glossary/perf/overhead)
  [kernels](/gpu-glossary/device-software/kernel) bottlenecked by latency, like
  small array operations.

[Roofline model](/gpu-glossary/perf/roofline-model) analysis helps quickly
identify whether a program's performance is bottlenecked by
compute/[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth) or
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth).

<small>Of course, _any_ resource can become a bottleneck. For instance, power
ingress and heat egress can and do bottleneck some GPUs below their theoretical
maximum performance. See
[this article from NVIDIA](https://developer.nvidia.com/blog/nvidia-sets-new-generative-ai-performance-and-scale-records-in-mlperf-training-v4-0/)
explaining a 4% end-to-end performance improvement by redirecting power from the
L2 cache to the
[Streaming Multiprocessors](/gpu-glossary/device-hardware/streaming-multiprocessor)
or
[this article from Horace He](https://www.thonking.ai/p/strangely-matrix-multiplications)
indicating that matrix multiplication performance varies depending on the input
data via the amount of power demanded by transistor switching. But compute and
memory are the most important resources and the most common bottlenecks.</small>
`,Pt=`---
title: What is pipe utilization?
---

Pipe utilization measures how effectively a
[kernel](/gpu-glossary/device-software/kernel) uses the execution resources
within each
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).

Each [SM](/gpu-glossary/device-hardware/streaming-multiprocessor) contains
multiple independent execution pipes optimized for different instruction types -
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core) for general floating-point
arithmetic, [Tensor Cores](/gpu-glossary/device-hardware/tensor-core) for tensor
contractions, [load/store units](/gpu-glossary/device-hardware/load-store-unit)
for memory access, and control flow units for branching. Pipe utilization shows
what percentage of each pipeline's [peak rate](/gpu-glossary/perf/peak-rate) is
being achieved when that pipe is actively executing at least one
[warp](/gpu-glossary/device-software/warp), averaged across all active
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor).

Before debugging application performance at the level of pipe utilization, GPU
programmers should first consider
[GPU kernel utilization](https://modal.com/blog/gpu-utilization-guide) and
[SM utilization](/gpu-glossary/perf/streaming-multiprocessor-utilization).

Pipe utilization is available in the
\`sm__inst_executed_pipe_*.avg.pct_of_peak_sustained_active\` metrics from
[NSight Compute](https://developer.nvidia.com/nsight-compute) (\`ncu\`), where the
asterisk represents specific pipelines like
[\`fma\`](/gpu-glossary/device-hardware/cuda-core),
[\`tensor\`](/gpu-glossary/device-hardware/tensor-core),
[\`lsu\`](/gpu-glossary/device-hardware/load-store-unit), or \`adu\` (address).
`,Ft=`---
title: What is register pressure?
---

Register pressure is a colorful term used when the
[register file](/gpu-glossary/device-hardware/register-file) is a
[bottleneck](/gpu-glossary/perf/performance-bottleneck).

[Registers](/gpu-glossary/device-software/registers) in the
[Parallel Thread eXecution (PTX)](/gpu-glossary/device-software/parallel-thread-execution)
language are virtual and unlimited, but the
[register files](/gpu-glossary/device-hardware/register-file) of the
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor)
are physical and so limited.

The amount of space in the
[register file](/gpu-glossary/device-hardware/register-file) consumed by a
[thread](/gpu-glossary/device-software/thread) is determined by the
[Streaming ASSembler (SASS)](/gpu-glossary/device-software/streaming-assembler)
code for the [kernel](/gpu-glossary/device-software/kernel), and since all
[threads](/gpu-glossary/device-software/thread) in a
[thread block](/gpu-glossary/device-software/thread-block) are scheduled onto
the same [SM](/gpu-glossary/device-hardware/streaming-multiprocessor), the total
space required by a [thread block](/gpu-glossary/device-software/thread-block)
is determined also by the [kernel](/gpu-glossary/device-software/kernel) launch
configuration. As the space allocated per
[thread block](/gpu-glossary/device-software/thread-block) increases, fewer
[thread blocks](/gpu-glossary/device-software/thread-block) can be scheduled
onto the same [SM](/gpu-glossary/device-hardware/streaming-multiprocessor),
reducing [occupancy](/gpu-glossary/perf/occupancy) and making it more difficult
to [hide latency](/gpu-glossary/perf/latency-hiding).

See
[this excellent article by SemiAnalysis](https://semianalysis.com/2025/06/23/nvidia-tensor-core-evolution-from-volta-to-blackwell/)
for an account of the relationship between register pressure and key features
added in recent
[Streaming Multiprocessor architectures](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
like asynchronous copies (added in Ampere), the
[Tensor Memory Accelerator](/gpu-glossary/device-hardware/tensor-memory-accelerator)
(TMA, added in Hopper), and
[tensor memory](/gpu-glossary/device-hardware/tensor-memory) (added in
Blackwell).

Register pressure also occurs in CPUs, where similar register
[bottlenecks](/gpu-glossary/perf/performance-bottleneck) limit the degree to
which loops can be
[strip-mined during auto-vectorization](https://hogback.atmos.colostate.edu/rr/old/tidbits/intel/macintel/doc_files/source/extfile/optaps_for/common/optaps_vec_mine.htm).
`,It=`---
title: What is the roofline model?
---

The roofline model is a simplified, visual model of performance used to quickly
determine whether a program is bound by
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth) or
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth).

![[Kernels](/gpu-glossary/device-software/kernel) to the left of the ridge point are [limited by the bandwidth of the memory subsystem](/gpu-glossary/perf/memory-bound) and [kernels](/gpu-glossary/device-software/kernel) to the right of the ridge point are [limited by the bandwidth of the arithmetic subsystem](/gpu-glossary/perf/compute-bound). Diagram adapted from [Williams, Waterman, and Patterson (2008)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf), which introduced the roofline model.](themed-image://roofline-model.svg)

In the roofline model, two hardware‑derived "roofs" put a "ceiling" on the
possible performance:

- the "compute roof" – the [peak rate](/gpu-glossary/perf/peak-rate) of the
  target hardware ([CUDA Cores](/gpu-glossary/device-hardware/cuda-core) or
  [Tensor Cores](/gpu-glossary/device-hardware/tensor-core)), aka the
  [arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth)
- the "memory roof" – the peak memory throughput of the target hardware, aka the
  [memory bandwidth](/gpu-glossary/perf/memory-bandwidth).

These are visualized on a plane with the
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) (in operations
per byte) on the x-axis and the performance (in operations per second) on the
y-axis. The "compute roof" is a horizontal line with height equal to the
[arithmetic bandwidth](/gpu-glossary/perf/arithmetic-bandwidth). The "memory
roof" is a slanted line with slope equal to the
[memory bandwidth](/gpu-glossary/perf/memory-bandwidth). Slope is "rise over
run", and so the line has units of bytes per second (operations per second
divided by operations per byte).

A specific [kernel's](/gpu-glossary/device-software/kernel) x-coordinate tells
you instantly whether it is fundamentally
[compute-bound](/gpu-glossary/perf/compute-bound) (points beneath the flat roof)
or [memory-bound](/gpu-glossary/perf/memory-bound) (points beneath the slanted
roof). [Kernels](/gpu-glossary/device-software/kernel) are rarely up against
either roof due to the effects of [overhead](/gpu-glossary/perf/overhead).

The point on the boundary, i.e. where the diagonal and horizontal roof meet, is
called the "ridge point". Its x-coordinate is the minimum
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) required to be
able to escape the memory
[bottleneck](/gpu-glossary/perf/performance-bottleneck). Computer systems whose
ridge point is further to the left are easier to achieve maximum performance on,
but the relatively poor scaling of memory relative to compute generally has
pushed the ridge points of systems to the right over time.

The compute and memory roofs need only be derived once per subsystem (though
importantly they vary depending on the subsystem, not just the system;
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core) have more FLOPS than
[CUDA Cores](/gpu-glossary/device-hardware/cuda-core)).

NVIDIA's NSight Compute tool for [kernel](/gpu-glossary/device-software/kernel)
performance engineering automatically performs roofline analysis for profiled
[kernels](/gpu-glossary/device-software/kernel).

The roofline model is deceptively simple. Note that, for instance, system
latencies do not appear anywhere in the diagram, only bandwidths and
throughputs. It is simple because it is highly opinionated, and understanding
those opinions and their reasoning is key to understanding the power and the
proper application of the roofline.

The roofline model was introduced by Samuel Williams, Andrew Waterman, and David
Patterson in
[this 2008 paper](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf).
They introduced it in the face of several hardware scaling trends that shaped
system architectures before and since.

First, as Patterson separately observed in a famous 2004 paper,
["latency lags bandwidth"](https://dl.acm.org/doi/pdf/10.1145/1022594.1022596).
More specifically, across subsystems like compute, memory, and storage, a linear
improvement in latency has historically been accompanied by a quadratic
improvement in bandwidth. This suggested that future systems would be, like
GPUs, throughput-oriented.

Second, as has long been observed, compute subsystems (like processor cores)
have scaled their performance much more rapidly than memory subsystems like
[caches](/gpu-glossary/device-hardware/l1-data-cache) and
[DRAM](/gpu-glossary/device-hardware/gpu-ram). This was popularized as the
["memory wall"](https://www.eecs.ucf.edu/~lboloni/Teaching/EEL5708_2006/slides/wulf94.pdf)
by Wulf and McKee in 1994.

Finally, the early 2000s saw the end of
[Dennard scaling](https://en.wikipedia.org/wiki/Dennard_scaling), aka increasing
clock speed at equal power, due primarily to the fixed leakage current of
transistors, which posed power draw and heat dissipation problems. Increasing
clock speed had previously buoyed general purpose, latency-oriented systems like
CPUs, over special purpose hardware. This slowdown was not accompanied by a
slowdown in [Moore's Law](https://en.wikipedia.org/wiki/Moore%27s_law), aka
increasing transistor count per chip. The architectural solution to an abundance
of transistors but scarcity of power was hardware specialization: disaggregating
computers into components specialized in completing distinct tasks. For a
well-documented example, see the
[Pixel Visual Core](https://blog.google/products/pixel/pixel-visual-core-image-processing-and-machine-learning-pixel-2/)
image co-processor, explained in detail in chapter 7 of the sixth edition of
Hennessy and Patterson's
[_Computer Architecture_](https://archive.org/details/computerarchitectureaquantitativeapproach6thedition/page/n13/mode/2up).

Taken together, these trends correctly suggested to the authors that future
systems would be throughput-oriented and that among the various bandwidths at
play, the [bandwidth of memory subsystems](/gpu-glossary/perf/memory-bandwidth)
would be the primary
[performance bottleneck](/gpu-glossary/perf/performance-bottleneck).
Applications of those systems that wanted to achieve peak performance would
therefore need to have high operational intensity for that hardware's
specialized operations — in the case of GPUs,
[arithmetic intensity](/gpu-glossary/perf/arithmetic-intensity) for
[Tensor Cores](/gpu-glossary/device-hardware/tensor-core), which is to say very
large matrix multiplications.
`,Lt=`---
title: What is a scoreboard stall?
---

A scoreboard stall occurs when an instruction cannot be issued due to a
dependency on the result of a prior instruction.

A scoreboard is a hardware structure that tracks which
[registers](/gpu-glossary/device-software/registers) are waiting to be written
to by an in-flight instruction. A [warp](/gpu-glossary/device-software/warp)
cannot progress when it is in the
[stalled state](/gpu-glossary/perf/warp-execution-state).

Scoreboard stalls can be classified into two types: short scoreboard stalls and
long scoreboard stalls.

A short scoreboard stall occurs when an instruction is waiting on the result of
a variable latency instruction which does not leave the
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor).
This includes slow math instructions on the
[Special Function Unit](/gpu-glossary/device-hardware/special-function-unit)
like \`MUFU.EX2\` and \`MUFU.SQRT\` and matrix multiplications on the
[Tensor Core](/gpu-glossary/device-hardware/tensor-core) like \`MMA\`. It also
includes [shared memory](/gpu-glossary/device-software/shared-memory) operations
like \`LDS\` and \`STS\`.

A long scoreboard stall occurs when an instruction is waiting on the result of a
memory operation that leaves the
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), such as global
memory loads (\`LDG\`) or stores (\`STG\`). Long scoreboard stalls dominate
[memory-bound](/gpu-glossary/perf/memory-bound) code.

A [warp](/gpu-glossary/device-software/warp) has 6 scoreboards which the
compiler uses to track data dependencies between instructions.

Some scoreboard information is legible in
[Streaming Assembler (SASS)](/gpu-glossary/device-software/streaming-assembler).
For example, below is what you might see from a \`cuobjdump\` with the
\`--dump-sass\` flag:

\`\`\`nasm
[barrier:  :  :  :  ]  /*line*/  INSTRUCTION Ri, [Rj] ; # Format: scoreboard info, line number, instruction, operands
[B------:R-:W2:-:S04]  /*00f0*/  LDG.E.SYS R0, [R2] ;   # Sets scoreboard 2
[B------:R-:W2:-:S01]  /*0100*/  LDG.E.SYS R5, [R4] ;   # \`ptxas\` intelligently reuses scoreboard 2
...
[B--2---:R-:W-:Y:S08]  /*0150*/  IMAD R0, R0, c[0x0][0x160], R5 ;  # Waits on scoreboard 2
\`\`\`

We can see that our \`IMAD\` instruction has a barrier (\`B--2---\`) on scoreboard
2, indicating that it requires that bit flag to be cleared before it can issue.
Both \`LDG\` instructions increment (\`W2\` write) scoreboard 2 when they are issued
so that our \`IMAD\` instruction will have the correct values in registers \`R0\`
and \`R5\` before it executes.

There may be multiple scoreboards to barrier, such as \`B01--4-\` which means wait
until scoreboards 0,1,4 are all cleared. When the data dependency has been
satisfied, the respective scoreboard is decremented.

Scoreboard reuse can mean that the stall classification from Nsight Compute is
incorrect, as a long and short scoreboard stall may be conflated if they use the
same scoreboard.

[Scoreboarding](https://www.cs.umd.edu/~meesh/411/website/projects/dynamic/scoreboard.html)
for dependency tracking in dynamic instruction scheduling dates back to the
"first supercomputer", the
[Control Data Corporation 6600](https://en.wikipedia.org/wiki/CDC_6600), one of
which
[disproved Euler's sum of powers conjecture](https://www.ams.org/journals/bull/1966-72-06/S0002-9904-1966-11654-3/S0002-9904-1966-11654-3.pdf)
in 1966. Unlike in CPUs, scoreboarding in GPUs isn't used for out-of-order
execution within [threads](/gpu-glossary/device-software/thread)
(instruction-level parallelism), only across them (thread-level parallelism);
see [this NVIDIA patent](https://patents.google.com/patent/US7676657).

For more details about scoreboard implementation on GPUs, see
[Professor Matthew D. Sinclair's slides](https://pages.cs.wisc.edu/~sinclair/courses/cs758/fall2019/handouts/lecture/cs758-fall19-gpu_uarch2.pdf).
`,Rt=`---
title: What is SM utilization?
---

SM utilization measures the percentage of time that
[Streaming Multiprocessors (SMs)](/gpu-glossary/device-hardware/streaming-multiprocessor)
are executing instructions.

SM utilization is akin to the more familiar
[kernel utilization](https://modal.com/blog/gpu-utilization-guide) reported by
[\`nvidia-smi\`](/gpu-glossary/host-software/nvidia-smi), but more fine-grained.
Instead of reporting the fraction of time that a
[kernel](/gpu-glossary/device-software/kernel) is executing anywhere on the GPU,
it reports the fraction of time all
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) spend executing
[kernels](/gpu-glossary/device-software/kernel). If a
[kernel](/gpu-glossary/device-software/kernel) uses only one
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor), e.g. because it
only has one [thread block](/gpu-glossary/device-software/thread-block), then it
will achieve 100% GPU utilization while it is active, but the SM utilization
will be at most one over the number of
[SMs](/gpu-glossary/device-hardware/streaming-multiprocessor) — under 1% in an
H100 GPU.

[As with GPU utilization but unlike CPU utilization](https://modal.com/blog/gpu-utilization-guide),
SM utilization should be high, even up to 100%.

But even though SM utilization is finer-grained than GPU utilization, it still
isn't fine-grained enough to capture how well the GPU's compute resources are
being used. If SM utilization is high, but performance is still inadequate,
programmers should check
[pipe utilization](/gpu-glossary/perf/pipe-utilization), which measures how
effectively each SM uses its internal functional units. High SM utilization with
low [pipe utilization](/gpu-glossary/perf/pipe-utilization) indicates that your
[kernel](/gpu-glossary/device-software/kernel) is running on many SMs but not
fully utilizing the computational resources within each one.
`,zt=`---
title: What is warp divergence?
---

Warp divergence occurs when threads within a
[warp](/gpu-glossary/device-software/warp) take different execution paths due to
control flow statements.

For example, consider this [kernel](/gpu-glossary/device-software/kernel):

\`\`\`cpp
__global__ void divergent_kernel(float* data, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        if (data[idx] > 0.5f) {
		    // A
            data[idx] = data[idx] * 4.0f;
        } else {
		    // B
            data[idx] = data[idx] + 2.0f;
        }
        data[idx] = data[idx] * data[idx];
    }
}
\`\`\`

When the [threads](/gpu-glossary/device-software/thread) within a
[warp](/gpu-glossary/device-software/warp) encounter the data-dependent
conditional, some [threads](/gpu-glossary/device-software/thread) must execute
block A while others must execute block B, depending on the value at
\`data[idx]\`. Because of this data-dependency and the structural constraints of
the
[CUDA programming model](/gpu-glossary/device-software/cuda-programming-model)
and its implementation in the
[PTX machine model](/gpu-glossary/device-software/parallel-thread-execution),
there is no way for a programmer or a compiler to avoid this split in control
flow inside of the [warp](/gpu-glossary/device-software/warp).

Instead, the [warp scheduler](/gpu-glossary/device-hardware/warp-scheduler) must
handle concurrent execution of these divergent code paths, which it achieves by
"masking" some [threads](/gpu-glossary/device-software/thread) so that they
don't execute the instruction. This is achieved using predicate
[registers](/gpu-glossary/device-software/registers).

Let's examine the generated
[SASS](/gpu-glossary/device-software/streaming-assembler)
([Godbolt link](https://godbolt.org/z/EGWKb5oWr)) to understand the execution
flow:

\`\`\`nasm
LDG.E.SYS R4, [R2]                       // L1 load data[idx]
FSETP.GT.AND P0, PT, R4.reuse, 0.5, PT   // L2 set P0 to data[idx] > 0.5
FADD R0, R4, 2                           // L3 store 2 + data[idx] in R0
@P0 FMUL R0, R4, 4                       // L4 in some threads, store 4 * data[idx] in R0
FMUL R5, R0, R0                          // L5 store R0 * R0 in R5
STG.E.SYS [R2], R5                       // L6 store R5 in data[idx]
\`\`\`

After loading the data into \`R4\` (\`L1\`), all 32
[threads](/gpu-glossary/device-software/thread) in the
[warp](/gpu-glossary/device-software/warp) execute \`FSETP.GT.AND\` concurrently
(\`L2\`), and each [thread](/gpu-glossary/device-software/thread) gets its own
\`P0\` value based on the \`data\` value in \`R4\`. Then, we have a bit of
[compiler](/gpu-glossary/host-software/nvcc) cleverness: in \`L3\` _all_
[threads](/gpu-glossary/device-software/thread) execute the code in A, writing
to \`R0\`. Only those for whom \`P0\` is true then execute the code in B (\`L4\`),
over-writing the value written to \`R0\` in \`L3\`. On this instruction, the
[warp](/gpu-glossary/device-software/warp) is said to be "divergent". On \`L5\`,
all [threads](/gpu-glossary/device-software/thread) are back to executing the
same code. Once the
[warp scheduler](/gpu-glossary/device-hardware/warp-scheduler) brings them back
into alignment by issuing the same instruction on the same clock cycle, the warp
has "converged".

This is presumably more efficient than the naïve encoding of the branch into
[SASS](/gpu-glossary/device-software/streaming-assembler), which would instead
predicate both lines \`L3\` and \`L4\` — "presumably" in that we can trust the
[compiler](/gpu-glossary/host-software/nvcc) and in that, heuristically, we are
trading use of cheap, plentiful
[CUDA Core](/gpu-glossary/device-hardware/cuda-core) computation for more
expensive flow control. As often in GPU programming, it's better to waste
compute (an unnecessary \`FADD\` for every execution of \`L4\`) than to add
complexity, even if it's just a simple predication!

One reason compilers might aggressively avoid divergence is that in early
(pre-Volta) GPUs, divergent [warps](/gpu-glossary/device-software/warp) were
always fully serialized. While warp divergence still reduces efficiency, modern
GPUs with independent thread scheduling don't necessarily experience the full
serialization penalties.
`,Bt=`---
title: What is warp execution state?
---

The state of the [warps](/gpu-glossary/device-software/warp) running a
[kernel](/gpu-glossary/device-software/kernel) is described with a number of
non-exclusive adjectives: active, stalled, eligible, and selected.

![Warp execution states are indicated by color. Diagram inspired by the [*CUDA Techniques to Maximize Compute and Instruction Throughput*](https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/) talk at GTC 2025.](themed-image://cycles.svg)

A [warp](/gpu-glossary/device-software/warp) is considered _active_ from the
time its [threads](/gpu-glossary/device-software/thread) begin executing to the
time when all [threads](/gpu-glossary/device-software/thread) in the
[warp](/gpu-glossary/device-software/warp) have exited from the
[kernel](/gpu-glossary/device-software/kernel). Active
[warps](/gpu-glossary/device-software/warp) form the pool from which
[warp schedulers](/gpu-glossary/device-hardware/warp-scheduler) select
candidates for instruction issue each cycle (i.e. to be put in one of the issue
slots).

The maximum number of active [warps](/gpu-glossary/device-software/warp) per
[Streaming Multiprocessor (SM)](/gpu-glossary/device-hardware/streaming-multiprocessor)
varies by
[architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
and is listed in
[NVIDIA's documentation](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html?highlight=compute%2520capability#compute-capabilities)
for [Compute Capability](/gpu-glossary/device-software/compute-capability). For
instance, on an H100 SXM GPU with
[Compute Capability](/gpu-glossary/device-software/compute-capability) 9.0,
there can be up to 64 active [warps](/gpu-glossary/device-software/warp) per
[SM](/gpu-glossary/device-hardware/streaming-multiprocessor) (2048 threads).
Note that active [warps](/gpu-glossary/device-software/warp) are not necessarily
executing instructions. There are active
[warps](/gpu-glossary/device-software/warp) in all but one slot+cycle in the
diagram above — a high [occupancy](/gpu-glossary/perf/occupancy).

An _eligible_ [warp](/gpu-glossary/device-software/warp) is an active
[warp](/gpu-glossary/device-software/warp) that is ready to issue its next
instruction. For a [warp](/gpu-glossary/device-software/warp) to be eligible,
the following must be true:

- the next instruction has been fetched,
- the required execution unit is available,
- all instruction dependencies have been resolved, and
- no synchronization barriers block execution.

Eligible [warps](/gpu-glossary/device-software/warp) represent the immediate
candidates for instruction issue by the
[warp scheduler](/gpu-glossary/device-hardware/warp-scheduler). Eligible
[warps](/gpu-glossary/device-software/warp) appear on all cycles but cycle n + 2
in the diagram above. Having no eligible
[warps](/gpu-glossary/device-software/warp) on many cycles can be bad for
performance, especially if you are primarily using lower latency arithmetic
units like [CUDA Cores](/gpu-glossary/device-hardware/cuda-core).

A _stalled_ [warp](/gpu-glossary/device-software/warp) is an active
[warp](/gpu-glossary/device-software/warp) that cannot issue its next
instruction due to unresolved dependencies or resource conflicts.
[Warps](/gpu-glossary/device-software/warp) become stalled for various reasons
including:

- execution dependencies, i.e. they must wait for results from previous
  arithmetic instructions,
- memory dependencies, i.e. they must wait for results from previous memory
  operations,
- pipeline conflicts, i.e. the execution resources are currently occupied.

When warps are stalled on accesses to shared memory or on long-running
arithmetic instructions, they are said to be stalled on the "short scoreboard".
When warps are stalled on accesses to GPU RAM, they are said to be stalled on
the "long scoreboard". Both types of stalls are known as
[scoreboard stalls](/gpu-glossary/perf/scoreboard-stall).

Stalled [warps](/gpu-glossary/device-software/warp) appear in multiple slots in
each cycle in the diagram above. Stalled
[warps](/gpu-glossary/device-software/warp) are not inherently bad — a large
collection of concurrently stalled [warps](/gpu-glossary/device-software/warp)
might be necessary to [hide latency](/gpu-glossary/perf/latency-hiding) from
long-running instructions, like memory loads or
[Tensor Core](/gpu-glossary/device-hardware/tensor-core) instructions like
\`HMMA\`, which [can run for dozens of cycles](https://arxiv.org/abs/2206.02874).

A _selected_ [warp](/gpu-glossary/device-software/warp) is an eligible
[warp](/gpu-glossary/device-software/warp) chosen by the
[warp scheduler](/gpu-glossary/device-hardware/warp-scheduler) to receive an
instruction during the current cycle. Each cycle,
[warp schedulers](/gpu-glossary/device-hardware/warp-scheduler) look at their
pool of eligible [warps](/gpu-glossary/device-software/warp), select one if
there are any, and issue it an instruction. There is a selected
[warp](/gpu-glossary/device-software/warp) on each cycle with an eligible
[warp](/gpu-glossary/device-software/warp). The fraction of
[active cycles](/gpu-glossary/perf/active-cycle) on which a
[warp](/gpu-glossary/device-software/warp) is selected and an instruction is
issued is the [issue efficiency](/gpu-glossary/perf/issue-efficiency).
`,Vt=`---
title: Performance
---

GPUs are used when the performance of an application is inadequate on
general-purpose hardware. That makes programming for them quite different from
most other forms of programming.

For a traditional computer application, like a database management system or a
web server, correctness is the primary concern. If the application loses data or
returns incorrect results, then the application has failed. Performance is often
ignored.

When programming GPUs, correctness is typically poorly-defined. "Correct"
outputs are defined only up to some number of significant bits or only for some
underdetermined subset of "well-behaved" inputs. And correctness is at best
necessary but not sufficient. If the programmers of the application cannot
achieve superior performance (per second, per dollar, or per Watt), then the
application has failed. Programming GPUs is too hard and too limited, and
running them too expensive, for anything else to be the case.

At NVIDIA, this fact is captured in a pithy slogan: "performance is the
product".

This section of the GPU Glossary collects together and defines the key terms
that you need to understand to optimize the performance of programs running on
GPUs.

Roughly speaking, it should cover every term that you run across when using
[NSight Compute](https://developer.nvidia.com/nsight-compute) to debug GPU
[kernel](/gpu-glossary/device-software/kernel) performance issues.
`,Ht=`---
title: README
---

<pre class="text-xs md:text-base font-mono whitespace-pre">
 ██████╗ ██████╗ ██╗   ██╗
██╔════╝ ██╔══██╗██║   ██║
██║  ███╗██████╔╝██║   ██║
██║   ██║██╔═══╝ ██║   ██║
╚██████╔╝██║     ╚██████╔╝
 ╚═════╝ ╚═╝      ╚═════╝
 ██████╗ ██╗      ██████╗ ███████╗███████╗ █████╗ ██████╗ ██╗   ██╗
██╔════╝ ██║     ██╔═══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
██║  ███╗██║     ██║   ██║███████╗███████╗███████║██████╔╝ ╚████╔╝
██║   ██║██║     ██║   ██║╚════██║╚════██║██╔══██║██╔══██╗  ╚██╔╝
╚██████╔╝███████╗╚██████╔╝███████║███████║██║  ██║██║  ██║   ██║
 ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
 </pre>

We wrote this glossary to solve a problem we ran into working with GPUs here at
[Modal](/): the documentation is fragmented, making it difficult to connect
concepts at different levels of the stack, like
[Streaming Multiprocessor Architecture](/gpu-glossary/device-hardware/streaming-multiprocessor-architecture),
[Compute Capability](/gpu-glossary/device-software/compute-capability), and
[nvcc compiler flags](/gpu-glossary/host-software).

So we've read the
[PDFs from NVIDIA](https://docs.nvidia.com/cuda/pdf/PTX_Writers_Guide_To_Interoperability.pdf),
lurked in the [good Discords](https://discord.gg/gpumode), and even bought
[dead-tree textbooks](https://www.amazon.com/Professional-CUDA-Programming-John-Cheng/dp/1118739329)
to put together a glossary that spans the whole stack in one place.

This glossary, unlike a PDF or a Discord or a book, is a _hypertext document_ --
all pages are inter-linked with one another, so you can jump down to read about
the [Warp Scheduler](/gpu-glossary/device-hardware/warp-scheduler) so you can
better understand the [threads](/gpu-glossary/device-software/thread) that you
came across in the article on the
[CUDA programming model](/gpu-glossary/host-software/cuda-c).

You can also read it linearly. To navigate between pages, use the arrow keys,
the arrows at the bottom of each page, or the table of contents (in the sidebar
on desktop or in the hamburger menu on mobile).

The source for the glossary is available
[on GitHub](https://github.com/modal-labs/gpu-glossary).
`,Ut=n(((e,t)=>{function n(e){return e==null}function r(e){return typeof e==`object`&&!!e}function i(e){return Array.isArray(e)?e:n(e)?[]:[e]}function a(e,t){var n,r,i,a;if(t)for(a=Object.keys(t),n=0,r=a.length;n<r;n+=1)i=a[n],e[i]=t[i];return e}function o(e,t){var n=``,r;for(r=0;r<t;r+=1)n+=e;return n}function s(e){return e===0&&1/e==-1/0}t.exports.isNothing=n,t.exports.isObject=r,t.exports.toArray=i,t.exports.repeat=o,t.exports.isNegativeZero=s,t.exports.extend=a})),Wt=n(((e,t)=>{function n(e,t){Error.call(this),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=(this.reason||`(unknown reason)`)+(this.mark?` `+this.mark.toString():``),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=Error().stack||``}n.prototype=Object.create(Error.prototype),n.prototype.constructor=n,n.prototype.toString=function(e){var t=this.name+`: `;return t+=this.reason||`(unknown reason)`,!e&&this.mark&&(t+=` `+this.mark.toString()),t},t.exports=n})),Gt=n(((e,t)=>{var n=Ut();function r(e,t,n,r,i){this.name=e,this.buffer=t,this.position=n,this.line=r,this.column=i}r.prototype.getSnippet=function(e,t){var r,i,a,o,s;if(!this.buffer)return null;for(e||=4,t||=75,r=``,i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(--i,this.position-i>t/2-1){r=` ... `,i+=5;break}for(a=``,o=this.position;o<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>t/2-1){a=` ... `,o-=5;break}return s=this.buffer.slice(i,o),n.repeat(` `,e)+r+s+a+`
`+n.repeat(` `,e+this.position-i+r.length)+`^`},r.prototype.toString=function(e){var t,n=``;return this.name&&(n+=`in "`+this.name+`" `),n+=`at line `+(this.line+1)+`, column `+(this.column+1),e||(t=this.getSnippet(),t&&(n+=`:
`+t)),n},t.exports=r})),$=n(((e,t)=>{var n=Wt(),r=[`kind`,`resolve`,`construct`,`instanceOf`,`predicate`,`represent`,`defaultStyle`,`styleAliases`],i=[`scalar`,`sequence`,`mapping`];function a(e){var t={};return e!==null&&Object.keys(e).forEach(function(n){e[n].forEach(function(e){t[String(e)]=n})}),t}function o(e,t){if(t||={},Object.keys(t).forEach(function(t){if(r.indexOf(t)===-1)throw new n(`Unknown option "`+t+`" is met in definition of "`+e+`" YAML type.`)}),this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(e){return e},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.defaultStyle=t.defaultStyle||null,this.styleAliases=a(t.styleAliases||null),i.indexOf(this.kind)===-1)throw new n(`Unknown kind "`+this.kind+`" is specified for "`+e+`" YAML type.`)}t.exports=o})),Kt=n(((e,t)=>{var n=Ut(),r=Wt(),i=$();function a(e,t,n){var r=[];return e.include.forEach(function(e){n=a(e,t,n)}),e[t].forEach(function(e){n.forEach(function(t,n){t.tag===e.tag&&t.kind===e.kind&&r.push(n)}),n.push(e)}),n.filter(function(e,t){return r.indexOf(t)===-1})}function o(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},t,n;function r(t){e[t.kind][t.tag]=e.fallback[t.tag]=t}for(t=0,n=arguments.length;t<n;t+=1)arguments[t].forEach(r);return e}function s(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!==`scalar`)throw new r(`There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.`)}),this.compiledImplicit=a(this,`implicit`,[]),this.compiledExplicit=a(this,`explicit`,[]),this.compiledTypeMap=o(this.compiledImplicit,this.compiledExplicit)}s.DEFAULT=null,s.create=function(){var e,t;switch(arguments.length){case 1:e=s.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new r(`Wrong number of arguments for Schema.create function`)}if(e=n.toArray(e),t=n.toArray(t),!e.every(function(e){return e instanceof s}))throw new r(`Specified list of super schemas (or a single Schema object) contains a non-Schema object.`);if(!t.every(function(e){return e instanceof i}))throw new r(`Specified list of YAML types (or a single Type object) contains a non-Type object.`);return new s({include:e,explicit:t})},t.exports=s})),qt=n(((e,t)=>{t.exports=new($())(`tag:yaml.org,2002:str`,{kind:`scalar`,construct:function(e){return e===null?``:e}})})),Jt=n(((e,t)=>{t.exports=new($())(`tag:yaml.org,2002:seq`,{kind:`sequence`,construct:function(e){return e===null?[]:e}})})),Yt=n(((e,t)=>{t.exports=new($())(`tag:yaml.org,2002:map`,{kind:`mapping`,construct:function(e){return e===null?{}:e}})})),Xt=n(((e,t)=>{t.exports=new(Kt())({explicit:[qt(),Jt(),Yt()]})})),Zt=n(((e,t)=>{var n=$();function r(e){if(e===null)return!0;var t=e.length;return t===1&&e===`~`||t===4&&(e===`null`||e===`Null`||e===`NULL`)}function i(){return null}function a(e){return e===null}t.exports=new n(`tag:yaml.org,2002:null`,{kind:`scalar`,resolve:r,construct:i,predicate:a,represent:{canonical:function(){return`~`},lowercase:function(){return`null`},uppercase:function(){return`NULL`},camelcase:function(){return`Null`}},defaultStyle:`lowercase`})})),Qt=n(((e,t)=>{var n=$();function r(e){if(e===null)return!1;var t=e.length;return t===4&&(e===`true`||e===`True`||e===`TRUE`)||t===5&&(e===`false`||e===`False`||e===`FALSE`)}function i(e){return e===`true`||e===`True`||e===`TRUE`}function a(e){return Object.prototype.toString.call(e)===`[object Boolean]`}t.exports=new n(`tag:yaml.org,2002:bool`,{kind:`scalar`,resolve:r,construct:i,predicate:a,represent:{lowercase:function(e){return e?`true`:`false`},uppercase:function(e){return e?`TRUE`:`FALSE`},camelcase:function(e){return e?`True`:`False`}},defaultStyle:`lowercase`})})),$t=n(((e,t)=>{var n=Ut(),r=$();function i(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function a(e){return 48<=e&&e<=55}function o(e){return 48<=e&&e<=57}function s(e){if(e===null)return!1;var t=e.length,n=0,r=!1,s;if(!t)return!1;if(s=e[n],(s===`-`||s===`+`)&&(s=e[++n]),s===`0`){if(n+1===t)return!0;if(s=e[++n],s===`b`){for(n++;n<t;n++)if(s=e[n],s!==`_`){if(s!==`0`&&s!==`1`)return!1;r=!0}return r&&s!==`_`}if(s===`x`){for(n++;n<t;n++)if(s=e[n],s!==`_`){if(!i(e.charCodeAt(n)))return!1;r=!0}return r&&s!==`_`}for(;n<t;n++)if(s=e[n],s!==`_`){if(!a(e.charCodeAt(n)))return!1;r=!0}return r&&s!==`_`}if(s===`_`)return!1;for(;n<t;n++)if(s=e[n],s!==`_`){if(s===`:`)break;if(!o(e.charCodeAt(n)))return!1;r=!0}return!r||s===`_`?!1:s===`:`?/^(:[0-5]?[0-9])+$/.test(e.slice(n)):!0}function c(e){var t=e,n=1,r,i,a=[];return t.indexOf(`_`)!==-1&&(t=t.replace(/_/g,``)),r=t[0],(r===`-`||r===`+`)&&(r===`-`&&(n=-1),t=t.slice(1),r=t[0]),t===`0`?0:r===`0`?t[1]===`b`?n*parseInt(t.slice(2),2):t[1]===`x`?n*parseInt(t,16):n*parseInt(t,8):t.indexOf(`:`)===-1?n*parseInt(t,10):(t.split(`:`).forEach(function(e){a.unshift(parseInt(e,10))}),t=0,i=1,a.forEach(function(e){t+=e*i,i*=60}),n*t)}function l(e){return Object.prototype.toString.call(e)===`[object Number]`&&e%1==0&&!n.isNegativeZero(e)}t.exports=new r(`tag:yaml.org,2002:int`,{kind:`scalar`,resolve:s,construct:c,predicate:l,represent:{binary:function(e){return e>=0?`0b`+e.toString(2):`-0b`+e.toString(2).slice(1)},octal:function(e){return e>=0?`0`+e.toString(8):`-0`+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?`0x`+e.toString(16).toUpperCase():`-0x`+e.toString(16).toUpperCase().slice(1)}},defaultStyle:`decimal`,styleAliases:{binary:[2,`bin`],octal:[8,`oct`],decimal:[10,`dec`],hexadecimal:[16,`hex`]}})})),en=n(((e,t)=>{var n=Ut(),r=$(),i=RegExp(`^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function a(e){return!(e===null||!i.test(e)||e[e.length-1]===`_`)}function o(e){var t=e.replace(/_/g,``).toLowerCase(),n=t[0]===`-`?-1:1,r,i=[];return`+-`.indexOf(t[0])>=0&&(t=t.slice(1)),t===`.inf`?n===1?1/0:-1/0:t===`.nan`?NaN:t.indexOf(`:`)>=0?(t.split(`:`).forEach(function(e){i.unshift(parseFloat(e,10))}),t=0,r=1,i.forEach(function(e){t+=e*r,r*=60}),n*t):n*parseFloat(t,10)}var s=/^[-+]?[0-9]+e/;function c(e,t){var r;if(isNaN(e))switch(t){case`lowercase`:return`.nan`;case`uppercase`:return`.NAN`;case`camelcase`:return`.NaN`}else if(e===1/0)switch(t){case`lowercase`:return`.inf`;case`uppercase`:return`.INF`;case`camelcase`:return`.Inf`}else if(e===-1/0)switch(t){case`lowercase`:return`-.inf`;case`uppercase`:return`-.INF`;case`camelcase`:return`-.Inf`}else if(n.isNegativeZero(e))return`-0.0`;return r=e.toString(10),s.test(r)?r.replace(`e`,`.e`):r}function l(e){return Object.prototype.toString.call(e)===`[object Number]`&&(e%1!=0||n.isNegativeZero(e))}t.exports=new r(`tag:yaml.org,2002:float`,{kind:`scalar`,resolve:a,construct:o,predicate:l,represent:c,defaultStyle:`lowercase`})})),tn=n(((e,t)=>{t.exports=new(Kt())({include:[Xt()],implicit:[Zt(),Qt(),$t(),en()]})})),nn=n(((e,t)=>{t.exports=new(Kt())({include:[tn()]})})),rn=n(((e,t)=>{var n=$(),r=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),i=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function a(e){return e===null?!1:r.exec(e)!==null||i.exec(e)!==null}function o(e){var t,n,a,o,s,c,l,u=0,d=null,f,p,m;if(t=r.exec(e),t===null&&(t=i.exec(e)),t===null)throw Error(`Date resolve error`);if(n=+t[1],a=t[2]-1,o=+t[3],!t[4])return new Date(Date.UTC(n,a,o));if(s=+t[4],c=+t[5],l=+t[6],t[7]){for(u=t[7].slice(0,3);u.length<3;)u+=`0`;u=+u}return t[9]&&(f=+t[10],p=+(t[11]||0),d=(f*60+p)*6e4,t[9]===`-`&&(d=-d)),m=new Date(Date.UTC(n,a,o,s,c,l,u)),d&&m.setTime(m.getTime()-d),m}function s(e){return e.toISOString()}t.exports=new n(`tag:yaml.org,2002:timestamp`,{kind:`scalar`,resolve:a,construct:o,instanceOf:Date,represent:s})})),an=n(((e,t)=>{var n=$();function r(e){return e===`<<`||e===null}t.exports=new n(`tag:yaml.org,2002:merge`,{kind:`scalar`,resolve:r})})),on=n(((e,t)=>{var n;try{n=Q().Buffer}catch{}var r=$(),i=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function a(e){if(e===null)return!1;var t,n,r=0,a=e.length,o=i;for(n=0;n<a;n++)if(t=o.indexOf(e.charAt(n)),!(t>64)){if(t<0)return!1;r+=6}return r%8==0}function o(e){var t,r,a=e.replace(/[\r\n=]/g,``),o=a.length,s=i,c=0,l=[];for(t=0;t<o;t++)t%4==0&&t&&(l.push(c>>16&255),l.push(c>>8&255),l.push(c&255)),c=c<<6|s.indexOf(a.charAt(t));return r=o%4*6,r===0?(l.push(c>>16&255),l.push(c>>8&255),l.push(c&255)):r===18?(l.push(c>>10&255),l.push(c>>2&255)):r===12&&l.push(c>>4&255),n?n.from?n.from(l):new n(l):l}function s(e){var t=``,n=0,r,a,o=e.length,s=i;for(r=0;r<o;r++)r%3==0&&r&&(t+=s[n>>18&63],t+=s[n>>12&63],t+=s[n>>6&63],t+=s[n&63]),n=(n<<8)+e[r];return a=o%3,a===0?(t+=s[n>>18&63],t+=s[n>>12&63],t+=s[n>>6&63],t+=s[n&63]):a===2?(t+=s[n>>10&63],t+=s[n>>4&63],t+=s[n<<2&63],t+=s[64]):a===1&&(t+=s[n>>2&63],t+=s[n<<4&63],t+=s[64],t+=s[64]),t}function c(e){return n&&n.isBuffer(e)}t.exports=new r(`tag:yaml.org,2002:binary`,{kind:`scalar`,resolve:a,construct:o,predicate:c,represent:s})})),sn=n(((e,t)=>{var n=$(),r=Object.prototype.hasOwnProperty,i=Object.prototype.toString;function a(e){if(e===null)return!0;var t=[],n,a,o,s,c,l=e;for(n=0,a=l.length;n<a;n+=1){if(o=l[n],c=!1,i.call(o)!==`[object Object]`)return!1;for(s in o)if(r.call(o,s))if(!c)c=!0;else return!1;if(!c)return!1;if(t.indexOf(s)===-1)t.push(s);else return!1}return!0}function o(e){return e===null?[]:e}t.exports=new n(`tag:yaml.org,2002:omap`,{kind:`sequence`,resolve:a,construct:o})})),cn=n(((e,t)=>{var n=$(),r=Object.prototype.toString;function i(e){if(e===null)return!0;var t,n,i,a,o,s=e;for(o=Array(s.length),t=0,n=s.length;t<n;t+=1){if(i=s[t],r.call(i)!==`[object Object]`||(a=Object.keys(i),a.length!==1))return!1;o[t]=[a[0],i[a[0]]]}return!0}function a(e){if(e===null)return[];var t,n,r,i,a,o=e;for(a=Array(o.length),t=0,n=o.length;t<n;t+=1)r=o[t],i=Object.keys(r),a[t]=[i[0],r[i[0]]];return a}t.exports=new n(`tag:yaml.org,2002:pairs`,{kind:`sequence`,resolve:i,construct:a})})),ln=n(((e,t)=>{var n=$(),r=Object.prototype.hasOwnProperty;function i(e){if(e===null)return!0;var t,n=e;for(t in n)if(r.call(n,t)&&n[t]!==null)return!1;return!0}function a(e){return e===null?{}:e}t.exports=new n(`tag:yaml.org,2002:set`,{kind:`mapping`,resolve:i,construct:a})})),un=n(((e,t)=>{t.exports=new(Kt())({include:[nn()],implicit:[rn(),an()],explicit:[on(),sn(),cn(),ln()]})})),dn=n(((e,t)=>{var n=$();function r(){return!0}function i(){}function a(){return``}function o(e){return e===void 0}t.exports=new n(`tag:yaml.org,2002:js/undefined`,{kind:`scalar`,resolve:r,construct:i,predicate:o,represent:a})})),fn=n(((e,t)=>{var n=$();function r(e){if(e===null||e.length===0)return!1;var t=e,n=/\/([gim]*)$/.exec(e),r=``;return!(t[0]===`/`&&(n&&(r=n[1]),r.length>3||t[t.length-r.length-1]!==`/`))}function i(e){var t=e,n=/\/([gim]*)$/.exec(e),r=``;return t[0]===`/`&&(n&&(r=n[1]),t=t.slice(1,t.length-r.length-1)),new RegExp(t,r)}function a(e){var t=`/`+e.source+`/`;return e.global&&(t+=`g`),e.multiline&&(t+=`m`),e.ignoreCase&&(t+=`i`),t}function o(e){return Object.prototype.toString.call(e)===`[object RegExp]`}t.exports=new n(`tag:yaml.org,2002:js/regexp`,{kind:`scalar`,resolve:r,construct:i,predicate:o,represent:a})})),pn=n(((e,t)=>{(function(n,r){typeof e==`object`&&typeof t==`object`?t.exports=r():typeof define==`function`&&define.amd?define([],r):typeof e==`object`?e.esprima=r():n.esprima=r()})(e,function(){return(function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}return n.m=e,n.c=t,n.p=``,n(0)})([function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(1),i=n(3),a=n(8),o=n(15);function s(e,t,n){var o=null,s=function(e,t){n&&n(e,t),o&&o.visit(e,t)},c=typeof n==`function`?s:null,l=!1;if(t){l=typeof t.comment==`boolean`&&t.comment;var u=typeof t.attachComment==`boolean`&&t.attachComment;(l||u)&&(o=new r.CommentHandler,o.attach=u,t.comment=!0,c=s)}var d=!1;t&&typeof t.sourceType==`string`&&(d=t.sourceType===`module`);var f=t&&typeof t.jsx==`boolean`&&t.jsx?new i.JSXParser(e,t,c):new a.Parser(e,t,c),p=d?f.parseModule():f.parseScript();return l&&o&&(p.comments=o.comments),f.config.tokens&&(p.tokens=f.tokens),f.config.tolerant&&(p.errors=f.errorHandler.errors),p}t.parse=s;function c(e,t,n){var r=t||{};return r.sourceType=`module`,s(e,r,n)}t.parseModule=c;function l(e,t,n){var r=t||{};return r.sourceType=`script`,s(e,r,n)}t.parseScript=l;function u(e,t,n){var r=new o.Tokenizer(e,t),i=[];try{for(;;){var a=r.getNextToken();if(!a)break;n&&(a=n(a)),i.push(a)}}catch(e){r.errorHandler.tolerate(e)}return r.errorHandler.tolerant&&(i.errors=r.errors()),i}t.tokenize=u,t.Syntax=n(2).Syntax,t.version=`4.0.1`},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(2);t.CommentHandler=function(){function e(){this.attach=!1,this.comments=[],this.stack=[],this.leading=[],this.trailing=[]}return e.prototype.insertInnerComments=function(e,t){if(e.type===r.Syntax.BlockStatement&&e.body.length===0){for(var n=[],i=this.leading.length-1;i>=0;--i){var a=this.leading[i];t.end.offset>=a.start&&(n.unshift(a.comment),this.leading.splice(i,1),this.trailing.splice(i,1))}n.length&&(e.innerComments=n)}},e.prototype.findTrailingComments=function(e){var t=[];if(this.trailing.length>0){for(var n=this.trailing.length-1;n>=0;--n){var r=this.trailing[n];r.start>=e.end.offset&&t.unshift(r.comment)}return this.trailing.length=0,t}var i=this.stack[this.stack.length-1];if(i&&i.node.trailingComments){var a=i.node.trailingComments[0];a&&a.range[0]>=e.end.offset&&(t=i.node.trailingComments,delete i.node.trailingComments)}return t},e.prototype.findLeadingComments=function(e){for(var t=[],n;this.stack.length>0;){var r=this.stack[this.stack.length-1];if(r&&r.start>=e.start.offset)n=r.node,this.stack.pop();else break}if(n){for(var i=(n.leadingComments?n.leadingComments.length:0)-1;i>=0;--i){var a=n.leadingComments[i];a.range[1]<=e.start.offset&&(t.unshift(a),n.leadingComments.splice(i,1))}return n.leadingComments&&n.leadingComments.length===0&&delete n.leadingComments,t}for(var i=this.leading.length-1;i>=0;--i){var r=this.leading[i];r.start<=e.start.offset&&(t.unshift(r.comment),this.leading.splice(i,1))}return t},e.prototype.visitNode=function(e,t){if(!(e.type===r.Syntax.Program&&e.body.length>0)){this.insertInnerComments(e,t);var n=this.findTrailingComments(t),i=this.findLeadingComments(t);i.length>0&&(e.leadingComments=i),n.length>0&&(e.trailingComments=n),this.stack.push({node:e,start:t.start.offset})}},e.prototype.visitComment=function(e,t){var n=e.type[0]===`L`?`Line`:`Block`,r={type:n,value:e.value};if(e.range&&(r.range=e.range),e.loc&&(r.loc=e.loc),this.comments.push(r),this.attach){var i={comment:{type:n,value:e.value,range:[t.start.offset,t.end.offset]},start:t.start.offset};e.loc&&(i.comment.loc=e.loc),e.type=n,this.leading.push(i),this.trailing.push(i)}},e.prototype.visit=function(e,t){e.type===`LineComment`||e.type===`BlockComment`?this.visitComment(e,t):this.attach&&this.visitNode(e,t)},e}()},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.Syntax={AssignmentExpression:`AssignmentExpression`,AssignmentPattern:`AssignmentPattern`,ArrayExpression:`ArrayExpression`,ArrayPattern:`ArrayPattern`,ArrowFunctionExpression:`ArrowFunctionExpression`,AwaitExpression:`AwaitExpression`,BlockStatement:`BlockStatement`,BinaryExpression:`BinaryExpression`,BreakStatement:`BreakStatement`,CallExpression:`CallExpression`,CatchClause:`CatchClause`,ClassBody:`ClassBody`,ClassDeclaration:`ClassDeclaration`,ClassExpression:`ClassExpression`,ConditionalExpression:`ConditionalExpression`,ContinueStatement:`ContinueStatement`,DoWhileStatement:`DoWhileStatement`,DebuggerStatement:`DebuggerStatement`,EmptyStatement:`EmptyStatement`,ExportAllDeclaration:`ExportAllDeclaration`,ExportDefaultDeclaration:`ExportDefaultDeclaration`,ExportNamedDeclaration:`ExportNamedDeclaration`,ExportSpecifier:`ExportSpecifier`,ExpressionStatement:`ExpressionStatement`,ForStatement:`ForStatement`,ForOfStatement:`ForOfStatement`,ForInStatement:`ForInStatement`,FunctionDeclaration:`FunctionDeclaration`,FunctionExpression:`FunctionExpression`,Identifier:`Identifier`,IfStatement:`IfStatement`,ImportDeclaration:`ImportDeclaration`,ImportDefaultSpecifier:`ImportDefaultSpecifier`,ImportNamespaceSpecifier:`ImportNamespaceSpecifier`,ImportSpecifier:`ImportSpecifier`,Literal:`Literal`,LabeledStatement:`LabeledStatement`,LogicalExpression:`LogicalExpression`,MemberExpression:`MemberExpression`,MetaProperty:`MetaProperty`,MethodDefinition:`MethodDefinition`,NewExpression:`NewExpression`,ObjectExpression:`ObjectExpression`,ObjectPattern:`ObjectPattern`,Program:`Program`,Property:`Property`,RestElement:`RestElement`,ReturnStatement:`ReturnStatement`,SequenceExpression:`SequenceExpression`,SpreadElement:`SpreadElement`,Super:`Super`,SwitchCase:`SwitchCase`,SwitchStatement:`SwitchStatement`,TaggedTemplateExpression:`TaggedTemplateExpression`,TemplateElement:`TemplateElement`,TemplateLiteral:`TemplateLiteral`,ThisExpression:`ThisExpression`,ThrowStatement:`ThrowStatement`,TryStatement:`TryStatement`,UnaryExpression:`UnaryExpression`,UpdateExpression:`UpdateExpression`,VariableDeclaration:`VariableDeclaration`,VariableDeclarator:`VariableDeclarator`,WhileStatement:`WhileStatement`,WithStatement:`WithStatement`,YieldExpression:`YieldExpression`}},function(e,t,n){var r=this&&this.__extends||(function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])};return function(t,n){e(t,n);function r(){this.constructor=t}t.prototype=n===null?Object.create(n):(r.prototype=n.prototype,new r)}})();Object.defineProperty(t,`__esModule`,{value:!0});var i=n(4),a=n(5),o=n(6),s=n(7),c=n(8),l=n(13),u=n(14);l.TokenName[100]=`JSXIdentifier`,l.TokenName[101]=`JSXText`;function d(e){var t;switch(e.type){case o.JSXSyntax.JSXIdentifier:t=e.name;break;case o.JSXSyntax.JSXNamespacedName:var n=e;t=d(n.namespace)+`:`+d(n.name);break;case o.JSXSyntax.JSXMemberExpression:var r=e;t=d(r.object)+`.`+d(r.property);break;default:break}return t}t.JSXParser=function(e){r(t,e);function t(t,n,r){return e.call(this,t,n,r)||this}return t.prototype.parsePrimaryExpression=function(){return this.match(`<`)?this.parseJSXRoot():e.prototype.parsePrimaryExpression.call(this)},t.prototype.startJSX=function(){this.scanner.index=this.startMarker.index,this.scanner.lineNumber=this.startMarker.line,this.scanner.lineStart=this.startMarker.index-this.startMarker.column},t.prototype.finishJSX=function(){this.nextToken()},t.prototype.reenterJSX=function(){this.startJSX(),this.expectJSX(`}`),this.config.tokens&&this.tokens.pop()},t.prototype.createJSXNode=function(){return this.collectComments(),{index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}},t.prototype.createJSXChildNode=function(){return{index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}},t.prototype.scanXHTMLEntity=function(e){for(var t=`&`,n=!0,r=!1,a=!1,o=!1;!this.scanner.eof()&&n&&!r;){var s=this.scanner.source[this.scanner.index];if(s===e)break;if(r=s===`;`,t+=s,++this.scanner.index,!r)switch(t.length){case 2:a=s===`#`;break;case 3:a&&(o=s===`x`,n=o||i.Character.isDecimalDigit(s.charCodeAt(0)),a&&=!o);break;default:n&&=!(a&&!i.Character.isDecimalDigit(s.charCodeAt(0))),n&&=!(o&&!i.Character.isHexDigit(s.charCodeAt(0)));break}}if(n&&r&&t.length>2){var c=t.substr(1,t.length-2);a&&c.length>1?t=String.fromCharCode(parseInt(c.substr(1),10)):o&&c.length>2?t=String.fromCharCode(parseInt(`0`+c.substr(1),16)):!a&&!o&&u.XHTMLEntities[c]&&(t=u.XHTMLEntities[c])}return t},t.prototype.lexJSX=function(){var e=this.scanner.source.charCodeAt(this.scanner.index);if(e===60||e===62||e===47||e===58||e===61||e===123||e===125){var t=this.scanner.source[this.scanner.index++];return{type:7,value:t,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:this.scanner.index-1,end:this.scanner.index}}if(e===34||e===39){for(var n=this.scanner.index,r=this.scanner.source[this.scanner.index++],a=``;!this.scanner.eof();){var o=this.scanner.source[this.scanner.index++];if(o===r)break;o===`&`?a+=this.scanXHTMLEntity(r):a+=o}return{type:8,value:a,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:n,end:this.scanner.index}}if(e===46){var s=this.scanner.source.charCodeAt(this.scanner.index+1),c=this.scanner.source.charCodeAt(this.scanner.index+2),t=s===46&&c===46?`...`:`.`,n=this.scanner.index;return this.scanner.index+=t.length,{type:7,value:t,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:n,end:this.scanner.index}}if(e===96)return{type:10,value:``,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:this.scanner.index,end:this.scanner.index};if(i.Character.isIdentifierStart(e)&&e!==92){var n=this.scanner.index;for(++this.scanner.index;!this.scanner.eof();){var o=this.scanner.source.charCodeAt(this.scanner.index);if(i.Character.isIdentifierPart(o)&&o!==92)++this.scanner.index;else if(o===45)++this.scanner.index;else break}return{type:100,value:this.scanner.source.slice(n,this.scanner.index),lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:n,end:this.scanner.index}}return this.scanner.lex()},t.prototype.nextJSXToken=function(){this.collectComments(),this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart;var e=this.lexJSX();return this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.config.tokens&&this.tokens.push(this.convertToken(e)),e},t.prototype.nextJSXText=function(){this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart;for(var e=this.scanner.index,t=``;!this.scanner.eof();){var n=this.scanner.source[this.scanner.index];if(n===`{`||n===`<`)break;++this.scanner.index,t+=n,i.Character.isLineTerminator(n.charCodeAt(0))&&(++this.scanner.lineNumber,n===`\r`&&this.scanner.source[this.scanner.index]===`
`&&++this.scanner.index,this.scanner.lineStart=this.scanner.index)}this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart;var r={type:101,value:t,lineNumber:this.scanner.lineNumber,lineStart:this.scanner.lineStart,start:e,end:this.scanner.index};return t.length>0&&this.config.tokens&&this.tokens.push(this.convertToken(r)),r},t.prototype.peekJSXToken=function(){var e=this.scanner.saveState();this.scanner.scanComments();var t=this.lexJSX();return this.scanner.restoreState(e),t},t.prototype.expectJSX=function(e){var t=this.nextJSXToken();(t.type!==7||t.value!==e)&&this.throwUnexpectedToken(t)},t.prototype.matchJSX=function(e){var t=this.peekJSXToken();return t.type===7&&t.value===e},t.prototype.parseJSXIdentifier=function(){var e=this.createJSXNode(),t=this.nextJSXToken();return t.type!==100&&this.throwUnexpectedToken(t),this.finalize(e,new a.JSXIdentifier(t.value))},t.prototype.parseJSXElementName=function(){var e=this.createJSXNode(),t=this.parseJSXIdentifier();if(this.matchJSX(`:`)){var n=t;this.expectJSX(`:`);var r=this.parseJSXIdentifier();t=this.finalize(e,new a.JSXNamespacedName(n,r))}else if(this.matchJSX(`.`))for(;this.matchJSX(`.`);){var i=t;this.expectJSX(`.`);var o=this.parseJSXIdentifier();t=this.finalize(e,new a.JSXMemberExpression(i,o))}return t},t.prototype.parseJSXAttributeName=function(){var e=this.createJSXNode(),t,n=this.parseJSXIdentifier();if(this.matchJSX(`:`)){var r=n;this.expectJSX(`:`);var i=this.parseJSXIdentifier();t=this.finalize(e,new a.JSXNamespacedName(r,i))}else t=n;return t},t.prototype.parseJSXStringLiteralAttribute=function(){var e=this.createJSXNode(),t=this.nextJSXToken();t.type!==8&&this.throwUnexpectedToken(t);var n=this.getTokenRaw(t);return this.finalize(e,new s.Literal(t.value,n))},t.prototype.parseJSXExpressionAttribute=function(){var e=this.createJSXNode();this.expectJSX(`{`),this.finishJSX(),this.match(`}`)&&this.tolerateError(`JSX attributes must only be assigned a non-empty expression`);var t=this.parseAssignmentExpression();return this.reenterJSX(),this.finalize(e,new a.JSXExpressionContainer(t))},t.prototype.parseJSXAttributeValue=function(){return this.matchJSX(`{`)?this.parseJSXExpressionAttribute():this.matchJSX(`<`)?this.parseJSXElement():this.parseJSXStringLiteralAttribute()},t.prototype.parseJSXNameValueAttribute=function(){var e=this.createJSXNode(),t=this.parseJSXAttributeName(),n=null;return this.matchJSX(`=`)&&(this.expectJSX(`=`),n=this.parseJSXAttributeValue()),this.finalize(e,new a.JSXAttribute(t,n))},t.prototype.parseJSXSpreadAttribute=function(){var e=this.createJSXNode();this.expectJSX(`{`),this.expectJSX(`...`),this.finishJSX();var t=this.parseAssignmentExpression();return this.reenterJSX(),this.finalize(e,new a.JSXSpreadAttribute(t))},t.prototype.parseJSXAttributes=function(){for(var e=[];!this.matchJSX(`/`)&&!this.matchJSX(`>`);){var t=this.matchJSX(`{`)?this.parseJSXSpreadAttribute():this.parseJSXNameValueAttribute();e.push(t)}return e},t.prototype.parseJSXOpeningElement=function(){var e=this.createJSXNode();this.expectJSX(`<`);var t=this.parseJSXElementName(),n=this.parseJSXAttributes(),r=this.matchJSX(`/`);return r&&this.expectJSX(`/`),this.expectJSX(`>`),this.finalize(e,new a.JSXOpeningElement(t,r,n))},t.prototype.parseJSXBoundaryElement=function(){var e=this.createJSXNode();if(this.expectJSX(`<`),this.matchJSX(`/`)){this.expectJSX(`/`);var t=this.parseJSXElementName();return this.expectJSX(`>`),this.finalize(e,new a.JSXClosingElement(t))}var n=this.parseJSXElementName(),r=this.parseJSXAttributes(),i=this.matchJSX(`/`);return i&&this.expectJSX(`/`),this.expectJSX(`>`),this.finalize(e,new a.JSXOpeningElement(n,i,r))},t.prototype.parseJSXEmptyExpression=function(){var e=this.createJSXChildNode();return this.collectComments(),this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.finalize(e,new a.JSXEmptyExpression)},t.prototype.parseJSXExpressionContainer=function(){var e=this.createJSXNode();this.expectJSX(`{`);var t;return this.matchJSX(`}`)?(t=this.parseJSXEmptyExpression(),this.expectJSX(`}`)):(this.finishJSX(),t=this.parseAssignmentExpression(),this.reenterJSX()),this.finalize(e,new a.JSXExpressionContainer(t))},t.prototype.parseJSXChildren=function(){for(var e=[];!this.scanner.eof();){var t=this.createJSXChildNode(),n=this.nextJSXText();if(n.start<n.end){var r=this.getTokenRaw(n),i=this.finalize(t,new a.JSXText(n.value,r));e.push(i)}if(this.scanner.source[this.scanner.index]===`{`){var o=this.parseJSXExpressionContainer();e.push(o)}else break}return e},t.prototype.parseComplexJSXElement=function(e){for(var t=[];!this.scanner.eof();){e.children=e.children.concat(this.parseJSXChildren());var n=this.createJSXChildNode(),r=this.parseJSXBoundaryElement();if(r.type===o.JSXSyntax.JSXOpeningElement){var i=r;if(i.selfClosing){var s=this.finalize(n,new a.JSXElement(i,[],null));e.children.push(s)}else t.push(e),e={node:n,opening:i,closing:null,children:[]}}if(r.type===o.JSXSyntax.JSXClosingElement){e.closing=r;var c=d(e.opening.name);if(c!==d(e.closing.name)&&this.tolerateError(`Expected corresponding JSX closing tag for %0`,c),t.length>0){var s=this.finalize(e.node,new a.JSXElement(e.opening,e.children,e.closing));e=t[t.length-1],e.children.push(s),t.pop()}else break}}return e},t.prototype.parseJSXElement=function(){var e=this.createJSXNode(),t=this.parseJSXOpeningElement(),n=[],r=null;if(!t.selfClosing){var i=this.parseComplexJSXElement({node:e,opening:t,closing:r,children:n});n=i.children,r=i.closing}return this.finalize(e,new a.JSXElement(t,n,r))},t.prototype.parseJSXRoot=function(){this.config.tokens&&this.tokens.pop(),this.startJSX();var e=this.parseJSXElement();return this.finishJSX(),e},t.prototype.isStartOfExpression=function(){return e.prototype.isStartOfExpression.call(this)||this.match(`<`)},t}(c.Parser)},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0});var n={NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,NonAsciiIdentifierPart:/[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/};t.Character={fromCodePoint:function(e){return e<65536?String.fromCharCode(e):String.fromCharCode(55296+(e-65536>>10))+String.fromCharCode(56320+(e-65536&1023))},isWhiteSpace:function(e){return e===32||e===9||e===11||e===12||e===160||e>=5760&&[5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(e)>=0},isLineTerminator:function(e){return e===10||e===13||e===8232||e===8233},isIdentifierStart:function(e){return e===36||e===95||e>=65&&e<=90||e>=97&&e<=122||e===92||e>=128&&n.NonAsciiIdentifierStart.test(t.Character.fromCodePoint(e))},isIdentifierPart:function(e){return e===36||e===95||e>=65&&e<=90||e>=97&&e<=122||e>=48&&e<=57||e===92||e>=128&&n.NonAsciiIdentifierPart.test(t.Character.fromCodePoint(e))},isDecimalDigit:function(e){return e>=48&&e<=57},isHexDigit:function(e){return e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102},isOctalDigit:function(e){return e>=48&&e<=55}}},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(6);t.JSXClosingElement=function(){function e(e){this.type=r.JSXSyntax.JSXClosingElement,this.name=e}return e}(),t.JSXElement=function(){function e(e,t,n){this.type=r.JSXSyntax.JSXElement,this.openingElement=e,this.children=t,this.closingElement=n}return e}(),t.JSXEmptyExpression=function(){function e(){this.type=r.JSXSyntax.JSXEmptyExpression}return e}(),t.JSXExpressionContainer=function(){function e(e){this.type=r.JSXSyntax.JSXExpressionContainer,this.expression=e}return e}(),t.JSXIdentifier=function(){function e(e){this.type=r.JSXSyntax.JSXIdentifier,this.name=e}return e}(),t.JSXMemberExpression=function(){function e(e,t){this.type=r.JSXSyntax.JSXMemberExpression,this.object=e,this.property=t}return e}(),t.JSXAttribute=function(){function e(e,t){this.type=r.JSXSyntax.JSXAttribute,this.name=e,this.value=t}return e}(),t.JSXNamespacedName=function(){function e(e,t){this.type=r.JSXSyntax.JSXNamespacedName,this.namespace=e,this.name=t}return e}(),t.JSXOpeningElement=function(){function e(e,t,n){this.type=r.JSXSyntax.JSXOpeningElement,this.name=e,this.selfClosing=t,this.attributes=n}return e}(),t.JSXSpreadAttribute=function(){function e(e){this.type=r.JSXSyntax.JSXSpreadAttribute,this.argument=e}return e}(),t.JSXText=function(){function e(e,t){this.type=r.JSXSyntax.JSXText,this.value=e,this.raw=t}return e}()},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.JSXSyntax={JSXAttribute:`JSXAttribute`,JSXClosingElement:`JSXClosingElement`,JSXElement:`JSXElement`,JSXEmptyExpression:`JSXEmptyExpression`,JSXExpressionContainer:`JSXExpressionContainer`,JSXIdentifier:`JSXIdentifier`,JSXMemberExpression:`JSXMemberExpression`,JSXNamespacedName:`JSXNamespacedName`,JSXOpeningElement:`JSXOpeningElement`,JSXSpreadAttribute:`JSXSpreadAttribute`,JSXText:`JSXText`}},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(2);t.ArrayExpression=function(){function e(e){this.type=r.Syntax.ArrayExpression,this.elements=e}return e}(),t.ArrayPattern=function(){function e(e){this.type=r.Syntax.ArrayPattern,this.elements=e}return e}(),t.ArrowFunctionExpression=function(){function e(e,t,n){this.type=r.Syntax.ArrowFunctionExpression,this.id=null,this.params=e,this.body=t,this.generator=!1,this.expression=n,this.async=!1}return e}(),t.AssignmentExpression=function(){function e(e,t,n){this.type=r.Syntax.AssignmentExpression,this.operator=e,this.left=t,this.right=n}return e}(),t.AssignmentPattern=function(){function e(e,t){this.type=r.Syntax.AssignmentPattern,this.left=e,this.right=t}return e}(),t.AsyncArrowFunctionExpression=function(){function e(e,t,n){this.type=r.Syntax.ArrowFunctionExpression,this.id=null,this.params=e,this.body=t,this.generator=!1,this.expression=n,this.async=!0}return e}(),t.AsyncFunctionDeclaration=function(){function e(e,t,n){this.type=r.Syntax.FunctionDeclaration,this.id=e,this.params=t,this.body=n,this.generator=!1,this.expression=!1,this.async=!0}return e}(),t.AsyncFunctionExpression=function(){function e(e,t,n){this.type=r.Syntax.FunctionExpression,this.id=e,this.params=t,this.body=n,this.generator=!1,this.expression=!1,this.async=!0}return e}(),t.AwaitExpression=function(){function e(e){this.type=r.Syntax.AwaitExpression,this.argument=e}return e}(),t.BinaryExpression=function(){function e(e,t,n){this.type=e===`||`||e===`&&`?r.Syntax.LogicalExpression:r.Syntax.BinaryExpression,this.operator=e,this.left=t,this.right=n}return e}(),t.BlockStatement=function(){function e(e){this.type=r.Syntax.BlockStatement,this.body=e}return e}(),t.BreakStatement=function(){function e(e){this.type=r.Syntax.BreakStatement,this.label=e}return e}(),t.CallExpression=function(){function e(e,t){this.type=r.Syntax.CallExpression,this.callee=e,this.arguments=t}return e}(),t.CatchClause=function(){function e(e,t){this.type=r.Syntax.CatchClause,this.param=e,this.body=t}return e}(),t.ClassBody=function(){function e(e){this.type=r.Syntax.ClassBody,this.body=e}return e}(),t.ClassDeclaration=function(){function e(e,t,n){this.type=r.Syntax.ClassDeclaration,this.id=e,this.superClass=t,this.body=n}return e}(),t.ClassExpression=function(){function e(e,t,n){this.type=r.Syntax.ClassExpression,this.id=e,this.superClass=t,this.body=n}return e}(),t.ComputedMemberExpression=function(){function e(e,t){this.type=r.Syntax.MemberExpression,this.computed=!0,this.object=e,this.property=t}return e}(),t.ConditionalExpression=function(){function e(e,t,n){this.type=r.Syntax.ConditionalExpression,this.test=e,this.consequent=t,this.alternate=n}return e}(),t.ContinueStatement=function(){function e(e){this.type=r.Syntax.ContinueStatement,this.label=e}return e}(),t.DebuggerStatement=function(){function e(){this.type=r.Syntax.DebuggerStatement}return e}(),t.Directive=function(){function e(e,t){this.type=r.Syntax.ExpressionStatement,this.expression=e,this.directive=t}return e}(),t.DoWhileStatement=function(){function e(e,t){this.type=r.Syntax.DoWhileStatement,this.body=e,this.test=t}return e}(),t.EmptyStatement=function(){function e(){this.type=r.Syntax.EmptyStatement}return e}(),t.ExportAllDeclaration=function(){function e(e){this.type=r.Syntax.ExportAllDeclaration,this.source=e}return e}(),t.ExportDefaultDeclaration=function(){function e(e){this.type=r.Syntax.ExportDefaultDeclaration,this.declaration=e}return e}(),t.ExportNamedDeclaration=function(){function e(e,t,n){this.type=r.Syntax.ExportNamedDeclaration,this.declaration=e,this.specifiers=t,this.source=n}return e}(),t.ExportSpecifier=function(){function e(e,t){this.type=r.Syntax.ExportSpecifier,this.exported=t,this.local=e}return e}(),t.ExpressionStatement=function(){function e(e){this.type=r.Syntax.ExpressionStatement,this.expression=e}return e}(),t.ForInStatement=function(){function e(e,t,n){this.type=r.Syntax.ForInStatement,this.left=e,this.right=t,this.body=n,this.each=!1}return e}(),t.ForOfStatement=function(){function e(e,t,n){this.type=r.Syntax.ForOfStatement,this.left=e,this.right=t,this.body=n}return e}(),t.ForStatement=function(){function e(e,t,n,i){this.type=r.Syntax.ForStatement,this.init=e,this.test=t,this.update=n,this.body=i}return e}(),t.FunctionDeclaration=function(){function e(e,t,n,i){this.type=r.Syntax.FunctionDeclaration,this.id=e,this.params=t,this.body=n,this.generator=i,this.expression=!1,this.async=!1}return e}(),t.FunctionExpression=function(){function e(e,t,n,i){this.type=r.Syntax.FunctionExpression,this.id=e,this.params=t,this.body=n,this.generator=i,this.expression=!1,this.async=!1}return e}(),t.Identifier=function(){function e(e){this.type=r.Syntax.Identifier,this.name=e}return e}(),t.IfStatement=function(){function e(e,t,n){this.type=r.Syntax.IfStatement,this.test=e,this.consequent=t,this.alternate=n}return e}(),t.ImportDeclaration=function(){function e(e,t){this.type=r.Syntax.ImportDeclaration,this.specifiers=e,this.source=t}return e}(),t.ImportDefaultSpecifier=function(){function e(e){this.type=r.Syntax.ImportDefaultSpecifier,this.local=e}return e}(),t.ImportNamespaceSpecifier=function(){function e(e){this.type=r.Syntax.ImportNamespaceSpecifier,this.local=e}return e}(),t.ImportSpecifier=function(){function e(e,t){this.type=r.Syntax.ImportSpecifier,this.local=e,this.imported=t}return e}(),t.LabeledStatement=function(){function e(e,t){this.type=r.Syntax.LabeledStatement,this.label=e,this.body=t}return e}(),t.Literal=function(){function e(e,t){this.type=r.Syntax.Literal,this.value=e,this.raw=t}return e}(),t.MetaProperty=function(){function e(e,t){this.type=r.Syntax.MetaProperty,this.meta=e,this.property=t}return e}(),t.MethodDefinition=function(){function e(e,t,n,i,a){this.type=r.Syntax.MethodDefinition,this.key=e,this.computed=t,this.value=n,this.kind=i,this.static=a}return e}(),t.Module=function(){function e(e){this.type=r.Syntax.Program,this.body=e,this.sourceType=`module`}return e}(),t.NewExpression=function(){function e(e,t){this.type=r.Syntax.NewExpression,this.callee=e,this.arguments=t}return e}(),t.ObjectExpression=function(){function e(e){this.type=r.Syntax.ObjectExpression,this.properties=e}return e}(),t.ObjectPattern=function(){function e(e){this.type=r.Syntax.ObjectPattern,this.properties=e}return e}(),t.Property=function(){function e(e,t,n,i,a,o){this.type=r.Syntax.Property,this.key=t,this.computed=n,this.value=i,this.kind=e,this.method=a,this.shorthand=o}return e}(),t.RegexLiteral=function(){function e(e,t,n,i){this.type=r.Syntax.Literal,this.value=e,this.raw=t,this.regex={pattern:n,flags:i}}return e}(),t.RestElement=function(){function e(e){this.type=r.Syntax.RestElement,this.argument=e}return e}(),t.ReturnStatement=function(){function e(e){this.type=r.Syntax.ReturnStatement,this.argument=e}return e}(),t.Script=function(){function e(e){this.type=r.Syntax.Program,this.body=e,this.sourceType=`script`}return e}(),t.SequenceExpression=function(){function e(e){this.type=r.Syntax.SequenceExpression,this.expressions=e}return e}(),t.SpreadElement=function(){function e(e){this.type=r.Syntax.SpreadElement,this.argument=e}return e}(),t.StaticMemberExpression=function(){function e(e,t){this.type=r.Syntax.MemberExpression,this.computed=!1,this.object=e,this.property=t}return e}(),t.Super=function(){function e(){this.type=r.Syntax.Super}return e}(),t.SwitchCase=function(){function e(e,t){this.type=r.Syntax.SwitchCase,this.test=e,this.consequent=t}return e}(),t.SwitchStatement=function(){function e(e,t){this.type=r.Syntax.SwitchStatement,this.discriminant=e,this.cases=t}return e}(),t.TaggedTemplateExpression=function(){function e(e,t){this.type=r.Syntax.TaggedTemplateExpression,this.tag=e,this.quasi=t}return e}(),t.TemplateElement=function(){function e(e,t){this.type=r.Syntax.TemplateElement,this.value=e,this.tail=t}return e}(),t.TemplateLiteral=function(){function e(e,t){this.type=r.Syntax.TemplateLiteral,this.quasis=e,this.expressions=t}return e}(),t.ThisExpression=function(){function e(){this.type=r.Syntax.ThisExpression}return e}(),t.ThrowStatement=function(){function e(e){this.type=r.Syntax.ThrowStatement,this.argument=e}return e}(),t.TryStatement=function(){function e(e,t,n){this.type=r.Syntax.TryStatement,this.block=e,this.handler=t,this.finalizer=n}return e}(),t.UnaryExpression=function(){function e(e,t){this.type=r.Syntax.UnaryExpression,this.operator=e,this.argument=t,this.prefix=!0}return e}(),t.UpdateExpression=function(){function e(e,t,n){this.type=r.Syntax.UpdateExpression,this.operator=e,this.argument=t,this.prefix=n}return e}(),t.VariableDeclaration=function(){function e(e,t){this.type=r.Syntax.VariableDeclaration,this.declarations=e,this.kind=t}return e}(),t.VariableDeclarator=function(){function e(e,t){this.type=r.Syntax.VariableDeclarator,this.id=e,this.init=t}return e}(),t.WhileStatement=function(){function e(e,t){this.type=r.Syntax.WhileStatement,this.test=e,this.body=t}return e}(),t.WithStatement=function(){function e(e,t){this.type=r.Syntax.WithStatement,this.object=e,this.body=t}return e}(),t.YieldExpression=function(){function e(e,t){this.type=r.Syntax.YieldExpression,this.argument=e,this.delegate=t}return e}()},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(9),i=n(10),a=n(11),o=n(7),s=n(12),c=n(2),l=n(13),u=`ArrowParameterPlaceHolder`;t.Parser=function(){function e(e,t,n){t===void 0&&(t={}),this.config={range:typeof t.range==`boolean`&&t.range,loc:typeof t.loc==`boolean`&&t.loc,source:null,tokens:typeof t.tokens==`boolean`&&t.tokens,comment:typeof t.comment==`boolean`&&t.comment,tolerant:typeof t.tolerant==`boolean`&&t.tolerant},this.config.loc&&t.source&&t.source!==null&&(this.config.source=String(t.source)),this.delegate=n,this.errorHandler=new i.ErrorHandler,this.errorHandler.tolerant=this.config.tolerant,this.scanner=new s.Scanner(e,this.errorHandler),this.scanner.trackComment=this.config.comment,this.operatorPrecedence={")":0,";":0,",":0,"=":0,"]":0,"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"===":6,"!==":6,"<":7,">":7,"<=":7,">=":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":11,"/":11,"%":11},this.lookahead={type:2,value:``,lineNumber:this.scanner.lineNumber,lineStart:0,start:0,end:0},this.hasLineTerminator=!1,this.context={isModule:!1,await:!1,allowIn:!0,allowStrictDirective:!0,allowYield:!0,firstCoverInitializedNameError:null,isAssignmentTarget:!1,isBindingElement:!1,inFunctionBody:!1,inIteration:!1,inSwitch:!1,labelSet:{},strict:!1},this.tokens=[],this.startMarker={index:0,line:this.scanner.lineNumber,column:0},this.lastMarker={index:0,line:this.scanner.lineNumber,column:0},this.nextToken(),this.lastMarker={index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}return e.prototype.throwError=function(e){var t=Array.prototype.slice.call(arguments,1),n=e.replace(/%(\d)/g,function(e,n){return r.assert(n<t.length,`Message reference must be in range`),t[n]}),i=this.lastMarker.index,a=this.lastMarker.line,o=this.lastMarker.column+1;throw this.errorHandler.createError(i,a,o,n)},e.prototype.tolerateError=function(e){var t=Array.prototype.slice.call(arguments,1),n=e.replace(/%(\d)/g,function(e,n){return r.assert(n<t.length,`Message reference must be in range`),t[n]}),i=this.lastMarker.index,a=this.scanner.lineNumber,o=this.lastMarker.column+1;this.errorHandler.tolerateError(i,a,o,n)},e.prototype.unexpectedTokenError=function(e,t){var n=t||a.Messages.UnexpectedToken,r;if(e?(t||(n=e.type===2?a.Messages.UnexpectedEOS:e.type===3?a.Messages.UnexpectedIdentifier:e.type===6?a.Messages.UnexpectedNumber:e.type===8?a.Messages.UnexpectedString:e.type===10?a.Messages.UnexpectedTemplate:a.Messages.UnexpectedToken,e.type===4&&(this.scanner.isFutureReservedWord(e.value)?n=a.Messages.UnexpectedReserved:this.context.strict&&this.scanner.isStrictModeReservedWord(e.value)&&(n=a.Messages.StrictReservedWord))),r=e.value):r=`ILLEGAL`,n=n.replace(`%0`,r),e&&typeof e.lineNumber==`number`){var i=e.start,o=e.lineNumber,s=this.lastMarker.index-this.lastMarker.column,c=e.start-s+1;return this.errorHandler.createError(i,o,c,n)}else{var i=this.lastMarker.index,o=this.lastMarker.line,c=this.lastMarker.column+1;return this.errorHandler.createError(i,o,c,n)}},e.prototype.throwUnexpectedToken=function(e,t){throw this.unexpectedTokenError(e,t)},e.prototype.tolerateUnexpectedToken=function(e,t){this.errorHandler.tolerate(this.unexpectedTokenError(e,t))},e.prototype.collectComments=function(){if(!this.config.comment)this.scanner.scanComments();else{var e=this.scanner.scanComments();if(e.length>0&&this.delegate)for(var t=0;t<e.length;++t){var n=e[t],r=void 0;r={type:n.multiLine?`BlockComment`:`LineComment`,value:this.scanner.source.slice(n.slice[0],n.slice[1])},this.config.range&&(r.range=n.range),this.config.loc&&(r.loc=n.loc);var i={start:{line:n.loc.start.line,column:n.loc.start.column,offset:n.range[0]},end:{line:n.loc.end.line,column:n.loc.end.column,offset:n.range[1]}};this.delegate(r,i)}}},e.prototype.getTokenRaw=function(e){return this.scanner.source.slice(e.start,e.end)},e.prototype.convertToken=function(e){var t={type:l.TokenName[e.type],value:this.getTokenRaw(e)};return this.config.range&&(t.range=[e.start,e.end]),this.config.loc&&(t.loc={start:{line:this.startMarker.line,column:this.startMarker.column},end:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}),e.type===9&&(t.regex={pattern:e.pattern,flags:e.flags}),t},e.prototype.nextToken=function(){var e=this.lookahead;this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.collectComments(),this.scanner.index!==this.startMarker.index&&(this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart);var t=this.scanner.lex();return this.hasLineTerminator=e.lineNumber!==t.lineNumber,t&&this.context.strict&&t.type===3&&this.scanner.isStrictModeReservedWord(t.value)&&(t.type=4),this.lookahead=t,this.config.tokens&&t.type!==2&&this.tokens.push(this.convertToken(t)),e},e.prototype.nextRegexToken=function(){this.collectComments();var e=this.scanner.scanRegExp();return this.config.tokens&&(this.tokens.pop(),this.tokens.push(this.convertToken(e))),this.lookahead=e,this.nextToken(),e},e.prototype.createNode=function(){return{index:this.startMarker.index,line:this.startMarker.line,column:this.startMarker.column}},e.prototype.startNode=function(e,t){t===void 0&&(t=0);var n=e.start-e.lineStart,r=e.lineNumber;return n<0&&(n+=t,r--),{index:e.start,line:r,column:n}},e.prototype.finalize=function(e,t){if(this.config.range&&(t.range=[e.index,this.lastMarker.index]),this.config.loc&&(t.loc={start:{line:e.line,column:e.column},end:{line:this.lastMarker.line,column:this.lastMarker.column}},this.config.source&&(t.loc.source=this.config.source)),this.delegate){var n={start:{line:e.line,column:e.column,offset:e.index},end:{line:this.lastMarker.line,column:this.lastMarker.column,offset:this.lastMarker.index}};this.delegate(t,n)}return t},e.prototype.expect=function(e){var t=this.nextToken();(t.type!==7||t.value!==e)&&this.throwUnexpectedToken(t)},e.prototype.expectCommaSeparator=function(){if(this.config.tolerant){var e=this.lookahead;e.type===7&&e.value===`,`?this.nextToken():e.type===7&&e.value===`;`?(this.nextToken(),this.tolerateUnexpectedToken(e)):this.tolerateUnexpectedToken(e,a.Messages.UnexpectedToken)}else this.expect(`,`)},e.prototype.expectKeyword=function(e){var t=this.nextToken();(t.type!==4||t.value!==e)&&this.throwUnexpectedToken(t)},e.prototype.match=function(e){return this.lookahead.type===7&&this.lookahead.value===e},e.prototype.matchKeyword=function(e){return this.lookahead.type===4&&this.lookahead.value===e},e.prototype.matchContextualKeyword=function(e){return this.lookahead.type===3&&this.lookahead.value===e},e.prototype.matchAssign=function(){if(this.lookahead.type!==7)return!1;var e=this.lookahead.value;return e===`=`||e===`*=`||e===`**=`||e===`/=`||e===`%=`||e===`+=`||e===`-=`||e===`<<=`||e===`>>=`||e===`>>>=`||e===`&=`||e===`^=`||e===`|=`},e.prototype.isolateCoverGrammar=function(e){var t=this.context.isBindingElement,n=this.context.isAssignmentTarget,r=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;var i=e.call(this);return this.context.firstCoverInitializedNameError!==null&&this.throwUnexpectedToken(this.context.firstCoverInitializedNameError),this.context.isBindingElement=t,this.context.isAssignmentTarget=n,this.context.firstCoverInitializedNameError=r,i},e.prototype.inheritCoverGrammar=function(e){var t=this.context.isBindingElement,n=this.context.isAssignmentTarget,r=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;var i=e.call(this);return this.context.isBindingElement=this.context.isBindingElement&&t,this.context.isAssignmentTarget=this.context.isAssignmentTarget&&n,this.context.firstCoverInitializedNameError=r||this.context.firstCoverInitializedNameError,i},e.prototype.consumeSemicolon=function(){this.match(`;`)?this.nextToken():this.hasLineTerminator||(this.lookahead.type!==2&&!this.match(`}`)&&this.throwUnexpectedToken(this.lookahead),this.lastMarker.index=this.startMarker.index,this.lastMarker.line=this.startMarker.line,this.lastMarker.column=this.startMarker.column)},e.prototype.parsePrimaryExpression=function(){var e=this.createNode(),t,n,r;switch(this.lookahead.type){case 3:(this.context.isModule||this.context.await)&&this.lookahead.value===`await`&&this.tolerateUnexpectedToken(this.lookahead),t=this.matchAsyncFunction()?this.parseFunctionExpression():this.finalize(e,new o.Identifier(this.nextToken().value));break;case 6:case 8:this.context.strict&&this.lookahead.octal&&this.tolerateUnexpectedToken(this.lookahead,a.Messages.StrictOctalLiteral),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,n=this.nextToken(),r=this.getTokenRaw(n),t=this.finalize(e,new o.Literal(n.value,r));break;case 1:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,n=this.nextToken(),r=this.getTokenRaw(n),t=this.finalize(e,new o.Literal(n.value===`true`,r));break;case 5:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,n=this.nextToken(),r=this.getTokenRaw(n),t=this.finalize(e,new o.Literal(null,r));break;case 10:t=this.parseTemplateLiteral();break;case 7:switch(this.lookahead.value){case`(`:this.context.isBindingElement=!1,t=this.inheritCoverGrammar(this.parseGroupExpression);break;case`[`:t=this.inheritCoverGrammar(this.parseArrayInitializer);break;case`{`:t=this.inheritCoverGrammar(this.parseObjectInitializer);break;case`/`:case`/=`:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.scanner.index=this.startMarker.index,n=this.nextRegexToken(),r=this.getTokenRaw(n),t=this.finalize(e,new o.RegexLiteral(n.regex,r,n.pattern,n.flags));break;default:t=this.throwUnexpectedToken(this.nextToken())}break;case 4:!this.context.strict&&this.context.allowYield&&this.matchKeyword(`yield`)?t=this.parseIdentifierName():!this.context.strict&&this.matchKeyword(`let`)?t=this.finalize(e,new o.Identifier(this.nextToken().value)):(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.matchKeyword(`function`)?t=this.parseFunctionExpression():this.matchKeyword(`this`)?(this.nextToken(),t=this.finalize(e,new o.ThisExpression)):t=this.matchKeyword(`class`)?this.parseClassExpression():this.throwUnexpectedToken(this.nextToken()));break;default:t=this.throwUnexpectedToken(this.nextToken())}return t},e.prototype.parseSpreadElement=function(){var e=this.createNode();this.expect(`...`);var t=this.inheritCoverGrammar(this.parseAssignmentExpression);return this.finalize(e,new o.SpreadElement(t))},e.prototype.parseArrayInitializer=function(){var e=this.createNode(),t=[];for(this.expect(`[`);!this.match(`]`);)if(this.match(`,`))this.nextToken(),t.push(null);else if(this.match(`...`)){var n=this.parseSpreadElement();this.match(`]`)||(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,this.expect(`,`)),t.push(n)}else t.push(this.inheritCoverGrammar(this.parseAssignmentExpression)),this.match(`]`)||this.expect(`,`);return this.expect(`]`),this.finalize(e,new o.ArrayExpression(t))},e.prototype.parsePropertyMethod=function(e){this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var t=this.context.strict,n=this.context.allowStrictDirective;this.context.allowStrictDirective=e.simple;var r=this.isolateCoverGrammar(this.parseFunctionSourceElements);return this.context.strict&&e.firstRestricted&&this.tolerateUnexpectedToken(e.firstRestricted,e.message),this.context.strict&&e.stricted&&this.tolerateUnexpectedToken(e.stricted,e.message),this.context.strict=t,this.context.allowStrictDirective=n,r},e.prototype.parsePropertyMethodFunction=function(){var e=!1,t=this.createNode(),n=this.context.allowYield;this.context.allowYield=!0;var r=this.parseFormalParameters(),i=this.parsePropertyMethod(r);return this.context.allowYield=n,this.finalize(t,new o.FunctionExpression(null,r.params,i,e))},e.prototype.parsePropertyMethodAsyncFunction=function(){var e=this.createNode(),t=this.context.allowYield,n=this.context.await;this.context.allowYield=!1,this.context.await=!0;var r=this.parseFormalParameters(),i=this.parsePropertyMethod(r);return this.context.allowYield=t,this.context.await=n,this.finalize(e,new o.AsyncFunctionExpression(null,r.params,i))},e.prototype.parseObjectPropertyKey=function(){var e=this.createNode(),t=this.nextToken(),n;switch(t.type){case 8:case 6:this.context.strict&&t.octal&&this.tolerateUnexpectedToken(t,a.Messages.StrictOctalLiteral);var r=this.getTokenRaw(t);n=this.finalize(e,new o.Literal(t.value,r));break;case 3:case 1:case 5:case 4:n=this.finalize(e,new o.Identifier(t.value));break;case 7:t.value===`[`?(n=this.isolateCoverGrammar(this.parseAssignmentExpression),this.expect(`]`)):n=this.throwUnexpectedToken(t);break;default:n=this.throwUnexpectedToken(t)}return n},e.prototype.isPropertyKey=function(e,t){return e.type===c.Syntax.Identifier&&e.name===t||e.type===c.Syntax.Literal&&e.value===t},e.prototype.parseObjectProperty=function(e){var t=this.createNode(),n=this.lookahead,r,i=null,s=null,c=!1,l=!1,u=!1,d=!1;if(n.type===3){var f=n.value;this.nextToken(),c=this.match(`[`),d=!this.hasLineTerminator&&f===`async`&&!this.match(`:`)&&!this.match(`(`)&&!this.match(`*`)&&!this.match(`,`),i=d?this.parseObjectPropertyKey():this.finalize(t,new o.Identifier(f))}else this.match(`*`)?this.nextToken():(c=this.match(`[`),i=this.parseObjectPropertyKey());var p=this.qualifiedPropertyName(this.lookahead);if(n.type===3&&!d&&n.value===`get`&&p)r=`get`,c=this.match(`[`),i=this.parseObjectPropertyKey(),this.context.allowYield=!1,s=this.parseGetterMethod();else if(n.type===3&&!d&&n.value===`set`&&p)r=`set`,c=this.match(`[`),i=this.parseObjectPropertyKey(),s=this.parseSetterMethod();else if(n.type===7&&n.value===`*`&&p)r=`init`,c=this.match(`[`),i=this.parseObjectPropertyKey(),s=this.parseGeneratorMethod(),l=!0;else if(i||this.throwUnexpectedToken(this.lookahead),r=`init`,this.match(`:`)&&!d)!c&&this.isPropertyKey(i,`__proto__`)&&(e.value&&this.tolerateError(a.Messages.DuplicateProtoProperty),e.value=!0),this.nextToken(),s=this.inheritCoverGrammar(this.parseAssignmentExpression);else if(this.match(`(`))s=d?this.parsePropertyMethodAsyncFunction():this.parsePropertyMethodFunction(),l=!0;else if(n.type===3){var f=this.finalize(t,new o.Identifier(n.value));if(this.match(`=`)){this.context.firstCoverInitializedNameError=this.lookahead,this.nextToken(),u=!0;var m=this.isolateCoverGrammar(this.parseAssignmentExpression);s=this.finalize(t,new o.AssignmentPattern(f,m))}else u=!0,s=f}else this.throwUnexpectedToken(this.nextToken());return this.finalize(t,new o.Property(r,i,c,s,l,u))},e.prototype.parseObjectInitializer=function(){var e=this.createNode();this.expect(`{`);for(var t=[],n={value:!1};!this.match(`}`);)t.push(this.parseObjectProperty(n)),this.match(`}`)||this.expectCommaSeparator();return this.expect(`}`),this.finalize(e,new o.ObjectExpression(t))},e.prototype.parseTemplateHead=function(){r.assert(this.lookahead.head,`Template literal must start with a template head`);var e=this.createNode(),t=this.nextToken(),n=t.value,i=t.cooked;return this.finalize(e,new o.TemplateElement({raw:n,cooked:i},t.tail))},e.prototype.parseTemplateElement=function(){this.lookahead.type!==10&&this.throwUnexpectedToken();var e=this.createNode(),t=this.nextToken(),n=t.value,r=t.cooked;return this.finalize(e,new o.TemplateElement({raw:n,cooked:r},t.tail))},e.prototype.parseTemplateLiteral=function(){var e=this.createNode(),t=[],n=[],r=this.parseTemplateHead();for(n.push(r);!r.tail;)t.push(this.parseExpression()),r=this.parseTemplateElement(),n.push(r);return this.finalize(e,new o.TemplateLiteral(n,t))},e.prototype.reinterpretExpressionAsPattern=function(e){switch(e.type){case c.Syntax.Identifier:case c.Syntax.MemberExpression:case c.Syntax.RestElement:case c.Syntax.AssignmentPattern:break;case c.Syntax.SpreadElement:e.type=c.Syntax.RestElement,this.reinterpretExpressionAsPattern(e.argument);break;case c.Syntax.ArrayExpression:e.type=c.Syntax.ArrayPattern;for(var t=0;t<e.elements.length;t++)e.elements[t]!==null&&this.reinterpretExpressionAsPattern(e.elements[t]);break;case c.Syntax.ObjectExpression:e.type=c.Syntax.ObjectPattern;for(var t=0;t<e.properties.length;t++)this.reinterpretExpressionAsPattern(e.properties[t].value);break;case c.Syntax.AssignmentExpression:e.type=c.Syntax.AssignmentPattern,delete e.operator,this.reinterpretExpressionAsPattern(e.left);break;default:break}},e.prototype.parseGroupExpression=function(){var e;if(this.expect(`(`),this.match(`)`))this.nextToken(),this.match(`=>`)||this.expect(`=>`),e={type:u,params:[],async:!1};else{var t=this.lookahead,n=[];if(this.match(`...`))e=this.parseRestElement(n),this.expect(`)`),this.match(`=>`)||this.expect(`=>`),e={type:u,params:[e],async:!1};else{var r=!1;if(this.context.isBindingElement=!0,e=this.inheritCoverGrammar(this.parseAssignmentExpression),this.match(`,`)){var i=[];for(this.context.isAssignmentTarget=!1,i.push(e);this.lookahead.type!==2&&this.match(`,`);){if(this.nextToken(),this.match(`)`)){this.nextToken();for(var a=0;a<i.length;a++)this.reinterpretExpressionAsPattern(i[a]);r=!0,e={type:u,params:i,async:!1}}else if(this.match(`...`)){this.context.isBindingElement||this.throwUnexpectedToken(this.lookahead),i.push(this.parseRestElement(n)),this.expect(`)`),this.match(`=>`)||this.expect(`=>`),this.context.isBindingElement=!1;for(var a=0;a<i.length;a++)this.reinterpretExpressionAsPattern(i[a]);r=!0,e={type:u,params:i,async:!1}}else i.push(this.inheritCoverGrammar(this.parseAssignmentExpression));if(r)break}r||(e=this.finalize(this.startNode(t),new o.SequenceExpression(i)))}if(!r){if(this.expect(`)`),this.match(`=>`)&&(e.type===c.Syntax.Identifier&&e.name===`yield`&&(r=!0,e={type:u,params:[e],async:!1}),!r)){if(this.context.isBindingElement||this.throwUnexpectedToken(this.lookahead),e.type===c.Syntax.SequenceExpression)for(var a=0;a<e.expressions.length;a++)this.reinterpretExpressionAsPattern(e.expressions[a]);else this.reinterpretExpressionAsPattern(e);e={type:u,params:e.type===c.Syntax.SequenceExpression?e.expressions:[e],async:!1}}this.context.isBindingElement=!1}}}return e},e.prototype.parseArguments=function(){this.expect(`(`);var e=[];if(!this.match(`)`))for(;;){var t=this.match(`...`)?this.parseSpreadElement():this.isolateCoverGrammar(this.parseAssignmentExpression);if(e.push(t),this.match(`)`)||(this.expectCommaSeparator(),this.match(`)`)))break}return this.expect(`)`),e},e.prototype.isIdentifierName=function(e){return e.type===3||e.type===4||e.type===1||e.type===5},e.prototype.parseIdentifierName=function(){var e=this.createNode(),t=this.nextToken();return this.isIdentifierName(t)||this.throwUnexpectedToken(t),this.finalize(e,new o.Identifier(t.value))},e.prototype.parseNewExpression=function(){var e=this.createNode(),t=this.parseIdentifierName();r.assert(t.name===`new`,"New expression must start with `new`");var n;if(this.match(`.`))if(this.nextToken(),this.lookahead.type===3&&this.context.inFunctionBody&&this.lookahead.value===`target`){var i=this.parseIdentifierName();n=new o.MetaProperty(t,i)}else this.throwUnexpectedToken(this.lookahead);else{var a=this.isolateCoverGrammar(this.parseLeftHandSideExpression),s=this.match(`(`)?this.parseArguments():[];n=new o.NewExpression(a,s),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}return this.finalize(e,n)},e.prototype.parseAsyncArgument=function(){var e=this.parseAssignmentExpression();return this.context.firstCoverInitializedNameError=null,e},e.prototype.parseAsyncArguments=function(){this.expect(`(`);var e=[];if(!this.match(`)`))for(;;){var t=this.match(`...`)?this.parseSpreadElement():this.isolateCoverGrammar(this.parseAsyncArgument);if(e.push(t),this.match(`)`)||(this.expectCommaSeparator(),this.match(`)`)))break}return this.expect(`)`),e},e.prototype.parseLeftHandSideExpressionAllowCall=function(){var e=this.lookahead,t=this.matchContextualKeyword(`async`),n=this.context.allowIn;this.context.allowIn=!0;var r;for(this.matchKeyword(`super`)&&this.context.inFunctionBody?(r=this.createNode(),this.nextToken(),r=this.finalize(r,new o.Super),!this.match(`(`)&&!this.match(`.`)&&!this.match(`[`)&&this.throwUnexpectedToken(this.lookahead)):r=this.inheritCoverGrammar(this.matchKeyword(`new`)?this.parseNewExpression:this.parsePrimaryExpression);;)if(this.match(`.`)){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(`.`);var i=this.parseIdentifierName();r=this.finalize(this.startNode(e),new o.StaticMemberExpression(r,i))}else if(this.match(`(`)){var a=t&&e.lineNumber===this.lookahead.lineNumber;this.context.isBindingElement=!1,this.context.isAssignmentTarget=!1;var s=a?this.parseAsyncArguments():this.parseArguments();if(r=this.finalize(this.startNode(e),new o.CallExpression(r,s)),a&&this.match(`=>`)){for(var c=0;c<s.length;++c)this.reinterpretExpressionAsPattern(s[c]);r={type:u,params:s,async:!0}}}else if(this.match(`[`)){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(`[`);var i=this.isolateCoverGrammar(this.parseExpression);this.expect(`]`),r=this.finalize(this.startNode(e),new o.ComputedMemberExpression(r,i))}else if(this.lookahead.type===10&&this.lookahead.head){var l=this.parseTemplateLiteral();r=this.finalize(this.startNode(e),new o.TaggedTemplateExpression(r,l))}else break;return this.context.allowIn=n,r},e.prototype.parseSuper=function(){var e=this.createNode();return this.expectKeyword(`super`),!this.match(`[`)&&!this.match(`.`)&&this.throwUnexpectedToken(this.lookahead),this.finalize(e,new o.Super)},e.prototype.parseLeftHandSideExpression=function(){r.assert(this.context.allowIn,`callee of new expression always allow in keyword.`);for(var e=this.startNode(this.lookahead),t=this.matchKeyword(`super`)&&this.context.inFunctionBody?this.parseSuper():this.inheritCoverGrammar(this.matchKeyword(`new`)?this.parseNewExpression:this.parsePrimaryExpression);;)if(this.match(`[`)){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(`[`);var n=this.isolateCoverGrammar(this.parseExpression);this.expect(`]`),t=this.finalize(e,new o.ComputedMemberExpression(t,n))}else if(this.match(`.`)){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(`.`);var n=this.parseIdentifierName();t=this.finalize(e,new o.StaticMemberExpression(t,n))}else if(this.lookahead.type===10&&this.lookahead.head){var i=this.parseTemplateLiteral();t=this.finalize(e,new o.TaggedTemplateExpression(t,i))}else break;return t},e.prototype.parseUpdateExpression=function(){var e,t=this.lookahead;if(this.match(`++`)||this.match(`--`)){var n=this.startNode(t),r=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),this.context.strict&&e.type===c.Syntax.Identifier&&this.scanner.isRestrictedWord(e.name)&&this.tolerateError(a.Messages.StrictLHSPrefix),this.context.isAssignmentTarget||this.tolerateError(a.Messages.InvalidLHSInAssignment);var i=!0;e=this.finalize(n,new o.UpdateExpression(r.value,e,i)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else if(e=this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall),!this.hasLineTerminator&&this.lookahead.type===7&&(this.match(`++`)||this.match(`--`))){this.context.strict&&e.type===c.Syntax.Identifier&&this.scanner.isRestrictedWord(e.name)&&this.tolerateError(a.Messages.StrictLHSPostfix),this.context.isAssignmentTarget||this.tolerateError(a.Messages.InvalidLHSInAssignment),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var s=this.nextToken().value,i=!1;e=this.finalize(this.startNode(t),new o.UpdateExpression(s,e,i))}return e},e.prototype.parseAwaitExpression=function(){var e=this.createNode();this.nextToken();var t=this.parseUnaryExpression();return this.finalize(e,new o.AwaitExpression(t))},e.prototype.parseUnaryExpression=function(){var e;if(this.match(`+`)||this.match(`-`)||this.match(`~`)||this.match(`!`)||this.matchKeyword(`delete`)||this.matchKeyword(`void`)||this.matchKeyword(`typeof`)){var t=this.startNode(this.lookahead),n=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),e=this.finalize(t,new o.UnaryExpression(n.value,e)),this.context.strict&&e.operator===`delete`&&e.argument.type===c.Syntax.Identifier&&this.tolerateError(a.Messages.StrictDelete),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else e=this.context.await&&this.matchContextualKeyword(`await`)?this.parseAwaitExpression():this.parseUpdateExpression();return e},e.prototype.parseExponentiationExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseUnaryExpression);if(t.type!==c.Syntax.UnaryExpression&&this.match(`**`)){this.nextToken(),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var n=t,r=this.isolateCoverGrammar(this.parseExponentiationExpression);t=this.finalize(this.startNode(e),new o.BinaryExpression(`**`,n,r))}return t},e.prototype.binaryPrecedence=function(e){var t=e.value;return e.type===7?this.operatorPrecedence[t]||0:e.type===4&&(t===`instanceof`||this.context.allowIn&&t===`in`)?7:0},e.prototype.parseBinaryExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseExponentiationExpression),n=this.lookahead,r=this.binaryPrecedence(n);if(r>0){this.nextToken(),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;for(var i=[e,this.lookahead],a=t,s=this.isolateCoverGrammar(this.parseExponentiationExpression),c=[a,n.value,s],l=[r];r=this.binaryPrecedence(this.lookahead),!(r<=0);){for(;c.length>2&&r<=l[l.length-1];){s=c.pop();var u=c.pop();l.pop(),a=c.pop(),i.pop();var d=this.startNode(i[i.length-1]);c.push(this.finalize(d,new o.BinaryExpression(u,a,s)))}c.push(this.nextToken().value),l.push(r),i.push(this.lookahead),c.push(this.isolateCoverGrammar(this.parseExponentiationExpression))}var f=c.length-1;t=c[f];for(var p=i.pop();f>1;){var m=i.pop(),h=p&&p.lineStart,d=this.startNode(m,h),u=c[f-1];t=this.finalize(d,new o.BinaryExpression(u,c[f-2],t)),f-=2,p=m}}return t},e.prototype.parseConditionalExpression=function(){var e=this.lookahead,t=this.inheritCoverGrammar(this.parseBinaryExpression);if(this.match(`?`)){this.nextToken();var n=this.context.allowIn;this.context.allowIn=!0;var r=this.isolateCoverGrammar(this.parseAssignmentExpression);this.context.allowIn=n,this.expect(`:`);var i=this.isolateCoverGrammar(this.parseAssignmentExpression);t=this.finalize(this.startNode(e),new o.ConditionalExpression(t,r,i)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}return t},e.prototype.checkPatternParam=function(e,t){switch(t.type){case c.Syntax.Identifier:this.validateParam(e,t,t.name);break;case c.Syntax.RestElement:this.checkPatternParam(e,t.argument);break;case c.Syntax.AssignmentPattern:this.checkPatternParam(e,t.left);break;case c.Syntax.ArrayPattern:for(var n=0;n<t.elements.length;n++)t.elements[n]!==null&&this.checkPatternParam(e,t.elements[n]);break;case c.Syntax.ObjectPattern:for(var n=0;n<t.properties.length;n++)this.checkPatternParam(e,t.properties[n].value);break;default:break}e.simple=e.simple&&t instanceof o.Identifier},e.prototype.reinterpretAsCoverFormalsList=function(e){var t=[e],n,r=!1;switch(e.type){case c.Syntax.Identifier:break;case u:t=e.params,r=e.async;break;default:return null}n={simple:!0,paramSet:{}};for(var i=0;i<t.length;++i){var o=t[i];o.type===c.Syntax.AssignmentPattern?o.right.type===c.Syntax.YieldExpression&&(o.right.argument&&this.throwUnexpectedToken(this.lookahead),o.right.type=c.Syntax.Identifier,o.right.name=`yield`,delete o.right.argument,delete o.right.delegate):r&&o.type===c.Syntax.Identifier&&o.name===`await`&&this.throwUnexpectedToken(this.lookahead),this.checkPatternParam(n,o),t[i]=o}if(this.context.strict||!this.context.allowYield)for(var i=0;i<t.length;++i){var o=t[i];o.type===c.Syntax.YieldExpression&&this.throwUnexpectedToken(this.lookahead)}if(n.message===a.Messages.StrictParamDupe){var s=this.context.strict?n.stricted:n.firstRestricted;this.throwUnexpectedToken(s,n.message)}return{simple:n.simple,params:t,stricted:n.stricted,firstRestricted:n.firstRestricted,message:n.message}},e.prototype.parseAssignmentExpression=function(){var e;if(!this.context.allowYield&&this.matchKeyword(`yield`))e=this.parseYieldExpression();else{var t=this.lookahead,n=t;if(e=this.parseConditionalExpression(),n.type===3&&n.lineNumber===this.lookahead.lineNumber&&n.value===`async`&&(this.lookahead.type===3||this.matchKeyword(`yield`))){var r=this.parsePrimaryExpression();this.reinterpretExpressionAsPattern(r),e={type:u,params:[r],async:!0}}if(e.type===u||this.match(`=>`)){this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;var i=e.async,s=this.reinterpretAsCoverFormalsList(e);if(s){this.hasLineTerminator&&this.tolerateUnexpectedToken(this.lookahead),this.context.firstCoverInitializedNameError=null;var l=this.context.strict,d=this.context.allowStrictDirective;this.context.allowStrictDirective=s.simple;var f=this.context.allowYield,p=this.context.await;this.context.allowYield=!0,this.context.await=i;var m=this.startNode(t);this.expect(`=>`);var h=void 0;if(this.match(`{`)){var g=this.context.allowIn;this.context.allowIn=!0,h=this.parseFunctionSourceElements(),this.context.allowIn=g}else h=this.isolateCoverGrammar(this.parseAssignmentExpression);var _=h.type!==c.Syntax.BlockStatement;this.context.strict&&s.firstRestricted&&this.throwUnexpectedToken(s.firstRestricted,s.message),this.context.strict&&s.stricted&&this.tolerateUnexpectedToken(s.stricted,s.message),e=i?this.finalize(m,new o.AsyncArrowFunctionExpression(s.params,h,_)):this.finalize(m,new o.ArrowFunctionExpression(s.params,h,_)),this.context.strict=l,this.context.allowStrictDirective=d,this.context.allowYield=f,this.context.await=p}}else if(this.matchAssign()){if(this.context.isAssignmentTarget||this.tolerateError(a.Messages.InvalidLHSInAssignment),this.context.strict&&e.type===c.Syntax.Identifier){var v=e;this.scanner.isRestrictedWord(v.name)&&this.tolerateUnexpectedToken(n,a.Messages.StrictLHSAssignment),this.scanner.isStrictModeReservedWord(v.name)&&this.tolerateUnexpectedToken(n,a.Messages.StrictReservedWord)}this.match(`=`)?this.reinterpretExpressionAsPattern(e):(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1),n=this.nextToken();var y=n.value,b=this.isolateCoverGrammar(this.parseAssignmentExpression);e=this.finalize(this.startNode(t),new o.AssignmentExpression(y,e,b)),this.context.firstCoverInitializedNameError=null}}return e},e.prototype.parseExpression=function(){var e=this.lookahead,t=this.isolateCoverGrammar(this.parseAssignmentExpression);if(this.match(`,`)){var n=[];for(n.push(t);this.lookahead.type!==2&&this.match(`,`);)this.nextToken(),n.push(this.isolateCoverGrammar(this.parseAssignmentExpression));t=this.finalize(this.startNode(e),new o.SequenceExpression(n))}return t},e.prototype.parseStatementListItem=function(){var e;if(this.context.isAssignmentTarget=!0,this.context.isBindingElement=!0,this.lookahead.type===4)switch(this.lookahead.value){case`export`:this.context.isModule||this.tolerateUnexpectedToken(this.lookahead,a.Messages.IllegalExportDeclaration),e=this.parseExportDeclaration();break;case`import`:this.context.isModule||this.tolerateUnexpectedToken(this.lookahead,a.Messages.IllegalImportDeclaration),e=this.parseImportDeclaration();break;case`const`:e=this.parseLexicalDeclaration({inFor:!1});break;case`function`:e=this.parseFunctionDeclaration();break;case`class`:e=this.parseClassDeclaration();break;case`let`:e=this.isLexicalDeclaration()?this.parseLexicalDeclaration({inFor:!1}):this.parseStatement();break;default:e=this.parseStatement();break}else e=this.parseStatement();return e},e.prototype.parseBlock=function(){var e=this.createNode();this.expect(`{`);for(var t=[];!this.match(`}`);)t.push(this.parseStatementListItem());return this.expect(`}`),this.finalize(e,new o.BlockStatement(t))},e.prototype.parseLexicalBinding=function(e,t){var n=this.createNode(),r=this.parsePattern([],e);this.context.strict&&r.type===c.Syntax.Identifier&&this.scanner.isRestrictedWord(r.name)&&this.tolerateError(a.Messages.StrictVarName);var i=null;return e===`const`?!this.matchKeyword(`in`)&&!this.matchContextualKeyword(`of`)&&(this.match(`=`)?(this.nextToken(),i=this.isolateCoverGrammar(this.parseAssignmentExpression)):this.throwError(a.Messages.DeclarationMissingInitializer,`const`)):(!t.inFor&&r.type!==c.Syntax.Identifier||this.match(`=`))&&(this.expect(`=`),i=this.isolateCoverGrammar(this.parseAssignmentExpression)),this.finalize(n,new o.VariableDeclarator(r,i))},e.prototype.parseBindingList=function(e,t){for(var n=[this.parseLexicalBinding(e,t)];this.match(`,`);)this.nextToken(),n.push(this.parseLexicalBinding(e,t));return n},e.prototype.isLexicalDeclaration=function(){var e=this.scanner.saveState();this.scanner.scanComments();var t=this.scanner.lex();return this.scanner.restoreState(e),t.type===3||t.type===7&&t.value===`[`||t.type===7&&t.value===`{`||t.type===4&&t.value===`let`||t.type===4&&t.value===`yield`},e.prototype.parseLexicalDeclaration=function(e){var t=this.createNode(),n=this.nextToken().value;r.assert(n===`let`||n===`const`,`Lexical declaration must be either let or const`);var i=this.parseBindingList(n,e);return this.consumeSemicolon(),this.finalize(t,new o.VariableDeclaration(i,n))},e.prototype.parseBindingRestElement=function(e,t){var n=this.createNode();this.expect(`...`);var r=this.parsePattern(e,t);return this.finalize(n,new o.RestElement(r))},e.prototype.parseArrayPattern=function(e,t){var n=this.createNode();this.expect(`[`);for(var r=[];!this.match(`]`);)if(this.match(`,`))this.nextToken(),r.push(null);else{if(this.match(`...`)){r.push(this.parseBindingRestElement(e,t));break}else r.push(this.parsePatternWithDefault(e,t));this.match(`]`)||this.expect(`,`)}return this.expect(`]`),this.finalize(n,new o.ArrayPattern(r))},e.prototype.parsePropertyPattern=function(e,t){var n=this.createNode(),r=!1,i=!1,a=!1,s,c;if(this.lookahead.type===3){var l=this.lookahead;s=this.parseVariableIdentifier();var u=this.finalize(n,new o.Identifier(l.value));if(this.match(`=`)){e.push(l),i=!0,this.nextToken();var d=this.parseAssignmentExpression();c=this.finalize(this.startNode(l),new o.AssignmentPattern(u,d))}else this.match(`:`)?(this.expect(`:`),c=this.parsePatternWithDefault(e,t)):(e.push(l),i=!0,c=u)}else r=this.match(`[`),s=this.parseObjectPropertyKey(),this.expect(`:`),c=this.parsePatternWithDefault(e,t);return this.finalize(n,new o.Property(`init`,s,r,c,a,i))},e.prototype.parseObjectPattern=function(e,t){var n=this.createNode(),r=[];for(this.expect(`{`);!this.match(`}`);)r.push(this.parsePropertyPattern(e,t)),this.match(`}`)||this.expect(`,`);return this.expect(`}`),this.finalize(n,new o.ObjectPattern(r))},e.prototype.parsePattern=function(e,t){var n;return this.match(`[`)?n=this.parseArrayPattern(e,t):this.match(`{`)?n=this.parseObjectPattern(e,t):(this.matchKeyword(`let`)&&(t===`const`||t===`let`)&&this.tolerateUnexpectedToken(this.lookahead,a.Messages.LetInLexicalBinding),e.push(this.lookahead),n=this.parseVariableIdentifier(t)),n},e.prototype.parsePatternWithDefault=function(e,t){var n=this.lookahead,r=this.parsePattern(e,t);if(this.match(`=`)){this.nextToken();var i=this.context.allowYield;this.context.allowYield=!0;var a=this.isolateCoverGrammar(this.parseAssignmentExpression);this.context.allowYield=i,r=this.finalize(this.startNode(n),new o.AssignmentPattern(r,a))}return r},e.prototype.parseVariableIdentifier=function(e){var t=this.createNode(),n=this.nextToken();return n.type===4&&n.value===`yield`?this.context.strict?this.tolerateUnexpectedToken(n,a.Messages.StrictReservedWord):this.context.allowYield||this.throwUnexpectedToken(n):n.type===3?(this.context.isModule||this.context.await)&&n.type===3&&n.value===`await`&&this.tolerateUnexpectedToken(n):this.context.strict&&n.type===4&&this.scanner.isStrictModeReservedWord(n.value)?this.tolerateUnexpectedToken(n,a.Messages.StrictReservedWord):(this.context.strict||n.value!==`let`||e!==`var`)&&this.throwUnexpectedToken(n),this.finalize(t,new o.Identifier(n.value))},e.prototype.parseVariableDeclaration=function(e){var t=this.createNode(),n=this.parsePattern([],`var`);this.context.strict&&n.type===c.Syntax.Identifier&&this.scanner.isRestrictedWord(n.name)&&this.tolerateError(a.Messages.StrictVarName);var r=null;return this.match(`=`)?(this.nextToken(),r=this.isolateCoverGrammar(this.parseAssignmentExpression)):n.type!==c.Syntax.Identifier&&!e.inFor&&this.expect(`=`),this.finalize(t,new o.VariableDeclarator(n,r))},e.prototype.parseVariableDeclarationList=function(e){var t={inFor:e.inFor},n=[];for(n.push(this.parseVariableDeclaration(t));this.match(`,`);)this.nextToken(),n.push(this.parseVariableDeclaration(t));return n},e.prototype.parseVariableStatement=function(){var e=this.createNode();this.expectKeyword(`var`);var t=this.parseVariableDeclarationList({inFor:!1});return this.consumeSemicolon(),this.finalize(e,new o.VariableDeclaration(t,`var`))},e.prototype.parseEmptyStatement=function(){var e=this.createNode();return this.expect(`;`),this.finalize(e,new o.EmptyStatement)},e.prototype.parseExpressionStatement=function(){var e=this.createNode(),t=this.parseExpression();return this.consumeSemicolon(),this.finalize(e,new o.ExpressionStatement(t))},e.prototype.parseIfClause=function(){return this.context.strict&&this.matchKeyword(`function`)&&this.tolerateError(a.Messages.StrictFunction),this.parseStatement()},e.prototype.parseIfStatement=function(){var e=this.createNode(),t,n=null;this.expectKeyword(`if`),this.expect(`(`);var r=this.parseExpression();return!this.match(`)`)&&this.config.tolerant?(this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new o.EmptyStatement)):(this.expect(`)`),t=this.parseIfClause(),this.matchKeyword(`else`)&&(this.nextToken(),n=this.parseIfClause())),this.finalize(e,new o.IfStatement(r,t,n))},e.prototype.parseDoWhileStatement=function(){var e=this.createNode();this.expectKeyword(`do`);var t=this.context.inIteration;this.context.inIteration=!0;var n=this.parseStatement();this.context.inIteration=t,this.expectKeyword(`while`),this.expect(`(`);var r=this.parseExpression();return!this.match(`)`)&&this.config.tolerant?this.tolerateUnexpectedToken(this.nextToken()):(this.expect(`)`),this.match(`;`)&&this.nextToken()),this.finalize(e,new o.DoWhileStatement(n,r))},e.prototype.parseWhileStatement=function(){var e=this.createNode(),t;this.expectKeyword(`while`),this.expect(`(`);var n=this.parseExpression();if(!this.match(`)`)&&this.config.tolerant)this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new o.EmptyStatement);else{this.expect(`)`);var r=this.context.inIteration;this.context.inIteration=!0,t=this.parseStatement(),this.context.inIteration=r}return this.finalize(e,new o.WhileStatement(n,t))},e.prototype.parseForStatement=function(){var e=null,t=null,n=null,r=!0,i,s,l=this.createNode();if(this.expectKeyword(`for`),this.expect(`(`),this.match(`;`))this.nextToken();else if(this.matchKeyword(`var`)){e=this.createNode(),this.nextToken();var u=this.context.allowIn;this.context.allowIn=!1;var d=this.parseVariableDeclarationList({inFor:!0});if(this.context.allowIn=u,d.length===1&&this.matchKeyword(`in`)){var f=d[0];f.init&&(f.id.type===c.Syntax.ArrayPattern||f.id.type===c.Syntax.ObjectPattern||this.context.strict)&&this.tolerateError(a.Messages.ForInOfLoopInitializer,`for-in`),e=this.finalize(e,new o.VariableDeclaration(d,`var`)),this.nextToken(),i=e,s=this.parseExpression(),e=null}else d.length===1&&d[0].init===null&&this.matchContextualKeyword(`of`)?(e=this.finalize(e,new o.VariableDeclaration(d,`var`)),this.nextToken(),i=e,s=this.parseAssignmentExpression(),e=null,r=!1):(e=this.finalize(e,new o.VariableDeclaration(d,`var`)),this.expect(`;`))}else if(this.matchKeyword(`const`)||this.matchKeyword(`let`)){e=this.createNode();var p=this.nextToken().value;if(!this.context.strict&&this.lookahead.value===`in`)e=this.finalize(e,new o.Identifier(p)),this.nextToken(),i=e,s=this.parseExpression(),e=null;else{var u=this.context.allowIn;this.context.allowIn=!1;var d=this.parseBindingList(p,{inFor:!0});this.context.allowIn=u,d.length===1&&d[0].init===null&&this.matchKeyword(`in`)?(e=this.finalize(e,new o.VariableDeclaration(d,p)),this.nextToken(),i=e,s=this.parseExpression(),e=null):d.length===1&&d[0].init===null&&this.matchContextualKeyword(`of`)?(e=this.finalize(e,new o.VariableDeclaration(d,p)),this.nextToken(),i=e,s=this.parseAssignmentExpression(),e=null,r=!1):(this.consumeSemicolon(),e=this.finalize(e,new o.VariableDeclaration(d,p)))}}else{var m=this.lookahead,u=this.context.allowIn;if(this.context.allowIn=!1,e=this.inheritCoverGrammar(this.parseAssignmentExpression),this.context.allowIn=u,this.matchKeyword(`in`))(!this.context.isAssignmentTarget||e.type===c.Syntax.AssignmentExpression)&&this.tolerateError(a.Messages.InvalidLHSInForIn),this.nextToken(),this.reinterpretExpressionAsPattern(e),i=e,s=this.parseExpression(),e=null;else if(this.matchContextualKeyword(`of`))(!this.context.isAssignmentTarget||e.type===c.Syntax.AssignmentExpression)&&this.tolerateError(a.Messages.InvalidLHSInForLoop),this.nextToken(),this.reinterpretExpressionAsPattern(e),i=e,s=this.parseAssignmentExpression(),e=null,r=!1;else{if(this.match(`,`)){for(var h=[e];this.match(`,`);)this.nextToken(),h.push(this.isolateCoverGrammar(this.parseAssignmentExpression));e=this.finalize(this.startNode(m),new o.SequenceExpression(h))}this.expect(`;`)}}i===void 0&&(this.match(`;`)||(t=this.parseExpression()),this.expect(`;`),this.match(`)`)||(n=this.parseExpression()));var g;if(!this.match(`)`)&&this.config.tolerant)this.tolerateUnexpectedToken(this.nextToken()),g=this.finalize(this.createNode(),new o.EmptyStatement);else{this.expect(`)`);var _=this.context.inIteration;this.context.inIteration=!0,g=this.isolateCoverGrammar(this.parseStatement),this.context.inIteration=_}return i===void 0?this.finalize(l,new o.ForStatement(e,t,n,g)):r?this.finalize(l,new o.ForInStatement(i,s,g)):this.finalize(l,new o.ForOfStatement(i,s,g))},e.prototype.parseContinueStatement=function(){var e=this.createNode();this.expectKeyword(`continue`);var t=null;if(this.lookahead.type===3&&!this.hasLineTerminator){var n=this.parseVariableIdentifier();t=n;var r=`$`+n.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,r)||this.throwError(a.Messages.UnknownLabel,n.name)}return this.consumeSemicolon(),t===null&&!this.context.inIteration&&this.throwError(a.Messages.IllegalContinue),this.finalize(e,new o.ContinueStatement(t))},e.prototype.parseBreakStatement=function(){var e=this.createNode();this.expectKeyword(`break`);var t=null;if(this.lookahead.type===3&&!this.hasLineTerminator){var n=this.parseVariableIdentifier(),r=`$`+n.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,r)||this.throwError(a.Messages.UnknownLabel,n.name),t=n}return this.consumeSemicolon(),t===null&&!this.context.inIteration&&!this.context.inSwitch&&this.throwError(a.Messages.IllegalBreak),this.finalize(e,new o.BreakStatement(t))},e.prototype.parseReturnStatement=function(){this.context.inFunctionBody||this.tolerateError(a.Messages.IllegalReturn);var e=this.createNode();this.expectKeyword(`return`);var t=!this.match(`;`)&&!this.match(`}`)&&!this.hasLineTerminator&&this.lookahead.type!==2||this.lookahead.type===8||this.lookahead.type===10?this.parseExpression():null;return this.consumeSemicolon(),this.finalize(e,new o.ReturnStatement(t))},e.prototype.parseWithStatement=function(){this.context.strict&&this.tolerateError(a.Messages.StrictModeWith);var e=this.createNode(),t;this.expectKeyword(`with`),this.expect(`(`);var n=this.parseExpression();return!this.match(`)`)&&this.config.tolerant?(this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new o.EmptyStatement)):(this.expect(`)`),t=this.parseStatement()),this.finalize(e,new o.WithStatement(n,t))},e.prototype.parseSwitchCase=function(){var e=this.createNode(),t;this.matchKeyword(`default`)?(this.nextToken(),t=null):(this.expectKeyword(`case`),t=this.parseExpression()),this.expect(`:`);for(var n=[];!(this.match(`}`)||this.matchKeyword(`default`)||this.matchKeyword(`case`));)n.push(this.parseStatementListItem());return this.finalize(e,new o.SwitchCase(t,n))},e.prototype.parseSwitchStatement=function(){var e=this.createNode();this.expectKeyword(`switch`),this.expect(`(`);var t=this.parseExpression();this.expect(`)`);var n=this.context.inSwitch;this.context.inSwitch=!0;var r=[],i=!1;for(this.expect(`{`);!this.match(`}`);){var s=this.parseSwitchCase();s.test===null&&(i&&this.throwError(a.Messages.MultipleDefaultsInSwitch),i=!0),r.push(s)}return this.expect(`}`),this.context.inSwitch=n,this.finalize(e,new o.SwitchStatement(t,r))},e.prototype.parseLabelledStatement=function(){var e=this.createNode(),t=this.parseExpression(),n;if(t.type===c.Syntax.Identifier&&this.match(`:`)){this.nextToken();var r=t,i=`$`+r.name;Object.prototype.hasOwnProperty.call(this.context.labelSet,i)&&this.throwError(a.Messages.Redeclaration,`Label`,r.name),this.context.labelSet[i]=!0;var s=void 0;if(this.matchKeyword(`class`))this.tolerateUnexpectedToken(this.lookahead),s=this.parseClassDeclaration();else if(this.matchKeyword(`function`)){var l=this.lookahead,u=this.parseFunctionDeclaration();this.context.strict?this.tolerateUnexpectedToken(l,a.Messages.StrictFunction):u.generator&&this.tolerateUnexpectedToken(l,a.Messages.GeneratorInLegacyContext),s=u}else s=this.parseStatement();delete this.context.labelSet[i],n=new o.LabeledStatement(r,s)}else this.consumeSemicolon(),n=new o.ExpressionStatement(t);return this.finalize(e,n)},e.prototype.parseThrowStatement=function(){var e=this.createNode();this.expectKeyword(`throw`),this.hasLineTerminator&&this.throwError(a.Messages.NewlineAfterThrow);var t=this.parseExpression();return this.consumeSemicolon(),this.finalize(e,new o.ThrowStatement(t))},e.prototype.parseCatchClause=function(){var e=this.createNode();this.expectKeyword(`catch`),this.expect(`(`),this.match(`)`)&&this.throwUnexpectedToken(this.lookahead);for(var t=[],n=this.parsePattern(t),r={},i=0;i<t.length;i++){var s=`$`+t[i].value;Object.prototype.hasOwnProperty.call(r,s)&&this.tolerateError(a.Messages.DuplicateBinding,t[i].value),r[s]=!0}this.context.strict&&n.type===c.Syntax.Identifier&&this.scanner.isRestrictedWord(n.name)&&this.tolerateError(a.Messages.StrictCatchVariable),this.expect(`)`);var l=this.parseBlock();return this.finalize(e,new o.CatchClause(n,l))},e.prototype.parseFinallyClause=function(){return this.expectKeyword(`finally`),this.parseBlock()},e.prototype.parseTryStatement=function(){var e=this.createNode();this.expectKeyword(`try`);var t=this.parseBlock(),n=this.matchKeyword(`catch`)?this.parseCatchClause():null,r=this.matchKeyword(`finally`)?this.parseFinallyClause():null;return!n&&!r&&this.throwError(a.Messages.NoCatchOrFinally),this.finalize(e,new o.TryStatement(t,n,r))},e.prototype.parseDebuggerStatement=function(){var e=this.createNode();return this.expectKeyword(`debugger`),this.consumeSemicolon(),this.finalize(e,new o.DebuggerStatement)},e.prototype.parseStatement=function(){var e;switch(this.lookahead.type){case 1:case 5:case 6:case 8:case 10:case 9:e=this.parseExpressionStatement();break;case 7:var t=this.lookahead.value;e=t===`{`?this.parseBlock():t===`(`?this.parseExpressionStatement():t===`;`?this.parseEmptyStatement():this.parseExpressionStatement();break;case 3:e=this.matchAsyncFunction()?this.parseFunctionDeclaration():this.parseLabelledStatement();break;case 4:switch(this.lookahead.value){case`break`:e=this.parseBreakStatement();break;case`continue`:e=this.parseContinueStatement();break;case`debugger`:e=this.parseDebuggerStatement();break;case`do`:e=this.parseDoWhileStatement();break;case`for`:e=this.parseForStatement();break;case`function`:e=this.parseFunctionDeclaration();break;case`if`:e=this.parseIfStatement();break;case`return`:e=this.parseReturnStatement();break;case`switch`:e=this.parseSwitchStatement();break;case`throw`:e=this.parseThrowStatement();break;case`try`:e=this.parseTryStatement();break;case`var`:e=this.parseVariableStatement();break;case`while`:e=this.parseWhileStatement();break;case`with`:e=this.parseWithStatement();break;default:e=this.parseExpressionStatement();break}break;default:e=this.throwUnexpectedToken(this.lookahead)}return e},e.prototype.parseFunctionSourceElements=function(){var e=this.createNode();this.expect(`{`);var t=this.parseDirectivePrologues(),n=this.context.labelSet,r=this.context.inIteration,i=this.context.inSwitch,a=this.context.inFunctionBody;for(this.context.labelSet={},this.context.inIteration=!1,this.context.inSwitch=!1,this.context.inFunctionBody=!0;this.lookahead.type!==2&&!this.match(`}`);)t.push(this.parseStatementListItem());return this.expect(`}`),this.context.labelSet=n,this.context.inIteration=r,this.context.inSwitch=i,this.context.inFunctionBody=a,this.finalize(e,new o.BlockStatement(t))},e.prototype.validateParam=function(e,t,n){var r=`$`+n;this.context.strict?(this.scanner.isRestrictedWord(n)&&(e.stricted=t,e.message=a.Messages.StrictParamName),Object.prototype.hasOwnProperty.call(e.paramSet,r)&&(e.stricted=t,e.message=a.Messages.StrictParamDupe)):e.firstRestricted||(this.scanner.isRestrictedWord(n)?(e.firstRestricted=t,e.message=a.Messages.StrictParamName):this.scanner.isStrictModeReservedWord(n)?(e.firstRestricted=t,e.message=a.Messages.StrictReservedWord):Object.prototype.hasOwnProperty.call(e.paramSet,r)&&(e.stricted=t,e.message=a.Messages.StrictParamDupe)),typeof Object.defineProperty==`function`?Object.defineProperty(e.paramSet,r,{value:!0,enumerable:!0,writable:!0,configurable:!0}):e.paramSet[r]=!0},e.prototype.parseRestElement=function(e){var t=this.createNode();this.expect(`...`);var n=this.parsePattern(e);return this.match(`=`)&&this.throwError(a.Messages.DefaultRestParameter),this.match(`)`)||this.throwError(a.Messages.ParameterAfterRestParameter),this.finalize(t,new o.RestElement(n))},e.prototype.parseFormalParameter=function(e){for(var t=[],n=this.match(`...`)?this.parseRestElement(t):this.parsePatternWithDefault(t),r=0;r<t.length;r++)this.validateParam(e,t[r],t[r].value);e.simple=e.simple&&n instanceof o.Identifier,e.params.push(n)},e.prototype.parseFormalParameters=function(e){var t={simple:!0,params:[],firstRestricted:e};if(this.expect(`(`),!this.match(`)`))for(t.paramSet={};this.lookahead.type!==2&&(this.parseFormalParameter(t),!(this.match(`)`)||(this.expect(`,`),this.match(`)`)))););return this.expect(`)`),{simple:t.simple,params:t.params,stricted:t.stricted,firstRestricted:t.firstRestricted,message:t.message}},e.prototype.matchAsyncFunction=function(){var e=this.matchContextualKeyword(`async`);if(e){var t=this.scanner.saveState();this.scanner.scanComments();var n=this.scanner.lex();this.scanner.restoreState(t),e=t.lineNumber===n.lineNumber&&n.type===4&&n.value===`function`}return e},e.prototype.parseFunctionDeclaration=function(e){var t=this.createNode(),n=this.matchContextualKeyword(`async`);n&&this.nextToken(),this.expectKeyword(`function`);var r=n?!1:this.match(`*`);r&&this.nextToken();var i,s=null,c=null;if(!e||!this.match(`(`)){var l=this.lookahead;s=this.parseVariableIdentifier(),this.context.strict?this.scanner.isRestrictedWord(l.value)&&this.tolerateUnexpectedToken(l,a.Messages.StrictFunctionName):this.scanner.isRestrictedWord(l.value)?(c=l,i=a.Messages.StrictFunctionName):this.scanner.isStrictModeReservedWord(l.value)&&(c=l,i=a.Messages.StrictReservedWord)}var u=this.context.await,d=this.context.allowYield;this.context.await=n,this.context.allowYield=!r;var f=this.parseFormalParameters(c),p=f.params,m=f.stricted;c=f.firstRestricted,f.message&&(i=f.message);var h=this.context.strict,g=this.context.allowStrictDirective;this.context.allowStrictDirective=f.simple;var _=this.parseFunctionSourceElements();return this.context.strict&&c&&this.throwUnexpectedToken(c,i),this.context.strict&&m&&this.tolerateUnexpectedToken(m,i),this.context.strict=h,this.context.allowStrictDirective=g,this.context.await=u,this.context.allowYield=d,n?this.finalize(t,new o.AsyncFunctionDeclaration(s,p,_)):this.finalize(t,new o.FunctionDeclaration(s,p,_,r))},e.prototype.parseFunctionExpression=function(){var e=this.createNode(),t=this.matchContextualKeyword(`async`);t&&this.nextToken(),this.expectKeyword(`function`);var n=t?!1:this.match(`*`);n&&this.nextToken();var r,i=null,s,c=this.context.await,l=this.context.allowYield;if(this.context.await=t,this.context.allowYield=!n,!this.match(`(`)){var u=this.lookahead;i=!this.context.strict&&!n&&this.matchKeyword(`yield`)?this.parseIdentifierName():this.parseVariableIdentifier(),this.context.strict?this.scanner.isRestrictedWord(u.value)&&this.tolerateUnexpectedToken(u,a.Messages.StrictFunctionName):this.scanner.isRestrictedWord(u.value)?(s=u,r=a.Messages.StrictFunctionName):this.scanner.isStrictModeReservedWord(u.value)&&(s=u,r=a.Messages.StrictReservedWord)}var d=this.parseFormalParameters(s),f=d.params,p=d.stricted;s=d.firstRestricted,d.message&&(r=d.message);var m=this.context.strict,h=this.context.allowStrictDirective;this.context.allowStrictDirective=d.simple;var g=this.parseFunctionSourceElements();return this.context.strict&&s&&this.throwUnexpectedToken(s,r),this.context.strict&&p&&this.tolerateUnexpectedToken(p,r),this.context.strict=m,this.context.allowStrictDirective=h,this.context.await=c,this.context.allowYield=l,t?this.finalize(e,new o.AsyncFunctionExpression(i,f,g)):this.finalize(e,new o.FunctionExpression(i,f,g,n))},e.prototype.parseDirective=function(){var e=this.lookahead,t=this.createNode(),n=this.parseExpression(),r=n.type===c.Syntax.Literal?this.getTokenRaw(e).slice(1,-1):null;return this.consumeSemicolon(),this.finalize(t,r?new o.Directive(n,r):new o.ExpressionStatement(n))},e.prototype.parseDirectivePrologues=function(){for(var e=null,t=[];;){var n=this.lookahead;if(n.type!==8)break;var r=this.parseDirective();t.push(r);var i=r.directive;if(typeof i!=`string`)break;i===`use strict`?(this.context.strict=!0,e&&this.tolerateUnexpectedToken(e,a.Messages.StrictOctalLiteral),this.context.allowStrictDirective||this.tolerateUnexpectedToken(n,a.Messages.IllegalLanguageModeDirective)):!e&&n.octal&&(e=n)}return t},e.prototype.qualifiedPropertyName=function(e){switch(e.type){case 3:case 8:case 1:case 5:case 6:case 4:return!0;case 7:return e.value===`[`;default:break}return!1},e.prototype.parseGetterMethod=function(){var e=this.createNode(),t=!1,n=this.context.allowYield;this.context.allowYield=!t;var r=this.parseFormalParameters();r.params.length>0&&this.tolerateError(a.Messages.BadGetterArity);var i=this.parsePropertyMethod(r);return this.context.allowYield=n,this.finalize(e,new o.FunctionExpression(null,r.params,i,t))},e.prototype.parseSetterMethod=function(){var e=this.createNode(),t=!1,n=this.context.allowYield;this.context.allowYield=!t;var r=this.parseFormalParameters();r.params.length===1?r.params[0]instanceof o.RestElement&&this.tolerateError(a.Messages.BadSetterRestParameter):this.tolerateError(a.Messages.BadSetterArity);var i=this.parsePropertyMethod(r);return this.context.allowYield=n,this.finalize(e,new o.FunctionExpression(null,r.params,i,t))},e.prototype.parseGeneratorMethod=function(){var e=this.createNode(),t=!0,n=this.context.allowYield;this.context.allowYield=!0;var r=this.parseFormalParameters();this.context.allowYield=!1;var i=this.parsePropertyMethod(r);return this.context.allowYield=n,this.finalize(e,new o.FunctionExpression(null,r.params,i,t))},e.prototype.isStartOfExpression=function(){var e=!0,t=this.lookahead.value;switch(this.lookahead.type){case 7:e=t===`[`||t===`(`||t===`{`||t===`+`||t===`-`||t===`!`||t===`~`||t===`++`||t===`--`||t===`/`||t===`/=`;break;case 4:e=t===`class`||t===`delete`||t===`function`||t===`let`||t===`new`||t===`super`||t===`this`||t===`typeof`||t===`void`||t===`yield`;break;default:break}return e},e.prototype.parseYieldExpression=function(){var e=this.createNode();this.expectKeyword(`yield`);var t=null,n=!1;if(!this.hasLineTerminator){var r=this.context.allowYield;this.context.allowYield=!1,n=this.match(`*`),n?(this.nextToken(),t=this.parseAssignmentExpression()):this.isStartOfExpression()&&(t=this.parseAssignmentExpression()),this.context.allowYield=r}return this.finalize(e,new o.YieldExpression(t,n))},e.prototype.parseClassElement=function(e){var t=this.lookahead,n=this.createNode(),r=``,i=null,s=null,c=!1,l=!1,u=!1,d=!1;if(this.match(`*`))this.nextToken();else if(c=this.match(`[`),i=this.parseObjectPropertyKey(),i.name===`static`&&(this.qualifiedPropertyName(this.lookahead)||this.match(`*`))&&(t=this.lookahead,u=!0,c=this.match(`[`),this.match(`*`)?this.nextToken():i=this.parseObjectPropertyKey()),t.type===3&&!this.hasLineTerminator&&t.value===`async`){var f=this.lookahead.value;f!==`:`&&f!==`(`&&f!==`*`&&(d=!0,t=this.lookahead,i=this.parseObjectPropertyKey(),t.type===3&&t.value===`constructor`&&this.tolerateUnexpectedToken(t,a.Messages.ConstructorIsAsync))}var p=this.qualifiedPropertyName(this.lookahead);return t.type===3?t.value===`get`&&p?(r=`get`,c=this.match(`[`),i=this.parseObjectPropertyKey(),this.context.allowYield=!1,s=this.parseGetterMethod()):t.value===`set`&&p&&(r=`set`,c=this.match(`[`),i=this.parseObjectPropertyKey(),s=this.parseSetterMethod()):t.type===7&&t.value===`*`&&p&&(r=`init`,c=this.match(`[`),i=this.parseObjectPropertyKey(),s=this.parseGeneratorMethod(),l=!0),!r&&i&&this.match(`(`)&&(r=`init`,s=d?this.parsePropertyMethodAsyncFunction():this.parsePropertyMethodFunction(),l=!0),r||this.throwUnexpectedToken(this.lookahead),r===`init`&&(r=`method`),c||(u&&this.isPropertyKey(i,`prototype`)&&this.throwUnexpectedToken(t,a.Messages.StaticPrototype),!u&&this.isPropertyKey(i,`constructor`)&&((r!==`method`||!l||s&&s.generator)&&this.throwUnexpectedToken(t,a.Messages.ConstructorSpecialMethod),e.value?this.throwUnexpectedToken(t,a.Messages.DuplicateConstructor):e.value=!0,r=`constructor`)),this.finalize(n,new o.MethodDefinition(i,c,s,r,u))},e.prototype.parseClassElementList=function(){var e=[],t={value:!1};for(this.expect(`{`);!this.match(`}`);)this.match(`;`)?this.nextToken():e.push(this.parseClassElement(t));return this.expect(`}`),e},e.prototype.parseClassBody=function(){var e=this.createNode(),t=this.parseClassElementList();return this.finalize(e,new o.ClassBody(t))},e.prototype.parseClassDeclaration=function(e){var t=this.createNode(),n=this.context.strict;this.context.strict=!0,this.expectKeyword(`class`);var r=e&&this.lookahead.type!==3?null:this.parseVariableIdentifier(),i=null;this.matchKeyword(`extends`)&&(this.nextToken(),i=this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));var a=this.parseClassBody();return this.context.strict=n,this.finalize(t,new o.ClassDeclaration(r,i,a))},e.prototype.parseClassExpression=function(){var e=this.createNode(),t=this.context.strict;this.context.strict=!0,this.expectKeyword(`class`);var n=this.lookahead.type===3?this.parseVariableIdentifier():null,r=null;this.matchKeyword(`extends`)&&(this.nextToken(),r=this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall));var i=this.parseClassBody();return this.context.strict=t,this.finalize(e,new o.ClassExpression(n,r,i))},e.prototype.parseModule=function(){this.context.strict=!0,this.context.isModule=!0,this.scanner.isModule=!0;for(var e=this.createNode(),t=this.parseDirectivePrologues();this.lookahead.type!==2;)t.push(this.parseStatementListItem());return this.finalize(e,new o.Module(t))},e.prototype.parseScript=function(){for(var e=this.createNode(),t=this.parseDirectivePrologues();this.lookahead.type!==2;)t.push(this.parseStatementListItem());return this.finalize(e,new o.Script(t))},e.prototype.parseModuleSpecifier=function(){var e=this.createNode();this.lookahead.type!==8&&this.throwError(a.Messages.InvalidModuleSpecifier);var t=this.nextToken(),n=this.getTokenRaw(t);return this.finalize(e,new o.Literal(t.value,n))},e.prototype.parseImportSpecifier=function(){var e=this.createNode(),t,n;return this.lookahead.type===3?(t=this.parseVariableIdentifier(),n=t,this.matchContextualKeyword(`as`)&&(this.nextToken(),n=this.parseVariableIdentifier())):(t=this.parseIdentifierName(),n=t,this.matchContextualKeyword(`as`)?(this.nextToken(),n=this.parseVariableIdentifier()):this.throwUnexpectedToken(this.nextToken())),this.finalize(e,new o.ImportSpecifier(n,t))},e.prototype.parseNamedImports=function(){this.expect(`{`);for(var e=[];!this.match(`}`);)e.push(this.parseImportSpecifier()),this.match(`}`)||this.expect(`,`);return this.expect(`}`),e},e.prototype.parseImportDefaultSpecifier=function(){var e=this.createNode(),t=this.parseIdentifierName();return this.finalize(e,new o.ImportDefaultSpecifier(t))},e.prototype.parseImportNamespaceSpecifier=function(){var e=this.createNode();this.expect(`*`),this.matchContextualKeyword(`as`)||this.throwError(a.Messages.NoAsAfterImportNamespace),this.nextToken();var t=this.parseIdentifierName();return this.finalize(e,new o.ImportNamespaceSpecifier(t))},e.prototype.parseImportDeclaration=function(){this.context.inFunctionBody&&this.throwError(a.Messages.IllegalImportDeclaration);var e=this.createNode();this.expectKeyword(`import`);var t,n=[];if(this.lookahead.type===8)t=this.parseModuleSpecifier();else{if(this.match(`{`)?n=n.concat(this.parseNamedImports()):this.match(`*`)?n.push(this.parseImportNamespaceSpecifier()):this.isIdentifierName(this.lookahead)&&!this.matchKeyword(`default`)?(n.push(this.parseImportDefaultSpecifier()),this.match(`,`)&&(this.nextToken(),this.match(`*`)?n.push(this.parseImportNamespaceSpecifier()):this.match(`{`)?n=n.concat(this.parseNamedImports()):this.throwUnexpectedToken(this.lookahead))):this.throwUnexpectedToken(this.nextToken()),!this.matchContextualKeyword(`from`)){var r=this.lookahead.value?a.Messages.UnexpectedToken:a.Messages.MissingFromClause;this.throwError(r,this.lookahead.value)}this.nextToken(),t=this.parseModuleSpecifier()}return this.consumeSemicolon(),this.finalize(e,new o.ImportDeclaration(n,t))},e.prototype.parseExportSpecifier=function(){var e=this.createNode(),t=this.parseIdentifierName(),n=t;return this.matchContextualKeyword(`as`)&&(this.nextToken(),n=this.parseIdentifierName()),this.finalize(e,new o.ExportSpecifier(t,n))},e.prototype.parseExportDeclaration=function(){this.context.inFunctionBody&&this.throwError(a.Messages.IllegalExportDeclaration);var e=this.createNode();this.expectKeyword(`export`);var t;if(this.matchKeyword(`default`))if(this.nextToken(),this.matchKeyword(`function`)){var n=this.parseFunctionDeclaration(!0);t=this.finalize(e,new o.ExportDefaultDeclaration(n))}else if(this.matchKeyword(`class`)){var n=this.parseClassDeclaration(!0);t=this.finalize(e,new o.ExportDefaultDeclaration(n))}else if(this.matchContextualKeyword(`async`)){var n=this.matchAsyncFunction()?this.parseFunctionDeclaration(!0):this.parseAssignmentExpression();t=this.finalize(e,new o.ExportDefaultDeclaration(n))}else{this.matchContextualKeyword(`from`)&&this.throwError(a.Messages.UnexpectedToken,this.lookahead.value);var n=this.match(`{`)?this.parseObjectInitializer():this.match(`[`)?this.parseArrayInitializer():this.parseAssignmentExpression();this.consumeSemicolon(),t=this.finalize(e,new o.ExportDefaultDeclaration(n))}else if(this.match(`*`)){if(this.nextToken(),!this.matchContextualKeyword(`from`)){var r=this.lookahead.value?a.Messages.UnexpectedToken:a.Messages.MissingFromClause;this.throwError(r,this.lookahead.value)}this.nextToken();var i=this.parseModuleSpecifier();this.consumeSemicolon(),t=this.finalize(e,new o.ExportAllDeclaration(i))}else if(this.lookahead.type===4){var n=void 0;switch(this.lookahead.value){case`let`:case`const`:n=this.parseLexicalDeclaration({inFor:!1});break;case`var`:case`class`:case`function`:n=this.parseStatementListItem();break;default:this.throwUnexpectedToken(this.lookahead)}t=this.finalize(e,new o.ExportNamedDeclaration(n,[],null))}else if(this.matchAsyncFunction()){var n=this.parseFunctionDeclaration();t=this.finalize(e,new o.ExportNamedDeclaration(n,[],null))}else{var s=[],c=null,l=!1;for(this.expect(`{`);!this.match(`}`);)l||=this.matchKeyword(`default`),s.push(this.parseExportSpecifier()),this.match(`}`)||this.expect(`,`);if(this.expect(`}`),this.matchContextualKeyword(`from`))this.nextToken(),c=this.parseModuleSpecifier(),this.consumeSemicolon();else if(l){var r=this.lookahead.value?a.Messages.UnexpectedToken:a.Messages.MissingFromClause;this.throwError(r,this.lookahead.value)}else this.consumeSemicolon();t=this.finalize(e,new o.ExportNamedDeclaration(null,s,c))}return t},e}()},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0});function n(e,t){if(!e)throw Error(`ASSERT: `+t)}t.assert=n},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.ErrorHandler=function(){function e(){this.errors=[],this.tolerant=!1}return e.prototype.recordError=function(e){this.errors.push(e)},e.prototype.tolerate=function(e){if(this.tolerant)this.recordError(e);else throw e},e.prototype.constructError=function(e,t){var n=Error(e);try{throw n}catch(e){Object.create&&Object.defineProperty&&(n=Object.create(e),Object.defineProperty(n,`column`,{value:t}))}return n},e.prototype.createError=function(e,t,n,r){var i=`Line `+t+`: `+r,a=this.constructError(i,n);return a.index=e,a.lineNumber=t,a.description=r,a},e.prototype.throwError=function(e,t,n,r){throw this.createError(e,t,n,r)},e.prototype.tolerateError=function(e,t,n,r){var i=this.createError(e,t,n,r);if(this.tolerant)this.recordError(i);else throw i},e}()},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.Messages={BadGetterArity:`Getter must not have any formal parameters`,BadSetterArity:`Setter must have exactly one formal parameter`,BadSetterRestParameter:`Setter function argument must not be a rest parameter`,ConstructorIsAsync:`Class constructor may not be an async method`,ConstructorSpecialMethod:`Class constructor may not be an accessor`,DeclarationMissingInitializer:`Missing initializer in %0 declaration`,DefaultRestParameter:`Unexpected token =`,DuplicateBinding:`Duplicate binding %0`,DuplicateConstructor:`A class may only have one constructor`,DuplicateProtoProperty:`Duplicate __proto__ fields are not allowed in object literals`,ForInOfLoopInitializer:`%0 loop variable declaration may not have an initializer`,GeneratorInLegacyContext:`Generator declarations are not allowed in legacy contexts`,IllegalBreak:`Illegal break statement`,IllegalContinue:`Illegal continue statement`,IllegalExportDeclaration:`Unexpected token`,IllegalImportDeclaration:`Unexpected token`,IllegalLanguageModeDirective:`Illegal 'use strict' directive in function with non-simple parameter list`,IllegalReturn:`Illegal return statement`,InvalidEscapedReservedWord:`Keyword must not contain escaped characters`,InvalidHexEscapeSequence:`Invalid hexadecimal escape sequence`,InvalidLHSInAssignment:`Invalid left-hand side in assignment`,InvalidLHSInForIn:`Invalid left-hand side in for-in`,InvalidLHSInForLoop:`Invalid left-hand side in for-loop`,InvalidModuleSpecifier:`Unexpected token`,InvalidRegExp:`Invalid regular expression`,LetInLexicalBinding:`let is disallowed as a lexically bound name`,MissingFromClause:`Unexpected token`,MultipleDefaultsInSwitch:`More than one default clause in switch statement`,NewlineAfterThrow:`Illegal newline after throw`,NoAsAfterImportNamespace:`Unexpected token`,NoCatchOrFinally:`Missing catch or finally after try`,ParameterAfterRestParameter:`Rest parameter must be last formal parameter`,Redeclaration:`%0 '%1' has already been declared`,StaticPrototype:`Classes may not have static property named prototype`,StrictCatchVariable:`Catch variable may not be eval or arguments in strict mode`,StrictDelete:`Delete of an unqualified identifier in strict mode.`,StrictFunction:`In strict mode code, functions can only be declared at top level or inside a block`,StrictFunctionName:`Function name may not be eval or arguments in strict mode`,StrictLHSAssignment:`Assignment to eval or arguments is not allowed in strict mode`,StrictLHSPostfix:`Postfix increment/decrement may not have eval or arguments operand in strict mode`,StrictLHSPrefix:`Prefix increment/decrement may not have eval or arguments operand in strict mode`,StrictModeWith:`Strict mode code may not include a with statement`,StrictOctalLiteral:`Octal literals are not allowed in strict mode.`,StrictParamDupe:`Strict mode function may not have duplicate parameter names`,StrictParamName:`Parameter name eval or arguments is not allowed in strict mode`,StrictReservedWord:`Use of future reserved word in strict mode`,StrictVarName:`Variable name may not be eval or arguments in strict mode`,TemplateOctalLiteral:`Octal literals are not allowed in template strings.`,UnexpectedEOS:`Unexpected end of input`,UnexpectedIdentifier:`Unexpected identifier`,UnexpectedNumber:`Unexpected number`,UnexpectedReserved:`Unexpected reserved word`,UnexpectedString:`Unexpected string`,UnexpectedTemplate:`Unexpected quasi %0`,UnexpectedToken:`Unexpected token %0`,UnexpectedTokenIllegal:`Unexpected token ILLEGAL`,UnknownLabel:`Undefined label '%0'`,UnterminatedRegExp:`Invalid regular expression: missing /`}},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(9),i=n(4),a=n(11);function o(e){return`0123456789abcdef`.indexOf(e.toLowerCase())}function s(e){return`01234567`.indexOf(e)}t.Scanner=function(){function e(e,t){this.source=e,this.errorHandler=t,this.trackComment=!1,this.isModule=!1,this.length=e.length,this.index=0,this.lineNumber=e.length>0?1:0,this.lineStart=0,this.curlyStack=[]}return e.prototype.saveState=function(){return{index:this.index,lineNumber:this.lineNumber,lineStart:this.lineStart}},e.prototype.restoreState=function(e){this.index=e.index,this.lineNumber=e.lineNumber,this.lineStart=e.lineStart},e.prototype.eof=function(){return this.index>=this.length},e.prototype.throwUnexpectedToken=function(e){return e===void 0&&(e=a.Messages.UnexpectedTokenIllegal),this.errorHandler.throwError(this.index,this.lineNumber,this.index-this.lineStart+1,e)},e.prototype.tolerateUnexpectedToken=function(e){e===void 0&&(e=a.Messages.UnexpectedTokenIllegal),this.errorHandler.tolerateError(this.index,this.lineNumber,this.index-this.lineStart+1,e)},e.prototype.skipSingleLineComment=function(e){var t=[],n,r;for(this.trackComment&&(t=[],n=this.index-e,r={start:{line:this.lineNumber,column:this.index-this.lineStart-e},end:{}});!this.eof();){var a=this.source.charCodeAt(this.index);if(++this.index,i.Character.isLineTerminator(a)){if(this.trackComment){r.end={line:this.lineNumber,column:this.index-this.lineStart-1};var o={multiLine:!1,slice:[n+e,this.index-1],range:[n,this.index-1],loc:r};t.push(o)}return a===13&&this.source.charCodeAt(this.index)===10&&++this.index,++this.lineNumber,this.lineStart=this.index,t}}if(this.trackComment){r.end={line:this.lineNumber,column:this.index-this.lineStart};var o={multiLine:!1,slice:[n+e,this.index],range:[n,this.index],loc:r};t.push(o)}return t},e.prototype.skipMultiLineComment=function(){var e=[],t,n;for(this.trackComment&&(e=[],t=this.index-2,n={start:{line:this.lineNumber,column:this.index-this.lineStart-2},end:{}});!this.eof();){var r=this.source.charCodeAt(this.index);if(i.Character.isLineTerminator(r))r===13&&this.source.charCodeAt(this.index+1)===10&&++this.index,++this.lineNumber,++this.index,this.lineStart=this.index;else if(r===42){if(this.source.charCodeAt(this.index+1)===47){if(this.index+=2,this.trackComment){n.end={line:this.lineNumber,column:this.index-this.lineStart};var a={multiLine:!0,slice:[t+2,this.index-2],range:[t,this.index],loc:n};e.push(a)}return e}++this.index}else ++this.index}if(this.trackComment){n.end={line:this.lineNumber,column:this.index-this.lineStart};var a={multiLine:!0,slice:[t+2,this.index],range:[t,this.index],loc:n};e.push(a)}return this.tolerateUnexpectedToken(),e},e.prototype.scanComments=function(){var e;this.trackComment&&(e=[]);for(var t=this.index===0;!this.eof();){var n=this.source.charCodeAt(this.index);if(i.Character.isWhiteSpace(n))++this.index;else if(i.Character.isLineTerminator(n))++this.index,n===13&&this.source.charCodeAt(this.index)===10&&++this.index,++this.lineNumber,this.lineStart=this.index,t=!0;else if(n===47)if(n=this.source.charCodeAt(this.index+1),n===47){this.index+=2;var r=this.skipSingleLineComment(2);this.trackComment&&(e=e.concat(r)),t=!0}else if(n===42){this.index+=2;var r=this.skipMultiLineComment();this.trackComment&&(e=e.concat(r))}else break;else if(t&&n===45)if(this.source.charCodeAt(this.index+1)===45&&this.source.charCodeAt(this.index+2)===62){this.index+=3;var r=this.skipSingleLineComment(3);this.trackComment&&(e=e.concat(r))}else break;else if(n===60&&!this.isModule)if(this.source.slice(this.index+1,this.index+4)===`!--`){this.index+=4;var r=this.skipSingleLineComment(4);this.trackComment&&(e=e.concat(r))}else break;else break}return e},e.prototype.isFutureReservedWord=function(e){switch(e){case`enum`:case`export`:case`import`:case`super`:return!0;default:return!1}},e.prototype.isStrictModeReservedWord=function(e){switch(e){case`implements`:case`interface`:case`package`:case`private`:case`protected`:case`public`:case`static`:case`yield`:case`let`:return!0;default:return!1}},e.prototype.isRestrictedWord=function(e){return e===`eval`||e===`arguments`},e.prototype.isKeyword=function(e){switch(e.length){case 2:return e===`if`||e===`in`||e===`do`;case 3:return e===`var`||e===`for`||e===`new`||e===`try`||e===`let`;case 4:return e===`this`||e===`else`||e===`case`||e===`void`||e===`with`||e===`enum`;case 5:return e===`while`||e===`break`||e===`catch`||e===`throw`||e===`const`||e===`yield`||e===`class`||e===`super`;case 6:return e===`return`||e===`typeof`||e===`delete`||e===`switch`||e===`export`||e===`import`;case 7:return e===`default`||e===`finally`||e===`extends`;case 8:return e===`function`||e===`continue`||e===`debugger`;case 10:return e===`instanceof`;default:return!1}},e.prototype.codePointAt=function(e){var t=this.source.charCodeAt(e);if(t>=55296&&t<=56319){var n=this.source.charCodeAt(e+1);n>=56320&&n<=57343&&(t=(t-55296)*1024+n-56320+65536)}return t},e.prototype.scanHexEscape=function(e){for(var t=e===`u`?4:2,n=0,r=0;r<t;++r)if(!this.eof()&&i.Character.isHexDigit(this.source.charCodeAt(this.index)))n=n*16+o(this.source[this.index++]);else return null;return String.fromCharCode(n)},e.prototype.scanUnicodeCodePointEscape=function(){var e=this.source[this.index],t=0;for(e===`}`&&this.throwUnexpectedToken();!this.eof()&&(e=this.source[this.index++],i.Character.isHexDigit(e.charCodeAt(0)));)t=t*16+o(e);return(t>1114111||e!==`}`)&&this.throwUnexpectedToken(),i.Character.fromCodePoint(t)},e.prototype.getIdentifier=function(){for(var e=this.index++;!this.eof();){var t=this.source.charCodeAt(this.index);if(t===92||t>=55296&&t<57343)return this.index=e,this.getComplexIdentifier();if(i.Character.isIdentifierPart(t))++this.index;else break}return this.source.slice(e,this.index)},e.prototype.getComplexIdentifier=function(){var e=this.codePointAt(this.index),t=i.Character.fromCodePoint(e);this.index+=t.length;var n;for(e===92&&(this.source.charCodeAt(this.index)!==117&&this.throwUnexpectedToken(),++this.index,this.source[this.index]===`{`?(++this.index,n=this.scanUnicodeCodePointEscape()):(n=this.scanHexEscape(`u`),(n===null||n===`\\`||!i.Character.isIdentifierStart(n.charCodeAt(0)))&&this.throwUnexpectedToken()),t=n);!this.eof()&&(e=this.codePointAt(this.index),i.Character.isIdentifierPart(e));)n=i.Character.fromCodePoint(e),t+=n,this.index+=n.length,e===92&&(t=t.substr(0,t.length-1),this.source.charCodeAt(this.index)!==117&&this.throwUnexpectedToken(),++this.index,this.source[this.index]===`{`?(++this.index,n=this.scanUnicodeCodePointEscape()):(n=this.scanHexEscape(`u`),(n===null||n===`\\`||!i.Character.isIdentifierPart(n.charCodeAt(0)))&&this.throwUnexpectedToken()),t+=n);return t},e.prototype.octalToDecimal=function(e){var t=e!==`0`,n=s(e);return!this.eof()&&i.Character.isOctalDigit(this.source.charCodeAt(this.index))&&(t=!0,n=n*8+s(this.source[this.index++]),`0123`.indexOf(e)>=0&&!this.eof()&&i.Character.isOctalDigit(this.source.charCodeAt(this.index))&&(n=n*8+s(this.source[this.index++]))),{code:n,octal:t}},e.prototype.scanIdentifier=function(){var e,t=this.index,n=this.source.charCodeAt(t)===92?this.getComplexIdentifier():this.getIdentifier();if(e=n.length===1?3:this.isKeyword(n)?4:n===`null`?5:n===`true`||n===`false`?1:3,e!==3&&t+n.length!==this.index){var r=this.index;this.index=t,this.tolerateUnexpectedToken(a.Messages.InvalidEscapedReservedWord),this.index=r}return{type:e,value:n,lineNumber:this.lineNumber,lineStart:this.lineStart,start:t,end:this.index}},e.prototype.scanPunctuator=function(){var e=this.index,t=this.source[this.index];switch(t){case`(`:case`{`:t===`{`&&this.curlyStack.push(`{`),++this.index;break;case`.`:++this.index,this.source[this.index]===`.`&&this.source[this.index+1]===`.`&&(this.index+=2,t=`...`);break;case`}`:++this.index,this.curlyStack.pop();break;case`)`:case`;`:case`,`:case`[`:case`]`:case`:`:case`?`:case`~`:++this.index;break;default:t=this.source.substr(this.index,4),t===`>>>=`?this.index+=4:(t=t.substr(0,3),t===`===`||t===`!==`||t===`>>>`||t===`<<=`||t===`>>=`||t===`**=`?this.index+=3:(t=t.substr(0,2),t===`&&`||t===`||`||t===`==`||t===`!=`||t===`+=`||t===`-=`||t===`*=`||t===`/=`||t===`++`||t===`--`||t===`<<`||t===`>>`||t===`&=`||t===`|=`||t===`^=`||t===`%=`||t===`<=`||t===`>=`||t===`=>`||t===`**`?this.index+=2:(t=this.source[this.index],`<>=!+-*%&|^/`.indexOf(t)>=0&&++this.index)))}return this.index===e&&this.throwUnexpectedToken(),{type:7,value:t,lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.scanHexLiteral=function(e){for(var t=``;!this.eof()&&i.Character.isHexDigit(this.source.charCodeAt(this.index));)t+=this.source[this.index++];return t.length===0&&this.throwUnexpectedToken(),i.Character.isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseInt(`0x`+t,16),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.scanBinaryLiteral=function(e){for(var t=``,n;!this.eof()&&(n=this.source[this.index],!(n!==`0`&&n!==`1`));)t+=this.source[this.index++];return t.length===0&&this.throwUnexpectedToken(),this.eof()||(n=this.source.charCodeAt(this.index),(i.Character.isIdentifierStart(n)||i.Character.isDecimalDigit(n))&&this.throwUnexpectedToken()),{type:6,value:parseInt(t,2),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.scanOctalLiteral=function(e,t){var n=``,r=!1;for(i.Character.isOctalDigit(e.charCodeAt(0))?(r=!0,n=`0`+this.source[this.index++]):++this.index;!this.eof()&&i.Character.isOctalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];return!r&&n.length===0&&this.throwUnexpectedToken(),(i.Character.isIdentifierStart(this.source.charCodeAt(this.index))||i.Character.isDecimalDigit(this.source.charCodeAt(this.index)))&&this.throwUnexpectedToken(),{type:6,value:parseInt(n,8),octal:r,lineNumber:this.lineNumber,lineStart:this.lineStart,start:t,end:this.index}},e.prototype.isImplicitOctalLiteral=function(){for(var e=this.index+1;e<this.length;++e){var t=this.source[e];if(t===`8`||t===`9`)return!1;if(!i.Character.isOctalDigit(t.charCodeAt(0)))return!0}return!0},e.prototype.scanNumericLiteral=function(){var e=this.index,t=this.source[e];r.assert(i.Character.isDecimalDigit(t.charCodeAt(0))||t===`.`,`Numeric literal must start with a decimal digit or a decimal point`);var n=``;if(t!==`.`){if(n=this.source[this.index++],t=this.source[this.index],n===`0`){if(t===`x`||t===`X`)return++this.index,this.scanHexLiteral(e);if(t===`b`||t===`B`)return++this.index,this.scanBinaryLiteral(e);if(t===`o`||t===`O`||t&&i.Character.isOctalDigit(t.charCodeAt(0))&&this.isImplicitOctalLiteral())return this.scanOctalLiteral(t,e)}for(;i.Character.isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];t=this.source[this.index]}if(t===`.`){for(n+=this.source[this.index++];i.Character.isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];t=this.source[this.index]}if(t===`e`||t===`E`)if(n+=this.source[this.index++],t=this.source[this.index],(t===`+`||t===`-`)&&(n+=this.source[this.index++]),i.Character.isDecimalDigit(this.source.charCodeAt(this.index)))for(;i.Character.isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];else this.throwUnexpectedToken();return i.Character.isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseFloat(n),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.scanStringLiteral=function(){var e=this.index,t=this.source[e];r.assert(t===`'`||t===`"`,`String literal must starts with a quote`),++this.index;for(var n=!1,o=``;!this.eof();){var s=this.source[this.index++];if(s===t){t=``;break}else if(s===`\\`)if(s=this.source[this.index++],!s||!i.Character.isLineTerminator(s.charCodeAt(0)))switch(s){case`u`:if(this.source[this.index]===`{`)++this.index,o+=this.scanUnicodeCodePointEscape();else{var c=this.scanHexEscape(s);c===null&&this.throwUnexpectedToken(),o+=c}break;case`x`:var l=this.scanHexEscape(s);l===null&&this.throwUnexpectedToken(a.Messages.InvalidHexEscapeSequence),o+=l;break;case`n`:o+=`
`;break;case`r`:o+=`\r`;break;case`t`:o+=`	`;break;case`b`:o+=`\b`;break;case`f`:o+=`\f`;break;case`v`:o+=`\v`;break;case`8`:case`9`:o+=s,this.tolerateUnexpectedToken();break;default:if(s&&i.Character.isOctalDigit(s.charCodeAt(0))){var u=this.octalToDecimal(s);n=u.octal||n,o+=String.fromCharCode(u.code)}else o+=s;break}else ++this.lineNumber,s===`\r`&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index;else if(i.Character.isLineTerminator(s.charCodeAt(0)))break;else o+=s}return t!==``&&(this.index=e,this.throwUnexpectedToken()),{type:8,value:o,octal:n,lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.scanTemplate=function(){var e=``,t=!1,n=this.index,r=this.source[n]==="`",o=!1,s=2;for(++this.index;!this.eof();){var c=this.source[this.index++];if(c==="`"){s=1,o=!0,t=!0;break}else if(c===`$`){if(this.source[this.index]===`{`){this.curlyStack.push("${"),++this.index,t=!0;break}e+=c}else if(c===`\\`)if(c=this.source[this.index++],i.Character.isLineTerminator(c.charCodeAt(0)))++this.lineNumber,c===`\r`&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index;else switch(c){case`n`:e+=`
`;break;case`r`:e+=`\r`;break;case`t`:e+=`	`;break;case`u`:if(this.source[this.index]===`{`)++this.index,e+=this.scanUnicodeCodePointEscape();else{var l=this.index,u=this.scanHexEscape(c);u===null?(this.index=l,e+=c):e+=u}break;case`x`:var d=this.scanHexEscape(c);d===null&&this.throwUnexpectedToken(a.Messages.InvalidHexEscapeSequence),e+=d;break;case`b`:e+=`\b`;break;case`f`:e+=`\f`;break;case`v`:e+=`\v`;break;default:c===`0`?(i.Character.isDecimalDigit(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(a.Messages.TemplateOctalLiteral),e+=`\0`):i.Character.isOctalDigit(c.charCodeAt(0))?this.throwUnexpectedToken(a.Messages.TemplateOctalLiteral):e+=c;break}else i.Character.isLineTerminator(c.charCodeAt(0))?(++this.lineNumber,c===`\r`&&this.source[this.index]===`
`&&++this.index,this.lineStart=this.index,e+=`
`):e+=c}return t||this.throwUnexpectedToken(),r||this.curlyStack.pop(),{type:10,value:this.source.slice(n+1,this.index-s),cooked:e,head:r,tail:o,lineNumber:this.lineNumber,lineStart:this.lineStart,start:n,end:this.index}},e.prototype.testRegExp=function(e,t){var n=`￿`,r=e,i=this;t.indexOf(`u`)>=0&&(r=r.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g,function(e,t,r){var o=parseInt(t||r,16);return o>1114111&&i.throwUnexpectedToken(a.Messages.InvalidRegExp),o<=65535?String.fromCharCode(o):n}).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,n));try{RegExp(r)}catch{this.throwUnexpectedToken(a.Messages.InvalidRegExp)}try{return new RegExp(e,t)}catch{return null}},e.prototype.scanRegExpBody=function(){var e=this.source[this.index];r.assert(e===`/`,`Regular expression literal must start with a slash`);for(var t=this.source[this.index++],n=!1,o=!1;!this.eof();)if(e=this.source[this.index++],t+=e,e===`\\`)e=this.source[this.index++],i.Character.isLineTerminator(e.charCodeAt(0))&&this.throwUnexpectedToken(a.Messages.UnterminatedRegExp),t+=e;else if(i.Character.isLineTerminator(e.charCodeAt(0)))this.throwUnexpectedToken(a.Messages.UnterminatedRegExp);else if(n)e===`]`&&(n=!1);else if(e===`/`){o=!0;break}else e===`[`&&(n=!0);return o||this.throwUnexpectedToken(a.Messages.UnterminatedRegExp),t.substr(1,t.length-2)},e.prototype.scanRegExpFlags=function(){for(var e=``,t=``;!this.eof();){var n=this.source[this.index];if(!i.Character.isIdentifierPart(n.charCodeAt(0)))break;if(++this.index,n===`\\`&&!this.eof())if(n=this.source[this.index],n===`u`){++this.index;var r=this.index,a=this.scanHexEscape(`u`);if(a!==null)for(t+=a,e+=`\\u`;r<this.index;++r)e+=this.source[r];else this.index=r,t+=`u`,e+=`\\u`;this.tolerateUnexpectedToken()}else e+=`\\`,this.tolerateUnexpectedToken();else t+=n,e+=n}return t},e.prototype.scanRegExp=function(){var e=this.index,t=this.scanRegExpBody(),n=this.scanRegExpFlags();return{type:9,value:``,pattern:t,flags:n,regex:this.testRegExp(t,n),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}},e.prototype.lex=function(){if(this.eof())return{type:2,value:``,lineNumber:this.lineNumber,lineStart:this.lineStart,start:this.index,end:this.index};var e=this.source.charCodeAt(this.index);return i.Character.isIdentifierStart(e)?this.scanIdentifier():e===40||e===41||e===59?this.scanPunctuator():e===39||e===34?this.scanStringLiteral():e===46?i.Character.isDecimalDigit(this.source.charCodeAt(this.index+1))?this.scanNumericLiteral():this.scanPunctuator():i.Character.isDecimalDigit(e)?this.scanNumericLiteral():e===96||e===125&&this.curlyStack[this.curlyStack.length-1]==="${"?this.scanTemplate():e>=55296&&e<57343&&i.Character.isIdentifierStart(this.codePointAt(this.index))?this.scanIdentifier():this.scanPunctuator()},e}()},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.TokenName={},t.TokenName[1]=`Boolean`,t.TokenName[2]=`<end>`,t.TokenName[3]=`Identifier`,t.TokenName[4]=`Keyword`,t.TokenName[5]=`Null`,t.TokenName[6]=`Numeric`,t.TokenName[7]=`Punctuator`,t.TokenName[8]=`String`,t.TokenName[9]=`RegularExpression`,t.TokenName[10]=`Template`},function(e,t){Object.defineProperty(t,`__esModule`,{value:!0}),t.XHTMLEntities={quot:`"`,amp:`&`,apos:`'`,gt:`>`,nbsp:`\xA0`,iexcl:`¡`,cent:`¢`,pound:`£`,curren:`¤`,yen:`¥`,brvbar:`¦`,sect:`§`,uml:`¨`,copy:`©`,ordf:`ª`,laquo:`«`,not:`¬`,shy:`­`,reg:`®`,macr:`¯`,deg:`°`,plusmn:`±`,sup2:`²`,sup3:`³`,acute:`´`,micro:`µ`,para:`¶`,middot:`·`,cedil:`¸`,sup1:`¹`,ordm:`º`,raquo:`»`,frac14:`¼`,frac12:`½`,frac34:`¾`,iquest:`¿`,Agrave:`À`,Aacute:`Á`,Acirc:`Â`,Atilde:`Ã`,Auml:`Ä`,Aring:`Å`,AElig:`Æ`,Ccedil:`Ç`,Egrave:`È`,Eacute:`É`,Ecirc:`Ê`,Euml:`Ë`,Igrave:`Ì`,Iacute:`Í`,Icirc:`Î`,Iuml:`Ï`,ETH:`Ð`,Ntilde:`Ñ`,Ograve:`Ò`,Oacute:`Ó`,Ocirc:`Ô`,Otilde:`Õ`,Ouml:`Ö`,times:`×`,Oslash:`Ø`,Ugrave:`Ù`,Uacute:`Ú`,Ucirc:`Û`,Uuml:`Ü`,Yacute:`Ý`,THORN:`Þ`,szlig:`ß`,agrave:`à`,aacute:`á`,acirc:`â`,atilde:`ã`,auml:`ä`,aring:`å`,aelig:`æ`,ccedil:`ç`,egrave:`è`,eacute:`é`,ecirc:`ê`,euml:`ë`,igrave:`ì`,iacute:`í`,icirc:`î`,iuml:`ï`,eth:`ð`,ntilde:`ñ`,ograve:`ò`,oacute:`ó`,ocirc:`ô`,otilde:`õ`,ouml:`ö`,divide:`÷`,oslash:`ø`,ugrave:`ù`,uacute:`ú`,ucirc:`û`,uuml:`ü`,yacute:`ý`,thorn:`þ`,yuml:`ÿ`,OElig:`Œ`,oelig:`œ`,Scaron:`Š`,scaron:`š`,Yuml:`Ÿ`,fnof:`ƒ`,circ:`ˆ`,tilde:`˜`,Alpha:`Α`,Beta:`Β`,Gamma:`Γ`,Delta:`Δ`,Epsilon:`Ε`,Zeta:`Ζ`,Eta:`Η`,Theta:`Θ`,Iota:`Ι`,Kappa:`Κ`,Lambda:`Λ`,Mu:`Μ`,Nu:`Ν`,Xi:`Ξ`,Omicron:`Ο`,Pi:`Π`,Rho:`Ρ`,Sigma:`Σ`,Tau:`Τ`,Upsilon:`Υ`,Phi:`Φ`,Chi:`Χ`,Psi:`Ψ`,Omega:`Ω`,alpha:`α`,beta:`β`,gamma:`γ`,delta:`δ`,epsilon:`ε`,zeta:`ζ`,eta:`η`,theta:`θ`,iota:`ι`,kappa:`κ`,lambda:`λ`,mu:`μ`,nu:`ν`,xi:`ξ`,omicron:`ο`,pi:`π`,rho:`ρ`,sigmaf:`ς`,sigma:`σ`,tau:`τ`,upsilon:`υ`,phi:`φ`,chi:`χ`,psi:`ψ`,omega:`ω`,thetasym:`ϑ`,upsih:`ϒ`,piv:`ϖ`,ensp:` `,emsp:` `,thinsp:` `,zwnj:`‌`,zwj:`‍`,lrm:`‎`,rlm:`‏`,ndash:`–`,mdash:`—`,lsquo:`‘`,rsquo:`’`,sbquo:`‚`,ldquo:`“`,rdquo:`”`,bdquo:`„`,dagger:`†`,Dagger:`‡`,bull:`•`,hellip:`…`,permil:`‰`,prime:`′`,Prime:`″`,lsaquo:`‹`,rsaquo:`›`,oline:`‾`,frasl:`⁄`,euro:`€`,image:`ℑ`,weierp:`℘`,real:`ℜ`,trade:`™`,alefsym:`ℵ`,larr:`←`,uarr:`↑`,rarr:`→`,darr:`↓`,harr:`↔`,crarr:`↵`,lArr:`⇐`,uArr:`⇑`,rArr:`⇒`,dArr:`⇓`,hArr:`⇔`,forall:`∀`,part:`∂`,exist:`∃`,empty:`∅`,nabla:`∇`,isin:`∈`,notin:`∉`,ni:`∋`,prod:`∏`,sum:`∑`,minus:`−`,lowast:`∗`,radic:`√`,prop:`∝`,infin:`∞`,ang:`∠`,and:`∧`,or:`∨`,cap:`∩`,cup:`∪`,int:`∫`,there4:`∴`,sim:`∼`,cong:`≅`,asymp:`≈`,ne:`≠`,equiv:`≡`,le:`≤`,ge:`≥`,sub:`⊂`,sup:`⊃`,nsub:`⊄`,sube:`⊆`,supe:`⊇`,oplus:`⊕`,otimes:`⊗`,perp:`⊥`,sdot:`⋅`,lceil:`⌈`,rceil:`⌉`,lfloor:`⌊`,rfloor:`⌋`,loz:`◊`,spades:`♠`,clubs:`♣`,hearts:`♥`,diams:`♦`,lang:`⟨`,rang:`⟩`}},function(e,t,n){Object.defineProperty(t,`__esModule`,{value:!0});var r=n(10),i=n(12),a=n(13),o=function(){function e(){this.values=[],this.curly=this.paren=-1}return e.prototype.beforeFunctionExpression=function(e){return`(.{.[.in.typeof.instanceof.new.return.case.delete.throw.void.=.+=.-=.*=.**=./=.%=.<<=.>>=.>>>=.&=.|=.^=.,.+.-.*.**./.%.++.--.<<.>>.>>>.&.|.^.!.~.&&.||.?.:.===.==.>=.<=.<.>.!=.!==`.split(`.`).indexOf(e)>=0},e.prototype.isRegexStart=function(){var e=this.values[this.values.length-1],t=e!==null;switch(e){case`this`:case`]`:t=!1;break;case`)`:var n=this.values[this.paren-1];t=n===`if`||n===`while`||n===`for`||n===`with`;break;case`}`:if(t=!1,this.values[this.curly-3]===`function`){var r=this.values[this.curly-4];t=r?!this.beforeFunctionExpression(r):!1}else if(this.values[this.curly-4]===`function`){var r=this.values[this.curly-5];t=r?!this.beforeFunctionExpression(r):!0}break;default:break}return t},e.prototype.push=function(e){e.type===7||e.type===4?(e.value===`{`?this.curly=this.values.length:e.value===`(`&&(this.paren=this.values.length),this.values.push(e.value)):this.values.push(null)},e}();t.Tokenizer=function(){function e(e,t){this.errorHandler=new r.ErrorHandler,this.errorHandler.tolerant=t?typeof t.tolerant==`boolean`&&t.tolerant:!1,this.scanner=new i.Scanner(e,this.errorHandler),this.scanner.trackComment=t?typeof t.comment==`boolean`&&t.comment:!1,this.trackRange=t?typeof t.range==`boolean`&&t.range:!1,this.trackLoc=t?typeof t.loc==`boolean`&&t.loc:!1,this.buffer=[],this.reader=new o}return e.prototype.errors=function(){return this.errorHandler.errors},e.prototype.getNextToken=function(){if(this.buffer.length===0){var e=this.scanner.scanComments();if(this.scanner.trackComment)for(var t=0;t<e.length;++t){var n=e[t],r=this.scanner.source.slice(n.slice[0],n.slice[1]),i={type:n.multiLine?`BlockComment`:`LineComment`,value:r};this.trackRange&&(i.range=n.range),this.trackLoc&&(i.loc=n.loc),this.buffer.push(i)}if(!this.scanner.eof()){var o=void 0;this.trackLoc&&(o={start:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},end:{}});var s=this.scanner.source[this.scanner.index]===`/`&&this.reader.isRegexStart()?this.scanner.scanRegExp():this.scanner.lex();this.reader.push(s);var c={type:a.TokenName[s.type],value:this.scanner.source.slice(s.start,s.end)};this.trackRange&&(c.range=[s.start,s.end]),this.trackLoc&&(o.end={line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},c.loc=o),s.type===9&&(c.regex={pattern:s.pattern,flags:s.flags}),this.buffer.push(c)}}return this.buffer.shift()},e}()}])})})),mn=n(((e,t)=>{var n;try{n=pn()}catch{typeof window<`u`&&(n=window.esprima)}var r=$();function i(e){if(e===null)return!1;try{var t=`(`+e+`)`,r=n.parse(t,{range:!0});return!(r.type!==`Program`||r.body.length!==1||r.body[0].type!==`ExpressionStatement`||r.body[0].expression.type!==`ArrowFunctionExpression`&&r.body[0].expression.type!==`FunctionExpression`)}catch{return!1}}function a(e){var t=`(`+e+`)`,r=n.parse(t,{range:!0}),i=[],a;if(r.type!==`Program`||r.body.length!==1||r.body[0].type!==`ExpressionStatement`||r.body[0].expression.type!==`ArrowFunctionExpression`&&r.body[0].expression.type!==`FunctionExpression`)throw Error(`Failed to resolve function`);return r.body[0].expression.params.forEach(function(e){i.push(e.name)}),a=r.body[0].expression.body.range,r.body[0].expression.body.type===`BlockStatement`?Function(i,t.slice(a[0]+1,a[1]-1)):Function(i,`return `+t.slice(a[0],a[1]))}function o(e){return e.toString()}function s(e){return Object.prototype.toString.call(e)===`[object Function]`}t.exports=new r(`tag:yaml.org,2002:js/function`,{kind:`scalar`,resolve:i,construct:a,predicate:s,represent:o})})),hn=n(((e,t)=>{var n=Kt();t.exports=n.DEFAULT=new n({include:[un()],explicit:[dn(),fn(),mn()]})})),gn=n(((e,t)=>{var n=Ut(),r=Wt(),i=Gt(),a=un(),o=hn(),s=Object.prototype.hasOwnProperty,c=1,l=2,u=3,d=4,f=1,p=2,m=3,h=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,g=/[\x85\u2028\u2029]/,_=/[,\[\]\{\}]/,v=/^(?:!|!!|![a-z\-]+!)$/i,y=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function b(e){return Object.prototype.toString.call(e)}function x(e){return e===10||e===13}function S(e){return e===9||e===32}function C(e){return e===9||e===32||e===10||e===13}function w(e){return e===44||e===91||e===93||e===123||e===125}function T(e){var t;return 48<=e&&e<=57?e-48:(t=e|32,97<=t&&t<=102?t-97+10:-1)}function E(e){return e===120?2:e===117?4:e===85?8:0}function ee(e){return 48<=e&&e<=57?e-48:-1}function D(e){return e===48?`\0`:e===97?`\x07`:e===98?`\b`:e===116||e===9?`	`:e===110?`
`:e===118?`\v`:e===102?`\f`:e===114?`\r`:e===101?`\x1B`:e===32?` `:e===34?`"`:e===47?`/`:e===92?`\\`:e===78?``:e===95?`\xA0`:e===76?`\u2028`:e===80?`\u2029`:``}function O(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}for(var k=Array(256),A=Array(256),j=0;j<256;j++)k[j]=D(j)?1:0,A[j]=D(j);function M(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||o,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function te(e,t){return new r(t,new i(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function N(e,t){throw te(e,t)}function P(e,t){e.onWarning&&e.onWarning.call(null,te(e,t))}var F={YAML:function(e,t,n){var r,i,a;e.version!==null&&N(e,`duplication of %YAML directive`),n.length!==1&&N(e,`YAML directive accepts exactly one argument`),r=/^([0-9]+)\.([0-9]+)$/.exec(n[0]),r===null&&N(e,`ill-formed argument of the YAML directive`),i=parseInt(r[1],10),a=parseInt(r[2],10),i!==1&&N(e,`unacceptable YAML version of the document`),e.version=n[0],e.checkLineBreaks=a<2,a!==1&&a!==2&&P(e,`unsupported YAML version of the document`)},TAG:function(e,t,n){var r,i;n.length!==2&&N(e,`TAG directive accepts exactly two arguments`),r=n[0],i=n[1],v.test(r)||N(e,`ill-formed tag handle (first argument) of the TAG directive`),s.call(e.tagMap,r)&&N(e,`there is a previously declared suffix for "`+r+`" tag handle`),y.test(i)||N(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagMap[r]=i}};function I(e,t,n,r){var i,a,o,s;if(t<n){if(s=e.input.slice(t,n),r)for(i=0,a=s.length;i<a;i+=1)o=s.charCodeAt(i),o===9||32<=o&&o<=1114111||N(e,`expected valid JSON character`);else h.test(s)&&N(e,`the stream contains non-printable characters`);e.result+=s}}function L(e,t,r,i){var a,o,c,l;for(n.isObject(r)||N(e,`cannot merge mappings; the provided source object is unacceptable`),a=Object.keys(r),c=0,l=a.length;c<l;c+=1)o=a[c],s.call(t,o)||(t[o]=r[o],i[o]=!0)}function R(e,t,n,r,i,a,o,c){var l,u;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,u=i.length;l<u;l+=1)Array.isArray(i[l])&&N(e,`nested arrays are not supported inside keys`),typeof i==`object`&&b(i[l])===`[object Object]`&&(i[l]=`[object Object]`);if(typeof i==`object`&&b(i)===`[object Object]`&&(i=`[object Object]`),i=String(i),t===null&&(t={}),r===`tag:yaml.org,2002:merge`)if(Array.isArray(a))for(l=0,u=a.length;l<u;l+=1)L(e,t,a[l],n);else L(e,t,a,n);else !e.json&&!s.call(n,i)&&s.call(t,i)&&(e.line=o||e.line,e.position=c||e.position,N(e,`duplicated mapping key`)),t[i]=a,delete n[i];return t}function z(e){var t=e.input.charCodeAt(e.position);t===10?e.position++:t===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):N(e,`a line break is expected`),e.line+=1,e.lineStart=e.position}function B(e,t,n){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;S(i);)i=e.input.charCodeAt(++e.position);if(t&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(x(i))for(z(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return n!==-1&&r!==0&&e.lineIndent<n&&P(e,`deficient indentation`),r}function V(e){var t=e.position,n=e.input.charCodeAt(t);return!!((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)&&(t+=3,n=e.input.charCodeAt(t),n===0||C(n)))}function H(e,t){t===1?e.result+=` `:t>1&&(e.result+=n.repeat(`
`,t-1))}function U(e,t,n){var r,i,a,o,s,c,l,u,d=e.kind,f=e.result,p=e.input.charCodeAt(e.position);if(C(p)||w(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(i=e.input.charCodeAt(e.position+1),C(i)||n&&w(i)))return!1;for(e.kind=`scalar`,e.result=``,a=o=e.position,s=!1;p!==0;){if(p===58){if(i=e.input.charCodeAt(e.position+1),C(i)||n&&w(i))break}else if(p===35){if(r=e.input.charCodeAt(e.position-1),C(r))break}else if(e.position===e.lineStart&&V(e)||n&&w(p))break;else if(x(p))if(c=e.line,l=e.lineStart,u=e.lineIndent,B(e,!1,-1),e.lineIndent>=t){s=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=o,e.line=c,e.lineStart=l,e.lineIndent=u;break}s&&=(I(e,a,o,!1),H(e,e.line-c),a=o=e.position,!1),S(p)||(o=e.position+1),p=e.input.charCodeAt(++e.position)}return I(e,a,o,!1),e.result?!0:(e.kind=d,e.result=f,!1)}function W(e,t){var n=e.input.charCodeAt(e.position),r,i;if(n!==39)return!1;for(e.kind=`scalar`,e.result=``,e.position++,r=i=e.position;(n=e.input.charCodeAt(e.position))!==0;)if(n===39)if(I(e,r,e.position,!0),n=e.input.charCodeAt(++e.position),n===39)r=e.position,e.position++,i=e.position;else return!0;else x(n)?(I(e,r,i,!0),H(e,B(e,!1,t)),r=i=e.position):e.position===e.lineStart&&V(e)?N(e,`unexpected end of the document within a single quoted scalar`):(e.position++,i=e.position);N(e,`unexpected end of the stream within a single quoted scalar`)}function ne(e,t){var n,r,i,a,o,s=e.input.charCodeAt(e.position);if(s!==34)return!1;for(e.kind=`scalar`,e.result=``,e.position++,n=r=e.position;(s=e.input.charCodeAt(e.position))!==0;)if(s===34)return I(e,n,e.position,!0),e.position++,!0;else if(s===92){if(I(e,n,e.position,!0),s=e.input.charCodeAt(++e.position),x(s))B(e,!1,t);else if(s<256&&k[s])e.result+=A[s],e.position++;else if((o=E(s))>0){for(i=o,a=0;i>0;i--)s=e.input.charCodeAt(++e.position),(o=T(s))>=0?a=(a<<4)+o:N(e,`expected hexadecimal character`);e.result+=O(a),e.position++}else N(e,`unknown escape sequence`);n=r=e.position}else x(s)?(I(e,n,r,!0),H(e,B(e,!1,t)),n=r=e.position):e.position===e.lineStart&&V(e)?N(e,`unexpected end of the document within a double quoted scalar`):(e.position++,r=e.position);N(e,`unexpected end of the stream within a double quoted scalar`)}function re(e,t){var n=!0,r,i=e.tag,a,o=e.anchor,s,l,u,d,f,p={},m,h,g,_=e.input.charCodeAt(e.position);if(_===91)l=93,f=!1,a=[];else if(_===123)l=125,f=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),_=e.input.charCodeAt(++e.position);_!==0;){if(B(e,!0,t),_=e.input.charCodeAt(e.position),_===l)return e.position++,e.tag=i,e.anchor=o,e.kind=f?`mapping`:`sequence`,e.result=a,!0;n||N(e,`missed comma between flow collection entries`),h=m=g=null,u=d=!1,_===63&&(s=e.input.charCodeAt(e.position+1),C(s)&&(u=d=!0,e.position++,B(e,!0,t))),r=e.line,J(e,t,c,!1,!0),h=e.tag,m=e.result,B(e,!0,t),_=e.input.charCodeAt(e.position),(d||e.line===r)&&_===58&&(u=!0,_=e.input.charCodeAt(++e.position),B(e,!0,t),J(e,t,c,!1,!0),g=e.result),f?R(e,a,p,h,m,g):u?a.push(R(e,null,p,h,m,g)):a.push(m),B(e,!0,t),_=e.input.charCodeAt(e.position),_===44?(n=!0,_=e.input.charCodeAt(++e.position)):n=!1}N(e,`unexpected end of the stream within a flow collection`)}function ie(e,t){var r,i,a=f,o=!1,s=!1,c=t,l=0,u=!1,d,h=e.input.charCodeAt(e.position);if(h===124)i=!1;else if(h===62)i=!0;else return!1;for(e.kind=`scalar`,e.result=``;h!==0;)if(h=e.input.charCodeAt(++e.position),h===43||h===45)f===a?a=h===43?m:p:N(e,`repeat of a chomping mode identifier`);else if((d=ee(h))>=0)d===0?N(e,`bad explicit indentation width of a block scalar; it cannot be less than one`):s?N(e,`repeat of an indentation width identifier`):(c=t+d-1,s=!0);else break;if(S(h)){do h=e.input.charCodeAt(++e.position);while(S(h));if(h===35)do h=e.input.charCodeAt(++e.position);while(!x(h)&&h!==0)}for(;h!==0;){for(z(e),e.lineIndent=0,h=e.input.charCodeAt(e.position);(!s||e.lineIndent<c)&&h===32;)e.lineIndent++,h=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>c&&(c=e.lineIndent),x(h)){l++;continue}if(e.lineIndent<c){a===m?e.result+=n.repeat(`
`,o?1+l:l):a===f&&o&&(e.result+=`
`);break}for(i?S(h)?(u=!0,e.result+=n.repeat(`
`,o?1+l:l)):u?(u=!1,e.result+=n.repeat(`
`,l+1)):l===0?o&&(e.result+=` `):e.result+=n.repeat(`
`,l):e.result+=n.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,r=e.position;!x(h)&&h!==0;)h=e.input.charCodeAt(++e.position);I(e,r,e.position,!1)}return!0}function G(e,t){var n,r=e.tag,i=e.anchor,a=[],o,s=!1,c;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),c=e.input.charCodeAt(e.position);c!==0&&!(c!==45||(o=e.input.charCodeAt(e.position+1),!C(o)));){if(s=!0,e.position++,B(e,!0,-1)&&e.lineIndent<=t){a.push(null),c=e.input.charCodeAt(e.position);continue}if(n=e.line,J(e,t,u,!1,!0),a.push(e.result),B(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===n||e.lineIndent>t)&&c!==0)N(e,`bad indentation of a sequence entry`);else if(e.lineIndent<t)break}return s?(e.tag=r,e.anchor=i,e.kind=`sequence`,e.result=a,!0):!1}function K(e,t,n){var r,i,a,o,s=e.tag,c=e.anchor,u={},f={},p=null,m=null,h=null,g=!1,_=!1,v;for(e.anchor!==null&&(e.anchorMap[e.anchor]=u),v=e.input.charCodeAt(e.position);v!==0;){if(r=e.input.charCodeAt(e.position+1),a=e.line,o=e.position,(v===63||v===58)&&C(r))v===63?(g&&(R(e,u,f,p,m,null),p=m=h=null),_=!0,g=!0,i=!0):g?(g=!1,i=!0):N(e,`incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line`),e.position+=1,v=r;else if(J(e,n,l,!1,!0))if(e.line===a){for(v=e.input.charCodeAt(e.position);S(v);)v=e.input.charCodeAt(++e.position);if(v===58)v=e.input.charCodeAt(++e.position),C(v)||N(e,`a whitespace character is expected after the key-value separator within a block mapping`),g&&(R(e,u,f,p,m,null),p=m=h=null),_=!0,g=!1,i=!1,p=e.tag,m=e.result;else if(_)N(e,`can not read an implicit mapping pair; a colon is missed`);else return e.tag=s,e.anchor=c,!0}else if(_)N(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return e.tag=s,e.anchor=c,!0;else break;if((e.line===a||e.lineIndent>t)&&(J(e,t,d,!0,i)&&(g?m=e.result:h=e.result),g||(R(e,u,f,p,m,h,a,o),p=m=h=null),B(e,!0,-1),v=e.input.charCodeAt(e.position)),e.lineIndent>t&&v!==0)N(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return g&&R(e,u,f,p,m,null),_&&(e.tag=s,e.anchor=c,e.kind=`mapping`,e.result=u),_}function ae(e){var t,n=!1,r=!1,i,a,o=e.input.charCodeAt(e.position);if(o!==33)return!1;if(e.tag!==null&&N(e,`duplication of a tag property`),o=e.input.charCodeAt(++e.position),o===60?(n=!0,o=e.input.charCodeAt(++e.position)):o===33?(r=!0,i=`!!`,o=e.input.charCodeAt(++e.position)):i=`!`,t=e.position,n){do o=e.input.charCodeAt(++e.position);while(o!==0&&o!==62);e.position<e.length?(a=e.input.slice(t,e.position),o=e.input.charCodeAt(++e.position)):N(e,`unexpected end of the stream within a verbatim tag`)}else{for(;o!==0&&!C(o);)o===33&&(r?N(e,`tag suffix cannot contain exclamation marks`):(i=e.input.slice(t-1,e.position+1),v.test(i)||N(e,`named tag handle cannot contain such characters`),r=!0,t=e.position+1)),o=e.input.charCodeAt(++e.position);a=e.input.slice(t,e.position),_.test(a)&&N(e,`tag suffix cannot contain flow indicator characters`)}return a&&!y.test(a)&&N(e,`tag name cannot contain such characters: `+a),n?e.tag=a:s.call(e.tagMap,i)?e.tag=e.tagMap[i]+a:i===`!`?e.tag=`!`+a:i===`!!`?e.tag=`tag:yaml.org,2002:`+a:N(e,`undeclared tag handle "`+i+`"`),!0}function oe(e){var t,n=e.input.charCodeAt(e.position);if(n!==38)return!1;for(e.anchor!==null&&N(e,`duplication of an anchor property`),n=e.input.charCodeAt(++e.position),t=e.position;n!==0&&!C(n)&&!w(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&N(e,`name of an anchor node must contain at least one character`),e.anchor=e.input.slice(t,e.position),!0}function q(e){var t,n,r=e.input.charCodeAt(e.position);if(r!==42)return!1;for(r=e.input.charCodeAt(++e.position),t=e.position;r!==0&&!C(r)&&!w(r);)r=e.input.charCodeAt(++e.position);return e.position===t&&N(e,`name of an alias node must contain at least one character`),n=e.input.slice(t,e.position),s.call(e.anchorMap,n)||N(e,`unidentified alias "`+n+`"`),e.result=e.anchorMap[n],B(e,!0,-1),!0}function J(e,t,n,r,i){var a,o,f,p=1,m=!1,h=!1,g,_,v,y,b;if(e.listener!==null&&e.listener(`open`,e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=o=f=d===n||u===n,r&&B(e,!0,-1)&&(m=!0,e.lineIndent>t?p=1:e.lineIndent===t?p=0:e.lineIndent<t&&(p=-1)),p===1)for(;ae(e)||oe(e);)B(e,!0,-1)?(m=!0,f=a,e.lineIndent>t?p=1:e.lineIndent===t?p=0:e.lineIndent<t&&(p=-1)):f=!1;if(f&&=m||i,(p===1||d===n)&&(y=c===n||l===n?t:t+1,b=e.position-e.lineStart,p===1?f&&(G(e,b)||K(e,b,y))||re(e,y)?h=!0:(o&&ie(e,y)||W(e,y)||ne(e,y)?h=!0:q(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&N(e,`alias node should not have any properties`)):U(e,y,c===n)&&(h=!0,e.tag===null&&(e.tag=`?`)),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):p===0&&(h=f&&G(e,b))),e.tag!==null&&e.tag!==`!`)if(e.tag===`?`){for(e.result!==null&&e.kind!==`scalar`&&N(e,`unacceptable node kind for !<?> tag; it should be "scalar", not "`+e.kind+`"`),g=0,_=e.implicitTypes.length;g<_;g+=1)if(v=e.implicitTypes[g],v.resolve(e.result)){e.result=v.construct(e.result),e.tag=v.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else s.call(e.typeMap[e.kind||`fallback`],e.tag)?(v=e.typeMap[e.kind||`fallback`][e.tag],e.result!==null&&v.kind!==e.kind&&N(e,`unacceptable node kind for !<`+e.tag+`> tag; it should be "`+v.kind+`", not "`+e.kind+`"`),v.resolve(e.result)?(e.result=v.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):N(e,`cannot resolve a node with !<`+e.tag+`> explicit tag`)):N(e,`unknown tag !<`+e.tag+`>`);return e.listener!==null&&e.listener(`close`,e),e.tag!==null||e.anchor!==null||h}function se(e){var t=e.position,n,r,i,a=!1,o;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(o=e.input.charCodeAt(e.position))!==0&&(B(e,!0,-1),o=e.input.charCodeAt(e.position),!(e.lineIndent>0||o!==37));){for(a=!0,o=e.input.charCodeAt(++e.position),n=e.position;o!==0&&!C(o);)o=e.input.charCodeAt(++e.position);for(r=e.input.slice(n,e.position),i=[],r.length<1&&N(e,`directive name must not be less than one character in length`);o!==0;){for(;S(o);)o=e.input.charCodeAt(++e.position);if(o===35){do o=e.input.charCodeAt(++e.position);while(o!==0&&!x(o));break}if(x(o))break;for(n=e.position;o!==0&&!C(o);)o=e.input.charCodeAt(++e.position);i.push(e.input.slice(n,e.position))}o!==0&&z(e),s.call(F,r)?F[r](e,r,i):P(e,`unknown document directive "`+r+`"`)}if(B(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,B(e,!0,-1)):a&&N(e,`directives end mark is expected`),J(e,e.lineIndent-1,d,!1,!0),B(e,!0,-1),e.checkLineBreaks&&g.test(e.input.slice(t,e.position))&&P(e,`non-ASCII line breaks are interpreted as content`),e.documents.push(e.result),e.position===e.lineStart&&V(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,B(e,!0,-1));return}if(e.position<e.length-1)N(e,`end of the stream or a document separator is expected`);else return}function Y(e,t){e=String(e),t||={},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var n=new M(e,t),r=e.indexOf(`\0`);for(r!==-1&&(n.position=r,N(n,`null byte is not allowed in input`)),n.input+=`\0`;n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)se(n);return n.documents}function X(e,t,n){typeof t==`object`&&t&&n===void 0&&(n=t,t=null);var r=Y(e,n);if(typeof t!=`function`)return r;for(var i=0,a=r.length;i<a;i+=1)t(r[i])}function ce(e,t){var n=Y(e,t);if(n.length!==0){if(n.length===1)return n[0];throw new r(`expected a single document in the stream, but found more`)}}function Z(e,t,r){return typeof t==`object`&&t&&r===void 0&&(r=t,t=null),X(e,t,n.extend({schema:a},r))}function le(e,t){return ce(e,n.extend({schema:a},t))}t.exports.loadAll=X,t.exports.load=ce,t.exports.safeLoadAll=Z,t.exports.safeLoad=le})),_n=n(((e,t)=>{var n=Ut(),r=Wt(),i=hn(),a=un(),o=Object.prototype.toString,s=Object.prototype.hasOwnProperty,c=9,l=10,u=13,d=32,f=33,p=34,m=35,h=37,g=38,_=39,v=42,y=44,b=45,x=58,S=61,C=62,w=63,T=64,E=91,ee=93,D=96,O=123,k=124,A=125,j={};j[0]=`\\0`,j[7]=`\\a`,j[8]=`\\b`,j[9]=`\\t`,j[10]=`\\n`,j[11]=`\\v`,j[12]=`\\f`,j[13]=`\\r`,j[27]=`\\e`,j[34]=`\\"`,j[92]=`\\\\`,j[133]=`\\N`,j[160]=`\\_`,j[8232]=`\\L`,j[8233]=`\\P`;var M=[`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`];function te(e,t){var n,r,i,a,o,c,l;if(t===null)return{};for(n={},r=Object.keys(t),i=0,a=r.length;i<a;i+=1)o=r[i],c=String(t[o]),o.slice(0,2)===`!!`&&(o=`tag:yaml.org,2002:`+o.slice(2)),l=e.compiledTypeMap.fallback[o],l&&s.call(l.styleAliases,c)&&(c=l.styleAliases[c]),n[o]=c;return n}function N(e){var t=e.toString(16).toUpperCase(),i,a;if(e<=255)i=`x`,a=2;else if(e<=65535)i=`u`,a=4;else if(e<=4294967295)i=`U`,a=8;else throw new r(`code point within a string may not be greater than 0xFFFFFFFF`);return`\\`+i+n.repeat(`0`,a-t.length)+t}function P(e){this.schema=e.schema||i,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=n.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=te(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result=``,this.duplicates=[],this.usedDuplicates=null}function F(e,t){for(var r=n.repeat(` `,t),i=0,a=-1,o=``,s,c=e.length;i<c;)a=e.indexOf(`
`,i),a===-1?(s=e.slice(i),i=c):(s=e.slice(i,a+1),i=a+1),s.length&&s!==`
`&&(o+=r),o+=s;return o}function I(e,t){return`
`+n.repeat(` `,e.indent*t)}function L(e,t){var n,r,i;for(n=0,r=e.implicitTypes.length;n<r;n+=1)if(i=e.implicitTypes[n],i.resolve(t))return!0;return!1}function R(e){return e===d||e===c}function z(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function B(e){return z(e)&&!R(e)&&e!==65279&&e!==u&&e!==l}function V(e,t){return z(e)&&e!==65279&&e!==y&&e!==E&&e!==ee&&e!==O&&e!==A&&e!==x&&(e!==m||t&&B(t))}function H(e){return z(e)&&e!==65279&&!R(e)&&e!==b&&e!==w&&e!==x&&e!==y&&e!==E&&e!==ee&&e!==O&&e!==A&&e!==m&&e!==g&&e!==v&&e!==f&&e!==k&&e!==S&&e!==C&&e!==_&&e!==p&&e!==h&&e!==T&&e!==D}function U(e){return/^\n* /.test(e)}var W=1,ne=2,re=3,ie=4,G=5;function K(e,t,n,r,i){var a,o,s,c=!1,u=!1,d=r!==-1,f=-1,p=H(e.charCodeAt(0))&&!R(e.charCodeAt(e.length-1));if(t)for(a=0;a<e.length;a++){if(o=e.charCodeAt(a),!z(o))return G;s=a>0?e.charCodeAt(a-1):null,p&&=V(o,s)}else{for(a=0;a<e.length;a++){if(o=e.charCodeAt(a),o===l)c=!0,d&&(u||=a-f-1>r&&e[f+1]!==` `,f=a);else if(!z(o))return G;s=a>0?e.charCodeAt(a-1):null,p&&=V(o,s)}u||=d&&a-f-1>r&&e[f+1]!==` `}return!c&&!u?p&&!i(e)?W:ne:n>9&&U(e)?G:u?ie:re}function ae(e,t,n,i){e.dump=function(){if(t.length===0)return`''`;if(!e.noCompatMode&&M.indexOf(t)!==-1)return`'`+t+`'`;var a=e.indent*Math.max(1,n),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-a),s=i||e.flowLevel>-1&&n>=e.flowLevel;function c(t){return L(e,t)}switch(K(t,s,e.indent,o,c)){case W:return t;case ne:return`'`+t.replace(/'/g,`''`)+`'`;case re:return`|`+oe(t,e.indent)+q(F(t,a));case ie:return`>`+oe(t,e.indent)+q(F(J(t,o),a));case G:return`"`+Y(t,o)+`"`;default:throw new r(`impossible error: invalid scalar style`)}}()}function oe(e,t){var n=U(e)?String(t):``,r=e[e.length-1]===`
`;return n+(r&&(e[e.length-2]===`
`||e===`
`)?`+`:r?``:`-`)+`
`}function q(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function J(e,t){for(var n=/(\n+)([^\n]*)/g,r=function(){var r=e.indexOf(`
`);return r=r===-1?e.length:r,n.lastIndex=r,se(e.slice(0,r),t)}(),i=e[0]===`
`||e[0]===` `,a,o;o=n.exec(e);){var s=o[1],c=o[2];a=c[0]===` `,r+=s+(!i&&!a&&c!==``?`
`:``)+se(c,t),i=a}return r}function se(e,t){if(e===``||e[0]===` `)return e;for(var n=/ [^ ]/g,r,i=0,a,o=0,s=0,c=``;r=n.exec(e);)s=r.index,s-i>t&&(a=o>i?o:s,c+=`
`+e.slice(i,a),i=a+1),o=s;return c+=`
`,e.length-i>t&&o>i?c+=e.slice(i,o)+`
`+e.slice(o+1):c+=e.slice(i),c.slice(1)}function Y(e){for(var t=``,n,r,i,a=0;a<e.length;a++){if(n=e.charCodeAt(a),n>=55296&&n<=56319&&(r=e.charCodeAt(a+1),r>=56320&&r<=57343)){t+=N((n-55296)*1024+r-56320+65536),a++;continue}i=j[n],t+=!i&&z(n)?e[a]:i||N(n)}return t}function X(e,t,n){var r=``,i=e.tag,a,o;for(a=0,o=n.length;a<o;a+=1)Q(e,t,n[a],!1,!1)&&(a!==0&&(r+=`,`+(e.condenseFlow?``:` `)),r+=e.dump);e.tag=i,e.dump=`[`+r+`]`}function ce(e,t,n,r){var i=``,a=e.tag,o,s;for(o=0,s=n.length;o<s;o+=1)Q(e,t+1,n[o],!0,!0)&&((!r||o!==0)&&(i+=I(e,t)),e.dump&&l===e.dump.charCodeAt(0)?i+=`-`:i+=`- `,i+=e.dump);e.tag=a,e.dump=i||`[]`}function Z(e,t,n){var r=``,i=e.tag,a=Object.keys(n),o,s,c,l,u;for(o=0,s=a.length;o<s;o+=1)u=``,o!==0&&(u+=`, `),e.condenseFlow&&(u+=`"`),c=a[o],l=n[c],Q(e,t,c,!1,!1)&&(e.dump.length>1024&&(u+=`? `),u+=e.dump+(e.condenseFlow?`"`:``)+`:`+(e.condenseFlow?``:` `),Q(e,t,l,!1,!1)&&(u+=e.dump,r+=u));e.tag=i,e.dump=`{`+r+`}`}function le(e,t,n,i){var a=``,o=e.tag,s=Object.keys(n),c,u,d,f,p,m;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys==`function`)s.sort(e.sortKeys);else if(e.sortKeys)throw new r(`sortKeys must be a boolean or a function`);for(c=0,u=s.length;c<u;c+=1)m=``,(!i||c!==0)&&(m+=I(e,t)),d=s[c],f=n[d],Q(e,t+1,d,!0,!0,!0)&&(p=e.tag!==null&&e.tag!==`?`||e.dump&&e.dump.length>1024,p&&(e.dump&&l===e.dump.charCodeAt(0)?m+=`?`:m+=`? `),m+=e.dump,p&&(m+=I(e,t)),Q(e,t+1,f,!0,p)&&(e.dump&&l===e.dump.charCodeAt(0)?m+=`:`:m+=`: `,m+=e.dump,a+=m));e.tag=o,e.dump=a||`{}`}function ue(e,t,n){var i,a=n?e.explicitTypes:e.implicitTypes,c,l,u,d;for(c=0,l=a.length;c<l;c+=1)if(u=a[c],(u.instanceOf||u.predicate)&&(!u.instanceOf||typeof t==`object`&&t instanceof u.instanceOf)&&(!u.predicate||u.predicate(t))){if(e.tag=n?u.tag:`?`,u.represent){if(d=e.styleMap[u.tag]||u.defaultStyle,o.call(u.represent)===`[object Function]`)i=u.represent(t,d);else if(s.call(u.represent,d))i=u.represent[d](t,d);else throw new r(`!<`+u.tag+`> tag resolver accepts not "`+d+`" style`);e.dump=i}return!0}return!1}function Q(e,t,n,i,a,s){e.tag=null,e.dump=n,ue(e,n,!1)||ue(e,n,!0);var c=o.call(e.dump);i&&=e.flowLevel<0||e.flowLevel>t;var l=c===`[object Object]`||c===`[object Array]`,u,d;if(l&&(u=e.duplicates.indexOf(n),d=u!==-1),(e.tag!==null&&e.tag!==`?`||d||e.indent!==2&&t>0)&&(a=!1),d&&e.usedDuplicates[u])e.dump=`*ref_`+u;else{if(l&&d&&!e.usedDuplicates[u]&&(e.usedDuplicates[u]=!0),c===`[object Object]`)i&&Object.keys(e.dump).length!==0?(le(e,t,e.dump,a),d&&(e.dump=`&ref_`+u+e.dump)):(Z(e,t,e.dump),d&&(e.dump=`&ref_`+u+` `+e.dump));else if(c===`[object Array]`){var f=e.noArrayIndent&&t>0?t-1:t;i&&e.dump.length!==0?(ce(e,f,e.dump,a),d&&(e.dump=`&ref_`+u+e.dump)):(X(e,f,e.dump),d&&(e.dump=`&ref_`+u+` `+e.dump))}else if(c===`[object String]`)e.tag!==`?`&&ae(e,e.dump,t,s);else{if(e.skipInvalid)return!1;throw new r(`unacceptable kind of an object to dump `+c)}e.tag!==null&&e.tag!==`?`&&(e.dump=`!<`+e.tag+`> `+e.dump)}return!0}function de(e,t){var n=[],r=[],i,a;for(fe(e,n,r),i=0,a=r.length;i<a;i+=1)t.duplicates.push(n[r[i]]);t.usedDuplicates=Array(a)}function fe(e,t,n){var r,i,a;if(typeof e==`object`&&e)if(i=t.indexOf(e),i!==-1)n.indexOf(i)===-1&&n.push(i);else if(t.push(e),Array.isArray(e))for(i=0,a=e.length;i<a;i+=1)fe(e[i],t,n);else for(r=Object.keys(e),i=0,a=r.length;i<a;i+=1)fe(e[r[i]],t,n)}function pe(e,t){t||={};var n=new P(t);return n.noRefs||de(e,n),Q(n,0,e,!0,!0)?n.dump+`
`:``}function me(e,t){return pe(e,n.extend({schema:a},t))}t.exports.dump=pe,t.exports.safeDump=me})),vn=n(((e,t)=>{var n=gn(),r=_n();function i(e){return function(){throw Error(`Function `+e+` is deprecated and cannot be used.`)}}t.exports.Type=$(),t.exports.Schema=Kt(),t.exports.FAILSAFE_SCHEMA=Xt(),t.exports.JSON_SCHEMA=tn(),t.exports.CORE_SCHEMA=nn(),t.exports.DEFAULT_SAFE_SCHEMA=un(),t.exports.DEFAULT_FULL_SCHEMA=hn(),t.exports.load=n.load,t.exports.loadAll=n.loadAll,t.exports.safeLoad=n.safeLoad,t.exports.safeLoadAll=n.safeLoadAll,t.exports.dump=r.dump,t.exports.safeDump=r.safeDump,t.exports.YAMLException=Wt(),t.exports.MINIMAL_SCHEMA=Xt(),t.exports.SAFE_SCHEMA=un(),t.exports.DEFAULT_SCHEMA=hn(),t.exports.scan=i(`scan`),t.exports.parse=i(`parse`),t.exports.compose=i(`compose`),t.exports.addConstructor=i(`addConstructor`)})),yn=n(((e,t)=>{t.exports=vn()})),bn=e(n(((e,t)=>{var n=yn(),r=`\\ufeff?`,i=typeof process<`u`?process.platform:``,a=`^(`+r+`(= yaml =|---)$([\\s\\S]*?)^(?:\\2|\\.\\.\\.)\\s*$`+(i===`win32`?`\\r?`:``)+`(?:\\n)?)`,o=new RegExp(a,`m`);t.exports=s,t.exports.test=u;function s(e,t){e||=``;var n={allowUnsafe:!1};t=t instanceof Object?{...n,...t}:n,t.allowUnsafe=!!t.allowUnsafe;var r=e.split(/(\r?\n)/);return r[0]&&/= yaml =|---/.test(r[0])?l(e,t.allowUnsafe):{attributes:{},body:e,bodyBegin:1}}function c(e,t){for(var n=1,r=t.indexOf(`
`),i=e.index+e[0].length;r!==-1;){if(r>=i)return n;n++,r=t.indexOf(`
`,r+1)}return n}function l(e,t){var r=o.exec(e);if(!r)return{attributes:{},body:e,bodyBegin:1};var i=t?n.load:n.safeLoad,a=r[r.length-1].replace(/^\s+|\s+$/g,``);return{attributes:i(a)||{},body:e.replace(r[0],``),bodyBegin:c(r,e),frontmatter:a}}function u(e){return e||=``,o.test(e)}}))()),xn=Object.assign({"/src/lib/gpu-glossary/contributors.md":fe,"/src/lib/gpu-glossary/device-hardware/core.md":pe,"/src/lib/gpu-glossary/device-hardware/cuda-core.md":me,"/src/lib/gpu-glossary/device-hardware/cuda-device-architecture.md":he,"/src/lib/gpu-glossary/device-hardware/gpu-ram.md":ge,"/src/lib/gpu-glossary/device-hardware/graphics-processing-cluster.md":_e,"/src/lib/gpu-glossary/device-hardware/l1-data-cache.md":ve,"/src/lib/gpu-glossary/device-hardware/load-store-unit.md":ye,"/src/lib/gpu-glossary/device-hardware/register-file.md":be,"/src/lib/gpu-glossary/device-hardware/special-function-unit.md":xe,"/src/lib/gpu-glossary/device-hardware/streaming-multiprocessor-architecture.md":Se,"/src/lib/gpu-glossary/device-hardware/streaming-multiprocessor.md":Ce,"/src/lib/gpu-glossary/device-hardware/tensor-core.md":we,"/src/lib/gpu-glossary/device-hardware/tensor-memory-accelerator.md":Te,"/src/lib/gpu-glossary/device-hardware/tensor-memory.md":Ee,"/src/lib/gpu-glossary/device-hardware/texture-processing-cluster.md":De,"/src/lib/gpu-glossary/device-hardware/warp-scheduler.md":Oe,"/src/lib/gpu-glossary/device-hardware.md":ke,"/src/lib/gpu-glossary/device-software/compute-capability.md":Ae,"/src/lib/gpu-glossary/device-software/cooperative-thread-array.md":je,"/src/lib/gpu-glossary/device-software/cuda-programming-model.md":Me,"/src/lib/gpu-glossary/device-software/cuda-tile-programming-model.md":Ne,"/src/lib/gpu-glossary/device-software/global-memory.md":Pe,"/src/lib/gpu-glossary/device-software/kernel.md":Fe,"/src/lib/gpu-glossary/device-software/memory-hierarchy.md":Ie,"/src/lib/gpu-glossary/device-software/parallel-thread-execution.md":Le,"/src/lib/gpu-glossary/device-software/registers.md":Re,"/src/lib/gpu-glossary/device-software/shared-memory.md":ze,"/src/lib/gpu-glossary/device-software/streaming-assembler.md":Be,"/src/lib/gpu-glossary/device-software/thread-block-grid.md":Ve,"/src/lib/gpu-glossary/device-software/thread-block.md":He,"/src/lib/gpu-glossary/device-software/thread-hierarchy.md":Ue,"/src/lib/gpu-glossary/device-software/thread.md":We,"/src/lib/gpu-glossary/device-software/warp.md":Ge,"/src/lib/gpu-glossary/device-software/warpgroup.md":Ke,"/src/lib/gpu-glossary/device-software.md":qe,"/src/lib/gpu-glossary/host-software/cublas.md":Je,"/src/lib/gpu-glossary/host-software/cuda-binary-utilities.md":Ye,"/src/lib/gpu-glossary/host-software/cuda-c.md":Xe,"/src/lib/gpu-glossary/host-software/cuda-driver-api.md":Ze,"/src/lib/gpu-glossary/host-software/cuda-graph.md":Qe,"/src/lib/gpu-glossary/host-software/cuda-runtime-api.md":$e,"/src/lib/gpu-glossary/host-software/cuda-software-platform.md":et,"/src/lib/gpu-glossary/host-software/cudnn.md":tt,"/src/lib/gpu-glossary/host-software/cupti.md":nt,"/src/lib/gpu-glossary/host-software/cute-dsl.md":rt,"/src/lib/gpu-glossary/host-software/cute.md":it,"/src/lib/gpu-glossary/host-software/cutile-basic.md":at,"/src/lib/gpu-glossary/host-software/cutlass.md":ot,"/src/lib/gpu-glossary/host-software/libcuda.md":st,"/src/lib/gpu-glossary/host-software/libcudart.md":ct,"/src/lib/gpu-glossary/host-software/libnvml.md":lt,"/src/lib/gpu-glossary/host-software/nsight-systems.md":ut,"/src/lib/gpu-glossary/host-software/nvcc.md":dt,"/src/lib/gpu-glossary/host-software/nvidia-gpu-drivers.md":ft,"/src/lib/gpu-glossary/host-software/nvidia-ko.md":pt,"/src/lib/gpu-glossary/host-software/nvidia-smi.md":mt,"/src/lib/gpu-glossary/host-software/nvml.md":ht,"/src/lib/gpu-glossary/host-software/nvrtc.md":gt,"/src/lib/gpu-glossary/host-software.md":_t,"/src/lib/gpu-glossary/perf/active-cycle.md":vt,"/src/lib/gpu-glossary/perf/arithmetic-bandwidth.md":yt,"/src/lib/gpu-glossary/perf/arithmetic-intensity.md":bt,"/src/lib/gpu-glossary/perf/bank-conflict.md":xt,"/src/lib/gpu-glossary/perf/branch-efficiency.md":St,"/src/lib/gpu-glossary/perf/compute-bound.md":Ct,"/src/lib/gpu-glossary/perf/issue-efficiency.md":wt,"/src/lib/gpu-glossary/perf/latency-hiding.md":Tt,"/src/lib/gpu-glossary/perf/littles-law.md":Et,"/src/lib/gpu-glossary/perf/memory-bandwidth.md":Dt,"/src/lib/gpu-glossary/perf/memory-bound.md":Ot,"/src/lib/gpu-glossary/perf/memory-coalescing.md":kt,"/src/lib/gpu-glossary/perf/occupancy.md":At,"/src/lib/gpu-glossary/perf/overhead.md":jt,"/src/lib/gpu-glossary/perf/peak-rate.md":Mt,"/src/lib/gpu-glossary/perf/performance-bottleneck.md":Nt,"/src/lib/gpu-glossary/perf/pipe-utilization.md":Pt,"/src/lib/gpu-glossary/perf/register-pressure.md":Ft,"/src/lib/gpu-glossary/perf/roofline-model.md":It,"/src/lib/gpu-glossary/perf/scoreboard-stall.md":Lt,"/src/lib/gpu-glossary/perf/streaming-multiprocessor-utilization.md":Rt,"/src/lib/gpu-glossary/perf/warp-divergence.md":zt,"/src/lib/gpu-glossary/perf/warp-execution-state.md":Bt,"/src/lib/gpu-glossary/perf.md":Vt,"/src/lib/gpu-glossary/readme.md":Ht}),Sn=`auto`,Cn=async({params:e})=>{let{id:t}=e,n=`/gpu-glossary/${t}`,r=q({currentHref:n,pages:Z}),i=Y({currentHref:n,pages:Z}),a=se({currentHref:n,pages:Z}),o=X({currentHref:n,pages:Z}),s=xn[`/src/lib/gpu-glossary/${t}.md`];s||K(404,`Term not found`);let{attributes:c,body:l}=(0,bn.default)(s);return{content:l,metadata:{title:c.title,abbreviation:c.abbreviation,path:`/${t}`},nextPage:r,prevPage:i,children:o,isTopLevel:a?a.href===`/gpu-glossary`:!1,title:c.title+` | GPU Glossary`,ogTitle:c.title+` | GPU Glossary`,ogDescription:``,description:``,ogImageUrl:`https://modal.com/assets/gpu-glossary-og-1.png`}},wn=t({load:()=>Tn,prerender:()=>Sn}),Tn=Cn?re(Cn):void 0,En=v(`<div class="code-block rounded-sm border svelte-ifjs56"><div class="rounded-t border-b px-3 py-1.5 font-mono text-xs"> </div> <pre class="m-0 overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed"><!></pre></div>`),Dn=v(`<pre><!></pre>`);function On(e,t){V(t,!0);let n=()=>j(J,`$themeStore`,i),[i,a]=F();var o=W(),s=O(o),c=e=>{var i=En();let a;var o=r(i);let s;var c=r(o,!0);y(o);var l=z(o,2);let u;R(r(l),()=>t.children??N),y(l),y(i),L(()=>{d(i,`data-lang`,t.lang),a=b(i,``,a,{"background-color":n().primary[5],"border-color":n().primary[20]}),s=b(o,``,s,{"background-color":n().primary[20],"border-color":n().primary[20],color:n().primary[60]}),H(c,t.lang),u=b(l,``,u,{color:n().primary[80]})}),w(e,i)},l=e=>{var n=Dn();R(r(n),()=>t.children??N),y(n),w(e,n)};M(s,e=>{t.lang?e(c):e(l,!1)}),w(e,o),S(),a()}var kn=o(`<svg class="mb-1 inline svelte-1rtmap8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.42857 10.5V9.78572H2.14285V9.07139H2.85714V8.35713H3.57144V7.64287H4.2857V6.92854H4.99997V6.21427H5.7143V5.50001H6.42856V4.78569H7.14282V4.07142H7.85715V3.35713H8.57141V7.64287H10V0.5H2.85714V1.92856H7.14282V2.64285H6.42856V3.35713H5.7143V4.07142H4.99997V4.78569H4.2857V5.50001H3.57144V6.21427H2.85714V6.92854H2.14285V7.64287H1.42857V8.35713H0.714288V9.07139H0V10.5H1.42857Z" fill="currentColor"></path></svg>`),An=v(`<span class="-ml-2 inline-block"></span>`),jn=v(`<a class="group -mx-1 inline px-1 svelte-1rtmap8"><span class="inline group-hover:underline"><!></span> <!></a>`);function Mn(e,t){V(t,!0);let n=()=>j(J,`$themeStore`,i),[i,a]=F(),o=k(()=>t.href?.startsWith(`http`)??!1),s=k(()=>t.figCaptionSize===`sm`?8:10);var c=jn();let u;var f=r(c);R(r(f),()=>t.children??N),y(f);var p=z(f,2),m=e=>{var n=kn();let i;var a=r(n);y(n),L(()=>{d(n,`width`,l(s)),d(n,`height`,l(s)),d(n,`viewBox`,`0 0 ${l(s)} ${l(s)}`),i=b(n,``,i,{"margin-bottom":t.figCaptionSize===`sm`?`0.1em`:`0.2em`}),d(a,`transform`,`scale(${l(s)/10})`)}),w(e,n)},h=e=>{w(e,An())};M(p,e=>{l(o)?e(m):e(h,!1)}),y(c),L(()=>{d(c,`href`,t.href),d(c,`target`,l(o)?`_blank`:void 0),d(c,`rel`,l(o)?`noopener noreferrer`:void 0),u=b(c,``,u,{"background-color":n().primary[20]})}),w(e,c),S(),a()}var Nn=v(`<div><div></div> <img/></div>`),Pn=v(`<figcaption class="max-h-[780px] text-center text-xs italic leading-[1.3] md:max-w-[70%]"><!></figcaption>`),Fn=v(`<img class="max-h-[780px] md:max-w-[70%]" alt=""/> <!> <!>`,1),In=v(`<figure class="flex flex-col items-center gap-y-2"><!></figure>`);function Ln(e,t){V(t,!0);let n=()=>j(J,`$themeStore`,m),o=()=>j(ee,`$portalled`,m),s=()=>j(_,`$overlay`,m),c=()=>j(v,`$content`,m),u=()=>j(x,`$close`,m),p=()=>j(D,`$fullscreen`,m),[m,g]=F(),{elements:{overlay:_,content:v,close:x,portalled:ee},states:{open:D}}=G(),k=T(null),A=e=>({terminal:`terminal-${e}`,lightGreen:`light-green-${e}`,light:`light-${e}`});function te(e,t){let n=t.slice(15);e&&I(k,`https://modal-cdn.com/gpu-glossary/${A(n)[e.name]}`)}f(()=>{t.src&&te(n(),t.src)});var P=In(),R=r(P),H=e=>{var n=Fn(),f=O(n);f.__click=()=>D.set(!0);var m=z(f,2),g=e=>{var t=Nn();a(t,()=>({class:`bg-deprecated-ground/50 fixed inset-0 z-40 flex flex-col items-center justify-center`,...o()}));var n=r(t);a(n,()=>({...s(),class:`bg-deprecated-ground/50 absolute inset-0 -z-10`})),B(n,e=>s().action?.(e));var d=z(n,2);a(d,()=>({src:l(k),alt:``,class:`bg-deprecated-ground max-h-screen cursor-zoom-out`,...c(),...u()})),B(d,e=>c().action?.(e)),B(d,e=>u().action?.(e)),y(t),B(t,e=>o().action?.(e)),i(d),C(3,d,()=>de),w(e,t)};M(m,e=>{p()&&e(g)});var _=z(m,2),v=e=>{var n=Pn();b(n,``,{},{"font-style":`italic`}),le(r(n),{get md(){return t.alt},a:(e,t=N)=>{Mn(e,E({figCaptionSize:`sm`},t))},$$slots:{a:!0}}),y(n),w(e,n)};M(_,e=>{t.alt&&e(v)}),L(()=>d(f,`src`,l(k))),h(`keypress`,f,()=>{}),w(e,n)};M(R,e=>{l(k)&&e(H)}),y(P),w(e,P),S(),g()}s([`click`]);var Rn=v(`<div class="py-6"><div class="flex flex-col gap-y-2"></div></div>`);function zn(e,t){V(t,!1);let n=()=>j(J,`$themeStore`,i),[i,a]=F(),o=P(t,`contents`,8);c();var s=Rn(),u=r(s);let d;D(u,5,o,A,(e,t)=>{ce(e,{get section(){return l(t)},showArrow:!0})}),y(u),y(s),L(()=>d=b(u,``,d,{color:(n(),_(()=>n().primary[80]))})),w(e,s),S(),a()}var Bn={rehypePlugin:()=>e=>{ue(e,`element`,e=>{if(e.tagName===`pre`){let t=e.children.find(e=>e.type===`element`&&e.tagName===`code`);if(t){let n=(t.properties?.className||[]).find(e=>e.startsWith(`language-`));if(n){let t=n.replace(`language-`,``);e.properties={...e.properties,lang:t}}}}})}},Vn={remarkPlugin:()=>(e,t)=>{let n=t.value;ue(e,`image`,e=>{if(!e.position)return;let{start:t,end:r}=e.position,i=n.slice(t.offset,r.offset).match(/^!\[(.*)\]\((.*)\)/);i&&(e.alt=i[1])})}},Hn=v(`<a href="/signup" class="cursor-pointer! group mb-2 mt-8 svelte-1wnzcll"><div><div><div class="flex items-center gap-2"><img alt="Modal Logo" class="my-auto mr-2 inline h-5"/> <hgroup class="space-y-0"><h2 class="text-md flex items-center text-balance font-medium">Building on GPUs? We know a thing or two about it.</h2> <p class="cta-subtitle font-sans text-sm md:text-balance svelte-1wnzcll">Modal is an ergonomic Python SDK wrapped around a global GPU fleet.<span class="hidden xl:inline">&nbsp;Deploy serverless AI workloads instantly without worrying
              about quota requests, driver compatibility issues, or managing
              bulky ML dependencies.</span></p></hgroup></div> <p class="hidden">Deploy serverless AI workloads instantly without worrying about quota
        requests, driver compatibility issues, or managing bulky ML
        dependencies.</p></div> <div><div class="cta-link flex items-center gap-1.5 whitespace-nowrap font-sans text-sm svelte-1wnzcll">Deploy on GPUs <span class="bg-c-green-100 z-10 inline-block h-4 w-4 rounded-full p-0.5"><!></span></div></div></div></a>`);function Un(e,t){var n=Hn(),i=r(n);let a;var o=r(i),s=r(o),c=r(s);U(2),y(s),U(2),y(o);var l=z(o,2),u=r(l),f=z(r(u));ae(r(f),{size:14,class:`h-full w-full stroke-black`}),y(f),y(u),y(l),y(i),y(n),L(()=>{a=x(i,1,`font-goga animate-border marketing-cta flex flex-col items-end justify-between gap-6 rounded-lg border border-transparent p-4 transition-all duration-300 ease-out group-hover:scale-[101%] md:flex-row svelte-1wnzcll`,null,a,{"marketing-cta--dark":!t.isLightTheme,"marketing-cta--light":t.isLightTheme}),d(c,`src`,oe)}),w(e,n)}var Wn=v(`<div class="rounded-xs h-fit px-2 text-2xl"> </div>`),Gn=v(`<code><!></code>`),Kn=v(`<ul class="ml-4 list-disc"><!></ul>`),qn=v(`<a class="flex max-w-[50%] items-center gap-2 self-center"><svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.75 13H8.6667V10.8334L6.5 10.8334V8.66672L19.5 8.66672V6.50002L6.5 6.50002V4.33332H8.6667V2.16672H9.75V1.71661e-05H6.5V2.16672H4.3333V4.33332H2.1667V5.41672H1.0833V6.50002H0V8.66672H1.0833V9.75002L2.1667 9.75002V10.8334H4.3333V13H6.5V15.1667H9.75V13Z" fill="currentColor"></path></svg> <span class="hidden sm:block"> </span></a>`),Jn=v(`<div></div>`),Yn=v(`<a class="flex items-center gap-2"><span class="hidden sm:block"> </span><svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.75 2.16666H10.8333V4.33333H13V6.49997H0L0 8.66667H13V10.8334H10.8333V13H9.75V15.1667H13V13H15.1667V10.8334H17.3333V9.74997H18.4167V8.66667H19.5V6.49997H18.4167V5.41667H17.3333V4.33333H15.1667V2.16666H13V0L9.75 0V2.16666Z" fill="currentColor"></path></svg></a>`),Xn=v(`<div class="flex min-h-full flex-col px-6 pt-4 sm:px-14 sm:pt-8"><div class="flex flex-1 flex-col"><div class="flex flex-row justify-between"><div class="glossary-font-secondary mb-3"> </div> <div class="relative"><a href="https://github.com/modal-labs/gpu-glossary/issues/new" target="_blank" rel="noopener noreferrer" class="glossary-font-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">?</a> <div>Something seem wrong?<br/>Or want to contribute?<br/><br/>Click
          this button to<br/>let us know on GitHub.</div></div></div> <div class="flex items-center gap-2 pb-4"><h1 class="text-3xl font-medium"> </h1> <!></div> <div class="flex flex-col gap-y-3"><!></div> <!></div> <!> <div class="z-5 sticky bottom-0 mt-6 flex items-end justify-between pb-8 pt-2 text-sm sm:static sm:pt-0 sm:text-base"><!> <!></div></div>`);function Zn(e,t){V(t,!1);let n=()=>j(J,`$themeStore`,i),[i,o]=F(),s=te(),f=P(t,`data`,8),v=te(!1),C=()=>{I(v,!l(v))},T=e=>{e&&ne(e.href)};ie({key:{hotkey:`?`,shift:!0}},C),[{hotKey:`ArrowLeft`,action:()=>T(f().prevPage)},{hotKey:`ArrowRight`,action:()=>T(f().nextPage)},{hotKey:`ArrowUp`,action:()=>T(f().prevPage)},{hotKey:`ArrowDown`,action:()=>T(f().nextPage)}].forEach(({hotKey:e,action:t})=>{ie({key:{hotkey:e}},t)}),u(()=>n(),()=>{I(s,n().name===`light`)}),p(),c();var D=Xn();let O;var k=r(D),A=r(k),B=r(A);let W;var re=r(B,!0);y(B);var G=z(B,2),K=r(G);let ae;var oe=z(K,2);let q,se;y(G),y(A);var Y=z(A,2),X=r(Y),ce=r(X,!0);y(X);var Z=z(X,2),ue=e=>{var t=Wn();let i;var a=r(t,!0);y(t),L(()=>{i=b(t,``,i,{color:(n(),_(()=>n().primary[80])),"background-color":(n(),_(()=>n().primary[5]))}),H(a,(m(f()),_(()=>f().metadata.abbreviation)))}),w(e,t)};M(Z,e=>{m(f()),_(()=>f().metadata.abbreviation)&&e(ue)}),y(Y);var Q=z(Y,2);let de;var fe=r(Q);{let e=(e,t=N)=>{Mn(e,E({figCaptionSize:`lg`},t))},t=(e,t=N)=>{Ln(e,E(t))},n=(e,t=N)=>{On(e,E(t))},i=(e,t)=>{let n=()=>t?.().children,i=()=>g(t?.(),[`children`]);var o=Gn();a(o,()=>({...i()}),void 0,void 0,void 0,`svelte-xk4cl6`),R(r(o),()=>n()??N),y(o),w(e,o)},o=(e,t=N)=>{let n=ee(()=>{let{children:e}=t();return{children:e}});var i=Kn();R(r(i),()=>l(n).children??N),y(i),w(e,i)},s=ee(()=>[Bn,Vn]);le(fe,{get md(){return m(f()),_(()=>f().content)},get plugins(){return l(s)},a:e,img:t,pre:n,code:i,ul:o,$$slots:{a:!0,img:!0,pre:!0,code:!0,ul:!0}})}y(Q);var pe=z(Q,2),me=e=>{zn(e,{get contents(){return m(f()),_(()=>f().children)}})};M(pe,e=>{m(f()),_(()=>f().isTopLevel&&f().children)&&e(me)}),y(k);var he=z(k,2);Un(he,{get isLightTheme(){return l(s)}});var ge=z(he,2);let _e;var ve=r(ge),ye=e=>{var t=qn(),n=z(r(t),2),i=r(n,!0);y(n),y(t),L(()=>{d(t,`href`,(m(f()),_(()=>f().prevPage.href))),H(i,(m(f()),_(()=>f().prevPage.title)))}),w(e,t)},be=e=>{w(e,Jn())};M(ve,e=>{m(f()),_(()=>f().prevPage)?e(ye):e(be,!1)});var xe=z(ve,2),Se=e=>{var t=Yn(),n=r(t),i=r(n,!0);y(n),U(),y(t),L(()=>{d(t,`href`,(m(f()),_(()=>f().nextPage.href))),H(i,(m(f()),_(()=>f().nextPage.title)))}),w(e,t)};M(xe,e=>{m(f()),_(()=>f().nextPage)&&e(Se)}),y(ge),y(D),L(()=>{O=b(D,``,O,{"background-color":(n(),_(()=>n().secondary[100]))}),W=b(B,``,W,{color:(n(),_(()=>n().primary[60]))}),H(re,(m(f()),_(()=>f().metadata.path))),ae=b(K,``,ae,{"background-color":(n(),_(()=>n().primary[20])),"border-color":(n(),_(()=>n().primary[100]))}),q=x(oe,1,`fade-blur pointer-events-none absolute right-9 top-[14px] z-10 whitespace-nowrap border p-2.5 leading-[18px] svelte-xk4cl6`,null,q,{visible:l(v)}),se=b(oe,``,se,{"border-color":(n(),_(()=>n().primary[100])),"background-color":(n(),_(()=>n().secondary[100]))}),H(ce,(m(f()),_(()=>f().metadata.title))),de=b(Q,``,de,{color:(n(),_(()=>n().primary[80]))}),_e=b(ge,``,_e,{"background-color":(n(),_(()=>n().secondary[100]))})}),h(`mouseenter`,K,()=>I(v,!0)),h(`mouseleave`,K,()=>I(v,!1)),w(e,D),S(),o()}export{Zn as component,wn as universal};
//# sourceMappingURL=138.Ct552FoD.js.map
