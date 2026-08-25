> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# use

> Set the active tenant user (child project) and project for CLI commands.

`naive use` sets the active subject — the **child project** every primitive command
targets until changed. Stored as `active_user_id` in `~/.naive/config.json` (mode `0600`).

```bash theme={"theme":"css-variables"}
naive use <user_id>      # activate a user — echoes the id it stored
naive use --clear        # reset to the api key's default user

# A child project is addressed inside a project, so both can be set in one breath:
naive use <user_id> --project <project_id>
```

The project half is the same write [`naive projects use`](/docs/cli/projects) makes, and is
validated before it is persisted. With no project named, commands act in the
organization's default project — where every child project created before projects existed
already lives. `--project <id>` is also a **global** flag: on any command it selects the
project for that one invocation without changing the persisted selection.

<Note>
  **No command reads the active user back.** `naive whoami` returns only the agent and company
  (`/v1/auth/me` carries no subject field), and `naive config show` returns only `output` and
  `base_url`. `naive use <id>` echoing the id when you set it is the only confirmation there is.
  If it matters which subject a command acts on, set it explicitly in the same shell rather than
  relying on what a previous session left behind.
</Note>

## How the subject is resolved

In order, first match wins:

1. `--user <id>` — **only on the commands that declare it** (see below).
2. `NAIVE_ACTIVE_USER_ID` — the environment variable a hosted agent's container is given. A
   containerised agent has no `~/.naive/config.json`, so this is how it gets a subject.
3. `active_user_id` from `~/.naive/config.json`, i.e. whatever `naive use` last set.
4. Otherwise the API key's own default user.

The project resolves the same way, and independently: `--project <id>` on any command,
then `active_project_id` from the config file (`naive use --project` / `naive projects
use`), then the key's pinned project, then the organization's default project. It travels
as the `X-Naive-Project-Id` header.

<Warning>
  **`--user` is not a global flag.** There is no `--user` on `naive`, and adding it to a command
  that does not declare it is an error, not a no-op:

  ```bash theme={"theme":"css-variables"}
  naive cards list --user alice
  # → {"success": false, "error": {"code": "invalid_input", "message": "unknown option '--user'"}}
  ```

  `--user <id>` exists on exactly these commands: `agent-profiles provision`, every
  [`approvals`](/docs/cli/approvals) subcommand, every [`connections`](/docs/cli/connections) subcommand,
  every [`vault`](/docs/cli/vault) subcommand, `env status` / `promote` / `reset`,
  [`logs tail` / `logs all`](/docs/cli/logs), every [`loops`](/docs/cli/loops) subcommand, `module add`,
  and `mobile proxy-set`.

  For everything else — `cards`, `email`, `phone`, `trading`, `payments`, `wallet` and the rest —
  select the subject first with `naive use <id>`, or export `NAIVE_ACTIVE_USER_ID`:

  ```bash theme={"theme":"css-variables"}
  naive use alice_user_id && naive cards list
  NAIVE_ACTIVE_USER_ID=bob_id naive cards list      # one-off, no config write
  ```
</Warning>

## Which commands are subject-scoped

Selecting a subject rewrites the request path for the primitives that have per-user routes:
`cards`, `phone`, `trading`, `email`, `domains`, `verification`, `formation`, `social`,
`compute`, `queue`, `mobile`, `wallet` and `payments`. `wallet` and `payments` have **no**
company-level route at all, so they are always subject-scoped — with no selection they resolve
to the API key's default user.

Isolation is what this buys you: the subject's Account Kit (its `can:` and `limits:`) is only
enforced on the per-user route, so a command that was not rewritten would have been governed by
the company's kit rather than the tenant's.
