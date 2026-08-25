> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from AgentMail to Naive

> Move agent email from AgentMail's standalone inbox API to Naive's email primitive — the same create-an-inbox-and-send/receive capability, rooted in one governed identity that also owns the agent's cards, vault, connections, and KYC.

<Frame caption="AgentMail's agent-native email → the Naive email primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/agentmail-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=e87f4cea5cdab584318a0aa13142b466" alt="AgentMail" height="28" data-path="migration-guides/logos/agentmail-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/agentmail-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=3ef51dee85b7cd92d67d6bd9378c8250" alt="AgentMail" height="28" data-path="migration-guides/logos/agentmail-dark.svg" />
</Frame>

[AgentMail](https://agentmail.to) gives an AI agent a real email account through one API — create
an inbox, send and receive messages, group them into threads, and drive it all from webhooks or
WebSockets. It does that job well, and the API is clean. But it is also a *separate vendor
account*:

* Inboxes live behind their **own** API key, dashboard, and `inbox_id` namespace.
* That account scopes **email and nothing else** — it knows the agent's inboxes and threads, but
  not its virtual card, its vault secrets, its connected apps, or its KYC status.
* "Who let this agent email a customer, and what *else* can it touch?" is answered in AgentMail
  for mail, and somewhere else for everything else. There is no shared accountability.

Naive's [`email`](/docs/getting-started/email) primitive gives the agent the **same** capability —
provision an inbox on your domain, send mail, read replies — but rooted in **one identity**:

* The [tenant user](/docs/getting-started/users) that owns the inbox is the same user that owns its
  [cards](/docs/getting-started/cards), its [vault](/docs/getting-started/vault) secrets, its
  [connections](/docs/getting-started/connections), and its [KYC](/docs/getting-started/verification).
* Whether the agent may send mail at all — and whether a send freezes for human approval — is
  decided by that user's [Account Kit](/docs/getting-started/account-kits) **at execution time**.
* Every inbox, send, and inbound reply lands in the same per-user
  [activity log](/docs/getting-started/logs) as everything else the agent does.

This guide maps AgentMail's API to Naive's, shows the smallest working swap, and is explicit about
what does not map yet.

<Note>
  AgentMail is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** AgentMail Node SDK [`agentmail`](https://docs.agentmail.to) (`AgentMailClient`,
  API base `https://api.agentmail.to/v0`, docs snapshot June 2026) and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`,
  docs snapshot June 2026).

  Version notes:

  * AgentMail's REST API is still on the **`v0`** path — treat method and field names as
    pre-1.0 and verify against your installed SDK version.
  * AgentMail keys an inbox by its **full address** (`agent@agentmail.to`) and uses that as the
    `inbox_id`. Naive returns an inbox **UUID** but the SDK's `from_inbox` accepts either the id or
    the address.
  * AgentMail sends a separate `text` and `html` body. Naive takes a single `body` and sends it as
    HTML if it contains tags, otherwise plain text.
</Info>

## Concept map

| AgentMail                                                                 | Naive                                                                                        | Notes                                                                                                          |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `new AgentMailClient({ apiKey })`                                         | `new Naive({ apiKey })`                                                                      | Server-side key in both cases                                                                                  |
| Account / API key — scopes **email only**                                 | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive   | The core consolidation win                                                                                     |
| `client.inboxes.create({ username, domain })` → `inbox.inboxId`           | `client.email.createInbox({ local_part })` → `inbox.id` / `inbox.address`                    | `username` ↔ `local_part`; Naive defaults to your auto-provisioned domain                                      |
| `client.inboxes.list()`                                                   | `client.email.listInboxes()`                                                                 | List inboxes for the identity                                                                                  |
| `client.inboxes.delete(inboxId)`                                          | `client.email.deleteInbox(inboxId)`                                                          | Deactivate an inbox                                                                                            |
| `client.inboxes.messages.send(inboxId, { to, subject, text, html })`      | `client.email.send({ from_inbox, to, subject, body })`                                       | `text`+`html` collapse to one `body` (HTML auto-detected)                                                      |
| `client.inboxes.messages.list(inboxId, { limit })` → `.messages`          | `client.email.inbox({ inboxId, limit })` → `.emails`                                         | Received mail for an inbox                                                                                     |
| `client.inboxes.messages.get(inboxId, messageId)`                         | `client.email.getEmail(emailId)`                                                             | Read one message                                                                                               |
| **`message.received` webhook**                                            | **`email.received` [webhook](/docs/getting-started/webhooks)**                                    | HMAC-signed, retried; the inbound trigger                                                                      |
| **Custom domains** (`client.domains.*`, verify)                           | [Domains primitive](/docs/getting-started/domains) (`/v1/domains`, `POST /v1/domains/:id/verify`) | Naive auto-provisions a system domain; BYOD is supported                                                       |
| **Pods** (per-tenant isolation of inboxes/domains/data)                   | [Tenant users](/docs/getting-started/users) (`naive.forUser(id)`)                                 | Naive's unit of isolation spans *every* primitive, not just mail                                               |
| **Drafts + human-in-the-loop** (`drafts.create` → review → `drafts.send`) | **Account Kit `requiresApproval` + [Approvals](/docs/getting-started/approvals)**                 | Maps *differently* — see [gaps](#what-does-not-map-yet); approval is execution-time policy, not a draft object |
| **Send/receive control** (which addresses may send/receive)               | **Account Kit** `primitives_config.email` — enable/disable + approval gating                 | Coarse + approval, not per-address lists — see [gaps](#what-does-not-map-yet)                                  |
| **Threads** (`threads.*`, `messages.reply`/`replyAll`/`forward`)          | —                                                                                            | No first-class thread object or reply helper — see [gaps](#what-does-not-map-yet)                              |
| **Labels** (state, read/unread, campaigns)                                | —                                                                                            | No email labels — see [gaps](#what-does-not-map-yet)                                                           |
| **Lists** (allow/block sender + recipient addresses)                      | —                                                                                            | No per-address email allow/block — see [gaps](#what-does-not-map-yet)                                          |
| **Full-text search** (`messages.search`)                                  | —                                                                                            | `email.inbox` filters by inbox + pagination only                                                               |
| **Attachments** (send/reply files, download inbound)                      | —                                                                                            | `send` carries no attachment field today                                                                       |
| **Agent self-sign-up** (`agent.signUp` / `agent.verify` OTP)              | —                                                                                            | You provision [tenant users](/docs/getting-started/users) from your server key                                      |
| **IMAP / SMTP access**, **WebSockets**                                    | Partial — Webhooks                                                                           | API + `email.received` webhook; no IMAP/SMTP or socket stream                                                  |

## Before / after: the core path

The path that matters for almost every agent is *create an inbox, then send a message from it*.
Here it is on both platforms.

<CodeGroup>
  ```ts AgentMail theme={"theme":"css-variables"}
  import { AgentMailClient } from "agentmail";

  const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! });

  // 1. Create an inbox (clientId makes the create idempotent)
  const inbox = await client.inboxes.create({
    username: "outreach",
    clientId: "acme-outreach-v1",
  });
  // → inbox.inboxId, e.g. "outreach@agentmail.to"

  // 2. Send a message from it
  const sent = await client.inboxes.messages.send(inbox.inboxId, {
    to: "prospect@company.com",
    subject: "Research findings",
    text: "Hi Sarah, here are the results...",
    html: "<p>Hi Sarah, here are the results...</p>",
  });
  // → sent.messageId, sent.threadId
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("acme"); // same id space as your own users

  // 1. Create an inbox on your auto-provisioned (or custom) domain
  const inbox = await client.email.createInbox({ local_part: "outreach" });
  // → inbox.id (UUID) and inbox.address, e.g. "outreach@acme.usenaive.ai"

  // 2. Send a message from it (one body — HTML auto-detected)
  const sent = await client.email.send({
    from_inbox: inbox.id,
    to: "prospect@company.com",
    subject: "Research findings",
    body: "<p>Hi Sarah, here are the results...</p>",
  });
  // → sent.id, sent.status, sent.credits_used, sent.credits_remaining
  ```
</CodeGroup>

The create-and-send shape lines up closely. The real differences to plan for:

* **One body, not two.** AgentMail takes `text` and `html`. Naive takes a single `body` and sends
  it as HTML when it contains tags, otherwise plain text.
* **Inbox id is a UUID (or the address).** AgentMail uses the address itself as `inbox_id`. Naive
  returns a UUID `id` plus the `address`; `from_inbox` accepts either.
* **The id is your identity, not a separate account.** In AgentMail the API key scopes *email*. In
  Naive the same `forUser(id)` handle also owns the agent's cards, vault, connections, and KYC.

### Receiving replies

Both platforms expose a list-the-inbox call and an inbound webhook. AgentMail's event is
`message.received`; Naive's is [`email.received`](/docs/getting-started/webhooks).

<CodeGroup>
  ```ts AgentMail theme={"theme":"css-variables"}
  // Poll
  const res = await client.inboxes.messages.list(inbox.inboxId, { limit: 20 });
  for (const m of res.messages) {
    const body = m.extractedText ?? m.text; // quoted history stripped
  }

  // Or react to the webhook event: "message.received"
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // Poll
  const { emails } = await client.email.inbox({ inboxId: inbox.id, limit: 20 });
  for (const m of emails) {
    console.log(m.from, m.subject, m.snippet);
    const full = await client.email.getEmail(m.id); // full body
  }

  // Or subscribe to the inbound event once, per company or per tenant:
  const sub = await naive.webhooks.create(
    "https://app.example.com/api/webhooks/naive",
    ["email.received"],
  );
  // store sub.secret — verify with verifyWebhookSignature()
  ```
</CodeGroup>

* On Naive, an inbound delivery fires a signed, retried `email.received` webhook. When present,
  `data.tenant_user_id` identifies which tenant user the reply belongs to (company-wide
  subscriptions may omit it — see [Webhooks](/docs/getting-started/webhooks)).
* Naive returns a `snippet` in the list and the full body via `getEmail` — there is no separate
  quoted-history-stripped field (see [gaps](#what-does-not-map-yet)).

## Minimal viable migration

The smallest swap that keeps a working agent running is just *create inbox* + *send* + *read
inbound*. You do not need tenant-user fan-out, Account Kits, or webhooks to make your first call.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Confirm you have an active domain">
    Naive auto-provisions a system domain on registration. Check `GET /v1/domains`; if it shows
    `pending_dns`, run `POST /v1/domains/:id/verify`. Bringing your own domain is the
    [Domains](/docs/getting-started/domains) flow.
  </Step>

  <Step title="Swap inbox creation">
    Replace `client.inboxes.create({ username })` with
    `client.email.createInbox({ local_part })`. Reuse your AgentMail `username` as the
    `local_part`. Keep the returned `inbox.id`.
  </Step>

  <Step title="Swap send">
    Replace `client.inboxes.messages.send(inboxId, { to, subject, text, html })` with
    `client.email.send({ from_inbox, to, subject, body })`. Collapse `text`/`html` into one
    `body`.
  </Step>

  <Step title="Swap inbound">
    Replace `messages.list(inboxId)` / the `message.received` webhook with
    `client.email.inbox({ inboxId })` / the [`email.received`](/docs/getting-started/webhooks) webhook.
  </Step>

  <Step title="Ship it">
    At this point you are off AgentMail for the core send/receive path. Everything below is upside,
    not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In AgentMail, the API key isolates **email and
nothing else**. On Naive, the unit of isolation is a **tenant user**, and it isolates the agent's
*entire* footprint.

<CodeGroup>
  ```ts AgentMail (account / pod — email only) theme={"theme":"css-variables"}
  // One pod (or API key) per customer; isolates inboxes, and only those.
  const inbox = await client.inboxes.create({ username: "acme-outreach" });
  await client.inboxes.messages.send(inbox.inboxId, { to, subject, text });

  // The card, the vault secrets, the connected apps, the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  const inbox = await client.email.createInbox({ local_part: "outreach" });
  await client.email.send({ from_inbox: inbox.id, to, subject, body });

  // The SAME client owns this customer's card, vault, connections, and KYC —
  // one identity, isolated end to end.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With AgentMail, the agent's inboxes are an island. With Naive, `naive.forUser(acme.id)` is a
  single handle to **email *and* cards *and* vault *and* connections *and* KYC**.
