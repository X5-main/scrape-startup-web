> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Wallet

> Provision the agent's crypto wallet

Provisions the agent's wallet in the custody plane and persists it. **Idempotent** — if the agent already has a wallet, the existing one is returned unchanged and no new wallet is created.

<Warning>
  **Operator only.** Provisioning requires an operator credential: a signed-in
  dashboard session, or an API key minted with the `wallet:admin` scope. An agent
  key is refused with `403` (`reason: wallet_admin_requires_operator`).

  `create`, `fund`, `transfer`, `policy` and `sweep` are the operator surface. An
  agent spends from its wallet via [Pay](/docs/api-reference/payments/pay) — it cannot
  administer it.
</Warning>

### Request Body

| Parameter      | Type      | Required | Description                                                                                                                            |
| -------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `custody`      | string    | No       | `cdp` \| `local` \| `fake`. Defaults to the configured wallet provider (`fake` unless CDP is enabled)                                  |
| `networks`     | string\[] | No       | CAIP-2 networks; the first becomes the wallet's network. Defaults to `["eip155:8453"]`                                                 |
| `policy`       | object    | No       | Spend policy — `perTxMax` (decimal USDC), optional `dailyBudget`, optional `lowBalanceThreshold`. Defaults to `{ "perTxMax": "0.50" }` |
| `smartAccount` | boolean   | No       | Provision as a smart account                                                                                                           |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/wallet \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "custody": "cdp",
      "networks": ["eip155:8453"],
      "policy": { "perTxMax": "1.00", "dailyBudget": "10.00" }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
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

### Fail-closed provisioning

`perTxMax` is written into the custody plane as a **static account policy** at create time,
which is what makes it survive a compromised agent runtime. If that policy cannot be
attached, provisioning fails with `500 internal_error` and **no wallet is created** —
there is never a wallet without its cap. Retry the call.

Likewise, if the custody backend is unconfigured (BYO CDP credentials absent), the call
fails with `wallet_not_configured` **before** any row is written.

### Errors

| Status | Code                    | When                                                                                                            |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| 400    | `wallet_not_configured` | No CDP account connected. Connect one (BYO credentials) to enable crypto wallets                                |
| 403    | `forbidden`             | The Account Kit has not enabled `payments`, or the caller is not an operator (`wallet_admin_requires_operator`) |
| 500    | `internal_error`        | The spend policy could not be attached; no wallet was created. Retry                                            |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet create
```

With an explicit custody backend and policy:

```bash theme={"theme":"css-variables"}
naive wallet create --custody cdp --network eip155:8453 \
  --per-tx-max 1.00 --daily-budget 10.00
```

This is an operator command — it goes through a signed-in human session. Start one with `naive auth session-login`, or `naive auth google` / `naive auth email <email>` in the browser.

## MCP

No MCP tool — deliberately. Wallet provisioning is the operator surface and is not
exposed to agents. A wallet an agent can't reach is the cheapest policy of all.
