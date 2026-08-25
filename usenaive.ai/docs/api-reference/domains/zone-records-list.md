> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Zone Records

> GET /v1/domains/:id/zone-records — List every DNS record on the live DNS zone, including provider record IDs.

<Note>
  **Live zone view, not the verification setup view.** This returns *every* record
  currently in the DNS zone (with the provider record IDs needed for delete).
  For the read-only list of email setup records the customer needs to add
  to pass verification, see [`/dns-records`](/docs/api-reference/domains/dns-records).
</Note>

<ParamField path="id" type="string" required>
  Domain UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "domain": "acme.com",
    "domain_id": "dom-uuid-2",
    "registrar": "external",
    "mock": false,
    "truncated": false,
    "records": [
      {
        "id": "rec_abc",
        "type": "A",
        "name": "",
        "value": "76.76.21.21",
        "ttl": 60,
        "comment": "naive:owned;company=co_...;agent=ag_...;ts=1717..."
      },
      {
        "id": "rec_def",
        "type": "CNAME",
        "name": "www",
        "value": "shops.myshopify.com",
        "ttl": 60
      }
    ]
  }
  ```
</ResponseExample>

## Differences from `GET /v1/domains/:id/dns-records`

| Endpoint                           | Returns                                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/domains/:id/dns-records`  | The email setup records (MX, TXT for SPF, CNAME for DKIM) the customer must add at their registrar to pass verification. Read-only and informational. |
| `GET /v1/domains/:id/zone-records` | Every record currently in the live DNS zone, with the provider record ID (`id`) needed for `DELETE /v1/domains/:id/zone-records/:recordId`.           |

## Fields

| Field                | Description                                                                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`             | The fully-qualified domain                                                                                                                                                                                                                                                                               |
| `domain_id`          | Domain UUID                                                                                                                                                                                                                                                                                              |
| `registrar`          | `system`, `naive` or `external`. On `system` domains this endpoint is inspect-only — `POST`/`DELETE` return `403 SYSTEM_DOMAIN`.                                                                                                                                                                         |
| `mock`               | `true` when running in `DOMAIN_MOCK` mode (no real DNS provider call)                                                                                                                                                                                                                                    |
| `truncated`          | `true` when the read ran out of its 25s budget before the zone was fully paged, so `records` is a **partial** view. Only reachable for `registrar: "system"` domains, which read the shared `usenaive.ai` zone. Do not delete or "correct" records while this is `true` — you cannot see the whole zone. |
| `records[].id`       | Provider record ID — pass to `DELETE` for removal                                                                                                                                                                                                                                                        |
| `records[].type`     | `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, or `CAA`                                                                                                                                                                                                                                                        |
| `records[].name`     | Record name; `""` for apex                                                                                                                                                                                                                                                                               |
| `records[].value`    | Record value                                                                                                                                                                                                                                                                                             |
| `records[].ttl`      | TTL in seconds                                                                                                                                                                                                                                                                                           |
| `records[].priority` | MX priority (MX records only)                                                                                                                                                                                                                                                                            |
| `records[].comment`  | DNS record comment; records written by Naive use `naive:owned;company=...;agent=...;ts=...`                                                                                                                                                                                                              |

## Errors

| Status | `reason`             | Cause                                                                                                                                                               |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 501    | `FEATURE_DISABLED`   | `AGENT_DNS_EDIT_ENABLED` is false on the API                                                                                                                        |
| 501    | `MOCK_MODE_REJECTED` | No `DNS_REGISTRAR_TOKEN` and `DOMAIN_MOCK` not enabled. For `registrar: "system"` domains, neither `VERCEL_SYSTEM_DOMAIN_TOKEN` nor `VERCEL_REGISTRAR_TOKEN` is set |
| 404    | `DOMAIN_NOT_FOUND`   | Domain doesn't exist or belongs to another company                                                                                                                  |

<Note>
  `registrar: "system"` domains (`{slug}.usenaive.ai`) **are** listable here. Their
  records live on the shared `usenaive.ai` zone, so the read filters to your own
  subdomain page by page and never returns another tenant's records. Writes
  (`POST` / `DELETE`) still refuse with 403 `SYSTEM_DOMAIN`.
</Note>
