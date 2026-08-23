> ## Documentation Index
> Fetch the complete documentation index at: https://onecli.sh/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# App credentials

> Pre-configure OAuth app integrations on a self-hosted instance with environment variables, per app.

Self-hosted instances connect OAuth apps with your own credentials: you create an OAuth app with each provider, and OneCLI uses its client ID and secret. There are two ways to supply them:

* **Dashboard**: enter the credentials when connecting the app. Values saved in the dashboard take precedence.
* **Environment variables**: set the variables below on the container, and the app is ready to connect the moment the instance starts. This is the way to bake app configuration into your deployment.

Whichever way you configure an app, register its OAuth callback URL with the provider:

```
{APP_URL}/v1/apps/{provider}/callback
```

For example, `https://onecli.internal.example.com/v1/apps/dropbox/callback`. Per-provider setup is covered in the [integration guides](/docs/integrations/app-connections).

## Available in both editions

| App                   | Provider ID             | Environment variables                                        |
| --------------------- | ----------------------- | ------------------------------------------------------------ |
| GitHub                | `github`                | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`                   |
| GitHub App            | `github-app`            | `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_PRIVATE_KEY` |
| Gmail                 | `gmail`                 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                   |
| Google Calendar       | `google-calendar`       | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                   |
| Google Drive          | `google-drive`          | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                   |
| Google Search Console | `google-search-console` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                   |
| YouTube               | `youtube`               | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                   |
| Jira                  | `jira`                  | `ATLASSIAN_CLIENT_ID`, `ATLASSIAN_CLIENT_SECRET`             |
| Confluence            | `confluence`            | `ATLASSIAN_CLIENT_ID`, `ATLASSIAN_CLIENT_SECRET`             |
| Dropbox               | `dropbox`               | `DROPBOX_CLIENT_ID`, `DROPBOX_CLIENT_SECRET`                 |
| LinkedIn              | `linkedin`              | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`               |
| Monday.com            | `monday`                | `MONDAY_CLIENT_ID`, `MONDAY_CLIENT_SECRET`                   |
| Notion                | `notion`                | `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`                   |
| Supabase              | `supabase`              | `SUPABASE_CLIENT_ID`, `SUPABASE_CLIENT_SECRET`               |
| Todoist               | `todoist`               | `TODOIST_CLIENT_ID`, `TODOIST_CLIENT_SECRET`                 |
| Trello                | `trello`                | `TRELLO_API_KEY`, `TRELLO_API_SECRET`                        |

<Note>
  One Google OAuth app serves all the Google integrations, and one Atlassian app serves Jira and Confluence. The same `GOOGLE_*` and `ATLASSIAN_*` values apply across their rows.
</Note>

## Enterprise edition only

These apps ship with the [Enterprise all-in-one image](/docs/self-hosting/enterprise/all-in-one):

| App               | Provider ID         | Environment variables                            |
| ----------------- | ------------------- | ------------------------------------------------ |
| Attio             | `attio`             | `ATTIO_CLIENT_ID`, `ATTIO_CLIENT_SECRET`         |
| Fathom            | `fathom`            | `FATHOM_CLIENT_ID`, `FATHOM_CLIENT_SECRET`       |
| HubSpot           | `hubspot`           | `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET`     |
| Linear            | `linear`            | `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`       |
| Microsoft OneNote | `microsoft-onenote` | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Microsoft Word    | `microsoft-word`    | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Outlook Calendar  | `outlook-calendar`  | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Outlook Mail      | `outlook-mail`      | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Sentry            | `sentry`            | `SENTRY_CLIENT_ID`, `SENTRY_CLIENT_SECRET`       |
| Slack             | `slack`             | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`         |
| Zoom              | `zoom`              | `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`           |

<Note>
  One Microsoft Entra app registration serves all four Microsoft integrations; the same `MICROSOFT_*` values apply across their rows.
</Note>

## Dashboard configuration only

These OAuth apps don't read environment variables yet. Enter their credentials in the dashboard when connecting:

* Google Docs, Google Sheets, Google Slides, Google Forms, Google Meet, Google Photos, Google Tasks, Google Admin, Google Analytics, Google Classroom, Google Chat, Google Contacts
* GitLab
* X (Twitter)

## No deploy-time credentials

Apps that authenticate with per-connection API keys, tokens, or roles need no app-level configuration. Users supply their credential when connecting in the dashboard: AWS, Cloudflare, Datadog, Fly.io, MongoDB Atlas, Resend, Vertex AI, and on Enterprise also Affinity and Granola.

## Example

A slim deployment with Dropbox and the Google apps pre-configured adds the variables to the compose environment:

```yaml docker-compose.yml theme={null}
  onecli:
    image: onecli/slim:latest
    environment:
      DATABASE_URL: postgresql://onecli:${POSTGRES_PASSWORD}@postgres:5432/onecli
      APP_URL: https://onecli.internal.example.com
      ONECLI_ORG_API_KEY: ${ONECLI_ORG_API_KEY}
      DROPBOX_CLIENT_ID: ${DROPBOX_CLIENT_ID}
      DROPBOX_CLIENT_SECRET: ${DROPBOX_CLIENT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```
