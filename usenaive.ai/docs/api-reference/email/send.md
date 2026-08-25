> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Send Email

> POST /v1/email/send — Send an email from a specific inbox.

<ParamField body="from_inbox" type="string" required>
  UUID of the inbox to send from (get via `GET /v1/email/inboxes`)
</ParamField>

<ParamField body="to" type="string" required>
  Recipient email address
</ParamField>

<ParamField body="subject" type="string" required>
  Email subject line
</ParamField>

<ParamField body="body" type="string" required>
  Email body — plain text or HTML. If the body contains HTML tags, it will be sent as HTML email; otherwise plain text.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/email/send \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "from_inbox": "inbox-uuid",
      "to": "prospect@company.com",
      "subject": "Research findings",
      "body": "Here are the results..."
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "provider-message-id",
    "message_id": "naive-sent-message-uuid",
    "provider_message_id": "provider-message-id",
    "tracking_available": true,
    "status": "sent",
    "from_inbox": "inbox-uuid",
    "from_address": "research@acme-corp.ai",
    "to": "prospect@company.com",
    "credits_used": 0.016,
    "credits_remaining": 14999.984
  }
  ```
</ResponseExample>

`id` remains the provider message ID used by schedule, cancel, and delivery-status
operations. When `tracking_available` is true, `message_id` is the Naive sent-message
UUID accepted by `GET /v1/email/:id` and `naive email read`.

**Cost:** 0.016 credits (charged immediately on success). Cancelling a scheduled send refunds the full 0.016 credits.
