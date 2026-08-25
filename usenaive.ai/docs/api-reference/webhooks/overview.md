> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks Overview

> Per-tenant outbound event subscriptions — signed, retried HTTP delivery.

Register a URL + event types and Naive POSTs an HMAC-signed payload when a matching event fires. Subscriptions exist at the company mount (`/v1/webhooks`, `tenant_user_id` null → all tenants) and the per-user mount (`/v1/users/:user_id/webhooks` → that tenant).

## Endpoints

| Method   | Path                       | Description                                       |
| -------- | -------------------------- | ------------------------------------------------- |
| `GET`    | `/v1/webhooks`             | List subscriptions (secrets are never returned)   |
| `GET`    | `/v1/webhooks/event-types` | List emittable event types (source of truth)      |
| `POST`   | `/v1/webhooks`             | Create a subscription — returns `secret` **once** |
| `POST`   | `/v1/webhooks/:id/test`    | Deliver a signed test event                       |
| `DELETE` | `/v1/webhooks/:id`         | Delete a subscription                             |

The same routes exist under `/v1/users/:user_id/webhooks` (tenant-scoped).

## Events

| Event               | Fires when                                                |
| ------------------- | --------------------------------------------------------- |
| `email.received`    | Inbound email arrives at a tenant's managed inbox         |
| `approval.resolved` | An approval is approved / denied / failed (`data.status`) |

## Create

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/webhooks \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"url":"https://app.example.com/api/webhooks/naive","eventTypes":["email.received","approval.resolved"]}'
```

```json theme={"theme":"css-variables"}
{ "id": "…", "url": "…", "eventTypes": ["email.received","approval.resolved"], "secret": "whsec_…", "active": true }
```

## Delivery

Each POST carries `X-Naive-Signature` (HMAC-SHA256 hex of the raw body, keyed by the subscription `secret`) and `X-Naive-Event`. The body is `{ "event": "...", "data": { ..., "tenant_user_id": "..." }, "ts": <ms> }`. Delivery retries up to 3× with backoff and is logged; failures never block the originating action. Verify with the SDK's `verifyWebhookSignature(secret, rawBody, signatureHeader)`.

## SDK

```ts theme={"theme":"css-variables"}
const sub = await naive.webhooks.create(url, ["email.received"]);
await naive.forUser(userId).webhooks.list();
```

See the [Webhooks guide](/docs/getting-started/webhooks) and the [`webhooks` sub-client](/docs/sdk/sub-clients/webhooks).
