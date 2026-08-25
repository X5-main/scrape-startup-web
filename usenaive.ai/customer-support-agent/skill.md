# Naïve — Customer Support Agent Onboarding (skill.md)

> Connect your helpdesk and knowledge base, build a live support dashboard, and let a governed team triage tickets, draft grounded replies from the company brain, and escalate — on its own governed inbox and number.

## Start here — read the base manifest first

This is a **use-case specialisation**. It does not repeat the base manifest, and the base manifest is not optional: it carries the operating rules you must follow, the noun set, the governance model, the brain, and — the part you cannot guess — which parts of the runtime surface this control plane actually serves today.

- **Base onboarding manifest:** https://usenaive.ai/skill.md

Do its onboarding first (authenticate *with* the operator, install, verify connectivity), then return here.

## What you're building

A **customer support team**: one `team` of governed agents on the durable runtime, reading a **company brain** partitioned as `support`, plus the managed Postgres store, object storage and web-deployed dashboard the work needs — all declared in one `naive.config.ts`.

Two roles, deliberately: `supportLead` is the **lead** (exactly one, structurally), and `tier1` reports to it along a declared edge.

**Neither the lead nor any member may promote.** Turning a proposal into company truth is an **operator** action needing a named human who is not the proposer. `promote` is absent from the agent ability union, so a config granting it does not compile.

## Step 1 — ask the operator (discovery)

Ask these, and confirm the answers, before you declare anything:

- Which helpdesk do you use, and should the team reply inside it or from its own inbox?
- Where does your source-of-truth knowledge live, and what topics are in scope versus out?
- What may the team do autonomously, and what needs human approval — refunds, credits, account changes?
- What are your SLA targets and escalation paths — who, and where?
- What tone and brand voice should replies use?

Two more the older version of this manifest never asked, and must:

- **How long should the team believe something it learned from a ticket?** That is `retention` on the `support` partition — 90 days for beliefs in the block below, narrower than the company's 365.
- **Who may turn a drafted answer into company truth?** That is accepting a brain proposal: an operator action needing a named human who is not the proposer.

## Step 2 — connect their existing systems

Use `connections` (OAuth into a third-party account) and `vault` (per-tenant encrypted credentials). Connect only what they confirmed in Step 1.

- Helpdesk — Zendesk, Intercom, Front, Help Scout
- Channels — a custom-domain support inbox and an SMS-capable number
- Knowledge — the docs, KB and macros the team grounds answers in
- Ops — Slack or on-call for escalation and human handoff

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

```bash
# The durable runtime issues this. It is NEVER in naive.config.ts — that file is committed.
export NAIVE_DURABLE_CREDENTIAL_SUPPORT=<operator-credential>

naive up        # apply infrastructure, business programs, roles, brains and teams
```

⚠ **`naive up` applies the `teams:` block, and it reports per team what happened.** Read `result.teams[].placement` — `placed`, `converged`, or `refused` with a `code` and a `reason` — and `result.brains` for each declared brain. A refused team makes `naive up` exit **non-zero**; do not report success on the exit code alone.

⚠ **The credential above is necessary and not sufficient — but on naive's production control plane it is now the LAST thing missing rather than the first.** As of 2026-08-06 `api.usenaive.ai` has `VETTA_CONTROL_URL` set and both cutover prerequisites signed off, so a declared durable team comes back `placed` when the credential is supplied and `runtime_credential_required` when it is not. On any OTHER deployment, expect a refusal. Placement is checked in order: `runtime_not_configured` (this deployment has no durable runtime, so no tenant on it can be on one — a deployment fact no credential changes), then `runtime_cutover_not_permitted` (`error.details.missing` names each unsigned prerequisite), and only then `runtime_credential_required`. None of those is a bug and none is something to work around. Read the `code` you actually got and tell the operator that reason — do not report the credential as the fix unless the credential is what the refusal named. The infrastructure, the business programs, the roles and the brains in the same config apply normally. See *What is served today* in the base manifest.

## Step 4 — read the honesty report before you claim anything

```bash
naive teams plan support --tenant <tenant-user-id>
naive teams roster support --tenant <tenant-user-id>
```

`plan` is read-only and it is the review artifact. It prints the digests, the spend caps and their enforcement class, the residency, the brain binding and attestation parity — **and, per field, `unavailable_because` when it cannot report one.** Read those out loud to the operator. A field it cannot report is not a field you may claim.

## Step 5 — what this team may do

Read it off the block in Step 3, not off a list on this page. A prose list beside a config is a second source of truth, and the two published lists this manifest replaces had already drifted apart from their own configs.

- **`can`** on each role — the tools that role may reach at all.
  🔴 **`skills.llm` is granted in the block above, and granting it is not the same as being able to spend on it.** LLM routing is the one primitive the 20 free signup credits do not buy: until the operator has bought credits (`naive billing topup`) or subscribed (`naive billing subscribe`), every routing call answers `402 llm_routing_requires_payment`, whatever this config says (and `naive llm chat` turns that into a `decision_required` envelope with exit 4 — a question for the operator, not a retry). Every other primitive here runs on the free grant. Tell the operator that before you build a team whose work depends on it — the full rule, the refusal body and the handling are in the base manifest under *The one primitive the free credits do not buy*.
- **`governance.capabilities.rules`** — `allow`, `deny` with a mandatory `because`, and `approve` with a named approver and a deadline. Last match wins within a layer; a lower layer may only narrow.
- **`governance.spend.reserve`** — the only spend class that stops anything. `meter` alerts; `brake` may be inert.
- **`brain`** on each role — which partition, whether it has a private lane, and which of the eight abilities it holds.

The roles here are `supportLead` and `tier1`. The lead is `supportLead`; the wire name of that slot is the literal `lead`, which is what the edge `["lead", "tier1"]` refers to — not the role's own name.

## Step 6 — the brain: what it knows, and what it may learn

- The team reads a **company brain** through its partition, `support`.
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

- A web-deployed support dashboard — ticket volume, SLA and first response, CSAT, escalation queue
- A Postgres store of tickets, conversations and resolution outcomes across channels
- Attachment storage for screenshots, logs and files customers send

## Step 8 — the recurring work

- Triage — classify, prioritize and route inbound tickets by intent and urgency
- Drafting — grounded replies from the brain with [B*] and [L*] citations, ready for one-click send
- Resolution — run safe self-serve actions and close resolved tickets
- Escalation — detect at-risk conversations and hand off to a human with full context

Work reaches a team with one verb:

```bash
naive teams submit support "<what you want done>" --tenant <tenant-user-id>
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
