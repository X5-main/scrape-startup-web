> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# video

> Generate AI videos — text-to-video and image-to-video with async job processing.

## Overview

| Command                         | Description                       | Cost                                               |
| ------------------------------- | --------------------------------- | -------------------------------------------------- |
| `naive video generate <prompt>` | Generate video from text or image | Model-dependent — \~11–45 credits for a 5–10s clip |
| `naive video status <job_id>`   | Check generation status           | Free                                               |
| `naive video models`            | List available models             | Free                                               |

<Info>
  Completed video generation jobs are auto-ingested to the [Media Asset Manager](/docs/getting-started/media). For video clipping commands (`clip`, `clip-status`), see the [clips CLI reference](/docs/cli/clips).
</Info>

***

## Generate Video

Submits a video generation job. Videos take 30–120 seconds to generate.

### Text-to-Video

```bash theme={"theme":"css-variables"}
naive video generate "a rocket launching into space" --model fal-ai/kling-video/v3/pro/text-to-video
naive video generate "timelapse of a flower blooming" --model fal-ai/kling-video/v3/pro/text-to-video --duration 10 --wait
```

### Image-to-Video

```bash theme={"theme":"css-variables"}
naive video generate --model fal-ai/kling-video/v3/pro/image-to-video \
  --image-url https://example.com/photo.jpg
```

### Advanced (full parameter passthrough)

```bash theme={"theme":"css-variables"}
naive video generate --model fal-ai/kling-video/v3/pro/image-to-video \
  --input '{"prompt":"zoom in slowly","image_url":"https://...","duration":"5","aspect_ratio":"16:9"}'
```

### Options

| Flag                   | Required | Description                                       |
| ---------------------- | -------- | ------------------------------------------------- |
| `prompt`               | No\*     | Text description (positional argument)            |
| `--model <model>`      | Yes      | Video model ID                                    |
| `--input <json>`       | No\*     | Full model parameters as JSON                     |
| `--duration <seconds>` | No       | Video duration: `"5"` or `"10"` (model-dependent) |
| `--image-url <url>`    | No       | Source image for image-to-video                   |
| `--wait`               | No       | Block until generation completes                  |

\*Either `prompt`, `--image-url`, or `--input` is required.

### Model Parameters (via `--input`)

| Parameter         | Type    | Models              | Description                                       |
| ----------------- | ------- | ------------------- | ------------------------------------------------- |
| `prompt`          | string  | All                 | Text description of the video                     |
| `duration`        | string  | Kling               | Duration: `"5"` or `"10"` seconds                 |
| `image_url`       | string  | Image-to-video      | Source image URL                                  |
| `aspect_ratio`    | string  | Kling               | `"16:9"`, `"9:16"`, `"1:1"`                       |
| `negative_prompt` | string  | Kling text-to-video | What to avoid                                     |
| `cfg_scale`       | number  | Kling               | Guidance 0-1 (default 0.5, higher = more literal) |
| `generate_audio`  | boolean | Kling v3            | Enable native audio (default: true)               |

### Output (submitted)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.generate.submitted",
  "result": { "job_id": "job-uuid-123", "status": "queued", "model": "fal-ai/kling-video/v3/pro/text-to-video" },
  "next_steps": [
    { "command": "naive video status job-uuid-123", "description": "Check generation progress" },
    { "command": "naive jobs get job-uuid-123", "description": "Get full job details" }
  ],
  "hints": [
    "Video generation submitted",
    "Credits deducted only on successful completion",
    "Typical time: 30-120 seconds depending on model and duration"
  ]
}
```

### Output (completed — with `--wait`)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.generate.completed",
  "result": {
    "id": "job-uuid-123",
    "status": "completed",
    "result": {
      "video": { "url": "https://fal.media/files/.../video.mp4" }
    },
    "credits_used": 22.4
  },
  "next_steps": [
    { "command": "# Download: curl -o video.mp4 \"https://fal.media/files/.../video.mp4\"", "description": "Download the video" },
    { "command": "naive video generate \"another prompt\" --model <model>", "description": "Generate another video" }
  ],
  "hints": ["Video generation complete — download URL available"]
}
```

***

## Available Models

Video generation is **priced per model, live**: Naive reads fal.ai's current price
for the model and charges it × 2. Most models are billed per second of output, a
few per finished video — so cost scales with `--duration` on the former and not on
the latter. The figures below are indicative of fal's prices at the time of
writing, not a fixed rate card.

| Model                                             | Type           | Time  | Billing unit  | Cost for 5s                        |
| ------------------------------------------------- | -------------- | ----- | ------------- | ---------------------------------- |
| `fal-ai/kling-video/v3/pro/text-to-video`         | text-to-video  | \~60s | per second    | \~22 credits (\~45 for 10s)        |
| `fal-ai/kling-video/v3/pro/image-to-video`        | image-to-video | \~60s | per second    | \~22 credits (\~45 for 10s)        |
| `fal-ai/kling-video/v3/standard/text-to-video`    | text-to-video  | \~45s | per second    | \~17 credits                       |
| `fal-ai/minimax-video/video-01-live`              | text-to-video  | \~45s | **per video** | \~20 credits, any duration         |
| `fal-ai/wan/v2.7/text-to-video`                   | text-to-video  | \~60s | per second    | \~20 credits (720p) / \~30 (1080p) |
| `fal-ai/kling-video/v2.1/standard/image-to-video` | image-to-video | \~60s | per second    | \~11 credits                       |

Use `naive video models` for the full up-to-date list — it returns a live
`credits_estimate` per model. For an exact quote before submitting, call
`GET /v1/video/pricing?model=...&duration=...`. Credits are charged on completion,
against the duration actually returned.

***

## Check Status

```bash theme={"theme":"css-variables"}
naive video status <job-id>
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.status",
  "result": {
    "id": "job-uuid-123",
    "status": "running",
    "progress": 45,
    "type": "video_generation"
  },
  "next_steps": [
    { "command": "naive video status job-uuid-123", "description": "Check again in 10-30 seconds" }
  ],
  "hints": ["Job status: running", "Video generation typically takes 30-120 seconds"]
}
```

***

## List Models

```bash theme={"theme":"css-variables"}
naive video models
```

Returns all supported video models with type (text-to-video or image-to-video), supported parameters, and timing estimates.

***

## Credit Behavior

* Credits are **NOT** reserved at submission time
* Credits are deducted **ONLY** when the job completes successfully
* Failed or cancelled video jobs cost **nothing**
* Use `naive usage` to audit credit deductions
