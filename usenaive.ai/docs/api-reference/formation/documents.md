> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Formation Documents

> GET /v1/formation/:id/documents — List documents for a company formation.

<ParamField path="id" type="string" required>
  UUID of the formation.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation/formation-uuid/documents \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "documents": [
      {
        "id": "doc-id-1",
        "companyId": "formation-company-id",
        "name": "Company-Name-Aoo.pdf",
        "contentType": "application/pdf",
        "documentType": "ArticlesOfOrganization",
        "createdAt": "2026-05-10 11:20:50"
      },
      {
        "id": "doc-id-2",
        "companyId": "formation-company-id",
        "name": "Company-Name-EinLetter.pdf",
        "contentType": "application/pdf",
        "documentType": "EinLetter",
        "createdAt": "2026-05-10 10:13:19"
      }
    ]
  }
  ```
</ResponseExample>

Documents become available after formation completes. Types include `ArticlesOfOrganization`, `EinLetter`, and `Mail`.
