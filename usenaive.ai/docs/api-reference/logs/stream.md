> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Stream Logs

> GET /v1/users/:user_id/logs/stream — SSE live tail.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -N https://api.usenaive.ai/v1/users/USER_ID/logs/stream \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Server-Sent Events stream of `activity.logged` events for the user as they happen. The
bearer travels in the Authorization header.
