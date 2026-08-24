(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ee969ab4-a380-4022-92a3-349bc8bba8d8`,e._sentryDebugIdIdentifier=`sentry-dbid-ee969ab4-a380-4022-92a3-349bc8bba8d8`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./DYSGKh1I.js";import{a as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";var p={description:`Pin GPU hardware clocks`,toc:[{depth:1,value:`Lock GPU clocks`,id:`lock-gpu-clocks`,children:[{depth:2,value:`Limitations`,id:`limitations`}]}],rawContent:`# Lock GPU clocks

<Callout variant="alpha">

Access to this feature is restricted by workspace.

</Callout>

GPU clock locking pins GPU hardware clock frequencies to a fixed value or range.

\`\`\`python
freq = "1590"  # MHz

# for functions:
@app.function(gpu="t4", experimental_options={"gpu_clock_lock": freq})
def run_locked_clocks():
    import subprocess

    subprocess.run(["nvidia-smi", "--query-gpu=clocks.sm"], check=True)

# or, for sandboxes:
def run_locked_sandbox():
    sb = modal.Sandbox.create(
        "nvidia-smi", "--query-gpu=clocks.sm",
        app=app,
        image=image,
        gpu="t4",
        experimental_options={"gpu_clock_lock": freq},
    )
    sb.wait()
\`\`\`

Locking clocks can reduce performance non-determinism from clock management.
It generally has a negative impact on overall performance.

The value passed in can be a single frequency (\`"<MHz>"\`) or a range (\`"<min MHz>-<max MHz>"\`).

## Limitations

- Memory clock locking is not yet supported.
`,meta:{title:`Lock GPU clocks`,description:`Pin GPU hardware clocks`}},{description:m,toc:h,rawContent:g,meta:_}=p,v=e(`<p>Access to this feature is restricted by workspace.</p>`),y=e(`<!> <!> <p>GPU clock locking pins GPU hardware clock frequencies to a fixed value or range.</p> <!> <p>Locking clocks can reduce performance non-determinism from clock management.
It generally has a negative impact on overall performance.</p> <p>The value passed in can be a single frequency (<code>"&lt;MHz&gt;"</code>) or a range (<code>"&lt;min MHz&gt;-&lt;max MHz&gt;"</code>).</p> <!> <ul><li>Memory clock locking is not yet supported.</li></ul>`,1);function b(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(e,i(()=>h,()=>p,{children:(e,r)=>{var i=y(),f=a(i);u(f,{id:`lock-gpu-clocks`,children:(e,r)=>{s(),n(e,t(`Lock GPU clocks`))},$$slots:{default:!0}});var p=o(f,2);c(p,{variant:`alpha`,children:(e,t)=>{n(e,v())},$$slots:{default:!0}});var m=o(p,4);d(m,{code:`freq%20%3D%20%221590%22%20%20%23%20MHz%0A%0A%23%20for%20functions%3A%0A%40app.function(gpu%3D%22t4%22%2C%20experimental_options%3D%7B%22gpu_clock_lock%22%3A%20freq%7D)%0Adef%20run_locked_clocks()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20subprocess.run(%5B%22nvidia-smi%22%2C%20%22--query-gpu%3Dclocks.sm%22%5D%2C%20check%3DTrue)%0A%0A%23%20or%2C%20for%20sandboxes%3A%0Adef%20run_locked_sandbox()%3A%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%22nvidia-smi%22%2C%20%22--query-gpu%3Dclocks.sm%22%2C%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20gpu%3D%22t4%22%2C%0A%20%20%20%20%20%20%20%20experimental_options%3D%7B%22gpu_clock_lock%22%3A%20freq%7D%2C%0A%20%20%20%20)%0A%20%20%20%20sb.wait()`,lang:`python`}),l(o(m,6),{id:`limitations`,children:(e,r)=>{s(),n(e,t(`Limitations`))},$$slots:{default:!0}}),s(2),n(e,i)},$$slots:{default:!0}}))}export{b as default,p as metadata};
//# sourceMappingURL=Djq8Hlwn.js.map
