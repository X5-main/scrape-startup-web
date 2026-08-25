> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet

> Get the agent's crypto wallet

Returns the agent's crypto wallet — address, network, custody backend, and spend policy. Read-only and agent-safe.

The wallet is **per-agent only**. Unlike cards, there is no company-level mount: it exists only at `/v1/users/{user_id}/wallet`.

<Note>
  **Requires the `payments` primitive.** `payments` is opt-in. If the resolved
  Account Kit has not enabled it, every wallet and payments endpoint returns
  `403 forbidden` before any wallet code runs.
</Note>

### Fields

| Field         | Type           | Description                                                                                                |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `address`     | string         | The wallet's on-chain address                                                                              |
| `network`     | string         | CAIP-2 network — `eip155:8453` (Base) or `eip155:84532` (Base Sepolia)                                     |
| `custody`     | string         | `cdp` (real cloud custody, requires BYO CDP credentials), `local`, or `fake` (credential-free default)     |
| `providerRef` | string         | Provider-side account id. Never a key — private keys never leave the custody plane                         |
| `policyJson`  | object         | The spend policy: `perTxMax`, optional `dailyBudget`, optional `lowBalanceThreshold`. Decimal USDC strings |
| `cdpPolicyId` | string \| null | The static custody-plane policy attached at create. Null for `fake`/`local` custody                        |
| `status`      | string         | `active`, `treasury`, or `revoked` (swept)                                                                 |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/user-uuid-1/wallet \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "wallet-uuid-1",
    "companyId": "company-uuid-1",
    "tenantUserId": "user-uuid-1",
    "network": "eip155:8453",
    "address": "0xa1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    "custody": "cdp",
    "providerRef": "company-uuid-1:user-uuid-1",
    "policyJson": {
      "perTxMax": "1.00",
      "dailyBudget": "10.00"
    },
    "cdpPolicyId": "pol_9f3c1a",
    "status": "active",
    "createdAt": "2026-07-01T10:00:00Z",
    "updatedAt": "2026-07-01T10:00:00Z"
  }
  ```
</ResponseExample>

### Errors

| Status | Code                 | When                                                                                        |
| ------ | -------------------- | ------------------------------------------------------------------------------------------- |
| 403    | `forbidden`          | The Account Kit has not enabled the `payments` primitive                                    |
| 404    | `resource_not_found` | No wallet for this agent — provision one with [Create Wallet](/docs/api-reference/wallet/create) |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet show
```

The wallet is per-agent, so this command needs an active user — there is no company-level fallback.

## MCP

No MCP tool. Reading the wallet row is not exposed to agents; an agent reads what it
needs to know — the balance — via `naive_wallet_balance`. See
[Wallet Balances](/docs/api-reference/wallet/balances).
