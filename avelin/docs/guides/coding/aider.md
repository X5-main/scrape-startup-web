1|# Aider Integration
2|
3|AVELIN API is fully compatible with [Aider](https://aider.chat) — an AI pair programming tool that runs in your terminal. Aider lets you edit code in your local git repository through natural language, with automatic commits, multi-file editing, and repo-map awareness powered by AVELIN's frontier models.
4|
5|> **Why AVELIN + Aider?** Aider's repo-map and multi-file editing shine with 1M-token context windows. AVELIN delivers the best coding models with 90% prompt caching discounts, automatic failover, and ~100 tps throughput — all through a single OpenAI-compatible endpoint.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install Aider
16|
17|```bash
18|# Option A: pip
19|pip install aider-chat
20|
21|# Option B: dedicated installer (recommended for isolated environments)
22|aider-install
23|
24|# Option C: Homebrew (macOS)
25|brew install aider
26|```
27|
28|### Step 3: Configure Aider
29|
30|Aider supports OpenAI-compatible endpoints out of the box. You can configure it via environment variables, a config file, or CLI flags.
31|
32|#### Option A: Environment Variables
33|
34|```bash
35|export OPENAI_API_BASE=https://api.avelin.ai/v1
36|export OPENAI_API_KEY=sk-ave...xxxx
37|```
38|
39|Add these to your `~/.bashrc` or `~/.zshrc` for persistence.
40|
41|#### Option B: Config File
42|
43|Create or edit `~/.aider.conf.yml`:
44|
45|```yaml
46|openai-api-base: https://api.avelin.ai/v1
47|openai-api-key: sk-ave...xxxx
48|model: openai/avelin-coding-pro
49|```
50|
51|#### Option C: CLI Flags
52|
53|```bash
54|aider --model openai/avelin-coding-pro \
55|      --openai-api-base https://api.avelin.ai/v1 \
56|      --openai-api-key sk-ave...xxxx
57|```
58|
59|### Step 4: Select Your Model
60|
61|Start Aider with your chosen model:
62|
63|```bash
64|# Using the config file (model already set)
65|aider
66|
67|# Or specify on the command line
68|aider --model openai/avelin-coding-pro
69|
70|# Add files to work with
71|aider src/main.py src/utils.py
72|```
73|
74|---
75|
76|## Recommended Models
77|
78|### Primary Recommendation: `avelin-coding-pro`
79|
80|For pair programming in the terminal:
81|
82|| Feature | avelin-coding-pro | Why it matters for Aider |
83||---|---|---|
84|| **Context window** | **1M tokens** | Aider's repo-map plus full file contents fit without truncation |
85|| **Max output** | **65K tokens** | Large multi-file diffs and comprehensive refactors |
86|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — tighter edit loops |
87|| **Reasoning** | Deep step-by-step thinking | Understands cross-file dependencies and side effects |
88|| **Tool calling** | First-class support | Reliable structured edit format for Aider's diff/whole modes |
89|
90|### Alternative Models
91|
92|| Model | When to use |
93||---|---|
94|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple edits |
95|| `avelin-coding-ultra` | System design, architecture reviews, large-scale refactors (use as architect model) |
96|| `avelin-fast` | Quick lookups, simple fixes — lowest cost, fastest response |
97|
98|---
99|
100|## Why AVELIN for Aider?
101|
102|### 1. **Cost Optimization**
103|
104|Aider sends your repo-map and file contents with every request. AVELIN minimizes the cost:
105|
106|- **Prompt caching**: ~80% cost reduction on repeated system prompts and repo-maps
107|- **Competitive pricing**: Lower per-token costs than direct provider APIs
108|- **Pay-per-token**: No subscription lock-in — pay only for what you use
109|
110|### 2. **Model Diversity**
111|
112|Access multiple frontier coding models through one API. Use Aider's architect/edit model split:
113|
114|```bash
115|aider --architect \
116|      --model openai/avelin-coding-ultra \
117|      --editor-model openai/avelin-coding-pro
118|```
119|
120|This lets the architect model plan changes while the editor model writes the code.
121|
122|### 3. **Reliability**
123|
124|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
125|- **Retry logic**: Transient errors are handled automatically
126|- **99.9% uptime**: Enterprise-grade infrastructure — no interrupted editing sessions
127|
128|### 4. **1M Context Windows**
129|
130|Aider's repo-map gives the model a structural overview of your entire codebase. With 1M-token context windows, even large monorepos fit comfortably — no need to aggressively exclude files from the map.
131|
132|---
133|
134|## Example Workflows
135|
136|### Multi-File Editing
137|
138|```bash
139|# Start aider with the files you want to work on
140|$ aider src/auth.py src/models.py src/routes.py
141|
142|> Add JWT authentication with refresh tokens. Update the User model
143|  to store refresh token hashes, and add login/refresh/logout endpoints.
144|
145|Aider: I'll make these changes across all three files:
146|
147|1. src/models.py — Add refresh_token_hash field to User model
148|2. src/auth.py — Add JWT generation, refresh token creation, and verification
149|3. src/routes.py — Add /auth/login, /auth/refresh, /auth/logout endpoints
150|
151|[Applies edits to all three files]
152|[Commits: "Add JWT authentication with refresh tokens"]
153|```
154|
155|### Refactoring Workflow
156|
157|```bash
158|$ aider --map-tokens 4096
159|
160|> /add src/**/*.py
161|
162|> Refactor all database access to use the repository pattern.
163|  Create a BaseRepository class and migrate existing queries.
164|
165|Aider: I'll analyze the codebase and implement the repository pattern...
166|
167|[Creates src/repositories/base.py]
168|[Creates src/repositories/user_repo.py]
169|[Updates src/services/user_service.py]
170|[Commits: "Refactor database access to repository pattern"]
171|```
172|
173|### Bug Fixing
174|
175|```bash
176|$ aider src/api/endpoints.py tests/test_endpoints.py
177|
178|> The /users endpoint returns a 500 error when the page parameter
179|  is negative. Fix the bug and add a test for edge cases.
180|
181|Aider: Let me look at the endpoint code...
182|
183|I see the issue — there's no validation on the `page` parameter before
184|it's used in the SQL OFFSET clause. I'll add validation and a test.
185|
186|[Fixes src/api/endpoints.py — adds parameter validation]
187|[Updates tests/test_endpoints.py — adds edge case tests]
188|[Commits: "Fix 500 error on negative page parameter"]
189|```
190|
191|---
192|
193|## Advanced Configuration
194|
195|### Full `.aider.conf.yml`
196|
197|```yaml
198|# API Configuration
199|openai-api-base: https://api.avelin.ai/v1
200|openai-api-key: sk-ave...xxxx
201|
202|# Model Selection
203|model: openai/avelin-coding-pro
204|
205|# Editor Model (for architect mode)
206|editor-model: openai/avelin-coding-pro
207|
208|# Weak/Fast model (for simple tasks like commit messages)
209|weak-model: openai/avelin-fast
210|
211|# Context and Map Settings
212|map-tokens: 4096
213|map-multiplier-no-files: 2
214|
215|# Edit Format
216|edit-format: diff
217|
218|# Git Settings
219|auto-commits: true
220|dirty-commits: true
221|attribute-author: true
222|attribute-committer: true
223|
224|# Output
225|dark-mode: true
226|pretty: true
227|```
228|
229|### Architect Mode
230|
231|Use a stronger model for planning and a faster model for editing:
232|
233|```bash
234|aider --architect \
235|      --model openai/avelin-coding-ultra \
236|      --editor-model openai/avelin-coding-pro \
237|      --weak-model openai/avelin-fast
238|```
239|
240|### Map Type Settings for Large Repos
241|
242|Aider's repo-map is essential for understanding large codebases. Tune it for your project:
243|
244|```yaml
245|# Increase map tokens for large repos
246|map-tokens: 8192
247|
248|# Use tree-sitter for better code parsing
249|map-tokens-mult: 2
250|
251|# Exclude generated/vendor files
252|read: .aiderignore
253|```
254|
255|Create a `.aiderignore` file (gitignore syntax) to exclude noise:
256|
257|```
258|node_modules/
259|dist/
260|*.min.js
261|vendor/
262|__pycache__/
263|*.pyc
264|```
265|
266|### Model-Specific Flags
267|
268|```bash
269|# Higher max output for large refactors
270|aider --model openai/avelin-coding-pro --max-chat-history-tokens 65536
271|
272|# Streaming for real-time output
273|aider --stream
274|
275|# No streaming (if terminal has issues)
276|aider --no-stream
277|```
278|
279|---
280|
281|## Troubleshooting
282|
283|| Issue | Solution |
284||---|---|
285|| **"Model not found"** | Ensure the model name is prefixed with `openai/` (e.g., `openai/avelin-coding-pro`) |
286|| **"API key invalid"** | Verify your AVELIN API key starts with `sk-ave` and `OPENAI_API_BASE` is set to `https://api.avelin.ai/v1` |
287|| **Slow responses** | Try `avelin-fast` for simpler tasks, or check your network connection |
288|| **Edit format errors** | Switch edit format: `--edit-format whole` or `--edit-format diff` |
289|| **Repo-map too large** | Reduce `--map-tokens` or add exclusions to `.aiderignore` |
290|| **Context overflow** | Start a new chat (`/clear`) or use `/drop` to remove files you no longer need |
291|| **Streaming garbled output** | Use `--no-stream` flag or try a different terminal emulator |
292|| **Architect mode not working** | Ensure both `--model` and `--editor-model` are set with `openai/` prefix |
293|
294|---
295|
296|## Related
297|
298|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
299|- [Claude Code Guide](claude-code.md) — Anthropic's CLI coding tool
300|- [Hermes Agent Guide](../hermes.md) — Terminal-based agentic coding tool
301|- [Cursor Guide](cursor.md) — AI-first code editor
302|- [Cline Guide](cline.md) — Autonomous VS Code agent
303|- [Model Catalog](../../models/README.md) — Full model comparison
304|- [Aider Docs](https://aider.chat/docs) — Official Aider documentation
305|