> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Connected

> GET /v1/users/:user_id/connections/connected — local mirror (lazy-reconciled).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/USER_ID/connections/connected \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Reads from Naive's connections mirror — cheap, no live provider call. INITIATED rows
older than \~10s are refreshed from the connections provider before responding. See
[Connection status](/docs/architecture/connection-webhooks).
