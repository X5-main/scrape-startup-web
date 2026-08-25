> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify Domain

> POST /v1/domains/:id/verify — Trigger DNS verification for a domain.

<ParamField path="id" type="string" required>
  Domain UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/domain-uuid/verify \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "domain": "mycompany.com",
    "domain_id": "domain-uuid",
    "verified": true,
    "status": "active",
    "dns_status": "provisioned",
    "hint": "Domain verified! You can now create email inboxes on this domain."
  }
  ```
</ResponseExample>

## Unverified Response

If DNS records haven't propagated yet:

```json theme={"theme":"css-variables"}
{
  "domain": "mycompany.com",
  "domain_id": "domain-uuid",
  "verified": false,
  "status": "pending_dns",
  "dns_status": "pending_verification",
  "hint": "DNS records not yet verified. Check GET /v1/domains/{id}/dns-records and ensure all records are added."
}
```

## Notes

* Safe to call multiple times (idempotent)
* This endpoint verifies **email / Resend** readiness (`dns_status`), not app HTTP attach
* For app routing on a connected domain use `POST /v1/apps/:id/verify-domain-dns` instead
* Works for both system domains and custom (BYOD) domains
* Once email-verified, `dns_status` becomes `provisioned` and inboxes can be created
* System domains already have `status: active` at register; if `dns_status` is still `pending_verification`, call this to re-check Resend — not because the app is broken
