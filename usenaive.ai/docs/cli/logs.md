> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# logs

> Activity logs from the CLI — per-subject and company-wide.

```bash theme={"theme":"css-variables"}
naive logs tail --user alice --action vault.put --limit 50
naive logs all --action connection.execute       # every user in the company
```

| Command           | Scope             | Route                     |
| ----------------- | ----------------- | ------------------------- |
| `naive logs tail` | one subject       | `GET /v1/users/{id}/logs` |
| `naive logs all`  | the whole company | `GET /v1/logs`            |

## Flags

| Flag                | on `tail`                | on `all`                    |
| ------------------- | ------------------------ | --------------------------- |
| `--action <action>` | filter, e.g. `vault.put` | same                        |
| `--limit <n>`       | max events, default `50` | max events, default `100`   |
| `--user <id>`       | **the subject to read**  | **a filter on the results** |

<Warning>
  `--user` means two different things on this page, and that is the one thing to get right here.

  On `naive logs tail` it selects **whose** log you are reading — it becomes the `{id}` in the
  path and scopes the request. On `naive logs all` it is only a `user_id` **query filter** applied
  to an already company-wide result set; the request is company-scoped either way.
</Warning>

<Note>
  `naive logs tail` with no `--user` and no active subject sends the literal string `default` as
  the path segment, which asks the API to resolve the API key's own default user. It does not
  error, and it does not mean "all users" — if you meant every user, that is `naive logs all`.
  Select a subject explicitly with [`naive use <id>`](/docs/cli/use) when it matters.
</Note>
