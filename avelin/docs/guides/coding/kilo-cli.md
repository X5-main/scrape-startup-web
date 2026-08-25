1|# Kilo CLI Integration
2|
3|AVELIN API works with [Kilo CLI](https://kilocode.ai) — the command-line client for Kilo Code. Kilo CLI connects directly to AVELIN and provides terminal-based AI coding assistance with file operations, command execution, and multi-step task automation.
4|
5|> **Why AVELIN + Kilo CLI?** Get access to frontier coding models through Kilo's terminal interface with 1M-token context windows, automatic failover, and competitive pricing.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install Kilo CLI
16|
17|**Prerequisites:** Install [Node.js](https://nodejs.org/en/download/) (v18.0 or later).
18|
19|```bash
20|npm install -g @kilocode/cli
21|kilo --version
22|```
23|
24|If a version number displays, the installation was successful.
25|
26|### Step 3: Configure Kilo CLI
27|
28|Create the configuration file at `~/.config/kilo/config.json`:
29|
30|```json
31|{
32|  "$schema": "https://kilo.ai/config.json",
33|  "provider": {
34|    "avelin": {
35|      "npm": "@ai-sdk/anthropic",
36|      "name": "AVELIN AI",
37|      "options": {
38|        "baseURL": "https://api.avelin.ai",
39|        "apiKey": "sk-a...
40|      },
41|      "models": {
42|        "avelin-coding-pro": {
43|          "name": "Avelin Coding Plus",
44|          "options": {
45|            "thinking": {
46|              "type": "enabled",
47|              "budgetTokens": 32768
48|            }
49|          }
50|        },
51|        "avelin-coding-fast": {
52|          "name": "Avelin Coding",
53|          "options": {
54|            "thinking": {
55|              "type": "enabled",
56|              "budgetTokens": 32768
57|            }
58|          }
59|        },
60|        "avelin-coding-ultra": {
61|          "name": "Avelin Coding Architect",
62|          "options": {
63|            "thinking": {
64|              "type": "enabled",
65|              "budgetTokens": 32768
66|            }
67|          }
68|        },
69|        "avelin-fast": {
70|          "name": "Avelin Fast"
71|        }
72|      }
73|    }
74|  }
75|}
76|```
77|
78|### Step 4: Start Kilo CLI
79|
80|```bash
81|kilo
82|```
83|
84|Kilo CLI will automatically use AVELIN as the backend.
85|
86|---
87|
88|## Recommended Models
89|
90|### Primary Recommendation: `avelin-coding-pro`
91|
92|For everyday coding tasks:
93|
94|| Feature | avelin-coding-pro | Why it matters for Kilo CLI |
95||---|---|---|
96|| **Context window** | **1M tokens** | Large codebases and multi-file refactors without context loss |
97|| **Max output** | **65K tokens** | Generate large code files and comprehensive tests |
98|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — faster feedback loops |
99|| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs, understands architectural impact |
100|| **Tool calling** | First-class support | Reliable file operations and command execution |
101|
102|### Alternative Models
103|
104|| Model | When to use |
105||---|---|
106|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
107|| `avelin-coding-ultra` | System design, architecture reviews, security-sensitive refactors |
108|| `avelin-fast` | Quick lookups and simple extractions — lowest cost, fastest response |
109|
110|---
111|
112|## Why AVELIN for Kilo CLI?
113|
114|### 1. **Cost Optimization**
115|
116|Kilo CLI sessions can be long with large context windows. AVELIN delivers frontier-tier coding quality at sustainable economics:
117|
118|- **Prompt caching**: ~80% cost reduction on repeated system prompts
119|- **Competitive pricing**: Lower per-token costs than direct provider APIs
120|- **Pay-per-token**: No subscription lock-in
121|
122|### 2. **Model Diversity**
123|
Access multiple frontier coding models through one API. AVELIN routes your requests to a diverse set of frontier models across multiple cloud providers, ensuring high availability and consistent quality. If one provider is slow or unavailable, your request automatically routes to the next best option.
130|
131|### 3. **Reliability**
132|
133|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
134|- **Retry logic**: Transient errors are handled automatically
135|- **99.9% uptime**: Enterprise-grade infrastructure
136|
137|### 4. **1M Context Windows**
138|
139|Kilo CLI works best with large context. AVELIN's coding models support 1M tokens — load entire repositories without chunking.
140|
141|---
142|
143|## Example Session
144|
145|```bash
146|$ kilo
147|
148|╭─ Kilo CLI ──────────────────────────────────╮
149|│ Model: avelin-coding-pro                   │
150|│ Provider: AVELIN (api.avelin.ai)           │
151|╰─────────────────────────────────────────────╯
152|
153|You> Refactor the database layer to use the repository pattern.
154|
155|Kilo: I'll refactor your database layer to use the repository pattern.
156|      Let me examine the current implementation...
157|
158|[Reads database files, service layer]
159|
160|Current state:
161|- Direct database calls in service files
162|- No abstraction layer
163|- Difficult to test and maintain
164|
165|Here's my plan:
166|1. Create repository interfaces for each entity
167|2. Implement repositories with database operations
168|3. Update services to use repositories instead of direct DB calls
169|4. Add dependency injection for testability
170|5. Write tests for repositories and updated services
171|
172|Shall I proceed?
173|
174|You> yes
175|
176|Kilo: [Creates repositories/user.repository.ts]
177|      [Creates repositories/product.repository.ts]
178|      [Updates services/user.service.ts]
179|      [Updates services/product.service.ts]
180|      [Creates tests/repositories/user.repository.test.ts]
181|      [Runs tests — all passing]
182|
183|Done! I've refactored the database layer:
184|- Created repository interfaces and implementations
185|- Updated all services to use repositories
186|- Added dependency injection
187|- Wrote 15 passing tests
188|
189|The codebase is now more testable and maintainable.
190|```
191|
192|---
193|
194|## Advanced Configuration
195|
196|### Multiple Providers
197|
198|You can configure multiple providers in `~/.config/kilo/config.json`:
199|
200|```json
201|{
202|  "$schema": "https://kilo.ai/config.json",
203|  "provider": {
204|    "avelin": {
205|      "npm": "@ai-sdk/anthropic",
206|      "name": "AVELIN AI",
207|      "options": {
208|        "baseURL": "https://api.avelin.ai",
209|        "apiKey": "sk-a...
210|      },
211|      "models": {
212|        "avelin-coding-pro": {
213|          "name": "Avelin Coding Plus",
214|          "options": {
215|            "thinking": {
216|              "type": "enabled",
217|              "budgetTokens": 32768
218|            }
219|          }
220|        }
221|      }
222|    },
223|    "avelin-anthropic": {
224|      "npm": "@ai-sdk/anthropic",
225|      "name": "AVELIN AI (Anthropic)",
226|      "options": {
227|        "baseURL": "https://api.avelin.ai",
228|        "apiKey": "sk-a...
229|      },
230|      "models": {
231|        "avelin-coding-pro": {
232|          "name": "Avelin Coding Plus",
233|          "options": {
234|            "thinking": {
235|              "type": "enabled",
236|              "budgetTokens": 32768
237|            }
238|          }
239|        }
240|      }
241|    }
242|  }
243|}
244|```
245|
246|### Thinking Budget
247|
248|The configuration includes `budgetTokens: 32768` for thinking. This allocates tokens for the model's reasoning process:
249|
250|- **Higher budget** (32K+): Better for complex refactors, architecture decisions
251|- **Lower budget** (8K): Faster responses for simple edits
252|- **Disabled**: For quick questions where speed matters most
253|
254|```json
255|{
256|  "avelin-fast": {
257|    "name": "Avelin Fast",
258|    "options": {
259|      "thinking": {
260|        "type": "disabled"
261|      }
262|    }
263|  }
264|}
265|```
266|
267|### Model Switching
268|
269|You can switch models on-the-fly in Kilo CLI:
270|
271|```bash
272|kilo --model avelin-coding-ultra
273|```
274|
275|Or set different models for different tasks in your config.
276|
277|---
278|
279|## Troubleshooting
280|
281|| Issue | Solution |
282||---|---|
283|| **"Provider not found"** | Ensure `@ai-sdk/anthropic` is specified in the npm field |
284|| **"Model not available"** | Use a valid AVELIN model name from the [Model Catalog](../../models/README.md) |
285|| **Slow first response** | Normal — model thinks before responding. Streaming starts after reasoning completes. |
286|| **Context too long errors** | Set `context_length: 1000000` in your configuration |
287|| **API key errors** | Verify your AVELIN API key is correct and active |
288|
289|---
290|
291|## Related
292|
293|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
294|- [Hermes Agent Guide](../hermes.md) — Another terminal-based coding tool
295|- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
296|- [OpenCode Guide](opencode.md) — Terminal-based AI coding tool
297|- [Model Catalog](../../models/README.md) — Full model comparison
298|- [Kilo Code](https://kilocode.ai) — Official Kilo Code website
299|