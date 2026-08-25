> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Persona to Naive

> Move founder identity verification from Persona's standalone Inquiries API to Naive's verification primitive — the same hosted KYC (ID scan, selfie, status tracking), but the people you verify ARE the governed identity that then forms the company and owns its cards, phone, email, and vault.

<Frame caption="Persona's Inquiries API → the Naive verification primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/persona-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=7183d0ce4f1ecdb47f216d1ecc92bab5" alt="Persona" height="28" data-path="migration-guides/logos/persona-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/persona-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=1c8bd54581c3a52fdf5260f7b70f06b8" alt="Persona" height="28" data-path="migration-guides/logos/persona-dark.svg" />
</Frame>

[Persona](https://docs.withpersona.com) gives you a hosted KYC flow: author an inquiry template,
`POST /api/v1/inquiries`, hand the subject a verification link, and read the result (ID scan,
selfie, database checks) back as an inquiry status or webhook. It does that job well, and the API
is mature. But it is also a *separate vendor account*:

* KYC lives behind its **own** API key, its **own** templates and themes, and its **own** dashboard
  — disconnected from wherever the verified person's company, cards, phone, and secrets live.
* An inquiry's `reference-id` is a **string tag** back to a row in *your* user table. Persona knows
  the person passed KYC; it does **not** know that same person is the responsible party who then
  incorporates the company and owns its virtual card.
* "This founder cleared KYC — *now what is allowed to happen on their behalf?*" is answered in
  Persona for verification, and in unrelated systems for formation, banking, and cards. The cleared
  identity has no shared accountability with the rest of the company's footprint.

Naive's [`verification`](/docs/getting-started/verification) primitive gives the **same** capability —
hosted KYC for one or more company founders, with real-time status — but the person you verify is a
**governed identity**, not a tagged inquiry:

* The [tenant user](/docs/getting-started/users) whose founders you KYC is the same identity that then
  [forms the LLC](/docs/getting-started/formation), and owns its [cards](/docs/getting-started/cards),
  [phone number](/docs/getting-started/phone), [email inboxes](/docs/getting-started/email), and
  [vault](/docs/getting-started/vault) secrets.
* Verified PII (SSN, DOB, address) is pulled from the encrypted identity
  [vault](/docs/architecture/vault-encryption) at formation time — it never lands in your database.
* When every member passes, `ready_for_formation` flips to `true` — KYC is structurally a
  **step toward incorporation**, not an isolated pass/fail you have to wire to a formation vendor
  yourself.

This guide maps Persona's Inquiries API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  Persona is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Warning>
  **Scope this migration before you start.** Naive's `verification` primitive is **founder /
  responsible-party KYC ahead of company formation** — the people who *own and form* the company.

  * If you use Persona to verify **founders before incorporation**, this is a clean migration and the
    consolidation win is real.
  * If you use Persona to KYC your **end users / customers at scale** — arbitrary subjects, custom
    templates, AML/watchlist [Reports](#what-does-not-map-yet), manual-review Cases — that does
    **not** map to Naive today. Keep Persona for that. See
    [what doesn't map yet](#what-does-not-map-yet).
</Warning>

<Info>
  **Tested against:** the Persona REST API (base `https://api.withpersona.com/api/v1`, header
  `Persona-Version: 2025-10-27` — `2025-12-08` also valid — hosted flow at
  `https://inquiry.withpersona.com`, docs snapshot June 2026), and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`,
  docs snapshot June 2026).

  Version notes:

  * Persona's officially featured SDKs are **client-side** ([persona-react / persona-web /
    mobile](https://docs.withpersona.com)); the server-side integration is **REST**, which is what
    the "before" code below uses. There is no first-party server SDK to swap out.
  * Persona verifies **one subject per inquiry** against a **template you author** (`itmpl_…`). Naive
    verifies a **set of company members** in one `verification.start` call, and requires
    `ownership_percentage` to sum to **100**, exactly one `role: "primary"`, and exactly one
    `is_responsible_party: true`. This is **formation-shaped** — see [gaps](#what-does-not-map-yet).
  * Persona is **webhook-first** (`inquiry.completed` / `inquiry.approved` / `inquiry.declined`).
    Naive's public webhook surface advertises only `email.received`, `sms.received`, and `approval.resolved` today, so
    KYC status comes from the validation-token [`complete`](/docs/api-reference/verification/complete)
    endpoint (instant for the primary) **+ polling** [`GET /v1/verification/:id`](/docs/api-reference/verification/get).
    Treat `GET /v1/webhooks/event-types` as the source of truth before depending on any KYC event.
</Info>

## Concept map

| Persona                                                                                                                 | Naive                                                                                                       | Notes                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Authorization: Bearer <persona_api_key>` + `Persona-Version` header                                                    | `new Naive({ apiKey })`, then `naive.forUser(id)`                                                           | Server-side key in both; Naive scopes KYC to a **tenant identity**                                        |
| **Inquiry Template** (`itmpl_…`) you design + theme                                                                     | Fixed, provider-managed KYC playbook                                                                        | No template authoring or theming — see [gaps](#what-does-not-map-yet)                                     |
| `POST /api/v1/inquiries` — **one** subject                                                                              | `verification.start({ members: [...] })` — **one or more** founders                                         | Naive verifies a *set* of members with ownership %, not one arbitrary subject                             |
| `data.attributes.fields` prefill (`name_first`, `name_last`, `birthdate`)                                               | member `first_name`, `last_name`, `email`, `phone_number`                                                   | Prefill / member identity                                                                                 |
| `reference-id` — string tag to a row in your DB                                                                         | the [tenant user](/docs/getting-started/users) (`forUser(id)`) + member records                                  | Identity is **structural**, not a string                                                                  |
| `POST /inquiries/{id}/generate-one-time-link` → `meta.one-time-link` (or `inquiry.withpersona.com/verify?inquiry-id=…`) | `primary_link` in the `start` response                                                                      | Primary member's hosted link returned inline                                                              |
| Email the link to the subject yourself                                                                                  | **Secondary members emailed automatically**                                                                 | Naive sends secondary KYC links for you                                                                   |
| Hosted Flow / Embedded Flow (iframe, client SDK)                                                                        | Naive-hosted flow at `verify.usenaive.ai`                                                                   | **Hosted only** — no embedded SDK config                                                                  |
| `GET /api/v1/inquiries/{id}` → `data.attributes.status`                                                                 | [`GET /v1/verification/:id`](/docs/api-reference/verification/get) → per-member `status` + `ready_for_formation` | Status read; Naive adds the **formation gate**                                                            |
| Client `inquiry-session-token` / `validationToken`                                                                      | [`POST /v1/verification/members/:id/complete`](/docs/api-reference/verification/complete) `{ validation_token }` | Confirm a member instantly without waiting on a webhook                                                   |
| Regenerate a link / resume                                                                                              | [`POST /v1/verification/members/:id/resend`](/docs/api-reference/verification/resend)                            | New session + emailed link                                                                                |
| **Webhooks** `inquiry.completed` / `inquiry.approved` / `inquiry.declined` (recommended)                                | Validation-token `complete` **+ poll**; **no advertised KYC webhook**                                       | The biggest difference — see [gaps](#what-does-not-map-yet)                                               |
| post-inquiry **approve / decline** workflow                                                                             | `ready_for_formation` (all members `pass`)                                                                  | Naive's "decision" is **formation-readiness**, not generic decisioning                                    |
| **API Keys** + role scopes                                                                                              | **Account Kit** `verification` primitive + per-user assignment                                              | KYC is execution-time policy on the identity — see [gains](#gain-2-execution-time-permission-enforcement) |
| **Reports** (Watchlist/AML, adverse media, PEP)                                                                         | —                                                                                                           | No equivalent product                                                                                     |
| **Cases** (manual-review queue), **Accounts**, **Documents API**, **Verifications API**, **Transactions**               | —                                                                                                           | No equivalents — see [gaps](#what-does-not-map-yet)                                                       |
| **Workflows / Dynamic Flow**, redaction API                                                                             | —                                                                                                           | Not provided                                                                                              |

## Before / after: the core path

The path that matters for founder KYC is *start verification for the people who own the company,
hand them a hosted link, then know when they've passed*. Here it is on both platforms.

<CodeGroup>
  ```ts Persona theme={"theme":"css-variables"}
  // Server-side REST. Persona's featured SDKs are client-side; the server flow is HTTP.
  const PERSONA = "https://api.withpersona.com/api/v1";
  const headers = {
    Authorization: `Bearer ${process.env.PERSONA_API_KEY!}`,
    "Persona-Version": "2025-10-27",
    "Content-Type": "application/json",
  };

  // 1. Create an inquiry against a template you authored (one subject).
  const created = await fetch(`${PERSONA}/inquiries`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        attributes: {
          "inquiry-template-id": "itmpl_XXXXXXXX",
          "reference-id": dbUser.id, // tag back to YOUR user row
          fields: { name_first: "Alice", name_last: "Smith" },
        },
      },
    }),
  }).then((r) => r.json());
  const inquiryId = created.data.id; // "inq_..."

  // 2. Generate the hosted KYC link and send it to the subject yourself.
  const link = await fetch(`${PERSONA}/inquiries/${inquiryId}/generate-one-time-link`, {
    method: "POST",
    headers,
  }).then((r) => r.json());
  // → link.meta["one-time-link"] : "https://inquiry.withpersona.com/..."

  // 3. Read the result (Persona recommends a webhook; polling shown for parity).
  const got = await fetch(`${PERSONA}/inquiries/${inquiryId}`, { headers }).then((r) => r.json());
  // → got.data.attributes.status : "completed" | "approved" | "declined" | ...
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser(dbUser.id); // same id space as your own users

  // 1. Start KYC for the founders (a set, with ownership + responsible party).
  //    The SDK exposes verification.start; status/complete are REST endpoints.
  const verification = await client.verification.start({
    members: [
      {
        first_name: "Alice",
        last_name: "Smith",
        email: "alice@example.com",
        ownership_percentage: 100,
        role: "primary",
        is_responsible_party: true,
      },
    ],
  });
  // → verification.id, verification.primary_link (hand to the primary founder),
  //   verification.members[].status. Secondary members are emailed automatically.

  const nv = {
    Authorization: `Bearer ${process.env.NAIVE_API_KEY!}`,
    "Content-Type": "application/json",
  };

  // 2. Confirm the primary instantly with the validation token from the hosted flow.
  const member = await fetch(
    `https://api.usenaive.ai/v1/verification/members/${verification.members[0].id}/complete`,
    { method: "POST", headers: nv, body: JSON.stringify({ validation_token: "valtok_xxx" }) },
  ).then((r) => r.json());
  // → member.status : "pass" | "fail"

  // 3. Read the result + the formation gate (poll; no KYC webhook to subscribe to today).
  const status = await fetch(
    `https://api.usenaive.ai/v1/verification/${verification.id}`,
    { headers: nv },
  ).then((r) => r.json());
  // → status.ready_for_formation : true only when EVERY member is "pass"
  ```
</CodeGroup>

The shape lines up closely. The real differences to plan for:

* **One subject vs. a set of members.** Persona's inquiry is one person tagged with a
  `reference-id`. Naive's `start` takes the **founding members** with `ownership_percentage`
  (must sum to 100), one `primary`, and one `is_responsible_party`. That structure is the formation
  contract — not an arbitrary KYC subject.
* **The link comes back inline.** Persona is *create inquiry → generate link → email it yourself*.
  Naive returns `primary_link` from `start` and **emails secondary members automatically**.
* **Status: poll + validation token, not a webhook.** Persona steers you to `inquiry.completed`
  webhooks. Naive's public webhook surface does **not** advertise a KYC event today — use the
  validation-token `complete` (instant for the primary) and poll `verification.get` for the rest.
* **The id is your identity, not a tag.** In Persona, `reference-id` points back to *your* DB. In
  Naive, `forUser(id)` **is** the identity that owns the founders' KYC *and* the company they're
  about to form, its cards, phone, and vault.

### Knowing when a founder passed

* Persona's recommended path is a webhook workflow: subscribe to `inquiry.completed`, then approve
  in a post-inquiry workflow and act on `inquiry.approved`.
* Naive's reliable public path today is **validation token + polling**:

<CodeGroup>
  ```ts Persona theme={"theme":"css-variables"}
  // Webhook handler (Persona-Signature HMAC). Persona recommends this over polling.
  app.post("/webhooks/persona", (req, res) => {
    const evt = req.body; // verify Persona-Signature first
    if (evt.data.attributes.name === "inquiry.approved") {
      const inquiryId = evt.data.attributes.payload.data.id;
      // mark the user verified in YOUR system
    }
    res.sendStatus(200);
  });
  ```

  ```ts Naive theme={"theme":"css-variables"}
  const nv = { Authorization: `Bearer ${process.env.NAIVE_API_KEY!}`, "Content-Type": "application/json" };

  // Primary founder: confirm instantly from the hosted flow's validation token.
  await fetch(`https://api.usenaive.ai/v1/verification/members/${memberId}/complete`, {
    method: "POST", headers: nv, body: JSON.stringify({ validation_token: "valtok_xxx" }),
  });

  // Everyone else: poll GET /v1/verification/:id until the formation gate opens.
  const v = await fetch(`https://api.usenaive.ai/v1/verification/${verification.id}`, { headers: nv })
    .then((r) => r.json());
  if (v.ready_for_formation) {
    // every member is "pass" — proceed to formation
  }
  // Confirm any future KYC webhook via GET /v1/webhooks/event-types before relying on it.
  ```
</CodeGroup>

* Member statuses map roughly as: Persona `completed`/`approved` → Naive `pass`; `declined`/`failed`
  → `fail`; `needs_review` → `pending_review`; `pending`/`created` → `in_progress` / `link_sent`.
  See the [full status list](/docs/getting-started/verification#member-statuses).

## Minimal viable migration

The smallest swap that keeps a working founder-KYC flow running is just *start* + *hand over the
link* + *read status*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Swap inquiry creation for verification.start">
    Replace `POST /api/v1/inquiries` (one subject + template) with
    `client.verification.start({ members: [...] })`. Provide each founder's name + email,
    `ownership_percentage` (summing to 100), exactly one `role: "primary"`, and exactly one
    `is_responsible_party: true`. Drop the `inquiry-template-id` — the KYC playbook is managed for
    you.
  </Step>

  <Step title="Swap link delivery">
    Drop `generate-one-time-link` + your own email send. Hand the returned `primary_link` to the
    primary founder; **secondary members are emailed automatically**. Use
    [`verification.resend`](/docs/api-reference/verification/resend) if a link expires.
  </Step>

  <Step title="Swap status tracking">
    Replace the `inquiry.completed` webhook with the validation-token
    [`complete`](/docs/api-reference/verification/complete) call for the primary (instant) and **poll**
    [`GET /v1/verification/:id`](/docs/api-reference/verification/get) for the rest. Gate on
    `ready_for_formation` instead of an `inquiry.approved` workflow.
  </Step>

  <Step title="Ship it">
    At this point your founder-KYC flow runs on Naive. Everything below is upside — the same
    identity is now ready to form the company and own its cards, phone, email, and vault.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Persona, an inquiry verifies a person and stops
there — incorporation, banking, cards, and phone all live in separate systems keyed off a
`reference-id` string. On Naive, the verified founders **are** the identity that carries straight
into formation and every downstream primitive.

<CodeGroup>
  ```ts Persona (KYC only — the rest is a separate stack) theme={"theme":"css-variables"}
  // Verify the founder...
  const inq = await createInquiry({ referenceId: dbUser.id });
  // → status "approved"

  // ...then incorporate with Stripe Atlas / doola, open a bank account, issue a card,
  //    and buy a phone number in ENTIRELY separate systems, each re-keyed to dbUser.id
  //    by hand. Persona never knows the verified person became this company.
  ```

  ```ts Naive (the verified founder carries the whole stack) theme={"theme":"css-variables"}
  const acme = await naive.users.create({ external_id: dbCompany.id, email: founder.email });
  const client = naive.forUser(acme.id);

  // 1. KYC the founders.
  const v = await client.verification.start({ members: [/* founders */] });

  // 2. Same identity → form the company once everyone passes (PII pulled from the
  //    encrypted vault at submission time; it never touches your DB). Pick a
  //    naics_code_id from GET /v1/formation/naics-codes.
  await client.formation.submit({
    verification_id: v.id,
    entity_type: "LLC",
    state: "WY",
    naics_code_id: "<naics-code-id>",
    description: "AI-powered business automation",
    name_options: [{ name: "Acme Tech", entity_type_ending: "LLC" }],
  });

  // 3. Same identity → it now owns the company's card, phone, email, and vault
  //    (provision the number with the company EIN once formation has issued it).
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.phone.provision({ ein: "12-3456789", area_code: "415" });
  await client.email.createInbox({ local_part: "founders" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Persona, KYC is an island: an `inquiry` tagged with a `reference-id` that you manually
  re-key into your formation, banking, card, and phone vendors.
* With Naive, `naive.forUser(acme.id)` is a single handle to **KYC *and* formation *and* cards
  *and* phone *and* email *and* vault**. The founders you verified are literally the
  [responsible party](/docs/getting-started/verification#member-parameters) the company is formed under
  — demonstrated by `formation.submit({ verification_id })`, which *requires* that the KYC passed.

### Gain #2 — execution-time permission enforcement

* Whether an agent may **start KYC** at all is policy on the [Account Kit](/docs/getting-started/account-kits),
  enforced at execution time — not a Persona API-key scope you manage separately.

```ts theme={"theme":"css-variables"}
// Gate KYC behind human approval for agent-initiated calls.
const kit = await naive.accountKits.create({
  name: "Onboarding",
  primitives_config: {
    verification: { enabled: true, requiresApproval: true }, // KYC freezes for approval
    formation: { enabled: true, requiresApproval: true },
  },
});
await naive.accountKits.assignUser(kit.id, acme.id);
```

* The agent's code is identical either way — `client.verification.start({ ... })`. Whether the call
  runs is decided at execution time:
  * An agent whose kit gates `verification.start` gets `202 { status: "pending_approval", approval_id }`
    instead of starting KYC. A human [approves](/docs/getting-started/approvals) it and KYC begins on
    replay — see the [start endpoint note](/docs/api-reference/verification/start).
  * This is the same approval model that gates `formation.submit`, `cards`, and `domains.purchase`
    — *one* policy surface, not one per vendor.

### Gain #3 — unified accountability

* Every KYC start, completion, link resend, and the formation it gates lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside the company's card, phone, email, and vault
  events, not in a separate Persona dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "who verified, who formed the company, and what has the agent done since?" — one timeline
```

* That is the question that is hard to answer when KYC lives in Persona, incorporation in Stripe
  Atlas, and cards in Stripe Issuing. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. Founder KYC (start → hosted link → status →
formation gate) maps cleanly, but the following Persona capabilities have **no direct equivalent**
on Naive's verification primitive today. Check this list against your app before you commit.

| Persona feature                                                                    | Status on Naive                                                                                  | Workaround                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **General-purpose end-user KYC** (verify arbitrary customers, gig workers, riders) | Not provided — Naive KYC is **founder / responsible-party** only                                 | Keep Persona for end-user KYC; use Naive for the founders who form the company                                          |
| **Custom inquiry templates / themes** (`itmpl_…`, theme sets, Dynamic Flow)        | Not configurable — fixed, provider-managed playbook                                              | None — the flow (ID + selfie + SSN + address) is fixed                                                                  |
| **Embedded Flow** (client SDK, your own iframe)                                    | Hosted flow only (`verify.usenaive.ai`)                                                          | Redirect to the hosted `primary_link`                                                                                   |
| **Webhooks for KYC** (`inquiry.completed/approved/declined`)                       | Not advertised today (`email.received`, `sms.received`, `approval.resolved` only)                | Validation-token `complete` (instant for primary) + poll `verification.get`; confirm via `GET /v1/webhooks/event-types` |
| **Reports** — Watchlist / AML, adverse media, PEP screening                        | No equivalent product                                                                            | None — Naive KYC is identity verification, not sanctions/AML screening                                                  |
| **Cases** — manual-review queue + reviewer comments                                | Not provided (members can surface `pending_review`)                                              | Manual review happens in the KYC provider; no Cases API                                                                 |
| **Accounts / Documents / Verifications / Transactions APIs**                       | Not provided                                                                                     | None — Naive exposes verifications + members only                                                                       |
| **post-inquiry decisioning** (`approved`/`declined` via Workflows)                 | `ready_for_formation` gate (all members `pass`)                                                  | Use the formation gate, not a generic approve/decline workflow                                                          |
| **Arbitrary subject model**                                                        | Members require `ownership_percentage` summing to 100, one `primary`, one `is_responsible_party` | Structure is **formation-shaped** — not for non-founder subjects                                                        |
| **Reusable verified profiles / one-time-link expiry tuning**                       | `resend` regenerates a member link; no custom expiry control                                     | Use `verification.resend` when a link expires                                                                           |

<Warning>
  The single most important gap: **Naive does not do general-purpose end-user KYC.** If your Persona
  usage is verifying *your customers* (not your company's founders), or you depend on **AML/watchlist
  Reports**, a **manual-review Cases** queue, **custom templates**, or **KYC webhooks**, those are the
  gaps most likely to matter — Naive verifies **founders ahead of formation** and gates on
  `ready_for_formation`. Equally, note the **direction of the model**: Persona verifies a tagged
  subject and stops; Naive verifies the founders and carries that *same identity* into formation,
  cards, phone, and vault. That carry-through *is* the consolidation gain — but it means the primitive
  is shaped for incorporation, not for verifying arbitrary people.
</Warning>

## Where to go next

* [`verification` primitive](/docs/getting-started/verification) — full start → status → complete →
  resend lifecycle and the `ready_for_formation` gate
* [`verification` API reference](/docs/api-reference/verification/start) — typed request/response for
  every endpoint
* [`verification` CLI](/docs/cli/verification) — start, status, complete, resend
* [Formation](/docs/getting-started/formation) — the incorporation the KYC feeds, keyed off
  `verification_id`
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model behind execution-time KYC governance
* [Vault encryption](/docs/architecture/vault-encryption) — where verified PII lives so it never touches
  your database
* [Tenant users](/docs/getting-started/users) — the identity that owns the founders' KYC, the company,
  and every downstream primitive

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Incorporation Platform](https://usenaive.ai/blog/how-to-build-an-agentic-incorporation-platform) — KYC + formation tutorial
