(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a4c7c23a-816d-4a61-8d92-905deb5109ed`,e._sentryDebugIdIdentifier=`sentry-dbid-a4c7c23a-816d-4a61-8d92-905deb5109ed`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Simple PyTorch cluster`,id:`simple-pytorch-cluster`,children:[{depth:2,value:`Basic setup: Imports, dependencies, and a script`,id:`basic-setup-imports-dependencies-and-a-script`},{depth:2,value:`Configuring a test cluster`,id:`configuring-a-test-cluster`},{depth:2,value:`Launching the script`,id:`launching-the-script`}]}],rawContent:`# Simple PyTorch cluster

This example shows how you can perform distributed computation with PyTorch.
It is a kind of 'hello world' example for distributed ML training: setting up a cluster
and executing a broadcast operation to share a single tensor.

## Basic setup: Imports, dependencies, and a script

Let's get the imports out of the way first.
We need to import \`modal.experimental\` to use this feature, since it's still under development.
Let us know if you run into any issues!

\`\`\`python
import os
from pathlib import Path

import modal
import modal.experimental

\`\`\`

Communicating between nodes in a cluster requires communication libraries.
We'll use \`torch\`, so we add it to our container's [Image](https://modal.com/docs/guide/images) here.

\`\`\`python
image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "torch~=2.5.1", "numpy~=2.2.1"
)

\`\`\`

The approach we're going to take is to use a Modal [Function](https://modal.com/docs/reference/modal.Function)
to launch the underlying script we want to distribute over the cluster nodes.
The script is located in another file in the same directory
of [our examples repo](https://github.com/modal-labs/modal-examples/).
In order to use it in our remote Modal Function,
we need to duplicate it remotely, which we do with \`add_local_file\`.

\`\`\`python
this_directory = Path(__file__).parent

image = image.add_local_file(
    this_directory / "simple_torch_cluster_script.py",
    remote_path="/root/script.py",
)

app = modal.App("example-simple-torch-cluster", image=image)

\`\`\`

## Configuring a test cluster

First, we set the size of the cluster in containers/nodes. This can be between 1 and 8.
This is part of our Modal configuration, since Modal is responsible for spinning up our cluster.

\`\`\`python
n_nodes = 2

\`\`\`

Next, we set the number of processes we run per node.
The usual practice is to run one process per GPU,
so we set those two values to be equal.
Note that \`N_GPU\` is Modal configuration ("how many GPUs should we spin up for you?")
while \`nproc_per_node\` is \`torch.distributed\` configuration ("how many processes should we spawn for you?").

\`\`\`python
n_proc_per_node = N_GPU = 4
GPU_CONFIG = f"A10G:{N_GPU}"

\`\`\`

Lastly, we need to select our communications library: the software that will handle
sending messages between nodes in our cluster.
Since we are running on GPUs, we use the
[NVIDIA Collective Communications Library](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)
(\`nccl\`, pronounced "nickle").

This is part of \`torch.distributed\` configuration --
Modal handles the networking infrastructure but not the communication protocol.

\`\`\`python
backend = "nccl"  # or "gloo" on CPU, see https://pytorch.org/docs/stable/distributed.html#which-backend-to-use

\`\`\`

This cluster configurations is nice for testing, but typically
you'll want to run a cluster with the maximum number of GPUs per container --
8 if you're running on H100s, the beefiest GPUs we offer on Modal.

## Launching the script

Our Modal Function is merely a 'launcher' that sets up the distributed
cluster environment and then calls \`torch.distributed.run\`,
the underlying Python code exposed by the [\`torchrun\`](https://pytorch.org/docs/stable/elastic/run.html)
command line tool.

So executing this distributed job is easy! Just run

\`\`\`bash
modal run simple_torch_cluster.py
\`\`\`

in your terminal.

In addition to the values set in code above, you can pass additional arguments to \`torch.distributed.run\`
via the command line:

\`\`\`bash
modal run simple_torch_cluster.py --max-restarts=1
\`\`\`

\`\`\`python
@app.function(gpu=GPU_CONFIG)
@modal.experimental.clustered(size=n_nodes)
def dist_run_script(*args):
    from torch.distributed.run import parse_args, run

    cluster_info = (  # we populate this data for you
        modal.experimental.get_cluster_info()
    )
    # which container am I?
    container_rank = cluster_info.rank
    # how many containers are in this cluster?
    world_size = len(cluster_info.container_ips)
    # what's the leader/master/main container's address?
    main_addr = cluster_info.container_ips[0]
    # what's the identifier of this cluster task in Modal?
    task_id = os.environ["MODAL_TASK_ID"]
    print(f"hello from {container_rank=}")
    if container_rank == 0:
        print(
            f"reporting cluster state from rank0/main: {main_addr=}, {world_size=}, {task_id=}"
        )

    run(
        parse_args(
            [
                f"--nnodes={n_nodes}",
                f"--node_rank={cluster_info.rank}",
                f"--master_addr={main_addr}",
                f"--nproc-per-node={n_proc_per_node}",
                "--master_port=1234",
            ]
            + list(args)
            + ["/root/script.py", "--backend", backend]
        )
    )

\`\`\`
`,meta:{title:`Simple PyTorch cluster`,description:`This example shows how you can perform distributed computation with PyTorch. It is a kind of ‘hello world’ example for distributed ML training: setting up a cluster and executing a broadcast operation to share a single tensor.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>torchrun</code>`),b=t(`<!> <p>This example shows how you can perform distributed computation with PyTorch.
It is a kind of ‘hello world’ example for distributed ML training: setting up a cluster
and executing a broadcast operation to share a single tensor.</p> <!> <p>Let’s get the imports out of the way first.
We need to import <code>modal.experimental</code> to use this feature, since it’s still under development.
Let us know if you run into any issues!</p> <!> <p>Communicating between nodes in a cluster requires communication libraries.
We’ll use <code>torch</code>, so we add it to our container’s <!> here.</p> <!> <p>The approach we’re going to take is to use a Modal <!> to launch the underlying script we want to distribute over the cluster nodes.
The script is located in another file in the same directory
of <!>.
In order to use it in our remote Modal Function,
we need to duplicate it remotely, which we do with <code>add_local_file</code>.</p> <!> <!> <p>First, we set the size of the cluster in containers/nodes. This can be between 1 and 8.
This is part of our Modal configuration, since Modal is responsible for spinning up our cluster.</p> <!> <p>Next, we set the number of processes we run per node.
The usual practice is to run one process per GPU,
so we set those two values to be equal.
Note that <code>N_GPU</code> is Modal configuration (“how many GPUs should we spin up for you?”)
while <code>nproc_per_node</code> is <code>torch.distributed</code> configuration (“how many processes should we spawn for you?”).</p> <!> <p>Lastly, we need to select our communications library: the software that will handle
sending messages between nodes in our cluster.
Since we are running on GPUs, we use the <!> (<code>nccl</code>, pronounced “nickle”).</p> <p>This is part of <code>torch.distributed</code> configuration —
Modal handles the networking infrastructure but not the communication protocol.</p> <!> <p>This cluster configurations is nice for testing, but typically
you’ll want to run a cluster with the maximum number of GPUs per container —
8 if you’re running on H100s, the beefiest GPUs we offer on Modal.</p> <!> <p>Our Modal Function is merely a ‘launcher’ that sets up the distributed
cluster environment and then calls <code>torch.distributed.run</code>,
the underlying Python code exposed by the <!> command line tool.</p> <p>So executing this distributed job is easy! Just run</p> <!> <p>in your terminal.</p> <p>In addition to the values set in code above, you can pass additional arguments to <code>torch.distributed.run</code> via the command line:</p> <!> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`simple-pytorch-cluster`,children:(e,t)=>{l(),i(e,r(`Simple PyTorch cluster`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`basic-setup-imports-dependencies-and-a-script`,children:(e,t)=>{l(),i(e,r(`Basic setup: Imports, dependencies, and a script`))},$$slots:{default:!0}});var g=c(h,4);f(g,{code:`import%20os%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0Aimport%20modal.experimental%0A`,lang:`python`});var _=c(g,2);m(c(e(_),3),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);f(v,{code:`image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22torch~%3D2.5.1%22%2C%20%22numpy~%3D2.2.1%22%0A)%0A`,lang:`python`});var x=c(v,2),S=c(e(x));m(S,{href:`https://modal.com/docs/reference/modal.Function`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),m(c(S,2),{href:`https://github.com/modal-labs/modal-examples/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`our examples repo`))},$$slots:{default:!0}}),l(3),n(x);var C=c(x,2);f(C,{code:`this_directory%20%3D%20Path(__file__).parent%0A%0Aimage%20%3D%20image.add_local_file(%0A%20%20%20%20this_directory%20%2F%20%22simple_torch_cluster_script.py%22%2C%0A%20%20%20%20remote_path%3D%22%2Froot%2Fscript.py%22%2C%0A)%0A%0Aapp%20%3D%20modal.App(%22example-simple-torch-cluster%22%2C%20image%3Dimage)%0A`,lang:`python`});var w=c(C,2);u(w,{id:`configuring-a-test-cluster`,children:(e,t)=>{l(),i(e,r(`Configuring a test cluster`))},$$slots:{default:!0}});var T=c(w,4);f(T,{code:`n_nodes%20%3D%202%0A`,lang:`python`});var E=c(T,4);f(E,{code:`n_proc_per_node%20%3D%20N_GPU%20%3D%204%0AGPU_CONFIG%20%3D%20f%22A10G%3A%7BN_GPU%7D%22%0A`,lang:`python`});var D=c(E,2);m(c(e(D)),{href:`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`NVIDIA Collective Communications Library`))},$$slots:{default:!0}}),l(3),n(D);var O=c(D,4);f(O,{code:`backend%20%3D%20%22nccl%22%20%20%23%20or%20%22gloo%22%20on%20CPU%2C%20see%20https%3A%2F%2Fpytorch.org%2Fdocs%2Fstable%2Fdistributed.html%23which-backend-to-use%0A`,lang:`python`});var k=c(O,4);u(k,{id:`launching-the-script`,children:(e,t)=>{l(),i(e,r(`Launching the script`))},$$slots:{default:!0}});var A=c(k,2);m(c(e(A),3),{href:`https://pytorch.org/docs/stable/elastic/run.html`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(A);var j=c(A,4);f(j,{code:`modal%20run%20simple_torch_cluster.py`,lang:`bash`});var M=c(j,6);f(M,{code:`modal%20run%20simple_torch_cluster.py%20--max-restarts%3D1`,lang:`bash`}),f(c(M,2),{code:`%40app.function(gpu%3DGPU_CONFIG)%0A%40modal.experimental.clustered(size%3Dn_nodes)%0Adef%20dist_run_script(*args)%3A%0A%20%20%20%20from%20torch.distributed.run%20import%20parse_args%2C%20run%0A%0A%20%20%20%20cluster_info%20%3D%20(%20%20%23%20we%20populate%20this%20data%20for%20you%0A%20%20%20%20%20%20%20%20modal.experimental.get_cluster_info()%0A%20%20%20%20)%0A%20%20%20%20%23%20which%20container%20am%20I%3F%0A%20%20%20%20container_rank%20%3D%20cluster_info.rank%0A%20%20%20%20%23%20how%20many%20containers%20are%20in%20this%20cluster%3F%0A%20%20%20%20world_size%20%3D%20len(cluster_info.container_ips)%0A%20%20%20%20%23%20what's%20the%20leader%2Fmaster%2Fmain%20container's%20address%3F%0A%20%20%20%20main_addr%20%3D%20cluster_info.container_ips%5B0%5D%0A%20%20%20%20%23%20what's%20the%20identifier%20of%20this%20cluster%20task%20in%20Modal%3F%0A%20%20%20%20task_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%20%20%20%20print(f%22hello%20from%20%7Bcontainer_rank%3D%7D%22)%0A%20%20%20%20if%20container_rank%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22reporting%20cluster%20state%20from%20rank0%2Fmain%3A%20%7Bmain_addr%3D%7D%2C%20%7Bworld_size%3D%7D%2C%20%7Btask_id%3D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20run(%0A%20%20%20%20%20%20%20%20parse_args(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--nnodes%3D%7Bn_nodes%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--node_rank%3D%7Bcluster_info.rank%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--master_addr%3D%7Bmain_addr%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--nproc-per-node%3D%7Bn_proc_per_node%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--master_port%3D1234%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20list(args)%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20%5B%22%2Froot%2Fscript.py%22%2C%20%22--backend%22%2C%20backend%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=8ALPQOlv2.js.map
