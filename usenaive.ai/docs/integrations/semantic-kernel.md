> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Semantic Kernel

> Give your Microsoft Semantic Kernel agents a real-world account. Semantic Kernel runs the kernel, the plugins, and the function-calling loop; Naive supplies per-user identity, a funded virtual card, 1,000+ connectable apps, and policy-bounded, human-approved spend — delivered as a scoped MCP plugin.

[Microsoft Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/) is an
open-source SDK for building AI agents in **Python, .NET, and Java**. You give a kernel a
chat service and a set of **plugins** (native functions, OpenAPI specs, or MCP servers);
Semantic Kernel runs the automatic function-calling loop — and, with `ChatCompletionAgent`,
wraps that into a first-class agent with instructions and memory.

* **What Semantic Kernel ships** — a `Kernel`, native/OpenAPI/MCP plugins, automatic
  function calling (`FunctionChoiceBehavior.Auto`), `ChatCompletionAgent`, structured
  outputs, filters/telemetry, and **first-class MCP client support** via
  `MCPSsePlugin` / `MCPStreamableHttpPlugin` / `MCPStdioPlugin`.
* **What it doesn't ship** — a way for those agents to *act as a real account*: sign up for
  a SaaS tool, hold a funded card, or spend within a budget you control, per end-user.

That's the half Naive adds. You keep Semantic Kernel's orchestration; Naive gives each agent
a [tenant identity](/docs/getting-started/users), a [virtual card](/docs/getting-started/cards),
[1,000+ third-party connections](/docs/getting-started/connections), and an
[Account Kit](/docs/architecture/account-kits) that bounds exactly what the agent can do —
enforced **server-side**, with [human approval](/docs/getting-started/approvals) on the
sensitive actions.

## How the pairing works

* Semantic Kernel turns any MCP server into a **plugin**: point an `MCPSsePlugin` at the
  server URL, `add_plugin` it to the kernel or agent, and each MCP tool becomes a
  `kernel_function` the model can call — no manual schema wiring.
* Naive ships a **hosted MCP server** and mints **per-user [sessions](/docs/architecture/sessions)** —
  short-lived, revocable SSE endpoints whose tool list is the fused native + third-party
  toolset, already filtered by that user's Account Kit.
* Each session is one URL + one bearer scoped to one user. Build an `MCPSsePlugin` from it,
  hand it to a `ChatCompletionAgent`, and every tool call runs as that user — gated
  server-side.

```
  Semantic Kernel (agent.get_response)   Naive
  ────────────────────────────────      ─────
  ChatCompletionAgent ── tool call ──▶ loop
        │  model picks an MCP tool
        ▼
  MCPSsePlugin (SSE + scoped bearer) ─▶  /mcp/sse/sess_…   (per-user session)
                                          │  AccountKit-gated, scoped to one user
                                          ▼
                                    connect GitHub · issue a $50 card · run a capability
                                          │
                                    sensitive? → 202 pending_approval (human-in-the-loop)
```

