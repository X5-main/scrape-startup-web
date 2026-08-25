> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from legacy orchestration to durable teams

> Move from the frozen orchestration runtime — runtime.pool(), the CEO agent, /v1/tasks, /v1/objectives, /v1/employees — to a team({ lead, agents }) on the durable runtime, where the same work is addressed as (company, tenant, team) and every decision is a row you can read.

<Info>
  **This is a Naive → Naive guide.** The "vendor" you are migrating from is a previous version of
  Naive. The URL you arrived at is the one every deprecated route, CLI group and dashboard banner
  links to (`Link: <…>; rel="deprecation"`), so bookmark it rather than the section index.
</Info>

The **legacy orchestration runtime** is the surface Naive shipped first: a warm pool of
containers (`runtime.pool()`), a fixed **CEO** agent per company, a kanban board at `/v1/tasks`,
long-running goals at `/v1/objectives`, worker records at `/v1/employees`, schedules at
`/v1/cron`, and per-agent notes at `/v1/memory`. It runs real production tenants today and it
does that job.

It is now **frozen**. Frozen means something narrower and more useful than "deprecated":

* **Every route, CLI command and DSL symbol keeps answering, unchanged.** No response shape
  changes, nothing is deleted, and there is no `Sunset` date on any of it — a `Sunset` header
  would be a promise the platform has not made. Existing configs keep working.
* **It accepts no new capabilities.** Anything built after the freeze lands on the durable
  runtime only. The gap will widen; it will not close.
* **Its policy is declarative, not enforced in-process.** In the legacy container the agent
  profile's policy is a description the container is asked to respect. Enforcement happens at
  the gateway the container calls back through. The durable runtime decides at the tool-call
  boundary instead, which is why the two runtimes are different products rather than two
  deployments of one.

<Note>
  The legacy runtime answers to eight names in Naive's own history — *orchestration*, *warm pool*,
  *instance pool*, *Hermes*, *sidecar*, *container runtime*, *hosted runtime*, and just *the
  runtime*. They are the same thing. A deprecation notice that named only one would leave seven
  ways to keep talking about it, so the register lists all eight.
</Note>

## Read this before you plan the work

<Warning>
  **The durable runtime's read surface is live; most of its write surface is not yet mounted in
  this build.** This guide states, route by route, which is which — because a migration plan built
  on the ones that answer `501` will stall on day one.

  * **Serving real data now:** the team status, `plan`, `roster`, `board`, one card, `events`,
    `runs`, one run, run events, the run stream, `sessions`, one session channel, `approvals`,
    `cost`, `diagnostics` and `effects` reads — and exactly one write, **`POST …/approvals/{id}/decide`**.
  * **`GET /v1/teams`** — the company-scoped team list — serves. It answered `501` until the
    JSONB key holding a declared team's name was renamed
    (`packages/db/migrations/065_agents_config_team_key.sql`), which is what that refusal named as
    its own remedy. It is the operation that turns a team name into the `--tenant` the rest of this
    surface needs.
  * **Answering `501 not_configured` today:** twelve writes, including **`submit`**, `unblock`,
    session `messages`, run `stop`, effect `settle`, `schedule`/`unschedule`, `stop`, `model`,
    `migrate`, `rollback` and `apply`.
  * A `501` from this surface is **not** a silent empty result. It names every missing dependency
    in `error.details.missing`, so `naive teams submit` tells you *what* is absent rather than
    appearing to have worked.

  Nothing here forwards to the legacy dispatcher behind your back. A second write path into a
  frozen runtime is exactly the failure the freeze exists to prevent, so the durable surface
  refuses instead.
</Warning>

## Concept map

| Legacy orchestration                    | Durable teams                                                        | Note                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `runtime.pool({ warm, max })`           | `runtime.durable({ residency, sleepAfter, workspace })`              | `runtime.hermes()` is the same pool under its frozen name; `runtime.pool()` still compiles |
| the **CEO** agent (one per company)     | the team **lead**                                                    | A role in a declared team, not a fixed identity. Its wire name is the literal `lead`       |
| `agentProfiles:` / `systems:`           | `company: {}` + `teams: {}`                                          | `team({ runtime, lead, agents, edges, brain })`                                            |
| an **employee** record                  | an `agent({ instructions, model, can, approve, governance, brain })` | Declared, not hired                                                                        |
| `/v1/tasks` (kanban)                    | `/v1/teams/{team}/tenants/{tenant}/board`                            | Same cards, addressed by the tuple                                                         |
| `/v1/objectives`                        | a `submit` with `--task`                                             | A goal with tasks under it, not a second noun                                              |
| `/v1/cron` (the 8 orchestration routes) | `…/schedule` and `…/schedule/{id}`                                   | The ten `POST /v1/cron/reconcile-*` platform webhooks are **not** deprecated — see below   |
| `/v1/memory`                            | the company **brain**                                                | A separate migration: [The brain replaces memory](/docs/migration-guides/memory-to-brain)       |
| the sidecar command outbox              | *(gap)*                                                              | The durable runtime takes the write itself, so there is no deferred command to inspect     |
| company + agent                         | **(company, tenant, team)**                                          | Addressing gains a tenant. Every runtime call names one                                    |

