> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Domain Management

> System domains, custom (BYOD) domains, and domain purchasing — register, verify DNS, buy new domains, and manage the foundation of your email identity.

Domains are the foundation of your agent's email identity. A verified domain enables branded email addresses — whether that's the auto-provisioned system domain (`{slug}.usenaive.ai`), your own custom domain (`agent@acme.com`), or a domain purchased directly through the API.

## CLI First

```bash theme={"theme":"css-variables"}
# List + connect + verify domain
naive domains
naive domains connect example.com
naive domains verify <domain-id>

# Inspect and edit DNS records on a connected domain
naive domains zone-records <domain-id>
naive domains set-record <domain-id> --type CNAME --name www --value shops.myshopify.com
naive domains delete-record <domain-id> <record-id>
```

## Tools

| Tool                   | Type     | Description                                                                                                      |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `list_domains`         | Core     | List all domains for the company with status (includes `app_connect_status`)                                     |
| `connect_domain`       | Core     | Register a custom domain (BYOD) for email                                                                        |
| `resend_setup_records` | Core     | View the email-provider setup records required for verification (read-only)                                      |
| `verify_domain`        | Core     | Trigger DNS verification check                                                                                   |
| `search_domain`        | Core     | Check domain availability and price                                                                              |
| `purchase_domain`      | Core     | Purchase a domain via checkout                                                                                   |
| `list_dns_records`     | DNS edit | List every DNS record on the live DNS zone (with provider IDs)                                                   |
| `set_dns_record`       | DNS edit | Create or replace a DNS record (A/AAAA/CNAME/MX/TXT/CAA). Apex A/AAAA writes flip the domain to `agent_managed`. |
| `delete_dns_record`    | DNS edit | Delete a DNS record by its provider record ID                                                                    |

<Info>
  The DNS edit tools are enabled by default. To disable, set `AGENT_DNS_EDIT_ENABLED=false` on the API — the endpoints will then return `501 feature_not_configured`. They also require either `DNS_REGISTRAR_TOKEN` or `DOMAIN_MOCK=true` (for local development); without either they return `MOCK_MODE_REJECTED`.

  Every DNS edit (success or rejection) appends an `activity_log` row and emits a `domain.updated` live event on `GET /v1/events`.
</Info>

## Domain Types

| Type              | Auto-provisioned?     | Example                 | Use case                                     |
| ----------------- | --------------------- | ----------------------- | -------------------------------------------- |
| **System**        | Yes (on registration) | `acme-corp.usenaive.ai` | Quick start, testing, default sending        |
| **Custom (BYOD)** | No (manual connect)   | `acme.com`              | Branded emails, own registrar                |
| **Purchased**     | No (buy via API)      | `acme.com`              | Branded emails, no existing registrar needed |

## System Domains

Every company gets a system domain automatically when you register. It follows the pattern `{company-slug}.usenaive.ai`.

<Info>
  System domains may start with status `pending_dns` until the email-provider records are verified. This usually resolves automatically, but you can trigger a re-check with the verify endpoint.
</Info>

