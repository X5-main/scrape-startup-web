(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`23176f15-27fd-4b1e-afbf-5bfceea27131`,e._sentryDebugIdIdentifier=`sentry-dbid-23176f15-27fd-4b1e-afbf-5bfceea27131`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Batch Processing`,id:`batch-processing`,children:[{depth:2,value:`Background Execution with .spawn_map`,id:`background-execution-with-spawn_map`},{depth:2,value:`Parallel Processing with .map`,id:`parallel-processing-with-map`},{depth:2,value:`Integration with Existing Systems`,id:`integration-with-existing-systems`}]}],rawContent:`# Batch Processing

Modal is optimized for large-scale batch processing, allowing functions to scale to thousands of parallel containers with zero additional configuration. Function calls can be submitted asynchronously for background execution, eliminating the need to wait for jobs to finish or tune resource allocation.

This guide covers Modal's batch processing capabilities, from basic invocation to integration with existing pipelines.

## Background Execution with \`.spawn_map\`

The fastest way to submit multiple jobs for asynchronous processing is by invoking a Function with \`.spawn_map\`. When combined with the [\`--detach\`](/docs/cli/latest/run) flag, your App continues running until all jobs are completed.

Here's an example of submitting 100,000 videos for parallel embedding. You can disconnect after submission, and the processing will continue to completion in the background:

\`\`\`python
# Kick off asynchronous jobs with \`modal run --detach batch_processing.py\`
import modal

app = modal.App("batch-processing-example")
volume = modal.Volume.from_name("video-embeddings", create_if_missing=True)

@app.function(volumes={"/data": volume})
def embed_video(video_id: int):
    # Business logic:
    # - Load the video from the volume
    # - Embed the video
    # - Save the embedding to the volume
    ...

@app.local_entrypoint()
def main():
    embed_video.spawn_map(range(100_000))
\`\`\`

This pattern works best for jobs that store results externally—for example, in a [Modal Volume](/docs/guide/volumes), [Cloud Bucket Mount](/docs/guide/cloud-bucket-mounts), or your own database\\*.

_\\* For database connections, consider using [Modal Proxy](/docs/guide/proxy-ips) to maintain a static IP across thousands of containers._

## Parallel Processing with \`.map\`

Using \`.map\` allows you to offload expensive computations to powerful machines while gathering results. This is particularly useful for pipeline steps with bursty resource demands. Modal handles all infrastructure provisioning and de-provisioning automatically.

Here's how to implement parallel video similarity queries as a single Modal Function call:

\`\`\`python
# Run jobs and collect results with \`modal run gather.py\`
import modal

app = modal.App("gather-results-example")

@app.function(gpu="L40S")
def compute_video_similarity(query: str, video_id: int) -> tuple[int, int]:
    # Embed video with GPU acceleration & compute similarity with query
    return video_id, score


@app.local_entrypoint()
def main():
    import itertools

    queries = itertools.repeat("Modal for batch processing")
    video_ids = range(100_000)

    for video_id, score in compute_video_similarity.map(queries, video_ids):
        # Process results (e.g., extract top 5 most similar videos)
        pass
\`\`\`

This example runs \`compute_video_similarity\` on an autoscaling pool of L40S GPUs, returning scores to a local process for further processing.

## Integration with Existing Systems

The recommended way to use Modal Functions within your existing data pipeline is through [deployed Function invocation](/docs/guide/trigger-deployed-functions). After deployment, you can call Modal Functions from external systems:

\`\`\`python
def external_function(inputs):
    compute_similarity = modal.Function.from_name(
        "gather-results-example",
        "compute_video_similarity"
    )
    for result in compute_similarity.map(inputs):
        # Process results
        pass
\`\`\`

You can invoke Modal Functions from any Python context, gaining access to built-in observability, resource management, and GPU acceleration.
`,meta:{title:`Batch Processing`,description:`Modal is optimized for large-scale batch processing, allowing functions to scale to thousands of parallel containers with zero additional configuration. Function calls can be submitted asynchronously for background execution, eliminating the need to wait for jobs to finish or tune resource allocation.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Background Execution with <code>.spawn_map</code>`,1),b=t(`<code>--detach</code>`),x=t(`Parallel Processing with <code>.map</code>`,1),S=t(`<!> <p>Modal is optimized for large-scale batch processing, allowing functions to scale to thousands of parallel containers with zero additional configuration. Function calls can be submitted asynchronously for background execution, eliminating the need to wait for jobs to finish or tune resource allocation.</p> <p>This guide covers Modal’s batch processing capabilities, from basic invocation to integration with existing pipelines.</p> <!> <p>The fastest way to submit multiple jobs for asynchronous processing is by invoking a Function with <code>.spawn_map</code>. When combined with the <!> flag, your App continues running until all jobs are completed.</p> <p>Here’s an example of submitting 100,000 videos for parallel embedding. You can disconnect after submission, and the processing will continue to completion in the background:</p> <!> <p>This pattern works best for jobs that store results externally—for example, in a <!>, <!>, or your own database*.</p> <p><em>* For database connections, consider using <!> to maintain a static IP across thousands of containers.</em></p> <!> <p>Using <code>.map</code> allows you to offload expensive computations to powerful machines while gathering results. This is particularly useful for pipeline steps with bursty resource demands. Modal handles all infrastructure provisioning and de-provisioning automatically.</p> <p>Here’s how to implement parallel video similarity queries as a single Modal Function call:</p> <!> <p>This example runs <code>compute_video_similarity</code> on an autoscaling pool of L40S GPUs, returning scores to a local process for further processing.</p> <!> <p>The recommended way to use Modal Functions within your existing data pipeline is through <!>. After deployment, you can call Modal Functions from external systems:</p> <!> <p>You can invoke Modal Functions from any Python context, gaining access to built-in observability, resource management, and GPU acceleration.</p>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`batch-processing`,children:(e,t)=>{l(),i(e,r(`Batch Processing`))},$$slots:{default:!0}});var h=c(p,6);u(h,{id:`background-execution-with-spawn_map`,children:(e,t)=>{l();var n=y();l(),i(e,n)},$$slots:{default:!0}});var g=c(h,2);m(c(e(g),3),{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(g);var _=c(g,4);f(_,{code:`%23%20Kick%20off%20asynchronous%20jobs%20with%20%60modal%20run%20--detach%20batch_processing.py%60%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22batch-processing-example%22)%0Avolume%20%3D%20modal.Volume.from_name(%22video-embeddings%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.function(volumes%3D%7B%22%2Fdata%22%3A%20volume%7D)%0Adef%20embed_video(video_id%3A%20int)%3A%0A%20%20%20%20%23%20Business%20logic%3A%0A%20%20%20%20%23%20-%20Load%20the%20video%20from%20the%20volume%0A%20%20%20%20%23%20-%20Embed%20the%20video%0A%20%20%20%20%23%20-%20Save%20the%20embedding%20to%20the%20volume%0A%20%20%20%20...%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20embed_video.spawn_map(range(100_000))`,lang:`python`});var v=c(_,2),C=c(e(v));m(C,{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),m(c(C,2),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{l(),i(e,r(`Cloud Bucket Mount`))},$$slots:{default:!0}}),l(),n(v);var w=c(v,2),T=e(w);m(c(e(T)),{href:`/docs/guide/proxy-ips`,children:(e,t)=>{l(),i(e,r(`Modal Proxy`))},$$slots:{default:!0}}),l(),n(T),n(w);var E=c(w,2);u(E,{id:`parallel-processing-with-map`,children:(e,t)=>{l();var n=x();l(),i(e,n)},$$slots:{default:!0}});var D=c(E,6);f(D,{code:`%23%20Run%20jobs%20and%20collect%20results%20with%20%60modal%20run%20gather.py%60%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22gather-results-example%22)%0A%0A%40app.function(gpu%3D%22L40S%22)%0Adef%20compute_video_similarity(query%3A%20str%2C%20video_id%3A%20int)%20-%3E%20tuple%5Bint%2C%20int%5D%3A%0A%20%20%20%20%23%20Embed%20video%20with%20GPU%20acceleration%20%26%20compute%20similarity%20with%20query%0A%20%20%20%20return%20video_id%2C%20score%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20import%20itertools%0A%0A%20%20%20%20queries%20%3D%20itertools.repeat(%22Modal%20for%20batch%20processing%22)%0A%20%20%20%20video_ids%20%3D%20range(100_000)%0A%0A%20%20%20%20for%20video_id%2C%20score%20in%20compute_video_similarity.map(queries%2C%20video_ids)%3A%0A%20%20%20%20%20%20%20%20%23%20Process%20results%20(e.g.%2C%20extract%20top%205%20most%20similar%20videos)%0A%20%20%20%20%20%20%20%20pass`,lang:`python`});var O=c(D,4);u(O,{id:`integration-with-existing-systems`,children:(e,t)=>{l(),i(e,r(`Integration with Existing Systems`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{l(),i(e,r(`deployed Function invocation`))},$$slots:{default:!0}}),l(),n(k),f(c(k,2),{code:`def%20external_function(inputs)%3A%0A%20%20%20%20compute_similarity%20%3D%20modal.Function.from_name(%0A%20%20%20%20%20%20%20%20%22gather-results-example%22%2C%0A%20%20%20%20%20%20%20%20%22compute_video_similarity%22%0A%20%20%20%20)%0A%20%20%20%20for%20result%20in%20compute_similarity.map(inputs)%3A%0A%20%20%20%20%20%20%20%20%23%20Process%20results%0A%20%20%20%20%20%20%20%20pass`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=1WfkDpB32.js.map
