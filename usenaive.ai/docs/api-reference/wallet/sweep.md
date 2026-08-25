> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sweep Wallet

> Drain the agent wallet back to the treasury — decommission

The decommission path. Drains the wallet's full USDC balance to `to` (defaulting to the
tenant treasury wallet) and marks the wallet `revoked`.

The wallet row is **not deleted** — the agent simply has nothing left to spend.

<Warning>
  **Operator only.** Sweeping requires an operator credential: a signed-in dashboard
  session, or an API key minted with the `wallet:admin` scope. An agent key is refused
  with `403` (`reason: wallet_admin_requires_operator`).
</Warning>

### Request Body

| Parameter | Type   | Required | Description                                                           |
| --------- | ------ | -------- | --------------------------------------------------------------------- |
| `to`      | string | No       | Destination address. Defaults to the tenant treasury wallet's address |

If `to` is omitted **and** the tenant has no treasury wallet, the call fails with
`400 invalid_input` — there is no destination to drain to.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/wallet/sweep \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{}'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "txHash": "0x8f2c1de4a90b7356e1c2f8a94b0d6e7351829af0cb3d47e5a61b9c8d2f3e4a5b"
  }
  ```
</ResponseExample>

Sweeping emits a `wallet.swept` audit event recording the destination and the amount moved.

### Errors

| Status | Code                 | When                                                                                                            |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 400    | `invalid_input`      | No sweep destination — neither `to` nor a treasury wallet is available                                          |
| 403    | `forbidden`          | The Account Kit has not enabled `payments`, or the caller is not an operator (`wallet_admin_requires_operator`) |
| 404    | `resource_not_found` | No wallet for this agent                                                                                        |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet sweep
```

To a specific address rather than the treasury:

```bash theme={"theme":"css-variables"}
naive wallet sweep --to 0xfeedface...
```

## MCP

No MCP tool — deliberately. Decommissioning a wallet is the operator surface.
