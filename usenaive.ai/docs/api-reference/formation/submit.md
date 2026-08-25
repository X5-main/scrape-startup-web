> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Submit Formation

> POST /v1/formation — Step 1: Validate KYC and create a $349 hosted checkout session for the formation fee.

This is the first step of company formation. It validates the KYC verification, creates a formation record, and returns a hosted checkout URL for the \$349 formation fee. After the user pays, call `POST /v1/formation/:id/submit` to actually submit the formation.

<ParamField body="verification_id" type="string" required>
  UUID of a completed KYC verification (`ready_for_formation: true`).
</ParamField>

<ParamField body="entity_type" type="string" required>
  Entity type. Currently `"LLC"`.
</ParamField>

<ParamField body="state" type="string" required>
  2-letter US state code (e.g. `"WY"`, `"DE"`).
</ParamField>

<ParamField body="naics_code_id" type="string" required>
  NAICS code ID from `GET /v1/formation/naics-codes`.
</ParamField>

<ParamField body="description" type="string" required>
  Business description (max 256 characters).
</ParamField>

<ParamField body="name_options" type="array" required>
  Company name options. At least 1 required, recommend 3 for availability. Each has `name` and `entity_type_ending`.
</ParamField>

<ParamField body="mailing_address" type="object">
  Optional. Defaults to the primary member's address from KYC if not provided. If provided, must include `line1`, `city`, `state`, `postal_code`, `country`, `phone`.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/formation \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "verification_id": "3dcde53f-abaa-4bb6-a5b5-2d704fad6c19",
      "entity_type": "LLC",
      "state": "WY",
      "naics_code_id": "2o8v0kcaCWyPyi3LJFsCiTCFSyk",
      "description": "AI-powered business automation",
      "name_options": [
        { "name": "Acme Tech", "entity_type_ending": "LLC" },
        { "name": "Acme Solutions", "entity_type_ending": "LLC" }
      ]
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "formation-uuid",
    "status": "awaiting_payment",
    "payment_status": "unpaid",
    "checkout_url": "https://checkout.usenaive.ai/c/pay/cs_test_xxx",
    "checkout_session_id": "cs_test_xxx",
    "price_usd": "$349",
    "entity_type": "LLC",
    "state": "WY",
    "name_options": [
      { "name": "Acme Tech", "entity_type_ending": "LLC" },
      { "name": "Acme Solutions", "entity_type_ending": "LLC" }
    ],
    "next_step": "Open the checkout_url to complete payment, then call POST /v1/formation/:id/submit to submit the formation"
  }
  ```
</ResponseExample>

The user must open the `checkout_url` and pay the \$349 formation fee. Once paid, the payment webhook updates the formation's `payment_status` to `paid`. After that, call `POST /v1/formation/:id/submit` to trigger the formation submission.

<Note>
  **May require approval.** If the user's Account Kit gates formation, an agent
  (API-key) call to this endpoint (`formation.create`) and to
  `POST /v1/formation/:id/submit` (`formation.submit`, the irreversible Doola
  filing) returns `202 { "status": "pending_approval", "approval_id" }` instead of
  running. A human approves it via [Approvals](/docs/api-reference/approvals/overview);
  the step runs on replay. See [Approvals](/docs/getting-started/approvals).
</Note>
