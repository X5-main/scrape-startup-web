(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d445920c-796c-49bd-abbb-f75ee67b9c93`,e._sentryDebugIdIdentifier=`sentry-dbid-d445920c-796c-49bd-abbb-f75ee67b9c93`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te,r as ne}from"./CPby7b1n.js";import{t as re}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={description:`Embed Wikipedia with Modal and query vector analogies using Weaviate. Combines neural network inference with vector search.`,toc:[{depth:1,value:`Embed Wikipedia with Modal and search it with Weaviate`,id:`embed-wikipedia-with-modal-and-search-it-with-weaviate`,children:[{depth:2,value:`Overview`,id:`overview`},{depth:2,value:`Run it yourself`,id:`run-it-yourself`,children:[{depth:3,value:`Set up a Python environment`,id:`set-up-a-python-environment`},{depth:3,value:`Deploy a serverless, read-only Weaviate client with Modal`,id:`deploy-a-serverless-read-only-weaviate-client-with-modal`},{depth:3,value:`Optional: Embed and index Wikipedia yourself`,id:`optional-embed-and-index-wikipedia-yourself`},{depth:3,value:`Run the React frontend locally`,id:`run-the-react-frontend-locally`,children:[{depth:4,value:`Optional: Serve a hot-reloading backend`,id:`optional-serve-a-hot-reloading-backend`}]},{depth:3,value:`Optional: Deploy the React frontend`,id:`optional-deploy-the-react-frontend`}]}]}],rawContent:`# Embed Wikipedia with Modal and search it with Weaviate

[![Albert Einstein - Physics + Basketball ~= Kobe Bryant](https://vector-analogies-wikipedia.vercel.app/einstein-bryant.png)](https://vector-analogies-wikipedia.vercel.app/)

This sample project demonstrates the powerful combo of serverless infrastructure from [Modal](https://modal.com)
and the search capabilities of [Weaviate](https://weaviate.io)
for projects that combine data-intensive Python compute, like neural network inference,
with data-intensive search, like indexing all of Wikipedia.

You can find the code on GitHub [here](https://github.com/modal-labs/vector-analogies-wikipedia).
It's intended as a jumping off point for your own code that combines
Modal with databases like Weaviate and with JavaScript frontends.
It is also deployed as a [live demo application](https://vector-analogies-wikipedia.vercel.app/).

## Overview

The [\`frontend\`](https://github.com/modal-labs/vector-analogies-wikipedia/tree/main/frontend)
of this project (written in React, hosted on [Vercel](https://vercel.com))
allows users to construct "vector analogies" of the form made famous by [Word2Vec](https://arxiv.org/abs/1301.3781).
For example, the approximation

\`\`\`
Albert Einstein - Physics + Basketball ~= Kobe Bryant
\`\`\`

expresses the analogy "Kobe Bryant is the Albert Einstein of basketball".
We can compute it by applying those operations to embedding vectors of each concept,
where \`~=\` is implemented using an
[approximate nearest-neighbor search index](https://weaviate.io/developers/weaviate/concepts/indexing),
the key method used for querying in vector databases.

Where Word2Vec used word embeddings to express concepts, we use snippets of Wikipedia articles.
The dataset used was constructed from the March 2022 WikiMedia dump [by Hugging Face](https://huggingface.co/datasets/wikipedia).

Users can type into each search bar to find a snippet of interest,
using Weaviate text search under the hood,
and once they've selected the three components of their analogy,
the frontend kicks off a vector search to complete it.

Both searches are coordinated by a [\`backend\`](https://github.com/modal-labs/vector-analogies-wikipedia/tree/main/backend) Python service running on Modal.

Modal is also used to construct embeddings for snippets and then insert them into Weaviate.
You can read more about the embedding process [here](https://modal.com/blog/embedding-wikipedia).
We also wrote a high level guide to this project [here](https://weaviate.io/blog/modal-and-weaviate).

## Run it yourself

The full, end-to-end version of this project involves a number of services and workflows:

1. A **Vite/React frontend**, to allow users to search for Wikipedia snippets and construct analogies via vector search
1. A **Weaviate database on Weaviate Cloud Services**, to store the Wikipedia snippets and their embeddings and to run both text and vector searches
1. A **serverless Weaviate database client on Modal**, to listen for requests from app clients, run the search logic, and communicate with the database
1. A **vector embedding service on Modal serverless GPUs**, to embed the Wikipedia snippets as vectors
1. An **ingestion workflow on Modal**, to download the Wikipedia dataset, embed it, and send the results to Weaviate

To make setup easier, we make it possible to run the search via a read-only client
of our Weaviate database and run the app locally,
which lets you skip the vector embedding and ingestion steps.

### Set up a Python environment

Set up a Python environment however you like and then install \`modal\` with

\`\`\`bash
pip install modal==0.62.140
\`\`\`

Because Modal runs all of your code in cloud containers, you don't have to worry
about any other dependencies!

If you don't already have a Modal account, get started with
\`modal setup\`.

### Deploy a serverless, read-only Weaviate client with Modal

Next, we set up a Weaviate client on Modal that reads from a Weaviate database
that has already ingested and indexed the Wikipedia data.

Add \`WCS_URL=https://gzimzbmdr6ycxyja715rsa.c0.us-west4.gcp.weaviate.cloud\` and \`WCS_RO_KEY=tUeQG12AkFLBY9SYOWVh2y00hZ25yu8va0UP\` to a [\`modal.Secret\`](https://modal.com/docs/guide/secrets) called \`wiki-weaviate\`.

Then, run the following command from the repo root to create a database client on Modal.

\`\`\`bash
modal deploy -m backend.database
\`\`\`

This client is _serverless_, meaning it scales automatically with load,
including scaling down to zero instances when there is no load.
That means you only need to pay for the compute resources you use!

You can run queries against the database from your local machine
to test the client logic, for example

\`\`\`bash
modal run -m backend.database::WeaviateClient.query --q='Albert Einstein'
\`\`\`

or you can hit the API directly from your browser or with a tool like \`curl\` or Postman.

\`\`\`bash
curl https://modal-labs--modal-weaviate-query.modal.run\\?q\\=Albert%20Einstein
\`\`\`

Note that you should replace \`modal-labs\` in the URL with your Modal username!

This will return a large JSON object with a big vector of floating point numbers attached,
so you might want to pipe it through \`jq\` or another JSON formatter:

\`\`\`bash
curl https://modal-labs--modal-weaviate-query.modal.run\\?q\\=Albert%20Einstein \\
 | jq . results\\[0\\].content
\`\`\`

### Optional: Embed and index Wikipedia yourself

If you'd like to run the entire pipeline yourself, there are several additional steps.

<details>
<summary> Click here to reveal them.
</summary>

1. Set up a Weaviate database instance via [Weaviate Cloud Services](https://weaviate.io/developers/weaviate/installation/weaviate-cloud-services).

2. Add your \`WCS_URL\`, \`WCS_ADMIN_KEY\`, and \`WCS_RO_KEY\` key to the \`wiki-weaviate\` [\`modal.Secret\`](https://modal.com/docs/guide/secrets).

3. Redeploy the new write-authorized Weaviate client for your instance with \`modal deploy -m backend.database\`.

4. Download the Wikipedia dataset from [Hugging Face](https://huggingface.co/datasets/wikipedia) with \`modal run -m backend.download\`. This step takes five to ten minutes.

5. Deploy the (serverless) vector embedding service with \`modal deploy -m backend.vectors\`.

6. Embed the dataset and send the results to Weaviate by invoking \`modal run -m backend.ingest\`. This can take several hours. Use the \`--down-scale\` option to reduce the fraction of the data you ingest. Ten percent (\`--downscale=0.1\`) is enough to get fair results, and 1% or 0.1% will do in a pinch.

</details>

Note that ingesting and indexing Wikipedia takes several hours!
We **highly recommend you proceed with the read-only version first**.

### Run the React frontend locally

Ensure you have a recent version of Node.js and \`npm\` installed.
See the instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

To set up the environment, run \`npm install\` in the \`frontend\` directory.

Create a file called \`.env\` in the \`frontend\` directory and set the value of \`VITE_MODAL_WORKSPACE\` to the name of your Modal Workspace (by default, your GitHub username). See \`.env.example\` for the format.

Now, to run a hot-reloading, local version of the frontend, execute

\`\`\`bash
npm run dev
\`\`\`

and navigate a browser to the URL provided, which should be something like
\`http://localhost:5173\`.

#### Optional: Serve a hot-reloading backend

You can also run the backend with hot reloading
by using \`modal serve\` instead of \`modal deploy\`:

\`\`\`bash
modal serve -m backend.database
\`\`\`

This backend is still hosted on Modal,
but it will automatically reload when you make changes to the code.

It uses a different URL than the deployed version,
with a \`-dev\` appended just before \`.modal.run\`.

You can configure your frontend to use this backend by
setting the \`VITE_DEV_BACKEND\` environment variable in \`.env\` to \`true\`.

### Optional: Deploy the React frontend

If you'd like to share your own version of this app, you'll need to host it somewhere.

We took advantage of
[Vercel's excellent support for React apps](https://vercel.com/guides/deploying-react-with-vercel)
to deploy directly from the GitHub repository.
`,meta:{title:`Embed Wikipedia with Modal and search it with Weaviate`,description:`Embed Wikipedia with Modal and query vector analogies using Weaviate. Combines neural network inference with vector search.`}},{description:h,toc:g,rawContent:_,meta:v}=m,ie=t(`<code>frontend</code>`),ae=t(`<code>backend</code>`),oe=t(`<code>modal.Secret</code>`),se=t(`<code>modal.Secret</code>`),ce=t(`<!> <p><!></p> <p>This sample project demonstrates the powerful combo of serverless infrastructure from <!> and the search capabilities of <!> for projects that combine data-intensive Python compute, like neural network inference,
with data-intensive search, like indexing all of Wikipedia.</p> <p>You can find the code on GitHub <!>.
It’s intended as a jumping off point for your own code that combines
Modal with databases like Weaviate and with JavaScript frontends.
It is also deployed as a <!>.</p> <!> <p>The <!> of this project (written in React, hosted on <!>)
allows users to construct “vector analogies” of the form made famous by <!>.
For example, the approximation</p> <!> <p>expresses the analogy “Kobe Bryant is the Albert Einstein of basketball”.
We can compute it by applying those operations to embedding vectors of each concept,
where <code>~=</code> is implemented using an <!>,
the key method used for querying in vector databases.</p> <p>Where Word2Vec used word embeddings to express concepts, we use snippets of Wikipedia articles.
The dataset used was constructed from the March 2022 WikiMedia dump <!>.</p> <p>Users can type into each search bar to find a snippet of interest,
using Weaviate text search under the hood,
and once they’ve selected the three components of their analogy,
the frontend kicks off a vector search to complete it.</p> <p>Both searches are coordinated by a <!> Python service running on Modal.</p> <p>Modal is also used to construct embeddings for snippets and then insert them into Weaviate.
You can read more about the embedding process <!>.
We also wrote a high level guide to this project <!>.</p> <!> <p>The full, end-to-end version of this project involves a number of services and workflows:</p> <ol><li>A <strong>Vite/React frontend</strong>, to allow users to search for Wikipedia snippets and construct analogies via vector search</li> <li>A <strong>Weaviate database on Weaviate Cloud Services</strong>, to store the Wikipedia snippets and their embeddings and to run both text and vector searches</li> <li>A <strong>serverless Weaviate database client on Modal</strong>, to listen for requests from app clients, run the search logic, and communicate with the database</li> <li>A <strong>vector embedding service on Modal serverless GPUs</strong>, to embed the Wikipedia snippets as vectors</li> <li>An <strong>ingestion workflow on Modal</strong>, to download the Wikipedia dataset, embed it, and send the results to Weaviate</li></ol> <p>To make setup easier, we make it possible to run the search via a read-only client
of our Weaviate database and run the app locally,
which lets you skip the vector embedding and ingestion steps.</p> <!> <p>Set up a Python environment however you like and then install <code>modal</code> with</p> <!> <p>Because Modal runs all of your code in cloud containers, you don’t have to worry
about any other dependencies!</p> <p>If you don’t already have a Modal account, get started with <code>modal setup</code>.</p> <!> <p>Next, we set up a Weaviate client on Modal that reads from a Weaviate database
that has already ingested and indexed the Wikipedia data.</p> <p>Add <code>WCS_URL=https://gzimzbmdr6ycxyja715rsa.c0.us-west4.gcp.weaviate.cloud</code> and <code>WCS_RO_KEY=tUeQG12AkFLBY9SYOWVh2y00hZ25yu8va0UP</code> to a <!> called <code>wiki-weaviate</code>.</p> <p>Then, run the following command from the repo root to create a database client on Modal.</p> <!> <p>This client is <em>serverless</em>, meaning it scales automatically with load,
including scaling down to zero instances when there is no load.
That means you only need to pay for the compute resources you use!</p> <p>You can run queries against the database from your local machine
to test the client logic, for example</p> <!> <p>or you can hit the API directly from your browser or with a tool like <code>curl</code> or Postman.</p> <!> <p>Note that you should replace <code>modal-labs</code> in the URL with your Modal username!</p> <p>This will return a large JSON object with a big vector of floating point numbers attached,
so you might want to pipe it through <code>jq</code> or another JSON formatter:</p> <!> <!> <p>If you’d like to run the entire pipeline yourself, there are several additional steps.</p> <details><summary>Click here to reveal them.</summary> <ol><li><p>Set up a Weaviate database instance via <!>.</p></li> <li><p>Add your <code>WCS_URL</code>, <code>WCS_ADMIN_KEY</code>, and <code>WCS_RO_KEY</code> key to the <code>wiki-weaviate</code> <!>.</p></li> <li><p>Redeploy the new write-authorized Weaviate client for your instance with <code>modal deploy -m backend.database</code>.</p></li> <li><p>Download the Wikipedia dataset from <!> with <code>modal run -m backend.download</code>. This step takes five to ten minutes.</p></li> <li><p>Deploy the (serverless) vector embedding service with <code>modal deploy -m backend.vectors</code>.</p></li> <li><p>Embed the dataset and send the results to Weaviate by invoking <code>modal run -m backend.ingest</code>. This can take several hours. Use the <code>--down-scale</code> option to reduce the fraction of the data you ingest. Ten percent (<code>--downscale=0.1</code>) is enough to get fair results, and 1% or 0.1% will do in a pinch.</p></li></ol></details> <p>Note that ingesting and indexing Wikipedia takes several hours!
We <strong>highly recommend you proceed with the read-only version first</strong>.</p> <!> <p>Ensure you have a recent version of Node.js and <code>npm</code> installed.
See the instructions <!>.</p> <p>To set up the environment, run <code>npm install</code> in the <code>frontend</code> directory.</p> <p>Create a file called <code>.env</code> in the <code>frontend</code> directory and set the value of <code>VITE_MODAL_WORKSPACE</code> to the name of your Modal Workspace (by default, your GitHub username). See <code>.env.example</code> for the format.</p> <p>Now, to run a hot-reloading, local version of the frontend, execute</p> <!> <p>and navigate a browser to the URL provided, which should be something like <code>http://localhost:5173</code>.</p> <!> <p>You can also run the backend with hot reloading
by using <code>modal serve</code> instead of <code>modal deploy</code>:</p> <!> <p>This backend is still hosted on Modal,
but it will automatically reload when you make changes to the code.</p> <p>It uses a different URL than the deployed version,
with a <code>-dev</code> appended just before <code>.modal.run</code>.</p> <p>You can configure your frontend to use this backend by
setting the <code>VITE_DEV_BACKEND</code> environment variable in <code>.env</code> to <code>true</code>.</p> <!> <p>If you’d like to share your own version of this app, you’ll need to host it somewhere.</p> <p>We took advantage of <!> to deploy directly from the GitHub repository.</p>`,1);function y(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ce(),f=o(a);te(f,{id:`embed-wikipedia-with-modal-and-search-it-with-weaviate`,children:(e,t)=>{c(),i(e,r(`Embed Wikipedia with Modal and search it with Weaviate`))},$$slots:{default:!0}});var m=s(f,2);p(e(m),{href:`https://vector-analogies-wikipedia.vercel.app/`,rel:`nofollow`,children:(e,t)=>{re(e,{src:`https://vector-analogies-wikipedia.vercel.app/einstein-bryant.png`,alt:`Albert Einstein - Physics + Basketball ~= Kobe Bryant`})},$$slots:{default:!0}}),n(m);var h=s(m,2),g=s(e(h));p(g,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal`))},$$slots:{default:!0}}),p(s(g,2),{href:`https://weaviate.io`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Weaviate`))},$$slots:{default:!0}}),c(),n(h);var _=s(h,2),v=s(e(_));p(v,{href:`https://github.com/modal-labs/vector-analogies-wikipedia`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),p(s(v,2),{href:`https://vector-analogies-wikipedia.vercel.app/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`live demo application`))},$$slots:{default:!0}}),c(),n(_);var y=s(_,2);l(y,{id:`overview`,children:(e,t)=>{c(),i(e,r(`Overview`))},$$slots:{default:!0}});var b=s(y,2),x=s(e(b));p(x,{href:`https://github.com/modal-labs/vector-analogies-wikipedia/tree/main/frontend`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var S=s(x,2);p(S,{href:`https://vercel.com`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Vercel`))},$$slots:{default:!0}}),p(s(S,2),{href:`https://arxiv.org/abs/1301.3781`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Word2Vec`))},$$slots:{default:!0}}),c(),n(b);var C=s(b,2);d(C,{code:`Albert%20Einstein%20-%20Physics%20%2B%20Basketball%20~%3D%20Kobe%20Bryant`,lang:`text`});var w=s(C,2);p(s(e(w),3),{href:`https://weaviate.io/developers/weaviate/concepts/indexing`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`approximate nearest-neighbor search index`))},$$slots:{default:!0}}),c(),n(w);var T=s(w,2);p(s(e(T)),{href:`https://huggingface.co/datasets/wikipedia`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`by Hugging Face`))},$$slots:{default:!0}}),c(),n(T);var E=s(T,4);p(s(e(E)),{href:`https://github.com/modal-labs/vector-analogies-wikipedia/tree/main/backend`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),c(),n(E);var D=s(E,2),O=s(e(D));p(O,{href:`https://modal.com/blog/embedding-wikipedia`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),p(s(O,2),{href:`https://weaviate.io/blog/modal-and-weaviate`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(D);var k=s(D,2);l(k,{id:`run-it-yourself`,children:(e,t)=>{c(),i(e,r(`Run it yourself`))},$$slots:{default:!0}});var A=s(k,8);u(A,{id:`set-up-a-python-environment`,children:(e,t)=>{c(),i(e,r(`Set up a Python environment`))},$$slots:{default:!0}});var j=s(A,4);d(j,{code:`pip%20install%20modal%3D%3D0.62.140`,lang:`bash`});var M=s(j,6);u(M,{id:`deploy-a-serverless-read-only-weaviate-client-with-modal`,children:(e,t)=>{c(),i(e,r(`Deploy a serverless, read-only Weaviate client with Modal`))},$$slots:{default:!0}});var N=s(M,4);p(s(e(N),5),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),c(3),n(N);var P=s(N,4);d(P,{code:`modal%20deploy%20-m%20backend.database`,lang:`bash`});var F=s(P,6);d(F,{code:`modal%20run%20-m%20backend.database%3A%3AWeaviateClient.query%20--q%3D'Albert%20Einstein'`,lang:`bash`});var I=s(F,4);d(I,{code:`curl%20https%3A%2F%2Fmodal-labs--modal-weaviate-query.modal.run%5C%3Fq%5C%3DAlbert%2520Einstein`,lang:`bash`});var L=s(I,6);d(L,{code:`curl%20https%3A%2F%2Fmodal-labs--modal-weaviate-query.modal.run%5C%3Fq%5C%3DAlbert%2520Einstein%20%5C%0A%20%7C%20jq%20.%20results%5C%5B0%5C%5D.content`,lang:`bash`});var R=s(L,2);u(R,{id:`optional-embed-and-index-wikipedia-yourself`,children:(e,t)=>{c(),i(e,r(`Optional: Embed and index Wikipedia yourself`))},$$slots:{default:!0}});var z=s(R,4),B=s(e(z),2),V=e(B),H=e(V);p(s(e(H)),{href:`https://weaviate.io/developers/weaviate/installation/weaviate-cloud-services`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Weaviate Cloud Services`))},$$slots:{default:!0}}),c(),n(H),n(V);var U=s(V,2),W=e(U);p(s(e(W),9),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),c(),n(W),n(U);var G=s(U,4),K=e(G);p(s(e(K)),{href:`https://huggingface.co/datasets/wikipedia`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Hugging Face`))},$$slots:{default:!0}}),c(3),n(K),n(G),c(4),n(B),n(z);var q=s(z,4);u(q,{id:`run-the-react-frontend-locally`,children:(e,t)=>{c(),i(e,r(`Run the React frontend locally`))},$$slots:{default:!0}});var J=s(q,2);p(s(e(J),3),{href:`https://docs.npmjs.com/downloading-and-installing-node-js-and-npm`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(J);var Y=s(J,8);d(Y,{code:`npm%20run%20dev`,lang:`bash`});var X=s(Y,4);ne(X,{id:`optional-serve-a-hot-reloading-backend`,children:(e,t)=>{c(),i(e,r(`Optional: Serve a hot-reloading backend`))},$$slots:{default:!0}});var Z=s(X,4);d(Z,{code:`modal%20serve%20-m%20backend.database`,lang:`bash`});var Q=s(Z,8);u(Q,{id:`optional-deploy-the-react-frontend`,children:(e,t)=>{c(),i(e,r(`Optional: Deploy the React frontend`))},$$slots:{default:!0}});var $=s(Q,4);p(s(e($)),{href:`https://vercel.com/guides/deploying-react-with-vercel`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Vercel’s excellent support for React apps`))},$$slots:{default:!0}}),c(),n($),i(t,a)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=C2ULVO-P2.js.map
