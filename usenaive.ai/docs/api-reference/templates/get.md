> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Template

> GET /v1/templates/:id — Get full details of a business template including agent blueprints, tasks, and apps.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/templates/faceless-media-channel \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "template": {
      "id": "faceless-media-channel",
      "name": "Faceless Media Channel",
      "description": "Automated faceless channel production...",
      "category": "Media & Content",
      "icon": "video",
      "credits_per_month_estimate": "~1800",
      "onboarding_questions": [
        { "id": "niche", "type": "text", "label": "What niche should the channel focus on?", "required": true }
      ],
      "agents": [
        { "name": "Video Clipper", "title": "Video Clipping Specialist", "role": "employee", "persona": "You are a video clipping specialist...", "skill_slugs": ["naive-social"] },
        { "name": "Shorts Creator", "title": "Short-Form Content Creator", "role": "employee", "persona": "You are a short-form content creator...", "skill_slugs": ["naive-social"] }
      ],
      "tasks": [
        { "title": "Find trending videos in {niche} to clip...", "description": "...", "assignee_ref": "Video Clipper", "priority": 2 },
        { "title": "Create first AI-generated short for {niche}", "description": "...", "assignee_ref": "Shorts Creator", "priority": 2 }
      ],
      "apps": [
        { "app_type": "media-asset-manager", "name": "Media Asset Manager" }
      ],
      "enabled": true
    }
  }
  ```
</ResponseExample>

Returns the full template definition with agent blueprints, task blueprints, app definitions, and onboarding questions. Task descriptions may contain `{variable}` placeholders that are interpolated with questionnaire answers when the template is applied.
