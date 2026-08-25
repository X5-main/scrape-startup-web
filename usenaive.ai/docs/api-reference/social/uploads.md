> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Uploads

> GET /v1/social/uploads — List media files uploaded by the company for social posting.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/social/uploads?limit=20" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "uploads": [
      {
        "id": "uuid",
        "upload_id": "upload-id",
        "url": "https://cdn.usenaive.ai/uploads/file.mp4",
        "filename": "demo-video.mp4",
        "content_type": "video/mp4",
        "size_bytes": null,
        "thumbnail_url": null,
        "created_at": "2026-05-19T12:00:00.000Z"
      }
    ],
    "count": 1,
    "limit": 20,
    "offset": 0
  }
  ```
</ResponseExample>

Returns media files uploaded through `POST /v1/social/upload`. Each upload is tracked locally and can be referenced by `upload_ids` in posts.

### Query Parameters

| Param    | Type   | Default | Description                 |
| -------- | ------ | ------- | --------------------------- |
| `limit`  | number | 50      | Max results (capped at 100) |
| `offset` | number | 0       | Pagination offset           |
