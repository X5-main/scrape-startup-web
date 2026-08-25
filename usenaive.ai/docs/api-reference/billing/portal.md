> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Billing Portal

> Get a billing portal URL for subscription management

Creates a billing portal session. From the portal, users can update payment methods, change plans, view invoices, or cancel.

Requires an existing billing account (must have subscribed at least once).

### Response

```json theme={"theme":"css-variables"}
{
  "portal_url": "https://billing.example.com/p/session/...",
  "hint": "Open this URL to manage your subscription, update payment method, or cancel."
}
```
