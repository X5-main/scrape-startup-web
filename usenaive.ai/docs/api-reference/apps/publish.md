> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Publish App

> POST /v1/apps/:id/publish — Promote a preview deployment to the production domain.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/publish \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"deploymentId": "deployment-uuid"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "url": "https://naive-my-landing-page-ca7a1b.vercel.app",
    "deploymentId": "deployment-uuid"
  }
  ```
</ResponseExample>

## Request Body

| Field          | Type   | Required | Description                                                                                                                |
| -------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `deploymentId` | string | Yes      | Naive deployment record UUID (from [deploy](/docs/api-reference/apps/deploy) or [deployments](/docs/api-reference/apps/deployments)) |

## Behavior

Waits for the deployment to reach `READY` (polls up to 60s), then aliases it to the app's production domain — the primary custom domain if one is set, otherwise the default `{projectName}.vercel.app`. Traffic switches immediately with zero downtime.

The previous production deployment is demoted and the app's `latestDeploymentStatus` is updated.

## Errors

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "deploymentId is required"
  }
}
```

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "resource_not_found",
    "message": "Deployment not found"
  }
}
```
