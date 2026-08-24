(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`94803d54-91c7-40b5-b918-1c2d7d088fd6`,e._sentryDebugIdIdentifier=`sentry-dbid-94803d54-91c7-40b5-b918-1c2d7d088fd6`)}catch{}})();import{$t as e,E as t,St as n,Tn as r,Tt as i,_n as a,bt as o,c as s,d as c,en as l,tn as u,vn as d,wn as f}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as p}from"./Byq5z5IS2.js";import{t as m}from"./JPsrybyr.js";import{t as h}from"./BILrvr3I.js";import{t as g}from"./DeWGVqas2.js";import{t as _}from"./CdZDxCfO2.js";var v={title:`Memory snapshots: Checkpoint/restore for sub-second startup`,description:`Serializing container state to disk for aggressive cold start optimization.`,authors:[{name:`Jonathon Belotti`,avatarUrl:`https://modal-cdn.com/jonathon-belotti.png`,jobTitle:`Member of Technical Staff`,twitterHandle:`jonobelotti_IO`}],date:`2025-01-28T12:00:00.000Z`,length:`10 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:2,value:`What’s a memory snapshot?`,id:`whats-a-memory-snapshot`},{depth:2,value:`Performance: Checkpoint/restore vs. lazy loading`,id:`performance-checkpointrestore-vs-lazy-loading`},{depth:2,value:`A single file load?`,id:`a-single-file-load`},{depth:2,value:`Performance: 2.5x faster`,id:`performance-25x-faster`},{depth:2,value:`Under the hood: snapshot lifecycle`,id:`under-the-hood-snapshot-lifecycle`},{depth:2,value:`Tradeoffs: or, is it really that simple?`,id:`tradeoffs-or-is-it-really-that-simple`},{depth:2,value:`Interface: adopting memory snapshot speedups`,id:`interface-adopting-memory-snapshot-speedups`,children:[{depth:3,value:`Handling GPU state`,id:`handling-gpu-state`}]},{depth:2,value:`Acknowledgements`,id:`acknowledgements`}],rawContent:`Modal is a serverless GPU container runtime designed to scale from zero. We run our worker fleet and our users’ Functions lean. If there’s idle capacity we aim to cut it. This means that if additional load comes into a Function, we often need additional containers to start up and serve requests. Cold start latency occurs when a request is waiting for a container to start up, and our customers hate it.

We hate it too! Thankfully, with the introduction of _memory snapshot_ restores, cold start latency on user Functions can be more than halved!

<div class="h-60">
  <EcdfChart title="import torch (eCDF)" series={seriesImportTorch} />
</div>

## What’s a memory snapshot?

A Modal memory snapshot is a couple of files that represent the entire state of a Linux container _right before_ it was about to accept a request. We capture the container’s filesystem mutations and its entire process tree. Each process in that tree has state consisting of its memory mappings, file descriptor table, registers, environment variables, process ID, and more! It’s a party and everyone’s invited.

![Diagram of process component state that is saved to disk (credit Tristan Hume)](https://modal-cdn.com/cdnbot/modal-snapshot-process-diagramtq1ww54b_99ced4b9.webp)

All that captured state allows for the complete restore of a Python program, with the notable exception of live network connections and NVIDIA GPU state (discussed below).

Container snapshotting functionality is an outgrowth of the the ‘checkpoint/restore in userspace’ (CRIU) kernel technology. The gist is that you can checkpoint (save) a Linux container and restore it at a later time, even on a different computer. This functionality had existed for Linux _VMs_ since at least 1999’s VMWare Workstation product, but as we know containers weren’t ‘a thing’ until around 2009. CRIU was first presented in 2011 by some [“mad Russians”](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=099469502f62fbe0d7e4f0b83a2f22538367f734) as a method for live migration of containers between physical servers, and has over time proved itself a [handy technique](https://ipads.se.sjtu.edu.cn/_media/publications/catalyzer-asplos20.pdf) for reducing serverless cold starts.

CRIU is developed for the \`runc\` container runtime, but for security reasons Modal uses the gVisor container runtime \`runsc\` (short for "run Sandboxed Container"). While \`runc\` has containers run on the host kernel, gVisor implements a userspace kernel and gives the guest container access to that. This has obvious implications for container snapshotting. While a \`runc\` snapshotting solution cooperates with the host Linux kernel to save container state—the kernel exposes, via /proc VFS, details about a process's memory maps, open files, children processes— gVisor controls the userspace kernel serving a snapshotted container guest.

![Timeline showing when Linux, LXC, CRIU, and gVisor were released](https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-289iuooft_6e5a069b.webp)

So while gVisor’s checkpoint/restore functionality was developed many years after CRIU, it’s actually quite like pre-CRIU solutions which involved customizing the Linux kernel (ie. ‘container restore in kernelspace’). gVisor’s core \`kernel.go\` file contains checkpoint/restore code and at least eighteen system components implement checkpoint/restore functionality in \`save_restore.go\` files. You can make a lot of checkpoint/restore specific kernel customizations if you reimplement the Linux kernel in userspace!

## Performance: Checkpoint/restore vs. lazy loading

It’s not obvious why restoring a container snapshot with gVisor’s \`runsc restore\` would be so much faster than a standard \`runsc run\` container startup.

The main reason is that Python’s import system is filesystem-based and needs to execute thousands of slow, sequential filesystem operations in order to become ready to perform useful work.

It’s _thousands_ because even just importing \`torch\` in Python executes 26,000 syscalls! It’s slow because there’s a couple layers of indirection between the container’s filesystem and the actual file data. A Modal container filesystem is an [OverlayFS](https://en.wikipedia.org/wiki/OverlayFS) filesystem where the read-only lower is a FUSE-based lazy loading file server, which means that every file read incurs some overhead.

\`\`\`cpp
overlay on /mnt/overlay type overlay (
    rw, relaltime,
    upperdir=/tmp/tmph45cav46/upper,
    lowerdir=/tmp/tmph45cav46/imagefs_fuse,  << lazy-loading file server
    workdir=/tmp/tmph45cav46/work
)
\`\`\`

The fastest code is the code that never runs, and so fast container startup is mostly about laziness, work avoidance. Basically, not doing work where it’s not needed. Almost every container on Modal has thousands of files in \`/usr/share/doc\`, but ~zero of our users' programs actually need to read those files. So we don't load them.

For more detail on our lazy-loading container filesystem, see [Fast, lazy container loading in Modal.com](https://modal.com/blog/jono-containers-talk).

Despite cutting out heaps of eager file I/O with lazy loading, importing \`torch\` still executes 26,000 syscalls, context switching between the caller, the kernel, and the FUSE server. Python’s filesystem-based, syscall heavy module loading is just too slow. So we turn to checkpoint/restore, which turns thousands of syscalls into (roughly) a single file load, recreating the process’s memory mappings directly rather than re-running through the Python import system and all other application code executed during container startup.

## A single file load?

![Diagram showing the simplified restore problem, where Python process memory mappings are served from FUSE via gVisor.](https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-4hth1rar3_a5e507bd.webp)

The container restore process is a frenetic process of summoning and ensemble choreography, but most of the performance is won or lost on how fast the ‘main’ process’s memory mappings can be brought into the operating system’s page cache. These memory mappings are typically 100MiB-10GiB and stored in a single snapshot 'pages' file, referring to the 4KiB page (or huge pages) of the virtual memory system.

When restoring, gVisor does not need to wait to read the entire ‘state’ file into memory before allowing the restored container to progress. Instead it can read the restored processes' pages [in the background](https://github.com/google/gvisor/commit/41f01d8f9c5aee4f7a31ec6183fb50bbc6f9b851), prioritizing those pages which a restored process blocks on.

This background-loaded pages file is made available to gVisor through the same distributed, FUSE-based file serving system used for our standard container loading. To ensure the FUSE system doesn’t keep gVisor waiting when it requests a page, we aggressively preload the entire pages file into page cache as early as we can. In the worst case, the restoring process page faults and gVisor finds that the FUSE file server doesn’t already have the page in-memory, nor is the page on host disk. Thus, the restoring process is blocked waiting for the FUSE server to complete a networked file read, which takes 10s of milliseconds.

Much has been ignored by focusing only on the pages file’s loading, but it’s here the 80 in the 80/20 rule. gVisor’s prioritized, background page loading and our FUSE filesystem’s aggressive preloading cooperate to minimize aggregate page fault latency in a restoring guest process.

Now, is all this fast enough?

## Performance: 2.5x faster

We’ve found that memory snapshot restore is about 2.5x faster than a standard container startup. A Stable Diffusion inference Function that takes around 13 seconds normally restores in _only 3.5 seconds_. A simple \`import torch\` example program which was noted as executing 26,000 syscalls takes normally around 5 seconds to cold start. With snapshot restore it’s around 1.05 seconds at p50 and 0.69 seconds at p0!

<!-- JS component: Side-by-side eCDF graphs of cold start latency for a Stable Diffusion Function and a import torch example -->
<div class="h-60 flex gap-4">
  <div class="flex-1">
    <EcdfChart title="import torch" series={seriesImportTorch} />
  </div>
  <div class="flex-1">
    <EcdfChart title="Stable Diffusion" series={seriesStableDiffusion} />
  </div>
</div>

While restore is already much, much faster than the status quo, we can make it better. The current restore implementation is performance-constrained by how fast the virtual memory of the main process, sometimes GiBs of data, can be loaded off disk (or over the network) and into memory.

We’re observing container restore incurring CPU pressure as it eagerly loads hundreds of thousands of 4KiB pages. [CPU stalling](https://dx13.co.uk/articles/2023/07/27/cpu-stalls/) is going as high as 900/ms/s, indicating our container cgroup resource management needs better tuning for aggressive resource usage at startup. This is not exactly as bad as leaving the handbrake on, but kind of like straining to get a fixie bike going uphill.

We also could optimize how we preload the guest’s virtual memory pages into the host page cache. Sometimes restore files are served over the network, and while we expect our hosts to drive around 2GiB/s of network download, in the tail we’re observing much less effective throughput.

So there’s still work to be done, and you should expect the restore line above to move more to the left and get straighter as we make optimizations!

## Under the hood: snapshot lifecycle

Deployed Functions with memory snapshots enabled only get snapshotted on-demand, not proactively. Also, a single deployed Function version will get snapshotted _multiple times_, for an interesting reason.

Snapshots are created on-demand when Modal’s scheduler finds that it does not have an existing active Function snapshot available for the Modal worker host onto which it intends to place that Function.

\`\`\`python
snapshot_info: Optional[api_pb2.SnapshotInfo] = None
if function_proto.checkpointing_enabled:
    snapshot_info = await get_or_create_checkpoint_for_worker_and_task(
        state, ephemeral_function_struct, worker_ephemeral_struct, task_id
    )
\`\`\`

Having to match a Function snapshot with a particular worker is one of the reasons a single Function version will be snapshotted multiple times. For example, the AWS g6.12xlarge instance type does not support the \`pclmulqdq\` [Perform a Carry-Less Multiplication of Quadword](http://en.wikipedia.org/wiki/CLMUL_instruction_set) instruction and so it cannot accept any snapshot created on a host which does. Our users didn’t sign up expecting to debug Invalid Opcode exceptions!

Beyond CPU featureset compatibility concerns, memory snapshots are also sensitive to changes in NVIDIA driver version and container runtime version. Such compatibility concerns are the major reason that Modal controls the snapshot lifecycle on behalf of users, ensuring that restores consistently succeed across a dynamic and evolving worker fleet.

## Tradeoffs: or, is it really that simple?

Memory snapshots significantly reduce cold starts but they also decrease simplicity. Andrew Morton [tried to warn us](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=099469502f62fbe0d7e4f0b83a2f22538367f734), but we’ve sided with the Russians and gone a bit mad. We’re freezing containers mid-execution and serializing them to disk.

The main chore ‘checkpoint/restore in userspace’ tends to require is cooperation from the guest program. Programs need to understand that they will be paused for an indefinite amount of time and resumed on a different computer, possibly with a different IP address. They also need to understand that the state they establish prior to snapshotting will be _reused_ over and over again—expectations of entropy may be violated.

The team has already worked hard to make the Modal [client](https://github.com/modal-labs/modal-client) cooperative with checkpoint/restore. When tricky cases cause restore to fail (and this does happen) we automatically fallback to a standard container startup. We recommend testing outside of production before deploying a Function to production with memory snapshots enabled.

For more information on managing sharp edges, see the [guide page](https://modal.com/docs/guide/memory-snapshots).

## Interface: adopting memory snapshot speedups

Ok, so how do you use it?

Modal Functions can turn on snapshotting using the \`enable_memory_snapshot=True\` argument and [lifecycle methods](/docs/guide/lifecycle-functions#container-lifecycle-hooks) can opt-in to snapshotting using the \`snap=True\` argument.

Here’s a ‘hello world’ example that just imports \`torch\`.

\`\`\`python
import pathlib
import modal

image = modal.Image.debian_slim().pip_install("torch")
app = modal.App(name="demo-memory-snapshot")

pathlib.Path("./foo").write_text("disk mutation")

with image.imports():
    import torch  # 26k syscalls comin' right up!

@app.function(enable_memory_snapshot=True)
def f(x: int):
    print(f"Hello from torch {torch.__version__}. You gave me {x=}")
\`\`\`

The above Modal Function \`f\` will be snapshotted once it has deployed and run a handful of times in production. (We currently create snapshots on-demand, not proactively.)

The snapshot has captured the \`import torch\` global import as well as anything else that executed in global scope, such as the rootfs disk mutation. It has essentially paused and saved _right before_ it’s about to fetch a request and feed that request into \`f\`.

This allows us to jump straight back into \`f(x)\` on restore, as shown below.

![Diagram showing the snapshot restore process](https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-5-ay7ar0i9_c042c9d0.webp)

Whenever Modal detects that a redeploy has invalidated an existing snapshot of \`f\`, new snapshots are created.

### Handling GPU state

It was said above that lifecycle functions can be snapshotted, and this is important for managing GPU state. Because memory snapshots do not yet support saving GPU state to file, GPU state must be created post-restore.

\`\`\`python
import time
import modal

image = (
    modal.Image.debian_slim()
    .pip_install(
        "transformers", "torch", "accelerate", "safetensors",
    )
)
app = modal.App("snap-demo", image=image)

@app.cls(gpu="a10g", enable_memory_snapshot=True)
class GPT2:
    @modal.enter(snap=True)
    def load(self):
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self.model = AutoModelForCausalLM.from_pretrained("/root/cache", use_cache=True)
        self.tokenizer = AutoTokenizer.from_pretrained("gpt2", use_fast=True, use_cache=True)

    @modal.enter(snap=False)
    def setup(self):
        self.model.to("cuda")

    @modal.method()
    def run(self) -> str:
        input_ids = self.tokenizer.encode("What's up?", return_tensors="pt")
        out = self.model.generate(
            input_ids.to("cuda"),
            pad_token_id=self.tokenizer.eos_token_id
        )
        generated_text = self.tokenizer.decode(out[0], skip_special_tokens=True)
        return generated_text
\`\`\`

The above GPT-2 inference Function has a \`snap=True\` lifecycle method which setups the model in CPU RAM for snapshotting, and a \`snap=False\` lifecycle method to move from CPU RAM to GPU vRAM right after restore.

This demo inference Function restores 2.5x faster using memory snapshots 🏎️.

## Acknowledgements

Many thanks to the [gVisor team](https://github.com/google/gvisor) for creating gVisor and its [Checkpoint/Restore](https://gvisor.dev/docs/user_guide/checkpoint_restore/) functionality. Thanks also to Luis Capelo, Colin Weld, and Matt Nappo for their work and design discussions related to\xA0memory snapshots.

If you’re interested in building fast, reliable, and heavy-duty systems for the cloud,\xA0[Modal is hiring](https://modal.com/company).
`,meta:{description:`Serializing container state to disk for aggressive cold start optimization.`}},{title:y,description:b,authors:x,date:S,length:C,category:w,published:T,layout:E,toc:D,rawContent:O,meta:k}=v,A=n(`<p>Modal is a serverless GPU container runtime designed to scale from zero. We run our worker fleet and our users’ Functions lean. If there’s idle capacity we aim to cut it. This means that if additional load comes into a Function, we often need additional containers to start up and serve requests. Cold start latency occurs when a request is waiting for a container to start up, and our customers hate it.</p> <p>We hate it too! Thankfully, with the introduction of <em>memory snapshot</em> restores, cold start latency on user Functions can be more than halved!</p> <div class="h-60"><!></div> <h2 id="whats-a-memory-snapshot">What’s a memory snapshot?</h2> <p>A Modal memory snapshot is a couple of files that represent the entire state of a Linux container <em>right before</em> it was about to accept a request. We capture the container’s filesystem mutations and its entire process tree. Each process in that tree has state consisting of its memory mappings, file descriptor table, registers, environment variables, process ID, and more! It’s a party and everyone’s invited.</p> <p><!></p> <p>All that captured state allows for the complete restore of a Python program, with the notable exception of live network connections and NVIDIA GPU state (discussed below).</p> <p>Container snapshotting functionality is an outgrowth of the the ‘checkpoint/restore in userspace’ (CRIU) kernel technology. The gist is that you can checkpoint (save) a Linux container and restore it at a later time, even on a different computer. This functionality had existed for Linux <em>VMs</em> since at least 1999’s VMWare Workstation product, but as we know containers weren’t ‘a thing’ until around 2009. CRIU was first presented in 2011 by some <!> as a method for live migration of containers between physical servers, and has over time proved itself a <!> for reducing serverless cold starts.</p> <p>CRIU is developed for the <code>runc</code> container runtime, but for security reasons Modal uses the gVisor container runtime <code>runsc</code> (short for “run Sandboxed Container”). While <code>runc</code> has containers run on the host kernel, gVisor implements a userspace kernel and gives the guest container access to that. This has obvious implications for container snapshotting. While a <code>runc</code> snapshotting solution cooperates with the host Linux kernel to save container state—the kernel exposes, via /proc VFS, details about a process’s memory maps, open files, children processes— gVisor controls the userspace kernel serving a snapshotted container guest.</p> <p><!></p> <p>So while gVisor’s checkpoint/restore functionality was developed many years after CRIU, it’s actually quite like pre-CRIU solutions which involved customizing the Linux kernel (ie. ‘container restore in kernelspace’). gVisor’s core <code>kernel.go</code> file contains checkpoint/restore code and at least eighteen system components implement checkpoint/restore functionality in <code>save_restore.go</code> files. You can make a lot of checkpoint/restore specific kernel customizations if you reimplement the Linux kernel in userspace!</p> <h2 id="performance-checkpointrestore-vs-lazy-loading">Performance: Checkpoint/restore vs. lazy loading</h2> <p>It’s not obvious why restoring a container snapshot with gVisor’s <code>runsc restore</code> would be so much faster than a standard <code>runsc run</code> container startup.</p> <p>The main reason is that Python’s import system is filesystem-based and needs to execute thousands of slow, sequential filesystem operations in order to become ready to perform useful work.</p> <p>It’s <em>thousands</em> because even just importing <code>torch</code> in Python executes 26,000 syscalls! It’s slow because there’s a couple layers of indirection between the container’s filesystem and the actual file data. A Modal container filesystem is an <!> filesystem where the read-only lower is a FUSE-based lazy loading file server, which means that every file read incurs some overhead.</p> <!> <p>The fastest code is the code that never runs, and so fast container startup is mostly about laziness, work avoidance. Basically, not doing work where it’s not needed. Almost every container on Modal has thousands of files in <code>/usr/share/doc</code>, but ~zero of our users’ programs actually need to read those files. So we don’t load them.</p> <p>For more detail on our lazy-loading container filesystem, see <!>.</p> <p>Despite cutting out heaps of eager file I/O with lazy loading, importing <code>torch</code> still executes 26,000 syscalls, context switching between the caller, the kernel, and the FUSE server. Python’s filesystem-based, syscall heavy module loading is just too slow. So we turn to checkpoint/restore, which turns thousands of syscalls into (roughly) a single file load, recreating the process’s memory mappings directly rather than re-running through the Python import system and all other application code executed during container startup.</p> <h2 id="a-single-file-load">A single file load?</h2> <p><!></p> <p>The container restore process is a frenetic process of summoning and ensemble choreography, but most of the performance is won or lost on how fast the ‘main’ process’s memory mappings can be brought into the operating system’s page cache. These memory mappings are typically 100MiB-10GiB and stored in a single snapshot ‘pages’ file, referring to the 4KiB page (or huge pages) of the virtual memory system.</p> <p>When restoring, gVisor does not need to wait to read the entire ‘state’ file into memory before allowing the restored container to progress. Instead it can read the restored processes’ pages <!>, prioritizing those pages which a restored process blocks on.</p> <p>This background-loaded pages file is made available to gVisor through the same distributed, FUSE-based file serving system used for our standard container loading. To ensure the FUSE system doesn’t keep gVisor waiting when it requests a page, we aggressively preload the entire pages file into page cache as early as we can. In the worst case, the restoring process page faults and gVisor finds that the FUSE file server doesn’t already have the page in-memory, nor is the page on host disk. Thus, the restoring process is blocked waiting for the FUSE server to complete a networked file read, which takes 10s of milliseconds.</p> <p>Much has been ignored by focusing only on the pages file’s loading, but it’s here the 80 in the 80/20 rule. gVisor’s prioritized, background page loading and our FUSE filesystem’s aggressive preloading cooperate to minimize aggregate page fault latency in a restoring guest process.</p> <p>Now, is all this fast enough?</p> <h2 id="performance-25x-faster">Performance: 2.5x faster</h2> <p>We’ve found that memory snapshot restore is about 2.5x faster than a standard container startup. A Stable Diffusion inference Function that takes around 13 seconds normally restores in <em>only 3.5 seconds</em>. A simple <code>import torch</code> example program which was noted as executing 26,000 syscalls takes normally around 5 seconds to cold start. With snapshot restore it’s around 1.05 seconds at p50 and 0.69 seconds at p0!</p> <div class="h-60 flex gap-4"><div class="flex-1"><!></div> <div class="flex-1"><!></div></div> <p>While restore is already much, much faster than the status quo, we can make it better. The current restore implementation is performance-constrained by how fast the virtual memory of the main process, sometimes GiBs of data, can be loaded off disk (or over the network) and into memory.</p> <p>We’re observing container restore incurring CPU pressure as it eagerly loads hundreds of thousands of 4KiB pages. <!> is going as high as 900/ms/s, indicating our container cgroup resource management needs better tuning for aggressive resource usage at startup. This is not exactly as bad as leaving the handbrake on, but kind of like straining to get a fixie bike going uphill.</p> <p>We also could optimize how we preload the guest’s virtual memory pages into the host page cache. Sometimes restore files are served over the network, and while we expect our hosts to drive around 2GiB/s of network download, in the tail we’re observing much less effective throughput.</p> <p>So there’s still work to be done, and you should expect the restore line above to move more to the left and get straighter as we make optimizations!</p> <h2 id="under-the-hood-snapshot-lifecycle">Under the hood: snapshot lifecycle</h2> <p>Deployed Functions with memory snapshots enabled only get snapshotted on-demand, not proactively. Also, a single deployed Function version will get snapshotted <em>multiple times</em>, for an interesting reason.</p> <p>Snapshots are created on-demand when Modal’s scheduler finds that it does not have an existing active Function snapshot available for the Modal worker host onto which it intends to place that Function.</p> <!> <p>Having to match a Function snapshot with a particular worker is one of the reasons a single Function version will be snapshotted multiple times. For example, the AWS g6.12xlarge instance type does not support the <code>pclmulqdq</code> <!> instruction and so it cannot accept any snapshot created on a host which does. Our users didn’t sign up expecting to debug Invalid Opcode exceptions!</p> <p>Beyond CPU featureset compatibility concerns, memory snapshots are also sensitive to changes in NVIDIA driver version and container runtime version. Such compatibility concerns are the major reason that Modal controls the snapshot lifecycle on behalf of users, ensuring that restores consistently succeed across a dynamic and evolving worker fleet.</p> <h2 id="tradeoffs-or-is-it-really-that-simple">Tradeoffs: or, is it really that simple?</h2> <p>Memory snapshots significantly reduce cold starts but they also decrease simplicity. Andrew Morton <!>, but we’ve sided with the Russians and gone a bit mad. We’re freezing containers mid-execution and serializing them to disk.</p> <p>The main chore ‘checkpoint/restore in userspace’ tends to require is cooperation from the guest program. Programs need to understand that they will be paused for an indefinite amount of time and resumed on a different computer, possibly with a different IP address. They also need to understand that the state they establish prior to snapshotting will be <em>reused</em> over and over again—expectations of entropy may be violated.</p> <p>The team has already worked hard to make the Modal <!> cooperative with checkpoint/restore. When tricky cases cause restore to fail (and this does happen) we automatically fallback to a standard container startup. We recommend testing outside of production before deploying a Function to production with memory snapshots enabled.</p> <p>For more information on managing sharp edges, see the <!>.</p> <h2 id="interface-adopting-memory-snapshot-speedups">Interface: adopting memory snapshot speedups</h2> <p>Ok, so how do you use it?</p> <p>Modal Functions can turn on snapshotting using the <code>enable_memory_snapshot=True</code> argument and <!> can opt-in to snapshotting using the <code>snap=True</code> argument.</p> <p>Here’s a ‘hello world’ example that just imports <code>torch</code>.</p> <!> <p>The above Modal Function <code>f</code> will be snapshotted once it has deployed and run a handful of times in production. (We currently create snapshots on-demand, not proactively.)</p> <p>The snapshot has captured the <code>import torch</code> global import as well as anything else that executed in global scope, such as the rootfs disk mutation. It has essentially paused and saved <em>right before</em> it’s about to fetch a request and feed that request into <code>f</code>.</p> <p>This allows us to jump straight back into <code>f(x)</code> on restore, as shown below.</p> <p><!></p> <p>Whenever Modal detects that a redeploy has invalidated an existing snapshot of <code>f</code>, new snapshots are created.</p> <h3 id="handling-gpu-state">Handling GPU state</h3> <p>It was said above that lifecycle functions can be snapshotted, and this is important for managing GPU state. Because memory snapshots do not yet support saving GPU state to file, GPU state must be created post-restore.</p> <!> <p>The above GPT-2 inference Function has a <code>snap=True</code> lifecycle method which setups the model in CPU RAM for snapshotting, and a <code>snap=False</code> lifecycle method to move from CPU RAM to GPU vRAM right after restore.</p> <p>This demo inference Function restores 2.5x faster using memory snapshots 🏎️.</p> <h2 id="acknowledgements">Acknowledgements</h2> <p>Many thanks to the <!> for creating gVisor and its <!> functionality. Thanks also to Luis Capelo, Colin Weld, and Matt Nappo for their work and design discussions related to\xA0memory snapshots.</p> <p>If you’re interested in building fast, reliable, and heavy-duty systems for the cloud,\xA0<!>.</p>`,1);function j(n,y){let b=s(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(y,!1);let x=([e,t])=>({duration:e,quantile:t}),S=[[.69,0],[.81,.05],[.85,.1],[.87,.15],[.9,.2],[.92,.25],[.95,.3],[.97,.35],[1,.4],[1.02,.45],[1.05,.5],[1.08,.55],[1.12,.6],[1.16,.65],[1.21,.7],[1.28,.75],[1.34,.8],[1.43,.85],[1.58,.9],[1.96,.95],[8.6,1]].map(x),C=[[2.65,0],[2.89,.05],[3.06,.1],[3.24,.15],[3.39,.2],[3.73,.25],[3.9,.3],[4,.35],[4.11,.4],[4.18,.45],[4.29,.5],[4.47,.55],[4.59,.6],[4.84,.65],[5.02,.7],[5.17,.75],[5.33,.8],[5.62,.85],[6.11,.9],[6.78,.95],[11.74,1]].map(x),w=[[2.51,0],[2.9,.05],[3.04,.1],[3.08,.15],[3.14,.2],[3.2,.25],[3.27,.3],[3.33,.35],[3.39,.4],[3.48,.45],[3.56,.5],[3.69,.55],[3.78,.6],[3.86,.65],[3.95,.7],[4.07,.75],[4.48,.8],[6,.85],[7.81,.9],[10.05,.95],[21.11,1]].map(x),T=[[11.67,0],[12.2,.05],[12.52,.1],[12.73,.15],[12.89,.2],[13.14,.25],[13.38,.3],[13.99,.35],[14.21,.4],[14.36,.45],[14.45,.5],[14.6,.55],[14.75,.6],[15,.65],[15.25,.7],[15.6,.75],[16.41,.8],[17.43,.85],[18.64,.9],[21.51,.95],[28.64,1]].map(x),E=[{values:S,name:`import_torch_snapshot`,color:`#7fee64`},{values:C,name:`import_torch`,color:`#612ff1`}],D=[{values:w,name:`stable_diffusion_snapshot`,color:`#7fee64`},{values:T,name:`stable_diffusion`,color:`#fd5d5d`}];t(),_(n,c(()=>b,()=>v,{children:(t,n)=>{var a=A(),s=u(l(a),4);p(e(s),{title:`import torch (eCDF)`,get series(){return E}}),r(s);var c=u(s,6);m(e(c),{src:`https://modal-cdn.com/cdnbot/modal-snapshot-process-diagramtq1ww54b_99ced4b9.webp`,alt:`Diagram of process component state that is saved to disk (credit Tristan Hume)`}),r(c);var d=u(c,4),_=u(e(d),3);g(_,{href:`https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=099469502f62fbe0d7e4f0b83a2f22538367f734`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`“mad Russians”`))},$$slots:{default:!0}}),g(u(_,2),{href:`https://ipads.se.sjtu.edu.cn/_media/publications/catalyzer-asplos20.pdf`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`handy technique`))},$$slots:{default:!0}}),f(),r(d);var v=u(d,4);m(e(v),{src:`https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-289iuooft_6e5a069b.webp`,alt:`Timeline showing when Linux, LXC, CRIU, and gVisor were released`}),r(v);var y=u(v,10);g(u(e(y),5),{href:`https://en.wikipedia.org/wiki/OverlayFS`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`OverlayFS`))},$$slots:{default:!0}}),f(),r(y);var b=u(y,2);h(b,{code:`overlay%20on%20%2Fmnt%2Foverlay%20type%20overlay%20(%0A%20%20%20%20rw%2C%20relaltime%2C%0A%20%20%20%20upperdir%3D%2Ftmp%2Ftmph45cav46%2Fupper%2C%0A%20%20%20%20lowerdir%3D%2Ftmp%2Ftmph45cav46%2Fimagefs_fuse%2C%20%20%3C%3C%20lazy-loading%20file%20server%0A%20%20%20%20workdir%3D%2Ftmp%2Ftmph45cav46%2Fwork%0A)`,lang:`cpp`});var x=u(b,4);g(u(e(x)),{href:`https://modal.com/blog/jono-containers-talk`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`Fast, lazy container loading in Modal.com`))},$$slots:{default:!0}}),f(),r(x);var S=u(x,6);m(e(S),{src:`https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-4hth1rar3_a5e507bd.webp`,alt:`Diagram showing the simplified restore problem, where Python process memory mappings are served from FUSE via gVisor.`}),r(S);var C=u(S,4);g(u(e(C)),{href:`https://github.com/google/gvisor/commit/41f01d8f9c5aee4f7a31ec6183fb50bbc6f9b851`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`in the background`))},$$slots:{default:!0}}),f(),r(C);var w=u(C,12),T=e(w);p(e(T),{title:`import torch`,get series(){return E}}),r(T);var O=u(T,2);p(e(O),{title:`Stable Diffusion`,get series(){return D}}),r(O),r(w);var k=u(w,4);g(u(e(k)),{href:`https://dx13.co.uk/articles/2023/07/27/cpu-stalls/`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`CPU stalling`))},$$slots:{default:!0}}),f(),r(k);var j=u(k,12);h(j,{code:`snapshot_info%3A%20Optional%5Bapi_pb2.SnapshotInfo%5D%20%3D%20None%0Aif%20function_proto.checkpointing_enabled%3A%0A%20%20%20%20snapshot_info%20%3D%20await%20get_or_create_checkpoint_for_worker_and_task(%0A%20%20%20%20%20%20%20%20state%2C%20ephemeral_function_struct%2C%20worker_ephemeral_struct%2C%20task_id%0A%20%20%20%20)`,lang:`python`});var M=u(j,2);g(u(e(M),3),{href:`http://en.wikipedia.org/wiki/CLMUL_instruction_set`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`Perform a Carry-Less Multiplication of Quadword`))},$$slots:{default:!0}}),f(),r(M);var N=u(M,6);g(u(e(N)),{href:`https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=099469502f62fbe0d7e4f0b83a2f22538367f734`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`tried to warn us`))},$$slots:{default:!0}}),f(),r(N);var P=u(N,4);g(u(e(P)),{href:`https://github.com/modal-labs/modal-client`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`client`))},$$slots:{default:!0}}),f(),r(P);var F=u(P,2);g(u(e(F)),{href:`https://modal.com/docs/guide/memory-snapshots`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`guide page`))},$$slots:{default:!0}}),f(),r(F);var I=u(F,6);g(u(e(I),3),{href:`/docs/guide/lifecycle-functions#container-lifecycle-hooks`,children:(e,t)=>{f(),o(e,i(`lifecycle methods`))},$$slots:{default:!0}}),f(3),r(I);var L=u(I,4);h(L,{code:`import%20pathlib%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22torch%22)%0Aapp%20%3D%20modal.App(name%3D%22demo-memory-snapshot%22)%0A%0Apathlib.Path(%22.%2Ffoo%22).write_text(%22disk%20mutation%22)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20torch%20%20%23%2026k%20syscalls%20comin'%20right%20up!%0A%0A%40app.function(enable_memory_snapshot%3DTrue)%0Adef%20f(x%3A%20int)%3A%0A%20%20%20%20print(f%22Hello%20from%20torch%20%7Btorch.__version__%7D.%20You%20gave%20me%20%7Bx%3D%7D%22)`,lang:`python`});var R=u(L,8);m(e(R),{src:`https://modal-cdn.com/cdnbot/mem-snapshots-blog-post-5-ay7ar0i9_c042c9d0.webp`,alt:`Diagram showing the snapshot restore process`}),r(R);var z=u(R,8);h(z,{code:`import%20time%0Aimport%20modal%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22transformers%22%2C%20%22torch%22%2C%20%22accelerate%22%2C%20%22safetensors%22%2C%0A%20%20%20%20)%0A)%0Aapp%20%3D%20modal.App(%22snap-demo%22%2C%20image%3Dimage)%0A%0A%40app.cls(gpu%3D%22a10g%22%2C%20enable_memory_snapshot%3DTrue)%0Aclass%20GPT2%3A%0A%20%20%20%20%40modal.enter(snap%3DTrue)%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20from%20transformers%20import%20AutoModelForCausalLM%2C%20AutoTokenizer%0A%20%20%20%20%20%20%20%20self.model%20%3D%20AutoModelForCausalLM.from_pretrained(%22%2Froot%2Fcache%22%2C%20use_cache%3DTrue)%0A%20%20%20%20%20%20%20%20self.tokenizer%20%3D%20AutoTokenizer.from_pretrained(%22gpt2%22%2C%20use_fast%3DTrue%2C%20use_cache%3DTrue)%0A%0A%20%20%20%20%40modal.enter(snap%3DFalse)%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20self.model.to(%22cuda%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20input_ids%20%3D%20self.tokenizer.encode(%22What's%20up%3F%22%2C%20return_tensors%3D%22pt%22)%0A%20%20%20%20%20%20%20%20out%20%3D%20self.model.generate(%0A%20%20%20%20%20%20%20%20%20%20%20%20input_ids.to(%22cuda%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20pad_token_id%3Dself.tokenizer.eos_token_id%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20generated_text%20%3D%20self.tokenizer.decode(out%5B0%5D%2C%20skip_special_tokens%3DTrue)%0A%20%20%20%20%20%20%20%20return%20generated_text`,lang:`python`});var B=u(z,8),V=u(e(B));g(V,{href:`https://github.com/google/gvisor`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`gVisor team`))},$$slots:{default:!0}}),g(u(V,2),{href:`https://gvisor.dev/docs/user_guide/checkpoint_restore/`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`Checkpoint/Restore`))},$$slots:{default:!0}}),f(),r(B);var H=u(B,2);g(u(e(H)),{href:`https://modal.com/company`,rel:`nofollow`,children:(e,t)=>{f(),o(e,i(`Modal is hiring`))},$$slots:{default:!0}}),f(),r(H),o(t,a)},$$slots:{default:!0}})),a()}export{j as default,v as metadata};
//# sourceMappingURL=BI9H_5Eu.js.map
