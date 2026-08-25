> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Buy Credits

> Purchase a credit pack via checkout

Creates a checkout session for a one-time credit pack purchase. Credits are added to the account immediately after payment.

### Request Body

| Parameter | Type   | Required | Description                                  |
| --------- | ------ | -------- | -------------------------------------------- |
| `pack_id` | string | Yes      | Pack ID: `small`, `medium`, `large`, or `xl` |

### Response

```json theme={"theme":"css-variables"}
{
  "checkout_url": "https://checkout.example.com/c/pay/...",
  "session_id": "cs_live_...",
  "pack": { "id": "medium", "credits": 500, "price": "$23" },
  "expires_at": "2026-05-02T11:30:00Z",
  "hint": "Open the checkout URL to complete payment. Credits are added immediately after payment."
}
```

Use `GET /v1/billing/packs` to see all available packs and their pricing.
