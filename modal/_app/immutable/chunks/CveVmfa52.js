(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f7a56ee8-33ea-4454-bbd8-c36ebc81ccc2`,e._sentryDebugIdIdentifier=`sentry-dbid-f7a56ee8-33ea-4454-bbd8-c36ebc81ccc2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={description:`Automatically take a filesystem snapshot when a Sandbox exits`,toc:[{depth:1,value:`Sandbox Exit Snapshots`,id:`sandbox-exit-snapshots`,children:[{depth:2,value:`Usage`,id:`usage`},{depth:2,value:`Waiting for the snapshot`,id:`waiting-for-the-snapshot`},{depth:2,value:`Errors`,id:`errors`},{depth:2,value:`Retention`,id:`retention`},{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# Sandbox Exit Snapshots

<Callout variant="alpha">

Exit snapshots are best effort and cannot account for hardware failures.
Currently available in the Python SDK only.

</Callout>

Exit Snapshots take a [filesystem snapshot](/docs/guide/sandbox-snapshots#filesystem-snapshots)
automatically on both graceful and ungraceful Sandbox exits, including
\`terminate()\`, entrypoint completion, idle timeout, lifetime expiry, and OOM.

This is useful when you want filesystem state after a Sandbox is gone without
having to call \`snapshot_filesystem()\` yourself first. Typical uses:

- Resuming an agent or coding session after an idle timeout
- Recovering work from a Sandbox that exited unexpectedly
- Avoiding races between your own teardown and an in-flight manual snapshot

## Usage

Opt in at time of creation with
\`experimental_options={"enable_exit_snapshot": True}\`, then fetch the resulting
[Image](/docs/guide/images) with \`_experimental_get_exit_snapshot()\` after the
Sandbox has exited:

\`\`\`python notest
import modal

app = modal.App.lookup("exit-snapshot-example", create_if_missing=True)

sb = modal.Sandbox.create(
    "bash",
    "-c",
    "echo hello > /tmp/marker.txt",
    app=app,
    experimental_options={"enable_exit_snapshot": True},
)
sb.wait()

image = sb._experimental_get_exit_snapshot()
restored = modal.Sandbox.create(app=app, image=image)
print(restored.filesystem.read_text("/tmp/marker.txt"))  # "hello\\n"
restored.terminate()
\`\`\`

You can also reconnect later with \`Sandbox.from_id\` and fetch the exit
snapshot from that handle. This is useful when the create and resume happen
in different processes:

\`\`\`python notest
import modal

app = modal.App.lookup("exit-snapshot-example", create_if_missing=True)

# Process A: create a Sandbox, do work, then let it idle out or terminate.
sb = modal.Sandbox.create(
    app=app,
    experimental_options={"enable_exit_snapshot": True},
)
sb.filesystem.write_text("session state", "/workspace/state.txt")
sandbox_id = sb.object_id
sb.terminate(wait=True)

# Process B: resume from the exit snapshot.
sb = modal.Sandbox.from_id(sandbox_id)
image = sb._experimental_get_exit_snapshot()
sb2 = modal.Sandbox.create(app=app, image=image)
print(sb2.filesystem.read_text("/workspace/state.txt"))  # "session state"
sb2.terminate()
\`\`\`

## Waiting for the snapshot

\`_experimental_get_exit_snapshot(timeout=...)\` long-polls until the snapshot
reaches a terminal state:

| \`timeout\`        | Behavior                                                |
| ---------------- | ------------------------------------------------------- |
| \`None\` (default) | Wait until the snapshot succeeds or fails               |
| \`0\`              | Immediate check; raises \`TimeoutError\` if still pending |
| \`> 0\`            | Wait up to the specified number of seconds              |

On success, the method returns an \`Image\` you can pass to
\`Sandbox.create(image=...)\`.

## Errors

\`_experimental_get_exit_snapshot()\` can raise these exceptions:

| Exception               | When                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| \`SnapshotCreationError\` | Snapshot creation failed                                                 |
| \`TimeoutError\`          | Still pending when your \`timeout\` elapses                                |
| \`InvalidError\`          | Exit snapshots were not enabled on the Sandbox, or \`timeout\` is negative |
| \`NotFoundError\`         | The Sandbox no longer exists                                             |

These are all \`modal.exception\` classes. Note that \`TimeoutError\` is Modal's own
class rather than Python's builtin, so a bare \`except TimeoutError\` will not
catch it.

## Retention

Exit snapshot Images are retained for 30 days after creation, matching the
default for [filesystem snapshots](/docs/guide/sandbox-snapshots#snapshot-retention).
After that, attempting to use the Image raises \`NotFoundError\`.

## Limitations

- **Filesystem only.** Exit Snapshots capture the Sandbox filesystem, not
  memory or directory mounts.
- **Main container only.** Sidecar containers are not included.
- **gVisor only.** [VM Sandboxes](/docs/guide/vm-sandboxes) and
  [Sandboxes v2](/docs/guide/sandbox-v2) are not supported yet.
- **Snapshot failure loses that Sandbox's filesystem state.** If you need to
  periodically persist state with stronger durability guarantees, prefer
  [Volumes](/docs/guide/volumes).
`,meta:{title:`Sandbox Exit Snapshots`,description:`Automatically take a filesystem snapshot when a Sandbox exits`}},{description:v,toc:y,rawContent:b,meta:x}=_,S=t(`<p>Exit snapshots are best effort and cannot account for hardware failures.
Currently available in the Python SDK only.</p>`),C=t(`<thead><tr><th><code>timeout</code></th><th>Behavior</th></tr></thead> <tbody><tr><td><code>None</code> (default)</td><td>Wait until the snapshot succeeds or fails</td></tr><tr><td><code>0</code></td><td>Immediate check; raises <code>TimeoutError</code> if still pending</td></tr><tr><td><code>&gt; 0</code></td><td>Wait up to the specified number of seconds</td></tr></tbody>`,1),w=t(`<thead><tr><th>Exception</th><th>When</th></tr></thead> <tbody><tr><td><code>SnapshotCreationError</code></td><td>Snapshot creation failed</td></tr><tr><td><code>TimeoutError</code></td><td>Still pending when your <code>timeout</code> elapses</td></tr><tr><td><code>InvalidError</code></td><td>Exit snapshots were not enabled on the Sandbox, or <code>timeout</code> is negative</td></tr><tr><td><code>NotFoundError</code></td><td>The Sandbox no longer exists</td></tr></tbody>`,1),T=t(`<!> <!> <p>Exit Snapshots take a <!> automatically on both graceful and ungraceful Sandbox exits, including <code>terminate()</code>, entrypoint completion, idle timeout, lifetime expiry, and OOM.</p> <p>This is useful when you want filesystem state after a Sandbox is gone without
having to call <code>snapshot_filesystem()</code> yourself first. Typical uses:</p> <ul><li>Resuming an agent or coding session after an idle timeout</li> <li>Recovering work from a Sandbox that exited unexpectedly</li> <li>Avoiding races between your own teardown and an in-flight manual snapshot</li></ul> <!> <p>Opt in at time of creation with <code>experimental_options=&#123;"enable_exit_snapshot": True&#125;</code>, then fetch the resulting <!> with <code>_experimental_get_exit_snapshot()</code> after the
Sandbox has exited:</p> <!> <p>You can also reconnect later with <code>Sandbox.from_id</code> and fetch the exit
snapshot from that handle. This is useful when the create and resume happen
in different processes:</p> <!> <!> <p><code>_experimental_get_exit_snapshot(timeout=...)</code> long-polls until the snapshot
reaches a terminal state:</p> <!> <p>On success, the method returns an <code>Image</code> you can pass to <code>Sandbox.create(image=...)</code>.</p> <!> <p><code>_experimental_get_exit_snapshot()</code> can raise these exceptions:</p> <!> <p>These are all <code>modal.exception</code> classes. Note that <code>TimeoutError</code> is Modal’s own
class rather than Python’s builtin, so a bare <code>except TimeoutError</code> will not
catch it.</p> <!> <p>Exit snapshot Images are retained for 30 days after creation, matching the
default for <!>.
After that, attempting to use the Image raises <code>NotFoundError</code>.</p> <!> <ul><li><strong>Filesystem only.</strong> Exit Snapshots capture the Sandbox filesystem, not
memory or directory mounts.</li> <li><strong>Main container only.</strong> Sidecar containers are not included.</li> <li><strong>gVisor only.</strong> <!> and <!> are not supported yet.</li> <li><strong>Snapshot failure loses that Sandbox’s filesystem state.</strong> If you need to
periodically persist state with stronger durability guarantees, prefer <!>.</li></ul>`,1);function E(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=T(),h=s(o);f(h,{id:`sandbox-exit-snapshots`,children:(e,t)=>{l(),i(e,r(`Sandbox Exit Snapshots`))},$$slots:{default:!0}});var _=c(h,2);u(_,{variant:`alpha`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var v=c(_,2);g(c(e(v)),{href:`/docs/guide/sandbox-snapshots#filesystem-snapshots`,children:(e,t)=>{l(),i(e,r(`filesystem snapshot`))},$$slots:{default:!0}}),l(3),n(v);var y=c(v,6);d(y,{id:`usage`,children:(e,t)=>{l(),i(e,r(`Usage`))},$$slots:{default:!0}});var b=c(y,2);g(c(e(b),3),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(3),n(b);var x=c(b,2);m(x,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22exit-snapshot-example%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22echo%20hello%20%3E%20%2Ftmp%2Fmarker.txt%22%2C%0A%20%20%20%20app%3Dapp%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_exit_snapshot%22%3A%20True%7D%2C%0A)%0Asb.wait()%0A%0Aimage%20%3D%20sb._experimental_get_exit_snapshot()%0Arestored%20%3D%20modal.Sandbox.create(app%3Dapp%2C%20image%3Dimage)%0Aprint(restored.filesystem.read_text(%22%2Ftmp%2Fmarker.txt%22))%20%20%23%20%22hello%5Cn%22%0Arestored.terminate()`,lang:`python`});var E=c(x,4);m(E,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22exit-snapshot-example%22%2C%20create_if_missing%3DTrue)%0A%0A%23%20Process%20A%3A%20create%20a%20Sandbox%2C%20do%20work%2C%20then%20let%20it%20idle%20out%20or%20terminate.%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20app%3Dapp%2C%0A%20%20%20%20experimental_options%3D%7B%22enable_exit_snapshot%22%3A%20True%7D%2C%0A)%0Asb.filesystem.write_text(%22session%20state%22%2C%20%22%2Fworkspace%2Fstate.txt%22)%0Asandbox_id%20%3D%20sb.object_id%0Asb.terminate(wait%3DTrue)%0A%0A%23%20Process%20B%3A%20resume%20from%20the%20exit%20snapshot.%0Asb%20%3D%20modal.Sandbox.from_id(sandbox_id)%0Aimage%20%3D%20sb._experimental_get_exit_snapshot()%0Asb2%20%3D%20modal.Sandbox.create(app%3Dapp%2C%20image%3Dimage)%0Aprint(sb2.filesystem.read_text(%22%2Fworkspace%2Fstate.txt%22))%20%20%23%20%22session%20state%22%0Asb2.terminate()`,lang:`python`});var D=c(E,2);d(D,{id:`waiting-for-the-snapshot`,children:(e,t)=>{l(),i(e,r(`Waiting for the snapshot`))},$$slots:{default:!0}});var O=c(D,4);p(O,{children:(e,t)=>{var n=C();l(2),i(e,n)},$$slots:{default:!0}});var k=c(O,4);d(k,{id:`errors`,children:(e,t)=>{l(),i(e,r(`Errors`))},$$slots:{default:!0}});var A=c(k,4);p(A,{children:(e,t)=>{var n=w();l(2),i(e,n)},$$slots:{default:!0}});var j=c(A,4);d(j,{id:`retention`,children:(e,t)=>{l(),i(e,r(`Retention`))},$$slots:{default:!0}});var M=c(j,2);g(c(e(M)),{href:`/docs/guide/sandbox-snapshots#snapshot-retention`,children:(e,t)=>{l(),i(e,r(`filesystem snapshots`))},$$slots:{default:!0}}),l(3),n(M);var N=c(M,2);d(N,{id:`limitations`,children:(e,t)=>{l(),i(e,r(`Limitations`))},$$slots:{default:!0}});var P=c(N,2),F=c(e(P),4),I=c(e(F),2);g(I,{href:`/docs/guide/vm-sandboxes`,children:(e,t)=>{l(),i(e,r(`VM Sandboxes`))},$$slots:{default:!0}}),g(c(I,2),{href:`/docs/guide/sandbox-v2`,children:(e,t)=>{l(),i(e,r(`Sandboxes v2`))},$$slots:{default:!0}}),l(),n(F);var L=c(F,2);g(c(e(L),2),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(L),n(P),i(t,o)},$$slots:{default:!0}}))}export{E as default,_ as metadata};
//# sourceMappingURL=CveVmfa52.js.map
