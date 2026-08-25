> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Apps

> Manage web applications — create, deploy, publish, and configure managed apps with optional managed backends.

## Overview

| Command                                          | Description                                                                           | Cost |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ---- |
| `naive apps list`                                | List all apps                                                                         | Free |
| `naive apps create`                              | Create a new app (provisions managed hosting + optional managed backend)              | Free |
| `naive apps templates`                           | List starter templates (GitHub repo + clone commands)                                 | Free |
| `naive apps show <id>`                           | View app details                                                                      | Free |
| `naive apps delete <id>`                         | Delete app and all infrastructure                                                     | Free |
| `naive apps deploy <id> [--dir <path>]`          | Deploy — uploads your local project, or deploys the agent workspace inside containers | Free |
| `naive apps publish <id>`                        | Promote deployment to production                                                      | Free |
| `naive apps deployments <id>`                    | List deployment history                                                               | Free |
| `naive apps retry <id>`                          | Retry failed provisioning (no-op success if already healthy)                          | Free |
| `naive apps secrets list <id>`                   | List environment variable keys                                                        | Free |
| `naive apps secrets set <id> <KEY> <VALUE>`      | Set environment variable (synced to the app environment)                              | Free |
| `naive apps secrets delete <id> <KEY>`           | Delete environment variable (removed from the app environment)                        | Free |
| `naive apps secrets reveal <id> <KEY>`           | Reveal variable value                                                                 | Free |
| `naive apps domains list <id>`                   | List app domains                                                                      | Free |
| `naive apps domains add <id> <domain>`           | Add custom domain                                                                     | Free |
| `naive apps domains remove <id> <domainId>`      | Remove domain                                                                         | Free |
| `naive apps domains set-primary <id> <domainId>` | Set primary production domain                                                         | Free |
| `naive apps domains connect <id> <domainId>`     | Connect company domain (system: platform writes DNS)                                  | Free |
| `naive apps domains disconnect <id> <domainId>`  | Disconnect domain                                                                     | Free |
| `naive apps domains verify-dns <id> <domainId>`  | Verify **app HTTP** DNS (not email)                                                   | Free |
| `naive apps db tables <id>`                      | List database tables (fullstack)                                                      | Free |
| `naive apps db query <id> "<sql>"`               | Run SQL query (fullstack)                                                             | Free |
| `naive apps vercel <id> <method> <path>`         | Call any hosting REST API operation (scoped)                                          | Free |
| `naive apps supabase <id> <method> <path>`       | Call any backend management API operation (scoped)                                    | Free |

## How It Works

Each app runs on managed infrastructure, provisioned via the Naive API. When you create an app:

1. **Managed hosting** is provisioned in the Naive org (Next.js framework)
2. For `fullstack` apps, a **managed backend** is also provisioned (PostgreSQL, auth, storage, edge functions)
3. A production domain is assigned (e.g., `naive-myapp-abc123.vercel.app`)
4. The response includes a `template` block — the GitHub clone command for the starter template. If the company has an agent container, a dedicated engineer agent is also provisioned with the template scaffolded into its workspace.

Apps are **fully standalone** — you can create, build, and deploy without any orchestration. `naive apps deploy` uploads your local project directory when run on your own machine; inside agent containers it deploys the agent's workspace.

The curated commands above cover the common path, and the `vercel` / `supabase` proxy commands cover **everything else the underlying platforms support**.

## Typical Workflow (Direct)

```bash theme={"theme":"css-variables"}
# 1. Create the app — returns the template clone command
naive apps create --name "My Landing Page" --type frontend_only

# 2. Clone the starter template and build locally
git clone https://github.com/usenaive/app-dev-templates naive-app
cd naive-app/frontend_only/dark-premium
# ... customize ...

# 3. Deploy from the project directory (uploads your code)
naive apps deploy <app-id>
# → Returns preview URL + deployment ID

# 4. Promote to production
naive apps publish <app-id> --deployment <deployment-id>
# → Live at naive-my-landing-page-xxx.vercel.app

# 5. Attach company domain (system *.usenaive.ai: the platform writes DNS — do not edit the zone)
naive apps domains connect <app-id> <domain-id>
naive apps domains verify-dns <app-id> <domain-id>
```

In orchestrated mode (CEO/engineer agents), the same commands run inside the agent container and deploy from the agent workspace automatically.

***

## Create App

```bash theme={"theme":"css-variables"}
naive apps create --name "My App" --type fullstack
naive apps create --name "Landing Page" --type frontend_only --description "Marketing site" --variant clean-minimal
```

### Options

| Flag                      | Required | Description                                                                               |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `--name <name>`           | Yes      | App display name                                                                          |
| `--type <type>`           | No       | `frontend_only` (default) or `fullstack`. Any other value is refused.                     |
| `--variant <variant>`     | No       | Starter template variant: `dark-premium`, `clean-minimal`, `bold-energetic`, `warm-human` |
| `--description <desc...>` | No       | Short description. Variadic — unquoted multi-word text is joined with spaces              |

***

## Deploy

```bash theme={"theme":"css-variables"}
# Direct mode — run inside your project directory (or pass --dir)
naive apps deploy <app-id>
naive apps deploy <app-id> --dir ./my-project

# Orchestrated mode — inside agent containers
naive apps deploy <app-id> --workspace-path agents/<agent-id>
```

