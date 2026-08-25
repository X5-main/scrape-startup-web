> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Upload File

> POST /v1/media/upload/file — Upload a media file directly (multipart).

Send as `multipart/form-data`.

<ParamField body="file" type="file" required>
  The media file to upload (image or video, max 100 MB)
</ParamField>

<ParamField body="title" type="string">
  Asset title
</ParamField>

<ParamField body="description" type="string">
  Asset description
</ParamField>

<ParamField body="tags" type="string">
  JSON array of tags as a string, e.g. `["tag1", "tag2"]`
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/media/upload/file \
    -H "Authorization: Bearer nv_sk_live_..." \
    -F "file=@./campaign-video.mp4" \
    -F "title=Campaign Video" \
    -F 'tags=["campaign","q3"]'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "asset-uuid",
    "upload_id": "local-1716201600000",
    "url": "https://bucket.s3.us-east-1.amazonaws.com/uploads/company-uuid/file-uuid.mp4",
    "filename": "campaign-video.mp4",
    "content_type": "video/mp4",
    "size_bytes": 15234567,
    "thumbnail_url": null,
    "source_type": "manual",
    "source_job_id": null,
    "title": "Campaign Video",
    "description": null,
    "tags": ["campaign", "q3"],
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-20T10:00:00Z"
  }
  ```
</ResponseExample>

**Cost:** Free (storage included)
