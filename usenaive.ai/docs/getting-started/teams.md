> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Teams

> The durable runtime — declare a team of agents behind one lead, address it by (company, tenant, team), and submit work to it with one verb.

A **team** is N agents behind exactly one **lead**, bound to one partition of one
[company brain](/docs/getting-started/brain). It is the unit the durable runtime schedules,
governs and bills. **A team that names no runtime runs on the durable runtime** — see
[Choosing a runtime](#choosing-a-runtime) for pinning a team, or one member, to hermes.

<Info>
  **What is served depends on which runtime the tenant is on.** Of the 32 `/v1/teams/**`
  operations, a tenant on the **durable** runtime is served 22, a tenant on the frozen
  **hermes** runtime 13, and 10 are refused for both. A refusal is `501 not_configured`
  naming the missing dependency for that tenant's runtime in `error.details.missing`.
  Every response carries `provider`; every refusal carries `error.details.runtime`. See
  [What answers today](#what-answers-today) for the exact list.

  A tenant is placed on the durable runtime only by `naive up` — when a `teams:` block
  declares `runtime.durable(...)` **and** the operator exports
  `NAIVE_DURABLE_CREDENTIAL_<TEAM>` out of band. `POST …/migrate` is `501`; moving a
  tenant is an operator act, not a call — see
  [the durable runtime](/docs/architecture/durable-runtime#which-runtime-is-this-tenant-on).

  **The credential is the last of three checks, and on `api.usenaive.ai` the first two now
  pass** — as of 2026-08-06 that deployment has the durable runtime and both cutover
  prerequisites are signed off, so `runtime_credential_required` is the refusal to expect
  and supplying the credential makes the placement succeed. On any other deployment the
  first check may still refuse. Either way, read `placement.code`: [is it on this
  deployment?](/docs/architecture/durable-runtime#is-the-durable-runtime-on-this-deployment)
  `runtime.hermes()` is the lane the apply places itself.
</Info>

## Declaring a team

```ts naive.config.ts theme={"theme":"css-variables"}
import { defineConfig, runtime, team, agent, brain, skills } from "@usenaive-sdk/iac";

// This example stays on `defineConfig` (the lenient alias) deliberately: it
// declares `company.residency` and `runtime.durable({ workspace })`, which are
// on the not-yet-consumed list and `defineProject` refuses at define time —
// see /getting-started/iac#strict-mode-what-defineproject-refuses.
const acme = brain({
  retention: { beliefs: "180d", episodes: "30d" },
  writes: { mode: "review", promoteBy: "operator", scan: "enforce" },
  partitions: {
    support: { retention: { beliefs: "90d" } },
  },
});

export default defineConfig({
  project: "acme",

  company: {
    brain: acme,
    residency: { jurisdiction: "eu", allowEgressTo: ["eu"] },
  },

  teams: {
    support: team({
      // Omit `runtime:` entirely and you get exactly this: runtime.durable(),
      // with the platform's defaults. It is written out here to show the knobs.
      runtime: runtime.durable({
        residency: "eu",
        sleepAfter: "15m",
        workspace: { isolation: "os-kernel", egress: { mode: "deny-all" } },
      }),
      brain: acme.partition("support"),
      lead: agent({
        instructions: "Triage the ticket, decide, and hand the refund to tier1.",
        brain: acme.view({ partition: "support", can: ["recall", "think", "propose"] }),
        can: [skills.email],
      }),
      agents: {
        tier1: agent({
          instructions: "Answer the ticket. Refunds over $50 need an approval.",
          brain: acme.view({ partition: "support", can: ["recall"] }),
          can: [skills.email, skills.payments],
        }),
      },
      edges: [["lead", "tier1"]],
    }),
  },
});
```

### Things you cannot write

The first three are **compile** errors — you find out in your editor. The last two are
`defineConfig` refusals, so you find out when the config is evaluated — `naive up`,
`naive up --plan`, or your own build — before anything is applied.

| You cannot write                                                                                                                                         | Because                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Two leads.** `lead` is a single required field, not an array                                                                                           | a team with two leads has no answer to "who decides"                                                                                                              |
| **A dangling edge.** `edges: [["lead", "tier2"]]` with no `tier2` in `agents`                                                                            | the type of `edges` is built from the roster you declared                                                                                                         |
| **Residency on a team.** `governance` at team scope omits it                                                                                             | residency is minted once, at `company.residency`                                                                                                                  |
| **A governance rule that widens.** A team or member `allow` on an action a higher scope denies is `governance_widens_company` / `governance_widens_team` | governance layers fold company \< team \< agent into one policy, and a lower scope may only narrow                                                                |
| **A hermes member under a durable lead.** `agent({ runsOn: runtime.hermes(…) })` on a member of a durable-led team                                       | a hermes agent is a profile inside the company's one container, whose single gateway is pinned to the **lead**; a durable-led team owns no container to put it in |
| **An edge between two runtimes.** `edges: [["lead", "analyst"]]` where `analyst` is pinned to the other runtime                                          | delegation is a shared board, and the two runtimes do not share one — the edge would apply and then never deliver                                                 |

`brain: acme.view({ can: [] })` — an empty ability list — is how an agent gets **no** brain
access. There is no second concept for "none", and no field anywhere in which a *second*
brain can be named: `acme.partition()` and `acme.view()` are methods on the brain value
itself.

<Warning>
  **A `BrainView` is a plain object type today, not a branded one.** An object literal with
  the same shape typechecks where a real `acme.view({…})` is expected, and partitions are
  matched by **name**, so a second `brain()` value declaring a same-named partition binds
  without complaint. Treat "only the brain you declared can be bound" as a convention that
  the type system does not yet enforce.
</Warning>

## Choosing a runtime

`runtime:` on a team is the **default for its roster**, and the default's default is
`runtime.durable()`. Three shapes, in order of how much you have to write:

```ts naive.config.ts theme={"theme":"css-variables"}
import { defineProject, runtime, team, agent } from "@usenaive-sdk/iac";

export default defineProject({
  project: "acme",
  teams: {
    // 1 · THE DEFAULT — the durable runtime, no runtime line at all.
    research: team({
      lead: agent({ instructions: "Plan the week's briefs." }),
      agents: { analyst: agent({ instructions: "Write one brief." }) },
    }),

    // 2 · A TEAM OF HERMES AGENTS — one config line moves the whole roster onto
    //     the legacy hosted container runtime.
    support: team({
      runtime: runtime.hermes(),
      lead: agent({ instructions: "Triage the ticket and delegate." }),
      agents: { tier1: agent({ instructions: "Answer the ticket." }) },
      edges: [["lead", "tier1"]],
    }),
  },
});
```

```ts naive.config.ts theme={"theme":"css-variables"}
// 3 · A MIXED ROSTER — the team runs on hermes, one member is pinned to durable.
teams: {
  support: team({
    runtime: runtime.hermes(),
    lead: agent({ instructions: "Triage the ticket and delegate." }),
    agents: {
      tier1: agent({ instructions: "Answer the ticket." }),
      analyst: agent({
        instructions: "Crunch the month's refund data.",
        runsOn: runtime.durable({ sleepAfter: "15m" }),
      }),
    },
    edges: [["lead", "tier1"]],
  }),
}
```

`naive up` reports a mixed team once, with the runtime each role landed on:

```json theme={"theme":"css-variables"}
{
  "name": "support",
  "runtime": "hermes",
  "lead": "ceo",
  "role_runtimes": { "ceo": "hermes", "tier1": "hermes", "analyst": "durable" },
  "agents": ["ceo (provisioned, hermes)", "tier1 (provisioned, hermes)", "analyst (provisioned, durable)"]
}
```

### What each choice actually changes

|                        | `runtime.durable()` (default)                                                                                                                                                                                                                  | `runtime.hermes()`                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Where the roster lives | one Durable Object per team, addressed as its own `team:<name>` subject                                                                                                                                                                        | Hermes profiles inside the company's **single** container, on the company's default tenant |
| The lead's role name   | `lead`                                                                                                                                                                                                                                         | `ceo` — the profile the container's one gateway is pinned to                               |
| How many per project   | as many teams as you declare                                                                                                                                                                                                                   | **one**, because there is one container                                                    |
| Placement              | `naive up` + `NAIVE_DURABLE_CREDENTIAL_<TEAM>` out of band. `api.usenaive.ai` **has** the durable runtime as of 2026-08-06, so a team declared there comes back `placed`; without the credential it is `refused / runtime_credential_required` | the company's hosted-hermes container, claimed by the apply                                |
| Runtime operations     | the 25 durable operations below                                                                                                                                                                                                                | the 14 hermes ones                                                                         |
| Status                 | the current path — **not placed on production yet**                                                                                                                                                                                            | frozen — it takes no new features, and it is the lane `naive init` scaffolds               |

`pool` is **optional** on `runtime.hermes()`. Omitted, the team lives in the company's one
hosted-hermes container — which is where every hermes team lives today. Given
(`runtime.hermes({ pool: "warm" })`), the name must match a pool declared under the config's
top-level `runtime:` block: an unknown name is `hermes_pool_unknown` at define time and
`invalid_input` at plan/apply. A valid name is recorded on the team's agent rows as
`metadata.config_pool`; it does not change which container is claimed.

<Warning>
  **The two lanes of a mixed team do not delegate to each other.** A hermes agent delegates
  over the one `kanban.db` in its container; a durable agent over its own object. There is no
  bridge, so `edges:` across the lanes is a **define-time error** (`edge_crosses_runtime`)
  rather than a card that is accepted and never arrives. Hand each lane its own work — the
  lead's `naive teams submit` for the hermes roster, and the durable member's own runs — or
  put both ends on one runtime.

  The practical shape that works today: **a hermes team with durable specialists**. The reverse
  (durable lead, hermes member) is refused, because the hermes profile would have no gateway to
  be dispatched from.

  A mixed team's durable half is placed like any durable team, so it needs
  `NAIVE_DURABLE_CREDENTIAL_<TEAM>` in the environment of the `naive up` — without it the apply
  still creates the hermes half and reports the durable half as
  `refused / runtime_credential_required`, non-zero. On a deployment with no durable runtime
  the same half is refused earlier and for a different reason
  (`runtime_not_configured`), credential or no credential.
</Warning>

<Info>
  **Which runtime is recorded on the row, per agent.** `agents.metadata.config_runtime` is
  `hermes` or `durable` for every config-declared agent, and it is what keeps the legacy
  recovery sweep from claiming a container for a durable tenant. `naive up --plan` prints
  `role_runtimes` for a mixed team, so you can see the split before anything is written.
</Info>

## Model, rubric and spend — durable-manifest fields

A durable team's apply delivers a **company definition** to the runtime — members, grants,
gates, budgets, rubric — and binds the digest the runtime compiled it to. That is where
these fields become enforcement:

| You declare                        | The durable runtime enforces                                           | On hermes                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `agent({ model })`                 | that member's model seat — every turn of that member runs on it        | reported in `unconsumed` as `….model (runtime.hermes)`; hermes has no per-role model seat |
| `agent({ concurrency, maxSteps })` | parallel task leases and the per-attempt step budget                   | reported the same way                                                                     |
| `agent({ can })`                   | the runtime's **grants** — a tool outside `can` is refused at dispatch | enforced separately by the account-kit policy                                             |
| `limits: { approve }`              | the runtime's **gates** — the action parks for a human                 | enforced separately by the account-kit policy                                             |
| `team({ review: { rubric } })`     | the acceptance bar the judge scores a run against                      | `review (runtime.hermes)` in `unconsumed`                                                 |
| `team({ spend, hardSpend })`       | AI-Gateway budget brakes and hard walls, per bucket                    | `spend (runtime.hermes)` in `unconsumed`                                                  |

A spend bucket names the **team** (a company-level budget) or **one of its durable roles**
(a role-level budget); anything else is refused by name. `hardSpend` adds a reservation
under a cap — `reservationCents` may not exceed `capCents`.

```ts theme={"theme":"css-variables"}
teams: {
  research: team({
    lead: agent({ instructions: "plan the work" }),
    agents: { analyst: agent({ model: models.sonnet, concurrency: 2, maxSteps: 24 }) },
    review: { rubric: ["cites a primary source", "names its uncertainty"] },
    spend: [{ bucket: "research", limitCents: 5_000, period: "day" }],
    hardSpend: [{ bucket: "analyst", capCents: 10_000, reservationCents: 500, period: "day" }],
  }),
},
```

**Delivery is reported per team, beside `placement`, never inside it.** The apply output
carries `manifest.status` — `applied` or `noop` means the runtime bound the digest and the
table above is live; `refused`, `unreachable` and `delivered_not_applied` each carry the
refusing side's own words; `skipped` means placement did not succeed so there was nothing to
deliver to. A placed team with a refused manifest is placed and **not** enforced, and the
report says exactly that.

**These are durable-runtime fields.** Declaring any of them on a hermes team is not an
error — the apply succeeds — but the plan and apply name every one of them in the team's
`unconsumed` list with the runtime that cannot serve it, because a silent drop is the defect
this surface exists to remove. In a mixed team only the durable lane is projected: a
hermes-pinned member's `model` is reported, not delivered.

## The agent's loop — a declared cron wake-up

`agent({ loop })` is the recurring wake-up: the platform's cron system wakes the
role on a schedule with a goal as the run's prompt, no human in the loop.

```ts theme={"theme":"css-variables"}
teams: {
  ops: team({
    runtime: runtime.hermes(),
    lead: agent({ instructions: "run the ops desk" }),
    agents: {
      triage: agent({
        instructions: "keep the inbox at zero",
        loop: { cron: "0 9 * * 1-5", goal: "Triage the inbox and file a summary" },
      }),
    },
  }),
},
```

| Field       | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| `loop.cron` | Standard 5-field cron expression.                               |
| `loop.goal` | What each wake-up is for — becomes the run's prompt.            |
| `loop.name` | Display name of the schedule; defaults to `loop:<team>:<role>`. |

**Both lanes register it**, against two different schedulers. On `runtime.hermes`
apply registers the schedule with the container's cron system — the same one
`naive cron list` reads. On `runtime.durable` it registers with the runtime's own
`/cron`, which fires on a Durable Object alarm that needs no warm container, and
which [`naive teams schedules`](/docs/cli/teams) lists. Either way re-applying an
unchanged config converges instead of stacking duplicates, and **every firing is
reserved to the role that declared the loop** — the declaration is per role and
so is the enforcement.

The apply report carries what happened per agent. `loop.status` is `registered`
when the scheduler took it, `queued` when it did not, and `unschedulable` when
nothing could compile the cron. A `queued` loop on the durable lane carries
`loop.reason` — the runtime's own sentence, so "the manifest is not bound yet"
and "this team already holds sixteen timers" do not read the same.

Two durable-lane rules worth knowing before you write one:

* **The manifest fences it.** The runtime refuses to schedule against a manifest
  it has not bound, exactly as it refuses `submit`. A team whose manifest was
  refused reports its loops `queued`; binding it
  (`naive teams apply <team>`) and re-running `naive up` registers them.
* **Sixteen per team.** That is the runtime's cap. A config declaring more is
  refused at plan time rather than half-applied — split the roles across two
  teams, since each team is its own tenant with its own sixteen.

Deleting a loop from the config **unschedules it**: apply cancels the timer it
registered under the default `loop:<team>:<role>` name and reports it under
`loops_unscheduled`. A loop that declared its own `loop.name` is outside that
namespace and is not swept — remove it with `naive teams unschedule`.

## Addressing: (company, tenant, team)

A team is not addressable on its own. Every runtime operation names three things:

* the **company** — taken from the API key you present, never from the URL;
* the **tenant user** — the end-user this work is for, `--tenant <tenantUserId>`;
* the **team** — the key you declared under `teams:`.

```bash theme={"theme":"css-variables"}
naive teams board support --tenant tu_8f21
naive teams roster support --tenant tu_8f21 --edges
naive teams runs support --tenant tu_8f21
```

`--tenant` is **required on every subcommand except `list`** — there is no default user
fallback. `--tenant @self` resolves the credential's own subject explicitly.

The REST form is `/v1/teams/{team}/tenants/{tenantUserId}/…`.

One deployment currently serves one company: the control plane is addressed per
`(company, tenant)`, but the deployment is provisioned per company, so every "tenant"
answer below is scoped inside one company's deployment.

## `submit` is the work verb

There is one verb for handing work to a team, and it is `submit`. It is the same operation
on every surface — one action id, one fence, one audit row.

| Surface | Form                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CLI     | `naive teams submit <team> "<goal>" --tenant <tu>`                                                                                                                             |
| REST    | `POST /v1/teams/{team}/tenants/{tenantUserId}/submit`                                                                                                                          |
| MCP     | *not yet exposed* — the MCP server registers `naive_teams_status`, `naive_teams_board`, `naive_teams_run`, `naive_teams_comment` and `naive_teams_unblock`, and no submit tool |

```bash theme={"theme":"css-variables"}
naive teams submit support "refund the duplicate charge on invoice 4471" --tenant tu_8f21
naive teams submit support --brief ./brief.md --tenant tu_8f21 --task tsk_119
```

`--brief <file>` (or `-` for stdin) exists because prose on `argv` is mangled by every
shell — quoting, `!`, newlines. Use it for anything longer than a sentence.

`naive tasks create`, `naive ceo run` and `naive objectives create` all map to `submit`.
They keep working; see [Orchestration](/docs/getting-started/orchestration).

## Watching a run

```bash theme={"theme":"css-variables"}
naive teams runs support --tenant tu_8f21
naive teams watch support --tenant tu_8f21 --run run_2f9a --follow
```

<Warning>
  **`naive teams watch` works for a tenant on the durable runtime and refuses for one on
  hermes.** `GET …/runs/{id}/stream` proxies the runtime's own transcript frame for frame; for
  a hermes tenant it answers `501 not_configured` naming three things that would make the
  stream dishonest there — run-event frames are caller-forgeable on the legacy table, there is
  no `trace_id` column, and usage is recorded on `finish` so a long stream cannot be
  rate-limited. To read a finished run on either runtime, use `naive teams runs` and the paged
  transcript.

  The durable stream carries no `trace_id` either, and the response says so in a header rather
  than letting a consumer assume one is coming. It is bounded by the runtime rather than by
  naive: the Worker closes its own stream after 300s and rate-limits its front door.
</Warning>

`watch` requires `--run`. It emits NDJSON — one object per line — and is resumable:
`--cursor <seq>` is sent as `Last-Event-ID`, so a dropped connection resumes at a
**position**, not at a timestamp. `--fail-on-terminal` exits 3 when the final status is
`unverified`, `failed` or `blocked`, which is what you want in CI.

Tool arguments are printed as `args_digest` rather than as values. `--show-args` prints
them and requires an interactive terminal, so a CI log cannot accidentally capture
arguments that carried a secret.

## Approvals

Approvals are the one **write** on this surface that is fully served today.

```bash theme={"theme":"css-variables"}
naive teams approvals support --tenant tu_8f21 --status pending
naive teams decide support apr_71c2 --tenant tu_8f21 --allow --because "policy allows refunds under $50"
```

`--because` is **required**. The reason is recorded on the decision, so an approval that
was granted always carries why, and a later reader is not left inferring it.

`POST …/approvals/{id}/decide` is a second **address** for one write path, not a second
write path: it calls the same execute/deny code as
`/v1/users/{user_id}/approvals/{id}/approve`, so the human-resolver rule and the
no-self-approval rule hold identically. An agent cannot resolve its own approval through
this address either.

See [Approvals](/docs/getting-started/approvals) for the resolution rules.

## What answers today

**Served for every tenant, on either runtime**

| Operation                                         | CLI                          |
| ------------------------------------------------- | ---------------------------- |
| `GET …/tenants/{tu}` — the team/tenant header     | `naive teams show`           |
| `GET …/board`, `…/board/{card}`                   | `naive teams board` / `task` |
| `GET …/events`                                    | `naive teams events`         |
| `GET …/runs`, `…/runs/{id}`, `…/runs/{id}/events` | `naive teams runs`           |
| `GET …/roster`                                    | `naive teams roster`         |
| `GET …/cost`                                      | `naive teams cost`           |
| `GET …/diagnostics`                               | `naive teams diagnose`       |
| `GET …/plan`                                      | `naive teams plan`           |
| `GET …/approvals`                                 | `naive teams approvals`      |
| `POST …/approvals/{id}/decide`                    | `naive teams decide`         |

`board` and `board/{card}` answer from *different stores* depending on the runtime — the
durable runtime's own board for a durable tenant, the legacy mirror for a hermes one — which
is why every response names its `provider`.

**Served on the durable runtime; `501` on hermes, naming the legacy equivalent**

| Operation                                   | CLI                                   | On hermes                                                                                                                                            |
| ------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST …/submit`                             | `naive teams submit`                  | `POST /v1/tasks` creates a legacy card and stays available                                                                                           |
| `POST …/board/{card}/unblock`               | `naive teams unblock`                 | `POST /v1/tasks/{id}/unblock` stays available                                                                                                        |
| `POST …/sessions/{channel}/messages`        | `naive teams say`                     | no per-`(team, tenant)` session store exists                                                                                                         |
| `GET …/runs/{id}/stream`                    | `naive teams watch`                   | frames are caller-forgeable; no `trace_id`; not meterable on open                                                                                    |
| `POST …/schedule`, `DELETE …/schedule/{id}` | `naive teams schedule` / `unschedule` | `/v1/cron` schedules against the legacy runtime and stays available                                                                                  |
| `POST …/stop`                               | `naive teams stop`                    | a team-level stop is a state of the Durable Object; the legacy runtime has no equivalent row to set, and stops one run at a time through the sidecar |

**Refused for both, each naming what is absent**

| Operation                                     | What is missing                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/teams` (enumeration)                 | a declared team's name is stored under a key the vocabulary gate has retired; no accessor may be added without widening that gate                                                                                                                                                                                                                         |
| `GET …/sessions`, `…/sessions/{channel}`      | the runtime has `channels` and `read` verbs; the control-plane translation is one-way — in, not out                                                                                                                                                                                                                                                       |
| `GET …/effects`, `POST …/effects/{id}/settle` | the runtime has `effects` and `effect-decide`; no control route reaches either. On hermes there is no effect ledger at all                                                                                                                                                                                                                                |
| `POST …/runs/{id}/stop`                       | there is no **per-run** kill, by design: a card in flight holds a lease and an attempt budget, and no abort channel reaches one. The team-level `POST …/stop` above is the interrupt — it stops the dispatcher claiming further work and fences it against re-arming, but does **not** recall an attempt already handed to a member; `start-loop` resumes |
| `POST …/model`                                | the runtime has `model`; no control route reaches it. On hermes it is a manifest field and no manifest is stored                                                                                                                                                                                                                                          |
| `POST …/apply`                                | the runtime has `apply` and refuses a stale digest; no control route reaches it. `GET …/plan` reports the digests it would compare                                                                                                                                                                                                                        |
| `POST …/migrate`, `POST …/rollback`           | migration is a control-plane act — it rewrites `company_containers.sidecar_url` — and is deliberately not tenant-addressable. It is also **not symmetric**: registering overwrites the tenant's Hermes coordinates, so returning means a fresh slot, a new task and a new volume                                                                          |

A refusal is a `501` with `error.details.missing` as a **list** of every unmet
prerequisite — deliberately not `404`, `403`, or an empty `200`. Where a refusal names a
legacy route it describes what *that tenant* has, not a recommendation to use it: writing
via `naive tasks create` goes to the frozen runtime, a different execution model with a
different governance path. A refusal from the runtime itself is carried through unchanged,
with `error.details.runtime_said` holding the runtime's own words.

## Next steps

* [Orchestration](/docs/getting-started/orchestration) — the frozen legacy runtime, and the mapping off it
* [Approvals](/docs/getting-started/approvals) — how a parked action is resolved
* [Brain](/docs/getting-started/brain) — the partition a team binds
* [Infrastructure as code](/docs/getting-started/iac) — the rest of `naive.config.ts`
