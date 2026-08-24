(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`81b40ca4-99fa-4f64-b4d2-83d448f77615`,e._sentryDebugIdIdentifier=`sentry-dbid-81b40ca4-99fa-4f64-b4d2-83d448f77615`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Environments`,id:`environments`,children:[{depth:2,value:`Environment web suffixes`,id:`environment-web-suffixes`},{depth:2,value:`Cross environment lookups`,id:`cross-environment-lookups`}]}],rawContent:`# Environments

Modal Environments isolate Modal applications and resources from one another.

Environments are sub-divisions of [Workspaces](/docs/guide/workspaces),
allowing you to deploy the same App (or set of Apps)
in multiple instances for different purposes without changing code.

Typical use cases for Environments include having one \`dev\`
Environment and one \`prod\` Environment. Production Apps are protected from overwriting
when developing new features, but you can still deploy and test changes with a
"live" and potentially complex structure of Apps.

Each Environment has its own set of [Secrets](/docs/guide/secrets) and any
object lookups, say for [Dicts](/docs/guide/dicts) or [Volumes](/docs/guide/volumes),
performed from an App in an Environment will by default look for objects in the same Environment.

By default, every Workspace has a single Environment called "main". New
Environments can be created on the CLI:

\`\`\`sh
modal environment create dev
\`\`\`

Run \`modal environment --help\` for more info.

Workspaces can have up to 1500 Environments.

Once created, Environments show up as a dropdown menu in the navbar of the
[Modal dashboard](/apps), letting you set browse all Modal Apps, Secrets, and Storage
filtered by which Environment they were deployed to.

Most CLI commands also support an \`--env\` flag letting you specify which
Environment you intend to interact with, e.g.:

\`\`\`sh
modal run --env=dev app.py
modal volume create --env=dev storage
\`\`\`

To set a default Environment for your current CLI profile you can use
\`modal config set-environment\`, e.g.:

\`\`\`sh
modal config set-environment dev
\`\`\`

Alternatively, you can set the \`MODAL_ENVIRONMENT\` environment variable.

## Environment web suffixes

Environments have a 'web suffix' which is used to make
[Web Function URLs](/docs/guide/webhook-urls) unique across your workspace. One
Environment is allowed to have no suffix (\`""\`).

## Cross environment lookups

It's possible to explicitly look up objects in Environments other than the Environment
your App runs within:

\`\`\`python
production_secret = modal.Secret.from_name(
    "my-secret",
    environment_name="main",
)
\`\`\`

\`\`\`python notest
modal.Function.from_name(
    "my_app",
    "some_function",
    environment_name="dev"
)
\`\`\`

However, the \`environment_name\` argument is optional and omitting it will use
the Environment from the object's associated App or calling context.
`,meta:{title:`Environments`,description:`Modal Environments isolate Modal applications and resources from one another.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>Modal Environments isolate Modal applications and resources from one another.</p> <p>Environments are sub-divisions of <!>,
allowing you to deploy the same App (or set of Apps)
in multiple instances for different purposes without changing code.</p> <p>Typical use cases for Environments include having one <code>dev</code> Environment and one <code>prod</code> Environment. Production Apps are protected from overwriting
when developing new features, but you can still deploy and test changes with a
“live” and potentially complex structure of Apps.</p> <p>Each Environment has its own set of <!> and any
object lookups, say for <!> or <!>,
performed from an App in an Environment will by default look for objects in the same Environment.</p> <p>By default, every Workspace has a single Environment called “main”. New
Environments can be created on the CLI:</p> <!> <p>Run <code>modal environment --help</code> for more info.</p> <p>Workspaces can have up to 1500 Environments.</p> <p>Once created, Environments show up as a dropdown menu in the navbar of the <!>, letting you set browse all Modal Apps, Secrets, and Storage
filtered by which Environment they were deployed to.</p> <p>Most CLI commands also support an <code>--env</code> flag letting you specify which
Environment you intend to interact with, e.g.:</p> <!> <p>To set a default Environment for your current CLI profile you can use <code>modal config set-environment</code>, e.g.:</p> <!> <p>Alternatively, you can set the <code>MODAL_ENVIRONMENT</code> environment variable.</p> <!> <p>Environments have a ‘web suffix’ which is used to make <!> unique across your workspace. One
Environment is allowed to have no suffix (<code>""</code>).</p> <!> <p>It’s possible to explicitly look up objects in Environments other than the Environment
your App runs within:</p> <!> <!> <p>However, the <code>environment_name</code> argument is optional and omitting it will use
the Environment from the object’s associated App or calling context.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`environments`,children:(e,t)=>{l(),i(e,r(`Environments`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`/docs/guide/workspaces`,children:(e,t)=>{l(),i(e,r(`Workspaces`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4),_=c(e(g));m(_,{href:`/docs/guide/secrets`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`/docs/guide/dicts`,children:(e,t)=>{l(),i(e,r(`Dicts`))},$$slots:{default:!0}}),m(c(v,2),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(g);var b=c(g,4);f(b,{code:`modal%20environment%20create%20dev`,lang:`sh`});var x=c(b,6);m(c(e(x)),{href:`/apps`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,4);f(S,{code:`modal%20run%20--env%3Ddev%20app.py%0Amodal%20volume%20create%20--env%3Ddev%20storage`,lang:`sh`});var C=c(S,4);f(C,{code:`modal%20config%20set-environment%20dev`,lang:`sh`});var w=c(C,4);u(w,{id:`environment-web-suffixes`,children:(e,t)=>{l(),i(e,r(`Environment web suffixes`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T)),{href:`/docs/guide/webhook-urls`,children:(e,t)=>{l(),i(e,r(`Web Function URLs`))},$$slots:{default:!0}}),l(3),n(T);var E=c(T,2);u(E,{id:`cross-environment-lookups`,children:(e,t)=>{l(),i(e,r(`Cross environment lookups`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`production_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22my-secret%22%2C%0A%20%20%20%20environment_name%3D%22main%22%2C%0A)`,lang:`python`}),f(c(D,2),{code:`modal.Function.from_name(%0A%20%20%20%20%22my_app%22%2C%0A%20%20%20%20%22some_function%22%2C%0A%20%20%20%20environment_name%3D%22dev%22%0A)`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=Cdo-bYj1.js.map
