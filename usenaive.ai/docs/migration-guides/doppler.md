> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Doppler to Naive

> Move the API keys, tokens, and cookies your agent holds out of a Doppler config and into Naive's vault primitive — the same encrypted secret store, but scoped to one governed per-user identity with write-only entries, per-entry expiry, and a unified audit trail.

<Frame caption="Doppler's config secrets → the Naive vault primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/doppler-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=495a066cd778ce11acdb30adb72f15f9" alt="Doppler" height="26" data-path="migration-guides/logos/doppler-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/doppler-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=07361c841c3ba45d1ad3daa3924e8ad9" alt="Doppler" height="26" data-path="migration-guides/logos/doppler-dark.svg" />
</Frame>

[Doppler](https://docs.doppler.com) is a secrets manager: you organize secrets into a
**project → config → secret** hierarchy, then read them back over the API/SDK or inject them into a
process with `doppler run -- <cmd>`. It does infra-config secrets well — versioning, environment
branching, syncs to 30+ platforms. But when the thing holding secrets is an **agent acting on
behalf of many end-users**, a Doppler config is a *disconnected vendor store*:

* Secrets live behind a **service token** (`dp.st.<config>...`) scoped to **one config** — a single
  shared bucket, not per-end-user. To isolate secrets per customer you build the mapping yourself
  (one config per user, naming conventions, or your own KV on top).
* Every secret in a config is **readable** by any code holding the token. There is no *write-only*
  secret — nothing an agent can **use** but never **read back**.
* *"Which of this agent's secrets belong to which end-user, and who let it read them?"* is answered
  in Doppler for secrets, and in unrelated systems for the agent's cards, email, and KYC. The
  identity that owns the secret is a **config**, not the end-user the agent serves.

Naive's [`vault`](/docs/getting-started/vault) primitive gives the agent the **same** capability — an
envelope-encrypted key/value store it reads at execution time — but every entry is rooted in **one
governed identity**:

* The [tenant user](/docs/getting-started/users) whose vault holds a secret is the same user that owns
  its [cards](/docs/getting-started/cards), its [email inboxes](/docs/getting-started/email), its
  [phone number](/docs/getting-started/phone), and its [KYC](/docs/getting-started/verification).
* Each value is envelope-encrypted with a managed KMS under an encryption context bound to
  `{ company_id, tenant_user_id }`, so **sibling tenants should not be able to read each other's secrets** — you
  never build the per-user isolation.
* Entries can be **`locked`** (stored but never revealed), **expiring** (`expires_at`), and whether
  the agent may touch the vault at all is decided by that user's
  [Account Kit](/docs/getting-started/account-kits) **at execution time**.

This guide maps Doppler's secrets API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  Doppler is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** the Doppler Node SDK
  [`@dopplerhq/node-sdk`](https://www.npmjs.com/package/@dopplerhq/node-sdk) against the Doppler
  **API v3** (base `https://api.doppler.com`, `/v3/configs/config/secret(s)` endpoints, docs snapshot
  June 2026), and the Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base
  `https://api.usenaive.ai/v1`, docs snapshot June 2026).

  Version notes:

  * **Scope model differs.** Doppler scopes secrets by **project + config** and authenticates with a
    token bound to a config. Naive scopes by **tenant user** — `naive.forUser(id)` — and the same key
    reaches every one of that user's primitives.
  * **Storage shape is a near-rename.** Doppler `secrets.update({ secrets: { KEY: value } })` →
    Naive `vault.put(key, value)`. Doppler `secrets.get(...).value.computed` → Naive
    `vault.reveal(key).value`. The core store/read path is close to a one-to-one swap.
  * **`rotate` means different things.** Doppler *rotates the secret value* (rotated/dynamic secrets).
    Naive `vault.rotate` **re-wraps the encryption key** — the stored value is unchanged. Do not treat
    these as equivalent (see [what doesn't map yet](#what-does-not-map-yet)).
  * **No equivalent yet** for Doppler's env injection (`doppler run`), config inheritance/branching,
    integrations/syncs, dynamic secrets, or secret versioning/rollback — see
    [what doesn't map yet](#what-does-not-map-yet).
</Info>

## Concept map

| Doppler                                                                                            | Naive                                                                                                        | Notes                                                                                                              |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `new DopplerSDK({ accessToken })`                                                                  | `new Naive({ apiKey })` then `naive.forUser(id)`                                                             | Server-side credential in both cases                                                                               |
| **project → config → secret** hierarchy                                                            | **tenant user → vault entry**                                                                                | Doppler scopes by environment/config; Naive scopes by the end-user identity                                        |
| Service token `dp.st.<config>` — read access to **one shared config**                              | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive                   | The core consolidation win — see [gain #1](#gain-1-one-identity-across-primitives)                                 |
| `secrets.update({ project, config, secrets: { KEY: value } })` → `POST /v3/configs/config/secrets` | `client.vault.put(key, value, { kind })` → `PUT /v1/users/:id/vault/:key`                                    | Store or replace one secret (idempotent on the key)                                                                |
| `secrets.get(project, config, name)` → `.value.computed` / `.value.raw`                            | `client.vault.reveal(key)` → `.value`                                                                        | Read one secret back (Naive `reveal` is a **POST** — secret in body, never a URL)                                  |
| `secrets.list(project, config)` → `{ secrets: { KEY: {...} } }`                                    | `client.vault.list()` → `{ entries: [...] }` (**values masked**)                                             | List keys; Naive masks values and drops expired entries                                                            |
| `secrets.delete(project, config, name)` → `DELETE /v3/configs/config/secret`                       | `client.vault.delete(key)`                                                                                   | Delete one entry                                                                                                   |
| `secrets.download(project, config, { format: "env" })` → all secrets at once                       | — (loop `list()` then `reveal()` per key)                                                                    | No bulk env-format dump — see [gaps](#what-does-not-map-yet)                                                       |
| `doppler run -- node app.js` (inject secrets as env vars)                                          | — (fetch with `reveal` at call time)                                                                         | No runtime env injection                                                                                           |
| Secret note (`updateNote`) / metadata                                                              | `client.vault.put(key, value, { metadata })`                                                                 | Arbitrary JSON attached to the entry                                                                               |
| Rotated / dynamic secrets (**value** changes)                                                      | `client.vault.rotate(key)` **re-wraps the KMS key** (value unchanged); `{ regenerateDek: true }` re-encrypts | **Not** the same operation — see [gaps](#what-does-not-map-yet)                                                    |
| — (no write-only secret)                                                                           | `client.vault.put(key, value, { locked: true })`                                                             | Stored, used indirectly, but **never revealed back**                                                               |
| — (no per-secret expiry)                                                                           | `client.vault.put(key, value, { expiresAt })`                                                                | Expired entries are omitted from `list` and typically return not found on `reveal`                                 |
| Config access / secret change requests                                                             | **Account Kit** `vault` primitive `enabled: true/false` per user                                             | Permission is execution-time policy on the identity — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| **Config inheritance / branching**, environments                                                   | —                                                                                                            | Naive vault is a flat per-user KV, not a config tree                                                               |
| **Integrations / syncs** (AWS SM, Vercel, 30+ platforms)                                           | —                                                                                                            | Naive vault is a store, not a sync hub                                                                             |
| **Dynamic secrets** (issue short-lived DB/cloud creds)                                             | —                                                                                                            | Store static secrets only                                                                                          |
| **Secret versioning + rollback**, activity/audit log                                               | Partial — Naive logs `vault.*` events; **no version history/rollback**                                       | Every put/reveal/rotate lands in the [per-user log](/docs/getting-started/logs)                                         |

## Before / after: the core path

The path that matters for almost every agent is *store a secret, then read it back when calling the
downstream service*. Here it is on both platforms.

<CodeGroup>
  ```ts Doppler theme={"theme":"css-variables"}
  import { DopplerSDK } from "@dopplerhq/node-sdk";

  // One config behind a service token — a shared bucket, not per end-user.
  const doppler = new DopplerSDK({ accessToken: process.env.DOPPLER_TOKEN! });

  const PROJECT = "agent";
  const CONFIG = "prd";

  // 1. Store a secret the agent generated (POST /v3/configs/config/secrets)
  await doppler.secrets.update({
    project: PROJECT,
    config: CONFIG,
    secrets: { INSTANTLY_API_KEY: "key_xyz" },
  });

  // 2. Read it back when calling the downstream service
  //    (GET /v3/configs/config/secret) → { name, value: { raw, computed, note } }
  const res = await doppler.secrets.get(PROJECT, CONFIG, "INSTANTLY_API_KEY");
  const apiKey = res.value.computed;

  // To isolate per end-user you build it yourself: a config per user,
  // naming conventions, or your own KV on top of Doppler.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("alice"); // same id space as your own users

  // 1. Store a secret the agent generated (PUT /v1/users/alice/vault/:key)
  await client.vault.put("instantly.api_key", "key_xyz", { kind: "api_key" });

  // 2. Read it back when calling the downstream service
  //    (POST /v1/users/alice/vault/:key/reveal — secret in body, never a URL)
  const { value } = await client.vault.reveal("instantly.api_key");
  const apiKey = value;

  // Per-user isolation is built in: this entry is envelope-encrypted under
  // { company_id, tenant_user_id } — sibling tenants should not be able to read it.
  ```
</CodeGroup>

The store/read shape lines up almost exactly. The real differences to plan for:

* **The scope is an identity, not a config.** In Doppler the token scopes a *config*; to serve many
  users you build the per-user split. In Naive `forUser(id)` is the split — one line, isolated end
  to end, and the same handle owns the user's cards, email, phone, and KYC.
* **`reveal` is a POST.** Naive returns the secret in the response body, never in a URL — so it can't
  land in a proxy log or browser history.
* **`kind` classifies the entry.** `api_key`, `password`, `cookie`, `token`, `reference`, or `note`
  (default). It's a label for the dashboard/logs, not a behavior change.
* **Values come back masked in `list`.** `vault.list()` returns keys with `••••••••` placeholders and
  omits expired entries; only `reveal` decrypts.

## Minimal viable migration

The smallest swap that keeps a working agent running is *store* + *read* + *delete*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Pick the identity the secret belongs to">
    Replace `new DopplerSDK({ accessToken })` + your `project`/`config` selection with
    `naive.forUser(id)`, where `id` is the end-user (or your own default user) the secret is for.
    There is no config to choose — the user *is* the scope.
  </Step>

  <Step title="Swap writes">
    Map `secrets.update({ secrets: { KEY: value } })` → `vault.put(key, value, { kind })`. `put` is
    idempotent on the key, so a re-store overwrites in place. Prefer lowercase, dotted keys
    (`instantly.api_key`) — Naive keys are renameable and not case-transformed.
  </Step>

  <Step title="Swap reads">
    Map `secrets.get(project, config, name).value.computed` → `vault.reveal(key)` (returns
    `{ key, value, expires_at }`), and `secrets.list(...)` → `vault.list()` (values masked). Reveal
    over POST, not GET.
  </Step>

  <Step title="Swap deletes">
    Map `secrets.delete(project, config, name)` → `vault.delete(key)`.
  </Step>

  <Step title="Ship it">
    At this point the agent's store/read path is off Doppler. Everything below is upside, not a
    requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Doppler, a service token isolates **a config and
nothing else**, and every secret in it is readable by whatever holds the token. On Naive, the unit
of isolation is a **tenant user**, and the vault is one primitive on an identity that also owns the
agent's cards, email, and phone.

<CodeGroup>
  ```ts Doppler (service token — secrets only) theme={"theme":"css-variables"}
  // One config per token; to go multi-user you build the split yourself.
  const doppler = new DopplerSDK({ accessToken: process.env.DOPPLER_TOKEN! });
  await doppler.secrets.update({
    project: "agent", config: "prd",
    secrets: { INSTANTLY_API_KEY: "key_xyz" },
  });

  // The card, the email inbox, the phone number, the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy — and every
  // secret in the config is readable by anything holding the token.
  ```

  ```ts Naive (tenant user — the whole stack, governed) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  // A write-only credential the agent can USE but never READ back.
  await client.vault.put("stripe.restricted_key", "rk_live_xyz", {
    kind: "api_key",
    locked: true,
  });

  // A short-lived session cookie that self-expires.
  await client.vault.put("portal.session", "sess_abc", {
    kind: "cookie",
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });

  // The SAME client owns this customer's card, email inbox, phone, and KYC —
  // one identity, isolated end to end, every capability governed by its Account Kit.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "ops" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Doppler, the agent's secrets are an island behind a config token. With Naive,
  `naive.forUser(acme.id)` is a single handle to **vault *and* cards *and* email *and* phone *and*
  KYC**.
* Each value is envelope-encrypted with a managed KMS under an encryption context bound to
  `{ company_id, tenant_user_id }` — sibling tenants **cannot** read each other's secrets, cards, or
  inboxes, and you never wrote the isolation.
* Third-party [connections](/docs/getting-started/connections) (OAuth grants) surface **alongside** vault
  entries in one per-user credential view — the SaaS keys the agent generated and the OAuth apps it
  connected, one identity.

### Gain #2 — execution-time permission enforcement

* Whether an agent may touch the vault at all is the `vault` primitive on the user's **Account Kit**,
  decided **at execution time** — not a token scope you manage separately.

```ts theme={"theme":"css-variables"}
// This tier's agents get email + cards, but no vault access at all.
const kit = await naive.accountKits.create({
  name: "No-secrets tier",
  primitives_config: {
    email: { enabled: true },
    cards: { enabled: true },
    vault: { enabled: false }, // vault calls are refused with `forbidden`
  },
});
await naive.accountKits.assignUser(kit.id, acme.id);
```

* The agent's code is identical for every tier — `client.vault.reveal("instantly.api_key")`. Whether
  it runs is decided by policy: a user whose Account Kit does not enable `vault` is refused with
  `forbidden`, with **no code change** on your side.
* Two enforcement levers Doppler has no equivalent for:
  * **`locked` entries** — stored and used indirectly, but `reveal` is typically refused (`forbidden`
    per the [vault API](/docs/api-reference/vault/reveal)). A leaked agent process still should not be able
    to read the raw value back out.
  * **`expires_at`** — an entry drops out of `list` and `reveal` typically returns not found once
    expired, reducing replay of stale session cookies or short-lived tokens.

<Note>
  Unlike money-moving primitives (cards, trading, domains), vault reads are **not** frozen for human
  approval by default — the enforcement model is *enable/disable the primitive*, *lock* an entry, or
  *expire* it, not an approval queue. If you need a human in the loop before a secret is used, gate the
  **downstream primitive** that consumes it instead.
</Note>

### Gain #3 — unified accountability

* Every `put`, `reveal`, and `rotate` for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their card, email, phone, and KYC events, not in
  a separate Doppler activity feed:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — vault reveals, card spend, email sends, one timeline
```

* That is the question that is hard to answer when secrets live in Doppler, cards live in Stripe, and
  the inbox lives somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (store → reveal → list → delete,
plus `locked`/`expires_at`/`rotate`) maps cleanly, but the following Doppler capabilities have **no
direct equivalent** on Naive's vault primitive today. Check this list against your app before you
commit.

| Doppler feature                                                     | Status on Naive                                                           | Workaround                                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Env injection** (`doppler run -- <cmd>`, `.env` mounts)           | Not provided                                                              | Fetch with `vault.reveal(key)` at call time and set process state yourself               |
| **Bulk download** (`secrets.download`, env/yaml/docker formats)     | Not provided                                                              | Loop `vault.list()` then `vault.reveal()` per key                                        |
| **Config inheritance / branching**, environments (dev/stg/prd)      | Not provided                                                              | Encode environment in the key or use separate tenant users                               |
| **Secret referencing** (`${OTHER_SECRET}`, `.value.computed`)       | Not provided — `reveal` returns the raw stored value                      | Compose values in your own code before `put`                                             |
| **Integrations / syncs** (AWS Secrets Manager, Vercel, GitHub, 30+) | Not provided                                                              | Naive vault is a store, not a sync hub — keep Doppler for platform config if you sync    |
| **Dynamic secrets** (issue short-lived DB/cloud creds on demand)    | Not provided                                                              | Store static secrets; `rotate` re-wraps the KMS key, it does not mint new credentials    |
| **Rotated secrets** (Doppler changes the **value** on a schedule)   | Different operation — `vault.rotate` re-wraps encryption, value unchanged | Re-`put` the new value when your source rotates it                                       |
| **Secret versioning + rollback**                                    | Not provided                                                              | Keep a version trail in your own store if you need rollback                              |
| **Personal configs, webhooks, trusted IPs, project RBAC**           | Not provided (Account Kit gates the primitive, not per-secret roles)      | Use Account Kits + [connections config](/docs/getting-started/account-kits) for coarse policy |

<Warning>
  The biggest behavior change is **model, not method**: Doppler is built to hold your **infrastructure
  config** and *inject it into a process* (`doppler run`), with environment branching, syncs, and
  versioning. Naive vault holds the **per-end-user secrets an agent encounters at runtime** — a SaaS
  key it generated, a session cookie, a KYC reference — scoped to one governed identity, read with an
  explicit `reveal`. If you rely on **env injection**, **integrations/syncs**, **dynamic secrets**, or
  **versioning/rollback**, those are the gaps most likely to matter, and it is reasonable to keep
  Doppler for your own service's build/deploy config while moving *agent-held, per-user* secrets to the
  vault. Also note **`rotate` is not rotation of the value** — it re-wraps the KMS key; the stored
  secret is unchanged.
</Warning>

## Where to go next

* [`vault` primitive](/docs/getting-started/vault) — full put/reveal/list/delete/rotate lifecycle, `kind`, `locked`, `expires_at`
* [`vault` SDK sub-client](/docs/sdk/sub-clients/vault) — typed method signatures
* [`vault` CLI](/docs/cli/vault) — `naive vault put/reveal/list` per user
* [Vault encryption](/docs/architecture/vault-encryption) — envelope encryption, KMS, and the `{ company_id, tenant_user_id }` context
* [Account Kits](/docs/getting-started/account-kits) — enabling/disabling the `vault` primitive per user at execution time
* [Tenant users](/docs/getting-started/users) — the identity that owns the vault, cards, email, and phone
* [Connections](/docs/getting-started/connections) — OAuth grants that surface alongside vault entries in one per-user credential view

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [Secrets management for AI agents](https://usenaive.ai/blog/secrets-management-for-ai-agents) — vault concept post
* [How to store API keys for AI agents](https://usenaive.ai/blog/how-to-store-api-keys-for-ai-agents) — step-by-step vault patterns
