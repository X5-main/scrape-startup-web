> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from GoDaddy to Naive

> Move agent domain registration and DNS from GoDaddy's Domains API to Naive's domains primitive — the same search-a-name, buy-it, edit-DNS capability, but the domain is owned by one governed identity that also owns the agent's email inboxes, formed entity, cards, and vault.

<Frame caption="GoDaddy's Domains API → the Naive domains primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/godaddy-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=5d406c55eaa0fd9fb9cbb31afbcb6e2f" alt="GoDaddy" height="28" data-path="migration-guides/logos/godaddy-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/godaddy-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=80dd0444ffb9442e4b256f29e433b873" alt="GoDaddy" height="28" data-path="migration-guides/logos/godaddy-dark.svg" />
</Frame>

[GoDaddy](https://developer.godaddy.com/doc/endpoint/domains) gives an AI agent a real domain and a
DNS API: check availability and price, purchase the name, then `PATCH`/`PUT` records to point it
wherever you need. It does that job well, and the API is mature. But it is also a *separate registrar
account*:

* The domain lives behind a GoDaddy **API Key + Secret** (`Authorization: sso-key KEY:SECRET`), its
  own dashboard, and its own **Good as Gold** prepaid balance — disconnected from wherever the
  agent's email, cards, secrets, and KYC live.
* WHOIS contacts, registrant consent, renewals, and nameserver delegation are yours to wire up and
  keep registered against *your* identity, by hand, per domain.
* "Who let this agent buy a domain or rewrite a DNS record, and what *else* can it touch?" is
  answered in GoDaddy for the registrar, and in unrelated systems for everything else. The domain
  has no shared accountability with the rest of the agent's footprint.

Naive's [`domains`](/docs/getting-started/domains) primitive gives the agent the **same** capability —
search a name, buy it, connect an existing one, and edit the live DNS zone — but the domain is
**rooted in one governed identity**:

* The [tenant user](/docs/getting-started/users) that owns the domain is the same user that owns its
  [email inboxes](/docs/getting-started/email), the entity it [formed](/docs/getting-started/formation), its
  [cards](/docs/getting-started/cards), its [vault](/docs/getting-started/vault) secrets, and its
  [KYC](/docs/getting-started/verification).
* A purchased or connected domain is **automatically wired to that identity's email** (SPF/DKIM/MX),
  so `support@acme.com` is the same identity that bought `acme.com` — not a second integration.
* Whether an agent may **buy** a domain — and whether each DNS write is allowed at all — is decided
  by that user's [Account Kit](/docs/getting-started/account-kits) and per-agent assignment **at
  execution time**, then logged.

This guide maps GoDaddy's Domains API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  GoDaddy is a trademark of GoDaddy Operating Company, LLC, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** the **GoDaddy Domains API v1** (REST; no official Node SDK — raw `fetch`),
  production base `https://api.godaddy.com` (test env `https://api.ote-godaddy.com`), auth header
  `Authorization: sso-key KEY:SECRET`, docs snapshot June 2026; and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`, docs
  snapshot June 2026).

  Version notes:

  * GoDaddy purchases are **headless**: `POST /v1/domains/purchase` deducts the price from a funded
    **Good as Gold** balance and requires a `consent` block (agreement keys from
    `GET /v1/domains/agreements`) plus four WHOIS **contact** objects. Naive's
    `domains.purchase(domain)` returns a hosted **`checkout_url`** (Stripe) that a human completes —
    no contact schema, no prepaid balance. This is a real workflow difference; see
    [what doesn't map yet](#what-does-not-map-yet).
  * GoDaddy edits DNS with `PATCH /v1/domains/{domain}/records` (add) and
    `PUT /v1/domains/{domain}/records/{type}/{name}` (replace), **min TTL 600**. Naive edits the live
    zone with `POST /v1/domains/:id/zone-records` (create/replace) and
    `DELETE /v1/domains/:id/zone-records/:recordId`, **TTL 60–86400**, allowed types
    **A/AAAA/CNAME/MX/TXT/CAA**, with DMARC/DKIM and inbound MX/TXT **protected** and a CAA
    allowlist.
  * The Naive Node **SDK** `domains` sub-client exposes only `list()`, `search()`, and `purchase()`
    today. Connect, verify, and DNS zone editing are available over **REST** and the
    [CLI](/docs/cli/domains) (`naive domains …`) / [MCP](/docs/mcp/tools) — the snippets below call them with
    `fetch`. See the [SDK parity note](#what-does-not-map-yet).
  * **Access model differs.** GoDaddy's production API requires ≥1 domain in the account for the
    Management/DNS API (≥50 for the Availability API) and a Good as Gold balance to buy. Naive needs
    no registrar account — domains hang off your tenant identity; purchased domains are currently
    capped at **3 per company** (see [domains guide](/docs/getting-started/domains)).
</Info>

## Concept map

| GoDaddy                                                                               | Naive                                                                                | Notes                                                                                                            |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `Authorization: sso-key KEY:SECRET` per registrar account                             | `new Naive({ apiKey })` + `naive.forUser(id)`                                        | Naive scopes **every** primitive to one identity, not just the registrar                                         |
| One GoDaddy account, isolated from your other vendors                                 | [tenant user](/docs/getting-started/users) via `naive.forUser(id)`                        | The core consolidation win                                                                                       |
| `GET /v1/domains/available?domain=acme.com` → available + price                       | `client.domains.search("acme.com")` → `{ available, price, priceInCents }`           | Single-name availability + price check                                                                           |
| `POST /v1/domains/purchase` (consent + 4 contacts, deducts Good as Gold)              | `client.domains.purchase("acme.com")` → `{ checkout_url, domain_id }`                | Naive returns a checkout link; no contact schema or prepaid balance                                              |
| `GET /v1/domains` → list registered domains                                           | `client.domains.list()` → `{ domains: [...] }`                                       | List domains for the identity                                                                                    |
| (use a domain you already own)                                                        | `POST /v1/domains/connect { domain }` → `{ dns_records }`                            | BYOD: connect an existing domain for email                                                                       |
| `GET /v1/domains/{domain}/records` → all zone records                                 | `GET /v1/domains/:id/zone-records` → `{ records: [{ id, type, name, value, ttl }] }` | Live zone read with provider record IDs                                                                          |
| `PATCH /v1/domains/{domain}/records` (add)                                            | `POST /v1/domains/:id/zone-records { mode: "append" }`                               | Add a record                                                                                                     |
| `PUT /v1/domains/{domain}/records/{type}/{name}` (replace)                            | `POST /v1/domains/:id/zone-records` (default `mode: "replace"`)                      | Create-or-replace at `(type, name)`                                                                              |
| `PUT /v1/domains/{domain}/records` (replace **all**)                                  | —                                                                                    | No "replace entire zone" call — edit per record                                                                  |
| `DELETE /v1/domains/{domain}/records/{type}/{name}`                                   | `DELETE /v1/domains/:id/zone-records/:recordId`                                      | Delete by **provider record ID**, not type/name                                                                  |
| (verify email setup yourself)                                                         | `POST /v1/domains/:id/verify` + `GET /v1/domains/:id/dns-records`                    | Naive checks the email-provider (SPF/DKIM/MX) records for you                                                    |
| Set custom **nameservers** (`PUT /v1/domains/{domain}` → `nameServers`)               | —                                                                                    | Naive manages the zone; you edit records, not delegation — see [gaps](#what-does-not-map-yet)                    |
| **Domain forwarding / redirects** (`/v1/domains/{domain}/forwards`)                   | —                                                                                    | No equivalent — use a CNAME/A record + your app                                                                  |
| **Renewals** (`/v1/domains/{domain}/renew`), **transfers** (`/transfer`), **privacy** | —                                                                                    | Not exposed — see [gaps](#what-does-not-map-yet)                                                                 |
| **Bulk availability / suggestions** (`/v1/domains/available` array, `/suggest`)       | —                                                                                    | Single-name `search` only                                                                                        |
| **WHOIS contacts** (`contactRegistrant`, …) supplied per purchase                     | Handled internally against your company                                              | You do not assemble contact objects                                                                              |
| API Key + (no scopes) — full-account access                                           | **Account Kit** `domains` primitive + per-agent assignment                           | Permission is execution-time policy on the identity — see [gains](#gain-2-execution-time-permission-enforcement) |
| Good as Gold prepaid balance                                                          | Naive credits + hosted checkout                                                      | Purchase is a governed, approvable action — see [gains](#gain-2-execution-time-permission-enforcement)           |

## Before / after: the core path

The path that matters for almost every "give my agent a domain" use case is *find a name, buy it,
then point a record at your app*. Here it is on both platforms.

<CodeGroup>
  ```ts GoDaddy (Domains API v1, raw fetch) theme={"theme":"css-variables"}
  const GD = "https://api.godaddy.com/v1";
  const auth = { Authorization: `sso-key ${process.env.GODADDY_KEY}:${process.env.GODADDY_SECRET}` };

  // 1. Check availability + price
  const avail = await fetch(`${GD}/domains/available?domain=acme.com`, { headers: auth })
    .then((r) => r.json());
  // → { available: true, price: 11990000 /* micros */, currency: "USD" }

  // 2. Purchase — headless, deducts your Good as Gold balance.
  //    Requires consent (agreement keys) + four WHOIS contact objects.
  const [agreement] = await fetch(`${GD}/domains/agreements?tlds=com&privacy=false`, { headers: auth })
    .then((r) => r.json());

  const contact = {
    nameFirst: "Ada", nameLast: "Lovelace", email: "ada@acme.com",
    phone: "+1.4155551234",
    addressMailing: { address1: "1 Main St", city: "SF", state: "CA", postalCode: "94105", country: "US" },
  };

  await fetch(`${GD}/domains/purchase`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: "acme.com",
      period: 1,
      privacy: false,
      consent: { agreedAt: new Date().toISOString(), agreedBy: "203.0.113.10", agreements: [agreement.agreementKey] },
      contactAdmin: contact, contactBilling: contact, contactRegistrant: contact, contactTech: contact,
    }),
  });

  // 3. Point a record at your app
  await fetch(`${GD}/domains/acme.com/records/CNAME/www`, {
    method: "PUT",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify([{ data: "shops.myshopify.com", ttl: 600 }]),
  });
  ```

  ```ts Naive (@usenaive-sdk/server) theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser(acme.id); // the identity that will OWN the domain

  // 1. Check availability + price
  const avail = await client.domains.search("acme.com");
  // → { available: true, price: 11.99, priceInCents: 1199, currency: "usd" }

  // 2. Purchase — returns a hosted checkout URL (no contacts, no prepaid balance).
  //    SENSITIVE: may freeze for human approval (see gains).
  const order = await client.domains.purchase("acme.com");
  // → { checkout_url: "https://checkout.../cs_live_...", domain_id: "dom-uuid", ... }
  // Share order.checkout_url with the user to complete payment; the domain is
  // registered automatically and auto-wired to this identity's email.

  // 3. Point a record at your app (DNS editing is REST/CLI today — see version notes)
  await fetch(`https://api.usenaive.ai/v1/domains/${order.domain_id}/zone-records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.NAIVE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "CNAME", name: "www", value: "shops.myshopify.com" }), // default mode: "replace"
  });
  ```
</CodeGroup>

## The workflow that changes: a domain that *is* an email identity

On GoDaddy, wiring a domain for email is a manual DNS chore: look up your provider's MX/TXT/DKIM
records and `PATCH` them in yourself, then hope verification passes. On Naive, a connected or
purchased domain is **the agent's email identity** — `connect` hands you the exact records, `verify`
confirms them, and inboxes drop straight onto it.

<CodeGroup>
  ```ts GoDaddy (manual email DNS) theme={"theme":"css-variables"}
  // You hand-assemble your email provider's records and PATCH them in.
  await fetch(`${GD}/domains/acme.com/records`, {
    method: "PATCH",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      { type: "MX",    name: "@", data: "feedback-smtp.example.email", priority: 10, ttl: 600 },
      { type: "TXT",   name: "@", data: "v=spf1 include:example.email ~all", ttl: 600 },
      { type: "CNAME", name: "provider._domainkey", data: "provider.dkim.example.email", ttl: 600 },
    ]),
  });
  // Then verify out-of-band in your email provider's dashboard, and create the
  // mailbox in *that* unrelated system.
  ```

  ```ts Naive (domain → email, one identity) theme={"theme":"css-variables"}
  const NV = "https://api.usenaive.ai/v1";
  const h = { Authorization: `Bearer ${process.env.NAIVE_API_KEY}`, "Content-Type": "application/json" };

  // 1. Connect an existing domain — Naive returns the exact records to add.
  const connected = await fetch(`${NV}/domains/connect`, {
    method: "POST", headers: h, body: JSON.stringify({ domain: "acme.com" }),
  }).then((r) => r.json());
  // → { id: "dom-uuid", status: "pending_dns", dns_records: [MX, TXT, CNAME] }

  // 2. After the records propagate, verify.
  await fetch(`${NV}/domains/${connected.id}/verify`, { method: "POST", headers: h });
  // → { verified: true, status: "active" }

  // 3. The domain is now THIS identity's email identity — create an inbox on it.
  await naive.forUser(acme.id).email.createInbox({ local_part: "support", domain_id: connected.id });
  // support@acme.com — same identity that owns the domain.
  ```
</CodeGroup>

<Info>
  Buying through Naive skips steps 1–2 entirely: **purchased domains are auto-configured for email**,
  so you go straight from `checkout_url` to `email.createInbox`.
</Info>

## Minimal viable migration

The smallest swap that keeps a working agent running is just *search* + *buy* + *edit one record*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Swap availability + price">
    Replace `GET /v1/domains/available?domain=…` with `client.domains.search("acme.com")`. The shape
    is `{ available, price, priceInCents, currency }` — note GoDaddy returns price in **micros**,
    Naive in **dollars** (`price`) and **cents** (`priceInCents`).
  </Step>

  <Step title="Swap purchase">
    Replace `POST /v1/domains/purchase` (consent + four contacts + Good as Gold) with
    `client.domains.purchase("acme.com")`. Instead of a headless balance deduction you get a
    `checkout_url` to complete payment; the domain registers and auto-wires to the identity's email.
    Handle the `pending_approval` response if your Account Kit gates purchases (see below).
  </Step>

  <Step title="Swap DNS edits">
    Replace `PUT /v1/domains/{domain}/records/{type}/{name}` with
    `POST /v1/domains/:id/zone-records` (default `mode: "replace"`), and
    `DELETE /v1/domains/{domain}/records/{type}/{name}` with
    `DELETE /v1/domains/:id/zone-records/:recordId` (delete by **provider record ID** from
    `GET …/zone-records`). Bump any `ttl: 600` GoDaddy floor down to Naive's 60 if you want faster
    propagation.
  </Step>

  <Step title="Ship it">
    At this point you are off GoDaddy for the core search → buy → edit-DNS path. Everything below is
    upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In GoDaddy, the API Key isolates **the registrar and
nothing else**, and a domain is an anonymous asset behind a prepaid balance. On Naive, the unit of
isolation is a **tenant user**, and the domain is rooted in that identity's verified, formed
business — and *is* its email identity.

<CodeGroup>
  ```ts GoDaddy (registrar — domains + DNS only) theme={"theme":"css-variables"}
  // One GoDaddy account; isolates domains and DNS records, and only those.
  const auth = { Authorization: `sso-key ${KEY}:${SECRET}` };
  await fetch(`${GD}/domains/purchase`, { method: "POST", headers: { ...auth }, body /* consent + contacts */ });
  await fetch(`${GD}/domains/acme.com/records/A/@`, { method: "PUT", headers: { ...auth }, body });

  // The email inbox, the formed entity, the card, and the vault secrets for this
  // customer's agent live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  const order = await client.domains.purchase("acme.com"); // checkout_url → registered + email-ready

  // The SAME client owns this customer's email inbox, formed entity, card, and vault —
  // one identity, isolated end to end, and the domain is its email identity.
  await client.email.createInbox({ local_part: "support", domain_id: order.domain_id });
  await client.formation.submit({ /* … */ });
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.vault.put("registrar.legacy_key", "sso-key-…");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With GoDaddy, the agent's domains are an island behind an API Key. With Naive,
  `naive.forUser(acme.id)` is a single handle to **domains *and* email *and* formation *and* cards
  *and* vault**.
* The domain is not an anonymous asset — it is auto-wired as the **email identity** of the entity
  that user already [formed](/docs/getting-started/formation) and [verified](/docs/getting-started/verification).
  Tear the customer down from one place; sibling tenants can never read each other's domains,
  inboxes, cards, or secrets.

### Gain #2 — execution-time permission enforcement

* Whether an agent may **buy** a domain at all is **policy on the Account Kit**, and whether a
  purchase freezes for human review is the same policy — not a check you hand-write and not a GoDaddy
  balance you guard manually.

```ts theme={"theme":"css-variables"}
// A "DNS-only" tier can edit records but cannot buy domains.
const dnsOnly = await naive.accountKits.create({
  name: "DNS only",
  primitives_config: {
    domains: { enabled: true, requiresApproval: true }, // buying a domain freezes for approval
    email: { enabled: true },
  },
});
await naive.accountKits.assignUser(dnsOnly.id, acme.id);
```

* The agent's code is identical for every tier — `client.domains.purchase("acme.com")`. Whether the
  call runs is decided at execution time:
  * An agent whose Account Kit disables `domains` is refused with `forbidden`, with no code change on
    your side.
  * `domains.purchase` is a **sensitive** action: with `requiresApproval: true` it returns
    `{ status: "pending_approval", approval_id }` and the API replays it only after a human
    [approves](/docs/getting-started/approvals).
  * DNS writes are bounded by the zone's [safety rules](/docs/getting-started/domains#safety-rules)
    (allowed types, protected DMARC/DKIM, CAA allowlist, and related checks documented there) and
    per-company rate limits documented in the [domains guide](/docs/getting-started/domains) — enforcement
    you would otherwise hand-roll on top of GoDaddy.

### Gain #3 — unified accountability

* Every search, purchase, and DNS edit for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their email, formation, card, and vault events,
  not in a separate GoDaddy dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — domains, email, cards, vault, one timeline
```

* Every DNS edit (success **or** rejection) also appends an `activity_log` row, and a **successful**
  edit emits a `domain.updated` live event on `GET /v1/events` — so the audit trail is built into the
  write, not reconstructed after the fact.
* That is the question that is hard to answer when domains live in GoDaddy, email lives elsewhere,
  and secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (search → buy → edit DNS) maps
cleanly, but the following GoDaddy capabilities have **no direct equivalent** on Naive's domains
primitive today. Check this list against your app before you commit.

| GoDaddy feature                                                                                | Status on Naive                                         | Workaround                                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Headless purchase** (deduct from Good as Gold, no human)                                     | Different model                                         | Naive returns a `checkout_url` a human completes — no fully unattended buy                 |
| **Custom nameservers** (`PUT /v1/domains/{domain}` → `nameServers`)                            | Not provided — Naive manages the zone                   | Edit records via `zone-records`; you cannot delegate the zone elsewhere                    |
| **Domain forwarding / redirects** (`/forwards`)                                                | Not provided                                            | Use a `CNAME`/`A` record pointing at your app/host                                         |
| **Renewals** (`/renew`, `renewAuto`)                                                           | Not exposed                                             | Managed by Naive; no per-domain renew call                                                 |
| **Transfers in/out** (`/transfer`, auth/EPP codes)                                             | Not provided                                            | Domains are registered and held within Naive                                               |
| **WHOIS / contact management** (`contactRegistrant`, privacy, `/v1/domains/{domain}/contacts`) | Handled internally                                      | You do not assemble or edit contact objects                                                |
| **Bulk availability + suggestions** (`available` array, `/suggest`)                            | Single-name `search` only                               | Loop `search` per name; no suggestion engine                                               |
| **TLD breadth** (hundreds of TLDs, agreements per TLD)                                         | Limited catalog                                         | `search` returns availability for supported TLDs only                                      |
| **More than 3 domains / company**                                                              | Currently capped at **3 purchased domains** per company | Connect (BYOD) additional domains you own elsewhere                                        |
| **"Replace entire zone"** (`PUT /v1/domains/{domain}/records`)                                 | Per-record edits only                                   | Edit each record with `zone-records`; protected records can't be removed                   |
| **Min TTL 600 parity / arbitrary record types**                                                | TTL 60–86400; types A/AAAA/CNAME/MX/TXT/CAA only        | No SRV/NS/PTR; DMARC/DKIM + inbound MX/TXT are protected                                   |
| **Typed SDK methods for connect/verify/DNS**                                                   | SDK has only `list`/`search`/`purchase`                 | Use REST or the [`naive domains`](/docs/cli/domains) CLI / [MCP tools](/docs/mcp/tools) for the rest |

<Warning>
  If your agent needs **custom nameserver delegation**, **domain forwarding**, **transfers in/out**,
  **renewal control**, **WHOIS/privacy management**, **bulk/suggestion search**, or **broad TLD
  coverage**, those are the gaps most likely to matter — Naive registers a small number of domains and
  manages their zone for you, optimized to be an **email + app identity**, not a full ICANN registrar
  console. Equally, note the **purchase-flow inversion**: GoDaddy deducts a prepaid balance with no
  human in the loop, while Naive returns a `checkout_url` and treats buying as an approvable,
  identity-scoped action. That governance *is* the consolidation gain — but it is a real difference in
  how a purchase completes.
</Warning>

## Where to go next

* [`domains` primitive](/docs/getting-started/domains) — full search/purchase/connect/verify + DNS zone editing
* [`domains` SDK sub-client](/docs/sdk/sub-clients/domains) — typed `list`/`search`/`purchase` signatures
* [`domains` CLI](/docs/cli/domains) — `connect`, `verify`, `zone-records`, `set-record`, `delete-record`
* [Email](/docs/getting-started/email) — inboxes that drop straight onto a verified or purchased domain
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model behind execution-time governance and purchase approval
* [Formation](/docs/getting-started/formation) and [Verification](/docs/getting-started/verification) — the
  entity + KYC the domain's email identity hangs off
* [Tenant users](/docs/getting-started/users) — the identity that owns the domain, email, cards, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build A Brand Protection Agent](https://usenaive.ai/blog/how-to-build-a-brand-protection-agent) — domain monitoring tutorial
