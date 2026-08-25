> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Toolkit Catalog (company)

> GET /v1/toolkits — the full, unfiltered third-party app catalog.

The **company-level** toolkit catalog. Unlike `GET /v1/users/:id/connections` (which is
filtered by the user's Account Kit), this returns the **full** app catalog — used by
the Account Kit editor's searchable allow/block picker, where you need to browse every
available toolkit independent of any single user.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/toolkits?search=git&limit=20" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Query params: `search`, `cursor`, `limit` (max 50). Returns `{ toolkits, nextCursor,
totalPages }` where each toolkit is `{ slug, name, logo, isNoAuth }`.

Requires `COMPOSIO_API_KEY` to be configured on the API. Company-scoped auth (session or
api key); no user scope needed.
