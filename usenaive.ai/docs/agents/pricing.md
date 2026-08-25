> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agents pricing

> What an agent costs — idle, awake, and per completion window. The one knob that trades latency for money, and what it actually moves.

Agents bill from the same credit balance as every other primitive. One credit is
**\$0.05 USD**. There is no subscription and no per-agent fee.

## What you pay for

<CardGroup cols={2}>
  <Card title="Idle: storage only" icon="moon">
    An agent with no alarm armed costs storage and nothing else. You can leave a
    hundred of them defined and pay for none of them — and `next_wake_at: null` on a
    `GET` of that agent is the field that says so, read from the runtime's own
    alarm.
  </Card>

  <Card title="Awake: what it uses" icon="sun">
    Model tokens, plus any paid tool the turn called. Nothing is reserved in
    advance and nothing is charged for a wake that did no work.
  </Card>
</CardGroup>

The six components that appear on every spend view:

| component    | what it is                                               |
| ------------ | -------------------------------------------------------- |
| `inference`  | Model tokens — the dominant line for almost every agent  |
| `sandbox`    | Micro-VM CPU / memory / disk actually used               |
| `web_search` | Search and URL reads                                     |
| `browser`    | Browser sessions                                         |
| `storage`    | Deliverable bytes stored                                 |
| `wakes`      | Per-wake overhead — **currently unmetered and always 0** |

```bash theme={"theme":"css-variables"}
naive agents spend <agent-id>
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
  billed              0.0000 cr  (credit ledger)
```

Every component prints, **including the zeros**, so a paid tool is never missing
from this view. `wakes` prints `rate not configured` rather than being omitted.

<Warning>
  🔴 **This view used to read `0.0000` for agents with real spend, and the reason
  is the shape of the whole surface.** Measured on staging: an agent whose own task
  board summed to **41,125 micro-USD** across 16 tasks reported
  `spent_credits: "0.0000"` with `calls: 0` on every component group. Two more
  agents (44,335 and 21,277 micro-USD) reported the same.

  The route read the **credit ledger** and nothing else — and an agent's model
  calls never write a ledger row, because the runtime calls the model vendor
  directly rather than through a naive billing path. So `inference` is read from
  the runtime's own meter, and the response carries both records side by side:

  | field                               | record        | meaning                    |
  | ----------------------------------- | ------------- | -------------------------- |
  | `spent_credits` / `spent_micro_usd` | meter         | what the model calls cost  |
  | `billed_credits`                    | credit ledger | what an invoice would show |

  `billed_credits` being `0.0000` next to a non-zero `spent_credits` is not a bug:
  model spend is **metered but not yet invoiced**. Each group says which `source`
  it came from. Never add the two totals — they are two records of one sum.

  If your deployment has no agents runtime, `metered.available` is `false` and only
  the ledger side is reported. If it has one and cannot reach it, this call
  **fails** with `agent_runtime_unavailable` rather than answering zero.
</Warning>

## The completion window

One knob. It never changes your model. `asap` is the default.

<Warning>
  🔴 **It is served on exactly one model.** `standard` and `flex` are available on
  `zai-org/GLM-5.2-FP8`. Every other model runs `asap` and nothing else, and asking
  for another window on one is **refused** — `window_unavailable`, raised at the
  first model call, never quietly downgraded, and raised before a provider is
  chosen so a refused turn spends nothing. A window accepted and served as `asap`
  would report a discount nobody bought, with no column downstream disagreeing.
</Warning>

Two different things move together, and it is worth keeping them apart:

| window     | tool calls in flight | sub-agents |                   batch hint | input rate vs `asap` |
| ---------- | -------------------: | ---------: | ---------------------------: | -------------------: |
| `asap`     |                    4 |          4 | 1 — speculative work allowed |                1.000 |
| `standard` |                    2 |          2 |          \~4 calls at a time |                0.625 |
| `flex`     |                    1 |          0 |          \~8 calls at a time |                0.500 |

The first three columns are our executor's schedule; the last is our rate card
for this model, and it is the larger of the two effects.

### What was measured

terminal-bench 2, `long-horizon-8`, GLM-5.2-FP8, n=2, **142 graded trials** across
five harnesses and three windows. Everything below is a ratio; the reason is two
warnings down.

The price tariff reproduced on real agent traffic, on the card's own input ratio:

| ratio               | card list | realized |
| ------------------- | --------: | -------: |
| `standard` / `asap` |     0.625 |    0.626 |
| `flex` / `asap`     |     0.500 |    0.500 |

