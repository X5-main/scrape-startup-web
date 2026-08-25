> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Credit Transactions

> Paginated credit ledger — every deduction and grant/top-up with its action type

The company-scoped credit ledger: one row per credit movement — deductions (negative `amount`) from billable operations and grants/top-ups (positive `amount`) — newest first. Powers the dashboard billing usage table.

### Query parameters

| Param    | Type   | Default | Notes                            |
| -------- | ------ | ------- | -------------------------------- |
| `limit`  | number | `20`    | Page size, clamped to `1`–`100`. |
| `offset` | number | `0`     | Rows to skip (for pagination).   |

### Response

```json theme={"theme":"css-variables"}
{
  "transactions": [
    {
      "id": "txn_…",
      "amount": -40,
      "action_type": "browser.signup",
      "reference_id": "…",
      "metadata": { "service": "figma.com" },
      "created_at": "2026-06-05T12:00:00.000Z"
    },
    {
      "id": "txn_…",
      "amount": 500,
      "action_type": "topup",
      "reference_id": "medium",
      "metadata": null,
      "created_at": "2026-06-04T09:30:00.000Z"
    }
  ],
  "total": 128,
  "limit": 20,
  "offset": 0
}
```

`amount` is negative for charges and positive for credits added. `total` is the full count for pagination. For a rolled-up usage summary instead of the raw ledger, see [Usage](/docs/api-reference/status/usage).
