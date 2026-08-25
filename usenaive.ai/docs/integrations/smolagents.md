> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# smolagents

> Give your smolagents agents a real-world account. smolagents runs the loop — code-writing agents, tool-calling, multi-agent handoff; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP toolset.

<Frame caption="smolagents orchestrates the agent · Naive lets it transact">
  <img src="https://github.com/huggingface.png" alt="Hugging Face — smolagents" width="96" />
</Frame>

<Note>
  smolagents and Hugging Face are trademarks of their respective owners, used here for identification and integration guidance only. No endorsement, partnership, or affiliation is implied.
</Note>

[smolagents](https://huggingface.co/docs/smolagents/index) is Hugging Face's minimal agent
library. Its signature is the **code agent**: instead of emitting JSON tool calls, the model
writes Python that calls your tools directly, in a sandboxed loop. It also ships a classic
`ToolCallingAgent`, multi-agent handoff, and **first-class MCP support** — point it at an MCP
server with `ToolCollection.from_mcp` and every tool the server exposes becomes callable.

* **What smolagents ships** — the agent loop (`CodeAgent`, `ToolCallingAgent`), sandboxed code
  execution, model-agnostic backends (`InferenceClientModel`, `OpenAIServerModel`,
  `LiteLLMModel`, …), multi-agent orchestration, and MCP clients over `stdio`,
  `streamable-http`, and `sse` — including **auth headers** on remote servers.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for a
  SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep smolagents' orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the sensitive
actions.

## How the pairing works

* smolagents turns any MCP server into a set of tools: `ToolCollection.from_mcp(...)` connects,
  discovers the server's tools, and hands them to your agent — no manual schema wiring.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Each session is one URL + one bearer scoped to one user. Load it as a `ToolCollection`, spread
  its tools into a `CodeAgent`, and every tool call runs as that user — gated server-side.

```
  smolagents (CodeAgent)                 Naive
  ──────────────────────                 ─────
  model writes Python ── tool call ─────▶ loop
    │  code calls a Naive tool
    ▼
  ToolCollection.from_mcp (SSE + bearer) ▶  /mcp/sse/sess_…   (per-user session)
                                            │  AccountKit-gated, scoped to one user
                                            ▼
                                      connect GitHub · issue a $50 card · run a capability
                                            │
                                      sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `smolagents` **1.26.0** (1.x — `CodeAgent`, `ToolCollection.from_mcp`,
  `MCPClient`) with `mcpadapt` **0.1.20** and `mcp` **1.28.1**, and Naive **API v2** (hosted MCP
  server over SSE + per-user sessions), on **Python ≥ 3.10**.

  Naive's session URL contains `/mcp/sse/…`, so connect with `"transport": "sse"`. smolagents
  flipped its default transport to `streamable-http` in **1.21.0** and marks SSE as deprecated,
  but SSE is still fully supported — set it explicitly to match Naive's endpoint. The scoped
  bearer rides in the connection **`headers`**, never in the URL. `from_mcp` requires
  `trust_remote_code=True` to load MCP tools at all. There is no Python Naive SDK yet, so the
  control plane (Account Kit, user, session) is shown over the REST API; you can equally
  provision from the [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node SDK. Pin
  your versions and set the model to one you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* A model provider key for the LLM that runs the agent (e.g. `OPENAI_API_KEY`, or a
  `HF_TOKEN` for `InferenceClientModel`).
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install "smolagents[mcp,openai]" httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to a smolagents agent that can actually transact: define a policy and
provision a user (control plane, once), then at runtime mint a per-user MCP session and load it
as a `ToolCollection`.

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
    Load the session's scoped SSE endpoint as a `ToolCollection`, spread its tools into a
    `CodeAgent`, and call `run()`. smolagents discovers Naive's tools, exposes them to the model,
    and runs the whole loop for you:

    ```python theme={"theme":"css-variables"}
    from smolagents import CodeAgent, ToolCollection, OpenAIServerModel

    session = mint_session(ALICE_USER_ID)

    # Naive's session is SSE; the scoped bearer rides in headers — never in the URL.
    server_parameters = {
        "url": session["mcp"]["url"],
        "transport": "sse",
        "headers": session["mcp"]["headers"],
    }

    model = OpenAIServerModel(model_id="gpt-4.1")

    # from_mcp is a context manager: the connection closes on exit.
    with ToolCollection.from_mcp(server_parameters, trust_remote_code=True) as tool_collection:
        agent = CodeAgent(tools=[*tool_collection.tools], model=model)
        agent.run(
            "Connect my GitHub, then issue a $50 virtual card called "
            "'Ads budget' for our marketing spend."
        )
    ```

    The model discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on Alice's
    account, capped by her kit. The whole loop is smolagents'; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~15 lines: the same smolagents agent that would otherwise just *describe*
spending money now issues a policy-bounded card on a specific user's account.

<Note>
  `from_mcp` needs `trust_remote_code=True` — that's smolagents' gate for loading tool
  definitions from a remote MCP server (without it, MCP tools won't load at all). The session's
  tool list is already filtered by Alice's kit, so the agent never sees a tool the policy forbids.
  To narrow further, hand the agent a subset — `tools=[t for t in tool_collection.tools if t.name
    in {"naive_connections_connect", "naive_cards_create"}]` — or mint the session against a tighter
  kit.
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. This
is where the pairing is deliberately asymmetric: smolagents runs the agent, but the spend gate
lives on Naive's servers, not in your prompt or agent config.

* **In smolagents** — you shape the run by narrowing which tools the agent even sees (subset
  `tool_collection.tools`, above) and by keeping code execution sandboxed.
* **On the server** — even if a call gets through, Naive freezes the sensitive action and
  returns a pending approval (HTTP `202`) instead of a live card. This holds no matter what
  runtime calls it.

When the agent calls `naive_cards_create`, the tool result comes back as a pending approval
rather than a live card:

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
  Whatever you allow the smolagents model to write, the real enforcement is Naive's server-side
  approval gate above, which can't be bypassed from the generated code, the tool list, or the
  agent config.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent definition, every tenant

A Naive session is scoped to one user, so to serve every tenant from the **same** agent
definition, mint a fresh session per request and open a `ToolCollection` from it. The model,
system prompt, and tool selection stay the same — only which user's session backs the toolset
changes, and every call is Account-Kit-gated server-side:

```python theme={"theme":"css-variables"}
def run_for_user(user_id: str, task: str) -> str:
    session = mint_session(user_id)  # fresh, per-user session
    server_parameters = {
        "url": session["mcp"]["url"],
        "transport": "sse",
        "headers": session["mcp"]["headers"],
    }
    model = OpenAIServerModel(model_id="gpt-4.1")

    with ToolCollection.from_mcp(server_parameters, trust_remote_code=True) as tools:
        agent = CodeAgent(tools=[*tools.tools], model=model)
        return agent.run(task)

# Same agent code, different tenant — isolated identity, spend, and approvals each time.
# run_for_user("<user_id>", "Connect GitHub and set up a $50 ads card.")
```

For a connection you manage across a longer-lived run (e.g. a service handling many turns),
use `MCPClient` directly instead of the one-shot context manager — remember to close it:

```python theme={"theme":"css-variables"}
from smolagents import CodeAgent, MCPClient, OpenAIServerModel

mcp_client = MCPClient(server_parameters)
try:
    agent = CodeAgent(tools=mcp_client.get_tools(), model=OpenAIServerModel(model_id="gpt-4.1"))
    agent.run("Connect GitHub and set up a $50 ads card.")
finally:
    mcp_client.disconnect()  # always clean up the session connection
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the
session and that user's Account Kit, enforced on Naive's servers. Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  **Prefer TypeScript?** Naive also plugs into TS agent stacks. On TypeScript you can provision
  the control plane with the [`@usenaive-sdk/server`](/docs/sdk/overview) SDK (`naive.accountKits.create`,
  `naive.users.create`, `client.session(...)`) and hand the scoped MCP session to any MCP-aware
  runtime — see the [Vercel AI SDK](/docs/integrations/vercel-ai-sdk) and
  [Mastra](/docs/integrations/mastra) guides.
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
* [Pydantic AI](/docs/integrations/pydantic-ai) · [LlamaIndex](/docs/integrations/llamaindex) · [Agno](/docs/integrations/agno) — the same
  MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
