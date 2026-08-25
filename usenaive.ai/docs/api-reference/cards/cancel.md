> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Card

> Cancel and deactivate a virtual card

Permanently cancels a virtual card. The card will be deactivated and can no longer be used for transactions.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/cards/card-uuid-1 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "success": true,
    "card_id": "card-uuid-1"
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards cancel <id>
```

## MCP

Tool: `naive_cards_cancel`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1"
}
```