<Warning>
  **`/v1/cron` has two unrelated tenants of one prefix.** The orchestration cron routes are
  deprecated. The **nine** platform reconciler webhooks that merely share the prefix are not, are
  not part of this migration, and must keep being called:

  `drain-events` · `reconcile-connections` · `reconcile-billing` · `reconcile-agent-profiles` ·
  `reconcile-deliveries` · `reconcile-deployments` · `verify-domains` · `charge-phone-rentals` ·
  `process-conversions`

  They are shared-secret internal endpoints mounted separately from the deprecated cron router, so
  the deprecation headers never appear on them. `naive cron` the CLI group is deprecated;
  `POST /v1/cron/reconcile-*` is not.
</Warning>

## Before / after: the core path

### Declaring the runtime

```ts theme={"theme":"css-variables"}
// BEFORE — legacy orchestration. Still compiles; still runs, unchanged.
import { defineConfig, runtime, agent, system } from "@usenaive-sdk/iac";

export default defineConfig({
  project: "acme",
  runtime: {
    "support-pool": runtime.pool({ source: "./agent", isolation: "container", size: 2 }),
  },
  agents: {
    ceo: agent({ instructions: "Triage and delegate.", runtime: "support-pool" }),
    tier1: agent({ instructions: "Answer refund questions.", runtime: "support-pool" }),
  },
  systems: {
    support: system({ root: "ceo", members: ["tier1"] }),
  },
});
```

```ts theme={"theme":"css-variables"}
// AFTER — a declared team on the durable runtime, on the strict entrypoint.
import { defineProject, runtime, agent, team, brain, skills } from "@usenaive-sdk/iac";

const acme = brain({
  retention: { beliefs: "90d" },
  writes: { mode: "review", promoteBy: "operator", scan: "enforce" },
  partitions: { support: {} },
});

export default defineProject({
  project: "acme",
  company: { brain: acme },
  teams: {
    support: team({
      runtime: runtime.durable({ sleepAfter: "15m" }),
      brain: acme.partition("support"),
      lead: agent({ instructions: "Triage and delegate." }),
      agents: {
        tier1: agent({
          instructions: "Answer refund questions.",
          can: [skills.email.send],
          brain: acme.view({ partition: "support", can: ["recall"] }),
        }),
      },
      edges: [["lead", "tier1"]],
    }),
  },
});
```

Four things changed that are worth naming:

1. **There is exactly one lead, structurally.** `lead` is its own slot, not an entry in `agents`
   that happens to be called `ceo`. You cannot declare two, and you cannot declare none.
2. **`edges` is typed against the agents you declared.** A typo in an edge is a compile error,
   not a run that silently never delegates.
3. **The brain is a value you hand out.** `acme.partition(…)` and `acme.view(…)` are methods on
   the brain, so a team or agent binds the brain it was given.
4. **`runtime.pool()` is untouched.** It keeps its name, its type and its output. Adopting the
   new block does not require deleting the old one.
5. **The entrypoint is `defineProject`.** The strict spelling of `defineConfig` — a declared
   field nothing consumes refuses at define time instead of applying green. Its own two-line
   migration is [a separate guide](/docs/migration-guides/defineconfig-to-defineproject).

<Note>
  `defineConfig` returns your config by identity when it declares neither `company` nor `teams`.
  The twenty define-time refusals the new blocks add run **only** over the new blocks, so adding a
  `teams:` key cannot change how an existing config compiles.
</Note>

### Sending work

```bash theme={"theme":"css-variables"}
# BEFORE — the CEO agent and the kanban board.
naive ceo run "refund the duplicate charge for acct 8812"
naive tasks list
naive tasks comment tsk_01J "customer confirmed the duplicate"
```

```bash theme={"theme":"css-variables"}
# AFTER — one verb, one tuple. --tenant is REQUIRED; there is no default.
naive teams submit support "refund the duplicate charge for acct 8812" --tenant tu_8f21
naive teams board support --tenant tu_8f21
naive teams say support "customer confirmed the duplicate" --tenant tu_8f21
```

