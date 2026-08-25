> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Assignments

> List all agents assigned to a card

Returns all agent assignments for a specific card.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/cards/card-uuid-1/assignments \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "assignments": [
      {
        "assignment_id": "assign-uuid-1",
        "agent_id": "agent-uuid-1",
        "agent_name": "Marketing Agent",
        "agent_role": "social_media"
      },
      {
        "assignment_id": "assign-uuid-2",
        "agent_id": "agent-uuid-2",
        "agent_name": "Research Agent",
        "agent_role": "researcher"
      }
    ]
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards assignments <id>
```

## MCP

Tool: `naive_cards_assignments`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1"
}
```
