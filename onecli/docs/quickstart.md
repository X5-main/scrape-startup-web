> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Create your first sandboxed agent on OneCLI cloud or self-host the stack with one command, then grant it access and start talking.

Two ways to run OneCLI: the cloud at [onecli.sh](https://onecli.sh), or self-hosted on your own infrastructure. Either way, you end up with an agent per person, each in its own sandbox, guarded by the gateway.

## Cloud-hosted

<Steps>
  <Step title="Sign up">
    Go to [onecli.sh](https://onecli.sh) and create your organization. A workspace is created for you automatically.
  </Step>

  <Step title="Create an agent">
    From the dashboard, create an agent. It gets its own sandbox, conversation page, memory, and skills.
  </Step>

  <Step title="Grant a model key and connections">
    Store an LLM key (or use a shared organization connection), then **grant it to the agent**. The order matters: a sandbox will not start without a granted model key. Connect any services the agent should reach (Google, GitHub, Slack, AWS, and more) and grant those too. See [Agent access](/docs/guides/agent-access).

    <img src="https://mintcdn.com/chartdbinc/QhqVDDnxqQYGjiMi/images/add-credentials.png?fit=max&auto=format&n=QhqVDDnxqQYGjiMi&q=85&s=ace2efa01e8086b6ecd116ab4c8d5de6" alt="Connect a service in the OneCLI dashboard" className="block dark:hidden" width="3248" height="1966" data-path="images/add-credentials.png" />

    <img src="https://mintcdn.com/chartdbinc/QhqVDDnxqQYGjiMi/images/add-credentials-dark.png?fit=max&auto=format&n=QhqVDDnxqQYGjiMi&q=85&s=8b3a997040852e31f323df2732cceed6" alt="Connect a service in the OneCLI dashboard" className="hidden dark:block" width="3248" height="1966" data-path="images/add-credentials-dark.png" />
  </Step>

  <Step title="Start talking">
    Chat with the agent from its dashboard page, or attach it to Slack so it answers in channels and DMs under its own name. Actions you flagged for approval show up as cards with Approve and Deny buttons, in the chat itself.
  </Step>
</Steps>

## Self-hosted

```bash theme={null}
git clone https://github.com/onecli/onecli.git && cd onecli
pnpm install
pnpm run setup
```

Open [localhost:10254](http://localhost:10254) and **create your account right away**. That account owns the instance; after it exists, joining needs an invitation.

No Node toolchain handy? The install script does the same without a clone:

```bash theme={null}
curl -fsSL https://onecli.sh/install | sh
```

Then follow the cloud steps above: create an agent, store a model key, grant it, and start talking. For raw Docker Compose, version pinning, and upgrades, see [Self-hosting](/docs/self-hosting/overview).

## Connect your own agent

Already running Claude Code, Cursor, or Codex? Route it through the gateway so it gets injected credentials without ever holding keys. The **Install** page in the dashboard generates this as a single copy-paste command, or run the steps yourself:

```bash theme={null}
curl -fsSL onecli.sh/cli/install | sh
onecli auth login --api-key oc_your_api_key
onecli run -- claude
```

This wraps your agent with proxy settings, CA certificates, and agent skills automatically. Replace `claude` with `cursor`, `codex`, or any command. See the [Coding Agents guide](/docs/guides/coding-agents), or the [Node.js SDK](/docs/sdks/node) for Docker-based agents.

## Next steps

<CardGroup cols={2}>
  <Card title="Agent access" icon="key" href="/docs/guides/agent-access">
    Grant each agent exactly the connections and secrets it needs.
  </Card>

  <Card title="Integrations" icon="plug" href="/docs/integrations">
    Browse 40+ supported services and connect them from the dashboard.
  </Card>

  <Card title="How it works" icon="gears" href="/docs/how-it-works">
    Architecture: gateway, runner, sandbox, and how the pieces fit together.
  </Card>

  <Card title="Self-hosting" icon="server" href="/docs/self-hosting/overview">
    Compose stack, version pinning, configuration, and upgrades.
  </Card>
</CardGroup>

## Troubleshooting

<AccordionGroup>
  <Accordion title="The agent says it has no model key">
    Store the LLM key, then **grant it to the agent** from the key's Agent access dialog. A sandbox will not start without a granted model key.
  </Accordion>

  <Accordion title="OAuth redirect goes to the wrong URL (self-hosted / remote setups)">
    If you're accessing a self-hosted OneCLI through an SSH tunnel, reverse proxy, or on a remote server, OAuth callbacks may redirect to an unreachable address.

    Set `NEXT_PUBLIC_APP_URL` to the URL you actually use in your browser:

    ```bash theme={null}
    NEXT_PUBLIC_APP_URL=http://localhost:8080
    ```

    For SSH tunnel setups, forwarding to the same local port avoids this entirely:

    ```bash theme={null}
    ssh -L 10254:127.0.0.1:10254 user@host
    ```
  </Accordion>

  <Accordion title="Docker stack won't start (self-hosted)">
    Make sure Docker is running and ports 10254/10255 are available. On every `docker compose up`, a one-shot `migrations` service applies pending database migrations before the API starts. If a migration fails, the stack refuses to start. Check `docker compose logs migrations`.
  </Accordion>
</AccordionGroup>
