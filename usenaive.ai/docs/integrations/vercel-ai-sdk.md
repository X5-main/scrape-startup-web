> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Vercel AI SDK

> Give your Vercel AI SDK agents a real-world account. The AI SDK runs the model, the tool-calling loop, and streaming; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend.

The [Vercel AI SDK](https://ai-sdk.dev) is the de-facto TypeScript toolkit for building
LLM apps and agents. It ships the parts that *run* the model:

* **The model layer** — one `generateText` / `streamText` interface across OpenAI,
  Anthropic, Google, and dozens of other providers.
* **The tool-calling loop** — define `tool()`s with a schema and an `execute`, set
  `stopWhen`, and the SDK runs multi-step tool calls until the job is done.
* **Streaming + UI** — `streamText`, `useChat`, and structured output for full-stack apps.

What it doesn't ship is a way for those agents to **act as a real account** — sign up for a
SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep the AI SDK's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* Naive's SDK exposes a small, drop-in toolset via `agentTools()` — a **discover-then-run**
  meta-toolset (search apps/primitives, then run them) instead of thousands of schemas.
* Each Naive tool ships an Anthropic-style `input_schema` (plain JSON Schema). The AI SDK's
  `tool()` accepts a raw JSON schema via the `jsonSchema()` helper — so the adapter is a few
  lines, with no manual Zod rewrites.
* Every call stays gated by the user's Account Kit on Naive's servers; sensitive actions
  resolve to a `pending_approval` payload.

```
  Vercel AI SDK (generateText)          Naive
  ───────────────────────────          ─────
  model ── tool call ──▶ loop
        │  model picks a tool
        ▼
  tool.execute(input)  ──────────▶  kit.handle(name, input)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect Gmail · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `@usenaive-sdk/server` **0.12.x** (Naive **API v2**), `ai` **7.0.x**
  (`generateText`, `tool`, `jsonSchema`, `stopWhen`, `stepCountIs`), `@ai-sdk/openai`
  **4.0.x**, and — for the MCP extension — `@ai-sdk/mcp` **2.0.x** (`createMCPClient`, SSE
  transport), on **Node ≥ 20**.

  Version assumptions: AI SDK **v5+** renamed a tool's `parameters` → `inputSchema` and
  replaced `maxSteps` with `stopWhen: stepCountIs(n)`. In **v7** the MCP client moved out of
  the core `ai` package into `@ai-sdk/mcp` (`createMCPClient`; the old
  `experimental_createMCPClient` import from `ai` is gone). Naive's hosted MCP server speaks
  **SSE**. Pin your versions and set the model to a provider you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `OPENAI_API_KEY` (or any other AI SDK provider key) for the model that runs the agent.
* Node ≥ 20.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/server ai @ai-sdk/openai @ai-sdk/mcp
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to an AI SDK agent that can actually transact: define a policy, provision
a user, adapt Naive's tools, and run the loop.

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

  <Step title="Adapt Naive's tools into AI SDK tools">
    `client.agentTools()` returns tools as JSON-schema definitions plus a `handle(name, input)`
    dispatcher. Map each Naive tool's `input_schema` through `jsonSchema()` and route the
    executor through `handle`. The result is a plain `ToolSet` keyed by tool name:

    ```ts theme={"theme":"css-variables"}
    import { tool, jsonSchema } from "ai";
    import type { NaiveAgentToolset } from "@usenaive-sdk/server";

    function naiveToolsForAISDK(kit: NaiveAgentToolset) {
      return Object.fromEntries(
        kit.tools.map((t) => [
          t.name,
          tool({
            description: t.description,
            // Anthropic-style JSON Schema passed straight through — no Zod rewrite.
            inputSchema: jsonSchema(t.input_schema),
            execute: (input) => kit.handle(t.name, input as Record<string, unknown>),
          }),
        ]),
      );
    }
    ```

    This yields the discover-then-run meta-tools (`naive_search_apps`, `naive_connect_app`,
    `naive_run_capability`, `naive_search_primitives`, `naive_run_primitive`, …) — a handful of
    tools that reach every app and primitive the kit allows, instead of thousands of schemas.

    <Note>
      `jsonSchema()` passes the schema through for the model; the SDK doesn't deep-validate
      optional fields the discover-then-run tools use. That's fine — Naive re-validates every call
      **server-side** against the Account Kit, so the model can't smuggle out-of-policy arguments
      past the agent.
    </Note>
  </Step>

  <Step title="Run the loop — and let it transact">
    Hand the adapted tools to `generateText` and set a `stopWhen` so the multi-step loop
    terminates. The SDK calls the model, runs the tool, feeds the result back, and repeats:

    ```ts theme={"theme":"css-variables"}
    import { generateText, stepCountIs } from "ai";
    import { openai } from "@ai-sdk/openai";

    const { text, steps } = await generateText({
      model: openai("gpt-5.1"), // adjust to a model you have access to
      tools: naiveToolsForAISDK(client.agentTools()),
      stopWhen: stepCountIs(10), // cap tool-call rounds — required for agentic loops
      system: "You are Alice's operations agent. Use Naive tools to act on her real account.",
      prompt:
        "Connect my GitHub, then issue a $50 virtual card called 'Ads budget' for our marketing spend.",
    });

    console.log(text);
    ```

    * The model discovers GitHub (`naive_connect_app`), returns a connect link for Alice to
      authorize, and attempts to issue the card (`naive_run_primitive` → `cards.create`).
    * The card is a **real** card on Alice's account, capped by her kit.
    * The whole agent loop is the AI SDK's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same `generateText` loop that would otherwise just
*describe* spending money now issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. You
get two complementary layers — pair them for defense in depth:

* **On the server (the real boundary)** — Naive freezes the action and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it,
  and is enforced server-side regardless of prompt or agent configuration.
* **In the loop (optional early interrupt)** — AI SDK **v7** supports tool approval at the
  `generateText` / `streamText` level via the `toolApproval` option, which pauses before a
  flagged tool runs so you can surface it in your UI. Treat this as a UX convenience; the
  enforcement that matters is Naive's server-side gate.

When a call reaches Naive, the tool result comes back as a pending approval rather than a
live card:

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

## Alternative: hand a scoped MCP session to the agent

If the agent runs somewhere you don't fully trust (an edge runtime, a third-party host),
don't ship it your API key. Mint a short-lived, per-user [MCP session](/docs/sdk/sessions) and
point an MCP client at its scoped SSE endpoint — the bearer lives only in the request
headers and expires. The AI SDK auto-discovers Naive's tools as MCP tools:

```ts theme={"theme":"css-variables"}
import { generateText, stepCountIs } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";

const session = await client.session({ ttlMs: 15 * 60 * 1000 });

const mcp = await createMCPClient({
  transport: {
    type: "sse",
    url: session.mcp.url,        // scoped, per-user endpoint
    headers: session.mcp.headers, // scoped bearer — never in the URL
  },
});

try {
  const { text } = await generateText({
    model: openai("gpt-5.1"),
    tools: await mcp.tools(),     // Naive's tools, discovered over MCP
    stopWhen: stepCountIs(10),
    prompt: "Issue a $50 virtual card called 'Ads budget'.",
  });
  console.log(text);
} finally {
  await mcp.close();
}
```

* Same Account Kit, same approval gates — just delivered as a remote MCP server instead of
  in-process tools.
* The session is scoped to one user and expires (default 15 min, max 24h); revoke early with
  `client.sessions.revoke(session.id)`.

## What stays enforced

No matter which path you choose, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your agent config:

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
* [Agent tools](/docs/sdk/agent-tools) — what `agentTools()` exposes and how `handle()` works
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [Sessions](/docs/sdk/sessions) — per-user MCP sessions for untrusted runtimes

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Hosted vs bring-your-own runtime](https://usenaive.ai/blog/hosted-vs-bring-your-own-runtime-for-ai-agents) — where the agent loop runs
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
