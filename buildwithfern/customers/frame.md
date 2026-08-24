# Frame.io drives API adoption through streamlined docs and SDKs

- **99%**: Reduction in time to first successful API call (1-14 days → under 1 hr)
- **1,500+**: Hours of support time saved annually
- **25x**: Time to publish quick fixes with Fern Editor (30 min → 1 min)

## No SDKs, and docs that drifted from the API spec

Frame.io's developer platform team had a clear goal when they came to Fern: grow API adoption. Frame.io's API is what lets customers move creative assets in and out of the platform. It's a hub-and-spoke model where the spokes only work if the integration surface is genuinely usable. But Frame.io didn't have any SDKs, the team was spending significant time troubleshooting API authentication and setup errors on their developer forum, and their documentation lived in a system that wasn't synced to the API spec — which meant code snippets had to be maintained by hand.

Frame.io evaluated Stainless to generate SDKs, but it was expensive and only addressed half of the problem. Stainless would still need to be integrated with a separate documentation system, which meant ongoing engineering effort to keep the spec, SDKs, and docs in sync.

Frame.io chose Fern to get a single source of truth for both documentation and SDKs, with automation that didn't require pulling engineers off product work to maintain. Frame.io launched their [Fern-powered developer documentation](https://next.developer.frame.io/platform/welcome) alongside Python and TypeScript SDKs in November 2025.

> Not only do we need APIs to do the things, but we also need ways for them to make it easier, such
> as SDKs. Long story short, we went from a complicated multi-step process to something that's just
> automatically done for us. We don't even think about it anymore, and that's a tremendous win for
> our developer experience.
>
> Charlie Anderson, Head of Partnerships at Frame.io

## SDKs, docs, and a support workflow generated from a single source of truth

A single OpenAPI spec update triggers a GitHub Action that generates and publishes both the SDKs (to PyPI and npm) and the docs — without any dedicated SDK engineers on the Frame.io team. Here's what that setup enables for Frame.io's developer experience:

- **Custom authentication code inside generated SDKs.** Fern's generated SDKs handle standard auth machinery — retries, refresh tokens, request signing — out of the box. Frame.io's API also has its own specific auth configuration and capabilities, such as local uploads, that require custom logic. Using Fern's [custom code](https://buildwithfern.com/learn/sdks/overview/custom-code) support, Frame.io injects their custom logic directly into the generated SDKs so customers don't have to figure it out themselves. The same custom code support lets Frame.io extend the SDKs with new capabilities without taking on the long-term maintenance burden of writing and supporting that code outside the generated SDK.
- **Docs-as-code with WYSIWYG for non-engineers.** Contributors across the company update the docs through whichever interface fits their work. When an engineer spots a bug in the docs, they open a PR and tag the developer platform team for approval. When a non-engineer needs to make a quick copy fix, they do it through [Fern Editor](https://buildwithfern.com/learn/docs/writing-content/fern-editor) in seconds without leaving the browser. Either path automatically routes through the developer platform team for review, so contributions stay open without sacrificing accuracy.
- **Documentation as a support tool.** When customers post authentication questions on Frame.io's developer forum, the team now sends them directly to a specific Try It console link in the [API Explorer](https://buildwithfern.com/learn/docs/api-references/api-explorer) so they can narrow down the issue live rather than trading forum replies. Customers also use [Ask Fern](https://buildwithfern.com/learn/docs/ai-features/ask-fern/overview)'s AI search to self-serve answers before questions hit the support queue. Frame.io's support team now spends their time on genuine edge cases rather than auth troubleshooting, which previously accounted for 90% of their support load.
- **Acting on user feedback through search analytics.** Frame.io uses [Ask Fern](https://buildwithfern.com/learn/docs/ai-features/ask-fern/overview)'s search analytics to spot both content gaps and unmet customer needs. High search volume for upload-related queries is what prompted Frame.io to build dedicated upload methods into their Python and TypeScript SDKs.

> Fern has completely democratized our docs writing process. We're able to act on user feedback
> almost immediately. Fern follows that whole docs-as-code approach, which I really do think is the
> best way to build out documentation.
>
> Rosie Cunningham, Developer Relations Engineer at Frame.io

## A creative hub is only as useful as its API

Frame.io started with video review and now supports more than 500 asset types, and the platform is still growing. Supporting every asset type only matters if the API can keep up. Developers need to move assets in and out as easily as they do anywhere else in their creative stack.

Frame.io is partnering with Fern on [Replay](https://buildwithfern.com/post/fern-replay), an early-access feature that automatically preserves manual SDK edits across regenerations and builds on the custom code work that's been central to Frame.io's developer experience from day one. Frame.io is also working with Fern to roll out localization, helping their docs scale to a global developer audience.
