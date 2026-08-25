# Google Contacts MCP Service

This page documents every Contacts action available through AVELIN-MCP and what the model can do with each action.

Contacts operations are part of AVELIN's **Enterprise Platform pillar** and execute through **Cross-Model MoE** cascading. Contact workflows use optimal **AA Index** tiers — routine lookups use fast (47) while complex enrichment uses coding-pro (49), delivering **up to 87% cost savings** on execution tasks.

## Service Purpose

Google Contacts MCP enables contact discovery, validation, creation, enrichment, update, and cleanup for relationship-driven business workflows.

## Full Action List (Implemented)

1. `list_contacts`
2. `get_contact`
3. `search_contacts`
4. `find_contact_by_email`
5. `find_contact_by_phone`
6. `upsert_contact`
7. `create_contact`
8. `update_contact`
9. `delete_contact`

## Action-by-Action Business Description

### `list_contacts`

- **What model can do:** list contacts with pagination.
- **Typical inputs:** `page_size`, optional `page_token`.
- **Business outcome:** supports contact audits, list building, and relationship visibility.

### `get_contact`

- **What model can do:** retrieve full details of a single contact.
- **Typical inputs:** `resource_name`.
- **Business outcome:** gives complete profile context before outreach.

### `search_contacts`

- **What model can do:** search contacts by keyword.
- **Typical inputs:** `query`, optional `page_size`.
- **Business outcome:** quickly finds stakeholders for communication or scheduling.

### `find_contact_by_email`

- **What model can do:** locate contact using exact email.
- **Typical inputs:** `email`.
- **Business outcome:** verifies recipient identity and prevents duplicate records.

### `find_contact_by_phone`

- **What model can do:** locate contact using phone number.
- **Typical inputs:** `phone`.
- **Business outcome:** validates mobile-based records and outreach paths.

### `upsert_contact`

- **What model can do:** create or merge contact intelligently.
- **Typical inputs:** name and optional identity fields such as email/phone/organization/title.
- **Business outcome:** maintains a clean relationship database without unnecessary duplicates.

### `create_contact`

- **What model can do:** create a new contact directly.
- **Typical inputs:** contact identity and profile fields.
- **Business outcome:** rapid onboarding of new relationship records.

### `update_contact`

- **What model can do:** update fields on existing contact records.
- **Typical inputs:** `resource_name`, fields to update.
- **Business outcome:** keeps records current and reduces communication errors.

### `delete_contact`

- **What model can do:** remove obsolete contact records.
- **Typical inputs:** `resource_name`.
- **Business outcome:** improves database quality and lowers stale-data risk.

## Model-Achievable Contacts Scenarios

### 1) Contact lookup before outreach

- **Trigger:** user prepares communication.
- **Actions used:** `search_contacts`, `get_contact`.
- **Outcome:** validated contact details.
- **Business benefit:** better outreach accuracy.

### 2) Email-based identity validation

- **Trigger:** inbound message from unknown sender.
- **Actions used:** `find_contact_by_email`, `get_contact`.
- **Outcome:** sender identity resolved.
- **Business benefit:** improved trust and context.

### 3) Phone-based contact verification

- **Trigger:** user has phone number but no full profile.
- **Actions used:** `find_contact_by_phone`.
- **Outcome:** matched contact or identified gap.
- **Business benefit:** faster routing to the right person.

### 4) Duplicate-safe contact creation

- **Trigger:** new lead discovered.
- **Actions used:** `upsert_contact`.
- **Outcome:** contact created or merged.
- **Business benefit:** cleaner CRM-like hygiene.

### 5) Bulk contact review

- **Trigger:** quarterly contact quality review.
- **Actions used:** `list_contacts`, `get_contact`.
- **Outcome:** validated contact inventory.
- **Business benefit:** stronger relationship data quality.

### 6) Contact profile enrichment

- **Trigger:** user needs role and organization details updated.
- **Actions used:** `update_contact`.
- **Outcome:** enriched profile record.
- **Business benefit:** better personalization in communication.

### 7) New stakeholder onboarding

- **Trigger:** project introduces new external partner.
- **Actions used:** `create_contact`.
- **Outcome:** stakeholder profile created.
- **Business benefit:** faster collaboration start.

### 8) Obsolete contact cleanup

- **Trigger:** record no longer relevant.
- **Actions used:** `delete_contact`.
- **Outcome:** stale entry removed.
- **Business benefit:** reduced data clutter and misrouting.

### 9) Relationship map preparation

- **Trigger:** leadership asks for key stakeholder list.
- **Actions used:** `search_contacts`, `list_contacts`.
- **Outcome:** relevant contact subset assembled.
- **Business benefit:** quicker executive briefing preparation.

### 10) Contact consistency assurance

- **Trigger:** data appears inconsistent across sources.
- **Actions used:** `find_contact_by_email`, `find_contact_by_phone`, `upsert_contact`.
- **Outcome:** merged and corrected master record.
- **Business benefit:** higher reliability for relationship workflows.
