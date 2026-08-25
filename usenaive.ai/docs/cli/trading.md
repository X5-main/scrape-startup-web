> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Trading

> Link a brokerage account via OAuth and trade stocks, options & crypto from the CLI.

## Commands

| Command                           | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `naive trading connect`           | Start the brokerage OAuth flow (returns an authorize URL) |
| `naive trading connections`       | List connected environments (paper/live)                  |
| `naive trading disconnect <env>`  | Forget a stored connection                                |
| `naive trading account`           | Show the connected brokerage account                      |
| `naive trading assets`            | List tradable assets                                      |
| `naive trading positions`         | List open positions                                       |
| `naive trading position <symbol>` | Show one open position                                    |
| `naive trading close <symbol>`    | Close (liquidate) a position                              |
| `naive trading orders`            | List orders                                               |
| `naive trading order`             | Place an order                                            |
| `naive trading get-order <id>`    | Show one order                                            |
| `naive trading cancel <id>`       | Cancel an open order                                      |
| `naive trading quote`             | Latest quote(s) for symbols                               |

## Connect an Account

```bash theme={"theme":"css-variables"}
naive trading connect --env paper
```

Returns an `authorize_url` — open it, approve access, and Naive stores the
bearer token. Then confirm:

```bash theme={"theme":"css-variables"}
naive trading connections
naive trading account
```

Use `--env live` for a funded account. A user can connect both; pass `--env` on
each command when both are connected.

## Place an Order

The same command trades every asset class — the symbol selects the market.
Provide either `--qty` or `--notional`.

```bash theme={"theme":"css-variables"}
# Crypto: buy $25 of BTC at market (24/7; time-in-force gtc or ioc)
naive trading order --symbol BTC/USD --notional 25 --side buy --type market --tif gtc

# Stock: buy 2 AAPL with a day limit order
naive trading order --symbol AAPL --qty 2 --side buy --type limit --limit-price 150 --tif day
```

<Note>
  Placing orders, cancelling orders, and closing positions are **sensitive**.
  Depending on the user's Account Kit they may require human approval — the command
  then returns `status: "pending_approval"` and runs only after
  `naive approvals approve <id>`.
</Note>

## Positions

```bash theme={"theme":"css-variables"}
naive trading positions
naive trading position BTCUSD            # crypto position symbols are concatenated
naive trading close BTCUSD               # liquidate the whole position
naive trading close AAPL --percentage 50 # liquidate half
```

## Orders

```bash theme={"theme":"css-variables"}
naive trading orders --status open
naive trading get-order <order-id>
naive trading cancel <order-id>
```

## Market Data

```bash theme={"theme":"css-variables"}
naive trading quote --symbols BTC/USD,ETH/USD          # crypto (default)
naive trading quote --symbols AAPL --class us_equity   # stocks
```

## Asset Classes

```bash theme={"theme":"css-variables"}
# Discover tradable symbols
naive trading assets --asset-class crypto
naive trading assets --asset-class us_equity
naive trading assets --asset-class us_option
```

|         | Stocks            | Crypto       | Options               |
| ------- | ----------------- | ------------ | --------------------- |
| Symbol  | `AAPL`            | `BTC/USD`    | `AAPL241213C00250000` |
| `--tif` | `day`, `gtc`, …   | `gtc`, `ioc` | `day`, `gtc`          |
| Hours   | market + extended | 24/7         | market                |
