> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Multi-tenancy

> How Naïve models organizations, projects, agent profiles (per-tenant bundles), and AccountKits.

Naïve gives every agent its own governed real-world **agent profile**, per tenant. The
model has four layers:

```
organization              ← you, the developer who signed up (holds API keys)
  └── project             ← a scope inside it; every org has a default one
        ├── AccountKit    ← policy template (what an agent profile can do)
        └── child project ← one governed real-world bundle PER TENANT
              └── identity + card + comms (+ runtime), governed as one unit
```

* **Organization** — your account / workspace. Created on signup. Holds API keys,
  projects, and AccountKits. (Earlier code/docs called the per-tenant bundle below an
  "operator"; it's now an **agent profile**. The paying account is the *organization* —
  physically still a `companies` row, and `/v1/company` still answers.)
* **Project** — a scope inside the organization, owning its AccountKits and child
  projects. Additive: every organization has a **default project**, and a call that
  names none resolves to it, so single-scope usage is unchanged. See
  [Projects](/docs/architecture/projects).
* **AccountKit** — a reusable policy template. Defines which native primitives are
  enabled, spend caps, approvals, and which third-party apps an agent profile may connect.
  It is the policy half of the [governance gateway](/docs/architecture/governance-gateway).
  See [AccountKits](/docs/architecture/account-kits).
* **agent profile** (a **child project**) — *one per tenant*. The governed real-world bundle (verified
  identity/EIN, a spend-capped card, comms, optional runtime). Backed by a
  `tenant_user` record (NOT an auth subject — it never signs in). Every card, inbox,
  vault entry, and connection belongs to exactly one agent profile. Provision with
  `forUser(id).provision(role)`; revoke with `agentProfile.revoke()`. See
  [Agent Profiles](/docs/getting-started/agent-profiles).

## Dual mode

The product works two ways from one API key:

**Solo developer** — plugging Naive into your own agent. On signup you get a Default
AccountKit and a default tenant\_user. The CLI, MCP, and SDK all act on that default
user with zero extra setup.

**Multi-tenant SaaS** — embedding Naïve in your app. Provision one agent profile per
signup (`naive.forUser(id).provision(role)`), then scope every call to that
tenant (`naive.forUser(id)` in the SDK, `--user` in the CLI, the `user_id` arg in
MCP, `/v1/users/:user_id/...` in REST). The same call, a million times — cheap API
calls, never per-tenant infrastructure provisioning — so cost and safety stay flat from tenant 1 to 1,000,000.

When one organization needs more than one scope, put the tenant in a project:
`naive.forProject(p).forChild(id)`, `--project` in the CLI, `project_id` in MCP,
`/v1/projects/:project_id/users/:user_id/...` (or the `X-Naive-Project-Id` header) in
REST. Every form above without a project is that form inside the default project.

The mechanism that makes both work: when no explicit user is supplied, the request
resolves to the API key's default tenant\_user — unless the key is **sealed**, in which
case the seal wins and a mismatching id is refused. See
[Subject resolution](/docs/architecture/subject-resolution).

<Warning>
  **The default tenant\_user is not approval-gated.** In solo-developer mode you are acting
  as the company default, and the approvals gate deliberately skips that subject (you are
  the approver, so parking an action on a queue only you can clear helps nobody). Sensitive
  actions that would return `202 pending_approval` for a real tenant execute immediately
  here. Gating turns on the moment you scope calls to a provisioned tenant user — see
  [Approvals](/docs/architecture/approvals).
</Warning>

## Where teams fit

An **agent profile** is a per-tenant *bundle of real-world capability* — identity, card,
comms, vault. A **team** is a per-tenant *unit of work* — a lead, its agents, and the
edges between them, addressed as the pair `(team, tenant)`. They are different axes, and
both are per-tenant: a tenant can have an agent profile and be the tenant of a team.

New work is declared as a team on `runtime.durable()`. The profile model above is not
deprecated and is what holds the regulated bundle; the legacy `runtime.pool()` half of it
is frozen. See [the durable runtime](/docs/architecture/durable-runtime).
