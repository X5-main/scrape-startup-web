> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain

> Company knowledge from the CLI — brains, documents, semantic memory, and the attach/consolidate/propose run loop.

A company has **one or more brains**, and exactly one of them is the **default**.
`naive brain` reaches them four ways:

1. **The brains themselves** — `list` / `create` / `rm`, and `connect` / `disconnect` to
   say which brain an agent works out of.
2. **Documents** — `add` / `note` / `replace-doc` ingest source material; `query` answers
   from it.
3. **Semantic memory** — `remember` writes durable facts; `recall` / `think` / `graph` /
   `timeline` read them.
4. **The run loop** — `attach` before the work, `consolidate` after it, and `proposals` /
   `writebacks` to see and decide what the run wants to write back.

## Choosing a brain

Every content subcommand takes the same three selectors, all optional. With none of
them the call goes to the company **default**.

| Selector             | Takes                   | Notes                                                                                                                      |
| :------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `--kb <uuid>`        | a knowledge-base **id** | the shipped spelling, byte-identical. A value that already looks like a UUID reaches the wire with **zero extra requests** |
| `--brain <name\|id>` | a **name** or an id     | new. A name is resolved against `GET /v1/brain` in the client, so only a UUID ever reaches the wire                        |
| `--agent <id\|name>` | an **agent**            | new. Uses whatever brain that agent is connected to                                                                        |

```bash theme={"theme":"css-variables"}
naive brain query "What is our refund policy?"                      # the default brain
naive brain query "What is our refund policy?" --brain "Support"    # by name
naive brain query "What is our refund policy?" --kb 00a21080-e247-4935-8efb-a6c1051c189b
naive brain recall "refunds" --agent "Support Sam"                  # that agent's brain
```

**Names are not unique**: two `create`s with the same name give two brains.
`--brain <that name>` then refuses and asks for an id rather than picking one, and
`naive brain list` warns which names are ambiguous.

## Overview

| Command                                                 | Description                                                   | Cost                                       |
| ------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `naive brain list`                                      | Every brain: which is default, and which agents are connected | Free                                       |
| `naive brain create <name>`                             | Create a brain (`--default` also makes it the default)        | Free                                       |
| `naive brain default <brain>`                           | Make an existing brain the company default                    | Free                                       |
| `naive brain connect <brain> --agent <a>`               | Say which brain an agent works out of                         | Free                                       |
| `naive brain disconnect [brain] --agent <a>`            | The inverse                                                   | Free                                       |
| `naive brain rm <id>`                                   | Delete a brain (permanent)                                    | Free                                       |
| `naive brain query <question>`                          | Grounded answer + citations                                   | 0.08 credits                               |
| `naive brain recall <query>`                            | Recall structured semantic memory                             | Free                                       |
| `naive brain remember <fact>` (alias `naive brain mem`) | Write a durable semantic memory episode                       | Free                                       |
| `naive brain think <query>`                             | Synthesize memory + docs with gap notes                       | 0.08 credits                               |
| `naive brain graph`                                     | Explore the entity/relation knowledge graph                   | Free                                       |
| `naive brain timeline`                                  | Memory events/facts in chronological order                    | Free                                       |
| `naive brain forget <scope> <ref>`                      | Tombstone/forget a memory scope                               | Free                                       |
| `naive brain add`                                       | Ingest a document (`--file`/`--text`/`--url`)                 | 0.1 credits + 0.0002 per KB (capped at 10) |
| `naive brain note <fact>`                               | Ingest a short fact as a document                             | 0.1 credits + 0.0002 per KB (capped at 10) |
| `naive brain replace-doc <id>`                          | Replace/refresh a document in place                           | 0.1 credits + 0.0002 per KB (capped at 10) |
| `naive brain docs`                                      | List ingested documents + status                              | Free                                       |
| `naive brain doc <id>`                                  | Get one document (refreshed status)                           | Free                                       |
| `naive brain rm-doc <id>`                               | Delete a document (permanent)                                 | Free                                       |
| `naive brain attach <goal>`                             | Read capsule for a goal — before the work                     | Free                                       |
| `naive brain consolidate`                               | Debrief after the work — **proposes**, does not commit        | Free                                       |
| `naive brain proposals [id]`                            | List, read and decide write-back proposals                    | Free                                       |
| `naive brain writebacks [id]`                           | The envelopes a run produced                                  | Free                                       |
| `naive brain status`                                    | Operator view of the brain runtime for this company           | Free                                       |
| `naive brain metrics`                                   | Nervous-system counters (**process-global**)                  | Free                                       |

