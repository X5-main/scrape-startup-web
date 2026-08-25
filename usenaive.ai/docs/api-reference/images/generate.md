> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Generate Images

> POST /v1/images/generate — Submit an image generation job.

<ParamField body="model" type="string" default="fal-ai/flux/schnell">
  Model ID. Use `GET /v1/images/models` to see all available models and their parameters.
</ParamField>

<ParamField body="input" type="object" required>
  Model-specific parameters — all params supported. Must include `prompt`.

  **Image-to-image / edit models:** the source image field name differs by model —
  some expect the array `image_urls`, others the singular `image_url`. You may pass
  **either**; a singular `image_url` string is normalized to `image_urls: [url]`
  automatically, so one field works across models.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/images/generate \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "model": "fal-ai/flux/schnell",
      "input": {
        "prompt": "A minimalist logo for a tech startup",
        "image_size": "square_hd",
        "num_images": 2,
        "seed": 42
      }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  {
    "id": "job-uuid",
    "job_id": "job-uuid",
    "status": "queued",
    "type": "image_generation",
    "model": "fal-ai/flux/schnell",
    "estimated_seconds": 8,
    "estimated_credits": 0.24,
    "hint": "Poll GET /v1/jobs/job-uuid or GET /v1/images/job-uuid. Credits charged on completion only."
  }
  ```
</ResponseExample>

<Note>
  **Use `id`, not `job_id`.** The job identifier is returned as `id` on both submit
  and status (`GET /v1/jobs/:id`), so the same field works for the whole lifecycle.
  `job_id` is a deprecated alias kept for backward compatibility; prefer `id`.
</Note>

**Cost:** Dynamic — model-dependent. Preview with `GET /v1/images/pricing?model=<id>&num_images=<n>`. Based on model costs at \$0.05/credit. Charged on completion only.

## Common Input Parameters

Parameters vary by model. Use `GET /v1/images/models` to see `key_params` for each model.

| Parameter               | Type    | Description                                                                               |
| ----------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `prompt`                | string  | Text description of the image (required)                                                  |
| `image_size`            | string  | `square_hd`, `square`, `landscape_4_3`, `landscape_16_9`, `portrait_4_3`, `portrait_16_9` |
| `num_images`            | number  | Number of images (1-4)                                                                    |
| `seed`                  | number  | Reproducibility seed                                                                      |
| `guidance_scale`        | number  | CFG guidance (FLUX Schnell/Dev only, default 3.5)                                         |
| `num_inference_steps`   | number  | Quality steps (FLUX Schnell: 1-12, default 4)                                             |
| `output_format`         | string  | `"jpeg"` or `"png"`                                                                       |
| `enable_safety_checker` | boolean | Default true                                                                              |

<Note>
  `guidance_scale` and `num_inference_steps` are NOT supported on FLUX Pro v1.1. They are available on FLUX Schnell and FLUX Dev.
</Note>

## Completed Result

When polling the job after completion via `GET /v1/jobs/:id` or `GET /v1/images/:jobId`:

```json theme={"theme":"css-variables"}
{
  "id": "job-uuid",
  "type": "image_generation",
  "status": "completed",
  "progress": 100,
  "model": "fal-ai/flux/schnell",
  "media": [
    { "url": "https://fal.media/files/...", "type": "image" }
  ],
  "result": {
    "images": [
      { "url": "https://fal.media/files/...", "width": 1024, "height": 1024, "content_type": "image/png" }
    ],
    "seed": 42,
    "prompt": "A minimalist logo for a tech startup"
  },
  "credits_used": 0.24,
  "created_at": "2026-05-02T10:30:00Z",
  "completed_at": "2026-05-02T10:30:08Z"
}
```

<Note>
  **Reading the output URL.** Use the flat, model-independent `media` array —
  `media[0].url` is stable across image and video jobs and every model. The raw
  provider payload is still available under `result` (images at
  `result.images[].url`), but its nesting varies by model; `media[]` does not.
</Note>
