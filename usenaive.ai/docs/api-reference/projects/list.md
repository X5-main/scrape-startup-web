> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Projects

> GET /v1/projects — the organization's projects.

A **project** is the layer between the [organization](/docs/architecture/projects) and its
account kits. Every organization has exactly one project until it creates a second, and
that one is created on first read — so an organization that predates the projects layer
still lists exactly one.

Reads are open to any authenticated caller for the organization. Writes are
[governance writes](/docs/architecture/projects) and require a human session.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/projects \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "projects": [
      {
        "id": "6f2c9a1e-7d4b-4c2a-9f11-2b8e5d0a4c33",
        "organization_id": "9c1d3f57-0a2b-4e6d-8f10-5a7c2b9e4d81",
        "company_id": "9c1d3f57-0a2b-4e6d-8f10-5a7c2b9e4d81",
        "name": "Default",
        "slug": "default",
        "status": "active",
        "is_default": true,
        "settings": null,
        "created_at": "2026-07-01T09:15:00.000Z",
        "updated_at": "2026-07-01T09:15:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>

`company_id` is a deprecated alias of `organization_id`, returned so callers written
against the old spelling keep working.
