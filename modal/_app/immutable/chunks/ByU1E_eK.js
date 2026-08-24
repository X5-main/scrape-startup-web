(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3c65e773-3166-411b-9369-dbcb0eb312bd`,e._sentryDebugIdIdentifier=`sentry-dbid-3c65e773-3166-411b-9369-dbcb0eb312bd`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./JPsrybyr.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _=`/_app/immutable/assets/invite-member.CHnml0eT.png`,v={toc:[{depth:1,value:`Workspaces`,id:`workspaces`,children:[{depth:2,value:`Create a Workspace`,id:`create-a-workspace`},{depth:2,value:`Auto-joining a Workspace associated with a GitHub organization`,id:`auto-joining-a-workspace-associated-with-a-github-organization`},{depth:2,value:`Inviting new Workspace members`,id:`inviting-new-workspace-members`},{depth:2,value:`Create a token for a Workspace`,id:`create-a-token-for-a-workspace`},{depth:2,value:`Switching active Workspace`,id:`switching-active-workspace`,children:[{depth:3,value:`Dashboard`,id:`dashboard`},{depth:3,value:`CLI`,id:`cli`}]},{depth:2,value:`Administering Workspace membership`,id:`administering-workspace-membership`},{depth:2,value:`Leaving a Workspace`,id:`leaving-a-workspace`}]}],rawContent:`# Workspaces

This page is a high-level guide to Modal Workspaces,
the primary unit of organization for Modal resources
and authentication.

A **Workspace** is an area where a user can deploy Modal Apps and other
resources. When you sign up to Modal, a Workspace is automatically created for
you. Its name is based on your GitHub username, but may be randomly generated
if that name is taken or invalid.

Every Workspace is shared, meaning you can invite others by email to
collaborate with you.

<Callout variant="info">

Older accounts may have a single-member "personal" Workspace which did not
support inviting additional members. Moving forward, all new signups start with
a normal Workspace that supports inviting teammates as soon as you verify your
account by adding a payment method.

<br />

Existing Workspaces are unaffected, and nothing has changed about plans or
pricing.

</Callout>

## Create a Workspace

There are two ways to create an additional Modal Workspace on the
[settings](/settings/workspaces) page.

<Callout variant="info">

If your Modal account was provisioned through Okta, you will not have the option to create a new Workspace. Your Workspace is managed by your organization's Okta configuration. If you need a new Workspace, contact your organization's Okta administrator.

</Callout>

![view of workspaces creation interface](https://modal-cdn.com/cdnbot/create-new-workspace-viewk0ka46_7_800f2053.webp)

1. Create from [GitHub organization](https://docs.github.com/en/organizations). Allows members of the GitHub organization to auto-join the Workspace.

2. Create from scratch. You can invite anyone to your Workspace.

If you're interested in having a Workspace associated with your Okta
organization, then check out our [Okta SSO docs](/docs/guide/okta-sso).

To use SSO through Google or other providers, reach out to us at [support@modal.com](mailto:support@modal.com).

## Auto-joining a Workspace associated with a GitHub organization

Note: This is only relevant for Workspaces created from a GitHub organization.

Users can automatically join a Workspace on their [Workspace settings page](/settings/workspaces) if they are a member of the GitHub organization associated with the Workspace.

To turn off this functionality a Workspace Manager can disable it on the **Workspace Management** tab of their Workspace's settings page.

## Inviting new Workspace members

To invite a new Workspace member, you can visit the [settings](/settings) page
and navigate to the Members tab for the appropriate Workspace.

You can either send an email invite or share an invite link. Both existing Modal
users and people who don't yet have a Modal account can use the link to join
your Workspace; if they don't have an account, one is created for them.

Inviting members requires a verified account. If you haven't already, add a
payment method to verify your account.

![invite member section](../../assets/screenshots/invite-member.png)

## Create a token for a Workspace

To interact with a Workspace's resources programmatically, you need to add an
API token for that Workspace. Your existing API tokens are displayed on
[the settings page](/settings/tokens) and new API tokens can be added for a
particular Workspace.

After adding a token for a Workspace to your Modal config file you can activate
that Workspace's profile using the CLI (see below).

As a Manager or Workspace Owner you can manage active tokens for a Workspace on
[the member tokens page](/settings/tokens/member-tokens). For more information on API
token management see the
[documentation about configuration](/docs/sdk/py/latest/config).

## Switching active Workspace

When on the dashboard or using the CLI, the active profile determines which
Workspace is associated with your actions.

### Dashboard

You can switch between your Workspaces by using the workspace selector at the
top of [the dashboard](/home).

### CLI

To switch the Workspace associated with CLI commands, use
\`modal profile activate\`.

## Administering Workspace membership

Workspaces have three different levels of access privileges:

- Owner
- Manager
- Member

A user that creates a Workspace is automatically set as the **Owner** for that
Workspace. The owner can assign any other roles within the Workspace, as well as
remove other members of the Workspace.

A **Manager** within a Workspace can assign all roles except **Owner** and can
also remove other members of the Workspace.

A **Member** of a Workspace cannot assign any access privileges within the
Workspace but can otherwise perform any action like running and deploying Apps
and modifying Secrets.

As an Owner or Manager you can administer the access privileges of other
members on the \`Workspace Management\` tab in [settings](/settings/workspace-management).

<Callout variant="info">

Modal supports [Role-Based Access Control (RBAC)](/docs/guide/rbac) for more granular control over permissions at both the Workspace and Environment level.

</Callout>

## Leaving a Workspace

To leave a Workspace, navigate to [the settings page](/settings/workspaces) and
click "Leave" on a listed Workspace. You can't leave a Workspace if you're its
only remaining member. If you're the last Owner of a Workspace that still has
other members, assign a new Owner before leaving. Personal Workspaces are
single-member, so they can't be left.
`,meta:{title:`Workspaces`,description:`This page is a high-level guide to Modal Workspaces, the primary unit of organization for Modal resources and authentication.`}},{toc:y,rawContent:b,meta:x}=v,S=t(`<p>Older accounts may have a single-member “personal” Workspace which did not
support inviting additional members. Moving forward, all new signups start with
a normal Workspace that supports inviting teammates as soon as you verify your
account by adding a payment method.</p> <br/> <p>Existing Workspaces are unaffected, and nothing has changed about plans or
pricing.</p>`,1),C=t(`<p>If your Modal account was provisioned through Okta, you will not have the option to create a new Workspace. Your Workspace is managed by your organization’s Okta configuration. If you need a new Workspace, contact your organization’s Okta administrator.</p>`),w=t(`<p>Modal supports <!> for more granular control over permissions at both the Workspace and Environment level.</p>`),T=t(`<!> <p>This page is a high-level guide to Modal Workspaces,
the primary unit of organization for Modal resources
and authentication.</p> <p>A <strong>Workspace</strong> is an area where a user can deploy Modal Apps and other
resources. When you sign up to Modal, a Workspace is automatically created for
you. Its name is based on your GitHub username, but may be randomly generated
if that name is taken or invalid.</p> <p>Every Workspace is shared, meaning you can invite others by email to
collaborate with you.</p> <!> <!> <p>There are two ways to create an additional Modal Workspace on the <!> page.</p> <!> <p><!></p> <ol><li><p>Create from <!>. Allows members of the GitHub organization to auto-join the Workspace.</p></li> <li><p>Create from scratch. You can invite anyone to your Workspace.</p></li></ol> <p>If you’re interested in having a Workspace associated with your Okta
organization, then check out our <!>.</p> <p>To use SSO through Google or other providers, reach out to us at <!>.</p> <!> <p>Note: This is only relevant for Workspaces created from a GitHub organization.</p> <p>Users can automatically join a Workspace on their <!> if they are a member of the GitHub organization associated with the Workspace.</p> <p>To turn off this functionality a Workspace Manager can disable it on the <strong>Workspace Management</strong> tab of their Workspace’s settings page.</p> <!> <p>To invite a new Workspace member, you can visit the <!> page
and navigate to the Members tab for the appropriate Workspace.</p> <p>You can either send an email invite or share an invite link. Both existing Modal
users and people who don’t yet have a Modal account can use the link to join
your Workspace; if they don’t have an account, one is created for them.</p> <p>Inviting members requires a verified account. If you haven’t already, add a
payment method to verify your account.</p> <p><!></p> <!> <p>To interact with a Workspace’s resources programmatically, you need to add an
API token for that Workspace. Your existing API tokens are displayed on <!> and new API tokens can be added for a
particular Workspace.</p> <p>After adding a token for a Workspace to your Modal config file you can activate
that Workspace’s profile using the CLI (see below).</p> <p>As a Manager or Workspace Owner you can manage active tokens for a Workspace on <!>. For more information on API
token management see the <!>.</p> <!> <p>When on the dashboard or using the CLI, the active profile determines which
Workspace is associated with your actions.</p> <!> <p>You can switch between your Workspaces by using the workspace selector at the
top of <!>.</p> <!> <p>To switch the Workspace associated with CLI commands, use <code>modal profile activate</code>.</p> <!> <p>Workspaces have three different levels of access privileges:</p> <ul><li>Owner</li> <li>Manager</li> <li>Member</li></ul> <p>A user that creates a Workspace is automatically set as the <strong>Owner</strong> for that
Workspace. The owner can assign any other roles within the Workspace, as well as
remove other members of the Workspace.</p> <p>A <strong>Manager</strong> within a Workspace can assign all roles except <strong>Owner</strong> and can
also remove other members of the Workspace.</p> <p>A <strong>Member</strong> of a Workspace cannot assign any access privileges within the
Workspace but can otherwise perform any action like running and deploying Apps
and modifying Secrets.</p> <p>As an Owner or Manager you can administer the access privileges of other
members on the <code>Workspace Management</code> tab in <!>.</p> <!> <!> <p>To leave a Workspace, navigate to <!> and
click “Leave” on a listed Workspace. You can’t leave a Workspace if you’re its
only remaining member. If you’re the last Owner of a Workspace that still has
other members, assign a new Owner before leaving. Personal Workspaces are
single-member, so they can’t be left.</p>`,1);function E(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>b,()=>v,{children:(t,a)=>{var o=T(),h=s(o);p(h,{id:`workspaces`,children:(e,t)=>{l(),i(e,r(`Workspaces`))},$$slots:{default:!0}});var v=c(h,8);u(v,{variant:`info`,children:(e,t)=>{var n=S();l(4),i(e,n)},$$slots:{default:!0}});var y=c(v,2);d(y,{id:`create-a-workspace`,children:(e,t)=>{l(),i(e,r(`Create a Workspace`))},$$slots:{default:!0}});var b=c(y,2);g(c(e(b)),{href:`/settings/workspaces`,children:(e,t)=>{l(),i(e,r(`settings`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);u(x,{variant:`info`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}});var E=c(x,2);m(e(E),{src:`https://modal-cdn.com/cdnbot/create-new-workspace-viewk0ka46_7_800f2053.webp`,alt:`view of workspaces creation interface`}),n(E);var D=c(E,2),O=e(D),k=e(O);g(c(e(k)),{href:`https://docs.github.com/en/organizations`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GitHub organization`))},$$slots:{default:!0}}),l(),n(k),n(O),l(2),n(D);var A=c(D,2);g(c(e(A)),{href:`/docs/guide/okta-sso`,children:(e,t)=>{l(),i(e,r(`Okta SSO docs`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);g(c(e(j)),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);d(M,{id:`auto-joining-a-workspace-associated-with-a-github-organization`,children:(e,t)=>{l(),i(e,r(`Auto-joining a Workspace associated with a GitHub organization`))},$$slots:{default:!0}});var N=c(M,4);g(c(e(N)),{href:`/settings/workspaces`,children:(e,t)=>{l(),i(e,r(`Workspace settings page`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,4);d(P,{id:`inviting-new-workspace-members`,children:(e,t)=>{l(),i(e,r(`Inviting new Workspace members`))},$$slots:{default:!0}});var F=c(P,2);g(c(e(F)),{href:`/settings`,children:(e,t)=>{l(),i(e,r(`settings`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,6);m(e(I),{get src(){return _},alt:`invite member section`}),n(I);var L=c(I,2);d(L,{id:`create-a-token-for-a-workspace`,children:(e,t)=>{l(),i(e,r(`Create a token for a Workspace`))},$$slots:{default:!0}});var R=c(L,2);g(c(e(R)),{href:`/settings/tokens`,children:(e,t)=>{l(),i(e,r(`the settings page`))},$$slots:{default:!0}}),l(),n(R);var z=c(R,4),B=c(e(z));g(B,{href:`/settings/tokens/member-tokens`,children:(e,t)=>{l(),i(e,r(`the member tokens page`))},$$slots:{default:!0}}),g(c(B,2),{href:`/docs/sdk/py/latest/config`,children:(e,t)=>{l(),i(e,r(`documentation about configuration`))},$$slots:{default:!0}}),l(),n(z);var V=c(z,2);d(V,{id:`switching-active-workspace`,children:(e,t)=>{l(),i(e,r(`Switching active Workspace`))},$$slots:{default:!0}});var H=c(V,4);f(H,{id:`dashboard`,children:(e,t)=>{l(),i(e,r(`Dashboard`))},$$slots:{default:!0}});var U=c(H,2);g(c(e(U)),{href:`/home`,children:(e,t)=>{l(),i(e,r(`the dashboard`))},$$slots:{default:!0}}),l(),n(U);var W=c(U,2);f(W,{id:`cli`,children:(e,t)=>{l(),i(e,r(`CLI`))},$$slots:{default:!0}});var G=c(W,4);d(G,{id:`administering-workspace-membership`,children:(e,t)=>{l(),i(e,r(`Administering Workspace membership`))},$$slots:{default:!0}});var K=c(G,12);g(c(e(K),3),{href:`/settings/workspace-management`,children:(e,t)=>{l(),i(e,r(`settings`))},$$slots:{default:!0}}),l(),n(K);var q=c(K,2);u(q,{variant:`info`,children:(t,a)=>{var o=w();g(c(e(o)),{href:`/docs/guide/rbac`,children:(e,t)=>{l(),i(e,r(`Role-Based Access Control (RBAC)`))},$$slots:{default:!0}}),l(),n(o),i(t,o)},$$slots:{default:!0}});var J=c(q,2);d(J,{id:`leaving-a-workspace`,children:(e,t)=>{l(),i(e,r(`Leaving a Workspace`))},$$slots:{default:!0}});var Y=c(J,2);g(c(e(Y)),{href:`/settings/workspaces`,children:(e,t)=>{l(),i(e,r(`the settings page`))},$$slots:{default:!0}}),l(),n(Y),i(t,o)},$$slots:{default:!0}}))}export{E as default,v as metadata};
//# sourceMappingURL=ByU1E_eK.js.map
