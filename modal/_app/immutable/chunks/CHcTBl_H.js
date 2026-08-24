(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d5c100fc-c843-43e3-ad95-5a24589f9b4f`,e._sentryDebugIdIdentifier=`sentry-dbid-d5c100fc-c843-43e3-ad95-5a24589f9b4f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./JPsrybyr.js";import{t as h}from"./BILrvr3I.js";import{t as g}from"./B4L_if842.js";import{t as _}from"./DeWGVqas2.js";var v={toc:[{depth:1,value:`Managing deployments`,id:`managing-deployments`,children:[{depth:2,value:`Creating deployments`,id:`creating-deployments`},{depth:2,value:`Viewing deployments`,id:`viewing-deployments`,children:[{depth:3,value:`Deployment events on charts`,id:`deployment-events-on-charts`}]},{depth:2,value:`Updating deployments`,id:`updating-deployments`,children:[{depth:3,value:`Deployment strategies`,id:`deployment-strategies`}]},{depth:2,value:`No-op deployments and rollovers`,id:`no-op-deployments-and-rollovers`},{depth:2,value:`Deployment rollbacks`,id:`deployment-rollbacks`},{depth:2,value:`Stopping deployments`,id:`stopping-deployments`}]}],rawContent:`# Managing deployments

Once you've finished using \`modal run\` or \`modal serve\` to iterate on your Modal
code, it's time to deploy. A Modal deployment creates and then persists an
App and its objects, providing the following benefits:

- Repeated executions of the App's Functions will be grouped under the Deployment,
  aiding observability and usage tracking. Programmatically triggering lots of
  ephemeral App runs can clutter your web and CLI interfaces.
- Function calls are much faster because deployed Functions are persistent and
  reused, not created on-demand by calls. Learn how to trigger deployed
  Functions in
  [Invoking deployed Functions](/docs/guide/trigger-deployed-functions).
- [Scheduled Functions](/docs/guide/cron) will continue scheduling separate from
  any local iteration you do, and will notify you on failure.
- [Web Functions](/docs/guide/webhooks) keep running when you close your laptop,
  and their URL address matches the deployment name.

## Creating deployments

Deployments are created using the [\`modal deploy\`](/docs/cli/latest/deploy) command.

\`\`\`
 % modal deploy -m whisper_pod_transcriber.main
✓ Initialized. View app page at https://modal.com/apps/ap-PYc2Tb7JrkskFUI8U5w0KG.
✓ Created objects.
├── 🔨 Created populate_podcast_metadata.
├── 🔨 Mounted /home/ubuntu/whisper_pod_transcriber at /root/whisper_pod_transcriber
├── 🔨 Created fastapi_app => https://modal-labs-whisper-pod-transcriber-fastapi-app.modal.run
├── 🔨 Mounted /home/ubuntu/whisper_pod_transcriber/whisper_frontend/dist at /assets
├── 🔨 Created search_podcast.
├── 🔨 Created refresh_index.
├── 🔨 Created transcribe_segment.
├── 🔨 Created transcribe_episode..
└── 🔨 Created fetch_episodes.
✓ App deployed! 🎉

View Deployment: https://modal.com/apps/modal-labs/whisper-pod-transcriber
\`\`\`

Running this command on an existing deployment will redeploy the App,
incrementing its version. For detail on how live deployed Apps transition
between versions, see the [Updating deployments](#updating-deployments) section.

Deployments can also be created programmatically using the
[\`app.deploy()\`](/docs/sdk/py/latest/App#deploy) method in Modal's Python SDK.

## Viewing deployments

Deployments can be viewed in the [web UI](/apps) on an App's "Deployment History"
page, or from the command line using the
[\`modal app list\`](/docs/cli/latest/app#modal-app-list) command.

### Deployment events on charts

You can overlay deployment history information on your Function's metric charts by enabling
the **Show Deployments** toggle. Each marker represents one or more deployments
that occurred within a time bucket.

Hovering over a marker shows the version number and timestamp of each deployment, plus a link to the full "Deployment History" page.

![Deployment history overlay on a metric chart](https://modal-cdn.com/cdnbot/deployment-historyt991cvw__b284b7fa.webp)

## Updating deployments

A deployment can create a new App or redeploy an existing deployed App with
a new version. It's useful to understand how Modal handles the transition between
versions when an App is redeployed. In general, Modal aims to support
zero-downtime deployments by gradually transitioning traffic to the new version,
but it is also possible to opt into a sharp cutover between versions.

If the deployment involves building new versions of the Images used by the App,
the build process will need to complete successfully before any new containers
are started. The existing version of the App will continue to handle inputs
during this time. Errors during the build will abort the deployment with no
change to the status of the App.

### Deployment strategies

After the build completes, Modal will start to bring up new containers running
the latest version of the App. The exact mechanics depend on the choice of
deployment strategy, configured with \`--strategy\` in the
[\`modal deploy\`](/docs/cli/latest/deploy) CLI or \`strategy=\` in the
[\`app.deploy()\`](/docs/sdk/py/latest/App#deploy) method.

With the default \`rolling\` strategy, existing containers will continue handling
inputs (using the previous version of the App) until new containers have
completed their cold start. Traffic will shift over to these new containers as
they come online, but old containers will not shut down until they finish
processing any inputs they were assigned.

With the opt-in \`recreate\` strategy, the transition between versions will be
more abrupt. Existing containers will be terminated as soon as the new version
is active, and inputs will queue until new containers come online (including
inputs that were running on old containers, which will be retried on new ones).

The \`rolling\` strategy avoids downtime and is recommended for any production
Apps. The \`recreate\` strategy is primarily useful during development, because
you can be certain that new containers will be used for any inputs sent after
the deployment command returns.

## No-op deployments and rollovers

The App is the unit of deployment. If nothing in the App configuration has
changed, the deployment command will be a no-op, and the App version will not
increment. However, changes to any Function will cause all Functions to update.

It's possible to cycle the containers serving an App without any changes to the
code or configuration by using the [\`modal app
rollover\`](/docs/cli/latest/app#modal-app-rollover) command. This may be
necessary if the App depends on a Secret or some other external resource that is
loaded at container startup and has become invalidated. A rollover event will
appear in the deployment history as a new version. As with a normal deployment,
a rollover can be performed with either a \`rolling\` or \`recreate\` strategy.

## Deployment rollbacks

<Callout variant="gated-feature">
Deployment rollbacks are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.
</Callout>

To quickly reset an App back to a previous version (e.g., if you discover that a
new version has a serious defect), you can perform a deployment _rollback_.
Rollbacks can be triggered from the Deployment History tab in the App dashboard
or using the [\`modal app rollback\`](/docs/cli/latest/app#modal-app-rollback)
CLI. Rollback deployments look like new deployments: they increment the version
number and are attributed to the user who triggered the rollback. But the App's
Functions and metadata will be reset to their previous state independently of
your current App codebase.

## Stopping deployments

Deployed Apps can be stopped in the web UI by clicking the red "Stop app" button on
the App's "Overview" page, or alternatively from the command line using the
[\`modal app stop\`](/docs/cli/latest/app#modal-app-stop) command.

Stopping an App is a destructive action. Apps cannot be restarted from this state;
a new App will need to be deployed from the same source files. Objects associated
with stopped deployments will eventually be garbage collected.
`,meta:{title:`Managing deployments`,description:`Once you’ve finished using modal run or modal serve to iterate on your Modal code, it’s time to deploy. A Modal deployment creates and then persists an App and its objects, providing the following benefits:`}},{toc:y,rawContent:b,meta:x}=v,S=t(`<code>modal deploy</code>`),C=t(`<code>app.deploy()</code>`),w=t(`<code>modal app list</code>`),T=t(`<code>modal deploy</code>`),E=t(`<code>app.deploy()</code>`),D=t(`<code>modal app rollover</code>`),O=t(`Deployment rollbacks are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.`,1),k=t(`<code>modal app rollback</code>`),A=t(`<code>modal app stop</code>`),j=t(`<!> <p>Once you’ve finished using <code>modal run</code> or <code>modal serve</code> to iterate on your Modal
code, it’s time to deploy. A Modal deployment creates and then persists an
App and its objects, providing the following benefits:</p> <ul><li>Repeated executions of the App’s Functions will be grouped under the Deployment,
aiding observability and usage tracking. Programmatically triggering lots of
ephemeral App runs can clutter your web and CLI interfaces.</li> <li>Function calls are much faster because deployed Functions are persistent and
reused, not created on-demand by calls. Learn how to trigger deployed
Functions in <!>.</li> <li><!> will continue scheduling separate from
any local iteration you do, and will notify you on failure.</li> <li><!> keep running when you close your laptop,
and their URL address matches the deployment name.</li></ul> <!> <p>Deployments are created using the <!> command.</p> <!> <p>Running this command on an existing deployment will redeploy the App,
incrementing its version. For detail on how live deployed Apps transition
between versions, see the <!> section.</p> <p>Deployments can also be created programmatically using the <!> method in Modal’s Python SDK.</p> <!> <p>Deployments can be viewed in the <!> on an App’s “Deployment History”
page, or from the command line using the <!> command.</p> <!> <p>You can overlay deployment history information on your Function’s metric charts by enabling
the <strong>Show Deployments</strong> toggle. Each marker represents one or more deployments
that occurred within a time bucket.</p> <p>Hovering over a marker shows the version number and timestamp of each deployment, plus a link to the full “Deployment History” page.</p> <p><!></p> <!> <p>A deployment can create a new App or redeploy an existing deployed App with
a new version. It’s useful to understand how Modal handles the transition between
versions when an App is redeployed. In general, Modal aims to support
zero-downtime deployments by gradually transitioning traffic to the new version,
but it is also possible to opt into a sharp cutover between versions.</p> <p>If the deployment involves building new versions of the Images used by the App,
the build process will need to complete successfully before any new containers
are started. The existing version of the App will continue to handle inputs
during this time. Errors during the build will abort the deployment with no
change to the status of the App.</p> <!> <p>After the build completes, Modal will start to bring up new containers running
the latest version of the App. The exact mechanics depend on the choice of
deployment strategy, configured with <code>--strategy</code> in the <!> CLI or <code>strategy=</code> in the <!> method.</p> <p>With the default <code>rolling</code> strategy, existing containers will continue handling
inputs (using the previous version of the App) until new containers have
completed their cold start. Traffic will shift over to these new containers as
they come online, but old containers will not shut down until they finish
processing any inputs they were assigned.</p> <p>With the opt-in <code>recreate</code> strategy, the transition between versions will be
more abrupt. Existing containers will be terminated as soon as the new version
is active, and inputs will queue until new containers come online (including
inputs that were running on old containers, which will be retried on new ones).</p> <p>The <code>rolling</code> strategy avoids downtime and is recommended for any production
Apps. The <code>recreate</code> strategy is primarily useful during development, because
you can be certain that new containers will be used for any inputs sent after
the deployment command returns.</p> <!> <p>The App is the unit of deployment. If nothing in the App configuration has
changed, the deployment command will be a no-op, and the App version will not
increment. However, changes to any Function will cause all Functions to update.</p> <p>It’s possible to cycle the containers serving an App without any changes to the
code or configuration by using the <!> command. This may be
necessary if the App depends on a Secret or some other external resource that is
loaded at container startup and has become invalidated. A rollover event will
appear in the deployment history as a new version. As with a normal deployment,
a rollover can be performed with either a <code>rolling</code> or <code>recreate</code> strategy.</p> <!> <!> <p>To quickly reset an App back to a previous version (e.g., if you discover that a
new version has a serious defect), you can perform a deployment <em>rollback</em>.
Rollbacks can be triggered from the Deployment History tab in the App dashboard
or using the <!> CLI. Rollback deployments look like new deployments: they increment the version
number and are attributed to the user who triggered the rollback. But the App’s
Functions and metadata will be reset to their previous state independently of
your current App codebase.</p> <!> <p>Deployed Apps can be stopped in the web UI by clicking the red “Stop app” button on
the App’s “Overview” page, or alternatively from the command line using the <!> command.</p> <p>Stopping an App is a destructive action. Apps cannot be restarted from this state;
a new App will need to be deployed from the same source files. Objects associated
with stopped deployments will eventually be garbage collected.</p>`,1);function M(t,y){let b=a(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);g(t,o(()=>b,()=>v,{children:(t,a)=>{var o=j(),g=s(o);p(g,{id:`managing-deployments`,children:(e,t)=>{l(),i(e,r(`Managing deployments`))},$$slots:{default:!0}});var v=c(g,4),y=c(e(v),2);_(c(e(y)),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{l(),i(e,r(`Invoking deployed Functions`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);_(e(b),{href:`/docs/guide/cron`,children:(e,t)=>{l(),i(e,r(`Scheduled Functions`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);_(e(x),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(),n(x),n(v);var M=c(v,2);d(M,{id:`creating-deployments`,children:(e,t)=>{l(),i(e,r(`Creating deployments`))},$$slots:{default:!0}});var N=c(M,2);_(c(e(N)),{href:`/docs/cli/latest/deploy`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);h(P,{code:`%20%25%20modal%20deploy%20-m%20whisper_pod_transcriber.main%0A%E2%9C%93%20Initialized.%20View%20app%20page%20at%20https%3A%2F%2Fmodal.com%2Fapps%2Fap-PYc2Tb7JrkskFUI8U5w0KG.%0A%E2%9C%93%20Created%20objects.%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20populate_podcast_metadata.%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Mounted%20%2Fhome%2Fubuntu%2Fwhisper_pod_transcriber%20at%20%2Froot%2Fwhisper_pod_transcriber%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20fastapi_app%20%3D%3E%20https%3A%2F%2Fmodal-labs-whisper-pod-transcriber-fastapi-app.modal.run%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Mounted%20%2Fhome%2Fubuntu%2Fwhisper_pod_transcriber%2Fwhisper_frontend%2Fdist%20at%20%2Fassets%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20search_podcast.%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20refresh_index.%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20transcribe_segment.%0A%E2%94%9C%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20transcribe_episode..%0A%E2%94%94%E2%94%80%E2%94%80%20%F0%9F%94%A8%20Created%20fetch_episodes.%0A%E2%9C%93%20App%20deployed!%20%F0%9F%8E%89%0A%0AView%20Deployment%3A%20https%3A%2F%2Fmodal.com%2Fapps%2Fmodal-labs%2Fwhisper-pod-transcriber`,lang:`text`});var F=c(P,2);_(c(e(F)),{href:`#updating-deployments`,children:(e,t)=>{l(),i(e,r(`Updating deployments`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);_(c(e(I)),{href:`/docs/sdk/py/latest/App#deploy`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(I);var L=c(I,2);d(L,{id:`viewing-deployments`,children:(e,t)=>{l(),i(e,r(`Viewing deployments`))},$$slots:{default:!0}});var R=c(L,2),z=c(e(R));_(z,{href:`/apps`,children:(e,t)=>{l(),i(e,r(`web UI`))},$$slots:{default:!0}}),_(c(z,2),{href:`/docs/cli/latest/app#modal-app-list`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(R);var B=c(R,2);f(B,{id:`deployment-events-on-charts`,children:(e,t)=>{l(),i(e,r(`Deployment events on charts`))},$$slots:{default:!0}});var V=c(B,6);m(e(V),{src:`https://modal-cdn.com/cdnbot/deployment-historyt991cvw__b284b7fa.webp`,alt:`Deployment history overlay on a metric chart`}),n(V);var H=c(V,2);d(H,{id:`updating-deployments`,children:(e,t)=>{l(),i(e,r(`Updating deployments`))},$$slots:{default:!0}});var U=c(H,6);f(U,{id:`deployment-strategies`,children:(e,t)=>{l(),i(e,r(`Deployment strategies`))},$$slots:{default:!0}});var W=c(U,2),G=c(e(W),3);_(G,{href:`/docs/cli/latest/deploy`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),_(c(G,4),{href:`/docs/sdk/py/latest/App#deploy`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(W);var K=c(W,8);d(K,{id:`no-op-deployments-and-rollovers`,children:(e,t)=>{l(),i(e,r(`No-op deployments and rollovers`))},$$slots:{default:!0}});var q=c(K,4);_(c(e(q)),{href:`/docs/cli/latest/app#modal-app-rollover`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),l(5),n(q);var J=c(q,2);d(J,{id:`deployment-rollbacks`,children:(e,t)=>{l(),i(e,r(`Deployment rollbacks`))},$$slots:{default:!0}});var Y=c(J,2);u(Y,{variant:`gated-feature`,children:(e,t)=>{l();var n=O();l(4),i(e,n)},$$slots:{default:!0}});var X=c(Y,2);_(c(e(X),3),{href:`/docs/cli/latest/app#modal-app-rollback`,children:(e,t)=>{i(e,k())},$$slots:{default:!0}}),l(),n(X);var Z=c(X,2);d(Z,{id:`stopping-deployments`,children:(e,t)=>{l(),i(e,r(`Stopping deployments`))},$$slots:{default:!0}});var Q=c(Z,2);_(c(e(Q)),{href:`/docs/cli/latest/app#modal-app-stop`,children:(e,t)=>{i(e,A())},$$slots:{default:!0}}),l(),n(Q),l(2),i(t,o)},$$slots:{default:!0}}))}export{M as default,v as metadata};
//# sourceMappingURL=CHcTBl_H.js.map
