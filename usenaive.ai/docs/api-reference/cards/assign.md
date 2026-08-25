> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Assign Agent

> Assign an agent to a card

Assigns an agent to a card, granting the agent permission to use the card for transactions.

### Request Body

| Parameter  | Type   | Required | Description                 |
| ---------- | ------ | -------- | --------------------------- |
| `agent_id` | string | Yes      | UUID of the agent to assign |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards/card-uuid-1/assign \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "agent_id": "agent-uuid-1"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "assignment": {
      "assignment_id": "assign-uuid-1",
      "card_id": "card-uuid-1",
      "agent_id": "agent-uuid-1",
      "agent_name": "Marketing Agent",
      "agent_role": "social_media",
      "created_at": "2026-03-10T09:00:00Z"
    }
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards assign <id> --agent-id <uuid>
```

## MCP

Tool: `naive_cards_assign`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1",
  "agent_id": "agent-uuid-1"
}
```
