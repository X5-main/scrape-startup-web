(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0b7e479e-7e0a-4d97-8ecb-d192039891de`,e._sentryDebugIdIdentifier=`sentry-dbid-0b7e479e-7e0a-4d97-8ecb-d192039891de`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Using MongoDB Atlas Vector and GeoJSON Search with Modal`,id:`using-mongodb-atlas-vector-and-geojson-search-with-modal`,children:[{depth:2,value:`Overview`,id:`overview`},{depth:2,value:`Deploying the Backend`,id:`deploying-the-backend`,children:[{depth:3,value:`Setup: Modal and MongoDB Atlas`,id:`setup-modal-and-mongodb-atlas`},{depth:3,value:`MongoDB Client (database.py)`,id:`mongodb-client-databasepy`},{depth:3,value:`Backfill and Updates (extract.py)`,id:`backfill-and-updates-extractpy`},{depth:3,value:`Clay Embeddings Service (embeddings.py)`,id:`clay-embeddings-service-embeddingspy`},{depth:3,value:`Putting It All Together`,id:`putting-it-all-together`}]},{depth:2,value:`Deploying the Frontend`,id:`deploying-the-frontend`,children:[{depth:3,value:`Alpine App (app.js)`,id:`alpine-app-appjs`},{depth:3,value:`FastAPI Server (serve.py)`,id:`fastapi-server-servepy`}]}]}],rawContent:`# Using MongoDB Atlas Vector and GeoJSON Search with Modal

This [example repo](https://github.com/modal-labs/search-california)
demonstrates how to use Modal and MongoDB together
to build a full-stack application.

The application is a hybrid search engine,
like the retrieval engines that power RAG chatbots,
but for satellite images of the state of California.
Images can be searched based on their
geospatial and temporal metadata or based on their semantic content
as captured by a pre-trained embedding model.

We use the [Clay foundation model](https://clay-foundation.github.io/model/index.html)
for embeddings and we source the images from the European Space Agency's
[Sentinel satellites](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions).

You can take our deployment of the application for a spin
[here](https://modal-labs-examples--clay-hybrid-search.modal.run/).

## Overview

At the center of the application is a MongoDB Atlas instance
that stores metadata for a collection of satellite images.

Modal orchestrates the compute around that database:
retrieving data from elsewhere and storing it in the database,
computing vector embeddings for the data in the database,
and serving both a frontend and a client.

The dataflow looks something like this:

1. Every few days, the European Space Agency's
   [Sentinel Satellites](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions)
   complete a full pass over the entire Earth, including California.
   The images are made available via a [public STAC API](https://element84.com/geospatial/introducing-earth-search-v1-new-datasets-now-available/).
2. Every day, we run a job on Modal that queries that STAC API
   for new images of California and store the metadata in a MongoDB Atlas
   database instance.
3. Asynchronously, we run a job on Modal to check which entries
   in the database don't have an associated embedding.
   These images are then sent to a serverless embedding service
   running on Modal. We send the resulting embeddings to the database.
4. We host a database client on Modal that allows the application's
   developers to manipulate the data. This client is also used by two
   Web Functions for vector and geospatial search queries powered by
   Atlas Search.
5. Finally, we run a simple static FastAPI server on Modal that serves
   an Alpine JS frontend for executing those queries and rendering their results.

This entire application —
from API queries and frontend UI to GPU inference and hybrid search —
is delivered using nothing but Modal and MongoDB Atlas.
Setting it up for yourself requires only credentials on these platforms
and a few commands, detailed below.

## Deploying the Backend

### Setup: Modal and MongoDB Atlas

You'll need a Python environment on your local machine.
Any recent version of Python should do.
Most of the dependencies will be installed in environments on Modal,
so you don't need to worry quite so much.

Follow the instructions [here](https://modal.com/docs/guide#getting-started)
to set up your Modal account.
The $30/month of compute included in Modal's free tier is
more than enough to deploy and host this example.

You'll also need an account on MongoDB Atlas.
You can find instructions [here](https://www.mongodb.com/docs/atlas/getting-started/).
We prefer the UI, rather than the CLI, for setup.
The free tier is more than sufficient to run this example.

You'll want to create a database called \`modal-examples\`.
Make sure it's accessible from [all IP addresses](https://stackoverflow.com/questions/66035947/allow-access-from-anywhere-mongodb-atlas).
In the process, you will create a database user with a password.
Navigate to the Modal Secrets dashboard [here](https://modal.com/secrets)
and add this information, as well as the connection string for your database,
to a Modal Secret based on the MongoDB template available in the dashboard.

### MongoDB Client (\`database.py\`)

If your Modal Secret and MongoDB Atlas instance are set up correctly,
you should be able to run the following command:

\`\`\`bash
modal run -m backend.database::MongoClient.ping
\`\`\`

Once that command is working, you can start manipulating the database
from Modal.

To start, you'll want to add an Area of Interest (AOI) to the database:

\`\`\`bash
modal run -m backend.database --action add_aoi
\`\`\`

By default, it's the state of California as defined by the GeoJSON
in this repository's \`data\` folder (originally retrieved from
[the \`geojsonio\` GitHub repository](https://github.com/ropensci/geojsonio/blob/7e4cc683ed3d6eec38a8cae5ce03fa6d82acafc7/inst/examples/california.geojson)).
You can pass a different GeoJSON file to the \`add_aoi\` action
with the \`--target\` flag.

The \`modal run\` command is used for one-off tasks.
To deploy the database client for use in other parts of the app
along with the webhooks that anyone can use to run search queries,
we use \`modal deploy\`:

\`\`\`bash
modal deploy -m backend.database
\`\`\`

Those webhooks come with interactive OpenAPI docs,
which you can access by navigating to the \`/docs\` route of the deployment's URL.
You should see that URL in the terminal output.
You can also find the URL in the app's [Modal dashboard](https://modal.com/apps).

For our deployment, the URL for the interactive docs for the geographic
search endpoint is
[\`https://modal-labs-examples--clay-mongo-client-geo-search.modal.run/docs\`](https://modal-labs-examples--clay-mongo-client-geo-search.modal.run/docs).

If you haven't yet run the backfill jobs for your database instance,
as described below, this search will not return any results,
but you can use it to check that the database client is deployed.

### Backfill and Updates (\`extract.py\`)

We add data to the database by querying the Sentinel STAC API for images.

Run the following command to search for images in the AOI
from the preceding week and add them to the database:

\`\`\`bash
modal run -m backend.extract
\`\`\`

You can either check the results via the Atlas UI
or by executing a search query in the database client's geo search webhook,
as described above.

To regularly update the database with new images,
we deploy the app defined in \`extract.py\`:

\`\`\`bash
modal deploy -m backend.extract
\`\`\`

This app also runs a regular job to add embeddings to the images
in the database.

But it doesn't compute the embeddings itself --
embeddings are provided by a separate service,
which is described next.

### Clay Embeddings Service (\`embeddings.py\`)

To build the environment for the embeddings service
and to test the embedding engine on some sample data,
execute the following command:

\`\`\`bash
modal run -m backend.embeddings
\`\`\`

To deploy this on Modal, we again use \`modal deploy\`:

\`\`\`bash
modal deploy -m backend.embeddings
\`\`\`

### Putting It All Together

Now that the embedding service is deployed,
we can add vectors by invoking the \`enrich_vectors\`
function in \`extract\` with \`modal run\`:

\`\`\`bash
modal run -m backend.extract::enrich_vectors
\`\`\`

This command will ensure all the images in the database have embeddings.

You should be able to observe them on records viewed via the Atlas UI
or by executing a search query via the database client's geo search webhook,
as described previously.

To use the embeddings for search, we recommend running the frontend UI,
which we walk through next.

## Deploying the Frontend

The frontend is much simpler than the backend.
It comprises a small Alpine JS app and a FastAPI Python server
to deliver it to client browsers.

You can play with our deployment of the frontend
[here](https://modal-labs-examples--clay-hybrid-search.modal.run/).

### Alpine App (\`app.js\`)

The Alpine app provides a basic interface for constructing geo search queries
by clicking on a map and viewing results.
Clicking on the returned images triggers a vector search for similar images.
Images can be furthermore filtered by date using the date pickers.

### FastAPI Server (\`serve.py\`)

This app is served to the client by a FastAPI server.

To deploy it, run the following command:

\`\`\`bash
modal deploy -m frontend
\`\`\`
`,meta:{title:`Using MongoDB Atlas Vector and GeoJSON Search with Modal`,description:`This example repo demonstrates how to use Modal and MongoDB together to build a full-stack application.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`MongoDB Client (<code>database.py</code>)`,1),x=t(`the <code>geojsonio</code> GitHub repository`,1),S=t(`<code>https://modal-labs-examples--clay-mongo-client-geo-search.modal.run/docs</code>`),C=t(`Backfill and Updates (<code>extract.py</code>)`,1),ee=t(`Clay Embeddings Service (<code>embeddings.py</code>)`,1),te=t(`Alpine App (<code>app.js</code>)`,1),ne=t(`FastAPI Server (<code>serve.py</code>)`,1),w=t(`<!> <p>This <!> demonstrates how to use Modal and MongoDB together
to build a full-stack application.</p> <p>The application is a hybrid search engine,
like the retrieval engines that power RAG chatbots,
but for satellite images of the state of California.
Images can be searched based on their
geospatial and temporal metadata or based on their semantic content
as captured by a pre-trained embedding model.</p> <p>We use the <!> for embeddings and we source the images from the European Space Agency’s <!>.</p> <p>You can take our deployment of the application for a spin <!>.</p> <!> <p>At the center of the application is a MongoDB Atlas instance
that stores metadata for a collection of satellite images.</p> <p>Modal orchestrates the compute around that database:
retrieving data from elsewhere and storing it in the database,
computing vector embeddings for the data in the database,
and serving both a frontend and a client.</p> <p>The dataflow looks something like this:</p> <ol><li>Every few days, the European Space Agency’s <!> complete a full pass over the entire Earth, including California.
The images are made available via a <!>.</li> <li>Every day, we run a job on Modal that queries that STAC API
for new images of California and store the metadata in a MongoDB Atlas
database instance.</li> <li>Asynchronously, we run a job on Modal to check which entries
in the database don’t have an associated embedding.
These images are then sent to a serverless embedding service
running on Modal. We send the resulting embeddings to the database.</li> <li>We host a database client on Modal that allows the application’s
developers to manipulate the data. This client is also used by two
Web Functions for vector and geospatial search queries powered by
Atlas Search.</li> <li>Finally, we run a simple static FastAPI server on Modal that serves
an Alpine JS frontend for executing those queries and rendering their results.</li></ol> <p>This entire application —
from API queries and frontend UI to GPU inference and hybrid search —
is delivered using nothing but Modal and MongoDB Atlas.
Setting it up for yourself requires only credentials on these platforms
and a few commands, detailed below.</p> <!> <!> <p>You’ll need a Python environment on your local machine.
Any recent version of Python should do.
Most of the dependencies will be installed in environments on Modal,
so you don’t need to worry quite so much.</p> <p>Follow the instructions <!> to set up your Modal account.
The $30/month of compute included in Modal’s free tier is
more than enough to deploy and host this example.</p> <p>You’ll also need an account on MongoDB Atlas.
You can find instructions <!>.
We prefer the UI, rather than the CLI, for setup.
The free tier is more than sufficient to run this example.</p> <p>You’ll want to create a database called <code>modal-examples</code>.
Make sure it’s accessible from <!>.
In the process, you will create a database user with a password.
Navigate to the Modal Secrets dashboard <!> and add this information, as well as the connection string for your database,
to a Modal Secret based on the MongoDB template available in the dashboard.</p> <!> <p>If your Modal Secret and MongoDB Atlas instance are set up correctly,
you should be able to run the following command:</p> <!> <p>Once that command is working, you can start manipulating the database
from Modal.</p> <p>To start, you’ll want to add an Area of Interest (AOI) to the database:</p> <!> <p>By default, it’s the state of California as defined by the GeoJSON
in this repository’s <code>data</code> folder (originally retrieved from <!>).
You can pass a different GeoJSON file to the <code>add_aoi</code> action
with the <code>--target</code> flag.</p> <p>The <code>modal run</code> command is used for one-off tasks.
To deploy the database client for use in other parts of the app
along with the webhooks that anyone can use to run search queries,
we use <code>modal deploy</code>:</p> <!> <p>Those webhooks come with interactive OpenAPI docs,
which you can access by navigating to the <code>/docs</code> route of the deployment’s URL.
You should see that URL in the terminal output.
You can also find the URL in the app’s <!>.</p> <p>For our deployment, the URL for the interactive docs for the geographic
search endpoint is <!>.</p> <p>If you haven’t yet run the backfill jobs for your database instance,
as described below, this search will not return any results,
but you can use it to check that the database client is deployed.</p> <!> <p>We add data to the database by querying the Sentinel STAC API for images.</p> <p>Run the following command to search for images in the AOI
from the preceding week and add them to the database:</p> <!> <p>You can either check the results via the Atlas UI
or by executing a search query in the database client’s geo search webhook,
as described above.</p> <p>To regularly update the database with new images,
we deploy the app defined in <code>extract.py</code>:</p> <!> <p>This app also runs a regular job to add embeddings to the images
in the database.</p> <p>But it doesn’t compute the embeddings itself —
embeddings are provided by a separate service,
which is described next.</p> <!> <p>To build the environment for the embeddings service
and to test the embedding engine on some sample data,
execute the following command:</p> <!> <p>To deploy this on Modal, we again use <code>modal deploy</code>:</p> <!> <!> <p>Now that the embedding service is deployed,
we can add vectors by invoking the <code>enrich_vectors</code> function in <code>extract</code> with <code>modal run</code>:</p> <!> <p>This command will ensure all the images in the database have embeddings.</p> <p>You should be able to observe them on records viewed via the Atlas UI
or by executing a search query via the database client’s geo search webhook,
as described previously.</p> <p>To use the embeddings for search, we recommend running the frontend UI,
which we walk through next.</p> <!> <p>The frontend is much simpler than the backend.
It comprises a small Alpine JS app and a FastAPI Python server
to deliver it to client browsers.</p> <p>You can play with our deployment of the frontend <!>.</p> <!> <p>The Alpine app provides a basic interface for constructing geo search queries
by clicking on a map and viewing results.
Clicking on the returned images triggers a vector search for similar images.
Images can be furthermore filtered by date using the date pickers.</p> <!> <p>This app is served to the client by a FastAPI server.</p> <p>To deploy it, run the following command:</p> <!>`,1);function T(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=w(),m=s(o);f(m,{id:`using-mongodb-atlas-vector-and-geojson-search-with-modal`,children:(e,t)=>{l(),i(e,r(`Using MongoDB Atlas Vector and GeoJSON Search with Modal`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://github.com/modal-labs/search-california`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`example repo`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,4),v=c(e(_));h(v,{href:`https://clay-foundation.github.io/model/index.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Clay foundation model`))},$$slots:{default:!0}}),h(c(v,2),{href:`https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sentinel satellites`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,2);h(c(e(y)),{href:`https://modal-labs-examples--clay-hybrid-search.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(y);var T=c(y,2);u(T,{id:`overview`,children:(e,t)=>{l(),i(e,r(`Overview`))},$$slots:{default:!0}});var E=c(T,8),D=e(E),O=c(e(D));h(O,{href:`https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sentinel Satellites`))},$$slots:{default:!0}}),h(c(O,2),{href:`https://element84.com/geospatial/introducing-earth-search-v1-new-datasets-now-available/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`public STAC API`))},$$slots:{default:!0}}),l(),n(D),l(8),n(E);var k=c(E,4);u(k,{id:`deploying-the-backend`,children:(e,t)=>{l(),i(e,r(`Deploying the Backend`))},$$slots:{default:!0}});var A=c(k,2);d(A,{id:`setup-modal-and-mongodb-atlas`,children:(e,t)=>{l(),i(e,r(`Setup: Modal and MongoDB Atlas`))},$$slots:{default:!0}});var j=c(A,4);h(c(e(j)),{href:`https://modal.com/docs/guide#getting-started`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);h(c(e(M)),{href:`https://www.mongodb.com/docs/atlas/getting-started/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2),P=c(e(N),3);h(P,{href:`https://stackoverflow.com/questions/66035947/allow-access-from-anywhere-mongodb-atlas`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`all IP addresses`))},$$slots:{default:!0}}),h(c(P,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,2);d(F,{id:`mongodb-client-databasepy`,children:(e,t)=>{l();var n=b();l(2),i(e,n)},$$slots:{default:!0}});var I=c(F,4);p(I,{code:`modal%20run%20-m%20backend.database%3A%3AMongoClient.ping`,lang:`bash`});var L=c(I,6);p(L,{code:`modal%20run%20-m%20backend.database%20--action%20add_aoi`,lang:`bash`});var R=c(L,2);h(c(e(R),3),{href:`https://github.com/ropensci/geojsonio/blob/7e4cc683ed3d6eec38a8cae5ce03fa6d82acafc7/inst/examples/california.geojson`,rel:`nofollow`,children:(e,t)=>{l();var n=x();l(2),i(e,n)},$$slots:{default:!0}}),l(5),n(R);var z=c(R,4);p(z,{code:`modal%20deploy%20-m%20backend.database`,lang:`bash`});var B=c(z,2);h(c(e(B),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);h(c(e(V)),{href:`https://modal-labs-examples--clay-mongo-client-geo-search.modal.run/docs`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(V);var H=c(V,4);d(H,{id:`backfill-and-updates-extractpy`,children:(e,t)=>{l();var n=C();l(2),i(e,n)},$$slots:{default:!0}});var U=c(H,6);p(U,{code:`modal%20run%20-m%20backend.extract`,lang:`bash`});var W=c(U,6);p(W,{code:`modal%20deploy%20-m%20backend.extract`,lang:`bash`});var G=c(W,6);d(G,{id:`clay-embeddings-service-embeddingspy`,children:(e,t)=>{l();var n=ee();l(2),i(e,n)},$$slots:{default:!0}});var K=c(G,4);p(K,{code:`modal%20run%20-m%20backend.embeddings`,lang:`bash`});var q=c(K,4);p(q,{code:`modal%20deploy%20-m%20backend.embeddings`,lang:`bash`});var J=c(q,2);d(J,{id:`putting-it-all-together`,children:(e,t)=>{l(),i(e,r(`Putting It All Together`))},$$slots:{default:!0}});var Y=c(J,4);p(Y,{code:`modal%20run%20-m%20backend.extract%3A%3Aenrich_vectors`,lang:`bash`});var X=c(Y,8);u(X,{id:`deploying-the-frontend`,children:(e,t)=>{l(),i(e,r(`Deploying the Frontend`))},$$slots:{default:!0}});var Z=c(X,4);h(c(e(Z)),{href:`https://modal-labs-examples--clay-hybrid-search.modal.run/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(Z);var Q=c(Z,2);d(Q,{id:`alpine-app-appjs`,children:(e,t)=>{l();var n=te();l(2),i(e,n)},$$slots:{default:!0}});var $=c(Q,4);d($,{id:`fastapi-server-servepy`,children:(e,t)=>{l();var n=ne();l(2),i(e,n)},$$slots:{default:!0}}),p(c($,6),{code:`modal%20deploy%20-m%20frontend`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{T as default,g as metadata};
//# sourceMappingURL=BaBL_DPC.js.map
