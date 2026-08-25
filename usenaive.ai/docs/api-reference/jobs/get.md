> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Job

> GET /v1/jobs/:id — Get details for a specific job.

<ParamField path="id" type="string" required>
  Job UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/jobs/job-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
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
    "error": null,
    "credits_used": 50,
    "provider_request_id": "req-123",
    "created_at": "2026-05-02T10:30:00Z",
    "started_at": "2026-05-02T10:30:01Z",
    "completed_at": "2026-05-02T10:31:02Z",
    "metadata": { "estimated_seconds": 60 }
  }
  ```
</ResponseExample>

## Result schema

For single-output media jobs (`image_generation`, `video_generation`) the response
carries two views of the output:

| Field    | Shape                                             | Use                                                                                                                                                                     |
| -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `media`  | `[{ "url": string, "type": "image" \| "video" }]` | **Preferred.** Flat, model-independent list. `media[0].url` is stable across image/video jobs and every model. Present (possibly `[]` until completion) for these jobs. |
| `result` | provider-native object                            | Raw provider payload with all fields (`result.images[].url`, `result.video.url`). Nesting **varies by model**; use `media` unless you need a provider-specific field.   |

Other job types omit `media`. `clip_generation` in particular returns several URLs
per clip (`download_url`, `direct_url`, `preview_url`) — read those from
`result.clips[]` directly rather than flattening to a single URL.
