# Gmail MCP Service

This page documents every Gmail action available through AVELIN-MCP and what the model can execute with each action.

Gmail operations are part of AVELIN's **Enterprise Platform pillar** and execute through **Cross-Model MoE** cascading. Email workflows benefit from intelligent tier selection — routine operations use **AA Index** fast tier (47) while complex drafting uses pro (53) or coding-pro (49) tiers, delivering **up to 87% cost savings** on agentic tasks.

## Service Purpose

Gmail MCP gives the model practical email operations: reading, searching, drafting, replying, organizing, filtering, and attachment handling.

## Full Action List (Implemented)

1. `list_emails`
2. `list_inbox`
3. `get_email`
4. `search_emails`
5. `send_email`
6. `create_draft`
7. `list_labels`
8. `reply_to_email`
9. `trash_message`
10. `archive_message`
11. `unarchive_message`
12. `star_message`
13. `unstar_message`
14. `get_unread_count`
15. `mark_as_spam`
16. `remove_from_spam`
17. `list_blocked_senders`
18. `block_sender`
19. `block_domain`
20. `unblock_sender`
21. `list_auto_archived_senders`
22. `auto_archive_sender`
23. `auto_archive_domain`
24. `unauto_archive_sender`
25. `mark_as_read`
26. `mark_as_unread`
27. `add_label`
28. `remove_label`
29. `list_attachments`
30. `get_attachment`
31. `get_profile`
32. `list_aliases`

## Action-by-Action Business Description

### `list_emails`

- **What model can do:** list recent messages across all mail.
- **Typical inputs:** `max_results`, optional `query`, optional `page_token`.
- **Business outcome:** broad email visibility for audits and context gathering.

### `list_inbox`

- **What model can do:** list inbox-only messages.
- **Typical inputs:** `max_results`, optional `query`, optional `page_token`.
- **Business outcome:** supports active inbox triage workflows.

### `get_email`

- **What model can do:** fetch one email or batch of emails.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** full message context for response drafting and decision support.

### `search_emails`

- **What model can do:** search with Gmail query syntax.
- **Typical inputs:** `query`, `max_results`, optional `page_token`.
- **Business outcome:** finds relevant communications quickly by topic, sender, or timeframe.

### `send_email`

- **What model can do:** send a new outbound email.
- **Typical inputs:** `to`, `subject`, `body`.
- **Business outcome:** converts decisions into immediate communication actions.

### `create_draft`

- **What model can do:** create draft messages without sending.
- **Typical inputs:** `to`, `subject`, `body`.
- **Business outcome:** enables review workflows before final send.

### `list_labels`

- **What model can do:** retrieve available label taxonomy.
- **Typical inputs:** none.
- **Business outcome:** supports consistent mailbox organization.

### `reply_to_email`

- **What model can do:** reply to an existing thread.
- **Typical inputs:** `message_id`, `body`, optional `reply_all`.
- **Business outcome:** preserves thread continuity and faster response handling.

### `trash_message`

- **What model can do:** move one or many messages to trash.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** inbox cleanup and noise reduction.

### `archive_message`

- **What model can do:** archive one or many messages.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** keeps inbox focused while preserving records.

### `unarchive_message`

- **What model can do:** return archived messages to active inbox.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** restores items for active handling when needed.

### `star_message`

- **What model can do:** star one or many messages.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** flags priority communication for follow-up.

### `unstar_message`

- **What model can do:** remove star flags.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** keeps priority queue current and meaningful.

### `get_unread_count`

- **What model can do:** get unread message count.
- **Typical inputs:** none.
- **Business outcome:** quick workload signal for communication backlog.

### `mark_as_spam`

- **What model can do:** mark messages as spam.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** reduces unwanted communication noise and risk.

### `remove_from_spam`

- **What model can do:** restore mistakenly flagged messages.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** prevents loss of legitimate business communication.

### `list_blocked_senders`

- **What model can do:** list sender/domain block filters.
- **Typical inputs:** none.
- **Business outcome:** visibility into current inbound filtering rules.

### `block_sender`

- **What model can do:** create sender-level block filter.
- **Typical inputs:** `email`.
- **Business outcome:** suppresses recurring unwanted messages from one sender.

### `block_domain`

- **What model can do:** create domain-level block filter.
- **Typical inputs:** `domain`.
- **Business outcome:** broad protection from unwanted domain traffic.

### `unblock_sender`

- **What model can do:** remove an existing block filter.
- **Typical inputs:** `filter_id`.
- **Business outcome:** restores communication channels when policy changes.

### `list_auto_archived_senders`

- **What model can do:** list auto-archive rule set.
- **Typical inputs:** none.
- **Business outcome:** governance visibility on inbox automation.

### `auto_archive_sender`

- **What model can do:** auto-archive and mark read for a sender.
- **Typical inputs:** `email`.
- **Business outcome:** reduces inbox clutter from low-priority senders.

