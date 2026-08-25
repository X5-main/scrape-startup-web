> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migration guides

> Canonical index of third-party → Naive migration guides — same capability, one governed identity.

These guides help you move agent workloads from standalone vendor APIs to Naive primitives. Each guide maps the vendor's core path, shows a minimal swap, and calls out what does **not** map yet.

<Note>
  Third-party product names and logos in these guides are trademarks of their respective owners, used here for identification and comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

## Naive → Naive

When Naive itself supersedes one of its own surfaces, the guide lives here. Same five sections;
the "vendor" is a previous version of Naive. Nothing on either path is removed — every route, CLI
command and DSL symbol named in the **From** column keeps answering.

| Guide                                                                           | From                                                                          | To                                                                           | When to use                                                                                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [defineConfig → defineProject](/docs/migration-guides/defineconfig-to-defineproject) | `defineConfig(...)` (lenient, permanent alias)                                | `defineProject(...)` (strict: `declared_unconsumed` refusals at define time) | You author a `naive.config.ts` and want a declared-but-unconsumed field to refuse instead of applying green                   |
| [Legacy orchestration](/docs/migration-guides/legacy-orchestration-to-durable-teams) | `runtime.pool()` + `systems:` + the ceo/tasks/objectives/employees primitives | `runtime.durable()` + `team({ lead, agents })`                               | You have a `naive.config.ts` with `systems:` or `agentProfiles:`, or you call `naive ceo` / `naive tasks` / `naive employees` |
| [Memory → Brain](/docs/migration-guides/memory-to-brain)                             | `naive memory add` · `/v1/memory` · `MEMORY.md`                               | `naive brain remember` / `naive brain recall`, with a stated retention       | You store agent context with the `memory` primitive                                                                           |

The entrypoint guide is separate from the orchestration one because they move different
things: renaming the call changes when a config refuses, not where anything runs; the
orchestration guide moves the workload itself. The remaining two differ by blast radius: `memory` is on by default;
`brain` is **opt-in**, and a gated call with no kit entry is a refusal. Merging them would bury
the one fact that breaks a real migration on day one.

## Third-party → Naive

| Guide                                              | From                                                 | Naive primitive                                                         | When to use                                     |
| -------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| [Composio](/docs/migration-guides/composio)             | [Composio](https://composio.dev) tool auth           | [`/connections`](/docs/getting-started/connections)                          | OAuth tool connect + execute                    |
| [Stripe Issuing](/docs/migration-guides/stripe-issuing) | [Stripe Issuing](https://stripe.com/issuing)         | [`/cards`](/docs/getting-started/cards)                                      | Virtual card issue, fund, spend                 |
| [AgentMail](/docs/migration-guides/agentmail)           | [AgentMail](https://agentmail.to)                    | [`email`](/docs/getting-started/email)                                       | Agent inbox send/receive                        |
| [Portkey](/docs/migration-guides/portkey)               | [Portkey](https://portkey.ai) gateway                | [`/llm`](/docs/getting-started/llm)                                          | OpenAI-compatible multi-model routing           |
| [Twilio](/docs/migration-guides/twilio)                 | [Twilio](https://www.twilio.com/docs/messaging) SMS  | [`phone`](/docs/getting-started/phone)                                       | US number provision + SMS                       |
| [Persona](/docs/migration-guides/persona)               | [Persona](https://withpersona.com) inquiries         | [`verification`](/docs/getting-started/verification)                         | Founder KYC before formation                    |
| [Doola](/docs/migration-guides/doola)                   | [Doola](https://www.doola.com) Formation API         | [`formation`](/docs/getting-started/formation)                               | US LLC incorporation                            |
| [E2B](/docs/migration-guides/e2b)                       | [E2B](https://e2b.dev) sandboxes                     | [`compute`](/docs/getting-started/compute)                                   | Isolated code execution                         |
| [GoDaddy](/docs/migration-guides/godaddy)               | [GoDaddy](https://developer.godaddy.com) Domains API | [`domains`](/docs/getting-started/domains)                                   | Search, buy, DNS                                |
| [Alpaca](/docs/migration-guides/alpaca)                 | [Alpaca](https://alpaca.markets) Trading API         | [`trading`](/docs/getting-started/trading)                                   | Stocks, options, crypto orders                  |
| [Tavily](/docs/migration-guides/tavily)                 | [Tavily](https://tavily.com) search/extract          | [`search`](/docs/getting-started/search)                                     | Web research, URL extract, multi-source answers |
| [Amazon SQS](/docs/migration-guides/aws-sqs)            | [Amazon SQS](https://aws.amazon.com/sqs/)            | [`queue`](/docs/getting-started/queue)                                       | Durable per-tenant work queues                  |
| [ElevenLabs](/docs/migration-guides/elevenlabs)         | [ElevenLabs](https://elevenlabs.io) TTS/voice clone  | [`voice`](/docs/getting-started/voice)                                       | Voice clone + text-to-speech                    |
| [Lago](/docs/migration-guides/lago)                     | [Lago](https://getlago.com) metering/billing         | [`customer-billing`](/docs/getting-started/customer-billing)                 | Plans, subscriptions, usage quotas              |
| [Ayrshare](/docs/migration-guides/ayrshare)             | [Ayrshare](https://www.ayrshare.com) social API      | [`social`](/docs/getting-started/social)                                     | Multi-network posting + analytics               |
| [Appetize.io](/docs/migration-guides/appetize)          | [Appetize.io](https://appetize.io) cloud devices     | [`mobile`](/docs/getting-started/mobile)                                     | Hosted Android/iOS device streaming             |
| [Replicate](/docs/migration-guides/replicate)           | [Replicate](https://replicate.com) predictions API   | [`images`](/docs/getting-started/images) + [`video`](/docs/getting-started/video) | Text-to-image / text-to-video generation        |
| [Doppler](/docs/migration-guides/doppler)               | [Doppler](https://doppler.com) secrets               | [`vault`](/docs/getting-started/vault)                                       | Per-user encrypted secrets                      |

## Shared migration pattern

Every guide follows the same shape:

1. **Concept map** — vendor object ↔ Naive primitive
2. **Before / after** — smallest working code swap
3. **Minimal viable migration** — ship without rebuilding everything
4. **Consolidation gains** — one [tenant user](/docs/getting-started/users) across cards, email, vault, connections, and more
5. **What does not map yet** — honest gaps before you commit

Install the Node SDK once for all guides:

```bash theme={"theme":"css-variables"}
npm install @usenaive-sdk/server
```

Set `NAIVE_API_KEY` from the [dashboard](https://dashboard.usenaive.ai). Examples use `@usenaive-sdk/server` against `https://api.usenaive.ai/v1` unless noted.

## Before you start

* Pick the guide that matches **one** vendor you are replacing — do not assume feature parity across primitives.
* Read each guide's **What does not map yet** section; several vendors have capabilities Naive does not mirror today.
* Confirm webhook event types with `GET /v1/webhooks/event-types` before depending on inbound events.
* Scope migrations to what Naive actually ships — e.g. Persona and Doola guides target **founder / formation** flows, not arbitrary end-user KYC or every entity type Doola supports.

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — the migration thesis behind this index
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — multi-tenant identity model every migration anchors to
* [Secrets management for AI agents](https://usenaive.ai/blog/secrets-management-for-ai-agents) — vault patterns (see the [Doppler](/docs/migration-guides/doppler) guide)
* [The Governed Agent Profile](https://usenaive.ai/blog/the-governed-agent-profile) — spend caps, approvals, and revoke on every primitive
