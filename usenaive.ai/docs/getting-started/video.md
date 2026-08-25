> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Generation

> Generate video — text-to-video and image-to-video using models like Kling, Minimax, and Wan.

Video is the **creation primitive** for moving content. Naive exposes video generation models behind a consistent async interface — text-to-video for scripted content and image-to-video for animating stills. All jobs go through the unified jobs system with credits billed on completion.

## CLI First

```bash theme={"theme":"css-variables"}
# Generate video and wait for completion
naive video generate --model fal-ai/kling-video/v3/pro/text-to-video "A golden retriever running on a beach at sunset" --duration 5 --wait

# See available models
naive video models
```

## Tools

| Tool                   | Type | Description                                | Cost                               |
| ---------------------- | ---- | ------------------------------------------ | ---------------------------------- |
| `naive_generate_video` | Core | Generate video from text or image (async)  | Dynamic (model/duration-dependent) |
| `naive_video_models`   | Core | List all available video generation models | Free                               |
| `naive_video_status`   | Core | Check status of a video generation job     | Free                               |

## Generating Video

The `naive_generate_video` tool submits an async video generation job. A model is **required** — there is no default. The `input` object supports all model-specific parameters.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/video/generate \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "fal-ai/kling-video/v3/pro/text-to-video",
      "input": {
        "prompt": "A golden retriever running on a beach at sunset, cinematic slow motion",
        "duration": "5",
        "aspect_ratio": "16:9"
      }
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/video/generate", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "fal-ai/kling-video/v3/pro/text-to-video",
      input: {
        prompt: "A golden retriever running on a beach at sunset, cinematic slow motion",
        duration: "5",
        aspect_ratio: "16:9",
      },
    }),
  });
  const job = await response.json();
  ```
</CodeGroup>

**Response (202):**

```json theme={"theme":"css-variables"}
{
  "job_id": "job-uuid",
  "status": "queued",
  "type": "video_generation",
  "model": "fal-ai/kling-video/v3/pro/text-to-video",
  "estimated_seconds": 60,
  "estimated_credits": 22.4,
  "hint": "Poll GET /v1/jobs/job-uuid or GET /v1/video/job-uuid. Credits charged on completion only."
}
```

### Parameters

| Param             | Type    | Required | Default  | Description                                          |
| ----------------- | ------- | -------- | -------- | ---------------------------------------------------- |
| `prompt`          | string  | Yes      | —        | Text description of the video                        |
| `duration`        | string  | No       | `"5"`    | Video length: `"5"` or `"10"` seconds (Kling models) |
| `aspect_ratio`    | string  | No       | `"16:9"` | Output ratio: `"16:9"`, `"9:16"`, `"1:1"`            |
| `image_url`       | string  | No       | —        | Source image for image-to-video models               |
| `cfg_scale`       | number  | No       | 0.5      | Guidance strength 0–1 (higher = more literal)        |
| `negative_prompt` | string  | No       | —        | What to avoid in the video                           |
| `generate_audio`  | boolean | No       | true     | Enable native audio (Kling v3 only)                  |

### Polling for Completion

Video generation takes 30-120 seconds. Poll the job:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/video/job-uuid \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/video/job-uuid", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const status = await response.json();
  ```
</CodeGroup>

**Response (completed):**

```json theme={"theme":"css-variables"}
{
  "status": "completed",
  "result": {
    "video": {
      "url": "https://fal.media/files/.../video.mp4",
      "content_type": "video/mp4",
      "file_size": 4521987
    }
  },
  "credits_used": 22.4
}
```

<Info>
  Poll every 15-30 seconds. The `progress` field (0-100) shows generation percentage when available.
</Info>

### Cost

Video pricing is **dynamic** — based on the model's per-second cost, converted to credits at \$0.05/credit. Preview costs:

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/video/pricing?model=fal-ai/kling-video/v3/pro/text-to-video&duration=5" \
  -H "Authorization: Bearer nv_sk_your_key"
```

```json theme={"theme":"css-variables"}
{
  "model": "fal-ai/kling-video/v3/pro/text-to-video",
  "duration": 5,
  "estimated_credits": 22.4,
  "unit_price_usd": 0.112,
  "credit_value_usd": 0.05
}
```

## Available Models

Use `GET /v1/video/models` for the full dynamically-fetched list. Common models:

| Model                                          | Mode           | Best For                      |
| ---------------------------------------------- | -------------- | ----------------------------- |
| `fal-ai/kling-video/v3/pro/text-to-video`      | text-to-video  | Highest quality, native audio |
| `fal-ai/kling-video/v3/pro/image-to-video`     | image-to-video | Animate still images          |
| `fal-ai/kling-video/v3/standard/text-to-video` | text-to-video  | Good quality, faster          |
| `fal-ai/minimax-video/video-01-live`           | text-to-video  | Fast generation               |
| `fal-ai/wan/v2.7/text-to-video`                | text-to-video  | High resolution options       |

## Text-to-Video vs Image-to-Video

<Tabs>
  <Tab title="Text-to-Video">
    Generate entirely from a text prompt:

    ```json theme={"theme":"css-variables"}
    {
      "model": "fal-ai/kling-video/v3/pro/text-to-video",
      "input": {
        "prompt": "A timelapse of a flower blooming in a garden",
        "duration": "5",
        "aspect_ratio": "16:9"
      }
    }
    ```

    Best for: product demos, abstract animations, scripted content.
  </Tab>

  <Tab title="Image-to-Video">
    Animate a still image with optional prompt guidance:

    ```json theme={"theme":"css-variables"}
    {
      "model": "fal-ai/kling-video/v3/pro/image-to-video",
      "input": {
        "image_url": "https://example.com/product-photo.jpg",
        "prompt": "Slow zoom in with gentle parallax effect",
        "duration": "5"
      }
    }
    ```

    Best for: product shots, hero images, adding motion to existing assets.
  </Tab>
</Tabs>

## Error Handling

| Error                  | Cause                                  | Recovery                                           |
| ---------------------- | -------------------------------------- | -------------------------------------------------- |
| `insufficient_credits` | Not enough credits for generation      | Preview cost with `/v1/video/pricing`, then top up |
| `provider_error`       | AI model provider rejected the request | Check model parameters against `/v1/video/models`  |
| `invalid_model`        | Model ID not recognized                | Use `GET /v1/video/models` for valid IDs           |

## Typical Workflow

```
Agent receives task: "Create a product demo video"
    │
    ├─ GET /v1/video/models                    → List available models
    │   → 8 models available
    │
    ├─ GET /v1/video/pricing?model=...&dur=5   → Preview cost
    │   → estimated_credits: 22.4
    │
    ├─ POST /v1/video/generate                 → Submit generation job
    │   { model: "fal-ai/kling-video/v3/pro/text-to-video",
    │     input: { prompt: "Product showcase...", duration: "5" } }
    │   → job_id: job-uuid
    │
    ├─ GET /v1/video/job-uuid                  → Poll every 15-30s
    │   → status: processing, progress: 65%
    │
    ├─ GET /v1/video/job-uuid                  → Poll again
    │   → status: completed, video URL ready
    │   → auto-ingested to Media Asset Manager
    │
    ├─ GET /v1/media?source_type=video_generation → View in asset library
    │
    └─ POST /v1/social/posts                   → Distribute via social
        { media_urls: ["..."], platforms: ["YOUTUBE"], content: "..." }
```

<Info>
  Completed video generation jobs are automatically added to your [Media Asset Manager](/docs/getting-started/media) with `source_type: "video_generation"`. Use `naive media list --source video_generation` or `GET /v1/media?source_type=video_generation` to find them.
</Info>
