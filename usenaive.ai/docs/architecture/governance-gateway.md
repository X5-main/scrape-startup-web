> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Governance Gateway

> The credential-injection policy proxy at the tool-call boundary — caps, approvals, audit, revoke.

The **governance gateway** is the mechanism that makes Naïve's spend caps,
approvals, audit, and revoke *real* across the whole agent profile bundle — identity,
money, and comms together — regardless of where the agent runs.

## How it works

Inside the agent, tools are **handles, never raw secrets**. When the model calls
`cards.charge($48)`:

1. The runtime shim sends the call to the **Naïve gateway** — not to the card processor.
2. The gateway authenticates the agent profile's scoped token and loads policy, budget, balance.
3. Policy check: allowed? under cap? crosses the approval threshold?
4. **Allowed →** the gateway (which holds the real issuing credential, never the agent) calls the processor, records the action, and decrements the budget.
5. **Needs approval →** the action is parked, the approver is notified, and it returns `pending`; it executes on approve.
6. **Denied →** one clean, structured denial, logged. No retry storm.

The same pattern governs identity actions and comms (sending mail/SMS), so caps,
approvals, audit, and revoke apply across the **whole agent profile**, not just the card.

The budget is a **combined cost ceiling**: real-world spend (cards/trading) and
platform credits (LLM, search, compute, hosted runtime) are summed against one cap.
The ledger those are summed in resolves **fractions of a cent** (four decimal
places), so the primitives priced below a cent — a URL read at 0.25¢, an email at
0.08¢, a brain query at 0.4¢ — accumulate toward the cap and eventually cross it
instead of each rounding to a free action. A cap in whole cents therefore still
refuses the cheapest call an agent can make; it just takes a few hundred of them.
Hard caps are reserved atomically before execution (no concurrency race) and return
`403 budget_exceeded`; soft caps route to approval; exhausting a hard cap or the
company's credit balance **auto-stops the agent profile's hosted runtime**. Each agent profile
holds its own scoped key(s) — list / rotate / revoke them per agent profile
(`/v1/agent-profiles/:id/keys`) without touching the company key.

