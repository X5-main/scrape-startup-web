> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# memory

> Legacy per-tenant agent memory (frozen). New work uses the brain.

<Warning>
  **Deprecated — `memory` is the legacy orchestration runtime's memory surface.** It is FROZEN:
  it keeps answering, nothing is removed, and it accepts no new capabilities. The store it writes
  to is owned by the tenant's legacy container.

  **Use instead:** [`brain`](/docs/sdk/sub-clients/brain) — `brain.remember()` writes a durable episode
  and returns after the write; `brain.recall()` reads it back. There is **no sunset date**:
  `memory` is frozen, not scheduled for removal.
</Warning>

```ts theme={"theme":"css-variables"}
const { memories } = await naive.memory.list();
await naive.memory.add({ content: "Customer prefers concise weekly reports" });
await naive.memory.remove(memoryId);
```

<Warning>
  **`add()` does not write a fact — it sends a request.** Measured against the mounted route:
  `POST /v1/users/{id}/memory` posts the prose string
  `"Please add the following to your memory (target: MEMORY.md): …"` to the legacy container's
  `/ceo/run` and responds `201 { status: "memory_requested" }`
  (`packages/api/src/routes/memory.ts:63-68`). The direct table insert exists only as a
  development fallback behind a `NODE_ENV !== "development"` re-throw.

  So a **resolved `add()` means the request was delivered, not that a row exists**, and a
  subsequent `list()` may not show it. If you need a write you can read back, use
  [`brain.remember()`](/docs/sdk/sub-clients/brain), which persists the episode before responding.
</Warning>

Available on the root (default user) and `naive.forUser(id)`.

<Info>
  **Enablement differs, and it will bite on day one of a migration.** `memory` carries no
  `optIn` flag in the primitive registry, so it is **enabled by default**. `brain` is
  `optIn: true` — a call with no kit entry is **denied**, not silently empty. Enable `brain` on
  the tenant's [Account Kit](/docs/architecture/account-kits) before you move any traffic.
</Info>

See the [Brain guide](/docs/getting-started/brain).
