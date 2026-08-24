(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`686aed38-121b-46ec-8928-10951f382661`,e._sentryDebugIdIdentifier=`sentry-dbid-686aed38-121b-46ec-8928-10951f382661`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{n as p}from"./JPsrybyr.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={description:`Complete API reference for the Modal Python SDK. Documentation for App, Function, Image, Sandbox, Volume, and other Modal primitives.`,toc:[{depth:1,value:`Python SDK Reference`,id:`python-sdk-reference`,children:[{depth:2,value:`Application construction`,id:`application-construction`},{depth:2,value:`Serverless execution`,id:`serverless-execution`},{depth:2,value:`Extended Function configuration`,id:`extended-function-configuration`,children:[{depth:3,value:`Class parametrization`,id:`class-parametrization`},{depth:3,value:`Lifecycle hooks`,id:`lifecycle-hooks`},{depth:3,value:`Web integrations`,id:`web-integrations`},{depth:3,value:`Function semantics`,id:`function-semantics`},{depth:3,value:`Scheduling`,id:`scheduling`},{depth:3,value:`Exception handling`,id:`exception-handling`}]},{depth:2,value:`Sandboxed execution`,id:`sandboxed-execution`},{depth:2,value:`Container configuration`,id:`container-configuration`},{depth:2,value:`Data primitives`,id:`data-primitives`,children:[{depth:3,value:`Persistent storage`,id:`persistent-storage`},{depth:3,value:`In-memory storage`,id:`in-memory-storage`}]},{depth:2,value:`Account configuration`,id:`account-configuration`},{depth:2,value:`Networking`,id:`networking`}]}],rawContent:`# Python SDK Reference

This is the API reference for the [\`modal\`](https://pypi.org/project/modal/)
Python SDK, which allows you to programmatically interact with Modal.

## Application construction

|  |  |
| --- | --- |
| [\`App\`](/docs/sdk/py/latest/App) | The main unit of deployment for code on Modal |
| [\`App.function\`](/docs/sdk/py/latest/App#function) | Decorator for registering a function with an App |
| [\`App.cls\`](/docs/sdk/py/latest/App#cls) | Decorator for registering a class with an App |
| [\`App.server\`](/docs/sdk/py/latest/App#server) | Decorator for registering a server with an App |

## Serverless execution

|  |  |
| --- | --- |
| [\`Function\`](/docs/sdk/py/latest/Function) | A serverless function backed by an autoscaling container pool |
| [\`Cls\`](/docs/sdk/py/latest/Cls) | A serverless class supporting parametrization and lifecycle hooks |
| [\`Server\`](/docs/sdk/py/latest/Server) | A serverless HTTP application with low-latency request routing |

## Extended Function configuration

### Class parametrization

|  |  |
| --- | --- |
| [\`parameter\`](/docs/sdk/py/latest/parameter) | Used to define class parameters, akin to a Dataclass field |

### Lifecycle hooks

|  |  |
| --- | --- |
| [\`enter\`](/docs/sdk/py/latest/enter) | Decorator for a method that will be executed during container startup |
| [\`exit\`](/docs/sdk/py/latest/exit) | Decorator for a method that will be executed during container shutdown |
| [\`method\`](/docs/sdk/py/latest/method) | Decorator for exposing a method as an invokable function |

### Web integrations

|  |  |
| --- | --- |
| [\`fastapi_endpoint\`](/docs/sdk/py/latest/fastapi_endpoint) | Decorator for exposing a simple FastAPI-based endpoint |
| [\`asgi_app\`](/docs/sdk/py/latest/asgi_app) | Decorator for functions that construct an ASGI web application |
| [\`wsgi_app\`](/docs/sdk/py/latest/wsgi_app) | Decorator for functions that construct a WSGI web application |
| [\`web_server\`](/docs/sdk/py/latest/web_server) | Decorator for functions that construct an HTTP web server |

### Function semantics

|  |  |
| --- | --- |
| [\`batched\`](/docs/sdk/py/latest/batched) | Decorator that enables [dynamic input batching](/docs/guide/dynamic-batching) |
| [\`concurrent\`](/docs/sdk/py/latest/concurrent) | Decorator that enables [input concurrency](/docs/guide/concurrent-inputs) |

### Scheduling

|  |  |
| --- | --- |
| [\`Cron\`](/docs/sdk/py/latest/Cron) | A schedule that runs based on cron syntax |
| [\`Period\`](/docs/sdk/py/latest/Period) | A schedule that runs at a fixed interval |

### Exception handling

|  |  |
| --- | --- |
| [\`Retries\`](/docs/sdk/py/latest/Retries) | Function retry policy for input failures |

## Sandboxed execution

|  |  |
| --- | --- |
| [\`Sandbox\`](/docs/sdk/py/latest/Sandbox) | An interface for restricted code execution |
| [\`ContainerProcess\`](/docs/sdk/py/latest/container_process#containerprocess) | An object representing a sandboxed process |
| [\`FileIO\`](/docs/sdk/py/latest/file_io#fileio) | A handle for a file in the Sandbox filesystem |

## Container configuration

|  |  |
| --- | --- |
| [\`Image\`](/docs/sdk/py/latest/Image) | An API for specifying container images |
| [\`Secret\`](/docs/sdk/py/latest/Secret) | A pointer to secrets that will be exposed as environment variables |

## Data primitives

### Persistent storage

|  |  |
| --- | --- |
| [\`Volume\`](/docs/sdk/py/latest/Volume) | Distributed storage supporting highly performant parallel reads |
| [\`CloudBucketMount\`](/docs/sdk/py/latest/CloudBucketMount) | Storage backed by a third-party cloud bucket (S3, etc.) |

### In-memory storage

|  |  |
| --- | --- |
| [\`Dict\`](/docs/sdk/py/latest/Dict) | A distributed key-value store |
| [\`Queue\`](/docs/sdk/py/latest/Queue) | A distributed FIFO queue |

## Account configuration

|  |  |
| --- | --- |
| [\`Workspace\`](/docs/sdk/py/latest/Workspace) | Workspace-level configuration and observability |
| [\`Environment\`](/docs/sdk/py/latest/Environment) | Manage workspace subdivisions |

## Networking

|  |  |
| --- | --- |
| [\`Proxy\`](/docs/sdk/py/latest/Proxy) | An object that provides a static outbound IP address for containers |
| [\`forward\`](/docs/sdk/py/latest/forward) | A context manager for publicly exposing a port from a container |
`,meta:{title:`Python SDK Reference`,description:`Complete API reference for the Modal Python SDK. Documentation for App, Function, Image, Sandbox, Volume, and other Modal primitives.`}},{description:_,toc:v,rawContent:y,meta:b}=g,ee=t(`<code>modal</code>`),te=t(`<code>App</code>`),ne=t(`<code>App.function</code>`),re=t(`<code>App.cls</code>`),ie=t(`<code>App.server</code>`),ae=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>The main unit of deployment for code on Modal</td></tr><tr><td><!></td><td>Decorator for registering a function with an App</td></tr><tr><td><!></td><td>Decorator for registering a class with an App</td></tr><tr><td><!></td><td>Decorator for registering a server with an App</td></tr></tbody>`,1),oe=t(`<code>Function</code>`),se=t(`<code>Cls</code>`),ce=t(`<code>Server</code>`),le=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>A serverless function backed by an autoscaling container pool</td></tr><tr><td><!></td><td>A serverless class supporting parametrization and lifecycle hooks</td></tr><tr><td><!></td><td>A serverless HTTP application with low-latency request routing</td></tr></tbody>`,1),ue=t(`<code>parameter</code>`),de=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Used to define class parameters, akin to a Dataclass field</td></tr></tbody>`,1),fe=t(`<code>enter</code>`),pe=t(`<code>exit</code>`),me=t(`<code>method</code>`),he=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Decorator for a method that will be executed during container startup</td></tr><tr><td><!></td><td>Decorator for a method that will be executed during container shutdown</td></tr><tr><td><!></td><td>Decorator for exposing a method as an invokable function</td></tr></tbody>`,1),ge=t(`<code>fastapi_endpoint</code>`),_e=t(`<code>asgi_app</code>`),ve=t(`<code>wsgi_app</code>`),ye=t(`<code>web_server</code>`),be=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Decorator for exposing a simple FastAPI-based endpoint</td></tr><tr><td><!></td><td>Decorator for functions that construct an ASGI web application</td></tr><tr><td><!></td><td>Decorator for functions that construct a WSGI web application</td></tr><tr><td><!></td><td>Decorator for functions that construct an HTTP web server</td></tr></tbody>`,1),xe=t(`<code>batched</code>`),Se=t(`<code>concurrent</code>`),Ce=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Decorator that enables <!></td></tr><tr><td><!></td><td>Decorator that enables <!></td></tr></tbody>`,1),we=t(`<code>Cron</code>`),Te=t(`<code>Period</code>`),Ee=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>A schedule that runs based on cron syntax</td></tr><tr><td><!></td><td>A schedule that runs at a fixed interval</td></tr></tbody>`,1),x=t(`<code>Retries</code>`),S=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Function retry policy for input failures</td></tr></tbody>`,1),C=t(`<code>Sandbox</code>`),w=t(`<code>ContainerProcess</code>`),T=t(`<code>FileIO</code>`),E=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>An interface for restricted code execution</td></tr><tr><td><!></td><td>An object representing a sandboxed process</td></tr><tr><td><!></td><td>A handle for a file in the Sandbox filesystem</td></tr></tbody>`,1),D=t(`<code>Image</code>`),De=t(`<code>Secret</code>`),Oe=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>An API for specifying container images</td></tr><tr><td><!></td><td>A pointer to secrets that will be exposed as environment variables</td></tr></tbody>`,1),ke=t(`<code>Volume</code>`),Ae=t(`<code>CloudBucketMount</code>`),je=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Distributed storage supporting highly performant parallel reads</td></tr><tr><td><!></td><td>Storage backed by a third-party cloud bucket (S3, etc.)</td></tr></tbody>`,1),Me=t(`<code>Dict</code>`),O=t(`<code>Queue</code>`),Ne=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>A distributed key-value store</td></tr><tr><td><!></td><td>A distributed FIFO queue</td></tr></tbody>`,1),Pe=t(`<code>Workspace</code>`),Fe=t(`<code>Environment</code>`),Ie=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>Workspace-level configuration and observability</td></tr><tr><td><!></td><td>Manage workspace subdivisions</td></tr></tbody>`,1),Le=t(`<code>Proxy</code>`),Re=t(`<code>forward</code>`),ze=t(`<thead><tr><th></th><th></th></tr></thead> <tbody><tr><td><!></td><td>An object that provides a static outbound IP address for containers</td></tr><tr><td><!></td><td>A context manager for publicly exposing a port from a container</td></tr></tbody>`,1),Be=t(`<!> <p>This is the API reference for the <!> Python SDK, which allows you to programmatically interact with Modal.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`,1);function k(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=Be(),m=s(o);f(m,{id:`python-sdk-reference`,children:(e,t)=>{l(),i(e,r(`Python SDK Reference`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://pypi.org/project/modal/`,rel:`nofollow`,children:(e,t)=>{i(e,ee())},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`application-construction`,children:(e,t)=>{l(),i(e,r(`Application construction`))},$$slots:{default:!0}});var v=c(_,2);p(v,{children:(t,r)=>{var a=ae(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/App`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),n(p),l(),n(f);var m=c(f),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/App#cls`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),n(g),l(),n(m);var _=c(m),v=e(_);h(e(v),{href:`/docs/sdk/py/latest/App#server`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),n(v),l(),n(_),n(o),i(t,a)},$$slots:{default:!0}});var y=c(v,2);u(y,{id:`serverless-execution`,children:(e,t)=>{l(),i(e,r(`Serverless execution`))},$$slots:{default:!0}});var b=c(y,2);p(b,{children:(t,r)=>{var a=le(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/Cls`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),n(p),l(),n(f);var m=c(f),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/Server`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),n(g),l(),n(m),n(o),i(t,a)},$$slots:{default:!0}});var k=c(b,2);u(k,{id:`extended-function-configuration`,children:(e,t)=>{l(),i(e,r(`Extended Function configuration`))},$$slots:{default:!0}});var A=c(k,2);d(A,{id:`class-parametrization`,children:(e,t)=>{l(),i(e,r(`Class parametrization`))},$$slots:{default:!0}});var j=c(A,2);p(j,{children:(t,r)=>{var a=de(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/parameter`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),n(d),l(),n(u),n(o),i(t,a)},$$slots:{default:!0}});var M=c(j,2);d(M,{id:`lifecycle-hooks`,children:(e,t)=>{l(),i(e,r(`Lifecycle hooks`))},$$slots:{default:!0}});var N=c(M,2);p(N,{children:(t,r)=>{var a=he(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/enter`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/exit`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),n(p),l(),n(f);var m=c(f),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/method`,children:(e,t)=>{i(e,me())},$$slots:{default:!0}}),n(g),l(),n(m),n(o),i(t,a)},$$slots:{default:!0}});var P=c(N,2);d(P,{id:`web-integrations`,children:(e,t)=>{l(),i(e,r(`Web integrations`))},$$slots:{default:!0}});var F=c(P,2);p(F,{children:(t,r)=>{var a=be(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/fastapi_endpoint`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/asgi_app`,children:(e,t)=>{i(e,_e())},$$slots:{default:!0}}),n(p),l(),n(f);var m=c(f),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/wsgi_app`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}}),n(g),l(),n(m);var _=c(m),v=e(_);h(e(v),{href:`/docs/sdk/py/latest/web_server`,children:(e,t)=>{i(e,ye())},$$slots:{default:!0}}),n(v),l(),n(_),n(o),i(t,a)},$$slots:{default:!0}});var I=c(F,2);d(I,{id:`function-semantics`,children:(e,t)=>{l(),i(e,r(`Function semantics`))},$$slots:{default:!0}});var L=c(I,2);p(L,{children:(t,a)=>{var o=Ce(),u=c(s(o),2),d=e(u),f=e(d);h(e(f),{href:`/docs/sdk/py/latest/batched`,children:(e,t)=>{i(e,xe())},$$slots:{default:!0}}),n(f);var p=c(f);h(c(e(p)),{href:`/docs/guide/dynamic-batching`,children:(e,t)=>{l(),i(e,r(`dynamic input batching`))},$$slots:{default:!0}}),n(p),n(d);var m=c(d),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/concurrent`,children:(e,t)=>{i(e,Se())},$$slots:{default:!0}}),n(g);var _=c(g);h(c(e(_)),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{l(),i(e,r(`input concurrency`))},$$slots:{default:!0}}),n(_),n(m),n(u),i(t,o)},$$slots:{default:!0}});var R=c(L,2);d(R,{id:`scheduling`,children:(e,t)=>{l(),i(e,r(`Scheduling`))},$$slots:{default:!0}});var z=c(R,2);p(z,{children:(t,r)=>{var a=Ee(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Cron`,children:(e,t)=>{i(e,we())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/Period`,children:(e,t)=>{i(e,Te())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var B=c(z,2);d(B,{id:`exception-handling`,children:(e,t)=>{l(),i(e,r(`Exception handling`))},$$slots:{default:!0}});var V=c(B,2);p(V,{children:(t,r)=>{var a=S(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Retries`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),n(d),l(),n(u),n(o),i(t,a)},$$slots:{default:!0}});var H=c(V,2);u(H,{id:`sandboxed-execution`,children:(e,t)=>{l(),i(e,r(`Sandboxed execution`))},$$slots:{default:!0}});var U=c(H,2);p(U,{children:(t,r)=>{var a=E(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Sandbox`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/container_process#containerprocess`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),n(p),l(),n(f);var m=c(f),g=e(m);h(e(g),{href:`/docs/sdk/py/latest/file_io#fileio`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),n(g),l(),n(m),n(o),i(t,a)},$$slots:{default:!0}});var W=c(U,2);u(W,{id:`container-configuration`,children:(e,t)=>{l(),i(e,r(`Container configuration`))},$$slots:{default:!0}});var G=c(W,2);p(G,{children:(t,r)=>{var a=Oe(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/Secret`,children:(e,t)=>{i(e,De())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var K=c(G,2);u(K,{id:`data-primitives`,children:(e,t)=>{l(),i(e,r(`Data primitives`))},$$slots:{default:!0}});var q=c(K,2);d(q,{id:`persistent-storage`,children:(e,t)=>{l(),i(e,r(`Persistent storage`))},$$slots:{default:!0}});var J=c(q,2);p(J,{children:(t,r)=>{var a=je(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{i(e,ke())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/CloudBucketMount`,children:(e,t)=>{i(e,Ae())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var Y=c(J,2);d(Y,{id:`in-memory-storage`,children:(e,t)=>{l(),i(e,r(`In-memory storage`))},$$slots:{default:!0}});var X=c(Y,2);p(X,{children:(t,r)=>{var a=Ne(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Dict`,children:(e,t)=>{i(e,Me())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/Queue`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var Z=c(X,2);u(Z,{id:`account-configuration`,children:(e,t)=>{l(),i(e,r(`Account configuration`))},$$slots:{default:!0}});var Q=c(Z,2);p(Q,{children:(t,r)=>{var a=Ie(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Workspace`,children:(e,t)=>{i(e,Pe())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/Environment`,children:(e,t)=>{i(e,Fe())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}});var $=c(Q,2);u($,{id:`networking`,children:(e,t)=>{l(),i(e,r(`Networking`))},$$slots:{default:!0}}),p(c($,2),{children:(t,r)=>{var a=ze(),o=c(s(a),2),u=e(o),d=e(u);h(e(d),{href:`/docs/sdk/py/latest/Proxy`,children:(e,t)=>{i(e,Le())},$$slots:{default:!0}}),n(d),l(),n(u);var f=c(u),p=e(f);h(e(p),{href:`/docs/sdk/py/latest/forward`,children:(e,t)=>{i(e,Re())},$$slots:{default:!0}}),n(p),l(),n(f),n(o),i(t,a)},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{k as default,g as metadata};
//# sourceMappingURL=DI93uGAx2.js.map
