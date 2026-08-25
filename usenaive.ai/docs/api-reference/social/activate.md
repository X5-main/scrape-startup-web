> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Activate Social

> POST /v1/social/activate — Activate social posting for your team.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/activate \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "activated": true,
    "team_count": 1,
    "team_id": "team-uuid"
  }
  ```
</ResponseExample>

**Note:** `team_id` is only returned on first activation. Re-activating an already-active company returns `{ "activated": true, "team_count": N }` without the team ID.
