> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Projects

> The scope between an organization and its account kits and child projects — and the default project that means nothing had to change.

A **project** is a scope inside an organization. It owns account kits and child
projects, and through them every primitive:

```
organization                 ← you, the developer who signed up (holds API keys)
  └── project                ← a scope inside it (staging, an acquired brand, one app)
        ├── account_kit      ← policy template (what a child project may do)
        └── child_project    ← one governed real-world bundle per tenant
              └── identity + card + comms (+ runtime), governed as one unit
```

Projects are **additive**. Every organization has exactly one **default project**,
and a call that names no project resolves to it — which is every call written
before projects existed. The layer only becomes visible when you create a second
project. The physical tables are unchanged: an organization is a `companies` row and a
child project is a `tenant_users` row, so `company_id`, `tenant_user_id`,
`/v1/company` and `/v1/users/:user_id/...` all keep working.

## The default project

Created for each organization by migration `059`, which backfilled every pre-existing
account kit, child project, connection, vault entry, approval, activity event, and
agent into it (older untouched organizations get it lazily, on first read). It is not
deletable and not archivable — it is where every un-projected caller lands.

A row whose `project_id` is `NULL` belongs to the default project: the column is
nullable on purpose, so a write from an un-taught path is still visible exactly where
its organization can see it — never invisible, never another project's.

## Selecting a project

Five ways, in this order:

1. **The path** — `/v1/projects/:project_id/...` in front of any data-plane route.
   `/v1/projects/<id>/users/<child_id>/vault` is `/v1/users/<child_id>/vault`
   scoped to that project.
2. **The `X-Naive-Project-Id` header** — same effect without changing the route.
   Treated as untrusted input and validated against the key's organization, like
   any path param.
3. **The API key's pinned project** (`active_project_id`), set when the key is
   created.
4. **The project of the key's sealed child project**, if it is sealed to one —
   what makes a key sealed into a non-default project usable without also
   pinning the project. A child project *named in the path* does **not** select
   a project this way: naming a child of another project without selecting that
   project is a `404`, not a door into it.
5. **The organization's default project.**

The sentinels `default` and `current` mean **the caller's own project**: the
key's pinned project when it has one, otherwise the organization's default
project. They are a way to *decline to name* a project, not a way to name the
default one — a pinned key writing `default` still acts inside its pin.

<Warning>
  **A pinned key is authoritative**, exactly as a sealed key is for its subject. A
  caller-supplied project id may only *agree* with the pin; disagreeing is a **403
  `key_project_mismatch`**, never a redirect into the named project.
</Warning>

## The cross-project guard

Subject resolution now asserts both axes. After resolving a candidate child
project, the resolver requires:

```
child_project.company_id  === api_key.company_id     // same organization
child_project.project_id  === resolved_project.id    // same project
```

Either mismatch returns **404 — not 403**. The existence of another
organization's — or another project's — child project is itself information we
do not leak. The one deliberate exception is the key-pin mismatch above, which is
a 403 because it is about *your own* key, not about what exists.

See [Subject resolution](/docs/architecture/subject-resolution) for the subject half of
the same resolver.

## What is project-scoped, and what is organization-wide

| Scope            | What lives there                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Project**      | account kits, child projects and every primitive under them, connections, vault entries, activity events, approvals, agents, deployments |
| **Organization** | API keys, billing and credits, the organization brain, teams, members and sessions                                                       |

Deployments were already namespaced by `(organization, project)` before this
layer existed — the IaC `project:` string is the same project key, now first-class.
See [Infrastructure as code](/docs/getting-started/iac).

## Using it

```ts theme={"theme":"css-variables"}
const project = await naive.projects.create({ name: "Staging" });

const child = await naive.forProject(project.id).childProjects.create({
  external_id: "acme",
});

await naive.forProject(project.id).forChild(child.id).cards.create({
  name: "Ops",
  spending_limit_cents: 5_000,
});
```

```bash theme={"theme":"css-variables"}
naive projects list
naive projects create --name "Staging"
naive projects use <project_id>     # persisted; sends X-Naive-Project-Id
naive use <child_project_id> --project <project_id>
```

Everything written against the old names keeps working and resolves to the
default project: `naive.forUser(id)`, `naive.users`, `naive.accountKits`,
`naive use <child_project_id>`, `/v1/users/...`, `/v1/company`, and MCP tools
called with `user_id` alone.

See [Projects (getting started)](/docs/getting-started/projects) for the walkthrough.
