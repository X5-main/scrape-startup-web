# Tabnine Integration

AVELIN API works with [Tabnine](https://www.tabnine.com) — the enterprise AI code completion platform trusted by over 1 million developers worldwide. Tabnine provides intelligent code suggestions, completions, and chat assistance directly in your IDE, with enterprise-grade security features including on-premise deployment and zero data retention.

> **Why AVELIN + Tabnine?** Tabnine's enterprise focus on security and compliance pairs perfectly with AVELIN's reliable API, 1M-token context windows, 90% prompt caching discounts, and automatic failover — delivering frontier coding models through a single OpenAI-compatible endpoint.

---

## What is Tabnine?

Tabnine is an enterprise AI code completion platform used by over 1 million developers at companies worldwide. Its killer feature is flexibility in deployment — Tabnine can run on-premise, in your private cloud, or as a managed service, giving you maximum control over your code and data. With SOC 2 Type 2 certification and a zero data retention policy, Tabnine is the enterprise choice for AI coding assistance.

Tabnine is ideal for organizations that need AI coding assistance but have strict security, compliance, or data sovereignty requirements. Whether you're in finance, healthcare, government, or any regulated industry, Tabnine lets you adopt AI coding tools without compromising on security.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Tabnine

**VS Code:**
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for **Tabnine**
4. Click **Install**

**JetBrains (IntelliJ, PyCharm, WebStorm, etc.):**
1. Open Settings/Preferences
2. Go to Plugins → Marketplace
3. Search for **Tabnine**
4. Click **Install** and restart your IDE

### Step 3: Configure Tabnine for AVELIN

Open the Tabnine Hub (click the Tabnine icon in your IDE status bar):

1. Navigate to **Settings** → **Custom Models**
2. Click **Add Custom Model**
3. Configure the OpenAI-compatible endpoint:

| Field | Value |
|---|---|
| **Provider** | OpenAI Compatible |
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-ave...xxxx` |
| **Model** | `avelin-coding-pro` |

4. Click **Save**
5. Select AVELIN as your active model provider

### Step 4: Start Coding

Tabnine will automatically provide intelligent code suggestions as you type:

- **Inline completions**: Get suggestions as you type code
- **Full-line completions**: Complete entire lines of code
- **Multi-line suggestions**: Generate multiple lines of code at once
- **Chat**: Ask questions and get code explanations

---

## Recommended Models

### Primary Recommendation: `avelin-coding-pro`

For Tabnine's core features:

| Feature | avelin-coding-pro | Why it matters for Tabnine |
|---|---|---|
| **Context window** | **1M tokens** | Tabnine analyzes surrounding code and project context for better suggestions |
| **Max output** | **65K tokens** | Generate comprehensive code blocks and documentation |
| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — real-time autocomplete experience |
| **Reasoning** | Deep step-by-step thinking | Understands code patterns and suggests contextually appropriate completions |
| **Code quality** | Optimized for software engineering | High-quality, idiomatic code suggestions across languages |

### Alternative Models

| Model | When to use |
|---|---|
| `avelin-coding-fast` | Standard coding tasks and completions — good balance of speed and quality |
| `avelin-fast` | Quick completions and simple tasks — lowest latency, lowest cost |
| `avelin-pro` | General-purpose coding with strong reasoning capabilities |

---

## Why AVELIN for Tabnine?

### 1. **Enterprise-Grade Reliability**

Tabnine serves enterprise customers who need reliable AI coding assistance. AVELIN delivers:

- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
- **Retry logic**: Transient errors handled automatically
- **99.9% uptime**: Enterprise-grade infrastructure for professional development workflows

### 2. **Cost Optimization**

Tabnine sends substantial context with each completion request. AVELIN minimizes costs:

- **Prompt caching**: ~80% cost reduction on repeated system prompts and code context
- **Competitive pricing**: Lower per-token costs than direct provider APIs
- **Pay-per-token**: No subscription lock-in — pay only for what you use

### 3. **Fast Autocomplete**

With ~100 tokens/sec throughput, AVELIN delivers suggestions fast enough to keep up with your typing speed. Real-time autocomplete without lag or delays.

### 4. **Security Compatibility**

Tabnine's zero data retention policy pairs well with AVELIN's secure API:

- **No training on your code**: AVELIN doesn't use your code for model training
- **Secure transmission**: All API calls use HTTPS encryption
- **Compliance-ready**: Suitable for regulated industries and enterprise environments

---

## Example Workflow

```
VS Code with Tabnine + AVELIN:

[You're writing a React component]

You type: const UserProfile = ({ userId }) => {
            const [user, setUser] = useState(null);
            
            useEffect(() => {
              // Tabnine suggests:

Tabnine suggestion (press Tab to accept):
              fetchUser(userId)
                .then(data => setUser(data))
                .catch(error => {
                  console.error('Failed to fetch user:', error);
                  setError(error.message);
                });
            }, [userId]);

[You accept the suggestion with Tab]

[Continue typing]
const handleSubmit = (e) => {
  e.preventDefault();
  // Tabnine suggests:

Tabnine suggestion:
  const formData = new FormData(e.target);
  const userData = Object.fromEntries(formData);
  
  updateUser(userId, userData)
    .then(updatedUser => {
      setUser(updatedUser);
      showToast('Profile updated successfully');
    })
    .catch(error => {
      showToast('Failed to update profile: ' + error.message);
    });
}

[You accept and continue coding with intelligent suggestions]
```

---

## Enterprise Deployment Options

Tabnine offers multiple deployment options that work with AVELIN:

### Cloud Deployment
- Use AVELIN's managed API (`https://api.avelin.ai/v1`)
- Zero data retention on AVELIN's side
- SOC 2 Type 2 certified infrastructure

### On-Premise Deployment
- Tabnine Enterprise can connect to AVELIN through your private network
- Code never leaves your infrastructure
- Full control over data flow

### Private Cloud
- Deploy Tabnine in your VPC/private cloud
- Configure AVELIN endpoint with your network security rules
- Maintain compliance with internal security policies

---

## Advanced Configuration

### Model Selection by Task

Configure different models for different use cases:

- **Autocomplete**: `avelin-fast` for lowest latency
- **Chat**: `avelin-coding-pro` for detailed explanations
- **Complex completions**: `avelin-coding-fast` for balanced performance

### Team Settings

For enterprise teams, configure Tabnine settings centrally:

1. Access Tabnine Hub admin panel
2. Set AVELIN as the default provider for your team
3. Configure which models are available to different user groups
4. Set usage policies and rate limits

### Context Window Management

For large codebases, configure how much context Tabnine sends:

- **Light context**: Current file only — fastest, lowest cost
- **Medium context**: Current file + related imports — balanced
- **Full context**: Project-wide analysis — most accurate, higher cost

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Custom model not connecting"** | Verify base URL is `https://api.avelin.ai/v1` and API key is correct |
| **"Model not found"** | Use a valid AVELIN model name (e.g., `avelin-coding-pro`) |
| **"API key invalid"** | Ensure your key starts with `sk-ave` and is active |
| **Slow suggestions** | Try `avelin-fast` for lower latency; check network connection |
| **No suggestions appearing** | Check that AVELIN is selected as the active provider in Tabnine Hub |
| **Context overflow errors** | Reduce context window setting or use `avelin-coding-fast` model |
| **On-premise connection issues** | Verify firewall rules allow outbound HTTPS to AVELIN endpoint |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Cursor Guide](cursor.md) — AI-first code editor
- [Augment Code Guide](augment-code.md) — Codebase-aware AI assistant
- [GitHub Copilot Guide](github-copilot.md) — AI pair programmer
- [Model Catalog](../../models/README.md) — Full model comparison
- [Tabnine Docs](https://www.tabnine.com/docs) — Official Tabnine documentation
