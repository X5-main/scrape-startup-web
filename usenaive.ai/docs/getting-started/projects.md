> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Projects

> Group an organization's account kits and child projects into scopes. Every organization has a default project, so nothing you already wrote has to change.

A **project** groups an organization's [account kits](/docs/getting-started/account-kits)
and child projects (the tenant users you provision per end-user):

```
organization → project → (account_kit → child_project → primitives)
```

Use one when a single organization needs more than one scope — staging next to
production, an acquired brand, one project per app you ship. If you don't need
that, you never see the layer: every organization has a **default project** and
every call that names no project resolves to it.

<Info>
  Migration `059` created the default project for every existing organization and
  backfilled every account kit, child project, connection, vault entry and approval
  into it. Nothing written before projects existed changes behaviour — see
  [Projects (architecture)](/docs/architecture/projects).
</Info>

## CLI first

```bash theme={"theme":"css-variables"}
naive projects list
naive projects create --name "Staging"
naive projects use <project_id>       # persisted; sent as X-Naive-Project-Id
naive projects use --clear            # back to the default project

naive use <child_project_id> --project <project_id>
```

## Create a project

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/projects \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "name": "Staging" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const project = await naive.projects.create({ name: "Staging" });
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "b6c2b0f1-9a5d-4a03-9c66-1cb9c2b1d2f4",
  "organization_id": "3f8a4e21-0f1c-4d2b-9b0e-2f4b7c9a1d33",
  "company_id": "3f8a4e21-0f1c-4d2b-9b0e-2f4b7c9a1d33",
  "name": "Staging",
  "slug": "staging",
  "status": "active",
  "is_default": false,
  "created_at": "2026-08-02T18:31:04Z"
}
```

`company_id` is the deprecated spelling of the same id, returned so a caller
written against the old name does not have to be rewritten.

### Parameters

| Param      | Type   | Required | Default          | Description                                 |
| ---------- | ------ | -------- | ---------------- | ------------------------------------------- |
| `name`     | string | Yes      | —                | Display name                                |
| `slug`     | string | No       | slugified `name` | URL-safe handle, unique in the organization |
| `settings` | object | No       | —                | Arbitrary JSON you can attach               |

## Work inside a project

<CodeGroup>
  ```javascript SDK theme={"theme":"css-variables"}
  const project = naive.forProject(projectId);

  const child = await project.childProjects.create({ external_id: "acme" });
  await project.accountKits.list();

  await project.forChild(child.id).cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  await project.forChild(child.id).vault.list();
  ```

  ```bash curl (path) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/projects/$PROJECT_ID/users \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "external_id": "acme" }'
  ```

  ```bash curl (header) theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "X-Naive-Project-Id: $PROJECT_ID"
  ```

  ```json MCP theme={"theme":"css-variables"}
  { "name": "naive_vault_list", "arguments": { "user_id": "<child_project_id>", "project_id": "<project_id>" } }
  ```
</CodeGroup>

`forProject("default")` declines to name a project rather than naming the
default one: on an un-pinned key it resolves to the organization's default
project, and on a key pinned to another project it resolves to the pin.
`naive.forUser(id)` is the same resolution without writing the sentinel.

## Pin a key to a project

An API key can be pinned to a project at creation (`active_project_id`), the way
it can be sealed to a subject. A pinned key can only act inside its project: a
request naming a different one is a **403 `key_project_mismatch`**, never a
redirect. Leave the project off the path (or use `default`) to act inside the pin.

## Delete a project

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/projects/{project_id} \
  -H "Authorization: Bearer nv_sk_your_key"
```

Refused while the project still holds account kits or child projects — deleting
it would cascade into every primitive underneath — and the default project can
never be deleted.

## Error handling

| Error           | Cause                                                                           | Recovery                                                 |
| --------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `not_found`     | The `project_id` is not in your organization (or is malformed)                  | `GET /v1/projects` for the valid ids                     |
| `invalid_input` | Duplicate slug, deleting a non-empty project, deleting or archiving the default | Pick another slug, or empty the project first            |
| `forbidden`     | A sealed agent key tried to create a project, or a pinned key named another one | Use an organization key; projects are a governance write |

## Back-compat

Every old spelling keeps working and resolves to the default project:
`naive.forUser(id)`, `naive.users`, `naive.accountKits`,
`naive use <child_project_id>`, `/v1/users/...`, `/v1/company`, and MCP tools
called with `user_id` and no `project_id`.
