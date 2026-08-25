> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Payments

> Pay for x402 resources with the agent's crypto wallet — quote, pay, and reconcile receipts from the CLI

## Commands

| Command                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `naive payments quote`    | Probe an x402 URL for its price — no side effects  |
| `naive payments pay`      | Pay for and fetch an x402 resource — **sensitive** |
| `naive payments receipts` | List x402 payment receipts                         |

<Note>
  The wallet is **per-agent**, so these commands need an active user
  (`naive use <alice>`). Unlike cards, there is no company-level fallback mount.
</Note>

## Quote

```bash theme={"theme":"css-variables"}
naive payments quote --url https://api.example.com/report
naive payments quote --url https://api.example.com/report --method POST
```

Probes the URL and returns its payment requirements without paying. **Zero side
effects** — the wallet is not even loaded, so this is the safe way to learn a
price.

If the resource is not paywalled, returns `free: true` with the real HTTP status.

<Warning>
  The `accepts[].amount` in a quote is in **atomic** units. USDC has 6 decimals, so
  `500000` = **0.50 USDC**. `--max-amount` on `pay` is a **decimal** amount
  (`0.50`), not atomic units.
</Warning>

## Pay

```bash theme={"theme":"css-variables"}
naive payments pay --url https://api.example.com/report
naive payments pay --url https://api.example.com/report --max-amount 0.50
naive payments pay --url https://api.example.com/report --method POST
```

Fetches the resource; if it returns `402`, signs a USDC payment from the agent's
wallet, retries the request once with the payment attached, and returns the
resource body plus a receipt.

| Flag                    | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `--url <url>`           | The x402 resource URL (required)                                      |
| `--max-amount <amount>` | Refuse to pay more than this — a per-call ceiling in **decimal** USDC |
| `--method <method>`     | HTTP method (default `GET`)                                           |

**Sensitive — this spends real USDC.** There is deliberately no approval queue.
What bounds a payment:

1. The wallet **balance** — an agent cannot spend what isn't there.
2. **`perTxMax`** — enforced at runtime *and* as a static policy inside the
   custody plane at signing time. Set it with `naive wallet policy`.
3. **`dailyBudget`** (optional) — a rolling runtime counter.
4. **`--max-amount`** — a ceiling on this one call. The effective cap is
   `min(--max-amount, perTxMax)`.

If the resource returns something other than `402`, no payment is made — the
response comes back with `paid: false` and no receipt.

## Receipts

```bash theme={"theme":"css-variables"}
naive payments receipts
naive payments receipts --direction buy --limit 10
naive payments receipts --origin https://api.example.com
naive payments receipts --since 2026-07-01T00:00:00Z
```

| Flag                      | Description                                  |
| ------------------------- | -------------------------------------------- |
| `--direction <direction>` | `buy` (paid out) or `sell` (received)        |
| `--origin <origin>`       | Filter to one resource origin                |
| `--since <iso>`           | Only receipts at/after an ISO-8601 timestamp |
| `--limit <n>`             | Max receipts to return                       |

Every settled x402 payment is recorded here, each linking the payment to its
onchain transaction (`txHash`). Amounts on a receipt are **decimal** USDC
strings.
