# Naïve — Agent Onboarding Manifest (skill.md)

> Naïve gives every AI agent a **governed identity and a governed place to run**: a verified business identity (KYB/EIN), a spend-capped card, an inbox and a phone number, 51 governed primitives, a company brain, and a durable runtime — declared as code, provisioned per customer, decided on every action, and instantly revocable. One API key, one credit balance, one CLI/SDK/MCP. This manifest tells you, the agent, how to onboard a human operator and operate safely.

> **Read the whole file before you run anything.** In particular read *What is served today*: parts of the current surface are declared and typed but not yet served by this control plane, and the manifest names exactly which.

## Read first — how to operate (rules for the agent)

You are onboarding a human **operator**: the person who holds the account and writes the config. Follow these rules in order; do not skip them.

1. **Authenticate *with* the operator — never invent credentials.** Ask whether they want to **log in** to an existing account or **register** a new one. Ask for the exact values, confirm them, then run the matching command. Never guess an email, a password or a key, and never log or echo a key.
2. **Clarify scope before you declare anything.** Ask which primitives they want, which **teams** of agents, and for which **tenants** (their end customers). Grant only what they ask for. The capability default is `deny` and `default: "allow"` does not compile, so nothing is granted by omission — but everything you *do* write down is real.
3. **Get explicit operator approval before real-world or spending actions.** Issuing or charging a card, forming a company, provisioning a phone number, buying a domain, sending email or SMS, connecting a third-party account, and erasing a belief are real and often irreversible. Confirm first. Naïve *also* decides this server-side and can hand the action back parked for a named human.
4. **Verify before you promise.** Parts of the current surface are declared and addressable but not yet served by this control plane. Read the *What is served today* section below, and run `naive teams plan <team> --tenant <id>` — the honesty report — before you tell an operator a control is enforcing something. It prints, per field, what it cannot report and why.
5. **Never build a second source of truth.** Do not write your own policy check, your own allowlist, your own budget arithmetic or your own approval queue. Each exists, is decided in one place and is recorded in one ledger. Duplicating one is how a governed agent becomes an ungoverned one.
6. **Be idempotent.** Provisioning is async and idempotent: pass an `idempotencyKey`, then poll status rather than re-issuing.
7. **Show every URL Naïve returns to the operator verbatim — never shorten, truncate, reformat or re-host it.** Checkout links (Stripe), asset links, portal links and signed URLs are long and every character is load-bearing; a trimmed or "cleaned up" link 404s. Copy the full `checkout_url` / `portal_url` / asset URL exactly as returned.

## Onboarding

The whole flow, at a glance — each step is expanded below:

1. **Authenticate** with the operator (log in, register, or paste an existing key).
2. **Choose a surface** (CLI, server SDK, in-agent `self`, MCP, or raw REST) — and ask the operator whether the agent's own inference should run through Naïve's `llm` primitive or stay on their own provider key. Ask it **before** you build anything on the router: it is the one primitive the free signup credits do not buy.
3. **Verify connectivity** (`/health`, then `naive status`).
4. **Declare** — write `naive.config.ts` (company, brain, governance, teams) and `naive up`.
5. **Create a tenant** (`naive users create`) and address every teams call to it.
6. **Read the honesty report** (`naive teams plan`) before you claim anything is enforcing.

### Step 1 — authenticate with the operator (ask: log in, or register?)

Keys look like `nv_sk_live_…`, come from https://dashboard.usenaive.ai, and are server-side secrets.

- **Existing API key** — ask them to paste it, then `export NAIVE_API_KEY=nv_sk_live_…` (the CLI and both SDKs read this).
- **Log in** — `naive login --email "<email>" --password "<password>"` (writes `~/.naive/config.json`).
- **Register** (new account) — `naive register --name "<name>" --email "<email>" --password "<password>"`. The account starts at **0 credits**: the 20 free credits are granted only after the operator clicks the verification link sent to their email. Tell the operator to check their inbox before running any priced command — until they verify, priced calls answer `insufficient_credits`.
  🔴 **Verifying does not open everything. The 20 free credits buy every primitive except the `llm` router** — see *The one primitive the free credits do not buy* in Step 2. If the operator's goal is model routing, tell them at REGISTRATION that it needs a purchase, rather than discovering it after a verification round trip.
- **Passwordless** — `naive auth email "<email>"` starts a magic-link flow and saves the resulting key.

### Step 2 — install and choose a surface

**CLI** — terminal and agentic use. Every command prints structured JSON with `next_steps`:

```bash
npm install -g @usenaive-sdk/cli
export NAIVE_API_KEY=nv_sk_live_…
naive status                        # verify auth + remaining credits
```

**Server SDK** — embed in your app:

```ts
import { createClient, NotImplementedError } from "@usenaive-sdk/server";

const naive = createClient({ apiKey: process.env.NAIVE_API_KEY! });

// A team is a PAIR. `team()` names the team; `forTenant()` chooses the customer
// and VERIFIES the tenant exists before returning — it never mints one.
const support = await naive.team("support").forTenant("cus_123");

// The run ledger for THIS (team, tenant). Keyset-paged — `{items, next_cursor}`,
// the one pagination envelope the runtime surface uses. It reads
// `/v1/teams/support/tenants/cus_123/runs`. The company-wide ledger is a
// different collection at `GET /v1/runs`, and this client has NO accessor for
// it — `"runs" in naive` is false. The shipped prototype is brain, teams, team,
// forTenant, forUser, self. Reach /v1/runs over HTTP until it grows one.
const { items, next_cursor } = await support.runs.list({ limit: 20 });
console.log(items.length, "runs", next_cursor ? "(more)" : "(all)");

// The company brain, scoped by the credential — no knowledge-base id, no
// partition and no lane is accepted, so reading someone else's scope is
// unwritable rather than merely refused. `attach` is the ambient-context read a
// turn opens with.
const capsule = await support.brain.attach({ goal: "answer the refund question" });

// A governed erase is a DECISION, not a boolean. `park` is a VALUE you inspect;
// only `deny` and `unavailable` throw.
const erased = await support.brain.forget({ scope: "claim", scope_ref: "B7" });
if (erased.decision === "park") {
  console.log("waiting on a human:", erased.approvalId, erased.message);
}

// A method whose route this control plane does not mount REFUSES by name and
// sends nothing. It never returns `{}` and never guesses a route.
try {
  await support.submit({ goal: "clear the overnight backlog" });
} catch (e) {
  if (e instanceof NotImplementedError) console.log(e.message);
}
```

<!-- printed from packages/lp/src/examples/sdk-client.ts, which the compiler checks. Do not hand-edit. -->

A team is addressed as a **pair**: `naive.team(name)` names the team, `.forTenant(id)` chooses the customer and verifies that tenant exists before returning — it never creates one. The agent handle is *derived*: naming `tier1` narrows your intent, not your authority. Every call still travels on the company credential.

**In-agent** — inside a turn running on Naïve, the handle is `self`, from `@usenaive-sdk/runtime`. See *The brain* below for the worked example.

**MCP** — hand tools to an MCP-native agent: SSE at `https://api.usenaive.ai/mcp/sse`, header `Authorization: Bearer nv_sk_…`. The tool list is resolved per tenant, so a tool the tenant's kit disables is not listed. A governance refusal comes back as a structured envelope with a verdict, the layer that decided, and recovery steps — follow the steps; do not re-send the same call.

Claude Code / Cursor require `"type": "sse"` — without it Claude skips the server:
```json
{
  "mcpServers": {
    "naive": {
      "type": "sse",
      "url": "https://api.usenaive.ai/mcp/sse",
      "headers": { "Authorization": "Bearer nv_sk_..." }
    }
  }
}
```

**MCP is governed, but not identically to REST — do not tell an operator the two are interchangeable.** Every tool call runs the same tail as an HTTP request (scope → revoke → kit → budget scope), and the tenant and kit are re-read per call, so revoking a tenant or switching a primitive off lands mid-session. Two things are narrower here, and both are load-bearing when you write a policy: most tools assert **no** kit primitive at all, so switching a primitive off stops the tools that name it and not the rest; and the capability allow-list and approval requirement are consulted only by the tools that route through the approval guard — the money and identity verbs (cards, trading, formation, verification, domain purchase, phone/mobile provisioning, compute, browser signup, connections, email send) plus the destructive brain verbs. A `can` rule you write about search or image generation is enforced on the REST route and not on the matching tool. If a rule must hold everywhere, put the capability behind a primitive the kit can switch off, and say so to the operator.

