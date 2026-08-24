(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b9e2c465-690f-48ea-9b0f-f241c5bf647c`,e._sentryDebugIdIdentifier=`sentry-dbid-b9e2c465-690f-48ea-9b0f-f241c5bf647c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Troubleshooting`,id:`troubleshooting`,children:[{depth:2,value:`“Command not found” errors`,id:`command-not-found-errors`},{depth:2,value:`Function side effects`,id:`function-side-effects`},{depth:2,value:`Heartbeat timeout`,id:`heartbeat-timeout`},{depth:2,value:`413 Content Too Large errors`,id:`413-content-too-large-errors`},{depth:2,value:`Outdated kernel version (4.4.0)`,id:`outdated-kernel-version-440`},{depth:2,value:`CUDA driver initialization failed on L4 GPU type`,id:`cuda-driver-initialization-failed-on-l4-gpu-type`},{depth:2,value:`Connection issues in forked processes`,id:`connection-issues-in-forked-processes`}]}],rawContent:`# Troubleshooting

This guide page documents solutions for common Modal issues.

For tips on troubleshooting your own code running on Modal,
see [this guide page](/docs/guide/developing-debugging).

## "Command not found" errors

If you installed Modal but you're seeing an error like
\`modal: command not found\` when trying to run the CLI, this means that the
installation location of Python package executables ("binaries") are not present
on your system path. This is a common problem; you need to reconfigure your
system's environment variables to fix it.

One workaround is to use \`python -m modal\` instead of \`modal\`. However, this
is just a patch. There's no single solution for the problem, because Python
installs dependencies on different locations depending on your environment. See
this [popular StackOverflow question](https://stackoverflow.com/q/35898734) for
pointers on how to resolve your system path issue.

## Function side effects

The same container _can_ be reused for multiple invocations of the same Function
within an App. This means that if your Function has side effects like modifying
files on disk, they may or may not be present for subsequent calls to that
Function. You should not rely on the side effects to be present, but you might
have to be careful so they don't cause problems.

For example, if you create a disk-backed database using sqlite3:

\`\`\`python
import modal
import sqlite3

app = modal.App()

@app.function()
def db_op():
    db = sqlite3("db_file.sqlite3")
    db.execute("CREATE TABLE example (col_1 TEXT)")
    ...
\`\`\`

This Function _can_ (but will not necessarily) fail on the second invocation
with an \`OperationalError: table foo already exists\` error.

To get around this, take care to either clean up your side effects (e.g.
deleting the db file at the end your function call above) or make your Functions
take them into consideration (e.g. adding an
\`if os.path.exists("db_file.sqlite")\` condition or randomize the filename
above). Alternatively, you can set \`single_use_containers=True\` so that every
Function call will spin up a new container; however, note that this will result
in higher cost and worse latency as every invocation will require a cold start.

## Heartbeat timeout

The Modal client in \`modal.Function\` containers runs a heartbeat loop that the host uses to healthcheck the container's main process.
If the container stops heartbeating for a long period (minutes), the container will be terminated due to a \`heartbeat timeout\`, which is displayed in logs.

Container heartbeat timeouts are rare, and they are typically caused by one of two application-level sources:

- [Global Interpreter Lock](https://wiki.python.org/moin/GlobalInterpreterLock) is held for a long time, stopping the heartbeat thread from making progress. [py-spy](https://github.com/benfred/py-spy?tab=readme-ov-file#how-does-gil-detection-work) can detect GIL holding. We include \`py-spy\` [automatically in \`modal shell\`](/docs/guide/developing-debugging#debug-shells) for convenience. A quick fix for GIL holding is to run the code which holds the GIL [in a subprocess](https://docs.python.org/3/library/multiprocessing.html#the-process-class).
- Container process initiates shutdown, intentionally stopping the heartbeats, but it does not complete shutdown.

In both cases [turning on debug logging](/docs/guide/developing-debugging#debug-logs) will help diagnose the issue.

## \`413 Content Too Large\` errors

If you receive a \`413 Content Too Large\` error, this might be because you are
hitting our gRPC payload size limits.

The size limit is currently 100MB.

## Outdated kernel version (4.4.0)

Our secure runtime [reports a misleadingly old](https://github.com/google/gvisor/issues/11117) kernel version, 4.4.0.
Certain software libraries will detect this and report a warning. These warnings can be ignored because the runtime
actually implements Linux kernel features from versions 5.15+.

If the outdated kernel version reporting creates errors in your application please contact us [in our Slack](https://modal.com/slack).

## CUDA driver initialization failed on L4 GPU type

Certain L4 instance types within Modal's fleet have a flaky issue in the NVIDIA driver which causes
the following CUDA context initialization error:

\`\`\`
RuntimeError: CUDA driver initialization failed, you might not have a CUDA gpu.
\`\`\`

A workaround to ensure reliable container startup is given below:

\`\`\`python
@modal.enter()
def warmup_cuda(self):
    import ctypes
    import time
    import modal
    cu = ctypes.CDLL("libcuda.so.1")
    max_retries = 10
    retry_delay_secs = 0.5
    for attempt in range(max_retries):
        rc = cu.cuInit(0)
        if rc == 0:
            break
        else:
            if attempt < max_retries - 1:
                print(f"cuInit failed on attempt {attempt + 1}/{max_retries} with code {rc}, retrying...")
                time.sleep(retry_delay_secs)
    else:
        print(f"CUDA initialization failed after {max_retries} attempts; stopping container")
        modal.experimental.stop_fetching_inputs()
\`\`\`

We are investigating a root cause fix for this problem.
Multi-cloud GPU reliability at the scale of many thousands of GPUs is a tough technical challenge!
Read more about our solution [here](/blog/gpu-health).

## Connection issues in forked processes

When a process is forked, the child may inherit stale network state from
the parent. If you're using Modal from a forked process (e.g. Celery prefork
workers, \`multiprocessing\`), create a fresh client after the fork and pass it
explicitly:

\`\`\`python
import multiprocessing
import modal

def child():
    client = modal.Client.from_credentials(token_id, token_secret)
    fc = modal.FunctionCall.from_id(call_id, client=client)
    result = fc.get(timeout=0)

p = multiprocessing.Process(target=child)
p.start()
\`\`\`
`,meta:{title:`Troubleshooting`,description:`This guide page documents solutions for common Modal issues.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`automatically in <code>modal shell</code>`,1),b=t(`<code>413 Content Too Large</code> errors`,1),x=t(`<!> <p>This guide page documents solutions for common Modal issues.</p> <p>For tips on troubleshooting your own code running on Modal,
see <!>.</p> <!> <p>If you installed Modal but you’re seeing an error like <code>modal: command not found</code> when trying to run the CLI, this means that the
installation location of Python package executables (“binaries”) are not present
on your system path. This is a common problem; you need to reconfigure your
system’s environment variables to fix it.</p> <p>One workaround is to use <code>python -m modal</code> instead of <code>modal</code>. However, this
is just a patch. There’s no single solution for the problem, because Python
installs dependencies on different locations depending on your environment. See
this <!> for
pointers on how to resolve your system path issue.</p> <!> <p>The same container <em>can</em> be reused for multiple invocations of the same Function
within an App. This means that if your Function has side effects like modifying
files on disk, they may or may not be present for subsequent calls to that
Function. You should not rely on the side effects to be present, but you might
have to be careful so they don’t cause problems.</p> <p>For example, if you create a disk-backed database using sqlite3:</p> <!> <p>This Function <em>can</em> (but will not necessarily) fail on the second invocation
with an <code>OperationalError: table foo already exists</code> error.</p> <p>To get around this, take care to either clean up your side effects (e.g.
deleting the db file at the end your function call above) or make your Functions
take them into consideration (e.g. adding an <code>if os.path.exists("db_file.sqlite")</code> condition or randomize the filename
above). Alternatively, you can set <code>single_use_containers=True</code> so that every
Function call will spin up a new container; however, note that this will result
in higher cost and worse latency as every invocation will require a cold start.</p> <!> <p>The Modal client in <code>modal.Function</code> containers runs a heartbeat loop that the host uses to healthcheck the container’s main process.
If the container stops heartbeating for a long period (minutes), the container will be terminated due to a <code>heartbeat timeout</code>, which is displayed in logs.</p> <p>Container heartbeat timeouts are rare, and they are typically caused by one of two application-level sources:</p> <ul><li><!> is held for a long time, stopping the heartbeat thread from making progress. <!> can detect GIL holding. We include <code>py-spy</code> <!> for convenience. A quick fix for GIL holding is to run the code which holds the GIL <!>.</li> <li>Container process initiates shutdown, intentionally stopping the heartbeats, but it does not complete shutdown.</li></ul> <p>In both cases <!> will help diagnose the issue.</p> <!> <p>If you receive a <code>413 Content Too Large</code> error, this might be because you are
hitting our gRPC payload size limits.</p> <p>The size limit is currently 100MB.</p> <!> <p>Our secure runtime <!> kernel version, 4.4.0.
Certain software libraries will detect this and report a warning. These warnings can be ignored because the runtime
actually implements Linux kernel features from versions 5.15+.</p> <p>If the outdated kernel version reporting creates errors in your application please contact us <!>.</p> <!> <p>Certain L4 instance types within Modal’s fleet have a flaky issue in the NVIDIA driver which causes
the following CUDA context initialization error:</p> <!> <p>A workaround to ensure reliable container startup is given below:</p> <!> <p>We are investigating a root cause fix for this problem.
Multi-cloud GPU reliability at the scale of many thousands of GPUs is a tough technical challenge!
Read more about our solution <!>.</p> <!> <p>When a process is forked, the child may inherit stale network state from
the parent. If you’re using Modal from a forked process (e.g. Celery prefork
workers, <code>multiprocessing</code>), create a fresh client after the fork and pass it
explicitly:</p> <!>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`troubleshooting`,children:(e,t)=>{l(),i(e,r(`Troubleshooting`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`/docs/guide/developing-debugging`,children:(e,t)=>{l(),i(e,r(`this guide page`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`command-not-found-errors`,children:(e,t)=>{l(),i(e,r(`“Command not found” errors`))},$$slots:{default:!0}});var _=c(g,4);m(c(e(_),5),{href:`https://stackoverflow.com/q/35898734`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`popular StackOverflow question`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);u(v,{id:`function-side-effects`,children:(e,t)=>{l(),i(e,r(`Function side effects`))},$$slots:{default:!0}});var S=c(v,6);f(S,{code:`import%20modal%0Aimport%20sqlite3%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function()%0Adef%20db_op()%3A%0A%20%20%20%20db%20%3D%20sqlite3(%22db_file.sqlite3%22)%0A%20%20%20%20db.execute(%22CREATE%20TABLE%20example%20(col_1%20TEXT)%22)%0A%20%20%20%20...`,lang:`python`});var C=c(S,6);u(C,{id:`heartbeat-timeout`,children:(e,t)=>{l(),i(e,r(`Heartbeat timeout`))},$$slots:{default:!0}});var w=c(C,6),T=e(w),E=e(T);m(E,{href:`https://wiki.python.org/moin/GlobalInterpreterLock`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Global Interpreter Lock`))},$$slots:{default:!0}});var D=c(E,2);m(D,{href:`https://github.com/benfred/py-spy?tab=readme-ov-file#how-does-gil-detection-work`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`py-spy`))},$$slots:{default:!0}});var O=c(D,4);m(O,{href:`/docs/guide/developing-debugging#debug-shells`,children:(e,t)=>{l();var n=y();l(),i(e,n)},$$slots:{default:!0}}),m(c(O,2),{href:`https://docs.python.org/3/library/multiprocessing.html#the-process-class`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`in a subprocess`))},$$slots:{default:!0}}),l(),n(T),l(2),n(w);var k=c(w,2);m(c(e(k)),{href:`/docs/guide/developing-debugging#debug-logs`,children:(e,t)=>{l(),i(e,r(`turning on debug logging`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);u(A,{id:`413-content-too-large-errors`,children:(e,t)=>{var n=b();l(),i(e,n)},$$slots:{default:!0}});var j=c(A,6);u(j,{id:`outdated-kernel-version-440`,children:(e,t)=>{l(),i(e,r(`Outdated kernel version (4.4.0)`))},$$slots:{default:!0}});var M=c(j,2);m(c(e(M)),{href:`https://github.com/google/gvisor/issues/11117`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`reports a misleadingly old`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);m(c(e(N)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`in our Slack`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);u(P,{id:`cuda-driver-initialization-failed-on-l4-gpu-type`,children:(e,t)=>{l(),i(e,r(`CUDA driver initialization failed on L4 GPU type`))},$$slots:{default:!0}});var F=c(P,4);f(F,{code:`RuntimeError%3A%20CUDA%20driver%20initialization%20failed%2C%20you%20might%20not%20have%20a%20CUDA%20gpu.`,lang:`text`});var I=c(F,4);f(I,{code:`%40modal.enter()%0Adef%20warmup_cuda(self)%3A%0A%20%20%20%20import%20ctypes%0A%20%20%20%20import%20time%0A%20%20%20%20import%20modal%0A%20%20%20%20cu%20%3D%20ctypes.CDLL(%22libcuda.so.1%22)%0A%20%20%20%20max_retries%20%3D%2010%0A%20%20%20%20retry_delay_secs%20%3D%200.5%0A%20%20%20%20for%20attempt%20in%20range(max_retries)%3A%0A%20%20%20%20%20%20%20%20rc%20%3D%20cu.cuInit(0)%0A%20%20%20%20%20%20%20%20if%20rc%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20attempt%20%3C%20max_retries%20-%201%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22cuInit%20failed%20on%20attempt%20%7Battempt%20%2B%201%7D%2F%7Bmax_retries%7D%20with%20code%20%7Brc%7D%2C%20retrying...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(retry_delay_secs)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(f%22CUDA%20initialization%20failed%20after%20%7Bmax_retries%7D%20attempts%3B%20stopping%20container%22)%0A%20%20%20%20%20%20%20%20modal.experimental.stop_fetching_inputs()`,lang:`python`});var L=c(I,2);m(c(e(L)),{href:`/blog/gpu-health`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,2);u(R,{id:`connection-issues-in-forked-processes`,children:(e,t)=>{l(),i(e,r(`Connection issues in forked processes`))},$$slots:{default:!0}}),f(c(R,4),{code:`import%20multiprocessing%0Aimport%20modal%0A%0Adef%20child()%3A%0A%20%20%20%20client%20%3D%20modal.Client.from_credentials(token_id%2C%20token_secret)%0A%20%20%20%20fc%20%3D%20modal.FunctionCall.from_id(call_id%2C%20client%3Dclient)%0A%20%20%20%20result%20%3D%20fc.get(timeout%3D0)%0A%0Ap%20%3D%20multiprocessing.Process(target%3Dchild)%0Ap.start()`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=DJNTtICi.js.map
