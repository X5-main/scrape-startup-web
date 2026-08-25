> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Agent SDK

> Give your Claude Agent SDK agents a real-world account. The SDK runs the agent loop, the reasoning, tool-calling, subagents, and hooks; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP toolset.

<Frame caption="The Claude Agent SDK orchestrates the agent · Naive lets it transact">
  <img src="https://github.com/anthropics.png" alt="Anthropic — Claude Agent SDK" width="96" />
</Frame>

<Note>
  Claude and the Claude Agent SDK are trademarks of Anthropic, used here for identification and integration guidance only. No endorsement, partnership, or affiliation is implied.
</Note>

The [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) (the SDK that
powers Claude Code, in Python and TypeScript) runs a full agentic loop for you: you give it a
prompt and a set of tools, and it reasons, calls tools, feeds results back, and continues —
with subagents, hooks, and a permission system built in. It has **first-class MCP client
support**: point it at an MCP server and every tool the server exposes becomes callable by the
model.

* **What the SDK ships** — the agent loop (`query` / `ClaudeSDKClient`), tool permissions
  (`allowed_tools`, `can_use_tool`), subagents, hooks, sessions, and MCP clients over `stdio`,
  `http`, and `sse` — including **auth headers** on remote servers.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for a
  SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep the SDK's orchestration; Naive gives each agent a
[tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the sensitive
actions.

## How the pairing works

* The SDK turns any MCP server into a set of tools: add a server to `mcp_servers`, allow its
  tools, and each MCP tool becomes a function the model can call — no manual schema wiring.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Each session is one URL + one bearer scoped to one user. Register it under `mcp_servers`,
  allow `mcp__naive__*`, and every tool call runs as that user — gated server-side.

```
  Claude Agent SDK (query)               Naive
  ────────────────────────               ─────
  agent loop ─────── tool call ─────────▶ loop
    │  model picks an MCP tool
    ▼
  mcp_servers["naive"] (SSE + bearer) ──▶  /mcp/sse/sess_…   (per-user session)
                                            │  AccountKit-gated, scoped to one user
                                            ▼
                                      connect GitHub · issue a $50 card · run a capability
                                            │
                                      sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `claude-agent-sdk` **0.2.x** (Python: `query`, `ClaudeAgentOptions`,
  `can_use_tool`, `McpSSEServerConfig`) — equivalently `@anthropic-ai/claude-agent-sdk`
  **0.3.x** (TypeScript) — backed by the **Claude Code CLI 2.x**, and Naive **API v2** (hosted
  MCP server over SSE + per-user sessions), on **Python ≥ 3.10** / **Node ≥ 18**.

  The Claude Agent SDK spawns the Claude Code CLI under the hood, so **Node.js and the CLI must
  be installed** even for the Python SDK. Naive's session URL contains `/mcp/sse/…`, so register
  it with `"type": "sse"`. The SDK and CLI now recommend streamable-HTTP for new servers and mark
  SSE as deprecated, but SSE is still fully supported — use it to match Naive's endpoint. The
  scoped bearer rides in the connection **headers**, never in the URL. There is no Python Naive
  SDK yet, so the control plane (Account Kit, user, session) is shown over the REST API; you can
  equally provision from the [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node
  SDK. Pin your versions and set the model to one you have access to.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `ANTHROPIC_API_KEY` for the Claude model that runs the agent.
* Node.js ≥ 18 and the Claude Code CLI (the SDK's runtime): `npm install -g @anthropic-ai/claude-code`.
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install -U claude-agent-sdk httpx
npm install -g @anthropic-ai/claude-code
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Minimal viable integration

The shortest path to a Claude Agent SDK agent that can actually transact: define a policy and
provision a user (control plane, once), then at runtime mint a per-user MCP session and hand it
to `query()`.

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
    Register the session's scoped SSE endpoint under `mcp_servers`, allow its tools with a
    wildcard, and call `query()`. The SDK discovers Naive's tools, exposes them to the model, and
    runs the whole tool-calling loop for you:

    ```python theme={"theme":"css-variables"}
    import asyncio
    from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

    async def main():
        session = mint_session(ALICE_USER_ID)

        options = ClaudeAgentOptions(
            model="claude-sonnet-4-5",
            system_prompt=(
                "You are Alice's operations agent. Use the Naive tools to act on her "
                "real account. Report the GitHub connect link and the card's status."
            ),
            # Scoped bearer rides in headers — never in the URL.
            mcp_servers={
                "naive": {
                    "type": "sse",
                    "url": session["mcp"]["url"],
                    "headers": session["mcp"]["headers"],
                }
            },
            allowed_tools=["mcp__naive__*"],  # auto-approve Naive's per-user toolset
        )

        async for message in query(
            prompt=(
                "Connect my GitHub, then issue a $50 virtual card called "
                "'Ads budget' for our marketing spend."
            ),
            options=options,
        ):
            if isinstance(message, ResultMessage) and message.subtype == "success":
                print(message.result)

    asyncio.run(main())
    ```

    The model discovers GitHub (`mcp__naive__naive_connections_connect`), returns a connect link
    for Alice to authorize, and attempts to issue the card
    (`mcp__naive__naive_cards_create`) — a **real** card on Alice's account, capped by her kit. The
    whole agent loop is the SDK's; the real-world actions are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same Claude Agent SDK agent that would otherwise just
*describe* spending money now issues a policy-bounded card on a specific user's account.

<Note>
  MCP tools require explicit permission — without `allowed_tools`, the model sees Naive's tools
  but can't call them. The session's tool list is already filtered by Alice's kit, so the agent
  never sees a tool the policy forbids. To narrow further, list exact tool names instead of a
  wildcard (e.g. `allowed_tools=["mcp__naive__naive_connections_connect", "mcp__naive__naive_cards_create"]`),
  or mint the session against a tighter kit.
</Note>

## Extension: human-in-the-loop spend (two gates)

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. Pair
the SDK's in-run permission callback with Naive's server-side gate for defense in depth:

* **In the run** — a `can_use_tool` callback lets you inspect every tool call before it fires
  and hold the sensitive ones for review.
* **On the server** — even if a call gets through, Naive freezes it and returns a pending
  approval (HTTP `202`) instead of a live card. This holds no matter what runtime calls it.

Gate the card-issuing tool with `can_use_tool`. It runs before the tool executes and returns
either `PermissionResultAllow` or `PermissionResultDeny`:

```python theme={"theme":"css-variables"}
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    ResultMessage,
    ToolPermissionContext,
    PermissionResultAllow,
    PermissionResultDeny,
)

