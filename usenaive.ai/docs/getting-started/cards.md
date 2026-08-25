> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Virtual Cards

> Issue virtual payment cards (managed virtual cards or prepaid gift cards prepaid), fund via checkout, assign to agents, and track transactions.

Virtual cards give your agents the ability to make purchases autonomously. Create a card, fund it through a checkout flow, and assign it to agents who need to spend on behalf of the company.

## CLI First

```bash theme={"theme":"css-variables"}
# Create cardholder and card
naive cards create-cardholder --first-name John --last-name Doe --billing-line1 "123 Main St" --billing-city "SF" --billing-state CA --billing-postal-code 94105
naive cards create --name "Marketing" --spending-limit 10000

# Check funding/issuance state
naive cards check-payment <card-id>
```

## Tools

| Tool                      | Type       | Description                                       |
| ------------------------- | ---------- | ------------------------------------------------- |
| `cards_cardholder`        | Setup      | View the company's cardholder                     |
| `cards_create_cardholder` | Setup      | Create a virtual card cardholder                  |
| `cards_update_cardholder` | Setup      | Update cardholder details                         |
| `cards_list`              | Core       | List all virtual cards                            |
| `cards_create`            | Core       | Create a virtual card (returns checkout URL)      |
| `cards_details`           | Core       | Get card credentials (PAN/CVC or redeem code)     |
| `cards_check_payment`     | Core       | Check if funding completed and issue card         |
| `cards_retry_issue`       | Recovery   | Retry failed card issuance                        |
| `cards_topup`             | Core       | Top up card spending limit (returns checkout URL) |
| `cards_refund`            | Recovery   | Refund a failed card's payment                    |
| `cards_cancel`            | Core       | Cancel/deactivate a card                          |
| `cards_assign`            | Management | Assign an agent to a card                         |
| `cards_unassign`          | Management | Remove agent assignment                           |
| `cards_assignments`       | Management | List agents assigned to a card                    |
| `cards_log_transaction`   | Tracking   | Log a manual spend transaction                    |
| `cards_transactions`      | Tracking   | List card transactions                            |

## Card Providers

| Provider (`provider` value)                           | Card Type                | Limit        | Cardholder Required? |
| ----------------------------------------------------- | ------------------------ | ------------ | -------------------- |
| **Prepaid gift cards** (`prepaid_gift`) — **default** | Prepaid gift card (Visa) | \$150.00 max | No                   |
| **Managed virtual cards** (`managed_virtual`)         | Virtual Visa/Mastercard  | No maximum   | Yes                  |

<Info>
  If you omit `provider`, cards default to **`prepaid_gift`** (prepaid Visa, no cardholder required). Pass `provider: "managed_virtual"` for a full virtual card with no spending cap — that path requires a cardholder to be created first.
</Info>

## Cardholder Setup (managed virtual cards)

