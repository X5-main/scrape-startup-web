> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# travel

> Travel discovery primitives via CLI: Google Hotels and TripAdvisor search.

## Overview

Travel commands are currently exposed under the `business` namespace:

| Command                                | Description                             | Method           |
| -------------------------------------- | --------------------------------------- | ---------------- |
| `naive business google hotel-searches` | Search hotels by keyword and location   | Live             |
| `naive business google hotel-info`     | Fetch detailed hotel data by identifier | Live             |
| `naive business tripadvisor search`    | Search places on TripAdvisor            | Standard (async) |

***

## Google Hotels

```bash theme={"theme":"css-variables"}
naive business google hotel-searches --keyword "hotels manhattan" --location-code 2840
naive business google hotel-info --hotel-id "ChIJN1t_tDeuEmsRUsoyG83frY4"
```

### Endpoints

| Endpoint       | Description                                 | Method |
| -------------- | ------------------------------------------- | ------ |
| hotel-searches | Search hotels by query and geography        | Live   |
| hotel-info     | Detailed hotel profile, rates, and metadata | Live   |

### Options

| Flag                       | Required       | Description                                |
| -------------------------- | -------------- | ------------------------------------------ |
| `--keyword <text>`         | hotel-searches | Hotel search query                         |
| `--hotel-id <id>`          | hotel-info     | Google hotel identifier (CID or place\_id) |
| `--location-code <code>`   | No             | Location code                              |
| `--language-code <code>`   | No             | Language code                              |
| `--check-in <YYYY-MM-DD>`  | No             | Check-in date                              |
| `--check-out <YYYY-MM-DD>` | No             | Check-out date                             |
| `--adults <n>`             | No             | Number of adults                           |

***

## TripAdvisor Discovery

```bash theme={"theme":"css-variables"}
naive business tripadvisor search --keyword "restaurants paris"
```

### Endpoint

| Endpoint | Description                           | Method           |
| -------- | ------------------------------------- | ---------------- |
| search   | Find businesses/places on TripAdvisor | Standard (async) |

### Options

| Flag                     | Required | Description                      |
| ------------------------ | -------- | -------------------------------- |
| `--keyword <text>`       | Yes      | Place query                      |
| `--location-code <code>` | No       | Location code                    |
| `--language-code <code>` | No       | Language code                    |
| `--priority <n>`         | No       | Task priority (1 high, 2 normal) |

***

## Task Management (TripAdvisor Search)

`tripadvisor search` runs asynchronously and returns a task ID:

```bash theme={"theme":"css-variables"}
# Submit
naive business tripadvisor search --keyword "hotels lisbon"
# -> task_id: abc-123

# Check ready
naive business tasks-ready --platform tripadvisor --endpoint search

# Get results
naive business task-get abc-123 --platform tripadvisor --endpoint search
```
