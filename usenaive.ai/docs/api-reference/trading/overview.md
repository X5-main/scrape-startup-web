> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Trading API Reference

> All Trading REST endpoints — link a brokerage account via OAuth2. Connect, account, assets, positions, orders, and market data.

## Overview

Per-user; requires `Authorization: Bearer nv_sk_…`. Each tenant\_user links their
own brokerage account via OAuth; Naive proxies the brokerage's trading API on
their behalf. The same endpoints trade **stocks, options, and crypto** — the
order `symbol` decides the market (`AAPL`, `BTC/USD`, `AAPL241213C00250000`).

Naive is not a broker-dealer or investment adviser and does not exercise trading
discretion — the user directs and approves every order.

Routes are available both company-scoped (`/v1/trading/...`, acting as the
account's default agent profile) and per-user (`/v1/users/:user_id/trading/...`). Gated
by the `trading` primitive in the user's AccountKit.

<Note>
  Money-moving actions (`POST /v1/trading/orders`, `DELETE /v1/trading/orders/:id`,
  `DELETE /v1/trading/positions/:symbol`) are approval-gated by default. An agent
  (API-key) call may return `202 { "status": "pending_approval", "approval_id" }`;
  a human approves it via [Approvals](/docs/api-reference/approvals/overview) and the
  action runs on replay. See [Approvals](/docs/getting-started/approvals).
</Note>

## Endpoints

| Method | Path                            | Description                                       |
| ------ | ------------------------------- | ------------------------------------------------- |
| POST   | `/v1/trading/connect`           | Begin OAuth — returns an `authorize_url`          |
| GET    | `/v1/trading/oauth/callback`    | OAuth redirect target (handled by Naive; no auth) |
| GET    | `/v1/trading/connections`       | List linked environments (paper/live)             |
| DELETE | `/v1/trading/connections/:env`  | Disconnect (forget the stored token)              |
| GET    | `/v1/trading/account`           | Get the connected brokerage account               |
| GET    | `/v1/trading/assets`            | List tradable assets (`?asset_class=`)            |
| GET    | `/v1/trading/positions`         | List open positions                               |
| GET    | `/v1/trading/positions/:symbol` | Get one open position                             |
| DELETE | `/v1/trading/positions/:symbol` | Close (liquidate) a position — **sensitive**      |
| GET    | `/v1/trading/orders`            | List orders (`?status=open\|closed\|all`)         |
| POST   | `/v1/trading/orders`            | Place an order — **sensitive**                    |
| GET    | `/v1/trading/orders/:id`        | Get one order                                     |
| DELETE | `/v1/trading/orders/:id`        | Cancel an open order — **sensitive**              |
| GET    | `/v1/trading/market-data`       | Latest quote(s) (`?symbols=&class=`)              |

All GET/DELETE endpoints accept an optional `?env=paper|live` query param
(required only when both environments are connected). MCP equivalents are
`naive_trading_*`.

## Connect

`POST /v1/trading/connect`

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| `env`     | string | No       | `paper` (default) or `live`                         |
| `scope`   | string | No       | OAuth scopes (default `account:write trading data`) |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/trading/connect \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "env": "paper" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "authorize_url": "https://<brokerage-oauth>/authorize?response_type=code&client_id=...&redirect_uri=...&state=nv_...&scope=account:write%20trading%20data&env=paper",
    "env": "paper",
    "state": "nv_3f2a...",
    "disclosure": "By allowing naive to access your brokerage account, you are granting naive access to your account information and authorization to place transactions in your account at your direction. Naive does not warrant or guarantee that the connected brokerage will work as advertised or expected. Before authorizing, learn more about naive at https://usenaive.ai.",
    "next_steps": [
      { "command": "naive trading connections", "description": "Check the connection status after authorizing" }
    ]
  }
  ```
</ResponseExample>

Show the returned `disclosure` to the user (required at connection time), then
open `authorize_url` in a browser. After the user approves, the brokerage
redirects to `/v1/trading/oauth/callback`, which exchanges the code for a token
and marks the connection `active`. The scope's spaces are `%20`-encoded (the
authorize endpoint rejects the `+` form).

## Place an Order

`POST /v1/trading/orders`

| Parameter                       | Type    | Required | Description                                                        |
| ------------------------------- | ------- | -------- | ------------------------------------------------------------------ |
| `symbol`                        | string  | Yes      | `AAPL`, `BTC/USD`, or an OCC option symbol                         |
| `side`                          | string  | Yes      | `buy` or `sell`                                                    |
| `qty`                           | string  | One of   | Quantity (shares/coins)                                            |
| `notional`                      | string  | One of   | Dollar amount (fractional)                                         |
| `type`                          | string  | No       | `market` (default), `limit`, `stop`, `stop_limit`, `trailing_stop` |
| `time_in_force`                 | string  | No       | `day`, `gtc`, `opg`, `cls`, `ioc`, `fok` (crypto: `gtc`/`ioc`)     |
| `limit_price`                   | string  | Cond.    | Required for `limit` / `stop_limit`                                |
| `stop_price`                    | string  | Cond.    | Required for `stop` / `stop_limit`                                 |
| `trail_price` / `trail_percent` | string  | Cond.    | For `trailing_stop`                                                |
| `order_class`                   | string  | No       | `simple`, `bracket`, `oco`, `oto`                                  |
| `take_profit` / `stop_loss`     | object  | No       | Legs for bracket/OTO orders                                        |
| `extended_hours`                | boolean | No       | Allow extended-hours execution (equities)                          |
| `env`                           | string  | No       | `paper` or `live`                                                  |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/trading/orders \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: order-2026-06-11-001" \
    -d '{
      "symbol": "BTC/USD",
      "notional": "25",
      "side": "buy",
      "type": "market",
      "time_in_force": "gtc"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "38e482f3-79a8-4f75-a057-f07a1ec6a397",
    "symbol": "BTC/USD",
    "asset_class": "crypto",
    "notional": "25",
    "qty": null,
    "side": "buy",
    "type": "market",
    "time_in_force": "gtc",
    "status": "pending_new",
    "submitted_at": "2026-06-11T00:36:51.313Z"
  }
  ```

  ```json 202 theme={"theme":"css-variables"}
  {
    "status": "pending_approval",
    "approval_id": "appr-uuid",
    "action": "trading.order.create",
    "primitive": "trading",
    "title": "Place buy order: 25 BTC/USD",
    "message": "This action requires human approval before it executes."
  }
  ```
