> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Social Portal

> POST /v1/social/portal — Get a hosted portal URL for managing social connections.

<ParamField body="redirect_url" type="string" required>
  URL to redirect to when the user is done managing connections.
</ParamField>

<ParamField body="platforms" type="string[]">
  Optional list of platforms to show in the portal. If omitted, all supported platforms are shown.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/portal \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "redirect_url": "https://app.example.com/settings",
      "platforms": ["TWITTER", "LINKEDIN", "INSTAGRAM"]
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "url": "https://social.usenaive.ai/portal?token=..."
  }
  ```
</ResponseExample>
