> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agent Access: Grant Credentials to Agents

> Attach app connections and secrets to agents with grants. Set per-tool allow and approval lists, and check the effective access organization rules leave.

Agents don't share a credential pool. Each agent uses exactly the credentials you **grant** it: an app connection (optionally narrowed to specific tools), or a secret. Everything else stays invisible — the gateway injects nothing an agent wasn't granted.

## How access works

A project holds the credential pool: secrets, LLM keys, and app connections (including ones shared from the organization). A **grant** attaches one credential from that pool to one agent.

* **No grant, no access.** A new agent starts with no grants. Until you attach something, the gateway injects no credentials for it, and its container config carries no credential stubs.
* **Grants take effect immediately.** There is no draft or publish step — the moment an attach or detach returns, the gateway enforces it.
* **Connections can be narrowed per tool.** A connection grant is either **full access** (every tool the app supports, including tools the provider adds later) or **custom** — you name which tools run freely and which pause for human approval; everything unnamed is blocked.
* **Secrets are all-or-nothing.** A secret grant has no tool lists — the agent can use the credential wherever its host pattern matches.

## Granting access

<Tabs>
  <Tab title="Dashboard">
    Open **Agents**, pick the agent, and use its access list to attach connections and secrets. Each app connection row has a **Manage** action where you switch between full and per-tool access.

    You can also start from the credential: open an app under **Apps**, choose the connection's **Agent access**, and toggle agents on or off there. Both views write the same grants.
  </Tab>

  <Tab title="CLI">
    Attach a connection with full access:

    ```bash theme={null}
    onecli agents grants attach-connection --id agent_abc123 --connection-id conn_9f2c1b
    ```

    ```json theme={null}
    {
      "agentId": "agent_abc123",
      "mode": "grants",
      "connections": [
        {
          "connectionId": "conn_9f2c1b",
          "provider": "gmail",
          "label": "Support inbox",
          "scope": "project",
          "access": "full",
          "allow": [],
          "ask": []
        }
      ],
      "secrets": []
    }
    ```

    Attach a secret or LLM key:

    ```bash theme={null}
    onecli agents grants attach-secret --id agent_abc123 --secret-id sec_5e8c02
    ```

    ```json theme={null}
    {
      "agentId": "agent_abc123",
      "mode": "grants",
      "connections": [
        {
          "connectionId": "conn_9f2c1b",
          "provider": "gmail",
          "label": "Support inbox",
          "scope": "project",
          "access": "full",
          "allow": [],
          "ask": []
        }
      ],
      "secrets": [
        {
          "secretId": "sec_5e8c02",
          "name": "ANTHROPIC_KEY",
          "type": "anthropic",
          "scope": "project"
        }
      ]
    }
    ```

    Read an agent's grants, or detach:

    ```bash theme={null}
    onecli agents grants list --id agent_abc123
    onecli agents grants detach-connection --id agent_abc123 --connection-id conn_9f2c1b
    ```

    ```json theme={null}
    {
      "status": "detached",
      "agentId": "agent_abc123",
      "connectionId": "conn_9f2c1b"
    }
    ```

    List every agent with a summary of what's attached:

    ```bash theme={null}
    onecli agents list --with-grants
    ```
  </Tab>
</Tabs>

## Per-tool access

For apps with a tool catalog (Gmail, GitHub, Notion, and most others), a connection grant can name tools instead of granting the whole app. Each tool is in one of three states:

