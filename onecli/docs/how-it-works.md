> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# How OneCLI Works: Sandboxed Agents, Gateway & Policy

> OneCLI runs each agent in its own sandbox on your infrastructure. A Rust gateway intercepts every outbound request, enforces policy, and injects credentials the agents never see.

OneCLI runs an agent per person. Each agent lives in its own sandbox, and the only way out is the gateway, which checks every request against your policy and injects the credentials granted to that agent. The control plane, the runner, and the gateway are separate services, so agents can run on a laptop, a homelab, or a VPC behind NAT with no ingress and no tunnel.

## Architecture overview

<img src="https://mintcdn.com/chartdbinc/XbxhqUjQqP4e5S4u/images/onecli-architecture-light.svg?fit=max&auto=format&n=XbxhqUjQqP4e5S4u&q=85&s=b0247829ecc20f411731099deab3bcad" alt="OneCLI architecture" className="block dark:hidden" width="960" height="660" data-path="images/onecli-architecture-light.svg" />

<img src="https://mintcdn.com/chartdbinc/XbxhqUjQqP4e5S4u/images/onecli-architecture-dark.svg?fit=max&auto=format&n=XbxhqUjQqP4e5S4u&q=85&s=3729b4bb29c3cedbdbea1f415b8e5ac2" alt="OneCLI architecture" className="hidden dark:block" width="960" height="660" data-path="images/onecli-architecture-dark.svg" />

* **Web Dashboard**: Next.js app. Create agents, chat with them, edit their memory and skills, manage connections, secrets, and grants.
* **API Server**: the control plane. Owns the database, the conversation plane, and the work queue the runner polls.
* **Rust Gateway**: intercepts outbound requests (HTTPS included, via MITM) and injects credentials. Agents authenticate with access tokens via `Proxy-Authorization` headers.
* **Runner**: starts, parks, and reaps agent sandboxes. Outbound-only, and never touches the database.
* **Sandbox Supervisor**: runs inside each sandbox, speaking a vendor-neutral harness interface so the agent runtime is swappable.
* **Channel Adapter**: the Slack daemon, posting answers, mirrors, and approval cards.
* **Secret Store**: AES-256-GCM at rest, decrypted only at request time, matched by host and path pattern, injected as headers or query parameters.

## The agent lifecycle

1. You create an agent and grant it a model key plus the connections it needs.
2. A message (from the dashboard, Slack, or a schedule) queues a turn on the API server's work queue.
3. The runner, polling outbound-only, picks up the turn and boots or wakes the agent's sandbox. The sandbox has a durable workspace volume that survives park and wake.
4. The agent works: shell, filesystem, and HTTP, with every outbound request forced through the gateway.
5. Actions matching an approval rule pause and render an Approve/Deny card in the chat (dashboard or Slack). The decision is deterministic: nothing executes until a human decides, and expiry denies.
6. The answer lands back in the conversation. What the agent learned persists in its platform-kept memory, and idle sandboxes are parked to free resources.

## The gateway

Every outbound request from a sandbox (and from any [connected external agent](/docs/guides/coding-agents)) passes through the Rust gateway:

1. The agent makes a normal HTTP request (e.g., `GET https://www.googleapis.com/calendar/v3/events`)
2. The gateway evaluates policy: organization [rules](/docs/guides/rules) plus the agent's own [grants](/docs/guides/agent-access). Blocked or rate-limited requests get a 403 or 429 immediately
3. Approval-gated requests pause for a human decision
4. If allowed, the gateway matches the target host and path against the credentials **granted to that agent**, decrypts the match, and injects it as a header (e.g. `Authorization: Bearer ...`) or query parameter. A credential the agent has no grant for is never considered
5. The request is forwarded with credentials attached, and the response passes back unchanged

Policy is evaluated before credential injection, so a blocked request never decrypts or touches your secrets.

## Policy engine

Rules are evaluated top-down, first match wins. Each rule pairs identities (which agents or people) with targets (an app and its tools, a connection, a secret, or a network pattern) and applies an action:

* **Block**: deny the request entirely (403)
* **Allow**: permit it, optionally requiring human approval, or rate-limited to N requests per window (429 beyond the cap)

Two layers feed the engine: **organization rules** (guardrails no workspace can loosen) and **agent grants** (per-agent access, compiled into rules automatically when you grant a connection). A request is allowed only when both layers permit it.

## Channels

Slack is the first provider of the channels layer. An agent can join via the **shared OneCLI app** (one Slack app for the whole deployment, instant attach, each agent answering as its own persona) or as a **dedicated app per agent** (its own bot user and DM entry). A user's DM with an agent is their web thread: one conversation, two doors. Gateway approvals show up as Slack cards with Approve/Deny buttons.

## Connecting your own agents

The same gateway serves agents you already run:

| Path                                      | How it works                                               | Best for                                                   |
| ----------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| [**`onecli run`**](/docs/guides/coding-agents) | CLI wraps a local process with proxy env vars and CA certs | Coding agents on your machine (Claude Code, Cursor, Codex) |
| [**SDK / Docker**](/docs/guides/nanoclaw)      | SDK injects proxy config into Docker container args        | Container-based orchestrators (NanoClaw, custom)           |

## Stack

| Component          | Technology            |
| ------------------ | --------------------- |
| Web dashboard      | Next.js (port 10254)  |
| API server         | Node.js (Hono)        |
| Gateway            | Rust (port 10255)     |
| Runner + sandboxes | Docker, outbound-only |
| Database           | PostgreSQL            |
| Secret storage     | AES-256-GCM encrypted |

## Project structure

```
apps/
  web/                 # Next.js dashboard (port 10254)
  api-server/          # Control plane: conversations, work queue
  gateway/             # Rust gateway (credential injection, port 10255)
  runner/              # Starts, parks and reaps agent sandboxes
  sandbox-supervisor/  # In-sandbox harness interface
  channel-adapter/     # Slack daemon
packages/
  api/                 # API routes and services
  db/                  # Prisma ORM + migrations
  ui/                  # Shared UI components
docker/
  docker-compose.yml   # The self-host stack
```
