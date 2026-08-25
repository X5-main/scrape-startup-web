> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Trading

> Link a brokerage account via OAuth and trade stocks, options, and crypto — account, assets, positions, orders, and market data, with human-in-the-loop approval on money-moving actions.

The Trading primitive links a user's brokerage account via an OAuth2
**Connect** flow. Each user authorizes their own brokerage account (paper and/or
live); Naive performs the token exchange and proxies the brokerage's trading API
on their behalf — so you never touch OAuth plumbing, token storage, or per-user
isolation. One primitive trades **stocks, options, and crypto**: the order
`symbol` decides the market (`AAPL`, `BTC/USD`, `AAPL241213C00250000`).

<Note>
  Naive is **not** the broker, a broker-dealer, or an investment adviser, and does
  not exercise trading discretion — the connected brokerage is the broker. Naive is
  a governed gateway in front of your users' own brokerage accounts: the user
  directs and approves the trades. Money-moving actions (place/cancel order, close
  position) are approval-gated by default — see [Approvals](/docs/getting-started/approvals).
</Note>

## CLI First

```bash theme={"theme":"css-variables"}
# 1. Link a brokerage account (returns an authorize URL to open)
naive trading connect --env paper

# 2. Once authorized, read the account and trade
naive trading account
naive trading order --symbol BTC/USD --notional 25 --side buy --type market --tif gtc
naive trading positions
```

## How the OAuth connection works

Naive owns a single platform OAuth app registered with the brokerage. `connect`
returns an `authorize_url`; the user opens it, approves access, and the brokerage
redirects back to Naive's callback, which exchanges the code for a bearer token
and stores it encrypted. The token is then used to call the brokerage's trading
API for that user.

<Steps>
  <Step title="Start the flow">
    ```bash theme={"theme":"css-variables"}
    naive trading connect --env paper
    ```

    Returns `{ "authorize_url": "https://<brokerage-oauth>/authorize?...", "env": "paper" }`.
  </Step>

  <Step title="User authorizes">
    Open the `authorize_url` and approve access. The brokerage redirects to
    Naive's callback (`/v1/trading/oauth/callback`), which stores the token.
  </Step>

  <Step title="Confirm and trade">
    ```bash theme={"theme":"css-variables"}
    naive trading connections   # status: "active"
    naive trading account
    ```
  </Step>
</Steps>

<Info>
  Use `--env paper` for paper trading and `--env live` for a funded account. A
  user can connect both; when both are connected, pass `--env` (or `env`) on each
  call. OAuth access tokens are long-lived (there is no refresh token); if access
  is ever revoked, calls return `unauthorized` and you simply reconnect.
</Info>

<Note>
  **Disclosure.** A disclosure must be shown to the user at connection time.
  `POST /v1/trading/connect` returns it as a `disclosure` field (and the dashboard
  renders it as an "Authorize naive" consent step before redirecting). Display it
  before sending the user to the authorize URL.
</Note>

## Tools

| Tool                     | Type             | Description                                               |
| ------------------------ | ---------------- | --------------------------------------------------------- |
| `trading_connect`        | Setup            | Start the brokerage OAuth flow (returns an authorize URL) |
| `trading_connections`    | Setup            | List linked environments (paper/live) and status          |
| `trading_disconnect`     | Setup            | Forget a stored connection                                |
| `trading_account`        | Read             | Get the connected brokerage account                       |
| `trading_assets`         | Read             | List tradable assets (filter by asset class)              |
| `trading_positions`      | Read             | List open positions                                       |
| `trading_position`       | Read             | Get one open position                                     |
| `trading_orders`         | Read             | List orders                                               |
| `trading_get_order`      | Read             | Get one order                                             |
| `trading_quote`          | Read             | Latest quote(s) for symbols                               |
| `trading_create_order`   | Core (sensitive) | Place an order                                            |
| `trading_cancel_order`   | Core (sensitive) | Cancel an open order                                      |
| `trading_close_position` | Core (sensitive) | Close (liquidate) a position                              |

## Placing orders

The same endpoint trades every asset class — the `symbol` selects the market.
Provide either `qty` (shares/coins) or `notional` (dollar amount).

<CodeGroup>
  ```bash crypto theme={"theme":"css-variables"}
  # Buy $25 of BTC at market (crypto trades 24/7; time_in_force gtc or ioc)
  naive trading order --symbol BTC/USD --notional 25 --side buy --type market --tif gtc
  ```

  ```bash stock theme={"theme":"css-variables"}
  # Buy 2 shares of AAPL with a limit order, good-for-day
  naive trading order --symbol AAPL --qty 2 --side buy --type limit --limit-price 150 --tif day
  ```
</CodeGroup>

