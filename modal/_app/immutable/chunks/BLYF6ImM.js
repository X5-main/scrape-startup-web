(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8ee96a66-98ef-49f6-93a6-fde5d02631c7`,e._sentryDebugIdIdentifier=`sentry-dbid-8ee96a66-98ef-49f6-93a6-fde5d02631c7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as te}from"./DYSGKh1I.js";import{a as l,i as u,o as d,r as f}from"./CPby7b1n.js";import{n as p,t as m}from"./JPsrybyr.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _=`/_app/immutable/assets/okta-browse-applications.BiqGsdcd.png`,ne=`/_app/immutable/assets/okta-sign-on-edit.DHny2cIB.png`,v=`/_app/immutable/assets/okta-add-workspace-username.DoM8qewy.png`,y=`/_app/immutable/assets/okta-metadata-url.BLDzMpWn.png`,b=`/_app/immutable/assets/okta-assign-people.BhAmcJ0m.png`,x={description:`Configure Okta Single Sign-On for your Modal Workspace with IdP-initiated SSO and just-in-time account provisioning.`,toc:[{depth:1,value:`Okta SSO`,id:`okta-sso`,children:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Supported features`,id:`supported-features`},{depth:2,value:`Configuration`,id:`configuration`,children:[{depth:3,value:`Read this before you enable “Require SSO”`,id:`read-this-before-you-enable-require-sso`},{depth:3,value:`Configuration steps`,id:`configuration-steps`,children:[{depth:4,value:`Step 1: Add Modal app to Okta Applications`,id:`step-1-add-modal-app-to-okta-applications`},{depth:4,value:`Step 2: Link your Workspace to Okta Modal application`,id:`step-2-link-your-workspace-to-okta-modal-application`},{depth:4,value:`Step 3: Assign users / groups and test the integration`,id:`step-3-assign-users--groups-and-test-the-integration`},{depth:4,value:`Notes`,id:`notes`}]}]},{depth:2,value:`SP-initiated SSO`,id:`sp-initiated-sso`}]}],rawContent:`# Okta SSO

<Callout variant="gated-feature">
Okta SSO is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.
</Callout>

## Prerequisites

- A Workspace that's on an [Enterprise](/pricing) plan
- Admin access to the Workspace you want to configure with Okta Single-Sign-On (SSO)
- Admin privileges for your Okta Organization

## Supported features

- Identity Provider (IdP) initiated SSO
- Service Provider (SP) initiated SSO
- Just-In-Time account provisioning

