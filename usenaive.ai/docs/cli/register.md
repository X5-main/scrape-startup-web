> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# register / login / link

> Create, authenticate, or link a Naive account from the CLI.

## Register (New Account)

Creates a new account with email and password and provisions a company workspace and API agent. The account starts at **0 credits**: a verification link is emailed at registration, and the 20 free credits are granted once it is clicked. Those credits run every primitive except LLM routing (`naive llm chat`), which needs a paid account — buy a pack with `naive billing topup` or subscribe with `naive billing subscribe`. See [Credits](/docs/getting-started/credits).

```bash theme={"theme":"css-variables"}
naive register --name "Alex" --email alex@company.com --password mypassword123
naive register --name "Build Agent" --email agent@acme.co --password s3cur3pw --company "Acme Corp"
```

### Options

| Flag                    | Required | Description                                                                                     |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `--name <name>`         | No       | Your name or agent identity name. Defaults to the email local-part (`agent@acme.co` → `agent`). |
| `--email <email>`       | Yes      | Email address (must be unique)                                                                  |
| `--password <password>` | Yes      | Account password (min 8 characters)                                                             |
| `--company <name>`      | No       | Company name (defaults to "`<name>`'s Company")                                                 |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "register",
  "result": {
    "agent_id": "uuid",
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "credentials_saved": "~/.naive/config.json",
    "initial_credits": 0,
    "pending_email_verification": true
  },
  "next_steps": [
    { "command": "naive status", "description": "Verify account status and available credits" },
    { "command": "naive identity", "description": "View provisioned resources (email inboxes, etc.)" },
    { "command": "naive email inboxes", "description": "List email addresses available for sending" }
  ],
  "hints": [
    "Your API key is saved locally — all future commands authenticate automatically",
    "You start at 0 credits. Verify your email (check the inbox for a verification link) to receive your 20 free credits. Use 'naive usage' to track spending."
  ]
}
```

***

## Login (Existing Account)

Authenticates with an existing email + password and issues a new API key.

```bash theme={"theme":"css-variables"}
naive login --email alex@company.com --password mypassword123
```

### Options

| Flag                    | Required | Description           |
| ----------------------- | -------- | --------------------- |
| `--email <email>`       | Yes      | Account email address |
| `--password <password>` | Yes      | Account password      |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "login",
  "result": {
    "agent_id": "uuid",
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "credentials_saved": "~/.naive/config.json",
    "companies": [
      { "id": "uuid-1", "name": "Acme Corp" },
      { "id": "uuid-2", "name": "Side Project" }
    ]
  },
  "next_steps": [
    { "command": "naive status", "description": "Check current credits and resources" },
    { "command": "naive companies select <id>", "description": "Switch to a different company" }
  ]
}
```

### Notes

* Uses the same credentials as the Naive dashboard (usenaive.ai)
* If you have multiple companies, the first is selected by default
* Each login creates a new API key (old keys remain valid)

***

## Email Magic Link (Passwordless)

Signs in to a new or existing account through the durable email magic-link flow.

```bash theme={"theme":"css-variables"}
naive auth email existing@example.com
```

### When to Use

* You created your account through a social provider
* You prefer passwordless authentication
* You want to link a second machine/agent to an existing account

The CLI starts a temporary listener on `127.0.0.1`, requests a one-time link,
and waits while you click the link delivered to your inbox. The API key is
exchanged directly with the local listener and saved to `~/.naive/config.json`;
no verification code or secret is pasted into the terminal.

<Warning>
  **`naive link` no longer exists.** It was removed along with the unauthenticated
  key-minting endpoint pair it called. There is no alias — `naive link` now answers
  `{"error":{"code":"cli_outdated"}}`, which is misleading: updating the CLI will not
  bring it back. Use `naive auth email <address>` above.

  **`naive verify` is retired but still registered**, deliberately. It makes no request,
  imports no auth path and cannot reach the deleted endpoints; it exists only to answer
  `{"error":{"code":"deprecated_command"}}` and point you at `naive auth email`. The
  six-digit-code sign-in flow is gone.
</Warning>

***

## Companies

List all companies accessible to your account:

```bash theme={"theme":"css-variables"}
naive companies
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "companies.list",
  "result": {
    "companies": [
      { "id": "uuid-1", "name": "Acme Corp", "credits": 15000, "tier": "pro" },
      { "id": "uuid-2", "name": "Side Project", "credits": 1000, "tier": "free" }
    ]
  },
  "next_steps": [
    { "command": "naive companies select <company_id>", "description": "Switch to a different company context" }
  ]
}
```

### Select Company

Switch the active company context (issues a new API key):

```bash theme={"theme":"css-variables"}
naive companies select 550e8400-e29b-41d4-a716-446655440000
```

***

## Keys

Manage API keys for the current agent/company:

```bash theme={"theme":"css-variables"}
# List all keys
naive keys list

# Create a new key
naive keys create --name "Production Server"

# Revoke a key (permanent)
naive keys revoke <key-id>
```

***

## Who Am I

```bash theme={"theme":"css-variables"}
naive whoami
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "whoami",
  "result": {
    "agent_id": "uuid",
    "agent_name": "Research Bot",
    "company_id": "uuid",
    "company_name": "Acme Corp"
  },
  "next_steps": [
    { "command": "naive status", "description": "See full status including credits and resources" },
    { "command": "naive companies", "description": "List all companies you have access to" }
  ]
}
```