**REST** — base `https://api.usenaive.ai`, header `Authorization: Bearer nv_sk_…`.

🔴 **Naïve is a layer you CALL. It is not a model endpoint you RUN ON — do not repoint your own harness at it.** `POST https://api.usenaive.ai/v1/messages` **is not mounted** and answers `404`. There is no Anthropic Messages API here, so a client that speaks that shape — Claude Code, the Claude Agent SDK, anything driven by `ANTHROPIC_BASE_URL` — cannot be pointed at Naïve at all. **The blocker is the API SHAPE, not streaming.** What Naïve serves is an OpenAI/OpenRouter-shaped chat completion — `POST /v1/llm/chat/completions`, or `POST /v1/users/<tenant>/llm/chat/completions` to bill and gate it against one tenant — plus a transparent passthrough at `/v1/proxy/openrouter/*`. All of them **do** stream: with `stream: true` the provider's SSE stream is piped straight through and billed once it closes. If a doc tells you the LLM surface is non-streaming, that doc is wrong too. **And all of them require a paid account** — read *The one primitive the free credits do not buy*, immediately below, before you plan any work on them.

**Where the shape does match, whose inference runs through Naïve is the operator's choice — ask them, do not decide for them.** Put the question plainly: *“Would you like your agents' inference to run through Naïve's `llm` primitive? Naïve automatically optimizes execution — routing across 300+ models with fallbacks, one bill on your Naïve credits, metered per tenant and governed by your spend caps — or I can keep inference on your own provider key. It is the one primitive that needs a paid account: the free signup credits do not buy model routing.”* Then give them the honest trade so the yes is informed: through Naïve, every token settles against **their** credit balance at provider cost plus markup, there is one extra network hop, and **the balance it settles against has to be a paid one**; on their own key they keep their existing provider bill and skip the hop, but lose the per-tenant metering, the spend caps and the routing. Whatever they choose, the `llm` primitive is the priced-and-metered call for the inference **the agent you are building** does on the operator's behalf, on the operator's budget, under the operator's governance. The one thing you never do is route your own loop through it silently: on a starter balance that is the operator's whole balance, spent without a yes.

#### 🔴 The one primitive the free credits do not buy — `llm` needs a paid account

The 20 free signup credits run every other primitive on this platform: teams, the brain, email, browser, sandbox, search, storage, provisioning, every read. **Model routing is the exception.** A company whose entire balance is free credit — the signup grant, or credit a human comped it — cannot spend that credit on LLM routing.

- **What that covers:** chat completions in every shape they are served — `POST /v1/llm/chat/completions`, the per-tenant `POST /v1/users/<tenant>/llm/chat/completions`, `naive llm chat`, the `naive_llm_chat` MCP tool, and the drop-in passthroughs under `/v1/proxy/openrouter/*`, `/v1/proxy/openai/*`, `/v1/proxy/anthropic/*` and `/v1/proxy/google/*`. **Pointing an OpenAI client's `baseURL` at the proxy is the same product and meets the same refusal** — it is not a way around this, and reaching for it is the mistake this bullet exists to prevent.
- **What it does not cover:** `GET /v1/llm/models` and `GET /v1/llm/generation` are free and ungated, so you can browse models, quote prices and plan a config for an operator who has not paid yet. And every other primitive keeps working on the free grant — this is one gate, not a paywall over the platform.
- **What counts as paid:** one completed credit purchase (`POST /v1/billing/topup`) or one paid subscription (`POST /v1/billing/subscribe`). Either one opens routing permanently — it is a property of the account, not a balance you have to keep above a line, and it survives the balance being spent back down to zero (at which point you are back to ordinary `insufficient_credits`, which a top-up does fix). A third door exists and is not yours to open: an operator at naive can entitle a workspace by hand, which is how internal and specially-arranged accounts are handled. If the operator believes they are on such an arrangement, that is a `naive support` question, not something to retry into.
- **What does not count, and do not try it:** the signup grant, re-sending the verification email, or a support-comped grant. The rule reads where the credit CAME FROM, not how much of it there is, so more free credit is never the fix.
- **What is exempt:** work naive's own hosted runtime does on the operator's behalf. Those calls are recognised by a server-side credential your requests cannot present, so a team already running is not affected by this. You never have to arrange that exemption and you cannot claim it.

The refusal has **its own error code** — not `insufficient_credits`, and not `billing_blocked`. That is the whole point of it: both of those mean *get more credit*, which here is the one action that provably cannot work. Match on the code (or on `block_reason`, which carries the same string), never on the message:

```json
{
  "error": {
    "code": "llm_routing_requires_payment",
    "block_reason": "llm_routing_requires_payment",
    "message": "Free trial credit cannot be spent on LLM routing. Every other primitive accepts it — model routing needs a paid account.",
    "credit_kind": "trial",
    "balance": 20,
    "balance_note": "The balance of 20 credits is not the problem. Free and comped credit cannot pay for model routing, however much of it there is.",
    "actions": {
      "topup": "POST /v1/billing/topup with { pack_id: 'small' }",
      "subscribe": "POST /v1/billing/subscribe with { plan: 'pro' }",
      "view_plans": "GET /v1/billing/plans"
    }
  }
}
```

Note `balance: 20` sitting beside the refusal. That is deliberate and it is the one thing most likely to confuse you: the account HAS credit and was still refused. `balance_note` says so in words. Do not read the number as an invitation to spend it here.

**On the CLI this arrives as a decision, not an error — and the difference is the whole contract.** `naive llm chat` intercepts the 402 and emits a `decision_required` envelope with **exit code 4** (not 1), carrying `error.retryable: false`, the question in the operator's words, and `decision.options` — `topup`, `subscribe`, `not_now` — each with the exact command that takes it. `recovery_steps` deliberately contains **only reads** (`naive billing packs`, `plans`, `status`); the purchases live in `decision.options` precisely so that an agent which habitually runs `recovery_steps` cannot start a payment nobody authorised.

**So handle it like this, in one round trip:**

```bash
naive billing packs                  # one-time credit packs and their prices
naive billing plans                  # subscription options
naive billing status                 # the balance and plan actually on the account
```

🔴 **Then stop and ask the operator.** Exit 4 means *a human has to choose*, and both ways out spend real money on different terms — one recurring, one not. `naive billing topup` and `naive billing subscribe` return a Stripe `checkout_url` and neither completes a payment, so you could not clear this yourself even if you were allowed to (and rule 3 says you are not). Show the operator the options, run the command they pick, hand them the full URL **verbatim** (rule 7 — every character is load-bearing), and stop. When they say they have paid, `naive billing status` confirms it and the same call now succeeds.

**If the operator does not want to pay, say so plainly and keep going.** Their agents can still run on their own provider key — that is the second half of the question above — and nothing else in this manifest is affected. What you must not do is describe the platform as unusable, retry the router on a schedule, or route the work through a proxy path hoping it is ungated.


### Step 3 — verify connectivity

- No-auth health check: `GET https://api.usenaive.ai/health` → `{"status":"ok"}`.
- Authenticated routes answer `401 unauthorized` without a valid key — `"No session cookie or Authorization header"` when none was sent, `"Invalid API key"` when one was sent and rejected. A bare `401` means you **reached** the server; it is not a network failure.
- `403 enforcement_unavailable` means something different and specific: the decision engine is not answering, and gated actions fail closed by design. Do not retry in a loop. Surface it.
- Once authenticated, `naive status` confirms auth and remaining credits.

## Core concepts — the words, and only these words

Naïve uses one word per concept. If you find two words for one thing anywhere, that is a defect: report it, do not pick one.

