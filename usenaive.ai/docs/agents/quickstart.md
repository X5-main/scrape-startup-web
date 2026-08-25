> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agents Quickstart

> Copy one file, run it, and you have a budgeted agent that answered you and told you what it cost.

You need an API key from the [dashboard](https://dashboard.usenaive.ai). Copy
this file, set `NAIVE_API_KEY`, run it.

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/node
```

```ts agent.ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/node";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// 1. An agent belongs to a child project — the credential boundary that owns its
//    vault entries and its Account Kit. `agents.create` refuses without one.
const user = await naive.users.create({ external_id: "alice_db_uuid" });
const client = naive.forUser(user.id);

// 2. `name`, a PINNED `model` and a full `budget` are required. Nothing else is.
const agent = await client.agents.create({
  name: "nightly-triage",
  model: "anthropic/claude-sonnet-4-5",
  instructions: "Triage the overnight error queue. One summary, newest first.",
  budget: {
    cap_micro_usd: 50_000_000,      // $50.00 — integer micro-USD, not cents
    period: "month",                // total | day | week | month | year
    max_task_micro_usd: 5_000_000,  // $5.00 — REQUIRED, not a default
  },
  tools: { web_search: true },
});

// 3. Send it work and read the answer.
const stream = await client.agents.sendMessage(agent.id, {
  text: "Summarise the last 24 hours of errors.",
});
console.log(stream.task_id);            // a real id, synchronously
console.log(await stream.text());       // the concatenated text_delta events
console.log((await stream.done()).status);  // "done"

// 4. Read what it cost.
const spend = await client.agents.spend(agent.id);
console.log(spend.spent_credits);       // "1.2500" — a decimal STRING; no arithmetic
console.log(spend.groups);              // every paid component, including the zeros
```

```bash theme={"theme":"css-variables"}
NAIVE_API_KEY=nv_sk_... npx tsx agent.ts
```

That is the whole primitive. Everything below is the same five calls through a
different door, plus the three things that will bite you.

## The same thing from a terminal

```bash theme={"theme":"css-variables"}
npm install -g @usenaive-sdk/cli
naive login

# Is the primitive live on this deployment, and which harness is serving?
naive agents status

# Scope every later command to a child project. Without this, `create` 400s.
naive users create --external-id alice_db_uuid
naive use <user-id>

naive agents create \
  --name nightly-triage \
  --model anthropic/claude-sonnet-4-5 \
  --instructions "Triage the overnight error queue. One summary, newest first." \
  --budget-usd 50 \
  --max-task-usd 5 \
  --web-search

# Stream it (NDJSON, one object per line) …
naive agents run <agent-id> "Summarise the last 24 hours of errors."
# … or queue it and walk away …
naive agents job <agent-id> "Summarise the last 24 hours of errors."
# … or tail a run that is already going.
naive agents logs <agent-id> --follow

naive agents spend <agent-id>
```

The CLI takes **dollars** and converts to micro-USD for you. `--max-task-usd`
defaults to a tenth of the cap if you omit it. `naive agents status` prints the
harness hash the **deployment** reported — not one the CLI computed — which is
how you tell two runs apart when the harness moved under them:

```
Configured: yes · reachable: yes
Agents: 0
Harness: sha-9f2c1b…
```

`naive agents spend` prints every component, including the zeros:

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

## The same thing over HTTP

```bash theme={"theme":"css-variables"}
export NAIVE_KEY=nv_sk_...
export USER_ID=<child-project-id>

# 1. Create
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{
    "name": "nightly-triage",
    "model": "anthropic/claude-sonnet-4-5",
    "instructions": "Triage the overnight error queue.",
    "budget": { "cap_micro_usd": 50000000, "period": "month", "max_task_micro_usd": 5000000 },
    "tools": { "web_search": true }
  }'
# → 201 { "agent": { "id": "…", … } }

# 2. Send work — 202 means DURABLY QUEUED
curl -X POST https://api.usenaive.ai/v1/users/$USER_ID/agents/<id>/tasks \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "text": "Summarise the last 24 hours of errors." }'
# → 202 { "task": { "id": "…", "status": "queued", "source": "api", … } }

# 3. Stream it instead — the SAME route, decided by Accept
curl -N https://api.usenaive.ai/v1/users/$USER_ID/agents/<id>/tasks \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{ "text": "Summarise the last 24 hours of errors." }'

# 4. Spend
curl https://api.usenaive.ai/v1/users/$USER_ID/agents/<id>/spend \
  -H "Authorization: Bearer $NAIVE_KEY"
```

## The three things that will bite you

<AccordionGroup>
  <Accordion title="The model must be pinned">
    `anthropic/claude-sonnet-4-5`, never `anthropic/claude-latest` or a bare family
    name. `auto`, `best`, `latest`, `default` and `preview` are refused with
    `invalid_input`. An alias resolves differently on two days, which makes two runs
    of the same agent incomparable.
  </Accordion>

  <Accordion title="Both budget numbers are required, and they fail differently">
    `cap_micro_usd` **and** `max_task_micro_usd` are mandatory — an agent with no cap
    is not creatable, and a cap with no per-task ceiling is one runaway task away
    from being the whole cap.

    They are not the same control. Crossing the **cap** parks the task as `braked`; it
    resumes at the period reset, or the moment you raise the cap. Crossing the
    **per-task ceiling** *ends* the task `failed` and non-retryable, because a
    per-task ceiling never resets. Set it to what you would accept losing on one bad
    task.

    ```ts theme={"theme":"css-variables"}
    await client.agents.update(agent.id, {
      budget: { cap_micro_usd: 100_000_000, period: "month", max_task_micro_usd: 5_000_000 },
    });
    ```

    `budget` on update is a full replacement, never a merge.
  </Accordion>

  <Accordion title="`completion_window` is served on GLM-5.2 only">
    `asap` is the default and works on every model. `standard` and `flex` are served
    only on `zai-org/GLM-5.2-FP8`; anywhere else they **fail** with
    `window_unavailable` (400) rather than being downgraded — and the refusal lands
    at the **first model call**, not at `create`, before a provider is chosen, so a
    refused turn spends nothing. Refusing is the point: a window quietly served as
    `asap` would report a discount nobody bought. If you are not on that model,
    leave the window alone.

    A task that omits `window` inherits its agent's `completion_window` rather than
    falling back to `asap`. See [Pricing](/docs/agents/pricing).
  </Accordion>
</AccordionGroup>

<Warning>
  **`status` is not live yet.** It is returned on every agent and written by
  nothing, so it reads `"idle"` regardless of what the agent is doing. Use the task
  record and the event log instead — those are real.

  `next_wake_at` and `wakes` are live: they carry the alarm the runtime actually
  holds, refreshed on every single-agent `GET`.
</Warning>

## Next

<CardGroup cols={3}>
  <Card title="Give it a schedule" icon="clock" href="/docs/agents/scheduled">
    Wake it every morning without sending anything.
  </Card>

  <Card title="Give it a URL" icon="webhook" href="/docs/agents/inbound-webhooks">
    Let Stripe, GitHub or Linear wake it.
  </Card>

  <Card title="Give it a sandbox" icon="terminal" href="/docs/agents/sandbox">
    Let it write code and run the tests.
  </Card>
</CardGroup>
