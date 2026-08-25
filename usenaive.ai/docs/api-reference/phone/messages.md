> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Inbound SMS

> List and read received SMS for a phone number

Lists received SMS for a phone number, newest first, with cursor-based pagination. Inbound SMS works immediately on provisioning — there is no carrier gate on receiving.

### Path Parameters

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `id`      | string | UUID of the phone number |

### Query Parameters

| Parameter | Type   | Description                                            |
| --------- | ------ | ------------------------------------------------------ |
| `limit`   | number | Max messages (default 20, max 100)                     |
| `cursor`  | string | Pagination cursor (`next_cursor` from a previous call) |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/phone/phone-uuid/messages?limit=50" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "messages": [
      {
        "id": "msg-uuid",
        "from": "+14155551234",
        "to": "+14155550000",
        "body_preview": "Yes please reschedule for Friday",
        "num_media": 0,
        "received_at": "2026-05-01T18:06:00.000Z"
      }
    ],
    "next_cursor": null
  }
  ```
</ResponseExample>

## Read a single message

`GET /v1/phone/messages/:messageId` returns the full body and any media URLs:

```json theme={"theme":"css-variables"}
{
  "id": "msg-uuid",
  "phone_id": "phone-uuid",
  "from": "+14155551234",
  "to": "+14155550000",
  "body": "Yes please reschedule for Friday",
  "num_media": 0,
  "media_urls": [],
  "received_at": "2026-05-01T18:06:00.000Z",
  "metadata": { "conversation_id": "cnv_..." }
}
```

## CLI

```bash theme={"theme":"css-variables"}
naive phone messages phone-uuid --limit 50
naive phone read message-uuid
```

## MCP

Tools: `naive_phone_messages`, `naive_phone_read`.
