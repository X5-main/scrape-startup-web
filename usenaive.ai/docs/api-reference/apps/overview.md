> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Apps Overview

> Web application management — managed Next.js apps with optional managed backends.

The Apps API provides full lifecycle management for managed web applications. Each app is backed by managed **hosting**; `fullstack` apps additionally get a dedicated **managed backend** (PostgreSQL, auth, storage, edge functions). Naive owns the underlying credentials and injects them into every call.

Apps can be `frontend_only` (static/Next.js) or `fullstack` (Next.js + managed backend).

Apps are **fully standalone** — no agent orchestration required. Build locally from a [starter template](/docs/api-reference/apps/templates) and deploy by uploading your project; or, when the company has an agent container, let engineer agents build and deploy from their workspaces.

## Capability Model

Two layers of access:

1. **Lifecycle endpoints** — curated, opinionated operations for the common path: create, deploy, publish, secrets, domains, database queries.
2. **Provider proxies** — generic passthrough to the underlying [hosting REST API](https://vercel.com/docs/rest-api) and [backend management API](https://supabase.com/docs/reference/api), scoped to the app's own project. Anything those APIs support — build logs, project settings, auth config, storage, edge functions, migrations — works through the proxies.

## Endpoints

| Method   | Path                                         | Description                                                                                            |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `GET`    | `/v1/apps`                                   | List all apps                                                                                          |
| `POST`   | `/v1/apps`                                   | Create a new app                                                                                       |
| `GET`    | `/v1/apps/templates`                         | List starter templates (GitHub clone commands)                                                         |
| `GET`    | `/v1/apps/:id`                               | Get app details                                                                                        |
| `DELETE` | `/v1/apps/:id`                               | Delete an app                                                                                          |
| `POST`   | `/v1/apps/:id/deploy`                        | Deploy — tarball upload (direct) or workspace (orchestrated)                                           |
| `POST`   | `/v1/apps/:id/publish`                       | Promote to production                                                                                  |
| `GET`    | `/v1/apps/:id/deployments`                   | List deployments                                                                                       |
| `POST`   | `/v1/apps/:id/retry`                         | Retry failed provisioning                                                                              |
| `GET`    | `/v1/apps/:id/secrets`                       | List secret keys                                                                                       |
| `POST`   | `/v1/apps/:id/secrets`                       | Set a secret (synced to the app environment)                                                           |
| `DELETE` | `/v1/apps/:id/secrets/:key`                  | Delete a secret (removed from the app environment)                                                     |
| `GET`    | `/v1/apps/:id/secrets/:key/reveal`           | Reveal secret value                                                                                    |
| `GET`    | `/v1/apps/:id/domains`                       | List domains                                                                                           |
| `POST`   | `/v1/apps/:id/domains`                       | Add custom domain                                                                                      |
| `DELETE` | `/v1/apps/:id/domains/:domainId`             | Remove domain                                                                                          |
| `POST`   | `/v1/apps/:id/domains/:domainId/set-primary` | Set primary production domain                                                                          |
| `POST`   | `/v1/apps/:id/connect-domain`                | Connect company domain                                                                                 |
| `DELETE` | `/v1/apps/:id/connect-domain/:domainId`      | Disconnect company domain                                                                              |
| `POST`   | `/v1/apps/:id/verify-domain-dns`             | Verify DNS                                                                                             |
| `POST`   | `/v1/apps/:id/db/query`                      | Run SQL query (fullstack)                                                                              |
| `GET`    | `/v1/apps/:id/db/tables`                     | List tables (fullstack)                                                                                |
| `ANY`    | `/v1/apps/:id/vercel/proxy/*`                | [Hosting API passthrough](/docs/api-reference/apps/vercel-proxy) (scoped to the app's project)              |
| `ANY`    | `/v1/apps/:id/supabase/proxy/*`              | [Backend management API passthrough](/docs/api-reference/apps/supabase-proxy) (scoped to the app's project) |
| `ANY`    | `/v1/apps/:id/db/rest/*`                     | REST passthrough (fullstack, service-role key injected)                                                |
| `ANY`    | `/v1/apps/:id/storage/proxy/*`               | Storage passthrough (fullstack)                                                                        |
| `ANY`    | `/v1/apps/:id/auth/proxy/*`                  | Auth service passthrough (fullstack)                                                                   |
| `ANY`    | `/v1/apps/:id/functions/proxy/*`             | Edge Functions invoke passthrough (fullstack)                                                          |

## Capability Primitives

A fullstack app's managed backend is also exposed as four first-class primitives, each a curated surface over these proxies (and individually gateable in Account Kits):

* [Database](/docs/api-reference/database/overview) — SQL, REST CRUD, migrations
* [Storage](/docs/api-reference/storage/overview) — buckets & objects
* [Edge Functions](/docs/api-reference/functions/overview) — list, deploy, invoke
* [Auth](/docs/api-reference/auth/overview) — auth config & admin users

## Per-User Scoping

All routes are also mounted under `/v1/users/:user_id/apps` for multi-tenant setups. On the per-user mount, the subject's Account Kit must enable the `apps` primitive, and every `:id` route verifies the app belongs to that user.

## Authentication

All endpoints require either a session cookie or a Bearer API key:

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/apps \
  -H "Authorization: Bearer nv_sk_live_..."
```
