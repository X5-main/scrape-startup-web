> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Database

> Managed Postgres for your app or your users' apps — raw SQL, REST CRUD, and migrations on a fullstack app's managed backend.

The **Database** primitive is managed Postgres, backed by a [fullstack app's](/docs/getting-started/apps) managed backend. Naive owns the credentials and injects them — you run SQL, read/write rows through a REST interface, and apply migrations without ever holding a database key.

<Info>
  Database (and Storage, Edge Functions, Auth) operate on a **fullstack app's** managed backend. Create one first: `naive.apps.create({ name, type: "fullstack" })`. These are curated surfaces over the same scoped backend proxy that powers the [apps primitive](/docs/api-reference/apps/supabase-proxy).
</Info>

## Two ways to use it

Database works for **your own project** and for **each of your end-users' projects**, using Naive's multi-tenancy:

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// 1. Your own project — the account's default user
await naive.database.query("select now()");

// 2. A specific end-user's project (multi-tenant SaaS)
const alice = await naive.users.create({ external_id: "alice" });
await naive.apps.create({ name: "Alice Workspace", type: "fullstack" }); // default user
await naive.forUser(alice.id).apps.create({ name: "Alice App", type: "fullstack" });
await naive.forUser(alice.id).database.query("select count(*) from profiles");
```

When a user owns exactly one fullstack app, the call auto-resolves it. With multiple apps, pass `{ appId }`.

## SQL

```ts theme={"theme":"css-variables"}
// Arbitrary SQL — SELECT, INSERT/UPDATE/DELETE, and DDL
await naive.database.query("create table notes (id serial primary key, body text)");
const rows = await naive.database.query("select * from notes order by id desc limit 10");

// Target a specific app when the user has several
await naive.database.query("select 1", { appId: "app-uuid" });

// List tables with row counts
const { tables } = await naive.database.tables();
```

## REST CRUD

```ts theme={"theme":"css-variables"}
const notes = naive.database.from("notes");
await notes.insert({ body: "hello" });
await notes.select("id,body", "order=id.desc&limit=5");
await notes.update({ body: "edited" }, "id=eq.1");
await notes.delete("id=eq.1");
```

Filters use [the REST query syntax](https://postgrest.org/en/stable/references/api/tables_views.html). Runs with the service-role key (RLS bypassed) — treat it as admin access.

## Schema changes

```ts theme={"theme":"css-variables"}
await naive.database.migrate(
  "alter table notes add column created_at timestamptz default now()",
);
```

`migrate` runs DDL against the database (works on any plan). The *tracked* `database/migrations` endpoint is gated to approved orgs — reach it directly through the [backend proxy](/docs/api-reference/apps/supabase-proxy) (`.../supabase/proxy/v1/projects/{ref}/database/migrations`) where your org has access.

## REST

```bash theme={"theme":"css-variables"}
# SQL
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/db/query \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"sql": "select now()"}'

# REST
curl "https://api.usenaive.ai/v1/apps/<app-id>/db/rest/notes?select=*" \
  -H "Authorization: Bearer nv_sk_live_..."
```

Your own project is reached at `/v1/apps/<app-id>/…`; an **end-user's** project is `/v1/users/<user-id>/apps/<app-id>/…`. The SDK picks the right path automatically (`naive.database` vs `naive.forUser(id).database`). See the [Database API reference](/docs/api-reference/database/overview).

## Billing

Queries and other **per-operation** calls are **free** — there is no per-request credit cost. The underlying managed Postgres project, however, costs us a recurring vendor fee for as long as it exists, so a provisioned database is **duration-metered** (`database_usage`) while it is `ready` — the same way [compute and hosted runtime](/docs/getting-started/credits#infrastructure-duration-metered) are billed by time. That meter is **not currently charging**: it ships at a rate of `0`, and the expected \~`0.3 credits/hour` per managed Postgres project will be [announced](/docs/getting-started/credits#infrastructure-duration-metered) before it starts. `naive down` tears it down and stops the meter; your data persists until then. Account Kits can gate the `database` primitive per user.
