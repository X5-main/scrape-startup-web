> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Triggers

> Bind an inbound event source to an agent run — the trigger router wakes the bound agent.

A **trigger subscription** binds an event source (+ optional filter) to a target
agent run. When a matching event fires, the [trigger
router](/docs/architecture/event-router) wakes the bound agent on the cloud sidecar
and records a [delivery status](/docs/api-reference/events/delivery-status).

### List

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/triggers \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{ "subscriptions": [ { "id": "sub_01H...", "source": "email" } ], "count": 1 }
```

### Create

| Parameter  | Type   | Required | Description                                                     |
| ---------- | ------ | -------- | --------------------------------------------------------------- |
| `source`   | string | Yes      | `cron`, `webhook`, `sms`, `email`, `event`, or `manual`         |
| `filter`   | object | No       | Match on `event_type(s)` or any payload field (`to`, `e164`, …) |
| `target`   | object | No       | `{ prompt }` or `{ promptTemplate, profileName }`               |
| `delivery` | string | No       | `auto` (default), `sidecar`, or `device`                        |
| `name`     | string | No       | Friendly name                                                   |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/triggers \
    -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
    -d '{
      "source": "email",
      "filter": { "to": "sales@acme.com" },
      "target": { "prompt": "A prospect emailed sales@. Read it and draft a reply." }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  { "id": "sub_01H...", "source": "email", "active": true }
  ```
</ResponseExample>

### Sources, get, update, delete, test

| Method   | Path                     | Description                                         |
| -------- | ------------------------ | --------------------------------------------------- |
| `GET`    | `/v1/triggers/sources`   | List valid sources (source of truth)                |
| `GET`    | `/v1/triggers/{id}`      | Get one subscription                                |
| `PATCH`  | `/v1/triggers/{id}`      | Update `name`/`filter`/`target`/`delivery`/`active` |
| `DELETE` | `/v1/triggers/{id}`      | Delete a subscription                               |
| `POST`   | `/v1/triggers/{id}/test` | Fire a synthetic event end-to-end                   |

```bash theme={"theme":"css-variables"}
# verify the binding without a real provider webhook
curl -X POST https://api.usenaive.ai/v1/triggers/sub_01H.../test \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{ "type": "email.received", "payload": { "from": "a@b.com" } }'
```

See [Events & triggers](/docs/getting-started/events) and, for recurring runs,
[Loops](/docs/api-reference/loops/overview).
