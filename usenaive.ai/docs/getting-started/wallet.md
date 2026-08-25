> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Wallet

> Every agent gets its own onchain crypto wallet — a USDC keypair on Base whose private key never enters the agent runtime. Read its address and balance, provision and fund it as an operator, and bound its spend with a policy enforced inside the custody plane.

Every agent gets its **own onchain wallet**: a USDC keypair on Base whose
**private key never enters the agent runtime**. Signing happens in a custody
plane — a hosted TEE, or a deterministic in-memory double for local dev — so
the agent carries only an opaque handle, never key material.

The wallet is **read-only to the agent**. It reads its address and balance; it
**spends** through the [Payments](/docs/getting-started/payments) primitive (x402),
bounded by a spend policy. Everything that moves the float — provision, fund,
transfer, re-policy, sweep — is the **operator** surface.

<Note>
  The wallet is gated by the **`payments`** primitive, which is **opt-in**: it is
  disabled in a fresh AccountKit and must be enabled explicitly — see
  [Account Kits](/docs/architecture/account-kits). It is also **per-agent**: there is no
  company-level fallback mount, so every CLI and API call needs a subject
  (`naive use <alice>`).
</Note>

## CLI First

```bash theme={"theme":"css-variables"}
# The wallet is per-agent — select one first
naive use alice

# Operator: provision, set the spend cap, and fund it
naive wallet create
naive wallet policy --per-tx-max 1.00 --daily-budget 10.00
naive wallet fund --amount 5.00 --source faucet   # faucet is testnet only

# Agent-safe: read the wallet and its balance
naive wallet show
naive wallet balance

# Spend happens through Payments (x402), not the wallet
naive payments pay --url https://api.example.com/report --max-amount 0.50
```

## Tools

| Tool                    | Type  | Who          |
| ----------------------- | ----- | ------------ |
| `naive wallet show`     | Read  | Agent-safe   |
| `naive wallet balance`  | Read  | Agent-safe   |
| `naive wallet create`   | Admin | **Operator** |
| `naive wallet fund`     | Admin | **Operator** |
| `naive wallet transfer` | Admin | **Operator** |
| `naive wallet policy`   | Admin | **Operator** |
| `naive wallet sweep`    | Admin | **Operator** |

## Pricing

| Action                                           | Credits |
| ------------------------------------------------ | ------- |
| `wallet create`                                  | 0.2     |
| `wallet fund`, `wallet transfer`, `wallet sweep` | 0.4     |
| `wallet policy` (only when `perTxMax` changes)   | 0.2     |
| `wallet show`, `wallet balance`                  | Free    |

Wallet metering covers the custody provider's per-operation cost; a movement is
two operations (signature + broadcast). Reads and a policy write that does not
reach the custody plane are free. These credits are separate from the on-chain
gas and the USDC being moved.

