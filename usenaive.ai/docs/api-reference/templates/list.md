> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Templates

> GET /v1/templates — List all enabled business templates.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/templates \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "templates": [
      {
        "id": "faceless-media-channel",
        "name": "Faceless Media Channel",
        "description": "Automated faceless channel production — AI finds videos to clip for short-form content and generates original shorts for your niche.",
        "category": "Media & Content",
        "icon": "video",
        "credits_per_month_estimate": "~1800",
        "onboarding_questions": [
          {
            "id": "niche",
            "type": "text",
            "label": "What niche should the channel focus on?",
            "required": true
          }
        ],
        "agent_count": 2,
        "task_count": 3,
        "app_count": 1
      }
    ]
  }
  ```
</ResponseExample>

Returns all enabled business templates. Each template includes summary metadata, onboarding questions, and counts of agents, tasks, and apps it will create when applied.
