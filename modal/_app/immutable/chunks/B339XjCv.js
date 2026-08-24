(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`edf0f8f1-aa5f-4a91-b8bf-22b26a433654`,e._sentryDebugIdIdentifier=`sentry-dbid-edf0f8f1-aa5f-4a91-b8bf-22b26a433654`)}catch{}})();import{$t as e,H as t,St as n,Tn as r,Tt as i,bt as a,c as o,d as s,en as c,qt as l,tn as u,wn as d}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h=`/_app/immutable/assets/modal-producthero.BiDWej4H.jpg`,g=`/_app/immutable/assets/redpoint.C1IHsCU-.svg`,_=`/_app/immutable/assets/modal-demo.Bpom9oFG.mp4`,v={title:`Modal is now generally available`,description:`Modal offically launches today with no waitlist. And we also raised a Series A!`,date:`2023-10-10T12:01:00.000Z`,length:`6 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`Why did we start building Modal?`,id:`why-did-we-start-building-modal`},{depth:2,value:`So, what is Modal?`,id:`so-what-is-modal`},{depth:2,value:`Get started now!`,id:`get-started-now`},{depth:2,value:`How are people using Modal?`,id:`how-are-people-using-modal`},{depth:2,value:`What’s next?`,id:`whats-next`}],rawContent:`We started working on Modal in 2021 with the idea that we should make it easier
for data teams to run things in the cloud. After more than two years of deep
hacking, we are super excited to announce that **Modal is now generally
available**, meaning anyone can sign up and get started running code in the
cloud in a few minutes!

And we also have another announcement to make &mdash; keep reading!

## Why did we start building Modal?

Infrastructure support has often been lagging for teams working with with data,
ML, AI, and analytics, and in 2020 we saw a need for a different stack targeting
those use cases. This comes from our own experience managing data teams in
different organizations, and building data infrastructure.

ML and data teams struggled with things as basic as running code in the cloud.
Any time an engineer wanted to ship an inference endpoint, build a job queue or
even deploy a simple batch job that ran every hour, they had to spend more hours
wrangling YAML than writing the actual code.

We wanted Modal to deliver an amazing developer experience. Thinking about what
this means &mdash; in particular the fast feedback loops we wanted &mdash; it
was clear pretty early that this would be a long journey deep into the
underworld. How do you take code from a user’s computer, stick it in a
container, and launch it in the cloud within a couple of _seconds_?

Once we looked into this, we realized we would have to build almost all of it
ourselves &mdash;so we started hacking on low-level things like building our own
file system, despite most people telling us we were crazy. But a few years
later, it’s very clear it’s worth it for the experience it enables.

We slowly started adding users in 2022, initially just people we knew, but later
in the year we opened up with a waitlist and have been inviting people off the
waitlist ever since. Today, we’re excited to announce that Modal’s account
registration is open to anyone, with immediate access to the service.

<video controls autoplay loop muted playsinline>
  <source src="../assets/blog/modal-demo.mp4" type="video/mp4">
</video>

## So, what is Modal?

Modal is a cloud function platform that lets you:

- Write Python code and execute it in the cloud in seconds
- Deploy autoscaling inference endpoints
  [on GPUs](https://modal.com/docs/guide/gpu) (A100s, A10Gs, T4s, L4s, H100s)
- Run large-scale batch jobs on thousands of containers
- Turn your function into a [cron job](https://modal.com/docs/guide/cron), or
  serve it as an [web endpoint](https://modal.com/docs/guide/webhooks), with one
  line of code
- Define images, hardware and persistent storage intuitively in Python

You get full [serverless execution and pricing](https://modal.com/pricing),
because we host everything and charge per second of usage. Notably, there’s zero
configuration in Modal - everything is code. Take a breath of fresh air and feel
how good it tastes with no YAML in it.

## Get started now!

To get started with Modal, just install the Python client library and make an
account:

- \`pip install modal\`
- \`python3 -m modal setup\`

You're then ready to run code in the cloud. Head over to our examples page to
get an idea of some of the things you can build! For instance:

- [Slack bot that lets you create bots imitating users](https://modal.com/docs/examples/llm-finetuning)
- [Discord bot that generates music](https://github.com/modal-labs/boombot)
- [Parallelized podcast transcription using Whisper](https://modal.com/docs/examples/whisper-transcriber)

![screenshot](../assets/blog/modal-producthero.jpg)

## How are people using Modal?

Today, there is a long list of users running Modal in production, some at very
large scale. We power use cases ranging from generative AI, computational
biotech, code execution, and much more.

[Ramp](https://ramp.com), a large provider of expense management and financial
tools:

> Ramp uses Modal to run some of our most data-intensive projects. Our team
> loves the developer experience because it allows them to be more productive
> and move faster. Without Modal, these projects would have been impossible for
> us to launch. Modal's user-friendly interface and efficient tools have truly
> empowered our team to navigate data-intensive tasks with ease, enabling us to
> achieve our project goals more efficiently.
>
> &mdash; Karim Atiyeh, CTO, Ramp

[Substack](https://substack.com), the subscription network for independent
writers and creators:

> Substack recently launched a feature for AI-powered audio transcriptions. The
> data team picked Modal because it makes it easy to write code that runs on
> 100s of GPUs in parallel, transcribing podcasts in a fraction of the time.
>
> &mdash; Mike Cohen, Head of Data, Substack

Some of the most exciting use cases of Modal are in generative AI, where it
powers image and music generation at scale:

> [Suno](https://www.suno.ai) has developed proprietary state-of-the-art models
> that generate music and speech using AI. We chose Modal as our infrastructure
> provider for inference and parallel data processing. Modal's superb developer
> experience enables our team to ship new models to production quickly, and with
> confidence we'll scale to thousands of simultaneous users.
>
> &mdash; Georg Kucsko, CTO & Co-Founder, Suno

Modal has also found use in life sciences and biotech applications:

> [Sphinx](https://www.sphinxbio.com) has been using Modal to run protein
> folding models on behalf of drug discoverers and scientific researchers. Modal
> lets us scale up and run large-scale batch jobs in a few lines of code, and it
> completely removes the need to think about infrastructure.
>
> &mdash; Nicholas Larus-Stone, Founder, Sphinx Bio

![redpoint](../assets/blog/redpoint.svg)

## What’s next?

We are super excited to share what we’ve been working on with the world and will
keep working on making the platform better. There is a long list of features
that we’re excited about, like writing Modal code in other languages, and
capabilities higher up in the data stack.

In order to build all the cool stuff we want to build, we have another
announcement. We just **raised a $16M Series A lead by
[Redpoint Ventures](https://www.redpoint.com/)**. We are super psyched to work
with the Redpoint team together with
[Amplify Partners](http://amplifypartners.com), who led our seed round.

We also have a long list of new and existing angel investors including people
such as Simon Eskildsen, Jessie Frazelle, Elad Gil, Jeff Hammerbacher, Hamel
Husain, Tristan Handy, Tejas Manohar, Boris Jabes, Iqram Magdon-Ismail, Barry
McCardel, Barr Moses, Arjun Narayan, Neha Narkhede, Lindsay Pettingill, Allison
Pickens, Christopher Ré, Julia Schottenstein, Benn Stancil, Jordan Tigani, Ry
Walker, and Josh Wills.

Modal is planning to use the capital to accelerate our product development
roadmap. We think there has never been a better time to rebuild a lot of data
infrastructure, but it’s an incredibly big project and we’re just getting
started.

To stay in touch, [follow us on Twitter](https://x.com/modal), or
[on LinkedIn](https://www.linkedin.com/company/modal-labs/).

If you want to get started, go ahead and [sign up](https://modal.com/signup). Or
simply just install the Modal Python package and get started:

- \`pip install modal\`
- \`python3 -m modal setup\`

Happy hacking!
`,meta:{description:`Modal offically launches today with no waitlist. And we also raised a Series A!`}},{title:y,description:b,date:x,length:S,category:C,published:w,layout:T,toc:E,rawContent:D,meta:O}=v,k=n(`<p>We started working on Modal in 2021 with the idea that we should make it easier
for data teams to run things in the cloud. After more than two years of deep
hacking, we are super excited to announce that <strong>Modal is now generally
available</strong>, meaning anyone can sign up and get started running code in the
cloud in a few minutes!</p> <p>And we also have another announcement to make — keep reading!</p> <h2 id="why-did-we-start-building-modal">Why did we start building Modal?</h2> <p>Infrastructure support has often been lagging for teams working with with data,
ML, AI, and analytics, and in 2020 we saw a need for a different stack targeting
those use cases. This comes from our own experience managing data teams in
different organizations, and building data infrastructure.</p> <p>ML and data teams struggled with things as basic as running code in the cloud.
Any time an engineer wanted to ship an inference endpoint, build a job queue or
even deploy a simple batch job that ran every hour, they had to spend more hours
wrangling YAML than writing the actual code.</p> <p>We wanted Modal to deliver an amazing developer experience. Thinking about what
this means — in particular the fast feedback loops we wanted — it
was clear pretty early that this would be a long journey deep into the
underworld. How do you take code from a user’s computer, stick it in a
container, and launch it in the cloud within a couple of <em>seconds</em>?</p> <p>Once we looked into this, we realized we would have to build almost all of it
ourselves —so we started hacking on low-level things like building our own
file system, despite most people telling us we were crazy. But a few years
later, it’s very clear it’s worth it for the experience it enables.</p> <p>We slowly started adding users in 2022, initially just people we knew, but later
in the year we opened up with a waitlist and have been inviting people off the
waitlist ever since. Today, we’re excited to announce that Modal’s account
registration is open to anyone, with immediate access to the service.</p> <video controls autoplay loop playsinline=""><source type="video/mp4"/></video> <h2 id="so-what-is-modal">So, what is Modal?</h2> <p>Modal is a cloud function platform that lets you:</p> <ul><li>Write Python code and execute it in the cloud in seconds</li> <li>Deploy autoscaling inference endpoints <!> (A100s, A10Gs, T4s, L4s, H100s)</li> <li>Run large-scale batch jobs on thousands of containers</li> <li>Turn your function into a <!>, or
serve it as an <!>, with one
line of code</li> <li>Define images, hardware and persistent storage intuitively in Python</li></ul> <p>You get full <!>,
because we host everything and charge per second of usage. Notably, there’s zero
configuration in Modal - everything is code. Take a breath of fresh air and feel
how good it tastes with no YAML in it.</p> <h2 id="get-started-now">Get started now!</h2> <p>To get started with Modal, just install the Python client library and make an
account:</p> <ul><li><code>pip install modal</code></li> <li><code>python3 -m modal setup</code></li></ul> <p>You’re then ready to run code in the cloud. Head over to our examples page to
get an idea of some of the things you can build! For instance:</p> <ul><li><!></li> <li><!></li> <li><!></li></ul> <p><!></p> <h2 id="how-are-people-using-modal">How are people using Modal?</h2> <p>Today, there is a long list of users running Modal in production, some at very
large scale. We power use cases ranging from generative AI, computational
biotech, code execution, and much more.</p> <p><!>, a large provider of expense management and financial
tools:</p> <blockquote><p>Ramp uses Modal to run some of our most data-intensive projects. Our team
loves the developer experience because it allows them to be more productive
and move faster. Without Modal, these projects would have been impossible for
us to launch. Modal’s user-friendly interface and efficient tools have truly
empowered our team to navigate data-intensive tasks with ease, enabling us to
achieve our project goals more efficiently.</p> <p>— Karim Atiyeh, CTO, Ramp</p></blockquote> <p><!>, the subscription network for independent
writers and creators:</p> <blockquote><p>Substack recently launched a feature for AI-powered audio transcriptions. The
data team picked Modal because it makes it easy to write code that runs on
100s of GPUs in parallel, transcribing podcasts in a fraction of the time.</p> <p>— Mike Cohen, Head of Data, Substack</p></blockquote> <p>Some of the most exciting use cases of Modal are in generative AI, where it
powers image and music generation at scale:</p> <blockquote><p><!> has developed proprietary state-of-the-art models
that generate music and speech using AI. We chose Modal as our infrastructure
provider for inference and parallel data processing. Modal’s superb developer
experience enables our team to ship new models to production quickly, and with
confidence we’ll scale to thousands of simultaneous users.</p> <p>— Georg Kucsko, CTO & Co-Founder, Suno</p></blockquote> <p>Modal has also found use in life sciences and biotech applications:</p> <blockquote><p><!> has been using Modal to run protein
folding models on behalf of drug discoverers and scientific researchers. Modal
lets us scale up and run large-scale batch jobs in a few lines of code, and it
completely removes the need to think about infrastructure.</p> <p>— Nicholas Larus-Stone, Founder, Sphinx Bio</p></blockquote> <p><!></p> <h2 id="whats-next">What’s next?</h2> <p>We are super excited to share what we’ve been working on with the world and will
keep working on making the platform better. There is a long list of features
that we’re excited about, like writing Modal code in other languages, and
capabilities higher up in the data stack.</p> <p>In order to build all the cool stuff we want to build, we have another
announcement. We just <strong>raised a $16M Series A lead by <!></strong>. We are super psyched to work
with the Redpoint team together with <!>, who led our seed round.</p> <p>We also have a long list of new and existing angel investors including people
such as Simon Eskildsen, Jessie Frazelle, Elad Gil, Jeff Hammerbacher, Hamel
Husain, Tristan Handy, Tejas Manohar, Boris Jabes, Iqram Magdon-Ismail, Barry
McCardel, Barr Moses, Arjun Narayan, Neha Narkhede, Lindsay Pettingill, Allison
Pickens, Christopher Ré, Julia Schottenstein, Benn Stancil, Jordan Tigani, Ry
Walker, and Josh Wills.</p> <p>Modal is planning to use the capital to accelerate our product development
roadmap. We think there has never been a better time to rebuild a lot of data
infrastructure, but it’s an incredibly big project and we’re just getting
started.</p> <p>To stay in touch, <!>, or <!>.</p> <p>If you want to get started, go ahead and <!>. Or
simply just install the Modal Python package and get started:</p> <ul><li><code>pip install modal</code></li> <li><code>python3 -m modal setup</code></li></ul> <p>Happy hacking!</p>`,3);function A(n,y){let b=o(y,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(n,s(()=>b,()=>v,{children:(n,o)=>{var s=k(),m=u(c(s),16);m.muted=!0;var v=e(m);r(m);var y=u(m,6),b=u(e(y),2);p(u(e(b)),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`on GPUs`))},$$slots:{default:!0}}),d(),r(b);var x=u(b,4),S=u(e(x));p(S,{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`cron job`))},$$slots:{default:!0}}),p(u(S,2),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`web endpoint`))},$$slots:{default:!0}}),d(),r(x),d(2),r(y);var C=u(y,2);p(u(e(C)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`serverless execution and pricing`))},$$slots:{default:!0}}),d(),r(C);var w=u(C,10),T=e(w);p(e(T),{href:`https://modal.com/docs/examples/llm-finetuning`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Slack bot that lets you create bots imitating users`))},$$slots:{default:!0}}),r(T);var E=u(T,2);p(e(E),{href:`https://github.com/modal-labs/boombot`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Discord bot that generates music`))},$$slots:{default:!0}}),r(E);var D=u(E,2);p(e(D),{href:`https://modal.com/docs/examples/whisper-transcriber`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Parallelized podcast transcription using Whisper`))},$$slots:{default:!0}}),r(D),r(w);var O=u(w,2);f(e(O),{get src(){return h},alt:`screenshot`}),r(O);var A=u(O,6);p(e(A),{href:`https://ramp.com`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Ramp`))},$$slots:{default:!0}}),d(),r(A);var j=u(A,4);p(e(j),{href:`https://substack.com`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Substack`))},$$slots:{default:!0}}),d(),r(j);var M=u(j,6),N=e(M);p(e(N),{href:`https://www.suno.ai`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Suno`))},$$slots:{default:!0}}),d(),r(N),d(2),r(M);var P=u(M,4),F=e(P);p(e(F),{href:`https://www.sphinxbio.com`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Sphinx`))},$$slots:{default:!0}}),d(),r(F),d(2),r(P);var I=u(P,2);f(e(I),{get src(){return g},alt:`redpoint`}),r(I);var L=u(I,6),R=u(e(L));p(u(e(R)),{href:`https://www.redpoint.com/`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Redpoint Ventures`))},$$slots:{default:!0}}),r(R),p(u(R,2),{href:`http://amplifypartners.com`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`Amplify Partners`))},$$slots:{default:!0}}),d(),r(L);var z=u(L,6),B=u(e(z));p(B,{href:`https://x.com/modal`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`follow us on Twitter`))},$$slots:{default:!0}}),p(u(B,2),{href:`https://www.linkedin.com/company/modal-labs/`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`on LinkedIn`))},$$slots:{default:!0}}),d(),r(z);var V=u(z,2);p(u(e(V)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{d(),a(e,i(`sign up`))},$$slots:{default:!0}}),d(),r(V),d(4),l(()=>t(v,`src`,_)),a(n,s)},$$slots:{default:!0}}))}export{A as default,v as metadata};
//# sourceMappingURL=B339XjCv.js.map
