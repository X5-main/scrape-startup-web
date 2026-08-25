> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# API Overview

> Base URL, authentication, endpoint conventions, and the three surfaces — legacy orchestration, the durable runtime, and governance.

## The three surfaces

The API has one base URL and one credential, and three surfaces on top of them.
Which one you should build on depends on what you are doing:

| Surface                                                           | Prefixes                                                                                                                                          | State                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [**Primitives**](#core-endpoints)                                 | `/v1/email`, `/v1/domains`, `/v1/cards`, `/v1/brain`, …                                                                                           | live and stable — the bulk of this reference                                                                   |
| [**Durable runtime**](/docs/api-reference/runtime/overview)            | `/v1/teams`                                                                                                                                       | new. 13 of 30 operations serve real rows; 17 answer `501` and name what they are waiting on                    |
| [**Governance**](/docs/api-reference/governance/overview)              | `/v1/policy`, `/v1/grants`, `/v1/limits`, `/v1/spend`, `/v1/attestations`, `/v1/connections/policy`                                               | new. 7 of 17 live                                                                                              |
| [**Legacy orchestration**](/docs/api-reference/orchestration/overview) | `/v1/tasks`, `/v1/objectives`, `/v1/employees`, `/v1/cron`, `/v1/memory`, `/v1/companies/:id/ceo`, `/v1/runs`, `/v1/loops`, `/v1/company-channel` | **deprecated and frozen**. Every route keeps answering; no shape changes. New work goes on the durable runtime |

## Deprecation headers

Responses from the deprecated orchestration routes carry, additively:

| Header                       | Meaning                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Deprecation`                | [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html). A Structured Field Date (`@` + epoch seconds) — when the resource became deprecated. There is no boolean form. |
| `Link: …; rel="deprecation"` | The migration guide.                                                                                                                                                    |
| `Warning: 299`               | The human-readable sentence.                                                                                                                                            |
| `X-Naive-Deprecation-Id`     | The grep handle, e.g. `dep.primitive.tasks`. The same id the openapi operation carries as `x-naive-deprecation-id`.                                                     |
| `X-Naive-Replacement`        | Present only when a replacement exists. Its **absence** is the wire signal that there is none.                                                                          |

There is **no `Sunset` header** on any of them: all are frozen with no sunset date,
and a `Sunset` would be a date the platform has not promised.

<Note>
  These headers may be stripped by a CDN before they reach your client —
  `GET /v1/limits` reports `deprecation_headers.verified_at_edge: false`. The
  openapi `deprecated: true` mark is the channel with an in-repo proof.
</Note>

## Base URL

```
https://api.usenaive.ai
```

For local development, the API runs at `http://localhost:3101` and the container sidecar at `http://localhost:3100`.

## Authentication

All endpoints (except `/skill.md`, `/register.md`, `/health`, and `/v1/auth/register`) require:

```
Authorization: Bearer nv_sk_live_...
```

## Response Format

All responses are JSON. Successful responses return the data directly. Errors follow:

```json theme={"theme":"css-variables"}
{
  "error": {
    "code": "error_code",
    "message": "Human readable description",
    "hint": "Actionable next step for the agent",
    "reason": "OPTIONAL_GRANULAR_REASON"
  }
}
```

`code` is the canonical kind (`rate_limited`, `forbidden`, `invalid_input`, etc.) and maps 1:1 to the HTTP status. `not_configured` maps to **501** and is used by the runtime, governance and brain surfaces for an operation that is declared and addressable but whose backing store does not exist in this build; it carries `details.missing`, a list naming each absent dependency. Some endpoints also return a more granular `reason` field (e.g. `RATE_LIMITED`, `PROTECTED_RECORD`, `UNOWNED_RECORD_REQUIRES_ACK`) plus extra context fields. Rate-limit responses include a standard `Retry-After` header.

## Organizations and projects

The taxonomy is `organization → project → (account kit → child project → primitives)`. It
is vocabulary plus one new layer: an organization is the `company` this API has always
served (`/v1/company` still answers, `/v1/organization` is the canonical spelling), and a
child project is the `tenant_user` behind `/v1/users/:user_id/...`.

`/v1/projects` is the new layer. A request selects a project in one of four ways, in order:
the path prefix `/v1/projects/:project_id/...`, the `X-Naive-Project-Id` header, the API
key's pinned `active_project_id`, or the organization's **default project**. Every
organization has one, and every row that predates projects was backfilled into it — so a
request that names no project behaves exactly as it did.

A cross-organization or cross-project id is a **404**, never a 403; the one exception is a
key pinned to a different project, which is a **403 `key_project_mismatch`**. See
[Projects](/docs/architecture/projects).

## Conventions

* All timestamps are ISO 8601 with timezone (UTC)
* UUIDs are used for all entity IDs
* Pagination on the primitive surfaces uses `limit` and `offset` query parameters
* Pagination on the runtime, governance and brain surfaces uses `limit` (max 200) and an opaque `cursor`; **`offset` is not supported there**
* Mutation endpoints accept an `Idempotency-Key` header. **Read [`GET /v1/limits`](/docs/api-reference/governance/limits) before relying on it** — the store is currently per-process, caches 5xx and does not fingerprint the body, and the API reports all three rather than claiming a guarantee it does not have

## Live event stream

Subscribe to a company-scoped Server-Sent Events stream:

```
GET /v1/events
Authorization: Bearer nv_sk_live_...
Accept: text/event-stream
```

Frames look like:

```
event: domain.updated
id: 42
data: {"id":42,"companyId":"...","type":"domain.updated","createdAt":"2026-05-08T...","payload":{"action":"dns_record_set","domainId":"..."}}
```

Currently emitted event types:

| Type              | Payload                                                                             | Emitted when                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `domain.updated`  | `{ action: "dns_record_set" \| "dns_record_deleted" \| "agent_managed", domainId }` | An agent successfully writes/deletes a DNS record, or apex A/AAAA flips to agent\_managed |
| `activity.logged` | `{ actorType, actorId, action, entityType, entityId, agentId, runId, details }`     | Any audit-logged event (every DNS edit, including rejections)                             |

The stream emits a `: heartbeat <ts>` comment every \~25s so intermediate proxies don't idle the connection out.

## Audit log

DNS edit endpoints (and any future writes that opt in) append rows to the shared `activity_log` table with these actions:

| Action                | Triggered by                                                                        |
| --------------------- | ----------------------------------------------------------------------------------- |
| `dns.record.set`      | Successful POST to `/v1/domains/:id/zone-records`                                   |
| `dns.record.delete`   | Successful DELETE to `/v1/domains/:id/zone-records/:recordId`                       |
| `dns.record.rejected` | Any guard-rail rejection (rate limit, protected record, unowned ack required, etc.) |

Each row carries `entity_type = "domain"`, `entity_id = <domainId>`, the calling `agent_id` when known, and a `details` JSONB blob with the granular `reason` plus operation-specific context.

## Core Endpoints

| Group         | Key Endpoints                                                                                                                                                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | `POST /v1/auth/register`, `POST /v1/auth/login`, browser/CLI OAuth and email magic-link flows                                                                                                                                                                                                      |
| Organization  | `GET /v1/organization`, `PATCH /v1/organization` (aliases of `/v1/company`)                                                                                                                                                                                                                        |
| Projects      | `GET /v1/projects`, `POST /v1/projects`, `GET/PATCH/DELETE /v1/projects/:project_id`                                                                                                                                                                                                               |
| Identity      | `GET /v1/identity`, `GET /v1/identity/emails`, `GET /v1/identity/resources`                                                                                                                                                                                                                        |
| Domains       | `GET /v1/domains`, `POST /v1/domains/connect`, `GET /v1/domains/:id/dns-records`, `POST /v1/domains/:id/verify`, `GET /v1/domains/search`, `POST /v1/domains/purchase`, `GET /v1/domains/:id/zone-records`, `POST /v1/domains/:id/zone-records`, `DELETE /v1/domains/:id/zone-records/:recordId`   |
| Billing       | `GET /v1/billing/plans`, `POST /v1/billing/subscribe`, `POST /v1/billing/upgrade`, `GET /v1/billing/subscription`, `POST /v1/billing/portal`, `GET /v1/billing/packs`, `POST /v1/billing/topup`                                                                                                    |
| Email         | `GET /v1/email/inboxes`, `POST /v1/email/inboxes`, `POST /v1/email/send`                                                                                                                                                                                                                           |
| Phone         | `POST /v1/phone/provision`, `GET /v1/phone`, `GET /v1/phone/status`, `POST /v1/phone/:id/sms`, `GET /v1/phone/:id/messages`, `DELETE /v1/phone/:id`                                                                                                                                                |
| Search        | `POST /v1/search`, `POST /v1/search/url`, `POST /v1/search/research`                                                                                                                                                                                                                               |
| Images        | `POST /v1/images/generate`, `GET /v1/images/models`, `GET /v1/images/pricing`                                                                                                                                                                                                                      |
| Video         | `POST /v1/video/generate`, `GET /v1/video/models`, `GET /v1/video/pricing`                                                                                                                                                                                                                         |
| Audio         | `POST /v1/audio/transcriptions`, `GET /v1/audio/transcriptions/:id`, `POST /v1/audio/speech`, `POST /v1/audio/speech-to-speech`, `GET /v1/audio/models`, `GET /v1/audio/providers`, `GET /v1/audio/endpoints`, `GET /v1/audio/usage`, `GET /v1/audio/requests/:id`                                 |
| Social        | `GET /v1/social/status`, `POST /v1/social/activate`, `POST /v1/social/connect`, `POST /v1/social/portal`, `GET /v1/social/accounts`, `POST /v1/social/posts`, `POST /v1/social/posts/:id/publish`                                                                                                  |
| SEO           | `POST /v1/seo/keywords/{engine}/{endpoint}`, `POST /v1/seo/backlinks/{endpoint}`, `POST /v1/seo/labs/{engine}/{endpoint}`                                                                                                                                                                          |
| App Data      | `POST /v1/app-data/{platform}/{endpoint}`, `GET /v1/app-data/{platform}/{endpoint}/tasks-ready`, `GET /v1/app-data/{platform}/{endpoint}/:task_id`                                                                                                                                                 |
| Business Data | `POST /v1/business/{platform}/{endpoint}`, `POST /v1/business/social/{platform}`                                                                                                                                                                                                                   |
| AEO           | `POST /v1/aeo/llm-responses/{llm}`, `POST /v1/aeo/llm-scraper/{endpoint}`, `POST /v1/aeo/llm-mentions/{endpoint}`, `POST /v1/aeo/ai-keywords/search-volume`                                                                                                                                        |
| E-commerce    | `POST /v1/ecommerce/{platform}/{endpoint}/task`, `GET /v1/ecommerce/{platform}/{endpoint}/tasks-ready`, `GET /v1/ecommerce/{platform}/{endpoint}/task/:id`                                                                                                                                         |
| Verification  | `POST /v1/verification`, `GET /v1/verification`, `GET /v1/verification/:id`, `POST /v1/verification/members/:id/complete`, `POST /v1/verification/members/:id/resend`                                                                                                                              |
| Formation     | `GET /v1/formation/naics-codes`, `POST /v1/formation` (creates \$349 checkout), `POST /v1/formation/:id/retry-payment`, `POST /v1/formation/:id/submit` (after payment), `GET /v1/formation`, `GET /v1/formation/:id`, `GET /v1/formation/:id/documents`, `GET /v1/formation/:id/documents/:docId` |
| Jobs          | `GET /v1/jobs`, `GET /v1/jobs/:id`, `DELETE /v1/jobs/:id`                                                                                                                                                                                                                                          |
| Status        | `GET /v1/status`, `GET /v1/usage`                                                                                                                                                                                                                                                                  |
| Events        | `GET /v1/events` (Server-Sent Events stream of company-scoped live events)                                                                                                                                                                                                                         |
| Runtime       | `GET /v1/teams/:team/tenants/:tenantUserId/…` — [board, runs, approvals, cost, plan](/docs/api-reference/runtime/overview)                                                                                                                                                                              |
| Governance    | `POST /v1/policy/explain`, `GET /v1/policy/snapshot`, `GET /v1/limits`, `GET /v1/spend`, `GET /v1/connections/policy` — [Governance](/docs/api-reference/governance/overview)                                                                                                                           |
| Brain         | `POST /v1/brain/attach`, `/consolidate`, `/remember`, `/recall`, `GET /v1/brain/beliefs`, `/levels` — [Brain](/docs/api-reference/brain/overview)                                                                                                                                                       |

## Discovery Endpoints

| Method | Path           | Auth | Description                              |
| ------ | -------------- | ---- | ---------------------------------------- |
| GET    | `/skill.md`    | No   | Full capability documentation (markdown) |
| GET    | `/register.md` | No   | Agent onboarding guide (markdown)        |
| GET    | `/health`      | No   | Health check                             |

## Container & Sidecar

Each operator gets an agent-container (`@usenaive/agent-container`) running the Hermes CEO gateway and a Node sidecar. The API communicates with it over the sidecar control API described below.

### Sidecar Endpoints

All sidecar routes require `Authorization: Bearer <container_auth_token>` (resolved from the DB).

| Route                                        | Method    | Description                               |
| -------------------------------------------- | --------- | ----------------------------------------- |
| `/health`                                    | GET       | Container + gateway health status         |
| `/provision`                                 | POST      | Assign a warm-pool container to a company |
| `/control/:companyId/ceo/run`                | POST      | Start a CEO run with a prompt             |
| `/control/:companyId/ceo/runs/:runId/stream` | GET       | SSE stream of CEO run output              |
| `/control/:companyId/ceo/runs/:runId`        | GET       | Get run status                            |
| `/control/:companyId/tasks`                  | GET/POST  | List or create kanban tasks               |
| `/control/:companyId/tasks/:id`              | GET/PATCH | Get or update a task                      |
| `/control/:companyId/tasks/:id/complete`     | POST      | Mark task complete                        |
| `/control/:companyId/tasks/dispatch`         | POST      | Trigger task dispatch                     |
| `/control/:companyId/agents`                 | GET       | List Hermes profiles                      |
| `/control/:companyId/agents/provision`       | POST      | Create a new employee profile             |
| `/control/:companyId/cron`                   | GET/POST  | List or create cron jobs                  |
| `/control/:companyId/memory`                 | GET       | Read agent memory                         |
| `/control/:companyId/status`                 | GET       | Detailed container status                 |

### Data Flow

The sidecar runs a **mirror** process that watches `kanban.db` and `MEMORY.md` files in the Hermes home directory and syncs changes to the datastore. This is how the dashboard and API see task updates in real-time without polling the container directly.

## MCP Server

| Method | Path            | Auth    | Description              |
| ------ | --------------- | ------- | ------------------------ |
| GET    | `/mcp/sse`      | Yes     | Establish SSE connection |
| POST   | `/mcp/messages` | Session | Send MCP messages        |
