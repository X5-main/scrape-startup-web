---
title: "Bounding the Blast Radius: A Survey of Prompt-Injection Defenses for LLM Agents"
date: "2026-06-26T12:00:00"
author: "Ibrahim Abdu"
tags: ["security", "prompt-injection", "agents", "defense-in-depth"]
excerpt: "Prompt injection has no known general solution. We organize the defense landscape into a four-layer taxonomy, analyze the documented failure mode of each layer, and argue for composing defenses under explicit cost and latency budgets, then verifying the result with adaptive, environment-specific red-teaming."
og_description: "A survey of prompt-injection defenses for LLM agents: a four-layer taxonomy, the documented failure mode of each layer, and a deployment framework that composes defenses under cost and latency constraints and verifies them adversarially."
---

## Intro

Prompt injection is the highest-ranked security risk for LLM-integrated applications and has no known general solution. The root cause is architectural: a language model exposes no enforced boundary between trusted instructions and untrusted data, so any text the model ingests can act as a control signal. This survey organizes the published and deployed defenses into four layers: prompt-level formatting, model-level training, input filtering, and output/trajectory monitoring. For each, we describe the mechanism, name representative systems, and state the documented failure mode.

We then make two arguments. First, no single layer is enough. A formal separability result ([Zverev et al., 2025](https://arxiv.org/abs/2403.06833)) and adaptive-attack evaluations ([Nasr et al., 2025](https://arxiv.org/abs/2510.09023)) both show that defenses which look strong on their own give way once an attacker adapts. The same point explains why static benchmarks overstate robustness: they never let the attacker adapt. Second, the workable response is to combine layers within a deployment's latency and cost budget, then red-team the result in its own environment until breaking it costs an attacker more than the value it protects.

---

## 1. The Root Cause Is Architectural

In June 2025, a zero-click vulnerability in Microsoft 365 Copilot ([CVE-2025-32711](https://nvd.nist.gov/vuln/detail/CVE-2025-32711), "EchoLeak") allowed an attacker to exfiltrate a user's prior conversations and internal documents by sending a single email. The victim never opened the email. Later, while the assistant was answering an unrelated question, it automatically pulled that email in along with other messages and followed the hidden instructions inside it as if the user had written them. Microsoft rated the issue critical (CVSS 9.3; the [NVD entry](https://nvd.nist.gov/vuln/detail/CVE-2025-32711) scores it 7.5), and the disclosed chain bypassed multiple shipped mitigations. EchoLeak is not an ordinary implementation bug. It follows directly from how language models process input.

It is worth spelling out why, because it explains why every defense in this post is partial. A useful contrast is SQL injection, which the software industry effectively closed with [parameterized queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html). A parameterized query separates the request into two channels: a code channel the engine executes, and a data channel the engine treats as inert values. The separation is enforced by the database engine, not by convention. A language model has no equivalent enforced channel. The system prompt (trusted), the user message (partially trusted), and any retrieved content (untrusted) are concatenated into a single token sequence and processed by one set of weights. Trust is a property the developer assigns to a span of text; the model does not mechanically respect it.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-instruction-data-blend.html" style="width: 100%; height: 392px; border: none;" loading="lazy" title="A database separates code and data into enforced channels; an LLM concatenates system prompt, user request, and untrusted data into one token stream processed by the same weights."></iframe>
</div>

*Figure 1. The architectural root cause. A relational engine enforces a code/data boundary; a language model has no enforced boundary, so any ingested span can act as a control signal.*

This intuition has been formalized. [Zverev et al. (2025, ICLR)](https://arxiv.org/abs/2403.06833) define a quantitative measure of instruction–data separation, introduce the SEP benchmark, and find that every evaluated model fails to separate the two cleanly; they further report that the common remedies, prompt engineering and fine-tuning, do not substantially improve separation. The phenomenon was demonstrated empirically much earlier: [Perez and Ribeiro (2022)](https://arxiv.org/abs/2211.09527) characterized goal-hijacking and prompt-leaking, and [Willison (2022)](https://simonwillison.net/2022/Sep/12/prompt-injection/) named the attack class and drew the SQL-injection analogy. The defenses that follow do not close this gap. They raise the cost of exploitation by approximating a boundary the architecture does not provide.

## 2. The Attack Surface: Two Ways In

We assume an attacker who can place text into any content the agent will process, but who has no access to the model weights, the system prompt, or the serving infrastructure. The attacker's objective is to induce a target behavior the operator did not intend: invoking a privileged tool, exfiltrating data through an allowed channel, or corrupting a record. Two delivery modes follow from where the attacker's text enters.

**Direct injection.** The attacker is the user and submits adversarial input through the normal interface, attempting to override the operator's instructions. This is the setting of most jailbreak research.

**Indirect injection.** The attacker plants instructions in third-party content (a web page, an email, a document, a pull request) that the agent later retrieves on a legitimate user's behalf. The agent ingests the payload during normal operation, and the injected instructions inherit the agent's privileges. [Greshake et al. (2023)](https://arxiv.org/abs/2302.12173) introduced and demonstrated this class; it is the more dangerous mode in practice because the victim performs no unsafe action.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-direct-vs-indirect.html" style="width: 100%; height: 300px; border: none;" loading="lazy" title="Direct injection: the user is the attacker. Indirect injection: the attacker plants instructions in content the agent fetches on the user's behalf."></iframe>
</div>

*Figure 2. Delivery modes. Under indirect injection, the malicious instruction arrives through fetched content rather than from the user, and executes with the agent's privileges.*

The severity of either mode scales with the agent's capabilities. A conversational model that only produces text exposes little; an agent wired to email, source control, CRM records, or a browser exposes the corresponding real-world action. Each of the four deployment contexts below has a publicly disclosed 2025 incident, which we use as the attack-surface map rather than constructing hypotheticals.

| Deployment context | Injection vector | Disclosed incident |
|---|---|---|
| Workspace copilot (email/chat) | Hidden markup in an email, ingested during summarization | [AI email-summary injection](https://permiso.io/blog/copilot-prompt-injection-ai-email-phishing); EchoLeak ([CVE-2025-32711](https://nvd.nist.gov/vuln/detail/CVE-2025-32711)) |
| Coding assistant / CI | Instructions hidden in a pull-request description or HTML comment | [GitHub Copilot, Trail of Bits](https://blog.trailofbits.com/2025/08/06/prompt-injection-engineering-for-attackers-exploiting-github-copilot/) |
| CRM / sales agent | Poisoned lead field scraped during enrichment | [Salesforce Agentforce "ForcedLeak," CVSS 9.4](https://noma.security/blog/forcedleak-agent-risks-exposed-in-salesforce-agentforce/) |
| Browsing agent | Instructions embedded in page content/DOM | [Perplexity Comet, Brave](https://brave.com/blog/comet-prompt-injection/) |

*Table 1. The agentic attack surface, anchored to disclosed 2025 incidents. Each combines an everyday workflow with a privileged capability, which is the combination prompt injection exploits.*

This surface is what dedicated benchmarks attempt to cover. [AgentDojo](https://arxiv.org/abs/2406.13352) evaluates attacks and defenses against tool-using agents in realistic task environments; [InjecAgent](https://arxiv.org/abs/2403.02691) measures susceptibility to indirect injection delivered through tool outputs; and [Liu et al. (2024)](https://arxiv.org/abs/2310.12815) provide a formal framework unifying attacks and defenses. We return to the limits of these benchmarks in Section 6.

## 3. Four Places to Intervene

Defenses are most usefully organized by where in the agent's input-to-action path they intervene, rather than as a flat checklist. There are four such positions.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-four-layers.html" style="width: 100%; height: 200px; border: none;" loading="lazy" title="Four intervention points: input guards screen incoming data, prompt delimiters fence it, the hardened model weighs it, and output and trajectory guards constrain what the agent does."></iframe>
</div>

*Figure 3. The four intervention points along a request's path. Section numbering follows the exposition; the arrows follow execution order.*

| Layer | Mechanism | Representative systems | Documented failure mode |
|---|---|---|---|
| 1. Prompt-level | Delimit/mark untrusted spans as data | Random delimiters; [Spotlighting](https://arxiv.org/abs/2403.14720) | Boundary is advisory, not enforced; separation fails ([Zverev et al.](https://arxiv.org/abs/2403.06833)) |
| 2. Model-level | Train weights to prioritize trusted instructions | [Instruction Hierarchy](https://arxiv.org/abs/2404.13208); [StruQ](https://arxiv.org/abs/2402.06363); [SecAlign](https://arxiv.org/abs/2410.05451) | Probabilistic; degraded by adaptive attacks ([Nasr et al.](https://arxiv.org/abs/2510.09023)) and the tool-call pathway ([Wu et al.](https://arxiv.org/abs/2407.17915)) |
| 3. Input filtering | Classify and block malicious input | [Llama Prompt Guard 2](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M); [Lakera Guard](https://www.lakera.ai/blog/lakera-guard-fall-25-adaptive-at-scale); [Azure Prompt Shields](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/jailbreak-detection) | Evadable ([Hackett et al.](https://arxiv.org/abs/2504.11168)); multi-turn evasion ([Crescendo](https://www.usenix.org/system/files/usenixsecurity25-russinovich.pdf)); base-rate cost |
| 4. Output / trajectory | Monitor outputs and reasoning/tool steps; gate or block actions | [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails); [LlamaFirewall](https://arxiv.org/abs/2505.03574) | A fallible model, so evadable; passive output scanners catch leaks but cannot stop side-effecting actions |

*Table 2. The defense taxonomy. Each layer raises the cost of a different stage of the attack; none closes the underlying gap alone.*

### 3.1 Layer 1: Prompt-level formatting

The simplest interventions treat injection as a formatting problem: mark the untrusted span and instruct the model to treat its contents as data. A fixed delimiter (`<data>…</data>`) is trivially defeated, because the attacker can emit the closing tag and escape the fence. A randomized delimiter, a high-entropy token minted per request and unknown to the attacker, removes that specific escape, because the attacker cannot reproduce the closing marker.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-delimiter.html" style="width: 100%; height: 360px; border: none;" loading="lazy" title="A per-request random delimiter the attacker cannot forge keeps the injected line trapped inside the data block."></iframe>
</div>

*Figure 4. Randomized delimiting. The per-request marker resists tag forgery, but the instruction to treat the enclosed span as data is itself only an instruction the model weighs against the injected content.*

[Spotlighting](https://arxiv.org/abs/2403.14720) generalizes this idea with delimiting, datamarking, and encoding transformations that make provenance more salient to the model, and reports meaningful reductions in attack success. The category's ceiling, however, is the separability result of [Zverev et al.](https://arxiv.org/abs/2403.06833): because the directive "treat this as data" is conveyed in the same channel and language as the payload, a sufficiently persuasive payload can still win. Prompt-level defenses raise attacker cost and are nearly free to deploy; they do not provide a guarantee.

### 3.2 Layer 2: Model-level training

This layer trains the model rather than wrapping it. General alignment methods such as [Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) make a model less compliant with overt override attempts, but they target harmlessness broadly rather than instruction–data separation, and by themselves they do not address indirect injection; the injection-specific techniques are more targeted. OpenAI's [instruction hierarchy](https://arxiv.org/abs/2404.13208) trains the model to rank message sources (system above developer above user above tool output), so that an instruction arriving in retrieved content is, by construction, the lowest-priority signal in the context; the [GPT-5 system card](https://cdn.openai.com/gpt-5-system-card.pdf) documents this ranking in a shipping system. [StruQ](https://arxiv.org/abs/2402.06363) combines a structured input format with instruction tuning so the model attends only to the trusted channel, and [SecAlign](https://arxiv.org/abs/2410.05451) casts the defense as preference optimization, training the model to prefer responses that ignore injected instructions.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-instruction-hierarchy.html" style="width: 100%; height: 250px; border: none;" loading="lazy" title="The instruction hierarchy ranks system above developer above user above tool output, so an injection in fetched content is the lowest-priority signal."></iframe>
</div>

*Figure 5. The instruction hierarchy. Training the model to rank message provenance places injected content at the bottom of the priority order; the ordering is learned, hence probabilistic.*

These methods raise the baseline measurably, and the gains can generalize: OpenAI's [IH-Challenge study (2026)](https://arxiv.org/abs/2603.10521) reports that instruction-hierarchy training transfers to out-of-distribution and human red-teaming benchmarks not seen during training, with overall robustness rising from 84.1% to 94.1%. The limitation is inherent in the approach. Training shifts a probability distribution; it does not impose a constraint. Adaptive attacks degrade trained defenses (Section 4), and the defense is unevenly distributed across a model's output channels: [Wu et al. (2024)](https://arxiv.org/abs/2407.17915) show the tool-calling pathway is markedly less aligned than the chat pathway, so a model can refuse in natural language while simultaneously emitting the forbidden tool call. Model-level defense is among the highest-leverage layers to adopt, yet it remains insufficient on its own.

### 3.3 Layer 3: Input filtering

Because the primary model can be deceived, a common addition is a second model in front of it (a classifier or an LLM judge) that inspects incoming prompts and retrieved documents and blocks those it deems malicious. Deployed systems include [Llama Prompt Guard 2](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M) (released at 86M and 22M parameters), [Lakera Guard](https://www.checkpoint.com/press-releases/check-point-acquires-lakera-to-deliver-end-to-end-ai-security-for-enterprises/) (acquired by Check Point in late 2025), and Microsoft [Azure Prompt Shields](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/jailbreak-detection). A more principled variant, known-answer detection, is formalized by [Liu et al. (2024)](https://arxiv.org/abs/2310.12815).

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-input-guard.html" style="width: 100%; height: 300px; border: none;" loading="lazy" title="An input guard catches obvious payloads but lets obfuscated and multi-turn attacks through, while over-blocking benign traffic."></iframe>
</div>

*Figure 6. The input-guard regime. Obvious payloads are caught; obfuscated and multi-turn attacks evade; benign traffic is sometimes over-blocked.*

A guard is itself a model, and inherits the weakness it is meant to remove: its verdict is probabilistic and therefore evadable. [Hackett et al. (2025)](https://arxiv.org/abs/2504.11168) evaluate six guard systems (including Prompt Guard and Azure Prompt Shield) and find that character-level perturbations and adversarial manipulations evade them, reaching complete evasion in some configurations. Two structural problems compound this. First, guards score each input in isolation, whereas multi-turn attacks such as [Crescendo](https://www.usenix.org/system/files/usenixsecurity25-russinovich.pdf) (USENIX Security 2025) distribute the attack across individually benign turns, so no single message trips the filter. Second, the base-rate problem is severe: when the overwhelming majority of traffic is legitimate, even a sub-1% false-positive rate blocks many real users. Lakera reports [false positives below 0.5% at over 98% detection](https://www.lakera.ai/blog/lakera-guard-fall-25-adaptive-at-scale) on its own evaluation. Those figures are competitive, yet they still impose enough friction at scale to push operators toward relaxing or disabling the filter. Input filtering reduces the volume of unsophisticated attacks; it does not bound a determined one.

### 3.4 Layer 4: Output and trajectory monitoring

This layer assumes the preceding ones will eventually fail and shifts attention from the input to the agent's behavior. The basic form is an output guard, a data-loss filter such as [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) or a conventional DLP scanner, that inspects the final response for leaked secrets. It is blind to intent and sees only the exit.

The more capable form is trajectory-aware: it inspects the agent's intermediate reasoning and each tool call. [LlamaFirewall](https://arxiv.org/abs/2505.03574) orchestrates guard models to audit the chain of reasoning for goal hijacking, scan generated code, and inspect tool interactions, for instance by examining the content a tool returns before the agent acts on it.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-trajectory-guard.html" style="width: 100%; height: 322px; border: none;" loading="lazy" title="A trajectory guard inspects every reasoning and tool step inside the agent loop; an output guard only scans the final answer."></iframe>
</div>

*Figure 7. Output vs. trajectory monitoring. An output guard inspects only the final response; a trajectory guard inspects each reasoning and tool step, the channel through which incidents like EchoLeak manifest.*

This layer observes the channel the others cannot: EchoLeak exfiltrated data through fetched content and a permitted action, which the trajectory layer is best positioned to catch. Whether it can also stop the attack depends on where it sits. An inline trajectory guard that gates each tool call can block a dangerous action before it executes, which is genuine prevention; a passive output scanner runs after the fact and can only withhold the final response, so any side effect from a tool call that already ran has happened. Either way the guard is itself a model, subject to the same evasion pressure as Layer 3, and inspecting every step adds latency and cost.

## 4. Why No Single Layer Suffices

The layers fail for different reasons, but they fail in a common pattern: each is defeated once the attacker is permitted to adapt. The strongest evidence is *The Attacker Moves Second* ([Nasr et al., 2025](https://arxiv.org/abs/2510.09023)), a collaboration among authors at OpenAI, Anthropic, and Google DeepMind. The authors take twelve recent defenses, most reporting attack success rates under 5% on static evaluations, and subject them to adaptive attacks combining gradient-based search, reinforcement learning, and human red-teaming. On the majority of the twelve, attack success rises above 90%. A notable secondary finding is that human-guided exploration remained the single most effective strategy, the one component a fixed corpus cannot represent.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-static-vs-adaptive.html" style="width: 100%; height: 360px; border: none;" loading="lazy" title="Defenses reporting under 5% attack success on static benchmarks exceeded 90% once the attacker was allowed to adapt."></iframe>
</div>

*Figure 8. Static vs. adaptive evaluation (illustrative; after [Nasr et al. (2025)](https://arxiv.org/abs/2510.09023)). Defenses that appear robust against a fixed attack corpus are substantially weaker against an adversary that observes failures and adapts.*

This single result spans the taxonomy, because the twelve defenses are themselves a mix of prompt-level, training-based, and filtering approaches. It implicates Layer 2, since several of the twelve are training-based; Layer 3, consistent with the direct evasion findings of [Hackett et al.](https://arxiv.org/abs/2504.11168) and the multi-turn evasion of [Crescendo](https://www.usenix.org/system/files/usenixsecurity25-russinovich.pdf); and Layer 1, which the separability result of [Zverev et al.](https://arxiv.org/abs/2403.06833) already bounds. Each defense measurably raises attacker cost, so none is worthless. But a robustness figure measured against a frozen attack set still measures the wrong quantity, and a deployment must compose layers and verify the composite rather than trusting any one of them.

## 5. Compose Defenses Under a Budget

If no layer suffices and all layers carry a cost, the engineering problem is selection, not maximization. Each added layer expands coverage but imposes a tax along three axes: **latency** (an input or output guard adds a serial model call, typically 100–300 ms; trajectory monitoring adds per-step overhead), **cost** (each guard or judge multiplies per-turn inference spend), and **utility** (a classifier tuned aggressively enough to catch adaptive attacks raises its false-positive rate and blocks legitimate work). Deploying every layer is rarely the right choice; it maximizes the tax while still not closing the gap.

<div style="margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
  <iframe src="/content/research/charts/pi-combine-constraints.html" style="width: 100%; height: 330px; border: none;" loading="lazy" title="Composing layers trades coverage against latency, cost, and utility; a common strong default is a hardened model plus trajectory monitoring, with confinement where the task allows."></iframe>
</div>

*Figure 9. Composition under constraints. The aim is a layer combination whose adversarial cost-to-exploit exceeds the value at risk, within the operator's latency and cost budget; maximal coverage is not the goal.*

The right objective is economic rather than absolute, and it follows the established security-economics literature. The [Gordon-Loeb model](https://dl.acm.org/doi/10.1145/581271.581274) holds that optimal security investment is bounded by expected loss, and game-theoretic treatments ([Alpcan and Başar, 2011](https://www.cambridge.org/core/books/network-security/1A2409971C498E498EC020E8DC40FFA3)) define a system as secure when the cost to exploit it exceeds the attacker's expected gain. Applied to an agent, this yields a concrete procedure:

1. **Enumerate the agent's tools and the maximum exploitable value of each.** A refund tool capped at \$25 carries a different risk than an unbounded data export.
2. **Establish the model-layer floor.** The intrinsic resistance of the chosen model (Layer 2) sets the minimum adversarial cost before any external layer is added.
3. **Add layers until adversarial cost exceeds value at risk, within budget.** For most deployments the efficient default is a hardened model (Layer 2) and trajectory monitoring (Layer 4), with input filtering (Layer 3) reserved for the highest-risk surfaces where its latency and false-positive tax is justified.
4. **Verify the composite empirically**, because the preceding steps rest on cost estimates that only adversarial testing can confirm.

This reframes "is the agent safe?" as "does breaking it cost more than the attacker can gain?", a question with a measurable answer. The same logic underlies our prior work on Adversarial Cost to Exploit ([ACE](/blog/adversarial-cost-to-exploit)), which measures the token expenditure an autonomous adversary must spend to breach a given model-agent configuration and maps that cost to incentive-compatibility thresholds.

## 6. Verify Against an Adaptive Adversary

Section 4 implies a methodological commitment: a defense must be evaluated against an adaptive adversary operating in the deployment's own environment, not against a fixed list of payloads. The common practice, scoring a corpus of known injections and reporting a block rate, measures the wrong quantity, because the evasions catalogued in Section 4 (token substitution, encoding, low-resource languages, multi-turn staging) ensure that a frozen corpus cannot represent the attack that eventually lands.

Dynamic benchmarks address part of this gap. [AgentDojo](https://arxiv.org/abs/2406.13352) evaluates attacks and defenses in live agent task environments rather than on static strings; [InjecAgent](https://arxiv.org/abs/2403.02691) targets indirect injection through tool outputs; and the [Backbone Breaker Benchmark](https://arxiv.org/abs/2510.22620) (b3) and similar efforts broaden coverage. Their residual limitation is that they still evaluate against predominantly fixed corpora and generic environments, which compresses the measured spread between strong and weak defenses, a limitation that cost-based measurement is designed to address (see [ACE](/blog/adversarial-cost-to-exploit)). Two properties make an evaluation faithful to the threat model:

- **Adaptivity.** The evaluator must observe each blocked attempt and adjust, reproducing the loop that [Nasr et al.](https://arxiv.org/abs/2510.09023) show is decisive. A pass/fail score against a frozen set understates a real adversary.
- **Environmental specificity.** An attack on a coding assistant has little in common with one on a support agent. Faithful evaluation instantiates the deployment's own tools and content surfaces, including the ability to plant indirect payloads in retrievable content, rather than testing a generic chatbot.

Reporting the result as a *cost* rather than a binary outcome makes the economic framework of Section 5 actionable: it states how much an adversary must spend, which is the quantity the incentive-compatibility condition requires. Embedding such evaluation in continuous integration, so that every system-prompt or tool change is re-tested before deployment, converts a one-time audit into a standing control.

## 7. Conclusion: Bound the Blast Radius

Prompt injection is unlikely to be solved by any technique surveyed here, because the gap it exploits is architectural: a language model does not enforce the boundary between instruction and data that a relational engine enforces between code and values. The frontier developers say as much, and bound the problem rather than claim to close it. The constructive response is to treat the model as potentially compromised and to engineer for that assumption: compose complementary layers under explicit latency and cost budgets, and verify the composite against an adaptive, environment-specific adversary until the cost to exploit it exceeds the value it guards. The goal is a well-bounded agent, one that holds nothing worth the price of the attack when an injection finally succeeds.

---

*The Adversarial Cost to Exploit methodology referenced above is described in detail [here](/blog/adversarial-cost-to-exploit). The authors build offensive security tooling for LLM agents at [Fabraix](https://fabraix.com).*
