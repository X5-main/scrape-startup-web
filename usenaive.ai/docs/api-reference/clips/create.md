> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Clips

> POST /v1/video/clip — Extract short-form clips from a YouTube video.

<ParamField body="youtube_url" type="string" required>
  YouTube video URL to extract clips from
</ParamField>

<ParamField body="title" type="string" required>
  Project title
</ParamField>

<ParamField body="language" type="string">
  Video language code (default: `"en"`)
</ParamField>

<ParamField body="template" type="string">
  Caption template name (default: `"Hormozi 2"`)
</ParamField>

<ParamField body="min_clip_length" type="number">
  Minimum clip length in seconds (default: 15)
</ParamField>

<ParamField body="max_clip_length" type="number">
  Maximum clip length in seconds (default: 60)
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/video/clip \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "youtube_url": "https://youtube.com/watch?v=abc123",
      "title": "Podcast Highlights",
      "language": "en",
      "min_clip_length": 15,
      "max_clip_length": 60
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  {
    "job_id": "job-uuid",
    "status": "queued",
    "type": "video_clipping",
    "estimated_seconds": 600,
    "estimated_credits": 40,
    "hint": "Poll GET /v1/video/clip/job-uuid or GET /v1/jobs/job-uuid. Clipping typically takes 5-10 minutes. Credits charged on completion only."
  }
  ```
</ResponseExample>

<Note>
  **The path is `/v1/video/clip`, singular.** The same router is also mounted per
  tenant user at `/v1/users/{user_id}/video/clips` — plural there — and that is the
  one `naive.clips.create()` calls. Both are served and both are in the spec. There
  is no bare `/v1/video/clips`.
</Note>

**Cost:** metered per finished clip and input minute, charged on completion only.
There is **no flat per-job fee** — the charge is 1.6 credits per finished clip plus
0.08 credits per input minute, floored at twice the job's own true cost (transcription
audio-hours, scoring tokens, per-clip re-encodes), plus a 4-credit reframe fee on 9:16
jobs and metered proxy bandwidth on YouTube sources. A 15-minute upload yielding 5
vertical clips settles at \~13.2 credits; a ninety-minute input with every option on is
tens of credits.

Submission is balance-checked against a provisional estimate, which is a start gate
and **not** the price: settlement bills the metered actuals and nothing else.

## Completed Result

When polling via `GET /v1/jobs/:id` or `GET /v1/video/clip/:jobId`:

```json theme={"theme":"css-variables"}
{
  "id": "job-uuid",
  "type": "video_clipping",
  "status": "completed",
  "result": {
    "clips": [
      {
        "id": "clip-uuid-1",
        "title": "The Secret to Scaling",
        "duration": 42,
        "virality_score": {
          "total": 87,
          "shareability": 82,
          "hook_strength": 91,
          "story_quality": 85,
          "emotional_impact": 90
        },
        "download_url": "https://...",
        "direct_url": "https://...",
        "preview_url": "https://..."
      }
    ],
    "clip_count": 5,
    "top_virality_score": 87
  },
  "credits_used": 13.2,
  "created_at": "2026-05-19T10:30:00Z",
  "completed_at": "2026-05-19T10:37:02Z"
}
```
