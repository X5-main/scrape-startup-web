> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Node.js SDK: Container Config, Provisioning & Approval

> Configure Docker containers to route through the OneCLI gateway from Node.js. Handles proxy setup, CA certs, and approval.

The OneCLI Node.js SDK provides a programmatic interface for configuring Docker containers to route through the OneCLI gateway, so containerized agents can access external APIs without exposing credentials.

<Card title="@onecli-sh/sdk" icon="npm" href="https://www.npmjs.com/package/@onecli-sh/sdk">
  View on npm
</Card>

## Requirements

| SDK version | Node.js version |
| ----------- | --------------- |
| >= 0.1.0    | >= 20           |

## Installation

<CodeGroup>
  ```bash npm theme={null}
  npm install @onecli-sh/sdk
  ```

  ```bash pnpm theme={null}
  pnpm add @onecli-sh/sdk
  ```

  ```bash yarn theme={null}
  yarn add @onecli-sh/sdk
  ```
</CodeGroup>

## Quick start

<Tabs>
  <Tab title="Cloud">
    ```typescript theme={null}
    import { OneCLI } from "@onecli-sh/sdk";

    // No url needed — defaults to https://api.onecli.sh
    const onecli = new OneCLI({
      apiKey: "oc_your_api_key",
    });

    const args = ["run", "-i", "--rm", "--name", "my-agent"];

    // Fetches container config and pushes -e / -v flags onto args
    const active = await onecli.applyContainerConfig(args);

    // args now contains HTTPS_PROXY, CA certs, and volume mounts
    console.log(active); // true if OneCLI was reachable
    ```
  </Tab>

  <Tab title="Self-hosted">
    ```typescript theme={null}
    import { OneCLI } from "@onecli-sh/sdk";

    const onecli = new OneCLI({
      url: "http://localhost:10254",
      apiKey: "oc_your_api_key",
    });

    const args = ["run", "-i", "--rm", "--name", "my-agent"];

    // Fetches container config and pushes -e / -v flags onto args
    const active = await onecli.applyContainerConfig(args);

    // args now contains HTTPS_PROXY, CA certs, and volume mounts
    console.log(active); // true if OneCLI was reachable
    ```
  </Tab>
</Tabs>

### Environment variables

Instead of passing options explicitly, set environment variables:

<Tabs>
  <Tab title="Cloud">
    ```bash theme={null}
    export ONECLI_API_KEY=oc_your_api_key
    # ONECLI_URL defaults to https://api.onecli.sh
    ```
  </Tab>

  <Tab title="Self-hosted">
    ```bash theme={null}
    export ONECLI_URL=http://localhost:10254
    export ONECLI_API_KEY=oc_your_api_key
    ```
  </Tab>
</Tabs>

```typescript theme={null}
import { OneCLI } from "@onecli-sh/sdk";

// Automatically reads from ONECLI_API_KEY (and ONECLI_URL if set)
const onecli = new OneCLI();
const active = await onecli.applyContainerConfig(args);
```

### Organization API keys

Organization-level API keys (`oc_org_...`) grant access across all projects in an org. Pass a `projectId` to specify which project to target.

```typescript theme={null}
import { OneCLI } from "@onecli-sh/sdk";

// Set a default project for all operations
const onecli = new OneCLI({
  apiKey: "oc_org_your_org_key",
  projectId: "proj-123",
});

await onecli.createAgent({ name: "Bot", identifier: "bot" });

// Override the project for a specific operation
await onecli.createAgent(
  { name: "Bot", identifier: "bot" },
  { projectId: "proj-456" },
);
```

The `projectId` can also be set via the `ONECLI_PROJECT_ID` environment variable. Per-operation overrides always take precedence over the constructor default.

***

## API reference

### `OneCLI`

Main SDK client.

```typescript theme={null}
new OneCLI(options?: OneCLIOptions)
```

#### Parameters

