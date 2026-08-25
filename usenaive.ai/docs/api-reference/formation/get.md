> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Formation

> GET /v1/formation/:id — Get formation details, status, and documents.

<ParamField path="id" type="string" required>
  UUID of the formation.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation/formation-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "formation-uuid",
    "company_id": "company-uuid",
    "verification_id": "verification-uuid",
    "formation_customer_id": "formation-customer-id",
    "formation_company_id": "formation-company-id",
    "entity_type": "LLC",
    "state": "WY",
    "naics_code_id": "2o8v0kcaCWyPyi3LJFsCiTCFSyk",
    "description": "AI-powered business automation",
    "name_options": [...],
    "mailing_address": {...},
    "status": "submitted",
    "payment_status": "paid",
    "checkout_session_id": "cs_test_xxx",
    "formation_error": null,
    "documents": null,
    "created_at": "2026-05-04T12:00:00.000Z",
    "updated_at": "2026-05-04T12:00:00.000Z"
  }
  ```
</ResponseExample>

`status` values: `awaiting_payment`, `pending`, `submitted`, `formation_completed`, `failed`.
`payment_status` values: `unpaid`, `paid`, `refunded`.
