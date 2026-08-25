# Naïve — Accounting Agent Onboarding (skill.md)

> Wire up your payment processors and accounting systems, stand up a live financials dashboard, and let a governed team reconcile transactions and prepare the close — proposing every entry, never moving money.

## Start here — read the base manifest first

This is a **use-case specialisation**. It does not repeat the base manifest, and the base manifest is not optional: it carries the operating rules you must follow, the noun set, the governance model, the brain, and — the part you cannot guess — which parts of the runtime surface this control plane actually serves today.

- **Base onboarding manifest:** https://usenaive.ai/skill.md

Do its onboarding first (authenticate *with* the operator, install, verify connectivity), then return here.

## What you're building

An **accounting team**: one `team` of governed agents on the durable runtime, reading a **company brain** partitioned as `books`, plus the managed Postgres store, object storage and web-deployed dashboard the work needs — all declared in one `naive.config.ts`.

One role, deliberately: `bookkeeper` is the **lead**, `agents` is empty and `edges` is empty. A team with nobody to delegate to is a normal team, not a degenerate one.

**Neither the lead nor any member may promote.** Turning a proposal into company truth is an **operator** action needing a named human who is not the proposer. `promote` is absent from the agent ability union, so a config granting it does not compile.

## Step 1 — ask the operator (discovery)

Ask these, and confirm the answers, before you declare anything:

- Which payment processors and accounting system do you use today, and who owns those logins?
- What is your fiscal calendar and target close date each month?
- What is your chart of accounts, and are there standing rules for how to categorize?
- Who signs off on journal entries and on the final close?
- What reports do you need, to whom, and on what cadence?

Two more the older version of this manifest never asked, and must:

- **How long should the team believe something it learned?** That is `retention`. It is required, and the ceiling is 365 days.
- **Who may turn a drafted categorization rule into company truth?** That is accepting a brain proposal: an operator action needing a named human who is not the proposer.

## Step 2 — connect their existing systems

Use `connections` (OAuth into a third-party account) and `vault` (per-tenant encrypted credentials). Connect only what they confirmed in Step 1.

- Payment processors — Stripe, Square, PayPal, Shopify Payments
- Accounting systems — QuickBooks Online, Xero, NetSuite
- Banking & cards — bank feeds, corporate card programs
- Billing & invoicing — the tools where revenue and bills originate

```bash
naive connections connect <toolkit>        # OAuth into an existing system
naive vault put <service>.api_key <value>  # store a key the operator pastes
```

Ask before each `connect`: it grants a third party standing access, and it is approval-gated for exactly that reason. If the response carries `status: "pending_approval"`, the connection has **not** happened — surface the approval and stop.

## Step 3 — declare it (`naive.config.ts`)

`naive init` scaffolds a smaller config on this same surface — `defineProject` with `infrastructure`, `kits:` and one `teams:` entry on `runtime.hermes()`, not the older flat `agents:`/`limits:` shape. Grow it into this. Every line below compiles against the shipped `@usenaive-sdk/iac` and is accepted by `defineConfig` at define time.

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

const acme = brain({
  retention: {
    beliefs: "365d",
    lessons: { fact: "180d", rule: "365d", postmortem: "90d" },
    episodes: "90d", // a ledger keeps raw observations longer than a helpdesk
    proposals: "14d",
    documents: "365d",
  },
  bounds: brainDefaults.bounds,
  writes: { mode: "review", promoteBy: "operator", scan: "enforce", witnessedReaffirm: true },
  recall: { keywords: true, fanOut: { armTimeout: "8s", onArmFailure: "report" } },
  partitions: {
    books: {
      // A ledger's beliefs inherit the company's full 365d — omitting a noun
      // inherits it. Only the raw observations narrow. Any value WIDER than the
      // company's throws `retention_widens_parent`, naming both levels.
      retention: { episodes: "60d" },
      recall: { keywords: true, vector: { floor: 0.35 }, graph: { hops: 2, limit: 8 } },
      writes: { mode: "propose" },
    },
  },
  lanes: { enabled: true, retention: { beliefs: "30d" }, writes: { mode: "direct" } },
});

const bookkeeper = agent({
  instructions:
    "You keep the books. Categorize transactions against the chart of accounts. Cite [B*] for a " +
    "ledger fact and [L*] for a categorization rule. Never move money: propose and stop.",
  is: identity.business(),
  model: { use: "anthropic/claude-sonnet-4.6" },
  has: { email: true },
  can: [skills.llm, skills.search, skills.email.send, "connections", "vault"],
  brain: acme.view({
    partition: "books",
    lane: true,
    can: ["recall", "attach", "remember", "propose"],
  }),
  governance: {
    capabilities: {
      default: "deny",
      rules: [
        { allow: skills.llm },
        { allow: skills.search },
        {
          // A statement leaving the company is a real-world action.
          allow: skills.email.send,
          approve: { by: approver.membership("finance"), within: "24h", quorum: 1 },
        },
        { deny: skills.payments, because: "a bookkeeper proposes; it never sends" },
        { deny: skills.cards, because: "same" },
      ],
    },
    spend: { reserve: [{ bucket: "agent:bookkeeper", cap: "$100/mo", onExceed: "park" }] },
  },
});

