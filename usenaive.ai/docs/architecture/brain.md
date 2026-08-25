> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# The brain

> How brains are declared, bound to teams and agents, and governed — N brains per company with exactly one default.

The **brain** is a company's shared knowledge: beliefs, lessons, ingested documents,
and the episodes they came from. A company may declare several brains; exactly one is
the default. Teams read a slice of a brain; agents read a view of that slice.

## N brains, one default

`brain_knowledge_bases` is keyed `(company_id, name)` with a partial unique index on
`is_default = true`. `naive brain list` and `naive brain create --name --default` drive
it, and the DSL declares the same shape.

<Warning>
  **`default` in the DSL is a claim about this config, not a write to the platform.** It
  decides which brain an *unnamed* binding resolves to. It does not set
  `brain_knowledge_bases.is_default` — use `naive brain default <name|id>` or
  `naive.brains.setDefault(id)` (`PATCH /v1/brain/{id}`) for that. `naive brain list`
  reports which brain actually carries the flag.
</Warning>

**One brain:**

```ts theme={"theme":"css-variables"}
import { agent, brain, defineProject, runtime, skills, team } from "@usenaive-sdk/iac";

const acme = brain({
  retention: { beliefs: "180d" },
  writes: { mode: "review" },
  partitions: { support: {}, billing: { retention: { episodes: "7d" } } },
});

export default defineProject({
  project: "acme",
  company: { name: "Acme, Inc.", brain: acme },
  teams: {
    support: team({
      runtime: runtime.durable({ sleepAfter: "15m" }),
      brain: acme.partition("support"),
      lead: agent({
        can: [skills.email.send],
        brain: acme.view({ partition: "support", can: ["recall", "propose"] }),
      }),
      agents: {},
    }),
  },
});
```

**Several brains** — `brains({ default, declared })`; the record key is the name:

```ts theme={"theme":"css-variables"}
import { agent, brain, brains, defineProject, runtime, skills, team } from "@usenaive-sdk/iac";

const hive = brains({
  default: "core",
  declared: {
    core: brain({
      scope: "org",                        // the shared trunk — at most one per company
      retention: { beliefs: "365d" },
      writes: { mode: "review", promoteBy: "operator" },
      partitions: { trunk: {} },
    }),
    support: brain({
      retention: { beliefs: "90d" },
      writes: { mode: "propose" },
      visibility: { can: ["recall", "attach", "propose"] },  // the ceiling every view narrows
      partitions: { tickets: {} },
    }),
  },
});

export default defineProject({
  project: "acme",
  company: { name: "Acme, Inc.", brains: hive },
  teams: {
    support: team({
      runtime: runtime.durable({ sleepAfter: "15m" }),
      brain: hive.partition("support", "tickets"),          // team → one slice of one brain
      lead: agent({
        can: [skills.email.send],
        brain: hive.view("support", { partition: "tickets", can: ["recall", "propose"] }),
      }),
      agents: {
        librarian: agent({
          can: [skills.search],
          brain: hive.view("core", { can: ["recall"] }),      // a different brain, same team
        }),
      },
      edges: [["lead", "librarian"]],
    }),
  },
});
```

`brain` and `brains` are the same declaration at two arities; writing both is a
define-time error (`company_brain_and_brains`), and everything downstream reads one
resolved shape.

## Connecting a brain to an agent

`view()` and `partition()` are the only ways to obtain a binding, and both are methods
on the value that declares the brain — no expression can name a brain it was not handed.

| You want                             | One brain                       | Several brains                             |
| :----------------------------------- | :------------------------------ | :----------------------------------------- |
| bind a **team** to a slice           | `acme.partition("support")`     | `hive.partition("support", "tickets")`     |
| bind an **agent** to a view          | `acme.view({ partition, can })` | `hive.view("support", { partition, can })` |
| bind an agent to a brain's **trunk** | `acme.view({ can })`            | `hive.view("core", { can })`               |
| give an agent **no** brain           | `acme.view({ can: [] })`        | `hive.view("core", { can: [] })`           |

On the wire a binding carries `brainName`; it is absent for a one-brain company, meaning
*the company default*. An empty ability list (`can: []`) is how an agent gets nothing.

## Define-time refusals

Most misuse does not compile: a two-brain set with no `default`, a misspelled brain name,
a partition bound to the wrong brain, a brain at any level but `company`, or
`can: ["promote"]` / `["forget"]` are all type errors. Because a config can also arrive
as JSON, the same rules are re-checked at define time:

| Refusal                                                 | Cause                                                             |
| :------------------------------------------------------ | :---------------------------------------------------------------- |
| `brains_empty`                                          | a set with nothing in it                                          |
| `brains_default_required`                               | N brains declared and none named as the default                   |
| `brains_default_unknown`                                | `default` naming a key that is not declared                       |
| `brains_name_mismatch`                                  | a brain whose own `name` contradicts its record key               |
| `brains_two_org_trunks`                                 | two `scope: "org"` brains                                         |
| `company_brain_and_brains`                              | both spellings in one company block                               |
| `brain_unknown`                                         | a binding naming a brain the company does not declare             |
| `brain_view_exceeds_visibility`                         | a `view({ can })` wider than the brain's `visibility.can` ceiling |
| `brain_partition_unknown` · `brain_lanes_disabled`      | a binding to a slice or lane the brain does not declare           |
| `retention_exceeds_ceiling` · `retention_widens_parent` | see retention below                                               |