The realized figure lands on the *input* ratio rather than between input and
output because this workload is 97.6–98.3% prompt tokens.

And cost per **solved** task falls from `asap` to `flex`, but by less:

| window     | solved | cost per solved task (`asap` = 1.00) | min / trial | s / model call |
| ---------- | -----: | -----------------------------------: | ----------: | -------------: |
| `asap`     |  12/16 |                                 1.00 |        24.7 |           43.8 |
| `standard` |  13/16 |                                 0.94 |        50.8 |           58.2 |
| `flex`     |  10/16 |                             **0.70** |        45.1 |           79.5 |

<Warning>
  **Read those two tables together, or you will over-estimate the saving. This is
  the most misread thing about the completion window.**

  The first table is a **rate**, per token. The second is a **bill**, per unit of
  work finished. They are not the same number and they do not have to move
  together: `flex` cuts the rate by half (0.500) and returns 30% off the task
  (0.70). Roughly two-fifths of the discount is spent getting the work done.

  The reason is mechanical. A cheaper window fans out less and batches harder, so
  the same task takes more turns — and **every turn re-sends the whole transcript
  so far**, at the new rate. Fewer, wider turns at a dearer rate can beat more,
  narrower turns at a cheaper one. Nothing guarantees the cheaper window wins on a
  given workload; on this grid it did, by less than its rate card suggests.

  So do not budget a `flex` agent at half an `asap` agent. Price the rate from the
  first table, then measure your own workload against the second.
</Warning>

Six of the eight benchmark instances scored identically under all three windows.
Two moved: `compile-compcert` (2/2 under `asap` and `standard`, 0/2 under `flex`)
and `configure-git-webserver` (1/2, 2/2, 1/2). Neither ran out of time — both
failed their tests — so on this grid the cheaper window is not buying its discount
by truncating the agent.

### The harness comparison, and the one number that reorders it

Five harnesses, all on `zai-org/GLM-5.2-FP8`, all on `asap`, all at the same
wall-clock cap. **Lead with the clean subset** — the three instances
(`configure-git-webserver`, `fix-ocaml-gc`, `sqlite-with-gcov`) on which the cap
never bound for any arm, n=6 per arm, **zero timeouts in all 30 trials**. It is the
only capability-and-efficiency comparison in the run that is not partly a reading
of our own timeout:

| arm         | solved / 6 | tokens per solved (Vetta = 1.00) | min working / trial | min / trial | s / model call |
| ----------- | ---------: | -------------------------------: | ------------------: | ----------: | -------------: |
| Vetta on pi |          5 |                         **1.00** |                 5.2 |         9.2 |           12.0 |
| claude-code |          6 |                             1.39 |                 6.5 |         9.5 |           17.4 |
| codex       |          4 |                             2.06 |                 8.5 |        12.1 |           16.6 |
| hermes      |          4 |                             2.51 |                 7.0 |        23.4 |           14.0 |
| pi          |          4 |                             3.59 |                10.9 |        14.3 |           14.1 |

Then the wider board — **the seven instances every arm ran**, two attempts each,
n=14 per arm. The grid registers eight; `hermes` has no trial for `train-fasttext`
on any run, and that instance was solved by none of the four arms that did attempt
it, so scoring hermes out of its seven beside four arms scored out of eight credits
it with skipping the hardest task. Here the raw solve column and the conditional
one disagree, so both are printed:

| arm         |  n | raw solved | hit the cap | solved, of trials that did not | tokens per solved | min working / trial | s / model call |
| ----------- | -: | ---------: | ----------: | -----------------------------: | ----------------: | ------------------: | -------------: |
| Vetta on pi | 14 |   12 = 86% |           1 |                    12/13 = 92% |          **1.00** |                10.9 |           17.1 |
| claude-code | 14 |   11 = 79% |           4 |               10/10 = **100%** |              2.58 |                14.3 |           23.4 |
| hermes      | 14 |   10 = 71% |           2 |                    10/12 = 83% |              2.99 |                12.7 |           15.7 |
| codex       | 14 |    9 = 64% |           3 |                     9/11 = 82% |              2.21 |                14.7 |           23.4 |
| pi          | 14 |    9 = 64% |           5 |                      7/9 = 78% |              1.86 |                17.7 |           28.7 |

