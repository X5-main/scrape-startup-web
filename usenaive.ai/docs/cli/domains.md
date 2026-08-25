> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# domains

> Manage email domains — list, connect, verify, search, purchase, and edit DNS records on the live zone.

## Overview

| Command                                                   | Description                                                       | Cost         |
| --------------------------------------------------------- | ----------------------------------------------------------------- | ------------ |
| `naive domains`                                           | List all domains for your company (includes `app_connect_status`) | Free         |
| `naive domains connect --domain <name>`                   | Connect a custom domain (BYOD)                                    | Free         |
| `naive domains setup-records <id>` (alias: `dns-records`) | Show the email-provider setup records to add at your registrar    | Free         |
| `naive domains verify <id>`                               | Trigger DNS verification for a domain                             | Free         |
| `naive domains search <domain>`                           | Check domain availability and price                               | Free         |
| `naive domains purchase <domain>`                         | Purchase a domain via hosted checkout                             | Domain price |
| `naive domains zone-records <id>`                         | List every record on the live DNS zone                            | Free         |
| `naive domains set-record <id> [opts]`                    | Create or replace a DNS record on the zone                        | Free         |
| `naive domains delete-record <id> <record-id>`            | Delete a DNS record by its provider record ID                     | Free         |

## Two DNS Surfaces

| Command                       | What it returns                                                                                     | Mutable?                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `naive domains setup-records` | Email-provider records (MX/TXT/CNAME) the customer must add at their registrar to pass verification | No                                       |
| `naive domains zone-records`  | Every record currently on the live DNS zone, with provider record IDs needed for `delete-record`    | Yes (via `set-record` / `delete-record`) |

The MCP tools follow the same split: `naive_resend_setup_records` (verification view) vs `naive_list_dns_records` / `naive_set_dns_record` / `naive_delete_dns_record` (live zone).

***

## List Domains

```bash theme={"theme":"css-variables"}
naive domains
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "domains.list",
  "result": {
    "domains": [
      {
        "id": "dom-uuid-1",
        "domain": "acme-corp.usenaive.ai",
        "status": "active",
        "dns_status": "provisioned",
        "byod": false,
        "app_connect_status": null,
        "connected_app_id": null
      },
      {
        "id": "dom-uuid-2",
        "domain": "acme.com",
        "status": "pending_dns",
        "dns_status": "pending_verification",
        "byod": true,
        "app_connect_status": "agent_managed",
        "connected_app_id": null
      }
    ]
  }
}
```

`app_connect_status` is `null`/`disconnected` for fresh domains, `connected` once the apex points at a Naive app, `agent_managed_pending` while an apex A/AAAA write is in flight, and `agent_managed` once an agent has taken over apex DNS.

***

## Connect Domain (BYOD)

```bash theme={"theme":"css-variables"}
naive domains connect --domain mycompany.com
```

Returns the email-provider DNS records to add at your registrar. After adding them, run `naive domains verify <id>`.

***

## Verify Domain

```bash theme={"theme":"css-variables"}
naive domains verify <domain-id>
```

Triggers an immediate verification check. Once all records propagate, the domain transitions to `active` and can be used for email sending.

***

## Search and Purchase Domains

```bash theme={"theme":"css-variables"}
naive domains search example.com
naive domains purchase example.com
```

`search` returns availability and price. `purchase` creates a hosted checkout session — open the returned `checkout_url` to complete payment. The domain is registered automatically after payment.

***

## Zone Records (live DNS zone)

```bash theme={"theme":"css-variables"}
naive domains zone-records <domain-id>
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "domains.zone-records",
  "result": {
    "domain": "acme.com",
    "domain_id": "dom-uuid-2",
    "mock": false,
    "records": [
      { "id": "rec_abc", "type": "A", "name": "", "value": "76.76.21.21", "ttl": 60, "comment": "naive:owned;company=co_...;agent=ag_...;ts=1717..." },
      { "id": "rec_def", "type": "CNAME", "name": "www", "value": "shops.myshopify.com", "ttl": 60 }
    ]
  }
}
```

If the response includes `mock: true`, the API is in `DOMAIN_MOCK` mode and the records came from an in-memory store instead of the live DNS zone.

***

## Set Record (create or replace)

```bash theme={"theme":"css-variables"}
# Apex A record
naive domains set-record <domain-id> --type A --name @ --value 76.76.21.21

# CNAME for www
naive domains set-record <domain-id> --type CNAME --name www --value shops.myshopify.com

# MX with priority
naive domains set-record <domain-id> --type MX --name @ --value mx1.example.com --priority 10

# CAA (must use an allowed CA)
naive domains set-record <domain-id> --type CAA --name @ --value '0 issue "letsencrypt.org"'
```

### Options

