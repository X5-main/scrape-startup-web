> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create or Replace Zone Record

> POST /v1/domains/:id/zone-records — Create or replace a DNS record on the live DNS zone.

<ParamField path="id" type="string" required>
  Domain UUID
</ParamField>

<ParamField body="type" type="string" required>
  One of `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `CAA`
</ParamField>

<ParamField body="value" type="string" required>
  Record value: IPv4 (`A`), IPv6 (`AAAA`), hostname (`CNAME`/`MX`), TXT string, or CAA value (`0 issue "letsencrypt.org"`)
</ParamField>

<ParamField body="name" type="string">
  Record name. Use `@` or omit for the zone apex. e.g. `www` for `www.acme.com`.
</ParamField>

<ParamField body="ttl" type="integer">
  TTL in seconds. Must be 60-86400.
</ParamField>

<ParamField body="priority" type="integer">
  MX priority (required for MX). Must be 0-65535.
</ParamField>

<ParamField body="mode" type="string">
  `replace` (default) PATCHes a single matching record at the same `(type, name)`, or add-then-deletes when multiple match. `append` always creates a new row.
</ParamField>

<ParamField body="acknowledge_unowned" type="boolean">
  Required to overwrite an existing record that wasn't created by Naive. Defaults to `false`.
</ParamField>

<RequestExample>
  ```bash A record theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "type": "A", "name": "@", "value": "76.76.21.21" }'
  ```

  ```bash CNAME theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "type": "CNAME", "name": "www", "value": "shops.myshopify.com" }'
  ```

  ```bash MX theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "type": "MX", "name": "@", "value": "mx1.example.com", "priority": 10 }'
  ```

  ```bash CAA theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "type": "CAA", "name": "@", "value": "0 issue \"letsencrypt.org\"" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 success (replace, single match) theme={"theme":"css-variables"}
  {
    "ok": true,
    "record": {
      "id": "rec_xyz",
      "type": "CNAME",
      "name": "www",
      "value": "shops.myshopify.com"
    },
    "mock": false,
    "ownership": "naive",
    "replaced_count": 1,
    "path": "patch"
  }
  ```

  ```json 201 success (replace, multiple matches) theme={"theme":"css-variables"}
  {
    "ok": true,
    "record": { "id": "rec_xyz", "type": "TXT", "name": "v", "value": "v=spf1 -all" },
    "mock": false,
    "ownership": "naive",
    "replaced_count": 3,
    "path": "add-then-delete"
  }
  ```

  ```json 201 success (mock mode) theme={"theme":"css-variables"}
  {
    "ok": true,
    "record": { "id": "mock-dns-...", "type": "A", "name": "", "value": "76.76.21.21" },
    "mock": true,
    "ownership": "naive",
    "replaced_count": 0,
    "path": "add"
  }
  ```
</ResponseExample>

## Apex A/AAAA writes flip `app_connect_status`

When the request creates or replaces an apex A or AAAA record (i.e. `name` is
empty, `@`, or the zone domain itself), the API atomically transitions the
domain's `app_connect_status`:

1. Pre-flip to `agent_managed_pending` and clear `connected_app_id`.
2. Write to the DNS zone.
3. On success → flip to `agent_managed` and emit a `domain.updated` event with
   `payload.action = "agent_managed"` on the [live event stream](/docs/api-reference/status/status).
4. On failure → roll back to the previous `app_connect_status` (best-effort).

After this, reapers and connect sweeps in either Naive product (SDK or paperclip
on a shared DB) skip this domain. To re-enable Naive app routing, the user must
explicitly disconnect and reconnect the domain from the dashboard; the agent
cannot reverse this automatically.

## Replace Semantics

When `mode` is `replace` (the default) and `type` is not `CAA`:

| Existing matching records | Path              | Behavior                                                                          |
| ------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| 0                         | `add`             | A fresh record is created                                                         |
| 1                         | `patch`           | The record is updated in place atomically — no race window                        |
| ≥2                        | `add-then-delete` | The new authoritative record is added first; the old ones are best-effort deleted |

`CAA` records always use `add` (multiple CAA rows at the same name are semantically valid).

## Ownership

Records written by this endpoint carry a `comment` like `naive:owned;company=<id>;agent=<id>;ts=<unix>`. To overwrite a record that wasn't created by Naive (e.g. legacy records left at the registrar), pass `acknowledge_unowned: true`. The response's `ownership` field will be `unowned-acknowledged` in that case.

## Validation Rules

The API enforces strict validation. Each rule maps to a `reason` code in the error response:

| Rule                                                                          | Reason                   |
| ----------------------------------------------------------------------------- | ------------------------ |
| Allowed types only: A, AAAA, CNAME, MX, TXT, CAA                              | `DISALLOWED_RECORD_TYPE` |
| Wildcards (`*` or `*.foo`) are rejected                                       | `DISALLOWED_RECORD_TYPE` |
| TTL must be 60-86400 seconds                                                  | `INVALID_TTL`            |
| Valid IPv4 for A                                                              | `INVALID_IPV4`           |
| Valid IPv6 for AAAA                                                           | `INVALID_IPV6`           |
| CNAME at apex is not permitted                                                | `CNAME_AT_APEX`          |
| CNAME target must be a valid hostname                                         | `INVALID_HOSTNAME`       |
| MX priority required (0-65535)                                                | `INVALID_MX_PRIORITY`    |
| MX target must be a valid hostname                                            | `INVALID_HOSTNAME`       |
| TXT must be ASCII and ≤4096 chars                                             | `INVALID_TXT`            |
| CAA value must match `&lt;flag&gt; (issue\|issuewild\|iodef) "&lt;value&gt;"` | `INVALID_CAA`            |
| CAA flag must be 0 or 128                                                     | `INVALID_CAA`            |
| CAA `issue`/`issuewild` value must be in the CA allowlist                     | `CA_NOT_ALLOWED`         |
| CAA `iodef` must use `mailto:` or `https://`                                  | `INVALID_CAA`            |
| CNAME cannot coexist with A/AAAA/MX/TXT at the same name (and vice versa)     | `CNAME_COEXISTENCE`      |
| DMARC (`_dmarc`) and DKIM (`*._domainkey`) TXT records are protected          | `PROTECTED_RECORD`       |
| Inbound subdomain MX/TXT (e.g. `agents.acme.com`) is protected                | `PROTECTED_RECORD`       |

