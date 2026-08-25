> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# LangGraph

> Give your LangGraph agents a real-world account. LangGraph runs the stateful graph; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend.

[LangGraph](https://langchain-ai.github.io/langgraphjs/) is the orchestration layer of the
LangChain stack: a stateful graph runtime for agents and multi-step workflows. In
LangChain v1 you build one with `createAgent` (the ReAct prebuilt, running on LangGraph) —
it runs the model, calls your tools, persists state, and loops until the job is done.

What LangGraph doesn't ship is a way for those agents to **act as a real account** — sign
up for a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep LangGraph's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

The Naive SDK exposes a small, drop-in toolset via `agentTools()`. Instead of dumping
thousands of schemas on the model, it's a **discover-then-run** meta-toolset (search
apps/primitives, then run them). Each Naive tool ships an Anthropic-style `input_schema`
(plain JSON Schema), which LangChain's `tool()` accepts directly — so the adapter is a few
lines, and every call stays gated by the user's Account Kit:

```
  LangGraph (createAgent)               Naive
  ─────────────────────                 ─────
  model node ── tool node ──▶ loop
        │  model picks a tool
        ▼
  tool.invoke(input)  ──────────▶  kit.handle(name, input)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect Gmail · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `@usenaive-sdk/server` (Naive API v2), **LangChain v1** — `langchain`
  **1.x** (`createAgent`, `humanInTheLoopMiddleware`), `@langchain/core` **1.x** (`tool`),
  `@langchain/langgraph` **1.x** (runtime), `@langchain/anthropic` **1.x**
  (`ChatAnthropic`), and `@langchain/mcp-adapters` **1.1.x** (`MultiServerMCPClient`, for the
  MCP extension), on **Node ≥ 20**.

  Passing a raw JSON Schema to `tool()` (instead of Zod) is supported on current
  `@langchain/core` 1.x. On **pre-v1** LangGraph (`@langchain/langgraph` 0.x),
  swap `createAgent` from `langchain` for `createReactAgent` from
  `@langchain/langgraph/prebuilt` (use `llm:` instead of `model:` and `prompt:` instead of
  `systemPrompt:`). Pin your versions and adjust the model id to a provider/model you have
  access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A model provider key for whichever model runs the graph (this guide uses Anthropic via
  `ANTHROPIC_API_KEY`).
* Node ≥ 20.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/server langchain @langchain/core @langchain/langgraph @langchain/anthropic
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Minimal viable integration

The shortest path to a LangGraph agent that can actually transact: define a policy,
provision a user, adapt Naive's tools, and run the graph.

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

  <Step title="Adapt Naive's tools into LangChain tools">
    `client.agentTools()` returns tools as JSON-schema definitions plus a `handle(name, input)`
    dispatcher. LangChain's `tool()` accepts a JSON Schema directly in its `schema` field, so
    the adapter just maps each Naive tool's `input_schema` and routes the executor through
    `handle`:

    ```ts theme={"theme":"css-variables"}
    import { tool } from "@langchain/core/tools";
    import type { NaiveAgentToolset } from "@usenaive-sdk/server";

    function naiveToolsForLangChain(kit: NaiveAgentToolset) {
      return kit.tools.map((t) =>
        tool((input: Record<string, unknown>) => kit.handle(t.name, input), {
          name: t.name,
          description: t.description,
          schema: t.input_schema, // Anthropic-style JSON Schema — accepted as-is
        }),
      );
    }
    ```

    This yields the discover-then-run meta-tools (`naive_search_apps`, `naive_connect_app`,
    `naive_run_capability`, `naive_search_primitives`, `naive_run_primitive`, …) — a handful of
    tools that reach every app and primitive the kit allows, instead of thousands of schemas.

    <Note>
      LangChain doesn't runtime-validate JSON-Schema tool inputs (only Zod schemas are
      validated), but Naive re-validates every call **server-side** against the Account Kit, so
      the model can't smuggle out-of-policy arguments past the graph.
    </Note>
  </Step>

  <Step title="Build the graph — and let it transact">
    Hand the adapted tools to `createAgent`. It compiles a LangGraph ReAct graph (model node →
    tool node → loop) and runs the multi-step loop for you (call tool → feed result back →
    continue):

    ```ts theme={"theme":"css-variables"}
    import { createAgent } from "langchain";
    import { ChatAnthropic } from "@langchain/anthropic";

    const agent = createAgent({
      model: new ChatAnthropic({ model: "claude-sonnet-4-5" }),
      tools: naiveToolsForLangChain(client.agentTools()),
      systemPrompt:
        "You are Alice's operations agent. Use Naive tools to act on her real account.",
    });

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content:
            "Connect my GitHub, then issue a $50 virtual card called 'Ads budget' for our marketing spend.",
        },
      ],
    });

    console.log(result.messages.at(-1)?.content);
    ```

    The model discovers GitHub, returns a connect link for Alice to authorize, and attempts to
    issue the card — a **real** card on Alice's account, capped by her kit. The whole graph is
    LangGraph's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same `createAgent` graph that would otherwise just
*describe* spending money now issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend.
You get two complementary layers — pair them for defense in depth:

* **In the graph** — LangChain's `humanInTheLoopMiddleware` interrupts before a sensitive
  tool runs, so the graph pauses and surfaces the call for review.
* **On the server** — even if a call gets through, Naive freezes it and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it.

Pause the graph before the card-issuing tool fires:

```ts theme={"theme":"css-variables"}
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { ChatAnthropic } from "@langchain/anthropic";

