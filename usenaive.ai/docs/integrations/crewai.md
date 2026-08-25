> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# CrewAI

> Give your CrewAI crews a real-world account. CrewAI orchestrates the role-based agents; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP server.

[CrewAI](https://docs.crewai.com) is a Python framework for **multi-agent crews**: you give
each agent a role, a goal, and a backstory, hand the crew a set of tools, and it runs the
tasks — sequentially or hierarchically — until the work is done.

* **What CrewAI ships** — role-based agents, task graphs, delegation, planning, memory.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up
  for a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep CrewAI's orchestration; Naive gives the crew a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the crew can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* CrewAI has **first-class MCP support** — point an agent's `mcps` field at any MCP server
  and its tools are discovered automatically.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* So the integration is: mint a session for one user → hand its SSE URL + scoped bearer to
  a CrewAI agent → every tool call runs as that user, gated server-side.

```
  CrewAI (Crew.kickoff)                 Naive
  ─────────────────────                 ─────
  agent ── task ──▶ tool call
        │  agent picks an MCP tool
        ▼
  MCPServerSSE(url, headers)  ──────▶  /mcp/sse/sess_…   (per-user session)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** Naive **API v2** (hosted MCP server over SSE, per-user sessions),
  `crewai` **1.x** (`crewai.mcp.MCPServerSSE`, the agent `mcps` field), and the `mcp` Python
  package **1.x**, on **Python 3.10–3.13**.

  Naive's MCP server uses **SSE** transport, so this guide uses `MCPServerSSE`. There is no
  Naive Python SDK today — provision the control plane over the REST API, the
  [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node SDK (`@usenaive-sdk/server`).
  Pin your versions
  and adjust the model to a provider you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A model provider key for the model that runs the crew (CrewAI reads `OPENAI_API_KEY` by
  default; set whichever provider you use).
* Python 3.10–3.13.

```bash theme={"theme":"css-variables"}
pip install crewai mcp requests
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to a CrewAI crew that can actually transact: define a policy, provision a
user (control plane, once), then at runtime mint a per-user MCP session and hand it to the
crew.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the crew does is bounded by this kit — server-side. These are one-time
    control-plane calls:

    ```python theme={"theme":"css-variables"}
    # provision.py — run once. No SDK needed; these are plain REST calls.
    import os, requests

    NAIVE = "https://api.usenaive.ai/v1"
    HEAD = {
        "Authorization": f"Bearer {os.environ['NAIVE_API_KEY']}",
        "Content-Type": "application/json",
    }

    # Control plane: a reusable policy template.
    kit = requests.post(f"{NAIVE}/account-kits", headers=HEAD, json={
        "name": "Pro",
        "primitives_config": {
            "cards": {"enabled": True, "requiresApproval": True,
                       "defaults": {"spending_limit_cents": 50000}},
            "vault": {"enabled": True},
        },
        "connections_config": {"mode": "allowlist",
                                "toolkits": ["github", "gmail", "stripe"]},
    }).json()

    # Provision one of your end-users and assign the kit.
    alice = requests.post(f"{NAIVE}/users", headers=HEAD, json={
        "external_id": "user_123",
        "email": "alice@acme.com",
        "account_kit_id": kit["id"],
    }).json()

    print(alice["id"])  # → set as NAIVE_USER_ID for the crew
    ```
  </Step>

  <Step title="Mint a per-user MCP session">
    At runtime, mint a short-lived [session](/docs/architecture/sessions) scoped to one user. It
    returns an SSE URL plus a scoped bearer that lives only in the headers — never in the URL —
    and expires (default 15 min, max 24h):

    ```python theme={"theme":"css-variables"}
    # crew.py
    import os, requests

    NAIVE = "https://api.usenaive.ai/v1"
    API_HEAD = {"Authorization": f"Bearer {os.environ['NAIVE_API_KEY']}"}
    USER_ID = os.environ["NAIVE_USER_ID"]  # Alice, from provisioning

    session = requests.post(
        f"{NAIVE}/users/{USER_ID}/sessions",
        headers=API_HEAD,
        json={"ttl_ms": 15 * 60 * 1000},
    ).json()

    # session["mcp"] = {
    #   "url": "https://api.usenaive.ai/mcp/sse/sess_...",
    #   "headers": {"Authorization": "Bearer nv_sess_..."},
    #   "expires_at": "..."
    # }
    ```
  </Step>

  <Step title="Give the crew the session — and let it transact">
    Point a CrewAI agent's `mcps` field at the session via `MCPServerSSE`. CrewAI discovers
    Naive's tools automatically and runs the crew's task loop for you:

    ```python theme={"theme":"css-variables"}
    from crewai import Agent, Task, Crew
    from crewai.mcp import MCPServerSSE

    ops = Agent(
        role="Operations Agent",
        goal="Act on Alice's real account to set up her marketing stack.",
        backstory="Runs real-world setup for one tenant, bounded by her Account Kit.",
        mcps=[
            MCPServerSSE(
                url=session["mcp"]["url"],
                headers=session["mcp"]["headers"],  # scoped bearer — never in the URL
                cache_tools_list=True,
            ),
        ],
    )

    task = Task(
        description=(
            "Connect Alice's GitHub, then issue a $50 virtual card called "
            "'Ads budget' for our marketing spend."
        ),
        expected_output="The GitHub connect link and the status of the card request.",
        agent=ops,
    )

    crew = Crew(agents=[ops], tasks=[task])
    print(crew.kickoff())
    ```

    The crew discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on
    Alice's account, capped by her kit. The whole crew is CrewAI's; the real-world actions are
    Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same crew that would otherwise just *describe* spending
money now issues a policy-bounded card on a specific user's account.

<Note>
  The session's tool list is already filtered by Alice's kit — the crew never sees a tool the
  policy forbids. To narrow further per agent, pass a `tool_filter` to `MCPServerSSE` (e.g.
  `create_static_tool_filter(allowed_tool_names=[...])` from `crewai.mcp.filters`).
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the crew **cannot** silently spend. When
an agent calls the card-issuing tool, Naive freezes the request and the tool result comes
back as a pending approval (HTTP `202`) instead of a live card:

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

The immediate `202` response uses `action`; approval records from the approvals API use
`action_type`.

The crew relays the pending status instead of claiming success. Your app then resolves it
out of band — and on approval, Naive **replays the frozen action** server-side:

```python theme={"theme":"css-variables"}
# resolve.py — operator side, out of band from the crew.
import os, requests

NAIVE = "https://api.usenaive.ai/v1"
HEAD = {"Authorization": f"Bearer {os.environ['NAIVE_API_KEY']}"}
USER_ID = os.environ["NAIVE_USER_ID"]

pending = requests.get(
    f"{NAIVE}/users/{USER_ID}/approvals",
    headers=HEAD, params={"status": "pending"},
).json()["approvals"]

for a in pending:
    # ...show a["title"] / a["action_type"] to a human in your UI...
    requests.post(f"{NAIVE}/users/{USER_ID}/approvals/{a['id']}/approve", headers=HEAD)
    # or: .../approvals/{a['id']}/deny  with {"reason": "over budget"}
```

See [Approvals](/docs/getting-started/approvals) for the full lifecycle
(`pending → executed / failed / denied`).

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user crews stay governed while your own automation isn't slowed down.
</Info>

## What stays enforced

No matter how the crew is wired, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your crew config:

* **Identity** — every action runs as a specific [tenant user](/docs/getting-started/users),
  fully isolated from your other users.
* **Capability bounds** — the [Account Kit](/docs/architecture/account-kits) decides which
  primitives and which apps the crew can touch (`allowlist` / `blocklist` / per-tool).
* **Scoped spend** — virtual cards are capped per card and per user; the model can't raise
  its own limit.
* **Human-in-the-loop** — sensitive actions ([cards](/docs/getting-started/cards),
  [domains](/docs/getting-started/domains), [KYC](/docs/getting-started/verification),
  [formation](/docs/getting-started/formation), connecting an app) freeze as
  [approvals](/docs/getting-started/approvals) until a human says yes.
* **Scoped, expiring access** — the crew holds a per-user session bearer, not your API key;
  it expires (default 15 min) and you can `DELETE /v1/users/:user_id/sessions/:id` to revoke
  it early.

## Next steps

* [MCP server](/docs/mcp/overview) — the hosted SSE server and its full [tool list](/docs/mcp/tools)
* [Sessions](/docs/architecture/sessions) — per-user MCP sessions, TTL, and revocation
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [LangGraph](/docs/integrations/langgraph) · [Vercel AI SDK](/docs/integrations/vercel-ai-sdk) — the
  same pairing for TypeScript stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
