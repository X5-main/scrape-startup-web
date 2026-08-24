(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b74c4114-c08c-4651-8a59-2bb66833404e`,e._sentryDebugIdIdentifier=`sentry-dbid-b74c4114-c08c-4651-8a59-2bb66833404e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./Dz6DfB4R.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`How Suno shaved 4 months off their launch timeline with Modal`,description:`Find out how Suno uses Modal to scale inference and batch pre-processing to thousands of GPUs.`,date:`2024-02-21T12:00:00.000Z`,length:`3 minute read`,category:`Customer Stories`,published:!0,layout:`blog`,toc:[{depth:1,value:`About Suno`,id:`about-suno`,children:[{depth:2,value:`Avoiding past infrastructure pain`,id:`avoiding-past-infrastructure-pain`},{depth:2,value:`An easy setup`,id:`an-easy-setup`},{depth:2,value:`(Auto)scaling to 1000 GPUs`,id:`autoscaling-to-1000-gpus`}]}],rawContent:`![Suno logo](https://modal-cdn.com/cdnbot/suno-headerdkjin7qt_49c562b1.webp)

[Suno](https://www.suno.ai/) uses Modal to scale inference and batch
pre-processing to thousands of GPUs. With Modal, Suno was able to bring a
state-of-the-art music generation model to market four months early instead of
hiring a team of engineers to build and maintain infrastructure.

# About Suno

Suno is a music generation app that can make any song you describe. Enter a
simple text description—like “a deep house song about serverless infra”—and Suno
makes you a song complete with vocals in seconds. Suno’s users include
Grammy-winning artists, but the core user base is people experiencing making
music for the first time. Microsoft recently
[announced](https://blogs.bing.com/search/december-2023/Turn-your-ideas-into-songs-with-Suno-on-Microsoft)
they’ve partnered with Suno to bring song generation capabilities to Copilot,
their AI chatbot!

## Avoiding past infrastructure pain

Prior to starting Suno, all four founders worked at Kensho, an AI tech startup
for financial data. They had personally spent significant amounts of time
setting up and managing Kubernetes clusters to support their data-heavy
workloads—so when they started working on Suno, they knew exactly what they did
not want:

- They did not want to manage their own clusters. They knew this would only
  become more complex over time in order to handle scaling, redundancy, and load
  balancing.
- They did not want to divert engineering resources and delay time-to-market in
  a rapidly evolving industry.
- They did not want to commit to 3-year-long GPU reservations to secure
  reasonable prices.

Georg, co-founder and CTO of Suno, gave Modal a try after a friend’s
recommendation. He was intrigued by how easy it was to deploy code in the cloud.

## An easy setup

Suno began by running their batch pre-processing on Modal, allowing Modal to
dynamically manage the compute needed by these workflows. Not a single config
file was used—all they needed was a few short Python scripts running in Modal:

<Quote authorName="Georg Kucsko" authorTitle="Co-founder and CTO, Suno">
    <span>
        Modal reminded me of the difference between PyTorch and TensorFlow, where
        Torch catered more to the ML crowd and was okay deviating from some CS
        principles. That’s the beauty of Modal. You don’t have to understand much
        about containers; all you need to know is that you can scale your function
        calls in the cloud with a few lines of Python.
    </span>
</Quote>

Suno then expanded their use of Modal to model deployment. As a general purpose
platform, Modal offered many features that Suno could leverage, like the ability
to:

- Expose functions directly to HTTP traffic
- Chain together inputs and outputs of inference functions to create end-to-end
  sequences across multiple models and containers

…all defined programmatically in Python.

The Modal team worked closely with Suno as they transitioned from prototypes to
production. Georg remarked, “It's almost like we're on the same team; us
flagging something and you guys immediately working on it is awesome.”

## (Auto)scaling to 1000 GPUs

![Suno GPU usage chart](https://modal-cdn.com/cdnbot/suno-bar-graph50ir9ze9_70e0512f.webp)

<modal-img-caption>
  Suno’s GPU usage on Modal is variable and peaks on holidays
</modal-img-caption>

As Suno’s popularity grew, the feature they found most valuable was Modal’s
ability to auto-scale up or down thousands of GPUs to efficiently match demand.
During holidays like Christmas and Valentine’s Day, request volume would shoot
up as users created more songs to share with friends and family.

<Quote authorName="Georg Kucsko">
    <span>
        What kills you is this peak demand, right? Like you just can’t afford to be
        buying machines for steady demand and then also have two people for
        six months do nothing other than building inference that can handle scaling
        down and up from that.
    </span>
</Quote>

Aside from saving developer time, Suno also did not need to commit financially
to a large amount of GPUs, with the challenges that this typically
entails—either low utilization or a degraded user experience.

Modal looks forward to supporting Suno as their compute needs grow!

_p.s. check out this theme song we made with Suno!_

<YoutubeEmbed videoId="IjRyWMwEXHs" />
`,meta:{title:`About Suno`,description:`Find out how Suno uses Modal to scale inference and batch pre-processing to thousands of GPUs.`}},{title:g,description:_,date:v,length:y,category:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=h,E=t(`<span>Modal reminded me of the difference between PyTorch and TensorFlow, where
        Torch catered more to the ML crowd and was okay deviating from some CS
        principles. That’s the beauty of Modal. You don’t have to understand much
        about containers; all you need to know is that you can scale your function
        calls in the cloud with a few lines of Python.</span>`),D=t(`<span>What kills you is this peak demand, right? Like you just can’t afford to be
        buying machines for steady demand and then also have two people for
        six months do nothing other than building inference that can handle scaling
        down and up from that.</span>`),O=t(`<p><!></p> <p><!> uses Modal to scale inference and batch
pre-processing to thousands of GPUs. With Modal, Suno was able to bring a
state-of-the-art music generation model to market four months early instead of
hiring a team of engineers to build and maintain infrastructure.</p> <h1 id="about-suno">About Suno</h1> <p>Suno is a music generation app that can make any song you describe. Enter a
simple text description—like “a deep house song about serverless infra”—and Suno
makes you a song complete with vocals in seconds. Suno’s users include
Grammy-winning artists, but the core user base is people experiencing making
music for the first time. Microsoft recently <!> they’ve partnered with Suno to bring song generation capabilities to Copilot,
their AI chatbot!</p> <h2 id="avoiding-past-infrastructure-pain">Avoiding past infrastructure pain</h2> <p>Prior to starting Suno, all four founders worked at Kensho, an AI tech startup
for financial data. They had personally spent significant amounts of time
setting up and managing Kubernetes clusters to support their data-heavy
workloads—so when they started working on Suno, they knew exactly what they did
not want:</p> <ul><li>They did not want to manage their own clusters. They knew this would only
become more complex over time in order to handle scaling, redundancy, and load
balancing.</li> <li>They did not want to divert engineering resources and delay time-to-market in
a rapidly evolving industry.</li> <li>They did not want to commit to 3-year-long GPU reservations to secure
reasonable prices.</li></ul> <p>Georg, co-founder and CTO of Suno, gave Modal a try after a friend’s
recommendation. He was intrigued by how easy it was to deploy code in the cloud.</p> <h2 id="an-easy-setup">An easy setup</h2> <p>Suno began by running their batch pre-processing on Modal, allowing Modal to
dynamically manage the compute needed by these workflows. Not a single config
file was used—all they needed was a few short Python scripts running in Modal:</p> <!> <p>Suno then expanded their use of Modal to model deployment. As a general purpose
platform, Modal offered many features that Suno could leverage, like the ability
to:</p> <ul><li>Expose functions directly to HTTP traffic</li> <li>Chain together inputs and outputs of inference functions to create end-to-end
sequences across multiple models and containers</li></ul> <p>…all defined programmatically in Python.</p> <p>The Modal team worked closely with Suno as they transitioned from prototypes to
production. Georg remarked, “It’s almost like we’re on the same team; us
flagging something and you guys immediately working on it is awesome.”</p> <h2 id="autoscaling-to-1000-gpus">(Auto)scaling to 1000 GPUs</h2> <p><!></p> <modal-img-caption>Suno’s GPU usage on Modal is variable and peaks on holidays</modal-img-caption> <p>As Suno’s popularity grew, the feature they found most valuable was Modal’s
ability to auto-scale up or down thousands of GPUs to efficiently match demand.
During holidays like Christmas and Valentine’s Day, request volume would shoot
up as users created more songs to share with friends and family.</p> <!> <p>Aside from saving developer time, Suno also did not need to commit financially
to a large amount of GPUs, with the challenges that this typically
entails—either low utilization or a degraded user experience.</p> <p>Modal looks forward to supporting Suno as their compute needs grow!</p> <p><em>p.s. check out this theme song we made with Suno!</em></p> <!>`,3);function k(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=O(),m=s(o);d(e(m),{src:`https://modal-cdn.com/cdnbot/suno-headerdkjin7qt_49c562b1.webp`,alt:`Suno logo`}),n(m);var h=c(m,2);p(e(h),{href:`https://www.suno.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Suno`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);p(c(e(g)),{href:`https://blogs.bing.com/search/december-2023/Turn-your-ideas-into-songs-with-Suno-on-Microsoft`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`announced`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,14);u(_,{authorName:`Georg Kucsko`,authorTitle:`Co-founder and CTO, Suno`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var v=c(_,12);d(e(v),{src:`https://modal-cdn.com/cdnbot/suno-bar-graph50ir9ze9_70e0512f.webp`,alt:`Suno GPU usage chart`}),n(v);var y=c(c(v,2),4);u(y,{authorName:`Georg Kucsko`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),f(c(y,8),{videoId:`IjRyWMwEXHs`}),i(t,o)},$$slots:{default:!0}}))}export{k as default,h as metadata};
//# sourceMappingURL=Cu67-_E0.js.map
