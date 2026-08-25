> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get AccountKit

> GET /v1/account-kits/:id

Account kits belong to a [project](/docs/architecture/projects). With no project selected the
route acts in the organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/account-kits/...` or the `X-Naive-Project-Id` header.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/account-kits/KIT_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>