Outside a container, the CLI packs your project directory (excluding `node_modules`, `.next`, `.git`) into a tarball and uploads it through the Naive API — max 30 MB gzipped. Inside an agent container, the agent's workspace is deployed instead (auto-detected from the current directory). Returns the deployment ID and preview URL.

### Options

| Flag                      | Required | Description                                                                             |
| ------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `--dir <path>`            | No       | Local project directory to upload (default: current directory when outside a container) |
| `--workspace-path <path>` | No       | Container workspace path override (orchestrated mode)                                   |

## Templates

```bash theme={"theme":"css-variables"}
naive apps templates
```

Lists every starter template with its GitHub path and a ready-to-run clone command. Templates live at [github.com/usenaive/app-dev-templates](https://github.com/usenaive/app-dev-templates).

***

## Publish

```bash theme={"theme":"css-variables"}
naive apps publish <app-id> --deployment <deployment-id>
```

Waits for the build to be ready, then aliases the deployment to the production domain.

### Options

| Flag                | Required | Description              |
| ------------------- | -------- | ------------------------ |
| `--deployment <id>` | Yes      | Deployment ID to promote |

***

## Secrets

Secrets are stored encrypted by Naive and synced to the app's environment variables. Redeploy after changes for them to take effect.

```bash theme={"theme":"css-variables"}
# Set a variable (creates or updates)
naive apps secrets set <app-id> API_KEY sk_live_xxx --target production

# List keys
naive apps secrets list <app-id>

# Reveal value
naive apps secrets reveal <app-id> API_KEY --target production

# Delete (also removed from the app environment)
naive apps secrets delete <app-id> API_KEY --target preview
```

### Options (set/delete/reveal)

| Flag                | Required                          | Description                                                                                                   |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `--target <target>` | `set`/`delete`: Yes. `reveal`: No | `preview` or `production`. `reveal` defaults to `production`; any other value is refused rather than coerced. |

`NEXT_PUBLIC_APP_URL` (all apps) and `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fullstack) are provisioned automatically.

***

## Domains

```bash theme={"theme":"css-variables"}
# Add custom domain (attached to the app; point DNS at the app)
# Must be a real public domain — .test/.example/.invalid/.localhost are refused,
# and the app must already have a hosting project linked.
naive apps domains add <app-id> myapp.com

# Connect a company domain (from naive domains)
naive apps domains connect <app-id> <domain-id>

# Verify DNS
naive apps domains verify-dns <app-id> <domain-id>

# Choose which domain production publishes to
naive apps domains set-primary <app-id> <app-domain-id>

# Remove
naive apps domains remove <app-id> <domain-id>
```

***

## Database (Fullstack Only)

```bash theme={"theme":"css-variables"}
# List tables with row counts
naive apps db tables <app-id>

# Run a query (SELECT, DML, and DDL all supported)
naive apps db query <app-id> "SELECT * FROM users ORDER BY created_at DESC LIMIT 10"
```

Unquoted SQL also works — the remaining arguments are joined with spaces — but
quoting is safer: your shell will otherwise expand `*`, `;` and friends before
the CLI ever sees them.

Only available for apps created with `--type fullstack`. Queries run against the app's managed PostgreSQL database with admin privileges via the backend management API. While the backend is still being provisioned the query returns `job_not_ready` (409) — poll `naive apps show <id>` until the backend link appears.

***

## Direct Provider Access (Advanced)

Anything the underlying [hosting REST API](https://vercel.com/docs/rest-api) or [backend management API](https://supabase.com/docs/reference/api) supports can be called through the scoped proxies — Naive injects the credentials and restricts each call to the app's own project:

```bash theme={"theme":"css-variables"}
# Hosting: deployments, build logs, project settings, env vars, domains, ...
naive apps vercel <app-id> GET v6/deployments
naive apps vercel <app-id> GET "v3/deployments/<deployment-id>/events"
naive apps vercel <app-id> PATCH "v9/projects/<project-id>" --body '{"buildCommand":"next build"}'

# Backend: auth config, storage, edge functions, migrations, secrets, ...
naive apps supabase <app-id> GET "v1/projects/<ref>/config/auth"
naive apps supabase <app-id> PATCH "v1/projects/<ref>/config/auth" --body '{"site_url":"https://myapp.com"}'
naive apps supabase <app-id> POST "v1/projects/<ref>/database/query" --body '{"query":"select 1"}'
```

### Options

| Flag            | Required | Description       |
| --------------- | -------- | ----------------- |
| `--body <json>` | No       | JSON request body |

The project ID / ref are shown by `naive apps show <id>`. Deleting the underlying project through the proxies is blocked — use `naive apps delete`. See the [hosting proxy](/docs/api-reference/apps/vercel-proxy) and [backend proxy](/docs/api-reference/apps/supabase-proxy) references for full scoping rules.

***

## Retry Provisioning

```bash theme={"theme":"css-variables"}
naive apps retry <app-id>
```

Re-creates the managed hosting and/or backend if provisioning previously failed (e.g., network timeout, rate limit). Already-linked infrastructure is untouched, and calling it on a healthy app returns `status: "noop"` rather than an error — it is safe to retry.

Backend re-provisioning runs in the background: the response reports `supabase: "provisioning"` and the app is only usable once `naive apps show <id>` shows the backend link. See [`POST /v1/apps/:id/retry`](/docs/api-reference/apps/retry).

***

## Delete App

```bash theme={"theme":"css-variables"}
naive apps delete <app-id>
```

Permanently deletes the app, its hosting project, its backend (if fullstack), all secrets, domains, and archives the dedicated engineer agent.
