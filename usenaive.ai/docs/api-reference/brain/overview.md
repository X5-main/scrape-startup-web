> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain API

> Company knowledge base + memory over /v1/brain — document RAG, semantic memory, and governance.

The Brain API is mounted at **`/v1/brain`** (company-scoped) and **`/v1/users/{user_id}/brain`** (per-tenant). All routes require authentication (session cookie or `Authorization: Bearer nv_sk_...`) and the **brain** primitive to be enabled on the AccountKit — otherwise they return `403 forbidden` with `reason` `subprocessor_consent_required`. `brain` is opt-in, so that is the reason for an explicit `{ enabled: false }` as well as for an absent entry; `primitive_disabled_by_kit` is what a non-opt-in primitive gives and cannot fire here.

## Auth & gating

* **Auth:** session or API key.
* **Entitlement:** `brain` is an opt-in primitive (default off). Enable it in the AccountKit.
* **Metering:** per-tenant plan quota is enforced on each call (except `GET /status`). Credit costs apply per operation (see below).
* **Idempotency:** mutating routes accept an `Idempotency-Key` header.

## Credits

| Operation                                        | Cost                                       |
| ------------------------------------------------ | ------------------------------------------ |
| `POST /query`, `POST /think`                     | 0.08 credits                               |
| `POST /documents`, `PUT /documents/:id` (ingest) | 0.1 credits + 0.0002 per KB (capped at 10) |
| everything else                                  | free (plan quota still applies)            |

## Endpoint groups

| Group           | Routes                                                                  | Reference                                                       |
| --------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| Knowledge bases | `GET/POST /`, `DELETE /:id`, `PATCH /:id`, `POST /connect`              | [Knowledge bases](/docs/api-reference/brain/knowledge-bases)         |
| Runtime         | `GET /status`                                                           | [Runtime & configuration](/docs/api-reference/brain/runtime)         |
| Documents       | `GET/POST /documents`, `PUT/GET/DELETE /documents/:id`                  | [Documents](/docs/api-reference/brain/documents)                     |
| Query           | `POST /query`                                                           | [Query](/docs/api-reference/brain/query)                             |
| Semantic memory | `POST /remember`, `/recall`, `/think`, `/graph`, `/timeline`            | [Memory](/docs/api-reference/brain/memory)                           |
| Run loop        | `POST /attach`, `POST /consolidate`                                     | [Attach & consolidate](/docs/api-reference/brain/attach-consolidate) |
| Beliefs         | `GET /beliefs`, `GET /beliefs/:id`                                      | [Beliefs](/docs/api-reference/brain/beliefs)                         |
| Levels          | `GET /levels`                                                           | [Levels](/docs/api-reference/brain/levels)                           |
| Deletion        | `POST /forget`                                                          | [Forget & deletion](/docs/api-reference/brain/forget)                |
| Bus             | `GET/POST /bus/events`, `GET /bus/events/stream`                        | [Brain Bus](/docs/api-reference/brain/bus)                           |
| Operations      | writebacks, proposals, objects, prod-gates, bakeoff, librarian, metrics | [Operations](/docs/api-reference/brain/operations)                   |

### Declared and refused

Four `/v1/brain` operations are mounted and answer `501 not_configured`, naming the
missing table. They are documented rather than hidden so you do not build around
them: `POST /beliefs/:id/reaffirm`, `GET`/`POST /lessons`, `GET /retention` and
`GET /decisions`. See [Beliefs](/docs/api-reference/brain/beliefs#the-four-that-refuse)
— `GET /retention` in particular, because it means **no belief in this build ever
expires**.

### Company scope vs tenant scope

Most routes above exist twice: at `/v1/brain/…` (company) and at
`/v1/users/{user_id}/brain/…` (one tenant). The exceptions are the
beliefs / levels / lessons / retention / decisions group, which exists at the
**company prefix only**.

## Deletion receipts

Destructive routes (`DELETE /:id`, `DELETE /documents/:id`, `POST /forget`) are approval-gated for agent callers (return `202` pending) and return a deletion receipt on completion:

```json theme={"theme":"css-variables"}
{
  "deleted": true,
  "receipt": {
    "provider": "postgres",
    "provider_confirmed": true,
    "verified": true,
    "deleted_at": "2026-07-09T12:00:00.000Z"
  }
}
```

`verified: true` means emptiness was confirmed post-purge; `provider_confirmed` alone means the purge call ran.