* **Allow** — the agent calls it freely.
* **Ask** — every call pauses for [manual approval](/docs/guides/rules#manual-approval).
* **Never** — the tool is blocked. Any tool you don't name is blocked.

In the dashboard, the **Manage** dialog on a connection row presents exactly this tri-state per tool. From the CLI, pass tool ids (from `onecli apps permission-definition --provider gmail`):

```bash theme={null}
onecli agents grants attach-connection --id agent_abc123 --connection-id conn_9f2c1b \
  --allow search_messages,get_message --ask send_email
```

```json theme={null}
{
  "agentId": "agent_abc123",
  "mode": "grants",
  "connections": [
    {
      "connectionId": "conn_9f2c1b",
      "provider": "gmail",
      "label": "Support inbox",
      "scope": "project",
      "access": "custom",
      "allow": ["search_messages", "get_message"],
      "ask": ["send_email"]
    }
  ],
  "secrets": []
}
```

Two constraints apply to custom grants:

1. **At least one tool must be allowed or set to ask.** A grant with every tool on Never is not a grant — detach the connection instead. The API answers `422` with `Custom access needs at least one allowed or approval tool — detach instead.`
2. **A tool can't be both allowed and require approval.** The same id in both lists is rejected: `A tool can't be both always-allowed and require approval.`

Full access includes tools the provider adds to the catalog later; a custom grant doesn't — new tools arrive blocked until you allow them.

<Note>
  The **Ask** state requires a plan with manual approvals. Attaching and the
  allow/never states work on every plan; setting a non-empty ask list without
  the feature returns `403`.
</Note>

## After connecting an app

When you finish an OAuth connect from the dashboard, the app page opens the new connection's **Agent access** dialog so you can grant agents in the same motion. A freshly connected account has no grants yet — until you toggle agents on, nothing can use it.

The same applies over the API: `POST /v1/apps/{provider}/connect` returns a `connection` object only when a brand-new connection was created. Follow it with a grant call for each agent that should use it.

## The organization ceiling

Organization [policy rules](/docs/guides/rules) cap what any project grant can allow. A grant is the project-level intent; the organization level can still force approval or block a tool outright, and the strictest answer wins.

In the per-tool dialog, rows the organization locks are marked and can't be loosened from the project — an org-blocked tool stays blocked no matter what the grant says. The API reflects this as `orgCeiling` on each tool in `GET /v1/policy/effective-app-permissions`: what the organization level alone would decide, independent of your grant.

## Granted vs effective

Grants are what you **intend**; effective access is what actually **happens** after organization rules apply. Three read-only reflections answer "what can this agent really do":

| Question                                       | Endpoint                                                  |
| ---------------------------------------------- | --------------------------------------------------------- |
| Which credentials can this agent actually use? | `GET /v1/agents/{agentId}/effective-credentials`          |
| Which agents can really reach this connection? | `GET /v1/connections/{connectionId}/effective-agents`     |
| What can agents do with this app, per tool?    | `GET /v1/policy/effective-app-permissions?provider=gmail` |

When a request is blocked and the grant looks right, check the effective view first — an organization rule may be deciding. The CLI's `onecli agents credentials` and `onecli apps connections agent-access` commands read these same reflections.

## Multiple accounts of one app

You can connect several accounts of the same app (two Gmail inboxes, a personal and an org GitHub) and grant an agent any subset. Each account is its own connection with its own grant and its own per-tool lists.

When a request could be served by more than one granted account, the gateway answers `409` and asks the agent to name one with the `x-onecli-connection-id` header. See [Multiple accounts](/docs/api-reference/multi-account) for the full protocol.

## API quick reference

All grant routes require a project context (`X-Project-Id` with an organization key). Writes return the agent's updated grant set; detaches return `204`.

| Operation                               | Endpoint                                                                |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Read an agent's grants                  | `GET /v1/agents/{agentId}/grants`                                       |
| Attach / rewrite a connection grant     | `PUT /v1/agents/{agentId}/grants/connections/{connectionId}`            |
| Detach a connection                     | `DELETE /v1/agents/{agentId}/grants/connections/{connectionId}`         |
| Attach a secret                         | `PUT /v1/agents/{agentId}/grants/secrets/{secretId}` (no body)          |
| Detach a secret                         | `DELETE /v1/agents/{agentId}/grants/secrets/{secretId}`                 |
| Read a connection's granted agents      | `GET /v1/connections/{connectionId}/grants`                             |
| Grant / revoke from the connection side | `PUT` / `DELETE /v1/connections/{connectionId}/grants/agents/{agentId}` |
| List agents with grant summaries        | `GET /v1/agents?include=grants-summary`                                 |

## Next steps

* [Policy rules](/docs/guides/rules) — organization-wide guardrails on top of grants
* [Multiple accounts](/docs/api-reference/multi-account) — the gateway's account-selection protocol
* [Projects](/docs/guides/projects) — how the credential pool is scoped
