(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`510c1cef-0543-47d0-82be-cb80201b2bd2`,e._sentryDebugIdIdentifier=`sentry-dbid-510c1cef-0543-47d0-82be-cb80201b2bd2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./JPsrybyr.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Modal Vibe: A scalable AI coding platform`,id:`modal-vibe-a-scalable-ai-coding-platform`,children:[{depth:2,value:`How it’s structured`,id:`how-its-structured`},{depth:2,value:`How to run`,id:`how-to-run`,children:[{depth:3,value:`Deploy`,id:`deploy`},{depth:3,value:`Local Development`,id:`local-development`}]}]}],rawContent:`# Modal Vibe: A scalable AI coding platform

<center>
<video controls playsinline class="w-full aspect-[16/9]" poster="https://modal-cdn.com/blog/videos/modal-vibe-scaleup-poster.png">
<source src="https://modal-cdn.com/blog/videos/modal-vibe-scaleup.mp4" type="video/mp4">
<track kind="captions" />
</video>
</center>

The [Modal Vibe repo](https://github.com/modal-labs/modal-vibe) demonstrates how you can build
a scalable AI coding platform on Modal.

Users of the application can prompt an LLM to create sandboxed applications that service React through a UI.

Each application lives on a [Modal Sandbox](https://modal.com/docs/guide/sandboxes)
and contains a webserver accessible through
[Modal Tunnels](https://modal.com/docs/guide/tunnels).

For a high-level overview of Modal Vibe, including performance numbers and why they matter, see
[the accompanying blog post](https://modal.com/blog/modal-vibe).
For details on the implementation, read on.

## How it's structured

![Architecture diagram for Modal Vibe](https://modal-cdn.com/modal-vibe/architecture.png)

- \`main.py\` is the entrypoint that runs the FastAPI controller that serves the web app and manages the sandbox apps.
- \`core\` contains the logic for \`SandboxApp\` model and LLM logic.
- \`sandbox\` contains a small HTTP server that gets put inside every Sandbox that's created, as well as some sandbox lifecycle management code.
- \`web\` contains the Modal Vibe website that users see and interact with, as well as the api server that manages Sandboxes.

## How to run

First, set up the local environment:

\`\`\`bash
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.dev.txt
\`\`\`

### Deploy

To deploy to Modal, copy \`.env.example\` to a file called \`.env\` and add your \`ANTHROPIC_API_KEY\`.
Also, create a [Modal Secret](https://modal.com/docs/guide/secrets) called \`anthropic-secret\` so our applications can access it.

Then, deploy the application with Modal:

\`\`\`bash
modal deploy -m main
\`\`\`

### Local Development

Run a load test:

\`\`\`bash
modal run main.py::create_app_loadtest_function --num-apps 10
\`\`\`

Delete a sandbox:

\`\`\`bash
modal run main.py::delete_sandbox_admin_function --app-id <APP_ID>
\`\`\`

Run an example sandbox HTTP server:

\`\`\`bash
python -m sandbox.server
\`\`\`
`,meta:{title:`Modal Vibe: A scalable AI coding platform`,description:`The Modal Vibe repo demonstrates how you can build a scalable AI coding platform on Modal.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<!> <center><video controls playsinline="" class="w-full aspect-[16/9]" poster="https://modal-cdn.com/blog/videos/modal-vibe-scaleup-poster.png"><source src="https://modal-cdn.com/blog/videos/modal-vibe-scaleup.mp4" type="video/mp4"/> <track kind="captions"/></video></center> <p>The <!> demonstrates how you can build
a scalable AI coding platform on Modal.</p> <p>Users of the application can prompt an LLM to create sandboxed applications that service React through a UI.</p> <p>Each application lives on a <!> and contains a webserver accessible through <!>.</p> <p>For a high-level overview of Modal Vibe, including performance numbers and why they matter, see <!>.
For details on the implementation, read on.</p> <!> <p><!></p> <ul><li><code>main.py</code> is the entrypoint that runs the FastAPI controller that serves the web app and manages the sandbox apps.</li> <li><code>core</code> contains the logic for <code>SandboxApp</code> model and LLM logic.</li> <li><code>sandbox</code> contains a small HTTP server that gets put inside every Sandbox that’s created, as well as some sandbox lifecycle management code.</li> <li><code>web</code> contains the Modal Vibe website that users see and interact with, as well as the api server that manages Sandboxes.</li></ul> <!> <p>First, set up the local environment:</p> <!> <!> <p>To deploy to Modal, copy <code>.env.example</code> to a file called <code>.env</code> and add your <code>ANTHROPIC_API_KEY</code>.
Also, create a <!> called <code>anthropic-secret</code> so our applications can access it.</p> <p>Then, deploy the application with Modal:</p> <!> <!> <p>Run a load test:</p> <!> <p>Delete a sandbox:</p> <!> <p>Run an example sandbox HTTP server:</p> <!>`,3);function S(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=x(),h=s(o);f(h,{id:`modal-vibe-a-scalable-ai-coding-platform`,children:(e,t)=>{l(),i(e,r(`Modal Vibe: A scalable AI coding platform`))},$$slots:{default:!0}});var _=c(h,4);g(c(e(_)),{href:`https://github.com/modal-labs/modal-vibe`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Vibe repo`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4),y=c(e(v));g(y,{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Sandbox`))},$$slots:{default:!0}}),g(c(y,2),{href:`https://modal.com/docs/guide/tunnels`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Tunnels`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);g(c(e(b)),{href:`https://modal.com/blog/modal-vibe`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the accompanying blog post`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,2);u(S,{id:`how-its-structured`,children:(e,t)=>{l(),i(e,r(`How it’s structured`))},$$slots:{default:!0}});var C=c(S,2);p(e(C),{src:`https://modal-cdn.com/modal-vibe/architecture.png`,alt:`Architecture diagram for Modal Vibe`}),n(C);var w=c(C,4);u(w,{id:`how-to-run`,children:(e,t)=>{l(),i(e,r(`How to run`))},$$slots:{default:!0}});var T=c(w,4);m(T,{code:`python3%20-m%20venv%20venv%20%26%26%20source%20venv%2Fbin%2Factivate%20%26%26%20pip%20install%20-r%20requirements.dev.txt`,lang:`bash`});var E=c(T,2);d(E,{id:`deploy`,children:(e,t)=>{l(),i(e,r(`Deploy`))},$$slots:{default:!0}});var D=c(E,2);g(c(e(D),7),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),l(3),n(D);var O=c(D,4);m(O,{code:`modal%20deploy%20-m%20main`,lang:`bash`});var k=c(O,2);d(k,{id:`local-development`,children:(e,t)=>{l(),i(e,r(`Local Development`))},$$slots:{default:!0}});var A=c(k,4);m(A,{code:`modal%20run%20main.py%3A%3Acreate_app_loadtest_function%20--num-apps%2010`,lang:`bash`});var j=c(A,4);m(j,{code:`modal%20run%20main.py%3A%3Adelete_sandbox_admin_function%20--app-id%20%3CAPP_ID%3E`,lang:`bash`}),m(c(j,4),{code:`python%20-m%20sandbox.server`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,_ as metadata};
//# sourceMappingURL=CJqfMpgq.js.map