<Warning>
  `naive teams submit` is the replacement verb and it **answers `501` in this build** — the durable
  dispatcher it hands a goal to is not mounted yet. `naive teams board`, `runs`, `watch`,
  `approvals`, `roster`, `cost` and `diagnose` do answer. Plan the read-side cutover now; keep
  sending work through `naive tasks` / `naive ceo` until submit lands.

  The goal is a **positional argument**, not a flag: `submit <team> <goal>`. Prose on `argv` is
  mangled by every shell, so `--brief <file>` (or `--brief -` for stdin) is the reliable form for
  anything longer than a sentence.
</Warning>

### Reading what happened

```bash theme={"theme":"css-variables"}
# BEFORE
naive tasks list --status in_progress
naive tasks show tsk_01J

# AFTER — the same cards, plus the run ledger the legacy surface never had.
naive teams board support --tenant tu_8f21 --status claimed
naive teams task support tsk_01J --tenant tu_8f21
naive teams runs support --tenant tu_8f21
naive teams watch support --tenant tu_8f21 --run run_01J8 --follow
```

**The status names change, and the cards do not.** The board reports six statuses derived from
the two legacy columns (`status` and `verification_status`) that the same rows already carry:

| Legacy `status` / `verification_status` | Board status                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ready`                                 | `open`                                                                                                  |
| `in_progress`                           | `claimed`                                                                                               |
| `blocked`                               | `blocked`                                                                                               |
| `done` + `verified`                     | `done`                                                                                                  |
| `done` + `unverified`                   | `unverified`                                                                                            |
| `done` + `pending` or `rejected`        | `awaiting_check`                                                                                        |
| anything unrecognised                   | `open` — a card the board cannot classify is still shown, because an invisible card is how work is lost |

Because the board status is a *function* of two columns rather than a column of its own,
`?status=` filters in memory on this build and the response says so with `filtered_in_memory: true`.

<Note>
  `naive teams watch` emits NDJSON — one object per line, resumable. It polls the run's event
  ledger; there is no SSE or WebSocket for runs on this build, and the events endpoint takes no
  `after` cursor, so the cursor is client-side and the cost grows with ledger length rather than
  with new events.
</Note>

## Minimal viable migration

You do not have to move a tenant to start. In order, smallest first:

<Steps>
  <Step title="Read your existing board through the new address">
    `naive teams board <team> --tenant <tu>` serves the same cards from the same tables as
    `/v1/tasks`. Nothing is copied and nothing is migrated — this is a second **address** for
    one collection, not a second collection. If the two disagree, that is a bug worth reporting.
  </Step>

  <Step title="Declare the team beside the system you already have">
    Add a `teams:` block to `naive.config.ts` and leave `systems:` in place. They coexist; the
    new define-time refusals do not run over the legacy block.
  </Step>

  <Step title="Move approvals to the new address">
    `POST /v1/teams/{team}/tenants/{tenant}/approvals/{id}/decide` is the one write that is live,
    and it calls the same `executeApproval` / `denyApproval` the legacy route calls. One write
    path, two addresses. Your existing approval integration keeps working either way.
  </Step>

  <Step title="Read the honesty report before you plan anything larger">
    `naive teams plan <team> --tenant <tu>` reports digests, the fence, caps and attestation
    parity for one (team, tenant). Fields it cannot compute are `null` beside a
    `*_unavailable_because` sibling naming the reason — never a plausible-looking value.
  </Step>

  <Step title="Stop here — an EXISTING tenant still cannot be cut over, and the blocker is not submit">
    `POST …/submit` is now **served for a tenant on the durable runtime**, so the step that
    used to say "wait for submit" is done. And a tenant *can* now be put on that runtime — but
    only a **new** one. Which runtime a tenant is on is `company_containers.sidecar_url`, and
    the only function that points it at the Worker, `registerVettaRuntime()`, has exactly one
    production caller: `services/placement.ts`, reached from `naive up` when a `teams:` block
    declares `runtime.durable(...)` **and** the operator exports
    `NAIVE_DURABLE_CREDENTIAL_<TEAM>` out of band — and only on a deployment that has the
    durable runtime configured, which `api.usenaive.ai` does not, so there even a **new**
    tenant is `refused / runtime_not_configured` ([is it on this
    deployment?](/docs/architecture/durable-runtime#is-the-durable-runtime-on-this-deployment)).
    It is on no tenant-addressable route, and
    `POST …/migrate` and `POST …/rollback` are both still `501`.

    That path refuses precisely the case this guide is about. `placeTenant` permits only a
    tenant with **no** `company_containers` row (placing destroys nothing) or one **already**
    on the durable runtime (converge by comparing). A tenant with a live Hermes container — i.e.
    every tenant you are reading this page to migrate — is **refused**, because registering
    would null `instance_id`, severing the only pointer to the running ECS task: a live task on
    a live volume, referenced by nothing, reaped by nothing, billed to nobody, holding the
    tenant's `/data`. A config edit must never be able to cause that.

    So the cutover of an existing tenant remains an operator act, taken per tenant, with the
    credential in hand and a runbook that stands the new runtime up before anything is deleted.
    Ask for one rather than waiting for `migrate` to start answering.
  </Step>
</Steps>

<Warning>
  **Everything above is real and everything above is read-side.** Steps 1–4 work today, on the
  tenants you already have, because they read the same legacy tables through a second address.
  Nothing in this guide moves a tenant, copies a board, or changes which runtime executes your
  work — and on this build nothing can. Plan the read-side cutover; the write-side one is an
  operator act you request, not a flag that flips.
</Warning>

## Consolidate further once you're on teams

### Gain #1 — one decision function, so one answer

Legacy policy is declarative inside the container and enforced at the gateway the container calls
back through, which means "may this agent do X" has two answers that can disagree. The durable
runtime decides at the tool-call boundary instead.

`POST /v1/policy/explain` answers the question directly, without performing the action: it calls
the same `isPrimitiveEnabled` / `capabilityAllowed` / `resolveApprovalRequirement` the gate calls,
and reports the layer and the config path that decided.

<Note>
  **Three vocabularies, and they are not the same set — read the one belonging to the surface you
  called.** The closed decision engine answers `allow | deny | freeze`. `POST /v1/policy/explain`
  answers `allow | deny | park` — it never says `approve`, because "needs approval" is a deferral,
  not a permission. The MCP tool envelope adds `attest` and `unavailable` on top of those, because
  a model needs to distinguish an outage from a decision. Do not map one onto another by name
  alone.
</Note>

### Gain #2 — the board is addressed per tenant

Legacy orchestration addresses work as (company, agent). Durable teams address it as
(company, tenant, team), so one declared team serves many customers without one customer's cards
appearing on another's board.

<Warning>
  One measured exception you should know before you rely on it: **`GET /v1/runs` is company-scoped
  and scopes itself by the credential, not the URL.** It has no team and no tenant query parameter,
  so under an operator key the legacy run list returns the same rows regardless of which team or
  tenant you asked about. The per-tenant run list at
  `GET /v1/teams/{team}/tenants/{tenant}/runs` is the one that filters.
</Warning>

### Gain #3 — a team can hold a brain

A legacy agent's context is `/v1/memory` — per-agent notes with no lifecycle. A team binds a
partition of a **company brain**, and an agent binds a view of it with an explicit ability
list. A company may declare several brains and name which one a team or an agent binds. See
[The brain replaces memory](/docs/migration-guides/memory-to-brain) and
[The brain](/docs/architecture/brain).

## What does not map yet

* **`submit` and eleven other writes answer `501`.** Listed in full at the top of this page. The
  refusal names its missing dependencies; it does not fabricate a run id.
* **The `teams` primitive is not registered**, so there is no `teams` slug to gate on and none is
  invented. `/v1/teams/**` is gated on **`tasks`** instead — the primitive whose rows it serves —
  applied where the tenant is resolved rather than on the mount. A tenant whose kit disables
  `tasks` is refused at `/v1/users/{id}/tasks` *and* at the team board serving the same rows, both
  with `403 primitive_disabled_by_kit`. `GET /v1/teams` is the exception: it is company-scoped,
  resolves no tenant and therefore reads no kit — there is no tenant AccountKit to consult, so it
  is gated on authentication alone.
* **No `Sunset` date exists on any legacy row.** The freeze ends when the last Hermes container
  stops running, which is a condition, not a date.
* **`naive plan` at project scope is not implemented.** Its central field is the manifest digest,
  and `defineConfig` computes none in this build.
* **The `agent-profiles` → `agents` CLI rename has not happened**, and neither have the `policy`,
  `grants`, `limits`, `spend` and `connections` CLI groups. Their REST routes are mounted; the
  CLI is not built against them yet.

## Where to go next

* [Orchestration overview](/docs/api-reference/orchestration/overview) — the frozen surface, with the
  deprecation register that produced this page's URL
* [Runtimes](/docs/getting-started/runtime) — `runtime.durable()` beside `runtime.pool()`
* [The brain replaces memory](/docs/migration-guides/memory-to-brain) — the other half of this move
* [Runtime & brain governance MCP tools](/docs/mcp/runtime-and-governance) — the same surface for a
  model, and how a refusal is made legible to one
