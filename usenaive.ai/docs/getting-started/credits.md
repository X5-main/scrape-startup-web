> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Credits

> Usage-based billing — how credits work, costs per operation, sync vs async charging.

## CLI First

```bash theme={"theme":"css-variables"}
# Check usage and buy more credits
naive usage --days 30
naive billing packs
naive billing topup --pack medium
```

## How Credits Work

Every company has a credit balance. Operations deduct credits on use. New accounts are on a 7-day starter trial and receive **20 free credits after verifying their email** — until the verification link sent at signup is clicked, the balance is 0.

<Note>
  **Those free credits buy every primitive except LLM routing.** Chat completions — `POST
    /v1/llm/chat/completions`, `naive llm chat`, the `llm` MCP tool, and the `/v1/proxy/*` drop-in
  passthroughs — require a **paid account**: one credit purchase (`naive billing topup`) or one paid
  subscription (`naive billing subscribe`). Everything else — agents, teams, email, browser, sandbox,
  search, brain, provisioning — runs on the free grant, and `GET /v1/llm/models` and `GET
    /v1/llm/generation` stay free so you can price models before paying.

  It is where the credit came from that decides, not how much of it there is: a comped grant does not
  open routing and a bigger one does not either, while any settled purchase opens it permanently. An
  unpaid routing call answers `402 llm_routing_requires_payment` — its own code, and deliberately not
  `insufficient_credits`, because the balance is not the problem. The body says so in as many words:
  `credit_kind: "trial"`, the `balance`, and a `balance_note` explaining that the balance is not what
  was refused. Routing is metered this way because its marginal cost is a third party's invoice rather
  than our own compute. See [the LLM primitive](/docs/getting-started/llm).
</Note>

## Credit Costs

Each credit is worth **\$0.05 USD**.

### Fixed-Price Operations

| Operation                                                                         | Credits                                                           | Charging                                                                                                         |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Email send                                                                        | 0.016                                                             | Immediately on success (refunded in full if you cancel a scheduled send)                                         |
| Web search                                                                        | 0.2                                                               | Immediately on success                                                                                           |
| URL read                                                                          | 0.05                                                              | Immediately on success                                                                                           |
| Research (quick)                                                                  | 0.5                                                               | Immediately on success                                                                                           |
| Research (thorough)                                                               | 1                                                                 | On job completion (a job that returns no sources and no synthesis fails and is not charged)                      |
| Research (exhaustive)                                                             | 1.6                                                               | On job completion (same no-result rule)                                                                          |
| Brain query (`POST /v1/brain/query`)                                              | 0.08                                                              | Immediately on success                                                                                           |
| Brain think (`POST /v1/brain/think`)                                              | 0.08                                                              | Immediately on success, including when the grounded-document leg is unavailable                                  |
| Brain document ingest (`POST /v1/brain/documents`, `PUT /v1/brain/documents/:id`) | 0.1 + 0.0002 per KB (capped at 10)                                | On successful ingest — size-scaled, so a 2.5 KB page is 0.1005 credits; the response returns the exact `credits` |
| CEO run (pre-check)                                                               | 5                                                                 | Pre-check on run start (downstream LLM/tools billed separately)                                                  |
| SEO keywords (Google/Bing Ads)                                                    | 2 live, 1.5 via task                                              | Immediately on success                                                                                           |
| SEO keywords (Google Trends)                                                      | 0.25 live, 0.2 via task                                           | Immediately on success                                                                                           |
| SEO backlinks                                                                     | 1.8 (17 bulk)                                                     | Immediately on success                                                                                           |
| SEO Labs                                                                          | 0.75 (5.4 bulk, 10 historical)                                    | Immediately on success                                                                                           |
| AEO LLM responses / scraper                                                       | 1.2 / 0.16 (0.08 via task)                                        | Immediately on success                                                                                           |
| AEO AI keywords                                                                   | 0.4 + 0.004 per keyword                                           | Immediately on success                                                                                           |
| AEO LLM mentions                                                                  | 2.4 + 0.024 per returned row                                      | Immediately on success                                                                                           |
| app-data (searches, list, info, reviews)                                          | 0.85 / 0.85 / 0.05 / 6                                            | On task submission                                                                                               |
| app-data app-listings                                                             | 2.4 + 0.024 per listing                                           | Immediately on success                                                                                           |
| business-data (Google info / updates / reviews / Q\&A / hotels)                   | 0.13 / 3 / 1.5 / 0.3 / 0.1                                        | On request or task submission                                                                                    |
| business-data (Trustpilot, TripAdvisor, social)                                   | 0.34–1.25, social 0.1                                             | On task submission                                                                                               |
| ecommerce (Google Shopping, Amazon)                                               | 0.04–2.2 by endpoint                                              | On task submission                                                                                               |
| Clips: create                                                                     | per finished clip + per input minute                              | On completion, from metered actuals — no flat fee                                                                |
| Social post                                                                       | 2.5 base (+0.5 if it targets X, +5 if that X post carries a link) | Immediately on successful publish; drafts are free                                                               |
| SMS send (phone)                                                                  | provider cost × 2                                                 | Immediately on success                                                                                           |
| Phone number provision                                                            | provider cost × 2                                                 | On success (irreversible, approval-gated)                                                                        |
| Stock photo search                                                                | 0                                                                 | Free                                                                                                             |
| Browser session open                                                              | 0                                                                 | Free (time floor billed at close)                                                                                |
| Browser navigate / links / screenshot                                             | 0.05 each                                                         | Immediately per action (no model call)                                                                           |
| Browser act / extract / observe                                                   | 1.7 each                                                          | Immediately per action (one model call each)                                                                     |
| Browser autonomous signup                                                         | 8.5                                                               | On success (approval-gated) — 5 model steps                                                                      |
| Browser autonomous login                                                          | 5.1                                                               | On success — 3 model steps                                                                                       |
| Browser session time floor                                                        | 0.25–1.5                                                          | At close, by elapsed time (≤5 / ≤15 / ≤30 min), then 0.1 credits/min past 30                                     |
| Mobile agent task                                                                 | 0.4 per step of the requested budget                              | On dispatch (`max_steps`, default 25)                                                                            |

