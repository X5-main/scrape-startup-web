> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agent tools

> Drop Naive's capabilities into a Claude (or any LLM) tool-use loop with one call.

`naive.forUser(id).agentTools()` (or `naive.agentTools()` for the default user) returns a
ready-to-use **meta-toolset**: a small set of tools as Anthropic tool-use definitions plus
a `handle(name, input)` dispatcher. It's the fastest way to give an agent real-world
abilities — connect third-party apps, run their capabilities, and use Naive's own built-in
primitives — all bounded by the user's [Account Kit](/docs/architecture/account-kits).

## Why meta-tools (not 1000s of schemas)

Naive exposes thousands of capabilities across third-party apps and its own primitives.
Instead of dumping every schema into the model's context, `agentTools()` gives the agent a
small core of **discover → run** meta-tools across two lanes.

### Third-party apps lane (external integrations)

| Tool                      | Does                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| `naive_search_apps`       | Search the catalog of \~1000 connectable apps (Gmail, GitHub, Slack, …) |
| `naive_list_connections`  | What the user has already connected                                     |
| `naive_connect_app`       | Start an OAuth connection (returns a link)                              |
| `naive_list_capabilities` | List a connected app's tools + schemas                                  |
| `naive_run_capability`    | Execute a capability (gated by the Account Kit)                         |

Flow: `search_apps` → `connect_app` → `list_capabilities` → `run_capability`.

### Built-in primitives lane (Naive's own platform features)

| Tool                      | Does                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `naive_search_primitives` | Discover Naive's built-in primitives + their methods & arg schemas   |
| `naive_run_primitive`     | Execute a built-in method, e.g. `primitive:"cards", method:"create"` |

Flow: `search_primitives` → `run_primitive`. **31** are registered; `naive_search_primitives`
returns the authoritative list at runtime, and anything not in that list is not addressable —
`naive_run_primitive` answers `Unknown Naive primitive method: '<primitive>.<method>'`. The
primitives surfaced (when their client is available) are **cards, payments, wallet, trading**
(brokerage stocks/options/crypto via OAuth —
`naive_run_primitive(primitive:"trading", method:"create_order", arguments:{ symbol, side, notional })`),
**email, phone** (provision US numbers + send/receive SMS via Surge —
`naive_run_primitive(primitive:"phone", method:"send", arguments:{ from, to, body })`),
**domains, vault, verification (KYC), formation, social,
approvals, browser** (cloud browser sessions + autonomous signup/login), **llm** (OpenRouter
chat completions across 300+ models — `naive_run_primitive(primitive:"llm", method:"chat",
arguments:{ model, messages })`), the **media** primitives **images, video, audio, clips** (AI
image, video and speech generation plus short-form video clipping) and **search** (real-time
web search, URL reading & deep research), **brain** (the company brain — remember, recall and
retract), **profile** (read/set the user's own email — e.g. point
it at a provisioned inbox before signup), the **build** primitives **apps** (provision a
managed app with an optional managed backend) plus **database / storage / functions / auth** (operate on a
fullstack app's managed backend — e.g. `naive_run_primitive(primitive:"database",
method:"query", arguments:{ sql })`), **sandbox** (disposable Linux micro-VM code sandboxes —
shell, filesystem, and public port exposure — e.g. `naive_run_primitive(primitive:"sandbox",
method:"exec", arguments:{ sandbox_id, command })`) and **mobile** (cloud mobile emulators/devices),
**agents** (long-horizon agents — `create`, `list`, `send`, `task`; four methods, not the
twenty-two the SDK's own `agents` sub-client has, because an operator configures an agent and a
model does not), and the
**growth** primitives **seo** (keyword volume,
rank tracking, backlinks, competitors — `naive_run_primitive(primitive:"seo",
method:"search_volume", arguments:{ keywords })`) and **aeo** (AI-search / GEO visibility
across ChatGPT, Claude, Gemini, Perplexity). For example, the agent drives the browser with
`naive_run_primitive(primitive:"browser", method:"signup", arguments:{ service, url })`.

Execution stays AccountKit-gated server-side, so the kit you configure bounds what the agent
can do; sensitive methods (issue a card, buy a domain, KYC, formation, browser signup) may
resolve to a `pending_approval` payload the model should relay to the user.

## Usage with the Anthropic SDK

```ts theme={"theme":"css-variables"}
import Anthropic from "@anthropic-ai/sdk";
import { Naive } from "@usenaive-sdk/server";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
const anthropic = new Anthropic();

const kit = naive.forUser(userId).agentTools();

// Annotate the array: a bare literal widens `role` to `string`, which does not
// satisfy Anthropic's `MessageParam` ("user" | "assistant") and fails to compile.
const messages: Anthropic.MessageParam[] = [
  { role: "user", content: "Connect my GitHub and open an issue in acme/web" },
];

while (true) {
  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools: kit.tools,            // <- Naive tools, Anthropic format
    messages,
  });
  messages.push({ role: "assistant", content: res.content });

  const calls = res.content.filter((b) => b.type === "tool_use");
  if (calls.length === 0) break;

  const results: Anthropic.ToolResultBlockParam[] = [];
  for (const call of calls) {
    const out = await kit.handle(call.name, call.input as Record<string, unknown>);
    results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(out) });
  }
  messages.push({ role: "user", content: results });
}
```

See the full working app in the `naive-example` repo (`/api/chat`).
