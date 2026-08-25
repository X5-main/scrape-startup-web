> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Edge Functions

> Serverless edge functions for your app or your users' apps — list, deploy, and invoke on a fullstack app's managed backend.

The **Edge Functions** primitive lets you list, deploy, and invoke edge functions on a [fullstack app's](/docs/getting-started/apps) managed backend. Management operations (list/deploy) go through the backend's management API; invocation hits the project's `/functions/v1` endpoint — all with credentials injected by Naive.

<Info>
  Requires a **fullstack app** (`naive.apps.create({ name, type: "fullstack" })`).
</Info>

## Two ways to use it

```ts theme={"theme":"css-variables"}
// Your own project (default user)
await naive.functions.list();

// A specific end-user's project
await naive.forUser(alice.id).functions.list();
```

Omit `{ appId }` to auto-resolve the user's single fullstack app; pass it when they own several.

## List & invoke

```ts theme={"theme":"css-variables"}
const fns = await naive.functions.list();
const result = await naive.functions.invoke("hello", { name: "world" });
const fn = await naive.functions.get("hello");
```

## Deploy

Two Management API shapes work through the apps Supabase proxy (CLI: `naive apps supabase`):

```ts theme={"theme":"css-variables"}
// Create (JSON) — source code in `body`
await naive.functions.deploy({
  slug: "hello",
  name: "hello",
  verify_jwt: false,
  body: 'Deno.serve(() => new Response(JSON.stringify({ ok: true })))',
});
```

```ts theme={"theme":"css-variables"}
// Preferred: deploy/update from source files
await naive.functions.deployFiles("hello", {
  verify_jwt: false,
  files: [{ name: "index.ts", content: 'Deno.serve(() => new Response("ok"))' }],
});
```

```bash theme={"theme":"css-variables"}
# Same call from the CLI
naive apps supabase <app> POST "v1/projects/<ref>/functions/deploy?slug=hello" \
  --body '{"name":"hello","verify_jwt":false,"files":[{"name":"index.ts","content":"Deno.serve(() => new Response(\"ok\"))"}]}'
```

<Info>
  Upstream `POST …/functions/deploy` is multipart-only. The proxy accepts agent-friendly
  JSON `files: [{ name, content }]` and builds one multipart `file` part per source
  (plus metadata). Create via `POST …/functions` still works when `body` (source string)
  is present; omitting it injects a hello stub so create succeeds.
</Info>

## REST

```bash theme={"theme":"css-variables"}
# Invoke
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/functions/proxy/hello \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"name":"world"}'
```

Your own project uses `/v1/apps/<app-id>/…`; an end-user's project uses `/v1/users/<user-id>/apps/<app-id>/…`.

See the [Edge Functions API reference](/docs/api-reference/functions/overview).

## Billing

Free at the Naive layer — no per-operation credit cost. Account Kits can gate the `functions` primitive per user.
