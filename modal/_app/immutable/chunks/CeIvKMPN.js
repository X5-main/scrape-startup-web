(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8d77504e-ca27-42dd-92b1-5cb9a2dbac04`,e._sentryDebugIdIdentifier=`sentry-dbid-8d77504e-ca27-42dd-92b1-5cb9a2dbac04`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Webhooks`,id:`webhooks`,children:[{depth:2,value:`What you get`,id:`what-you-get`},{depth:2,value:`Delivery`,id:`delivery`,children:[{depth:3,value:`Example payload`,id:`example-payload`}]},{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Authentication`,id:`authentication`},{depth:2,value:`Expected responses`,id:`expected-responses`},{depth:2,value:`Security considerations`,id:`security-considerations`},{depth:2,value:`Lifecycle and reliability`,id:`lifecycle-and-reliability`},{depth:2,value:`Event schema`,id:`event-schema`}]}],rawContent:`---
---

# Webhooks

Workspace Webhooks let your organization receive security and operations events from Modal in real-time.

## What you get

We currently deliver fraud detection events for objects in your Workspace. Each delivery contains an array of events. We will evolve this interface over time to include additional event types such as deployment events, resource usage alerts, and more.

## Delivery

Modal delivers events to each configured destination using HTTP POST requests. Every request includes a JSON body and the headers \`Content-Type: application/json\` and \`Authorization: Bearer <token>\`, where the token is an OIDC JWT. Deliveries are batched; a single request can contain up to 100 events per destination, and each configured URL receives the same batch. Requests time out after 5 seconds. If a delivery fails, retries may occur; design your handler to be idempotent.

### Example payload

\`\`\`json
{
  "events": [
    {
      "event_type": "fraud_detection",
      "payload": {
        "object_type": "SANDBOX",
        "object_id": "sb-abcd",
        "detection_type": "binary_name",
        "metadata": {
          "detection_type": "binary_name",
          "binary_name": "cryptominer"
        },
        "action": "terminate"
      },
      "timestamp": "1730000000.123"
    },
    {
      "event_type": "fraud_detection",
      "payload": {
        "object_type": "FUNCTION",
        "object_id": "fn-1234",
        "detection_type": "outbound_conn",
        "metadata": {
          "detection_type": "outbound_conn",
          "connection_destination_ip": "1.1.1.1"
        },
        "action": "warn"
      },
      "timestamp": "1730000001.456"
    }
  ]
}
\`\`\`

## Setup

1. Navigate to [the Webhooks settings page](/settings/webhooks) in the Modal console.
2. Add one or more Webhook URLs for your Workspace.
3. Save. Modal will begin delivering events to all configured URLs.

Note that each configured URL receives the same batched events. Use this to
test new handling logic without disrupting production delivery.

## Authentication

Each request includes an OIDC Bearer token in the \`Authorization\` header. Validate this token as described in the [OIDC integration guide](/docs/guide/oidc-integration) using our JWKS and your preferred JOSE library.

Token format for Webhooks:

- Subject (\`sub\`): \`modal:workspace:{workspace_id}:webhook:{webhook_id}\`
- Claims:
  - \`workspace_id\`: the Modal Workspace ID
  - \`webhook_id\`: the configured Webhook ID

Example decoded JWT payload (fields omitted for brevity):

\`\`\`json
{
  "iss": "https://modal.com/oidc",
  "sub": "modal:workspace:ws_123:webhook:wh_456",
  "workspace_id": "ws_123",
  "webhook_id": "wh_456",
  "iat": 1730000000,
  "exp": 1730000300
}
\`\`\`

## Expected responses

- Return a 2xx status code on success. We consider any non-error 2xx response a successful delivery.
- Return a non-2xx to signal failure; failed deliveries may be retried according to system policy.

## Security considerations

- Validate the OIDC token per the [OIDC integration guide](/docs/guide/oidc-integration).
- Authorize based on \`workspace_id\` and \`webhook_id\` if you scope endpoints per destination.

## Lifecycle and reliability

- Deliveries are best-effort with at-least-once semantics; handle duplicates idempotently.
- Delivery is ordered per batch but not globally ordered across all events.
- We periodically refresh Webhook destinations; expect changes to take effect quickly.

## Event schema

The request body is a JSON object with a single \`events\` array. Each element has \`event_type\` (currently only \`fraud_detection\`, with more types coming in the future), \`timestamp\`, and a \`payload\` whose shape depends on the event type.

\`\`\`json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "WebhookEvents",
  "type": "object",
  "properties": {
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "event_type": {
            "type": "string",
            "enum": ["fraud_detection", "test"],
            "description": "The type of webhook event. Production deliveries are currently fraud_detection; console-triggered tests use test"
          },
          "timestamp": {
            "type": "string",
            "description": "Unix timestamp (as string) when the event occurred"
          },
          "payload": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "object_type": {
                    "type": "string",
                    "enum": ["SANDBOX", "FUNCTION", "IMAGE_BUILD"]
                  },
                  "object_id": {
                    "type": "string"
                  },
                  "detection_type": {
                    "type": "string",
                    "enum": ["binary_name", "outbound_conn"]
                  },
                  "metadata": {
                    "oneOf": [
                      {
                        "type": "object",
                        "properties": {
                          "detection_type": { "const": "binary_name" },
                          "binary_name": { "type": "string" }
                        },
                        "required": ["detection_type", "binary_name"],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "detection_type": { "const": "outbound_conn" },
                          "connection_destination_ip": {
                            "type": "string",
                            "format": "ipv4"
                          }
                        },
                        "required": [
                          "detection_type",
                          "connection_destination_ip"
                        ],
                        "additionalProperties": false
                      }
                    ]
                  },
                  "action": {
                    "type": "string",
                    "enum": ["warn", "terminate"]
                  }
                },
                "required": [
                  "object_type",
                  "object_id",
                  "detection_type",
                  "metadata",
                  "action"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "message": { "type": "string" }
                },
                "required": ["message"],
                "additionalProperties": true
              }
            ]
          }
        },
        "required": ["event_type", "timestamp", "payload"],
        "additionalProperties": false
      }
    }
  },
  "required": ["events"],
  "additionalProperties": false
}
\`\`\`
`,meta:{title:`Webhooks`,description:`Workspace Webhooks let your organization receive security and operations events from Modal in real-time.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>Workspace Webhooks let your organization receive security and operations events from Modal in real-time.</p> <!> <p>We currently deliver fraud detection events for objects in your Workspace. Each delivery contains an array of events. We will evolve this interface over time to include additional event types such as deployment events, resource usage alerts, and more.</p> <!> <p>Modal delivers events to each configured destination using HTTP POST requests. Every request includes a JSON body and the headers <code>Content-Type: application/json</code> and <code>Authorization: Bearer &lt;token&gt;</code>, where the token is an OIDC JWT. Deliveries are batched; a single request can contain up to 100 events per destination, and each configured URL receives the same batch. Requests time out after 5 seconds. If a delivery fails, retries may occur; design your handler to be idempotent.</p> <!> <!> <!> <ol><li>Navigate to <!> in the Modal console.</li> <li>Add one or more Webhook URLs for your Workspace.</li> <li>Save. Modal will begin delivering events to all configured URLs.</li></ol> <p>Note that each configured URL receives the same batched events. Use this to
test new handling logic without disrupting production delivery.</p> <!> <p>Each request includes an OIDC Bearer token in the <code>Authorization</code> header. Validate this token as described in the <!> using our JWKS and your preferred JOSE library.</p> <p>Token format for Webhooks:</p> <ul><li>Subject (<code>sub</code>): <code>modal:workspace:&#123;workspace_id&#125;:webhook:&#123;webhook_id&#125;</code></li> <li>Claims: <ul><li><code>workspace_id</code>: the Modal Workspace ID</li> <li><code>webhook_id</code>: the configured Webhook ID</li></ul></li></ul> <p>Example decoded JWT payload (fields omitted for brevity):</p> <!> <!> <ul><li>Return a 2xx status code on success. We consider any non-error 2xx response a successful delivery.</li> <li>Return a non-2xx to signal failure; failed deliveries may be retried according to system policy.</li></ul> <!> <ul><li>Validate the OIDC token per the <!>.</li> <li>Authorize based on <code>workspace_id</code> and <code>webhook_id</code> if you scope endpoints per destination.</li></ul> <!> <ul><li>Deliveries are best-effort with at-least-once semantics; handle duplicates idempotently.</li> <li>Delivery is ordered per batch but not globally ordered across all events.</li> <li>We periodically refresh Webhook destinations; expect changes to take effect quickly.</li></ul> <!> <p>The request body is a JSON object with a single <code>events</code> array. Each element has <code>event_type</code> (currently only <code>fraud_detection</code>, with more types coming in the future), <code>timestamp</code>, and a <code>payload</code> whose shape depends on the event type.</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`webhooks`,children:(e,t)=>{l(),i(e,r(`Webhooks`))},$$slots:{default:!0}});var g=c(m,4);u(g,{id:`what-you-get`,children:(e,t)=>{l(),i(e,r(`What you get`))},$$slots:{default:!0}});var _=c(g,4);u(_,{id:`delivery`,children:(e,t)=>{l(),i(e,r(`Delivery`))},$$slots:{default:!0}});var v=c(_,4);d(v,{id:`example-payload`,children:(e,t)=>{l(),i(e,r(`Example payload`))},$$slots:{default:!0}});var y=c(v,2);p(y,{code:`%7B%0A%20%20%22events%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22event_type%22%3A%20%22fraud_detection%22%2C%0A%20%20%20%20%20%20%22payload%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22object_type%22%3A%20%22SANDBOX%22%2C%0A%20%20%20%20%20%20%20%20%22object_id%22%3A%20%22sb-abcd%22%2C%0A%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%22binary_name%22%2C%0A%20%20%20%20%20%20%20%20%22metadata%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%22binary_name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%22binary_name%22%3A%20%22cryptominer%22%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22action%22%3A%20%22terminate%22%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%22timestamp%22%3A%20%221730000000.123%22%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22event_type%22%3A%20%22fraud_detection%22%2C%0A%20%20%20%20%20%20%22payload%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22object_type%22%3A%20%22FUNCTION%22%2C%0A%20%20%20%20%20%20%20%20%22object_id%22%3A%20%22fn-1234%22%2C%0A%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%22outbound_conn%22%2C%0A%20%20%20%20%20%20%20%20%22metadata%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%22outbound_conn%22%2C%0A%20%20%20%20%20%20%20%20%20%20%22connection_destination_ip%22%3A%20%221.1.1.1%22%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22action%22%3A%20%22warn%22%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%22timestamp%22%3A%20%221730000001.456%22%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D`,lang:`json`});var x=c(y,2);u(x,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var S=c(x,2),C=e(S);h(c(e(C)),{href:`/settings/webhooks`,children:(e,t)=>{l(),i(e,r(`the Webhooks settings page`))},$$slots:{default:!0}}),l(),n(C),l(4),n(S);var w=c(S,4);u(w,{id:`authentication`,children:(e,t)=>{l(),i(e,r(`Authentication`))},$$slots:{default:!0}});var T=c(w,2);h(c(e(T),3),{href:`/docs/guide/oidc-integration`,children:(e,t)=>{l(),i(e,r(`OIDC integration guide`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,8);p(E,{code:`%7B%0A%20%20%22iss%22%3A%20%22https%3A%2F%2Fmodal.com%2Foidc%22%2C%0A%20%20%22sub%22%3A%20%22modal%3Aworkspace%3Aws_123%3Awebhook%3Awh_456%22%2C%0A%20%20%22workspace_id%22%3A%20%22ws_123%22%2C%0A%20%20%22webhook_id%22%3A%20%22wh_456%22%2C%0A%20%20%22iat%22%3A%201730000000%2C%0A%20%20%22exp%22%3A%201730000300%0A%7D`,lang:`json`});var D=c(E,2);u(D,{id:`expected-responses`,children:(e,t)=>{l(),i(e,r(`Expected responses`))},$$slots:{default:!0}});var O=c(D,4);u(O,{id:`security-considerations`,children:(e,t)=>{l(),i(e,r(`Security considerations`))},$$slots:{default:!0}});var k=c(O,2),A=e(k);h(c(e(A)),{href:`/docs/guide/oidc-integration`,children:(e,t)=>{l(),i(e,r(`OIDC integration guide`))},$$slots:{default:!0}}),l(),n(A),l(2),n(k);var j=c(k,2);u(j,{id:`lifecycle-and-reliability`,children:(e,t)=>{l(),i(e,r(`Lifecycle and reliability`))},$$slots:{default:!0}});var M=c(j,4);u(M,{id:`event-schema`,children:(e,t)=>{l(),i(e,r(`Event schema`))},$$slots:{default:!0}}),p(c(M,4),{code:`%7B%0A%20%20%22%24schema%22%3A%20%22https%3A%2F%2Fjson-schema.org%2Fdraft%2F2020-12%2Fschema%22%2C%0A%20%20%22title%22%3A%20%22WebhookEvents%22%2C%0A%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%22events%22%3A%20%7B%0A%20%20%20%20%20%20%22type%22%3A%20%22array%22%2C%0A%20%20%20%20%20%20%22items%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%20%20%20%20%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22event_type%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22enum%22%3A%20%5B%22fraud_detection%22%2C%20%22test%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22description%22%3A%20%22The%20type%20of%20webhook%20event.%20Production%20deliveries%20are%20currently%20fraud_detection%3B%20console-triggered%20tests%20use%20test%22%0A%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%22timestamp%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22description%22%3A%20%22Unix%20timestamp%20(as%20string)%20when%20the%20event%20occurred%22%0A%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%22payload%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22oneOf%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22object_type%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22enum%22%3A%20%5B%22SANDBOX%22%2C%20%22FUNCTION%22%2C%20%22IMAGE_BUILD%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22object_id%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22enum%22%3A%20%5B%22binary_name%22%2C%20%22outbound_conn%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22metadata%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22oneOf%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%7B%20%22const%22%3A%20%22binary_name%22%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22binary_name%22%3A%20%7B%20%22type%22%3A%20%22string%22%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22required%22%3A%20%5B%22detection_type%22%2C%20%22binary_name%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22additionalProperties%22%3A%20false%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22detection_type%22%3A%20%7B%20%22const%22%3A%20%22outbound_conn%22%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22connection_destination_ip%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22format%22%3A%20%22ipv4%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22required%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22detection_type%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22connection_destination_ip%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22additionalProperties%22%3A%20false%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22action%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22string%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22enum%22%3A%20%5B%22warn%22%2C%20%22terminate%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22required%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22object_type%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22object_id%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22detection_type%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22metadata%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22action%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22additionalProperties%22%3A%20false%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22object%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22properties%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22message%22%3A%20%7B%20%22type%22%3A%20%22string%22%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22required%22%3A%20%5B%22message%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22additionalProperties%22%3A%20true%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22required%22%3A%20%5B%22event_type%22%2C%20%22timestamp%22%2C%20%22payload%22%5D%2C%0A%20%20%20%20%20%20%20%20%22additionalProperties%22%3A%20false%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%2C%0A%20%20%22required%22%3A%20%5B%22events%22%5D%2C%0A%20%20%22additionalProperties%22%3A%20false%0A%7D`,lang:`json`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=CeIvKMPN.js.map
