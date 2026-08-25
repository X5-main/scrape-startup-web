> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Zone Record

> DELETE /v1/domains/:id/zone-records/:recordId — Remove a DNS record from the live DNS zone.

<ParamField path="id" type="string" required>
  Domain UUID
</ParamField>

<ParamField path="recordId" type="string" required>
  Provider record ID (from `GET /v1/domains/:id/zone-records`)
</ParamField>

<ParamField query="acknowledge_unowned" type="boolean">
  Pass `true` (in body or query) to delete a record that wasn't created by Naive.
</ParamField>

<RequestExample>
  ```bash naive-owned record theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records/rec_xyz \
    -H "Authorization: Bearer nv_sk_live_..."
  ```

  ```bash unowned record theme={"theme":"css-variables"}
  curl -X DELETE 'https://api.usenaive.ai/v1/domains/dom-uuid-2/zone-records/rec_legacy?acknowledge_unowned=true' \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "ok": true,
    "domain_id": "dom-uuid-2",
    "record_id": "rec_xyz",
    "mock": false,
    "ownership": "naive"
  }
  ```

  ```json 200 (unowned, acknowledged) theme={"theme":"css-variables"}
  {
    "ok": true,
    "domain_id": "dom-uuid-2",
    "record_id": "rec_legacy",
    "mock": false,
    "ownership": "unowned-acknowledged"
  }
  ```
</ResponseExample>

## Behavior

1. The record is fetched from the live zone to verify its identity (type and name).
2. Protected records — DMARC, DKIM, and inbound subdomain MX/TXT — are rejected.
3. Records not created by Naive are rejected unless `acknowledge_unowned=true` is passed.
4. The record is deleted from the DNS zone; the per-company rate limit (5/min, 20/hr) is charged after the global token budget is reserved, so a 429 from the platform bucket does not consume the tenant's per-minute slot.

## Errors

| Status | `code`                   | `reason`                                 | Cause                                                                       |
| ------ | ------------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| 403    | `forbidden`              | `SYSTEM_DOMAIN`, `PROTECTED_RECORD`      | System domain or protected record (DMARC/DKIM/inbound)                      |
| 404    | `resource_not_found`     | `DOMAIN_NOT_FOUND`, `RECORD_NOT_FOUND`   | Domain doesn't exist or record ID isn't in this zone                        |
| 409    | `duplicate_record`       | `UNOWNED_RECORD_REQUIRES_ACK`            | Record was not created by Naive — re-issue with `acknowledge_unowned: true` |
| 429    | `rate_limited`           | `RATE_LIMITED`                           | Per-company or platform rate limit exceeded. Includes `Retry-After` header. |
| 501    | `feature_not_configured` | `FEATURE_DISABLED`, `MOCK_MODE_REJECTED` | Feature flag off or no DNS provider credentials                             |
| 502    | `provider_error`         | `DNS_PROVIDER_ERROR`                     | The DNS layer returned a non-429 error                                      |
