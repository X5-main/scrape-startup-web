> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delivery Status

> Per-event delivery status — received → queued → delivered → processed | failed, plus no_match.

Every event the trigger router handles writes a delivery row, so you can always
answer "why didn't my agent wake?". Events that matched **no** subscription are
recorded as `no_match` (a visible non-drop), not silently discarded.

Statuses advance `received → queued → delivered → processed | failed`.

### Query Parameters

| Parameter         | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| `status`          | string  | Filter by status (e.g. `failed`, `no_match`) |
| `source`          | string  | Filter by source (`email`, `sms`, `cron`, …) |
| `subscription_id` | string  | Filter by trigger subscription               |
| `limit`           | integer | Max rows to return                           |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/triggers/deliveries?status=failed&limit=50" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "deliveries": [
      {
        "id": "td_01H...",
        "source": "email",
        "type": "email.received",
        "subscription_id": "sub_01H...",
        "status": "processed",
        "lane": "sidecar",
        "created_at": "2026-07-08T09:00:00Z"
      }
    ],
    "count": 1
  }
  ```
</ResponseExample>

See the [event router](/docs/architecture/event-router) for the delivery model.
