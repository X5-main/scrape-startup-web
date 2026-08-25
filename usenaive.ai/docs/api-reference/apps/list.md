> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Apps

> GET /v1/apps — List all apps for your company.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "apps": [
      {
        "id": "ca7a1b8c-a4d4-4824-b92d-89d5b297eb62",
        "name": "My Landing Page",
        "type": "frontend_only",
        "status": "active",
        "companyId": "company-uuid",
        "createdAt": "2026-01-15T10:00:00Z",
        "vercel": {
          "vercelProjectId": "prj_5B9xCYfqFR15VTfvARu2ZgaXuA4u",
          "vercelProjectName": "naive-my-landing-page-ca7a1b",
          "productionDomain": "naive-my-landing-page-ca7a1b.vercel.app",
          "latestDeploymentUrl": "https://naive-my-landing-page-ca7a1b-h7k2m.vercel.app",
          "latestDeploymentStatus": "production"
        }
      },
      {
        "id": "094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2",
        "name": "My SaaS App",
        "type": "fullstack",
        "status": "active",
        "companyId": "company-uuid",
        "createdAt": "2026-01-16T14:30:00Z",
        "vercel": {
          "vercelProjectId": "prj_8Xy2AbCdEfGh34IjKlMnOpQrStUv",
          "vercelProjectName": "naive-my-saas-app-094cdf",
          "productionDomain": "naive-my-saas-app-094cdf.vercel.app",
          "latestDeploymentUrl": null,
          "latestDeploymentStatus": null
        }
      }
    ]
  }
  ```
</ResponseExample>

## Response Fields

| Field       | Type           | Description                                 |
| ----------- | -------------- | ------------------------------------------- |
| `id`        | string         | App UUID                                    |
| `name`      | string         | Display name                                |
| `type`      | string         | `frontend_only` or `fullstack`              |
| `status`    | string         | `provisioning`, `active`, `paused`, `error` |
| `companyId` | string         | Owning company UUID                         |
| `vercel`    | object \| null | Linked hosting project summary              |
| `createdAt` | string         | ISO 8601 timestamp                          |
