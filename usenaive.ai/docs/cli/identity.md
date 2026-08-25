> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# identity

> View agent identity, provisioned resources, and available email inboxes.

## Who am I

`naive whoami` is the cheapest connectivity check. It returns exactly four fields —
`agent_id`, `agent_name`, `company_id`, `company_name` — which is enough to confirm the API key
is valid and which company you are operating under.

```bash theme={"theme":"css-variables"}
naive whoami
```

<Note>
  `whoami` does **not** report the active tenant user. No command does: `naive use <id>` echoes
  the subject when you set it, but neither `whoami` nor `naive config show` reads it back
  afterwards. To be certain which subject a command will act on, set it explicitly in the same
  shell — `naive use <id>`, or `NAIVE_ACTIVE_USER_ID=<id> naive …`. See [use](/docs/cli/use).
</Note>

Use `naive identity` below when you also want the provisioned resources, and
`naive status` when you want credits and tier.

***

## Full Identity

Returns complete identity info including agent details, company context, and all provisioned resources.

```bash theme={"theme":"css-variables"}
naive identity
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "identity",
  "result": {
    "agent": { "id": "uuid", "name": "Research Bot", "role": "api-agent" },
    "company": { "id": "uuid", "name": "Acme Corp" },
    "resources": {
      "email_inboxes": 2,
      "phone_numbers": 0,
      "integrations": 1
    }
  },
  "next_steps": [
    { "command": "naive identity emails", "description": "List only email inboxes (with UUIDs for sending)" },
    { "command": "naive email send --from-inbox <uuid> --to ...", "description": "Send an email using a discovered inbox" }
  ],
  "hints": [
    "Email inboxes listed here provide the UUID needed for the --from-inbox parameter",
    "Resources shown are specific to your current company context"
  ]
}
```

***

## List Email Inboxes

Returns all email inboxes provisioned for your company. The inbox UUID is what you use as `--from-inbox` when sending emails.

```bash theme={"theme":"css-variables"}
naive identity emails
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "identity.emails",
  "result": {
    "inboxes": [
      { "id": "inbox-uuid-1", "address": "support@acme.com", "name": "Support", "status": "active" },
      { "id": "inbox-uuid-2", "address": "hello@acme.com", "name": "General", "status": "active" }
    ]
  },
  "next_steps": [
    { "command": "naive email send --from-inbox inbox-uuid-1 --to <recipient> --subject <subject> --body <body>", "description": "Send an email from the first available inbox" }
  ],
  "hints": [
    "Found 2 email inboxes",
    "Use the inbox UUID as --from-inbox when calling 'naive email send'"
  ]
}
```

***

## List All Resources

Returns a comprehensive list of all resources grouped by type.

```bash theme={"theme":"css-variables"}
naive identity resources
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "identity.resources",
  "result": {
    "email_inboxes": [...],
    "phone_numbers": [...],
    "integrations": [...]
  },
  "next_steps": [
    { "command": "naive identity emails", "description": "See detailed email inbox info" },
    { "command": "naive status", "description": "Check overall account status" }
  ],
  "hints": [
    "Resources are scoped to your current company. Switch companies with 'naive companies select' to see different resources."
  ]
}
```