| Parameter    | Type     | Default                          | Description                                                                 |
| ------------ | -------- | -------------------------------- | --------------------------------------------------------------------------- |
| `apiKey`     | `string` | `process.env.ONECLI_API_KEY`     | API key (`oc_...` for project keys, `oc_org_...` for org keys)              |
| `url`        | `string` | `process.env.ONECLI_URL`         | Base URL of the OneCLI instance                                             |
| `timeout`    | `number` | `5000`                           | Request timeout in milliseconds                                             |
| `gatewayUrl` | `string` | `process.env.ONECLI_GATEWAY_URL` | Gateway URL for manual approval polling (auto-resolved if not set)          |
| `projectId`  | `string` | `process.env.ONECLI_PROJECT_ID`  | Default project ID for org-level API keys (can be overridden per-operation) |

***

#### `onecli.getContainerConfig(options?)`

Fetch the raw container configuration from OneCLI.

```typescript theme={null}
const config = await onecli.getContainerConfig();
console.log(config.env);                    // { HTTPS_PROXY: "...", HTTP_PROXY: "...", ... }
console.log(config.caCertificate);          // PEM-formatted CA certificate
console.log(config.caCertificateContainerPath); // /tmp/onecli-proxy-ca.pem

// Fetch config for a specific agent
const agentConfig = await onecli.getContainerConfig({ agent: "my-agent" });

// With org-level API key, specify the target project
const config = await onecli.getContainerConfig({ projectId: "proj-123" });
```

**Parameters**

| Parameter   | Type     | Description                                                          |
| ----------- | -------- | -------------------------------------------------------------------- |
| `agent`     | `string` | Agent identifier to fetch config for (uses default agent if omitted) |
| `projectId` | `string` | Project ID override for org-level API keys                           |

**Returns**

```typescript theme={null}
{
  env: Record<string, string>;
  caCertificate: string;
  caCertificateContainerPath: string;
}
```

**Throws** `OneCLIRequestError` if OneCLI returns a non-200 response.

***

#### `onecli.applyContainerConfig(args, options?)`

Fetch the container config and push Docker flags onto the `args` array. Returns `true` if config was applied, `false` if OneCLI was unreachable.

```typescript theme={null}
const args = ["run", "-i", "--rm", "my-image"];
const active = await onecli.applyContainerConfig(args, {
  combineCaBundle: true,
  addHostMapping: true,
});
```

**Parameters**

| Parameter         | Type      | Default | Description                                    |
| ----------------- | --------- | ------- | ---------------------------------------------- |
| `combineCaBundle` | `boolean` | `true`  | Build combined CA bundle for system-wide trust |
| `addHostMapping`  | `boolean` | `true`  | Add `host.docker.internal` mapping on Linux    |
| `agent`           | `string`  |         | Agent identifier to fetch config for           |
| `projectId`       | `string`  |         | Project ID override for org-level API keys     |

This method:

1. Fetches `/api/container-config` from OneCLI with Bearer auth
2. Pushes `-e KEY=VALUE` for each environment variable
3. Writes the CA certificate to a temp file and mounts it with `-v`
4. Builds a combined CA bundle (system CAs + OneCLI CA) so all tools trust OneCLI
5. Adds `--add-host host.docker.internal:host-gateway` on Linux

If OneCLI is unreachable, returns `false` without mutating the args array.

***

### Agents & grants

Create agents and grant each one the credentials it may use (see [Agent access](/docs/guides/agent-access)). An agent starts with **no grants** — the gateway injects nothing for it until a connection or secret is attached. Writes take effect immediately.

```typescript theme={null}
const agent = await onecli.createAgent({ name: "Support bot", identifier: "support-bot" });

// Full access to a connection
await onecli.setConnectionGrant(agent.id, "conn_9f2c1b", { access: "full" });

// Or per-tool: `allow` runs freely, `ask` pauses for human approval,
// everything unnamed is blocked
await onecli.setConnectionGrant(agent.id, "conn_9f2c1b", {
  access: "custom",
  allow: ["search_messages", "get_message"],
  ask: ["send_email"],
});

// Secrets are all-or-nothing
await onecli.attachSecret(agent.id, "sec_5e8c02");

// Read intent, or the whole project at a glance
const grants = await onecli.getAgentGrants(agent.id);
const agents = await onecli.listAgentsWithGrants();
```

