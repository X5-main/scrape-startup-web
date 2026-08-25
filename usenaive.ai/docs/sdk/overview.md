> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# SDK Overview

> The Naïve SDK — declare a company, govern a tenant, and drive a durable team from your own backend.

The SDK is five published packages with clean boundaries. Every one is live on npm today.

| Package                           | When                  | What                                                                                                                                                                                                                                                                      |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@usenaive-sdk/iac`**           | build-time            | Declarative `naive.config.ts` — `defineProject` (strict; `defineConfig` is the lenient alias), `cloud.*`, `business.*`, `agent`, `identity`, `skills`, plus the new `company` / `teams` blocks (`team`, `brain`, `governance`, `runtime.durable`). Applied by `naive up`. |
| **`@usenaive-sdk/server`**        | run-time (your app)   | The one to install. `new Naive({ apiKey })` — the flat resource API, `forUser(id).provision(template)`, **and** the durable-runtime + brain surface. Re-exports all of `@usenaive-sdk/node`.                                                                              |
| **`@usenaive-sdk/node`**          | run-time (base)       | The same client without the provisioning extensions. `@usenaive-sdk/server` is a strict superset; existing imports keep working.                                                                                                                                          |
| **`@usenaive-sdk/runtime`**       | inside a hosted agent | `self` — the agent's own handle: `self.tools`, `self.brain`, `self.memory`, `self.workspace`, `self.teammates`. See [In-agent SDK](/docs/sdk/in-agent).                                                                                                                        |
| **`@usenaive-sdk/cli`** (`naive`) | terminal / CI         | `login`, `init`, `up`, `teams`, `agent-profiles`, `brain`, `env`, and every primitive.                                                                                                                                                                                    |

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_SECRET_KEY! });

// Provision a governed agent profile per tenant, then pull its tools / revoke it.
const op = await naive.forUser(tenant.id).provision("sdr", { idempotencyKey: `op:${tenant.id}` });
const tools = await op.tools();
// await op.revoke();
```

<Note>
  **Which package do I install?** `@usenaive-sdk/server`. It re-exports every export of
  `@usenaive-sdk/node` (literally `export * from "@usenaive-sdk/node"`) and adds provisioning,
  so there is nothing in `node` that is not also in `server`. `@usenaive-sdk/node` is **not
  deprecated and is not going away** — if you already import it, nothing breaks, and the two
  share one `Naive` class hierarchy. Every page in this section imports from
  `@usenaive-sdk/server`.
</Note>

## Two roots on one object

`new Naive({ apiKey })` gives you the **flat resource API** — the surface this SDK has always
published. `createClient<typeof config>({ apiKey })` gives you the same object plus the
**durable-runtime and brain** surface, typed by your own `naive.config.ts`:

```ts theme={"theme":"css-variables"}
import { createClient } from "@usenaive-sdk/server";
import config from "./naive.config.js";

const naive = createClient<typeof config>({ apiKey: process.env.NAIVE_SECRET_KEY! });

naive.cards;                          // every legacy sub-client is still here
naive.teams.support;                  // typed team names — a typo is a compile error
naive.brain;                          // the company's DEFAULT brain
naive.brains;                         // the collection it belongs to — list, create, connect
naive.legacy;                         // the frozen orchestration surface, born deprecated
```

`NaiveClient` **extends** `Naive`, so adopting it costs nothing: one credential, one host, one
transport, and every method you already call keeps its name and its URL. Without a config,
`naive.teams.<name>` does not typecheck — use the always-present string twin
`naive.team("support")`, which behaves identically at runtime.

See [Teams & the durable runtime](/docs/sdk/teams) for what is wired today and what deliberately
refuses.

## Scoped clients — no polymorphic args

Top-level data-plane calls act on your **default user**:

```ts theme={"theme":"css-variables"}
await naive.cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });
await naive.vault.put("instantly.api_key", "key_xyz");
```

`naive.forUser(id)` returns the **full** surface bound to a specific tenant user:

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);
await client.cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });
await client.vault.put("instantly.api_key", "key_xyz");
```

There is no `userId | {args}` overloading — `vault.put(key, value)` always means
`(key, value)`. The scope is fixed by which client you got the sub-client from.

## Projects

A [project](/docs/architecture/projects) is the scope between the organization and its account
kits and child projects (tenant users). `naive.forProject(id)` returns that project's
control plane, and `.forChild(childId)` the data plane inside it:

```ts theme={"theme":"css-variables"}
const staging = await naive.projects.create({ name: "Staging" });
const project = naive.forProject(staging.id);

