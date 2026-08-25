> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# agents

> naive agents — long-horizon agents that run on a schedule, spend a budget, and deliver.

18 verbs. Output is **machine JSON by default** — safe for pipes, CI and agents.
Human-readable output is opt-in with `--human`, `NAIVE_HUMAN=1`, or
`naive config output human`.

## Create & manage

```bash theme={"theme":"css-variables"}
naive agents status                    # configured? reachable? roster + deployed harness hash
naive agents list                      # the roster and each agent's cap
naive agents show <id>                 # one agent, with its MATERIALISED limits
naive agents rm <id> --yes             # cancel queued work, stop the alarm chain
```

<Note>
  `list` and `show` render `status`, `next_wake_at`, `wakes`, `attention` and
  `blocked_reason` from the agent record, and nothing in the runtime writes those
  columns back — so they read `idle` / `null` / `0` / `false` / `null` on every
  agent, awake or not. What an agent is actually doing lives on the board
  (`naive agents tasks <id>`) and in the log (`naive agents logs <id>`).
</Note>

```bash theme={"theme":"css-variables"}
naive agents create \
  --name nightly-triage \
  --model anthropic/claude-sonnet-4-5 \
  --budget-usd 50 \
  --max-task-usd 5 \
  --instructions "Triage the overnight error queue." \
  --web-search --storage \
  --sandbox auto \
  --tz America/Los_Angeles \
  --cron "0 6 * * 1-5=Triage the errors from the last 24 hours."
```

The CLI takes **dollars** and converts to micro-USD. `--max-task-usd` defaults to
a tenth of `--budget-usd`. `--model` must be a **pinned** slug — an alias is
refused. `create` needs a child project selected first (`naive use <user-id>`) —
without one the API answers `invalid_input`.

<Warning>
  🔴 **`--window standard|flex` needs a model that declares the window, and is
  REFUSED on the rest.** On any other model the flag passes the CLI, passes the
  API, and is then **refused at the first model call** with `window_unavailable` —
  refused rather than downgraded to `asap`, because a downgrade reports a discount
  nobody bought. The gate runs before a provider is chosen, so a refused turn
  spends nothing. Leave `--window` off unless the agent is pinned to a model that
  declares it.

  The CLI does not validate the value — the server does the refusing, so a fix
  ships with a deploy rather than with a new install.
</Warning>

| flag                                   |                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `--name <name>`                        | 1–64 chars of `[a-zA-Z0-9 _-]`                                         |
| `--model <slug>`                       | A pinned `vendor/model` slug. Never a family or an alias.              |
| `--budget-usd <usd>`                   | Hard cap. **Required** — an uncapped agent is not creatable.           |
| `--max-task-usd <usd>`                 | Per-task ceiling. Defaults to a tenth of the cap.                      |
| `--budget-period <p>`                  | `total` \| `day` \| `week` \| `month` \| `year` (default `month`)      |
| `--instructions <text>`                | What this agent is for                                                 |
| `--window <w>`                         | `asap` (default) \| `standard` \| `flex` — **GLM-5.2 only**, see above |
| `--delegate-model <slug...>`           | Models a sub-agent may run. Empty = delegation off.                    |
| `--cron <spec...>`                     | `"<5-field cron>=<the work to send>"`, repeatable                      |
| `--tz <iana>`                          | Timezone for `--cron` (default `UTC`)                                  |
| `--web-search` `--browser` `--storage` | Tool toggles                                                           |
| `--sandbox <mode>`                     | `none` \| `auto`. A pinned workspace id is not wired and is refused    |
| `--secret <name...>`                   | Vault entry **names**. Never values.                                   |
| `--connection <id...>`                 | Connection ids to attach                                               |
| `--wake-ms <ms>`                       | Wall budget per wake, 30000–840000                                     |
| `--max-turns <n>`                      | Turns per task                                                         |
| `--max-tool-calls <n>`                 | Tool calls per turn, 1–32                                              |

`update` takes every create flag plus `--paused` / `--no-paused`:

```bash theme={"theme":"css-variables"}
naive agents update <id> --budget-usd 100      # room for the NEXT task; see below
naive agents update <id> --paused              # arms no wake, fires no cron
naive agents update <id> --no-paused           # arms again, and runs what waited
```

`--paused` is a hold on execution: no wake is armed, no schedule fires, and a
task you send is still accepted and still queued — it waits for `--no-paused`.
It does not abort a slice already running; that is `naive agents cancel`.

<Warning>
  🔴 **Raising the cap does less than it reads.**

  It does **not** restart a task the cap already stopped. A braked task is never
  claimed again — not at the period reset, not on a higher cap — so raise the cap
  and re-send the work with `naive agents job`.
</Warning>

`list` filters on `--status idle|running|blocked|braked|stopped`, `--limit`,
`--cursor` — but the agent-level `status` column is a mirror nothing writes to,
so every agent is `idle` and `--status running` returns nothing. Use
`naive agents tasks <id> --status …` for real state.

## Send work

```bash theme={"theme":"css-variables"}
naive agents job <id> "Summarise last night's errors."     # queue it, print the task
naive agents run <id> "Summarise last night's errors."     # queue it and stream it
naive agents run <id> "…" --human                          # rendered instead of NDJSON
```

Both take:

