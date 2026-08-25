> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Verification

> GET /v1/verification/:id — Get a single verification with all member statuses.

<ParamField path="id" type="string" required>
  UUID of the verification to retrieve.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/verification/verification-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "verification-uuid",
    "company_id": "company-uuid",
    "status": "in_progress",
    "ready_for_formation": false,
    "kyc_playbook_key": "pb_live_xxx",
    "metadata": null,
    "created_at": "2026-05-04T10:00:00.000Z",
    "updated_at": "2026-05-04T10:05:00.000Z",
    "members": [
      {
        "id": "member-uuid-1",
        "role": "primary",
        "is_responsible_party": true,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@example.com",
        "ownership_percentage": 60,
        "status": "pass",
        "fp_id": "fp_id_xxx",
        "link": null,
        "link_expires_at": null,
        "completed_at": "2026-05-04T10:03:00.000Z",
        "created_at": "2026-05-04T10:00:00.000Z"
      },
      {
        "id": "member-uuid-2",
        "role": "secondary",
        "is_responsible_party": false,
        "first_name": "Bob",
        "last_name": "Jones",
        "email": "bob@example.com",
        "ownership_percentage": 40,
        "status": "link_sent",
        "fp_id": null,
        "link": "https://verify.usenaive.ai/?type=user#obtok_yyy",
        "link_expires_at": "2026-05-05T10:00:00.000Z",
        "completed_at": null,
        "created_at": "2026-05-04T10:00:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>

`ready_for_formation` is `true` only when every member has `status: "pass"`. Use this as the gate signal before submitting to a formation provider.
