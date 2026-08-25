> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agents API Reference

> All 20 agents REST endpoints — lifecycle, the task board, the event log, deliverables, spend, and inbound webhook control.

## Overview

Requires `Authorization: Bearer nv_sk_…`. Gated by the **`agents` primitive** in
the child project's Account Kit, and the gate is **strict**: an *absent* kit
entry denies, not just an explicit `enabled: false`. A denial answers `403
forbidden` with `details.reason = "primitive_disabled_by_kit"`.

Routes are mounted twice:

| mount                           | subject                                                  |
| ------------------------------- | -------------------------------------------------------- |
| `/v1/users/:user_id/agents/...` | The named child project. **Use this.**                   |
| `/v1/agents/...`                | Company-scoped; resolves the subject from the credential |

<Warning>
  🔴 **`POST /v1/agents` refuses without a resolved child project.** Creating an
  agent requires one — it is the credential boundary that owns the vault entries
  and the Account Kit. Address `/v1/users/:user_id/agents`, or select a subject
  with the `X-Naive-User-Id` header.
</Warning>

**Tenancy is `404`, never `403`.** Another tenant's agent id and a nonexistent
one produce the same answer everywhere in this primitive, so an id is never
confirmed to someone who should not have it.

<Note>
  One child project owns **many** agents, and the child project — not the agent —
  is the boundary. A key scoped to it reads both siblings' transcripts and can
  delete either. Separate agents that must not see each other into separate child
  projects.
</Note>

## Endpoints

| Method | Path                                          | Description                                                                 |
| ------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/v1/agents/status`                           | Primitive status: configured, reachable, roster, deployed harness hash      |
| POST   | `/v1/agents`                                  | Create an agent — `201`. `name`, pinned `model` and `budget` required       |
| GET    | `/v1/agents`                                  | List (`?status=&paused=&limit=&cursor=`)                                    |
| GET    | `/v1/agents/:id`                              | One agent, with **materialised** limits                                     |
| PATCH  | `/v1/agents/:id`                              | Update. `limits` and `tools` merge field by field; everything else replaces |
| DELETE | `/v1/agents/:id`                              | Cancel queued work, stop the alarm chain. **The spend ledger is kept**      |
| POST   | `/v1/agents/:id/tasks`                        | Enqueue work — `202`, or SSE on `Accept: text/event-stream`                 |
| GET    | `/v1/agents/:id/tasks`                        | The board (`?status=&source=&since=&limit=&cursor=`)                        |
| GET    | `/v1/agents/:id/tasks/:task_id`               | One task                                                                    |
| POST   | `/v1/agents/:id/tasks/:task_id/cancel`        | Cooperative cancel — never aborts mid-tool                                  |
| POST   | `/v1/agents/:id/tasks/:task_id/reply`         | Answer a task parked on a question (`{ text }`)                             |
| GET    | `/v1/agents/:id/events`                       | The event log: a keyset page, or SSE on `Accept: text/event-stream`         |
| GET    | `/v1/agents/:id/deliverables`                 | Artifact manifests (`?task=&limit=&cursor=`)                                |
| POST   | `/v1/agents/:id/deliverables`                 | Record a manifest — `201`                                                   |
| POST   | `/v1/agents/:id/deliverables/upload`          | Mint a presigned PUT into the sink — `201`                                  |
| GET    | `/v1/agents/:id/deliverables/:deliverable_id` | One manifest + a fresh download url + inline text                           |
| GET    | `/v1/agents/:id/spend`                        | Spend against the cap (`?by=component\|task&task=`)                         |
| POST   | `/v1/agents/:id/webhooks`                     | Mint an inbound URL — `201`. **The secret is in this response only**        |
| GET    | `/v1/agents/:id/webhooks`                     | The URLs bound to this agent. `secret_set`, never the value                 |
| DELETE | `/v1/agents/:id/webhooks/:hook_id`            | Revoke one. `404` when it removed nothing                                   |

## Create

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{
    "name": "nightly-triage",
    "instructions": "Triage the overnight error queue.",
    "model": "anthropic/claude-sonnet-4-5",
    "delegate_models": [],
    "completion_window": "asap",
    "budget": {
      "cap_micro_usd": 50000000,
      "period": "month",
      "max_task_micro_usd": 5000000,
      "alert_at": 0.8,
      "hard": true
    },
    "tools": { "web_search": true, "sandbox": "auto", "storage": true },
    "limits": { "sliceWallMs": 600000, "maxToolCallsPerTurn": 8 },
    "schedule": { "cron": "0 6 * * *", "tz": "America/Los_Angeles", "text": "Triage last night." },
    "secrets": ["github.token"],
    "connections": [],
    "metadata": { "team": "platform" }
  }'
```