| Flag                    | Required | Description                                                                                                                                 |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--type <type>`         | Yes      | One of `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `CAA`                                                                                             |
| `--value <value>`       | Yes      | Record value (IPv4/IPv6, hostname, TXT string, or CAA value)                                                                                |
| `--name <name>`         | No       | Record name; `@` or omit for apex. Defaults to `@`                                                                                          |
| `--ttl <seconds>`       | No       | TTL in seconds, 60-86400                                                                                                                    |
| `--priority <0-65535>`  | No       | MX priority (required for MX)                                                                                                               |
| `--mode <mode>`         | No       | `replace` (default) or `append`. `replace` PATCHes a single matching record or add-then-deletes multiple; `append` always creates a new row |
| `--acknowledge-unowned` | No       | Overwrite a record that wasn't created by Naive                                                                                             |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "domains.set-record",
  "result": {
    "ok": true,
    "record": { "id": "rec_xyz", "type": "CNAME", "name": "www", "value": "shops.myshopify.com" },
    "mock": false,
    "ownership": "naive",
    "replaced_count": 1,
    "path": "patch"
  },
  "hints": [
    "Wrote CNAME record at 'www' (id: rec_xyz)",
    "Replaced 1 existing record(s) via patch"
  ]
}
```

`path` is one of:

* `patch` — A single matching record was updated in place (atomic, no race window)
* `add-then-delete` — Multiple matching records existed; the new record was added first, then the old ones were best-effort deleted
* `add` — No matching record existed; a fresh row was created

`ownership` is `naive` for clean writes and `unowned-acknowledged` when `--acknowledge-unowned` was used to override an existing non-Naive record.

***

## Delete Record

```bash theme={"theme":"css-variables"}
naive domains delete-record <domain-id> <record-id>
naive domains delete-record <domain-id> <record-id> --acknowledge-unowned
```

The record ID comes from `naive domains zone-records`. Protected records (DMARC, DKIM, inbound MX/TXT) and system domains cannot be deleted — the API returns `403 forbidden` with `reason: "PROTECTED_RECORD"` or `"SYSTEM_DOMAIN"`.

***

## Safety Rules (enforced by the API)

| Rule                                                                                                                                              | Reason code                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Allowed types only: A, AAAA, CNAME, MX, TXT, CAA                                                                                                  | `DISALLOWED_RECORD_TYPE`            |
| Wildcards (`*` or `*.foo`) are rejected                                                                                                           | `DISALLOWED_RECORD_TYPE`            |
| TTL must be 60-86400 seconds                                                                                                                      | `INVALID_TTL`                       |
| MX records require a 0-65535 priority                                                                                                             | `INVALID_MX_PRIORITY`               |
| CNAME at apex is not permitted                                                                                                                    | `CNAME_AT_APEX`                     |
| CNAME cannot coexist with A/AAAA/MX/TXT at the same name                                                                                          | `CNAME_COEXISTENCE`                 |
| CAA values must use one of: `ssl.com`, `letsencrypt.org`, `digicert.com`, `sectigo.com`, `globalsign.com`, `amazon.com`, `pki.goog`, `google.com` | `CA_NOT_ALLOWED`                    |
| System domains (`registrar=system`) are read-only — `zone-records` lists them, `set-record`/`delete-record` refuse                                | `SYSTEM_DOMAIN`                     |
| DMARC and DKIM TXT records are protected                                                                                                          | `PROTECTED_RECORD`                  |
| Inbound subdomain MX/TXT (e.g. `agents.acme.com`) is protected                                                                                    | `PROTECTED_RECORD`                  |
| Per-company rate limit: 5 mutations/min, 20/hr                                                                                                    | `RATE_LIMITED` (sets `Retry-After`) |
| Overwriting/deleting a record not created by Naive requires `--acknowledge-unowned`                                                               | `UNOWNED_RECORD_REQUIRES_ACK`       |

***

## Mock Mode

If the API is configured with `DOMAIN_MOCK=true` (or `VERCEL_REGISTRAR_TOKEN` is unset), DNS edits are simulated against an in-memory store and the response includes `mock: true`. Useful for local development and CI; real DNS is **not** touched.

The feature flag `AGENT_DNS_EDIT_ENABLED` defaults to **on**. Flip it to `false` only as an emergency kill switch. When disabled the endpoints return `501 feature_not_configured` with `reason: "FEATURE_DISABLED"`.

## Apex A/AAAA flips `app_connect_status`

`naive domains set-record <id> --type A --name @ --value ...` (and the AAAA equivalent) atomically transitions the domain to `app_connect_status = "agent_managed"`:

1. Pre-flip the row to `agent_managed_pending` and clear `connected_app_id`.
2. Write to the DNS zone.
3. On success, commit the flip to `agent_managed` and emit a `domain.updated` live event with `payload.action = "agent_managed"`.
4. On failure, roll back to the previous status (best-effort).

Reapers and connect sweeps skip `agent_managed`/`agent_managed_pending` rows, so the agent's record won't be reverted. To re-enable Naive app routing the user must explicitly disconnect and reconnect the domain from the dashboard — the agent cannot reverse this automatically.

## Audit log + live events

Every successful or rejected DNS edit appends a row to `activity_log`:

| Action                | When                       |
| --------------------- | -------------------------- |
| `dns.record.set`      | Successful `set-record`    |
| `dns.record.delete`   | Successful `delete-record` |
| `dns.record.rejected` | Any guard-rail rejection   |

The same event also fans out on the [Server-Sent Events stream](/docs/api-reference/overview#live-event-stream) (`GET /v1/events`) as `domain.updated` (and `activity.logged`) so dashboards and supervising agents can react in real time.

***

## Workflow: Editing Apex DNS for a New Web App

```bash theme={"theme":"css-variables"}
# 1. List domains and copy the UUID of the BYOD domain you want to edit.
naive domains

# 2. Inspect the current zone — find any existing apex A record.
naive domains zone-records <domain-id>

# 3. Replace the apex A record so traffic points at your new app.
naive domains set-record <domain-id> --type A --name @ --value 76.76.21.21

# 4. Re-list to confirm.
naive domains zone-records <domain-id>
```
