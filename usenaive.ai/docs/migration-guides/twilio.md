> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Twilio to Naive

> Move agent SMS from Twilio's Programmable Messaging API to Naive's phone primitive — the same provision-a-US-number-and-send/receive-SMS capability, but the number is carrier-registered against one governed identity that also owns the agent's cards, email, vault, and KYC.

<Frame caption="Twilio's Programmable SMS → the Naive phone primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/twilio-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=1f78d82013bae7729316518296ab8153" alt="Twilio" height="28" data-path="migration-guides/logos/twilio-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/twilio-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=1b296b2c4fc3baa13636ae90524f9da1" alt="Twilio" height="28" data-path="migration-guides/logos/twilio-dark.svg" />
</Frame>

[Twilio](https://www.twilio.com/docs/messaging) gives an AI agent a real phone number and an SMS
API: search for a number, buy it, register it for A2P 10DLC, then `client.messages.create(...)` to
send and a webhook to receive. It does that job well, and the API is mature. But it is also a
*separate vendor account*:

* The number lives behind a Twilio **Account SID + Auth Token**, its own console, and its own
  billing — disconnected from wherever the agent's cards, email, secrets, and KYC live.
* A2P 10DLC compliance (Brand + Campaign registration, Messaging Services, sender pools) is yours
  to wire up and keep registered against *your* business entity.
* "Who let this agent text a customer, and what *else* can it touch?" is answered in Twilio for
  messaging, and in unrelated systems for everything else. The rented DID has no shared
  accountability with the rest of the agent's footprint.

Naive's [`phone`](/docs/getting-started/phone) primitive gives the agent the **same** capability —
provision a US number, send SMS, read inbound replies — but the number is **carrier-registered
(10DLC) against one governed identity**:

* The [tenant user](/docs/getting-started/users) that owns the number is the same user that owns its
  [cards](/docs/getting-started/cards), its [email inboxes](/docs/getting-started/email), its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* The 10DLC carrier campaign is registered against the entity that user already
  [formed](/docs/getting-started/formation) and [KYC'd](/docs/getting-started/verification) — accountability
  is built into provisioning, not bolted on.
* Whether an agent may send SMS — and whether provisioning a new number freezes for human approval
  — is decided by that user's [Account Kit](/docs/getting-started/account-kits) and per-agent
  assignment **at execution time**.

This guide maps Twilio's messaging API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  Twilio is a trademark of Twilio Inc., used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** the Twilio Node helper library [`twilio`](https://www.twilio.com/docs/libraries/reference/twilio-node)
  **v5.x** against the Twilio REST API (version path `2010-04-01`, base
  `https://api.twilio.com`, docs snapshot June 2026), and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`,
  docs snapshot June 2026).

  Version notes:

  * Twilio buys a number in **two calls** (`availablePhoneNumbers(...).local.list` to search, then
    `incomingPhoneNumbers.create`) and treats A2P 10DLC registration as a **separate** flow (TrustHub
    Brand/Campaign + a Messaging Service). Naive folds search + purchase + carrier registration into
    **one** `phone.provision` call.
  * Twilio identifies a number by its **`sid`** (`PNxxxx`) and accepts the E.164 string as `from`.
    Naive returns a number **UUID** (`phone.id`) plus the `e164` string; `phone.send` takes the
    UUID as `from`.
  * Naive is **US SMS only** today. Voice, MMS send, WhatsApp, international numbers, short codes,
    and Twilio Verify have **no equivalent** — see [what doesn't map yet](#what-does-not-map-yet).
  * **Prerequisite difference:** Naive requires a completed [LLC formation](/docs/getting-started/formation)
    and the company **EIN** before the first `phone.provision` (the number is registered against your
    business entity). Twilio has no such requirement. This is the accountability trade — see the
    [gaps](#what-does-not-map-yet) section.
</Info>

## Concept map

| Twilio                                                                          | Naive                                                                                           | Notes                                                                                                            |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `require('twilio')(accountSid, authToken)`                                      | `new Naive({ apiKey })`                                                                         | Server-side credential in both cases                                                                             |
| Account SID / Auth Token — one Twilio account, isolated from your other vendors | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive      | The core consolidation win                                                                                       |
| **Subaccounts** (`api.accounts.create`) for per-customer isolation              | [Tenant users](/docs/getting-started/users) (`naive.forUser(id)`)                                    | Naive's unit of isolation spans *every* primitive, not just telephony                                            |
| `client.availablePhoneNumbers('US').local.list({ areaCode })` → search          | (folded into `provision`)                                                                       | No separate search step — pass `area_code` to `provision`                                                        |
| `client.incomingPhoneNumbers.create({ phoneNumber })` → buy                     | `client.phone.provision({ ein, area_code, label })` → `phone.id` / `phone.e164`                 | One call buys the number *and* submits the 10DLC campaign                                                        |
| **A2P 10DLC** Brand + Campaign (TrustHub), Messaging Service, sender pool       | **Automatic** carrier registration inside `provision` (see `campaign.status`)                   | Naive registers the campaign against your formed entity; no Messaging Service to assemble                        |
| `client.incomingPhoneNumbers.list()`                                            | `client.phone.list()`                                                                           | List numbers for the identity                                                                                    |
| `client.incomingPhoneNumbers('PNxxx').remove()`                                 | `client.phone.release(phoneId)`                                                                 | Release the number, stop rental billing                                                                          |
| `client.messages.create({ from, to, body })`                                    | `client.phone.send({ from, to, body })`                                                         | `from` is the **UUID** on Naive, the E.164 string on Twilio                                                      |
| `client.messages.create({ messagingServiceSid, to, body })`                     | —                                                                                               | No Messaging Service / sender-pool selection — `from` is one number                                              |
| **Inbound** via the number's `smsUrl` webhook (TwiML POST)                      | `client.phone.messages(phoneId)` poll **+** `sms.received` [webhook](/docs/getting-started/webhooks) | Stored inbound; no synchronous TwiML reply — see [gaps](#what-does-not-map-yet)                                  |
| `client.messages.list({ to })` → message logs                                   | `client.phone.messages(phoneId, { limit })` → inbound for a number                              | Cursor-paginated, newest first                                                                                   |
| (read one message in the logs)                                                  | `client.phone.read(messageId)`                                                                  | Full body + any inbound media URLs                                                                               |
| **API Keys** + scopes for least-privilege                                       | **Account Kit** `phone` primitive + per-agent assignment (`send_sms`, `receive_sms`)            | Permission is execution-time policy on the identity — see [gains](#gain-2-execution-time-permission-enforcement) |
| `statusCallback` delivery receipts                                              | Partial — synchronous `status` on `send`                                                        | No async delivery-status callback stream — see [gaps](#what-does-not-map-yet)                                    |
| **Programmable Voice** (calls, TwiML `<Dial>`)                                  | —                                                                                               | Out of scope for the phone primitive                                                                             |
| **MMS send**, **WhatsApp**, **RCS**, short codes, alphanumeric sender IDs       | —                                                                                               | Not provided; inbound media URLs *are* captured — see [gaps](#what-does-not-map-yet)                             |
| **Twilio Verify** (OTP), **Lookup**, **Conversations**                          | —                                                                                               | No equivalent products                                                                                           |
| **International numbers**                                                       | —                                                                                               | US numbers only today                                                                                            |

## Before / after: the core path

The path that matters for almost every SMS agent is *get a number, then send a message from it*.
Here it is on both platforms.

<CodeGroup>
  ```ts Twilio theme={"theme":"css-variables"}
  import twilio from "twilio";

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  // 1. Search for a US number, then buy it (two calls)
  const [candidate] = await client
    .availablePhoneNumbers("US")
    .local.list({ areaCode: 415, smsEnabled: true, limit: 1 });

  const number = await client.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber, // e.g. "+14155551234"
  });
  // → number.sid ("PNxxxx"), number.phoneNumber

  // 2. (separately) register an A2P 10DLC Brand + Campaign and attach a
  //    Messaging Service before US carriers will deliver application traffic.

  // 3. Send a message from it
  const sent = await client.messages.create({
    from: number.phoneNumber,
    to: "+14155559876",
    body: "Your order shipped!",
  });
  // → sent.sid, sent.status
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("acme"); // same id space as your own users

  // 1. Provision a US number — buys it AND submits the 10DLC campaign in one call.
  //    `ein` is required the first time (carrier brand registration).
  const { phone, campaign } = await client.phone.provision({
    ein: "12-3456789",
    area_code: "415",
    label: "Support",
  });
  // → phone.id (UUID), phone.e164, campaign.status ("created" | "in_review" | "active")

  // 2. Send a message from it (blocked with `compliance_pending` until the
  //    campaign is approved — no message sent, no credit charged).
  const sent = await client.phone.send({
    from: phone.id,
    to: "+14155559876",
    body: "Your order shipped!",
  });
  // → sent.status, credits used/remaining
  ```
</CodeGroup>

The send shape lines up closely. The real differences to plan for:

* **One call to provision, not two-plus.** Twilio is *search → buy → register A2P → attach a
  Messaging Service*. Naive's `provision` buys the number and submits the 10DLC campaign together.
* **`from` is a UUID, not the E.164 string.** Twilio's `from` is the number itself. Naive's
  `phone.send` takes the `phone.id` UUID; the `e164` string is returned for display.
* **Outbound is carrier-gated on both — Naive surfaces it inline.** Until the 10DLC campaign is
  `active`, Naive returns `compliance_pending` (no charge); poll `phone.status()` for progress.
* **The id is your identity, not a separate account.** In Twilio the Account SID scopes *Twilio*.
  In Naive the same `forUser(id)` handle also owns the agent's cards, email, vault, and KYC.

### Receiving replies

Twilio delivers inbound SMS by POSTing to the number's configured `smsUrl` (you reply with TwiML).
Naive stores inbound messages against the receiving number; read them by polling, and react in real
time with the `sms.received` event.

<CodeGroup>
  ```ts Twilio theme={"theme":"css-variables"}
  // Configure the number's inbound webhook, then handle Twilio's POST:
  app.post("/sms", (req, res) => {
    const from = req.body.From;   // "+14155559876"
    const body = req.body.Body;   // the inbound text
    // Optionally reply synchronously with TwiML:
    res.type("text/xml").send("<Response><Message>Got it</Message></Response>");
  });

  // Or read the message logs:
  const msgs = await client.messages.list({ to: number.phoneNumber, limit: 20 });
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // Poll inbound for a number (newest first, cursor-paginated):
  const messages = await client.phone.messages(phone.id, { limit: 20 });
  for (const m of messages) {
    const full = await client.phone.read(m.id); // full body + any media URLs
  }

  // Or subscribe to the inbound event (verify against GET /v1/webhooks/event-types):
  const sub = await naive.webhooks.create(
    "https://app.example.com/api/webhooks/naive",
    ["sms.received"],
  );
  // store sub.secret — verify with verifyWebhookSignature()
  ```
</CodeGroup>

* On Naive, inbound texts are captured automatically and queryable via `phone.messages` /
  `phone.read` — that path always works the moment a number is live.
* The `sms.received` [webhook](/docs/getting-started/webhooks) is documented in the
  [phone primitive](/docs/getting-started/phone) for real-time reactions. The canonical
  emitted-event list is `GET /v1/webhooks/event-types` — treat that as the source of truth and
  confirm the event before depending on it (see [gaps](#what-does-not-map-yet)).
* There is **no synchronous TwiML reply**. To answer an inbound message, call `phone.send`.

## Minimal viable migration

The smallest swap that keeps a working agent running is just *provision* + *send* + *read inbound*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Clear the provisioning prerequisites (one-time)">
    A Naive number is carrier-registered against your business entity, so before the first
    `provision` you need a completed [LLC formation](/docs/getting-started/formation) and the company
    **EIN**. If you do not have one, run [KYC](/docs/getting-started/verification) →
    [formation](/docs/getting-started/formation) first. (Twilio has no equivalent gate — this is the
    accountability trade-off; see [gaps](#what-does-not-map-yet).)
  </Step>

  <Step title="Swap number acquisition">
    Replace `availablePhoneNumbers(...).local.list(...)` + `incomingPhoneNumbers.create(...)` with a
    single `client.phone.provision({ ein, area_code, label })`. Keep the returned `phone.id`. Drop
    the separate A2P 10DLC Brand/Campaign and Messaging Service setup — `provision` submits the
    campaign for you.
  </Step>

  <Step title="Swap send">
    Replace `client.messages.create({ from, to, body })` with
    `client.phone.send({ from: phone.id, to, body })`. Use the **UUID** as `from`. Handle
    `compliance_pending` by retrying once `phone.status()` shows the campaign `active`.
  </Step>

  <Step title="Swap inbound">
    Replace your `smsUrl` TwiML handler with `client.phone.messages(phone.id)` /
    `client.phone.read(id)` (and optionally the `sms.received` [webhook](/docs/getting-started/webhooks)).
    Reply by calling `phone.send` instead of returning TwiML.
  </Step>

  <Step title="Ship it">
    At this point you are off Twilio for the core US-SMS send/receive path. Everything below is
    upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Twilio, the Account SID isolates **telephony and
nothing else**, and the number is an anonymous rented DID. On Naive, the unit of isolation is a
**tenant user**, and the number is rooted in that identity's verified, formed business.

<CodeGroup>
  ```ts Twilio (account / subaccount — telephony only) theme={"theme":"css-variables"}
  // One subaccount per customer; isolates numbers and messages, and only those.
  const sub = await client.api.accounts.create({ friendlyName: "acme" });
  const subClient = twilio(sub.sid, sub.authToken);
  const number = await subClient.incomingPhoneNumbers.create({ phoneNumber });
  await subClient.messages.create({ from: number.phoneNumber, to, body });

  // The card, the vault secrets, the email inbox, the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  const { phone } = await client.phone.provision({ ein: "12-3456789", area_code: "415" });
  await client.phone.send({ from: phone.id, to, body });

  // The SAME client owns this customer's card, email inbox, vault, and KYC —
  // one identity, isolated end to end, and the number is registered against it.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "support" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Twilio, the agent's numbers are an island behind an Account SID. With Naive,
  `naive.forUser(acme.id)` is a single handle to **phone *and* cards *and* email *and* vault *and*
  KYC**.
