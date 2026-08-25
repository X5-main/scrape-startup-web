> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Status

> GET /v1/images/:jobId — Check image generation job status.

Convenience alias for `GET /v1/jobs/:id` that validates the job is an image generation job.

<ParamField path="jobId" type="string" required>
  Job UUID from the generate response
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/images/job-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>
