> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect Account

> POST /v1/social/connect — Get an OAuth URL to connect a social account.

<ParamField body="platform" type="string" required>
  Social platform to connect. One of `TWITTER`, `LINKEDIN`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `TIKTOK`, `PINTEREST`, `THREADS`, `REDDIT`, `BLUESKY`.
</ParamField>

<ParamField body="redirect_url" type="string" required>
  URL to redirect to after the user completes OAuth authorization.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/connect \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "platform": "TWITTER",
      "redirect_url": "https://app.example.com/social/callback"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "url": "https://social.usenaive.ai/oauth/twitter?token=..."
  }
  ```
</ResponseExample>
