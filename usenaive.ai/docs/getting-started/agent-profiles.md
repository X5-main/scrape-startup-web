> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agent Profiles

> The governed real-world bundle — identity, money, comms, and runtime, per tenant.

An **agent profile** is what Naïve gives every agent: its own verified business identity
(KYC/EIN/formation), a spend-capped card, an inbox and phone number, and
(optionally) a place to run — provisioned **per tenant**, governed on every action,
and **instantly revocable**. The bundle is the product: identity + money + comms +
runtime as one governed unit.

## Provision an agent profile

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_SECRET_KEY! });

const op = await naive.forUser(tenant.id).provision("sdr", {
  idempotencyKey: `op:${tenant.id}`,            // retried webhook → same agent profile
  overrides: {
    identity: { legalName: tenant.company },
    comms: { email: { domain: `mail.${tenant.domain}` } },
  },
});
// op.status === "provisioning" — entity formation / KYB / A2P / DNS are async.
```

Provisioning is **idempotent** on `idempotencyKey`: a duplicate signup webhook
resumes the same agent profile and never forms a second entity or issues a second card.

## Lifecycle

```
provisioning → verifying → active
                    ↘ needs_action (KYB doc, A2P rejection) → verifying
                    ↘ failed → reconciled
                    ↘ revoked
```

```ts theme={"theme":"css-variables"}
await op.refresh();
if (op.status === "active") {
  const tools = await op.tools();   // governed toolset, ready for your agent
}
```

## Use the agent profile's tools (anywhere)

The agent profile's tools are **handles, never raw secrets**. Drop them into your own
agent loop, any agent framework, or a Naïve-hosted container — every regulated action
routes through the [governance gateway](/docs/architecture/governance-gateway).

`tools()` returns a **toolset**, `{ tools, handle }` — the declarations to hand your model,
and the dispatcher that routes each call through the gateway. Both halves are required.

```ts theme={"theme":"css-variables"}
const toolset = await op.tools();
await theirAgent.run({
  tools: toolset.tools,
  onToolCall: (name, input) => toolset.handle(name, input),
  task: "Resolve ticket #492. Refund if policy allows.",
});
```

## Revoke

```ts theme={"theme":"css-variables"}
await op.revoke();   // freeze the card, halt sends, rotate credentials, tear down runtime
```

Revoke applies mid-action and cascades: revoking a parent agent profile kills the whole
multi-agent system. The subject is re-resolved on every call, so it takes effect on an
open MCP session too, with no reconnect.

<Warning>
  Revoke stops the profile *acting*, not *reading*: the check runs on mutating HTTP methods
  and on every MCP tool call, but `GET` requests with the same key still pass the primitive
  gate. To stop reads too, revoke or rotate the key
  (`DELETE /v1/agent-profiles/{id}/keys/{keyId}`); an already-open SSE session caches its
  `AuthContext`, so key revocation lands on the next connection, while profile revocation
  lands immediately. Details: [MCP tools](/docs/mcp/tools#agent-profiles) and
  [the governance gateway](/docs/architecture/governance-gateway#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate).
</Warning>

## REST / CLI / MCP

| Surface | Provision                                               | Revoke                               |
| ------- | ------------------------------------------------------- | ------------------------------------ |
| REST    | `POST /v1/users/:user_id/agent-profiles`                | `POST /v1/agent-profiles/:id/revoke` |
| CLI     | `naive agent profiles provision <role> --user <tenant>` | `naive agent profiles revoke <id>`   |
| MCP     | `naive_provision_agent_profile`                         | `naive_revoke_agent_profile`         |

See [Infrastructure as code](/docs/getting-started/iac) for declaring agent roles and
[Runtime & hosting](/docs/getting-started/runtime) for where the agent runs.