<Note>
  SEO / AEO / queue are additionally metered against your **plan quota** (a separate
  per-primitive counter surfaced at `GET /v1/users/:id/billing/usage`) on top of the
  credit charge above.
</Note>

### Infrastructure (duration-metered)

Anything that runs a **server you keep alive** is billed by time, not per call —
metered by a background scheduler (\~every 2 minutes). An idle/stopped resource
accrues nothing.

| Resource                                                                  | Action type      | Rate (default)                                                                                                           | What's billed                                                        |
| ------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Compute** (`compute` primitive — your managed compute tasks & services) | `compute_usage`  | 1.7 credits / vCPU-hour + 0.18 credits / GB-hour                                                                         | While a run is `running` or a service has `desiredCount > 0`         |
| **Hosted runtime** (a Naïve-hosted agent profile agent / `runtime.start`) | `runtime_usage`  | 1.7 credits / vCPU-hour + 0.18 credits / GB-hour                                                                         | While **your** agent profile's Hermes container is `running`         |
| **Managed Postgres** (Path A `cloud.postgres` / `database` primitive)     | `database_usage` | not currently metered (planned \~0.3 credits / hour per project)                                                         | While the database project is `ready` (data persists after teardown) |
| **Web hosting** (Path A `cloud.web` / `apps` deploy)                      | `web_usage`      | not currently metered (planned \~0.15 credits / hour per project)                                                        | While the web deployment is `ready` (not suspended)                  |
| **Object storage** (Path A `cloud.bucket` / `storage` primitive)          | `storage_usage`  | not currently metered (planned \~0.02 credits / hour per bucket)                                                         | While the bucket is `ready`                                          |
| **Mobile** (`mobile` primitive — cloud phones)                            | `mobile_usage`   | 3 credits / device-minute (+2 while a Mobilerun Connect proxy is attached)                                               | From provision until `terminate` (no idle auto-stop)                 |
| **Sandbox** (`sandbox` primitive — micro-VMs)                             | `sandbox_usage`  | 0.6 credits / vCPU-hour + 0.32 / GiB-hour RAM + 0.0175 / GiB-hour disk, plus a one-time creation fee (`s` 0.2 / `m` 0.4) | Observed usage while `running`; free while parked/asleep             |

