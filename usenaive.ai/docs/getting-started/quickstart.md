> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Make your first Naïve call — SDK, CLI, or MCP.

Three surfaces, one API key. The SDK embeds Naïve in your multi-tenant app; the CLI
and MCP act on your default user out of the box.

<Tabs>
  <Tab title="SDK">
    ```bash install theme={"theme":"css-variables"}
    npm install @usenaive-sdk/node
    ```

    <div className="naive-section-label">Solo mode</div>

    ```ts agent.ts theme={"theme":"css-variables"}
    import { Naive, isPendingApproval } from "@usenaive-sdk/node";

    const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

    // Solo mode — every call auto-scopes to your default user.
    await naive.vault.put("instantly.api_key", "key_xyz");

    // `name` is required. The default provider (prepaid_gift) caps at $150; for a
    // bigger ceiling pass provider: "managed_virtual", which needs a cardholder on
    // file first (see /getting-started/cards).
    await naive.cards.create({ name: "Ops", spending_limit_cents: 5000 });

    // Sensitive calls can be parked for a human by the user's Account Kit, so the
    // result is a union — narrow it before reading the redirect.
    const res = await naive.connections.connect("gmail", {
      callbackUrl: "https://myapp.com/oauth/callback",
    });
    if (!isPendingApproval(res)) {
      console.log(res.redirectUrl);
    }
    ```

    <div className="naive-section-label">Multi-tenant mode</div>

    ```ts signup.ts theme={"theme":"css-variables"}
    // Multi-tenant — create a user, then scope with forUser(id).
    const alice = await naive.users.create({
      external_id: "alice_db_uuid",
      email: "alice@example.com",
    });

    const client = naive.forUser(alice.id);
    await client.cards.create({ name: "Ops", spending_limit_cents: 5000 });
    await client.connections.connect("gmail", { callbackUrl });
    const session = await client.session(); // per-user MCP session
    ```

    <div className="naive-section-label">More than one scope</div>

    ```ts projects.ts theme={"theme":"css-variables"}
    // A project groups account kits and child projects (tenant users). Every
    // organization has a default project, which is where the calls above land.
    const staging = await naive.projects.create({ name: "Staging" });
    const project = naive.forProject(staging.id);

    const child = await project.childProjects.create({ external_id: "alice_db_uuid" });
    await project.forChild(child.id).cards.create({ name: "Ops", spending_limit_cents: 5000 });
    ```

    See the full [SDK reference](/docs/sdk/overview) and [Projects](/docs/getting-started/projects).
  </Tab>

  <Tab title="CLI">
    ```bash bash theme={"theme":"css-variables"}
    npm install -g @usenaive-sdk/cli

    # Authenticate. Either sign in (writes ~/.naive/config.json)…
    naive login --email you@example.com --password ...
    # …or hand the CLI a key you already have — it reads NAIVE_API_KEY first,
    # before the config file:
    export NAIVE_API_KEY=nv_sk_live_...

    # Solo mode — acts on your default user
    naive cards create --name Ops --spending-limit 25000 --provider managed_virtual   # cents
    naive connections connect gmail
    naive vault put instantly.api_key key_xyz

    # Multi-tenant
    naive users create --external-id alice --email alice@example.com
    naive use <user_id>           # set the active user
    naive cards list              # scoped to the active user
    ```
  </Tab>

  <Tab title="MCP">
    ```json mcp.json theme={"theme":"css-variables"}
    {
      "mcpServers": {
        "naive": {
          "type": "sse",
          "url": "https://api.usenaive.ai/mcp/sse",
          "headers": { "Authorization": "Bearer nv_sk_live_..." }
        }
      }
    }
    ```

    Hosted MCP — your agent connects over SSE. Every tool accepts an optional
    `user_id`; omit it to act on your default user. See the [MCP tools reference](/docs/mcp/tools).
  </Tab>
</Tabs>

## Start from a template

Hand a pre-built blueprint to your coding agent. Paste the prompt below — it reads
[skill.md](https://usenaive.ai/skill.md) for full setup context — then pick a template to apply.

```txt agent prompt theme={"theme":"css-variables"}
Read https://usenaive.ai/skill.md and use it to set up Naïve in my project.
```

<div className="naive-section-label">Autonomous companies</div>

| Template                 | Description                                                             | Status |
| ------------------------ | ----------------------------------------------------------------------- | ------ |
| **AI media channel**     | Faceless content brand that researches, produces, posts, and monetizes. | Soon   |
| **AI automation agency** | Delivers client work autonomously, bills, and reports.                  | Soon   |
| **AI trading assistant** | Connects to a brokerage; drafts trades the user reviews and approves.   | Soon   |

<div className="naive-section-label">Multi-tenant apps</div>

| Template                           | Description                                                           | Status                                                    |
| ---------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| **AI SEO platform for SMBs**       | Each customer gets an agent that signs up, researches, and publishes. | [GitHub](https://github.com/usenaive/ai-seo-geo-platform) |
| **AI outbound agent for SaaS**     | Per-tenant domains, inboxes, and sequencer accounts.                  | Soon                                                      |
| **AI voice agent for dealerships** | Each location provisioned, scoped, and billed on its own.             | Soon                                                      |

## Next steps

* [Agent Profiles](/docs/getting-started/agent-profiles) — the governed real-world bundle
* [Users](/docs/getting-started/users) — provision your end-users
* [Account Kits](/docs/getting-started/account-kits) — bundle policy
* [Connections](/docs/getting-started/connections) — 1,000+ third-party apps
* [Vault](/docs/getting-started/vault) — per-user encrypted secrets
* [Governance gateway](/docs/architecture/governance-gateway) — caps, approvals, audit, revoke
