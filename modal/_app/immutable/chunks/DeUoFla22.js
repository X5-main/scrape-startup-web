(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f76c50ac-32b6-451a-a754-a1fecc3d33a2`,e._sentryDebugIdIdentifier=`sentry-dbid-f76c50ac-32b6-451a-a754-a1fecc3d33a2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";import{t as _}from"./D0Ft4u302.js";var v={description:`Use the next-generation Sandbox backend for higher scale and faster startup`,toc:[{depth:1,value:`V2 Sandboxes`,id:`v2-sandboxes`,children:[{depth:2,value:`Example usage`,id:`example-usage`},{depth:2,value:`Feature support`,id:`feature-support`},{depth:2,value:`Retrieving a Sandbox by ID`,id:`retrieving-a-sandbox-by-id`},{depth:2,value:`Retrieving a Sandbox by name`,id:`retrieving-a-sandbox-by-name`},{depth:2,value:`Miscellaneous`,id:`miscellaneous`}]}],rawContent:`# V2 Sandboxes

<Callout variant="beta" />

Modal's next-generation Sandbox backend has a number of advantages over the existing
backend:

- Create sandboxes with higher throughput
- Lower time-to-interactive
- Run more sandboxes concurrently

The new backend is recommended to users wanting:

- \\>20 sandbox creates per second
- \\>10,000 concurrent sandboxes

To use it, call \`Sandbox._experimental_create\` instead of \`Sandbox.create\`. Beyond that,
the interface is exactly the same. Most features are supported, but a few are not —
see the [Feature support](#feature-support) section below for details. If all features you
use are supported, changing the "create" method is the only change you'll need to make!

Starting in modal [\`1.5.4.dev21\`](https://pypi.org/project/modal/1.5.4.dev21/), Python users can opt in without changing any call sites.
Set the \`MODAL_SANDBOX_V2\` environment variable and keep using the standard
\`Sandbox.create()\` (as well as \`Sandbox.from_name()\` and \`Sandbox.list()\`):

\`\`\`python notest
import os

# Equivalent to \`export MODAL_SANDBOX_V2=1\` in your shell before running.
os.environ["MODAL_SANDBOX_V2"] = "1"

app = modal.App.lookup("my-app", create_if_missing=True)
sb = modal.Sandbox.create("sleep", "300", app=app)
\`\`\`

## Example usage

Make sure you are on the [**latest**](https://pypi.org/project/modal/) version of the Modal client:

\`\`\`bash
uv pip install --upgrade modal
\`\`\`

All of the core Sandbox operations — \`exec\`, \`wait\`, \`poll\`, \`terminate\`,
reading \`stdout\`/\`stderr\`, and writing to \`stdin\` — work the same way as
they do in the [standard Sandbox API](/docs/guide/sandboxes):

<CodeTabs>
  {#snippet python()}

\`\`\`python fixture:sb_app
sb = modal.Sandbox._experimental_create(
    "sleep", "300",
    app=sb_app,
    cpu=2,
    memory=4096,  # MiB
)

p = sb.exec("python", "-c", "print('hello world')")
print(p.stdout.read())
p.wait()
assert p.returncode == 0

sb.terminate()
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python fixture:sb_app
sb = await modal.Sandbox._experimental_create.aio(
    "sleep", "300",
    app=sb_app,
    cpu=2,
    memory=4096,  # MiB
)

p = await sb.exec.aio("python", "-c", "print('hello world')")
print(await p.stdout.read.aio())
await p.wait.aio()
assert p.returncode == 0

await sb.terminate.aio()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("my-app", { createIfMissing: true });
const image = modal.images.fromRegistry("python:3.13-slim");

const sb = await modal.sandboxes.experimentalCreate(app, image, {
  command: ["sleep", "300"],
  cpu: 2,
  memoryMiB: 4096,
});

const p = await sb.exec(["python", "-c", "print('hello world')"]);
const output = await p.stdout.readText();
console.log(output);
const exitCode = await p.wait();
console.assert(exitCode === 0);

await sb.terminate();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.ExperimentalCreate(ctx, app, image, &modal.SandboxCreateParams{
	Command:   []string{"sleep", "300"},
	CPU:       2,
	MemoryMiB: 4096,
})

p, _ := sb.Exec(ctx, []string{"python", "-c", "print('hello world')"}, nil)
stdout, _ := io.ReadAll(p.Stdout)
fmt.Println(string(stdout))
exitCode, _ := p.Wait(ctx, nil)
fmt.Println("exit code:", exitCode)

sb.Terminate(ctx, nil)
\`\`\`

{/snippet}
</CodeTabs>

## Feature support

<Callout variant="info">

V2 Sandboxes are under active development, and they are rapidly approaching parity
with the original Sandbox feature set. To access new features as soon as they are
implemented, you can opt into nightly development builds of the Modal Python SDK
with \`uv pip install --prerelease=allow --upgrade modal\`.

</Callout>

| Feature                               | Status                                                | Notes                                                                                                                                                                                                                                                                                               |
| ------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Exec**                              | <span style="white-space: nowrap">✅ Supported</span> | \`sb.exec(...)\`                                                                                                                                                                                                                                                                                      |
| **Stdin / stdout / stderr**           | <span style="white-space: nowrap">✅ Supported</span> | Stream I/O with running processes.                                                                                                                                                                                                                                                                  |
| **CPU and memory configuration**      | <span style="white-space: nowrap">✅ Supported</span> | \`cpu\` and \`memory\` on create.                                                                                                                                                                                                                                                                       |
| **Custom images**                     | <span style="white-space: nowrap">✅ Supported</span> | Any \`modal.Image\` via the \`image\` parameter.                                                                                                                                                                                                                                                        |
| **Secrets and environment variables** | <span style="white-space: nowrap">✅ Supported</span> | \`secrets\` and \`env\` on create, or per-exec.                                                                                                                                                                                                                                                         |
| **Volumes**                           | <span style="white-space: nowrap">✅ Supported</span> | \`modal.Volume\` via the \`volumes\` parameter.                                                                                                                                                                                                                                                         |
| **Reload volumes**                    | <span style="white-space: nowrap">✅ Supported</span> | \`sb.reload_volumes()\` blocks until the reload completes; pass a \`timeout\` (default 55s) to bound the wait. Not supported on [VM Sandboxes](/docs/guide/vm-sandboxes).                                                                                                                               |
| **Cloud bucket mounts**               | <span style="white-space: nowrap">✅ Supported</span> | \`modal.CloudBucketMount\` with static credentials or OIDC.                                                                                                                                                                                                                                           |
| **Encrypted tunnels**                 | <span style="white-space: nowrap">✅ Supported</span> | \`encrypted_ports\` on create, \`sb.tunnels()\` to retrieve.                                                                                                                                                                                                                                            |
| **Unencrypted tunnels**               | <span style="white-space: nowrap">✅ Supported</span> | \`unencrypted_ports\` on create, \`sb.tunnels()\` to retrieve. Prefer encrypted tunnels when possible.                                                                                                                                                                                                  |
| **Custom domains**                    | <span style="white-space: nowrap">✅ Supported</span> | \`custom_domain\` on create; tunnel hostnames become subdomains of your domain. Requires prior setup by Modal — see [Custom domains](/docs/guide/sandbox-networking#custom-domains).                                                                                                                  |
| **Connect tokens**                    | <span style="white-space: nowrap">✅ Supported</span> | \`sb.create_connect_token(...)\` for authenticated HTTP/WebSocket access — see [Connecting to Sandboxes](/docs/guide/sandbox-networking#connecting-to-sandboxes-with-http-and-websockets).                                                                                                            |
| **Filesystem API**                    | <span style="white-space: nowrap">✅ Supported</span> | Read and write files via \`sb.filesystem\` — see [Filesystem access](/docs/guide/sandbox-files). Requires Python SDK ≥ 1.5.2.dev4 (a nightly build, until 1.5.2 is released — see above). The deprecated \`sb.open()\` / \`sb.ls()\` / \`sb.mkdir()\` / \`sb.rm()\` / \`sb.watch()\` methods are not supported. |
| **Filesystem snapshots**              | <span style="white-space: nowrap">✅ Supported</span> | \`sb.snapshot_filesystem()\`.                                                                                                                                                                                                                                                                         |
| **Directory snapshots**               | <span style="white-space: nowrap">✅ Supported</span> | \`sb.snapshot_directory()\`.                                                                                                                                                                                                                                                                          |
| **Memory snapshots**                  | <span style="white-space: nowrap">✅ Supported</span> | \`sb._experimental_snapshot()\` / \`Sandbox._experimental_from_snapshot()\`, with \`_experimental_enable_snapshot=True\` on \`_experimental_create\`. In [alpha](/docs/guide/sandbox-snapshots#memory-snapshots).                                                                                           |
| **Region placement**                  | <span style="white-space: nowrap">✅ Supported</span> | \`region\` parameter.                                                                                                                                                                                                                                                                                 |
| **Network control**                   | <span style="white-space: nowrap">✅ Supported</span> | \`block_network\` and CIDR allowlists.                                                                                                                                                                                                                                                                |
| **Private networking (i6pn)**         | <span style="white-space: nowrap">✅ Supported</span> | \`i6pn=True\`; pin sandboxes to the same \`region\`. See [Private networking](/docs/guide/private-networking).                                                                                                                                                                                          |
| **Names**                             | <span style="white-space: nowrap">✅ Supported</span> | \`name\` on create, or \`sb._experimental_set_name(...)\` afterwards. Look up a running named Sandbox with \`Sandbox._experimental_from_name(app_name, name)\` — see [below](#retrieving-a-sandbox-by-name).                                                                                              |
| **OIDC identity tokens**              | <span style="white-space: nowrap">✅ Supported</span> | \`include_oidc_identity_token\`, \`oidc_auth_role_arn\` on \`CloudBucketMount\`.                                                                                                                                                                                                                          |
| **Proxies**                           | <span style="white-space: nowrap">✅ Supported</span> | \`proxy\` parameter.                                                                                                                                                                                                                                                                                  |
| **VM runtime**                        | <span style="white-space: nowrap">✅ Supported</span> | \`experimental_options={"vm_runtime": True}\`. See [VM Sandboxes](/docs/guide/vm-sandboxes).                                                                                                                                                                                                          |
| **Reattach by ID**                    | <span style="white-space: nowrap">✅ Supported</span> | Store \`sb.object_id\`; use \`Sandbox.from_id(id)\`. See [below](#retrieving-a-sandbox-by-id).                                                                                                                                                                                                          |
| **Listing sandboxes**                 | <span style="white-space: nowrap">✅ Supported</span> | \`Sandbox._experimental_list(app_id=...)\` returns all sandboxes (v1 and v2). \`Sandbox.list()\` does not return V2 sandboxes, unless the \`MODAL_SANDBOX_V2\` flag is set. Tags are supported.                                                                                                           |
| **\`modal shell\` (CLI)**               | <span style="white-space: nowrap">✅ Supported</span> | Connect to a running V2 Sandbox with \`modal shell <sandbox-id>\` or \`modal shell <task-id>\`.                                                                                                                                                                                                         |
| **GPUs**                              | <span style="white-space: nowrap">❌ Not yet</span>   |                                                                                                                                                                                                                                                                                                     |
| **Network file systems**              | <span style="white-space: nowrap">❌ Not yet</span>   |                                                                                                                                                                                                                                                                                                     |

## Retrieving a Sandbox by ID

You can reattach to any V2 Sandbox by storing its \`object_id\`
after creation and using \`Sandbox.from_id\`:

<CodeTabs>
  {#snippet python()}

\`\`\`python fixture:sb_app
sb = modal.Sandbox._experimental_create("sleep", "300", app=sb_app)
sandbox_id = sb.object_id
print(f"Sandbox ID: {sandbox_id}")

# Later, reattach:
sb2 = modal.Sandbox.from_id(sandbox_id)
p = sb2.exec("echo", "reattached")
print(p.stdout.read())
p.wait()
sb2.terminate()
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python fixture:sb_app
sb = await modal.Sandbox._experimental_create.aio("sleep", "300", app=sb_app)
sandbox_id = sb.object_id
print(f"Sandbox ID: {sandbox_id}")

# Later, reattach:
sb2 = await modal.Sandbox.from_id.aio(sandbox_id)
p = await sb2.exec.aio("echo", "reattached")
print(await p.stdout.read.aio())
await p.wait.aio()
await sb2.terminate.aio()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("my-app", { createIfMissing: true });
const image = modal.images.fromRegistry("alpine:3.21");

const sb = await modal.sandboxes.experimentalCreate(app, image, {
  command: ["sleep", "300"],
});
const sandboxId = sb.sandboxId;
console.log(\`Sandbox ID: \${sandboxId}\`);

// Later, reattach:
const sb2 = await modal.sandboxes.fromId(sandboxId);
const p = await sb2.exec(["echo", "reattached"]);
const output = await p.stdout.readText();
console.log(output);
await p.wait();
await sb2.terminate();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, _ := mc.Sandboxes.ExperimentalCreate(ctx, app, image, &modal.SandboxCreateParams{
	Command: []string{"sleep", "300"},
})
sandboxID := sb.SandboxID
fmt.Printf("Sandbox ID: %s\\n", sandboxID)

// Later, reattach:
sb2, _ := mc.Sandboxes.FromID(ctx, sandboxID, nil)
p, _ := sb2.Exec(ctx, []string{"echo", "reattached"}, nil)
stdout, _ := io.ReadAll(p.Stdout)
fmt.Println(string(stdout))
sb2.Terminate(ctx, nil)
\`\`\`

{/snippet}
</CodeTabs>

## Retrieving a Sandbox by name

You can assign a name to a V2 Sandbox and later look it up by that name, as long
as its App is deployed. Names are unique within an App: only one running
Sandbox may hold a given name at a time. A name is released for reuse once
the Sandbox stops. Set the name with the \`name\` parameter on
\`_experimental_create\` and resolve it with \`Sandbox._experimental_from_name\`:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
app = modal.App.lookup("my-app", create_if_missing=True)
sb = modal.Sandbox._experimental_create("sleep", "300", app=app, name="my-sandbox")

# Later, from a deployed App, resolve the running Sandbox by name:
sb2 = modal.Sandbox._experimental_from_name("my-app", "my-sandbox")
assert sb.object_id == sb2.object_id
\`\`\`

{/snippet}

{#snippet python_async()}

\`\`\`python notest
app = await modal.App.lookup.aio("my-app", create_if_missing=True)
sb = await modal.Sandbox._experimental_create.aio("sleep", "300", app=app, name="my-sandbox")

# Later, from a deployed App, resolve the running Sandbox by name:
sb2 = await modal.Sandbox._experimental_from_name.aio("my-app", "my-sandbox")
assert sb.object_id == sb2.object_id
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("my-app", { createIfMissing: true });
const image = modal.images.fromRegistry("alpine:3.21");

const sb = await modal.sandboxes.experimentalCreate(app, image, {
  command: ["sleep", "300"],
  name: "my-sandbox",
});

// Later, from a deployed App, resolve the running Sandbox by name:
const sb2 = await modal.sandboxes.experimentalFromName("my-app", "my-sandbox");
console.assert(sb.sandboxId === sb2.sandboxId);
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
app, _ := mc.Apps.FromName(ctx, "my-app", &modal.AppFromNameParams{CreateIfMissing: true})
image := mc.Images.FromRegistry("alpine:3.21", nil)

sb, _ := mc.Sandboxes.ExperimentalCreate(ctx, app, image, &modal.SandboxCreateParams{
	Command: []string{"sleep", "300"},
	Name:    "my-sandbox",
})

// Later, from a deployed App, resolve the running Sandbox by name:
sb2, _ := mc.Sandboxes.ExperimentalFromName(ctx, "my-app", "my-sandbox", nil)
fmt.Println(sb.SandboxID == sb2.SandboxID)
\`\`\`

{/snippet}
</CodeTabs>

If you created a Sandbox without a name, you can assign one later **once** with
\`sb._experimental_set_name("my-sandbox")\` (\`sb.experimentalSetName(...)\` in
JavaScript, \`sb.ExperimentalSetName(...)\` in Go), then resolve it with
\`_experimental_from_name\` as shown above.

## Miscellaneous

- When \`modal.Sandbox._experimental_create()\` returns, the sandbox is already scheduled onto a machine (though not yet ready). This differs from v1 semantics, where \`create()\` returns before the sandbox is scheduled. As such, once the \`_experimental_create()\` call returns, you can expect a shorter, more consistent \`wait_until_ready\`:
  \`\`\`python notest
  sb = modal.Sandbox._experimental_create(app=app, readiness_probe=some_probe)
  sb.wait_until_ready()
  \`\`\`
  You can read more about the sandbox lifecycle in [the sandbox documentation](/docs/guide/sandboxes#events).

If you hit a rough edge that isn't listed here, please reach out via [Slack](/slack) or email us at [support@modal.com](mailto:support@modal.com).
`,meta:{title:`V2 Sandboxes`,description:`Use the next-generation Sandbox backend for higher scale and faster startup`}},{description:y,toc:b,rawContent:x,meta:S}=v,C=t(`<code>1.5.4.dev21</code>`),w=t(`<strong>latest</strong>`),T=t(`<p>V2 Sandboxes are under active development, and they are rapidly approaching parity
with the original Sandbox feature set. To access new features as soon as they are
implemented, you can opt into nightly development builds of the Modal Python SDK
with <code>uv pip install --prerelease=allow --upgrade modal</code>.</p>`),E=t(`<thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead> <tbody><tr><td><strong>Exec</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb.exec(...)</code></td></tr><tr><td><strong>Stdin / stdout / stderr</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td>Stream I/O with running processes.</td></tr><tr><td><strong>CPU and memory configuration</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>cpu</code> and <code>memory</code> on create.</td></tr><tr><td><strong>Custom images</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td>Any <code>modal.Image</code> via the <code>image</code> parameter.</td></tr><tr><td><strong>Secrets and environment variables</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>secrets</code> and <code>env</code> on create, or per-exec.</td></tr><tr><td><strong>Volumes</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>modal.Volume</code> via the <code>volumes</code> parameter.</td></tr><tr><td><strong>Reload volumes</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb.reload_volumes()</code> blocks until the reload completes; pass a <code>timeout</code> (default 55s) to bound the wait. Not supported on <!>.</td></tr><tr><td><strong>Cloud bucket mounts</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>modal.CloudBucketMount</code> with static credentials or OIDC.</td></tr><tr><td><strong>Encrypted tunnels</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>encrypted_ports</code> on create, <code>sb.tunnels()</code> to retrieve.</td></tr><tr><td><strong>Unencrypted tunnels</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>unencrypted_ports</code> on create, <code>sb.tunnels()</code> to retrieve. Prefer encrypted tunnels when possible.</td></tr><tr><td><strong>Custom domains</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>custom_domain</code> on create; tunnel hostnames become subdomains of your domain. Requires prior setup by Modal — see <!>.</td></tr><tr><td><strong>Connect tokens</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb.create_connect_token(...)</code> for authenticated HTTP/WebSocket access — see <!>.</td></tr><tr><td><strong>Filesystem API</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td>Read and write files via <code>sb.filesystem</code> — see <!>. Requires Python SDK ≥ 1.5.2.dev4 (a nightly build, until 1.5.2 is released — see above). The deprecated <code>sb.open()</code> / <code>sb.ls()</code> / <code>sb.mkdir()</code> / <code>sb.rm()</code> / <code>sb.watch()</code> methods are not supported.</td></tr><tr><td><strong>Filesystem snapshots</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb.snapshot_filesystem()</code>.</td></tr><tr><td><strong>Directory snapshots</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb.snapshot_directory()</code>.</td></tr><tr><td><strong>Memory snapshots</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>sb._experimental_snapshot()</code> / <code>Sandbox._experimental_from_snapshot()</code>, with <code>_experimental_enable_snapshot=True</code> on <code>_experimental_create</code>. In <!>.</td></tr><tr><td><strong>Region placement</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>region</code> parameter.</td></tr><tr><td><strong>Network control</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>block_network</code> and CIDR allowlists.</td></tr><tr><td><strong>Private networking (i6pn)</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>i6pn=True</code>; pin sandboxes to the same <code>region</code>. See <!>.</td></tr><tr><td><strong>Names</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>name</code> on create, or <code>sb._experimental_set_name(...)</code> afterwards. Look up a running named Sandbox with <code>Sandbox._experimental_from_name(app_name, name)</code> — see <!>.</td></tr><tr><td><strong>OIDC identity tokens</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>include_oidc_identity_token</code>, <code>oidc_auth_role_arn</code> on <code>CloudBucketMount</code>.</td></tr><tr><td><strong>Proxies</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>proxy</code> parameter.</td></tr><tr><td><strong>VM runtime</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>experimental_options=&#123;"vm_runtime": True&#125;</code>. See <!>.</td></tr><tr><td><strong>Reattach by ID</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td>Store <code>sb.object_id</code>; use <code>Sandbox.from_id(id)</code>. See <!>.</td></tr><tr><td><strong>Listing sandboxes</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td><code>Sandbox._experimental_list(app_id=...)</code> returns all sandboxes (v1 and v2). <code>Sandbox.list()</code> does not return V2 sandboxes, unless the <code>MODAL_SANDBOX_V2</code> flag is set. Tags are supported.</td></tr><tr><td><strong><code>modal shell</code> (CLI)</strong></td><td><span style="white-space: nowrap">✅ Supported</span></td><td>Connect to a running V2 Sandbox with <code>modal shell &lt;sandbox-id&gt;</code> or <code>modal shell &lt;task-id&gt;</code>.</td></tr><tr><td><strong>GPUs</strong></td><td><span style="white-space: nowrap">❌ Not yet</span></td><td></td></tr><tr><td><strong>Network file systems</strong></td><td><span style="white-space: nowrap">❌ Not yet</span></td><td></td></tr></tbody>`,1),D=t(`<!> <!> <p>Modal’s next-generation Sandbox backend has a number of advantages over the existing
backend:</p> <ul><li>Create sandboxes with higher throughput</li> <li>Lower time-to-interactive</li> <li>Run more sandboxes concurrently</li></ul> <p>The new backend is recommended to users wanting:</p> <ul><li>&gt;20 sandbox creates per second</li> <li>&gt;10,000 concurrent sandboxes</li></ul> <p>To use it, call <code>Sandbox._experimental_create</code> instead of <code>Sandbox.create</code>. Beyond that,
the interface is exactly the same. Most features are supported, but a few are not —
see the <!> section below for details. If all features you
use are supported, changing the “create” method is the only change you’ll need to make!</p> <p>Starting in modal <!>, Python users can opt in without changing any call sites.
Set the <code>MODAL_SANDBOX_V2</code> environment variable and keep using the standard <code>Sandbox.create()</code> (as well as <code>Sandbox.from_name()</code> and <code>Sandbox.list()</code>):</p> <!> <!> <p>Make sure you are on the <!> version of the Modal client:</p> <!> <p>All of the core Sandbox operations — <code>exec</code>, <code>wait</code>, <code>poll</code>, <code>terminate</code>,
reading <code>stdout</code>/<code>stderr</code>, and writing to <code>stdin</code> — work the same way as
they do in the <!>:</p> <!> <!> <!> <!> <!> <p>You can reattach to any V2 Sandbox by storing its <code>object_id</code> after creation and using <code>Sandbox.from_id</code>:</p> <!> <!> <p>You can assign a name to a V2 Sandbox and later look it up by that name, as long
as its App is deployed. Names are unique within an App: only one running
Sandbox may hold a given name at a time. A name is released for reuse once
the Sandbox stops. Set the name with the <code>name</code> parameter on <code>_experimental_create</code> and resolve it with <code>Sandbox._experimental_from_name</code>:</p> <!> <p>If you created a Sandbox without a name, you can assign one later <strong>once</strong> with <code>sb._experimental_set_name("my-sandbox")</code> (<code>sb.experimentalSetName(...)</code> in
JavaScript, <code>sb.ExperimentalSetName(...)</code> in Go), then resolve it with <code>_experimental_from_name</code> as shown above.</p> <!> <ul><li>When <code>modal.Sandbox._experimental_create()</code> returns, the sandbox is already scheduled onto a machine (though not yet ready). This differs from v1 semantics, where <code>create()</code> returns before the sandbox is scheduled. As such, once the <code>_experimental_create()</code> call returns, you can expect a shorter, more consistent <code>wait_until_ready</code>: <!> You can read more about the sandbox lifecycle in <!>.</li></ul> <p>If you hit a rough edge that isn’t listed here, please reach out via <!> or email us at <!>.</p>`,1);function O(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>b,()=>v,{children:(t,a)=>{var o=D(),h=s(o);f(h,{id:`v2-sandboxes`,children:(e,t)=>{l(),i(e,r(`V2 Sandboxes`))},$$slots:{default:!0}});var v=c(h,2);u(v,{variant:`beta`});var y=c(v,10);g(c(e(y),5),{href:`#feature-support`,children:(e,t)=>{l(),i(e,r(`Feature support`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);g(c(e(b)),{href:`https://pypi.org/project/modal/1.5.4.dev21/`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(9),n(b);var x=c(b,2);m(x,{code:`import%20os%0A%0A%23%20Equivalent%20to%20%60export%20MODAL_SANDBOX_V2%3D1%60%20in%20your%20shell%20before%20running.%0Aos.environ%5B%22MODAL_SANDBOX_V2%22%5D%20%3D%20%221%22%0A%0Aapp%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(%22sleep%22%2C%20%22300%22%2C%20app%3Dapp)`,lang:`python`});var S=c(x,2);d(S,{id:`example-usage`,children:(e,t)=>{l(),i(e,r(`Example usage`))},$$slots:{default:!0}});var O=c(S,2);g(c(e(O)),{href:`https://pypi.org/project/modal/`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);m(k,{code:`uv%20pip%20install%20--upgrade%20modal`,lang:`bash`});var A=c(k,2);g(c(e(A),15),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`standard Sandbox API`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);_(j,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox._experimental_create(%0A%20%20%20%20%22sleep%22%2C%20%22300%22%2C%0A%20%20%20%20app%3Dsb_app%2C%0A%20%20%20%20cpu%3D2%2C%0A%20%20%20%20memory%3D4096%2C%20%20%23%20MiB%0A)%0A%0Ap%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20%22print('hello%20world')%22)%0Aprint(p.stdout.read())%0Ap.wait()%0Aassert%20p.returncode%20%3D%3D%200%0A%0Asb.terminate()`,lang:`python`})},python_async:e=>{m(e,{code:`sb%20%3D%20await%20modal.Sandbox._experimental_create.aio(%0A%20%20%20%20%22sleep%22%2C%20%22300%22%2C%0A%20%20%20%20app%3Dsb_app%2C%0A%20%20%20%20cpu%3D2%2C%0A%20%20%20%20memory%3D4096%2C%20%20%23%20MiB%0A)%0A%0Ap%20%3D%20await%20sb.exec.aio(%22python%22%2C%20%22-c%22%2C%20%22print('hello%20world')%22)%0Aprint(await%20p.stdout.read.aio())%0Aawait%20p.wait.aio()%0Aassert%20p.returncode%20%3D%3D%200%0A%0Aawait%20sb.terminate.aio()`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%20createIfMissing%3A%20true%20%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.experimentalCreate(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22300%22%5D%2C%0A%20%20cpu%3A%202%2C%0A%20%20memoryMiB%3A%204096%2C%0A%7D)%3B%0A%0Aconst%20p%20%3D%20await%20sb.exec(%5B%22python%22%2C%20%22-c%22%2C%20%22print('hello%20world')%22%5D)%3B%0Aconst%20output%20%3D%20await%20p.stdout.readText()%3B%0Aconsole.log(output)%3B%0Aconst%20exitCode%20%3D%20await%20p.wait()%3B%0Aconsole.assert(exitCode%20%3D%3D%3D%200)%3B%0A%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.ExperimentalCreate(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%5B%5Dstring%7B%22sleep%22%2C%20%22300%22%7D%2C%0A%09CPU%3A%20%20%20%20%20%20%202%2C%0A%09MemoryMiB%3A%204096%2C%0A%7D)%0A%0Ap%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22python%22%2C%20%22-c%22%2C%20%22print('hello%20world')%22%7D%2C%20nil)%0Astdout%2C%20_%20%3A%3D%20io.ReadAll(p.Stdout)%0Afmt.Println(string(stdout))%0AexitCode%2C%20_%20%3A%3D%20p.Wait(ctx%2C%20nil)%0Afmt.Println(%22exit%20code%3A%22%2C%20exitCode)%0A%0Asb.Terminate(ctx%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var M=c(j,2);d(M,{id:`feature-support`,children:(e,t)=>{l(),i(e,r(`Feature support`))},$$slots:{default:!0}});var N=c(M,2);u(N,{variant:`info`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}});var P=c(N,2);p(P,{children:(t,a)=>{var o=E(),u=c(s(o),2),d=c(e(u),6),f=c(e(d),2);g(c(e(f),4),{href:`/docs/guide/vm-sandboxes`,children:(e,t)=>{l(),i(e,r(`VM Sandboxes`))},$$slots:{default:!0}}),l(),n(f),n(d);var p=c(d,4),m=c(e(p),2);g(c(e(m),2),{href:`/docs/guide/sandbox-networking#custom-domains`,children:(e,t)=>{l(),i(e,r(`Custom domains`))},$$slots:{default:!0}}),l(),n(m),n(p);var h=c(p),_=c(e(h),2);g(c(e(_),2),{href:`/docs/guide/sandbox-networking#connecting-to-sandboxes-with-http-and-websockets`,children:(e,t)=>{l(),i(e,r(`Connecting to Sandboxes`))},$$slots:{default:!0}}),l(),n(_),n(h);var v=c(h),y=c(e(v),2);g(c(e(y),3),{href:`/docs/guide/sandbox-files`,children:(e,t)=>{l(),i(e,r(`Filesystem access`))},$$slots:{default:!0}}),l(11),n(y),n(v);var b=c(v,3),x=c(e(b),2);g(c(e(x),8),{href:`/docs/guide/sandbox-snapshots#memory-snapshots`,children:(e,t)=>{l(),i(e,r(`alpha`))},$$slots:{default:!0}}),l(),n(x),n(b);var S=c(b,3),C=c(e(S),2);g(c(e(C),4),{href:`/docs/guide/private-networking`,children:(e,t)=>{l(),i(e,r(`Private networking`))},$$slots:{default:!0}}),l(),n(C),n(S);var w=c(S),T=c(e(w),2);g(c(e(T),6),{href:`#retrieving-a-sandbox-by-name`,children:(e,t)=>{l(),i(e,r(`below`))},$$slots:{default:!0}}),l(),n(T),n(w);var D=c(w,3),O=c(e(D),2);g(c(e(O),2),{href:`/docs/guide/vm-sandboxes`,children:(e,t)=>{l(),i(e,r(`VM Sandboxes`))},$$slots:{default:!0}}),l(),n(O),n(D);var k=c(D),A=c(e(k),2);g(c(e(A),5),{href:`#retrieving-a-sandbox-by-id`,children:(e,t)=>{l(),i(e,r(`below`))},$$slots:{default:!0}}),l(),n(A),n(k),l(4),n(u),i(t,o)},$$slots:{default:!0}});var F=c(P,2);d(F,{id:`retrieving-a-sandbox-by-id`,children:(e,t)=>{l(),i(e,r(`Retrieving a Sandbox by ID`))},$$slots:{default:!0}});var I=c(F,4);_(I,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox._experimental_create(%22sleep%22%2C%20%22300%22%2C%20app%3Dsb_app)%0Asandbox_id%20%3D%20sb.object_id%0Aprint(f%22Sandbox%20ID%3A%20%7Bsandbox_id%7D%22)%0A%0A%23%20Later%2C%20reattach%3A%0Asb2%20%3D%20modal.Sandbox.from_id(sandbox_id)%0Ap%20%3D%20sb2.exec(%22echo%22%2C%20%22reattached%22)%0Aprint(p.stdout.read())%0Ap.wait()%0Asb2.terminate()`,lang:`python`})},python_async:e=>{m(e,{code:`sb%20%3D%20await%20modal.Sandbox._experimental_create.aio(%22sleep%22%2C%20%22300%22%2C%20app%3Dsb_app)%0Asandbox_id%20%3D%20sb.object_id%0Aprint(f%22Sandbox%20ID%3A%20%7Bsandbox_id%7D%22)%0A%0A%23%20Later%2C%20reattach%3A%0Asb2%20%3D%20await%20modal.Sandbox.from_id.aio(sandbox_id)%0Ap%20%3D%20await%20sb2.exec.aio(%22echo%22%2C%20%22reattached%22)%0Aprint(await%20p.stdout.read.aio())%0Aawait%20p.wait.aio()%0Aawait%20sb2.terminate.aio()`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%20createIfMissing%3A%20true%20%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22alpine%3A3.21%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.experimentalCreate(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22300%22%5D%2C%0A%7D)%3B%0Aconst%20sandboxId%20%3D%20sb.sandboxId%3B%0Aconsole.log(%60Sandbox%20ID%3A%20%24%7BsandboxId%7D%60)%3B%0A%0A%2F%2F%20Later%2C%20reattach%3A%0Aconst%20sb2%20%3D%20await%20modal.sandboxes.fromId(sandboxId)%3B%0Aconst%20p%20%3D%20await%20sb2.exec(%5B%22echo%22%2C%20%22reattached%22%5D)%3B%0Aconst%20output%20%3D%20await%20p.stdout.readText()%3B%0Aconsole.log(output)%3B%0Aawait%20p.wait()%3B%0Aawait%20sb2.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20_%20%3A%3D%20mc.Sandboxes.ExperimentalCreate(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%5B%5Dstring%7B%22sleep%22%2C%20%22300%22%7D%2C%0A%7D)%0AsandboxID%20%3A%3D%20sb.SandboxID%0Afmt.Printf(%22Sandbox%20ID%3A%20%25s%5Cn%22%2C%20sandboxID)%0A%0A%2F%2F%20Later%2C%20reattach%3A%0Asb2%2C%20_%20%3A%3D%20mc.Sandboxes.FromID(ctx%2C%20sandboxID%2C%20nil)%0Ap%2C%20_%20%3A%3D%20sb2.Exec(ctx%2C%20%5B%5Dstring%7B%22echo%22%2C%20%22reattached%22%7D%2C%20nil)%0Astdout%2C%20_%20%3A%3D%20io.ReadAll(p.Stdout)%0Afmt.Println(string(stdout))%0Asb2.Terminate(ctx%2C%20nil)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var L=c(I,2);d(L,{id:`retrieving-a-sandbox-by-name`,children:(e,t)=>{l(),i(e,r(`Retrieving a Sandbox by name`))},$$slots:{default:!0}});var R=c(L,4);_(R,{python:e=>{m(e,{code:`app%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox._experimental_create(%22sleep%22%2C%20%22300%22%2C%20app%3Dapp%2C%20name%3D%22my-sandbox%22)%0A%0A%23%20Later%2C%20from%20a%20deployed%20App%2C%20resolve%20the%20running%20Sandbox%20by%20name%3A%0Asb2%20%3D%20modal.Sandbox._experimental_from_name(%22my-app%22%2C%20%22my-sandbox%22)%0Aassert%20sb.object_id%20%3D%3D%20sb2.object_id`,lang:`python`})},python_async:e=>{m(e,{code:`app%20%3D%20await%20modal.App.lookup.aio(%22my-app%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20await%20modal.Sandbox._experimental_create.aio(%22sleep%22%2C%20%22300%22%2C%20app%3Dapp%2C%20name%3D%22my-sandbox%22)%0A%0A%23%20Later%2C%20from%20a%20deployed%20App%2C%20resolve%20the%20running%20Sandbox%20by%20name%3A%0Asb2%20%3D%20await%20modal.Sandbox._experimental_from_name.aio(%22my-app%22%2C%20%22my-sandbox%22)%0Aassert%20sb.object_id%20%3D%3D%20sb2.object_id`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%20createIfMissing%3A%20true%20%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22alpine%3A3.21%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.experimentalCreate(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22300%22%5D%2C%0A%20%20name%3A%20%22my-sandbox%22%2C%0A%7D)%3B%0A%0A%2F%2F%20Later%2C%20from%20a%20deployed%20App%2C%20resolve%20the%20running%20Sandbox%20by%20name%3A%0Aconst%20sb2%20%3D%20await%20modal.sandboxes.experimentalFromName(%22my-app%22%2C%20%22my-sandbox%22)%3B%0Aconsole.assert(sb.sandboxId%20%3D%3D%3D%20sb2.sandboxId)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22my-app%22%2C%20%26modal.AppFromNameParams%7BCreateIfMissing%3A%20true%7D)%0Aimage%20%3A%3D%20mc.Images.FromRegistry(%22alpine%3A3.21%22%2C%20nil)%0A%0Asb%2C%20_%20%3A%3D%20mc.Sandboxes.ExperimentalCreate(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%5B%5Dstring%7B%22sleep%22%2C%20%22300%22%7D%2C%0A%09Name%3A%20%20%20%20%22my-sandbox%22%2C%0A%7D)%0A%0A%2F%2F%20Later%2C%20from%20a%20deployed%20App%2C%20resolve%20the%20running%20Sandbox%20by%20name%3A%0Asb2%2C%20_%20%3A%3D%20mc.Sandboxes.ExperimentalFromName(ctx%2C%20%22my-app%22%2C%20%22my-sandbox%22%2C%20nil)%0Afmt.Println(sb.SandboxID%20%3D%3D%20sb2.SandboxID)`,lang:`go`})},$$slots:{python:!0,python_async:!0,javascript:!0,go:!0}});var z=c(R,4);d(z,{id:`miscellaneous`,children:(e,t)=>{l(),i(e,r(`Miscellaneous`))},$$slots:{default:!0}});var B=c(z,2),V=e(B),H=c(e(V),9);m(H,{code:`sb%20%3D%20modal.Sandbox._experimental_create(app%3Dapp%2C%20readiness_probe%3Dsome_probe)%0Asb.wait_until_ready()`,lang:`python`}),g(c(H,2),{href:`/docs/guide/sandboxes#events`,children:(e,t)=>{l(),i(e,r(`the sandbox documentation`))},$$slots:{default:!0}}),l(),n(V),n(B);var U=c(B,2),W=c(e(U));g(W,{href:`/slack`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),g(c(W,2),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(U),i(t,o)},$$slots:{default:!0}}))}export{O as default,v as metadata};
//# sourceMappingURL=DeUoFla22.js.map