* The hosted-runtime container is `1 vCPU / 2 GB` by default, so a continuously-running
  hosted agent costs ≈ `1.7 + (2 × 0.18) = 2.06 credits/hour` (\~$0.10/hr at $0.05/credit).
* Only **claimed** containers (your agent profile's) are billed. The shared warm pool that
  keeps start-up latency low is **platform overhead and is never charged to you**.
* Bring-your-own-runtime (you run the agent in your own harness with `agentProfile.tools()`)
  incurs **no** `runtime_usage` — you only pay for the API primitives the agent calls.
* A claimed hosted container bills the same whether busy or idle (the task is up), so
  tear agent profiles down with `revoke()` when done — revoke releases the slot immediately.
* **Path A infrastructure is duration-metered, not per-operation.** Provisioned managed
  Postgres, web hosting, and object-storage buckets cost us a recurring vendor fee for as
  long as they exist, so each is billed by time while `ready`. The queries, HTTP requests,
  and object operations against them are **free** — you pay for the running resource, not
  per call. `naive down` tears a resource down and stops its meter.
* **The three Path A rates above are not switched on yet.** The meter ships at a rate of
  `0` for managed Postgres, web hosting and object storage, so a `ready` resource accrues
  no `database_usage` / `web_usage` / `storage_usage` today. The rates in brackets are what
  each is expected to cost when metering begins; we will announce pricing before any of
  them starts charging. The credit gate on provisioning and the out-of-credit suspension
  sweep both run regardless.

<Note>
  **Path A infrastructure is credit-gated.** Provisioning via `naive up` (managed
  Postgres, object storage buckets, web hosting) is blocked when your credits are
  exhausted, and when you run out, running infra is suspended: **web deployments are
  disabled** and the **hosted runtime is stopped** by its meter. Managed Postgres and
  bucket **data persists** (a stored resource can't be "paused"), so it keeps metering
  until you tear it down — top up to re-enable web and resume; new provisioning unblocks
  immediately. Self-service `compute` tasks/services are **not** auto-stopped on exhaustion;
  their meter simply keeps debiting the (now-negative-gated) balance until you stop them.
</Note>

### LLM Calls

There are two ways LLM usage is billed, both per-token and deducted after the call completes (after the final SSE event for streams):

* **The `llm` primitive & OpenRouter proxy** (`POST /v1/llm/chat/completions`, `naive.llm.chat()`, and the `/v1/proxy/openrouter/*` drop-in). These route through [OpenRouter](https://openrouter.ai), which returns the exact USD cost of each call. Naive bills that returned `usage.cost` × markup, converted to credits — so there's no per-model rate table and pricing always tracks OpenRouter. See the [LLM primitive](/docs/getting-started/llm).
* **Orchestration LLM calls** (CEO agent / employees). These flow through the Anthropic/OpenAI/Google proxies and are billed per-token using the rates below, with cache read tokens billed at a discount and cache creation at a premium.

Both of those are LLM routing, and both need a **paid** balance — see the note at the top of this page. Every other line in the tables above and below is payable from the free signup credits.

Orchestration is the one place that distinction is not obvious, because those calls travel the same provider proxies a customer can call directly. Work the hosted runtime dispatches to an agent is **exempt**: it authenticates with a credential the control plane issued, which no customer request can present, so a running team is unaffected. The **CEO gateway is not exempt** — it runs on the ordinary company key with no dispatched run behind it, and is therefore indistinguishable from a customer's own call. On an account that has never paid, `naive ceo run` starts and its first model call is refused. Buy credits or subscribe before starting one.

### Audio Calls

The [`audio` primitive](/docs/getting-started/audio) bills the same way — exact reported USD cost × markup, converted to credits:

| Modality         | Endpoint                          | Billed by                                             |
| ---------------- | --------------------------------- | ----------------------------------------------------- |
| Speech to text   | `POST /v1/audio/transcriptions`   | Audio duration, after the endpoint's billing rounding |
| Text to speech   | `POST /v1/audio/speech`           | Input characters                                      |
| Speech to speech | `POST /v1/audio/speech-to-speech` | Audio seconds in and out, plus tokens where reported  |

Catalog, usage, and route-trace reads are free. Async transcriptions are charged once on the first poll that observes `succeeded` (keyed on the transcription id — no double-charge). Synthesis charges settle from the usage row after the audio streams. Very short calls can round below credit precision and cost nothing.

Every rate below is the provider's own list price × 1.25, converted at \$0.05/credit.

**Anthropic**

| Model                                              | Input (per 1M tokens) | Output (per 1M tokens) |
| -------------------------------------------------- | --------------------- | ---------------------- |
| Claude Opus 5 / 4.8 / 4.7 / 4.6 / 4.5              | 125 credits           | 625 credits            |
| Claude Opus 4.1 / 4                                | 375 credits           | 1875 credits           |
| Claude Fable 5 / Mythos 5                          | 250 credits           | 1250 credits           |
| Claude Sonnet 5 (introductory, through 2026-08-31) | 50 credits            | 250 credits            |
| Claude Sonnet 5 (from 2026-09-01)                  | 75 credits            | 375 credits            |
| Claude Sonnet 4.6 / 4.5 / 4                        | 75 credits            | 375 credits            |
| Claude Haiku 4.5                                   | 25 credits            | 125 credits            |
| Claude Haiku 3.5 (`claude-3-5-haiku-*`)            | 20 credits            | 100 credits            |

**OpenAI**

| Model                     | Input (per 1M tokens) | Output (per 1M tokens) |
| ------------------------- | --------------------- | ---------------------- |
| GPT-5.6 Sol               | 125 credits           | 750 credits            |
| GPT-5.6 Terra             | 62.5 credits          | 375 credits            |
| GPT-5.6 Luna              | 25 credits            | 150 credits            |
| GPT-5.5                   | 125 credits           | 750 credits            |
| GPT-5.5 Pro / GPT-5.4 Pro | 750 credits           | 4500 credits           |
| GPT-5.4                   | 62.5 credits          | 375 credits            |
| GPT-5.4 Mini              | 18.75 credits         | 112.5 credits          |
| GPT-5.4 Nano              | 5 credits             | 31.25 credits          |
| GPT-5.2                   | 43.75 credits         | 350 credits            |
| GPT-5.2 Pro               | 525 credits           | 4200 credits           |
| GPT-5.1 / GPT-5           | 31.25 credits         | 250 credits            |
| GPT-5 Pro                 | 375 credits           | 3000 credits           |
| GPT-5 Mini                | 6.25 credits          | 50 credits             |
| GPT-5 Nano                | 1.25 credits          | 10 credits             |
| GPT-4.1                   | 50 credits            | 200 credits            |
| GPT-4.1 Mini              | 10 credits            | 40 credits             |
| GPT-4.1 Nano              | 2.5 credits           | 10 credits             |
| GPT-4o                    | 62.5 credits          | 250 credits            |
| GPT-4o Mini               | 3.75 credits          | 15 credits             |
| o3                        | 50 credits            | 200 credits            |
| o3 Pro                    | 500 credits           | 2000 credits           |
| o3 Mini / o4 Mini         | 27.5 credits          | 110 credits            |

**Google**

| Model                     | Input (per 1M tokens) | Output (per 1M tokens) |
| ------------------------- | --------------------- | ---------------------- |
| Gemini 3.6 Flash          | 37.5 credits          | 187.5 credits          |
| Gemini 3.5 Flash          | 37.5 credits          | 225 credits            |
| Gemini 3.5 Flash-Lite     | 7.5 credits           | 62.5 credits           |
| Gemini 3.5 Live Translate | 87.5 credits          | 525 credits            |

Cache reads are billed at the provider's cache-read rate (a fraction of the input
rate) and cache writes at 1.25× the input rate.

<Note>
  **Models not in this table cannot be served on the direct proxies.** If a model is
  not listed, Naive first looks up the provider's real per-token price via
  OpenRouter's catalogue and bills that × 1.25. If no published price can be found,
  the request is rejected with `400 unpriceable_model` rather than billed at a
  guessed rate — a request that cannot be priced is never served. The `llm`
  primitive and the OpenRouter drop-in are unaffected: they bill the exact cost
  OpenRouter reports, whatever the model.
</Note>

LLM costs are deducted automatically after each API call completes. For streaming responses, usage is extracted from the final SSE event and deducted post-stream. Built-in web search tool use is also billed when used.

### Dynamic-Price Operations (Image/Video Generation)

Image and video generation costs are **model-dependent** and calculated dynamically. Use the pricing endpoints to preview costs before submitting:

```bash theme={"theme":"css-variables"}
GET /v1/images/pricing?model=fal-ai/flux/schnell&num_images=2
GET /v1/video/pricing?model=fal-ai/kling-video/v3/pro/text-to-video&duration=5
```

Response:

```json theme={"theme":"css-variables"}
{
  "model": "fal-ai/flux/schnell",
  "estimated_credits": 0.24,
  "unit_price_usd": 0.003,
  "credit_value_usd": 0.05
}
```

`unit_price_usd` is fal.ai's live price for that model in its own billing unit
(per megapixel for `flux/schnell`, per image or per second elsewhere); the credit
charge is that price × quantity × 2, with a 0.1-credit floor. Prices are read
live per request, so a model whose price fal changes is billed at the new price
with no release on our side. If fal cannot price a model at all, generation is
rejected rather than billed at an assumed rate.

## Two different "budgets" — don't confuse them

Naïve has **two independent ledgers**. Keep them straight:

|                     | **Platform credits**                                       | **AgentProfile budget**                                   |
| ------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Question it answers | "What do I owe Naïve for usage?"                           | "How much real-world money may this agent spend?"         |
| Unit                | Credits (\$0.05 each)                                      | USD cents                                                 |
| Ledger              | `credit_transactions` (company-wide)                       | `tenant_spend_events` (per agent profile)                 |
| Covers              | LLM, search, email, images, compute, **hosted runtime**, … | Card top-ups, trading notional, metered primitive usage   |
| Set by              | Your plan + top-ups                                        | An agent profile template's `policy.budget`               |
| Enforced by         | `checkCredits` (402 `insufficient_credits`)                | The governance gateway (`403 budget_exceeded` / approval) |

An agent profile's `budget.cap` is a **combined cost ceiling**: it caps the agent profile's
real-world spend (cards/trading) **plus** the platform credits it burns (LLM, search,
compute, hosted runtime — counted at \$0.05/credit) against one number. It is still
distinct from your company-wide Naïve credit balance (the budget is per agent profile, in
USD). A **hard** cap denies over-budget actions (and auto-stops the agent profile's hosted
runtime); a soft cap routes them to approval. See [IaC policy](/docs/getting-started/iac)
and the [Governance Gateway](/docs/architecture/governance-gateway).

A card's **spending limit is not spend**. Issuing a card is still *gated* on its
limit — a $250 card is refused, or routed to approval, under a $50 cap, because the
limit is what the card puts at risk — but the limit itself is never written to
`tenant_spend_events`. Only money that actually moves is: top-ups, trading notional,
card swipes and metered primitive usage. A $50 card issued and never used therefore
leaves the agent profile's spend at $0, and cancelling it changes nothing, because
nothing was charged.

### Running out of credits

When a company's credit balance is exhausted, new API calls return `402
insufficient_credits` and **hosted-runtime containers are automatically stopped** by
the meter (a `runtime.stopped` event with `reason: out_of_credits`) — so a
non-paying account stops incurring cloud cost. Top up or upgrade to resume.

## Sync vs Async Charging

**Synchronous operations** (email, search, URL read, quick research):

* Credits deducted immediately when the operation succeeds
* If it fails, no credits are charged

**Asynchronous operations** (images, video, thorough research):

1. On submission: pre-check that balance ≥ estimated cost (returns `402` if not)
2. Job runs in background
3. On success: credits deducted and transaction recorded
4. On failure: no charge

<Info>
  Concurrent async jobs can temporarily exceed your balance since pre-checks pass independently. The balance may go slightly negative — subsequent submissions will be blocked once balance drops below threshold.
</Info>

## Checking Your Balance

```bash theme={"theme":"css-variables"}
GET /v1/status
```

Returns your current balance, tier, and resource counts.

## Usage History

```bash theme={"theme":"css-variables"}
GET /v1/usage?days=30&limit=50
```

Returns transaction history with action type, amount, and reference IDs. Every charge
type appears here keyed by `action_type` — e.g. `llm_call`, `audio_call`, `web_search`,
`email_send`, `job_completion`, `compute_usage`, `runtime_usage`,
`subscription_renewal`, `credit_topup`. The dashboard's
`GET /v1/dashboard/usage-summary` groups the same ledger by `action_type` so you can
see exactly where credits went (including infrastructure time).

## Credit Responses

Every operation that costs credits includes the charge in its response:

```json theme={"theme":"css-variables"}
{
  "credits_used": 10,
  "credits_remaining": 990
}
```

For async jobs, the estimated cost is shown on submission:

```json theme={"theme":"css-variables"}
{
  "job_id": "uuid",
  "estimated_credits": 20,
  "hint": "Credits charged on completion only."
}
```

## Credit Enforcement

All billable operations check your credit balance before executing. When your balance drops to zero or below:

* **API primitives** (email send, search, URL read) return `402 insufficient_credits`
* **CEO runs** are blocked with a credit pre-check (5 credits)
* **LLM proxy calls** from the container are rejected, stopping agent work
* The balance stops at zero. A settlement that arrives for more than the wallet holds — a
  metered charge nobody could pre-check, like an LLM call priced after the tokens are served —
  empties it to exactly `0.0000` and the remainder is forgiven. You are never billed into debt.

Credits are enforced at every layer — the API, the LLM proxy, and individual primitive endpoints.

## Running Low on Credits?

When your balance hits zero, operations fail with an `insufficient_credits` error that includes available credit packs. You can buy more anytime:

```bash theme={"theme":"css-variables"}
# See available packs
naive billing packs

# Buy credits
naive billing topup --pack medium   # 500 credits for $23
```

Or upgrade your plan for more monthly credits:

```bash theme={"theme":"css-variables"}
naive billing upgrade --plan pro    # 400 credits/mo
```

See [Billing & Credits](/docs/getting-started/billing) for full details on plans and pricing.

## Configuration reference (rates & metering)

The credit value and the duration-meter rates are deployment configuration. On the
managed cloud these use the defaults below; self-hosters can override them via
environment variables.

| Setting            | Env var                               | Default         | Notes                                                                              |
| ------------------ | ------------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| Credit value       | —                                     | \$0.05 / credit | Retail value used across the rate tables.                                          |
| Compute vCPU rate  | `NAIVE_COMPUTE_CREDITS_PER_VCPU_HOUR` | `1.7`           | `compute` primitive duration meter.                                                |
| Compute GB rate    | `NAIVE_COMPUTE_CREDITS_PER_GB_HOUR`   | `0.18`          | `compute` primitive duration meter.                                                |
| Runtime vCPU rate  | `NAIVE_RUNTIME_CREDITS_PER_VCPU_HOUR` | `1.7`           | Hosted-runtime (Hermes) duration meter.                                            |
| Runtime GB rate    | `NAIVE_RUNTIME_CREDITS_PER_GB_HOUR`   | `0.18`          | Hosted-runtime (Hermes) duration meter.                                            |
| Hosted task size   | `ORCH_TASK_CPU` / `ORCH_TASK_MEMORY`  | `1024` / `2048` | vCPU-millis / MB of the orchestration task; used to compute runtime vCPU/GB-hours. |
| LLM markup         | —                                     | ×1.25           | Applied to OpenRouter's returned USD cost.                                         |
| Audio markup       | —                                     | ×1.25           | Applied to the audio request's returned USD cost.                                  |
| Image/Video margin | —                                     | ×2.0            | Applied to the live fal.ai price.                                                  |

Both duration meters tick every \~2 minutes, key each charge to a time window
(`<resource_id>:<windowStart>`) so a double-tick can't double-charge, and cap a
single tick's back-charge at 3 intervals if the scheduler was paused. Compute is
gated on `NAIVE_COMPUTE_*`; hosted-runtime metering is gated on `ORCH_CLUSTER`
(hosted runtime being enabled at all).
