> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List a run's artifacts



## OpenAPI

````yaml /api-reference/openapi.json get /v1/runs/{id}/artifacts
openapi: 3.0.3
info:
  title: Naïve API
  version: 2.0.0
  description: >-
    Naïve gives every AI agent its own governed real-world agent profile — a
    verified business identity (EIN/formation), a spend-capped card, an inbox
    and phone number, and a place to run — provisioned per end-user, governed on
    every action, and instantly revocable. This API exposes agent profile
    provisioning + the underlying regulated primitives (identity, money, comms)
    and the governance gateway.


    ## Authentication


    All endpoints (except `/health`, `/skill.md`, `/register.md`, and the
    `/v1/auth/*` onboarding routes) require a workspace API key:


    ```

    Authorization: Bearer nv_sk_live_...

    ```


    Many control-plane endpoints also accept a browser session cookie
    (`naive_session`) for the dashboard.


    ## Per-user data plane


    Nearly every primitive is available at two mount points:


    - **Company-level** — e.g. `GET /v1/email/inboxes`, scoped to the account's
    default agentProfile.

    - **Per-user** — e.g. `GET /v1/users/{user_id}/email/inboxes`, scoped to a
    specific end-user (`tenant_user`). Pass `default` or `me` as `{user_id}` to
    target the account's own default agentProfile.


    This spec documents the canonical company-level path for each primitive plus
    the per-user-only primitives (connections, vault, sessions, browser). Every
    per-user variant accepts the same request/response shapes.


    ## Errors


    All errors share one envelope:


    ```json

    {
      "error": {
        "code": "invalid_input",
        "message": "Human readable description",
        "hint": "Actionable next step for the agent"
      }
    }

    ```


    `code` maps 1:1 to the HTTP status. Rate-limit responses include a
    `Retry-After` header.
servers:
  - url: https://api.usenaive.ai
    description: Production
  - url: http://localhost:3101
    description: Local development
security:
  - bearerAuth: []