The cap binds on both transports: the scope it is enforced inside is bound around every
HTTP request *and* around every MCP tool call. What differs between the two is the
breadth of the **primitive** gate and of the capability/approval verdict — see
[MCP binds the subject policy, but a much smaller kit gate](#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate).

## Why it can't be bypassed

The agent holds a **per-agent profile scoped key** (sealed to the agent profile's
`tenant_user` at provision time), never the company key and never the underlying
provider credentials (card issuer, formation, KYC, email, SMS) — those live behind
the gateway in the encrypted vault. So the agent can only ever ask; the gateway
decides, executes, and records. `revoke()` suspends the agent profile, releases its
runtime slot, and cascades to sub-agents. Sub-agent kits are scoped-**down**
derivations of the parent (capabilities can only narrow; budget is shared), closing
the confused-deputy hole.

`revoke()` is absolute for anything that acts, and HTTP reads are the exception: a
revoked profile's key is refused `403 agent_profile_revoked` on every *mutating* HTTP
call and on every MCP tool call, but `assertAgentProfileActive` runs only for
`MUTATING_METHODS`, so a `GET` is decided as though the profile were active. Plan a
revocation as "stop it acting", and revoke or rotate the key as well when you need it
to stop seeing.

Self-hosting the runtime does not bypass it, because governance is at the tool-call
boundary, not inside the runtime: a BYO-runtime agent holding a scoped key hits the
same subject policy as a Naïve-hosted one, on either transport. What it does *not* get on MCP is the full breadth of the kit's primitive gate
— [see below](#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate).

## Where the kit binds — and the two places it does not

The AccountKit binds to the **resolved subject** of a request
([subject resolution](/docs/architecture/subject-resolution)). It therefore governs:

* callers on the per-agent-profile mounts (`/v1/users/:user_id/...`), and
* callers authenticating with a key **sealed** to a profile (`active_tenant_user_id`).

<Warning>
  **It does not currently govern agents running inside a legacy orchestration container.**
  Those agents call the *company-level* mounts (`POST /v1/email/send`, `/v1/cards`,
  `/v1/phone`, `/v1/social` — none of which carry a primitive gate) with a container key
  minted **without** an `active_tenant_user_id`, so they resolve to the **company**
  subject rather than to their own kit. For those agents a policy written on the profile
  is **declarative**: stored and readable, not enforced.

  This gap is pre-existing and is scoped to the frozen legacy runtime. It is one of the
  reasons new work belongs on [the durable runtime](/docs/architecture/durable-runtime), where
  the tenant is part of the address.
</Warning>

### The second place: MCP binds the subject policy, but a much smaller kit gate

The MCP dispatcher resolves the same subject the HTTP chain does, and — as of this
revision — applies the same two subject-policy steps around every tool call: the
revocation check and the agent-profile budget scope. What it does **not** apply at the
same breadth is the kit's *primitive* gate, and the governor's capability/approval
verdict reaches only the tools that ask for it.

| Control                                                              | HTTP                           | MCP                                                                             |
| -------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| Revoke (`assertAgentProfileActive`)                                  | mutating requests only         | **every tool call**, reads included — stricter, see below                       |
| Combined cost ceiling (`runInSubjectBudgetScope`)                    | bound around every request     | bound around every tool call                                                    |
| Spend attribution (`recordTenantSpend`)                              | inside that scope              | inside that scope                                                               |
| Kit primitive gate                                                   | `gatePrimitive()` on the mount | 23 of 271 tools at the dispatcher + 26 in-handler — **222 assert no primitive** |
| Capability (`can`) / approval (`approve`) / soft caps — the governor | every guarded route            | **28 of 271** tool registrations, via `mcpGuard`                                |

**Revoke is stricter here than on HTTP, deliberately.** An HTTP request has a method, so
the chain can refuse writes and leave reads observable. A tool call has no method, and
`readOnlyHint` is declared for only 14 of 271 tools — a partition that would let 9
through and refuse 262 is a coin toss, not a rule. So a revoked or suspended profile is
refused *every* tool call on this transport. That is a tightening, and it means the
HTTP-side carve-out is the weaker of the two: **revocation still does not gate HTTP
reads.** A `GET` from a revoked profile's key is never asked the question at all — it is
decided by the primitive gate as though the profile were active.

The primitive gate is where MCP is genuinely thinner: 222 of the 271 tools assert no
kit primitive at all, so switching a primitive off in the AccountKit stops 49 tools and
not the other 222. And `agent({ can })` / `limits.approve` are enforced on MCP only
where a handler calls `mcpGuard` — the card, trading, formation, verification,
domain-purchase, phone/mobile provisioning, compute, browser-signup,
connections-connect and send-email verbs, plus the three destructive brain verbs. The
approval guarantee holds for the sensitive money-and-identity actions, but a capability
rule about, say, search or image generation is not consulted on this transport.

**Which levers work on an open MCP session.** The subject and the kit are re-read on
every call, so revoking the profile, switching a primitive off, or a capability deny all
take effect immediately — no reconnect needed. Revoking or rotating the *key* blocks new
sessions and any message that re-presents `Authorization`, but the `AuthContext` is
resolved once at SSE connect and cached for the life of the connection, so a client that
sends the header only on connect keeps its session until it disconnects. Tool *listings*
are a connect-time snapshot for the same reason: a revoked profile is still offered all
271 tools and refused every one of them — see [the MCP tool list](/docs/mcp/tools).

Before the one-tail dispatcher landed, the MCP layer applied neither the revocation
check nor the budget scope. If you are running an older build, treat revoke and
`limits.budget` as HTTP-only controls there.

## How it maps to the platform

| Concept                              | Implementation                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy (allow/deny, caps, approvals) | [AccountKit](/docs/architecture/account-kits) attached to each agent profile                                                                                                                           |
| Human-in-the-loop                    | The [approvals](/docs/architecture/approvals) queue (sensitive actions return `pending_approval`)                                                                                                      |
| Enforcement point                    | Every per-agent profile primitive route, and the MCP dispatcher — [with a narrower primitive gate](#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate)                    |
| Audit                                | Per-agent profile [activity log](/docs/getting-started/logs) — `GET /v1/users/:user_id/logs`, plus the live SSE stream at `GET /v1/events`                                                             |
| Revoke                               | `agentProfile.revoke()` / `POST /v1/agent-profiles/:id/revoke` — suspends the agent profile; every subsequent **mutating HTTP** call and **every** MCP tool call `403`s. HTTP reads are not gated |

Native observability is required for governance, so the control plane already
records every tool call, spend, and decision — and exports it with no extra module.

## Two planes, one policy

You declare one agent's `can` / `limits`; the control plane routes it to two planes:

* **Business-action governance (we own this)** — budgets, spend caps (enforced at
  authorization), HITL approvals, capability allow/deny, audit, instant revoke —
  at the tool-call boundary, across the whole agent profile bundle. Caps and revoke
  bind on both transports; capability allow/deny and approvals bind on every HTTP
  primitive route and on the 28 guarded MCP tools.
* **System governance** — the runtime container's network / filesystem / process
  isolation. A different layer with different failure modes; we do not claim to replace
  it.

## Native observability + the native-vs-module rule

The control plane already records every tool call, spend, and decision — it has
to, to govern. The rule for any cross-cutting concern: *does the control plane need it
to govern?* Yes → native (tracing, secrets, identity). No → a module.

Read the audit trail over the API: there is no telemetry exporter or third-party
observability integration in the shipped platform today. What exists is the
[activity log](/docs/getting-started/logs) (`GET /v1/users/:user_id/logs`, plus the
cross-tenant `GET /v1/logs`) and the SSE stream at `GET /v1/events`.
