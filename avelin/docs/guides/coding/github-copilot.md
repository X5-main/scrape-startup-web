1|# GitHub Copilot Integration
2|
3|AVELIN API works with [GitHub Copilot](https://github.com/features/copilot) via the **Bring Your Own Key (BYOK)** feature. This lets you route Copilot's Chat and Agent mode through AVELIN's frontier models — combining Copilot's deep VS Code integration with AVELIN's 1M-token context, model diversity, and competitive pricing.
4|
5|> **Why AVELIN + GitHub Copilot?** Unlock Copilot's Agent mode with frontier coding models, 1M-token context windows, and automatic failover — while keeping the Copilot UI and workflows you already know.
6|
7|---
8|
9|## Prerequisites
10|
11|Before setting up AVELIN with Copilot BYOK, ensure you have:
12|
13|- **GitHub Copilot subscription** (Individual, Business, or Enterprise)
14|- **BYOK enabled** in your Copilot settings (available for Copilot Individual and Business plans)
15|- **VS Code** with the GitHub Copilot and Copilot Chat extensions installed
16|- **AVELIN API key** from [avelin.ai](https://avelin.ai)
17|
18|:::note
19|BYOK (Bring Your Own Key) is a Copilot feature that allows custom API endpoints. Check [GitHub's documentation](https://docs.github.com/en/copilot) for the latest availability and plan requirements.
20|:::
21|
22|---
23|
24|## Quick Setup
25|
26|### Step 1: Get your AVELIN API key
27|
28|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
29|
30|### Step 2: Install GitHub Copilot
31|
32|1. Open VS Code
33|2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
34|3. Install **GitHub Copilot** and **GitHub Copilot Chat**
35|4. Sign in with your GitHub account
36|
37|### Step 3: Configure BYOK in VS Code
38|
39|Open your VS Code `settings.json` (Cmd+Shift+P → "Preferences: Open User Settings (JSON)") and add the AVELIN custom model configuration:
40|
41|```json
42|{
43|  "chat.experimental.modelProvider": {
44|    "openai-compatible": {
45|      "name": "AVELIN",
46|      "baseUrl": "https://api.avelin.ai/v1",
47|      "apiKey": "sk-ave...xxxx"
48|    }
49|  },
50|  "github.copilot.chat.models": [
51|    {
52|      "id": "avelin-coding-pro",
53|      "name": "AVELIN Coding Plus",
54|      "url": "https://api.avelin.ai/v1",
55|      "apiKey": "sk-ave...xxxx",
56|      "maxOutputTokens": 65536
57|    },
58|    {
59|      "id": "avelin-coding-fast",
60|      "name": "AVELIN Coding",
61|      "url": "https://api.avelin.ai/v1",
62|      "apiKey": "sk-ave...xxxx",
63|      "maxOutputTokens": 65536
64|    },
65|    {
66|      "id": "avelin-fast",
67|      "name": "AVELIN Fast",
68|      "url": "https://api.avelin.ai/v1",
69|      "apiKey": "sk-ave...xxxx",
70|      "maxOutputTokens": 16384
71|    }
72|  ]
73|}
74|```
75|
76|:::tip
77|The exact settings key names may vary as GitHub updates the BYOK feature. Check [GitHub Copilot docs](https://docs.github.com/en/copilot) for the current configuration format. The key principle is pointing the custom model endpoint to AVELIN's OpenAI-compatible API.
78|:::
79|
80|### Step 4: Select Your Model
81|
82|1. Open the Copilot Chat panel
83|2. Click the model dropdown at the top of the chat
84|3. Select your AVELIN model (e.g., **AVELIN Coding Plus**)
85|4. Start chatting or switch to **Agent** mode
86|
87|---
88|
89|## Recommended Models
90|
91|### Primary Recommendation: `avelin-coding-pro`
92|
93|For Copilot Chat and Agent mode:
94|
95|| Feature | avelin-coding-pro | Why it matters for Copilot |
96||---|---|---|
97|| **Context window** | **1M tokens** | Large codebases in Agent mode without context loss |
98|| **Max output** | **65K tokens** | Generate large files and multi-step implementations |
99|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — responsive interactions |
100|| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs in complex codebases |
101|| **Tool calling** | First-class support | Reliable multi-file edits in Agent mode |
102|
103|### Alternative Models
104|
105|| Model | When to use |
106||---|---|
107|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
108|| `avelin-coding-ultra` | System design, architecture reviews, security-sensitive refactors |
109|| `avelin-fast` | Quick lookups and simple completions — lowest cost, fastest response |
110|
111|---
112|
113|## Why AVELIN for GitHub Copilot?
114|
115|### 1. **Cost Optimization**
116|
117|Copilot Chat and Agent mode make many API calls per session. AVELIN optimizes costs:
118|
119|- **Prompt caching**: ~80% cost reduction on repeated system prompts
120|- **Competitive pricing**: Lower per-token costs than direct provider APIs
121|- **Pay-per-token**: Only pay for what you use, no per-seat overhead beyond your Copilot subscription
122|
123|### 2. **Model Diversity**
124|
Access multiple frontier coding models through one endpoint. AVELIN routes your requests to a diverse set of frontier models across multiple cloud providers, ensuring high availability and consistent quality. If one provider is slow or unavailable, your request automatically routes to the next best option.
131|
132|### 3. **Reliability**
133|
134|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
135|- **Retry logic**: Transient errors are handled automatically
136|- **99.9% uptime**: Enterprise-grade infrastructure
137|
138|### 4. **1M Context Windows**
139|
140|Copilot's Agent mode accumulates context across file reads, terminal outputs, and multi-step edits. AVELIN's 1M-token context windows enable longer, more capable agentic sessions.
141|
142|---
143|
144|## Example Workflows
145|
146|### Agent Mode: Feature Implementation
147|
148|Switch Copilot to **Agent** mode for autonomous multi-step tasks:
149|
150|```
151|Copilot Agent:
152|
153|You> Add input validation to all API endpoints using Zod schemas.
154|     Update the error handling to return proper validation errors.
155|
156|Agent: I'll add Zod validation to your API endpoints.
157|
158|[Reads src/routes/users.ts]
159|[Reads src/routes/posts.ts]
160|[Reads src/middleware/errorHandler.ts]
161|
162|I can see 5 endpoints that need validation. Let me implement schemas
163|and update each route...
164|
165|[Creates src/schemas/user.schema.ts]
166|[Creates src/schemas/post.schema.ts]
167|[Updates src/routes/users.ts with validation middleware]
168|[Updates src/routes/posts.ts with validation middleware]
169|[Updates src/middleware/errorHandler.ts for ZodError]
170|[Runs tests — all passing]
171|
172|Done! All 5 endpoints now validate input with Zod schemas.
173|```
174|
175|### Chat: Code Explanation and Refactoring
176|
177|```
178|You: /explain @src/services/cache.ts
179|
180|Copilot: This file implements a multi-layer caching service...
181|
182|[Provides detailed explanation]
183|
184|You: Refactor it to support cache invalidation by tags.
185|
186|Copilot: I'll add tag-based invalidation...
187|
188|[Shows refactored code with tag support]
189|```
190|
191|### Inline Suggestions
192|
193|For inline completions (Tab completions), Copilot uses its built-in model. AVELIN enhances the **Chat** and **Agent** modes where custom models are supported.
194|
195|---
196|
197|## Advanced Configuration
198|
199|### Environment-Based Configuration
200|
201|Use VS Code workspace settings (`.vscode/settings.json`) to configure AVELIN per project:
202|
203|```json
204|{
205|  "github.copilot.chat.models": [
206|    {
207|      "id": "avelin-coding-pro",
208|      "name": "AVELIN Coding Plus",
209|      "url": "https://api.avelin.ai/v1",
210|      "apiKey": "${env:AVELIN_API_KEY}",
211|      "maxOutputTokens": 65536
212|    }
213|  ]
214|}
215|```
216|
217|Set `AVELIN_API_KEY` in your environment or `.env` file to avoid committing secrets.
218|
219|### Custom Instructions for Copilot Chat
220|
221|Add project-specific instructions via VS Code settings:
222|
223|```json
224|{
225|  "github.copilot.chat.codeGeneration.instructions": [
226|    "Use TypeScript with strict mode",
227|    "Write JSDoc comments for all public functions",
228|    "Use async/await for all async operations",
229|    "Follow the repository pattern for database access"
230|  ]
231|}
232|```
233|
234|### Using with Copilot Workspace
235|
236|If you use GitHub Copilot Workspace for planning, you can reference AVELIN models in your workflow:
237|
238|1. Plan features using `avelin-coding-ultra` for architectural decisions
239|2. Implement using `avelin-coding-pro` in Agent mode for code generation
240|3. Review using `avelin-coding-fast` for quick code review passes
241|
242|---
243|
244|## Troubleshooting
245|
246|| Issue | Solution |
247||---|---|
248|| **Model not showing in dropdown** | Restart VS Code after updating `settings.json`. Ensure the model ID and URL are correct. |
249|| **"API key invalid"** | Verify your AVELIN API key starts with `sk-ave` and is active |
250|| **BYOK option not available** | Check that your Copilot plan supports BYOK. Contact GitHub support if needed. |
251|| **Agent mode not working** | Ensure Agent mode is enabled in Copilot Chat. Try switching models — `avelin-coding-pro` has best tool support. |
252|| **Slow responses** | Try `avelin-fast` for quicker responses on simple tasks |
253|| **Tool calls failing in Agent mode** | Use `avelin-coding-pro` — it has first-class function calling |
254|| **"Model not found" error** | Verify the model ID exactly: `avelin-coding-pro`, `avelin-coding-fast`, `avelin-fast` |
255|| **Settings not taking effect** | Some BYOK settings require VS Code restart. Check Output panel > GitHub Copilot for errors. |
256|
257|---
258|
259|## Related
260|
261|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
262|- [Cursor Guide](cursor.md) — AI-first code editor (VS Code fork)
263|- [Windsurf Guide](windsurf.md) — Codeium's AI-first IDE
264|- [Cline Guide](cline.md) — Autonomous coding agent in VS Code
265|- [Model Catalog](../../models/README.md) — Full model comparison
266|- [GitHub Copilot Docs](https://docs.github.com/en/copilot) — Official Copilot documentation
267|