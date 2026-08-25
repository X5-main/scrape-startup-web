> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Verifications

> GET /v1/verification — List all identity verification requests for the company.

Returns all verification requests for the authenticated company, ordered by creation date (newest first).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/verification \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "verifications": [
      {
        "id": "verification-uuid-1",
        "status": "in_progress",
        "ready_for_formation": false,
        "member_count": 2,
        "members_verified": 1,
        "created_at": "2026-05-04T10:00:00.000Z"
      },
      {
        "id": "verification-uuid-2",
        "status": "completed",
        "ready_for_formation": true,
        "member_count": 1,
        "members_verified": 1,
        "created_at": "2026-04-28T14:30:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>
