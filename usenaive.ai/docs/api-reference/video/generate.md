> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Generate Video

> POST /v1/video/generate — Submit a video generation job.

<ParamField body="model" type="string" required>
  Model ID (required — no default)
</ParamField>

<ParamField body="input" type="object" required>
  Model-specific parameters — all params supported. Must include `prompt`.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/video/generate \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "model": "fal-ai/kling-video/v3/pro/text-to-video",
      "input": {
        "prompt": "A golden retriever running on a beach at sunset",
        "duration": "5",
        "aspect_ratio": "16:9"
      }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  {
    "id": "job-uuid",
    "job_id": "job-uuid",
    "status": "queued",
    "type": "video_generation",
    "model": "fal-ai/kling-video/v3/pro/text-to-video",
    "estimated_seconds": 60,
    "estimated_credits": 22.4,
    "hint": "Poll GET /v1/jobs/job-uuid or GET /v1/video/job-uuid. Credits charged on completion only."
  }
  ```
</ResponseExample>

<Note>
  **Use `id`, not `job_id`.** The job identifier is returned as `id` on both submit
  and status, so the same field works for the whole lifecycle. `job_id` is a
  deprecated alias kept for backward compatibility; prefer `id`.
</Note>

**Cost:** Dynamic — model/duration-dependent. Preview with `GET /v1/video/pricing?model=<id>&duration=<s>`. Based on model costs at \$0.05/credit. Charged on completion only.

## Completed Result

When polling via `GET /v1/jobs/:id` or `GET /v1/video/:jobId`:

```json theme={"theme":"css-variables"}
{
  "id": "job-uuid",
  "type": "video_generation",
  "status": "completed",
  "progress": 100,
  "model": "fal-ai/kling-video/v3/pro/text-to-video",
  "media": [
    { "url": "https://fal.media/files/.../video.mp4", "type": "video" }
  ],
  "result": {
    "video": {
      "url": "https://fal.media/files/.../video.mp4",
      "content_type": "video/mp4",
      "file_size": 4521987
    }
  },
  "credits_used": 22.4,
  "created_at": "2026-05-02T10:30:00Z",
  "completed_at": "2026-05-02T10:31:02Z"
}
```

<Note>
  **Reading the output URL.** Use the flat `media` array — `media[0].url` is stable
  across image and video jobs and every model. The raw provider payload is still
  under `result` (`result.video.url`), but its nesting varies by model; `media[]`
  does not.
</Note>
