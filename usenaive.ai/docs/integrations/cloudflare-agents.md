> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cloudflare Agents

> Give your Cloudflare Agents a real-world account. The Agents SDK runs stateful, edge-deployed agents — Durable Object state, the AI SDK loop, scheduling, and a built-in MCP client; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP session.

[Cloudflare Agents](https://developers.cloudflare.com/agents/) is the TypeScript framework for
building **stateful AI agents on Durable Objects** — one isolated instance per user or
conversation, running globally on Cloudflare's network.

* **What it ships** — durable per-instance state (SQLite), the AI SDK tool-calling loop,
  `AIChatAgent` + the `useAgentChat` React hook, hibernation/wake, scheduling, WebSockets,
  and a **built-in MCP client** (`this.addMcpServer`, `this.mcp.getAITools()`).
* **What it doesn't ship** — a way for that edge agent to *act as a real account*: sign up
  for a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep the Agents SDK's orchestration; Naive gives each agent
instance a [tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* Cloudflare Agents ships a first-class **MCP client**: call `this.addMcpServer(name, url, …)`
  and every tool from that server becomes available to the agent; `this.mcp.getAITools()`
  hands them straight to `streamText` / `generateText`.
* Naive mints **per-user [MCP sessions](/docs/sdk/sessions)** — short-lived, revocable SSE
  endpoints whose tool list is the fused native + third-party toolset, already filtered by
  that user's Account Kit.
* So the integration is: per agent instance, mint a Naive session → `addMcpServer` with its
  SSE URL + scoped bearer → every tool call runs as that user, gated server-side.

```
  Cloudflare Agent (Durable Object)      Naive
  ─────────────────────────────────      ─────
  onChatMessage ── streamText ── loop
        │  model picks an MCP tool
        ▼
  this.mcp.getAITools()  ──────────▶  /mcp/sse/sess_…   (per-user session)
        ▲  addMcpServer(sse + bearer)     │  AccountKit-gated, scoped to one user
        │                                 ▼
  one DO instance = one end-user    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** Naive **API v2** (hosted MCP server over SSE, per-user sessions) and
  `@usenaive-sdk/server` **0.x** for the one-time control-plane script; Cloudflare `agents`
  **0.12.x**, `@cloudflare/ai-chat` **0.7.x**, `workers-ai-provider` (current), and the AI SDK
  (`ai` **v5+**: `streamText`, `convertToModelMessages`, `stepCountIs`,
  `toUIMessageStreamResponse`). Wrangler with `nodejs_compat`.

  Version assumptions: the Agents `AIChatAgent` requires the `new_sqlite_classes` migration in
  `wrangler.jsonc` for message persistence. Naive's hosted MCP server speaks **SSE**, so this
  guide pins `transport: { type: "sse" }` (Cloudflare's default `"auto"` also negotiates it).
  Pin your versions and set the model to one your account can access.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A Cloudflare account with Workers + the `wrangler` CLI (`npm create cloudflare@latest`).
* A model — this guide uses the **Workers AI** binding (no extra key); swap any AI SDK
  provider (`@ai-sdk/openai`, etc.) if you prefer.
* Node ≥ 20 for the control-plane script.

```bash theme={"theme":"css-variables"}
# In your Worker project
npm install agents @cloudflare/ai-chat ai workers-ai-provider

# For the one-time provisioning script (run locally / in CI)
npm install @usenaive-sdk/server
```

```bash theme={"theme":"css-variables"}
wrangler secret put NAIVE_API_KEY   # nv_sk_live_...
```

## Minimal viable integration

The shortest path to a Cloudflare Agent that can actually transact: define a policy and
provision a user (control plane, once), wire the Worker, then connect the per-user Naive
session inside the agent.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the agent does is bounded by this kit — server-side. These are one-time
    control-plane calls (run anywhere with Node — they don't belong in the edge runtime):

    ```ts theme={"theme":"css-variables"}
    // provision.ts — run once.
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

    console.log(alice.id); // → set as the NAIVE_USER_ID var for the Worker
    ```
  </Step>

  <Step title="Configure the Worker">
    Register the agent as a Durable Object with the SQLite migration `AIChatAgent` needs, bind
    Workers AI, and pass the user id through `vars` (the API key is a secret):

    ```jsonc theme={"theme":"css-variables"}
    // wrangler.jsonc
    {
      "name": "naive-agent",
      "main": "src/index.ts",
      "compatibility_date": "2026-06-30",
      "compatibility_flags": ["nodejs_compat"],
      "ai": { "binding": "AI" },
      "durable_objects": {
        "bindings": [{ "name": "NaiveAgent", "class_name": "NaiveAgent" }]
      },
      "migrations": [{ "tag": "v1", "new_sqlite_classes": ["NaiveAgent"] }],
      "vars": { "NAIVE_USER_ID": "usr_..." }
    }
    ```
  </Step>

  <Step title="Connect the session — and let the agent transact">
    In the agent, mint a per-user [session](/docs/sdk/sessions) and connect it as an MCP server. The
    bearer lives only in the request headers (never the URL) and expires. `AIChatAgent` waits for
    MCP connections before each turn, so `this.mcp.getAITools()` returns the full toolset:

    ```ts theme={"theme":"css-variables"}
    // src/index.ts
    import { AIChatAgent } from "@cloudflare/ai-chat";
    import { routeAgentRequest } from "agents";
    import { createWorkersAI } from "workers-ai-provider";
    import { streamText, convertToModelMessages, stepCountIs } from "ai";

    interface Env {
      AI: Ai;
      NaiveAgent: DurableObjectNamespace;
      NAIVE_API_KEY: string;
      NAIVE_USER_ID: string;
    }

    export class NaiveAgent extends AIChatAgent<Env> {
      async onStart() {
        // Connection is restored from storage on wake — only connect once.
        if (this.getMcpServers().servers["naive"]) return;

        // Mint a per-user Naive MCP session (SSE), scoped by the user's Account Kit.
        const res = await fetch(
          `https://api.usenaive.ai/v1/users/${this.env.NAIVE_USER_ID}/sessions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.env.NAIVE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ttl_ms: 24 * 60 * 60 * 1000 }), // max 24h
          },
        );
        const session = await res.json();

        // Naive's tools become this agent's tools — gated server-side for this one user.
        await this.addMcpServer("naive", session.mcp.url, {
          id: "naive", // stable id → readable tool keys, single connection per instance
          transport: { type: "sse", headers: session.mcp.headers },
        });
      }

      async onChatMessage(onFinish: Parameters<typeof streamText>[0]["onFinish"]) {
        const workersai = createWorkersAI({ binding: this.env.AI });

        const result = streamText({
          model: workersai("@cf/zai-org/glm-4.7-flash"), // adjust to a model you can access
          system:
            "You act on this user's real account through Naive tools. " +
            "Connect apps and spend only within their Account Kit.",
          messages: await convertToModelMessages(this.messages),
          tools: this.mcp.getAITools(), // Naive's tools, discovered over MCP
          stopWhen: stepCountIs(10), // cap tool-call rounds for the agentic loop
          onFinish,
        });

        return result.toUIMessageStreamResponse();
      }
    }

    export default {
      fetch: async (req: Request, env: Env) =>
        (await routeAgentRequest(req, env)) ?? new Response("Not found", { status: 404 }),
    };
    ```

    Ask the agent to *"Connect my GitHub, then issue a \$50 virtual card called 'Ads budget'."*
    It discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts the card (`naive_cards_create`) — a **real** card on Alice's account,
    capped by her kit. The loop is Cloudflare's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat: the same edge agent that would otherwise just *describe* spending money now
issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. The
enforcement is server-side, so it holds no matter what the edge runtime does — the tool
result comes back as a frozen approval (HTTP `202`) instead of a live card:

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

The immediate `202` response uses `action`; approval records from `approvals.list()` or
`approvals.get()` use `action_type`.

Resolve it out of band — and on approval, Naive **replays the frozen action** server-side. A
small control-plane handler (or the [dashboard](https://dashboard.usenaive.ai) / CLI) does it:

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";

const client = new Naive({ apiKey: process.env.NAIVE_API_KEY! }).forUser(process.env.NAIVE_USER_ID!);

const { approvals } = await client.approvals.list({ status: "pending" });
for (const a of approvals) {
  // ...show a.title / a.action_type to a human in your UI...
  await client.approvals.approve(a.id); // API replays cards.create → real card
  // or: await client.approvals.deny(a.id, { reason: "over budget" });
}
```

See [Approvals](/docs/getting-started/approvals) for the full lifecycle
(`pending → executed / failed / denied`).

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Going multi-tenant: one agent per end-user

The realistic shape: each Durable Object instance is one of your end-users. Route by your
user id, store the matching Naive user id in agent [state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/),
and mint the session for that user:

```ts theme={"theme":"css-variables"}
import { getAgentByName } from "agents";

// In your app's request handler — instance name = your end-user's id.
const agent = await getAgentByName(env.NaiveAgent, currentUser.id);
await agent.setUser(naiveUserId); // a callable method that stores it + connects the session
```

Inside the agent, mint the session against the stored user id instead of the env var, and
manage the lifecycle:

* **Refresh on expiry** — when a session lapses, `removeMcpServer("naive")` then
  `addMcpServer` with a freshly minted session.
* **Revoke on logout** — call `DELETE /v1/users/:id/sessions/:id` (or
  `client.sessions.revoke(id)`) to kill the endpoint immediately, independent of the DO.

Same Account Kit, same approval gates — now isolated per end-user, each in its own globally
distributed instance.

## What stays enforced

No matter where the agent runs, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your Worker config:

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
* **Revocable** — the session is short-lived and killable on demand; revoke and the agent
  loses real-world reach instantly, mid-flight.

## Next steps

* [Sessions](/docs/sdk/sessions) — per-user MCP sessions for edge / untrusted runtimes
* [MCP server](/docs/mcp/overview) — the hosted Naive MCP endpoint and its tools
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [SDK overview](/docs/sdk/overview) — the full Naive client surface for the control plane

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — scoped MCP session model
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
