> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Compute

> Run your own Docker containers, background workers, and scheduled jobs on managed cloud compute — without ever holding a cloud key.

The **Compute** primitive runs agent-owned Docker workloads on managed cloud compute. You bring an image; Naïve owns the underlying cloud credentials and scopes every task to your tenant — your agents never hold a cloud key (the same model as [Apps](/docs/getting-started/apps)).

Three resource types:

* **`service`** — a long-running container (daemon, bot, webhook receiver, MCP server, custom API). Optional public HTTPS URL; scale to zero on demand with `stop`/`scale` (you only pay while running).
* **`job`** — a container that runs to completion once (ETL, backup, scrape, render).
* **`schedule`** — a job on a cron/rate expression ("cron for code"). Distinct from the [`cron`](/docs/getting-started/orchestration) primitive, which schedules AI agent prompts.

<Info>
  Creating a workload and opening a shell (`exec`/`ssh`) are **sensitive** — depending on the user's Account Kit they may require human approval (the call returns `status: "pending_approval"`). Compute is billed by running time in credits (`compute_usage`): `1.7 credits/vCPU-hour + 0.18 credits/GB-hour`; a service scaled to zero costs \~nothing.
</Info>

## Create a workload

```ts theme={"theme":"css-variables"}
// Long-running service with a public URL
const svc = await naive.compute.create({
  name: "bot",
  type: "service",
  image: "ghcr.io/me/bot:latest",
  port: 8080,
});

// One-off job, and a nightly scheduled job
await naive.compute.create({ name: "ingest", type: "job", image: "me/etl:latest", command: ["python", "ingest.py"] });
await naive.compute.create({ name: "nightly", type: "schedule", image: "me/etl:latest", schedule_expr: "cron(0 9 * * ? *)" });
```

Scope follows the client you hold: `naive.compute.*` (your default user) vs `naive.forUser(id).compute.*` (an end-user).

## Lifecycle, runs & logs

```ts theme={"theme":"css-variables"}
await naive.compute.list();
await naive.compute.run(jobId);          // trigger a job/schedule now
await naive.compute.runs(jobId);
await naive.compute.logs(id, { limit: 200 });
await naive.compute.stop(svc.id);        // scale a service to zero
await naive.compute.start(svc.id);
await naive.compute.scale(svc.id, 3);
```

## Secrets

Encrypted env vars are injected into the workload's tasks at start:

```ts theme={"theme":"css-variables"}
await naive.compute.setSecret(id, "OPENAI_API_KEY", "sk-...");
await naive.compute.listSecrets(id);
```

## Interactive shell

```bash theme={"theme":"css-variables"}
naive compute ssh <id>          # interactive shell into a running task
naive compute exec <id> "ls -la"  # one-off command
```

Shell access runs over a managed exec channel (no port 22, no keys). The CLI requires the `session-manager-plugin`, and the image must contain `/bin/sh`. Sessions are approval-gated and transcript-logged.

## CLI

```bash theme={"theme":"css-variables"}
naive compute create --name bot --type service --image ghcr.io/me/bot:latest --port 8080
naive compute run <id>
naive compute logs <id> --limit 200
naive compute ssh <id>
```

## Pair with a Queue

A compute `service` that long-polls a [Queue](/docs/getting-started/queue) (`naive queue receive` → process → `naive queue ack`) is a cheap autoscaling worker.
