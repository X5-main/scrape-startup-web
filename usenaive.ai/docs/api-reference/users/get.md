> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get User

> GET /v1/users/:user_id — fetch a tenant user.

Tenant users are **child projects**, and every one lives in a
[project](/docs/architecture/projects). With no project selected the route acts in the
organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/users/...` or the `X-Naive-Project-Id` header.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/USER_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Returns 404 if the user belongs to another workspace (cross-tenant guard).
