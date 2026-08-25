> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create AccountKit

> POST /v1/account-kits — create a policy template.

Account kits belong to a [project](/docs/architecture/projects). With no project selected the
route acts in the organization's default project. Select another with the path prefix
`/v1/projects/{project_id}/account-kits/...` or the `X-Naive-Project-Id` header.

<ParamField body="name" type="string" required />

<ParamField body="description" type="string" />

<ParamField body="primitives_config" type="object">Per-primitive `{ enabled, defaults?, requiresApproval? }`. `requiresApproval` gates the primitive's sensitive agent actions behind a human [approval](/docs/architecture/approvals) (`true` forces it, `false` opts out of the built-in default).</ParamField>
<ParamField body="connections_config" type="object">`{ mode, toolkits?, tools?, custom_auth_configs?, requiresApproval?, approvalToolkits? }`. `mode` is `open | allowlist | blocklist`. `requiresApproval` gates connecting any toolkit; `approvalToolkits` gates only specific slugs.</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/account-kits \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "name":"Pro",
      "primitives_config":{"cards":{"enabled":true,"requiresApproval":true}},
      "connections_config":{"mode":"allowlist","toolkits":["gmail","slack"],"requiresApproval":false}
    }'
  ```
</RequestExample>

Sensitive actions (cards, domains, KYC, formation, connecting services) require
human approval by default. See [Approvals](/docs/getting-started/approvals).
