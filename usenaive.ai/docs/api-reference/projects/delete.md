> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Project

> DELETE /v1/projects/{project_id} — delete an empty, non-default project.

A **governance write** — a human session only.

Refused while the project still holds account kits or child projects an operator created.
A project's rows cascade on delete and a child project cascades into every primitive under
it, so one verb would otherwise delete an organization's data. Archive it instead
([PATCH](/docs/api-reference/projects/update)), empty it first, or say you mean it with
`?cascade=true`.

The project's own default child project and default account kit do not count: every
project provisions those for itself the first time anything acts inside it, so counting
them would make an otherwise empty project undeletable the moment anyone looked at it.

The default project cannot be deleted, with or without `cascade`.

## The refusal names what is in the way

A refusal is a precondition, not a dead end, so it carries the blocking ids rather than
sending you to a second request to look them up:

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "invalid_input",
    "message": "Delete this project's account kits first",
    "hint": "They are listed in `details.account_kits`. Remove each with `DELETE /v1/projects/<project_id>/account-kits/<id>`, or repeat this request with `?cascade=true` to delete the project and everything inside it in one call.",
    "details": {
      "reason": "project_not_empty",
      "blocked_by": "account_kits",
      "account_kits": [{ "id": "9c1e…", "name": "workers" }],
      "more": false
    }
  }
}
```

`blocked_by` is `child_projects` when those are what is in the way, and `details.more` is
`true` when there are further rows beyond the first 50 listed.

## `cascade`

`?cascade=true` deletes the project together with its account kits and child projects.
Only an explicit affirmative (`true`, `1`, `yes`) counts — `false`, `0` and a bare
`?cascade` keep the guard, because the one thing worse than a project you cannot delete is
one deleted by a stray query string.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/projects/1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93 \
    -H "Authorization: Bearer $NAIVE_API_KEY"

  # …and, once you mean it, with everything inside it:
  curl -X DELETE "https://api.usenaive.ai/v1/projects/1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93?cascade=true" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "1a4d8c2f-3b5e-4a70-9c26-8e1f0b7d5a93",
    "deleted": true
  }
  ```
</ResponseExample>
