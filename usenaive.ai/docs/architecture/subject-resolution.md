> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Subject resolution

> How Naive resolves which tenant user a request acts on — and the cross-tenant guard.

Every data-plane request resolves a **subject tenant\_user** — the *child project* it
acts on — before doing anything. It resolves a **project** in the same pass; see
[Projects](/docs/architecture/projects) for that half.

## Resolution order

**A sealed key is pinned to its seal.** That is the first rule, and it outranks the
request:

1. **The API key's `active_tenant_user_id`, if the key has one.** A key sealed to an
   agent profile at creation *is* that subject. A `:user_id` or `X-Naive-User-Id` on the
   request may only **agree** with the seal — disagreeing is a **403
   `key_subject_mismatch`**, never a redirect to the named user.
2. Explicit `:user_id` in the path (`/v1/users/:user_id/...`) — for an **un-sealed**
   (workspace-wide) key or a signed-in session.
3. `X-Naive-User-Id` header — same callers, same validation. **Also on the MCP
   connect**, which has no path to put a `:user_id` in; it is resolved once when the
   session opens and fixes the subject for the tool list, the kit gate and every tool
   call on that session (see [MCP connection](/docs/mcp/connection)).
4. The company's default tenant\_user (auto-created on signup).

The project is resolved alongside it, by the same rules in the same order: an explicit
`/v1/projects/:project_id/...`, the `X-Naive-Project-Id` header, the key's pinned
`active_project_id`, then the organization's default project. A pinned key is
authoritative exactly as a sealed key is — a disagreeing project id is a **403
`key_project_mismatch`**.

The sentinels `default` and `me` mean "the caller's own subject". Under a sealed key they
resolve to the seal; otherwise to the company default.

<Warning>
  The seal being authoritative is a **security property, not an ordering preference**.
  Consulting the caller-supplied id first — the order this page used to describe — let an
  agent holding a key sealed to its own profile name a *different* tenant\_user in the path
  and be handed that subject, and therefore that subject's AccountKit. Every
  `/v1/users/:user_id/*` mount takes its gate from the resolved subject, so a narrow sealed
  key could borrow the owner's Default kit (which enables every primitive) and walk through
  the policy the seal exists to enforce. If you are reading an older copy of this page, that
  copy is describing a bug.
</Warning>

## Cross-tenant guard (the ballgame)

After picking a candidate user, the resolver asserts:

```
resolved_tenant_user.company_id === api_key.company_id     // same organization
resolved_tenant_user.project_id === resolved_project.id    // same project
```

If either doesn't match, the request returns **404 — not 403**. The existence of another
company's — or another project's — user is itself information we never leak.

A tenant\_user whose `project_id` is `NULL` belongs to the organization's **default**
project: the column is nullable so that nothing writing these tables has to know about
projects yet, and a NULL row is the default's, never a second project's.

`X-Naive-User-Id` is treated as **untrusted input** — validated against the key's
company exactly like a path param, never as an identity assertion. An **un-sealed**
workspace-wide key can target any user *in its own company*, never another company's; a
**sealed** key can target only its own seal (see the resolution order above).

Ids are also shape-checked: a malformed (non-uuid) `:user_id` / `X-Naive-User-Id` /
resource id returns a clean **404**, never a `500` from the database rejecting the uuid
cast. (`default`/`me` sentinels are exempt — they resolve before the check.)

Every handler that loads a resource by id (card, inbox, vault entry, connection, ...)
additionally passes it through `assertSameCompany(resource, req)` so a forged resource
id from another tenant 404s.

## Key scope — three independent columns

A key narrows in three separate ways, and they are different columns on `agent_api_keys`:

| Column                  | Unset                                                                              | Set                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `account_kit_id`        | **Workspace-wide** — may target any user in the company.                           | **Kit-scoped** — locked to one AccountKit.                                                      |
| `active_tenant_user_id` | **Un-sealed** — the subject comes from the request, else the company default.      | **Sealed** — this key *is* that tenant\_user. A disagreeing path/header id is a **403**.        |
| `active_project_id`     | **Un-pinned** — the project comes from the request, else the organization default. | **Pinned** — this key acts only inside that project. A disagreeing path/header id is a **403**. |

All three are bounded by the company. That boundary is the entire premise of tenant
isolation, so the guard runs on every request — not as an afterthought.

<Note>
  Per-agent-profile keys minted at provision time are **sealed**. The company key issued on
  signup is not. This is why `naive.forUser(id)` works from a company key and is refused
  from an agent's own key pointed at a different tenant.
</Note>
