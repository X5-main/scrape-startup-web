> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# logs

> Per-user activity events.

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(alice.id).logs.query({
  action: "vault.put",
  limit: 50,
});
```

Returns `LogEvent[]`. For cross-user queries, use the REST `/v1/logs` endpoint.
