> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# toolkits

> Browse the catalog of connectable third-party apps (root client only).

`naive.toolkits` is a **control-plane** accessor: it lists the catalog of apps a tenant could
connect. Root client only — there is no `forUser(id).toolkits`, because the catalog is the
same for every tenant; what differs is which entries their Account Kit allows.

```ts theme={"theme":"css-variables"}
const { toolkits, nextCursor } = await naive.toolkits.list({ search: "slack", limit: 50 });

// Page through
let cursor: string | null = null;
do {
  const page = await naive.toolkits.list({ cursor: cursor ?? undefined, limit: 100 });
  cursor = page.nextCursor;
} while (cursor);
```

| Method                               | HTTP               | Notes                                                 |
| ------------------------------------ | ------------------ | ----------------------------------------------------- |
| `list({ search?, cursor?, limit? })` | `GET /v1/toolkits` | Cursor-paginated. Returns `{ toolkits, nextCursor }`. |

To act on a **connected** app for one tenant — list connections, start OAuth, enumerate an
app's tools, execute one — use [connections](/docs/sdk/sub-clients/connections), which is
tenant-scoped and filtered by that tenant's kit. Which toolkits a kit permits is set by
`connections_config` on the [Account Kit](/docs/architecture/account-kits).
