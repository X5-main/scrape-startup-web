> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# billing

> Per-tenant plans, subscriptions, metered usage and quotas for your end-customers.

```ts theme={"theme":"css-variables"}
// Plans (control plane — root client only)
await naive.plans.upsert({
  key: "pro",
  name: "Pro",
  accountKitId: proKit.id,
  stripePriceId: "price_123",
  quotas: { seo: 1000, aeo: 250 },
  period: "month",
});
const { plans } = await naive.plans.list();

// Subscription (per tenant) — assignKit defaults true (applies the plan's Account Kit)
await naive.forUser(userId).billing.setSubscription({
  planKey: "pro",
  status: "active",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  currentPeriodEnd: "2026-07-01T00:00:00Z",
});
await naive.forUser(userId).billing.getSubscription();

// Usage rollup + quotas for the current period
const usage = await naive.forUser(userId).billing.usage();
// { plan, status, period, quotas: { seo: 1000 }, usage: { seo: 42 } }
```

Metered primitives (`seo`, `aeo`, `email`) record usage per successful call and return `429 rate_limited` when a tenant exceeds its plan quota. Distinct from your own [Billing & Credits](/docs/getting-started/billing). See the [Customer Billing guide](/docs/getting-started/customer-billing).
