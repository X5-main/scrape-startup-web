> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy Community Edition

> Run the free, open source OneCLI stack with Docker Compose: dashboard, API, gateway, runner, and bundled PostgreSQL.

The Community edition is free and open source ([Apache-2.0](https://github.com/onecli/onecli/blob/main/LICENSE), except the `ee/` directories). It ships as per-service images under `ghcr.io/onecli/` with a Docker Compose file that bundles PostgreSQL.

## Quick start

No Node toolchain handy? The install script writes its configuration to `~/.onecli/.env` and brings the stack up:

```bash theme={null}
curl -fsSL https://onecli.sh/install | sh
```

Or from a clone, the interactive setup:

```bash theme={null}
git clone https://github.com/onecli/onecli.git && cd onecli
pnpm install
pnpm run setup
```

## Raw Docker Compose

Put the three required secrets in `docker/.env` — **beside the compose file**, which is where compose reads them — then bring it up:

```bash theme={null}
git clone https://github.com/onecli/onecli.git && cd onecli/docker
cat > .env <<EOF
SECRET_ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64)
GATEWAY_INTERNAL_SECRET=$(head -c 32 /dev/urandom | base64)
BETTER_AUTH_SECRET=$(head -c 32 /dev/urandom | base64)
COMPOSE_PROFILES=runner
EOF
chmod 600 .env
docker compose up -d --wait
```

Open [http://localhost:10254](http://localhost:10254), create your account, then create an agent, store a model key, grant it to the agent, and start talking. Keep `SECRET_ENCRYPTION_KEY` safe — it encrypts your stored secrets.

## The first account

The first visit asks you to **create an account** — email and password. That account owns the instance; after it exists, joining needs an invitation.

<Warning>
  **Create it right away.** Until you do, the instance has no owner, and on a reachable host whoever gets there first becomes one.
</Warning>

Setting `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` adds a "Continue with Google" button beside the password form (redirect URI: `<API_URL>/auth/callback/google`).

**A hosted agent needs a granted model key.** The order matters: store the key, **grant it to the agent**, then chat. A sandbox will not start without one — the agent answers in the thread telling you so.

## Pin a version

Every service image defaults to `:latest`. For anything you intend to keep running, pin one release in the same `.env`:

```bash theme={null}
ONECLI_VERSION=v2.0.0
```

This pins all services at once, and the agent sandbox image follows it (`ghcr.io/onecli/onecli-agent:$ONECLI_VERSION`) unless you point `RUNNER_AGENT_IMAGE` somewhere else. Upgrades are then a deliberate edit + `docker compose up -d`, never a surprise pull. Releases are listed on [GitHub](https://github.com/onecli/onecli/releases).

## Upgrading

On every `up`, a one-shot `migrations` service applies any pending database migrations before the API starts (view its output with `docker compose logs migrations`). If a migration fails, the stack refuses to start rather than serving against a half-migrated schema — fix the cause, then `up -d` again.

When upgrading an install created by the install script, re-run the installer rather than a bare `docker compose pull`, so the compose file itself stays current alongside the images.

<Accordion title="Upgrading from a release without login">
  Your existing organization, workspaces, agents and API keys move to the account you create — nothing to migrate by hand, and the same "register immediately" advice applies. If your `.env` still sets `NEXTAUTH_SECRET`, rename it to `BETTER_AUTH_SECRET`; everyone signs in again once.
</Accordion>

## Sizing for hosted agents

Each agent runs in its own sandbox container on the runner host. Memory per sandbox and the held-awake ceiling are covered in the [runner README](https://github.com/onecli/onecli/blob/main/apps/runner/README.md). The runner is outbound-only: it polls the API server and holds no inbound ports, so it works behind NAT with no ingress.

## Next steps

* Review the [configuration reference](/docs/self-hosting/configuration)
* [Connect external agents](/docs/self-hosting/connect-agents)
* [Grant](/docs/guides/agent-access) each agent the credentials it needs
