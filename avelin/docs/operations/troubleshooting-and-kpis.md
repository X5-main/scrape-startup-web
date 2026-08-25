# Troubleshooting and KPIs

## Purpose

This guide provides a practical troubleshooting model and KPI framework for operating AVELIN products in production business environments.

## Operating Goals

- Restore critical business workflows quickly and safely
- Minimize repeated incidents through evidence-based root-cause correction
- Measure platform performance and governance quality with consistent KPIs
- Improve decision quality for operations and leadership reviews

## Incident Severity Classification

| Severity | Business Impact | Initial Response Priority |
| --- | --- | --- |
| SEV-1 | Platform-wide outage or critical workflow stoppage | Immediate cross-functional response |
| SEV-2 | Major degradation for high-value workflows | Rapid containment and owner escalation |
| SEV-3 | Localized functionality degradation | Planned remediation with active monitoring |
| SEV-4 | Minor issue with limited user impact | Backlog correction and trend tracking |

## Troubleshooting Workflow

## Step 1: Confirm Business Impact and Severity

- Identify affected user groups and workflows
- Classify impact: localized, functional, or platform-wide
- Assign incident severity based on business-criticality impact

## Step 2: Identify Affected Product Area

- AVELIN-GPT (interface and user interaction)
- AVELIN-API (cascading and orchestration)
- AVELIN-MCP (integration superpowers)
- Y-RAY (search and analysis intelligence)
- Trust and perimeter modules (access and policy controls)

## Step 3: Validate Health and Signals

- Check product readiness and continuity status
- Inspect incident diagnostics and repeated error patterns
- Confirm dependency and policy integrity for the failing path
- Verify whether issue pattern is isolated or repeating across similar workflows

## Step 4: Stabilize and Verify

- Apply targeted remediation by product area
- Avoid broad resets when precision recovery is possible
- Validate end-to-end business workflow restoration
- Confirm business owner acceptance before incident closure

## Step 5: Capture Root Cause and Prevention

- Document direct cause, contributing factors, and detection gaps
- Define prevention actions with owners and deadlines
- Feed learnings into runbooks, guardrails, and KPI reviews

## Common Issue Matrix

| Symptom | Likely Product Area | First Checks | Typical Remediation |
| --- | --- | --- | --- |
| User cannot access workspace | Perimeter or trust layer | Access policy, identity path, secure entry status | Restore access policy path and verify role controls |
| Slow or unstable responses | AVELIN-API | Cascading health, token pressure, **Cross-Model MoE** tier selection, AA Index tier pressure | Rebalance cascading policy and restore orchestration health |
| Actions not executing | AVELIN-MCP | Connector authorization and execution status | Revalidate integration permissions and action pathways |
| Research output lacks depth | Y-RAY | Retrieval scope and evidence path quality | Expand retrieval depth and rerun evidence-first synthesis |
| Workflow interruptions under load | Cross-product | Critical-path saturation and priority handling | Apply stabilization thresholds and protect key workflows |
| Unexpected policy blocks | Trust and governance layer | Access role path, policy exception state, workflow sensitivity class | Correct policy mapping or exception scope and retest controlled path |
| Cost spike without quality gain | AVELIN-API and governance | Cascading policy alignment, workload tagging, **AA Index** tier distribution, **Cloud Token Factory** efficiency | Rebalance cascading policies and tighten governance thresholds — verify optimal tier selection (ultra: 55, pro: 53, architect: 52, plus: 49, coding: 42, agentic: 67, fast: 47) |

## Incident Closure Checklist

- Service health restored for affected workflow paths
- Business owner confirms workflow usability
- Root-cause statement documented
- Prevention actions assigned and tracked
- Relevant dashboards updated with incident classification

## KPI Framework

## Reliability KPIs

- Availability by product area
- Mean time to detect (MTTD)
- Mean time to recover (MTTR)
- Incident recurrence rate
- Critical-workflow restoration time

## Productivity KPIs

- Time-to-complete high-value workflows
- Weekly active users by business function
- Action completion rate from AI-assisted workflows
- User confidence in response usefulness
- Cross-team handoff success rate

## Intelligence Quality KPIs

- Citation-backed output ratio for Y-RAY workflows
- Debate Mode usage for complex decisions
- Rework rate for strategic outputs
- Corporate Brain reuse rate across teams
- Decision-owner confidence for high-impact workflows
- **Cross-Model MoE** cascading quality — AA Index tier alignment (ultra: 55, pro: 53, architect: 52, plus: 49, coding: 42, agentic: 67, fast: 47)
- Cost efficiency vs premium alternatives — Intelligence up to 85%, Coding up to 86%, Agentic up to 87% savings

## Governance and Risk KPIs

- Trust policy violation trend
- Access-governance compliance rate
- Token governance efficiency trend
- Audit readiness score
- Policy exception aging and closure rate
- Data-residency conformance for sensitive workflows

## KPI Interpretation Guide

### Reliability Signals

- Rising MTTD indicates detection weakness and monitoring gaps
- Rising MTTR indicates escalation or recovery execution issues
- High recurrence indicates root-cause correction is incomplete

### Productivity Signals

- Falling completion time with stable quality indicates healthy adoption
- Faster throughput with rising rework indicates quality controls need tuning
- Low handoff success indicates cross-team workflow design problems

### Governance Signals

- Growing policy exceptions indicate control friction or policy mismatch
- Poor audit readiness indicates evidence gaps in daily operations
- High violation trend indicates need for trust-control reinforcement

## Reporting Cadence

| Cadence | Focus | Primary Audience |
| --- | --- | --- |
| Weekly | Reliability and urgent risk indicators | Operations and service owners |
| Monthly | Productivity, intelligence quality, governance trends | Platform, security, and business leads |
| Quarterly | Strategic value realization and maturity progression | Executive leadership and governance boards |

## Dashboard Design Suggestions

- Separate real-time incident dashboard from monthly trend dashboard
- Show KPI trend direction, not only current values
- Segment KPIs by business function for targeted corrective action
- Keep one shared executive view for cross-product outcomes

## Related Documentation

- [`security-reliability-governance.md`](security-reliability-governance.md)
- [`deployment-and-administration.md`](deployment-and-administration.md)
- [`../benefits/operational-benefits.md`](../benefits/operational-benefits.md)
