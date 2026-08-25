> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Resources

> GET /v1/identity/resources — All provisioned resources across categories.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/identity/resources \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "emails": [
      { "id": "uuid", "address": "research@acme-corp.ai", "local_part": "research", "agent_id": "uuid", "status": "active" }
    ],
    "phone_numbers": [
      { "id": "uuid", "number": "+14155551234", "agent_id": "uuid", "status": "active" }
    ],
    "domains": [
      { "domain": "acme-corp.ai", "status": "verified" }
    ]
  }
  ```
</ResponseExample>
