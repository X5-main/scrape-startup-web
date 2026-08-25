# Naïve — Recruiting Agent Onboarding (skill.md)

> Connect your ATS and calendar, build a live candidate pipeline, and let a governed team source and screen candidates — with every first-touch message gated on a human, because it is a real message to a real person.

## Start here — read the base manifest first

This is a **use-case specialisation**. It does not repeat the base manifest, and the base manifest is not optional: it carries the operating rules you must follow, the noun set, the governance model, the brain, and — the part you cannot guess — which parts of the runtime surface this control plane actually serves today.

- **Base onboarding manifest:** https://usenaive.ai/skill.md

Do its onboarding first (authenticate *with* the operator, install, verify connectivity), then return here.

## What you're building

A **recruiting team**: one `team` of governed agents on the durable runtime, reading a **company brain** partitioned as `talent`, plus the managed Postgres store, object storage and web-deployed dashboard the work needs — all declared in one `naive.config.ts`.

Two roles, deliberately: `recruiter` is the **lead** (exactly one, structurally), and `sourcer` reports to it along a declared edge.

**Neither the lead nor any member may promote.** Turning a proposal into company truth is an **operator** action needing a named human who is not the proposer. `promote` is absent from the agent ability union, so a config granting it does not compile.

## Step 1 — ask the operator (discovery)

Ask these, and confirm the answers, before you declare anything:

- Which ATS do you use, and should the team write back into it or run its own pipeline?
- Which roles are open, and what are the must-haves versus nice-to-haves for each?
- What tone and cadence should outreach use, and from which domain should it send?
- Whose calendars should interviews be booked against, and what stages exist?
- What compliance rules apply — EEO, data retention, regions to include or exclude?

Two more the older version of this manifest never asked, and must:

- **How long should the team believe a candidate fact?** That is `retention` on the `talent` partition. It is required, and it may only be narrower than the company's.
- **Who approves a first-touch message?** It is approval-gated by declaration, with a named approver and a deadline. Ask who, and how long they have.

## Step 2 — connect their existing systems

Use `connections` (OAuth into a third-party account) and `vault` (per-tenant encrypted credentials). Connect only what they confirmed in Step 1.

- ATS — Greenhouse, Lever, Ashby, Workable
- Sourcing surfaces — job boards and the open web, via the cloud browser
- Calendar & email — the team's own outreach inbox and the calendars interviews land on
- Enrichment — profile and contact enrichment providers

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
    episodes: "30d",
    proposals: "14d",
    documents: "365d",
  },
  bounds: brainDefaults.bounds,
  writes: { mode: "review", promoteBy: "operator", scan: "enforce", witnessedReaffirm: true },
  recall: { keywords: true, fanOut: { armTimeout: "8s", onArmFailure: "report" } },
  partitions: {
    talent: {
      // A candidate fact ages faster than a company belief. Narrower than the
      // company, which is the only direction a partition may move.
      retention: { beliefs: "180d", episodes: "30d" },
      recall: { keywords: true, vector: { floor: 0.35 }, graph: { hops: 2, limit: 8 } },
      writes: { mode: "propose" },
    },
  },
  lanes: { enabled: true, retention: { beliefs: "30d" }, writes: { mode: "direct" } },
});

const sourcer = agent({
  instructions:
    "You source candidates against each open role's rubric. Cite [B*] for a candidate fact and " +
    "[L*] for a sourcing rule. You may not contact anyone.",
  model: { use: "anthropic/claude-haiku-4.5" },
  can: [skills.browser, skills.search, skills.llm, "connections"],
  brain: acme.view({ partition: "talent", lane: true, can: ["recall", "attach", "propose"] }),
  governance: {
    capabilities: {
      default: "deny",
      rules: [
        { allow: skills.browser },
        { allow: skills.search },
        { allow: skills.llm },
        { deny: skills.email.send, because: "first contact is the recruiter's, and it is gated" },
        { deny: skills.phone.send, because: "same" },
      ],
    },
    spend: { reserve: [{ bucket: "agent:sourcer", cap: "$50/mo", onExceed: "park" }] },
  },
});

