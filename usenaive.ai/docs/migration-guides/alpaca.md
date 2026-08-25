> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Alpaca to Naive

> Move agent trading from Alpaca's Trading API to Naive's trading primitive — the same place stocks, options, and crypto orders capability (Naive proxies Alpaca's Trading API v2), but every order runs through one governed identity with execution-time approval on money-moving actions.

<Frame caption="Alpaca's Trading API → the Naive trading primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/alpaca-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=427868bcb5ad839c29d8ce2bcadaa6db" alt="Alpaca" height="28" data-path="migration-guides/logos/alpaca-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/alpaca-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=d06837f2518fd1d06fc2a033426748f9" alt="Alpaca" height="28" data-path="migration-guides/logos/alpaca-dark.svg" />
</Frame>

[Alpaca](https://docs.alpaca.markets) gives an AI agent a brokerage API: read an account, pull
quotes, place/cancel orders, and close positions across **stocks, options, and crypto** — one
endpoint where the order `symbol` decides the market (`AAPL`, `BTC/USD`,
`AAPL241213C00250000`). It does that job well, and the API is mature. But the direct
[Trading API](https://docs.alpaca.markets/docs/trading-api) is also a *separate vendor account*:

* The brokerage lives behind an **`APCA-API-KEY-ID` + `APCA-API-SECRET-KEY`** pair, its own
  dashboard, and its own funding — disconnected from wherever the agent's cards, email, secrets,
  and KYC live.
* One key pair = **one account**. To trade *on behalf of many end-users* you must adopt Alpaca's
  [OAuth2](https://docs.alpaca.markets/docs/using-oauth2-and-trading-api) flow or the
  [Broker API](https://docs.alpaca.markets/docs/about-broker-api) yourself — registering an app,
  exchanging codes for tokens, storing and encrypting each user's token, and isolating per user.
* *"Who let this agent place a \$5,000 order, and what else can it touch?"* is answered in Alpaca
  for trading, and in unrelated systems for everything else. There is **no execution-time approval
  gate** on money-moving actions — a leaked key trades freely until you notice.

Naive's [`trading`](/docs/getting-started/trading) primitive gives the agent the **same** capability —
it literally proxies the **Alpaca Trading API v2** on the user's behalf — but every order is rooted
in **one governed identity**:

* The [tenant user](/docs/getting-started/users) that links the brokerage is the same user that owns its
  [cards](/docs/getting-started/cards), its [email inboxes](/docs/getting-started/email), its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* Naive owns the platform OAuth app and performs the token exchange itself, so you **never touch
  OAuth plumbing, token storage, or per-user isolation** — `connect()` returns an authorize URL and
  Naive stores the bearer token encrypted at rest.
* Whether an agent may place, cancel, or close — and whether each money-moving action **freezes for
  human approval** — is decided by that user's [Account Kit](/docs/getting-started/account-kits) and
  per-agent assignment **at execution time**, not by an API-key scope you manage separately.

This guide maps Alpaca's Trading API to Naive's, shows the smallest working swap, and is explicit
about what does not map yet.

<Note>
  Alpaca is a trademark of Alpaca Securities LLC, used here for identification only. Naive is **not** a broker, broker-dealer, or investment adviser and does not exercise trading discretion — the connected brokerage (Alpaca) is the broker, and the user directs and approves the trades. No endorsement or affiliation is implied beyond the documented Trading API proxy. See the [trading primitive](/docs/getting-started/trading) for the full disclosure.
</Note>

<Info>
  **Tested against:** the Alpaca Node helper library
  [`@alpacahq/alpaca-trade-api`](https://www.npmjs.com/package/@alpacahq/alpaca-trade-api) **v3.1.3**
  against the Alpaca **Trading API v2** (paper base `https://paper-api.alpaca.markets`, live base
  `https://api.alpaca.markets`, data base `https://data.alpaca.markets`, docs snapshot June 2026),
  and the Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base
  `https://api.usenaive.ai/v1`, docs snapshot June 2026).

  Version notes:

  * **Order schema is shared.** Naive forwards the same Trading-API order fields Alpaca documents —
    `symbol`, `qty`/`notional`, `side`, `type`, `time_in_force`, `limit_price`, `stop_price`,
    `order_class`, `extended_hours`, `client_order_id`. The before/after below is close to a rename.
  * **Auth model differs.** Alpaca's direct Trading API authenticates with a static key pair for
    **one** account. Naive uses Alpaca's **OAuth2 Connect** flow per user: `trading.connect({ env })`
    returns an `authorize_url`; Naive exchanges the code (scope `account:write trading data`) and
    stores the token. A user may link **paper and/or live** (`env: "paper" | "live"`).
  * **Money-moving actions are approval-gated by default** on Naive (`createOrder`, `cancelOrder`,
    `closePosition`) — Alpaca's Trading API has no equivalent. See
    [gain #2](#gain-2-execution-time-permission-enforcement).
  * **No equivalent yet** for Alpaca's Broker API (opening/funding brokerage accounts), real-time
    streaming, historical market data, order *replace*, watchlists, or portfolio history — see
    [what doesn't map yet](#what-does-not-map-yet).
</Info>

## Concept map

| Alpaca                                                                                              | Naive                                                                                        | Notes                                                                                                              |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `new Alpaca({ keyId, secretKey, paper })`                                                           | `new Naive({ apiKey })` then `naive.forUser(id)`                                             | Server-side credential in both cases                                                                               |
| `APCA-API-KEY-ID` / `APCA-API-SECRET-KEY` — one brokerage account, isolated from your other vendors | [tenant user](/docs/getting-started/users) via `naive.forUser(id)` — scopes **every** primitive   | The core consolidation win                                                                                         |
| **You build** OAuth2 (`/oauth/authorize` → `/oauth/token`) + token storage for multi-user           | `trading.connect({ env })` → `authorize_url` (Naive owns the OAuth app and stores the token) | Naive performs the code-for-token exchange and encrypts the token at rest                                          |
| `paper: true` / `APCA_API_BASE_URL` selects paper vs live                                           | `env: "paper" \| "live"` per call (link both, pass `env`)                                    | Same two environments                                                                                              |
| `alpaca.getAccount()` → `GET /v2/account`                                                           | `client.trading.account({ env })`                                                            | Read the connected account                                                                                         |
| `alpaca.getAssets({ asset_class })` → `GET /v2/assets`                                              | `client.trading.assets({ assetClass })`                                                      | Tradable instruments                                                                                               |
| `alpaca.getPositions()` → `GET /v2/positions`                                                       | `client.trading.positions({ env })`                                                          | Open positions                                                                                                     |
| `alpaca.getPosition(symbol)`                                                                        | `client.trading.position(symbol)`                                                            | One position                                                                                                       |
| `alpaca.getOrders({ status })` → `GET /v2/orders`                                                   | `client.trading.orders({ status, limit })`                                                   | List orders                                                                                                        |
| `alpaca.getOrder(id)`                                                                               | `client.trading.getOrder(id)`                                                                | One order                                                                                                          |
| `alpaca.getLatestQuotes(...)` / `getLatestCryptoQuotes(...)` (data API)                             | `client.trading.quote(symbols, { assetClass })`                                              | **Latest** quote(s) only — no history (see [gaps](#what-does-not-map-yet))                                         |
| `alpaca.createOrder({ ... })` → `POST /v2/orders`                                                   | `client.trading.createOrder({ ... })` **(sensitive)**                                        | Identical fields; may return a `PendingApproval`                                                                   |
| `alpaca.cancelOrder(id)` → `DELETE /v2/orders/{id}`                                                 | `client.trading.cancelOrder(id)` **(sensitive)**                                             | May return a `PendingApproval`                                                                                     |
| `alpaca.closePosition(symbol)` → `DELETE /v2/positions/{symbol}`                                    | `client.trading.closePosition(symbol, { qty, percentage })` **(sensitive)**                  | May return a `PendingApproval`                                                                                     |
| **API-key scopes** for least-privilege                                                              | **Account Kit** `trading` primitive + per-agent assignment                                   | Permission is execution-time policy on the identity — see [gain #2](#gain-2-execution-time-permission-enforcement) |
| `client_order_id` for dedupe                                                                        | `client_order_id` on the order body, or `Idempotency-Key` header on REST                     | Naive forwards `client_order_id` when set; otherwise the request's `Idempotency-Key` becomes `client_order_id`     |
| **OAuth app approval** for live trading                                                             | Same gate — live needs the brokerage app approved                                            | Paper works for development                                                                                        |
| `alpaca.replaceOrder(id, ...)` → `PATCH /v2/orders/{id}`                                            | —                                                                                            | No modify-in-place; cancel + re-place                                                                              |
| **Broker API** (create/fund/KYC brokerage accounts)                                                 | —                                                                                            | Naive uses the *Connect* model — the user brings their own account                                                 |
| **Streaming** (`trade_updates`, market-data websocket)                                              | —                                                                                            | Poll `orders` / `positions`; no event stream                                                                       |
| **Historical market data** (bars, trades, news, snapshots)                                          | —                                                                                            | `quote` is latest only                                                                                             |
| **Watchlists, portfolio history, account activities, calendar/clock**                               | —                                                                                            | No equivalent endpoints                                                                                            |

## Before / after: the core path

The path that matters for almost every trading agent is *read the account, then place an order*.
Here it is on both platforms.

<CodeGroup>
  ```ts Alpaca theme={"theme":"css-variables"}
  import Alpaca from "@alpacahq/alpaca-trade-api";

  // One account behind a static key pair (paper here).
  const alpaca = new Alpaca({
    keyId: process.env.APCA_API_KEY_ID!,
    secretKey: process.env.APCA_API_SECRET_KEY!,
    paper: true,
  });

  // 1. Read the account (GET /v2/account)
  const account = await alpaca.getAccount();

  // 2. Place an order (POST /v2/orders) — runs immediately, no approval gate.
  const order = await alpaca.createOrder({
    symbol: "BTC/USD",
    notional: 25,           // qty OR notional
    side: "buy",
    type: "market",
    time_in_force: "gtc",
  });
  // → order.id, order.status

  // To serve many end-users you must build the OAuth2 flow yourself
  // (/oauth/authorize → /oauth/token) and store + encrypt each user's token.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive, isPendingApproval } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("alice"); // same id space as your own users

  // 0. One-time: link the user's brokerage via OAuth (Naive owns the app).
  //    Open authorize_url in a browser; Naive stores the token encrypted.
  const { authorize_url } = await client.trading.connect({ env: "paper" });

  // 1. Read the account (proxies GET /v2/account)
  const account = await client.trading.account({ env: "paper" });

  // 2. Place an order (proxies POST /v2/orders) — SENSITIVE: may freeze for
  //    human approval depending on the user's Account Kit.
  const res = await client.trading.createOrder({
    symbol: "BTC/USD",
    notional: "25",         // qty OR notional
    side: "buy",
    type: "market",
    time_in_force: "gtc",
    env: "paper",
  });
  if (isPendingApproval(res)) {
    await client.approvals.wait(res.approval_id); // runs only after a human approves
  }
  // → order id, status
  ```
</CodeGroup>

The order shape lines up almost exactly. The real differences to plan for:

* **One-time `connect`, not a static key.** Alpaca's direct API authenticates with a key pair for a
  single account. Naive links each user's brokerage once via OAuth and proxies thereafter — you
  never store or encrypt the token.
* **Money-moving actions can defer.** `createOrder`, `cancelOrder`, and `closePosition` are in
  Naive's default approval set. Handle `isPendingApproval(res)` and
  [`approvals.wait`](/docs/getting-started/approvals); reads (`account`, `positions`, `orders`, `quote`)
  never defer.
* **`env` rides on the call.** Where Alpaca picks paper/live at client construction, Naive takes
  `env` per call (a user can link both).
* **The id is your identity, not a separate account.** In Alpaca the key pair scopes *Alpaca*. In
  Naive the same `forUser(id)` handle also owns the agent's cards, email, vault, and KYC.

### Stocks, options, and crypto

The same `createOrder` endpoint trades every asset class on both platforms — the `symbol` selects
the market. The field names are identical.

<CodeGroup>
  ```ts Alpaca theme={"theme":"css-variables"}
  // Stock: limit order, good-for-day
  await alpaca.createOrder({
    symbol: "AAPL", qty: 2, side: "buy",
    type: "limit", limit_price: 150, time_in_force: "day",
  });
  ```

  ```ts Naive theme={"theme":"css-variables"}
  // Stock: limit order, good-for-day (SENSITIVE)
  const res = await client.trading.createOrder({
    symbol: "AAPL", qty: 2, side: "buy",
    type: "limit", limit_price: 150, time_in_force: "day", env: "paper",
  });
  if (isPendingApproval(res)) await client.approvals.wait(res.approval_id);
  ```
</CodeGroup>

* **Crypto** (`BTC/USD`) trades 24/7 with `time_in_force` `gtc`/`ioc`; the brokerage may enforce
  minimum order sizes for crypto — see [trading](/docs/getting-started/trading) and Alpaca's docs.
* **Options** use OCC symbols (`AAPL241213C00250000`); crypto trading must be enabled on the user's
  brokerage account (`trading.account()` → `crypto_status`) — Naive surfaces it but does not toggle
  it.

## Minimal viable migration

The smallest swap that keeps a working agent running is *connect* + *read* + *place/cancel/close*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
  </Step>

  <Step title="Link the brokerage once (replaces your key pair / OAuth code)">
    Replace `new Alpaca({ keyId, secretKey, paper })` with `naive.forUser(id).trading.connect({ env })`.
    Open the returned `authorize_url`; Naive exchanges the code and stores the token. Drop any
    hand-built OAuth callback, token table, and encryption — Naive owns all of it. Confirm with
    `client.trading.connections()` (status `active`).
  </Step>

  <Step title="Swap reads">
    Map `getAccount` → `trading.account`, `getPositions` → `trading.positions`,
    `getOrders` → `trading.orders`, `getLatestQuotes`/`getLatestCryptoQuotes` → `trading.quote`.
    These never require approval.
  </Step>

  <Step title="Swap money-moving actions">
    Map `createOrder` → `trading.createOrder` (same fields), `cancelOrder` → `trading.cancelOrder`,
    `closePosition` → `trading.closePosition`. Wrap each in `isPendingApproval(res)` +
    `client.approvals.wait(res.approval_id)` so a deferred action resumes after a human approves.
  </Step>

  <Step title="Keep idempotency">
    If you set `client_order_id` for dedupe, pass it on `createOrder` directly — or, on raw REST,
    send an `Idempotency-Key` header when `client_order_id` is omitted. Naive uses
    `client_order_id` when provided; otherwise it forwards the `Idempotency-Key` as
    `client_order_id`, so a retried logical order can deduplicate at the broker.
  </Step>

  <Step title="Ship it">
    At this point you are off Alpaca's direct API for the core trade path. Everything below is
    upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In Alpaca, the key pair isolates **a brokerage account
and nothing else**, and money-moving actions run the instant a key is used. On Naive, the unit of
isolation is a **tenant user**, and every order is governed by that identity's policy at execution
time.

<CodeGroup>
  ```ts Alpaca (key pair / DIY OAuth — trading only) theme={"theme":"css-variables"}
  // One account per key pair; to go multi-user you build OAuth + token storage.
  const alpaca = new Alpaca({ keyId, secretKey, paper: true });
  await alpaca.createOrder({ symbol: "BTC/USD", notional: 25, side: "buy", type: "market", time_in_force: "gtc" });

  // The card, the vault secrets, the email inbox, the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy — and nothing
  // stops the key from placing an order the moment it leaks.
  ```

  ```ts Naive (tenant user — the whole stack, governed) theme={"theme":"css-variables"}
  // One tenant user per customer; isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  await client.trading.connect({ env: "paper" }); // link once
  const res = await client.trading.createOrder({
    symbol: "BTC/USD", notional: "25", side: "buy", type: "market", time_in_force: "gtc", env: "paper",
  });
  if (isPendingApproval(res)) await client.approvals.wait(res.approval_id);

  // The SAME client owns this customer's card, email inbox, vault, and KYC —
  // one identity, isolated end to end, every order governed by its Account Kit.
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await client.email.createInbox({ local_part: "ops" });
  await client.vault.put("internal.api_key", "key_xyz");
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With Alpaca, the agent's brokerage is an island behind a key pair. With Naive,
  `naive.forUser(acme.id)` is a single handle to **trading *and* cards *and* email *and* vault *and*
  KYC**.
* Tear the customer down from one place; sibling tenants should not be able to read each other's orders,
  positions, cards, or secrets. The brokerage token is stored encrypted at rest and is never handed
  to the agent.

### Gain #2 — execution-time permission enforcement

* Whether an agent may trade at all is the `trading` primitive on the user's **Account Kit**, and
  whether each order **freezes for human review** is `requiresApproval` policy — not a check you
  hand-write and not an Alpaca key scope you manage separately.

```ts theme={"theme":"css-variables"}
// Trading enabled, but every money-moving action freezes for human approval.
const desk = await naive.accountKits.create({
  name: "Trading desk",
  primitives_config: {
    trading: { enabled: true, requiresApproval: true }, // place/cancel/close → approval
    cards:   { enabled: false },                          // no card for this tier
  },
});
await naive.accountKits.assignUser(desk.id, acme.id);
```

* The agent's code is identical for every tier — `client.trading.createOrder({ ... })`. Whether the
  order runs is decided at execution time:
  * A user whose Account Kit does not enable `trading` is refused with `forbidden`, with no code
    change on your side.
  * With `trading.requiresApproval: true`, `createOrder` / `cancelOrder` / `closePosition` return
    `202 { status: "pending_approval" }` and the broker call replays **only** after a human
    [approves](/docs/getting-started/approvals). Reads (`account`, `positions`, `quote`) are never gated.
  * This is a key governance difference for money-moving actions: a leaked Alpaca key can trade
    immediately; a Naive agent's trades are subject to Account Kit policy and optional approval.

### Gain #3 — unified accountability

* Every connect, order, cancel, and close for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their card, email, vault, and KYC events, not
  in a separate Alpaca dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent do, for whom?" — trading, cards, email, vault, one timeline
```

* That is the question that is hard to answer when trading lives in Alpaca, cards live in Stripe,
  and secrets live somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (connect → read →
place/cancel/close) maps cleanly across **stocks, options, and crypto**, but the following Alpaca
capabilities have **no direct equivalent** on Naive's trading primitive today. Check this list
against your app before you commit.

| Alpaca feature                                                                                  | Status on Naive                                                   | Workaround                                                                                              |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Broker API** (open / fund / KYC brokerage accounts, ACH, journals, fully-disclosed/omnibus)   | Not provided                                                      | Naive uses the OAuth **Connect** model — the user brings their own brokerage account                    |
| **Real-time streaming** (`trade_updates`, market-data websocket)                                | Not provided                                                      | Poll `trading.orders` / `trading.positions`; no event stream for fills                                  |
| **Historical market data** (bars, trades, news, snapshots, corporate actions)                   | Not provided — `quote` is latest only                             | Keep a data vendor (or Alpaca's data API) for history/backtests                                         |
| **Order replace** (`PATCH /v2/orders/{id}`)                                                     | Not provided                                                      | `cancelOrder` then `createOrder` with new terms                                                         |
| **Cancel-all / close-all** (`DELETE /v2/orders`, `DELETE /v2/positions`)                        | Per-order / per-symbol only                                       | Loop over `orders` / `positions` and cancel/close individually                                          |
| **Watchlists, portfolio history, account activities, account configurations, calendar & clock** | No equivalent endpoints                                           | Track in your own app                                                                                   |
| **Advanced order classes detail** (`bracket` / `oco` / `oto` legs, `trailing_stop`)             | Forwarded fields exist; not all combinations validated end-to-end | Test the specific class on **paper** before relying on it                                               |
| **Live trading without app approval**                                                           | Different model                                                   | The brokerage OAuth app must be approved for **live** (same as Alpaca); **paper** works for development |

<Warning>
  If your agent needs the **Broker API** (you open and fund accounts for users), **real-time fill
  streaming**, **historical market data**, or **order replace**, those are the gaps most likely to
  matter — Naive proxies the Alpaca **Trading API v2** for an account the user **connects**, not a
  brokerage you operate. Equally, note the **model inversion**: Alpaca's direct key trades the instant
  it is used, while Naive routes every money-moving action through an Account Kit that can **freeze it
  for human approval**. That governance *is* the gain — but it is a real behavior change your agent
  code must handle (`isPendingApproval` + `approvals.wait`).
</Warning>

## Where to go next

* [`trading` primitive](/docs/getting-started/trading) — full connect/account/order/position lifecycle + governance
* [`trading` SDK sub-client](/docs/sdk/sub-clients/trading) — typed method signatures
* [`trading` CLI](/docs/cli/trading) — connect, account, order, positions, quote
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the
  policy model behind execution-time governance and money-moving approval
* [Tenant users](/docs/getting-started/users) — the identity that owns the brokerage link, cards, email, and vault
* [Cards](/docs/getting-started/cards), [Email](/docs/getting-started/email), [Vault](/docs/getting-started/vault) —
  the sibling primitives the same identity owns

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Robo Advisor](https://usenaive.ai/blog/how-to-build-an-agentic-robo-advisor) — trading agent tutorial
