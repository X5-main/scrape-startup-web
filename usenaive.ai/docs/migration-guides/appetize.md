> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Appetize.io to Naive

> Move an agent's cloud mobile device — upload an app, stream it, drive it — from a standalone Appetize.io account (one org API token, per-action scripting, no shared identity) to Naive's mobile primitive: the same hosted Android/iOS device, but every provision, task, and upload is approval-gated, scoped to one governed identity, and driven by a natural-language agent — on the same identity that owns the agent's cards, email, and phone.

<Frame caption="Appetize.io → the Naive mobile primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/appetize-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=67b2697cb9f670cc454534dbe77354dc" alt="Appetize.io" height="28" data-path="migration-guides/logos/appetize-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/appetize-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=5b4e4805c8fcee1b71eaa871f57d589c" alt="Appetize.io" height="28" data-path="migration-guides/logos/appetize-dark.svg" />
</Frame>

<Note>
  Appetize.io is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Appetize.io](https://docs.appetize.io) runs real mobile apps in the cloud: upload an APK/IPA
(`POST /v1/apps`), then embed and drive the device in the browser with the JavaScript SDK
(`client.startSession()`, `session.tap`, `session.type`, `session.screenshot`). It's a great way to
demo, test, and automate a mobile build. But an Appetize account is also a *standalone device
vendor* that sits apart from everything else your agent touches:

* Every device lives behind a single org **`X-API-KEY`**, disconnected from wherever the agent's
  cards, email, phone number, and KYC live.
* The token is **coarse and ungoverned**: any code holding it can upload a build, spin up a device,
  and drive it — there is **no approval step** between "the agent has the key" and "the agent is
  tapping around a live device," and **nothing scopes** one tenant's devices away from another
  beyond conventions you maintain yourself.
* "Which agent spun up that device, who approved it, and what *else* can this agent do?" is answered
  in the Appetize dashboard for sessions, and in unrelated systems for everything else. The device
  has no shared accountability with the rest of the agent's footprint.

Naive's [`mobile`](/docs/getting-started/mobile) primitive gives the agent the **same** capability — a
hosted cloud Android/iOS device you can put an app on, stream, and control — but the device is
**rooted in one governed identity** with permissions enforced at execution time:

* Naive owns the upstream [Mobilerun](https://docs.mobilerun.ai) operator key and scopes every
  device to your tenant — **the agent never holds a device-cloud key** (the same operator model as
  [Compute](/docs/getting-started/compute) with AWS).
* Provisioning a device, its lifecycle (reboot/reset/terminate), proxy changes, running/stopping
  tasks, uploading apps, and mutating wildcard calls are **approval-gated** — an agent call may
  return `{ status: "pending_approval" }` until a human approves it, so a leaked agent key can't
  silently spin up or drive a device.
* Naive **adds** a natural-language agent driver: `naive.mobile.run({ task, deviceId })` executes
  *"Open Settings and enable dark mode"* on-device — where Appetize gives you a raw device plus
  per-action control that you script yourself.
* The [tenant user](/docs/getting-started/users) whose Account Kit enables `mobile` is the same user that
  owns the agent's [cards](/docs/getting-started/cards), its [email inboxes](/docs/getting-started/email), its
  [phone number](/docs/getting-started/phone), and its [vault](/docs/getting-started/vault) — one identity, one
  audit trail, revocable in one place.

This guide maps Appetize's device model to Naive's `mobile` primitive, shows the smallest working
swap, and is explicit about the Appetize features that **don't** map yet.

<Info>
  **Tested against:** the Appetize **REST API v1** (base `https://api.appetize.io/v1`, `X-API-KEY`
  header — `POST /v1/apps`, `GET /v1/apps`, `GET /v1/usageSummary`), the Appetize **JavaScript SDK**
  (`js.appetize.io/embed.js` → `window.appetize.getClient(selector, config)`, `client.startSession`,
  `session.tap` / `session.type` / `session.screenshot` / `session.playAction`), and the automation
  package [`@appetize/playwright`](https://www.npmjs.com/package/@appetize/playwright) **v1.6.0** — and
  the Naive `mobile` primitive over the Naive API (base `https://api.usenaive.ai/v1`), the
  [`naive.mobile.*`](/docs/sdk/sub-clients/mobile) SDK sub-client (`@usenaive-sdk/server`), and the
  [Naive CLI](/docs/cli/overview). Docs snapshot July 2026.

  Version notes:

  * Appetize v1 identifies a build by its **`publicKey`**; the v2 API renames it **`buildId`** (the
    two are interchangeable in v1). Naive addresses a **device** by its Mobilerun `device_id` and an
    **app** by its library entry — see the [concept map](#concept-map).
  * Appetize control is **client-side, per-action**: you load `embed.js`, get a `client`, start a
    `session`, and script each `tap` / `type` / `screenshot`. Naive's core driver is a **server-side
    natural-language agent task** (`naive.mobile.run`) plus raw device tools reached through the
    wildcard [`search`/`call`](/docs/getting-started/mobile#wildcard-search-call-any-mobilerun-api) pair.
  * On Naive, **provision, device lifecycle, `run`, `stop`, `uploadApp`, and mutating `call`s are
    approval-gated by default** — Appetize has no equivalent gate; the org token does everything.
  * Naive phones are **billed per minute from your credits** and there is **no upstream auto-stop** —
    always `terminate` a device you're done with (credit exhaustion and a max-runtime failsafe
    auto-terminate as a backstop).
</Info>

## Concept map

| Appetize.io                                                                                 | Naive                                                                                                      | Notes                                                                                              |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `X-API-KEY` — one org token uploads, runs **and** controls                                  | `nv_sk_` agent key; Naive holds the Mobilerun operator key — the agent never holds a device-cloud key      | Same operator model, but per-tenant scoped **and** approval-gated                                  |
| `POST /v1/apps` (multipart `file`/`url`, `platform`) → `{ publicKey }`                      | `naive.mobile.uploadApp({ name, fileName })` → signed upload URL                                           | Upload an app (APK/IPA) into the library — **approval-gated**                                      |
| `GET /v1/apps` (list your apps)                                                             | `naive.mobile.apps()`                                                                                      | The app library                                                                                    |
| `getClient(sel, { buildId, device, osVersion })` + iframe `appetize.io/embed/{publicKey}`   | `naive.mobile.provision({ country })` → `{ phone, credits_per_minute }` + `naive.mobile.waitReady(id)`     | Naive provisions a real cloud device — **approval-gated**; you don't embed by build                |
| `client.startSession()` → `session` (device tied to a build)                                | `naive.mobile.provision(...)` then `naive.mobile.stream(id)` → `{ stream_url, stream_token, console_url }` | A device you can display live                                                                      |
| `session.tap` / `type` / `swipe` / `playAction` / `waitForElement` (you script each action) | `naive.mobile.run({ task, deviceId })` → an NL agent task; `task` / `screenshots` / `trajectory` / `stop`  | Naive **adds** a natural-language driver; raw device tools via wildcard `call`                     |
| `session.screenshot('base64')`                                                              | `naive.mobile.call("take-screenshot", { path: { deviceId } })`                                             | Raw device tool via the [wildcard](/docs/getting-started/mobile#wildcard-search-call-any-mobilerun-api) |
| `client.setConfig({ device, osVersion })` (device/OS matrix)                                | `naive.mobile.provision({ type?, profile_id?, country })`                                                  | Device selected at provision — see [gaps](#what-does-not-map-yet)                                  |
| `session.end()` / session timeout                                                           | `naive.mobile.terminate(id)` — **stops the per-minute meter**                                              | Both metered by the minute                                                                         |
| `GET /v1/usageSummary` (per-app session minutes)                                            | `naive.forUser(id).logs.query()` + [plan](/docs/getting-started/customer-billing) usage                         | Usage on the identity's one timeline                                                               |
| `@appetize/playwright` (`toHaveElement`, `toMatchSnapshot`)                                 | (none)                                                                                                     | Test-assertion framework — see [gaps](#what-does-not-map-yet)                                      |
| (no approval step — the token does everything)                                              | provision / lifecycle / `run` / `uploadApp` / mutating `call` → `pending_approval`                         | The execution-time permission win — see [gain #2](#gain-2-execution-time-governance)               |
| Org token scopes *Appetize and nothing else*                                                | **Account Kit** enables `mobile` per user; metered against the [plan](/docs/getting-started/customer-billing)   | Governance on the identity — see [gain #2](#gain-2-execution-time-governance)                      |
| Appetize dashboard sessions                                                                 | `naive.forUser(id).logs.query()` — one per-user timeline                                                   | Device events beside cards, email, phone — see [gain #3](#gain-3-unified-accountability)           |

## Before / after: the core path

The path that matters for almost every device-backed agent is *get a cloud device with your app on
it, stream it, then drive it*. Here it is on both platforms.

<CodeGroup>
  ```ts Appetize.io theme={"theme":"css-variables"}
  import fs from "node:fs";

  // One X-API-KEY uploads AND runs AND controls — nothing gates what it does.
  // 1) Upload the build (multipart)
  const form = new FormData();
  form.append("file", fs.createReadStream("./app.apk"));
  form.append("platform", "android");
  const res = await fetch("https://api.appetize.io/v1/apps", {
    method: "POST",
    headers: { "X-API-KEY": process.env.APPETIZE_API_KEY! },
    body: form as any,
  });
  const { publicKey } = await res.json();

  // 2) Embed + start a session in the browser (js.appetize.io/embed.js loaded in <head>)
  const client = await window.appetize.getClient("#appetize", {
    buildId: publicKey,
    device: "pixel7",
    osVersion: "13.0",
  });
  const session = await client.startSession();

  // 3) Drive it by scripting each action yourself
  await session.tap({ element: { attributes: { text: "Settings" } } });
  await session.type("dark mode");
  const shot = await session.screenshot("base64");
  await session.end();
  // → the device is a slice of your Appetize org behind one token: no shared identity
  //   with the agent's cards/email/phone, no approval, no per-tenant scope.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // 1) Provision a real cloud device — the agent never holds a Mobilerun key.
  //    Approval-gated by default (may return { status: "pending_approval" }).
  const { phone, credits_per_minute } = await naive.mobile.provision({ country: "US" });
  await naive.mobile.waitReady(phone.device_id);

  // 2) Put your app on it (optional) + get a live stream to display
  await naive.mobile.uploadApp({ name: "MyApp", fileName: "app.apk" });
  const { stream_url, stream_token, console_url } = await naive.mobile.stream(phone.device_id);

  // 3) Drive it with a NATURAL-LANGUAGE task instead of scripting each tap
  const task = await naive.mobile.run({
    task: "Open Settings and enable dark mode",
    deviceId: phone.device_id,
    vision: true,
  });
  await naive.mobile.task(task.id);        // status + result
  await naive.mobile.screenshots(task.id); // captured screenshots

  // Done? Terminate — this is what STOPS the per-minute meter.
  await naive.mobile.terminate(phone.device_id);
  // → the SAME identity also owns this agent's cards, email, phone, and vault.
  ```
</CodeGroup>

The shape is largely the same — *device → app → stream → drive → tear down* — but the differences
are the point of the migration:

* **The agent never holds a device-cloud key.** Appetize drives the device with the same org token
  it uploads with. On Naive, Naive holds the Mobilerun operator key and scopes every device to your
  tenant; the agent only ever holds its `nv_sk_` key.
* **Provisioning and driving are approval-gated.** `provision`, lifecycle, `run`, `uploadApp`, and
  mutating wildcard `call`s can require a human approval before they execute — a leaked agent key
  can't silently spin up or drive a device.
* **Driving is natural-language, not per-action scripting.** Appetize expects you to script each
  `tap` / `type` / `screenshot`. Naive's `run` executes a plain-English task on-device (the raw
  device tools are still there via the wildcard `call`).
* **The device is your identity, not a separate account.** The same tenant user that owns this
  device owns the agent's cards, email, phone, and vault.

## Approvals: the execution-time gate

This is what "governed identity" means in practice. On Appetize, the org token spins up and drives
devices with no gate. On Naive, the sensitive operations are approval-gated, so an agent's request
to provision or drive a device can require a human to approve it first.

<CodeGroup>
  ```ts Appetize.io (no gate) theme={"theme":"css-variables"}
  // The org token can upload, provision, and drive — there is nothing to approve.
  const client = await window.appetize.getClient("#appetize", { buildId: publicKey });
  const session = await client.startSession();     // runs immediately
  await session.tap({ element: { attributes: { text: "Transfer" } } });  // runs immediately
  ```

  ```ts Naive (provision + drive are gated) theme={"theme":"css-variables"}
  // Provision may come back pending until a human approves it.
  const provision = await naive.mobile.provision({ country: "US" });
  // → { status: "pending_approval", approval_id } for an agent key whose Kit requires approval

  // Running a task is gated the same way; a human approves via Approvals, then it runs on replay.
  const task = await naive.mobile.run({
    task: "Open the banking app and read the balance",
    deviceId: phone.device_id,
  });
  ```

  ```bash Naive CLI (approve, then it runs) theme={"theme":"css-variables"}
  naive mobile provision --country US        # may print status: pending_approval + an approval id
  naive approvals approve <approval-id>      # a human approves the sensitive action
  naive mobile run "Open Settings and enable dark mode" --device <device-id> --vision
  naive mobile terminate <device-id>         # STOPS the per-minute meter
  ```
</CodeGroup>

* **Sensitive operations are gated server-side.** Provision, reboot/reset/terminate, proxy changes,
  `run`/`stop`, `uploadApp`, and mutating wildcard `call`s can require human approval depending on
  the user's [Account Kit](/docs/getting-started/account-kits) — you don't police it in app code.
* **A leaked agent key can't spin up or drive a device.** It can read status and list, but the
  device-provisioning and device-driving actions land in the [Approvals](/docs/getting-started/approvals)
  queue.
* **The meter is yours to stop.** Phones are billed per device-minute from credits with no upstream
  auto-stop; `terminate` stops the meter (credit exhaustion and a max-runtime failsafe are the only
  backstops).

## Minimal viable migration

The smallest swap that keeps a working device-backed agent alive is *provision a device → put the
app on it → drive it → terminate*.

<Steps>
  <Step title="Install the SDK / set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server   # or the CLI: npm install -g @usenaive-sdk/cli
    ```

    Set `NAIVE_API_KEY` (a server-side `nv_sk_` key from the
    [dashboard](https://dashboard.usenaive.ai)). You can drop `APPETIZE_API_KEY` for this path —
    Naive holds the upstream device-cloud key for you.
  </Step>

  <Step title="Enable the mobile primitive for the user">
    Whether an agent may use `mobile` at all is policy on its identity. Enable `mobile` in the
    user's [Account Kit](/docs/getting-started/account-kits), and confirm your approval posture (which
    sensitive operations require a human) — this is the deliberate change from Appetize, where the
    org token needs no permission to act.
  </Step>

  <Step title="Swap the provision + upload calls">
    Replace `getClient(...) + client.startSession(...)` with `naive.mobile.provision({ country })`
    then `naive.mobile.waitReady(device_id)`. Replace `POST /v1/apps` with
    `naive.mobile.uploadApp({ name, fileName })`. Keep the returned `device_id` in place of
    Appetize's `publicKey` — you now address a **device**, not a build.
  </Step>

  <Step title="Swap the control path">
    Map your scripted `session.tap` / `type` / `screenshot` sequence to a single
    `naive.mobile.run({ task, deviceId })` natural-language task (then read `task`, `screenshots`,
    `trajectory`). If you need a specific raw device tool, reach it with the wildcard
    `naive.mobile.call("take-screenshot", { path: { deviceId } })`. To display the device, read
    `naive.mobile.stream(device_id)` (`stream_url`, `stream_token`, `console_url`) instead of the
    Appetize iframe embed.
  </Step>

  <Step title="Always terminate">
    Replace `session.end()` with `naive.mobile.terminate(device_id)`. This **stops the per-minute
    meter** — there is no upstream auto-stop, so terminate every device you finish with.
  </Step>

  <Step title="Ship it">
    At this point you are off Appetize for the core provision → app → drive → terminate path.
    Everything below is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. On Appetize, the org token scopes **devices in one
Appetize account and nothing else**. On Naive, the unit of isolation is a **tenant user**, and the
device is one of many primitives that identity owns.

<CodeGroup>
  ```ts Appetize.io (devices only) theme={"theme":"css-variables"}
  // One X-API-KEY scopes Appetize — and only Appetize — for every customer.
  // The card, the inbox, the phone number, and the KYC for this customer's agent
  // live in entirely separate systems with their own keys and dashboards.
  const res = await fetch("https://api.appetize.io/v1/apps", {
    method: "POST",
    headers: { "X-API-KEY": process.env.APPETIZE_API_KEY! },
    body: buildForm(customer),
  });
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  // One tenant user per customer isolates *every* primitive.
  const acme = await naive.users.create({ external_id: customer.id, email: customer.email });
  const client = naive.forUser(acme.id);

  // The SAME client owns this customer's device, card, inbox, and phone —
  // and its Account Kit is what enables `mobile` at all. Tear the customer down
  // from one place and the device, card, inbox, and number all go with it.
  const { phone } = await client.mobile.provision({ country: "US" });
  await client.email.createInbox({ local_part: "agent" });
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Appetize, an agent's devices are a slice of one account, and per-customer separation is a
  naming convention you maintain yourself. With Naive, `naive.forUser(acme.id)` is a single handle
  to the identity whose Account Kit governs **mobile *and* cards *and* email *and* phone *and*
  vault**.
* Each tenant only ever sees the devices it created through Naive, and each tenant's credits fund
  only its own phones — isolation is the platform's job, not yours.

### Gain #2 — execution-time governance

* Whether an agent may use `mobile` at all is **policy on the identity** — toggled per user in the
  [Account Kit](/docs/getting-started/account-kits) — and device-minutes are
  [metered](/docs/getting-started/customer-billing) against the tenant's plan quota. This is on top of
  the per-operation [approval gate](/docs/getting-started/approvals) that Appetize has no equivalent for.

```ts theme={"theme":"css-variables"}
// A tier that grants mobile, gated + metered on the identity.
const qa = await naive.accountKits.create({
  name: "QA",
  primitives_config: {
    mobile: { enabled: true },
    cards: { enabled: false },
  },
});
await naive.accountKits.assignUser(qa.id, acme.id);

// The plan carries the per-primitive quota that meters usage at execution time.
await naive.plans.upsert({
  key: "qa",
  name: "QA",
  accountKitId: qa.id,
  period: "month",
  quotas: { mobile: 600 },   // device-minutes for the period
});
await naive.forUser(acme.id).billing.setSubscription({ planKey: "qa" });
```

* The agent's device code path stays the same for every tier. What changes at execution time:
  * **Disabled primitive → the call is refused.** If the Account Kit doesn't grant `mobile`, the
    provision never runs.
  * **Sensitive operation → approval-gated.** Provision, lifecycle, `run`, `uploadApp`, and mutating
    `call`s can return `pending_approval` until a human approves them.
  * **Quota exceeded → capped.** Once device-minutes cross the plan's `mobile` quota for the period,
    further provisioning is rejected — no surprise bill from a device left running.
  * **No key in the agent → nothing to leak.** Naive holds the Mobilerun operator key; the agent
    only ever holds its scoped `nv_sk_` key.

### Gain #3 — unified accountability

* Every provision, task, upload, and terminate for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their cards, email, phone, and vault events, not
  in a separate vendor dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "which device did this agent spin up, what task did it run, and who approved it?" — one timeline
```

* That is the question that is hard to answer when devices live in Appetize, cards live in Stripe,
  the phone number lives in a carrier console, and email lives somewhere else. Under Naive it is a
  single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (provision a device → put an app
on it → stream it → drive it → terminate) maps cleanly, and Naive **adds** the approval gate,
per-tenant scoping, and a natural-language agent driver. But Appetize is a mature app-testing and
in-browser device platform, and the following capabilities have **no direct equivalent** on Naive's
`mobile` primitive today. Check this list against your app before you commit.

| Appetize.io feature                                                                                                                                   | Status on Naive | Workaround                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **`@appetize/playwright`** test framework (`toHaveElement`, `toMatchSnapshot`, snapshot tests)                                                        | Not provided    | Drive with `naive.mobile.run` + read `trajectory`/`screenshots` and assert in your own harness                              |
| **Typed per-action session control** (`session.tap` by element selector / `accessibilityIdentifier`, `type`, `swipe`, `playAction`, `waitForElement`) | Partial         | Prefer NL `run`; reach raw device tools (tap/swipe/screenshot) via the wildcard `call`                                      |
| **Arbitrary device + OS matrix** (`device: "pixel7"`, `osVersion: "13.0"`, iOS simulators)                                                            | Partial         | Provision `dedicated_premium_device` with `country` (`type` / `profile_id` where available); no free device/OS picker today |
| **In-browser iframe embed of the device in your own page** (`appetize.io/embed/...`)                                                                  | Partial         | Naive returns `stream_url` / `stream_token` / `console_url`; build your display around those                                |
| **Session queue / concurrency events** (`queue`, `queueEnd` while waiting for a free slot)                                                            | Not provided    | Devices are provisioned per tenant on demand and metered per minute — no shared session pool                                |
| **Network intercept / debug logs / adb passthrough in-session**                                                                                       | Partial         | Some device tools are reachable via the wildcard `call`; verify the specific Mobilerun operation                            |
| **Enterprise private / self-hosted Appetize instances** (custom domain)                                                                               | Not applicable  | Naive runs the managed Mobilerun operator surface                                                                           |

<Warning>
  Naive's `mobile` primitive is a **governed cloud-device surface** (provision a real Android/iOS
  device, upload an app, stream it, run natural-language agent tasks, reach the entire Mobilerun API
  via a wildcard `call`) — not the full Appetize app-testing platform. If your workflow depends on the
  **`@appetize/playwright` assertion framework**, **fine-grained typed session scripting**, a **free
  device/OS selection matrix**, or **in-page iframe embedding**, those are the gaps most likely to
  need Appetize (or Mobilerun directly) alongside Naive. The core provision → app → drive → terminate
  path maps directly — and the flip side is the gain: the device, its approval gate, its per-tenant
  scope, and its billing are governed by the *same* identity and Account Kit as the rest of the agent,
  with a unified audit trail — not a slice of a standalone account behind an all-or-nothing token.
</Warning>

## Where to go next

* [`mobile` primitive](/docs/getting-started/mobile) — provision, stream, run agent tasks, apps, wildcard `search`/`call`, billing
* [Mobile API reference](/docs/api-reference/mobile/overview) — every REST endpoint, including the approval-gated ones
* [`naive.mobile.*` SDK sub-client](/docs/sdk/sub-clients/mobile) — the typed client used above
* [Approvals](/docs/getting-started/approvals) — the human gate that provision / run / upload flow through
* [Compute](/docs/getting-started/compute) — the same operator-key model applied to sandboxed code execution
* [Account Kits](/docs/getting-started/account-kits) — the policy model that enables/disables `mobile` per user
* [Customer billing](/docs/getting-started/customer-billing) — the plan + quota that meters device-minutes at execution time
* [Tenant users](/docs/getting-started/users) — the identity that owns the device, cards, email, phone, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Mobile Qa Platform](https://usenaive.ai/blog/how-to-build-an-agentic-mobile-qa-platform) — mobile QA tutorial
