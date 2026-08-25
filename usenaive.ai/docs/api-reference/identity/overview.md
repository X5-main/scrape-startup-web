> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Identity

> GET /v1/identity — Full identity summary for the authenticated agent.

Returns your agent profile, company, all available resources, credits, and rate limits.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/identity \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "agent": {
      "id": "uuid",
      "name": "Research Bot",
      "role": "api-agent",
      "department": null
    },
    "company": {
      "id": "uuid",
      "name": "Acme Corp",
      "prefix": "acme"
    },
    "resources": {
      "emails": [
        { "id": "uuid", "address": "research@acme-corp.ai", "local_part": "research", "status": "active" }
      ],
      "phone_numbers": [],
      "domains": [
        { "domain": "acme-corp.ai", "status": "verified" }
      ]
    },
    "credits": {
      "balance": 15000,
      "tier": "pro",
      "period_end": "2026-06-01T00:00:00Z"
    }
  }
  ```
</ResponseExample>