const agent = createAgent({
  model: new ChatAnthropic({ model: "claude-sonnet-4-5" }),
  tools: naiveToolsForLangChain(client.agentTools()),
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        // Naive's primitive-runner tool — gate it for human review.
        naive_run_primitive: { allowedDecisions: ["approve", "edit", "reject"] },
      },
    }),
  ],
});
```

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

## Alternative: hand a scoped MCP session to the graph

If the agent runs somewhere you don't fully trust (an edge runtime, a third-party host),
don't ship it your API key. Mint a short-lived, per-user [MCP session](/docs/sdk/sessions) and
connect to it with `@langchain/mcp-adapters` — the bearer lives only in the session headers
and expires. `getTools()` auto-discovers Naive's tools as LangChain tools:

```bash theme={"theme":"css-variables"}
npm install @langchain/mcp-adapters
```

```ts theme={"theme":"css-variables"}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";
import { ChatAnthropic } from "@langchain/anthropic";

const session = await client.session({ ttlMs: 15 * 60 * 1000 });

const mcp = new MultiServerMCPClient({
  mcpServers: {
    naive: {
      transport: "sse",            // Naive's hosted MCP server uses SSE
      url: session.mcp.url,         // scoped, per-user endpoint
      headers: session.mcp.headers, // scoped bearer — never in the URL
    },
  },
});

try {
  const agent = createAgent({
    model: new ChatAnthropic({ model: "claude-sonnet-4-5" }),
    tools: await mcp.getTools(),   // MCP tools → LangChain tools, auto-discovered
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Issue a $50 virtual card called 'Ads budget'." }],
  });
  console.log(result.messages.at(-1)?.content);
} finally {
  await mcp.close();
}
```

Same Account Kit, same approval gates — just delivered as a remote MCP server instead of
in-process tools. The session is scoped to one user and expires (default 15 min, max 24h);
revoke early with `client.sessions.revoke(session.id)`.

## What stays enforced

No matter which path you choose, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your graph:

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
* [Vercel AI SDK](/docs/integrations/vercel-ai-sdk) — the same pairing, AI SDK flavor

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Hosted vs bring-your-own runtime](https://usenaive.ai/blog/hosted-vs-bring-your-own-runtime-for-ai-agents) — where the agent loop runs
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
