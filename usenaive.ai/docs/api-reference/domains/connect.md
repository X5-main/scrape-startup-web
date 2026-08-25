> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect Domain

> POST /v1/domains/connect — Connect your own domain (BYOD) for email sending.

<ParamField body="domain" type="string" required>
  The domain to connect (e.g., `mycompany.com` or `mail.mycompany.com`)
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/domains/connect \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "domain": "mycompany.com" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "domain-uuid",
    "domain": "mycompany.com",
    "status": "pending_dns",
    "dns_records": [
      { "type": "MX", "name": "mycompany.com", "value": "feedback-smtp.usenaive.email", "priority": 10 },
      { "type": "TXT", "name": "mycompany.com", "value": "v=spf1 include:usenaive.email ~all" },
      { "type": "CNAME", "name": "naive._domainkey.mycompany.com", "value": "naive.domainkey.example.com" }
    ],
    "hint": "Add these DNS records at your registrar, then call POST /v1/domains/{id}/verify"
  }
  ```
</ResponseExample>

## Workflow

1. Call this endpoint with your domain
2. Add the returned DNS records at your domain registrar (your registrar)
3. Wait for DNS propagation (typically 5–60 minutes)
4. Call `POST /v1/domains/:id/verify` to trigger verification
5. Once verified, create inboxes with `POST /v1/email/inboxes`

## Errors

| Code               | Meaning                                             |
| ------------------ | --------------------------------------------------- |
| `duplicate_record` | Domain already connected to this or another company |
| `provider_error`   | Failed to register domain with email provider       |
