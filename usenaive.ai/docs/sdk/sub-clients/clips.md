> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# clips

> Cut a long video into short-form clips.

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
const job = await naive.clips.create({
  url: "https://example.com/talk.mp4",
  // clip-count / aspect-ratio / caption options are passed through to the pipeline
});

await naive.clips.status(job.job_id);
```

| Method          | HTTP                        | Notes                                                         |
| --------------- | --------------------------- | ------------------------------------------------------------- |
| `create(body)`  | `POST …/video/clips`        | Queue a clipping job. Body is passed through to the pipeline. |
| `status(jobId)` | `GET …/video/clips/{jobId}` | Status + the produced clips when finished.                    |

<Note>
  `clips` is its **own primitive**, gated separately from `video` in the Account Kit, even
  though both live under the `/video` path prefix. Enabling `video` does not enable `clips`.
</Note>

The reframe / transcribe / renew / upload steps of the pipeline are worker-facing routes and
are deliberately **not** on this client. See the [Clips guide](/docs/getting-started/clips).
