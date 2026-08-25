> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# agents

> Long-horizon agents — create, send work, stream the event log, collect deliverables, read spend, mint inbound URLs.

`naive.forUser(childProjectId).agents` — 22 methods over 20 routes.

<Note>
  **Agents are per-child-project, and `create` requires one.** A child project owns
  the vault entries, connections and Account Kit that decide what the agent may
  touch, so `naive.agents.create()` on the unscoped client answers `invalid_input`
  telling you to scope it. Every other method works on either scope.
</Note>

## Lifecycle

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/node";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
const client = naive.forUser(childProjectId);

// Is the primitive live, and which harness build is serving?
await client.agents.status();
// { configured, reachable, agents, by_status, max_per_user, harness_sha256, error? }

// Create. `name`, a PINNED `model` and a `budget` are required.
const agent = await client.agents.create({
  name: "nightly-triage",
  instructions: "Triage the overnight error queue.",
  model: "anthropic/claude-sonnet-4-5",
  delegate_models: [],                 // [] = delegation OFF, and the tool is absent
  completion_window: "asap",           // "asap" | "standard" | "flex"
  budget: {
    cap_micro_usd: 50_000_000,         // $50.00, integer micro-USD
    period: "month",                   // "total" | "day" | "week" | "month" | "year"
    max_task_micro_usd: 5_000_000,
    alert_at: 0.8,                     // stored; nothing fires off it — see below
    hard: true,                        // stored; both ceilings refuse either way
  },
  tools: { web_search: true, sandbox: "auto", storage: true },
  limits: { sliceWallMs: 600_000, maxToolCallsPerTurn: 8 },   // sparse; the rest default
  schedule: { cron: "0 6 * * *", tz: "America/Los_Angeles", text: "Triage last night." },
  secrets: ["github.token"],           // vault entry NAMES, never values
  connections: ["conn_123"],
  metadata: { team: "platform" },
});

await client.agents.list({ status: "idle", limit: 50 });  // { items, next_cursor }
await client.agents.get(agent.id);
await client.agents.update(agent.id, { instructions: "…" }); // limits/tools MERGE; else replace
await client.agents.delete(agent.id);                     // { id, deleted: true } — ledger kept
```

<Warning>
  🔴 **Three of the lifecycle fields on an agent record are a mirror nothing
  writes back to.** `status`, `blocked_reason` and `attention` are columns on the
  agent row that no shipped code path updates — the runtime keeps those facts
  inside its durable object and reports only `agent.budget_reached` and
  `agent.job_complete` to naïve, neither of which lands in the row. So every agent
  reads `status: "idle"` whatever it is doing, and
  `list({ status: "running" })` returns nothing, ever.

  `next_wake_at` and `wakes` are live. `create()` and `update()` return the wake the
  runtime armed on that call, and `get()` re-reads it off the agent's own object;
  `list()` shows the last stored value and can lag a fire behind.

  Read `tasks()`, `task()` and `events()`/`watch()` for live state — those are
  served straight out of the runtime.
</Warning>

<Note>
  **`update({ paused: true })` is a hold on execution.** It rides the config push,
  so the runtime honours it: no wake is armed and no schedule fires. Work you send
  a paused agent is still accepted and still `queued` — it waits for
  `update({ paused: false })`, which arms again and runs it. It does not abort a
  slice already running; `cancelTask()` does that, cooperatively.
</Note>

<Note>
  **There is no `jobs` array on `create`.** Create writes Postgres in one
  transaction and touches nothing in the runtime — the durable object is made
  lazily on first wake — so a create that fails halfway cannot leave an orphaned
  agent behind a rolled-back row. Send the work immediately after; it is one
  `sendJob` and it retries on its own.
</Note>

## Sending work

```ts theme={"theme":"css-variables"}
// Queue it, get the record. 202 = durably queued, alarm armed.
const task = await client.agents.sendJob(agent.id, {
  text: "Summarise the last 24 hours of errors.",
  payload: { since: "2026-08-14T00:00:00Z" },  // structured context
  mode: "act",                                 // "act" (default) | "ask" (read-only tools)
  priority: "normal",                          // board order only; not_before defers
  window: "asap",                              // the tier for THIS task; omit to inherit the agent
  not_before: "2026-08-16T09:00:00Z",
  idempotency_key: "errors-2026-08-15",        // PERMANENT business key
  metadata: { run: "nightly" },
});

