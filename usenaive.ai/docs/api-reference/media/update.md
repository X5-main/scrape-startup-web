> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Asset

> PATCH /v1/media/:id — Update media asset metadata.

<ParamField path="id" type="string" required>
  UUID of the media asset to update
</ParamField>

<ParamField body="title" type="string">
  New title
</ParamField>

<ParamField body="description" type="string">
  New description
</ParamField>

<ParamField body="tags" type="string[]">
  New tags (replaces existing tags)
</ParamField>

At least one field must be provided.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/media/asset-uuid \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Final Cut - Hero Video",
      "tags": ["final", "approved"]
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "asset-uuid",
    "upload_id": "url-1716201600000",
    "url": "https://bucket.s3.us-east-1.amazonaws.com/uploads/company-uuid/file-uuid.mp4",
    "filename": "hero-video.mp4",
    "content_type": "video/mp4",
    "size_bytes": 15234567,
    "thumbnail_url": null,
    "source_type": "url_import",
    "source_job_id": null,
    "title": "Final Cut - Hero Video",
    "description": null,
    "tags": ["final", "approved"],
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-20T10:30:00Z"
  }
  ```
</ResponseExample>

**Cost:** Free
