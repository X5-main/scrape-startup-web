(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6303395b-53f7-483e-a9ec-057cdb3d462b`,e._sentryDebugIdIdentifier=`sentry-dbid-6303395b-53f7-483e-a9ec-057cdb3d462b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`Modal + Datalab: Deploy high-throughput document intelligence in <5 minutes`,description:`We've collaborated with Datalab, the creators of Marker and Surya, to make it faster than ever to deploy document intelligence workflows.`,date:`2025-10-29T21:00:00.000Z`,length:`4 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`Quickstart`,id:`quickstart`},{depth:2,value:`How it works`,id:`how-it-works`},{depth:2,value:`Why Marker?`,id:`why-marker`},{depth:2,value:`10x Marker throughput on Modal`,id:`10x-marker-throughput-on-modal`},{depth:2,value:`Deploy best-in-class document intelligence`,id:`deploy-best-in-class-document-intelligence`}],rawContent:`We’re excited to collaborate with [Datalab](https://www.datalab.to/), creators of [Marker](https://github.com/datalab-to/marker) and [Surya](https://github.com/datalab-to/surya), to make it faster than ever for developers and teams to deploy best-in-class document intelligence models.

Marker is a purpose-built, sub-billion-parameter model trained specifically for document structure. It delivers deterministic, high-fidelity parsing without the hallucination or instability of larger LLMs, and does so at a fraction of the cost. Marker, along with Datalab’s other open-source tools, have earned 48k+ stars on GitHub and are trusted by researchers, startups, and enterprise teams alike.

Modal already powers Datalab’s hosted platform, enabling them to deliver reliable, scalable model serving and roll out new releases quickly:

<Quote authorName="Vik Paruchuri" authorTitle="Founder @ Datalab">
    <span>
        Using Modal for inference is like having an extra infra team—it’s reliable, scalable, and fast—meaning I can get back to training models.
    </span>
</Quote>

**Now, any builder or team can use Modal to instantly deploy Datalab’s state-of-the-art [Marker](https://github.com/datalab-to/marker) pipeline and [Surya](https://github.com/datalab-to/surya) OCR toolkit.** Datalab’s tools remain free for research, personal use, and startups under $2M funding/revenue, with licensing options for commercial customers.

## Quickstart

Marker is easy to clone and run locally, but you can deploy it on Modal to maximize scalability and throughput. Clone the Marker repository and deploy the Modal example [here](https://github.com/datalab-to/marker), which will provision a GPU container in Modal, install \`marker\`, and expose its functionality behind a FastAPI endpoint.

\`\`\`jsx
pip install modal
modal setup

git clone git@github.com:datalab-to/marker.git
cd marker/examples/
modal deploy marker_modal_deployment.py
\`\`\`

That’s it! For a more detailed full-stack example, check out this [Modal example](https://modal.com/docs/examples/doc_ocr_jobs) of building a quick document OCR web app.

![receipt parsing](https://modal-cdn.com/blog/images/receipt-parsing.png)

Modal comes with $30/mo in free compute credits, which is plenty to get started with your OCR tasks.

## How it works

Modal allows you to deploy Marker on GPUs in seconds. Modal also autoscales GPUs for your deployment so you get max throughput on batch jobs with no additional effort.

Here’s what happens behind the scenes:

First, Marker model weights get cached in a [Modal Volume](/docs/guide/volumes), which cuts cold start times. No need to redownload models every time, and Volumes guarantee fast reads no matter where your inference function is running.

\`\`\`python
marker_cache_path = "/root/.cache/datalab/"
marker_cache_volume = modal.Volume.from_name(
    "marker-models-modal-demo", create_if_missing=True
)
marker_cache = {marker_cache_path: marker_cache_volume}
\`\`\`

Then, when the inference function is called, Modal spins up a container using the environment and hardware requirements [specified in the function decorator](/docs/guide/images). You don’t need to use config files, as everything is defined in-line with application code.

\`\`\`python
inference_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "marker-pdf[full]==1.9.3", "torch==2.8.0"
)

@app.function(gpu="l40s", volumes=marker_cache, image=inference_image)
def parse_document(document: bytes, ...) -> str | dict:
		# Load Marker model from Volume and run
		...
\`\`\`

Need to process thousands of PDFs at once? Modal [autoscales instantly](/docs/guide/scale)—up to thousands of GPUs—based on request volume. Our global capacity pools guarantee that you never wait on quota.

## Why Marker?

Marker supports over 90 languages, handles incredibly complex and dense tables, and is state-of-the-art in extracting math from PDFs. Marker can be used for a wide range of tasks like:

- Indexing PDF knowledge bases for RAG
- Parsing multilingual PDF content for training
- Extracting key information from unstructured documents

![marker benchmarks](https://modal-cdn.com/blog/images/marker-benchmarks.png)
<modal-img-caption>
see [here](https://github.com/datalab-to/marker?tab=readme-ov-file#benchmarks) for detailed benchmarks
</modal-img-caption>

Marker benchmarks favorably for both accuracy and throughput compared to cloud services like Llamaparse and Mathpix, as well as other open source tools. Accuracy benchmarks above were performed on single PDF pages from Common Crawl and scored using LLM-as-a-judge.

## 10x Marker throughput on Modal

Accuracy alone isn’t enough. Real-world systems demand high throughput and reliability to process millions of documents quickly, consistently, and cost-effectively. Marker was designed with that in mind, and Modal is the fastest way to achieve scale for self-deployments.

On an M4 Mac using Apple MPS (no GPU), you can process around 0.22 pages per second. On Modal, you can increase this to around 2.2 pages per second per container. This **10x gain** comes from using more powerful hardware (e.g. H100 GPU), Flash Attention optimizations, and environment tuning (for settings like \`OMP_NUM_THREADS\`). Note that in practice, you should experiment with various configurations to find your ideal balance of accuracy, cost, and throughput

If you’re batch processing multiple PDFs, Modal can easily autoscale to hundreds of GPUs, further improving overall throughput.

Need a managed solution for a commercial use case? Datalab’s API platform uses additional inference optimizations to enable a page throughput of around 3-4 pages per second. This is deployed on Modal behind the scenes!

![throughput chart](https://modal-cdn.com/blog/images/marker-throughput-chart.png)

## Deploy best-in-class document intelligence

We’re excited to be deepening our collaboration with Datalab. Many of our users have already been turning to Modal for best practices on deploying Marker and Surya, and this collaboration now makes that seamless.

Get started today with [this example](/docs/examples/doc_ocr_jobs).
`,meta:{description:`We've collaborated with Datalab, the creators of Marker and Surya, to make it faster than ever to deploy document intelligence workflows.`}},{title:g,description:_,date:v,length:y,category:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=h,E=t(`<span>Using Modal for inference is like having an extra infra team—it’s reliable, scalable, and fast—meaning I can get back to training models.</span>`),D=t(`<p>We’re excited to collaborate with <!>, creators of <!> and <!>, to make it faster than ever for developers and teams to deploy best-in-class document intelligence models.</p> <p>Marker is a purpose-built, sub-billion-parameter model trained specifically for document structure. It delivers deterministic, high-fidelity parsing without the hallucination or instability of larger LLMs, and does so at a fraction of the cost. Marker, along with Datalab’s other open-source tools, have earned 48k+ stars on GitHub and are trusted by researchers, startups, and enterprise teams alike.</p> <p>Modal already powers Datalab’s hosted platform, enabling them to deliver reliable, scalable model serving and roll out new releases quickly:</p> <!> <p><strong>Now, any builder or team can use Modal to instantly deploy Datalab’s state-of-the-art <!> pipeline and <!> OCR toolkit.</strong> Datalab’s tools remain free for research, personal use, and startups under $2M funding/revenue, with licensing options for commercial customers.</p> <h2 id="quickstart">Quickstart</h2> <p>Marker is easy to clone and run locally, but you can deploy it on Modal to maximize scalability and throughput. Clone the Marker repository and deploy the Modal example <!>, which will provision a GPU container in Modal, install <code>marker</code>, and expose its functionality behind a FastAPI endpoint.</p> <!> <p>That’s it! For a more detailed full-stack example, check out this <!> of building a quick document OCR web app.</p> <p><!></p> <p>Modal comes with $30/mo in free compute credits, which is plenty to get started with your OCR tasks.</p> <h2 id="how-it-works">How it works</h2> <p>Modal allows you to deploy Marker on GPUs in seconds. Modal also autoscales GPUs for your deployment so you get max throughput on batch jobs with no additional effort.</p> <p>Here’s what happens behind the scenes:</p> <p>First, Marker model weights get cached in a <!>, which cuts cold start times. No need to redownload models every time, and Volumes guarantee fast reads no matter where your inference function is running.</p> <!> <p>Then, when the inference function is called, Modal spins up a container using the environment and hardware requirements <!>. You don’t need to use config files, as everything is defined in-line with application code.</p> <!> <p>Need to process thousands of PDFs at once? Modal <!>—up to thousands of GPUs—based on request volume. Our global capacity pools guarantee that you never wait on quota.</p> <h2 id="why-marker">Why Marker?</h2> <p>Marker supports over 90 languages, handles incredibly complex and dense tables, and is state-of-the-art in extracting math from PDFs. Marker can be used for a wide range of tasks like:</p> <ul><li>Indexing PDF knowledge bases for RAG</li> <li>Parsing multilingual PDF content for training</li> <li>Extracting key information from unstructured documents</li></ul> <p><!> <modal-img-caption>see <!> for detailed benchmarks</modal-img-caption></p> <p>Marker benchmarks favorably for both accuracy and throughput compared to cloud services like Llamaparse and Mathpix, as well as other open source tools. Accuracy benchmarks above were performed on single PDF pages from Common Crawl and scored using LLM-as-a-judge.</p> <h2 id="10x-marker-throughput-on-modal">10x Marker throughput on Modal</h2> <p>Accuracy alone isn’t enough. Real-world systems demand high throughput and reliability to process millions of documents quickly, consistently, and cost-effectively. Marker was designed with that in mind, and Modal is the fastest way to achieve scale for self-deployments.</p> <p>On an M4 Mac using Apple MPS (no GPU), you can process around 0.22 pages per second. On Modal, you can increase this to around 2.2 pages per second per container. This <strong>10x gain</strong> comes from using more powerful hardware (e.g. H100 GPU), Flash Attention optimizations, and environment tuning (for settings like <code>OMP_NUM_THREADS</code>). Note that in practice, you should experiment with various configurations to find your ideal balance of accuracy, cost, and throughput</p> <p>If you’re batch processing multiple PDFs, Modal can easily autoscale to hundreds of GPUs, further improving overall throughput.</p> <p>Need a managed solution for a commercial use case? Datalab’s API platform uses additional inference optimizations to enable a page throughput of around 3-4 pages per second. This is deployed on Modal behind the scenes!</p> <p><!></p> <h2 id="deploy-best-in-class-document-intelligence">Deploy best-in-class document intelligence</h2> <p>We’re excited to be deepening our collaboration with Datalab. Many of our users have already been turning to Modal for best practices on deploying Marker and Surya, and this collaboration now makes that seamless.</p> <p>Get started today with <!>.</p>`,3);function O(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=D(),m=s(o),h=c(e(m));p(h,{href:`https://www.datalab.to/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Datalab`))},$$slots:{default:!0}});var g=c(h,2);p(g,{href:`https://github.com/datalab-to/marker`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Marker`))},$$slots:{default:!0}}),p(c(g,2),{href:`https://github.com/datalab-to/surya`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Surya`))},$$slots:{default:!0}}),l(),n(m);var _=c(m,6);u(_,{authorName:`Vik Paruchuri`,authorTitle:`Founder @ Datalab`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var v=c(_,2),y=e(v),b=c(e(y));p(b,{href:`https://github.com/datalab-to/marker`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Marker`))},$$slots:{default:!0}}),p(c(b,2),{href:`https://github.com/datalab-to/surya`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Surya`))},$$slots:{default:!0}}),l(),n(y),l(),n(v);var x=c(v,4);p(c(e(x)),{href:`https://github.com/datalab-to/marker`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(3),n(x);var S=c(x,2);f(S,{code:`pip%20install%20modal%0Amodal%20setup%0A%0Agit%20clone%20git%40github.com%3Adatalab-to%2Fmarker.git%0Acd%20marker%2Fexamples%2F%0Amodal%20deploy%20marker_modal_deployment.py`,lang:`jsx`});var C=c(S,2);p(c(e(C)),{href:`https://modal.com/docs/examples/doc_ocr_jobs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal example`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);d(e(w),{src:`https://modal-cdn.com/blog/images/receipt-parsing.png`,alt:`receipt parsing`}),n(w);var T=c(w,10);p(c(e(T)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),l(),n(T);var O=c(T,2);f(O,{code:`marker_cache_path%20%3D%20%22%2Froot%2F.cache%2Fdatalab%2F%22%0Amarker_cache_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22marker-models-modal-demo%22%2C%20create_if_missing%3DTrue%0A)%0Amarker_cache%20%3D%20%7Bmarker_cache_path%3A%20marker_cache_volume%7D`,lang:`python`});var k=c(O,2);p(c(e(k)),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`specified in the function decorator`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`inference_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22marker-pdf%5Bfull%5D%3D%3D1.9.3%22%2C%20%22torch%3D%3D2.8.0%22%0A)%0A%0A%40app.function(gpu%3D%22l40s%22%2C%20volumes%3Dmarker_cache%2C%20image%3Dinference_image)%0Adef%20parse_document(document%3A%20bytes%2C%20...)%20-%3E%20str%20%7C%20dict%3A%0A%09%09%23%20Load%20Marker%20model%20from%20Volume%20and%20run%0A%09%09...`,lang:`python`});var j=c(A,2);p(c(e(j)),{href:`/docs/guide/scale`,children:(e,t)=>{l(),i(e,r(`autoscales instantly`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,8),N=e(M);d(N,{src:`https://modal-cdn.com/blog/images/marker-benchmarks.png`,alt:`marker benchmarks`});var P=c(N,2);p(c(e(P)),{href:`https://github.com/datalab-to/marker?tab=readme-ov-file#benchmarks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(P),n(M);var F=c(M,14);d(e(F),{src:`https://modal-cdn.com/blog/images/marker-throughput-chart.png`,alt:`throughput chart`}),n(F);var I=c(F,6);p(c(e(I)),{href:`/docs/examples/doc_ocr_jobs`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(I),i(t,o)},$$slots:{default:!0}}))}export{O as default,h as metadata};
//# sourceMappingURL=C-5wtVdn.js.map
