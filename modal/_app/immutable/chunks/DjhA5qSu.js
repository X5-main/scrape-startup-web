(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3caf8ce4-33fc-4312-add0-96a348445891`,e._sentryDebugIdIdentifier=`sentry-dbid-3caf8ce4-33fc-4312-add0-96a348445891`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as ee}from"./CPby7b1n.js";import{t as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={description:`Train and serve very large models with Modal's multi-node clusters.`,toc:[{depth:1,value:`Multi-node clusters`,id:`multi-node-clusters`,children:[{depth:3,value:`Cluster compute capability`,id:`cluster-compute-capability`},{depth:3,value:`@clustered`,id:`clustered`},{depth:2,value:`Scheduling`,id:`scheduling`,children:[{depth:3,value:`Rank & input broadcast`,id:`rank--input-broadcast`}]},{depth:2,value:`Networking`,id:`networking`,children:[{depth:3,value:`RDMA (Infiniband)`,id:`rdma-infiniband`}]},{depth:2,value:`Cluster Info`,id:`cluster-info`},{depth:2,value:`Fault Tolerance`,id:`fault-tolerance`,children:[{depth:3,value:`Input Synchronization`,id:`input-synchronization`}]},{depth:2,value:`Examples`,id:`examples`,children:[{depth:3,value:`Torchrun Example`,id:`torchrun-example`}]}]}],rawContent:`# Multi-node clusters

<Callout variant="beta" />

Modal supports running a training job across several coordinated containers. Each container can saturate the available GPU devices on its host (aka node) and communicate with peer containers which do the same. By scaling a training job from a single GPU to 16 GPUs you can achieve nearly 16x improvements in training time.

### Cluster compute capability

Modal clusters provide:

- A 50 Gbps [IPv6 private network](https://modal.com/docs/guide/private-networking) for orchestration, dataset downloading, etc.
- A 3,200 Gbps RDMA scale-out network ([RoCE](https://en.wikipedia.org/wiki/RDMA_over_Converged_Ethernet)).
- Up to 64 devices.
- At least 1 TB of RAM and 4 TB of local NVMe SSD per node.
- Deep burn-in testing.
- Interoperability with all Modal platform functionality ([Volumes](/docs/guide/volumes), [Dicts](/docs/guide/dicts), [Tunnels](/docs/guide/tunnels), etc.).

The guide will walk you through how the Modal client library enables multi-node training and integrates with \`torchrun\`.

### \`@clustered\`

Unlike standard Modal Function containers, containers in a multi-node training job must be able to:

1. Perform fast, direct network communication between each other.
2. Be scheduled together, all or nothing, at the same time.

The \`@clustered\` decorator enables this behavior.

\`\`\`python
import modal.experimental

@app.function(
    gpu="H100:8",
    timeout=60 * 60 * 24,
    retries=modal.Retries(initial_delay=0.0, max_retries=10),
)
@modal.experimental.clustered(size=4)
def train_model():
    cluster_info = modal.experimental.get_cluster_info()

    container_rank = cluster_info.rank
    world_size = len(cluster_info.container_ips)
    main_addr = cluster_info.container_ips[0]
    is_main = "(main)" if container_rank == 0 else ""

    print(f"{container_rank=} {is_main} {world_size=} {main_addr=}")
    ...
\`\`\`

Applying this decorator under \`@app.function\` modifies the Function so that remote calls to it are serviced by a multi-node container group. The above configuration creates a group of four containers each having 8 H100 GPU devices, for a total of 32 devices.

<Callout variant="info">

Starting May 31st, 2026, clustered functions must use the full number of GPU devices per node (e.g. \`H100:4\` is invalid but \`H100:8\` is valid). Clustered functions require GPUs, and CPU-only functions are not supported. If you have a special case that does not fall under above and would like to use clustered functions, please contact [support@modal.com](mailto:support@modal.com).

</Callout>

## Scheduling

A \`modal.experimental.clustered\` Function runs on multiple nodes in our cloud, but executes like a normal function call. For example, all nodes are scheduled together ([gang scheduling](https://en.wikipedia.org/wiki/Gang_scheduling)) so that your code runs on all of the requested hardware or not at all.

Traditionally this kind of cluster and scheduling management would be handled by SLURM, Kubernetes, or manually. But with Modal it's all provided serverlessly with just a Python decorator!

### Rank & input broadcast

![diagram](https://modal-cdn.com/cdnbot/multinodepmgnla70_4b57a155.webp)

You may notice above that a single \`.remote\` Function call created three input executions but returned only one output. This is how input-output is structured for multi-node training jobs on Modal. The Function call’s arguments are replicated to each container, but only the rank zero container’s is returned to the caller.

A container’s rank is a key concept in multi-node jobs. Rank zero is the 'leader' rank and typically coordinates the job. Rank zero is also known as the "main" container. Rank zero's output will always be the output of a multi-node training run.

## Networking

Function containers cannot normally make direct network connections to other Function containers, but this is a requirement for multi-node training communication. So, along with gang scheduling, the \`@clustered\` decorator enables Modal’s workspace-private inter-container networking called [i6pn](https://www.notion.so/Multi-node-docs-1281e7f16949806f966adedfe8b2cb74?pvs=21).

The [cluster networking guide](/docs/guide/private-networking) goes into more detail on i6pn, but the upshot is that each container in the cluster is made aware of the network address of all the other containers in the cluster, enabling them to communicate with each other quickly via [TCP](https://pytorch.org/docs/stable/elastic/rendezvous.html).

### RDMA (Infiniband)

Clusters are equipped with Infiniband providing up to 3,200 Gbps scale-out bandwidth for inter-node communication.
RDMA scale-out networking is enabled with the \`rdma\` parameter of \`modal.experimental.clustered\`.

\`\`\`python notest
@modal.experimental.clustered(size=2, rdma=True)
def train():
    ...
\`\`\`

To run a simple Infiniband RDMA performance test see the [this sample code](https://github.com/modal-labs/multinode-training-guide/tree/main/benchmark).

## Cluster Info

\`modal.experimental.get_cluster_info()\` exposes the following information about the cluster:

- \`rank: int\` is the current container's order within the cluster, starting from \`0\`, the leader.
- \`cluster_id: str\` is the unique identifier for the cluster.
- \`container_ips: list[str]\` contains the IPv6 addresses of each container in the cluster, sorted by rank.
- \`container_ipv4_ips: list[str]\` contains the IPv4 addresses of each container in the cluster, sorted by rank.

## Fault Tolerance

For a clustered Function, failures in inputs and containers are handled differently.

If an input fails on any container, this failure **is not propagated** to other containers in the cluster. Containers are responsible for detecting and responding to input failures on other containers.

Only rank 0's output matters: if an input fails on the leader container (rank 0), the input is marked as failed, even if the input succeeds on another container. Similarly, if an input succeeds on the leader container but fails on another container, the input will still be marked as successful.

If a container in the cluster is preempted, or if the leader container (rank 0) fails, Modal will terminate all remaining containers in the cluster, and retry the input.

### Input Synchronization

_**Important:**_ synchronization is not relevant for single training runs, and applies mostly to inference use-cases.

Modal does not synchronize input execution across containers. Containers are responsible for ensuring that they do not process inputs faster than other containers in their cluster.

In particular, it is important that the leader container (rank 0) only starts processing the next input after all other containers have finished processing the current input.

## Examples

To get hands-on with multi-node training you can jump into the [\`Modal Training Gym\`](https://gym.modal.dev), [\`multinode-training-guide\` repository](https://github.com/modal-labs/multinode-training-guide), or\xA0[\`modal-examples\`\xA0repository](https://github.com/modal-labs/modal-examples/tree/main/14_clusters) and \`modal run\` something!

- [Simple ‘hello world’ 4 x 1 H100 torch cluster example](https://github.com/modal-labs/modal-examples/blob/main/14_clusters/simple_torch_cluster.py)
- [Infiniband RDMA performance test](https://github.com/modal-labs/multinode-training-guide/tree/main/benchmark)
- [Use 2 x 8 H100s to train a ResNet50 model on the ImageNet dataset](https://github.com/modal-labs/multinode-training-guide/tree/main/resnet50)
- [Speedrun GPT-2 training with modded-nanogpt](https://github.com/modal-labs/multinode-training-guide/tree/main/nanoGPT)
<!-- - Use 2 x 8 H100s to run multi-node _inference_ on LLaMA 3.1 405B in 16bit precision. **[TODO]** -->

### Torchrun Example

\`\`\`python
import modal
import modal.experimental

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("torch~=2.5.1", "numpy~=2.2.1")
    .add_local_dir(
        "training", remote_path="/root/training"
    )
)
app = modal.App("example-simple-torch-cluster", image=image)

n_nodes = 4

@app.function(gpu=f"H100:8", timeout=60 * 60 * 24)
@modal.experimental.clustered(size=n_nodes, rdma=True)
def launch_torchrun():
    # import the 'torchrun' interface directly.
    from torch.distributed.run import parse_args, run

    cluster_info = modal.experimental.get_cluster_info()

    run(
        parse_args(
            [
                f"--nnodes={n_nodes}",
                f"--node-rank={cluster_info.rank}",
                f"--master-addr={cluster_info.container_ips[0]}",
                "--nproc-per-node=8",
                "--master-port=1234",
                "training/train.py",
            ]
        )
    )
\`\`\`
`,meta:{title:`Multi-node clusters`,description:`Train and serve very large models with Modal's multi-node clusters.`}},{description:v,toc:y,rawContent:b,meta:x}=_,S=t(`<code>@clustered</code>`),C=t(`<p>Starting May 31st, 2026, clustered functions must use the full number of GPU devices per node (e.g. <code>H100:4</code> is invalid but <code>H100:8</code> is valid). Clustered functions require GPUs, and CPU-only functions are not supported. If you have a special case that does not fall under above and would like to use clustered functions, please contact <!>.</p>`),te=t(`<code>Modal Training Gym</code>`),ne=t(`<code>multinode-training-guide</code> repository`,1),re=t(`<code>modal-examples</code>\xA0repository`,1),ie=t(`<!> <!> <p>Modal supports running a training job across several coordinated containers. Each container can saturate the available GPU devices on its host (aka node) and communicate with peer containers which do the same. By scaling a training job from a single GPU to 16 GPUs you can achieve nearly 16x improvements in training time.</p> <!> <p>Modal clusters provide:</p> <ul><li>A 50 Gbps <!> for orchestration, dataset downloading, etc.</li> <li>A 3,200 Gbps RDMA scale-out network (<!>).</li> <li>Up to 64 devices.</li> <li>At least 1 TB of RAM and 4 TB of local NVMe SSD per node.</li> <li>Deep burn-in testing.</li> <li>Interoperability with all Modal platform functionality (<!>, <!>, <!>, etc.).</li></ul> <p>The guide will walk you through how the Modal client library enables multi-node training and integrates with <code>torchrun</code>.</p> <!> <p>Unlike standard Modal Function containers, containers in a multi-node training job must be able to:</p> <ol><li>Perform fast, direct network communication between each other.</li> <li>Be scheduled together, all or nothing, at the same time.</li></ol> <p>The <code>@clustered</code> decorator enables this behavior.</p> <!> <p>Applying this decorator under <code>@app.function</code> modifies the Function so that remote calls to it are serviced by a multi-node container group. The above configuration creates a group of four containers each having 8 H100 GPU devices, for a total of 32 devices.</p> <!> <!> <p>A <code>modal.experimental.clustered</code> Function runs on multiple nodes in our cloud, but executes like a normal function call. For example, all nodes are scheduled together (<!>) so that your code runs on all of the requested hardware or not at all.</p> <p>Traditionally this kind of cluster and scheduling management would be handled by SLURM, Kubernetes, or manually. But with Modal it’s all provided serverlessly with just a Python decorator!</p> <!> <p><!></p> <p>You may notice above that a single <code>.remote</code> Function call created three input executions but returned only one output. This is how input-output is structured for multi-node training jobs on Modal. The Function call’s arguments are replicated to each container, but only the rank zero container’s is returned to the caller.</p> <p>A container’s rank is a key concept in multi-node jobs. Rank zero is the ‘leader’ rank and typically coordinates the job. Rank zero is also known as the “main” container. Rank zero’s output will always be the output of a multi-node training run.</p> <!> <p>Function containers cannot normally make direct network connections to other Function containers, but this is a requirement for multi-node training communication. So, along with gang scheduling, the <code>@clustered</code> decorator enables Modal’s workspace-private inter-container networking called <!>.</p> <p>The <!> goes into more detail on i6pn, but the upshot is that each container in the cluster is made aware of the network address of all the other containers in the cluster, enabling them to communicate with each other quickly via <!>.</p> <!> <p>Clusters are equipped with Infiniband providing up to 3,200 Gbps scale-out bandwidth for inter-node communication.
RDMA scale-out networking is enabled with the <code>rdma</code> parameter of <code>modal.experimental.clustered</code>.</p> <!> <p>To run a simple Infiniband RDMA performance test see the <!>.</p> <!> <p><code>modal.experimental.get_cluster_info()</code> exposes the following information about the cluster:</p> <ul><li><code>rank: int</code> is the current container’s order within the cluster, starting from <code>0</code>, the leader.</li> <li><code>cluster_id: str</code> is the unique identifier for the cluster.</li> <li><code>container_ips: list[str]</code> contains the IPv6 addresses of each container in the cluster, sorted by rank.</li> <li><code>container_ipv4_ips: list[str]</code> contains the IPv4 addresses of each container in the cluster, sorted by rank.</li></ul> <!> <p>For a clustered Function, failures in inputs and containers are handled differently.</p> <p>If an input fails on any container, this failure <strong>is not propagated</strong> to other containers in the cluster. Containers are responsible for detecting and responding to input failures on other containers.</p> <p>Only rank 0’s output matters: if an input fails on the leader container (rank 0), the input is marked as failed, even if the input succeeds on another container. Similarly, if an input succeeds on the leader container but fails on another container, the input will still be marked as successful.</p> <p>If a container in the cluster is preempted, or if the leader container (rank 0) fails, Modal will terminate all remaining containers in the cluster, and retry the input.</p> <!> <p><em><strong>Important:</strong></em> synchronization is not relevant for single training runs, and applies mostly to inference use-cases.</p> <p>Modal does not synchronize input execution across containers. Containers are responsible for ensuring that they do not process inputs faster than other containers in their cluster.</p> <p>In particular, it is important that the leader container (rank 0) only starts processing the next input after all other containers have finished processing the current input.</p> <!> <p>To get hands-on with multi-node training you can jump into the <!>, <!>, or\xA0<!> and <code>modal run</code> something!</p> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <!> <!>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=ie(),h=s(o);ee(h,{id:`multi-node-clusters`,children:(e,t)=>{l(),i(e,r(`Multi-node clusters`))},$$slots:{default:!0}});var _=c(h,2);u(_,{variant:`beta`});var v=c(_,4);f(v,{id:`cluster-compute-capability`,children:(e,t)=>{l(),i(e,r(`Cluster compute capability`))},$$slots:{default:!0}});var y=c(v,4),b=e(y);g(c(e(b)),{href:`https://modal.com/docs/guide/private-networking`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`IPv6 private network`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);g(c(e(x)),{href:`https://en.wikipedia.org/wiki/RDMA_over_Converged_Ethernet`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RoCE`))},$$slots:{default:!0}}),l(),n(x);var w=c(x,8),T=c(e(w));g(T,{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}});var E=c(T,2);g(E,{href:`/docs/guide/dicts`,children:(e,t)=>{l(),i(e,r(`Dicts`))},$$slots:{default:!0}}),g(c(E,2),{href:`/docs/guide/tunnels`,children:(e,t)=>{l(),i(e,r(`Tunnels`))},$$slots:{default:!0}}),l(),n(w),n(y);var D=c(y,4);f(D,{id:`clustered`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var O=c(D,8);m(O,{code:`import%20modal.experimental%0A%0A%40app.function(%0A%20%20%20%20gpu%3D%22H100%3A8%22%2C%0A%20%20%20%20timeout%3D60%20*%2060%20*%2024%2C%0A%20%20%20%20retries%3Dmodal.Retries(initial_delay%3D0.0%2C%20max_retries%3D10)%2C%0A)%0A%40modal.experimental.clustered(size%3D4)%0Adef%20train_model()%3A%0A%20%20%20%20cluster_info%20%3D%20modal.experimental.get_cluster_info()%0A%0A%20%20%20%20container_rank%20%3D%20cluster_info.rank%0A%20%20%20%20world_size%20%3D%20len(cluster_info.container_ips)%0A%20%20%20%20main_addr%20%3D%20cluster_info.container_ips%5B0%5D%0A%20%20%20%20is_main%20%3D%20%22(main)%22%20if%20container_rank%20%3D%3D%200%20else%20%22%22%0A%0A%20%20%20%20print(f%22%7Bcontainer_rank%3D%7D%20%7Bis_main%7D%20%7Bworld_size%3D%7D%20%7Bmain_addr%3D%7D%22)%0A%20%20%20%20...`,lang:`python`});var k=c(O,4);u(k,{variant:`info`,children:(t,a)=>{var o=C();g(c(e(o),5),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(o),i(t,o)},$$slots:{default:!0}});var A=c(k,2);d(A,{id:`scheduling`,children:(e,t)=>{l(),i(e,r(`Scheduling`))},$$slots:{default:!0}});var j=c(A,2);g(c(e(j),3),{href:`https://en.wikipedia.org/wiki/Gang_scheduling`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gang scheduling`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);f(M,{id:`rank--input-broadcast`,children:(e,t)=>{l(),i(e,r(`Rank & input broadcast`))},$$slots:{default:!0}});var N=c(M,2);p(e(N),{src:`https://modal-cdn.com/cdnbot/multinodepmgnla70_4b57a155.webp`,alt:`diagram`}),n(N);var P=c(N,6);d(P,{id:`networking`,children:(e,t)=>{l(),i(e,r(`Networking`))},$$slots:{default:!0}});var F=c(P,2);g(c(e(F),3),{href:`https://www.notion.so/Multi-node-docs-1281e7f16949806f966adedfe8b2cb74?pvs=21`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`i6pn`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2),L=c(e(I));g(L,{href:`/docs/guide/private-networking`,children:(e,t)=>{l(),i(e,r(`cluster networking guide`))},$$slots:{default:!0}}),g(c(L,2),{href:`https://pytorch.org/docs/stable/elastic/rendezvous.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`TCP`))},$$slots:{default:!0}}),l(),n(I);var R=c(I,2);f(R,{id:`rdma-infiniband`,children:(e,t)=>{l(),i(e,r(`RDMA (Infiniband)`))},$$slots:{default:!0}});var z=c(R,4);m(z,{code:`%40modal.experimental.clustered(size%3D2%2C%20rdma%3DTrue)%0Adef%20train()%3A%0A%20%20%20%20...`,lang:`python`});var B=c(z,2);g(c(e(B)),{href:`https://github.com/modal-labs/multinode-training-guide/tree/main/benchmark`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this sample code`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);d(V,{id:`cluster-info`,children:(e,t)=>{l(),i(e,r(`Cluster Info`))},$$slots:{default:!0}});var H=c(V,6);d(H,{id:`fault-tolerance`,children:(e,t)=>{l(),i(e,r(`Fault Tolerance`))},$$slots:{default:!0}});var U=c(H,10);f(U,{id:`input-synchronization`,children:(e,t)=>{l(),i(e,r(`Input Synchronization`))},$$slots:{default:!0}});var W=c(U,8);d(W,{id:`examples`,children:(e,t)=>{l(),i(e,r(`Examples`))},$$slots:{default:!0}});var G=c(W,2),K=c(e(G));g(K,{href:`https://gym.modal.dev`,rel:`nofollow`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}});var q=c(K,2);g(q,{href:`https://github.com/modal-labs/multinode-training-guide`,rel:`nofollow`,children:(e,t)=>{var n=ne();l(),i(e,n)},$$slots:{default:!0}}),g(c(q,2),{href:`https://github.com/modal-labs/modal-examples/tree/main/14_clusters`,rel:`nofollow`,children:(e,t)=>{var n=re();l(),i(e,n)},$$slots:{default:!0}}),l(3),n(G);var J=c(G,2),Y=e(J);g(e(Y),{href:`https://github.com/modal-labs/modal-examples/blob/main/14_clusters/simple_torch_cluster.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Simple ‘hello world’ 4 x 1 H100 torch cluster example`))},$$slots:{default:!0}}),n(Y);var X=c(Y,2);g(e(X),{href:`https://github.com/modal-labs/multinode-training-guide/tree/main/benchmark`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Infiniband RDMA performance test`))},$$slots:{default:!0}}),n(X);var Z=c(X,2);g(e(Z),{href:`https://github.com/modal-labs/multinode-training-guide/tree/main/resnet50`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Use 2 x 8 H100s to train a ResNet50 model on the ImageNet dataset`))},$$slots:{default:!0}}),n(Z);var Q=c(Z,2);g(e(Q),{href:`https://github.com/modal-labs/multinode-training-guide/tree/main/nanoGPT`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Speedrun GPT-2 training with modded-nanogpt`))},$$slots:{default:!0}}),n(Q),n(J);var $=c(J,2);f($,{id:`torchrun-example`,children:(e,t)=>{l(),i(e,r(`Torchrun Example`))},$$slots:{default:!0}}),m(c($,2),{code:`import%20modal%0Aimport%20modal.experimental%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.pip_install(%22torch~%3D2.5.1%22%2C%20%22numpy~%3D2.2.1%22)%0A%20%20%20%20.add_local_dir(%0A%20%20%20%20%20%20%20%20%22training%22%2C%20remote_path%3D%22%2Froot%2Ftraining%22%0A%20%20%20%20)%0A)%0Aapp%20%3D%20modal.App(%22example-simple-torch-cluster%22%2C%20image%3Dimage)%0A%0An_nodes%20%3D%204%0A%0A%40app.function(gpu%3Df%22H100%3A8%22%2C%20timeout%3D60%20*%2060%20*%2024)%0A%40modal.experimental.clustered(size%3Dn_nodes%2C%20rdma%3DTrue)%0Adef%20launch_torchrun()%3A%0A%20%20%20%20%23%20import%20the%20'torchrun'%20interface%20directly.%0A%20%20%20%20from%20torch.distributed.run%20import%20parse_args%2C%20run%0A%0A%20%20%20%20cluster_info%20%3D%20modal.experimental.get_cluster_info()%0A%0A%20%20%20%20run(%0A%20%20%20%20%20%20%20%20parse_args(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--nnodes%3D%7Bn_nodes%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--node-rank%3D%7Bcluster_info.rank%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--master-addr%3D%7Bcluster_info.container_ips%5B0%5D%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--nproc-per-node%3D8%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--master-port%3D1234%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22training%2Ftrain.py%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=DjhA5qSu.js.map
