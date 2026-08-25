> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Upload from URL

> POST /v1/media/upload/url — Upload a media asset from a public URL.

<ParamField body="url" type="string" required>
  Public URL of the media file (image or video)
</ParamField>

<ParamField body="title" type="string">
  Asset title
</ParamField>

<ParamField body="description" type="string">
  Asset description
</ParamField>

<ParamField body="tags" type="string[]">
  Tags for organizing the asset
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/media/upload/url \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://cdn.example.com/hero-video.mp4",
      "title": "Hero Video",
      "tags": ["hero", "campaign"]
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
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
    "title": "Hero Video",
    "description": null,
    "tags": ["hero", "campaign"],
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-20T10:00:00Z"
  }
  ```
</ResponseExample>

**Cost:** Free