Via the API:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/trading/orders \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "symbol": "BTC/USD",
      "notional": "25",
      "side": "buy",
      "type": "market",
      "time_in_force": "gtc"
    }'
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  import { Naive, isPendingApproval } from "@usenaive-sdk/server";
  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY });

  const res = await naive.forUser("alice").trading.createOrder({
    symbol: "BTC/USD", notional: "25", side: "buy", type: "market", time_in_force: "gtc",
  });
  if (isPendingApproval(res)) {
    // Gated by the user's Account Kit — wait for a human to approve.
    await naive.forUser("alice").approvals.wait(res.approval_id);
  }
  ```
</CodeGroup>

### Order parameters

| Parameter        | Type    | Description                                                               |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| `symbol`         | string  | Asset symbol — `AAPL`, `BTC/USD`, or an OCC option symbol                 |
| `side`           | string  | `buy` or `sell`                                                           |
| `qty`            | string  | Quantity (shares/coins). Use `qty` **or** `notional`                      |
| `notional`       | string  | Dollar amount (fractional). Use `notional` **or** `qty`                   |
| `type`           | string  | `market` (default), `limit`, `stop`, `stop_limit`, `trailing_stop`        |
| `time_in_force`  | string  | `day`, `gtc`, `opg`, `cls`, `ioc`, `fok`. **Crypto** supports `gtc`/`ioc` |
| `limit_price`    | string  | Required for `limit` / `stop_limit`                                       |
| `stop_price`     | string  | Required for `stop` / `stop_limit`                                        |
| `order_class`    | string  | `simple`, `bracket`, `oco`, `oto` (equities)                              |
| `extended_hours` | boolean | Allow execution during extended hours (equities)                          |
| `env`            | string  | `paper` or `live` (required if both are connected)                        |

<Note>
  Naive sends the request's `Idempotency-Key` as the order's `client_order_id`, so
  a retried logical order deduplicates at the broker.
</Note>

## Asset class differences

|                 | Stocks                 | Crypto                          | Options               |
| --------------- | ---------------------- | ------------------------------- | --------------------- |
| Symbol          | `AAPL`                 | `BTC/USD`                       | `AAPL241213C00250000` |
| Order types     | all                    | `market`, `limit`, `stop_limit` | all                   |
| `time_in_force` | `day`, `gtc`, …        | `gtc`, `ioc`                    | `day`, `gtc`          |
| Hours           | market + extended      | 24/7                            | market                |
| Fractional      | yes (`notional`/`qty`) | yes                             | no                    |

<Info>
  Crypto trading must be enabled on the user's brokerage account (the crypto
  agreement signed). Check `trading_account` → `crypto_status`. Naive surfaces this
  but does not toggle it — it's an account-level setting on the brokerage.
</Info>

<Note>
  The brokerage enforces a **\$10 minimum** per crypto order. An order below it is
  rejected with a `forbidden` error (`"cost basis must be >= minimal amount of
    order 10"`) — the connection stays valid; just resize the order.
</Note>

## Positions & orders

```bash theme={"theme":"css-variables"}
# Positions
naive trading positions
naive trading position BTCUSD          # crypto position symbols are concatenated
naive trading close BTCUSD             # liquidate (SENSITIVE)
naive trading close AAPL --percentage 50

# Orders
naive trading orders --status open
naive trading get-order <order-id>
naive trading cancel <order-id>        # SENSITIVE
```

## Market data

```bash theme={"theme":"css-variables"}
naive trading quote --symbols BTC/USD,ETH/USD            # crypto (default)
naive trading quote --symbols AAPL --class us_equity     # stocks
```

## Governance

`trading.order.create`, `trading.order.cancel`, and `trading.position.close` are
in the default approval set. For a real end-user (not the account's own default
agent profile), an agent (API-key) call returns `202 { "status": "pending_approval" }`
and the action runs only after a human approves it in
[Approvals](/docs/getting-started/approvals). AgentProfiles can opt in/out per Account Kit
via `primitives_config.trading.requiresApproval`.

## Connection statuses

| Status    | Meaning                                            |
| --------- | -------------------------------------------------- |
| `pending` | OAuth started, awaiting authorization              |
| `active`  | Connected and ready to trade                       |
| `expired` | The brokerage rejected the token (401) — reconnect |
| `failed`  | Token exchange failed                              |

Disconnecting (`DELETE /v1/trading/connections/:env`) removes the stored
connection entirely; reconnecting creates a fresh one.

## Configuration

The trading primitive requires the platform OAuth app credentials + an
encryption key on the API:

| Setting                         | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| Brokerage OAuth app credentials | Client ID + secret for the platform's brokerage OAuth app                 |
| OAuth redirect URI              | Whitelisted callback (defaults to `${API_URL}/v1/trading/oauth/callback`) |
| Encryption key                  | 64-char hex key used to encrypt stored tokens at rest                     |

<Note>
  Your brokerage OAuth app must be approved before it can execute **live** trades;
  paper works for development.
</Note>