- **organization** — the billing and policy root. Not a legal entity, not a runtime. `company` is its wire name: `/v1/organization` and `/v1/company` are one route under two spellings, and the column stays `company_id`.
- **operator** — the human who holds the account and writes the config.
- **project** — a scope inside the organization owning its account kits and child projects. Selected by `/v1/projects/<id>/…`, the `X-Naive-Project-Id` header or a key's pin, and every organization has a **default project** a request that names none resolves to — which is why nothing written before projects existed had to change. `naive projects use <id>` selects one; `.forProject(id)` is the SDK twin.
- **deployment namespace** — the `project:` key of `naive.config.ts` (and each entry of its `projects:` block), which names the namespace `naive up` applies infrastructure, runtime pools, agent roles and templates under. It is spelled `project` in the config file and in brain `scope: "project"`, but it is NOT a `projects` row: one is a string you choose, the other a uuid the API issues. Declaring several is how one file describes several projects of one organization.
- **child project** — the operator's end customer, and the noun `tenant` names on the wire. Every primitive acts on a tenant, and `--tenant` is required on 27 of the 28 `naive teams` subcommands. You **create** one with `naive users create --external-id <your-id> --label <name>` (`POST /v1/users`); nothing creates one implicitly — `.forTenant(id)` verifies a tenant exists and never creates it. Then `naive use <id>` selects it, or pass `--tenant <id>` per command.
- **agent** — one governed worker identity. Not a person, not a process.
- **role** — the *declaration* of an agent, written with `agent({…})`. Its name is the key it is filed under: a key in `agents`, or the literal `lead`.
- **team** — a named group of agents with exactly one **lead**, on one runtime, bound to one partition of the brain.
- **primitive** — one of 51 governed capability lanes. The full list is below.
- **tool** — one grantable, gateable operation, named `<primitive>.<verb>` (e.g. `email.send`).
- **skill** — read-only, hash-pinned prompt text (`agent({ skills })`). *Not* a capability, and not the same thing as the `skills.*` catalogue you write in `can`.
- **brain** — an organization's knowledge store. An organization may declare **several**, and exactly one is the **default**. Sliced by partition and lane (below).
- **belief** / **lesson** / **episode** / **proposal** — the four things a brain holds.
- **runtime** — the harness an agent's turns execute on. `runtime.durable()` is **Vetta**, ours, and is current; `runtime.hermes()` runs the Hermes harness instead and is marked deprecated in the SDK, though existing hermes teams keep working.
- **manifest** / **digest** / **apply** — the deploy contract, its hash, and the act of binding it.

### Words that are retired

If a doc, a blog post, an older config or an older manifest uses one of these, it is out of date:

| you may see | write instead | why |
|---|---|---|
| `employee` | **agent** | an agent is not a person |
| `agent profile` | **operator** (the human) or **agent** (the worker) | the one word carried two unrelated meanings |
| `company` as the product noun | **organization** | `company` stays the WIRE name (`company_id`, `/v1/company`); the product layer says organization |
| `tenant user` | **child project** | it is a scope under a project, and it was never an auth subject |
| `memory` as a store | **brain** | the brain is the store; `memory` is the frozen predecessor primitive |
| `system` as a group of agents | **team** | `/v1/system/outbox` still means the platform itself — only the *group* sense is retired |
| `ceo` as a role | **lead** | `lead` is a structural slot on a team, not a job title |
| `agent template` / `blueprint` | **role** | the declaration of an agent is a role |
| `hire` / `staff` | **declare** | you declare a role and run `naive up`; nobody is hired |
| "recall **router**" | recall **fan-out** | nothing routes: the arms run in parallel and a failed arm is reported, not re-planned |

## Infrastructure as Code (`naive.config.ts` → `naive up`)

Naïve is declarative. Describe the company, its brain, its governance, its infrastructure and its teams in a typed `naive.config.ts` (`@usenaive-sdk/iac`), then apply. Nothing in the config makes an API call at author time; `defineConfig` validates and returns.

```bash
naive init      # scaffold a starter naive.config.ts

# The durable runtime issues this credential. It goes in the ENVIRONMENT, never in
# naive.config.ts — that file is committed, and a config edit alone must never be able
# to move where a tenant runs. NAIVE_DURABLE_CREDENTIAL_<TEAM> names one team;
# NAIVE_DURABLE_CREDENTIAL covers them all.
export NAIVE_DURABLE_CREDENTIAL_SUPPORT=<operator-credential>

naive up        # apply: infrastructure, business programs, roles, company.brains, teams
naive down      # tear down (requires confirmation) — declared brains SURVIVE this
```

⚠ **A `runtime.durable(...)` team can be refused for three different reasons, and the credential is the LAST of them — do not assume it is the fix.** In order: `runtime_not_configured` (this deployment has no durable runtime at all, so no tenant on it can be on one — a deployment fact no credential and no per-tenant act will change), `runtime_cutover_not_permitted` (it has one, but the cutover prerequisites are not signed off; `error.details.missing` names each), and only then `runtime_credential_required` (everything else is ready and `NAIVE_DURABLE_CREDENTIAL_<TEAM>` was not exported). Any of them makes `naive up` exit 1. Read the `code` you actually got, tell the operator that reason, and do not route around it. `naive up` reports per team `placement` (`placed` / `converged` / `refused` with a `code` and a `reason`) and per brain `created` / `converged` / `default` — read the report, not the exit code alone.

⚠ **The durable runtime is LIVE on naive's production control plane — `VETTA_CONTROL_URL` is set and both cutover prerequisites are signed off — so plan for a real placement there, and for `runtime_credential_required` as the one rung left that can refuse it.** Export `NAIVE_DURABLE_CREDENTIAL_<TEAM>` and a durable team comes back `placed`; omit it and `naive up` exits 1 on that code while the brains, infrastructure and roles in the same config apply normally. On any other deployment the first rung still applies. Either way, do not tell an operator their team is running, and do not promise them the durable-only verbs (`submit`, `say`, `unblock`, `watch`, `schedule`, `stop`), until a placement has actually come back `placed` or `converged` — read the report, not this paragraph. Everything in *What is served today* under "served for every tenant" works regardless. Note that durable usage is not metered today (see *What is served today*).

⚠ `naive init` scaffolds a **smaller** config on the same surface as the block below — `defineProject` with `infrastructure`, `kits:` and one `teams:` entry on `runtime.durable()`, the current runtime. It is current and it applies; it is not the older flat `agents:`/`limits:` shape. Grow what `init` wrote toward the block below; do not throw it away. Its first `naive up` needs `NAIVE_DURABLE_CREDENTIAL_<TEAM>` exported or that team comes back `runtime_credential_required` while the rest of the config applies — and on a deployment that has no durable runtime, change that one line to `runtime.hermes()` rather than leaving a team that cannot place.

### The one worked config — read the whole block before writing one

