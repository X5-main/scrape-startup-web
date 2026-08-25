> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# In-agent SDK (`self`)

> What code running inside a Naïve-hosted agent can reach about itself — tools, the shared brain, its own context, its workspace and its teammates.

`@usenaive-sdk/runtime` is for code running **inside** a hosted agent. The agent boots with
its credentials injected as environment variables (never baked into the image, never on the
agent's filesystem); this package reads them and hands back one root, `self`.

```bash install theme={"theme":"css-variables"}
npm install @usenaive-sdk/runtime
```

```ts agent.ts theme={"theme":"css-variables"}
import { self } from "@usenaive-sdk/runtime";

const capsule = await self.brain.attach({ goal: "Resolve ticket 91." });
const tools   = self.tools.definitions();
const notes   = await self.workspace.read("notes/ticket-91.md");
const roster  = await self.teammates.list();
```

## One root, six namespaces

| Namespace        | What                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `self.tools`     | The governed toolset — `definitions()`, `handle(name, input)`, `toolset()`.                                                               |
| `self.brain`     | The brain **this run is bound to** — `attach`, `recall`, `think`, `remember`, `consolidate`. Takes no identifier; the write path is here. |
| `self.brains`    | The company's **other** brains — `list()`, `get(nameOrId)`, `ref(id)`, `default()`. **Read-only.**                                        |
| `self.memory`    | This agent's own context slots — `list()`. Read-only.                                                                                     |
| `self.workspace` | This agent's files — `read`, `write`, `exists`, `list`, `resolve`.                                                                        |
| `self.teammates` | `list()` and `delegate(assignee, input)`.                                                                                                 |

Plus the identity it booted with: `self.id`, `self.company`, `self.tenant`.

<Note>
  **`self.brain` takes no scope identifier, and that is the enforced rule.** The run's view is
  the run's view, resolved from the credential the container injected — which is why "write
  into someone else's scope" is *unwritable* rather than merely refused.

  A **company**, a **partition** and a **lane** remain unnameable from anywhere on `self`: no
  mounted route accepts a partition or a lane at all. A **knowledge base** is nameable, and
  always was — the agent's own governed toolset declares `knowledge_base_id` on
  `brain.recall`, `think`, `graph`, `timeline`, `query` and `documents`, and ships
  `brain.list`. `self.brains` gives that existing reach a typed accessor; it grants nothing
  new.
</Note>

### Reads may name another brain; writes may not

```ts theme={"theme":"css-variables"}
import { self } from "@usenaive-sdk/runtime";

const { knowledge_bases } = await self.brains.list();
const legal = await self.brains.get("Legal Brain");     // costs a list()
const cited = await legal.recall({ query: "MSA signature authority" });

// Which corpus does `self.brain.remember()` write into? This one:
const bound = await self.brains.default();
```

`self.brains` exposes exactly `self.brain`'s three **reads** — `recall`, `think` and the
graph/timeline pair — and no write. That line is not arbitrary: the agent's shipped toolset
forwards `knowledge_base_id` on every read and on **no** write, so a `remember` on a ref
would hand the in-agent SDK reach the tool surface withholds. Writes stay on `self.brain`,
which writes where the credential says.

<Note>
  **An agent cannot read its own brain connection from here, deliberately.** `self.id` comes
  from `NAIVE_AGENT_PROFILE_ID` and a connection is keyed on `agents.id` — a `connected()`
  here would query with an id from a different table and answer "not connected" for an agent
  that is. And the connection does not move `self.brain` anyway: it is a default honoured by
  the CLI's `--agent` and by `POST /v1/runs`'s `brain_knowledge_base_id`.
</Note>

## The brain is shared; `self.memory` is not the brain

`self.brain` is the **company** brain — the same trunk every agent on the company reads.
`self.memory` is the agent-level context that actually exists on this platform.

```ts theme={"theme":"css-variables"}
import { self } from "@usenaive-sdk/runtime";

// Shared, durable, company-scoped
await self.brain.remember({ content: "Acme prefers quarterly invoicing" });
const recall = await self.brain.recall({ query: "Acme invoicing" });
const think  = await self.brain.think({ query: "How should we bill Acme?" });
await self.brain.consolidate({ objective: "Bill Acme", learned: [/* subject/predicate/object */] });

// This agent's own slots
const { memories, count } = await self.memory.list();
```

<Warning>
  **There is no agent level on the brain.** No `brain_*` table has one, and no mounted brain
  route accepts a `partition` or a `lane`. Agent-level context is `self.memory` — a different
  namespace with a different lifetime — not a brain lane. Three of the eight designed brain
  verbs (`propose`, `learn`, `reaffirm`) have **no server route** and are therefore **absent**
  from this package rather than shipped as guaranteed 404s.
</Warning>

## Workspace

```ts theme={"theme":"css-variables"}
import { self } from "@usenaive-sdk/runtime";

await self.workspace.write("notes/ticket-91.md", "resolved");
const text   = await self.workspace.read("notes/ticket-91.md");
const exists = await self.workspace.exists("notes/ticket-91.md");
const entries = await self.workspace.list("notes");
```

Every path is relative to the agent's workspace root. A path that escapes it throws
`WorkspaceError` with `code: "workspace_path_escape"` — including via `..` and symlink-shaped
inputs — so an escape is a typed error you can catch, not a silent read of the host
filesystem.

## Teammates

```ts theme={"theme":"css-variables"}
import { self } from "@usenaive-sdk/runtime";

const { employees, count } = await self.teammates.list();
const task = await self.teammates.delegate("tier2", {
  goal: "Escalate ticket 91",
  context: "Customer is on the Pro plan and has been waiting 3 days.",
  priority: "high",
});
```

<Info>
  `delegate()` is governed by the **`tasks`** primitive, because no `teams.delegate` action id
  exists in the governance catalog. If a tenant's Account Kit disables `tasks`, delegation is
  denied.
</Info>

## Testing without a runtime

The same handle shape is constructible in a plain test process — **no environment, no
credential, no network**:

```ts theme={"theme":"css-variables"}
import { createAgent } from "@usenaive-sdk/runtime";

const agent = createAgent({
  transport: fakeTransport,   // assert what the agent would send
  toolset: fakeToolset,
  tenant: "tenant-under-test",
});
```

Hand in a `transport` and a `toolset` and assert the requests; production hands in nothing and
reads the injected environment. One shape, two carriers.

## The environment it reads

A hosted agent is handed `NAIVE_API_KEY`, `NAIVE_BASE_URL` (the container's governance proxy),
`NAIVE_COMPANY_ID` and `NAIVE_ACTIVE_USER_ID`. `self` resolves from those.

<Warning>
  **The older `agentProfile` export resolves differently, and today it resolves wrongly inside a
  real hosted agent.** `agentProfile` reads `NAIVE_AGENT_PROFILE_TOKEN`,
  `NAIVE_AGENT_PROFILE_USER` and `NAIVE_AGENT_PROFILE_ID` first — and **nothing in the platform
  writes those three names**. In a hosted agent it therefore lands on:

  * **base URL** — the public `api.usenaive.ai` instead of the container's governance proxy;
  * **subject** — `"default"`, the *company* default subject, instead of the agent's own sealed
    subject;
  * **credential** — its third fallback, `NAIVE_API_KEY`, which happens to work.

  `agentProfile` is **not deprecated** and its behaviour is deliberately byte-identical to what
  this package published at 0.1.2, because it is on npm and callers depend on it. But new code
  should use `self`, which resolves the names the container actually writes. If you must keep
  `agentProfile`, set the three `NAIVE_AGENT_PROFILE_*` variables yourself.
</Warning>

## BYO runtime

Running the agent in your own harness (LangGraph, your own loop, anything else)? Don't use
this package — use [`@usenaive-sdk/server`](/docs/sdk/overview) and pull `op.tools()` there instead.
Governance is identical either way; it is enforced server-side, not by which client you hold.

See also: [Teams & the durable runtime](/docs/sdk/teams) for the same runtime seen from outside.
