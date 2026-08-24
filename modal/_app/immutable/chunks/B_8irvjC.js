(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0967def5-839d-4445-8095-b7dd32b4b9bf`,e._sentryDebugIdIdentifier=`sentry-dbid-0967def5-839d-4445-8095-b7dd32b4b9bf`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`Handle global variables and data in Modal Functions using modal.is_local to differentiate local and cloud execution.`,toc:[{depth:1,value:`Global variables`,id:`global-variables`,children:[{depth:2,value:`Warning about regular module globals`,id:`warning-about-regular-module-globals`}]}],rawContent:`# Global variables

There are cases where you might want objects or data available in **global**
scope. For example:

- You need to use the data in a scheduled function (scheduled functions don't
  accept arguments)
- You need to construct objects (e.g. Secrets) in global scope to use as
  function annotations
- You don't want to clutter many function signatures with some common arguments
  they all use, and pass the same arguments through many layers of function
  calls.

For these cases, you can use the \`modal.is_local\` function, which returns \`True\`
if the app is running locally (initializing) or \`False\` if the app is executing
in the cloud.

For instance, to create a [\`modal.Secret\`](/docs/guide/secrets) that you can pass
to your function decorators to create environment variables, you can run:

\`\`\`python
import os

if modal.is_local():
    pg_password = modal.Secret.from_dict({"PGPASS": os.environ["MY_LOCAL_PASSWORD"]})
else:
    pg_password = modal.Secret.from_dict({})


@app.function(secrets=[pg_password])
def get_secret_data():
    connection = psycopg2.connect(password=os.environ["PGPASS"])
    ...
\`\`\`

## Warning about regular module globals

If you try to construct a global in module scope using some local data _without_
using something like \`modal.is_local\`, it might have unexpected effects since
your Python modules will be not only be loaded on your local machine, but also
on the remote worker.

E.g., this will typically not work:

\`\`\`python notest
# blob.json doesn't exist on the remote worker, so this will cause an error there
data_blob = open("blob.json", "r").read()

@app.function()
def foo():
    print(data_blob)
\`\`\`
`,meta:{title:`Global variables`,description:`Handle global variables and data in Modal Functions using modal.is_local to differentiate local and cloud execution.`}},{description:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal.Secret</code>`),x=t(`<!> <p>There are cases where you might want objects or data available in <strong>global</strong> scope. For example:</p> <ul><li>You need to use the data in a scheduled function (scheduled functions don’t
accept arguments)</li> <li>You need to construct objects (e.g. Secrets) in global scope to use as
function annotations</li> <li>You don’t want to clutter many function signatures with some common arguments
they all use, and pass the same arguments through many layers of function
calls.</li></ul> <p>For these cases, you can use the <code>modal.is_local</code> function, which returns <code>True</code> if the app is running locally (initializing) or <code>False</code> if the app is executing
in the cloud.</p> <p>For instance, to create a <!> that you can pass
to your function decorators to create environment variables, you can run:</p> <!> <!> <p>If you try to construct a global in module scope using some local data <em>without</em> using something like <code>modal.is_local</code>, it might have unexpected effects since
your Python modules will be not only be loaded on your local machine, but also
on the remote worker.</p> <p>E.g., this will typically not work:</p> <!>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`global-variables`,children:(e,t)=>{l(),i(e,r(`Global variables`))},$$slots:{default:!0}});var h=c(p,8);m(c(e(h)),{href:`/docs/guide/secrets`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);f(g,{code:`import%20os%0A%0Aif%20modal.is_local()%3A%0A%20%20%20%20pg_password%20%3D%20modal.Secret.from_dict(%7B%22PGPASS%22%3A%20os.environ%5B%22MY_LOCAL_PASSWORD%22%5D%7D)%0Aelse%3A%0A%20%20%20%20pg_password%20%3D%20modal.Secret.from_dict(%7B%7D)%0A%0A%0A%40app.function(secrets%3D%5Bpg_password%5D)%0Adef%20get_secret_data()%3A%0A%20%20%20%20connection%20%3D%20psycopg2.connect(password%3Dos.environ%5B%22PGPASS%22%5D)%0A%20%20%20%20...`,lang:`python`});var _=c(g,2);u(_,{id:`warning-about-regular-module-globals`,children:(e,t)=>{l(),i(e,r(`Warning about regular module globals`))},$$slots:{default:!0}}),f(c(_,6),{code:`%23%20blob.json%20doesn't%20exist%20on%20the%20remote%20worker%2C%20so%20this%20will%20cause%20an%20error%20there%0Adata_blob%20%3D%20open(%22blob.json%22%2C%20%22r%22).read()%0A%0A%40app.function()%0Adef%20foo()%3A%0A%20%20%20%20print(data_blob)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=B_8irvjC.js.map
