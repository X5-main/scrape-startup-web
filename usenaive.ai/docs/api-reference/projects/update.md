> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Project

> PATCH /v1/projects/{project_id} — rename, archive or reconfigure.

A **governance write** — a human session only.

Archiving a project keeps its rows and refuses new work inside it: a request that selects
an archived project is `403 project_archived`. The default project cannot be archived,
because every unprojected request resolves to it.

<ParamField body="name" type="string" />

<ParamField body="status" type="string">`active` or `archived`.</ParamField>

<ParamField body="settings" type="object" />

The `slug` is immutable — it is the handle other systems address the project by.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/projects/1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93 \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"status":"archived"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93",
    "organization_id": "9c1d3f57-0a2b-4e6d-8f10-5a7c2b9e4d81",
    "name": "Staging",
    "slug": "staging",
    "status": "archived",
    "is_default": false,
    "settings": null,
    "created_at": "2026-07-01T09:15:00.000Z",
    "updated_at": "2026-07-01T09:15:00.000Z"
  }
  ```
</ResponseExample>
