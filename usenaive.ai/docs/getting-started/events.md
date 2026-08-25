> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Events & triggers

> Bind an inbound event source to an agent run — inbound email, SMS, cron, or internal events wake the bound agent.

The **trigger router** turns inbound events into agent runs. A **trigger
subscription** binds a source (+ optional filter) to a target agent run; when a
matching event fires, the router wakes the bound agent and records a delivery
status. See the [architecture](/docs/architecture/event-router) for the full model.

<Info>
  Triggers **wake an agent**. [Webhooks](/docs/getting-started/webhooks) do the opposite
  — they POST an outbound signed callback to *your* backend. Both fire on the same
  inbound events; use whichever (or both) fits your flow.
</Info>

## Sources

| Source   | Fires on                                                   |
| -------- | ---------------------------------------------------------- |
| `email`  | Inbound email to a managed inbox (`email.received`)        |
| `sms`    | Inbound SMS to a managed number (`sms.received`)           |
| `cron`   | A recurring schedule (see [Loops](/docs/getting-started/loops)) |
| `event`  | An internal Naive event                                    |
| `manual` | A hand-fired event (e.g. from `/{id}/test`)                |

`GET /v1/triggers/sources` is the source of truth.

## Create a trigger

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/triggers \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{
    "source": "email",
    "filter": { "to": "sales@acme.com" },
    "target": { "prompt": "A prospect emailed sales@. Read it and draft a reply." }
  }'
```

* **`filter`** — `event_types`/`event_type` match the dotted type; any other key
  matches the same-named field in the payload (`to`, `from`, `e164`, …). Omit for
  "every event of this source".
* **`target`** — `{ prompt }`, or `{ promptTemplate }` with `{{type}}`,
  `{{source}}`, `{{payload}}` substitutions, plus an optional `profileName`.
* **`delivery`** — `auto` (default) or `sidecar`; both resolve to the cloud
  runtime.

## Test the wiring

Fire a synthetic event through the router without waiting for a real provider
webhook:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/triggers/{id}/test \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{ "type": "email.received", "payload": { "from": "a@b.com", "subject": "hi" } }'
```

## Inbound hook endpoints

For arbitrary third-party events (a GitHub push, a Stripe event, your own
backend), create a **per-agent inbound endpoint**. Each endpoint has its own
signing secret; inbound POSTs are HMAC-verified and routed through the same
trigger router.

```bash theme={"theme":"css-variables"}
# create — the URL + secret are returned ONCE
curl -X POST https://api.usenaive.ai/v1/hooks \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{ "name": "GitHub push", "source": "webhook" }'
# → { "url": "https://api.usenaive.ai/webhooks/hooks/hk_…", "secret": "hksec_…", … }
```

Signatures are **timestamped** to make them replay-safe: a body-only signature can
be captured and re-POSTed forever. Send **both** headers — `X-Naive-Timestamp`
(unix seconds) and `X-Naive-Signature` — and sign the string
`` `${timestamp}.${rawBody}` ``, not the body alone. A request missing either
header is rejected, and the timestamp must be within **5 minutes** of server time.

```bash theme={"theme":"css-variables"}
BODY='{"type":"push","repo":"acme/site"}'
TS=$(date +%s)
SIG=$(printf '%s.%s' "$TS" "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
curl -X POST "$URL" \
  -H "X-Naive-Timestamp: $TS" \
  -H "X-Naive-Signature: $SIG" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

A `sha256=` or `v1,` prefix on the signature is stripped automatically, so
GitHub's `X-Hub-Signature-256` format works as-is — but it must still be
accompanied by `X-Naive-Timestamp`.

Rotate the secret with `POST /v1/hooks/{id}/rotate-secret`.

## Delivery status

Every routed event is observable — including events that matched no
subscription (recorded as `no_match`, so a silent drop is visible):

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/triggers/deliveries?status=failed" \
  -H "Authorization: Bearer nv_sk_live_..."
```

Statuses advance `received → queued → delivered → processed | failed`.

## Billing

Free — the agent run the trigger dispatches bills as any other run.
