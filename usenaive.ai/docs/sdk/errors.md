> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Errors

> The typed NaiveError thrown by every SDK method.

Every method throws a `NaiveError` on a non-2xx response:

```ts theme={"theme":"css-variables"}
import { Naive, NaiveError } from "@usenaive-sdk/server";

try {
  await naive.forUser(alice.id).connections.connect("slack");
} catch (err) {
  if (err instanceof NaiveError) {
    console.log(err.status); // HTTP status
    console.log(err.code);   // canonical code
    console.log(err.hint);   // actionable hint, when present
  }
}
```

## Common codes

| Code                     | Meaning                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `not_found`              | Resource (or cross-tenant user) not in your workspace                                                          |
| `forbidden`              | Blocked by the user's AccountKit (e.g. `toolkit_not_allowed`, `tool_not_allowed`, `primitive_disabled_by_kit`) |
| `feature_not_configured` | Connections provider or Vault KMS not configured on the API                                                    |
| `invalid_input`          | Bad request body / params                                                                                      |
| `provider_error`         | Upstream provider (connections/KMS) failure                                                                    |
| `not_implemented`        | The SDK method has no mounted route — see below. Nothing was sent.                                             |

## Pending approval is not an error

A sensitive call gated by the user's AccountKit returns **HTTP 202** with
`{ status: "pending_approval", approval_id }`. This is a *success-with-deferral*
— it does **not** throw. The gated methods (`cards.create`, `domains.purchase`,
`verification.start`, `formation.submit`, `connections.connect`, …) resolve to
either their normal result or a `PendingApproval`. Discriminate with the typed
helper:

```ts theme={"theme":"css-variables"}
import { isPendingApproval } from "@usenaive-sdk/server";

const res = await naive.forUser(alice.id).cards.create({ name: "Ads", spendingLimitCents: 50000 });
if (isPendingApproval(res)) {
  // queued — a human must approve it (res.approval_id)
} else {
  // executed normally
}
```

`asDecision(res)` folds the same thing into a tagged union when you would rather branch on
`res.decision` than call a predicate. See [Governance](/docs/sdk/governance) for the full
allow / park / deny model.

## `NotImplementedError` — a route this control plane does not mount

Eight methods on the durable-runtime handles have no mounted route. They do not return `{}`
and they do not guess at a path: each throws `NotImplementedError` naming the exact
`METHOD /path` it would have called, and **sends nothing**.

```ts theme={"theme":"css-variables"}
import { NotImplementedError, MISSING_ROUTES } from "@usenaive-sdk/server";

try {
  await support.workspace.readFile("/src/index.ts");
} catch (err) {
  if (err instanceof NotImplementedError) {
    // err.message names the route; the whole registry is readable as data
    console.log(Object.keys(MISSING_ROUTES).length);
  }
}
```

<Warning>
  **`NotImplementedError` means the route does not exist — not that it is unfinished.** A route
  that IS mounted but has no backing store answers `501 not_configured` and arrives as an
  ordinary `NaiveError` with `details.missing` listing what the server is waiting on. The client
  never pre-empts that: it is more specific than anything this package could guess, and it stops
  being returned the day the dependency lands. If you want to treat "not built yet" as one case,
  match on both:

  ```ts theme={"theme":"css-variables"}
  const notBuiltYet =
    err instanceof NotImplementedError || (err instanceof NaiveError && err.code === "not_configured");
  ```
</Warning>

`NotImplementedError` extends `NaiveError`, so a generic `catch (err) { if (err instanceof
NaiveError) … }` still handles it — check for the subclass first if you want to treat "no such
route" differently from "the server said no". See
[Teams & the durable runtime](/docs/sdk/teams) for the full wired-vs-refuses table.

## The closed code union

`NaiveError.code` stays typed `string` so existing comparisons keep compiling. The closed
union of all 36 codes ships alongside as `NaiveErrorCode`, with `isNaiveErrorCode()` to narrow
and `denialOf(err)` to pull out a structured denial. See
[Governance → the denial vocabulary](/docs/sdk/governance).

See [Approvals](/docs/getting-started/approvals).
