> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Core concepts

> Agent, task, completion window, sandbox, budget, schedule, event log, deliverable — the eight nouns the whole primitive is made of.

## Agent

A named, durable worker owned by one child project. It holds a task board, an
event log and a transcript, and it hibernates between wakes.

```ts theme={"theme":"css-variables"}
const agent = await client.agents.get(id);

agent.status;         // "idle" | "running" | "blocked" | "braked" | "stopped"
agent.blocked_reason; // "needs_input" | "approval" | "budget" | null
agent.attention;      // true when something needs a human
agent.next_wake_at;   // an ISO instant, or null
agent.wakes;          // how many times it has woken
agent.harness_sha256; // the harness that stamped the last deliverable, or null
```

<Warning>
  🔴 **Three of those six are a mirror that nothing writes back to. Read the board
  and the log instead.**

  `status`, `blocked_reason` and `attention` are columns on the agent's Postgres
  row, and no shipped code path updates them. The runtime holds those facts inside
  its own durable object and reports exactly two things back to naïve —
  `agent.budget_reached` and `agent.job_complete` — neither of which lands in that
  row. So **every agent reads `status: "idle"`, `blocked_reason: null`,
  `attention: false`** whatever it is doing, and `list({ status })` filters against
  those constants.

  `next_wake_at` and `wakes` ARE live: `create` and `update` store the wake the
  runtime armed on that call, and a single-agent `GET` re-reads it off the object.
  A `list()` shows the last stored value, so it can lag a fire behind.

  The board and the log are served straight out of the runtime and are live:

  ```ts theme={"theme":"css-variables"}
  await client.agents.tasks(agentId);   // per-task status, turns, wakes — real
  await client.agents.events(agentId);  // the trace — real
  ```

  `harness_sha256` is stamped only when the runtime records a deliverable carrying
  one, so an agent that has run and delivered nothing still reads `null`.
</Warning>

`status` is what it is doing; `attention` is whether it needs you. They are
separate fields because an agent can be `idle` and still be waiting on you. The
five values the column is permitted to hold, subject to the warning above about
which of them you can observe today:

| status    | meaning                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idle`    | Nothing queued, nothing running.                                                                                                                                   |
| `running` | A slice is executing right now.                                                                                                                                    |
| `blocked` | Waiting on a human or an approval. `blocked_reason` says which.                                                                                                    |
| `braked`  | Its **own** budget cap stopped it. Set when the runtime brakes a task, together with `blocked_reason: "budget"` and `attention: true`; cleared by raising the cap. |
| `stopped` | Deleted or terminated.                                                                                                                                             |

## Task — and why there is no separate "job"

Every unit of work is a **task**, whatever door it came through. The board *is*
the queue, so there is one noun and one table.

```ts theme={"theme":"css-variables"}
const task = await client.agents.task(agentId, taskId);

task.source;   // "api" | "schedule" | "webhook" | "agent" | "self"  ← PLATFORM-SET
task.status;   // "queued" | "running" | "waiting" | "done" | "failed" | "cancelled" | "braked"
task.mode;     // "act" (every granted tool) | "ask" (read-only tools only)
task.turns;    // model calls so far
task.wakes;    // how many slices it has spanned
```

<Note>
  **`source` is platform-set and no request body can change it.** A caller-settable
  `source` would make the observability column a lie the first time someone passed
  `"schedule"` from an API call.
</Note>

### Job vs message: one route, two ways to read it

They are the same call. What differs is whether you want a stream back.

```ts theme={"theme":"css-variables"}
// A job: queue it, get the record, walk away.
const task = await client.agents.sendJob(agentId, { text: "Rebuild the index." });
task.status; // "queued" — durably queued, alarm armed before this returned

