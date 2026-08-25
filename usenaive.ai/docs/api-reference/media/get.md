> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Asset

> GET /v1/media/:id — Get details of a single media asset.

<ParamField path="id" type="string" required>
  UUID of the media asset
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/media/asset-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "asset-uuid",
    "upload_id": "job-job-uuid-1716201600000",
    "url": "https://submagic.pro/.../clip.mp4",
    "filename": "Best Moment.mp4",
    "content_type": "video/mp4",
    "size_bytes": 4521987,
    "thumbnail_url": null,
    "source_type": "video_clipping",
    "source_job_id": "job-uuid",
    "title": "Best Moment",
    "description": "Top clip from podcast episode",
    "tags": ["clip", "virality:95"],
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-20T10:30:00Z"
  }
  ```
</ResponseExample>
