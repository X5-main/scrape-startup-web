> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Social Media

> Post to 10+ social platforms — connect accounts, create posts, schedule content, and track analytics.

Social is the **distribution primitive**. Naive wraps social infrastructure behind a consistent API so agents can connect social media accounts, create and publish posts across multiple platforms, schedule content, and retrieve analytics — all without custom OAuth flows or frontend components.

## CLI First

```bash theme={"theme":"css-variables"}
# Activate and connect a platform
naive social activate
naive social connect --platform twitter --redirect-url https://your-app.com/callback

# Create and publish a post
naive social post "Launching our new product today" --platforms twitter,linkedin --publish
```

## Tools

| Tool                             | Type  | Description                               | Cost                                                                                 |
| -------------------------------- | ----- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `naive_social_activate`          | Setup | Activate social media for the company     | Free                                                                                 |
| `naive_social_connect`           | Setup | Get OAuth URL for a single platform       | Free                                                                                 |
| `naive_social_portal`            | Setup | Get portal URL for multi-platform connect | Free                                                                                 |
| `naive_social_status`            | Info  | Check activation + connected accounts     | Free                                                                                 |
| `naive_social_accounts`          | Info  | List connected accounts                   | Free                                                                                 |
| `naive_social_sync`              | Info  | Sync connected accounts                   | Free                                                                                 |
| `naive_social_label`             | Setup | Set a label on a connected account        | Free                                                                                 |
| `naive_social_create_post`       | Core  | Create and optionally publish a post      | 2.5 credits (+0.5 if it targets X, +5 if that X post contains a link), if publishing |
| `naive_social_publish_post`      | Core  | Publish a draft                           | 2.5 credits (+0.5 if it targets X, +5 if that X post contains a link)                |
| `naive_social_upload`            | Core  | Upload media from URL                     | Free                                                                                 |
| `naive_social_list_posts`        | Info  | List posts with status filter             | Free                                                                                 |
| `naive_social_get_post`          | Info  | Get post details                          | Free                                                                                 |
| `naive_social_edit_post`         | Core  | Edit a draft post                         | Free                                                                                 |
| `naive_social_delete_post`       | Core  | Delete a post                             | Free                                                                                 |
| `naive_social_post_analytics`    | Info  | Get post performance metrics              | Free                                                                                 |
| `naive_social_post_comments`     | Info  | Get post comments                         | Free                                                                                 |
| `naive_social_account_analytics` | Info  | Get account-level analytics               | Free                                                                                 |
| `naive_social_disconnect`        | Setup | Disconnect an account                     | Free                                                                                 |

## Dashboard Connection UI

In the [naive dashboard](https://dashboard.usenaive.ai), navigate to **Primitives > Social** to connect accounts visually. The page:

* Auto-activates social media on first visit
* Shows a grid of connected accounts with platform icons and status
* Provides per-platform "Connect" buttons that open OAuth in a new tab
* Allows disconnecting accounts directly from the UI
* Syncs accounts automatically to pick up new connections

## Activation

Before posting, social media must be activated for the company.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/activate \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/activate", {
    method: "POST",
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const result = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "activated": true,
  "team_count": 1,
  "team_id": "team-uuid"
}
```

## Connecting Accounts

The API returns an OAuth URL. The user or agent opens this URL in a browser to authorize the social account. No custom frontend is needed.

### Single Platform

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/connect \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"platform": "TWITTER", "redirect_url": "https://your-app.com/callback"}'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/connect", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "TWITTER",
      redirect_url: "https://your-app.com/callback",
    }),
  });
  const { url } = await response.json();
  // Open `url` in a browser for the user to authorize
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "url": "https://social.usenaive.ai/connect/twitter?..."
}
```

### Multi-Platform Portal

For connecting several platforms at once, use the portal endpoint:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/portal \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"redirect_url": "https://your-app.com/callback"}'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/portal", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ redirect_url: "https://your-app.com/callback" }),
  });
  const { url } = await response.json();
  ```
</CodeGroup>

After the user connects accounts, call `POST /v1/social/sync` to refresh the local account list.

## Creating Posts

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/posts \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Check out our latest product update!",
      "platforms": ["TWITTER", "LINKEDIN"],
      "publish_now": true
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/posts", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "Check out our latest product update!",
      platforms: ["TWITTER", "LINKEDIN"],
      publish_now: true,
    }),
  });
  const post = await response.json();
  ```
</CodeGroup>

**Response (202):**

