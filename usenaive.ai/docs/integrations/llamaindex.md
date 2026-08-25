> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# LlamaIndex

> Give your LlamaIndex agents a real-world account. LlamaIndex runs the agent loop and multi-agent handoff; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP server.

[LlamaIndex](https://www.llamaindex.ai) is a Python framework for building agents and
agentic workflows over your data: a function-calling agent loop, multi-agent handoff,
typed structured output, streaming, and a large ecosystem of tools and readers.

* **What LlamaIndex ships** — `FunctionAgent` / `AgentWorkflow` orchestration, tool-calling,
  multi-agent handoff, `Context`-based state, typed `output_cls` results, and first-class
  MCP client support via `llama-index-tools-mcp`.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for
  a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep LlamaIndex's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* LlamaIndex turns any MCP server into a list of `FunctionTool`s — point a `BasicMCPClient`
  at the server, wrap it in an `McpToolSpec`, and `to_tool_list_async()` returns tools you
  hand straight to a `FunctionAgent`.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* So the integration is: mint a session for one user → build a `BasicMCPClient` against its
  SSE URL + scoped bearer → load the tools into a `FunctionAgent` → every tool call runs as
  that user, gated server-side.

```
  LlamaIndex (agent.run)                Naive
  ─────────────────────                 ─────
  FunctionAgent ── tool call ──▶ loop
        │  model picks an MCP tool
        ▼
  BasicMCPClient(url, headers)  ──────▶  /mcp/sse/sess_…   (per-user session)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** Naive **API v2** (hosted MCP server over SSE, per-user sessions),
  `llama-index` / `llama-index-core` **0.14.x** (`llama_index.core.agent.workflow.FunctionAgent`

  * `AgentWorkflow`, `output_cls`), `llama-index-tools-mcp` **0.4.x**
    (`BasicMCPClient` with `headers`, `McpToolSpec`), `llama-index-llms-openai` **0.7.x**, and the
    `mcp` Python package **1.x**, on **Python 3.10–3.13**.

  Naive's session URL contains `/mcp/sse/…`, so `BasicMCPClient` auto-selects **SSE** transport
  (it switches on `/sse/` in the path); the scoped bearer is passed via its `headers` argument,
  never the URL. There is no Naive Python SDK today — provision the control plane over the REST API, the
  [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node SDK (`@usenaive-sdk/server`).
  Pin your versions and
  set the model to one you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A model provider key for the model that runs the agent (this guide uses OpenAI via
  `OPENAI_API_KEY`).
* Python 3.10–3.13.

```bash theme={"theme":"css-variables"}
pip install llama-index llama-index-llms-openai llama-index-tools-mcp requests
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to a LlamaIndex agent that can actually transact: define a policy,
provision a user (control plane, once), then at runtime mint a per-user MCP session and load
its tools into a `FunctionAgent`.

<Steps>
  <Step title="Define the policy, then provision a user">
    An [Account Kit](/docs/architecture/account-kits) is the spend/capability policy. Here a tenant
    user gets a card (capped at \$500, approval required), the vault, and an allowlist of apps.
    Everything the agent does is bounded by this kit — server-side. These are one-time
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

    print(alice["id"])  # → set as NAIVE_USER_ID for the agent
    ```
  </Step>

  <Step title="Mint a per-user MCP session">
    At runtime, mint a short-lived [session](/docs/architecture/sessions) scoped to one user. It
    returns an SSE URL plus a scoped bearer that lives only in the headers — never in the URL —
    and expires (default 15 min, max 24h):

    ```python theme={"theme":"css-variables"}
    # agent.py
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

  <Step title="Load the tools — and let the agent transact">
    Build a `BasicMCPClient` against the session, turn it into a tool list, and hand it to a
    `FunctionAgent`. LlamaIndex discovers Naive's tools automatically and runs the agent loop for
    you. Because it's LlamaIndex, you can also pin a typed `output_cls` so the run returns a
    validated object, not a blob of text:

    ```python theme={"theme":"css-variables"}
    import asyncio
    from pydantic import BaseModel
    from llama_index.llms.openai import OpenAI
    from llama_index.core.agent.workflow import FunctionAgent
    from llama_index.tools.mcp import BasicMCPClient, McpToolSpec


    class SetupReport(BaseModel):
        github_connect_url: str | None = None
        card_status: str  # "issued" | "pending_approval" | "failed"
        notes: str


    async def main():
        # Scoped bearer rides in headers — never in the URL.
        naive = BasicMCPClient(
            session["mcp"]["url"],
            headers=session["mcp"]["headers"],
        )
        tools = await McpToolSpec(client=naive).to_tool_list_async()

        agent = FunctionAgent(
            tools=tools,
            llm=OpenAI(model="gpt-5.1"),
            output_cls=SetupReport,
            system_prompt=(
                "You are Alice's operations agent. Use the Naive tools to act on her "
                "real account. Report the GitHub connect link and the card's status."
            ),
        )

        response = await agent.run(
            "Connect Alice's GitHub, then issue a $50 virtual card called "
            "'Ads budget' for our marketing spend."
        )
        print(response.get_pydantic_model(SetupReport))  # → a typed SetupReport


    asyncio.run(main())
    ```

    The agent discovers GitHub (`naive_connections_connect`), returns a connect link for Alice
    to authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on
    Alice's account, capped by her kit. The whole agent loop is LlamaIndex's; the real-world
    actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same agent that would otherwise just *describe* spending
money now issues a policy-bounded card on a specific user's account — and hands you a typed
`SetupReport` back.

<Note>
  The session's tool list is already filtered by Alice's kit — the agent never sees a tool the
  policy forbids. To narrow further per agent, pass `allowed_tools=[...]` to `McpToolSpec`
  (or `BasicMCPClient`). To swap the session per request, build a fresh `BasicMCPClient` and
  reload the tool list before each `agent.run(...)`.
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. When
it calls the card-issuing tool, Naive freezes the request and the tool result comes back as a
pending approval (HTTP `202`) instead of a live card:

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

The agent relays the pending status (`card_status: "pending_approval"` in the typed report)
instead of claiming success. Your app then resolves it out of band — and on approval, Naive
**replays the frozen action** server-side:

```python theme={"theme":"css-variables"}
# resolve.py — operator side, out of band from the agent.
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
  To detect the pending state **inside the run**, stream the workflow with
  `agent.run(...).stream_events()` and inspect each `ToolCallResult` — you can spot a
  `pending_approval` payload, tag it, and shape how the agent reports it. The server-side gate
  holds regardless of what the handler does.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: a multi-agent workflow on one account

LlamaIndex's strength is multi-agent handoff. The same Naive session can back an entire
`AgentWorkflow` — a planner that hands off to a specialist — and **every** agent in the graph
inherits the same per-user, policy-bounded toolset:

```python theme={"theme":"css-variables"}
from llama_index.core.agent.workflow import FunctionAgent, AgentWorkflow

# `tools` and `naive` come from the minimal integration above.
ops = FunctionAgent(
    name="ops",
    description="Acts on Alice's real account via Naive (connections, cards, vault).",
    tools=tools,
    llm=OpenAI(model="gpt-5.1"),
    system_prompt="Execute real-world actions on Alice's account using the Naive tools.",
)
planner = FunctionAgent(
    name="planner",
    description="Plans the work, then hands off to ops to execute.",
    tools=[],
    llm=OpenAI(model="gpt-5.1"),
    system_prompt="Break the goal into steps, then hand off to `ops` to execute.",
    can_handoff_to=["ops"],
)

workflow = AgentWorkflow(agents=[planner, ops], root_agent=planner.name)
response = await workflow.run("Onboard Alice: connect GitHub and set up a $50 ads card.")
```

The planner orchestrates; `ops` transacts. Naive still enforces identity, capability bounds,
and approvals server-side — the handoff doesn't widen what either agent may do.

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
* [Pydantic AI](/docs/integrations/pydantic-ai) · [CrewAI](/docs/integrations/crewai) — the same
  MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
