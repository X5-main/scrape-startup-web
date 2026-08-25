> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Business Templates

> Pre-built company templates with agents, tasks, and apps — apply a template to bootstrap a fully staffed company in seconds.

Business templates are **pre-configured blueprints** for specific business use cases — each includes a team of agents, initial tasks, onboarding questions, and custom template apps. They are distinct from the agent **blueprints** declared in `naive.config.ts` (`agent({ is, has, can, limits })`), which define the per-tenant regulated bundle — see [Infrastructure as code](/docs/getting-started/iac) and [Agent Profiles](/docs/getting-started/agent-profiles).

## API first

There is no `naive templates` CLI group — business templates are reachable over REST and the SDK only.

```bash theme={"theme":"css-variables"}
# List available templates
curl https://api.usenaive.ai/v1/templates \
  -H "Authorization: Bearer nv_sk_your_key"

# View template details
curl https://api.usenaive.ai/v1/templates/faceless-media-channel \
  -H "Authorization: Bearer nv_sk_your_key"

# Apply a template to the current company
curl -X POST https://api.usenaive.ai/v1/templates/faceless-media-channel/apply \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"questionnaire_answers": {"niche": "AI tutorials"}}'
```

## Available Templates

| Template                   | Category        | Agents                        | Description                                                                                    |
| -------------------------- | --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| **Faceless Media Channel** | Media & Content | Video Clipper, Shorts Creator | Automated faceless channel — finds videos to clip and generates original shorts for your niche |

## How It Works

```
Apply template "Faceless Media Channel"
    │
    ├─ Answer onboarding questions
    │   → "What niche should the channel focus on?"
    │
    ├─ Hire agents automatically
    │   → Video Clipper (clips YouTube videos for short-form)
    │   → Shorts Creator (generates AI videos for the niche)
    │
    ├─ Create initial tasks
    │   → "Find trending videos in AI tutorials to clip"
    │   → "Create first AI-generated short for AI tutorials"
    │   → "Connect social media accounts for publishing"
    │
    └─ Install template apps
        → Media Asset Manager (assets, calendar, analytics)
```

## Applying a Template

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/templates/faceless-media-channel/apply \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"questionnaire_answers": {"niche": "AI tutorials"}}'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/templates/faceless-media-channel/apply", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionnaire_answers: { niche: "AI tutorials" },
    }),
  });
  const result = await response.json();
  ```
</CodeGroup>

**Response (201):**

```json theme={"theme":"css-variables"}
{
  "applied": true,
  "template_id": "faceless-media-channel",
  "agents": [
    { "id": "agent-uuid-1", "name": "Video Clipper", "title": "Video Clipping Specialist" },
    { "id": "agent-uuid-2", "name": "Shorts Creator", "title": "Short-Form Content Creator" }
  ],
  "tasks": [
    { "title": "Find trending videos in AI tutorials to clip", "assignee": "video-clipper" },
    { "title": "Create first AI-generated short for AI tutorials", "assignee": "shorts-creator" }
  ],
  "apps": [
    { "id": "app-uuid", "name": "Media Asset Manager", "type": "media-asset-manager" }
  ]
}
```

## Template Apps

Template apps are custom UI experiences installed per company, different from managed web apps. They provide specialized dashboards and management interfaces.

### Media Asset Manager

The Media Asset Manager provides three tabs:

* **Assets** — Grid of uploaded media with thumbnails, upload new media via URL
* **Calendar** — Month/week view of scheduled and published posts
* **Post Analytics** — Dashboard with aggregate metrics and per-post engagement

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # List installed template apps
  curl https://api.usenaive.ai/v1/template-apps \
    -H "Authorization: Bearer nv_sk_your_key"

  # Install a template app manually
  curl -X POST https://api.usenaive.ai/v1/template-apps \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"template_app_type": "media-asset-manager", "name": "Media Asset Manager"}'
  ```
</CodeGroup>

## Dashboard Integration

In the [naive dashboard](https://dashboard.usenaive.ai):

* **Templates** — browse and apply available templates
* **Primitives** — social account connection and management UI

<Info>
  Templates are idempotent per company — applying the same template twice returns an error. Use `GET /v1/template-apps` to check installed apps.
</Info>
