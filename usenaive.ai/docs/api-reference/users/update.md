> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update User

> PATCH /v1/users/:user_id — update a tenant user.

Tenant users are **child projects**, and every one lives in a
[project](/docs/architecture/projects). With no project selected the route acts in the
organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/users/...` or the `X-Naive-Project-Id` header.

<ParamField body="email" type="string" />

<ParamField body="label" type="string" />

<ParamField body="account_kit_id" type="string">Reassign the user's AccountKit.</ParamField>
<ParamField body="status" type="string">active | suspended</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/users/USER_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"account_kit_id":"kit_pro"}'
  ```
</RequestExample>
