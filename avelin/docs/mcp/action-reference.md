# AVELIN-MCP Action Reference

This page is a fast lookup catalog of all currently implemented MCP actions.

AVELIN-MCP actions are executed through **Cross-Model MoE** cascading — each action uses the optimal **AA Index** tier for cost and quality balance. Agentic workflows (AA Index: 67) run **up to 87% cheaper** than premium alternatives.

## Coverage Summary

| Service | Action Count |
| --- | --- |
| Google Calendar | 13 |
| Gmail | 32 |
| Google Contacts | 9 |
| Google Tasks | 15 |
| **Total** | **69** |

## Google Calendar (13)

| Action | Purpose | Typical Business Use |
| --- | --- | --- |
| `list_calendars` | list available calendars | discover planning contexts |
| `get_calendar` | read calendar metadata | confirm target calendar |
| `list_events` | list events with filters | schedule review and reporting |
| `get_event` | read full event details | meeting prep and validation |
| `create_event` | create event | convert plan to scheduled commitment |
| `update_event` | edit event fields | reschedule and detail updates |
| `delete_event` | remove event | cancel obsolete meetings |
| `quick_add_event` | create event from text | rapid conversational scheduling |
| `find_free_busy` | check busy slots | identify meeting windows |
| `get_today_events` | get today's events | daily planning brief |
| `search_events` | search events by text | find project or topic meetings |
| `add_attendees` | add attendees | expand participant list |
| `remove_attendees` | remove attendees | correct participant list |

## Gmail (32)

| Action | Purpose | Typical Business Use |
| --- | --- | --- |
| `list_emails` | list all mail | broad mailbox review |
| `list_inbox` | list inbox-only mail | active inbox triage |
| `get_email` | read one or many emails | context extraction |
| `search_emails` | search with query | locate relevant threads |
| `send_email` | send new email | outbound communication |
| `create_draft` | create draft email | review-before-send workflows |
| `list_labels` | list labels | classification governance |
| `reply_to_email` | reply in thread | fast response handling |
| `trash_message` | move to trash | mailbox cleanup |
| `archive_message` | archive message | reduce inbox noise |
| `unarchive_message` | restore from archive | reactivate old thread |
| `star_message` | mark as starred | priority flagging |
| `unstar_message` | remove star | reprioritization |
| `get_unread_count` | get unread total | communication workload signal |
| `mark_as_spam` | flag as spam | block unwanted traffic |
| `remove_from_spam` | recover from spam | restore valid communication |
| `list_blocked_senders` | list block filters | rule audit |
| `block_sender` | block sender | sender-level suppression |
| `block_domain` | block domain | domain-level suppression |
| `unblock_sender` | remove block filter | restore communication channel |
| `list_auto_archived_senders` | list auto-archive rules | automation audit |
| `auto_archive_sender` | auto-archive sender | low-priority automation |
| `auto_archive_domain` | auto-archive domain | domain-level automation |
| `unauto_archive_sender` | remove auto-archive filter | restore inbox visibility |
| `mark_as_read` | mark read | queue cleanup |
| `mark_as_unread` | mark unread | re-queue for later action |
| `add_label` | add label | workflow stage mapping |
| `remove_label` | remove label | taxonomy cleanup |
| `list_attachments` | list attachments | document detection |
| `get_attachment` | retrieve attachment | document processing |
| `get_profile` | read account profile | identity verification |
| `list_aliases` | list send-as aliases | sender identity control |

## Google Contacts (9)

| Action | Purpose | Typical Business Use |
| --- | --- | --- |
| `list_contacts` | list contacts | relationship inventory review |
| `get_contact` | get full contact details | outreach prep |
| `search_contacts` | search by text | stakeholder lookup |
| `find_contact_by_email` | find by email | recipient validation |
| `find_contact_by_phone` | find by phone | phone-based identity match |
| `upsert_contact` | create/merge contact | duplicate-safe enrichment |
| `create_contact` | create new contact | rapid onboarding |
| `update_contact` | update contact data | profile freshness |
| `delete_contact` | delete contact | stale record cleanup |

## Google Tasks (15)

| Action | Purpose | Typical Business Use |
| --- | --- | --- |
| `list_task_lists` | list task lists | planning landscape review |
| `get_task_list` | get task list details | validate target list |
| `create_task_list` | create task list | new project setup |
| `update_task_list` | rename/update list | structural housekeeping |
| `delete_task_list` | delete list | remove obsolete structure |
| `list_tasks` | list tasks with filters | workload and deadline review |
| `get_task` | read task details | execution context check |
| `create_task` | create task | commitment capture |
| `update_task` | update task fields | progress tracking |
| `delete_task` | delete task | invalid task cleanup |
| `move_task` | reorder/re-parent task | sequencing and dependency control |
| `move_task_to_list` | move task(s) between lists | project realignment |
| `star_task` | prioritize task(s) | urgent focus queue |
| `unstar_task` | deprioritize task(s) | priority normalization |
| `clear_completed_tasks` | remove completed tasks | backlog hygiene |

## Related Pages

- MCP index: [`index.md`](index.md)
- Calendar details: [`google-calendar.md`](google-calendar.md)
- Gmail details: [`gmail.md`](gmail.md)
- Contacts details: [`google-contacts.md`](google-contacts.md)
- Tasks details: [`google-tasks.md`](google-tasks.md)
- Cross-service workflows: [`cross-service-scenarios.md`](cross-service-scenarios.md)
