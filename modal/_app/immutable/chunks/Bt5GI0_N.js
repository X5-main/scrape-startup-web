(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2938b4b5-ba84-4ba5-b65f-b1a739b03d48`,e._sentryDebugIdIdentifier=`sentry-dbid-2938b4b5-ba84-4ba5-b65f-b1a739b03d48`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";var p={description:`Structure Modal projects across multiple files using Python packages and module mode for clean, maintainable code.`,crossLinks:[{text:`QuiLLMan - Voice Chat with LLMs`,href:`https://github.com/modal-labs/quillman`}],toc:[{depth:1,value:`Project structure`,id:`project-structure`,children:[{depth:2,value:`Apps spanning multiple files`,id:`apps-spanning-multiple-files`,children:[{depth:3,value:`Defining your project as a Python package`,id:`defining-your-project-as-a-python-package`},{depth:3,value:`App composition`,id:`app-composition`}]},{depth:2,value:`Including local dependencies`,id:`including-local-dependencies`}]}],rawContent:`# Project structure

## Apps spanning multiple files

When your project spans multiple files, more care is required to package the
full structure for running or deploying on Modal.

There are two main considerations: (1) ensuring that all of your Functions get
registered to the App, and (2) ensuring that any local dependencies get included
in the Modal container.

Say that you have a simple project that's distributed across three files:

\`\`\`
src/
├── app.py  # Defines the \`modal.App\` as a variable named \`app\`
├── llm.py  # Imports \`app\` and decorates some functions
└── web.py  # Imports \`app\` and decorates other functions
\`\`\`

With this structure, if you deploy using \`modal deploy src/app.py\`, Modal won't
discover the Functions defined in the other two modules, because they never get
imported.

If you instead run \`modal deploy src/llm.py\`, Modal will deploy the App with
just the Functions defined in that module.

One option would be to ensure that one module in the project transitively
imports all of the other modules and to point the \`modal deploy\` CLI at it, but
this approach can lead to an awkward project structure.

### Defining your project as a Python package

A better approach would be to define your project as a Python _package_ and to
use the Modal CLI's "module mode" invocation pattern.

In Python, a package is a directory containing an \`__init__.py\` file (and
usually some other Python modules). If you have a \`src/__init__.py\` that
imports all of the member modules, it will ensure that any decorated Functions
contained within them get registered to the App:

\`\`\`python notest
# Contents of __init__.py
import .app
import .llm
import .web
\`\`\`

_Important: use *relative* imports (\`import .app\`) between member modules._

Unfortunately, it's not enough just to set this up and make your deploy command
\`modal deploy src/app.py\`. Instead, you need to invoke Modal in _module mode_:
\`modal deploy -m src.app\`. Note the use of the \`-m\` flag and the module path
(\`src.app\` instead of \`src/app.py\`). Akin to \`python -m ...\`, this incantation
treats the target as a package rather than just a single script.

### App composition

As your project grows in scope, it may become helpful to organize it into
multiple component Apps, rather than having the project defined as one large
monolith. That way, as you iterate during development, you can target a specific
component, which will build faster and avoid any conflicts with concurrent work
on other parts of the project.

Projects set up this way can still be deployed as one unit by using \`App.include\`.
Say our project from above defines separate Apps in \`llm.py\` and \`web.py\` and then
adds a new \`deploy.py\` file:

\`\`\`python notest
# Contents of deploy.py
import modal

from .llm import llm_app
from .web import web_app

app = modal.App("full-app").include(llm_app).include(web_app)
\`\`\`

This lets you run \`modal deploy -m src.deploy\` to package everything in one
step.

**Note:** Since the multi-file App still has a single namespace for all
Functions, it's important to name your Modal Functions uniquely across the
project even when splitting it up across files: otherwise you risk some
Functions "shadowing" others with the same name.

## Including local dependencies

Another factor to consider is whether Modal will package all of the local
dependencies that your App requires.

Even if your Modal App itself can be contained to a single file, any local
modules that file imports (like, say, a \`helpers.py\`) also need to be available
in the Modal container.

By default, Modal will automatically include the module or package where a
Function is defined in all containers that run that Function. So if the project
is set up as a package and the helper modules are part of that package, you
should be all set. If you're not using a package setup, or if the local
dependencies are external to your project's package, you'll need to explicitly
include them in the Image, i.e. with \`modal.Image.add_local_python_source\`.

**Note:** This behavior changed in Modal 1.0. Previously, Modal would
"automount" any local dependencies that were imported by your App source into a
container. This was changed to be more selective to avoid unnecessary inclusion
of large local packages.
`,meta:{title:`Project structure`,description:`Structure Modal projects across multiple files using Python packages and module mode for clean, maintainable code.`}},{description:m,crossLinks:h,toc:g,rawContent:_,meta:v}=p,y=e(`<!> <!> <p>When your project spans multiple files, more care is required to package the
full structure for running or deploying on Modal.</p> <p>There are two main considerations: (1) ensuring that all of your Functions get
registered to the App, and (2) ensuring that any local dependencies get included
in the Modal container.</p> <p>Say that you have a simple project that’s distributed across three files:</p> <!> <p>With this structure, if you deploy using <code>modal deploy src/app.py</code>, Modal won’t
discover the Functions defined in the other two modules, because they never get
imported.</p> <p>If you instead run <code>modal deploy src/llm.py</code>, Modal will deploy the App with
just the Functions defined in that module.</p> <p>One option would be to ensure that one module in the project transitively
imports all of the other modules and to point the <code>modal deploy</code> CLI at it, but
this approach can lead to an awkward project structure.</p> <!> <p>A better approach would be to define your project as a Python <em>package</em> and to
use the Modal CLI’s “module mode” invocation pattern.</p> <p>In Python, a package is a directory containing an <code>__init__.py</code> file (and
usually some other Python modules). If you have a <code>src/__init__.py</code> that
imports all of the member modules, it will ensure that any decorated Functions
contained within them get registered to the App:</p> <!> <p><em>Important: use <em>relative</em> imports (<code>import .app</code>) between member modules.</em></p> <p>Unfortunately, it’s not enough just to set this up and make your deploy command <code>modal deploy src/app.py</code>. Instead, you need to invoke Modal in <em>module mode</em>: <code>modal deploy -m src.app</code>. Note the use of the <code>-m</code> flag and the module path
(<code>src.app</code> instead of <code>src/app.py</code>). Akin to <code>python -m ...</code>, this incantation
treats the target as a package rather than just a single script.</p> <!> <p>As your project grows in scope, it may become helpful to organize it into
multiple component Apps, rather than having the project defined as one large
monolith. That way, as you iterate during development, you can target a specific
component, which will build faster and avoid any conflicts with concurrent work
on other parts of the project.</p> <p>Projects set up this way can still be deployed as one unit by using <code>App.include</code>.
Say our project from above defines separate Apps in <code>llm.py</code> and <code>web.py</code> and then
adds a new <code>deploy.py</code> file:</p> <!> <p>This lets you run <code>modal deploy -m src.deploy</code> to package everything in one
step.</p> <p><strong>Note:</strong> Since the multi-file App still has a single namespace for all
Functions, it’s important to name your Modal Functions uniquely across the
project even when splitting it up across files: otherwise you risk some
Functions “shadowing” others with the same name.</p> <!> <p>Another factor to consider is whether Modal will package all of the local
dependencies that your App requires.</p> <p>Even if your Modal App itself can be contained to a single file, any local
modules that file imports (like, say, a <code>helpers.py</code>) also need to be available
in the Modal container.</p> <p>By default, Modal will automatically include the module or package where a
Function is defined in all containers that run that Function. So if the project
is set up as a package and the helper modules are part of that package, you
should be all set. If you’re not using a package setup, or if the local
dependencies are external to your project’s package, you’ll need to explicitly
include them in the Image, i.e. with <code>modal.Image.add_local_python_source</code>.</p> <p><strong>Note:</strong> This behavior changed in Modal 1.0. Previously, Modal would
“automount” any local dependencies that were imported by your App source into a
container. This was changed to be more selective to avoid unnecessary inclusion
of large local packages.</p>`,1);function b(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(e,i(()=>h,()=>p,{children:(e,r)=>{var i=y(),f=a(i);u(f,{id:`project-structure`,children:(e,r)=>{s(),n(e,t(`Project structure`))},$$slots:{default:!0}});var p=o(f,2);c(p,{id:`apps-spanning-multiple-files`,children:(e,r)=>{s(),n(e,t(`Apps spanning multiple files`))},$$slots:{default:!0}});var m=o(p,8);d(m,{code:`src%2F%0A%E2%94%9C%E2%94%80%E2%94%80%20app.py%20%20%23%20Defines%20the%20%60modal.App%60%20as%20a%20variable%20named%20%60app%60%0A%E2%94%9C%E2%94%80%E2%94%80%20llm.py%20%20%23%20Imports%20%60app%60%20and%20decorates%20some%20functions%0A%E2%94%94%E2%94%80%E2%94%80%20web.py%20%20%23%20Imports%20%60app%60%20and%20decorates%20other%20functions`,lang:`text`});var h=o(m,8);l(h,{id:`defining-your-project-as-a-python-package`,children:(e,r)=>{s(),n(e,t(`Defining your project as a Python package`))},$$slots:{default:!0}});var g=o(h,6);d(g,{code:`%23%20Contents%20of%20__init__.py%0Aimport%20.app%0Aimport%20.llm%0Aimport%20.web`,lang:`python`});var _=o(g,6);l(_,{id:`app-composition`,children:(e,r)=>{s(),n(e,t(`App composition`))},$$slots:{default:!0}});var v=o(_,6);d(v,{code:`%23%20Contents%20of%20deploy.py%0Aimport%20modal%0A%0Afrom%20.llm%20import%20llm_app%0Afrom%20.web%20import%20web_app%0A%0Aapp%20%3D%20modal.App(%22full-app%22).include(llm_app).include(web_app)`,lang:`python`}),c(o(v,6),{id:`including-local-dependencies`,children:(e,r)=>{s(),n(e,t(`Including local dependencies`))},$$slots:{default:!0}}),s(8),n(e,i)},$$slots:{default:!0}}))}export{b as default,p as metadata};
//# sourceMappingURL=Bt5GI0_N.js.map