| Method                                                         | Description                                            |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `createAgent(input, opts?)` / `ensureAgent(input, opts?)`      | Create an agent (idempotent with `ensureAgent`)        |
| `listAgents(opts?)` / `listAgentsWithGrants(opts?)`            | List agents, optionally with per-agent grant summaries |
| `getAgentGrants(agentId, opts?)`                               | Everything granted to one agent                        |
| `setConnectionGrant(agentId, connectionId, input, opts?)`      | Attach or rewrite a connection grant                   |
| `removeConnectionGrant(agentId, connectionId, opts?)`          | Detach a connection (`204` → resolves `void`)          |
| `attachSecret(agentId, secretId, opts?)` / `detachSecret(...)` | Attach / detach a secret                               |
| `getConnectionGrants(connectionId, opts?)`                     | The reverse view: which agents hold a grant            |
| `getEffectiveCredentials(agentId, opts?)`                      | Read-only **effective** view once org rules apply      |
| `getEffectiveAppPermissions({ provider, agentId? }, opts?)`    | Per-tool verdicts for an app                           |
| `getConnectionAgentAccess(connectionId, opts?)`                | Effective per-agent access to a connection             |

Two validation laws on custom grants (both `422`): the lists together must name at least one tool (all-blocked = detach instead), and a tool can't be in both. A non-empty `ask` requires a plan with manual approvals (`403`).

***

### Project provisioning

<Info>
  Project provisioning is a **cloud-only** feature. Calling `provisionProject()` against an OSS instance throws `OneCLIError`.
</Info>

#### `onecli.provisionProject(input?, options?)`

Pre-create a user account with a project and API key. The API key works immediately. Requires admin or owner role.

```typescript theme={null}
const result = await onecli.provisionProject({
  role: "member",
  skipOnboarding: true,
});

console.log(result.apiKey);   // oc_... (usable immediately)
console.log(result.claimUrl); // https://app.onecli.sh/claim?token=...
console.log(result.projectId);
```

**Parameters**

| Parameter        | Type                  | Default    | Description                                    |
| ---------------- | --------------------- | ---------- | ---------------------------------------------- |
| `role`           | `"admin" \| "member"` | `"member"` | Role the provisioned user will have in the org |
| `skipOnboarding` | `boolean`             | `true`     | Whether the user skips the onboarding wizard   |

**Options**

| Parameter   | Type     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `projectId` | `string` | Project ID override for org-level API keys |

**Returns: `ProvisionProjectResponse`**

| Field       | Type     | Description                                              |
| ----------- | -------- | -------------------------------------------------------- |
| `id`        | `string` | Provision record ID                                      |
| `userId`    | `string` | Placeholder user ID (becomes the real user after claim)  |
| `projectId` | `string` | Pre-created project ID                                   |
| `apiKey`    | `string` | API key for the provisioned project (usable immediately) |
| `claimUrl`  | `string` | URL the user visits to claim the account                 |
| `expiresAt` | `string` | Expiration timestamp (ISO 8601)                          |

**Throws** `OneCLIError` if called against an OSS instance. **Throws** `OneCLIRequestError` with status 403 if the API key doesn't belong to an admin/owner.

See the [User Provisioning guide](/docs/guides/user-provisioning) for the full workflow.

***

### Manual approval

#### `onecli.configureManualApproval(callback, options?)`

Register a callback that's invoked whenever an agent request needs human approval. Starts background long-polling to the gateway. Returns a handle to stop polling.

```typescript theme={null}
const handle = onecli.configureManualApproval(async (request) => {
  console.log(`${request.method} ${request.url}`);
  console.log(`Agent: ${request.agent.name}`);

  if (request.bodyPreview) {
    console.log(`Body: ${request.bodyPreview}`);
  }

  // Return 'approve' to forward the request, 'deny' to block it
  return "approve";
});

// Stop polling on shutdown
process.on("SIGTERM", () => handle.stop());
```

The callback is called once per pending approval. Multiple approvals are handled concurrently, and each callback runs independently without blocking the others.

