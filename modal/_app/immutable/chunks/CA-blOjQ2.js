(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cd11eb8b-e2c6-4c70-a3d1-c2d6161fbbf9`,e._sentryDebugIdIdentifier=`sentry-dbid-cd11eb8b-e2c6-4c70-a3d1-c2d6161fbbf9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import"./DYSGKh1I.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Region selection`,id:`region-selection`,children:[{depth:2,value:`Specifying a container region`,id:`specifying-a-container-region`,children:[{depth:3,value:`Pricing`,id:`pricing`},{depth:3,value:`Container region options`,id:`container-region-options`}]},{depth:2,value:`Regional routing`,id:`regional-routing`,children:[{depth:3,value:`Specifying a routing region`,id:`specifying-a-routing-region`},{depth:3,value:`Current restrictions`,id:`current-restrictions`}]},{depth:2,value:`Optimizing latency`,id:`optimizing-latency`}]}],rawContent:`# Region selection

Modal runs containers globally across multiple different clouds. By default, all inputs to Modal Functions are routed through our servers in Virginia, USA (\`us-east\`) before being sent to a container for execution.

You can observe the location identifier of a container [via an environment variable](/docs/guide/environment_variables). Logging this environment variable alongside latency information can reveal when geography is impacting your application performance.

## Specifying a container region

To run your Modal Function containers in a specific region, pass a \`region=\` argument to the \`function\` decorator:

\`\`\`python
@app.function(region=["us-west"])
def f():
    ...
\`\`\`

Sandboxes accept the same \`region=\` argument on \`Sandbox.create\`:

\`\`\`python notest
sb = modal.Sandbox.create(region=["us-west"], app=app)
\`\`\`

This can be particularly useful when running a latency-sensitive app that needs to run near an external DB.

### Pricing

A multiplier on top of our [base usage pricing](/pricing) will be applied to any Function or Sandbox that has a container region defined.

| **Region type**         | **Multiplier** |
| ----------------------- | -------------- |
| Broad (e.g. \`us\`)       | 1.5x           |
| Narrow (e.g. \`us-west\`) | 1.75x          |

Here's an example: let's say you have a Function or Sandbox container that uses 1 T4, 1 CPU core, and 1GB memory. You've specified that it should run in \`us-west\`. The cost to run it for 1 hour would be \`((T4 hourly cost) + (CPU hourly cost for one core) + (Memory hourly cost for one GB)) * 1.75\`.

If you specify multiple container regions and they span the two categories above, we will apply the smaller of the two multipliers.

### Container region options

Modal offers different levels of granularity for container regions. Use broader regions when possible, as this increases the pool of available resources your Function or Sandbox containers can be assigned to, which improves cold-start time and availability.

\`\`\`
  Broad          Narrow               Notes
 ===========================================================
  "us"                                United States
                 "us-east"
                 "us-central"
                 "us-south"
                 "us-west"
------------------------------------------------------------
  "eu"                                European Economic Area
                 "eu-west"
                 "eu-north"
                 "eu-south"
------------------------------------------------------------
  "ap"                                Asia-Pacific
                 "ap-northeast"
                 "ap-southeast"
                 "ap-south"
                 "ap-melbourne"
                 "jp"                 Japan
                 "au"                 Australia
------------------------------------------------------------
  "uk"                                United Kingdom
------------------------------------------------------------
  "ca"                                Canada
------------------------------------------------------------
  "me"                                Middle East
------------------------------------------------------------
  "sa"                                South America
------------------------------------------------------------
  "af"                                Africa
------------------------------------------------------------
  "mx"                                Mexico
\`\`\`

Need access to more granular region definitions? Contact [sales@modal.com](mailto:sales@modal.com).

## Regional routing

In addition to letting you specify the region a Function's containers run in, Modal also allows you to specify which region your inputs and outputs will be routed through to reduce network overhead. By default, this is \`us-east\` (Virginia, USA).

This doesn't apply to Sandboxes, as most operations go directly to the container (with some minor exceptions that are routed through \`us-east\`).

### Specifying a routing region

To have your Modal Function's traffic route through a specific region, pass a \`routing_region=\` argument to the \`function\` decorator.

\`\`\`python
@app.function(routing_region="us-west")
def f():
    ...
\`\`\`

The valid options for \`routing_region=\` are:

- \`us-east\` (Virginia, USA)
- \`us-west\` (Oregon, USA)
- \`ca-central\` (Montreal, Canada)
- \`eu-west\` (Dublin, Ireland)
- \`ap-south\` (Mumbai, India)

### Current restrictions

\`routing_region=\` can only be set during the initial deployment of a Function and cannot be changed in a subsequent redeployment. To change the routing region, a new Function should be created. Functions specifying a routing region outside of \`us-east\` can only be invoked with \`.remote()\` or \`.map()\` or via HTTP for [Web Functions](/docs/guide/webhooks).

[Inputs and outputs larger than 2 MiB](/docs/guide/security#function-inputs-and-outputs) are still uploaded to object storage in \`us-east\`.

## Optimizing latency

Modal has a variety of tools to optimize network latency--even down to ~10ms in extreme cases like real-time robotics. Using container region selection in conjunction with a nearby routing region can eliminate significant network overhead.

[Cloudping.co](https://www.cloudping.co) provides good estimates of the latency between regions. For example, the round-trip latency between AWS \`us-east\` (Virginia, USA) and \`us-west\` (Oregon, USA) is around 60ms.

Splitting out regional deployments with separate Functions can be done like so:

\`\`\`python
def f():
    ...

@app.function(region=["us-central", "us-west"], routing_region="us-west")
def f_us_west():
    return f()

@app.function(region="ap", routing_region="ap-south")
def f_ap_south():
    return f()
\`\`\`

To optimize latency further, please contact us on [Slack](https://modal.com/slack) or at [support@modal.com](mailto:support@modal.com).
`,meta:{title:`Region selection`,description:`Modal runs containers globally across multiple different clouds. By default, all inputs to Modal Functions are routed through our servers in Virginia, USA (us-east) before being sent to a container for execution.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<thead><tr><th><strong>Region type</strong></th><th><strong>Multiplier</strong></th></tr></thead> <tbody><tr><td>Broad (e.g. <code>us</code>)</td><td>1.5x</td></tr><tr><td>Narrow (e.g. <code>us-west</code>)</td><td>1.75x</td></tr></tbody>`,1),S=t(`<!> <p>Modal runs containers globally across multiple different clouds. By default, all inputs to Modal Functions are routed through our servers in Virginia, USA (<code>us-east</code>) before being sent to a container for execution.</p> <p>You can observe the location identifier of a container <!>. Logging this environment variable alongside latency information can reveal when geography is impacting your application performance.</p> <!> <p>To run your Modal Function containers in a specific region, pass a <code>region=</code> argument to the <code>function</code> decorator:</p> <!> <p>Sandboxes accept the same <code>region=</code> argument on <code>Sandbox.create</code>:</p> <!> <p>This can be particularly useful when running a latency-sensitive app that needs to run near an external DB.</p> <!> <p>A multiplier on top of our <!> will be applied to any Function or Sandbox that has a container region defined.</p> <!> <p>Here’s an example: let’s say you have a Function or Sandbox container that uses 1 T4, 1 CPU core, and 1GB memory. You’ve specified that it should run in <code>us-west</code>. The cost to run it for 1 hour would be <code>((T4 hourly cost) + (CPU hourly cost for one core) + (Memory hourly cost for one GB)) * 1.75</code>.</p> <p>If you specify multiple container regions and they span the two categories above, we will apply the smaller of the two multipliers.</p> <!> <p>Modal offers different levels of granularity for container regions. Use broader regions when possible, as this increases the pool of available resources your Function or Sandbox containers can be assigned to, which improves cold-start time and availability.</p> <!> <p>Need access to more granular region definitions? Contact <!>.</p> <!> <p>In addition to letting you specify the region a Function’s containers run in, Modal also allows you to specify which region your inputs and outputs will be routed through to reduce network overhead. By default, this is <code>us-east</code> (Virginia, USA).</p> <p>This doesn’t apply to Sandboxes, as most operations go directly to the container (with some minor exceptions that are routed through <code>us-east</code>).</p> <!> <p>To have your Modal Function’s traffic route through a specific region, pass a <code>routing_region=</code> argument to the <code>function</code> decorator.</p> <!> <p>The valid options for <code>routing_region=</code> are:</p> <ul><li><code>us-east</code> (Virginia, USA)</li> <li><code>us-west</code> (Oregon, USA)</li> <li><code>ca-central</code> (Montreal, Canada)</li> <li><code>eu-west</code> (Dublin, Ireland)</li> <li><code>ap-south</code> (Mumbai, India)</li></ul> <!> <p><code>routing_region=</code> can only be set during the initial deployment of a Function and cannot be changed in a subsequent redeployment. To change the routing region, a new Function should be created. Functions specifying a routing region outside of <code>us-east</code> can only be invoked with <code>.remote()</code> or <code>.map()</code> or via HTTP for <!>.</p> <p><!> are still uploaded to object storage in <code>us-east</code>.</p> <!> <p>Modal has a variety of tools to optimize network latency—even down to ~10ms in extreme cases like real-time robotics. Using container region selection in conjunction with a nearby routing region can eliminate significant network overhead.</p> <p><!> provides good estimates of the latency between regions. For example, the round-trip latency between AWS <code>us-east</code> (Virginia, USA) and <code>us-west</code> (Oregon, USA) is around 60ms.</p> <p>Splitting out regional deployments with separate Functions can be done like so:</p> <!> <p>To optimize latency further, please contact us on <!> or at <!>.</p>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),h=s(o);f(h,{id:`region-selection`,children:(e,t)=>{l(),i(e,r(`Region selection`))},$$slots:{default:!0}});var _=c(h,4);g(c(e(_)),{href:`/docs/guide/environment_variables`,children:(e,t)=>{l(),i(e,r(`via an environment variable`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`specifying-a-container-region`,children:(e,t)=>{l(),i(e,r(`Specifying a container region`))},$$slots:{default:!0}});var y=c(v,4);m(y,{code:`%40app.function(region%3D%5B%22us-west%22%5D)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var b=c(y,4);m(b,{code:`sb%20%3D%20modal.Sandbox.create(region%3D%5B%22us-west%22%5D%2C%20app%3Dapp)`,lang:`python`});var C=c(b,4);d(C,{id:`pricing`,children:(e,t)=>{l(),i(e,r(`Pricing`))},$$slots:{default:!0}});var w=c(C,2);g(c(e(w)),{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`base usage pricing`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(T,{children:(e,t)=>{var n=x();l(2),i(e,n)},$$slots:{default:!0}});var E=c(T,6);d(E,{id:`container-region-options`,children:(e,t)=>{l(),i(e,r(`Container region options`))},$$slots:{default:!0}});var D=c(E,4);m(D,{code:`%20%20Broad%20%20%20%20%20%20%20%20%20%20Narrow%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Notes%0A%20%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0A%20%20%22us%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20United%20States%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-east%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-central%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-south%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-west%22%0A------------------------------------------------------------%0A%20%20%22eu%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20European%20Economic%20Area%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22eu-west%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22eu-north%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22eu-south%22%0A------------------------------------------------------------%0A%20%20%22ap%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Asia-Pacific%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-northeast%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-southeast%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-south%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-melbourne%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22jp%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Japan%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22au%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Australia%0A------------------------------------------------------------%0A%20%20%22uk%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20United%20Kingdom%0A------------------------------------------------------------%0A%20%20%22ca%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Canada%0A------------------------------------------------------------%0A%20%20%22me%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Middle%20East%0A------------------------------------------------------------%0A%20%20%22sa%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20South%20America%0A------------------------------------------------------------%0A%20%20%22af%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Africa%0A------------------------------------------------------------%0A%20%20%22mx%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Mexico`,lang:`text`});var O=c(D,2);g(c(e(O)),{href:`mailto:sales@modal.com`,children:(e,t)=>{l(),i(e,r(`sales@modal.com`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);u(k,{id:`regional-routing`,children:(e,t)=>{l(),i(e,r(`Regional routing`))},$$slots:{default:!0}});var A=c(k,6);d(A,{id:`specifying-a-routing-region`,children:(e,t)=>{l(),i(e,r(`Specifying a routing region`))},$$slots:{default:!0}});var j=c(A,4);m(j,{code:`%40app.function(routing_region%3D%22us-west%22)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var M=c(j,6);d(M,{id:`current-restrictions`,children:(e,t)=>{l(),i(e,r(`Current restrictions`))},$$slots:{default:!0}});var N=c(M,2);g(c(e(N),8),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);g(e(P),{href:`/docs/guide/security#function-inputs-and-outputs`,children:(e,t)=>{l(),i(e,r(`Inputs and outputs larger than 2 MiB`))},$$slots:{default:!0}}),l(3),n(P);var F=c(P,2);u(F,{id:`optimizing-latency`,children:(e,t)=>{l(),i(e,r(`Optimizing latency`))},$$slots:{default:!0}});var I=c(F,4);g(e(I),{href:`https://www.cloudping.co`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloudping.co`))},$$slots:{default:!0}}),l(5),n(I);var L=c(I,4);m(L,{code:`def%20f()%3A%0A%20%20%20%20...%0A%0A%40app.function(region%3D%5B%22us-central%22%2C%20%22us-west%22%5D%2C%20routing_region%3D%22us-west%22)%0Adef%20f_us_west()%3A%0A%20%20%20%20return%20f()%0A%0A%40app.function(region%3D%22ap%22%2C%20routing_region%3D%22ap-south%22)%0Adef%20f_ap_south()%3A%0A%20%20%20%20return%20f()`,lang:`python`});var R=c(L,2),z=c(e(R));g(z,{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),g(c(z,2),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(R),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=CA-blOjQ2.js.map
