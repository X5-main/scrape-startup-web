> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Cards

> List all virtual cards for the company

Returns all virtual cards associated with your company. Optionally filter by agent assignment.

### Query Parameters

| Parameter  | Type   | Required | Description                               |
| ---------- | ------ | -------- | ----------------------------------------- |
| `agent_id` | string | No       | Filter cards assigned to a specific agent |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/cards \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "cards": [
      {
        "id": "card-uuid-1",
        "name": "Marketing Card",
        "provider": "managed_virtual",
        "status": "active",
        "spending_limit_cents": 500000,
        "balance_cents": 350000,
        "agent_id": "agent-uuid-1",
        "created_at": "2026-02-01T10:00:00Z"
      },
      {
        "id": "card-uuid-2",
        "name": "Research Card",
        "provider": "prepaid_gift",
        "status": "active",
        "spending_limit_cents": 200000,
        "balance_cents": 200000,
        "agent_id": null,
        "created_at": "2026-02-05T14:00:00Z"
      }
    ]
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards
```

To filter by agent:

```bash theme={"theme":"css-variables"}
naive cards list --agent-id <uuid>
```

## MCP

Tool: `naive_cards_list`

```json theme={"theme":"css-variables"}
{
  "agent_id": "agent-uuid-1"
}
```