For more information on the listed features, visit the
[Okta Glossary](https://help.okta.com/okta_help.htm?type=oie&id=ext_glossary).

## Configuration

### Read this before you enable "Require SSO"

Enabling "Require SSO" will force all users to sign in via Okta. Ensure that you
have admin access to your Modal Workspace through an Okta account before
enabling.

### Configuration steps

#### Step 1: Add Modal app to Okta Applications

1. Sign in to your Okta admin dashboard
2. Navigate to the Applications tab and click "Browse App Catalog".
   ![Okta browse application](../../assets/docs/okta-browse-applications.png)

3. Select "Modal" and click "Done".
4. Select the "Sign On" tab and click "Edit".
   ![Okta sign on edit](../../assets/docs/okta-sign-on-edit.png)
5. Fill out Workspace field to configure for your specific Modal Workspace. See
   [Step 2](/docs/guide/okta-sso#step-2-link-your-workspace-to-okta-modal-application)
   if you're unsure what this is.
   ![Okta add workspace](../../assets/docs/okta-add-workspace-username.png)

#### Step 2: Link your Workspace to Okta Modal application

1. Navigate to your application on the Okta Admin page.
2. Copy the Metadata URL from the Okta Admin Console (It's under the "Sign On"
   tab). ![Okta metadata url](../../assets/docs/okta-metadata-url.png)

3. Sign in to https://modal.com and visit your [Workspace Management](/settings/workspace-management/identity-and-provisioning) page's \`Identity and Provisioning\` tab.
4. Paste the Metadata URL in the input and click "Save Changes"

#### Step 3: Assign users / groups and test the integration

1. Navigate back to your Okta application on the Okta Admin dashboard.
2. Click on the "Assignments" tab and add the appropriate people or groups.

![Okta Assign Users](../../assets/docs/okta-assign-people.png)

3. To test the integration, sign in as one of the users you assigned in the previous step.
4. Click on the Modal application on the Okta Dashboard to initiate Single Sign-On.

#### Notes

The following SAML attributes are used by the integration:

| Name      | Value          |
| --------- | -------------- |
| email     | user.email     |
| firstName | user.firstName |
| lastName  | user.lastName  |

## SP-initiated SSO

The sign-in process is initiated from https://modal.com/login/sso

1. Enter your workspace name in the input
2. Click "continue with SSO" to authenticate with Okta
`,meta:{title:`Okta SSO`,description:`Configure Okta Single Sign-On for your Modal Workspace with IdP-initiated SSO and just-in-time account provisioning.`}},{description:S,toc:C,rawContent:w,meta:T}=x,E=t(`Okta SSO is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.`,1),D=t(`<thead><tr><th>Name</th><th>Value</th></tr></thead> <tbody><tr><td>email</td><td>user.email</td></tr><tr><td>firstName</td><td>user.firstName</td></tr><tr><td>lastName</td><td>user.lastName</td></tr></tbody>`,1),re=t(`<!> <!> <!> <ul><li>A Workspace that’s on an <!> plan</li> <li>Admin access to the Workspace you want to configure with Okta Single-Sign-On (SSO)</li> <li>Admin privileges for your Okta Organization</li></ul> <!> <ul><li>Identity Provider (IdP) initiated SSO</li> <li>Service Provider (SP) initiated SSO</li> <li>Just-In-Time account provisioning</li></ul> <p>For more information on the listed features, visit the <!>.</p> <!> <!> <p>Enabling “Require SSO” will force all users to sign in via Okta. Ensure that you
have admin access to your Modal Workspace through an Okta account before
enabling.</p> <!> <!> <ol><li><p>Sign in to your Okta admin dashboard</p></li> <li><p>Navigate to the Applications tab and click “Browse App Catalog”. <!></p></li> <li><p>Select “Modal” and click “Done”.</p></li> <li><p>Select the “Sign On” tab and click “Edit”. <!></p></li> <li><p>Fill out Workspace field to configure for your specific Modal Workspace. See <!> if you’re unsure what this is. <!></p></li></ol> <!> <ol><li><p>Navigate to your application on the Okta Admin page.</p></li> <li><p>Copy the Metadata URL from the Okta Admin Console (It’s under the “Sign On”
tab). <!></p></li> <li><p>Sign in to <!> and visit your <!> page’s <code>Identity and Provisioning</code> tab.</p></li> <li><p>Paste the Metadata URL in the input and click “Save Changes”</p></li></ol> <!> <ol><li>Navigate back to your Okta application on the Okta Admin dashboard.</li> <li>Click on the “Assignments” tab and add the appropriate people or groups.</li></ol> <p><!></p> <ol start="3"><li>To test the integration, sign in as one of the users you assigned in the previous step.</li> <li>Click on the Modal application on the Okta Dashboard to initiate Single Sign-On.</li></ol> <!> <p>The following SAML attributes are used by the integration:</p> <!> <!> <p>The sign-in process is initiated from <!></p> <ol><li>Enter your workspace name in the input</li> <li>Click “continue with SSO” to authenticate with Okta</li></ol>`,1);function O(t,S){let C=ee(S,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,a(()=>C,()=>x,{children:(t,ee)=>{var a=re(),h=o(a);d(h,{id:`okta-sso`,children:(e,t)=>{c(),i(e,r(`Okta SSO`))},$$slots:{default:!0}});var x=s(h,2);te(x,{variant:`gated-feature`,children:(e,t)=>{c();var n=E();c(4),i(e,n)},$$slots:{default:!0}});var S=s(x,2);l(S,{id:`prerequisites`,children:(e,t)=>{c(),i(e,r(`Prerequisites`))},$$slots:{default:!0}});var C=s(S,2),w=e(C);g(s(e(w)),{href:`/pricing`,children:(e,t)=>{c(),i(e,r(`Enterprise`))},$$slots:{default:!0}}),c(),n(w),c(4),n(C);var T=s(C,2);l(T,{id:`supported-features`,children:(e,t)=>{c(),i(e,r(`Supported features`))},$$slots:{default:!0}});var O=s(T,4);g(s(e(O)),{href:`https://help.okta.com/okta_help.htm?type=oie&id=ext_glossary`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Okta Glossary`))},$$slots:{default:!0}}),c(),n(O);var k=s(O,2);l(k,{id:`configuration`,children:(e,t)=>{c(),i(e,r(`Configuration`))},$$slots:{default:!0}});var A=s(k,2);u(A,{id:`read-this-before-you-enable-require-sso`,children:(e,t)=>{c(),i(e,r(`Read this before you enable “Require SSO”`))},$$slots:{default:!0}});var j=s(A,4);u(j,{id:`configuration-steps`,children:(e,t)=>{c(),i(e,r(`Configuration steps`))},$$slots:{default:!0}});var M=s(j,2);f(M,{id:`step-1-add-modal-app-to-okta-applications`,children:(e,t)=>{c(),i(e,r(`Step 1: Add Modal app to Okta Applications`))},$$slots:{default:!0}});var N=s(M,2),P=s(e(N),2),F=e(P);m(s(e(F)),{get src(){return _},alt:`Okta browse application`}),n(F),n(P);var I=s(P,4),L=e(I);m(s(e(L)),{get src(){return ne},alt:`Okta sign on edit`}),n(L),n(I);var R=s(I,2),z=e(R),B=s(e(z));g(B,{href:`/docs/guide/okta-sso#step-2-link-your-workspace-to-okta-modal-application`,children:(e,t)=>{c(),i(e,r(`Step 2`))},$$slots:{default:!0}}),m(s(B,2),{get src(){return v},alt:`Okta add workspace`}),n(z),n(R),n(N);var V=s(N,2);f(V,{id:`step-2-link-your-workspace-to-okta-modal-application`,children:(e,t)=>{c(),i(e,r(`Step 2: Link your Workspace to Okta Modal application`))},$$slots:{default:!0}});var H=s(V,2),U=s(e(H),2),W=e(U);m(s(e(W)),{get src(){return y},alt:`Okta metadata url`}),n(W),n(U);var G=s(U,2),K=e(G),q=s(e(K));g(q,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`https://modal.com`))},$$slots:{default:!0}}),g(s(q,2),{href:`/settings/workspace-management/identity-and-provisioning`,children:(e,t)=>{c(),i(e,r(`Workspace Management`))},$$slots:{default:!0}}),c(3),n(K),n(G),c(2),n(H);var J=s(H,2);f(J,{id:`step-3-assign-users--groups-and-test-the-integration`,children:(e,t)=>{c(),i(e,r(`Step 3: Assign users / groups and test the integration`))},$$slots:{default:!0}});var Y=s(J,4);m(e(Y),{get src(){return b},alt:`Okta Assign Users`}),n(Y);var X=s(Y,4);f(X,{id:`notes`,children:(e,t)=>{c(),i(e,r(`Notes`))},$$slots:{default:!0}});var Z=s(X,4);p(Z,{children:(e,t)=>{var n=D();c(2),i(e,n)},$$slots:{default:!0}});var Q=s(Z,2);l(Q,{id:`sp-initiated-sso`,children:(e,t)=>{c(),i(e,r(`SP-initiated SSO`))},$$slots:{default:!0}});var $=s(Q,2);g(s(e($)),{href:`https://modal.com/login/sso`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`https://modal.com/login/sso`))},$$slots:{default:!0}}),n($),c(2),i(t,a)},$$slots:{default:!0}}))}export{O as default,x as metadata};
//# sourceMappingURL=BLYF6ImM.js.map