Before creating managed virtual cards, you must create a cardholder once per company. This registers identity information for KYC compliance.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards/cardholder \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@acme.com",
      "billingLine1": "123 Main St",
      "billingCity": "San Francisco",
      "billingState": "CA",
      "billingPostalCode": "94105",
      "dobDay": 15,
      "dobMonth": 6,
      "dobYear": 1990
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/cards/cardholder", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: "John",
      lastName: "Doe",
      email: "john@acme.com",
      billingLine1: "123 Main St",
      billingCity: "San Francisco",
      billingState: "CA",
      billingPostalCode: "94105",
      dobDay: 15,
      dobMonth: 6,
      dobYear: 1990,
    }),
  });
  const { cardholder } = await response.json();
  ```
</CodeGroup>

<Info>
  Prepaid gift cards do **not** require a cardholder. You can skip this step if you only use `provider: "prepaid_gift"`.
</Info>

## Pricing

Cards are not billed in credits. The checkout you pay is the amount loaded onto
the card plus a **funding fee** covering payment processing (2.9% + $0.30) and, for
a managed virtual card, the $0.10 issuance fee. On a $150 prepaid gift load the fee
is $4.79 ($4.90 for a managed virtual card), so checkout totals $154.79 and the
full \$150 lands on the card. The same fee applies to a
top-up. Freezing, cancelling, assigning agents, reading details and listing
transactions are all free.

## Creating a Card

Card creation follows a checkout flow — you receive a `checkout_url` for the card's initial funding: the spending limit plus the funding fee.

<Steps>
  <Step title="Create the card">
    <CodeGroup>
      ```bash curl theme={"theme":"css-variables"}
      curl -X POST https://api.usenaive.ai/v1/cards \
        -H "Authorization: Bearer nv_sk_your_key" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "Marketing Card",
          "spending_limit_cents": 10000,
          "provider": "managed_virtual"
        }'
      ```

      ```javascript JavaScript theme={"theme":"css-variables"}
      const response = await fetch("https://api.usenaive.ai/v1/cards", {
        method: "POST",
        headers: {
          "Authorization": "Bearer nv_sk_your_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Marketing Card",
          spending_limit_cents: 10000,
          provider: "managed_virtual",
        }),
      });
      const result = await response.json();
      // result.checkout_url — open to fund the card
      ```
    </CodeGroup>

    **Response:**

    ```json theme={"theme":"css-variables"}
    {
      "card": {
        "id": "card-uuid",
        "name": "Marketing Card",
        "status": "pending_payment",
        "spendingLimitCents": 10000,
        "provider": "managed_virtual"
      },
      "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_live_...",
      "session_id": "cs_live_...",
      "expires_at": "2026-05-04T07:00:00.000Z",
      "hint": "Open the checkout URL to fund the card. After payment, use check-payment to issue.",
      "next_steps": [{ "command": "naive cards check-payment card-uuid", "description": "Check payment and issue card" }]
    }
    ```
  </Step>

  <Step title="Complete payment">
    Open the `checkout_url` in a browser and complete the payment. The checkout session expires after 30 minutes.
  </Step>

  <Step title="Issue the card">
    After payment, check the status and issue the card:

    ```bash theme={"theme":"css-variables"}
    curl -X POST https://api.usenaive.ai/v1/cards/card-uuid/check-payment \
      -H "Authorization: Bearer nv_sk_your_key"
    ```

    If payment succeeded, the card is issued automatically and the response returns `status: "active"`.
  </Step>

  <Step title="Get card credentials">
    Once active, retrieve the full card number and CVC:

    ```bash theme={"theme":"css-variables"}
    curl https://api.usenaive.ai/v1/cards/card-uuid/details \
      -H "Authorization: Bearer nv_sk_your_key"
    ```

    **Response (managed virtual cards):**

    ```json theme={"theme":"css-variables"}
    {
      "card_id": "card-uuid",
      "name": "Marketing Card",
      "provider": "managed_virtual",
      "number": "4242424242424242",
      "cvc": "123",
      "exp_month": 12,
      "exp_year": 2028,
      "last4": "4242",
      "brand": "Visa",
      "spending_limit_cents": 10000,
      "spent_cents": 0,
      "remaining_cents": 10000
    }
    ```
  </Step>
</Steps>

## Top-Up

Add more funds to an active card's spending limit:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cards/card-uuid/top-up \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "amount_cents": 5000 }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/cards/card-uuid/top-up", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount_cents: 5000 }),
  });
  const { checkout_url } = await response.json();
  ```
</CodeGroup>

Returns a `checkout_url` for the top-up payment, just like card creation — the
amount plus the funding fee. The card's spending limit increases by the
`amount_cents` requested.

## Agent Assignments

Cards can be assigned to specific agents, controlling which agents have access to spend:

