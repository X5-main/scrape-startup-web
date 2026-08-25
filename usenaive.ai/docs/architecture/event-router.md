> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Event & trigger router

> One event envelope, one binding registry, and the delivery lane that actually wakes agents on inbound events.

Naive normalizes every event source — cron ticks, inbound webhooks, inbound
SMS/email, internal events, manual fires — into a single envelope and routes it
through one **trigger router**. The router matches the event against
**subscriptions** (the binding registry) and delivers it to the bound agent,
recording a per-event status trail.

## Why it exists

Historically inbound comms did **not** wake an agent. The email and SMS
webhook handlers only fired *outbound* subscriber webhooks
(`webhook_subscriptions`) — an HMAC POST to the tenant's own SaaS — and nothing
dispatched an agent run. Cron push-through recorded no binding row, and there
were three incompatible event shapes. The router closes that gap.

## The envelope

Every source normalizes into a `NaiveEvent`:

```ts theme={"theme":"css-variables"}
interface NaiveEvent {
  source: "cron" | "webhook" | "sms" | "email" | "event" | "manual";
  type: string;            // "email.received", "sms.received", "cron.tick", …
  companyId: string;
  tenantUserId?: string | null;   // null/undefined = company-wide
  eventId?: string;        // provider/idempotency id
  payload: Record<string, unknown>;
  occurredAt?: string;
}
```

<Note>
  This is the **inbound** envelope — what wakes an agent. It is not the same shape as the
  `LiveEvent` your app reads from `GET /v1/events`, which carries `{ id, companyId, type,
    createdAt, payload }`.
</Note>

## Subscriptions (the binding registry)

A `trigger_subscriptions` row binds a `source` (+ optional `filter`) to a
`target` (how to build the agent run). Tenant scope is nullable: a company-wide
subscription (`tenant_user_id = null`) matches every operator; a scoped
subscription matches only its tenant.

* **`filter`** — matched against the event. `event_types` / `event_type` match
  the dotted type; any other key matches the same-named field in the payload
  (e.g. `{ "to": "sales@acme.com" }`, `{ "e164": "+1555…" }`).
* **`target`** — `{ prompt }` or `{ promptTemplate }` (with `{{type}}`,
  `{{source}}`, `{{payload}}` substitutions) and an optional `profileName`.

## Delivery

The matched event is dispatched with `sidecarFetch("/ceo/run")`, which wakes the
agent's legacy orchestration runtime — the previously-missing dispatch.

`delivery` on the subscription is `auto` (default) or `sidecar`; **both resolve to the
same cloud sidecar**. There is one lane, not two: `auto` is not a router that might pick
something else, and no subscription can currently be delivered to the durable runtime.

<Warning>
  **The delivery lane is the frozen legacy runtime.** The router itself (the envelope, the
  subscription registry, the filters, the delivery ledger) is not deprecated and is where
  inbound events keep being modelled. But the thing it wakes is the legacy orchestration
  sidecar, so a subscription cannot today target a `team({ lead, agents })` on
  `runtime.durable()`. If you are building new work on
  [the durable runtime](/docs/architecture/durable-runtime), treat event-driven wake-up as not
  yet wired to it and drive work in explicitly.
</Warning>

## Delivery status

Every attempt writes a `trigger_deliveries` row and advances through
`received → queued → delivered → processed | failed`. An event that matched **no**
subscription records a single `no_match` row, so a silent drop ("why didn't my
agent wake?") is always observable. Query it at `GET /v1/triggers/deliveries`.

## Behaviour-preserving

The router is **additive**. Existing outbound `webhook_subscriptions` continue
to fire exactly as before — the inbound webhook handlers simply *also* call
`routeEvent`. Existing cron and webhook ingress keep their shape.

## Loops

A [Loop](/docs/getting-started/loops) is just a `kind='loop'` subscription whose
source is `cron`: the binding row is the registry, and the executor is the cloud
sidecar cron, kept in sync on create.
