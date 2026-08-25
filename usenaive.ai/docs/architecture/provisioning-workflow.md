> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Provisioning Workflow

> How per-tenant agent profiles are provisioned as a durable, idempotent, async-native workflow.

Provisioning a real-world agent profile is not a synchronous call. Forming a legal
entity, passing KYB, registering an A2P/10DLC campaign, and propagating DNS take
hours to days. Naïve models this as a **durable workflow** so a signup never
blocks and a retried webhook never forms a second entity.

## The state machine

```
provisioning → verifying → active
                    ↘ needs_action (KYB doc, A2P rejection) → verifying
                    ↘ awaiting_payment (card funding / formation checkout) → active
                    ↘ failed → reconciled (orphans cancelled)
                    ↘ revoked
```

Regulated steps run the **real provider calls up to the payment step** and then
stop: the card step calls the card issuer and returns `awaiting_payment` with a
funding `checkout_url` in `step.result` (no charge, no issuance); formation returns
the `$349` checkout; KYC starts a real hosted verification when members are
supplied. The agent never auto-spends — a human completes the checkout.

* **Idempotent on the agent profile key** — a retried signup webhook resumes the same
  workflow; it never forms a second entity or issues a second card. Pass
  `idempotencyKey` to `provision()`.
* **Async-native** — formation and KYB take hours; A2P takes days; DNS needs
  propagation. The workflow holds state across all of it and emits
  `agentProfile.ready` / `agentProfile.needs_action` events.
* **Self-healing** — a reconciliation sweep cancels any capability-resource not
  bound to an active agent profile within N minutes. The answer to "orphaned card" is
  a janitor, not a saga engine.

It is implemented as a **Postgres-backed durable workflow** (idempotency keys + a
step ledger + a sweeper), not an external workflow engine — so self-hosters get
durable provisioning with no extra infrastructure.

## Driving it from your app

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";

const naive = new Naive({ apiKey: process.env.NAIVE_SECRET_KEY! });

const op = await naive.forUser(tenant.id).provision("sdr", {
  idempotencyKey: `op:${tenant.id}`,
});
// op.status === "provisioning" — don't block; subscribe to events.
```

Agent-profile lifecycle events arrive on the company SSE stream, `GET /v1/events`. Each
frame is a `LiveEvent`: `{ id, companyId, type, createdAt, payload }` — the fields live
under **`payload`**, and the EventSource `event:` name is the `type`.

There is **no SDK helper for this stream** — subscribe to the endpoint directly with any
SSE client. Note that the browser's built-in `EventSource` cannot send an `Authorization`
header, so use a server-side SSE client that can (or `fetch` and read the body stream):

```ts theme={"theme":"css-variables"}
// GET /v1/events — one SSE stream per company. The `event:` name is the type;
// `data:` is the whole LiveEvent.
const es = new EventSource("https://api.usenaive.ai/v1/events", {
  headers: { Authorization: `Bearer ${process.env.NAIVE_SECRET_KEY}` },
});

es.addEventListener("agentProfile.ready", async (m) => {
  const evt = JSON.parse(m.data);            // { id, companyId, type, createdAt, payload }
  await naive.runtime("pool").start(evt.payload.agentProfileId, { goal: "Run outbound." });
});

es.addEventListener("agentProfile.needs_action", (m) => {
  const evt = JSON.parse(m.data);
  // evt.payload.requirements — surface the KYB doc / A2P step in your dashboard.
});
```

`runtime("pool")` above is the **frozen** legacy orchestration runtime — new work
starts through [the durable runtime](/docs/architecture/durable-runtime). And do not confuse
`LiveEvent` with `NaiveEvent`, the **inbound** trigger envelope in
[the event router](/docs/architecture/event-router): `NaiveEvent` wakes an agent,
`LiveEvent` is what your app observes.

Poll status any time with `await op.refresh()` or `GET /v1/agent-profiles/:id`.
Regulated/async steps (KYB, LLC formation, A2P phone) or steps needing an unconfigured
provider resolve to `needs_action` with a precise requirement (read them from
`agentProfile.steps`); fully-automatable steps execute immediately. An internal cron
re-advances unfinished agent profiles.

The workflow is scoped to provisioning — the multi-hour reality of regulated
onboarding (entity formation, KYB review, A2P/10DLC registration, DNS propagation) —
not general agent orchestration.
