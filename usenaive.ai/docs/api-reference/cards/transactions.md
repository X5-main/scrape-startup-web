> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Transactions

> List card transactions across all cards

Returns transactions across all cards. Supports filtering by card, agent, and pagination via limit.

### Query Parameters

| Parameter  | Type   | Required | Description                                            |
| ---------- | ------ | -------- | ------------------------------------------------------ |
| `card_id`  | string | No       | Filter transactions for a specific card                |
| `agent_id` | string | No       | Filter transactions by agent                           |
| `limit`    | number | No       | Maximum number of transactions to return (default: 50) |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/cards/transactions?card_id=card-uuid-1&limit=10" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "transactions": [
      {
        "id": "txn-uuid-1",
        "card_id": "card-uuid-1",
        "amount_cents": 1500,
        "merchant_name": "OpenAI",
        "description": "GPT-4 API usage",
        "agent_id": "agent-uuid-1",
        "metadata": {},
        "created_at": "2026-03-15T14:30:00Z"
      },
      {
        "id": "txn-uuid-2",
        "card_id": "card-uuid-1",
        "amount_cents": 2999,
        "merchant_name": "AWS",
        "description": "EC2 instance",
        "agent_id": null,
        "metadata": {},
        "created_at": "2026-03-14T09:15:00Z"
      }
    ]
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards transactions
```

With filters:

```bash theme={"theme":"css-variables"}
naive cards transactions --card-id <uuid> --agent-id <uuid> --limit 20
```

## MCP

Tool: `naive_cards_transactions`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1",
  "agent_id": "agent-uuid-1",
  "limit": 10
}
```
