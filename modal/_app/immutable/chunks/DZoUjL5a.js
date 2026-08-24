(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e7e1adb9-1fb6-4962-92c6-2e4d03b32800`,e._sentryDebugIdIdentifier=`sentry-dbid-e7e1adb9-1fb6-4962-92c6-2e4d03b32800`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`Probe`,id:`probe`,children:[{depth:2,value:`with_tcp`,id:`with_tcp`},{depth:2,value:`with_exec`,id:`with_exec`}]}],rawContent:`# Probe


Probe configuration for the Sandbox Readiness Probe.

**Usage**

\`\`\`python notest
# Wait until a file exists.
readiness_probe = modal.Probe.with_exec(
    "sh", "-c", "test -f /tmp/ready",
)

# Wait until a TCP port is accepting connections.
readiness_probe = modal.Probe.with_tcp(8080)

app = modal.App.lookup('sandbox-readiness-probe', create_if_missing=True)
sandbox = modal.Sandbox.create(
    "python3", "-m", "http.server", "8080",
    readiness_probe=readiness_probe,
    app=app,
)
sandbox.wait_until_ready()
\`\`\`

**Attributes**

<Parameter name="tcp_port" type="int | None" defaultValue="None" description="" />
<Parameter name="exec_argv" type="tuple[str, ...] | None" defaultValue="None" description="" />
<Parameter name="interval_ms" type="int" defaultValue="100" description="" />


## with_tcp

\`\`\`python
with_tcp(cls, port, *, interval_ms=100)
\`\`\`


## with_exec

\`\`\`python
with_exec(cls, *argv, interval_ms=100)
\`\`\`
`,meta:{title:`Probe`,description:`Probe configuration for the Sandbox Readiness Probe.`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <p>Probe configuration for the Sandbox Readiness Probe.</p> <p><strong>Usage</strong></p> <!> <p><strong>Attributes</strong></p> <!> <!> <!> <!> <!> <!> <!>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),d=a(i);l(d,{id:`probe`,children:(e,r)=>{s(),n(e,t(`Probe`))},$$slots:{default:!0}});var p=o(d,6);u(p,{code:`%23%20Wait%20until%20a%20file%20exists.%0Areadiness_probe%20%3D%20modal.Probe.with_exec(%0A%20%20%20%20%22sh%22%2C%20%22-c%22%2C%20%22test%20-f%20%2Ftmp%2Fready%22%2C%0A)%0A%0A%23%20Wait%20until%20a%20TCP%20port%20is%20accepting%20connections.%0Areadiness_probe%20%3D%20modal.Probe.with_tcp(8080)%0A%0Aapp%20%3D%20modal.App.lookup('sandbox-readiness-probe'%2C%20create_if_missing%3DTrue)%0Asandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python3%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%2C%0A%20%20%20%20readiness_probe%3Dreadiness_probe%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0Asandbox.wait_until_ready()`,lang:`python`});var m=o(p,4);f(m,{name:`tcp_port`,type:`int | None`,defaultValue:`None`,description:``});var h=o(m,2);f(h,{name:`exec_argv`,type:`tuple[str, ...] | None`,defaultValue:`None`,description:``});var g=o(h,2);f(g,{name:`interval_ms`,type:`int`,defaultValue:`100`,description:``});var v=o(g,2);c(v,{id:`with_tcp`,children:(e,r)=>{s(),n(e,t(`with_tcp`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`with_tcp(cls%2C%20port%2C%20*%2C%20interval_ms%3D100)`,lang:`python`});var b=o(y,2);c(b,{id:`with_exec`,children:(e,r)=>{s(),n(e,t(`with_exec`))},$$slots:{default:!0}}),u(o(b,2),{code:`with_exec(cls%2C%20*argv%2C%20interval_ms%3D100)`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DZoUjL5a.js.map