```ts
import {
  agent,
  approver,
  brain,
  brainDefaults,
  business,
  cloud,
  defineConfig,
  governance,
  identity,
  limits,
  runtime,
  skills,
  team,
} from "@usenaive-sdk/iac";

// ── THE BRAIN ──────────────────────────────────────────────────────────────
// ONE brain, which is the shortest thing to write and what most companies want.
// A company that needs several writes `brains({ default, declared })` and binds
// by name (`hive.view("support", …)`); this file is the N=1 case and is byte
// identical to what it was before that existed.
//
// A team binds a PARTITION of a brain; an agent binds a VIEW of one. Both are
// methods on the value that declares it, which is what makes "this agent uses
// that brain" structural rather than conventional.
const acme = brain({
  // REQUIRED, and every value is bounded by a 365d ceiling. A brain with no
  // stated retention would keep everything forever, so `beliefs` is not optional.
  retention: {
    beliefs: "365d",
    lessons: { fact: "180d", rule: "365d", postmortem: "90d" },
    episodes: "30d",
    proposals: "14d",
    documents: "365d",
  },
  bounds: brainDefaults.bounds, // the platform numbers, visible and narrowable
  writes: {
    mode: "review", // direct | propose | review — `review` needs a human to accept
    promoteBy: "operator", // the ONLY value. "agent" and "human" do not compile.
    scan: "enforce", // enforce | alert. A scanner never rewrites a belief.
    witnessedReaffirm: true,
  },
  recall: {
    keywords: true,
    // A FAN-OUT, not a router: arms run in parallel with per-arm failure
    // isolation, and a failed arm is reported in `capsule.degraded`.
    fanOut: { armTimeout: "8s", onArmFailure: "report" },
  },
  partitions: {
    // TEAM level. A partition may only NARROW the company retention — writing
    // `beliefs: "400d"` here throws `retention_widens_parent` at define time.
    support: {
      retention: { beliefs: "90d", episodes: "14d" },
      recall: { keywords: true, vector: { floor: 0.35 } },
      writes: { mode: "propose" },
    },
  },
  // AGENT level, keyed by the role name. Off unless declared.
  lanes: { enabled: true, retention: { beliefs: "30d" }, writes: { mode: "direct" } },
});

// ── THE ROLES ──────────────────────────────────────────────────────────────
const supportLead = agent({
  instructions:
    "You run support. Cite [B*] for a belief and [L*] for a lesson in every answer. " +
    "You may propose into the support partition; you may not accept a proposal.",
  is: identity.business(),
  model: { use: "anthropic/claude-sonnet-4.6", fallback: ["anthropic/claude-haiku-4.5"] },
  // `has` draws on the company programs below. Asking for an address with no
  // `business.email` program throws `program_undeclared` rather than silently
  // provisioning nothing.
  has: { email: true, phone: { sms: true } },
  // `skills.*` is the typed catalogue. `skills.emial.send` is a compile error,
  // and the catalogue now names ALL 46 primitives — `connections` and `vault`
  // below included. A bare STRING is still accepted here, which is why only the
  // symbol form buys the typo check; `approve` and `governance.capabilities.rules`
  // are stricter and take a catalogued slug only.
  can: [skills.email.send, skills.phone.send, skills.search, skills.llm, "connections", "vault"],
  brain: acme.view({
    partition: "support",
    can: ["recall", "attach", "remember", "propose"], // `promote` is not an ability
  }),
  governance: {
    capabilities: {
      default: "deny", // LITERAL. `default: "allow"` does not compile.
      rules: [
        {
          allow: skills.email.send,
          // `within` is required: a park with no deadline is a silent stop.
          approve: { by: approver.membership("operator"), within: "4h", quorum: 1 },
        },
        { deny: skills.cards, because: "support answers questions; it never moves money" },
        { deny: skills.payments, because: "same" },
      ],
    },
    spend: {
      // `reserve` is the only class that stops anything.
      reserve: [{ bucket: "agent:supportLead", cap: "$100/mo", onExceed: "park" }],
    },
  },
});

const tier1 = agent({
  instructions:
    "You answer tier-1 tickets from the brain. If the answer is not in the brain, say so and " +
    "escalate. Never invent a policy.",
  model: { use: "anthropic/claude-haiku-4.5" },
  has: { email: true },
  can: [skills.email.send, skills.search, skills.llm, "connections"],
  // `lane: true` gives this role a private working set keyed by its role name.
  brain: acme.view({ partition: "support", lane: true, can: ["recall", "attach", "propose"] }),
  governance: {
    capabilities: {
      default: "deny",
      rules: [
        { allow: skills.search },
        { allow: skills.llm },
        {
          allow: skills.email.send,
          approve: { by: approver.membership("operator"), within: "4h", quorum: 1 },
        },
      ],
    },
    spend: { reserve: [{ bucket: "agent:tier1", cap: "$50/mo", onExceed: "park" }] },
  },
});

export default defineConfig({
  project: "acme-support",

  infrastructure: {
    cloud: {
      website: cloud.web({ framework: "nextjs", dir: "." }),
      tickets: cloud.postgres({ size: "small" }),
      attachments: cloud.bucket({ public: false }),
    },
  },

  // ── THE COMPANY ──────────────────────────────────────────────────────────
  // Declared once, and byte-identical across every project config of one company.
  company: {
    name: "Acme, Inc.",
    brain: acme,
    // WRITE-ONCE MINTED. Declared here and nowhere else; a team or an agent
    // cannot restate it, because `ScopedGovernance` omits the field.
    residency: { jurisdiction: "us", allowEgressTo: ["us"] },
    business: {
      entity: business.entity({ form: "llc", verify: "kyb", legalName: "Acme, Inc." }),
      email: business.email({ domain: "support.acme.com", warmup: true }),
      phone: business.phone({ a2p: { brand: "Acme" } }),
    },
    governance: governance({
      capabilities: {
        default: "deny",
        rules: [
          { allow: skills.brain },
          { allow: skills.search },
          { allow: skills.llm },
          { allow: skills.email.send, when: { recipients: { lte: 50 } } },
          { deny: skills.payments, because: "no agent in this company moves money" },
        ],
      },
      spend: {
        reserve: [{ bucket: "company", cap: "$2000/mo", onExceed: "deny" }],
        // A meter is ALERT-ONLY. `onExceed: "deny"` on a meter does not compile.
        meter: [{ bucket: "company", subject: "llm.tokens", alertAt: "$500/day" }],
        // An action that spends money with no price extractor parks a human.
        unpriceable: "park",
      },
      limits: limits({
        concurrency: { toolCalls: 8, brainWrites: 2 },
        rate: { toolCalls: "120/min" },
        pending: { approvals: 200 },
        snapshot: { notAfter: "60s" }, // how stale a decision snapshot may be
      }),
    }),
  },

  // ── THE TEAMS ────────────────────────────────────────────────────────────
  teams: {
    support: team({
      runtime: runtime.durable({
        // `residency` is deliberately omitted here: runtime.durable places only
        // in the jurisdictions in DURABLE_JURISDICTION (today `eu` and
        // `fedramp`), and a value it cannot place is REFUSED at define time
        // rather than accepted and placed somewhere else.
        sleepAfter: "15m",
        // No workspace at all means no filesystem and no process tools.
        workspace: { isolation: "os-kernel", egress: { mode: "deny-all" }, quota: "512mb" },
      }),
      lead: supportLead, // exactly one, structurally: not an array, not optional
      agents: { tier1 },
      edges: [["lead", "tier1"]], // `["lead", "tier2"]` is a compile error
      brain: acme.partition("support"),
      review: {
        rubric: [
          "Does every claim in the reply cite a [B*] belief or an [L*] lesson?",
          "Was anything promised that the config does not permit?",
          "Was a refund, credit or account change attempted without an approval?",
        ],
      },
      governance: {
        capabilities: {
          default: "deny",
          rules: [
            { allow: skills.brain },
            { allow: skills.search },
            { allow: skills.llm },
            { allow: skills.email.send },
          ],
        },
        spend: { reserve: [{ bucket: "team:support", cap: "$400/mo", onExceed: "park" }] },
      },
    }),
  },
});
```

<!-- printed from packages/lp/src/examples/customer-support.naive.config.ts, which the compiler checks. Do not hand-edit. -->

### Several brains

The block above declares ONE brain, which is what most companies want and the shortest thing to write. A company that needs several declares them with `brains({ default, declared })` and binds one by NAME. Everything else — partitions, lanes, retention, abilities — is identical, because this is the same declaration at a different arity.

```ts
import { agent, brain, brains, defineConfig, runtime, skills, team } from "@usenaive-sdk/iac";

// ── SEVERAL BRAINS, EXACTLY ONE DEFAULT ────────────────────────────────────
// Write ONE brain (`company: { brain: … }`) unless the operator asks for more —
// it is shorter and it is what most companies want. This is the N>1 spelling.
//
// The record KEY is the name. `brain_knowledge_bases` is keyed
// `(company_id, name)` with a partial unique index on `is_default`, so the store
// has always held many brains per company and exactly one default; this block is
// how a config says which is which.
const hive = brains({
  // REQUIRED once there is more than one. With a single declared brain the field
  // is optional, because there is nothing to choose.
  default: "core",
  declared: {
    core: brain({
      // `org` is the shared company trunk, and there is AT MOST ONE per company
      // (brain_knowledge_bases_org_idx). Every other brain is `project`.
      scope: "org",
      retention: { beliefs: "365d", lessons: { fact: "180d", rule: "365d", postmortem: "90d" } },
      writes: { mode: "review", promoteBy: "operator" },
      partitions: { trunk: {} },
    }),
    support: brain({
      retention: { beliefs: "90d", episodes: "14d" },
      writes: { mode: "propose" },
      // The ability CEILING for EVERY view of this brain. A view may only narrow
      // it; a wider one throws `brain_view_exceeds_visibility` at define time.
      // Said once here instead of in every `view()` in the config.
      visibility: { can: ["recall", "attach", "propose"] },
      partitions: { tickets: {} },
    }),
  },
});

export default defineConfig({
  project: "acme-support",

  company: {
    name: "Acme, Inc.",
    // `brains`, not `brain`. Declaring BOTH is `company_brain_and_brains`: they
    // are one declaration at two arities, and two spellings of one thing is the
    // defect rather than the feature.
    brains: hive,
  },

  teams: {
    support: team({
      runtime: runtime.durable({ sleepAfter: "15m" }),
      // A TEAM binds one slice of one NAMED brain. The second argument is typed
      // as the partitions OF THAT BRAIN, so `hive.partition("core", "tickets")`
      // is a compile error — "tickets" belongs to "support".
      brain: hive.partition("support", "tickets"),
      lead: agent({
        instructions: "You run support. Cite [B*] for a belief and [L*] for a lesson.",
        can: [skills.email.send],
        // An AGENT binds a VIEW of one named brain. The name is `keyof` the
        // declared record, so a typo does not compile.
        brain: hive.view("support", { partition: "tickets", can: ["recall", "propose"] }),
      }),
      agents: {
        // A different brain, on the same team. This is the thing the one-brain
        // DSL could not express.
        librarian: agent({
          instructions: "Answer from the company trunk only. Never invent a policy.",
          can: [skills.search],
          brain: hive.view("core", { can: ["recall"] }),
        }),
      },
      edges: [["lead", "librarian"]],
    }),
  },
});
```

