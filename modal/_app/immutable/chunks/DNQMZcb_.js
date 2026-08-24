(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d219909f-1fd7-4f8a-8b79-01670f68b117`,e._sentryDebugIdIdentifier=`sentry-dbid-d219909f-1fd7-4f8a-8b79-01670f68b117`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`The future of AI needs more flexible GPU capacity`,description:`Why Modal is obsessed with serverless AI infrastructure`,date:`2024-10-25T19:00:00.000Z`,length:`10 minute read`,category:`Engineering`,published:!0,layout:`blog`,authors:[{name:`Erik Bernhardsson`,avatarUrl:`https://modal-cdn.com/erik-bernhardsson.jpg`,jobTitle:`CEO and Founder`,twitterHandle:`bernhardsson`}],toc:[{depth:2,value:`How do you make money from AI models?`,id:`how-do-you-make-money-from-ai-models`},{depth:2,value:`Inference workloads are volatile`,id:`inference-workloads-are-volatile`},{depth:2,value:`It gets more complicated –\xA0the 24h cycle`,id:`it-gets-more-complicated-the-24h-cycle`},{depth:2,value:`It’s actually a lot worse than that!`,id:`its-actually-a-lot-worse-than-that`},{depth:2,value:`Training is also volatile!`,id:`training-is-also-volatile`},{depth:2,value:`There’s many other volatile workloads!`,id:`theres-many-other-volatile-workloads`},{depth:2,value:`How can GPU providers provide on-demand GPUs?`,id:`how-can-gpu-providers-provide-on-demand-gpus`,children:[{depth:3,value:`Demand pooling`,id:`demand-pooling`},{depth:3,value:`Supply pooling`,id:`supply-pooling`},{depth:3,value:`Multi-tenancy requires fast scaling`,id:`multi-tenancy-requires-fast-scaling`},{depth:3,value:`Demand smoothing`,id:`demand-smoothing`}]},{depth:2,value:`The future of GPU consumption`,id:`the-future-of-gpu-consumption`}],rawContent:`The last couple of years of Gen AI frenzy have brought us some undeniably cool new products, like Copilot and Suno.
One thing they all have in common is they demand _lots_ of compute –\xA0in particular GPUs.
But the supply of GPUs is constrained.
This supply-demand imbalance has caused the market for cloud GPUs to behave very differently than other cloud markets.

Why is that?
What should we do?
And what can we expect going forward?
Should startups keep buying long-term GPU reservations from cloud vendors?
Or will there be other options in the future?

## How do you make money from AI models?

AI is powered by GPUs, and most of the GPU demand today goes towards training large generative models.

But training is a cost center and eventually you need to recoup that cost through real revenue.
How do you do that?
Enter inference – the less sexy but money-making sibling of training.

So why is most GPU demand driven by training even though inference is where you make the money?
I think a lot of it reflects where we are in the cycle –\xA0there’s an _expectation_ that the revenue potential for inference is big, but in order to get this, you have to spend a lot of money on training.

The economics of this –\xA0high upfront capital, but large potential – is something VCs understand quite well, so I think this explains why model builders have had no challenges raising lots of dollars.
But for the economics of this to make sense _eventually_, we need to see a much larger % of GPU spend going towards inference.

So let’s talk about inference for a second – how is it different than training?

## Inference workloads are volatile

Let’s say you expect a bunch of users to use your service for inference and you want to get a bunch of GPUs to handle that.
Here’s an interesting problem though:\xA0inference is _volatile_.

Consider a service that gets 1 req/s on average.
The number of requests each minute will be a Poisson process that looks something like this:

![static day](https://modal-cdn.com/cdnbot/static-day.jpg)

Let’s say every request takes 10 sec to handle.
How many GPUs do you need? If you’re running at 100% utilization, then you need exactly 10.
But the noise makes this impossible.
In practice, something like 12-15 GPUs running at 60-75% utilization is the right range for this.
We simply need a bit of padding in order to handle the noise.

## It gets more complicated –\xA0the 24h cycle

Let’s make the model a bit more complex and assume you have a night-and-day cycle.
Now the request rate looks more like this:

![sine wave day](https://modal-cdn.com/cdnbot/sine-wave-day.jpg)

Using fixed capacity for this causes utilization to drop further, because we have to provision for the _peak_ load.
This will push the utilization below 50%.

## It’s actually a lot worse than that!

Let’s add more sources of volatility you might encounter, like

- The 7 day week
- Events you can’t forecast –\xA0a tweet goes viral! someone posts a link to your service on Reddit!
- Trends in your usage (big growth, periods of decline, etc)
- Needs for internal bursty stuff (backfilling etc)

This means in reality your usage volume over a month will look like this:

![dynamic month](https://modal-cdn.com/cdnbot/dynamic-month.jpg)

This looking at it over a month. Seen over a day, it’s super noisy:

![dynamic day](https://modal-cdn.com/cdnbot/dynamic-day.jpg)

How do you pick a number of GPUs now that balance utilization and latency? How do you forecast usage 3 years out based on this? Do you want to tie up a lot of your venture capital dollars in these long-term commitments?

These are hard questions to answer, especially for startups that want to ship cool stuff and not worry so much. It’s not maybe surprising that this is one of the top AI infrastructure concerns among companies in a recent survey:

![gpu scarcity](https://modal-cdn.com/cdnbot/gpu-scarcity.png)

This is from [The State of AI Infrastructure at Scale 2024](https://ai-infrastructure.org/the-state-of-ai-infrastructure-at-scale-2024/) which features many other gems – go check it out.

## Training is also volatile!

I just talked a lot about inference being volatile. But going back to training, training can be volatile too!

Of course, training tends to be much less latency sensitive. But training _demand_ at a company probably varies quite a lot in reality. Sometimes you have lots of demand for very important jobs, sometimes it’s just long shot experimental R&D. Sometimes a developer is actively iterating and would really benefit from getting a 100 extra GPUs for a few hours.

## There’s many other volatile workloads!

The same goes with many other types of things. Batch jobs (including batch inference) for instance. Small training jobs (including fine-tuning) is another example. While inference is inherently volatile and unpredictable, most other workloads also benefit from more flexible GPU consumption.

From our conversations and other people’s experience, the real world utilization of large GPU cluster [is often sub 50%](https://www.photoroom.com/inside-photoroom/so-you-want-to-rent-an-nvidia-h100-cluster-2024-consumer-guide?slug=inside-photoroom/so-you-want-to-rent-an-nvidia-h100-cluster-2024-consumer-guide&_storyblok_published=511470179&)!

## How can GPU providers provide on-demand GPUs?

So far, I’ve presented some arguments for why GPU _demand_ is quite unpredictable and doesn’t fit the long-term-fixed-size-reservation model.
But could GPU _supply_ be flexible?

I think the answer is that it can be, to a much larger extent than today – much like the CPU market where flexible consumption is the default.
Supporting this for GPUs is not an easy thing to build, but there’s a whole range of things we can bet on:

### Demand pooling

Pooling lots of users into the same underlying pool of compute can improve utilization drastically.
It reduces amount of capacity that has to be reserved in aggregate.
Instead of provisioning for the sum of the peaks, you can provision for the peak of the sum. This is a much smaller number!

![pooling](https://modal-cdn.com/cdnbot/pooling.jpg)

The chart above shows a simulation with 5 users. Because their peaks don’t coincide, we can get dramatically better utilization by pooling all their usage.
This requires multi-tenancy, meaning we want to run many different users on the same underlying pool of GPUs.

### Supply pooling

It’s also possible to pool the supply of GPUs to increase the capacity.
There are a few different strategies:

1. Use several regions.
   Many models (like Stable Diffusion) take a second or two to run.
   It’s often possible to send the request halfway across the world and back with minimal impact on latency.
   This is obviously less ideal for latency-sensitive tasks.
2. Pool different GPU types together and fall over between them (and use previous-generation GPUs when possible\xA0–\xA0the ones often left behind by the training crowd)
3. Aggregate several cloud vendors, in particular ones with on-demand GPU availability.

It should be mentioned that Modal uses all of these things and have invested a very substantial amount in resource pool scaling and the “bin packing” of jobs.
We actually solve a mixed-integer programming problem every minute to maximize our cloud utilization.

### Multi-tenancy requires fast scaling

With a multi-tenant pool of compute, and with large variance in demand, it’s critical that we can scale up and down very quickly.
In particular, booting up instances and provisioning them is incredibly slow, especially for inference workloads.
We want to start containers in seconds, not minutes.
This also improves utilization drastically, since hardware is being spent actually crunching numbers, not starting or stopping.

Taking this to its most extreme form, you end up with “serverless” infrastructure.
The idea is to let the users write application code, but let the infrastructure handle the container lifecycle management, request routing, and everything else.
It’s no secret we are hardcore believers of this at Modal!

Fast initialization of models is a hard problem.
A typical workload needs to fire up a Python interpreter with a lot of modules, and load gigabytes of model weights onto the GPU.
Doing this _fast_ (as in, seconds or less) takes a lot of low-level work.
At Modal we built a file-system purpose made for this, and are spending a lot of time on ways to snapshot CPU and GPU memory for fast initialization.

### Demand smoothing

Another option for reducing the variance and improving utilization over time is to shift latency-insensitive demand from periods of high demand to low demand.
You could imagine giving discounts for jobs with high turnaround time, or scaling up training jobs overnight.
We are thinking a lot about these types of features at Modal!

## The future of GPU consumption

To summarize, some trends I expect to be true:

- Future GPU consumption will skew much heavier towards inference vs today
- There will be a much larger market for on-demand GPUs
- A substantial fraction of inference workloads will be powered by on-demand GPUs due to its unpredictable nature
- A meaningful fraction of small and medium size training workloads will shift to on-demand GPUs, because of the flexibility and faster feedback loops
- People will still make long-term GPU reservations to get the lowest possible price. But this will not be the default way to get capacity.

Modal is heavily investing in this.
We’re big believers in a future of flexible GPU consumption and have been working on this for several years.
We let you run big bursty jobs with hundreds of CPU, or deploy GPU-based cloud functions that can scale up and down instantaneously (including to zero).
If you're interested, please [try it out](https://modal.com/signup)!
`,meta:{description:`Why Modal is obsessed with serverless AI infrastructure`}},{title:m,description:h,date:g,length:_,category:v,published:y,layout:b,authors:x,toc:S,rawContent:C,meta:w}=p,T=t(`<p>The last couple of years of Gen AI frenzy have brought us some undeniably cool new products, like Copilot and Suno.
One thing they all have in common is they demand <em>lots</em> of compute –\xA0in particular GPUs.
But the supply of GPUs is constrained.
This supply-demand imbalance has caused the market for cloud GPUs to behave very differently than other cloud markets.</p> <p>Why is that?
What should we do?
And what can we expect going forward?
Should startups keep buying long-term GPU reservations from cloud vendors?
Or will there be other options in the future?</p> <h2 id="how-do-you-make-money-from-ai-models">How do you make money from AI models?</h2> <p>AI is powered by GPUs, and most of the GPU demand today goes towards training large generative models.</p> <p>But training is a cost center and eventually you need to recoup that cost through real revenue.
How do you do that?
Enter inference – the less sexy but money-making sibling of training.</p> <p>So why is most GPU demand driven by training even though inference is where you make the money?
I think a lot of it reflects where we are in the cycle –\xA0there’s an <em>expectation</em> that the revenue potential for inference is big, but in order to get this, you have to spend a lot of money on training.</p> <p>The economics of this –\xA0high upfront capital, but large potential – is something VCs understand quite well, so I think this explains why model builders have had no challenges raising lots of dollars.
But for the economics of this to make sense <em>eventually</em>, we need to see a much larger % of GPU spend going towards inference.</p> <p>So let’s talk about inference for a second – how is it different than training?</p> <h2 id="inference-workloads-are-volatile">Inference workloads are volatile</h2> <p>Let’s say you expect a bunch of users to use your service for inference and you want to get a bunch of GPUs to handle that.
Here’s an interesting problem though:\xA0inference is <em>volatile</em>.</p> <p>Consider a service that gets 1 req/s on average.
The number of requests each minute will be a Poisson process that looks something like this:</p> <p><!></p> <p>Let’s say every request takes 10 sec to handle.
How many GPUs do you need? If you’re running at 100% utilization, then you need exactly 10.
But the noise makes this impossible.
In practice, something like 12-15 GPUs running at 60-75% utilization is the right range for this.
We simply need a bit of padding in order to handle the noise.</p> <h2 id="it-gets-more-complicated-the-24h-cycle">It gets more complicated –\xA0the 24h cycle</h2> <p>Let’s make the model a bit more complex and assume you have a night-and-day cycle.
Now the request rate looks more like this:</p> <p><!></p> <p>Using fixed capacity for this causes utilization to drop further, because we have to provision for the <em>peak</em> load.
This will push the utilization below 50%.</p> <h2 id="its-actually-a-lot-worse-than-that">It’s actually a lot worse than that!</h2> <p>Let’s add more sources of volatility you might encounter, like</p> <ul><li>The 7 day week</li> <li>Events you can’t forecast –\xA0a tweet goes viral! someone posts a link to your service on Reddit!</li> <li>Trends in your usage (big growth, periods of decline, etc)</li> <li>Needs for internal bursty stuff (backfilling etc)</li></ul> <p>This means in reality your usage volume over a month will look like this:</p> <p><!></p> <p>This looking at it over a month. Seen over a day, it’s super noisy:</p> <p><!></p> <p>How do you pick a number of GPUs now that balance utilization and latency? How do you forecast usage 3 years out based on this? Do you want to tie up a lot of your venture capital dollars in these long-term commitments?</p> <p>These are hard questions to answer, especially for startups that want to ship cool stuff and not worry so much. It’s not maybe surprising that this is one of the top AI infrastructure concerns among companies in a recent survey:</p> <p><!></p> <p>This is from <!> which features many other gems – go check it out.</p> <h2 id="training-is-also-volatile">Training is also volatile!</h2> <p>I just talked a lot about inference being volatile. But going back to training, training can be volatile too!</p> <p>Of course, training tends to be much less latency sensitive. But training <em>demand</em> at a company probably varies quite a lot in reality. Sometimes you have lots of demand for very important jobs, sometimes it’s just long shot experimental R&D. Sometimes a developer is actively iterating and would really benefit from getting a 100 extra GPUs for a few hours.</p> <h2 id="theres-many-other-volatile-workloads">There’s many other volatile workloads!</h2> <p>The same goes with many other types of things. Batch jobs (including batch inference) for instance. Small training jobs (including fine-tuning) is another example. While inference is inherently volatile and unpredictable, most other workloads also benefit from more flexible GPU consumption.</p> <p>From our conversations and other people’s experience, the real world utilization of large GPU cluster <!>!</p> <h2 id="how-can-gpu-providers-provide-on-demand-gpus">How can GPU providers provide on-demand GPUs?</h2> <p>So far, I’ve presented some arguments for why GPU <em>demand</em> is quite unpredictable and doesn’t fit the long-term-fixed-size-reservation model.
But could GPU <em>supply</em> be flexible?</p> <p>I think the answer is that it can be, to a much larger extent than today – much like the CPU market where flexible consumption is the default.
Supporting this for GPUs is not an easy thing to build, but there’s a whole range of things we can bet on:</p> <h3 id="demand-pooling">Demand pooling</h3> <p>Pooling lots of users into the same underlying pool of compute can improve utilization drastically.
It reduces amount of capacity that has to be reserved in aggregate.
Instead of provisioning for the sum of the peaks, you can provision for the peak of the sum. This is a much smaller number!</p> <p><!></p> <p>The chart above shows a simulation with 5 users. Because their peaks don’t coincide, we can get dramatically better utilization by pooling all their usage.
This requires multi-tenancy, meaning we want to run many different users on the same underlying pool of GPUs.</p> <h3 id="supply-pooling">Supply pooling</h3> <p>It’s also possible to pool the supply of GPUs to increase the capacity.
There are a few different strategies:</p> <ol><li>Use several regions.
Many models (like Stable Diffusion) take a second or two to run.
It’s often possible to send the request halfway across the world and back with minimal impact on latency.
This is obviously less ideal for latency-sensitive tasks.</li> <li>Pool different GPU types together and fall over between them (and use previous-generation GPUs when possible\xA0–\xA0the ones often left behind by the training crowd)</li> <li>Aggregate several cloud vendors, in particular ones with on-demand GPU availability.</li></ol> <p>It should be mentioned that Modal uses all of these things and have invested a very substantial amount in resource pool scaling and the “bin packing” of jobs.
We actually solve a mixed-integer programming problem every minute to maximize our cloud utilization.</p> <h3 id="multi-tenancy-requires-fast-scaling">Multi-tenancy requires fast scaling</h3> <p>With a multi-tenant pool of compute, and with large variance in demand, it’s critical that we can scale up and down very quickly.
In particular, booting up instances and provisioning them is incredibly slow, especially for inference workloads.
We want to start containers in seconds, not minutes.
This also improves utilization drastically, since hardware is being spent actually crunching numbers, not starting or stopping.</p> <p>Taking this to its most extreme form, you end up with “serverless” infrastructure.
The idea is to let the users write application code, but let the infrastructure handle the container lifecycle management, request routing, and everything else.
It’s no secret we are hardcore believers of this at Modal!</p> <p>Fast initialization of models is a hard problem.
A typical workload needs to fire up a Python interpreter with a lot of modules, and load gigabytes of model weights onto the GPU.
Doing this <em>fast</em> (as in, seconds or less) takes a lot of low-level work.
At Modal we built a file-system purpose made for this, and are spending a lot of time on ways to snapshot CPU and GPU memory for fast initialization.</p> <h3 id="demand-smoothing">Demand smoothing</h3> <p>Another option for reducing the variance and improving utilization over time is to shift latency-insensitive demand from periods of high demand to low demand.
You could imagine giving discounts for jobs with high turnaround time, or scaling up training jobs overnight.
We are thinking a lot about these types of features at Modal!</p> <h2 id="the-future-of-gpu-consumption">The future of GPU consumption</h2> <p>To summarize, some trends I expect to be true:</p> <ul><li>Future GPU consumption will skew much heavier towards inference vs today</li> <li>There will be a much larger market for on-demand GPUs</li> <li>A substantial fraction of inference workloads will be powered by on-demand GPUs due to its unpredictable nature</li> <li>A meaningful fraction of small and medium size training workloads will shift to on-demand GPUs, because of the flexibility and faster feedback loops</li> <li>People will still make long-term GPU reservations to get the lowest possible price. But this will not be the default way to get capacity.</li></ul> <p>Modal is heavily investing in this.
We’re big believers in a future of flexible GPU consumption and have been working on this for several years.
We let you run big bursty jobs with hundreds of CPU, or deploy GPU-based cloud functions that can scale up and down instantaneously (including to zero).
If you’re interested, please <!>!</p>`,1);function E(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=T(),f=c(s(o),22);u(e(f),{src:`https://modal-cdn.com/cdnbot/static-day.jpg`,alt:`static day`}),n(f);var p=c(f,8);u(e(p),{src:`https://modal-cdn.com/cdnbot/sine-wave-day.jpg`,alt:`sine wave day`}),n(p);var m=c(p,12);u(e(m),{src:`https://modal-cdn.com/cdnbot/dynamic-month.jpg`,alt:`dynamic month`}),n(m);var h=c(m,4);u(e(h),{src:`https://modal-cdn.com/cdnbot/dynamic-day.jpg`,alt:`dynamic day`}),n(h);var g=c(h,6);u(e(g),{src:`https://modal-cdn.com/cdnbot/gpu-scarcity.png`,alt:`gpu scarcity`}),n(g);var _=c(g,2);d(c(e(_)),{href:`https://ai-infrastructure.org/the-state-of-ai-infrastructure-at-scale-2024/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`The State of AI Infrastructure at Scale 2024`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,12);d(c(e(v)),{href:`https://www.photoroom.com/inside-photoroom/so-you-want-to-rent-an-nvidia-h100-cluster-2024-consumer-guide?slug=inside-photoroom/so-you-want-to-rent-an-nvidia-h100-cluster-2024-consumer-guide&_storyblok_published=511470179&`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`is often sub 50%`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,12);u(e(y),{src:`https://modal-cdn.com/cdnbot/pooling.jpg`,alt:`pooling`}),n(y);var b=c(y,30);d(c(e(b)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`try it out`))},$$slots:{default:!0}}),l(),n(b),i(t,o)},$$slots:{default:!0}}))}export{E as default,p as metadata};
//# sourceMappingURL=DNQMZcb_.js.map
