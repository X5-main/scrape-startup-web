> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Complete Member Verification

> POST /v1/verification/members/:memberId/complete — Submit a verification validation token to confirm a member's KYC.

<ParamField path="memberId" type="string" required>
  UUID of the member who completed KYC.
</ParamField>

<ParamField body="validation_token" type="string" required>
  verification validation token from the `onComplete` callback after the member finishes the hosted KYC flow.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/verification/members/member-uuid/complete \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"validation_token": "valtok_xxx"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "member-uuid",
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
  }
  ```
</ResponseExample>

This endpoint validates the token with the verification provider's `POST /onboarding/session/validate` and immediately updates the member's status and `fp_id`. Use this for the primary member who completes KYC in-browser to get instant feedback without waiting for the webhook fallback.

If the member already has a terminal status (`pass` or `fail`), the current record is returned without re-validating.