<!-- printed from packages/lp/src/examples/multi-brain.naive.config.ts, which the compiler checks. Do not hand-edit. -->

### What is a compile error here that used to be a silent bug

| you write | what happens |
|---|---|
| `can: [skills.emial.send]` | type error on the symbol. It used to be a dead grant, silently |
| `capabilities.default: "allow"` | type error — the default is the literal `"deny"` |
| `edges: [["lead", "tier2"]]` with no `tier2` | type error. It used to be a message delivered to nobody at 3am |
| two leads, or none | unwritable — `lead` is a required, non-array field |
| two brains and no `default` | type error — `default` is required exactly when there is a choice |
| two `default`s | unwritable — a duplicate property, not a refusal |
| `hive.view("suport", …)` | type error — the name is `keyof` the declared record |
| `hive.partition("core", "tickets")` where `tickets` is `support`'s | type error — the partition is typed to the NAMED brain |
| both `company.brain` and `company.brains` | `company_brain_and_brains` at define time |
| a `view({ can })` wider than that brain's `visibility.can` | `brain_view_exceeds_visibility`, naming both levels |
| a brain with no `retention.beliefs` | type error |
| a partition wider than the company | `retention_widens_parent` at define time, naming both levels |
| `onExceed: "deny"` on a `meter` | type error — a meter is alert-only |
| `promoteBy: "agent"` or `"human"` | type error — the only value is `"operator"` |
| `acme.view({ can: ["promote"] })` | type error — `promote` is not an agent ability |
| `has: { email: true }` with no `business.email` program | `program_undeclared` at define time |
| `runtime.durable({ residency: "us" })` | throws — the durable runtime places only where it can place; a value it cannot place is refused rather than accepted and placed elsewhere |

**One limit of the type layer, so you do not over-trust it.** The typed catalogue `skills.*` now names all 51 primitives, so `can: [skills.emial.send]` is a compile error. But `can` also accepts a **bare string**, and a string is not spell-checked — only the symbol form buys you the typo check. `approve` and `governance.capabilities.rules` are stricter: they accept only a catalogued slug.

## Agent teams — the whole model

A **team** is the unit Naïve runs work on: a named group of agents with exactly one **lead**, on one runtime, bound to one partition of one brain. Everything about a team is declared in `naive.config.ts` and applied with `naive up`; nothing about a team is created imperatively.

**Anatomy — the five fields that make a team a team:**

- **`lead`** — exactly one, structurally: it is a required, non-array field. The lead is the intake — `naive teams submit` admits a goal through the same door a person's message takes, and the lead decomposes and delegates. `lead` is a structural slot, not a job title (`ceo` is the retired word).
- **`agents`** — the other roles, keyed by name. Each is an `agent({…})` declaration: instructions, model, `can`, its own governance, and its own **view** of a brain.
- **`edges`** — who may hand work to whom, e.g. `[["lead", "tier1"]]`. An edge naming a role that does not exist is a compile error; delegation outside the declared edges is refused at runtime, not just discouraged.
- **`runtime`** — where turns execute. `runtime.durable()` is current (policy enforced at the tool boundary); `runtime.hermes()` is the frozen predecessor kept for the operators already on it. One team, one runtime.
- **`brain`** — the team binds a PARTITION of a brain (`acme.partition("support")`): shared memory inside the team. Each agent may additionally bind a narrower VIEW, and `lane: true` gives a role a private working set keyed by its role name.

**Lifecycle.** Declare roles → `naive up` materializes and places the team (read `placement`: `placed` / `converged` / `refused` + `code`) → create a tenant (`naive users create`) → address every call to the **pair** (team, tenant): `naive teams <verb> <team> --tenant <id>`, or `naive.team(name).forTenant(id)` in the SDK. A team has no meaning without a tenant: `--tenant` is required on 28 of the 29 subcommands, and `.forTenant()` verifies the tenant exists — it never mints one.

**How work moves.** `submit` admits a goal; the board (`naive teams board` / `tasks`) holds the work cards; `runs` is the ledger of attempts; `events` is the cursor-paged stream; `watch` proxies the live transcript; `approvals` + `decide` is the queue of things the team parked for a human; `stop` is the kill switch (a PAUSE — cards keep their leases, and an attempt already handed to a member runs to its end). Which of these answer today depends on the tenant's runtime — the next section is the measured list; read it before you promise a verb.

**Governance composes downward.** The team's `governance` block sits at layer 3: it may attenuate what the company allows and escalate approvals, never widen. Each agent's block sits at layer 4 under it, and spend `reserve` buckets stack — `company`, `team:support`, `agent:tier1` are all real walls. The team-level `review.rubric` is how you write the questions a reviewer asks of every reply.

**Teams and the brain.** The partition the team binds is TEAM-shared memory; a lane is AGENT-private. Write modes compose the same way retention does: a partition may say `writes: { mode: "propose" }` and an agent's view may be narrower than that, never wider (`brain_view_exceeds_visibility`). Proposals flow up to an operator; `promote` is never an agent ability.

## What is served today — read this before you promise anything

The declaration surface above is real: `naive.config.ts` compiles, `defineConfig` refuses a bad config at define time, and the types are the contract. What is **not** uniform is the control plane behind every verb of the durable runtime — and, since the runtime cutover is per tenant, **the answer depends on which runtime the tenant you are acting on is registered to.**

**Ask that question first.** Every response on this surface carries `provider` (`"durable"` or `"hermes"`), and every refusal carries `error.details.runtime`, so you never have to guess. `naive teams show <team> --tenant <id>` prints it.

**The rule, which will outlive this list:** an operation whose backing store or control route does not exist answers **`501 not_configured`**, and `error.details.missing` names each absent dependency by its real name. It is never `404` (that would say your address is wrong), never `403` (that would say you are not allowed) and never `200` with an empty list (that would be a claim about the tenant). When you see it: read `missing`, tell the operator, and do **not** retry and do **not** find another route to the same effect.

`naive teams` is one declaration of 24 subcommands and the split is measured, not claimed. 12 are served by this control plane over real rows for every tenant; 4 answer `501` on both runtimes. The other 8 are served only for a tenant on the durable runtime, and answer `501` naming the legacy equivalent for a tenant on hermes.

**Served for every tenant, on either runtime:**

- `naive teams list` — every declared team of the company, and the `--tenant` id each one's other verbs take
- `naive teams show` — the team/tenant header, and which runtime backs the pair
- `naive teams plan` — the honesty report — every field it cannot report, and why
- `naive teams roster` — who is on the team, and which one is the lead
- `naive teams board` — the work cards
- `naive teams tasks` · `task` — the same board, and one card
- `naive teams runs` — the run ledger for this tenant
- `naive teams events` — the event stream, by cursor
- `naive teams cost` — spend over a budget window
- `naive teams diagnose` — stranded cards and other real findings
- `naive teams approvals` — the pending queue
- `naive teams decide` — allow or deny one approval — a real write

**Served on the durable runtime; refused with the legacy equivalent named on hermes:**