```json theme={"theme":"css-variables"}
201
{ "agent": {
    "id": "…", "tenant_user_id": "…", "project_id": "…",
    "name": "nightly-triage", "model": "anthropic/claude-sonnet-4-5",
    "completion_window": "asap",
    "budget": { "cap_micro_usd": 50000000, "period": "month", "period_start": "…", … },
    "tools": { "web_search": { "requested": true, "effective": true }, … },
    "limits": { "sliceWallMs": 600000, "turnWallMs": 300000, … },
    "status": "idle", "next_wake_at": null, "wakes": 0, "harness_sha256": null } }
```

<Warning>
  🔴 **The last four are what every agent reads, forever.** `status`,
  `blocked_reason`, `attention`, `next_wake_at` and `wakes` are columns on the
  agent row that no code path writes: the runtime holds those facts in its own
  durable object and posts back only `agent.budget_reached` and
  `agent.job_complete`, neither of which lands in the row. A running, braked or
  scheduled agent still reads `"status": "idle"`, `"next_wake_at": null`,
  `"wakes": 0` — and `GET /v1/agents?status=running` returns nothing.

  Use `GET /:id/tasks` and `GET /:id/events` for live state. `harness_sha256` is
  stamped only when the runtime records a deliverable carrying one.
</Warning>

### Every field of the create body

Twelve top-level fields on `POST`, plus `paused` on `PATCH` — and this table is
the whole of both. Every one is persisted, and every one except `metadata` is
carried to the runtime on the config push that follows the write.

<Warning>
  🔴 **Three things on this page are accepted, stored, echoed back, and change
  nothing the runtime does.** They are marked in place below rather than quietly
  listed as supported: `budget.alert_at`, `budget.hard`, and a schedule entry's
  `window`.
</Warning>

| field               | type                                        | required                             | what it does                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | string, 1–64 chars of `[a-zA-Z0-9 _-]`      | **yes**                              | Display name. Not unique — the `id` is the identity                                                                                                                                                                                                                                                                                       |
| `instructions`      | string, ≤ 8 KB                              | no                                   | Prepended to the Vetta system prompt. Reads back as `instructions`                                                                                                                                                                                                                                                                        |
| `model`             | string, pinned `vendor/model`               | **yes**                              | The model every turn runs on. An alias is refused                                                                                                                                                                                                                                                                                         |
| `delegate_models`   | string\[], ≤ 8 pinned slugs                 | no — default `[]`                    | Models a sub-agent may run. **Empty means delegation is OFF** and the `delegate` tool is absent from the schema list. This array is the only switch                                                                                                                                                                                       |
| `completion_window` | `asap` \| `standard` \| `flex`              | no — default `asap`                  | The agent's own scheduling tier, and the default a *task* inherits when it omits `window`. A non-`asap` value needs a model that declares the window; on any other model the first model call is refused with `window_unavailable`                                                                                                        |
| `budget`            | object (below)                              | **yes**                              | The cap. An agent with no cap is not creatable                                                                                                                                                                                                                                                                                            |
| `tools`             | object, the six keys below                  | no — default `{}`                    | Which naive primitives this agent may reach. Narrows only                                                                                                                                                                                                                                                                                 |
| `limits`            | object, any subset of the eleven slice keys | no — platform defaults, materialised | Operational bounds. An **unknown key is an error**                                                                                                                                                                                                                                                                                        |
| `schedule`          | object or array of objects (below)          | no                                   | Cron entries that wake the agent and send `text`                                                                                                                                                                                                                                                                                          |
| `secrets`           | string\[], ≤ 32                             | no — default `[]`                    | Vault entry **names** to expose to the workspace. Never values                                                                                                                                                                                                                                                                            |
| `connections`       | string\[], ≤ 32 ids of ≤ 200 chars          | no — default `[]`                    | Connection ids to attach                                                                                                                                                                                                                                                                                                                  |
| `metadata`          | `Record<string,string>`                     | no — default `{}`                    | Stored on the agent and echoed on every agent read. Never modelled, never sent to a provider, and **not** copied onto its tasks — a task's own `metadata` is a separate field on `POST /:id/tasks`                                                                                                                                        |
| `paused`            | boolean                                     | **`PATCH` only**                     | A **hold on execution**: no wake is armed and no schedule fires. Work sent to a paused agent is still accepted and still `queued` and runs when you set it back to `false`. It does not abort a slice already running — `POST /:id/tasks/:task_id/cancel` does that. `POST` does not take the key; a created agent always starts unpaused |

