> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Video Status

> GET /v1/video/:jobId — Check video generation job status.

Convenience alias for `GET /v1/jobs/:id` that validates the job is a video generation job.

<ParamField path="jobId" type="string" required>
  Job UUID from the generate response
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/video/job-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>
