> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Transfer From Wallet

> Send USDC from the agent wallet to an address or another agent

Sends USDC out of the agent's wallet, to a raw address or to another agent's wallet.

Transfers are bounded by the wallet's `perTxMax` — the same cap that bounds agent
payments. A transfer above it is refused with `402 payment_rejected`
(`reason: over_per_tx_max`).

<Warning>
  **Operator only.** Transfers require an operator credential: a signed-in dashboard
  session, or an API key minted with the `wallet:admin` scope. An agent key is
  refused with `403` (`reason: wallet_admin_requires_operator`).
</Warning>

### Request Body

| Parameter | Type   | Required | Description                                                                                                                       |
| --------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `to`      | string | Yes      | A destination address, **or** an agent (tenant user) UUID — which resolves to that agent's wallet address within the same company |
| `amount`  | string | Yes      | **Decimal USDC** string, e.g. `"1.50"`                                                                                            |
| `asset`   | string | No       | Defaults to `USDC`                                                                                                                |
| `network` | string | No       | CAIP-2 network. Defaults to the wallet's network                                                                                  |
| `purpose` | string | No       | Why — recorded on the `wallet.transfer` audit event                                                                               |

### Agent-to-agent transfers

If `to` is a UUID that matches an agent with a wallet in the same company, it resolves to
that agent's wallet address. A UUID with no matching wallet is passed through as-is.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/wallet/transfer \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "to": "0xfeedfacecafebeef0123456789abcdef01234567",
      "amount": "1.50",
      "purpose": "settle invoice #204"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "txHash": "0x8f2c1de4a90b7356e1c2f8a94b0d6e7351829af0cb3d47e5a61b9c8d2f3e4a5b",
    "actionId": "transfer:0x8f2c1de4a90b7356e1c2f8a94b0d6e7351829af0cb3d47e5a61b9c8d2f3e4a5b"
  }
  ```
</ResponseExample>

`actionId` is the transfer's audit key, linking the transaction to its `wallet.transfer`
activity event.

### Errors

| Status | Code                 | When                                                                                                            |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 400    | `invalid_input`      | `to` and `amount` are both required                                                                             |
| 402    | `payment_rejected`   | `reason: over_per_tx_max` — the amount exceeds the wallet's `perTxMax`                                          |
| 403    | `forbidden`          | The Account Kit has not enabled `payments`, or the caller is not an operator (`wallet_admin_requires_operator`) |
| 404    | `resource_not_found` | No wallet for this agent                                                                                        |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet transfer --to 0xfeedface... --amount 1.50 --purpose "settle invoice"
```

To pay another agent, pass its id as `--to`:

```bash theme={"theme":"css-variables"}
naive wallet transfer --to <agent-uuid> --amount 1.50 --purpose "sub-agent budget"
```

## MCP

No MCP tool — deliberately. Moving funds out of a wallet is the operator surface. An
agent spends via [Pay](/docs/api-reference/payments/pay), bounded by `perTxMax`.