`budget`:

| field                | type                                            | required            | what it does                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cap_micro_usd`      | positive integer micro-USD                      | **yes**             | The spend ceiling for the period                                                                                                                                                                     |
| `period`             | `total` \| `day` \| `week` \| `month` \| `year` | **yes**             | What the cap is per. `total` is "spend this much on this job, ever"                                                                                                                                  |
| `max_task_micro_usd` | positive integer micro-USD                      | **yes**             | Per-task ceiling, intended to be checked before every model call. 🔴 **Measured not enforced on a deployed host** — see the accordion below                                                          |
| `alert_at`           | number, 0–1                                     | no — `null` = never | 🔴 **Stored, not enforced.** Validated as a fraction and pushed to the runtime, and nothing compares spend against it — there is no `budget.alert` emitter. Read the per-turn `budget` event instead |
| `hard`               | boolean                                         | no — default `true` | 🔴 **Stored, not enforced.** Both the period cap and the per-task ceiling refuse unconditionally; the flag is not read at the gate, so `false` does not keep the agent running                       |

`tools` — the six keys are `web_search`, `browser`, `sandbox`, `storage`,
`delegation` and `connections`, and **any other key is refused**, not dropped.
Five of them take `true` or `false` and nothing else; `sandbox` takes the mode
string `"none"` or `"auto"`.

🔴 **A toggle this deployment cannot serve reads back `effective: false` with an
`unavailable_reason`, and the agent is not offered the tool.** `web_search`,
`browser` and `connections` have **no substrate in any binding** and always
answer `unavailable_reason: "no_substrate"`; `sandbox` answers
`not_configured` / `credential_rejected` / `credential_foreign`; `storage`
answers `not_configured` when no object store is set, which is also when
`download_url` is `null` on every deliverable. `requested` is never rewritten —
your intent is preserved and the answer is separate. `GET /v1/agents/status`
carries the same table, per toggle, with a sentence and an operator hint, before
any agent exists.

🔴 **A pinned workspace id is refused.** `tools.sandbox` was documented as
`"none" | "auto" | "<workspace id>"` and the third form was accepted with a 201
and read back as `effective: "<that string>"` — while reaching no component that
provisions a sandbox. `AgentConfig` has no workspace field and the runtime's
workspace binding never sees the value, so the pin was a setting nothing
honoured. It is now a `400` naming the field, rather than a 201 confirming a
pin that does not hold.

🔴 **The other five stopped accepting strings.** They were typed
`boolean | string` so that `sandbox` could carry a mode, and a string on any of
them was read as on unless it was `""` or `"none"` — so `{"browser":"false"}`
was a 201 that **granted** the browser. They take booleans.

`schedule` entry:

| field     | type                                              | required            | what it does                                                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cron`    | string, exactly 5 fields (`min hour dom mon dow`) | **yes**             | When it fires. Seconds are not a field                                                                                                                                                                                                                                  |
| `text`    | string, 1–8,192 chars                             | **yes**             | The work sent when it fires. A schedule with no work is a bug that fires forever                                                                                                                                                                                        |
| `tz`      | IANA name                                         | no — default `UTC`  | The zone `cron` is read in                                                                                                                                                                                                                                              |
| `window`  | `asap` \| `standard` \| `flex`                    | no                  | 🔴 **Stored, not enforced.** Validated here, validated again when the config reaches the runtime, and then dropped: the runtime's schedule table has no window column and every schedule-fired task is created with `asap`. Set the agent's `completion_window` instead |
| `enabled` | boolean                                           | no — default `true` | Whether it fires at all                                                                                                                                                                                                                                                 |

`limits` — the eleven keys, all integers of milliseconds or counts:
`sliceWallMs`, `turnWallMs`, `maxTurnsPerSlice`, `maxToolCallsPerTurn`,
`toolTimeoutMs`, `maxTurnsPerTask`, `taskWallMs`, `maxSubrequestsPerSlice`,
`maxDepth`, `deferredMaxMs`, `maxPollAttempts`.