## The brains

```bash theme={"theme":"css-variables"}
naive brain list                          # every brain, the default marked, plus who is connected
naive brain list --no-agents              # skip the roster read
naive brain create "Support Brain"
naive brain create "Support Brain" --default   # …and make it the company default
naive brain default "Research Brain"      # promote one that already exists
naive brain rm 00a21080-e247-4935-8efb-a6c1051c189b
```

**`naive brain default <name|id>`** promotes a brain that already exists — one request, no
new brain, idempotent, and it takes the same `<name|id>` every `--brain` flag takes (a name
two brains share is refused with both ids rather than resolved to one). `create --default`
is the other spelling and it *adds* a brain.

<Warning>
  * **`naive brain rm <the default>` succeeds and moves the default** — the oldest
    surviving brain is promoted in the same transaction; `rm` says so in its hints and
    points at `naive brain list`.
  * **A `409` from `create --default` does not mean nothing was created.** The brain is
    committed and only the swap failed; the server names it in
    `details.knowledge_base_id`, and the recovery is `naive brain default <that id>`, not
    a retry — re-running the create produces two brains with one name.
</Warning>

`list` reports failed brains as `status: "error"` (the underlying `last_error` is not on
the public shape) and reports `orphaned_bindings`: agents connected to a knowledge base
that no longer exists. It also distinguishes the two "no default" states: no brains at
all (the API will mint one) vs. brains with none flagged (run `naive brain default`).

## Connecting an agent to a brain

```bash theme={"theme":"css-variables"}
naive brain connect "Support Brain" --agent "Support Sam"
naive brain disconnect --agent "Support Sam"
naive brain disconnect "Support Brain" --agent "Support Sam"   # refuses if it is bound elsewhere

# and then, on any content command:
naive brain attach "refund audit" --agent "Support Sam"
naive brain recall "refunds" --agent "Support Sam"
```

`--agent` accepts an agent id, its display name, or its runtime profile name. Naming the
brain on `disconnect` is optional and is an assertion: if the agent is connected to a
different brain the command refuses and changes nothing.

<Warning>
  **A connection is a default, not a permission.** It records *which brain this agent
  works out of* (`metadata.brain_knowledge_base_id`); it grants nothing — every content
  route accepts `knowledge_base_id` company-scoped, so any caller the `brain` primitive
  lets in can address any of the company's brains by id. Do not read
  `naive brain connect` as an isolation boundary.
</Warning>

`--agent` reaches your own agents only: the roster read and write are filtered on
`agents.tenant_user_id`, so another tenant's agent is reported as unknown.
`naive brain list`'s `agents[]` column is likewise your tenant's connections — a brain
that shows none may be one somebody else's agents work out of.

## note vs remember

`remember` writes a durable **semantic memory** episode — facts/entities/claims are extracted
and become recallable via `recall`/`think`/`graph`/`timeline`. `note` (and `add`) ingest text as
a **document** — chunked and embedded, answerable via `query`. Use `remember` for durable facts,
`note`/`add` for source material.

## Ingest + query

```bash theme={"theme":"css-variables"}
naive brain add --file ./handbook.pdf
naive brain add --text "Our refund policy is 30 days" --source policy
naive brain add --url https://example.com/pricing --brain "Support Brain"

naive brain docs                       # confirm status: ready
naive brain query "What is our refund policy?"
naive brain query "And for enterprise?" --session sess_7f21
```

`--file`, `--text`, `--url` are mutually exclusive (provide exactly one).

## Semantic memory

```bash theme={"theme":"css-variables"}
naive brain remember "Acme Corp prefers quarterly invoicing" --source crm --confidence 0.9
naive brain recall "Acme invoicing" --entity "Acme Corp" --limit 10
naive brain think "How should we bill Acme?" --session sess_7f21
naive brain graph --entity "Acme Corp"
naive brain timeline --entity "Acme Corp" --limit 20
```

