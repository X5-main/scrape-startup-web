> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Deploy App

> POST /v1/apps/:id/deploy — Deploy code: upload your project directly, or deploy from the agent workspace.

Two deploy modes on the same endpoint, selected by `Content-Type`:

* **Direct upload** (`application/gzip`): send a gzipped tarball of your project directory — no agent container involved. This is what `naive apps deploy` does when run outside a container.
* **Workspace deploy** (JSON body or empty): copies code from the company's agent container workspace (orchestrated mode).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  # Direct mode: upload your local project (what `naive apps deploy` does for you)
  tar czf app.tgz --exclude node_modules --exclude .next --exclude .git -C ./my-project .
  curl -X POST https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/deploy \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/gzip" \
    --data-binary @app.tgz

  # Orchestrated mode: deploy from the agent container workspace
  curl -X POST https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/deploy \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{}'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "deployment-uuid",
    "appId": "ca7a1b8c-a4d4-4824-b92d-89d5b297eb62",
    "vercelDeploymentId": "dpl_abc123xyz",
    "url": "https://naive-my-landing-page-ca7a1b-h7k2m.vercel.app",
    "status": "preview",
    "isProduction": false,
    "triggeredBy": "upload",
    "createdAt": "2026-01-15T12:00:00Z"
  }
  ```
</ResponseExample>

## Direct Upload Mode

Send a gzipped tarball (`Content-Type: application/gzip`) of the project root. Limits and rules:

* Max 30 MB gzipped, max 200 MB decompressed, max 5,000 entries
* `node_modules`, `.next`, and `.git` are skipped server-side (exclude them client-side too for speed)
* Absolute paths and `..` traversal entries are rejected
* The build system detects the framework and builds; pre-built static sites (`index.html`, no `package.json`) are served as-is

Get a starter project from the [templates endpoint](/docs/api-reference/apps/templates).

## Workspace Deploy Mode (Orchestrated)

| Field           | Type   | Required | Description                                     |
| --------------- | ------ | -------- | ----------------------------------------------- |
| `workspacePath` | string | No       | Override the container workspace to deploy from |

Source resolution order:

1. **Explicit `workspacePath`** — `{workspacePath}/app` is deployed.
2. **Active task workspace** — if a kanban task body references `naive apps deploy <appId>`, that task's workspace is used.
3. **Engineer agent workspace** — `{app.workspacePath}/app`. If the workspace was never scaffolded, the starter template is applied automatically and the deploy retried once.

If the company has **no agent container**, workspace mode returns `400 invalid_input` with instructions to use direct upload instead — apps are not tied to orchestration.

## After the Deploy

The build runs asynchronously. Poll [`GET /v1/apps/:id/deployments`](/docs/api-reference/apps/deployments) or use the [hosting proxy](/docs/api-reference/apps/vercel-proxy) (`GET v13/deployments/{vercelDeploymentId}`, `GET v3/deployments/{vercelDeploymentId}/events` for build logs). Once `READY`, the deployment is automatically aliased to the production domain; use [`publish`](/docs/api-reference/apps/publish) to promote a specific historical deployment.

## Errors

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "Upload too large (max 30MB). Exclude node_modules, .next, and .git."
  }
}
```

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "This app has no workspace container — deploy directly from your project instead: clone the starter (...), build it, then run 'naive apps deploy <id>' from the project directory (or POST a gzipped tarball to this endpoint)."
  }
}
```

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "feature_not_configured",
    "message": "No hosting project linked to this app"
  }
}
```
