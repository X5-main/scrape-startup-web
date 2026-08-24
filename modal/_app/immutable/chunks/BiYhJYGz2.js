(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8bbe3481-e628-42d4-a836-066594227db3`,e._sentryDebugIdIdentifier=`sentry-dbid-8bbe3481-e628-42d4-a836-066594227db3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`\`\`\`python
import argparse
import os
from contextlib import contextmanager

import torch
import torch.distributed as dist

\`\`\`

Environment variables set by torch.distributed.run.

\`\`\`python
LOCAL_RANK = int(os.environ["LOCAL_RANK"])
WORLD_SIZE = int(os.environ["WORLD_SIZE"])
WORLD_RANK = int(os.environ["RANK"])
\`\`\`

The master (or leader) rank is always 0 with torch.distributed.run.

\`\`\`python
MASTER_RANK = 0

\`\`\`

This \`run\` function performs a simple distributed data transfer between containers
using the specified distributed communication backend.

An example topology of the cluster when WORLD_SIZE=4 is shown below:

       +---------+
       | Master  |
       | Rank 0  |
       +----+----+
            |
            |
   +--------+--------+
   |        |        |
   |        |        |
+--+--+  +--+--+  +--+--+
|Rank 1| |Rank 2| |Rank 3|
+-----+  +-----+  +-----+

A broadcast operation (https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html#broadcast)
is performed between the master container (rank 0) and all other containers.

The master container (rank 0) sends a tensor to all other containers.
Each container then receives that tensor from the master container.

\`\`\`python
def run(backend):
    # Helper function providing a vanity name for each container based on its world (i.e. global) rank.
    def container_name(wrld_rank: int) -> str:
        return (
            f"container-{wrld_rank} (main)"
            if wrld_rank == 0
            else f"container-{wrld_rank}"
        )

    tensor = torch.zeros(1)

    # Need to put tensor on a GPU device for NCCL backend.
    if backend == "nccl":
        device = torch.device("cuda:{}".format(LOCAL_RANK))
        tensor = tensor.to(device)

    if WORLD_RANK == MASTER_RANK:
        print(f"{container_name(WORLD_RANK)} sending data to all other containers...\\n")
        for rank_recv in range(1, WORLD_SIZE):
            dist.send(tensor=tensor, dst=rank_recv)
            print(
                f"{container_name(WORLD_RANK)} sent data to {container_name(rank_recv)}\\n"
            )
    else:
        dist.recv(tensor=tensor, src=MASTER_RANK)
        print(
            f"{container_name(WORLD_RANK)} has received data from {container_name(MASTER_RANK)}\\n"
        )


\`\`\`

In order for the broadcast operation to happen across the cluster, we need to have the master container (rank 0)
learn the network addresses of all other containers.

This is done by calling \`dist.init_process_group\` with the specified backend.

See https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group for more details.

\`\`\`python
@contextmanager
def init_processes(backend):
    try:
        dist.init_process_group(backend, rank=WORLD_RANK, world_size=WORLD_SIZE)
        yield
    finally:
        dist.barrier()  # ensure any async work is done before cleaning up
        # Remove this if it causes program to hang. ref: https://github.com/pytorch/pytorch/issues/75097.
        dist.destroy_process_group()


if __name__ == "__main__":
    # This is a minimal CLI interface adhering to the requirements of torch.distributed.run (torchrun).
    #
    # Our Modal Function will use torch.distributed.run to launch this script.
    #
    # See https://pytorch.org/docs/stable/elastic/run.html for more details on the CLI interface.
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--local-rank",
        "--local_rank",
        type=int,
        help="Local rank. Necessary for using the torch.distributed.launch utility.",
    )
    parser.add_argument("--backend", type=str, default="gloo", choices=["nccl", "gloo"])
    args = parser.parse_args()

    with init_processes(backend=args.backend):
        run(backend=args.backend)

\`\`\`
`,meta:{description:`Environment variables set by torch.distributed.run.`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<!> <p>Environment variables set by torch.distributed.run.</p> <!> <p>The master (or leader) rank is always 0 with torch.distributed.run.</p> <!> <p>This <code>run</code> function performs a simple distributed data transfer between containers
using the specified distributed communication backend.</p> <p>An example topology of the cluster when WORLD_SIZE=4 is shown below:</p> <p>+---------+
| Master  |
| Rank 0  |
+----+----+
|
|
+--------+--------+
|        |        |
|        |        |
+—+—+  +—+—+  +—+—+
|Rank 1| |Rank 2| |Rank 3|
+-----+  +-----+  +-----+</p> <p>A broadcast operation (<!>)
is performed between the master container (rank 0) and all other containers.</p> <p>The master container (rank 0) sends a tensor to all other containers.
Each container then receives that tensor from the master container.</p> <!> <p>In order for the broadcast operation to happen across the cluster, we need to have the master container (rank 0)
learn the network addresses of all other containers.</p> <p>This is done by calling <code>dist.init_process_group</code> with the specified backend.</p> <p>See <!> for more details.</p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);u(d,{code:`import%20argparse%0Aimport%20os%0Afrom%20contextlib%20import%20contextmanager%0A%0Aimport%20torch%0Aimport%20torch.distributed%20as%20dist%0A`,lang:`python`});var p=c(d,4);u(p,{code:`LOCAL_RANK%20%3D%20int(os.environ%5B%22LOCAL_RANK%22%5D)%0AWORLD_SIZE%20%3D%20int(os.environ%5B%22WORLD_SIZE%22%5D)%0AWORLD_RANK%20%3D%20int(os.environ%5B%22RANK%22%5D)`,lang:`python`});var m=c(p,4);u(m,{code:`MASTER_RANK%20%3D%200%0A`,lang:`python`});var h=c(m,8);f(c(e(h)),{href:`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html#broadcast`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html#broadcast`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);u(g,{code:`def%20run(backend)%3A%0A%20%20%20%20%23%20Helper%20function%20providing%20a%20vanity%20name%20for%20each%20container%20based%20on%20its%20world%20(i.e.%20global)%20rank.%0A%20%20%20%20def%20container_name(wrld_rank%3A%20int)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22container-%7Bwrld_rank%7D%20(main)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20wrld_rank%20%3D%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20f%22container-%7Bwrld_rank%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20tensor%20%3D%20torch.zeros(1)%0A%0A%20%20%20%20%23%20Need%20to%20put%20tensor%20on%20a%20GPU%20device%20for%20NCCL%20backend.%0A%20%20%20%20if%20backend%20%3D%3D%20%22nccl%22%3A%0A%20%20%20%20%20%20%20%20device%20%3D%20torch.device(%22cuda%3A%7B%7D%22.format(LOCAL_RANK))%0A%20%20%20%20%20%20%20%20tensor%20%3D%20tensor.to(device)%0A%0A%20%20%20%20if%20WORLD_RANK%20%3D%3D%20MASTER_RANK%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bcontainer_name(WORLD_RANK)%7D%20sending%20data%20to%20all%20other%20containers...%5Cn%22)%0A%20%20%20%20%20%20%20%20for%20rank_recv%20in%20range(1%2C%20WORLD_SIZE)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20dist.send(tensor%3Dtensor%2C%20dst%3Drank_recv)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bcontainer_name(WORLD_RANK)%7D%20sent%20data%20to%20%7Bcontainer_name(rank_recv)%7D%5Cn%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20dist.recv(tensor%3Dtensor%2C%20src%3DMASTER_RANK)%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bcontainer_name(WORLD_RANK)%7D%20has%20received%20data%20from%20%7Bcontainer_name(MASTER_RANK)%7D%5Cn%22%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var v=c(g,6);f(c(e(v)),{href:`https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group`))},$$slots:{default:!0}}),l(),n(v),u(c(v,2),{code:`%40contextmanager%0Adef%20init_processes(backend)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20dist.init_process_group(backend%2C%20rank%3DWORLD_RANK%2C%20world_size%3DWORLD_SIZE)%0A%20%20%20%20%20%20%20%20yield%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20dist.barrier()%20%20%23%20ensure%20any%20async%20work%20is%20done%20before%20cleaning%20up%0A%20%20%20%20%20%20%20%20%23%20Remove%20this%20if%20it%20causes%20program%20to%20hang.%20ref%3A%20https%3A%2F%2Fgithub.com%2Fpytorch%2Fpytorch%2Fissues%2F75097.%0A%20%20%20%20%20%20%20%20dist.destroy_process_group()%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20%23%20This%20is%20a%20minimal%20CLI%20interface%20adhering%20to%20the%20requirements%20of%20torch.distributed.run%20(torchrun).%0A%20%20%20%20%23%0A%20%20%20%20%23%20Our%20Modal%20Function%20will%20use%20torch.distributed.run%20to%20launch%20this%20script.%0A%20%20%20%20%23%0A%20%20%20%20%23%20See%20https%3A%2F%2Fpytorch.org%2Fdocs%2Fstable%2Felastic%2Frun.html%20for%20more%20details%20on%20the%20CLI%20interface.%0A%20%20%20%20parser%20%3D%20argparse.ArgumentParser()%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--local-rank%22%2C%0A%20%20%20%20%20%20%20%20%22--local_rank%22%2C%0A%20%20%20%20%20%20%20%20type%3Dint%2C%0A%20%20%20%20%20%20%20%20help%3D%22Local%20rank.%20Necessary%20for%20using%20the%20torch.distributed.launch%20utility.%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%22--backend%22%2C%20type%3Dstr%2C%20default%3D%22gloo%22%2C%20choices%3D%5B%22nccl%22%2C%20%22gloo%22%5D)%0A%20%20%20%20args%20%3D%20parser.parse_args()%0A%0A%20%20%20%20with%20init_processes(backend%3Dargs.backend)%3A%0A%20%20%20%20%20%20%20%20run(backend%3Dargs.backend)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=BiYhJYGz2.js.map
