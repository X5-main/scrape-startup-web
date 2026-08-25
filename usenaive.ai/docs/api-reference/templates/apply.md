> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Apply Template

> POST /v1/templates/:id/apply — Apply a business template to the current company, hiring agents, creating tasks, and installing apps.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/templates/faceless-media-channel/apply \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"questionnaire_answers": {"niche": "AI tutorials"}}'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "applied": true,
    "template_id": "faceless-media-channel",
    "agents": [
      { "id": "uuid-1", "name": "Video Clipper", "title": "Video Clipping Specialist" },
      { "id": "uuid-2", "name": "Shorts Creator", "title": "Short-Form Content Creator" }
    ],
    "tasks": [
      { "title": "Find trending videos in AI tutorials to clip for short-form content", "assignee": "video-clipper" },
      { "title": "Create first AI-generated short for AI tutorials", "assignee": "shorts-creator" },
      { "title": "Connect social media accounts for publishing" }
    ],
    "apps": [
      { "id": "app-uuid", "name": "Media Asset Manager", "type": "media-asset-manager" }
    ]
  }
  ```
</ResponseExample>

Applies a business template to the current company. This:

1. Records the template application with questionnaire answers
2. Hires all template agents (inserts into agents table + provisions containers)
3. Creates initial tasks with `{variable}` placeholders interpolated from answers
4. Installs template apps

### Parameters

| Param                   | Type   | Required | Description                                                                                                                  |
| ----------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `questionnaire_answers` | object | Depends  | Key-value pairs matching the template's `onboarding_questions[].id` fields. Required if the template has required questions. |

### Errors

| Error                | Cause                                    |
| -------------------- | ---------------------------------------- |
| `resource_not_found` | Template ID doesn't exist                |
| `duplicate_record`   | Template already applied to this company |
