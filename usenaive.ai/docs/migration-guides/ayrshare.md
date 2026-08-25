> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Ayrshare to Naive

> Move the social publishing your agent does — connect accounts, post/schedule across 10+ networks, pull analytics — off a standalone Ayrshare account and onto Naive's social primitive, where posting is one governed capability on the same account (and Account Kit) that owns the agent's cards, email, phone, and vault.

<Frame caption="Ayrshare's /post API → the Naive social primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/ayrshare-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=0ede9ed501a5023f156c3607b9dfba47" alt="Ayrshare" height="26" data-path="migration-guides/logos/ayrshare-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/ayrshare-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=78a131350b653a9ff5000a550f4f9705" alt="Ayrshare" height="26" data-path="migration-guides/logos/ayrshare-dark.svg" />
</Frame>

<Note>
  Ayrshare is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Ayrshare](https://www.ayrshare.com/docs) is a social media API: link a set of social accounts,
then publish, schedule, and pull analytics across 10+ networks with one `/post` call. It does
multi-network publishing well — a broad platform matrix, per-platform options, comments, DMs, RSS
auto-posting, and (on the Business plan) **User Profiles** so you can act on behalf of many end-users.
But when the thing doing the posting is an **agent that also holds cards, an inbox, a phone number,
and a KYC'd identity**, an Ayrshare account is a *disconnected vendor account*:

* Publishing lives behind an **Ayrshare API key**, and per-end-user separation is an **Ayrshare
  Profile Key** (Business plan) — an identity that exists *only inside Ayrshare*, unrelated to where
  the same agent's cards, email, and KYC live.
* Whether the agent *may* post, and how much it may spend doing so, is **not** something Ayrshare
  governs — it is a key you hold. There is no execution-time "can this agent post right now?" check
  tied to the agent's broader permission set.
* *"Which agent posted this, for which end-user, and who let it?"* is answered in Ayrshare's post
  history for social, and in unrelated systems for the agent's spend, comms, and identity.

Naive's [`social`](/docs/getting-started/social) primitive gives the agent the **same** capability —
connect accounts over OAuth, then create/schedule/publish across the major networks and read
analytics back — but posting is **one primitive on one governed account**:

* The [Account Kit](/docs/getting-started/account-kits) that decides whether the agent may
  [issue a card](/docs/getting-started/cards), [send email](/docs/getting-started/email), or buy a
  [domain](/docs/getting-started/domains) also decides whether it may use `social` at all — checked **at
  execution time**, not in a separate dashboard.
* Publishing spend is metered in the **same credit balance and budget ceiling** as every other
  primitive, so a runaway agent hits one cap, not a separate Ayrshare bill.
* Every post records the **acting agent** and lands in the same per-user
  [activity log](/docs/getting-started/logs) as its card spend, email sends, and KYC events.

This guide maps Ayrshare's publishing API to Naive's, shows the smallest working swap, and is
explicit about what does **not** map yet — most importantly, that Naive `social` is
**workspace-scoped today**, not per-end-user isolated the way Ayrshare Profile Keys are.

<Info>
  **Tested against:** the Ayrshare Node SDK
  [`social-media-api`](https://www.npmjs.com/package/social-media-api) **v1.3.0** (against the Ayrshare
  REST API, base `https://api.ayrshare.com/api`, `/post`, `/profiles`, `/analytics`, `/history`
  endpoints, docs snapshot July 2026), and the Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview)
  against the Naive API (base `https://api.usenaive.ai/v1`, `/social/*` endpoints, docs snapshot July
  2026\).

  Version notes:

  * **Scope model differs.** Ayrshare authenticates with an account-wide API key and (Business plan)
    scopes an end-user with a **Profile Key** header. Naive authenticates per workspace and scopes an
    end-user with `naive.forUser(id)` — the same handle that reaches every other primitive. See
    [what doesn't map yet](#what-does-not-map-yet) for the isolation caveat.
  * **Publish shape is close.** Ayrshare `social.post({ post, platforms, mediaUrls })` →
    Naive `client.social.createPost({ content, platforms, media_urls, publish_now: true })`. The core
    publish/schedule/list/analytics path is a near one-to-one swap.
  * **Platform names differ in case and coverage.** Ayrshare uses lowercase (`twitter`, `linkedin`);
    Naive uses uppercase (`TWITTER`, `LINKEDIN`). Naive supports 11 networks and adds `MASTODON`;
    Ayrshare additionally covers `gmb` (Google Business Profile), `snapchat`, and `telegram`, which
    Naive does **not** — see [gaps](#what-does-not-map-yet).
  * **X/Twitter BYO.** As of March 31, 2026, Ayrshare requires *your own* X Developer App credentials
    (`setTwitterByo(...)`). Naive posts X through its provider without you supplying X app keys.
  * **No equivalent yet** for Ayrshare comments/DMs, RSS auto-posting, auto-schedule, auto-repost, the
    link shortener, or reviews — see [what doesn't map yet](#what-does-not-map-yet).
</Info>

## Concept map

| Ayrshare                                                                                  | Naive                                                                                                              | Notes                                                                                                              |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `new SocialMediaAPI(apiKey)`                                                              | `new Naive({ apiKey })` then `naive.forUser(id)`                                                                   | Server-side credential in both cases                                                                               |
| Account API Key + (Business) **Profile Key** per end-user                                 | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive                         | See the [isolation caveat](#what-does-not-map-yet) — Naive `social` data is workspace-scoped today                 |
| Link accounts via `POST /api/profiles/generateJWT` → hosted linking URL                   | `POST /v1/social/connect` `{ platform, redirect_url }` → OAuth URL, or `POST /v1/social/portal` for multi-platform | Both return a URL the user opens to authorize; Naive's portal can hide "powered by" branding                       |
| `social.post({ post, platforms, mediaUrls })` → `POST /api/post`                          | `client.social.createPost({ content, platforms, media_urls, publish_now: true })` → `POST /v1/social/posts`        | Publish now to the listed networks                                                                                 |
| `scheduleDate: "2026-07-08T12:30:00Z"`                                                    | `createPost({ ..., scheduled_at: "2026-07-08T12:30:00Z" })`                                                        | ISO-8601 UTC on both sides                                                                                         |
| — (post is immediate or scheduled)                                                        | Omit `publish_now`/`scheduled_at` → **draft**, then `POST /v1/social/posts/:id/publish`                            | Draft/edit-then-publish is a Naive addition                                                                        |
| `social.delete({ id })` → `DELETE /api/post`                                              | `DELETE /v1/social/posts/:id`                                                                                      | Delete a post (subject to per-network limits)                                                                      |
| `social.history()` → `GET /api/history`                                                   | `client.social.listPosts()` → `GET /v1/social/posts`                                                               | List the agent's posts                                                                                             |
| `social.analyticsPost({ id, platforms })` → `POST /api/analytics/post`                    | `GET /v1/social/posts/:id/analytics`                                                                               | Per-post metrics                                                                                                   |
| Social-network analytics `POST /api/analytics/social`                                     | `GET /v1/social/accounts/:id/analytics`                                                                            | Account-level metrics                                                                                              |
| `mediaUrls: ["https://..."]`                                                              | `media_urls: ["https://..."]` (auto-uploaded) or pre-uploaded `upload_ids`                                         | Naive downloads + attaches to media-capable platforms                                                              |
| Profile Key gate (a key you hold)                                                         | **Account Kit** `social` primitive `enabled: true/false` per user                                                  | Permission is execution-time policy on the identity — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| Account-wide Ayrshare billing                                                             | Same [credit balance + budget ceiling](/docs/getting-started/billing) as every primitive                                | Publishing costs **2.5 credits** per post (3 for X; 7.5 for an X post with a link); drafts are free                |
| `gmb`, `snapchat`, `telegram` platforms                                                   | —                                                                                                                  | Not supported on Naive today                                                                                       |
| **Comments / DMs**, RSS auto-posting, auto-schedule, auto-repost, link shortener, reviews | — (posts have read-only `comments`)                                                                                | See [gaps](#what-does-not-map-yet)                                                                                 |

## Before / after: the core path

The path that matters for almost every agent is *publish a post to a few networks, then read it back
/ pull analytics*. Here it is on both platforms.

<CodeGroup>
  ```ts Ayrshare theme={"theme":"css-variables"}
  import SocialMediaAPI from "social-media-api";

  // One account-wide API key. On the Business plan you scope an end-user by
  // passing their Profile Key — an identity that exists only inside Ayrshare.
  const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

  // 1. Publish now (POST /api/post)
  const post = await social.post({
    post: "We just shipped agent-native social posting!",
    platforms: ["twitter", "linkedin"],
    mediaUrls: ["https://cdn.example.com/launch.png"],
    profileKeys: [process.env.ACME_PROFILE_KEY!], // Business plan, per end-user
  });

  // 2. Pull analytics for the post (POST /api/analytics/post)
  const stats = await social.analyticsPost({
    id: post.id,
    platforms: ["twitter", "linkedin"],
  });

  // The card, inbox, phone, and KYC for this customer's agent live in entirely
  // separate systems — and whether the agent "may post" is a key you hold, not a
  // governed, execution-time decision.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("acme"); // same id space as your own users

  // 1. Publish now (POST /v1/social/posts) — platforms are UPPERCASE
  const post = await client.social.createPost({
    content: "We just shipped agent-native social posting!",
    platforms: ["TWITTER", "LINKEDIN"],
    media_urls: ["https://cdn.example.com/launch.png"],
    publish_now: true,
  });

  // 2. Pull analytics for the post (GET /v1/social/posts/:id/analytics)
  const res = await fetch(
    `https://api.usenaive.ai/v1/social/posts/${post.id}/analytics`,
    { headers: { Authorization: `Bearer ${process.env.NAIVE_API_KEY}` } },
  );
  const { analytics } = await res.json();

  // Whether this agent may post at all is its Account Kit's `social` primitive,
  // checked at execution time; the 2.5-credit publish counts against the SAME
  // budget ceiling as its cards, email, and phone — and the post is logged
  // against the acting agent.
  ```
</CodeGroup>

The publish/analytics shape lines up closely. The real differences to plan for:

* **Platform names are uppercase.** `twitter` → `TWITTER`, `linkedin` → `LINKEDIN`, etc. Naive
  supports `TWITTER`, `LINKEDIN`, `INSTAGRAM`, `FACEBOOK`, `TIKTOK`, `YOUTUBE`, `THREADS`,
  `PINTEREST`, `REDDIT`, `BLUESKY`, and `MASTODON`.
* **`post` → `content`, `mediaUrls` → `media_urls`.** Naive downloads each media URL and attaches it
  to media-capable platforms; text-only platforms are unaffected.
* **Publish is explicit.** Set `publish_now: true` to post immediately, `scheduled_at` to schedule,
  or omit both to save a **draft** you can edit and publish later.
* **Accounts are connected first.** Before the first post, connect accounts with
  `POST /v1/social/connect` (or the multi-platform `POST /v1/social/portal`) and `POST /v1/social/sync`
  — the equivalent of linking accounts through Ayrshare's `generateJWT` URL.

## Minimal viable migration

The smallest swap that keeps a working agent running is *connect* + *publish* + *list/delete*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Activate + connect the accounts">
    Replace Ayrshare's `generateJWT` linking flow with Naive's connect flow: `POST /v1/social/activate`
    once, then `POST /v1/social/connect` `{ platform, redirect_url }` (or `POST /v1/social/portal` to
    link several at once). Open the returned `url` for the user to authorize, then call
    `POST /v1/social/sync` to pick up the connected accounts.
  </Step>

  <Step title="Swap the publish call">
    Map `social.post({ post, platforms, mediaUrls })` → `client.social.createPost({ content,
            platforms, media_urls, publish_now: true })`. Uppercase the platform names and rename `post` →
    `content`, `mediaUrls` → `media_urls`. For scheduling, pass `scheduled_at` instead of
    `scheduleDate`.
  </Step>

  <Step title="Swap list + delete">
    Map `social.history()` → `client.social.listPosts()` (`GET /v1/social/posts`, filter with
    `?status=`), and `social.delete({ id })` → `DELETE /v1/social/posts/:id`. Note some networks
    (Instagram, TikTok) don't allow API deletes on either platform.
  </Step>

  <Step title="Swap analytics (optional)">
    Map `social.analyticsPost({ id, platforms })` → `GET /v1/social/posts/:id/analytics`, and
    account-level `social.analyticsSocial(...)` → `GET /v1/social/accounts/:id/analytics`.
  </Step>

  <Step title="Ship it">
    At this point the agent's publish path is off Ayrshare. Everything below is upside, not a
    requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Ayrshare, posting is a self-contained account: an
API key, optional Profile Keys, and its own billing — disconnected from the agent's money, comms, and
identity. On Naive, `social` is **one primitive on the same account and Account Kit** that governs
the agent's cards, email, phone, and vault.

<CodeGroup>
  ```ts Ayrshare (standalone account — posting only) theme={"theme":"css-variables"}
  // The API key posts; the Profile Key scopes an Ayrshare-only identity.
  const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);
  await social.post({
    post: "Launch day!",
    platforms: ["twitter", "linkedin"],
    profileKeys: [process.env.ACME_PROFILE_KEY!],
  });

  // The card, inbox, phone, and KYC for this customer's agent live elsewhere —
  // separate accounts, separate billing, separate audit — and "may this agent
  // post?" is a key you hold, not a governed decision.
  ```

  ```ts Naive (one governed account — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer; the same handle reaches every primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  // Publishing is one primitive, gated + metered like the rest.
  await client.social.createPost({
    content: "Launch day!",
    platforms: ["TWITTER", "LINKEDIN"],
    publish_now: true,
  });

  // The SAME client owns this customer's card, inbox, phone, and KYC — one
  // account, one budget, one audit trail, every capability governed by its
  // Account Kit.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "ops" });
  ```
</CodeGroup>

### Gain #1 — one account across primitives

* With Ayrshare, social posting is an island behind its own key and billing. With Naive,
  `naive.forUser(acme.id)` is a single handle to **social *and* cards *and* email *and* phone *and*
  KYC** — no second vendor account, no Profile Keys to provision and rotate, no separate invoice.
* Third-party [connections](/docs/getting-started/connections) (OAuth grants like Slack or Notion) and the
  agent's native primitives sit under **one identity and one Account Kit** — the SaaS the agent
  connected and the networks it posts to, governed the same way.

### Gain #2 — execution-time permission enforcement

* Whether an agent may post at all is the `social` primitive on the user's **Account Kit**, decided
  **at execution time** — not a key you gate separately from everything else the agent can do.

```ts theme={"theme":"css-variables"}
// This tier's agents get email + cards, but cannot post to social at all.
const kit = await naive.accountKits.create({
  name: "No-social tier",
  primitives_config: {
    email: { enabled: true },
    cards: { enabled: true },
    social: { enabled: false }, // social calls are refused with `forbidden`
  },
});
await naive.accountKits.assignUser(kit.id, acme.id);
```

* The agent's code path stays the same for every tier — `client.social.createPost(...)`. Whether it runs is
  decided by policy: a user whose Account Kit does not enable `social` is refused with `forbidden`,
  with **no code change** on your side.
* Publishing spends **2.5 credits** (3 for X; 7.5 for an X post with a link) against the same [budget ceiling](/docs/getting-started/billing) as the
  agent's cards, phone, and LLM calls — so a misbehaving agent trips one combined cap, not a separate
  Ayrshare limit you monitor on its own.

<Note>
  Social publishing is gated by the primitive toggle and the budget, but it is **not** frozen for human
  approval by default — unlike money-moving primitives (cards, trading, domains). If you need a human in
  the loop before a post goes out, use the **draft** flow (create without `publish_now`/`scheduled_at`,
  review, then `POST /v1/social/posts/:id/publish`) or disable the `social` primitive for that tier.
</Note>

### Gain #3 — unified accountability

* Every post records the **acting agent** and lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside that customer's card spend, email sends, and KYC
  events, not in a separate Ayrshare post history:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — social posts, card spend, email sends, one timeline
```

* That is the question that is hard to answer when posts live in Ayrshare, cards live in Stripe, and
  the inbox lives somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (connect → publish → schedule →
list → analytics → delete) maps cleanly, but the following Ayrshare capabilities have **no direct
equivalent** on Naive's `social` primitive today. Check this list against your app before you commit.

| Ayrshare feature                                                                       | Status on Naive                                                                                                                                                                  | Workaround                                                                                                               |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Per-end-user isolation** (Profile Keys separate each user's linked accounts + posts) | **Partial** — the `social` primitive is gated per user via Account Kits, but connected accounts and post data are **workspace-scoped** today (posts carry no per-user tenant id) | Use one Naive workspace per end-user if you need hard data isolation now; per-user isolation of social is on the roadmap |
| **`gmb` (Google Business Profile), `snapchat`, `telegram`** platforms                  | Not supported (Naive covers 11 networks incl. `MASTODON`)                                                                                                                        | Keep Ayrshare for those specific networks, or post to the supported set                                                  |
| **Comments + DMs** (post/reply/get comments, direct messages)                          | Read-only — `GET /v1/social/posts/:id/comments`; no comment/DM **posting**                                                                                                       | Use the platform's own API for writing comments/DMs                                                                      |
| **RSS auto-posting**, **auto-schedule**, **auto-repost**, **auto-hashtag**             | Not provided                                                                                                                                                                     | Drive scheduling from your own scheduler + `scheduled_at`                                                                |
| **Link shortener** (`shortenLinks`, custom domains) + link analytics                   | Not provided                                                                                                                                                                     | Shorten links in your own code before `createPost`                                                                       |
| **Reviews** (get/reply/delete on connected accounts)                                   | Not provided                                                                                                                                                                     | Use the platform's own API                                                                                               |
| **First comment, disable comments, per-network advanced options**                      | Partial — `platform_data` overrides per platform; not every Ayrshare option is surfaced                                                                                          | Pass supported fields via `platform_data`; otherwise not available                                                       |
| **X/Twitter BYO credentials** (`setTwitterByo`)                                        | Different model — Naive posts X via its provider; you don't supply an X Developer App                                                                                            | No action needed on Naive; you can't reuse your Ayrshare X app config                                                    |
| **JWT white-label linking URL** on *your* domain                                       | Partial — `POST /v1/social/portal` returns a hosted OAuth URL (can hide "powered by"), not a JWT SSO URL on your domain                                                          | Use the connect/portal URL for account linking                                                                           |

<Warning>
  The biggest thing to weigh is **isolation model**, not method. Ayrshare's **Profile Keys** (Business
  plan) give each of your end-users a genuinely separate set of linked accounts and post history inside
  Ayrshare. Naive's `social` primitive is **workspace-scoped today**: the `social` toggle and budget are
  enforced per user through the Account Kit, but the connected accounts and the posts themselves are not
  yet isolated per end-user (a post has no per-user tenant id). If your product hard-requires that end
  users A and B never see or touch each other's connected accounts, run a workspace per end-user for now,
  or keep Ayrshare for the social surface until per-user `social` isolation ships. Also note the
  **platform coverage difference** (`gmb`/`snapchat`/`telegram` are Ayrshare-only) and that **comments/DMs
  are read-only** on Naive — if those are load-bearing, they are the gaps most likely to matter.
</Warning>

## Where to go next

* [`social` primitive](/docs/getting-started/social) — full connect / post / schedule / analytics lifecycle, platform matrix, and platform defaults
* [`social` SDK sub-client](/docs/sdk/sub-clients/social) — typed `listPosts` / `createPost`
* [`social` CLI](/docs/cli/social) — `naive social connect / post` per user
* [Account Kits](/docs/getting-started/account-kits) — enabling/disabling the `social` primitive per user at execution time
* [Tenant users](/docs/getting-started/users) — the identity that owns social, cards, email, and phone
* [Billing](/docs/getting-started/billing) — the shared credit balance and budget ceiling publishing spends against
* [Logs](/docs/getting-started/logs) — the unified per-user activity trail every post lands in

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build A Multi Tenant Ai Social Media Agent](https://usenaive.ai/blog/how-to-build-a-multi-tenant-ai-social-media-agent) — social posting tutorial
