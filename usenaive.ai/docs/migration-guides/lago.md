> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Lago to Naive

> Move the metering + entitlement layer your agent product runs on — plans, subscriptions, usage tracking, and quota enforcement — off a standalone Lago account and onto Naive's customer-billing primitive, where a plan IS the Account Kit that governs what each customer's agent may do, metered on the same governed identity that owns its cards, email, and phone.

<Frame caption="Lago's plans + metering + entitlements → the Naive customer-billing primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/lago-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=85a064fb9b12f3de0ca87300a6245dc6" alt="Lago" height="26" data-path="migration-guides/logos/lago-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/lago-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=7ff75ffb7a1c421edd81104f8ded46f9" alt="Lago" height="26" data-path="migration-guides/logos/lago-dark.svg" />
</Frame>

<Note>
  Lago is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Lago](https://getlago.com/docs) is an open-source metering and usage-based billing platform: you
define **billable metrics**, attach them to **plans**, subscribe **customers**, then ingest **usage
events** so Lago can aggregate consumption, enforce **entitlements**, and turn it all into invoices.
It does billing extremely well — real-time metering, subscription management, entitlements, payment
orchestration across Stripe/Adyen/GoCardless, and revenue analytics. But when the customer you are
billing is really **an agent that also holds cards, an inbox, a phone number, and a KYC'd
identity**, a Lago account is a *disconnected vendor account*:

* Metering lives behind a **Lago API key**, and each customer is a **Lago customer record** —
  an identity that exists *only inside Lago*, unrelated to where the same agent's cards, email, and
  permissions live.
* Whether the agent's plan actually *lets it use a capability* is an **entitlement you configure in
  Lago and then re-enforce yourself** at the call site — Lago meters and can flag limits, but the
  primitive access it is "entitling" is governed by a different system.
* *"Which plan is this agent on, what has it used this period, and is it allowed to do this right
  now?"* is answered in Lago for usage, and in your own permission code for access — two sources of
  truth for one decision.

Naive's [customer-billing](/docs/getting-started/customer-billing) primitive gives you the **same**
control-plane — define plans, subscribe tenants, meter usage, read a usage rollup — but the plan is
**the same object that governs the agent**:

* A Naive [plan](/docs/getting-started/customer-billing) maps a key to an
  [Account Kit](/docs/getting-started/account-kits) (what the agent *may do*) **plus** per-primitive
  quotas (how much). Subscribing a tenant assigns that kit — so **plan tier → permissions → quota**
  is one call, not a Lago config plus separate entitlement code.
* Usage is metered **automatically on the primitive call itself** — no event pipeline to build,
  secure, and de-duplicate. When a tenant exceeds a quota, the next call is refused with
  **`429 rate_limited`** at execution time.
* Every metered call lands in the same per-user [activity log](/docs/getting-started/logs) as that
  agent's card spend, email sends, and KYC events — one accountability trail.

<Info>
  **Tested against:** the Lago Node client
  [`lago-javascript-client`](https://www.npmjs.com/package/lago-javascript-client) **v1.48.0** (June
  2026\), against the Lago REST API (base `https://api.getlago.com/api/v1`, `Authorization: Bearer`,
  `/billable_metrics`, `/plans`, `/customers`, `/subscriptions`, `/events`, `/customers/{id}/current_usage`
  endpoints, docs snapshot July 2026), and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`,
  `/v1/plans` + `/v1/users/:id/billing/*` endpoints, docs snapshot July 2026).

  Version notes:

  * **Scope differs.** Lago bills *any* SaaS customer. Naive customer-billing bills a
    [tenant user](/docs/getting-started/users) — the same handle (`naive.forUser(id)`) that reaches the
    agent's cards, email, phone, vault, and KYC.
  * **Naive does NOT own the charge.** Naive owns *plan → permissions → quota → usage*. Your app keeps
    its Stripe charge (Naive plans carry an optional `stripePriceId` to link the two). If you rely on
    Lago for invoice generation, payment collection, coupons, wallets, or complex pricing, that stays
    with Lago/Stripe — see [what doesn't map yet](#what-does-not-map-yet).
  * **Metering is built-in, not custom.** Lago meters any `code` you define with any aggregation. Naive
    meters a **fixed, documented set of primitives** (`seo`, `aeo`, `email`) as a per-call count — you
    do not define custom billable metrics. See [gaps](#what-does-not-map-yet).
  * **Ingestion is automatic.** Lago requires you to `POST /events` on every billable action. Naive
    records one usage event per successful metered primitive call — there is no ingestion endpoint to
    call.
</Info>

## Concept map

| Lago                                                                                                              | Naive                                                                                               | Notes                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Client(apiKey)`                                                                                                  | `new Naive({ apiKey })` then `naive.forUser(id)`                                                    | Server-side credential in both cases                                                                       |
| **Customer** (`external_customer_id`) via `customers.createCustomer`                                              | [tenant user](/docs/getting-started/users) via `naive.users.create` / `naive.forUser(id)`                | The Naive id also reaches cards, email, phone, KYC                                                         |
| **Billable metric** (`billableMetrics.createBillableMetric`, `code` + aggregation)                                | Built-in metered primitives (`seo`, `aeo`, `email`)                                                 | You don't define custom metrics — see [gaps](#what-does-not-map-yet)                                       |
| **Plan** (`plans.createPlan`, charges per metric)                                                                 | `naive.plans.upsert({ key, name, accountKitId, quotas, period })` → `POST /v1/plans`                | A Naive plan = an **Account Kit** + per-primitive call quotas (caps, not priced charges)                   |
| — (entitlements configured separately)                                                                            | The plan's **`accountKitId`** decides which primitives the agent may use                            | Permission and plan are the **same object** — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| **Subscription** (`subscriptions.createSubscription({ subscription: { external_customer_id, plan_code } })`)      | `naive.forUser(id).billing.setSubscription({ planKey })` → `PUT /v1/users/:id/billing/subscription` | `assignKit` (default `true`) also applies the plan's Account Kit in the same call                          |
| **Usage event** (`events.createEvent({ event: { code, external_subscription_id, properties } })` on every action) | **Automatic** — one usage event recorded per successful metered primitive call                      | Gain: no event pipeline to build, secure, or de-duplicate                                                  |
| **Current usage** (`customers.findCustomerCurrentUsage(id, { external_subscription_id })`)                        | `naive.forUser(id).billing.usage()` → `GET /v1/users/:id/billing/usage`                             | Returns `{ plan, status, period, quotas, usage }`                                                          |
| Overage / soft usage limit                                                                                        | Hard quota → **`429 rate_limited`** on the next call                                                | Enforced at **execution time**, not reconciled on an invoice                                               |
| `stripe`/`adyen`/`gocardless` payment provider on the customer                                                    | Your app keeps its own Stripe charge; plan carries optional `stripePriceId`                         | Naive owns plan/quota/usage, **not** the charge                                                            |
| **Invoices**, **wallets** (prepaid credits), **coupons**, **add-ons**, **credit notes**, taxes, multi-currency    | —                                                                                                   | Not provided — see [gaps](#what-does-not-map-yet)                                                          |
| **Revenue analytics** (MRR, usage trends)                                                                         | Per-tenant usage rollup only (`billing.usage()`)                                                    | No cross-customer revenue analytics                                                                        |

## Before / after: the core path

The path that matters for a usage-billed agent product is *define a plan → subscribe a customer →
meter their usage → enforce the quota*. Here it is on both platforms.

<CodeGroup>
  ```ts Lago theme={"theme":"css-variables"}
  import { Client } from "lago-javascript-client";

  const lago = Client(process.env.LAGO_API_KEY!);

  // 1. Define a billable metric + plan (usually done once, in dashboard or API).
  await lago.billableMetrics.createBillableMetric({
    billable_metric: { name: "SEO calls", code: "seo", aggregation_type: "count_agg" },
  });
  await lago.plans.createPlan({
    plan: {
      name: "Pro",
      code: "pro",
      interval: "monthly",
      amount_cents: 9900,
      amount_currency: "USD",
      charges: [{ billable_metric_code: "seo", charge_model: "standard", properties: { amount: "0.01" } }],
    },
  });

  // 2. Create the customer + subscribe them to the plan.
  await lago.customers.createCustomer({ customer: { external_id: "acme" } });
  await lago.subscriptions.createSubscription({
    subscription: { external_customer_id: "acme", plan_code: "pro", external_id: "acme_pro" },
  });

  // 3. Meter usage — YOU must POST an event on every billable action.
  await lago.events.createEvent({
    event: {
      transaction_id: crypto.randomUUID(),
      external_subscription_id: "acme_pro",
      code: "seo",
      timestamp: Math.floor(Date.now() / 1000),
      properties: {},
    },
  });

  // Whether "acme" may actually run an SEO call is enforced in YOUR code — Lago
  // meters and can flag limits, but the primitive access lives in another system.
  const usage = await lago.customers.findCustomerCurrentUsage("acme", {
    external_subscription_id: "acme_pro",
  });
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // 1. Define a plan = an Account Kit (permissions) + per-primitive quotas.
  const proKit = await naive.accountKits.create({
    name: "Pro",
    primitives_config: { seo: { enabled: true }, aeo: { enabled: true }, email: { enabled: true } },
  });
  await naive.plans.upsert({
    key: "pro",
    name: "Pro",
    accountKitId: proKit.id,
    stripePriceId: "price_123",       // optional — link YOUR Stripe price
    quotas: { seo: 1000, aeo: 250 },  // calls per period
    period: "month",
  });

  // 2. Subscribe the tenant — assignKit (default true) applies the plan's kit,
  //    so plan tier → permissions → quota is one call.
  await naive.forUser("acme").billing.setSubscription({
    planKey: "pro",
    status: "active",
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
  });

  // 3. Metering is automatic. A successful SEO/AEO/email call records one usage
  //    event; over quota → the next call is refused with 429 rate_limited.
  const usage = await naive.forUser("acme").billing.usage();
  // { plan: "pro", status: "active", period: "month",
  //   quotas: { seo: 1000, aeo: 250 }, usage: { seo: 42 } }
  ```
</CodeGroup>

The control-plane shape lines up closely. The real differences to plan for:

* **The plan carries permissions.** A Naive plan references an `accountKitId`; subscribing assigns
  it. There is no separate "entitlement" object to keep in sync — the plan *is* the entitlement.
* **No event ingestion.** Delete your `events.createEvent(...)` calls. Naive meters `seo`, `aeo`, and
  `email` on the primitive call itself; you never post usage.
* **Quotas are caps, not charges.** Lago prices each metered unit; Naive quotas are per-period call
  limits that return `429` when exceeded. Pricing/collection stays in your Stripe.
* **Usage rollup is per tenant.** `billing.usage()` returns the tenant's quotas + consumption for the
  current period — the analogue of `findCustomerCurrentUsage`.

## Minimal viable migration

The smallest swap that keeps a working, metered product running is *plan → subscribe → let metering
run*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Recreate your plans as Account Kit + quotas">
    For each Lago plan, create an [Account Kit](/docs/getting-started/account-kits) enabling the primitives
    that tier may use, then `naive.plans.upsert({ key, name, accountKitId, quotas, period })`. Map
    your Lago plan `code` → Naive plan `key`, and your metered limits → `quotas` (per-primitive call
    caps). Carry your Stripe price across via the optional `stripePriceId`.
  </Step>

  <Step title="Reflect subscriptions from your Stripe webhook">
    Replace `subscriptions.createSubscription(...)` with
    `naive.forUser(tenantId).billing.setSubscription({ planKey, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd })`.
    Drive it from the same Stripe webhook you already run. `assignKit` defaults to `true`, so the
    plan's Account Kit is applied in the same call.
  </Step>

  <Step title="Delete the event ingestion path">
    Remove your `events.createEvent(...)` calls for the metered primitives. Naive records usage
    automatically on each successful `seo`, `aeo`, and `email` call — there is no ingestion endpoint.
  </Step>

  <Step title="Swap the usage read">
    Map `customers.findCustomerCurrentUsage(id, ...)` → `naive.forUser(id).billing.usage()` for the
    current-period rollup + quotas.
  </Step>

  <Step title="Keep Stripe for the charge, then ship">
    Your app still owns invoicing/payment through Stripe (Naive doesn't charge). At this point the
    metering + entitlement layer is off Lago. Everything below is upside.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Lago, a plan meters usage and (via entitlements) can
describe access — but the primitives it entitles are governed elsewhere, so "billing plan" and
"permission set" are two systems you keep in sync. On Naive, the plan **is** the
[Account Kit](/docs/getting-started/account-kits): the object that bills the customer is the object that
governs their agent.

<CodeGroup>
  ```ts Lago (billing plane only) theme={"theme":"css-variables"}
  // Lago knows "acme is on Pro and used 42 SEO calls".
  await lago.subscriptions.createSubscription({
    subscription: { external_customer_id: "acme", plan_code: "pro", external_id: "acme_pro" },
  });
  await lago.events.createEvent({
    event: { transaction_id: crypto.randomUUID(), external_subscription_id: "acme_pro", code: "seo", properties: {} },
  });

  // But whether acme's agent may issue a card, send email, or run SEO at all is
  // enforced in a DIFFERENT system — Lago doesn't govern the primitive.
  ```

  ```ts Naive (billing plane + permission plane are one object) theme={"theme":"css-variables"}
  // One tenant user per customer; the same handle reaches every primitive.
  const acme = await naive.users.create({ external_id: dbCustomer.id, email: dbCustomer.email });

  // Subscribing to "pro" assigns the plan's Account Kit — so being on Pro IS
  // what lets the agent use these primitives, capped by the plan's quotas.
  await naive.forUser(acme.id).billing.setSubscription({ planKey: "pro", status: "active" });

  // The SAME client owns this customer's card, inbox, and phone — one account,
  // one budget, one audit trail, every capability governed by the plan's kit.
  await naive.forUser(acme.id).cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await naive.forUser(acme.id).email.createInbox({ local_part: "ops" });
  ```
</CodeGroup>

### Gain #1 — one identity across billing and capability

* With Lago, a customer is a billing record; the agent's cards, email, phone, and permissions live in
  other systems. With Naive, `naive.forUser(acme.id)` is a single handle to the agent's **plan *and*
  primitives *and* permissions *and* audit trail** — no separate customer record to reconcile.
* Downgrading a customer's plan re-assigns their Account Kit, which **immediately** changes what their
  agent may do — no second write to a permission system, no drift between "what they pay for" and
  "what they can touch".

### Gain #2 — execution-time permission enforcement

* A plan's `accountKitId` decides which primitives the agent may use, and quotas cap how much — both
  enforced **at the moment of the call**, not reconciled later on an invoice.

```ts theme={"theme":"css-variables"}
// A free tier that can do AEO but not SEO, and is capped tightly.
const freeKit = await naive.accountKits.create({
  name: "Free",
  primitives_config: { aeo: { enabled: true }, seo: { enabled: false } }, // seo → forbidden
});
await naive.plans.upsert({ key: "free", name: "Free", accountKitId: freeKit.id, quotas: { aeo: 25 } });
```

* The agent's code path stays the same for every tier. A tenant whose plan doesn't enable `seo` is refused
  with `forbidden`; a tenant over its `aeo` quota is refused with **`429 rate_limited`** — with **no
  code change** on your side:

```json theme={"theme":"css-variables"}
{ "error": { "code": "rate_limited", "message": "Plan quota exceeded for 'aeo' (25/25 this period)", "used": 25, "limit": 25 } }
```

* In Lago, exceeding a metered limit typically means an overage *charge* reconciled on the next
  invoice; on Naive the quota is a hard, execution-time gate. The two models are complementary —
  keep Stripe for the money, let Naive stop the call.

### Gain #3 — unified accountability

* Every metered call records the **acting agent** and lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside that customer's card spend, email sends, and KYC
  events, not in a separate Lago usage stream:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this customer's agent do, and against which plan?" — SEO/AEO/email
// usage, card spend, and email sends on one timeline.
```

* That is the question that is hard to answer when usage lives in Lago, permissions live in your code,
  and the agent's spend lives in Stripe. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The **metering + entitlement + quota** layer
maps cleanly and fuses with the agent's permission model — but Lago is a full **billing** platform,
and several of its capabilities have **no equivalent** on Naive's customer-billing primitive today.
Naive is explicit that it owns *plan → permissions → quota → usage*, **not the charge**. Check this
list against your app before you commit.

| Lago feature                                                                                                  | Status on Naive                                                                   | Workaround                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoicing + payment collection** (Stripe/Adyen/GoCardless, dunning, retries)                                | **Not provided** — Naive doesn't generate invoices or move money                  | Keep your Stripe charge; link it via the plan's optional `stripePriceId` and drive `setSubscription` from your Stripe webhook                         |
| **Custom billable metrics** (any `code`, `count`/`sum`/`max`/`unique`/`weighted` aggregation, charge filters) | **Not provided** — Naive meters a fixed set of primitives as a per-call **count** | Meter custom app dimensions in your own store / keep Lago for those metrics                                                                           |
| **Metered primitive coverage**                                                                                | Documented metered set is **`seo`, `aeo`, `email`**                               | Other primitives are gated + budgeted, but not plan-quota-metered; track them via [logs](/docs/getting-started/logs) / [billing](/docs/getting-started/billing) |
| **Priced usage / overage billing**                                                                            | **Not provided** — quotas are hard caps (`429`), not priced charges               | Price usage in Stripe; use Naive quotas as the enforcement gate                                                                                       |
| **Wallets / prepaid credits**, **coupons**, **add-ons**, **credit notes**                                     | Not provided                                                                      | Keep in Lago/Stripe                                                                                                                                   |
| **Taxes + multi-currency**, **billing entities**                                                              | Not provided                                                                      | Handle in your Stripe/tax stack                                                                                                                       |
| **Revenue analytics** (MRR, usage trends, cross-customer)                                                     | Per-tenant usage rollup only (`billing.usage()`)                                  | Aggregate from your own store or keep Lago analytics                                                                                                  |
| **Batch event ingestion**, historical event backfill/editing                                                  | Not applicable — metering is automatic per call, not ingested                     | N/A (no ingestion endpoint)                                                                                                                           |
| **Aggregation period flexibility**                                                                            | `period` is `month` or `day`                                                      | Choose the closest of the two                                                                                                                         |

<Warning>
  The biggest thing to weigh is **scope**, not method. Lago is an end-to-end *billing* platform:
  metering **and** invoicing **and** payment collection **and** pricing. Naive's customer-billing
  primitive deliberately owns only *plan → permissions → quota → usage* — it does **not** issue
  invoices or collect payment, and it meters a fixed set of primitives (`seo`, `aeo`, `email`) as
  counts rather than arbitrary priced metrics. The right migration is to move the **entitlement +
  metering + quota-enforcement** layer onto Naive (so it is fused with the identity that governs the
  agent) while **keeping Stripe** for the actual charge. If Lago is load-bearing for invoicing,
  prepaid wallets, coupons, complex per-unit pricing, or custom billable metrics, keep that part of
  Lago/Stripe and adopt Naive for the permission-and-quota plane — don't expect a full billing-stack
  replacement today.
</Warning>

## Where to go next

* [Customer Billing primitive](/docs/getting-started/customer-billing) — plans → Account Kits, per-tenant subscriptions, metered usage, and quota enforcement
* [`billing` SDK sub-client](/docs/sdk/sub-clients/billing) — typed `plans.upsert` / `setSubscription` / `usage`
* [Account Kits](/docs/getting-started/account-kits) — the permission object a plan assigns, enforced per user at execution time
* [Tenant users](/docs/getting-started/users) — the identity a subscription, usage, cards, email, and KYC all hang off
* [Billing & Credits](/docs/getting-started/billing) — your own Naive subscription (distinct from billing *your* customers)
* [Logs](/docs/getting-started/logs) — the unified per-user activity trail every metered call lands in

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Email Marketing Platform](https://usenaive.ai/blog/how-to-build-an-agentic-email-marketing-platform) — customer billing tutorial
