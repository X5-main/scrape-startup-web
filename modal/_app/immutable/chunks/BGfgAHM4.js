(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a61f56c5-4e2f-40d5-9b31-65ee3b9084ad`,e._sentryDebugIdIdentifier=`sentry-dbid-a61f56c5-4e2f-40d5-9b31-65ee3b9084ad`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{i as d,o as f,r as p}from"./CPby7b1n.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={description:`Create and restore memory snapshots of VM Sandboxes`,toc:[{depth:1,value:`VM Memory Snapshots`,id:`vm-memory-snapshots`,children:[{depth:3,value:`Examples`,id:`examples`,children:[{depth:4,value:`Pausing an HTTP Server`,id:`pausing-an-http-server`},{depth:4,value:`In-Memory Bazel Cache`,id:`in-memory-bazel-cache`}]},{depth:3,value:`Limitations`,id:`limitations`}]}],rawContent:`# VM Memory Snapshots

<Callout variant="alpha">
</Callout>

Memory snapshots freeze the execution state of a sandbox, including memory and the filesystem, to be restored later. They can be used to fork execution, save warm execution state, and more.

The experimental VM runtime supports memory snapshots when running on the [V2 Sandbox backend](/docs/sdk/py/changelog#154-2026-08-12).

This is only supported for a set of enabled customers. Please reach out if you'd like early access to this feature.

### Examples

#### Pausing an HTTP Server

Sandboxes can be paused by calling \`sb._experimental_snapshot()\`. This will return a handle
that can be used to restore/unpause the sandbox.

This example pauses a running HTTP server. Please note that, while listeners will remain functional,
live TCP streams will be reset after being restored.

\`\`\`python notest
import os

import modal

os.environ["MODAL_SANDBOX_V2"] = "1"

image = modal.Image.debian_slim().apt_install("curl", "procps")
app = modal.App.lookup("sandbox-snapshot", create_if_missing=True)

with modal.enable_output():
    sb = modal.Sandbox.create(
        "python3",
        "-m",
        "http.server",
        "8000",
        experimental_options={"vm_runtime": True},
        app=app,
        image=image,
        _experimental_enable_snapshot=True,
    )

print(f"Performing snapshot of {sb.object_id} ...")
# Pause the sandbox, returning a snapshot of its state.
snapshot = sb._experimental_snapshot()
\`\`\`

Create a new Sandbox from the returned \`SandboxSnapshot\` with \`Sandbox._experimental_from_snapshot\`:

\`\`\`python notest
print(f"Restoring from snapshot {snapshot.object_id} ...")
sb2 = modal.Sandbox._experimental_from_snapshot(snapshot)

print("Let's see that the http.server is still running...")
p = sb2.exec("ps", "aux")
print(p.stdout.read())

# Talk to snapshotted Sandbox http.server
p = sb2.exec("curl", "http://localhost:8000/")
reply = p.stdout.read()
print(reply)  # <!DOCTYPE HTML><html lang...
\`\`\`

#### In-Memory Bazel Cache

This is a more complex example that shows using memory snapshots to keep a warm analysis cache in the Bazel server to speed up builds.

\`\`\`python notest
import os
import time
import modal

os.environ["MODAL_SANDBOX_V2"] = "1"

REPO_URL = "https://github.com/buchgr/bazel-remote.git"
REPO_SHA = "ead20798fed6eb1d4bf40efd08e3653868d34feb"
REPO_DIR = "/root/bazel-remote"

BAZEL_VERSION = "9.2.0"
BAZEL_BUILD = f"cd {REPO_DIR} && USE_BAZEL_VERSION={BAZEL_VERSION} bazel build //:bazel-remote"
BUILD_TIMEOUT = 10 * 60

image = (
    modal.Image.debian_slim()
    .apt_install("git", "curl", "ca-certificates", "build-essential", "python3", "unzip", "zip")
    .run_commands(
        "curl -fsSL https://github.com/bazelbuild/bazelisk/releases/download/v1.22.0"
        "/bazelisk-linux-amd64 -o /usr/local/bin/bazel",
        "chmod +x /usr/local/bin/bazel",
        f"mkdir {REPO_DIR} && cd {REPO_DIR} && git init -q && git fetch --depth 1 {REPO_URL} {REPO_SHA}"
        " && git checkout -q FETCH_HEAD",
        f"USE_BAZEL_VERSION={BAZEL_VERSION} bazel --version",
    )
)


def timed_build(sb: modal.Sandbox, label: str) -> float:
    t0 = time.monotonic()
    p = sb.exec("bash", "-c", BAZEL_BUILD, timeout=BUILD_TIMEOUT)
    out = p.stdout.read() + p.stderr.read()
    p.wait()
    elapsed = time.monotonic() - t0
    assert p.returncode == 0, f"{label} build failed:\\n{out[-4000:]}"
    print(f"{label} build: {elapsed:.1f}s")
    return elapsed


if __name__ == "__main__":
    app = modal.App.lookup("example-memory-snapshot", create_if_missing=True)

    # Snapshotting has to be opted into at creation time.
    sb = modal.Sandbox.create(
        app=app,
        image=image,
        cpu=4.0,
        memory=8 * 1024,
        timeout=20 * 60,
        experimental_options={"vm_runtime": True},
        _experimental_enable_snapshot=True,
    )
    restored = None
    try:
        # The cold build populates the on-disk cache and, more importantly,
        # leaves a Bazel server running with a warm analysis cache in memory.
        cold = timed_build(sb, "cold")

        snapshot = sb._experimental_snapshot()
        print(f"snapshot_id: {snapshot.object_id}")
        sb.terminate()

        # Restore into a fresh Sandbox. The Bazel server comes back as a live
        # process with the same pid and in-memory state so execs come back warm
        t0 = time.monotonic()
        restored = modal.Sandbox._experimental_from_snapshot(snapshot)
        timed_build(restored, "warm")

        restore_and_warm = time.monotonic() - t0
        print(f"restore + warm build: {restore_and_warm:.1f}s")
        print(f"speedup vs cold: {cold / restore_and_warm:.1f}x")
    finally:
        sb.terminate()
        if restored is not None:
            restored.terminate()
\`\`\`

### Limitations

- The same [limitations](/docs/guide/sandbox-snapshots#limitations) as gVisor memory snapshots remain _for now_
- Performance will continue to improve as this feature matures
- Volumes are not supported when \`_experimental_enable_snapshot=True\`
`,meta:{title:`VM Memory Snapshots`,description:`Create and restore memory snapshots of VM Sandboxes`}},{description:v,toc:y,rawContent:b,meta:x}=_,S=t(`<!> <!> <p>Memory snapshots freeze the execution state of a sandbox, including memory and the filesystem, to be restored later. They can be used to fork execution, save warm execution state, and more.</p> <p>The experimental VM runtime supports memory snapshots when running on the <!>.</p> <p>This is only supported for a set of enabled customers. Please reach out if you’d like early access to this feature.</p> <!> <!> <p>Sandboxes can be paused by calling <code>sb._experimental_snapshot()</code>. This will return a handle
that can be used to restore/unpause the sandbox.</p> <p>This example pauses a running HTTP server. Please note that, while listeners will remain functional,
live TCP streams will be reset after being restored.</p> <!> <p>Create a new Sandbox from the returned <code>SandboxSnapshot</code> with <code>Sandbox._experimental_from_snapshot</code>:</p> <!> <!> <p>This is a more complex example that shows using memory snapshots to keep a warm analysis cache in the Bazel server to speed up builds.</p> <!> <!> <ul><li>The same <!> as gVisor memory snapshots remain <em>for now</em></li> <li>Performance will continue to improve as this feature matures</li> <li>Volumes are not supported when <code>_experimental_enable_snapshot=True</code></li></ul>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),h=s(o);f(h,{id:`vm-memory-snapshots`,children:(e,t)=>{l(),i(e,r(`VM Memory Snapshots`))},$$slots:{default:!0}});var _=c(h,2);u(_,{variant:`alpha`});var v=c(_,4);g(c(e(v)),{href:`/docs/sdk/py/changelog#154-2026-08-12`,children:(e,t)=>{l(),i(e,r(`V2 Sandbox backend`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4);d(y,{id:`examples`,children:(e,t)=>{l(),i(e,r(`Examples`))},$$slots:{default:!0}});var b=c(y,2);p(b,{id:`pausing-an-http-server`,children:(e,t)=>{l(),i(e,r(`Pausing an HTTP Server`))},$$slots:{default:!0}});var x=c(b,6);m(x,{code:`import%20os%0A%0Aimport%20modal%0A%0Aos.environ%5B%22MODAL_SANDBOX_V2%22%5D%20%3D%20%221%22%0A%0Aimage%20%3D%20modal.Image.debian_slim().apt_install(%22curl%22%2C%20%22procps%22)%0Aapp%20%3D%20modal.App.lookup(%22sandbox-snapshot%22%2C%20create_if_missing%3DTrue)%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%22python3%22%2C%0A%20%20%20%20%20%20%20%20%22-m%22%2C%0A%20%20%20%20%20%20%20%20%22http.server%22%2C%0A%20%20%20%20%20%20%20%20%228000%22%2C%0A%20%20%20%20%20%20%20%20experimental_options%3D%7B%22vm_runtime%22%3A%20True%7D%2C%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20_experimental_enable_snapshot%3DTrue%2C%0A%20%20%20%20)%0A%0Aprint(f%22Performing%20snapshot%20of%20%7Bsb.object_id%7D%20...%22)%0A%23%20Pause%20the%20sandbox%2C%20returning%20a%20snapshot%20of%20its%20state.%0Asnapshot%20%3D%20sb._experimental_snapshot()`,lang:`python`});var C=c(x,4);m(C,{code:`print(f%22Restoring%20from%20snapshot%20%7Bsnapshot.object_id%7D%20...%22)%0Asb2%20%3D%20modal.Sandbox._experimental_from_snapshot(snapshot)%0A%0Aprint(%22Let's%20see%20that%20the%20http.server%20is%20still%20running...%22)%0Ap%20%3D%20sb2.exec(%22ps%22%2C%20%22aux%22)%0Aprint(p.stdout.read())%0A%0A%23%20Talk%20to%20snapshotted%20Sandbox%20http.server%0Ap%20%3D%20sb2.exec(%22curl%22%2C%20%22http%3A%2F%2Flocalhost%3A8000%2F%22)%0Areply%20%3D%20p.stdout.read()%0Aprint(reply)%20%20%23%20%3C!DOCTYPE%20HTML%3E%3Chtml%20lang...`,lang:`python`});var w=c(C,2);p(w,{id:`in-memory-bazel-cache`,children:(e,t)=>{l(),i(e,r(`In-Memory Bazel Cache`))},$$slots:{default:!0}});var T=c(w,4);m(T,{code:`import%20os%0Aimport%20time%0Aimport%20modal%0A%0Aos.environ%5B%22MODAL_SANDBOX_V2%22%5D%20%3D%20%221%22%0A%0AREPO_URL%20%3D%20%22https%3A%2F%2Fgithub.com%2Fbuchgr%2Fbazel-remote.git%22%0AREPO_SHA%20%3D%20%22ead20798fed6eb1d4bf40efd08e3653868d34feb%22%0AREPO_DIR%20%3D%20%22%2Froot%2Fbazel-remote%22%0A%0ABAZEL_VERSION%20%3D%20%229.2.0%22%0ABAZEL_BUILD%20%3D%20f%22cd%20%7BREPO_DIR%7D%20%26%26%20USE_BAZEL_VERSION%3D%7BBAZEL_VERSION%7D%20bazel%20build%20%2F%2F%3Abazel-remote%22%0ABUILD_TIMEOUT%20%3D%2010%20*%2060%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22git%22%2C%20%22curl%22%2C%20%22ca-certificates%22%2C%20%22build-essential%22%2C%20%22python3%22%2C%20%22unzip%22%2C%20%22zip%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22curl%20-fsSL%20https%3A%2F%2Fgithub.com%2Fbazelbuild%2Fbazelisk%2Freleases%2Fdownload%2Fv1.22.0%22%0A%20%20%20%20%20%20%20%20%22%2Fbazelisk-linux-amd64%20-o%20%2Fusr%2Flocal%2Fbin%2Fbazel%22%2C%0A%20%20%20%20%20%20%20%20%22chmod%20%2Bx%20%2Fusr%2Flocal%2Fbin%2Fbazel%22%2C%0A%20%20%20%20%20%20%20%20f%22mkdir%20%7BREPO_DIR%7D%20%26%26%20cd%20%7BREPO_DIR%7D%20%26%26%20git%20init%20-q%20%26%26%20git%20fetch%20--depth%201%20%7BREPO_URL%7D%20%7BREPO_SHA%7D%22%0A%20%20%20%20%20%20%20%20%22%20%26%26%20git%20checkout%20-q%20FETCH_HEAD%22%2C%0A%20%20%20%20%20%20%20%20f%22USE_BAZEL_VERSION%3D%7BBAZEL_VERSION%7D%20bazel%20--version%22%2C%0A%20%20%20%20)%0A)%0A%0A%0Adef%20timed_build(sb%3A%20modal.Sandbox%2C%20label%3A%20str)%20-%3E%20float%3A%0A%20%20%20%20t0%20%3D%20time.monotonic()%0A%20%20%20%20p%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20BAZEL_BUILD%2C%20timeout%3DBUILD_TIMEOUT)%0A%20%20%20%20out%20%3D%20p.stdout.read()%20%2B%20p.stderr.read()%0A%20%20%20%20p.wait()%0A%20%20%20%20elapsed%20%3D%20time.monotonic()%20-%20t0%0A%20%20%20%20assert%20p.returncode%20%3D%3D%200%2C%20f%22%7Blabel%7D%20build%20failed%3A%5Cn%7Bout%5B-4000%3A%5D%7D%22%0A%20%20%20%20print(f%22%7Blabel%7D%20build%3A%20%7Belapsed%3A.1f%7Ds%22)%0A%20%20%20%20return%20elapsed%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20app%20%3D%20modal.App.lookup(%22example-memory-snapshot%22%2C%20create_if_missing%3DTrue)%0A%0A%20%20%20%20%23%20Snapshotting%20has%20to%20be%20opted%20into%20at%20creation%20time.%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20cpu%3D4.0%2C%0A%20%20%20%20%20%20%20%20memory%3D8%20*%201024%2C%0A%20%20%20%20%20%20%20%20timeout%3D20%20*%2060%2C%0A%20%20%20%20%20%20%20%20experimental_options%3D%7B%22vm_runtime%22%3A%20True%7D%2C%0A%20%20%20%20%20%20%20%20_experimental_enable_snapshot%3DTrue%2C%0A%20%20%20%20)%0A%20%20%20%20restored%20%3D%20None%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%23%20The%20cold%20build%20populates%20the%20on-disk%20cache%20and%2C%20more%20importantly%2C%0A%20%20%20%20%20%20%20%20%23%20leaves%20a%20Bazel%20server%20running%20with%20a%20warm%20analysis%20cache%20in%20memory.%0A%20%20%20%20%20%20%20%20cold%20%3D%20timed_build(sb%2C%20%22cold%22)%0A%0A%20%20%20%20%20%20%20%20snapshot%20%3D%20sb._experimental_snapshot()%0A%20%20%20%20%20%20%20%20print(f%22snapshot_id%3A%20%7Bsnapshot.object_id%7D%22)%0A%20%20%20%20%20%20%20%20sb.terminate()%0A%0A%20%20%20%20%20%20%20%20%23%20Restore%20into%20a%20fresh%20Sandbox.%20The%20Bazel%20server%20comes%20back%20as%20a%20live%0A%20%20%20%20%20%20%20%20%23%20process%20with%20the%20same%20pid%20and%20in-memory%20state%20so%20execs%20come%20back%20warm%0A%20%20%20%20%20%20%20%20t0%20%3D%20time.monotonic()%0A%20%20%20%20%20%20%20%20restored%20%3D%20modal.Sandbox._experimental_from_snapshot(snapshot)%0A%20%20%20%20%20%20%20%20timed_build(restored%2C%20%22warm%22)%0A%0A%20%20%20%20%20%20%20%20restore_and_warm%20%3D%20time.monotonic()%20-%20t0%0A%20%20%20%20%20%20%20%20print(f%22restore%20%2B%20warm%20build%3A%20%7Brestore_and_warm%3A.1f%7Ds%22)%0A%20%20%20%20%20%20%20%20print(f%22speedup%20vs%20cold%3A%20%7Bcold%20%2F%20restore_and_warm%3A.1f%7Dx%22)%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20sb.terminate()%0A%20%20%20%20%20%20%20%20if%20restored%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20restored.terminate()`,lang:`python`});var E=c(T,2);d(E,{id:`limitations`,children:(e,t)=>{l(),i(e,r(`Limitations`))},$$slots:{default:!0}});var D=c(E,2),O=e(D);g(c(e(O)),{href:`/docs/guide/sandbox-snapshots#limitations`,children:(e,t)=>{l(),i(e,r(`limitations`))},$$slots:{default:!0}}),l(2),n(O),l(4),n(D),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=BGfgAHM4.js.map
