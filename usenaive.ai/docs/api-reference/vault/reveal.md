> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Reveal Vault Entry

> POST /v1/users/:user_id/vault/:key/reveal — decrypt + return value in body.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/vault/instantly.api_key/reveal \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

POST — the secret is returned in the body, never in a URL. `403` if locked; `404` if
expired. Returns `{ key, value, expires_at }`.
