> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Purchase Domain

> Purchase a domain via checkout

Creates a checkout session to purchase a domain. After payment, the domain is registered via the domain registrar and DNS is provisioned automatically.

Maximum 3 purchased domains per company.

### Request Body

| Parameter | Type   | Required | Description                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| `domain`  | string | Yes      | Domain to purchase (check availability first) |

### Response

```json theme={"theme":"css-variables"}
{
  "checkout_url": "https://checkout.example.com/c/pay/...",
  "session_id": "cs_live_...",
  "domain_id": "550e8400-e29b-41d4-a716-446655440000",
  "domain": "coolstartup.ai",
  "price": "$25",
  "expires_at": "2026-05-02T11:30:00Z",
  "hint": "Open the checkout URL to complete payment. The domain will be registered automatically."
}
```

`price` is **dynamic** — the registrar's live wholesale quote for this exact domain
plus a flat \*\*$2** Naïve markup (from `GET /v1/domains/search`). The `$25\` shown is
an example, not a fixed price; it varies by TLD and domain. Charged in USD at
checkout, not in credits.

After payment, check `GET /v1/domains` to verify the domain status has changed from `pending_payment` to `active`.

<Note>
  **May require approval.** If the user's Account Kit gates `domains.purchase`, an
  agent (API-key) call returns `202 { "status": "pending_approval", "approval_id" }`
  instead of creating the checkout. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview); the purchase runs on replay. See
  [Approvals](/docs/getting-started/approvals).
</Note>