// Queue it and stream it. Same route, decided by Accept.
const stream = await client.agents.sendMessage(agent.id, { text: "How did last night go?" });
stream.task_id;    // a real id, synchronously — before the first token
for await (const e of stream) { /* AgentEvent */ }
await stream.text();  // concatenated text_delta — the 80% case
await stream.done();  // resolves to the final AgentTask
stream.close();       // stops reading; does NOT cancel the task
```

<Note>
  **A per-task `window` takes all three values.** An earlier release accepted a
  per-task `"standard"`, stored it and echoed it back as `"asap"` — the runtime
  narrowed the inbound window with a two-way test written when there were two
  windows. It now narrows against the platform's window table, and
  `ci/agents-window-parity.test.ts` fails if any surface goes back to spelling that
  set by hand.

  **Omitting `window` on a task inherits the agent's `completion_window`** — it
  does *not* fall back to `"asap"`. The client sends no field, the API forwards
  `undefined`, and the runtime resolves it, so exactly one component holds that
  default. An earlier release did read an omitted window as `"asap"`; if you are
  working from notes written against that, it changed. Send the field only when a
  particular task needs a tier other than its agent's.

  **A non-default window is served on a model that declares one, and REFUSED on
  the rest.** On any other model the field is accepted here and at the API, and the
  turn is then refused with `window_unavailable` — refused rather than downgraded,
  because a window silently served as `"asap"` reports a discount nobody bought.
  The gate runs before a provider is chosen, so a refused turn spends nothing.

  **A task's window is not the agent's knob.** On a task it selects the tier the
  call is priced at, and nothing else. The run's tool fan-out, sub-agent width and
  batch hint come from the agent's `completion_window`, because the run manifest
  declares one strategy before its first turn.

  🔴 **A schedule entry's `window` is accepted, stored, echoed on `get`, and then
  dropped.** Every schedule-fired task is created `"asap"` — which overrides the
  schedule's own window *and* the agent's `completion_window`, so a `"flex"`
  agent's cron work meters at the dearest tier. The error direction is
  over-charge, and no client-side setting fixes it today.
</Note>

## The board

```ts theme={"theme":"css-variables"}
await client.agents.tasks(agent.id, {
  status: "waiting",         // queued|running|waiting|done|failed|cancelled|braked
  source: "schedule",        // api|schedule|webhook|agent|self  (PLATFORM-SET)
  since: "2026-08-01T00:00:00Z",
  limit: 50,
  cursor: "…",
});

await client.agents.task(agent.id, taskId);

// Cooperative — never aborts mid-tool. `cancel_requested_at` is set immediately.
await client.agents.cancelTask(agent.id, taskId);

// Answer a task parked on a question. 409 task_not_replyable if it is not parked.
await client.agents.replyTask(agent.id, taskId, "Use the staging database.");
```

<Note>
  **`source` is PLATFORM-SET: no request body can write it, and an unknown value
  is refused rather than answered with an empty page.** It says why the agent woke
  — `webhook` for an inbound delivery, `schedule` for a cron fire, `self` for a
  row the agent wrote itself, `api` for a task you sent. The trigger router states
  it on a header the gateway sets, which is why a `source` in your own request
  body is ignored and your tasks read `api`.

  Runtimes before 2026-08-19 wrote `api` into this column for every task, so
  `{ source: "webhook" }` came back `{items: []}` on them — a working filter's
  answer, which is why it went unnoticed for so long. Tasks those builds created
  still read `api`; find them by `metadata.event_type` /
  `metadata.trigger_subscription_id`, which the router has always written.
</Note>

## The event log

One log, two representations, one reader.

```ts theme={"theme":"css-variables"}
// A keyset page
const page = await client.agents.events(agent.id, {
  task: taskId, after: 120, limit: 100, kind: "tool_call",
});
page.items; page.next_cursor; page.earliest_seq; page.truncated;

// The same log, live — including a run that started yesterday
const stream = await client.agents.watch(agent.id, { after: 120, task: taskId });
```

<Warning>
  **`after` is a POSITION, never a time.** Replay is strictly greater, so a resume
  loses nothing and duplicates nothing. Retention is 20,000 rows with no TTL; an
  offset older than the floor comes back with `truncated: true` and `earliest_seq`
  and starts there rather than skipping silently.
</Warning>

The `AgentEventKind` union the SDK publishes is `declared`, `task_started`,
`task_finished`, `turn_started`, `text_delta`, `tools_offered`, `tool_call`,
`tool_result`, `usage`, `budget`, `subagent_started`, `subagent_finished`,
`delivered`, `error`.

<Warning>
  **Treat `kind` as open, not as an exhaustive union.** The runtime appends every
  event it emits to one log and the read path filters nothing, so a stream can also
  carry `batch_planned`, `parallel_dispatch`, `speculation` and
  `cost_disagreement` — four kinds the published union does not name. A `switch`
  written as exhaustive over the fourteen above will meet a fifteenth. Keep a
  default branch.
</Warning>

## Deliverables

```ts theme={"theme":"css-variables"}
await client.agents.deliverables(agent.id, { task: taskId, limit: 50 });

