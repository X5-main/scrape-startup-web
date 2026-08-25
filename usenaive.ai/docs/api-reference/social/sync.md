> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sync Accounts

> POST /v1/social/sync — Sync all connected social accounts with the upstream provider.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/sync \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "synced": 3,
    "team_count": 1
  }
  ```
</ResponseExample>

**Note:** `synced` is the number of accounts synced from the upstream provider, not a boolean.
