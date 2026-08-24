(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9234dd0e-4aa2-469d-8768-9df095b52400`,e._sentryDebugIdIdentifier=`sentry-dbid-9234dd0e-4aa2-469d-8768-9df095b52400`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Timeouts`,id:`timeouts`,children:[{depth:3,value:`Container startup timeout`,id:`container-startup-timeout`},{depth:2,value:`Handling timeouts`,id:`handling-timeouts`},{depth:2,value:`Timeout accuracy`,id:`timeout-accuracy`}]}],rawContent:`# Timeouts

All Modal [Function](/docs/sdk/py/latest/Function) executions have a default
execution timeout of 300 seconds (5 minutes), but users may specify timeout
durations between 1 second and 24 hours.

\`\`\`python
import time


@app.function()
def f():
    time.sleep(599)  # Timeout!


@app.function(timeout=600)
def g():
    time.sleep(599)
    print("*Just* made it!")
\`\`\`

The timeout duration is a measure of a Function's _execution_ time. It does not
include scheduling time or any other period besides the time your code is
executing in Modal. This duration is also per execution attempt, meaning
Functions configured with [\`modal.Retries\`](/docs/sdk/py/latest/Retries) will
start new execution timeouts on each retry. For example, an infinite-looping
Function with a 100 second timeout and 3 allowed retries will run for least 400
seconds within Modal.

### Container startup timeout

A Function's \`startup_timeout\` configures the container's _startup_ time. Your container
may be taking a long time to startup because it is loading large data, initializing a
large model or importing many packages. In these cases, you can extend the
\`startup_timeout\` of your Function.

\`\`\`python
@app.cls(startup_timeout=30, timeout=10)
class MyFunction:
    @modal.enter()
    def startup(self):
        time.sleep(20)

    @modal.method()
    def f(self):
        time.sleep(1)
\`\`\`

\`startup_timeout\` was added in v1.1.4. Prior to v1.1.4, \`timeout\` configures the
_execution_ time and _startup_ time. If \`startup_timeout\` is not set, \`timeout\` will
still configure both times.

## Handling timeouts

After exhausting any specified retries, a timeout in a Function will produce a
\`modal.exception.FunctionTimeoutError\` which you may catch in your code.

\`\`\`python
import modal.exception


@app.function(timeout=100)
def f():
    time.sleep(200)  # Timeout!


@app.local_entrypoint()
def main():
    try:
        f.remote()
    except modal.exception.FunctionTimeoutError:
        ... # Handle the timeout.
\`\`\`

## Timeout accuracy

Functions will run for _at least_ as long as their timeout allows, but they may
run a handful of seconds longer. If you require accurate and precise timeout
durations on your Function executions, it is recommended that you implement
timeout logic in your user code.
`,meta:{title:`Timeouts`,description:`All Modal Function executions have a default execution timeout of 300 seconds (5 minutes), but users may specify timeout durations between 1 second and 24 hours.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal.Retries</code>`),x=t(`<!> <p>All Modal <!> executions have a default
execution timeout of 300 seconds (5 minutes), but users may specify timeout
durations between 1 second and 24 hours.</p> <!> <p>The timeout duration is a measure of a Function’s <em>execution</em> time. It does not
include scheduling time or any other period besides the time your code is
executing in Modal. This duration is also per execution attempt, meaning
Functions configured with <!> will
start new execution timeouts on each retry. For example, an infinite-looping
Function with a 100 second timeout and 3 allowed retries will run for least 400
seconds within Modal.</p> <!> <p>A Function’s <code>startup_timeout</code> configures the container’s <em>startup</em> time. Your container
may be taking a long time to startup because it is loading large data, initializing a
large model or importing many packages. In these cases, you can extend the <code>startup_timeout</code> of your Function.</p> <!> <p><code>startup_timeout</code> was added in v1.1.4. Prior to v1.1.4, <code>timeout</code> configures the <em>execution</em> time and <em>startup</em> time. If <code>startup_timeout</code> is not set, <code>timeout</code> will
still configure both times.</p> <!> <p>After exhausting any specified retries, a timeout in a Function will produce a <code>modal.exception.FunctionTimeoutError</code> which you may catch in your code.</p> <!> <!> <p>Functions will run for <em>at least</em> as long as their timeout allows, but they may
run a handful of seconds longer. If you require accurate and precise timeout
durations on your Function executions, it is recommended that you implement
timeout logic in your user code.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`timeouts`,children:(e,t)=>{l(),i(e,r(`Timeouts`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);p(_,{code:`import%20time%0A%0A%0A%40app.function()%0Adef%20f()%3A%0A%20%20%20%20time.sleep(599)%20%20%23%20Timeout!%0A%0A%0A%40app.function(timeout%3D600)%0Adef%20g()%3A%0A%20%20%20%20time.sleep(599)%0A%20%20%20%20print(%22*Just*%20made%20it!%22)`,lang:`python`});var v=c(_,2);h(c(e(v),3),{href:`/docs/sdk/py/latest/Retries`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);d(y,{id:`container-startup-timeout`,children:(e,t)=>{l(),i(e,r(`Container startup timeout`))},$$slots:{default:!0}});var S=c(y,4);p(S,{code:`%40app.cls(startup_timeout%3D30%2C%20timeout%3D10)%0Aclass%20MyFunction%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%3A%0A%20%20%20%20%20%20%20%20time.sleep(20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20f(self)%3A%0A%20%20%20%20%20%20%20%20time.sleep(1)`,lang:`python`});var C=c(S,4);u(C,{id:`handling-timeouts`,children:(e,t)=>{l(),i(e,r(`Handling timeouts`))},$$slots:{default:!0}});var w=c(C,4);p(w,{code:`import%20modal.exception%0A%0A%0A%40app.function(timeout%3D100)%0Adef%20f()%3A%0A%20%20%20%20time.sleep(200)%20%20%23%20Timeout!%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20f.remote()%0A%20%20%20%20except%20modal.exception.FunctionTimeoutError%3A%0A%20%20%20%20%20%20%20%20...%20%23%20Handle%20the%20timeout.`,lang:`python`}),u(c(w,2),{id:`timeout-accuracy`,children:(e,t)=>{l(),i(e,r(`Timeout accuracy`))},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=-wSsV15V.js.map
