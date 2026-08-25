> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Assign User to Kit

> POST /v1/account-kits/:id/users/:user_id/assign

Account kits belong to a [project](/docs/architecture/projects). With no project selected the
route acts in the organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/account-kits/...` or the `X-Naive-Project-Id` header.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/account-kits/KIT_ID/users/USER_ID/assign \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Moves the user onto the kit. The user's next agent session reflects the new policy.
