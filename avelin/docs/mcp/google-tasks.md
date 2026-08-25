# Google Tasks MCP Service

This page documents every Tasks action available through AVELIN-MCP and the business workflows the model can execute with it.

Tasks operations are part of AVELIN's **Enterprise Platform pillar** and execute through **Cross-Model MoE** cascading. Task workflows use optimal **AA Index** tiers — simple updates use fast (47) while complex planning uses agentic-pro (67), delivering **up to 87% cost savings** on execution tasks.

## Service Purpose

Google Tasks MCP enables structured personal and team action management: lists, task lifecycle, prioritization, movement, and cleanup.

## Full Action List (Implemented)

1. `list_task_lists`
2. `get_task_list`
3. `create_task_list`
4. `update_task_list`
5. `delete_task_list`
6. `list_tasks`
7. `get_task`
8. `create_task`
9. `update_task`
10. `delete_task`
11. `move_task`
12. `move_task_to_list`
13. `star_task`
14. `unstar_task`
15. `clear_completed_tasks`

## Action-by-Action Business Description

### `list_task_lists`

- **What model can do:** list task lists with pagination.
- **Typical inputs:** `max_results`, optional `page_token`.
- **Business outcome:** visibility into all planning structures.

### `get_task_list`

- **What model can do:** retrieve one task list's details.
- **Typical inputs:** `task_list_id`.
- **Business outcome:** validates list context before updates.

### `create_task_list`

- **What model can do:** create a new task list.
- **Typical inputs:** `title`.
- **Business outcome:** supports project or theme-based planning structures.

### `update_task_list`

- **What model can do:** rename or update task list metadata.
- **Typical inputs:** `task_list_id`, `title`.
- **Business outcome:** keeps planning structure clear and current.

### `delete_task_list`

- **What model can do:** delete task list.
- **Typical inputs:** `task_list_id`.
- **Business outcome:** removes obsolete planning structures.

### `list_tasks`

- **What model can do:** list tasks with status/date filters.
- **Typical inputs:** `task_list_id`, optional filters (`show_completed`, `due_min`, `due_max`, etc.).
- **Business outcome:** supports workload review and deadline management.

### `get_task`

- **What model can do:** retrieve detailed task record.
- **Typical inputs:** `task_list_id`, `task_id`.
- **Business outcome:** provides complete execution context before action.

### `create_task`

- **What model can do:** create new tasks.
- **Typical inputs:** `task_list_id`, `title`, optional details such as `notes`, `due`, `status`, `parent`.
- **Business outcome:** converts commitments into trackable actions.

### `update_task`

- **What model can do:** edit task fields and status.
- **Typical inputs:** `task_list_id`, `task_id`, fields to update.
- **Business outcome:** keeps action plans accurate through execution.

### `delete_task`

- **What model can do:** remove task.
- **Typical inputs:** `task_list_id`, `task_id`.
- **Business outcome:** clears invalid or duplicate action items.

### `move_task`

- **What model can do:** reorder or re-parent tasks inside a list.
- **Typical inputs:** `task_list_id`, `task_id`, optional `parent`, optional `previous`.
- **Business outcome:** maintains clear action sequence and hierarchy.

### `move_task_to_list`

- **What model can do:** move one or multiple tasks to a different list.
- **Typical inputs:** source `task_list_id`, `task_id` or `task_ids`, `destination_task_list_id`.
- **Business outcome:** supports reprioritization across projects.

### `star_task`

- **What model can do:** mark one or multiple tasks as priority.
- **Typical inputs:** `task_list_id`, `task_id` or `task_ids`.
- **Business outcome:** highlights high-value work for immediate focus.

### `unstar_task`

- **What model can do:** remove priority marking.
- **Typical inputs:** `task_list_id`, `task_id` or `task_ids`.
- **Business outcome:** keeps priority list relevant over time.

### `clear_completed_tasks`

- **What model can do:** remove completed tasks from active list.
- **Typical inputs:** `task_list_id`.
- **Business outcome:** cleaner active backlog and faster planning reviews.

## Model-Achievable Tasks Scenarios

### 1) Daily action planning

- **Trigger:** beginning of day.
- **Actions used:** `list_task_lists`, `list_tasks`.
- **Outcome:** prioritized daily plan.
- **Business benefit:** improved execution focus.

### 2) Commitment capture from meetings

- **Trigger:** new action item identified.
- **Actions used:** `create_task`.
- **Outcome:** task created immediately.
- **Business benefit:** fewer dropped commitments.

### 3) Project list setup

- **Trigger:** new initiative starts.
- **Actions used:** `create_task_list`, `create_task`.
- **Outcome:** structured project plan.
- **Business benefit:** faster project kickoff.

### 4) Deadline review

- **Trigger:** weekly planning review.
- **Actions used:** `list_tasks`, `get_task`.
- **Outcome:** clear view of due and overdue items.
- **Business benefit:** better deadline adherence.

### 5) Task detail enrichment

- **Trigger:** task lacks context.
- **Actions used:** `update_task`.
- **Outcome:** improved task instructions.
- **Business benefit:** less execution ambiguity.

### 6) Priority queue management

- **Trigger:** urgent workload window.
- **Actions used:** `star_task`, `unstar_task`.
- **Outcome:** dynamic high-priority list.
- **Business benefit:** better resource focus.

### 7) Reordering execution sequence

- **Trigger:** dependencies change.
- **Actions used:** `move_task`.
- **Outcome:** corrected task order.
- **Business benefit:** smoother execution flow.

### 8) Reclassifying workstreams

- **Trigger:** tasks need reassignment to new project list.
- **Actions used:** `move_task_to_list`.
- **Outcome:** tasks moved across lists.
- **Business benefit:** clearer ownership and reporting.

### 9) Backlog cleanup

- **Trigger:** list contains completed noise.
- **Actions used:** `clear_completed_tasks`.
- **Outcome:** active backlog refreshed.
- **Business benefit:** faster planning and reduced clutter.

### 10) List lifecycle governance

- **Trigger:** list becomes obsolete.
- **Actions used:** `get_task_list`, `delete_task_list`.
- **Outcome:** outdated structure removed.
- **Business benefit:** cleaner operations governance.
