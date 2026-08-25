> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Received Emails

> GET /v1/email/inbox — List received emails, optionally filtered by inbox.

<ParamField query="from_inbox" type="string">
  Filter by inbox UUID
</ParamField>

<ParamField query="limit" type="number" default="20">
  Max emails to return (max 100)
</ParamField>

<ParamField query="offset" type="number" default="0">
  Pagination offset
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/email/inbox?from_inbox=uuid&limit=20" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "emails": [
      {
        "id": "uuid",
        "from": "someone@external.com",
        "to": "research@acme-corp.ai",
        "subject": "Re: Research findings",
        "snippet": "Thanks for the...",
        "received_at": "2026-05-02T10:30:00Z"
      }
    ],
    "has_more": true
  }
  ```
</ResponseExample>
