> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Composio to Naive

> Move agent tool-auth from Composio's standalone connected-accounts API to Naive's /connections primitive — the same connect-1,000-apps-and-execute-tools capability, rooted in one governed identity that also owns the agent's cards, email, vault, and KYC.

<Frame caption="Composio's tool/auth aggregation → the Naive /connections primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/composio-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=f43e53a9ec6a265215da4a1a1e4f02a0" alt="Composio" height="28" data-path="migration-guides/logos/composio-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/composio-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=813a2f25b63ac827827e20facdbd3efd" alt="Composio" height="28" data-path="migration-guides/logos/composio-dark.svg" />
</Frame>

[Composio](https://composio.dev) gives an AI agent authenticated access to 1,000+ third-party
apps through one API — create an auth config, send the user through a hosted OAuth link, then
`composio.tools.execute("GITHUB_CREATE_ISSUE", …)`. It does that job well, and the API is clean.
But it is also a *separate vendor account*:

* Tool connections live behind their **own** API key, dashboard, and `user_id` (entity) namespace.
* That `user_id` scopes **connected accounts and nothing else** — it knows the agent's Slack and
  GitHub grants, but not its virtual card, its inbox, its vault secrets, or its KYC status.
* "Who let this agent post to Slack, and what *else* can it touch?" is answered in Composio for
  tools, and somewhere else for everything else. There is no shared accountability.

Naive's [`/connections`](/docs/getting-started/connections) primitive gives the agent the **same**
capability — connect an app, list its tools, execute them — but rooted in **one identity**:

* The [tenant user](/docs/getting-started/users) that holds the connections is the same user that
  owns its [cards](/docs/getting-started/cards), its [email](/docs/getting-started/email) inbox, its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* What the agent is *allowed* to connect and execute is decided by that user's
  [Account Kit](/docs/getting-started/account-kits) **at execution time** — not by which tools you
  remembered to pass into the model.
* Every connect and execute lands in the same per-user [activity log](/docs/getting-started/logs) as
  everything else the agent does.

This guide maps Composio's API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  Composio is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** Composio TypeScript SDK [`@composio/core`](https://docs.composio.dev) v3
  (API surface per [docs.composio.dev](https://docs.composio.dev), snapshot June 2026) and the
  Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base
  `https://api.usenaive.ai/v1`, docs snapshot June 2026).

  Version notes:

  * Composio v3 renamed v1/v2 concepts: **entity → user**, **action → tool**, **app → toolkit**,
    **integration → auth config**, **connection → connected account**. This guide uses v3 terms.
  * For Composio-managed OAuth, `connectedAccounts.initiate()` is being retired (org cutover by
    2026-07-03) in favor of `connectedAccounts.link()` — same return shape and `redirectUrl`.
    This guide uses `link()`.
  * Both are evolving APIs — verify method names against your installed SDK version.
</Info>

## Concept map

| Composio                                                                                 | Naive                                                                                      | Notes                                                                                                   |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `new Composio({ apiKey })`                                                               | `new Naive({ apiKey })`                                                                    | Server-side key in both cases                                                                           |
| `user_id` (entity) — scopes **connected accounts only**                                  | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive | The core consolidation win                                                                              |
| `toolkit` slug (`github`, `gmail`, `slack`)                                              | Same slug convention (`GET /v1/toolkits`)                                                  | Naive reuses toolkit + tool naming                                                                      |
| `tool` slug (`GITHUB_CREATE_ISSUE`)                                                      | Same tool slug                                                                             | Identical naming                                                                                        |
| **Auth config** `ac_…` (`composio.authConfigs.create` / `.get`)                          | No standalone auth-config object — toolkits are connectable directly                       | Naive defaults to managed auth; bring-your-own OAuth is an Account-Kit setting, not a separate resource |
| `composio.connectedAccounts.link(userId, authConfigId, { callbackUrl })` → `redirectUrl` | `client.connections.connect(toolkit, { callbackUrl })` → `redirectUrl`                     | Naive keys by **toolkit slug**, not an auth-config id                                                   |
| `composio.connectedAccounts.list({ userIds, statuses })`                                 | `client.connections.connected()`                                                           | Naive reads a local mirror (lazy-reconciled)                                                            |
| `composio.toolkits.get()` (full catalog)                                                 | `GET /v1/toolkits` / `client.connections.list({ search })`                                 | The per-user list is **kit-filtered**; `/v1/toolkits` is the full catalog                               |
| `composio.tools.get(userId, { toolkits })`                                               | `client.connections.tools(toolkit)`                                                        | Naive returns raw schemas — see [gaps](#what-does-not-map-yet) on framework wrappers                    |
| `composio.tools.execute(slug, { userId, arguments, connectedAccountId })`                | `client.connections.execute(toolkit, tool, args)`                                          | The core path; see [gaps](#what-does-not-map-yet) for multi-account selection                           |
| Disconnect (revoke a connected account)                                                  | `client.connections.disconnect(toolkit, { purge })`                                        | Soft-disable by default; `purge: true` revokes                                                          |
| **Auth-config-level** tool enable/disable                                                | **Account Kit** `connections_config` — allow/block + per-tool filter + **approval gating** | Execution-time policy, per user — the governance win                                                    |
| **Triggers** (`composio.triggers.*`, app event subscriptions)                            | Partial — [Webhooks](/docs/getting-started/webhooks)                                            | No generic per-toolkit trigger subscription — see [gaps](#what-does-not-map-yet)                        |
| **Provider toolsets** (OpenAI / Anthropic / LangChain / Vercel wrappers)                 | —                                                                                          | Naive exposes tools to agents via [MCP](/docs/mcp/overview) / its own runtime, not per-framework wrappers    |
| **Version pinning** (`version`, `dangerouslySkipVersionCheck`)                           | —                                                                                          | Naive pins toolkit versions internally; no per-call `version`                                           |

## Before / after: the core path

The path that matters for almost every agent is *connect an app, then execute one of its tools*.
Here it is on both platforms (GitHub used as the example toolkit).

<CodeGroup>
  ```ts Composio theme={"theme":"css-variables"}
  import { Composio } from "@composio/core";

  const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! });

  // 1. You first create an auth config for the toolkit (dashboard or SDK) → ac_...
  const authConfig = await composio.authConfigs.create("github", {
    name: "GitHub",
    type: "use_composio_managed_auth",
  });

  // 2. Start a hosted connect flow for this user, send them to redirectUrl
  const conn = await composio.connectedAccounts.link("user_123", authConfig.id, {
    callbackUrl: "https://app.example.com/oauth/callback",
  });
  // → send the user to conn.redirectUrl; conn.waitForConnection() resolves when ACTIVE

  // 3. Execute a tool once the account is connected
  const res = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "acme", repo: "agent", title: "Ping", body: "from the agent" },
  });
  // res.successful, res.data
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("user_123"); // same id space as your own users

  // 1. No separate auth-config step — connect the toolkit directly by slug
  const conn = await client.connections.connect("github", {
    callbackUrl: "https://app.example.com/oauth/callback",
  });
  // → send the user to conn.redirectUrl; status becomes ACTIVE after they finish

  // 2. (optional) confirm it's connected from the local mirror
  const connected = await client.connections.connected();

  // 3. Execute a tool — toolkit slug + tool slug + arguments
  const res = await client.connections.execute("github", "GITHUB_CREATE_ISSUE", {
    owner: "acme",
    repo: "agent",
    title: "Ping",
    body: "from the agent",
  });
  // Typical shape: { successful, error?, data? } — verify against your SDK version
  ```
</CodeGroup>

The execute call lines up almost one to one. The real differences to plan for:

* **No auth-config resource.** Composio makes you create an auth config (`ac_…`) per toolkit
  before linking. Naive connects by **toolkit slug** directly using managed auth — there is no
  intermediate object to create or track. White-label OAuth (your own client id/secret) is set
  on the [Account Kit](/docs/getting-started/account-kits) (`connections_config.custom_auth_configs`),
  not as a standalone resource.
* **Arguments are the last positional arg.** Composio takes `{ userId, arguments }`; Naive's
  scoped client already knows the user, so `execute(toolkit, tool, args)` passes the tool's
  arguments directly.
* **The user id is your identity, not a separate entity.** In Composio `user_id` is an entity
  that exists *only* for tool auth. In Naive the same id is a [tenant user](/docs/getting-started/users)
  that also owns the agent's cards, inbox, vault, and KYC.

### Connecting an app (OAuth)

Both platforms return a hosted redirect URL and surface a connection status you can poll.

<CodeGroup>
  ```ts Composio theme={"theme":"css-variables"}
  const conn = await composio.connectedAccounts.link("user_123", "ac_github", {
    callbackUrl: "https://app.example.com/oauth/callback",
  });
  console.log(conn.redirectUrl);          // send the user here
  await conn.waitForConnection();         // resolves when ACTIVE
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { isPendingApproval } from "@usenaive-sdk/server";

  const conn = await client.connections.connect("github", {
    callbackUrl: "https://app.example.com/oauth/callback",
  });

  // `connect` returns ConnectResult | PendingApproval. Only the first has a URL.
  if (isPendingApproval(conn)) {
    console.log("waiting on a human:", conn.approval_id);
  } else {
    console.log(conn.redirectUrl);        // send the user here
    // poll the mirror until ACTIVE (or drive it from a webhook)
    const connected = await client.connections.connected();
  }
  ```
</CodeGroup>

* On Naive, connecting a service is a **sensitive** action and may be
  [approval-gated](/docs/getting-started/approvals) by the Account Kit — `connect` can return
  `pending_approval` (202) until a human approves.
* `INITIATED` rows older than \~10s are reconciled from the provider before responding. See
  [Connection status](/docs/architecture/connection-webhooks).

## Minimal viable migration

The smallest swap that keeps a working agent running is just *connect* + *execute*. You do not
need to recreate auth configs, tenant-user fan-out, or Account Kits to make your first call.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Map your user ids">
    Composio's `user_id` (entity) becomes a Naive [tenant user](/docs/getting-started/users). Reuse
    your own database id as `external_id` so the mapping is 1:1, or pass it straight into
    `naive.forUser(id)` if you already key by it.
  </Step>

  <Step title="Drop the auth-config step, connect by slug">
    Replace `authConfigs.create` + `connectedAccounts.link(userId, authConfigId, …)` with a
    single `client.connections.connect(toolkit, { callbackUrl })`. Same hosted `redirectUrl`.
  </Step>

  <Step title="Swap execute">
    Replace `composio.tools.execute(tool, { userId, arguments })` with
    `client.connections.execute(toolkit, tool, args)`. Tool slugs (`GITHUB_CREATE_ISSUE`,
    `GMAIL_SEND_EMAIL`, …) are unchanged.
  </Step>

  <Step title="Ship it">
    At this point you are off Composio for the core connect/execute path. Everything below is
    upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Composio, `user_id` isolates **tool connections
and nothing else**. On Naive, the unit of isolation is a **tenant user**, and it isolates the
agent's *entire* footprint.

<CodeGroup>
  ```ts Composio (entity — tool auth only) theme={"theme":"css-variables"}
  // One entity per customer; isolates connected accounts, and only those.
  const userId = "customer-acme";
  await composio.connectedAccounts.link(userId, "ac_github", { callbackUrl });
  await composio.tools.execute("GITHUB_CREATE_ISSUE", { userId, arguments: {/* … */} });

  // The card, the inbox, the secrets, the KYC for this customer's agent
  // live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  await client.connections.connect("github", { callbackUrl });
  await client.connections.execute("github", "GITHUB_CREATE_ISSUE", {/* … */});

  // The SAME client owns this customer's card, inbox, secrets, and KYC —
  // one identity, isolated end to end.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  const inbox = await client.email.createInbox({ local_part: "notifications" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Composio, the agent's connections are an island. With Naive, `naive.forUser(acme.id)` is a
  single handle to **connections *and* cards *and* email *and* vault *and* KYC**.
* You provision a customer's whole agent footprint from one identity, and tear it down from one
  place. Sibling tenants can never read each other's connections, cards, or secrets.

### Gain #2 — execution-time permission enforcement

* Which apps an agent may connect, and which tools it may run, is **policy on the Account Kit** —
  not a check you hand-write, and not just "which tools you passed to the model."

```ts theme={"theme":"css-variables"}
const starter = await naive.accountKits.create({
  name: "Starter",
  connections_config: {
    mode: "allowlist",
    toolkits: ["github", "slack"],               // only these apps are connectable
    tools: { github: { enable: ["GITHUB_CREATE_ISSUE"] } }, // and only this tool on GitHub
    approvalToolkits: ["slack"],                  // posting to Slack freezes for human approval
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);
```

* The agent's code is identical for every tier — `client.connections.execute("github", …)`.
  Whether the call runs is decided by the **caller's kit at execution time**:
  * A `blocklist`/`allowlist` `mode` governs which toolkits connect at all.
  * Per-tool `enable`/`disable` filters lock execution down to specific tools.
  * `approvalToolkits` (or `requiresApproval`) freezes a sensitive call until a human
    [approves](/docs/getting-started/approvals) — the API replays it only after approval.
* Move the user to a kit that drops `github` and the exact same line returns `forbidden`, with no
  code change on your side. Composio gates *auth* (which accounts exist); Naive additionally gates
  *execution* per user.

### Gain #3 — unified accountability

* Every connect, execute, and disconnect for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their card, email, and vault events, not in a
  separate tools dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — connections, cards, email, secrets, one timeline
```

* That is the question that is hard to answer when tool auth lives in Composio, cards live in
  Stripe, and secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. None of the following block the core path
(connect → list tools → execute → disconnect all map cleanly), but they are real differences.
Check this list against your app before you commit.

| Composio feature                                                                                                               | Status on Naive                                                 | Workaround                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth configs** as first-class objects (`composio.authConfigs.*`, multiple configs per toolkit)                               | No standalone object — managed auth by toolkit slug             | Bring-your-own OAuth via Account Kit `connections_config.custom_auth_configs` (per toolkit)                                                         |
| **Provider toolsets** (`tools.get` returning OpenAI / Anthropic / LangChain / Vercel-shaped tools, `provider.handleToolCalls`) | Not provided on `/connections`                                  | `connections.tools(toolkit)` returns raw schemas; expose tools to agents via [MCP](/docs/mcp/overview) / the Naive runtime, or wrap the schemas yourself |
| **Triggers** (`composio.triggers.*` — subscribe to app events that fire tools)                                                 | No generic per-toolkit trigger                                  | Use [Webhooks](/docs/getting-started/webhooks) for Naive-native events; poll for app-side changes                                                        |
| **Toolkit version pinning** (`version`, `dangerouslySkipVersionCheck`)                                                         | Not exposed                                                     | Naive pins versions internally; no per-call `version` to set                                                                                        |
| **Custom tools / proxy execute** (`createCustomTool`, raw HTTP passthrough)                                                    | Not on `/connections`                                           | Use Naive [Functions](/docs/getting-started/functions) for custom server-side logic                                                                      |
| **`waitForConnection()`** polling helper                                                                                       | No promise helper                                               | Poll `connections.connected()` or drive status from a connection [webhook](/docs/architecture/connection-webhooks)                                       |
| **Multiple connected accounts per toolkit** (`allowMultiple`, pick by `connectedAccountId`)                                    | Partial — single active account per toolkit is the default path | If you need a specific account, check the [execute API reference](/docs/api-reference/connections/execute) for optional `connected_account_id` support   |
| **File / attachment helpers** in tool execution                                                                                | Provider-dependent                                              | Pass file references in `arguments`; no dedicated upload helper on `/connections`                                                                   |

<Warning>
  If your agent depends on **Composio triggers**, **per-framework provider toolsets**, or
  **pinned toolkit versions**, those are the gaps most likely to matter. The connect-then-execute
  loop with Account-Kit governance — the most common agent tool-auth pattern — maps cleanly today.
</Warning>

## Where to go next

* [`/connections` primitive](/docs/getting-started/connections) — full connect/execute lifecycle
* [Connections API reference](/docs/api-reference/connections/connect) — exact request/response shapes
* [`connections` SDK sub-client](/docs/sdk/sub-clients/connections) — typed method signatures
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model that makes execution-time tool governance real
* [Tenant users](/docs/getting-started/users) — the identity that the consolidation hangs off

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Access Governance Platform](https://usenaive.ai/blog/how-to-build-an-agentic-access-governance-platform) — connections + Account Kit tutorial
