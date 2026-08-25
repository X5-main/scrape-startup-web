> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# images

> Generate AI images or search stock photos — with full parameter passthrough.

## Overview

| Command                          | Description                 | Cost                                                        |
| -------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `naive images generate <prompt>` | AI image generation         | Model-dependent — \~0.12 credits/image on the default model |
| `naive images stock <query>`     | Search stock photos         | Free                                                        |
| `naive images status <job_id>`   | Check generation job status | Free                                                        |
| `naive images models`            | List available models       | Free                                                        |

***

## Generate Images

Submits an image generation job. Returns a job ID (async processing).

### Cost

Image generation is **priced per model, live**: Naive reads fal.ai's current price
for the model you pick and charges it × 2, with a 0.1-credit floor. There is no
flat per-image price.

| Model                           | fal.ai price           | You pay                         |
| ------------------------------- | ---------------------- | ------------------------------- |
| `fal-ai/flux/schnell` (default) | \$0.003 / megapixel    | \~0.12 credits for a 1 MP image |
| `fal-ai/bytedance/seedream/v4`  | \$0.03 / image         | 1.2 credits                     |
| `fal-ai/flux-pro/kontext`       | \$0.04 / image         | 1.6 credits                     |
| `fal-ai/nano-banana-pro`        | \$0.15 / image (1K–2K) | 6 credits                       |

Check any model before you run it with `GET /v1/images/pricing?model=...&num_images=N`,
or read `credits_estimate` from `naive images models`. Credits are charged on
completion, against the number of images actually returned.

### Simple (prompt)

```bash theme={"theme":"css-variables"}
naive images generate "a futuristic city at sunset"
naive images generate "minimalist logo" --model fal-ai/flux-pro/v1.1 --size square_hd --num 4 --wait
```

### Advanced (full parameter passthrough)

```bash theme={"theme":"css-variables"}
naive images generate --model fal-ai/flux/schnell \
  --input '{"prompt":"A minimalist tech logo","image_size":"landscape_16_9","num_images":2,"guidance_scale":3.5}'
```

### Options

| Flag              | Required | Description                                                                               |
| ----------------- | -------- | ----------------------------------------------------------------------------------------- |
| `prompt`          | No\*     | Text description (positional argument)                                                    |
| `--model <model>` | No       | Model ID (default: `fal-ai/flux/schnell`)                                                 |
| `--input <json>`  | No\*     | Full model parameters as JSON (overrides prompt)                                          |
| `--size <size>`   | No       | `square_hd`, `square`, `landscape_4_3`, `landscape_16_9`, `portrait_4_3`, `portrait_16_9` |
| `--num <n>`       | No       | Number of images (default: 1, max: 4)                                                     |
| `--wait`          | No       | Block until generation completes                                                          |

\*Either `prompt` or `--input` is required.

### Model Parameters (via `--input`)

| Parameter               | Type    | Models       | Description                            |
| ----------------------- | ------- | ------------ | -------------------------------------- |
| `prompt`                | string  | All          | Text description (required)            |
| `image_size`            | string  | All          | Output size (see above)                |
| `num_images`            | number  | All          | 1–4                                    |
| `seed`                  | number  | All          | Reproducibility seed                   |
| `guidance_scale`        | number  | Schnell, Dev | CFG guidance (default 3.5, range 1-20) |
| `num_inference_steps`   | number  | Schnell      | Quality steps (1-12, default 4)        |
| `output_format`         | string  | All          | `"jpeg"` or `"png"`                    |
| `enable_safety_checker` | boolean | Schnell, Dev | Content filter (default: true)         |

<Warning>
  `guidance_scale` and `num_inference_steps` are NOT supported on FLUX Pro v1.1. Use FLUX Schnell or FLUX Dev if you need these controls.
</Warning>

