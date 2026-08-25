> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agents

> One durable agent per tenant. It wakes on an alarm, spends a hard budget from your credits, and ends its work in a deliverable. Idle, it costs storage.

An **agent** is one durable object per tenant. You create it once with a pinned
model and a hard spend cap. It sleeps until something wakes it — an API call, a
cron entry, an inbound webhook — works in bounded slices, appends every token,
tool call and budget check to one event log, and ends a task with a deliverable.
Idle, it costs storage and nothing else.

```ts agent.ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/node";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// An agent belongs to a child project. That is the credential boundary.
const user = await naive.users.create({ external_id: "alice" });
const client = naive.forUser(user.id);

const agent = await client.agents.create({
  name: "nightly-triage",
  model: "anthropic/claude-sonnet-4-5",           // pinned — never an alias
  instructions: "Triage the overnight error queue. One summary, newest first.",
  budget: {
    cap_micro_usd: 50_000_000,                    // $50.00 per period. REQUIRED
    period: "month",
    max_task_micro_usd: 5_000_000,                // $5.00 per task. REQUIRED
  },
  tools: { web_search: true },
  schedule: { cron: "0 6 * * *", tz: "America/Los_Angeles", text: "Triage last night's errors." },
});

// Send it work now, and read the answer.
const stream = await client.agents.sendMessage(agent.id, {
  text: "Summarise the last 24 hours of errors.",
});
console.log(await stream.text());                 // concatenated text_delta
console.log((await stream.done()).status);        // "done"

// What that cost.
const spend = await client.agents.spend(agent.id);
console.log(spend.spent_credits);                 // "1.2500" — a decimal STRING
```

The same thing from a terminal:

```bash theme={"theme":"css-variables"}
naive users create --external-id alice
naive use <user-id>
naive agents create --name nightly-triage --model anthropic/claude-sonnet-4-5 \
  --instructions "Triage the overnight error queue." --budget-usd 50 --max-task-usd 5
naive agents run <agent-id> "Summarise the last 24 hours of errors."
naive agents spend <agent-id>
```

## What it costs

Agents bill from the same credit balance as every other primitive. **1 credit =
\$0.05.** No subscription, no per-agent fee.

| when  | what you pay                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| Idle  | Storage only. Leave a hundred defined and pay for none of them.                                                               |
| Awake | Model tokens, plus any paid tool the turn called. Nothing is reserved in advance, and a wake that did no work is not charged. |

`naive agents spend <agent-id>` prints six components — `inference`, `sandbox`,
`web_search`, `browser`, `storage`, `wakes` — **including the zeros**, because a
paid tool missing from that view is how a bill goes unnoticed. `wakes` is not
metered today and prints `rate not configured` rather than being omitted.

## The limits, plainly

| limit                    | value                                                                             | what happens at the edge                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents per child project | **25** (`NAIVE_AGENTS_MAX_PER_USER`)                                              | `create` answers `rate_limited` with the live count and the limit in `details`. Read the deployment's real number from `agents.status()` → `max_per_user` rather than trusting this table.                                                                                                                                                                                    |
| Budget                   | **Required** — `cap_micro_usd` *and* `max_task_micro_usd`, both integer micro-USD | An agent with no cap is **not creatable**: `invalid_input`, `budget: Required`. A cap with no per-task ceiling is refused too — one runaway task would otherwise be the whole cap.                                                                                                                                                                                            |
| The cap, at run time     | Per agent, per period                                                             | Parks the task as `braked`. 🔴 Measured on deployed staging it binds as an **admission** gate, so the FIRST task of a period overshoots without limit — 22,534 micro-USD against a 1 micro-USD hard cap — and the second is parked at `spent: 0`. `braked` is also terminal in practice: nothing moves a task out of it, not the period rolling over and not raising the cap. |
| The per-task ceiling     | Per task, over its root run *and* every sub-agent it delegated to                 | Intended to **end** the task `failed` and non-retryable, because a per-task ceiling never resets. 🔴 Measured on deployed staging it **did not fire at all** — three consecutive tasks ran to `done` at up to 18,000x a 1 micro-USD ceiling, `error: null`. Required at create; not a control to size a deployment on until you have proved it on your own host.              |
| Model                    | A pinned `vendor/model` slug                                                      | `auto`, `best`, `latest`, `default`, `preview` and bare family names are refused. An alias resolves differently on two days and makes two runs incomparable.                                                                                                                                                                                                                  |
| One wake                 | 10 minutes by default, **14 minutes hard** (`limits.sliceWallMs`, 30s–840s)       | The slice ends and the task continues on the next wake. The slice budget bounds the *wake*, never the task.                                                                                                                                                                                                                                                                   |
| Event log                | 20,000 rows, no TTL                                                               | A replay from a position older than `earliest_seq` sets `truncated: true` on the stream instead of returning a silent gap.                                                                                                                                                                                                                                                    |
| Sub-agent depth          | 1 (`limits.maxDepth`)                                                             | A sub-agent cannot spawn a sub-agent.                                                                                                                                                                                                                                                                                                                                         |