* The number is not an anonymous DID — its 10DLC campaign is registered against the entity that
  identity already [formed](/docs/getting-started/formation) and [verified](/docs/getting-started/verification).
  Tear the customer down from one place; sibling tenants can never read each other's messages,
  cards, or secrets.

### Gain #2 — execution-time permission enforcement

* Whether an agent may send SMS at all is **per-agent assignment** on the number, and whether
  provisioning a *new* number freezes for human review is **policy on the Account Kit** — not a
  check you hand-write and not a Twilio API-Key scope you manage separately.

```ts theme={"theme":"css-variables"}
// Provisioning a number is approval-gated by default; SMS sending is not.
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    phone: { enabled: true, requiresApproval: true }, // new numbers freeze for approval
    cards: { enabled: false },                          // no card for this tier
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);

// An agent only gets to text from a number you connect it to:
await client.phone.assign(phone.id, agentId, ["send_sms", "receive_sms"]);
```

* The agent's code is identical for every tier — `client.phone.send({ ... })`. Whether the call
  runs is decided at execution time:
  * An agent without `send_sms` on the number is refused with `forbidden`, with no code change on
    your side.
  * `phone.requiresApproval: true` freezes a **provision** until a human
    [approves](/docs/getting-started/approvals) — the API replays it only after approval. Sending SMS is
    a routine action and is **not** approval-gated.