- `naive teams submit` — admits a goal through the same intake a person's message takes. *On hermes:* `naive tasks create` on the legacy board.
- `naive teams say` — posts into the channel and returns the run to watch. *On hermes:* no per-(team, tenant) session store exists.
- `naive teams unblock` — revives a card with a fresh attempt budget. *On hermes:* `naive tasks unblock`.
- `naive teams watch` — the run transcript, proxied frame for frame as SSE. *On hermes:* frames are caller-forgeable and the stream cannot be metered on open.
- `naive teams schedule` · `unschedule` — registers or cancels recurring work, pinned to the model in force at registration. *On hermes:* `naive cron` stays mounted on the legacy runtime, but `cron create` answers `no_runtime_claimed` and HOLDS the command until a container is claimed.
- `naive teams schedules` — what recurs, and it is what makes `unschedule` usable: `schedule` returns the job id ONCE, `unschedule` is addressed by that id, and no other verb on this surface reports it. Each row carries the next firing and the model the job is pinned to — a job pinned to a model the team has since moved off keeps spending on the old one, and this is the only place that is legible. *On hermes:* `naive cron list` reads `cron_jobs`, which is company-scoped and carries no team column.
- `naive teams apply` — binds ONE exact manifest digest and refuses a stale one. Until a digest is bound the team's dispatcher ticks nothing and every intake answers 409, so this is the step that turns a placed team into a working one. `--expected-digest` is REQUIRED and has no default — the two-step exists so a person names the surface they reviewed, and an apply with no digest would bind whatever the registry holds. `naive teams plan` now reports that digest as `manifest_digest` (read from the runtime's own `status`), and reports `manifest_stale` with both digests when the binding has been overtaken. A stale digest comes back as the runtime's own 409 carrying BOTH digests. *On hermes:* there is no applied digest to compare `expected_digest` against, so the 409 this operation exists to raise could never be raised correctly.
- `naive teams stop` — THE KILL SWITCH. Stops the dispatcher claiming further work and fences it against re-arming (`start-loop` resumes). It is a PAUSE: the answer carries `is_pause_not_decommission: true`, cards keep their leases and attempt budgets, and an attempt already handed to a member is NOT recalled — it runs to its end and still spends, which is what `in_flight` in the answer counts. *On hermes:* a team-level stop is a state of the Durable Object and the legacy runtime has no equivalent row to set; a legacy run is stopped one at a time through the sidecar.

🔴 **Read that heading as a conditional, not a promise — but the condition now HOLDS on naive's production control plane.** These 8 require a tenant that is ON the durable runtime. Production has `VETTA_CONTROL_URL` set and both cutover prerequisites signed off, so a `runtime.durable(...)` team placed there with its operator credential comes back `placed` and these 8 are reachable for that tenant. That is a fact about ONE deployment. A deployment with no `VETTA_CONTROL_URL` has no durable runtime at all, so no tenant on it can be on one; that is a fact about the DEPLOYMENT, not about the tenant, and no per-tenant act and no credential changes it. On such a deployment every one of these 8 is unreachable for **every** tenant — not only for tenants on hermes. So ask which deployment you are on; do not carry either answer across.

**So still do not tell an operator they can submit, say, unblock, watch, schedule or stop work until you have asked the deployment and believed the answer.** `naive teams show <team> --tenant <id>` prints `provider`; a `501` carries `error.details.runtime`; and a durable placement that is refused carries the reason as a `code` you can read: `runtime_not_configured` (this deployment has no durable runtime), `runtime_cutover_not_permitted` (it has one, but the cutover prerequisites are not signed off — `error.details.missing` names each), and only then `runtime_credential_required` (everything else is ready and the operator credential was not supplied). They are checked in that order, so the credential is the LAST thing that can be missing, never the first — read the code you actually got rather than assuming the credential is the fix. **On production the first two rungs now pass, so `runtime_credential_required` is the refusal to EXPECT.** That does not make the credential a formality: without it nothing is written and the team is still refused.

⚠ **A placement that succeeds is not the whole system working, and two things are still short — say them rather than letting an operator infer otherwise.** (1) `naive teams list` now serves on every deployment — the JSONB key holding a declared team's name was renamed by `packages/db/migrations/065_agents_config_team_key.sql`, which is what the old refusal named as its own remedy — but what it lists is naive's OWN `agents` rows, so it tells you a team is declared and addressable, NOT that its runtime answered. (2) **Durable usage is currently UNBILLED.** naive mints a per-company billing key and delivers it to the runtime on placement; the runtime rejected it, so `armVettaBilling` came back `delivery_refused`, the key was revoked, and the company is unarmed. Work on the durable runtime therefore runs and is not metered against the operator's credits. If an operator asks what a durable team costs, say that plainly — do not describe it as free, and do not build a promise on top of it.
**Declared and addressable, refused on both:**

- `naive teams sessions` · `read` — the runtime has `channels`/`read` verbs; the control-plane translation is one-way (in, not out)
- `naive teams effects` · `settle` — the runtime has `effects`/`effect-decide`; no control route reaches either. On hermes there is no effect ledger at all
- `naive teams model` — the runtime has `model`; no control route reaches it. On hermes it is a manifest field and no manifest is stored
- `naive teams migrate` · `rollback` — migration is a control-plane act (rewriting `company_containers.sidecar_url`), deliberately not on a tenant-addressable route — and it is not symmetric

Two consequences you must act on, not work around:

- **`naive up` applies `teams:` and `company.brains`, and it reports what each one actually did.** It posts the config to `/apply`, materializes and places every declared team, and creates or converges every declared brain. Read the report, not the exit code alone: `result.teams[].placement` is `placed` / `converged` / `refused` (a refusal carries `code` and `reason`, and makes `naive up` exit **non-zero**), `result.teams[].agents` carries each agent's `provision_status`, and `result.brains` carries `created`, `converged`, `default` and `retained`. **A `runtime.durable(...)` team is refused outright on a deployment that has no durable runtime** (`runtime_not_configured`) and on one whose cutover prerequisites are not signed off (`runtime_cutover_not_permitted`); `NAIVE_DURABLE_CREDENTIAL_<TEAM>` is checked only after both of those pass, so exporting it is necessary and nowhere near sufficient. `company.brains`, the infrastructure and the roles all still apply — it is the team placement that is refused.
- **Never substitute a legacy verb to make a durable operation appear to work.** If `naive teams submit` refuses because the tenant is on hermes, that is the honest answer; reaching for `naive tasks create` or `naive ceo run` writes into the frozen runtime, which is a different execution model with a different governance path, and a config that depends on it is a config that has to be rewritten. When a refusal names the legacy route, it is telling you what that tenant has — not recommending you switch.

A refusal that came from the runtime itself is carried through verbatim: the status is preserved and `error.details.runtime_said` holds the runtime's own sentence. Nothing is translated, because whoever runs the cutover needs the runtime's words, not this API's paraphrase.

The frozen orchestration stack keeps working for the operators already on it. That is a compatibility promise, not a recommendation.

## The brain — N per company, exactly one default

A company may declare **several brains** and exactly one of them is the **default** — the one every call that names none resolves to. That is not a convenience: `brain_knowledge_bases` is keyed `(company_id, name)` with a partial unique index on `is_default`, so the store has always held many and exactly one default, and `naive brain list` has always shown them.

```
company                       ← the tenant boundary. Never crossed.
├── brain "core"   (default)  ← every call that names no brain lands here
│   └── partition "trunk"     ← TEAM level. Shared inside the team. You name it.
└── brain "support"
    ├── partition "tickets"
    │   └── lane "tier1"      ← AGENT level, keyed by the ROLE name. Private.
    └── partition "billing"
```

**Write one brain unless the operator asks for more.** `brain({...})` on `company.brain` is the whole thing for most companies, and it is unchanged. When there are several, use `brains({ default, declared })` on `company.brains` — the record KEY is the name, `default` becomes REQUIRED, and a team or an agent binds one BY NAME (`hive.partition("support", "tickets")`, `hive.view("core", { can: [...] })`). The worked block is in *Several brains* above. Declaring **both** `brain` and `brains` on one company is `company_brain_and_brains` at define time: they are one declaration at two arities, and two spellings of one thing is the defect.

**Connecting a brain to an agent is also a runtime act, and it is NOT a permission.** `naive brain connect <brain> --agent <a>` (REST `POST /v1/brain/connect`, MCP `naive_brain_connect`) records *which* brain an agent works out of, on `agents.metadata.brain_knowledge_base_id`. Every content route already accepts `knowledge_base_id` and resolves it company-scoped, so it grants nothing that was withheld — and it does **not** redirect an unscoped call, which still reads the default. Do not present it to an operator as isolation.

**The two halves of that call have different scopes; say so rather than saying "company".** A BRAIN is company-wide — `brain_knowledge_bases` has no tenant column, so every brain of the company is nameable. An AGENT is not: `agents.tenant_user_id` is real, and `connect` / `connections` / `disconnect` filter every read and every write on it, the same rule `/v1/employees` applies. So connecting or disconnecting another tenant user's agent is `resource_not_found`, and a connections list is the caller's tenant's, not the company's. Do not tell an operator that a connections read shows the whole company.