## Scope and levels

`scope` mirrors `brain_knowledge_bases.scope`: `"project"` (the column default) is a
brain of one project; `"org"` is the shared company trunk — at most one, enforced by a
partial unique index. Default recall unions the caller's project brain with the org
brain.

Inside one brain: **brain** (the trunk; every belief lives here) → **partition** (a
team's named slice) → **lane** (an agent's private working set; off unless
`lanes.enabled`).

## Visibility

`view({ can: [...] })` picks from `recall`, `attach`, `think`, `remember`, `learn`,
`propose`, `reaffirm`, `pressure`. A brain may declare `visibility: { can: [...] }` —
the ceiling for every view of it; a view may only narrow it. `promote` and `forget` are
not abilities and cannot be added: they are the human acceptance and erasure of
model-authored text, which `writes: { mode: "review" }` exists to keep human.

## Retention

`retention.beliefs` is required; a partition or lane may only narrow a value (widening
throws at define time), and everything is bounded by a 365-day ceiling. Platform
defaults are exported as `brainDefaults`:

| Noun                            | Default                                                  |
| :------------------------------ | :------------------------------------------------------- |
| `beliefs`                       | `365d`                                                   |
| `lessons.fact` / `lessons.rule` | `365d`                                                   |
| `lessons.postmortem`            | `90d`                                                    |
| `episodes`                      | `30d`                                                    |
| `proposals`                     | `14d`                                                    |
| `documents`                     | `365d`                                                   |
| `bounds`                        | 500,000 live beliefs · 50,000 live lessons · 4,000 chars |

<Warning>
  **Retention is declared but not yet enforced.** The narrowing rule and the 365-day
  ceiling are real define-time checks, but no server-side code reads or stores the policy
  — no belief in this build ever lapses, and `GET /v1/brain/retention` answers `501`.
  Declare retention now; do not rely on it to delete anything yet.
</Warning>

## What governs a brain write

`brain` is an **opt-in** primitive (it engages a subprocessor): a gated brain call with
no kit entry is denied. Four brain actions are human-gated by default
([AccountKits](/docs/architecture/account-kits)):

* `brain.kb.delete` and `brain.document.delete` — both, so the KB-delete gate cannot be
  bypassed document by document.
* `brain.forget` — company-scope forget is effectively a right-to-be-forgotten wipe.
* `brain.proposal.accept` — canonizing a claim is a review act.

None of the four has a sandbox leg; a sandbox operator gets `501 not_configured` — see
[Environments enforcement](/docs/architecture/environments-enforcement).

## The read surface

`GET /v1/brain/beliefs` answers from `brain_claims`, keyset-paged. Every row carries
`recallable` *and* the filters that produced it, so "why did recall not return this?" is
answerable from the row:

```jsonc theme={"theme":"css-variables"}
{
  "belief_id": "…",
  "statement": "acme-corp uses postgres",
  "level": "company",           // org → company, project → team
  "partition": null,
  "status": "confirmed",
  "recallable": true,
  "filters": {
    "status_ok": true,
    "not_expired": true,
    "not_expired_measures": "valid_to (temporal validity), not retention",
    "scan_ok": true,
    "scan_ok_measures": "the knowledge base's own status is 'active'"
  }
}
```

Fields that cannot be computed in this build say so by name
(`lane_unavailable_because`, `expires_at_unavailable_because`, …). Schema facts worth
knowing: there is no agent level on any `brain_*` table (`level: "agent"` is
unreachable), `valid_to` is temporal validity rather than retention, and there is no
lane column yet.

## What refuses today

These answer `501 not_configured` with `details.missing` naming the absent dependency:

| Operation                              | Missing                                                                                 |
| :------------------------------------- | :-------------------------------------------------------------------------------------- |
| `POST /v1/brain/beliefs/{id}/reaffirm` | no reaffirmation record                                                                 |
| `GET` / `POST /v1/brain/lessons`       | no lessons table                                                                        |
| `GET /v1/brain/retention`              | no retention column on any `brain_*` table                                              |
| `GET /v1/brain/decisions`              | no `policy_decisions` ledger — see [the decision ledger](/docs/architecture/decision-ledger) |

`GET /v1/brain/levels`, the belief reads, and the knowledge-base, ingestion, recall,
proposal and writeback surfaces under `/v1/brain/*` are real.

<Warning>
  **Recalled brain text reaches the model as prose, and sources include external
  systems** (chat, email, the web, uploads). Do not treat a recalled belief as trusted
  instruction: an attacker who can get text into an ingested source can get text into a
  prompt. Keep `writes: { mode: "review" }` on any partition fed by an external source,
  and keep `promote` with a human.
</Warning>

## Related

* [AccountKits](/docs/architecture/account-kits) — enabling the primitive and the approval defaults
* [Approvals](/docs/architecture/approvals) — how a gated brain action is frozen and replayed
* [The durable runtime](/docs/architecture/durable-runtime) — where a team binds its partition
* [`naive brain`](/docs/cli/brain) — listing, creating and selecting a brain from the CLI
* [Brain API](/docs/api-reference/brain/overview) — the wire surface
