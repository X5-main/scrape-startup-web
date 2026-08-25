> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from ElevenLabs to Naive

> Move an agent's cloned voice + text-to-speech from a standalone ElevenLabs account (one API key, self-attested cloning, no per-use governance) to Naive's voice primitive — the same clone-a-voice-then-synthesize capability, but every voice is bound to a consent record, its uses are enforced at synthesis time, and clone/revoke require a human session — on the same identity that owns the agent's email, cards, and phone.

<Frame caption="ElevenLabs → the Naive voice primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/elevenlabs-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=9cc4566ad41d757a3e29c6c09d56c99e" alt="ElevenLabs" height="28" data-path="migration-guides/logos/elevenlabs-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/elevenlabs-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=2031516d94c6d91c20d285a7820aa623" alt="ElevenLabs" height="28" data-path="migration-guides/logos/elevenlabs-dark.svg" />
</Frame>

<Note>
  ElevenLabs is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[ElevenLabs](https://elevenlabs.io/docs) is the default voice stack for agents: clone a voice from a
few seconds of audio (`voices.ivc.create`), then synthesize speech in it
(`textToSpeech.convert`) with realistic multilingual output. The SDK is mature and the models are
excellent. But an ElevenLabs account is also a *standalone voice vendor* that sits apart from
everything else your agent touches:

* Every voice lives behind a single **`xi-api-key`**, disconnected from wherever the agent's email,
  cards, phone number, and KYC live.
* The key is **coarse and self-attested**: any code holding it can clone *any* voice and synthesize
  *anything* with it. The only "consent" is a checkbox in the cloning ToS — there is **no record**
  of who consented, and **nothing enforces** that a voice cloned for one purpose isn't used for
  another.
* "Which agent cloned that voice, who consented, and what *else* can this agent do?" is answered in
  the ElevenLabs dashboard for voices, and in unrelated systems for everything else. The voice has
  no shared accountability with the rest of the agent's footprint.

Naive's [`voice`](/docs/getting-started/voice) primitive gives the agent the **same** capability — clone
a consented voice, then synthesize speech in it — but the voice is **rooted in one governed
identity** with consent and permissions enforced at execution time:

* Every voice carries a **consent record** (who consented, the affirmation, and the
  `authorized_uses`), and synthesis is **refused** if the requested `use` falls outside that set — a
  voice cloned for `email` will not narrate a `video`.
* Cloning and revoking a voice are **human-only** — they require a signed-in session, not just an
  agent API key — so a leaked agent key can synthesize with voices it already owns but can **never**
  mint or destroy one.
* The [tenant user](/docs/getting-started/users) whose Account Kit enables `voice` is the same user that
  owns the agent's [email inboxes](/docs/getting-started/email), its [cards](/docs/getting-started/cards), its
  [phone number](/docs/getting-started/phone), and its [vault](/docs/getting-started/vault) — one identity, one
  audit trail, revocable in one place.

This guide maps ElevenLabs' voice model to Naive's `voice` primitive, shows the smallest working
swap, and is explicit about the ElevenLabs features that **don't** map yet.

<Info>
  **Tested against:** the ElevenLabs Node SDK
  [`@elevenlabs/elevenlabs-js`](https://www.npmjs.com/package/@elevenlabs/elevenlabs-js) **v2.53.0**
  (`ElevenLabsClient`, `textToSpeech.convert`, `textToSpeech.stream`, `voices.ivc.create`,
  `voices.search`, `voices.delete`; REST base `https://api.elevenlabs.io`, `xi-api-key` header) and the
  Naive `voice` primitive over the Naive API (base `https://api.usenaive.ai/v1`) plus the
  [Naive CLI](/docs/cli/overview), docs snapshot July 2026.

  Version notes:

  * ElevenLabs exposes **two clone flows**: **Instant Voice Clone** (`voices.ivc.create`, a few seconds
    of audio) and **Professional Voice Cloning** (`voices.pvc.*`, longer dataset + a verification /
    training step). Naive's `voice clone` is a single consented-clone flow with `consent_type` of
    `self`, `third_party_attested`, or `third_party_verified` (third-party consenters get a
    verification link) — see the [concept map](#concept-map).
  * ElevenLabs identifies a voice by its **`voice_id`** and lets you pass `modelId`
    (`eleven_multilingual_v2`, etc.), `voiceSettings`, and `outputFormat` per call. Naive identifies a
    voice by its **id**, returns a presigned MP3 URL (valid 24h), and does **not** expose model /
    voice-settings / output-format selection today — see
    [what doesn't map yet](#what-does-not-map-yet).
  * The Naive `voice` primitive is **REST + CLI** (there is no `voice` SDK sub-client yet). Examples
    below use the Naive CLI and `fetch`; the agent surface uses an `nv_sk_` API key, and the
    human-only clone/revoke surface requires `naive auth session-login`.
  * Naive **adds** a capability ElevenLabs has no equivalent for: the
    [digital-twin clone](/docs/getting-started/voice#digital-twin-talking-video) turns a reference image +
    a cloned voice + a script into a lip-synced talking video.
</Info>

## Concept map

| ElevenLabs                                                                        | Naive                                                                                                             | Notes                                                                                   |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `new ElevenLabsClient({ apiKey })` — one `xi-api-key` for clone **and** synth     | `nv_sk_` agent key for synth; **human session** (`naive auth session-login`) for clone/revoke                     | Two trust levels — cloning is not an agent-key action                                   |
| `voices.ivc.create({ name, files })` → `{ voiceId }` (self-attested ToS checkbox) | `naive voice clone <file> --name --consent-type --authorized-uses --i-affirm` → voice id                          | Naive records **who consented + the affirmation + authorized uses**                     |
| `voices.pvc.*` (professional clone + `voices.pvc.verification.request`)           | `--consent-type third_party_verified` (consenter gets a verification link; voice stays pending until confirmed)   | Third-party consent is a first-class flow                                               |
| (no per-use restriction — the key can synthesize anything)                        | `authorized_uses` on the voice, **enforced at synthesis** (`use` outside the set is refused)                      | The execution-time permission win                                                       |
| `textToSpeech.convert(voiceId, { text, modelId, outputFormat })` → audio          | `POST /v1/voice/synthesize { voice_id, text, use }` → `{ url, credits, char_count }` / `naive voice say`          | Presigned MP3 URL, valid 24h; `use` must be authorized                                  |
| `textToSpeech.stream(voiceId, { text })` → audio stream                           | `POST /v1/voice/stream`                                                                                           | Streamed synthesis                                                                      |
| `voices.search()` / `voices.getAll()`                                             | `GET /v1/voice/voices` / `naive voice list`                                                                       | Voices available to the caller                                                          |
| `voices.get(voiceId)`                                                             | included in list / `GET /v1/voice/synthesis/:id` for a past synth                                                 | —                                                                                       |
| `voices.delete(voiceId)`                                                          | `naive voice revoke <id> --yes` (human-only, irreversible)                                                        | Erases audio **and** marks the consent record revoked; later synth → `voice_revoked`    |
| `voiceSettings` (stability, similarity, style, speed)                             | (none)                                                                                                            | Not exposed — see [gaps](#what-does-not-map-yet)                                        |
| `modelId` (`eleven_multilingual_v2`, `flash`, `turbo`)                            | (managed)                                                                                                         | Model not selectable today — see [gaps](#what-does-not-map-yet)                         |
| `outputFormat` (`mp3_44100_128`, `pcm_*`, `ulaw_*`)                               | MP3 presigned URL                                                                                                 | Format not selectable — see [gaps](#what-does-not-map-yet)                              |
| Dubbing, Speech-to-Text, Sound Effects, Music, Conversational AI agents           | (none)                                                                                                            | Out of scope — see [gaps](#what-does-not-map-yet)                                       |
| (no talking-video product)                                                        | `naive clone generate` — image + voice + script → lip-synced video                                                | Naive **adds** the digital twin                                                         |
| API key scopes *ElevenLabs and nothing else*                                      | **Account Kit** enables `voice` per user; synthesis metered against the [plan](/docs/getting-started/customer-billing) | Governance on the identity — see [gains](#gain-2-execution-time-governance)             |
| ElevenLabs dashboard history                                                      | `naive.forUser(id).logs.query()` — one per-user timeline                                                          | Voice events beside email, cards, phone — see [gain #3](#gain-3-unified-accountability) |

## Before / after: the core path

The path that matters for almost every voice-backed agent is *clone a consented voice, then
synthesize speech in it*. Here it is on both platforms.

<CodeGroup>
  ```ts ElevenLabs theme={"theme":"css-variables"}
  import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
  import fs from "node:fs";

  // One xi-api-key clones AND synthesizes — no consent record, no per-use limit
  const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

  // Clone: a ToS checkbox is the only "consent"; any code with the key can do this
  const voice = await elevenlabs.voices.ivc.create({
    name: "Founder VO",
    files: [fs.createReadStream("./sample.wav")],
  });

  // Synthesize — nothing enforces what this voice may be used for
  const audio = await elevenlabs.textToSpeech.convert(voice.voiceId, {
    text: "Thanks for booking with us.",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });
  // → the voice is a slice of your ElevenLabs account behind one key. No consent
  //   record, no per-use enforcement, no shared identity with email/cards/phone.
  ```

  ```bash Naive theme={"theme":"css-variables"}
  # Clone is HUMAN-ONLY: establish a signed-in session first (not just an API key)
  naive auth session-login

  # Clone with an explicit consent record + the uses this voice is allowed for
  naive voice clone ./sample.wav \
    --name "Founder VO" \
    --consent-type self \
    --authorized-uses email \
    --i-affirm \
    --wait
  # → returns a voice id; the consent record (who, affirmation, authorized_uses) is stored

  # Synthesize with an agent API key — `use` MUST be within the voice's authorized_uses
  naive voice say --voice <voice-id> --text "Thanks for booking with us." --out hello.mp3
  # → the SAME identity also owns this agent's email inbox, card, phone, and vault.
  ```
</CodeGroup>

The shape is largely the same — *clone, then synthesize* — but the differences are the point of the
migration:

* **Cloning is human-only, not an agent-key action.** ElevenLabs clones with the same key it
  synthesizes with. Naive requires a signed-in human session (`naive auth session-login`) to clone
  or revoke, so a leaked agent key can use voices it already owns but can never mint or destroy one.
* **Every voice carries a consent record.** ElevenLabs' "consent" is a ToS checkbox. Naive stores
  `consent_type`, the affirmation, and — for third parties — a verified consenter, and marks it
  revoked on `revoke`.
* **Uses are enforced at synthesis.** A Naive voice cloned with `--authorized-uses email` will
  refuse a `video` use. On ElevenLabs the key can synthesize anything.
* **The id is your identity, not a separate account.** The same tenant user that owns this voice
  owns the agent's email, cards, phone, and vault.

## Consent + authorized uses: the execution-time gate

This is what "governed identity" means in practice. On Naive, the `use` you pass at synthesis is
checked against the voice's `authorized_uses`, and clone/revoke are gated behind a human session.

<CodeGroup>
  ```ts ElevenLabs (no per-use gate) theme={"theme":"css-variables"}
  // The key can synthesize this voice for ANY purpose — there is nothing to enforce.
  await elevenlabs.textToSpeech.convert(voice.voiceId, { text: "Buy now!", modelId: "eleven_multilingual_v2" });
  await elevenlabs.textToSpeech.convert(voice.voiceId, { text: "Legal disclaimer…" });

  // Deleting a voice uses the same key as everyday synthesis — no separation of duty.
  await elevenlabs.voices.delete(voice.voiceId);
  ```

  ```bash Naive (use is enforced) theme={"theme":"css-variables"}
  # Cloned with `--authorized-uses email` only:
  naive voice say --voice <voice-id> --text "Thanks for booking." --out ok.mp3   # use=email → allowed
  ```

  ```javascript Naive REST (declare the use) theme={"theme":"css-variables"}
  const res = await fetch("https://api.usenaive.ai/v1/voice/synthesize", {
    method: "POST",
    headers: { Authorization: "Bearer nv_sk_your_key", "Content-Type": "application/json" },
    body: JSON.stringify({ voice_id: "voice-uuid", text: "Thanks for booking.", use: "email" }),
  });
  const { url, credits, char_count } = await res.json();
  // A `use` outside the voice's authorized_uses is refused; a revoked voice returns `voice_revoked`.
  ```
</CodeGroup>

* **`authorized_uses` is enforced server-side.** Clone once with the uses a voice is allowed for
  (`email`, `video`, …); synthesis outside that set is rejected — you don't police it in app code.
* **Revocation is irreversible and enforced.** `naive voice revoke` erases the voice and its audio
  and marks consent revoked; every later synthesis returns `voice_revoked`.
* **Clone/revoke need a human.** They record a legal consent affirmation, so they require a signed-in
  session — the agent key alone cannot perform them.

## Minimal viable migration

The smallest swap that keeps a working voice-backed agent alive is *clone a consented voice → say it*.

<Steps>
  <Step title="Install the CLI / set your key">
    ```bash theme={"theme":"css-variables"}
    npm install -g @usenaive-sdk/cli   # or use the REST API directly
    ```

    Set `NAIVE_API_KEY` (a server-side `nv_sk_` key from the
    [dashboard](https://dashboard.usenaive.ai)) for the agent (synthesis) surface. You can drop
    `ELEVENLABS_API_KEY` for this path.
  </Step>

  <Step title="Establish a human session for cloning">
    Cloning and revoking record a consent affirmation, so they are human-only. Run
    `naive auth session-login` once (see
    [Authentication](/docs/getting-started/authentication#human-session-for-consent-gated-actions)). This
    is a deliberate change from ElevenLabs, where the same key clones and synthesizes.
  </Step>

  <Step title="Swap the clone call">
    Replace `voices.ivc.create({ name, files })` with `naive voice clone <path> --name <name>     --consent-type self --authorized-uses <uses> --i-affirm`. Keep the returned voice id in place of
    `voice.voiceId`. For a third party, use `--consent-type third_party_verified` and pass
    `--consenter-name` / `--consenter-email` (they receive a verification link).
  </Step>

  <Step title="Swap synthesis">
    Map `textToSpeech.convert(voiceId, { text })` → `naive voice say --voice <id> --text "…"` (CLI)
    or `POST /v1/voice/synthesize { voice_id, text, use }` (REST). Always pass a `use` that is within
    the voice's `authorized_uses`. Read the presigned `url` (valid 24h) instead of the raw audio
    bytes ElevenLabs streams back.
  </Step>

  <Step title="Ship it">
    At this point you are off ElevenLabs for the core clone → synthesize path. Everything below is
    upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. On ElevenLabs, the `xi-api-key` scopes **voices in one
ElevenLabs account and nothing else**. On Naive, the unit of isolation is a **tenant user**, and the
voice is one of many primitives that identity owns.

<CodeGroup>
  ```ts ElevenLabs (voices only) theme={"theme":"css-variables"}
  // One xi-api-key scopes ElevenLabs — and only ElevenLabs — for every customer.
  // The card, the inbox, the phone number, and the KYC for this customer's agent
  // live in entirely separate systems with their own keys and dashboards.
  const voice = await elevenlabs.voices.ivc.create({ name: `${customer.id}-vo`, files: [/*…*/] });
  await elevenlabs.textToSpeech.convert(voice.voiceId, { text: "…" });
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // One tenant user per customer isolates *every* primitive.
  const acme = await naive.users.create({ external_id: customer.id, email: customer.email });
  const client = naive.forUser(acme.id);

  // The SAME client owns this customer's email inbox, card, phone, and vault —
  // and its Account Kit is what enables `voice` at all. Tear the customer down
  // from one place and the voice, card, inbox, and number all go with it.
  await client.email.createInbox({ local_part: "agent" });
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With ElevenLabs, an agent's voices are a slice of one account, and per-customer separation is a
  naming convention you maintain yourself. With Naive, `naive.forUser(acme.id)` is a single handle to
  the identity whose Account Kit governs **voice *and* email *and* cards *and* phone *and* vault**.
* The digital-twin video an agent generates auto-ingests into that identity's
  [Media Manager](/docs/getting-started/media) — the same place its other assets live — not a separate
  vendor's file store.

### Gain #2 — execution-time governance

* Whether an agent may use `voice` at all is **policy on the identity** — toggled per user in the
  [Account Kit](/docs/getting-started/account-kits) — and synthesis is
  [metered](/docs/getting-started/customer-billing) against the tenant's plan quota. This is on top of the
  per-voice `authorized_uses` gate that ElevenLabs has no equivalent for.

```ts theme={"theme":"css-variables"}
// A tier that grants voice, gated + metered on the identity — no card for this tier.
const creator = await naive.accountKits.create({
  name: "Creator",
  primitives_config: {
    voice: { enabled: true },
    cards: { enabled: false },
  },
});
await naive.accountKits.assignUser(creator.id, acme.id);

// The plan carries the per-primitive quota that meters usage at execution time.
await naive.plans.upsert({
  key: "creator",
  name: "Creator",
  accountKitId: creator.id,
  period: "month",
  quotas: { voice: 500 },
});
await naive.forUser(acme.id).billing.setSubscription({ planKey: "creator" });
```

* The agent's synthesis code path stays the same for every tier. What changes at execution time:
  * **Disabled primitive → the call is refused.** If the Account Kit doesn't grant `voice`, synthesis
    never runs.
  * **Use outside `authorized_uses` → refused.** A voice cloned for `email` can't be used for
    `video`, regardless of tier.
  * **Quota exceeded → capped.** Once usage crosses the plan's `voice` quota for the period, further
    synthesis is rejected — no surprise bill from a runaway agent.
  * **Clone/revoke need a human session.** A leaked agent key can synthesize with owned voices but
    can never mint or destroy one.

### Gain #3 — unified accountability

* Every clone, synthesis, and revoke for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their email, card, phone, and vault events, not
  in a separate vendor dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "which voice did this agent synthesize, for what use, and who consented?" — one timeline
```

* That is the question that is hard to answer when voices live in ElevenLabs, cards live in Stripe,
  the phone number lives in a carrier console, and email lives somewhere else. Under Naive it is a
  single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (clone a consented voice →
synthesize speech, list, revoke) maps cleanly, and Naive **adds** the consent record, the
`authorized_uses` gate, and the digital-twin talking video. But ElevenLabs is a broad audio
platform, and the following capabilities have **no direct equivalent** on Naive's `voice` primitive
today. Check this list against your app before you commit.

| ElevenLabs feature                                                   | Status on Naive         | Workaround                                                              |
| -------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| **`voiceSettings`** (stability, similarity boost, style, speed)      | Not exposed             | Naive uses managed defaults; not tunable per call today                 |
| **`modelId` selection** (`eleven_multilingual_v2`, `flash`, `turbo`) | Managed                 | Model is chosen for you; not selectable                                 |
| **`outputFormat`** (`pcm_*`, `ulaw_*`, `opus`, sample rates)         | MP3 presigned URL (24h) | Transcode the returned MP3 if you need another format                   |
| **Character-level timestamps** (`convertWithTimestamps`)             | Not provided            | Synthesize per segment if you need alignment                            |
| **Speech-to-Text** (Scribe)                                          | Not provided            | Use a separate STT provider                                             |
| **Dubbing** (video/audio translation)                                | Not provided            | No equivalent today                                                     |
| **Sound Effects / Music generation**                                 | Not provided            | Use ElevenLabs or another provider for these                            |
| **Conversational AI / Agents platform** (WebSocket voice agents)     | Not provided            | Pair Naive `voice` synthesis with your own agent loop                   |
| **Voice design / text-to-voice / remix / shared Voice Library**      | Not provided            | Clone from an audio sample you're authorized to use                     |
| **Pronunciation dictionaries, request stitching**                    | Not provided            | Not available today                                                     |
| **Raw `voice_id` from ElevenLabs' library**                          | Naive voice id only     | Voices are cloned into your identity, not referenced from a shared pool |

<Warning>
  Naive's `voice` primitive is a **curated, consent-governed clone + synthesis surface** (clone with a
  consent record, synthesize within `authorized_uses`, list, revoke) plus a **digital-twin talking
  video** — not the full ElevenLabs audio platform. If your agent depends on **model / voice-settings /
  output-format selection**, **timestamps**, **Speech-to-Text**, **Dubbing**, **Sound Effects /
  Music**, or the **Conversational AI agents** product, those are the gaps most likely to need
  ElevenLabs (or another provider) alongside Naive. The core clone → synthesize path maps directly —
  and the flip side is the gain: the voice, its consent record, its per-use enforcement, and its
  billing are governed by the *same* identity and Account Kit as the rest of the agent, with a unified
  audit trail — not a slice of a standalone account behind an all-or-nothing key.
</Warning>

## Where to go next

* [`voice` primitive](/docs/getting-started/voice) — clone (human-only), synthesize, list, revoke, consent model, digital-twin video
* [Authentication](/docs/getting-started/authentication#human-session-for-consent-gated-actions) — the human session that clone/revoke require
* [Media Manager](/docs/getting-started/media) — where generated talking-twin videos are auto-ingested
* [Customer billing](/docs/getting-started/customer-billing) — the plan + quota that meters synthesis at execution time
* [Account Kits](/docs/getting-started/account-kits) — the policy model that enables/disables `voice` per user
* [Tenant users](/docs/getting-started/users) — the identity that owns the voice, email, cards, phone, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — governed voice primitive lifecycle
