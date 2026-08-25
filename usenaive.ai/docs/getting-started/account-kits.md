> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Account Kits

> Policy templates that bundle which primitives are enabled and which third-party apps a user may connect — assign users to a kit instead of configuring each one.

An **Account Kit** is a reusable policy template. Instead of configuring every
[tenant user](/docs/getting-started/users) individually, you define a kit once and assign
users to it. A kit controls two things:

* **Primitives** — which capabilities are enabled, split into **Identity** (verification,
  formation, email, domains) and **Tools** (cards, social, vault, logs).
* **Third-party connections** — which apps a user may connect, plus per-tool filters and
  white-label auth.

See the full model in [Architecture → Account Kits](/docs/architecture/account-kits).

Kits belong to a [project](/docs/getting-started/projects). Every call on this page acts in
the organization's default project unless you select another one —
`naive.forProject(p).accountKits`, `--project <p>` in the CLI, or the
`X-Naive-Project-Id` header in REST.

## Kits in `naive.config.ts`

Kits can also be declared in `naive.config.ts` under `kits:` and instantiated per
child project — the same rows this page manages, authored declaratively:

```ts theme={"theme":"css-variables"}
// naive.config.ts — declare the role once; `naive up` registers it
import { defineProject, kit, skills } from "@usenaive-sdk/iac";

export default defineProject({
  project: "acme",
  kits: {
    sdr: kit({
      instructions: "Research prospects and draft outreach for one customer.",
      can: [skills.search, skills.email],
      limits: { budget: "$50/mo" },
    }),
  },
});
```

```ts theme={"theme":"css-variables"}
// your app — instantiate per child project, at run time
const instance = await naive.forProject("acme").forChild(childId).provision("sdr");
// instance.key is the instance-scoped API key — present ONCE, on this response.
```

A kit is "declare now, instantiate later": `naive up` registers the role and provisions
nobody; each `provision("<kit>")` stamps one governed instance for one child project.
The deprecated top-level `agents:` block has always meant exactly this and compiles to
byte-for-byte the same output — `naive up` prints a rename notice for it, and declaring
one name in both blocks is refused at define time (`kit_and_agent_duplicate`). Details:
[Account kits in the config](/docs/getting-started/iac#account-kits-in-the-config).

## CLI First

```bash theme={"theme":"css-variables"}
naive account-kits create --name Pro \
  --mode allowlist --toolkits gmail,slack,stripe \
  --tool gmail.enable=GMAIL_FETCH_EMAILS,GMAIL_SEND_EMAIL \
  --custom-auth gmail=ac_brand_gmail

naive account-kits list
naive account-kits assign <kit_id> <user_id>
```

## Tools

| Tool                       | Type       | Description                                   |
| -------------------------- | ---------- | --------------------------------------------- |
| `account_kits_list`        | Core       | List all kits in the workspace                |
| `account_kits_create`      | Core       | Create a policy template                      |
| `account_kits_get`         | Core       | Fetch a single kit                            |
| `account_kits_update`      | Core       | Edit primitives, connections, or governance   |
| `account_kits_delete`      | Management | Delete a kit (users must be reassigned first) |
| `account_kits_assign_user` | Management | Assign a tenant user to a kit                 |

## Creating a Kit

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/account-kits \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Pro",
      "primitives_config": {
        "cards": { "enabled": true },
        "email": { "enabled": true },
        "vault": { "enabled": true },
        "social": { "enabled": false }
      },
      "connections_config": {
        "mode": "allowlist",
        "toolkits": ["gmail", "slack", "stripe"],
        "tools": { "gmail": { "enable": ["GMAIL_FETCH_EMAILS", "GMAIL_SEND_EMAIL"] } },
        "custom_auth_configs": { "gmail": "ac_brand_gmail" }
      }
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const kit = await naive.accountKits.create({
    name: "Pro",
    primitives_config: {
      cards: { enabled: true },
      email: { enabled: true },
      vault: { enabled: true },
      social: { enabled: false },
    },
    connections_config: {
      mode: "allowlist",
      toolkits: ["gmail", "slack", "stripe"],
      tools: { gmail: { enable: ["GMAIL_FETCH_EMAILS", "GMAIL_SEND_EMAIL"] } },
    },
  });
  await naive.accountKits.assignUser(kit.id, alice.id);
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "4273359a-7a80-460c-a93f-f49f9058fd23",
  "name": "Pro",
  "is_default": false,
  "primitives_config": { "cards": { "enabled": true }, "email": { "enabled": true } },
  "connections_config": { "mode": "allowlist", "toolkits": ["gmail", "slack", "stripe"] }
}
```

## Connection modes

| Mode        | Behavior                                                   |
| ----------- | ---------------------------------------------------------- |
| `open`      | No filter — every third-party app available (the default). |
| `allowlist` | Only the listed `toolkits` can be connected.               |
| `blocklist` | Every app **except** the listed ones.                      |

Per-tool filters (`tools.<app>.enable` / `.disable`) and white-label
`custom_auth_configs` are optional.

<Info>
  **Discovering app slugs:** browse the full third-party app catalog with
  [`GET /v1/toolkits`](/docs/api-reference/connections/catalog) (`?search=`). The dashboard's
  Account Kit editor uses this endpoint to power a searchable allow/block picker.
</Info>

## Governance — require approval

Each gated primitive accepts `requiresApproval`, and connections accept
`requiresApproval` / `approvalToolkits`. When on, the agent's sensitive action is frozen
for a human to [approve](/docs/getting-started/approvals) before it runs.

```json theme={"theme":"css-variables"}
{
  "primitives_config": {
    "cards":   { "enabled": true, "requiresApproval": true },
    "domains": { "enabled": true, "requiresApproval": true }
  },
  "connections_config": { "mode": "open", "requiresApproval": false, "approvalToolkits": ["stripe"] }
}
```

Cards, domains, verification, formation, and connecting services default to requiring
approval for agent calls; set `requiresApproval: false` to opt out. Calls on the
account's own **default** agent profile execute without approval.

## Error Handling

| Error              | Cause                                            | Recovery                                           |
| ------------------ | ------------------------------------------------ | -------------------------------------------------- |
| `invalid_input`    | Malformed `mode`/`toolkits`, or unknown app slug | Use a valid mode and slugs from `GET /v1/toolkits` |
| `duplicate_record` | A kit with this name already exists              | Pick a different name                              |
| `forbidden`        | Trying to delete a kit with users still assigned | Reassign those users first                         |
| `not_found`        | `kit_id` doesn't exist in this workspace         | Use `GET /v1/account-kits`                         |

## Typical Workflow

```
Define a tier once, apply it to many users
    │
    ├─ POST /v1/account-kits                 → Create "Pro" (allowlist gmail/slack/stripe)
    │   → kit_id: 4273359a-...
    │
    ├─ POST /v1/account-kits/4273359a.../users/{user_id}/assign   → Assign Alice
    │
    └─ Alice's connections + primitives are now governed by "Pro"
        (connecting Notion is blocked; connecting Gmail is allowed)
```
