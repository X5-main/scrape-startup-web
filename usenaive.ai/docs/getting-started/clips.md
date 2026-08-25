> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Clipping

> Turn a long video into distribution-ready short-form clips with AI transcription, virality scoring, captions, and 9:16 reframing.

Video Clipping is the **repurposing primitive** for turning long-form video into short-form content. Submit a video URL (a direct file or a YouTube link) and a worker transcribes it, scores the most engaging segments, cuts them into clips, burns in captions, and — by default — reframes them to vertical 9:16. All jobs go through the unified jobs system, and credits are **metered per finished clip and input minute** at completion (never below twice the job's true cost).

## CLI First

```bash theme={"theme":"css-variables"}
# Auto-clip a long video (async — returns a job id). Vertical 9:16 by default.
naive video clip "https://example.com/podcast.mp4"

# Keep the original 16:9 aspect
naive video clip "https://youtube.com/watch?v=abc123" --aspect 16:9

# Check status of a clip job
naive video clip-status job-uuid-123
```

## Tools

| Tool                  | Type | Description                              | Cost                       |
| --------------------- | ---- | ---------------------------------------- | -------------------------- |
| `naive_clip_video`    | Core | Submit a video for auto-clipping (async) | Metered per input minute   |
| `naive_clip_status`   | Core | Check a clip job's status                | Free                       |
| `naive_video_compose` | Core | Mux a voiceover track onto a video       | Metered on output duration |

## Creating clips

`POST /v1/video/clip` submits a video for clipping. The only required field is `video_url` — a public `https` URL to a video no longer than 90 minutes (a direct file or a supported host such as YouTube).

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/video/clip \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "video_url": "https://example.com/podcast.mp4",
      "aspect_ratio": "9:16",
      "remove_silence": false
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/video/clip", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_url: "https://example.com/podcast.mp4",
      aspect_ratio: "9:16",
      remove_silence: false,
    }),
  });
  const job = await response.json();
  ```
</CodeGroup>

**Response (202):**

```json theme={"theme":"css-variables"}
{
  "job_id": "job-uuid",
  "status": "queued",
  "message": "Clip job queued"
}
```

### Parameters

| Param            | Type    | Required | Default  | Description                                                                         |
| ---------------- | ------- | -------- | -------- | ----------------------------------------------------------------------------------- |
| `video_url`      | string  | Yes      | —        | Public `https` URL to a video (≤ 90 min). Direct file or YouTube.                   |
| `aspect_ratio`   | string  | No       | `"9:16"` | Output ratio: `"9:16"` (vertical, face-tracked reframe) or `"16:9"` (keep original) |
| `remove_silence` | boolean | No       | `false`  | Trim silences from each clip (adds a small per-clip surcharge)                      |

<Info>
  Only one clip job may be in flight per account at a time. YouTube-source jobs also have a rolling 24-hour bandwidth ceiling to bound proxy cost.
</Info>

### Polling for completion

Clip extraction takes several minutes. Poll the job:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/video/clip/job-uuid \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/video/clip/job-uuid", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const status = await response.json();
  ```
</CodeGroup>

**Response (completed):**

```json theme={"theme":"css-variables"}
{
  "status": "completed",
  "result": {
    "clips": [
      {
        "title": "The Secret to Scaling",
        "url": "https://.../clip-1.mp4",
        "score": 87
      }
    ]
  },
  "credits_used": 13.2
}
```

<Info>
  Each finished clip is auto-ingested into your [Media Asset Manager](/docs/getting-started/media) with `source_type: "video_clipping"`. Use `naive media list --source video_clipping` or `GET /v1/media?source_type=video_clipping` to find them.
</Info>

## Cost

Clipping is **metered**, not a flat fee. The charge is built server-side from what the job actually produced: **1.6 credits per finished clip** plus **0.08 credits per input minute**, and never less than twice the job's own true cost (transcription audio-minutes, scoring tokens, per-clip re-encodes). On top of that sit the two opt-in extras — a flat **4 credits** for the 9:16 reframe pass and metered proxy bandwidth on YouTube sources. Credits are **charged on completion only**; failed or cancelled jobs cost nothing.

So a 15-minute upload that yields 5 vertical clips settles at \~13.2 credits ($0.66), and a 90-minute podcast yielding 20 clips at ~43.2 credits ($2.16) — under what Klap/Submagic/OpusClip charge for the same output.

Preview the pricing band with `GET /v1/video/pricing`.

## Error handling

| Error                  | Cause                                                              | Recovery                                                                          |
| ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `invalid_input`        | Missing/invalid `video_url` or bad `aspect_ratio`/`remove_silence` | Provide a public `https` `video_url`; `aspect_ratio` must be `"9:16"` or `"16:9"` |
| `insufficient_credits` | Not enough credits for the provisional hold                        | Top up with `naive billing topup`                                                 |
| `rate_limited`         | Daily YouTube proxy-bandwidth ceiling reached                      | Retry after 24h, or use a direct file URL (no proxy)                              |
| `provider_error`       | Upstream transcription/processing failed                           | Check the video URL and try again                                                 |

## Typical workflow

```
Agent task: "Turn this podcast into vertical Shorts"
    |
    +-- POST /v1/video/clip                       --> Submit video_url (9:16 default)
    |   --> job_id: job-uuid, status: queued
    |
    +-- GET /v1/video/clip/job-uuid               --> Poll every 30-60s
    |   --> status: queued -> completed
    |   --> clips[] ranked by score
    |
    +-- GET /v1/media?source_type=video_clipping  --> Auto-ingested to Media Assets
    |
    +-- POST /v1/social/posts                      --> Distribute the top clips
```
