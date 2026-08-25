> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Billing

> Manage subscriptions, plans, and credit top-ups from the CLI

## Commands

| Command                   | Description                                |
| ------------------------- | ------------------------------------------ |
| `naive billing plans`     | List available plans with pricing          |
| `naive billing subscribe` | Subscribe to a plan (returns checkout URL) |
| `naive billing upgrade`   | Upgrade to a higher plan                   |
| `naive billing status`    | Check subscription + credit balance        |
| `naive billing portal`    | Get billing management URL                 |
| `naive billing packs`     | List credit top-up packs                   |
| `naive billing topup`     | Buy a credit pack (returns checkout URL)   |

## View Plans

```bash theme={"theme":"css-variables"}
naive billing plans
```

Shows the plan on sale (`pro` — \$20/mo, 400 credits) plus **your** plan with its own price and
monthly allowance. Those can differ: a plan that has been retired is no longer sold, but every
subscription already on one keeps its original price and allowance unchanged.

## Subscribe

```bash theme={"theme":"css-variables"}
naive billing subscribe --plan pro
```

Creates a checkout session. Open the returned URL to complete payment. `pro` is the only plan
id `--plan` accepts; a retired id returns `400 invalid_input`.

## Upgrade

```bash theme={"theme":"css-variables"}
naive billing upgrade --plan pro
```

If you have an active subscription, opens the billing portal for plan change. Otherwise creates a new checkout.

## Check Status

```bash theme={"theme":"css-variables"}
naive billing status
```

Shows your current plan with its price and monthly credit allowance, subscription status,
credits remaining, and period end. These are read from your own subscription, so they stay
correct across a repricing.

## Buy More Credits

```bash theme={"theme":"css-variables"}
# List available packs
naive billing packs

# Buy a pack
naive billing topup --pack medium
```

| Pack     | Credits | Price |
| -------- | ------- | ----- |
| `small`  | 200     | \$10  |
| `medium` | 500     | \$23  |
| `large`  | 1000    | \$44  |
| `xl`     | 2500    | \$100 |

## Billing Portal

```bash theme={"theme":"css-variables"}
naive billing portal
```

Opens the billing portal where you can update payment methods, change plans, view invoices, or cancel.
