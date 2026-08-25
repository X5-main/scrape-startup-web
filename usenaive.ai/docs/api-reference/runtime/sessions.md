> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Team sessions

> GET …/sessions, GET …/sessions/{channel}, POST …/sessions/{channel}/messages — declared, addressable and refused in this build. What to use instead.

<Warning>
  **All three session operations answer `501 not_configured` in this build.** This
  page exists so you know that before you build against them, and so you know which
  address does work today.
</Warning>

```
GET  /v1/teams/{team}/tenants/{tenantUserId}/sessions                     → 501
GET  /v1/teams/{team}/tenants/{tenantUserId}/sessions/{channel}           → 501
POST /v1/teams/{team}/tenants/{tenantUserId}/sessions/{channel}/messages  → 501
```

## Why

There is no per-`(team, tenant)` session store. The nearest thing in the product
is the **company channel**, which is company-scoped: its rows carry no team column
and no tenant column.

Re-serving the company channel under this address would answer a *different
question* under this URL — you would ask "what did the support team say to this
tenant" and get "what was said in this company". Two customers' conversations
would arrive in one list. That is why it refuses rather than approximates.

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "not_configured",
    "message": "Team sessions are not available in this build.",
    "details": {
      "surface": "durable-runtime",
      "missing": [
        "per-(team, tenant) session store: `company_channel_messages` is company-scoped and carries no team or tenant column"
      ]
    }
  }
}
```

The write refusal additionally names `woke_dispatcher` — a field the response
contract returns and which nothing in this build can determine.

## What to use today

| You want                         | Use                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A company-wide conversation      | [`GET`/`POST /v1/company-channel/messages`](/docs/api-reference/orchestration/company-channel) — deprecated but answering |
| To talk to the legacy lead agent | [`POST /v1/companies/{id}/ceo/message`](/docs/api-reference/orchestration/ceo-message) — deprecated but answering         |
| Per-agent chat                   | [`/v1/companies/{id}/agents/{agentId}/messages`](/docs/api-reference/orchestration/agent-chat) — deprecated but answering |

All three are on the frozen legacy runtime and carry deprecation headers. They are
the honest answer to "what can I use now": a working deprecated address beats a
refused one.

## Vocabulary

The noun is **session**, not *channel*. `{channel}` is the identifier of a session
within a team, which is why it appears as a path segment rather than as the name of
the concept.
