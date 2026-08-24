(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`37199fdf-278a-4508-9256-072655473271`,e._sentryDebugIdIdentifier=`sentry-dbid-37199fdf-278a-4508-9256-072655473271`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as ee,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te,r as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Cold start performance`,id:`cold-start-performance`,children:[{depth:2,value:`What is a cold start?`,id:`what-is-a-cold-start`},{depth:2,value:`Reduce time spent queueing for warm containers`,id:`reduce-time-spent-queueing-for-warm-containers`,children:[{depth:3,value:`Warm up containers faster`,id:`warm-up-containers-faster`},{depth:3,value:`Run more warm containers`,id:`run-more-warm-containers`,children:[{depth:4,value:`Keep containers warm for longer with scaledown_window`,id:`keep-containers-warm-for-longer-with-scaledown_window`},{depth:4,value:`Overprovision resources with min_containers and buffer_containers`,id:`overprovision-resources-with-min_containers-and-buffer_containers`}]}]},{depth:2,value:`Reduce latency from initialization`,id:`reduce-latency-from-initialization`,children:[{depth:3,value:`Move initialization work out of the first invocation`,id:`move-initialization-work-out-of-the-first-invocation`},{depth:3,value:`Share initialization work across cold starts with Memory Snapshots`,id:`share-initialization-work-across-cold-starts-with-memory-snapshots`},{depth:3,value:`Optimize initialization code`,id:`optimize-initialization-code`,children:[{depth:4,value:`Load multiple large files concurrently`,id:`load-multiple-large-files-concurrently`}]}]}]}],rawContent:`# Cold start performance

This guide page details the techniques and Modal features used to improve cold start performance.

## What is a cold start?

Modal Functions are run in [containers](/docs/guide/images).

If a container is already ready to run your Function, it will be reused.

If not, Modal spins up a new container.
This is known as a _cold start_,
and it is often associated with higher latency.

There are two sources of increased latency during cold starts:

1. inputs may **spend more time waiting** in a queue for a container
   to become ready or "warm".
2. when an input is handled by the container that just started,
   there may be **extra work that only needs to be done on the first invocation**
   ("initialization").

If you are invoking Functions with no warm containers
or if you otherwise see inputs spending too much time in the "pending" state,
you should
[target queueing time for optimization](#reduce-time-spent-queueing-for-warm-containers).

If you see some Function invocations taking much longer than others,
and those invocations are the first handled by a new container,
you should
[target initialization for optimization](#reduce-latency-from-initialization).

## Reduce time spent queueing for warm containers

New containers are booted when there are not enough other warm containers to
to handle the current number of inputs.

For example, the first time you send an input to a Function,
there are zero warm containers and there is one input,
so a single container must be booted up.
The total latency for the input will include
the time it takes to boot a container.

If you send another input right after the first one finishes,
there will be one warm container and one pending input,
and no new container will be booted.

Generalizing, there are two factors that affect the time inputs spend queueing:
the time it takes for a container to boot and become warm (which we solve by booting faster)
and the time until a warm container is available to handle an input (which we solve by having more warm containers).

### Warm up containers faster

The time taken for a container to become warm
and ready for inputs can range from seconds to minutes.

Modal's custom container stack has been heavily optimized to reduce this time.
You can read about some of our optimizations [here](https://modal.com/blog/jono-containers-talk).
Containers boot in about one second.

But before a container is considered warm and ready to handle inputs,
we need to execute any logic in your code's global scope (such as imports)
or in any
[\`modal.enter\` methods](/docs/guide/lifecycle-functions).
So if your boots are slow, these are the first places to work on optimization.

For example, you might be downloading a large model from a model server
during the boot process.
You can instead
[download the model ahead of time](/docs/guide/model-weights),
so that it only needs to be downloaded once.

For models in the tens of gigabytes,
this can reduce boot times from minutes to seconds.

### Run more warm containers

It is not always possible to speed up boots sufficiently.
For example, seconds of added latency to load a model may not
be acceptable in an interactive setting.

In this case, the only option is to have more warm containers running.
This increases the chance that an input will be handled by a warm container,
for example one that finishes an input while another container is booting.

Modal currently exposes [three parameters](/docs/guide/scale) that control how
many containers will be warm: \`scaledown_window\`, \`min_containers\`,
and \`buffer_containers\`.

All of these strategies can increase the resources consumed by your Function
and so introduce a trade-off between cold start latencies and cost.

#### Keep containers warm for longer with \`scaledown_window\`

Modal containers will remain idle for a short period before shutting down. By
default, the maximum idle time is 60 seconds. You can configure this by setting
the \`scaledown_window\` on the [\`@function\`](/docs/sdk/py/latest/App#function)
decorator. The value is measured in seconds, and it can be set anywhere between
two seconds and twenty minutes.

\`\`\`python
import modal

app = modal.App()

@app.function(scaledown_window=300)
def my_idle_greeting():
    return {"hello": "world"}
\`\`\`

Increasing the \`scaledown_window\` reduces the chance that subsequent requests
will require a cold start, although you will be billed for any resources used
while the container is idle (e.g., GPU reservation or residual memory
occupancy). Note that containers will not necessarily remain alive for the
entire window, as the autoscaler will scale down more aggressively when the
Function is substantially over-provisioned.

#### Overprovision resources with \`min_containers\` and \`buffer_containers\`

Keeping already warm containers around longer doesn't help if there are no warm
containers to begin with, as when Functions scale from zero.

To keep some containers warm and running at all times, set the \`min_containers\`
value on the [\`@function\`](/docs/sdk/py/latest/App#function) decorator. This
puts a floor on the the number of containers so that the Function doesn't scale
to zero. Modal will still scale up and spin down more containers as the
demand for your Function fluctuates above the \`min_containers\` value, as usual.

While \`min_containers\` overprovisions containers while the Function is idle,
\`buffer_containers\` provisions extra containers while the Function is active.
This "buffer" of extra containers will be idle and ready to handle inputs if
the rate of requests increases. This parameter is particularly useful for
bursty request patterns, where the arrival of one input predicts the arrival of more inputs,
like when a new user or client starts hitting the Function.

\`\`\`python
import modal

app = modal.App(image=modal.Image.debian_slim().pip_install("fastapi"))

@app.function(min_containers=3, buffer_containers=3)
def my_warm_greeting():
    return "Hello, world!"
\`\`\`

## Reduce latency from initialization

Some work is done the first time that a function is invoked
but can be used on every subsequent invocation.
This is
[_amortized work_](https://www.cs.cornell.edu/courses/cs312/2006sp/lectures/lec18.html)
done at initialization.

For example, you may be using a large pre-trained model
whose weights need to be loaded from disk to memory the first time it is used.

This results in longer latencies for the first invocation of a warm container,
which shows up in the application as occasional slow calls: high tail latency or elevated p9Xs.

### Move initialization work out of the first invocation

Some work done on the first invocation can be moved up and completed ahead of time.

Any work that can be saved to disk, like
[downloading model weights](/docs/guide/model-weights),
should be done as early as possible. The results can be included in the
[container's Image](/docs/guide/images)
or saved to a
[Modal Volume](/docs/guide/volumes).

Some work is tricky to serialize, like spinning up a network connection or an inference server.
If you can move this initialization logic out of the function body and into the global scope or a
[container \`enter\` method](https://modal.com/docs/guide/lifecycle-functions#enter),
you can move this work into the warm up period.
Containers will not be considered warm until all \`enter\` methods have completed,
so no inputs will be routed to containers that have yet to complete this initialization.

For more on how to use \`enter\` with machine learning model weights, see
[this guide](/docs/guide/model-weights).

Note that \`enter\` doesn't get rid of the latency --
it just moves the latency to the warm up period,
where it can be handled by
[running more warm containers](#run-more-warm-containers).

### Share initialization work across cold starts with Memory Snapshots

Cold starts can also be made faster by using Modal
[Memory Snapshots](/docs/guide/memory-snapshots).

Invocations of a Function after the first
are faster in part because the memory is already populated
with values that otherwise need to be computed or read from disk,
like the contents of imported libraries.

Memory snapshotting captures the state of a container's memory
at user-controlled points after it has been warmed up
and reuses that state in future boots, which can substantially
reduce cold start latency penalties and warm up period duration.

Refer to the [Memory Snapshots guide](/docs/guide/memory-snapshots)
for details.

### Optimize initialization code

Sometimes, there is nothing to be done but to speed this work up.

Here, we share specific patterns that show up in optimizing initialization
in Modal Functions.

#### Load multiple large files concurrently

Often Modal applications need to read large files into memory (eg. model
weights) before they can process inputs. Where feasible these large file
reads should happen concurrently and not sequentially. Concurrent IO takes
full advantage of our platform's high disk and network bandwidth
to reduce latency.

One common example of slow sequential IO is loading multiple independent
Huggingface \`transformers\` models in series.

\`\`\`python notest
from transformers import CLIPProcessor, CLIPModel, BlipProcessor, BlipForConditionalGeneration
model_a = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor_a = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model_b = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
processor_b = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
\`\`\`

The above snippet does four \`.from_pretrained\` loads sequentially.
None of the components depend on another being already loaded in memory, so they
can be loaded concurrently instead.

They could instead be loaded concurrently using a function like this:

\`\`\`python notest
from concurrent.futures import ThreadPoolExecutor, as_completed
from transformers import CLIPProcessor, CLIPModel, BlipProcessor, BlipForConditionalGeneration

def load_models_concurrently(load_functions_map: dict) -> dict:
    model_id_to_model = {}
    with ThreadPoolExecutor(max_workers=len(load_functions_map)) as executor:
        future_to_model_id = {
            executor.submit(load_fn): model_id
            for model_id, load_fn in load_functions_map.items()
        }
        for future in as_completed(future_to_model_id.keys()):
            model_id_to_model[future_to_model_id[future]] = future.result()
    return model_id_to_model

components = load_models_concurrently({
    "clip_model": lambda: CLIPModel.from_pretrained("openai/clip-vit-base-patch32"),
    "clip_processor": lambda: CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32"),
    "blip_model": lambda: BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large"),
    "blip_processor": lambda: BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
})
\`\`\`

If performing concurrent IO on large file reads does _not_ speed up your cold
starts, it's possible that some part of your function's code is holding the
Python [GIL](https://wiki.python.org/moin/GlobalInterpreterLock) and reducing
the efficacy of the multi-threaded executor.
`,meta:{title:`Cold start performance`,description:`This guide page details the techniques and Modal features used to improve cold start performance.`}},{toc:g,rawContent:_,meta:v}=h,ne=t(`<code>modal.enter</code> methods`,1),y=t(`Keep containers warm for longer with <code>scaledown_window</code>`,1),b=t(`<code>@function</code>`),x=t(`Overprovision resources with <code>min_containers</code> and <code>buffer_containers</code>`,1),S=t(`<code>@function</code>`),C=t(`<em>amortized work</em>`),re=t(`container <code>enter</code> method`,1),ie=t(`<!> <p>This guide page details the techniques and Modal features used to improve cold start performance.</p> <!> <p>Modal Functions are run in <!>.</p> <p>If a container is already ready to run your Function, it will be reused.</p> <p>If not, Modal spins up a new container.
This is known as a <em>cold start</em>,
and it is often associated with higher latency.</p> <p>There are two sources of increased latency during cold starts:</p> <ol><li>inputs may <strong>spend more time waiting</strong> in a queue for a container
to become ready or “warm”.</li> <li>when an input is handled by the container that just started,
there may be <strong>extra work that only needs to be done on the first invocation</strong> (“initialization”).</li></ol> <p>If you are invoking Functions with no warm containers
or if you otherwise see inputs spending too much time in the “pending” state,
you should <!>.</p> <p>If you see some Function invocations taking much longer than others,
and those invocations are the first handled by a new container,
you should <!>.</p> <!> <p>New containers are booted when there are not enough other warm containers to
to handle the current number of inputs.</p> <p>For example, the first time you send an input to a Function,
there are zero warm containers and there is one input,
so a single container must be booted up.
The total latency for the input will include
the time it takes to boot a container.</p> <p>If you send another input right after the first one finishes,
there will be one warm container and one pending input,
and no new container will be booted.</p> <p>Generalizing, there are two factors that affect the time inputs spend queueing:
the time it takes for a container to boot and become warm (which we solve by booting faster)
and the time until a warm container is available to handle an input (which we solve by having more warm containers).</p> <!> <p>The time taken for a container to become warm
and ready for inputs can range from seconds to minutes.</p> <p>Modal’s custom container stack has been heavily optimized to reduce this time.
You can read about some of our optimizations <!>.
Containers boot in about one second.</p> <p>But before a container is considered warm and ready to handle inputs,
we need to execute any logic in your code’s global scope (such as imports)
or in any <!>.
So if your boots are slow, these are the first places to work on optimization.</p> <p>For example, you might be downloading a large model from a model server
during the boot process.
You can instead <!>,
so that it only needs to be downloaded once.</p> <p>For models in the tens of gigabytes,
this can reduce boot times from minutes to seconds.</p> <!> <p>It is not always possible to speed up boots sufficiently.
For example, seconds of added latency to load a model may not
be acceptable in an interactive setting.</p> <p>In this case, the only option is to have more warm containers running.
This increases the chance that an input will be handled by a warm container,
for example one that finishes an input while another container is booting.</p> <p>Modal currently exposes <!> that control how
many containers will be warm: <code>scaledown_window</code>, <code>min_containers</code>,
and <code>buffer_containers</code>.</p> <p>All of these strategies can increase the resources consumed by your Function
and so introduce a trade-off between cold start latencies and cost.</p> <!> <p>Modal containers will remain idle for a short period before shutting down. By
default, the maximum idle time is 60 seconds. You can configure this by setting
the <code>scaledown_window</code> on the <!> decorator. The value is measured in seconds, and it can be set anywhere between
two seconds and twenty minutes.</p> <!> <p>Increasing the <code>scaledown_window</code> reduces the chance that subsequent requests
will require a cold start, although you will be billed for any resources used
while the container is idle (e.g., GPU reservation or residual memory
occupancy). Note that containers will not necessarily remain alive for the
entire window, as the autoscaler will scale down more aggressively when the
Function is substantially over-provisioned.</p> <!> <p>Keeping already warm containers around longer doesn’t help if there are no warm
containers to begin with, as when Functions scale from zero.</p> <p>To keep some containers warm and running at all times, set the <code>min_containers</code> value on the <!> decorator. This
puts a floor on the the number of containers so that the Function doesn’t scale
to zero. Modal will still scale up and spin down more containers as the
demand for your Function fluctuates above the <code>min_containers</code> value, as usual.</p> <p>While <code>min_containers</code> overprovisions containers while the Function is idle, <code>buffer_containers</code> provisions extra containers while the Function is active.
This “buffer” of extra containers will be idle and ready to handle inputs if
the rate of requests increases. This parameter is particularly useful for
bursty request patterns, where the arrival of one input predicts the arrival of more inputs,
like when a new user or client starts hitting the Function.</p> <!> <!> <p>Some work is done the first time that a function is invoked
but can be used on every subsequent invocation.
This is <!> done at initialization.</p> <p>For example, you may be using a large pre-trained model
whose weights need to be loaded from disk to memory the first time it is used.</p> <p>This results in longer latencies for the first invocation of a warm container,
which shows up in the application as occasional slow calls: high tail latency or elevated p9Xs.</p> <!> <p>Some work done on the first invocation can be moved up and completed ahead of time.</p> <p>Any work that can be saved to disk, like <!>,
should be done as early as possible. The results can be included in the <!> or saved to a <!>.</p> <p>Some work is tricky to serialize, like spinning up a network connection or an inference server.
If you can move this initialization logic out of the function body and into the global scope or a <!>,
you can move this work into the warm up period.
Containers will not be considered warm until all <code>enter</code> methods have completed,
so no inputs will be routed to containers that have yet to complete this initialization.</p> <p>For more on how to use <code>enter</code> with machine learning model weights, see <!>.</p> <p>Note that <code>enter</code> doesn’t get rid of the latency —
it just moves the latency to the warm up period,
where it can be handled by <!>.</p> <!> <p>Cold starts can also be made faster by using Modal <!>.</p> <p>Invocations of a Function after the first
are faster in part because the memory is already populated
with values that otherwise need to be computed or read from disk,
like the contents of imported libraries.</p> <p>Memory snapshotting captures the state of a container’s memory
at user-controlled points after it has been warmed up
and reuses that state in future boots, which can substantially
reduce cold start latency penalties and warm up period duration.</p> <p>Refer to the <!> for details.</p> <!> <p>Sometimes, there is nothing to be done but to speed this work up.</p> <p>Here, we share specific patterns that show up in optimizing initialization
in Modal Functions.</p> <!> <p>Often Modal applications need to read large files into memory (eg. model
weights) before they can process inputs. Where feasible these large file
reads should happen concurrently and not sequentially. Concurrent IO takes
full advantage of our platform’s high disk and network bandwidth
to reduce latency.</p> <p>One common example of slow sequential IO is loading multiple independent
Huggingface <code>transformers</code> models in series.</p> <!> <p>The above snippet does four <code>.from_pretrained</code> loads sequentially.
None of the components depend on another being already loaded in memory, so they
can be loaded concurrently instead.</p> <p>They could instead be loaded concurrently using a function like this:</p> <!> <p>If performing concurrent IO on large file reads does <em>not</em> speed up your cold
starts, it’s possible that some part of your function’s code is holding the
Python <!> and reducing
the efficacy of the multi-threaded executor.</p>`,1);function w(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=ie(),p=ee(o);te(p,{id:`cold-start-performance`,children:(e,t)=>{c(),i(e,r(`Cold start performance`))},$$slots:{default:!0}});var h=s(p,4);l(h,{id:`what-is-a-cold-start`,children:(e,t)=>{c(),i(e,r(`What is a cold start?`))},$$slots:{default:!0}});var g=s(h,2);m(s(e(g)),{href:`/docs/guide/images`,children:(e,t)=>{c(),i(e,r(`containers`))},$$slots:{default:!0}}),c(),n(g);var _=s(g,10);m(s(e(_)),{href:`#reduce-time-spent-queueing-for-warm-containers`,children:(e,t)=>{c(),i(e,r(`target queueing time for optimization`))},$$slots:{default:!0}}),c(),n(_);var v=s(_,2);m(s(e(v)),{href:`#reduce-latency-from-initialization`,children:(e,t)=>{c(),i(e,r(`target initialization for optimization`))},$$slots:{default:!0}}),c(),n(v);var w=s(v,2);l(w,{id:`reduce-time-spent-queueing-for-warm-containers`,children:(e,t)=>{c(),i(e,r(`Reduce time spent queueing for warm containers`))},$$slots:{default:!0}});var T=s(w,10);u(T,{id:`warm-up-containers-faster`,children:(e,t)=>{c(),i(e,r(`Warm up containers faster`))},$$slots:{default:!0}});var E=s(T,4);m(s(e(E)),{href:`https://modal.com/blog/jono-containers-talk`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(E);var D=s(E,2);m(s(e(D)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{var n=ne();c(),i(e,n)},$$slots:{default:!0}}),c(),n(D);var O=s(D,2);m(s(e(O)),{href:`/docs/guide/model-weights`,children:(e,t)=>{c(),i(e,r(`download the model ahead of time`))},$$slots:{default:!0}}),c(),n(O);var k=s(O,4);u(k,{id:`run-more-warm-containers`,children:(e,t)=>{c(),i(e,r(`Run more warm containers`))},$$slots:{default:!0}});var A=s(k,6);m(s(e(A)),{href:`/docs/guide/scale`,children:(e,t)=>{c(),i(e,r(`three parameters`))},$$slots:{default:!0}}),c(7),n(A);var j=s(A,4);d(j,{id:`keep-containers-warm-for-longer-with-scaledown_window`,children:(e,t)=>{c();var n=y();c(),i(e,n)},$$slots:{default:!0}});var M=s(j,2);m(s(e(M),3),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),c(),n(M);var N=s(M,2);f(N,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(scaledown_window%3D300)%0Adef%20my_idle_greeting()%3A%0A%20%20%20%20return%20%7B%22hello%22%3A%20%22world%22%7D`,lang:`python`});var P=s(N,4);d(P,{id:`overprovision-resources-with-min_containers-and-buffer_containers`,children:(e,t)=>{c();var n=x();c(3),i(e,n)},$$slots:{default:!0}});var F=s(P,4);m(s(e(F),3),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),c(3),n(F);var I=s(F,4);f(I,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%22))%0A%0A%40app.function(min_containers%3D3%2C%20buffer_containers%3D3)%0Adef%20my_warm_greeting()%3A%0A%20%20%20%20return%20%22Hello%2C%20world!%22`,lang:`python`});var L=s(I,2);l(L,{id:`reduce-latency-from-initialization`,children:(e,t)=>{c(),i(e,r(`Reduce latency from initialization`))},$$slots:{default:!0}});var R=s(L,2);m(s(e(R)),{href:`https://www.cs.cornell.edu/courses/cs312/2006sp/lectures/lec18.html`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),c(),n(R);var z=s(R,6);u(z,{id:`move-initialization-work-out-of-the-first-invocation`,children:(e,t)=>{c(),i(e,r(`Move initialization work out of the first invocation`))},$$slots:{default:!0}});var B=s(z,4),V=s(e(B));m(V,{href:`/docs/guide/model-weights`,children:(e,t)=>{c(),i(e,r(`downloading model weights`))},$$slots:{default:!0}});var H=s(V,2);m(H,{href:`/docs/guide/images`,children:(e,t)=>{c(),i(e,r(`container’s Image`))},$$slots:{default:!0}}),m(s(H,2),{href:`/docs/guide/volumes`,children:(e,t)=>{c(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),c(),n(B);var U=s(B,2);m(s(e(U)),{href:`https://modal.com/docs/guide/lifecycle-functions#enter`,rel:`nofollow`,children:(e,t)=>{c();var n=re();c(2),i(e,n)},$$slots:{default:!0}}),c(3),n(U);var W=s(U,2);m(s(e(W),3),{href:`/docs/guide/model-weights`,children:(e,t)=>{c(),i(e,r(`this guide`))},$$slots:{default:!0}}),c(),n(W);var G=s(W,2);m(s(e(G),3),{href:`#run-more-warm-containers`,children:(e,t)=>{c(),i(e,r(`running more warm containers`))},$$slots:{default:!0}}),c(),n(G);var K=s(G,2);u(K,{id:`share-initialization-work-across-cold-starts-with-memory-snapshots`,children:(e,t)=>{c(),i(e,r(`Share initialization work across cold starts with Memory Snapshots`))},$$slots:{default:!0}});var q=s(K,2);m(s(e(q)),{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{c(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}}),c(),n(q);var J=s(q,6);m(s(e(J)),{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{c(),i(e,r(`Memory Snapshots guide`))},$$slots:{default:!0}}),c(),n(J);var Y=s(J,2);u(Y,{id:`optimize-initialization-code`,children:(e,t)=>{c(),i(e,r(`Optimize initialization code`))},$$slots:{default:!0}});var X=s(Y,6);d(X,{id:`load-multiple-large-files-concurrently`,children:(e,t)=>{c(),i(e,r(`Load multiple large files concurrently`))},$$slots:{default:!0}});var Z=s(X,6);f(Z,{code:`from%20transformers%20import%20CLIPProcessor%2C%20CLIPModel%2C%20BlipProcessor%2C%20BlipForConditionalGeneration%0Amodel_a%20%3D%20CLIPModel.from_pretrained(%22openai%2Fclip-vit-base-patch32%22)%0Aprocessor_a%20%3D%20CLIPProcessor.from_pretrained(%22openai%2Fclip-vit-base-patch32%22)%0Amodel_b%20%3D%20BlipProcessor.from_pretrained(%22Salesforce%2Fblip-image-captioning-large%22)%0Aprocessor_b%20%3D%20BlipForConditionalGeneration.from_pretrained(%22Salesforce%2Fblip-image-captioning-large%22)`,lang:`python`});var Q=s(Z,6);f(Q,{code:`from%20concurrent.futures%20import%20ThreadPoolExecutor%2C%20as_completed%0Afrom%20transformers%20import%20CLIPProcessor%2C%20CLIPModel%2C%20BlipProcessor%2C%20BlipForConditionalGeneration%0A%0Adef%20load_models_concurrently(load_functions_map%3A%20dict)%20-%3E%20dict%3A%0A%20%20%20%20model_id_to_model%20%3D%20%7B%7D%0A%20%20%20%20with%20ThreadPoolExecutor(max_workers%3Dlen(load_functions_map))%20as%20executor%3A%0A%20%20%20%20%20%20%20%20future_to_model_id%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20executor.submit(load_fn)%3A%20model_id%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20model_id%2C%20load_fn%20in%20load_functions_map.items()%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20for%20future%20in%20as_completed(future_to_model_id.keys())%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20model_id_to_model%5Bfuture_to_model_id%5Bfuture%5D%5D%20%3D%20future.result()%0A%20%20%20%20return%20model_id_to_model%0A%0Acomponents%20%3D%20load_models_concurrently(%7B%0A%20%20%20%20%22clip_model%22%3A%20lambda%3A%20CLIPModel.from_pretrained(%22openai%2Fclip-vit-base-patch32%22)%2C%0A%20%20%20%20%22clip_processor%22%3A%20lambda%3A%20CLIPProcessor.from_pretrained(%22openai%2Fclip-vit-base-patch32%22)%2C%0A%20%20%20%20%22blip_model%22%3A%20lambda%3A%20BlipProcessor.from_pretrained(%22Salesforce%2Fblip-image-captioning-large%22)%2C%0A%20%20%20%20%22blip_processor%22%3A%20lambda%3A%20BlipForConditionalGeneration.from_pretrained(%22Salesforce%2Fblip-image-captioning-large%22)%0A%7D)`,lang:`python`});var $=s(Q,2);m(s(e($),3),{href:`https://wiki.python.org/moin/GlobalInterpreterLock`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`GIL`))},$$slots:{default:!0}}),c(),n($),i(t,o)},$$slots:{default:!0}}))}export{w as default,h as metadata};
//# sourceMappingURL=6WMFDoQm2.js.map
