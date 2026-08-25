> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

> Per-tenant outbound event subscriptions — receive signed, retried HTTP callbacks when Naive events fire.

The **Webhooks** primitive lets your backend (or a specific tenant's) subscribe to Naive events. When a matching event fires, Naive POSTs an **HMAC-signed**, **retried** payload to your URL. It's the bridge that makes flows like backlink-outreach autonomous: an inbound reply triggers `email.received`, your handler resumes the agent.

## Events

Naive emits these events today (subscribe to any subset):

| Event               | Fires when                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| `email.received`    | An inbound email arrives at one of the tenant's managed inboxes         |
| `sms.received`      | An inbound SMS arrives at one of the tenant's provisioned phone numbers |
| `approval.resolved` | An approval is approved, denied, or fails (payload includes `status`)   |

<Info>
  The advertised event list always matches what Naive actually emits. `GET /v1/webhooks/event-types` is the source of truth.
</Info>

## Subscribe

A subscription created on the root client is **company-wide** (`tenant_user_id` null, receives events for all tenants); created via `forUser(id)` it's scoped to that tenant. The returned `secret` is shown **once** — store it to verify signatures.

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

const sub = await naive.webhooks.create(
  "https://app.example.com/api/webhooks/naive",
  ["email.received", "approval.resolved"],
);
// store sub.secret

await naive.webhooks.list();      // secrets are never returned in list
await naive.webhooks.test(sub.id); // deliver a signed test event
await naive.webhooks.remove(sub.id);
```

## Verify deliveries

Each POST carries `X-Naive-Signature` (HMAC-SHA256 of the raw body) and `X-Naive-Event`. Verify with the helper:

```ts theme={"theme":"css-variables"}
import { verifyWebhookSignature } from "@usenaive-sdk/server";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-naive-signature") ?? "";
  if (!verifyWebhookSignature(process.env.NAIVE_WEBHOOK_SECRET!, raw, sig)) {
    return new Response("bad signature", { status: 401 });
  }
  const { event, data } = JSON.parse(raw); // data.tenant_user_id identifies the tenant
  // ...handle event
  return new Response("ok");
}
```

Delivery is best-effort with retry/backoff (3 attempts) and is logged; failures don't block the originating action.

## REST

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/webhooks \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"url":"https://app.example.com/api/webhooks/naive","eventTypes":["email.received"]}'

curl https://api.usenaive.ai/v1/webhooks/event-types -H "Authorization: Bearer nv_sk_live_..."
```

Per-tenant subscriptions live under `/v1/users/:user_id/webhooks`. See the [Webhooks API reference](/docs/api-reference/webhooks/overview) and the [`webhooks` sub-client](/docs/sdk/sub-clients/webhooks).

## Billing

Free.