If the callback throws or the decision fails to submit, the same request is retried on the next poll cycle.

**Callback parameter: `ApprovalRequest`**

| Field            | Type                                                       | Description                                                                                                 |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`             | `string`                                                   | Unique approval ID                                                                                          |
| `method`         | `string`                                                   | HTTP method (`GET`, `POST`, `DELETE`, etc.)                                                                 |
| `url`            | `string`                                                   | Full request URL                                                                                            |
| `host`           | `string`                                                   | Hostname                                                                                                    |
| `path`           | `string`                                                   | Request path                                                                                                |
| `headers`        | `Record<string, string>`                                   | Sanitized request headers (no credentials)                                                                  |
| `bodyPreview`    | `string \| null`                                           | Human-readable, length-bounded rendering of the request body (safe to display; never raw binary), or `null` |
| `summary`        | `object \| null`                                           | Structured form of `bodyPreview` (an `action` label plus key/value `details`), or `null`                    |
| `agent`          | `{ id: string; name: string; externalId: string \| null }` | The agent that made the request                                                                             |
| `createdAt`      | `string`                                                   | When the request arrived (ISO 8601)                                                                         |
| `expiresAt`      | `string`                                                   | When the approval expires (ISO 8601)                                                                        |
| `timeoutSeconds` | `number`                                                   | Seconds until auto-deny (300)                                                                               |

**Return value:** `ManualApprovalHandle`

| Method   | Description                 |
| -------- | --------------------------- |
| `stop()` | Stop polling and disconnect |

<Note>
  Manual approval requires an allow [policy rule](/docs/guides/rules#manual-approval) with **Require approval** set. Without a matching rule, no requests are held for approval.
</Note>

#### Org policy rules

Author and publish organization policy rules (the staged draft → publish model; see the [Policy rules guide](/docs/guides/rules)). Writes publish automatically; pass `{ skipPublish: true }` to stage and review first, since a publish snapshots the **whole** org draft, including changes staged by other users.

```typescript theme={null}
// Create + publish an org-wide block
const { result, generation } = await onecli.org.createPolicyRule({
  name: "Never delete repos",
  action: "block",
  targets: [
    {
      kind: "network",
      hostPattern: "api.github.com",
      pathPattern: "/repos/*",
      method: "DELETE",
    },
  ],
});

// Stage several changes, then publish once
await onecli.org.createPolicyRule(ruleA, { skipPublish: true });
await onecli.org.createPolicyRule(ruleB, { skipPublish: true });
await onecli.org.publishPolicy();

// Read the ENFORCED set (drafts are the default)
const enforced = await onecli.org.listPolicyRules("published");
```

| Method                                                          | Description                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `listPolicyRules(status?)`                                      | List rules: `"draft"` (default) or `"published"` (enforced)                       |
| `getPolicyRule(id)`                                             | Get one DRAFT rule (published ids regenerate every publish; match by `logicalId`) |
| `createPolicyRule(input, opts?)`                                | Create (+ publish unless `skipPublish`)                                           |
| `updatePolicyRule(id, input, opts?)`                            | Update a DRAFT rule (+ publish)                                                   |
| `deletePolicyRule(id, opts?)`                                   | Delete a DRAFT rule (+ publish)                                                   |
| `reorderPolicyRules(ids, opts?)`                                | Full-permutation reorder (+ publish)                                              |
| `getPolicyDefault(status?)` / `setPolicyDefault(action, opts?)` | The org's terminal Default Rule                                                   |
| `publishPolicy()`                                               | Publish the whole staged draft                                                    |
| `getPolicyLastPublish()`                                        | The most recent publish, or `null`                                                |

SDK 3.0.0 removed the legacy `createRule`/`updateRule`/`deleteRule` methods — the `/v1/org/rules` API they called answers `410 Gone` on current servers.

#### `onecli.org.configureManualApproval(callback, options?)`

<Info>
  Organization-scoped approvals require an **organization API key** (`oc_org_...`) and OneCLI Cloud or a self-hosted Enterprise instance.
</Info>

Watch manual-approval requests across **every project** in the organization from a single handler. Identical to `onecli.configureManualApproval`, with two differences: the poll carries no `X-Project-Id` (the organization is derived from the key), and each request includes its own `projectId`, which the SDK uses to route the decision back to the right project.

```typescript theme={null}
const onecli = new OneCLI({ apiKey: "oc_org_your_org_key" });

