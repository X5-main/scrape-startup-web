> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# clips

> Auto-clip long videos into short-form clips.

## Overview

| Command                            | Description                                   | Cost             |
| ---------------------------------- | --------------------------------------------- | ---------------- |
| `naive video clip <youtube_url>`   | Extract short-form clips from a YouTube video | per input minute |
| `naive video clip-status <job_id>` | Check clip extraction status                  | Free             |

<Info>
  Completed clipping jobs are auto-ingested to the [Media Asset Manager](/docs/getting-started/media). Use `naive media list --source video_clipping` to find them.
</Info>

***

## Extract Clips

Submits a long video for AI auto-clipping into short clips. Input must be a public https URL to a video 90 minutes or shorter.

```bash theme={"theme":"css-variables"}
naive video clip "https://example.com/podcast.mp4"
naive video clip "https://example.com/podcast.mp4" --aspect 16:9
```

### Options

| Flag               | Required | Description                                                                            |
| ------------------ | -------- | -------------------------------------------------------------------------------------- |
| `video_url`        | Yes      | Public https video URL, 90 minutes or shorter (positional argument)                    |
| `--aspect <ratio>` | No       | Output aspect ratio: `9:16` (default, vertical smart-crop) or `16:9` (preserve source) |

### Output (submitted)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.clip.submitted",
  "result": { "job_id": "job-uuid-123", "status": "queued" },
  "next_steps": [
    { "command": "naive video clip-status job-uuid-123", "description": "Check clipping progress" },
    { "command": "naive jobs get job-uuid-123", "description": "Get full job details" }
  ],
  "hints": [
    "Clip extraction submitted — typically takes 5-10 minutes",
    "Credits deducted only on successful completion — metered per finished clip + input minute",
    "When complete, clips are ranked by AI virality score (0-100)"
  ]
}
```

### Output (completed clip job)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.clip.completed",
  "result": {
    "id": "job-uuid-123",
    "status": "completed",
    "result": {
      "clips": [
        {
          "id": "clip-1",
          "title": "The Secret to Scaling",
          "duration": 42,
          "virality_score": { "total": 87, "shareability": 82, "hook_strength": 91, "story_quality": 85, "emotional_impact": 90 },
          "direct_url": "https://..."
        }
      ],
      "clip_count": 5,
      "top_virality_score": 87
    },
    "credits_used": 13.2
  },
  "next_steps": [
    { "command": "naive social post \"The Secret to Scaling\" --platforms youtube --youtube-type SHORT --media-url \"https://...\" --publish", "description": "Post top clip as YouTube Short" }
  ],
  "hints": ["5 clips ready (top score: 87)", "Tip: Use 'naive social post' to publish top clips to YouTube, TikTok, Instagram"]
}
```

***

## Check Status

```bash theme={"theme":"css-variables"}
naive video clip-status <job_id>
```

Reports the status of a clip extraction job.

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "video.clip-status",
  "result": {
    "id": "job-uuid-123",
    "status": "queued",
    "type": "video_clipping"
  },
  "next_steps": [
    { "command": "naive video clip-status job-uuid-123", "description": "Check again in 30-60 seconds" }
  ],
  "hints": ["Job status: queued", "Clip extraction typically takes 5-10 minutes"]
}
```

***

## Credit Behavior

* Credits are **NOT** reserved at submission time
* Credits are deducted **ONLY** when the job completes successfully
* Failed or cancelled jobs cost **nothing**
* Clip extraction is metered per input minute — there is no flat per-job fee
* Use `naive usage` to audit credit deductions
