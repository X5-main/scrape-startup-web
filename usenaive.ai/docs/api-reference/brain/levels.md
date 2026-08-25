> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Levels

> GET /v1/brain/levels — the whole level tree in one response, including the tiers that do not exist and why.

```
GET /v1/brain/levels
```

One endpoint, on purpose. A lane is a level, and a second endpoint for one concept
is a second vocabulary. Company, partitions and lanes come back together — and
where a tier does not exist in the schema it is reported as **absent with the
reason**, not omitted.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "company": {
      "level": "company",
      "knowledge_bases": [
        { "id": "kb-…", "name": "Company", "status": "active", "is_default": true, "recallable_beliefs": 412 }
      ]
    },
    "partitions": [
      { "level": "team", "id": "kb-…", "name": "support", "status": "active", "is_default": false, "recallable_beliefs": 87 }
    ],
    "lanes": [],
    "absent": {
      "lanes": "no lane column exists on any brain_* table",
      "agent_level": "no brain_* table carries an agent level",
      "partition_model": "unresolved: this response reports brain_knowledge_bases rows as partitions, which is the schema, not a ruling on the N-named-partitions vs partition-is-the-project question"
    }
  }
  ```
</ResponseExample>

## The tree

| Tier                 | Backed by                                                                                          | Status                                                |
| -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **company**          | a knowledge base with `scope: "org"` — at most one per company, enforced by a partial unique index | real                                                  |
| **team (partition)** | a knowledge base with any other scope                                                              | real                                                  |
| **lane**             | —                                                                                                  | **does not exist**: no lane column on any brain table |
| **agent**            | —                                                                                                  | **does not exist**: no agent level on any brain table |

`recallable_beliefs` counts only `candidate`, `active` and `confirmed` claims —
the same set [`GET /v1/brain/beliefs`](/docs/api-reference/brain/beliefs) returns by
default.

## `lanes: []` means the tier does not exist

<Warning>
  An empty `lanes` array here does **not** mean "you have no lanes configured". It
  means the concept has no storage. `absent.lanes` is the field that says so, and it
  is always present.

  The same applies to `level: "agent"` on the beliefs endpoint: it is not a filter
  that returns nothing, it is a value the schema cannot produce. Asking for it is
  `400 invalid_input` rather than an empty list.
</Warning>

## `partition_model` is an open question, reported rather than resolved

The contract models N named partitions per project. The brain schema makes a
partition *be* a knowledge base. Those are different models and neither has been
ruled on, so this response reports the **schema** — knowledge-base rows as
partitions — and says in `absent.partition_model` that it is doing so.

Practical consequence: do not write code that assumes a fixed number of partitions
per project, and do not assume a partition name is stable across a future ruling.

## Vocabulary

The DSL levels are `company | team | agent`. The stored scope values are `org` and
`project`. This endpoint maps `org → company` and everything else → `team`, and
reports the DSL word on every row. A reader who has to remember which of two
vocabularies a field is in will eventually get it wrong, so only one appears here.
