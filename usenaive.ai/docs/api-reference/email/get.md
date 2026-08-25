> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Email

> GET /v1/email/:id — Get full email body by ID.

<ParamField path="id" type="string" required>
  Email UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/email/email-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "uuid",
    "from": "someone@external.com",
    "to": "research@acme-corp.ai",
    "subject": "Re: Research findings",
    "body": "Full email body text...",
    "received_at": "2026-05-02T10:30:00Z"
  }
  ```
</ResponseExample>