const handle = onecli.org.configureManualApproval(
  async (request) => {
    console.log(`[${request.projectId}] ${request.method} ${request.url}`);
    // Return 'approve' to forward the request, 'deny' to block it
    return "approve";
  },
  {
    onError: (error) => console.error("approval poll failed", error),
  },
);

// Stop polling on shutdown
process.on("SIGTERM", () => handle.stop());
```

**Callback parameter: `OrgApprovalRequest`**

Every field of `ApprovalRequest` (above), plus:

| Field       | Type     | Description                                                             |
| ----------- | -------- | ----------------------------------------------------------------------- |
| `projectId` | `string` | The project this request belongs to. The decision is routed back to it. |

**Options**

| Field     | Type                       | Description                                                                                                                                                           |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onError` | `(error: unknown) => void` | Called when a poll cycle fails (auth, network, gateway resolution). The loop backs off and retries either way; without a handler these errors are swallowed silently. |

**Return value:** `ManualApprovalHandle` (the same `stop()` handle as the project handler).

***

### Error classes

#### `OneCLIError`

General SDK error (e.g., missing API key).

```typescript theme={null}
import { OneCLIError } from "@onecli-sh/sdk";

try {
  const onecli = new OneCLI(); // no apiKey set
  await onecli.getContainerConfig();
} catch (error) {
  if (error instanceof OneCLIError) {
    console.error(error.message);
  }
}
```

#### `OneCLIRequestError`

HTTP request error with additional context.

```typescript theme={null}
import { OneCLIRequestError } from "@onecli-sh/sdk";

try {
  await onecli.getContainerConfig();
} catch (error) {
  if (error instanceof OneCLIRequestError) {
    console.error(error.url);        // Request URL
    console.error(error.statusCode); // HTTP status code
    console.error(error.message);    // [URL=...] [StatusCode=...] ...
  }
}
```

#### Gateway errors on proxied traffic

Errors the gateway returns on an agent's **proxied** requests (the `409` multiple-accounts protocol, `access_restricted`, `blocked_by_policy`, …) don't throw SDK errors — they arrive on the agent's own HTTP calls. The SDK exports typed bodies and a `parseGatewayError` narrowing helper plus the `CONNECTION_ID_HEADER` / `CONNECTIONS_HEADER` constants for handling them; see [Gateway errors](/docs/api-reference/gateway-errors) and [Multiple accounts](/docs/api-reference/multi-account).

***

### Types

All types are exported for use in your own code:

```typescript theme={null}
import type {
  OneCLIOptions,
  RequestOptions,
  ContainerConfig,
  GetContainerConfigOptions,
  ApplyContainerConfigOptions,
  Agent,
  AgentGrants,
  ConnectionGrantInput,
  ConnectionGrants,
  AgentWithGrantsSummary,
  EffectiveCredentials,
  GatewayError,
  GatewayConnectionChoice,
  ApprovalRequest,
  ManualApprovalCallback,
  ManualApprovalHandle,
  OrgApprovalRequest,
  OrgManualApprovalCallback,
  OrgManualApprovalOptions,
  ProvisionProjectInput,
  ProvisionProjectResponse,
} from "@onecli-sh/sdk";
```

***

## How it works

OneCLI runs on the host machine and acts as a gateway for containerized agents. When a container makes HTTPS requests to intercepted domains (e.g. `api.anthropic.com`), OneCLI:

1. Terminates TLS using a local CA certificate
2. Inspects the request and injects real credentials (replacing placeholder tokens)
3. Forwards the request to the upstream service
4. Returns the response to the container

**Containers never see real API keys.** They only have placeholder tokens that OneCLI swaps out transparently.

The SDK configures containers with the right environment variables (`HTTPS_PROXY`, `HTTP_PROXY`) and CA certificate mounts so this works automatically.
