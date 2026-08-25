> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# apps

> Provision and manage managed apps with an optional managed backend.

```ts theme={"theme":"css-variables"}
// List / create / get
const { apps } = await naive.apps.list();
const app = await naive.apps.create({ name: "My Product", type: "fullstack", variant: "saas-dashboard" });
await naive.apps.get(app.id);

// Deploy + publish (orchestrated workspace deploy; direct tarball upload is CLI-only)
const dep = await naive.apps.deploy(app.id);
await naive.apps.publish(app.id, dep.id);
await naive.apps.deployments(app.id);
await naive.apps.retry(app.id);

// Secrets (synced to the app environment)
await naive.apps.setSecret(app.id, "API_KEY", "sk_live_...", "production");
await naive.apps.listSecrets(app.id);
await naive.apps.revealSecret(app.id, "API_KEY", "production");
await naive.apps.deleteSecret(app.id, "API_KEY", "production");

// Domains
await naive.apps.addDomain(app.id, "myapp.com");
await naive.apps.listDomains(app.id);
await naive.apps.setPrimaryDomain(app.id, "domain-uuid");

// Starter templates (public GitHub repo + clone commands)
await naive.apps.templates();
```

Per-user and AccountKit-gated like other primitives: `naive.apps` (default user) or `naive.forUser(id).apps`. A `type: "fullstack"` app provisions a managed backend in the background — once ready it powers the [database](/docs/sdk/sub-clients/database), [storage](/docs/sdk/sub-clients/storage), [functions](/docs/sdk/sub-clients/functions), and [auth](/docs/sdk/sub-clients/auth) sub-clients. See the [Apps guide](/docs/getting-started/apps).
