> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Generation

> Two visual primitives: AI image generation and free stock photo search.

Images are a **creation primitive** in Naive API v2. Two tools cover what an agent typically needs: **AI image generation** for original visuals (FLUX, Stable Diffusion, Recraft), and **stock photo search** for free, license-clean photography. Both are identity-aware and billing-integrated.

## CLI First

```bash theme={"theme":"css-variables"}
# Generate images and wait for result
naive images generate --model fal-ai/flux/schnell "A minimalist illustration of an AI robot working at a desk" --num 2 --wait

# Search stock photos
naive images stock "modern office workspace" --count 10
```

## Tools

| Tool              | Type | Description                                                | Cost                      |
| ----------------- | ---- | ---------------------------------------------------------- | ------------------------- |
| `generate_images` | Core | Generate images from a text prompt (async)                 | Dynamic (model-dependent) |
| `stock_search`    | Core | Search free stock photos                                   | Free                      |
| `image_models`    | Core | List all available image generation models with parameters | Free                      |
| `image_status`    | Core | Check status of an image generation job                    | Free                      |

## Generating Images

The `generate_images` tool submits an async image generation job. The `input` object supports any model-specific parameters.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/images/generate \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "fal-ai/flux/schnell",
      "input": {
        "prompt": "A minimalist illustration of an AI robot working at a desk, flat design, blue and white",
        "image_size": "square_hd",
        "num_images": 2,
        "seed": 42
      }
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/images/generate", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "fal-ai/flux/schnell",
      input: {
        prompt: "A minimalist illustration of an AI robot working at a desk, flat design, blue and white",
        image_size: "square_hd",
        num_images: 2,
        seed: 42,
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
  "type": "image_generation",
  "model": "fal-ai/flux/schnell",
  "estimated_credits": 0.24,
  "hint": "Poll GET /v1/jobs/job-uuid or GET /v1/images/job-uuid. Credits charged on completion only."
}
```

### Parameters (Common)

| Param                 | Type   | Required | Default     | Description                                                                     |
| --------------------- | ------ | -------- | ----------- | ------------------------------------------------------------------------------- |
| `prompt`              | string | Yes      | —           | Text description of the image                                                   |
| `image_size`          | string | No       | `square_hd` | `square_hd`, `landscape_4_3`, `landscape_16_9`, `portrait_4_3`, `portrait_16_9` |
| `num_images`          | number | No       | 1           | Number of images (1-4)                                                          |
| `seed`                | number | No       | Random      | Reproducibility seed                                                            |
| `guidance_scale`      | number | No       | 3.5         | CFG guidance (FLUX Schnell/Dev only)                                            |
| `num_inference_steps` | number | No       | 4           | Quality steps (FLUX Schnell: 1-12)                                              |
| `output_format`       | string | No       | `jpeg`      | `"jpeg"` or `"png"`                                                             |

<Warning>
  FLUX Pro v1.1 does NOT support `guidance_scale` or `num_inference_steps`. Use FLUX Schnell or Dev if you need these.
</Warning>

### Checking Status

Poll until the job completes:

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/images/job-uuid \
  -H "Authorization: Bearer nv_sk_your_key"
```

**Response (completed):**

```json theme={"theme":"css-variables"}
{
  "status": "completed",
  "result": {
    "images": [
      { "url": "https://fal.media/files/.../img1.png", "width": 1024, "height": 1024 },
      { "url": "https://fal.media/files/.../img2.png", "width": 1024, "height": 1024 }
    ],
    "seed": 42
  },
  "credits_used": 0.24
}
```

### Cost

Image generation pricing is **dynamic** — based on the model's per-unit cost, converted to credits at \$0.05/credit. Preview costs before submitting:

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/images/pricing?model=fal-ai/flux/schnell&num_images=2" \
  -H "Authorization: Bearer nv_sk_your_key"