### Gain #3 — unified accountability

* Every provision, send, and inbound reply for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their card, email, vault, and KYC events, not
  in a separate Twilio console:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — phone, cards, email, vault, one timeline
```

* That is the question that is hard to answer when SMS lives in Twilio, cards live in Stripe, and
  secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (provision → send → read
inbound) maps cleanly for **US SMS**, but the following Twilio capabilities have **no direct
equivalent** on Naive's phone primitive today. Check this list against your app before you commit.

| Twilio feature                                                                 | Status on Naive                            | Workaround                                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Programmable Voice** (calls, TwiML `<Dial>`, IVR)                            | Not provided (`capabilities.voice: false`) | None — keep Twilio for voice, or wait for parity                                                                                   |
| **MMS send**                                                                   | Not provided (`capabilities.mms: false`)   | Inbound media URLs *are* captured via `phone.read`; outbound is SMS text only. Link to [Storage](/docs/getting-started/storage) instead |
| **WhatsApp / RCS / short codes / alphanumeric sender IDs**                     | No equivalent senders                      | SMS from a single 10DLC long code only                                                                                             |
| **International numbers**                                                      | US numbers only                            | None today — US 10DLC only                                                                                                         |
| **Twilio Verify** (OTP), **Lookup**, **Conversations**                         | No equivalent products                     | Build OTP on top of `phone.send`; Naive's [verification](/docs/getting-started/verification) is founder **KYC**, not phone OTP          |
| **Messaging Services / sender pools / number pooling**                         | Not provided — `from` is one number        | Provision multiple numbers and pick a `from` in your own code                                                                      |
| **Self-managed A2P 10DLC** (TrustHub Brand/Campaign API, ISV sub-registration) | Automatic, not configurable                | `provision` registers the campaign for your entity; you don't control the Brand/Campaign objects                                   |
| **Synchronous inbound reply** (TwiML `<Response>`)                             | Not provided                               | Inbound is stored + (optionally) a `sms.received` event; reply by calling `phone.send`                                             |
| **Async delivery-status callbacks** (`statusCallback`)                         | Partial — synchronous `status` on `send`   | Inspect the `send` response; no per-message delivery-receipt stream                                                                |
| **No formation/EIN required to buy a number**                                  | Different model                            | Naive requires a completed [formation](/docs/getting-started/formation) + EIN first — the accountability trade                          |

<Warning>
  If your agent needs **voice**, **MMS/WhatsApp send**, **international numbers**, **Twilio Verify**,
  **Messaging Services**, or a **synchronous TwiML reply**, those are the gaps most likely to matter —
  Naive does **US SMS over a single 10DLC long code** today. Equally, note the **prerequisite
  inversion**: Twilio rents you a number with no identity check, while Naive requires a formed,
  KYC'd entity *first* and registers the number against it. That requirement *is* the accountability
  gain — but it is a real step you must complete before your first `provision`.
</Warning>

## Where to go next

* [`phone` primitive](/docs/getting-started/phone) — full provision/send/receive lifecycle + 10DLC gating
* [`phone` SDK sub-client](/docs/sdk/sub-clients/phone) — typed method signatures
* [`phone` CLI](/docs/cli/phone) — provision, send, messages, assign, release
* [Webhooks](/docs/getting-started/webhooks) — outbound event subscriptions (confirm `sms.received` via
  `GET /v1/webhooks/event-types`)
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model behind execution-time governance and provision approval
* [Verification](/docs/getting-started/verification) and [Formation](/docs/getting-started/formation) — the
  KYC + entity that the carrier registration (and the consolidation) hangs off
* [Tenant users](/docs/getting-started/users) — the identity that owns the number, cards, email, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Appointment Reminder Agent](https://usenaive.ai/blog/how-to-build-an-agentic-appointment-reminder-agent) — SMS reminder tutorial
