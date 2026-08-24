(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7baa562f-32cc-4e00-91c8-86e64d4306ad`,e._sentryDebugIdIdentifier=`sentry-dbid-7baa562f-32cc-4e00-91c8-86e64d4306ad`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p,r as m}from"./CPby7b1n.js";import{n as h}from"./JPsrybyr.js";import{t as g}from"./B4L_if842.js";import{t as _}from"./DeWGVqas2.js";var v={description:`Configure custom SAML Single Sign-On for your Modal Workspace with any identity provider.`,toc:[{depth:1,value:`Custom SAML SSO`,id:`custom-saml-sso`,children:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Supported features`,id:`supported-features`},{depth:2,value:`Configuration`,id:`configuration`,children:[{depth:3,value:`Modal SAML settings`,id:`modal-saml-settings`},{depth:3,value:`Required SAML attributes`,id:`required-saml-attributes`},{depth:3,value:`Configuration steps`,id:`configuration-steps`,children:[{depth:4,value:`Step 1: Configure your IdP`,id:`step-1-configure-your-idp`},{depth:4,value:`Step 2: Link your Workspace to your IdP`,id:`step-2-link-your-workspace-to-your-idp`},{depth:4,value:`Step 3: Test the integration`,id:`step-3-test-the-integration`},{depth:4,value:`Step 4: Read this before you enable “Require SSO”`,id:`step-4-read-this-before-you-enable-require-sso`}]}]},{depth:2,value:`Login URL`,id:`login-url`},{depth:2,value:`Troubleshooting`,id:`troubleshooting`,children:[{depth:3,value:`Microsoft Entra SAML`,id:`microsoft-entra-saml`}]}]}],rawContent:`# Custom SAML SSO

<Callout variant="gated-feature">
Custom SAML SSO is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.
</Callout>

If you use an identity provider (IdP) other than Okta, you can configure custom SAML SSO for your Modal Workspace.

For Okta-specific setup, see our [Okta SSO documentation](/docs/guide/okta-sso).

## Prerequisites

- A Workspace that's on an [Enterprise](/pricing) plan
- Admin access to the Workspace you want to configure with SSO
- Admin privileges for your identity provider

## Supported features

- Identity Provider (IdP) initiated SSO
- Service Provider (SP) initiated SSO
- Just-In-Time account provisioning

## Configuration

### Modal SAML settings

Configure your IdP with the following settings:

| Setting   | Value                                             |
| --------- | ------------------------------------------------- |
| Entity ID | \`https://www.modal.com\`                           |
| ACS URL   | \`https://modal.com/api/okta/saml/sso/<workspace>\` |

Replace \`<workspace>\` with your Modal Workspace name.

### Required SAML attributes

Your IdP must send the following SAML attributes:

| Attribute | Description          |
| --------- | -------------------- |
| email     | User's email address |
| firstName | User's first name    |
| lastName  | User's last name     |

### Configuration steps

#### Step 1: Configure your IdP

1. Create a new SAML application in your identity provider
2. Set the Entity ID to \`https://www.modal.com\`
3. Set the ACS URL to \`https://modal.com/api/okta/saml/sso/<workspace>\` (replace \`<workspace>\` with your Workspace name)
4. Configure the required SAML attributes (email, firstName, lastName)
5. Ensure your IdP signs SAML assertions

#### Step 2: Link your Workspace to your IdP

1. Obtain the SAML Metadata URL from your IdP
2. Sign in to https://modal.com and visit your [Workspace Management](/settings/workspace-management/identity-and-provisioning) page's \`Identity and Provisioning\` tab
3. Paste the Metadata URL in the input and click "Save Changes"

#### Step 3: Test the integration

1. Assign users in your IdP
2. Test IdP-initiated SSO by clicking the Modal application in your IdP dashboard
3. Test SP-initiated SSO by visiting the login URL below

#### Step 4: Read this before you enable "Require SSO"

Enabling "Require SSO" will force all users to sign in via SSO. Ensure that you
have admin access to your Modal Workspace through your identity provider before
enabling.

## Login URL

This URL can be used so that users can sign-in to the correct workspace from your IdP.

\`https://modal.com/login/sso?workspace=<workspace>\` (replace \`<workspace>\` with your workspace name)

## Troubleshooting

### Microsoft Entra SAML

Make sure the SAML attributes are mapped correctly. For example, \`email\` should be lowercase and the SAML attribute should not have a namespace. Read more about Microsoft Entra SAML attributes [here](https://learn.microsoft.com/en-us/entra/identity-platform/saml-claims-customization).
`,meta:{title:`Custom SAML SSO`,description:`Configure custom SAML Single Sign-On for your Modal Workspace with any identity provider.`}},{description:y,toc:b,rawContent:x,meta:S}=v,C=t(`Custom SAML SSO is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.`,1),w=t(`<thead><tr><th>Setting</th><th>Value</th></tr></thead> <tbody><tr><td>Entity ID</td><td><code>https://www.modal.com</code></td></tr><tr><td>ACS URL</td><td><code>https://modal.com/api/okta/saml/sso/&lt;workspace&gt;</code></td></tr></tbody>`,1),T=t(`<thead><tr><th>Attribute</th><th>Description</th></tr></thead> <tbody><tr><td>email</td><td>User’s email address</td></tr><tr><td>firstName</td><td>User’s first name</td></tr><tr><td>lastName</td><td>User’s last name</td></tr></tbody>`,1),E=t(`<!> <!> <p>If you use an identity provider (IdP) other than Okta, you can configure custom SAML SSO for your Modal Workspace.</p> <p>For Okta-specific setup, see our <!>.</p> <!> <ul><li>A Workspace that’s on an <!> plan</li> <li>Admin access to the Workspace you want to configure with SSO</li> <li>Admin privileges for your identity provider</li></ul> <!> <ul><li>Identity Provider (IdP) initiated SSO</li> <li>Service Provider (SP) initiated SSO</li> <li>Just-In-Time account provisioning</li></ul> <!> <!> <p>Configure your IdP with the following settings:</p> <!> <p>Replace <code>&lt;workspace&gt;</code> with your Modal Workspace name.</p> <!> <p>Your IdP must send the following SAML attributes:</p> <!> <!> <!> <ol><li>Create a new SAML application in your identity provider</li> <li>Set the Entity ID to <code>https://www.modal.com</code></li> <li>Set the ACS URL to <code>https://modal.com/api/okta/saml/sso/&lt;workspace&gt;</code> (replace <code>&lt;workspace&gt;</code> with your Workspace name)</li> <li>Configure the required SAML attributes (email, firstName, lastName)</li> <li>Ensure your IdP signs SAML assertions</li></ol> <!> <ol><li>Obtain the SAML Metadata URL from your IdP</li> <li>Sign in to <!> and visit your <!> page’s <code>Identity and Provisioning</code> tab</li> <li>Paste the Metadata URL in the input and click “Save Changes”</li></ol> <!> <ol><li>Assign users in your IdP</li> <li>Test IdP-initiated SSO by clicking the Modal application in your IdP dashboard</li> <li>Test SP-initiated SSO by visiting the login URL below</li></ol> <!> <p>Enabling “Require SSO” will force all users to sign in via SSO. Ensure that you
have admin access to your Modal Workspace through your identity provider before
enabling.</p> <!> <p>This URL can be used so that users can sign-in to the correct workspace from your IdP.</p> <p><code>https://modal.com/login/sso?workspace=&lt;workspace&gt;</code> (replace <code>&lt;workspace&gt;</code> with your workspace name)</p> <!> <!> <p>Make sure the SAML attributes are mapped correctly. For example, <code>email</code> should be lowercase and the SAML attribute should not have a namespace. Read more about Microsoft Entra SAML attributes <!>.</p>`,1);function D(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);g(t,o(()=>b,()=>v,{children:(t,a)=>{var o=E(),g=s(o);p(g,{id:`custom-saml-sso`,children:(e,t)=>{l(),i(e,r(`Custom SAML SSO`))},$$slots:{default:!0}});var v=c(g,2);u(v,{variant:`gated-feature`,children:(e,t)=>{l();var n=C();l(4),i(e,n)},$$slots:{default:!0}});var y=c(v,4);_(c(e(y)),{href:`/docs/guide/okta-sso`,children:(e,t)=>{l(),i(e,r(`Okta SSO documentation`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);d(b,{id:`prerequisites`,children:(e,t)=>{l(),i(e,r(`Prerequisites`))},$$slots:{default:!0}});var x=c(b,2),S=e(x);_(c(e(S)),{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`Enterprise`))},$$slots:{default:!0}}),l(),n(S),l(4),n(x);var D=c(x,2);d(D,{id:`supported-features`,children:(e,t)=>{l(),i(e,r(`Supported features`))},$$slots:{default:!0}});var O=c(D,4);d(O,{id:`configuration`,children:(e,t)=>{l(),i(e,r(`Configuration`))},$$slots:{default:!0}});var k=c(O,2);f(k,{id:`modal-saml-settings`,children:(e,t)=>{l(),i(e,r(`Modal SAML settings`))},$$slots:{default:!0}});var A=c(k,4);h(A,{children:(e,t)=>{var n=w();l(2),i(e,n)},$$slots:{default:!0}});var j=c(A,4);f(j,{id:`required-saml-attributes`,children:(e,t)=>{l(),i(e,r(`Required SAML attributes`))},$$slots:{default:!0}});var M=c(j,4);h(M,{children:(e,t)=>{var n=T();l(2),i(e,n)},$$slots:{default:!0}});var N=c(M,2);f(N,{id:`configuration-steps`,children:(e,t)=>{l(),i(e,r(`Configuration steps`))},$$slots:{default:!0}});var P=c(N,2);m(P,{id:`step-1-configure-your-idp`,children:(e,t)=>{l(),i(e,r(`Step 1: Configure your IdP`))},$$slots:{default:!0}});var F=c(P,4);m(F,{id:`step-2-link-your-workspace-to-your-idp`,children:(e,t)=>{l(),i(e,r(`Step 2: Link your Workspace to your IdP`))},$$slots:{default:!0}});var I=c(F,2),L=c(e(I),2),R=c(e(L));_(R,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://modal.com`))},$$slots:{default:!0}}),_(c(R,2),{href:`/settings/workspace-management/identity-and-provisioning`,children:(e,t)=>{l(),i(e,r(`Workspace Management`))},$$slots:{default:!0}}),l(3),n(L),l(2),n(I);var z=c(I,2);m(z,{id:`step-3-test-the-integration`,children:(e,t)=>{l(),i(e,r(`Step 3: Test the integration`))},$$slots:{default:!0}});var B=c(z,4);m(B,{id:`step-4-read-this-before-you-enable-require-sso`,children:(e,t)=>{l(),i(e,r(`Step 4: Read this before you enable “Require SSO”`))},$$slots:{default:!0}});var V=c(B,4);d(V,{id:`login-url`,children:(e,t)=>{l(),i(e,r(`Login URL`))},$$slots:{default:!0}});var H=c(V,6);d(H,{id:`troubleshooting`,children:(e,t)=>{l(),i(e,r(`Troubleshooting`))},$$slots:{default:!0}});var U=c(H,2);f(U,{id:`microsoft-entra-saml`,children:(e,t)=>{l(),i(e,r(`Microsoft Entra SAML`))},$$slots:{default:!0}});var W=c(U,2);_(c(e(W),3),{href:`https://learn.microsoft.com/en-us/entra/identity-platform/saml-claims-customization`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(W),i(t,o)},$$slots:{default:!0}}))}export{D as default,v as metadata};
//# sourceMappingURL=CZ8EUtcA2.js.map
