> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Revoke Session

> DELETE /v1/users/:user_id/sessions/:id — revoke immediately.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/users/USER_ID/sessions/SESSION_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>
