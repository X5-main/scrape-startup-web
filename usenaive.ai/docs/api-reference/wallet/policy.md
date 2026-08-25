> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Set Wallet Policy

> Set the agent wallet's spend policy

Replaces the wallet's spend policy. `policy.perTxMax` is **required**.

<Warning>
  **Operator only.** Setting the policy requires an operator credential: a signed-in
  dashboard session, or an API key minted with the `wallet:admin` scope. An agent key
  is refused with `403` (`reason: wallet_admin_requires_operator`) — an agent cannot
  raise its own cap.
</Warning>

### Why there is no approval queue

Unlike [cards](/docs/api-reference/cards/create) and trading, no wallet or payments endpoint is
approval-gated. That is deliberate. The spend control is structural:

1. **Balance is the budget** — an agent can never spend what isn't in the wallet.
2. **`perTxMax` is enforced twice** — once at runtime, and again as a static account policy
   *inside the custody plane at signing time*. The second check holds even if the agent
   runtime is fully compromised, which an approval prompt would not.
3. **`dailyBudget`** (optional) is a rolling per-UTC-day runtime counter.

Fund the wallet with what you can afford to lose, and set `perTxMax`.

<Note>
  When `perTxMax` changes, this endpoint re-issues the static custody-plane policy as
  well as updating the stored one, so point 2 holds at the value you set here rather
  than the wallet's create-time cap.

  The re-issue runs **before** the new policy is persisted, and fails closed: if the
  custody plane rejects it you get a `500 internal_error`
  (`WalletPolicyAttachFailed`) and **nothing is stored**. A stored cap the custody
  plane isn't holding would make `perTxMax` "enforced twice" at two different
  numbers, so the endpoint refuses rather than half-apply. Retry once custody is
  reachable.
</Note>

### Request Body

| Parameter                    | Type   | Required | Description                                                              |
| ---------------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| `policy`                     | object | Yes      | The policy object                                                        |
| `policy.perTxMax`            | string | Yes      | Max value of a single payment, **decimal USDC**. Tenant default `"0.50"` |
| `policy.dailyBudget`         | string | No       | Rolling per-UTC-day cap, decimal USDC                                    |
| `policy.lowBalanceThreshold` | string | No       | Emit `wallet.balance.low` below this. Defaults to `perTxMax`             |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/user-uuid-1/wallet/policy \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "policy": {
        "perTxMax": "1.00",
        "dailyBudget": "10.00",
        "lowBalanceThreshold": "2.00"
      }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "ok": true
  }
  ```
</ResponseExample>

### Errors

| Status | Code                 | When                                                                                                            |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 400    | `invalid_input`      | `policy.perTxMax` is required                                                                                   |
| 403    | `forbidden`          | The Account Kit has not enabled `payments`, or the caller is not an operator (`wallet_admin_requires_operator`) |
| 404    | `resource_not_found` | No wallet for this agent                                                                                        |

## CLI

```bash theme={"theme":"css-variables"}
naive use <user-id>
naive wallet policy --per-tx-max 1.00
```

With a rolling daily cap:

```bash theme={"theme":"css-variables"}
naive wallet policy --per-tx-max 1.00 --daily-budget 10.00
```

## MCP

No MCP tool — deliberately. The spend cap is the control that replaces an approval
queue, so it is operator-only: an agent that could re-policy its own wallet would be
holding its own leash.
