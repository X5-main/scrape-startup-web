> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Models

> GET /v1/video/models — List available video generation models.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/video/models \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "models": [
      {
        "id": "fal-ai/kling-video/v3/pro/text-to-video",
        "name": "Kling 3 Pro (Text)",
        "mode": "text-to-video",
        "key_params": ["prompt", "duration", "aspect_ratio", "negative_prompt", "cfg_scale", "generate_audio"],
        "default": true
      },
      {
        "id": "fal-ai/kling-video/v3/pro/image-to-video",
        "name": "Kling 3 Pro (Image)",
        "mode": "image-to-video",
        "key_params": ["prompt", "image_url", "duration", "aspect_ratio", "cfg_scale", "generate_audio"]
      },
      {
        "id": "fal-ai/kling-video/v3/standard/text-to-video",
        "name": "Kling 3 Standard (Text)",
        "mode": "text-to-video",
        "key_params": ["prompt", "duration", "aspect_ratio", "negative_prompt", "cfg_scale"]
      },
      {
        "id": "fal-ai/minimax-video/video-01-live",
        "name": "MiniMax Video 01 Live",
        "mode": "text-to-video",
        "key_params": ["prompt"]
      },
      {
        "id": "fal-ai/wan/v2.7/text-to-video",
        "name": "Wan 2.7",
        "mode": "text-to-video",
        "key_params": ["prompt", "resolution", "num_frames"]
      },
      {
        "id": "fal-ai/kling-video/v2.1/standard/image-to-video",
        "name": "Kling 2.1 Standard (Image)",
        "mode": "image-to-video",
        "key_params": ["prompt", "image_url", "duration", "cfg_scale"]
      }
    ]
  }
  ```
</ResponseExample>

## Key Parameters by Model

| Parameter         | Description                                               | Models                |
| ----------------- | --------------------------------------------------------- | --------------------- |
| `prompt`          | Text description of the video                             | All                   |
| `duration`        | Video length: `"5"` or `"10"` seconds                     | Kling models          |
| `aspect_ratio`    | `"16:9"`, `"9:16"`, `"1:1"`                               | Kling models          |
| `negative_prompt` | What to avoid (default: "blur, distort, and low quality") | Kling text-to-video   |
| `cfg_scale`       | Guidance scale 0-1 (default 0.5, higher = more literal)   | Kling models          |
| `generate_audio`  | Enable native audio (Chinese/English, default true)       | Kling v3              |
| `image_url`       | Source image URL                                          | Image-to-video models |
| `resolution`      | Video resolution                                          | Wan 2.7               |
| `num_frames`      | Number of frames                                          | Wan 2.7               |
