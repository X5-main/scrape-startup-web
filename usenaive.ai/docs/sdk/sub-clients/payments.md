> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# payments

> Pay for x402 resources with the agent's crypto wallet.

**Tenant-scoped only.** Unlike most sub-clients this one is *not* on the root client —
`naive.payments` is `undefined`. Reach it as `naive.forUser(id).payments`.

```ts theme={"theme":"css-variables"}
// Probe the price — zero side effects, nothing is spent
await naive.forUser(alice.id).payments.quote({ url: "https://api.example.com/report" });

// SENSITIVE: spends real USDC. `max_amount` is a decimal USDC string.
await naive.forUser(alice.id).payments.pay({ url: "https://api.example.com/report", max_amount: "0.50" });

await naive.forUser(alice.id).payments.receipts({ direction: "buy", limit: 10 });
```

`quote` returns `accepts[].amount` in ATOMIC units (USDC has 6 decimals, so 500000 = 0.50 USDC); everything else here is decimal. `receipts` returns a bare array and accepts `{ direction, origin, since, limit }`.

There is no approval flow — a payment is bounded by the wallet balance and its `perTxMax` (enforced in the custody plane at signing time). See [wallet](/docs/sdk/sub-clients/wallet).

Gated by the `payments` primitive in the user's AccountKit (opt-in — off by default).
