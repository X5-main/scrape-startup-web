> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# CLI Overview

> The naive CLI — an agent-native command-line toolkit for the durable runtime, the company brain, governance, and the primitives.

The `naive` CLI is built for **agentic use** — every command returns structured JSON with result
data, contextual next steps, and guidance for autonomous operation.

## Installation

```bash theme={"theme":"css-variables"}
npm install -g @usenaive-sdk/cli
```

## Output modes

**Machine JSON is the default.** Human-readable output is opt-in — it is never inferred from
`isTTY`, because a pty-wrapped agent looks exactly like a terminal.

|                          | How                                    |
| ------------------------ | -------------------------------------- |
| Machine JSON (default)   | nothing to do; or `--json` to force it |
| Human, one command       | `--human`                              |
| Human, persistently      | `naive config output human`            |
| Show the current setting | `naive config show`                    |

`--json` and `--human` are the **only two global flags**. `stdout` is always `JSON.parse`-able
in machine mode; banners, update notices and deprecation notices go to `stderr`.

## Active user

Naive is multi-tenant. Every subject-scoped command acts on a **tenant user**. By default that
is the API key's default user, so solo usage needs no setup.

```bash theme={"theme":"css-variables"}
naive use alice_user_id           # select a subject
naive cards list                  # acts on alice
naive use --clear                 # back to the key's default
```

<Warning>
  `--user <id>` is **not** a global flag. It exists only on the commands that declare it —
  `approvals`, `connections`, `vault`, `logs`, `loops`, `env`, `module add`,
  `agent-profiles provision` and `mobile proxy-set`. On anything else it is an
  `invalid_input` error. Use `naive use <id>` or `NAIVE_ACTIVE_USER_ID` instead. Full
  resolution order on the [use](/docs/cli/use) page.
</Warning>

See [users](/docs/cli/users) and [account-kits](/docs/cli/account-kits) for managing tenants.

## Active project

A tenant user (a **child project**) lives in a [project](/docs/getting-started/projects). Every
organization has a default one, so this is opt-in — with nothing selected the CLI acts
exactly where it always did.

```bash theme={"theme":"css-variables"}
naive projects list
naive projects use <project_id>          # persisted; sent as X-Naive-Project-Id
naive use <user_id> --project <id>       # both selections in one command
naive --project <id> users list          # global flag: this command only
```

See [projects](/docs/cli/projects).

## Agent-Native Output

Every command returns a structured JSON response:

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "email.send",
  "result": { "id": "provider-message-id", "message_id": "naive-message-uuid" },
  "next_steps": [
    { "command": "naive email inbox", "description": "Monitor inbox for replies" },
    { "command": "naive email read naive-message-uuid", "description": "View sent message details" }
  ],
  "hints": [
    "Email sent successfully",
    "Cost: 0.016 credits"
  ],
  "related_commands": ["naive email inbox", "naive email read"]
}
```

## Exit codes

| Exit | Meaning                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------- |
| `0`  | Success                                                                                               |
| `1`  | The command failed (`success: false` on stdout)                                                       |
| `2`  | `naive teams plan --detailed-exitcode` found a diff                                                   |
| `3`  | At least one card is `unverified` — opt-in, [`naive teams`](/docs/cli/teams) only, **hermes tenants only** |

Exits 2 and 3 are opt-in and exist only on [`naive teams`](/docs/cli/teams). Exit 3 is
unreachable for a tenant on the durable runtime (its task states do not include
`unverified`); the command warns on stderr in that case — see
[exit codes on `naive teams`](/docs/cli/teams#exit-codes).

## Configuration

Config is stored at `~/.naive/config.json`, written mode `0600` — it holds an API key and a
30-day session token.

```json theme={"theme":"css-variables"}
{
  "api_key": "nv_sk_live_...",
  "base_url": "https://api.usenaive.ai",
  "agent_id": "uuid",
  "company_id": "uuid",
  "company_name": "Acme Corp",
  "active_user_id": "tu_8f21",
  "output": "human"
}
```

The config is automatically populated when you register or login:

```bash theme={"theme":"css-variables"}
naive register --name "My Agent" --email me@example.com --password mypassword
# or
naive login --email me@example.com --password mypassword
```

## Environment Variables

| Variable                   | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| `NAIVE_API_KEY`            | Override API key (for CI/headless use)                                  |
| `NAIVE_BASE_URL`           | Override API URL (default: `https://api.usenaive.ai`)                   |
| `NAIVE_ACTIVE_USER_ID`     | The subject tenant user — how a hosted agent's container gets its scope |
| `NAIVE_HUMAN`              | Set to `1` for human-readable output                                    |
| `NAIVE_NO_UPDATE_NOTIFIER` | Suppress the "update available" banner                                  |

