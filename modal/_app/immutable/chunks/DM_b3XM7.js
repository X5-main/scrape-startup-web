(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`36d31ec0-edc5-4d32-9ac5-58d048e67483`,e._sentryDebugIdIdentifier=`sentry-dbid-36d31ec0-edc5-4d32-9ac5-58d048e67483`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./B6UiYoTw.js";var f={toc:[{depth:1,value:`Retries`,id:`retries`}],rawContent:`# Retries


\`\`\`python
class Retries(object)
\`\`\`

Adds a retry policy to a Modal function.

**Usage**

\`\`\`python
import modal
app = modal.App()

# Basic configuration.
# This sets a policy of max 4 retries with 1-second delay between failures.
@app.function(retries=4)
def f():
    pass


# Fixed-interval retries with 3-second delay between failures.
@app.function(
    retries=modal.Retries(
        max_retries=2,
        backoff_coefficient=1.0,
        initial_delay=3.0,
    )
)
def g():
    pass


# Exponential backoff, with retry delay doubling after each failure.
@app.function(
    retries=modal.Retries(
        max_retries=4,
        backoff_coefficient=2.0,
        initial_delay=1.0,
    )
)
def h():
    pass
\`\`\`

\`\`\`python
__init__(self, *, max_retries, backoff_coefficient=2.0, initial_delay=1.0,
    max_delay=60.0)
\`\`\`
Construct a new retries policy, supporting exponential and fixed-interval delays via a backoff coefficient.

**Parameters**

<Parameter name="max_retries" type="int" description="Maximum number of retries after failures." />
<Parameter name="backoff_coefficient" type="float" defaultValue="2.0" description="Multiplier applied to the delay after each attempt; \`\`1.0\`\` means fixed delay." />
<Parameter name="initial_delay" type="float" defaultValue="1.0" description="Seconds before the first retry." />
<Parameter name="max_delay" type="float" defaultValue="60.0" description="Upper cap on the delay between retries (seconds)." />
`,meta:{title:`Retries`,description:`Adds a retry policy to a Modal function.`}},{toc:p,rawContent:m,meta:h}=f,g=e(`<!> <!> <p>Adds a retry policy to a Modal function.</p> <p><strong>Usage</strong></p> <!> <!> <p>Construct a new retries policy, supporting exponential and fixed-interval delays via a backoff coefficient.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!>`,1);function _(e,p){let m=r(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>m,()=>f,{children:(e,r)=>{var i=g(),u=a(i);c(u,{id:`retries`,children:(e,r)=>{s(),n(e,t(`Retries`))},$$slots:{default:!0}});var f=o(u,2);l(f,{code:`class%20Retries(object)`,lang:`python`});var p=o(f,6);l(p,{code:`import%20modal%0Aapp%20%3D%20modal.App()%0A%0A%23%20Basic%20configuration.%0A%23%20This%20sets%20a%20policy%20of%20max%204%20retries%20with%201-second%20delay%20between%20failures.%0A%40app.function(retries%3D4)%0Adef%20f()%3A%0A%20%20%20%20pass%0A%0A%0A%23%20Fixed-interval%20retries%20with%203-second%20delay%20between%20failures.%0A%40app.function(%0A%20%20%20%20retries%3Dmodal.Retries(%0A%20%20%20%20%20%20%20%20max_retries%3D2%2C%0A%20%20%20%20%20%20%20%20backoff_coefficient%3D1.0%2C%0A%20%20%20%20%20%20%20%20initial_delay%3D3.0%2C%0A%20%20%20%20)%0A)%0Adef%20g()%3A%0A%20%20%20%20pass%0A%0A%0A%23%20Exponential%20backoff%2C%20with%20retry%20delay%20doubling%20after%20each%20failure.%0A%40app.function(%0A%20%20%20%20retries%3Dmodal.Retries(%0A%20%20%20%20%20%20%20%20max_retries%3D4%2C%0A%20%20%20%20%20%20%20%20backoff_coefficient%3D2.0%2C%0A%20%20%20%20%20%20%20%20initial_delay%3D1.0%2C%0A%20%20%20%20)%0A)%0Adef%20h()%3A%0A%20%20%20%20pass`,lang:`python`});var m=o(p,2);l(m,{code:`__init__(self%2C%20*%2C%20max_retries%2C%20backoff_coefficient%3D2.0%2C%20initial_delay%3D1.0%2C%0A%20%20%20%20max_delay%3D60.0)`,lang:`python`});var h=o(m,6);d(h,{name:`max_retries`,type:`int`,description:`Maximum number of retries after failures.`});var _=o(h,2);d(_,{name:`backoff_coefficient`,type:`float`,defaultValue:`2.0`,description:"Multiplier applied to the delay after each attempt; ``1.0`` means fixed delay."});var v=o(_,2);d(v,{name:`initial_delay`,type:`float`,defaultValue:`1.0`,description:`Seconds before the first retry.`}),d(o(v,2),{name:`max_delay`,type:`float`,defaultValue:`60.0`,description:`Upper cap on the delay between retries (seconds).`}),n(e,i)},$$slots:{default:!0}}))}export{_ as default,f as metadata};
//# sourceMappingURL=DM_b3XM7.js.map
