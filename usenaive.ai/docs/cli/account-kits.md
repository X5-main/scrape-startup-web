> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# account-kits

> Manage AccountKits from the CLI.

```bash theme={"theme":"css-variables"}
naive account-kits list

naive account-kits create --name Pro \
  --mode allowlist --toolkits gmail,slack,stripe \
  --tool gmail.enable=GMAIL_FETCH_EMAILS,GMAIL_SEND_EMAIL \
  --custom-auth gmail=ac_brand_gmail

naive account-kits assign <kit_id> <user_id>
```

<Note>
  Kits belong to a [project](/docs/architecture/projects). These commands act inside the
  active one (`naive projects use`), else the organization's default; `--project <project_id>` selects another for one command. `assign` refuses a child project
  from a different project than the kit — policy does not cross the boundary.
</Note>

* `--mode` — `open` | `allowlist` | `blocklist`
* `--tool <toolkit>.enable=A,B` / `.disable=A,B` — per-tool filter (repeatable)
* `--custom-auth <toolkit>=ac_xxx` — white-label OAuth (repeatable)

**Governance / approval gating** (`requiresApproval` per primitive) is configured
via the dashboard Account Kit editor or the REST API
(`primitives_config` / `connections_config`) — see
[Approvals](/docs/cli/approvals). Sensitive actions are gated by default.
