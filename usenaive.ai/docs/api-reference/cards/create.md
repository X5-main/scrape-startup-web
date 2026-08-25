> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Card

> Create a virtual card and hosted checkout session

Creates a new virtual card and returns a hosted checkout URL for funding. The card becomes active after successful payment.

### Request Body

| Parameter              | Type   | Required | Description                                                                                                                                       |
| ---------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                 | string | Yes      | Display name for the card                                                                                                                         |
| `spending_limit_cents` | number | Yes      | Initial funding amount in cents (e.g. 5000 = \$50.00)                                                                                             |
| `provider`             | string | No       | Card type: `prepaid_gift` (default — prepaid Visa, no cardholder, \$150 max) or `managed_virtual` (Stripe Issuing, no cap, requires a cardholder) |
| `agent_id`             | string | No       | Agent UUID to assign the card to                                                                                                                  |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Marketing Card",
      "spending_limit_cents": 5000,
      "agent_id": "agent-uuid-1"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "card": {
      "id": "card-uuid-1",
      "name": "Marketing Card",
      "provider": "prepaid_gift",
      "status": "pending_payment",
      "spending_limit_cents": 5000,
      "balance_cents": 0,
      "agent_id": "agent-uuid-1",
      "created_at": "2026-03-01T10:00:00Z"
    },
    "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_live_...",
    "session_id": "cs_live_abc123",
    "expires_at": "2026-03-01T10:30:00Z"
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive cards create --name "Marketing Card" --spending-limit 5000
```

Optionally assign to an agent:

```bash theme={"theme":"css-variables"}
naive cards create --name "Marketing Card" --spending-limit 5000 --agent-id <uuid>
```

## MCP

Tool: `naive_cards_create`

```json theme={"theme":"css-variables"}
{
  "name": "Marketing Card",
  "spending_limit_cents": 5000,
  "agent_id": "agent-uuid-1"
}
```

<Note>
  **May require approval.** If the user's Account Kit gates `cards.create`, an
  agent (API-key) call returns `202 { "status": "pending_approval", "approval_id" }`
  instead of creating the card. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview); the card is then created on
  replay. See [Approvals](/docs/getting-started/approvals).
</Note>
