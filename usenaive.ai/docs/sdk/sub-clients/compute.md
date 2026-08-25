> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# compute

> Run Docker containers, background workers, and scheduled jobs on managed cloud compute.

```ts theme={"theme":"css-variables"}
// Long-running service (optional public URL via `port`)
const svc = await naive.compute.create({
  name: "bot",
  type: "service",
  image: "ghcr.io/me/bot:latest",
  port: 8080,
});

// Run-to-completion job + cron-for-code schedule
await naive.compute.create({ name: "ingest", type: "job", image: "me/etl:latest", command: ["python", "ingest.py"] });
await naive.compute.create({ name: "nightly", type: "schedule", image: "me/etl:latest", schedule_expr: "cron(0 9 * * ? *)" });

await naive.compute.list();
await naive.compute.get(svc.id);
await naive.compute.run(jobId);        // trigger a job/schedule now
await naive.compute.runs(jobId);
await naive.compute.logs(id, { limit: 200 });
await naive.compute.start(svc.id);     // wake a scaled-to-zero service
await naive.compute.stop(svc.id);      // scale to zero (stops billing)
await naive.compute.scale(svc.id, 3);

// Encrypted env vars (auto-redeploys the workload)
await naive.compute.setSecret(id, "OPENAI_API_KEY", "sk-...");
await naive.compute.listSecrets(id);

// One-off command, or an interactive shell session
await naive.compute.exec(id, "ls -la");
const session = await naive.compute.shell(id);   // { sessionId, streamUrl, tokenValue }

await naive.compute.destroy(id);
```

Per-user and AccountKit-gated: `naive.compute` (account default agent profile) or `naive.forUser(id).compute`. Three resource types — `service`, `job`, `schedule`. Billed by the second (vCPU + GB-seconds); a stopped service costs \~nothing. **Creating a workload and `exec`/`shell` are approval-gated by default** — an agent call may return `{ status: "pending_approval", approval_id }`. See the [Compute guide](/docs/getting-started/compute) and pair it with [queue](/docs/sdk/sub-clients/queue) for a worker pipeline.