### Output (submitted)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "images.generate.submitted",
  "result": { "job_id": "job-uuid-123", "status": "queued", "model": "fal-ai/flux/schnell" },
  "next_steps": [
    { "command": "naive images status job-uuid-123", "description": "Check generation progress" },
    { "command": "naive jobs get job-uuid-123", "description": "Get full job details" }
  ],
  "hints": [
    "Image generation submitted (model: fal-ai/flux/schnell)",
    "Credits deducted only on successful completion",
    "Typical time: 5-15 seconds depending on model"
  ]
}
```

### Output (completed — with `--wait`)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "images.generate.completed",
  "result": {
    "id": "job-uuid-123",
    "status": "completed",
    "result": {
      "images": [
        { "url": "https://fal.media/files/.../image.png", "width": 1024, "height": 1024 }
      ]
    },
    "credits_used": 20
  },
  "next_steps": [
    { "command": "# Download: curl -o image.png \"https://fal.media/files/.../image.png\"", "description": "Download the generated image" },
    { "command": "naive images generate \"another prompt\" --model <model>", "description": "Generate another image" }
  ],
  "hints": ["Generation complete — 1 image(s) ready"]
}
```

### Available Models

| Model                  | Speed                | Notes                                   |
| ---------------------- | -------------------- | --------------------------------------- |
| `fal-ai/flux/schnell`  | Fast (\~5s)          | Default. Full parameter control.        |
| `fal-ai/flux/dev`      | Medium (\~10s)       | Good quality, full parameter control.   |
| `fal-ai/flux-pro/v1.1` | High quality (\~15s) | Best quality. No guidance\_scale/steps. |
| `fal-ai/flux-realism`  | Medium (\~10s)       | Photorealistic results.                 |
| `fal-ai/recraft-v3`    | Medium (\~10s)       | Design-focused (logos, illustrations).  |

Use `naive images models` for the full list with parameters.

***

## Stock Photos

Search for stock photos:

```bash theme={"theme":"css-variables"}
naive images stock "team collaboration"
naive images stock "nature mountain" --count 5 --orientation landscape
naive images stock "abstract background" --color blue --size large
```

### Options

| Flag                   | Required | Description                                                                                                     |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `query`                | Yes      | Search terms                                                                                                    |
| `--count <n>`          | No       | Number of results (1–80, default: 10)                                                                           |
| `--orientation <type>` | No       | `landscape`, `portrait`, or `square`                                                                            |
| `--color <color>`      | No       | Filter by dominant color (red, orange, yellow, green, turquoise, blue, violet, pink, brown, black, gray, white) |
| `--size <size>`        | No       | Minimum photo size: `large` (24MP+), `medium` (12MP+), `small`                                                  |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "images.stock",
  "result": {
    "photos": [
      {
        "id": "stock-123456",
        "url": "https://stock.example.com/photo/...",
        "photographer": "John Doe",
        "alt": "Modern office workspace",
        "width": 1920,
        "height": 1080,
        "src": {
          "original": "https://images.example.com/photos/.../original.jpeg",
          "large": "https://images.example.com/photos/.../large.jpeg",
          "medium": "https://images.example.com/photos/.../medium.jpeg",
          "small": "https://images.example.com/photos/.../small.jpeg"
        }
      }
    ],
    "total": 500
  },
  "next_steps": [
    { "command": "naive images stock \"team collaboration\" --count 20", "description": "Get more results" },
    { "command": "naive images generate \"custom version of this concept\"", "description": "Generate a custom AI image" }
  ],
  "hints": ["Found 10 stock photos", "Cost: 0 credits (free)"]
}
```

**Cost:** Free (0 credits)

***

## Check Status

```bash theme={"theme":"css-variables"}
naive images status <job-id>
```

See [jobs documentation](/docs/cli/jobs) for the full job lifecycle.

***

## List Models

```bash theme={"theme":"css-variables"}
naive images models
```

Returns all supported image models with IDs, key parameters, and mode (text-to-image vs image-to-image).