</ResponseExample>

The request's `Idempotency-Key` is forwarded as the order's `client_order_id` so
a retried order deduplicates at the broker.

## Close a Position

`DELETE /v1/trading/positions/:symbol`

| Query        | Type   | Description                                  |
| ------------ | ------ | -------------------------------------------- |
| `qty`        | string | Quantity to close (default: entire position) |
| `percentage` | string | Percentage of the position to close          |
| `env`        | string | `paper` or `live`                            |

```bash theme={"theme":"css-variables"}
curl -X DELETE "https://api.usenaive.ai/v1/trading/positions/BTCUSD?percentage=50" \
  -H "Authorization: Bearer nv_sk_live_..."
```

## Market Data

`GET /v1/trading/market-data`

| Query     | Type   | Description                                               |
| --------- | ------ | --------------------------------------------------------- |
| `symbols` | string | Comma-separated symbols, e.g. `BTC/USD,ETH/USD` or `AAPL` |
| `class`   | string | `crypto` (default) or `us_equity`                         |
| `env`     | string | `paper` or `live`                                         |

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/trading/market-data?symbols=BTC/USD,ETH/USD" \
  -H "Authorization: Bearer nv_sk_live_..."
```

## Errors

| Error                    | Cause                                                                                                                                                                             | Recovery                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `feature_not_configured` | Brokerage OAuth app or `ENCRYPTION_KEY` not configured                                                                                                                            | AgentProfile must set the OAuth app credentials + `ENCRYPTION_KEY` |
| `not_configured`         | No active brokerage connection for this user/env                                                                                                                                  | `POST /v1/trading/connect`                                         |
| `unauthorized`           | Brokerage token invalid/revoked (HTTP 401) — connection marked `expired`                                                                                                          | Reconnect via `connect`                                            |
| `forbidden`              | The brokerage rejected the action (HTTP 403) — e.g. crypto order below the **\$10 minimum**, account restricted to liquidation, or scope not granted. The connection stays valid. | Fix the order/scope; the connection is unaffected                  |
| `invalid_input`          | Bad order parameters (other 4xx from the brokerage)                                                                                                                               | Fix params; check asset-class rules                                |
| `provider_error`         | Brokerage upstream error                                                                                                                                                          | Retry; inspect the error `details`                                 |
