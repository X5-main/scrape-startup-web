(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f355e722-7e9b-44cc-9471-e4517ba11d73`,e._sentryDebugIdIdentifier=`sentry-dbid-f355e722-7e9b-44cc-9471-e4517ba11d73`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Dollars per token considered harmful`,description:`Engineers of language model applications should think about requests, not tokens.`,authors:[{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`Token Producer & Dollar Consumer, Modal`,twitterHandle:`charles_irl`}],date:`2025-07-16T12:00:00.000Z`,length:`5 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:3,value:`When you serve your own language model inference, you must think in terms of dollars per request, not dollars per token.`,id:`when-you-serve-your-own-language-model-inference-you-must-think-in-terms-of-dollars-per-request-not-dollars-per-token`},{depth:2,value:`You are running language model inference in service of a language model application.`,id:`you-are-running-language-model-inference-in-service-of-a-language-model-application`},{depth:2,value:`The users of your application don’t care about tokens, they care about requests.`,id:`the-users-of-your-application-dont-care-about-tokens-they-care-about-requests`},{depth:2,value:`So should you.`,id:`so-should-you`,children:[{depth:3,value:`Dollars ÷ seconds = dollars ÷ seconds ÷ replicas × replicas`,id:`dollars--seconds--dollars--seconds--replicas--replicas`}]},{depth:2,value:`If you’d like to keep your dollars per request down while taking language model inference into your own hands, try Modal.`,id:`if-youd-like-to-keep-your-dollars-per-request-down-while-taking-language-model-inference-into-your-own-hands-try-modal`}],rawContent:`It is no secret that open source, self-hosted large language model inference has grown up in the shadow of proprietary services, like the APIs provided by OpenAI, Anthropic, and Alphabet.

What is less obvious is that the choices and priorities of those providers have shaped the expectations and discourse of the field in ways that are actively harmful to the inevitable move away from them.

One of the most pernicious of these subtle influences is in the pricing model: "dollars per token".

### When you serve your own language model inference, you must think in terms of dollars per request, not dollars per token.

Here’s why:

- you are running language model inference in service of a language model application, and
- the users of your application don’t care about tokens, they care about requests, and therefore
- so should you.

## You are running language model inference in service of a language model application.

The API providers are running language model inference _as a service_. Running that service incurs costs which they recoup,
ideally but optionally plus a profit margin, by charging their users.

These costs roughly scale with the sizes of requests (both inputs and outputs).
These sizes are measured in complex non-linear transformations of Unicode bytes called _tokens_, rather than something sensible like bytes or characters,
due to contemporary model architecture skill issues.

Because token counts and costs scale together and sit at the boundary between the API and the people who build on it, they make for a good pricing mechanism: count tokens, charge dollars.

But when teams run their own language model inference, they are generally not running inference as a service.
Instead, they have built some application of language models, like a support chatbot or an AI boyfriend or a meme coin shill,
and they want to support that application at reduced cost, with more control, and/or with tighter data governance.

## The users of your application don’t care about tokens, they care about requests.

When the users of your B2B dog-sitting marketplace sit down to ask your chatbot whether pit bulls cost extra, they aren’t counting tokens.
Introducing usage-based per-token billing will confuse and anger them.
They aren’t thinking about language models at all! They are thinking about asking for help and getting it.

This is a _request_, part of a user workflow that they pay you to help complete.
As your application grows and more users hit your chatbot to inquire regarding per-breed pricing, the number of requests will scale, and so will your costs.

## So should you.

These requests are a key part of the boundary between you and your users, just as tokens are for the boundary between developers and LLM API providers.
As the engineer of the LLM engine that supports the service for your users, tokens are part of your internal reasoning, but they are secondary.

Let’s consider a few questions that come up when evaluating LLM self-hosting and see why a per-request framing is so helpful.

_What latency is acceptable? Can I hit that latency?_

Well, how quickly do users need a response to a request? Once you have that, you can ask how many tokens are in a typical request and response.
Get those numbers, then compare them to published results for time-to-first-token and inter-token latency using a tool like our [LLM Engine Advisor](/llm-almanac/advisor)
— or run the benchmarks yourself using our framework, [\`stopwatch\`](https://github.com/modal-labs/stopwatch).

If you just think in terms of aggregate "tokens per second", you can’t get meaningful numbers for latency estimation.

_How many replicas do we need to serve our traffic?_

Well, how many requests does a user make per second, and how many users are online at once?
(Note: that’s probably variable, so you’ll need to think about [managing your GPU allocation](/blog/gpu-utilization-guide) too!).
That will give you an estimate of the requests per second you need to serve.

For a given latency target on these queries, a single replica of your LLM engine will be able to serve a certain number of concurrent requests.
The aggregate load of requests is then split among your replicas.

Again, if you think of your workload in terms of aggregate "tokens per second", without considering requests, you’ll be unable to properly understand the load a single replica can handle.

Put simply: tokens cannot be arbitrarily split among replicas. Requests can. At best, you can be token-count-aware when routing requests.

_How much will this cost me?_

When you’re hosting your own LLM inference, you are paying for compute.

Costs for compute are measured in dollars over time — even for on-premises deployments, where capital costs are amortized over useful lifespans, on top of the time-denominated operating expenses that fully define costs in cloud deployments.

So once you’ve done the work to determine the number of requests you can support per replica while hitting your latency requirements and the number of replicas you need, you’re ready to determine the cost!
You just take the dollars per second per replica offered by your compute provider times the number of replicas you need to get a total in terms of dollars per second to serve the workload.

### Dollars ÷ seconds = dollars ÷ seconds ÷ replicas × replicas

Tokens are, quite literally, no longer part of the equation.

_Is the cost worth it?_

This final question, typically the most important question teams face when considering whether to build their own LLM inference, is best considered with no regard at all to tokens.

When costs are framed in dollars per request, the end user perspective is brought back to the center, where it belongs, and conversations are elevated to the level where engineering can act in concert with product, design, and revenue.

Is $1 per request "worth it"? Yes, if satisfying those requests leads to a >1% increase in conversion rate for users with a life-time-value of $100!
Is 10¢ per request “worth it”? No, if your users make 1k requests a month but only pay you $20!

Introducing the sizes of requests (denominated in tokens) into this discussion adds an extra dimension of variation that’s pure nuisance.
It’s the concern of an organization selling language model inference _per se_, not one building an application of language models or a system that includes that application.
And the dominance of those organizations, especially the ones selling proprietary models, is how we've ended up with this confused approach.

## If you’d like to keep your dollars per request down while taking language model inference into your own hands, try Modal.

We learned these lessons working with a variety of teams that are taking advantage of advances in open weights language models and open source language model inference engines
to build high-throughput, low-latency, low-cost, high-control LLM applications on our serverless infrastructure platform, [Modal](/).

If you’d like to read more about running your own language model inference,
check out the [executive summary of our LLM engine benchmarks](/llm-almanac/summary)
or [dive into those benchmark results directly](/llm-almanac/advisor).
If you’re interested in more hard-won insights gained helping teams break free of "AI from an API",
check out [our guide to thinking about GPU costs and optimizations](/blog/gpu-utilization-guide).
`,meta:{description:`Engineers of language model applications should think about requests, not tokens.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,w=t(`<code>stopwatch</code>`),T=t(`<p>It is no secret that open source, self-hosted large language model inference has grown up in the shadow of proprietary services, like the APIs provided by OpenAI, Anthropic, and Alphabet.</p> <p>What is less obvious is that the choices and priorities of those providers have shaped the expectations and discourse of the field in ways that are actively harmful to the inevitable move away from them.</p> <p>One of the most pernicious of these subtle influences is in the pricing model: “dollars per token”.</p> <h3 id="when-you-serve-your-own-language-model-inference-you-must-think-in-terms-of-dollars-per-request-not-dollars-per-token">When you serve your own language model inference, you must think in terms of dollars per request, not dollars per token.</h3> <p>Here’s why:</p> <ul><li>you are running language model inference in service of a language model application, and</li> <li>the users of your application don’t care about tokens, they care about requests, and therefore</li> <li>so should you.</li></ul> <h2 id="you-are-running-language-model-inference-in-service-of-a-language-model-application">You are running language model inference in service of a language model application.</h2> <p>The API providers are running language model inference <em>as a service</em>. Running that service incurs costs which they recoup,
ideally but optionally plus a profit margin, by charging their users.</p> <p>These costs roughly scale with the sizes of requests (both inputs and outputs).
These sizes are measured in complex non-linear transformations of Unicode bytes called <em>tokens</em>, rather than something sensible like bytes or characters,
due to contemporary model architecture skill issues.</p> <p>Because token counts and costs scale together and sit at the boundary between the API and the people who build on it, they make for a good pricing mechanism: count tokens, charge dollars.</p> <p>But when teams run their own language model inference, they are generally not running inference as a service.
Instead, they have built some application of language models, like a support chatbot or an AI boyfriend or a meme coin shill,
and they want to support that application at reduced cost, with more control, and/or with tighter data governance.</p> <h2 id="the-users-of-your-application-dont-care-about-tokens-they-care-about-requests">The users of your application don’t care about tokens, they care about requests.</h2> <p>When the users of your B2B dog-sitting marketplace sit down to ask your chatbot whether pit bulls cost extra, they aren’t counting tokens.
Introducing usage-based per-token billing will confuse and anger them.
They aren’t thinking about language models at all! They are thinking about asking for help and getting it.</p> <p>This is a <em>request</em>, part of a user workflow that they pay you to help complete.
As your application grows and more users hit your chatbot to inquire regarding per-breed pricing, the number of requests will scale, and so will your costs.</p> <h2 id="so-should-you">So should you.</h2> <p>These requests are a key part of the boundary between you and your users, just as tokens are for the boundary between developers and LLM API providers.
As the engineer of the LLM engine that supports the service for your users, tokens are part of your internal reasoning, but they are secondary.</p> <p>Let’s consider a few questions that come up when evaluating LLM self-hosting and see why a per-request framing is so helpful.</p> <p><em>What latency is acceptable? Can I hit that latency?</em></p> <p>Well, how quickly do users need a response to a request? Once you have that, you can ask how many tokens are in a typical request and response.
Get those numbers, then compare them to published results for time-to-first-token and inter-token latency using a tool like our <!> — or run the benchmarks yourself using our framework, <!>.</p> <p>If you just think in terms of aggregate “tokens per second”, you can’t get meaningful numbers for latency estimation.</p> <p><em>How many replicas do we need to serve our traffic?</em></p> <p>Well, how many requests does a user make per second, and how many users are online at once?
(Note: that’s probably variable, so you’ll need to think about <!> too!).
That will give you an estimate of the requests per second you need to serve.</p> <p>For a given latency target on these queries, a single replica of your LLM engine will be able to serve a certain number of concurrent requests.
The aggregate load of requests is then split among your replicas.</p> <p>Again, if you think of your workload in terms of aggregate “tokens per second”, without considering requests, you’ll be unable to properly understand the load a single replica can handle.</p> <p>Put simply: tokens cannot be arbitrarily split among replicas. Requests can. At best, you can be token-count-aware when routing requests.</p> <p><em>How much will this cost me?</em></p> <p>When you’re hosting your own LLM inference, you are paying for compute.</p> <p>Costs for compute are measured in dollars over time — even for on-premises deployments, where capital costs are amortized over useful lifespans, on top of the time-denominated operating expenses that fully define costs in cloud deployments.</p> <p>So once you’ve done the work to determine the number of requests you can support per replica while hitting your latency requirements and the number of replicas you need, you’re ready to determine the cost!
You just take the dollars per second per replica offered by your compute provider times the number of replicas you need to get a total in terms of dollars per second to serve the workload.</p> <h3 id="dollars--seconds--dollars--seconds--replicas--replicas">Dollars ÷ seconds = dollars ÷ seconds ÷ replicas × replicas</h3> <p>Tokens are, quite literally, no longer part of the equation.</p> <p><em>Is the cost worth it?</em></p> <p>This final question, typically the most important question teams face when considering whether to build their own LLM inference, is best considered with no regard at all to tokens.</p> <p>When costs are framed in dollars per request, the end user perspective is brought back to the center, where it belongs, and conversations are elevated to the level where engineering can act in concert with product, design, and revenue.</p> <p>Is $1 per request “worth it”? Yes, if satisfying those requests leads to a >1% increase in conversion rate for users with a life-time-value of $100!
Is 10¢ per request “worth it”? No, if your users make 1k requests a month but only pay you $20!</p> <p>Introducing the sizes of requests (denominated in tokens) into this discussion adds an extra dimension of variation that’s pure nuisance.
It’s the concern of an organization selling language model inference <em>per se</em>, not one building an application of language models or a system that includes that application.
And the dominance of those organizations, especially the ones selling proprietary models, is how we’ve ended up with this confused approach.</p> <h2 id="if-youd-like-to-keep-your-dollars-per-request-down-while-taking-language-model-inference-into-your-own-hands-try-modal">If you’d like to keep your dollars per request down while taking language model inference into your own hands, try Modal.</h2> <p>We learned these lessons working with a variety of teams that are taking advantage of advances in open weights language models and open source language model inference engines
to build high-throughput, low-latency, low-cost, high-control LLM applications on our serverless infrastructure platform, <!>.</p> <p>If you’d like to read more about running your own language model inference,
check out the <!> or <!>.
If you’re interested in more hard-won insights gained helping teams break free of “AI from an API”,
check out <!>.</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=c(s(o),36),f=c(e(d));u(f,{href:`/llm-almanac/advisor`,children:(e,t)=>{l(),i(e,r(`LLM Engine Advisor`))},$$slots:{default:!0}}),u(c(f,2),{href:`https://github.com/modal-labs/stopwatch`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(d);var p=c(d,6);u(c(e(p)),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{l(),i(e,r(`managing your GPU allocation`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,32);u(c(e(m)),{href:`/`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2),g=c(e(h));u(g,{href:`/llm-almanac/summary`,children:(e,t)=>{l(),i(e,r(`executive summary of our LLM engine benchmarks`))},$$slots:{default:!0}});var _=c(g,2);u(_,{href:`/llm-almanac/advisor`,children:(e,t)=>{l(),i(e,r(`dive into those benchmark results directly`))},$$slots:{default:!0}}),u(c(_,2),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{l(),i(e,r(`our guide to thinking about GPU costs and optimizations`))},$$slots:{default:!0}}),l(),n(h),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=DzgnykK9.js.map
