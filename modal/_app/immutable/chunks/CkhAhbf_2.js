(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`172367e9-49c0-4c58-adef-4fd85d851c7d`,e._sentryDebugIdIdentifier=`sentry-dbid-172367e9-49c0-4c58-adef-4fd85d851c7d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as l}from"./DYSGKh1I.js";import{a as u,i as d,o as te,r as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";import{t as _}from"./D0Ft4u302.js";var v={crossLinks:[{text:`Running a Jupyter notebook`,href:`/docs/examples/jupyter_sandbox`},{text:`Safe code execution`,href:`/docs/examples/safe_code_execution`}],toc:[{depth:1,value:`Networking and security`,id:`networking-and-security`,children:[{depth:2,value:`Outbound access control`,id:`outbound-access-control`,children:[{depth:3,value:`Blocking all network access`,id:`blocking-all-network-access`},{depth:3,value:`Restricting by IP range (CIDR allowlist)`,id:`restricting-by-ip-range-cidr-allowlist`},{depth:3,value:`Restricting by domain name (domain allowlist)`,id:`restricting-by-domain-name-domain-allowlist`},{depth:3,value:`Updating the network policy at runtime`,id:`updating-the-network-policy-at-runtime`,children:[{depth:4,value:`Dynamic policy limitations`,id:`dynamic-policy-limitations`}]}]},{depth:2,value:`Inbound access control`,id:`inbound-access-control`},{depth:2,value:`Connecting to Sandboxes with HTTP and WebSockets`,id:`connecting-to-sandboxes-with-http-and-websockets`,children:[{depth:3,value:`Forwarding ports`,id:`forwarding-ports`},{depth:3,value:`Custom domains`,id:`custom-domains`}]},{depth:2,value:`Security model`,id:`security-model`}]}],rawContent:`# Networking and security

Sandboxes are built to be secure-by-default, meaning that a default Sandbox has
no ability to accept incoming network connections or access your Modal resources.

## Outbound access control

By default, Sandboxes can make outbound connections to any public IP address.
Modal provides three levels of outbound network restriction:

| Level                         | Parameter                   | What it controls                                               |
| ----------------------------- | --------------------------- | -------------------------------------------------------------- |
| **Full block**                | \`block_network=True\`        | Drops all outbound traffic.                                    |
| **IP-range allowlist**        | \`outbound_cidr_allowlist\`   | Only allows traffic to the listed CIDR ranges (any protocol).  |
| **Domain allowlist** _(Beta)_ | \`outbound_domain_allowlist\` | Only allows TLS traffic (port 443) to the listed domain names. |

\`outbound_cidr_allowlist\` and \`outbound_domain_allowlist\` can be combined additively - traffic that meets either criteria will be let through.

### Blocking all network access

Set \`block_network=True\` to prevent the Sandbox from making any outbound
connections:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(
    "python", "my_script.py",
    block_network=True,
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image, {
  command: ["python", "my_script.py"],
  blockNetwork: true,
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command:      []string{"python", "my_script.py"},
	BlockNetwork: true,
})
\`\`\`

{/snippet}
</CodeTabs>

When \`block_network\` is enabled, \`outbound_cidr_allowlist\`,
\`outbound_domain_allowlist\`, and \`inbound_cidr_allowlist\` cannot be used.

### Restricting by IP range (CIDR allowlist)

Use \`outbound_cidr_allowlist\` to restrict outbound traffic to a set of IP
ranges. All traffic to IPs outside these ranges (except traffic allowed by \`outbound_domain_allowlist\`) is blocked.

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(
    "sleep", "infinity",
    outbound_cidr_allowlist=["52.0.0.0/8", "10.0.1.0/24"],
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image, {
  command: ["sleep", "infinity"],
  outboundCidrAllowlist: ["52.0.0.0/8", "10.0.1.0/24"],
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command:               []string{"sleep", "infinity"},
	OutboundCIDRAllowlist: &modal.Allowlist{Entries: []string{"52.0.0.0/8", "10.0.1.0/24"}},
})
\`\`\`

{/snippet}
</CodeTabs>

### Restricting by domain name (domain allowlist)

<Callout variant="beta" />

Use \`outbound_domain_allowlist\` to restrict outbound TLS traffic to a set of
domain names:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(
    "sleep", "infinity",
    outbound_domain_allowlist=["api.openai.com", "*.github.com"],
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image, {
  command: ["sleep", "infinity"],
  outboundDomainAllowlist: ["api.openai.com", "*.github.com"],
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command:                []string{"sleep", "infinity"},
	OutboundDomainAllowlist: &modal.Allowlist{Entries: []string{"api.openai.com", "*.github.com"}},
})
\`\`\`

{/snippet}
</CodeTabs>

When a domain allowlist is set:

- **TLS (port 443)** connections are allowed only to the listed domains.
  Connections to non-allowlisted domains are securely blocked and logged to
  the Sandbox's system output stream.
- **Non-TLS traffic** (HTTP, raw TCP, UDP) to IPs that are not on a CIDR
  allowlist is **blocked**.

Entries prefixed with \`*.\` match the parent domain and any subdomain:

| Allowlist entry | Matches                                           | Does not match    |
| --------------- | ------------------------------------------------- | ----------------- |
| \`example.com\`   | \`example.com\`                                     | \`sub.example.com\` |
| \`*.example.com\` | \`example.com\`, \`a.example.com\`, \`a.b.example.com\` | \`evilexample.com\` |

### Updating the network policy at runtime

<Callout variant="alpha">

This API is experimental and has [limitations](#dynamic-policy-limitations) that
will be removed in a future release.

</Callout>

You can replace the outbound network policy of a running Sandbox without
restarting it. This is useful when an agent's trust level changes mid-session —
for example, starting with broad access while installing dependencies and then
locking down to only the domains a tool needs.

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
# Start with all outbound traffic allowed.
sb = modal.Sandbox.create(
    "sleep", "infinity",
    outbound_domain_allowlist=["*"],
    outbound_cidr_allowlist=["0.0.0.0/0"],
    app=app,
)

# ... later, narrow the policy to only the domains we need.
sb._experimental_set_outbound_network_policy(
    outbound_domain_allowlist=["api.openai.com", "*.github.com"],
)

# Or block all outbound traffic by passing empty allowlists.
sb._experimental_set_outbound_network_policy(
    outbound_domain_allowlist=[],
    outbound_cidr_allowlist=[],
)

# Widen back to allow-all when needed.
sb._experimental_set_outbound_network_policy(
    outbound_domain_allowlist=["*"],
    outbound_cidr_allowlist=["0.0.0.0/0"],
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
// Start with all outbound traffic allowed.
const sb = await modal.sandboxes.create(app, image, {
  command: ["sleep", "infinity"],
  outboundDomainAllowlist: ["*"],
  outboundCidrAllowlist: ["0.0.0.0/0"],
});

// ... later, narrow the policy to only the domains we need.
await sb.updateNetworkPolicy({
  outboundDomainAllowlist: ["api.openai.com", "*.github.com"],
  outboundCidrAllowlist: [],
});

// Or block all outbound traffic by passing empty allowlists.
await sb.updateNetworkPolicy({
  outboundDomainAllowlist: [],
  outboundCidrAllowlist: [],
});

// Widen back to allow-all when needed.
await sb.updateNetworkPolicy({
  outboundDomainAllowlist: ["*"],
  outboundCidrAllowlist: ["0.0.0.0/0"],
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
// Start with all outbound traffic allowed.
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command:                []string{"sleep", "infinity"},
	OutboundDomainAllowlist: &modal.Allowlist{Entries: []string{"*"}},
	OutboundCIDRAllowlist:   &modal.Allowlist{Entries: []string{"0.0.0.0/0"}},
})

// ... later, narrow the policy to only the domains we need.
err = sb.UpdateNetworkPolicy(ctx, &modal.SandboxUpdateNetworkPolicyParams{
	OutboundDomainAllowlist: &modal.Allowlist{Entries: []string{"api.openai.com", "*.github.com"}},
	OutboundCIDRAllowlist:   &modal.Allowlist{Entries: []string{}},
})

// Or block all outbound traffic by passing empty allowlists.
err = sb.UpdateNetworkPolicy(ctx, &modal.SandboxUpdateNetworkPolicyParams{
	OutboundDomainAllowlist: &modal.Allowlist{Entries: []string{}},
	OutboundCIDRAllowlist:   &modal.Allowlist{Entries: []string{}},
})

// Widen back to allow-all when needed.
err = sb.UpdateNetworkPolicy(ctx, &modal.SandboxUpdateNetworkPolicyParams{
	OutboundDomainAllowlist: &modal.Allowlist{Entries: []string{"*"}},
	OutboundCIDRAllowlist:   &modal.Allowlist{Entries: []string{"0.0.0.0/0"}},
})
\`\`\`

{/snippet}
</CodeTabs>

The new policy takes effect immediately. Established connections that the new
policy no longer permits are terminated.

#### Dynamic policy limitations

- Each allowlist type must be set at creation time to be usable later. To
  update \`outbound_domain_allowlist\` at runtime, the Sandbox must be created
  with \`outbound_domain_allowlist\` (e.g. \`["*"]\`). The same applies to
  \`outbound_cidr_allowlist\` — create with \`["0.0.0.0/0"]\` if you want to
  restrict by CIDR later.
- \`block_network=True\` is not compatible with this API. Use empty allowlists
  (\`[]\`) to block all traffic instead.

## Inbound access control

Use \`inbound_cidr_allowlist\` to restrict which IP addresses can connect
**inbound** to the Sandbox through tunnels and Sandbox Connect Tokens:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
sb = modal.Sandbox.create(
    "python", "-m", "http.server", "8080",
    encrypted_ports=[8080],
    inbound_cidr_allowlist=["203.0.113.0/24"],
    app=app,
)
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
const sb = await modal.sandboxes.create(app, image, {
  command: ["python", "-m", "http.server", "8080"],
  encryptedPorts: [8080],
  inboundCidrAllowlist: ["203.0.113.0/24"],
});
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command:              []string{"python", "-m", "http.server", "8080"},
	EncryptedPorts:       []int{8080},
	InboundCIDRAllowlist: []string{"203.0.113.0/24"},
})
\`\`\`

{/snippet}
</CodeTabs>

## Connecting to Sandboxes with HTTP and WebSockets

You can make authenticated HTTP and WebSocket requests to a Sandbox by generating
Sandbox Connect Tokens. They work like this:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
# Start a Sandbox with a server running on port 8080.
sb = modal.Sandbox.create(
    "bash", "-c", "python3 -m http.server 8080",
    app=my_app,
)

# Create a connect token, optionally including arbitrary user metadata.
# Port 8080 is the default and could be omitted here.
creds = sb.create_connect_token(user_metadata={"user_id": "foo"}, port=8080)

# Make an HTTP request, passing the token in the Authorization header.
requests.get(creds.url, headers={"Authorization": f"Bearer {creds.token}"})

# You can also put the token in a \`_modal_connect_token\` query param.
url = f"{creds.url}/?_modal_connect_token={creds.token}"
ws_url = url.replace("https://", "wss://")
with websockets.connect(ws_url) as socket:
    socket.send("Hello world!")

sb.detach()
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript notest
// Start a Sandbox with a server running on port 8080.
const sb = await modal.sandboxes.create(app, image, {
  command: ["bash", "-c", "python3 -m http.server 8080"],
});

// Create a connect token, optionally including arbitrary user metadata.
// Port 8080 is the default and could be omitted here.
const creds = await sb.createConnectToken({
  userMetadata: '{"user_id": "foo"}',
  port: 8080,
});

// Make an HTTP request, passing the token in the Authorization header.
const response = await fetch(creds.url, {
  headers: { Authorization: \`Bearer \${creds.token}\` },
});

sb.detach();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go notest
// Start a Sandbox with a server running on port 8080.
sb, err := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
	Command: []string{"bash", "-c", "python3 -m http.server 8080"},
})

// Create a connect token, optionally including arbitrary user metadata.
// Port 8080 is the default and could be omitted here.
creds, err := sb.CreateConnectToken(ctx, &modal.SandboxCreateConnectTokenParams{
	UserMetadata: \`{"user_id": "foo"}\`,
	Port:         8080,
})

// Make an HTTP request, passing the token in the Authorization header.
req, _ := http.NewRequestWithContext(ctx, "GET", creds.URL, nil)
req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", creds.Token))
resp, _ := http.DefaultClient.Do(req)

sb.Detach()
\`\`\`

{/snippet}
</CodeTabs>

The server running on the specified port in the container will receive an authenticated
request with an unspoofable \`X-Verified-User-Data\` header whose value is the
JSON-serialized metadata that was passed as \`user_metadata\` to
\`create_connect_token()\`. This can be used by the application to
determine access control, for example.

There are a few things to remember with Sandbox Connect Tokens:

1. By default, requests are routed to port 8080 in the container. Pass \`port\`
   to \`create_connect_token()\` to route to a different port.
2. The token may be sent in an \`Authorization\` header, in a \`_modal_connect_token\`
   query param, or in a \`_modal_connect_token\` cookie.
3. If \`_modal_connect_token\` is set as a query param, the resulting response will
   include a \`Set-Cookie\` header that sets it as a cookie.
4. The \`user_metadata\` must be JSON-serializable and must be less than 512
   characters after serialization.
5. The \`user_metadata\` is encoded into the connect token itself, so it
   should not contain secrets.

### Forwarding ports

While it is recommended to use [Sandbox Connect Tokens](#connecting-to-sandboxes-with-http-and-websockets)
for HTTP requests and WebSocket connections to the container, you can also expose
raw TCP ports to the internet. This is useful if, for example, you want to run a
server inside the Sandbox that expects a raw TCP connection and handles
authentication itself.

Use the \`encrypted_ports\` and \`unencrypted_ports\` parameters of \`Sandbox.create\`
to specify which ports to forward. You can then access the public URL of a tunnel
using the [\`Sandbox.tunnels\`](/docs/sdk/py/latest/Sandbox#tunnels) method:

\`\`\`python notest
import requests
import time

sb = modal.Sandbox.create(
    "python",
    "-m",
    "http.server",
    "12345",
    encrypted_ports=[12345],
    app=my_app,
)

tunnel = sb.tunnels()[12345]

time.sleep(1)  # Wait for server to start.

print(f"Connecting to {tunnel.url}...")
print(requests.get(tunnel.url, timeout=5).text)

sb.detach()
\`\`\`

It is also possible to create an encrypted port that uses \`HTTP/2\` rather than \`HTTP/1.1\` with the \`h2_ports\` option. This will return
a URL that you can make H2 (HTTP/2 + TLS) requests to. If you want to run an \`HTTP/2\` server inside a sandbox, this feature may be useful.
Here is an example:

\`\`\`python notest
import time

port = 4359
sb = modal.Sandbox.create(
    app=my_app,
    image=my_image,
    h2_ports=[port],
)
p = sb.exec("python", "my_http2_server.py")

tunnel = sb.tunnels()[port]
time.sleep(1)
print(f"Tunnel URL: {tunnel.url}")

sb.detach()
\`\`\`

For more details on how tunnels work, see the [tunnels guide](/docs/guide/tunnels).

### Custom domains

<Callout variant="gated-feature">

Custom domains for Sandbox tunnels are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.

</Callout>

<Callout variant="beta">

The infrastructure is production-grade, but onboarding requires a manual setup step.

</Callout>

By default, Sandbox tunnels are served from subdomains of \`w.modal.host\`.
In some cases, it's necessary to have a tunnel served through a custom domain
for security reasons. This is possible with manual setup.

Note that tunnel custom domains are distinct from other custom domains in Modal.
Other custom domains use \`CNAME\` forwarding. For tunnels, we need to use an
\`NS\` record to delegate the domain to Modal's nameservers.

**1. Delegate a (sub)domain to Modal's nameservers.**

Add \`NS\` records to your DNS zone pointing to Modal's nameservers. For example,
to use \`sandbox.example.com\`, add the following records in your DNS provider's
control panel:

| Name                  | Type | Value                |
| --------------------- | ---- | -------------------- |
| \`sandbox.example.com\` | NS   | \`w-ns-a.modal.host.\` |
| \`sandbox.example.com\` | NS   | \`w-ns-b.modal.host.\` |
| \`sandbox.example.com\` | NS   | \`w-ns-c.modal.host.\` |
| \`sandbox.example.com\` | NS   | \`w-ns-d.modal.host.\` |

You can delegate any subdomain depth you like (e.g. \`tunnels.a.b.c.example.com\`).

**2. Ask Modal to set up the domain.**

Reach out to us on Slack and provide the domain name. We'll enable it for your
workspace.

**3. Pass \`custom_domain\` to \`Sandbox.create\`.**

\`\`\`python notest
import modal

app = modal.App.lookup("my-app", create_if_missing=True)
sb = modal.Sandbox.create(
    "python", "-m", "http.server", "8080",
    encrypted_ports=[8080],
    custom_domain="sandbox.example.com",
    app=app,
)

tunnel = sb.tunnels()[8080]
print(tunnel.url)  # https://[...].sandbox.example.com
\`\`\`

Modal will provision a TLS certificate automatically. Sandbox Connect Tokens generated
for this sandbox will also use the custom domain.

## Security model

Sandboxes are built on top of [gVisor](https://gvisor.dev/), a container runtime
by Google that provides strong isolation properties. gVisor has custom logic to
prevent Sandboxes from making malicious system calls, giving you stronger isolation
than most other container runtimes.

Additionally, Sandboxes are not authorized to access other resources in your Modal
workspace the way that Modal Functions are [by default](/docs/guide/restricted-access).
As a result, the blast radius of any malicious code will be limited to the Sandbox
container itself.
`,meta:{title:`Networking and security`,description:`Sandboxes are built to be secure-by-default, meaning that a default Sandbox has no ability to accept incoming network connections or access your Modal resources.`}},{crossLinks:y,toc:b,rawContent:x,meta:S}=v,C=t(`<thead><tr><th>Level</th><th>Parameter</th><th>What it controls</th></tr></thead> <tbody><tr><td><strong>Full block</strong></td><td><code>block_network=True</code></td><td>Drops all outbound traffic.</td></tr><tr><td><strong>IP-range allowlist</strong></td><td><code>outbound_cidr_allowlist</code></td><td>Only allows traffic to the listed CIDR ranges (any protocol).</td></tr><tr><td><strong>Domain allowlist</strong> <em>(Beta)</em></td><td><code>outbound_domain_allowlist</code></td><td>Only allows TLS traffic (port 443) to the listed domain names.</td></tr></tbody>`,1),w=t(`<thead><tr><th>Allowlist entry</th><th>Matches</th><th>Does not match</th></tr></thead> <tbody><tr><td><code>example.com</code></td><td><code>example.com</code></td><td><code>sub.example.com</code></td></tr><tr><td><code>*.example.com</code></td><td><code>example.com</code>, <code>a.example.com</code>, <code>a.b.example.com</code></td><td><code>evilexample.com</code></td></tr></tbody>`,1),T=t(`<p>This API is experimental and has <!> that
will be removed in a future release.</p>`),ne=t(`<code>Sandbox.tunnels</code>`),re=t(`<p>Custom domains for Sandbox tunnels are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.</p>`),ie=t(`<p>The infrastructure is production-grade, but onboarding requires a manual setup step.</p>`),ae=t(`<thead><tr><th>Name</th><th>Type</th><th>Value</th></tr></thead> <tbody><tr><td><code>sandbox.example.com</code></td><td>NS</td><td><code>w-ns-a.modal.host.</code></td></tr><tr><td><code>sandbox.example.com</code></td><td>NS</td><td><code>w-ns-b.modal.host.</code></td></tr><tr><td><code>sandbox.example.com</code></td><td>NS</td><td><code>w-ns-c.modal.host.</code></td></tr><tr><td><code>sandbox.example.com</code></td><td>NS</td><td><code>w-ns-d.modal.host.</code></td></tr></tbody>`,1),E=t(`<!> <p>Sandboxes are built to be secure-by-default, meaning that a default Sandbox has
no ability to accept incoming network connections or access your Modal resources.</p> <!> <p>By default, Sandboxes can make outbound connections to any public IP address.
Modal provides three levels of outbound network restriction:</p> <!> <p><code>outbound_cidr_allowlist</code> and <code>outbound_domain_allowlist</code> can be combined additively - traffic that meets either criteria will be let through.</p> <!> <p>Set <code>block_network=True</code> to prevent the Sandbox from making any outbound
connections:</p> <!> <p>When <code>block_network</code> is enabled, <code>outbound_cidr_allowlist</code>, <code>outbound_domain_allowlist</code>, and <code>inbound_cidr_allowlist</code> cannot be used.</p> <!> <p>Use <code>outbound_cidr_allowlist</code> to restrict outbound traffic to a set of IP
ranges. All traffic to IPs outside these ranges (except traffic allowed by <code>outbound_domain_allowlist</code>) is blocked.</p> <!> <!> <!> <p>Use <code>outbound_domain_allowlist</code> to restrict outbound TLS traffic to a set of
domain names:</p> <!> <p>When a domain allowlist is set:</p> <ul><li><strong>TLS (port 443)</strong> connections are allowed only to the listed domains.
Connections to non-allowlisted domains are securely blocked and logged to
the Sandbox’s system output stream.</li> <li><strong>Non-TLS traffic</strong> (HTTP, raw TCP, UDP) to IPs that are not on a CIDR
allowlist is <strong>blocked</strong>.</li></ul> <p>Entries prefixed with <code>*.</code> match the parent domain and any subdomain:</p> <!> <!> <!> <p>You can replace the outbound network policy of a running Sandbox without
restarting it. This is useful when an agent’s trust level changes mid-session —
for example, starting with broad access while installing dependencies and then
locking down to only the domains a tool needs.</p> <!> <p>The new policy takes effect immediately. Established connections that the new
policy no longer permits are terminated.</p> <!> <ul><li>Each allowlist type must be set at creation time to be usable later. To
update <code>outbound_domain_allowlist</code> at runtime, the Sandbox must be created
with <code>outbound_domain_allowlist</code> (e.g. <code>["*"]</code>). The same applies to <code>outbound_cidr_allowlist</code> — create with <code>["0.0.0.0/0"]</code> if you want to
restrict by CIDR later.</li> <li><code>block_network=True</code> is not compatible with this API. Use empty allowlists
(<code>[]</code>) to block all traffic instead.</li></ul> <!> <p>Use <code>inbound_cidr_allowlist</code> to restrict which IP addresses can connect <strong>inbound</strong> to the Sandbox through tunnels and Sandbox Connect Tokens:</p> <!> <!> <p>You can make authenticated HTTP and WebSocket requests to a Sandbox by generating
Sandbox Connect Tokens. They work like this:</p> <!> <p>The server running on the specified port in the container will receive an authenticated
request with an unspoofable <code>X-Verified-User-Data</code> header whose value is the
JSON-serialized metadata that was passed as <code>user_metadata</code> to <code>create_connect_token()</code>. This can be used by the application to
determine access control, for example.</p> <p>There are a few things to remember with Sandbox Connect Tokens:</p> <ol><li>By default, requests are routed to port 8080 in the container. Pass <code>port</code> to <code>create_connect_token()</code> to route to a different port.</li> <li>The token may be sent in an <code>Authorization</code> header, in a <code>_modal_connect_token</code> query param, or in a <code>_modal_connect_token</code> cookie.</li> <li>If <code>_modal_connect_token</code> is set as a query param, the resulting response will
include a <code>Set-Cookie</code> header that sets it as a cookie.</li> <li>The <code>user_metadata</code> must be JSON-serializable and must be less than 512
characters after serialization.</li> <li>The <code>user_metadata</code> is encoded into the connect token itself, so it
should not contain secrets.</li></ol> <!> <p>While it is recommended to use <!> for HTTP requests and WebSocket connections to the container, you can also expose
raw TCP ports to the internet. This is useful if, for example, you want to run a
server inside the Sandbox that expects a raw TCP connection and handles
authentication itself.</p> <p>Use the <code>encrypted_ports</code> and <code>unencrypted_ports</code> parameters of <code>Sandbox.create</code> to specify which ports to forward. You can then access the public URL of a tunnel
using the <!> method:</p> <!> <p>It is also possible to create an encrypted port that uses <code>HTTP/2</code> rather than <code>HTTP/1.1</code> with the <code>h2_ports</code> option. This will return
a URL that you can make H2 (HTTP/2 + TLS) requests to. If you want to run an <code>HTTP/2</code> server inside a sandbox, this feature may be useful.
Here is an example:</p> <!> <p>For more details on how tunnels work, see the <!>.</p> <!> <!> <!> <p>By default, Sandbox tunnels are served from subdomains of <code>w.modal.host</code>.
In some cases, it’s necessary to have a tunnel served through a custom domain
for security reasons. This is possible with manual setup.</p> <p>Note that tunnel custom domains are distinct from other custom domains in Modal.
Other custom domains use <code>CNAME</code> forwarding. For tunnels, we need to use an <code>NS</code> record to delegate the domain to Modal’s nameservers.</p> <p><strong>1. Delegate a (sub)domain to Modal’s nameservers.</strong></p> <p>Add <code>NS</code> records to your DNS zone pointing to Modal’s nameservers. For example,
to use <code>sandbox.example.com</code>, add the following records in your DNS provider’s
control panel:</p> <!> <p>You can delegate any subdomain depth you like (e.g. <code>tunnels.a.b.c.example.com</code>).</p> <p><strong>2. Ask Modal to set up the domain.</strong></p> <p>Reach out to us on Slack and provide the domain name. We’ll enable it for your
workspace.</p> <p><strong>3. Pass <code>custom_domain</code> to <code>Sandbox.create</code>.</strong></p> <!> <p>Modal will provision a TLS certificate automatically. Sandbox Connect Tokens generated
for this sandbox will also use the custom domain.</p> <!> <p>Sandboxes are built on top of <!>, a container runtime
by Google that provides strong isolation properties. gVisor has custom logic to
prevent Sandboxes from making malicious system calls, giving you stronger isolation
than most other container runtimes.</p> <p>Additionally, Sandboxes are not authorized to access other resources in your Modal
workspace the way that Modal Functions are <!>.
As a result, the blast radius of any malicious code will be limited to the Sandbox
container itself.</p>`,1);function D(t,y){let b=ee(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,a(()=>b,()=>v,{children:(t,ee)=>{var a=E(),h=o(a);te(h,{id:`networking-and-security`,children:(e,t)=>{c(),i(e,r(`Networking and security`))},$$slots:{default:!0}});var v=s(h,4);u(v,{id:`outbound-access-control`,children:(e,t)=>{c(),i(e,r(`Outbound access control`))},$$slots:{default:!0}});var y=s(v,4);p(y,{children:(e,t)=>{var n=C();c(2),i(e,n)},$$slots:{default:!0}});var b=s(y,4);d(b,{id:`blocking-all-network-access`,children:(e,t)=>{c(),i(e,r(`Blocking all network access`))},$$slots:{default:!0}});var x=s(b,4);_(x,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python%22%2C%20%22my_script.py%22%2C%0A%20%20%20%20block_network%3DTrue%2C%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{m(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22python%22%2C%20%22my_script.py%22%5D%2C%0A%20%20blockNetwork%3A%20true%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%20%20%20%5B%5Dstring%7B%22python%22%2C%20%22my_script.py%22%7D%2C%0A%09BlockNetwork%3A%20true%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var S=s(x,4);d(S,{id:`restricting-by-ip-range-cidr-allowlist`,children:(e,t)=>{c(),i(e,r(`Restricting by IP range (CIDR allowlist)`))},$$slots:{default:!0}});var D=s(S,4);_(D,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22sleep%22%2C%20%22infinity%22%2C%0A%20%20%20%20outbound_cidr_allowlist%3D%5B%2252.0.0.0%2F8%22%2C%20%2210.0.1.0%2F24%22%5D%2C%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{m(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22infinity%22%5D%2C%0A%20%20outboundCidrAllowlist%3A%20%5B%2252.0.0.0%2F8%22%2C%20%2210.0.1.0%2F24%22%5D%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%5Dstring%7B%22sleep%22%2C%20%22infinity%22%7D%2C%0A%09OutboundCIDRAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%2252.0.0.0%2F8%22%2C%20%2210.0.1.0%2F24%22%7D%7D%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var O=s(D,2);d(O,{id:`restricting-by-domain-name-domain-allowlist`,children:(e,t)=>{c(),i(e,r(`Restricting by domain name (domain allowlist)`))},$$slots:{default:!0}});var k=s(O,2);l(k,{variant:`beta`});var A=s(k,4);_(A,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22sleep%22%2C%20%22infinity%22%2C%0A%20%20%20%20outbound_domain_allowlist%3D%5B%22api.openai.com%22%2C%20%22*.github.com%22%5D%2C%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{m(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22infinity%22%5D%2C%0A%20%20outboundDomainAllowlist%3A%20%5B%22api.openai.com%22%2C%20%22*.github.com%22%5D%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%5Dstring%7B%22sleep%22%2C%20%22infinity%22%7D%2C%0A%09OutboundDomainAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%22api.openai.com%22%2C%20%22*.github.com%22%7D%7D%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var j=s(A,8);p(j,{children:(e,t)=>{var n=w();c(2),i(e,n)},$$slots:{default:!0}});var M=s(j,2);d(M,{id:`updating-the-network-policy-at-runtime`,children:(e,t)=>{c(),i(e,r(`Updating the network policy at runtime`))},$$slots:{default:!0}});var N=s(M,2);l(N,{variant:`alpha`,children:(t,ee)=>{var a=T();g(s(e(a)),{href:`#dynamic-policy-limitations`,children:(e,t)=>{c(),i(e,r(`limitations`))},$$slots:{default:!0}}),c(),n(a),i(t,a)},$$slots:{default:!0}});var P=s(N,4);_(P,{python:e=>{m(e,{code:`%23%20Start%20with%20all%20outbound%20traffic%20allowed.%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22sleep%22%2C%20%22infinity%22%2C%0A%20%20%20%20outbound_domain_allowlist%3D%5B%22*%22%5D%2C%0A%20%20%20%20outbound_cidr_allowlist%3D%5B%220.0.0.0%2F0%22%5D%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0A%0A%23%20...%20later%2C%20narrow%20the%20policy%20to%20only%20the%20domains%20we%20need.%0Asb._experimental_set_outbound_network_policy(%0A%20%20%20%20outbound_domain_allowlist%3D%5B%22api.openai.com%22%2C%20%22*.github.com%22%5D%2C%0A)%0A%0A%23%20Or%20block%20all%20outbound%20traffic%20by%20passing%20empty%20allowlists.%0Asb._experimental_set_outbound_network_policy(%0A%20%20%20%20outbound_domain_allowlist%3D%5B%5D%2C%0A%20%20%20%20outbound_cidr_allowlist%3D%5B%5D%2C%0A)%0A%0A%23%20Widen%20back%20to%20allow-all%20when%20needed.%0Asb._experimental_set_outbound_network_policy(%0A%20%20%20%20outbound_domain_allowlist%3D%5B%22*%22%5D%2C%0A%20%20%20%20outbound_cidr_allowlist%3D%5B%220.0.0.0%2F0%22%5D%2C%0A)`,lang:`python`})},javascript:e=>{m(e,{code:`%2F%2F%20Start%20with%20all%20outbound%20traffic%20allowed.%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22sleep%22%2C%20%22infinity%22%5D%2C%0A%20%20outboundDomainAllowlist%3A%20%5B%22*%22%5D%2C%0A%20%20outboundCidrAllowlist%3A%20%5B%220.0.0.0%2F0%22%5D%2C%0A%7D)%3B%0A%0A%2F%2F%20...%20later%2C%20narrow%20the%20policy%20to%20only%20the%20domains%20we%20need.%0Aawait%20sb.updateNetworkPolicy(%7B%0A%20%20outboundDomainAllowlist%3A%20%5B%22api.openai.com%22%2C%20%22*.github.com%22%5D%2C%0A%20%20outboundCidrAllowlist%3A%20%5B%5D%2C%0A%7D)%3B%0A%0A%2F%2F%20Or%20block%20all%20outbound%20traffic%20by%20passing%20empty%20allowlists.%0Aawait%20sb.updateNetworkPolicy(%7B%0A%20%20outboundDomainAllowlist%3A%20%5B%5D%2C%0A%20%20outboundCidrAllowlist%3A%20%5B%5D%2C%0A%7D)%3B%0A%0A%2F%2F%20Widen%20back%20to%20allow-all%20when%20needed.%0Aawait%20sb.updateNetworkPolicy(%7B%0A%20%20outboundDomainAllowlist%3A%20%5B%22*%22%5D%2C%0A%20%20outboundCidrAllowlist%3A%20%5B%220.0.0.0%2F0%22%5D%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`%2F%2F%20Start%20with%20all%20outbound%20traffic%20allowed.%0Asb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%5Dstring%7B%22sleep%22%2C%20%22infinity%22%7D%2C%0A%09OutboundDomainAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%22*%22%7D%7D%2C%0A%09OutboundCIDRAllowlist%3A%20%20%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%220.0.0.0%2F0%22%7D%7D%2C%0A%7D)%0A%0A%2F%2F%20...%20later%2C%20narrow%20the%20policy%20to%20only%20the%20domains%20we%20need.%0Aerr%20%3D%20sb.UpdateNetworkPolicy(ctx%2C%20%26modal.SandboxUpdateNetworkPolicyParams%7B%0A%09OutboundDomainAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%22api.openai.com%22%2C%20%22*.github.com%22%7D%7D%2C%0A%09OutboundCIDRAllowlist%3A%20%20%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%7D%7D%2C%0A%7D)%0A%0A%2F%2F%20Or%20block%20all%20outbound%20traffic%20by%20passing%20empty%20allowlists.%0Aerr%20%3D%20sb.UpdateNetworkPolicy(ctx%2C%20%26modal.SandboxUpdateNetworkPolicyParams%7B%0A%09OutboundDomainAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%7D%7D%2C%0A%09OutboundCIDRAllowlist%3A%20%20%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%7D%7D%2C%0A%7D)%0A%0A%2F%2F%20Widen%20back%20to%20allow-all%20when%20needed.%0Aerr%20%3D%20sb.UpdateNetworkPolicy(ctx%2C%20%26modal.SandboxUpdateNetworkPolicyParams%7B%0A%09OutboundDomainAllowlist%3A%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%22*%22%7D%7D%2C%0A%09OutboundCIDRAllowlist%3A%20%20%20%26modal.Allowlist%7BEntries%3A%20%5B%5Dstring%7B%220.0.0.0%2F0%22%7D%7D%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var F=s(P,4);f(F,{id:`dynamic-policy-limitations`,children:(e,t)=>{c(),i(e,r(`Dynamic policy limitations`))},$$slots:{default:!0}});var I=s(F,4);u(I,{id:`inbound-access-control`,children:(e,t)=>{c(),i(e,r(`Inbound access control`))},$$slots:{default:!0}});var L=s(I,4);_(L,{python:e=>{m(e,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%2C%0A%20%20%20%20encrypted_ports%3D%5B8080%5D%2C%0A%20%20%20%20inbound_cidr_allowlist%3D%5B%22203.0.113.0%2F24%22%5D%2C%0A%20%20%20%20app%3Dapp%2C%0A)`,lang:`python`})},javascript:e=>{m(e,{code:`const%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%5D%2C%0A%20%20encryptedPorts%3A%20%5B8080%5D%2C%0A%20%20inboundCidrAllowlist%3A%20%5B%22203.0.113.0%2F24%22%5D%2C%0A%7D)%3B`,lang:`javascript`})},go:e=>{m(e,{code:`sb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%5Dstring%7B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%7D%2C%0A%09EncryptedPorts%3A%20%20%20%20%20%20%20%5B%5Dint%7B8080%7D%2C%0A%09InboundCIDRAllowlist%3A%20%5B%5Dstring%7B%22203.0.113.0%2F24%22%7D%2C%0A%7D)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var R=s(L,2);u(R,{id:`connecting-to-sandboxes-with-http-and-websockets`,children:(e,t)=>{c(),i(e,r(`Connecting to Sandboxes with HTTP and WebSockets`))},$$slots:{default:!0}});var z=s(R,4);_(z,{python:e=>{m(e,{code:`%23%20Start%20a%20Sandbox%20with%20a%20server%20running%20on%20port%208080.%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22bash%22%2C%20%22-c%22%2C%20%22python3%20-m%20http.server%208080%22%2C%0A%20%20%20%20app%3Dmy_app%2C%0A)%0A%0A%23%20Create%20a%20connect%20token%2C%20optionally%20including%20arbitrary%20user%20metadata.%0A%23%20Port%208080%20is%20the%20default%20and%20could%20be%20omitted%20here.%0Acreds%20%3D%20sb.create_connect_token(user_metadata%3D%7B%22user_id%22%3A%20%22foo%22%7D%2C%20port%3D8080)%0A%0A%23%20Make%20an%20HTTP%20request%2C%20passing%20the%20token%20in%20the%20Authorization%20header.%0Arequests.get(creds.url%2C%20headers%3D%7B%22Authorization%22%3A%20f%22Bearer%20%7Bcreds.token%7D%22%7D)%0A%0A%23%20You%20can%20also%20put%20the%20token%20in%20a%20%60_modal_connect_token%60%20query%20param.%0Aurl%20%3D%20f%22%7Bcreds.url%7D%2F%3F_modal_connect_token%3D%7Bcreds.token%7D%22%0Aws_url%20%3D%20url.replace(%22https%3A%2F%2F%22%2C%20%22wss%3A%2F%2F%22)%0Awith%20websockets.connect(ws_url)%20as%20socket%3A%0A%20%20%20%20socket.send(%22Hello%20world!%22)%0A%0Asb.detach()`,lang:`python`})},javascript:e=>{m(e,{code:`%2F%2F%20Start%20a%20Sandbox%20with%20a%20server%20running%20on%20port%208080.%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20command%3A%20%5B%22bash%22%2C%20%22-c%22%2C%20%22python3%20-m%20http.server%208080%22%5D%2C%0A%7D)%3B%0A%0A%2F%2F%20Create%20a%20connect%20token%2C%20optionally%20including%20arbitrary%20user%20metadata.%0A%2F%2F%20Port%208080%20is%20the%20default%20and%20could%20be%20omitted%20here.%0Aconst%20creds%20%3D%20await%20sb.createConnectToken(%7B%0A%20%20userMetadata%3A%20'%7B%22user_id%22%3A%20%22foo%22%7D'%2C%0A%20%20port%3A%208080%2C%0A%7D)%3B%0A%0A%2F%2F%20Make%20an%20HTTP%20request%2C%20passing%20the%20token%20in%20the%20Authorization%20header.%0Aconst%20response%20%3D%20await%20fetch(creds.url%2C%20%7B%0A%20%20headers%3A%20%7B%20Authorization%3A%20%60Bearer%20%24%7Bcreds.token%7D%60%20%7D%2C%0A%7D)%3B%0A%0Asb.detach()%3B`,lang:`javascript`})},go:e=>{m(e,{code:`%2F%2F%20Start%20a%20Sandbox%20with%20a%20server%20running%20on%20port%208080.%0Asb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09Command%3A%20%5B%5Dstring%7B%22bash%22%2C%20%22-c%22%2C%20%22python3%20-m%20http.server%208080%22%7D%2C%0A%7D)%0A%0A%2F%2F%20Create%20a%20connect%20token%2C%20optionally%20including%20arbitrary%20user%20metadata.%0A%2F%2F%20Port%208080%20is%20the%20default%20and%20could%20be%20omitted%20here.%0Acreds%2C%20err%20%3A%3D%20sb.CreateConnectToken(ctx%2C%20%26modal.SandboxCreateConnectTokenParams%7B%0A%09UserMetadata%3A%20%60%7B%22user_id%22%3A%20%22foo%22%7D%60%2C%0A%09Port%3A%20%20%20%20%20%20%20%20%208080%2C%0A%7D)%0A%0A%2F%2F%20Make%20an%20HTTP%20request%2C%20passing%20the%20token%20in%20the%20Authorization%20header.%0Areq%2C%20_%20%3A%3D%20http.NewRequestWithContext(ctx%2C%20%22GET%22%2C%20creds.URL%2C%20nil)%0Areq.Header.Set(%22Authorization%22%2C%20fmt.Sprintf(%22Bearer%20%25s%22%2C%20creds.Token))%0Aresp%2C%20_%20%3A%3D%20http.DefaultClient.Do(req)%0A%0Asb.Detach()`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var B=s(z,8);d(B,{id:`forwarding-ports`,children:(e,t)=>{c(),i(e,r(`Forwarding ports`))},$$slots:{default:!0}});var V=s(B,2);g(s(e(V)),{href:`#connecting-to-sandboxes-with-http-and-websockets`,children:(e,t)=>{c(),i(e,r(`Sandbox Connect Tokens`))},$$slots:{default:!0}}),c(),n(V);var H=s(V,2);g(s(e(H),7),{href:`/docs/sdk/py/latest/Sandbox#tunnels`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),c(),n(H);var U=s(H,2);m(U,{code:`import%20requests%0Aimport%20time%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python%22%2C%0A%20%20%20%20%22-m%22%2C%0A%20%20%20%20%22http.server%22%2C%0A%20%20%20%20%2212345%22%2C%0A%20%20%20%20encrypted_ports%3D%5B12345%5D%2C%0A%20%20%20%20app%3Dmy_app%2C%0A)%0A%0Atunnel%20%3D%20sb.tunnels()%5B12345%5D%0A%0Atime.sleep(1)%20%20%23%20Wait%20for%20server%20to%20start.%0A%0Aprint(f%22Connecting%20to%20%7Btunnel.url%7D...%22)%0Aprint(requests.get(tunnel.url%2C%20timeout%3D5).text)%0A%0Asb.detach()`,lang:`python`});var W=s(U,4);m(W,{code:`import%20time%0A%0Aport%20%3D%204359%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20app%3Dmy_app%2C%0A%20%20%20%20image%3Dmy_image%2C%0A%20%20%20%20h2_ports%3D%5Bport%5D%2C%0A)%0Ap%20%3D%20sb.exec(%22python%22%2C%20%22my_http2_server.py%22)%0A%0Atunnel%20%3D%20sb.tunnels()%5Bport%5D%0Atime.sleep(1)%0Aprint(f%22Tunnel%20URL%3A%20%7Btunnel.url%7D%22)%0A%0Asb.detach()`,lang:`python`});var G=s(W,2);g(s(e(G)),{href:`/docs/guide/tunnels`,children:(e,t)=>{c(),i(e,r(`tunnels guide`))},$$slots:{default:!0}}),c(),n(G);var K=s(G,2);d(K,{id:`custom-domains`,children:(e,t)=>{c(),i(e,r(`Custom domains`))},$$slots:{default:!0}});var q=s(K,2);l(q,{variant:`gated-feature`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}});var J=s(q,2);l(J,{variant:`beta`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var Y=s(J,10);p(Y,{children:(e,t)=>{var n=ae();c(2),i(e,n)},$$slots:{default:!0}});var X=s(Y,10);m(X,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%2C%0A%20%20%20%20encrypted_ports%3D%5B8080%5D%2C%0A%20%20%20%20custom_domain%3D%22sandbox.example.com%22%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0A%0Atunnel%20%3D%20sb.tunnels()%5B8080%5D%0Aprint(tunnel.url)%20%20%23%20https%3A%2F%2F%5B...%5D.sandbox.example.com`,lang:`python`});var Z=s(X,4);u(Z,{id:`security-model`,children:(e,t)=>{c(),i(e,r(`Security model`))},$$slots:{default:!0}});var Q=s(Z,2);g(s(e(Q)),{href:`https://gvisor.dev/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`gVisor`))},$$slots:{default:!0}}),c(),n(Q);var $=s(Q,2);g(s(e($)),{href:`/docs/guide/restricted-access`,children:(e,t)=>{c(),i(e,r(`by default`))},$$slots:{default:!0}}),c(),n($),i(t,a)},$$slots:{default:!0}}))}export{D as default,v as metadata};
//# sourceMappingURL=CkhAhbf_2.js.map
