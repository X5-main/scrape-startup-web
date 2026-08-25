> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Customer Billing

> Bill and rate-limit your own end-customers — plans mapped to Account Kits, per-tenant subscriptions, metered usage, and quota enforcement.

The **Customer Billing** primitive lets a Naive developer monetize *their* SaaS customers. You define **plans** (each mapped to an [Account Kit](/docs/getting-started/account-kits) + per-primitive usage quotas), give each [tenant user](/docs/getting-started/users) a **subscription**, and Naive **meters** their primitive usage and **enforces quotas** automatically.

<Info>
  This is distinct from [**Billing & Credits**](/docs/getting-started/billing), which is *your* own Naive subscription. Customer Billing is the platform side of "charge your users": your app still owns the Stripe charge — Naive owns plan → permissions → quota → usage.
</Info>

## Define plans (control plane)

A plan maps a key to an Account Kit (what the tenant may do) plus quotas (how much, per period).

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

await naive.plans.upsert({
  key: "pro",
  name: "Pro",
  accountKitId: proKit.id,        // assigned to the tenant on subscribe
  stripePriceId: "price_123",     // optional — your Stripe price
  quotas: { seo: 1000, aeo: 250, email: 500 }, // calls per period
  period: "month",
});

const { plans } = await naive.plans.list();
```

## Subscribe a tenant

Typically driven by your Stripe webhook. `assignKit` (default `true`) also applies the plan's Account Kit to the tenant in the same call.

```ts theme={"theme":"css-variables"}
await naive.forUser(tenant.id).billing.setSubscription({
  planKey: "pro",
  status: "active",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  currentPeriodEnd: "2026-07-01T00:00:00Z",
  assignKit: true,
});
```

## Usage + quotas

```ts theme={"theme":"css-variables"}
const usage = await naive.forUser(tenant.id).billing.usage();
// { plan: "pro", status: "active", period: "month",
//   quotas: { seo: 1000, aeo: 250 }, usage: { seo: 42, aeo: 3 } }
```

Metered primitives (currently `seo`, `aeo`, `email`, `llm`, `phone` and `queue`) record one usage event per successful call. When a tenant exceeds the plan's quota for a primitive, the call returns **`429 rate_limited`**:

```json theme={"theme":"css-variables"}
{ "error": { "code": "rate_limited", "message": "Plan quota exceeded for 'seo' (1000/1000 this period)", "used": 1000, "limit": 1000 } }
```

Tenants without a subscription are not quota-limited — seed a free-plan subscription on signup if you want every customer metered.

## REST

```bash theme={"theme":"css-variables"}
# Plans (company)
curl -X POST https://api.usenaive.ai/v1/plans \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"key":"pro","name":"Pro","accountKitId":"<kit>","quotas":{"seo":1000}}'

# Subscription + usage (per tenant)
curl -X PUT https://api.usenaive.ai/v1/users/<user-id>/billing/subscription \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"planKey":"pro"}'
curl https://api.usenaive.ai/v1/users/<user-id>/billing/usage \
  -H "Authorization: Bearer nv_sk_live_..."
```

See the [Customer Billing API reference](/docs/api-reference/customer-billing/overview) and the [`billing` sub-client](/docs/sdk/sub-clients/billing).

## Billing

Free — metering and quota enforcement carry no extra credit cost.
