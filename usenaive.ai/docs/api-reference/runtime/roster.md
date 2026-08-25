> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Roster

> GET …/roster — who is on the team, and why every authority field is null rather than empty.

```
GET /v1/teams/{team}/tenants/{tenantUserId}/roster
```

Real rows: the agents provisioned for this tenant, oldest first, archived ones
excluded.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "team": "support",
    "tenant_user_id": "8f1c…",
    "roles": [
      {
        "name": "lead",
        "role": "lead",
        "title": "Support Lead",
        "lead": true,
        "model": null,
        "can": null,
        "approve": null,
        "view": null,
        "skills": ["email", "tasks"],
        "provision_status": "ready",
        "enabled": true
      }
    ],
    "edges": [],
    "digests": null,
    "unavailable_because": {
      "can": "compiled authority lives in the manifest; none is stored in this build",
      "approve": "same",
      "view": "same",
      "model": "per-role model selection is a manifest field; none is stored",
      "edges": "the delegation graph is a manifest field; none is stored",
      "digests": "no manifest or snapshot digest is stored in this build"
    }
  }
  ```
</ResponseExample>

<Warning>
  **`can`, `approve` and `view` are `null`, not `[]`, and the difference is the
  point.**

  An empty ability list is a *meaningful* value in the declarative surface: an agent
  declared with no abilities is a real, intentional configuration. Reporting
  "unknown" as "none" would understate an agent's authority — which is the one
  direction an operator must never be misled in.

  So: `null` means *this build cannot tell you*. It does not mean the agent has no
  abilities. Do not render it as "no permissions".
</Warning>

## Fields

| Field                         | Source                                                             | Notes                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                        | the agent's runtime profile name, falling back to its display name | this is the name `edges` would refer to                                                                                                                                                    |
| `role`                        | `agents.role`                                                      | NOT NULL — always present. Its stored default is the literal `employee`.                                                                                                                   |
| `title`                       | `agents.title`                                                     | free text, or `null` when the agent has no title. Reported SEPARATELY from `role`; these were once folded into one `position` field, which made a role indistinguishable from a job title. |
| `lead`                        | a config-apply-only metadata flag                                  | **not forgeable**: every `config_`-prefixed metadata key is stripped from caller-supplied metadata at the boundary, so a caller cannot promote itself to lead                              |
| `skills`                      | the agent's skill slugs                                            | real                                                                                                                                                                                       |
| `provision_status`, `enabled` | real columns                                                       | an agent can be listed and not yet ready                                                                                                                                                   |

## Why this works while `GET /v1/teams` does not

The roster is the one team-shaped read that needs no team **name**. It is keyed on
`(company, tenant)`, which is stored everywhere; team enumeration needs the
declared team name, which is not readable here. See
[Teams](/docs/api-reference/runtime/teams).
