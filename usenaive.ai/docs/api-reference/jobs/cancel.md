> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Job

> DELETE /v1/jobs/:id — Cancel a queued or processing job.

Only works for jobs in `queued` or `processing` state. No credits are charged for cancelled jobs.

<ParamField path="id" type="string" required>
  Job UUID
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/jobs/job-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "job-uuid",
    "status": "cancelled",
    "credits_refunded": 0
  }
  ```
</ResponseExample>
