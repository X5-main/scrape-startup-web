(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ec3ec49a-c5b4-4edc-ac45-8bed1e2050c8`,e._sentryDebugIdIdentifier=`sentry-dbid-ec3ec49a-c5b4-4edc-ac45-8bed1e2050c8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";import{t as _}from"./D0Ft4u302.js";var v={toc:[{depth:1,value:`Filesystem Access`,id:`filesystem-access`,children:[{depth:2,value:`Filesystem API`,id:`filesystem-api`},{depth:2,value:`Using Volumes`,id:`using-volumes`,children:[{depth:3,value:`Mounting a subdirectory`,id:`mounting-a-subdirectory`},{depth:3,value:`Committing Volume changes with sync (v2 only)`,id:`committing-volume-changes-with-sync-v2-only`}]},{depth:2,value:`Adding files to an Image`,id:`adding-files-to-an-image`}]}],rawContent:`# Filesystem Access

There are multiple options for uploading files to a Sandbox and accessing them
from outside the Sandbox.

## Filesystem API

The most convenient way to pass data in and out of the Sandbox during
execution is to use our filesystem API:

<CodeTabs>
  {#snippet python()}

\`\`\`python
import modal

app = modal.App.lookup("sandbox-fs-demo", create_if_missing=True)

sb = modal.Sandbox.create(app=app)

# Write text to a file in the Sandbox.
sb.filesystem.write_text("Hello World!\\n", "/tmp/test.txt")

# Read the file back from the Sandbox into a string.
contents = sb.filesystem.read_text("/tmp/test.txt")
print(contents)

sb.terminate()
sb.detach()
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("sandbox-fs-demo", {
  createIfMissing: true,
});
const image = modal.images.fromRegistry("python:3.13-slim");

const sb = await modal.sandboxes.create(app, image);

// Write text to a file in the Sandbox.
await sb.filesystem.writeText("Hello World!\\n", "/tmp/test.txt");

// Read the file back from the Sandbox into a string.
const contents = await sb.filesystem.readText("/tmp/test.txt");
console.log(contents);

await sb.terminate();
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
package main

import (
	"context"
	"fmt"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	ctx := context.Background()
	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "sandbox-fs-demo", &modal.AppFromNameParams{
		CreateIfMissing: true,
	})
	image := mc.Images.FromRegistry("python:3.13-slim", nil)

	sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
	defer sb.Terminate(ctx, nil)

	fs := sb.Filesystem

	// Write text to a file in the Sandbox.
	fs.WriteText(ctx, "Hello World!\\n", "/tmp/test.txt", nil)

	// Read the file back from the Sandbox into a string.
	contents, _ := fs.ReadText(ctx, "/tmp/test.txt", nil)
	fmt.Println(contents)
}
\`\`\`

{/snippet}
</CodeTabs>

It has convenience APIs for streaming file copies in both directions:

<CodeTabs>
  {#snippet python()}

\`\`\`python
from pathlib import Path
import modal

# Write a local file.
with open("local-file.txt", "w") as f:
    f.write("Hello World!\\n")

app = modal.App.lookup("sandbox-fs-demo", create_if_missing=True)

sb = modal.Sandbox.create(app=app)

# Copy the local file into the Sandbox.
sb.filesystem.copy_from_local("local-file.txt", "/tmp/file-in-sandbox.txt")

# Copy it back to the local filesystem.
sb.filesystem.copy_to_local("/tmp/file-in-sandbox.txt", "local-file-copy.txt")

print(Path("local-file-copy.txt").read_text())

sb.terminate()
sb.detach()
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { readFile, writeFile } from "node:fs/promises";

const sb = await modal.sandboxes.create(app, image);

// Write a local file.
await writeFile("local-file.txt", "Hello World!\\n", "utf-8");

// Copy the local file into the Sandbox.
await sb.filesystem.copyFromLocal("local-file.txt", "/tmp/file-in-sandbox.txt");

// Copy it back to the local filesystem.
await sb.filesystem.copyToLocal(
  "/tmp/file-in-sandbox.txt",
  "local-file-copy.txt",
);

console.log(await readFile("local-file-copy.txt", "utf-8"));

await sb.terminate();
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
defer sb.Terminate(ctx, nil)

fs := sb.Filesystem

// Write a local file.
os.WriteFile("local-file.txt", []byte("Hello World!\\n"), 0o644)

// Copy the local file into the Sandbox.
fs.CopyFromLocal(ctx, "local-file.txt", "/tmp/file-in-sandbox.txt", nil)

// Copy it back to the local filesystem.
fs.CopyToLocal(ctx, "/tmp/file-in-sandbox.txt", "local-file-copy.txt", nil)

data, _ := os.ReadFile("local-file-copy.txt")
fmt.Println(string(data))
\`\`\`

{/snippet}
</CodeTabs>

It also offers APIs for inspecting and managing files:

<CodeTabs>
  {#snippet python()}

\`\`\`python
import modal

app = modal.App.lookup("sandbox-fs-demo", create_if_missing=True)

sb = modal.Sandbox.create(app=app)

# Set up a structured project.
sb.filesystem.make_directory("/tmp/project/results")

# Let the Sandbox do some work and write outputs to files.
sb.filesystem.write_text("42\\n", "/tmp/project/results/answer.txt")
sb.filesystem.write_text("debug info\\n", "/tmp/project/results/debug.log")

# Inspect what was produced.
for entry in sb.filesystem.list_files("/tmp/project/results"):
    print(entry.name, entry.type.value, entry.size)

# Check that the result file has content before downloading it.
info = sb.filesystem.stat("/tmp/project/results/answer.txt")
if info.size > 0:
    answer = sb.filesystem.read_text("/tmp/project/results/answer.txt")
    print(answer)

# Clean up the whole project.
sb.filesystem.remove("/tmp/project", recursive=True)

sb.terminate()
sb.detach()
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image);

// Set up a structured project.
await sb.filesystem.makeDirectory("/tmp/project/results");

// Let the Sandbox do some work and write outputs to files.
await sb.filesystem.writeText("42\\n", "/tmp/project/results/answer.txt");
await sb.filesystem.writeText("debug info\\n", "/tmp/project/results/debug.log");

// Inspect what was produced.
const entries = await sb.filesystem.listFiles("/tmp/project/results");
for (const entry of entries) {
  console.log(entry.name, entry.type, entry.size);
}

// Check that the result file has content before downloading it.
const info = await sb.filesystem.stat("/tmp/project/results/answer.txt");
if (info.size > 0) {
  const answer = await sb.filesystem.readText(
    "/tmp/project/results/answer.txt",
  );
  console.log(answer);
}

// Clean up the whole project.
await sb.filesystem.remove("/tmp/project", { recursive: true });

await sb.terminate();
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
defer sb.Terminate(ctx, nil)

fs := sb.Filesystem

// Set up a structured project.
fs.MakeDirectory(ctx, "/tmp/project/results", nil)

// Let the Sandbox do some work and write outputs to files.
fs.WriteText(ctx, "42\\n", "/tmp/project/results/answer.txt", nil)
fs.WriteText(ctx, "debug info\\n", "/tmp/project/results/debug.log", nil)

// Inspect what was produced.
entries, _ := fs.ListFiles(ctx, "/tmp/project/results", nil)
for _, entry := range entries {
	fmt.Println(entry.Name, entry.Type, entry.Size)
}

// Check that the result file has content before downloading it.
info, _ := fs.Stat(ctx, "/tmp/project/results/answer.txt", nil)
if info.Size > 0 {
	answer, _ := fs.ReadText(ctx, "/tmp/project/results/answer.txt", nil)
	fmt.Println(answer)
}

// Clean up the whole project.
fs.Remove(ctx, "/tmp/project", &modal.SandboxFilesystemRemoveParams{Recursive: true})
\`\`\`

{/snippet}
</CodeTabs>

These APIs may be used to read files of up to 5GB and write files of any size.

However, if you have a large dataset that you want to use repeatedly from many sandboxes,
consider [using Volumes](#using-volumes).

<Callout variant="info">

Sandbox filesystem access was previously exposed through methods on the \`Sandbox\` and a \`FileIO\` object. This API is now deprecated; consult our [migration guide](/docs/guide/migrate-sandbox-filesystem) to update any code still using the legacy API.

</Callout>

## Using Volumes

It's possible to use Modal [Volume](/docs/sdk/py/latest/Volume)s or
[CloudBucketMount](/docs/guide/cloud-bucket-mounts)s with Sandboxes.

Volumes and CloudBucketMounts allow you to upload data once and access that
data efficiently from many sandboxes.

To access a Volume from a Sandbox, you can use the \`volumes\` parameter of \`Sandbox.create\`:

\`\`\`python notest
# Find or create a Volume with the name "my-volume".
vol = modal.Volume.from_name("my-volume", create_if_missing=True)
sb = modal.Sandbox.create(
    volumes={"/cache": vol},
    app=my_app,
)
# Read a file in the Volume.
p = sb.exec("bash", "-c", "cat /cache/some-file.txt")
print(p.stdout.read())
p.wait()

# Write a file to the Volume.
p = sb.exec("bash", "-c", "echo foo > /cache/a.txt")
p.wait()
sb.terminate(wait=True)
sb.detach()

# Access the Volume file from outside the Sandbox.
for data in vol.read_file("a.txt"):
    print(data)
\`\`\`

File syncing behavior differs between Volumes and CloudBucketMounts. For
Volumes, changes are persisted by [background commits](/docs/guide/volumes#background-commits)
that run every few seconds while the Sandbox executes, with a final commit when
the Sandbox terminates. With Volumes v2, you can also commit explicitly at any point (see
[Committing Volume changes with \`sync\`](#committing-volume-changes-with-sync-v2-only)
below). For CloudBucketMounts, files are synced automatically.

You need to explicitly reload a Volume to see changes made since it was first mounted, by invoking the [.reload_volumes()](/docs/sdk/py/latest/Sandbox#reload_volumes) method on the sandbox object.

### Mounting a subdirectory

You can mount a subdirectory of a Volume instead of the entire Volume using
[\`with_mount_options\`](/docs/guide/volumes#mount-options). This is especially
useful when many Sandboxes share a single Volume but each Sandbox should only
access its own data:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb_app = modal.App.lookup("my-app", create_if_missing=True)

vol = modal.Volume.from_name("shared-volume", create_if_missing=True)

# Each Sandbox only sees its own subdirectory of the Volume.
sb = modal.Sandbox.create(
    volumes={"/data": vol.with_mount_options(sub_path="/users/user_123")},
    app=sb_app,
)
# /data inside the Sandbox maps to /users/user_123 in the Volume.
# The Sandbox cannot see or modify files belonging to other users.
p = sb.exec("bash", "-c", "echo hello > /data/output.txt")
p.wait()
sb.terminate(wait=True)
sb.detach()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const app = await modal.apps.fromName("my-app", {
  createIfMissing: true,
});
const vol = await modal.volumes.fromName("shared-volume", {
  createIfMissing: true,
});
const image = modal.images.fromRegistry("python:3.13-slim");

// Each Sandbox only sees its own subdirectory of the Volume.
const sb = await modal.sandboxes.create(app, image, {
  volumes: { "/data": vol.withMountOptions({ subPath: "/users/user_123" }) },
});
// /data inside the Sandbox maps to /users/user_123 in the Volume.
// The Sandbox cannot see or modify files belonging to other users.
const p = await sb.exec(["bash", "-c", "echo hello > /data/output.txt"]);
await p.wait();
await sb.terminate({ wait: true });
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
app, _ := mc.Apps.FromName(ctx, "volume-subdir-test", &modal.AppFromNameParams{CreateIfMissing: true})

vol, _ := mc.Volumes.FromName(ctx, "shared-volume", &modal.VolumeFromNameParams{
	CreateIfMissing: true,
})
image := mc.Images.FromRegistry("python:3.13-slim", nil)

// Each Sandbox only sees its own subdirectory of the Volume.
subPath := "/users/user_123"
sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Volumes: map[string]*modal.Volume{
		"/data": vol.WithMountOptions(&modal.VolumeMountOptions{SubPath: &subPath}),
	},
})
defer sb.Terminate(ctx, nil)

// /data inside the Sandbox maps to /users/user_123 in the Volume.
// The Sandbox cannot see or modify files belonging to other users.
p, _ := sb.Exec(ctx, []string{"bash", "-c", "echo hello > /data/output.txt"}, nil)
p.Wait(ctx)
\`\`\`

{/snippet}
</CodeTabs>

For more details on Volume mount options, see the
[Volumes guide](/docs/guide/volumes#mount-options).

### Committing Volume changes with \`sync\` (v2 only)

For [Volumes v2](/docs/guide/volumes#volumes-v2-overview), you can explicitly
commit changes at any point during Sandbox execution by running the \`sync\`
command on the mountpoint. This persists all data and metadata changes to the
Volume's storage without waiting for the Sandbox to terminate:

\`\`\`python notest
sb = modal.Sandbox.create(
    volumes={"/data": modal.Volume.from_name("my-v2-volume")},
    app=my_app,
)

# Write files to the volume
sb.exec("bash", "-c", "echo 'hello' > /data/output.txt").wait()

# Commit changes immediately
p = sb.exec("sync", "/data")
p.wait()
if p.returncode != 0:
    raise Exception(f"sync failed with exit code {p.returncode}")

# Changes are now persisted and visible to other containers
sb.terminate()
sb.detach()
\`\`\`

This is particularly useful for long-running Sandboxes where you want to
persist intermediate results, or when you need changes to be visible to other
containers before the Sandbox terminates.

## Adding files to an Image

In some cases, you may want to [add a file to an Image itself](/docs/guide/images#add-local-files-with-add_local_dir-and-add_local_file).
This is useful if the file will be used by many Sandboxes, or if you
want to access that file from the Sandbox's entrypoint command.

This can be done using the
[\`add_local_file\`](/docs/sdk/py/latest/Image#add_local_file) and
[\`add_local_dir\`](/docs/sdk/py/latest/Image#add_local_dir) methods on the
[\`Image\`](/docs/sdk/py/latest/Image) class:

\`\`\`python notest
# Eagerly build the image - otherwise the Image will lazily build when the
# Sandbox is created.
image = (
    modal.Image.debian_slim()
    .add_local_dir(
        local_path="/home/user/my_dir",
        remote_path="/app",
    )
    .build(my_app)
)

sb = modal.Sandbox.create(app=my_app, image=image)
p = sb.exec("ls", "/app")
print(p.stdout.read())
p.wait()
sb.detach()
\`\`\`
`,meta:{title:`Filesystem Access`,description:`There are multiple options for uploading files to a Sandbox and accessing them from outside the Sandbox.`}},{toc:y,rawContent:b,meta:x}=v,S=t(`<p>Sandbox filesystem access was previously exposed through methods on the <code>Sandbox</code> and a <code>FileIO</code> object. This API is now deprecated; consult our <!> to update any code still using the legacy API.</p>`),C=t(`Committing Volume changes with <code>sync</code>`,1),w=t(`<code>with_mount_options</code>`),T=t(`Committing Volume changes with <code>sync</code> (v2 only)`,1),E=t(`<code>add_local_file</code>`),D=t(`<code>add_local_dir</code>`),O=t(`<code>Image</code>`),k=t(`<!> <p>There are multiple options for uploading files to a Sandbox and accessing them
from outside the Sandbox.</p> <!> <p>The most convenient way to pass data in and out of the Sandbox during
execution is to use our filesystem API:</p> <!> <p>It has convenience APIs for streaming file copies in both directions:</p> <!> <p>It also offers APIs for inspecting and managing files:</p> <!> <p>These APIs may be used to read files of up to 5GB and write files of any size.</p> <p>However, if you have a large dataset that you want to use repeatedly from many sandboxes,
consider <!>.</p> <!> <!> <p>It’s possible to use Modal <!>s or <!>s with Sandboxes.</p> <p>Volumes and CloudBucketMounts allow you to upload data once and access that
data efficiently from many sandboxes.</p> <p>To access a Volume from a Sandbox, you can use the <code>volumes</code> parameter of <code>Sandbox.create</code>:</p> <!> <p>File syncing behavior differs between Volumes and CloudBucketMounts. For
Volumes, changes are persisted by <!> that run every few seconds while the Sandbox executes, with a final commit when
the Sandbox terminates. With Volumes v2, you can also commit explicitly at any point (see <!> below). For CloudBucketMounts, files are synced automatically.</p> <p>You need to explicitly reload a Volume to see changes made since it was first mounted, by invoking the <!> method on the sandbox object.</p> <!> <p>You can mount a subdirectory of a Volume instead of the entire Volume using <!>. This is especially
useful when many Sandboxes share a single Volume but each Sandbox should only
access its own data:</p> <!> <p>For more details on Volume mount options, see the <!>.</p> <!> <p>For <!>, you can explicitly
commit changes at any point during Sandbox execution by running the <code>sync</code> command on the mountpoint. This persists all data and metadata changes to the
Volume’s storage without waiting for the Sandbox to terminate:</p> <!> <p>This is particularly useful for long-running Sandboxes where you want to
persist intermediate results, or when you need changes to be visible to other
containers before the Sandbox terminates.</p> <!> <p>In some cases, you may want to <!>.
This is useful if the file will be used by many Sandboxes, or if you
want to access that file from the Sandbox’s entrypoint command.</p> <p>This can be done using the <!> and <!> methods on the <!> class:</p> <!>`,1);function A(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>b,()=>v,{children:(t,a)=>{var o=k(),h=s(o);p(h,{id:`filesystem-access`,children:(e,t)=>{l(),i(e,r(`Filesystem Access`))},$$slots:{default:!0}});var v=c(h,4);d(v,{id:`filesystem-api`,children:(e,t)=>{l(),i(e,r(`Filesystem API`))},$$slots:{default:!0}});var y=c(v,4);_(y,{python:e=>{m(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-fs-demo%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0A%23%20Write%20text%20to%20a%20file%20in%20the%20Sandbox.%0Asb.filesystem.write_text(%22Hello%20World!%5Cn%22%2C%20%22%2Ftmp%2Ftest.txt%22)%0A%0A%23%20Read%20the%20file%20back%20from%20the%20Sandbox%20into%20a%20string.%0Acontents%20%3D%20sb.filesystem.read_text(%22%2Ftmp%2Ftest.txt%22)%0Aprint(contents)%0A%0Asb.terminate()%0Asb.detach()`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22sandbox-fs-demo%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0A%0A%2F%2F%20Write%20text%20to%20a%20file%20in%20the%20Sandbox.%0Aawait%20sb.filesystem.writeText(%22Hello%20World!%5Cn%22%2C%20%22%2Ftmp%2Ftest.txt%22)%3B%0A%0A%2F%2F%20Read%20the%20file%20back%20from%20the%20Sandbox%20into%20a%20string.%0Aconst%20contents%20%3D%20await%20sb.filesystem.readText(%22%2Ftmp%2Ftest.txt%22)%3B%0Aconsole.log(contents)%3B%0A%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%09%22fmt%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22sandbox-fs-demo%22%2C%20%26modal.AppFromNameParams%7B%0A%09%09CreateIfMissing%3A%20true%2C%0A%09%7D)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil)%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0A%09defer%20sb.Terminate(ctx%2C%20nil)%0A%0A%09fs%20%3A%3D%20sb.Filesystem%0A%0A%09%2F%2F%20Write%20text%20to%20a%20file%20in%20the%20Sandbox.%0A%09fs.WriteText(ctx%2C%20%22Hello%20World!%5Cn%22%2C%20%22%2Ftmp%2Ftest.txt%22%2C%20nil)%0A%0A%09%2F%2F%20Read%20the%20file%20back%20from%20the%20Sandbox%20into%20a%20string.%0A%09contents%2C%20_%20%3A%3D%20fs.ReadText(ctx%2C%20%22%2Ftmp%2Ftest.txt%22%2C%20nil)%0A%09fmt.Println(contents)%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var b=c(y,4);_(b,{python:e=>{m(e,{code:`from%20pathlib%20import%20Path%0Aimport%20modal%0A%0A%23%20Write%20a%20local%20file.%0Awith%20open(%22local-file.txt%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20f.write(%22Hello%20World!%5Cn%22)%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-fs-demo%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0A%23%20Copy%20the%20local%20file%20into%20the%20Sandbox.%0Asb.filesystem.copy_from_local(%22local-file.txt%22%2C%20%22%2Ftmp%2Ffile-in-sandbox.txt%22)%0A%0A%23%20Copy%20it%20back%20to%20the%20local%20filesystem.%0Asb.filesystem.copy_to_local(%22%2Ftmp%2Ffile-in-sandbox.txt%22%2C%20%22local-file-copy.txt%22)%0A%0Aprint(Path(%22local-file-copy.txt%22).read_text())%0A%0Asb.terminate()%0Asb.detach()`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20readFile%2C%20writeFile%20%7D%20from%20%22node%3Afs%2Fpromises%22%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0A%0A%2F%2F%20Write%20a%20local%20file.%0Aawait%20writeFile(%22local-file.txt%22%2C%20%22Hello%20World!%5Cn%22%2C%20%22utf-8%22)%3B%0A%0A%2F%2F%20Copy%20the%20local%20file%20into%20the%20Sandbox.%0Aawait%20sb.filesystem.copyFromLocal(%22local-file.txt%22%2C%20%22%2Ftmp%2Ffile-in-sandbox.txt%22)%3B%0A%0A%2F%2F%20Copy%20it%20back%20to%20the%20local%20filesystem.%0Aawait%20sb.filesystem.copyToLocal(%0A%20%20%22%2Ftmp%2Ffile-in-sandbox.txt%22%2C%0A%20%20%22local-file-copy.txt%22%2C%0A)%3B%0A%0Aconsole.log(await%20readFile(%22local-file-copy.txt%22%2C%20%22utf-8%22))%3B%0A%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0Adefer%20sb.Terminate(ctx%2C%20nil)%0A%0Afs%20%3A%3D%20sb.Filesystem%0A%0A%2F%2F%20Write%20a%20local%20file.%0Aos.WriteFile(%22local-file.txt%22%2C%20%5B%5Dbyte(%22Hello%20World!%5Cn%22)%2C%200o644)%0A%0A%2F%2F%20Copy%20the%20local%20file%20into%20the%20Sandbox.%0Afs.CopyFromLocal(ctx%2C%20%22local-file.txt%22%2C%20%22%2Ftmp%2Ffile-in-sandbox.txt%22%2C%20nil)%0A%0A%2F%2F%20Copy%20it%20back%20to%20the%20local%20filesystem.%0Afs.CopyToLocal(ctx%2C%20%22%2Ftmp%2Ffile-in-sandbox.txt%22%2C%20%22local-file-copy.txt%22%2C%20nil)%0A%0Adata%2C%20_%20%3A%3D%20os.ReadFile(%22local-file-copy.txt%22)%0Afmt.Println(string(data))`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var x=c(b,4);_(x,{python:e=>{m(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-fs-demo%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0A%23%20Set%20up%20a%20structured%20project.%0Asb.filesystem.make_directory(%22%2Ftmp%2Fproject%2Fresults%22)%0A%0A%23%20Let%20the%20Sandbox%20do%20some%20work%20and%20write%20outputs%20to%20files.%0Asb.filesystem.write_text(%2242%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22)%0Asb.filesystem.write_text(%22debug%20info%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fdebug.log%22)%0A%0A%23%20Inspect%20what%20was%20produced.%0Afor%20entry%20in%20sb.filesystem.list_files(%22%2Ftmp%2Fproject%2Fresults%22)%3A%0A%20%20%20%20print(entry.name%2C%20entry.type.value%2C%20entry.size)%0A%0A%23%20Check%20that%20the%20result%20file%20has%20content%20before%20downloading%20it.%0Ainfo%20%3D%20sb.filesystem.stat(%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22)%0Aif%20info.size%20%3E%200%3A%0A%20%20%20%20answer%20%3D%20sb.filesystem.read_text(%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22)%0A%20%20%20%20print(answer)%0A%0A%23%20Clean%20up%20the%20whole%20project.%0Asb.filesystem.remove(%22%2Ftmp%2Fproject%22%2C%20recursive%3DTrue)%0A%0Asb.terminate()%0Asb.detach()`,lang:`python`})},javascript:e=>{m(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0A%0A%2F%2F%20Set%20up%20a%20structured%20project.%0Aawait%20sb.filesystem.makeDirectory(%22%2Ftmp%2Fproject%2Fresults%22)%3B%0A%0A%2F%2F%20Let%20the%20Sandbox%20do%20some%20work%20and%20write%20outputs%20to%20files.%0Aawait%20sb.filesystem.writeText(%2242%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22)%3B%0Aawait%20sb.filesystem.writeText(%22debug%20info%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fdebug.log%22)%3B%0A%0A%2F%2F%20Inspect%20what%20was%20produced.%0Aconst%20entries%20%3D%20await%20sb.filesystem.listFiles(%22%2Ftmp%2Fproject%2Fresults%22)%3B%0Afor%20(const%20entry%20of%20entries)%20%7B%0A%20%20console.log(entry.name%2C%20entry.type%2C%20entry.size)%3B%0A%7D%0A%0A%2F%2F%20Check%20that%20the%20result%20file%20has%20content%20before%20downloading%20it.%0Aconst%20info%20%3D%20await%20sb.filesystem.stat(%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22)%3B%0Aif%20(info.size%20%3E%200)%20%7B%0A%20%20const%20answer%20%3D%20await%20sb.filesystem.readText(%0A%20%20%20%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22%2C%0A%20%20)%3B%0A%20%20console.log(answer)%3B%0A%7D%0A%0A%2F%2F%20Clean%20up%20the%20whole%20project.%0Aawait%20sb.filesystem.remove(%22%2Ftmp%2Fproject%22%2C%20%7B%20recursive%3A%20true%20%7D)%3B%0A%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0Adefer%20sb.Terminate(ctx%2C%20nil)%0A%0Afs%20%3A%3D%20sb.Filesystem%0A%0A%2F%2F%20Set%20up%20a%20structured%20project.%0Afs.MakeDirectory(ctx%2C%20%22%2Ftmp%2Fproject%2Fresults%22%2C%20nil)%0A%0A%2F%2F%20Let%20the%20Sandbox%20do%20some%20work%20and%20write%20outputs%20to%20files.%0Afs.WriteText(ctx%2C%20%2242%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22%2C%20nil)%0Afs.WriteText(ctx%2C%20%22debug%20info%5Cn%22%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fdebug.log%22%2C%20nil)%0A%0A%2F%2F%20Inspect%20what%20was%20produced.%0Aentries%2C%20_%20%3A%3D%20fs.ListFiles(ctx%2C%20%22%2Ftmp%2Fproject%2Fresults%22%2C%20nil)%0Afor%20_%2C%20entry%20%3A%3D%20range%20entries%20%7B%0A%09fmt.Println(entry.Name%2C%20entry.Type%2C%20entry.Size)%0A%7D%0A%0A%2F%2F%20Check%20that%20the%20result%20file%20has%20content%20before%20downloading%20it.%0Ainfo%2C%20_%20%3A%3D%20fs.Stat(ctx%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22%2C%20nil)%0Aif%20info.Size%20%3E%200%20%7B%0A%09answer%2C%20_%20%3A%3D%20fs.ReadText(ctx%2C%20%22%2Ftmp%2Fproject%2Fresults%2Fanswer.txt%22%2C%20nil)%0A%09fmt.Println(answer)%0A%7D%0A%0A%2F%2F%20Clean%20up%20the%20whole%20project.%0Afs.Remove(ctx%2C%20%22%2Ftmp%2Fproject%22%2C%20%26modal.SandboxFilesystemRemoveParams%7BRecursive%3A%20true%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var A=c(x,4);g(c(e(A)),{href:`#using-volumes`,children:(e,t)=>{l(),i(e,r(`using Volumes`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);u(j,{variant:`info`,children:(t,a)=>{var o=S();g(c(e(o),5),{href:`/docs/guide/migrate-sandbox-filesystem`,children:(e,t)=>{l(),i(e,r(`migration guide`))},$$slots:{default:!0}}),l(),n(o),i(t,o)},$$slots:{default:!0}});var M=c(j,2);d(M,{id:`using-volumes`,children:(e,t)=>{l(),i(e,r(`Using Volumes`))},$$slots:{default:!0}});var N=c(M,2),P=c(e(N));g(P,{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),g(c(P,2),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{l(),i(e,r(`CloudBucketMount`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,6);m(F,{code:`%23%20Find%20or%20create%20a%20Volume%20with%20the%20name%20%22my-volume%22.%0Avol%20%3D%20modal.Volume.from_name(%22my-volume%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fcache%22%3A%20vol%7D%2C%0A%20%20%20%20app%3Dmy_app%2C%0A)%0A%23%20Read%20a%20file%20in%20the%20Volume.%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22cat%20%2Fcache%2Fsome-file.txt%22)%0Aprint(p.stdout.read())%0Ap.wait()%0A%0A%23%20Write%20a%20file%20to%20the%20Volume.%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20foo%20%3E%20%2Fcache%2Fa.txt%22)%0Ap.wait()%0Asb.terminate(wait%3DTrue)%0Asb.detach()%0A%0A%23%20Access%20the%20Volume%20file%20from%20outside%20the%20Sandbox.%0Afor%20data%20in%20vol.read_file(%22a.txt%22)%3A%0A%20%20%20%20print(data)`,lang:`python`});var I=c(F,2),L=c(e(I));g(L,{href:`/docs/guide/volumes#background-commits`,children:(e,t)=>{l(),i(e,r(`background commits`))},$$slots:{default:!0}}),g(c(L,2),{href:`#committing-volume-changes-with-sync-v2-only`,children:(e,t)=>{l();var n=C();l(),i(e,n)},$$slots:{default:!0}}),l(),n(I);var R=c(I,2);g(c(e(R)),{href:`/docs/sdk/py/latest/Sandbox#reload_volumes`,children:(e,t)=>{l(),i(e,r(`.reload_volumes()`))},$$slots:{default:!0}}),l(),n(R);var z=c(R,2);f(z,{id:`mounting-a-subdirectory`,children:(e,t)=>{l(),i(e,r(`Mounting a subdirectory`))},$$slots:{default:!0}});var B=c(z,2);g(c(e(B)),{href:`/docs/guide/volumes#mount-options`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);_(V,{python:e=>{m(e,{code:`sb_app%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0A%0Avol%20%3D%20modal.Volume.from_name(%22shared-volume%22%2C%20create_if_missing%3DTrue)%0A%0A%23%20Each%20Sandbox%20only%20sees%20its%20own%20subdirectory%20of%20the%20Volume.%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fdata%22%3A%20vol.with_mount_options(sub_path%3D%22%2Fusers%2Fuser_123%22)%7D%2C%0A%20%20%20%20app%3Dsb_app%2C%0A)%0A%23%20%2Fdata%20inside%20the%20Sandbox%20maps%20to%20%2Fusers%2Fuser_123%20in%20the%20Volume.%0A%23%20The%20Sandbox%20cannot%20see%20or%20modify%20files%20belonging%20to%20other%20users.%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20hello%20%3E%20%2Fdata%2Foutput.txt%22)%0Ap.wait()%0Asb.terminate(wait%3DTrue)%0Asb.detach()`,lang:`python`})},javascript:e=>{m(e,{code:`const%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20vol%20%3D%20await%20modal.volumes.fromName(%22shared-volume%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0A%0A%2F%2F%20Each%20Sandbox%20only%20sees%20its%20own%20subdirectory%20of%20the%20Volume.%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20volumes%3A%20%7B%20%22%2Fdata%22%3A%20vol.withMountOptions(%7B%20subPath%3A%20%22%2Fusers%2Fuser_123%22%20%7D)%20%7D%2C%0A%7D)%3B%0A%2F%2F%20%2Fdata%20inside%20the%20Sandbox%20maps%20to%20%2Fusers%2Fuser_123%20in%20the%20Volume.%0A%2F%2F%20The%20Sandbox%20cannot%20see%20or%20modify%20files%20belonging%20to%20other%20users.%0Aconst%20p%20%3D%20await%20sb.exec(%5B%22bash%22%2C%20%22-c%22%2C%20%22echo%20hello%20%3E%20%2Fdata%2Foutput.txt%22%5D)%3B%0Aawait%20p.wait()%3B%0Aawait%20sb.terminate(%7B%20wait%3A%20true%20%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22volume-subdir-test%22%2C%20%26modal.AppFromNameParams%7BCreateIfMissing%3A%20true%7D)%0A%0Avol%2C%20_%20%3A%3D%20mc.Volumes.FromName(ctx%2C%20%22shared-volume%22%2C%20%26modal.VolumeFromNameParams%7B%0A%09CreateIfMissing%3A%20true%2C%0A%7D)%0Aimage%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil)%0A%0A%2F%2F%20Each%20Sandbox%20only%20sees%20its%20own%20subdirectory%20of%20the%20Volume.%0AsubPath%20%3A%3D%20%22%2Fusers%2Fuser_123%22%0Asb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Volumes%3A%20map%5Bstring%5D*modal.Volume%7B%0A%09%09%22%2Fdata%22%3A%20vol.WithMountOptions(%26modal.VolumeMountOptions%7BSubPath%3A%20%26subPath%7D)%2C%0A%09%7D%2C%0A%7D)%0Adefer%20sb.Terminate(ctx%2C%20nil)%0A%0A%2F%2F%20%2Fdata%20inside%20the%20Sandbox%20maps%20to%20%2Fusers%2Fuser_123%20in%20the%20Volume.%0A%2F%2F%20The%20Sandbox%20cannot%20see%20or%20modify%20files%20belonging%20to%20other%20users.%0Ap%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22bash%22%2C%20%22-c%22%2C%20%22echo%20hello%20%3E%20%2Fdata%2Foutput.txt%22%7D%2C%20nil)%0Ap.Wait(ctx)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var H=c(V,2);g(c(e(H)),{href:`/docs/guide/volumes#mount-options`,children:(e,t)=>{l(),i(e,r(`Volumes guide`))},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);f(U,{id:`committing-volume-changes-with-sync-v2-only`,children:(e,t)=>{l();var n=T();l(2),i(e,n)},$$slots:{default:!0}});var W=c(U,2);g(c(e(W)),{href:`/docs/guide/volumes#volumes-v2-overview`,children:(e,t)=>{l(),i(e,r(`Volumes v2`))},$$slots:{default:!0}}),l(3),n(W);var G=c(W,2);m(G,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fdata%22%3A%20modal.Volume.from_name(%22my-v2-volume%22)%7D%2C%0A%20%20%20%20app%3Dmy_app%2C%0A)%0A%0A%23%20Write%20files%20to%20the%20volume%0Asb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20'hello'%20%3E%20%2Fdata%2Foutput.txt%22).wait()%0A%0A%23%20Commit%20changes%20immediately%0Ap%20%3D%20sb.exec(%22sync%22%2C%20%22%2Fdata%22)%0Ap.wait()%0Aif%20p.returncode%20!%3D%200%3A%0A%20%20%20%20raise%20Exception(f%22sync%20failed%20with%20exit%20code%20%7Bp.returncode%7D%22)%0A%0A%23%20Changes%20are%20now%20persisted%20and%20visible%20to%20other%20containers%0Asb.terminate()%0Asb.detach()`,lang:`python`});var K=c(G,4);d(K,{id:`adding-files-to-an-image`,children:(e,t)=>{l(),i(e,r(`Adding files to an Image`))},$$slots:{default:!0}});var q=c(K,2);g(c(e(q)),{href:`/docs/guide/images#add-local-files-with-add_local_dir-and-add_local_file`,children:(e,t)=>{l(),i(e,r(`add a file to an Image itself`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,2),Y=c(e(J));g(Y,{href:`/docs/sdk/py/latest/Image#add_local_file`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var X=c(Y,2);g(X,{href:`/docs/sdk/py/latest/Image#add_local_dir`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),g(c(X,2),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),l(),n(J),m(c(J,2),{code:`%23%20Eagerly%20build%20the%20image%20-%20otherwise%20the%20Image%20will%20lazily%20build%20when%20the%0A%23%20Sandbox%20is%20created.%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.add_local_dir(%0A%20%20%20%20%20%20%20%20local_path%3D%22%2Fhome%2Fuser%2Fmy_dir%22%2C%0A%20%20%20%20%20%20%20%20remote_path%3D%22%2Fapp%22%2C%0A%20%20%20%20)%0A%20%20%20%20.build(my_app)%0A)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dmy_app%2C%20image%3Dimage)%0Ap%20%3D%20sb.exec(%22ls%22%2C%20%22%2Fapp%22)%0Aprint(p.stdout.read())%0Ap.wait()%0Asb.detach()`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{A as default,v as metadata};
//# sourceMappingURL=Djetv-fZ2.js.map
