(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`152b93fa-c24a-4482-b3d0-a951d63dc3c8`,e._sentryDebugIdIdentifier=`sentry-dbid-152b93fa-c24a-4482-b3d0-a951d63dc3c8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Preemption`,id:`preemption`,children:[{depth:2,value:`Preparing for interruptions`,id:`preparing-for-interruptions`},{depth:2,value:`Non-preemptible Functions`,id:`non-preemptible-functions`},{depth:2,value:`Non-preemptible Sandboxes`,id:`non-preemptible-sandboxes`}]}],rawContent:`# Preemption

All Modal Functions are subject to preemption by default.
If a preemption event interrupts a running Function, Modal will gracefully terminate
the Function and restart it on the same input.

Preemptions are rare, but it is always possible that your Function is
interrupted. Long-running Functions such as model training Functions should take
particular care to tolerate interruptions, as likelihood of interruption increases
with Function run duration.

## Preparing for interruptions

Design your applications to be fault and preemption tolerant. Modal will send an
interrupt signal to your container when preemption occurs. This will cause the
Function's [exit handler](/docs/guide/lifecycle-functions#exit) to run, which
can perform any cleanup within its grace period.

Other best practices for handling preemptions include:

- Divide long-running operations into small tasks or use checkpoints so that you
  can save your work frequently. See our [long training example](/docs/examples/long-training)
  for a practical demonstration of checkpointing.
- Ensure preemptible operations are safely retryable (ie. idempotent).

## Non-preemptible Functions

If you require Functions that are guaranteed not to be preempted, you may set the \`nonpreemptible\`
parameter (available starting in client version v1.2.3) to \`True\` in the \`@app.function()\` or \`@app.cls()\` decorator.
Note that a 3x multiplier will be applied to the [list price](https://modal.com/pricing) for CPU and Memory usage when
\`nonpreemptible\` is set to \`True\`.

**Note:** The \`nonpreemptible\` parameter is not supported for GPU Functions.

## Non-preemptible Sandboxes

Modal Sandboxes are not subject to preemption, except in the case where a \`gpu\`
requirement is specified. This is because of availability and scheduling latency constraints.
`,meta:{title:`Preemption`,description:`All Modal Functions are subject to preemption by default. If a preemption event interrupts a running Function, Modal will gracefully terminate the Function and restart it on the same input.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>All Modal Functions are subject to preemption by default.
If a preemption event interrupts a running Function, Modal will gracefully terminate
the Function and restart it on the same input.</p> <p>Preemptions are rare, but it is always possible that your Function is
interrupted. Long-running Functions such as model training Functions should take
particular care to tolerate interruptions, as likelihood of interruption increases
with Function run duration.</p> <!> <p>Design your applications to be fault and preemption tolerant. Modal will send an
interrupt signal to your container when preemption occurs. This will cause the
Function’s <!> to run, which
can perform any cleanup within its grace period.</p> <p>Other best practices for handling preemptions include:</p> <ul><li>Divide long-running operations into small tasks or use checkpoints so that you
can save your work frequently. See our <!> for a practical demonstration of checkpointing.</li> <li>Ensure preemptible operations are safely retryable (ie. idempotent).</li></ul> <!> <p>If you require Functions that are guaranteed not to be preempted, you may set the <code>nonpreemptible</code> parameter (available starting in client version v1.2.3) to <code>True</code> in the <code>@app.function()</code> or <code>@app.cls()</code> decorator.
Note that a 3x multiplier will be applied to the <!> for CPU and Memory usage when <code>nonpreemptible</code> is set to <code>True</code>.</p> <p><strong>Note:</strong> The <code>nonpreemptible</code> parameter is not supported for GPU Functions.</p> <!> <p>Modal Sandboxes are not subject to preemption, except in the case where a <code>gpu</code> requirement is specified. This is because of availability and scheduling latency constraints.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);d(f,{id:`preemption`,children:(e,t)=>{l(),i(e,r(`Preemption`))},$$slots:{default:!0}});var m=c(f,6);u(m,{id:`preparing-for-interruptions`,children:(e,t)=>{l(),i(e,r(`Preparing for interruptions`))},$$slots:{default:!0}});var h=c(m,2);p(c(e(h)),{href:`/docs/guide/lifecycle-functions#exit`,children:(e,t)=>{l(),i(e,r(`exit handler`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4),_=e(g);p(c(e(_)),{href:`/docs/examples/long-training`,children:(e,t)=>{l(),i(e,r(`long training example`))},$$slots:{default:!0}}),l(),n(_),l(2),n(g);var y=c(g,2);u(y,{id:`non-preemptible-functions`,children:(e,t)=>{l(),i(e,r(`Non-preemptible Functions`))},$$slots:{default:!0}});var b=c(y,2);p(c(e(b),9),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`list price`))},$$slots:{default:!0}}),l(5),n(b),u(c(b,4),{id:`non-preemptible-sandboxes`,children:(e,t)=>{l(),i(e,r(`Non-preemptible Sandboxes`))},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CvGgPrx1.js.map
