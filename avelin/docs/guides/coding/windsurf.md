1|# Windsurf Integration
2|
3|AVELIN API is fully compatible with [Windsurf](https://windsurf.com) — an AI-first IDE by Codeium, built as a fork of VS Code. Windsurf provides intelligent code completion, Cascade (an agentic coding flow), chat assistance, and multi-file editing powered by AVELIN's frontier models.
4|
5|> **Why AVELIN + Windsurf?** Combine Windsurf's agentic Cascade flows with AVELIN's 1M-token context windows, automatic failover, and competitive per-token pricing — all within a familiar VS Code interface.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install Windsurf
16|
17|Download and install Windsurf from the [official website](https://windsurf.com/downloads).
18|
19|### Step 3: Configure Windsurf
20|
21|1. Open Windsurf
22|2. Open **Settings** (gear icon or `Cmd+,` / `Ctrl+,`)
23|3. Navigate to **Models**
24|4. Click **Add Custom Model** (or the `+` icon)
25|5. Enter your endpoint configuration:
26|
27|#### Recommended: OpenAI-Compatible Endpoint
28|
29|| Field | Value |
30||---|---|
31|| **Provider** | OpenAI Compatible |
32|| **Base URL** | `https://api.avelin.ai/v1` |
33|| **API Key** | `sk-ave...xxxx` |
34|| **Model ID** | `avelin-coding-pro` |
35|
36|#### Alternative: Anthropic Endpoint
37|
38|Windsurf also supports the Anthropic API format:
39|
40|| Field | Value |
41||---|---|
42|| **Provider** | Anthropic |
43|| **Base URL** | `https://api.avelin.ai` |
44|| **API Key** | `sk-ave...xxxx` |
45|| **Model ID** | `avelin-coding-pro` |
46|
47|We recommend the **OpenAI-Compatible** endpoint for Windsurf as it provides the broadest feature support in this IDE.
48|
49|### Step 4: Select Your Model
50|
51|In the Windsurf chat or Cascade panel, click the model dropdown and select your custom AVELIN model. You can switch between models at any time during a session.
52|
53|---
54|
55|## Recommended Models
56|
57|### Primary Recommendation: `avelin-coding-pro`
58|
59|For everyday coding tasks and Cascade flows:
60|
61|| Feature | avelin-coding-pro | Why it matters for Windsurf |
62||---|---|---|
63|| **Context window** | **1M tokens** | Large codebases and multi-file Cascade flows without context loss |
64|| **Max output** | **65K tokens** | Generate large code files and comprehensive implementations |
65|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — responsive Cascade interactions |
66|| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs, understands architectural impact |
67|| **Tool calling** | First-class support | Reliable file editing and terminal operations in Cascade |
68|
69|### Alternative Models
70|
71|| Model | When to use |
72||---|---|
73|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
74|| `avelin-coding-ultra` | System design, architecture reviews, security-sensitive refactors |
75|| `avelin-fast` | Inline completions and simple lookups — lowest cost, fastest response |
76|
77|---
78|
79|## Why AVELIN for Windsurf?
80|
81|### 1. **Cost Optimization**
82|
83|Windsurf sessions — especially Cascade flows — involve many API calls for code generation, file edits, and terminal operations. AVELIN optimizes costs:
84|
85|- **Prompt caching**: ~80% cost reduction on repeated system prompts
86|- **Competitive pricing**: Lower per-token costs than direct provider APIs
87|- **Pay-per-token**: No subscription lock-in or seat limits
88|
89|### 2. **Model Diversity**
90|
Access multiple frontier coding models through one API. AVELIN routes your requests to a diverse set of frontier models across multiple cloud providers, ensuring high availability and consistent quality. If one provider is slow or unavailable, your request automatically routes to the next best option.
97|
98|### 3. **Reliability**
99|
100|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
101|- **Retry logic**: Transient errors are handled automatically
102|- **99.9% uptime**: Enterprise-grade infrastructure
103|
104|### 4. **1M Context Windows**
105|
106|Windsurf's Cascade flow accumulates context across multiple files and terminal outputs. AVELIN's coding models support 1M tokens — enabling longer agentic sessions without truncation.
107|
108|---
109|
110|## Example Workflows
111|
112|### Cascade: Multi-File Feature Implementation
113|
114|Use Windsurf's Cascade flow to implement a complete feature across multiple files:
115|
116|```
117|Cascade Panel:
118|
119|You> Add a REST API for user management with CRUD operations,
120|     input validation, and error handling.
121|
122|Cascade: I'll implement the user management API. Let me examine
123|         your project structure first.
124|
125|[Analyzes project structure]
126|[Creates models/user.ts]
127|[Creates validators/user-validator.ts]
128|[Creates controllers/user-controller.ts]
129|[Creates routes/user-routes.ts]
130|[Updates app.ts to register routes]
131|[Runs tests — all passing]
132|
133|Done! I've created a complete user management API with:
134|- User model with validation
135|- CRUD endpoints (GET, POST, PUT, DELETE)
136|- Input validation using Zod
137|- Centralized error handling
138|- 8 passing tests
139|```
140|
141|### Inline Code Completion
142|
143|Windsurf's autocomplete uses AVELIN for intelligent suggestions:
144|
145|```typescript
146|// You start typing:
147|async function fetchUserData(userId: string) {
148|
149|// Windsurf suggests:
150|async function fetchUserData(userId: string): Promise<User> {
151|  const user = await prisma.user.findUnique({
152|    where: { id: userId },
153|    include: { profile: true, posts: true },
154|  });
155|  if (!user) {
156|    throw new NotFoundError(`User ${userId} not found`);
157|  }
158|  return user;
159|}
160|```
161|
162|### Chat-Based Code Review
163|
164|```
165|You: Review @auth-service.ts for security vulnerabilities
166|
167|Windsurf: Let me analyze the auth service...
168|
169|[Examines the code]
170|
171|I found several issues:
172|1. JWT secret is hardcoded — should use environment variable
173|2. Token expiration is set to 365 days — too long for access tokens
174|3. No rate limiting on login endpoint
175|4. Password reset tokens aren't being invalidated after use
176|
177|Here are the fixes:
178|[Provides corrected implementation]
179|```
180|
181|---
182|
183|## Advanced Configuration
184|
185|### Custom Instructions
186|
187|Add project-specific instructions in Windsurf Settings > AI > Custom Instructions:
188|
189|```
190|You are working on a Node.js API using Express and TypeScript.
191|Follow these conventions:
192|- Use async/await for all async operations
193|- Include JSDoc comments for all public functions
194|- Write tests using Vitest
195|- Use repository pattern for database access
196|- Always validate inputs with Zod schemas
197|```
198|
199|### Model Switching Between Flows
200|
201|You can use different AVELIN models for different purposes:
202|
203|- **Cascade (agentic flows)**: `avelin-coding-pro` — deep reasoning, reliable tool calls
204|- **Inline completions**: `avelin-fast` — low latency for autocomplete
205|- **Chat**: `avelin-coding-ultra` — architectural discussions and reviews
206|
207|Switch models via the dropdown in each panel independently.
208|
209|### Using with `.windsurfrules`
210|
211|Create a `.windsurfrules` file in your project root to provide persistent context:
212|
213|```markdown
214|# Project Rules
215|
216|- This is a monorepo using Turborepo
217|- API services are in packages/api
218|- Frontend is in packages/web
219|- All packages use TypeScript strict mode
220|- Tests use Vitest with @testing-library
221|```
222|
223|Windsurf will include these rules in every request to AVELIN, and prompt caching ensures you're not paying extra for repeated context.
224|
225|---
226|
227|## Troubleshooting
228|
229|| Issue | Solution |
230||---|---|
231|| **"Model not found"** | Ensure the Model ID matches exactly (e.g., `avelin-coding-pro`) |
232|| **"API key invalid"** | Verify your AVELIN API key starts with `sk-ave` and has not been revoked |
233|| **Slow completions** | Switch to `avelin-fast` for inline completions; use `avelin-coding-pro` for chat/Cascade |
234|| **Cascade tool calls failing** | Use `avelin-coding-pro` — it has first-class function calling support |
235|| **Context too long errors** | Start a new Cascade flow to reset context, or exclude files from the workspace index |
236|| **Connection timeout** | Check that your base URL is correct: `https://api.avelin.ai/v1` (OpenAI) or `https://api.avelin.ai` (Anthropic) |
237|| **Streaming not working** | Use the OpenAI-Compatible endpoint for best streaming support in Windsurf |
238|
239|---
240|
241|## Related
242|
243|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
244|- [Cursor Guide](cursor.md) — AI-first code editor (VS Code fork)
245|- [Cline Guide](cline.md) — Autonomous coding agent in VS Code
246|- [GitHub Copilot Guide](github-copilot.md) — BYOK integration
247|- [Model Catalog](../../models/README.md) — Full model comparison
248|- [Windsurf Docs](https://docs.windsurf.com) — Official Windsurf documentation
249|