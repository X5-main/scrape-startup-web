> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# media

> Upload, list, update, and delete media assets in the Media Asset Manager.

## Overview

| Command                            | Description                                      | Cost |
| ---------------------------------- | ------------------------------------------------ | ---- |
| `naive media list`                 | List media assets with optional filters          | Free |
| `naive media get <id>`             | Get a single asset by ID                         | Free |
| `naive media upload --url <url>`   | Upload media from a public URL                   | Free |
| `naive media upload --file <path>` | Upload a local file                              | Free |
| `naive media update <id>`          | Update asset metadata (title, description, tags) | Free |
| `naive media delete <id>`          | Delete a media asset                             | Free |

<Info>
  Assets are auto-populated when video clipping or video generation jobs complete. Use `--source video_clipping` or `--source video_generation` to filter by origin.
</Info>

***

## List Assets

List media assets with optional filtering by source type and text search.

```bash theme={"theme":"css-variables"}
naive media list
naive media list --source video_clipping
naive media list --search "hero" --limit 10
```

### Options

| Option             | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `--source <type>`  | Filter: `manual`, `video_clipping`, `video_generation`, `url_import` |
| `--search <query>` | Search by title or filename                                          |
| `--limit <n>`      | Max results (default 50, max 100)                                    |
| `--offset <n>`     | Pagination offset                                                    |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "media.list",
  "result": {
    "assets": [
      {
        "id": "uuid",
        "url": "https://...",
        "filename": "clip.mp4",
        "source_type": "video_clipping",
        "title": "Best Moment",
        "tags": ["clip", "virality:95"],
        "created_at": "2026-05-20T10:00:00Z"
      }
    ],
    "count": 1,
    "limit": 50,
    "offset": 0
  }
}
```

***

## Get Asset

Get full details of a single media asset.

```bash theme={"theme":"css-variables"}
naive media get <asset_id>
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "media.get",
  "result": {
    "id": "uuid",
    "url": "https://...",
    "filename": "clip.mp4",
    "content_type": "video/mp4",
    "size_bytes": 4521987,
    "source_type": "video_clipping",
    "source_job_id": "job-uuid",
    "title": "Best Moment",
    "description": null,
    "tags": ["clip", "virality:95"],
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-20T10:00:00Z"
  }
}
```

***

## Upload Asset

Upload a media asset from a URL or local file.

```bash theme={"theme":"css-variables"}
# From URL
naive media upload --url "https://cdn.example.com/video.mp4" --title "Hero Video"

# From file
naive media upload --file ./campaign.mp4 --title "Campaign" --tags "campaign,q3"
```

### Options

| Option                 | Description                  |
| ---------------------- | ---------------------------- |
| `--url <url>`          | Public URL of the media file |
| `--file <path>`        | Path to a local file         |
| `--title <title>`      | Asset title                  |
| `--description <desc>` | Asset description            |
| `--tags <tags>`        | Comma-separated tags         |

<Info>
  Provide either `--url` or `--file`, not both. File uploads accept images and videos up to 100 MB.
</Info>

***

## Update Asset

Update metadata on an existing asset.

```bash theme={"theme":"css-variables"}
naive media update <asset_id> --title "Final Version" --tags "final,approved"
```

### Options

| Option                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `--title <title>`      | New title                                |
| `--description <desc>` | New description                          |
| `--tags <tags>`        | Comma-separated tags (replaces existing) |

***

## Delete Asset

Permanently delete a media asset.

```bash theme={"theme":"css-variables"}
naive media delete <asset_id>
```

## Credit Behavior

All media management operations are free. Costs only apply to the upstream primitives that create assets (video clipping, video generation).
