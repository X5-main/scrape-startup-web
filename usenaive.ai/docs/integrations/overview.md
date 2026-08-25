> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Framework integrations

> Canonical index of agent-framework pairing guides — keep your orchestrator, add Naive identity, spend, connections, and policy-bounded approvals.

These guides show how to pair popular agent frameworks with Naive. Each guide keeps the
framework's orchestration loop and adds per-user identity, virtual cards, third-party
connections, and Account Kit policy — enforced server-side with human approval on sensitive
actions.

<Note>
  Third-party framework names (Vercel AI SDK, LangGraph, Microsoft AutoGen, Semantic Kernel,
  Google ADK, and others) are trademarks of their respective owners, used here for
  identification and integration guidance only. No endorsement, partnership, or affiliation is
  implied.
</Note>

## Guides

| Guide                                                | Stack                | Integration style                                   | When to use                                     |
| ---------------------------------------------------- | -------------------- | --------------------------------------------------- | ----------------------------------------------- |
| [Vercel AI SDK](/docs/integrations/vercel-ai-sdk)         | TypeScript / Node    | In-process `agentTools()` or scoped MCP             | AI SDK `generateText` / `streamText` apps       |
| [OpenAI Agents SDK](/docs/integrations/openai-agents)     | TypeScript           | In-process `agentTools()` or scoped MCP             | OpenAI's agent loop, handoffs, interruptions    |
| [LangGraph](/docs/integrations/langgraph)                 | TypeScript           | In-process `agentTools()` or scoped MCP             | LangChain v1 `createAgent` / graph workflows    |
| [Mastra](/docs/integrations/mastra)                       | TypeScript           | Scoped MCP (`MCPClient`)                            | Mastra agents, workflows, and tool approval     |
| [Cloudflare Agents](/docs/integrations/cloudflare-agents) | TypeScript / Workers | Scoped MCP on Durable Objects                       | Edge-deployed, stateful per-user agents         |
| [AutoGen](/docs/integrations/autogen)                     | Python               | Scoped MCP (`McpWorkbench`)                         | Multi-agent teams with MCP tool discovery       |
| [Google ADK](/docs/integrations/google-adk)               | Python               | Scoped MCP (`McpToolset`)                           | Gemini agents with ADK's `Runner`               |
| [Semantic Kernel](/docs/integrations/semantic-kernel)     | Python / .NET / Java | Scoped MCP (`MCPSsePlugin`) + REST control plane    | Kernel plugins and `ChatCompletionAgent`        |
| [Pydantic AI](/docs/integrations/pydantic-ai)             | Python               | Scoped MCP (`MCPServerSSE`) + REST control plane    | Typed agents with validated outputs             |
| [LlamaIndex](/docs/integrations/llamaindex)               | Python               | Scoped MCP (`BasicMCPClient`) + REST control plane  | `FunctionAgent` / `AgentWorkflow` loops         |
| [Claude Agent SDK](/docs/integrations/claude-agent-sdk)   | TypeScript / Python  | Scoped MCP + in-process tools                       | Anthropic's agent loop with subagents and hooks |
| [Agno](/docs/integrations/agno)                           | Python               | Scoped MCP (`SSEClientParams`) + REST control plane | High-performance Python agent teams             |
| [DSPy](/docs/integrations/dspy)                           | Python               | Scoped MCP (`sse_client`) + REST control plane      | ReAct/signatures with compiled programs         |
| [smolagents](/docs/integrations/smolagents)               | Python               | Scoped MCP (`from_mcp`) + REST control plane        | Code-writing and tool-calling agents            |
| [Letta](/docs/integrations/letta)                         | Python               | Scoped MCP (`mcp_servers`) + REST control plane     | Stateful, memory-native long-running agents     |
| [CrewAI](/docs/integrations/crewai)                       | Python               | Scoped MCP (`MCPServerSSE`) + REST control plane    | Role-based multi-agent crews                    |

## Two integration paths

**TypeScript (in-process)** — import `@usenaive-sdk/server`, provision users with
`naive.forUser(id)`, adapt `client.agentTools()` into the framework's native tool format, and
run the loop. Best when the agent runs in your trusted backend.

**MCP session (any language)** — mint a per-user [session](/docs/sdk/sessions) over the REST API
(or with the Node SDK), point the framework's MCP client at the scoped SSE endpoint, and let
it discover Naive's tools. Best for Python stacks, edge runtimes, and hosts you do not fully
trust. There is no language-specific Naive SDK for Python or .NET today — use REST for the
control plane and MCP for the data plane.

## Approvals: `action` vs `action_type`

When a gated tool call returns HTTP `202`, the immediate payload (and
`isPendingApproval(res)` in TypeScript) uses **`action`**. Approval records fetched from
`approvals.list()` or `approvals.get()` use **`action_type`**. See
[Approvals](/docs/getting-started/approvals) for the full lifecycle.

## Before you start

* Pick the guide that matches **your orchestrator** — the pairing pattern is the same
  (identity + Account Kit + tools), but the adapter code differs.
* Provision an [Account Kit](/docs/architecture/account-kits) and a [tenant user](/docs/getting-started/users) once; runtime code only mints sessions or binds `forUser(id)`.
* TypeScript guides install `@usenaive-sdk/server`; Python guides use `requests` / `httpx`
  against `https://api.usenaive.ai/v1` unless you prefer the Node SDK for provisioning scripts.

## Related reading (blog)

* [Naïve inside your agent framework](https://usenaive.ai/blog/naive-inside-your-agent-framework) — concept map for every guide in this index
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — runtime-agnostic governance at the tool-call boundary
* [Delegated, revocable MCP sessions](https://usenaive.ai/blog/delegated-revocable-mcp-sessions-for-ai-agents) — the session model every Python guide uses
* [Hosted vs bring-your-own runtime](https://usenaive.ai/blog/hosted-vs-bring-your-own-runtime-for-ai-agents) — where the agent loop runs
* [Build a bring-your-own-agent platform](https://usenaive.ai/blog/how-to-build-a-bring-your-own-agent-platform) — end-to-end tutorial
