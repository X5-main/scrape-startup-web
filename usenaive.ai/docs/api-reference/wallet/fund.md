> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Fund Wallet

> Credit the agent wallet from the treasury or a testnet faucet

Credits the agent's wallet, either from the tenant treasury wallet or from a testnet faucet.

<Warning>
  **Operator only.** Funding requires an operator credential: a signed-in dashboard
  session, or an API key minted with the `wallet:admin` scope. An agent key is
  refused with `403` (`reason: wallet_admin_requires_operator`).
</Warning>

### Request Body

| Parameter | Type   | Required | Description                                                                            |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `amount`  | string | Yes      | **Decimal USDC** string, e.g. `"5.00"` — not cents, not atomic units                   |
| `source`  | string | Yes      | `treasury` (moves USDC from the tenant treasury wallet) or `faucet` (**testnet only**) |
| `asset`   | string | No       | Asset to credit. Defaults to `USDC`                                                    |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/wallet/fund \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "amount": "5.00",
      "source": "treasury"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "txHash": "0x8f2c1de4a90b7356e1c2f8a94b0d6e7351829af0cb3d47e5a61b9c8d2f3e4a5b"
  }
  ```
</ResponseExample>

Funding emits a `wallet.funded` audit event, and opportunistically emits
`wallet.balance.low` if the resulting balance is still under the wallet's
`lowBalanceThreshold` (which defaults to `perTxMax`).

### Errors

| Status | Code                 | When                                                                                                            |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 400    | `invalid_input`      | `amount` and `source` are both required                                                                         |
| 403    | `forbidden`          | The Account Kit has not enabled `payments`, or the caller is not an operator (`wallet_admin_requires_operator`) |
| 404    | `resource_not_found` | No wallet for this agent, or — with `source: treasury` — no treasury wallet is configured                       |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet fund --amount 5.00 --source treasury
```

On testnet, credit from the faucet instead:

```bash theme={"theme":"css-variables"}
naive wallet fund --amount 5.00 --source faucet
```

## MCP

No MCP tool — deliberately. Funding is the operator surface and is not exposed to
agents: an agent that could top itself up would have no budget at all.