### Check your system domain

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/domains", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const { domains } = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "domains": [
    {
      "id": "dom-uuid-1",
      "domain": "acme-corp.usenaive.ai",
      "status": "active",
      "dns_status": "provisioned",
      "byod": false
    }
  ]
}
```

If `status` is `pending_dns`, trigger verification:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-1/verify \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Custom Domain Setup (BYOD)

To send emails from your own domain instead of `*.usenaive.ai`:

<Steps>
  <Step title="Connect your domain">
    Tell Naive about a domain you already own at a registrar (any registrar). If you don't own a domain yet, use [Domain Purchasing](#domain-purchasing) instead.

    <CodeGroup>
      ```bash curl theme={"theme":"css-variables"}
      curl -X POST https://api.usenaive.ai/v1/domains/connect \
        -H "Authorization: Bearer nv_sk_your_key" \
        -H "Content-Type: application/json" \
        -d '{ "domain": "acme.com" }'
      ```

      ```javascript JavaScript theme={"theme":"css-variables"}
      const response = await fetch("https://api.usenaive.ai/v1/domains/connect", {
        method: "POST",
        headers: {
          "Authorization": "Bearer nv_sk_your_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: "acme.com" }),
      });
      const domain = await response.json();
      console.log(domain.dns_records); // Records to configure
      ```
    </CodeGroup>

    **Response:**

    ```json theme={"theme":"css-variables"}
    {
      "id": "dom-uuid-2",
      "domain": "acme.com",
      "status": "pending_dns",
      "dns_records": [
        { "type": "MX", "name": "acme.com", "value": "feedback-smtp.usenaive.email", "priority": 10 },
        { "type": "TXT", "name": "acme.com", "value": "v=spf1 include:usenaive.email ~all" },
        { "type": "CNAME", "name": "naive._domainkey.acme.com", "value": "naive.domainkey.usenaive.email" }
      ]
    }
    ```
  </Step>

  <Step title="Configure DNS records">
    Go to your domain registrar's DNS management panel and add each record from the response:

    | Type  | Name                        | Value                                        |
    | ----- | --------------------------- | -------------------------------------------- |
    | MX    | `acme.com`                  | `feedback-smtp.usenaive.email` (priority 10) |
    | TXT   | `acme.com`                  | `v=spf1 include:usenaive.email ~all`         |
    | CNAME | `naive._domainkey.acme.com` | `naive.domainkey.usenaive.email`             |

    <Info>
      DNS propagation typically takes 5-30 minutes, but can take up to 48 hours in some cases.
    </Info>
  </Step>

  <Step title="Check DNS records status">
    View per-record verification status:

    <CodeGroup>
      ```bash curl theme={"theme":"css-variables"}
      curl https://api.usenaive.ai/v1/domains/dom-uuid-2/dns-records \
        -H "Authorization: Bearer nv_sk_your_key"
      ```

      ```javascript JavaScript theme={"theme":"css-variables"}
      const response = await fetch("https://api.usenaive.ai/v1/domains/dom-uuid-2/dns-records", {
        headers: { "Authorization": "Bearer nv_sk_your_key" },
      });
      const dns = await response.json();
      for (const record of dns.records) {
        console.log(`${record.type} ${record.name}: ${record.status}`);
      }
      ```
    </CodeGroup>

    **Response:**

    ```json theme={"theme":"css-variables"}
    {
      "domain": "acme.com",
      "domain_id": "dom-uuid-2",
      "records": [
        { "type": "MX", "name": "acme.com", "value": "...", "status": "verified" },
        { "type": "TXT", "name": "acme.com", "value": "...", "status": "pending" },
        { "type": "CNAME", "name": "naive._domainkey.acme.com", "value": "...", "status": "pending" }
      ]
    }
    ```
  </Step>

  <Step title="Verify the domain">
    Once you've added records and waited for propagation, trigger verification:

    <CodeGroup>
      ```bash curl theme={"theme":"css-variables"}
      curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/verify \
        -H "Authorization: Bearer nv_sk_your_key"
      ```

      ```javascript JavaScript theme={"theme":"css-variables"}
      const response = await fetch("https://api.usenaive.ai/v1/domains/dom-uuid-2/verify", {
        method: "POST",
        headers: { "Authorization": "Bearer nv_sk_your_key" },
      });
      const result = await response.json();
      console.log(result.verified ? "Domain verified!" : "Still pending...");
      ```
    </CodeGroup>

    **Response (success):**

    ```json theme={"theme":"css-variables"}
    {
      "domain": "acme.com",
      "domain_id": "dom-uuid-2",
      "verified": true,
      "status": "active",
      "hint": "Domain verified! You can now create email inboxes on this domain."
    }
    ```

    If verification fails, wait a few more minutes for DNS propagation and try again.
  </Step>

  <Step title="Create inboxes and start sending">
    Once the domain is `active`, create email addresses and send:

    ```bash theme={"theme":"css-variables"}
    curl -X POST https://api.usenaive.ai/v1/email/inboxes \
      -H "Authorization: Bearer nv_sk_your_key" \
      -H "Content-Type: application/json" \
      -d '{ "local_part": "hello", "domain_id": "dom-uuid-2" }'
    ```

    Your agent can now send email from `hello@acme.com`.
  </Step>
</Steps>

## Domain Purchasing

Don't already own a domain? You can search for availability, check pricing, and purchase one directly through the API. Domains are registered via the domain registrar and payment is handled through checkout.

<Info>
  Each company can purchase up to **3 domains**. Purchased domains are automatically configured for email — no manual DNS setup required.
</Info>

### Check availability and price

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/domains/search?domain=acme.com" \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch(
    "https://api.usenaive.ai/v1/domains/search?domain=acme.com",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } }
  );
  const availability = await response.json();
  ```
</CodeGroup>

**Response** (example — the price is dynamic):

```json theme={"theme":"css-variables"}
{
  "domain": "acme.com",
  "available": true,
  "price": 14.99,
  "priceInCents": 1499,
  "currency": "usd"
}
```

<Note>
  `price` is not a fixed figure. It is the registrar's live wholesale quote for
  **that specific domain** (TLDs vary widely — a `.com` and a `.ai` are not the
  same price) plus a flat **\$2** Naïve markup, returned in dollars (`price`) and
  cents (`priceInCents`). The `14.99` above is only an illustrative value; always
  read the number the API returns. Domain purchases are charged in USD at checkout,
  not in credits.
</Note>

If `available` is `false`, try a different domain name.

### Purchase a domain

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/purchase \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "domain": "acme.com" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/domains/purchase", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain: "acme.com" }),
  });
  const result = await response.json();
  // Open result.checkout_url to complete payment
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "checkout_url": "https://checkout.example.com/c/pay/cs_live_...",
  "session_id": "cs_live_...",
  "domain_id": "dom-uuid-3",
  "domain": "acme.com",
  "price": "$14.99",
  "expires_at": "2026-05-04T02:30:00.000Z",
  "_comment": "price is the live registrar quote + $2 markup for this domain — the value shown here is an example",
  "hint": "Open the checkout URL to complete payment. The domain will be registered automatically.",
  "next_steps": [{ "command": "naive domains", "description": "Check domain status after payment" }]
}
```

<Steps>
  <Step title="Search for a domain">
    Use `GET /v1/domains/search?domain=yourdomain.com` to check if the domain is available and see its price.
  </Step>

  <Step title="Start purchase">
    Call `POST /v1/domains/purchase` with the domain name. This creates a checkout session and returns a `checkout_url`.
  </Step>

  <Step title="Complete payment">
    Open the `checkout_url` in a browser to complete payment. The checkout session expires after 30 minutes.
  </Step>

  <Step title="Domain registered automatically">
    After payment, the domain is registered through the domain registrar and DNS is configured automatically. Check status with `GET /v1/domains`.
  </Step>
</Steps>

<Warning>
  The checkout URL expires. If payment is not completed, the domain reservation is released and you'll need to call `POST /v1/domains/purchase` again.
</Warning>

## Agent DNS Editing

Once a domain is connected (custom or purchased) **and** the zone is delegated to the managed DNS, agents can read and modify the DNS records directly. This is a separate surface from the verification workflow above:

| Endpoint                                        | Returns                                                                                | Mutable? | MCP tool                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `GET /v1/domains/:id/dns-records`               | email-provider setup records the user must add at their registrar to pass verification | No       | `naive_resend_setup_records` |
| `GET /v1/domains/:id/zone-records`              | Every record currently in the live DNS zone, with provider record IDs                  | Read     | `naive_list_dns_records`     |
| `POST /v1/domains/:id/zone-records`             | Create or replace a record on the live zone                                            | Write    | `naive_set_dns_record`       |
| `DELETE /v1/domains/:id/zone-records/:recordId` | Delete a record from the live zone                                                     | Write    | `naive_delete_dns_record`    |

### List every record in the zone

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```bash CLI theme={"theme":"css-variables"}
  naive domains zone-records dom-uuid-2
  ```
</CodeGroup>

```json theme={"theme":"css-variables"}
{
  "domain": "acme.com",
  "domain_id": "dom-uuid-2",
  "mock": false,
  "records": [
    { "id": "rec_abc", "type": "A", "name": "", "value": "76.76.21.21", "ttl": 60, "comment": "naive:owned;company=co_...;agent=ag_...;ts=1717..." },
    { "id": "rec_def", "type": "CNAME", "name": "www", "value": "shops.myshopify.com", "ttl": 60 }
  ]
}
```

### Create or replace a record

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "type": "CNAME", "name": "www", "value": "shops.myshopify.com" }'
  ```

  ```bash CLI theme={"theme":"css-variables"}
  naive domains set-record dom-uuid-2 --type CNAME --name www --value shops.myshopify.com
  ```
