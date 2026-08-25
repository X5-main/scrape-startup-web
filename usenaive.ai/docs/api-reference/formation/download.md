> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Download Formation Document

> GET /v1/formation/:id/documents/:documentId — Get a temporary signed download URL.

<ParamField path="id" type="string" required>
  UUID of the formation.
</ParamField>

<ParamField path="documentId" type="string" required>
  Document ID from the documents list.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation/formation-uuid/documents/doc-id \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "doc-id",
    "companyId": "formation-company-id",
    "name": "Company-Name-EinLetter.pdf",
    "contentType": "application/pdf",
    "documentType": "EinLetter",
    "downloadUrl": "https://documents.usenaive.ai/...?X-Amz-Signature=..."
  }
  ```
</ResponseExample>

The `downloadUrl` is a temporary signed URL that expires after approximately 1 hour. Download immediately or re-fetch when needed.
