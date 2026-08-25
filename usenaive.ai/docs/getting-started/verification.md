> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Identity Verification

> KYC identity verification for company founders/members — hosted links, email delivery, and real-time status tracking.

Identity Verification is the **compliance primitive**. Naive's KYC engine exposes a consistent API so agents can trigger KYC for every founder on a company formation, track each member's verification status, and know exactly when all members are cleared for downstream processes like incorporation.

## CLI First

```bash theme={"theme":"css-variables"}
# Start KYC for founders/members
naive verification start --members '[{"first_name":"Alice","last_name":"Smith","email":"alice@example.com","ownership_percentage":100,"role":"primary","is_responsible_party":true}]'

# Track status
naive verification list
naive verification status <verification-id>
```

## Tools

| Tool                           | Type | Description                                               | Cost                  |
| ------------------------------ | ---- | --------------------------------------------------------- | --------------------- |
| `start_verification`           | Core | Start KYC for a set of members with ownership percentages | 60 credits per member |
| `get_verification`             | Info | Get verification status + all member statuses             | Free                  |
| `list_verifications`           | Info | List all verifications for the company                    | Free                  |
| `complete_member_verification` | Core | Submit validation token after in-browser KYC              | Free                  |
| `resend_verification_link`     | Core | Resend/regenerate a member's KYC link                     | Free                  |

<Info>
  Only `start_verification` is billed, because that is the call that opens a hosted
  identity session with the verification provider. It charges 60 credits (\$3.00) for
  each member a session was created for; reads, resends and token submission are
  free. A member whose session fails to open is not charged.
</Info>

## How It Works

1. **Start verification** — provide members with names, emails, ownership percentages, and responsible party designation
2. **Primary member** gets their hosted KYC link returned immediately in the response
3. **Secondary members** are emailed their KYC links automatically
4. Each member completes KYC in their browser (ID scan, selfie, SSN, address)
5. **Status updates** arrive via verification webhooks or the validation token endpoint
6. When all members pass, `ready_for_formation` becomes `true`

## Starting Verification

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/verification \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "members": [
        {
          "first_name": "Alice",
          "last_name": "Smith",
          "email": "alice@example.com",
          "phone_number": "+15551234567",
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

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/verification", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      members: [
        {
          first_name: "Alice",
          last_name: "Smith",
          email: "alice@example.com",
          phone_number: "+15551234567",
          ownership_percentage: 60,
          role: "primary",
          is_responsible_party: true,
        },
        {
          first_name: "Bob",
          last_name: "Jones",
          email: "bob@example.com",
          ownership_percentage: 40,
          role: "secondary",
          is_responsible_party: false,
        },
      ],
    }),
  });
  const result = await response.json();
  ```
</CodeGroup>

**Response (201):**

```json theme={"theme":"css-variables"}
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

### Member Parameters

| Param                  | Type    | Required | Description                                                  |
| ---------------------- | ------- | -------- | ------------------------------------------------------------ |
| `first_name`           | string  | Yes      | Legal first name                                             |
| `last_name`            | string  | Yes      | Legal last name                                              |
| `email`                | string  | Yes      | Email address (used for KYC link delivery)                   |
| `phone_number`         | string  | No       | Phone number in E.164 format                                 |
| `ownership_percentage` | integer | Yes      | 0-100, must sum to 100 across all members                    |
| `role`                 | string  | Yes      | `"primary"` (exactly one) or `"secondary"`                   |
| `is_responsible_party` | boolean | Yes      | IRS-facing person for formation (exactly one must be `true`) |

### Validation Rules

* At least one member is required
* Exactly one member must have `role: "primary"`
* Exactly one member must have `is_responsible_party: true`
* Ownership percentages must sum to exactly 100

## Checking Status

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/verification/verification-uuid \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/verification/verification-uuid", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const verification = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "verification-uuid",
  "status": "in_progress",
  "ready_for_formation": false,
  "members": [
    { "id": "member-uuid-1", "status": "pass", "email": "alice@example.com" },
    { "id": "member-uuid-2", "status": "link_sent", "email": "bob@example.com" }
  ]
}
```

<Info>
  `ready_for_formation` is `true` only when **every** member has `status: "pass"`. This is the gate signal for downstream formation.
</Info>

## Completing Verification (Validation Token)

After a member finishes KYC in the hosted flow, the embedded SDK provides a `validationToken`. Submit it to get immediate status confirmation without waiting for the webhook:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/verification/members/member-uuid/complete \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"validation_token": "valtok_xxx"}'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/verification/members/member-uuid/complete", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ validation_token: "valtok_xxx" }),
  });
  const member = await response.json();
  ```
</CodeGroup>

## Resending Links

If a member's link expires or they lost the email:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/verification/members/member-uuid/resend \
  -H "Authorization: Bearer nv_sk_your_key"
```

A new KYC session is created and the link is emailed to the member.

## Member Statuses

| Status           | Meaning                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `pending`        | KYC session not yet created (usually a transient error)                    |
| `link_ready`     | KYC link generated but not emailed (primary member — link in API response) |
| `link_sent`      | KYC link emailed to the member                                             |
| `in_progress`    | Member started but hasn't finished KYC                                     |
| `pass`           | Identity verified successfully                                             |
| `fail`           | Identity verification failed                                               |
| `incomplete`     | Member abandoned the KYC flow                                              |
| `pending_review` | Flagged for manual review in the KYC dashboard                             |

## Verification Statuses

| Status        | Meaning                                  |
| ------------- | ---------------------------------------- |
| `pending`     | Just created, sessions being generated   |
| `in_progress` | At least one member hasn't completed KYC |
| `completed`   | All members passed                       |
| `failed`      | At least one member failed               |

## Error Handling

| Error                    | Cause                                          | Recovery                         |
| ------------------------ | ---------------------------------------------- | -------------------------------- |
| `feature_not_configured` | KYC\_SECRET\_KEY or KYC\_PLAYBOOK\_KEY not set | Configure env vars               |
| `invalid_input`          | Validation failed (percentages, roles, emails) | Fix input per validation rules   |
| `resource_not_found`     | Verification or member UUID not found          | Check UUIDs                      |
| `provider_error`         | Verification provider error                    | Retry or check the KYC dashboard |

## Typical Workflow

```
Agent receives task: "Set up identity verification for company incorporation"
    │
    ├─ POST /v1/verification                        → Start KYC for all founders
    │   { members: [{ role: "primary", ... }, { role: "secondary", ... }] }
    │   → verification_id, primary_link
    │
    ├─ Primary founder opens link in browser         → Completes KYC
    │
    ├─ POST /v1/verification/members/:id/complete    → Submit validation token
    │   → status: "pass"
    │
    ├─ Secondary members receive email               → Complete KYC via link
    │   (verification webhook updates their status)
    │
    ├─ GET /v1/verification/:id                      → Check progress
    │   → ready_for_formation: false (1/2 verified)
    │
    ├─ GET /v1/verification/:id                      → Check again
    │   → ready_for_formation: true (all verified)
    │
    └─ Ready for formation submission
```
