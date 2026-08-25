> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Guide: an agent with a sandbox

> Give an agent a Linux micro-VM so it can write code, run the tests, and deliver a diff that actually compiles.

The goal: an agent that receives a bug report, writes a fix in a real checkout,
runs the test suite, and delivers a diff — with evidence that the tests passed.

Without a sandbox an agent can only *describe* a fix.

## 1. Turn the sandbox on

`sandbox` is not a boolean. It takes a mode:

| value    | meaning                                           |
| -------- | ------------------------------------------------- |
| `"none"` | No sandbox. The default.                          |
| `"auto"` | One is provisioned on demand and torn down after. |

🔴 **There is no third form.** `"<workspace id>"` was documented and accepted
with a 201, and the id reached no component that provisions a sandbox — a pinned
agent still got a fresh box on every task. It is now refused, with a message
saying so.

```ts theme={"theme":"css-variables"}
const agent = await client.agents.create({
  name: "fixit",
  model: "anthropic/claude-sonnet-4-5",
  instructions: [
    "You fix bugs in a TypeScript service.",
    "Always run the test suite before delivering. Never deliver a fix you did not run.",
    "Deliver the diff and the test output together.",
  ].join("\n"),
  budget: {
    cap_micro_usd: 100_000_000,     // $100
    period: "month",
    max_task_micro_usd: 10_000_000, // $10
  },
  tools: { sandbox: "auto", storage: true },
  limits: {
    sliceWallMs: 840_000,   // 14 min — the maximum. Builds are slow.
    toolTimeoutMs: 300_000, // 5 min for one `bash`. Must be ≤ half of sliceWallMs.
    maxToolCallsPerTurn: 8,
  },
});
```

```bash theme={"theme":"css-variables"}
naive agents create \
  --name fixit \
  --model anthropic/claude-sonnet-4-5 \
  --budget-usd 100 --max-task-usd 10 \
  --sandbox auto --storage \
  --wake-ms 840000 --max-tool-calls 8
```

<Warning>
  🔴 **`toolTimeoutMs` may not exceed half of `sliceWallMs`**, and the server
  enforces it. A tool timeout longer than half a wake cannot be enforced — the
  wake ends first. With the 14-minute maximum slice, 7 minutes is the ceiling for
  a single command; the example above leaves headroom at 5.

  `sliceWallMs` bounds a **wake**, not the task. A build that needs 40 minutes
  spans four wakes and finishes; it does not need a 40-minute slice, and asking
  for one is refused.
</Warning>

## 2. What the sandbox toggle actually grants

Each product toggle maps to concrete tools the agent is offered:

| toggle        | tools granted                                       |
| ------------- | --------------------------------------------------- |
| `sandbox`     | `bash`, `read`, `edit`                              |
| `web_search`  | `web_search`, `web_read`                            |
| `browser`     | `browser`                                           |
| `connections` | `connection_search`, `connection_call`              |
| `storage`     | *(none — `deliver` is always available)*            |
| `delegation`  | *(none — `delegate` is gated on `delegate_models`)* |

So `sandbox: "auto"` is what puts `bash`, `read` and `edit` on the table. An
agent with `sandbox: "none"` cannot run a command no matter how the instructions
are worded.

<Note>
  **The Account Kit still narrows this.** If the child project's kit has the
  `sandbox` primitive off, `tools.sandbox` reads back as
  `{ requested: "auto", effective: "none" }` and the agent is offered no `bash`.
  Check `effective`, never `requested`, when a run does not do what you expected.
</Note>

## 3. Send it a bug

```ts theme={"theme":"css-variables"}
const stream = await client.agents.sendMessage(agent.id, {
  text: [
    "Repo: git@github.com:acme/billing.git, branch main.",
    "Bug: `POST /invoices` returns 500 when `line_items` is empty.",
    "Expected: 400 with a field error.",
    "Fix it, run `npm test`, and deliver the diff plus the test output.",
  ].join("\n"),
  payload: { repo: "acme/billing", issue: 4412 },
});

for await (const e of stream) {
  if (e.kind === "tool_call")   console.log("→", e.data.name);
  if (e.kind === "tool_result") console.log("←", e.data.status ?? "");
  if (e.kind === "text_delta")  process.stdout.write(String(e.data.text ?? ""));
}

const task = await stream.done();
console.log(task.status, task.turns, task.wakes);
```

`payload` is for structured context — anything you would otherwise have to
serialise into the prompt and re-parse. It reaches the agent alongside `text`.

## 4. Read what it did, tool call by tool call

The event log carries every command:

```bash theme={"theme":"css-variables"}
naive agents logs <agent-id> --kind tool_call
naive agents logs <agent-id> --kind tool_call --show-args   # full args, interactive only
```

Tool **arguments** print as a digest by default. `--show-args` prints them in
full and refuses to run in a pipe, because a full-argument dump of a sandbox run
contains file contents and is not something to redirect into a log file by
accident.