const recruiter = agent({
  instructions:
    "You run recruiting. Every first-touch message is a real message to a real person: it is " +
    "approval-gated, and that is deliberate. Cite [B*] and [L*].",
  is: identity.business(),
  model: { use: "anthropic/claude-sonnet-4.6" },
  has: { email: true, phone: { sms: true } },
  can: [skills.email.send, skills.phone.send, skills.llm, skills.search, "connections", "vault"],
  brain: acme.view({ partition: "talent", can: ["recall", "attach", "remember", "reaffirm"] }),
  governance: {
    capabilities: {
      default: "deny",
      rules: [
        { allow: skills.llm },
        { allow: skills.search },
        {
          allow: skills.email.send,
          approve: { by: approver.membership("operator"), within: "24h", quorum: 1 },
        },
        {
          allow: skills.phone.send,
          approve: { by: approver.membership("operator"), within: "4h", quorum: 1 },
        },
      ],
    },
    spend: { reserve: [{ bucket: "agent:recruiter", cap: "$75/mo", onExceed: "park" }] },
  },
});

export default defineConfig({
  project: "acme-recruiting",

  infrastructure: {
    cloud: {
      website: cloud.web({ framework: "nextjs", dir: "." }),
      candidates: cloud.postgres({ size: "small" }),
      resumes: cloud.bucket({ public: false }),
    },
  },

  company: {
    name: "Acme, Inc.",
    brain: acme,
    residency: { jurisdiction: "us", allowEgressTo: ["us"] },
    business: {
      entity: business.entity({ form: "llc", verify: "kyb", legalName: "Acme, Inc." }),
      email: business.email({ domain: "talent.acme.com", warmup: true }),
      phone: business.phone({ a2p: { brand: "Acme Talent" } }),
    },
    governance: governance({
      capabilities: {
        default: "deny",
        rules: [
          { allow: skills.brain },
          { allow: skills.search },
          { allow: skills.llm },
          { allow: skills.browser },
          { allow: skills.email.send, when: { recipients: { lte: 25 } } },
          { deny: skills.payments, because: "recruiting never moves money" },
          { deny: skills.cards, because: "same" },
        ],
      },
      spend: {
        reserve: [{ bucket: "company", cap: "$1500/mo", onExceed: "deny" }],
        meter: [{ bucket: "company", subject: "llm.tokens", alertAt: "$300/day" }],
        unpriceable: "park",
      },
      limits: limits({ concurrency: { toolCalls: 6 }, rate: { toolCalls: "90/min" } }),
    }),
  },

  teams: {
    sourcing: team({
      runtime: runtime.durable({
        sleepAfter: "15m",
        workspace: { isolation: "os-kernel", egress: { mode: "deny-all" }, quota: "512mb" },
      }),
      lead: recruiter,
      agents: { sourcer },
      // `Edge<keyof agents | "lead">`. Writing `["lead", "sorcer"]` here does not
      // compile — it used to be a message delivered to nobody at 3am.
      edges: [["lead", "sourcer"]],
      brain: acme.partition("talent"),
      review: {
        rubric: [
          "Does every candidate assessment cite the rubric criterion it scores?",
          "Is every claimed candidate fact sourced to a document or a page, not inferred?",
          "Did it stop before first contact and wait for the approval?",
        ],
      },
      governance: {
        capabilities: {
          default: "deny",
          rules: [
            { allow: skills.brain },
            { allow: skills.search },
            { allow: skills.llm },
            { allow: skills.browser },
            { allow: skills.email.send },
            { allow: skills.phone.send },
          ],
        },
        spend: { reserve: [{ bucket: "team:sourcing", cap: "$200/mo", onExceed: "park" }] },
      },
    }),
  },
});
```

<!-- printed from packages/lp/src/examples/recruiting.naive.config.ts, which the compiler checks. Do not hand-edit. -->

```bash
# The durable runtime issues this. It is NEVER in naive.config.ts — that file is committed.
export NAIVE_DURABLE_CREDENTIAL_SOURCING=<operator-credential>