<Note>
  **Both `POST` and `PATCH` are strict.** A key the schema does not know is
  `400 invalid_input`, naming the field, the allowed set, and — where the mistake
  is a known one — where the field you meant actually lives. Send only the fields
  in the table above.

  On `PATCH`, `limits` and `tools` **merge field by field**; `budget`, `schedule`,
  `secrets`, `connections`, `delegate_models` and `metadata` **replace** wholesale.
  A partial `budget` where `period` moved and `cap_micro_usd` did not is a cap
  nobody meant to set, so the whole object is required together.

  **`budget` round-trips.** `GET` emits `budget.period_start` and the platform owns
  it, so on `PATCH` you may send it back **unchanged** and it is ignored — read a
  budget, change one number, write the whole object back, `200`. A **different**
  `period_start` is still `400`: accepting one and discarding it would report a
  billing period that never moved. At create there is no period to echo yet, so
  `period_start` there is refused outright. `budget.alert_at` accepts the `null`
  `GET` emits for an agent that has never set a threshold.
</Note>

### Field rules

<AccordionGroup>
  <Accordion title="model — must be PINNED">
    `vendor/model`, and never an alias. `auto`, `best`, `latest`, `default` and
    `preview` are refused with `invalid_input`. An alias resolves differently on two
    days, which makes two runs of the same agent incomparable.

    There is deliberately no per-model rate card to validate membership against, so
    whether a pinned model is *servable* is answered by the first call, as
    `model_not_priceable` against real observed cost.
  </Accordion>

  <Accordion title="budget — required, and integer micro-USD">
    `cap_micro_usd` and `max_task_micro_usd` are positive integers of **micro-USD**,
    not cents: a turn's reserve is routinely sub-cent. `period` is
    `total|day|week|month|year`. `alert_at` is a 0–1 fraction. `hard` defaults true.

    An agent with no cap is not creatable — a null cap means no cap **and** no
    per-agent spend record at all.

    `max_task_micro_usd` is checked before each model call against **that task's
    own** spend — its root run plus every sub-agent it delegated to — using the same
    reserve the cap is checked against. Crossing it **ends the task**: `status:
        failed`, non-retryable, with both numbers in `error`. It does not park the way
    the cap does, because a per-task ceiling never resets.

    🔴 **Measured against deployed staging (`task-def 41`), that paragraph is intent
    and not behaviour.** An agent with `max_task_micro_usd: 1` and a period cap large
    enough that it could not interfere ran three consecutive tasks to `status: done`,
    spending 17,954 / 10,359 / 12,054 micro-USD — up to 18,000x the ceiling — with
    `error: null` and `blocked_reason: null` on each. Independently reproduced on a
    second agent (21,464 and 22,871 micro-USD against the same ceiling). The field is
    required at create and is currently not a control.

    Crossing the **cap** parks the task at `status: braked`, and that state is
    terminal in practice: the runtime's board claims only `queued`, `running` and
    `waiting`, and nothing moves a task out of `braked` — not the period rolling
    over, and not a `PATCH` raising the cap. Raise the cap to let the next task run,
    and re-send the work.

    🔴 **The cap is an ADMISSION gate, so the first task overshoots it.** Measured
    with `cap_micro_usd: 1`, `period: total`, `hard: true`: task #1 ran to
    `status: done` and spent 22,534 micro-USD; task #2 returned `status: braked`,
    `blocked_reason: budget`, `spent: 0`. The park path is exactly as specified from
    the second task onward — a fresh agent gets one unbounded task.
  </Accordion>

  <Accordion title="limits — sparse in, materialised out">
    Send only the fields you want to change; the rest take platform defaults and are
    **written onto the record**, so `GET` shows the numbers the agent will actually
    run with rather than a pointer to a default that can move under it.

    An **unknown key is an error**, never an ignore. `sliceWallMs` is 30,000–840,000
    (840,000 = 14 minutes, a hard guard under the platform's 15-minute alarm
    ceiling — it bounds a *wake*, never a task). `turnWallMs` may not exceed
    `sliceWallMs`; `toolTimeoutMs` may not exceed half of it.
  </Accordion>

  <Accordion title="schedule — five cron fields">
    `min hour dom mon dow`. Seconds are not a field. `text` is required — a schedule
    with no work is a bug that fires forever. `tz` is IANA, default `UTC`. Takes an
    object or an array.
  </Accordion>

  <Accordion title="secrets — names, never values">
    Vault entry **names**. The server rejects strings shaped like values
    (`sk-…`, `ghp_…`, `nv_sk_…`, `vt_…`, `xox[baprs]-…`) — that check is here rather
    than deeper because after this point the string is already in a request log.
  </Accordion>

  <Accordion title="tools — narrows only">
    Reads return `{ requested, effective }` per tool — a flag cannot widen the
    Account Kit, so `requested: true` with `effective: false` means the kit removed
    it. `web_search` resolves to naive's `search` primitive under the same child
    project's kit, so a kit with `search` off removes the tool whatever the flag
    says. Types are in the table above.
  </Accordion>
