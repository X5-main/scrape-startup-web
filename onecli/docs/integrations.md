> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Integrations: Connect Agents to External Services

> Connect AI agents to external services through the OneCLI gateway. OAuth apps, API keys, and cloud platforms, all from one dashboard.

## What is OneCLI Gateway

OneCLI connects AI agents to the services they need through a transparent gateway that handles authentication, credential injection, and access control. Agents make standard HTTP requests; the gateway injects the right credentials automatically.

<Frame>
  <img src="https://mintcdn.com/chartdbinc/WHxYCiD2RgHrla4w/images/connections-dashboard.png?fit=max&auto=format&n=WHxYCiD2RgHrla4w&q=85&s=5c8ed65860640f0f52ec46d95167dd92" alt="OneCLI Connections dashboard" width="2000" height="1208" data-path="images/connections-dashboard.png" />
</Frame>

<CardGroup cols={3}>
  <Card title="App Connections" icon="plug" href="/docs/integrations/app-connections">
    OAuth and API key integrations for external services like Gmail, GitHub, AWS, Jira, and more.
  </Card>

  <Card title="LLMs" icon="microchip-ai" href="/docs/integrations/llms">
    Store LLM API keys and the gateway injects them into requests to model providers automatically.
  </Card>

  <Card title="External Vaults" icon="vault" href="/docs/vaults/overview">
    Fetch credentials from your password manager on demand, without storing them on the server.
  </Card>
</CardGroup>

## How it works

All integrations follow the same flow:

1. You connect a service in the OneCLI dashboard (OAuth redirect, API key, or credential import)
2. OneCLI encrypts and stores the credentials (AES-256-GCM at rest, KMS envelope encryption in Cloud)
3. When an agent sends a request to a matching hostname, the gateway injects the stored credentials
4. [Rules](/docs/guides/rules) control which agents can access which services, with blocking, rate limiting, and manual approval

Agents never see or handle raw credentials. The gateway is the only component that decrypts and injects them.
