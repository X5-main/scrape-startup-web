(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cb78d6f4-9dd2-4c22-a713-5c8ec97b8a37`,e._sentryDebugIdIdentifier=`sentry-dbid-cb78d6f4-9dd2-4c22-a713-5c8ec97b8a37`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Passing local data`,id:`passing-local-data`,children:[{depth:2,value:`Passing function arguments`,id:`passing-function-arguments`},{depth:2,value:`Including local files`,id:`including-local-files`}]}],rawContent:`# Passing local data

If you have a function that needs access to some data not present in your Python
files themselves you have a few options for bundling that data with your Modal
App.

## Passing function arguments

The simplest and most straight-forward way is to read the data from your local
script and pass the data to the outermost Modal Function call:

\`\`\`python
import json


@app.function()
def foo(a):
    print(sum(a["numbers"]))


@app.local_entrypoint()
def main():
    data_structure = json.load(open("blob.json"))
    foo.remote(data_structure)
\`\`\`

Any data of reasonable size that is serializable through
[cloudpickle](https://github.com/cloudpipe/cloudpickle) is passable as an
argument to Modal Functions. Small payloads (≤ 2 MiB) are stored inline in our metadata store;
larger payloads are stored in object storage.

Refer to the section on [global variables](/docs/guide/global-variables) for how
to work with objects in global scope that can only be initialized locally.

## Including local files

For including local files for your Modal Functions to access, see [Defining Images](/docs/guide/images).
`,meta:{title:`Passing local data`,description:`If you have a function that needs access to some data not present in your Python files themselves you have a few options for bundling that data with your Modal App.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>If you have a function that needs access to some data not present in your Python
files themselves you have a few options for bundling that data with your Modal
App.</p> <!> <p>The simplest and most straight-forward way is to read the data from your local
script and pass the data to the outermost Modal Function call:</p> <!> <p>Any data of reasonable size that is serializable through <!> is passable as an
argument to Modal Functions. Small payloads (≤ 2 MiB) are stored inline in our metadata store;
larger payloads are stored in object storage.</p> <p>Refer to the section on <!> for how
to work with objects in global scope that can only be initialized locally.</p> <!> <p>For including local files for your Modal Functions to access, see <!>.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`passing-local-data`,children:(e,t)=>{l(),i(e,r(`Passing local data`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`passing-function-arguments`,children:(e,t)=>{l(),i(e,r(`Passing function arguments`))},$$slots:{default:!0}});var g=c(h,4);f(g,{code:`import%20json%0A%0A%0A%40app.function()%0Adef%20foo(a)%3A%0A%20%20%20%20print(sum(a%5B%22numbers%22%5D))%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20data_structure%20%3D%20json.load(open(%22blob.json%22))%0A%20%20%20%20foo.remote(data_structure)`,lang:`python`});var _=c(g,2);m(c(e(_)),{href:`https://github.com/cloudpipe/cloudpickle`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cloudpickle`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);m(c(e(v)),{href:`/docs/guide/global-variables`,children:(e,t)=>{l(),i(e,r(`global variables`))},$$slots:{default:!0}}),l(),n(v);var b=c(v,2);u(b,{id:`including-local-files`,children:(e,t)=>{l(),i(e,r(`Including local files`))},$$slots:{default:!0}});var x=c(b,2);m(c(e(x)),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`Defining Images`))},$$slots:{default:!0}}),l(),n(x),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DO6xSRJa.js.map