## Allowed CAs

`ssl.com`, `letsencrypt.org`, `digicert.com`, `sectigo.com`, `globalsign.com`, `amazon.com`, `pki.goog`, `google.com`.

## Errors

| Status | `code`                   | `reason`                                                                                                                                                                                                 | Cause                                                                                                       |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 400    | `invalid_input`          | `DISALLOWED_RECORD_TYPE`, `INVALID_TTL`, `INVALID_IPV4`, `INVALID_IPV6`, `CNAME_AT_APEX`, `INVALID_HOSTNAME`, `INVALID_MX_PRIORITY`, `INVALID_TXT`, `INVALID_CAA`, `CA_NOT_ALLOWED`, `CNAME_COEXISTENCE` | Input failed validation                                                                                     |
| 403    | `forbidden`              | `SYSTEM_DOMAIN`, `PROTECTED_RECORD`                                                                                                                                                                      | System domain or protected record                                                                           |
| 404    | `resource_not_found`     | `DOMAIN_NOT_FOUND`                                                                                                                                                                                       | Domain doesn't exist or belongs to another company                                                          |
| 409    | `duplicate_record`       | `UNOWNED_RECORD_REQUIRES_ACK`                                                                                                                                                                            | Existing record at this `(type, name)` was not created by Naive — re-issue with `acknowledge_unowned: true` |
| 429    | `rate_limited`           | `RATE_LIMITED`                                                                                                                                                                                           | Per-company (5/min, 20/hr) or platform write budget exhausted. Includes `Retry-After` header.               |
| 501    | `feature_not_configured` | `FEATURE_DISABLED`, `MOCK_MODE_REJECTED`                                                                                                                                                                 | Feature flag off or no DNS provider credentials configured                                                  |
| 502    | `provider_error`         | `DNS_PROVIDER_ERROR`                                                                                                                                                                                     | The DNS layer returned a non-429 error; details in the `dns_provider` field                                 |
