> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Templates

> GET /v1/apps/templates — List starter templates with GitHub clone commands for direct-mode development.

Starter templates live in the public GitHub repo [`usenaive/app-dev-templates`](https://github.com/usenaive/app-dev-templates), organized as `{type}/{variant}`. Direct-mode users clone a template, build locally, and deploy with [`POST /v1/apps/:id/deploy`](/docs/api-reference/apps/deploy). In orchestrated mode, the same templates are scaffolded into engineer agent workspaces automatically.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/apps/templates \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "repoUrl": "https://github.com/usenaive/app-dev-templates",
    "templates": [
      {
        "type": "frontend_only",
        "description": "Next.js landing/marketing site (no backend)",
        "defaultVariant": "dark-premium",
        "variants": [
          {
            "variant": "dark-premium",
            "path": "frontend_only/dark-premium",
            "cloneCommand": "git clone https://github.com/usenaive/app-dev-templates naive-app && cd naive-app/frontend_only/dark-premium"
          },
          { "variant": "clean-minimal", "path": "frontend_only/clean-minimal", "cloneCommand": "..." },
          { "variant": "bold-energetic", "path": "frontend_only/bold-energetic", "cloneCommand": "..." },
          { "variant": "warm-human", "path": "frontend_only/warm-human", "cloneCommand": "..." }
        ]
      },
      {
        "type": "fullstack",
        "description": "Next.js + managed backend (database, auth, storage)",
        "defaultVariant": "saas-dashboard",
        "variants": [
          {
            "variant": "saas-dashboard",
            "path": "fullstack/saas-dashboard",
            "cloneCommand": "git clone https://github.com/usenaive/app-dev-templates naive-app && cd naive-app/fullstack/saas-dashboard"
          }
        ]
      }
    ]
  }
  ```
</ResponseExample>

## Template Block on Apps

Every app's [create](/docs/api-reference/apps/create) and [get](/docs/api-reference/apps/get) responses include a `template` object resolved for that app:

```json theme={"theme":"css-variables"}
{
  "template": {
    "repoUrl": "https://github.com/usenaive/app-dev-templates",
    "path": "fullstack/saas-dashboard",
    "variant": "saas-dashboard",
    "cloneCommand": "git clone https://github.com/usenaive/app-dev-templates naive-app && cd naive-app/fullstack/saas-dashboard"
  }
}
```

## Variant Styles

| Variant          | Style                                           | Best For                         |
| ---------------- | ----------------------------------------------- | -------------------------------- |
| `dark-premium`   | Dark, cyan accents, premium aesthetic           | Dev tools, AI, premium SaaS      |
| `clean-minimal`  | Light, blue accents, minimal productivity feel  | B2B SaaS, productivity           |
| `bold-energetic` | White + orange/purple gradients, high energy    | Consumer, creative, marketplaces |
| `warm-human`     | Warm cream, serif headings, editorial feel      | Communities, wellness, creators  |
| `saas-dashboard` | Fullstack dashboard with managed-backend wiring | SaaS products with a database    |
