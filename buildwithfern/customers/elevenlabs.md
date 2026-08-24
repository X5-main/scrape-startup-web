# ElevenLabs scales voice AI infrastructure with Fern Docs & SDKs

- **1M+**: Combined SDK downloads per week
- **1.5M**: Unique docs users per month
- **200+**: Fern Editor commits per month

## ElevenLabs needed a unified platform as docs and SDKs outgrew separate tools

ElevenLabs started with a single text-to-speech API. As the product expanded into multiple product lines — spanning speech-to-text, conversational agents, creative tools, and more — each with its own endpoints, parameters, and workflows, their JavaScript and Python SDKs required thousands of changes per week to stay current.

ElevenLabs was already using Mintlify for documentation when the team started evaluating SDK auto-generation. It became clear how much value there was in having a single platform that handled both docs and SDK generation together, rather than stitching separate tools into a pipeline or building out a custom solution.

ElevenLabs started using Fern for their [developer documentation](https://elevenlabs.io/docs/overview/intro) and [SDKs](https://buildwithfern.com/learn/sdks/overview/introduction) in March 2024, and migrated their internal docs to Fern in July 2025.

> I used to work at Stripe, where they built their own SDK auto-generation in house. I know how much
> effort goes into it. It's one of those things that I'm very happy to buy, not build.
>
> Paul Asjes, Developer Experience Engineer at ElevenLabs

## A shared docs workflow and automated SDK pipeline that keeps pace with rapid product growth

Key capabilities ElevenLabs unlocked with Fern:

- **Deterministic SDK generation that coexists with custom code.** ElevenLabs' OpenAPI specification is the source of truth for their JavaScript/TypeScript and Python SDKs, with custom code layered on top. The API changes multiple times per day as product teams ship; SDKs release weekly, often with thousands of lines of new code. For that kind of volume, it's a requirement that the output is predictable — one reason ElevenLabs chose Fern is that the generators are [deterministic](https://buildwithfern.com/learn/sdks/overview/introduction), with no AI in the pipeline. SDK generation is no longer something the team manually maintains, and their SDKs now see over one million downloads per week.
- **A docs-as-code workflow flexible enough for everyone.** ElevenLabs' external documentation is maintained by two separate teams. The developer experience team owns technical content, including code snippets, API guides, and reference docs, and use Fern's CLI and GitHub integration to edit docs. The support team maintains product-focused documentation — dashboard screenshots, UI walkthroughs, step-by-step guides — entirely through the browser-based [Fern Editor](https://buildwithfern.com/learn/docs/writing-content/fern-editor), without touching the underlying Markdown. Because everything is git-backed, both workflows coexist in the same Fern-powered repo.
- **Internal documentation on Fern, replacing Google Sites.** ElevenLabs originally used Google Sites for internal documentation. That was fine when the company was a small startup, but as the team grew, the limitations became harder to ignore: no version control, no consistent structure, and an internal knowledge base that didn't match the polish of the external developer docs. Since ElevenLabs was already on Fern for external documentation, expanding to internal docs was a natural step. Their internal docs are now gated behind [SSO](https://buildwithfern.com/learn/docs/authentication/setup/sso), and maintained exclusively via [Fern Editor](https://buildwithfern.com/learn/docs/writing-content/fern-editor).
- **Built-in components and custom elements.** ElevenLabs relies primarily on Fern's [out-of-the-box components](https://buildwithfern.com/learn/docs/writing-content/components/overview) and regularly requests improvements that ship to all Fern customers. Fern's SearchableTable component, which adds real-time filtering to large tables, originated from ElevenLabs needing a better way to display their error codes. It was built within a week of the request. [RBAC](https://buildwithfern.com/learn/docs/authentication/features/rbac) for gated content came from the same feedback loop. ElevenLabs has also built a number of [custom elements](https://buildwithfern.com/learn/docs/customization/custom-react-components) directly into their docs site: an animated wave graphic on the homepage and a voice chat widget, a natural fit for a voice AI company.

## Reorganizing documentation around the Diátaxis framework

Periodic documentation restructuring is a given at any company shipping as fast as ElevenLabs: as products evolve, the docs need to evolve with them. ElevenLabs has reorganized their documentation multiple times, and with Fern, each restructure is a light lift rather than a major undertaking. The team can remap information architecture, reorganize navigation, and rearrange pages using the same tools they already have.

Their latest restructure is a move to the Diátaxis framework, which organizes content into tutorials, how-to guides, reference, and explanation. As their products continue to evolve, their documentation will continue to keep pace.