```json theme={"theme":"css-variables"}
{
  "id": "post-uuid",
  "post_id": "post-uuid",
  "status": "publishing",
  "platforms": ["TWITTER", "LINKEDIN"],
  "scheduled_at": null,
  "hint": "Post queued for immediate publishing. Check status with GET /v1/social/posts/post-uuid"
}
```

### Parameters

| Param           | Type      | Required | Default           | Description                                                             |
| --------------- | --------- | -------- | ----------------- | ----------------------------------------------------------------------- |
| `content`       | string    | Yes      | —                 | Post text content                                                       |
| `title`         | string    | No       | Auto from content | Post title (auto-generated if omitted)                                  |
| `platforms`     | string\[] | Yes      | —                 | Platforms to post to                                                    |
| `platform_data` | object    | No       | Auto-generated    | Per-platform overrides (see Platform Defaults below)                    |
| `media_urls`    | string\[] | No       | —                 | Media URLs — auto-uploaded and attached to video/image platforms        |
| `youtube_type`  | string    | No       | `"SHORT"`         | YouTube type: `"SHORT"` (vertical, under 3min) or `"VIDEO"` (landscape) |
| `publish_now`   | boolean   | No       | `false`           | Publish immediately                                                     |
| `scheduled_at`  | string    | No       | —                 | ISO 8601 datetime to schedule                                           |
| `account_ids`   | string\[] | No       | All active        | Specific account UUIDs to post from                                     |

<Info>
  If neither `publish_now` nor `scheduled_at` is set, the post is created as a **draft**. Drafts can be edited and published later with `POST /v1/social/posts/:id/publish`.
</Info>

### Video Post Example (YouTube + TikTok)

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/posts \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Our product demo",
      "platforms": ["YOUTUBE", "TIKTOK", "INSTAGRAM"],
      "media_urls": ["https://example.com/demo-video.mp4"],
      "youtube_type": "SHORT",
      "publish_now": true
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/posts", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "Our product demo",
      platforms: ["YOUTUBE", "TIKTOK", "INSTAGRAM"],
      media_urls: ["https://example.com/demo-video.mp4"],
      youtube_type: "SHORT",
      publish_now: true,
    }),
  });
  const post = await response.json();
  ```
</CodeGroup>

## Platform Defaults

When you omit `platform_data`, the API applies sensible defaults per platform. You can override any field by passing `platform_data`.

| Platform      | Auto-applied defaults                                                                    | Notes                                                  |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **TWITTER**   | `text` truncated to 280 chars                                                            | Text-only platform                                     |
| **BLUESKY**   | `text` truncated to 300 chars                                                            | Text-only platform                                     |
| **YOUTUBE**   | `text` (100 char title), `type` (SHORT/VIDEO), `privacy: "PUBLIC"`, `madeForKids: false` | Requires media. `youtube_type` controls SHORT vs VIDEO |
| **TIKTOK**    | `text`, `privacy: "PUBLIC_TO_EVERYONE"`                                                  | Requires media for video posts                         |
| **INSTAGRAM** | `text`, `type: "REEL"`                                                                   | Defaults to Reel for video                             |
| **REDDIT**    | `text`, `title` (100 char limit)                                                         | Pass `"sr"` in platform\_data for subreddit            |
| **PINTEREST** | `title` (100 char limit), `text`                                                         | Media recommended                                      |
| **LINKEDIN**  | `text` (full content)                                                                    | No truncation                                          |
| **FACEBOOK**  | `text` (full content)                                                                    | No truncation                                          |
| **THREADS**   | `text` (full content)                                                                    | No truncation                                          |
| **MASTODON**  | `text` (full content)                                                                    | No truncation                                          |

### Overriding Defaults

Pass `platform_data` to customize per-platform behavior:

```json theme={"theme":"css-variables"}
{
  "content": "Check out our launch",
  "platforms": ["TWITTER", "REDDIT", "YOUTUBE"],
  "platform_data": {
    "REDDIT": { "sr": "startups", "title": "We just launched!" },
    "YOUTUBE": { "text": "Product Launch Demo", "type": "VIDEO", "privacy": "PUBLIC" }
  },
  "media_urls": ["https://example.com/launch.mp4"],
  "publish_now": true
}
```

<Warning>
  Overrides are **merged** on top of defaults — you only need to specify the fields you want to change.
</Warning>

## Media Handling

There are two ways to attach media to a post:

### Option 1: `media_urls` (auto-upload)

When `media_urls` are provided, the server downloads and uploads each URL to the social media service, then attaches them to media-capable platforms (YouTube, Instagram, TikTok, Facebook, Pinterest). Text-only platforms are unaffected.

### Option 2: `upload_ids` (pre-uploaded media)

If you've already uploaded media via `POST /v1/social/upload` or have assets in the [Media Asset Manager](/docs/getting-started/media), pass their Bundle upload IDs directly using `upload_ids`. This avoids re-uploading and prevents duplicate assets.

```json theme={"theme":"css-variables"}
{
  "content": "Check out this clip!",
  "platforms": ["YOUTUBE"],
  "upload_ids": ["upload-id-from-asset"],
  "publish_now": true
}
```

<Info>
  The Media Asset Manager returns `upload_id` on each asset — use this value in `upload_ids` when creating posts from assets in your library.
</Info>

## Scheduling & Drafts

<Tabs>
  <Tab title="Draft">
    Omit both `publish_now` and `scheduled_at` to create a draft:

    ```json theme={"theme":"css-variables"}
    {
      "content": "Working on this post...",
      "platforms": ["TWITTER"]
    }
    ```

    Edit with `PATCH /v1/social/posts/:id`, then publish with `POST /v1/social/posts/:id/publish`.
  </Tab>

  <Tab title="Publish Now">
    Set `publish_now: true` to post immediately:

    ```json theme={"theme":"css-variables"}
    {
      "content": "Live now!",
      "platforms": ["TWITTER", "LINKEDIN"],
      "publish_now": true
    }
    ```
  </Tab>

  <Tab title="Schedule">
    Set `scheduled_at` to an ISO 8601 datetime:

    ```json theme={"theme":"css-variables"}
    {
      "content": "Launching tomorrow!",
      "platforms": ["TWITTER"],
      "scheduled_at": "2026-05-10T14:00:00Z"
    }
    ```
  </Tab>
</Tabs>

## Analytics

Retrieve performance metrics for published posts:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/social/posts/post-uuid/analytics \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/social/posts/post-uuid/analytics", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const { post_id, analytics } = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "post_id": "post-uuid",
  "analytics": { ... }
}
```

