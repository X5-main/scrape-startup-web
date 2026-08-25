> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Approve Team

> POST /v1/companies/:companyId/ceo/team/approve — Provision a team, create tasks, and optionally create apps in one call.

<Warning>
  **Deprecated — `naive ceo` and `/v1/companies/:id/ceo`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams say — the lead is a role now, not a fixed "ceo"`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.ceo`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/companies/:companyId/ceo/team/approve \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "team": [
        { "name": "Jordan Kim", "title": "Lead Engineer", "template": "engineer", "skills": ["typescript", "react"] },
        { "name": "Alex Rivera", "title": "Content Marketer", "template": "writer", "skills": ["seo", "copywriting"] }
      ],
      "tasks": [
        { "title": "Build landing page", "description": "Create responsive landing page with hero section", "assignee": "Jordan Kim", "priority": "high" },
        { "title": "Write blog posts", "description": "Draft 3 launch posts", "assignee": "Alex Rivera", "priority": "medium" }
      ],
      "objective_id": "obj-abc-123"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "status": "team_provisioned",
    "agents_created": ["Jordan Kim", "Alex Rivera"],
    "apps_created": [],
    "tasks_created": 2,
    "count": {
      "agents": 2,
      "tasks": 2,
      "apps": 0
    }
  }
  ```
</ResponseExample>

## Request Body

| Field          | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `team`         | array  | Yes      | Team member definitions (see below) |
| `tasks`        | array  | No       | Tasks to create and assign          |
| `apps`         | array  | No       | Apps to create during provisioning  |
| `objective_id` | string | No       | Parent objective to link tasks to   |

### Team Member Fields

| Field        | Type   | Required | Description                                            |
| ------------ | ------ | -------- | ------------------------------------------------------ |
| `name`       | string | Yes      | Employee display name                                  |
| `title`      | string | Yes      | Job title                                              |
| `template`   | string | No       | Role template: `engineer`, `writer`, `hunter`, `legal` |
| `skills`     | array  | No       | Skill tags                                             |
| `context`    | string | No       | Additional context for the agent profile               |
| `persona`    | string | No       | Persona description                                    |
| `role`       | string | No       | Functional role                                        |
| `department` | string | No       | Department assignment                                  |

### Task Fields

| Field         | Type    | Required | Description                              |
| ------------- | ------- | -------- | ---------------------------------------- |
| `title`       | string  | Yes      | Task title                               |
| `description` | string  | Yes      | Task description                         |
| `assignee`    | string  | Yes      | Employee name (must match a team member) |
| `priority`    | string  | No       | `low`, `medium`, `high`, `critical`      |
| `phase`       | integer | No       | Execution phase (1 or 2)                 |

## Behavior

This endpoint provisions the full team in one atomic operation: creates employee Hermes profiles, assigns tasks, and optionally creates apps. Engineers assigned to apps automatically receive deployment instructions injected into their task descriptions.
