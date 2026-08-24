(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`67625e72-bbe9-4c32-b001-a1674537f201`,e._sentryDebugIdIdentifier=`sentry-dbid-67625e72-bbe9-4c32-b001-a1674537f201`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Environment variables`,id:`environment-variables`,children:[{depth:2,value:`Container runtime environment variables`,id:`container-runtime-environment-variables`},{depth:2,value:`Function runtime environment variables`,id:`function-runtime-environment-variables`},{depth:2,value:`Sandbox environment variables`,id:`sandbox-environment-variables`},{depth:2,value:`Container image environment variables`,id:`container-image-environment-variables`}]}],rawContent:`# Environment variables

The Modal runtime sets several environment variables during initialization. The
keys for these environment variables are reserved and cannot be overridden by
your Function or Sandbox configuration.

These variables provide information about the container's runtime
environment.

## Container runtime environment variables

The following variables are present in every Modal container:

- **\`MODAL_CLOUD_PROVIDER\`** — Modal executes containers across a number of cloud
  providers ([AWS](https://aws.amazon.com/), [GCP](https://cloud.google.com/),
  [OCI](https://www.oracle.com/cloud/)). This variable specifies which cloud
  provider the Modal container is running within.
- **\`MODAL_IMAGE_ID\`** — The ID of the
  [\`modal.Image\`](/docs/sdk/py/latest/Image) used by the Modal container.
- **\`MODAL_REGION\`** — This will correspond to a geographic area identifier from
  the cloud provider associated with the Modal container (see above). For AWS, the
  identifier is a "region". For GCP it is a "zone", and for OCI it is an
  "availability domain". Example values are \`us-east-1\` (AWS), \`us-central1\`
  (GCP), \`us-ashburn-1\` (OCI). See the [full list here](/docs/guide/region-selection#container-region-options).
- **\`MODAL_TASK_ID\`** — The ID of the container running the Modal Function or Sandbox.

## Function runtime environment variables

The following variables are present in containers running Modal Functions:

- **\`MODAL_ENVIRONMENT\`** — The name of the
  [Modal Environment](/docs/guide/environments) the container is running within.
- **\`MODAL_IS_REMOTE\`** - Set to '1' to indicate that Modal Function code is running in
  a remote container.
- **\`MODAL_IDENTITY_TOKEN\`** — An [OIDC token](/docs/guide/oidc-integration)
  encoding the identity of the Modal Function.

## Sandbox environment variables

The following variables are present within [\`modal.Sandbox\`](/docs/sdk/py/latest/Sandbox) instances.

- **\`MODAL_SANDBOX_ID\`** — The ID of the Sandbox.

## Container image environment variables

The container image layers used by a \`modal.Image\` may set
environment variables. These variables will be present within your container's runtime
environment. For example, the
[\`debian_slim\`](/docs/sdk/py/latest/Image#debian_slim) image sets the
\`GPG_KEY\` variable.

To override image variables or set new ones, use the
[\`.env\`](https://modal.com/docs/sdk/py/latest/Image#env) method provided by
\`modal.Image\`.
`,meta:{title:`Environment variables`,description:`The Modal runtime sets several environment variables during initialization. The keys for these environment variables are reserved and cannot be overridden by your Function or Sandbox configuration.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>modal.Image</code>`),y=t(`<code>modal.Sandbox</code>`),b=t(`<code>debian_slim</code>`),x=t(`<code>.env</code>`),S=t(`<!> <p>The Modal runtime sets several environment variables during initialization. The
keys for these environment variables are reserved and cannot be overridden by
your Function or Sandbox configuration.</p> <p>These variables provide information about the container’s runtime
environment.</p> <!> <p>The following variables are present in every Modal container:</p> <ul><li><strong><code>MODAL_CLOUD_PROVIDER</code></strong> — Modal executes containers across a number of cloud
providers (<!>, <!>, <!>). This variable specifies which cloud
provider the Modal container is running within.</li> <li><strong><code>MODAL_IMAGE_ID</code></strong> — The ID of the <!> used by the Modal container.</li> <li><strong><code>MODAL_REGION</code></strong> — This will correspond to a geographic area identifier from
the cloud provider associated with the Modal container (see above). For AWS, the
identifier is a “region”. For GCP it is a “zone”, and for OCI it is an
“availability domain”. Example values are <code>us-east-1</code> (AWS), <code>us-central1</code> (GCP), <code>us-ashburn-1</code> (OCI). See the <!>.</li> <li><strong><code>MODAL_TASK_ID</code></strong> — The ID of the container running the Modal Function or Sandbox.</li></ul> <!> <p>The following variables are present in containers running Modal Functions:</p> <ul><li><strong><code>MODAL_ENVIRONMENT</code></strong> — The name of the <!> the container is running within.</li> <li><strong><code>MODAL_IS_REMOTE</code></strong> - Set to ‘1’ to indicate that Modal Function code is running in
a remote container.</li> <li><strong><code>MODAL_IDENTITY_TOKEN</code></strong> — An <!> encoding the identity of the Modal Function.</li></ul> <!> <p>The following variables are present within <!> instances.</p> <ul><li><strong><code>MODAL_SANDBOX_ID</code></strong> — The ID of the Sandbox.</li></ul> <!> <p>The container image layers used by a <code>modal.Image</code> may set
environment variables. These variables will be present within your container’s runtime
environment. For example, the <!> image sets the <code>GPG_KEY</code> variable.</p> <p>To override image variables or set new ones, use the <!> method provided by <code>modal.Image</code>.</p>`,1);function C(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=S(),f=s(o);d(f,{id:`environment-variables`,children:(e,t)=>{l(),i(e,r(`Environment variables`))},$$slots:{default:!0}});var m=c(f,6);u(m,{id:`container-runtime-environment-variables`,children:(e,t)=>{l(),i(e,r(`Container runtime environment variables`))},$$slots:{default:!0}});var h=c(m,4),g=e(h),_=c(e(g),2);p(_,{href:`https://aws.amazon.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS`))},$$slots:{default:!0}});var C=c(_,2);p(C,{href:`https://cloud.google.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GCP`))},$$slots:{default:!0}}),p(c(C,2),{href:`https://www.oracle.com/cloud/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OCI`))},$$slots:{default:!0}}),l(),n(g);var w=c(g,2);p(c(e(w),2),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(c(e(T),8),{href:`/docs/guide/region-selection#container-region-options`,children:(e,t)=>{l(),i(e,r(`full list here`))},$$slots:{default:!0}}),l(),n(T),l(2),n(h);var E=c(h,2);u(E,{id:`function-runtime-environment-variables`,children:(e,t)=>{l(),i(e,r(`Function runtime environment variables`))},$$slots:{default:!0}});var D=c(E,4),O=e(D);p(c(e(O),2),{href:`/docs/guide/environments`,children:(e,t)=>{l(),i(e,r(`Modal Environment`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);p(c(e(k),2),{href:`/docs/guide/oidc-integration`,children:(e,t)=>{l(),i(e,r(`OIDC token`))},$$slots:{default:!0}}),l(),n(k),n(D);var A=c(D,2);u(A,{id:`sandbox-environment-variables`,children:(e,t)=>{l(),i(e,r(`Sandbox environment variables`))},$$slots:{default:!0}});var j=c(A,2);p(c(e(j)),{href:`/docs/sdk/py/latest/Sandbox`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);u(M,{id:`container-image-environment-variables`,children:(e,t)=>{l(),i(e,r(`Container image environment variables`))},$$slots:{default:!0}});var N=c(M,2);p(c(e(N),3),{href:`/docs/sdk/py/latest/Image#debian_slim`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(3),n(N);var P=c(N,2);p(c(e(P)),{href:`https://modal.com/docs/sdk/py/latest/Image#env`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(3),n(P),i(t,o)},$$slots:{default:!0}}))}export{C as default,m as metadata};
//# sourceMappingURL=BtPWfecY2.js.map
