> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Wallet Balances

> Read the agent wallet's on-chain balances

Reads the agent wallet's on-chain balances. Agent-safe.

The balance **is** the budget. An agent can never spend what isn't there — this is the first
and simplest of the spend controls. Fund the wallet with what you can afford to lose.

<Note>
  Returns a **bare array**, not an envelope. There is no `{ "balances": [...] }` wrapper.
</Note>

### Query Parameters

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| `network` | string | No       | Filter to one CAIP-2 network, e.g. `eip155:8453` |

### Response Fields

| Field     | Type   | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| `network` | string | CAIP-2 network                                   |
| `asset`   | string | Asset symbol, e.g. `USDC`                        |
| `amount`  | string | Decimal amount (USDC is 6 dp), e.g. `"5.000000"` |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/users/user-uuid-1/wallet/balances?network=eip155:8453" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  [
    {
      "network": "eip155:8453",
      "asset": "USDC",
      "amount": "4.500000"
    }
  ]
  ```
</ResponseExample>

### Errors

| Status | Code                    | When                                                     |
| ------ | ----------------------- | -------------------------------------------------------- |
| 400    | `wallet_not_configured` | No CDP account connected                                 |
| 403    | `forbidden`             | The Account Kit has not enabled the `payments` primitive |
| 404    | `resource_not_found`    | No wallet for this agent                                 |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet balance
```

Filter to one network:

```bash theme={"theme":"css-variables"}
naive wallet balance --network eip155:8453
```

## MCP

Tool: `naive_wallet_balance`

```json theme={"theme":"css-variables"}
{
  "network": "eip155:8453"
}
```
