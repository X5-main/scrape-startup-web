> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Wallet

> The agent's crypto wallet — read its address and balance, and (as an operator) fund, transfer, re-policy, and sweep it

## Commands

| Command                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `naive wallet show`     | Show the agent's wallet (address, network, custody)            |
| `naive wallet balance`  | Read USDC balances                                             |
| `naive wallet create`   | Provision the wallet — **operator**                            |
| `naive wallet fund`     | Credit it from the treasury or a testnet faucet — **operator** |
| `naive wallet transfer` | Send USDC to an address or another agent — **operator**        |
| `naive wallet policy`   | Set the spend policy — **operator**                            |
| `naive wallet sweep`    | Drain it back to the treasury — **operator**                   |

<Note>
  The wallet is **per-agent**, so every command needs an active user
  (`naive use <alice>`). Unlike cards, there is no company-level fallback mount —
  the wallet exists only per-agent.
</Note>

<Warning>
  `create`, `fund`, `transfer`, `policy`, and `sweep` require an **operator
  credential** — a signed-in human session (`naive auth session-login --email <e> --password <p>`),
  or an API key minted with the `wallet:admin` scope for CI. An agent's key is refused, both
  server-side and by the CLI. Reads (`show`, `balance`) are agent-safe.

  There is no `naive auth login`. The four `naive auth` subcommands are `google`, `email`,
  `session-login` and `logout`; `naive login` (no `auth`) is the separate email+password flow
  that mints an **agent API key**, which is not an operator credential.
</Warning>

## Show

```bash theme={"theme":"css-variables"}
naive wallet show
```

Returns the wallet's address, network, custody backend, and spend policy. If the
agent has no wallet yet, returns a `no_wallet` error — provision one with
`naive wallet create`, or declare `has.crypto` on the agent in `naive.config.ts`.

## Balance

```bash theme={"theme":"css-variables"}
naive wallet balance
naive wallet balance --network eip155:8453
```

Reads USDC balances (Base). The balance **is** the budget — an agent cannot spend
past it. `--network` takes a CAIP-2 id.

## Create

```bash theme={"theme":"css-variables"}
naive wallet create
naive wallet create --per-tx-max 1.00 --daily-budget 10.00
naive wallet create --custody cdp --network eip155:8453 --smart-account
```

| Flag                      | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `--custody <custody>`     | `cdp`, `local`, or `fake` (default: the configured provider) |
| `--network <network>`     | Network to provision on (CAIP-2, e.g. `eip155:8453`)         |
| `--per-tx-max <amount>`   | Max value of a single payment, decimal USDC                  |
| `--daily-budget <amount>` | Optional rolling daily cap, decimal USDC                     |
| `--smart-account`         | Provision as a smart account                                 |

Provisioning is **idempotent** — re-running returns the existing wallet.
`perTxMax` is written into the custody plane as a static account policy, so it
holds even if the agent runtime is compromised.

## Policy

```bash theme={"theme":"css-variables"}
naive wallet policy --per-tx-max 1.00
naive wallet policy --per-tx-max 1.00 --daily-budget 10.00
```

| Flag                      | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `--per-tx-max <amount>`   | Max value of a single payment, decimal USDC (**required**) |
| `--daily-budget <amount>` | Optional rolling daily cap, decimal USDC                   |

`perTxMax` is enforced twice — at runtime, and inside the custody plane at
signing time. This is the control that replaces an approval queue for payments.
The default policy if you set none is `perTxMax: "0.50"`.

<Note>
  Changing `perTxMax` re-issues the custody-plane policy too, so both layers move
  together and the new cap holds at signing time. The re-issue happens **before**
  the new policy is stored: if the custody plane can't be reached the command fails
  and nothing changes, rather than storing a cap that isn't being enforced.
</Note>

## Fund

```bash theme={"theme":"css-variables"}
naive wallet fund --amount 5.00 --source faucet
naive wallet fund --amount 25.00 --source treasury
```

| Flag                | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `--amount <amount>` | Decimal USDC amount (required)                                 |
| `--source <source>` | `treasury` or `faucet` — faucet is **testnet only** (required) |
| `--asset <asset>`   | Asset to credit (default `USDC`)                               |

The balance is the agent's real budget — fund only what you can afford to lose.

## Transfer

```bash theme={"theme":"css-variables"}
naive wallet transfer --to 0xabc... --amount 1.50 --purpose "settle invoice"
naive wallet transfer --to <agent-uuid> --amount 1.50 --purpose "top up worker"
```

| Flag                  | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `--to <to>`           | Destination address, or an agent id to target that agent's wallet (required) |
| `--amount <amount>`   | Decimal USDC amount (required)                                               |
| `--purpose <purpose>` | Why — recorded on the transfer for audit (required)                          |
| `--asset <asset>`     | Asset (default `USDC`)                                                       |
| `--network <network>` | Network (CAIP-2)                                                             |

Transfers are bounded by the wallet's `perTxMax`, the same cap that bounds agent
payments.

## Sweep

```bash theme={"theme":"css-variables"}
naive wallet sweep
naive wallet sweep --to 0xabc...
```

Drains the wallet back to the treasury (or `--to` an address) to decommission it.
Sweeping moves the funds out but does **not** delete the wallet — the agent
simply has nothing left to spend.