### `auto_archive_domain`

- **What model can do:** auto-archive and mark read for a domain.
- **Typical inputs:** `domain`.
- **Business outcome:** streamlines high-volume low-priority traffic.

### `unauto_archive_sender`

- **What model can do:** remove auto-archive filter.
- **Typical inputs:** `filter_id`.
- **Business outcome:** recovers active inbox visibility for previously filtered traffic.

### `mark_as_read`

- **What model can do:** mark messages as read.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** keeps unread queue accurate after handling.

### `mark_as_unread`

- **What model can do:** mark messages as unread.
- **Typical inputs:** `message_id` or `message_ids`.
- **Business outcome:** re-queues items needing later action.

### `add_label`

- **What model can do:** apply a label to a message.
- **Typical inputs:** `message_id`, `label_id`.
- **Business outcome:** better categorization and retrieval.

### `remove_label`

- **What model can do:** remove a label from a message.
- **Typical inputs:** `message_id`, `label_id`.
- **Business outcome:** maintains clean information taxonomy.

### `list_attachments`

- **What model can do:** list attachment metadata in a message.
- **Typical inputs:** `message_id`.
- **Business outcome:** helps users identify required files quickly.

### `get_attachment`

- **What model can do:** retrieve attachment content.
- **Typical inputs:** `message_id`, `attachment_id`.
- **Business outcome:** enables downstream document workflows and reviews.

### `get_profile`

- **What model can do:** retrieve account profile information.
- **Typical inputs:** none.
- **Business outcome:** confirms account identity and mailbox scope.

### `list_aliases`

- **What model can do:** list configured send-as aliases.
- **Typical inputs:** none.
- **Business outcome:** supports correct sender identity in outbound communication.

## Model-Achievable Gmail Scenarios

### 1) Morning inbox triage

- **Trigger:** start of day.
- **Actions used:** `get_unread_count`, `list_inbox`, `star_message`, `archive_message`.
- **Outcome:** priority queue established.
- **Business benefit:** quicker focus on high-value communication.

### 2) Fast response handling

- **Trigger:** urgent inbound request.
- **Actions used:** `get_email`, `reply_to_email`, `mark_as_read`.
- **Outcome:** thread response sent quickly.
- **Business benefit:** better responsiveness and stakeholder trust.

### 3) Draft-before-send policy

- **Trigger:** sensitive outbound message.
- **Actions used:** `create_draft`.
- **Outcome:** reviewable draft.
- **Business benefit:** reduced communication risk.

### 4) Targeted message retrieval

- **Trigger:** user needs historical communication proof.
- **Actions used:** `search_emails`, `get_email`.
- **Outcome:** exact thread retrieved.
- **Business benefit:** faster evidence and context retrieval.

### 5) Bulk inbox cleanup

- **Trigger:** inbox saturation.
- **Actions used:** `list_inbox`, `archive_message`, `trash_message`.
- **Outcome:** inbox normalized.
- **Business benefit:** lower cognitive load.

### 6) Anti-noise sender controls

- **Trigger:** repeated low-value sender traffic.
- **Actions used:** `block_sender`, `block_domain`, `list_blocked_senders`.
- **Outcome:** recurring noise suppressed.
- **Business benefit:** improved signal-to-noise ratio.

### 7) Low-priority stream automation

- **Trigger:** newsletters or automated updates flooding inbox.
- **Actions used:** `auto_archive_sender`, `auto_archive_domain`, `list_auto_archived_senders`.
- **Outcome:** auto-managed low-priority stream.
- **Business benefit:** better focus on critical communications.

### 8) Spam recovery

- **Trigger:** important mail flagged as spam.
- **Actions used:** `search_emails`, `remove_from_spam`.
- **Outcome:** message restored.
- **Business benefit:** prevents missed business-critical messages.

### 9) Label-based processing queue

- **Trigger:** team uses labels for process stages.
- **Actions used:** `list_labels`, `add_label`, `remove_label`.
- **Outcome:** messages mapped to workflow stage.
- **Business benefit:** stronger process visibility.

### 10) Attachment-first workflow

- **Trigger:** incoming message with required document.
- **Actions used:** `list_attachments`, `get_attachment`.
- **Outcome:** required file extracted.
- **Business benefit:** faster handoff to downstream work.

### 11) Alias-aware outbound communication

- **Trigger:** user must send from specific identity.
- **Actions used:** `list_aliases`, `create_draft`, `send_email`.
- **Outcome:** message prepared and sent with correct profile context.
- **Business benefit:** better brand and role consistency.

### 12) Re-open archived action item

- **Trigger:** archived thread becomes active again.
- **Actions used:** `search_emails`, `unarchive_message`, `mark_as_unread`.
- **Outcome:** thread returns to active queue.
- **Business benefit:** avoids lost follow-ups.
