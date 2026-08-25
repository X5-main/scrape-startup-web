> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Subscription Status

> Check current subscription status and credit balance

### Response

```json theme={"theme":"css-variables"}
{
  "plan": "pro",
  "status": "active",
  "stripe_customer_id": "cus_...",
  "current_period_end": "2026-06-01T00:00:00Z",
  "credits_remaining": 325,
  "tier": "pro",
  "price": "$20/mo",
  "credits_per_month": 400,
  "is_current_offer": true
}
```

Every field here describes **your** account. `plan`, `price` and `credits_per_month` are read
from your own subscription record — not from the plan catalogue that `GET /v1/billing/plans`
publishes — so this endpoint reports what you actually pay and what you are actually granted
each month.

That distinction matters after a repricing. `plan` can be a **retired** plan id, one that no
longer appears in `GET /v1/billing/plans` at all: a retired plan cannot be newly purchased,
but existing subscriptions keep running on it at their original price and original monthly
allowance, with no migration and no change to what is billed. So a long-standing subscription
may legitimately return a `plan` you cannot find in the catalogue, or the *same* plan id as a
new subscriber with a different `price` and a different `credits_per_month`. Read the numbers
from here; never look them up by matching `plan` against the catalogue.

| Field               | Meaning                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `plan`              | The plan id on this subscription, retired or not. `"free"` when there is no subscription.                                            |
| `price`             | The price string this subscription is billed at, e.g. `"$20/mo"`. `null` when there is no subscription.                              |
| `credits_per_month` | Credits granted to this subscription on each paid invoice.                                                                           |
| `is_current_offer`  | `true` when this subscription's terms are what a new subscriber would buy today; `false` when it is being honoured on retired terms. |
| `tier`              | The credit-balance tier string. Mirrors the plan id; use `plan` for decisions.                                                       |

### Subscription Statuses

| Status      | Description                     |
| ----------- | ------------------------------- |
| `active`    | Subscription is active and paid |
| `trialing`  | In free trial period            |
| `past_due`  | Payment failed, pending retry   |
| `cancelled` | Subscription cancelled          |
| `inactive`  | No subscription                 |
