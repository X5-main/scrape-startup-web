> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Mastra

> Give your Mastra agents a real-world account. Mastra orchestrates the agent, tools, memory, and workflows; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP server.

[Mastra](https://mastra.ai) is a TypeScript agent framework: you give an `Agent` a model,
instructions, tools, and memory, and it runs the tool-calling loop — plus workflows, RAG,
and evals — until the job is done.

* **What Mastra ships** — agents, the model-calling loop, tools, workflows, memory, RAG,
  streaming, and first-class MCP support.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for
  a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep Mastra's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* Mastra has **first-class MCP support** via [`MCPClient`](https://mastra.ai/reference/tools/mcp-client) —
  point it at any MCP server and its tools are discovered and converted into Mastra tools
  automatically (no manual schema wiring).
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/sdk/sessions)** —
  short-lived, revocable endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* `MCPClient.listToolsets()` is built for exactly this: **per-request, per-user** tool
  config (Mastra's documented multi-tenant pattern). Mint a session for one user, hand it
  to the agent for one run, every tool call runs as that user — gated server-side.

```
  Mastra (agent.generate)               Naive
  ─────────────────────                 ─────
  agent ── model step ──▶ tool call
        │  model picks an MCP tool
        ▼
  MCPClient (SSE + scoped bearer) ──▶  /mcp/sse/sess_…   (per-user session)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `@usenaive-sdk/server` **0.12.x** (Naive **API v2**, hosted MCP server
  over SSE + per-user sessions), `@mastra/core` **1.46.x** (`Agent`, `generate`), and
  `@mastra/mcp` **1.12.x** (`MCPClient`, `listToolsets`, `requireToolApproval`), on
  **Node ≥ 20**.

  Naive's MCP server uses **SSE** transport. Mastra's `MCPClient` tries Streamable HTTP first
  and falls back to SSE, and SSE with custom headers requires **both** `requestInit` and
  `eventSourceInit` (a known MCP-SDK quirk) — both are wired below. On older Mastra (`@mastra/mcp`
  0.x), `listTools()` / `listToolsets()` were named `getTools()` / `getToolsets()`. Pin your
  versions and adjust the model id to a provider you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A model provider key for the model that runs the agent. This guide uses the Mastra model
  router (`"anthropic/claude-sonnet-4-5"`), which reads `ANTHROPIC_API_KEY`.
* Node ≥ 20.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/server @mastra/core @mastra/mcp
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Minimal viable integration

The shortest path to a Mastra agent that can actually transact: define a policy and
provision a user (control plane, once), then at runtime mint a per-user MCP session and
hand it to the agent.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the agent does is bounded by this kit — server-side. These are one-time
    control-plane calls:

    ```ts theme={"theme":"css-variables"}
    import { Naive } from "@usenaive-sdk/server";

    const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

    // Control plane: a reusable policy template.
    const pro = await naive.accountKits.create({
      name: "Pro",
      primitives_config: {
        cards: { enabled: true, requiresApproval: true, defaults: { spending_limit_cents: 50000 } },
        vault: { enabled: true },
      },
      connections_config: { mode: "allowlist", toolkits: ["github", "gmail", "stripe"] },
    });

    // Provision one of your end-users and assign the kit.
    const alice = await naive.users.create({
      external_id: "user_123",
      email: "alice@acme.com",
      account_kit_id: pro.id,
    });

    // Data plane: a client bound to Alice. No call here takes a userId — the scope is fixed.
    const client = naive.forUser(alice.id);
    ```
  </Step>

  <Step title="Mint a per-user MCP session and connect it">
    At runtime, mint a short-lived [session](/docs/sdk/sessions) for the user and point Mastra's
    `MCPClient` at its scoped SSE endpoint. The bearer lives in the session headers, never in
    the URL, and expires (default 15 min, max 24h):

    ```ts theme={"theme":"css-variables"}
    import { MCPClient } from "@mastra/mcp";

    const session = await client.session({ ttlMs: 15 * 60 * 1000 });

    const mcp = new MCPClient({
      servers: {
        naive: {
          url: new URL(session.mcp.url),         // scoped, per-user endpoint
          // POST messages carry the scoped bearer...
          requestInit: { headers: session.mcp.headers },
          // ...and so must the SSE connection (required for SSE + custom headers).
          eventSourceInit: {
            fetch(input: Request | URL | string, init?: RequestInit) {
              const headers = new Headers(init?.headers);
              for (const [k, v] of Object.entries(session.mcp.headers)) headers.set(k, v);
              return fetch(input, { ...init, headers });
            },
          },
        },
      },
    });
    ```
  </Step>

  <Step title="Build the agent — and let it transact">
    Define an `Agent` and pass the session's tools per call via `listToolsets()`. Because the
    toolset is minted per request, the same agent definition can serve every tenant — each run
    is scoped to whichever user's session you pass:

    ```ts theme={"theme":"css-variables"}
    import { Agent } from "@mastra/core/agent";

    const agent = new Agent({
      name: "Ops Agent",
      instructions:
        "You are Alice's operations agent. Use Naive tools to act on her real account.",
      model: "anthropic/claude-sonnet-4-5", // or an @ai-sdk/* provider instance
    });

    try {
      const res = await agent.generate(
        "Connect my GitHub, then issue a $50 virtual card called 'Ads budget' for our marketing spend.",
        { toolsets: await mcp.listToolsets() }, // per-user tools, scoped to this session
      );
      console.log(res.text);
    } finally {
      await mcp.disconnect();
    }
    ```

    The model discovers GitHub, returns a connect link for Alice to authorize, and attempts to
    issue the card — a **real** card on Alice's account, capped by her kit. The whole agent
    loop is Mastra's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~50 lines: the same Mastra agent that would otherwise just *describe*
spending money now issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend.
You get two complementary layers — pair them for defense in depth:

* **In the agent** — Mastra's `requireToolApproval` interrupts before a tool from that
  server runs, so the run pauses and surfaces the call for review.
* **On the server** — even if a call gets through, Naive freezes it and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it.

Set `requireToolApproval` on the Naive server so write actions pause for review. Pass a
function to keep read-only discovery (search/list) flowing while gating everything else:

```ts theme={"theme":"css-variables"}
const mcp = new MCPClient({
  servers: {
    naive: {
      url: new URL(session.mcp.url),
      requestInit: { headers: session.mcp.headers },
      eventSourceInit: { /* …as above… */ },
      // Skip approval for tools the server marks read-only; gate the rest.
      requireToolApproval: ({ annotations }) => !annotations?.readOnlyHint,
    },
  },
});
```

<Note>
  Tool annotations are advisory hints, not a security boundary. Treat `requireToolApproval`
  as a UX/early-interrupt convenience — the real enforcement is Naive's server-side approval
  gate below, which applies regardless of prompt or agent configuration. You can also pass
  `requireToolApproval: true` to gate **every** Naive tool.
</Note>

When a call does reach Naive, the tool result comes back as a pending approval rather than
a live card:

```json theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval_id": "65589c8b-e033-4a65-b16c-379211c94429",
  "action": "cards.create",
  "primitive": "cards",
  "title": "Issue virtual card \"Ads budget\"",
  "message": "This action requires human approval before it executes."
}
```

The immediate `202` / `isPendingApproval` payload uses `action`; approval records from
`approvals.list()` or `approvals.get()` use `action_type`.

Your app then resolves it out of band — and on approval, Naive **replays the frozen action**
server-side:

```ts theme={"theme":"css-variables"}
import { isPendingApproval } from "@usenaive-sdk/server";

