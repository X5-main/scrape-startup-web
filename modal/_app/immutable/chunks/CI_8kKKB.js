(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`283afcd6-c08b-4b73-b007-6055f195d758`,e._sentryDebugIdIdentifier=`sentry-dbid-283afcd6-c08b-4b73-b007-6055f195d758`)}catch{}})();import{$t as e,Ft as t,St as n,Tn as r,Tt as i,bt as a,c as o,cn as s,d as c,en as l,ht as u,j as d,l as f,nn as p,on as m,qt as h,st as g,tn as _,vt as v,wn as y,xt as b}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as x}from"./BTa_KKyy2.js";import{t as S}from"./DYSGKh1I.js";import{a as C,o as w}from"./CPby7b1n.js";import{t as T}from"./BILrvr3I.js";import{t as E}from"./B4L_if842.js";import{t as D}from"./DeWGVqas2.js";var O=n(`<details class="collapsible not-prose my-6 svelte-1n51ite"><summary class="collapsible-summary svelte-1n51ite"><!> <span> </span></summary> <div class="collapsible-body svelte-1n51ite"><!></div></details>`);function k(n,i){let o=s(p(f(i,`open`,3,!1)()));var c=O(),y=e(c),S=e(y);x(S,{size:16,class:`chevron text-c-gray-60`});var C=_(S,2),w=e(C,!0);r(C),r(y);var T=_(y,2),E=e(T),D=e=>{var t=b();g(l(t),()=>i.children),a(e,t)};u(E,e=>{i.children&&e(D)}),r(T),r(c),h(()=>v(w,i.title)),d(`open`,`toggle`,c,e=>m(o,e),()=>t(o)),a(n,c)}var A={description:`Run Modal Sandboxes on a full VM with a real Linux kernel`,toc:[{depth:1,value:`VM Sandboxes`,id:`vm-sandboxes`,children:[{depth:2,value:`Improvements over gVisor sandboxes`,id:`improvements-over-gvisor-sandboxes`},{depth:2,value:`Resource model`,id:`resource-model`},{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# VM Sandboxes

<Callout variant="beta" />

Sandboxes can be run on top of a full virtual machine rather than on top of gVisor. This gives
each Sandbox a real Linux kernel, which makes certain workloads (e.g. Docker systems) behave
the way they would on a normal Linux host.

You can use the VM runtime for your Sandbox by passing \`experimental_options={"vm_runtime": True}\`
to \`Sandbox.create()\`.

<Collapsible title="VM demo">

\`\`\`python fixture:sb_app
with modal.enable_output():
    sb = modal.Sandbox.create(
        app=sb_app,
        cpu=2,  # physical cores
        memory=4096,  # MiB
        experimental_options={"vm_runtime": True},
    )

# add a script that uses VM Sandbox features
sb.filesystem.write_text(
    """
  # Format an ext4 filesystem onto a regular file.
  truncate -s 100M /tmp/disk.img
  mkfs.ext4 -F /tmp/disk.img

  # Mount it. This works in a VM, but isn't supported in gVisor.
  mkdir -p /mnt/loop
  mount -o loop /tmp/disk.img /mnt/loop
""",
    "/tmp/mount_loopback_filesystem.sh",
)

p = sb.exec("bash", "/tmp/mount_loopback_filesystem.sh")
p.wait()

print(p.stdout.read())

print(p.stderr.read())

assert p.returncode == 0  # error if the program in the Sandbox fails

sb.terminate()
\`\`\`

</Collapsible>

VM Sandboxes are also the recommended method to run Docker in Sandboxes. To try this out,
copy the following program to e.g. \`docker_in_modal_demo.py\`, and run it with
\`python docker_in_modal_demo.py\`.

<Collapsible title="Docker-in-Sandbox demo">

<!-- Keep the code block below in sync with synthetic_monitoring/benchmarks/docker_in_modal.py.
The "marker" comments below are used to diff this code with that in the synmon. Don't change them. -->
<!-- synmon-sync:docker_in_modal:begin -->

\`\`\`python
import modal

# Create an image for the parent Modal Sandbox, with Docker installed.
def create_modal_sandbox_image():
    image = (
        modal.Image.from_registry("ubuntu:24.04")
        .env({"DEBIAN_FRONTEND": "noninteractive"})
        .apt_install(["docker.io", "docker-buildx"])
        .run_commands("mkdir /build")
    )
    return image


def main():
    print("Looking up modal.Sandbox app")
    app = modal.App.lookup("docker-test", create_if_missing=True)
    print("Creating sandbox")

    with modal.enable_output():
        sb = modal.Sandbox.create(
            "/usr/bin/dockerd",
            "-D",
            timeout=60 * 60,
            app=app,
            image=create_modal_sandbox_image(),
            experimental_options={"vm_runtime": True},
        )

    print(f"sandbox_id: {sb.object_id}")
    task_id = sb._get_task_id()
    print(f"task_id: {task_id}")
    print(f"To shell into the task, run: modal shell {task_id}")
    # dockerd is the sandbox entrypoint and takes a moment to bind
    # /var/run/docker.sock after the sandbox is created. Poll until the
    # daemon answers so the first \`docker build\` doesn't run before dockerd is ready.
    print("Waiting for dockerd to be ready")
    wait_p = sb.exec(
        "sh",
        "-c",
        "for i in $(seq 1 120); do "
        "if [ -S /var/run/docker.sock ] && docker info >/dev/null 2>&1; then "
        "echo ready; exit 0; fi; sleep 1; done; "
        "echo 'dockerd not ready after 120s' >&2; exit 1",
    )
    wait_p.wait()
    if wait_p.returncode != 0:
        raise Exception(f"dockerd never became ready: {wait_p.stderr.read()}")

    # A simple Dockerfile that we'll build and run within Modal.
    dockerfile = """
    FROM ubuntu
    RUN apt-get update
    RUN apt-get install -y cowsay curl
    RUN mkdir -p /usr/share/cowsay/cows/
    RUN curl -o /usr/share/cowsay/cows/docker.cow https://raw.githubusercontent.com/docker/whalesay/master/docker.cow
    ENTRYPOINT ["/usr/games/cowsay", "-f", "docker.cow"]
    """
    sb.filesystem.write_text(dockerfile, "/build/Dockerfile")

    print("Building docker image")
    p = sb.exec("docker", "build", "-t", "whalesay", "/build")
    for l in p.stdout:
        print(l, end="")
    p.wait()
    print("--------------------------------")
    if p.returncode != 0:
        print(p.stderr.read())
        raise Exception("Docker build failed")

    # The Sandbox will run a container from the built image and print this:
    #
    #  ________
    # < Hello! >
    #  --------
    #     \\
    #      \\
    #       \\
    #                     ##         .
    #               ## ## ##        ==
    #            ## ## ## ## ##    ===
    #        /"""""""""""""""""\\___/ ===
    #       {                       /  ===-
    #        \\______ O           __/
    #          \\    \\         __/
    #           \\____\\_______/

    print("Running Docker image")
    # Note we can't use -it here because we're not in a TTY.
    p = sb.exec("docker", "run", "--rm", "whalesay", "Hello!")
    print(p.stdout.read())
    p.wait()
    if p.returncode != 0:
        raise Exception(f"Docker run failed: {p.stderr.read()}")
    sb.terminate()

if __name__ == "__main__":
    main()
\`\`\`

<!-- synmon-sync:docker_in_modal:end -->

</Collapsible>

Additionally, quickly provision a VM Sandbox with a PTY shell via the CLI using:

\`\`\`
modal shell --experimental-option vm_runtime=1
\`\`\`

## Improvements over gVisor sandboxes

Docker workloads behave more like they do in a non-container environment. In particular:

- Docker state (e.g. \`/var/lib/docker\`) is included in [Filesystem Snapshots](/docs/guide/sandbox-snapshots#filesystem-snapshots)
- Docker features that previously needed special treatment on gVisor (e.g. inter-container networking) will also work normally

Features that only make sense in a bona fide Linux environment are now available:

- Custom [init systems](https://arxiv.org/pdf/0706.2748) (such as [\`systemd\`](https://man7.org/linux/man-pages/man1/systemd.1.html)) are supported
- [eBPF](https://ebpf.io/) is supported
- [FUSE](https://www.kernel.org/doc/html/latest/filesystems/fuse.html) mounts are supported
- Resource isolation within the Sandbox via [cgroups](https://man7.org/linux/man-pages/man7/cgroups.7.html) is supported

Finally, for most workloads, the root filesystem will perform better on a VM Sandbox than in a gVisor Sandbox.

## Resource model

Unlike [resource provisioning](/docs/guide/resources) in other runtimes,
memory provisioning is **static** for VM Sandboxes: you get exactly as much
RAM as you request via \`memory\` argument to \`Sandbox.create\`. By default, VM
sandboxes get 1GiB of RAM.

However, CPU provisioning is elastic. You can burst above your requested amount.

Costs for both resources are calculated based on the requested amount, used amount,
the duration of Sandbox execution, and [our rates for \`cpu\` and \`memory\`](/pricing).

## Limitations

The following limitations are known and we're tracking them:

- **GPUs are not supported.** VM Sandboxes currently only support CPU workloads.
- **The [Sandbox filesystem API](/docs/guide/sandbox-files#filesystem-api-beta) is only available in new SDK versions**. For the Python SDK, it requires version ≥ 1.4.0 and for the JS/TS/Go SDKs, it requires versions ≥ 0.7.6.
- **[\`Sandbox.reload_volumes()\`](/docs/sdk/py/latest/Sandbox#reload_volumes) is not supported.** VM Sandboxes do not currently support reloading volumes at runtime.
- **[VM Memory Snapshots](/docs/guide/vm-memory-snapshots) are only available to a set of enabled customers.**
  Please reach out to us if you'd like early access.
- **Root images ≥ 512 GiB are not supported.** The VM root filesystem is currently limited to 512 GiB. Sandboxes created from container images exceeding this size will fail to start.

If you hit a rough edge that isn't listed here, please reach out via [Slack](/slack) or email us at [support@modal.com](mailto:support@modal.com).
`,meta:{title:`VM Sandboxes`,description:`Run Modal Sandboxes on a full VM with a real Linux kernel`}},{description:j,toc:M,rawContent:N,meta:P}=A,F=n(`<code>systemd</code>`),I=n(`our rates for <code>cpu</code> and <code>memory</code>`,1),L=n(`<code>Sandbox.reload_volumes()</code>`),R=n(`<!> <!> <p>Sandboxes can be run on top of a full virtual machine rather than on top of gVisor. This gives
each Sandbox a real Linux kernel, which makes certain workloads (e.g. Docker systems) behave
the way they would on a normal Linux host.</p> <p>You can use the VM runtime for your Sandbox by passing <code>experimental_options=&#123;"vm_runtime": True&#125;</code> to <code>Sandbox.create()</code>.</p> <!> <p>VM Sandboxes are also the recommended method to run Docker in Sandboxes. To try this out,
copy the following program to e.g. <code>docker_in_modal_demo.py</code>, and run it with <code>python docker_in_modal_demo.py</code>.</p> <!> <p>Additionally, quickly provision a VM Sandbox with a PTY shell via the CLI using:</p> <!> <!> <p>Docker workloads behave more like they do in a non-container environment. In particular:</p> <ul><li>Docker state (e.g. <code>/var/lib/docker</code>) is included in <!></li> <li>Docker features that previously needed special treatment on gVisor (e.g. inter-container networking) will also work normally</li></ul> <p>Features that only make sense in a bona fide Linux environment are now available:</p> <ul><li>Custom <!> (such as <!>) are supported</li> <li><!> is supported</li> <li><!> mounts are supported</li> <li>Resource isolation within the Sandbox via <!> is supported</li></ul> <p>Finally, for most workloads, the root filesystem will perform better on a VM Sandbox than in a gVisor Sandbox.</p> <!> <p>Unlike <!> in other runtimes,
memory provisioning is <strong>static</strong> for VM Sandboxes: you get exactly as much
RAM as you request via <code>memory</code> argument to <code>Sandbox.create</code>. By default, VM
sandboxes get 1GiB of RAM.</p> <p>However, CPU provisioning is elastic. You can burst above your requested amount.</p> <p>Costs for both resources are calculated based on the requested amount, used amount,
the duration of Sandbox execution, and <!>.</p> <!> <p>The following limitations are known and we’re tracking them:</p> <ul><li><strong>GPUs are not supported.</strong> VM Sandboxes currently only support CPU workloads.</li> <li><strong>The <!> is only available in new SDK versions</strong>. For the Python SDK, it requires version ≥ 1.4.0 and for the JS/TS/Go SDKs, it requires versions ≥ 0.7.6.</li> <li><strong><!> is not supported.</strong> VM Sandboxes do not currently support reloading volumes at runtime.</li> <li><strong><!> are only available to a set of enabled customers.</strong> Please reach out to us if you’d like early access.</li> <li><strong>Root images ≥ 512 GiB are not supported.</strong> The VM root filesystem is currently limited to 512 GiB. Sandboxes created from container images exceeding this size will fail to start.</li></ul> <p>If you hit a rough edge that isn’t listed here, please reach out via <!> or email us at <!>.</p>`,1);function z(t,n){let s=o(n,[`children`,`$$slots`,`$$events`,`$$legacy`]);E(t,c(()=>s,()=>A,{children:(t,n)=>{var o=R(),s=l(o);w(s,{id:`vm-sandboxes`,children:(e,t)=>{y(),a(e,i(`VM Sandboxes`))},$$slots:{default:!0}});var c=_(s,2);S(c,{variant:`beta`});var u=_(c,6);k(u,{title:`VM demo`,children:(e,t)=>{T(e,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20app%3Dsb_app%2C%0A%20%20%20%20%20%20%20%20cpu%3D2%2C%20%20%23%20physical%20cores%0A%20%20%20%20%20%20%20%20memory%3D4096%2C%20%20%23%20MiB%0A%20%20%20%20%20%20%20%20experimental_options%3D%7B%22vm_runtime%22%3A%20True%7D%2C%0A%20%20%20%20)%0A%0A%23%20add%20a%20script%20that%20uses%20VM%20Sandbox%20features%0Asb.filesystem.write_text(%0A%20%20%20%20%22%22%22%0A%20%20%23%20Format%20an%20ext4%20filesystem%20onto%20a%20regular%20file.%0A%20%20truncate%20-s%20100M%20%2Ftmp%2Fdisk.img%0A%20%20mkfs.ext4%20-F%20%2Ftmp%2Fdisk.img%0A%0A%20%20%23%20Mount%20it.%20This%20works%20in%20a%20VM%2C%20but%20isn't%20supported%20in%20gVisor.%0A%20%20mkdir%20-p%20%2Fmnt%2Floop%0A%20%20mount%20-o%20loop%20%2Ftmp%2Fdisk.img%20%2Fmnt%2Floop%0A%22%22%22%2C%0A%20%20%20%20%22%2Ftmp%2Fmount_loopback_filesystem.sh%22%2C%0A)%0A%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22%2Ftmp%2Fmount_loopback_filesystem.sh%22)%0Ap.wait()%0A%0Aprint(p.stdout.read())%0A%0Aprint(p.stderr.read())%0A%0Aassert%20p.returncode%20%3D%3D%200%20%20%23%20error%20if%20the%20program%20in%20the%20Sandbox%20fails%0A%0Asb.terminate()`,lang:`python`})},$$slots:{default:!0}});var d=_(u,4);k(d,{title:`Docker-in-Sandbox demo`,children:(e,t)=>{T(e,{code:`import%20modal%0A%0A%23%20Create%20an%20image%20for%20the%20parent%20Modal%20Sandbox%2C%20with%20Docker%20installed.%0Adef%20create_modal_sandbox_image()%3A%0A%20%20%20%20image%20%3D%20(%0A%20%20%20%20%20%20%20%20modal.Image.from_registry(%22ubuntu%3A24.04%22)%0A%20%20%20%20%20%20%20%20.env(%7B%22DEBIAN_FRONTEND%22%3A%20%22noninteractive%22%7D)%0A%20%20%20%20%20%20%20%20.apt_install(%5B%22docker.io%22%2C%20%22docker-buildx%22%5D)%0A%20%20%20%20%20%20%20%20.run_commands(%22mkdir%20%2Fbuild%22)%0A%20%20%20%20)%0A%20%20%20%20return%20image%0A%0A%0Adef%20main()%3A%0A%20%20%20%20print(%22Looking%20up%20modal.Sandbox%20app%22)%0A%20%20%20%20app%20%3D%20modal.App.lookup(%22docker-test%22%2C%20create_if_missing%3DTrue)%0A%20%20%20%20print(%22Creating%20sandbox%22)%0A%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%2Fusr%2Fbin%2Fdockerd%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D60%20*%2060%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dcreate_modal_sandbox_image()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20experimental_options%3D%7B%22vm_runtime%22%3A%20True%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20print(f%22sandbox_id%3A%20%7Bsb.object_id%7D%22)%0A%20%20%20%20task_id%20%3D%20sb._get_task_id()%0A%20%20%20%20print(f%22task_id%3A%20%7Btask_id%7D%22)%0A%20%20%20%20print(f%22To%20shell%20into%20the%20task%2C%20run%3A%20modal%20shell%20%7Btask_id%7D%22)%0A%20%20%20%20%23%20dockerd%20is%20the%20sandbox%20entrypoint%20and%20takes%20a%20moment%20to%20bind%0A%20%20%20%20%23%20%2Fvar%2Frun%2Fdocker.sock%20after%20the%20sandbox%20is%20created.%20Poll%20until%20the%0A%20%20%20%20%23%20daemon%20answers%20so%20the%20first%20%60docker%20build%60%20doesn't%20run%20before%20dockerd%20is%20ready.%0A%20%20%20%20print(%22Waiting%20for%20dockerd%20to%20be%20ready%22)%0A%20%20%20%20wait_p%20%3D%20sb.exec(%0A%20%20%20%20%20%20%20%20%22sh%22%2C%0A%20%20%20%20%20%20%20%20%22-c%22%2C%0A%20%20%20%20%20%20%20%20%22for%20i%20in%20%24(seq%201%20120)%3B%20do%20%22%0A%20%20%20%20%20%20%20%20%22if%20%5B%20-S%20%2Fvar%2Frun%2Fdocker.sock%20%5D%20%26%26%20docker%20info%20%3E%2Fdev%2Fnull%202%3E%261%3B%20then%20%22%0A%20%20%20%20%20%20%20%20%22echo%20ready%3B%20exit%200%3B%20fi%3B%20sleep%201%3B%20done%3B%20%22%0A%20%20%20%20%20%20%20%20%22echo%20'dockerd%20not%20ready%20after%20120s'%20%3E%262%3B%20exit%201%22%2C%0A%20%20%20%20)%0A%20%20%20%20wait_p.wait()%0A%20%20%20%20if%20wait_p.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(f%22dockerd%20never%20became%20ready%3A%20%7Bwait_p.stderr.read()%7D%22)%0A%0A%20%20%20%20%23%20A%20simple%20Dockerfile%20that%20we'll%20build%20and%20run%20within%20Modal.%0A%20%20%20%20dockerfile%20%3D%20%22%22%22%0A%20%20%20%20FROM%20ubuntu%0A%20%20%20%20RUN%20apt-get%20update%0A%20%20%20%20RUN%20apt-get%20install%20-y%20cowsay%20curl%0A%20%20%20%20RUN%20mkdir%20-p%20%2Fusr%2Fshare%2Fcowsay%2Fcows%2F%0A%20%20%20%20RUN%20curl%20-o%20%2Fusr%2Fshare%2Fcowsay%2Fcows%2Fdocker.cow%20https%3A%2F%2Fraw.githubusercontent.com%2Fdocker%2Fwhalesay%2Fmaster%2Fdocker.cow%0A%20%20%20%20ENTRYPOINT%20%5B%22%2Fusr%2Fgames%2Fcowsay%22%2C%20%22-f%22%2C%20%22docker.cow%22%5D%0A%20%20%20%20%22%22%22%0A%20%20%20%20sb.filesystem.write_text(dockerfile%2C%20%22%2Fbuild%2FDockerfile%22)%0A%0A%20%20%20%20print(%22Building%20docker%20image%22)%0A%20%20%20%20p%20%3D%20sb.exec(%22docker%22%2C%20%22build%22%2C%20%22-t%22%2C%20%22whalesay%22%2C%20%22%2Fbuild%22)%0A%20%20%20%20for%20l%20in%20p.stdout%3A%0A%20%20%20%20%20%20%20%20print(l%2C%20end%3D%22%22)%0A%20%20%20%20p.wait()%0A%20%20%20%20print(%22--------------------------------%22)%0A%20%20%20%20if%20p.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20print(p.stderr.read())%0A%20%20%20%20%20%20%20%20raise%20Exception(%22Docker%20build%20failed%22)%0A%0A%20%20%20%20%23%20The%20Sandbox%20will%20run%20a%20container%20from%20the%20built%20image%20and%20print%20this%3A%0A%20%20%20%20%23%0A%20%20%20%20%23%20%20________%0A%20%20%20%20%23%20%3C%20Hello!%20%3E%0A%20%20%20%20%23%20%20--------%0A%20%20%20%20%23%20%20%20%20%20%5C%0A%20%20%20%20%23%20%20%20%20%20%20%5C%0A%20%20%20%20%23%20%20%20%20%20%20%20%5C%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%23%20%20%20%20%20%20%20%20%20.%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%23%20%23%23%20%23%23%20%20%20%20%20%20%20%20%3D%3D%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%20%20%20%20%23%23%20%23%23%20%23%23%20%23%23%20%23%23%20%20%20%20%3D%3D%3D%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%2F%22%22%22%22%22%22%22%22%22%22%22%22%22%22%22%22%22%5C___%2F%20%3D%3D%3D%0A%20%20%20%20%23%20%20%20%20%20%20%20%7B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%20%20%3D%3D%3D-%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%5C______%20O%20%20%20%20%20%20%20%20%20%20%20__%2F%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%20%20%5C%20%20%20%20%5C%20%20%20%20%20%20%20%20%20__%2F%0A%20%20%20%20%23%20%20%20%20%20%20%20%20%20%20%20%5C____%5C_______%2F%0A%0A%20%20%20%20print(%22Running%20Docker%20image%22)%0A%20%20%20%20%23%20Note%20we%20can't%20use%20-it%20here%20because%20we're%20not%20in%20a%20TTY.%0A%20%20%20%20p%20%3D%20sb.exec(%22docker%22%2C%20%22run%22%2C%20%22--rm%22%2C%20%22whalesay%22%2C%20%22Hello!%22)%0A%20%20%20%20print(p.stdout.read())%0A%20%20%20%20p.wait()%0A%20%20%20%20if%20p.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(f%22Docker%20run%20failed%3A%20%7Bp.stderr.read()%7D%22)%0A%20%20%20%20sb.terminate()%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20main()`,lang:`python`})},$$slots:{default:!0}});var f=_(d,4);T(f,{code:`modal%20shell%20--experimental-option%20vm_runtime%3D1`,lang:`text`});var p=_(f,2);C(p,{id:`improvements-over-gvisor-sandboxes`,children:(e,t)=>{y(),a(e,i(`Improvements over gVisor sandboxes`))},$$slots:{default:!0}});var m=_(p,4),h=e(m);D(_(e(h),3),{href:`/docs/guide/sandbox-snapshots#filesystem-snapshots`,children:(e,t)=>{y(),a(e,i(`Filesystem Snapshots`))},$$slots:{default:!0}}),r(h),y(2),r(m);var g=_(m,4),v=e(g),b=_(e(v));D(b,{href:`https://arxiv.org/pdf/0706.2748`,rel:`nofollow`,children:(e,t)=>{y(),a(e,i(`init systems`))},$$slots:{default:!0}}),D(_(b,2),{href:`https://man7.org/linux/man-pages/man1/systemd.1.html`,rel:`nofollow`,children:(e,t)=>{a(e,F())},$$slots:{default:!0}}),y(),r(v);var x=_(v,2);D(e(x),{href:`https://ebpf.io/`,rel:`nofollow`,children:(e,t)=>{y(),a(e,i(`eBPF`))},$$slots:{default:!0}}),y(),r(x);var E=_(x,2);D(e(E),{href:`https://www.kernel.org/doc/html/latest/filesystems/fuse.html`,rel:`nofollow`,children:(e,t)=>{y(),a(e,i(`FUSE`))},$$slots:{default:!0}}),y(),r(E);var O=_(E,2);D(_(e(O)),{href:`https://man7.org/linux/man-pages/man7/cgroups.7.html`,rel:`nofollow`,children:(e,t)=>{y(),a(e,i(`cgroups`))},$$slots:{default:!0}}),y(),r(O),r(g);var A=_(g,4);C(A,{id:`resource-model`,children:(e,t)=>{y(),a(e,i(`Resource model`))},$$slots:{default:!0}});var j=_(A,2);D(_(e(j)),{href:`/docs/guide/resources`,children:(e,t)=>{y(),a(e,i(`resource provisioning`))},$$slots:{default:!0}}),y(7),r(j);var M=_(j,4);D(_(e(M)),{href:`/pricing`,children:(e,t)=>{y();var n=I();y(3),a(e,n)},$$slots:{default:!0}}),y(),r(M);var N=_(M,2);C(N,{id:`limitations`,children:(e,t)=>{y(),a(e,i(`Limitations`))},$$slots:{default:!0}});var P=_(N,4),z=_(e(P),2),B=e(z);D(_(e(B)),{href:`/docs/guide/sandbox-files#filesystem-api-beta`,children:(e,t)=>{y(),a(e,i(`Sandbox filesystem API`))},$$slots:{default:!0}}),y(),r(B),y(),r(z);var V=_(z,2),H=e(V);D(e(H),{href:`/docs/sdk/py/latest/Sandbox#reload_volumes`,children:(e,t)=>{a(e,L())},$$slots:{default:!0}}),y(),r(H),y(),r(V);var U=_(V,2),W=e(U);D(e(W),{href:`/docs/guide/vm-memory-snapshots`,children:(e,t)=>{y(),a(e,i(`VM Memory Snapshots`))},$$slots:{default:!0}}),y(),r(W),y(),r(U),y(2),r(P);var G=_(P,2),K=_(e(G));D(K,{href:`/slack`,children:(e,t)=>{y(),a(e,i(`Slack`))},$$slots:{default:!0}}),D(_(K,2),{href:`mailto:support@modal.com`,children:(e,t)=>{y(),a(e,i(`support@modal.com`))},$$slots:{default:!0}}),y(),r(G),a(t,o)},$$slots:{default:!0}}))}export{z as default,A as metadata};
//# sourceMappingURL=CI_8kKKB.js.map
