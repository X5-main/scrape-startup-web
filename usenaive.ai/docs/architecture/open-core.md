> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Open-core boundary

> What's open source vs first-party — drawn on "are we the regulated counterparty," not "do we host it."

Naïve is open-core. The line is **"are we the regulated counterparty of record,"
not "do we host it."**

## First-party (closed, on our API)

The regulated primitives — **identity/entity, money, comms, runtime**, and the
tool catalog. We're the issuer / KYB-and-formation entity / carrier registrant.
Forking the code doesn't let you issue a card or form an LLC, because the moat is
the operated regulated bundle and the per-tenant governance, not the SDK shape.

## Open (OSS on GitHub)

Cloud infrastructure (the Naive-managed `cloud` provisioner, with managed hosting as the upsell),
database, and custom modules. Anyone could run these; we host for
convenience. They compete with commodity hosted-backend platforms, so they are
**complements and distribution, never the headline.**

## The litmus test

> If we open-sourced this module, could someone run it without us?
>
> * **Yes** → open module.
> * **No, because we're the regulated counterparty** → first-party.

## What this means in practice

| Capability                                   | Tier                  | Why                                                                                                                                                                                 |
| -------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity / entity (KYB / EIN / formation)    | First-party           | We're the formation + KYB counterparty                                                                                                                                              |
| Money (card issuing, interchange)            | First-party           | We're the issuer of record                                                                                                                                                          |
| Comms (numbers, A2P/10DLC, email reputation) | First-party           | We're the carrier registrant                                                                                                                                                        |
| Runtime (hosted containers)                  | First-party (wrapped) | Operated; provider kept swappable                                                                                                                                                   |
| Cloud (apps/db/compute/queue)                | Open module           | Commodity; bring your own                                                                                                                                                           |
| Tracing / observability                      | Native                | Required to govern, so it is recorded natively and read back over the API ([activity log](/docs/getting-started/logs) + `GET /v1/events`). Third-party sink export is not shipped today. |
| Custom modules                               | Open                  | Authored by you                                                                                                                                                                     |

The SDK, CLI, templates, and skill onboarding are **distribution, not
defensibility** — the moat is the operated regulated bundle and the per-tenant
governance gateway.
