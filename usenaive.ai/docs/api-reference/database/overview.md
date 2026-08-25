> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Database Overview

> Managed Postgres on a fullstack app's managed backend — SQL, REST CRUD, and migrations.

The Database primitive operates on a [fullstack app's](/docs/api-reference/apps/overview) managed backend. All routes are app-scoped and exist under both the company mount (`/v1/apps/:id/...`) and the per-user mount (`/v1/users/:user_id/apps/:id/...`). The `:user_id` may be `default` (your own project) or an end-user id (multi-tenant). On per-user mounts the kit must enable the `database` primitive.

## Endpoints

| Method | Path                                                                | Description                                                  |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `POST` | `/v1/apps/:id/db/query`                                             | Run SQL (SELECT / DML / DDL) via the backend management API  |
| `GET`  | `/v1/apps/:id/db/tables`                                            | List public-schema tables with row counts                    |
| `ANY`  | `/v1/apps/:id/db/rest/*`                                            | REST data API passthrough (service-role key)                 |
| `ANY`  | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/database/migrations` | Tracked migrations (management API — gated to approved orgs) |

## SQL

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/db/query \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"sql": "select * from users limit 10"}'
```

Returns the result rows as a JSON array. DDL is supported. Fullstack apps only (`501 feature_not_configured` otherwise).

## REST

```bash theme={"theme":"css-variables"}
# Select
curl "https://api.usenaive.ai/v1/apps/<app-id>/db/rest/notes?select=id,body&order=id.desc" \
  -H "Authorization: Bearer nv_sk_live_..."

# Insert (Prefer returns the created row)
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/db/rest/notes \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -H "Prefer: return=representation" -d '{"body": "hello"}'
```

Forwards to the project's `/rest/v1/*` with the service-role key (RLS bypassed). Uses [the REST query syntax](https://postgrest.org/en/stable/references/api/tables_views.html).

## SDK

```ts theme={"theme":"css-variables"}
await naive.database.query("select now()");
await naive.forUser(userId).database.from("notes").insert({ body: "hello" });
```

See the [Database guide](/docs/getting-started/database) and the [`database` sub-client](/docs/sdk/sub-clients/database).
