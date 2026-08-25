> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from defineConfig to defineProject

> Switch a naive.config.ts from the lenient defineConfig alias to the strict defineProject entrypoint — same validation, plus a define-time refusal for every declared field nothing consumes.

<Info>
  **This is a Naive → Naive guide.** `defineConfig` is a **permanent** `@deprecated` alias —
  it keeps today's lenient behavior byte for byte and is never removed — so switching is
  never urgent, only strictly better. There is no `Sunset` date on anything here.
</Info>

## Concept map

| `defineConfig` (lenient)                                                                                  | `defineProject` (strict)                                  | Note                              |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------- |
| A field nothing consumes applies green                                                                    | `declared_unconsumed: <path> …` refused at define time    | The one difference                |
| `naive up` warns per team: `⚠ team "…" DECLARED AND UNREAD: …`                                            | the config never evaluates, so nothing reaches `naive up` | Same list, earlier                |
| `agents:` prints a rename notice                                                                          | same rename notice — a notice, never a refusal            | `kits:` is the canonical spelling |
| all define-time refusals (`legacy_multi_team`, `brain_partition_unknown`, `governance_widens_company`, …) | identical — they run first, on both entrypoints           | Strict mode is additive           |

Both entrypoints return the config unchanged. A legacy config — one that declares
neither `company` nor `teams` — passes through `defineConfig` untouched, and gains only
the unconsumed-field pass under `defineProject`.

## Before / after

```ts theme={"theme":"css-variables"}
// before
import { defineConfig } from "@usenaive-sdk/iac";
export default defineConfig({ project: "acme", /* … */ });

// after
import { defineProject } from "@usenaive-sdk/iac";
export default defineProject({ project: "acme", /* … */ });
```

Then evaluate the config (`naive up --plan` is enough — it is read-only). Either it
passes, and you are done, or it refuses with one line per offending field:

```
Error: declared_unconsumed: company.residency is declared and NOT YET ENFORCED —
nothing consumes it, so it would apply green and enforce nothing. Remove the field
(reinstate it when a consumer lands), or keep this config on defineConfig, the lenient
legacy alias.
```

## What gets refused

The fields on the not-yet-consumed list today — declared, dropped (or carried and read
by nothing), enforced nowhere:

| Declared at         | Field                       |
| ------------------- | --------------------------- |
| `agent()` / `kit()` | `time`, `secrets`, `skills` |
| `team()`            | `time`                      |
| `runtime.durable()` | `workspace`                 |
| `company`           | `residency`                 |
| top level           | `modules:`                  |

For each one: **remove the field** (it was enforcing nothing — the refusal changes what
you know, not what runs), or keep the config on `defineConfig` until a consumer lands.
Wiring a field deletes its row from the one shared list, so strictness only shrinks.

**Not refused, on either entrypoint:** fields consumed by one runtime and reported in
`unconsumed` on the other — a hermes-led team's `agent({ model })`, `team({ review })`,
`spend`/`hardSpend`, `memory` — and the whole legacy surface (`runtime.pool()`,
`systems:`, `agentProfiles`, agent-level `runtime: "<pool>"` strings), which keeps
compiling and applying with a deprecation notice. See
[what `naive up` prints](/docs/getting-started/iac#what-naive-up-prints-beside-the-plan).

## Minimal viable migration

1. Rename the call: `defineConfig` → `defineProject` (import and call site).
2. Run `naive up --plan`. Fix each `declared_unconsumed` line by deleting the field.
3. Optionally rename `agents:` → `kits:` (and `agent()` entries to `kit()`) to clear
   the rename notice — identical output, one namespace, refused only if a name appears
   in both blocks (`kit_and_agent_duplicate`).

## What does not map yet

* There is no per-field opt-out. Strict mode is all of the list or none of it —
  a config that must keep one listed field stays on `defineConfig`.
* The strict pass covers the unconsumed list only. It does not (yet) validate the
  legacy `infrastructure` / `runtime` / `systems` blocks beyond what `defineConfig`
  already checks.
