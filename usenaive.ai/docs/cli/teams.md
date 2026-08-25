> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Teams (durable runtime)

> Declare a team, send it work, watch it, and decide what it asks for — the durable runtime CLI surface.

`naive teams` is the CLI for the **durable runtime**. A team is a declared
`team({ runtime, lead, agents, edges, brain })` in your `naive.config.ts`; this command group
addresses one of those teams for one tenant and drives it.

<Info>
  **What works depends on which runtime the tenant is on**, and every one of the 29 subcommands
  is mounted. This page covers all of them. **22 of them return real rows for a durable tenant. 13 do for a
  hermes tenant. The other 7 answer** `501 not_configured`, naming the missing dependency
  for the runtime that tenant is on (the split is pinned by
  `ci/runtime-surface-counts.test.ts`).

  Which runtime a tenant is on is decided by `naive up`, not by this command group: a
  tenant lands on the durable runtime when a `teams:` block declares
  `runtime.durable(...)` and the operator exports `NAIVE_DURABLE_CREDENTIAL_<TEAM>` **and the
  deployment has a durable runtime at all** — `api.usenaive.ai` does not, so there the apply
  is `refused / runtime_not_configured` and no credential changes that ([is it on this
  deployment?](/docs/architecture/durable-runtime#is-the-durable-runtime-on-this-deployment)).
  `naive teams migrate` always refuses — moving an *existing* tenant is an operator act.
  Run `naive teams plan <team> --tenant <id>` to see which runtime a tenant is on; every
  response carries `provider`, every refusal `error.details.runtime`.
</Info>

## The addressing tuple

The durable runtime addresses work as **(company, tenant, team)**.

* **company** comes from your API key. You never pass it.
* **team** is the first positional argument — the key you gave the team in `naive.config.ts`.
* **tenant** is `--tenant <tenant-user-id>`, and it is **required on every subcommand except
  `list`**. There is no default and no fallback.

`--tenant @self` is the one shorthand. It resolves to the subject you selected with
`naive use <id>` — not to a server-side default; with nothing selected it is an error.
A defaulted tenant on a multi-tenant board is how one customer's work ends up in
another customer's ledger.

```bash theme={"theme":"css-variables"}
naive teams board support --tenant tu_8f21     # explicit
naive use tu_8f21 && naive teams board support --tenant @self
naive teams board support                      # error: --tenant is required. There is no default.
```

## Subcommands

Every subcommand takes `<team>` as its first argument and `--tenant` (except `list`).

### Reading the board

| Command                               | What it does                                                                      | durable tenant | hermes tenant |
| ------------------------------------- | --------------------------------------------------------------------------------- | -------------- | ------------- |
| `naive teams list`                    | List the declared teams, with the `--tenant` id each one's other subcommands take | serves         | serves        |
| `naive teams show <team>`             | The team/tenant header — status, runtime, counts                                  | serves         | serves        |
| `naive teams plan <team>`             | The honesty report: digests, fence, caps, attestation parity                      | serves         | serves        |
| `naive teams roster <team>`           | The declared agents, and with `--edges` the edges between them                    | serves         | serves        |
| `naive teams board <team>`            | The board, as columns                                                             | serves         | serves        |
| `naive teams tasks <team>`            | The same board, as a flat task list                                               | serves         | serves        |
| `naive teams task <team> <id>`        | One card                                                                          | serves         | serves        |
| `naive teams events <team>`           | The team's event log                                                              | serves         | serves        |
| `naive teams runs <team>`             | The team's runs                                                                   | serves         | serves        |
| `naive teams cost <team>`             | What the team spent (`--by`, `--period`)                                          | serves         | serves        |
| `naive teams approvals <team>`        | Approvals this team is waiting on                                                 | serves         | serves        |
| `naive teams sessions <team>`         | The team's sessions                                                               | **501**        | **501**       |
| `naive teams read <team> <channel>`   | Read one session channel                                                          | **501**        | **501**       |
| `naive teams effects <team>`          | Outstanding effects                                                               | **501**        | **501**       |
| `naive teams diagnose <team>`         | Diagnostics for a team that is misbehaving                                        | serves         | serves        |
| `naive teams watch <team> --run <id>` | The run transcript, NDJSON, resumable                                             | serves         | **501**       |

### Changing something

| Command                                          | What it does                                                                                                                                                                                                                       | durable tenant | hermes tenant |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------- |
| `naive teams decide <team> <id>`                 | Allow or deny one approval (`--allow` / `--deny`)                                                                                                                                                                                  | serves         | serves        |
| `naive teams submit <team> "<goal>"`             | **The** work verb                                                                                                                                                                                                                  | serves         | **501**       |
| `naive teams say <team> "<text>"`                | Say something into a team session                                                                                                                                                                                                  | serves         | **501**       |
| `naive teams unblock <team> <id>`                | Unblock a card                                                                                                                                                                                                                     | serves         | **501**       |
| `naive teams settle <team> <id>`                 | Settle an effect — `--done` / `--compensate` / `--reject`                                                                                                                                                                          | **501**        | **501**       |
| `naive teams schedule <team> <cron> "<goal>"`    | Schedule recurring work                                                                                                                                                                                                            | serves         | **501**       |
| `naive teams schedules <team>`                   | What recurs: cadence, next firing, pinned model                                                                                                                                                                                    | serves         | **501**       |
| `naive teams unschedule <team> <id>`             | Remove a schedule                                                                                                                                                                                                                  | serves         | **501**       |
| `naive teams apply <team> --expected-digest <d>` | Record that an operator applied this exact manifest digest; refuses a stale one. `naive teams plan` prints the digest to pass                                                                                                      | **501**        | **501**       |
| `naive teams model <team> <modelId>`             | Change the model a team runs on                                                                                                                                                                                                    | **501**        | **501**       |
| `naive teams stop <team>`                        | Stop the team's dispatch loop — a **pause**, not a decommission: cards keep their leases, and the answer carries `in_flight` for attempts already handed to a member                                                               | serves         | **501**       |
| `naive teams migrate <team>`                     | Move this tenant onto the durable runtime — **there is no path to it from this command group**. Placement happens in `naive up`, from a declared `runtime.durable(...)` team plus an out-of-band `NAIVE_DURABLE_CREDENTIAL_<TEAM>` | **501**        | **501**       |
| `naive teams rollback <team>`                    | Move this tenant back off it — **destroys the workspace**                                                                                                                                                                          | **501**        | **501**       |

## Submit is the one work verb

There is exactly one way to give a team work, and it is `submit`. It carries the same name on
every surface that offers it:

| Surface    | Form                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI        | `naive teams submit <team> "<goal>" --tenant <tu>`                                                                                                                         |
| REST       | `POST /v1/teams/{team}/tenants/{tenantUserId}/submit`                                                                                                                      |
| Governance | ActionId `teams.submit`                                                                                                                                                    |
| MCP        | *not exposed* — the MCP server registers `naive_teams_status`, `naive_teams_board`, `naive_teams_run`, `naive_teams_comment` and `naive_teams_unblock`, and no submit tool |

```bash theme={"theme":"css-variables"}
naive teams submit support "refund the duplicate charge on invoice 4471" --tenant tu_8f21
naive teams submit support "$(cat brief.md)" --tenant tu_8f21 --brief ./brief.md
naive teams submit support "rerun the audit" --tenant tu_8f21 --task card_19 --parent run_88
```

`--brief <file>` (or `--brief -` for stdin) exists because prose on `argv` is mangled by
every shell that touches it. Use it for anything with quotes, newlines or `$`.

For a hermes tenant `submit` answers `501 not_configured` — use the legacy surface
([`naive tasks create`](/docs/cli/tasks) or [`naive ceo run`](/docs/cli/ceo)) instead.

## The write fence

Eleven subcommands are **fenced** — they pass through the manifest write fence and are
evaluated under a governance ActionId. The CLI prints which one in `hints`:

```
`submit` passes through the write fence (ActionId teams.submit).
```

Fenced: `submit`, `say`, `unblock`, `decide`, `settle`, `schedule`, `unschedule`, `model`,
`stop`, `migrate`, `rollback`. Reads are never fenced.

`decide` is the fenced write that **works** on this build:

```bash theme={"theme":"css-variables"}
naive teams approvals support --tenant tu_8f21 --status pending
naive teams decide support apr_31f --tenant tu_8f21 --allow --because "verified with the customer"
naive teams decide support apr_31f --tenant tu_8f21 --deny  --because "outside the refund window"
```

`--because` is **required** on seven subcommands — `unblock`, `decide`, `settle`,
`model`, `stop`, `migrate` and `rollback`: a destructive or overriding act with no
recorded reason cannot be audited later. (`watch` also requires `--run <id>`.)

## Exit codes

`naive teams` is the only command group with exit codes beyond 0 and 1.

| Exit | When                              | How to get it                                                               |
| ---- | --------------------------------- | --------------------------------------------------------------------------- |
| `0`  | Success                           | default                                                                     |
| `1`  | The command failed                | default                                                                     |
| `2`  | `plan` found a diff               | `naive teams plan <team> --tenant <tu> --detailed-exitcode`                 |
| `3`  | At least one card is `unverified` | `--fail-on-unverified` on `tasks` / `task`, `--fail-on-terminal` on `watch` |

Exit 3 exists because `unverified` is a third terminal state, not a flavour of success.
Nothing exits 3 unless you ask for it. Exit 2 is opt-in because reusing exit 1 for
"changes exist" is indistinguishable from a real error in a CI script.

<Warning>
  **`--fail-on-unverified` is a hermes check — on a durable tenant exit 0 does not mean
  "attested".** The durable runtime's task states have no `unverified`, so the flag
  cannot fire there; `naive teams tasks --fail-on-unverified` prints a warning on stderr
  when the board came back `provider: "durable"`. On that runtime the equivalent signal
  is `attempts > 1` on a terminal card (a rejected completion is retried rather than
  recorded) — see [Board & cards](/docs/api-reference/runtime/board). `--fail-on-terminal` on
  `watch` works on both runtimes, but only `failed` of its three statuses occurs on the
  durable one.
</Warning>

## What this build does not serve yet

The subcommands marked **501** above are not 404s and not stubs. Each addresses a
mounted route that authorises your request, then refuses with `501 not_configured` and
an `error.details.missing` array naming every absent dependency. For example:

```json theme={"theme":"css-variables"}
{
  "success": false,
  "error": {
    "code": "not_configured",
    "message": "This build has no per-(team, tenant) session store.",
    "details": {
      "missing": [
        "session storage: no per-(team, tenant) channel or message table exists…",
        "durable runtime seam: the runtime has `channels` and `read`; no control-plane head…"
      ]
    }
  }
}
```

A refusal is a claim about *this build*; an empty list is a claim about *your company*.
`naive teams list` now makes the second kind: it returns `{"items": []}` for a company
that has applied no config, because that is a true statement about the company. It
answered `501` until the JSONB key holding a declared team's name was renamed
(`packages/db/migrations/065_agents_config_team_key.sql`) — the refusal named that
migration as its own remedy, and nothing else about the operation changed. If a command
instead reports the **route** as absent, you are talking to an API build where
`/v1/teams` is not mounted at all — the CLI rewrites the catch-all `resource_not_found`
into a message naming the missing mount.

## Coming from the legacy runtime

| Legacy                                                                     | Durable runtime                               |
| -------------------------------------------------------------------------- | --------------------------------------------- |
| [`naive ceo run`](/docs/cli/ceo) / `ceo message`                                | `naive teams say` · `show` · `runs` · `watch` |
| [`naive tasks create`](/docs/cli/tasks)                                         | `naive teams submit`                          |
| [`naive tasks list` / `show`](/docs/cli/tasks)                                  | `naive teams board` · `tasks` · `task`        |
| [`naive tasks unblock`](/docs/cli/tasks)                                        | `naive teams unblock`                         |
| [`naive objectives create`](/docs/cli/objectives)                               | `naive teams submit --task <id>`              |
| [`naive employees list`](/docs/cli/employees)                                   | `naive teams roster`                          |
| [`naive cron create`](/docs/cli/cron-jobs) · [`naive loops create`](/docs/cli/loops) | `naive teams schedule`                        |
| [`naive memory add`](/docs/cli/memory)                                          | [`naive brain remember`](/docs/cli/brain)          |

Four legacy capabilities have **no** replacement, and that is by design rather than an
oversight — see each page for the recorded reason: `tasks complete`, `tasks dispatch`,
`tasks run`, the `employees` provisioning verbs (`hire` / `fire` / `configure`), and
`cron pause` / `cron resume`.

## Related

* [`naive brain`](/docs/cli/brain) — the company brain a team reads and writes
* [`naive approvals`](/docs/cli/approvals) — the company-wide approval queue
* [`naive use`](/docs/cli/use) — selecting the subject `--tenant @self` resolves to
