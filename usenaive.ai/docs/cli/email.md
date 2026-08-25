> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# email

> Send and manage emails using provisioned inboxes — identity-aware with structured agent output.

## Overview

The email primitive is **identity-aware**: you must first discover or create inboxes, then use the inbox UUID to send. This prevents agents from sending from unauthorized addresses.

<Info>
  Requires an active (verified) domain. System domains are auto-provisioned on registration but may start as `pending_dns`. Use `naive domains` to check status and `naive domains verify <id>` to trigger verification.
</Info>

**Workflow:**

1. `naive email create --local-part support` — create a new inbox
2. `naive email inboxes` — discover available from addresses
3. `naive email send --from-inbox <uuid> ...` — send from a specific inbox
4. `naive email sent` — list sent messages
5. `naive email inbox` — check for replies
6. `naive email read <id>` — read sent or received content

***

## Create Inbox

Create a new email inbox on your company's domain.

```bash theme={"theme":"css-variables"}
naive email create --local-part support
naive email create --local-part sales-team
naive email create --local-part hello --domain-id <domain-uuid>
```

### Options

| Flag                  | Required | Description                                                      |
| --------------------- | -------- | ---------------------------------------------------------------- |
| `--local-part <name>` | Yes      | The part before @ (letters, numbers, dots, hyphens, min 2 chars) |
| `--domain-id <uuid>`  | No       | Specific domain UUID (defaults to company's active domain)       |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.create",
  "result": {
    "id": "inbox-uuid-new",
    "address": "support@acme.com",
    "local_part": "support",
    "domain": "acme.com",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "next_steps": [
    { "command": "naive email send --from-inbox inbox-uuid-new --to <recipient> --subject <subject> --body <body>", "description": "Send an email from this new inbox" },
    { "command": "naive email inboxes", "description": "List all inboxes including the new one" }
  ],
  "hints": [
    "Inbox created: support@acme.com",
    "Use this UUID as --from-inbox when sending emails"
  ]
}
```

### Requirements

* Your company must have at least one active domain
* The email address must not already exist (active)
* Local part must be at least 2 characters

***

## Delete Inbox

Deactivate an email inbox. Emails to this address will stop being received.

```bash theme={"theme":"css-variables"}
naive email delete <inbox-uuid>
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.delete",
  "result": { "id": "inbox-uuid", "address": "support@acme.com", "status": "deleted" },
  "next_steps": [
    { "command": "naive email inboxes", "description": "Verify inbox is removed" },
    { "command": "naive email create --local-part <name>", "description": "Create a replacement" }
  ],
  "hints": ["Inbox deactivated — emails to this address will no longer be received"]
}
```

***

## List Inboxes

```bash theme={"theme":"css-variables"}
naive email inboxes
```

Returns all email inboxes available for sending, with UUIDs:

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.inboxes",
  "result": {
    "inboxes": [
      { "id": "inbox-uuid-1", "address": "support@acme.com", "name": "Support", "status": "active" },
      { "id": "inbox-uuid-2", "address": "hello@acme.com", "name": "General", "status": "active" }
    ]
  },
  "next_steps": [
    { "command": "naive email send --from-inbox inbox-uuid-1 --to <recipient> --subject <subject> --body <body>", "description": "Send an email using the first inbox" }
  ],
  "hints": [
    "2 inboxes available for sending",
    "Use the inbox 'id' field as the --from-inbox parameter when sending"
  ]
}
```

***

## Send Email

```bash theme={"theme":"css-variables"}
naive email send \
  --from-inbox <inbox-uuid> \
  --to recipient@example.com \
  --subject "Invoice Ready" \
  --body "Your invoice is attached and ready for review."
```

### Options

| Flag                  | Required | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| `--from-inbox <uuid>` | Yes      | Inbox UUID (get via `naive email inboxes`) |
| `--to <email>`        | Yes      | Recipient email address                    |
| `--subject <text>`    | Yes      | Email subject line                         |
| `--body <text>`       | Yes      | Email body (plain text or HTML)            |
| `--reply-to <email>`  | No       | Reply-to override                          |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.send",
  "result": {
    "id": "provider-message-id",
    "message_id": "naive-message-uuid",
    "tracking_available": true,
    "status": "sent",
    "credits_used": 0.016
  },
  "next_steps": [
    { "command": "naive email inbox", "description": "Monitor inbox for replies" },
    { "command": "naive email read naive-message-uuid", "description": "View sent message details" },
    { "command": "naive email sent", "description": "List sent messages" }
  ],
  "hints": [
    "Email sent successfully (id: provider-message-id)",
    "Naive message id: naive-message-uuid",
    "Cost: 0.016 credits (deducted immediately)"
  ]
}
```

**Cost:** 0.016 credits per email (refunded in full if a scheduled send is cancelled)

***

## List Sent Emails

```bash theme={"theme":"css-variables"}
naive email sent
naive email sent --limit 20 --offset 20
```

Returns sent-message UUIDs that can be opened with `naive email read <id>`.
The provider `id` returned by `email send` remains the identifier for scheduled
email cancellation, rescheduling, and delivery status.

***

## List Received Emails

```bash theme={"theme":"css-variables"}
naive email inbox
naive email inbox --inbox <uuid> --limit 10
```

### Options

| Flag             | Required | Description                        |
| ---------------- | -------- | ---------------------------------- |
| `--inbox <uuid>` | No       | Filter to a specific inbox         |
| `--limit <n>`    | No       | Max emails to return (default: 20) |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.inbox",
  "result": {
    "emails": [
      { "id": "msg-uuid-1", "from": "john@company.com", "subject": "Re: Research", "received_at": "2025-01-15T10:30:00Z", "snippet": "Thanks for the update..." },
      { "id": "msg-uuid-2", "from": "news@service.com", "subject": "Weekly Digest", "received_at": "2025-01-15T08:00:00Z", "snippet": "Here's your weekly..." }
    ]
  },
  "next_steps": [
    { "command": "naive email read msg-uuid-1", "description": "Read the most recent email" },
    { "command": "naive email inbox --limit 50", "description": "Load more emails" }
  ],
  "hints": ["2 emails found", "Use 'naive email read <id>' to see full email content"]
}
```

***

## Read Sent or Received Email

```bash theme={"theme":"css-variables"}
naive email read <message-id>
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.read",
  "result": {
    "id": "msg-uuid-1",
    "from": "john@company.com",
    "to": "support@acme.com",
    "subject": "Re: Research",
    "body": "Thanks for the update. Can you send the revised version?",
    "html": "<p>Thanks for the update...</p>",
    "received_at": "2025-01-15T10:30:00Z",
    "direction": "received"
  },
  "next_steps": [
    { "command": "naive email send --from-inbox <uuid> --to john@company.com --subject \"Re: Re: Research\" --body <reply>", "description": "Reply to this email" }
  ],
  "hints": ["Use the sender address with 'naive email send' to reply"]
}
```
