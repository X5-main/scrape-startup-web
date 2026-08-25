> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Formation

> Company formation (LLC incorporation) — NAICS codes, submit, track status, download documents.

## Overview

| Command                                          | Description                                         | Cost                           |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------------ |
| `naive formation naics-codes`                    | List NAICS industry codes                           | Free                           |
| `naive formation submit [options]`               | Step 1: Validate KYC + create \$349 hosted checkout | Free (creates checkout)        |
| `naive formation retry-payment <id>`             | Generate fresh checkout URL if original expired     | Free                           |
| `naive formation execute <id>`                   | Step 2: Submit for filing after payment             | \$349 paid via hosted checkout |
| `naive formation list`                           | List all formations                                 | Free                           |
| `naive formation status <id>`                    | Get formation details                               | Free                           |
| `naive formation documents <id>`                 | List formation documents                            | Free                           |
| `naive formation download <formationId> <docId>` | Get document download URL                           | Free                           |

## Two-Step Flow

```
1. naive formation submit ...        → Returns checkout_url for $349 payment
2. (User opens checkout_url, pays)   → payment webhook marks formation as paid
3. naive formation execute <id>      → Dispatches the filing (decrypts PII from the encrypted identity vault)
```

***

## List NAICS Codes

```bash theme={"theme":"css-variables"}
naive formation naics-codes
```

Returns industry codes needed for the `--naics` parameter when submitting.

***

## Submit Formation (Step 1: Create Checkout)

Requires completed KYC verification for all founders. Returns a hosted checkout URL for the \$349 formation fee.

```bash theme={"theme":"css-variables"}
naive formation submit \
  --verification-id 3dcde53f-abaa-4bb6-a5b5-2d704fad6c19 \
  --entity-type LLC \
  --state WY \
  --naics 2o8v0kcaCWyPyi3LJFsCiTCFSyk \
  --description "AI-powered business automation" \
  --names '[{"name":"Acme Tech","entity_type_ending":"LLC"},{"name":"Acme Solutions","entity_type_ending":"LLC"}]'
```

### Options

| Flag                     | Required | Description                                    |
| ------------------------ | -------- | ---------------------------------------------- |
| `--verification-id <id>` | Yes      | UUID of completed KYC verification             |
| `--entity-type <type>`   | Yes      | Entity type to form (currently supports LLC)   |
| `--state <state>`        | Yes      | 2-letter US state code                         |
| `--naics <naicsCodeId>`  | Yes      | NAICS code ID                                  |
| `--description <desc>`   | Yes      | Business description (max 256 chars)           |
| `--names <json>`         | Yes      | JSON array of name options                     |
| `--address <json>`       | No       | JSON mailing address (defaults to KYC address) |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "formation.submit",
  "result": {
    "id": "formation-uuid",
    "status": "awaiting_payment",
    "payment_status": "unpaid",
    "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_test_xxx",
    "price_usd": "$349",
    "next_step": "Open the checkout_url to complete payment, then call POST /v1/formation/:id/submit to submit the formation"
  }
}
```

***

## Retry Payment

If the hosted checkout session expires before the user completes payment, the formation moves to `failed`. Use this command to generate a new checkout URL without losing the business info.

```bash theme={"theme":"css-variables"}
naive formation retry-payment <formation-id>
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "formation.retry-payment",
  "result": {
    "id": "formation-uuid",
    "status": "awaiting_payment",
    "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_test_new_xxx",
    "price_usd": "$349"
  }
}
```

Cannot be used on formations that are already paid -- those should use `execute` instead.

***

## Execute Formation (Step 2: Submit for filing)

Run after the user has paid via the checkout URL. Decrypts PII from the encrypted identity vault and submits the filing.

```bash theme={"theme":"css-variables"}
naive formation execute <formation-id>
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "formation.execute",
  "result": {
    "id": "formation-uuid",
    "formation_customer_id": "formation-customer-id",
    "formation_company_id": "formation-company-id",
    "status": "submitted",
    "payment_status": "paid"
  }
}
```

If `payment_status` is not `paid`, returns an `invalid_input` error.

***

## List Formations

```bash theme={"theme":"css-variables"}
naive formation list
```

***

## Check Status

```bash theme={"theme":"css-variables"}
naive formation status <formation-id>
```

***

## List Documents

```bash theme={"theme":"css-variables"}
naive formation documents <formation-id>
```

Available after formation completes. Types: `ArticlesOfOrganization`, `EinLetter`, `Mail`.

***

## Download Document

```bash theme={"theme":"css-variables"}
naive formation download <formation-id> <document-id>
```

Returns a temporary signed download URL (expires in \~1 hour).
