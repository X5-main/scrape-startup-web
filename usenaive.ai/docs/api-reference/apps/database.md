> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Database

> POST /v1/apps/:id/db/query and GET /v1/apps/:id/db/tables — managed Postgres database access for fullstack apps.

Fullstack apps include a dedicated managed Postgres database. These endpoints run against it via the backend management API — Naive injects the credentials.

## List Tables

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2/db/tables \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "tables": [
      { "name": "users", "row_count": 142 },
      { "name": "posts", "row_count": 890 },
      { "name": "comments", "row_count": 2341 }
    ]
  }
  ```
</ResponseExample>

Lists tables in the `public` schema. `row_count` is PostgreSQL's planner estimate (`pg_class.reltuples`) — fast, but approximate until the table has been analyzed.

***

## Run Query

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2/db/query \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users ORDER BY created_at DESC LIMIT 5"}'
```

### Request Body

| Field | Type   | Required | Description                                                                                          |
| ----- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `sql` | string | Yes      | SQL to execute — SELECT, INSERT/UPDATE/DELETE, and DDL (CREATE TABLE, ALTER, etc.) are all supported |

### Response

Returns the result rows as a JSON array (empty array for statements that return no rows):

```json 200 theme={"theme":"css-variables"}
[
  { "id": 1, "email": "user@example.com", "created_at": "2026-01-15T10:00:00Z" }
]
```

<Warning>
  Only available for apps created with `type: fullstack` — `frontend_only` apps return `501 feature_not_configured`. Queries run with full admin privileges (no RLS), so treat this as a root database console.
</Warning>

## Going Further

* **Tracked migrations, auth config, storage, edge functions** — use the [Backend proxy](/docs/api-reference/apps/supabase-proxy), which exposes the entire backend management API scoped to this app's project.
* **Row-level data access via PostgREST** — use `ANY /v1/apps/:id/db/rest/*` (documented on the [Backend proxy](/docs/api-reference/apps/supabase-proxy) page).
* **From your app code** — use `@supabase/supabase-js` with the auto-injected `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Errors

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "feature_not_configured",
    "message": "No Supabase project linked"
  }
}
```

```json 502 theme={"theme":"css-variables"}
{
  "error": {
    "code": "provider_error",
    "message": "DB query failed: relation \"userz\" does not exist"
  }
}
```
