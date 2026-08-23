> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# CLI Reference: Commands, Flags & Configuration

> Full reference for the OneCLI command-line tool: installation, every command with flags, environment variables, and configuration.

The `onecli` CLI lets you manage your OneCLI instance from the terminal. Create agents, add secrets, configure access, all with JSON output that AI agents can parse and act on.

**GitHub:** [github.com/onecli/onecli-cli](https://github.com/onecli/onecli-cli)

## Why a CLI for managing OneCLI?

The dashboard is great for humans. But when an AI agent needs to set up its own environment (create its identity, register the secrets it needs, check its current access), it shouldn't need a human clicking through a UI.

The `onecli` CLI gives agents (and the frameworks that orchestrate them) a programmatic interface to manage the OneCLI server. An agent orchestrator can spin up a new agent, assign it credentials for specific services, and configure rules, all in a single script, no browser required.

This is especially useful for:

* Agent bootstrapping, where an orchestrator creates an agent identity and assigns secrets before the agent starts working
* Dynamic provisioning: spin up short-lived agents with scoped access for specific tasks, then clean up after
* CI/CD pipelines that automate agent and secret management as part of your deployment
* Self-healing agents that detect a missing credential, check their own status, and request what they need

## Install

```bash theme={null}
curl -fsSL onecli.sh/cli/install | sh
```

Or download from [GitHub Releases](https://github.com/onecli/onecli-cli/releases), or build from source:

```bash theme={null}
go install github.com/onecli/onecli-cli/cmd/onecli@latest
```

## Quick start

```bash theme={null}
onecli auth login --api-key oc_...
onecli agents list
onecli secrets list
onecli agents create --name "My Agent" --identifier my-agent
```

## Commands

### Run

Wrap a coding agent process with OneCLI gateway access. See the [Coding Agents guide](/docs/guides/coding-agents) for the full walkthrough.

```bash theme={null}
onecli run -- claude                               # Launch Claude Code with gateway access
onecli run --agent my-agent -- cursor              # Use a specific agent identity
onecli run --dry-run -- claude                     # Preview config without launching
onecli run --gateway localhost:10255 -- claude     # Override gateway address
onecli run --no-ca -- claude                       # Skip CA cert injection
```

The agent identity resolves as `--agent` flag, then `ONECLI_AGENT`, then `onecli config set agent`, then the project's default agent.

### Projects

Manage projects (isolated workspaces for agents, secrets, and connections). See the [Projects guide](/docs/guides/projects) for details.

```bash theme={null}
onecli projects list                                   # List all projects
onecli projects get --id X                             # Get a single project
onecli projects create --name "payments-app"           # Create a new project
onecli projects update --id X --name "new-name"        # Rename a project
onecli projects delete --id X --confirm X              # Delete a project (repeat the ID to confirm)
```

Deleting a project permanently removes all its agents, secrets, connections, grants, and audit logs. `--confirm` must repeat the project ID to prevent accidental deletion. You cannot delete your last remaining project.

Most commands accept `--project` (or `-p`) to target a specific project. Without it, the active project from `onecli config set project` is used, or the default project.

### Agents

Manage agent identities. An agent belongs to a project and uses only the credentials you grant it (see [Agent access](/docs/guides/agent-access)).

```bash theme={null}
onecli agents list                                     # List agents in active project
onecli agents list --with-grants                       # Include each agent's grants summary
onecli agents list --project payments-app              # List agents in a specific project
onecli agents get-default                              # Get the default agent
onecli agents set-default --id X                       # Mark an agent as the project default
onecli agents create --name X --identifier Y           # Create a new agent (starts with no grants)
onecli agents delete --id X                            # Delete an agent
onecli agents rename --id X --name Y                   # Rename an agent
onecli agents regenerate-token --id X                  # Regenerate access token
onecli agents credentials --id X                       # Effective view: what the agent can use, and what each credential can do
```

The retired assignment commands (`agents secrets`, `set-secrets`, `set-secret-mode`, `agents connections get|set`) still ship for pre-grants self-hosted servers; updated servers answer `410 Gone` pointing at grants.

### Grants

Attach credentials to agents — the write path for per-agent access. A bare attach grants full access; `--allow`/`--ask` narrow a connection to named tools (ids from `apps permission-definition`). Writes take effect immediately.

```bash theme={null}
onecli agents grants list --id X                       # The agent's grants (connections + secrets)
onecli agents grants attach-connection --id X \
  --connection-id Y                                    # Full access to the connection
onecli agents grants attach-connection --id X \
  --connection-id Y \
  --allow search_messages,get_message \
  --ask send_email                                     # Per-tool: allow freely / require approval; unlisted = blocked
onecli agents grants attach-connection --id X \
  --connection-id Y \
  --json '{"access":"custom","allow":["read_all"],"ask":[]}'   # Raw grant body (XOR with --allow/--ask)
onecli agents grants detach-connection --id X --connection-id Y
onecli agents grants attach-secret --id X --secret-id Z        # Secrets are all-or-nothing
onecli agents grants detach-secret --id X --secret-id Z
onecli apps connections grants --id Y                  # Reverse view: which agents hold a grant for a connection
```

A custom grant must name at least one tool across `--allow` and `--ask` (all-blocked = detach instead), and a tool can't be in both lists — the server rejects either with `422`. `--ask` requires a plan with manual approvals. Grants are the **intent**; `agents credentials` and `apps connections agent-access` show the **effective** result after organization rules apply.

### Secrets

Manage credentials stored in the vault.

```bash theme={null}
onecli secrets list                                    # List secrets in active project
onecli secrets list --project payments-app             # List secrets in a specific project
onecli secrets create --name "Anthropic" --type anthropic \
  --value "$ANTHROPIC_API_KEY" \
  --host-pattern api.anthropic.com                     # Anthropic API key
onecli secrets create --name "OpenAI" --type openai \
  --value "$OPENAI_API_KEY" \
  --host-pattern api.openai.com                        # OpenAI API key
onecli secrets create --name X --type generic \
  --value Y --host-pattern api.example.com \
  --header-name Authorization \
  --value-format "Bearer {value}"                      # Header injection
onecli secrets create --name X --type generic \
  --value Y --host-pattern api.example.com \
  --param-name key                                     # Query param injection
onecli secrets create --name "Codex" --type openai \
  --file ~/.codex/auth.json \
  --host-pattern api.openai.com                        # Read the value from a file
onecli secrets update --id X --value Y                 # Update a secret
onecli secrets delete --id X                           # Delete a secret
```

The `--type` flag accepts `anthropic`, `openai`, or `generic`. For `anthropic` and `openai` types, the gateway handles header injection automatically. For `generic` secrets, you must specify injection flags. `--value` and `--file` are mutually exclusive; use `--file` for multi-line values like Codex's `auth.json`.

When creating or updating a generic secret, the available injection flags are:

| Flag             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `--header-name`  | Inject as an HTTP header (e.g. `Authorization`)                   |
| `--value-format` | Header value template (default: `{value}`, e.g. `Bearer {value}`) |
| `--param-name`   | Inject as a URL query parameter (e.g. `key`)                      |
| `--param-format` | Param value template (default: `{value}`)                         |

`--header-name` and `--param-name` are mutually exclusive: each secret injects as either a header or a query parameter, not both.

### Apps

Manage OAuth app connections so the OneCLI gateway can handle token exchange on behalf of agents. After configuring an app, use `apps list` to get the [credential stubs docs](/docs/guides/credential-stubs/gmail) URL your MCP server needs to start.

```bash theme={null}
onecli apps list                                       # List all apps with config and connection status
onecli apps get --provider gmail                       # Get a single app with setup guidance
onecli apps connections list                           # List app connections
onecli apps connections list --provider github         # Filter by provider
onecli apps connections rename --id X --label "Work"   # Rename a connection
onecli apps connections grants --id X                  # Which agents hold a grant (intent)
onecli apps connections agent-access --id X            # Which agents can reach it, per tool (effective, read-only)
onecli apps disconnect --provider gmail                # Disconnect (errors with the ID list if multiple connections; pass --connection-id)
onecli apps disconnect --provider gmail \
  --connection-id X                                    # Disconnect a specific connection
onecli apps configure --provider gmail --client-id X \
  --client-secret Y                                    # Save OAuth credentials (BYOC)
onecli apps configure --provider github-app \
  --field appId=123 --field appSlug=my-app \
  --field privateKey="$(cat key.pem)"                  # Arbitrary per-app fields
onecli apps remove --provider gmail                    # Remove BYOC credentials
onecli apps config get --provider gmail                # BYOC config status (settings, enabled)
onecli apps config toggle --provider gmail --enabled=false
onecli apps configured                                 # Providers with an enabled config
onecli apps env-defaults                               # Providers with platform default credentials
onecli apps permission-definition --provider github    # Tool catalog for permission rules
```

#### App blocklists

Some apps ship predefined blocklist hosts (e.g. public registries) you can activate; you can also add custom deny rules per app:

```bash theme={null}
onecli apps blocklist list --provider github           # Blocklist state (predefined + custom)
onecli apps blocklist activate --provider github --host-id X
onecli apps blocklist add --provider github --name X --host-pattern uploads.github.com
onecli apps blocklist toggle --provider github --rule-id X --enabled=false
onecli apps blocklist remove --provider github --rule-id X
```

### Policy

Policy rules are authored at the **organization** level — see [Org Policy](#org-policy) below and the [Policy rules guide](/docs/guides/rules). At project scope, rules are compiled from [grants](#grants); the one project-scope policy read is the effective reflection:

```bash theme={null}
onecli policy effective-permissions --provider gmail   # Per-tool verdicts for an app (read-only)
```

The project-scope authoring family (`onecli policy rules ...`, `policy default`, `policy publish`, `policy status`) still ships for pre-grants self-hosted servers; updated servers answer `410 Gone` pointing at grants (project access) and `onecli org policy` (organization rules). The even older `onecli rules` family serves servers that predate the policy engine.

### Organization

Organization-scoped commands manage resources that apply across all projects. These mirror the project-level `secrets` and `apps` commands — and carry the full `policy` rule console — at the org level, with no `--project` flag needed. They require the admin or owner role.

#### Org Secrets

```bash theme={null}
onecli org secrets list                                # List all org-scoped secrets
onecli org secrets create --name "Anthropic" --type anthropic \
  --value "$ANTHROPIC_API_KEY" \
  --host-pattern api.anthropic.com                     # Create org secret
onecli org secrets update --id X --value Y             # Update an org secret
onecli org secrets delete --id X                       # Delete an org secret
```

Org secrets use the same `--type`, injection flags (`--header-name`, `--param-name`, etc.), and `--json` override as project-level secrets.

#### Org Policy

```bash theme={null}
onecli org policy rules list [--status published]      # Org rules (draft or enforced)
onecli org policy rules create --name X --action block \
  --targets '[{"kind":"network","hostPattern":"api.github.com"}]'
onecli org policy rules update --id X --enabled=false  # Update a DRAFT org rule
onecli org policy rules delete --id X                  # Delete a DRAFT org rule
onecli org policy rules reorder --ordered-ids '[...]'  # Full id permutation
onecli org policy default get|set --action allow|block # The org Default Rule
onecli org policy publish                              # Publish the org draft
onecli org policy status                               # Staged diff + last publish
```

Org policy rules take `user`/`group` identities via `--identities` (never a specific agent). Requires an org API key with the admin role. The older `onecli org rules` family serves self-hosted servers that predate the policy engine (updated servers answer `410 Gone`).

#### Org Connections

```bash theme={null}
onecli org connections list                            # List all org connections
onecli org connections list --provider github          # Filter by provider
onecli org connections rename --id X --label "Shared"  # Rename a connection
onecli org connections delete --id X                   # Delete a connection
```

#### Org Apps

Manage BYOC (bring your own credentials) app configuration at the org level.

```bash theme={null}
onecli org apps configured                             # List providers with org credentials
onecli org apps get --provider gmail                   # Get config status for a provider
onecli org apps configure --provider gmail \
  --client-id X --client-secret Y                      # Save BYOC credentials
onecli org apps remove --provider gmail                # Remove BYOC credentials
onecli org apps toggle --provider gmail --enabled=true # Enable or disable an app
onecli org apps blocklist list --provider github       # Org-level blocklist (same subcommands as
                                                       # 'onecli apps blocklist')
```

The organization's allow/deny posture is its Default Rule: `onecli org policy default get|set`. (The retired `onecli org settings` family answers `410 Gone` on updated servers.)

### Vaults and counts

```bash theme={null}
onecli vaults list                                     # External vault connections (e.g. 1Password)
onecli counts                                          # Project resource totals (agents, apps, llms, secrets)
```

### Migrate

Move a self-hosted instance's data (secrets and agents) to OneCLI Cloud. Policy rules and grants don't travel — they're counted and reported as skipped so you can re-create them on the destination. Run against the self-hosted server; secrets are decrypted server-side and sent directly to Cloud over HTTPS.

```bash theme={null}
onecli migrate --cloud-key oc_your_cloud_key           # Migrate to OneCLI Cloud
onecli migrate --cloud-key oc_... --dry-run            # Preview without executing
```

### Auth

Authenticate with the OneCLI server.

```bash theme={null}
onecli auth login [--api-key oc_...]                   # Store API key
onecli auth logout                                     # Remove stored API key
onecli auth status                                     # Check current auth state
onecli auth update --name "New Name"                   # Update your display name
onecli auth api-key                                    # Show your current API key
onecli auth regenerate-api-key                         # Regenerate your API key
```

Authentication is only required when the server enforces it. In local/single-user mode, commands work without logging in.

### Config

Read and write configuration values.

```bash theme={null}
onecli config get <key>                                # Read config value
onecli config set <key> <value>                        # Write config value
onecli config set project payments-app                 # Set active project for all commands
onecli config set agent writer-bot                     # Pin this machine to an agent for `onecli run`
```

| Key        | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `api-host` | API base URL (default: `https://api.onecli.sh`)                    |
| `project`  | Active project slug used when no `--project` flag is given         |
| `agent`    | Agent identifier `onecli run` uses when no `--agent` flag is given |

The `agent` key requires CLI 2.10 or later.

## Output

All output is JSON. Use `--fields` to select specific fields, or `--quiet` to extract a single value:

```bash theme={null}
onecli agents list --quiet id
# "agent_abc123"
# "agent_def456"

onecli agents list --fields id,name,identifier
# [{"id": "agent_abc123", "name": "My Agent", "identifier": "my-agent"}, ...]
```

Agents and scripts can parse responses directly without `jq` or string manipulation.

List commands return at most 20 results by default; pass `--max` to raise (or lower) the cap.

## Environment variables

| Variable          | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| `ONECLI_API_KEY`  | API key (overrides stored key)                                          |
| `ONECLI_API_HOST` | API base URL (default: `https://api.onecli.sh`)                         |
| `ONECLI_PROJECT`  | Active project slug (overrides `onecli config set project`)             |
| `ONECLI_AGENT`    | Agent identifier for `onecli run` (overrides `onecli config set agent`) |
| `ONECLI_ENV`      | `dev` or `production`                                                   |

## Example: agent orchestrator bootstrapping

A common pattern is an orchestrator that provisions agents before they start working:

```bash theme={null}
# Create a project for this workflow
onecli projects create --name "email-workflow"
onecli config set project email-workflow

# Add the secret the agent needs
SECRET=$(onecli secrets create --name "Gmail" --type generic \
  --value "$GMAIL_KEY" --host-pattern "*.googleapis.com" \
  --header-name Authorization --value-format "Bearer {value}" | jq -r .id)

# Create the agent (it starts with no grants)
AGENT=$(onecli agents create --name "email-agent" --identifier email-agent | jq -r .id)

# Grant it the secret — without this, the gateway injects nothing
onecli agents grants attach-secret --id "$AGENT" --secret-id "$SECRET"

# Get its access token
TOKEN=$(onecli agents regenerate-token --id "$AGENT" | jq -r .accessToken)

# Pass the token to the agent container
docker run -e HTTPS_PROXY=http://onecli:10255 \
  -e PROXY_AUTH="$TOKEN" \
  my-email-agent:latest
```

The agent uses exactly the credentials granted to it, enforced by the gateway under any organization [rules](/docs/guides/rules) you've configured. No hardcoded keys, no broad access.
