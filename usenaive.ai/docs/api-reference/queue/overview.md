> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Queue API Reference

> All Queue REST endpoints — durable managed work queues: create, send, receive, ack, purge, attributes.

## Overview

Per-user; requires `Authorization: Bearer nv_sk_…`. Each queue is a managed
work queue (standard or FIFO, with an optional dead-letter queue),
namespaced and tagged per tenant — your agents never hold a cloud key.

Routes are available both company-scoped (`/v1/queue/...`, acting as the
account's default agent profile) and per-user (`/v1/users/:user_id/queue/...`). Gated by
the `queue` primitive in the user's AccountKit and metered per request against
the tenant's plan.

## Endpoints

| Method | Path                       | Description                                                       |
| ------ | -------------------------- | ----------------------------------------------------------------- |
| GET    | `/v1/queue`                | List the user's queues                                            |
| POST   | `/v1/queue`                | Create a queue (`type`: standard \| fifo, optional `dlq`)         |
| GET    | `/v1/queue/:id`            | Get a queue + attributes                                          |
| DELETE | `/v1/queue/:id`            | Delete the queue (and its dead-letter queue)                      |
| GET    | `/v1/queue/:id/attributes` | Approximate depth / in-flight / delayed counts                    |
| POST   | `/v1/queue/:id/messages`   | Send a message (`{ body, group_id?, dedup_id?, delay_seconds? }`) |
| GET    | `/v1/queue/:id/messages`   | Long-poll for messages (`?max=&wait=&visibility=`)                |
| DELETE | `/v1/queue/:id/messages`   | Ack (delete) a message (`?receipt_handle=`)                       |
| POST   | `/v1/queue/:id/purge`      | Delete all messages                                               |

## Produce & consume

```bash theme={"theme":"css-variables"}
# Send
curl -X POST https://api.usenaive.ai/v1/queue/<id>/messages \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "body": "{\"task\":\"resize\"}" }'

# Receive (long-poll) — each message includes a receipt_handle
curl "https://api.usenaive.ai/v1/queue/<id>/messages?max=10&wait=20" \
  -H "Authorization: Bearer $NAIVE_KEY"

# Ack once processed
curl -X DELETE "https://api.usenaive.ai/v1/queue/<id>/messages?receipt_handle=<rh>" \
  -H "Authorization: Bearer $NAIVE_KEY"
```

Messages that aren't acked reappear after the visibility timeout (at-least-once
with retries). FIFO queues require a `group_id` on send.

A receipt handle is valid only for the receive that produced it, on that queue.
Acking with a stale, reused, or cross-queue handle returns `invalid_input`
(400) — not `internal_error`: nothing broke, the handle is spent. Receive again
and ack the handle from that response. The natural pairing for
a [compute](/docs/api-reference/compute/overview) worker. See the [Queue guide](/docs/getting-started/queue)
and the [SDK sub-client](/docs/sdk/sub-clients/queue).
