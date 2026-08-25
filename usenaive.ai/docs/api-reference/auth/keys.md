> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# API Keys

> Create, list, and revoke API keys.

## Create Key

```
POST /v1/auth/keys
```

<ParamField body="name" type="string">
  Optional label for the key
</ParamField>

<ParamField body="active_project_id" type="string">
  Pin the key to a [project](/docs/architecture/projects). Omit it and the key is
  un-pinned: it acts inside whichever project the request names, falling back to
  the organization's default. A pinned key handed a different project id answers
  **403 `key_project_mismatch`** — it is never redirected into the named project.
</ParamField>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "api_key": "nv_sk_live_...",
    "key_id": "uuid",
    "name": "Production Key",
    "active_project_id": null,
    "created_at": "2026-05-02T..."
  }
  ```
</ResponseExample>

## List Keys

```
GET /v1/auth/keys
```

```json theme={"theme":"css-variables"}
{
  "keys": [
    {
      "id": "uuid",
      "name": "Default Key",
      "last_4": "****",
      "created_at": "2026-05-01T...",
      "last_used_at": "2026-05-02T...",
      "revoked": false
    }
  ]
}
```

## Revoke Key

```
DELETE /v1/auth/keys/:id
```

```json theme={"theme":"css-variables"}
{ "id": "uuid", "revoked": true }
```
