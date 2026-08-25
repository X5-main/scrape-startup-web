> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create App

> POST /v1/apps — Create a new web application backed by managed hosting (and a managed backend for fullstack).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/apps \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "name": "My Landing Page",
      "type": "frontend_only",
      "description": "Company marketing site"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "ca7a1b8c-a4d4-4824-b92d-89d5b297eb62",
    "name": "My Landing Page",
    "type": "frontend_only",
    "status": "active",
    "companyId": "company-uuid",
    "description": "Company marketing site",
    "workspacePath": "agents/agent-uuid",
    "agentId": "agent-uuid",
    "vercel": {
      "vercelProjectId": "prj_5B9xCYfqFR15VTfvARu2ZgaXuA4u",
      "vercelProjectName": "naive-my-landing-page-ca7a1b",
      "productionDomain": "naive-my-landing-page-ca7a1b.vercel.app",
      "latestDeploymentUrl": null,
      "latestDeploymentId": null,
      "latestDeploymentStatus": null
    },
    "supabase": null,
    "template": {
      "repoUrl": "https://github.com/usenaive/app-dev-templates",
      "path": "frontend_only/dark-premium",
      "variant": "dark-premium",
      "cloneCommand": "git clone https://github.com/usenaive/app-dev-templates naive-app && cd naive-app/frontend_only/dark-premium"
    },
    "workspaceMode": "local",
    "secrets": [
      { "id": "secret-uuid-1", "key": "NEXT_PUBLIC_APP_URL", "target": "preview", "createdAt": "2026-01-15T10:00:02Z" },
      { "id": "secret-uuid-2", "key": "NEXT_PUBLIC_APP_URL", "target": "production", "createdAt": "2026-01-15T10:00:03Z" }
    ],
    "domains": [],
    "deployments": []
  }
  ```
</ResponseExample>

## Request Body

| Field         | Type   | Required | Description                                                                               |
| ------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| `name`        | string | Yes      | App display name                                                                          |
| `type`        | string | Yes      | `frontend_only` or `fullstack`                                                            |
| `description` | string | No       | Short description                                                                         |
| `variant`     | string | No       | Starter template variant: `dark-premium`, `clean-minimal`, `bold-energetic`, `warm-human` |

## Behavior

Create works **standalone** — no agent container or orchestration required.

* Managed **hosting** is created (Next.js framework), named `naive-{slug}-{shortId}`, with a default production domain of `{projectName}.vercel.app`.
* The response's `template` block tells you what to clone to start building ([templates](/docs/api-reference/apps/templates)). `workspaceMode` is `"local"` (direct mode) or `"container"`.
* `NEXT_PUBLIC_APP_URL` is set automatically for both `preview` and `production`.
* **When the company has an agent container** (`workspaceMode: "container"`): a dedicated **engineer agent** is provisioned and the starter template is scaffolded into its workspace. Without one, the agent is registered as `pending` and orchestration adopts the app later.
* **fullstack** only: a **managed backend** is provisioned asynchronously in the background. Once healthy, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are injected automatically, and the `supabase` object appears on [`GET /v1/apps/:id`](/docs/api-reference/apps/get).

If backend provisioning fails, use [`POST /v1/apps/:id/retry`](/docs/api-reference/apps/retry).

## Errors

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "type must be 'frontend_only' or 'fullstack'"
  }
}
```

```json 502 theme={"theme":"css-variables"}
{
  "error": {
    "code": "provider_error",
    "message": "Hosting project creation failed: 409"
  }
}
```
