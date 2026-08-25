> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Connections (catalog)

> GET /v1/users/:user_id/connections — toolkit catalog + status, kit-filtered.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/users/USER_ID/connections?search=gmail" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Query params: `search`, `cursor`, `limit` (max 50), `connected=true|false`. Returns
`{ toolkits, nextCursor }`. Use `default` as the user id for the api key's default user.