</AccordionGroup>

## Send work — one route, two representations

`POST /:id/tasks` is a single route. The `Accept` header decides.

```bash theme={"theme":"css-variables"}
# 202 + the task record
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/tasks \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "text": "Summarise the last 24 hours of errors.", "mode": "act", "window": "asap" }'

# The same call, streamed
curl -N -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/tasks \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{ "text": "Summarise the last 24 hours of errors." }'
```

Body: `text` (required, ≤ 256 KB), `payload`, `mode` (`act`|`ask`), `priority`
(`normal`|`low`), `window` (`asap`|`standard`|`flex`), `not_before`,
`idempotency_key`, `metadata`. Every other key is a `400`.

<Warning>
  🔴 **`mode`, `priority` and `not_before` take their own values and NOTHING
  else — case included.** Until 2026-08-19 this body was hand-parsed field by
  field with no rule for a value it did not recognise, so all three were accepted
  and silently changed:

  | Sent                         | Was                                                       | Is now                      |
  | ---------------------------- | --------------------------------------------------------- | --------------------------- |
  | `"mode": "ASK"`              | `201`, stored `mode: "act"`                               | `400`, naming `act, ask`    |
  | `"not_before": "not-a-date"` | `201`, field dropped, **task ran immediately and billed** | `400`                       |
  | `"priority": "urgent"`       | `201`, stored `priority: "normal"`                        | `400`, naming `normal, low` |

  The first is the one that matters. **`mode` is a permission**, not a phrasing:
  `ask` hands the agent the READ-ONLY tools only, so `"ASK"` with the wrong case
  did not fail closed to read-only — it fell through to `act` and returned a
  write-capable agent under a `2xx`. An **absent** `mode` still means `act`; a
  present-and-unrecognised one is refused rather than defaulted in either
  direction.

  **`not_before` is ISO-8601, or epoch milliseconds as a string.** A timestamp
  **already in the past is accepted and means run now** — `not_before` computed
  from the current clock is in the past by the time the request is parsed, so a
  refusal there would depend on how long the call spent on the wire and would let
  an idempotent retry come back `400`. Only a value that is not an instant at all
  is refused.
</Warning>

<Note>
  **`202` means durably queued.** The row is inserted and the alarm armed in one
  transaction before the response returns, so a runtime outage is a `503` and never
  a silent delay.

  **`source` is platform-set.** No request body may set it — a caller-settable
  source makes the observability column a lie.

  On the streaming branch, frame zero is `event: task_created` carrying
  `{ task_id }`, so a streaming caller holds a real id before the first real event.
  The stream subscribes at `after=-1`, which closes the race between the enqueue
  and the attach: anything appended in between is replayed, not lost.
</Note>

<Warning>
  🔴 **A non-`asap` window needs a model that declares one, and is REFUSED
  otherwise.** The gate lives in the model port rather than at this edge, so a
  non-`asap` window on a model without the tier is accepted here with a `202` and
  then **refused at the first model call** with `window_unavailable` — never
  downgraded to `asap`. It surfaces as a failed task, not as a rejected request,
  and nothing is spent: the gate runs before a provider is chosen.

  The refusal is deliberate. A window accepted and served as `asap` under another
  name would report a discount nobody bought, with no field downstream
  disagreeing — which is exactly what it did before the gate existed. On a model
  without the tier, send `asap` or omit the field.
</Warning>

<Warning>
  🔴 **Measured against deployed staging, `window: "standard"` on this route is
  silently replaced by the agent's own `completion_window`.** A 7-cell matrix over
  agents whose defaults differ: requested `asap` stored `asap` and requested `flex`
  stored `flex` on every agent, but requested `standard` stored the agent's window
  (agent `asap` → `asap`; agent `flex` → `flex`; agent `standard` → `standard`,
  which masks it). The edge is not at fault — `window=bogus` returns a typed
  `400 invalid_input` with `details.allowed = [asap, standard, flex]`, so the
  request arrives valid. The fix is in the runtime source; the deployed edge worker
  is behind it. Until your deployment's worker is current, read the `window` back
  off the task record rather than trusting the request.

  🔴 **And a non-`asap` window on a non-GLM model was served and billed rather than
  refused.** An agent on `anthropic/claude-sonnet-5` with `completion_window: flex`
  ran to `status: done`, spent 8,054 micro-USD, and its task recorded
  `window: "asap"`. No `window_unavailable` on any route. Two sub-facts: an agent's
  `completion_window` is not inherited by its tasks at all, and the only model the
  gate admits was not servable on that host, so the refusal was unreachable there
  by any route.
