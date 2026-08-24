(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3fe6760c-a749-4875-b225-d60ead349e4e`,e._sentryDebugIdIdentifier=`sentry-dbid-3fe6760c-a749-4875-b225-d60ead349e4e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g=`/_app/immutable/assets/badges_deploy.CJEG88kT.png`,_={toc:[{depth:1,value:`Serve a dynamic SVG badge`,id:`serve-a-dynamic-svg-badge`,children:[{depth:2,value:`Defining the Web Function`,id:`defining-the-web-function`},{depth:2,value:`Running and deploying`,id:`running-and-deploying`}]}],rawContent:`# Serve a dynamic SVG badge

In this example, we use Modal's [webhook](https://modal.com/docs/guide/webhooks) capability to host a dynamic SVG badge that shows
you the current number of downloads for a Python package.

First let's start off by creating a Modal app, and defining an image with the Python packages we're going to be using:

\`\`\`python
import modal

image = modal.Image.debian_slim().uv_pip_install(
    "fastapi[standard]", "pybadges", "pypistats"
)

app = modal.App("example-badges", image=image)

\`\`\`

## Defining the Web Function

In addition to using \`@app.function()\` to decorate our function, we use the
[\`@modal.fastapi_endpoint\` decorator](https://modal.com/docs/guide/webhooks)
which instructs Modal to create a REST endpoint that serves this function.
Note that the default method is \`GET\`, but this can be overridden using the \`method\` argument.

\`\`\`python
@app.function()
@modal.fastapi_endpoint()
async def package_downloads(package_name: str):
    import json

    import pypistats
    from fastapi import Response
    from pybadges import badge

    stats = json.loads(pypistats.recent(package_name, format="json"))
    svg = badge(
        left_text=f"{package_name} downloads",
        right_text=str(stats["data"]["last_month"]),
        right_color="blue",
    )

    return Response(content=svg, media_type="image/svg+xml")


\`\`\`

In this function, we use \`pypistats\` to query the most recent stats for our package, and then
use that as the text for a SVG badge, rendered using \`pybadges\`.
Since Modal Web Functions are FastAPI path operation functions under the hood, we return this SVG wrapped in a FastAPI response with the correct media type.
Also note that FastAPI automatically interprets \`package_name\` as a [query param](https://fastapi.tiangolo.com/tutorial/query-params/).

## Running and deploying

We can now run an ephemeral app on the command line using:

\`\`\`shell
modal serve badges.py
\`\`\`

This will create a short-lived web url that exists until you terminate the script.
It will also hot-reload the code if you make changes to it.

If you want to create a persistent URL, you have to deploy the script.
To deploy using the Modal CLI by running \`modal deploy badges.py\`,

Either way, as soon as we run this command, Modal gives us the link to our brand new
Web Function in the output:

![web badge deployment](./badges_deploy.png)

We can now visit the link using a web browser, using a \`package_name\` of our choice in the URL query params.
For example:
- \`https://YOUR_SUBDOMAIN.modal.run/?package_name=synchronicity\`
- \`https://YOUR_SUBDOMAIN.modal.run/?package_name=torch\`
`,meta:{title:`Serve a dynamic SVG badge`,description:`In this example, we use Modal’s webhook capability to host a dynamic SVG badge that shows you the current number of downloads for a Python package.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<code>@modal.fastapi_endpoint</code> decorator`,1),S=t(`<!> <p>In this example, we use Modal’s <!> capability to host a dynamic SVG badge that shows
you the current number of downloads for a Python package.</p> <p>First let’s start off by creating a Modal app, and defining an image with the Python packages we’re going to be using:</p> <!> <!> <p>In addition to using <code>@app.function()</code> to decorate our function, we use the <!> which instructs Modal to create a REST endpoint that serves this function.
Note that the default method is <code>GET</code>, but this can be overridden using the <code>method</code> argument.</p> <!> <p>In this function, we use <code>pypistats</code> to query the most recent stats for our package, and then
use that as the text for a SVG badge, rendered using <code>pybadges</code>.
Since Modal Web Functions are FastAPI path operation functions under the hood, we return this SVG wrapped in a FastAPI response with the correct media type.
Also note that FastAPI automatically interprets <code>package_name</code> as a <!>.</p> <!> <p>We can now run an ephemeral app on the command line using:</p> <!> <p>This will create a short-lived web url that exists until you terminate the script.
It will also hot-reload the code if you make changes to it.</p> <p>If you want to create a persistent URL, you have to deploy the script.
To deploy using the Modal CLI by running <code>modal deploy badges.py</code>,</p> <p>Either way, as soon as we run this command, Modal gives us the link to our brand new
Web Function in the output:</p> <p><!></p> <p>We can now visit the link using a web browser, using a <code>package_name</code> of our choice in the URL query params.
For example:</p> <ul><li><code>https://YOUR_SUBDOMAIN.modal.run/?package_name=synchronicity</code></li> <li><code>https://YOUR_SUBDOMAIN.modal.run/?package_name=torch</code></li></ul>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),m=s(o);d(m,{id:`serve-a-dynamic-svg-badge`,children:(e,t)=>{l(),i(e,r(`Serve a dynamic SVG badge`))},$$slots:{default:!0}});var _=c(m,2);h(c(e(_)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`webhook`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);p(v,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%22%2C%20%22pybadges%22%2C%20%22pypistats%22%0A)%0A%0Aapp%20%3D%20modal.App(%22example-badges%22%2C%20image%3Dimage)%0A`,lang:`python`});var y=c(v,2);u(y,{id:`defining-the-web-function`,children:(e,t)=>{l(),i(e,r(`Defining the Web Function`))},$$slots:{default:!0}});var b=c(y,2);h(c(e(b),3),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{var n=x();l(),i(e,n)},$$slots:{default:!0}}),l(5),n(b);var C=c(b,2);p(C,{code:`%40app.function()%0A%40modal.fastapi_endpoint()%0Aasync%20def%20package_downloads(package_name%3A%20str)%3A%0A%20%20%20%20import%20json%0A%0A%20%20%20%20import%20pypistats%0A%20%20%20%20from%20fastapi%20import%20Response%0A%20%20%20%20from%20pybadges%20import%20badge%0A%0A%20%20%20%20stats%20%3D%20json.loads(pypistats.recent(package_name%2C%20format%3D%22json%22))%0A%20%20%20%20svg%20%3D%20badge(%0A%20%20%20%20%20%20%20%20left_text%3Df%22%7Bpackage_name%7D%20downloads%22%2C%0A%20%20%20%20%20%20%20%20right_text%3Dstr(stats%5B%22data%22%5D%5B%22last_month%22%5D)%2C%0A%20%20%20%20%20%20%20%20right_color%3D%22blue%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20Response(content%3Dsvg%2C%20media_type%3D%22image%2Fsvg%2Bxml%22)%0A%0A`,lang:`python`});var w=c(C,2);h(c(e(w),7),{href:`https://fastapi.tiangolo.com/tutorial/query-params/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`query param`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);u(T,{id:`running-and-deploying`,children:(e,t)=>{l(),i(e,r(`Running and deploying`))},$$slots:{default:!0}});var E=c(T,4);p(E,{code:`modal%20serve%20badges.py`,lang:`shell`});var D=c(E,8);f(e(D),{get src(){return g},alt:`web badge deployment`}),n(D),l(4),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=DjPdekGa.js.map
