> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# companies

> naive companies — list the workspaces you can operate in, create another, and switch between them.

A company is a workspace: its own credits, agents, apps, domains and API key.
`naive register` creates your first one. These commands list the rest, create
more, and switch the CLI between them.

| Command                                    | What it does                                  | Cost                         |
| ------------------------------------------ | --------------------------------------------- | ---------------------------- |
| `naive companies` / `naive companies list` | List every company this key can reach         | Free                         |
| `naive companies show`                     | Details of the current company                | Free                         |
| `naive companies create --name <name>`     | Create another company and switch to it       | Free (mints starter credits) |
| `naive companies select <company_id>`      | Switch context; issues a key for that company | Free                         |

## List

```bash theme={"theme":"css-variables"}
naive companies
naive companies list
```

Both forms work. Returns id, name, credit balance and tier for every company
this key can reach.

REST: [`GET /v1/auth/companies`](/docs/api-reference/auth/companies).

## Create

```bash theme={"theme":"css-variables"}
naive companies create --name "Acme Staging"
```

Creates a company, seeds it like a fresh signup (starter credits, default
AccountKit and user, an api-agent and a CEO), issues an API key for it, and
**overwrites `~/.naive/config.json` with that key**. The CLI is now pointed at
the new company; use `naive companies select <id>` to go back.

| Flag            | Required | Description                                |
| --------------- | -------- | ------------------------------------------ |
| `--name <name>` | Yes      | Company display name, minimum 2 characters |

<Warning>
  **This is owner-equivalent authority.** The new company is owned by, billed to,
  and capped against your company's **owner user** — regardless of which API key
  in the company ran the command, because an API key carries no account identity
  for the API to check against. It consumes one of that owner's five company
  slots and mints a starter grant.

  Capped at 5 companies per owner and 3 creates per hour. See
  [`POST /v1/auth/companies`](/docs/api-reference/auth/companies) for the full note.
</Warning>

## Select

```bash theme={"theme":"css-variables"}
naive companies select <company_id>
```

Issues a fresh API key for the target company and saves it. Your previous key
is replaced in the config file, not revoked.

## Errors

| Status | `code`          | Cause                                                                      |
| ------ | --------------- | -------------------------------------------------------------------------- |
| 400    | `invalid_input` | `--name` shorter than 2 characters                                         |
| 403    | `forbidden`     | No active owner user on your company, or the owner is at the 5-company cap |
| 429    | `rate_limited`  | More than 3 creates in an hour                                             |
