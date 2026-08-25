> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Infrastructure as Code

> Declare shared infrastructure, business programs, and agent blueprints in naive.config.ts.

`@usenaive-sdk/iac` is the build-time, declarative half of the SDK. You author a
`naive.config.ts`, and `naive up` sets it up. The split is **declaration vs execution**:
`defineProject(...)` runs when the config file is evaluated — it validates and refuses,
and makes no API call — and `naive up` is the execution step that plans and applies what
the config declares. A refusal from `defineProject` therefore surfaces anywhere the file
is evaluated (`naive up`, `naive up --plan`, or your own build), before anything is
applied.

The entrypoint is **`defineProject`** — strict: declaring a field nothing consumes is a
named refusal at define time (`declared_unconsumed: <path> …`) instead of a green apply
that enforces nothing. `defineConfig` remains as a permanent `@deprecated` lenient
alias with the behavior every existing config was written against; `naive up` prints
what such a config declared that nothing reads. Nothing needs migrating — switching is
never urgent, only strictly better — but new configs should use `defineProject`. See
[Strict mode](#strict-mode-what-defineproject-refuses) for the exact list and a real
refusal, and the
[migration guide](/docs/migration-guides/defineconfig-to-defineproject) for moving an
existing config over.

**`naive up` issues no per-tenant resources** — no KYB, no card issuing, no carrier call
until `forUser(id).provision(role)`. It is not side-effect free, though, and two of its
effects are company-scoped and durable:

* **`company.brains` is provisioned.** Each declared brain becomes a knowledge base, and the
  declared default is promoted. `naive up` reports each one as created or converged. These
  **survive `naive down`** — a brain is the company's accumulated knowledge, and tearing down
  a deployment does not mean discarding it.
* **declared `teams:` are materialized and placed.** `naive up` stamps out each team's agents
  and reports per-team `placement` (placed / converged / refused) and per-agent
  `provision_status`. A refused team makes `naive up` exit non-zero.

Read `result.teams[].placement` and `result.brains` rather than inferring either from the
exit code alone.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/iac
naive init        # scaffold a starter naive.config.ts
```

## The shape

A config has two halves:

* **`infrastructure`** — set up **once** for the whole project: `cloud` (web,
  database, storage) and `business` (the real-world programs agents draw from).
* **`agents`** — a blueprint **per role**. `naive.forUser(id).provision(role)`
  stamps out a fresh, isolated, governed copy per user.

Two more blocks are additive: `company: { brain | brains, residency, governance }` and
`teams: { … }` declare the durable-runtime surface (see [Teams](/docs/getting-started/teams)).
Declaring either turns on define-time validation for those blocks only. Write
`brain: brain({ … })` for one, `brains: brains({ default, declared })` for several —
writing both is `company_brain_and_brains` at define time ([the brain](/docs/architecture/brain)
has the whole shape). `runtime.pool()` (below) is the legacy runtime; on the team surface
it is `runtime.hermes()` — `pool` is optional: omitted means the company's one
hosted-hermes container, and a given name must match a pool declared under the config's
top-level `runtime:` block (an unknown name is `hermes_pool_unknown` at define time). The
current runtime is `runtime.durable({ … })` — which is also what a team with no `runtime:`
line gets, so choosing hermes is always an explicit act. One member can be pinned on its own with `agent({ runsOn })`; see
[Choosing a runtime](/docs/getting-started/teams#choosing-a-runtime). Every existing config
keeps compiling.

## More than one project

`project:` is the [project](/docs/getting-started/projects) this config applies to — the same
layer `naive projects` manages, and a plain string is one project. An organization that
needs several declares them under `projects:`, and `naive up` plans and applies each in
turn:

```ts theme={"theme":"css-variables"}
export default defineProject({
  project: "faceless-ugc",                              // still the root project
  infrastructure: { cloud: { db: cloud.postgres() } },  // inherited by both below

  projects: {
    support: project({ agents: { triage: agent({ /* … */ }) } }),
    growth:  project({ runtime: { pool: runtime.pool({ /* … */ }) } }),
  },
});
```

A block declared on a project **replaces** the root block of the same name; a block it
omits is inherited. Omit `projects:` entirely and nothing changes — the single-string form
is exactly what it always was.

```ts theme={"theme":"css-variables"}
import { defineProject, cloud, business, agent, identity, skills } from "@usenaive-sdk/iac";

export default defineProject({
  project: "faceless-ugc",

  // ── infrastructure: set up ONCE for the whole project ────────────────
  infrastructure: {
    // Cloud — one instance, everyone shares it. Naïve auto-injects secrets
    // (DATABASE_URL, bucket creds…) into the runtime.
    cloud: {
      website:  cloud.web({ framework: "nextjs", dir: "." }),
      database: cloud.postgres({ size: "serverless" }),
      storage:  cloud.bucket(), // generated videos + thumbnails
    },

    // Business — the real-world "programs" each agent draws from. Turning one ON
    // registers the shared PARENT; each agent then gets its OWN email / number /
    // card under it, via `has` below.
    business: {
      identity: business.entity({ form: "llc", verify: "kyb" }),       // mint LLCs + EINs
      email:    business.email({ domain: "creators.facelessugc.com" }), // verified sender
      phone:    business.phone({ a2p: { brand: "Faceless UGC" } }),     // A2P-registered brand
      cards:    business.cards({ funding: "balance" }),                 // card program
    },
  },

  // ── agents: a blueprint per ROLE ─────────────────────────────────────
  // Naïve stamps out a fresh, isolated copy per creator:
  //   naive.forUser(creatorId).provision("ugc")
  agents: {
    ugc: agent({
      is: identity.agent(),
      //   → make it a real, monetizable business later:
      //   is: identity.business(),   // (requires infrastructure.business.identity)

      // Each copy gets its OWN instance of an enabled program above.
      // You can only `has` what infrastructure.business turned on.
      has: {
        email: true,              // own address under the verified domain
        phone: { voice: false },  // own A2P number, SMS only
        // cards: omitted — content-only creator, no money to move
      },

      can: [
        skills.llm, skills.images, skills.video, skills.clips, skills.media,
        skills.social, skills.search, skills.seo, skills.aeo,
      ],

      limits: {
        budget: "$200/mo",                // alerts at 80%, hard-denies at cap
        approve: [skills.social.publish], // human OK before anything posts
      },
    }),
  },
});
```

```bash theme={"theme":"css-variables"}
naive up
#  cloud · website + database + storage  → provisioned
#  business · email + phone + cards      → registered
#  agents · ugc                          → ready
# No issuing / KYB / carrier calls until provision().
# Declared company.brains and teams: ARE applied — see result.brains / result.teams[].placement.
```

## Strict mode — what `defineProject` refuses

`defineProject` is `defineConfig` plus one pass: every field on the accept-and-drop
list that the config declares is refused at define time. The list is the set of fields
the DSL accepts but **nothing yet consumes** — declared, dropped (or carried and read by
nothing), and enforced nowhere. Under the lenient `defineConfig` they apply green and
`naive up` warns; under `defineProject` they refuse before anything is applied:

```
Error: declared_unconsumed: teams.support.lead.time is declared and NOT YET ENFORCED —
nothing consumes it, so it would apply green and enforce nothing. Remove the field
(reinstate it when a consumer lands), or keep this config on defineConfig, the lenient
legacy alias.
```

The refused-until-wired fields today: `agent().time`, `agent().secrets`,
`agent().skills`, `team().time`, `runtime.durable({ workspace })`, `company.residency`,
and the top-level `modules:` block. Wiring a field deletes its row from the one shared
list, which removes the refusal in the same edit — strictness only shrinks as consumers
land.

Separate from strictness, fields that ARE consumed — but only by one runtime — are not
refused on the other: a hermes-led team declaring `agent({ model })` or
`team({ review })` applies, and the plan/apply reports each such field in the team's
`unconsumed` list (e.g. `review (runtime.hermes)`). See
[Model, rubric and spend](/docs/getting-started/teams#model-rubric-and-spend--durable-manifest-fields).

## Builders

| Builder                                                                                                        | Purpose                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineProject({ project, projects?, infrastructure?, runtime?, kits?, agents?, systems?, company?, teams? })` | The config root — strict (see [above](#strict-mode-what-defineproject-refuses)). `project` names the [project](/docs/getting-started/projects) everything below it belongs to.                                                                                                         |
| `defineConfig({ … })`                                                                                          | The same call, lenient — a permanent `@deprecated` alias for configs written before strict mode.                                                                                                                                                                                  |
| `project({ name?, slug?, infrastructure?, runtime?, agents?, systems? })`                                      | One project inside the organization, for a config that declares more than one (see [above](#more-than-one-project)).                                                                                                                                                              |
| `cloud.web` / `cloud.postgres` / `cloud.bucket`                                                                | Shared cloud — web hosting, managed Postgres, object storage. Names are optional (derived from the project).                                                                                                                                                                      |
| `business.entity` / `business.email` / `business.phone` / `business.cards`                                     | The shared real-world programs. Turning one on registers the parent each agent draws from.                                                                                                                                                                                        |
| `agent({ is, has, can, limits })`                                                                              | An agent blueprint (a role), stamped out per user.                                                                                                                                                                                                                                |
| `identity.agent()` / `identity.business()`                                                                     | The agent's identity — lightweight, or a real legal entity.                                                                                                                                                                                                                       |
| `skills.*`                                                                                                     | The capability catalog (e.g. `skills.llm`, `skills.social.publish`, `skills.compute`, `skills.mobile`). Pass to `can` / `limits.approve`.                                                                                                                                         |
| `runtime.pool({ source, isolation, size?, autoscale? })`                                                       | A pre-warmed pool of hosted agent containers (optional; omit for BYO-runtime). `size` (or `autoscale.min`) sets how many warm containers to keep ready for instant claims; `autoscale.max` caps the total. Warming happens on `naive up` and is kept at target by the reconciler. |
| `system({ root, members, topology, budget })`                                                                  | A multi-agent system composed from agent roles. **`root` must be `"ceo"`** — the container's Hermes gateway and CEO chat only dispatch to that profile name.                                                                                                                      |

## The agent block

| Field            | Type                                        | Meaning                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `is`             | `identity.agent()` \| `identity.business()` | Lightweight agent identity, or a real legal entity (needs `business.entity`).                                                                                                                                                                                                                                                                                                 |
| `has`            | `{ email?, phone?, cards?, crypto? }`       | Per-agent instances of enabled business programs. `phone` accepts `{ voice?, sms? }`; `cards` accepts `{ limit? }`. `crypto` gives the agent its own [crypto wallet](/docs/getting-started/payments) for x402 payments and accepts `{ perTxMax?, dailyBudget? }` (decimal USDC) — unlike the others it has no shared `business.*` parent, since each wallet is standalone custody. |
| `can`            | `Skill[]`                                   | The skills this agent may use. Becomes the allowlist on its policy.                                                                                                                                                                                                                                                                                                           |
| `limits.budget`  | `"$200/mo"` (or `{ amount, period }`)       | Combined cost ceiling — alerts at 80%, hard-denies at cap.                                                                                                                                                                                                                                                                                                                    |
| `limits.approve` | `Skill[]`                                   | Skills that require a human OK before they run (e.g. `skills.social.publish`). `agent({ approve })` is a deprecated working alias — both spellings merge into the same approval list, deduplicated.                                                                                                                                                                           |
| `environment`    | `"sandbox"` \| `"production"`               | The [Environments](/docs/getting-started/environments) mode the agent's kit runs in. Declared ⇒ every apply converges the kit onto it; omitted ⇒ the kit's mode is left alone, so `naive env promote` survives a re-apply.                                                                                                                                                         |
| `loop`           | `{ cron, goal, name? }`                     | The agent's recurring wake-up: the platform's cron system wakes it on `cron` with `goal` as the run's prompt. Hermes-lane; registered idempotently on apply. See [the agent's loop](/docs/getting-started/teams#the-agents-loop--a-declared-cron-wake-up).                                                                                                                         |
| `governance`     | `ScopedGovernance`                          | Capability rules and a blocking `spend.reserve` cap, folded into the same policy `can`/`limits` build. Layered company \< team \< agent; a lower layer may only narrow (`governance_widens_company` / `governance_widens_team` at define time).                                                                                                                               |

### How it's enforced (not just declared)

When you `provision(role)`, the blueprint is translated into a **dedicated
AccountKit** for that agent and the agent is bound to it:

* `can` → an **allowlist**: only those skills are enabled; the governance
  gateway refuses anything else with `403`.
* `limits.approve` → **escalate-only** human-in-the-loop gates on the listed
  skills (a matching action parks for approval; a non-match never removes a
  built-in default).
* `limits.budget` → a real **combined cost ceiling** at the gateway. It caps BOTH
  real-world spend (card limits, top-ups, trading notional) AND platform usage
  (LLM, search, compute, hosted runtime), summed for the window. A **hard** cap
  returns `403 budget_exceeded` (race-safe — reserved under a lock before
  execution); a soft cap routes to human approval; the alert threshold emits a
  `budget.alert` event. A multi-agent `system` shares one cap across all its
  agents. If a hard cap (or the company's credit balance) is exhausted, the
  agent's **hosted runtime is auto-stopped** so you stop incurring cost.

So an agent whose `can` omits `skills.trading` returns `403` on
`forUser(id).trading.*`, and a `budget` of `$1` (hard) makes a `$250` card return
`403 budget_exceeded` — both verified end-to-end.

<Note>
  **`limits.budget` binds on both transports; `can` and `limits.approve` do not, quite.**
  The combined ceiling is enforced inside the agent-profile context, which is bound around
  every HTTP request and around every MCP tool call, so a capped agent is capped whichever
  way it calls. The capability allow-list and the approval requirement are decided by the
  governor, and on MCP the governor is consulted by 28 of the 271 tools — the money and
  identity verbs. A `can` rule about, say, search or image generation is enforced on the
  HTTP route and not on the equivalent MCP tool. Detail:
  [the governance gateway](/docs/architecture/governance-gateway#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate).
</Note>

<Note>
  For fine-grained control you can still drop to the lower-level
  `agentTemplate({ identity, wallet, comms, policy })` + `policy({ allow, deny,
    approvals, autoApprove, network })` builders under `agentProfiles` — the
  `agent({...})` DSL compiles down to exactly that.
</Note>

## Account kits in the config

`kits:` is the canonical spelling of "declare now, instantiate later". A kit is
a role your config registers once; nothing runs until your own code stamps an
instance of it for one [child project](/docs/getting-started/projects) — the same
[account-kit](/docs/getting-started/account-kits) rows the SDK already manages.

```ts theme={"theme":"css-variables"}
// naive.config.ts — declare the role once
import { defineProject, kit, skills } from "@usenaive-sdk/iac";

export default defineProject({
  project: "acme",
  kits: {
    sdr: kit({
      instructions: "Research prospects and draft outreach for one customer.",
      can: [skills.search, skills.email],
      limits: { budget: "$50/mo" },
    }),
  },
});
```

```ts theme={"theme":"css-variables"}
// your app — instantiate per child project, at run time
const instance = await naive.forProject("acme").forChild(childId).provision("sdr");
// instance.key is the instance-scoped API key — present ONCE, on this response.
```

`kit()` takes the same fields as `agent()` (including `runsOn` — a kit may pin
the runtime its instances run on), and compiles to byte-for-byte the same
canonical output.

**Relationship to `agents:`** — the top-level `agents:` block has always meant
exactly this, so it stays as a deprecated alias with identical behavior: both
spellings compile to the same output, and `naive up` prints a rename notice for
`agents:`. Declaring the same name in both blocks is refused at define time
(`kit_and_agent_duplicate`). Rename the block to `kits:`; nothing else changes.

## Multi-agent systems

A `system(...)` composes a parent/manager agent (which holds the shared budget)
with sub-agents, each in its own isolated runtime.

**Constraint:** `root` must be the agent role named `"ceo"`. The hosted runtime
runs a single Hermes gateway pinned to the `ceo` profile, and dashboard /
`naive ceo run` dispatch through it. A root under any other name would be
created and governed but never receive CEO work — `naive up` rejects that with
`invalid_input`. Give the CEO whatever title/skills you want; only the role
**name** is fixed.

```ts theme={"theme":"css-variables"}
export default defineConfig({
  project: "support-desk",
  agents: {
    ceo: agent({
      is: identity.agent(),
      can: [skills.llm, skills.tasks, skills.ceo],
      limits: { budget: "$500/mo" },
    }),
    researcher: agent({
      is: identity.agent(),
      can: [skills.llm, skills.search],
      limits: { budget: "$100/mo" },
    }),
  },
  systems: {
    support_team: system({
      root: "ceo",                 // required — must be named "ceo"
      members: ["researcher"],
      budget: { cap: "$500/mo", hard: true },
    }),
  },
});
```

Instantiate at run-time:

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_SECRET_KEY! });

await naive.runtime("pool").startSystem({
  system: "content", // a standing team declared under `systems` in naive.config.ts
});
```

Spend aggregates against the parent's cap at the gateway; `revoke(parent)` kills
the whole system.

## How `naive up` sets up infrastructure

`naive up` is a **plan → apply** lifecycle backed by a Naïve-managed executor
(no IaC toolchain for you to operate). Each resource maps to a managed
backend, which Naïve provisions and keeps reconciled for you:

* `cloud.bucket` → a private **object-storage** bucket.
* `cloud.postgres` → a **managed Postgres** database (created async; the pooled
  `DATABASE_URL` is returned as an output once healthy).
* `cloud.web` → **web hosting**. `naive up` uploads the resource's `dir` and
  triggers a production deployment; env is auto-injected from sibling outputs
  (the Postgres `DATABASE_URL`, the bucket name).
* `business.*` → the shared real-world programs (entity/email/phone/cards); each
  agent draws its own instance from them at `provision()` time.

Resources provision in dependency order (db + storage before web), are advanced
idempotently, and reconciled in the background — exactly like agent provisioning.

```bash theme={"theme":"css-variables"}
naive up --plan     # preview the diff (creates / updates / deletes) — read-only
naive up            # apply (+ deploy cloud.web source; --no-deploy to skip)
naive status        # deployment status + resolved outputs (DATABASE_URL, WEB_URL)
naive down          # tear down (previews first; --yes to confirm — destructive)
```

**Apply is asynchronous.** A real apply can take minutes (container provisioning,
profile staffing), so the API accepts it as a job — `202 { job_id }` — and the CLI
polls `GET /v1/jobs/:id` until the job completes, then prints the same apply
report a synchronous run would. Only one apply runs per company at a time; a
second `naive up` while one is in flight answers `409 duplicate_request` with
the running job to poll. (Direct API callers: send `Prefer: respond-async`, or
`?async=true`, to opt in; a plain `POST /v1/deployments/:project/apply` stays
synchronous.)

### What `naive up` prints beside the plan

Three notices ride on the plan and the apply output, so a lenient config still hears
about everything strict mode would have refused:

* **Per-team `unconsumed` lists** — one warning line per team that declared fields
  nothing on its runtime reads: `⚠ team "support" DECLARED AND UNREAD: …`. Do not treat
  those fields as in force.
* **A legacy-surface deprecation notice** when the config still uses `runtime.pool()`
  declarations, agent-level `runtime: "<pool>"` strings, or `systems:`. All three keep
  working indefinitely; new configs author `defineProject` with `teams:` on
  `runtime.durable()`.
* **A rename notice** when the config declares `agents:` — a deprecated *spelling*, not
  a deprecated surface: the block compiles to exactly what `kits:` compiles to.

**Credit-gated.** Infrastructure scales with what you can pay for: when your
credits are exhausted you can't provision more, and running infrastructure is
shut down (web disabled, runtime/compute stopped; database/storage data persists).
