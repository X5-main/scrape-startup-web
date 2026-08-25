> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# plans

> Define the subscription plans you sell to your own customers (root client only).

`naive.plans` is a **control-plane** accessor and exists on the root client only. A plan binds
a price, an [Account Kit](/docs/architecture/account-kits) and a set of per-period quotas; a tenant
is put on one through [billing](/docs/sdk/sub-clients/billing).

```ts theme={"theme":"css-variables"}
await naive.plans.upsert({
  key: "pro",                       // your stable identifier — upsert is keyed on it
  name: "Pro",
  accountKitId: proKit.id,          // the kit applied when a tenant subscribes
  stripePriceId: "price_123",
  quotas: { seo: 1000, aeo: 250 },  // per period, per metered primitive
  period: "month",                  // "month" | "day"
});

const { plans } = await naive.plans.list();
```

| Method                                                                   | HTTP             | Notes                             |
| ------------------------------------------------------------------------ | ---------------- | --------------------------------- |
| `list()`                                                                 | `GET /v1/plans`  | Every plan you have defined.      |
| `upsert({ key, name, accountKitId?, stripePriceId?, quotas?, period? })` | `POST /v1/plans` | Create or update, keyed on `key`. |

Assign a tenant with
`naive.forUser(id).billing.setSubscription({ planKey: "pro", … })` — which applies the plan's
Account Kit by default. Metered primitives return `429 rate_limited` once a tenant is over its
quota for the period. This is the billing you charge **your** customers; your own Naive spend is
[Billing & Credits](/docs/getting-started/billing). See the
[Customer Billing guide](/docs/getting-started/customer-billing).
