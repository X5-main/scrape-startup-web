> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Replicate to Naive

> Move the AI media your agent generates — text-to-image and text-to-video — off a standalone Replicate account and onto Naive's images and video primitives, where generation is one governed capability on the same account (and Account Kit) that owns the agent's cards, email, phone, and vault. FLUX schnell runs on both, so the same prompt gives comparable output.

<Frame caption="Replicate's predictions API (run any model) → the Naive images + video primitives">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/USl2A0cDTF_sFbQX/migration-guides/logos/replicate-light.svg?fit=max&auto=format&n=USl2A0cDTF_sFbQX&q=85&s=c1170aa477d220932f2a3f3b36997449" alt="Replicate" height="26" data-path="migration-guides/logos/replicate-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/USl2A0cDTF_sFbQX/migration-guides/logos/replicate-dark.svg?fit=max&auto=format&n=USl2A0cDTF_sFbQX&q=85&s=b2b4c288211d8009b97a80bc4e61127e" alt="Replicate" height="26" data-path="migration-guides/logos/replicate-dark.svg" />
</Frame>

<Note>
  Replicate is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Replicate](https://replicate.com/docs) runs machine-learning models behind one HTTP API: `predictions.create`
submits a job, `predictions.get` polls it, and a webhook fires on completion. It does this exceptionally
well across **thousands** of community and official models — FLUX for images, Kling/Minimax for video,
plus LLMs, upscalers, and your own fine-tunes. But when the thing generating the media is an
**agent that also holds cards, an inbox, a phone number, and a KYC'd identity**, a Replicate account is
a *disconnected vendor account*:

* Generation lives behind a **Replicate API token** (`r8_...`) — a credential that exists *only inside
  Replicate*, unrelated to where the same agent's cards, email, and KYC live.
* Whether the agent *may* generate media, and how much it may spend doing so, is **not** something
  Replicate governs at execution time — it is a token you hold. There is no "may this agent render
  right now?" check tied to the agent's broader permission set.
* *"Which agent generated this asset, for which end-user, and who let it?"* is answered in Replicate's
  dashboard for renders, and in unrelated systems for the agent's spend, comms, and identity.

Naive's [`images`](/docs/getting-started/images) and [`video`](/docs/getting-started/video) primitives give the
agent the **same** capability — submit a generation job, poll it, get a file URL — but it is **one set
of primitives on one governed account**. And it is honest to say the *output* is comparable: Naive is
**fal.ai-backed** and exposes the same **FLUX schnell / dev / pro** family for images and **Kling /
Minimax / Wan** for video, so `black-forest-labs/flux-schnell` on Replicate maps to `fal-ai/flux/schnell`
on Naive. You keep frontier-model generation and gain:

* The [Account Kit](/docs/getting-started/account-kits) that decides whether the agent may
  [issue a card](/docs/getting-started/cards) or [send email](/docs/getting-started/email) also decides whether
  it may use `images`/`video` at all — checked **at execution time**, not in a separate dashboard.
* Generation spend is metered in the **same credit balance and budget ceiling** as every other
  primitive, so a runaway agent hits one cap, not a separate Replicate bill.
* Every render records the **acting agent**, lands in the same [activity log](/docs/getting-started/logs) as
  its card spend and email sends, and (for video) auto-ingests into the
  [Media Asset Manager](/docs/getting-started/media) alongside the rest of the agent's assets.

This guide maps Replicate's predictions API to Naive's jobs system, shows the smallest working swap, and
is explicit about what does **not** map yet — most importantly, that Naive exposes a **curated fal.ai
model catalog**, not Replicate's open registry, and has **no training / fine-tuning** or custom-model
hosting.

<Info>
  **Tested against:** the Replicate JavaScript client
  [`replicate`](https://www.npmjs.com/package/replicate) **v1.4.0** (against the Replicate REST API, base
  `https://api.replicate.com/v1`, `POST /v1/predictions` + `GET /v1/predictions/{id}`, docs snapshot
  July 2026), and the Naive [`images`](/docs/getting-started/images) / [`video`](/docs/getting-started/video)
  primitives over the Naive REST API (base `https://api.usenaive.ai/v1`, `/images/generate`,
  `/video/generate`, and the unified `/jobs/:id` poller, docs snapshot July 2026). The Naive
  [`@usenaive-sdk/server`](/docs/sdk/overview) SDK ships dedicated `images` and `video` sub-clients —
  `naive.images.generate()` / `naive.video.generate()` submit the job (shown below); you can also use the
  [`naive images`](/docs/cli/images) / [`naive video`](/docs/cli/video) CLI or raw REST. Poll with
  `naive.images.status(id)` / `naive.video.status(id)` or the unified [`naive.jobs`](/docs/sdk/sub-clients/jobs) sub-client.

  Version notes:

  * **Auth model differs.** Replicate authenticates with an account-wide token (`r8_...`, or a default
    `new Replicate()` reading `REPLICATE_API_TOKEN`). Naive authenticates per workspace with
    `NAIVE_API_KEY`, and you scope an end-user with `naive.forUser(id)` / `POST /v1/users/:id/images/generate`
    — the same handle that reaches every other primitive.
  * **Different provider under the hood.** Replicate runs models on its own registry/hardware; Naive runs
    the fal.ai catalog. FLUX schnell/dev/pro and Kling/Minimax exist on both, so equivalent prompts give
    comparable output — but there is **no** arbitrary-model or `owner/model:version` pass-through, and no
    BYO Replicate account. See [what doesn't map yet](#what-does-not-map-yet).
  * **Naive is always async.** Replicate lets you block on a result with `replicate.run(...)` or the
    `Prefer: wait` header (up to \~60s). Naive returns a `202 { job_id }` you poll on the unified
    [jobs](/docs/getting-started/jobs) system — no single blocking call.
  * **Completion is polled, not (yet) webhooked per job.** Replicate posts a webhook on
    `start`/`output`/`logs`/`completed`. Naive's generation jobs are polled via `GET /v1/jobs/:id`; confirm
    available inbound events with `GET /v1/webhooks/event-types` before depending on push.
</Info>

## Concept map

| Replicate                                                                                | Naive                                                                                              | Notes                                                                                                |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `new Replicate()` (`REPLICATE_API_TOKEN`)                                                | `new Naive({ apiKey })` then `naive.forUser(id)`                                                   | Server-side credential in both cases                                                                 |
| Account-wide `r8_...` token                                                              | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive         | One identity for generation *and* cards, email, phone, KYC                                           |
| `replicate.run("black-forest-labs/flux-schnell", { input })` (blocks up to \~60s)        | `POST /v1/images/generate` `{ model: "fal-ai/flux/schnell", input }` → `202 { job_id }`, then poll | Same FLUX schnell model; Naive is async-only                                                         |
| `replicate.predictions.create({ model, input, webhook })` → `{ id, status: "starting" }` | `POST /v1/images/generate` (or `/video/generate`) → `202 { job_id, status: "queued" }`             | Submit an async job                                                                                  |
| `replicate.predictions.get(id)` → `{ status, output }`                                   | `naive.jobs.get(id)` / `GET /v1/jobs/:id` → `{ status, result }`                                   | Unified poller for image *and* video jobs                                                            |
| `prediction.status`: `starting` / `processing` / `succeeded` / `failed` / `canceled`     | `job.status`: `queued` / `processing` / `completed` / `failed` / `cancelled`                       | Direct 1:1 mapping                                                                                   |
| `prediction.output` (FileOutput / HTTPS URL, **removed after 1h**)                       | `result.images[].url` / `result.video.url` (fal.media)                                             | Video also auto-lands in the [Media library](/docs/getting-started/media)                                 |
| `replicate.predictions.cancel(id)`                                                       | `naive.jobs.cancel(id)` / `DELETE /v1/jobs/:id`                                                    | Only while `queued`/`processing`                                                                     |
| Video via same `run`/`predictions` (e.g. `minimax/video-01`)                             | `POST /v1/video/generate` `{ model, input: { prompt, duration, aspect_ratio } }`                   | Kling/Minimax/Wan catalog                                                                            |
| Model registry: thousands of community + official models, `owner/model:version` pinning  | Curated catalog via `GET /v1/images/models` & `GET /v1/video/models`                               | **No arbitrary model** — see [gaps](#what-does-not-map-yet)                                          |
| Trainings / fine-tuning API (LoRAs, custom weights), Cog deploys, deployments            | —                                                                                                  | **Not available** on Naive                                                                           |
| Webhook completion (`start`/`output`/`logs`/`completed`)                                 | Poll `GET /v1/jobs/:id`; check `GET /v1/webhooks/event-types` for push                             | Different completion model                                                                           |
| Whether an agent may generate = a token you hold                                         | **Account Kit** `images` / `video` primitive `enabled: true/false`                                 | Execution-time policy on the identity — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| Replicate per-second GPU billing / hardware select                                       | Same [credit balance + budget ceiling](/docs/getting-started/billing) as every primitive                | Dynamic per-model cost at \$0.05/credit; preview with `/v1/images/pricing`                           |
| Replicate dashboard (per token)                                                          | Same per-user [activity log](/docs/getting-started/logs) as cards, email, KYC                           | Every render records the acting agent                                                                |

## Before / after: the core path

The path that matters for almost every agent is *submit a prompt, wait, get an image URL*. Here it is on
both platforms — same FLUX schnell model on each.

<CodeGroup>
  ```ts Replicate theme={"theme":"css-variables"}
  import Replicate from "replicate";

  // One account-wide token. It is unrelated to where this agent's card, inbox,
  // phone, and KYC live — and whether the agent "may render" is a token you hold,
  // not a governed, execution-time decision.
  const replicate = new Replicate(); // reads REPLICATE_API_TOKEN

  // `run` blocks until the prediction finishes, then returns the output file(s).
  const [image] = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: "A minimalist logo for a tech startup, flat design, indigo",
    },
  });

  // `image` is a FileOutput → an HTTPS URL (removed from Replicate after ~1h).
  const url = image.url();
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // The same NAIVE_API_KEY reaches cards, email, phone, vault, and KYC.
  import { Naive } from "@usenaive-sdk/server";
  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // 1. Submit via the images sub-client — same FLUX schnell model
  const { job_id } = await naive.images.generate({
    model: "fal-ai/flux/schnell",
    input: { prompt: "A minimalist logo for a tech startup, flat design, indigo" },
  }); // 202 { job_id, status: "queued", estimated_credits }

  // 2. Poll the unified jobs system (covers image AND video jobs; or images.status(job_id))
  let job = await naive.jobs.get(job_id);
  while (job.status === "queued" || job.status === "processing") {
    await new Promise((r) => setTimeout(r, 2000));
    job = await naive.jobs.get(job_id);
  }
  const url = job.result.images[0].url; // fal.media URL

  // Whether this agent may generate at all is its Account Kit's `images` primitive,
  // checked at execution time; the render spends credits against the SAME budget
  // ceiling as its cards, email, and phone — and it is logged against the acting agent.
  ```
</CodeGroup>

The submit → poll → file-URL shape lines up closely. The real differences to plan for:

* **Blocking vs. async.** Replicate's `run` (and `Prefer: wait`) can return the finished output inline.
  Naive always returns a `202 { job_id }`; poll `GET /v1/jobs/:id` (or `naive.jobs.get(id)`) until
  `status === "completed"`. Credits are charged **on completion only**.
* **Status vocabulary.** `starting/processing/succeeded/failed/canceled` →
  `queued/processing/completed/failed/cancelled`.
* **Output shape.** Replicate returns a `FileOutput` (or array); Naive returns
  `result.images[]` (`{ url, width, height, content_type }`) with the `seed` and `prompt` echoed back.
* **File lifetime.** Replicate removes prediction files after \~1 hour — you re-host them. Naive returns a
  fal.media URL, and **video** generations auto-ingest into the [Media library](/docs/getting-started/media).

### The async / video path

If you were using `predictions.create` with a webhook (rather than blocking on `run`), the shape maps
directly to submit-then-poll — shown here for **text-to-video**:

<CodeGroup>
  ```ts Replicate (predictions + webhook) theme={"theme":"css-variables"}
  const replicate = new Replicate();

  // Submit an async prediction; Replicate will POST your webhook on completion.
  const prediction = await replicate.predictions.create({
    model: "minimax/video-01",
    input: { prompt: "A golden retriever running on a beach at sunset, cinematic" },
    webhook: "https://example.com/replicate-webhook",
    webhook_events_filter: ["completed"],
  });

  // ...or poll it yourself.
  let p = await replicate.predictions.get(prediction.id);
  while (p.status === "starting" || p.status === "processing") {
    await new Promise((r) => setTimeout(r, 3000));
    p = await replicate.predictions.get(prediction.id);
  }
  const videoUrl = p.output; // HTTPS URL
  ```

  ```ts Naive (video job + unified poller) theme={"theme":"css-variables"}
  // Submit via the video sub-client — Kling text-to-video
  const { job_id } = await naive.video.generate({
    model: "fal-ai/kling-video/v3/pro/text-to-video",
    input: {
      prompt: "A golden retriever running on a beach at sunset, cinematic",
      duration: "5",
      aspect_ratio: "16:9",
    },
  }); // 202 { job_id, estimated_credits }

  // Same jobs poller as images (or naive.video.status(job_id))
  let job = await naive.jobs.get(job_id);
  while (job.status === "queued" || job.status === "processing") {
    await new Promise((r) => setTimeout(r, 15000)); // video takes 30–120s
    job = await naive.jobs.get(job_id);
  }
  const videoUrl = job.result.video.url; // also auto-added to the Media library
  ```
</CodeGroup>

## Minimal viable migration

The smallest swap that keeps a working agent running is *submit* + *poll* (images first, video the same
way).

<Steps>
  <Step title="Set your key">
    Use your existing `NAIVE_API_KEY` (a server-side key from the
    [dashboard](https://dashboard.usenaive.ai)). No separate generation vendor account or `r8_...` token
    to provision.
  </Step>

  <Step title="Pick a mapped model">
    Swap the Replicate slug for its Naive catalog equivalent: `black-forest-labs/flux-schnell` →
    `fal-ai/flux/schnell`, FLUX dev/pro likewise, and video → `fal-ai/kling-video/...`. List what's
    available with `GET /v1/images/models` and `GET /v1/video/models` (or `naive images models`).
  </Step>

  <Step title="Swap the submit call">
    Map `replicate.run(model, { input })` / `predictions.create` → `POST /v1/images/generate`
    `{ model, input: { prompt, ... } }`. You get a `202 { job_id }` instead of an inline result.
  </Step>

  <Step title="Swap polling for the jobs system">
    Replace `replicate.predictions.get(id)` with `naive.jobs.get(job_id)` (or `GET /v1/jobs/:id`). Loop
    while `status` is `queued`/`processing`; read `result.images[].url` (or `result.video.url`) on
    `completed`. `naive.jobs.cancel(id)` replaces `predictions.cancel`.
  </Step>

  <Step title="Reach for the CLI where handy">
    The same primitives are on the CLI: `naive images generate --model fal-ai/flux/schnell "..." --wait`,
    `naive video generate --model fal-ai/kling-video/v3/pro/text-to-video "..." --duration 5 --wait`, and
    `naive jobs get <id>`.
  </Step>

  <Step title="Ship it">
    At this point the agent's generation path is off Replicate's direct API and onto Naive — comparable
    FLUX/Kling output, one key. Everything below is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. On Replicate, generation is a self-contained account: a
token, its own GPU bill, and its own dashboard — disconnected from the agent's money, comms, and
identity. On Naive, `images`/`video` are **primitives on the same account and Account Kit** that governs
the agent's cards, email, phone, and vault.

<CodeGroup>
  ```ts Replicate (standalone account — generation only) theme={"theme":"css-variables"}
  // The r8_ token renders; it knows nothing about this agent's money or identity.
  const replicate = new Replicate();
  await replicate.run("black-forest-labs/flux-schnell", {
    input: { prompt: "launch banner for Acme" },
  });

  // The card, inbox, phone, and KYC for this customer's agent live elsewhere —
  // separate accounts, separate billing, separate audit — and "may this agent
  // render?" is a token you hold, not a governed decision.
  ```

  ```ts Naive (one governed account — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; the same handle reaches every primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });
  const client = naive.forUser(acme.id);

  // Generate over the per-user scope — gated + metered like the rest.
  await client.images.generate({
    model: "fal-ai/flux/schnell",
    input: { prompt: "launch banner for Acme" },
  });

  // The SAME identity owns this customer's card, inbox, phone, and KYC — one
  // account, one budget, one audit trail, every capability governed by its
  // Account Kit.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "ops" });
  ```
</CodeGroup>

### Gain #1 — one account across primitives

* With Replicate, generation is an island behind its own token and GPU bill. With Naive,
  `naive.forUser(acme.id)` is a single handle to **images *and* video *and* cards *and* email *and*
  phone *and* KYC** — no second vendor account, no `r8_...` token to provision and rotate, no separate
  invoice.
* A content agent's whole loop lives under **one identity**: generate a video (`video`), find it in the
  [Media library](/docs/getting-started/media), then [post it to social](/docs/getting-started/social) — the same
  governed user across every step, not three disconnected vendor accounts stitched by hand.

### Gain #2 — execution-time permission enforcement

* Whether an agent may generate at all is the `images` / `video` primitive on the user's **Account Kit**,
  decided **at execution time** — not a token you gate separately from everything else the agent can do.

```ts theme={"theme":"css-variables"}
// This tier's agents get images, but cannot generate video (the pricier primitive).
const kit = await naive.accountKits.create({
  name: "Images-only tier",
  primitives_config: {
    images: { enabled: true },
    video: { enabled: false }, // video calls are refused with `forbidden`
    email: { enabled: true },
    cards: { enabled: true },
  },
});
await naive.accountKits.assignUser(kit.id, acme.id);
```

* The agent's code path stays the same for every tier — the same `POST /v1/video/generate`. Whether it
  runs is decided by policy: a user whose Account Kit does not enable `video` is refused with `forbidden`,
  with **no code change** on your side.
* Each render spends **credits** (dynamic, model-dependent, at \$0.05/credit — preview with
  `GET /v1/images/pricing`) against the same [budget ceiling](/docs/getting-started/billing) as the agent's
  cards, phone, and LLM calls — so a misbehaving agent trips one combined cap, not a separate Replicate
  GPU bill you monitor on its own.

<Note>
  `images`/`video` are metered and Account-Kit-gated, but — like [`search`](/docs/migration-guides/tavily) and
  unlike money-moving primitives (cards, trading, domains) — they are **not** frozen for human approval by
  default. Media generation is company-scoped: the kit gates whether a user's agent may render.
</Note>

### Gain #3 — unified accountability

* Every render records the **acting agent** and lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside that customer's card spend, email sends, and KYC
  events, not in a separate Replicate dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — renders, card spend, email sends, one timeline
```

* Generated **video** (and clips) also auto-ingest into the [Media Asset Manager](/docs/getting-started/media)
  with `source_type: "video_generation"`, so the asset library is part of the same governed account —
  not a pile of expiring Replicate URLs you re-host yourself.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (submit → poll → file URL) maps
cleanly for the FLUX/Kling family, but the following Replicate capabilities have **no direct equivalent**
on Naive today. Check this list against your app before you commit.

| Replicate feature                                                                                                        | Status on Naive                                                                                             | Workaround                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open model registry** — run *any* of thousands of community/official models, or pin `owner/model:version`              | Not supported — Naive exposes a **curated fal.ai catalog** via `GET /v1/images/models` & `/v1/video/models` | Use a mapped catalog model (FLUX, Kling, SD, Recraft, Minimax, Wan); keep Replicate for models outside the catalog                                                                 |
| **Training / fine-tuning** (trainings API, LoRAs, custom weights)                                                        | Not available                                                                                               | Keep Replicate (or fal) for training; Naive runs inference on catalog models only                                                                                                  |
| **Custom model hosting** (Cog, private models, deployments, hardware selection)                                          | Not available                                                                                               | Keep Replicate for pushed/custom models and dedicated deployments                                                                                                                  |
| **Non-media modalities** — LLMs, embeddings, speech-to-text, upscalers, background removal, etc. run as Replicate models | Out of scope for `images`/`video`                                                                           | Use Naive's [`llm`](/docs/migration-guides/portkey), [`voice`](/docs/migration-guides/elevenlabs), or [`search`](/docs/migration-guides/tavily) primitives; other model types have no direct home |
| **Blocking / sync run** (`replicate.run`, `Prefer: wait`)                                                                | Naive is async-only — `202 { job_id }` you poll                                                             | Poll `GET /v1/jobs/:id`, or `naive images generate ... --wait` in the CLI to block for you                                                                                         |
| **Per-prediction webhooks** (`start`/`output`/`logs`/`completed`)                                                        | Generation jobs are polled; confirm push support via `GET /v1/webhooks/event-types`                         | Poll the jobs system; wire your own notify step on `completed`                                                                                                                     |
| **Streaming output** (SSE) for iterative/LLM models                                                                      | Not applicable to image/video jobs                                                                          | Poll for the finished result                                                                                                                                                       |
| **BYO Replicate account / plan & provider choice**                                                                       | Naive runs fal.ai; you don't pick the provider or supply an `r8_...` token                                  | None — by design; keep a direct Replicate account if you need provider/plan control                                                                                                |
| **Exact version reproducibility** (64-char version hash pinning)                                                         | Naive pins to fal model IDs, not arbitrary version hashes                                                   | Use `seed` for reproducibility within a catalog model                                                                                                                              |

<Warning>
  The biggest thing to weigh is **model coverage**, not the core loop. Replicate's whole value is an
  *open registry* — any community model, your own fine-tunes, custom Cog deploys, and non-media modalities.
  Naive deliberately runs a **curated fal.ai catalog** for image and video generation only, with no
  training and no custom-model hosting. If your agent depends on a specific community/custom model, a LoRA
  you trained, or a modality outside image/video, those are the gaps most likely to matter — keep Replicate
  for that surface. If you just need frontier image/video generation — FLUX, Kling, SD — the swap is clean,
  and the output is comparable either way.
</Warning>

## Where to go next

* [`images` primitive](/docs/getting-started/images) — full `generate` reference, models, sizes, pricing, and stock search
* [`video` primitive](/docs/getting-started/video) — text-to-video / image-to-video, models, durations
* [Jobs](/docs/getting-started/jobs) — the unified poller (`naive.jobs.get`/`cancel`) for image and video generation
* [Media Asset Manager](/docs/getting-started/media) — where generated video auto-lands, tagged and searchable
* [Account Kits](/docs/getting-started/account-kits) — enabling/disabling `images`/`video` per user at execution time
* [Billing](/docs/getting-started/billing) — the shared credit balance and budget ceiling generation spends against
* [Logs](/docs/getting-started/logs) — the unified per-user activity trail every render lands in