<Warning>
  🔴 **This table used to be printed on each arm's own denominator, and the
  denominator was worth a place in the ranking.** Scored as they ran — hermes out of
  14, everyone else out of 16 — hermes read 71% against claude-code's 69% and came
  second. On the seven instances all five actually ran, claude-code is second at 79%
  and hermes third at 71%. Any harness table built from this data has to intersect
  the instance lists before it ranks anything.
</Warning>

<Warning>
  🔴 **The raw ranking is partly a wall-clock artifact, and a table that prints it
  alone is making a claim this data does not support.** Conditional on not hitting
  the cap the ordering changes at the top: claude-code solved **every** trial it was
  given time to finish, and 4 of its 14 ran out of clock. Read both columns, or
  scale the cap per arm.

  It is not the whole mechanism, and the same table refutes the stronger version of
  it that used to stand here. The arms differ by 1.8x in seconds per model call
  (15.7 on hermes, 28.7 on bare `pi`), and hermes — the **fastest** per step of the
  five — still solves fewer than claude-code, which is slower per step. Step rate
  buys attempts; it does not buy answers.
</Warning>

<Note>
  **`min working / trial` is agent execution, not trial wall clock**, and the two
  columns in the clean-subset table above are there to show the gap. hermes spends
  **13.4 minutes per trial installing itself** — it builds from source on every
  trial, which is also why it fragments into seven harness identities across its 14
  rows (defect #59) — so its wall clock is mostly our pinning choice rather than its
  latency. Agent execution is the harness doing the work, and it is the numerator of
  the seconds-per-model-call column beside it.
</Note>

<Note>
  **Both tables rank on TOKENS, not on dollars, and the reason is that the dollars
  are not yet comparable across arms.** Tokens per solved task is that arm's total
  recorded tokens divided by the tasks it solved. It is a count, so it is the same
  number whichever rate card you hold it against, and it needs no correction — see
  the ratios-never-dollars note below for what would have to be measured before a
  cross-arm dollar column could be printed here.

  **`cursor` was evaluated and cannot enter this comparison.** Its CLI talks only to
  its own vendor's infrastructure and cannot be pointed at an arbitrary model
  endpoint, so there is no configuration in which it runs the pinned model the other
  five hold fixed. A cursor arm would vary the model *and* the harness at once, so
  it is excluded rather than reported.
</Note>

<Warning>
  **The three rows are not cap-matched, and the solve column should not be read as
  if they were.** A slower window answers each call more slowly, so against a fixed
  wall-clock cap it fits fewer steps and fails for a reason that has nothing to do
  with price — an earlier paired run had `standard` hit the cap at 15.0 min on
  `build-cython-ext` while `asap` solved it in 10.7. To remove that artifact the
  sweep scaled the agent timeout with the window: `asap` 1x, `standard` **2.5x**,
  `flex` **3x**. That makes the COST column a fair comparison and the SOLVE column a
  comparison at unequal time budgets. Flat accuracy at three times the wall clock is
  a weaker claim than flat accuracy, and this page makes only the weaker one. The
  cost ratios are unaffected — they are per token, and the token counts are
  identical across windows for the same request.

  🔴 **Your agent does not get that scaling. You have to ask for it.** The timeout
  multiplier above belongs to the benchmark harness. In the product, `limits`
  defaults are one set of numbers for all three windows — `taskWallMs` 3,600,000 ms
  and `turnWallMs` 300,000 ms whatever the window — so moving an agent from `asap`
  to `flex` gives it the \~2.5–3x slower per-call latency measured above against an
  **unchanged** cap. That is exactly the truncation artifact the sweep removed, and
  it lands on you instead. Raise `limits.taskWallMs` when you lower the window, or
  the cheaper tier will show up as tasks that ran out of clock.
</Warning>

<Warning>
  🔴 **No cross-arm dollar figure on this page, and the reason is that the card's
  over-statement is a property of the ARM.**

  The rate card books every prompt token at the full input rate. The actual bill
  charges tokens served from cache at a fraction of it, so the card over-states.
  How *much* it over-states depends on which API dialect the harness speaks, and
  therefore on whether a cached-token count comes back at all: a harness whose
  responses carry no cache fields books 100% of its input at full rate no matter
  how much of it was cached, while one that reads its usage from an endpoint
  reporting the cache correctly books very nearly the right number.

  Measured per arm, those two cases are **3.4x apart** on the same model and the
  same benchmark — a factor of **3.4521** on one harness against **1.0172** on
  another. A single blended figure applied to all of them is wrong for each of
  them, so this page publishes none.

  Two consequences worth stating plainly:

  * **Within one arm, across windows, the ratios are exact.** The over-statement
    appears identically in the numerator and the denominator of a same-arm ratio
    and cancels. Every "this arm costs X% less at `flex` than at `asap`" figure
    above needs no correction and carries no caveat.
  * **Across arms, dollars wait on measurement.** Two of the five harnesses have a
    reconciled vendor reading today. The rest do not, and until they do the
    cross-arm columns rank on tokens per solved task, on solve rate and on wall
    clock — none of which depend on a price.
</Warning>

<Note>
  **Latency between windows is now measured, and it is real.** The `asap` arm ran
  24.7 minutes per trial and 43.8 seconds per model call; `standard` 50.8 min and
  58.2 s/call; `flex` 45.1 min and 79.5 s/call. Fanning tool calls out is also a
  wall-clock mechanism, and `asap` fans out furthest. Pick the window on price and
  on how eager you want the agent to be — and if you are running against a fixed
  deadline, budget the extra seconds per call rather than assuming the cheaper
  window finishes in the same clock.
</Note>

### Why batching is where the rest of the money is

An agent turn is one model call plus the tool calls it came back with. **Every
model call re-sends the whole transcript so far.** If a run produces `C` total
tool output across `N` turns, the transcript at turn `i` is roughly `C·i/N`, so
the tokens the run reads back over its life are:

```
Σ(i=1..N) C·i/N  =  C·(N+1)/2
```

That is **linear in the turn count** for a fixed amount of actual work. Halving
the number of turns roughly halves the bill, and asking the model to do more per
turn is exactly what the batch hint does. The batching effect applies on every
model; the tariff above applies only on GLM-5.2.

It also cuts the other way, which is why the rate and the bill diverge above: a
window that batches harder takes more turns to finish, and each of those turns
re-sends the transcript. The batch hint and the turn count pull against each
other, and the measured 0.70 is where they settled on this grid.

<Note>
  **This survives prompt caching.** Caching cuts the *price* of each re-read token.
  It does not cut the *number* of re-reads. Batching does.
</Note>

### What fan-out does and does not change

Fan-out never reorders tool calls that could observe each other. Every wave runs,
settles, and the next wave starts — so the transcript a fan-out plan produces is
identical, entry for entry, to what strictly sequential execution produces. By
construction, running calls in parallel cannot change an answer.

<Note>
  **That is a claim about the executor, not a reading of the arms.** What the
  benchmark says about accuracy is the flat result above — six of eight instances
  identical across all three windows. It does not say that parallelism makes an
  agent smarter, and neither do we.
</Note>

### Picking one

<AccordionGroup>
  <Accordion title="GLM-5.2 and nobody waiting → flex">
    The cheapest window per solved task on the measured run (0.70 against `asap`'s
    1.00 — a 30% saving, not the 50% its rate card alone would suggest) with no
    accuracy cost that showed up at n=2. It is also the slowest per model call
    (79.5 s against `asap`'s 43.8 s), so reach for it on scheduled and batch work,
    and raise `limits.taskWallMs` when you do — the wall-clock cap does not scale
    itself with the window.

    ```ts theme={"theme":"css-variables"}
    await client.agents.update(agent.id, { completion_window: "flex" });
    ```
  </Accordion>

  <Accordion title="GLM-5.2 and you want the middle → standard">
    Fewer, larger turns than `asap` without going all the way to strictly
    sequential, at 0.625 of `asap`'s input rate. It also scored the most solves of
    any window on the measured run (13/16).

    ```ts theme={"theme":"css-variables"}
    await client.agents.update(agent.id, { completion_window: "standard" });
    ```
  </Accordion>

  <Accordion title="Any other model, or a human is waiting → asap (the default)">
    `asap` is the only window served on models other than `zai-org/GLM-5.2-FP8`, so
    on anything else this is not a choice. It also fans tool calls out widest and
    allows speculative work, which is the configuration to hold when someone is
    watching the stream.

    ```ts theme={"theme":"css-variables"}
    await client.agents.update(agent.id, { completion_window: "asap" });
    ```
  </Accordion>
</AccordionGroup>

<Warning>
  🔴 **Set it on the AGENT. That is the only place all of it lands.**

  * **Agent** — `completion_window` is what `resolveStrategy` reads, so it is the
    only setting that moves the fan-out, the sub-agent width and the batch hint.
  * **Task** — `window` on `sendJob`/`sendMessage` is honoured on all three values,
    but only at the *transport*: it selects the tier the call is priced at. It does
    not change the run's schedule, because the manifest declares one strategy per
    run before turn 1. **Omitting it inherits the agent's `completion_window`** —
    it does not fall back to `asap`.
  * **Schedule entry** — `window` is accepted by the API, stored, and echoed back
    on `GET`, and then 🔴 **dropped**. Every schedule-fired task is created `asap`
    whatever the entry says — and that literal beats the agent's
    `completion_window` too, so even a `flex` agent's cron work meters at the
    dearest tier. The error direction is over-charge. Do not plan a cheap 3am run
    this way; there is no setting that fixes it today, so send the work through
    `sendJob` if the window has to be honoured.
</Warning>

## Keeping the bill bounded

Three controls, in the order they bind:

<Steps>
  <Step title="The account balance">
    Runs out of credits and every primitive stops, not just agents. This is
    `insufficient_credits`.
  </Step>

  <Step title="The agent cap — `budget.cap_micro_usd`">
    Per agent, per period. A task that starts when the agent is already at or over
    the cap is refused and **ends** at `status: "braked"` with
    `blocked_reason: "budget"`, `spent: 0` and an `ended_at` — and the agent itself
    goes to `status: "braked"`, `attention: true`, so a roster query finds it.
    **This is the only budget control measured to bind on a deployed host** — and
    see the notes below for what it does *not* do and what `braked` means.
  </Step>

  <Step title="The per-task ceiling — `budget.max_task_micro_usd`">
    Per TASK, over its root run and every sub-agent it delegated to. The intent is a
    pre-call reserve check that **ends** the task rather than parking it, because a
    per-task ceiling never resets. 🔴 **Measured against deployed staging it does not
    fire at all.** Do not size a deployment on it until you have proved it yourself —
    see the warning below.
  </Step>
</Steps>

```ts theme={"theme":"css-variables"}
budget: {
  cap_micro_usd: 50_000_000,     // $50.00 in integer micro-USD
  period: "month",               // "total" | "day" | "week" | "month" | "year"
  max_task_micro_usd: 5_000_000, // $5.00
  alert_at: 0.8,                 // stored; nothing fires off it yet — see below
  hard: true,                    // stored; both ceilings refuse either way — see below
}
```

<Warning>
  🔴 **`alert_at` and `hard` are accepted, stored and echoed, and neither changes
  what the runtime does.**

  `alert_at` is validated as a 0–1 fraction and written to the agent's config, and
  nothing in the runtime compares spend against it — there is no `budget.alert`
  emitter, and the webhook catalogue deliberately does not advertise a
  budget-warning event for exactly that reason. Read the `budget` event on the
  event stream instead: it carries `spentMicroUsd`/`capMicroUsd` and
  `taskMicroUsd`/`maxTaskMicroUsd` on **every** turn, before the call, which is
  strictly more than an 80% notification would give you.

  `hard: false` does **not** park the task for an approval. Both the period cap and
  the per-task ceiling refuse unconditionally today; the flag is not read at the
  gate. Treat every cap as hard, and size it accordingly.
</Warning>

### What a cap guarantees, in two halves

Both ceilings are decided **before** each model call, against a reserve priced
for the worst case that call could cost: the whole prompt at the full input rate
plus the output ceiling the call will carry, as though every token of it is used.
Crossing `cap_micro_usd` parks the task at `braked`; crossing
`max_task_micro_usd` ends it `failed` and non-retryable, with the spend, the
reserve and the ceiling in its `error`. Neither makes the call.

The output ceiling is **not fixed**. When the maximum would not fit what is left
of either allowance, the runtime solves for the largest ceiling that does and
sends the call with it — the reserve bounds the call because the transport
enforces that ceiling, not because the model is expected to be brief. The
`budget` event publishes it as `maxOutputTokens` each turn. This is why a
`max_task_micro_usd` that covers a short turn but not a maximum-length one now
runs instead of refusing at spend 0.

That reserve needs a price, and on an agent's **first** call there are no
previous calls to extrapolate one from — so the runtime asks the transport for
its published price instead. Every `budget` event says which source decided that
turn, in `reserveSource`:

* **`observed`** — this agent's own metered calls on this model.
* **`card`** — the transport's published price for (model, window). The source
  that lets a cap bind on call one; the completion-window model is always priced
  this way.
* **`none`** — no price exists in advance on this transport. **One** model call
  is admitted, and both ceilings are then re-decided against the real invoice, so
  the overshoot is bounded at exactly one call rather than being unbounded.

When an agent has both a rate of its own and a published card, the card is a
**ceiling on the reserve**: the reserve is the lower of the two, never the
higher. The card's figure is a bound the transport can prove — the whole prompt
at its dearest tier plus an output ceiling it enforces — so an extrapolation
above it is describing a call that cannot happen, and refusing work on it would
strand a budget that was never at risk. `reserveClampedByCard` on each `budget`
event says when the cap applied. It reads `true` when your agent's own recent
calls extrapolate to more than the published worst case, which usually means the
recent sample is not representative of the next call.

<Warning>
  🔴 **On `reserveSource: "none"`, size your cap for one extra model call.** A
  ceiling of 1 micro-USD does not buy a call that costs 1 micro-USD; it buys a
  task that stops after the first one. That is the weaker of the two guarantees and
  it is on the event stream, per turn, so you can tell which one you are getting
  rather than inferring it from an invoice.

  Historic, for anyone comparing against an older run: this used to be the ONLY
  behaviour, on every transport and every model, because the reserve for an
  unpriced first call was silently zero. Measured on a deployed host at the time —
  `cap_micro_usd: 1`, `period: "total"`, `hard: true` — task #1 ran to
  `status: "done"` for **22,534 micro-USD**, and an agent with
  `max_task_micro_usd: 1` ran three tasks to `done` at 17,954 / 10,359 / 12,054
  micro-USD with `error: null`. Both ceilings now refuse that first call outright
  whenever the transport publishes a price for it.
</Warning>

<Note>
  **`braked` is a terminal task status, and it is one on purpose.** A task the cap
  stops ends there: `ended_at` is set, `error` names the cap, the spend and the
  reserve, and its event log closes with `error` then
  `task_finished { status: "braked" }` — so a stream ends instead of hanging, and
  `cancel` answers that the task is already over rather than stamping a
  `cancel_requested_at` nothing will read. Recovery is two calls, and the second
  is not optional:

  ```ts theme={"theme":"css-variables"}
  // 1. Give the agent room again. This clears `status: "braked"`,
  //    `blocked_reason` and `attention` on the AGENT.
  await client.agents.update(agentId, {
    budget: { cap_micro_usd: 100_000_000, period: "month", max_task_micro_usd: 5_000_000 },
  });
  // 2. Re-send the work: raising the cap does not revive the braked task.
  await client.agents.sendJob(agentId, { text: "…the work that braked…" });
  ```

  Earlier builds *parked* the task instead, on a wake nothing could arm — the
  board never claimed a `braked` row, and `period: "total"` has no reset to wait
  for. Measured then: a cap raised two-million-fold and forty seconds of polling
  moved nothing, the log stopped dead after the last `usage` frame, and `ended_at`
  stayed `null`.
</Note>

`period: "total"` is the long-horizon statement — *"spend \$50 on this job,
ever"* — and it is the one period a project-level cap cannot express.

### Watching it before it brakes

```bash theme={"theme":"css-variables"}
naive agents spend <agent-id> --by task     # which unit of work cost what
naive agents spend <agent-id> --task <id>   # the authoritative figure for one task
```

Watch the `budget` event on the stream — one per turn, emitted before the call
that the reserve is checked against — rather than waiting to discover the brake:

```ts theme={"theme":"css-variables"}
for await (const e of await client.agents.watch(agentId)) {
  if (e.kind === "budget") console.log(e.data.spentMicroUsd, "of", e.data.capMicroUsd);
}
```

<Note>
  `task.spent_micro_usd` is the runtime's own synchronous counter, used by the
  pre-call gate. `spend({ task })` reads the **same meter**, priced into credits —
  so the two agree, and the "authoritative ledger vs advisory counter" framing
  that used to sit here was wrong: an agent's model calls write no ledger row at
  all (its runtime calls the model vendor directly), which is why this endpoint
  answered `0.0000` against real spend on our deployed staging host.

  `spend()` reports both records and keeps them apart: `spent_credits` is metered,
  `billed_credits` is what the credit ledger holds, and each group says which
  `source` it came from. Do not add them.
</Note>

## Deleting an agent does not change history

```ts theme={"theme":"css-variables"}
await client.agents.delete(agent.id);
```

Queued work is cancelled and the alarm chain stops. **The spend ledger is kept** —
deleting an agent must not change what last month cost.
