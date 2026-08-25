> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Board & cards

> GET …/board, GET …/board/{card} and GET …/events — the six-column board, one card with its runs, and the frame list.

## The six columns

```
GET /v1/teams/{team}/tenants/{tenantUserId}/board
```

| Column           | Meaning                                                               | reachable on    |
| ---------------- | --------------------------------------------------------------------- | --------------- |
| `open`           | not claimed                                                           | both            |
| `claimed`        | a worker holds it                                                     | both            |
| `awaiting_check` | the completion claim is in, the verdict is not                        | both            |
| `done`           | complete **and** verified                                             | both            |
| `unverified`     | complete, and no platform-owned ledger row could adjudicate the claim | **hermes only** |
| `blocked`        | blocked                                                               | both            |

`unverified` is a terminal state, not a failure: the work was claimed done and the
platform could not independently confirm it. Every card in that column carries
`unverified_because`.

<Warning>
  A durable tenant's board never reports `unverified` — the durable runtime has no
  unadjudicated-completion state. If you run `naive teams tasks --fail-on-unverified` in CI,
  that gate silently stops firing when a tenant moves to the durable runtime. What durable
  has instead is a reviewer that rejects a completion and requeues the card — see
  [Review and retries](#review-and-retries-durable-only).
</Warning>

### How the six columns are computed — hermes

Derived from two legacy columns, `tasks_mirror.status` and
`tasks_mirror.verification_status`:

| `status`      | `verification_status`   | column           |
| ------------- | ----------------------- | ---------------- |
| `blocked`     | —                       | `blocked`        |
| `ready`       | —                       | `open`           |
| `in_progress` | —                       | `claimed`        |
| `done`        | `verified`              | `done`           |
| `done`        | `unverified`            | `unverified`     |
| `done`        | `pending` or `rejected` | `awaiting_check` |
| anything else | —                       | `open`           |

### How the six columns are computed — durable

A durable tenant's board is the runtime's own board, fetched over the control seam and
translated:

| runtime state | column           |
| ------------- | ---------------- |
| `todo`        | `open`           |
| `ready`       | `open`           |
| `doing`       | `claimed`        |
| `review`      | `awaiting_check` |
| `done`        | `done`           |
| `blocked`     | `blocked`        |

Every durable row also carries the untranslated value in `runtime_status`; read it when
the distinction between `review` and other `awaiting_check` sources matters.

### Review and retries — durable only

A durable card carries `attempts`. When the reviewer rejects a completion the card goes
back to `ready` and the attempt count advances; the card is `blocked` with
`block_reason: "exhausted"` once the attempts run out.

<Warning>
  `done` on a durable card means the reviewer accepted the claim, not that it was checked
  against anything the platform owns. `attempts > 1` on a `done` card means at least one
  earlier completion was rejected, but the reviewer's reason is only in the runtime's own
  event log — [`GET …/events`](#frames) has no rows for a durable tenant (see
  [Not wired](/docs/api-reference/runtime/not-wired)).
</Warning>

### Query parameters

| Name     | Description                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------- |
| `status` | One of the six column names. Anything else is `400 invalid_input` and the message lists the six.     |
| `role`   | Filter by assignee.                                                                                  |
| `limit`  | Max 200 · **hermes only**. See [`GET /v1/limits`](/docs/api-reference/governance/limits).                 |
| `cursor` | Opaque base64url keyset cursor from `next_cursor` · **hermes only**. Offset paging is not supported. |

`?status=` filters in memory on both runtimes. On hermes the route over-fetches, filters
after mapping, and adds `"filtered_in_memory": true` — a filtered page can return fewer
rows than the limit while more exist, so page with the cursor. On durable the filter is
applied after translation.

`?status=unverified` on a durable tenant answers `200` with an empty list because the
column is unreachable there — branch on `provider`, not on emptiness.

### Paging is hermes-only

A durable tenant's board comes back whole; `limit` and `cursor` are accepted and ignored:

```json theme={"theme":"css-variables"}
{
  "provider": "durable",
  "items": [ "…every card…" ],
  "next_cursor": null,
  "next_cursor_unavailable_because": "the durable runtime's board route answers with the whole board and takes no cursor; every card is in `items`"
}
```

A client that pages until `next_cursor` is `null` terminates correctly on both runtimes.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "task_id": "task-def-456",
        "row_id": "0f7a…",
        "title": "Draft the welcome email",
        "status": "claimed",
        "role": "tier1",
        "attempts": 1,
        "lease": {
          "role": "tier1",
          "expires_at": "2026-07-30T11:04:00.000Z",
          "remaining_ms": 143000
        },
        "rubric": null,
        "required_attestations": [],
        "required_attestations_unavailable_because": "no attestation store exists in this build; the list is empty because nothing can be recorded, not because nothing is required",
        "blocked_reason": null,
        "blocked_reason_is_inferred": false,
        "parent_task_id": null,
        "created_at": "2026-07-30T10:58:00.000Z",
        "terminal_at": null,
        "unverified_because": null
      }
    ],
    "next_cursor": "eyJrIjoi…"
  }
  ```
</ResponseExample>

### `task_id` vs `row_id`

* **`task_id`** — the id the runtime addresses a card by. `GET …/board/{card}` takes this one.
* **`row_id`** — the platform UUID of the mirror row.

On a durable tenant there is no mirror row, so both fields carry the runtime's card id.
Address cards by `task_id` on either runtime; detect the provider from `provider`, not
from the pair's equality.

### `blocked_reason`

On hermes, `blocked_reason` is `"assignment"` with `blocked_reason_is_inferred: true` —
there is no stored reason column. On durable the reason is stored,
`blocked_reason_is_inferred` is `false`, and `blocked_detail` accompanies it where
supplied:

| `blocked_reason` | the card stopped because                         |
| ---------------- | ------------------------------------------------ |
| `dependency`     | it waits on another card                         |
| `needs_input`    | it waits on a person                             |
| `capability`     | no member of the team can do it                  |
| `transient`      | a retryable failure                              |
| `crash`          | the attempt died                                 |
| `exhausted`      | the reviewer rejected the last available attempt |
| `budget`         | the tenant's cap stopped it                      |

Branch on `blocked_reason_is_inferred`, not on the provider. `"exhausted"` means the
reviewer refused to accept a completion until attempts ran out — the per-rejection reasons
are on the runtime's event log only.

***

## One card

```
GET /v1/teams/{team}/tenants/{tenantUserId}/board/{card}
```

`{card}` is the `task_id`, not `row_id`. Returns the same card object plus:

* `runs` — up to 50 runs against this card, newest first
* `events_url` — the exact path to page this card's frames
* `trace_id_unavailable_because` — there is no trace id column on the run mirror

`404 not_found` means no card with that id exists for this tenant.

***

## Frames

```
GET /v1/teams/{team}/tenants/{tenantUserId}/events
```

| Name               | Description                         |
| ------------------ | ----------------------------------- |
| `task`             | Restrict to one card, by `task_id`. |
| `limit` · `cursor` | As above.                           |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "seq": 8121,
        "source": "platform",
        "event_type": "task.claimed",
        "at": "2026-07-30T10:59:12.000Z",
        "task_id": "task-def-456",
        "run_id": "run-abc-123",
        "payload": { "assignee": "tier1" },
        "trace_id": null
      }
    ],
    "next_cursor": "eyJrIjoi…",
    "trace_id_unavailable_because": "R-10 puts trace_id on every frame; task_events_mirror has no such column"
  }
  ```
</ResponseExample>

`source` is always `platform`: these rows are written by the API from the runtime mirror,
never from a request body, so no caller can forge a frame. `seq` is monotonic per frame
and is what the cursor pages on — a mirror row id, not a per-run sequence number.
