> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Who Am I

> GET /v1/auth/me — Get current auth context (agent + company).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/auth/me \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "agent_id": "uuid",
    "agent_name": "Research Bot",
    "company_id": "uuid",
    "company_name": "Acme Corp"
  }
  ```
</ResponseExample>