Rules to obey when you write agent instructions:

- **Shared by default within a partition; private by default within a lane.**
- **Read down, propose up, promote never.** An agent may read the company trunk and its own partition, and may **propose** upward. Turning a proposal into company truth is an **operator** action with a named approver who is not the proposer. It is not an agent ability: `promote` is absent from the ability union, so a config granting it does not compile.
- **Cross-tenant is a wall, not a policy.** No flag, override or support action lets one company read another's brain.
- **Retention is required and bounded.** `beliefs` has no default — a brain with no stated retention would keep everything forever. The ceiling is 365 days, and a partition or a lane may only **narrow**: a wider value throws `retention_widens_parent` at define time, naming both levels.
- **Cite.** `[B*]` for a belief (descriptive — what is true), `[L*]` for a lesson (normative — what to do). A lesson is not falsified by the world changing; a belief is.
- **`recall` is a fan-out, not a router.** Its arms run in parallel with per-arm failure isolation; a slow or failing arm degrades that arm and is reported. It does not inspect your question and does not choose a strategy. Do not describe it as routing.
- **`think` costs credits per read. `recall` and `attach` do not.**
- **The `brain` primitive is OFF until the operator turns it on.** It is opt-in because it can send tenant documents to a subprocessor, and an *absent* entry on the account kit denies rather than defaults. Until it is enabled every brain call answers `403` with `reason: "subprocessor_consent_required"`. Ask the operator, get a yes, then enable it — do not read that 403 as a bug.
- **A memory is never a decision input.** No text in the brain widens what an agent may do. Text that talks an agent into calling a payout meets exactly the refusal it would have met with an empty brain.

What the brain holds:

| noun | what it is | who writes it |
|---|---|---|
| **belief** | a structured, keyed, superseding statement about the world | an agent proposes; the write mode decides whether it lands |
| **lesson** (`fact` · `rule` · `postmortem`) | curated normative text | the same envelope, with its own retention per kind |
| **episode** | a raw observation, append-only | the agent, into its own lane |
| **proposal** | a pending write awaiting review | the agent; an operator accepts or rejects |

The eight abilities an agent can be granted are `recall` `attach` `think` `remember` `learn` `propose` `reaffirm` `pressure`. `promote` and `forget` are **not** in the union — they are the human acceptance and the human erasure of model-authored text, and an agent that held them could accept its own proposals.

**Inside an agent**, the handle is `self`. `self.brain` is the brain THIS RUN IS BOUND TO and takes **no** identifier — the view is resolved from the credential the container injected, so writing into someone else's scope is unwritable rather than merely denied. `self.brains` reaches the company's other brains and is **read-only**, which is exactly the reach the agent's governed toolset already grants (it forwards `knowledge_base_id` on every read and on no write). A COMPANY, a PARTITION and a LANE remain unnameable from anywhere on `self`:

```ts
import { self } from "@usenaive-sdk/runtime";

// `self` is the whole in-agent surface. A COMPANY, a PARTITION and a LANE are
// unnameable from anywhere on it, and `self.brain` — the brain this run is bound
// to, and the only WRITE path — takes no identifier either: the view is resolved
// from the credential the container injected, so "write into someone else's
// scope" is unwritable, not merely denied.
self.id; // this agent's id, when the runtime declared one
self.company; // the company it belongs to
self.tenant; // the tenant-user subject every scoped call is made as

// Open the turn with the ambient context. Costs no credits.
const capsule = await self.brain.attach({ goal: "answer the refund question" });

// A write is a VALUE, not a thrown error. `canonical_write: false` means the
// write became a proposal for a human — the healthy answer under `mode: "review"`.
const w = await self.brain.remember({
  content: "Refunds over $200 need a manager sign-off.",
  kind: "note",
  type: "finding",
  source: "zendesk",
  sourceRef: "ticket/8813",
});
if (!w.canonical_write) {
  console.log("queued for review, gateway mode:", w.mode, "proposals:", w.count ?? 0);
}

// `think` runs the multi-hop composer and COSTS CREDITS PER READ. `recall` and
// `attach` do not.
const answer = await self.brain.think({ query: "what is our refund window?" });

// The company's OTHER brains, when it has more than one. READ-ONLY: this is
// exactly the reach the governed toolset already grants (it forwards
// `knowledge_base_id` on every read and on no write), so there is no `remember`
// here. Writes stay on `self.brain`, which writes where the credential says.
const { knowledge_bases } = await self.brains.list();
const legal = await self.brains.get("Legal Brain");
const cited = await legal.recall({ query: "MSA signature authority" });

// The governed toolset. Every call is decided at the gateway, wherever this
// process runs.
await self.tools.handle("email_send", { to: "a@b.com", subject: "…", body: "…" });
```

<!-- printed from packages/lp/src/examples/in-agent.ts, which the compiler checks. Do not hand-edit. -->

**Never call `reaffirm` automatically.** Reaffirming a lesson because the work that quoted it passed is a loop in which a lesson extends its own life; it needs a witness — a recorded verdict newer than the row.

## Governance — what decides, and in what order

One decision function. It is asked on every gated action, wherever the agent runs, and it fails **closed**: if the engine cannot answer, the action is refused with `403 enforcement_unavailable`. Do not retry that in a loop — surface it.

Layers, lower number wins:

| # | layer | who writes it | may | may not |
|---|---|---|---|---|
| 0 | **statute** | Naïve, in code | nothing at runtime | be overridden by anything — no layer, no flag, no waiver, no break-glass |
| 1 | platform | Naïve, per region/plan | set baselines, deny anything | grant beyond statute |
| 2a | entitlement | the subscription / account kit | **attenuate only** | grant, or escalate |
| 2b | company | the operator's `governance()` block | attenuate, escalate approvals, set caps | grant what 1 or 2a denied |
| 3 | team | `team({ governance })` | attenuate, escalate | grant beyond the company |
| 4 | agent | `agent({ can, approve, governance })` | attenuate, escalate | grant beyond the team |

Four rules:

1. **Deny wins across layers.**
2. **Allow narrows only.** A layer's allow-set is intersected with its parent's. Nothing further down widens anything.
3. **Approvals escalate only.** A layer may add an approval requirement, never remove one — except through an explicit `waive` carrying a mandatory `because` and `until`, and never for statute.
4. **Within one layer, rules are ordered and the last match wins.** That is how you write "everything except this".

**One outcome, three spellings — recognise all three.** The decision engine returns `allow`, `deny`, or `freeze`. `freeze` means *parked for a named human*: it writes an approval row and returns its id. On the REST wire that same outcome arrives as a body carrying `status: "pending_approval"`; in the SDK it arrives as `{ decision: "park", approvalId, message }`. Three names, one thing. Treat all three the same way: **surface it to the operator with the action, the resource and the approval id — then stop.** Do not retry, and do not find another route to the same effect. A parked action is a human's decision.

Spend has three named classes and they are not interchangeable:

| class | when it fires | can it stop anything |
|---|---|---|
| `reserve` | pre-admission, atomically | **yes** — this is the only wall |
| `meter` | after the fact | no. Alert-only, and `onExceed: "deny"` on a meter does not compile |
| `brake` | an external provider's cap | maybe — it needs env the deployment may not have, so it may be inert |

`unpriceable: "park"` says what happens to an action that spends money with no price extractor. It is never budget-exempt.

Actions you cannot ship a config that lets an agent do unattended include: erasing a belief; accepting a brain proposal; filing a company formation; starting identity verification; sending crypto; creating or topping up a card; connecting a third-party account; and writing policy. Approving is always a *named human who is not the requester*.

## Support — questions, escalations, and reporting bugs

Naïve has a hosted support agent, reachable from the CLI (`naive support`) and from the chat widget on the developer dashboard. Use it whenever the operator has a product question you cannot answer from this manifest or the docs, needs manual intervention (refunds, billing, account changes), or hits a platform bug.

```bash
naive support ask "<what you need help with>"   # opens a ticket; the support agent replies immediately
naive support list                               # your tickets
naive support show <ticketId>                    # full thread
naive support send <ticketId> "<message>"        # reply on a ticket
naive support close <ticketId>                   # mark it resolved
```

How it behaves, so you can set the operator's expectations honestly:

- **Questions** are answered directly by the support agent, grounded in the published docs.
- **Manual-intervention requests** (refunds, billing disputes, account changes) are escalated: the naive team is emailed and a human takes over the same thread.
- **Bugs** are escalated to the team AND an automated fix is queued against the platform repository. When you report a bug, include exactly what was run, what was expected, what happened, and the error text.

