(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c2dd3787-a25b-4b59-91e0-3b43db2b9c73`,e._sentryDebugIdIdentifier=`sentry-dbid-c2dd3787-a25b-4b59-91e0-3b43db2b9c73`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: Price drops, brand refresh, and image-to-video example`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2025-03-17T12:00:00.000Z`,published:!0,length:`5 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🔻 We dropped our GPU, CPU, and memory prices by up to 65%`,id:`-we-dropped-our-gpu-cpu-and-memory-prices-by-up-to-65`},{depth:2,value:`📦 Modal SDK now available on conda-forge`,id:`-modal-sdk-now-available-on-conda-forge`},{depth:2,value:`👩‍💻 Client updates`,id:`-client-updates`},{depth:2,value:`📽️ New image-to-video example`,id:`️-new-image-to-video-example`},{depth:2,value:`⛽️ Blog post: How to maximize GPU utilization`,id:`️-blog-post-how-to-maximize-gpu-utilization`},{depth:2,value:`🖊️ More from our blog`,id:`️-more-from-our-blog`},{depth:2,value:`🍭 Fun tidbits`,id:`-fun-tidbits`}],rawContent:`## 🔻 We dropped our GPU, CPU, and memory prices by up to 65%

![](https://modal-cdn.com/cdnbot/pricing-drop-imagewbgj9bs7_2f5f0510.webp)

p.s. You can also spike up to 50 GPUs concurrently on the Team plan now!

## 📦 Modal SDK now available on \`conda-forge\`

By popular demand from the scientific computing community, the Modal SDK is now available on \`conda-forge\` starting with version \`0.73.46\`. You can install it with:

\`\`\`
conda install -c conda-forge modal-client
\`\`\`

## 👩‍💻 Client updates

- We're planning to release version 1.0 of the Modal client soon, and we're working hard to address pain points and common sources of confusion in the SDK. When you update your client, you'll likely see some deprecation warnings. We've put together a [Migration Guide](https://modal.com/docs/guide/modal-1-0-migration) to highlight the major changes and provide advice about how to update your application code.
- We took the \`_experimental\` out of \`_experimental_buffer_containers\`! Add \`buffer_containers=N\` to your decorators and we'll keep an extra "buffer" of containers around while your Functions are running, ready for when more inputs show up. See the [docs](https://modal.com/docs/guide/cold-start#overprovision-resources-with-min_containers-and-buffer_containers) for details.

## 📽️ New image-to-video example

We recently dropped [an example](https://modal.com/docs/examples/image_to_video) of how to run LTX-Video on Modal to animate images.

![](https://modal-public-assets.s3.us-east-1.amazonaws.com/example-image-to-video.gif)

## ⛽️ Blog post: How to maximize GPU utilization

Three types of GPU utilization [you should know](https://modal.com/blog/gpu-utilization-guide) and how to go about measuring them.

![](https://modal-cdn.com/cdnbot/maximize-gpu-utilizationives8jfk_579c96c9.webp)

## 🖊️ More from our blog

- We made our hit [GPU glossary open-source](https://modal.com/blog/open-source-gpu-glossary) - now welcoming community contributions!

## 🍭 Fun tidbits

- You may have also noticed we launched [a shiny new logo](https://live.standards.site/modal) 🤩
- We launched our first billboard campaign in SF! Anyone who finds and tweets a photo of our billboards gets a little prize.

![](https://modal-cdn.com/cdnbot/modal-billboard0jqgfu3f_d70d901d.webp)
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<h2 id="-we-dropped-our-gpu-cpu-and-memory-prices-by-up-to-65">🔻 We dropped our GPU, CPU, and memory prices by up to 65%</h2> <p><!></p> <p>p.s. You can also spike up to 50 GPUs concurrently on the Team plan now!</p> <h2 id="-modal-sdk-now-available-on-conda-forge">📦 Modal SDK now available on <code>conda-forge</code></h2> <p>By popular demand from the scientific computing community, the Modal SDK is now available on <code>conda-forge</code> starting with version <code>0.73.46</code>. You can install it with:</p> <!> <h2 id="-client-updates">👩‍💻 Client updates</h2> <ul><li>We’re planning to release version 1.0 of the Modal client soon, and we’re working hard to address pain points and common sources of confusion in the SDK. When you update your client, you’ll likely see some deprecation warnings. We’ve put together a <!> to highlight the major changes and provide advice about how to update your application code.</li> <li>We took the <code>_experimental</code> out of <code>_experimental_buffer_containers</code>! Add <code>buffer_containers=N</code> to your decorators and we’ll keep an extra “buffer” of containers around while your Functions are running, ready for when more inputs show up. See the <!> for details.</li></ul> <h2 id="️-new-image-to-video-example">📽️ New image-to-video example</h2> <p>We recently dropped <!> of how to run LTX-Video on Modal to animate images.</p> <p><!></p> <h2 id="️-blog-post-how-to-maximize-gpu-utilization">⛽️ Blog post: How to maximize GPU utilization</h2> <p>Three types of GPU utilization <!> and how to go about measuring them.</p> <p><!></p> <h2 id="️-more-from-our-blog">🖊️ More from our blog</h2> <ul><li>We made our hit <!> - now welcoming community contributions!</li></ul> <h2 id="-fun-tidbits">🍭 Fun tidbits</h2> <ul><li>You may have also noticed we launched <!> 🤩</li> <li>We launched our first billboard campaign in SF! Anyone who finds and tweets a photo of our billboards gets a little prize.</li></ul> <p><!></p>`,1);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),2);u(e(p),{src:`https://modal-cdn.com/cdnbot/pricing-drop-imagewbgj9bs7_2f5f0510.webp`}),n(p);var m=c(p,8);d(m,{code:`conda%20install%20-c%20conda-forge%20modal-client`,lang:`text`});var h=c(m,4),g=e(h);f(c(e(g)),{href:`https://modal.com/docs/guide/modal-1-0-migration`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Migration Guide`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);f(c(e(_),7),{href:`https://modal.com/docs/guide/cold-start#overprovision-resources-with-min_containers-and-buffer_containers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`docs`))},$$slots:{default:!0}}),l(),n(_),n(h);var v=c(h,4);f(c(e(v)),{href:`https://modal.com/docs/examples/image_to_video`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`an example`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);u(e(y),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/example-image-to-video.gif`}),n(y);var b=c(y,4);f(c(e(b)),{href:`https://modal.com/blog/gpu-utilization-guide`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`you should know`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);u(e(x),{src:`https://modal-cdn.com/cdnbot/maximize-gpu-utilizationives8jfk_579c96c9.webp`}),n(x);var S=c(x,4),C=e(S);f(c(e(C)),{href:`https://modal.com/blog/open-source-gpu-glossary`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU glossary open-source`))},$$slots:{default:!0}}),l(),n(C),n(S);var w=c(S,4),E=e(w);f(c(e(E)),{href:`https://live.standards.site/modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`a shiny new logo`))},$$slots:{default:!0}}),l(),n(E),l(2),n(w);var D=c(w,2);u(e(D),{src:`https://modal-cdn.com/cdnbot/modal-billboard0jqgfu3f_d70d901d.webp`}),n(D),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=BQYlbr15.js.map