<Info>
  The admin verbs (`create`, `fund`, `transfer`, `policy`, `sweep`) are deliberately
  **not** MCP tools and **not** in the SDK — they are operator-surface only. See
  [Governance](#governance).
</Info>

## The wallet object

`naive wallet show` (GET `/v1/users/{user_id}/wallet`) returns the agent's wallet. Fields are
camelCase; the wallet holds **no** key material.

```json theme={"theme":"css-variables"}
{
  "address": "0x1a2b...",
  "custody": "cdp",
  "network": "eip155:8453",
  "smartAccount": false,
  "policy": {
    "perTxMax": "1.00",
    "dailyBudget": "10.00"
  }
}
```

`custody` is the backend holding the key (`cdp`, `local`, or `fake`), `network`
is a [CAIP-2](https://chainagnostic.org/CAIPs/caip-2) chain id (`eip155:8453` is
Base mainnet), and `policy` is the spend policy described [below](#spend-control).

## Reading the balance

```bash theme={"theme":"css-variables"}
naive wallet balance                          # all assets
naive wallet balance --network eip155:8453    # filter to one network
```

`GET /v1/users/{user_id}/wallet/balances` returns a **bare array** (not `{ balances: [...] }`):

```json theme={"theme":"css-variables"}
[{ "asset": "USDC", "amount": "5.00" }]
```

<Warning>
  `amount` here is a **decimal** USDC string. Everything in this primitive —
  `perTxMax`, `dailyBudget`, fund/transfer `amount`, `--max-amount` — is decimal
  USDC. The **only** place you meet atomic 6-decimal units is an x402 quote's
  `accepts[].amount`; see [Payments](/docs/getting-started/payments#quote).
</Warning>

## Provisioning (operator)

```bash theme={"theme":"css-variables"}
naive wallet create \
  --custody cdp \
  --network eip155:8453 \
  --per-tx-max 1.00 \
  --daily-budget 10.00
```

`POST /v1/users/<user_id>/wallet`. Provisioning is **idempotent** — re-running
returns the existing wallet rather than minting a second one. `--smart-account`
provisions the wallet as a smart account. When a `--per-tx-max` is supplied at
create it is written into the custody plane as a **static account policy** (see
below); otherwise the wallet gets the tenant default of `0.50` USDC.

You can also declare the wallet in [Agents as code](#agents-as-code) so it is
provisioned as part of a deploy.

## Funding (operator)

```bash theme={"theme":"css-variables"}
naive wallet fund --amount 5.00 --source faucet     # testnet faucet
naive wallet fund --amount 25.00 --source treasury  # from the tenant treasury
```

`POST /v1/users/<user_id>/wallet/fund`. `faucet` works on testnets only;
`treasury` moves USDC from the tenant treasury into the agent's wallet. The
balance **is** the agent's real budget, so fund only what you can afford to lose.

## Transfer (operator)

```bash theme={"theme":"css-variables"}
naive wallet transfer \
  --to 0xabc... \
  --amount 1.50 \
  --purpose "settle invoice #1042"
```

`POST /v1/users/<user_id>/wallet/transfer`. `--to` accepts a raw address **or**
another agent's id (to target that agent's wallet). `--purpose` is recorded on
the transfer for audit. Transfers are bounded by the same `perTxMax` that bounds
agent payments.

## Spend control

Unlike [Cards](/docs/getting-started/cards) and [Trading](/docs/getting-started/trading),
the wallet has **no approval workflow** — deliberately. Three controls bound
every payment and transfer instead:

| Control           | Where enforced                    | Notes                                                                      |
| ----------------- | --------------------------------- | -------------------------------------------------------------------------- |
| **Balance**       | The chain                         | The primary budget — an agent cannot spend what isn't there.               |
| **`perTxMax`**    | Runtime **and** the custody plane | Max value of a single payment/transfer. Required. Defaults to `0.50` USDC. |
| **`dailyBudget`** | Runtime                           | Optional rolling per-UTC-day counter.                                      |

```bash theme={"theme":"css-variables"}
naive wallet policy --per-tx-max 1.00 --daily-budget 10.00
```

`perTxMax` is enforced twice — at runtime and as a static account policy inside
the custody plane at signing time — so the cap holds even if the agent runtime is
compromised. If the custody plane can't be reached, `wallet policy` **fails**
rather than storing a cap that isn't really enforced.

An optional `lowBalanceThreshold` (defaults to `perTxMax`) emits a
`wallet.balance.low` event when the balance drops below it after a
balance-changing op — observability only, it never blocks a spend.

## Decommissioning

```bash theme={"theme":"css-variables"}
naive wallet sweep                 # drain to the treasury
naive wallet sweep --to 0xabc...   # or to a specific address
```

`POST /v1/users/<user_id>/wallet/sweep` moves the funds out but does **not**
delete the wallet — the agent simply has nothing left to spend.

## Governance

The wallet splits into two surfaces. The admin verbs are operator-surface
only — not agent tools:

| Surface           | Verbs                                                                                                        | Who                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Agent-safe**    | `wallet show`, `wallet balance`, and all of [`payments`](/docs/getting-started/payments) (quote / pay / receipts) | Any agent with the `payments` primitive granted                                   |
| **Operator-only** | `wallet create`, `fund`, `transfer`, `policy`, `sweep`                                                       | A signed-in dashboard session, or an API key minted with the `wallet:admin` scope |

The operator verbs are gated server-side by `enforceWalletAdmin`, and the CLI
refuses them client-side too. **An agent key is refused.** They are also absent
from the MCP tool list and the SDK entirely — non-exposure plus an explicit gate.

An AccountKit can additionally deny wallet administration for a user by listing
the `payments.wallet.admin` capability in
`primitives_config.payments.capabilities.deny`.

## Spending

An agent spends its wallet through [Payments](/docs/getting-started/payments) — the
x402 buy-side flow — never by moving funds directly:

```bash theme={"theme":"css-variables"}
naive payments quote --url https://api.example.com/report   # price, zero side effects
naive payments pay   --url https://api.example.com/report --max-amount 0.50
naive payments receipts --direction buy --limit 10
```

The effective per-call cap is `min(--max-amount, perTxMax)`, checked (with the
balance and `dailyBudget`) **before** anything is signed. See
[Payments](/docs/getting-started/payments) for the full flow.

## SDK

The SDK wallet client is **read-only** — it mirrors the operator/agent split.
Available on the root (default user) and `naive.forUser(id)`:

```ts theme={"theme":"css-variables"}
const wallet = await naive.forUser(alice.id).wallet.get();
const balances = await naive.forUser(alice.id).wallet.balance();
await naive.forUser(alice.id).wallet.balance("eip155:8453"); // CAIP-2 filter

// Spending is on the payments client, bounded by perTxMax
await naive.forUser(alice.id).payments.pay({
  url: "https://api.example.com/report",
  max_amount: "0.50",
});
```

There is deliberately **no** `fund`, `transfer`, `policy`, or `sweep` in the SDK —
those are operator-only and reachable only over REST with an operator credential.

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
  Do **not** reach for `limits.approve: [skills.payments.pay]`. The wallet has no
  approval workflow, so such a rule compiles but is never enforced. Bound spend
  with `has.crypto`'s `perTxMax` / `dailyBudget` and with how much you fund the
  wallet.
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

| Custody | Use                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `fake`  | Local development — no credentials required; **not** for real funds                                                                     |
| `cdp`   | Coinbase CDP Server Wallets v2 (TEE) with the tenant's own credentials; the static `perTxMax` account policy is attached here at create |
| `local` | On-box vaultd signer (locally-held key)                                                                                                 |
