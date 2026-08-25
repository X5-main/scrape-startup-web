> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cards

> Manage virtual cards — create, fund, assign, and track transactions from the CLI

## Commands

| Command                                | Description                                    |
| -------------------------------------- | ---------------------------------------------- |
| `naive cards`                          | List all virtual cards                         |
| `naive cards cardholder`               | View the company's cardholder                  |
| `naive cards create-cardholder`        | Create a virtual card cardholder               |
| `naive cards update-cardholder`        | Update cardholder details                      |
| `naive cards create`                   | Create a new card (returns checkout URL)       |
| `naive cards details <id>`             | View card credentials (PAN/CVC or redeem code) |
| `naive cards check-payment <id>`       | Check if card funding completed                |
| `naive cards retry-issue <id>`         | Retry failed card issuance                     |
| `naive cards top-up <id>`              | Top up a card (returns checkout URL)           |
| `naive cards refund <id>`              | Refund a failed card                           |
| `naive cards cancel <id>`              | Cancel/deactivate a card                       |
| `naive cards assignments <id>`         | List agents assigned to a card                 |
| `naive cards assign <id>`              | Assign an agent to a card                      |
| `naive cards unassign <id> <agent_id>` | Remove agent assignment                        |
| `naive cards log-transaction <id>`     | Log a manual transaction                       |
| `naive cards transactions`             | List card transactions                         |

## List Cards

```bash theme={"theme":"css-variables"}
naive cards list
naive cards list --agent-id <uuid>
```

Shows all cards with status, provider, last4, and spending info.

## Create Cardholder

```bash theme={"theme":"css-variables"}
naive cards create-cardholder \
  --first-name John --last-name Doe \
  --billing-line1 "123 Main St" --billing-city "San Francisco" \
  --billing-state CA --billing-postal-code 94105 \
  --dob-day 15 --dob-month 6 --dob-year 1990 \
  --email john@acme.com
```

Required once before issuing managed virtual cards. prepaid gift cards do not need a cardholder.

## Create a Card

```bash theme={"theme":"css-variables"}
# prepaid gift card (default — no cardholder, max $150)
naive cards create --name "Prepaid Card" --spending-limit 5000

# managed virtual card (no spending cap — requires a cardholder first)
naive cards create --name "Marketing Card" --spending-limit 10000 --provider managed_virtual
```

Returns a checkout URL. After payment, run `check-payment` to issue the card.

## Issue After Payment

```bash theme={"theme":"css-variables"}
naive cards check-payment <card-uuid>
```

Polls the checkout session. If paid, issues the card and returns `status: "active"`.

## View Card Credentials

```bash theme={"theme":"css-variables"}
naive cards details <card-uuid>
```

Returns full card number, CVC/PIN, expiry, and remaining balance.

## Top Up

```bash theme={"theme":"css-variables"}
naive cards top-up <card-uuid> --amount 5000
```

Returns a checkout URL to add \$50.00 to the card's spending limit.

## Agent Assignment

```bash theme={"theme":"css-variables"}
# Assign
naive cards assign <card-uuid> --agent-id <agent-uuid>

# View assignments
naive cards assignments <card-uuid>

# Remove
naive cards unassign <card-uuid> <agent-uuid>
```

## Log a Transaction

```bash theme={"theme":"css-variables"}
naive cards log-transaction <card-uuid> \
  --amount 2500 \
  --description "Cloud hosting" \
  --merchant-name "AWS"
```

## View Transactions

```bash theme={"theme":"css-variables"}
naive cards transactions
naive cards transactions --card-id <uuid>
naive cards transactions --agent-id <uuid> --limit 20
```

## Cancel a Card

```bash theme={"theme":"css-variables"}
naive cards cancel <card-uuid>
```

Cancels the managed virtual cards card (if applicable), removes agent assignments, and sets status to `canceled`.

## Refund a Failed Card

```bash theme={"theme":"css-variables"}
naive cards refund <card-uuid>
```

Only works for cards in `issuing_failed` or `payment_failed` status. Refunds the original payment.
