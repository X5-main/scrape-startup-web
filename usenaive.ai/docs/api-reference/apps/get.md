> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get App

> GET /v1/apps/:id — Get full details of an app including its hosting project, backend, secrets, domains, and deployments.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2",
    "name": "StudyAI",
    "type": "fullstack",
    "status": "active",
    "companyId": "company-uuid",
    "description": "AI study assistant",
    "workspacePath": "agents/agent-uuid",
    "agentId": "agent-uuid",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:05:00Z",
    "vercel": {
      "vercelProjectId": "prj_5B9xCYfqFR15VTfvARu2ZgaXuA4u",
      "vercelProjectName": "naive-studyai-094cdf",
      "vercelTeamId": "team_abc123",
      "productionDomain": "naive-studyai-094cdf.vercel.app",
      "latestDeploymentUrl": "https://naive-studyai-094cdf-xyz.vercel.app",
      "latestDeploymentId": "dpl_xyz789",
      "latestDeploymentStatus": "production"
    },
    "supabase": {
      "projectRef": "abcdefghijklmnop",
      "url": "https://abcdefghijklmnop.supabase.co",
      "region": "us-east-1"
    },
    "template": {
      "repoUrl": "https://github.com/usenaive/app-dev-templates",
      "path": "fullstack/saas-dashboard",
      "variant": "saas-dashboard",
      "cloneCommand": "git clone https://github.com/usenaive/app-dev-templates naive-app && cd naive-app/fullstack/saas-dashboard"
    },
    "secrets": [
      { "id": "secret-uuid", "key": "NEXT_PUBLIC_SUPABASE_URL", "target": "production", "createdAt": "2026-01-15T10:03:00Z" }
    ],
    "domains": [
      { "id": "domain-uuid", "domain": "studyai.com", "type": "company", "verified": true, "isPrimary": true }
    ],
    "deployments": [
      { "id": "deployment-uuid", "vercelDeploymentId": "dpl_xyz789", "url": "https://naive-studyai-094cdf-xyz.vercel.app", "status": "production", "isProduction": true, "createdAt": "2026-01-15T11:00:00Z" }
    ]
  }
  ```
</ResponseExample>

## Response Fields

| Field                     | Type           | Description                                                                                                         |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`                      | string         | App UUID                                                                                                            |
| `name`                    | string         | Display name                                                                                                        |
| `type`                    | string         | `frontend_only` or `fullstack`                                                                                      |
| `status`                  | string         | `provisioning`, `active`, `paused`, `error`                                                                         |
| `workspacePath`           | string         | Engineer agent workspace where the app code lives                                                                   |
| `agentId`                 | string \| null | Dedicated engineer agent                                                                                            |
| `vercel`                  | object \| null | Hosting project link                                                                                                |
| `vercel.productionDomain` | string         | Domain that `publish` aliases to (defaults to `{projectName}.vercel.app`, or the primary custom domain)             |
| `supabase`                | object \| null | Managed backend link (fullstack only; `null` while provisioning)                                                    |
| `supabase.projectRef`     | string         | Backend project ref — used in [backend proxy](/docs/api-reference/apps/supabase-proxy) paths                             |
| `template`                | object         | Starter template for this app type — repo URL, path, and clone command ([templates](/docs/api-reference/apps/templates)) |
| `secrets`                 | array          | Environment variable keys (values never included)                                                                   |
| `domains`                 | array          | Attached domains                                                                                                    |
| `deployments`             | array          | Deployment history, newest first                                                                                    |

<Info>
  For `fullstack` apps, `supabase` stays `null` until background provisioning completes (typically 1–2 minutes), and `status` stays `provisioning` for the same window. Create does **not** wait for the backend link — poll this endpoint after creation. `status` becomes `active` when the link lands, or `error` if provisioning failed (then call [`POST /v1/apps/:id/retry`](/docs/api-reference/apps/retry)).
</Info>

## Errors

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "resource_not_found",
    "message": "App not found"
  }
}
```
