> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Pay

> Pay for and fetch an x402 resource — spends real USDC

Fetches an x402 resource, paying for it from the agent's wallet if it demands payment.
Returns the resource body plus a receipt.

<Warning>
  **Sensitive — this spends real USDC.** Use
  [Quote](/docs/api-reference/payments/quote) first to learn the price with zero side
  effects.
</Warning>

### How it works

1. Fetch the URL.
2. Not a `402`? Return the response — `paid: false`, no receipt, nothing spent.
3. Decode the requirements and select one under policy: `exact` scheme, USDC, an allowed
   network, at or under the effective cap.
4. Check balance and `dailyBudget`, then emit `payment.requested`.
5. Sign a USDC payment in the custody plane, which **re-enforces `perTxMax` at signing time**.
6. Retry the request **once** with the payment attached.
7. Hard stop — persist the receipt and emit `payment.settled`. A failure after signing is
   never retried a second time.

### Spend control — no approval workflow

There is deliberately **no approval queue** on this endpoint, unlike
[cards](/docs/api-reference/cards/create). What bounds a payment:

| Control                  | Where it is enforced                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Wallet balance           | An agent cannot spend what isn't there                                                                             |
| `perTxMax`               | Twice — at runtime, **and** as a static custody-plane policy at signing time, which survives a compromised runtime |
| `dailyBudget` (optional) | A rolling per-UTC-day runtime counter                                                                              |
| `max_amount`             | A per-call ceiling on this one payment                                                                             |

The effective per-payment cap is `min(max_amount, wallet perTxMax)`.

### Request Body

| Parameter    | Type   | Required | Description                                                                                                          |
| ------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `url`        | string | Yes      | The x402 resource URL to pay for and fetch                                                                           |
| `init`       | object | No       | Fetch init — `method`, `headers`, `body`                                                                             |
| `max_amount` | string | No       | Per-call ceiling as a **decimal USDC** string, e.g. `"0.50"` — not atomic units. `maxAmount` is accepted as an alias |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/payments/pay \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://api.example.com/report",
      "max_amount": "0.50"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "status": 200,
    "body": "{\"report\":\"...\"}",
    "paid": true,
    "receipt": {
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
  }
  ```
</ResponseExample>

A resource that isn't paywalled returns `paid: false` and `receipt: null` — nothing was
spent. The receipt's `amount` is a **decimal USDC** string, and `settleResponseB64` is the
raw base64 `PAYMENT-RESPONSE` envelope: the onchain-verifiable audit artifact.

Receipts are booked idempotently on `(direction, origin, nonce)`, so a replay returns the
existing row and books nothing twice.

### Errors

| Status | Code                    | When                                                     |
| ------ | ----------------------- | -------------------------------------------------------- |
| 400    | `invalid_input`         | `url` is required                                        |
| 400    | `wallet_not_configured` | No wallet for this agent — create one before paying      |
| 402    | `payment_rejected`      | The payment was refused. See `error.reason` below        |
| 403    | `forbidden`             | The Account Kit has not enabled the `payments` primitive |

#### `payment_rejected` reasons

| `error.reason`               | Meaning                                                                 |
| ---------------------------- | ----------------------------------------------------------------------- |
| `no_acceptable_requirements` | The 402 advertised no requirements, or had no `PAYMENT-REQUIRED` header |
| `unsupported_scheme`         | No `exact`-scheme requirement                                           |
| `unsupported_network`        | No requirement on an allowed network                                    |
| `unsupported_asset`          | No USDC requirement                                                     |
| `over_per_tx_max`            | Every requirement exceeds the effective cap                             |
| `insufficient_balance`       | The wallet balance is below the payment amount                          |
| `daily_budget_exhausted`     | The payment would exceed `dailyBudget`                                  |
| `settlement_failed`          | The resource rejected the signed payment. Hard stop — not retried       |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive payments pay --url https://api.example.com/report --max-amount 0.50
```

## MCP

Tool: `naive_payments_pay`

```json theme={"theme":"css-variables"}
{
  "url": "https://api.example.com/report",
  "max_amount": "0.50"
}
```
