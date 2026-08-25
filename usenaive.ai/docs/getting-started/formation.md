> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Formation

> Incorporate an LLC end-to-end — submit formation with KYC-verified founders, track status, and download documents.

Company Formation is the **incorporation primitive**. Naive orchestrates LLC formation through Naive's formation engine, pulling verified PII from the encrypted identity vault at submission time so sensitive data (SSN, DOB, addresses) never touches your database. Identity verification (KYC) for all founders must be completed before formation can proceed.

## CLI First

```bash theme={"theme":"css-variables"}
# 1) Get NAICS options
naive formation naics-codes

# 2) Submit formation to create $349 checkout URL
naive formation submit --verification-id <verification-id> --state WY --naics <naics-code-id> --description "AI-powered business automation platform" --names '[{"name":"Acme Tech","entity_type_ending":"LLC"}]'

# 3) After payment, execute submission for filing
naive formation execute <formation-id>
```

## Tools

| Tool                          | Type | Description                                         | Cost                           |
| ----------------------------- | ---- | --------------------------------------------------- | ------------------------------ |
| `list_naics_codes`            | Info | List NAICS industry codes                           | Free                           |
| `submit_formation`            | Core | Step 1: Validate KYC + create \$349 hosted checkout | Free (creates checkout)        |
| `retry_formation_payment`     | Core | Regenerate hosted checkout if it expired            | Free                           |
| `execute_formation`           | Core | Step 2: Submit for filing after payment             | \$349 paid via hosted checkout |
| `list_formations`             | Info | List all formation requests                         | Free                           |
| `get_formation`               | Info | Get formation status and details                    | Free                           |
| `formation_documents`         | Info | List formation documents                            | Free                           |
| `formation_document_download` | Info | Get document download URL                           | Free                           |

## Prerequisites

1. **Completed identity verification** -- all founders must have passed KYC via the [verification primitive](/docs/getting-started/verification). The verification's `ready_for_formation` must be `true`.
2. **NAICS code** -- select the industry code for your business from the NAICS codes list.
3. **Business details** -- entity type, state, company name options, description, and (optionally) mailing address.
4. **Payment** -- \$349 USD via hosted checkout.

## Workflow

```
1. Complete KYC for all founders
   └─ GET /v1/verification/:id → ready_for_formation: true

2. Select NAICS code
   └─ GET /v1/formation/naics-codes → pick naics_code_id

3. Submit formation (creates hosted checkout)
   └─ POST /v1/formation (business info + verification_id)
   └─ Returns checkout_url for $349 payment

4. User pays via hosted checkout
   └─ Webhook updates payment_status to "paid"

5. Execute formation (submits the filing)
   └─ POST /v1/formation/:id/submit
   └─ PII decrypted from encrypted identity vault and dispatched for filing

6. Track progress
   └─ GET /v1/formation/:id → status updates

7. Download documents when ready
   └─ GET /v1/formation/:id/documents → Articles of Organization, EIN Letter
```

## Idempotency & Recovery

**Duplicate prevention.** If you call `POST /v1/formation` for a verification that already has a non-failed formation, the API returns `duplicate_record` with the existing formation's ID. This prevents accidental double-billing. Call `GET /v1/formation/:id` on the existing one to recover its state.

**Failed before payment.** If a formation hits `failed` status with `payment_status: "unpaid"` (e.g. checkout session expired), use `POST /v1/formation/:id/retry-payment` to generate a fresh checkout URL. The business info is preserved.

**Failed after payment.** If a formation hits `failed` after payment was confirmed (the formation filing was rejected), do **not** create a new formation -- the original \$349 is held against that record. Contact `support@usenaive.ai` for resolution. You can also retry the formation submission with `POST /v1/formation/:id/submit`, which may resolve transient errors.

## Pricing

LLC formation costs **\$349 USD**, paid upfront via hosted checkout. The fee covers:

* managed formation service
* State filing fees
* Registered agent service
* EIN application
* All required legal documents

Payment is collected via hosted checkout when you call `POST /v1/formation`. The formation only proceeds to filing after payment is confirmed.

## Listing NAICS Codes

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation/naics-codes \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/formation/naics-codes", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const { naics_codes } = await response.json();
  ```
</CodeGroup>

## Submitting Formation

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/formation \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "verification_id": "3dcde53f-abaa-4bb6-a5b5-2d704fad6c19",
      "entity_type": "LLC",
      "state": "WY",
      "naics_code_id": "2o8v0kcaCWyPyi3LJFsCiTCFSyk",
      "description": "AI-powered business automation platform",
      "name_options": [
        { "name": "Acme Tech", "entity_type_ending": "LLC" },
        { "name": "Acme Technologies", "entity_type_ending": "LLC" },
        { "name": "Acme Solutions", "entity_type_ending": "L.L.C." }
      ],
      "mailing_address": {
        "line1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94105",
        "country": "US",
        "phone": "+14155551234"
      }
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/formation", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      verification_id: "3dcde53f-abaa-4bb6-a5b5-2d704fad6c19",
      entity_type: "LLC",
      state: "WY",
      naics_code_id: "2o8v0kcaCWyPyi3LJFsCiTCFSyk",
      description: "AI-powered business automation platform",
      name_options: [
        { name: "Acme Tech", entity_type_ending: "LLC" },
        { name: "Acme Technologies", entity_type_ending: "LLC" },
        { name: "Acme Solutions", entity_type_ending: "L.L.C." },
      ],
      mailing_address: {
        line1: "123 Main St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94105",
        country: "US",
        phone: "+14155551234",
      },
    }),
  });
  const formation = await response.json();
  ```
</CodeGroup>

**Response (201):**

