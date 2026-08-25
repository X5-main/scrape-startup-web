> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Types

> Exported TypeScript types.

The SDK exports types for every request/response. All of them ship in the bundled `.d.ts`.

<Warning>
  **Most sub-client methods are not yet typed at the return, and the snippets in this section
  show the *wire* shape rather than the *declared* shape.** Measured on the shipped package:
  **129 of the 241** methods across the 32 resource clients have no explicit `Promise<T>`
  annotation, so TypeScript infers `unknown` (or `{}`) from the HTTP layer.

  The bodies documented on each sub-client page are what the API really returns — but a snippet
  like `const app = await naive.apps.create(…); app.id` **will not compile** until you name the
  shape yourself:

  ```ts theme={"theme":"css-variables"}
  const app = (await naive.apps.create({ name: "My Product", type: "fullstack" })) as { id: string };
  ```

  Where a method *is* annotated (`users.*`, `accountKits.*`, `connections.connected`,
  `llm.chat`, `plans.*`, `toolkits.list`, the whole durable-runtime and brain surface) the
  declared type is authoritative. This gap is in the SDK, not in these pages; it is recorded
  here once rather than repeated on every page.
</Warning>

## The flat resource API

```ts theme={"theme":"css-variables"}
import type {
  NaiveOptions,
  TenantUser,
  AccountKit,
  AccountKitConnectionsConfig,
  AccountKitMode,        // "open" | "allowlist" | "blocklist"
  ConnectionInfo,
  ConnectResult,
  PendingApproval,
  VaultEntrySummary,
  LogEvent,
  SessionInfo,
} from "@usenaive-sdk/server";
```

`ScopedClient` (returned by `naive.forUser(id)`) and the `Naive` root class are also exported
as values.

## The durable runtime and the brain

```ts theme={"theme":"css-variables"}
import type {
  AnyConfig,             // the minimum shape createClient<C>() needs
  Teams,                 // typed team accessor derived from your config
  CreateClientOptions,
  Decision,              // { decision: "allow"; value } | { decision: "park"; approvalId; … }
  Run,
  RunEvent,
  RunLedger,
  RunArtifact,
  RunStatus,             // "queued" | "running" | "blocked" | "completed" | "failed" | "cancelled"
  RunOutcome,            // "done" | "unverified" | "failed"
  ListRunsQuery,
  StartRunInput,
  CompleteRunInput,
  BrainCapsule,
  BrainProposal,
  BrainProposalStatus,
  BrainProposeInput,
  BrainProposeResult,
  BrainRememberInput,
  BrainRecallInput,
  BrainForgetInput,
  BrainPromoteInput,
  BrainWriteReason,
  BrainList,             // GET /v1/brain — {knowledge_bases, count}
  CreateBrainInput,      // POST /v1/brain — {name?, is_default?}
  BrainConnection,       // one agent→brain connection
  BrainConnectionFilter, // the two filters GET /v1/brain/connections accepts
  MissingRoute,          // one row of the refusal registry
  MissingRouteKey,
} from "@usenaive-sdk/server";
```

The matching values:

```ts theme={"theme":"css-variables"}
import {
  createClient,
  NaiveClient,
  BrainHandle,
  BrainView,
  BrainsHandle,          // naive.brains — the collection
  BrainRef,              // naive.brains.get(x) — one named brain
  TeamRef,
  TeamTenantHandle,
  AgentHandle,
  RunsHandle,
  asDecision,
  MISSING_ROUTES,
  refuse,
} from "@usenaive-sdk/server";
```

## Errors

```ts theme={"theme":"css-variables"}
import {
  NaiveError,
  NotImplementedError,
  isNaiveErrorCode,
  denialOf,
  digestsOf,
  NAIVE_ERROR_CODES,
} from "@usenaive-sdk/server";

import type {
  NaiveErrorCode,        // the closed union of all 36 codes
  GovernanceErrorCode,
  DeployErrorCode,
  BrainErrorCode,
  TransportErrorCode,
  DenialDetail,
  DigestMismatch,
} from "@usenaive-sdk/server";
```

<Note>
  **`NaiveError.code` is typed `string`, not `NaiveErrorCode`.** Narrowing the property would
  make every existing `e.code === "some_other_code"` comparison a compile error in customer code
  and break every `new NaiveError(status, someString, …)` call. The closed union ships beside it,
  with `isNaiveErrorCode()` as the runtime narrowing. See
  [Governance](/docs/sdk/governance).
</Note>

## Agent tools

```ts theme={"theme":"css-variables"}
import type { NaiveAgentToolset, AnthropicTool } from "@usenaive-sdk/server";
```

## In-agent

Types for code running *inside* an agent live in a different package —
[`@usenaive-sdk/runtime`](/docs/sdk/in-agent): `AgentHandle`, `CreateAgentOptions`, `AgentEnv`,
`WorkspaceEntry`, `Teammate`, `AgentMemorySlot`, and the `Brain*` input/outcome types.
