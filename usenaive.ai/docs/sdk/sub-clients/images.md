> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# images

> AI image generation, model catalog, and stock search.

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
// Generate — long-running, returns a job you poll
const job = await naive.images.generate({
  model: "black-forest-labs/flux-1.1-pro",   // omit for the default route
  input: { prompt: "a red bicycle on a wet street, cinematic" },
});

// Poll by job id (the same id is also readable through `naive.jobs`)
await naive.images.status(job.job_id);

// Catalog + stock photography
await naive.images.models();
await naive.images.stock("mountain sunrise");
```

| Method                        | HTTP                        | Notes                                                      |
| ----------------------------- | --------------------------- | ---------------------------------------------------------- |
| `generate({ model?, input })` | `POST …/images/generate`    | `input` is the model's own argument object. Returns a job. |
| `status(jobId)`               | `GET …/images/{jobId}`      | Status + result URL when finished.                         |
| `models()`                    | `GET …/images/models`       | Routable models.                                           |
| `stock(query)`                | `GET …/images/stock?query=` | Stock-photo search.                                        |

Per-user and AccountKit-gated by the `images` primitive: `naive.images` (default user) or
`naive.forUser(id).images`. Generation is asynchronous — track completion here or through
[jobs](/docs/sdk/sub-clients/jobs). See the [Images guide](/docs/getting-started/images).