// One manifest with a FRESH download url, plus inline text for a small artifact
const { deliverable, content, download_url } = await client.agents.deliverable(agent.id, id);

// Write one. `final: true` REQUIRES text, storage_key or no_artifact_reason.
await client.agents.createDeliverable(agent.id, {
  agent_task_id: taskId,
  title: "Nightly triage",
  kind: "report",     // report|doc|code|dataset|image|video|pr|deploy|other
  text: "…",          // inline, up to 256 KB
  bytes: 1024,
  final: true,
  summary: "Three root causes, one regression.",
});

// Or mint a presigned PUT first, so the bytes never traverse the API process
const up = await client.agents.createDeliverableUpload(agent.id, {
  filename: "report.pdf", content_type: "application/pdf", bytes: buf.byteLength,
});
if (up.upload_url) await fetch(up.upload_url, { method: "PUT", body: buf });
await client.agents.createDeliverable(agent.id, {
  agent_task_id: taskId, title: "Nightly triage", storage_key: up.storage_key,
  bytes: buf.byteLength, final: true,
});
```

`download_url` and `upload_url` are `null` when the deployment has no storage
sink — a deployment state, not an error. A minted `download_url` is
**unauthenticated once issued** and lives an hour; never cache it, call again.

Limits: 20 deliverables per task, 25 MB each.

## Spend

```ts theme={"theme":"css-variables"}
await client.agents.spend(agent.id);                      // by component
await client.agents.spend(agent.id, { by: "task" });      // by task
await client.agents.spend(agent.id, { task: taskId });    // one task, authoritative
```

Returns `{ period, period_start, cap_micro_usd, max_task_micro_usd, hard,
spent_credits, by, groups }`. Every paid component appears including the zeros.
Money is decimal **strings** — the client does no arithmetic on it anywhere.

<Warning>
  🔴 **`budget.alert_at` and `budget.hard` are stored and enforce nothing.**
  `alert_at` is validated as a 0–1 fraction and pushed to the runtime, and no code
  compares spend against it — there is no `budget.alert` emitter anywhere. `hard`
  is not read at either gate: the period cap and the per-task ceiling both refuse
  unconditionally, so `hard: false` is not a soft cap.

  Watch the `budget` event on `watch()` instead. It carries `spentMicroUsd` /
  `capMicroUsd` and `taskMicroUsd` / `maxTaskMicroUsd` on every turn, emitted
  before the call the reserve is being checked for.
</Warning>

## Inbound webhooks

```ts theme={"theme":"css-variables"}
const hook = await client.agents.createWebhook(agent.id, { name: "github-pr" });
hook.url;      // "https://api.usenaive.ai/webhooks/hooks/hk_9f2c…"
hook.secret;   // 🔴 the secret is in THIS response and no other

await client.agents.webhooks(agent.id);       // secret_set: boolean, never the value
await client.agents.deleteWebhook(agent.id, hook.id);  // 404s when it removed nothing
```

<Warning>
  🔴 **The URL `createWebhook()` minted was unroutable until 2026-08-18.** It read
  `https://hooks.usenaive.ai/wh/{slug}` — a host with no deployment behind it, so
  every provider pointed at it got `404 DEPLOYMENT_NOT_FOUND` and the events simply
  never arrived, while `createWebhook`, `webhooks()` and the endpoint row all
  looked correct. The receiver was live the whole time on
  `/webhooks/hooks/{slug}`, which is what is minted now.

  If you stored a `hooks.usenaive.ai` URL, it never worked: call `webhooks()` to
  read the current address, or delete the endpoint and mint a new one. The
  deployment's address, and whether it has one at all, is on
  `agents.status().webhook_ingress` — check it **before** you wire a provider. A
  deployment that cannot serve an inbound URL now refuses `createWebhook()` with
  `feature_not_configured` (501) rather than handing back an address to nowhere.