export default defineConfig({
  project: "acme-books",

  infrastructure: {
    cloud: {
      website: cloud.web({ framework: "nextjs", dir: "." }),
      ledger: cloud.postgres({ size: "small" }),
      documents: cloud.bucket({ public: false }),
    },
  },

  company: {
    name: "Acme, Inc.",
    brain: acme,
    residency: { jurisdiction: "us", allowEgressTo: ["us"] },
    business: {
      entity: business.entity({ form: "llc", verify: "kyb", legalName: "Acme, Inc." }),
      email: business.email({ domain: "books.acme.com" }),
    },
    governance: governance({
      capabilities: {
        default: "deny",
        rules: [
          { allow: skills.brain },
          { allow: skills.llm },
          { allow: skills.search },
          { allow: skills.email.send, when: { recipients: { lte: 10 } } },
          // Statute denies these unattended anyway; saying it here makes the
          // intent readable in `naive teams plan` instead of implied.
          { deny: skills.payments, because: "the books team never moves money" },
          { deny: skills.cards, because: "same" },
        ],
      },
      spend: {
        reserve: [{ bucket: "company", cap: "$800/mo", onExceed: "deny" }],
        meter: [{ bucket: "company", subject: "llm.tokens", alertAt: "$150/day" }],
        unpriceable: "park",
      },
      limits: limits({ concurrency: { toolCalls: 4 }, rate: { toolCalls: "60/min" } }),
    }),
  },

  teams: {
    books: team({
      runtime: runtime.durable({
        sleepAfter: "15m",
        workspace: { isolation: "os-kernel", egress: { mode: "deny-all" }, quota: "512mb" },
      }),
      lead: bookkeeper, // one role, no delegation: `agents` and `edges` are empty
      agents: {},
      edges: [],
      brain: acme.partition("books"),
      review: {
        rubric: [
          "Is every transaction categorized against a declared account?",
          "Does every anomaly flag cite the transaction it is about?",
          "Did it stop and propose rather than move money?",
        ],
      },
      governance: {
        capabilities: {
          default: "deny",
          rules: [
            { allow: skills.brain },
            { allow: skills.llm },
            { allow: skills.search },
            { allow: skills.email.send },
          ],
        },
        spend: { reserve: [{ bucket: "team:books", cap: "$300/mo", onExceed: "park" }] },
      },
    }),
  },
});
```

<!-- printed from packages/lp/src/examples/accounting.naive.config.ts, which the compiler checks. Do not hand-edit. -->

```bash
# The durable runtime issues this. It is NEVER in naive.config.ts — that file is committed.
export NAIVE_DURABLE_CREDENTIAL_BOOKS=<operator-credential>

