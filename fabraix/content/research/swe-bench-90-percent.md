---
title: "SWE-bench will hit 90% this year."
date: "2026-03-24"
author: "Ahmed (Zach) Aly"
tags: ["benchmarks", "evaluation", "open-source"]
excerpt: "Six models are within 1.3 points on SWE-bench Verified. Binary benchmarks are saturating — what will replace them?"
og_description: "Six models are within 1.3 points on SWE-bench Verified. Binary benchmarks are saturating — what will replace them?"
og_image: "/content/research/og/swe-bench-90-percent.png"
---

There are six models within 1.3 points of each other on SWE-bench Verified right now. Claude, GPT-5.4, Gemini 3.1 Pro, and MiniMax M2.5 are all between 78% and 81%. One of them is open-weight. Eighteen months ago the best system scored 33%.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/swe-bench-verified.html" style="width: 100%; height: 520px; border: none;" loading="lazy" title="SWE-bench Verified resolve rate chart, Aug 2024 – Mar 2026"></iframe>
</div>

The usual response to a saturating benchmark is to make a harder one, and SWE-bench has already been through this a few times; Lite to Verified to Pro to Live to Rebench. Humanity's Last Exam was supposed to be the ceiling. Each new version buys a year, maybe eighteen months, before the same convergence plays out again.

Harder benchmarks aren't wrong, but they, too, will face the same problem in a year. They keep you in the frame of "can this model do X or not" without evaluating it any deeper than that. 

---

We don't evaluate experienced engineers on whether they can solve a problem. We evaluate them on how they solve it. What time complexity did they choose? Did they spot the ambiguity in the spec before writing a line of code? Did they know when to use a library instead of rolling something from scratch?

The evaluation has a lot of dimensions — design, elegance, cost, judgment, speed — and are not binary. We've always known this about people. We just haven't needed it for models, because until recently the binary question ("can it do this at all?") still had a useful answer. When models were resolving 2% of SWE-bench tasks, pass/fail told you something. When six models all resolve 80% of the same tasks, the binary signal is less relevant. The real differences between them are in dimensions that are not as well-evaluated yet.

SWE-rebench tracks token usage alongside resolve rate, and the gaps are significant; some models burn 8 million tokens per problem, others hit the same score at 500k. That's a 16x efficiency difference, which is invisible in the headline number.

Same thing with solution quality. Two patches can both make the test suite green and be wildly different code.

---

If you take this convergence seriously, the open-source picture changes. On SWE-bench Verified, an open-weight model is within a point of the best closed one, though on harder benchmarks the gap is still a few points wider. Either way, the moat isn't raw intelligence anymore. It shifts to cost-per-task, domain adaptation, deployment flexibility — things where open communities have structural advantages. The static evals era rewarded whoever could throw the most compute at pre-training. In the dynamic evals era, if it comes, will throwing more compute at pre-training result in better benchmark performance?

Most production teams we talk to are already routing between three or four models depending on the task and the budget. But all our evaluation infrastructure still assumes you're choosing one model. Nobody benchmarks routing strategies, for example. The interesting unit of evaluation might not be the model anymore and might even become the harness itself.

---

We don't know exactly what post-static evaluation looks like, but we think it's closer to a profile than a leaderboard. "Best model" is becoming the same kind of question as "best programming language." The answer is always for what, at what cost, on what timeline (or maybe it's just C++).

Someone will hit 90% on SWE-bench this year, but it won't tell you much about which model to actually use for your work. Once every model can complete the task, completion becomes less relevant, and you will have to measure **effectiveness** instead. Two models that both resolve an issue are not the same if one does it for a fraction of the time and effort it took the other, and with a better design.

We're spending time thinking about what comes after static benchmarks, especially for AI security. We need evals that adapt to what you're actually optimizing for; evals where outcomes are scored on a spectrum, not a binary, will be the only version with room left to run at peak intelligence.

---

*Data behind the chart is compiled from swebench.com, vals.ai, swe-rebench.com, and model announcements from Anthropic, OpenAI, and Google.*

**Thanks** to Nick Ralston, Akash Bajwa, and others for reading drafts of this.
