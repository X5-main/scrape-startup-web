> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Quote Payment

> Probe an x402 URL for its price — zero side effects

Probes a URL and returns its decoded x402 payment requirements.

**Zero side effects.** No wallet is loaded, nothing is signed, and no events or receipts are
written. Quote first, then [pay](/docs/api-reference/payments/pay) — this is the safe way to
learn a price.

<Note>
  **Requires the `payments` primitive.** `payments` is opt-in. If the resolved
  Account Kit has not enabled it, this returns `403 forbidden`.
</Note>

### Request Body

| Parameter | Type   | Required | Description                                                                                                                                                                      |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`     | string | Yes      | The x402 resource URL to probe                                                                                                                                                   |
| `init`    | object | No       | Fetch init — `method`, `headers`, `body`. A paywalled route only answers 402 on the verb it is mounted on, so probing a `POST /summarize` with the default GET discovers nothing |

### Response Fields

| Field     | Type    | Description                                                                                   |
| --------- | ------- | --------------------------------------------------------------------------------------------- |
| `paid`    | boolean | Always `false` — quote never pays                                                             |
| `free`    | boolean | `true` when the resource returned a non-402 (free / normal) response; `accepts` is then empty |
| `status`  | number  | The probe's HTTP status — `402` when paywalled                                                |
| `accepts` | array   | The decoded payment requirements                                                              |

<Warning>
  **`accepts[].amount` is ATOMIC**, in units of `asset` — not decimal. USDC has 6
  decimals, so `500000` = 0.50 USDC. Every other amount in this primitive
  (`perTxMax`, `dailyBudget`, `max_amount`, and a receipt's `amount`) is a decimal
  USDC string like `"0.50"`. `maxAmountRequired` is the tolerated x402 v1 name for
  the same atomic field.
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/payments/quote \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://api.example.com/report"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "paid": false,
    "free": false,
    "status": 402,
    "accepts": [
      {
        "scheme": "exact",
        "network": "eip155:8453",
        "amount": "500000",
        "asset": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "payTo": "0xfeedfacecafebeef0123456789abcdef01234567",
        "extra": { "name": "USDC", "version": "2" }
      }
    ]
  }
  ```
</ResponseExample>

A resource that isn't paywalled returns `free: true` with its real status and an empty
`accepts` — fetch it normally, no payment needed.

### Errors

| Status | Code            | When                                                     |
| ------ | --------------- | -------------------------------------------------------- |
| 400    | `invalid_input` | `url` is required                                        |
| 403    | `forbidden`     | The Account Kit has not enabled the `payments` primitive |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive payments quote --url https://api.example.com/report
```

To probe a non-GET paywall:

```bash theme={"theme":"css-variables"}
naive payments quote --url https://api.example.com/summarize --method POST
```

## MCP

Tool: `naive_payments_quote`

```json theme={"theme":"css-variables"}
{
  "url": "https://api.example.com/report",
  "method": "GET"
}
```
