1|# OpenCode Integration
2|
3|AVELIN API works seamlessly with [OpenCode](https://opencode.ai) — a terminal-based AI coding tool that provides fast, context-aware code assistance directly in your terminal.
4|
5|> **Why AVELIN + OpenCode?** Get access to frontier coding models with 1M-token context windows for large codebases, automatic failover, and competitive pricing.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install OpenCode
16|
17|**Prerequisites:** Install [Node.js](https://nodejs.org/en/download/) (v18.0 or later).
18|
19|```bash
20|npm install -g opencode-ai
21|opencode -v
22|```
23|
24|### Step 3: Configure OpenCode
25|
26|Create the configuration file at `~/.config/opencode/opencode.json`:
27|
28|```json
29|{
30|  "$schema": "https://opencode.ai/config.json",
31|  "provider": {
32|    "avelin": {
33|      "npm": "@ai-sdk/anthropic",
34|      "name": "AVELIN AI",
35|      "options": {
36|        "baseURL": "https://api.avelin.ai",
37|        "apiKey": "sk-a...
38|      },
39|      "models": {
40|        "avelin-coding-pro": {
41|          "name": "Avelin Coding Plus",
42|          "options": {
43|            "thinking": {
44|              "type": "enabled",
45|              "budgetTokens": 32768
46|            }
47|          }
48|        },
49|        "avelin-coding-fast": {
50|          "name": "Avelin Coding",
51|          "options": {
52|            "thinking": {
53|              "type": "enabled",
54|              "budgetTokens": 32768
55|            }
56|          }
57|        },
58|        "avelin-coding-ultra": {
59|          "name": "Avelin Coding Architect",
60|          "options": {
61|            "thinking": {
62|              "type": "enabled",
63|              "budgetTokens": 32768
64|            }
65|          }
66|        },
67|        "avelin-fast": {
68|          "name": "Avelin Fast"
69|        }
70|      }
71|    }
72|  }
73|}
74|```
75|
76|### Step 4: Start OpenCode
77|
78|```bash
79|opencode
80|```
81|
82|OpenCode will automatically use AVELIN as the backend.
83|
84|---
85|
86|## Recommended Models
87|
88|### Primary Recommendation: `avelin-coding-pro`
89|
90|For everyday coding tasks:
91|
92|| Feature | avelin-coding-pro | Why it matters for OpenCode |
93||---|---|---|
94|| **Context window** | **1M tokens** | Large codebases and multi-file refactors without context loss |
95|| **Max output** | **65K tokens** | Generate large code files and comprehensive tests |
96|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — faster feedback loops |
97|| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs, understands architectural impact |
98|| **Tool calling** | First-class support | Reliable file operations and command execution |
99|
100|### Alternative Models
101|
102|| Model | When to use |
103||---|---|
104|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
105|| `avelin-coding-ultra` | System design, architecture reviews, security-sensitive refactors |
106|| `avelin-fast` | Quick lookups and simple extractions — lowest cost, fastest response |
107|
108|---
109|
110|## Why AVELIN for OpenCode?
111|
112|### 1. **Cost Optimization**
113|
114|OpenCode sessions can be long with large context windows. AVELIN delivers frontier-tier coding quality at sustainable economics:
115|
116|- **Prompt caching**: ~80% cost reduction on repeated system prompts
117|- **Competitive pricing**: Lower per-token costs than direct provider APIs
118|- **Pay-per-token**: No subscription lock-in
119|
120|### 2. **Model Diversity**
121|
Access multiple frontier coding models through one API. AVELIN routes your requests to a diverse set of frontier models across multiple cloud providers, ensuring high availability and consistent quality. If one provider is slow or unavailable, your request automatically routes to the next best option.
128|
129|### 3. **Reliability**
130|
131|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
132|- **Retry logic**: Transient errors are handled automatically
133|- **99.9% uptime**: Enterprise-grade infrastructure
134|
135|### 4. **1M Context Windows**
136|
137|OpenCode works best with large context. AVELIN's coding models support 1M tokens — load entire repositories without chunking.
138|
139|---
140|
141|## Example Session
142|
143|```bash
144|$ opencode
145|
146|╭─ OpenCode ────────────────────────────────────╮
147|│ Model: avelin-coding-pro                    │
148|│ Provider: AVELIN (api.avelin.ai)            │
149|╰───────────────────────────────────────────────╯
150|
151|You> Add input validation to the user registration endpoint.
152|
153|OpenCode> I'll add comprehensive validation to the registration endpoint.
154|          Let me examine the current implementation...
155|
156|[Reads routes/auth.js, models/User.js]
157|
158|Here's my plan:
159|1. Add validation middleware using Joi
160|2. Validate email format, password strength, username uniqueness
161|3. Add error handling for validation failures
162|4. Write tests for valid and invalid inputs
163|
164|Shall I proceed?
165|
166|You> yes
167|
168|OpenCode> [Creates middleware/validateRegistration.js]
169|          [Updates routes/auth.js to use validation]
170|          [Creates tests/auth.validation.test.js]
171|
172|Done! I've added:
173|- Email format validation
174|- Password strength check (min 8 chars, uppercase, lowercase, number, special char)
175|- Username uniqueness check
176|- 8 passing tests covering valid and invalid cases
177|
178|Run `npm test` to verify.
179|```
180|
181|---
182|
183|## Advanced Configuration
184|
185|### Thinking Budget
186|
187|The configuration includes `budgetTokens: 32768` for thinking. This allocates tokens for the model's reasoning process:
188|
189|- **Higher budget** (32K+): Better for complex refactors, architecture decisions
190|- **Lower budget** (8K): Faster responses for simple edits
191|- **Disabled**: For quick questions where speed matters most
192|
193|```json
194|{
195|  "avelin-fast": {
196|    "name": "Avelin Fast",
197|    "options": {
198|      "thinking": {
199|        "type": "disabled"
200|      }
201|    }
202|  }
203|}
204|```
205|
206|### Model Switching
207|
208|You can switch models on-the-fly in OpenCode:
209|
210|```bash
211|opencode --model avelin-coding-ultra
212|```
213|
214|Or set different models for different tasks in your config.
215|
216|---
217|
218|## Troubleshooting
219|
220|| Issue | Solution |
221||---|---|
222|| **"Provider not found"** | Ensure `@ai-sdk/anthropic` is specified in the npm field |
223|| **"Model not available"** | Use a valid AVELIN model name from the [Model Catalog](../../models/README.md) |
224|| **Slow first response** | Normal — model thinks before responding. Streaming starts after reasoning completes. |
225|| **Context too long errors** | Set `context_length: 1000000` in your configuration |
226|| **API key errors** | Verify your AVELIN API key is correct and active |
227|
228|---
229|
230|## Related
231|
232|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
233|- [Hermes Agent Guide](../hermes.md) — Another terminal-based coding tool
234|- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
235|- [Model Catalog](../../models/README.md) — Full model comparison
236|- [OpenCode Docs](https://opencode.ai) — Official OpenCode documentation
237|