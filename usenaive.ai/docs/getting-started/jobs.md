> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Jobs

> Unified async job tracking for all long-running operations.

## CLI First

```bash theme={"theme":"css-variables"}
# List active jobs
naive jobs --status processing --limit 10

# Get one job
naive jobs get <job-id>

# Cancel a running job
naive jobs cancel <job-id>
```

## The Jobs System

All image/video generation operations and deep research go through a unified jobs system. The pattern is always:

1. **Submit** → get `job_id` (202 response)
2. **Poll** → check status via `GET /v1/jobs/:id`
3. **Complete** → job finishes, credits charged, result available

## Job Statuses

| Status       | Meaning                                  |
| ------------ | ---------------------------------------- |
| `queued`     | Submitted, waiting to start              |
| `processing` | Running (may include progress %)         |
| `completed`  | Done — result available, credits charged |
| `failed`     | Error — no credits charged               |
| `cancelled`  | Cancelled by user — no credits charged   |

## Listing Jobs

```bash theme={"theme":"css-variables"}
GET /v1/jobs?status=processing&limit=10
```

Filter by status: `queued`, `processing`, `completed`, `failed`, `cancelled`.

## Getting Job Details

```bash theme={"theme":"css-variables"}
GET /v1/jobs/:id
```

```json theme={"theme":"css-variables"}
{
  "id": "job-uuid",
  "type": "video_generation",
  "status": "completed",
  "progress": 100,
  "model": "fal-ai/kling-video/v3/pro/text-to-video",
  "result": {...},
  "error": null,
  "credits_used": 50,
  "provider_request_id": "req-123",
  "created_at": "2026-05-02T10:30:00Z",
  "started_at": "2026-05-02T10:30:01Z",
  "completed_at": "2026-05-02T10:31:02Z",
  "metadata": { "estimated_seconds": 60 }
}
```

## Cancelling a Job

```bash theme={"theme":"css-variables"}
DELETE /v1/jobs/:id
```

Only works for jobs in `queued` or `processing` state.

## Job Types

| Type               | Created By                                       |
| ------------------ | ------------------------------------------------ |
| `image_generation` | `POST /v1/images/generate`                       |
| `video_generation` | `POST /v1/video/generate`                        |
| `deep_research`    | `POST /v1/search/research` (thorough/exhaustive) |

## Convenience Aliases

Each primitive has its own status endpoint that filters to its job type:

* `GET /v1/images/:jobId` — same as `/v1/jobs/:id` but validates it's an image job
* `GET /v1/video/:jobId` — same as `/v1/jobs/:id` but validates it's a video job
