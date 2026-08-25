> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Verification

> Identity verification (KYC) for company founders/members — start, track, complete, and resend.

## Overview

| Command                                                  | Description                        | Cost |
| -------------------------------------------------------- | ---------------------------------- | ---- |
| `naive verification start --members <json>`              | Start KYC for a set of members     | Free |
| `naive verification list`                                | List all verification requests     | Free |
| `naive verification status <id>`                         | Get verification + member statuses | Free |
| `naive verification complete <memberId> --token <token>` | Submit validation token            | Free |
| `naive verification resend <memberId>`                   | Resend a member's KYC link         | Free |

***

## Start Verification

Starts identity verification for one or more company founders/members. Each member gets a hosted KYC link.

```bash theme={"theme":"css-variables"}
naive verification start --members '[
  {"first_name":"Alice","last_name":"Smith","email":"alice@example.com",
   "ownership_percentage":60,"role":"primary","is_responsible_party":true},
  {"first_name":"Bob","last_name":"Jones","email":"bob@example.com",
   "ownership_percentage":40,"role":"secondary","is_responsible_party":false}
]'
```

### Rules

* Exactly one member must have `role: "primary"`
* Exactly one member must have `is_responsible_party: true`
* Ownership percentages must sum to 100
* Primary member's KYC link is returned in the response
* Secondary members are emailed their KYC links

### Member Fields

| Field                  | Type    | Required | Description                     |
| ---------------------- | ------- | -------- | ------------------------------- |
| `first_name`           | string  | Yes      | Legal first name                |
| `last_name`            | string  | Yes      | Legal last name                 |
| `email`                | string  | Yes      | Email address                   |
| `phone_number`         | string  | No       | E.164 format                    |
| `ownership_percentage` | integer | Yes      | 0-100, sum must be 100          |
| `role`                 | string  | Yes      | `"primary"` or `"secondary"`    |
| `is_responsible_party` | boolean | Yes      | IRS-facing person (exactly one) |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "verification.start",
  "result": {
    "id": "verification-uuid",
    "status": "in_progress",
    "primary_link": "https://verify.usenaive.ai/?type=user#obtok_xxx",
    "members": [
      { "id": "member-uuid-1", "role": "primary", "status": "link_ready", "link": "https://..." },
      { "id": "member-uuid-2", "role": "secondary", "status": "link_sent", "link": "https://..." }
    ]
  },
  "next_steps": [
    { "command": "Open https://verify.usenaive.ai/...", "description": "Primary member: complete KYC in browser" },
    { "command": "naive verification status verification-uuid", "description": "Check verification progress" }
  ]
}
```

***

## List Verifications

```bash theme={"theme":"css-variables"}
naive verification list
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "verification.list",
  "result": {
    "verifications": [
      { "id": "verification-uuid", "status": "in_progress", "ready_for_formation": false, "member_count": 2, "members_verified": 1 }
    ]
  }
}
```

***

## Check Status

```bash theme={"theme":"css-variables"}
naive verification status <verification-id>
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "verification.status",
  "result": {
    "id": "verification-uuid",
    "status": "in_progress",
    "ready_for_formation": false,
    "members": [
      { "id": "member-uuid-1", "status": "pass", "email": "alice@example.com" },
      { "id": "member-uuid-2", "status": "link_sent", "email": "bob@example.com" }
    ]
  },
  "hints": ["Status: in_progress", "Ready for formation: false", "1/2 members verified"]
}
```

***

## Complete Member Verification

After a member finishes KYC in the browser, submit the verification validation token:

```bash theme={"theme":"css-variables"}
naive verification complete <member-id> --token valtok_xxx
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "verification.complete",
  "result": { "id": "member-uuid", "status": "pass", "email": "alice@example.com" }
}
```

***

## Resend Link

Regenerate and resend a KYC link for a member whose link expired or was lost:

```bash theme={"theme":"css-variables"}
naive verification resend <member-id>
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "verification.resend",
  "result": { "id": "member-uuid", "link": "https://verify.usenaive.ai/...", "status": "link_sent" }
}
```
