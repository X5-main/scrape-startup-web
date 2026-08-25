> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Portkey to Naive

> Move agent LLM calls from Portkey's standalone AI gateway to Naive's /llm primitive — the same OpenAI-compatible, multi-model, fallback-capable routing, rooted in one governed identity that also owns the agent's cards, email, vault, and KYC.

<Frame caption="Portkey's AI gateway → the Naive /llm primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/portkey-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=25baab397c083a5fd7204219575949f2" alt="Portkey" height="28" data-path="migration-guides/logos/portkey-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/portkey-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=cfd5a4247b829cc2bdad79b5311459a3" alt="Portkey" height="28" data-path="migration-guides/logos/portkey-dark.svg" />
</Frame>

[Portkey](https://portkey.ai) gives an AI agent one OpenAI-compatible endpoint that routes to
many models across providers (Portkey's catalog size varies — check their docs for current counts) —
point your client at the gateway, attach a config, and
`portkey.chat.completions.create({ model, messages })`. It does that job well, and the API is
clean. But it is also a *separate vendor account*:

* LLM routing lives behind its **own** API key, its **own** provider keys (virtual keys / Model
  Catalog), and its **own** dashboard.
* Its `_user` metadata tag scopes **observability and budgets for LLM calls and nothing else** —
  it knows what the agent spent on tokens, but not its virtual card, its inbox, its vault
  secrets, or its KYC status.
* "Who let this agent burn \$400 on GPT-5, and what *else* can it touch?" is answered in Portkey
  for tokens, and somewhere else for everything else. There is no shared accountability.

Naive's [`/llm`](/docs/getting-started/llm) primitive gives the agent the **same** capability —
one OpenAI-compatible endpoint, 300+ models, provider routing, fallbacks, streaming — but
rooted in **one identity**:

* The [tenant user](/docs/getting-started/users) that makes the LLM call is the same user that owns
  its [cards](/docs/getting-started/cards), its [email](/docs/getting-started/email) inbox, its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* Whether the agent may call the model at all is decided by that user's
  [Account Kit](/docs/getting-started/account-kits) **at execution time** — not by which key happened
  to be in the request header.
* Every completion lands in the same per-user [activity log](/docs/getting-started/logs) as everything
  else the agent does, and is billed in the same [credits](/docs/getting-started/credits) as its cards
  and domains.

This guide maps Portkey's API to Naive's, shows the smallest working swap, and is explicit about
what does not map yet.

<Note>
  Portkey is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** Portkey AI Node SDK [`portkey-ai`](https://portkey.ai/docs) (gateway base
  `https://api.portkey.ai/v1`, `PORTKEY_GATEWAY_URL`; API surface per
  [portkey.ai/docs](https://portkey.ai/docs), snapshot June 2026) and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base
  `https://api.usenaive.ai/v1`, docs snapshot June 2026).

  Version notes:

  * Portkey renamed **Virtual Keys → AI Providers / Model Catalog**. Models are now referenced as
    `@provider-slug/model-name` in the `model` field; the `virtualKey` / `x-portkey-virtual-key`
    header still works for backward compatibility. This guide notes both.
  * Naive's `/llm` is a managed wrapper over [OpenRouter](https://openrouter.ai), so models use
    OpenRouter's `provider/model` convention (e.g. `anthropic/claude-sonnet-4.6`) and Naive holds
    the upstream key — there is **no bring-your-own provider key**. See [gaps](#what-does-not-map-yet).
  * Both are evolving APIs — verify method and model names against your installed SDK version.
</Info>

## Concept map

| Portkey                                                                   | Naive                                                                                                                          | Notes                                                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `new Portkey({ apiKey })`                                                 | `new Naive({ apiKey })`                                                                                                        | Server-side key in both cases                                                               |
| Portkey key **+** provider keys (virtual keys / Model Catalog) you manage | Single Naive key; OpenRouter key held server-side                                                                              | You stop holding provider keys — see [gaps](#what-does-not-map-yet)                         |
| `_user` metadata tag — scopes **LLM logs/budgets only**                   | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive                                     | The core consolidation win                                                                  |
| `portkey.chat.completions.create({ model, messages })`                    | `naive.llm.chat({ model, messages })`                                                                                          | Both OpenAI-shaped; response is OpenAI-compatible                                           |
| OpenAI SDK + `baseURL: PORTKEY_GATEWAY_URL` + `createHeaders({...})`      | OpenAI SDK + `baseURL: …/v1/proxy/openrouter`                                                                                  | Drop-in proxy on both — keep your existing client                                           |
| Model `@openai-prod/gpt-4o` (Model Catalog slug)                          | Model `openai/gpt-5.2` (OpenRouter `provider/model`)                                                                           | Both prefix the provider; slug namespace differs                                            |
| `stream: true`                                                            | `naive.llm.stream(...)` (or `stream: true` on the proxy)                                                                       | SSE on both; final chunk carries `usage`                                                    |
| Gateway Config `strategy: { mode: "fallback" }, targets: […]`             | `models: ["…", "…"]` fallback chain                                                                                            | Naive uses OpenRouter's ordered fallback list                                               |
| Provider preferences inside a target / config                             | `provider: { order, only, ignore, sort, allow_fallbacks, … }`                                                                  | OpenRouter [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) |
| `retry: { attempts, on_status_codes }`                                    | Partial — `models` fallback + `provider.allow_fallbacks`                                                                       | No standalone retry/backoff object — see [gaps](#what-does-not-map-yet)                     |
| `strategy: { mode: "loadbalance", targets: [{ weight }] }`                | Partial — `provider.sort` / `order`                                                                                            | No weighted/canary target splitting — see [gaps](#what-does-not-map-yet)                    |
| List models                                                               | `naive.llm.models(filter)` (`GET /v1/llm/models`, free)                                                                        | Returns routable OpenRouter models                                                          |
| Per-request usage/cost (Portkey logs, `x-portkey-trace-id`)               | `naive.llm.generation(id)` (`GET /v1/llm/generation?id=`) + `credits_used` on the response                                     | Cost is returned inline and logged per user                                                 |
| Virtual-key **budget / rate limit**                                       | **Account Kit** `primitives_config.llm` — enable/disable + **approval gating** + workspace [credits](/docs/getting-started/credits) | Execution-time policy, per user — different shape, see [gaps](#what-does-not-map-yet)       |
| Prompt templates (`portkey.prompts.completions.create`)                   | —                                                                                                                              | Not provided — see [gaps](#what-does-not-map-yet)                                           |
| Guardrails, caching (simple/semantic), conditional routing                | — (approvals is the nearest governance hook)                                                                                   | Not provided — see [gaps](#what-does-not-map-yet)                                           |

## Before / after: the core path

The path that matters for almost every agent is *send a chat completion, with a fallback model
if the first is unavailable*. Here it is on both platforms.

<CodeGroup>
  ```ts Portkey theme={"theme":"css-variables"}
  import Portkey from "portkey-ai";

  const portkey = new Portkey({
    apiKey: process.env.PORTKEY_API_KEY!,
    // a saved Gateway Config id (or inline object) drives fallbacks/routing
    config: "pc-agent-default",
  });

  // Models resolve via the Model Catalog (@provider-slug/model)
  const res = await portkey.chat.completions.create({
    model: "@anthropic-prod/claude-3-5-sonnet-20241022",
    messages: [{ role: "user", content: "Summarize our Q3 strategy in 3 bullets." }],
  });

  console.log(res.choices[0].message.content);
  // token usage/cost is in the Portkey dashboard, keyed by _user metadata
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // fallbacks are an ordered list on the request — no saved config object
  const res = await naive.llm.chat({
    model: "anthropic/claude-sonnet-4.6",
    models: ["anthropic/claude-sonnet-4.6", "openai/gpt-5.2"], // fallback chain
    messages: [{ role: "user", content: "Summarize our Q3 strategy in 3 bullets." }],
  });

  console.log(res.choices[0].message.content);
  console.log("credits:", res.credits_used); // cost returned inline, logged per user
  ```
</CodeGroup>

The completion call lines up almost one to one. The real differences to plan for:

* **No provider keys to manage.** In Portkey you create a virtual key / Model Catalog entry per
  provider and reference it. Naive holds the OpenRouter key server-side and bills you in
  [credits](/docs/getting-started/credits) — there is no upstream key to provision or rotate. (The
  flip side: you cannot bring your own provider key — see [gaps](#what-does-not-map-yet).)
* **Fallbacks are an ordered list, not a saved config.** Portkey's `config` (a `pc-…` object with
  `strategy`/`targets`) becomes the `models: [...]` array on the request, plus an optional
  `provider` object for OpenRouter routing preferences.
* **Cost is inline and per-user.** Portkey surfaces spend in its dashboard keyed by a `_user`
  metadata tag. Naive returns `credits_used` on the response and writes the event to the
  caller's [activity log](/docs/getting-started/logs) — the same log as that user's cards and email.

### Keep your existing OpenAI client (drop-in proxy)

If you already point the OpenAI SDK at Portkey's gateway, the migration is a two-line change:
swap the `baseURL` and drop `createHeaders`.

<CodeGroup>
  ```ts Portkey (OpenAI SDK) theme={"theme":"css-variables"}
  import OpenAI from "openai";
  import { PORTKEY_GATEWAY_URL, createHeaders } from "portkey-ai";

  const client = new OpenAI({
    apiKey: "unused",
    baseURL: PORTKEY_GATEWAY_URL,                 // https://api.portkey.ai/v1
    defaultHeaders: createHeaders({
      apiKey: process.env.PORTKEY_API_KEY!,
      provider: "@openai-prod",                   // or legacy virtualKey
    }),
  });

  const r = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }],
  });
  ```

  ```ts Naive (OpenAI SDK) theme={"theme":"css-variables"}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.NAIVE_API_KEY!,                       // nv_sk_...
    baseURL: "https://api.usenaive.ai/v1/proxy/openrouter",   // transparent passthrough
  });

  const r = await client.chat.completions.create({
    model: "openai/gpt-5.2",
    messages: [{ role: "user", content: "Hello" }],
  });
  ```
</CodeGroup>

* The Naive proxy maps every path under `/v1/proxy/openrouter/*` to OpenRouter, authenticated by
  your Naive key and billed in credits — **paid** credits: the proxy is gated exactly like the
  typed route, so it is not a way to route on the free signup grant.
* The proxy is **not** Account-Kit gated. When you want per-tenant policy enforcement, use the
  typed `naive.llm.chat()` / `POST /v1/llm/chat/completions` routes instead — that is the path the
  [consolidation](#consolidate-further-once-youre-on-naive) below relies on.

## Minimal viable migration

The smallest swap that keeps a working agent running is just *change the endpoint and the model
slug*. You do not need Account Kits or tenant-user fan-out to make your first call.

<Note>
  **You do need a paid account.** LLM routing is the one Naive primitive the 20 free signup credits
  do not cover, so a brand-new workspace cannot complete this migration on the trial alone: buy a
  credit pack (`naive billing topup --pack small`) or subscribe (`naive billing subscribe --plan
    pro`) first. Coming from Portkey you were already paying providers directly, so this is a bill you
  are moving rather than adding — and one purchase entitles the account permanently, whatever the
  balance does afterwards. Without it, both the typed route and the proxy answer `402
    llm_routing_requires_payment`. Browsing models
  (`naive.llm.models()`) is free either way.
</Note>

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Translate model slugs">
    Portkey's `@provider/model` (Model Catalog) becomes OpenRouter's `provider/model`. Browse the
    routable set with `naive.llm.models("claude")` (free) to find exact ids like
    `anthropic/claude-sonnet-4.6` or `openai/gpt-5.2`.
  </Step>

  <Step title="Swap the call">
    Replace `portkey.chat.completions.create({ model, messages })` with
    `naive.llm.chat({ model, messages })`, or — if you use the OpenAI SDK — just point `baseURL`
    at `https://api.usenaive.ai/v1/proxy/openrouter` and drop `createHeaders`.
  </Step>

  <Step title="Move fallbacks/routing onto the request">
    A Portkey fallback `config` becomes `models: ["primary", "backup"]`; provider preferences
    become the `provider: { … }` object. No saved config object to create.
  </Step>

  <Step title="Ship it">
    At this point you are off Portkey for the core completion path. Everything below is upside,
    not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Portkey, the `_user` metadata tag isolates **LLM
observability and budgets and nothing else**. On Naive, the unit of isolation is a **tenant
user**, and it isolates the agent's *entire* footprint.

<CodeGroup>
  ```ts Portkey (metadata tag — LLM only) theme={"theme":"css-variables"}
  // _user is an analytics/budget label on the LLM call; it isolates nothing else.
  const res = await portkey.chat.completions.create(
    {
      model: "@openai-prod/gpt-4o",
      messages: [{ role: "user", content: "Draft a welcome email." }],
    },
    { metadata: { _user: "customer-acme" } },
  );

  // The card, the inbox, the secrets, the KYC for this customer's agent
  // live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  await client.llm.chat({
    model: "openai/gpt-5.2",
    messages: [{ role: "user", content: "Draft a welcome email." }],
  });

  // The SAME client owns this customer's card, inbox, secrets, and KYC —
  // one identity, isolated end to end, billed in one credit balance.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  const inbox = await client.email.createInbox({ local_part: "notifications" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Portkey, the agent's LLM usage is an island tagged by metadata. With Naive,
  `naive.forUser(acme.id)` is a single handle to **LLM *and* cards *and* email *and* vault *and*
  KYC**.
* You provision a customer's whole agent footprint from one identity, and tear it down from one
  place. Sibling tenants can never read each other's completions, cards, or secrets.

### Gain #2 — execution-time permission enforcement

* Whether an agent may call the model at all is **policy on the Account Kit** — not a key that
  happens to be in scope, and not a budget that lives in a separate product.

```ts theme={"theme":"css-variables"}
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    llm:   { enabled: true },                    // model access is on for this tier
    cards: { enabled: true, requiresApproval: true },
    email: { enabled: true },
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);
```

* The agent's code is identical for every tier — `client.llm.chat({ model, … })`. Whether the
  call runs is decided by the **caller's kit at execution time**:
  * `primitives_config.llm.enabled: false` returns `forbidden` for that user — same line of code,
    no model access.
  * `requiresApproval` freezes a sensitive sibling action (a card charge, a domain purchase) until
    a human [approves](/docs/getting-started/approvals) — the API replays it only after approval.
* Move the user to a kit that disables `llm` and the exact same line returns `forbidden`, with no
  code change on your side. Portkey gates *which key is used*; Naive additionally gates *whether
  execution happens at all*, per user, in the same model as every other primitive.

### Gain #3 — unified accountability

* Every completion for a customer lands in *one* per-user [activity log](/docs/getting-started/logs) —
  alongside their card, email, and vault events, not in a separate LLM dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, and what did it spend?" — LLM, cards, email, secrets, one timeline
```

* Spend is unified too: LLM calls bill the **same** [credits](/docs/getting-started/credits) as the
  agent's cards and domains (Naive bills OpenRouter's returned `usage.cost` × a small markup), so
  "what did this customer's agent cost us this month?" is one number, not a reconciliation across
  Portkey, Stripe, and your own ledger.

## What does not map yet

A migration guide that hides gaps is worse than none. None of the following block the core path
(OpenAI-compatible completions, multi-model fallbacks, provider routing, streaming, and the
drop-in proxy all map cleanly), but they are real differences. Check this list against your app
before you commit.

| Portkey feature                                                                                                   | Status on Naive                                                                                    | Workaround                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Bring-your-own provider keys** (virtual keys / Model Catalog over your OpenAI/Anthropic/Bedrock/Azure accounts) | Not supported — Naive holds the OpenRouter key and bills credits                                   | Use Naive credits; if you must use your own provider contract/keys, keep that traffic on Portkey or call the provider directly |
| **Saved Gateway Configs** (`pc-…` objects, reused across requests, edited in the dashboard)                       | No saved config object                                                                             | Pass `models` + `provider` inline per request, or wrap them in your own helper                                                 |
| **Load balancing / canary** (`strategy: "loadbalance"`, weighted targets, conditional routing)                    | Partial — OpenRouter `provider.sort` / `order`                                                     | Order-based fallback only; no weighted split or per-condition routing                                                          |
| **Retry policy** (`retry: { attempts, on_status_codes }`, request timeouts)                                       | Partial — `models` fallback + `provider.allow_fallbacks`                                           | Implement client-side retry/backoff around `llm.chat()`                                                                        |
| **Prompt management** (`portkey.prompts.completions.create({ promptID })`, versioned templates)                   | Not provided                                                                                       | Manage prompts in your own code/store and pass full `messages`                                                                 |
| **Guardrails** (input/output validation, PII, schema checks in the gateway)                                       | Not provided (approvals gate *primitives*, not LLM content)                                        | Validate in your app, or gate sibling actions with [Approvals](/docs/getting-started/approvals)                                     |
| **Caching** (simple + semantic response cache)                                                                    | Not provided                                                                                       | Cache in your application layer                                                                                                |
| **Per-key budgets & rate limits** (hard spend caps / RPM per virtual key)                                         | No per-user LLM budget cap; governance is enable/disable + approvals + **workspace** credits       | Cap workspace credits; enforce per-user limits in your app for now                                                             |
| **Observability product** (analytics dashboards, OpenTelemetry export, custom metadata, trace ids)                | Per-user [activity log](/docs/getting-started/logs) + `generation(id)` cost, not a full analytics suite | Query/stream logs; export to your own analytics                                                                                |
| **Self-hosted / hybrid gateway**                                                                                  | Not applicable — Naive is hosted                                                                   | n/a                                                                                                                            |
| **Provider-specific passthrough features**                                                                        | OpenRouter normalizes across providers; some provider-only params may differ                       | Verify edge params against [OpenRouter](https://openrouter.ai/docs); fall back to calling the provider directly if required    |

<Warning>
  If your agent depends on **your own provider keys/contracts**, **prompt templates**,
  **gateway-side guardrails or caching**, or **hard per-key budgets**, those are the gaps most
  likely to matter — the first one (BYO provider keys) is the big architectural difference. The
  OpenAI-compatible completion loop with multi-model fallbacks and per-user Account-Kit governance
  — the most common agent LLM pattern — maps cleanly today.
</Warning>

## Where to go next

* [`/llm` primitive](/docs/getting-started/llm) — chat, streaming, models, and the drop-in proxy
* [LLM API reference](/docs/api-reference/llm/chat) — exact request/response shapes
* [`llm` SDK sub-client](/docs/sdk/sub-clients/llm) — typed method signatures
* [Credits](/docs/getting-started/credits#llm-calls) — how LLM calls are metered and billed
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model that makes execution-time governance real
* [Tenant users](/docs/getting-started/users) — the identity that the consolidation hangs off

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — governed LLM routing lifecycle