<Note>
  **Tested against:** `semantic-kernel` **1.43.x** with the `[mcp]` extra
  (`semantic_kernel.connectors.mcp.MCPSsePlugin` with `headers`, `ChatCompletionAgent`,
  `OpenAIChatCompletion`, `OpenAIChatPromptExecutionSettings`, `FunctionChoiceBehavior.Auto`),
  the `mcp` Python package **1.x** (SSE transport), and Naive **API v2** (hosted MCP server
  over SSE + per-user sessions), on **Python ≥ 3.10**.

  Naive's session URL contains `/mcp/sse/…`, so pair it with Semantic Kernel's **`MCPSsePlugin`**
  (not `MCPStreamableHttpPlugin`). The scoped bearer rides in the plugin's `headers` argument,
  never the URL. MCP support isn't in the base install — add the `mcp` extra
  (`semantic-kernel[mcp]`). There is no language-specific Naive SDK for Python or .NET yet — provision the control plane
  over the REST API, the [dashboard](https://dashboard.usenaive.ai), the CLI, or the Node SDK
  (`@usenaive-sdk/server`). Pin your versions and
  set the model to one you have access to. The `MCPSsePlugin` connectors are marked
  `experimental` upstream.
</Note>

## Prerequisites

* A Naive API key (`nv_sk_...`) — get one from the [dashboard](https://dashboard.usenaive.ai).
* An `OPENAI_API_KEY` for the model that runs the agent (or swap in any other Semantic Kernel
  chat service, e.g. `AzureChatCompletion`).
* Python ≥ 3.10.

```bash theme={"theme":"css-variables"}
pip install "semantic-kernel[mcp]" httpx
```

```bash theme={"theme":"css-variables"}
export NAIVE_API_KEY=nv_sk_live_...
export OPENAI_API_KEY=sk-...
```

## Minimal viable integration

The shortest path to a Semantic Kernel agent that can actually transact: define a policy and
provision a user (control plane, once), then at runtime mint a per-user MCP session and hand
it to a `ChatCompletionAgent`.

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
    Point Semantic Kernel's `MCPSsePlugin` at the session's scoped SSE endpoint, `add_plugin` it
    to a `ChatCompletionAgent`, and call `get_response`. Semantic Kernel discovers Naive's tools,
    exposes them as kernel functions, and runs the automatic function-calling loop for you (call
    tool → feed result back → continue). The plugin is an async context manager — keep it open
    for the duration of the run:

    ```python theme={"theme":"css-variables"}
    import asyncio
    from semantic_kernel.agents import ChatCompletionAgent
    from semantic_kernel.connectors.ai import FunctionChoiceBehavior
    from semantic_kernel.connectors.ai.open_ai import (
        OpenAIChatCompletion,
        OpenAIChatPromptExecutionSettings,
    )
    from semantic_kernel.connectors.mcp import MCPSsePlugin
    from semantic_kernel.functions import KernelArguments


    async def main():
        session = mint_session(ALICE_USER_ID)

        settings = OpenAIChatPromptExecutionSettings(
            function_choice_behavior=FunctionChoiceBehavior.Auto(),  # auto-invoke tools
        )

        # Scoped bearer rides in headers — never in the URL.
        async with MCPSsePlugin(
            name="Naive",
            description="Act on the user's real Naive account (connections, cards, vault).",
            url=session["mcp"]["url"],
            headers=session["mcp"]["headers"],
        ) as naive:
            agent = ChatCompletionAgent(
                service=OpenAIChatCompletion(ai_model_id="gpt-5.1"),
                name="ops_agent",
                instructions=(
                    "You are Alice's operations agent. Use the Naive tools to act on her "
                    "real account. Report the GitHub connect link and the card's status."
                ),
                plugins=[naive],                    # Naive's per-user toolset
                arguments=KernelArguments(settings),
            )

            response = await agent.get_response(messages=(
                "Connect my GitHub, then issue a $50 virtual card called "
                "'Ads budget' for our marketing spend."
            ))
            print(response.content)


    asyncio.run(main())
    ```

    The model discovers GitHub (`naive_connections_connect`), returns a connect link for Alice to
    authorize, and attempts to issue the card (`naive_cards_create`) — a **real** card on Alice's
    account, capped by her kit. The whole agent loop is Semantic Kernel's; the real-world actions
    are Naive's.
  </Step>
</Steps>

That's the moat in \~40 lines: the same Semantic Kernel agent that would otherwise just
*describe* spending money now issues a policy-bounded card on a specific user's account.

<Note>
  The session's tool list is already filtered by Alice's kit — the agent never sees a tool the
  policy forbids. Each MCP tool is registered as a kernel function under the plugin name (e.g.
  `Naive-naive_cards_create`). To narrow further per agent, scope the model with
  `FunctionChoiceBehavior.Auto(filters={"included_functions": ["Naive-naive_connections_connect"]})`,
  or load a subset with `MCPSsePlugin(..., load_tools=True)` and a dedicated session whose kit
  is tighter.
</Note>

## Extension: human-in-the-loop spend

Because the kit set `cards.requiresApproval: true`, the agent **cannot** silently spend. When
the model calls the card-issuing tool, Naive freezes the request and the tool result comes
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
  Want a UX gate *inside* the run too? Add a Semantic Kernel
  [auto-function-invocation filter](https://learn.microsoft.com/en-us/semantic-kernel/concepts/enterprise-readiness/filters)
  that inspects each function call and pauses for confirmation. That shapes the conversation;
  the real enforcement is Naive's server-side approval gate above, which applies regardless of
  prompt or kernel configuration.
</Info>

<Info>
  Approvals are only enforced for agent (API-key / MCP) calls on real tenant users. A human
  acting in your dashboard, and agent calls on the operator's own default user, bypass the
  gate — so end-user agents stay governed while your own automation isn't slowed down.
</Info>

## Alternative: one agent definition, every tenant

A Naive session is scoped to one user, so to serve every tenant from the **same** agent
definition, mint a fresh session per request and build the `MCPSsePlugin` from it. The
instructions, model, and settings stay identical — only which user's session backs the
plugin changes, and every call is Account-Kit-gated server-side:

```python theme={"theme":"css-variables"}
async def run_for_user(user_id: str, task: str) -> str:
    session = mint_session(user_id)  # fresh, per-user session

    settings = OpenAIChatPromptExecutionSettings(
        function_choice_behavior=FunctionChoiceBehavior.Auto(),
    )

    async with MCPSsePlugin(
        name="Naive",
        url=session["mcp"]["url"],
        headers=session["mcp"]["headers"],
    ) as naive:
        agent = ChatCompletionAgent(
            service=OpenAIChatCompletion(ai_model_id="gpt-5.1"),
            name="ops_agent",
            instructions="Use the Naive tools to act on this user's real account.",
            plugins=[naive],
            arguments=KernelArguments(settings),
        )
        response = await agent.get_response(messages=task)
        return str(response.content)

# Same agent code, different tenant — isolated identity, spend, and approvals each time.
# await run_for_user("<user_id>", "Connect GitHub and set up a $50 ads card.")
```

Nothing about the agent widens what a user may do: the toolset is the intersection of the
session and that user's Account Kit, enforced on Naive's servers. Revoke a session early with
`DELETE /v1/users/{user_id}/sessions/{id}`.

<Info>
  Because it's Semantic Kernel, you can also pin a typed result: set
  `settings.response_format = MySchema` (a Pydantic model) so the run returns a validated
  object — e.g. `{ github_connect_url, card_status }` — instead of free text, while the
  transacting still happens through Naive's gated tools.
</Info>

## What stays enforced

No matter how the agent is wired, the policy is enforced where it matters — on Naive's
servers, not in your prompt or your kernel config:

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
* [AutoGen](/docs/integrations/autogen) · [Pydantic AI](/docs/integrations/pydantic-ai) — the same
  MCP-session pairing for other Python stacks

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every integration guide
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — session model for Python and MCP guides
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — caps, approvals, and revoke on every tool call
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant architecture this pairing assumes
