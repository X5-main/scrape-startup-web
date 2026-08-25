> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Select Company

> POST /v1/auth/select-company — Switch active company context.

<ParamField body="company_id" type="string" required>
  UUID of the company to switch to
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/auth/select-company \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "company_id": "uuid" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "selected": true,
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "api_key": "nv_sk_live_new...",
    "hint": "Use this new key for operations in this company context"
  }
  ```
</ResponseExample>

## Notes

* Returns a **new API key** scoped to the selected company
* You must have access to the company (existing membership or key)
* A company is an **organization**; the key it returns acts in that organization's
  **default [project](/docs/architecture/projects)** until a request selects another one with
  `/v1/projects/:project_id/...` or the `X-Naive-Project-Id` header
