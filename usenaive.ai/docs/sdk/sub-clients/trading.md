> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# trading

> Per-user brokerage trading (stocks, options, crypto) via OAuth.

Available on the root (default user) and `naive.forUser(id)`. Links a user's
brokerage account via an OAuth2 Connect flow — `connect()` returns an authorize
URL the user opens to grant access; Naive stores the bearer token and proxies
the brokerage's trading API at the user's direction. Naive is not a broker-dealer
and does not exercise trading discretion.

```ts theme={"theme":"css-variables"}
import { Naive, isPendingApproval } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// 1. Connect (open authorize_url in a browser to authorize)
const { authorize_url } = await naive.forUser(alice.id).trading.connect({ env: "paper" });

// 2. Read state (no approval required)
await naive.forUser(alice.id).trading.account();
await naive.forUser(alice.id).trading.positions();
await naive.forUser(alice.id).trading.assets({ assetClass: "crypto" });
await naive.forUser(alice.id).trading.quote("BTC/USD,ETH/USD");

// 3. Trade — works for stocks, options, and crypto (symbol decides the market)
const res = await naive.forUser(alice.id).trading.createOrder({
  symbol: "BTC/USD", notional: "25", side: "buy", type: "market", time_in_force: "gtc",
});
if (isPendingApproval(res)) {
  await naive.forUser(alice.id).approvals.wait(res.approval_id);
}

// Stocks use a ticker + day/gtc time-in-force
await naive.forUser(alice.id).trading.createOrder({
  symbol: "AAPL", qty: 2, side: "buy", type: "limit", limit_price: 150, time_in_force: "day",
});

// Manage
await naive.forUser(alice.id).trading.orders({ status: "open" });
await naive.forUser(alice.id).trading.cancelOrder(orderId);
await naive.forUser(alice.id).trading.closePosition("BTCUSD", { percentage: 50 });
```

## Methods

| Method                                               | Sensitive | Description                                           |
| ---------------------------------------------------- | --------- | ----------------------------------------------------- |
| `connect({ env?, scope? })`                          | —         | Start OAuth; returns `{ authorize_url, env, state }`  |
| `connections()`                                      | —         | List connected environments and status                |
| `disconnect(env)`                                    | —         | Forget a stored connection                            |
| `account({ env? })`                                  | —         | Get the connected brokerage account                   |
| `assets({ env?, assetClass?, status? })`             | —         | List tradable assets                                  |
| `positions({ env? })`                                | —         | List open positions                                   |
| `position(symbol, { env? })`                         | —         | Get one open position                                 |
| `orders({ env?, status?, limit? })`                  | —         | List orders                                           |
| `getOrder(orderId, { env? })`                        | —         | Get one order                                         |
| `quote(symbols, { assetClass?, env? })`              | —         | Latest quote(s)                                       |
| `createOrder(input)`                                 | ✓         | Place an order — may return a `PendingApproval`       |
| `cancelOrder(orderId, { env? })`                     | ✓         | Cancel an open order — may return a `PendingApproval` |
| `closePosition(symbol, { env?, qty?, percentage? })` | ✓         | Close a position — may return a `PendingApproval`     |

Sensitive methods are gated by the `trading` primitive's approval policy in the
user's AccountKit. Use `isPendingApproval(res)` to detect a deferred action and
`naive.forUser(id).approvals.wait(approval_id)` to await the human decision.

The toolset returned by `agentTools()` also exposes a `trading` primitive
(`connect`, `account`, `positions`, `orders`, `create_order`, `cancel_order`,
`close_position`, …) for drop-in Anthropic tool use.

Gated by the `trading` primitive in the user's AccountKit.
