> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Start Verification

> POST /v1/verification — Start identity verification (KYC) for a set of company members.

<ParamField body="members" type="array" required>
  Array of members to verify. Each member requires `first_name`, `last_name`, `email`, `ownership_percentage`, `role`, and `is_responsible_party`.
</ParamField>

<Expandable title="Member object">
  <ParamField body="first_name" type="string" required>Legal first name</ParamField>
  <ParamField body="last_name" type="string" required>Legal last name</ParamField>
  <ParamField body="email" type="string" required>Email address (used for KYC link delivery)</ParamField>
  <ParamField body="phone_number" type="string">Phone number in E.164 format (optional, pre-fills KYC form)</ParamField>
  <ParamField body="ownership_percentage" type="integer" required>0-100, must sum to 100 across all members</ParamField>
  <ParamField body="role" type="string" required>`"primary"` (exactly one) or `"secondary"`</ParamField>
  <ParamField body="is_responsible_party" type="boolean" required>IRS-facing person for formation (exactly one must be `true`)</ParamField>
</Expandable>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/verification \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "members": [
        {
          "first_name": "Alice",
          "last_name": "Smith",
          "email": "alice@example.com",
          "ownership_percentage": 60,
          "role": "primary",
          "is_responsible_party": true
        },
        {
          "first_name": "Bob",
          "last_name": "Jones",
          "email": "bob@example.com",
          "ownership_percentage": 40,
          "role": "secondary",
          "is_responsible_party": false
        }
      ]
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "verification-uuid",
    "status": "in_progress",
    "primary_link": "https://verify.usenaive.ai/?type=user#obtok_xxx",
    "members": [
      {
        "id": "member-uuid-1",
        "role": "primary",
        "is_responsible_party": true,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@example.com",
        "ownership_percentage": 60,
        "status": "link_ready",
        "link": "https://verify.usenaive.ai/?type=user#obtok_xxx"
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
        "link": "https://verify.usenaive.ai/?type=user#obtok_yyy"
      }
    ]
  }
  ```
</ResponseExample>

The primary member's link is returned in `primary_link` for immediate use. Secondary members are emailed their links automatically. Ownership percentages must sum to 100, exactly one member must be `primary`, and exactly one must be `is_responsible_party: true`.

<Note>
  **May require approval.** If the user's Account Kit gates `verification.start`,
  an agent (API-key) call returns `202 { "status": "pending_approval", "approval_id" }`
  instead of starting KYC. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview); KYC begins on replay. See
  [Approvals](/docs/getting-started/approvals).
</Note>