// A message: queue it and read the tokens as they come.
const stream = await client.agents.sendMessage(agentId, { text: "How did last night go?" });
stream.task_id;          // a real id, synchronously, before the first token
for await (const e of stream) { /* … */ }
await stream.text();     // the concatenated text_delta events — the 80% case
await stream.done();     // resolves to the final task record
```

Over HTTP it is literally one route — `POST /:id/tasks` — and the `Accept`
header decides. `Accept: text/event-stream` streams; anything else returns
`202` and the task record.

<Note>
  **202 means durably queued.** The row is inserted and the alarm armed in one
  transaction before the call returns, so a runtime outage is a `503` you can see
  and never a silent delay.
</Note>

### Parked tasks, and how to un-park them

An agent can stop and ask you something. The task goes to `waiting` with
`blocked_reason: "needs_input"`, and it stays there until you answer.

```ts theme={"theme":"css-variables"}
await client.agents.replyTask(agentId, taskId, "Use the staging database.");
```

Replying to a task that is *not* parked answers `409 task_not_replyable`.

<Note>
  **Proof status.** The park-and-resume round trip — the agent calling
  `message_user`, the task landing at `waiting`, `replyTask` un-parking it and the
  run continuing — is exercised in-process against the real router and the real
  core. It is **not** yet part of what has been run against a deployed runtime, so
  treat it as working-and-unproven-in-the-large rather than as a load-bearing
  production path.
</Note>

### Cancelling is cooperative

```ts theme={"theme":"css-variables"}
const t = await client.agents.cancelTask(agentId, taskId);
t.cancel_requested_at; // set immediately
t.status;              // may still be "running"
```

It **never aborts mid-tool**. A task holding a ten-minute `bash` takes ten
minutes to stop, and bills them. `cancel_requested_at` is what lets you render
"cancelling — waiting on bash (4m12s)" instead of appearing hung.

### Idempotency

```ts theme={"theme":"css-variables"}
await client.agents.sendJob(agentId, {
  text: "Close the books for July",
  idempotency_key: "books-2026-07",
});
```

A **business** key, and permanent. A second send with the same key returns the
same task and does not run again — forever, not for 24 hours. That is a
different thing from the transport-level `Idempotency-Key` header, and both are
real.

## Completion window

One pinned model, three schedules. It selects how a turn is **executed**, never
which model runs.

| window     | tool fan-out | live sub-agents | batch hint | shape             |
| ---------- | -----------: | --------------: | ---------: | ----------------- |
| `asap`     |            4 |               4 |          1 | fastest, dearest  |
| `standard` |            2 |               2 |          4 | the middle        |
| `flex`     |            1 |               0 |          8 | slowest, cheapest |

Fan-out is a **latency** knob and the batch hint a **cost** knob, moved in
opposite directions on purpose. On GLM-5.2 the window also selects the per-token
rate, which is the larger of the two effects: against `asap` at 1.000, `standard`
realizes **0.626** and `flex` **0.500**.

🔴 **That rate is not the bill.** A cheaper window batches harder and fans out
less, so the same work takes more turns — and every turn re-sends the transcript.
`flex` halves the rate and takes **0.70** off the task, not 0.50. Budget from the
measured per-task figure, never from the rate alone; see
[Pricing](/docs/agents/pricing).

Measured over **142 graded trials** on terminal-bench 2 (`long-horizon-8`,
GLM-5.2-FP8, n=2), as ratios rather than dollars: `flex` costs **0.70** per solved
task against `asap`'s 1.00, `standard` **0.94**. Six of eight instances scored
identically under all three windows, and the two that moved
(`compile-compcert`, `configure-git-webserver`) failed their tests rather than
running out of time.

Wall clock moves with the window and is published alongside: `asap` 24.7 min per
trial and 43.8 s per model call, `standard` 50.8 min and 58.2 s/call, `flex`
45.1 min and 79.5 s/call.

The `standard` and `flex` arms ran at **2.5x** and **3x** the agent wall-clock
cap the `asap` arm ran at — deliberately, because a slower window against a fixed
cap fits fewer steps and fails for a reason unrelated to price. That makes the
cost column a fair comparison and the solve column one at unequal time budgets;
only the `asap` row is cap-matched.

<Warning>
  🔴 **Ratios rather than dollars, and the ratios above are the kind that are
  exact.** The rate card books every prompt token at the full input rate, while the
  actual bill charges tokens served from cache at a fraction of it — so the card
  over-states, and how much it over-states depends on which API dialect the harness
  speaks and therefore on whether a cached-token count comes back at all.

  That makes the over-statement a property of the **arm**. The three window figures
  above are one arm compared against itself, so it appears identically on both sides
  of the ratio and cancels exactly: they need no correction and carry no caveat.
  A ratio between two *different* arms is a different matter, and is not published
  until each has been reconciled — measured, two harnesses are 3.4x apart. See
  [Pricing](/docs/agents/pricing).
</Warning>

<Note>
  **A harness comparison against a fixed cap measures the cap too — and it measures
  the instance list before that.** Scored on the seven instances all five harnesses
  ran (n=14 each), raw solves put Vetta's harness first at 12/14 and claude-code
  second at 11/14, but conditional on not hitting the wall-clock cap claude-code is
  **100%** (10/10) and first; 4 of its 14 ran out of clock. The cap is part of the
  mechanism and not all of it: the arms differ by 1.8x in seconds per model call
  (15.7 on hermes to 28.7 on bare `pi`), and hermes is the fastest per step of the
  five while still solving fewer than claude-code. Both readings, the clean uncapped
  3-instance subset that leads the comparison, why the eighth instance is not in the
  denominator, and the reason `cursor` cannot be measured in this cell are on
  [Pricing](/docs/agents/pricing).
</Note>

Set it per agent:

```ts theme={"theme":"css-variables"}
await client.agents.update(agentId, { completion_window: "flex" });
```

<Warning>
  **The window does not change the model, and it does not change the answer.**
  Waves never reorder calls that could observe each other, so the transcript a
  fan-out plan produces is identical, entry for entry, to what sequential
  execution produces. It buys wall-clock, not accuracy — in either direction.

  **It does route, and only on models that declare it.** `standard` and `flex` are
  served on `zai-org/GLM-5.2-FP8` and nowhere else; `asap` is the default and is
  admitted on every model. Every window produces a real token stream, so
  `sendMessage({ window: "flex" })` streams normally.
</Warning>

<Warning>
  **A window a model does not declare is REFUSED, not downgraded.** Asking for
  `standard` or `flex` on any other model fails the task with
  `window_unavailable` (a 400) at the first model call, and **nothing is spent** —
  the gate runs before a provider is chosen.

  That refusal is the feature, and it is worth saying why. Before the gate existed,
  a non-default window on a model that could not serve it was quietly served as
  `asap` and billed: the request was honoured in name, the task row read back the
  window you asked for, and no field anywhere disagreed. A discount nobody bought,
  invisible from every surface. Refusing is the only behaviour that cannot lie
  about what you paid for.

  So: pin the agent to a model that declares the window, or leave the window at
  `asap`. A misspelled window never reaches this gate — it is a typed
  `400 invalid_input` at the edge, naming the three allowed values.
</Warning>

<Warning>
  **Three places take a window. They are not the same knob.**

  * **The agent** — `completion_window` is the one the executor reads. It is what
    moves the fan-out, the sub-agent width and the batch hint, because a run
    declares one strategy in its manifest before turn 1. It is also the default
    its tasks inherit.
  * **A task** — `window` on `sendJob`/`sendMessage` takes all three values and
    selects the tier the call is *priced* at. It does not change the run's
    schedule. **Omitting it inherits the agent's `completion_window`** — it does
    not fall back to `"asap"`. The edge forwards an absent window as `undefined`
    and the runtime resolves it, so exactly one component holds that default. An
    earlier release did read an omitted window as `"asap"`; if you are working
    from notes written against that behaviour, it changed.
  * **A schedule entry** — `window` is validated at the API, validated again when
    the config reaches the runtime, and then 🔴 **dropped**: the runtime's schedule
    table has no window column and every schedule-fired task is created `"asap"`.
    That literal overrides the schedule's own window *and* the agent's
    `completion_window`, so a `flex` agent's own cron work meters at the dearest
    tier. The error direction is over-charge, and no client-side setting avoids it
    today — send the work through `sendJob` if the window has to be honoured.
</Warning>

See [Pricing](/docs/agents/pricing) for what this means on a bill.

## Budget

Required at create. An agent with no cap is not creatable, because a null cap
means no cap *and* no per-agent spend record at all.

```ts theme={"theme":"css-variables"}
budget: {
  cap_micro_usd: 50_000_000,     // $50.00 — integer micro-USD
  period: "month",               // "total" | "day" | "week" | "month" | "year"
  max_task_micro_usd: 5_000_000, // $5.00
  alert_at: 0.8,                 // optional — stored, and nothing fires off it
  hard: true,                    // optional, default true — not read at the gate
}
```

**Micro-USD, not cents.** A turn's reserve is routinely sub-cent, and rounding
at this boundary would make the API's cap and the runtime's cap two different
numbers.

`period: "total"` is the long-horizon statement — "spend \$50 on this job, ever" —
and it is the one period a project-level cap has no way to express.

<Warning>
  🔴 **`alert_at` and `hard` are accepted, stored, echoed — and change nothing.**

  `alert_at` is validated as a 0–1 fraction and reaches the runtime's config, and
  no code compares spend against it. There is no `budget.alert` emitter, and the
  platform's webhook catalogue deliberately advertises no budget-warning event for
  that reason. Use the `budget` event on the stream instead: it carries spend
  against both ceilings on **every** turn, before the call, which is more than a
  threshold notification would give you.

  `hard: false` does **not** park the task for an approval. Both the period cap and
  the per-task ceiling refuse unconditionally; the flag is not read at the gate.
  Read it the other way round and you will not be surprised: **every cap behaves as
  a hard one**, `hard: true` included, and the guarantee it gives you is the one in
  the table below.
</Warning>

### How the cap actually binds

Before each model call the runtime prices a **reserve** for that call — the whole
prompt at the full input rate plus the entire output ceiling, as though every
token allowed is used — and checks `spent + reserve > cap`. If it would cross,
the task stops at `braked` with `blocked_reason: "budget"` and **the call is not
made**. It does not half-run a turn it cannot pay for.

The reserve stays a worst case, but the runtime does not insist on asking for the
largest possible turn. When the full output ceiling would not fit the money that
remains, it **solves for the largest output ceiling that does fit** and sends the
call with that ceiling — so the reserve still bounds the call, and a budget that
could afford a shorter answer is not refused for the price of a longer one it was
never going to get. Every `budget` event carries the ceiling the turn actually
asked for in `maxOutputTokens`; below the maximum means the turn was sized by
your budget. A turn is never whittled below a quarter of the ceiling: when what
remains cannot buy a whole answer, the task stops instead of paying for a
fragment.

The reserve has two possible sources, and the `budget` event names which one
decided each turn in `reserveSource`:

| `reserveSource` | Where the price came from                                                                                     | What the cap guarantees on that turn                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `observed`      | This agent's own metered calls on this model.                                                                 | The call is refused **before** the money moves.                                            |
| `card`          | The transport's published price for (model, window) — the only source available on an agent's **first** call. | The call is refused **before** the money moves.                                            |
| `none`          | Neither exists: the transport publishes no price this agent has not already measured.                         | Nothing can be priced in advance, so **one** call is admitted and the task stops after it. |

When both exist, the transport's published price is a **ceiling on the reserve**,
never a replacement for it. `observed` is an extrapolation from this agent's
recent calls; `card` is a bound the transport can prove — the whole prompt at the
dearest tier, plus an output ceiling it enforces itself. An extrapolation that
claims more than that bound is claiming something the call cannot do, so it is
capped, and the `budget` event says so in `reserveClampedByCard`. When that reads
`true`, the number that decided the turn was the card's, and this agent's own
rate estimate is the thing to look at.

<Warning>
  🔴 **`reserveSource: "none"` is the one case where a cap cannot stop a call
  before it happens, and it is published for exactly that reason.** No price
  exists for a call nobody has made on a transport that quotes nothing, and
  refusing on that basis would make every fresh agent on such a transport
  unusable. The overshoot is bounded at **one model call**: the same two ceilings
  are re-decided against the real invoice as soon as it exists, and the task then
  parks (`braked`) or ends (`failed`). Agents on the completion-window model are
  priced from a published card and never take this path.
</Warning>

<Note>
  **`braked` is terminal, and it ends the task properly.** `ended_at` is set,
  `error` names the cap and the reserve, and the log closes with `error` then
  `task_finished { status: "braked" }`, so a `watch()` stream stops rather than
  waiting on a frame that never comes. The AGENT is marked too — `status:
    "braked"`, `blocked_reason: "budget"`, `attention: true` — which is what makes a
  stopped agent findable in `agents.list()` and countable in `agents.status()`.

  Raising the cap clears those three flags on the agent; it does not revive the
  braked task, so re-send the work:

  ```ts theme={"theme":"css-variables"}
  await client.agents.update(agentId, {
    budget: { cap_micro_usd: 100_000_000, period: "month", max_task_micro_usd: 5_000_000 },
  });
  await client.agents.sendJob(agentId, { text: "…the work that braked…" });
  ```
</Note>

`budget` on update is a **full replacement**, not a merge — a partial budget
where `period` moved and `cap_micro_usd` did not is a cap nobody meant to set.

### How the per-task ceiling binds

`max_task_micro_usd` is checked at the same moment and against the same reserve,
but over **that task's own** spend — its root run plus every sub-agent it
delegated to, so a task cannot delegate its way around its ceiling.

The two ceilings mark a task differently, and the difference is deliberate. Both
**end** the task — a period cap at `status: "braked"`, a per-task ceiling at
`status: "failed"`, each non-retryable and each naming the spend, the reserve
and the number it crossed in `error`. What differs is *what the operator has to
fix*: `braked` says the AGENT is out of money and flags it for a human;
`failed` says this one task overran its own allowance while the agent is fine.
When one call would cross both, the cap wins, because the agent-wide condition
is the one that governs everything else it owns.

<Warning>
  🔴 **Measured on deployed staging, the per-task ceiling did not fire at all.** An
  agent with `max_task_micro_usd: 1` and a period cap large enough not to interfere
  ran three consecutive tasks to `status: "done"`, spending 17,954 / 10,359 /
  12,054 micro-USD — up to 18,000x the ceiling — with `error: null` and
  `blocked_reason: null` on each. Reproduced on a second agent (21,464 and 22,871
  micro-USD). The paragraph above is the shipped intent; it is not what that host
  does. The period cap **does** brake, so the two ceilings read different sources.
  Bound a deployment on `cap_micro_usd` and the account balance, and verify the
  per-task ceiling yourself before relying on it.
</Warning>

Both numbers are on the event stream every turn: `budget` carries
`spentMicroUsd`/`capMicroUsd` and `taskMicroUsd`/`maxTaskMicroUsd`.

### Reading spend

```ts theme={"theme":"css-variables"}
const s = await client.agents.spend(agentId);                 // by component
const t = await client.agents.spend(agentId, { by: "task" }); // by task
```

Every paid component prints, **including the zeros** — `inference`, `sandbox`,
`web_search`, `browser`, `storage`, `wakes`.

Money is decimal **strings**. Nothing in the client does arithmetic on it.

Two totals, and they are **not** the same number:

| field                              | what it is                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `spent_credits`, `spent_micro_usd` | what the agent's model calls **cost**, metered by the agent's own runtime    |
| `billed_credits`                   | what the **credit ledger** holds for this agent — what an invoice would show |

Every group carries `source: "meter"` or `source: "ledger"`, saying which record
it came from. **Never add the two totals**: they are two records of one agent's
money, not two pots of it.

<Note>
  `task.spent_micro_usd` is the runtime's own synchronous counter, which the
  pre-call gate needs — and `spend()` reads that same meter, so the two now agree
  instead of describing different worlds.

  `wakes` always reports `rate_configured: false` today: the axis exists and has no
  meter. It prints as a zero with the reason rather than being omitted.
</Note>

<Warning>
  🔴 **`spend()` used to answer zero for agents with real spend, and why it did is
  worth knowing.** One agent whose own task board summed to 41,125 micro-USD
  across 16 tasks reported `spent_credits: "0.0000"` with `calls: 0` on every
  component; two others (44,335 and 21,277 micro-USD) did the same. The route read
  the credit ledger and **nothing else** — and an agent's model calls never write
  a ledger row, because its runtime calls the model vendor directly. So
  `inference` is now read from the runtime's meter, which is why `billed_credits`
  can be `0.0000` while `spent_credits` is not: that money is metered and
  reported, and is not yet on an invoice.

  A deployment with no agents runtime reports `metered.available: false` and the
  ledger's side alone. One that HAS a runtime and cannot reach it **fails** —
  `agent_runtime_unavailable` — rather than answering zero, because a zero was
  exactly the lie this fixed.
</Warning>

## Schedule

A cron expression, a timezone, and the work to send when it fires.

```ts theme={"theme":"css-variables"}
schedule: [
  { cron: "0 6 * * *", tz: "America/Los_Angeles", text: "Triage last night's errors." },
  { cron: "0 17 * * 5", tz: "UTC", text: "Write the weekly summary." },
]
```

* **Five fields** — `min hour dom mon dow`. Seconds are not a field, and a
  6-field expression is refused.
* `text` is **required**. A schedule with no work is a bug that fires forever.
* `enabled` defaults to `true`.
* `window` is accepted and **dropped** — every schedule-fired task runs `asap`.
* A fire that lands while the agent is busy is **collapsed**, and the collapsed
  count is written into the task's own text ("This schedule fired N times while
  you were unavailable… You are late."). The `missed_fires` field on a task is
  hard-coded to `0`: collapses are counted against the schedule, not the task.

See the [scheduled agent guide](/docs/agents/scheduled).

## Tools

Which naïve primitives the agent may reach. Every flag **narrows** and none
widens.

```ts theme={"theme":"css-variables"}
tools: {
  web_search: true,
  browser: false,
  sandbox: "auto",   // "none" | "auto" — and nothing else
  storage: true,
  delegation: false,
  connections: false,
}
```

Reads come back as a `requested` / `effective` pair:

```ts theme={"theme":"css-variables"}
agent.tools.web_search; // { requested: true, effective: false }
```

<Note>
  **A flag cannot widen the Account Kit.** `web_search: true` resolves to naïve's
  `search` primitive under the same child project's kit, so a kit with `search`
  turned off removes the tool whatever the flag says. Read `effective`, never
  `requested`, when a run does not use a tool you granted.
</Note>

<Warning>
  🔴 **`web_search`, `browser` and `connections` are NOT available on this
  deployment**, and they now say so: they read back `effective: false` with
  `unavailable_reason: "no_substrate"`, and the agent is not offered
  `web_search`, `web_read`, `browser`, `connection_search` or `connection_call` at
  all.

  No binding implements them. The agent runtime routes exactly those five names to
  its tool host, and the host returns an error for every one — measured on
  production, where an agent was offered `web_search`, called it six times, and got
  a refusal sentence back each time. An advertised capability is worse than a
  missing one, because the model plans around the advertisement: the default
  outcome of a research tool that cannot research is a confident, cited-looking
  answer with nothing behind it.

  `sandbox` and `storage` are reported the same way when the deployment cannot
  serve them — `unavailable_reason` is `not_configured`, `credential_rejected`,
  `credential_foreign` or `no_substrate`. `GET /v1/agents/status` answers the same
  question **before** you create an agent, with a sentence and a hint per toggle.
</Warning>

### Delegation

`delegate_models` is the only switch. An empty array — the default — means
delegation is **off** and the `delegate` tool is absent from the schema list
entirely.

```ts theme={"theme":"css-variables"}
delegate_models: ["anthropic/claude-haiku-4-5"],  // a cheap child under an expensive parent
```

Sub-agents buy **context isolation**, not wall-clock: on this core the board
takes one run per turn, so two live children run one after the other in the same
slice.

## Sandbox

An agent with `sandbox` set gets a Linux micro-VM it can write files in, run
commands in and test against.

* `"none"` — no sandbox. The default.
* `"auto"` — the agent gets one provisioned on demand.
  🔴 There is **no third form**. `"<workspace id>"` was documented and accepted,
  and it reached nothing: the id is not part of the config the runtime receives,
  so a pinned agent still got a fresh box every task. It is refused at create and
  at update rather than stored and echoed.

See the [sandbox agent guide](/docs/agents/sandbox).

## Limits — the bounded wake

Eleven numbers, and they are **materialised onto the agent at create**. `get()`
shows the values it will actually run with, never a pointer to a default that
could move under it between two wakes six weeks apart.

```ts theme={"theme":"css-variables"}
limits: {
  sliceWallMs: 600_000,        // wall budget for ONE wake. 30_000–840_000
  turnWallMs: 300_000,
  maxTurnsPerSlice: 40,
  maxToolCallsPerTurn: 8,      // 1–32
  toolTimeoutMs: 120_000,
  maxTurnsPerTask: 200,
  taskWallMs: 3_600_000,
  maxSubrequestsPerSlice: 900,
  maxDepth: 1,
  deferredMaxMs: 3_600_000,
  maxPollAttempts: 30,
}
```

<Warning>
  🔴 **`sliceWallMs` bounds a WAKE, never a task.** 840,000 ms is 14 minutes — a
  hard guard under the platform's 15-minute alarm ceiling. A slice budget above it
  is not a longer run, it is a killed one. A task that needs six hours spans as
  many slices as it needs.

  Two cross-checks are enforced: `turnWallMs` may not exceed `sliceWallMs` (a turn
  that cannot finish inside its slice can never finish at all), and `toolTimeoutMs`
  may not exceed half of `sliceWallMs` (a timeout longer than half a wake cannot be
  enforced).
</Warning>

An **unknown key is an error, never an ignore**. A typo'd `slice_wall_ms` that
was silently dropped is an agent running on defaults while you believe otherwise.

On `update`, `limits` and `tools` **merge field by field**; everything else
replaces.

## Event log

One append-only log per agent. It is written whether or not anyone is watching.

| kind                                     | what it carries                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `declared`                               | The run manifest — harness build, transport, strategy, limits, grants, tool-schema digest |
| `task_started` / `task_finished`         | Task boundaries                                                                           |
| `turn_started`                           | One model call beginning                                                                  |
| `text_delta`                             | Streamed output text                                                                      |
| `tools_offered`                          | Which tools were on the table for this turn                                               |
| `tool_call` / `tool_result`              | A tool invocation and its digest                                                          |
| `usage`                                  | Token counts, all five cache tiers, in one frame                                          |
| `budget`                                 | Spend against cap at a pre-call gate                                                      |
| `subagent_started` / `subagent_finished` | Delegation                                                                                |
| `delivered`                              | A deliverable was written                                                                 |
| `error`                                  | A failure                                                                                 |

<Note>
  **That list is what the SDK's `AgentEventKind` union names, and the log is
  wider.** Nothing filters the read path, so a stream can also carry
  `batch_planned`, `parallel_dispatch`, `speculation` and `cost_disagreement`.
  Treat `kind` as open and keep a default branch.
</Note>

Read it as a page, or attach to it live — one route, two representations:

```ts theme={"theme":"css-variables"}
// A keyset page
const page = await client.agents.events(agentId, { after: 120, limit: 100 });
page.items; page.next_cursor; page.earliest_seq; page.truncated;