```bash theme={"theme":"css-variables"}
# Assign an agent
curl -X POST https://api.usenaive.ai/v1/cards/card-uuid/assign \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{ "agent_id": "agent-uuid" }'

# List assignments
curl https://api.usenaive.ai/v1/cards/card-uuid/assignments \
  -H "Authorization: Bearer nv_sk_your_key"

# Remove assignment
curl -X DELETE https://api.usenaive.ai/v1/cards/card-uuid/assign/agent-uuid \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Transaction Logging

Track agent spending by logging manual transactions:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/cards/card-uuid/log-transaction \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_cents": 2500,
    "merchant_name": "AWS",
    "description": "Cloud hosting payment",
    "agent_id": "agent-uuid"
  }'
```

<Info>
  Managed virtual cards also capture transactions automatically via payment webhooks. Manual logging is for non-card purchases (e.g., prepaid gift cards or offline transactions).
</Info>

## Card Statuses

| Status            | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `pending_payment` | Checkout created, waiting for payment                  |
| `active`          | Card is issued and ready to use                        |
| `issuing_failed`  | Payment succeeded but card issuance failed (can retry) |
| `payment_failed`  | Checkout expired or payment failed                     |
| `refunded`        | Payment was refunded                                   |
| `canceled`        | Card was deactivated                                   |

## Error Handling

| Error                           | Cause                                                           | Recovery                                    |
| ------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| `duplicate_record`              | Cardholder already exists for this company                      | Use GET to view or PATCH to update          |
| `invalid_input` (no cardholder) | Tried to create managed virtual cards card without a cardholder | Create a cardholder first                   |
| `invalid_input` (limit too low) | Spending limit below \$1.00 (100 cents)                         | Increase the spending limit                 |
| `invalid_input` (prepaid max)   | prepaid gift card exceeds \$150 limit                           | Use managed virtual cards for higher limits |
| `resource_not_found`            | Card ID doesn't exist or belongs to another company             | Use GET /v1/cards for valid IDs             |
| `provider_error`                | Card provider API error during issuance                         | Use retry-issue or refund                   |

## Typical Workflows (Agent Perspective)

### Creating and using a managed virtual cards card

```
1. GET /v1/cards/cardholder
   → cardholder: null — need to create one

2. POST /v1/cards/cardholder { firstName, lastName, billing..., dob... }
   → cardholder created

3. POST /v1/cards { name: "Agent Card", spending_limit_cents: 10000 }
   → checkout_url: "https://checkout.usenaive.ai/..."
   → Share with user: "Fund the card at this URL"

4. [User completes checkout]

5. POST /v1/cards/<id>/check-payment
   → status: "active", last4: "4242"

6. GET /v1/cards/<id>/details
   → number, cvc, expMonth, expYear — ready to use

7. POST /v1/cards/<id>/log-transaction { amount_cents: 2500, merchant_name: "AWS" }
   → Transaction logged
```

### Creating a prepaid gift card

```
1. POST /v1/cards { name: "Prepaid Card", spending_limit_cents: 5000, provider: "prepaid_gift" }
   → checkout_url — fund via hosted checkout

2. [User completes checkout]

3. POST /v1/cards/<id>/check-payment
   → status: "active" — prepaid gift cards gift card issued

4. GET /v1/cards/<id>/details
   → number (redeem code), pin, redeem_instructions
```

## See also

* [Introducing /cards](https://usenaive.ai/blog/introducing-cards) — primitive overview
* [Corporate travel desk](https://usenaive.ai/blog/how-to-build-an-agentic-travel-agent) — per-trip cards tutorial
* [Event booking cards](https://usenaive.ai/blog/how-agents-use-virtual-cards-for-event-bookings) — venue deposits and tickets
* [Subscription spend cards](https://usenaive.ai/blog/how-agents-manage-subscription-spend-with-virtual-cards) — recurring SaaS per tenant
* [Spend caps, approvals, and revocation](https://usenaive.ai/blog/spend-caps-approvals-revocation-for-ai-agents) — governance cluster
