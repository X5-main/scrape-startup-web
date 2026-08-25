1|# OpenClaw Integration
2|
3|AVELIN API works seamlessly with [OpenClaw](https://openclaw.ai) — an open-source agentic coding platform that orchestrates multiple AI models for complex software engineering workflows.
4|
5|> **Why AVELIN + OpenClaw?** OpenClaw's multi-agent architecture pairs perfectly with AVELIN's diverse model catalog. Use specialized models for different tasks — coding, reasoning, planning — all through one governed API.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Configure OpenClaw
16|
17|OpenClaw supports both **Anthropic** and **OpenAI** API formats. We recommend the **Anthropic surface** for best compatibility.
18|
19|#### Option A: Environment Variables
20|
21|Set these in your shell profile or OpenClaw's configuration:
22|
23|```bash
24|export OPENCLAW_API_KEY="sk-a...
25|export OPENCLAW_BASE_URL="https://api.avelin.ai"
26|```
27|
28|#### Option B: Configuration File
29|
30|Edit `~/.openclaw/config.json`:
31|
32|```json
33|{
34|  "providers": {
35|    "avelin": {
36|      "type": "anthropic",
37|      "base_url": "https://api.avelin.ai",
38|      "api_key": "sk-a...
39|      "models": {
40|        "coding": "avelin-coding-pro",
41|        "reasoning": "avelin-ultra",
42|        "fast": "avelin-fast"
43|      }
44|    }
45|  },
46|  "default_provider": "avelin"
47|}
48|```
49|
50|### Step 3: Start OpenClaw
51|
52|```bash
53|openclaw
54|```
55|
56|OpenClaw will use AVELIN as its backend provider.
57|
58|---
59|
60|## Multi-Model Workflows
61|
62|OpenClaw's strength is orchestrating multiple AI agents for complex tasks. AVELIN's diverse model catalog is perfect for this:
63|
64|### Recommended Model Assignments
65|
66|```json
67|{
68|  "agents": {
69|    "architect": {
70|      "model": "avelin-coding-ultra",
71|      "purpose": "System design, architecture decisions, security reviews"
72|    },
73|    "coder": {
74|      "model": "avelin-coding-pro",
75|      "purpose": "Code generation, refactoring, debugging"
76|    },
77|    "planner": {
78|      "model": "avelin-ultra",
79|      "purpose": "Task decomposition, planning, research"
80|    },
81|    "reviewer": {
82|      "model": "avelin-coding-fast",
83|      "purpose": "Code review, test generation, documentation"
84|    },
85|    "assistant": {
86|      "model": "avelin-fast",
87|      "purpose": "Quick questions, simple tasks, high-volume operations"
88|    }
89|  }
90|}
91|```
92|
93|### Example Workflow
94|
95|```bash
96|$ openclaw run "Implement user authentication with JWT tokens"
97|
98|OpenClaw orchestrates:
99|  → Planner (avelin-ultra): Decomposes task into subtasks
100|  → Architect (avelin-coding-ultra): Designs auth system architecture
101|  → Coder (avelin-coding-pro): Implements auth middleware and routes
102|  → Reviewer (avelin-coding-fast): Reviews code, generates tests
103|  → Assistant (avelin-fast): Updates README with usage examples
104|
105|Result: Complete auth system with tests and documentation
106|```
107|
108|---
109|
110|## Why AVELIN for OpenClaw?
111|
112|### 1. **Model Diversity**
113|
114|OpenClaw thrives with specialized models for different tasks. AVELIN provides:
115|
116|- **Coding models** (1M context): `avelin-coding-fast`, `avelin-coding-pro`, `avelin-coding-ultra`
117|- **Reasoning models** (256K context): `avelin-ultra`, `avelin-pro`
118|- **Fast models** (256K context): `avelin-fast`
119|- **Agentic models** (256K context): `avelin-agentic-pro`, `avelin-agentic-ultra`, `avelin-agentic-fast`
120|
121|### 2. **Cost Optimization**
122|
123|Multi-agent workflows can be expensive. AVELIN optimizes costs:
124|
125|- **Route simple tasks to fast models**: Use `avelin-fast` for high-volume operations
126|- **Prompt caching**: ~80% cost reduction on repeated system prompts
127|- **Pay-per-token**: No subscription lock-in
128|
129|### 3. **Reliability**
130|
131|- **Automatic failover**: If one provider is slow, AVELIN switches to another
132|- **Retry logic**: Transient errors handled automatically
133|- **High throughput**: Support for parallel agent execution
134|
135|### 4. **1M Context Windows**
136|
137|OpenClaw agents often work with large codebases. AVELIN's coding models support 1M tokens — no chunking required.
138|
139|---
140|
141|## Configuration Examples
142|
143|### Simple Single-Model Setup
144|
145|For basic OpenClaw usage with one model:
146|
147|```json
148|{
149|  "providers": {
150|    "avelin": {
151|      "type": "anthropic",
152|      "base_url": "https://api.avelin.ai",
153|      "api_key": "sk-a...
154|      "models": {
155|        "default": "avelin-coding-pro"
156|      }
157|    }
158|  }
159|}
160|```
161|
162|### Advanced Multi-Model Setup
163|
164|For complex workflows with specialized agents:
165|
166|```json
167|{
168|  "providers": {
169|    "avelin": {
170|      "type": "anthropic",
171|      "base_url": "https://api.avelin.ai",
172|      "api_key": "sk-a...
173|    }
174|  },
175|  "workflows": {
176|    "feature_development": {
177|      "agents": [
178|        {
179|          "name": "planner",
180|          "model": "avelin-ultra",
181|          "max_tokens": 65536,
182|          "thinking": "enabled"
183|        },
184|        {
185|          "name": "architect",
186|          "model": "avelin-coding-ultra",
187|          "max_tokens": 65536,
188|          "thinking": "enabled"
189|        },
190|        {
191|          "name": "coder",
192|          "model": "avelin-coding-pro",
193|          "max_tokens": 65536,
194|          "thinking": "enabled"
195|        }
196|      ]
197|    },
198|    "quick_fix": {
199|      "agents": [
200|        {
201|          "name": "fixer",
202|          "model": "avelin-fast",
203|          "max_tokens": 8192,
204|          "thinking": "disabled"
205|        }
206|      ]
207|    }
208|  }
209|}
210|```
211|
212|---
213|
214|## Tool Calling Best Practices
215|
216|OpenClaw relies heavily on tool calling for file operations, command execution, and API interactions. AVELIN's models excel at this:
217|
218|### Reliable Tool Formats
219|
220|Both Anthropic and OpenAI tool formats work:
221|
222|```json
223|{
224|  "tools": [
225|    {
226|      "name": "read_file",
227|      "description": "Read file contents",
228|      "input_schema": {
229|        "type": "object",
230|        "properties": {
231|          "path": { "type": "string" }
232|        },
233|        "required": ["path"]
234|      }
235|    }
236|  ]
237|}
238|```
239|
240|### Streaming with Tools
241|
242|Enable streaming for real-time feedback:
243|
244|```json
245|{
246|  "stream": true,
247|  "tools": [...]
248|}
249|```
250|
251|---
252|
253|## Troubleshooting
254|
255|| Issue | Solution |
256||---|---|
257|| **"Provider not found"** | Check that `OPENCLAW_BASE_URL` points to `https://api.avelin.ai` |
258|| **"Model not available"** | Use a valid AVELIN model name from the [Model Catalog](../../models/README.md) |
259|| **Slow multi-agent execution** | Ensure you're using high-throughput models like `avelin-coding-pro` |
260|| **Tool calls failing** | Use `avelin-coding-pro` or `avelin-coding-fast` — these have first-class function calling |
261|| **Context errors** | Set `context_length: 1000000` for coding models |
262|| **Rate limiting** | AVELIN has generous limits. If hit, OpenClaw's retry logic handles it automatically |
263|
264|---
265|
266|## Cost Optimization Tips
267|
268|### 1. Route by Task Complexity
269|
270|```json
271|{
272|  "routing": {
273|    "simple_queries": "avelin-fast",
274|    "code_generation": "avelin-coding-fast",
275|    "complex_refactors": "avelin-coding-pro",
276|    "architecture_design": "avelin-coding-ultra"
277|  }
278|}
279|```
280|
281|### 2. Enable Prompt Caching
282|
283|AVELIN automatically caches repeated system prompts (~80% cost reduction). No configuration needed.
284|
285|### 3. Use Thinking Wisely
286|
287|Enable thinking only for complex tasks:
288|
289|```json
290|{
291|  "agents": {
292|    "planner": {
293|      "model": "avelin-ultra",
294|      "thinking": "enabled"
295|    },
296|    "assistant": {
297|      "model": "avelin-fast",
298|      "thinking": "disabled"
299|    }
300|  }
301|}
302|```
303|
304|---
305|
306|## Example Use Cases
307|
308|### Feature Development Workflow
309|
310|```bash
311|openclaw run "Add user authentication with JWT, including:
312|- Auth middleware
313|- Login/register endpoints
314|- Password hashing
315|- Comprehensive tests
316|- API documentation"
317|```
318|
319|OpenClaw orchestrates multiple agents to deliver the complete feature.
320|
321|### Codebase Refactoring
322|
323|```bash
324|openclaw run "Refactor the database layer to use repository pattern.
325|Update all services, add tests, and create migration guide."
326|```
327|
328|Large context windows allow agents to understand the entire codebase.
329|
330|### Bug Investigation
331|
332|```bash
333|openclaw run "Investigate the memory leak in the caching service.
334|Analyze logs, profile the code, and implement a fix."
335|```
336|
337|Multiple agents collaborate on diagnosis and solution.
338|
339|---
340|
341|## Related
342|
343|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
344|- [Hermes Agent Guide](../hermes.md) — Another agentic coding tool
345|- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
346|- [Model Catalog](../../models/README.md) — Full model comparison
347|- [OpenClaw Docs](https://docs.openclaw.ai) — Official OpenClaw documentation
348|