<Info>
  Analytics data varies by platform. The shape depends on which platforms the post was published to.
</Info>

Account-level analytics:

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/social/accounts/account-uuid/analytics \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Supported Platforms

| Platform  | Key         | Type                 | Character Limit |
| --------- | ----------- | -------------------- | --------------- |
| Twitter/X | `TWITTER`   | Text + media         | 280             |
| LinkedIn  | `LINKEDIN`  | Text + media         | —               |
| Instagram | `INSTAGRAM` | Media (Reel default) | —               |
| Facebook  | `FACEBOOK`  | Text + media         | —               |
| TikTok    | `TIKTOK`    | Video                | —               |
| YouTube   | `YOUTUBE`   | Video (SHORT/VIDEO)  | 100 (title)     |
| Threads   | `THREADS`   | Text                 | —               |
| Pinterest | `PINTEREST` | Media + title        | 100 (title)     |
| Reddit    | `REDDIT`    | Text + title         | 100 (title)     |
| Bluesky   | `BLUESKY`   | Text                 | 300             |
| Mastodon  | `MASTODON`  | Text                 | —               |

## Error Handling

| Error                    | Cause                               | Recovery                             |
| ------------------------ | ----------------------------------- | ------------------------------------ |
| `feature_not_configured` | Social provider credentials not set | Configure the API key                |
| `invalid_input`          | Social not activated                | Call `POST /v1/social/activate`      |
| `invalid_input`          | Missing required fields             | Check content, platforms params      |
| `resource_not_found`     | Post or account not found           | Verify UUID                          |
| `insufficient_credits`   | Not enough credits to publish       | Top up with `POST /v1/billing/topup` |
| `provider_error`         | Social media service error          | Retry or check platform requirements |

## Typical Workflow

```
Agent receives task: "Post about our product launch on Twitter and LinkedIn"
    │
    ├─ GET /v1/social/status                     → Check activation
    │   → activated: true, 3 accounts
    │
    ├─ GET /v1/social/accounts                   → List connected accounts
    │   → Twitter, LinkedIn, Instagram connected
    │
    ├─ POST /v1/social/posts                     → Create + publish
    │   { content: "We just launched...",
    │     platforms: ["TWITTER", "LINKEDIN"],
    │     publish_now: true }
    │   → id: post-uuid, status: scheduled
    │
    ├─ GET /v1/social/posts/post-uuid            → Check status
    │   → status: publishing → posted (via webhook)
    │
    └─ GET /v1/social/posts/post-uuid/analytics  → Track performance
        → { impressions: 1200, likes: 45, ... }
```
