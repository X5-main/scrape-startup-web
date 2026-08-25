> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create User

> POST /v1/users — create a tenant user.

Tenant users are **child projects**, and every one lives in a
[project](/docs/architecture/projects). With no project selected the route acts in the
organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/users/...` or the `X-Naive-Project-Id` header.

<ParamField body="external_id" type="string">Your stable id for the user (unique per workspace).</ParamField>
<ParamField body="email" type="string">Optional email.</ParamField>
<ParamField body="label" type="string">Optional label.</ParamField>
<ParamField body="account_kit_id" type="string">AccountKit to assign (defaults to the Default kit).</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"external_id":"alice_db_uuid","email":"alice@example.com"}'
  ```
</RequestExample>
