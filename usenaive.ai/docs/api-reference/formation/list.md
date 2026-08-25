> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Formations

> GET /v1/formation — List all company formation requests.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "formations": [
      {
        "id": "formation-uuid",
        "entity_type": "LLC",
        "state": "WY",
        "status": "submitted",
        "payment_status": "paid",
        "formation_company_id": "formation-company-id",
        "created_at": "2026-05-04T12:00:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>
