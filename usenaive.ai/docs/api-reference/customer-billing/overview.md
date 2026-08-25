> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Customer Billing Overview

> Per-tenant plans, subscriptions, metered usage and quota enforcement for your end-customers.

Monetize your own SaaS customers: define **plans** (plan → Account Kit + per-primitive quotas), subscribe each [tenant user](/docs/api-reference/users/create), and Naive meters usage and enforces quotas. Distinct from your own agent profile [Billing](/docs/api-reference/billing/plans) (credits).

## Endpoints

| Method | Path                                      | Description                                                    |
| ------ | ----------------------------------------- | -------------------------------------------------------------- |
| `GET`  | `/v1/plans`                               | List plan definitions (company)                                |
| `POST` | `/v1/plans`                               | Create / update a plan (upsert by `key`)                       |
| `GET`  | `/v1/users/:user_id/billing/subscription` | Get a tenant's subscription                                    |
| `PUT`  | `/v1/users/:user_id/billing/subscription` | Set a tenant's subscription (optionally assign the plan's kit) |
| `GET`  | `/v1/users/:user_id/billing/usage`        | Current-period usage rollup + quotas                           |

## Plans

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/plans \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"key":"pro","name":"Pro","accountKitId":"<kit-id>","stripePriceId":"price_123","quotas":{"seo":1000,"aeo":250},"period":"month"}'
```

`quotas` maps a primitive slug to its max calls per `period` (`month` | `day`).

## Subscription

```bash theme={"theme":"css-variables"}
curl -X PUT https://api.usenaive.ai/v1/users/<user-id>/billing/subscription \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"planKey":"pro","status":"active","stripeCustomerId":"cus_123","assignKit":true}'
```

`assignKit` (default `true`) also assigns the plan's Account Kit to the tenant — one call applies tier permissions + quotas. Drive this from your Stripe webhook.

## Usage & quota enforcement

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/users/<user-id>/billing/usage \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json theme={"theme":"css-variables"}
{ "plan": "pro", "status": "active", "period": "month",
  "quotas": { "seo": 1000, "aeo": 250 }, "usage": { "seo": 42, "aeo": 3 } }
```

Metered primitives (`seo`, `aeo`, `email`) record one usage event per successful call. Exceeding a quota returns `429 rate_limited`. Tenants with no subscription are not limited.

## SDK

```ts theme={"theme":"css-variables"}
await naive.plans.upsert({ key: "pro", name: "Pro", accountKitId, quotas: { seo: 1000 } });
await naive.forUser(userId).billing.setSubscription({ planKey: "pro" });
await naive.forUser(userId).billing.usage();
```

See the [Customer Billing guide](/docs/getting-started/customer-billing) and the [`billing` sub-client](/docs/sdk/sub-clients/billing).
