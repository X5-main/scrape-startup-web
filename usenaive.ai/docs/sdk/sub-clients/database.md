> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# database

> Managed Postgres on a fullstack app — SQL, REST CRUD, and migrations.

```ts theme={"theme":"css-variables"}
// SQL (SELECT / DML / DDL) — auto-resolves the user's single fullstack app
await naive.database.query("select now()");
await naive.database.query("create table notes (id serial primary key, body text)");

// Target a specific app when the user owns several
await naive.database.query("select 1", { appId: "app-uuid" });

// Tables + row counts
const { tables } = await naive.database.tables();

// REST CRUD (service-role key; RLS bypassed)
const notes = naive.database.from("notes");
await notes.insert({ body: "hello" });
await notes.select("id,body", "order=id.desc&limit=5");
await notes.update({ body: "edited" }, "id=eq.1");
await notes.delete("id=eq.1");

// Schema change (DDL)
await naive.database.migrate("alter table notes add column created_at timestamptz default now()");
```

Requires a `type: "fullstack"` [app](/docs/sdk/sub-clients/apps). Per-user and AccountKit-gated: `naive.database` (default user) or `naive.forUser(id).database`. See the [Database guide](/docs/getting-started/database).
