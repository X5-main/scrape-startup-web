(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bc271b70-1a7e-40e6-b885-dfeaa010cd5a`,e._sentryDebugIdIdentifier=`sentry-dbid-bc271b70-1a7e-40e6-b885-dfeaa010cd5a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g=`/_app/immutable/assets/streamlit.RHfhqFCX.png`,_={toc:[{depth:1,value:`Run and share Streamlit apps`,id:`run-and-share-streamlit-apps`,children:[{depth:2,value:`Define container dependencies`,id:`define-container-dependencies`},{depth:2,value:`Spawning the Streamlit server`,id:`spawning-the-streamlit-server`},{depth:2,value:`Iterate and Deploy`,id:`iterate-and-deploy`}]}],rawContent:`# Run and share Streamlit apps

This example shows you how to run a Streamlit app with \`modal serve\`, and then deploy it as a serverless web app.

![example streamlit app](./streamlit.png)

This example is structured as two files:

1. This module, which defines the Modal objects (name the script \`serve_streamlit.py\` locally).

2. \`app.py\`, which is any Streamlit script to be mounted into the Modal
function ([download script](https://github.com/modal-labs/modal-examples/blob/main/10_integrations/streamlit/app.py)).

\`\`\`python
import shlex
import subprocess
from pathlib import Path

import modal

\`\`\`

## Define container dependencies

The \`app.py\` script imports three third-party packages, so we include these in the example's
image definition and then add the \`app.py\` file itself to the image.

\`\`\`python
streamlit_script_local_path = Path(__file__).parent / "app.py"
streamlit_script_remote_path = "/root/app.py"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("streamlit~=1.35.0", "numpy~=1.26.4", "pandas~=2.2.2")
    .add_local_file(
        streamlit_script_local_path,
        streamlit_script_remote_path,
    )
)

app = modal.App(name="example-serve-streamlit", image=image)

if not streamlit_script_local_path.exists():
    raise RuntimeError(
        "app.py not found! Place the script with your streamlit app in the same directory."
    )

\`\`\`

## Spawning the Streamlit server

Inside the container, we will run the Streamlit server in a background subprocess using
\`subprocess.Popen\`. We also expose port 8000 using the \`@web_server\` decorator.

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=100)
@modal.web_server(8000)
def run():
    target = shlex.quote(streamlit_script_remote_path)
    cmd = f"streamlit run {target} --server.port 8000 --server.enableCORS=false --server.enableXsrfProtection=false"
    subprocess.Popen(cmd, shell=True)


\`\`\`

## Iterate and Deploy

While you're iterating on your screamlit app, you can run it "ephemerally" with \`modal serve\`. This will
run a local process that watches your files and updates the app if anything changes.

\`\`\`shell
modal serve serve_streamlit.py
\`\`\`

Once you're happy with your changes, you can deploy your application with

\`\`\`shell
modal deploy serve_streamlit.py
\`\`\`

If successful, this will print a URL for your app that you can navigate to from
your browser 🎉 .
`,meta:{title:`Run and share Streamlit apps`,description:`This example shows you how to run a Streamlit app with modal serve, and then deploy it as a serverless web app.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<!> <p>This example shows you how to run a Streamlit app with <code>modal serve</code>, and then deploy it as a serverless web app.</p> <p><!></p> <p>This example is structured as two files:</p> <ol><li><p>This module, which defines the Modal objects (name the script <code>serve_streamlit.py</code> locally).</p></li> <li><p><code>app.py</code>, which is any Streamlit script to be mounted into the Modal
function (<!>).</p></li></ol> <!> <!> <p>The <code>app.py</code> script imports three third-party packages, so we include these in the example’s
image definition and then add the <code>app.py</code> file itself to the image.</p> <!> <!> <p>Inside the container, we will run the Streamlit server in a background subprocess using <code>subprocess.Popen</code>. We also expose port 8000 using the <code>@web_server</code> decorator.</p> <!> <!> <p>While you’re iterating on your screamlit app, you can run it “ephemerally” with <code>modal serve</code>. This will
run a local process that watches your files and updates the app if anything changes.</p> <!> <p>Once you’re happy with your changes, you can deploy your application with</p> <!> <p>If successful, this will print a URL for your app that you can navigate to from
your browser 🎉 .</p>`,1);function S(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=x(),m=s(o);d(m,{id:`run-and-share-streamlit-apps`,children:(e,t)=>{l(),i(e,r(`Run and share Streamlit apps`))},$$slots:{default:!0}});var _=c(m,4);f(e(_),{get src(){return g},alt:`example streamlit app`}),n(_);var v=c(_,4),y=c(e(v),2),b=e(y);h(c(e(b),2),{href:`https://github.com/modal-labs/modal-examples/blob/main/10_integrations/streamlit/app.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`download script`))},$$slots:{default:!0}}),l(),n(b),n(y),n(v);var S=c(v,2);p(S,{code:`import%20shlex%0Aimport%20subprocess%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A`,lang:`python`});var C=c(S,2);u(C,{id:`define-container-dependencies`,children:(e,t)=>{l(),i(e,r(`Define container dependencies`))},$$slots:{default:!0}});var w=c(C,4);p(w,{code:`streamlit_script_local_path%20%3D%20Path(__file__).parent%20%2F%20%22app.py%22%0Astreamlit_script_remote_path%20%3D%20%22%2Froot%2Fapp.py%22%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%22streamlit~%3D1.35.0%22%2C%20%22numpy~%3D1.26.4%22%2C%20%22pandas~%3D2.2.2%22)%0A%20%20%20%20.add_local_file(%0A%20%20%20%20%20%20%20%20streamlit_script_local_path%2C%0A%20%20%20%20%20%20%20%20streamlit_script_remote_path%2C%0A%20%20%20%20)%0A)%0A%0Aapp%20%3D%20modal.App(name%3D%22example-serve-streamlit%22%2C%20image%3Dimage)%0A%0Aif%20not%20streamlit_script_local_path.exists()%3A%0A%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%22app.py%20not%20found!%20Place%20the%20script%20with%20your%20streamlit%20app%20in%20the%20same%20directory.%22%0A%20%20%20%20)%0A`,lang:`python`});var T=c(w,2);u(T,{id:`spawning-the-streamlit-server`,children:(e,t)=>{l(),i(e,r(`Spawning the Streamlit server`))},$$slots:{default:!0}});var E=c(T,4);p(E,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.web_server(8000)%0Adef%20run()%3A%0A%20%20%20%20target%20%3D%20shlex.quote(streamlit_script_remote_path)%0A%20%20%20%20cmd%20%3D%20f%22streamlit%20run%20%7Btarget%7D%20--server.port%208000%20--server.enableCORS%3Dfalse%20--server.enableXsrfProtection%3Dfalse%22%0A%20%20%20%20subprocess.Popen(cmd%2C%20shell%3DTrue)%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`iterate-and-deploy`,children:(e,t)=>{l(),i(e,r(`Iterate and Deploy`))},$$slots:{default:!0}});var O=c(D,4);p(O,{code:`modal%20serve%20serve_streamlit.py`,lang:`shell`}),p(c(O,4),{code:`modal%20deploy%20serve_streamlit.py`,lang:`shell`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{S as default,_ as metadata};
//# sourceMappingURL=CDwdK0Zq2.js.map
