(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ea05ddbd-f8b6-40f2-8f70-66a06f303764`,e._sentryDebugIdIdentifier=`sentry-dbid-ea05ddbd-f8b6-40f2-8f70-66a06f303764`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";import{t as _}from"./D0Ft4u302.js";var v={description:`Run additional containers alongside your primary Sandbox container on the same host`,toc:[{depth:1,value:`Sandbox Sidecars`,id:`sandbox-sidecars`,children:[{depth:2,value:`Introduction`,id:`introduction`},{depth:2,value:`Usage`,id:`usage`,children:[{depth:3,value:`Creating a Sidecar container`,id:`creating-a-sidecar-container`},{depth:3,value:`Listing and retrieving sidecars`,id:`listing-and-retrieving-sidecars`}]},{depth:2,value:`Resource configuration`,id:`resource-configuration`},{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# Sandbox Sidecars

<Callout variant="alpha">

There are currently several [known limitations](#limitations).

</Callout>

## Introduction

Sandbox Sidecars let you run additional containers alongside your main
Sandbox container, on the same host. A sandbox and its sidecars are connected
via an internal bridge network, allowing low latency communication between
containers over TCP/UDP, making them ideal for:

- Separating an agent harness from its execution environment, by running the
  agent in one container and its tool calls in another
- Credentials injection, by running a proxy in a separate, trusted container
  from the primary application, and letting that proxy inject credentials or
  other secrets before passing on network calls to external services.
  See the [secrets injection example](/docs/examples/sidecar_secrets_injection)
  for a working demonstration
- Splitting out complex multi-service applications over separate containers,
  such as databases, caches or worker processes, similar to Docker Compose.

We're still discovering all the ways that Sandbox Sidecars can be used - if you
come up with another use case, please let us know!

Sidecars are managed through the sidecars interface on a Sandbox
(\`_experimental_sidecars\` in Python, \`experimentalSidecars\` in JS/Go),
which provides methods to create, list, get, and terminate Sidecar containers.

Each Sidecar container:

- Runs its own image independently from the main Sandbox container.
- Runs in a separate, sandboxed process isolated from the main Sandbox container and other Sidecar containers.
- Can communicate over an internal bridge network with the main Sandbox container and other Sidecar containers.
- Can be created, terminated, and replaced dynamically during the Sandbox's lifetime.
- Supports executing commands just like the main Sandbox container.

## Usage

### Creating a Sidecar container

The main Sandbox container is resolvable as \`main\`, and each Sidecar container
is resolvable by the \`name\` you give it at creation time.

<CodeTabs>
{#snippet python()}

\`\`\`python notest
import modal

app = modal.App.lookup("sidecar-example", create_if_missing=True)
image = modal.Image.debian_slim().build(app)

sb = modal.Sandbox.create("sleep", "600", app=app, image=image, timeout=300)

sidecar = sb._experimental_sidecars.create(
    "python",
    "-m",
    "http.server",
    "8080",
    name="web",
    image=image,
)

# Give the server a moment to start, then call it from the main sandbox.
p = sb.exec(
    "python",
    "-c",
    "import time, urllib.request; time.sleep(1); print(urllib.request.urlopen('http://web:8080').status)",
)
p.wait()
print(p.stdout.read())  # "200"

sb.terminate()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
import { ModalClient } from "modal";

const modal = new ModalClient();
const app = await modal.apps.fromName("sidecar-example", {
  createIfMissing: true,
});
const image = await modal.images.fromRegistry("python:3.13-slim").build(app);

const sb = await modal.sandboxes.create(app, image, {
  command: ["sleep", "600"],
  timeoutMs: 300 * 1000,
});

const sidecar = await sb.experimentalSidecars.create("web", image, {
  command: ["python", "-m", "http.server", "8080"],
});

// Give the server a moment to start, then call it from the main sandbox.
const p = await sb.exec([
  "python",
  "-c",
  "import time, urllib.request; time.sleep(1); print(urllib.request.urlopen('http://web:8080').status)",
]);
await p.wait();
console.log(await p.stdout.readText()); // "200"

await sb.terminate();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
package main

import (
	"context"
	"fmt"
	"io"
	"time"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	ctx := context.Background()
	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "sidecar-example", &modal.AppFromNameParams{
		CreateIfMissing: true,
	})
	image, _ := mc.Images.FromRegistry("python:3.13-slim", nil).Build(ctx, app, nil)

	sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
		Command: []string{"sleep", "600"},
		Timeout: 5 * time.Minute,
	})
	defer sb.Terminate(ctx, nil)

	sidecar, _ := sb.ExperimentalSidecars.Create(ctx, "web", image, &modal.SidecarCreateParams{
		Command: []string{"python", "-m", "http.server", "8080"},
	})
	_ = sidecar

	// Give the server a moment to start, then call it from the main sandbox.
	p, _ := sb.Exec(ctx, []string{
		"python", "-c",
		"import time, urllib.request; time.sleep(1); print(urllib.request.urlopen('http://web:8080').status)",
	}, nil)
	stdout, _ := io.ReadAll(p.Stdout)
	fmt.Println(string(stdout)) // "200"
}
\`\`\`

{/snippet}
</CodeTabs>

Names are resolved using \`/etc/hosts\` which gets updated when a sidecar is created or terminated.

### Listing and retrieving sidecars

You can list all running Sidecar containers or retrieve a specific one by name:

<CodeTabs>
{#snippet python()}

\`\`\`python notest
containers = sb._experimental_sidecars.list()
for container in containers:
    print(f"{container.name}: {container.object_id}")

sidecar = sb._experimental_sidecars.get(name="web")
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const containers = await sb.experimentalSidecars.list();
for (const container of containers) {
  console.log(\`\${container.containerName}: \${container.containerId}\`);
}

const sidecar = await sb.experimentalSidecars.get("web");
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
containers, _ := sb.ExperimentalSidecars.List(ctx, nil)
for _, container := range containers {
	fmt.Printf("%s: %s\\n", container.ContainerName, container.ContainerID)
}

sidecar, _ := sb.ExperimentalSidecars.Get(ctx, "web", nil)
_ = sidecar
\`\`\`

{/snippet}
</CodeTabs>

## Resource configuration

The main Sandbox container and the Sidecar containers share the resource allocation (CPU and memory) of the Sandbox,
and resources are configured only on the Sandbox. When planning your
resource allocation, make sure the Sandbox is configured with enough CPU
and memory for all containers combined.
Bursting is still possible, see the [guide to Sandbox resources and
pricing](/docs/guide/sandbox-resources) for more details.

For example, if you want to run a Sandbox with two Sidecars, and you expect the main
container to use 1 CPU core and 512 MiB of memory, Sidecar A to use 0.5 CPU and 256 MiB,
and Sidecar B to use 0.5 CPU and 256 MiB, you should set the Sandbox's resources to at
least 2 CPUs and 1024 MiB to accommodate all three containers.

The maximum number of Sidecars you can create is also determined by the main Sandbox's
resource reservation. Each container (including the main one) requires a minimum of
32 mCPU and 32 MiB of memory, so the limit is:

    max containers = min(cpu_in_milli / 32, memory_in_mib / 32)

There is also a hard limit of **250** concurrent sidecar containers per sandbox,
regardless of the resource reservation.

## Limitations

The main sandbox supports the same features as a regular sandbox, but some features are not yet supported
for sidecars:

- **Pre-built images only**: Sidecar images must be pre-built using \`image.build()\`, referenced
  by ID via \`Image.from_id()\` or name via \`Image.from_name()\`, or created from filesystem/directory snapshots. Lazy image
  building is not supported for sidecars. See also [Separating Image builds from Sandbox creation](/docs/guide/sandboxes#separating-image-builds-from-sandbox-creation).
- **No Cloud Bucket Mount support**: Sidecar containers do not currently support attaching [Cloud Bucket Mounts](/docs/guide/cloud-bucket-mounts).
- **No snapshot support**: Sidecar container state is not captured in
  [Sandbox snapshots](/docs/guide/sandbox-snapshots).
- **VM incompatibility**: Sidecars are not compatible with VM Sandboxes.
- **Changes to /etc/hosts are not preserved**: \`/etc/hosts\` is rewritten on sidecar create/terminate and user changes are not preserved.
- **Maximum of 250 concurrent sidecars**: A sandbox can have at most 250 sidecar containers running at the same time.
`,meta:{title:`Sandbox Sidecars`,description:`Run additional containers alongside your primary Sandbox container on the same host`}},{description:y,toc:b,rawContent:x,meta:S}=v,C=t(`<p>There are currently several <!>.</p>`),w=t(`<!> <!> <!> <p>Sandbox Sidecars let you run additional containers alongside your main
Sandbox container, on the same host. A sandbox and its sidecars are connected
via an internal bridge network, allowing low latency communication between
containers over TCP/UDP, making them ideal for:</p> <ul><li>Separating an agent harness from its execution environment, by running the
agent in one container and its tool calls in another</li> <li>Credentials injection, by running a proxy in a separate, trusted container
from the primary application, and letting that proxy inject credentials or
other secrets before passing on network calls to external services.
See the <!> for a working demonstration</li> <li>Splitting out complex multi-service applications over separate containers,
such as databases, caches or worker processes, similar to Docker Compose.</li></ul> <p>We’re still discovering all the ways that Sandbox Sidecars can be used - if you
come up with another use case, please let us know!</p> <p>Sidecars are managed through the sidecars interface on a Sandbox
(<code>_experimental_sidecars</code> in Python, <code>experimentalSidecars</code> in JS/Go),
which provides methods to create, list, get, and terminate Sidecar containers.</p> <p>Each Sidecar container:</p> <ul><li>Runs its own image independently from the main Sandbox container.</li> <li>Runs in a separate, sandboxed process isolated from the main Sandbox container and other Sidecar containers.</li> <li>Can communicate over an internal bridge network with the main Sandbox container and other Sidecar containers.</li> <li>Can be created, terminated, and replaced dynamically during the Sandbox’s lifetime.</li> <li>Supports executing commands just like the main Sandbox container.</li></ul> <!> <!> <p>The main Sandbox container is resolvable as <code>main</code>, and each Sidecar container
is resolvable by the <code>name</code> you give it at creation time.</p> <!> <p>Names are resolved using <code>/etc/hosts</code> which gets updated when a sidecar is created or terminated.</p> <!> <p>You can list all running Sidecar containers or retrieve a specific one by name:</p> <!> <!> <p>The main Sandbox container and the Sidecar containers share the resource allocation (CPU and memory) of the Sandbox,
and resources are configured only on the Sandbox. When planning your
resource allocation, make sure the Sandbox is configured with enough CPU
and memory for all containers combined.
Bursting is still possible, see the <!> for more details.</p> <p>For example, if you want to run a Sandbox with two Sidecars, and you expect the main
container to use 1 CPU core and 512 MiB of memory, Sidecar A to use 0.5 CPU and 256 MiB,
and Sidecar B to use 0.5 CPU and 256 MiB, you should set the Sandbox’s resources to at
least 2 CPUs and 1024 MiB to accommodate all three containers.</p> <p>The maximum number of Sidecars you can create is also determined by the main Sandbox’s
resource reservation. Each container (including the main one) requires a minimum of
32 mCPU and 32 MiB of memory, so the limit is:</p> <p>max containers = min(cpu_in_milli / 32, memory_in_mib / 32)</p> <p>There is also a hard limit of <strong>250</strong> concurrent sidecar containers per sandbox,
regardless of the resource reservation.</p> <!> <p>The main sandbox supports the same features as a regular sandbox, but some features are not yet supported
for sidecars:</p> <ul><li><strong>Pre-built images only</strong>: Sidecar images must be pre-built using <code>image.build()</code>, referenced
by ID via <code>Image.from_id()</code> or name via <code>Image.from_name()</code>, or created from filesystem/directory snapshots. Lazy image
building is not supported for sidecars. See also <!>.</li> <li><strong>No Cloud Bucket Mount support</strong>: Sidecar containers do not currently support attaching <!>.</li> <li><strong>No snapshot support</strong>: Sidecar container state is not captured in <!>.</li> <li><strong>VM incompatibility</strong>: Sidecars are not compatible with VM Sandboxes.</li> <li><strong>Changes to /etc/hosts are not preserved</strong>: <code>/etc/hosts</code> is rewritten on sidecar create/terminate and user changes are not preserved.</li> <li><strong>Maximum of 250 concurrent sidecars</strong>: A sandbox can have at most 250 sidecar containers running at the same time.</li></ul>`,1);function T(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>b,()=>v,{children:(t,a)=>{var o=w(),h=s(o);p(h,{id:`sandbox-sidecars`,children:(e,t)=>{l(),i(e,r(`Sandbox Sidecars`))},$$slots:{default:!0}});var v=c(h,2);u(v,{variant:`alpha`,children:(t,a)=>{var o=C();g(c(e(o)),{href:`#limitations`,children:(e,t)=>{l(),i(e,r(`known limitations`))},$$slots:{default:!0}}),l(),n(o),i(t,o)},$$slots:{default:!0}});var y=c(v,2);d(y,{id:`introduction`,children:(e,t)=>{l(),i(e,r(`Introduction`))},$$slots:{default:!0}});var b=c(y,4),x=c(e(b),2);g(c(e(x)),{href:`/docs/examples/sidecar_secrets_injection`,children:(e,t)=>{l(),i(e,r(`secrets injection example`))},$$slots:{default:!0}}),l(),n(x),l(2),n(b);var S=c(b,10);d(S,{id:`usage`,children:(e,t)=>{l(),i(e,r(`Usage`))},$$slots:{default:!0}});var T=c(S,2);f(T,{id:`creating-a-sidecar-container`,children:(e,t)=>{l(),i(e,r(`Creating a Sidecar container`))},$$slots:{default:!0}});var E=c(T,4);_(E,{python:e=>{m(e,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sidecar-example%22%2C%20create_if_missing%3DTrue)%0Aimage%20%3D%20modal.Image.debian_slim().build(app)%0A%0Asb%20%3D%20modal.Sandbox.create(%22sleep%22%2C%20%22600%22%2C%20app%3Dapp%2C%20image%3Dimage%2C%20timeout%3D300)%0A%0Asidecar%20%3D%20sb._experimental_sidecars.create(%0A%20%20%20%20%22python%22%2C%0A%20%20%20%20%22-m%22%2C%0A%20%20%20%20%22http.server%22%2C%0A%20%20%20%20%228080%22%2C%0A%20%20%20%20name%3D%22web%22%2C%0A%20%20%20%20image%3Dimage%2C%0A)%0A%0A%23%20Give%20the%20server%20a%20moment%20to%20start%2C%20then%20call%20it%20from%20the%20main%20sandbox.%0Ap%20%3D%20sb.exec(%0A%20%20%20%20%22python%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22import%20time%2C%20urllib.request%3B%20time.sleep(1)%3B%20print(urllib.request.urlopen('http%3A%2F%2Fweb%3A8080').status)%22%2C%0A)%0Ap.wait()%0Aprint(p.stdout.read())%20%20%23%20%22200%22%0A%0Asb.terminate()`,lang:`python`})},javascript:e=>{m(e,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22sidecar-example%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20await%20modal.images.fromRegistry(%22python%3A3.13-slim%22).build(app)%3B%0A%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22600%22%5D%2C%0A%20%20timeoutMs%3A%20300%20*%201000%2C%0A%7D)%3B%0A%0Aconst%20sidecar%20%3D%20await%20sb.experimentalSidecars.create(%22web%22%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%5D%2C%0A%7D)%3B%0A%0A%2F%2F%20Give%20the%20server%20a%20moment%20to%20start%2C%20then%20call%20it%20from%20the%20main%20sandbox.%0Aconst%20p%20%3D%20await%20sb.exec(%5B%0A%20%20%22python%22%2C%0A%20%20%22-c%22%2C%0A%20%20%22import%20time%2C%20urllib.request%3B%20time.sleep(1)%3B%20print(urllib.request.urlopen('http%3A%2F%2Fweb%3A8080').status)%22%2C%0A%5D)%3B%0Aawait%20p.wait()%3B%0Aconsole.log(await%20p.stdout.readText())%3B%20%2F%2F%20%22200%22%0A%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%09%22fmt%22%0A%09%22io%22%0A%09%22time%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09ctx%20%3A%3D%20context.Background()%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22sidecar-example%22%2C%20%26modal.AppFromNameParams%7B%0A%09%09CreateIfMissing%3A%20true%2C%0A%09%7D)%0A%09image%2C%20_%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil).Build(ctx%2C%20app%2C%20nil)%0A%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09%09Command%3A%20%5B%5Dstring%7B%22sleep%22%2C%20%22600%22%7D%2C%0A%09%09Timeout%3A%205%20*%20time.Minute%2C%0A%09%7D)%0A%09defer%20sb.Terminate(ctx%2C%20nil)%0A%0A%09sidecar%2C%20_%20%3A%3D%20sb.ExperimentalSidecars.Create(ctx%2C%20%22web%22%2C%20image%2C%20%26modal.SidecarCreateParams%7B%0A%09%09Command%3A%20%5B%5Dstring%7B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%7D%2C%0A%09%7D)%0A%09_%20%3D%20sidecar%0A%0A%09%2F%2F%20Give%20the%20server%20a%20moment%20to%20start%2C%20then%20call%20it%20from%20the%20main%20sandbox.%0A%09p%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%0A%09%09%22python%22%2C%20%22-c%22%2C%0A%09%09%22import%20time%2C%20urllib.request%3B%20time.sleep(1)%3B%20print(urllib.request.urlopen('http%3A%2F%2Fweb%3A8080').status)%22%2C%0A%09%7D%2C%20nil)%0A%09stdout%2C%20_%20%3A%3D%20io.ReadAll(p.Stdout)%0A%09fmt.Println(string(stdout))%20%2F%2F%20%22200%22%0A%7D`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var D=c(E,4);f(D,{id:`listing-and-retrieving-sidecars`,children:(e,t)=>{l(),i(e,r(`Listing and retrieving sidecars`))},$$slots:{default:!0}});var O=c(D,4);_(O,{python:e=>{m(e,{code:`containers%20%3D%20sb._experimental_sidecars.list()%0Afor%20container%20in%20containers%3A%0A%20%20%20%20print(f%22%7Bcontainer.name%7D%3A%20%7Bcontainer.object_id%7D%22)%0A%0Asidecar%20%3D%20sb._experimental_sidecars.get(name%3D%22web%22)`,lang:`python`})},javascript:e=>{m(e,{code:`const%20containers%20%3D%20await%20sb.experimentalSidecars.list()%3B%0Afor%20(const%20container%20of%20containers)%20%7B%0A%20%20console.log(%60%24%7Bcontainer.containerName%7D%3A%20%24%7Bcontainer.containerId%7D%60)%3B%0A%7D%0A%0Aconst%20sidecar%20%3D%20await%20sb.experimentalSidecars.get(%22web%22)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`containers%2C%20_%20%3A%3D%20sb.ExperimentalSidecars.List(ctx%2C%20nil)%0Afor%20_%2C%20container%20%3A%3D%20range%20containers%20%7B%0A%09fmt.Printf(%22%25s%3A%20%25s%5Cn%22%2C%20container.ContainerName%2C%20container.ContainerID)%0A%7D%0A%0Asidecar%2C%20_%20%3A%3D%20sb.ExperimentalSidecars.Get(ctx%2C%20%22web%22%2C%20nil)%0A_%20%3D%20sidecar`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var k=c(O,2);d(k,{id:`resource-configuration`,children:(e,t)=>{l(),i(e,r(`Resource configuration`))},$$slots:{default:!0}});var A=c(k,2);g(c(e(A)),{href:`/docs/guide/sandbox-resources`,children:(e,t)=>{l(),i(e,r(`guide to Sandbox resources and
pricing`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,10);d(j,{id:`limitations`,children:(e,t)=>{l(),i(e,r(`Limitations`))},$$slots:{default:!0}});var M=c(j,4),N=e(M);g(c(e(N),8),{href:`/docs/guide/sandboxes#separating-image-builds-from-sandbox-creation`,children:(e,t)=>{l(),i(e,r(`Separating Image builds from Sandbox creation`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);g(c(e(P),2),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{l(),i(e,r(`Cloud Bucket Mounts`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);g(c(e(F),2),{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`Sandbox snapshots`))},$$slots:{default:!0}}),l(),n(F),l(6),n(M),i(t,o)},$$slots:{default:!0}}))}export{T as default,v as metadata};
//# sourceMappingURL=DFfO3tXx2.js.map
