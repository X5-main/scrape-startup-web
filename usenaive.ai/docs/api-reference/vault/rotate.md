> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Rotate Vault Entry

> POST /v1/users/:user_id/vault/:key/rotate — re-wrap the DEK.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST "https://api.usenaive.ai/v1/users/USER_ID/vault/instantly.api_key/rotate" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Default: KMS `ReEncrypt` re-wraps the data key under the current CMK version (value
ciphertext unchanged — cheap). `?regenerate_dek=true` does a full DEK rotation +
value re-encryption.
