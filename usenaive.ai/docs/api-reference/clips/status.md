> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Clips Status

> GET /v1/video/clip/:jobId — Check the status of a clip extraction job.

<ParamField path="jobId" type="string" required>
  Job UUID from the create clips response
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/video/clip/job-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "job-uuid",
    "type": "video_clipping",
    "status": "completed",
    "progress": 100,
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
</ResponseExample>

**Cost:** Free. This is a read-only status check.

## Status Values

| Status      | Meaning                                           |
| ----------- | ------------------------------------------------- |
| `queued`    | Submitted and processing (typically 5-10 minutes) |
| `completed` | Clips ready                                       |
| `failed`    | Processing failed (no credits deducted)           |
| `cancelled` | Job was cancelled                                 |

## Result Shapes

### Clip Extraction (`video_clipping`)

When complete, `result` contains:

| Field                | Type   | Description                                   |
| -------------------- | ------ | --------------------------------------------- |
| `clips`              | array  | Array of extracted clips with virality scores |
| `clip_count`         | number | Total number of clips extracted               |
| `top_virality_score` | number | Highest virality score among all clips        |

Each clip includes: `id`, `title`, `duration`, `virality_score` (with `total`, `shareability`, `hook_strength`, `story_quality`, `emotional_impact`), `download_url`, `direct_url`, `preview_url`.

## Also Available

The generic jobs endpoint `GET /v1/jobs/:id` also returns clip jobs. This endpoint validates that the job is a clipping type.
