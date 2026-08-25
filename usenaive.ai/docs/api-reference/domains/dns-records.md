> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Email Setup Records

> GET /v1/domains/:id/dns-records — View the email-provider setup records the customer must add at their registrar to pass domain verification. Read-only.

<Warning>
  **This is *not* the live zone view.** This endpoint returns only the
  email-provider setup records (MX/TXT/CNAME) that the customer needs to add at
  their registrar to pass email-domain verification. To see (or modify) every
  record currently on the live DNS zone, use the
  [`/zone-records` endpoints](/docs/api-reference/domains/zone-records-list) instead.
</Warning>

<ParamField path="id" type="string" required>
  Domain UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains/domain-uuid/dns-records \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "domain": "mycompany.com",
    "domain_id": "domain-uuid",
    "status": "pending_dns",
    "dns_status": "pending_verification",
    "records": [
      { "type": "MX", "name": "mycompany.com", "value": "feedback-smtp.usenaive.email", "priority": 10, "status": "verified" },
      { "type": "TXT", "name": "mycompany.com", "value": "v=spf1 include:usenaive.email ~all", "status": "pending" },
      { "type": "CNAME", "name": "naive._domainkey.mycompany.com", "value": "naive.domainkey.example.com", "status": "pending" }
    ]
  }
  ```
</ResponseExample>

## Record Statuses

| Status     | Meaning                 |
| ---------- | ----------------------- |
| `verified` | Record confirmed in DNS |
| `pending`  | Record not yet detected |

## Notes

* All records must be `verified` before the domain becomes `active`
* Use this endpoint to check which records still need to be added
* DNS propagation typically takes 5–60 minutes after adding records

## Compared to `/zone-records`

| Endpoint                                 | Returns                                                                 | Mutable?              |
| ---------------------------------------- | ----------------------------------------------------------------------- | --------------------- |
| `GET /v1/domains/:id/dns-records` (this) | Just the email setup records (MX/TXT/CNAME) needed to pass verification | No                    |
| `GET /v1/domains/:id/zone-records`       | Every record currently on the live DNS zone, with provider record IDs   | Yes (via POST/DELETE) |

The MCP tool for this endpoint is `naive_resend_setup_records`. The MCP tools for the
live zone are `naive_list_dns_records`, `naive_set_dns_record`, and `naive_delete_dns_record`.
