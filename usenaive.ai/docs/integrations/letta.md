> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Letta

> Give your Letta agents a real-world account. Letta runs the loop — a stateful, memory-native agent that persists across sessions, with server-side MCP tools and tool-call approval rules; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP server.

<Frame caption="Letta remembers the agent · Naive lets it transact">
  <img src="https://github.com/letta-ai.png" alt="Letta" width="96" />
</Frame>

<Note>
  Letta is a trademark of its respective owner, used here for identification and integration guidance only. No endorsement, partnership, or affiliation is implied.
</Note>

[Letta](https://www.letta.com/) (the team behind **MemGPT**) is an open-source platform for
**stateful agents** — agents that persist their own memory across sessions instead of starting
cold every request. You give an agent memory blocks and tools; the Letta server runs the loop,
manages the context window, and keeps the agent alive between calls. It has **first-class MCP
support**: register a remote MCP server once, and every tool it exposes becomes attachable to
any agent — with tool-call **approval rules** for human-in-the-loop.

* **What Letta ships** — a persistent, memory-native agent runtime (Letta Cloud or self-hosted),
  the agent loop and context management, MCP server registration over `streamable-http`, `sse`,
  and `stdio` (with **auth headers** on remote servers), per-tool approval rules, agent-scoped
  variables, and a Python/TypeScript SDK.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for a
  SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep Letta's stateful orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the sensitive
actions. A Letta agent that remembers a user forever now also has that user's real,
governed account to act on.

## How the pairing works

* Letta registers an MCP server **once** on the Letta server, discovers its tools, and lets you
  attach those tools to any agent by id. Tool execution is forwarded server-side to the MCP
  server — the agent never holds the credentials.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Register a Naive session as an MCP server, attach its tools to a Letta agent, and every tool
  call runs as that one user — gated server-side. Because Letta agents are persistent and
  per-user, one Letta agent maps cleanly to one Naive user.

```
  Letta (stateful agent loop)              Naive
  ─────────────────────────                ─────
  memory blocks + model plans
    │  tool call (naive_cards_create)
    ▼  requires_approval rule? → pause for human
  Letta server ── forwards ───────────────▶ /mcp/sse/sess_…   (per-user session)
    (auth_header + bearer)                    │  AccountKit-gated, scoped to one user
                                              ▼
                                        connect GitHub · issue a $50 card · run a capability
                                              │
                                        sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `letta-client` **1.12.1** (Python — `Letta`, `client.mcp_servers.create`,
  `client.mcp_servers.tools.list`, `client.agents.create`, `client.agents.messages.create`,
  `RequiresApprovalToolRule`), against **Letta Cloud** or a current self-hosted Letta server, and
  Naive **API v2** (hosted MCP server over SSE + per-user sessions), on **Python ≥ 3.10**. A matching
  TypeScript SDK (`@letta-ai/letta-client`) mirrors this surface (`client.mcpServers.create`,
  `client.agents.create`).

  Naive's session URL contains `/mcp/sse/…`, so register the MCP server with
  `mcp_server_type: "sse"`. Letta marks SSE as a legacy transport in favor of `streamable-http`,
  but it's still fully supported — use it to match Naive's endpoint. The scoped bearer rides in the
  `auth_header` / `auth_token` fields (the `Authorization` header), never in the URL. There is no
  Python Naive SDK yet, so the control plane (Account Kit, user, session) is shown over the REST
  API; you can equally provision from the [dashboard](https://dashboard.usenaive.ai), the CLI, or
  the Node SDK. A Naive session is short-lived (default 15 min, max 24h) while a Letta MCP
  registration is persistent — see [rotation](#alternative-one-agent-per-tenant) below. Pin your
  versions and set the model to a handle you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A Letta server: a [Letta Cloud](https://www.letta.com/) API key (`LETTA_API_KEY`) **or** a
  self-hosted server (`docker run ... letta/letta`, reachable at `http://localhost:8283`).
* Model + embedding access configured on that server (OpenAI, Anthropic, …).
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install letta-client httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export LETTA_API_KEY=sk-let-...        # Letta Cloud; omit if self-hosting
```

## Minimal viable integration

The shortest path to a Letta agent that can actually transact: define a policy and provision a
user (Naive control plane, once), then mint a per-user MCP session, register it on Letta, and
attach its tools to a stateful agent.

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
    At runtime, mint a [session](/docs/architecture/sessions) for the user. It returns the scoped SSE
    endpoint and a bearer that lives in the headers — never in the URL. A Letta MCP registration is
    persistent, so mint with a longer `ttl_ms` (up to 24h) and plan to rotate it:

    ```python theme={"theme":"css-variables"}
    import os
    import httpx

    NAIVE_API = "https://api.usenaive.ai"
    AUTH = {"Authorization": f"Bearer {os.environ['NAIVE_API_KEY']}"}

    ALICE_USER_ID = "<user_id>"  # from the control-plane step

    def mint_session(user_id: str, ttl_ms: int = 24 * 60 * 60 * 1000) -> dict:
        r = httpx.post(
            f"{NAIVE_API}/v1/users/{user_id}/sessions",
            headers=AUTH,
            json={"ttl_ms": ttl_ms},
        )
        r.raise_for_status()
        return r.json()  # { id, expires_at, mcp: { url, headers, expires_at } }
    ```
  </Step>

  <Step title="Register Naive, attach its tools, and build the agent">
    Register the session's scoped SSE endpoint as an MCP server on Letta, list the tools it
    exposes, and attach them to a new stateful agent. The `Authorization` header is split into
    Letta's `auth_header` + `auth_token` fields:

    ```python theme={"theme":"css-variables"}
    from letta_client import Letta

    session = mint_session(ALICE_USER_ID)

    # Letta Cloud (LETTA_API_KEY set); for self-hosting use Letta(base_url="http://localhost:8283")
    client = Letta(api_key=os.environ.get("LETTA_API_KEY"))

    # Register Naive's per-user session as an MCP server. Naive is SSE; the scoped
    # bearer goes in auth_header/auth_token — never in the URL.
    naive_server = client.mcp_servers.create(
        server_name=f"naive-{ALICE_USER_ID}",
        config={
            "mcp_server_type": "sse",
            "server_url": session["mcp"]["url"],
            "auth_header": "Authorization",
            "auth_token": session["mcp"]["headers"]["Authorization"],  # "Bearer nv_sess_…"
        },
    )

    # Discover Naive's tools (already filtered by Alice's Account Kit).
    naive_tools = client.mcp_servers.tools.list(naive_server.id)

    # Create a stateful agent and attach the Naive toolset by id.
    agent = client.agents.create(
        name="alice-ops-agent",
        model="openai/gpt-4o",                     # a handle you have access to
        embedding="openai/text-embedding-3-small",
        memory_blocks=[
            {"label": "persona", "value": "You run real-world operations for a specific user."},
            {"label": "human", "value": "This agent acts for Alice (user_123) at Acme."},
        ],
        tool_ids=[t.id for t in naive_tools],
    )

    # Run it — the agent keeps this memory and toolset across future messages.
    response = client.agents.messages.create(
        agent_id=agent.id,
        messages=[{
            "role": "user",
            "content": (
                "Connect my GitHub, then issue a $50 virtual card called "
                "'Ads budget' for our marketing spend."
            ),
        }],
    )
    for msg in response.messages:
        print(msg)
    ```

    The agent discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on Alice's
    account, capped by her kit. The loop and the memory are Letta's; the real-world actions are
    Naive's — and because the agent is persistent, the next message already remembers the card it
    set up.
  </Step>
</Steps>

That's the moat: the same Letta agent that would otherwise just *remember* wanting to spend
money now issues a policy-bounded card on a specific user's account — and keeps that context for
next time.

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. Letta
lets you add a *client-side* checkpoint too, and Naive enforces the *server-side* one — so you
get defense in depth: Letta can pause before the tool runs, but even if a call gets through, the
spend gate still lives on Naive's servers.

* **In Letta** — add a [`requires_approval` tool rule](https://docs.letta.com/guides/agents/tool-rules)
  so the agent pauses before a sensitive tool runs and emits an approval request instead of
  calling it.
* **On the server** — even if a call gets through, Naive freezes the sensitive action and
  returns a pending approval (HTTP `202`) instead of a live card. This holds no matter what
  runtime calls it.

```python theme={"theme":"css-variables"}
# Gate sensitive Naive tools at agent-create time.
agent = client.agents.create(
    name="alice-ops-agent",
    model="openai/gpt-4o",
    embedding="openai/text-embedding-3-small",
    tool_ids=[t.id for t in naive_tools],
    tool_rules=[
        {"type": "requires_approval", "tool_name": "naive_cards_create"},
        {"type": "requires_approval", "tool_name": "naive_purchase_domain"},
    ],
)
```

When the agent reaches `naive_cards_create`, the run stops with an approval request. Your app
shows it to a human, then resumes the loop by approving (or denying) the specific tool call:

```python theme={"theme":"css-variables"}
# Resume a paused run: approve (or deny) the pending tool call.
client.agents.messages.create(
    agent_id=agent.id,
    messages=[{
        "type": "approval",
        "approve": True,                 # False + reason=... to deny
        "tool_call_id": "<tool_call_id>",  # from the approval request message
    }],
)
```

Independently, Naive's server-side gate returns a pending approval rather than a live card —
regardless of what the client did:

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
  Letta's `requires_approval` tool rule is a convenience for your own UX — the real enforcement is
  Naive's server-side approval gate above, which can't be bypassed from the agent config, the tool
  list, or the tool rule.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent per tenant

Letta agents are already **per-user and persistent** — so serving every tenant is natural: give
each end-user their own agent, each backed by their own Naive session. Register the Naive server
once with an [agent-scoped variable](https://docs.letta.com/guides/core-concepts/tools/mcp-tools/)
in the token, then set each agent's variable to that user's freshly minted session bearer:

```python theme={"theme":"css-variables"}
# Register once, with a templated token resolved per-agent.
naive_server = client.mcp_servers.create(
    server_name="naive",
    config={
        "mcp_server_type": "sse",
        "server_url": "https://api.usenaive.ai/mcp/sse/{{NAIVE_SESSION_ID}}",
        "auth_header": "Authorization",
        "auth_token": "Bearer {{NAIVE_SESSION_TOKEN}}",
    },
)
naive_tools = client.mcp_servers.tools.list(naive_server.id)

def agent_for_user(user_id: str):
    session = mint_session(user_id)                      # fresh, per-user session
    bearer = session["mcp"]["headers"]["Authorization"]  # "Bearer nv_sess_…"
    return client.agents.create(
        name=f"agent-{user_id}",
        model="openai/gpt-4o",
        embedding="openai/text-embedding-3-small",
        tool_ids=[t.id for t in naive_tools],
        tool_rules=[{"type": "requires_approval", "tool_name": "naive_cards_create"}],
        # Agent-scoped variables inject THIS user's session into the shared registration.
        secrets={
            "NAIVE_SESSION_ID": session["id"],
            "NAIVE_SESSION_TOKEN": bearer.removeprefix("Bearer "),
        },
    )

# Same agent definition, different tenant — isolated identity, spend, and approvals each time.
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the
session and that user's Account Kit, enforced on Naive's servers. Because sessions expire
(default 15 min, max 24h) and a Letta registration is persistent, refresh the agent's variables
with a new session on expiry — or update a single-user registration in place with
`client.mcp_servers.update(...)`. Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  **Prefer TypeScript?** Letta also ships `@letta-ai/letta-client` (`client.mcpServers.create`,
  `client.agents.create`), and Naive plugs into TS agent stacks. On TypeScript you can provision
  the control plane with the [`@usenaive-sdk/server`](/docs/sdk/overview) SDK (`naive.accountKits.create`,
  `naive.users.create`, `client.session(...)`) and hand the scoped MCP session to any MCP-aware
  runtime — see the [Vercel AI SDK](/docs/integrations/vercel-ai-sdk) and [Mastra](/docs/integrations/mastra)
  guides.
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
* [Pydantic AI](/docs/integrations/pydantic-ai) · [LlamaIndex](/docs/integrations/llamaindex) · [Agno](/docs/integrations/agno) · [smolagents](/docs/integrations/smolagents) ·  — the same
  MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
