> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Agents SDK

> Give your OpenAI Agents SDK agents a real-world account. The SDK runs the agent loop, handoffs, and guardrails; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend.

The [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) is OpenAI's
lightweight framework for building agents in TypeScript and Python. It ships the parts that
*run* an agent:

* **The agent loop** — call the model, run tools, feed results back, repeat until done.
* **Handoffs** — route a task to a specialized agent (triage → spend → reporting).
* **Guardrails** — validate inputs/outputs and bail early on policy violations.
* **Sessions, tracing, and human-in-the-loop** — pause a run for approval and resume it.

What it doesn't ship is a way for those agents to **act as a real account** — sign up for a
SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep the SDK's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* Naive's SDK exposes a small, drop-in toolset via `agentTools()` — a **discover-then-run**
  meta-toolset (search apps/primitives, then run them) instead of thousands of schemas.
* Each Naive tool ships an Anthropic-style `input_schema` (plain JSON Schema), and the
  OpenAI Agents SDK's `tool()` helper accepts a **raw JSON schema** directly — so the
  adapter is a few lines.
* Every call stays gated by the user's Account Kit on Naive's servers; sensitive actions
  resolve to a `pending_approval` payload.

```
  OpenAI Agents SDK (run)               Naive
  ─────────────────────                 ─────
  agent ── tool call ──▶ loop
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
  **Tested against:** `@usenaive-sdk/server` **0.7.x** (Naive API v2), `@openai/agents` **0.11.x**
  (`Agent`, `run`, `tool`, `MCPServerSSE`), on **Node ≥ 20**.

  `tool()` accepts a raw JSON schema for `parameters`; this guide passes Naive's
  `input_schema` through directly and sets `strict: false`, because the discover-then-run
  tools use optional fields that aren't strict-mode JSON Schema. Naive re-validates every
  call **server-side** regardless. For the MCP extension this guide uses `MCPServerSSE`
  (Naive's hosted MCP server speaks **SSE**). Pin your versions and set `model` to a model you
  have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `OPENAI_API_KEY` for the model that runs the agent (the SDK reads it by default).
* Node ≥ 20.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/server @openai/agents
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to an OpenAI Agents SDK agent that can actually transact: define a policy,
provision a user, adapt Naive's tools, and run the agent.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the agent does is bounded by this kit — server-side.

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

  <Step title="Adapt Naive's tools into OpenAI Agents tools">
    `client.agentTools()` returns tools as JSON-schema definitions plus a `handle(name, input)`
    dispatcher. The SDK's `tool()` takes a raw JSON schema in `parameters`, so the adapter maps
    each Naive tool's `input_schema` and routes the executor through `handle`:

    ```ts theme={"theme":"css-variables"}
    import { tool } from "@openai/agents";
    import type { NaiveAgentToolset } from "@usenaive-sdk/server";

    function naiveToolsForOpenAI(kit: NaiveAgentToolset) {
      return kit.tools.map((t) =>
        tool({
          name: t.name,
          description: t.description,
          parameters: t.input_schema, // Anthropic-style JSON Schema — passed through as-is
          strict: false,              // discover-then-run tools use optional fields
          execute: (input) => kit.handle(t.name, input as Record<string, unknown>),
        }),
      );
    }
    ```

    This yields the discover-then-run meta-tools (`naive_search_apps`, `naive_connect_app`,
    `naive_run_capability`, `naive_search_primitives`, `naive_run_primitive`, …) — a handful of
    tools that reach every app and primitive the kit allows, instead of thousands of schemas.

    <Note>
      With `strict: false` the SDK passes arguments through without local schema validation, but
      Naive re-validates every call **server-side** against the Account Kit — so the model can't
      smuggle out-of-policy arguments past the agent.
    </Note>
  </Step>

  <Step title="Build the agent — and let it transact">
    Hand the adapted tools to an `Agent`, then `run` it. The SDK runs the multi-step loop for
    you (call tool → feed result back → continue):

    ```ts theme={"theme":"css-variables"}
    import { Agent, run } from "@openai/agents";

    const agent = new Agent({
      name: "Ops Agent",
      model: "gpt-5.1",
      instructions:
        "You are Alice's operations agent. Use Naive tools to act on her real account.",
      tools: naiveToolsForOpenAI(client.agentTools()),
    });

    const result = await run(
      agent,
      "Connect my GitHub, then issue a $50 virtual card called 'Ads budget' for our marketing spend.",
    );

    console.log(result.finalOutput);
    ```

    * The model discovers GitHub (`naive_connect_app`), returns a connect link for Alice to
      authorize, and attempts to issue the card (`naive_run_primitive` → `cards.create`).
    * The card is a **real** card on Alice's account, capped by her kit.
    * The whole agent loop is the SDK's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same `Agent` that would otherwise just *describe* spending
money now issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. Pair
the SDK's native approval flow with Naive's server-side gate for defense in depth:

* **In the run** — mark the spend tool `needsApproval`. The SDK pauses the run and returns
  `interruptions` before that tool executes, so you surface the call for review.
* **On the server** — even if a call gets through, Naive freezes it and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it.

Gate the primitive-runner tool so the run pauses before it fires:

```ts theme={"theme":"css-variables"}
function naiveToolsForOpenAI(kit: NaiveAgentToolset) {
  return kit.tools.map((t) =>
    tool({
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
      strict: false,
      // Pause the run before Naive's primitive-runner (cards, domains, KYC, …) executes.
      needsApproval: t.name === "naive_run_primitive",
      execute: (input) => kit.handle(t.name, input as Record<string, unknown>),
    }),
  );
}
```

Resolve interruptions out of band, then resume the run from the same state:

```ts theme={"theme":"css-variables"}
import { run } from "@openai/agents";

let result = await run(agent, "Issue a $50 virtual card called 'Ads budget'.");

while (result.interruptions?.length) {
  for (const interruption of result.interruptions) {
    // ...show interruption.name / interruption.arguments to a human in your UI...
    result.state.approve(interruption); // or: result.state.reject(interruption)
  }
  result = await run(agent, result.state); // resume from the paused snapshot
}

console.log(result.finalOutput);
```

When a call does reach Naive, the tool result comes back as a pending approval rather than a
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
point an `MCPServerSSE` at it — the bearer lives only in the request headers and expires.
The SDK auto-discovers Naive's tools as MCP tools:

```ts theme={"theme":"css-variables"}
import { Agent, run, MCPServerSSE } from "@openai/agents";

const session = await client.session({ ttlMs: 15 * 60 * 1000 });

const naiveMcp = new MCPServerSSE({
  name: "naive",
  url: session.mcp.url,                          // scoped, per-user endpoint
  cacheToolsList: true,
  requestInit: { headers: session.mcp.headers }, // scoped bearer — never in the URL
});

const agent = new Agent({
  name: "Ops Agent",
  model: "gpt-5.1",
  instructions: "Use the Naive tools to act on Alice's real account.",
  mcpServers: [naiveMcp],
});

try {
  await naiveMcp.connect();
  const result = await run(agent, "Issue a $50 virtual card called 'Ads budget'.");
  console.log(result.finalOutput);
} finally {
  await naiveMcp.close();
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