## Command Groups

### The durable runtime

| Group                   | Commands                                                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Teams](/docs/cli/teams)** | 28 subcommands — `teams submit`, `board`, `runs`, `watch`, `apply`, `approvals`, `decide`, `plan`, `roster`, `cost`, … | Declare a team, send it work, watch it, decide what it asks for. Addressing is `(company, tenant, team)` and `--tenant` is required on every subcommand except `list`. **What works depends on the tenant's runtime: 18 of the 28 serve real rows for a durable tenant, 12 for a hermes tenant; the other 10 answer `501 not_configured` and name what is missing on the runtime that tenant is on.** |

### Knowledge

| Group                   | Commands                                                                                                                                                                                                                                                     | Description                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **[Brain](/docs/cli/brain)** | `brain list`, `create`, `connect`, `disconnect`, `rm`, `query`, `recall`, `remember`, `think`, `graph`, `timeline`, `forget`, `add`, `note`, `replace-doc`, `docs`, `doc`, `rm-doc`, `attach`, `consolidate`, `proposals`, `writebacks`, `status`, `metrics` | The company's brains — which agent works out of which, documents, semantic memory, and the attach/consolidate/propose run loop |

### Legacy orchestration — deprecated, still working, frozen

Every group below keeps answering exactly as before, prints a deprecation banner on `stderr`,
and is **not** scheduled for removal.

| Group                             | Commands                                                                                              | Replacement                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **[CEO](/docs/cli/ceo)**               | `ceo run`, `message`, `status`, `sessions`, `stream`, `team-approve`                                  | `naive teams say` / `show` / `runs` / `watch`                     |
| **[Tasks](/docs/cli/tasks)**           | `tasks list`, `create`, `show`, `complete`, `block`, `unblock`, `comment`, `run`, `dispatch`, `stats` | `naive teams submit` / `board` / `task` / `unblock`               |
| **[Objectives](/docs/cli/objectives)** | `objectives list`, `create`, `show`, `update`, `pause`, `abandon`                                     | `naive teams submit --task <id>`                                  |
| **[Employees](/docs/cli/employees)**   | `employees list`, `hire`, `fire`, `configure`                                                         | `naive teams roster` (the provisioning verbs have no replacement) |
| **[Cron](/docs/cli/cron-jobs)**        | `cron create`, `list`, `trigger`, `pause`, `remove`                                                   | `naive teams schedule` / `unschedule`                             |
| **[Loops](/docs/cli/loops)**           | `loops list`, `create`, `get`, `update`, `run`, `remove`                                              | `naive teams schedule`                                            |
| **[Memory](/docs/cli/memory)**         | `memory add`, `list`, `remove`                                                                        | `naive brain remember` / `recall` / `forget`                      |

### Authentication & account

| Group                       | Commands                                                                                                                    | Description                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Auth**                    | `register`, `login`, `auth google`, `auth email <address>`, `auth session-login`, `auth logout`, `verify` (retired refusal) | Account creation and sign-in. `naive link` no longer exists — see [register](/docs/cli/register)       |
| **Identity**                | [`whoami`](/docs/cli/identity), [`identity emails`](/docs/cli/identity), [`identity resources`](/docs/cli/identity)                        | Who you are, and what is provisioned                                                              |
| **Companies**               | `companies`, `companies show`, `companies rename`, `companies update`, `companies select`                                   | List and switch companies                                                                         |
| **Keys**                    | `keys list`, `keys create --name --scope`, `keys revoke <id>`                                                               | API key management                                                                                |
| **Config**                  | `config output <human\|json>`, `config show`                                                                                | CLI preferences                                                                                   |
| **Status**                  | `status`, `usage --days --limit`                                                                                            | Full status overview; credit transaction history                                                  |
| **[Billing](/docs/cli/billing)** | `billing plans`, `subscribe`, `upgrade`, `status`, `portal`, `packs`, `topup`                                               | Plans, subscriptions, credit top-ups                                                              |
| **Report**                  | `report "<message>" --kind --command --session --stack`                                                                     | File a bug. Use on `provider_error` / `internal_error` / 5xx — **not** on self-correctable errors |

### Project lifecycle (`naive.config.ts`)

