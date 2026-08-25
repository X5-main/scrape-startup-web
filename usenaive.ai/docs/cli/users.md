> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# users

> Manage tenant users from the CLI.

```bash theme={"theme":"css-variables"}
naive users list
naive users create --external-id alice_db_uuid --email alice@example.com --kit <kit_id>
naive users create --external-id bob_db_uuid --display-name Bob Ops   # --display-name is an alias for --label
naive users get <user_id>
naive users delete <user_id>      # suspend
```

### `users create` options

| Flag                       | Required | Description                                                                                                    |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `--external-id <id>`       | No       | Your own stable id for this user. Unique per company.                                                          |
| `--email <email>`          | No       | User email.                                                                                                    |
| `--label <label>`          | No       | Human-friendly label.                                                                                          |
| `--display-name <name...>` | No       | Alias for `--label`. Variadic, so `--display-name Bob Ops` keeps both words. `--label` wins if both are given. |
| `--kit <kit_id>`           | No       | AccountKit id to assign. Defaults to the company's Default kit.                                                |

After creating a user, activate it with `naive use <user_id>`.

<Note>
  These commands act inside one [project](/docs/architecture/projects) — the active one
  (`naive projects use`), else the organization's default. Select another for a
  single command with `--project <project_id>`. A user created in one project is
  not listed by, or assignable in, another.
</Note>

<Note>
  `--user <id>` is **not** a global override — it exists only on the commands that declare it
  (`approvals`, `connections`, `vault`, `logs`, `loops`, `env`, `module add`,
  `agent-profiles provision`, `mobile proxy-set`). Everywhere else, select the subject with
  `naive use <id>` or `NAIVE_ACTIVE_USER_ID`. See [use](/docs/cli/use) for the full resolution order.

  `naive users delete <id>` **suspends** the tenant user (`DELETE /v1/users/{id}`); the naming is
  the HTTP verb, not the effect.
</Note>
