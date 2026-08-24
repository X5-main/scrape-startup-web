(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4c13bd63-3cfa-4f1b-8cb1-f5d3cdce8092`,e._sentryDebugIdIdentifier=`sentry-dbid-4c13bd63-3cfa-4f1b-8cb1-f5d3cdce8092`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./DYSGKh1I.js";import{a as l,i as u,o as ne}from"./CPby7b1n.js";import{n as re}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./D0Ft4u302.js";var h={toc:[{depth:1,value:`Snapshots`,id:`snapshots`,children:[{depth:2,value:`Snapshot Retention`,id:`snapshot-retention`},{depth:2,value:`Filesystem Snapshots`,id:`filesystem-snapshots`},{depth:2,value:`Directory Snapshots`,id:`directory-snapshots`,children:[{depth:3,value:`Usage`,id:`usage`},{depth:3,value:`Unmounting a mounted Image`,id:`unmounting-a-mounted-image`}]},{depth:2,value:`Memory Snapshots`,id:`memory-snapshots`,children:[{depth:3,value:`Re-snapshotting`,id:`re-snapshotting`},{depth:3,value:`Limitations`,id:`limitations`}]},{depth:2,value:`Persisting Sandbox State`,id:`persisting-sandbox-state`},{depth:2,value:`Deleting Snapshots`,id:`deleting-snapshots`}]}],rawContent:`# Snapshots



Sandboxes support snapshotting, allowing you to save your Sandbox's state
and restore it later. This is useful for:

- Reducing startup latency
- Creating custom environments for your Sandboxes to run in
- Backing up your Sandbox's state for debugging
- Running large-scale experiments with the same initial state
- Branching your Sandbox's state to test different code changes independently

Modal currently supports three different kinds of Sandbox snapshots:

1. [Filesystem Snapshots](#filesystem-snapshots)
2. [Directory Snapshots](#directory-snapshots)
3. [Memory Snapshots](#memory-snapshots)

## Snapshot Retention

Different snapshot types have different retention policies:

| Snapshot Type       | Default Retention Period |
| ------------------- | ------------------------ |
| Filesystem Snapshot | 30 days after creation   |
| Directory Snapshot  | 30 days after creation   |
| Memory Snapshot     | 7 days after creation    |

<Callout variant="warning">

**Breaking change in v1.5 (Python) / v0.8.0 (Go/JS):** Filesystem Snapshots now default to a 30-day TTL. Previously, Filesystem Snapshots persisted indefinitely and Directory Snapshots already defaulted to 30 days. Both \`snapshot_filesystem()\` and \`snapshot_directory()\` now accept an explicit TTL parameter that you can use to override the default, including opting out of expiry entirely.

</Callout>

Filesystem Snapshots and Directory Snapshots are [Images](/docs/sdk/py/latest/Image) and are automatically garbage collected after their TTL expires (30 days by default). You can configure a custom TTL when creating a snapshot, or opt out of expiry entirely to retain snapshots indefinitely. Memory Snapshots expire 7 days after creation and cannot currently be extended.

Here is how to configure custom TTLs for each snapshot type:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
# Filesystem snapshot with custom TTL of 7 days
image = sb.snapshot_filesystem(ttl=7 * 24 * 3600)

# Filesystem snapshot with no expiry (retain indefinitely, like the pre-v1.5 default)
image = sb.snapshot_filesystem(ttl=None)

# Directory snapshot with custom TTL of 7 days
snapshot = sb.snapshot_directory("/project", ttl=7 * 24 * 3600)

# Directory snapshot with no expiry
snapshot = sb.snapshot_directory("/project", ttl=None)
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
// Filesystem snapshot with custom TTL of 7 days
let image = await sb.snapshotFilesystem({ ttlMs: 7 * 24 * 3600 * 1000 });

// Filesystem snapshot with no expiry (retain indefinitely, like the pre-v0.8.0 default)
image = await sb.snapshotFilesystem({ ttlMs: null });

// Directory snapshot with custom TTL of 7 days
let snapshot = await sb.snapshotDirectory("/project", {
  ttlMs: 7 * 24 * 3600 * 1000,
});

// Directory snapshot with no expiry
snapshot = await sb.snapshotDirectory("/project", { ttlMs: null });
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
// Filesystem snapshot with custom TTL of 7 days
image, _ := sb.SnapshotFilesystem(ctx, &modal.SandboxSnapshotFilesystemParams{
    TTL: 7 * 24 * time.Hour,
})

// Filesystem snapshot with no expiry (retain indefinitely, like the pre-v0.8.0 default)
image, _ = sb.SnapshotFilesystem(ctx, &modal.SandboxSnapshotFilesystemParams{
    TTL: modal.NoExpiryTTL,
})

// Directory snapshot with custom TTL of 7 days
snapshot, _ := sb.SnapshotDirectory(ctx, "/project", &modal.SandboxSnapshotDirectoryParams{
    TTL: 7 * 24 * time.Hour,
})

// Directory snapshot with no expiry
snapshot, _ = sb.SnapshotDirectory(ctx, "/project", &modal.SandboxSnapshotDirectoryParams{
    TTL: modal.NoExpiryTTL,
})
\`\`\`

{/snippet}
</CodeTabs>

If you try to use an expired snapshot, Modal will raise a \`NotFoundError\` — immediately when mounting the Image into a running Sandbox, or upon first interaction (e.g. \`exec\` or \`wait\`) when starting a new Sandbox from the expired Image. Note that \`Image.from_id()\` is itself lazy and will not raise an error on construction even if the provided Image ID has been deleted.

To manage storage for long-lived snapshots, you can delete them programmatically when no longer needed. See [Deleting Snapshots](#deleting-snapshots) for details.

## Filesystem Snapshots

Filesystem Snapshots are copies of the Sandbox's filesystem at a given point in time.
These Snapshots are [Images](/docs/sdk/py/latest/Image) and can be used to create
new Sandboxes.

To create a Filesystem Snapshot, you can use the
[\`Sandbox.snapshot_filesystem()\`](/docs/sdk/py/latest/Sandbox#snapshot_filesystem) method:

\`\`\`python notest
import modal

app = modal.App.lookup("sandbox-fs-snapshot-test", create_if_missing=True)

sb = modal.Sandbox.create(app=app)
p = sb.exec("bash", "-c", "echo 'test' > /test")
p.wait()
assert p.returncode == 0, "failed to write to file"
image = sb.snapshot_filesystem()
sb.terminate()

sb2 = modal.Sandbox.create(image=image, app=app)
p2 = sb2.exec("bash", "-c", "cat /test")
assert p2.stdout.read().strip() == "test"
\`\`\`

Filesystem Snapshots are optimized for performance: they are calculated as the difference
from your base image, so only modified files are stored. Restoring a Filesystem Snapshot
utilizes the same infrastructure we use to get fast cold starts for your Sandboxes.

See [Snapshot Retention](#snapshot-retention) for TTL configuration options and [Deleting Snapshots](#deleting-snapshots) to learn how to manage snapshot storage.

## Directory Snapshots

Directory Snapshots allow you to snapshot a specific directory within a running Sandbox. The resulting snapshot is an Image that can then be mounted into another already-running Sandbox (typically at a later time), which can be useful for:

- **Updating system dependencies separately from application code**: Base dependencies can be updated by starting a new Sandbox from an updated base Image, and then mounting in previously snapshotted application code.
- **Using warm pools in combination with snapshots**: For use cases that benefit from a [warm pool](/docs/examples/sandbox_pool) of Sandboxes to reduce start-up latency, the first initialization can now happen in the warm pool without losing the ability to restore application-specific code at a later point in time.
- **Speeding up resumptions of previous sessions**: Files in mounted Images are prioritized when containers load files, so mounting a directory can speed up Sandbox resumptions vs. starting from a full file system image.

### Usage

Use \`snapshot_directory\` to snapshot a directory,
\`mount_image\` to mount a previous directory snapshot at a directory path,
and \`unmount_image\` to remove that mounted Image later.
To protect directory snapshots with customer-held key material, see
[Customer Supplied Encryption Keys](/docs/guide/customer-supplied-encryption-keys#directory-snapshots).

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(app=app)
# Write some dummy data
sb.exec("bash", "-c", "mkdir /project && echo 'data' > /project/file.txt").wait()

# Snapshot the directory
snapshot = sb.snapshot_directory("/project")

# Ok to throw away the old Sandbox at this point
sb.terminate()

# Mount the snapshot in a new Sandbox
sb2 = modal.Sandbox.create(app=app)
try:
    sb2.mount_image("/project", snapshot)
except modal.exception.NotFoundError:
    # Handle a potential ttl expiry of the old snapshot here
    ...

# The Sandbox now has access to the previous project state
assert sb2.exec("cat", "/project/file.txt").stdout.read().strip() == "data"

\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { NotFoundError } from "modal";

const sb = await modal.sandboxes.create(app, image);
// Write some dummy data
const p = await sb.exec([
  "bash",
  "-c",
  "mkdir /project && echo 'data' > /project/file.txt",
]);
await p.wait();

// Snapshot the directory
const snapshot = await sb.snapshotDirectory("/project");

// Ok to throw away the old Sandbox at this point
await sb.terminate();
sb.detach();

// Mount the snapshot in a new Sandbox
const sb2 = await modal.sandboxes.create(app, image);
try {
  await sb2.mountImage("/project", snapshot);
} catch (e) {
  if (e instanceof NotFoundError) {
    // Handle a potential ttl expiry of the old snapshot here
  }
}

// The Sandbox now has access to the previous project state
const p2 = await sb2.exec(["cat", "/project/file.txt"]);
console.assert((await p2.stdout.readText()).trim() === "data");
sb2.detach();
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
defer sb.Detach()

// Write some dummy data
p, _ := sb.Exec(ctx, []string{"bash", "-c", "mkdir /project && echo 'data' > /project/file.txt"}, nil)
p.Wait(ctx, nil)

// Snapshot the directory
snapshot, _ := sb.SnapshotDirectory(ctx, "/project", nil)

// Ok to throw away the old Sandbox at this point
sb.Terminate(ctx, nil)

// Mount the snapshot in a new Sandbox
sb2, _ := mc.Sandboxes.Create(ctx, app, image, nil)
defer sb2.Detach()

if err := sb2.MountImage(ctx, "/project", snapshot, nil); err != nil {
  var notFound modal.NotFoundError
  if errors.As(err, &notFound) {
    // Handle a potential ttl expiry of the old snapshot here
  }
}

// The Sandbox now has access to the previous project state
p2, _ := sb2.Exec(ctx, []string{"cat", "/project/file.txt"}, nil)
stdout, _ := io.ReadAll(p2.Stdout)
fmt.Println(strings.TrimSpace(string(stdout))) // "data"
\`\`\`

{/snippet}
</CodeTabs>

### Unmounting a mounted Image

To unmount a previously mounted Image,
call \`unmount_image\` on the exact path you passed to \`mount_image\`.
After unmounting, the underlying Sandbox filesystem at that path becomes visible again.

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb2.unmount_image("/project")
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
await sb2.unmountImage("/project");
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
_ = sb2.UnmountImage(ctx, "/project", nil)
\`\`\`

{/snippet}
</CodeTabs>

## Memory Snapshots

<Callout variant="alpha">

A number of known [limitations](#limitations) currently apply.

</Callout>

Sandbox memory snapshots are copies of a Sandbox’s entire state, both in memory and on the filesystem. These Snapshots can be restored later to create a new Sandbox, which is an exact clone of the original Sandbox.

To snapshot a Sandbox, create it with \`_experimental_enable_snapshot\` set to \`True\`, and use the \`_experimental_snapshot\` method, which returns a \`SandboxSnapshot\` object:

\`\`\`python notest
image = modal.Image.debian_slim().apt_install("curl", "procps")
app = modal.App.lookup("sandbox-snapshot", create_if_missing=True)

with modal.enable_output():
    sb = modal.Sandbox.create(
        "python3", "-m", "http.server", "8000",
        app=app, image=image, _experimental_enable_snapshot=True
    )

print(f"Performing snapshot of {sb.object_id} ...")
snapshot = sb._experimental_snapshot()
\`\`\`

Create a new Sandbox from the returned SandboxSnapshot with \`Sandbox._experimental_from_snapshot\`:

\`\`\`python notest
print(f"Restoring from snapshot {sb.object_id} ...")
sb2 = modal.Sandbox._experimental_from_snapshot(snapshot)

print("Let's see that the http.server is still running...")
p = sb2.exec("ps", "aux")
print(p.stdout.read())

# Talk to snapshotted Sandbox http.server
p = sb2.exec("curl", "http://localhost:8000/")
reply = p.stdout.read()
print(reply)  # <!DOCTYPE HTML><html lang...
\`\`\`

The new Sandbox will be a duplicate of your original Sandbox. All running processes will still be running, in the same state as when they were snapshotted, and any changes made to the filesystem will be visible.

You can retrieve the ID of any Sandbox Snapshot with \`snapshot.object_id\` . To restore from a snapshot by ID, first rehydrate the Snapshot with \`SandboxSnapshot.from_id\` and then restore from it:

\`\`\`python notest
snapshot_id = snapshot.object_id
# ... save the Sandbox ID (sb-123abc) for later
# sometime in the future...
snapshot = modal.SandboxSnapshot.from_id(snapshot_id)
sandbox = modal.Sandbox._experimental_from_snapshot(snapshot)
\`\`\`

Note that these methods are _experimental_, and we may change them in the future.

### Re-snapshotting

When creating a new memory snapshot from a Sandbox that was _itself_ created from a memory snapshot, the new snapshot inherits the expiration date of the original snapshot.
This means a "chain" of snapshotted state can only ever become as old as the expiration date of the first snapshot in the series.

For example, snapshot_2 in the following example would only be valid for 3 days after creation:

\`\`\`python notest
sandbox_1 = modal.Sandbox.create(_experimental_enable_snapshot=True)

# snapshot_1 has a lifetime of 7 days from creation
snapshot_1 = sandbox_1._experimental_snapshot()

# 4 days later we do a restore + snapshot from snapshot_1
print(f"Restoring from snapshot {snapshot_1.object_id} ...")
sandbox_2 = modal.Sandbox._experimental_from_snapshot(snapshot_1)
snapshot_2 = sandbox_2._experimental_snapshot()
# snapshot_2 now has a lifetime of 7 - 4 = 3 days from creation
\`\`\`

### Limitations

- Sandbox Memory Snapshots expire 7 days after creation (see [Snapshot Retention](#snapshot-retention)). For longer persisting snapshots, try [Filesystem Snapshots](#filesystem-snapshots).
- Open TCP connections will be closed automatically when a Snapshot is taken, and will need to be reopened when the Snapshot is restored.
- Snapshotting a Sandbox will currently cause it to terminate. We intend to remove this limitation soon.
- Sandboxes created with \`_experimental_enable_snapshot=True\` or restored from Snapshots cannot run with GPUs.
- It is not possible to snapshot a Sandbox while a \`Sandbox.exec\` command is still running. Furthermore, any background processes launched by a call to \`Sandbox.exec\` will not be properly restored after a snapshot.
- Sandbox memory snapshots can only be restored on the same exact instance type that the original Sandbox was run on. Given Modal's diverse fleet of capacity, this can sometimes lead to scheduling delays, especially when memory snapshots are combined with narrow region pinning.

## Persisting Sandbox State

To persist state across Sandbox sessions, you need to:

1. **Trigger the snapshot.** Snapshots are triggered from outside the Sandbox, typically just before termination. A common pattern is to run an exec process inside the Sandbox and wait for it to exit. Once it does, the controller takes a snapshot and terminates the Sandbox.
2. **Store the snapshot ID.** The \`object_id\` string must be persisted so you can restore from it later. This is typically keyed by a session or user ID, and can be stored in your database, an external key-value store, or a [Modal Dict](/docs/guide/dicts).

The following example shows this pattern. This code would typically run in a Modal Function or your own backend, orchestrating the Sandbox:

\`\`\`python notest
import modal

app = modal.App.lookup("sandbox-snapshot-lifecycle", create_if_missing=True)
snapshot_store = modal.Dict.from_name("sandbox-snapshots", create_if_missing=True)
session_id = "sess_a1b2c3d4"

# Restore from snapshot, or use base image
if session_id in snapshot_store:
    image = modal.Image.from_id(snapshot_store[session_id])
else:
    image = modal.Image.debian_slim()

sb = modal.Sandbox.create(image=image, app=app)

# Run agent which exits when ready to be snapshotted
p = sb.exec("python", "agent.py")
p.wait()

# Snapshot and store the object_id
snapshot_store[session_id] = sb.snapshot_filesystem().object_id
sb.terminate()
\`\`\`

## Deleting Snapshots

Since both Filesystem and Directory Snapshots are [Images](/docs/sdk/py/latest/Image), you can delete them using the image deletion API. This is useful for managing storage or complying with data retention policies.

<Callout variant="warning">

Deletion is irreversible. Deleted snapshots cannot be recovered, and any Sandboxes configured to use a deleted snapshot will fail to start.

</Callout>

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import modal.experimental

# Get the image ID from a filesystem or directory snapshot
image = sb.snapshot_filesystem()
# or: image = sb.snapshot_directory("/project")
image_id = image.object_id  # e.g., "im-abc123"

# Later, delete the snapshot when no longer needed
modal.experimental.image_delete(image_id)
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
// Get the image ID from a filesystem or directory snapshot
const image = await sb.snapshotFilesystem();
// or: const image = await sb.snapshotDirectory("/project");
const imageId = image.imageId; // e.g., "im-abc123"

// Later, delete the snapshot when no longer needed
await modal.images.delete(imageId);
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
// Get the image ID from a filesystem or directory snapshot
image, _ := sb.SnapshotFilesystem(ctx, nil)
// or: image, _ := sb.SnapshotDirectory(ctx, "/project", nil)
imageId := image.ImageID // e.g., "im-abc123"

// Later, delete the snapshot when no longer needed
mc.Images.Delete(ctx, imageId, nil)
\`\`\`

{/snippet}
</CodeTabs>

To delete snapshots, you need to track the image IDs yourself (e.g., in a database or [Modal Dict](/docs/guide/dicts)), since there is currently no API to list all snapshots you have created.
`,meta:{title:`Snapshots`,description:`Sandboxes support snapshotting, allowing you to save your Sandbox’s state and restore it later. This is useful for:`}},{toc:g,rawContent:_,meta:v}=h,ie=t(`<thead><tr><th>Snapshot Type</th><th>Default Retention Period</th></tr></thead> <tbody><tr><td>Filesystem Snapshot</td><td>30 days after creation</td></tr><tr><td>Directory Snapshot</td><td>30 days after creation</td></tr><tr><td>Memory Snapshot</td><td>7 days after creation</td></tr></tbody>`,1),ae=t(`<p><strong>Breaking change in v1.5 (Python) / v0.8.0 (Go/JS):</strong> Filesystem Snapshots now default to a 30-day TTL. Previously, Filesystem Snapshots persisted indefinitely and Directory Snapshots already defaulted to 30 days. Both <code>snapshot_filesystem()</code> and <code>snapshot_directory()</code> now accept an explicit TTL parameter that you can use to override the default, including opting out of expiry entirely.</p>`),oe=t(`<code>Sandbox.snapshot_filesystem()</code>`),se=t(`<p>A number of known <!> currently apply.</p>`),ce=t(`<p>Deletion is irreversible. Deleted snapshots cannot be recovered, and any Sandboxes configured to use a deleted snapshot will fail to start.</p>`),le=t(`<!> <p>Sandboxes support snapshotting, allowing you to save your Sandbox’s state
and restore it later. This is useful for:</p> <ul><li>Reducing startup latency</li> <li>Creating custom environments for your Sandboxes to run in</li> <li>Backing up your Sandbox’s state for debugging</li> <li>Running large-scale experiments with the same initial state</li> <li>Branching your Sandbox’s state to test different code changes independently</li></ul> <p>Modal currently supports three different kinds of Sandbox snapshots:</p> <ol><li><!></li> <li><!></li> <li><!></li></ol> <!> <p>Different snapshot types have different retention policies:</p> <!> <!> <p>Filesystem Snapshots and Directory Snapshots are <!> and are automatically garbage collected after their TTL expires (30 days by default). You can configure a custom TTL when creating a snapshot, or opt out of expiry entirely to retain snapshots indefinitely. Memory Snapshots expire 7 days after creation and cannot currently be extended.</p> <p>Here is how to configure custom TTLs for each snapshot type:</p> <!> <p>If you try to use an expired snapshot, Modal will raise a <code>NotFoundError</code> — immediately when mounting the Image into a running Sandbox, or upon first interaction (e.g. <code>exec</code> or <code>wait</code>) when starting a new Sandbox from the expired Image. Note that <code>Image.from_id()</code> is itself lazy and will not raise an error on construction even if the provided Image ID has been deleted.</p> <p>To manage storage for long-lived snapshots, you can delete them programmatically when no longer needed. See <!> for details.</p> <!> <p>Filesystem Snapshots are copies of the Sandbox’s filesystem at a given point in time.
These Snapshots are <!> and can be used to create
new Sandboxes.</p> <p>To create a Filesystem Snapshot, you can use the <!> method:</p> <!> <p>Filesystem Snapshots are optimized for performance: they are calculated as the difference
from your base image, so only modified files are stored. Restoring a Filesystem Snapshot
utilizes the same infrastructure we use to get fast cold starts for your Sandboxes.</p> <p>See <!> for TTL configuration options and <!> to learn how to manage snapshot storage.</p> <!> <p>Directory Snapshots allow you to snapshot a specific directory within a running Sandbox. The resulting snapshot is an Image that can then be mounted into another already-running Sandbox (typically at a later time), which can be useful for:</p> <ul><li><strong>Updating system dependencies separately from application code</strong>: Base dependencies can be updated by starting a new Sandbox from an updated base Image, and then mounting in previously snapshotted application code.</li> <li><strong>Using warm pools in combination with snapshots</strong>: For use cases that benefit from a <!> of Sandboxes to reduce start-up latency, the first initialization can now happen in the warm pool without losing the ability to restore application-specific code at a later point in time.</li> <li><strong>Speeding up resumptions of previous sessions</strong>: Files in mounted Images are prioritized when containers load files, so mounting a directory can speed up Sandbox resumptions vs. starting from a full file system image.</li></ul> <!> <p>Use <code>snapshot_directory</code> to snapshot a directory, <code>mount_image</code> to mount a previous directory snapshot at a directory path,
and <code>unmount_image</code> to remove that mounted Image later.
To protect directory snapshots with customer-held key material, see <!>.</p> <!> <!> <p>To unmount a previously mounted Image,
call <code>unmount_image</code> on the exact path you passed to <code>mount_image</code>.
After unmounting, the underlying Sandbox filesystem at that path becomes visible again.</p> <!> <!> <!> <p>Sandbox memory snapshots are copies of a Sandbox’s entire state, both in memory and on the filesystem. These Snapshots can be restored later to create a new Sandbox, which is an exact clone of the original Sandbox.</p> <p>To snapshot a Sandbox, create it with <code>_experimental_enable_snapshot</code> set to <code>True</code>, and use the <code>_experimental_snapshot</code> method, which returns a <code>SandboxSnapshot</code> object:</p> <!> <p>Create a new Sandbox from the returned SandboxSnapshot with <code>Sandbox._experimental_from_snapshot</code>:</p> <!> <p>The new Sandbox will be a duplicate of your original Sandbox. All running processes will still be running, in the same state as when they were snapshotted, and any changes made to the filesystem will be visible.</p> <p>You can retrieve the ID of any Sandbox Snapshot with <code>snapshot.object_id</code> . To restore from a snapshot by ID, first rehydrate the Snapshot with <code>SandboxSnapshot.from_id</code> and then restore from it:</p> <!> <p>Note that these methods are <em>experimental</em>, and we may change them in the future.</p> <!> <p>When creating a new memory snapshot from a Sandbox that was <em>itself</em> created from a memory snapshot, the new snapshot inherits the expiration date of the original snapshot.
This means a “chain” of snapshotted state can only ever become as old as the expiration date of the first snapshot in the series.</p> <p>For example, snapshot_2 in the following example would only be valid for 3 days after creation:</p> <!> <!> <ul><li>Sandbox Memory Snapshots expire 7 days after creation (see <!>). For longer persisting snapshots, try <!>.</li> <li>Open TCP connections will be closed automatically when a Snapshot is taken, and will need to be reopened when the Snapshot is restored.</li> <li>Snapshotting a Sandbox will currently cause it to terminate. We intend to remove this limitation soon.</li> <li>Sandboxes created with <code>_experimental_enable_snapshot=True</code> or restored from Snapshots cannot run with GPUs.</li> <li>It is not possible to snapshot a Sandbox while a <code>Sandbox.exec</code> command is still running. Furthermore, any background processes launched by a call to <code>Sandbox.exec</code> will not be properly restored after a snapshot.</li> <li>Sandbox memory snapshots can only be restored on the same exact instance type that the original Sandbox was run on. Given Modal’s diverse fleet of capacity, this can sometimes lead to scheduling delays, especially when memory snapshots are combined with narrow region pinning.</li></ul> <!> <p>To persist state across Sandbox sessions, you need to:</p> <ol><li><strong>Trigger the snapshot.</strong> Snapshots are triggered from outside the Sandbox, typically just before termination. A common pattern is to run an exec process inside the Sandbox and wait for it to exit. Once it does, the controller takes a snapshot and terminates the Sandbox.</li> <li><strong>Store the snapshot ID.</strong> The <code>object_id</code> string must be persisted so you can restore from it later. This is typically keyed by a session or user ID, and can be stored in your database, an external key-value store, or a <!>.</li></ol> <p>The following example shows this pattern. This code would typically run in a Modal Function or your own backend, orchestrating the Sandbox:</p> <!> <!> <p>Since both Filesystem and Directory Snapshots are <!>, you can delete them using the image deletion API. This is useful for managing storage or complying with data retention policies.</p> <!> <!> <p>To delete snapshots, you need to track the image IDs yourself (e.g., in a database or <!>), since there is currently no API to list all snapshots you have created.</p>`,1);function y(t,g){let _=ee(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>_,()=>h,{children:(t,ee)=>{var a=le(),f=te(a);ne(f,{id:`snapshots`,children:(e,t)=>{s(),i(e,r(`Snapshots`))},$$slots:{default:!0}});var h=o(f,8),g=e(h);p(e(g),{href:`#filesystem-snapshots`,children:(e,t)=>{s(),i(e,r(`Filesystem Snapshots`))},$$slots:{default:!0}}),n(g);var _=o(g,2);p(e(_),{href:`#directory-snapshots`,children:(e,t)=>{s(),i(e,r(`Directory Snapshots`))},$$slots:{default:!0}}),n(_);var v=o(_,2);p(e(v),{href:`#memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}}),n(v),n(h);var y=o(h,2);l(y,{id:`snapshot-retention`,children:(e,t)=>{s(),i(e,r(`Snapshot Retention`))},$$slots:{default:!0}});var ue=o(y,4);re(ue,{children:(e,t)=>{var n=ie();s(2),i(e,n)},$$slots:{default:!0}});var b=o(ue,2);c(b,{variant:`warning`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}});var x=o(b,2);p(o(e(x)),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{s(),i(e,r(`Images`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,4);m(S,{python:e=>{d(e,{code:`%23%20Filesystem%20snapshot%20with%20custom%20TTL%20of%207%20days%0Aimage%20%3D%20sb.snapshot_filesystem(ttl%3D7%20*%2024%20*%203600)%0A%0A%23%20Filesystem%20snapshot%20with%20no%20expiry%20(retain%20indefinitely%2C%20like%20the%20pre-v1.5%20default)%0Aimage%20%3D%20sb.snapshot_filesystem(ttl%3DNone)%0A%0A%23%20Directory%20snapshot%20with%20custom%20TTL%20of%207%20days%0Asnapshot%20%3D%20sb.snapshot_directory(%22%2Fproject%22%2C%20ttl%3D7%20*%2024%20*%203600)%0A%0A%23%20Directory%20snapshot%20with%20no%20expiry%0Asnapshot%20%3D%20sb.snapshot_directory(%22%2Fproject%22%2C%20ttl%3DNone)`,lang:`python`})},javascript:e=>{d(e,{code:`%2F%2F%20Filesystem%20snapshot%20with%20custom%20TTL%20of%207%20days%0Alet%20image%20%3D%20await%20sb.snapshotFilesystem(%7B%20ttlMs%3A%207%20*%2024%20*%203600%20*%201000%20%7D)%3B%0A%0A%2F%2F%20Filesystem%20snapshot%20with%20no%20expiry%20(retain%20indefinitely%2C%20like%20the%20pre-v0.8.0%20default)%0Aimage%20%3D%20await%20sb.snapshotFilesystem(%7B%20ttlMs%3A%20null%20%7D)%3B%0A%0A%2F%2F%20Directory%20snapshot%20with%20custom%20TTL%20of%207%20days%0Alet%20snapshot%20%3D%20await%20sb.snapshotDirectory(%22%2Fproject%22%2C%20%7B%0A%20%20ttlMs%3A%207%20*%2024%20*%203600%20*%201000%2C%0A%7D)%3B%0A%0A%2F%2F%20Directory%20snapshot%20with%20no%20expiry%0Asnapshot%20%3D%20await%20sb.snapshotDirectory(%22%2Fproject%22%2C%20%7B%20ttlMs%3A%20null%20%7D)%3B`,lang:`javascript`})},go:e=>{d(e,{code:`%2F%2F%20Filesystem%20snapshot%20with%20custom%20TTL%20of%207%20days%0Aimage%2C%20_%20%3A%3D%20sb.SnapshotFilesystem(ctx%2C%20%26modal.SandboxSnapshotFilesystemParams%7B%0A%20%20%20%20TTL%3A%207%20*%2024%20*%20time.Hour%2C%0A%7D)%0A%0A%2F%2F%20Filesystem%20snapshot%20with%20no%20expiry%20(retain%20indefinitely%2C%20like%20the%20pre-v0.8.0%20default)%0Aimage%2C%20_%20%3D%20sb.SnapshotFilesystem(ctx%2C%20%26modal.SandboxSnapshotFilesystemParams%7B%0A%20%20%20%20TTL%3A%20modal.NoExpiryTTL%2C%0A%7D)%0A%0A%2F%2F%20Directory%20snapshot%20with%20custom%20TTL%20of%207%20days%0Asnapshot%2C%20_%20%3A%3D%20sb.SnapshotDirectory(ctx%2C%20%22%2Fproject%22%2C%20%26modal.SandboxSnapshotDirectoryParams%7B%0A%20%20%20%20TTL%3A%207%20*%2024%20*%20time.Hour%2C%0A%7D)%0A%0A%2F%2F%20Directory%20snapshot%20with%20no%20expiry%0Asnapshot%2C%20_%20%3D%20sb.SnapshotDirectory(ctx%2C%20%22%2Fproject%22%2C%20%26modal.SandboxSnapshotDirectoryParams%7B%0A%20%20%20%20TTL%3A%20modal.NoExpiryTTL%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var C=o(S,4);p(o(e(C)),{href:`#deleting-snapshots`,children:(e,t)=>{s(),i(e,r(`Deleting Snapshots`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);l(w,{id:`filesystem-snapshots`,children:(e,t)=>{s(),i(e,r(`Filesystem Snapshots`))},$$slots:{default:!0}});var T=o(w,2);p(o(e(T)),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{s(),i(e,r(`Images`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);p(o(e(E)),{href:`/docs/sdk/py/latest/Sandbox#snapshot_filesystem`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);d(D,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-fs-snapshot-test%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20'test'%20%3E%20%2Ftest%22)%0Ap.wait()%0Aassert%20p.returncode%20%3D%3D%200%2C%20%22failed%20to%20write%20to%20file%22%0Aimage%20%3D%20sb.snapshot_filesystem()%0Asb.terminate()%0A%0Asb2%20%3D%20modal.Sandbox.create(image%3Dimage%2C%20app%3Dapp)%0Ap2%20%3D%20sb2.exec(%22bash%22%2C%20%22-c%22%2C%20%22cat%20%2Ftest%22)%0Aassert%20p2.stdout.read().strip()%20%3D%3D%20%22test%22`,lang:`python`});var O=o(D,4),k=o(e(O));p(k,{href:`#snapshot-retention`,children:(e,t)=>{s(),i(e,r(`Snapshot Retention`))},$$slots:{default:!0}}),p(o(k,2),{href:`#deleting-snapshots`,children:(e,t)=>{s(),i(e,r(`Deleting Snapshots`))},$$slots:{default:!0}}),s(),n(O);var A=o(O,2);l(A,{id:`directory-snapshots`,children:(e,t)=>{s(),i(e,r(`Directory Snapshots`))},$$slots:{default:!0}});var j=o(A,4),M=o(e(j),2);p(o(e(M),2),{href:`/docs/examples/sandbox_pool`,children:(e,t)=>{s(),i(e,r(`warm pool`))},$$slots:{default:!0}}),s(),n(M),s(2),n(j);var N=o(j,2);u(N,{id:`usage`,children:(e,t)=>{s(),i(e,r(`Usage`))},$$slots:{default:!0}});var P=o(N,2);p(o(e(P),7),{href:`/docs/guide/customer-supplied-encryption-keys#directory-snapshots`,children:(e,t)=>{s(),i(e,r(`Customer Supplied Encryption Keys`))},$$slots:{default:!0}}),s(),n(P);var de=o(P,2);m(de,{python:e=>{d(e,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%23%20Write%20some%20dummy%20data%0Asb.exec(%22bash%22%2C%20%22-c%22%2C%20%22mkdir%20%2Fproject%20%26%26%20echo%20'data'%20%3E%20%2Fproject%2Ffile.txt%22).wait()%0A%0A%23%20Snapshot%20the%20directory%0Asnapshot%20%3D%20sb.snapshot_directory(%22%2Fproject%22)%0A%0A%23%20Ok%20to%20throw%20away%20the%20old%20Sandbox%20at%20this%20point%0Asb.terminate()%0A%0A%23%20Mount%20the%20snapshot%20in%20a%20new%20Sandbox%0Asb2%20%3D%20modal.Sandbox.create(app%3Dapp)%0Atry%3A%0A%20%20%20%20sb2.mount_image(%22%2Fproject%22%2C%20snapshot)%0Aexcept%20modal.exception.NotFoundError%3A%0A%20%20%20%20%23%20Handle%20a%20potential%20ttl%20expiry%20of%20the%20old%20snapshot%20here%0A%20%20%20%20...%0A%0A%23%20The%20Sandbox%20now%20has%20access%20to%20the%20previous%20project%20state%0Aassert%20sb2.exec(%22cat%22%2C%20%22%2Fproject%2Ffile.txt%22).stdout.read().strip()%20%3D%3D%20%22data%22%0A`,lang:`python`})},javascript:e=>{d(e,{code:`import%20%7B%20NotFoundError%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0A%2F%2F%20Write%20some%20dummy%20data%0Aconst%20p%20%3D%20await%20sb.exec(%5B%0A%20%20%22bash%22%2C%0A%20%20%22-c%22%2C%0A%20%20%22mkdir%20%2Fproject%20%26%26%20echo%20'data'%20%3E%20%2Fproject%2Ffile.txt%22%2C%0A%5D)%3B%0Aawait%20p.wait()%3B%0A%0A%2F%2F%20Snapshot%20the%20directory%0Aconst%20snapshot%20%3D%20await%20sb.snapshotDirectory(%22%2Fproject%22)%3B%0A%0A%2F%2F%20Ok%20to%20throw%20away%20the%20old%20Sandbox%20at%20this%20point%0Aawait%20sb.terminate()%3B%0Asb.detach()%3B%0A%0A%2F%2F%20Mount%20the%20snapshot%20in%20a%20new%20Sandbox%0Aconst%20sb2%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0Atry%20%7B%0A%20%20await%20sb2.mountImage(%22%2Fproject%22%2C%20snapshot)%3B%0A%7D%20catch%20(e)%20%7B%0A%20%20if%20(e%20instanceof%20NotFoundError)%20%7B%0A%20%20%20%20%2F%2F%20Handle%20a%20potential%20ttl%20expiry%20of%20the%20old%20snapshot%20here%0A%20%20%7D%0A%7D%0A%0A%2F%2F%20The%20Sandbox%20now%20has%20access%20to%20the%20previous%20project%20state%0Aconst%20p2%20%3D%20await%20sb2.exec(%5B%22cat%22%2C%20%22%2Fproject%2Ffile.txt%22%5D)%3B%0Aconsole.assert((await%20p2.stdout.readText()).trim()%20%3D%3D%3D%20%22data%22)%3B%0Asb2.detach()%3B`,lang:`javascript`})},go:e=>{d(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0Adefer%20sb.Detach()%0A%0A%2F%2F%20Write%20some%20dummy%20data%0Ap%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22bash%22%2C%20%22-c%22%2C%20%22mkdir%20%2Fproject%20%26%26%20echo%20'data'%20%3E%20%2Fproject%2Ffile.txt%22%7D%2C%20nil)%0Ap.Wait(ctx%2C%20nil)%0A%0A%2F%2F%20Snapshot%20the%20directory%0Asnapshot%2C%20_%20%3A%3D%20sb.SnapshotDirectory(ctx%2C%20%22%2Fproject%22%2C%20nil)%0A%0A%2F%2F%20Ok%20to%20throw%20away%20the%20old%20Sandbox%20at%20this%20point%0Asb.Terminate(ctx%2C%20nil)%0A%0A%2F%2F%20Mount%20the%20snapshot%20in%20a%20new%20Sandbox%0Asb2%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0Adefer%20sb2.Detach()%0A%0Aif%20err%20%3A%3D%20sb2.MountImage(ctx%2C%20%22%2Fproject%22%2C%20snapshot%2C%20nil)%3B%20err%20!%3D%20nil%20%7B%0A%20%20var%20notFound%20modal.NotFoundError%0A%20%20if%20errors.As(err%2C%20%C2%ACFound)%20%7B%0A%20%20%20%20%2F%2F%20Handle%20a%20potential%20ttl%20expiry%20of%20the%20old%20snapshot%20here%0A%20%20%7D%0A%7D%0A%0A%2F%2F%20The%20Sandbox%20now%20has%20access%20to%20the%20previous%20project%20state%0Ap2%2C%20_%20%3A%3D%20sb2.Exec(ctx%2C%20%5B%5Dstring%7B%22cat%22%2C%20%22%2Fproject%2Ffile.txt%22%7D%2C%20nil)%0Astdout%2C%20_%20%3A%3D%20io.ReadAll(p2.Stdout)%0Afmt.Println(strings.TrimSpace(string(stdout)))%20%2F%2F%20%22data%22`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var F=o(de,2);u(F,{id:`unmounting-a-mounted-image`,children:(e,t)=>{s(),i(e,r(`Unmounting a mounted Image`))},$$slots:{default:!0}});var I=o(F,4);m(I,{python:e=>{d(e,{code:`sb2.unmount_image(%22%2Fproject%22)`,lang:`python`})},javascript:e=>{d(e,{code:`await%20sb2.unmountImage(%22%2Fproject%22)%3B`,lang:`javascript`})},go:e=>{d(e,{code:`_%20%3D%20sb2.UnmountImage(ctx%2C%20%22%2Fproject%22%2C%20nil)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var L=o(I,2);l(L,{id:`memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}});var R=o(L,2);c(R,{variant:`alpha`,children:(t,ee)=>{var a=se();p(o(e(a)),{href:`#limitations`,children:(e,t)=>{s(),i(e,r(`limitations`))},$$slots:{default:!0}}),s(),n(a),i(t,a)},$$slots:{default:!0}});var z=o(R,6);d(z,{code:`image%20%3D%20modal.Image.debian_slim().apt_install(%22curl%22%2C%20%22procps%22)%0Aapp%20%3D%20modal.App.lookup(%22sandbox-snapshot%22%2C%20create_if_missing%3DTrue)%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%22python3%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228000%22%2C%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%20image%3Dimage%2C%20_experimental_enable_snapshot%3DTrue%0A%20%20%20%20)%0A%0Aprint(f%22Performing%20snapshot%20of%20%7Bsb.object_id%7D%20...%22)%0Asnapshot%20%3D%20sb._experimental_snapshot()`,lang:`python`});var B=o(z,4);d(B,{code:`print(f%22Restoring%20from%20snapshot%20%7Bsb.object_id%7D%20...%22)%0Asb2%20%3D%20modal.Sandbox._experimental_from_snapshot(snapshot)%0A%0Aprint(%22Let's%20see%20that%20the%20http.server%20is%20still%20running...%22)%0Ap%20%3D%20sb2.exec(%22ps%22%2C%20%22aux%22)%0Aprint(p.stdout.read())%0A%0A%23%20Talk%20to%20snapshotted%20Sandbox%20http.server%0Ap%20%3D%20sb2.exec(%22curl%22%2C%20%22http%3A%2F%2Flocalhost%3A8000%2F%22)%0Areply%20%3D%20p.stdout.read()%0Aprint(reply)%20%20%23%20%3C!DOCTYPE%20HTML%3E%3Chtml%20lang...`,lang:`python`});var V=o(B,6);d(V,{code:`snapshot_id%20%3D%20snapshot.object_id%0A%23%20...%20save%20the%20Sandbox%20ID%20(sb-123abc)%20for%20later%0A%23%20sometime%20in%20the%20future...%0Asnapshot%20%3D%20modal.SandboxSnapshot.from_id(snapshot_id)%0Asandbox%20%3D%20modal.Sandbox._experimental_from_snapshot(snapshot)`,lang:`python`});var H=o(V,4);u(H,{id:`re-snapshotting`,children:(e,t)=>{s(),i(e,r(`Re-snapshotting`))},$$slots:{default:!0}});var U=o(H,6);d(U,{code:`sandbox_1%20%3D%20modal.Sandbox.create(_experimental_enable_snapshot%3DTrue)%0A%0A%23%20snapshot_1%20has%20a%20lifetime%20of%207%20days%20from%20creation%0Asnapshot_1%20%3D%20sandbox_1._experimental_snapshot()%0A%0A%23%204%20days%20later%20we%20do%20a%20restore%20%2B%20snapshot%20from%20snapshot_1%0Aprint(f%22Restoring%20from%20snapshot%20%7Bsnapshot_1.object_id%7D%20...%22)%0Asandbox_2%20%3D%20modal.Sandbox._experimental_from_snapshot(snapshot_1)%0Asnapshot_2%20%3D%20sandbox_2._experimental_snapshot()%0A%23%20snapshot_2%20now%20has%20a%20lifetime%20of%207%20-%204%20%3D%203%20days%20from%20creation`,lang:`python`});var W=o(U,2);u(W,{id:`limitations`,children:(e,t)=>{s(),i(e,r(`Limitations`))},$$slots:{default:!0}});var G=o(W,2),K=e(G),q=o(e(K));p(q,{href:`#snapshot-retention`,children:(e,t)=>{s(),i(e,r(`Snapshot Retention`))},$$slots:{default:!0}}),p(o(q,2),{href:`#filesystem-snapshots`,children:(e,t)=>{s(),i(e,r(`Filesystem Snapshots`))},$$slots:{default:!0}}),s(),n(K),s(10),n(G);var J=o(G,2);l(J,{id:`persisting-sandbox-state`,children:(e,t)=>{s(),i(e,r(`Persisting Sandbox State`))},$$slots:{default:!0}});var Y=o(J,4),X=o(e(Y),2);p(o(e(X),4),{href:`/docs/guide/dicts`,children:(e,t)=>{s(),i(e,r(`Modal Dict`))},$$slots:{default:!0}}),s(),n(X),n(Y);var Z=o(Y,4);d(Z,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-snapshot-lifecycle%22%2C%20create_if_missing%3DTrue)%0Asnapshot_store%20%3D%20modal.Dict.from_name(%22sandbox-snapshots%22%2C%20create_if_missing%3DTrue)%0Asession_id%20%3D%20%22sess_a1b2c3d4%22%0A%0A%23%20Restore%20from%20snapshot%2C%20or%20use%20base%20image%0Aif%20session_id%20in%20snapshot_store%3A%0A%20%20%20%20image%20%3D%20modal.Image.from_id(snapshot_store%5Bsession_id%5D)%0Aelse%3A%0A%20%20%20%20image%20%3D%20modal.Image.debian_slim()%0A%0Asb%20%3D%20modal.Sandbox.create(image%3Dimage%2C%20app%3Dapp)%0A%0A%23%20Run%20agent%20which%20exits%20when%20ready%20to%20be%20snapshotted%0Ap%20%3D%20sb.exec(%22python%22%2C%20%22agent.py%22)%0Ap.wait()%0A%0A%23%20Snapshot%20and%20store%20the%20object_id%0Asnapshot_store%5Bsession_id%5D%20%3D%20sb.snapshot_filesystem().object_id%0Asb.terminate()`,lang:`python`});var Q=o(Z,2);l(Q,{id:`deleting-snapshots`,children:(e,t)=>{s(),i(e,r(`Deleting Snapshots`))},$$slots:{default:!0}});var $=o(Q,2);p(o(e($)),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{s(),i(e,r(`Images`))},$$slots:{default:!0}}),s(),n($);var fe=o($,2);c(fe,{variant:`warning`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}});var pe=o(fe,2);m(pe,{python:e=>{d(e,{code:`import%20modal.experimental%0A%0A%23%20Get%20the%20image%20ID%20from%20a%20filesystem%20or%20directory%20snapshot%0Aimage%20%3D%20sb.snapshot_filesystem()%0A%23%20or%3A%20image%20%3D%20sb.snapshot_directory(%22%2Fproject%22)%0Aimage_id%20%3D%20image.object_id%20%20%23%20e.g.%2C%20%22im-abc123%22%0A%0A%23%20Later%2C%20delete%20the%20snapshot%20when%20no%20longer%20needed%0Amodal.experimental.image_delete(image_id)`,lang:`python`})},javascript:e=>{d(e,{code:`%2F%2F%20Get%20the%20image%20ID%20from%20a%20filesystem%20or%20directory%20snapshot%0Aconst%20image%20%3D%20await%20sb.snapshotFilesystem()%3B%0A%2F%2F%20or%3A%20const%20image%20%3D%20await%20sb.snapshotDirectory(%22%2Fproject%22)%3B%0Aconst%20imageId%20%3D%20image.imageId%3B%20%2F%2F%20e.g.%2C%20%22im-abc123%22%0A%0A%2F%2F%20Later%2C%20delete%20the%20snapshot%20when%20no%20longer%20needed%0Aawait%20modal.images.delete(imageId)%3B`,lang:`javascript`})},go:e=>{d(e,{code:`%2F%2F%20Get%20the%20image%20ID%20from%20a%20filesystem%20or%20directory%20snapshot%0Aimage%2C%20_%20%3A%3D%20sb.SnapshotFilesystem(ctx%2C%20nil)%0A%2F%2F%20or%3A%20image%2C%20_%20%3A%3D%20sb.SnapshotDirectory(ctx%2C%20%22%2Fproject%22%2C%20nil)%0AimageId%20%3A%3D%20image.ImageID%20%2F%2F%20e.g.%2C%20%22im-abc123%22%0A%0A%2F%2F%20Later%2C%20delete%20the%20snapshot%20when%20no%20longer%20needed%0Amc.Images.Delete(ctx%2C%20imageId%2C%20nil)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var me=o(pe,2);p(o(e(me)),{href:`/docs/guide/dicts`,children:(e,t)=>{s(),i(e,r(`Modal Dict`))},$$slots:{default:!0}}),s(),n(me),i(t,a)},$$slots:{default:!0}}))}export{y as default,h as metadata};
//# sourceMappingURL=ugjyD1x22.js.map