</Warning>

### Signing a delivery

Sign with the helper rather than rebuilding the string — the timestamp is part of
the **signed content**, not a header beside it:

```ts theme={"theme":"css-variables"}
import { signAgentWebhook } from "@usenaive-sdk/node";

const rawBody = JSON.stringify(payload);
const headers = signAgentWebhook(hook.secret, rawBody);
// { "X-Naive-Timestamp": "1786…", "X-Naive-Signature": "9c1f…" }
await fetch(hook.url, { method: "POST", headers: { ...headers }, body: rawBody });
```

Reimplementing it in another language — the receiver checks exactly this, and
nothing else:

| header              | value                                                          |
| ------------------- | -------------------------------------------------------------- |
| `X-Naive-Timestamp` | Unix **seconds**, as a decimal string                          |
| `X-Naive-Signature` | `HMAC-SHA256(secret, "<timestamp>.<raw body>")`, lowercase hex |

Two separate headers, and the signature is **bare hex** — a leading `sha256=` or
`v1,` is tolerated and nothing else is. A single Stripe-style combined header
(`t=…,v1=…`) does **not** verify. The signed content is the timestamp, a literal
`.`, then the exact request bytes; the window is five minutes.

## Errors

Every refusal is a `NaiveError` with a stable `code` (see
[SDK errors](/docs/sdk/errors)). The agents-specific codes are `invalid_model`,
`agent_not_configured`, `task_not_replyable`, `budget_exhausted` and
`agent_runtime_unavailable`; the rest are the platform's usual set.

```ts theme={"theme":"css-variables"}
import { NaiveError } from "@usenaive-sdk/node";

try {
  await client.agents.replyTask(agent.id, taskId, "yes");
} catch (e) {
  if (e instanceof NaiveError && e.code === "task_not_replyable") {
    // it was not parked on a question
  }
}
```

<Note>
  `window_unavailable` is the one refusal a window user has to handle: a
  `"standard"` or `"flex"` window on a model that does not declare one is refused
  with it rather than downgraded. It arrives at the **first model call**, not at
  `create` and not at `sendJob`, so it surfaces on the task as a failure rather
  than as a rejected request — and nothing is spent, because the gate runs before
  a provider is chosen.

  Refusing rather than downgrading is the feature. Serving the call as `"asap"`
  under the requested name would report a discount nobody bought, and no field
  downstream would disagree — which is what happened before the gate existed.
  Either pin the agent to a model that declares the window, or leave it at
  `"asap"`.

  `window_cannot_stream` is in the published union and is never sent — every
  window streams. `primitive_disabled_by_kit` is likewise not a wire code: the kit
  gate answers `forbidden` with `details.reason`.
</Note>

## The 22 methods

| method                      | route                                          |
| --------------------------- | ---------------------------------------------- |
| `status()`                  | `GET /agents/status`                           |
| `create()`                  | `POST /agents`                                 |
| `list()`                    | `GET /agents`                                  |
| `get()`                     | `GET /agents/:id`                              |
| `update()`                  | `PATCH /agents/:id`                            |
| `delete()`                  | `DELETE /agents/:id`                           |
| `sendJob()` `sendMessage()` | `POST /agents/:id/tasks`                       |
| `tasks()`                   | `GET /agents/:id/tasks`                        |
| `task()`                    | `GET /agents/:id/tasks/:task_id`               |
| `cancelTask()`              | `POST /agents/:id/tasks/:task_id/cancel`       |
| `replyTask()`               | `POST /agents/:id/tasks/:task_id/reply`        |
| `events()` `watch()`        | `GET /agents/:id/events`                       |
| `deliverables()`            | `GET /agents/:id/deliverables`                 |
| `createDeliverable()`       | `POST /agents/:id/deliverables`                |
| `createDeliverableUpload()` | `POST /agents/:id/deliverables/upload`         |
| `deliverable()`             | `GET /agents/:id/deliverables/:deliverable_id` |
| `spend()`                   | `GET /agents/:id/spend`                        |
| `createWebhook()`           | `POST /agents/:id/webhooks`                    |
| `webhooks()`                | `GET /agents/:id/webhooks`                     |
| `deleteWebhook()`           | `DELETE /agents/:id/webhooks/:hook_id`         |

Plus `signAgentWebhook()`, a pure helper that calls nothing.

See the [Agents overview](/docs/agents/overview), [concepts](/docs/agents/concepts) and
[CLI reference](/docs/cli/agents).