```json theme={"theme":"css-variables"}
{
  "id": "formation-uuid",
  "status": "awaiting_payment",
  "payment_status": "unpaid",
  "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_test_xxx...",
  "checkout_session_id": "cs_test_xxx",
  "price_usd": "$349",
  "entity_type": "LLC",
  "state": "WY",
  "name_options": [...],
  "next_step": "Open the checkout_url to complete payment, then call POST /v1/formation/:id/submit to submit the formation"
}
```

<Warning>
  PII fields (SSN, DOB, member addresses) are **not** included in the request body. They are decrypted from the encrypted identity vault during the **execute** step, after payment is confirmed. This ensures sensitive data never persists in Naive's database.
</Warning>

### Parameters

| Param             | Type   | Required | Description                                                         |
| ----------------- | ------ | -------- | ------------------------------------------------------------------- |
| `verification_id` | string | Yes      | UUID of a completed KYC verification                                |
| `entity_type`     | string | Yes      | `"LLC"`                                                             |
| `state`           | string | Yes      | 2-letter US state code (e.g. `"WY"`, `"DE"`)                        |
| `naics_code_id`   | string | Yes      | From `GET /v1/formation/naics-codes`                                |
| `description`     | string | Yes      | Business description (max 256 chars)                                |
| `name_options`    | array  | Yes      | At least 1 name option (recommend 3 for availability)               |
| `mailing_address` | object | No       | Optional. Defaults to primary member's KYC address if not provided. |

## Executing Formation (After Payment)

After the user pays via the checkout URL, the payment webhook updates `payment_status` to `paid`. Then call:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/formation/formation-uuid/submit \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/formation/formation-uuid/submit", {
    method: "POST",
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const result = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "formation-uuid",
  "formation_customer_id": "formation-customer-id",
  "formation_company_id": "formation-company-id",
  "status": "submitted",
  "payment_status": "paid",
  "entity_type": "LLC",
  "state": "WY"
}
```

This step:

1. Verifies `payment_status === "paid"` (returns `invalid_input` error if not)
2. Creates a formation customer
3. Decrypts PII from encrypted identity vault
4. Maps fields to the filing schema
5. Submits the formation for filing

### Name Options

Provide multiple name options in case your first choice is unavailable in the state. Each option needs:

| Field                | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `name`               | Company name without entity ending                               |
| `entity_type_ending` | `"LLC"`, `"L.L.C"`, `"L.L.C."`, or `"Limited Liability Company"` |

## Formation Statuses

| Status                | Meaning                                            |
| --------------------- | -------------------------------------------------- |
| `awaiting_payment`    | Created, waiting for \$349 hosted checkout payment |
| `pending`             | Payment received, ready for execute step           |
| `submitted`           | Submitted for filing, formation in progress        |
| `formation_completed` | Formation complete, documents being generated      |
| `failed`              | Formation failed (check `formation_error`)         |

## Payment Statuses

| Status     | Meaning                                    |
| ---------- | ------------------------------------------ |
| `unpaid`   | hosted checkout created but not paid       |
| `paid`     | Payment confirmed, formation can proceed   |
| `refunded` | Payment was refunded (formation cancelled) |

## Documents

After formation completes, documents become available:

| Document Type            | Description                   |
| ------------------------ | ----------------------------- |
| `ArticlesOfOrganization` | Filed articles with the state |
| `EinLetter`              | IRS EIN assignment letter     |
| `Mail`                   | Business mail documents       |

```bash theme={"theme":"css-variables"}
# List documents
curl https://api.usenaive.ai/v1/formation/formation-uuid/documents \
  -H "Authorization: Bearer nv_sk_your_key"

# Get download URL
curl https://api.usenaive.ai/v1/formation/formation-uuid/documents/doc-id \
  -H "Authorization: Bearer nv_sk_your_key"
```

<Info>
  Document download URLs are temporary signed URLs that expire after approximately 1 hour. Download immediately or re-fetch the URL when needed.
</Info>

## Error Handling

| Error                    | Cause                                | Recovery                    |
| ------------------------ | ------------------------------------ | --------------------------- |
| `feature_not_configured` | FORMATION\_API\_KEY not set          | Configure env var           |
| `invalid_input`          | KYC not completed                    | Complete verification first |
| `invalid_input`          | Missing required fields              | Check parameters            |
| `resource_not_found`     | Formation or verification not found  | Check UUIDs                 |
| `provider_error`         | Filing provider rejected the request | Check field validation      |

## Typical Workflow

```
Agent receives task: "Incorporate my company as a Wyoming LLC"
    │
    ├─ GET /v1/verification/:id                    → Confirm KYC passed
    │   → ready_for_formation: true
    │
    ├─ GET /v1/formation/naics-codes               → Find industry code
    │   → naicsCodeId: "2o8v0kcaCWyPyi3LJFsCiTCFSyk"
    │
    ├─ POST /v1/formation                          → Submit (creates hosted checkout)
    │   { verification_id, state: "WY", ... }
    │   → status: awaiting_payment, checkout_url
    │
    ├─ User opens checkout_url and pays $349       → payment webhook fires
    │   → payment_status: paid, status: pending
    │
    ├─ POST /v1/formation/:id/submit               → Execute formation
    │   → id: formation-uuid, status: submitted
    │
    ├─ GET /v1/formation/:id                       → Check progress
    │   → status: submitted (days/weeks)
    │
    ├─ GET /v1/formation/:id                       → Check again
    │   → status: formation_completed
    │
    ├─ GET /v1/formation/:id/documents             → List documents
    │   → ArticlesOfOrganization, EinLetter
    │
    └─ GET /v1/formation/:id/documents/:docId      → Download
        → downloadUrl (signed, 1hr expiry)
```
