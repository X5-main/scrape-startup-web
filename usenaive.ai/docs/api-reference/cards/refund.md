> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Refund Card

> Refund a card that failed issuance or payment

Initiates a refund for a card in `issuing_failed` or `payment_failed` status. The refund is processed back to the original payment method.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards/card-uuid-1/refund \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "card": {
      "id": "card-uuid-1",
      "name": "Marketing Card",
      "provider": "managed_virtual",
      "status": "refunded",
      "spending_limit_cents": 5000,
      "balance_cents": 0,
      "created_at": "2026-03-01T10:00:00Z"
    },
    "refund": {
      "id": "re_1abc123",
      "status": "succeeded"
    }
  }
  ```
</ResponseExample>

### Error Response

If the card is not in a refundable status:

```json theme={"theme":"css-variables"}
{
  "error": "Card must be in issuing_failed or payment_failed status to refund"
}
```

## CLI

```bash theme={"theme":"css-variables"}
naive cards refund <id>
```

## MCP

Tool: `naive_cards_refund`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1"
}
```
