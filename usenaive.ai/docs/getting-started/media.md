> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Media Asset Management

> Upload, organize, and manage media assets. Auto-populated from video clipping and generation jobs.

Media Asset Management is the **asset library primitive** for organizing all your company's media files — images, videos, clips, and generated content. Assets are auto-ingested when video clipping or video generation jobs complete, and can also be uploaded manually via URL or direct file upload.

## CLI First

```bash theme={"theme":"css-variables"}
# List all media assets
naive media list

# List only video clips
naive media list --source video_clipping

# Upload from a URL
naive media upload --url "https://cdn.example.com/hero.mp4" --title "Hero Video"

# Upload a local file
naive media upload --file ./campaign-video.mp4 --title "Campaign Video" --tags "campaign,q3"

# Get asset details
naive media get <asset_id>

# Update metadata
naive media update <asset_id> --title "Updated Title" --tags "edited,final"

# Delete an asset
naive media delete <asset_id>
```

## Tools

| Tool                     | Type | Description                           | Cost |
| ------------------------ | ---- | ------------------------------------- | ---- |
| `naive_media_list`       | Core | List and filter media assets          | Free |
| `naive_media_get`        | Core | Get a single asset by ID              | Free |
| `naive_media_upload_url` | Core | Upload media from a public URL        | Free |
| `naive_media_update`     | Core | Update asset title, description, tags | Free |
| `naive_media_delete`     | Core | Delete an asset                       | Free |

<Info>
  Direct file upload is available via the CLI (`naive media upload --file`) and the dashboard, but not as an MCP tool.
</Info>

## Listing Assets

The `naive_media_list` tool returns a paginated list of assets with optional filtering.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/media?source_type=video_clipping&limit=20 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```

  ```javascript Node.js theme={"theme":"css-variables"}
  const res = await fetch("https://api.usenaive.ai/v1/media?source_type=video_clipping&limit=20", {
    headers: { Authorization: "Bearer nv_sk_live_..." },
  });
  const { assets } = await res.json();
  ```
</CodeGroup>

### Filter Parameters

| Parameter     | Type   | Description                                                                    |
| ------------- | ------ | ------------------------------------------------------------------------------ |
| `source_type` | string | Filter by origin: `manual`, `video_clipping`, `video_generation`, `url_import` |
| `search`      | string | Search by title or filename (case-insensitive)                                 |
| `limit`       | number | Max results (default 50, max 100)                                              |
| `offset`      | number | Pagination offset                                                              |

## Uploading Assets

### From URL

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/media/upload/url \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://cdn.example.com/video.mp4",
    "title": "Product Demo",
    "tags": ["demo", "product"]
  }'
```

### Direct File Upload

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/media/upload/file \
  -H "Authorization: Bearer nv_sk_live_..." \
  -F "file=@./video.mp4" \
  -F "title=Campaign Video" \
  -F 'tags=["campaign","q3"]'
```

<Info>
  File uploads accept images and videos up to 100 MB. Files are stored on AWS S3 (private bucket; reads via short-lived presigned URLs).
</Info>

## Auto-Ingest from Jobs

When a **video clipping** or **video generation** job completes, results are automatically added to your media library:

* **Video Clipping**: Each extracted clip becomes a separate asset with `source_type: "video_clipping"`, tagged with `clip` and its virality score (e.g. `virality:91`)
* **Video Generation**: The generated video is added with the prompt as the title, `source_type: "video_generation"`, tagged with `generated` and the model name (e.g. `text-to-video`)

No manual action is needed — check your Media Asset Manager or call `naive media list` to see new assets. You can then create social posts directly from these assets using `upload_ids` on the social post API.

## Updating Assets

Update title, description, or tags on any asset:

```bash theme={"theme":"css-variables"}
curl -X PATCH https://api.usenaive.ai/v1/media/<asset_id> \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Final Cut - Hero Video",
    "description": "Approved version for social distribution",
    "tags": ["final", "approved", "hero"]
  }'
```

## Deleting Assets

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/media/<asset_id> \
  -H "Authorization: Bearer nv_sk_live_..."
```

## Cost

All media asset management operations are **free**. Storage is included with your plan. The only costs come from the upstream primitives that generate the assets (video clipping metered per finished clip and per input minute, video generation at variable cost).

## Error Handling

| Error                | Cause                                                | Fix                                   |
| -------------------- | ---------------------------------------------------- | ------------------------------------- |
| `resource_not_found` | Asset ID doesn't exist or belongs to another company | Verify the asset ID                   |
| `invalid_input`      | Missing required fields                              | Check required parameters             |
| `provider_error`     | URL upload failed (unreachable URL)                  | Verify the URL is publicly accessible |

## Typical Workflow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Video Clip   │────>│ Auto-ingest  │────>│ Media Asset      │
│ or Generate  │     │ to library   │     │ Manager          │
└─────────────┘     └──────────────┘     └──────────────────┘
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                              Tag & organize  Create post  Download
                              naive media     naive social  asset URL
                              update          post
```
