(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8cb98c9d-cd17-42a1-9fd3-c6dccb19b2c9`,e._sentryDebugIdIdentifier=`sentry-dbid-8cb98c9d-cd17-42a1-9fd3-c6dccb19b2c9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Algolia docsearch crawler`,id:`algolia-docsearch-crawler`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Configure the crawler`,id:`configure-the-crawler`},{depth:2,value:`Create an API key`,id:`create-an-api-key`},{depth:2,value:`The actual function`,id:`the-actual-function`},{depth:2,value:`Deploy the indexer`,id:`deploy-the-indexer`},{depth:2,value:`Entrypoint for development`,id:`entrypoint-for-development`}]}],rawContent:`# Algolia docsearch crawler

This tutorial shows you how to use Modal to run the [Algolia docsearch
crawler](https://docsearch.algolia.com/docs/legacy/run-your-own/) to index your
website and make it searchable. This is not just example code - we run the same
code in production to power search on this page (\`Ctrl+K\` to try it out!).

## Basic setup

Let's get the imports out of the way.

\`\`\`python
import json
import os
import subprocess

import modal

\`\`\`

Modal lets you [use and extend existing Docker images](https://modal.com/docs/guide/custom-container#use-an-existing-container-image-with-from_registry),
as long as they have \`python\` and \`pip\` available. We'll use the official crawler image built by Algolia, with a small
adjustment: since this image has \`python\` symlinked to \`python3.6\` and Modal is not compatible with Python 3.6, we
install Python 3.11 and symlink that as the \`python\` executable instead.

\`\`\`python
algolia_image = modal.Image.from_registry(
    "algolia/docsearch-scraper:v1.16.0",
    add_python="3.11",
    setup_dockerfile_commands=["ENTRYPOINT []"],
)

app = modal.App("example-algolia-indexer")

\`\`\`

## Configure the crawler

Now, let's configure the crawler with the website we want to index, and which
CSS selectors we want to scrape. Complete documentation for crawler configuration is available
[here](https://docsearch.algolia.com/docs/legacy/config-file).

\`\`\`python
CONFIG = {
    "index_name": "modal_docs",
    "custom_settings": {
        "separatorsToIndex": "._",
        "synonyms": [["cls", "class"]],
    },
    "stop_urls": [
        "https://modal.com/docs/reference/modal.Stub",
        "https://modal.com/gpu-glossary",
        "https://modal.com/docs/reference/changelog",
    ],
    "start_urls": [
        {
            "url": "https://modal.com/docs/guide",
            "selectors_key": "default",
            "page_rank": 2,
        },
        {
            "url": "https://modal.com/docs/examples",
            "selectors_key": "examples",
            "page_rank": 1,
        },
        {
            "url": "https://modal.com/docs/sdk/py/latest",
            "selectors_key": "reference",
            "page_rank": 1,
        },
    ],
    "selectors": {
        "default": {
            "lvl0": {
                "selector": "header .navlink-active",
                "global": True,
            },
            "lvl1": "article h1",
            "lvl2": "article h2",
            "lvl3": "article h3",
            "text": "article p,article ol,article ul",
        },
        "examples": {
            "lvl0": {
                "selector": "header .navlink-active",
                "global": True,
            },
            "lvl1": "article h1",
            "text": "article p,article ol,article ul",
        },
        "reference": {
            "lvl0": {
                "selector": "//div[contains(@class, 'sidebar')]//a[contains(@class, 'active')]//preceding::a[contains(@class, 'header')][1]",
                "type": "xpath",
                "global": True,
                "default_value": "",
                "skip": {"when": {"value": ""}},
            },
            "lvl1": "article h1",
            "lvl2": "article h2",
            "lvl3": "article h3",
            "text": "article p,article ol,article ul",
        },
    },
}

\`\`\`

## Create an API key

If you don't already have one, sign up for an account on [Algolia](https://www.algolia.com/). Set up
a project and create an API key with \`write\` access to your index, and with the ACL permissions
\`addObject\`, \`editSettings\` and \`deleteIndex\`. Now, create a Secret on the Modal [Secrets](https://modal.com/secrets)
page with the \`API_KEY\` and \`APPLICATION_ID\` you just created. You can name this anything you want,
but we named it \`algolia-secret\` and so that's what the code below expects.

## The actual function

We want to trigger our crawler from our CI/CD pipeline, so we're serving it as a
[Web Function](https://modal.com/docs/guide/webhooks) that can be triggered by a \`GET\` request during deploy.
You could also consider running the crawler on a [schedule](https://modal.com/docs/guide/cron).

The Algolia crawler is written for Python 3.6 and needs to run in the \`pipenv\` created for it,
so we're invoking it using a subprocess.

\`\`\`python
@app.function(
    image=algolia_image,
    secrets=[modal.Secret.from_name("algolia-secret")],
)
def crawl():
    # Installed with a 3.6 venv; Python 3.6 is unsupported by Modal, so use a subprocess instead.
    subprocess.run(
        ["pipenv", "run", "python", "-m", "src.index"],
        env={**os.environ, "CONFIG": json.dumps(CONFIG)},
    )


\`\`\`

We want to be able to trigger this function through a webhook.

\`\`\`python
@app.function(image=modal.Image.debian_slim().uv_pip_install("fastapi[standard]"))
@modal.fastapi_endpoint()
def crawl_webhook():
    crawl.remote()
    return "Finished indexing docs"


\`\`\`

## Deploy the indexer

That's all the code we need! To deploy your application, run

\`\`\`shell
modal deploy algolia_indexer.py
\`\`\`

If successful, this will print a URL for your new webhook, that you can hit using
\`curl\` or a browser. Logs from webhook invocations can be found from the [apps](https://modal.com/apps)
page.

The indexed contents can be found at https://www.algolia.com/apps/APP_ID/explorer/browse/, for your
APP_ID. Once you're happy with the results, you can [set up the \`docsearch\` package with your
website](https://docsearch.algolia.com/docs/docsearch-v3/), and create a search component that uses this index.

## Entrypoint for development

To make it easier to test this, we also have an entrypoint for when you run
\`modal run algolia_indexer.py\`

\`\`\`python
@app.local_entrypoint()
def run():
    crawl.remote()

\`\`\`
`,meta:{title:`Algolia docsearch crawler`,description:`This tutorial shows you how to use Modal to run the Algolia docsearch crawler to index your website and make it searchable. This is not just example code - we run the same code in production to power search on this page (Ctrl+K to try it out!).`}},{toc:g,rawContent:_,meta:v}=h,y=t(`set up the <code>docsearch</code> package with your
website`,1),b=t(`<!> <p>This tutorial shows you how to use Modal to run the <!> to index your
website and make it searchable. This is not just example code - we run the same
code in production to power search on this page (<code>Ctrl+K</code> to try it out!).</p> <!> <p>Let’s get the imports out of the way.</p> <!> <p>Modal lets you <!>,
as long as they have <code>python</code> and <code>pip</code> available. We’ll use the official crawler image built by Algolia, with a small
adjustment: since this image has <code>python</code> symlinked to <code>python3.6</code> and Modal is not compatible with Python 3.6, we
install Python 3.11 and symlink that as the <code>python</code> executable instead.</p> <!> <!> <p>Now, let’s configure the crawler with the website we want to index, and which
CSS selectors we want to scrape. Complete documentation for crawler configuration is available <!>.</p> <!> <!> <p>If you don’t already have one, sign up for an account on <!>. Set up
a project and create an API key with <code>write</code> access to your index, and with the ACL permissions <code>addObject</code>, <code>editSettings</code> and <code>deleteIndex</code>. Now, create a Secret on the Modal <!> page with the <code>API_KEY</code> and <code>APPLICATION_ID</code> you just created. You can name this anything you want,
but we named it <code>algolia-secret</code> and so that’s what the code below expects.</p> <!> <p>We want to trigger our crawler from our CI/CD pipeline, so we’re serving it as a <!> that can be triggered by a <code>GET</code> request during deploy.
You could also consider running the crawler on a <!>.</p> <p>The Algolia crawler is written for Python 3.6 and needs to run in the <code>pipenv</code> created for it,
so we’re invoking it using a subprocess.</p> <!> <p>We want to be able to trigger this function through a webhook.</p> <!> <!> <p>That’s all the code we need! To deploy your application, run</p> <!> <p>If successful, this will print a URL for your new webhook, that you can hit using <code>curl</code> or a browser. Logs from webhook invocations can be found from the <!> page.</p> <p>The indexed contents can be found at <!>, for your
APP_ID. Once you’re happy with the results, you can <!>, and create a search component that uses this index.</p> <!> <p>To make it easier to test this, we also have an entrypoint for when you run <code>modal run algolia_indexer.py</code></p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`algolia-docsearch-crawler`,children:(e,t)=>{l(),i(e,r(`Algolia docsearch crawler`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://docsearch.algolia.com/docs/legacy/run-your-own/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Algolia docsearch
crawler`))},$$slots:{default:!0}}),l(3),n(h);var g=c(h,2);u(g,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`import%20json%0Aimport%20os%0Aimport%20subprocess%0A%0Aimport%20modal%0A`,lang:`python`});var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/guide/custom-container#use-an-existing-container-image-with-from_registry`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`use and extend existing Docker images`))},$$slots:{default:!0}}),l(11),n(v);var x=c(v,2);f(x,{code:`algolia_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22algolia%2Fdocsearch-scraper%3Av1.16.0%22%2C%0A%20%20%20%20add_python%3D%223.11%22%2C%0A%20%20%20%20setup_dockerfile_commands%3D%5B%22ENTRYPOINT%20%5B%5D%22%5D%2C%0A)%0A%0Aapp%20%3D%20modal.App(%22example-algolia-indexer%22)%0A`,lang:`python`});var S=c(x,2);u(S,{id:`configure-the-crawler`,children:(e,t)=>{l(),i(e,r(`Configure the crawler`))},$$slots:{default:!0}});var C=c(S,2);m(c(e(C)),{href:`https://docsearch.algolia.com/docs/legacy/config-file`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);f(w,{code:`CONFIG%20%3D%20%7B%0A%20%20%20%20%22index_name%22%3A%20%22modal_docs%22%2C%0A%20%20%20%20%22custom_settings%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22separatorsToIndex%22%3A%20%22._%22%2C%0A%20%20%20%20%20%20%20%20%22synonyms%22%3A%20%5B%5B%22cls%22%2C%20%22class%22%5D%5D%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20%22stop_urls%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fmodal.com%2Fdocs%2Freference%2Fmodal.Stub%22%2C%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fmodal.com%2Fgpu-glossary%22%2C%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fmodal.com%2Fdocs%2Freference%2Fchangelog%22%2C%0A%20%20%20%20%5D%2C%0A%20%20%20%20%22start_urls%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fmodal.com%2Fdocs%2Fguide%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22selectors_key%22%3A%20%22default%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22page_rank%22%3A%202%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fmodal.com%2Fdocs%2Fexamples%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22selectors_key%22%3A%20%22examples%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22page_rank%22%3A%201%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fmodal.com%2Fdocs%2Fsdk%2Fpy%2Flatest%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22selectors_key%22%3A%20%22reference%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22page_rank%22%3A%201%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%5D%2C%0A%20%20%20%20%22selectors%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22default%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl0%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22selector%22%3A%20%22header%20.navlink-active%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22global%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl1%22%3A%20%22article%20h1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl2%22%3A%20%22article%20h2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl3%22%3A%20%22article%20h3%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text%22%3A%20%22article%20p%2Carticle%20ol%2Carticle%20ul%22%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22examples%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl0%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22selector%22%3A%20%22header%20.navlink-active%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22global%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl1%22%3A%20%22article%20h1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text%22%3A%20%22article%20p%2Carticle%20ol%2Carticle%20ul%22%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22reference%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl0%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22selector%22%3A%20%22%2F%2Fdiv%5Bcontains(%40class%2C%20'sidebar')%5D%2F%2Fa%5Bcontains(%40class%2C%20'active')%5D%2F%2Fpreceding%3A%3Aa%5Bcontains(%40class%2C%20'header')%5D%5B1%5D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22xpath%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22global%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22default_value%22%3A%20%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22skip%22%3A%20%7B%22when%22%3A%20%7B%22value%22%3A%20%22%22%7D%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl1%22%3A%20%22article%20h1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl2%22%3A%20%22article%20h2%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22lvl3%22%3A%20%22article%20h3%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text%22%3A%20%22article%20p%2Carticle%20ol%2Carticle%20ul%22%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D%2C%0A%7D%0A`,lang:`python`});var T=c(w,2);u(T,{id:`create-an-api-key`,children:(e,t)=>{l(),i(e,r(`Create an API key`))},$$slots:{default:!0}});var E=c(T,2),D=c(e(E));m(D,{href:`https://www.algolia.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Algolia`))},$$slots:{default:!0}}),m(c(D,10),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}}),l(7),n(E);var O=c(E,2);u(O,{id:`the-actual-function`,children:(e,t)=>{l(),i(e,r(`The actual function`))},$$slots:{default:!0}});var k=c(O,2),A=c(e(k));m(A,{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Web Function`))},$$slots:{default:!0}}),m(c(A,4),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`schedule`))},$$slots:{default:!0}}),l(),n(k);var j=c(k,4);f(j,{code:`%40app.function(%0A%20%20%20%20image%3Dalgolia_image%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22algolia-secret%22)%5D%2C%0A)%0Adef%20crawl()%3A%0A%20%20%20%20%23%20Installed%20with%20a%203.6%20venv%3B%20Python%203.6%20is%20unsupported%20by%20Modal%2C%20so%20use%20a%20subprocess%20instead.%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%22pipenv%22%2C%20%22run%22%2C%20%22python%22%2C%20%22-m%22%2C%20%22src.index%22%5D%2C%0A%20%20%20%20%20%20%20%20env%3D%7B**os.environ%2C%20%22CONFIG%22%3A%20json.dumps(CONFIG)%7D%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var M=c(j,4);f(M,{code:`%40app.function(image%3Dmodal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint()%0Adef%20crawl_webhook()%3A%0A%20%20%20%20crawl.remote()%0A%20%20%20%20return%20%22Finished%20indexing%20docs%22%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`deploy-the-indexer`,children:(e,t)=>{l(),i(e,r(`Deploy the indexer`))},$$slots:{default:!0}});var P=c(N,4);f(P,{code:`modal%20deploy%20algolia_indexer.py`,lang:`shell`});var F=c(P,2);m(c(e(F),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`apps`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2),L=c(e(I));m(L,{href:`https://www.algolia.com/apps/APP_ID/explorer/browse/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://www.algolia.com/apps/APP_ID/explorer/browse/`))},$$slots:{default:!0}}),m(c(L,2),{href:`https://docsearch.algolia.com/docs/docsearch-v3/`,rel:`nofollow`,children:(e,t)=>{l();var n=y();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(I);var R=c(I,2);u(R,{id:`entrypoint-for-development`,children:(e,t)=>{l(),i(e,r(`Entrypoint for development`))},$$slots:{default:!0}}),f(c(R,4),{code:`%40app.local_entrypoint()%0Adef%20run()%3A%0A%20%20%20%20crawl.remote()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=CC_Cmi7P.js.map
