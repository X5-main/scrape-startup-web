> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Assets

> GET /v1/media — List media assets with optional filters.

<ParamField query="source_type" type="string">
  Filter by origin: `manual`, `video_clipping`, `video_generation`, `url_import`
</ParamField>

<ParamField query="search" type="string">
  Search by title or filename (case-insensitive partial match)
</ParamField>

<ParamField query="limit" type="number" default="50">
  Maximum number of results (max 100)
</ParamField>

<ParamField query="offset" type="number" default="0">
  Pagination offset
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/media?source_type=video_clipping&limit=20 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "assets": [
      {
        "id": "asset-uuid",
        "upload_id": "job-job-uuid-1716201600000",
        "url": "https://submagic.pro/.../clip.mp4",
        "filename": "Best Moment.mp4",
        "content_type": "video/mp4",
        "size_bytes": null,
        "thumbnail_url": null,
        "source_type": "video_clipping",
        "source_job_id": "job-uuid",
        "title": "Best Moment",
        "description": null,
        "tags": ["clip", "virality:95"],
        "created_at": "2026-05-20T10:00:00Z",
        "updated_at": "2026-05-20T10:00:00Z"
      }
    ],
    "count": 1,
    "limit": 20,
    "offset": 0
  }
  ```
</ResponseExample>
