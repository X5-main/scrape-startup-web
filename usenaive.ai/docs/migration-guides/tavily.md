> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Tavily to Naive

> Move the web research your agent does — search, read a URL, synthesize a multi-source answer — off a standalone Tavily account and onto Naive's search primitive, where research is one governed capability on the same account (and Account Kit) that owns the agent's cards, email, phone, and vault. Naive's search is Tavily-backed, so results are typically comparable for the same query.

<Frame caption="Tavily's /search + /extract API → the Naive search primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/tavily-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=1d0433b3703b5616de94e5bacabe85b9" alt="Tavily" height="26" data-path="migration-guides/logos/tavily-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/tavily-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=28217cdbbdd88fe1f400d5a70980a3e9" alt="Tavily" height="26" data-path="migration-guides/logos/tavily-dark.svg" />
</Frame>

<Note>
  Tavily is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Tavily](https://docs.tavily.com) is a web search and content-extraction API built for LLM agents:
`search` returns ranked, snippet-rich results; `extract` pulls clean content from URLs; `crawl` and
`map` traverse whole sites. It does agent-grade retrieval well — a purpose-built ranker, an
LLM-friendly response shape, and a generous free tier. But when the thing doing the searching is an
**agent that also holds cards, an inbox, a phone number, and a KYC'd identity**, a Tavily account is
a *disconnected vendor account*:

* Retrieval lives behind a **Tavily API key** (`tvly-...`) — a credential that exists *only inside
  Tavily*, unrelated to where the same agent's cards, email, and KYC live.
* Whether the agent *may* search, and how much it may spend doing so, is **not** something Tavily
  governs at execution time — it is a key you hold. There is no "can this agent research right now?"
  check tied to the agent's broader permission set.
* *"Which agent ran this query, for which end-user, and who let it?"* is answered in Tavily's usage
  dashboard for search, and in unrelated systems for the agent's spend, comms, and identity.

Naive's [`search`](/docs/getting-started/search) primitive gives the agent the **same** capability —
`web_search`, `read_url`, and `research` — but it is **one primitive on one governed account**. And
it is honest to say the *results* are the same: **Naive's search is Tavily-backed under the hood**
(with a Brave fallback), so `web_search` proxies Tavily Search and `read_url` proxies Tavily Extract.
You keep Tavily-quality retrieval and gain:

* The [Account Kit](/docs/getting-started/account-kits) that decides whether the agent may
  [issue a card](/docs/getting-started/cards) or [send email](/docs/getting-started/email) also decides whether
  it may use `search` at all — checked **at execution time**, not in a separate dashboard.
* Search spend is metered in the **same credit balance and budget ceiling** as every other primitive,
  so a runaway agent hits one cap, not a separate Tavily bill.
* Every query records the **acting agent** and lands in the same
  [activity log](/docs/getting-started/logs) as its card spend, email sends, and KYC events.

This guide maps Tavily's retrieval API to Naive's, shows the smallest working swap, and is explicit
about what does **not** map yet — most importantly, that Naive's `search` exposes a much smaller set
of knobs than Tavily (no `crawl`/`map`, no per-request `search_depth`/`topic`/domain filters), and
that search is **workspace-scoped**, not per-end-user isolated.

<Info>
  **Tested against:** the Tavily JavaScript SDK
  [`@tavily/core`](https://www.npmjs.com/package/@tavily/core) **v0.7.6** (against the Tavily REST API,
  base `https://api.tavily.com`, `/search` and `/extract` endpoints, docs snapshot July 2026), and the
  Naive [`search`](/docs/getting-started/search) primitive over the Naive REST API (base
  `https://api.usenaive.ai/v1`, `/search`, `/search/url`, `/search/research` endpoints, docs snapshot
  July 2026). The Naive [`@usenaive-sdk/server`](/docs/sdk/overview) SDK does **not** ship a dedicated `search`
  sub-client yet — call `search` over REST (shown below) or via the [`naive search`](/docs/cli/search) CLI.

  Version notes:

  * **Auth model differs.** Tavily authenticates with an account-wide bearer key (`tvly-...`). Naive
    authenticates per workspace with `NAIVE_API_KEY`, and you scope an end-user with `naive.forUser(id)`
    / `POST /v1/users/:id/search` — the same handle that reaches every other primitive.
  * **Same provider under the hood.** Naive `web_search` calls Tavily `/search`; Naive `read_url` calls
    Tavily `/extract`. If Naive is configured with Brave instead, results come from Brave — you don't
    choose the provider, and you can't pass your own Tavily plan/key. See
    [what doesn't map yet](#what-does-not-map-yet).
  * **Smaller parameter surface.** Naive `web_search` takes `query` + `count` (1–20). Tavily's
    `search_depth`, `topic`, `time_range`, `include_domains`/`exclude_domains`, `country`,
    `include_answer`, `include_raw_content`, and `exact_match` have **no** pass-through today.
  * **Naive adds `research`.** `POST /v1/search/research` does multi-step search + synthesis with
    citations (a synchronous `quick` mode and async `thorough`/`exhaustive` jobs). On Tavily you'd
    compose `search` with your own LLM (or use `include_answer` for a one-line answer).
</Info>

## Concept map

| Tavily                                                                                         | Naive                                                                                      | Notes                                                                                                              |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `tavily({ apiKey })`                                                                           | `new Naive({ apiKey })` then `naive.forUser(id)`                                           | Server-side credential in both cases                                                                               |
| Account-wide `tvly-...` API key                                                                | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive | Search data is workspace-scoped today; see the [isolation caveat](#what-does-not-map-yet)                          |
| `tvly.search(query, { maxResults })` → `POST /search`                                          | `POST /v1/search` `{ query, count }`                                                       | Ranked web results; `count` maps to `maxResults` (1–20)                                                            |
| Result `{ title, url, content, score }`                                                        | Result `{ title, url, snippet }`                                                           | Naive renames `content` → `snippet`; no `score`/`rawContent` in the response                                       |
| `tvly.extract(urls, { extractDepth })` → `POST /extract`                                       | `POST /v1/search/url` `{ url, extract? }`                                                  | Naive reads **one** URL/call; `extract` is an optional AI focus prompt                                             |
| Extract result `{ url, rawContent }`                                                           | `{ url, content, extracted? }`                                                             | `extracted` returned only when you pass `extract`                                                                  |
| `include_answer: true` (one-line LLM answer)                                                   | `POST /v1/search/research` `{ query, depth: "quick" }` → `{ summary, sources }`            | Naive synthesizes a multi-source answer with citations                                                             |
| — (compose `search` + your LLM)                                                                | `POST /v1/search/research` `{ query, depth: "thorough" \| "exhaustive" }` → async job      | Returns `202 { job_id }`; poll `GET /v1/jobs/:id`                                                                  |
| `tvly.crawl(url, ...)` / `tvly.map(url, ...)`                                                  | —                                                                                          | Site traversal / sitemap **not** available on Naive                                                                |
| Per-request `topic`, `time_range`, `include_domains`, `country`, `search_depth`, `exact_match` | —                                                                                          | Not surfaced by Naive `web_search` — see [gaps](#what-does-not-map-yet)                                            |
| Whether an agent may search = a key you hold                                                   | **Account Kit** `search` primitive `enabled: true/false`                                   | Permission is execution-time policy on the identity — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| Account-wide Tavily credits / bill                                                             | Same [credit balance + budget ceiling](/docs/getting-started/billing) as every primitive        | `web_search` costs **0.2 credits**, `read_url` **0.05**; `research` costs 0.5–1.6                                  |
| Tavily usage dashboard (per key)                                                               | Same per-user [activity log](/docs/getting-started/logs) as cards, email, KYC                   | Every query records the acting agent                                                                               |

## Before / after: the core path

The path that matters for almost every agent is *search the web, then read the best result* — the
classic grounding / RAG loop. Here it is on both platforms.

<CodeGroup>
  ```ts Tavily theme={"theme":"css-variables"}
  import { tavily } from "@tavily/core";

  // One account-wide API key. It is unrelated to where this agent's card,
  // inbox, phone, and KYC live — and whether the agent "may search" is a key
  // you hold, not a governed, execution-time decision.
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

  // 1. Search (POST /search)
  const search = await tvly.search("AI agent frameworks comparison 2026", {
    maxResults: 5,
  });

  // 2. Read the top result (POST /extract)
  const top = search.results[0];
  const extract = await tvly.extract([top.url]);
  const content = extract.results[0]?.rawContent ?? "";
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // No dedicated search sub-client yet — call the primitive over REST.
  // The same NAIVE_API_KEY reaches cards, email, phone, vault, and KYC.
  const auth = { Authorization: `Bearer ${process.env.NAIVE_API_KEY}` };
  const json = { ...auth, "Content-Type": "application/json" };

  // 1. Search (POST /v1/search) — `count` maps to Tavily `maxResults`
  const searchRes = await fetch("https://api.usenaive.ai/v1/search", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ query: "AI agent frameworks comparison 2026", count: 5 }),
  });
  const { results } = await searchRes.json(); // [{ title, url, snippet }]

  // 2. Read the top result (POST /v1/search/url) — one URL per call
  const urlRes = await fetch("https://api.usenaive.ai/v1/search/url", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ url: results[0].url, extract: "key takeaways" }),
  });
  const { content } = await urlRes.json();

  // Whether this agent may search at all is its Account Kit's `search` primitive,
  // checked at execution time; each call spends 0.2 credits against the SAME budget
  // ceiling as its cards, email, and phone — and the query is logged against the
  // acting agent.
  ```
</CodeGroup>

The search/read shape lines up closely. The real differences to plan for:

* **`maxResults` → `count`.** Both cap at 20; Naive defaults to 5.
* **Result field rename.** Tavily's per-result `content` snippet becomes `snippet` on Naive; Naive's
  response is `{ title, url, snippet }` and does not include `score` or `rawContent`.
* **`extract` reads one URL.** Tavily's `extract` accepts up to 20 URLs per call; Naive's `read_url`
  takes a single `url` (loop if you have several), plus an optional `extract` focus prompt that
  returns an AI-narrowed `extracted` field.
* **Synthesis is a separate call.** Where you'd set Tavily `include_answer: true`, call Naive
  `POST /v1/search/research` for a cited, multi-source answer (see below).

### The synthesis path

If you were leaning on Tavily's `include_answer` (or wiring search results into your own LLM), Naive's
`research` tool does the multi-step version natively:

<CodeGroup>
  ```ts Tavily (search + your own synthesis) theme={"theme":"css-variables"}
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

  // A quick one-line LLM answer alongside the results.
  const res = await tvly.search("GTM strategies for AI dev tools in 2026", {
    includeAnswer: true, // or compose results with your own LLM
  });
  console.log(res.answer, res.results);
  ```

  ```ts Naive (research synthesizes with citations) theme={"theme":"css-variables"}
  const json = {
    Authorization: `Bearer ${process.env.NAIVE_API_KEY}`,
    "Content-Type": "application/json",
  };

  // `quick` returns inline; `thorough`/`exhaustive` return a job to poll.
  const res = await fetch("https://api.usenaive.ai/v1/search/research", {
    method: "POST",
    headers: json,
    body: JSON.stringify({
      query: "GTM strategies for AI dev tools in 2026",
      depth: "quick",
    }),
  });
  const { summary, sources } = await res.json(); // sources: [{ title, url }]
  ```
</CodeGroup>

## Minimal viable migration

The smallest swap that keeps a working agent running is *search* + *read* (and optionally *research*).

<Steps>
  <Step title="Set your key">
    Use your existing `NAIVE_API_KEY` (a server-side key from the
    [dashboard](https://dashboard.usenaive.ai)). No separate search vendor account or `tvly-...` key
    to provision.
  </Step>

  <Step title="Swap the search call">
    Map `tvly.search(query, { maxResults })` → `POST /v1/search` `{ query, count }`. Read results from
    `results[].snippet` instead of `results[].content`. Drop Tavily-only options
    (`search_depth`, `topic`, `include_domains`, …) — they have no pass-through yet
    ([gaps](#what-does-not-map-yet)).
  </Step>

  <Step title="Swap the extract call">
    Map `tvly.extract([url])` → `POST /v1/search/url` `{ url }`, reading `content` (Tavily's
    `rawContent`). One URL per call — loop for several. Add an `extract` focus prompt to get an
    AI-narrowed `extracted` field.
  </Step>

  <Step title="Swap synthesis (optional)">
    Replace `include_answer` / your own LLM-over-results with `POST /v1/search/research`
    `{ query, depth }`. Use `quick` for an inline `{ summary, sources }`; use `thorough`/`exhaustive`
    for a `202 { job_id }` you poll at `GET /v1/jobs/:id`.
  </Step>

  <Step title="Reach for the CLI where handy">
    The same primitive is on the CLI: `naive search "..."`, `naive search url <url> --extract "..."`,
    and `naive search research "..." --depth thorough --wait`.
  </Step>

  <Step title="Ship it">
    At this point the agent's research path is off Tavily's direct API and onto Naive — same
    provider-backed results, one key. Everything below is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. On Tavily, search is a self-contained account: an API
key, its own credit pool, and its own dashboard — disconnected from the agent's money, comms, and
identity. On Naive, `search` is **one primitive on the same account and Account Kit** that governs the
agent's cards, email, phone, and vault.

<CodeGroup>
  ```ts Tavily (standalone account — search only) theme={"theme":"css-variables"}
  // The tvly key searches; it knows nothing about this agent's money or identity.
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });
  await tvly.search("supplier pricing for Q3", { maxResults: 5 });

  // The card, inbox, phone, and KYC for this customer's agent live elsewhere —
  // separate accounts, separate billing, separate audit — and "may this agent
  // search?" is a key you hold, not a governed decision.
  ```

  ```ts Naive (one governed account — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; the same handle reaches every primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  // Search over the per-user route — gated + metered like the rest.
  await fetch(`https://api.usenaive.ai/v1/users/${acme.id}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NAIVE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "supplier pricing for Q3", count: 5 }),
  });

  // The SAME identity owns this customer's card, inbox, phone, and KYC — one
  // account, one budget, one audit trail, every capability governed by its
  // Account Kit.
  const client = naive.forUser(acme.id);
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "ops" });
  ```
</CodeGroup>

### Gain #1 — one account across primitives

* With Tavily, search is an island behind its own key and credit pool. With Naive,
  `naive.forUser(acme.id)` is a single handle to **search *and* cards *and* email *and* phone *and*
  KYC** — no second vendor account, no `tvly-...` key to provision and rotate, no separate invoice.
* Third-party [connections](/docs/getting-started/connections) (OAuth grants like Slack or Notion) and the
  agent's native primitives sit under **one identity and one Account Kit** — the SaaS the agent
  connected and the web it searches, governed the same way.

### Gain #2 — execution-time permission enforcement

* Whether an agent may search at all is the `search` primitive on the user's **Account Kit**, decided
  **at execution time** — not a key you gate separately from everything else the agent can do.

```ts theme={"theme":"css-variables"}
// This tier's agents get email + cards, but cannot use search at all.
const kit = await naive.accountKits.create({
  name: "No-search tier",
  primitives_config: {
    email: { enabled: true },
    cards: { enabled: true },
    search: { enabled: false }, // search calls are refused with `forbidden`
  },
});
await naive.accountKits.assignUser(kit.id, acme.id);
```

* The agent's code path stays the same for every tier — the same `POST /v1/search`. Whether it runs is
  decided by policy: a user whose Account Kit does not enable `search` is refused with `forbidden`
  (`primitive_disabled_by_kit`), with **no code change** on your side.
* Each `web_search` spends **0.2 credits** (`read_url` 0.05, `research` 0.5–1.6) against the same
  [budget ceiling](/docs/getting-started/billing) as the agent's cards, phone, and LLM calls — so a
  misbehaving agent trips one combined cap, not a separate Tavily limit you monitor on its own.

<Note>
  The `search` primitive is gated by the Account Kit toggle and the budget, but it is **not** frozen for
  human approval by default — unlike money-moving primitives (cards, trading, domains). And it is
  **company-scoped**: the kit gates whether a user's agent may search, but search itself doesn't hold
  per-end-user data to isolate. See [what doesn't map yet](#what-does-not-map-yet).
</Note>

### Gain #3 — unified accountability

* Every query records the **acting agent** and lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside that customer's card spend, email sends, and KYC
  events, not in a separate Tavily usage dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — searches, card spend, email sends, one timeline
```

* That is the question that is hard to answer when queries live in Tavily, cards live in Stripe, and
  the inbox lives somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (search → read → synthesize) maps
cleanly, but the following Tavily capabilities have **no direct equivalent** on Naive's `search`
primitive today. Check this list against your app before you commit.

| Tavily feature                                                                                                                                                                                                                       | Status on Naive                                                                                                       | Workaround                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **`crawl`** (agent-guided site traversal) and **`map`** (sitemap discovery)                                                                                                                                                          | Not supported                                                                                                         | Keep Tavily for crawl/map, or drive traversal yourself from `web_search` + `read_url`        |
| **Per-request search knobs** — `search_depth` (`advanced`/`fast`/`ultra-fast`), `topic` (`news`/`finance`), `time_range`/`start_date`/`end_date`, `include_domains`/`exclude_domains`, `country`, `exact_match`, `chunks_per_source` | Not surfaced — Naive `web_search` takes only `query` + `count`                                                        | Refine within the query text; use Tavily directly if these filters are load-bearing          |
| **`include_images`** / image results                                                                                                                                                                                                 | Not returned by `web_search`                                                                                          | Use the [`images`](/docs/getting-started/images) primitive for image needs                        |
| **`include_raw_content`** on search results + result `score`                                                                                                                                                                         | Not in the Naive search response (`{ title, url, snippet }`)                                                          | Follow up with `read_url` to get page content                                                |
| **Multi-URL `extract`** (up to 20 URLs/call)                                                                                                                                                                                         | `read_url` reads **one** URL per call                                                                                 | Loop over URLs client-side                                                                   |
| **Provider / plan choice + BYO Tavily key**                                                                                                                                                                                          | Naive picks the provider (Tavily, or Brave fallback); you don't select it or supply a `tvly-...` key                  | None — this is by design; keep a direct Tavily account if you need plan-level control        |
| **Session / project tracking headers** (`X-Session-Id`, `projectId`)                                                                                                                                                                 | Not applicable — attribution is Naive's per-user [logs](/docs/getting-started/logs)                                        | Use `naive.forUser(id)` + logs for attribution                                               |
| **Tavily Hybrid RAG** (MongoDB-backed local + web retrieval)                                                                                                                                                                         | Not provided                                                                                                          | Pair `web_search` with your own vector store                                                 |
| **Per-end-user data isolation**                                                                                                                                                                                                      | `search` is **company-scoped** — the kit gates a user's agent access, but there is no per-user search data to isolate | Use a Naive workspace per end-user only if you need hard separation of *other* per-user data |

<Warning>
  The biggest thing to weigh is **parameter surface**, not the core loop. Tavily exposes a rich request
  API — `search_depth`, `topic`, time and domain filters, `crawl`, `map`, Hybrid RAG. Naive's `search`
  primitive deliberately keeps a small surface (`query` + `count` for search, a single `url` for read,
  `depth` for research) and picks the provider for you. If your agent relies on Tavily's `crawl`/`map`,
  domain/time filtering, or plan-level control over the search backend, those are the gaps most likely
  to matter — keep Tavily for that surface, or wait until Naive exposes more knobs. If you just need
  solid grounding — search, read, synthesize — the swap is clean, and the results are Tavily's either
  way.
</Warning>

## Where to go next

* [`search` primitive](/docs/getting-started/search) — full `web_search` / `read_url` / `research` reference, depth levels, and the choose-the-right-tool guide
* [`search` CLI](/docs/cli/search) — `naive search`, `naive search url`, `naive search research`
* [Account Kits](/docs/getting-started/account-kits) — enabling/disabling the `search` primitive per user at execution time
* [Tenant users](/docs/getting-started/users) — the identity that owns search, cards, email, and phone
* [Billing](/docs/getting-started/billing) — the shared credit balance and budget ceiling search spends against
* [Logs](/docs/getting-started/logs) — the unified per-user activity trail every query lands in

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — governed research and search
