> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Project

> POST /v1/projects — create a scope with its own account kits and child projects.

A project is a scope boundary, so creating one is a **governance write**: a sealed agent
key is refused exactly the way it is for `POST /v1/account-kits`. Only a human session
may create a project.

The new project provisions its own default [account kit](/docs/architecture/account-kits) and
default child project the first time anything acts inside it — it does not share the
organization's.

<ParamField body="name" type="string" required />

<ParamField body="slug" type="string">URL-safe handle, unique within the organization. Derived from `name` when omitted.</ParamField>
<ParamField body="settings" type="object">Free-form configuration carried on the project.</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/projects \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name":"Staging"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93",
    "organization_id": "9c1d3f57-0a2b-4e6d-8f10-5a7c2b9e4d81",
    "name": "Staging",
    "slug": "staging",
    "status": "active",
    "is_default": false,
    "settings": null,
    "created_at": "2026-07-01T09:15:00.000Z",
    "updated_at": "2026-07-01T09:15:00.000Z"
  }
  ```
</ResponseExample>

A duplicate slug is `409 duplicate_record`.
