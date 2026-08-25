> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Runtime & Brain Governance Tools

> The naive_teams_*, naive_agent_* and naive_brain_* governance MCP tools — the team's runtime, supervising a long-horizon agent, the belief queue, and how a refusal reaches a model.

Three families of MCP tools cover the parts of the platform an agent has to *reason about*
rather than merely call: the runtime its team actually runs on, the long-horizon agents
running unattended against a spend cap, and the queue in which a proposed belief waits for
a decision.

Both are listed **per tenant**. A tool you cannot see is one this tenant's Account Kit does
not enable — that is a product decision, and no call will change it. A tool you *can* see
may still refuse a specific call; that is authority, not scope, and the refusal tells you
what would change it.

<Warning>
  **The tool list is resolved once, when the session opens.** An Account Kit edit takes effect
  immediately at the gate but does not retract a tool already listed, so a long-lived session can
  show a tool whose primitive was switched off minutes ago. That drift is only ever *permissive* —
  the execution gate is re-evaluated on every call and denies — so the failure mode is a tool that
  refuses, never a tool that runs when it should not. Reconnect to refresh the list.
</Warning>

## Runtime tools

Every tool addresses one tenant user's runtime over **one control wire** — the same wire the REST
routes already drive, resolved to whichever runtime is registered for that tenant. There is no
carrier branch anywhere in these tools, and nothing you write should introduce one.

Requires the **`tasks`** primitive.

| Tool                  | Description                                                                                  | Notes                                   |
| --------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| `naive_teams_status`  | Which runtime this tenant is on, whether it is claimed, and a live reachability probe.       | read-only · degrades instead of failing |
| `naive_teams_board`   | The board: every task the runtime holds, with status and role. Filter by `status` or `role`. | read-only                               |
| `naive_teams_run`     | One run's status and transcript pointer, by `run_id`.                                        | read-only                               |
| `naive_teams_comment` | Post a comment onto a task, so the team can read it.                                         | queued through the outbox               |
| `naive_teams_unblock` | Clear a task's blocked state. `because` is required.                                         | queued through the outbox               |

<Note>
  **Writes are queued, not sent.** `naive_teams_comment` and `naive_teams_unblock` return when the
  command is durably held, which is not the same as the runtime having seen it. If the runtime
  is unreachable you receive a `wait_for_delivery` recovery step — **do not send the command
  again**. A second send is a second comment, or a second unblock.
</Note>

## Long-horizon agent tools

<Warning>
  **These are for *your* client, not for an agent.** Vetta's own harness renders its tool
  catalogue straight into the model request and never opens an MCP session — measured, **0 tool
  calls over MCP out of 358**. This family exists for the person holding a scoped MCP session
  from an editor or a desktop assistant, asking about agents they did not launch: what is
  running, what did it do, what did it produce, what did it cost. It is a **supervision**
  surface, and its centre of gravity is reads.
</Warning>

Seven tools against twenty REST routes, and the difference is deliberate.

**Creating, updating and deleting an agent are not here.** Those set the spend cap, the model
pins and the schedule. A cap is the one control that bounds an autonomous agent's bill, and it
should be set where the person can see it — not adjusted as a side effect of a sentence typed
at an assistant. Delete is unrecoverable. **The SSE event stream is not here** either: a
long-lived stream has no representation in a request/response tool call, and
`naive_agent_tasks` is the pollable answer. **Recording a deliverable is not here**, because
its only legitimate caller is the agent's own runtime writing back what it produced — a
human's editor filing an artifact against an agent's task is a forged provenance record.
**Minting a webhook URL is not here**, because that is credential issuance.

Starting a task *is* here. It is bounded by the cap already set on the agent, which is the
control that matters, and "have it look at this" is the actual reason a person reaches for an
agent from their editor.

Requires the **`agents`** primitive, and requires it **strictly**: an Account Kit with no
`agents` entry is a refusal, not a default. That matches `enforceSubjectPrimitive` on the REST
router, and the strict rule is chosen here because the first thing this primitive does is bill
a model call.

| Tool                       | Description                                                                                                                                                      | Notes                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `naive_agents_list`        | The roster: name, status, whether each is paused, and its spend cap. Start here — every other agent tool needs an id from it.                                    | read-only                                                      |
| `naive_agent_get`          | One agent's full configuration: model, tools, schedule, budget cap and period.                                                                                   | read-only                                                      |
| `naive_agent_tasks`        | The task board: what is running, what is queued, how each finished.                                                                                              | read-only · poll it, there is no stream                        |
| `naive_agent_task_start`   | Give an existing agent a job; returns the task id immediately.                                                                                                   | **spends real money** against the cap already set on the agent |
| `naive_agent_deliverables` | One manifest row per artifact: title, kind, size, and whether it was the final answer.                                                                           | read-only · manifests only                                     |
| `naive_agent_deliverable`  | One deliverable, with inline text if small and a fresh download URL if a file.                                                                                   | read-only · the URL is minted per call                         |
| `naive_agent_spend`        | What the agent has cost this budget period. `spent_credits` is METERED by the agent's runtime; `billed_credits` is what the credit ledger holds. Never add them. | read-only · every paid component prints, including the zeros   |

