> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Self-hosted OneCLI

> Run OneCLI in your own infrastructure: the free Community edition or the fully featured Enterprise edition, each a single Docker image.

Self-hosted OneCLI runs the stack (dashboard, REST API, and the credential-injecting gateway) as a single Docker container in your own infrastructure, backed by PostgreSQL.

There are two self-hosted editions:

* **Community**: free and open source. The full dashboard with community integrations, for individuals and small teams.
* **Enterprise**: the commercial edition. Every feature enabled, including premium app integrations, per-tool manual approvals, and the organization policy console, with an organization API key for headless provisioning. There is no license key to manage.

The Enterprise edition ships in more than one deployment shape. Today that's the **all-in-one image** (`onecli/slim`): the entire stack in your infrastructure. A **connector deployment** is coming, pairing the OneCLI Cloud dashboard and API with a gateway and database that run inside your network, so credentials never leave it.

<Note>
  The Enterprise image is private. Access is granted as part of your Enterprise agreement — [contact us](https://onecli.cal.com/jonathan/30min) to get started.
</Note>

## Choose an edition

|                                                 | Cloud                  | Community (self-hosted)                    | Enterprise (self-hosted)        |
| ----------------------------------------------- | ---------------------- | ------------------------------------------ | ------------------------------- |
| Image                                           | -                      | `ghcr.io/onecli/onecli`                    | `onecli/slim` (all-in-one)      |
| Price                                           | Free tier + paid plans | Free, open source                          | Commercial                      |
| Runs in your infrastructure                     | No                     | Yes                                        | Yes                             |
| App integrations                                | All, managed OAuth     | Community apps, your own OAuth credentials | All, your own OAuth credentials |
| Per-agent access (grants, per-tool allow/block) | Yes                    | Yes                                        | Yes                             |
| Manual approval on grants and rules             | Paid plans             | No                                         | Yes                             |
| Organization policy console                     | Yes                    | No                                         | Yes                             |
| Organization API key at boot                    | -                      | No                                         | Yes                             |
| Operations work                                 | None                   | Yours                                      | Yours                           |

If you don't need to run in your own infrastructure, [OneCLI Cloud](https://app.onecli.sh) is the fastest way to use OneCLI: no operations work, and it's always up to date.

## What's in the box

Both editions bundle the same three components into one container:

| Component | Port            | What it does                                                                              |
| --------- | --------------- | ----------------------------------------------------------------------------------------- |
| Dashboard | `10254`         | Web UI for connecting apps and managing secrets, agents, and access                       |
| REST API  | `10254` (`/v1`) | The same [API](/docs/api-reference) as OneCLI Cloud, served by your instance                   |
| Gateway   | `10255`         | The HTTPS proxy your agents route through for credential injection and policy enforcement |

Your data stays in your environment: secrets are encrypted at rest in your PostgreSQL, and request activity is logged to your database only. See [Telemetry](/docs/reference/telemetry) for the product's telemetry policy.

## Get started

<CardGroup cols={2}>
  <Card title="Deploy Community Edition" icon="docker" href="/docs/self-hosting/community">
    The free, open source edition. One command with Docker Compose.
  </Card>

  <Card title="Deploy Enterprise: all-in-one" icon="building" href="/docs/self-hosting/enterprise/all-in-one">
    The fully featured commercial image, API-ready from first boot.
  </Card>

  <Card title="Configuration" icon="gear" href="/docs/self-hosting/configuration">
    Environment variables, authentication modes, and networking.
  </Card>

  <Card title="Connect the CLI and agents" icon="terminal" href="/docs/self-hosting/connect-agents">
    Point agents at your instance, including headless provisioning.
  </Card>
</CardGroup>

## Support

The Docker Compose setups in these docs are intended for evaluation and small teams; the [production checklist](/docs/self-hosting/enterprise/all-in-one#production-checklist) covers hardening. For help, open an issue on [GitHub](https://github.com/onecli/onecli) or contact us through [onecli.sh](https://onecli.sh).
