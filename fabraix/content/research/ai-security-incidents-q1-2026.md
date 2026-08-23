---
title: "2026 so far has matched all of 2024 for AI security incidents."
date: "2026-04-01"
author: "Ahmed (Zach) Aly"
tags: ["security", "threat-intelligence", "supply-chain"]
excerpt: "We catalogued 41 AI security incidents since January 2024. Q1 2026 alone matched all of 2024. March had 8 — the worst single month on record."
og_description: "We catalogued 41 AI security incidents since January 2024. Q1 2026 alone matched all of 2024. March had 8 — the worst single month on record."
og_image: "/content/research/og/ai-security-incidents-q1-2026.png"
---

We pulled together every security incident from the last two years where AI systems were the target, the weapon, or both (prompt injections that led to code execution, supply chain attacks on LLM tooling, model poisoning, AI agents used offensively) and put them on a timeline. The pattern is quite striking. We counted 12 incidents in 2024, 17 in 2025, and 12 in the first three months of 2026 alone. March had 8, the worst single month in the analysis period.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/ai-security-incidents.html" style="width: 100%; height: 600px; border: none;" loading="lazy" title="AI security incidents vs. agentic model releases, Jan 2024 – Mar 2026"></iframe>
</div>

The acceleration isn't just in frequency. In 2024, most of this was research-grade: malicious models on Hugging Face, vulnerabilities disclosed in conversion services, proof-of-concept prompt injections. By mid-2025, a single unopened email could make Microsoft Copilot exfiltrate organizational data. By March 2026, TeamPCP chained five ecosystems in six days (compromising Trivy, pivoting to Checkmarx, then LiteLLM on PyPI, then the Telnyx SDK) each hop using credentials stolen in the previous one. A prompt injection in a GitHub issue title got arbitrary code running on 4,000 developer machines through Cline's AI triage bot. The Axios npm package, 83 million weekly downloads, was hijacked with self-erasing malware.

Something is driving this - the expanding AI supply chain, new attack surfaces from agentic capabilities, AI making vulnerability discovery trivial, or all three - and the timeline doesn't make it easy to untangle which. What it does make clear is that the pace of incidents is compounding faster than most security teams are planning for.

If your team is thinking about this, [we're here to help](https://calendar.app.google/d1uBvixwUwVtGj5F8).



---

*Incidents included if they meet at least one of: (1) directly target AI/ML infrastructure, models, or tooling; (2) use AI as the attack vector; (3) use AI agents offensively; (4) compromise developer supply chains in the AI stack; (5) poison ML models or training data at scale. Generic ransomware, phishing, and data breaches without an AI nexus are excluded. Model launches with a lightning bolt denote new agentic capabilities.*

***Sources**: Snyk, Wiz, Socket, Kaspersky, SANS, Microsoft MSRC, Sonatype, ReversingLabs, JFrog, BeyondTrust, Check Point, Sysdig, The Hacker News, Dark Reading, CyberScoop.*
