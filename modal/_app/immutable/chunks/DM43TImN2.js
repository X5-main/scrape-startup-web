(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`88b39e6c-22d5-4faa-937d-c57c8f303471`,e._sentryDebugIdIdentifier=`sentry-dbid-88b39e6c-22d5-4faa-937d-c57c8f303471`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{n as f}from"./JPsrybyr.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`Complete reference for the Modal command-line interface. Documentation for run, deploy, serve, shell, and all modal CLI commands.`,toc:[{depth:1,value:`CLI Reference`,id:`cli-reference`,children:[{depth:2,value:`Commands`,id:`commands`},{depth:2,value:`Deployments`,id:`deployments`},{depth:2,value:`Storage`,id:`storage`},{depth:2,value:`Onboarding`,id:`onboarding`},{depth:2,value:`Configuration`,id:`configuration`},{depth:2,value:`Observability`,id:`observability`}]}],rawContent:`# CLI Reference

This is the reference for the \`modal\` command-line interface, installed
alongside the [\`modal\`](https://pypi.org/project/modal/) Python package.


## Commands

|  |  |
| --- | --- |
| [\`modal curl\`](/docs/cli/latest/curl) | Send an authenticated request to a Modal endpoint. |
| [\`modal deploy\`](/docs/cli/latest/deploy) | Deploy a Modal application. |
| [\`modal serve\`](/docs/cli/latest/serve) | Expose Web Functions with hot-reloading on code changes. |
| [\`modal shell\`](/docs/cli/latest/shell) | Run a command or interactive shell inside a Modal container. |
| [\`modal run\`](/docs/cli/latest/run) | Run a Modal function or local entrypoint. |

## Deployments

|  |  |
| --- | --- |
| [\`modal app\`](/docs/cli/latest/app) | Manage deployed and running apps. |
| [\`modal container\`](/docs/cli/latest/container) | Manage and connect to running containers. |
| [\`modal endpoint\`](/docs/cli/latest/endpoint) | Create and manage LLM inference endpoints. |

## Storage

|  |  |
| --- | --- |
| [\`modal image\`](/docs/cli/latest/image) | Manage Images. |
| [\`modal dict\`](/docs/cli/latest/dict) | Manage \`modal.Dict\` objects and inspect their contents. |
| [\`modal secret\`](/docs/cli/latest/secret) | Manage secrets. |
| [\`modal queue\`](/docs/cli/latest/queue) | Manage \`modal.Queue\` objects and inspect their contents. |
| [\`modal volume\`](/docs/cli/latest/volume) | Read and edit \`modal.Volume\` volumes. |

## Onboarding

|  |  |
| --- | --- |
| [\`modal setup\`](/docs/cli/latest/setup) | Bootstrap Modal's configuration. |
| [\`modal bootstrap\`](/docs/cli/latest/bootstrap) | Initialize a sample Modal App. |

## Configuration

|  |  |
| --- | --- |
| [\`modal workspace\`](/docs/cli/latest/workspace) | Interact with the current Modal Workspace. |
| [\`modal environment\`](/docs/cli/latest/environment) | Create and interact with Environments |
| [\`modal profile\`](/docs/cli/latest/profile) | Switch between Modal profiles. |
| [\`modal config\`](/docs/cli/latest/config) | Manage client configuration for the current profile. |
| [\`modal token\`](/docs/cli/latest/token) | Manage tokens. |
| [\`modal skills\`](/docs/cli/latest/skills) | Install and update Modal's agent skills. |

## Observability

|  |  |
| --- | --- |
| [\`modal billing\`](/docs/cli/latest/billing) | View workspace billing information. |
| [\`modal changelog\`](/docs/cli/latest/changelog) | Fetch release notes from the Modal changelog. |
| [\`modal dashboard\`](/docs/cli/latest/dashboard) | Open the Modal Dashboard in a web browser. |
`,meta:{title:`CLI Reference`,description:`Complete reference for the Modal command-line interface. Documentation for run, deploy, serve, shell, and all modal CLI commands.`}},{description:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal</code>`),x=t(`<code>modal curl</code>`),S=t(`<code>modal deploy</code>`),C=t(`<code>modal serve</code>`),w=t(`<code>modal shell</code>`),T=t(`<code>modal run</code>`),ee=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Send an authenticated request to a Modal endpoint.</td></tr><tr><td><!></td><td>Deploy a Modal application.</td></tr><tr><td><!></td><td>Expose Web Functions with hot-reloading on code changes.</td></tr><tr><td><!></td><td>Run a command or interactive shell inside a Modal container.</td></tr><tr><td><!></td><td>Run a Modal function or local entrypoint.</td></tr></tbody>`,1),te=t(`<code>modal app</code>`),ne=t(`<code>modal container</code>`),re=t(`<code>modal endpoint</code>`),ie=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Manage deployed and running apps.</td></tr><tr><td><!></td><td>Manage and connect to running containers.</td></tr><tr><td><!></td><td>Create and manage LLM inference endpoints.</td></tr></tbody>`,1),E=t(`<code>modal image</code>`),D=t(`<code>modal dict</code>`),O=t(`<code>modal secret</code>`),k=t(`<code>modal queue</code>`),A=t(`<code>modal volume</code>`),j=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Manage Images.</td></tr><tr><td><!></td><td>Manage <code>modal.Dict</code> objects and inspect their contents.</td></tr><tr><td><!></td><td>Manage secrets.</td></tr><tr><td><!></td><td>Manage <code>modal.Queue</code> objects and inspect their contents.</td></tr><tr><td><!></td><td>Read and edit <code>modal.Volume</code> volumes.</td></tr></tbody>`,1),M=t(`<code>modal setup</code>`),N=t(`<code>modal bootstrap</code>`),P=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Bootstrap Modal’s configuration.</td></tr><tr><td><!></td><td>Initialize a sample Modal App.</td></tr></tbody>`,1),F=t(`<code>modal workspace</code>`),I=t(`<code>modal environment</code>`),L=t(`<code>modal profile</code>`),R=t(`<code>modal config</code>`),z=t(`<code>modal token</code>`),B=t(`<code>modal skills</code>`),V=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Interact with the current Modal Workspace.</td></tr><tr><td><!></td><td>Create and interact with Environments</td></tr><tr><td><!></td><td>Switch between Modal profiles.</td></tr><tr><td><!></td><td>Manage client configuration for the current profile.</td></tr><tr><td><!></td><td>Manage tokens.</td></tr><tr><td><!></td><td>Install and update Modal’s agent skills.</td></tr></tbody>`,1),H=t(`<code>modal billing</code>`),U=t(`<code>modal changelog</code>`),W=t(`<code>modal dashboard</code>`),G=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>View workspace billing information.</td></tr><tr><td><!></td><td>Fetch release notes from the Modal changelog.</td></tr><tr><td><!></td><td>Open the Modal Dashboard in a web browser.</td></tr></tbody>`,1),K=t(`<!> <p>This is the reference for the <code>modal</code> command-line interface, installed
alongside the <!> Python package.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`,1);function q(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=K(),p=s(o);d(p,{id:`cli-reference`,children:(e,t)=>{l(),i(e,r(`CLI Reference`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h),3),{href:`https://pypi.org/project/modal/`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`commands`,children:(e,t)=>{l(),i(e,r(`Commands`))},$$slots:{default:!0}});var _=c(g,2);f(_,{children:(t,r)=>{var a=ee(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/curl`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/deploy`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),n(p),l(),n(f);var h=c(f),g=e(h);m(e(g),{href:`/docs/cli/latest/serve`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),n(g),l(),n(h);var _=c(h),v=e(_);m(e(v),{href:`/docs/cli/latest/shell`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),n(v),l(),n(_);var y=c(_),b=e(y);m(e(b),{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),n(b),l(),n(y),n(o),i(t,a)},$$slots:{default:!0}});var v=c(_,2);u(v,{id:`deployments`,children:(e,t)=>{l(),i(e,r(`Deployments`))},$$slots:{default:!0}});var y=c(v,2);f(y,{children:(t,r)=>{var a=ie(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/app`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/container`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),n(p),l(),n(f);var h=c(f),g=e(h);m(e(g),{href:`/docs/cli/latest/endpoint`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),n(g),l(),n(h),n(o),i(t,a)},$$slots:{default:!0}});var q=c(y,2);u(q,{id:`storage`,children:(e,t)=>{l(),i(e,r(`Storage`))},$$slots:{default:!0}});var J=c(q,2);f(J,{children:(t,r)=>{var a=j(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/image`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/dict`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),n(p),l(),n(f);var h=c(f),g=e(h);m(e(g),{href:`/docs/cli/latest/secret`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),n(g),l(),n(h);var _=c(h),v=e(_);m(e(v),{href:`/docs/cli/latest/queue`,children:(e,t)=>{i(e,k())},$$slots:{default:!0}}),n(v),l(),n(_);var y=c(_),b=e(y);m(e(b),{href:`/docs/cli/latest/volume`,children:(e,t)=>{i(e,A())},$$slots:{default:!0}}),n(b),l(),n(y),n(o),i(t,a)},$$slots:{default:!0}});var Y=c(J,2);u(Y,{id:`onboarding`,children:(e,t)=>{l(),i(e,r(`Onboarding`))},$$slots:{default:!0}});var X=c(Y,2);f(X,{children:(t,r)=>{var a=P(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/setup`,children:(e,t)=>{i(e,M())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/bootstrap`,children:(e,t)=>{i(e,N())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var Z=c(X,2);u(Z,{id:`configuration`,children:(e,t)=>{l(),i(e,r(`Configuration`))},$$slots:{default:!0}});var Q=c(Z,2);f(Q,{children:(t,r)=>{var a=V(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/workspace`,children:(e,t)=>{i(e,F())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/environment`,children:(e,t)=>{i(e,I())},$$slots:{default:!0}}),n(p),l(),n(f);var h=c(f),g=e(h);m(e(g),{href:`/docs/cli/latest/profile`,children:(e,t)=>{i(e,L())},$$slots:{default:!0}}),n(g),l(),n(h);var _=c(h),v=e(_);m(e(v),{href:`/docs/cli/latest/config`,children:(e,t)=>{i(e,R())},$$slots:{default:!0}}),n(v),l(),n(_);var y=c(_),b=e(y);m(e(b),{href:`/docs/cli/latest/token`,children:(e,t)=>{i(e,z())},$$slots:{default:!0}}),n(b),l(),n(y);var x=c(y),S=e(x);m(e(S),{href:`/docs/cli/latest/skills`,children:(e,t)=>{i(e,B())},$$slots:{default:!0}}),n(S),l(),n(x),n(o),i(t,a)},$$slots:{default:!0}});var $=c(Q,2);u($,{id:`observability`,children:(e,t)=>{l(),i(e,r(`Observability`))},$$slots:{default:!0}}),f(c($,2),{children:(t,r)=>{var a=G(),o=c(s(a),2),u=e(o),d=e(u);m(e(d),{href:`/docs/cli/latest/billing`,children:(e,t)=>{i(e,H())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);m(e(p),{href:`/docs/cli/latest/changelog`,children:(e,t)=>{i(e,U())},$$slots:{default:!0}}),n(p),l(),n(f);var h=c(f),g=e(h);m(e(g),{href:`/docs/cli/latest/dashboard`,children:(e,t)=>{i(e,W())},$$slots:{default:!0}}),n(g),l(),n(h),n(o),i(t,a)},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{q as default,h as metadata};
//# sourceMappingURL=DM43TImN2.js.map
