> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Models

> GET /v1/images/models — List available image generation models.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/images/models \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "models": [
      {
        "id": "fal-ai/flux/schnell",
        "name": "FLUX Schnell (Fast)",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "num_images", "seed", "num_inference_steps", "guidance_scale", "enable_safety_checker", "output_format"],
        "default": true
      },
      {
        "id": "fal-ai/flux-pro/v1.1",
        "name": "FLUX Pro 1.1 (High Quality)",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "num_images", "seed", "output_format"]
      },
      {
        "id": "fal-ai/flux/dev",
        "name": "FLUX Dev",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "num_images", "seed", "guidance_scale", "num_inference_steps", "enable_safety_checker"]
      },
      {
        "id": "fal-ai/flux-realism",
        "name": "FLUX Realism",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "num_images", "seed", "strength"]
      },
      {
        "id": "fal-ai/flux-pro/v1.1/redux",
        "name": "FLUX Pro 1.1 Redux (Image-to-Image)",
        "mode": "image-to-image",
        "key_params": ["image_url", "prompt", "num_images", "seed"]
      },
      {
        "id": "fal-ai/stable-diffusion-v35-large",
        "name": "SD 3.5 Large",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "num_images", "seed", "guidance_scale", "negative_prompt"]
      },
      {
        "id": "fal-ai/recraft-v3",
        "name": "Recraft v3",
        "mode": "text-to-image",
        "key_params": ["prompt", "image_size", "style", "colors"]
      }
    ]
  }
  ```
</ResponseExample>

## Notes

* **FLUX Schnell** is the default and fastest model (\~5s generation)
* **FLUX Pro v1.1** produces the highest quality but does NOT support `guidance_scale` or `num_inference_steps`
* **FLUX Dev** is a good balance of speed and quality with full parameter control
* **FLUX Pro 1.1 Redux** is for image-to-image transformations — requires `image_url` input
* **Recraft v3** is design-focused (logos, illustrations) — supports `style` and `colors` params