naive up        # apply infrastructure, business programs, roles, brains and teams
```

⚠ **`naive up` applies the `teams:` block, and it reports per team what happened.** Read `result.teams[].placement` — `placed`, `converged`, or `refused` with a `code` and a `reason` — and `result.brains` for each declared brain. A refused team makes `naive up` exit **non-zero**; do not report success on the exit code alone.

⚠ **The credential above is necessary and not sufficient — but on naive's production control plane it is now the LAST thing missing rather than the first.** As of 2026-08-06 `api.usenaive.ai` has `VETTA_CONTROL_URL` set and both cutover prerequisites signed off, so a declared durable team comes back `placed` when the credential is supplied and `runtime_credential_required` when it is not. On any OTHER deployment, expect a refusal. Placement is checked in order: `runtime_not_configured` (this deployment has no durable runtime, so no tenant on it can be on one — a deployment fact no credential changes), then `runtime_cutover_not_permitted` (`error.details.missing` names each unsigned prerequisite), and only then `runtime_credential_required`. None of those is a bug and none is something to work around. Read the `code` you actually got and tell the operator that reason — do not report the credential as the fix unless the credential is what the refusal named. The infrastructure, the business programs, the roles and the brains in the same config apply normally. See *What is served today* in the base manifest.

## Step 4 — read the honesty report before you claim anything

```bash
naive teams plan sourcing --tenant <tenant-user-id>
naive teams roster sourcing --tenant <tenant-user-id>
```

`plan` is read-only and it is the review artifact. It prints the digests, the spend caps and their enforcement class, the residency, the brain binding and attestation parity — **and, per field, `unavailable_because` when it cannot report one.** Read those out loud to the operator. A field it cannot report is not a field you may claim.

## Step 5 — what this team may do

Read it off the block in Step 3, not off a list on this page. A prose list beside a config is a second source of truth, and the two published lists this manifest replaces had already drifted apart from their own configs.

- **`can`** on each role — the tools that role may reach at all.
  🔴 **`skills.llm` is granted in the block above, and granting it is not the same as being able to spend on it.** LLM routing is the one primitive the 20 free signup credits do not buy: until the operator has bought credits (`naive billing topup`) or subscribed (`naive billing subscribe`), every routing call answers `402 llm_routing_requires_payment`, whatever this config says (and `naive llm chat` turns that into a `decision_required` envelope with exit 4 — a question for the operator, not a retry). Every other primitive here runs on the free grant. Tell the operator that before you build a team whose work depends on it — the full rule, the refusal body and the handling are in the base manifest under *The one primitive the free credits do not buy*.
- **`governance.capabilities.rules`** — `allow`, `deny` with a mandatory `because`, and `approve` with a named approver and a deadline. Last match wins within a layer; a lower layer may only narrow.
- **`governance.spend.reserve`** — the only spend class that stops anything. `meter` alerts; `brake` may be inert.
- **`brain`** on each role — which partition, whether it has a private lane, and which of the eight abilities it holds.

The roles here are `recruiter` and `sourcer`. The lead is `recruiter`; the wire name of that slot is the literal `lead`, which is what the edge `["lead", "sourcer"]` refers to — not the role's own name.

## Step 6 — the brain: what it knows, and what it may learn

- The team reads a **company brain** through its partition, `talent`.
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

- A web-deployed pipeline dashboard — stages, scorecards and outreach status per role
- A Postgres candidate store normalizing profiles, roles and interactions across every source
- Resume and attachment storage tied to each candidate record

## Step 8 — the recurring work

- Sourcing — find and rank candidates against each open role's rubric
- Screening — summarize profiles, score against must-haves, shortlist
- Outreach — personalized messages from a custom-domain inbox, every one approval-gated
- Scheduling — propose times and book against the right calendars

Work reaches a team with one verb:

```bash
naive teams submit sourcing "<what you want done>" --tenant <tenant-user-id>
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
