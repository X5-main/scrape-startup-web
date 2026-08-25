> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# social

> Social media — connect accounts, create posts, schedule content, view analytics.

Connect social accounts, then draft, schedule, publish and analyze posts from the CLI.
All commands return the standard JSON envelope (`success`, `action`, `result`,
`next_steps`, `hints`).

## Commands

| Command                                       | Description                              | Cost                                                                             |
| --------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| `naive social status`                         | Check activation and connected accounts  | Free                                                                             |
| `naive social activate`                       | Activate social media feature (one-time) | Free                                                                             |
| `naive social connect`                        | Get OAuth URL for a platform             | Free                                                                             |
| `naive social portal`                         | Get multi-platform portal URL            | Free                                                                             |
| `naive social accounts`                       | List connected accounts                  | Free                                                                             |
| `naive social label <account-id>`             | Set a label on an account                | Free                                                                             |
| `naive social disconnect <account-id>`        | Disconnect an account                    | Free                                                                             |
| `naive social sync`                           | Sync connected accounts                  | Free                                                                             |
| `naive social upload`                         | Upload media for posts                   | Free                                                                             |
| `naive social posts`                          | List posts                               | Free                                                                             |
| `naive social post <content>`                 | Create a new post (draft by default)     | 2.5 credits if publishing (+0.5 if targeting X, +5 if the X post carries a link) |
| `naive social get <post-id>`                  | Get post details                         | Free                                                                             |
| `naive social edit <post-id>`                 | Edit a draft post                        | Free                                                                             |
| `naive social delete <post-id>`               | Delete a post                            | Free                                                                             |
| `naive social publish <post-id>`              | Publish a draft post                     | 2.5 credits (+X surcharges)                                                      |
| `naive social analytics <post-id>`            | Get post analytics                       | Free                                                                             |
| `naive social comments <post-id>`             | Get post comments                        | Free                                                                             |
| `naive social account-analytics <account-id>` | Get account-level analytics              | Free                                                                             |

## Connecting accounts

```bash theme={"theme":"css-variables"}
naive social activate                                  # one-time setup
naive social connect --platform twitter                # single-platform OAuth URL
naive social portal --platforms twitter,youtube,tiktok # multi-platform portal URL
naive social sync                                      # refresh accounts after connecting
naive social accounts                                  # list connected accounts
```

`connect` requires `--platform` (TWITTER, LINKEDIN, INSTAGRAM, FACEBOOK, TIKTOK,
YOUTUBE, THREADS, PINTEREST, REDDIT, BLUESKY); both `connect` and `portal` accept
`--redirect-url <url>` (default: `https://dashboard.usenaive.ai`). The result contains
the URL to open; after connecting, run `naive social sync`.

Use `naive social label <account-id> --label "Company Brand"` to distinguish multiple
accounts on the same platform, and `naive social disconnect <account-id>` to remove one.

## Creating posts

Posts are created as **drafts** by default. Pass `--publish` to publish immediately, or
`--schedule-at` to schedule.

```bash theme={"theme":"css-variables"}
naive social post "Just shipped a major update!" --platforms twitter,linkedin
naive social post "New video is live!" --platforms youtube --media-url https://example.com/video.mp4 --youtube-type SHORT
naive social post "Coming soon..." --platforms twitter --schedule-at "2026-05-10T14:00:00Z"
naive social post "Check this out" --platforms twitter,linkedin --publish
naive social post "My take on this" --platforms reddit --platform-data '{"REDDIT":{"sr":"programming"}}'
naive social post "Hello world" --platforms twitter --account-ids acc-uuid-001,acc-uuid-002
```

| Flag                       | Required | Description                                                                                                      |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `content`                  | Yes      | Post content (positional argument)                                                                               |
| `--platforms <list>`       | Yes      | Comma-separated platforms: `twitter,linkedin,youtube,...`                                                        |
| `--publish`                | No       | Publish immediately (default: create as draft)                                                                   |
| `--title <title>`          | No       | Post title (auto-generated from content if omitted)                                                              |
| `--media-url <url>`        | No       | Media URL (auto-uploaded for video/image platforms)                                                              |
| `--upload-ids <ids>`       | No       | Comma-separated pre-uploaded media IDs (`bundle_upload_id` from Media Assets). Skips re-upload.                  |
| `--youtube-type <type>`    | No       | YouTube type: `SHORT` (vertical, under 3min) or `VIDEO` (landscape). No CLI default; service defaults to `SHORT` |
| `--platform-data <json>`   | No       | Per-platform overrides as JSON                                                                                   |
| `--account-ids <ids>`      | No       | Comma-separated account UUIDs to post from                                                                       |
| `--schedule-at <datetime>` | No       | ISO 8601 datetime to schedule the post                                                                           |

Example output (with `--publish`):

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "social.post",
  "result": {
    "id": "post-uuid-003",
    "post_id": "post-uuid-003",
    "status": "publishing",
    "platforms": ["TWITTER", "LINKEDIN"],
    "scheduled_at": null,
    "hint": "Post queued for immediate publishing. Check status with GET /v1/social/posts/post-uuid-003"
  },
  "next_steps": [
    { "command": "naive social get post-uuid-003", "description": "Check post status" },
    { "command": "naive social analytics post-uuid-003", "description": "View post analytics (after publishing)" }
  ],
  "hints": ["Post queued for publishing. 2.5 credits deducted."]
}
```

Media can also be uploaded ahead of time from a public URL:

```bash theme={"theme":"css-variables"}
naive social upload --url https://example.com/video.mp4
```

## Managing posts

```bash theme={"theme":"css-variables"}
naive social posts --status draft --limit 5      # filters: draft|scheduled|publishing|posted|failed; --limit, --offset
naive social get post-uuid-001                   # full details of one post
naive social edit post-uuid-002 --content "Updated content here"   # drafts only; also --platforms, --platform-data
naive social publish post-uuid-003               # publish a draft (2.5 credits)
naive social delete post-uuid-002                # posted posts are also deleted from the platform
```

## Analytics

```bash theme={"theme":"css-variables"}
naive social analytics post-uuid-001             # platform-specific performance data
naive social comments post-uuid-001              # comments on a posted post
naive social account-analytics acc-uuid-001      # account-level analytics
```

For a post that has not been posted yet, `analytics` is `null` and `comments` is `[]`,
each with a `hint` explaining why.

## Platform tips

| Platform      | Tip                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **YouTube**   | Use `--youtube-type SHORT` for Shorts (vertical, under 3min) or `VIDEO` for landscape uploads. No CLI default; service defaults to `SHORT`. |
| **TikTok**    | Privacy is auto-set to `PUBLIC_TO_EVERYONE`.                                                                                                |
| **Instagram** | Video posts default to Reel type. Provide media via `--media-url`.                                                                          |
| **Twitter**   | Content is auto-truncated to 280 characters.                                                                                                |
| **Bluesky**   | Content is auto-truncated to 300 characters.                                                                                                |
| **Reddit**    | Uses uppercase `REDDIT` key. Pass `--platform-data '{"REDDIT":{"sr":"yoursubreddit"}}'` to set the subreddit via the `sr` field.            |
| **Pinterest** | A `title` is auto-generated from content (first 100 chars).                                                                                 |

## Credits

Publishing costs **2.5 credits** per post (+0.5 if the post targets X, +5 if that X post
carries a link — X passes its own API charge through), deducted at publish time.
Drafts and every other command are free. Audit deductions with `naive usage`.