**After you report a bug on the operator's behalf, tell them explicitly:** the bug has been reported to the naive team, they can contact us at **support@usenaive.ai**, and ask whether they would like to share any follow-up feedback or details (send it on the same ticket with `naive support send <ticketId> "…"`). The CLI's response carries this same instruction in its `hints` when a report was escalated — relay it, do not swallow it.

A human's replies arrive on the same thread — poll with `naive support show <ticketId>`. Once a ticket is escalated the automated agent goes silent and a human holds the thread.

## Capabilities (51 primitives)

Ask the operator which of these they want before granting any. Every name here is the **wire name** — use it verbatim in `can`, `allow` and `deny`. Approval-gated primitives default to requiring a human OK for agent-initiated actions; opt-in primitives are disabled until the operator turns them on.

**One of them also needs money before it answers at all: `llm`.** Granting it in a config is not enough — the free signup credits do not buy model routing, so on an account that has never paid, every routing call answers `402 llm_routing_requires_payment` no matter what the kit and the governance say. That is a billing fact, not a permission one, and it is the only row here where the two differ. See *The one primitive the free credits do not buy* in Step 2.

### Identity & Legal

- `verification` — KYC / identity & compliance checks · **approval-gated by default**
- `formation` — LLC / company formation & filings · **approval-gated by default**
- `domains` — Register & manage domains + DNS · **approval-gated by default**
- `email` — Inboxes, sending & receiving
- `phone` — Provision phone numbers & send/receive SMS via Surge · **approval-gated by default**
- `profile` — The user's own profile (email, name)

### Money

- `cards` — Issue & manage virtual payment cards · **approval-gated by default**
- `payments` — Per-agent crypto wallet & x402 stablecoin payments · **off unless the operator enables it**
- `trading` — Link a brokerage account & trade stocks, options & crypto via OAuth · **approval-gated by default**
- `billing` — Plans, subscriptions & credit top-ups

### Automation

- `browser` — Cloud browser sessions, autonomous signup/login & live view · **approval-gated by default**
- `mobile` — Cloud mobile emulators/devices via Mobilerun (billed per minute from credits) — provision, run agent tasks, stream live, and call any Mobilerun API · **approval-gated by default**
- `connections` — Connect 3rd-party apps (OAuth / API key) via Composio · **approval-gated by default**

### Content

- `images` — AI image generation + stock search
- `video` — AI video generation
- `clips` — Short-form video clipping
- `media` — Media asset library
- `audio` — Speech to text, text to speech, speech to speech
- `social` — Connect & post to social accounts

### Intelligence

- `llm` — OpenRouter-backed LLM routing — chat completions across 300+ models · requires a paid account (free signup credits do not cover it)
- `search` — Web search, URL reading & deep research
- `brain` — Company-scoped knowledge base and RAG · **off unless the operator enables it**

### Market Data

- `seo` — Keywords, backlinks & SERP intelligence
- `aeo` — LLM responses, mentions & AI keyword data
- `app-data` — Google Play & App Store data
- `business` — Google Maps/Trustpilot/TripAdvisor reviews & local listings + travel
- `ecommerce` — Google Shopping & Amazon product data
- `company-data` — Firmographics, funding, investors, tech stack & headcount
- `people` — B2B people search & contact enrichment · **off unless the operator enables it**
- `social-data` — Read public posts, comments & transcripts from X, Reddit, Instagram, TikTok, YouTube, Bluesky & Hacker News

### Cloud

- `apps` — Vercel + Supabase web app deployment
- `database` — Managed Postgres on a fullstack app — SQL, PostgREST CRUD & migrations (requires apps)
- `storage` — File storage buckets & objects on a fullstack app's Supabase project (requires apps)
- `functions` — Deploy & invoke serverless edge functions on a fullstack app (requires apps)
- `auth` — End-user authentication & admin user management on a fullstack app (requires apps)
- `compute` — Run Docker containers, background workers & scheduled jobs on managed cloud compute (ECS/Fargate) · **approval-gated by default**
- `queue` — Durable message queues (SQS) for agent work pipelines
- `sandbox` — Disposable micro-VM code sandboxes (usage billed from credits) — run commands, read/write files, expose ports, checkpoint, fork & resume · **approval-gated by default**

### Orchestration

- `agents` — Long-horizon agents that run on their own schedule, spend a budget from your credits, and deliver artifacts · **approval-gated by default**

### Trust & Ops

- `approvals` — Human-in-the-loop approval queue
- `vault` — Encrypted per-user credential store
- `sessions` — TTL-limited scoped MCP sessions
- `logs` — Per-user activity audit trail
- `jobs` — Async job tracking
- `webhooks` — Signed event subscriptions — company-wide or per user

### Deprecated — do not use in new work

These are the **frozen** legacy orchestration runtime. They keep working for the configs already using them, they accept no new capabilities, and they may not grow. Do not build on them, and do not reach for them to make something work that the current surface refuses.

| primitive | what it is | what to use instead |
|---|---|---|
| `ceo` | Autonomous CEO orchestration runs | a `team({ lead })` on `runtime.durable()`; work is submitted with `naive teams submit` |
| `employees` | Hire & configure agent employees | declare a role with `agent({…})` inside `team({ lead, agents })`, then `naive up` |
| `objectives` | High-level goals that drive tasks | no direct replacement yet — a goal is submitted per run, not stored as a standing object |
| `tasks` | Kanban task system for agent work | `naive teams submit <team> <goal> --tenant <id>`; read the board with `naive teams board` |
| `cron` | Scheduled recurring agent jobs | recurring work on a team (`naive teams schedule`) — declared, and refused today; see *What is served today* |
| `memory` | Long-term agent memory store | the **brain**: `naive brain remember` / `naive brain attach`, or `self.brain` in-agent |

**Also deprecated in the shipped `@usenaive-sdk/iac`, and not to be used in new work:** `runtime.pool()`, `agentTemplate()`, `policy()`, `system()`, the `agentProfiles:` and `systems:` config keys, and `agent({ limits })`. Every one still compiles and still produces exactly what it always did — that is the compatibility promise — but each carries a pointer to its replacement.

Aliases you may see for this one deprecated thing, all meaning the same system: *orchestration, warm pool, instance pool, Hermes, sidecar, hosted runtime*.

## Reference

- Docs home: https://usenaive.ai/docs
- Quickstart: https://usenaive.ai/docs/getting-started/quickstart
- Authentication: https://usenaive.ai/docs/getting-started/authentication
- Infrastructure as Code: https://usenaive.ai/docs/getting-started/iac
- Credits and pricing: https://usenaive.ai/docs/getting-started/credits
- API reference: https://usenaive.ai/docs/api-reference/overview
- CLI reference: https://usenaive.ai/docs/cli/overview
- Support (tickets, bug reports): https://usenaive.ai/docs/getting-started/support
- SDK reference: https://usenaive.ai/docs/sdk/overview
- MCP server: https://usenaive.ai/docs/mcp/overview
- Use-case manifests: https://usenaive.ai/customer-support-agent/skill.md · https://usenaive.ai/recruiting-agent/skill.md · https://usenaive.ai/accounting-agent/skill.md
- Docs index for crawlers: https://usenaive.ai/docs/llms.txt

## Suggested first run

```bash
npm install -g @usenaive-sdk/cli
# 1. Authenticate WITH the operator (ask: log in, or register?)
naive login --email <email> --password <pw>
naive status                          # confirm auth + credits
# 2. Declare. Ask first; grant only what they asked for.
naive init                            # scaffold (defineProject, one runtime.durable() team), then grow it
# A durable team needs the runtime's operator credential, out of band — AND a deployment
# that has the durable runtime at all. Production has one, so export the credential and
# expect a real placement; without it the team comes back runtime_credential_required
# (read placement.code) while the rest of the config applies.
export NAIVE_DURABLE_CREDENTIAL_<TEAM>=<operator-credential>
naive up                              # apply infra, programs, roles, brains and teams
# 3. Create the tenant every teams call is addressed to. Nothing creates one implicitly.
naive users create --external-id <your-id> --label <name>
naive use <tenant-user-id>            # or pass --tenant on each command
# 4. Read the honesty report before you claim anything is enforcing
naive teams plan <team> --tenant <tenant-user-id>
naive teams roster <team> --tenant <tenant-user-id>
```
