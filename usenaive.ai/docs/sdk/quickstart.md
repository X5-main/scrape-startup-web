> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# SDK Quickstart

> Solo and multi-tenant flows with the SDK.

```bash install theme={"theme":"css-variables"}
npm install @usenaive-sdk/server
```

## Solo mode

No `users.create()` — every call auto-scopes to your default user.

```ts agent.ts theme={"theme":"css-variables"}
import { Naive, isPendingApproval } from "@usenaive-sdk/server";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

await naive.cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });
await naive.vault.put("instantly.api_key", "key_xyz");

// `connections.connect` is approval-gated: it resolves to a ConnectResult OR a
// PendingApproval. Narrow before reading `redirectUrl` — see /sdk/errors.
const res = await naive.connections.connect("gmail", {
  callbackUrl: "https://myapp.com/oauth/callback",
});
if (isPendingApproval(res)) {
  // queued — a human must approve it (res.approval_id) before the OAuth link exists
} else {
  console.log(res.redirectUrl);
}
```

## Multi-tenant mode

Create a user from your app's signup flow, then scope every call.

```ts signup.ts theme={"theme":"css-variables"}
const alice = await naive.users.create({
  external_id: "alice_db_uuid",
  email: "alice@example.com",
});

const client = naive.forUser(alice.id);
await client.cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });

const conn = await client.connections.connect("gmail", { callbackUrl });
const redirectUrl = isPendingApproval(conn) ? null : conn.redirectUrl;

// Hand a per-user MCP session to your agent
const session = await client.session();
console.log(session.mcp.url, session.mcp.headers);
```

## Productize with Account Kits

```ts account-kits.ts theme={"theme":"css-variables"}
const pro = await naive.accountKits.create({
  name: "Pro",
  connections_config: { mode: "allowlist", toolkits: ["gmail", "slack", "stripe"] },
});
await naive.accountKits.assignUser(pro.id, alice.id);
```

## Next: declare a team

The calls above are the flat resource API. To declare a durable **team** in
`naive.config.ts` and drive it from the same client, see
[Teams & the durable runtime](/docs/sdk/teams).
