> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# users

> Control-plane CRUD for tenant users (root client only).

`naive.users` manages your end-users — **child projects** in the product vocabulary.
Available on the root client only (organization scope).

```ts theme={"theme":"css-variables"}
await naive.users.list();                                   // { users: TenantUser[] }
await naive.users.create({ external_id, email, label, account_kit_id });
await naive.users.get(userId);
await naive.users.update(userId, { email, label, account_kit_id, status });
await naive.users.delete(userId);                           // suspend
```

## Inside a project

The calls above act in the organization's [default project](/docs/architecture/projects). The
same surface, scoped to another project, is `naive.forProject(id).childProjects` (aliased
`.users`):

```ts theme={"theme":"css-variables"}
const project = naive.forProject(projectId);

await project.childProjects.list();
const child = await project.childProjects.create({ external_id: "acme" });
await project.forChild(child.id).vault.list();              // the data plane
```

`naive.forUser(id)` is unchanged and is the same client as
`naive.forProject("default").forChild(id)`.
