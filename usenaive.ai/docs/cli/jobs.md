> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# jobs

> Monitor and manage async jobs (image/video generation, deep research) with structured output.

## Overview

Long-running operations (image generation, video generation, deep research) are processed asynchronously. When you submit one, you get a `job_id`. Use these commands to monitor progress and retrieve results.

**Job lifecycle:** `queued` → `processing` → `completed` or `failed`

**Credit behavior:**

* Credits are NOT reserved at submission
* Credits deducted ONLY on successful completion
* Failed or cancelled jobs cost nothing

***

## List Jobs

```bash theme={"theme":"css-variables"}
naive jobs
naive jobs --status processing
naive jobs --status completed --limit 5
```

### Options

| Flag                | Required | Description                                           |
| ------------------- | -------- | ----------------------------------------------------- |
| `--status <status>` | No       | Filter: `queued`, `processing`, `completed`, `failed` |
| `--limit <n>`       | No       | Max results (default: 20)                             |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "jobs.list",
  "result": {
    "jobs": [
      { "id": "job-uuid-1", "type": "video_generation", "status": "processing", "progress": 45, "model": "fal-ai/minimax-video/video-01-live", "created_at": "2025-01-15T10:30:00Z" },
      { "id": "job-uuid-2", "type": "image_generation", "status": "completed", "progress": 100, "model": "fal-ai/flux/schnell", "created_at": "2025-01-15T10:25:00Z" }
    ]
  },
  "next_steps": [
    { "command": "naive jobs get job-uuid-1", "description": "Check progress of video_generation job" },
    { "command": "naive jobs --status completed --limit 5", "description": "See recently completed jobs with results" },
    { "command": "naive jobs cancel job-uuid-1", "description": "Cancel a running job (no credits charged)" }
  ],
  "hints": [
    "2 jobs found",
    "1 active (queued/processing)",
    "Credits are deducted only when jobs complete successfully"
  ]
}
```

***

## Get Job Details

```bash theme={"theme":"css-variables"}
naive jobs get <job-id>
```

Returns comprehensive details including input parameters, progress, and result (when complete).

### Output (processing)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "jobs.get",
  "result": {
    "id": "job-uuid-1",
    "type": "video_generation",
    "status": "processing",
    "progress": 65,
    "model": "fal-ai/minimax-video/video-01-live",
    "input": { "prompt": "a rocket launching" },
    "created_at": "2025-01-15T10:30:00Z",
    "started_at": "2025-01-15T10:30:02Z"
  },
  "next_steps": [
    { "command": "naive jobs get job-uuid-1", "description": "Check again in a few seconds" },
    { "command": "naive jobs cancel job-uuid-1", "description": "Cancel this job" }
  ],
  "hints": ["Job job-uuid-1: processing", "Job is actively processing — check back soon"]
}
```

### Output (completed)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "jobs.get",
  "result": {
    "id": "job-uuid-1",
    "type": "video_generation",
    "status": "completed",
    "progress": 100,
    "model": "fal-ai/minimax-video/video-01-live",
    "result": {
      "video": { "url": "https://fal.media/files/.../video.mp4" }
    },
    "credits_used": "30.0000",
    "created_at": "2025-01-15T10:30:00Z",
    "started_at": "2025-01-15T10:30:02Z",
    "completed_at": "2025-01-15T10:31:15Z"
  },
  "next_steps": [
    { "command": "naive video generate \"new prompt\"", "description": "Generate another video" }
  ],
  "hints": ["Job completed — result is included above"]
}
```

***

## Cancel Job

```bash theme={"theme":"css-variables"}
naive jobs cancel <job-id>
```

Cancels a queued or processing job. Cancelled jobs never deduct credits.

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "jobs.cancel",
  "result": { "job_id": "job-uuid-1", "cancelled": true },
  "next_steps": [
    { "command": "naive jobs --status processing", "description": "Check remaining active jobs" },
    { "command": "naive jobs get job-uuid-1", "description": "Verify cancellation status" }
  ],
  "hints": [
    "Job cancellation requested — no credits will be charged",
    "Running jobs may still complete if processing already started"
  ]
}
```

***

## Status & Usage

### Account Status

```bash theme={"theme":"css-variables"}
naive status
```

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "status",
  "result": {
    "agent": { "id": "uuid", "name": "Research Bot" },
    "company": { "id": "uuid", "name": "Acme Corp" },
    "credits": { "balance": 875, "tier": "pro" },
    "resources": { "email_inboxes": 2, "active_jobs": 1 }
  },
  "next_steps": [
    { "command": "naive usage", "description": "See detailed credit usage history" },
    { "command": "naive jobs --status processing", "description": "Check active async jobs" }
  ],
  "hints": ["Balance: 875 credits (pro tier)"]
}
```

### Credit Usage History

```bash theme={"theme":"css-variables"}
naive usage
naive usage --days 7
naive usage --days 1 --limit 100
```

### Options

| Flag          | Required | Description                     |
| ------------- | -------- | ------------------------------- |
| `--days <n>`  | No       | Days to look back (default: 30) |
| `--limit <n>` | No       | Max transactions (default: 50)  |

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "usage",
  "result": {
    "transactions": [
      { "type": "deduction", "amount": "-10.00", "operation": "email_send", "reference_id": "msg-uuid", "created_at": "..." },
      { "type": "deduction", "amount": "-30.00", "operation": "job_completion", "reference_id": "job-uuid", "created_at": "..." }
    ]
  },
  "next_steps": [
    { "command": "naive status", "description": "See current balance summary" },
    { "command": "naive usage --days 1", "description": "Narrow to today's usage only" }
  ],
  "hints": [
    "Showing 2 transactions from the last 30 days",
    "Async jobs deduct credits only on completion"
  ]
}
```

### Credit Costs Reference

**Fixed-price operations:**

| Operation                  | Cost          |
| -------------------------- | ------------- |
| Web search                 | 0.2 credits   |
| URL extraction             | 0.05 credits  |
| Stock photo search         | 0 (free)      |
| Email send                 | 0.016 credits |
| Deep research (quick)      | 0.5 credits   |
| Deep research (thorough)   | 1 credit      |
| Deep research (exhaustive) | 1.6 credits   |

**Dynamic-price operations (image/video generation):**

| Operation        | Cost                                               |
| ---------------- | -------------------------------------------------- |
| Image generation | Model-dependent (`GET /v1/images/pricing`)         |
| Video generation | Model/duration-dependent (`GET /v1/video/pricing`) |

Pricing is based on model costs, at \$0.05 per credit.
