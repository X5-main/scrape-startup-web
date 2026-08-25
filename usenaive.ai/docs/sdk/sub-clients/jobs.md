> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# jobs

> Unified async job tracking (images, video, research, data tasks).

```ts theme={"theme":"css-variables"}
const { jobs } = await naive.jobs.list();
const job = await naive.jobs.get(jobId);   // { status, result, ... }
await naive.jobs.cancel(jobId);
```

Per-user: `naive.jobs` (default user) or `naive.forUser(id).jobs`. Long-running primitive calls (image/video generation, deep research) return a job id you poll here. See the [Jobs guide](/docs/getting-started/jobs).
