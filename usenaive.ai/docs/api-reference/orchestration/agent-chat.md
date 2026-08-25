> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Per-agent chat (legacy)

> /v1/companies/{id}/agents/{agentId}/* — message, run and stream a single non-lead agent. Deprecated; team sessions replace it.

<Warning>
  **Deprecated — per-agent chat (`/v1/companies/:id/agents/:agentId/*`).** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `POST /v1/teams/:team/tenants/:tenantUserId/sessions/:channel/messages with `as\`\`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.surface.agent-chat`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [team sessions](/docs/api-reference/runtime/sessions) — declared, and refused in this build; the table above says what to use meanwhile.
</Warning>

Address one specific agent directly, rather than the team lead.

| Method | Path                                                      | Notes                                            |
| ------ | --------------------------------------------------------- | ------------------------------------------------ |
| `GET`  | `/v1/companies/{id}/agents/{agentId}/messages`            | `limit`.                                         |
| `POST` | `/v1/companies/{id}/agents/{agentId}/messages`            | Persist a message.                               |
| `POST` | `/v1/companies/{id}/agents/{agentId}/run`                 | Trigger a run for a specific **non-lead** agent. |
| `GET`  | `/v1/companies/{id}/agents/{agentId}/runs/{runId}/stream` | SSE stream of the run.                           |
| `POST` | `/v1/companies/{id}/agents/{agentId}/runs/{runId}/stop`   | Stop the run.                                    |

<Note>
  `{id}` is the **company** id, not a tenant id. These routes are company-scoped:
  they address an agent, and an agent belongs to a company. To address work for one
  customer, use the [(team, tenant) surface](/docs/api-reference/runtime/overview).
</Note>

The lead agent has its own address at
[`/v1/companies/{id}/ceo/*`](/docs/api-reference/orchestration/ceo-run). `…/run` here
is for the other agents.

## Streaming

`…/runs/{runId}/stream` is Server-Sent Events. Send `Accept: text/event-stream`
and read frames until the stream closes. It is the legacy runtime's stream and it
works today — the durable runtime's equivalent is
[refused](/docs/api-reference/runtime/runs) until its three prerequisites land.
