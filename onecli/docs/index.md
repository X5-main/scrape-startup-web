> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# OneCLI: The Agent Harness Built for Teams

> Give every employee a secured, sandboxed personal agent. OneCLI runs an agent per person, guarded by one gateway, with credentials the agents never see.

[OneCLI](https://onecli.sh) is an open-source platform for running AI agents as a team. You create an agent per person, give each agent the access it needs, and it works in a sandbox, routed through a gateway that injects credentials and enforces your policy. Your agents never see the keys.

<img src="https://mintcdn.com/chartdbinc/QhqVDDnxqQYGjiMi/images/dashboard-overview.png?fit=max&auto=format&n=QhqVDDnxqQYGjiMi&q=85&s=3e4f5615c818738032111894543a858a" alt="OneCLI Dashboard" className="block dark:hidden" width="3248" height="1966" data-path="images/dashboard-overview.png" />

<img src="https://mintcdn.com/chartdbinc/QhqVDDnxqQYGjiMi/images/dashboard-overview-dark.png?fit=max&auto=format&n=QhqVDDnxqQYGjiMi&q=85&s=e504644f9a87fc61748e9000caeeb29d" alt="OneCLI Dashboard" className="hidden dark:block" width="3248" height="1966" data-path="images/dashboard-overview-dark.png" />

## Built for teams

* **Your identity provider, integrated**: provision agents on behalf of each employee's identity, straight from the company IdP.
* **An agent per person**: everyone in the workspace gets their own sandboxed agent, reachable from the dashboard or Slack.
* **One policy, enforced everywhere**: manage the team policy in one place, enforced on every agent in the workspace.
* **Deterministic human-in-the-loop approvals**: in the chat itself, for actions you need 100% control over, like sending the email or emptying an S3 bucket.
* **Global connections**: shared at the team level, like LLM keys or service accounts, granted per agent without ever being handed to one.

## The agent

An agent is a durable thing, not a single prompt. It has:

* **A computer**: its own isolated sandbox, with a filesystem and a shell. The only way out is the gateway, so it reaches what you granted and nothing else.
* **A conversation**: its own page in the dashboard, or Slack. Images and files included.
* **Memory**: what the agent learns is kept by the platform. You can read and edit it any time.
* **Skills**: instructions and helpers you write once, always available to the agent.
* **A schedule**: the agent can plan future work, and the platform wakes it at the right time.
* **Credentials it never sees**: the gateway injects only the access you granted, on every request. Or connect [Bitwarden or 1Password](/docs/vaults/overview) for on-demand injection.
* **Its own Slack app**: connect it once and it answers in channels and DMs under its own name and avatar.

Agents run on your own infrastructure. The runner is outbound-only and holds no inbound ports, so a laptop, a homelab, or a VPC behind NAT all work with no ingress and no tunnel.

## Get started

<CardGroup cols={2}>
  <Card title="Quickstart" icon="rocket" href="/docs/quickstart">
    Cloud-hosted at onecli.sh, or self-host with one command.
  </Card>

  <Card title="How it works" icon="diagram-project" href="/docs/how-it-works">
    The architecture: dashboard, API, gateway, runner, sandbox.
  </Card>

  <Card title="Self-hosting" icon="server" href="/docs/self-hosting/overview">
    Run the whole stack yourself with Docker Compose.
  </Card>

  <Card title="Integrations" icon="plug" href="/docs/integrations/app-connections">
    Connect Google, GitHub, Slack, AWS, and 40+ more.
  </Card>
</CardGroup>

## Connect your own agent

OneCLI's gateway also works with agents you already run. Install the CLI and route any coding agent through the gateway:

```bash theme={null}
curl -fsSL onecli.sh/cli/install | sh
onecli auth login --api-key $ONECLI_API_KEY
onecli run -- claude
```

Its HTTP calls now route through OneCLI, which injects the credentials [granted to the agent](/docs/guides/agent-access) and enforces your policy. See the [Coding Agents guide](/docs/guides/coding-agents) and the [SDKs](/docs/sdks/node).
