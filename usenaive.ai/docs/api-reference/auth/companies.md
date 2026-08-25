> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Companies

> GET /v1/auth/companies — list organizations available to the authenticated agent. POST /v1/auth/companies — create another one.

A **company** is an [organization](/docs/architecture/projects) — the rename is vocabulary, the
route and the payload are unchanged. `GET /v1/organization` is the canonical spelling of
`GET /v1/company` for the caller's own organization; this listing route keeps its name.

## List companies

`GET /v1/auth/companies`

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/auth/companies \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "companies": [
      {
        "id": "uuid",
        "name": "Acme Corp",
        "prefix": "acme",
        "credits": 15000,
        "tier": "pro"
      }
    ]
  }
  ```
</ResponseExample>

CLI: [`naive companies list`](/docs/cli/companies).

***

## Create a company

`POST /v1/auth/companies`

Creates an additional company, seeds it the same way signup does (starter
credits, a default AccountKit and default user, an `api-agent` and a CEO
agent), and returns a **new API key** scoped to it.

<ParamField body="name" type="string" required>
  Company display name. Minimum 2 characters.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/auth/companies \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"name":"Acme Staging"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "company_id": "uuid",
    "company_name": "Acme Staging",
    "agent_id": "uuid",
    "api_key": "nv_sk_live_...",
    "credits": 20,
    "hint": "New API key saved by the CLI for this company context"
  }
  ```
</ResponseExample>

`api_key` is shown **once**. It is scoped to the new company and sealed to that
company's default user.

### Who can call this

<Warning>
  **Any valid API key on your company can call this — not only the owner.**

  An API key carries no account identity (`company_memberships.principal_id` is an
  `auth_users` id; the only user on a key is a per-company `tenant_users` id), so
  the API cannot check that the caller *is* the owner. It resolves your company's
  active owner user and attributes the new company to them: they own it, they are
  billed for it, and it consumes one of their five company slots.

  If that is not what you want, do not hand out API keys you would not let create
  a company. Treat this endpoint as owner-equivalent authority.
</Warning>

Bounds that do apply:

| Limit                       | Value                                                |
| --------------------------- | ---------------------------------------------------- |
| Companies per owner         | 5 (`403 forbidden`, `details.max` / `details.owned`) |
| Creates per hour, per owner | 3 (`429 rate_limited`)                               |
| Creates per hour, per IP    | 6 (`429 rate_limited`)                               |

### Errors

| Status | `code`          | Cause                                                                        |
| ------ | --------------- | ---------------------------------------------------------------------------- |
| 400    | `invalid_input` | `name` missing or shorter than 2 characters                                  |
| 401    | `unauthorized`  | No / invalid API key                                                         |
| 403    | `forbidden`     | Your company has no active owner user, or that owner is at the 5-company cap |
| 429    | `rate_limited`  | Per-owner or per-IP create limit exceeded                                    |

CLI: [`naive companies create`](/docs/cli/companies).