</Warning>

<Note>
  A per-task `"window"` takes all three values, as does the agent-level
  `completion_window`. `ci/agents-window-parity.test.ts` fails if any surface goes
  back to spelling the window set by hand. A **schedule entry's** `window` is
  accepted and dropped — see the field table above.

  **A task's window is not the agent's knob.** Here it selects the tier the call is
  priced at. The run's tool fan-out, sub-agent width and batch hint come from the
  agent's `completion_window` alone, because a run declares one strategy in its
  manifest before its first turn.

  **Omitting the field on a task inherits the agent's `completion_window`.** It
  does not fall back to `asap`. The edge forwards an absent window as `undefined`
  and the runtime resolves it, so exactly one component holds that default. An
  earlier release did read an omitted window as `asap`; if you are working from
  notes written against that behaviour, it changed.

  A misspelled window is a typed `400 invalid_input` here, with
  `details.allowed = [asap, standard, flex]` — it never becomes a silent `asap`.
</Note>

## The event log

```bash theme={"theme":"css-variables"}
# A keyset page
curl "https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/events?after=120&limit=100&kind=tool_call" \
  -H "Authorization: Bearer $NAIVE_KEY"
# → { "items": [...], "next_cursor": "220", "earliest_seq": 4, "truncated": false }

# The same log, live
curl -N "https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/events?after=120" \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Accept: text/event-stream"
```

Query: `task`, `after`, `limit`, `kind`.

<Warning>
  **`after` is a POSITION, never a time.** Replay is strictly greater than the
  value passed, so a resume loses nothing and duplicates nothing.

  Retention is **20,000 rows, no TTL**. An attach older than the floor answers with
  `earliest_seq` and `truncated: true` and starts there.

  🔴 **`kind` is accepted and SILENTLY IGNORED on a deployed host.** Measured:
  `?kind=declared` returned all 102 events spanning 12 distinct kinds, and
  `?kind=no_such_kind_at_all` returned the same 102. The edge forwards the
  parameter; the runtime's pager drops it. A caller filtering by kind receives the
  whole log believing it is filtered — filter client-side until this closes.
  `?task`, `?limit` and `?after` are all honoured correctly.
</Warning>

`Last-Event-ID` is honoured when `after` is absent — that is what makes a browser
`EventSource` resume rather than replay from the start.

## Deliverables

```bash theme={"theme":"css-variables"}
# 1. Mint a presigned PUT — the bytes never traverse the API process
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/deliverables/upload \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "filename": "report.pdf", "content_type": "application/pdf", "bytes": 82311 }'
# → 201 { "storage_key": "…", "upload_url": "https://…", "bytes": 82311, "expires_in": 3600 }

# 2. Record the manifest
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/deliverables \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "agent_task_id": "…", "title": "Nightly triage", "kind": "report",
        "storage_key": "…", "bytes": 82311, "final": true, "summary": "…" }'
```

`kind` ∈ `report|doc|code|dataset|image|video|pr|deploy|other`. Inline `text` is
allowed up to 256 KB instead of a `storage_key`. **20 per task, 25 MB each.**

An agent's own deliverables carry the `kind` **the model chose**: the runtime's
`deliver` tool offers those same nine words and sends the one it was given, for
an inline delivery and for a published file alike. It is `other` when the agent
named none, and `other` — with the refused word echoed back to the model in the
tool result — when it named something outside the list. Before that field
existed on the tool, every runtime-written row took the route's `other` default,
whatever the task asked for.

<Note>
  🔴 **`final: true` requires `text`, `storage_key` or `no_artifact_reason`** and is
  refused otherwise — without that, "deliver" degrades into a status update.

  `upload_url` / `download_url` are `null` when the deployment has no storage sink
  configured. That is a deployment state, not an error; send `text` instead. A
  minted `download_url` is unauthenticated once issued and lives one hour — never
  cache it.
</Note>

