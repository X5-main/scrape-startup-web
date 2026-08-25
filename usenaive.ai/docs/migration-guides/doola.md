> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Doola to Naive

> Move US company formation from Doola's standalone Formation API to Naive's formation primitive — the same end-to-end incorporation (state filing, EIN, registered agent, documents), but the company is formed under the same KYC-verified identity that then owns its cards, phone, email, and vault, with filing gated by the Account Kit at execution time.

<Frame caption="Doola's Formation API → the Naive formation primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/doola-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=f309490beec5698ee51afba0e5741b8c" alt="Doola" height="28" data-path="migration-guides/logos/doola-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/doola-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=a2298ee148607adc1e52c4da66a4b0fd" alt="Doola" height="28" data-path="migration-guides/logos/doola-dark.svg" />
</Frame>

[Doola](https://www.doola.com/formation-api/) offers a **Formation API** that lets
platforms and AI agents embed US company formation in their product. The shape is typically a
two-step flow: **create a customer**, then **submit a company formation** (`POST /v1/companies`
with entity type, state, and founder details, returning an order id), with asynchronous progress
often delivered over signature-verified webhooks. It can handle state filing, EIN, registered
agent, and documents for many founder profiles. But run
directly, it is also a *separate vendor account*:

* Formation lives behind your **Doola** partner API key, the Doola partner portal, and Doola's
  `customer` / `company` object graph — granted only after a signed partner agreement.
* A Doola `customer` scopes **company formation and compliance, and nothing else**. It is an
  onboarding record for filing — it has no idea about the agent's KYC, its inbox, its vault secrets,
  its virtual card, or its phone number.
* "Who let this agent incorporate a company, and what *else* can this agent touch?" is answered in
  Doola for the filing, and in unrelated systems for everything else. There is no shared
  accountability across the company's footprint.

Naive's [`formation`](/docs/getting-started/formation) primitive gives the agent the **same**
capability — end-to-end LLC incorporation with state filing, EIN, registered agent, and downloadable
documents — but rooted in **one identity**:

* The [tenant user](/docs/getting-started/users) that forms the company is the same user whose founders
  were [KYC-verified](/docs/getting-started/verification), and that then owns its
  [cards](/docs/getting-started/cards), [phone number](/docs/getting-started/phone),
  [email inboxes](/docs/getting-started/email), and [vault](/docs/getting-started/vault) secrets.
* Verified PII (SSN, DOB, member addresses) is pulled from the encrypted identity
  [vault](/docs/architecture/vault-encryption) at submission time — it never lands in your database.
* Whether an agent may **file a formation** — and whether it freezes for a human first — is decided
  by that user's [Account Kit](/docs/getting-started/account-kits) **at execution time**, not by trusting
  your own code to check first.
* Every verification, formation submit, document fetch, card issue, and phone provision lands in the
  same per-user [activity log](/docs/getting-started/logs).

This guide maps Doola's Formation API to Naive's, shows the smallest working swap, and is explicit
about what does **not** map yet (Doola may support entity types and founder profiles Naive does not
match today — read the [gaps](#what-does-not-map-yet) before you commit).

<Note>
  Doola is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Warning>
  **Scope this migration before you start.** Naive's `formation` primitive is **US LLC incorporation
  for KYC-verified founders** — the people who *own and form* the company.

  * If you use Doola to **form US LLCs for founders you can KYC**, this is a clean migration and the
    consolidation win is real.
  * If you depend on **C-corp / DAO LLC** entity types, **non-US founders without verifiable SSN**,
    a **white-label or wholesale-pricing** commercial model, or **ongoing compliance** (annual filings,
    bookkeeping, taxes), those do **not** map to Naive today. Keep Doola for that. See
    [what doesn't map yet](#what-does-not-map-yet).
</Warning>

<Info>
  **Tested against:** the Doola Formation API (partner docs at
  `developers.doola.com`, REST surface `POST /v1/companies` plus a GraphQL API at `POST /graphql`,
  signature-verified webhooks, sandbox + production environments) and the Naive API
  (base `https://api.usenaive.ai/v1`, docs snapshot June 2026) plus the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview).

  Version notes:

  * Doola's **full request/response schema** (GraphQL types and REST bodies) is gated behind a signed
    partner agreement. The Doola code below reflects Doola's **public** launch materials (the
    [Formation API page](https://www.doola.com/formation-api/), the
    [launch announcement](https://www.ycombinator.com/launches/HWm-doola-company-formation-api), and
    the [engineering blog](https://www.doola.com/blog/doola-company-formation-api/)) and is
    **illustrative** — verify exact field names against your partner docs.
  * Naive forms **LLCs only** today (`entity_type: "LLC"`); Doola also forms **C-corps** and **DAO
    LLCs**. See [gaps](#what-does-not-map-yet).
  * Naive **requires** founder KYC — a `verification_id` whose `ready_for_formation` is `true` — before
    formation. Doola does not require KYC for most formation use cases. This is a structural
    difference, not a flag you toggle. See [gaps](#what-does-not-map-yet).
  * Doola is **webhook-first** (`Formation Filed` / `Formation Completed` / `Registered Agent
    Assigned`). Naive's public webhook surface advertises only `email.received`, `sms.received`, and
    `approval.resolved` today, so formation status comes from polling [`GET /v1/formation/:id`](/docs/getting-started/formation).
    Treat `GET /v1/webhooks/event-types` as the source of truth before depending on any formation event.
  * Both are evolving APIs — verify method names and the payment model against your installed versions.
</Info>

## Concept map

| Doola                                                                                                             | Naive                                                                                                                                                                   | Notes                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Partner API key (after signed agreement) + sandbox / production base                                              | `new Naive({ apiKey })`, then `naive.forUser(id)`                                                                                                                       | Server-side key in both; Naive scopes formation to a **tenant identity**. No partner agreement to start                   |
| Step 1 — **create a customer**                                                                                    | [tenant user](/docs/getting-started/users) `naive.users.create({ external_id, email })` → `naive.forUser(id)`                                                                | The identity the company is formed under — but in Naive it also owns cards, phone, email, vault                           |
| *(KYC not required for formation)*                                                                                | [`verification.start({ members })`](/docs/getting-started/verification) → `ready_for_formation: true`                                                                        | Naive **requires** founder KYC before formation; Doola does not — see [gaps](#what-does-not-map-yet)                      |
| reference-data lookups (states, entity types)                                                                     | [`GET /v1/formation/naics-codes`](/docs/getting-started/formation) → `naics_code_id`                                                                                         | Naive requires a NAICS industry code id                                                                                   |
| Step 2 — `POST /v1/companies` `{ entity_type, state, founders }` → order id (REST), or `POST /graphql` `mutation` | [`POST /v1/formation`](/docs/getting-started/formation) / `client.formation.submit({ verification_id, entity_type:"LLC", state, naics_code_id, description, name_options })` | Submit the formation. Naive returns a `$349` `checkout_url`                                                               |
| order id                                                                                                          | formation `id` (uuid) + `status: "awaiting_payment"` + `checkout_url`                                                                                                   |                                                                                                                           |
| Billing: partner pricing model (rates vary by agreement)                                                          | `$349` hosted checkout (state filing + registered agent + EIN + documents), paid by the end customer                                                                    | Different commercial model — no wholesale margin to set — see [gaps](#what-does-not-map-yet)                              |
| Dispatch the filing (internal, post-payment)                                                                      | [`POST /v1/formation/:id/submit`](/docs/getting-started/formation) — PII decrypted from the vault and dispatched for filing                                                  | Two-step on both: **create** then **submit/execute**                                                                      |
| Status **webhooks** `Formation Filed` / `Formation Completed` / `Registered Agent Assigned` (signed)              | [`GET /v1/formation/:id`](/docs/getting-started/formation) (poll) → `awaiting_payment → pending → submitted → formation_completed`                                           | Naive has no advertised formation webhook today — poll. See [gaps](#what-does-not-map-yet)                                |
| Formation documents returned via API                                                                              | [`GET /v1/formation/:id/documents`](/docs/getting-started/formation) → `ArticlesOfOrganization`, `EinLetter`                                                                 | Download via temporary signed URL                                                                                         |
| Access control: partner API-key scopes                                                                            | [Account Kit](/docs/getting-started/account-kits) `formation` primitive, per user, **execution time**                                                                        | Filing is policy on the identity — see [gains](#gain-2-execution-time-permission-enforcement)                             |
| **C-corp / DAO LLC** formation                                                                                    | — (LLC only)                                                                                                                                                            | Real gap — see [gaps](#what-does-not-map-yet)                                                                             |
| **Non-US founders / SSN requirements** (Doola markets broad international support)                                | KYC typically requires ID scan + selfie + SSN + address for Naive formation                                                                                             | Verify founder eligibility for your geography before migrating non-resident founders — see [gaps](#what-does-not-map-yet) |
| **Ongoing compliance** — annual filings, bookkeeping, taxes (OAuth)                                               | —                                                                                                                                                                       | Not a Naive primitive — see [gaps](#what-does-not-map-yet)                                                                |

## Before / after: the core path

The path that matters for almost every agent that incorporates a company is *register the founder,
submit the formation, then track it to documents*. Here it is on both platforms.

<CodeGroup>
  ```ts Doola theme={"theme":"css-variables"}
  // Server-side REST. Doola's primary interface is GraphQL (POST /graphql); the REST
  // surface (POST /v1/companies) is shown for parity. Field names are illustrative —
  // verify against your partner docs at developers.doola.com.
  const DOOLA = "https://api.doola.com/v1";
  const headers = {
    Authorization: `Bearer ${process.env.DOOLA_API_KEY!}`,
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(), // doola supports idempotent creates
  };

  // 1. Create the customer (onboarding record). No KYC required for formation.
  const customer = await fetch(`${DOOLA}/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: "founder@acme.com",
      first_name: "Alice",
      last_name: "Smith",
    }),
  }).then((r) => r.json());

  // 2. Submit the company formation → returns an order id; filing happens async.
  const company = await fetch(`${DOOLA}/companies`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customer_id: customer.id,
      entity_type: "LLC",          // doola also supports "C_CORP" / "DAO_LLC"
      state: "WY",
      name_options: ["Acme Tech LLC", "Acme Technologies LLC"],
      founders: [{ customer_id: customer.id, ownership_percentage: 100 }],
    }),
  }).then((r) => r.json());
  // → company.order_id ; progress arrives on signed webhooks
  //   ("Formation Filed", "Formation Completed", "Registered Agent Assigned")
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // 1. The "customer" is a tenant user — but it owns the WHOLE stack, not just formation.
  const acme = await naive.users.create({ external_id: dbCompany.id, email: "founder@acme.com" });
  const client = naive.forUser(acme.id);

  // 1a. KYC the founders first — formation is gated on ready_for_formation (Doola skips this).
  const v = await client.verification.start({
    members: [
      {
        first_name: "Alice",
        last_name: "Smith",
        email: "founder@acme.com",
        ownership_percentage: 100,
        role: "primary",
        is_responsible_party: true,
      },
    ],
  });
  // hand v.primary_link to the founder; poll until v.ready_for_formation === true

  const nv = { Authorization: `Bearer ${process.env.NAIVE_API_KEY!}`, "Content-Type": "application/json" };

  // 2. Submit the formation → returns a $349 checkout_url. PII never touches your DB.
  //    Pick a naics_code_id from GET /v1/formation/naics-codes first.
  const { naics_codes } = await fetch("https://api.usenaive.ai/v1/formation/naics-codes", { headers: nv })
    .then((r) => r.json());
  const formation = await client.formation.submit({
    verification_id: v.id,
    entity_type: "LLC",
    state: "WY",
    naics_code_id: naics_codes[0].id,
    description: "AI-powered business automation platform",
    name_options: [
      { name: "Acme Tech", entity_type_ending: "LLC" },
      { name: "Acme Technologies", entity_type_ending: "LLC" },
    ],
  });
  // → formation.id, formation.status: "awaiting_payment", formation.checkout_url

  // 3. After the founder pays the checkout_url, dispatch the filing, then poll to documents.
  await fetch(`https://api.usenaive.ai/v1/formation/${formation.id}/submit`, { method: "POST", headers: nv });
  const status = await fetch(`https://api.usenaive.ai/v1/formation/${formation.id}`, { headers: nv })
    .then((r) => r.json());
  // → status.status: "submitted" → "formation_completed"; then GET .../documents
  ```
</CodeGroup>

The customer → company → documents shape lines up closely. The real differences to plan for:

* **KYC is a required prerequisite, not optional.** Doola forms the company without KYC. Naive's
  `formation.submit` *requires* a `verification_id` whose `ready_for_formation` is `true` — the
  responsible party is structurally the verified founder. That is the accountability win, and a
  flow change. See [gaps](#what-does-not-map-yet).
* **Payment model.** Doola may bill partners on a negotiated rate you mark up. Naive returns a
  `$349` hosted `checkout_url` paid by the end customer, then you `submit` to file.
  There is no wholesale/white-label margin to configure on Naive.
* **Status: poll, not a webhook.** Doola is webhook-first. Naive's public webhook surface does not
  advertise a formation event today — poll `GET /v1/formation/:id` through
  `awaiting_payment → pending → submitted → formation_completed`.
* **The customer is your identity, not a standalone onboarding record.** In Doola a `customer`
  exists *for filing and compliance*. In Naive the formation hangs off a
  [tenant user](/docs/getting-started/users) that also owns the agent's KYC, inbox, vault, card, and phone.

### Submitting and filing

Both platforms separate "submit the formation" from "the company is actually filed." Doola files
asynchronously after payment and reports via webhook; Naive splits it into an explicit
**submit → pay → execute** so the filing only dispatches once funding is confirmed.

<CodeGroup>
  ```ts Doola theme={"theme":"css-variables"}
  // One call submits; doola handles payment (per your partner agreement) and files async.
  const company = await fetch(`${DOOLA}/companies`, {
    method: "POST", headers,
    body: JSON.stringify({ customer_id, entity_type: "LLC", state: "WY", name_options: ["Acme LLC"] }),
  }).then((r) => r.json());
  // → company.order_id ; "Formation Filed" / "Formation Completed" webhooks fire later
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // Submit creates a $349 checkout; the filing dispatches only after you execute on a paid record.
  const formation = await client.formation.submit({
    verification_id, entity_type: "LLC", state: "WY",
    naics_code_id, description: "…", name_options: [{ name: "Acme", entity_type_ending: "LLC" }],
  });
  // → open formation.checkout_url (founder pays $349), then:
  //   POST /v1/formation/{id}/submit  → status: "submitted" (PII pulled from vault, filed)
  //   GET  /v1/formation/{id}         → poll to "formation_completed"
  ```
</CodeGroup>

* On Naive, **submitting a formation is sensitive** and may be
  [approval-gated](/docs/getting-started/approvals) by the Account Kit — the call can return
  `202 { status: "pending_approval", approval_id }` until a human approves, then the API replays it.
  Formation defaults to requiring approval for agent calls.
* A formation moves `awaiting_payment → pending` after the `$349` checkout is paid, then
  `submitted → formation_completed` once filed. See
  [Formation statuses](/docs/getting-started/formation#formation-statuses).

## Minimal viable migration

The smallest swap that keeps an incorporating agent running is *create the identity → KYC the
founder → submit → pay → execute → documents*. You do not need to recreate partner billing,
C-corp support, or Account Kits to file your first LLC.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
    No partner agreement required to start.
  </Step>

  <Step title="Map your customers">
    A Doola `customer` becomes a Naive [tenant user](/docs/getting-started/users). Reuse your own
    database id as `external_id` so the mapping is 1:1, or pass it straight into `naive.forUser(id)`.
  </Step>

  <Step title="Add the KYC prerequisite">
    Doola skips KYC; Naive requires it. Before formation, call
    `client.verification.start({ members: [...] })` with each founder's name + email,
    `ownership_percentage` (summing to 100), exactly one `role: "primary"`, and exactly one
    `is_responsible_party: true`. Poll until `ready_for_formation` is `true`. See the
    [verification primitive](/docs/getting-started/verification).
  </Step>

  <Step title="Swap formation submission">
    Replace `POST /v1/companies` with `client.formation.submit({ verification_id, entity_type:"LLC",
            state, naics_code_id, description, name_options })`. Pick a `naics_code_id` from
    `GET /v1/formation/naics-codes`. Open the returned `checkout_url` for the `$349` payment.
  </Step>

  <Step title="Execute, track, and download">
    After payment, `POST /v1/formation/:id/submit` to dispatch the filing, poll
    `GET /v1/formation/:id` to `formation_completed`, then `GET /v1/formation/:id/documents` for the
    Articles of Organization and EIN letter. At this point you are off your direct Doola integration
    for the core path. Everything below is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. With Doola direct, a `customer` isolates **formation
and compliance and nothing else** — KYC, cards, phone, and email all live in separate systems keyed
off an order id by hand. On Naive, the unit of isolation is a **tenant user**, and it isolates the
agent's *entire* footprint.

<CodeGroup>
  ```ts Doola (customer — formation only) theme={"theme":"css-variables"}
  // One customer per founder; isolates the company filing, and only that.
  const customer = await createDoolaCustomer({ email: founder.email });
  await createDoolaCompany({ customer_id: customer.id, entity_type: "LLC", state: "WY" });

  // The founders' KYC, the inbox, the secrets, the virtual card, the phone number for
  // this company's agent live in entirely separate systems with their own tenancy,
  // re-keyed to the order id by hand.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  import { isPendingApproval } from "@usenaive-sdk/server";

  // One tenant user per company; isolates *every* primitive.
  const acme = await naive.users.create({ external_id: dbCompany.id, email: founder.email });
  const client = naive.forUser(acme.id);

  // 1. KYC the founders → 2. the SAME identity forms the LLC (PII pulled from the vault).
  const v = await client.verification.start({ members: [/* founders */] });
  const formation = await client.formation.submit({
    verification_id: v.id, entity_type: "LLC", state: "WY",
    naics_code_id, description: "AI-powered business automation",
    name_options: [{ name: "Acme Tech", entity_type_ending: "LLC" }],
  });
  if (isPendingApproval(formation)) { /* surface formation.approval_id to a human */ }

  // 3. …and the SAME identity owns the company's card, phone, email, and vault — one handle.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.phone.provision({ ein: "12-3456789", area_code: "415" });
  await client.email.createInbox({ local_part: "founders" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Doola, the company filing is an island: an order id you manually re-key into your KYC,
  banking, card, and phone vendors. With Naive, `naive.forUser(acme.id)` is a single handle to
  **formation *and* KYC *and* cards *and* phone *and* email *and* vault**.
* The founders you verified are literally the
  [responsible party](/docs/getting-started/verification#member-parameters) the company is formed under —
  demonstrated by `formation.submit({ verification_id })`, which *requires* that the KYC passed. You
  provision a company's whole agent footprint from one identity, and tear it down from one place.

### Gain #2 — execution-time permission enforcement

* Whether an agent may **file a formation** is **policy on the Account Kit** — not a check you
  hand-write, and not a Doola partner-key scope you manage separately.

```ts theme={"theme":"css-variables"}
const incorporator = await naive.accountKits.create({
  name: "Incorporator",
  primitives_config: {
    verification: { enabled: true, requiresApproval: true }, // KYC freezes for a human
    formation: { enabled: true, requiresApproval: true },    // filing freezes for a human
    cards: { enabled: true, requiresApproval: true },
  },
});
await naive.accountKits.assignUser(incorporator.id, acme.id);
```

* The agent's code is identical for every tier — `client.formation.submit({ … })`. Whether the call
  runs is decided by the **caller's kit at execution time**:
  * `primitives_config.formation.enabled: false` → the exact same line returns `forbidden`, no code change.
  * `requiresApproval: true` (the default for formation) → the filing freezes as a
    [pending approval](/docs/getting-started/approvals); the API replays it only after a human approves.
  * This is the *same* approval model that gates `verification.start`, `cards`, and `domains.purchase`
    — one policy surface, not one per vendor.

### Gain #3 — unified accountability

* Every KYC start, formation submit, document fetch, card issue, and phone provision for a company
  lands in *one* per-user [activity log](/docs/getting-started/logs) — not in a separate Doola portal:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "who verified, who incorporated, and what has the agent done since?" — one timeline
```

* That is the question that is hard to answer when KYC lives in one vendor, incorporation in Doola,
  and cards in another. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (customer → KYC → submit → pay →
execute → documents) maps cleanly for **US LLCs with verifiable founders**, but Doola has real
capabilities Naive's `formation` primitive does not match today. Check this list against your app
**before** you commit — some of these are why you might *stay* on Doola.

| Doola feature                                                                                              | Status on Naive                                                                   | Workaround                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **C-corp and DAO LLC** formation                                                                           | Not available — `entity_type: "LLC"` only                                         | Keep Doola (or another formation vendor) for non-LLC entities; use Naive for LLCs                            |
| **Non-US founders / SSN-less paths** (Doola markets international support)                                 | Naive founder KYC typically requires ID scan + selfie + SSN + address             | Verify Naive's founder-eligibility for your geography before migrating non-resident founders                 |
| **No-KYC formation**                                                                                       | Founder KYC is **required** (`ready_for_formation`) before filing                 | By design — Naive trades Doola's frictionless path for a verified, accountable one                           |
| **Webhook-first status** (`Formation Filed` / `Formation Completed` / `Registered Agent Assigned`, signed) | Not advertised today (`email.received`, `sms.received`, `approval.resolved` only) | Poll `GET /v1/formation/:id`; confirm via `GET /v1/webhooks/event-types` before relying on a formation event |
| **White-label / wholesale pricing** (partner-set markup)                                                   | Fixed `$349` hosted checkout paid by the end customer                             | No wholesale margin model on Naive; the fee is end-customer-facing                                           |
| **Ongoing compliance** — annual state filings, bookkeeping, tax filings (via OAuth)                        | Not a Naive primitive — formation + EIN + registered agent + documents only       | Handle ongoing compliance out of band; Naive covers initial formation                                        |
| **Equity / 83(b) / cap table tooling**                                                                     | Not available                                                                     | Out of scope for `formation` (more of a C-corp concern — see Stripe Atlas)                                   |
| **Mercury / banking introductions, payment-processor access**                                              | Not provided by `formation`                                                       | Use the [`cards`](/docs/getting-started/cards) primitive for spend; banking introductions are out of scope        |
| **GraphQL field selection / partial responses**                                                            | REST/JSON responses with fixed shapes                                             | Read the documented [response fields](/docs/getting-started/formation); no GraphQL projection                     |

<Warning>
  If your business depends on **C-corp / DAO LLC** formation, **SSN-less or non-resident founder
  paths**, a **partner wholesale margin**, or **ongoing compliance** (annual filings, bookkeeping, taxes),
  those are the gaps most likely to block you — keep those workloads on Doola for now. The
  customer → KYC → submit → pay → execute → documents loop for **US LLCs with verifiable founders**,
  with Account-Kit governance over *who can file* — the most common agent-incorporation pattern —
  maps cleanly today. Note the **direction of the model**: Doola files a company and reports back;
  Naive verifies the founders, forms the company under that *same identity*, and carries it into
  cards, phone, email, and vault. That carry-through *is* the consolidation gain — but it means the
  primitive is shaped for KYC-gated US LLCs, not for every entity type Doola supports.
</Warning>

## Where to go next

* [`formation` primitive](/docs/getting-started/formation) — full submit → pay → execute → status →
  documents lifecycle
* [`verification` primitive](/docs/getting-started/verification) — the founder KYC that gates formation,
  keyed off `ready_for_formation`
* [`formation` SDK sub-client](/docs/sdk/sub-clients/formation) and [CLI](/docs/cli/formation) — typed method
  signatures and command-line usage
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model that makes execution-time formation governance real
* [Vault encryption](/docs/architecture/vault-encryption) — where verified PII lives so it never touches
  your database
* [Tenant users](/docs/getting-started/users) — the identity that the consolidation hangs off

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Incorporation Platform](https://usenaive.ai/blog/how-to-build-an-agentic-incorporation-platform) — formation workflow tutorial
