> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# API Reference: Authentication, Errors & Endpoints

> Authenticate and interact with the OneCLI API to manage agents, credential grants, secrets, app connections, and organization policy rules.

The OneCLI API gives you programmatic access to manage your agents, their credential grants, secrets, app connections, and organization policy rules.

Per-agent access is written through the **Grants** endpoints (attach a connection or secret to an agent, optionally with per-tool allow and approval lists — see [Agent access](/docs/guides/agent-access)). Organization-wide guardrails live under `/org/policy`; the project `/policy` endpoints are read-only reflections of the enforced result.

## Base URL

<CodeGroup>
  ```bash Cloud theme={null}
  https://api.onecli.sh/v1
  ```

  ```bash Self-hosted (Docker) theme={null}
  http://localhost:10254/v1
  ```
</CodeGroup>

## Authentication

All API endpoints require authentication. Include your API key as a Bearer token in the `Authorization` header:

```bash theme={null}
curl https://api.onecli.sh/v1/agents \
  -H "Authorization: Bearer oc_your_api_key_here"
```

### Getting your API key

1. Open the OneCLI dashboard
2. Go to **Settings** and copy your API key

API keys start with `oc_` and are scoped to a single project. A project key always operates on its own project.

### Organization-scoped keys

Organization API keys start with `oc_org_` and can operate across projects. For project-scoped endpoints, include the `X-Project-Id` header to specify which project (without it, project endpoints return `401`):

```bash theme={null}
curl https://api.onecli.sh/v1/agents \
  -H "Authorization: Bearer oc_org_your_key_here" \
  -H "X-Project-Id: proj_abc123"
```

Organization endpoints (`/org/...`) need no project header, and require the admin or owner role, with one exception: `GET /org/partner/inherited-secrets` is readable by any organization member (project pages surface those inherited secrets).

### Partner keys

Partner API keys start with `oc_partner_` and let resellers and agencies provision and manage organizations for their customers. See the [Partner API](/docs/api-reference/partner) for the full workflow.

## Errors

The API returns standard HTTP status codes. Validation errors return a flat `error` string; authentication and service errors use an envelope with `message` and `type`:

<CodeGroup>
  ```json Validation error theme={null}
  {
    "error": "Label is required"
  }
  ```

  ```json Auth / service error theme={null}
  {
    "error": {
      "message": "Invalid API key or token.",
      "type": "authentication_error"
    }
  }
  ```
</CodeGroup>

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| `400`  | Validation error or bad request                           |
| `401`  | Missing or invalid authentication                         |
| `403`  | Insufficient permissions (role-gated endpoint)            |
| `404`  | Resource not found                                        |
| `409`  | Conflict (e.g., duplicate identifier)                     |
| `410`  | Endpoint retired — the message names the replacement      |
| `422`  | Validation law violated (grants tool lists, rule pairing) |

See [Errors](/docs/api-reference/errors) for the full reference, including the retired-endpoint inventory. Errors on an agent's **proxied** traffic (including the `409` account-selection protocol) are a separate surface: [Gateway errors](/docs/api-reference/gateway-errors) and [Multiple accounts](/docs/api-reference/multi-account).

## Rate limits

The gateway enforces rate limits on proxied requests via [policy rules](/docs/guides/rules).
