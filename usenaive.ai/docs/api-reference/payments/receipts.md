> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Receipts

> List the agent's x402 payment receipts

Lists this agent's x402 payment receipts. Each receipt links a settled payment to its
onchain transaction. Agent-safe.

<Note>
  Returns a **bare array**, not an envelope. There is no `{ "receipts": [...] }` wrapper.
</Note>

### Query Parameters

| Parameter   | Type   | Required | Description                                                                                                              |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `direction` | string | No       | `buy` (this agent paid out) or `sell` (this agent was paid)                                                              |
| `origin`    | string | No       | Filter to one resource origin, e.g. `https://api.example.com`                                                            |
| `since`     | string | No       | Only receipts at/after this ISO-8601 timestamp. Epoch milliseconds are also accepted; an unparseable value returns `400` |
| `limit`     | number | No       | Max receipts to return. Defaults to 50, capped at 200                                                                    |

### Receipt Fields

| Field               | Type           | Description                                                                     |
| ------------------- | -------------- | ------------------------------------------------------------------------------- |
| `direction`         | string         | `buy` or `sell`                                                                 |
| `origin`            | string         | The resource origin                                                             |
| `route`             | string \| null | Matched paywall route (`"POST /summarize"`). Sell-side only; `null` on buy rows |
| `payTo`             | string         | The payee address                                                               |
| `amount`            | string         | **Decimal USDC** string, e.g. `"0.50"`                                          |
| `asset`             | string         | Token contract address                                                          |
| `network`           | string         | CAIP-2 network                                                                  |
| `scheme`            | string         | x402 scheme, e.g. `exact`                                                       |
| `txHash`            | string \| null | Settlement transaction hash                                                     |
| `nonce`             | string         | EIP-3009 authorization nonce — half of the idempotency key                      |
| `settleResponseB64` | string \| null | Raw base64 `PAYMENT-RESPONSE` envelope — the onchain-verifiable audit artifact  |
| `actionId`          | string \| null | Links to the activity-log event id                                              |
| `ts`                | string         | When the payment settled                                                        |

An agent-to-agent payment produces **two** receipts — the payer's `buy` row and the
payee's `sell` row — sharing an origin and a nonce.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/users/user-uuid-1/payments/receipts?direction=buy&limit=10" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  [
    {
      "id": "receipt-uuid-1",
      "companyId": "company-uuid-1",
      "tenantUserId": "user-uuid-1",
      "direction": "buy",
      "origin": "https://api.example.com",
      "route": null,
      "payTo": "0xfeedfacecafebeef0123456789abcdef01234567",
      "amount": "0.50",
      "asset": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      "network": "eip155:8453",
      "scheme": "exact",
      "txHash": "0x8f2c1de4a90b7356e1c2f8a94b0d6e7351829af0cb3d47e5a61b9c8d2f3e4a5b",
      "nonce": "0x2b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfe",
      "settleResponseB64": "eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6IjB4OGYyYzFkZTQifQ==",
      "actionId": null,
      "ts": "2026-07-16T12:00:00Z"
    }
  ]
  ```
</ResponseExample>

### Errors

| Status | Code            | When                                                     |
| ------ | --------------- | -------------------------------------------------------- |
| 400    | `invalid_input` | Invalid `since` timestamp                                |
| 403    | `forbidden`     | The Account Kit has not enabled the `payments` primitive |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive payments receipts --direction buy --limit 10
```

Filter by origin or time:

```bash theme={"theme":"css-variables"}
naive payments receipts --origin https://api.example.com
naive payments receipts --since 2026-07-01T00:00:00Z
```

## MCP

Tool: `naive_payments_receipts`

```json theme={"theme":"css-variables"}
{
  "direction": "buy",
  "origin": "https://api.example.com",
  "since": "2026-07-01T00:00:00Z",
  "limit": 10
}
```