</CodeGroup>

The default `mode` is `replace`: if a single matching record exists at the same `(type, name)` it is PATCHed in place; if multiple exist, the new authoritative record is added then the old ones are best-effort deleted; if none exist, a new record is added. Set `mode: "append"` to always create a new row instead.

```json theme={"theme":"css-variables"}
{
  "ok": true,
  "record": { "id": "rec_xyz", "type": "CNAME", "name": "www", "value": "shops.myshopify.com" },
  "mock": false,
  "ownership": "naive",
  "replaced_count": 1,
  "path": "patch"
}
```

### Delete a record

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records/rec_xyz \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```bash CLI theme={"theme":"css-variables"}
  naive domains delete-record dom-uuid-2 rec_xyz
  ```
</CodeGroup>

### Safety rules

These rules are enforced by the API and surface via `error.reason` codes:

| Rule                                                                           | Reason code                         |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| Allowed types only: A, AAAA, CNAME, MX, TXT, CAA                               | `DISALLOWED_RECORD_TYPE`            |
| Wildcards (`*` or `*.foo`) are rejected                                        | `DISALLOWED_RECORD_TYPE`            |
| TTL must be 60-86400 seconds                                                   | `INVALID_TTL`                       |
| MX records require a 0-65535 priority                                          | `INVALID_MX_PRIORITY`               |
| CNAME at apex is not permitted                                                 | `CNAME_AT_APEX`                     |
| CNAME cannot coexist with A/AAAA/MX/TXT at the same name (RFC 1912)            | `CNAME_COEXISTENCE`                 |
| CAA values must use an [allowlisted CA](#allowed-cas)                          | `CA_NOT_ALLOWED`                    |
| System domains (`registrar=system`) are read-only                              | `SYSTEM_DOMAIN`                     |
| DMARC and DKIM TXT records are protected                                       | `PROTECTED_RECORD`                  |
| Inbound subdomain MX/TXT (e.g. `agents.acme.com`) is protected                 | `PROTECTED_RECORD`                  |
| Per-company rate limit: 5 mutations/min, 20/hr                                 | `RATE_LIMITED` (sets `Retry-After`) |
| Overwriting a record not created by Naive requires `acknowledge_unowned: true` | `UNOWNED_RECORD_REQUIRES_ACK`       |

### Allowed CAs

`ssl.com`, `letsencrypt.org`, `digicert.com`, `sectigo.com`, `globalsign.com`, `amazon.com`, `pki.goog`, `google.com`.

### Ownership marker

Records written by Naive carry a `comment` like `naive:owned;company=<id>;agent=<id>;ts=<unix>`. The legacy `paperclip:owned` prefix is also recognized for cross-product compatibility on a shared customer zone. To overwrite or delete a record without this marker (e.g. legacy records left at the registrar) pass `acknowledge_unowned: true` in the body or query string. The response's `ownership` field will be `naive` for clean writes and `unowned-acknowledged` when the agent overrode an unowned record.

### Apex A/AAAA flips `app_connect_status`

When a write creates or replaces an apex A or AAAA record (`name` is empty, `@`, or the zone domain), the API atomically transitions the domain's `app_connect_status` to `agent_managed_pending`, writes to the managed DNS, and on success commits to `agent_managed`. On a managed DNS failure it rolls back to the previous status. Reapers and connect sweeps in either Naive product (this SDK or naive-paperclip) skip `agent_managed`/`agent_managed_pending` rows so the agent's record won't be reverted.

Listen for the apex flip on the live event stream (`GET /v1/events`) — `domain.updated` events with `payload.action = "agent_managed"` fire on commit.

### Audit log + live events

Every DNS edit (success or rejection) appends a row to `activity_log` with one of these actions: `dns.record.set`, `dns.record.delete`, `dns.record.rejected`. The same event also fans out on the company SSE stream:

```bash theme={"theme":"css-variables"}
curl -N https://api.usenaive.ai/v1/events \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Accept: text/event-stream"
```

Currently emitted: `domain.updated` and `activity.logged`.

### Mock mode

If `DNS_REGISTRAR_TOKEN` is unset and `DOMAIN_MOCK=true`, all writes are simulated against an in-memory store and responses include `mock: true`. Useful for local development and CI; the operation does **not** touch real DNS.

## Why Custom Domains Matter

| Benefit            | System Domain            | Custom Domain                                 |
| ------------------ | ------------------------ | --------------------------------------------- |
| **Deliverability** | Good                     | Better (proper SPF/DKIM/DMARC on your domain) |
| **Branding**       | `agent@acme.usenaive.ai` | `agent@acme.com`                              |
| **Reply handling** | Works                    | Works + looks professional                    |
| **Setup time**     | Instant                  | 5-60 minutes (DNS propagation)                |

## Error Handling

| Error                                                        | Cause                                                                            | Recovery                                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `duplicate_record`                                           | Domain already registered to this or another company                             | Use `GET /v1/domains` to check existing domains                       |
| `provider_error`                                             | Failed to register domain with the email or domain provider                      | Retry after a few seconds                                             |
| `resource_not_found`                                         | Domain ID doesn't exist or belongs to another company                            | Use `GET /v1/domains` for valid IDs                                   |
| `invalid_input` (not available)                              | Domain is not available for purchase                                             | Try a different domain name                                           |
| `invalid_input` (max domains)                                | Already at the 3 purchased domain limit                                          | Remove an existing domain before purchasing                           |
| `feature_not_configured` (`reason: "FEATURE_DISABLED"`)      | DNS edit endpoints called while `AGENT_DNS_EDIT_ENABLED=false`                   | Set the env var and restart the API                                   |
| `feature_not_configured` (`reason: "MOCK_MODE_REJECTED"`)    | DNS edits attempted without `DNS_REGISTRAR_TOKEN` and without `DOMAIN_MOCK=true` | Configure a DNS registrar token, or enable mock for local development |
| `forbidden` (`reason: "SYSTEM_DOMAIN"`)                      | Tried to edit a system domain                                                    | Use a custom or purchased domain                                      |
| `forbidden` (`reason: "PROTECTED_RECORD"`)                   | Tried to write/delete DMARC, DKIM, or inbound MX/TXT                             | Contact support if a change is genuinely needed                       |
| `rate_limited` (`reason: "RATE_LIMITED"`)                    | Per-company (5/min, 20/hr) or platform write budget exhausted                    | Honor the `Retry-After` header                                        |
| `duplicate_record` (`reason: "UNOWNED_RECORD_REQUIRES_ACK"`) | Overwriting/deleting a record not created by Naive                               | Re-issue with `acknowledge_unowned: true`                             |

## Typical Workflows (Agent Perspective)

### Purchasing a new domain

```
1. GET /v1/domains/search?domain=acme.com
   → available: true, price: "$14.99"   (example — dynamic: live registrar quote + $2)

2. POST /v1/domains/purchase { domain: "acme.com" }
   → checkout_url: "https://checkout.example.com/..."
   → Share checkout URL with user: "Complete payment to register the domain"

3. [User completes checkout]

4. GET /v1/domains
   → domain: "acme.com", status: "active"
   → "Your domain is registered and ready!"

5. POST /v1/email/inboxes { local_part: "hello", domain_id: "dom-uuid" }
   → address: hello@acme.com — ready to send
```

### Connecting an existing domain (BYOD)

```
1. POST /v1/domains/connect { domain: "acme.com" }
   → status: "pending_dns", dns_records: [MX, TXT, CNAME]
   → Share DNS records with user: "Add these at your registrar"

2. [User adds DNS records at their registrar]

3. GET /v1/domains/dom-uuid/dns-records
   → Some records still pending
   → "DNS is still propagating, try again in a few minutes"

4. POST /v1/domains/dom-uuid/verify
   → verified: true
   → "Your domain is verified and ready!"

5. POST /v1/email/inboxes { local_part: "support", domain_id: "dom-uuid" }
   → address: support@acme.com — ready to send
```
