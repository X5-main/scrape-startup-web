> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Inboxes

> GET /v1/email/inboxes — List email addresses this agent can send from.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/email/inboxes \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "inboxes": [
      {
        "id": "uuid",
        "address": "research@acme-corp.ai",
        "domain": "acme-corp.ai",
        "status": "active"
      }
    ]
  }
  ```
</ResponseExample>

<Info>
  This endpoint uses the same underlying data as `GET /v1/identity/emails` but returns a simplified shape optimized for the send flow.
</Info>