// Find what the agent queued for Alice.
const { approvals } = await client.approvals.list({ status: "pending" });

for (const a of approvals) {
  // ...show a.title / a.action_type to a human in your UI...
  await client.approvals.approve(a.id); // API replays cards.create → real card
  // or: await client.approvals.deny(a.id, { reason: "over budget" });
}
```

You can also catch the pending state at the SDK call site with `isPendingApproval(res)`, or
poll a single approval to completion with `client.approvals.wait(approvalId)`. See
[Approvals](/docs/getting-started/approvals) for the full lifecycle (`pending → executed /
failed / denied`).

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: static tools for single-user automation

If the agent only ever acts as **one** account — your own back-office automation, a CLI,
an internal bot — you don't need per-request toolsets. Mint a session for the default user,
load its tools once with `listTools()`, and bake them into the agent at construction:

```ts theme={"theme":"css-variables"}
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";

const session = await naive.session({ ttlMs: 24 * 60 * 60 * 1000 }); // default user

const mcp = new MCPClient({
  servers: {
    naive: {
      url: new URL(session.mcp.url),
      requestInit: { headers: session.mcp.headers },
      eventSourceInit: {
        fetch: (input: Request | URL | string, init?: RequestInit) =>
          fetch(input, { ...init, headers: { ...init?.headers, ...session.mcp.headers } }),
      },
    },
  },
});

const agent = new Agent({
  name: "Back-office Agent",
  instructions: "Operate the company's own Naive account.",
  model: "anthropic/claude-sonnet-4-5",
  tools: await mcp.listTools(), // fixed at construction, namespaced naive_*
});
```

<Info>
  Prefer the loop to run entirely in your backend without MCP? `naive.forUser(id).agentTools()`
  returns the same capabilities as a discover-then-run [toolset](/docs/sdk/agent-tools) with a
  `handle(name, input)` dispatcher you adapt into Mastra's `createTool` (convert each tool's
  JSON Schema to a Standard Schema such as Zod). Same Account Kit, same approval gates — just
  in-process instead of over MCP.
</Info>

## What stays enforced

No matter which path you choose, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your agent:

* **Identity** — every action runs as a specific [tenant user](/docs/getting-started/users),
  fully isolated from your other users.
* **Capability bounds** — the [Account Kit](/docs/architecture/account-kits) decides which
  primitives and which apps the agent can touch (`allowlist` / `blocklist` / per-tool).
* **Scoped spend** — virtual cards are capped per card and per user; the model can't raise
  its own limit.
* **Human-in-the-loop** — sensitive actions ([cards](/docs/getting-started/cards),
  [domains](/docs/getting-started/domains), [KYC](/docs/getting-started/verification),
  [formation](/docs/getting-started/formation), connecting an app) freeze as
  [approvals](/docs/getting-started/approvals) until a human says yes.

## Next steps

* [SDK overview](/docs/sdk/overview) — the full Naive client surface
* [Sessions](/docs/sdk/sessions) — per-user MCP sessions for any MCP-aware runtime
* [Agent tools](/docs/sdk/agent-tools) — what `agentTools()` exposes and how `handle()` works
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [MCP server](/docs/mcp/overview) — how Naive's hosted MCP server works

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — scoped MCP session model
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
