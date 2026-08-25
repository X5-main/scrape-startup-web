> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Event Stream (SSE)

> Server-Sent Events stream of company-scoped live events.

Subscribe to a company-scoped Server-Sent Events stream of live events — DNS
edits, activity log, approvals, and other domain events. A `: heartbeat <ts>`
comment is emitted every \~25s so intermediate proxies don't idle the connection
out.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -N https://api.usenaive.ai/v1/events \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Accept: text/event-stream"
  ```
</RequestExample>

<ResponseExample>
  ```
  event: domain.updated
  id: 42
  data: {"id":42,"companyId":"...","type":"domain.updated","createdAt":"2026-05-08T...","payload":{"action":"dns_record_set","domainId":"..."}}

  : heartbeat 1720471200
  ```
</ResponseExample>

## Events vs. triggers vs. webhooks

* **This stream** is a read-only feed you *observe*.
* **[Triggers](/docs/api-reference/triggers/overview)** *wake an agent* on an inbound
  event.
* **[Webhooks](/docs/api-reference/webhooks/overview)** POST an outbound signed
  callback to *your* backend.

See [Events & triggers](/docs/getting-started/events) and the
[event router](/docs/architecture/event-router).
