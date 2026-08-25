> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# functions

> List, invoke, and deploy edge functions on a fullstack app.

```ts theme={"theme":"css-variables"}
// List + invoke — auto-resolves the user's single fullstack app (or pass { appId })
await naive.functions.list();
await naive.functions.get("hello");
const result = await naive.functions.invoke("hello", { name: "world" });

// Create — source code as a `body` string
await naive.functions.deploy({ slug: "hello", name: "hello", verify_jwt: true, body: "..." });

// Deploy / update — one entry per source file (preferred)
await naive.functions.deployFiles("hello", {
  verify_jwt: false,
  files: [{ name: "index.ts", content: 'Deno.serve(() => new Response("ok"))' }],
});
```

Requires a `type: "fullstack"` [app](/docs/sdk/sub-clients/apps). Per-user and AccountKit-gated: `naive.functions` or `naive.forUser(id).functions`.

`deployFiles` sends plain JSON; the apps Supabase proxy builds the
`multipart/form-data` body Supabase's deploy endpoint requires (metadata plus
one `file` part per source), so you do not bundle an eszip yourself. See the
[Edge Functions guide](/docs/getting-started/functions).
