> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# webhooks

> Per-tenant outbound event subscriptions — signed, retried delivery.

```ts theme={"theme":"css-variables"}
// Create (root = company-wide; forUser(id) = tenant-scoped). secret shown once.
const sub = await naive.webhooks.create(
  "https://app.example.com/api/webhooks/naive",
  ["email.received", "approval.resolved"],
);

await naive.webhooks.list();         // secrets are never returned
await naive.webhooks.eventTypes();   // { event_types: [...] }
await naive.webhooks.test(sub.id);   // deliver a signed test event
await naive.webhooks.remove(sub.id);

// Verify an incoming delivery (X-Naive-Signature = HMAC-SHA256 of the raw body)
import { verifyWebhookSignature } from "@usenaive-sdk/server";
const ok = verifyWebhookSignature(secret, rawBody, signatureHeader);
```

Per-tenant subscriptions are reached via `naive.forUser(id).webhooks`. See the [Webhooks guide](/docs/getting-started/webhooks).