| Group                | Commands                                                                                                 | Description                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Init / up / down** | `init [--force]`, `up [--plan] [--local] [--yes] [--no-deploy]`, `down [--yes]`                          | Scaffold a `naive.config.ts`, then plan + apply it. `naive up --plan` previews without applying |
| **Agent profiles**   | `agent-profiles provision <template> --user <id>`, `agent-profiles list`, `get`, `revoke`; `revoke [id]` | Provision and govern a real-world profile per tenant                                            |
| **Modules**          | `module list`, `module add <name> --user <id>`                                                           | Capabilities available to a profile                                                             |
| **Environments**     | `env status`, `env promote --to <env>`, `env reset`, `env use <base_url>`, `env create --tenant --from`  | Sandbox/production environments and per-tenant preview sandboxes                                |

### Multi-tenant governance

| Group                                 | Commands                                                        | Description                                   |
| ------------------------------------- | --------------------------------------------------------------- | --------------------------------------------- |
| **[Projects](/docs/cli/projects)**         | `projects list`, `create`, `get`, `use`, `delete`               | Scopes inside your organization               |
| **[Users](/docs/cli/users)**               | `users list`, `create`, `get`, `delete`                         | Tenant users (child projects)                 |
| **[Account Kits](/docs/cli/account-kits)** | `account-kits list`, `create`, `assign`                         | Which primitives and tools a tenant may use   |
| **[Approvals](/docs/cli/approvals)**       | `approvals list`, `get`, `approve`, `deny`, `watch`             | Human-in-the-loop resolution of gated actions |
| **[Connections](/docs/cli/connections)**   | `connections list`, `connect`, `disconnect`, `tools`, `execute` | Gmail, Slack, GitHub and 1,000+ apps          |
| **[Vault](/docs/cli/vault)**               | `vault list`, `put`, `reveal`, `delete`, `rotate`               | Per-user encrypted credential storage         |
| **[Logs](/docs/cli/logs)**                 | `logs tail`, `logs all`                                         | Activity logs, per-user or cross-user         |
| **[Use](/docs/cli/use)**                   | `use <user_id>`, `use --clear`, `use <id> --project <id>`       | Select the active subject (and its project)   |

### Primitives

