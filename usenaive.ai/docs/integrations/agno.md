> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agno

> Give your Agno agents a real-world account. Agno runs the agent, the reasoning, the tool-calling loop, and multi-agent teams; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP toolset.

<Frame caption="Agno orchestrates the agent · Naive lets it transact">
  <img src="https://github.com/agno-agi.png" alt="Agno" width="96" />
</Frame>

<Note>
  Agno is a trademark of its respective owner, used here for identification and integration guidance only. No endorsement, partnership, or affiliation is implied.
</Note>

[Agno](https://docs.agno.com) is a high-performance, Python-native framework for building
agents, teams, and agentic workflows. You give an `Agent` a model and a list of **tools**;
Agno runs the reasoning and tool-calling loop, and — with `Team` — coordinates several agents
that hand work off to each other. It has **first-class MCP client support** via `MCPTools` /
`MultiMCPTools`.

* **What Agno ships** — an `Agent`/`Team`/`Workflow` runtime, model-agnostic providers,
  100+ pre-built toolkits, memory and knowledge, and MCP tools over `stdio`,
  `streamable-http`, and `sse` — including per-run **dynamic headers** via `header_provider`.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for
  a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep Agno's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the sensitive
actions.

## How the pairing works

* Agno turns any MCP server into a set of tools: point `MCPTools` at the server URL,
  add it to an `Agent`'s `tools`, and each MCP tool becomes a function the model can call —
  no manual schema wiring.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Each session is one URL + one bearer scoped to one user. Build `MCPTools` from it, hand it
  to an `Agent`, and every tool call runs as that user — gated server-side.

```
  Agno (agent.arun)                      Naive
  ─────────────────                      ─────
  Agent ─────────── tool call ──────────▶ loop
    │  model picks an MCP tool
    ▼
  MCPTools (SSE + scoped bearer) ───────▶  /mcp/sse/sess_…   (per-user session)
                                            │  AccountKit-gated, scoped to one user
                                            ▼
                                      connect GitHub · issue a $50 card · run a capability
                                            │
                                      sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `agno` **2.6.x** (`agno.agent.Agent`, `agno.tools.mcp.MCPTools` /
  `SSEClientParams`, `agno.models.openai.OpenAIChat`), the `mcp` Python package **1.x** (SSE
  transport), and Naive **API v2** (hosted MCP server over SSE + per-user sessions), on
  **Python ≥ 3.10**.

  Naive's session URL contains `/mcp/sse/…`, so initialize `MCPTools` with `transport="sse"`.
  Agno now recommends `streamable-http` for new MCP servers, but it fully supports SSE — use SSE
  to match Naive's endpoint. The scoped bearer rides in the connection **headers**
  (via `SSEClientParams` or a `header_provider`), never in the URL. There is no Python Naive SDK
  yet, so the control plane (Account Kit, user, session) is shown over the REST API; you can
  equally provision from the [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node
  SDK. Pin your versions and set the model to one you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `OPENAI_API_KEY` for the model that runs the agent (or swap in any other Agno model
  provider, e.g. `agno.models.anthropic.Claude`).
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install -U agno httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to an Agno agent that can actually transact: define a policy and provision a
user (control plane, once), then at runtime mint a per-user MCP session and hand it to an
`Agent`.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the agent does is bounded by this kit — server-side. These are one-time
    control-plane calls:

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
    At runtime, mint a short-lived [session](/docs/architecture/sessions) for the user. It returns the
    scoped SSE endpoint and a bearer that lives in the headers — never in the URL — and expires
    (default 15 min, max 24h):

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

  <Step title="Build the agent — and let it transact">
    Point Agno's `MCPTools` at the session's scoped SSE endpoint, pass it to an `Agent`, and call
    `arun`. Agno discovers Naive's tools, exposes them to the model, and runs the tool-calling loop
    for you (call tool → feed result back → continue). Keep the connection open for the duration of
    the run — the async context manager handles connect/close:

    ```python theme={"theme":"css-variables"}
    import asyncio
    from agno.agent import Agent
    from agno.models.openai import OpenAIChat
    from agno.tools.mcp import MCPTools, SSEClientParams


    async def main():
        session = mint_session(ALICE_USER_ID)

        # Scoped bearer rides in headers — never in the URL.
        server_params = SSEClientParams(
            url=session["mcp"]["url"],
            headers=session["mcp"]["headers"],
        )

        async with MCPTools(server_params=server_params, transport="sse") as naive:
            agent = Agent(
                model=OpenAIChat(id="gpt-5.1"),
                name="ops_agent",
                instructions=(
                    "You are Alice's operations agent. Use the Naive tools to act on her "
                    "real account. Report the GitHub connect link and the card's status."
                ),
                tools=[naive],  # Naive's per-user toolset
                markdown=True,
            )

            result = await agent.arun(
                "Connect my GitHub, then issue a $50 virtual card called "
                "'Ads budget' for our marketing spend."
            )
            print(result.content)


    asyncio.run(main())
    ```

    The model discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on Alice's
    account, capped by her kit. The whole agent loop is Agno's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same Agno agent that would otherwise just *describe*
spending money now issues a policy-bounded card on a specific user's account.

<Note>
  The session's tool list is already filtered by Alice's kit — the agent never sees a tool the
  policy forbids. To narrow further per agent, mint a session against a tighter kit, or pass
  `include_tools=[...]` / `exclude_tools=[...]` to `MCPTools` to expose only a subset (e.g.
  `include_tools=["naive_connections_connect", "naive_cards_create"]`).
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. When
the model calls the card-issuing tool, Naive freezes the request and the tool result comes
back as a pending approval (HTTP `202`) instead of a live card:

```json theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval_id": "65589c8b-e033-4a65-b16c-379211c94429",
  "action_type": "cards.create",
  "primitive": "cards",
  "title": "Issue virtual card \"Ads budget\""
}
```

The agent relays the pending status instead of claiming success. Your app then resolves it
out of band — and on approval, Naive **replays the frozen action** server-side:

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
  Want a UX gate *inside* the run too? Agno supports
  [human-in-the-loop confirmation for MCP tools](https://docs.agno.com/examples/agents/human-in-the-loop/confirmation-required-mcp-toolkit)
  that pauses a tool call until you confirm. That shapes the conversation; the real enforcement
  is Naive's server-side approval gate above, which can't be bypassed from the prompt or the
  agent config.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent definition, every tenant

A Naive session is scoped to one user, so to serve every tenant from the **same** agent
definition, mint a fresh session per request and build `MCPTools` from it. The instructions,
model, and tools stay the same — only which user's session backs the toolset changes, and
every call is Account-Kit-gated server-side:

```python theme={"theme":"css-variables"}
async def run_for_user(user_id: str, task: str) -> str:
    session = mint_session(user_id)  # fresh, per-user session

    server_params = SSEClientParams(
        url=session["mcp"]["url"],
        headers=session["mcp"]["headers"],
    )

    async with MCPTools(server_params=server_params, transport="sse") as naive:
        agent = Agent(
            model=OpenAIChat(id="gpt-5.1"),
            name="ops_agent",
            instructions="Use the Naive tools to act on this user's real account.",
            tools=[naive],
        )
        result = await agent.arun(task)
        return result.content

# Same agent code, different tenant — isolated identity, spend, and approvals each time.
# await run_for_user("<user_id>", "Connect GitHub and set up a $50 ads card.")
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the
session and that user's Account Kit, enforced on Naive's servers. Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  Because it's Agno, you can also compose this into a [`Team`](https://docs.agno.com/teams/overview):
  keep a coordinator agent for planning and give a single **operator** member the Naive
  `MCPTools`. The team reasons and delegates; only the operator can touch the real account, and
  every action it takes is still bounded by the per-user session and Account Kit.
</Info>

## What stays enforced

No matter how the agent is wired, the policy is enforced where it matters — on Naive's
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
* **Scoped, expiring access** — the agent holds a per-user session bearer, not your API key;
  it expires (default 15 min) and you can `DELETE /v1/users/:user_id/sessions/:id` to revoke
  it early.

## Next steps

* [MCP server](/docs/mcp/overview) — the hosted SSE server and its full [tool list](/docs/mcp/tools)
* [Sessions](/docs/architecture/sessions) — per-user MCP sessions, TTL, and revocation
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [Pydantic AI](/docs/integrations/pydantic-ai) · [LlamaIndex](/docs/integrations/llamaindex) — the same
  MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
