> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Install Template App

> POST /v1/template-apps — Install a template app instance for the current company.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/template-apps \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"template_app_type": "media-asset-manager", "name": "Media Asset Manager"}'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "app": {
      "id": "uuid",
      "companyId": "company-uuid",
      "templateAppType": "media-asset-manager",
      "name": "Media Asset Manager",
      "config": null,
      "status": "active",
      "createdAt": "2026-05-19T12:00:00.000Z"
    }
  }
  ```
</ResponseExample>

Installs a template app for the company. Each app type can only be installed once per company.

### Parameters

| Param               | Type   | Required | Description                                            |
| ------------------- | ------ | -------- | ------------------------------------------------------ |
| `template_app_type` | string | Yes      | The app type identifier (e.g. `"media-asset-manager"`) |
| `name`              | string | Yes      | Display name for the app instance                      |
| `config`            | object | No       | Optional configuration                                 |

### Available App Types

| Type                  | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `media-asset-manager` | 3-tab dashboard: uploaded media assets, post calendar, and post analytics |

### Errors

| Error              | Cause                                       |
| ------------------ | ------------------------------------------- |
| `invalid_input`    | Missing template\_app\_type or name         |
| `duplicate_record` | App type already installed for this company |
