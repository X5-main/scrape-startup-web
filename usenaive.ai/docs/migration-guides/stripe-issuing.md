> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Stripe Issuing to Naive

> Move agent card issuing from a standalone Stripe Issuing integration to Naive's /cards primitive — the same Visa/Mastercard virtual cards, but rooted in one governed identity that also owns the agent's email, vault, KYC, and connections, with issuance and funding gated at execution time.

<Frame caption="Stripe Issuing's standalone card platform → the Naive /cards primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/stripe-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=1a1f76968ac100c3b8383564d86b4f0f" alt="Stripe" height="28" data-path="migration-guides/logos/stripe-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/stripe-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=a3f1ccf27e15474d50bd4331a6e107b8" alt="Stripe" height="28" data-path="migration-guides/logos/stripe-dark.svg" />
</Frame>

[Stripe Issuing](https://stripe.com/issuing) lets you spin up virtual (and physical) Visa/Mastercard
cards programmatically — create a `Cardholder`, issue a `Card` against it, set `spending_controls`,
and watch authorizations and transactions stream in. It is a genuinely powerful card platform, and
the API is excellent. But run directly, it is also a *separate vendor account*:

* Cards live behind your **Stripe** secret key, Stripe dashboard, and Stripe's `Cardholder` /
  `Card` object graph — funded from a pooled Issuing/Treasury balance you top up yourself.
* A Stripe `Cardholder` scopes **cards and nothing else**. It is a KYC entity for issuing — it has
  no idea about the agent's inbox, its vault secrets, its OAuth connections, or any other KYC you ran.
* "Who let this agent issue a \$5k card, and what *else* can this agent touch?" is answered in Stripe
  for cards, and in unrelated systems for everything else. There is no shared accountability.

Naive's [`/cards`](/docs/getting-started/cards) primitive gives the agent the **same** capability —
full Visa/Mastercard virtual cards via the `managed_virtual` provider — but rooted in
**one identity**:

* The [tenant user](/docs/getting-started/users) that holds a card is the same user that owns its
  [email](/docs/getting-started/email) inbox, its [vault](/docs/getting-started/vault) secrets, its
  [KYC](/docs/getting-started/verification), and its [connections](/docs/getting-started/connections).
* Whether an agent may **issue or fund** a card — and up to what total — is decided by that user's
  [Account Kit](/docs/getting-started/account-kits) **at execution time**, not by trusting your own code
  to check first.
* Every cardholder create, card issue, top-up, and transaction lands in the same per-user
  [activity log](/docs/getting-started/logs) as everything else the agent does.

This guide maps Stripe Issuing's API to Naive's, shows the smallest working swap, and is explicit
about what does **not** map yet (Stripe Issuing has real per-authorization controls that Naive does
not match today — read the [gaps](#what-does-not-map-yet) before you commit).

<Note>
  Stripe and related marks are trademarks of Stripe, Inc., used here for identification only. Naive is not affiliated with or endorsed by Stripe; card funding may use hosted checkout, but this guide does not describe Stripe's internal Issuing implementation.
</Note>

<Info>
  **Tested against:** Stripe Node SDK [`stripe`](https://github.com/stripe/stripe-node) v17 (Issuing
  API, versions `2025-12-15` / `2026-04-22`, per [docs.stripe.com/api/issuing](https://docs.stripe.com/api/issuing),
  snapshot June 2026) and the Naive API (base `https://api.usenaive.ai/v1`, docs snapshot June 2026)
  plus the Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview).

  Version notes:

  * Naive's `managed_virtual` provider issues a full Visa/Mastercard virtual card (cardholder
    required, no spending cap); the default `prepaid_gift` provider is a prepaid Visa gift card
    (capped at \$150, no cardholder). This guide targets `managed_virtual`, the closest match to a
    direct Stripe Issuing card.
  * Stripe Issuing card credentials (`number`, `cvc`) are retrieved via `cards.retrieve(id, { expand })`
    and require your platform to be PCI-compliant or to use Stripe Elements. Naive returns them from
    `GET /v1/cards/:id/details` once the card is `active`.
  * Both are evolving APIs — verify method names and the funding model against your installed
    versions.
</Info>

## Concept map

| Stripe Issuing                                                                             | Naive                                                                                      | Notes                                                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `new Stripe(secretKey)`                                                                    | `new Naive({ apiKey })`                                                                    | Server-side key in both cases                                                                                    |
| `Cardholder` (`ich_…`) scopes **cards only**                                               | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive | The core consolidation win                                                                                       |
| `stripe.issuing.cardholders.create({ name, billing, … })`                                  | `POST /v1/cards/cardholder` (`firstName`, `lastName`, `billing…`, `dob…`)                  | One cardholder per identity; required for `managed_virtual`                                                      |
| `stripe.issuing.cardholders.retrieve(id)`                                                  | `GET /v1/cards/cardholder`                                                                 | Reads the current identity's cardholder                                                                          |
| `stripe.issuing.cards.create({ cardholder, type:"virtual", currency, spending_controls })` | `POST /v1/cards` with `{ name, spending_limit_cents, provider:"managed_virtual" }`         | Naive funds via hosted checkout → returns `checkout_url`                                                         |
| `stripe.issuing.cards.retrieve(id, { expand:["number","cvc"] })`                           | `GET /v1/cards/:id/details`                                                                | Returns `number`, `cvc`, `exp_month`, `exp_year` once `active`                                                   |
| `stripe.issuing.cards.list()`                                                              | `GET /v1/cards` / `client.cards.list()`                                                    | List cards for the identity                                                                                      |
| Fund from Issuing/Treasury **balance** (top up the balance)                                | `POST /v1/cards/:id/top-up` `{ amount_cents }` → `checkout_url`                            | Naive funds **per card** via checkout, not a pooled balance                                                      |
| `stripe.issuing.cards.update(id, { status:"canceled" })`                                   | `DELETE /v1/cards/:id`                                                                     | Deactivate a card                                                                                                |
| `stripe.issuing.transactions.list({ card })`                                               | `GET /v1/cards/transactions?card_id=`                                                      | Settled spend per card                                                                                           |
| `spending_controls.spending_limits[]` (per-interval, per-MCC)                              | `spending_limit_cents` (single funded cap per card)                                        | **Partial** — see [gaps](#what-does-not-map-yet); no MCC / interval controls                                     |
| `issuing_authorization.request` webhook → approve/decline per swipe                        | **Account Kit** gating + [Approvals](/docs/getting-started/approvals) on **issue / top-up**     | Different layer — Naive governs *issuance & funding*, not each authorization. See [gaps](#what-does-not-map-yet) |
| Stripe Connect / per-account Issuing                                                       | [Account Kit](/docs/getting-started/account-kits) `primitives_config.cards` per tenant user     | Execution-time policy, per identity — the governance win                                                         |
| Physical cards, disputes, multi-currency                                                   | —                                                                                          | Not on `/cards` today — see [gaps](#what-does-not-map-yet)                                                       |

## Before / after: the core path

The path that matters for almost every agent that spends money is *register a cardholder, issue a
card, then read its credentials*. Here it is on both platforms.

<CodeGroup>
  ```ts Stripe Issuing theme={"theme":"css-variables"}
  import Stripe from "stripe";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // 1. Create the cardholder (KYC entity)
  const cardholder = await stripe.issuing.cardholders.create({
    type: "individual",
    name: "John Doe",
    email: "john@acme.com",
    billing: {
      address: {
        line1: "123 Main St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94105",
        country: "US",
      },
    },
  });

  // 2. Issue a virtual card with spending controls, funded from your Issuing balance
  const card = await stripe.issuing.cards.create({
    cardholder: cardholder.id,
    type: "virtual",
    currency: "usd",
    spending_controls: {
      spending_limits: [{ amount: 10000, interval: "monthly" }], // $100/mo
    },
  });

  // 3. Reveal the PAN/CVC (requires PCI compliance or Stripe Elements)
  const full = await stripe.issuing.cards.retrieve(card.id, {
    expand: ["number", "cvc"],
  });
  // full.number, full.cvc, full.exp_month, full.exp_year
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("user_123"); // same id space as your own users
  const base = "https://api.usenaive.ai/v1/users/user_123";
  const auth = { Authorization: `Bearer ${process.env.NAIVE_API_KEY}`, "Content-Type": "application/json" };

  // 1. Create the cardholder for this identity (required for managed_virtual)
  await fetch(`${base}/cards/cardholder`, {
    method: "POST", headers: auth,
    body: JSON.stringify({
      firstName: "John", lastName: "Doe", email: "john@acme.com",
      billingLine1: "123 Main St", billingCity: "San Francisco",
      billingState: "CA", billingPostalCode: "94105",
      dobDay: 15, dobMonth: 6, dobYear: 1990,
    }),
  });

  // 2. Issue a card — funded via hosted checkout, returns checkout_url
  const created = await client.cards.create({
    name: "Ops Card",
    spending_limit_cents: 10000, // $100 funded cap
    provider: "managed_virtual",
  });
  // open created.checkout_url to fund, then issue:
  await fetch(`${base}/cards/${created.card.id}/check-payment`, { method: "POST", headers: auth });

  // 3. Reveal the PAN/CVC once active
  const details = await (await fetch(`${base}/cards/${created.card.id}/details`, { headers: auth })).json();
  // details.number, details.cvc, details.exp_month, details.exp_year
  ```
</CodeGroup>

The cardholder → card → credentials shape lines up closely. The real differences to plan for:

* **Funding model.** Stripe Issuing typically draws from a pooled Issuing/Treasury balance you
  top up. Naive funds **each card** through a hosted checkout (`checkout_url`) for the card's
  amount, then issues it on `check-payment`. There is no shared balance to manage.
* **Spend limits.** Stripe's `spending_controls` can include per-interval and per-MCC rules.
  Naive's `spending_limit_cents` is a **single funded cap** per card — simpler, but not
  category- or interval-aware. See the [gaps](#what-does-not-map-yet).
* **The cardholder is your identity, not a standalone KYC object.** In Stripe a `Cardholder`
  exists *only* for issuing. In Naive the cardholder hangs off a [tenant user](/docs/getting-started/users)
  that also owns the agent's inbox, vault, connections, and KYC.

### Funding and issuing

Both platforms separate "create the card" from "the card can spend." Stripe does it with a balance;
Naive does it with a per-card checkout.

<CodeGroup>
  ```ts Stripe Issuing theme={"theme":"css-variables"}
  // You pre-fund your Issuing balance (Treasury / top-ups) out of band;
  // the card is spendable as soon as it is created and your balance covers it.
  const card = await stripe.issuing.cards.create({
    cardholder: "ich_123", type: "virtual", currency: "usd",
    spending_controls: { spending_limits: [{ amount: 50000, interval: "monthly" }] },
  });
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // Each card is funded by its own checkout; top-up later the same way.
  const created = await client.cards.create({ name: "Ads", spending_limit_cents: 50000, provider: "managed_virtual" });
  // → created.checkout_url  (fund it), then:
  //   POST /v1/users/{id}/cards/{cardId}/check-payment  → status: "active"
  //   POST /v1/users/{id}/cards/{cardId}/top-up { amount_cents }  → another checkout_url
  ```
</CodeGroup>

* On Naive, **issuing a card, creating a cardholder, and topping up are sensitive** and may be
  [approval-gated](/docs/getting-started/approvals) by the Account Kit — the call can return
  `202 { status: "pending_approval", approval_id }` until a human approves, then the API replays it.
* A card's status moves `pending_payment → active` after `check-payment` confirms funding. See
  [Card statuses](/docs/getting-started/cards#card-statuses).

## Minimal viable migration

The smallest swap that keeps a spending agent running is *cardholder → issue → reveal*. You do not
need to recreate Treasury, per-MCC controls, or Account Kits to make your first card.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Map your users">
    A Stripe `Cardholder` becomes a Naive [tenant user](/docs/getting-started/users) with a cardholder
    attached. Reuse your own database id as `external_id` so the mapping is 1:1, or pass it straight
    into `naive.forUser(id)`.
  </Step>

  <Step title="Recreate the cardholder once per identity">
    Replace `stripe.issuing.cardholders.create({ name, billing })` with
    `POST /v1/cards/cardholder` (`firstName`, `lastName`, `billing…`, `dob…`). One cardholder per
    tenant user covers all of that user's `managed_virtual` cards.
  </Step>

  <Step title="Swap card issuance">
    Replace `stripe.issuing.cards.create` with `client.cards.create({ name, spending_limit_cents,
            provider: "managed_virtual" })`, open the returned `checkout_url`, then `check-payment` to issue.
  </Step>

  <Step title="Read credentials and ship">
    Replace `cards.retrieve(id, { expand:["number","cvc"] })` with `GET /v1/cards/:id/details`.
    At this point you are off your direct Stripe Issuing integration for the core path. Everything
    below is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. With Stripe Issuing direct, a `Cardholder` isolates
**cards and nothing else**. On Naive, the unit of isolation is a **tenant user**, and it isolates
the agent's *entire* footprint.

<CodeGroup>
  ```ts Stripe Issuing (cardholder — cards only) theme={"theme":"css-variables"}
  // One cardholder per customer; isolates cards, and only cards.
  const ch = await stripe.issuing.cardholders.create({ type: "individual", name: "Acme Bot", billing });
  await stripe.issuing.cards.create({ cardholder: ch.id, type: "virtual", currency: "usd" });

  // The inbox, the secrets, the OAuth grants, the KYC for this customer's agent
  // live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  import { isPendingApproval } from "@usenaive-sdk/server";

  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({ external_id: dbCustomer.id, email: dbCustomer.email });
  const client = naive.forUser(acme.id);

  // Same identity owns the card…
  const card = await client.cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });
  if (isPendingApproval(card)) { /* surface card.approval_id to a human */ }

  // …and the inbox, the secrets, the connections, the KYC — one handle.
  const inbox = await client.email.createInbox({ local_part: "billing" });
  await client.vault.put("internal.api_key", "key_xyz");
  await client.connections.connect("quickbooks", { callbackUrl });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Stripe Issuing, the agent's cards are an island. With Naive, `naive.forUser(acme.id)` is a
  single handle to **cards *and* email *and* vault *and* connections *and* KYC**.
* You provision a customer's whole agent footprint from one identity, and tear it down from one
  place. Sibling tenants can never read each other's cards, secrets, or inboxes.

### Gain #2 — execution-time permission enforcement

* Whether an agent may **issue or fund** a card is **policy on the Account Kit** — not a check you
  hand-write, and not "we trust the agent to call the right function."

```ts theme={"theme":"css-variables"}
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    cards: { enabled: true, requiresApproval: true }, // issuing/top-up freezes for a human
    email: { enabled: true },
    vault: { enabled: true },
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);
```

* The agent's code is identical for every tier — `client.cards.create({ … })`. Whether the call
  runs is decided by the **caller's kit at execution time**:
  * `primitives_config.cards.enabled: false` → the exact same line returns `forbidden`, no code change.
  * `requiresApproval: true` → issuing, cardholder creation, and top-ups freeze as a
    [pending approval](/docs/getting-started/approvals); the API replays them only after a human approves.
  * The funded `spending_limit_cents` caps how much was loaded onto the card — spend is generally
    bounded by that funded amount, though treat issuer/network behavior as authoritative for edge cases.
* Stripe gates *who has Issuing access* at the Connect-account level and per-authorization via your
  own webhook logic. Naive additionally gates *the issuance and funding decision* per tenant user,
  declaratively, with no per-swipe handler to run. (Per-authorization MCC control is still a Stripe
  strength — see [gaps](#what-does-not-map-yet).)

### Gain #3 — unified accountability

* Every cardholder create, card issue, top-up, and transaction for a customer lands in *one*
  per-user [activity log](/docs/getting-started/logs) — alongside their email, vault, and connection
  events, not in a separate Stripe dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent spend, and what else did it do?" — cards, email, secrets, one timeline
```

* That is the question that is hard to answer when cards live in Stripe, email lives in another
  vendor, and secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (cardholder → issue → reveal →
transactions → cancel) maps cleanly, but Stripe Issuing has real capabilities Naive's `/cards` does
not match today. Check this list against your app **before** you commit — some of these are why you
might *stay* on Stripe Issuing direct.

| Stripe Issuing feature                                                                                                         | Status on Naive                                                                 | Workaround                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-time authorization control** (`issuing_authorization.request` webhook → approve/decline each swipe within \~2s)         | Not available                                                                   | Naive enforces at *issuance/funding* time (Account-Kit + Approvals) and via the hard funded cap; there is no per-authorization decision hook |
| **`spending_controls`** — per-interval limits, `allowed_categories` / `blocked_categories` (MCC), `blocked_merchant_countries` | **Partial** — only a single funded `spending_limit_cents` cap                   | Issue narrowly-funded, single-purpose cards; gate issuance via the Account Kit; reconcile MCCs from the transactions feed                    |
| **Pooled Issuing / Treasury balance** funding                                                                                  | Not exposed — each card is funded by its own checkout                           | Fund per card via `checkout_url`; top up with `POST /cards/:id/top-up`                                                                       |
| **Physical cards** (shipping, activation, PIN)                                                                                 | Not available — virtual only (`managed_virtual` / `prepaid_gift`)               | Use virtual cards; no physical issuance today                                                                                                |
| **Disputes** (`issuing.disputes.*`)                                                                                            | Not available                                                                   | Handle disputes out of band; Naive `refund` covers failed-payment refunds only                                                               |
| **Multi-currency** issuing                                                                                                     | Not exposed — USD checkout funding                                              | USD only today                                                                                                                               |
| **Stripe Connect** (issue on behalf of connected accounts)                                                                     | Different model — per-tenant-user [Account Kits](/docs/getting-started/account-kits) | Map each connected account to a Naive tenant user                                                                                            |
| **Card programs / commercial financing, rewards**                                                                              | Not available                                                                   | Out of scope for `/cards`                                                                                                                    |

<Warning>
  If your agent relies on **real-time per-authorization decisions**, **MCC/interval spending
  controls**, **physical cards**, or **disputes**, those are the gaps most likely to block you — keep
  those workloads on Stripe Issuing direct for now. The cardholder → issue → fund → reveal →
  transactions loop, with Account-Kit governance over *who can issue and fund* — the most common
  agent-spend pattern — maps cleanly today.
</Warning>

## Where to go next

* [`/cards` primitive](/docs/getting-started/cards) — full cardholder/issue/fund/transaction lifecycle
* [Cards API reference](/docs/api-reference/cards/create) — exact request/response shapes
* [`cards` SDK sub-client](/docs/sdk/sub-clients/cards) — typed method signatures
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model that makes execution-time issuance governance real
* [Tenant users](/docs/getting-started/users) — the identity that the consolidation hangs off

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [Spend Caps Approvals Revocation For Ai Agents](https://usenaive.ai/blog/spend-caps-approvals-revocation-for-ai-agents) — card spend caps and approval gates