tags:
  - name: Auth & Onboarding
    description: Registration, login, sessions, and API key management.
  - name: Identity
    description: Authenticated agent identity, resources, and credit balance.
  - name: AgentProfiles
    description: >-
      Provision and govern a real-world agent profile per tenant (identity,
      money, comms, runtime). Provisioning is idempotent and revoke is absolute.
  - name: Projects
    description: >-
      Projects — the scope between an organization and its account kits and
      child projects. Every organization has a default project that un-projected
      calls resolve to.
  - name: Users
    description: Tenant users (each tenant's agent profile subject).
  - name: AccountKits
    description: Reusable primitive + connection policy bundles assigned to users.
  - name: Connections
    description: Composio toolkit connections (OAuth / API key) per user.
  - name: Vault
    description: Envelope-encrypted per-user secret storage.
  - name: Logs
    description: Activity audit events.
  - name: Approvals
    description: Human-in-the-loop approval queue for agent actions.
  - name: Sessions
    description: Revocable MCP session tokens scoped to a tenant user.
  - name: Orchestration
    description: CEO runs, tasks, objectives, employees, cron, and memory.
  - name: Templates
    description: Business templates that scaffold agents, tasks, and apps.
  - name: Template Apps
    description: Installable template app instances.
  - name: Apps
    description: Deployable apps (Vercel + Supabase) with secrets, domains, and proxies.
  - name: Compute
    description: ECS/Fargate compute resources (services, jobs, schedules).
  - name: Queue
    description: SQS-backed message queues.
  - name: Mobile
    description: >-
      Cloud mobile emulators/devices (Mobilerun): provision phones, run agent
      tasks, stream live, and reach the whole device API via a wildcard.
  - name: Sandbox
    description: >-
      Disposable micro-VM code sandboxes — exec, files, ports, checkpoint, fork,
      park/sleep & resume. Usage billed from credits (observed CPU/memory/disk +
      a one-time creation fee).
  - name: Files
    description: Read and download files from a company container workspace.
  - name: Dashboard
    description: Dashboard aggregates and credit usage.
  - name: Playground
    description: Claude Agent SDK chat scoped to the default tenant user.
  - name: Domains
    description: Domain registration, DNS records, and zone editing.
  - name: Billing
    description: Company subscription, plans, credit packs, and transactions.
  - name: Plans
    description: Developer-defined tenant plan definitions.
  - name: Tenant Billing
    description: Per-tenant-user subscription and usage.
  - name: Jobs
    description: Async job status and cancellation.
  - name: Status
    description: Account overview and usage.
  - name: Events
    description: Server-Sent Events stream of live company events.
  - name: Webhooks
    description: Webhook subscription management.
  - name: Email
    description: Inboxes and inbound/outbound email.
  - name: Phone
    description: Phone numbers and SMS (10DLC).
  - name: Social
    description: Social account connections and posts.
  - name: Verification
    description: KYC identity verification of company members.
  - name: Images
    description: Image generation, stock search, and models.
  - name: Video
    description: Video generation and models.
  - name: Clips
    description: AI video clipping.
  - name: Media
    description: Company media asset library.
  - name: Search
    description: Web search, URL reading, and research.
  - name: LLM
    description: OpenAI-compatible chat completions and models.
  - name: Audio
    description: >-
      Speech routing — transcription, speech synthesis, and native audio
      conversations.
  - name: Browser
    description: Agent-driven and human browser sessions.
  - name: Cards
    description: Virtual payment cards and Stripe Issuing.
  - name: Wallet
    description: >-
      Per-agent crypto wallets (USDC on Base): balance, funding, transfers,
      spend policy, and sweep. Mounted per-user only. Requires the opt-in
      `payments` primitive.
  - name: Payments
    description: >-
      x402 buy-side payments: quote a paywalled resource, pay for it from the
      agent's wallet, and read receipts. Requires the opt-in `payments`
      primitive.
  - name: Trading
    description: Brokerage (Alpaca) connections, orders, and positions.
  - name: Formation
    description: LLC formation via Doola.
  - name: SEO
    description: DataForSEO keywords, backlinks, and Labs (passthrough).
  - name: App Data
    description: App store (Google Play / Apple) data (passthrough).
  - name: Business Data
    description: >-
      Reviews & listings — Google Business, Trustpilot, TripAdvisor and travel
      (passthrough). Reputation and place intelligence; for the company itself
      see Company Data.
  - name: People
    description: >-
      B2B people search and work-contact enrichment. OPT-IN: disabled until an
      AccountKit enables `people`, with one exception — `GET /v1/people/terms`
      answers before you enable it, because it is what you read to decide.
      Metered on 3x the provider run's real spend; a no-match is billed too,
      because the run still happened. Not a consumer report — see GET
      /v1/people/terms and ToS Section 18.
  - name: Company Data
    description: >-
      Private-company firmographics, funding, investors, headcount and
      technology stack. Distinct from Business Data (Reviews & Listings), which
      covers reputation, and from /v1/companies, which is the tenant control
      plane.
  - name: Social Data
    description: >-
      READ public posts, comments and engagement on X, Reddit, Bluesky and
      Hacker News. Distinct from Social, which connects accounts and publishes.
      Reddit is asynchronous only — POST /v1/social-data/tasks.
  - name: AEO
    description: 'Answer-engine optimization: LLM responses, scraper, and mentions.'
  - name: E-commerce
    description: Google Shopping and Amazon product data (passthrough).
  - name: Runtime
    description: >-
      The durable runtime: teams, boards, runs, transcripts and the honesty
      report.
  - name: Governance
    description: >-
      Policy, grants, limits, spend, attestations and the resolved connection
      policy.
  - name: Brain
    description: Beliefs, lessons, levels and retention.
  - name: Deployments
    description: Application deployments.
  - name: Triggers
    description: Inbound triggers and hooks.
  - name: Vetta
    description: Inbound routes the durable runtime calls.
  - name: Voice
    description: Voice agents, cloning and consent.
  - name: Support
    description: >-
      Platform support: tickets from developers to the naive team, answered by
      the hosted support agent with human escalation. The /admin surface is
      restricted to naive-team session emails (SUPPORT_ADMIN_EMAILS).
  - name: Agents
    description: >-
      Long-horizon agents: create, configure, send work, read the task and event
      log, deliverables, spend and webhooks.
  - name: Organization
    description: 'Organization membership: members, invitations and leaving.'
  - name: Company
    description: 'Company membership: members, invitations and leaving.'
  - name: Cron
    description: >-
      Scheduled internal jobs invoked by the platform's own timer, not by
      customers.
paths:
  /v1/runs/{id}/artifacts:
    get:
      tags:
        - Orchestration
      summary: List a run's artifacts
      parameters:
        - name: id
          in: path
          required: true
          description: Agent run id.
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: OK.
          content:
            application/json:
              schema:
                type: object
                properties:
                  artifacts:
                    type: array
                    items:
                      type: object
                      description: Serialised run artifact (formatArtifact).
                      properties:
                        id:
                          type: string
                          format: uuid
                        run_id:
                          type: string
                          format: uuid
                          nullable: true
                        task_id:
                          type: string
                          format: uuid
                          nullable: true
                        kind:
                          type: string
                          enum:
                            - pr
                            - deploy
                            - report
                            - doc
                            - reply
                            - dataset
                            - image
                            - video
                            - code
                            - receipt
                            - other
                        title:
                          type: string
                        uri:
                          type: string
                          nullable: true
                        content_hash:
                          type: string
                          nullable: true
                        status:
                          type: string
                          enum:
                            - created
                            - reviewed
                            - published
                            - failed
                            - deleted
                        metadata:
                          type: object
                          additionalProperties: true
                          nullable: true
                        created_at:
                          type: string
                          format: date-time
                        updated_at:
                          type: string
                          format: date-time
                      required:
                        - id
                        - kind
                        - title
                        - status
                        - created_at
                        - updated_at
                  count:
                    type: integer
                required:
                  - artifacts
                  - count
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
      deprecated: true
components:
  responses:
    Unauthorized:
      description: Missing or invalid credentials.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Resource not found.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  schemas:
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              description: Canonical error kind, maps 1:1 to the HTTP status.
              enum:
                - unauthorized
                - forbidden
                - insufficient_credits
                - billing_blocked
                - llm_routing_requires_payment
                - rate_limited
                - invalid_inbox
                - resource_not_found
                - not_found
                - invalid_input
                - provider_error
                - job_not_ready
                - duplicate_request
                - duplicate_record
                - account_not_provisioned
                - feature_not_configured
                - not_configured
                - compliance_pending
                - payment_rejected
                - wallet_not_configured
                - internal_error
            message:
              type: string
            hint:
              type: string
            reason:
              type: string
              description: Optional granular reason code.
            block_reason:
              type: string
              description: >-
                Why this company may not spend. The first five accompany
                `billing_blocked` and stop every primitive.
                `llm_routing_requires_payment` differs in both directions: it
                stops exactly one primitive, and it is also the `code` — the
                same string in both fields on purpose, so a consumer that
                switches on the reason needs no mapping from the code. It means
                the balance is entirely free credit (the signup grant, or credit
                that was comped) and LLM routing is the one primitive free
                credit cannot buy. Cleared by buying credit (`POST
                /v1/billing/topup`) or subscribing (`POST
                /v1/billing/subscribe`); never by verifying an email and never
                by being granted more free credit.
              enum:
                - no_subscription
                - trial_expired
                - subscription_cancelled
                - subscription_past_due
                - credits_exhausted
                - llm_routing_requires_payment
            credit_kind:
              type: string
              description: >-
                Present on `llm_routing_requires_payment`: the kind of credit
                the balance is made of, and therefore why it does not qualify.
                `trial` means the signup grant or a comped grant.
              enum:
                - trial
            balance:
              type: number
              description: >-
                The company's credit balance at the moment of the refusal, in
                credits. Carried on `llm_routing_requires_payment` precisely
                because it is NOT the problem — see `balance_note`.
            balance_note:
              type: string
              description: >-
                Says in words that the balance is not what was refused. Without
                it the response reads as a contradiction ("I hold credit and you
                refused me") and the obvious next move — collect more free
                credit — is the one move that provably cannot work.
            actions:
              type: object
              additionalProperties:
                type: string
              description: >-
                The calls that clear this refusal, keyed by a stable id
                (`topup`, `subscribe`, `view_plans`). Each value is a method and
                path. They start a payment, so they are a human's to run.
          required:
            - code
            - message
      required:
        - error
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: nv_sk_live_...
      description: Workspace API key. Create one via the dashboard or `POST /v1/auth/keys`.

````