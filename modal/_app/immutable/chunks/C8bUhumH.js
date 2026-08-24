(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5b925a8e-b821-4b69-ae37-978b445986ca`,e._sentryDebugIdIdentifier=`sentry-dbid-5b925a8e-b821-4b69-ae37-978b445986ca`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Boost your throughput with dynamic batching`,description:`Learn how we used our new dynamic batching feature to improve throughput and reduce inference costs for the Whisper model with a single line of code!`,authors:[{name:`Cathy Zhou`,avatarUrl:`https://modal-cdn.com/cathy-zhou.jpg`,jobTitle:`Software Engineering Intern`,twitterHandle:`cathyzbn`},{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`AI Engineer`,twitterHandle:`charles_irl`}],date:`2024-09-16T12:00:00.000Z`,length:`5 minute read`,category:`News`,published:!0,layout:`blog`,githubLink:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/batched_whisper.py`,toc:[{depth:2,value:`Why batching?`,id:`why-batching`},{depth:2,value:`Why dynamic batching?`,id:`why-dynamic-batching`},{depth:2,value:`Tripling throughput and cutting costs by two thirds with one line of code`,id:`tripling-throughput-and-cutting-costs-by-two-thirds-with-one-line-of-code`}],rawContent:`Dynamic batching is a powerful technique that can significantly improve the efficiency of workloads
from machine learning model inference to database queries.
By grouping requests and processing them together, dynamic batching increases throughput,
reduces duplication of work, and leads to lower costs.

We added [native dynamic batching support](https://modal.com/docs/guide/dynamic-batching)
to Modal to make it easier for our users to get these benefits.

In this post, we'll show you how we added dynamic batching to a Whisper transcription example
and achieved a 2.8x increase in throughput -- with just a single line of code.

You can find our code [here](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/batched_whisper.py).

## Why batching?

Batching is a fundamental technique in computer systems,
appearing everywhere from [write coalescing in SSDs](https://www.enterprisestorageforum.com/hardware/fixing-ssd-performance-degradation-part-1/)
to [Nagle's algorithm for TCP](https://brooker.co.za/blog/2024/05/09/nagle.html).

The core idea is simple: handling one request often requires more than half the resources for handling two requests together,
so we can make more effective use of our resources by grouping requests.

Batching can be particularly effective in the context of data-intensive Python applications.
For example, machine learning models often run on GPUs, which are optimized for parallel processing.
Handling even a single request on a GPU requires loading the entire model weights into the GPU's compute units
(in the equivalent of CPUs' caches and registers)
so they can be combined with the request's inputs to produce model outputs.

For OpenAI's audio transcription model [Whisper large v3](https://huggingface.co/openai/whisper-large-v3),
that means over six gigabytes of data must be loaded from the GPU's memory into the compute units for each request,
even if there's only a few KB of audio in and a few bytes of text out.

Combining multiple requests together before passing them through the model means we only have to move the model weights once,
leading to significant improvements in throughput.
This frequently doesn't even increase the latency for individual requests,
since GPU inference is typically bottlenecked on memory bandwidth rather than compute,
and CUDA programs overlap computation with data movement.

If you're interested in a deeper dive on this subject, check out [Horace He's blog post](https://horace.io/brrr_intro.html).

## Why dynamic batching?

Traditional batching schemes wait for a fixed number of requests to arrive and "fill the batch" before any are processed.
This isn't such a big deal during jobs with controlled request rates, like training a model on a fixed dataset.
But it can incur unbounded delays when requests arrive sporadically, as is typical in web services.

Dynamic batching avoids this unbounded delay by processing batches of requests either when the batch is full
or after a fixed time limit, whichever comes first.
The size and time limit can be configured to balance throughput and latency for your specific workload.

Some specialized inference frameworks, like [vLLM](https://blog.vllm.ai/2023/06/20/vllm.html) for language models,
offer implementations of dynamic batching and even [continuous batching](https://www.anyscale.com/blog/continuous-batching-llm-inference),
where responses are returned as soon as they finish, without waiting for other members of the batch.
But these frameworks are tied to specific models and use cases.

Modal's [dynamic batching feature](https://modal.com/docs/guide/dynamic-batching), on the other hand,
is simpler but more general-purpose. It can be combined with any workload that returns single responses to single requests.

## Tripling throughput and cutting costs by two thirds with one line of code

We tested inference with dynamic batching on OpenAI's [Whisper large v3 model](https://huggingface.co/openai/whisper-large-v3)
on an A10G with increasing batch sizes (until the instance ran out of memory).
Here's a graph of the throughput compared to the batch size:

![Graph of Whisper inference throughput for the A10G GPU versus batch size](https://modal-cdn.com/cdnbot/batching-whisper-batched-throughput-graph.png)

You can enable dynamic batching for your model with one simple change in your inference function.

Here's how we enabled dynamic batching for Whisper:

- ** Add \`@modal.batched()\` with batch configuration parameters. ** The decorator takes in \`max_batch_size\`, which limits the number
  of inputs combined into a single batch, and \`wait_ms\`, which limits the amount of time the function waits for more inputs after the first
  input is received. In this example, we selected \`max_batch_size\` to be the largest power of 2 that doesn't cause the A10G to run out of
  memory. See the [guide](/docs/guide/dynamic-batching) for more tips on optimizing configuration parameters for dynamic batching.
- ** Change the inference function to take in a list of samples and return a list of results. ** In this example, \`audio_samples\`
  and \`transcriptions\` are lists with equal lengths. Modal will automatically assemble the batched input list and distribute the output list for you.
  Most Hugging Face pipelines already handle lists of inputs, so we didn't need to change anything here.

And your inference batching is now ready to go!

\`\`\`python
@app.cls(gpu="a10g")  # in Modal, we decorate classes/functions with resource requirements
class Model:
    @modal.enter()  # load the model once when we start up, before processing any batches
    def load_model(self):
        # set up model
        self.pipeline = ...

    @modal.batched(max_batch_size=64, wait_ms=1000)  # add this decorator
    def transcribe(self, audio_samples: list) -> list:  # take in and return lists
        return self.pipeline(audio_samples, batch_size=len(audio_samples))
\`\`\`

By selecting a \`max_batch_size\` of 64, dynamic batching boosted our inference throughput by almost 3x
— from ~1.2 to ~3.3 requests per second per container.
This resulted in 65% savings on the cost to run inference on Modal!

Ready to try out dynamic batching for your application?
Explore the [full code example here](https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/batched_whisper.py)
and start optimizing your inference process!
`,meta:{description:`Learn how we used our new dynamic batching feature to improve throughput and reduce inference costs for the Whisper model with a single line of code!`}},{title:h,description:g,authors:_,date:v,length:y,category:b,published:x,layout:S,githubLink:C,toc:w,rawContent:T,meta:E}=m,D=t(`<p>Dynamic batching is a powerful technique that can significantly improve the efficiency of workloads
from machine learning model inference to database queries.
By grouping requests and processing them together, dynamic batching increases throughput,
reduces duplication of work, and leads to lower costs.</p> <p>We added <!> to Modal to make it easier for our users to get these benefits.</p> <p>In this post, we’ll show you how we added dynamic batching to a Whisper transcription example
and achieved a 2.8x increase in throughput — with just a single line of code.</p> <p>You can find our code <!>.</p> <h2 id="why-batching">Why batching?</h2> <p>Batching is a fundamental technique in computer systems,
appearing everywhere from <!> to <!>.</p> <p>The core idea is simple: handling one request often requires more than half the resources for handling two requests together,
so we can make more effective use of our resources by grouping requests.</p> <p>Batching can be particularly effective in the context of data-intensive Python applications.
For example, machine learning models often run on GPUs, which are optimized for parallel processing.
Handling even a single request on a GPU requires loading the entire model weights into the GPU’s compute units
(in the equivalent of CPUs’ caches and registers)
so they can be combined with the request’s inputs to produce model outputs.</p> <p>For OpenAI’s audio transcription model <!>,
that means over six gigabytes of data must be loaded from the GPU’s memory into the compute units for each request,
even if there’s only a few KB of audio in and a few bytes of text out.</p> <p>Combining multiple requests together before passing them through the model means we only have to move the model weights once,
leading to significant improvements in throughput.
This frequently doesn’t even increase the latency for individual requests,
since GPU inference is typically bottlenecked on memory bandwidth rather than compute,
and CUDA programs overlap computation with data movement.</p> <p>If you’re interested in a deeper dive on this subject, check out <!>.</p> <h2 id="why-dynamic-batching">Why dynamic batching?</h2> <p>Traditional batching schemes wait for a fixed number of requests to arrive and “fill the batch” before any are processed.
This isn’t such a big deal during jobs with controlled request rates, like training a model on a fixed dataset.
But it can incur unbounded delays when requests arrive sporadically, as is typical in web services.</p> <p>Dynamic batching avoids this unbounded delay by processing batches of requests either when the batch is full
or after a fixed time limit, whichever comes first.
The size and time limit can be configured to balance throughput and latency for your specific workload.</p> <p>Some specialized inference frameworks, like <!> for language models,
offer implementations of dynamic batching and even <!>,
where responses are returned as soon as they finish, without waiting for other members of the batch.
But these frameworks are tied to specific models and use cases.</p> <p>Modal’s <!>, on the other hand,
is simpler but more general-purpose. It can be combined with any workload that returns single responses to single requests.</p> <h2 id="tripling-throughput-and-cutting-costs-by-two-thirds-with-one-line-of-code">Tripling throughput and cutting costs by two thirds with one line of code</h2> <p>We tested inference with dynamic batching on OpenAI’s <!> on an A10G with increasing batch sizes (until the instance ran out of memory).
Here’s a graph of the throughput compared to the batch size:</p> <p><!></p> <p>You can enable dynamic batching for your model with one simple change in your inference function.</p> <p>Here’s how we enabled dynamic batching for Whisper:</p> <ul><li><strong>Add <code>@modal.batched()</code> with batch configuration parameters.</strong> The decorator takes in <code>max_batch_size</code>, which limits the number
of inputs combined into a single batch, and <code>wait_ms</code>, which limits the amount of time the function waits for more inputs after the first
input is received. In this example, we selected <code>max_batch_size</code> to be the largest power of 2 that doesn’t cause the A10G to run out of
memory. See the <!> for more tips on optimizing configuration parameters for dynamic batching.</li> <li><strong>Change the inference function to take in a list of samples and return a list of results.</strong> In this example, <code>audio_samples</code> and <code>transcriptions</code> are lists with equal lengths. Modal will automatically assemble the batched input list and distribute the output list for you.
Most Hugging Face pipelines already handle lists of inputs, so we didn’t need to change anything here.</li></ul> <p>And your inference batching is now ready to go!</p> <!> <p>By selecting a <code>max_batch_size</code> of 64, dynamic batching boosted our inference throughput by almost 3x
— from ~1.2 to ~3.3 requests per second per container.
This resulted in 65% savings on the cost to run inference on Modal!</p> <p>Ready to try out dynamic batching for your application?
Explore the <!> and start optimizing your inference process!</p>`,1);function O(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=D(),p=c(s(o),2);f(c(e(p)),{href:`https://modal.com/docs/guide/dynamic-batching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`native dynamic batching support`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,4);f(c(e(m)),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/batched_whisper.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4),g=c(e(h));f(g,{href:`https://www.enterprisestorageforum.com/hardware/fixing-ssd-performance-degradation-part-1/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`write coalescing in SSDs`))},$$slots:{default:!0}}),f(c(g,2),{href:`https://brooker.co.za/blog/2024/05/09/nagle.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Nagle’s algorithm for TCP`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,6);f(c(e(_)),{href:`https://huggingface.co/openai/whisper-large-v3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Whisper large v3`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);f(c(e(v)),{href:`https://horace.io/brrr_intro.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Horace He’s blog post`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,8),b=c(e(y));f(b,{href:`https://blog.vllm.ai/2023/06/20/vllm.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}}),f(c(b,2),{href:`https://www.anyscale.com/blog/continuous-batching-llm-inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`continuous batching`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,2);f(c(e(x)),{href:`https://modal.com/docs/guide/dynamic-batching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`dynamic batching feature`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,4);f(c(e(S)),{href:`https://huggingface.co/openai/whisper-large-v3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Whisper large v3 model`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);u(e(C),{src:`https://modal-cdn.com/cdnbot/batching-whisper-batched-throughput-graph.png`,alt:`Graph of Whisper inference throughput for the A10G GPU versus batch size`}),n(C);var w=c(C,6),T=e(w);f(c(e(T),8),{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{l(),i(e,r(`guide`))},$$slots:{default:!0}}),l(),n(T),l(2),n(w);var E=c(w,4);d(E,{code:`%40app.cls(gpu%3D%22a10g%22)%20%20%23%20in%20Modal%2C%20we%20decorate%20classes%2Ffunctions%20with%20resource%20requirements%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%20%20%23%20load%20the%20model%20once%20when%20we%20start%20up%2C%20before%20processing%20any%20batches%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20%23%20set%20up%20model%0A%20%20%20%20%20%20%20%20self.pipeline%20%3D%20...%0A%0A%20%20%20%20%40modal.batched(max_batch_size%3D64%2C%20wait_ms%3D1000)%20%20%23%20add%20this%20decorator%0A%20%20%20%20def%20transcribe(self%2C%20audio_samples%3A%20list)%20-%3E%20list%3A%20%20%23%20take%20in%20and%20return%20lists%0A%20%20%20%20%20%20%20%20return%20self.pipeline(audio_samples%2C%20batch_size%3Dlen(audio_samples))`,lang:`python`});var O=c(E,4);f(c(e(O)),{href:`https://github.com/modal-labs/modal-examples/blob/main/06_gpu_and_ml/openai_whisper/batched_whisper.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`full code example here`))},$$slots:{default:!0}}),l(),n(O),i(t,o)},$$slots:{default:!0}}))}export{O as default,m as metadata};
//# sourceMappingURL=C8bUhumH.js.map
