> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Resend Verification Link

> POST /v1/verification/members/:memberId/resend — Regenerate and resend a KYC link for a member.

<ParamField path="memberId" type="string" required>
  UUID of the member to resend the link to.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/verification/members/member-uuid/resend \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "member-uuid",
    "link": "https://verify.usenaive.ai/?type=user#obtok_new",
    "status": "link_sent"
  }
  ```
</ResponseExample>

Creates a new KYC onboarding session for the member (allowing reonboarding) and emails the new link. Use this when a member's previous link expired or they need to retry verification.

Returns `invalid_input` if the member has already passed verification.
