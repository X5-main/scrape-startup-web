> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Emails

> GET /v1/identity/emails — List available email inboxes.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/identity/emails \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "emails": [
      {
        "id": "uuid",
        "address": "research@acme-corp.ai",
        "local_part": "research",
        "agent_id": "uuid",
        "status": "active"
      }
    ]
  }
  ```
</ResponseExample>
