> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Company channel (legacy)

> GET/POST /v1/company-channel/messages — the company-wide message channel. Deprecated; team sessions replace it.

<Warning>
  **Deprecated — the company channel (`/v1/company-channel`).** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `GET/POST /v1/teams/:team/tenants/:tenantUserId/sessions/:channel/messages`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.surface.company-channel`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [team sessions](/docs/api-reference/runtime/sessions) — declared, and refused in this build; the table above says what to use meanwhile.
</Warning>

A single company-wide message channel.

| Method | Path                           | Notes                                                                                       |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------- |
| `GET`  | `/v1/company-channel/messages` | `limit`.                                                                                    |
| `POST` | `/v1/company-channel/messages` | Posts a message. **`@mentions` posted from a human session dispatch the mentioned agents.** |

<Warning>
  **This channel is company-scoped: it carries no team column and no tenant
  column.** Every message posted here is visible to every reader of the company
  channel. If you are running work for multiple customers under one company, do not
  put customer-identifying content in it.

  That is also the reason
  [`/v1/teams/…/sessions`](/docs/api-reference/runtime/sessions) refuses rather than
  re-serving these rows: answering a per-`(team, tenant)` question with
  company-wide data would mix two customers' conversations into one list.
</Warning>

## `@mention` dispatch

A message containing `@name` **posted from a human session** dispatches the named
agents — it starts work, not just a notification. A message posted with an API key
does not.

If you are mirroring an external chat into this channel, strip or escape `@` to
avoid dispatching agents on every inbound message.
