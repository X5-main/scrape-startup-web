> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Browser

> Cloud browser sessions, autonomous signup/login, and reusable saved logins — per-user, Account-Kit gated.

All browser routes are **per-tenant-user** and mounted under `/v1/users/:user_id/browser`. The subject is resolved + cross-tenant-guarded, and the `browser` primitive must be enabled in the user's [Account Kit](/docs/architecture/account-kits). Use `default` as the `user_id` to target the workspace's default user.

Auth:

* **Agent-driving** routes (create/navigate/act/extract/observe/screenshot/signup/login/close, save-credential, save-login) require an agent API key (`Authorization: Bearer nv_sk_…`).
* **Human-only** routes (live-view, grant, revoke) require a dashboard session cookie — an agent key is rejected.

`act` and `navigate` require an `Idempotency-Key` header.

## Sessions

### List sessions

```http theme={"theme":"css-variables"}
GET /v1/users/{user_id}/browser/sessions
```

```json theme={"theme":"css-variables"}
{
  "sessions": [
    {
      "session_id": "…",
      "status": "active",
      "allowed_domains": ["example.com"],
      "context_backed": false,
      "credits_consumed": 8.35,
      "created_at": "…",
      "last_used_at": "…",
      "timeout_at": "…",
      "closed_at": null
    }
  ]
}
```

### Create a session

```http theme={"theme":"css-variables"}
POST /v1/users/{user_id}/browser/sessions
```

| Field             | Type      | Notes                                                         |
| ----------------- | --------- | ------------------------------------------------------------- |
| `allowed_domains` | string\[] | Required. Allowlist (default-deny). `["*"]` = unrestricted.   |
| `allow_writes`    | boolean   | Permit write/destructive actions. Default false.              |
| `timeout_minutes` | number    | Hard TTL (default 15, max 30).                                |
| `context_name`    | string    | Reopen a saved login by name (requires a grant).              |
| `human_login`     | boolean   | Open a human first-login session.                             |
| `allow_extract`   | boolean   | On a saved-login session, permit reads.                       |
| `proxy`           | boolean   | Residential proxy egress (requires scoped `allowed_domains`). |

Returns `201` with `{ session_id, status, timeout_at, allow_writes, allowed_domains }`. Opening a session costs 0 credits; a time floor is charged at close.

### Get / close a session

```http theme={"theme":"css-variables"}
GET    /v1/users/{user_id}/browser/sessions/{id}
DELETE /v1/users/{user_id}/browser/sessions/{id}
```

The status view never returns vendor pointers, connect URLs, or live-view links.

## Driving a session

```http theme={"theme":"css-variables"}
POST /v1/users/{user_id}/browser/sessions/{id}/navigate    # { "url": "..." }  (Idempotency-Key)
POST /v1/users/{user_id}/browser/sessions/{id}/act         # { "instruction": "..." } (Idempotency-Key)
POST /v1/users/{user_id}/browser/sessions/{id}/extract     # { "instruction": "..." }
POST /v1/users/{user_id}/browser/sessions/{id}/observe     # { "instruction": "..." }
POST /v1/users/{user_id}/browser/sessions/{id}/screenshot  # → { url, expires_in: 300 }
```

`navigate` enforces the allowlist + an SSRF denylist. `act` rejects write-looking instructions unless the session was created with `allow_writes`. `extract`/`observe`/`screenshot` are read-restricted + redacted on a logged-in (context-backed) session unless opened with `allow_extract`.

`act` returns **200 only if the action actually happened**. If the browser could not perform it — no matching element, or the click did nothing — that is **`502 provider_error`**, not a `200` carrying `success: false`. The page is unchanged, the attempt is still billed, and `details` carries the same `action_taken`, `url`, `credits_used` and `credits_remaining` a success would have returned. Call `observe` to list what is actually actionable on the current page, then retry naming one of those elements.

## Autonomous signup & login

Self-contained: each opens its own write-enabled session scoped to the URL's host, drives the form with the credential filled **server-side** (the password is never sent to the model or returned), and closes the session.

### Signup (approval-gated)

```http theme={"theme":"css-variables"}
POST /v1/users/{user_id}/browser/signup
```

```json theme={"theme":"css-variables"}
{ "service": "figma.com", "url": "https://www.figma.com/signup" }
```

Generates a strong password, stores `{ email, password }` in the user's Vault under `login:<service>`, fills + submits the registration form. **Sensitive:** when the kit requires approval, responds `202` with `{ "status": "pending_approval", "approval_id": "…" }` and runs only after approval. Optional `allowed_domains`, `timeout_minutes`.

### Login

```http theme={"theme":"css-variables"}
POST /v1/users/{user_id}/browser/login
```

```json theme={"theme":"css-variables"}
{ "service": "figma.com", "url": "https://www.figma.com/login" }
```

Reads the vaulted credential for the service and fills + submits the login form. Returns `404` if no credential is stored. Optional `allowed_domains`, `timeout_minutes`.

### Save a credential

```http theme={"theme":"css-variables"}
POST /v1/users/{user_id}/browser/credentials
```

```json theme={"theme":"css-variables"}
{ "service": "figma.com", "email": "agent@my-inbox.usenaive.app", "password": "…", "username": "optional" }
```

Stores a **user-provided** credential in the Vault under `login:<service>` so a later `login` can use it server-side. Use this instead of typing a password into a form via `act` (the value never has to pass through the model). `email` and `password` are required; `username` is optional. Returns `201` with `{ "service": "figma.com", "saved": true }`.

## Saved logins (Tier B)

```http theme={"theme":"css-variables"}
POST   /v1/users/{user_id}/browser/sessions/{id}/context        # save a completed human login (agent)
POST   /v1/users/{user_id}/browser/contexts/{name}/grants       # grant an agent/role access (HUMAN-only)
DELETE /v1/users/{user_id}/browser/contexts/{name}              # revoke + delete the saved login (HUMAN-only)
```

Grant body: `{ "grantee_type": "agent" | "role", "grantee_id": "<agent uuid or role name>" }`. Grants and revocation are human-only (session cookie); an agent key is rejected. Revoke is irreversible and affects every grantee.

## Live view (human-only)

```http theme={"theme":"css-variables"}
GET /v1/users/{user_id}/browser/sessions/{id}/live-view   # → { live_view_url }
```

Returns an embeddable Browserbase live-view URL for an `active`/`in_use` session, generated on demand and never persisted. The URL is unauthenticated and grants control, so it is only served to an authenticated human (dashboard) — never on any agent surface. Embed it in a sandboxed iframe (the dashboard Browser tab does this).
