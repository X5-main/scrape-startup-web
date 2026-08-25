> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Guide: a scheduled agent

> An agent that wakes itself every morning, does the work, and delivers a report — without anything calling it.

The goal: at 06:00 Pacific every weekday, an agent reads yesterday's errors,
writes a summary, and files it as a deliverable. Nothing external calls it.

## 1. Create it with the schedule attached

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/node";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
const client = naive.forUser(process.env.CHILD_PROJECT_ID!);

const agent = await client.agents.create({
  name: "morning-triage",
  model: "anthropic/claude-sonnet-4-5",
  instructions: [
    "You triage overnight errors for a Node.js API.",
    "Group by root cause, not by message. Newest first.",
    "Deliver one report. If nothing broke, say so in one line and deliver that.",
  ].join("\n"),
  budget: {
    cap_micro_usd: 30_000_000,     // $30 a month
    period: "month",
    max_task_micro_usd: 2_000_000, // $2
  },
  tools: { web_search: true, storage: true },
  schedule: {
    cron: "0 6 * * 1-5",
    tz: "America/Los_Angeles",
    text: "Triage the errors from the last 24 hours and deliver the report.",
  },
});
```

<Note>
  **No `completion_window` here, on purpose.** `standard` and `flex` are served
  only on `zai-org/GLM-5.2-FP8`; on `anthropic/claude-sonnet-4-5` a non-`asap`
  window is refused at the first model call with `window_unavailable` rather than
  downgraded, which would turn this agent's 6am wake into a failed task. A loud
  failure is the intended outcome — the alternative, serving the wake on `asap`
  under a `flex` request, bills a tariff nobody agreed to and shows nothing wrong
  on the task row. If the agent is pinned to GLM-5.2, `completion_window: "flex"`
  is the right setting for work nobody is waiting on — see
  [pricing](/docs/agents/pricing).
</Note>

<Note>
  **`agent.next_wake_at` is the armed alarm.** `create` and `update` return the
  wake the runtime armed on that very call, and a `GET` of one agent re-reads it
  off the agent's own object, so it stays current after each fire. `null` means
  exactly what it says — no alarm is armed, and the agent costs storage only.

  `agent.wakes` is live for the same reason. `status`, `attention` and
  `blocked_reason` are **not**: those three are still a Postgres mirror nothing
  writes back to, so a braked or blocked agent still reads `status: "idle"`. For
  state, read the **board** — tasks with `source: "schedule"`, as in step 3.

  `list()` reads the last value a single-agent read or a config push stored, so a
  roster can lag one fire behind. `GET /v1/agents/:id` is always current.
</Note>

<Note>
  **Five cron fields — `min hour dom mon dow`.** Seconds are not a field, and a
  6-field expression is refused at create with `invalid_input`. `tz` is IANA and
  defaults to `UTC`; use a real timezone if you care about daylight saving,
  because `0 6 * * *` in UTC drifts an hour against Pacific twice a year.
</Note>

Or from the CLI, where `--cron` takes `"<5-field cron>=<the work>"`:

```bash theme={"theme":"css-variables"}
naive agents create \
  --name morning-triage \
  --model anthropic/claude-sonnet-4-5 \
  --instructions "You triage overnight errors. Group by root cause." \
  --budget-usd 30 \
  --max-task-usd 2 \
  --web-search --storage \
  --tz America/Los_Angeles \
  --cron "0 6 * * 1-5=Triage the errors from the last 24 hours and deliver the report."
```

## 2. Several schedules on one agent

`schedule` takes an array.

```ts theme={"theme":"css-variables"}
await client.agents.update(agent.id, {
  schedule: [
    { cron: "0 6 * * 1-5", tz: "America/Los_Angeles", text: "Triage last night's errors." },
    { cron: "0 17 * * 5",  tz: "America/Los_Angeles", text: "Write the weekly rollup." },
    { cron: "0 0 1 * *",   tz: "UTC", text: "Archive last month.", enabled: false },
  ],
});
```

`enabled: false` keeps the row without arming it — the way to pause one
schedule without losing its definition.

### A schedule entry's own `window`

A schedule entry may name its own `window`, and the task it fires runs and bills
at that window:

```ts theme={"theme":"css-variables"}
schedule: [
  { cron: "0 6 * * *", tz: "UTC", text: "Summarise overnight.", window: "flex" },
],
```

**Omit it and the schedule inherits the agent's `completion_window` — at fire
time, not at create time.** That distinction is the whole reason the field is
nullable: an entry that named no window is resolved against the agent's window
*as it stands when the cron fires*, so a later `PATCH` of `completion_window`
reaches schedules that never named one. An entry that *did* name a window keeps
it, and a `PATCH` of the agent does not overwrite it.

<Note>
  `standard` and `flex` are served only on the models that publish those tiers —
  see the note in step 1. A window this agent's model cannot serve is refused at
  the first model call with `window_unavailable`; it is never quietly downgraded.
</Note>

## 3. Check that it actually woke

The board records which door the work came through, so a schedule-fired task is
distinguishable from one you sent by hand:

```ts theme={"theme":"css-variables"}
const { items } = await client.agents.tasks(agent.id, { source: "schedule" });

for (const t of items) {
  console.log(t.created_at, t.status, t.turns);
}
```

```bash theme={"theme":"css-variables"}
naive agents tasks <agent-id> --source schedule
```

<Warning>
  **Collapsed fires are real; `missed_fires` does not report them.** If the agent
  was still busy when the next fire landed, the fires are collapsed into one task
  rather than queued into a backlog that can never drain — and the collapsed count
  is written into the *task's own text* ("This schedule fired N times while you
  were unavailable… You are late."). The `missed_fires` field on a task record is
  hard-coded to `0`, because the runtime counts collapses against the schedule and
  not against a task. Read the task text, or the thin board, not that field.
</Warning>

## 4. Read what it delivered

```ts theme={"theme":"css-variables"}
const { items } = await client.agents.deliverables(agent.id);
const latest = items[0]!;

