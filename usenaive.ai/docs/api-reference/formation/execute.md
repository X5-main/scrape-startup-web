> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Execute Formation

> POST /v1/formation/:id/submit — Step 2: Submit formation after payment is complete.

After the user pays the \$349 formation fee via the hosted checkout URL returned from `POST /v1/formation`, call this endpoint to dispatch the formation for filing. This step:

1. Verifies `payment_status === "paid"` (returns `invalid_input` if not)
2. Creates a formation customer
3. Decrypts PII (SSN, DOB, address, etc.) from encrypted identity vault for each KYC member
4. Maps fields to the filing schema (SSN format, DOB format, country code conversion)
5. Submits formation for filing

<ParamField path="id" type="string" required>
  UUID of the formation (from `POST /v1/formation` response).
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/formation/formation-uuid/submit \
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
    "status": "submitted",
    "payment_status": "paid",
    "formation_error": null,
    "documents": null,
    "created_at": "2026-05-04T12:00:00.000Z",
    "updated_at": "2026-05-04T12:05:00.000Z"
  }
  ```
</ResponseExample>

If the formation has already been submitted, this returns the current state (idempotent). If any step fails, the formation status becomes `failed` and `formation_error` contains the error message — but the `formation_customer_id` is preserved so a retry can resume from where it left off.
