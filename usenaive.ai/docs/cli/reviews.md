> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# reviews

> Reviews and reputation primitives via CLI: Google, Trustpilot, TripAdvisor, and social engagement.

## Overview

Review and reputation commands are currently exposed under the `business` namespace:

| Command                                  | Description                                  | Method           |
| ---------------------------------------- | -------------------------------------------- | ---------------- |
| `naive business google my-business-info` | Google Business details and review summary   | Live             |
| `naive business google reviews`          | Google Business reviews                      | Standard (async) |
| `naive business google qna`              | Google Questions & Answers                   | Live             |
| `naive business trustpilot search`       | Discover Trustpilot businesses               | Standard (async) |
| `naive business trustpilot reviews`      | Trustpilot review retrieval by domain        | Standard (async) |
| `naive business tripadvisor reviews`     | TripAdvisor review retrieval                 | Standard (async) |
| `naive business social <platform>`       | URL engagement metrics from social platforms | Live             |

***

## Google Reviews + Reputation

```bash theme={"theme":"css-variables"}
naive business google my-business-info --keyword "pizza new york" --location-code 1023191
naive business google reviews --keyword "starbucks seattle"
naive business google qna --keyword "apple store" --location-code 2840
```

### Endpoints

| Endpoint         | Description                              | Method           |
| ---------------- | ---------------------------------------- | ---------------- |
| my-business-info | Business details and ratings context     | Live             |
| reviews          | Business reviews                         | Standard (async) |
| qna              | Questions and answers from profile pages | Live             |

***

## Trustpilot

```bash theme={"theme":"css-variables"}
naive business trustpilot search --keyword "web hosting"
naive business trustpilot reviews --domain "example.com"
```

### Endpoints

| Endpoint | Description                   | Method           |
| -------- | ----------------------------- | ---------------- |
| search   | Find businesses on Trustpilot | Standard (async) |
| reviews  | Get reviews for a domain      | Standard (async) |

***

## TripAdvisor Reviews

```bash theme={"theme":"css-variables"}
naive business tripadvisor reviews --url-path "Restaurant_Review-g60763-d12345-..."
```

### Endpoint

| Endpoint | Description                           | Method           |
| -------- | ------------------------------------- | ---------------- |
| reviews  | Get reviews for a TripAdvisor listing | Standard (async) |

***

## Social Engagement Signals

```bash theme={"theme":"css-variables"}
naive business social facebook --targets "https://example.com,https://blog.example.com"
naive business social pinterest --targets "https://example.com/post"
naive business social reddit --targets "https://example.com"
```

### Platforms

| Platform  | Description             |
| --------- | ----------------------- |
| facebook  | Likes, shares, comments |
| pinterest | Pin counts              |
| reddit    | Submission data         |

***

## Task Management

Async endpoints return task IDs:

```bash theme={"theme":"css-variables"}
# Submit
naive business trustpilot reviews --domain "hosting.com"
# -> task_id: abc-123

# Check ready
naive business tasks-ready --platform trustpilot --endpoint reviews

# Get results
naive business task-get abc-123 --platform trustpilot --endpoint reviews
```

| Flag                                                              | Description                   |
| ----------------------------------------------------------------- | ----------------------------- |
| `naive business tasks-ready --platform <p> --endpoint <e>`        | List tasks with ready results |
| `naive business task-get <task_id> --platform <p> --endpoint <e>` | Retrieve results for a task   |
