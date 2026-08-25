> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Plans

> List available subscription plans with pricing and trial eligibility

Returns the plans a new subscriber can buy, the company's own current plan, credit balance,
and trial eligibility.

### Response

```json theme={"theme":"css-variables"}
{
  "plans": [
    {
      "id": "pro",
      "name": "Pro",
      "credits_per_month": 400,
      "price": "$20/mo",
      "trial_days": 7,
      "features": [
        "All primitives",
        "Custom domains",
        "Priority support",
        "400 monthly credits, then $0.05 per credit pay-as-you-go"
      ],
      "offered": true
    }
  ],
  "current_plan": "free",
  "current_plan_detail": null,
  "credits_remaining": 12.5,
  "trial_eligible": true,
  "can_upgrade": true,
  "hint": "First-time subscribers get a 7-day free trial."
}
```

### `plans` vs `current_plan_detail`

`plans` is the **offer**: what a new subscription would buy today. Every entry carries
`offered: true`, and each is purchasable by its `id` through `POST /v1/billing/subscribe`.

`current_plan_detail` is **your** subscription, read from your own subscription record rather
than from the catalogue. It is `null` until you have a paid subscription, and it can describe
a plan that no longer appears in `plans` at all — a retired plan keeps its original price and
its original monthly allowance for as long as the subscription runs.

```json theme={"theme":"css-variables"}
{
  "current_plan": "pro",
  "current_plan_detail": {
    "id": "pro",
    "name": "Pro",
    "price": "$149/mo",
    "credits_per_month": 2000,
    "is_current_offer": false
  }
}
```

| Field                         | Meaning                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `price` / `credits_per_month` | What **this** subscription pays and is granted each month. Never read these from `plans` — the ids can match while the terms differ.                                           |
| `is_current_offer`            | `true` only when these exact terms are what a new subscriber would buy today. `false` means the subscription predates a repricing and is being honoured on its original terms. |

`can_upgrade` compares monthly credit allowances, not plan ids: it is `false` when your
current allowance already meets or exceeds every offered plan, so an account on a retired plan
with a larger allowance is never offered a "upgrade" to a smaller one.
