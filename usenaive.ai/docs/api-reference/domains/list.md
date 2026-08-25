> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Domains

> GET /v1/domains — List all domains for your company.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "domains": [
      {
        "id": "domain-uuid-1",
        "domain": "acme-corp.usenaive.ai",
        "status": "active",
        "dns_status": "provisioned",
        "byod": false,
        "app_connect_status": null,
        "connected_app_id": null,
        "created_at": "2026-01-15T10:00:00Z"
      },
      {
        "id": "domain-uuid-2",
        "domain": "acme.com",
        "status": "pending_dns",
        "dns_status": "pending_verification",
        "byod": true,
        "app_connect_status": "agent_managed",
        "connected_app_id": null,
        "created_at": "2026-01-16T14:00:00Z"
      }
    ]
  }
  ```
</ResponseExample>

## Domain Types

| Type          | `byod`  | Description                                                                                                                                                                                          |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System        | `false` | Auto-provisioned on registration (`{slug}.usenaive.ai`). Starts with `status: active`. `dns_status` may be `pending_verification` until **Resend email** verifies — that is not an app HTTP failure. |
| Custom (BYOD) | `true`  | Your own domain, connected via `POST /v1/domains/connect`. Requires DNS setup.                                                                                                                       |

## Domain Statuses (email / company track)

| `status`      | `dns_status`           | Meaning                                                                                                                       |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `active`      | `provisioned`          | Domain is verified and ready for **email**                                                                                    |
| `active`      | `pending_verification` | **System domains only:** the company row is active, but Resend email DNS is still catching up. App connect can still succeed. |
| `pending_dns` | `pending_verification` | BYOD waiting for the customer's DNS records to be verified                                                                    |
| `pending_dns` | `provisioning`         | Domain registered with provider, records being generated                                                                      |

## App-connection lifecycle

| `app_connect_status`    | Meaning                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `null` / `disconnected` | Domain is not associated with a Naive app's apex DNS                                                                     |
| `pending_dns`           | Connected to an app; Vercel ownership / HTTP DNS not verified yet                                                        |
| `connected`             | Apex DNS points at a Naive app and is reconciled by the platform                                                         |
| `agent_managed_pending` | An agent is currently writing apex A/AAAA — transitional state                                                           |
| `agent_managed`         | An agent has taken over apex DNS. Reapers and connect sweeps in either Naive product (SDK or paperclip) skip this domain |

`connected_app_id` is the UUID of the Naive app the apex points at, when applicable.

**Do not conflate the tracks:** `dns_status` = email (Resend). `app_connect_status` + `POST /v1/apps/:id/verify-domain-dns` = app HTTP (Vercel). A system domain can show `dns_status: pending_verification` while `app_connect_status: connected` and app verify returns `verified: true`.

## Notes

* System domains are auto-provisioned on register with `status: active` (never `pending_dns`)
* Use `POST /v1/domains/:id/verify` to re-check **email** `dns_status`
* Use `POST /v1/apps/:id/verify-domain-dns` for **app** attach verification (the platform writes the system-zone A/TXT)
* Only `active` domains can be used to create email inboxes (email track)
* `app_connect_status` flips to `agent_managed` automatically when an agent edits apex A/AAAA via `POST /v1/domains/:id/zone-records` — see [Set Zone Record](/docs/api-reference/domains/zone-records-set)
