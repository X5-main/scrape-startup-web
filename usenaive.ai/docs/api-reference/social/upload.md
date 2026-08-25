> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Upload Media

> POST /v1/social/upload — Upload media for use in social posts.

<ParamField body="url" type="string" required>
  Public URL of the media file to upload (image or video).
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/upload \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://cdn.example.com/product-launch.png"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "media-uuid",
    "type": "image",
    "url": "https://media.usenaive.ai/social/media-uuid.png"
  }
  ```
</ResponseExample>
