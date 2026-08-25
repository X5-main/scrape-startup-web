> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update AccountKit

> PATCH /v1/account-kits/:id

Account kits belong to a [project](/docs/architecture/projects). With no project selected the
route acts in the organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/account-kits/...` or the `X-Naive-Project-Id` header.

Send any of `name`, `description`, `primitives_config`, `connections_config`.
Include `requiresApproval` inside a primitive's config (or `connections_config`)
to gate that action behind a human [approval](/docs/architecture/approvals).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/account-kits/KIT_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"connections_config":{"mode":"blocklist","toolkits":["slack"]}}'
  ```
</RequestExample>
