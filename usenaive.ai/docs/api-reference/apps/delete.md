> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete App

> DELETE /v1/apps/:id — Delete an app and all associated infrastructure.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "ok": true
  }
  ```
</ResponseExample>

## Behavior

Deleting an app immediately:

* Deletes the hosting project and all its deployments
* Deletes the managed backend (for fullstack apps)
* Deletes all stored secrets
* Removes all domain connections (company domains are released back to the Domains primitive)
* Archives the associated engineer agent

This action is irreversible. This endpoint is the only way to delete the underlying provider projects — project deletion is intentionally blocked on the [hosting](/docs/api-reference/apps/vercel-proxy) and [backend](/docs/api-reference/apps/supabase-proxy) proxies.

## Errors

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "resource_not_found",
    "message": "App not found"
  }
}
```
