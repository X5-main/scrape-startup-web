> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# cron

> Scheduled recurring jobs on the legacy orchestration runtime (frozen).

<Warning>
  **Deprecated — `cron` drives the legacy orchestration runtime.** It is FROZEN: every method
  keeps answering, nothing is removed, no response shape changes, and it accepts no new
  capabilities. Responses from `/v1/cron` also carry `Deprecation`, `Link rel="deprecation"`,
  `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.cron` headers — purely additive.

  **Use instead:** the durable runtime's schedule verbs,
  `POST /v1/teams/{team}/tenants/{tenant}/schedule` and
  `DELETE …/schedule/{id}` — reachable today from the CLI (`naive teams schedule` /
  `naive teams unschedule`). They are **not yet on this SDK's team handle**; see
  [Teams & the durable runtime](/docs/sdk/teams) for the current wiring table. There is **no sunset
  date**: `cron` is frozen, not scheduled for removal.
</Warning>

```ts theme={"theme":"css-variables"}
await naive.cron.create({
  schedule: "0 9 * * 1",                 // cron expression
  prompt: "Refresh rankings and summarize movement",
  name: "Weekly SEO report",
  // skill / skills / profileName optional
});

await naive.cron.list();
await naive.cron.update(id, { schedule: "0 8 * * 1" });
await naive.cron.trigger(id);  // run now
await naive.cron.pause(id);
await naive.cron.executions(id);
await naive.cron.remove(id);
```

Per-user and AccountKit-gated: `naive.cron` or `naive.forUser(id).cron`. A cron run executes in
the subject's legacy container, so a tenant must have one provisioned — a tenant on
`runtime.durable()` alone has nowhere for these jobs to run. See the
[Orchestration guide](/docs/getting-started/orchestration).