async def gate(tool_name: str, input: dict, context: ToolPermissionContext):
    # Hold spend for out-of-band review; allow everything else.
    if tool_name == "mcp__naive__naive_cards_create":
        # ...surface tool_name / input to a human in your UI, then decide...
        return PermissionResultDeny(message="Card issuance requires human approval.")
    return PermissionResultAllow()
```

`can_use_tool` requires the SDK's **streaming mode**, so pass the prompt as an async iterable
of message dicts rather than a plain string:

```python theme={"theme":"css-variables"}
import asyncio

async def stream(text: str):
    yield {
        "type": "user",
        "message": {"role": "user", "content": text},
        "parent_tool_use_id": None,
        "session_id": "alice",
    }

async def main():
    session = mint_session(ALICE_USER_ID)
    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5",
        mcp_servers={
            "naive": {
                "type": "sse",
                "url": session["mcp"]["url"],
                "headers": session["mcp"]["headers"],
            }
        },
        allowed_tools=["mcp__naive__*"],
        can_use_tool=gate,  # in-run gate
    )

    async for message in query(
        prompt=stream("Issue a $50 virtual card called 'Ads budget'."),
        options=options,
    ):
        if isinstance(message, ResultMessage):
            print(message.result)

asyncio.run(main())
```

When a call does reach Naive, the tool result comes back as a pending approval rather than a
live card:

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
  The `can_use_tool` callback shapes the run from *inside* your app; the real enforcement is
  Naive's server-side approval gate above, which can't be bypassed from the prompt, the
  `allowed_tools` list, or the agent config.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent definition, every tenant

A Naive session is scoped to one user, so to serve every tenant from the **same** agent
definition, mint a fresh session per request and build the options from it. The model,
system prompt, and allowed tools stay the same — only which user's session backs the toolset
changes, and every call is Account-Kit-gated server-side:

```python theme={"theme":"css-variables"}
async def run_for_user(user_id: str, task: str) -> str | None:
    session = mint_session(user_id)  # fresh, per-user session

    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5",
        system_prompt="Use the Naive tools to act on this user's real account.",
        mcp_servers={
            "naive": {
                "type": "sse",
                "url": session["mcp"]["url"],
                "headers": session["mcp"]["headers"],
            }
        },
        allowed_tools=["mcp__naive__*"],
    )

    result = None
    async for message in query(prompt=task, options=options):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            result = message.result
    return result

# Same agent code, different tenant — isolated identity, spend, and approvals each time.
# await run_for_user("<user_id>", "Connect GitHub and set up a $50 ads card.")
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the
session and that user's Account Kit, enforced on Naive's servers. Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  **TypeScript?** The SDK is the same shape in Node: register the session under `mcpServers`
  (`{ type: "sse", url, headers }`), allow `["mcp__naive__*"]`, and call `query(...)` from
  `@anthropic-ai/claude-agent-sdk`. On TypeScript you can also provision the control plane with
  the [`@usenaive-sdk/server`](/docs/sdk/overview) SDK (`naive.accountKits.create`, `naive.users.create`,
  `client.session(...)`) instead of raw REST.
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
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — scoped MCP session model
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
