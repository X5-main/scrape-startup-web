> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Users

> Tenant users — the end-users you provision Naive resources for. Every primitive (cards, inboxes, vault, connections) is scoped to a tenant user.

A **tenant user** — a **child project** in the product vocabulary — is one of *your*
end-users. Every primitive — cards, inboxes, vault,
connections, verification, formation — is scoped to a tenant user, so each of your
customers gets their own isolated set of Naive resources. Tenant users are **not** auth
subjects: they never sign in, and you manage them entirely through the API/SDK/CLI.

On signup you automatically get a **default** tenant user, so solo usage needs no
`users.create()` — every top-level call (`naive.cards`, `naive.vault`, …) acts on it.
Multi-tenant builders create one tenant user per end-user and scope calls with
`naive.forUser(id)`.

Every tenant user lives in a [project](/docs/getting-started/projects). Name none and you get
the organization's default project, which is where all of the calls on this page land —
`naive.forUser(id)` is `naive.forProject("default").forChild(id)`. To work in another
project, use `naive.forProject(p).childProjects`, `--project <p>` in the CLI, or
`/v1/projects/:project_id/users/...` in REST.

## CLI First

```bash theme={"theme":"css-variables"}
# Create a tenant user and make them the active CLI subject
naive users create --external-id alice_db_uuid --email alice@example.com --label "Alice"
naive users list
naive use <user_id>          # every subsequent command targets this user
naive use <user_id> --project <project_id>   # …in a non-default project
```

## Tools

| Tool           | Type       | Description                                            |
| -------------- | ---------- | ------------------------------------------------------ |
| `users_list`   | Core       | List all tenant users in the workspace                 |
| `users_create` | Core       | Provision a new tenant user                            |
| `users_get`    | Core       | Fetch a single tenant user                             |
| `users_update` | Core       | Update label, email, metadata, or assigned Account Kit |
| `users_delete` | Management | Remove a tenant user and their scoped resources        |

## Creating a User

Each user is governed by an [Account Kit](/docs/getting-started/account-kits). Omit
`account_kit_id` to use your workspace's Default kit.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "external_id": "alice_db_uuid", "email": "alice@example.com", "label": "Alice" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";
  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY });

  const alice = await naive.users.create({
    external_id: "alice_db_uuid",
    email: "alice@example.com",
    label: "Alice",
  });
  // Scope any primitive to this user:
  await naive.forUser(alice.id).cards.create({ name: "Ads", spendingLimitCents: 25000 });
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "90a734a7-5f5a-4c4f-ba8f-80f770971d16",
  "external_id": "alice_db_uuid",
  "email": "alice@example.com",
  "label": "Alice",
  "status": "active",
  "account_kit_id": "4273359a-7a80-460c-a93f-f49f9058fd23",
  "is_default": false,
  "created_at": "2026-06-04T06:45:36Z"
}
```

### Parameters

| Param            | Type   | Required | Default     | Description                                                          |
| ---------------- | ------ | -------- | ----------- | -------------------------------------------------------------------- |
| `external_id`    | string | No       | —           | Your own stable id for this user (e.g. your DB row id)               |
| `email`          | string | No       | —           | The end-user's email                                                 |
| `label`          | string | No       | —           | Human-friendly display name                                          |
| `account_kit_id` | string | No       | Default kit | The [Account Kit](/docs/getting-started/account-kits) governing this user |
| `metadata`       | object | No       | —           | Arbitrary JSON you can attach                                        |

<Info>
  The `default` tenant user is created on signup and can't be deleted. Reference it as the
  sentinel `default` (e.g. `/v1/users/default/vault`) or via its id.
</Info>

## Listing & Fetching

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const { users } = await naive.users.list();
  const alice = await naive.users.get(userId);
  ```
</CodeGroup>

## Updating & Deleting

```bash theme={"theme":"css-variables"}
# Reassign a user to a different Account Kit
curl -X PATCH https://api.usenaive.ai/v1/users/{user_id} \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{ "account_kit_id": "kit-uuid" }'

# Delete a user
curl -X DELETE https://api.usenaive.ai/v1/users/{user_id} \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Error Handling

| Error              | Cause                                                            | Recovery                                            |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------------- |
| `not_found`        | `user_id` doesn't exist in this workspace (or a cross-tenant id) | Use `GET /v1/users` to list valid ids               |
| `invalid_input`    | Malformed `account_kit_id` / `user_id`                           | Pass a valid UUID, or omit to use the Default kit   |
| `duplicate_record` | `external_id` already exists                                     | Reuse the existing user or pick a new `external_id` |

## Typical Workflow

```
Your app signs up a new customer "Alice"
    │
    ├─ POST /v1/users                       → Provision her tenant user
    │   { external_id: "alice_db_uuid" }
    │   → id: 90a734a7-...
    │
    ├─ POST /v1/users/90a734a7.../connections/connect   → Connect Gmail for her
    ├─ PUT  /v1/users/90a734a7.../vault/openai_key       → Store her secret
    └─ POST /v1/users/90a734a7.../cards                  → Issue her a card
        (all isolated to Alice, governed by her Account Kit)
```
