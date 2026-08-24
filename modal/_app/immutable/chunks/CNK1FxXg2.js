(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cdc546ed-cff8-47f0-9759-c00f4a76b388`,e._sentryDebugIdIdentifier=`sentry-dbid-cdc546ed-cff8-47f0-9759-c00f4a76b388`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Run a generator function on Modal`,id:`run-a-generator-function-on-modal`}],rawContent:`# Run a generator function on Modal

This example shows how you can run a generator function on Modal. We define a
function that \`yields\` values and then call it with the [\`remote_gen\`](https://modal.com/docs/reference/modal.Function#remote_gen) method. The
\`remote_gen\` method returns a generator object that can be used to iterate over
the values produced by the function.

\`\`\`python
import modal

app = modal.App("example-generators")


@app.function()
def f(i):
    for j in range(i):
        yield j


@app.local_entrypoint()
def main():
    for r in f.remote_gen(10):
        print(r)

\`\`\`
`,meta:{title:`Run a generator function on Modal`,description:`This example shows how you can run a generator function on Modal. We define a function that yields values and then call it with the remote_gen method. The remote_gen method returns a generator object that can be used to iterate over the values produced by the function.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>remote_gen</code>`),y=t(`<!> <p>This example shows how you can run a generator function on Modal. We define a
function that <code>yields</code> values and then call it with the <!> method. The <code>remote_gen</code> method returns a generator object that can be used to iterate over
the values produced by the function.</p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`run-a-generator-function-on-modal`,children:(e,t)=>{l(),i(e,r(`Run a generator function on Modal`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m),3),{href:`https://modal.com/docs/reference/modal.Function#remote_gen`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(3),n(m),d(c(m,2),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-generators%22)%0A%0A%0A%40app.function()%0Adef%20f(i)%3A%0A%20%20%20%20for%20j%20in%20range(i)%3A%0A%20%20%20%20%20%20%20%20yield%20j%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20for%20r%20in%20f.remote_gen(10)%3A%0A%20%20%20%20%20%20%20%20print(r)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=CNK1FxXg2.js.map
