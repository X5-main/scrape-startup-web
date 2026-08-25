> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Asset

> DELETE /v1/media/:id — Delete a media asset.

<ParamField path="id" type="string" required>
  UUID of the media asset to delete
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/media/asset-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "deleted": true,
    "id": "asset-uuid"
  }
  ```
</ResponseExample>

**Cost:** Free
