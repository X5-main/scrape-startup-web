(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8c3d25ad-316b-4d9e-ab0d-f96462959ce6`,e._sentryDebugIdIdentifier=`sentry-dbid-8c3d25ad-316b-4d9e-ab0d-f96462959ce6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`Introducing Modal Batch: Process 1 million jobs with 1 line of code`,description:`Modal Batch is a new interface backed by a new durable queue system built specifically to make job processing easy, scalable, and fault-tolerant.`,authors:[{name:`Richard Gong`,avatarUrl:`https://modal-cdn.com/blog/images/gongy-modal.webp`,jobTitle:`Member of Technical Staff`,twitterHandle:null}],date:`2025-05-22T12:00:00.000Z`,length:`10 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`How it works`,id:`how-it-works`},{depth:2,value:`Wait, I thought batch processing was already possible on Modal`,id:`wait-i-thought-batch-processing-was-already-possible-on-modal`},{depth:2,value:`Why Modal Batch over alternatives`,id:`why-modal-batch-over-alternatives`},{depth:2,value:`Customer Stories`,id:`customer-stories`,children:[{depth:3,value:`Speeding up document processing at Harvey`,id:`speeding-up-document-processing-at-harvey`},{depth:3,value:`Scaling audio processing at Suno`,id:`scaling-audio-processing-at-suno`},{depth:3,value:`Preparing Scientific Datasets at Achira`,id:`preparing-scientific-datasets-at-achira`}]},{depth:2,value:`What’s next?`,id:`whats-next`},{depth:2,value:`Get started today`,id:`get-started-today`}],rawContent:`We’re excited to announce the launch of [Modal Batch](/docs/guide/batch-processing)—a new interface backed by a new durable queue system built specifically to make job processing easy, scalable, and fault-tolerant.

Many of our AI customers have batch processing needs. From preprocessing audio clips for training to embedding documents offline, customers need an efficient way to transform millions of data inputs at once. Modal’s ultra-fast container infrastructure makes us particularly well-suited to expand into this use case. Companies like Harvey, Suno, and Achira already use Modal Batch today.

## How it works

Let’s say you need to embed a million video clips.

First, define a Modal Function that performs the embedding. You can specify a custom image or specific hardware for the Function if needed.

\`\`\`python
import modal

app = modal.App("video-embedding")

@app.function(
	gpu="L40S",                    # GPU-accelerated processing
	retries=2,                     # Work through transient errors
	volumes={"/videos": volume},   # Mount a distributed filesystem
)
def embed(video):
    # Business logic!
    ...
\`\`\`

Next, call \`.spawn_map\` on that Function with the set of your million video clips as input. This will instantly launch thousands of containers in the cloud and is guaranteed to run reliably to completion on all your inputs.

\`\`\`python
@app.local_entrypoint()
def main():
	embed.spawn_map(videos)
\`\`\`

That’s it! Watch us spin up 100+ containers to handle 25,000 inputs here:

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/batch-run.mp4" type="video/mp4">
    </video>
</center>

## Wait, I thought batch processing was already possible on Modal

Not like this. You may have used \`.map\` or \`.spawn\` before to process many inputs at once, but we’ve introduced a number of step-change improvements that make Modal much better suited for massive jobs.

- We overhauled our queue system so that it could handle 500x more inputs. You can queue 1 million inputs at once now, up from 2000.
- We now guarantee inputs will be executed up to 7 days after you launch a batch job, up from 1 day.
- We introduced a native handler, \`.spawn_map\`, to spawn batches of inputs. Previously, you had to manage async logic yourself to call \`.spawn\` concurrently over your inputs.

## Why Modal Batch over alternatives

Setting up batch processing is complex because you’re typically working with a full distributed system to handle payload storage, batch orchestration, cloud resource scaling, monitoring, and more. Modal Batch capitalizes on Modal’s existing strengths so you can stay focused on business logic over infrastructure.

**Enterprise-grade scalability.** Our custom container runtime, filesystem, and scheduler allow us to instantly spin up thousands of containers—including with GPUs, no reservations required—to complete your job.

![Diagram of scheduler architecture](https://modal-cdn.com/blog/images/batch-scheduler.webp)

**Ergonomic UX.** Launching a batch job doesn’t require leaving your IDE. There are no cloud consoles, YAML files, or container orchestration systems to manage.

**Easy debugging.** Modal’s dashboard lets you drill into logs and metrics for individual inputs and containers so you can quickly pinpoint failures. You can also see these metrics in aggregate for each batch job.

![Diagram of batch job dashboard](https://modal-cdn.com/blog/images/batch-error.webp)

**Integrated with the rest of your ML pipeline.** Because Modal is a general-purpose compute platform, you can easily chain together Functions for batch processing, training, or inference with the same Python UX.

## Customer Stories

Our customers have built diverse applications on top of Modal Batch since we launched in beta.

### Speeding up document processing at Harvey

Harvey is an AI platform used by legal teams to accelerate document-based workflows. One key feature is the ability for users to quickly pull relevant insights from knowledge bases of case laws, tax regulations, and legislation. Powering this requires their data team to preprocess, chunk, and embed millions of documents—which is where Modal comes in.

Using Modal Batch, Harvey observed a 10x speed-up in their data processing pipeline, since Modal could quickly fan out their document inputs across 1000 containers. Previously, the team used open-source orchestrators like Argo and Airflow, which meant they had to manage the underlying infrastructure themselves. This resulted in high operating costs and limited scalability.

<Quote authorName="Samarth Goel" authorTitle="ML engineer at Harvey">
    <span>
        With the old in-house systems, we'd have to tune number of workers, instance size, parallelization strategy, all this stuff, which was very time-consuming and not directly generating business value. Modal magically handled all that.
    </span>
</Quote>

### Scaling audio processing at Suno

Suno is pushing the boundaries of AI-generated music with their state-of-the-art audio models. Their latest 4.5 model can generate up to 8 minutes of high-fidelity audio at 48kHz in stereo. But with great audio quality comes massive data processing needs. Training these models requires preprocessing enormous datasets, running embeddings, and preparing training data—all at a scale that would typically demand a big dedicated GPU cloud and a team to manage.

Modal enables Suno to:

- Launch a batch job on thousands of GPUs on short notice without infrastructure setup
- Run GPU-accelerated pre-processing models on high bandwidth audio data
- Maintain simple scripts that "just work" without ongoing maintenance

<Quote authorName="Georg Kucsko" authorTitle="CTO at Suno">
    <span>
        Modal's autoscaling capabilities give us the best of both worlds. We get the power of a massive GPU cloud when we need it, without the complexity of managing spot instances or cloud-specific infrastructure.
    </span>
</Quote>

### Preparing Scientific Datasets at Achira

Achira is advancing drug discovery by building atomistic foundation simulation models. A key part of their workflows involve processing and validating quantum mechanical datasets for model training. These datasets, while high signal, require additional processing to add crucial metadata which is not always present.

<Quote authorName="Liz Decolvenaere" authorTitle="Quantum Chemical Engineer at Achira">
    <span>
        Processing external quantum mechanical datasets comes with unique challenges. Jobs can fail in numerous ways—from low-level errors thrown by the underlying analysis packages, to transient issues communicating with our storage server. Modal's retry mechanism and batching primitives have made our data pipeline much more robust.
    </span>
</Quote>

## What’s next?

We're extending Modal's batch processing capabilities while maintaining our core principle of a simple _function_ interface. Coming soon:

- **Function caching**: Never run the same computation twice.
- **Improved ergonomics:** Interact with your batch job programmatically—change priority, check progress, and cancel from your Python code.
- **Support in other languages:** Use our SDKs for JavaScript or other languages to write your batch jobs.

## Get started today

Ready for a dead simple way to throw a thousand containers at your batch job?

1. Install Modal:\xA0\`pip install modal\`
2. Create an account:\xA0\`python -m modal setup\`
3. Check out our [batch processing documentation](/docs/guide/batch-processing)

Join our\xA0[Slack community](https://modal.com/slack) if you have questions or want to share feature requests. We can't wait to see what you build!
`,meta:{description:`Modal Batch is a new interface backed by a new durable queue system built specifically to make job processing easy, scalable, and fault-tolerant.`}},{title:g,description:_,authors:v,date:y,length:b,category:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=h,D=t(`<span>With the old in-house systems, we'd have to tune number of workers, instance size, parallelization strategy, all this stuff, which was very time-consuming and not directly generating business value. Modal magically handled all that.</span>`),O=t(`<span>Modal's autoscaling capabilities give us the best of both worlds. We get the power of a massive GPU cloud when we need it, without the complexity of managing spot instances or cloud-specific infrastructure.</span>`),k=t(`<span>Processing external quantum mechanical datasets comes with unique challenges. Jobs can fail in numerous ways—from low-level errors thrown by the underlying analysis packages, to transient issues communicating with our storage server. Modal's retry mechanism and batching primitives have made our data pipeline much more robust.</span>`),A=t(`<p>We’re excited to announce the launch of <!>—a new interface backed by a new durable queue system built specifically to make job processing easy, scalable, and fault-tolerant.</p> <p>Many of our AI customers have batch processing needs. From preprocessing audio clips for training to embedding documents offline, customers need an efficient way to transform millions of data inputs at once. Modal’s ultra-fast container infrastructure makes us particularly well-suited to expand into this use case. Companies like Harvey, Suno, and Achira already use Modal Batch today.</p> <h2 id="how-it-works">How it works</h2> <p>Let’s say you need to embed a million video clips.</p> <p>First, define a Modal Function that performs the embedding. You can specify a custom image or specific hardware for the Function if needed.</p> <!> <p>Next, call <code>.spawn_map</code> on that Function with the set of your million video clips as input. This will instantly launch thousands of containers in the cloud and is guaranteed to run reliably to completion on all your inputs.</p> <!> <p>That’s it! Watch us spin up 100+ containers to handle 25,000 inputs here:</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/batch-run.mp4" type="video/mp4"/></video></center> <h2 id="wait-i-thought-batch-processing-was-already-possible-on-modal">Wait, I thought batch processing was already possible on Modal</h2> <p>Not like this. You may have used <code>.map</code> or <code>.spawn</code> before to process many inputs at once, but we’ve introduced a number of step-change improvements that make Modal much better suited for massive jobs.</p> <ul><li>We overhauled our queue system so that it could handle 500x more inputs. You can queue 1 million inputs at once now, up from 2000.</li> <li>We now guarantee inputs will be executed up to 7 days after you launch a batch job, up from 1 day.</li> <li>We introduced a native handler, <code>.spawn_map</code>, to spawn batches of inputs. Previously, you had to manage async logic yourself to call <code>.spawn</code> concurrently over your inputs.</li></ul> <h2 id="why-modal-batch-over-alternatives">Why Modal Batch over alternatives</h2> <p>Setting up batch processing is complex because you’re typically working with a full distributed system to handle payload storage, batch orchestration, cloud resource scaling, monitoring, and more. Modal Batch capitalizes on Modal’s existing strengths so you can stay focused on business logic over infrastructure.</p> <p><strong>Enterprise-grade scalability.</strong> Our custom container runtime, filesystem, and scheduler allow us to instantly spin up thousands of containers—including with GPUs, no reservations required—to complete your job.</p> <p><!></p> <p><strong>Ergonomic UX.</strong> Launching a batch job doesn’t require leaving your IDE. There are no cloud consoles, YAML files, or container orchestration systems to manage.</p> <p><strong>Easy debugging.</strong> Modal’s dashboard lets you drill into logs and metrics for individual inputs and containers so you can quickly pinpoint failures. You can also see these metrics in aggregate for each batch job.</p> <p><!></p> <p><strong>Integrated with the rest of your ML pipeline.</strong> Because Modal is a general-purpose compute platform, you can easily chain together Functions for batch processing, training, or inference with the same Python UX.</p> <h2 id="customer-stories">Customer Stories</h2> <p>Our customers have built diverse applications on top of Modal Batch since we launched in beta.</p> <h3 id="speeding-up-document-processing-at-harvey">Speeding up document processing at Harvey</h3> <p>Harvey is an AI platform used by legal teams to accelerate document-based workflows. One key feature is the ability for users to quickly pull relevant insights from knowledge bases of case laws, tax regulations, and legislation. Powering this requires their data team to preprocess, chunk, and embed millions of documents—which is where Modal comes in.</p> <p>Using Modal Batch, Harvey observed a 10x speed-up in their data processing pipeline, since Modal could quickly fan out their document inputs across 1000 containers. Previously, the team used open-source orchestrators like Argo and Airflow, which meant they had to manage the underlying infrastructure themselves. This resulted in high operating costs and limited scalability.</p> <!> <h3 id="scaling-audio-processing-at-suno">Scaling audio processing at Suno</h3> <p>Suno is pushing the boundaries of AI-generated music with their state-of-the-art audio models. Their latest 4.5 model can generate up to 8 minutes of high-fidelity audio at 48kHz in stereo. But with great audio quality comes massive data processing needs. Training these models requires preprocessing enormous datasets, running embeddings, and preparing training data—all at a scale that would typically demand a big dedicated GPU cloud and a team to manage.</p> <p>Modal enables Suno to:</p> <ul><li>Launch a batch job on thousands of GPUs on short notice without infrastructure setup</li> <li>Run GPU-accelerated pre-processing models on high bandwidth audio data</li> <li>Maintain simple scripts that “just work” without ongoing maintenance</li></ul> <!> <h3 id="preparing-scientific-datasets-at-achira">Preparing Scientific Datasets at Achira</h3> <p>Achira is advancing drug discovery by building atomistic foundation simulation models. A key part of their workflows involve processing and validating quantum mechanical datasets for model training. These datasets, while high signal, require additional processing to add crucial metadata which is not always present.</p> <!> <h2 id="whats-next">What’s next?</h2> <p>We’re extending Modal’s batch processing capabilities while maintaining our core principle of a simple <em>function</em> interface. Coming soon:</p> <ul><li><strong>Function caching</strong>: Never run the same computation twice.</li> <li><strong>Improved ergonomics:</strong> Interact with your batch job programmatically—change priority, check progress, and cancel from your Python code.</li> <li><strong>Support in other languages:</strong> Use our SDKs for JavaScript or other languages to write your batch jobs.</li></ul> <h2 id="get-started-today">Get started today</h2> <p>Ready for a dead simple way to throw a thousand containers at your batch job?</p> <ol><li>Install Modal:\xA0<code>pip install modal</code></li> <li>Create an account:\xA0<code>python -m modal setup</code></li> <li>Check out our <!></li></ol> <p>Join our\xA0<!> if you have questions or want to share feature requests. We can’t wait to see what you build!</p>`,3);function j(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=A(),m=s(o);p(c(e(m)),{href:`/docs/guide/batch-processing`,children:(e,t)=>{l(),i(e,r(`Modal Batch`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,10);f(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22video-embedding%22)%0A%0A%40app.function(%0A%09gpu%3D%22L40S%22%2C%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20GPU-accelerated%20processing%0A%09retries%3D2%2C%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Work%20through%20transient%20errors%0A%09volumes%3D%7B%22%2Fvideos%22%3A%20volume%7D%2C%20%20%20%23%20Mount%20a%20distributed%20filesystem%0A)%0Adef%20embed(video)%3A%0A%20%20%20%20%23%20Business%20logic!%0A%20%20%20%20...`,lang:`python`});var g=c(h,4);f(g,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%09embed.spawn_map(videos)`,lang:`python`});var _=c(g,4),v=e(_);v.muted=!0,n(_);var y=c(_,14);d(e(y),{src:`https://modal-cdn.com/blog/images/batch-scheduler.webp`,alt:`Diagram of scheduler architecture`}),n(y);var b=c(y,6);d(e(b),{src:`https://modal-cdn.com/blog/images/batch-error.webp`,alt:`Diagram of batch job dashboard`}),n(b);var x=c(b,14);u(x,{authorName:`Samarth Goel`,authorTitle:`ML engineer at Harvey`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}});var S=c(x,10);u(S,{authorName:`Georg Kucsko`,authorTitle:`CTO at Suno`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}});var C=c(S,6);u(C,{authorName:`Liz Decolvenaere`,authorTitle:`Quantum Chemical Engineer at Achira`,children:(e,t)=>{i(e,k())},$$slots:{default:!0}});var w=c(C,12),T=c(e(w),4);p(c(e(T)),{href:`/docs/guide/batch-processing`,children:(e,t)=>{l(),i(e,r(`batch processing documentation`))},$$slots:{default:!0}}),n(T),n(w);var E=c(w,2);p(c(e(E)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack community`))},$$slots:{default:!0}}),l(),n(E),i(t,o)},$$slots:{default:!0}}))}export{j as default,h as metadata};
//# sourceMappingURL=BsV8K4jg2.js.map