const { deliverable, content, download_url } = await client.agents.deliverable(agent.id, latest.id);

console.log(deliverable.title, deliverable.final, deliverable.bytes);
console.log(content ?? download_url);
```

Small text artifacts come back inline as `content`. Larger ones come back as a
`download_url` minted fresh on this read, valid for an hour and
**unauthenticated once issued** — do not cache it, call again.

```bash theme={"theme":"css-variables"}
naive agents deliverables <agent-id>
naive agents deliverables <agent-id> --id <deliverable-id>
```

## 5. Stop it without deleting it

`paused` is a **hold on execution, not a refusal of input**. While an agent is
paused:

* **no wake is armed**, and a wake already on the clock runs nothing
* **no schedule fires.** A cron that comes due while paused does not even become
  a queued row, so resuming does not replay every minute the agent spent paused
* **work is still accepted.** `job` still answers `202` and the task is still
  `queued`. It waits
* **resuming arms again** and the held work runs

```ts theme={"theme":"css-variables"}
await client.agents.update(agent.id, { paused: true });   // stops spending
await client.agents.update(agent.id, { paused: false });  // and picks up where it left off
```

```bash theme={"theme":"css-variables"}
naive agents update <agent-id> --paused
naive agents update <agent-id> --no-paused
```

The flag rides the config push, so it reaches the runtime on the same wire as the
budget and the schedule — the `PATCH` fails loudly if that push is refused.

<Note>
  Disabling a schedule entry (`enabled: false`) is the narrower tool: it silences
  one cron and leaves the agent free to run tasks you send it.

  ```ts theme={"theme":"css-variables"}
  await client.agents.update(agent.id, {
    schedule: [{ cron: "0 6 * * 1-5", tz: "America/Los_Angeles",
                 text: "Triage last night's errors.", enabled: false }],
  });
  ```
</Note>

<Warning>
  Neither aborts a slice that is **already running** — a pause takes effect at the
  next wake, not mid-turn. Use `cancel` for a live task, and remember it is
  cooperative: it lands at the next turn boundary.
</Warning>

## 6. What it costs to leave running

Between 06:00 and 06:00 the next day this agent is asleep with one alarm set for
its next fire, and it costs storage. You are billed for the wake, the model calls
inside it, and any paid tools it used.

```bash theme={"theme":"css-variables"}
naive agents spend <agent-id>
```

```
  cap $30.00 per month (hard)
  inference           4.1200 cr
  sandbox             0.0000 cr  (0 calls)
  web_search          0.3000 cr  (12 calls)
  browser             0.0000 cr  (0 calls)
  storage             0.0100 cr  (22 calls)
  wakes               0.0000 cr  (rate not configured)
  total               4.4300 cr
  billed              0.3100 cr  (credit ledger)
```

There is no threshold notification to subscribe to — `alert_at` is stored and
nothing fires off it. Read the `budget` event on the stream instead: it carries
spend against the cap on every turn, before the call it is gating.

## Failure modes worth wiring up

<Note>
  Every diagnosis below reads the **board**, never `agent.status`. The agent
  record's `status`, `blocked_reason` and `attention` are a mirror nothing writes
  back to; a braked or blocked agent still reads `status: "idle"`.
  (`next_wake_at` and `wakes` are live — they are read from the runtime.)
</Note>

<AccordionGroup>
  <Accordion title="It braked mid-month">
    A task with `status: "braked"` on the board means the cap bound. **It does not
    restart on its own** — the board never claims a braked task, and neither the
    period reset nor a higher cap moves it back. Raise the cap and re-send the work:

    ```ts theme={"theme":"css-variables"}
    const { items } = await client.agents.tasks(agent.id, { status: "braked" });

    await client.agents.update(agent.id, {
      budget: { cap_micro_usd: 60_000_000, period: "month", max_task_micro_usd: 2_000_000 },
    });
    await client.agents.sendJob(agent.id, { text: items[0]!.text });
    ```

    `budget` on update is a **full replacement**, so send every field you want kept.
  </Accordion>

  <Accordion title="It is waiting on you">
    A task sitting at `status: "waiting"` on the board. Find it and answer it:

    ```ts theme={"theme":"css-variables"}
    const { items } = await client.agents.tasks(agent.id, { status: "waiting" });
    await client.agents.replyTask(agent.id, items[0]!.id, "Use the staging database.");
    ```

    A scheduled agent that parks at 6am and is not answered stays parked. If you do
    not want it asking, give it `mode` guidance in `instructions` — a task sent with
    `mode: "ask"` gets read-only tools, but a schedule's work always runs as `act`.
  </Accordion>

  <Accordion title="Nothing ran at all">
    Check the primitive first, then the agent's own log:

    ```bash theme={"theme":"css-variables"}
    naive agents status                    # configured? reachable? which harness?
    naive agents show <agent-id>           # is the schedule on the record, and enabled?
    naive agents tasks <agent-id> --source schedule
    naive agents logs <agent-id> --limit 50
    ```

    An empty board with `source: schedule` and an empty log is the real signal. Do
    not read `next_wake_at` for this: it is `null` on every agent, armed or not.
    The usual causes are every schedule entry having `enabled: false`, or a `cron`
    the agent's parser rejected at config push — which surfaces as
    `agent_not_configured` on the next task rather than as a silent no-op.
  </Accordion>
</AccordionGroup>
