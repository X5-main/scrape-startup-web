> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Usage

> GET /v1/usage — Credit usage history.

<ParamField query="days" type="number" default="30">
  Number of days to look back
</ParamField>

<ParamField query="limit" type="number" default="50">
  Max transactions (max 200)
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/usage?days=30&limit=50" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "balance": 15000,
    "tier": "pro",
    "transactions": [
      {
        "id": "uuid",
        "action": "email_send",
        "amount": -10,
        "reference": "msg-uuid",
        "created_at": "2026-05-02T10:30:00Z"
      },
      {
        "id": "uuid",
        "action": "job_completion",
        "amount": -50,
        "reference": "job-uuid",
        "created_at": "2026-05-02T10:31:02Z"
      }
    ],
    "summary": {
      "emails_sent": 5,
      "searches": 12,
      "images_generated": 3,
      "videos_generated": 1
    }
  }
  ```
</ResponseExample>