naive up        # apply infrastructure, business programs, roles, brains and teams
```

⚠ **`naive up` applies the `teams:` block, and it reports per team what happened.** Read `result.teams[].placement` — `placed`, `converged`, or `refused` with a `code` and a `reason` — and `result.brains` for each declared brain. A refused team makes `naive up` exit **non-zero**; do not report success on the exit code alone.

⚠ **The credential above is necessary and not sufficient — but on naive's production control plane it is now the LAST thing missing rather than the first.** As of 2026-08-06 `api.usenaive.ai` has `VETTA_CONTROL_URL` set and both cutover prerequisites signed off, so a declared durable team comes back `placed` when the credential is supplied and `runtime_credential_required` when it is not. On any OTHER deployment, expect a refusal. Placement is checked in order: `runtime_not_configured` (this deployment has no durable runtime, so no tenant on it can be on one — a deployment fact no credential changes), then `runtime_cutover_not_permitted` (`error.details.missing` names each unsigned prerequisite), and only then `runtime_credential_required`. None of those is a bug and none is something to work around. Read the `code` you actually got and tell the operator that reason — do not report the credential as the fix unless the credential is what the refusal named. The infrastructure, the business programs, the roles and the brains in the same config apply normally. See *What is served today* in the base manifest.

## Step 4 — read the honesty report before you claim anything

```bash
naive teams plan books --tenant <tenant-user-id>
naive teams roster books --tenant <tenant-user-id>
```

`plan` is read-only and it is the review artifact. It prints the digests, the spend caps and their enforcement class, the residency, the brain binding and attestation parity — **and, per field, `unavailable_because` when it cannot report one.** Read those out loud to the operator. A field it cannot report is not a field you may claim.

## Step 5 — what this team may do

Read it off the block in Step 3, not off a list on this page. A prose list beside a config is a second source of truth, and the two published lists this manifest replaces had already drifted apart from their own configs.

- **`can`** on each role — the tools that role may reach at all.
  🔴 **`skills.llm` is granted in the block above, and granting it is not the same as being able to spend on it.** LLM routing is the one primitive the 20 free signup credits do not buy: until the operator has bought credits (`naive billing topup`) or subscribed (`naive billing subscribe`), every routing call answers `402 llm_routing_requires_payment`, whatever this config says (and `naive llm chat` turns that into a `decision_required` envelope with exit 4 — a question for the operator, not a retry). Every other primitive here runs on the free grant. Tell the operator that before you build a team whose work depends on it — the full rule, the refusal body and the handling are in the base manifest under *The one primitive the free credits do not buy*.
- **`governance.capabilities.rules`** — `allow`, `deny` with a mandatory `because`, and `approve` with a named approver and a deadline. Last match wins within a layer; a lower layer may only narrow.
- **`governance.spend.reserve`** — the only spend class that stops anything. `meter` alerts; `brake` may be inert.
- **`brain`** on each role — which partition, whether it has a private lane, and which of the eight abilities it holds.

The only role here is `bookkeeper`, and it is the lead. There are no edges, because there is nobody to delegate to. When you add a second role, its edge names the lead by the literal `lead`, not by `bookkeeper`.

## Step 6 — the brain: what it knows, and what it may learn

- The team reads a **company brain** through its partition, `books`.
- **This config declares ONE brain, which is what this use case needs.** If the operator asks for more — a separate corpus for legal, or a shared org trunk beside a project brain — declare them with `brains({ default, declared })` and bind by name (`hive.view("legal", { can: [...] })`). Everything below is identical: it is the same declaration at a different arity. See the base manifest's *Several brains*.
- A role declared with `lane: true` has a private working set keyed by its role name; nothing it writes there is visible to another role.
- **Read down, propose up, promote never.**
- Retention on the partition may only **narrow** the company's. A wider value throws `retention_widens_parent` at define time, naming both levels.
- Instruct every role to cite: `[B*]` for a belief (descriptive), `[L*]` for a lesson (normative).
- `recall` is a **fan-out**, not a router: parallel arms, per-arm failure isolation, degradation reported rather than thrown.
- A write can refuse, and a refusal is a **value** you inspect. Under `mode: "review"`, a write that came back uncommitted is the normal, healthy answer — it became a proposal for a human.

```bash
naive brain list                                       # every brain, the default marked
naive brain attach "<what this run is trying to do>"   # ambient context; free
naive brain recall "<question>"                        # keyword + vector; free
naive brain remember "<what you learned>"              # writes, or proposes
naive brain proposals                                  # the review queue
```

Every content command takes `--kb <uuid>`, `--brain <name|id>` or `--agent <id|name>` to name a brain; with none of them it uses the company default. `naive brain connect <brain> --agent <a>` records which brain an agent works out of — **tell the operator it is a default, not a permission**: it grants nothing that was withheld, and an unscoped call still reads the default.

## Step 7 — build the dashboard and the data model

- A web-deployed financials dashboard — revenue, expenses, burn, runway, AR/AP aging, cash position
- A Postgres ledger that mirrors and normalizes transactions from every connected source
- Document storage for receipts, invoices and statements filed against transactions

## Step 8 — the recurring work

- Reconciliation — match every account, categorize transactions, flag anomalies against the chart of accounts
- Reporting — P&L, balance sheet and cash flow, drafted and sent for approval
- Document capture — parse inbound invoices and bills and post them to the ledger as proposals

Work reaches a team with one verb:

```bash
naive teams submit books "<what you want done>" --tenant <tenant-user-id>
```

⚠ **Do not promise that verb until you have asked which deployment you are on.** It needs the durable runtime, which naive's production control plane HAS as of 2026-08-06 — but that is a fact about one deployment and does not travel. It is served only for a tenant that is ON the durable runtime, where the goal is admitted through the same intake a person's message takes. A deployment with no durable runtime has no such tenant — that is a fact about the deployment, not about the tenant — and a tenant on the frozen **hermes** runtime gets `501 not_configured` with `error.details.runtime: "hermes"` and a pointer to the legacy route that does the equivalent job. Read `provider` on any response — `naive teams show` prints it — before you tell an operator anything, and treat "served on the durable runtime" as a condition to check rather than a capability to announce. Recurring scheduling (`naive teams schedule`), `unblock`, `stop`, `say` and `watch` are in exactly the same position.

Do **not** substitute `naive tasks create` or `naive cron create` when the refusal names them. Those write into the frozen orchestration runtime — a different execution model, a different governance path, and a migration you would then owe. A refusal that names a legacy route is telling you what that tenant has, not recommending you use it.

What works for **every** tenant, on either runtime: `naive teams show`, `plan`, `roster`, `board`, `tasks`, `task`, `runs`, `events`, `cost`, `diagnose`, `approvals`, and `naive teams decide` to allow or deny one approval.

## Reference

- Base onboarding manifest: https://usenaive.ai/skill.md
- Infrastructure as Code: https://usenaive.ai/docs/getting-started/iac
- API reference: https://usenaive.ai/docs/api-reference/overview
- CLI reference: https://usenaive.ai/docs/cli/overview
- SDK reference: https://usenaive.ai/docs/sdk/overview
- MCP server: https://usenaive.ai/docs/mcp/overview
