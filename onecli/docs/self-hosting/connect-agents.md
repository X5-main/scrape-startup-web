> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect the CLI and agents

> Point agents at your self-hosted OneCLI instance, with headless provisioning, org-wide app connections, and rules via the organization API key.

Your self-hosted instance serves the same [REST API](/docs/api-reference) as OneCLI Cloud, so the CLI, SDKs, and agents work the same way. You just point them at your instance instead of `api.onecli.sh`.

There are two ways to get an agent running: through the dashboard, or headless over the API. On the Enterprise image, the [organization API key](/docs/self-hosting/enterprise/all-in-one) makes this fully headless from first boot; on Community, create a project API key in the dashboard first and use it the same way.

## Headless: provision straight from the API

On the Enterprise image, the organization and its API key are created at container startup, so the API works before you ever open the dashboard. One call provisions everything an agent needs:

```bash theme={null}
curl http://localhost:10254/v1/container-config \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY"
```

```json theme={null}
{
  "env": {
    "HTTPS_PROXY": "http://x:aoc_da603e520d5f142d0646e08f41c8ad08a1f48ec40953120540511ef9e2aa0334@host.docker.internal:10255",
    "HTTP_PROXY": "http://x:aoc_da603e520d5f142d0646e08f41c8ad08a1f48ec40953120540511ef9e2aa0334@host.docker.internal:10255",
    "NODE_EXTRA_CA_CERTS": "/tmp/onecli-gateway-ca.pem",
    "NODE_USE_ENV_PROXY": "1",
    "GIT_TERMINAL_PROMPT": "0",
    "GIT_HTTP_PROXY_AUTHMETHOD": "basic"
  },
  "caCertificate": "-----BEGIN CERTIFICATE-----\nMIIBqzCC...\n-----END CERTIFICATE-----",
  "caCertificateContainerPath": "/tmp/onecli-gateway-ca.pem",
  "warnings": [
    "No Anthropic credentials configured — the agent will use its own API key if available. Add one at /secrets"
  ]
}
```

On the first call, the instance provisions a default project and a default agent, then returns the agent's proxy configuration: proxy URLs carrying the agent's access token, and the gateway's CA certificate. Apply the `env` values and write `caCertificate` to the `NODE_EXTRA_CA_CERTS` path, and the agent's HTTP traffic routes through your gateway.

<Note>
  The proxy URL's host comes from `GATEWAY_BASE_URL` (default `host.docker.internal:10255`), which is right for agent containers on the same Docker host. If agents run elsewhere, set `GATEWAY_BASE_URL` to an address they can reach. See [Configuration](/docs/self-hosting/configuration#networking).
</Note>

### With the SDK

The [Node SDK](/docs/sdks/node) wraps the same endpoint. Point it at your instance and let it configure agent containers:

```typescript theme={null}
import { OneCLI } from "@onecli-sh/sdk";

const onecli = new OneCLI({
  url: "https://onecli.internal.example.com",
  apiKey: "oc_org_your_org_api_key",
});

const args = ["run", "--rm", "my-agent-image"];
const active = await onecli.applyContainerConfig(args);
```

### Managing the instance over the API

The organization API key works across the [REST API](/docs/api-reference). Project-scoped endpoints take an `X-Project-Id` header:

```bash theme={null}
curl http://localhost:10254/v1/agents \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY" \
  -H "X-Project-Id: smkufuswcpmbkqya"
```

### Organization-level connections and rules

Organization-level resources take no `X-Project-Id` at all: the organization comes from the key itself, and anything you create applies to every project and agent on the instance. Connect an API-key app organization-wide:

```bash theme={null}
curl -X POST http://localhost:10254/v1/org/apps/fireflies/connect \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fields": {"apiKey": "your-fireflies-api-key"}}'
```

```json theme={null}
{ "success": true }
```

For OAuth apps, configure the app's OAuth client first (see [App credentials](/docs/self-hosting/app-credentials)), then request the authorize URL and open it in a browser to finish the flow:

```bash theme={null}
curl -si http://localhost:10254/v1/org/apps/google-drive/authorize \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY" | grep -i '^location:'
```

Organization policy rules work the same way and apply to every agent (see [Policy rules](/docs/guides/rules) for the draft → publish model):

```bash theme={null}
curl -X POST http://localhost:10254/v1/org/policy/rules \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Block Gmail sends", "action": "block", "targets": [{"kind":"app","provider":"gmail","tools":["send_email"]}]}'
```

Then enforce the draft with `POST /v1/org/policy/publish`. Inspect what exists with `GET /v1/org/connections` and `GET /v1/org/policy/rules`, or use the CLI: the `onecli org apps connect`, `onecli org apps authorize`, and `onecli org policy` commands wrap the same endpoints. Published rules apply to every agent on its next request. An organization connection joins every project's credential pool, but an agent can use it only once you [grant](/docs/guides/agent-access) it:

```bash theme={null}
curl -X PUT "http://localhost:10254/v1/agents/$AGENT_ID/grants/connections/$CONNECTION_ID" \
  -H "Authorization: Bearer $ONECLI_ORG_API_KEY" \
  -H "X-Project-Id: smkufuswcpmbkqya" \
  -H "Content-Type: application/json" \
  -d '{"access": "full"}'
```

<Note>
  The `/v1/org/policy` surface is available on Enterprise releases running the
  policy engine. Only self-hosted releases that predate it still use the older
  `/v1/org/rules` API — on any updated release it returns `410 Gone`.
</Note>

## Through the dashboard

Open your instance's dashboard, connect the apps your agents need (see [app integrations](/docs/self-hosting/configuration#app-integrations)), and add LLM keys under **Secrets**. After connecting, grant the new credential to the agents that should use it — the post-connect **Agent access** dialog does this in the same motion (see [Agent access](/docs/guides/agent-access)). Granted agents pick the change up on their next request; no restart needed.

## Next steps

* [Grant](/docs/guides/agent-access) each agent the connections and secrets it needs
* Add organization [rules](/docs/guides/rules) as guardrails on top
* Connect [apps](/docs/integrations/app-connections) and [external vaults](/docs/vaults/overview)
* Explore the full [API reference](/docs/api-reference)
