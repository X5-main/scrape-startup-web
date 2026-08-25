> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Jobs

> GET /v1/jobs — List async jobs for the current agent.

<ParamField query="status" type="string">
  Filter by status: `queued`, `processing`, `completed`, `failed`, `cancelled`
</ParamField>

<ParamField query="limit" type="number" default="20">
  Max jobs to return (max 100)
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/jobs?status=processing&limit=10" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "jobs": [
      {
        "id": "job-uuid",
        "type": "video_generation",
        "status": "processing",
        "progress": 45,
        "model": "fal-ai/kling-video/v3/pro/text-to-video",
        "created_at": "2026-05-02T10:30:00Z",
        "metadata": { "estimated_seconds": 60 }
      }
    ]
  }
  ```
</ResponseExample>
