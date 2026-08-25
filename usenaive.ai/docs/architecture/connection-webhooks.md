> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connection status & webhooks

> The connections mirror, webhook ingress, lazy reconcile, and the last-write-wins guard.

Connections (3rd-party apps) need a status answer on hot dashboard paths
without hammering the upstream connections provider. Naive keeps a local
**connections mirror**.

## Source of truth

* **"Does this user have a working X connection?"** → the mirror (cheap local read).
* **"Can this connection execute right now?"** → the provider. `execute` always goes
  through the provider; if it rejects, the mirror is updated inline.

The mirror is written from three places: our own connect/disconnect routes
(synchronous), provider webhooks (push), and a reconcile cron (defensive sweep).

## The INITIATED → ACTIVE gap

There is **no** `connected_account.activated` push event from the provider, and the
OAuth callback returns to *your* app, not to Naive. So a freshly connected account
would sit at `INITIATED` until the cron swept it.

**Fix — lazy reconcile on read.** `GET /v1/users/:user_id/connections/connected`
inspects each row; any `INITIATED` row older than \~10s is refreshed synchronously from
the provider before responding. Once `ACTIVE`/`EXPIRED`/`REVOKED` it never
lazy-refreshes again.

## Out-of-order webhooks

Webhook delivery is eventual and unordered. Status updates use **last-write-wins on the
event timestamp**:

```sql theme={"theme":"css-variables"}
UPDATE connections SET status = ?, last_status_at = :event_ts
WHERE id = ? AND (last_status_at IS NULL OR last_status_at < :event_ts)
```

A stale `EXPIRED` arriving after a fresh reconnect is dropped (zero-row update).

## Webhook ingress

Provider webhooks (connection expired / revoked / disabled) are received on a
dedicated, HMAC-verified ingress endpoint and applied idempotently on event id.
