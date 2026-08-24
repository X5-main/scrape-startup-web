(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`633f537c-19fa-4040-82ba-9b6754c35286`,e._sentryDebugIdIdentifier=`sentry-dbid-633f537c-19fa-4040-82ba-9b6754c35286`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./JPsrybyr.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _=`/_app/immutable/assets/slack-add-modal-app.Cy4hnVNV.jpg`,v={description:`Integrate your Modal Workspace with Slack to receive timely essential notifications`,toc:[{depth:1,value:`Slack notifications`,id:`slack-notifications`,children:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Supported notifications`,id:`supported-notifications`},{depth:2,value:`Slack Permissions`,id:`slack-permissions`},{depth:2,value:`Configuration`,id:`configuration`,children:[{depth:3,value:`Step 1: Install the Slack integration`,id:`step-1-install-the-slack-integration`},{depth:3,value:`Step 2: Invite the Modal app to your Slack channel`,id:`step-2-invite-the-modal-app-to-your-slack-channel`},{depth:3,value:`Step 3: Add the Modal app to your Slack channel`,id:`step-3-add-the-modal-app-to-your-slack-channel`},{depth:3,value:`Step 4: Use /modal link to link the Slack channel to your Modal Workspace`,id:`step-4-use-modal-link-to-link-the-slack-channel-to-your-modal-workspace`}]}]}],rawContent:`# Slack notifications

<Callout variant="beta" />

You can integrate your Modal Workspace with Slack to receive timely essential notifications.

## Prerequisites

- You are a [Workspace Manager](/docs/guide/workspaces#administrating-workspace-members) in the Modal Workspace you're installing the Slack integration in.
- You have permissions to install apps in your Slack workspace.

## Supported notifications

- Alerts for failed scheduled function runs.
- Alerts for crash-looping containers in a function.
- Alerts for Functions whose warm containers have run no inputs for weeks.
- Alerts when any of your apps have client versions that are out of date.
- Alerts when you hit your GPU resource limits.
- Alerts when your Workspace approaches or reaches its usage limit or budget.
- Alerts when an Environment approaches or reaches its budget.
- Notices when credits are added to your Workspace.

## Slack Permissions

The Modal Slack app requests the following permissions to integrate with Slack:

- Start direct messages with people
- Send messages as @modal
- Add shortcuts and/or slash commands that people can use
- View basic information about public channels in a workspace
- View basic information about private channels that Modal has been added to
- View basic information about direct messages that Modal has been added to
- View basic information about group direct messages that Modal has been added to
- View people in a workspace

## Configuration

### Step 1: Install the Slack integration

Visit the _Slack Notifications_ section on your [settings](/settings/slack-notifications) page in your Modal Workspace and click the **Add to Slack** button.

### Step 2: Invite the Modal app to your Slack channel

Navigate to the Slack channel and \`/invite\` the Modal app so that the app can post messages to the channel.

![Adding an app to Slack channel](https://modal-cdn.com/cdnbot/slack-invite-app_vpxfskj_f0dc9524.webp)

### Step 3: Add the Modal app to your Slack channel

Navigate to the Slack channel you want to add the Modal app to and click on the channel header. On the integrations tab you can add the Modal app.

![Add Modal app to Slack channel](../../assets/docs/slack-add-modal-app.jpg)

### Step 4: Use \`/modal link\` to link the Slack channel to your Modal Workspace

You'll be prompted to select the Workspace you want to link to the Slack channel. You can always unlink the Slack channel by visiting the _Slack Notifications_ section on your [settings](/settings/slack-notifications) page in your Modal Workspace.
`,meta:{title:`Slack notifications`,description:`Integrate your Modal Workspace with Slack to receive timely essential notifications`}},{description:y,toc:b,rawContent:x,meta:S}=v,C=t(`Step 4: Use <code>/modal link</code> to link the Slack channel to your Modal Workspace`,1),w=t(`<!> <!> <p>You can integrate your Modal Workspace with Slack to receive timely essential notifications.</p> <!> <ul><li>You are a <!> in the Modal Workspace you’re installing the Slack integration in.</li> <li>You have permissions to install apps in your Slack workspace.</li></ul> <!> <ul><li>Alerts for failed scheduled function runs.</li> <li>Alerts for crash-looping containers in a function.</li> <li>Alerts for Functions whose warm containers have run no inputs for weeks.</li> <li>Alerts when any of your apps have client versions that are out of date.</li> <li>Alerts when you hit your GPU resource limits.</li> <li>Alerts when your Workspace approaches or reaches its usage limit or budget.</li> <li>Alerts when an Environment approaches or reaches its budget.</li> <li>Notices when credits are added to your Workspace.</li></ul> <!> <p>The Modal Slack app requests the following permissions to integrate with Slack:</p> <ul><li>Start direct messages with people</li> <li>Send messages as @modal</li> <li>Add shortcuts and/or slash commands that people can use</li> <li>View basic information about public channels in a workspace</li> <li>View basic information about private channels that Modal has been added to</li> <li>View basic information about direct messages that Modal has been added to</li> <li>View basic information about group direct messages that Modal has been added to</li> <li>View people in a workspace</li></ul> <!> <!> <p>Visit the <em>Slack Notifications</em> section on your <!> page in your Modal Workspace and click the <strong>Add to Slack</strong> button.</p> <!> <p>Navigate to the Slack channel and <code>/invite</code> the Modal app so that the app can post messages to the channel.</p> <p><!></p> <!> <p>Navigate to the Slack channel you want to add the Modal app to and click on the channel header. On the integrations tab you can add the Modal app.</p> <p><!></p> <!> <p>You’ll be prompted to select the Workspace you want to link to the Slack channel. You can always unlink the Slack channel by visiting the <em>Slack Notifications</em> section on your <!> page in your Modal Workspace.</p>`,1);function T(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>b,()=>v,{children:(t,a)=>{var o=w(),h=s(o);p(h,{id:`slack-notifications`,children:(e,t)=>{l(),i(e,r(`Slack notifications`))},$$slots:{default:!0}});var v=c(h,2);u(v,{variant:`beta`});var y=c(v,4);d(y,{id:`prerequisites`,children:(e,t)=>{l(),i(e,r(`Prerequisites`))},$$slots:{default:!0}});var b=c(y,2),x=e(b);g(c(e(x)),{href:`/docs/guide/workspaces#administrating-workspace-members`,children:(e,t)=>{l(),i(e,r(`Workspace Manager`))},$$slots:{default:!0}}),l(),n(x),l(2),n(b);var S=c(b,2);d(S,{id:`supported-notifications`,children:(e,t)=>{l(),i(e,r(`Supported notifications`))},$$slots:{default:!0}});var T=c(S,4);d(T,{id:`slack-permissions`,children:(e,t)=>{l(),i(e,r(`Slack Permissions`))},$$slots:{default:!0}});var E=c(T,6);d(E,{id:`configuration`,children:(e,t)=>{l(),i(e,r(`Configuration`))},$$slots:{default:!0}});var D=c(E,2);f(D,{id:`step-1-install-the-slack-integration`,children:(e,t)=>{l(),i(e,r(`Step 1: Install the Slack integration`))},$$slots:{default:!0}});var O=c(D,2);g(c(e(O),3),{href:`/settings/slack-notifications`,children:(e,t)=>{l(),i(e,r(`settings`))},$$slots:{default:!0}}),l(3),n(O);var k=c(O,2);f(k,{id:`step-2-invite-the-modal-app-to-your-slack-channel`,children:(e,t)=>{l(),i(e,r(`Step 2: Invite the Modal app to your Slack channel`))},$$slots:{default:!0}});var A=c(k,4);m(e(A),{src:`https://modal-cdn.com/cdnbot/slack-invite-app_vpxfskj_f0dc9524.webp`,alt:`Adding an app to Slack channel`}),n(A);var j=c(A,2);f(j,{id:`step-3-add-the-modal-app-to-your-slack-channel`,children:(e,t)=>{l(),i(e,r(`Step 3: Add the Modal app to your Slack channel`))},$$slots:{default:!0}});var M=c(j,4);m(e(M),{get src(){return _},alt:`Add Modal app to Slack channel`}),n(M);var N=c(M,2);f(N,{id:`step-4-use-modal-link-to-link-the-slack-channel-to-your-modal-workspace`,children:(e,t)=>{l();var n=C();l(2),i(e,n)},$$slots:{default:!0}});var P=c(N,2);g(c(e(P),3),{href:`/settings/slack-notifications`,children:(e,t)=>{l(),i(e,r(`settings`))},$$slots:{default:!0}}),l(),n(P),i(t,o)},$$slots:{default:!0}}))}export{T as default,v as metadata};
//# sourceMappingURL=C_jdmRtb2.js.map