// The same log, live
const stream = await client.agents.watch(agentId, { after: 120 });
```

<Warning>
  **`after` is a POSITION, never a time.** Replay is strictly greater than the
  value you pass, so a resume loses nothing and duplicates nothing.

  Retention is **20,000 rows, no TTL**. If your offset has aged out you get
  `truncated: true` and `earliest_seq`, and the replay starts there.
</Warning>

Watching does not pin the agent awake, so tailing a run does not change what it
costs.

## Deliverable

The output of work, with a manifest.

```ts theme={"theme":"css-variables"}
const { items } = await client.agents.deliverables(agentId);
const { deliverable, content, download_url } = await client.agents.deliverable(agentId, items[0]!.id);
```

* `kind` — `report` | `doc` | `code` | `dataset` | `image` | `video` | `pr` | `deploy` | `other`
* Up to **20 per task**, **25 MB each**.
* `download_url` is minted fresh on every read, expires in an hour, and is
  **unauthenticated once issued** — never cache it, call again instead.
* `download_url` is `null` when the deployment has no storage sink configured,
  and then `content` carries the whole artifact. That is a deployment state, not
  an error.

<Note>
  🔴 **A `final` deliverable must carry an artifact or say why it does not.** The
  server refuses `final: true` with no `text`, no `storage_key` and no
  `no_artifact_reason`. Without that refusal, "deliver" degrades into a status
  update.
</Note>

<Note>
  **Proof status.** The full fetch-back loop — the agent's own `deliver` writing an
  artifact, and `deliverables()`/`deliverable()` reading it back with a fresh
  `download_url` — is exercised in-process against the real router and the real
  core. It is **not** yet part of what has been run against a deployed runtime.
  The manifest write and read routes themselves are; the artifact round trip
  through a storage sink is the part that has not been.
</Note>

## Errors

Every refusal arrives as naïve's envelope with a stable `code`.

| code                        | meaning                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `invalid_input`             | A field failed validation. `details.field` names it.                                |
| `invalid_model`             | The model slug is not pinned.                                                       |
| `agent_not_configured`      | The agent exists but its config never reached the runtime. Re-push with `update()`. |
| `task_not_replyable`        | That task is not parked on a question.                                              |
| `budget_exhausted`          | The cap would be crossed.                                                           |
| `insufficient_credits`      | The account balance, not the agent cap.                                             |
| `duplicate_request`         | An idempotency key replay.                                                          |
| `resource_not_found`        | Unknown id — **or another tenant's**. Never `403`.                                  |
| `rate_limited`              | Too many agents for this child project, or a call-rate limit.                       |
| `agent_runtime_unavailable` | The runtime did not answer. Retryable.                                              |
| `forbidden`                 | The Account Kit denied the primitive. `details.reason` explains.                    |

<Note>
  `window_unavailable` **is** sent: `standard` or `flex` on any model other than
  `zai-org/GLM-5.2-FP8` is refused with it rather than downgraded, at the first
  model call rather than at `create`. Handle it if you set a non-default window.
  `window_cannot_stream` appears in the published type and is never sent — every
  window streams.
</Note>