* You provision a customer's whole agent footprint from one identity, and tear it down from one
  place. Sibling tenants can never read each other's inboxes, cards, or secrets.

### Gain #2 — execution-time permission enforcement

* Whether an agent may send mail — and whether a send freezes for human review — is **policy on
  the Account Kit**, not a check you hand-write and not a separate draft-review service.

```ts theme={"theme":"css-variables"}
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    email: { enabled: true, requiresApproval: true }, // every send freezes for approval
    cards: { enabled: false },                          // no card for this tier
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);
```

* The agent's code is identical for every tier — `client.email.send({ ... })`. Whether the call
  runs is decided by the **caller's kit at execution time**:
  * `primitives_config.email.enabled: false` makes the exact same line return `forbidden`, with no
    code change on your side.
  * `requiresApproval: true` freezes the send until a human [approves](/docs/getting-started/approvals)
    — the API replays it only after approval. This is Naive's answer to AgentMail's human-in-the-loop
    drafts: the review gate is policy, applied to the live call, not a separate object you build a
    UI around.

### Gain #3 — unified accountability

* Every inbox, send, and inbound reply for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their card, vault, and connection events, not
  in a separate mail dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — email, cards, vault, connections, one timeline
```

* That is the question that is hard to answer when mail lives in AgentMail, cards live in Stripe,
  and secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (create inbox → send → read
inbound → webhook) maps cleanly, but the following AgentMail features have **no direct equivalent**
on Naive's email primitive today. Check this list against your app before you commit.

| AgentMail feature                                                                 | Status on Naive                | Workaround                                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Threads** as first-class objects (`threads.*`, thread-grouped messages)         | No thread object               | List/read messages per inbox; group by subject/`In-Reply-To` in your own store                                            |
| **Reply / reply-all / forward** helpers (`messages.reply`, `replyAll`, `forward`) | Not provided — `send` only     | Re-`send` to the original sender; set `reply_to` for the header. Threading headers are not exposed                        |
| **Drafts** object + draft review/send (`drafts.create` → `drafts.send`)           | Maps *differently*             | Use Account Kit `email.requiresApproval` + [Approvals](/docs/getting-started/approvals) for human-in-the-loop on the live send |
| **Labels** (state, read/unread, campaign tags)                                    | No email labels                | Track state in your own DB, or in Naive [Memory](/docs/sdk/sub-clients/memory) / app-data                                      |
| **Lists** (per-address/-domain allow + block)                                     | No per-address email lists     | Account Kit gates the email *primitive* (on/off + approval), not individual recipients                                    |
| **Full-text search** (`messages.search`, relevance + highlights)                  | Not exposed                    | `email.inbox` filters by inbox + paginates; index bodies yourself if you need search                                      |
| **Attachments** (send/reply files, download inbound)                              | `send` has no attachment field | Inline content or link to [Storage](/docs/getting-started/storage); no dedicated attachment helper                             |
| **`extracted_text` / `extracted_html`** (quoted-history stripping)                | Not provided                   | `getEmail` returns the full body; strip quotes yourself (e.g. Talon)                                                      |
| **Agent self-sign-up** (`agent.signUp` / `agent.verify` OTP)                      | Different model                | Provision [tenant users](/docs/getting-started/users) from your server-side key                                                |
| **IMAP / SMTP** access and **WebSockets**                                         | Partial — Webhooks only        | Use the `email.received` [webhook](/docs/getting-started/webhooks); no IMAP/SMTP or socket stream                              |

<Warning>
  If your agent depends on **threads/replies as first-class objects**, **labels**, **per-recipient
  allow/block lists**, **full-text search**, or **attachments**, those are the gaps most likely to
  matter. The create-inbox → send → receive loop with Account-Kit governance — the most common agent
  email pattern — maps cleanly today. Human-in-the-loop maps, but as an *approval gate* rather than a
  draft object.
</Warning>

## Where to go next

* [`email` primitive](/docs/getting-started/email) — full inbox/send/receive lifecycle
* [Email API reference](/docs/api-reference/email/send) — exact request/response shapes
* [`email` SDK sub-client](/docs/sdk/sub-clients/email) — typed method signatures
* [Webhooks](/docs/getting-started/webhooks) — the `email.received` event that makes inbound autonomous
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model that makes execution-time send governance and human-in-the-loop real
* [Tenant users](/docs/getting-started/users) — the identity that the consolidation hangs off

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Email Marketing Platform](https://usenaive.ai/blog/how-to-build-an-agentic-email-marketing-platform) — per-user inbox tutorial