<Warning>
  🔴 **`final: true` returned `500 internal_error` on every deployed host — FIXED
  in the API, not yet on the running staging image.** Bisected to that one field: a
  body of `{agent_task_id, title, kind: "report", text, bytes, final: true}`
  answered `500`, and the identical body with `final: false` answered `201`. The
  cause was a schema mismatch, not a validation rule: `recordDeliverable` inserted
  `status: "final"` for a final manifest, while the `agent_artifacts_status_check`
  constraint admits only `created | reviewed | published | failed | deleted`.
  Migration 070 added the deliverable columns and never widened the CHECK. The fix
  records every deliverable as `created` — finality is a property of the DELIVERY,
  not a point on the artifact's review lifecycle, and it is already carried in
  `metadata.final`, which is the copy this API has always returned as `final`.

  **The related question is now answered, and the answer is a SECOND, STILL-OPEN
  defect.** Four real agent `deliver(final: true)` tool calls each reported success
  to the model and emitted a `delivered` event, yet `GET /deliverables` listed only
  manifests written by hand. The runtime **never attempted the write**: it did not
  500 and get swallowed. `deliverCall` publishes only when the model passes a
  `file`, and those four deliveries were inline text — which is exactly what their
  `noArtifactReason: "the output is inline text"` records. And the one runtime
  writer that does exist, the sandbox sink's `publish`, posts no `final` field at
  all, so a runtime-written manifest is always `final: false`.

  **Consequence: fixing the `500` does not by itself make a delivered artifact
  appear here.** A `final: true` manifest is currently only reachable from a
  direct API, SDK, CLI or MCP caller. Until the runtime writes one, `GET
    /deliverables` remains empty for an agent whose answer was inline text, and the
  answer is retrievable only from the `delivered` event on the event stream and
  from the `job_complete` webhook.

  `POST .../deliverables/upload` itself is fine — `201` with a `storage_key` and a
  presigned PUT — so the route-shadowing hazard the source warns about is correctly
  avoided.
</Warning>

## Spend

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/spend?by=component" \
  -H "Authorization: Bearer $NAIVE_KEY"
```

```json theme={"theme":"css-variables"}
{ "period": "month", "period_start": "2026-08-01T00:00:00.000Z",
  "cap_micro_usd": 50000000, "max_task_micro_usd": 5000000, "hard": true,
  "spent_credits": "1.2500", "spent_micro_usd": 41125, "billed_credits": "0.0000",
  "metered": { "available": true, "calls": 14, "unpriced_calls": 0,
               "authority": "durable_object" },
  "by": "component",
  "groups": [
    { "key": "inference",  "credits": "1.2500", "calls": 14, "micro_usd": 41125,
      "unpriced_calls": 0, "source": "meter" },
    { "key": "sandbox",    "credits": "0.0000", "calls": 0, "source": "ledger" },
    { "key": "web_search", "credits": "0.0000", "calls": 0, "source": "ledger" },
    { "key": "browser",    "credits": "0.0000", "calls": 0, "source": "ledger" },
    { "key": "storage",    "credits": "0.0000", "calls": 0, "source": "ledger" },
    { "key": "wakes",      "credits": "0.0000", "calls": 0, "source": "ledger",
      "rate_configured": false }
  ] }
