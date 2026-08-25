> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Project

> GET /v1/projects/{project_id} — one project.

`default` and `current` are accepted in place of an id, so a client that has not stored
one can still address the organization's default project.

A project belonging to another organization answers **404, never 403** — existence is not
leaked.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/projects/1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93 \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
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
