> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Secrets

> Manage app environment variables — stored encrypted by Naive and synced to the app environment.

Secrets are environment variables for your app. Naive stores them encrypted and syncs them to the app's **hosting environment**: `production` maps to the production environment; `preview` maps to the preview + development environments. Redeploy after changes for them to take effect.

These are provisioned automatically and shouldn't be set manually:

* `NEXT_PUBLIC_APP_URL` — all apps
* `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — fullstack apps

## List Secrets

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/secrets \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "secrets": [
      {
        "id": "secret-uuid-1",
        "key": "PAYMENTS_SECRET_KEY",
        "target": "production",
        "createdAt": "2026-01-15T10:00:00Z"
      },
      {
        "id": "secret-uuid-2",
        "key": "NEXT_PUBLIC_SUPABASE_URL",
        "target": "preview",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ]
  }
  ```
</ResponseExample>

Values are never returned in list responses — use the reveal endpoint for individual values.

***

## Set Secret

Creates the variable, or updates it in place if the key already exists for that target (upserted on the hosting environment as well):

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/:id/secrets \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"key": "PAYMENTS_KEY", "value": "sk_live_...", "target": "production"}'
```

### Request Body

| Field    | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| `key`    | string | Yes      | Variable name             |
| `value`  | string | Yes      | Variable value            |
| `target` | string | Yes      | `preview` or `production` |

### Response

```json 200 theme={"theme":"css-variables"}
{
  "key": "PAYMENTS_KEY",
  "target": "production"
}
```

***

## Reveal Secret

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/apps/:id/secrets/PAYMENTS_KEY/reveal?target=production" \
  -H "Authorization: Bearer nv_sk_live_..."
```

Returns the decrypted value:

```json 200 theme={"theme":"css-variables"}
{
  "value": "sk_live_abc123..."
}
```

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "resource_not_found",
    "message": "Secret not found"
  }
}
```

***

## Delete Secret

Removes the variable from Naive **and** from the hosting environment:

```bash theme={"theme":"css-variables"}
curl -X DELETE "https://api.usenaive.ai/v1/apps/:id/secrets/PAYMENTS_KEY?target=production" \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "ok": true
}
```

## Errors

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "target must be 'preview' or 'production'"
  }
}
```
