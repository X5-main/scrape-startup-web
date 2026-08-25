> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Put Vault Entry

> PUT /v1/users/:user_id/vault/:key — store/replace (encrypt).

<ParamField body="value" type="string" required />

<ParamField body="kind" type="string">api\_key | password | cookie | token | note | reference</ParamField>
<ParamField body="locked" type="boolean">If true, the value can never be revealed back.</ParamField>
<ParamField body="expires_at" type="string">ISO timestamp; expired entries 404 on reveal.</ParamField>

<ParamField body="metadata" type="object" />

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PUT https://api.usenaive.ai/v1/users/USER_ID/vault/instantly.api_key \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"value":"key_xyz","kind":"api_key"}'
  ```
</RequestExample>

Envelope-encrypted with a managed KMS. See [Vault encryption](/docs/architecture/vault-encryption).