<Warning>
  `naive_agent_task_start` **cannot raise the cap** and cannot set the task's `source`,
  `priority` or idempotency key — those are platform-set, so the observability column stays true.
  It is the only tool in this family that is not read-only, which is what tells your client not
  to retry it blindly: a retried launch is a **second task**, and a second spend.

  It *does* take an optional `window` (`asap | standard | flex`, default `asap`) — the same
  argument the HTTP, SDK and CLI surfaces take. That is a caller's choice about their own
  scheduling tier, not a provenance column, and it was listed above as platform-set only because
  this tool used to hard-code `asap` and offer no argument at all.
</Warning>

<Note>
  A `download_url` of `null` alongside a `no_artifact_reason` means the agent finished without
  producing a file and said why. A documented download that 403s would be worse than an honest
  absence.
</Note>

## Brain governance tools

The twenty-one `naive_brain_*` content tools cover *what the brains know*. These five cover
*how something comes to be known*: the writeback envelope a claim arrives on, the proposal it
becomes, and the decision that resolves it.

Requires the **`brain`** primitive, which is opt-in — an Account Kit with no `brain` entry is
a refusal, not a default.

| Tool                          | Description                                                                   | Notes                        |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `naive_brain_proposals`       | The queue of proposed beliefs. Filter by `status`, `object_type` or `run_id`. | read-only                    |
| `naive_brain_proposal`        | One proposal, with its full decision trail.                                   | read-only                    |
| `naive_brain_decide_proposal` | Accept or reject a proposal. `because` is required.                           | accept is **approval-gated** |
| `naive_brain_writebacks`      | The envelopes proposals arrived on.                                           | read-only                    |
| `naive_brain_writeback`       | One envelope and every proposal it carried.                                   | read-only                    |

<Warning>
  `decision: "accept"` canonizes a claim into the company's source of truth, so an agent call
  **parks for a human**. You get an approval id, not a result. `decision: "reject"` applies
  immediately, with you recorded as the reviewer.
</Warning>

## How a refusal reaches you

A refused call does not return a bare error. It returns a **verdict envelope**, carried in
both `structuredContent` and the text block:

```json theme={"theme":"css-variables"}
{
  "ok": false,
  "verdict": "deny",
  "reason": "capability_denied",
  "action": "naive_teams_board",
  "layer": "company",
  "retryable": false,
  "repeat": 1,
  "message": "Not allowed by AccountKit \"Default\": primitive_disabled_by_kit",
  "error": { "code": "forbidden", "hint": "…", "details": { "reason": "primitive_disabled_by_kit" } },
  "recovery": [
    {
      "kind": "request_capability",
      "change": "Enable the 'tasks' primitive for this tenant.",
      "human_action": "Tell the user this capability is switched off for their account and stop."
    }
  ],
  "alternatives": []
}
```

Read three fields, in this order:

1. **`retryable`** — `true` only when the envelope also carries a `retry_after` recovery step,
   which happens only for `verdict: "unavailable"`. If it is `false`, calling again cannot
   help: the decision is a function of a policy snapshot your calls do not change.
2. **`recovery[]`** — the one thing that would change the outcome. It names a **tool** or a
   **human act**, never a shell command.
3. **`alternatives[]`** — other tools that would work right now.

### Verdicts

| Verdict       | `isError`   | What it means                                                                                        |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `deny`        | `true`      | A decision. Retrying is a loop.                                                                      |
| `park`        | **`false`** | A human must approve. This is a successful deferral, not a failure.                                  |
| `unavailable` | `true`      | An outage. The only retryable verdict.                                                               |
| `attest`      | `false`     | Evidence is required before this may proceed. **Declared, never emitted on this build** — see below. |

<Note>
  `attest` is a member of the verdict union and **nothing produces it today**: measured across the
  API, the platform packages and the governor, the only occurrence of the string is the type
  declaration itself. Handle it if you are writing an exhaustive `switch` — the union is closed and
  will not grow silently — but do not build a flow that waits for one.
</Note>

<Note>
  **Three vocabularies, and they are not the same set.** The closed decision engine answers
  `allow | deny | freeze`. `POST /v1/policy/explain` answers `allow | deny | park`. This envelope
  adds `attest` and `unavailable` on top, because a model needs to tell an outage from a decision.
  Do not map one onto another by name alone.
</Note>

A `park` gives you `wait_for_approval` with an `approval_id`, an `expires_at`, and
`on_expiry: "deny"` — an approval window that elapses becomes a refusal. Poll
`naive_approvals_get`. You cannot approve your own request.

If you refuse the same call three times, the envelope stops offering choices: you get exactly
one `escalate_to_human` step and no alternatives. That is the signal to stop and tell the
user.

## Connections enumeration is filtered

`naive_connections_tools` now filters its output through the same Account Kit rule
`naive_connections_execute` obeys. A toolkit the kit does not permit is refused with a
`request_toolkit` recovery naming it, rather than enumerated; per-tool `enable`/`disable`
filters are applied to the result, and `withheld_by_policy` reports how many names were
removed. Calls that worked before still work — every kit ships permissive by default, so this
bites only where somebody deliberately narrowed one.
