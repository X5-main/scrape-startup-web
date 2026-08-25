> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Top Up Card

> Add funds to an existing card via checkout

Creates a hosted checkout session to add funds to an existing card. The card balance is updated after successful payment.

### Request Body

| Parameter      | Type   | Required | Description                                   |
| -------------- | ------ | -------- | --------------------------------------------- |
| `amount_cents` | number | Yes      | Amount to add in cents (minimum 100 = \$1.00) |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards/card-uuid-1/top-up \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "amount_cents": 5000
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_live_...",
    "session_id": "cs_live_def456",
    "card_id": "card-uuid-1",
    "amount": 5000,
    "expires_at": "2026-03-05T12:30:00Z"
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards top-up <id> --amount 5000
```

## MCP

Tool: `naive_cards_topup`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1",
  "amount_cents": 5000
}
```

<Note>
  **May require approval.** If the user's Account Kit gates cards, an agent
  (API-key) call (`cards.topup`) returns
  `202 { "status": "pending_approval", "approval_id" }`. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview). See
  [Approvals](/docs/getting-started/approvals).
</Note>
