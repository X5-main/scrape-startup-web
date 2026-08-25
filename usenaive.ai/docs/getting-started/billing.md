> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Billing & Credits

> Manage subscriptions, purchase credits, and understand pricing

## CLI First

```bash theme={"theme":"css-variables"}
# Plan + subscription
naive billing plans
naive billing subscribe --plan pro

# Check current status
naive billing status
```

## Plans

| Plan    | Price   | Credits/Month | Features                                         |
| ------- | ------- | ------------- | ------------------------------------------------ |
| **Pro** | \$20/mo | 400           | All primitives, custom domains, priority support |

400 credits at $0.05 each is $20 — the subscription is **at par** with pay-as-you-go, not a
discount. Everything past the included credits is billed from your credit balance, so top up
with a [credit pack](#credit-packs) whenever you need more.

New accounts receive **20 free credits once their email is verified** (the balance is 0 until the verification link sent at signup is clicked). First-time subscribers also get a **7-day free trial**. Those free credits spend on every primitive except **LLM routing**, which requires a paid account — see [Credits](/docs/getting-started/credits) and [LLM](/docs/getting-started/llm).

<Info>
  **Already on a different plan?** Plans other than Pro have been retired — nothing new can
  subscribe to one — but existing subscriptions are unaffected. You keep the price you signed
  up at and the monthly credit allowance you signed up for, with no migration and no change to
  what you are billed. `GET /v1/billing/subscription` reports **your** plan, price and
  allowance, read from your own subscription, not from the table above.
</Info>

## Credit Packs

One-time purchases — credits are added immediately after payment and never expire.

| Pack   | Credits | Price | Per Credit |
| ------ | ------- | ----- | ---------- |
| Small  | 200     | \$10  | \$0.050    |
| Medium | 500     | \$23  | \$0.046    |
| Large  | 1000    | \$44  | \$0.044    |
| XL     | 2500    | \$100 | \$0.040    |

<Info>Larger packs are more cost-effective. Credits never expire.</Info>

## Subscribe to a Plan

<CodeGroup>
  ```bash CLI theme={"theme":"css-variables"}
  naive billing subscribe --plan pro
  ```

  ```bash cURL theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/billing/subscribe \
    -H "Authorization: Bearer nv_sk_..." \
    -H "Content-Type: application/json" \
    -d '{"plan": "pro"}'
  ```
</CodeGroup>

`pro` is the only value `plan` accepts. A retired plan id returns `400 invalid_input` naming
the retirement — it does not silently subscribe you to something else.

Returns a checkout URL. Open it to complete payment, then verify:

```bash theme={"theme":"css-variables"}
naive billing status
```

## Buy More Credits

<CodeGroup>
  ```bash CLI theme={"theme":"css-variables"}
  naive billing topup --pack medium
  ```

  ```bash cURL theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/billing/topup \
    -H "Authorization: Bearer nv_sk_..." \
    -H "Content-Type: application/json" \
    -d '{"pack_id": "medium"}'
  ```
</CodeGroup>

## Upgrade Your Plan

<CodeGroup>
  ```bash CLI theme={"theme":"css-variables"}
  naive billing upgrade --plan pro
  ```

  ```bash cURL theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/billing/upgrade \
    -H "Authorization: Bearer nv_sk_..." \
    -H "Content-Type: application/json" \
    -d '{"plan": "pro"}'
  ```
</CodeGroup>

If you have an active subscription, this opens the billing portal where you can change plans with automatic proration.

## Check Billing Status

```bash theme={"theme":"css-variables"}
naive billing status
```

Returns your current plan, subscription status, credits remaining, and period end date.

## What Happens When You Run Out

### Billing Blocked (no active subscription)

If your trial expires or subscription is cancelled, all operations are blocked. The error response includes available plans:

```json theme={"theme":"css-variables"}
{
  "error": {
    "code": "billing_blocked",
    "message": "Your free trial has expired. Subscribe to continue.",
    "block_reason": "trial_expired",
    "plans": [
      { "id": "pro", "name": "Pro", "credits_per_month": 400, "price": "$20/mo" }
    ]
  }
}
```

### Insufficient Credits (balance exhausted)

If you have an active subscription but no credits left, operations fail with available credit packs:

```json theme={"theme":"css-variables"}
{
  "error": {
    "code": "insufficient_credits",
    "message": "Credit balance exhausted.",
    "packs": [
      { "id": "small", "credits": 200, "price": "$10" },
      { "id": "medium", "credits": 500, "price": "$23" },
      { "id": "large", "credits": 1000, "price": "$44" },
      { "id": "xl", "credits": 2500, "price": "$100" }
    ]
  }
}
```

### LLM Routing Requires Payment (free credits, never paid)

Distinct from both of the above, and the only one that is about *which* primitive you called rather than the state of your account. LLM routing is not covered by the free signup credits, so a company that has never bought credits and never subscribed is refused on that surface alone — with credits in the balance and a healthy subscription state:

```json theme={"theme":"css-variables"}
{
  "error": {
    "code": "billing_blocked",
    "message": "LLM routing requires a paid account. The signup credits cover every other primitive, but not model routing.",
    "block_reason": "llm_routing_requires_payment",
    "actions": {
      "topup": "POST /v1/billing/topup",
      "subscribe": "POST /v1/billing/subscribe",
      "view_plans": "GET /v1/billing/plans"
    }
  }
}
```

Read `block_reason`, not the bare `402`. `insufficient_credits` means *add credit and retry*; this one means *the account has never paid*, and it is unchanged by more free credit — a comped grant, however large, does not clear it. One settled top-up or one paid subscription does, permanently. Every other primitive keeps working throughout.

## Manage Subscription

Open the billing portal to update payment method, change plans, or cancel:

```bash theme={"theme":"css-variables"}
naive billing portal
```