| Group                                                                                                        | Commands                                                                                                                                                                                                                   | Description                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **[Apps](/docs/cli/apps)**                                                                                        | `apps list`, `create`, `templates`, `show`, `deploy`, `publish`, `deployments`, `retry`, `secrets`, `domains`, `db`, `vercel`, `supabase`, `delete`                                                                        | Managed web apps, incl. scoped provider API proxies                                                                                    |
| **[Domains](/docs/cli/domains)**                                                                                  | `domains`, `connect`, `setup-records`, `verify`, `search`, `purchase`, `zone-records`, `set-record`, `delete-record`                                                                                                       | Domain search, purchase, DNS                                                                                                           |
| **[Email](/docs/cli/email)**                                                                                      | `email inboxes`, `create`, `delete`, `send`, `inbox`, `read`                                                                                                                                                               | Provisioned inboxes; send and receive                                                                                                  |
| **[Phone](/docs/cli/phone)**                                                                                      | `phone provision`, `list`, `status`, `send`, `messages`, `read`, `assign`, `release`                                                                                                                                       | US numbers + SMS                                                                                                                       |
| **[Search](/docs/cli/search)**                                                                                    | `search`, `search url`, `search research`                                                                                                                                                                                  | Web search, URL extraction, deep research                                                                                              |
| **[LLM](/docs/cli/llm)**                                                                                          | `llm chat`, `llm models`                                                                                                                                                                                                   | Gateway-backed LLM completions                                                                                                         |
| **[Images](/docs/cli/images)**                                                                                    | `images generate`, `stock`, `status`, `models`                                                                                                                                                                             | AI image generation and stock photos                                                                                                   |
| **[Video](/docs/cli/video)**                                                                                      | `video generate`, `clip`, `clip-status`, `status`, `models`, `pricing`                                                                                                                                                     | AI video generation; see [clips](/docs/cli/clips)                                                                                           |
| **[Audio](/docs/cli/audio)**                                                                                      | `audio transcribe`, `transcription`, `speak`, `converse`, `models`, `usage`, `request`                                                                                                                                     | Speech to text, text to speech, native audio turns                                                                                     |
| **Voice / Clone**                                                                                            | `voice say`, `list`, `status`, `clone`, `revoke`; `clone generate`, `clone status`                                                                                                                                         | Cloned voices and digital-twin talking video. `voice clone` / `voice revoke` are **human-only** — they need `naive auth session-login` |
| **[Browser](/docs/cli/browser)**                                                                                  | `browser` subcommands                                                                                                                                                                                                      | Live cloud browser sessions                                                                                                            |
| **[Social](/docs/cli/social)**                                                                                    | `social status`, `activate`, `connect`, `accounts`, `post`, `posts`, `publish`, `analytics`                                                                                                                                | Social media management                                                                                                                |
| **[Media](/docs/cli/media)**                                                                                      | `media list`, `get`, `upload`, `update`, `delete`                                                                                                                                                                          | Media asset manager                                                                                                                    |
| **[SEO](/docs/cli/seo)** · **[AEO](/docs/cli/aeo)** · **[App data](/docs/cli/app-data)** · **[E-commerce](/docs/cli/ecommerce)** | `seo`, `aeo`, `app-data`, `ecommerce`                                                                                                                                                                                      | Market-data primitives                                                                                                                 |
| **Business data**                                                                                            | `business google`, `trustpilot`, `tripadvisor`, `social`, `tasks-ready`, `task-get`                                                                                                                                        | Backs [travel](/docs/cli/travel) and [reviews](/docs/cli/reviews)                                                                                |
| **[Cards](/docs/cli/cards)**                                                                                      | `cards`, `cardholder`, `create-cardholder`, `update-cardholder`, `create`, `details`, `check-payment`, `retry-issue`, `top-up`, `refund`, `cancel`, `assignments`, `assign`, `unassign`, `log-transaction`, `transactions` | Virtual cards                                                                                                                          |
| **[Trading](/docs/cli/trading)**                                                                                  | `trading connect`, `connections`, `account`, `assets`, `positions`, `order`, `orders`, `close`, `cancel`, `quote`                                                                                                          | Brokerage link + trade                                                                                                                 |
| **[Payments](/docs/cli/payments)** · **[Wallet](/docs/cli/wallet)**                                                    | `payments`, `wallet show/balance/create/fund/transfer/policy/sweep`                                                                                                                                                        | x402 stablecoin payments; agent crypto wallet                                                                                          |
| **[Verification](/docs/cli/verification)** · **[Formation](/docs/cli/formation)**                                      | `verification start/list/status/complete/resend`, `formation naics-codes/submit/list/status/documents/download`                                                                                                            | KYC and LLC formation                                                                                                                  |
| **[Compute](/docs/cli/compute)** · **[Queue](/docs/cli/queue)** · **[Mobile](/docs/cli/mobile)**                            | `compute`, `queue`, `mobile`                                                                                                                                                                                               | Containers, durable queues, cloud mobile devices                                                                                       |
| **[Jobs](/docs/cli/jobs)**                                                                                        | `jobs`, `jobs get`, `jobs cancel`                                                                                                                                                                                          | Monitor async generation/research jobs                                                                                                 |

<Note>
  This table lists **groups**, not every subcommand. `naive <group> --help` is authoritative and
  is generated from the same declaration the command tree is built from. A subcommand that is not
  in `--help` does not exist, and an unknown subcommand of a known group fails loudly with
  `unknown_subcommand` rather than falling through to the group's help.
</Note>

## Getting Started

```bash theme={"theme":"css-variables"}
# 1. Create account
naive register --name "Research Agent" --email agent@company.com --password s3cur3pw

# 2. Verify connectivity
naive status

# 3. Discover resources
naive identity emails

# 4. Start using primitives
naive search "latest AI developments"
naive email send --from-inbox <uuid> --to team@company.com --subject "Report" --body "..."
naive images generate "product mockup" --model fal-ai/flux/schnell --wait
```

## Error Handling

Errors also return structured JSON with recovery guidance:

```json theme={"theme":"css-variables"}
{
  "success": false,
  "action": "email.send",
  "error": {
    "code": "insufficient_credits",
    "message": "Not enough credits for this operation",
    "hint": "Add credits at https://usenaive.ai/billing"
  },
  "recovery_steps": [
    { "command": "naive usage", "description": "Check credit usage history" },
    { "command": "naive status", "description": "View current balance and tier" }
  ]
}
```

Four error codes are minted **by the CLI** and never by the server, so they will not appear in
the API reference: `cli_outdated` (unknown top-level command), `unknown_subcommand`,
`upstream_error` (a non-JSON gateway response) and `deprecated_command` (a retired command that
makes no request).

## Detailed Help

Every command has comprehensive built-in help with examples:

```bash theme={"theme":"css-variables"}
naive --help                    # Full CLI overview
naive email --help              # Email command group
naive email send --help         # Specific command with examples
naive video generate --help     # Parameters, models, costs
```