```ts theme={"theme":"css-variables"}
const page = await client.agents.events(agent.id, { kind: "tool_call", limit: 200 });
for (const e of page.items) console.log(e.seq, e.data.name);
```

## 5. Collect the deliverable

```ts theme={"theme":"css-variables"}
const { items } = await client.agents.deliverables(agent.id, { task: task.id });
const diff = items.find((d) => d.kind === "code");

const { deliverable, content, download_url } = await client.agents.deliverable(agent.id, diff!.id);
console.log(deliverable.sha256, deliverable.bytes);
console.log(content ?? download_url);
```

Up to **20 deliverables per task**, **25 MB each**. A short diff comes back
inline as `content`; a large one comes back as a `download_url` valid for an
hour.

<Note>
  🔴 **A `final` deliverable must carry an artifact or say why it does not.** If
  the agent could not produce a fix, a final deliverable with
  `no_artifact_reason: "the failing test does not reproduce on main"` is a real
  answer. `final: true` with nothing at all is refused — otherwise "deliver"
  quietly becomes a status update, and a run that produced nothing looks like a
  run that succeeded.
</Note>

## 6. Writing a deliverable yourself

The agent's runtime normally writes these. If you are backfilling, migrating, or
attaching the artifact a crashed turn produced, the write is two calls — the
bytes never traverse the API process:

```ts theme={"theme":"css-variables"}
// 1. Mint a presigned PUT
const up = await client.agents.createDeliverableUpload(agent.id, {
  filename: "fix.diff",
  content_type: "text/x-diff",
  bytes: buf.byteLength,
});

if (up.upload_url) {
  await fetch(up.upload_url, { method: "PUT", body: buf });
}

// 2. Record the manifest against the storage key
await client.agents.createDeliverable(agent.id, {
  agent_task_id: task.id,
  title: "Fix empty line_items 500",
  kind: "code",
  storage_key: up.storage_key,
  bytes: buf.byteLength,
  final: true,
  summary: "Validates line_items before pricing; adds a regression test.",
});
```

For a short artifact, skip the upload entirely and send `text` instead:

```ts theme={"theme":"css-variables"}
await client.agents.createDeliverable(agent.id, {
  agent_task_id: task.id,
  title: "Fix empty line_items 500",
  kind: "code",
  text: diffString,          // up to 256 KB inline
  bytes: Buffer.byteLength(diffString),
  final: true,
});
```

<Note>
  `upload_url` is `null` when the deployment has no storage sink configured. That
  is a deployment state, not an error — send the artifact as `text` instead. The
  same condition shows up on read as `download_url: null` with `content` carrying
  everything.
</Note>

## 7. Keeping state between tasks

🔴 **You cannot, yet, and the API no longer pretends otherwise.**

This section used to say that `tools: { sandbox: "billing-checkout" }` pinned a
workspace so a checkout survived between tasks. The value was stored, echoed
back and pushed to the runtime — and the runtime has no workspace field to put
it in, so every task started from an empty box regardless. The call is now a
`400`.

What DOES survive a wake is the sandbox the agent provisioned for itself inside
one task: the workspace is parked at the end of a slice and resumed on the next,
and its disk is intact across that gap. What does not survive is the gap between
two *tasks*.

Until the pin is wired end to end, carry state the way everything else on this
primitive does — a deliverable, or a checkout the agent re-clones. `tools`
**merges field by field** on update, so turning the sandbox on later leaves
`storage` alone.

## Cost control for a sandbox agent

A sandbox agent is the most expensive shape this primitive has: long slices, many
tool calls, and a build that can burn minutes without producing tokens.

* Set `max_task_micro_usd` to what you would accept losing on one bug. It is
  checked before every model call against that task's own spend — its root run
  plus every sub-agent it delegated to — and crossing it **ends** the task
  `failed` and non-retryable rather than parking it, because a per-task ceiling
  never resets.
* On `zai-org/GLM-5.2-FP8`, set `completion_window: "flex"` when nobody is
  waiting: fewer, larger turns re-send the transcript fewer times, and `flex`
  input is priced at half the `asap` rate. On any other model `asap` is the
  only window served, and asking for another is refused rather than downgraded.
* Watch the `budget` event on the stream — one per turn, before the call. Do not
  wire anything to `alert_at`: it is stored and nothing fires off it.

```bash theme={"theme":"css-variables"}
naive agents spend <agent-id> --by task     # which bug cost what
naive agents spend <agent-id> --task <id>   # the authoritative figure for one
```

<Warning>
  **The agent cap parks; the per-task ceiling kills.** When both would be crossed
  by the same call the cap wins, because parking is the recoverable answer — the
  period rolls and the task resumes. Nothing here reads `budget.hard`: both
  ceilings refuse unconditionally, so a `hard: false` sandbox agent is not softer
  than a `hard: true` one.
</Warning>
