> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Payments

> Give each agent its own crypto wallet and let it pay for x402-paywalled resources in USDC — quote, pay, and reconcile receipts, with the spend cap enforced inside the custody plane.

x402 is the HTTP 402 payment protocol. A paywalled resource answers a request
with `402 Payment Required` and a `payment-required` header describing what it
accepts. The Payments primitive gives each agent its **own crypto wallet** (USDC
on Base) and lets it settle those 402s autonomously: quote the price, sign a
USDC payment, retry the request, keep the receipt.

<Note>
  Payments is **opt-in**. Unlike most primitives it is disabled in a fresh
  AccountKit and must be enabled explicitly — see
  [Account Kits](/docs/architecture/account-kits). The wallet is **per-agent**: there is
  no company-level fallback mount, so CLI and API calls need a subject
  (`naive use <user>`).
</Note>

## CLI First

```bash theme={"theme":"css-variables"}
# The wallet is per-agent — select one first
naive use alice

# 1. Probe the price (zero side effects — the wallet is not even loaded)
naive payments quote --url https://api.example.com/report

# 2. Pay for and fetch the resource
naive payments pay --url https://api.example.com/report --max-amount 0.50

# 3. Reconcile
naive payments receipts --direction buy --limit 10
naive wallet balance
```

## Tools

| Tool                      | Type     | Description                                                          |
| ------------------------- | -------- | -------------------------------------------------------------------- |
| `naive_payments_quote`    | Core     | Probe an x402 URL for its price without paying                       |
| `naive_payments_pay`      | Core     | Pay for and fetch an x402 resource — **sensitive**, spends real USDC |
| `naive_payments_receipts` | Tracking | List x402 payment receipts                                           |
| `naive_wallet_balance`    | Read     | Read the agent's USDC balances                                       |

