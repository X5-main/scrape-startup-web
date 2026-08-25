> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Unassign Agent

> Remove an agent's assignment from a card

Removes an agent's assignment from a card, revoking the agent's permission to use the card.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/cards/card-uuid-1/assign/agent-uuid-1 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "success": true
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards unassign <id> <agent_id>
```

## MCP

Tool: `naive_cards_unassign`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1",
  "agent_id": "agent-uuid-1"
}
```
