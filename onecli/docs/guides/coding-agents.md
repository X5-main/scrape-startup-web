> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Set Up Coding Agents: Claude Code, Cursor & Codex

> Configure Claude Code, Cursor, Codex, and other coding agents to route through the OneCLI gateway. One command to set up.

`onecli run` wraps a coding agent process with OneCLI gateway access. Your agent's HTTPS traffic routes through the gateway, which injects stored credentials automatically. The agent never sees raw API keys or OAuth tokens.

## Supported agents

| Agent       | Command                              |
| ----------- | ------------------------------------ |
| Claude Code | `onecli run -- claude`               |
| Cursor      | `onecli run -- cursor`               |
| Codex       | `onecli run -- codex`                |
| Hermes      | `onecli run -- hermes`               |
| OpenCode    | `onecli run -- opencode`             |
| OpenClaw    | `onecli run -- openclaw gateway run` |

Any command works after `--`. The agents listed above also get an auto-installed skill file that teaches them how to use the gateway.

## Setup

<Steps>
  <Step title="Start OneCLI">
    ```bash theme={null}
    docker run --pull always -p 10254:10254 -p 10255:10255 -v onecli-data:/app/data ghcr.io/onecli/onecli
    ```
  </Step>

  <Step title="Install the CLI">
    ```bash theme={null}
    curl -fsSL onecli.sh/cli/install | sh
    onecli auth login --api-key oc_...
    ```

    Get your API key from the dashboard at [localhost:10254](http://localhost:10254).
  </Step>

  <Step title="Launch your agent">
    ```bash theme={null}
    onecli run -- claude
    ```

    You'll see `onecli: gateway connected. Starting claude...` and your agent starts with the gateway configured.
  </Step>
</Steps>

## What `onecli run` does

When you run `onecli run -- claude`, the CLI:

1. Fetches gateway configuration from the OneCLI server
2. Writes a CA bundle (your system CAs plus the gateway CA) to `~/.onecli/ca-bundle.pem`
3. Installs the OneCLI gateway skill into the agent's skill directory (for Claude Code, `~/.claude/skills/onecli-gateway/SKILL.md`), fetched from the server with a built-in fallback
4. Injects `HTTPS_PROXY`, the CA trust variables (`SSL_CERT_FILE`, `NODE_EXTRA_CA_CERTS`, and friends), and `ONECLI_GATEWAY=true` into the child process
5. Hands over terminal control to the agent

The skill file is refreshed on every launch. Standard HTTP clients (curl, fetch, requests, axios, Go net/http, git) pick up the proxy settings automatically.

## Choosing the agent identity

Each `onecli run` session acts as one agent from your project, which decides the credentials the gateway injects and the rules that apply. The identity resolves in this order:

1. `--agent <identifier>` flag
2. `ONECLI_AGENT` environment variable
3. `onecli config set agent <identifier>` (requires CLI 2.10+)
4. The project's default agent

Pin a machine once and forget it:

```bash theme={null}
onecli config set agent writer-bot
onecli run -- claude                        # runs as writer-bot from now on
onecli run --agent ci-runner -- codex       # one-off override, flag always wins
```

The pin is local to the machine. It doesn't change the project's default agent, so your teammates' plain `onecli run` is unaffected. The dashboard's **Install** page generates a setup command with the pin included when you pick a non-default agent.

## How agents connect to services

The skill file teaches supported agents a simple workflow:

1. **Make the request directly.** The agent calls the real API URL (e.g. `https://gmail.googleapis.com/...`). No auth headers needed. If credentials are configured, the gateway injects them and the request succeeds.

2. **If it fails, help the user connect.** The gateway returns a structured error with a `connect_url`, and the agent presents that link to the user.

3. **Poll and retry.** The agent polls the connection status and retries automatically once the user connects the service. No manual "try now" needed.

For OAuth apps (Gmail, GitHub, Google Drive, and 13 others), the user connects with one click in the dashboard. For API key services (Stripe, custom APIs), the user adds a secret via the dashboard or `onecli secrets create`.

## Flags

| Flag                    | Description                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--agent <identifier>`  | Run as a specific agent (default: `ONECLI_AGENT` env, then `onecli config set agent`, then the project's default agent)    |
| `--gateway <host:port>` | Override the gateway address (default: derived from API host)                                                              |
| `--no-ca`               | Skip CA certificate write and trust env injection                                                                          |
| `--enforce`             | OS-enforced governance: route the agent's sandboxed egress through the gateway so it cannot be bypassed (Claude Code only) |
| `--dry-run`             | Print the resolved config as JSON without launching the agent                                                              |

### Dry run

Use `--dry-run` to inspect what `onecli run` would do without side effects:

```bash theme={null}
onecli run --dry-run -- claude
```

This prints the resolved binary path, injected environment variable keys, and CA cert path as JSON.

## Compared to the SDK path

`onecli run` is for coding agents running directly on your machine. If your agents run in Docker containers (e.g. via [NanoClaw](/docs/guides/nanoclaw)), use the [Node.js SDK](/docs/sdks/node) instead. Both paths use the same gateway, the same secrets, and the same policy rules.

|               | `onecli run`                   | SDK / Docker                 |
| ------------- | ------------------------------ | ---------------------------- |
| Agent runs on | Your machine (local process)   | Docker container             |
| Setup         | `onecli run -- claude`         | `applyContainerConfig(args)` |
| Skill files   | Auto-installed                 | Not applicable               |
| Use case      | Development with coding agents | Production orchestration     |
