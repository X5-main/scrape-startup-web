> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# DSPy

> Give your DSPy agents a real-world account. DSPy compiles the program and runs the reasoning-and-acting loop — signatures, ReAct, and optimizers; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP toolset.

<Frame caption="DSPy programs the agent · Naive lets it transact">
  <img src="https://github.com/stanfordnlp.png" alt="DSPy (stanfordnlp)" width="96" />
</Frame>

<Note>
  DSPy is a project of Stanford NLP; names used for identification only, used here for identification and integration guidance only. No endorsement, partnership, or affiliation is implied.
</Note>

[DSPy](https://dspy.ai) (from **Stanford NLP**) is the framework for *programming — not
prompting — language models*: you declare typed [signatures](https://dspy.ai/learn/programming/signatures/),
compose [modules](https://dspy.ai/learn/programming/modules/), and let optimizers tune the prompts
and weights. Its [`dspy.ReAct`](https://dspy.ai/api/modules/ReAct/) module runs a full
reasoning-and-acting loop over a list of tools, and [`dspy.Tool.from_mcp_tool`](https://dspy.ai/tutorials/mcp/)
bridges any MCP server into that loop as native DSPy tools.

* **What DSPy ships** — typed [signatures](https://dspy.ai/learn/programming/signatures/) and
  [modules](https://dspy.ai/learn/programming/modules/), a provider-agnostic
  [`dspy.LM`](https://dspy.ai/learn/programming/language_models/) layer (OpenAI, Anthropic, local,
  … via LiteLLM), a [`dspy.ReAct`](https://dspy.ai/api/modules/ReAct/) agent that plans → calls a
  tool → observes → loops, [`dspy.Tool`](https://dspy.ai/api/primitives/Tool/) as the standard tool
  interface, and [`dspy.Tool.from_mcp_tool`](https://dspy.ai/tutorials/mcp/) to turn a remote MCP
  server into a discoverable toolset.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for a SaaS
  tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep DSPy's programming model and its optimizers; Naive gives each
agent a [tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do — enforced
**server-side**, with [human approval](/docs/getting-started/approvals) on the sensitive actions.

## How the pairing works

* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party toolset,
  already filtered by that user's Account Kit.
* You open the SSE session with the MCP Python SDK (`sse_client` → `ClientSession`), list its
  tools, and convert each one with `dspy.Tool.from_mcp_tool(session, tool)` — the scoped bearer
  rides in the request headers, never in the URL.
* `dspy.ReAct` runs the loop (the LM reasons → picks a Naive tool → observes the result → repeats);
  every call runs as that one user, gated on Naive's servers. Sensitive actions resolve to a
  `pending_approval` payload.

```
  DSPy (ReAct reasoning loop)              Naive
  ─────────────────────────────           ─────
  LM reasons
    │  tool call (naive_cards_create)
    ▼  dspy.Tool (async) → session.call_tool
  ClientSession ── sse_client ──────────────▶ /mcp/sse/sess_…   (per-user session)
    (Authorization: Bearer nv_sess_…)          │  AccountKit-gated, scoped to one user
                                               ▼
                                        connect GitHub · issue a $50 card · run a capability
                                               │
                                        sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `dspy` **3.2.1** (`dspy.LM`, `dspy.ReAct`, `dspy.Tool.from_mcp_tool`,
  `dspy.Signature`), the MCP Python SDK **1.28.1** (`mcp.client.sse.sse_client` +
  `mcp.ClientSession` — live-verified: passing Naive's session headers discovers and invokes Naive's
  tools; a wrong bearer fails MCP session initialization), and Naive **API v2** (hosted MCP server
  over SSE + per-user sessions), on **Python ≥ 3.10** (DSPy supports 3.10–3.14).

  Version assumptions: DSPy delegates the MCP transport to the official MCP SDK, so *DSPy never sees a
  raw URL or bearer* — you build the `sse_client(url, headers=...)` session and DSPy wraps its tools.
  MCP tools are **async**, so run the agent with `await agent.acall(...)` and keep the
  `ClientSession` open for the whole run (see the code below). Naive's session URL contains
  `/mcp/sse/…`, so use `sse_client` (the MCP SDK also ships `streamablehttp_client` for
  Streamable-HTTP servers). There is no Python Naive SDK yet, so the control plane (Account Kit, user,
  session) is shown over the REST API; you can equally provision from the
  [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node SDK. A Naive session is
  short-lived (default 15 min, max 24h) — see [rotation](#alternative-one-agent-per-tenant) below. Pin
  your versions and set the model to a provider you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `OPENAI_API_KEY` (or any other DSPy/LiteLLM provider — Anthropic, local models) for the model
  that runs the agent.
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install dspy mcp httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to a DSPy agent that can actually transact: define a policy and provision a user
(Naive control plane, once), then mint a per-user MCP session, convert its tools with
`dspy.Tool.from_mcp_tool`, and hand them to a `dspy.ReAct` agent.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant user
    gets a card (capped at \$500, approval required), the vault, and an allowlist of apps. Everything the
    agent does is bounded by this kit — server-side. These are one-time control-plane calls:

    ```bash theme={"theme":"css-variables"}
    # Control plane: a reusable policy template.
    curl -X POST https://api.usenaive.ai/v1/account-kits \
      -H "Authorization: Bearer $NAIVE_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Pro",
        "primitives_config": {
          "cards": { "enabled": true, "requiresApproval": true, "defaults": { "spending_limit_cents": 50000 } },
          "vault": { "enabled": true }
        },
        "connections_config": { "mode": "allowlist", "toolkits": ["github", "gmail", "stripe"] }
      }'
    # → { "id": "<kit_id>", ... }

    # Provision one of your end-users and assign the kit.
    curl -X POST https://api.usenaive.ai/v1/users \
      -H "Authorization: Bearer $NAIVE_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{ "external_id": "user_123", "email": "alice@acme.com", "account_kit_id": "<kit_id>" }'
    # → { "id": "<user_id>", ... }
    ```
  </Step>

  <Step title="Mint a per-user MCP session">
    At runtime, mint a [session](/docs/architecture/sessions) for the user. It returns the scoped SSE
    endpoint and a bearer that lives in the headers — never in the URL:

    ```python theme={"theme":"css-variables"}
    import os
    import httpx

    NAIVE_API = "https://api.usenaive.ai"
    AUTH = {"Authorization": f"Bearer {os.environ['NAIVE_API_KEY']}"}

    ALICE_USER_ID = "<user_id>"  # from the control-plane step

    def mint_session(user_id: str, ttl_ms: int = 15 * 60 * 1000) -> dict:
        r = httpx.post(
            f"{NAIVE_API}/v1/users/{user_id}/sessions",
            headers=AUTH,
            json={"ttl_ms": ttl_ms},
        )
        r.raise_for_status()
        return r.json()  # { id, expires_at, mcp: { url, headers, expires_at } }
    ```
  </Step>

  <Step title="Convert Naive's tools and build the ReAct agent">
    Open the session's scoped SSE endpoint with the MCP SDK, passing Naive's session headers straight
    through. List the tools, convert each with `dspy.Tool.from_mcp_tool`, and hand them to `dspy.ReAct`.
    Because the tools hold a live MCP session, **run the agent inside the session context** with
    `await agent.acall(...)`:

    ```python theme={"theme":"css-variables"}
    import asyncio
    import dspy
    from mcp import ClientSession
    from mcp.client.sse import sse_client

    dspy.configure(lm=dspy.LM("openai/gpt-4o-mini"))  # a model you have access to

    class OpsAgent(dspy.Signature):
        """Act on the user's real Naive account to fulfill the request."""
        request: str = dspy.InputField()
        summary: str = dspy.OutputField(desc="what you did, including any pending approvals")

    async def main() -> None:
        mcp = mint_session(ALICE_USER_ID)["mcp"]

        # Naive is SSE; the scoped bearer rides in the Authorization header, never in the URL.
        async with sse_client(url=mcp["url"], headers=mcp["headers"]) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                listed = await session.list_tools()
                # Discovered + filtered by Alice's Account Kit.
                naive_tools = [dspy.Tool.from_mcp_tool(session, t) for t in listed.tools]

                agent = dspy.ReAct(OpsAgent, tools=naive_tools)
                result = await agent.acall(
                    request="Connect my GitHub, then issue a $50 virtual card called 'Ads budget' for marketing spend."
                )
                print(result.summary)

    asyncio.run(main())
    ```

    The agent discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on Alice's
    account, capped by her kit. The reasoning loop and the optimizers are DSPy's; the real-world actions
    are Naive's.
  </Step>
</Steps>

That's the moat: the same `dspy.ReAct` loop that would otherwise just *reason about* spending money
now issues a policy-bounded card on a specific user's account.

<Note>
  MCP tools are async-only (the underlying `ClientSession` runs on `anyio` task groups), so use
  `agent.acall(...)` rather than the synchronous `agent(...)`. Keep the `sse_client` /
  `ClientSession` context open for the whole run — the tools call back into it on every step.
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. You get two
complementary layers — pair them for defense in depth:

* **In the loop (optional early interrupt)** — since a `dspy.Tool` is just a wrapper around a
  callable, wrap a sensitive tool's `func` in a confirmation gate so a human can approve or reject
  the call *before* it leaves your process. Treat this as a UX convenience.
* **On the server (the real boundary)** — Naive freezes the action and returns a pending approval
  (HTTP `202`) instead of a live card. This holds no matter what runtime calls it, and can't be
  bypassed from the prompt or the agent config.

```python theme={"theme":"css-variables"}
GATED = {"naive_cards_create"}

def gate(tool: dspy.Tool, confirm) -> dspy.Tool:
    """Wrap a dspy.Tool so a human confirms before it runs. Schema is preserved."""
    inner = tool.func

    async def guarded(*args, **kwargs):
        if not await confirm(tool.name, kwargs):
            return {"status": "rejected_by_human", "tool": tool.name}
        return await inner(*args, **kwargs)

    return dspy.Tool(
        func=guarded,
        name=tool.name,
        desc=tool.desc,
        args=tool.args,
        arg_types=tool.arg_types,
        arg_desc=tool.arg_desc,
    )

# ...inside the ClientSession block, before building the agent:
naive_tools = [
    gate(t, confirm) if t.name in GATED else t
    for t in (dspy.Tool.from_mcp_tool(session, x) for x in listed.tools)
]
```

<Info>
  DSPy's [callbacks](https://dspy.ai/api/primitives/Tool/) (`on_tool_start` / `on_tool_end`) are
  observational — they can log a tool call but not block it. To *reject* a call in-loop, wrap the
  tool's `func` as above. Either way, the real enforcement is Naive's server-side approval gate below,
  which can't be bypassed from the agent config, the tool list, or the wrapper.
</Info>

Independently, when a call reaches Naive, the tool result comes back as a pending approval rather
than a live card — regardless of what the client did:

```json theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval_id": "65589c8b-e033-4a65-b16c-379211c94429",
  "action_type": "cards.create",
  "primitive": "cards",
  "title": "Issue virtual card \"Ads budget\""
}
```

Your app resolves it out of band — and on approval, Naive **replays the frozen action**
server-side:

```python theme={"theme":"css-variables"}
def list_pending(user_id: str) -> list[dict]:
    r = httpx.get(
        f"{NAIVE_API}/v1/users/{user_id}/approvals",
        headers=AUTH,
        params={"status": "pending"},
    )
    r.raise_for_status()
    return r.json()["approvals"]

def approve(user_id: str, approval_id: str) -> dict:
    r = httpx.post(
        f"{NAIVE_API}/v1/users/{user_id}/approvals/{approval_id}/approve",
        headers=AUTH,
    )
    r.raise_for_status()
    return r.json()

# Find what the agent queued for Alice, then approve (or deny) it.
for a in list_pending(ALICE_USER_ID):
    # ...show a["title"] / a["action_type"] to a human in your UI...
    approve(ALICE_USER_ID, a["id"])  # API replays cards.create → real card
```

See [Approvals](/docs/getting-started/approvals) for the full lifecycle (`pending → executed /
failed / denied`) and the deny endpoint.

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human acting
  in your dashboard, and agent calls on the operator's own default user, bypass the gate — so
  end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent per tenant

Serving every tenant is one function: mint a fresh, per-user session and build the tools +
`dspy.ReAct` bound to it inside the session context. A plain comprehension narrows a user's toolset
to exactly the primitives you want that agent to touch — a second layer on top of the Account Kit:

```python theme={"theme":"css-variables"}
async def handle(user_id: str, request: str) -> str:
    mcp = mint_session(user_id)["mcp"]  # fresh, per-user session

    async with sse_client(url=mcp["url"], headers=mcp["headers"]) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            listed = await session.list_tools()

            # Optional: only expose a subset of Naive's tools to this agent.
            allowed = {"naive_connections_connect", "naive_cards_create"}
            naive_tools = [
                dspy.Tool.from_mcp_tool(session, t)
                for t in listed.tools
                if t.name in allowed
            ]

            agent = dspy.ReAct(OpsAgent, tools=naive_tools)
            result = await agent.acall(request=request)
            return result.summary

# Same agent definition, different tenant — isolated identity, spend, and approvals each time.
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the session,
that user's Account Kit, and any name filter — enforced on Naive's servers. Because sessions expire
(default 15 min, max 24h), mint a fresh one per run (or on expiry). Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  **Optimizing the agent?** DSPy's optimizers (`dspy.GEPA`, `dspy.MIPROv2`, …) tune your program's
  prompts against a metric — they don't change the tool boundary. Compile against a Naive session
  scoped to a test user (or the operator's default user, which bypasses approvals), and the compiled
  program stays bound to whatever per-user session you hand it at runtime.
</Info>

## What stays enforced

No matter how the agent is wired, the policy is enforced where it matters — on Naive's servers, not
in your prompt or your agent config:

* **Identity** — every action runs as a specific [tenant user](/docs/getting-started/users), fully
  isolated from your other users.
* **Capability bounds** — the [Account Kit](/docs/architecture/account-kits) decides which primitives
  and which apps the agent can touch (`allowlist` / `blocklist` / per-tool).
* **Scoped spend** — virtual cards are capped per card and per user; the model can't raise its own
  limit.
* **Human-in-the-loop** — sensitive actions ([cards](/docs/getting-started/cards),
  [domains](/docs/getting-started/domains), [KYC](/docs/getting-started/verification),
  [formation](/docs/getting-started/formation), connecting an app) freeze as
  [approvals](/docs/getting-started/approvals) until a human says yes.
* **Scoped, expiring access** — the agent holds a per-user session bearer, not your API key; it
  expires (default 15 min) and you can `DELETE /v1/users/:user_id/sessions/:id` to revoke it early.

## Next steps

* [MCP server](/docs/mcp/overview) — the hosted SSE server and its full [tool list](/docs/mcp/tools)
* [Sessions](/docs/architecture/sessions) — per-user MCP sessions, TTL, and revocation
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [Pydantic AI](/docs/integrations/pydantic-ai) · [LlamaIndex](/docs/integrations/llamaindex) · [Agno](/docs/integrations/agno) · [smolagents](/docs/integrations/smolagents) ·  · [Letta](/docs/integrations/letta) — the same MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
