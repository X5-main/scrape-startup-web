> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Email

> The email primitive — create inboxes, send and receive mail through identity-aware addresses on your company's domain.

Email is one of the most fundamental primitives in Naive API v2. Every company gets a system domain auto-provisioned on registration, and agents can create inboxes, send mail, and read replies — all scoped to the authenticated identity.

This guide covers the full email lifecycle: domain setup, inbox provisioning, sending, and reading.

## CLI First

```bash theme={"theme":"css-variables"}
# Create inbox and send email
naive email create --local-part hello
naive email inboxes
naive email send --from-inbox <inbox-id> --to user@example.com --subject "Hi" --body "Hello"
```

## Tools

| Tool                | Type | Description                                      |
| ------------------- | ---- | ------------------------------------------------ |
| `create_inbox`      | Core | Create a new email inbox on the company's domain |
| `delete_inbox`      | Core | Deactivate an email inbox                        |
| `list_inboxes`      | Core | List all available inboxes for the company       |
| `send_email`        | Core | Send an email from a specific inbox              |
| `list_inbox_emails` | Core | List received emails for an inbox                |
| `get_email`         | Core | Read the full body of a specific email           |

## Domain Prerequisites

Before sending email, your company needs an **active (verified) domain**. System domains are auto-provisioned on registration but may start as `pending_dns` until the email-provider records are verified.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/domains \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/domains", {
    headers: { "Authorization": "Bearer nv_sk_your_key" },
  });
  const { domains } = await response.json();
  ```
</CodeGroup>

If your domain shows `pending_dns`, trigger verification:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/domains/{domain_id}/verify \
  -H "Authorization: Bearer nv_sk_your_key"
```

See [Domain Management](/docs/api-reference/domains/list) for the full BYOD workflow.

## Creating Inboxes

Create email addresses on your company's active domain. Each inbox gets a dedicated identity.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/email/inboxes \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "local_part": "support" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/email/inboxes", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ local_part: "support" }),
  });
  const inbox = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "inbox-uuid",
  "address": "support@acme-corp.usenaive.ai",
  "local_part": "support",
  "domain": "acme-corp.usenaive.ai",
  "status": "active"
}
```

### Parameters

| Param        | Type   | Required | Default | Description                                                      |
| ------------ | ------ | -------- | ------- | ---------------------------------------------------------------- |
| `local_part` | string | Yes      | —       | The part before `@` (min 2 chars, alphanumeric + dots/hyphens)   |
| `domain_id`  | string | No       | Auto    | Specific domain UUID (defaults to company's first active domain) |

<Info>
  You can create multiple inboxes on the same domain — `support@`, `sales@`, `notifications@`, etc.
</Info>

## Sending Email

The `send_email` tool requires the inbox UUID you're sending from. This enforces identity — agents can only send from addresses they own.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/email/send \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "from_inbox": "inbox-uuid",
      "to": "prospect@company.com",
      "subject": "Research findings",
      "body": "Hi Sarah,\n\nHere are the results from our analysis..."
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/email/send", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_inbox: "inbox-uuid",
      to: "prospect@company.com",
      subject: "Research findings",
      body: "Hi Sarah,\n\nHere are the results from our analysis...",
    }),
  });
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "provider-message-id",
  "message_id": "naive-sent-message-uuid",
  "tracking_available": true,
  "status": "sent",
  "credits_used": 0.016,
  "credits_remaining": 999.984
}
```

Use `message_id` with `GET /v1/email/:id` or `naive email read`. The `id`
field remains the provider identifier for schedule/status operations.

### Parameters

| Param        | Type   | Required | Default | Description                     |
| ------------ | ------ | -------- | ------- | ------------------------------- |
| `from_inbox` | string | Yes      | —       | Inbox UUID to send from         |
| `to`         | string | Yes      | —       | Recipient email address         |
| `subject`    | string | Yes      | —       | Email subject line              |
| `body`       | string | Yes      | —       | Email body (plain text or HTML) |
| `reply_to`   | string | No       | —       | Reply-to address override       |

**Cost:** 0.016 credits per email (deducted immediately on success). Cancelling a scheduled send refunds the charge in full.

## Reading the Inbox

### List received emails

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/email/inbox?from_inbox=inbox-uuid&limit=20" \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch(
    "https://api.usenaive.ai/v1/email/inbox?from_inbox=inbox-uuid&limit=20",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } }
  );
  const { emails } = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "emails": [
    {
      "id": "em-uuid-1",
      "from": "sarah@company.com",
      "subject": "Re: Research findings",
      "received_at": "2026-04-27T10:30:00Z",
      "snippet": "Thanks for the update, this looks great..."
    }
  ]
}
```

### Read a specific email

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/email/em-uuid-1 \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Error Handling

| Error                  | Cause                                           | Recovery                                                              |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `invalid_inbox`        | Inbox UUID not found or not owned by this agent | Use `GET /v1/email/inboxes` to see available inboxes                  |
| `no_active_domain`     | Company has no verified domain                  | Check `GET /v1/domains` and verify with `POST /v1/domains/:id/verify` |
| `domain_not_verified`  | Sending from an unverified domain               | Run `naive domains verify <id>` or `POST /v1/domains/:id/verify`      |
| `insufficient_credits` | Not enough credits to send                      | Check balance with `GET /v1/status`                                   |
| `duplicate_record`     | Email address already exists (active)           | Use a different `local_part`                                          |

## Typical Workflow

```
Agent receives task: "Set up email and reach out to leads"
    │
    ├─ GET /v1/domains                         → Check domain status
    │   → status: active ✓
    │
    ├─ POST /v1/email/inboxes                  → Create outreach inbox
    │   { local_part: "outreach" }
    │   → address: outreach@acme.usenaive.ai
    │
    ├─ POST /v1/email/send                     → Send personalized email
    │   { from_inbox: "inbox-uuid",
    │     to: "lead@company.com",
    │     subject: "Quick question",
    │     body: "Hi Alex, ..." }
    │   → sent: true
    │
    ├─ GET /v1/email/inbox?from_inbox=...      → Check for replies
    │   → 1 new email
    │
    └─ GET /v1/email/em-uuid-1                 → Read the reply
        → "Thanks for reaching out! Let's schedule a call."
```
