(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2e04124d-7d2b-4527-b55e-d14ce7ac042c`,e._sentryDebugIdIdentifier=`sentry-dbid-2e04124d-7d2b-4527-b55e-d14ce7ac042c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Hybrid search over California embeddings with Modal, MongoDB, and Clay`,description:`Build intelligent applications with Modal's serverless infrastructure and MongoDB Atlas's data platform.`,authors:[{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`AI Engineer`,twitterHandle:`charles_irl`}],date:`2024-09-24T12:00:00.000Z`,length:`5 minute read`,category:`Tutorials`,published:!0,layout:`blog`,githubLink:`https://github.com/modal-labs/search-california`,toc:[{depth:2,value:`How does it work?`,id:`how-does-it-work`},{depth:2,value:`Why Modal and MongoDB Atlas?`,id:`why-modal-and-mongodb-atlas`}],rawContent:`Data APIs, foundation models, serverless infrastructure from Modal, and the
[MongoDB Atlas data platform](https://www.mongodb.com/atlas) make a potent
combination.

I used that stack for
[my first RAG chatbot app](https://youtu.be/twHxmU9OxDU?list=PL1T8fO7ArWleyIqOy37OVXsP4hFXymdOZ)
back in January of 2023. But the strength of this combination is deeper than
just the latest tech fads.

To demonstrate the general power of this stack, I put together a very
different kind of hybrid search app: search over the state of California based
on timestamps, geolocation data, and satellite image embeddings (using a
foundation model from [Clay](https://madewithclay.org/) and
[Development Seed](https://developmentseed.org/)). Try it
[here](https://modal-labs--clay-hybrid-search.modal.run/), or check out the code
and run it for yourself
[here](https://github.com/modal-labs/search-california/tree/main).

[![search-california user interface](https://modal-cdn.com/cdnbot/mongodb-search-california-ui.png)](https://modal-labs--clay-hybrid-search.modal.run/)

## How does it work?

At a high level, here’s how signals from a satellite become results of a hybrid
search query run by MongoDB and rendered in your browser, all orchestrated by
Modal:

1. Every few days, the European Space Agency’s
   [Sentinel satellites](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2)
   collect images of the entire Earth. The images are uploaded to cloud storage
   and
   [made available via an API](https://docs.sentinel-hub.com/api/latest/data/sentinel-2-l2a/).
2. [Every day, we query that API for new images in a specific area-of-interest](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L58-L64)
   — here, the
   [state of California](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/data/california.geojson).
   Areas-of-interest defined in GeoJSON format are
   [available for free on the Internet](https://github.com/ropensci/geojsonio/tree/7e4cc683ed3d6eec38a8cae5ce03fa6d82acafc7/inst/examples).
   We
   [cache them in MongoDB](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/database.py#L74-L78).
3. The responses of that API, also formatted as JSON documents, are
   [uploaded to a MongoDB Atlas cluster](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/database.py#L63-L72).
4. Asynchronously, that
   [database is queried](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L67-L76)
   to find entries that do not have an associated embedding.
5. Any entries without embeddings are
   [communicated](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L80-L86)
   to a
   [serverless embedding service](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/embeddings.py)
   running the
   [Clay v1 foundation model for satellite imagery](https://clay-foundation.github.io/model/index.html).
   We run the model’s forward pass on hundreds of sub-regions at once on A10
   GPUs and
   [merge them into a single embedding with a bit of custom PyTorch code](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/embeddings.py#L100-L123).
6. These embeddings are
   [communicated back to the MongoDB Atlas cluster](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L87-L100)
   for storage.
7. A small
   [Alpine JS frontend client](https://github.com/modal-labs/search-california/blob/main/frontend/static/js/app.js)
   for querying this data in a UI is served via a
   [simple static FastAPI serve](https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/frontend/serve.py)r.
8. That client sends hybrid search requests based on geo-location, image
   embedding, and timestamp to the MongoDB Atlas cluster.

This entire application — from API queries and data persistence to GPU inference
and hybrid search — is delivered using nothing but Modal and MongoDB Atlas.
Setting it up for yourself requires only credentials on these platforms and a
few commands. See the
[full code](https://github.com/modal-labs/search-california/) for details.

## Why Modal and MongoDB Atlas?

This hybrid satellite image search application is intended as a novel
demonstration of the emerging category of applications that rely on data APIs
and foundation models to drive compelling new experiences.

For these applications, Modal and MongoDB Atlas make for a natural pair due to
their shared strengths.

1. **Versatility & Developer Experience**

   Modal makes it easy to run heterogeneous Python workloads in the cloud. In
   our demo, we used it for everything from running small scheduled jobs to
   serving a database client to accelerating neural networks with GPUs.

   MongoDB Atlas also makes it easy to run diverse cloud storage and search
   services supporting diverse applications. The JSON document model reduces
   impedance mismatch between data APIs and data storage and provides a unified
   interface.

   Together, they enable iteration at the speed of thought.

2. **Scalability**

   Modal’s serverless infrastructure scales with your workloads, so you only pay
   for the resources you need — and you have them when you need them. Customers
   like [Suno](https://suno.com/) serve
   [applications at scale](https://modal.com/blog/suno-case-study) with Modal.

   MongoDB Atlas is built for scale, with built-in data tiering, point-in-time
   recovery, and rich telemetry. And like the Sentinel satellites, Atlas is
   worldwide: global data distribution, multi-cloud reach, and multi-region
   replication.

   Together, they ensure your compute and data infrastructure match your needs
   at any scale.

3. **AI and ML Capabilities**

   Modal provides on-demand access to
   [powerful GPUs](https://modal.com/docs/guide/gpu), like NVIDIA H100s, that
   can run the latest foundation models. We back them up with easy-to-use but
   powerful cloud-native development primitives, like distributed dictionaries &
   queues and remote storage designed for large files.

   MongoDB Atlas provides flexible search (text, geospatial, vector) that can
   both power and be powered by contemporary foundation models. Atlas ties these
   capabilities to operational data, ensuring freshness and reliability.

   Together, they connect the most powerful hardware and intelligent models to
   your application and its data.
`,meta:{description:`Build intelligent applications with Modal's serverless infrastructure and MongoDB Atlas's data platform.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,published:b,layout:x,githubLink:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p>Data APIs, foundation models, serverless infrastructure from Modal, and the <!> make a potent
combination.</p> <p>I used that stack for <!> back in January of 2023. But the strength of this combination is deeper than
just the latest tech fads.</p> <p>To demonstrate the general power of this stack, I put together a very
different kind of hybrid search app: search over the state of California based
on timestamps, geolocation data, and satellite image embeddings (using a
foundation model from <!> and <!>). Try it <!>, or check out the code
and run it for yourself <!>.</p> <p><!></p> <h2 id="how-does-it-work">How does it work?</h2> <p>At a high level, here’s how signals from a satellite become results of a hybrid
search query run by MongoDB and rendered in your browser, all orchestrated by
Modal:</p> <ol><li>Every few days, the European Space Agency’s <!> collect images of the entire Earth. The images are uploaded to cloud storage
and <!>.</li> <li><!> — here, the <!>.
Areas-of-interest defined in GeoJSON format are <!>.
We <!>.</li> <li>The responses of that API, also formatted as JSON documents, are <!>.</li> <li>Asynchronously, that <!> to find entries that do not have an associated embedding.</li> <li>Any entries without embeddings are <!> to a <!> running the <!>.
We run the model’s forward pass on hundreds of sub-regions at once on A10
GPUs and <!>.</li> <li>These embeddings are <!> for storage.</li> <li>A small <!> for querying this data in a UI is served via a <!>r.</li> <li>That client sends hybrid search requests based on geo-location, image
embedding, and timestamp to the MongoDB Atlas cluster.</li></ol> <p>This entire application — from API queries and data persistence to GPU inference
and hybrid search — is delivered using nothing but Modal and MongoDB Atlas.
Setting it up for yourself requires only credentials on these platforms and a
few commands. See the <!> for details.</p> <h2 id="why-modal-and-mongodb-atlas">Why Modal and MongoDB Atlas?</h2> <p>This hybrid satellite image search application is intended as a novel
demonstration of the emerging category of applications that rely on data APIs
and foundation models to drive compelling new experiences.</p> <p>For these applications, Modal and MongoDB Atlas make for a natural pair due to
their shared strengths.</p> <ol><li><p><strong>Versatility & Developer Experience</strong></p> <p>Modal makes it easy to run heterogeneous Python workloads in the cloud. In
our demo, we used it for everything from running small scheduled jobs to
serving a database client to accelerating neural networks with GPUs.</p> <p>MongoDB Atlas also makes it easy to run diverse cloud storage and search
services supporting diverse applications. The JSON document model reduces
impedance mismatch between data APIs and data storage and provides a unified
interface.</p> <p>Together, they enable iteration at the speed of thought.</p></li> <li><p><strong>Scalability</strong></p> <p>Modal’s serverless infrastructure scales with your workloads, so you only pay
for the resources you need — and you have them when you need them. Customers
like <!> serve <!> with Modal.</p> <p>MongoDB Atlas is built for scale, with built-in data tiering, point-in-time
recovery, and rich telemetry. And like the Sentinel satellites, Atlas is
worldwide: global data distribution, multi-cloud reach, and multi-region
replication.</p> <p>Together, they ensure your compute and data infrastructure match your needs
at any scale.</p></li> <li><p><strong>AI and ML Capabilities</strong></p> <p>Modal provides on-demand access to <!>, like NVIDIA H100s, that
can run the latest foundation models. We back them up with easy-to-use but
powerful cloud-native development primitives, like distributed dictionaries &
queues and remote storage designed for large files.</p> <p>MongoDB Atlas provides flexible search (text, geospatial, vector) that can
both power and be powered by contemporary foundation models. Atlas ties these
capabilities to operational data, ensuring freshness and reliability.</p> <p>Together, they connect the most powerful hardware and intelligent models to
your application and its data.</p></li></ol>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=s(o);d(c(e(f)),{href:`https://www.mongodb.com/atlas`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MongoDB Atlas data platform`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,2);d(c(e(p)),{href:`https://youtu.be/twHxmU9OxDU?list=PL1T8fO7ArWleyIqOy37OVXsP4hFXymdOZ`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`my first RAG chatbot app`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,2),h=c(e(m));d(h,{href:`https://madewithclay.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Clay`))},$$slots:{default:!0}});var g=c(h,2);d(g,{href:`https://developmentseed.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Development Seed`))},$$slots:{default:!0}});var _=c(g,2);d(_,{href:`https://modal-labs--clay-hybrid-search.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),d(c(_,2),{href:`https://github.com/modal-labs/search-california/tree/main`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(m);var v=c(m,2);d(e(v),{href:`https://modal-labs--clay-hybrid-search.modal.run/`,rel:`nofollow`,children:(e,t)=>{u(e,{src:`https://modal-cdn.com/cdnbot/mongodb-search-california-ui.png`,alt:`search-california user interface`})},$$slots:{default:!0}}),n(v);var y=c(v,6),b=e(y),x=c(e(b));d(x,{href:`https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sentinel satellites`))},$$slots:{default:!0}}),d(c(x,2),{href:`https://docs.sentinel-hub.com/api/latest/data/sentinel-2-l2a/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`made available via an API`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,2),C=e(S);d(C,{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L58-L64`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Every day, we query that API for new images in a specific area-of-interest`))},$$slots:{default:!0}});var w=c(C,2);d(w,{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/data/california.geojson`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`state of California`))},$$slots:{default:!0}});var T=c(w,2);d(T,{href:`https://github.com/ropensci/geojsonio/tree/7e4cc683ed3d6eec38a8cae5ce03fa6d82acafc7/inst/examples`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`available for free on the Internet`))},$$slots:{default:!0}}),d(c(T,2),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/database.py#L74-L78`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cache them in MongoDB`))},$$slots:{default:!0}}),l(),n(S);var D=c(S,2);d(c(e(D)),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/database.py#L63-L72`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`uploaded to a MongoDB Atlas cluster`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);d(c(e(O)),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L67-L76`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`database is queried`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2),A=c(e(k));d(A,{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L80-L86`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`communicated`))},$$slots:{default:!0}});var j=c(A,2);d(j,{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/embeddings.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`serverless embedding service`))},$$slots:{default:!0}});var M=c(j,2);d(M,{href:`https://clay-foundation.github.io/model/index.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Clay v1 foundation model for satellite imagery`))},$$slots:{default:!0}}),d(c(M,2),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/embeddings.py#L100-L123`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`merge them into a single embedding with a bit of custom PyTorch code`))},$$slots:{default:!0}}),l(),n(k);var N=c(k,2);d(c(e(N)),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/backend/extract.py#L87-L100`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`communicated back to the MongoDB Atlas cluster`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2),F=c(e(P));d(F,{href:`https://github.com/modal-labs/search-california/blob/main/frontend/static/js/app.js`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Alpine JS frontend client`))},$$slots:{default:!0}}),d(c(F,2),{href:`https://github.com/modal-labs/search-california/blob/96a586fac3d6ba1b953366a7156cb2f1fa505f73/frontend/serve.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`simple static FastAPI serve`))},$$slots:{default:!0}}),l(),n(P),l(2),n(y);var I=c(y,2);d(c(e(I)),{href:`https://github.com/modal-labs/search-california/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`full code`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,8),R=c(e(L),2),z=c(e(R),2),B=c(e(z));d(B,{href:`https://suno.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Suno`))},$$slots:{default:!0}}),d(c(B,2),{href:`https://modal.com/blog/suno-case-study`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`applications at scale`))},$$slots:{default:!0}}),l(),n(z),l(4),n(R);var V=c(R,2),H=c(e(V),2);d(c(e(H)),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`powerful GPUs`))},$$slots:{default:!0}}),l(),n(H),l(4),n(V),n(L),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=wyWzPYHQ.js.map