### The completion window is served on GLM-5.2 only

`completion_window` decides how a turn is *scheduled* — tool fan-out, sub-agent
allowance, how hard the model is asked to batch. It never changes your model.

* `asap` is the default and is admitted on **every** model.
* `standard` and `flex` are served **only** on `zai-org/GLM-5.2-FP8`. That is the entire supported set.

Asking for `standard` or `flex` on any other model **fails** with
`window_unavailable` (400) and is **never quietly downgraded** — a window served
as `asap` under another name reports a discount nobody bought.

A task that omits `window` **inherits its agent's `completion_window`**; it does
not fall back to `asap`.

<Warning>
  **The refusal lands at the first model call, not at `create`.** The API accepts
  and stores `completion_window: "flex"` on `anthropic/claude-sonnet-4-5`; the gate
  lives in the inference binding, so the task fails when it tries to run — and
  fails **before a provider is chosen**, so a refused turn spends nothing. If you
  are not on a model that declares the window, leave the window alone.

  Refusing rather than downgrading is deliberate, and it was a real defect before
  it was fixed: a non-default window on a model that could not serve it used to be
  served as `asap` and billed, with the requested window echoed back on the task
  row and nothing downstream disagreeing. A refusal is the only outcome that
  cannot misreport what you paid for.
</Warning>

What it buys, and the measurement behind it — including a five-harness comparison
whose raw ranking inverts once you condition on the wall-clock cap — is on
[Pricing](/docs/agents/pricing).

### Three fields that are not live yet

`status`, `wakes` and `next_wake_at` come back on every agent and are **written
by nothing** — exactly two writers touch the row and neither sets them. So
`status` reads `"idle"`, `wakes` reads `0`, and `next_wake_at` reads `null`
whether or not an alarm is armed. Do not build on them. `harness_sha256` *is*
stamped by the runtime and is real.

## Is an agent the right primitive?

| you want                                                                                          | use                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Work spanning hours or months that survives a restart, with an owner who wants to see what it did | **an agent**                                                                                                 |
| One request, one response, right now                                                              | [the LLM primitive](/docs/getting-started/llm) — a turn with tools and a ledger entry is overhead you do not need |
| To run *your own* commands in a micro-VM and read the output                                      | [a sandbox](/docs/getting-started/sandbox) — no model, no schedule, no budget of its own                          |
| Naïve's governed tools inside an agent framework you already run                                  | [MCP](/docs/mcp/overview)                                                                                         |

## Tenancy

`agents.create` refuses without a child project. The child project owns the vault
entries, the connections and the Account Kit that decide what the agent may
touch, so an agent with no owner has no credentials and no cap.

```ts theme={"theme":"css-variables"}
// The only way there is. `agents` lives on the SCOPED client — the root `Naive`
// has no `agents` namespace at all, so there is nothing unscoped to call.
await naive.forUser(user.id).agents.create({ /* … */ });
```

Over raw HTTP the company mount is reachable and answers:

```
400 invalid_input
"Creating an agent requires a child project. Address /v1/users/:user_id/agents,
 or select one with X-Naive-User-Id."
```

**The child project is the boundary, not the agent.** One child project owns many
agents, and a key scoped to it can read *both* their transcripts and delete
either one. If two agents must not see each other's work, give them separate
child projects. Reading another *company's* agent returns `404`, never `403`, so
an id is never confirmed to someone who should not have it.

## Next

<CardGroup cols={3}>
  <Card title="Quickstart" icon="rocket" href="/docs/agents/quickstart">
    API key to a running agent — SDK, CLI or cURL.
  </Card>

  <Card title="Concepts" icon="book" href="/docs/agents/concepts">
    Agent, task, completion window, sandbox, budget, schedule, event log, deliverable.
  </Card>

  <Card title="Pricing" icon="tag" href="/docs/agents/pricing">
    The six components, and what the window is measured to do.
  </Card>

  <Card title="SDK" icon="code" href="/docs/sdk/sub-clients/agents">
    All 22 methods.
  </Card>

  <Card title="CLI" icon="terminal" href="/docs/cli/agents">
    All 18 verbs.
  </Card>

  <Card title="API" icon="server" href="/docs/api-reference/agents/overview">
    All 20 routes.
  </Card>
</CardGroup>