## The run loop: attach → work → consolidate → propose

This is the loop the durable runtime drives, and you can drive it by hand.

```bash theme={"theme":"css-variables"}
# BEFORE the work — what does the brain already know about this goal?
naive brain attach "refund the duplicate charge on invoice 4471" \
  --entity "Acme Corp" --artifact inv_4471 --since 2026-07-01

# ... do the work ...

# AFTER the work — debrief. This PROPOSES; it does not commit.
naive brain consolidate \
  --objective "Refunded the duplicate charge" \
  --learned "acme|refund window|30 days" \
  --decided "Refund duplicate charges without escalation" \
  --open "Do we notify the customer automatically?"
```

`--entity`, `--artifact`, `--learned`, `--decided` and `--open` are **repeatable**. `--learned`
takes a `subject|predicate|object` triple and the CLI rejects any other shape before sending.
`attach` caps entities at 20 and artifacts at 50.

`consolidate` writes nothing into the brain: it returns `202` with a gateway `mode` and
a list of proposals. Nothing a run says becomes a belief until a proposal is accepted.

## Proposals — one name, two scopes

`proposals` is a list, a reader and a decision verb depending on what you give it.

```bash theme={"theme":"css-variables"}
naive brain proposals --status pending          # the queue
naive brain proposals --run run_88 --limit 20   # what one run proposed
naive brain proposals prop_31f                  # read one
naive brain proposals prop_31f --events         # its history

naive brain proposals prop_31f --accept  --because "confirmed with billing"
naive brain proposals prop_31f --reject  --because "one-off, not a policy"
naive brain proposals prop_31f --merge prop_20a --because "duplicate of the earlier claim"
```

A proposal gets **one** decision. Passing two (`--accept --reject`) is refused before the
request is sent.

`--accept` is a governed action: under an API key it may return `202 pending_approval`
instead of promoting the proposal — the belief is not written until a human approves it
with [`naive approvals approve <id>`](/docs/cli/approvals). `--reject` applies directly. Do
not read a `202` as "accepted".

```bash theme={"theme":"css-variables"}
naive brain writebacks --run run_88     # the envelopes that run produced
naive brain writebacks wb_77            # one envelope
```

## Forget (right-to-be-forgotten)

```bash theme={"theme":"css-variables"}
naive brain forget entity "Acme Corp" --reason "customer erasure request"
naive brain forget document doc_9c14
```

## What is approval-gated

For agent (API-key) callers, four brain actions run through the approval gate and can return
`202 pending_approval` rather than doing the thing:

| Command                               | Governed action         |
| ------------------------------------- | ----------------------- |
| `naive brain forget`                  | `brain.forget`          |
| `naive brain rm-doc <id>`             | `brain.document.delete` |
| `naive brain rm <id>`                 | `brain.kb.delete`       |
| `naive brain proposals <id> --accept` | `brain.proposal.accept` |

`rm-doc` is gated for the same reason `rm` is: without it a knowledge base could be emptied one
document at a time, around the KB-delete gate.

**`connect` and `disconnect` are not on that list**, because a connection decides nothing —
see the warning above.

## Operator views

```bash theme={"theme":"css-variables"}
naive brain status      # this company's brain runtime
naive brain metrics     # counters
```

**`naive brain metrics` is not company-scoped**: it returns process-global counters
aggregating every tenant served by the API process that answered your request (the CLI
says so in `hints`). Use `naive brain status` for anything you attribute to your own
company.

## Not in this CLI yet

Eight capabilities on the brain's REST surface have no CLI subcommand in this build —
`beliefs`, `belief`, `reaffirm`, `lessons`, `learn`, `retention`, `levels` and
`decisions`. Reach them through the [Brain API](/docs/api-reference/brain/overview).

## Related

* [The brain](/docs/architecture/brain) — declaring brains in `naive.config.ts`, partitions, lanes, retention
* [`naive teams`](/docs/cli/teams) — the durable runtime that drives this loop for you
* [`naive memory`](/docs/cli/memory) — the retired per-agent fact store the brain replaces
* [`naive approvals`](/docs/cli/approvals) — where a gated brain action waits
