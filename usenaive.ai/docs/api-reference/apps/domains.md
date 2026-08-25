> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Domains

> Manage app domains — add custom domains to the app, connect company domains, verify DNS, set the primary domain.

Apps serve production traffic on their default `{projectName}.vercel.app` domain until you attach your own. There are two ways to do that:

* **Add a custom domain** — attaches any domain you control to the app. You configure DNS yourself (point the domain at the app).
* **Connect a company domain** — links a domain owned via the [Domains primitive](/docs/api-reference/domains/list) (purchased or registered through `naive domains`). The domain is attached to the app's hosting, recorded on the app, and set as primary in one step; DNS verification status is tracked on the company domain (`app_connect_status`).

## List Domains

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/domains \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "domains": [
      {
        "id": "domain-uuid-1",
        "domain": "myapp.com",
        "type": "company",
        "verified": true,
        "isPrimary": true,
        "companyDomainId": "company-domain-uuid"
      },
      {
        "id": "domain-uuid-2",
        "domain": "staging.myapp.com",
        "type": "custom",
        "verified": false,
        "isPrimary": false,
        "companyDomainId": null
      }
    ]
  }
  ```
</ResponseExample>

***

## Add Custom Domain

Attaches the domain to the app's hosting:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/:id/domains \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"domain": "myapp.com"}'
```

### Request Body

| Field    | Type   | Required | Description                       |
| -------- | ------ | -------- | --------------------------------- |
| `domain` | string | Yes      | Domain to add (e.g., `myapp.com`) |

Must be a real public domain. RFC 2606 / special-use TLDs — `.test`,
`.example`, `.invalid`, `.localhost` — and bare single labels are rejected with
`invalid_input`: they can never be DNS-verified, so accepting them only
produces a row stuck at `verified: false`.

The app must already have a hosting project linked. Without one there is
nothing to attach DNS to, and the call refuses with `feature_not_configured`
(501) rather than writing an unusable row. Provider failures are surfaced too:
a non-2xx from the hosting API (other than 409 "already attached", which is
success) returns `provider_error` with the upstream status in the hint.

### Response

```json 200 theme={"theme":"css-variables"}
{
  "id": "domain-uuid-2",
  "domain": "myapp.com",
  "type": "custom",
  "verified": false,
  "isPrimary": false
}
```

After adding, point DNS at the hosting platform (apex: `A 76.76.21.21`; subdomains: `CNAME cname.vercel-dns.com`). You can check the expected configuration via the [hosting proxy](/docs/api-reference/apps/vercel-proxy): `GET v9/projects/{projectId}/domains/{domain}`.

***

## Remove Domain

Removes the domain from the app and its hosting:

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/apps/:id/domains/:domainId \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "ok": true
}
```

***

## Set Primary Domain

Marks a domain as the app's primary. The next [publish](/docs/api-reference/apps/publish) aliases production to the primary domain:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/:id/domains/:domainId/set-primary \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "ok": true
}
```

***

## Connect Company Domain

Connect a domain managed by `naive domains` to serve this app's production deployment. Attaches it to the app's hosting, records it on the app, and sets it as primary:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/:id/connect-domain \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"domainId": "company-domain-uuid"}'
```

```json 200 theme={"theme":"css-variables"}
{
  "domain": "myapp.com",
  "pendingDns": true
}
```

If `pendingDns` is `true`:

* **System domain (`*.usenaive.ai`):** do **not** configure DNS yourself. The platform writes the apex A (+ any ownership TXT) on the shared zone. Call [Verify DNS](#verify-dns). Agents cannot `set-record` on system domains (`403 SYSTEM_DOMAIN`).
* **Custom / purchased company domain:** configure registrar DNS yourself, then verify.

The company domain's `app_connect_status` transitions `pending_dns` → `connected`. This is separate from email `dns_status` / `naive domains verify`.

***

## Disconnect Company Domain

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/apps/:id/connect-domain/:domainId \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "ok": true
}
```

***

## Verify DNS

Trigger DNS verification for a connected company domain:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/apps/:id/verify-domain-dns \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"domainId": "company-domain-uuid"}'
```

```json 200 theme={"theme":"css-variables"}
{
  "verified": true,
  "domain": "myapp.com"
}
```

### System vs custom

| Domain               | Who writes DNS                        | If `verified: false`                                                                                                                                              |
| -------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{slug}.usenaive.ai` | Platform (`ensureSystemDomainAppDns`) | Short retry of this endpoint. Do **not** dig-and-wait 48h or edit the zone. A hard `provider_error` / `feature_not_configured` means platform config — report it. |
| BYOD / purchased     | You (at your registrar)               | Propagation can take longer; re-run once the records are in place.                                                                                                |

## Errors

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "resource_not_found",
    "message": "Domain not found"
  }
}
```

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "Domain is already connected to another app"
  }
}
```

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "Domain 'probe.test' uses a reserved or invalid TLD and cannot be attached to an app"
  }
}
```

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "feature_not_configured",
    "message": "No Vercel project linked to this app"
  }
}
```
