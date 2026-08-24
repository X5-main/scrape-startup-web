(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`849f44ab-0de9-47bc-9ea6-8d797522fa46`,e._sentryDebugIdIdentifier=`sentry-dbid-849f44ab-0de9-47bc-9ea6-8d797522fa46`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{n as m}from"./JPsrybyr.js";import{t as h}from"./BILrvr3I.js";import{t as g}from"./B4L_if842.js";import{t as _}from"./DeWGVqas2.js";import{t as v}from"./D0Ft4u302.js";var y={description:`Use Customer Supplied Encryption Keys to protect supported Modal resources with key material that Modal does not store.`,toc:[{depth:1,value:`Customer Supplied Encryption Keys`,id:`customer-supplied-encryption-keys`,children:[{depth:2,value:`How CSEK works`,id:`how-csek-works`},{depth:2,value:`Supported resources`,id:`supported-resources`},{depth:2,value:`Directory Snapshots`,id:`directory-snapshots`,children:[{depth:3,value:`Create a CSEK-protected directory snapshot`,id:`create-a-csek-protected-directory-snapshot`},{depth:3,value:`Mount a CSEK-protected directory snapshot`,id:`mount-a-csek-protected-directory-snapshot`},{depth:3,value:`Re-snapshotting encrypted directories`,id:`re-snapshotting-encrypted-directories`},{depth:3,value:`Retention`,id:`retention`}]}]}],rawContent:`# Customer Supplied Encryption Keys



<Callout variant="alpha" />

Customer Supplied Encryption Keys (CSEK) let you provide your own key material
when creating supported Modal resources. Modal uses the key as part of the
resource encryption flow, but does not persist the key.

Use CSEK when you need customer-held key material for data that Modal stores.
You are responsible for generating, storing, backing up, and providing the key
again when the protected resource is used.

<Callout variant="warning">

If you lose the CSEK for a protected resource, Modal cannot recover it for you.
Store the key in a durable key management system outside Modal.

</Callout>

## How CSEK works

For each supported resource, the same basic flow applies:

1. Generate key material with a cryptographically secure random source.
2. Pass the key when creating the resource.
3. Store the resource ID and key in your own system.
4. Pass the same key again when reading, mounting, or restoring the resource.

The key material must not be empty and must be between 16 and 512 bytes long.

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import secrets
encryption_key = secrets.token_bytes(32)
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { randomBytes } from "node:crypto";
const encryptionKey = randomBytes(32);
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
encryptionKey := make([]byte, 32)
if _, err := rand.Read(encryptionKey); err != nil {
	// Handle key generation errors.
}
\`\`\`

{/snippet}
</CodeTabs>

Do not commit CSEK material to source control, bake it into Images, print it in
logs, or store it next to the data it protects. Prefer a dedicated key
management system or secrets manager with access controls and backup policies
that match your security requirements.

## Supported resources

This page documents CSEK for the currently supported resources. As CSEK support
becomes available for more Modal resources, additional sections will be added.

| Resource                                    | SDK support                |
| ------------------------------------------- | -------------------------- |
| [Directory Snapshots](#directory-snapshots) | Python, JavaScript, Go SDK |

## Directory Snapshots

[Directory Snapshots](/docs/guide/sandbox-snapshots#directory-snapshots) let
you capture a directory from a running Sandbox as an
[Image](/docs/sdk/py/latest/Image). With CSEK, you pass key material when
creating the snapshot and pass the same key again when mounting it.

### Create a CSEK-protected directory snapshot

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import secrets

import modal

app = modal.App.lookup("csek-directory-snapshots", create_if_missing=True)
encryption_key = secrets.token_bytes(32)

sb = modal.Sandbox.create(app=app)
sb.exec(
    "bash",
    "-c",
    "mkdir -p /project && echo 'private data' > /project/state.txt",
).wait()

snapshot = sb.snapshot_directory(
    "/project",
    _experimental_encryption_key=encryption_key,
)
sb.terminate()

# Store both values in your own durable systems.
snapshot_id = snapshot.object_id
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { randomBytes } from "node:crypto";
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("csek-directory-snapshots", {
  createIfMissing: true,
});
const image = modal.images.fromRegistry("debian:12-slim");
const encryptionKey = randomBytes(32);

const sb = await modal.sandboxes.create(app, image);
await (
  await sb.exec([
    "bash",
    "-c",
    "mkdir -p /project && echo 'private data' > /project/state.txt",
  ])
).wait();

const snapshot = await sb.snapshotDirectory("/project", {
  experimentalEncryptionKey: encryptionKey,
});
await sb.terminate();

// Store both values in your own durable systems.
const snapshotId = snapshot.imageId;
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
package main

import (
	"context"
	"crypto/rand"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	ctx := context.Background()
	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "csek-directory-snapshots", &modal.AppFromNameParams{
		CreateIfMissing: true,
	})
	image := mc.Images.FromRegistry("debian:12-slim", nil)
	encryptionKey := make([]byte, 32)
	if _, err := rand.Read(encryptionKey); err != nil {
		panic(err) // Handle this error.
	}

	sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
	process, _ := sb.Exec(ctx, []string{
		"bash",
		"-c",
		"mkdir -p /project && echo 'private data' > /project/state.txt",
	}, nil)
	process.Wait(ctx, nil)

	snapshot, _ := sb.SnapshotDirectory(ctx, "/project", &modal.SandboxSnapshotDirectoryParams{
		ExperimentalEncryptionKey: encryptionKey,
	})
	sb.Terminate(ctx, nil)

	// Store both values in your own durable systems.
	snapshotID := snapshot.ImageID
	_ = snapshotID
}
\`\`\`

{/snippet}
</CodeTabs>

The encryption key parameter is currently exposed as an experimental SDK API.
See [Feature maturity](/docs/guide/feature-maturity#experimental-sdk) for how
Modal treats experimental SDK surfaces.

### Mount a CSEK-protected directory snapshot

To use the snapshot later, rehydrate the Image by ID and pass the same key to
the mount operation.

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
import modal

app = modal.App.lookup("csek-directory-snapshots")
snapshot = modal.Image.from_id(snapshot_id)

sb = modal.Sandbox.create(app=app)
sb.mount_image(
    "/project",
    snapshot,
    _experimental_encryption_key=encryption_key,
)

contents = sb.exec("cat", "/project/state.txt").stdout.read().strip()
assert contents == "private data"
sb.terminate()
\`\`\`

{/snippet}
{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("csek-directory-snapshots");
const snapshot = await modal.images.fromId(snapshotId);
const image = modal.images.fromRegistry("debian:12-slim");

const sb = await modal.sandboxes.create(app, image);
await sb.mountImage("/project", snapshot, {
  experimentalEncryptionKey: encryptionKey,
});

const contents = await (
  await sb.exec(["cat", "/project/state.txt"])
).stdout.readText();
console.assert(contents.trim() === "private data");
await sb.terminate();
\`\`\`

{/snippet}
{#snippet go()}

\`\`\`go notest
package main

import (
	"context"
	"io"
	"strings"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	ctx := context.Background()
	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "csek-directory-snapshots", nil)
	snapshot, _ := mc.Images.FromID(ctx, snapshotID, nil)
	image := mc.Images.FromRegistry("debian:12-slim", nil)

	sb, _ := mc.Sandboxes.Create(ctx, app, image, nil)
	sb.MountImage(ctx, "/project", snapshot, &modal.SandboxMountImageParams{
		ExperimentalEncryptionKey: encryptionKey,
	})

	process, _ := sb.Exec(ctx, []string{"cat", "/project/state.txt"}, nil)
	contents, _ := io.ReadAll(process.Stdout)
	if strings.TrimSpace(string(contents)) != "private data" {
		panic("unexpected contents")
	}
	sb.Terminate(ctx, nil)
}
\`\`\`

{/snippet}
</CodeTabs>

If the key is missing or incorrect, Modal cannot mount the encrypted snapshot.

### Re-snapshotting encrypted directories

After mounting a CSEK-protected directory snapshot, you can create another
directory snapshot from that mounted path:

- Pass the encryption key parameter to protect the new snapshot with CSEK.
- Omit the encryption key parameter to create the new snapshot with Modal-managed
  encryption.

Each CSEK-protected snapshot is tied to the key used when that snapshot was
created. If you create a new CSEK-protected snapshot with a different key, use
the new key when mounting the new snapshot.

### Retention

CSEK does not change Directory Snapshot retention. Directory Snapshots are
retained for 30 days after creation. See [Snapshot Retention](/docs/guide/sandbox-snapshots#snapshot-retention)
for details.
`,meta:{title:`Customer Supplied Encryption Keys`,description:`Use Customer Supplied Encryption Keys to protect supported Modal resources with key material that Modal does not store.`}},{description:b,toc:x,rawContent:S,meta:C}=y,w=t(`<p>If you lose the CSEK for a protected resource, Modal cannot recover it for you.
Store the key in a durable key management system outside Modal.</p>`),T=t(`<thead><tr><th>Resource</th><th>SDK support</th></tr></thead> <tbody><tr><td><!></td><td>Python, JavaScript, Go SDK</td></tr></tbody>`,1),E=t(`<!> <!> <p>Customer Supplied Encryption Keys (CSEK) let you provide your own key material
when creating supported Modal resources. Modal uses the key as part of the
resource encryption flow, but does not persist the key.</p> <p>Use CSEK when you need customer-held key material for data that Modal stores.
You are responsible for generating, storing, backing up, and providing the key
again when the protected resource is used.</p> <!> <!> <p>For each supported resource, the same basic flow applies:</p> <ol><li>Generate key material with a cryptographically secure random source.</li> <li>Pass the key when creating the resource.</li> <li>Store the resource ID and key in your own system.</li> <li>Pass the same key again when reading, mounting, or restoring the resource.</li></ol> <p>The key material must not be empty and must be between 16 and 512 bytes long.</p> <!> <p>Do not commit CSEK material to source control, bake it into Images, print it in
logs, or store it next to the data it protects. Prefer a dedicated key
management system or secrets manager with access controls and backup policies
that match your security requirements.</p> <!> <p>This page documents CSEK for the currently supported resources. As CSEK support
becomes available for more Modal resources, additional sections will be added.</p> <!> <!> <p><!> let
you capture a directory from a running Sandbox as an <!>. With CSEK, you pass key material when
creating the snapshot and pass the same key again when mounting it.</p> <!> <!> <p>The encryption key parameter is currently exposed as an experimental SDK API.
See <!> for how
Modal treats experimental SDK surfaces.</p> <!> <p>To use the snapshot later, rehydrate the Image by ID and pass the same key to
the mount operation.</p> <!> <p>If the key is missing or incorrect, Modal cannot mount the encrypted snapshot.</p> <!> <p>After mounting a CSEK-protected directory snapshot, you can create another
directory snapshot from that mounted path:</p> <ul><li>Pass the encryption key parameter to protect the new snapshot with CSEK.</li> <li>Omit the encryption key parameter to create the new snapshot with Modal-managed
encryption.</li></ul> <p>Each CSEK-protected snapshot is tied to the key used when that snapshot was
created. If you create a new CSEK-protected snapshot with a different key, use
the new key when mounting the new snapshot.</p> <!> <p>CSEK does not change Directory Snapshot retention. Directory Snapshots are
retained for 30 days after creation. See <!> for details.</p>`,1);function D(t,b){let x=a(b,[`children`,`$$slots`,`$$events`,`$$legacy`]);g(t,o(()=>x,()=>y,{children:(t,a)=>{var o=E(),g=s(o);p(g,{id:`customer-supplied-encryption-keys`,children:(e,t)=>{l(),i(e,r(`Customer Supplied Encryption Keys`))},$$slots:{default:!0}});var y=c(g,2);u(y,{variant:`alpha`});var b=c(y,6);u(b,{variant:`warning`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}});var x=c(b,2);d(x,{id:`how-csek-works`,children:(e,t)=>{l(),i(e,r(`How CSEK works`))},$$slots:{default:!0}});var S=c(x,8);v(S,{python:e=>{h(e,{code:`import%20secrets%0Aencryption_key%20%3D%20secrets.token_bytes(32)`,lang:`python`})},javascript:e=>{h(e,{code:`import%20%7B%20randomBytes%20%7D%20from%20%22node%3Acrypto%22%3B%0Aconst%20encryptionKey%20%3D%20randomBytes(32)%3B`,lang:`javascript`})},go:e=>{h(e,{code:`encryptionKey%20%3A%3D%20make(%5B%5Dbyte%2C%2032)%0Aif%20_%2C%20err%20%3A%3D%20rand.Read(encryptionKey)%3B%20err%20!%3D%20nil%20%7B%0A%09%2F%2F%20Handle%20key%20generation%20errors.%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var C=c(S,4);d(C,{id:`supported-resources`,children:(e,t)=>{l(),i(e,r(`Supported resources`))},$$slots:{default:!0}});var D=c(C,4);m(D,{children:(t,a)=>{var o=T(),u=c(s(o),2),d=e(u),f=e(d);_(e(f),{href:`#directory-snapshots`,children:(e,t)=>{l(),i(e,r(`Directory Snapshots`))},$$slots:{default:!0}}),n(f),l(),n(d),n(u),i(t,o)},$$slots:{default:!0}});var O=c(D,2);d(O,{id:`directory-snapshots`,children:(e,t)=>{l(),i(e,r(`Directory Snapshots`))},$$slots:{default:!0}});var k=c(O,2),A=e(k);_(A,{href:`/docs/guide/sandbox-snapshots#directory-snapshots`,children:(e,t)=>{l(),i(e,r(`Directory Snapshots`))},$$slots:{default:!0}}),_(c(A,2),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(k);var j=c(k,2);f(j,{id:`create-a-csek-protected-directory-snapshot`,children:(e,t)=>{l(),i(e,r(`Create a CSEK-protected directory snapshot`))},$$slots:{default:!0}});var M=c(j,2);v(M,{python:e=>{h(e,{code:`import%20secrets%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22csek-directory-snapshots%22%2C%20create_if_missing%3DTrue)%0Aencryption_key%20%3D%20secrets.token_bytes(32)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0Asb.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22mkdir%20-p%20%2Fproject%20%26%26%20echo%20'private%20data'%20%3E%20%2Fproject%2Fstate.txt%22%2C%0A).wait()%0A%0Asnapshot%20%3D%20sb.snapshot_directory(%0A%20%20%20%20%22%2Fproject%22%2C%0A%20%20%20%20_experimental_encryption_key%3Dencryption_key%2C%0A)%0Asb.terminate()%0A%0A%23%20Store%20both%20values%20in%20your%20own%20durable%20systems.%0Asnapshot_id%20%3D%20snapshot.object_id`,lang:`python`})},javascript:e=>{h(e,{code:`import%20%7B%20randomBytes%20%7D%20from%20%22node%3Acrypto%22%3B%0Aimport%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22csek-directory-snapshots%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22debian%3A12-slim%22)%3B%0Aconst%20encryptionKey%20%3D%20randomBytes(32)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0Aawait%20(%0A%20%20await%20sb.exec(%5B%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22mkdir%20-p%20%2Fproject%20%26%26%20echo%20'private%20data'%20%3E%20%2Fproject%2Fstate.txt%22%2C%0A%20%20%5D)%0A).wait()%3B%0A%0Aconst%20snapshot%20%3D%20await%20sb.snapshotDirectory(%22%2Fproject%22%2C%20%7B%0A%20%20experimentalEncryptionKey%3A%20encryptionKey%2C%0A%7D)%3B%0Aawait%20sb.terminate()%3B%0A%0A%2F%2F%20Store%20both%20values%20in%20your%20own%20durable%20systems.%0Aconst%20snapshotId%20%3D%20snapshot.imageId%3B`,lang:`javascript`})},go:e=>{h(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%09%22crypto%2Frand%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22csek-directory-snapshots%22%2C%20%26modal.AppFromNameParams%7B%0A%09%09CreateIfMissing%3A%20true%2C%0A%09%7D)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22debian%3A12-slim%22%2C%20nil)%0A%09encryptionKey%20%3A%3D%20make(%5B%5Dbyte%2C%2032)%0A%09if%20_%2C%20err%20%3A%3D%20rand.Read(encryptionKey)%3B%20err%20!%3D%20nil%20%7B%0A%09%09panic(err)%20%2F%2F%20Handle%20this%20error.%0A%09%7D%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0A%09process%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%0A%09%09%22bash%22%2C%0A%09%09%22-c%22%2C%0A%09%09%22mkdir%20-p%20%2Fproject%20%26%26%20echo%20'private%20data'%20%3E%20%2Fproject%2Fstate.txt%22%2C%0A%09%7D%2C%20nil)%0A%09process.Wait(ctx%2C%20nil)%0A%0A%09snapshot%2C%20_%20%3A%3D%20sb.SnapshotDirectory(ctx%2C%20%22%2Fproject%22%2C%20%26modal.SandboxSnapshotDirectoryParams%7B%0A%09%09ExperimentalEncryptionKey%3A%20encryptionKey%2C%0A%09%7D)%0A%09sb.Terminate(ctx%2C%20nil)%0A%0A%09%2F%2F%20Store%20both%20values%20in%20your%20own%20durable%20systems.%0A%09snapshotID%20%3A%3D%20snapshot.ImageID%0A%09_%20%3D%20snapshotID%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var N=c(M,2);_(c(e(N)),{href:`/docs/guide/feature-maturity#experimental-sdk`,children:(e,t)=>{l(),i(e,r(`Feature maturity`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);f(P,{id:`mount-a-csek-protected-directory-snapshot`,children:(e,t)=>{l(),i(e,r(`Mount a CSEK-protected directory snapshot`))},$$slots:{default:!0}});var F=c(P,4);v(F,{python:e=>{h(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22csek-directory-snapshots%22)%0Asnapshot%20%3D%20modal.Image.from_id(snapshot_id)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0Asb.mount_image(%0A%20%20%20%20%22%2Fproject%22%2C%0A%20%20%20%20snapshot%2C%0A%20%20%20%20_experimental_encryption_key%3Dencryption_key%2C%0A)%0A%0Acontents%20%3D%20sb.exec(%22cat%22%2C%20%22%2Fproject%2Fstate.txt%22).stdout.read().strip()%0Aassert%20contents%20%3D%3D%20%22private%20data%22%0Asb.terminate()`,lang:`python`})},javascript:e=>{h(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22csek-directory-snapshots%22)%3B%0Aconst%20snapshot%20%3D%20await%20modal.images.fromId(snapshotId)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22debian%3A12-slim%22)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0Aawait%20sb.mountImage(%22%2Fproject%22%2C%20snapshot%2C%20%7B%0A%20%20experimentalEncryptionKey%3A%20encryptionKey%2C%0A%7D)%3B%0A%0Aconst%20contents%20%3D%20await%20(%0A%20%20await%20sb.exec(%5B%22cat%22%2C%20%22%2Fproject%2Fstate.txt%22%5D)%0A).stdout.readText()%3B%0Aconsole.assert(contents.trim()%20%3D%3D%3D%20%22private%20data%22)%3B%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{h(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%09%22io%22%0A%09%22strings%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22csek-directory-snapshots%22%2C%20nil)%0A%09snapshot%2C%20_%20%3A%3D%20mc.Images.FromID(ctx%2C%20snapshotID%2C%20nil)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22debian%3A12-slim%22%2C%20nil)%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0A%09sb.MountImage(ctx%2C%20%22%2Fproject%22%2C%20snapshot%2C%20%26modal.SandboxMountImageParams%7B%0A%09%09ExperimentalEncryptionKey%3A%20encryptionKey%2C%0A%09%7D)%0A%0A%09process%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22cat%22%2C%20%22%2Fproject%2Fstate.txt%22%7D%2C%20nil)%0A%09contents%2C%20_%20%3A%3D%20io.ReadAll(process.Stdout)%0A%09if%20strings.TrimSpace(string(contents))%20!%3D%20%22private%20data%22%20%7B%0A%09%09panic(%22unexpected%20contents%22)%0A%09%7D%0A%09sb.Terminate(ctx%2C%20nil)%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var I=c(F,4);f(I,{id:`re-snapshotting-encrypted-directories`,children:(e,t)=>{l(),i(e,r(`Re-snapshotting encrypted directories`))},$$slots:{default:!0}});var L=c(I,8);f(L,{id:`retention`,children:(e,t)=>{l(),i(e,r(`Retention`))},$$slots:{default:!0}});var R=c(L,2);_(c(e(R)),{href:`/docs/guide/sandbox-snapshots#snapshot-retention`,children:(e,t)=>{l(),i(e,r(`Snapshot Retention`))},$$slots:{default:!0}}),l(),n(R),i(t,o)},$$slots:{default:!0}}))}export{D as default,y as metadata};
//# sourceMappingURL=50Iz7GsS2.js.map
