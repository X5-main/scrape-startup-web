> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# app-data

> App rankings, reviews, and metadata from Google Play and App Store via the CLI.

## Overview

| Command                              | Description          | Method           |
| ------------------------------------ | -------------------- | ---------------- |
| `naive app-data google <endpoint>`   | Google Play app data | Standard (async) |
| `naive app-data apple <endpoint>`    | App Store app data   | Standard (async) |
| `naive app-data google app-listings` | Google Play listings | Live             |
| `naive app-data apple app-listings`  | App Store listings   | Live             |

***

## Google Play

```bash theme={"theme":"css-variables"}
naive app-data google app-searches --keyword "fitness tracker" --location-code 2840
naive app-data google app-info --app-id com.example.fitness
naive app-data google app-reviews --app-id com.example.fitness --depth 50
naive app-data google app-list --collection topselling_free --category "HEALTH_AND_FITNESS"
naive app-data google app-listings --title "fitness"
```

### Endpoints

| Endpoint     | Description              | Method   |
| ------------ | ------------------------ | -------- |
| app-searches | Search apps by keyword   | Standard |
| app-list     | Top charts by category   | Standard |
| app-info     | Detailed app metadata    | Standard |
| app-reviews  | User reviews and ratings | Standard |
| app-listings | Search listings          | Live     |

### Options

| Flag                     | Required     | Description                                             |
| ------------------------ | ------------ | ------------------------------------------------------- |
| `--keyword <text>`       | Varies       | Search keyword                                          |
| `--app-id <id>`          | Varies       | App package name (e.g. com.example.app)                 |
| `--collection <id>`      | For app-list | Collection ID (e.g. topselling\_free, topselling\_paid) |
| `--category <cat>`       | No           | App category                                            |
| `--location-code <code>` | No           | Location code                                           |
| `--language-code <code>` | No           | Language code                                           |
| `--depth <n>`            | No           | Number of results                                       |
| `--sort-by <sort>`       | No           | Review sort order: most\_relevant, newest, rating       |

***

## App Store

```bash theme={"theme":"css-variables"}
naive app-data apple app-searches --keyword "meditation" --location-code 2840
naive app-data apple app-info --app-id "1234567890"
naive app-data apple app-reviews --app-id "1234567890"
naive app-data apple app-listings --title "meditation"
```

### Endpoints

| Endpoint     | Description              | Method   |
| ------------ | ------------------------ | -------- |
| app-searches | Search apps by keyword   | Standard |
| app-list     | Top charts by category   | Standard |
| app-info     | Detailed app metadata    | Standard |
| app-reviews  | User reviews and ratings | Standard |
| app-listings | Search listings          | Live     |

### Options

| Flag                     | Required     | Description                                                           |
| ------------------------ | ------------ | --------------------------------------------------------------------- |
| `--keyword <text>`       | Varies       | Search keyword                                                        |
| `--app-id <id>`          | Varies       | App Store numeric ID                                                  |
| `--title <text>`         | For listings | App title or search term (required for app-listings)                  |
| `--collection <id>`      | For app-list | Collection ID (e.g. top\_free\_applications, top\_paid\_applications) |
| `--depth <n>`            | No           | Number of results                                                     |
| `--location-code <code>` | No           | Location code                                                         |
| `--language-code <code>` | No           | Language code                                                         |

***

## Task Management

Async endpoints return a task ID. Check and retrieve results:

```bash theme={"theme":"css-variables"}
# Submit task
naive app-data google app-searches --keyword "fitness"
# → task_id: abc-123

# Check ready tasks
naive app-data tasks-ready --platform google --endpoint app-searches

# Get results
naive app-data task-get abc-123 --platform google --endpoint app-searches
```

| Flag                                                              | Description                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `naive app-data tasks-ready --platform <p> --endpoint <e>`        | List tasks with ready results                                                  |
| `naive app-data task-get <task_id> --platform <p> --endpoint <e>` | Retrieve results for a task                                                    |
| `--format <format>`                                               | Result format for `task-get`: advanced or html (Google only, default advanced) |
