> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Hosting Proxy

> ANY /v1/apps/:id/vercel/proxy/* — Call any hosting REST API operation, scoped to the app's own hosting project.

Generic passthrough to the underlying [hosting REST API](https://vercel.com/docs/rest-api). Naive injects the platform's hosting credentials (token + team ID) and forwards your request, so **any operation the hosting API supports** can be performed against the app's project — without you ever holding a hosting token.

The upstream path goes after `/vercel/proxy/`. The HTTP method, query parameters, and JSON body are forwarded as-is; the upstream status code and body are returned verbatim.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  # List deployments for the app's project
  curl "https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/vercel/proxy/v6/deployments" \
    -H "Authorization: Bearer nv_sk_live_..."

  # Fetch build logs for a deployment
  curl "https://api.usenaive.ai/v1/apps/:id/vercel/proxy/v3/deployments/dpl_xyz789/events" \
    -H "Authorization: Bearer nv_sk_live_..."

  # Update project build settings
  curl -X PATCH "https://api.usenaive.ai/v1/apps/:id/vercel/proxy/v9/projects/prj_5B9xCYfq..." \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"buildCommand": "next build", "nodeVersion": "22.x"}'

  # List the project's environment variables
  curl "https://api.usenaive.ai/v1/apps/:id/vercel/proxy/v10/projects/prj_5B9xCYfq.../env" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "deployments": [
      {
        "uid": "dpl_xyz789",
        "name": "naive-my-landing-page-ca7a1b",
        "url": "naive-my-landing-page-ca7a1b-abc123.vercel.app",
        "state": "READY",
        "target": "production",
        "created": 1768041600000
      }
    ]
  }
  ```
</ResponseExample>

## Scoping Rules

Naive holds org-wide hosting credentials, so every request is validated against the app before it is forwarded:

| Path pattern                       | Rule                                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `vN/projects/{projectIdOrName}/**` | `{projectIdOrName}` must be this app's hosting project ID or name. Covers env vars, domains, settings, and every other project sub-resource. |
| `vN/deployments` (GET)             | `projectId` query param is forced to this app's project — you always list your own deployments.                                              |
| `vN/deployments` (POST)            | `project` and `name` in the body are forced to this app's project.                                                                           |
| `vN/deployments/{idOrUrl}/**`      | The deployment must belong to this app's project (verified against Naive's records, or against the hosting platform itself).                 |

**Blocked:**

* `DELETE` on the project itself — use [`DELETE /v1/apps/:id`](/docs/api-reference/apps/delete) so all linked infrastructure is cleaned up together.
* All account/team-level paths (listing projects, user info, billing, other teams' resources) — `403 forbidden`.

## Methods

`GET`, `POST`, `PATCH`, `PUT`, `DELETE`. Request bodies must be JSON (binary uploads such as `v2/files` are not supported — use [`POST /v1/apps/:id/deploy`](/docs/api-reference/apps/deploy) to deploy).

## Useful Operations

| Operation               | Method + path                                  |
| ----------------------- | ---------------------------------------------- |
| Deployment status       | `GET v13/deployments/{deploymentId}`           |
| Build logs / events     | `GET v3/deployments/{deploymentId}/events`     |
| Cancel a deployment     | `PATCH v12/deployments/{deploymentId}/cancel`  |
| List env vars           | `GET v10/projects/{projectId}/env`             |
| Project domains         | `GET v9/projects/{projectId}/domains`          |
| Domain config check     | `GET v9/projects/{projectId}/domains/{domain}` |
| Update project settings | `PATCH v9/projects/{projectId}`                |

Consult the [hosting REST API reference](https://vercel.com/docs/rest-api) for the complete catalog, parameters, and response shapes.

## Errors

```json 403 theme={"theme":"css-variables"}
{
  "error": {
    "code": "forbidden",
    "message": "Path must reference this app's hosting project (prj_5B9xCYfq... or naive-my-landing-page-ca7a1b)"
  }
}
```

Upstream errors (4xx/5xx) are passed through with their original status code and body.