```

Every paid component appears **including the zeros**. Credits are decimal
strings. There is no projection line — the platform does not forecast a bill.

**Two records, never summed.** `spent_credits` / `spent_micro_usd` is what the
agent's model calls COST, metered by the agent's own runtime — the same figure
the budget brake reads. `billed_credits` is what `credit_transactions` holds for
this agent, i.e. what an invoice would show. Each group's `source` says which of
the two it came from. `unpriced_calls` counts metered calls that neither the
vendor nor a rate card priced: they are inside `calls`, add nothing to the
money, and are **not** free.

<Warning>
  🔴 **This route reported ZERO for agents with substantial real spend, and why is
  worth carrying.** Measured: an agent whose own task board summed to 41,125
  micro-USD across 16 tasks returned `spent_credits: "0.0000"` with `calls: 0` on
  every component group; two further agents (44,335 and 21,277 micro-USD) did the
  same. Reproduced afterwards on a fresh agent: board `spent_micro_usd: 666`,
  route `"0.0000"`.

  The route summed `credit_transactions` rows carrying `metadata.agent_id`, and
  **nothing writes one** — the runtime calls the model vendor directly, so an
  agent's inference never touches a naive billing path. `inference` is therefore
  read from the runtime's meter. This was always an independent **reporting**
  defect and never the cause of the budget findings above; the period brake fires
  because it reads that same meter.

  `billed_credits: "0.0000"` beside a non-zero `spent_credits` is the honest state
  of the platform rather than an error: agent model spend is metered and reported,
  and is not yet on an invoice. A deployment with no agents runtime answers
  `metered.available: false` and the ledger's side alone; one that has a runtime
  and cannot reach it answers **503 `agent_runtime_unavailable`** rather than a
  zero, because a zero was the defect.
</Warning>

## Inbound webhooks

These three routes are the **control surface** for an agent's inbound URL, not a
receiver. The door itself is the platform's existing
`POST /webhooks/hooks/:slug`, which is mounted before `express.json()` for a raw
body, verifies `HMAC-SHA256(secret, "<X-Naive-Timestamp>.<raw body>")` on a
five-minute window, and answers `404` for an unknown or inactive endpoint so it
is never an existence oracle.

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/$ID/webhooks \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "name": "github-pr" }'
# → 201 { "id": "…", "agent_id": "…", "subscription_id": "…",
#          "url": "https://api.usenaive.ai/webhooks/hooks/hk_…",
#          "secret": "whsec_…", "created_at": "…" }
```

<Warning>
  🔴 **The secret is in that response and in no other.** `GET` reports
  `secret_set: true`. A secret a list can return is a secret in every log that
  rendered a list — if it is lost, revoke the endpoint and mint a new one.
</Warning>

A verified delivery enqueues a task with `source: "webhook"` and the provider's
body in `payload`, returning as soon as the row is durably written — the agent's
work never runs on the provider's clock.

## Errors

| status | code                        | meaning                                                                   |
| ------ | --------------------------- | ------------------------------------------------------------------------- |
| 400    | `invalid_input`             | A field failed validation; `details.field` names it                       |
| 400    | `invalid_model`             | The model slug is not pinned                                              |
| 402    | `insufficient_credits`      | Account balance, not the agent cap                                        |
| 403    | `forbidden`                 | Account Kit denied; `details.reason` explains                             |
| 404    | `resource_not_found`        | Unknown id — **or another tenant's**                                      |
| 409    | `agent_not_configured`      | The agent exists but its config never reached the runtime                 |
| 409    | `task_not_replyable`        | That task is not parked on a question                                     |
| 409    | `duplicate_request`         | An idempotency-key replay                                                 |
| 429    | `rate_limited`              | Too many agents for this child project (default 25), or a call-rate limit |
| 503    | `agent_runtime_unavailable` | The runtime did not answer. Retryable                                     |

<Note>
  `agent_not_configured` is recoverable: re-push the agent's configuration with a
  `PATCH /v1/agents/:id` and retry the task. It is not retryable on its own.
</Note>

### Where the error surface drifts from this table

Measured against deployed staging. Each of these is a real answer you may receive,
so they are documented rather than left for a caller to discover.

| what you send                              | contract says                   | deployed staging answers                                                                                                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /v1/agents?cursor=<not a timestamp>`  | `400 invalid_input`             | 🔴 `500 internal_error`. `new Date(cursor)` is unvalidated, so an `Invalid Date` reaches Postgres. Same on `GET /:id/deliverables?cursor=…`. A valid ISO cursor works; `cursor=9999` parses as a year and returns `200`                                                  |
| `GET /:id/deliverables/<not a uuid>`       | `404 resource_not_found`        | 🔴 `500 internal_error`. `getDeliverable` lacks the UUID guard that every other id-taking route in this primitive applies, so the string reaches a `uuid` column. `…/deliverables/upload` on `GET` hits the same path                                                    |
| Same `idempotency_key`, **different** body | `409 duplicate_idempotency_key` | 🔴 `202` carrying the FIRST task's id, silently discarding the new `text`. Same key with the same body correctly returns the same id, so the replay path itself works                                                                                                    |
| Anything rate-limited                      | `error.details.retry_after_ms`  | 🔴 `{"error":{"code":"rate_limited","message":"Too many requests","hint":"Wait before retrying","retry_after_seconds":60}}` — `retry_after_seconds` at the top level of `error`, and the only error envelope observed with **no** `request_id`. The limiter itself works |

Everything else in the table above was exercised and answered as documented,
including tenancy (`404`, never `403`, for a foreign id) and the shape of
`invalid_input` (`error.code` / `message` / `request_id` / `details.field`).