<Info>
  The wallet's admin verbs (`fund`, `transfer`, `policy`, `sweep`) are deliberately
  **not** MCP tools and **not** in the SDK — they are the operator surface only. See
  [Governance](#governance).
</Info>

## Pricing

| Action                                            | Credits |
| ------------------------------------------------- | ------- |
| A settled x402 payment, managed (CDP) custody     | 0.4     |
| A settled x402 payment, any other custody         | Free    |
| `naive_payments_quote`, `naive_payments_receipts` | Free    |

The 0.4 credits (\$0.02) is the cost of the two custody-plane operations a
settlement takes — a signature and a broadcast — on managed CDP custody. It is a
flat per-payment fee on top of the USDC paid to the resource and its gas, not a
percentage of the payment, so it is far below the 1–1.5% that stablecoin payment
processors charge.

Wallets that are not on managed custody don't reach the custody plane, so they
cost nothing and are billed nothing. Quoting is free, a failed payment is not
billed, and a replayed settlement is billed once.

## How it works

`pay` is the full buy-side flow. `quote` runs only the first two steps, which is
why it has no side effects at all.

<Steps>
  <Step title="Fetch">
    The resource is fetched normally. If it returns anything other than `402`,
    nothing was paywalled — `pay` returns the body with `paid: false` and no
    receipt is written.
  </Step>

  <Step title="Read the requirements">
    On a `402`, the `payment-required` header is decoded into a list of
    `accepts` options (amount, asset, network, `payTo`).
  </Step>

  <Step title="Select under policy">
    The options are filtered against the wallet's `perTxMax`, the per-call
    `max_amount`, and the allowed networks. The effective cap is
    `min(max_amount, perTxMax)`.
  </Step>

  <Step title="Check balance and budget">
    The wallet balance and (if set) the rolling `dailyBudget` counter are
    checked. A refusal here happens **before** anything is signed and emits a
    `payment.denied` event.
  </Step>

  <Step title="Sign">
    The custody provider signs an EIP-3009 `TransferWithAuthorization`. The
    provider re-enforces `perTxMax` inside the custody plane at signing time.
  </Step>

  <Step title="Retry once">
    The request is retried with a `PAYMENT-SIGNATURE` header attached.
  </Step>

  <Step title="Hard stop">
    If the retried request fails, that is the end — there is **no** second
    retry. A `payment.failed` event is emitted and the call throws.
    On success, the `payment-response` envelope is stored and a receipt is
    written.
  </Step>
</Steps>

### Quote

```bash theme={"theme":"css-variables"}
naive payments quote --url https://api.example.com/report
```

```json theme={"theme":"css-variables"}
{
  "paid": false,
  "free": false,
  "status": 402,
  "accepts": [
    {
      "amount": "500000",
      "asset": "USDC",
      "network": "eip155:8453",
      "payTo": "0xabc..."
    }
  ]
}
```

<Warning>
  `accepts[].amount` is in **atomic** units. USDC has 6 decimals, so `500000` =
  **0.50 USDC**. Everything else in this primitive — `perTxMax`, `dailyBudget`,
  `--max-amount`, fund/transfer `amount`, and a receipt's `amount` — is a
  **decimal** USDC string (e.g. `"1.00"`).
</Warning>

If the resource is not paywalled, quote returns `free: true` with the real HTTP
status and an empty `accepts` — fetch it normally, no payment needed.

### Pay

```bash theme={"theme":"css-variables"}
naive payments pay --url https://api.example.com/report --max-amount 0.50
```

Returns the resource body plus the receipt:

```json theme={"theme":"css-variables"}
{
  "status": 200,
  "body": "...the resource...",
  "paid": true,
  "receipt": {
    "direction": "buy",
    "origin": "https://api.example.com",
    "payTo": "0xabc...",
    "amount": "0.50",
    "asset": "USDC",
    "network": "eip155:8453",
    "txHash": "0x..."
  }
}
```

### Receipts

Every settled payment is recorded. `direction` is `buy` (paid out) or `sell`
(received).

```bash theme={"theme":"css-variables"}
naive payments receipts --direction buy --origin https://api.example.com --limit 20
naive payments receipts --since 2026-07-01T00:00:00Z
```

<Info>
  `GET /v1/users/{user_id}/payments/receipts` and `GET /v1/users/{user_id}/wallet/balances`
  return **bare arrays**, not wrapped objects. Receipt and wallet JSON fields are
  camelCase (`txHash`, `payTo`).
</Info>

## Spend control

Unlike [Cards](/docs/getting-started/cards) and [Trading](/docs/getting-started/trading),
payments have **no approval workflow** — deliberately. Three controls bound a
payment instead:

| Control           | Where enforced                    | Notes                                                             |
| ----------------- | --------------------------------- | ----------------------------------------------------------------- |
| **Balance**       | The chain                         | The primary budget — an agent cannot spend what isn't there.      |
| **`perTxMax`**    | Runtime **and** the custody plane | Max value of a single payment. Required. Defaults to `0.50` USDC. |
| **`dailyBudget`** | Runtime                           | Optional rolling per-UTC-day counter.                             |

`perTxMax` is enforced twice — at runtime and as a static account policy inside
the custody plane at signing time — so the ceiling holds even if the agent
runtime is compromised. Fund the wallet with what you can afford to lose and set
`perTxMax`.

There are deliberately **no** origin or payee allowlists and **no** velocity
rules. `--max-amount` (or `max_amount`) adds a per-call ceiling on top of
`perTxMax` for one specific payment.

## Governance

The wallet splits into two surfaces. The admin verbs are operator-surface
only — not agent tools:

| Surface           | Verbs                                                                       | Who                                                                               |
| ----------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Agent-safe**    | `wallet show`, `wallet balance`, and all of `payments` (quote/pay/receipts) | Any agent with the `payments` primitive granted                                   |
| **Operator-only** | `wallet create`, `fund`, `transfer`, `policy`, `sweep`                      | A signed-in dashboard session, or an API key minted with the `wallet:admin` scope |

The operator verbs are gated server-side by `enforceWalletAdmin`, and the CLI
refuses them client-side too. **An agent key is refused.** They are also absent
from the MCP tool list and the SDK entirely — non-exposure plus an explicit gate.

An AccountKit can additionally deny wallet administration for a user by listing
the `payments.wallet.admin` capability in
`primitives_config.payments.capabilities.deny`.

## Agents as code

Declare a wallet on an agent with `has.crypto`. This implies the `payments` slug
in the allowlist and adds a `crypto_wallet` provisioning step.

```ts theme={"theme":"css-variables"}
import { agent, skills } from "@usenaive-sdk/iac";

agent({
  has: {
    // Bare form — a wallet with the default policy (perTxMax "0.50")
    crypto: true,
  },
});

agent({
  has: {
    // Or with a spend policy (decimal USDC strings)
    crypto: { perTxMax: "1.00", dailyBudget: "10.00" },
  },
  can: [skills.payments], // or skills.payments.pay / .quote
});
```

<Warning>
  Do **not** reach for `limits.approve: [skills.payments.pay]`. Payments has no
  approval workflow, so such a rule compiles but is never enforced — it would give
  you a gate you believe in and do not have. Bound payments with `has.crypto`'s
  `perTxMax` / `dailyBudget` and with how much you fund the wallet.
</Warning>

## Configuration

| Setting           | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `WALLET_ENABLED`  | Master switch. Default **false**.                      |
| `WALLET_PROVIDER` | `fake` (default — works with no credentials) or `cdp`. |

Network: USDC on **Base** (`eip155:8453`).

<Info>
  When `WALLET_ENABLED` is false, the `crypto_wallet` provisioning step resolves to
  `needs_action` — it **never fails** the deployment. With `WALLET_PROVIDER=cdp`,
  credentials are BYO from the tenant vault; missing creds produce a typed
  `WalletNotConfigured` error and a "connect your CDP account" prompt rather than an
  opaque failure.
</Info>

## Custody backends

| Custody | Use                                                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------------------- |
| `fake`  | Local development — no credentials required                                                                           |
| `cdp`   | Hosted custody with the tenant's own CDP credentials; the static `perTxMax` account policy is attached here at create |
| `local` | Locally-held key                                                                                                      |

## Typical Workflows (Agent Perspective)

### Paying for a paywalled resource

```
1. POST /v1/users/<id>/payments/quote { url: "https://api.example.com/report" }
   → status: 402, accepts: [{ amount: "500000", asset: "USDC", network: "eip155:8453" }]
   → 500000 atomic = 0.50 USDC. Nothing was spent.

2. GET /v1/users/<id>/wallet/balances
   → [{ asset: "USDC", amount: "5.00" }] — affordable

3. POST /v1/users/<id>/payments/pay { url: "...", max_amount: "0.50" }
   → paid: true, body: "...", receipt: { amount: "0.50", txHash: "0x..." }

4. GET /v1/users/<id>/payments/receipts?direction=buy
   → [{ origin: "https://api.example.com", amount: "0.50", txHash: "0x..." }]
```

### The resource turned out to be free

```
1. POST /v1/users/<id>/payments/quote { url: "https://api.example.com/public" }
   → free: true, status: 200, accepts: []
   → No paywall. Fetch it normally — no payment, no receipt.
```

### The payment was refused

```
1. POST /v1/users/<id>/payments/pay { url: "...", max_amount: "0.05" }
   → PaymentRejected — the resource asks 0.50, over the effective cap
   → Refused BEFORE signing; a payment.denied event is logged; nothing spent.
   → Recovery: raise --max-amount (still bounded by perTxMax), or ask an
     operator to raise the wallet policy.
```

### Setting up a wallet (operator, not the agent)

```
1. naive use alice
2. naive wallet create                                  # operator credential required
3. naive wallet policy --per-tx-max 1.00 --daily-budget 10.00
4. naive wallet fund --amount 5.00 --source faucet      # faucet is testnet only
5. naive wallet balance                                 # agent-safe from here on
```
