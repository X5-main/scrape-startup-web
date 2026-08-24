(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d06d2c8d-5d24-4a7d-904b-c00a3ef1e484`,e._sentryDebugIdIdentifier=`sentry-dbid-d06d2c8d-5d24-4a7d-904b-c00a3ef1e484`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{n as m}from"./JPsrybyr.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={description:`Connect an identity provider to Modal via SCIM integration.`,toc:[{depth:1,value:`SCIM Integration`,id:`scim-integration`,children:[{depth:2,value:`Connecting an IdP`,id:`connecting-an-idp`,children:[{depth:3,value:`Step 1: Generate a SCIM token`,id:`step-1-generate-a-scim-token`},{depth:3,value:`Step 2: IdP Configuration`,id:`step-2-idp-configuration`}]},{depth:2,value:`Managing Tokens`,id:`managing-tokens`},{depth:2,value:`Troubleshooting`,id:`troubleshooting`}]}],rawContent:`# SCIM Integration

<Callout variant="gated-feature">
SCIM support is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.
</Callout>

<Callout variant="beta" />

[SCIM (System for Cross-domain Identity Management)](https://datatracker.ietf.org/doc/html/rfc7643) is a protocol that Identity Providers (IdPs) can use to automate user management in connected apps.

Modal supports SCIM for automatic provisioning and deprovisioning of users.

## Connecting an IdP

### Step 1: Generate a SCIM token

1. Sign in to https://modal.com and visit your [Workspace Management](/settings/workspace-management/identity-and-provisioning) page's \`Identity and Provisioning\` tab. If SCIM is enabled for your Workspace, there will be a "SCIM Tokens" section on the page below the SSO configuration settings. If you do not see a section for SCIM tokens, contact Modal support about enabling SCIM support for your Workspace.
2. Click on "New SCIM Token" then "Create Token".
3. A new token will be generated and displayed to you. Copy the value from the "Token Secret" box and store it somewhere secure. You can also copy the exact url that the IdP will require to integrate with your Modal Workspace. Once you click "Done", you will not be able to view the token secret again and will have to generate a new one if you can't otherwise access it.

### Step 2: IdP Configuration

Exact configuration steps will vary by IdP. Your IdP will require you to provide at least a SCIM url (Which will be of the form \`https://modal.com/api/<your-workspace>/scim/v2\`) and the token generated in step 1.

Settings for common IdP integration configuration fields are listed below.

| Configuration Setting                | Modal Supported | Value                                            | Notes                                      |
| ------------------------------------ | --------------- | ------------------------------------------------ | ------------------------------------------ |
| SCIM Version                         | Yes             | 2                                                |
| SCIM Base URL                        | Yes             | \`https://modal.com/api/<your-workspace>/scim/v2\` |
| Scim Authorization Method            | Yes             | Bearer Token                                     |
| Supports Pagination                  | Yes             |                                                  |
| Supports Groups                      | No              |                                                  | Group support will be added in the future. |
| Create & Delete Groups               | No              |                                                  | Group support will be added in the future. |
| Use PATCH to edit Groups             | No              |                                                  | Group support will be added in the future. |
| Generate temporary password          | No              |                                                  |
| Username to use for account creation | Yes             | Email address                                    |

The IdP may also ask you to specify which user attributes are supported.

| SCIM user attribute | Modal Supported | Notes                                      |
| ------------------- | --------------- | ------------------------------------------ |
| externalId          | Yes             |                                            |
| userName            | Yes             |                                            |
| displayName         | Yes             |                                            |
| familyName          | Yes             |                                            |
| givenName           | Yes             |                                            |
| emails              | No              | Primary email is set in the userName field |
| active              | Yes             |                                            |
| addresses           | No              |                                            |
| profileUrl          | No              |                                            |

## Managing Tokens

Token management is restricted to only workspace owners and managers.

Up to two SCIM tokens may be active at any time. It may be useful to generate a second token to facilitate seamless token rotation - a workspace admin can generate a new token, use it to replace the old one in the connected IdP, and finally revoke the old token to ensure that no updates are dropped during the rotation process. Except during the process of rotation we recommend having only one SCIM token active at a time as a security best practice.

## Troubleshooting

If your IdP indicates that it is unable to authenticate with Modal, first double check that the token was copied correctly - the full token will have the form \`si-XXXXXXXXXXXXXXXXXXXXXX:ss-XXXXXXXXXXXXXXXXXXXXXX\`.

If you experience any issues with or have any questions about SCIM integration, please reach out via [Slack](/slack) or email us at [support@modal.com](mailto:support@modal.com).
`,meta:{title:`SCIM Integration`,description:`Connect an identity provider to Modal via SCIM integration.`}},{description:v,toc:y,rawContent:b,meta:x}=_,S=t(`SCIM support is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.`,1),C=t(`<thead><tr><th>Configuration Setting</th><th>Modal Supported</th><th>Value</th><th>Notes</th></tr></thead> <tbody><tr><td>SCIM Version</td><td>Yes</td><td>2</td><td></td></tr><tr><td>SCIM Base URL</td><td>Yes</td><td><code>https://modal.com/api/&lt;your-workspace&gt;/scim/v2</code></td><td></td></tr><tr><td>Scim Authorization Method</td><td>Yes</td><td>Bearer Token</td><td></td></tr><tr><td>Supports Pagination</td><td>Yes</td><td></td><td></td></tr><tr><td>Supports Groups</td><td>No</td><td></td><td>Group support will be added in the future.</td></tr><tr><td>Create & Delete Groups</td><td>No</td><td></td><td>Group support will be added in the future.</td></tr><tr><td>Use PATCH to edit Groups</td><td>No</td><td></td><td>Group support will be added in the future.</td></tr><tr><td>Generate temporary password</td><td>No</td><td></td><td></td></tr><tr><td>Username to use for account creation</td><td>Yes</td><td>Email address</td><td></td></tr></tbody>`,1),w=t(`<thead><tr><th>SCIM user attribute</th><th>Modal Supported</th><th>Notes</th></tr></thead> <tbody><tr><td>externalId</td><td>Yes</td><td></td></tr><tr><td>userName</td><td>Yes</td><td></td></tr><tr><td>displayName</td><td>Yes</td><td></td></tr><tr><td>familyName</td><td>Yes</td><td></td></tr><tr><td>givenName</td><td>Yes</td><td></td></tr><tr><td>emails</td><td>No</td><td>Primary email is set in the userName field</td></tr><tr><td>active</td><td>Yes</td><td></td></tr><tr><td>addresses</td><td>No</td><td></td></tr><tr><td>profileUrl</td><td>No</td><td></td></tr></tbody>`,1),T=t(`<!> <!> <!> <p><!> is a protocol that Identity Providers (IdPs) can use to automate user management in connected apps.</p> <p>Modal supports SCIM for automatic provisioning and deprovisioning of users.</p> <!> <!> <ol><li>Sign in to <!> and visit your <!> page’s <code>Identity and Provisioning</code> tab. If SCIM is enabled for your Workspace, there will be a “SCIM Tokens” section on the page below the SSO configuration settings. If you do not see a section for SCIM tokens, contact Modal support about enabling SCIM support for your Workspace.</li> <li>Click on “New SCIM Token” then “Create Token”.</li> <li>A new token will be generated and displayed to you. Copy the value from the “Token Secret” box and store it somewhere secure. You can also copy the exact url that the IdP will require to integrate with your Modal Workspace. Once you click “Done”, you will not be able to view the token secret again and will have to generate a new one if you can’t otherwise access it.</li></ol> <!> <p>Exact configuration steps will vary by IdP. Your IdP will require you to provide at least a SCIM url (Which will be of the form <code>https://modal.com/api/&lt;your-workspace&gt;/scim/v2</code>) and the token generated in step 1.</p> <p>Settings for common IdP integration configuration fields are listed below.</p> <!> <p>The IdP may also ask you to specify which user attributes are supported.</p> <!> <!> <p>Token management is restricted to only workspace owners and managers.</p> <p>Up to two SCIM tokens may be active at any time. It may be useful to generate a second token to facilitate seamless token rotation - a workspace admin can generate a new token, use it to replace the old one in the connected IdP, and finally revoke the old token to ensure that no updates are dropped during the rotation process. Except during the process of rotation we recommend having only one SCIM token active at a time as a security best practice.</p> <!> <p>If your IdP indicates that it is unable to authenticate with Modal, first double check that the token was copied correctly - the full token will have the form <code>si-XXXXXXXXXXXXXXXXXXXXXX:ss-XXXXXXXXXXXXXXXXXXXXXX</code>.</p> <p>If you experience any issues with or have any questions about SCIM integration, please reach out via <!> or email us at <!>.</p>`,1);function E(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=T(),h=s(o);p(h,{id:`scim-integration`,children:(e,t)=>{l(),i(e,r(`SCIM Integration`))},$$slots:{default:!0}});var _=c(h,2);u(_,{variant:`gated-feature`,children:(e,t)=>{l();var n=S();l(4),i(e,n)},$$slots:{default:!0}});var v=c(_,2);u(v,{variant:`beta`});var y=c(v,2);g(e(y),{href:`https://datatracker.ietf.org/doc/html/rfc7643`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SCIM (System for Cross-domain Identity Management)`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,4);d(b,{id:`connecting-an-idp`,children:(e,t)=>{l(),i(e,r(`Connecting an IdP`))},$$slots:{default:!0}});var x=c(b,2);f(x,{id:`step-1-generate-a-scim-token`,children:(e,t)=>{l(),i(e,r(`Step 1: Generate a SCIM token`))},$$slots:{default:!0}});var E=c(x,2),D=e(E),O=c(e(D));g(O,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://modal.com`))},$$slots:{default:!0}}),g(c(O,2),{href:`/settings/workspace-management/identity-and-provisioning`,children:(e,t)=>{l(),i(e,r(`Workspace Management`))},$$slots:{default:!0}}),l(3),n(D),l(4),n(E);var k=c(E,2);f(k,{id:`step-2-idp-configuration`,children:(e,t)=>{l(),i(e,r(`Step 2: IdP Configuration`))},$$slots:{default:!0}});var A=c(k,6);m(A,{children:(e,t)=>{var n=C();l(2),i(e,n)},$$slots:{default:!0}});var j=c(A,4);m(j,{children:(e,t)=>{var n=w();l(2),i(e,n)},$$slots:{default:!0}});var M=c(j,2);d(M,{id:`managing-tokens`,children:(e,t)=>{l(),i(e,r(`Managing Tokens`))},$$slots:{default:!0}});var N=c(M,6);d(N,{id:`troubleshooting`,children:(e,t)=>{l(),i(e,r(`Troubleshooting`))},$$slots:{default:!0}});var P=c(N,4),F=c(e(P));g(F,{href:`/slack`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),g(c(F,2),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(P),i(t,o)},$$slots:{default:!0}}))}export{E as default,_ as metadata};
//# sourceMappingURL=C6_mP-U42.js.map
