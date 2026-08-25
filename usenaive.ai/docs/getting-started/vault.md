> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Vault

> Per-user encrypted key/value storage for agent-held secrets — envelope-encrypted with a managed KMS, with locked, expiring, and rotatable entries.

The **Credential Vault** stores per-user secrets the agent encounters that aren't
third-party OAuth grants — a SaaS API key it generated, a session cookie, a KYC
reference. Each value is envelope-encrypted with a managed KMS, scoped to one
[tenant user](/docs/getting-started/users) (see
[Architecture → Vault encryption](/docs/architecture/vault-encryption)).

## CLI First

```bash theme={"theme":"css-variables"}
naive vault put instantly.api_key key_xyz --user alice --kind api_key
naive vault reveal instantly.api_key --user alice
naive vault list --user alice
```

## Tools

| Tool           | Type       | Description                                        |
| -------------- | ---------- | -------------------------------------------------- |
| `vault_list`   | Core       | List a user's entry keys (values masked)           |
| `vault_put`    | Core       | Store or replace an encrypted entry                |
| `vault_reveal` | Core       | Decrypt and return a value (POST — never in a URL) |
| `vault_delete` | Core       | Delete an entry                                    |
| `vault_rotate` | Management | Re-wrap the encryption key (or fully re-encrypt)   |

## Storing & Revealing

`put` is idempotent on the key. `reveal` is a **POST** so the secret travels in the
response body, never in a URL.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Store (PUT)
  curl -X PUT https://api.usenaive.ai/v1/users/{user_id}/vault/instantly.api_key \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "value": "key_xyz", "kind": "api_key" }'

  # Reveal (POST — secret in body)
  curl -X POST https://api.usenaive.ai/v1/users/{user_id}/vault/instantly.api_key/reveal \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  await naive.forUser(alice.id).vault.put("instantly.api_key", "key_xyz", { kind: "api_key" });
  const { value } = await naive.forUser(alice.id).vault.reveal("instantly.api_key");
  ```
</CodeGroup>

**Response (reveal):**

```json theme={"theme":"css-variables"}
{ "key": "instantly.api_key", "value": "key_xyz", "expires_at": null }
```

### Parameters (put)

| Param        | Type    | Required | Default | Description                                                      |
| ------------ | ------- | -------- | ------- | ---------------------------------------------------------------- |
| `value`      | string  | Yes      | —       | The secret to encrypt and store                                  |
| `kind`       | string  | No       | `note`  | `api_key`, `password`, `cookie`, `token`, `note`, `reference`    |
| `locked`     | boolean | No       | `false` | If true, the entry can be stored but **never revealed** back     |
| `expires_at` | string  | No       | —       | ISO timestamp; excluded from list and 404 on reveal once expired |
| `metadata`   | object  | No       | —       | Arbitrary JSON attached to the entry                             |

<Info>
  `locked` entries are agent-profile-only — useful when an agent must *use* a secret indirectly
  but should never read it back. `rotate` re-wraps the data key cheaply;
  `?regenerate_dek=true` fully re-encrypts the value.
</Info>

## Listing & Deleting

```bash theme={"theme":"css-variables"}
# List (values masked)
curl https://api.usenaive.ai/v1/users/{user_id}/vault \
  -H "Authorization: Bearer nv_sk_your_key"

# Delete
curl -X DELETE https://api.usenaive.ai/v1/users/{user_id}/vault/instantly.api_key \
  -H "Authorization: Bearer nv_sk_your_key"
```

Third-party connections surface read-only in the dashboard Vault tab alongside vault
entries, for one unified per-user credential view.

## Error Handling

| Error                    | Cause                                            | Recovery                                          |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------- |
| `not_found`              | Key doesn't exist, expired, or invalid `user_id` | Use `GET .../vault` to list current keys          |
| `forbidden`              | Tried to `reveal` a `locked` entry               | Locked entries can't be revealed; store a new one |
| `invalid_input`          | Missing `value` on put                           | Provide a string `value`                          |
| `feature_not_configured` | Vault KMS not configured on the API              | Contact support                                   |

## Typical Workflow

```
Agent generates an API key on a SaaS during onboarding
    │
    ├─ PUT  /v1/users/alice/vault/saas.api_key      → Store it (kind: api_key)
    │
    ├─ POST /v1/users/alice/vault/saas.api_key/reveal  → Read it back when calling the SaaS
    │
    └─ POST /v1/users/alice/vault/saas.api_key/rotate  → Periodically re-wrap the key
```
