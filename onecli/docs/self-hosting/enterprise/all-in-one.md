> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy Enterprise: all-in-one image

> Run the fully featured OneCLI Enterprise edition with Docker Compose: one container for the dashboard, API, and gateway, plus PostgreSQL.

This guide deploys the Enterprise edition's all-in-one image with Docker Compose: the `onecli/slim` container (dashboard, API, and gateway in one) plus a PostgreSQL database. It takes about ten minutes. For the free, open source edition, see [Deploy Community Edition](/docs/self-hosting/community).

This setup is ideal for evaluation and small-team use. Before going to production, work through the [production checklist](#production-checklist) below.

## Prerequisites

* **Access to the `onecli/slim` image.** The image is private; pull access is granted with your Enterprise agreement. If you don't have access yet, [contact us](https://onecli.cal.com/jonathan/30min).
* A Docker Hub login with that access active on the deploying machine: `docker login`
* Docker Engine with the Compose plugin (`docker compose version` should work)
* Outbound network access to pull images from Docker Hub
* PostgreSQL: the compose file below includes one. To use an external database instead, see [Configuration](/docs/self-hosting/configuration#database)

## Deploy

<Steps>
  <Step title="Create the compose file">
    Create a directory for your deployment and save this as `docker-compose.yml`:

    ```yaml docker-compose.yml theme={null}
    services:
      postgres:
        image: postgres:16-alpine
        restart: unless-stopped
        environment:
          POSTGRES_USER: onecli
          POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
          POSTGRES_DB: onecli
        volumes:
          - postgres-data:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U onecli"]
          interval: 5s
          timeout: 5s
          retries: 10

      onecli:
        image: onecli/slim:latest
        restart: unless-stopped
        depends_on:
          postgres:
            condition: service_healthy
        ports:
          - "127.0.0.1:10254:10254" # dashboard + API
          - "127.0.0.1:10255:10255" # gateway proxy
        environment:
          DATABASE_URL: postgresql://onecli:${POSTGRES_PASSWORD}@postgres:5432/onecli
          APP_URL: http://localhost:10254
          ONECLI_ORG_API_KEY: ${ONECLI_ORG_API_KEY}
        volumes:
          - onecli-data:/app/data

    volumes:
      postgres-data:
      onecli-data:
    ```

    <Note>
      The example pins nothing: `onecli/slim:latest` tracks the latest stable release. For production, pin a specific tag; every release is also published under an immutable short commit SHA. The tag list is visible on Docker Hub once your account has image access.
    </Note>

    <Warning>
      Keep the `onecli-data` volume. It stores the auto-generated `SECRET_ENCRYPTION_KEY` that encrypts your secret store. If the volume is lost and you didn't set the key yourself, stored secrets become unrecoverable.
    </Warning>
  </Step>

  <Step title="Configure secrets">
    Create a `.env` file next to the compose file:

    ```bash theme={null}
    cat > .env <<EOF
    POSTGRES_PASSWORD=$(openssl rand -hex 24)
    ONECLI_ORG_API_KEY=oc_org_$(openssl rand -hex 32)
    EOF
    chmod 600 .env
    ```

    `ONECLI_ORG_API_KEY` is your instance's organization API key, the credential you'll use to provision projects and agents over the API. The format is enforced: `oc_org_` followed by 64 lowercase hex characters.

    <Note>
      If you omit `ONECLI_ORG_API_KEY`, the instance generates one on first start and prints it to the container logs exactly once. To load the key from a mounted secret instead of the environment, set `ONECLI_ORG_API_KEY_FILE` to the file path. See [Configuration](/docs/self-hosting/configuration).
    </Note>
  </Step>

  <Step title="Start the stack">
    ```bash theme={null}
    docker compose up -d
    ```

    The container runs database migrations automatically on startup, then provisions your organization and seeds the organization API key. The instance is API-ready before anyone opens the dashboard.
  </Step>

  <Step title="Verify the deployment">
    Check both health endpoints:

    ```bash theme={null}
    curl http://localhost:10254/v1/health
    ```

    ```json theme={null}
    { "status": "ok", "version": "1.39.0", "timestamp": "2026-07-02T00:21:35.733Z" }
    ```

    ```bash theme={null}
    curl http://localhost:10255/healthz
    ```

    ```json theme={null}
    { "status": "ok", "version": "0.1.0" }
    ```

    Then open [http://localhost:10254](http://localhost:10254). You'll land on the app-connection screen.

    <Info>
      By default the instance runs in single-user mode: there is no login screen, and anyone who can reach port `10254` has admin access. The compose file binds to `127.0.0.1` for that reason. Keep the dashboard on a private network, or enable [multi-user mode](/docs/self-hosting/configuration#authentication) with Google OAuth.
    </Info>
  </Step>

  <Step title="Next steps">
    * [Connect the CLI and agents](/docs/self-hosting/connect-agents), including headless provisioning with your organization API key
    * [Connect apps](/docs/integrations/app-connections) with your own OAuth credentials
    * Review the [configuration reference](/docs/self-hosting/configuration)
  </Step>
</Steps>

## Upgrading

Releases update the `latest` tag. To upgrade:

```bash theme={null}
docker compose pull
docker compose up -d
```

Database migrations run automatically when the new container starts.

<Warning>
  Back up your PostgreSQL database before upgrading: `docker compose exec postgres pg_dump -U onecli onecli > backup.sql`.
</Warning>

<Accordion title="Upgrading across the agent access change">
  Releases from mid-2026 replace secret modes and per-agent assignment lists with [agent grants](/docs/guides/agent-access). The upgrade converts your existing setup automatically on first boot — every agent keeps exactly the credentials it had, expressed as grants — and the retired endpoints answer `410 Gone` with a pointer to their replacement. Organization rules and the `/v1/org/policy` console are unaffected.

  Two things to know:

  * **Upgrade within the conversion window.** The automatic converter ships for six months of releases after the change. If your instance is older than that, upgrade in two hops: first to any release inside the window (the conversion runs), then onward to current.
  * **Scripts using the retired surface need updating.** Anything calling `PATCH /agents/{id}/secret-mode`, `agents set-secrets`, or the project `policy rules` writes should move to the grants endpoints — see the [retirement inventory](/docs/api-reference/errors#retired-endpoints-410).
</Accordion>

## Production checklist

* **Terminate TLS in front of the instance.** Run a reverse proxy (nginx, Caddy, or your load balancer) with HTTPS, and set `APP_URL` to the public URL. It's also the base for OAuth callback URLs when you [connect apps](/docs/integrations/app-connections).
* **Pin the image tag** instead of tracking `latest`.
* **Use managed PostgreSQL** where available, and schedule backups of both the database and the `onecli-data` volume.
* **Set `SECRET_ENCRYPTION_KEY` explicitly** (for example `openssl rand -hex 32`) and store it in your secrets manager, rather than relying on the auto-generated key in the volume.
* **Restrict network exposure.** In single-user mode, treat port `10254` as an admin interface. Port `10255` is the gateway your agents connect to; expose it only where agents run.

## Troubleshooting

<AccordionGroup>
  <Accordion title="The container exits with a database migration error">
    If the very first start fails with `Can't reach database server`, PostgreSQL wasn't ready when migrations ran. The compose file above guards against this with a healthcheck and `depends_on: condition: service_healthy`. Make sure yours has both.

    If a failed first boot left migrations in a broken state on an instance with no data yet, reset and start clean:

    ```bash theme={null}
    docker compose down -v
    docker compose up -d
    ```

    <Warning>
      `down -v` deletes the volumes. Only do this on an instance with no data you need.
    </Warning>
  </Accordion>

  <Accordion title="The logs show &#x22;ONECLI_ORG_API_KEY is malformed&#x22;">
    The key must be `oc_org_` followed by exactly 64 lowercase hex characters. Regenerate one:

    ```bash theme={null}
    echo "oc_org_$(openssl rand -hex 32)"
    ```

    The instance refuses to substitute a generated key for a malformed one, so a typo fails loudly instead of silently issuing a key you don't know.
  </Accordion>

  <Accordion title="Pulling fails with &#x22;pull access denied for onecli/slim&#x22;">
    The image is private. Two things need to be true: your Docker Hub account has been granted access as part of your Enterprise agreement, and the deploying machine is logged in with that account (`docker login`). If you don't have access yet, [contact us](https://onecli.cal.com/jonathan/30min).
  </Accordion>

  <Accordion title="Port 10254 or 10255 is already in use">
    Change the host side of the port mappings in `docker-compose.yml` (for example `127.0.0.1:20254:10254`) and use that port in your browser and `APP_URL`.
  </Accordion>

  <Accordion title="Where are the logs?">
    ```bash theme={null}
    docker compose logs -f onecli
    ```

    The gateway logs plain lines (look for `starting onecli-gateway` and `gateway ready`); the dashboard and API log structured JSON. Request activity from agents is stored in your PostgreSQL and shown in the dashboard's activity view.
  </Accordion>
</AccordionGroup>
