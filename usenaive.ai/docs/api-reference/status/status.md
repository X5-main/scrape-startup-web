> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Status

> GET /v1/status — Agent status, credits, and resource summary.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/status \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "agent": {
      "id": "uuid",
      "name": "Research Bot"
    },
    "company": {
      "id": "uuid",
      "name": "Acme Corp"
    },
    "credits": {
      "balance": 15000,
      "tier": "pro",
      "period_end": "2026-06-01T00:00:00Z"
    },
    "resources": {
      "email_count": 2,
      "phone_count": 1,
      "domain_count": 1
    }
  }
  ```
</ResponseExample>