await project.accountKits.list();
const child = await project.childProjects.create({ external_id: "acme" });
await project.forChild(child.id).cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });

await naive.organization.get();   // /v1/organization, falling back to /v1/company
```

Every organization has a **default project**, so `naive.forUser(id)`, `naive.users` and
`naive.accountKits` are unchanged and mean the same thing inside it —
`naive.forUser(id)` and `naive.forProject("default").forChild(id)` return the identical
`ScopedClient`.

## Control plane vs data plane

* **Control plane** — `naive.projects`, `naive.organization`, `naive.users`,
  `naive.accountKits`, `naive.plans`, `naive.toolkits`, and `forUser(id).provision` /
  agent profile management. Organization scope, **root client only**;
  `naive.forProject(id)` narrows the kit + child-project half of it to one project.
* **Data plane** — 39 sub-clients on `naive.forUser(id)` / `forProject(p).forChild(id)`.

<Warning>
  **Four sub-clients exist only on `forUser(id)`, not on the root client:** `payments`,
  `wallet`, `browser`, `profile`. `naive.payments` is `undefined` at runtime — reach them as
  `naive.forUser(id).payments`. The other 35 are on both.
</Warning>

The 35 available on both the root (default user) and on `forUser(id)`:

`cards` · `phone` · `trading` · `email` · `verification` · `formation` · `domains` ·
`social` · `connections` · `vault` · `logs` · `sessions` · `approvals` · `images` ·
`video` · `search` · `clips` · `llm` · `audio` · `apps` · `compute` · `queue` · `mobile` ·
`database` · `storage` · `functions` · `auth` · `seo` · `aeo` · `cron` · `jobs` · `memory` ·
`brain` · `billing` · `webhooks`

The build primitives operate on a [fullstack app's](/docs/getting-started/apps) managed backend —
`naive.apps.create({ name, type: "fullstack" })` first, then `naive.database` / `naive.storage`
/ `naive.functions` / `naive.auth` (own project), or `naive.forUser(id).database` for an
end-user's project.

## Agent Profiles

`forUser(id).provision(template)` instantiates a governed **agent profile** for a tenant — its
identity, card, comms, and policy as one unit — and returns an `AgentProfile`:

```ts theme={"theme":"css-variables"}
const op = await naive.forUser(tenant.id).provision("sdr", {
  idempotencyKey: `op:${tenant.id}`,          // retried webhook → same agent profile
  overrides: { identity: { legalName: tenant.company } },
});

op.status;                 // "provisioning" | "active" | "needs_action" | ...
const tools = await op.tools();   // governed toolset for your agent / LangGraph / your harness
await op.refresh();        // re-fetch status (provisioning is async)
await op.revoke();         // absolute: freeze card, halt sends, rotate, tear down
```

Run the agent wherever you like — pull `op.tools()` into your own runtime, or use one of the
two hosted runtimes:

* **`runtime.durable()`** — the current runtime. Declared in `naive.config.ts` and driven
  through [`naive.teams`](/docs/sdk/teams).
* **`naive.runtime("pool").start(op.id, { goal })`** — the **frozen legacy orchestration
  runtime**, below.

<Warning>
  **Deprecated — `naive.runtime(pool)` and the legacy orchestration runtime.** `RuntimeHandle`
  (`runtime(pool).start` / `.startSystem`) drives the frozen legacy runtime, which accepts no new
  capabilities. Its routes keep answering and nothing is removed.

  **Use instead:** declare `runtime.durable()` on a `team({ lead, agents })` in `naive.config.ts`
  and drive it through [`naive.teams`](/docs/sdk/teams). There is **no sunset date** — the surface is
  frozen, not scheduled for removal.
</Warning>

Governance is constant on every path (the
[governance gateway](/docs/architecture/governance-gateway)).

<Info>
  Earlier revisions of this page — and of the SDK's own doc comments — called the legacy pool
  "Naïve-hosted microVMs". The implementation is **ECS-on-EC2 containers with EBS volumes**
  (stated at `packages/server/src/runtime.ts`). The word was a documentation defect; it is
  corrected here and at the source.
</Info>

## When to use the SDK vs CLI vs MCP

* **SDK** — embedding Naive in your multi-tenant SaaS backend.
* **CLI** — you, a developer, using Naive from a terminal (acts on your default user).
* **MCP** — handing tools to an MCP-native agent (Claude, Cursor).

The SDK is server-only in v1 (API keys are server secrets).
