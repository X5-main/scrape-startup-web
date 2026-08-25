> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# accountKits

> Control-plane CRUD for AccountKits (root client only).

`naive.accountKits` manages policy templates. Root client only.

```ts theme={"theme":"css-variables"}
await naive.accountKits.list();
await naive.accountKits.create({
  name: "Pro",
  connections_config: { mode: "allowlist", toolkits: ["gmail", "slack"] },
});
await naive.accountKits.get(kitId);
await naive.accountKits.update(kitId, { connections_config });
await naive.accountKits.delete(kitId);
await naive.accountKits.assignUser(kitId, userId);
```

## Inside a project

The calls above act in the organization's [default project](/docs/architecture/projects).
`naive.forProject(id).accountKits` (aliased `.kits`) is the same surface scoped to another
project — a kit created there is only assignable to that project's child projects:

```ts theme={"theme":"css-variables"}
const project = naive.forProject(projectId);

await project.accountKits.list();
const kit = await project.accountKits.create({ name: "Pro" });
await project.accountKits.assignUser(kit.id, childProjectId);
```

See [AccountKits](/docs/architecture/account-kits) for the config shape.
