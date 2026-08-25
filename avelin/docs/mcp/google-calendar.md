# Google Calendar MCP Service

This page describes every Calendar action currently available through AVELIN-MCP and what the model can achieve with each action.

Calendar operations are part of AVELIN's **Enterprise Platform pillar** and execute through **Cross-Model MoE** cascading. Scheduling workflows use optimal **AA Index** tiers — routine lookups use fast (47) while complex coordination uses agentic-pro (67), delivering **up to 87% cost savings** on execution tasks.

## Service Purpose

Google Calendar MCP gives the model full operational support for planning, scheduling, attendee coordination, and event lifecycle management.

## Full Action List (Implemented)

1. `list_calendars`
2. `get_calendar`
3. `list_events`
4. `get_event`
5. `create_event`
6. `update_event`
7. `delete_event`
8. `quick_add_event`
9. `find_free_busy`
10. `get_today_events`
11. `search_events`
12. `add_attendees`
13. `remove_attendees`

## Action-by-Action Business Description

### `list_calendars`

- **What model can do:** retrieve all calendars available to the user.
- **Typical inputs:** none.
- **Business outcome:** creates visibility across personal, team, and shared scheduling spaces.

### `get_calendar`

- **What model can do:** fetch detailed metadata for one calendar.
- **Typical inputs:** `calendar_id` (for example, `primary`).
- **Business outcome:** confirms the correct calendar context before scheduling actions.

### `list_events`

- **What model can do:** list events with optional filters and pagination.
- **Typical inputs:** `calendar_id`, `max_results`, `time_min`, `time_max`, `query`, `page_token`.
- **Business outcome:** supports planning, workload reviews, and event audits for selected time windows.

### `get_event`

- **What model can do:** retrieve complete details for one event.
- **Typical inputs:** `calendar_id`, `event_id`.
- **Business outcome:** gives full meeting context before editing, follow-up, or attendee changes.

### `create_event`

- **What model can do:** create structured calendar events.
- **Typical inputs:** `summary`, `start_time`, `end_time`, optional `description`, `location`, `attendees`, `time_zone`, `all_day`.
- **Business outcome:** enables direct conversion of plans into scheduled commitments.

### `update_event`

- **What model can do:** modify existing event details.
- **Typical inputs:** `event_id`, `calendar_id`, plus fields to update.
- **Business outcome:** keeps stakeholders aligned when meeting details change.

### `delete_event`

- **What model can do:** remove an event.
- **Typical inputs:** `event_id`, `calendar_id`.
- **Business outcome:** clears invalid commitments and avoids scheduling confusion.

### `quick_add_event`

- **What model can do:** create events from natural-language text.
- **Typical inputs:** `text`, optional `calendar_id`.
- **Business outcome:** speeds up event creation for users who work conversationally.

### `find_free_busy`

- **What model can do:** detect busy slots across one or more calendars.
- **Typical inputs:** `calendar_ids`, `time_min`, `time_max`.
- **Business outcome:** identifies viable meeting windows with less back-and-forth.

### `get_today_events`

- **What model can do:** fetch all events for the current day.
- **Typical inputs:** optional `calendar_id`.
- **Business outcome:** supports rapid daily planning and priority alignment.

### `search_events`

- **What model can do:** search calendar events by text.
- **Typical inputs:** `query`, optional `calendar_id`, `max_results`.
- **Business outcome:** quickly finds historical or future meetings related to a topic.

### `add_attendees`

- **What model can do:** append attendees to an existing event.
- **Typical inputs:** `event_id`, `emails`, optional `calendar_id`.
- **Business outcome:** updates participation without recreating event workflows.

### `remove_attendees`

- **What model can do:** remove attendees from an event.
- **Typical inputs:** `event_id`, `emails`, optional `calendar_id`.
- **Business outcome:** maintains accurate participant lists and avoids unnecessary invites.

## Model-Achievable Calendar Scenarios

### 1) Daily agenda briefing

- **Trigger:** start of workday.
- **Actions used:** `get_today_events`, `list_events`.
- **Outcome:** prioritized day plan.
- **Business benefit:** faster planning and fewer missed meetings.

### 2) Multi-person meeting setup

- **Trigger:** user needs a time slot for multiple stakeholders.
- **Actions used:** `find_free_busy`, `create_event`, `add_attendees`.
- **Outcome:** scheduled meeting with invitees.
- **Business benefit:** reduced scheduling cycle time.

### 3) Fast voice-to-calendar capture

- **Trigger:** user states meeting details in natural language.
- **Actions used:** `quick_add_event`.
- **Outcome:** meeting instantly scheduled.
- **Business benefit:** less admin friction.

### 4) Reschedule workflow

- **Trigger:** meeting time or location changes.
- **Actions used:** `get_event`, `update_event`.
- **Outcome:** updated event details for all participants.
- **Business benefit:** lower coordination errors.

### 5) Attendance correction

- **Trigger:** attendee list changes after event creation.
- **Actions used:** `add_attendees`, `remove_attendees`.
- **Outcome:** accurate participant set.
- **Business benefit:** improved meeting quality and preparedness.

### 6) Calendar cleanup

- **Trigger:** obsolete meeting should be removed.
- **Actions used:** `get_event`, `delete_event`.
- **Outcome:** invalid event removed.
- **Business benefit:** cleaner calendar and less confusion.

### 7) Topic-based event retrieval

- **Trigger:** user needs all meetings related to a project.
- **Actions used:** `search_events`, `list_events`.
- **Outcome:** matched event set.
- **Business benefit:** faster historical context retrieval.

### 8) Executive availability scan

- **Trigger:** urgent strategic session needs earliest slot.
- **Actions used:** `find_free_busy`.
- **Outcome:** shortlist of available windows.
- **Business benefit:** faster executive alignment.

### 9) Cross-calendar consolidation

- **Trigger:** user manages multiple calendars.
- **Actions used:** `list_calendars`, `list_events`.
- **Outcome:** consolidated view of commitments.
- **Business benefit:** reduced overlap and conflict risk.

### 10) Meeting context validation

- **Trigger:** user needs details before outreach.
- **Actions used:** `get_event`, `get_calendar`.
- **Outcome:** verified event and calendar context.
- **Business benefit:** better communication accuracy.
