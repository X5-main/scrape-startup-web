# AVELIN-MCP Cross-Service Scenarios

This page documents model-achievable workflows that combine multiple MCP services (Calendar, Gmail, Contacts, Tasks) to deliver end-to-end business outcomes.

## Scenario Format

Each scenario includes:

- **Trigger**
- **Actions used** (exact tool names)
- **Outcome**
- **Business benefit**

## Cross-Service Scenario Library

### 1) Meeting Follow-Up Automation

- **Trigger:** meeting ends and follow-up is required.
- **Actions used:** `get_event`, `get_contact`, `send_email`, `create_task`.
- **Outcome:** follow-up email sent and action items tracked as tasks.
- **Business benefit:** improved accountability and faster post-meeting execution.

### 2) Contact-to-Meeting Scheduling

- **Trigger:** user wants to schedule a meeting with a known contact.
- **Actions used:** `find_contact_by_email`, `find_free_busy`, `create_event`, `add_attendees`.
- **Outcome:** meeting booked at available slot with attendee added.
- **Business benefit:** reduced scheduling friction.

### 3) Email-to-Task Conversion

- **Trigger:** inbound message contains an action request.
- **Actions used:** `get_email`, `create_task`, `archive_message`.
- **Outcome:** action captured and message moved out of active inbox.
- **Business benefit:** fewer dropped requests and cleaner inbox.

### 4) Customer Reply with Tracked Commitment

- **Trigger:** user sends response promising delivery.
- **Actions used:** `reply_to_email`, `create_task`, `star_task`.
- **Outcome:** commitment recorded with priority marker.
- **Business benefit:** stronger follow-through on customer commitments.

### 5) Meeting Prep Pack Workflow

- **Trigger:** important meeting scheduled for tomorrow.
- **Actions used:** `get_event`, `search_emails`, `find_contact_by_email`, `create_task`.
- **Outcome:** prep checklist built from thread and contact context.
- **Business benefit:** better meeting readiness and quality.

### 6) Calendar Conflict Resolution

- **Trigger:** conflicting meetings detected.
- **Actions used:** `list_events`, `find_free_busy`, `update_event`, `send_email`.
- **Outcome:** event rescheduled and participants informed.
- **Business benefit:** reduced disruption and better attendance.

### 7) Action Escalation Flow

- **Trigger:** overdue high-priority task is identified.
- **Actions used:** `list_tasks`, `get_task`, `send_email`, `star_message`.
- **Outcome:** escalation notice sent and message prioritized.
- **Business benefit:** faster resolution of blocked work.

### 8) Contact Database Enrichment from Email

- **Trigger:** new stakeholder appears in inbound mail.
- **Actions used:** `get_email`, `find_contact_by_email`, `upsert_contact`.
- **Outcome:** contact record created or merged with latest data.
- **Business benefit:** richer relationship intelligence with less manual entry.

### 9) Task-to-Calendar Time Blocking

- **Trigger:** critical task needs dedicated focus time.
- **Actions used:** `get_task`, `create_event`, `update_task`.
- **Outcome:** calendar focus block created and task updated.
- **Business benefit:** better completion reliability for deep work.

### 10) Executive Daily Brief Workflow

- **Trigger:** start-of-day executive update request.
- **Actions used:** `get_today_events`, `get_unread_count`, `list_tasks`, `search_emails`.
- **Outcome:** concise brief of schedule, inbox pressure, and priorities.
- **Business benefit:** faster executive alignment.

### 11) Project Kickoff Coordination

- **Trigger:** new project launch.
- **Actions used:** `create_task_list`, `create_task`, `create_event`, `send_email`.
- **Outcome:** kickoff plan, meeting, and stakeholder notification executed.
- **Business benefit:** shorter project mobilization time.

### 12) Decision Trail Capture

- **Trigger:** important decision made in email thread.
- **Actions used:** `get_email`, `create_task`, `add_label`, `create_event`.
- **Outcome:** decision tracked as task, thread labeled, follow-up scheduled.
- **Business benefit:** improved traceability and execution continuity.

### 13) Reengagement Workflow

- **Trigger:** archived thread becomes relevant again.
- **Actions used:** `search_emails`, `unarchive_message`, `find_contact_by_email`, `create_task`.
- **Outcome:** conversation reactivated and next step assigned.
- **Business benefit:** reduced missed opportunities.

### 14) Group Communication Preparation

- **Trigger:** team needs targeted outreach to stakeholder segment.
- **Actions used:** `search_contacts`, `create_draft`, `list_aliases`, `send_email`.
- **Outcome:** curated outbound communication to selected contacts.
- **Business benefit:** faster coordinated outreach with brand consistency.

### 15) Compliance Reminder Sequence

- **Trigger:** recurring obligation approaching deadline.
- **Actions used:** `list_tasks`, `create_event`, `send_email`, `mark_as_unread`.
- **Outcome:** calendar reminder created and stakeholders notified.
- **Business benefit:** lower compliance miss risk.

### 16) Inbox Cleanup with Action Preservation

- **Trigger:** inbox overloaded but actions must be preserved.
- **Actions used:** `list_inbox`, `get_email`, `create_task`, `archive_message`, `mark_as_read`.
- **Outcome:** mailbox cleaned while required actions remain tracked.
- **Business benefit:** productivity gain without losing commitments.

### 17) Contact Validation Before Invitation

- **Trigger:** user wants to ensure attendee details are correct.
- **Actions used:** `get_contact`, `find_contact_by_email`, `create_event`, `add_attendees`.
- **Outcome:** validated attendee invited to event.
- **Business benefit:** fewer invitation failures and better scheduling accuracy.

### 18) Weekly Planning Consolidation

- **Trigger:** weekly planning session.
- **Actions used:** `list_events`, `list_tasks`, `search_emails`, `create_task`, `create_event`.
- **Outcome:** integrated weekly plan with actions and calendar anchors.
- **Business benefit:** improved planning quality and execution discipline.

## Recommended Operational Pattern

For consistent enterprise results with AVELIN's **Cross-Model MoE** platform:

1. Use Calendar + Contacts for accurate stakeholder scheduling.
2. Use Gmail + Tasks for commitment capture and follow-through.
3. Use all four services for weekly planning and execution governance.

All workflows benefit from **AA Index** tier optimization — agentic tasks (score: 67) run **up to 87% cheaper** than premium alternatives while maintaining execution quality.
