> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Users

> GET /v1/users — list tenant users in your workspace.

Tenant users are **child projects**, and every one lives in a
[project](/docs/architecture/projects). With no project selected the route acts in the
organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/users/...` or the `X-Naive-Project-Id` header.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Returns `{ users: TenantUser[] }`. A default user always exists.
