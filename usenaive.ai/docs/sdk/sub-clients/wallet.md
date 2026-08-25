> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# wallet

> The agent's crypto wallet — read-only.

**Tenant-scoped only.** Unlike most sub-clients this one is *not* on the root client —
`naive.wallet` is `undefined`. Reach it as `naive.forUser(id).wallet`.

```ts theme={"theme":"css-variables"}
await naive.forUser(alice.id).wallet.get();
await naive.forUser(alice.id).wallet.balance();
await naive.forUser(alice.id).wallet.balance("eip155:8453"); // CAIP-2 filter
```

`balance()` returns a bare array of USDC balances (Base); fields are camelCase.

The SDK deliberately exposes **no** fund, transfer, policy, or sweep — those are operator-surface only, not agent tools, so they are reachable only over REST with an operator credential (a signed-in session or a `wallet:admin`-scoped key). The cheapest way to stop an agent moving the float is to give it no way to ask. Agents spend via [payments](/docs/sdk/sub-clients/payments), bounded by `perTxMax`.

Gated by the `payments` primitive in the user's AccountKit (opt-in — off by default).
