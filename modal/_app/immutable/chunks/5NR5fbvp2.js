(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`39f2c81b-d67f-4390-90d9-58710bdb3820`,e._sentryDebugIdIdentifier=`sentry-dbid-39f2c81b-d67f-4390-90d9-58710bdb3820`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (get_started.py)`,id:`example-get_startedpy`}],rawContent:`# Example (get_started.py)

This is the source code for **01_getting_started.get_started**.
\`\`\`python
import modal

app = modal.App("example-get-started")


@app.function()
def square(x):
    print("This code is running on a remote worker!")
    return x**2


@app.local_entrypoint()
def main():
    print("the square is", square.remote(42))

\`\`\`
`,meta:{title:`Example (get_started.py)`,description:`This is the source code for 01_getting_started.get_started.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>01_getting_started.get_started</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-get_startedpy`,children:(e,r)=>{s(),n(e,t(`Example (get_started.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-get-started%22)%0A%0A%0A%40app.function()%0Adef%20square(x)%3A%0A%20%20%20%20print(%22This%20code%20is%20running%20on%20a%20remote%20worker!%22)%0A%20%20%20%20return%20x**2%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20print(%22the%20square%20is%22%2C%20square.remote(42))%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=5NR5fbvp2.js.map
