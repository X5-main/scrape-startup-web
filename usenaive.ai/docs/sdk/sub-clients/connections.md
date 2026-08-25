> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# connections

> Per-user 3rd-party connections.

```ts theme={"theme":"css-variables"}
import { isPendingApproval } from "@usenaive-sdk/server";
const client = naive.forUser(alice.id);

await client.connections.list({ search: "gmail" });
await client.connections.connected();                 // local mirror status
// `connect` is approval-gated: ConnectResult OR PendingApproval. Narrow first.
const conn = await client.connections.connect("gmail", { callbackUrl });
const redirectUrl = isPendingApproval(conn) ? null : conn.redirectUrl;
await client.connections.disconnect("gmail", { purge: false });
await client.connections.tools("gmail");
await client.connections.execute("gmail", "GMAIL_SEND_EMAIL", { recipient_email: "..." });
```

All calls are filtered by the user's AccountKit. `connect` signs the user up for a third-party
service, so it is sensitive: when the kit gates it for an agent caller the resolved value is a
[`PendingApproval`](/docs/sdk/errors) (HTTP 202), and `redirectUrl` does not exist on that branch.
See [Connections](/docs/getting-started/connections).
