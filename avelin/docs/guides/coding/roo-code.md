1|# Roo Code Integration
2|
3|AVELIN API works with [Roo Code](https://github.com/RooVetGit/Roo-Code) — a powerful autonomous AI coding agent that lives inside VS Code. Roo Code can create and edit files, run terminal commands, search codebases, use the browser, and work through complex multi-step tasks autonomously. It supports multiple operating modes (Code, Architect, Ask, Debug) and integrates deeply with your development workflow.
4|
5|> **Why AVELIN + Roo Code?** Roo Code's autonomous agentic loops demand reliable tool calling, massive context windows, and fast inference — AVELIN delivers all three with 1M-token contexts, ~100 tps throughput, and automatic failover across frontier models.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install Roo Code
16|
17|1. Open VS Code
18|2. Go to the Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
19|3. Search for **Roo Code**
20|4. Click **Install**
21|
22|### Step 3: Configure Roo Code
23|
24|1. Open the Roo Code panel (click the Roo icon in the sidebar)
25|2. Click the settings/gear icon
26|3. In the **API Provider** dropdown, select **OpenAI Compatible**
27|4. Enter your settings:
28|
29|| Field | Value |
30||---|---|
31|| **Base URL** | `https://api.avelin.ai/v1` |
32|| **API Key** | `sk-ave...xxxx` |
33|| **Model ID** | `avelin-coding-pro` |
34|| **Max Tokens** | `65536` |
35|
36|5. Click **Done** or save your configuration
37|
38|Alternatively, Roo Code also supports the **Anthropic** API format:
39|
40|| Field | Value |
41||---|---|
42|| **API Provider** | Anthropic |
43|| **Base URL** | `https://api.avelin.ai` |
44|| **API Key** | `sk-ave...xxxx` |
45|| **Model ID** | `avelin-coding-pro` |
46|| **Max Tokens** | `65536` |
47|
48|We recommend the **OpenAI Compatible** provider for Roo Code — it provides the broadest model compatibility and reliable streaming.
49|
50|### Step 4: Select Your Model
51|
52|In the Roo Code panel, choose your model from the dropdown. Start with `avelin-coding-pro` for the best balance of speed, context, and reasoning capability.
53|
54|---
55|
56|## Recommended Models
57|
58|### Primary Recommendation: `avelin-coding-pro`
59|
60|For autonomous coding workflows with Roo Code:
61|
62|| Feature | avelin-coding-pro | Why it matters for Roo Code |
63||---|---|---|
64|| **Context window** | **1M tokens** | Roo accumulates context across file reads, terminal output, and browser actions |
65|| **Max output** | **65K tokens** | Large file edits and comprehensive multi-step plans |
66|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — Roo loops complete faster |
67|| **Reasoning** | Deep step-by-step thinking | Better autonomous decision-making in complex tasks |
68|| **Tool calling** | First-class support | Roo relies on reliable structured tool calls for file ops, terminal, and search |
69|
70|### Alternative Models
71|
72|| Model | When to use |
73||---|---|
74|| `avelin-agentic-pro` | Long autonomous workflows — optimized for multi-step agentic loops |
75|| `avelin-coding-ultra` | Complex refactors, architecture changes, system design |
76|| `avelin-coding-fast` | Lighter tasks, quick fixes — saves cost on simple work |
77|| `avelin-fast` | Quick lookups and simple tasks — lowest cost, fastest response |
78|
79|**Tip:** Use `avelin-agentic-pro` when running Roo Code in fully autonomous mode with auto-approve enabled. It's specifically tuned for extended tool-use chains.
80|
81|---
82|
83|## Why AVELIN for Roo Code?
84|
85|### 1. Cost Optimization
86|
87|Roo Code's autonomous loops can consume significant tokens across many tool calls and context accumulations. AVELIN optimizes costs:
88|
89|- **Prompt caching**: ~80% cost reduction on repeated system prompts and instructions
90|- **Competitive pricing**: Lower per-token costs than direct provider APIs
91|- **Pay-per-token**: No subscription lock-in or seat limits
92|
93|### 2. Model Diversity
94|
95|Access multiple frontier coding models through a single API key:
96|
97|- Switch between reasoning-heavy and fast models depending on task complexity
98|- Use `avelin-coding-ultra` for planning mode, `avelin-coding-pro` for execution
99|- AVELIN automatically routes to the best available backend
100|
101|### 3. Reliability
102|
103|Roo Code runs long autonomous sessions that can't afford mid-task failures:
104|
105|- **Automatic failover**: If one backend is slow or unavailable, AVELIN switches to another
106|- **Retry logic**: Transient errors are handled automatically
107|- **99.9% uptime**: Enterprise-grade infrastructure
108|
109|### 4. 1M Context Windows
110|
111|Roo Code sessions accumulate context quickly — every file read, terminal output, search result, and browser interaction adds tokens. AVELIN's 1M-token context windows mean longer autonomous sessions without context truncation or task restarts.
112|
113|---
114|
115|## Example Workflows
116|
117|### Autonomous Feature Development
118|
119|```
120|Roo Code Panel:
121|
122|You> Add user authentication to the Express app. Include JWT tokens,
123|     bcrypt password hashing, protected routes, and tests.
124|
125|Roo: I'll implement authentication for your Express app. Let me start
126|     by examining the project structure.
127|
128|[Reads package.json, src/index.ts, src/routes/]
129|
130|I can see this is an Express app with TypeScript. Here's my plan:
131|1. Add User model and migration
132|2. Create auth middleware with JWT verification
133|3. Add /auth/register and /auth/login endpoints
134|4. Protect existing routes with auth middleware
135|5. Write integration tests
136|
137|Let me implement each step...
138|
139|[Creates src/models/User.ts]
140|[Creates src/middleware/auth.ts]
141|[Creates src/routes/auth.ts]
142|[Updates src/index.ts to register routes]
143|[Creates tests/auth.test.ts]
144|[Runs npm test — all tests pass]
145|
146|Done! I've implemented:
147|- User model with bcrypt password hashing
148|- JWT generation and verification middleware
149|- /auth/login and /auth/register endpoints
150|- Protected route middleware
151|- 8 passing integration tests
152|```
153|
154|### Multi-File Refactoring
155|
156|```
157|You> @src/services/ Refactor all services to use dependency injection
158|     instead of direct database imports.
159|
160|Roo: Let me analyze the current service structure...
161|
162|[Reads all files in src/services/]
163|[Identifies 6 services with direct DB imports]
164|
165|I'll refactor each service to accept dependencies through constructors.
166|This will improve testability and reduce coupling.
167|
168|[Updates src/services/userService.ts]
169|[Updates src/services/orderService.ts]
170|[Updates src/services/paymentService.ts]
171|[Updates src/services/notificationService.ts]
172|[Creates src/container.ts for DI setup]
173|[Updates tests for new constructor signatures]
174|[Runs test suite — all passing]
175|```
176|
177|### Debug and Fix Workflow
178|
179|```
180|You> The API returns 500 errors on the /orders endpoint when
181|     the request body contains special characters in the address.
182|
183|Roo: Let me investigate this issue.
184|
185|[Reads src/routes/orders.ts]
186|[Reads src/validators/orderValidator.ts]
187|[Checks error logs via terminal]
188|[Reproduces the error with a test request]
189|
190|Found it — the address validation regex doesn't handle Unicode
191|characters, causing an unhandled exception. Let me fix this:
192|
193|[Updates validator with proper Unicode regex]
194|[Adds test cases for international addresses]
195|[Runs tests — all passing]
196|
197|The issue was in the address validation regex at line 42.
198|Fixed and added 5 test cases covering international addresses.
199|```
200|
201|---
202|
203|## Advanced Configuration
204|
205|### Roo Code Modes
206|
207|Roo Code supports multiple operating modes, each suited to different tasks:
208|
209|| Mode | Description | Recommended Model |
210||---|---|---|
211|| **Code** | Full autonomous coding — reads, writes, runs terminal | `avelin-coding-pro` |
212|| **Architect** | Plans and designs without executing changes | `avelin-coding-ultra` |
213|| **Ask** | Questions and explanations without file changes | `avelin-fast` |
214|| **Debug** | Focused debugging and error resolution | `avelin-coding-pro` |
215|
216|Switch modes from the Roo Code panel to match your current task. Use Architect mode for planning, then switch to Code mode for implementation.
217|
218|### Custom Instructions
219|
220|Add project-specific instructions in Roo Code's settings panel:
221|
222|```
223|You are working on a Python FastAPI application.
224|Follow these conventions:
225|- Use Pydantic v2 models for request/response schemas
226|- Use async/await for all database operations with SQLAlchemy 2.0
227|- Write tests using pytest with httpx AsyncClient
228|- Follow repository pattern for data access
229|- Include type hints on all function signatures
230|```
231|
232|### Context Management
233|
234|Roo Code can consume large amounts of context during autonomous sessions:
235|
236|- **Start new tasks** for unrelated work to reset context
237|- **Use @-mentions** to include specific files instead of letting Roo search broadly
238|- **Enable auto-condense** in Roo settings to summarize old context automatically
239|- **Monitor token usage** in the Roo Code status bar to stay within context limits
240|
241|With AVELIN's 1M-token context window, you can handle significantly larger sessions before needing to reset.
242|
243|### Auto-Approve Settings
244|
245|For trusted projects, enable auto-approve to let Roo Code work without interruptions:
246|
247|1. Open Roo Code settings
248|2. Enable **Auto-approve file edits**
249|3. Enable **Auto-approve terminal commands**
250|4. Optionally set **command deny list** for dangerous commands (e.g., `rm -rf`, `DROP TABLE`)
251|
252|---
253|
254|## Troubleshooting
255|
256|| Issue | Solution |
257||---|---|
258|| **"Model not found"** | Ensure the model name is exactly as listed (e.g., `avelin-coding-pro`) |
259|| **"API key invalid"** | Verify your AVELIN API key starts with `sk-ave` and is correctly entered |
260|| **Tool calls failing** | Use `avelin-coding-pro` or `avelin-agentic-pro` — these have first-class function calling |
261|| **Slow responses** | Try `avelin-fast` for quicker responses on simple tasks |
262|| **Context too long errors** | Start a new Roo task to reset context, or enable auto-condense |
263|| **Streaming not working** | Ensure streaming is enabled in Roo Code settings; both API formats support it |
264|| **Roo loops endlessly** | Add clearer task descriptions, or switch to `avelin-coding-pro` for better reasoning |
265|| **Connection timeout** | Check your network; AVELIN has automatic failover but verify base URL is correct |
266|
267|---
268|
269|## Related
270|
271|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
272|- [Cline Guide](cline.md) — Similar VS Code autonomous agent
273|- [Cursor Guide](cursor.md) — AI-first code editor
274|- [Hermes Agent Guide](../hermes.md) — Terminal-based agentic coding tool
275|- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
276|- [Model Catalog](../../models/README.md) — Full model comparison
277|- [Roo Code GitHub](https://github.com/RooVetGit/Roo-Code) — Official Roo Code repository
278|