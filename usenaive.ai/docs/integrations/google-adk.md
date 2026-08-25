> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Google ADK

> Give your Google ADK agents a real-world account. ADK runs the agent, multi-agent handoff, and tool loop; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP server.

[Google's Agent Development Kit (ADK)](https://google.github.io/adk-docs/) is an
open-source, code-first framework for building and deploying agents. You give an `LlmAgent`
a Gemini model, instructions, and tools; ADK runs the model-calling loop — plus multi-agent
handoff, sessions, and a `Runner` — until the job is done.

* **What ADK ships** — agents, the model loop, multi-agent orchestration, sessions,
  callbacks, evals, deployment, and **first-class MCP support** via `McpToolset`.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for
  a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep ADK's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* ADK has **first-class MCP support** via
  [`McpToolset`](https://google.github.io/adk-docs/tools/mcp-tools/) — point it at any MCP
  server and its tools are discovered and converted into ADK tools automatically (no manual
  schema wiring).
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/sdk/sessions)** —
  short-lived, revocable endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Each session is one URL + one bearer scoped to one user. Build an `McpToolset` from it,
  hand it to the agent for one run, and every tool call runs as that user — gated
  server-side.

```
  Google ADK (Runner.run_async)         Naive
  ─────────────────────────             ─────
  LlmAgent ── tool call ──▶ loop
        │  Gemini picks an MCP tool
        ▼
  McpToolset (SSE + scoped bearer) ─▶  /mcp/sse/sess_…   (per-user session)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `google-adk` **2.3.x** (`LlmAgent`, `Runner`, `InMemorySessionService`,
  and `McpToolset` / `SseConnectionParams` / `require_confirmation` from
  `google.adk.tools.mcp_tool`), the `mcp` Python package **1.28.x** (SSE transport), and
  Naive **API v2** (hosted MCP server over SSE + per-user sessions), on **Python ≥ 3.10**.

  Naive's MCP server uses **SSE** transport — pair it with ADK's `SseConnectionParams`
  (not `StreamableHTTPConnectionParams`). MCP support isn't in ADK's base install: add the
  `mcp` package. On older ADK (pre-1.x), import `McpToolset` from
  `google.adk.tools.mcp_tool.mcp_toolset` and `SseConnectionParams` from
  `google.adk.tools.mcp_tool.mcp_session_manager`. There is no Python Naive SDK yet — provision
  the control plane over the REST API, the [dashboard](https://dashboard.usenaive.ai), the
  CLI, or the Node SDK (`@usenaive-sdk/server`). Pin your versions
  and set `model` to a Gemini model you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A `GOOGLE_API_KEY` for the Gemini model that runs the agent (from
  [Google AI Studio](https://aistudio.google.com/apikey)).
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install google-adk mcp httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export GOOGLE_API_KEY=...
```

## Minimal viable integration

The shortest path to an ADK agent that can actually transact: define a policy and provision
a user (control plane, once), then at runtime mint a per-user MCP session and hand it to the
agent.

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
    At runtime, mint a short-lived [session](/docs/sdk/sessions) for the user. It returns the scoped
    SSE endpoint and a bearer that lives in the headers — never in the URL — and expires (default
    15 min, max 24h):

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
    Point ADK's `McpToolset` at the session's scoped SSE endpoint, attach it to an `LlmAgent`,
    and run it with a `Runner`. ADK discovers Naive's tools and runs the multi-step loop for you
    (call tool → feed result back → continue):

    ```python theme={"theme":"css-variables"}
    import asyncio
    from google.adk.agents import LlmAgent
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.adk.tools.mcp_tool import McpToolset, SseConnectionParams
    from google.genai import types

    async def main():
        session = mint_session(ALICE_USER_ID)

        naive_tools = McpToolset(
            connection_params=SseConnectionParams(
                url=session["mcp"]["url"],          # scoped, per-user endpoint
                headers=session["mcp"]["headers"],  # scoped bearer — never in the URL
            ),
        )

        agent = LlmAgent(
            model="gemini-2.5-flash",
            name="ops_agent",
            instruction="You are Alice's operations agent. Use Naive tools to act on her real account.",
            tools=[naive_tools],
        )

        svc = InMemorySessionService()
        run = await svc.create_session(app_name="naive_ops", user_id="alice")
        runner = Runner(app_name="naive_ops", agent=agent, session_service=svc)

        message = types.Content(
            role="user",
            parts=[types.Part(text=(
                "Connect my GitHub, then issue a $50 virtual card called "
                "'Ads budget' for our marketing spend."
            ))],
        )

        try:
            async for event in runner.run_async(
                user_id="alice", session_id=run.id, new_message=message
            ):
                if event.is_final_response():
                    print(event.content.parts[0].text)
        finally:
            await naive_tools.close()

    asyncio.run(main())
    ```

    The model discovers GitHub, returns a connect link for Alice to authorize, and attempts to
    issue the card — a **real** card on Alice's account, capped by her kit. The whole agent loop
    is ADK's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same ADK agent that would otherwise just *describe*
spending money now issues a policy-bounded card on a specific user's account.

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend.
You get two complementary layers — pair them for defense in depth:

* **In the agent** — ADK's `require_confirmation` on the `McpToolset` pauses before a tool
  runs, so the run surfaces the call for human review.
* **On the server** — even if a call gets through, Naive freezes it and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it.

Turn on ADK's confirmation so write actions pause for review:

```python theme={"theme":"css-variables"}
naive_tools = McpToolset(
    connection_params=SseConnectionParams(
        url=session["mcp"]["url"],
        headers=session["mcp"]["headers"],
    ),
    require_confirmation=True,  # ADK pauses for a human before any Naive tool runs
)
```

<Note>
  `require_confirmation` also accepts a callable for per-tool control, and ADK's
  `before_tool_callback` on the `LlmAgent` can inspect or short-circuit a call before it runs.
  Treat both as a UX / early-interrupt convenience — the real enforcement is Naive's
  server-side approval gate below, which applies regardless of prompt or agent configuration.
</Note>

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

The immediate `202` response uses `action`; approval records from the approvals API use
`action_type`.

Your app then resolves it out of band — and on approval, Naive **replays the frozen action**
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
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent, many tenants

Each Naive session is scoped to one user, so to serve every tenant from the same agent
definition, mint a fresh session per request and build the `McpToolset` from it. The agent's
model and instructions stay identical — only which user's session backs the tools changes,
and every call is Account-Kit-gated server-side:

```python theme={"theme":"css-variables"}
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool import McpToolset, SseConnectionParams

def build_ops_agent(user_id: str) -> tuple[LlmAgent, McpToolset]:
    session = mint_session(user_id)  # fresh, per-user session

    toolset = McpToolset(
        connection_params=SseConnectionParams(
            url=session["mcp"]["url"],
            headers=session["mcp"]["headers"],
        ),
    )

    agent = LlmAgent(
        model="gemini-2.5-flash",
        name="ops_agent",
        instruction="Use Naive tools to act on this user's real account.",
        tools=[toolset],
    )
    return agent, toolset
```

Build it per request, run it through a `Runner`, then `await toolset.close()`. Same Account
Kit, same approval gates — just scoped to whichever user's session you minted. Revoke a
session early with `DELETE /v1/users/{user_id}/sessions/{id}`.

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
* [Account Kits](/docs/architecture/account-kits) — author spend/capability policy
* [Approvals](/docs/getting-started/approvals) — the human-in-the-loop lifecycle
* [MCP server](/docs/mcp/overview) — how Naive's hosted MCP server works

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
