> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# video

> AI video generation and the model catalog.

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
// `model` is REQUIRED here (unlike images, which can route by default)
const job = await naive.video.generate({
  model: "google/veo-3",
  input: { prompt: "a drone shot over a harbour at dawn", duration: 8 },
});

await naive.video.status(job.job_id);
await naive.video.models();
```

| Method                       | HTTP                    | Notes                                                            |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------- |
| `generate({ model, input })` | `POST …/video/generate` | `model` is required. `input` is the model's own argument object. |
| `status(jobId)`              | `GET …/video/{jobId}`   | Status + result URL when finished.                               |
| `models()`                   | `GET …/video/models`    | Routable models.                                                 |

Per-user and AccountKit-gated by the `video` primitive. Generation is asynchronous and
expensive — poll here or through [jobs](/docs/sdk/sub-clients/jobs). For cutting an existing long
video into short-form clips, use [clips](/docs/sdk/sub-clients/clips) instead: it is a different
primitive with a different kit entry. See the [Video guide](/docs/getting-started/video).
