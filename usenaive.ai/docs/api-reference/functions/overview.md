> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Edge Functions Overview

> List, deploy, and invoke edge functions on a fullstack app's managed backend.

The Edge Functions primitive operates on a [fullstack app's](/docs/api-reference/apps/overview) managed backend. Management operations (list/get/deploy) use the backend management API via the apps backend proxy; invocation uses the project's `/functions/v1` endpoint. App-scoped, on both the company mount and per-user mount; the kit must enable the `functions` primitive on per-user mounts.

## Endpoints

| Method | Path                                                             | Description                                           |
| ------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `ANY`  | `/v1/apps/:id/functions/proxy/*`                                 | Invoke a function (`/functions/v1/{slug}`)            |
| `GET`  | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/functions`        | List functions (management API)                       |
| `GET`  | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/functions/{slug}` | Get a function                                        |
| `POST` | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/functions`        | Create a function (JSON; requires source `body`)      |
| `POST` | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/functions/deploy` | Deploy/update (JSON `files[]` → multipart file parts) |

```bash theme={"theme":"css-variables"}
# List
curl "https://api.usenaive.ai/v1/apps/<app-id>/supabase/proxy/v1/projects/<ref>/functions" \
  -H "Authorization: Bearer nv_sk_live_..."

# Create (JSON — source code in `body`)
curl -X POST "https://api.usenaive.ai/v1/apps/<app-id>/supabase/proxy/v1/projects/<ref>/functions" \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"slug":"hello","name":"hello","verify_jwt":false,"body":"Deno.serve(() => new Response(JSON.stringify({ok:true}),{headers:{\"Content-Type\":\"application/json\"}}))"}'

# Deploy / update (preferred). Send JSON files[]; Naive converts to multipart
# file parts (one per source) matching the Management API / supabase CLI.
curl -X POST "https://api.usenaive.ai/v1/apps/<app-id>/supabase/proxy/v1/projects/<ref>/functions/deploy?slug=hello" \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"name":"hello","verify_jwt":false,"files":[{"name":"index.ts","content":"Deno.serve(() => new Response(JSON.stringify({ok:true}),{headers:{\"Content-Type\":\"application/json\"}}))"}]}'

# Invoke
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/functions/proxy/hello \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"name":"world"}'
```

CLI equivalents:

```bash theme={"theme":"css-variables"}
naive apps supabase <id> GET "v1/projects/<ref>/functions"
naive apps supabase <id> POST "v1/projects/<ref>/functions" --body '{"slug":"hello","name":"hello","verify_jwt":false,"body":"Deno.serve(() => new Response(\"ok\"))"}'
naive apps supabase <id> POST "v1/projects/<ref>/functions/deploy?slug=hello" --body '{"name":"hello","verify_jwt":false,"files":[{"name":"index.ts","content":"Deno.serve(() => new Response(\"ok\"))"}]}'
```

<Info>
  Upstream `POST …/functions/deploy` is multipart-only. The apps Supabase proxy
  accepts agent-friendly JSON (`files: [{ name, content }]`) and translates it
  into metadata + one `file` part per source (same shape as `supabase functions
    deploy --use-api`). Omitting `files` on deploy injects a hello stub; omitting
  `body` on create does the same — never an opaque `unknown` error.
</Info>

## SDK

```ts theme={"theme":"css-variables"}
await naive.functions.invoke("hello", { name: "world" });
await naive.forUser(userId).functions.list();

// Create: source code as a `body` string.
await naive.functions.deploy({
  slug: "hello",
  name: "hello",
  verify_jwt: false,
  body: 'Deno.serve(() => new Response("ok"))',
});

// Deploy/update (preferred): one entry per source file.
await naive.functions.deployFiles("hello", {
  verify_jwt: false,
  files: [{ name: "index.ts", content: 'Deno.serve(() => new Response("ok"))' }],
});
```

See the [Edge Functions guide](/docs/getting-started/functions) and the [`functions` sub-client](/docs/sdk/sub-clients/functions).
