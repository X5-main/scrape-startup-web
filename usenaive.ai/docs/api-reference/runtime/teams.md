> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Teams

> GET /v1/teams and GET /v1/teams/{team}/tenants/{tenantUserId} — enumerate the company's declared teams and read the header the board prints above everything.

## List teams

```
GET /v1/teams?runtime=durable&project=default
```

Every team your applied `naive.config.ts` declares, for the calling company. This
is the **one company-scoped operation** on this surface and the only one that
does not take a tenant — which is the point of it: `tenant_user_ids` is the
`--tenant` every other operation requires, so a caller no longer has to already
know it.

<Info>
  **This operation answered `501 not_configured` until recently, and what changed
  was storage, not policy.** A declared team's name lives in `agents.metadata`
  under a JSONB key that was spelled with a word the repository's vocabulary gate
  has retired, and every package that could host an accessor was at its recorded
  ceiling for that word — so the refusal named its own remedy: rename the key with
  a migration. `packages/db/migrations/065_agents_config_team_key.sql` is that
  rename. Readers accept **both** spellings while an image predating it may still
  be writing the old one, so no team goes missing across the deploy.
</Info>

### Query parameters

| Name      | Description                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runtime` | `durable` or `hermes`. A **mixed** team — one with members on both lanes — matches either value and still reports `runtime: "mixed"`. Anything else is `400 invalid_input`. |
| `project` | Only teams declared under this project.                                                                                                                                     |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "team": "hiring",
        "project": "default",
        "runtime": "durable",
        "tenant_user_ids": ["42b5f24c-e103-4e8a-8ddc-8a6695d5622b"],
        "lead": "lead",
        "roles": ["lead", "screener"],
        "unplaced": false,
        "declared_at": "2026-07-28T09:14:03.221Z",
        "fence": null,
        "digests": null,
        "brain_partition": null
      }
    ],
    "next_cursor": null,
    "unavailable_because": {
      "fence": "the apply fence requires an applied digest to compare against; no manifest store exists in this build",
      "digests": "no manifest or snapshot digest is stored in this build",
      "brain_partition": "the brain partition is a manifest field; no manifest store exists in this build"
    }
  }
  ```
</ResponseExample>

### Reading the fields

| Field                                   | What it is                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `team`                                  | The declared name — the `{team}` segment every other operation takes.                                                                                                                                                                                                                                         |
| `runtime`                               | `durable`, `hermes`, `mixed`, or `null`. `mixed` is a real answer: one declared team may have members on both lanes. `null` means no live member row records a runtime (rows written before that key existed), and `runtime_unavailable_because` says so rather than defaulting to a lane nothing measured.   |
| `tenant_user_ids`                       | The `tenant_users.id` values this team's work is addressed by. A durable team has its own subject (`team:<name>`); a hermes team's members hang off the company container's tenant. A **list**, because a mixed team has more than one and collapsing it would hand you an id that addresses half the roster. |
| `lead`                                  | The lead's role, from `metadata.config_root`. `null` if no live row claims it.                                                                                                                                                                                                                                |
| `roles`                                 | Declared roles, live rows only. Archived members are excluded — a team the config no longer declares is not listed.                                                                                                                                                                                           |
| `unplaced`                              | True when at least one live member is `provision_status = 'unplaced'`: declared and recorded, but placement was refused. Read from the same column the deployment status reads, so the two cannot disagree.                                                                                                   |
| `fence` · `digests` · `brain_partition` | `null`, always, with the reason in `unavailable_because`. These are manifest fields and no manifest store exists in this build — the second half of the original refusal, which this operation did **not** supply.                                                                                            |

**An empty `items` is an honest `200`**, not a `404`: a company that has applied
no config has no declared teams, which is a fact about the company rather than a
missing address. What is listed comes from naive's own `agents` rows, so a team
appearing here means it is declared and addressable — **not** that its runtime
answered.

The request is authorised before anything is read, so a bad credential gets
`401`. It answers about the calling company and no other.

***

## Get a team at a tenant

```
GET /v1/teams/{team}/tenants/{tenantUserId}
```

The header the board and the CLI print above everything: which runtime the tenant
is on, the six board counts, and spend over the tenant's own budget window.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/teams/support/tenants/8f1c…/" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "team": "support",
    "tenant_user_id": "8f1c…",
    "runtime": "hermes",
    "provider": "hermes",
    "counts": {
      "open": 4,
      "claimed": 1,
      "awaiting_check": 0,
      "done": 12,
      "unverified": 1,
      "blocked": 2
    },
    "spend": {
      "spent_cents": 1840,
      "cap_cents": 5000,
      "class": "reserve",
      "enforced": true
    },
    "period": { "name": "month", "start": "2026-07-01T00:00:00.000Z" },
    "digests": null,
    "fence": null,
    "stop": null,
    "unavailable_because": {
      "digests": "no manifest or snapshot digest is stored in this build",
      "fence": "the apply fence requires an applied digest to compare against; none is stored",
      "stop": "a team-level stop is a durable-runtime state; the legacy runtime has no equivalent row"
    }
  }
  ```
</ResponseExample>

### Path parameters

| Name           | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| `team`         | Your declared team name. Echoed back; not used as a storage key in this build.   |
| `tenantUserId` | A `tenant_users.id`. The same id the legacy `/v1/users/{user_id}/…` routes take. |

### Reading `spend`

`class` and `enforced` are the two fields that decide whether `cap_cents` is a
ceiling or an alert. Do not read `cap_cents` on its own.

| `class`   | `enforced` | what happens at the cap                                                                         |
| --------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `reserve` | `true`     | the amount is reserved atomically **before** the action executes; over-cap actions are refused  |
| `meter`   | `false`    | the spend is recorded; nothing is refused. A soft cap escalates to approval, no cap meters only |

`period` is the tenant's **own budget window**, taken from its AccountKit — not a
calendar month. Reporting spend over a month while the cap resets weekly produces
a number that looks like a fraction of a cap and is not one. With no budget
declared, `period.name` is `month` because that is the conventional reporting
window, and `cap_cents` is `null`.

### `runtime` and `provider` are the same value

Both are emitted, and both carry `hermes` or `durable`. They are duplicated so a
client written against either name reads the true value.

<Note>
  **`counts` is derived from two legacy columns.** The six board columns are
  computed from `tasks_mirror.status` and `tasks_mirror.verification_status` by a
  single reader. There is no database constraint making those two columns agree, so
  a card whose legacy status the reader cannot classify is counted as `open` rather
  than dropped — an invisible card is how work is lost. See
  [Board](/docs/api-reference/runtime/board) for the full mapping.
</Note>
