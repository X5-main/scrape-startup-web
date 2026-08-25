> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Deployments

> GET /v1/apps/:id/deployments — List deployment history for an app.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/deployments \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "deployments": [
      {
        "id": "deployment-uuid-1",
        "appId": "ca7a1b8c-a4d4-4824-b92d-89d5b297eb62",
        "vercelDeploymentId": "dpl_abc123xyz",
        "url": "https://naive-my-landing-page-ca7a1b-h7k2m.vercel.app",
        "status": "production",
        "isProduction": true,
        "triggeredBy": "agent",
        "createdAt": "2026-01-15T12:00:00Z"
      },
      {
        "id": "deployment-uuid-2",
        "appId": "ca7a1b8c-a4d4-4824-b92d-89d5b297eb62",
        "vercelDeploymentId": "dpl_def456",
        "url": "https://naive-my-landing-page-ca7a1b-j3n9p.vercel.app",
        "status": "preview",
        "isProduction": false,
        "triggeredBy": "agent",
        "createdAt": "2026-01-14T09:30:00Z"
      }
    ]
  }
  ```
</ResponseExample>

Returns Naive's deployment records, newest first. For live build state (`BUILDING` / `READY` / `ERROR` / `CANCELED`), build logs, or deployments not recorded by Naive, use the [hosting proxy](/docs/api-reference/apps/vercel-proxy): `GET v6/deployments` or `GET v13/deployments/{vercelDeploymentId}`.

## Response Fields

| Field                | Type           | Description                                                                     |
| -------------------- | -------------- | ------------------------------------------------------------------------------- |
| `id`                 | string         | Naive deployment record UUID (used with [publish](/docs/api-reference/apps/publish)) |
| `vercelDeploymentId` | string \| null | Hosting deployment ID (used with the hosting proxy)                             |
| `url`                | string         | Deployment URL                                                                  |
| `status`             | string         | `preview`, `production`, or `error`                                             |
| `isProduction`       | boolean        | Whether this is the current production deployment                               |
| `triggeredBy`        | string         | Who triggered the deployment (e.g. `agent`, `agent:{id}`)                       |
| `createdAt`          | string         | ISO 8601 timestamp                                                              |
