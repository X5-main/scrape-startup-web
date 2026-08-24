(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0e225efb-19ff-4be3-83d4-6d2809e9eb75`,e._sentryDebugIdIdentifier=`sentry-dbid-0e225efb-19ff-4be3-83d4-6d2809e9eb75`)}catch{}})();import{r as e}from"../chunks/COtFpfH5.js";import{$t as t,Ft as n,St as r,Tn as i,_n as a,bt as o,en as s,fn as c,h as l,ht as u,m as d,tn as f,vn as p,wn as m}from"../chunks/F_ixKBiO.js";import{t as h}from"../chunks/BqPQayrc.js";import"../chunks/B1sc9Zdx.js";import{r as g}from"../chunks/stT5DusC2.js";import{n as _,t as v}from"../chunks/Dpvl1BDr.js";import{t as y}from"../chunks/DB3PWJo92.js";import{n as b,r as x,t as S}from"../chunks/C6JX7bmt.js";var C=()=>({title:`LLM Engineer's Almanac - How to Benchmark LLM Engines | Modal`,ogTitle:`LLM Engineer's Almanac - How to Benchmark LLM Engines`,ogDescription:`Principles and practices for benchmarking LLM inference engines`,ogImageUrl:`https://modal-cdn.com/llm-almanac/preview-image.png`}),w=e({load:()=>T}),T=C?h(C):void 0,E=r(`<div class="flex flex-col"><h1 id="benchmarks-how-do-i" class="mb-2 text-3xl font-bold">How do I benchmark an LLM engine?</h1> <p class="italic">This methodology depends substantially on the excellent work by Neural Magic
    (acquired by Red Hat) on the <a href="https://github.com/neuralmagic/guidellm" class="svelte-1kop7kx">guidellm</a> tool for LLM engine benchmarking.</p> <img src="https://modal-cdn.com/llm-almanac/illustration-hand.png" alt="" class="aspect-video max-h-[350px] self-center"/></div> <div class="page-body mb-6 flex flex-col text-lg"><p class="svelte-1kop7kx">If you want to benchmark an LLM engine, you first need to know the <em>workload</em> (or loads) that you want to test.</p> <p class="svelte-1kop7kx">That means you should have figured out a small set of options for:</p> <div class="ml-8"><ul class="list-disc"><li>the model you want to run, including what levels of quantization are
        acceptable. These are concerns for the product team and AI/ML engineers.
        If that includes you, congratulations! You are a <em>full-stack AI engineer</em>.</li> <li>measuring or estimating typical counts of input tokens in requests and
        output tokens generated.</li> <li>the framework you want to run. See our <a href="/llm-almanac/summary" class="svelte-1kop7kx">executive summary</a> for some suggestions on how to choose a framework.</li></ul></div> <p class="svelte-1kop7kx">Additionally, you should already have some latency objectives in mind — on
    the time-to-first-token if you're streaming responses or on the
    time-to-last-token if you're sending complete responses (these terms are
    defined below).</p> <p class="svelte-1kop7kx">By the way, if you already have all of this information, you should check
    out our <a href="/llm-almanac/advisor" class="svelte-1kop7kx">LLM Engine Advisor</a>, which
    recommends an engine configuration based on these constraints.</p> <p class="svelte-1kop7kx">In our open source LLM engine benchmarking framework, <code><a href="https://github.com/modal-labs/stopwatch" class="svelte-1kop7kx">stopwatch</a></code>, we first upper- and lower-bound the throughput a single replica of an LLM
    engine can achieve for a given workload on a given hardware configuration.
    Then we sweep through rates in between. In all cases, we collect up latency
    metrics. In the rest of this article, we will walk through the
    justification, the nuances, and the details of this benchmarking technique.</p> <p class="svelte-1kop7kx">Our benchmark configuration format and Modal's serverless, auto-scaling
    infrastructure together allow us to express and then run almost all of this
    work in parallel — within configurations and across them. By Amdahl's Law,
    we can, in principle, finish the several thousand experiments in our
    benchmark suite in the time it takes to complete two experiments serially
    (about ten minutes). We've achieved this in practice for up to dozens of
    runs (at most 100 GPUs), which is all we needed to complete this project on
    a satisfactory timeline — any more would've just been showing off.</p> <p class="svelte-1kop7kx">If you're interested in scaling out your own CPU or GPU workloads onto
    hundreds or thousands of containers, <a href="https://portal.usepylon.com/modal/forms/contact-us" class="svelte-1kop7kx">get in touch</a>.</p> <h2 class="text-2xl font-bold svelte-1kop7kx">How do I benchmark the maximum throughput of an LLM engine?</h2> <!> <p class="svelte-1kop7kx">The maximum throughput of an LLM engine is the maximum number of requests
    per second (RPS) it can handle. If requests arrive at a rate higher than
    this for a sustained period, then the system has no choice but to queue
    them. It is a central result of queueing theory that this queue then grows
    without bound, and so latencies grow without bound — until eventually the
    system breaks, leaving a bunch of angry users.</p> <p class="svelte-1kop7kx">It is measured from the perspective of all requests, not any request in
    particular. The RPS is usually determined by clients of the service, in
    aggregate, and the engineer has limited control of it. This makes it
    something of an "independent variable", and so it appears along the x-axis
    of many of our, and others', benchmarking charts. In developing an LLM
    engine service or LLM application, you should work with your clients to
    determine what their demand is or to estimate it.</p> <p class="svelte-1kop7kx">To benchmark maximum throughput, we use <code>guidellm</code> from Red Hat
    in its <code>throughput</code> mode. A batch of requests are sent from a client
    to the server at the same time. If you're into calculus, you might think of this
    as an "infinite request rate" that lasts for an "infinitely short period" (even
    math-ier: a Dirac delta distribution, as in impulse response characterization
    of linear time-invariant systems).</p> <p class="svelte-1kop7kx">The client then waits for the entire batch to finish. We measure the total
    duration and divide the number of requests by it to get a request rate.
    Because all of the requests arrived at once, the maximum amount of
    request-level parallelism is exposed to the engine, and so the engine has
    the best chance to take advantage of that parallelism to increase aggregate
    throughput, at the likely expense of latency.</p> <p class="svelte-1kop7kx">We also measure the latency statistics per request. But dropping requests in
    huge batches and waiting for them to finish is not likely to be the way
    anyone runs an LLM engine if they care about those latencies! For that
    reason, we exclude these results from our <a href="/llm-almanac/advisor" class="svelte-1kop7kx">LLM Engine Advisor</a> display.</p> <p class="svelte-1kop7kx">The figure above depicts the results of our maximum throughput benchmarking
    experiments across a variety of workloads run by different LLM engines,
    ranging from small models run at dozens of RPS to large models run at under
    one RPS. To handle larger demand, multiple replicas of the engine must be
    run.</p> <p class="svelte-1kop7kx">Note that we don't measure tokens per second, but instead requests per
    second. In our experience, this creates a false equivalence between
    workloads - a false fungibility of tokens - that is more obfuscating than
    clarifying.</p> <h2 class="text-2xl font-bold svelte-1kop7kx">How do I benchmark the minimum latency of an LLM engine?</h2> <!> <p class="svelte-1kop7kx">The minimum latency of an LLM engine is the fastest that it can service a
    request — the minimum amount of time the work of the system is "latent", or
    not visible, from the perspective of the client. This is generally a
    service-level objective (SLO) determined by communication with clients of
    the service and then made the engineer's responsibility. Note that this is
    in part a matter of user perception and so can often be cleverly worked
    around with user interface elements or interaction design tricks. See the
    next section for more.</p> <p class="svelte-1kop7kx">To benchmark minimum latency, we use <code>guidellm</code> in its <code>synchronous</code> mode. The client sends one single request and then waits
    for a response before sending another. This ensures that the engine only needs
    to service a single request at a time. The minimum amount of request-level parallelism
    is exposed to the engine, but there is now no contention for resources between
    requests, and so the engine has the best chance to service the request as quickly
    as is possible.</p> <p class="svelte-1kop7kx">Notice that the number of requests per second we observe now drops
    precipitously. This is an incredibly expensive way to run an LLM engine!
    Especially on GPUs, which are designed, from silicon to software, to
    maximize throughput instead of minimize latency. It is at best used as a
    temporary solution to hit a tight latency SLO you can't satisfy otherwise.</p> <h2 class="text-2xl font-bold svelte-1kop7kx">How do I measure latency for an LLM engine?</h2> <p class="svelte-1kop7kx">The "latency" that matters for any system is use-case dependent. It is the
    answer to the question: "what is the duration during which this system
    appears idle to clients?". Like a bad manager, clients of a service
    generally don't care about the work you are doing or how hard it is, they
    only care about results — or did you stop to think about the <a href="https://euripides.dk/setebos/frx/matrix/ai/books/stephenson_mother_earth_mother_board.pdf" class="svelte-1kop7kx">submarine Internet cables</a> or the <a href="https://youtu.be/K2QHdgAKP-s" class="svelte-1kop7kx">life of a pixel</a> while you waited
    for this page to load and render?</p> <p class="svelte-1kop7kx">The critical latency metrics for an LLM engine, from the perspective of a
    client, are how long it takes to return any tokens to that client (TTFT) and
    how long it takes to return all tokens to that client (TTLT). The TTLT is
    fraught with nuance, so LLM engineers often measure the time between tokens
    (ITL) instead.</p> <h3 class="text-xl font-bold svelte-1kop7kx">What is time-to-first-token (TTFT)?</h3> <p><em>Time-to-first-token</em> (TTFT) is most important in systems where
    response tokens can be streamed as soon as they are available. Human users
    waiting for answers from chatbots, or to see the thinking tokens of a
    "reasoning" model appear, care quite a bit about this number. From the
    perspective of the LLM engineer and their engine, the TTFT is a reasonable
    metric as well. It measures the time to complete the "prefill" or "prompt
    processing" step of LLM inference, during which the Transformer can be run
    in parallel across the sequence, as it was during training. It is named
    analogously to <a href="https://web.dev/articles/ttfb" class="svelte-1kop7kx">time-to-first-byte</a>. TTFTs in our
    dataset range from around two hundred ms to tens of seconds.</p> <h3 class="text-xl font-bold svelte-1kop7kx">What is time-to-last-token (TTLT)?</h3> <p class="svelte-1kop7kx"><em>Time-to-last-token</em> (TTLT) is most important in systems where response
    tokens cannot be returned to clients as they are available, but only once the
    final token is available. If the client is another computer which needs to parse
    the resulting tokens as, say, a JSON object, then TTLT represents the earliest
    time at which that object can be available. TTLTs in our dataset range from a
    large fraction of a second to many tens of seconds.</p> <p class="svelte-1kop7kx">The TTLT is less commonly the figure of merit when the final client is a
    human user, because humans can read partial results just fine. But designing
    user interactions around streaming results can be challenging (e.g.
    streaming multiline text in a code editor can be jarring).</p> <p class="svelte-1kop7kx">The TTLT is a tricky metric. Perhaps surprisingly, it is under control of
    the language model, not the engineer, the engine, or the even the user,
    since in almost all applications the last token to be emitted is a "stop"
    token. That is, with each token generated, the model calculates a
    probability for the stop token, along with all other tokens its vocabulary,
    and so estimates the chance that it is done with the request. Alien
    intelligences that they are, this behavior of language models can be quite
    unpredictable. During benchmarking, we continue generating after stop tokens
    are emitted in order to get a cleaner number, but this is highly
    unrealistic.</p> <h3 class="text-xl font-bold svelte-1kop7kx">What is inter-token latency (ITL)?</h3> <p class="svelte-1kop7kx"><em>Inter-token latency</em> (ITL) is a "back-of-house" metric that is more useful
    for understanding LLM engines on their own terms than it is for communicating
    requirements with clients. It measures the time it takes to generate a single
    token (typically averaged over a small number of tokens). The smallest inter-token
    latencies are at around a millisecond, for latency-optimized small models running
    on short contexts on large GPUs, and the largest are at a large fraction of a
    second, for very large models.</p> <p class="svelte-1kop7kx">The ITL, also known as the "time-per-output-token", or TPOT, is most useful
    for estimating how the TTLT will vary as the output lengths vary. It
    measures the time for each step in the "decode" (or "output generation" or
    "autoregressive") phase of LLM inference, during which tokens are created
    one (or a few) at a time. The average of the ITL can be used to estimate the
    throughput of the decode phase.</p> <h3 class="text-xl font-bold svelte-1kop7kx">How can I estimate latencies without running in production?</h3> <p class="svelte-1kop7kx">High-performance computing is done relative to the "speed-of-light". That is
    literal in the case of networks but figurative in most other cases, where
    "speed-of-light" represents the maximum speed supported by the hardware.
    This speed-of-light can be used to bound latency — for example, a model with
    8B parameters, each one byte, will not be loaded up the memory hierarchy
    from the <a href="/gpu-glossary/device-hardware/gpu-ram" class="svelte-1kop7kx">GPU's RAM</a> to the <a href="/gpu-glossary/device-hardware/register-file" class="svelte-1kop7kx">GPU's register files</a> any faster than 4 TB/s on an H100, so you will never beat half a millisecond
    ITL in that setting (we've seen about 5ms when optimizing for latency). You can
    find a now-classic walkthrough of the arithmetic by kipply <a href="https://kipp.ly/transformer-inference-arithmetic/" class="svelte-1kop7kx">here</a> and a quick explainer of the most popular attainment metric, "Model FLOP/s Utilization",
    in <a href="/blog/gpu-utilization-guide" class="svelte-1kop7kx">one of our blog posts</a>.</p> <p class="svelte-1kop7kx">These give lower bounds, but LLM engineers are usually concerned with upper
    bounds on percentiles, which don't admit such clean analysis. Where rational
    methods fail, we turn to empirical methods and start measuring and
    benchmarking.</p> <p class="svelte-1kop7kx">That'll be more expensive than a pen and paper, so we want to be efficient
    in our measurement. Given the data-dependence of TTLT described above, it
    may seem that you need to run exactly the workload you expect to see in
    production in order to determine performance.</p> <p class="svelte-1kop7kx">Luckily the ITL can be used, along with the TTFT, to estimate the TTLT when
    outputs have varying length: just add the ITL times the output length.
    There's a bit of nuance here. The ITL should monotonically increase with
    input length and with the number of previously generated tokens. Though it
    doesn't admit a simple mathematical justification, we suggest a
    hard-and-fast "three nineties" rule-of-thumb: use the 90th percentile (p90)
    TTFT and multiply the p90 ITL by the number of output tokens to estimate the
    p90 TTLT.</p> <p class="svelte-1kop7kx">It is still a good idea to match benchmarking data with production data, at
    least at a coarse level. Our benchmarks were run with natural language data
    (<em>Pride and Prejudice</em>) which has different characteristics to
    programming language data. For example, the latter admits higher success
    rates for simple token speculation techniques, which improve performance.</p> <h2 class="text-2xl font-bold svelte-1kop7kx">How do latency and throughput for LLM engines depend on request load?</h2> <!> <p class="svelte-1kop7kx">Above are described the techniques we use to measure determine minimum
    latency and maximum throughput of an LLM engine on a given workload (model,
    quantization, and in/out sequence length). The minimum latency also gives us
    an approximate minimum throughput — the lowest request rate at which the
    engine always has work to do. You might call this the request rate at which
    the engine achieves 100% "request utilization" (see <a href="/blog/gpu-utilization-guide" class="svelte-1kop7kx">this blog post</a> for discussion of utilization rates for GPUs).</p> <p class="svelte-1kop7kx">We then use <code>guidellm</code> in its <code>constant</code> mode to probe
    the latencies observed at rates in between the minimum sensible and maximum feasible
    rate. Here, the client sends requests at the specified rate per second without
    waiting for the server to respond and collects latency metrics.</p> <p class="svelte-1kop7kx">This more closely resembles a realistic deployment of an LLM engine, where
    the aggregate of all clients produce requests at a rate that typically
    varies slowly (relative to the request rate).</p> <p class="svelte-1kop7kx">These are the results shown above. You can explore them in our <a href="/llm-almanac/advisor" class="svelte-1kop7kx">LLM Engine Advisor</a>.</p> <h2 class="text-2xl font-bold svelte-1kop7kx">So, which LLM engine should I run?</h2> <p class="svelte-1kop7kx">Head to the <a href="/llm-almanac/advisor" class="svelte-1kop7kx">LLM Engine Advisor</a> and put in
    your workload to get a suggested configuration. If you want higher-level
    advice about how to choose an engine or how to think about running your own
    LLMs, see our <a href="/llm-almanac/summary" class="svelte-1kop7kx">executive summary</a>.</p> <p class="md:mx-16 svelte-1kop7kx"><em>The authors would like to thank <a href="https://github.com/mgoin" class="svelte-1kop7kx">Michael Goin</a>, vLLM committer, <a href="https://www.linkedin.com/in/ishandhanani/" class="svelte-1kop7kx">Ishan Dhanani</a>,
      senior engineer on <a href="https://github.com/ai-dynamo/dynamo" class="svelte-1kop7kx">NVIDIA Dynamo</a>, and <a href="https://github.com/zhyncs" class="svelte-1kop7kx">Yineng Zhang</a>, inference lead for
      SGLang, for feedback on this benchmarking approach and review of early
      results.</em></p></div>`,1);function D(e,r){p(r,!0);let h=()=>l(A,`$data`,w),C=()=>l(j,`$error`,w),[w,T]=d(),D=c(y),O=c(()=>Math.max(600,n(D)*.5)),k=c(()=>n(D)-20),{data:A,error:j}=g(`https://modal-cdn.com/llm-almanac/all-results-2025-05-24.json`,{revalidateOnFocus:!1}),M=c(()=>b(h()?.rows??[],[],`ttft_p95`)),N=c(()=>n(M).filteredRows),P=c(()=>({rows:n(N)})),F=e=>({$schema:`https://vega.github.io/schema/vega-lite/v6.json`,description:`A bar chart of different LLM model run configurations, showing the maximum throughput in each case.`,data:{name:`rows`},height:n(O),width:n(k),autosize:{type:`fit`,resize:!0},mark:{type:`bar`,tooltip:{content:`data`}},transform:[{filter:`datum['rate_type'] === '${e}'`},{calculate:x.filter(e=>[`Framework`,`Model`,`Task`].includes(e.label)).map(e=>`datum['${e.label}']`).join(` + ', ' + `),as:`legendString`}],encoding:{x:{title:`Experiment`,field:`legendString`,sort:`-y`,axis:{labelOverlap:`greedy`}},y:{title:[`Throughput (requests/s)`,`Higher is better →`],field:`queries_per_second`,type:`quantitative`},color:{legend:null,title:`Configuration`,field:`legendString`,type:`nominal`,scale:{range:v}},tooltip:[...x.map(e=>({field:e.label,type:`nominal`,title:e.label}))]}});var I=E(),L=f(s(I),2),R=f(t(L),18),z=e=>{{let t=c(()=>F(`throughput`));_(e,{get data(){return n(P)},viewVL:void 0,get spec(){return n(t)},isMobile:!1})}};u(R,e=>{h()&&e(z)});var B=f(R,18),V=e=>{{let t=c(()=>F(`synchronous`));_(e,{get data(){return n(P)},viewVL:void 0,get spec(){return n(t)},isMobile:!1})}};u(B,e=>{h()&&e(V)});var H=f(B,46),U=e=>{{let t=c(()=>h()?.rows.filter(e=>e.rate_type==`constant`));S(e,{get clientWidth(){return n(D)},get rows(){return n(t)},get loadingError(){return C()},hideFilters:!0,hideLegend:!0,hideCodeSample:!0,skipBestCalculation:!0,filterConditions:[],selectedYMetricGroupKey:`ttlt`,selectedYMetricAggregateKey:`p50`,useOpacity:!0})}};u(H,e=>{h()&&e(U)}),m(14),i(L),o(e,I),a(),T()}export{D as component,w as universal};
//# sourceMappingURL=205.BW1Nu1A1.js.map
