> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Retry Provisioning

> POST /v1/apps/:id/retry — Re-run failed provisioning.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/apps/ca7a1b8c-a4d4-4824-b92d-89d5b297eb62/retry \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "status": "retrying",
    "vercel": "created",
    "supabase": "provisioning"
  }
  ```
</ResponseExample>

## Behavior

Use this endpoint when an app is stuck in `error` or `provisioning` status, or is missing provider infrastructure (e.g. an `active` fullstack app whose background backend provisioning failed). It checks which provider links are missing and re-provisions them. It is safe to call on a healthy app:

* **No hosting project linked** → creates the hosting project, seeds `NEXT_PUBLIC_APP_URL`, and links it.
* **Fullstack with no backend linked** → starts backend provisioning in the background and returns immediately. This call does **not** wait for the Supabase project. The `supabase` object appears on [`GET /v1/apps/:id`](/docs/api-reference/apps/get) once it is linked.
* **Nothing to retry** → `status: "noop"`, not an error. Retrying a healthy app is safe and idempotent.
* Already-linked infrastructure is left untouched.

The app moves to `provisioning` for the duration. It becomes `active` when this
call finishes, unless the backend is still being provisioned in the background —
in that case the background job sets `active` on success or `error` on failure.
Poll `GET /v1/apps/:id` to find out which.

## Response Fields

| Field      | Values                                 | Meaning                                                                                                                   |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `status`   | `retrying`, `noop`                     | `noop` = nothing was missing or failed; nothing was changed                                                               |
| `vercel`   | `ok`, `created`                        | `ok` = already linked; `created` = re-provisioned now                                                                     |
| `supabase` | `ok`, `provisioning`, `not_applicable` | `provisioning` = re-provisioning **started in the background and is not finished**; `not_applicable` = frontend\_only app |

<Warning>
  `supabase: "provisioning"` is not a success signal. The backend is not usable
  until `GET /v1/apps/:id` shows the `supabase` object. Until then
  `POST /v1/apps/:id/db/query` answers `job_not_ready` (409).
</Warning>

## Errors

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "feature_not_configured",
    "message": "Managed Supabase is not configured (missing SUPABASE_PAT, SUPABASE_ORG_ID)"
  }
}
```

```json 409 theme={"theme":"css-variables"}
{
  "error": {
    "code": "duplicate_request",
    "message": "A retry is already in progress for this app"
  }
}
```

```json 502 theme={"theme":"css-variables"}
{
  "error": {
    "code": "provider_error",
    "message": "Hosting project creation failed: 429"
  }
}
```
