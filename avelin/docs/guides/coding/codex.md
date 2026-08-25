1|# Codex Integration
2|
3|AVELIN API works seamlessly with [OpenAI Codex](https://openai.com/codex) — OpenAI's terminal AI coding assistant. Codex provides natural language interface for code generation, debugging, and refactoring directly in your terminal.
4|
5|> **Why AVELIN + Codex?** Access frontier coding models through Codex's terminal interface with 1M-token context windows and competitive pricing.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Install Codex
16|
17|**Prerequisites:** Install [Node.js](https://nodejs.org/en/download/) (v18.0 or later).
18|
19|```bash
20|npm install -g @openai/codex
21|codex --version
22|```
23|
24|**Note:** For best compatibility, you may need version 0.80.0:
25|
26|```bash
27|npm install -g @openai/codex@0.80.0
28|```
29|
30|### Step 3: Configure Codex
31|
32|Edit `~/.codex/config.toml`:
33|
34|```toml
35|model_provider = "AVELIN"
36|model = "avelin-coding-pro"
37|
38|[model_providers.AVELIN]
39|name = "AVELIN"
40|base_url = "https://api.avelin.ai/v1"
41|env_key = "OPENAI_API_KEY"
42|wire_api = "chat"
43|```
44|
45|### Step 4: Set Environment Variable
46|
47|Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.config/fish/config.fish`):
48|
49|```bash
50|export OPENAI_API_KEY="sk-a...
51|Apply changes:
52|
53|```bash
54|source ~/.zshrc  # or source ~/.bash_profile
55|```
56|
57|### Step 5: Start Codex
58|
59|Open a **new** terminal window and start Codex:
60|
61|```bash
62|codex
63|```
64|
65|If the chat interface launches successfully, your configuration is correct.
66|
67|---
68|
69|## Recommended Models
70|
71|### Primary Recommendation: `avelin-coding-pro`
72|
73|For everyday coding tasks:
74|
75|| Feature | avelin-coding-pro | Why it matters for Codex |
76||---|---|---|
77|| **Context window** | **1M tokens** | Large codebases and multi-file refactors without context loss |
78|| **Max output** | **65K tokens** | Generate large code files and comprehensive tests |
79|| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — faster feedback loops |
80|| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs, understands architectural impact |
81|
82|### Alternative Models
83|
84|| Model | When to use |
85||---|---|
86|| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
87|| `avelin-coding-ultra` | System design, architecture reviews, security-sensitive refactors |
88|| `avelin-fast` | Quick lookups and simple extractions — lowest cost, fastest response |
89|
90|---
91|
92|## Why AVELIN for Codex?
93|
94|### 1. **Cost Optimization**
95|
96|Codex sessions can involve many API calls. AVELIN optimizes costs:
97|
98|- **Prompt caching**: ~80% cost reduction on repeated system prompts
99|- **Competitive pricing**: Lower per-token costs than direct provider APIs
100|- **Pay-per-token**: No subscription lock-in
101|
102|### 2. **Model Diversity**
103|
Access multiple frontier coding models through one API. AVELIN routes your requests to a diverse set of frontier models across multiple cloud providers, ensuring high availability and consistent quality. If one provider is slow or unavailable, your request automatically routes to the next best option.
110|
111|### 3. **Reliability**
112|
113|- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
114|- **Retry logic**: Transient errors are handled automatically
115|- **99.9% uptime**: Enterprise-grade infrastructure
116|
117|### 4. **1M Context Windows**
118|
119|Codex works best with large context. AVELIN's coding models support 1M tokens — load entire repositories without chunking.
120|
121|---
122|
123|## Example Session
124|
125|```bash
126|$ codex
127|
128|╭─ Codex ──────────────────────────────────────╮
129|│ Model: avelin-coding-pro                   │
130|│ Provider: AVELIN (api.avelin.ai)           │
131|╰─────────────────────────────────────────────╯
132|
133|You> Write a Python function to parse CSV files and convert them to JSON.
134|
135|Codex> Here's a Python function that parses CSV files and converts them to JSON:
136|
137|```python
138|import csv
139|import json
140|from typing import List, Dict, Any
141|
142|def csv_to_json(csv_file_path: str, json_file_path: str = None) -> List[Dict[str, Any]]:
143|    """
144|    Parse a CSV file and convert it to JSON format.
145|    
146|    Args:
147|        csv_file_path: Path to the input CSV file
148|        json_file_path: Optional path to save JSON output
149|        
150|    Returns:
151|        List of dictionaries representing the CSV data
152|    """
153|    data = []
154|    
155|    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
156|        csv_reader = csv.DictReader(csv_file)
157|        
158|        for row in csv_reader:
159|            # Convert numeric strings to numbers
160|            converted_row = {}
161|            for key, value in row.items():
162|                try:
163|                    # Try converting to int first
164|                    converted_row[key] = int(value)
165|                except ValueError:
166|                    try:
167|                        # Try converting to float
168|                        converted_row[key] = float(value)
169|                    except ValueError:
170|                        # Keep as string
171|                        converted_row[key] = value
172|            data.append(converted_row)
173|    
174|    # Optionally save to JSON file
175|    if json_file_path:
176|        with open(json_file_path, mode='w', encoding='utf-8') as json_file:
177|            json.dump(data, json_file, indent=2, ensure_ascii=False)
178|    
179|    return data
180|
181|# Example usage:
182|# data = csv_to_json('input.csv', 'output.json')
183|# print(data)
184|```
185|
186|This function:
187|- Reads CSV files using `csv.DictReader`
188|- Automatically converts numeric strings to int/float
189|- Optionally saves to a JSON file
190|- Returns the data as a list of dictionaries
191|
192|You> Good, now add error handling for missing files.
193|
194|Codex> Here's the updated function with comprehensive error handling:
195|
196|[Provides updated code with try/except blocks, file existence checks, etc.]
197|```
198|
199|---
200|
201|## Advanced Configuration
202|
203|### Multiple Models
204|
205|You can configure multiple AVELIN models in `~/.codex/config.toml`:
206|
207|```toml
208|model_provider = "AVELIN"
209|model = "avelin-coding-pro"
210|
211|[model_providers.AVELIN]
212|name = "AVELIN"
213|base_url = "https://api.avelin.ai/v1"
214|env_key = "OPENAI_API_KEY"
215|wire_api = "chat"
216|
217|[model_providers.AVELIN_Fast]
218|name = "AVELIN Fast"
219|base_url = "https://api.avelin.ai/v1"
220|env_key = "OPENAI_API_KEY"
221|wire_api = "chat"
222|```
223|
224|Switch models by changing the `model_provider` and `model` fields.
225|
226|### Wire API Options
227|
228|Codex supports two API formats:
229|
230|- **`wire_api = "chat"`**: Standard OpenAI Chat Completions API (recommended for most models)
231|- **`wire_api = "responses"`**: Newer Responses API (for supported models like `avelin-coding-pro`)
232|
233|Use `"chat"` for maximum compatibility.
234|
235|---
236|
237|## Troubleshooting
238|
239|| Issue | Solution |
240||---|---|
241|| **`wire_api = chat is no longer supported`** | Latest Codex uses Responses API. Either change to `wire_api = "responses"` or downgrade: `npm install -g @openai/codex@0.80.0` |
242|| **`unexpected status 401 Unauthorized`** | API key mismatch or typo. Verify your AVELIN API key is correct |
243|| **`Model not found`** | Ensure the model name is valid (e.g., `avelin-coding-pro`, not `avelin-coding-fast+`) |
244|| **Slow first response** | Normal — model thinks before responding. Streaming starts after reasoning completes |
245|| **Context too long errors** | Set `context_length: 1000000` in your configuration |
246|
247|---
248|
249|## Related
250|
251|- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
252|- [Hermes Agent Guide](../hermes.md) — Another terminal-based coding tool
253|- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
254|- [Model Catalog](../../models/README.md) — Full model comparison
255|- [OpenAI Codex Docs](https://openai.com/codex) — Official Codex documentation
256|