(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`80da5b59-5e9f-41bd-b5fb-85370fa79eb9`,e._sentryDebugIdIdentifier=`sentry-dbid-80da5b59-5e9f-41bd-b5fb-85370fa79eb9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Failures and retries`,id:`failures-and-retries`,children:[{depth:2,value:`Automatically recover from flakes with retries`,id:`automatically-recover-from-flakes-with-retries`},{depth:2,value:`Handle failures in Function.map`,id:`handle-failures-in-functionmap`},{depth:2,value:`Container crashes`,id:`container-crashes`}]}],rawContent:`# Failures and retries

Failure is part of life. Sometimes you just have to retry. This guide page documents how to do this on Modal.

For reference documentation on the \`modal.Retries\` object, see [this page](/docs/sdk/py/latest/Retries).

## Automatically recover from flakes with \`retries\`

You can configure Modal to automatically retry Function failures if you set the
\`retries\` option when declaring your Function:

\`\`\`python
@app.function(retries=3)
def my_flaky_function():
    pass
\`\`\`

The basic configuration shown provides a fixed 1s delay between retry attempts.
For fine-grained control over retry delays, including exponential backoff
configuration, use [\`modal.Retries\`](/docs/sdk/py/latest/Retries).

## Handle failures in \`Function.map\`

By default, failures are propagated back to the caller.
To treat exceptions like successful results and aggregate them in the results list instead,
pass in [\`return_exceptions=True\`](/docs/guide/scale#exceptions).

When used with [\`Function.map()\`](/docs/guide/scale#parallel-execution-of-inputs),
each input is retried independently.

## Container crashes

If a \`modal.Function\` container crashes (either on start-up, e.g. while handling imports in global scope, or during execution, e.g. an out-of-memory error),
Modal will reschedule the container and any work it was currently assigned.

For [ephemeral Apps](/docs/guide/apps#ephemeral-apps), container crashes will be retried until a failure rate is exceeded,
after which all pending inputs will be failed and the exception will be propagated to the caller.

For [deployed Apps](/docs/guide/apps#deployed-apps), container crashes will be retried indefinitely, so as to not disrupt service.
Modal will instead apply a crash-loop backoff and the rate of new container creation for the Function will be slowed down.
Crash-looping containers are displayed in the [App dashboard](/apps).
`,meta:{title:`Failures and retries`,description:`Failure is part of life. Sometimes you just have to retry. This guide page documents how to do this on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Automatically recover from flakes with <code>retries</code>`,1),b=t(`<code>modal.Retries</code>`),x=t(`Handle failures in <code>Function.map</code>`,1),S=t(`<code>return_exceptions=True</code>`),C=t(`<code>Function.map()</code>`),w=t(`<!> <p>Failure is part of life. Sometimes you just have to retry. This guide page documents how to do this on Modal.</p> <p>For reference documentation on the <code>modal.Retries</code> object, see <!>.</p> <!> <p>You can configure Modal to automatically retry Function failures if you set the <code>retries</code> option when declaring your Function:</p> <!> <p>The basic configuration shown provides a fixed 1s delay between retry attempts.
For fine-grained control over retry delays, including exponential backoff
configuration, use <!>.</p> <!> <p>By default, failures are propagated back to the caller.
To treat exceptions like successful results and aggregate them in the results list instead,
pass in <!>.</p> <p>When used with <!>,
each input is retried independently.</p> <!> <p>If a <code>modal.Function</code> container crashes (either on start-up, e.g. while handling imports in global scope, or during execution, e.g. an out-of-memory error),
Modal will reschedule the container and any work it was currently assigned.</p> <p>For <!>, container crashes will be retried until a failure rate is exceeded,
after which all pending inputs will be failed and the exception will be propagated to the caller.</p> <p>For <!>, container crashes will be retried indefinitely, so as to not disrupt service.
Modal will instead apply a crash-loop backoff and the rate of new container creation for the Function will be slowed down.
Crash-looping containers are displayed in the <!>.</p>`,1);function T(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=w(),p=s(o);d(p,{id:`failures-and-retries`,children:(e,t)=>{l(),i(e,r(`Failures and retries`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h),3),{href:`/docs/sdk/py/latest/Retries`,children:(e,t)=>{l(),i(e,r(`this page`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`automatically-recover-from-flakes-with-retries`,children:(e,t)=>{l();var n=y();l(),i(e,n)},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`%40app.function(retries%3D3)%0Adef%20my_flaky_function()%3A%0A%20%20%20%20pass`,lang:`python`});var v=c(_,2);m(c(e(v)),{href:`/docs/sdk/py/latest/Retries`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(v);var T=c(v,2);u(T,{id:`handle-failures-in-functionmap`,children:(e,t)=>{l();var n=x();l(),i(e,n)},$$slots:{default:!0}});var E=c(T,2);m(c(e(E)),{href:`/docs/guide/scale#exceptions`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);m(c(e(D)),{href:`/docs/guide/scale#parallel-execution-of-inputs`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);u(O,{id:`container-crashes`,children:(e,t)=>{l(),i(e,r(`Container crashes`))},$$slots:{default:!0}});var k=c(O,4);m(c(e(k)),{href:`/docs/guide/apps#ephemeral-apps`,children:(e,t)=>{l(),i(e,r(`ephemeral Apps`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2),j=c(e(A));m(j,{href:`/docs/guide/apps#deployed-apps`,children:(e,t)=>{l(),i(e,r(`deployed Apps`))},$$slots:{default:!0}}),m(c(j,2),{href:`/apps`,children:(e,t)=>{l(),i(e,r(`App dashboard`))},$$slots:{default:!0}}),l(),n(A),i(t,o)},$$slots:{default:!0}}))}export{T as default,h as metadata};
//# sourceMappingURL=DemCJT6E2.js.map
