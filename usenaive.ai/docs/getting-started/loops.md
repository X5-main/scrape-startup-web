> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Loops

> First-class recurring agent runs — a cron-source trigger bound to an agent, executed by the cloud sidecar.

<Snippet file="legacy-runtime.mdx" />

Loops execute on the legacy runtime's cloud sidecar. `naive loops` keeps working; new
recurring work is `naive teams schedule <team> "<cron>" "<goal>" --tenant <tu>`, which
answers `501 not_configured` on this API build until the durable scheduler lands — see
[Teams](/docs/getting-started/teams#what-answers-today). For a config-declared recurring
run, declare `agent({ loop: { cron, goal } })` in `naive.config.ts` — apply registers
it with the hosted runtime's cron scheduler; see
[the agent's loop](/docs/getting-started/teams#the-agents-loop--a-declared-cron-wake-up).

A **Loop** is a recurring agent run. It's a first-class object built on the
[trigger router](/docs/architecture/event-router): a `cron`-source subscription bound
to an agent run. Creating a Loop records the binding **and** creates the backing
cron job that executes it — the cloud sidecar cron.

## Create a loop

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/loops \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{
    "name": "Morning inbox triage",
    "schedule": "0 9 * * *",
    "prompt": "Review overnight email + SMS and summarize what needs my attention."
  }'
```

`schedule` is a standard cron expression. The response includes the loop
subscription and the `cron_job_id` of the backing executor (null if no runtime
is reachable yet — the binding still persists and syncs later).

## Manage loops

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/loops -H "Authorization: Bearer nv_sk_live_..."

# pause / resume
curl -X PATCH https://api.usenaive.ai/v1/loops/{id} \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{ "active": false }'

# run once, now
curl -X POST https://api.usenaive.ai/v1/loops/{id}/run \
  -H "Authorization: Bearer nv_sk_live_..."

# delete (also removes the backing cron job)
curl -X DELETE https://api.usenaive.ai/v1/loops/{id} \
  -H "Authorization: Bearer nv_sk_live_..."
```

## Loops vs. cron jobs

The lower-level [cron](/docs/cli/cron-jobs) API is a push-through to the runtime's
scheduler. A Loop is the governed, observable wrapper: it owns the binding
registry row, surfaces in the trigger delivery-status feed, and pauses/resumes
without touching the runtime directly.

## Billing

Free — each scheduled run bills as a normal agent run.