```

```json theme={"theme":"css-variables"}
{
  "model": "fal-ai/flux/schnell",
  "estimated_credits": 0.24,
  "unit_price_usd": 0.003,
  "credit_value_usd": 0.05
}
```

## Available Models

Use `GET /v1/images/models` to see the full dynamically-fetched list. Common models:

| Model                               | Mode          | Best For                              |
| ----------------------------------- | ------------- | ------------------------------------- |
| `fal-ai/flux/schnell`               | text-to-image | Fast generation (\~5s), good default  |
| `fal-ai/flux-pro/v1.1`              | text-to-image | Highest quality (\~15s)               |
| `fal-ai/flux/dev`                   | text-to-image | Experimental, supports guidance       |
| `fal-ai/flux-realism`               | text-to-image | Photorealistic results                |
| `fal-ai/recraft-v3`                 | text-to-image | Design-focused (logos, illustrations) |
| `fal-ai/stable-diffusion-v35-large` | text-to-image | Classic SD with negative prompts      |

## Stock Photo Search

Search free stock photos — no credits charged, no generation wait.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/images/stock?query=team+collaboration&count=5&orientation=landscape" \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch(
    "https://api.usenaive.ai/v1/images/stock?query=team+collaboration&count=5&orientation=landscape",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } }
  );
  const { photos } = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "photos": [
    {
      "id": 3184339,
      "url": "https://stock.example.com/photo/3184339",
      "src": { "original": "https://images.example.com/...", "large": "...", "medium": "..." },
      "alt": "Team meeting in modern office",
      "width": 1920,
      "height": 1080,
      "photographer": "Kampus Production"
    }
  ]
}
```

### Parameters

| Param         | Type   | Required | Default | Description                              |
| ------------- | ------ | -------- | ------- | ---------------------------------------- |
| `query`       | string | Yes      | —       | Search keywords                          |
| `count`       | number | No       | 10      | Results count (1-80)                     |
| `orientation` | string | No       | —       | `landscape`, `portrait`, or `square`     |
| `color`       | string | No       | —       | Filter by dominant color                 |
| `size`        | string | No       | —       | Minimum size: `large`, `medium`, `small` |

## Prompt Tips

<Tabs>
  <Tab title="Marketing Assets">
    ```
    A professional product mockup of a SaaS dashboard on a laptop,
    clean UI with charts, soft gradient background in blue and purple,
    photorealistic, high detail
    ```
  </Tab>

  <Tab title="Social Media">
    ```
    Bold typographic social card with "Launch Day" in large white letters
    on a dark gradient background, minimalist design, 16:9 aspect ratio
    ```
  </Tab>

  <Tab title="Logos & Icons">
    ```
    Minimal app icon for a note-taking app, single pencil glyph on solid
    indigo background, rounded square, flat design, no text, white bg
    ```
  </Tab>
</Tabs>

<Tip>
  For logos, always specify **"no text"** and **"white background"**. Text in AI-generated images is often garbled. Add text separately.
</Tip>

## Error Handling

| Error                  | Cause                                  | Recovery                                            |
| ---------------------- | -------------------------------------- | --------------------------------------------------- |
| `insufficient_credits` | Not enough credits for generation      | Preview cost with `/v1/images/pricing`, then top up |
| `provider_error`       | AI model provider rejected the request | Check model parameters against `/v1/images/models`  |
| `invalid_model`        | Model ID not recognized                | Use `GET /v1/images/models` for valid IDs           |

## When to Use Each

| Need                   | Tool              | Why                                |
| ---------------------- | ----------------- | ---------------------------------- |
| Custom branded visuals | `generate_images` | Unique content matching your brand |
| Logo or icon concepts  | `generate_images` | No stock option for custom marks   |
| Generic backgrounds    | `stock_search`    | Fast, free, high quality           |
| Social media photos    | `stock_search`    | Professional, free, immediate      |

## Typical Workflow

```
Agent receives task: "Create social media graphics for the product launch"
    │
    ├─ POST /v1/images/generate                → Generate custom hero image
    │   { model: "fal-ai/flux-pro/v1.1",
    │     input: { prompt: "Product launch banner...", num_images: 4 } }
    │   → job_id: job-uuid-1
    │
    ├─ GET /v1/jobs/job-uuid-1                 → Poll until complete
    │   → 4 images generated with URLs
    │
    ├─ GET /v1/images/stock?query=celebration  → Find supporting stock photos
    │   → 10 free stock photos
    │
    └─ POST /v1/email/send                     → Send to team for review
        { body: "Here are the launch graphics..." }
```
