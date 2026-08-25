> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# projects

> Manage projects — the layer between your organization and its account kits and child projects.

```bash theme={"theme":"css-variables"}
naive projects list
naive projects create --name "Staging" [--slug staging]
naive projects get <project_id>          # `default` names the default project
naive projects update <project_id> --name "Acme Staging"
naive projects update <project_id> --archive     # refuse new work; keep the rows
naive projects update <project_id> --activate    # undo --archive
naive projects use <project_id>          # set the active project
naive projects use --clear               # back to the organization's default
naive projects delete <project_id>       # must be empty; the default can't be deleted
```

`naive projects use` persists `active_project_id` in `~/.naive/config.json` (mode `0600`)
and validates the id before writing it, so a typo fails once here instead of 404-ing every
later command. Every request then carries it as the `X-Naive-Project-Id` header.

## Selecting a project for one command

`--project <project_id>` is a **global** flag — it works on any command and does not touch
the persisted selection:

```bash theme={"theme":"css-variables"}
naive --project <project_id> users list
naive --project <project_id> account-kits list
```

Resolution order: `--project`, then `active_project_id` from the config file, then the API
key's pinned project, then the organization's default project.

## Together with a child project

A child project (a tenant user) is addressed inside a project, so
[`naive use`](/docs/cli/use) sets both:

```bash theme={"theme":"css-variables"}
naive use <child_project_id> --project <project_id>
```

<Note>
  Every organization has a **default project**, and every account kit, child project and
  resource that existed before projects did was backfilled into it. With no project selected
  the CLI behaves exactly as it did — this whole page is opt-in. See
  [Projects](/docs/getting-started/projects).
</Note>

## Archiving vs deleting

`naive projects delete` refuses while the project still holds account kits or child
projects, rather than cascading through an organization's data behind one verb. Move or
delete those first. The default project can never be deleted.

`naive projects update <project_id> --archive` is the answer when you want to retire a
project you cannot empty: the rows stay, and any request that selects it is refused
`403 project_archived`. `--activate` undoes it. The default project cannot be archived —
every un-projected request resolves to it.

The `slug` is immutable. It is the handle other systems address the project by, so
`--name` changes the display name alone.
