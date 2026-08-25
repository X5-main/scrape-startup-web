> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Send SMS

> Send an outbound SMS from a provisioned number (gated until campaign approval)

Sends an outbound SMS from a provisioned number. Billed per 160-char segment. **Carrier-gated** (not approval-gated): if the number's campaign isn't approved yet, the request returns `409 compliance_pending` and **no message is sent / no credit is charged**.

### Path Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| `id`      | string | UUID of the sending phone number |

### Request Body

| Parameter | Type   | Required | Description                                                  |
| --------- | ------ | -------- | ------------------------------------------------------------ |
| `to`      | string | Yes      | Recipient phone number in E.164 format (e.g. `+14155551234`) |
| `body`    | string | Yes      | Message text                                                 |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/phone/phone-uuid/sms \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "to": "+14155551234", "body": "Your order shipped!" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "msg_01j9e0m1m6fc38gsv2vkfqgzz2",
    "to": "+14155551234",
    "from": "+14155550000",
    "status": "queued",
    "surge_message_id": "msg_01j9e0m1m6fc38gsv2vkfqgzz2",
    "segments": 1,
    "credits_used": 0.516,
    "credits_remaining": 9499.6
  }
  ```

  ```json 409 theme={"theme":"css-variables"}
  {
    "error": {
      "code": "compliance_pending",
      "message": "Outbound SMS is not available yet — the carrier (10DLC) campaign is still being approved.",
      "campaign_status": "in_review",
      "retryable": true
    }
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive phone send --from phone-uuid --to +14155551234 --body "Your order shipped!"
```

## MCP

Tool: `naive_phone_send`

```json theme={"theme":"css-variables"}
{ "phone_id": "phone-uuid", "to": "+14155551234", "body": "Your order shipped!" }
```

<Note>
  Sending SMS is **not** approval-gated — it executes immediately (subject to the
  carrier-approval gate above). Only [provisioning](/docs/api-reference/phone/provision)
  a number is approval-gated by default.
</Note>