| flag                    |                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------- |
| `--mode <m>`            | `act` (default, every granted tool) \| `ask` (read-only)                        |
| `--window <w>`          | `asap` \| `standard` \| `flex` — this task only; **omitted inherits the agent** |
| `--priority <p>`        | `normal` \| `low` — board order; does not defer                                 |
| `--not-before <iso>`    | Nothing runs before this instant                                                |
| `--idempotency-key <k>` | A **permanent** business key: the same key returns the same task, forever       |

<Note>
  `--window` on `job` / `run` takes all three values. An earlier release accepted
  `--window standard` on a task, stored it and echoed it back as `asap`; the
  runtime narrowed the inbound window with a two-way test written when there were
  two windows, and it now narrows against the platform's window table.

  **It is not the same knob as `create --window`.** On a task the value selects the
  tier the call is *priced* at. The run's fan-out, sub-agent width and batch hint
  come from the **agent's** window and only from there, because the run manifest
  declares one strategy before its first turn.

  **Omitting `--window` inherits the agent's configured window** — it does *not*
  fall back to `asap`. The CLI simply sends no field, and the runtime resolves it
  against the agent. An earlier release did read an omitted window as `asap`; that
  changed. Pass the flag only when one task needs a tier other than its agent's.
</Note>

## The board

```bash theme={"theme":"css-variables"}
naive agents tasks <id>                         # the board IS the job queue
naive agents tasks <id> --status waiting        # queued|running|waiting|done|failed|cancelled|braked
naive agents tasks <id> --source schedule       # api|schedule|webhook|agent|self
naive agents tasks <id> --since 2026-08-01T00:00:00Z --limit 50

naive agents task <id> <task-id>                # one unit of work
naive agents cancel <id> <task-id>              # cooperative — never aborts mid-tool
naive agents reply <id> <task-id> "Use staging." # answer a task parked on needs_input
```

<Note>
  🔴 **`naive agents task` exits 3 when the task's terminal state is not success** —
  not 1. Exit 1 means *the command* failed; exit 3 means the command worked and
  *the work* did not. A CI step can tell those apart without parsing anything.
</Note>

## The event log

```bash theme={"theme":"css-variables"}
naive agents logs <id>                       # a page of the trace
naive agents logs <id> --follow              # tail it live (NDJSON, one object per line)
naive agents logs <id> --task <task-id>      # narrow to one task
naive agents logs <id> --kind tool_call      # narrow to one event kind
naive agents logs <id> --after 120           # resume strictly after a POSITION
naive agents logs <id> --show-args           # full tool args (interactive terminals only)
```

`--after` is a **position, never a time**. Replay is strictly greater, so a
resume loses nothing and duplicates nothing. If your offset has aged out past the
20,000-row retention floor you are told, rather than silently skipped:

```
"next_cursor": "6", "earliest_seq": 4, "truncated": true
hint: ⚠ replay truncated — earliest retained seq 4 (20,000-row cap); starting there
```

`--show-args` prints tool arguments in full instead of a digest and refuses to
run in a pipe — a full-argument dump of a sandbox run contains file contents.

## Spend

```bash theme={"theme":"css-variables"}
naive agents spend <id>                 # by component
naive agents spend <id> --by task       # by task
naive agents spend <id> --task <task-id>  # the authoritative figure for one task
```

```
  cap $50.00 per month (hard)
  inference           1.2500 cr
  sandbox             0.0000 cr  (0 calls)
  web_search          0.0000 cr  (0 calls)
  browser             0.0000 cr  (0 calls)
  storage             0.0000 cr  (0 calls)
  wakes               0.0000 cr  (rate not configured)
  total               1.2500 cr
```

Every component prints including the zeros. The CLI never computes money — every
figure is the string the API sent.

## Deliverables

```bash theme={"theme":"css-variables"}
naive agents deliverables <id>                      # manifests
naive agents deliverables <id> --task <task-id>
naive agents deliverables <id> --id <deliverable-id>  # one, with a FRESH download url
```

The download URL is minted on read, lives an hour, and is unauthenticated once
issued — do not cache it, run the command again.

## Inbound webhooks

```bash theme={"theme":"css-variables"}
naive agents webhook-add <id> --name github-pr   # prints the secret ONCE
naive agents webhooks <id>                       # secrets never returned
naive agents webhook-rm <id> <hook-id>           # refuses if it removed nothing
```

## Output & exit codes

Machine JSON is the **default**, so nothing has to detect a pipe to be safe.
`--human` (or `NAIVE_HUMAN=1`, or `naive config output human`) switches to
rendered output; `--json` forces machine output back even when human mode is
configured.

```bash theme={"theme":"css-variables"}
naive agents show <id> | jq '.result.agent.budget.cap_micro_usd'
naive agents list --human
```

| exit | meaning                                                        |
| ---- | -------------------------------------------------------------- |
| `0`  | Success                                                        |
| `1`  | The command failed — bad input, a refusal, an unreachable API  |
| `3`  | The command worked; the **work** did not (`naive agents task`) |

## Common recipes

```bash theme={"theme":"css-variables"}
# Debug an agent that misbehaved at 3am
naive agents logs <id> --after 0 --limit 200
naive agents task <id> <task-id>            # exit 3 tells you the work failed

# Find everything waiting on a human
naive agents tasks <id> --status waiting
naive agents reply <id> <task-id> "Use the staging database."

# What did last night cost, per task
naive agents spend <id> --by task

# Find the tasks the budget stopped. They do not restart — re-send the work.
naive agents tasks <id> --status braked
```

See the [Agents overview](/docs/agents/overview), [quickstart](/docs/agents/quickstart) and
[SDK reference](/docs/sdk/sub-clients/agents).
